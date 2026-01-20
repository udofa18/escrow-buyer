'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FiCopy, FiCheck, FiArrowLeft } from 'react-icons/fi';
import { paymentApi, orderApi } from '@/lib/api-client';
import { PaymentAccount } from '@/types';
import Button from '@/components/Button';
import { handleApiError } from '@/lib/error-handler';
import { useCart } from '@/hooks/useCart';
import { MdLock } from 'react-icons/md';

function TransferContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const orderId = searchParams.get('orderId') || '';

    const [account, setAccount] = useState<PaymentAccount | null>(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState<string | null>(null);
    const [confirming, setConfirming] = useState(false);
    const [cancelling, setCancelling] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(600); // 10 minutes in seconds
    const [orderExists, setOrderExists] = useState<boolean | null>(null);
    const {
        cart,
        subtotal,
    } = useCart();


    useEffect(() => {
        if (orderId) {
            console.log('Transfer page loaded with orderId:', orderId);
            loadAccount();
            verifyOrder();
        }
    }, [orderId]);

    const verifyOrder = async () => {
        if (!orderId) return;
        try {
            const order = await orderApi.getById(orderId);
            setOrderExists(true);
            console.log('Order verified:', order.id, order.status);
        } catch (error) {
            setOrderExists(false);
            console.error('Order verification failed:', error);
            console.warn('OrderId from URL:', orderId);
            console.warn('OrderId from sessionStorage:', sessionStorage.getItem('orderId'));
        }
    };

    // Countdown timer
    useEffect(() => {
        if (timeRemaining <= 0) {
            // Redirect to previous page when timer reaches 0
            router.back();
            return;
        }

        const timer = setInterval(() => {
            setTimeRemaining((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeRemaining, router]);

    // Format time as MM:SS
    const formatTime = (seconds: number): string => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    const loadAccount = async () => {
        try {
            const accountData = await paymentApi.getAccount(orderId);
            setAccount(accountData);
        } catch (error) {
            console.error('Failed to load account:', handleApiError(error));
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = (text: string, field: string) => {
        navigator.clipboard.writeText(text);
        setCopied(field);
        setTimeout(() => setCopied(null), 2000);
    };

    const handleConfirmPayment = async () => {
        if (!orderId) {
            alert('Order ID is missing. Please go back and try again.');
            return;
        }
        
        setConfirming(true);
        try {
            console.log('Confirming payment for order:', orderId);
            
            // Get order data from sessionStorage as fallback
            const storedOrderData = sessionStorage.getItem('orderData');
            let orderData = null;
            if (storedOrderData) {
                try {
                    orderData = JSON.parse(storedOrderData);
                    console.log('Found order data in sessionStorage');
                } catch (e) {
                    console.warn('Failed to parse stored order data');
                }
            }
            
            // Try to verify order exists first
            try {
                const order = await orderApi.getById(orderId);
                console.log('Order found before confirmation:', order.id, order.status);
            } catch (error) {
                console.warn('Order not found on server, will use sessionStorage data as fallback');
                if (!orderData) {
                    alert('Order not found. The order may have expired. Please go back and create a new order.');
                    setConfirming(false);
                    return;
                }
            }
            
            // Call payment confirmation with order data as fallback
            // We'll need to modify the API call to send order data
            await paymentApi.confirm(orderId, orderData);
            router.push(`/processing?orderId=${orderId}`);
        } catch (error) {
            const errorMessage = handleApiError(error);
            console.error('Failed to confirm payment:', error);
            console.error('Error details:', error);
            alert(errorMessage || 'Failed to confirm payment. The order may have expired. Please try creating a new order.');
        } finally {
            setConfirming(false);
        }
    };

    const handleCancelPayment = async () => {
        if (!confirm('Are you sure you want to cancel this payment?')) return;

        setCancelling(true);
        try {
            await paymentApi.cancel(orderId);
            router.push('/');
        } catch (error) {
            console.error('Failed to cancel payment:', handleApiError(error));
            alert('Failed to cancel payment. Please try again.');
        } finally {
            setCancelling(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-lg">Loading...</div>
            </div>
        );
    }

    if (!account) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-lg">Account information not found</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-2xl mx-auto px-4 py-6">
               

                <h1 className="text-sm font-bold mb-6 border-b border-gray-300 pb-4">Pay via Transfer</h1>
                <p className=" mb-6 text-center text-lg  px-10">
                    Send ₦ {subtotal.toLocaleString('en-NG', { minimumFractionDigits: 2 })} to Xedla Technology Limited          </p>
                <div className="bg-gray-100  rounded-lg p-6 mb-6">


                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-2">
                                Bank Name
                            </label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={account.accountName}
                                    readOnly
                                    className="flex-1 px-4 py-2 focus:outline-none"
                                />
                                <button
                                    onClick={() => handleCopy(account.accountName, 'name')}
                                    className="p-2 hover:bg-gray-200 text-gray-500 rounded-lg transition-colors"
                                >
                                    {copied === 'name' ? (
                                        <FiCheck className="text-green-600" size={20} />
                                    ) : (
                                        <FiCopy size={20} />
                                    )}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-2">
                                Account Number
                            </label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={account.accountNumber}
                                    readOnly
                                    className="flex-1 px-4 py-2  rounded-lg focus:outline-none"
                                />
                                <button
                                    onClick={() => handleCopy(account.accountNumber, 'number')}
                                    className="p-2 hover:bg-gray-200 text-gray-500 rounded-lg transition-colors"
                                >
                                    {copied === 'number' ? (
                                        <FiCheck className="text-green-600" size={20} />
                                    ) : (
                                        <FiCopy size={20} />
                                    )}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-2">
                                Amount
                            </label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={`₦ ${subtotal.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`}
                                    readOnly
                                    className="flex-1 px-4 py-2 rounded-lg focus:outline-none"
                                />

                            </div>
                        </div>
                    </div>
                </div>
                <div className=" py-8">
                    <p className=" text-sm">This account is unique to this transaction and expires in <span className="text-purple-800 font-bold">{formatTime(timeRemaining)}</span></p>
                </div>
                <div className="flex flex-col-reverse gap-4">
                    <Button
                        variant="secondary"
                        onClick={handleCancelPayment}
                        isLoading={cancelling}
                        className="flex-1"
                    >
                        Cancel Payment
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleConfirmPayment}
                        isLoading={confirming}
                        className="flex-1"
                    >
                        I have paid
                    </Button>
                </div>

                <div className="text-center text-sm text-gray-500 mt-20">
                    <p className='flex items-center justify-center gap-2 py-2'><MdLock size={20} /> Secured by XedlaPay Escrow</p>
                    <p>Funds are held securely until your order is delivered.</p>
        </div>
      </div>
    </div>
  );
}

export default function TransferPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-lg">Loading...</div>
            </div>
        }>
            <TransferContent />
        </Suspense>
    );
}
