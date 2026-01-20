import { NextResponse } from 'next/server';
import { apiStore } from '@/lib/api-store';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { status } = await request.json();
    
    const order = apiStore.orders.find((o) => o.id === id);
    if (!order) {
      return NextResponse.json(
        { message: 'Order not found' },
        { status: 404 }
      );
    }
    
    order.status = status;
    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to update order status' },
      { status: 500 }
    );
  }
}
