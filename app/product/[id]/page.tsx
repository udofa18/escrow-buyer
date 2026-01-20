'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { FiShoppingCart, FiArrowRight } from 'react-icons/fi';
import { productsApi } from '@/lib/api-client';
import { Product } from '@/types';
import Button from '@/components/Button';
import { handleApiError } from '@/lib/error-handler';
import { useCart } from '@/hooks/useCart';
import { RiTruckLine } from "react-icons/ri";
export default function ProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  
  // Use the cart hook
  const {
    addingToCart,
    itemCount,
    addToCart,
    isInCart,
    subtotal,

  } = useCart();

  useEffect(() => {
    loadProduct();
  }, [productId]);

  const loadProduct = async () => {
    try {
      const productData = await productsApi.getById(productId);
      setProduct(productData);
    } catch (error) {
      console.error('Failed to load product:', handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    try {
      await addToCart(product.id, quantity);
    //   router.push('/cart');
    } catch (error) {
      // Error is already handled in the hook
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Product not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6"> 
            <div className='flex items-center gap-2'>

            <Image className=" z-10 border rounded-full " src="/images/nior.png" alt="Noir Essentials" width={40} height={40} />
            <p className="font-medium">{product.store.name}</p>

            </div>

        <Button
          variant="ghost"
          onClick={() => router.back()}
          className=""
        >
          Visit store
          <FiArrowRight size={20} />

        </Button>

        </div>
   

        <div className="grid md:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="relative w-full aspect-square bg-gray-100 rounded-lg overflow-hidden">
            <Image
              src={product.image || " "}
              alt={product.name || " "}
              fill
              className="object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '';
              }}
            />
          </div>

          {/* Product Info */}
          <div>
            <h1 className="text-xl font-bold mb-4">{product.name}</h1>
            <p className="text-xl font-bold text-gray-700  ">
              ₦ {product.price.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
            </p>

            <div className='flex items-center gap-2 py-4'>
            <RiTruckLine className='text-gray-700' size={20} />
                <p className="text-sm text-gray-700">Same day delivery</p>
            </div>

            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Description</h2>
              <p className="text-gray-700">{product.description}</p>
            </div>

            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Store Information</h2>
              <p className="font-medium">{product.store.name}</p>
              <p className="text-sm text-gray-600">{product.store.address}</p>
            </div>

            {/* Quantity Selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Quantity</label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-100"
                >
                  -
                </button>
                <span className="text-lg font-semibold w-12 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-100"
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <Button
              variant="primary"
              size="lg"
              className="w-full mb-24"
              onClick={handleAddToCart}
              isLoading={!!addingToCart}
            >
              <FiShoppingCart size={20} />
              Add to Cart
            </Button>

            {itemCount > 0 && (
            <div className="fixed max-w-7xl m-auto h-26 bottom-0 left-0 right-0 bg-white text-white text-xs w-full flex items-center justify-center p-4 animate-slide-up z-50">
              <Button
                variant="primary"
                size="lg"
                className="md:w-96 w-full flex justify-between gap-40"
                onClick={() => router.push('/cart')}
              >
                <span className='w-full flex justify-between'>
                  <div className='flex gap-2 items-center'>
                    <p>Cart</p>
                    {itemCount} Item(s)
                  </div>
                  <div>
                    <p>₦ {subtotal.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</p>
                  </div>
                </span>
              </Button>
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}
