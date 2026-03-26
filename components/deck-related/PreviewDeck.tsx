'use client'
import { useState, useEffect, useRef, useMemo } from "react";
import { useAuth } from '@/hooks/useAuth';
async function getPrintableCard(awsID: string, face: string): Promise<string> {
  const res = await fetch(`/api/card/printable?awsID=${encodeURIComponent(awsID)}&face=${encodeURIComponent(face)}`);
  const data = await res.json();
  return data.url;
}
import { PreviewCard } from "@/components/card-related/PreviewCard";
import { CardSkeleton } from "@/components/card-related/CardSkeleton";
import { DeckMember } from '@/components/card-related/ScryfallDataTypes';
import { GetDeck } from '@/components/deck-related/DeckFunctions';
import { CardTools } from "@/components/deck-related/CardTools";

export function PreviewDeck({ deckID, appendQueue, onCardLoaded, onDeckSizeChange, resetSignal }: { deckID: string; appendQueue?: DeckMember[]; onCardLoaded?: (awsID: string) => void; onDeckSizeChange?: (size: number) => void; resetSignal?: number }) {

  const [deck, setDeck] = useState<{ list: DeckMember[], fronts: (string | null)[] }>({ list: [], fronts: [] });
  const [versions, setVersions] = useState<Record<string, number>>({});
  const { list: cardList, fronts: fronts } = deck;
  const backs = fronts.map(f => f ? f.replace('front', 'back') : null);
  const [revealedCount, setRevealedCount] = useState(0);
  const completedRef = useRef(-1);
  const [processedCount, setProcessedCount] = useState(0);
  const [adminOpenID, setAdminOpenID] = useState<string | null>(null);

  const { viewer } = useAuth({ strategy: 'local', loginPageUrl: '/login', skip: true });
  const isAdmin = viewer?.capabilities?.includes('administrator') ?? false;

  const modalArray = useMemo(() => ['modal_dfc','transform','meld'], []);


  // Process any new items added to appendQueue since last render
  const queue = appendQueue ?? [];
  if (queue.length > processedCount) {
    const newItems = queue.slice(processedCount);
    setProcessedCount(queue.length);
    setDeck(prev => {
      const list = [...prev.list];
      const fronts = [...prev.fronts];
      for (const member of newItems) {
        const idx = list.findIndex(m => m.awsID === member.awsID);
        if (idx !== -1) {
          list[idx] = member;
        } else {
          list.push(member);
          fronts.push(null);
        }
      }
      return { list, fronts };
    });
  }

  useEffect(() => {
    completedRef.current = -1;
    GetDeck(deckID).then(d => {
      setProcessedCount(0);
      setRevealedCount(0);
      setDeck({ list: d, fronts: Array(d.length).fill(null) });
    });
  }, [deckID, resetSignal]);

  useEffect(() => {
    onDeckSizeChange?.(cardList.reduce((sum, m) => sum + m.count, 0));
  }, [cardList, onDeckSizeChange]);

  // Fetch the next card's src whenever revealedCount advances
  useEffect(() => {
    if (revealedCount >= cardList.length) return;

    // if there's  a back, make sure the art exists
    if (modalArray.includes(cardList[revealedCount].layout)) {
       getPrintableCard(cardList[revealedCount].awsID, "back")
    }
    getPrintableCard(cardList[revealedCount].awsID, "front").then((front) => {
      setDeck(prev => {
        const fronts = [...prev.fronts];
        fronts[revealedCount] = front;
        return { ...prev, fronts: fronts };
      });
    });
  }, [revealedCount, cardList, modalArray]);



  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {fronts.slice(0, revealedCount + 1).map((front, i) => {
          const isModal = modalArray.includes(cardList[i]?.layout);
          return front && cardList[i] && (
          <div className={`justify-items-center layout-${cardList[i]?.layout} card-and-tools-wrapper${isModal ? ' md:col-span-2' : ''}`} key={cardList[i].awsID}>
            <div className="card-faces">
            <div
              className="card-face front"
              style={{ cursor: isAdmin ? 'pointer' : 'default' }}
              onClick={() => isAdmin && setAdminOpenID(cardList[i].awsID)}
              onContextMenu={isAdmin ? undefined : (e) => e.preventDefault()}
            >
          <PreviewCard
            src={front}
            refreshSignal={versions[cardList[i].awsID] ?? 0}
            onLoad={() => {
            if (i === revealedCount && i > completedRef.current) {
              completedRef.current = i;
                setRevealedCount(prev => prev + 1);
                onCardLoaded?.(cardList[i].awsID);
              }
            }}
          />
          </div>
          {isModal && (<div
              className="card-face back"
              style={{ cursor: isAdmin ? 'pointer' : 'default' }}
              onContextMenu={isAdmin ? undefined : (e) => e.preventDefault()}
            >
          <PreviewCard
            src={backs[i]!}
            refreshSignal={versions[cardList[i].awsID] ?? 0}
            onLoad={() => { /*nothing */ }}
          />
          </div>)}
          </div>
          <CardTools isModal={isModal} deckID={deckID} deckMember={cardList[i]} cardType='card'
          adminOpen={adminOpenID === cardList[i].awsID}
          onAdminOpenChange={(open) => { if (!open) setAdminOpenID(null); }}
          onRefresh={() => {
            const awsID = cardList[i].awsID;
            setVersions(v => ({ ...v, [awsID]: (v[awsID] ?? 0) + 1 }));
          }} onCountChange={(newCount) => {
            const awsID = cardList[i].awsID;
            setDeck(prev => {
              const list = [...prev.list];
              const idx = list.findIndex(m => m.awsID === awsID);
              if (idx !== -1) list[idx] = { ...list[idx], count: newCount };
              return { ...prev, list };
            });
          }} onRemove={() => {
            const removedAwsID = cardList[i].awsID;
            setDeck(prev => ({
              list: prev.list.filter(m => m.awsID !== removedAwsID),
              fronts: prev.fronts.filter((_, idx) => idx !== i),
            }));
            if (i <= revealedCount) {
              setRevealedCount(prev => Math.max(0, prev - 1));
              completedRef.current = Math.max(-1, completedRef.current - 1);
            }
          }} />
          </div>
        )}
      )}
      { revealedCount < (fronts.length-1) && (
        <CardSkeleton />
      )}
    </div>
  );
}