'use client'

import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { FieldGroup } from "@/components/ui/field"
import { useRef, useState } from 'react'
import { handleAddSingleCard } from "@/components/deck-related/handleAddSingleCard"
import { DeckMember } from "@/components/card-related/ScryfallDataTypes"

const blankState = { error: null, success: false, message: '' };

function parseCSVRow(row: string): string[] {
  const fields: string[] = [];
  let i = 0;
  while (i < row.length) {
    if (row[i] === '"' || row[i] === "'") {
      const quote = row[i++];
      let field = '';
      while (i < row.length && row[i] !== quote) field += row[i++];
      i++; // closing quote
      fields.push(field);
      if (row[i] === ',') i++;
    } else {
      const end = row.indexOf(',', i);
      if (end === -1) { fields.push(row.slice(i)); break; }
      fields.push(row.slice(i, end));
      i = end + 1;
    }
  }
  return fields;
}


export function ImportCSV({ deckID, includeTokens = true, onSuccess }: { deckID: string; includeTokens?: boolean; onSuccess?: (member: DeckMember) => Promise<void> | void }) {
  const [message, setMessage] = useState('CSV with two columns: number, name.');
  const [pending, setPending] = useState(false);
  const [hasFile, setHasFile] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) return;

    const text = await file.text();
    const rows = text.trim().split(/\r?\n/).map(parseCSVRow);

    // checking if each row has 2 columns and that the first column is an integer
    const valid = rows.every(r => r.length >= 2 && Number.isInteger(Number(r[0].trim())) && r[0].trim() !== '' && r[1].trim() !== '');
    if (!valid) {
      setMessage('CSV is improperly formed. Expected: card count, card name.');
      return;
    }

    setPending(true);

    for (let i = 0; i < rows.length; i++) {
      const count = rows[i][0].trim();
      const name = rows[i][1].trim();

      setMessage(`Importing ${i + 1}/${rows.length}: ${name}`);

      const formData = new FormData();
      formData.set('deckID', deckID);
      formData.set('cardType', 'card');
      formData.set('addSingleCard', name);
      formData.set('initialCount', count);
      formData.set('include-tokens', includeTokens ? 'true' : '');

      const result = await handleAddSingleCard(blankState, formData);

      if (result.error) {
        setMessage(`Import aborted: "${name}" not found.`);
        setPending(false);
        return;
      }

      if (result.newMember) {
        if (result.isNew) {
          await onSuccess?.(result.newMember);
        } else {
          onSuccess?.(result.newMember);
        }
      }
      result.newTokens?.forEach(t => onSuccess?.(t));
    }

    setMessage(`Import complete: ${rows.length} card${rows.length !== 1 ? 's' : ''} imported.`);
    setPending(false);
  };

  return (
    <form onSubmit={handleSubmit} >
    <input type="hidden" name="deckID" value={deckID} />
    <input type="hidden" name="cardType" value="card" />
    <FieldGroup className="gap-2">
    <Field>
      <FieldLabel htmlFor="importCSV" hidden>Import CSV</FieldLabel>
      <Input type="file" id="importCSV" name="importCSV" accept=".csv,.txt" ref={fileRef} onChange={e => setHasFile(!!e.target.files?.[0])} />
      <FieldDescription>
        <span aria-live="polite">{message}</span>
      </FieldDescription>
    </Field>
    <Button type="submit" disabled={pending || !hasFile}>Import CSV</Button>
    </FieldGroup>
    </form>
  );
}
