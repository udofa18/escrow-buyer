'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FiSearch, FiShoppingCart, FiMapPin, FiCheck, FiX } from 'react-icons/fi';
import { productsApi } from '@/lib/api-client';
import { Product } from '@/types';
import Button from '@/components/Button';
import { handleApiError } from '@/lib/error-handler';
import { useCart } from '@/hooks/useCart';

export default function StoreFront() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Use the cart hook
  const {
    cart,
    itemCount,
    addingToCart,
    addToCart,
    removeFromCart,
    isInCart,
      subtotal,
  } = useCart();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const productsData = await productsApi.getAll();
      setProducts(productsData);
    } catch (error) {
      console.error('Failed to load products:', handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  const store = products[0]?.store;

  // Filter products based on search query
  const filteredProducts = searchQuery.trim() === '' 
    ? products 
    : products.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );

  const handleSearchClick = () => {
    setShowSearch(true);
  };

  const handleCloseSearch = () => {
    setShowSearch(false);
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-white z-10">
      {/* Header Banner */}
      <div className=" text-black p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <div className='bg-red-500 w-full h-[120px] absolute z-0 top-0 left-0'>

            </div>
            <Image className=" z-10 border rounded-full mt-10 mb-5" src="/images/nior.png" alt="Noir Essentials" width={100} height={100} />
          </div>
          <div className="flex items-center gap-4 mb-4">
            <h1 className="text-2xl font-bold ">Noir Essentials</h1>
            <div className="flex items-center gap-2 ">
              {store?.verified && (
                <>
                  <FiCheck className="text-white bg-green-700 rounded-full p-1" size={20} />
                  <span className="text-sm">Verified store</span>
                </>
              )}
            </div></div>
          <div className="flex items-center gap-2 text-sm">
            <FiMapPin size={16} className='text-black' />
            <span>{store?.address}</span>
          </div>
        </div>
      </div>

      {/* Store Info */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h2 className="text-md font-bold mb-2">Description</h2>
          <p className="text-gray-700">{store?.description}</p>
        </div>

        {/* Products Section */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Products</h2>
          <div className="flex items-center gap-4">
            {showSearch ? (
              <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2 w-full max-w-md">
                <FiSearch size={20} className="text-gray-500" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-sm"
                  autoFocus
                />
                <button
                  onClick={handleCloseSearch}
                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                  aria-label="Close search"
                >
                  <FiX size={20} className="text-gray-500" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleSearchClick}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Search products"
              >
                <FiSearch size={24} />
              </button>
            )}
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-30">
          {filteredProducts.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500">No products found matching "{searchQuery}"</p>
            </div>
          ) : (
            filteredProducts.map((product) => (
            <div key={product.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
              <div onClick={() => router.push(`/product/${product.id}`)} className="relative w-full aspect-square bg-gray-100">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder-product.jpg';
                  }}
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-sm mb-2 line-clamp-2">{product.name}</h3>
                <p className="text-lg  mb-3">
                  ₦ {product.price.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                </p>
                {isInCart(product.id) ? (
                  <Button
                    variant="primary"
                    size="md"
                    className="w-full"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      removeFromCart(product.id);
                    }}
                  >
                    <FiCheck size={16} />
                    Added to cart
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      addToCart(product.id, 1);
                    }}
                    isLoading={addingToCart === product.id}
                  >
                    <span className="text-xl">+</span>
                    Add to cart
                  </Button>
                )}
              </div>
            </div>
            ))
          )}

          {itemCount > 0 && (
            <div className="fixed max-w-7xl m-auto bottom-0 left-0 right-0 bg-white text-white text-xs w-full flex items-center justify-center p-10 animate-slide-up z-50">
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
  );
}
