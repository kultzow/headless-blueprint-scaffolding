'use client'
import { useState, useEffect } from 'react';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { getApolloAuthClient } from '@faustwp/core';

const SESSION_KEY = 'woo-session';

export const GET_CART = gql`
  query GetCart {
    cart {
      contents {
        nodes {
          key
          quantity
          total
          product {
            node {
              databaseId
              name
            }
          }
        }
      }
      total
    }
    customer {
      sessionToken
    }
  }
`;

export interface CartItem {
  key: string;
  quantity: number;
  total: string;
  product: { node: { databaseId: number; name: string } };
}

export interface CartData {
  cart: {
    contents: { nodes: CartItem[] };
    total: string;
  };
  customer: {
    sessionToken: string;
  };
}

export function useCart() {
  // Initialise synchronously from localStorage so the first query includes the
  // session header (avoids a second round-trip on returning visits).
  const [sessionToken, setSessionToken] = useState<string | null>(() =>
    typeof window !== 'undefined' ? localStorage.getItem(SESSION_KEY) : null
  );

  const client = getApolloAuthClient();

  const { data, loading, error, refetch } = useQuery<CartData>(GET_CART, {
    client,
    fetchPolicy: 'network-only',
    context: sessionToken
      ? { headers: { 'woocommerce-session': `Session ${sessionToken}` } }
      : {},
  });

  // Capture the WooCommerce session token from the response body.
  // Always persist the latest token to localStorage (for the next page load),
  // but only update state when going from null → first token. WooCommerce rotates
  // the session token on every response; updating state on each rotation would
  // change `context`, re-trigger the query, get another new token, and loop.
  useEffect(() => {
    const token = data?.customer?.sessionToken;
    if (token) {
      localStorage.setItem(SESSION_KEY, token);
      setSessionToken(prev => prev ?? token);
    }
  }, [data]);

  const items: CartItem[] = data?.cart?.contents?.nodes ?? [];
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return { items, itemCount, total: data?.cart?.total ?? '', loading, error, refetch };
}
