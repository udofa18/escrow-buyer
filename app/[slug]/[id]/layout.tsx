import type { Metadata } from 'next';
import { getProductBySlug } from '@/lib/storefront-api';

type Props = { params: Promise<{ slug: string; id: string }> };

function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 3).trim() + '...';
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, id: productSlug } = await params;
  if (!slug || !productSlug) {
    return { title: 'Product', description: 'Product details' };
  }
  try {
    const product = await getProductBySlug(slug, productSlug);
    const title = product.name;
    const description = truncate(product.description || `${product.name} - ₦${product.price.toLocaleString('en-NG')}`, 160);
    const imageUrl = product.image || undefined;
    const storeName = product.storefrontId?.name ?? product.store?.name;

    return {
      title,
      description,
      openGraph: {
        title: storeName ? `${title} | ${storeName}` : title,
        description,
        type: 'website',
        ...(imageUrl && {
          images: [{ url: imageUrl, alt: product.name, width: 1200, height: 630 }],
        }),
      },
      twitter: {
        card: 'summary_large_image',
        title: storeName ? `${title} | ${storeName}` : title,
        description,
        ...(imageUrl && { images: [imageUrl] }),
      },
      alternates: {
        canonical: `/${slug}/${productSlug}`,
      },
    };
  } catch {
    return { title: 'Product', description: 'Product details' };
  }
}

export default function ProductLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
