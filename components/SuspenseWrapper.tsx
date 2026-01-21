'use client';

import { Suspense, ReactNode } from 'react';
import LogoOrbitLoader from './Loader';

interface SuspenseWrapperProps {
  children: ReactNode;
}

export default function SuspenseWrapper({ children }: SuspenseWrapperProps) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <LogoOrbitLoader showBackground />
      </div>
    }>
      {children}
    </Suspense>
  );
}
