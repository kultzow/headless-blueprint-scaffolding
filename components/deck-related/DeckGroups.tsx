'use client'
import { useQuery, useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { GET_USER } from '@/hooks/useAuth';
import { Button } from "@/components/ui/button";

const GET_USER_DECKS = gql`
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

const CREATE_DECK = gql`
  mutation CreateDeck($userId: Int!) {
    createDeck(input: { userId: $userId }) {
      deckId
      deckTitle
    }
  }
`;

const UPDATE_USER_DECKS = gql`
  mutation UpdateUserDecks($userId: Int!, $deckIds: [Int]) {
    updateUserDecks(input: { userId: $userId, deckIds: $deckIds }) {
      success
    }
  }
`;

interface DeckNode {
  databaseId: number;
  name: string;
  acfDeckInfo?: { acfFinalized: boolean };
}

interface CreateDeckData {
  createDeck: { deckId: number; deckTitle: string };
}

function DisplayList({ nodes }: { nodes: DeckNode[] }) {
  return (
    <ul>
      {nodes.map(item => (
        <li key={item.databaseId}><a href={`/decks/${item.databaseId}`}>{item.name}</a></li>
      ))}
    </ul>
  );
}

export function DeckGroups({ userID, deckIDs }: { userID: number; deckIDs: number[] }) {
  const { data, loading } = useQuery<{ products: { nodes: DeckNode[] } }>(GET_USER_DECKS, {
    variables: { ids: deckIDs },
    skip: deckIDs.length === 0,
  });

  const [createDeck, { loading: creating }] = useMutation<CreateDeckData>(CREATE_DECK);
  const [updateUserDecks] = useMutation(UPDATE_USER_DECKS, {
    refetchQueries: [{ query: GET_USER }],
  });

  function handleCreateDeck() {
    createDeck({ variables: { userId: userID } }).then(result => {
      const deck = result.data?.createDeck;
      if (deck) {
        const updatedDeckIDs = [...deckIDs, deck.deckId];
        updateUserDecks({ variables: { userId: userID, deckIds: updatedDeckIDs } });
      }
    });
  }

  const nodes = data?.products?.nodes ?? [];
  const openList = nodes.filter(n => !n.acfDeckInfo?.acfFinalized);
  const closedList = nodes.filter(n => n.acfDeckInfo?.acfFinalized);

  if (loading) return <p>Loading decks...</p>;

  return (
    <div>
      {(openList.length > 0 || closedList.length > 0) && (
        <div className="deck-lists grid grid-cols-1 md:grid-cols-2">
          <div className="deck-list open">
            <h2>Editable Decks</h2>
            <DisplayList nodes={openList} />
          </div>
          <div className="deck-list closed">
            <h2>Locked Decks</h2>
            <DisplayList nodes={closedList} />
          </div>
        </div>
      )}
      <Button onClick={handleCreateDeck} disabled={creating}>
        {creating ? 'Creating...' : 'Add New Deck'}
      </Button>
    </div>
  );
}
