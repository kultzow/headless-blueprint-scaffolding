'use client'

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button"
import { emptyDeck} from "@/components/deck-related/DeckFunctions";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

  


export function RemoveAllCards( {deckID, onEmpty}: {deckID:string; onEmpty?: () => void}) {

  const router = useRouter();

  const handleEmptyCards = async () => {
    await emptyDeck({deckID});
    router.refresh();
    onEmpty?.();
  };


  return (
    <div className="grid grid-cols-1 mb-10">
      <AlertDialog>
<AlertDialogTrigger asChild >
    <Button variant="destructive">Remove All Cards</Button>
</AlertDialogTrigger>
 <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Remove All Cards</AlertDialogTitle>
                </AlertDialogHeader>
                <p>Your deck will be emptied.</p>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction type="button" onClick={handleEmptyCards}>Confirm</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
      </AlertDialog>

    </div>
  )
}