export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  store: {
    id: string;
    name: string;
    verified: boolean;
    address: string;
    description: string;
  };
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface ContactInfo {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  accountDetails: string;
  note: string;
  deliveryAddress: string;
  bankName: string;
}

export interface DiscountCode {
  code: string;
  discount: number; // percentage
  valid: boolean;
}

export interface Order {
  id: string;
  items: CartItem[];
  contactInfo: ContactInfo;
  subtotal: number;
  discount: number;
  total: number;
  discountCode?: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
}

export interface PaymentAccount {
  accountName: string;
  accountNumber: string;
  bankName: string;
}
