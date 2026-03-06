'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FiArrowLeft, FiCheck } from 'react-icons/fi';
import { ContactInfo, Order } from '@/types';
import type { EscrowDiscount } from '@/types';
import Button from '@/components/Button';
import { handleApiError } from '@/lib/error-handler';
import { useCart } from '@/hooks/useCart';
import { MdOutlineEmail, MdOutlinePhone } from 'react-icons/md';
import { RiBankLine } from 'react-icons/ri';
import Text from '@/components/Text';
import { FaAngleDown } from 'react-icons/fa6';
import Input from '@/components/Input';
import LogoOrbitLoader from '@/components/Loader';
import { getDiscountByCode, postCheckout } from '@/lib/storefront-api';

export default function CheckoutReviewPage() {
    const router = useRouter();
    const params = useParams();
    const slug = params.slug as string;
    const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
    const [discountCode, setDiscountCode] = useState('');
    const [appliedDiscount, setAppliedDiscount] = useState<EscrowDiscount | null>(null);
    const [discountError, setDiscountError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [applyingDiscount, setApplyingDiscount] = useState(false);
    const [creatingOrder, setCreatingOrder] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);

    const { cart, subtotal } = useCart();

    const { discountAmount, total } = useMemo(() => {
        if (!appliedDiscount) {
            return { discountAmount: 0, total: subtotal };
        }
        const d = appliedDiscount;
        const targetIds = d.targetType === 'product' && d.targetProducts?.length
            ? new Set(d.targetProducts.map((p) => p._id))
            : null;
        const eligibleSubtotal = targetIds
            ? cart.reduce((sum, item) => (targetIds.has(item.product.id) ? sum + item.product.price * item.quantity : sum), 0)
            : subtotal;
        let amount = 0;
        if (d.type === 'fixed') {
            amount = Math.min(d.value, eligibleSubtotal);
        } else {
            amount = (eligibleSubtotal * d.value) / 100;
        }
        return { discountAmount: amount, total: Math.max(0, subtotal - amount) };
    }, [appliedDiscount, cart, subtotal]);

    useEffect(() => {
        loadContactInfo();
    }, []);

    const loadContactInfo = () => {
        try {
            setLoading(true);

            // Check if sessionStorage is available (handles SSR and private browsing)
            if (typeof window === 'undefined' || !window.sessionStorage) {
                console.warn('sessionStorage is not available');
                router.push('/checkout/contact');
                setLoading(false);
                return;
            }

            const storedContactInfo = sessionStorage.getItem('contactInfo');
            if (storedContactInfo) {
                try {
                    const parsed = JSON.parse(storedContactInfo);
                    setContactInfo(parsed);
                } catch (parseError) {
                    console.error('Failed to parse contact info from sessionStorage:', parseError);
                    // Clear corrupted data
                    sessionStorage.removeItem('contactInfo');
                    router.push('/checkout/contact');
                }
            } else {
                router.push('/checkout/contact');
                return;
            }
        } catch (error) {
            console.error('Error loading contact info:', error);
            router.push('/checkout/contact');
        } finally {
            setLoading(false);
        }
    };

    const handleApplyDiscount = async () => {
        const code = discountCode.trim().toUpperCase();
        if (!code) return;
        setApplyingDiscount(true);
        setDiscountError(null);
        try {
            const discount = await getDiscountByCode(code);
            if (!discount.isActive || discount.status !== 'active') {
                setDiscountError('This discount code is no longer active.');
                setAppliedDiscount(null);
                return;
            }
            const now = new Date();
            const from = new Date(discount.validFrom);
            const until = new Date(discount.validUntil);
            if (now < from) {
                setDiscountError(`This code is valid from ${from.toLocaleDateString()}.`);
                setAppliedDiscount(null);
                return;
            }
            if (now > until) {
                setDiscountError('This discount code has expired.');
                setAppliedDiscount(null);
                return;
            }
            if (subtotal < (discount.minOrderAmount || 0)) {
                setDiscountError(`Minimum order amount is ₦ ${(discount.minOrderAmount || 0).toLocaleString('en-NG')}.`);
                setAppliedDiscount(null);
                return;
            }
            setAppliedDiscount(discount);
        } catch (error) {
            const msg = handleApiError(error);
            setDiscountError(msg || 'Invalid discount code');
            setAppliedDiscount(null);
        } finally {
            setApplyingDiscount(false);
        }
    };

    const handlePay = async () => {
        if (!contactInfo) {
            alert('Contact information is missing. Please go back and fill in your details.');
            return;
        }
        if (cart.length === 0) {
            alert('Your cart is empty. Please add items before checkout.');
            router.push('/');
            return;
        }
        if (!contactInfo.bankCode) {
            alert('Please go back and select your bank so we can verify your account.');
            return;
        }

        setCreatingOrder(true);
        try {
            const body = {
                name: contactInfo.fullName,
                email: contactInfo.email,
                phoneNumber: contactInfo.phone,
                address: contactInfo.address || contactInfo.deliveryAddress || '',
                productsIds: cart.map((item) => ({
                    productId: item.product.id,
                    quantity: item.quantity,
                })),
                accountNumber: contactInfo.accountDetails.trim(),
                bankCode: contactInfo.bankCode,
                ...(appliedDiscount?.code ? { discountCode: appliedDiscount.code } : {}),
                ...(contactInfo.note ? { note: contactInfo.note } : {}),
            };
            const checkoutData = await postCheckout(body);
            try {
                if (typeof window !== 'undefined' && window.sessionStorage) {
                    sessionStorage.setItem('escrowCheckoutData', JSON.stringify(checkoutData));
                }
            } catch (e) {
                console.warn('Failed to save checkout to sessionStorage', e);
            }
            router.push(`/${ slug}/transfer?escrowId=${encodeURIComponent(checkoutData.escrowId)}`);
        } catch (error) {
            const errorMessage = handleApiError(error);
            console.error('Checkout failed:', error);
            alert(errorMessage || 'Checkout failed. Please try again.');
        } finally {
            setCreatingOrder(false);
        }
    };

    if (loading) {
        return (
            <LogoOrbitLoader showBackground />

        );
    }

    if (!contactInfo) {
        return (
           <div className="min-h-screen ">
            <div className="max-w-4xl mx-auto ">
               

                <Text size='medium' className="font-bold mb-6 border-b border-gray-300 pb-4">Contact information not found</Text>

                <Button onClick={() => router.push(`/${ slug}/checkout/contact`)}>
                    Go to Contact Form
                </Button>
            </div>
        </div>
        );
    }

    return (
        <div className="min-h-screen ">
            <div className="max-w-4xl mx-auto ">
               

                <Text size='medium' className="font-bold mb-6 border-b border-gray-300 pb-4">Review your order</Text>

                <div className="flex flex-col  gap-6">
                    {/* Order Items */}
                    <div className="md:col-span-2 space-y-4">


                        {/* Contact Information */}
                        <div className=" ">
                            <div className="space-y-2  text-gray-500">
                                <Text size='medium' className='font-bold text-black uppercase'>{contactInfo.fullName}</Text>
                                <Text size='medium' className='flex items-center gap-4'><MdOutlineEmail size={20} /> {contactInfo.email}</Text>
                                <Text size='medium' className='flex items-center gap-4'><MdOutlinePhone size={20} /> {contactInfo.phone}</Text>
                                <span className='flex  gap-4'><RiBankLine size={20} />                                 <Text size='medium' className='flex flex-col items-center gap-4'> {contactInfo.accountDetails} <br /> {contactInfo.bankName}</Text>
                                </span>

                            </div>
                        </div>
                    </div>
                    <div className="rp-6 border-t border-gray-300 pt-4">
                        <Text size='medium' className="font-bold mb-4 uppercase">Order Summary</Text>
                        <div className="space-y-4">
                            {cart.map((item) => (
                                <div key={item.product.id} className="flex gap-4">

                                    <div className="flex items-center gap-4 justify-between w-full">
                                        <div className='flex flex-col gap-2'>
                                        <span className='flex items-center gap-4'>

                                            <Text size='medium' className="">{item.product.name}</Text>
                                        </span>  <Text size='medium' className="text-[#6E6376]">
                                            ₦ {(item.product.price * item.quantity).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                                        </Text>
</div>
                                        <Text size='medium' className="">{item.quantity} </Text>

                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between font-bold  pt-4 ">
                            <Text size='medium'>Total</Text>
                            <Text size='medium' className="text-[#6E6376]">
                                ₦ {subtotal.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                            </Text>
                        </div>
                    </div>
                    {/* Order Summary */}
                    <div className="md:col-span-1 border-t border-gray-300 pt-4">
                        <div className=" rounded-lg  sticky top-6 ">
                            <h2 className=" font-bold mb-4 uppercase">Delivery details</h2>

                            {/* Discount Code */}
                            <div className="mb-4">
                                <div className='my-2'>
                                    <p className='text-gray-400'> Timeline</p>
                                    <p> Same day delivery</p>
                                </div>
                                <div>
                                    <p className='text-gray-400'> Address</p>
                                    <p> {contactInfo.address}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="md:col-span-1 border-t border-gray-300 pt-4">
                        <div className=" rounded-lg  sticky top-6 my-2">
                            <Text size='medium' className=" font-bold mb-4 uppercase">Custom note</Text>

                            <Text size='medium' className='text-gray-500'>{(contactInfo as any).note || 'No custom note provided'}</Text>
                        </div></div>
                    <div className="flex flex-col gap-2 my-8 border-t border-gray-300 pt-4">
                        <span onClick={() => setShowDropdown(!showDropdown)} className='flex items-center gap-2'>
                        <Text size='medium'> Have a discount code? </Text>
                        <FaAngleDown size={15} className='float-right' />
                        </span>
                        <div className="flex flex-col gap-2 mt-2 w-full">
                            {discountError && (
                                <p className="text-red-500 text-sm">{discountError}</p>
                            )}
                            {showDropdown && (
                                <div className="flex w-full gap-[12px] flex-wrap">
                                    {!appliedDiscount ? (
                                        <>
                                            <Input
                                                value={discountCode}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                    setDiscountCode(e.target.value.toUpperCase());
                                                    setDiscountError(null);
                                                }}
                                                name="discountCode"
                                                placeholder="Enter code"
                                                className=""
                                                disabled={!!appliedDiscount}
                                            />
                                            <Button
                                                variant="secondary"
                                                size="md"
                                                onClick={handleApplyDiscount}
                                                isLoading={applyingDiscount}
                                            >
                                                Apply
                                            </Button>
                                        </>
                                    ) : (
                                        <div className="flex items-center gap-2 justify-between w-full">
                                            <div className="flex flex-col">
                                                <p className="font-medium">
                                                    {appliedDiscount.type === 'fixed'
                                                        ? `₦ ${appliedDiscount.value.toLocaleString('en-NG')} off`
                                                        : `${appliedDiscount.value}% off`}{' '}
                                                    ({appliedDiscount.code})
                                                </p>
                                                <p>
                                                    You've saved{' '}
                                                    <span className="text-green-600 font-medium">
                                                        ₦ {discountAmount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                                                    </span>
                                                </p>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                className="underline font-bold"
                                                size="sm"
                                                onClick={() => {
                                                    setAppliedDiscount(null);
                                                    setDiscountCode('');
                                                    setDiscountError(null);
                                                }}
                                            >
                                                Remove
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                  

               

                <div className="flex flex-col-reverse gap-4">
                    <Button
                        variant="outline"
                        size='lg'
                        onClick={() => router.back()}
                        className=""
                    >
                        Back
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handlePay}
                        isLoading={creatingOrder}
                        className=""
                        size="lg"
                    >
                        Pay
                        ₦ {total.toLocaleString('en-NG', { minimumFractionDigits: 2 })}

                    </Button>
                </div>
            </div>
        </div>
                </div >
           
    );
}
