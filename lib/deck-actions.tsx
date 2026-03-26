'use server'

export interface DeckMeta {
  id: number;
  post_status: string;
  post_title: string;
}

const GET_USER_DECKS = `
  query GetUserDecks($ids: [Int]) {
    products(where: { include: $ids }) {
      nodes {
        databaseId
        name
        ... on SimpleProduct {
          acfDeckInfo {
            acfFinalized
          }
        }
      }
    }
  }
`;

export async function getDecksForUser(deckIDs: number[], authToken?: string): Promise<{ openList: DeckMeta[]; closedList: DeckMeta[] }> {
  if (deckIDs.length === 0) return { openList: [], closedList: [] };

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

  const response = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_URL}/graphql`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query: GET_USER_DECKS, variables: { ids: deckIDs } }),
  });

  const json = await response.json();
  const nodes: { databaseId: number; name: string; acfDeckInfo?: { acfFinalized: boolean } }[] =
    json.data?.products?.nodes ?? [];

  const openList: DeckMeta[] = [];
  const closedList: DeckMeta[] = [];

  for (const node of nodes) {
    const deck: DeckMeta = { id: node.databaseId, post_title: node.name, post_status: 'publish' };
    if (!node.acfDeckInfo?.acfFinalized) {
      openList.push(deck);
    } else {
      closedList.push(deck);
    }
  }

  return { openList, closedList };
}
