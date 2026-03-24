'use client'
import { useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { Button } from "@/components/ui/button"
import { AlertDialog, AlertDialogDescription, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const ADD_TO_CART = gql`
  mutation AddToCart($productId: Int!) {
    addToCart(input: { productId: $productId, quantity: 1 }) {
      cartItem {
        key
      }
    }
  }
`;

interface AddToCartData {
  addToCart: {
    cartItem: { key: string };
  };
}

export function AddCustomToCart({ deckID }: { deckID: string }) {
  const [addToCart, { loading }] = useMutation<AddToCartData>(ADD_TO_CART);

  function handleAddToCart() {
    addToCart({ variables: { productId: parseInt(deckID) } });
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button>Add to Cart</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Finalize Your Deck?</AlertDialogTitle>
          <AlertDialogDescription>
            This will lock your deck from further edits and add it to your cart.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleAddToCart} disabled={loading}>
            {loading ? 'Adding...' : 'Add To Cart'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
