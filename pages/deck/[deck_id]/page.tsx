import { DeckWrapper } from '@/components/deck-related/DeckWrapper';

export default async function DeckPage({
  params,
}: {
  params: Promise<{ deck_id: string }>
}) {
  const { deck_id } = await params;
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Deck #{deck_id} </h1>
      <DeckWrapper deckID={deck_id} />
    </div>
  )
}
