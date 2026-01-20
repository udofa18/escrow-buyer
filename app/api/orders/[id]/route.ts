import { NextResponse } from 'next/server';
import { apiStore } from '@/lib/api-store';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    console.log('GET /api/orders/[id]:', { 
      orderId: id, 
      totalOrders: apiStore.orders.length,
      orderIds: apiStore.orders.map(o => o.id)
    });
    
    const order = apiStore.orders.find((o) => o.id === id);
    
    if (!order) {
      console.warn('Order not found:', id);
      return NextResponse.json(
        { message: 'Order not found. The order may have been cleared due to server restart.', orderId: id },
        { status: 404 }
      );
    }
    
    return NextResponse.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { message: 'Failed to fetch order', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
