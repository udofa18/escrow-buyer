// Shared in-memory store for API routes
// In production, replace this with a database or session storage

import { CartItem, Order } from '@/types';

export const apiStore = {
  cart: [] as CartItem[],
  orders: [] as Order[],
};
