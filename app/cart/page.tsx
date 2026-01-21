'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FiTrash2, FiPlus, FiMinus, FiArrowLeft, FiShoppingBag } from 'react-icons/fi';
import Button from '@/components/Button';
import { useCart } from '@/hooks/useCart';
import { IoMdClose } from 'react-icons/io';
import Text from '@/components/Text';
import LogoOrbitLoader from '@/components/Loader';

export default function CartPage() {
  const router = useRouter();
  
  // Use the cart hook
  const {
    cart,
    loading,
    updating,
    removing,
    itemCount,
    subtotal,
    updateQuantity,
    removeFromCart,
  } = useCart();

  if (loading) {
    return (
        <LogoOrbitLoader showBackground />

    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen ">
        <div className="max-w-7xl mx-auto ">
          <Button
            variant="ghost"
            onClick={() => router.push('/')}
            className="mb-6"
          >
            <FiArrowLeft size={20} />
            Back to Store
          </Button>
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <FiShoppingBag size={64} className="text-gray-400 mb-4" />
            <Text size='large' className="text-2xl font-bold mb-2">Your cart is empty</Text>
            <Text size='medium' className="text-gray-600 mb-6">Add some products to get started</Text>
            <Button variant="primary" onClick={() => router.push('/')}>
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-scroll relative">
      <div className="max-w-7xl mx-auto ">
       
        <div className="flex items-center gap-2 mb-6 border-b border-gray-300  justify-between">
       
        <Text size='medium' as='h1' className="font-bold  border-gray-300 pb-4"> Cart</Text>
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className=""
        >
          <IoMdClose size={16} />
        </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-6 pb-32 md:pb-0">
          {/* Cart Items */}
          <div className="md:col-span-2 space-y-4">
            {cart.map((item) => (
              <div
                key={item.product.id}
                className="bg-white flex gap-4"
              >
                <div className="relative w-[56px] h-[56px] bg-gray-100 rounded-[8px] overflow-hidden shrink-0">
                  <Image
                    src={item.product.image}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder-product.jpg';
                    }}
                  />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <Text size='medium' className="font-semibold mb-1">{item.product.name}</Text>
                  <Text size='medium' className="  mb-3">
                    ₦ {(item.product.price * item.quantity).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                  </Text>
  
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 rounded-full bg-gray-100 ">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          updateQuantity(item.product.id, item.quantity - 1);
                        }}
                        disabled={updating === item.product.id || removing === item.product.id}
                        className="p-2  disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <FiMinus size={16} className='border rounded-full ' />
                      </button>
                      <span className="px-3 py-2">{item.quantity}</span>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          updateQuantity(item.product.id, item.quantity + 1);
                        }}
                        disabled={updating === item.product.id || removing === item.product.id}
                        className="p-2  disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <FiPlus size={16} className='border rounded-full ' />
                      </button>
                    </div>

                  </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="md:col-span-1 shadow-gray-800 fixed  h-[210px] w-full md:sticky  bottom-0 left-0 p-4 md:shadow-none shadow-lg">
            <div className="   sticky ">
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <Text size='medium'>Fees </Text>
                  <Text size='medium'>₦ 1000</Text>
                </div>
                <div className="flex justify-between  text-base pt-4 ">
                  <Text>Order Total</Text>
                  <Text  className=" font-bold">
                    ₦ {subtotal.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                  </Text>
                </div>
              </div>
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                onClick={() => router.push('/checkout/contact')}
              >
                Go to Checkout
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
