import { NextResponse } from 'next/server';
import { apiStore } from '@/lib/api-store';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params;
    const body = await request.json();
    const { quantity } = body;
    
    console.log('PUT /api/cart/[productId]:', { productId, quantity });
    
    // Validate inputs
    if (!productId || typeof productId !== 'string') {
      return NextResponse.json(
        { message: 'Invalid product ID' },
        { status: 400 }
      );
    }
    
    const qty = Math.max(0, Math.floor(quantity || 0));
    
    const item = apiStore.cart.find((item) => item.product.id === productId);
    if (!item) {
      return NextResponse.json(
        { message: 'Item not found in cart' },
        { status: 404 }
      );
    }
    
    if (qty <= 0) {
      // Remove item if quantity is 0 or less
      apiStore.cart = apiStore.cart.filter((item) => item.product.id !== productId);
    } else {
      // Update quantity
      item.quantity = qty;
    }
    
    console.log('Cart after update:', apiStore.cart.length, 'items');
    
    // Return a copy of the cart to avoid reference issues
    return NextResponse.json([...apiStore.cart]);
  } catch (error) {
    console.error('Error updating cart:', error);
    return NextResponse.json(
      { message: 'Failed to update cart item', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params;
    
    console.log('DELETE /api/cart/[productId]:', { productId, currentCartLength: apiStore.cart.length });
    
    // Validate productId
    if (!productId || typeof productId !== 'string') {
      return NextResponse.json(
        { message: 'Invalid product ID' },
        { status: 400 }
      );
    }
    
    // Remove only the specific product
    const initialLength = apiStore.cart.length;
    apiStore.cart = apiStore.cart.filter((item) => item.product.id !== productId);
    
    console.log('Cart after delete:', apiStore.cart.length, 'items (was', initialLength, ')');
    
    if (apiStore.cart.length === initialLength) {
      return NextResponse.json(
        { message: 'Item not found in cart' },
        { status: 404 }
      );
    }
    
    // Return a copy of the cart to avoid reference issues
    return NextResponse.json([...apiStore.cart]);
  } catch (error) {
    console.error('Error removing from cart:', error);
    return NextResponse.json(
      { message: 'Failed to remove item from cart', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
