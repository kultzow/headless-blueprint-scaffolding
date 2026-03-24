'use client'
import { useState } from 'react'
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export function ToggleTokens() {
  const [tokensOnly, setTokensOnly] = useState(false)

  return (
    <>
      {tokensOnly && (
        <style>{`.card-and-tools-wrapper:not(.layout-token) { display: none !important; }`}</style>
      )}
      <div className="flex items-center space-x-2">
        <Switch id="tokens-only" checked={tokensOnly} onCheckedChange={setTokensOnly} />
        <Label htmlFor="tokens-only">Hide Non-Tokens</Label>
      </div>
    </>
  )
}
