'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FiTrash2, FiPlus, FiMinus, FiArrowLeft, FiShoppingBag } from 'react-icons/fi';
import Button from '@/components/Button';
import { useCart } from '@/hooks/useCart';
import { IoMdClose } from 'react-icons/io';

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
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
            <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Add some products to get started</p>
            <Button variant="primary" onClick={() => router.push('/')}>
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-6">
       
        <div className="flex items-center gap-2 mb-6 border-b border-gray-300  justify-between">
       
        <h1 className="text-sm font-bold  border-gray-300 pb-4"> Cart</h1>
 <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6"
        >
          <IoMdClose size={20} />
        </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="md:col-span-2 space-y-4">
            {cart.map((item) => (
              <div
                key={item.product.id}
                className="bg-white flex gap-4"
              >
                <div className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden shrink-0">
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
                  <h5 className="font-semibold mb-1 text-sm">{item.product.name}</h5>
                  <p className="  mb-3">
                    ₦ {(item.product.price * item.quantity).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                  </p>
  
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
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        removeFromCart(item.product.id);
                      }}
                      disabled={updating === item.product.id || removing === item.product.id}
                      className="text-red-600 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FiTrash2 size={20} />
                    </button>
                  </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="md:col-span-1">
            <div className="   sticky ">
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span>Fees </span>
                  <span>₦ 1000</span>
                </div>
                <div className="flex justify-between font-bold text-base pt-4 ">
                  <span>Order Total</span>
                  <span className="text-[#5D0C97]">
                    ₦ {subtotal.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                  </span>
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
