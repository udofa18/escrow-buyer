/* eslint-disable react/no-unescaped-entities */
'use client';

import { useMemo } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Text from '@/components/Text';
import { FiArrowLeft, FiCheckSquare } from 'react-icons/fi';

type StatusKey = 'pending' | 'active' | 'delivered' | 'disputed' | 'rejected' | 'cancelled';

function toTitle(status: string): string {
  return status
    .split('-')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function statusPill(status: StatusKey) {
  switch (status) {
    case 'delivered':
      return { label: 'Delivered', className: 'bg-red-50 text-red-600' };
    case 'active':
      return { label: 'Active', className: 'bg-purple-50 text-purple-700' };
    case 'pending':
      return { label: 'Pending', className: 'bg-yellow-50 text-yellow-700' };
    case 'disputed':
      return { label: 'Disputed', className: 'bg-orange-50 text-orange-700' };
    case 'rejected':
      return { label: 'Rejected', className: 'bg-gray-100 text-gray-700' };
    case 'cancelled':
      return { label: 'Cancelled', className: 'bg-gray-100 text-gray-700' };
    default:
      return { label: toTitle(status), className: 'bg-gray-100 text-gray-700' };
  }
}

export default function TrackStatusPage() {
  const router = useRouter();
  const params = useParams<{ slug: string; status: string }>();
  const searchParams = useSearchParams();
  const storeSlug = params.slug as string;
  const rawStatus = (params.status as string) || 'pending';
  const status = (rawStatus.toLowerCase() as StatusKey) || 'pending';

  const demo = searchParams.get('demo') === '1';

  const headerTitle = useMemo(() => `${toTitle(rawStatus)} Escrow`, [rawStatus]);
  const pill = statusPill(status);

  const hasItems = demo; // placeholder until API is wired

  return (
    <div className="h-[calc(100vh-100px)] max-w-7xl mx-auto">
      <div className="flex items-center gap-3 py-4">
        <button
          type="button"
          onClick={() => router.push(`/track/${storeSlug}`)}
          className="p-2 rounded-lg hover:bg-gray-100"
          aria-label="Back"
        >
          <FiArrowLeft size={22} />
        </button>
        <div className="flex-1 text-center -ml-10">
          <Text size="large" as="h1" className="text-base font-semibold">
            {headerTitle}
          </Text>
        </div>
      </div>

      <div className="px-4 sm:px-0">
        {!hasItems ? (
          <div className="flex flex-col items-center justify-center text-center mt-24">
            <div className="w-44 h-44 rounded-2xl border border-gray-200 bg-gray-50 flex items-center justify-center">
              <div className="w-24 h-20 rounded-xl bg-white border border-gray-200 p-3 flex flex-col gap-3">
                <div className="flex gap-3">
                  <div className="w-9 h-9 rounded-lg bg-gray-100" />
                  <div className="flex-1">
                    <div className="h-2.5 w-16 bg-gray-100 rounded mb-2" />
                    <div className="h-2.5 w-10 bg-gray-100 rounded" />
                  </div>
                </div>
                <div className="flex gap-3 opacity-70">
                  <div className="w-9 h-9 rounded-lg bg-gray-100" />
                  <div className="flex-1">
                    <div className="h-2.5 w-14 bg-gray-100 rounded mb-2" />
                    <div className="h-2.5 w-8 bg-gray-100 rounded" />
                  </div>
                </div>
              </div>
            </div>

            <Text size="large" as="p" className="mt-10 font-semibold">
              No {toTitle(rawStatus) as string} yet
            </Text>
            <Text size="small" as="p" className="text-gray-500 mt-2 max-w-xs">
              When a {toTitle(rawStatus) as string} is available, you will find it here
            </Text>
          </div>
        ) : (
          <div className="mt-6">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#F3EBFA] flex items-center justify-center text-[#5D0C97]">
                    <FiCheckSquare size={22} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Text size="medium" as="p" className="font-semibold text-gray-900">
                      Storefront Purchase
                    </Text>
                    <Text size="medium" as="p" className="text-gray-900">
                      ₦450,000
                    </Text>
                  </div>
                </div>

                <span className={`px-3 py-1 rounded-full text-xs font-medium ${pill.className}`}>
                  {pill.label}
                </span>
              </div>

              <div className="h-px bg-gray-200 my-4" />

              <Text size="medium" as="p" className="text-gray-900">
                James Okoh → Me
              </Text>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

