import { NextResponse } from 'next/server';
import { dummyProducts } from '@/data/products';
import { apiStore } from '@/lib/api-store';

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

export async function POST(request: Request) {
  try {
    const { productId, quantity = 1 } = await request.json();
    
    // Validate productId
    if (!productId || typeof productId !== 'string') {
      return NextResponse.json(
        { message: 'Invalid product ID' },
        { status: 400 }
      );
    }
    
    const product = dummyProducts.find((p) => p.id === productId);
    
    if (!product) {
      return NextResponse.json(
        { message: 'Product not found' },
        { status: 404 }
      );
    }
    
    // Ensure quantity is a positive number
    const qty = Math.max(1, Math.floor(quantity || 1));
    
    const existingItem = apiStore.cart.find((item) => item.product.id === productId);
    
    if (existingItem) {
      existingItem.quantity += qty;
    } else {
      apiStore.cart.push({ product, quantity: qty });
    }
    
    // Return a copy of the cart to avoid reference issues
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
