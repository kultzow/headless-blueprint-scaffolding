'use client'
import { useState, useCallback, useRef } from 'react';
import { useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { AddSingleCard } from '@/components/deck-related/AddSingleCard';
import { PreviewDeck } from '@/components/deck-related/PreviewDeck';
import { DeckMember } from '@/components/card-related/ScryfallDataTypes';
import { ImportCSV } from '@/components/deck-related/ImportCSV';
import { RemoveAllCards } from '@/components/deck-related/RemoveAllCards';
import { IncludeTokens } from '@/components/deck-related/IncludeTokens';
import { AddCustomToCart } from '@/components/deck-related/AddCustomToCart';
import { GeneratePDF } from '@/components/pdf-related/GeneratePDF';
import { ToggleTokens } from './ToggleTokens';
import { MyCheckoutButton } from '../wp-related/CheckoutButton';

const UPDATE_PRODUCT_PRICE = gql`
  mutation UpdateProductPrice($productId: Int!, $price: Float!) {
    updateProductPrice(input: { productId: $productId, price: $price }) {
      success
    }
  }
`;


export function DeckWrapper({ deckID }: { deckID: string }) {
  const [appendQueue, setAppendQueue] = useState<DeckMember[]>([]);
  const [resetSignal, setResetSignal] = useState(0);
  const [includeTokens, setIncludeTokens] = useState(true);
  const [deckSize, setDeckSize] = useState(0);
  const [sheetCount, setSheetCount] = useState(0);
  const [deckCost, setDeckCost] = useState(0);
  const pendingRef = useRef<Record<string, () => void>>({});
  const [updateProductPrice] = useMutation(UPDATE_PRODUCT_PRICE);

  const isAdmin = true;

  const handleSingleSuccess = useCallback((member: DeckMember) => {
    setAppendQueue(prev => [...prev, member]);
  }, []);

  const handleImportSuccess = useCallback((member: DeckMember): Promise<void> => {
    return new Promise(resolve => {
      pendingRef.current[member.awsID] = resolve;
      setAppendQueue(prev => [...prev, member]);
    });
  }, []);

  const handleCardLoaded = useCallback((awsID: string) => {
    pendingRef.current[awsID]?.();
    delete pendingRef.current[awsID];
  }, []);

  const handlePricing = useCallback((cardCount: number) => {
    const discountArray = [0, 12, 26, 40, 50, 68, 82, 96, 110, 124];
    // actualCost = [18,24,28,32,36,40,44,48,52]
    const sheets = Math.ceil(cardCount / 18);
    const discount = discountArray[sheets - 1] ?? discountArray[discountArray.length - 1];
    const printCount = sheets * 18;
    setDeckSize(cardCount);
    setSheetCount(printCount);
    const myCost = cardCount ? printCount - discount : 0;
    setDeckCost(myCost);
    updateProductPrice({ variables: { productId: parseInt(deckID), price: myCost } });
  }, [deckID, updateProductPrice]);

  return (
    <>
      <div className="deck-tools grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 ">
        <div>
        <AddSingleCard deckID={deckID} includeTokens={includeTokens} onSuccess={handleSingleSuccess} />
        </div>
        <div>
        <ImportCSV deckID={deckID} includeTokens={includeTokens} onSuccess={handleImportSuccess} />
        </div>
        <div className=" grid grid-cols-1 gap-2 ">
        <IncludeTokens includeTokens={includeTokens} onIncludeTokensChange={setIncludeTokens} />
        <ToggleTokens />
        <RemoveAllCards deckID={deckID} onEmpty={() => { setAppendQueue([]); setResetSignal(s => s + 1); }} />
        </div>
        <div className="order-first xl:order-last">
          <p>Deck Count: {deckSize}/{sheetCount} (180 max)</p>
          <p>Deck Cost: ${deckCost}</p>
          <MyCheckoutButton />
          <AddCustomToCart  deckID={deckID} />
        </div>
      </div>
      { isAdmin &&
      <div className="admin-tools">
          <GeneratePDF  deckID={deckID} />
      </div>
}
      <PreviewDeck appendQueue={appendQueue} deckID={deckID} onCardLoaded={handleCardLoaded} onDeckSizeChange={handlePricing} resetSignal={resetSignal} />
    </>
  );
}
