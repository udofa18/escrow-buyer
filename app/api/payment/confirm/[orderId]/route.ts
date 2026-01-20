import { NextResponse } from 'next/server';
import { apiStore } from '@/lib/api-store';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    
    console.log('POST /api/payment/confirm/[orderId]:', { 
      orderId,
      totalOrders: apiStore.orders.length,
      orderIds: apiStore.orders.map(o => o.id)
    });
    
    let order = apiStore.orders.find((o) => o.id === orderId);
    
    // If order not found in store, try to recreate it from request body if provided
    if (!order) {
      console.warn('Order not found in store for payment confirmation:', orderId);
      
      // Try to get order data from request body (client can send it as fallback)
      try {
        const body = await request.json().catch(() => ({}));
        if (body.orderData) {
          console.log('Recreating order from request body');
          if (!body.orderData || typeof body.orderData !== 'object') {
            throw new Error('Invalid order data in request');
          }
          const recreatedOrder = { ...body.orderData, status: 'processing' };
          apiStore.orders.push(recreatedOrder);
          order = recreatedOrder;
          console.log('Order recreated and added to store:', orderId);
        } else {
          throw new Error('No order data in request');
        }
      } catch (error) {
        console.error('Could not recreate order:', error);
        return NextResponse.json(
          { 
            message: 'Order not found. The order may have been cleared due to server restart. Please try creating a new order.',
            orderId 
          },
          { status: 404 }
        );
      }
    }
    
    order!.status = 'processing';
    console.log('Payment confirmed, order status updated to processing:', orderId);
    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error('Error confirming payment:', error);
    return NextResponse.json(
      { message: 'Failed to confirm payment', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
