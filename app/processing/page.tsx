'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { FiCheck, FiLock } from 'react-icons/fi';

function ProcessingContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('orderId') || '';

    const [countdown, setCountdown] = useState(10);
    const timerStartedRef = useRef(false);

    // Client-side countdown and auto-redirect (no server calls)
    useEffect(() => {
        if (timerStartedRef.current) {
            return;
        }

        timerStartedRef.current = true;
        console.log('🚀 Starting 10-second countdown timer...');
        
        // Countdown timer - update every second
        const countdownInterval = setInterval(() => {
            setCountdown((prev) => {
                const newValue = prev - 1;
                console.log(`⏳ Countdown: ${newValue} seconds remaining`);
                
                if (newValue <= 0) {
                    clearInterval(countdownInterval);
                    return 0;
                }
                return newValue;
            });
        }, 1000);
        
        // Redirect after 10 seconds
        const redirectTimer = setTimeout(() => {
            clearInterval(countdownInterval);
            console.log('⏰ 10 seconds elapsed! Redirecting to success page...');
            window.location.href = `/order-success?orderId=${orderId}`;
        }, 10000);

        return () => {
            clearTimeout(redirectTimer);
            clearInterval(countdownInterval);
        };
    }, [orderId]);

    return (
        <div className="min-h-screen px-4 py-6 ">
            <h1 className="text-sm font-bold mb-6 border-b border-gray-300 pb-4">Pay via Transfer</h1>
            <div className=' relative flex flex-col items-center min-h-[calc(100vh-100px)] justify-center  '>


                <div className="my-20 w-full mx-auto items-center justify-center flex">
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

                <div className='bg-white flex items-center justify-center'>
                    <div className="text-center max-w-md px-4">

                        <h1 className="text-xl font-bold mb-4">Processing your payment</h1>
                        <p className="text-gray-600 mb-2">
                            We're verifying your transfer and will redirect you automatically as soon as your funds are secured in Escrow.
                        </p>
                        <p className="text-sm text-purple-600 mt-4 font-bold">
                            Auto-completing in {countdown} seconds (test mode)...
                        </p>


                    </div>

                </div>

                <div className="text-center text-sm text-gray-500 mt-20 absolute  bottom-0 w-full">
                    <p className='flex items-center justify-center gap-2 py-2'><FiLock size={20} /> Secured by XedlaPay Escrow</p>
                </div>
                </div>
                
            </div>
    );
}

export default function ProcessingPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-lg">Loading...</div>
            </div>
        }>
            <ProcessingContent />
        </Suspense>
    );
}
