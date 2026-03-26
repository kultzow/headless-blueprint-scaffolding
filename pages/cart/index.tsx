'use client'
import { useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { getApolloAuthClient } from '@faustwp/core';
import { Button } from '@/components/ui/button';
import { useCart } from '@/lib/useCart';
import { MyCheckoutButton } from '@/components/CheckoutButton';

const REMOVE_ITEM = gql`
  mutation RemoveCartItem($key: ID!) {
    removeItemsFromCart(input: { keys: [$key] }) {
      cart {
        total
      }
    }
  }
`;

interface RemoveItemData {
  removeItemsFromCart: { cart: { total: string } };
}

export default function CartPage() {
  const { items, total, loading, error, refetch } = useCart();
  const sessionToken = typeof window !== 'undefined' ? localStorage.getItem('woo-session') : null;
  const [removeItem] = useMutation<RemoveItemData>(REMOVE_ITEM, {
    client: getApolloAuthClient(),
    context: sessionToken ? { headers: { 'woocommerce-session': `Session ${sessionToken}` } } : {},
    onCompleted: () => refetch(),
  });

  if (loading) return <p>Loading cart...</p>;
  if (error) return <p>Error loading cart: {error.message}</p>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Your Cart</h1>
      {items.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <ul className="mb-4 space-y-2">
            {items.map(item => (
              <li key={item.key} className="flex items-center justify-between border-b py-2">
                <span>{item.product.node.name}</span>
                <span className="text-sm text-gray-500">Qty: {item.quantity}</span>
                <span>{item.total}</span>
                <Button
                  variant="destructive"
                  onClick={() => removeItem({ variables: { key: item.key } })}
                >
                  Remove
                </Button>
              </li>
            ))}
          </ul>
          <div className="flex justify-between items-center">
            <span className="font-bold">Total: {total}</span>
          </div>
           <MyCheckoutButton />
        </>
      )}
    </div>
  );
}
