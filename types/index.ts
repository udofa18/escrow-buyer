export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  slug?: string;
  category?: string;
  deliveryTimeline?: string;
  store?: {
    id: string;
    name: string;
    verified: boolean;
    address: string;
    description: string;
  };
  storefrontId?: {
    _id: string;
    name: string;
    slug?: string;
    logo?: { url: string; thumbnailUrl?: string };
  };
}

// Escrow API types
export interface StorefrontBanner {
  fileId: string;
  url: string;
  thumbnailUrl: string;
}

export interface Storefront {
  _id: string;
  userId: string;
  storeName: string;
  description: string;
  address: string;
  slug: string;
  contactEmail?: string;
  contactPhone?: string;
  ownerName?: string;
  banner?: StorefrontBanner;
  logo?: StorefrontBanner;
  isActive?: boolean;
  hasCompletedStoreProfile?: boolean;
}

export interface StorefrontResponse {
  success: boolean;
  message: string;
  data: Storefront;
}

export interface ProductImage {
  fileId: string;
  name: string;
  url: string;
  thumbnailUrl: string;
}

export interface ApiProduct {
  _id: string;
  storefrontId: string | { _id: string; storeName: string; slug?: string; logo?: { url: string; thumbnailUrl?: string } };
  userId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  deliveryTimeline: string;
  images: ProductImage[];
  status: string;
  slug: string;
  quantity: number;
}

export interface ProductDetailResponse {
  success: boolean;
  message: string;
  data: ApiProduct;
}

export interface ProductsResponse {
  success: boolean;
  message: string;
  data: {
    current_page: number;
    per_page: number;
    has_next_page: boolean;
    total_result: number;
    data: ApiProduct[];
  };
}

export interface Bank {
  id: number;
  code: string;
  name: string;
  logo?: string;
  created?: string;
}

export interface BanksResponse {
  success: boolean;
  message?: string;
  data: { bank: Bank[] };
}

export interface VerifyAccountResponse {
  success: boolean;
  message?: string;
  data: {
    accountNumber: string;
    accountName: string;
    bankCode: string;
    bankName: string;
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
  bankCode?: string;
}

export interface CheckoutProductItem {
  productId: string;
  quantity: number;
}

export interface CheckoutRequest {
  name: string;
  email: string;
  phoneNumber: string;
  address: string;
  productsIds: CheckoutProductItem[];
  accountNumber: string;
  bankCode: string;
  discountCode?: string;
  note?: string;
}

export interface CheckoutResponseData {
  accountNumber: string;
  bankName: string;
  accountName: string;
  amount: number;
  originalAmount: number;
  discountAmount: number;
  discountCode?: string;
  reference: string;
  trackingCode?: string;
  escrowId: string;
}

export interface CheckoutResponse {
  success: boolean;
  message?: string;
  data: CheckoutResponseData;
}

export interface CheckoutStatusStorefront {
  _id: string;
  storeName: string;
  slug: string;
  logo?: {
    fileId?: string;
    name?: string;
    url?: string;
    thumbnailUrl?: string;
  };
}

export interface CheckoutStatusProduct {
  _id: string;
  name: string;
  price: number;
  images?: {
    fileId?: string;
    name?: string;
    url?: string;
    thumbnailUrl?: string;
  }[];
}

export interface CheckoutStatusData {
  trackingCode: string;
  status: string;
  senderPaymentStatus: string;
  escrowAmount: number;
  totalAmount: number;
  discountAmount: number;
  productName?: string;
  transactionDescription?: string;
  storefront?: CheckoutStatusStorefront;
  products?: CheckoutStatusProduct[];
  buyerDetails?: {
    name?: string;
    email?: string;
    address?: string;
  };
  createdAt?: string;
}

export interface CheckoutStatusResponse {
  success: boolean;
  message?: string;
  data: CheckoutStatusData;
}

export interface DiscountCode {
  code: string;
  discount: number; // percentage
  valid: boolean;
}

export interface EscrowDiscountTargetProduct {
  _id: string;
  name: string;
  price: number;
  images?: { url?: string; thumbnailUrl?: string }[];
}

export interface EscrowDiscount {
  _id: string;
  storefrontId: string;
  code: string;
  type: 'fixed' | 'percentage';
  value: number;
  targetType: string;
  targetProducts: EscrowDiscountTargetProduct[];
  minOrderAmount: number;
  maxUsePerCustomer: number | null;
  maxClaims: number | null;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  status: string;
}

export interface EscrowDiscountResponse {
  success: boolean;
  message?: string;
  data: EscrowDiscount;
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
