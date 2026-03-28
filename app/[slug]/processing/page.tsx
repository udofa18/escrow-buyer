'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { FiCheck, FiLock } from 'react-icons/fi';
import { MdLock } from 'react-icons/md';
import Text from '@/components/Text';
import SuspenseWrapper from '@/components/SuspenseWrapper';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { getCheckoutStatus } from '@/lib/storefront-api';
import { handleApiError } from '@/lib/error-handler';

function ProcessingContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('orderId') || '';
    const escrowId = searchParams.get('escrowId') || '';
    const trackingCode = searchParams.get('trackingCode') || '';
    const reference = searchParams.get('reference') || '';
    const params = useParams();
    const slug = params.slug as string;
    const [countdown, setCountdown] = useState(10);
    const timerStartedRef = useRef(false);
    const router = useRouter();
    const [statusText, setStatusText] = useState<string>('pending');
    const [errorText, setErrorText] = useState<string | null>(null);

    // Client-side countdown and auto-redirect (no server calls)
    useEffect(() => {
        if (!trackingCode || !reference) return;
        let cancelled = false;
        let interval: number | null = null;

        const tick = async () => {
            try {
                const data = await getCheckoutStatus(trackingCode, reference);
                if (cancelled) return;
                const sender = (data.senderPaymentStatus || '').toLowerCase();
                const status = (data.status || '').toLowerCase();
                setStatusText(sender || status || 'pending');
                setErrorText(null);
                if (sender === 'paid') {
                    router.replace(
                        `/${slug}/order-success?escrowId=${encodeURIComponent(escrowId)}`
                    );
                }
            } catch (e) {
                if (cancelled) return;
                setErrorText(handleApiError(e) || 'Failed to fetch status');
            }
        };

        tick();
        interval = window.setInterval(tick, 5000);
        return () => {
            cancelled = true;
            if (interval) window.clearInterval(interval);
        };
    }, [trackingCode, reference, router, slug, escrowId]);

    return (
        <div className=" max-w-7xl h-[calc(100vh-100px)] mx-auto flex flex-col  ">
            <Text size='medium' as='h1' className="text-sm font-bold  border-b border-gray-300 pb-3 shrink-0">Pay via Transfer</Text>
            <div className='flex-1 flex flex-col items-center justify-center gap-[48px] max-w-4xl mx-auto w-full  '>


                <div className="w-full items-center justify-center flex ">
                    {/* Progress Line with Animated Indicator */}
                    <div className="relative w-full max-w-2xl px-4">
                        {/* Horizontal Line */}
                        <div className="h-2 bg-gray-200 rounded-full  mx-10 relative overflow-hidden">
                            {/* Animated Green Movement */}
                            <div className="absolute  w-12  h-full animate-move-left-right">
                                <div className="w-12 h-full bg-green-800  shadow-lg"></div>
                            </div>
                        </div>

                        {/* Left Side - Checkmark with "Sent" */}
                        <div className="absolute -top-3 left-0 flex flex-col items-center">
                            <div className="w-8 h-8 bg-green-800 rounded-full flex items-center justify-center mb-2 shadow-md">
                                <FiCheck className="text-white" size={20} />
                            </div>
                            <span className="text-xs font-medium text-gray-700 whitespace-nowrap">Sent</span>
                        </div>

                        {/* Right Side - Dotted Circle with "Confirmed" */}
                        <div className="absolute -top-3 right-0 flex flex-col items-center">
                            <div className="relative w-8 h-8 mb-2">
                                {/* Dotted Circle */}
                                <svg className="w-8 h-8 animate-pulse-dot" viewBox="0 0 32 32">
                                    <circle
                                        cx="16"
                                        cy="16"
                                        r="14"
                                        fill="none"
                                        stroke="black"
                                        strokeWidth="2"
                                        strokeDasharray="8 2"
                                    />
                                </svg>
                            </div>
                            <span className="text-xs font-medium text-gray-700 whitespace-nowrap">Confirmed</span>
                        </div>
                    </div>
                </div>

                <div className='w-full flex items-center justify-center'>
                    <div className="text-center max-w-md px-4">
                        <Text size='large' as='h1' className="text-xl font-bold mb-3">Processing your payment</Text>
                        <Text size='small' as='p' className="text-gray-600 mb-2 text-sm">
                            We're verifying your transfer and will redirect you automatically as soon as your funds are secured in Escrow.
                        </Text>
                        {trackingCode && reference && (
                            <Text size="small" as="p" className="text-gray-600 mt-3">
                                Status: <span className="font-medium capitalize">{statusText}</span>
                            </Text>
                        )}
                        {errorText && (
                            <Text size="small" as="p" className="text-red-600 mt-2">
                                {errorText}
                            </Text>
                        )}
                       
                    </div>
                </div>
            
              
            </div>
              <div className="text-center text-sm text-gray-500 ">
                    <Text size='small' as='p' className='flex items-center justify-center gap-2 py-2'><MdLock size={20} /> Secured by VFD</Text>
        </div>
           
        </div>
    );
}

export default function ProcessingPage() {
    return (
        <SuspenseWrapper>
            <ProcessingContent />
        </SuspenseWrapper>
    );
}
