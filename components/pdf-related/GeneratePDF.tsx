'use client'

import { Field, FieldDescription } from "../ui/field"
import { Button } from "../ui/button"
import { FieldGroup } from "../ui/field"
import { useState } from 'react'
import type { PrepareResult, BlockResult, FinalResult } from "../pdf-related/handleGeneratePDF"

async function pdfApi(body: object) {
  const res = await fetch('/api/pdf/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.json();
}

export function GeneratePDF({ deckID }: { deckID: string; }) {
  const [message, setMessage] = useState('');
  const [pending, setPending] = useState(false);

  const handleGenerate = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setPending(true);
    setMessage('Preparing deck...');

    const prep: PrepareResult = await pdfApi({ action: 'prepare', deckID });
    if (prep.error) {
      setMessage(prep.error);
      setPending(false);
      return;
    }

    for (let i = 0; i < prep.chunks.length; i++) {
      setMessage(`Processing Sheet ${i + 1}/${prep.totalSheets}...`);
      const result: BlockResult = await pdfApi({ action: 'processBlock', deckID, blockIndex: i, imagePaths: prep.chunks[i] });
      if (result.error) {
        setMessage(`Error on sheet ${i + 1}: ${result.error}`);
        setPending(false);
        return;
      }
    }

    setMessage('Finalizing PDF...');
    const final: FinalResult = await pdfApi({ action: 'finalize', deckID, totalBlocks: prep.chunks.length });
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
