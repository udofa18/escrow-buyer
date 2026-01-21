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
import Text from '@/components/Text';
import { BiDownArrow, BiDownArrowAlt } from 'react-icons/bi';
import { FaAngleDown } from 'react-icons/fa6';
import Input from '@/components/Input';
export default function CheckoutReviewPage() {
    const router = useRouter();
    const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
    const [discountCode, setDiscountCode] = useState('');
    const [appliedDiscount, setAppliedDiscount] = useState<{ code: string; discount: number } | null>(null);
    const [loading, setLoading] = useState(true);
    const [applyingDiscount, setApplyingDiscount] = useState(false);
    const [creatingOrder, setCreatingOrder] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    // Use the cart hook
    const {
        cart,
        subtotal,
    } = useCart();

    useEffect(() => {
        loadContactInfo();
    }, []);

    const loadContactInfo = () => {
        try {
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
            
            // Store full order data in sessionStorage as backup (with error handling)
            try {
                if (typeof window !== 'undefined' && window.sessionStorage) {
                    sessionStorage.setItem('orderId', order.id);
                    sessionStorage.setItem('orderData', JSON.stringify(order));
                }
            } catch (storageError) {
                console.warn('Failed to save order to sessionStorage:', storageError);
                // Continue anyway - the order was created successfully
            }
            
            router.push(`/transfer?orderId=${order.id}`);
        } catch (error) {
            const errorMessage = handleApiError(error);
            console.error('Failed to create order:', error);
            alert(errorMessage || 'Failed to create order. Please try again.');
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

    if (!contactInfo) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-lg mb-4">Contact information not found</p>
                    <Button onClick={() => router.push('/checkout/contact')}>
                        Go to Contact Form
                    </Button>
                </div>
            </div>
        );
    }

    if (cart.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-lg mb-4">Your cart is empty</p>
                    <Button onClick={() => router.push('/')}>
                        Continue Shopping
                    </Button>
                </div>
            </div>
        );
    }

    const discountAmount = appliedDiscount
        ? (subtotal * appliedDiscount.discount) / 100
        : 0;
    const total = subtotal - discountAmount;

    return (
        <div className="min-h-screen bg-white">
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
                        <div className='flex items-center gap-2 mt-2 w-full'>
                        {showDropdown && (<div className='flex w-full gap-[12px]'>

                          {!appliedDiscount ? (
                           <><Input
                                    value={discountCode}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDiscountCode(e.target.value.toUpperCase())}
                                    name='discountCode'
                                    placeholder="Enter code"
                                    className=""
                                    disabled={!!appliedDiscount} />
                                    
                                    <Button
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
                        </div>
                        )}</div></div>
                  

               

                <div className="flex flex-col-reverse gap-4">
                    <Button
                        variant="outline"
                        size='lg'
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
