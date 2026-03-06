'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { FiSearch, FiMapPin, FiCheck, FiX, FiPlus, FiFilter } from 'react-icons/fi';
import { Product } from '@/types';
import type { Storefront } from '@/types';
import Button from '@/components/Button';
import { handleApiError } from '@/lib/error-handler';
import { useCart } from '@/hooks/useCart';
import LogoOrbitLoader from '@/components/Loader';
import Text from '@/components/Text';
import {
  getStorefrontBySlug,
  getProductsByStoreSlug,
  mapApiProductToProduct,
} from '@/lib/storefront-api';

const ALL_CATEGORIES = 'All';

export default function StorefrontBySlugPage() {
  const router = useRouter();
  const params = useParams();
  const slug = typeof params.slug === 'string' ? params.slug : '';

  const [store, setStore] = useState<Storefront | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);

  const {
    itemCount,
    addingToCart,
    addToCart,
    removeFromCart,
    isInCart,
    subtotal,
  } = useCart();

  useEffect(() => {
    if (!slug) return;
    loadStorefrontAndProducts();
  }, [slug]);

  const loadStorefrontAndProducts = async () => {
    try {
      setLoading(true);
      const [storefrontData, productsResponse] = await Promise.all([
        getStorefrontBySlug(slug),
        getProductsByStoreSlug(slug),
      ]);
      setStore(storefrontData);
      setProducts(
        productsResponse.map((p) => mapApiProductToProduct(p, storefrontData))
      );
    } catch (error) {
      console.error('Failed to load storefront:', handleApiError(error));
      setStore(null);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category?.trim()) set.add(p.category.trim());
    });
    return [ALL_CATEGORIES, ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [products]);

  const filteredProducts = useMemo(() => {
    let list = products;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
      );
    }
    if (selectedCategory && selectedCategory !== ALL_CATEGORIES) {
      list = list.filter((p) => p.category === selectedCategory);
    }
    return list;
  }, [products, searchQuery, selectedCategory]);

  const handleSearchClick = () => setShowSearch(true);
  const handleCloseSearch = () => {
    setShowSearch(false);
    setSearchQuery('');
  };
  const handleSelectCategory = (category: string) => {
    setSelectedCategory(category === ALL_CATEGORIES ? null : category);
    setShowCategoryFilter(false);
  };

  if (!slug) {
    return null;
  }

  if (loading) {
    return <LogoOrbitLoader showBackground />;
  }

  return (
    <div className="min-h-screen z-10">
      {/* Header Banner */}
      <div className="text-black">
        <div className="max-w-7xl mx-auto">
          {store?.banner?.url && (
            <div className=" w-full h-[120px] absolute z-0 top-0 left-0 rounded-b-lg">
              <Image
                src={store.banner.url}
                alt=""
                fill
                className="object-cover"
              />
            </div>
          )}
          {!store?.banner?.url && (
            <div className="bg-red-500 w-full h-[120px] absolute z-0 top-0 left-0 rounded-b-lg" />
          )}
          <div className="flex flex-col  gap-4 mt-6">
            {store?.logo?.url ? (
              <Image
                className="z-10 border border-gray-200 rounded-full mt-10 mb-5"
                src={store.logo.url}
                alt={store?.storeName ?? 'Store'}
                width={100}
                height={100}
              />
            ) : (
              <Image
                className="z-10 border rounded-full mt-10 mb-5"
                src="/images/nior.png"
                alt={store?.storeName ?? 'Store'}
                width={100}
                height={100}
              />
            )}
            <div>
              <div className="flex items-center gap-[16px] mb-[8px]">
                <Text size="large" as="h1" className="font-bold">
                  {store?.storeName ?? 'Store'}
                </Text>
                <div className="flex items-center gap-2">
                  {store?.hasCompletedStoreProfile && (
                    <>
                      <FiCheck className="text-white bg-green-800 rounded-full p-1" size={16} />
                      <Text size="small" className="text-sm">Verified store</Text>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <FiMapPin size={16} className="text-black" />
                <Text size="small" className="text-sm">{store?.address ?? ''}</Text>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Store Info */}
      <div className="max-w-7xl mx-auto py-6">
        <div className="mb-6">
          <Text size="medium" as="h2" className="font-bold mb-2">Description</Text>
          <Text size="small">{store?.description ?? ''}</Text>
        </div>

        {/* Products Section */}
        <div className="mb-4 flex items-center justify-between">
          <Text size="medium" as="h2" className="font-bold">Products</Text>
          <div className="flex items-center gap-4">
            <div className="relative md:hidden">
              <button
                type="button"
                onClick={() => setShowCategoryFilter((v) => !v)}
                className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-gray-100"
                aria-expanded={showCategoryFilter}
                aria-label="Filter by category"
              >
                <FiFilter size={16} className="text-gray-400" />
                <Text size="small" className='text-gray-400'>Filter</Text>
              </button>
              {showCategoryFilter && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    aria-hidden
                    onClick={() => setShowCategoryFilter(false)}
                  />
                  <div className="absolute left-0 top-full mt-1 z-50 min-w-[120px] bg-white border border-gray-200 rounded-lg shadow-lg py-2 max-h-[70vh] overflow-auto">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => handleSelectCategory(cat)}
                        className={`w-full text-left px-4 py-2 text-sm capitalize  hover:bg-gray-100 ${
                          (cat === ALL_CATEGORIES && !selectedCategory) || cat === selectedCategory
                            ? 'bg-gray-100 font-medium text-[#5D0C97]'
                            : 'text-gray-700'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
            {showSearch ? (
              <div className="flex items-center cursor-pointer gap-2 bg-gray-100 rounded-lg px-3 py-2 w-full max-w-md">
                <FiSearch size={16} className="text-gray-300" />
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
                <FiSearch size={20} className="text-gray-400" />
              </button>
            )}
          </div>
        </div>

        {/* Layout: sidebar (desktop) + product grid */}
        <div className="flex gap-6">
          {/* Categories sidebar - desktop only */}
          <aside className="hidden md:block w-48 shrink-0">
            <Text size="medium" as="h3" className="font-semibold mb-3 text-gray-400">Categories</Text>
            <nav className="flex flex-col gap-0.5 border-r border-gray-300 pr-4 ">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat === ALL_CATEGORIES ? null : cat)}
                  className={`text-left py-2 px-3 rounded-lg text-sm capitalize transition-colors ${
                    (cat === ALL_CATEGORIES && !selectedCategory) || cat === selectedCategory
                      ? 'bg-[#5D0C97]/10 text-[#5D0C97] font-medium'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </nav>
          </aside>

          {/* Products Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[16px] mb-30 flex-1 min-w-0">
          {filteredProducts.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500">
                {searchQuery.trim()
                  ? `No products found matching "${searchQuery}"`
                  : selectedCategory
                    ? `No products in "${selectedCategory}"`
                    : 'No products yet'}
              </p>
            </div>
          ) : (
            filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white flex flex-col gap-[24px] rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div
                  onClick={() => router.push(`/${slug}/${product.slug ?? product.id}`)}
                  className="relative w-full aspect-square bg-gray-100 rounded-[16px] cursor-pointer"
                >
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
                <div className="flex flex-col gap-[12px]">
                  <Text size="medium" as="h3" className="font-semibold mb-2 line-clamp-1">
                    {product.name}
                  </Text>
                  <Text size="medium" className="text-lg mb-3">
                    ₦ {product.price.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                  </Text>
                  {isInCart(product.id) ? (
                    <Button
                      variant="primary"
                      size="lg"
                      className="w-full"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        removeFromCart(product.id);
                      }}
                    >
                      <FiCheck size={16} />
                      <Text size="small">Added to cart</Text>
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        addToCart(product.id, 1, product);
                      }}
                      isLoading={addingToCart === product.id}
                    >
                      <FiPlus size={16} />
                      <Text size="small">Add to cart</Text>
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}

          {itemCount > 0 && (
            <div className="fixed max-w-7xl h-[118px] m-auto bottom-0 left-0 right-0 bg-white text-white text-xs w-full flex items-center justify-center p-[16px] animate-slide-up z-50 shadow-lg md:shadow-none">
              <Button
                variant="primary"
                size="lg"
                className="md:w-96 w-full flex justify-between gap-40"
                onClick={() => router.push(`/${ slug}/cart`)}
              >
                <span className="w-full flex justify-between">
                  <div className="flex gap-2 items-center">
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
