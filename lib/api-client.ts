import { Product, CartItem, DiscountCode, Order, ContactInfo, PaymentAccount } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

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

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
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

// Products API
export const productsApi = {
  getAll: (): Promise<Product[]> => fetchApi<Product[]>('/products'),
  getById: (id: string): Promise<Product> => fetchApi<Product>(`/products/${id}`),
};

// Cart API
export const cartApi = {
  get: (): Promise<CartItem[]> => fetchApi<CartItem[]>('/cart'),
  add: (productId: string, quantity: number = 1): Promise<CartItem[]> => {
    if (!productId) {
      throw new Error('Product ID is required');
    }
    return fetchApi<CartItem[]>('/cart', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    });
  },
  update: (productId: string, quantity: number): Promise<CartItem[]> => {
    if (!productId) {
      throw new Error('Product ID is required');
    }
    return fetchApi<CartItem[]>(`/cart/${productId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
  },
  remove: (productId: string): Promise<CartItem[]> => {
    if (!productId) {
      throw new Error('Product ID is required');
    }
    return fetchApi<CartItem[]>(`/cart/${productId}`, {
      method: 'DELETE',
    });
  },
  clear: (): Promise<void> =>
    fetchApi<void>('/cart', { method: 'DELETE' }),
};

// Discount API
export const discountApi = {
  validate: (code: string): Promise<DiscountCode> =>
    fetchApi<DiscountCode>(`/discount/${code}`),
};

// Order API
export const orderApi = {
  create: (contactInfo: ContactInfo, discountCode?: string, cartItems?: CartItem[]): Promise<Order> =>
    fetchApi<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify({ contactInfo, discountCode, cartItems }),
    }),
  getById: (id: string): Promise<Order> => fetchApi<Order>(`/orders/${id}`),
  updateStatus: (id: string, status: Order['status']): Promise<Order> =>
    fetchApi<Order>(`/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),
};

// Payment API
export const paymentApi = {
  getAccount: (orderId: string): Promise<PaymentAccount> =>
    fetchApi<PaymentAccount>(`/payment/account/${orderId}`),
  confirm: (orderId: string, orderData?: any): Promise<{ success: boolean }> => {
    const body: any = orderData ? { orderData } : {};
    return fetchApi<{ success: boolean }>(`/payment/confirm/${orderId}`, {
      method: 'POST',
      body: Object.keys(body).length > 0 ? JSON.stringify(body) : undefined,
    });
  },
  cancel: (orderId: string): Promise<{ success: boolean }> =>
    fetchApi<{ success: boolean }>(`/payment/cancel/${orderId}`, {
      method: 'POST',
    }),
};

export { ApiError };
