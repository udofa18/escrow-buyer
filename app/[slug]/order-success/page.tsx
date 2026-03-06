'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { FiLock } from 'react-icons/fi';
import Button from '@/components/Button';
import { useCart } from '@/hooks/useCart';
import { AiFillCheckCircle } from 'react-icons/ai';
import Text from '@/components/Text';
import SuspenseWrapper from '@/components/SuspenseWrapper';

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
    <div className="max-w-7xl h-[calc(100vh-100px)] m-auto flex flex-col overflow-hidden ">
      <div className="text-center max-w-md px-4 flex-1 m-auto flex flex-col justify-center">
        <div className="mb-6 flex justify-center">
          <AiFillCheckCircle className="text-green-600" size={80} />
        </div>
        <Text size='large' as='h1' className="text-lg font-bold mb-4 ">Payment Successful!</Text>
        <Text size='medium' as='p' className="text-gray-600 mb-2">
          {formattedTotal} has been secured in XedlaPay Escrow.
        </Text>
        <Text size='medium' as='p' className="text-gray-600 my-10">
          We've sent an access key to your email. Use this key whenever you need to track this order in real-time.
        </Text>
      
        
      </div>
<Button
          variant="primary"
          className="mt-6 md:w-96 w-full m-auto"
          size='lg'
          onClick={() => router.push('/track')}
        >
          Track my order
        </Button>
      <div className="text-center text-sm text-gray-500 mt-10  bottom-0 w-full">
        <Text size='small' as='p' className='flex items-center justify-center gap-2 py-2'>
          <FiLock size={20} /> Secured by VFD
        </Text>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <SuspenseWrapper>
      <OrderSuccessContent />
    </SuspenseWrapper>
  );
}
