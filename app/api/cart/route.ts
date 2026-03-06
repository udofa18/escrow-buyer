import { NextResponse } from 'next/server';
import { dummyProducts } from '@/data/products';
import { apiStore } from '@/lib/api-store';
import type { Product } from '@/types';

export async function GET() {
  try {
    return NextResponse.json(apiStore.cart);
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to fetch cart' },
      { status: 500 }
    );
  }
}

function isValidProduct(p: unknown): p is Product {
  return (
    typeof p === 'object' &&
    p !== null &&
    'id' in p &&
    typeof (p as Product).id === 'string' &&
    'name' in p &&
    'price' in p &&
    typeof (p as Product).price === 'number'
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId, quantity = 1, product: productPayload } = body;

    const qty = Math.max(1, Math.floor(quantity || 1));

    let product: Product;

    if (productPayload && isValidProduct(productPayload)) {
      product = productPayload as Product;
    } else if (productId && typeof productId === 'string') {
      const found = dummyProducts.find((p) => p.id === productId);
      if (!found) {
        return NextResponse.json(
          { message: 'Product not found. Send full product in body for escrow products.' },
          { status: 404 }
        );
      }
      product = found;
    } else {
      return NextResponse.json(
        { message: 'Invalid request: provide productId or product' },
        { status: 400 }
      );
    }

    const existingItem = apiStore.cart.find((item) => item.product.id === product.id);

    if (existingItem) {
      existingItem.quantity += qty;
    } else {
      apiStore.cart.push({ product, quantity: qty });
    }

    return NextResponse.json([...apiStore.cart]);
  } catch (error) {
    console.error('Error adding to cart:', error);
    return NextResponse.json(
      { message: 'Failed to add item to cart' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    apiStore.cart = [];
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to clear cart' },
      { status: 500 }
    );
  }
}
