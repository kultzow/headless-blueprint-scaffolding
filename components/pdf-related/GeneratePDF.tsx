'use client'

import { Field, FieldDescription } from "../ui/field"
import { Button } from "../ui/button"
import { FieldGroup } from "../ui/field"
import { useState } from 'react'
import { prepareDeck, processBlock, finalizeDeck } from "../pdf-related/handleGeneratePDF"

export function GeneratePDF({ deckID }: { deckID: string; }) {
  const [message, setMessage] = useState('');
  const [pending, setPending] = useState(false);

  const handleGenerate = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setPending(true);
    setMessage('Preparing deck...');

    const prep = await prepareDeck(deckID);
    if (prep.error) {
      setMessage(prep.error);
      setPending(false);
      return;
    }

    for (let i = 0; i < prep.chunks.length; i++) {
      setMessage(`Processing Sheet ${i + 1}/${prep.totalSheets}...`);
      const result = await processBlock(deckID, i, prep.chunks[i]);
      if (result.error) {
        setMessage(`Error on sheet ${i + 1}: ${result.error}`);
        setPending(false);
        return;
      }
    }

    setMessage('Finalizing PDF...');
    const final = await finalizeDeck(deckID, prep.chunks.length);
    setMessage(final.message);
    setPending(false);
  };

  return (
    <form onSubmit={handleGenerate}>
    <FieldGroup className="gap-2">
    <Field>
    <Button disabled={pending}>Generate PDF</Button>
      <FieldDescription>
      {message && <span aria-live="polite">{message}</span>}
      </FieldDescription>
    </Field>
    </FieldGroup>
    </form>
  )
}
