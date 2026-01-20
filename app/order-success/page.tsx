'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FiLock } from 'react-icons/fi';
import Button from '@/components/Button';
import { useCart } from '@/hooks/useCart';
import { AiFillCheckCircle } from 'react-icons/ai';

function OrderSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId') || '';
  const { cart } = useCart();
  
  if (!cart) {
    return <div>Order not found</div>;
  }
  
  const total = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0).toLocaleString('en-NG', { minimumFractionDigits: 2 });
  const formattedTotal = `₦ ${total}`;
  
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center max-w-md px-4">
        <div className="mb-6 flex justify-center">
          <AiFillCheckCircle className="text-green-600" size={80} />
        </div>
        <h1 className="text-lg font-bold mb-4 ">Payment Successful!</h1>
        <p className="text-gray-600 mb-2">
          {formattedTotal} has been secured in XedlaPay Escrow.
        </p>
        <p className="text-gray-600 my-10">
          We've sent an access key to your email. Use this key whenever you need to track this order in real-time.
        </p>
      
        <Button
          variant="primary"
          className="mt-6 md:w-96 w-full"
          size='lg'
          onClick={() => router.push('/track')}
        >
          Track my order
        </Button>
      </div>

      <div className="text-center text-sm text-gray-500 mt-20 absolute bottom-0 w-full">
        <p className='flex items-center justify-center gap-2 py-2'>
          <FiLock size={20} /> Secured by XedlaPay Escrow
        </p>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    }>
      <OrderSuccessContent />
    </Suspense>
  );
}
