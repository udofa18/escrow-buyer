import { useState, useEffect, useCallback } from 'react';
import { cartApi } from '@/lib/api-client';
import { CartItem } from '@/types';
import { handleApiError } from '@/lib/error-handler';

interface UseCartReturn {
  // State
  cart: CartItem[];
  loading: boolean;
  addingToCart: string | null;
  updating: string | null;
  removing: string | null;
  
  // Computed values
  itemCount: number;
  subtotal: number;
  
  // Actions
  loadCart: () => Promise<void>;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  
  // Helpers
  isInCart: (productId: string) => boolean;
  getItemQuantity: (productId: string) => number;
  refreshCart: () => Promise<void>;
}

export function useCart(autoLoad: boolean = true): UseCartReturn {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);

  const loadCart = useCallback(async () => {
    try {
      setLoading(true);
      const cartData = await cartApi.get();
      setCart(cartData);
    } catch (error) {
      console.error('Failed to load cart:', handleApiError(error));
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshCart = useCallback(async () => {
    try {
      const cartData = await cartApi.get();
      setCart(cartData);
    } catch (error) {
      console.error('Failed to refresh cart:', handleApiError(error));
    }
  }, []);

  const addToCart = useCallback(async (productId: string, quantity: number = 1) => {
    setAddingToCart(productId);
    try {
      const updatedCart = await cartApi.add(productId, quantity);
      setCart(updatedCart);
    } catch (error) {
      console.error('Failed to add to cart:', handleApiError(error));
      throw error;
    } finally {
      setAddingToCart(null);
    }
  }, []);

  const removeFromCart = useCallback(async (productId: string) => {
    if (!productId) {
      console.error('Cannot remove: productId is required');
      return;
    }
    setRemoving(productId);
    try {
      const updatedCart = await cartApi.remove(productId);
      setCart(updatedCart);
    } catch (error) {
      console.error('Failed to remove from cart:', handleApiError(error));
      // Refresh cart to get current state
      await refreshCart();
      throw error;
    } finally {
      setRemoving(null);
    }
  }, [refreshCart]);

  const updateQuantity = useCallback(async (productId: string, quantity: number) => {
    if (!productId) {
      console.error('Cannot update: productId is required');
      return;
    }
    if (quantity <= 0) {
      await removeFromCart(productId);
      return;
    }
    setUpdating(productId);
    try {
      const updatedCart = await cartApi.update(productId, quantity);
      setCart(updatedCart);
    } catch (error) {
      console.error('Failed to update cart:', handleApiError(error));
      // Refresh cart to get current state
      await refreshCart();
      throw error;
    } finally {
      setUpdating(null);
    }
  }, [removeFromCart, refreshCart]);

  const clearCart = useCallback(async () => {
    try {
      await cartApi.clear();
      setCart([]);
    } catch (error) {
      console.error('Failed to clear cart:', handleApiError(error));
      throw error;
    }
  }, []);

  const isInCart = useCallback((productId: string): boolean => {
    return cart.some((item) => item.product.id === productId);
  }, [cart]);

  const getItemQuantity = useCallback((productId: string): number => {
    const item = cart.find((item) => item.product.id === productId);
    return item?.quantity || 0;
  }, [cart]);

  // Computed values
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  // Auto-load cart on mount
  useEffect(() => {
    if (autoLoad) {
      loadCart();
    }
  }, [autoLoad, loadCart]);

  return {
    // State
    cart,
    loading,
    addingToCart,
    updating,
    removing,
    
    // Computed values
    itemCount,
    subtotal,
    
    // Actions
    loadCart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    
    // Helpers
    isInCart,
    getItemQuantity,
    refreshCart,
  };
}
