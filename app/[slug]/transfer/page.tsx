'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { FiCopy, FiCheck, FiArrowLeft } from 'react-icons/fi';
import { paymentApi, orderApi } from '@/lib/api-client';
import { PaymentAccount } from '@/types';
import type { CheckoutResponseData } from '@/types';
import Button from '@/components/Button';
import { handleApiError } from '@/lib/error-handler';
import { useCart } from '@/hooks/useCart';
import { MdLock } from 'react-icons/md';
import Text from '@/components/Text';
import Input from '@/components/Input';
import SuspenseWrapper from '@/components/SuspenseWrapper';
import LogoOrbitLoader from '@/components/Loader';
function TransferContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const orderId = searchParams.get('orderId') || '';
    const escrowId = searchParams.get('escrowId') || '';
    const params = useParams();
    const slug = params.slug as string;
    const [account, setAccount] = useState<PaymentAccount | null>(null);
    const [payAmount, setPayAmount] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState<string | null>(null);
    const [confirming, setConfirming] = useState(false);
    const [cancelling, setCancelling] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(600); // 10 minutes in seconds
    const [orderExists, setOrderExists] = useState<boolean | null>(null);
    const { cart, subtotal } = useCart();

    useEffect(() => {
        if (escrowId) {
            const raw = typeof window !== 'undefined' ? sessionStorage.getItem('escrowCheckoutData') : null;
            if (raw) {
                try {
                    const data: CheckoutResponseData = JSON.parse(raw);
                    setAccount({
                        accountName: data.accountName,
                        accountNumber: data.accountNumber,
                        bankName: data.bankName,
                    });
                    setPayAmount(data.amount);
                    setOrderExists(true);
                } catch (e) {
                    console.error('Failed to parse escrow checkout data', e);
                }
            }
            setLoading(false);
        } else if (orderId) {
            loadAccount();
            verifyOrder();
        }
    }, [orderId, escrowId]);

    const verifyOrder = async () => {
        if (!orderId) return;
        try {
            const order = await orderApi.getById(orderId);
            setOrderExists(true);
        } catch (error) {
            setOrderExists(false);
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
            setPayAmount(subtotal);
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

    const effectiveOrderId = escrowId || orderId;

    const handleConfirmPayment = async () => {
        if (!effectiveOrderId) {
            alert('Payment reference is missing. Please go back and try again.');
            return;
        }
        setConfirming(true);
        try {
            if (escrowId) {
                const stored = sessionStorage.getItem('escrowCheckoutData');
                const checkoutData = stored ? (JSON.parse(stored) as CheckoutResponseData) : null;
                const trackingCode = checkoutData?.trackingCode;
                const reference = checkoutData?.reference;
                if (!trackingCode || !reference) {
                    alert('Tracking code/reference is missing. Please restart checkout.');
                    return;
                }
                router.push(
                    `/${slug}/processing?escrowId=${encodeURIComponent(
                        escrowId
                    )}&trackingCode=${encodeURIComponent(trackingCode)}&reference=${encodeURIComponent(reference)}`
                );
                return;
            } else {
                const storedOrderData = sessionStorage.getItem('orderData');
                let orderData = null;
                if (storedOrderData) {
                    try {
                        orderData = JSON.parse(storedOrderData);
                    } catch (e) {}
                }
                try {
                    await orderApi.getById(orderId);
                } catch (error) {
                    if (!orderData) {
                        alert('Order not found. Please go back and create a new order.');
                        setConfirming(false);
                        return;
                    }
                }
                await paymentApi.confirm(orderId, orderData);
            }
            router.push(`/${ slug}/processing?orderId=${effectiveOrderId}`);
        } catch (error) {
            const errorMessage = handleApiError(error);
            alert(errorMessage || 'Failed to confirm payment. Please try again.');
        } finally {
            setConfirming(false);
        }
    };

    const handleCancelPayment = async () => {
        if (!confirm('Are you sure you want to cancel this payment?')) return;
        setCancelling(true);
        try {
            if (escrowId) {
                await paymentApi.cancel(escrowId);
            } else {
                await paymentApi.cancel(orderId);
            }
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
            <LogoOrbitLoader showBackground />

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
        <div className="">
            <div className="max-w-2xl mx-auto ">
               

                <Text size='medium' className="font-bold mb-6 border-b border-gray-300 pb-4">Pay via Transfer</Text>
                <Text size="medium" className="mb-6 text-center px-10">
                    Send ₦ {(payAmount || subtotal).toLocaleString('en-NG', { minimumFractionDigits: 2 })} to the account below
                </Text>
                <div className="bg-gray-100  rounded-lg p-6 mb-6">


                    <div className="space-y-4">
                        <div>
                            <Text size="small" as="p" className="block text-[#6E6376] font-medium">
                                Bank Name
                            </Text>
                            <Text size="medium" as="p" className="text-gray-600">
                                {account.bankName}
                            </Text>
                        </div>

                        <div>
                            <Text size="small" as="p" className="block text-[#6E6376] font-medium">
                                Account Name
                            </Text>
                            <div className="flex items-center justify-between gap-2">
                                <Text size="medium" as="p" className="text-gray-600 flex-1">
                                    {account.accountName}
                                </Text>
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
                            <Text size="small" as="p" className="block text-[#6E6376] font-medium">
                                Account Number
                            </Text>
                            <div className="flex items-center gap-2">
                                <Text
                                    size="medium"
                                    as='p'
                                    className="flex-1 text-gray-600"
                                    children={account.accountNumber}
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
                            <Text size='small' as='p' className="block text-[#6E6376] font-medium ">
                                Amount
                            </Text>
                            <div className="flex items-center gap-2">
                                <Text
                                    size="medium"
                                    as='p'
                                    className="flex-1 text-gray-600"
                                    children={`₦ ${(payAmount || subtotal).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`}
                                />

                            </div>
                        </div>
                    </div>
                </div>
                <div className=" py-8">
                    <Text size='small' as='p' className=" text-sm">This account is unique to this transaction and expires in <span className="text-purple-800 font-bold">{formatTime(timeRemaining)}</span></Text>
                </div>
                <div className="flex flex-col-reverse gap-4">
                    <Button
                        variant="secondary"
                        size='lg'
                        onClick={handleCancelPayment}
                        isLoading={cancelling}
                        className=""
                    >
                        Cancel Payment
                    </Button>
                    <Button
                        variant="primary"
                        size='lg'
                        onClick={handleConfirmPayment}
                        isLoading={confirming}
                        className=""
                    >
                        I have paid
                    </Button>
                </div>

                <div className="text-center text-sm text-gray-500 mt-20">
                    <p className='flex items-center justify-center gap-2 py-2'><MdLock size={20} /> Secured by VFD</p>
                    <p>Funds are held securely until your order is delivered.</p>
        </div>
      </div>
    </div>
  );
}

export default function TransferPage() {
    return (
        <SuspenseWrapper>
            <TransferContent />
        </SuspenseWrapper>
    );
}
