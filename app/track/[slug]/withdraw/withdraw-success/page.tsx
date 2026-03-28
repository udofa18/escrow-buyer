'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { FiLock } from 'react-icons/fi';
import Button from '@/components/Button';
import { useCart } from '@/hooks/useCart';
import { AiFillCheckCircle } from 'react-icons/ai';
import Text from '@/components/Text';
import SuspenseWrapper from '@/components/SuspenseWrapper';
import type { CheckoutResponseData } from '@/types';
import Image from 'next/image'
 
function WithdrawSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId') || '';
  const trackingFromUrl = searchParams.get('trackingCode') || '';
  const { cart } = useCart();
  const params = useParams();
  const slug = params.slug as string;
  const [trackingCode, setTrackingCode] = useState<string>(trackingFromUrl);

  useEffect(() => {
    if (trackingFromUrl) return;
    try {
      const raw = sessionStorage.getItem('escrowCheckoutData');
      if (!raw) return;
      const parsed = JSON.parse(raw) as CheckoutResponseData;
      if (parsed?.trackingCode) setTrackingCode(parsed.trackingCode);
    } catch {}
  }, [trackingFromUrl]);

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
        <Text size='large' as='h1' className="text-lg font-bold mb-4 ">Withdraw Successful</Text>
      
        <Text size='medium' as='p' className="text-gray-600 my-10">
        We are processing your withdraw. Transaction should be completed within the next 24 hours        </Text>
      
        
      </div>
<Button
          variant="primary"
          className="my-6 md:w-96 w-full m-auto"
          size='lg'
          onClick={() => router.push(trackingCode ? `/track?trackingCode=${encodeURIComponent(trackingCode)}` : `/track`)}
        >
          Dashboard
        </Button>
        <div className='bg-linear-to-r from-gray-100 via-gray-200 to-purple-300 flex rounded-2xl overflow-hidden w-full max-w-md'>
                    <div className='text-left flex flex-col gap-2 p-4 justify-between flex-1'>
                        <Text size='medium' as='p' className='text-xl text-purple-900' style={{ fontWeight: '500' }}>Go beyond limits</Text>
                        <Text size='small' as='p' className='text-gray-600 text-sm'>Enjoy seamless Escrow and lightning-fast transactions on the XedlaPay app</Text>
                        <Button variant='primary' size='sm' className='w-fit mt-2'>Get the app</Button>
                    </div>
                    <div className='shrink-0'>
                        <Image src='/images/phone.svg' alt='phone' width={160} height={160} className='object-contain' />
                    </div>
                </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <SuspenseWrapper>
      <WithdrawSuccessContent />
    </SuspenseWrapper>
  );
}
