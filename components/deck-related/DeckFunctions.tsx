'use server'
import { DeckMember } from '@/components/card-related/ScryfallDataTypes';


const WP_API_URL = `${process.env.NEXT_PUBLIC_WORDPRESS_URL}/graphql`;

async function wpgraphql(query: string, variables: Record<string, unknown>, authToken?: string) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
  const res = await fetch(WP_API_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query, variables }),
  });
  return res.json();
}

// NOTE: Adjust the ACF field name/group to match your WPGraphQL schema.
const GET_CARD_LIST = `
  query GetCardList($id: ID!) {
    product(id: $id, idType: DATABASE_ID) {
      ... on SimpleProduct {
        deckInfo {
          cards
        }
      }
    }
  }
`;

const UPDATE_CARD_LIST = `
  mutation UpdateCardList($deckID: Int!, $cards: String!) {
    updateCardList(input: { deckID: $deckID, cards: $cards }) {
      success
    }
  }
`;

export async function GetDeck(deck_id = '', authToken?: string): Promise<DeckMember[]> {
  const json = await wpgraphql(GET_CARD_LIST, { id: deck_id }, authToken);
  const raw: string | null = json.data?.product?.deckInfo?.cards ?? null;
  if (!raw) return [];
  return JSON.parse(raw) as DeckMember[];
}

export async function updateCardList(deck_id: string, member: DeckMember, authToken?: string) {
  const list = await GetDeck(deck_id, authToken);
  const updated = list.map(m => m.awsID === member.awsID ? member : m);
  await wpgraphql(UPDATE_CARD_LIST, { deckID: parseInt(deck_id), cards: JSON.stringify(updated) }, authToken);
}

export async function emptyDeck({ deckID, authToken }: { deckID: string; authToken?: string }) {
  await wpgraphql(UPDATE_CARD_LIST, { deckID: parseInt(deckID), cards: '' }, authToken);
}

export async function removeCardFromDeck(deck_id: string, member: DeckMember, authToken?: string) {
  const list = await GetDeck(deck_id, authToken);
  const updated = list.filter(m => m.awsID !== member.awsID);
  await wpgraphql(UPDATE_CARD_LIST, { deckID: parseInt(deck_id), cards: JSON.stringify(updated) }, authToken);
}
