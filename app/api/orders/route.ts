import { NextResponse } from 'next/server';
import { Order, ContactInfo, CartItem } from '@/types';
import { apiStore } from '@/lib/api-store';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { contactInfo, discountCode, cartItems }: { 
      contactInfo: ContactInfo; 
      discountCode?: string;
      cartItems?: CartItem[];
    } = body;
    
    console.log('POST /api/orders:', { 
      hasContactInfo: !!contactInfo,
      contactInfoKeys: contactInfo ? Object.keys(contactInfo) : [],
      cartItemsFromClient: cartItems?.length || 0,
      serverCartLength: apiStore.cart.length,
      discountCode 
    });
    
    // Validate contactInfo
    if (!contactInfo) {
      return NextResponse.json(
        { message: 'Contact information is required' },
        { status: 400 }
      );
    }
    
    // Validate required contactInfo fields
    const requiredFields: (keyof ContactInfo)[] = ['fullName', 'email', 'phone', 'address', 'accountDetails'];
    const missingFields = requiredFields.filter(field => !contactInfo[field] || contactInfo[field].trim() === '');
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { message: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }
    
    // Use cart items from client if provided, otherwise fall back to server cart
    const items = cartItems && cartItems.length > 0 ? cartItems : apiStore.cart;
    
    if (items.length === 0) {
      return NextResponse.json(
        { message: 'Cart is empty. Please add items to your cart before checkout.' },
        { status: 400 }
      );
    }
    
    const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    let discount = 0;
    
    if (discountCode) {
      const discountResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/discount/${discountCode}`);
      if (discountResponse.ok) {
        const discountData = await discountResponse.json();
        discount = (subtotal * discountData.discount) / 100;
      }
    }
    
    const total = subtotal - discount;
    
    const order: Order = {
      id: `order-${Date.now()}`,
      items: [...items],
      contactInfo,
      subtotal,
      discount,
      total,
      discountCode,
      status: 'pending',
    };
    
    apiStore.orders.push(order);
    
    console.log('Order created:', { 
      orderId: order.id, 
      totalOrders: apiStore.orders.length,
      status: order.status 
    });
    
    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to create order' },
      { status: 500 }
    );
  }
}
