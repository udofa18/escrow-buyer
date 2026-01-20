'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FiArrowLeft, FiCheck } from 'react-icons/fi';
import { orderApi, discountApi } from '@/lib/api-client';
import { ContactInfo, Order } from '@/types';
import Button from '@/components/Button';
import { handleApiError } from '@/lib/error-handler';
import { useCart } from '@/hooks/useCart';
import { MdEmail, MdOutlineEmail, MdOutlineHouse, MdOutlinePhone, MdPhone } from 'react-icons/md';
import { RiBankLine } from 'react-icons/ri';

export default function CheckoutReviewPage() {
    const router = useRouter();
    const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
    const [discountCode, setDiscountCode] = useState('');
    const [appliedDiscount, setAppliedDiscount] = useState<{ code: string; discount: number } | null>(null);
    const [loading, setLoading] = useState(true);
    const [applyingDiscount, setApplyingDiscount] = useState(false);
    const [creatingOrder, setCreatingOrder] = useState(false);

    // Use the cart hook
    const {
        cart,
        subtotal,
    } = useCart();

    useEffect(() => {
        loadContactInfo();
    }, []);

    const loadContactInfo = () => {
        const storedContactInfo = sessionStorage.getItem('contactInfo');
        if (storedContactInfo) {
            setContactInfo(JSON.parse(storedContactInfo));
        } else {
            router.push('/checkout/contact');
            return;
        }
        setLoading(false);
    };

    const handleApplyDiscount = async () => {
        if (!discountCode.trim()) return;
        setApplyingDiscount(true);
        try {
            const discount = await discountApi.validate(discountCode);
            setAppliedDiscount({ code: discount.code, discount: discount.discount });
        } catch (error) {
            console.error('Failed to apply discount:', handleApiError(error));
            alert('Invalid discount code');
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
        
        setCreatingOrder(true);
        try {
            console.log('Creating order with:', { 
                contactInfo, 
                discountCode: appliedDiscount?.code,
                cartItems: cart.length 
            });
            const order = await orderApi.create(contactInfo, appliedDiscount?.code, cart);
            // Store full order data in sessionStorage as backup
            sessionStorage.setItem('orderId', order.id);
            sessionStorage.setItem('orderData', JSON.stringify(order));
            router.push(`/transfer?orderId=${order.id}`);
        } catch (error) {
            const errorMessage = handleApiError(error);
            console.error('Failed to create order:', error);
            alert(errorMessage);
        } finally {
            setCreatingOrder(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-lg">Loading...</div>
            </div>
        );
    }

    if (!contactInfo || cart.length === 0) {
        return null;
    }

    const discountAmount = appliedDiscount
        ? (subtotal * appliedDiscount.discount) / 100
        : 0;
    const total = subtotal - discountAmount;

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-4xl mx-auto px-4 py-6">
               

                <h1 className="text-sm font-bold mb-6 border-b border-gray-300 pb-4">Review your order</h1>

                <div className="flex flex-col  gap-6">
                    {/* Order Items */}
                    <div className="md:col-span-2 space-y-4">


                        {/* Contact Information */}
                        <div className=" ">
                            <div className="space-y-2  text-gray-500">
                                <p className='font-bold text-black uppercase'>{contactInfo.fullName}</p>
                                <p className='flex items-center gap-4'><MdOutlineEmail size={20} /> {contactInfo.email}</p>
                                <p className='flex items-center gap-4'><MdOutlinePhone size={20} /> {contactInfo.phone}</p>
                                <span className='flex  gap-4'><RiBankLine size={20} />                                 <p className='flex flex-col items-center gap-4'> {contactInfo.accountDetails} <br /> {contactInfo.bankName}</p>
                                </span>

                            </div>
                        </div>
                    </div>
                    <div className="rp-6 border-t border-gray-300 pt-4">
                        <h2 className="font-bold mb-4 uppercase">Order Summary</h2>
                        <div className="space-y-4">
                            {cart.map((item) => (
                                <div key={item.product.id} className="flex gap-4">

                                    <div className="flex items-center gap-4 justify-between w-full">
                                        <span className='flex items-center gap-4'>
                                            <p className="text-sm text-gray-600">{item.quantity} x</p>

                                            <h3 className="">{item.product.name}</h3>
                                        </span>  <p className="">
                                            ₦ {(item.product.price * item.quantity).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between font-bold  pt-4 ">
                            <span>Subtotal</span>
                            <span className="">
                                ₦ {subtotal.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                    </div>
                    {/* Order Summary */}
                    <div className="md:col-span-1 border-t border-gray-300 pt-4">
                        <div className=" rounded-lg  sticky top-6 my-8">
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
                        <div className=" rounded-lg  sticky top-6 my-8">
                            <h2 className=" font-bold mb-4 uppercase">Custom note</h2>

                            <p className='text-gray-500'>{(contactInfo as any).note || 'No custom note provided'}</p>
                        </div></div>
                    <div className="flex flex-col gap-2 my-8 border-t border-gray-300 pt-4">
                        <p> Have a discount code? </p>
                        <div className='flex items-center gap-2'>
                          {!appliedDiscount ? (
                           <><input
                                    type="text"
                                    value={discountCode}
                                    onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                                    placeholder="Enter code"
                                    className="flex-1 px-3 py-2  bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5D0C97]"
                                    disabled={!!appliedDiscount} /><Button
                                        variant="secondary"
                                        size="md"
                                        onClick={handleApplyDiscount}
                                        isLoading={applyingDiscount}
                                    >
                                        Apply
                                    </Button></>
                            ) : (
                                <div className='flex items-center gap-2 justify-between w-full'>
                                    <div className='flex flex-col '>
                                    <p> {appliedDiscount.discount}% OFF</p>
                                <p>You've saved <span className='text-green-600'>₦ {discountAmount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span>!!</p>
                               </div> 
                               <Button
                                    variant="ghost"
                                    className='underline font-bold'
                                    size="sm"
                                    onClick={() => {
                                        setAppliedDiscount(null);
                                        setDiscountCode('');
                                    }}
                                >
                                    Remove
                                </Button>
                                </div>
                            )

                            }
                        </div></div>
                  

               

                <div className="flex flex-col-reverse gap-4">
                    <Button
                        variant="outline"
                        onClick={() => router.back()}
                        className="flex-1"
                    >
                        Back
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handlePay}
                        isLoading={creatingOrder}
                        className="flex-1"
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
