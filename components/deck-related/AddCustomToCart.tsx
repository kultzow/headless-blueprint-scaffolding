'use client'
import { useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { getApolloAuthClient } from '@faustwp/core';
import { Button } from "@/components/ui/button"
import { AlertDialog, AlertDialogDescription, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const SESSION_KEY = 'woo-session';

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

export function AddCustomToCart({ deckID, onSuccess }: { deckID: string; onSuccess?: () => void }) {
  const client = getApolloAuthClient();
  const sessionToken = typeof window !== 'undefined' ? localStorage.getItem(SESSION_KEY) : null;

  const [addToCart, { loading, data, error }] = useMutation<AddToCartData>(ADD_TO_CART, {
    client,
    context: sessionToken
      ? { headers: { 'woocommerce-session': `Session ${sessionToken}` } }
      : {},
    onCompleted() {
      onSuccess?.();
    },
  });

  const added = !!data?.addToCart?.cartItem?.key;

  function handleAddToCart() {
    addToCart({ variables: { productId: parseInt(deckID) } });
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button disabled={added}>{added ? 'Added to Cart' : 'Add to Cart'}</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Finalize Your Deck?</AlertDialogTitle>
          <AlertDialogDescription>
            This will lock your deck from further edits and add it to your cart.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error && <p className="text-sm text-red-500 px-6">{error.message}</p>}
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleAddToCart} disabled={loading || added}>
            {loading ? 'Adding...' : added ? 'Added!' : 'Add To Cart'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
