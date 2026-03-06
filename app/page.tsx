'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const DEFAULT_STORE_SLUG = 'tech-haven';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace(`/${DEFAULT_STORE_SLUG}`);
  }, [router]);

  return null;
}
