import { useEffect, useState } from 'react';

import { useSession } from './UserSessionProvider.jsx';
import {
  AddToCart,
  UpdateCartItemQuantities,
  RemoveItemsFromCart,
} from './graphql.js';

const useCartMutations = (
  productId,
  variationId,
  extraData,
) => {
  const {
    cart,
    setCart,
    findInCart,
  } = useSession();
  const [quantityFound, setQuantityInCart] = useState(
    findInCart(productId, variationId, extraData)?.quantity || 0,
  );

  const [addToCart, { loading: adding }] = useMutation({
    mutation: AddToCart,
    onCompleted({ addToCart: data }) {
      if (data?.cart) {
        setCart(data.cart);
      }
    },
  });
  const [updateQuantity, { loading: updating }] = useMutation({
    mutation: UpdateCartItemQuantities,
    onCompleted({ updateItemQuantities: data }) {
      if (data?.cart) {
        setCart(data.cart);
      }
    },
  });
  const [removeCartItem, { loading: removing }] = useMutation({
    mutation: RemoveItemsFromCart,
    onCompleted({ removeItemsFromCart: data }) {
      if (data?.cart) {
        setCart(data.cart);
      }
    },
  });

  useEffect(() => {
    setQuantityInCart(
      findInCart(productId, variationId, extraData)?.quantity || 0,
    );
  }, [productId, variationId, extraData, cart?.contents?.nodes]);

  const mutate = async (values) => {
    const {
      quantity,
      all = false,
      mutation = 'update',
    } = values;

    if (!cart) {
      return;
    }

    if (!productId) {
      throw new Error('No item provided.');
      // TODO: Send error to Sentry.IO.
    }

    switch (mutation) {
      case 'remove': {
        if (!quantityFound) {
          throw new Error('Provided item not in cart');
        }

        const item = findInCart(
          productId,
          variationId,
          extraData,
        );

        if (!item) {
          throw new Error('Failed to find item in cart.');
        }

        const { key } = item;
        removeCartItem({ variables: { keys: [key], all } });
        break;
      }
      case 'update':
      default:
        if (quantityFound) {
          const item = findInCart(
            productId,
            variationId,
            extraData,
          );

          if (!item) {
            throw new Error('Failed to find item in cart.');
          }

          const { key } = item;
          updateQuantity({ variables: { items: [{ key, quantity }] } });
        } else {
            addToCart({
                variables: {
                    input: {
                        productId,
                        variationId,
                        quantity,
                        extraData,
                    },
                },
            });
        }
        break;
    }
    };

    return {
        quantityInCart: quantityFound,
        mutate,
        loading: adding || updating || removing,
    };
};

export default useCartMutations;