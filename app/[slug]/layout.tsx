import type { Metadata } from 'next';
import { getStorefrontBySlug } from '@/lib/storefront-api';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (!slug) return { title: 'Store', description: 'Product store' };
  try {
    const store = await getStorefrontBySlug(slug);
    const imageUrl =
      store.logo?.url || store.banner?.url || undefined;
    return {
      title: store.storeName,
      description: store.description || undefined,
      openGraph: {
        title: store.storeName,
        description: store.description || undefined,
        ...(imageUrl && {
          images: [{ url: imageUrl, alt: store.storeName }],
        }),
      },
      twitter: {
        card: 'summary_large_image',
        title: store.storeName,
        description: store.description || undefined,
        ...(imageUrl && { images: [imageUrl] }),
      },
    };
  } catch {
    return { title: 'Store', description: 'Product store' };
  }
}

export default function SlugLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
