import { NextResponse } from 'next/server';
import { apiStore } from '@/lib/api-store';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    
    console.log('POST /api/payment/cancel/[orderId]:', { 
      orderId,
      totalOrders: apiStore.orders.length,
      orderIds: apiStore.orders.map(o => o.id)
    });
    
    const order = apiStore.orders.find((o) => o.id === orderId);
    
    if (!order) {
      console.warn('Order not found for payment cancellation:', orderId);
      // For cancellation, we can be more lenient - just return success
      // since the order might have already been cleared
      return NextResponse.json({ 
        success: true, 
        message: 'Payment cancelled (order may have already been cleared)' 
      });
    }
    
    order.status = 'cancelled';
    console.log('Payment cancelled, order status updated:', orderId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error cancelling payment:', error);
    return NextResponse.json(
      { message: 'Failed to cancel payment', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
