import type {
  StorefrontResponse,
  ProductsResponse,
  ProductDetailResponse,
  BanksResponse,
  VerifyAccountResponse,
  EscrowDiscountResponse,
  EscrowDiscount,
  CheckoutRequest,
  CheckoutResponse,
  Bank,
  Storefront,
  ApiProduct,
  Product,
} from '@/types';
import { decryptResponse } from '@/lib/response-decrypt';

const ESCROW_BASE = process.env.NEXT_PUBLIC_ESCROW_URL;

function getEscrowUrl(path: string, search?: string): string {
  const url = `${ESCROW_BASE}${path}`;
  if (search) return `${url}${url.includes('?') ? '&' : '?'}${search}`;
  return url;
}

async function fetchEscrow<T>(path: string, search?: string): Promise<T> {
  const url = getEscrowUrl(path, search);
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
  });
  const raw = await res.json().catch(() => ({}));
  console.log('[storefront-api] raw response', { path, url, ok: res.ok, raw });
  let body: T;
  try {
    body = await decryptResponse<T>(raw);
    console.log('[storefront-api] after decrypt', { path, body });
  } catch (e) {
    console.error('[storefront-api] decrypt failed', { path, error: e });
    throw e;
  }
  if (!res.ok) {
    const err = body as { message?: string };
    throw new Error(err.message || `Storefront API error: ${res.statusText}`);
  }
  return body;
}

async function fetchEscrowPost<T>(path: string, payload: unknown): Promise<T> {
  const url = getEscrowUrl(path);
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const raw = await res.json().catch(() => ({}));
  let body: T;
  try {
    body = await decryptResponse<T>(raw);
  } catch (e) {
    console.error('[storefront-api] decrypt failed', { path, error: e });
    throw e;
  }
  if (!res.ok) {
    const err = body as { message?: string };
    throw new Error(err.message || `Storefront API error: ${res.statusText}`);
  }
  return body;
}

export async function getStorefrontBySlug(slug: string): Promise<Storefront> {
  const data = await fetchEscrow<StorefrontResponse>(
    `/v2/storefront/public/storefront/${encodeURIComponent(slug)}`
  );
  if (!data.success || !data.data) {
    throw new Error(data.message || 'Failed to load storefront');
  }
  console.log('[storefront-api] storefront data', data.data);
  return data.data;
}

export async function getProductsByStoreSlug(storeSlug: string): Promise<ApiProduct[]> {
  const data = await fetchEscrow<ProductsResponse>(
    '/v2/storefront/public/products',
    `storeSlug=${encodeURIComponent(storeSlug)}`
  );
  if (!data.success || !data.data?.data) {
    throw new Error(data.message || 'Failed to load products');
  }
  console.log('[storefront-api] products data', data.data);
  return data.data.data;
}

export async function getBanks(): Promise<Bank[]> {
  const data = await fetchEscrow<BanksResponse>('/v2/storefront/public/banks');
  if (!data.success) {
    throw new Error((data as { message?: string }).message || 'Failed to load banks');
  }
  const bankList = data.data?.bank;
  if (!Array.isArray(bankList)) return [];
  return bankList;
}

export async function postCheckout(body: CheckoutRequest): Promise<CheckoutResponse['data']> {
  const data = await fetchEscrowPost<CheckoutResponse>('/v2/storefront/public/checkout', body);
  if (!data.success || !data.data) {
    throw new Error((data as { message?: string }).message || 'Checkout failed');
  }
  return data.data;
}

export async function getDiscountByCode(code: string): Promise<EscrowDiscount> {
  const trimmed = code.trim().toUpperCase();
  if (!trimmed) throw new Error('Discount code is required');
  const data = await fetchEscrow<EscrowDiscountResponse>(
    `/v2/discount/${encodeURIComponent(trimmed)}`
  );
  if (!data.success || !data.data) {
    throw new Error((data as { message?: string }).message || 'Invalid discount code');
  }
  return data.data;
}

export async function verifyAccount(accountNumber: string, bankCode: string): Promise<VerifyAccountResponse['data']> {
  const account = accountNumber.trim();
  if (!account || !bankCode) throw new Error('Account number and bank code are required');
  const data = await fetchEscrow<VerifyAccountResponse>(
    '/v2/storefront/public/verify',
    `accountNumber=${encodeURIComponent(account)}&bankCode=${encodeURIComponent(bankCode)}`
  );
  if (!data.success || !data.data) {
    throw new Error((data as { message?: string }).message || 'Account verification failed');
  }
  return data.data;
}

export async function getProductBySlug(storeSlug: string, productSlug: string): Promise<Product> {
  const data = await fetchEscrow<ProductDetailResponse>(
    `/v2/storefront/public/product/${encodeURIComponent(productSlug)}`,
    // `storeSlug=${encodeURIComponent(storeSlug)}`
  );
  if (!data.success || !data.data) {
    throw new Error(data.message || 'Failed to load product');
  }
  return mapApiProductToProduct(data.data);
}

export function mapApiProductToProduct(apiProduct: ApiProduct, store?: Storefront): Product {
  const image = apiProduct.images?.[0]?.url ?? apiProduct.images?.[0]?.thumbnailUrl ?? '';
  const sf = typeof apiProduct.storefrontId === 'object' && apiProduct.storefrontId ? apiProduct.storefrontId : undefined;
  const storefrontIdObj = sf
    ? {
        _id: sf._id,
        name: (sf as { storeName?: string }).storeName ?? (sf as { name?: string }).name ?? '',
        slug: (sf as { slug?: string }).slug,
        logo: (sf as { logo?: { url: string; thumbnailUrl?: string } }).logo,
      }
    : undefined;
  return {
    id: apiProduct._id,
    name: apiProduct.name,
    price: Number(apiProduct.price),
    image,
    description: apiProduct.description ?? '',
    slug: apiProduct.slug,
    category: apiProduct.category,
    deliveryTimeline: apiProduct.deliveryTimeline,
    store: store
      ? {
          id: store._id,
          name: store.storeName,
          verified: !!store.hasCompletedStoreProfile,
          address: store.address,
          description: store.description ?? '',
        }
      : undefined,
    storefrontId: storefrontIdObj ? { _id: storefrontIdObj._id, name: storefrontIdObj.name, slug: storefrontIdObj.slug, logo: storefrontIdObj.logo } : undefined,
  };
}
