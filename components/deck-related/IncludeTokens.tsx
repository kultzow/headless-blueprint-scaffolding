import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Button } from "@/components/ui/button";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function IncludeTokens({ includeTokens, onIncludeTokensChange }: { includeTokens: boolean; onIncludeTokensChange: (v: boolean) => void }) {
  return (
    <FieldGroup>
      <Field orientation="horizontal" >
        <Checkbox
          checked={includeTokens}
          onCheckedChange={v => onIncludeTokensChange(v === true)}
          id="include-tokens"
          name="include-tokens"
        />
        <FieldLabel htmlFor="include-tokens">
          Auto Include Unique Tokens 
          <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline">?</Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>For multiple copies of a token,<br/>increase the count in the field<br/> shown under that token.</p>
      </TooltipContent>
    </Tooltip>
        </FieldLabel>
          </Field>    
    </FieldGroup>
  )
}
