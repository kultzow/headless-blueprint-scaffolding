'use client'
import Link from "next/link";
import { DeckMember, ScryfallCardData } from "@/components/card-related/ScryfallDataTypes";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react";
import { updateCardList, removeCardFromDeck } from "@/components/deck-related/DeckFunctions";
import { AlertDialog, AlertDialogTrigger,   AlertDialogCancel,   AlertDialogContent, 
  AlertDialogDescription,   AlertDialogHeader,   AlertDialogFooter,   AlertDialogTitle, AlertDialogAction} from "@/components/ui/alert-dialog";
import { ImageTools } from "@/components/deck-related/ImageTools";
import { getScryfallCardData } from "@/lib/api/scryfall";



interface CardToolsProps {
    deckMember: DeckMember,
    deckID: string,
    cardType:string,
    isModal:boolean,
    onRemove?: () => void;
    onRefresh?: () => void;
    onCountChange?: (count: number) => void;
    adminOpen?: boolean;
    onAdminOpenChange?: (open: boolean) => void;
}


export function CardTools({deckID, deckMember, isModal=false, onRemove, onRefresh, onCountChange, adminOpen, onAdminOpenChange}:CardToolsProps) {
  const [value, setValue] = useState(deckMember.count)
  const [prevCount, setPrevCount] = useState(deckMember.count);
  const [cardData, setCardData] = useState<ScryfallCardData | undefined>();

  if (deckMember.count !== prevCount) {
    setPrevCount(deckMember.count);
    setValue(deckMember.count);
  }

  useEffect(() => {
    getScryfallCardData(deckMember.awsID).then(d => {
      setCardData(d);
    });
  }, [deckMember.awsID]);

  const handleChangeCardCount = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(e.target.value) ? Number(e.target.value) : 1;
    setValue(newValue);
    const updated = { ...deckMember, count: newValue };
    updateCardList(deckID, updated);
    onCountChange?.(newValue);
  };

  return (
  <div className={`card-tools flex items-center justify-between gap-2`}>
      <Input type="number" name="cardCount" aria-label="copies" value={value} onChange={handleChangeCardCount} className="w-15 text-center" />
      
      <AlertDialog open={adminOpen} onOpenChange={onAdminOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle><Link target="_blank" href={`../cards/${deckMember.awsID}`}>{deckMember.name}</Link></AlertDialogTitle>
          </AlertDialogHeader>
          {cardData && <ImageTools cardData={cardData} face='front' onRefresh={onRefresh} onClose={() => onAdminOpenChange?.(false)} />}
          {isModal && <hr/>}
          {cardData && isModal && <ImageTools cardData={cardData} face='back' onRefresh={onRefresh} onClose={() => onAdminOpenChange?.(false)} />}
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive">Remove</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {deckMember.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove {deckMember.name} from your deck.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              removeCardFromDeck(deckID, deckMember);
              onRemove?.();
            }}>
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
  </div>
      );

}