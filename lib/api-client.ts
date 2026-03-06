import { Product, CartItem, DiscountCode, Order, ContactInfo, PaymentAccount } from '@/types';

const ESCROW_BASE = process.env.NEXT_PUBLIC_ESCROW_URL || '';
const LOCAL_API_BASE = ''; // same origin → Next.js /api routes (cart, orders, payment, discount)

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchFrom<T>(baseUrl: string, endpoint: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.message || `API Error: ${response.statusText}`,
        response.status,
        errorData
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : 'Network error occurred',
      0,
      error
    );
  }
}

// Products API (escrow) – prefer storefront-api for storefront/product pages
export const productsApi = {
  getAll: (storeSlug: string): Promise<Product[]> =>
    fetchFrom<Product[]>(ESCROW_BASE, `/v2/storefront/public/products?storeSlug=${encodeURIComponent(storeSlug)}`),
  getById: (slug: string): Promise<Product> =>
    fetchFrom<Product>(ESCROW_BASE, `/v2/storefront/public/products/${encodeURIComponent(slug)}`),
};

// Cart API – local Next.js /api/cart (no escrow cart API)
export const cartApi = {
  get: (): Promise<CartItem[]> => fetchFrom<CartItem[]>(LOCAL_API_BASE, '/api/cart'),
  add: (productId: string, quantity: number = 1, product?: Product): Promise<CartItem[]> => {
    if (!productId) throw new Error('Product ID is required');
    const body: { productId: string; quantity: number; product?: Product } = { productId, quantity };
    if (product) body.product = product;
    return fetchFrom<CartItem[]>(LOCAL_API_BASE, '/api/cart', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },
  update: (productId: string, quantity: number): Promise<CartItem[]> => {
    if (!productId) throw new Error('Product ID is required');
    return fetchFrom<CartItem[]>(LOCAL_API_BASE, `/api/cart/${productId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
  },
  remove: (productId: string): Promise<CartItem[]> => {
    if (!productId) throw new Error('Product ID is required');
    return fetchFrom<CartItem[]>(LOCAL_API_BASE, `/api/cart/${productId}`, { method: 'DELETE' });
  },
  clear: (): Promise<void> => fetchFrom<void>(LOCAL_API_BASE, '/api/cart', { method: 'DELETE' }),
};

// Discount API – local Next.js /api/discount
export const discountApi = {
  validate: (code: string): Promise<DiscountCode> =>
    fetchFrom<DiscountCode>(LOCAL_API_BASE, `/api/discount/${encodeURIComponent(code)}`),
};

// Order API – local Next.js /api/orders
export const orderApi = {
  create: (contactInfo: ContactInfo, discountCode?: string, cartItems?: CartItem[]): Promise<Order> =>
    fetchFrom<Order>(LOCAL_API_BASE, '/api/orders', {
      method: 'POST',
      body: JSON.stringify({ contactInfo, discountCode, cartItems }),
    }),
  getById: (id: string): Promise<Order> => fetchFrom<Order>(LOCAL_API_BASE, `/api/orders/${id}`),
  updateStatus: (id: string, status: Order['status']): Promise<Order> =>
    fetchFrom<Order>(LOCAL_API_BASE, `/api/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),
};

// Payment API – local Next.js /api/payment
export const paymentApi = {
  getAccount: (orderId: string): Promise<PaymentAccount> =>
    fetchFrom<PaymentAccount>(LOCAL_API_BASE, `/api/payment/account/${orderId}`),
  confirm: (orderId: string, orderData?: any): Promise<{ success: boolean }> => {
    const body: any = orderData ? { orderData } : {};
    return fetchFrom<{ success: boolean }>(LOCAL_API_BASE, `/api/payment/confirm/${orderId}`, {
      method: 'POST',
      body: Object.keys(body).length > 0 ? JSON.stringify(body) : undefined,
    });
  },
  cancel: (orderId: string): Promise<{ success: boolean }> =>
    fetchFrom<{ success: boolean }>(LOCAL_API_BASE, `/api/payment/cancel/${orderId}`, {
      method: 'POST',
    }),
};

export { ApiError };
