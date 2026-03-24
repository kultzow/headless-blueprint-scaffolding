'use client'

import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { FieldGroup } from "@/components/ui/field"
import { DeckMember } from "@/components/card-related/ScryfallDataTypes"
 
import { useActionState, useEffect, useState } from 'react'
import { handleAddSingleCard } from "./handleAddSingleCard"
 

type FormState = {
  error: string | null;
  success: boolean;
  message: string;
  newMember?: DeckMember;
  newTokens?: DeckMember[];
};

const initialState: FormState = {
  error: null,
  success: false,
  message: 'Ensure proper spelling and punctuation.'
};

export function AddSingleCard({ deckID, includeTokens = true, onSuccess }: { deckID: string; includeTokens?: boolean; onSuccess?: (member: DeckMember) => void }) {

  const [state, formAction, pending] = useActionState(handleAddSingleCard, initialState)
  const [cardName, setCardName] = useState('')

useEffect(() => {
  if (state.success && state.newMember) {
    onSuccess?.(state.newMember);
    state.newTokens?.forEach(t => onSuccess?.(t));
  }
}, [state, onSuccess]);

  return (
    <form action={formAction}>
    <input type="hidden" name="deckID" value={deckID} />
    <input type="hidden" name="cardType" value="card" />
    <input type="hidden" name="include-tokens" value={includeTokens ? 'true' : ''} />
    <FieldGroup className="gap-2">
    <Field>
      <FieldLabel hidden htmlFor="addSingleCard">Add Card By Name</FieldLabel>
      <div className="flex gap-4">
      <Input type="number" id="initialCount" name="initialCount" defaultValue={1} min="1" className="flex-1" />
      <Input id="addSingleCard" name="addSingleCard" placeholder="Name..." className="flex-10" value={cardName} onChange={e => setCardName(e.target.value)} />
      </div>
      <FieldDescription>
      {state?.message && <span aria-live="polite">{state.message}</span>}
      </FieldDescription>
    </Field>
    <Button disabled={pending || !cardName.trim()}>Add Card</Button>
    </FieldGroup>
    </form>
  )
}