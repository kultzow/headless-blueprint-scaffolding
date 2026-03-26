'use server'
import { DeckMember, ScryfallCardData } from '@/components/card-related/ScryfallDataTypes';
import { getScryfallCardData } from '@/lib/scryfall';
import { awsID } from '@/components/card-related/CardParts';
import { GetDeck } from '@/components/deck-related/DeckFunctions';

type FormState = {
  error: string | null;
  success: boolean;
  message: string;
  newMember?: DeckMember;
  newTokens?: DeckMember[];
  isNew?: boolean;
};

const WP_API_URL = `${process.env.NEXT_PUBLIC_WORDPRESS_URL}/graphql`;

const UPDATE_CARD_LIST = `
  mutation UpdateCardList($deckID: Int!, $cards: String!) {
    updateCardList(input: { deckID: $deckID, cards: $cards }) {
      success
    }
  }
`;

async function addTokens({ deckID, cardData }: { deckID: string; cardData: ScryfallCardData }): Promise<DeckMember[]> {
  const tokens = cardData.all_parts?.filter(p => p.component === 'token') ?? [];
  const members: DeckMember[] = [];
  for (const part of tokens) {
    const formData = new FormData();
    formData.set('deckID', deckID);
    formData.set('cardType', 'token');
    formData.set('addSingleCard', part.id);
    formData.set('initialCount', '1');
    const result = await handleAddSingleCard({ error: null, success: false, message: '' }, formData);
    if (result.newMember) members.push(result.newMember);
  }
  return members;
}

export async function handleAddSingleCard(_prevState: FormState, formData: FormData): Promise<FormState> {
  const deckID = formData.get('deckID');
  const cardType = formData.get('cardType');
  const identifier = formData.get('addSingleCard');
  const initialCount = Number(formData.get('initialCount'));

  if (!identifier || typeof identifier !== 'string') {
    return { message: 'Card name is required.', error: 'missing', success: false };
  }

  const cardData: ScryfallCardData = await getScryfallCardData(identifier);

  if (!cardData.id) {
    return { message: 'Card not found - check spelling and punctuation.', error: 'card', success: false };
  }

  const dbName = cardData.printed_name || cardData.flavor_name || cardData.name;
  const myAWS = awsID(cardData);

  const list = await GetDeck(deckID as string);

  if (list.length === 180) {
    return { message: 'You are already at the 180 card limit.', error: 'limit', success: false };
  }

  const existing = list.find(m => m.awsID === myAWS);

  // tokens should be unique per deck on import; they can be incremented manually
  if (existing) {
    if (existing.layout !== 'token') {
      existing.count += initialCount;
    }
  } else {
    list.push({ name: dbName, count: initialCount, awsID: myAWS, layout: cardData.layout });
  }

  const member: DeckMember = existing
    ? { ...existing }
    : { name: dbName, count: initialCount, awsID: myAWS, layout: cardData.layout };

  await fetch(WP_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: UPDATE_CARD_LIST, variables: { deckID: parseInt(deckID as string), cards: JSON.stringify(list) } }),
  });

  const includeTokens = formData.get('include-tokens') === 'true';
  const newTokens = cardType === 'card' && includeTokens ? await addTokens({ deckID: deckID as string, cardData }) : undefined;

  return { message: `Attempting to add "${identifier}"...`, error: null, success: true, newMember: member, newTokens, isNew: !existing };
}
