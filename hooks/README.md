# Cart Hook (`useCart`)

A reusable React hook that provides complete cart functionality for the entire application.

## Usage

```tsx
import { useCart } from '@/hooks/useCart';

function MyComponent() {
  const {
    cart,
    loading,
    itemCount,
    subtotal,
    addToCart,
    removeFromCart,
    updateQuantity,
    isInCart,
  } = useCart();
  
  // Use the cart functions and state
}
```

## API

### State

- `cart: CartItem[]` - Array of cart items
- `loading: boolean` - Whether the cart is being loaded
- `addingToCart: string | null` - ID of product being added (null if none)
- `updating: string | null` - ID of product being updated (null if none)
- `removing: string | null` - ID of product being removed (null if none)

### Computed Values

- `itemCount: number` - Total number of items in cart
- `subtotal: number` - Total price of all items in cart

### Actions

- `loadCart(): Promise<void>` - Manually reload cart from API
- `addToCart(productId: string, quantity?: number): Promise<void>` - Add item to cart
- `removeFromCart(productId: string): Promise<void>` - Remove item from cart
- `updateQuantity(productId: string, quantity: number): Promise<void>` - Update item quantity
- `clearCart(): Promise<void>` - Clear all items from cart
- `refreshCart(): Promise<void>` - Refresh cart state without loading state

### Helpers

- `isInCart(productId: string): boolean` - Check if product is in cart
- `getItemQuantity(productId: string): number` - Get quantity of specific product

## Options

- `autoLoad: boolean` (default: `true`) - Automatically load cart on mount

## Example

```tsx
'use client';

import { useCart } from '@/hooks/useCart';
import Button from '@/components/Button';

export default function ProductCard({ product }) {
  const { addToCart, isInCart, addingToCart } = useCart();
  
  return (
    <div>
      <h3>{product.name}</h3>
      <Button
        onClick={() => addToCart(product.id)}
        isLoading={addingToCart === product.id}
      >
        {isInCart(product.id) ? 'In Cart' : 'Add to Cart'}
      </Button>
    </div>
  );
}
```
