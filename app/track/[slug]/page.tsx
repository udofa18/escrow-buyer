'use client';
import React from 'react'
import Image from 'next/image'
import Text from '@/components/Text'
import Button from '@/components/Button'
import {
    FiAlertTriangle,
    FiBox,
    FiCheckCircle,
    FiClock,
    FiCornerUpLeft,
    FiXCircle,
} from 'react-icons/fi'
import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'

function page() {
    const router = useRouter();
    const params = useParams<{ slug: string }>();
    const storeSlug = (params.slug as string) || '';
    const statusCards = [
        { key: 'pending', label: 'Pending', count: 0, Icon: FiClock, iconClass: 'text-[#D6B34B]' },
        { key: 'active', label: 'Active', count: 0, Icon: FiCheckCircle, iconClass: 'text-[#6B4EFF]' },
        { key: 'delivered', label: 'Delivered', count: 0, Icon: FiBox, iconClass: 'text-[#3B82F6]' },
        { key: 'disputed', label: 'Disputed', count: 0, Icon: FiAlertTriangle, iconClass: 'text-[#F97316]' },
        { key: 'rejected', label: 'Rejected', count: 0, Icon: FiCornerUpLeft, iconClass: 'text-[#9CA3AF]' },
        { key: 'cancelled', label: 'Cancelled', count: 0, Icon: FiXCircle, iconClass: 'text-[#9CA3AF]' },
    ] as const;

    return (
        <div className='h-[calc(100vh-100px)] max-w-7xl m-auto  justify-center items-center relative'>
            <div className='flex justify-between items-center m-auto mb-[16px]'>
                <div className='flex items-center gap-2 text-center'>
                    <Image src='/images/xedla_png_logo.png' alt='nior' width={29} height={29} className='mb-4 mx-auto' />
                    <Text size='large' as='h1' className='text-2xl clash text-center ' style={{ fontWeight: '500' }}>XedlaPay</Text>

                </div>

                <div className='flex '>
                    <Text size='small' as='p' className='text-right '>Need Help? </Text>


                </div>
            </div>
            <div className='flex flex-col  gap-[40px]'>
                <div className='bg-[#F3EBFA] p-[16px] rounded-[16px]  gap-[32px] flex flex-col'>
                    <span>
                        <Text size='small' as='p' className='text-gray-500'>Available balance</Text>
                        <Text size='large' as='h1' className='text-black' style={{ fontWeight: '500' }}>₦ 100,000</Text>
                    </span>

                    <span className='flex gap-2'>
                        <Button
                            variant='primary'
                            size='lg'
                            className='w-full'
                            onClick={() => router.push(`/track/${storeSlug}/withdraw`)}
                        >
                            <Text size='small' as='p' className='text-white'>Withdraw balance</Text>
                        </Button>
                        <Button
                            variant='outline'
                            size='lg'
                            className='w-full'
                        >
                            <Text size='medium' as='p' className='text-[#5D0C97]'>View Completed</Text>
                        </Button>
                    </span>
                </div>
                <div>
                    <Text size='medium' as='p' className='text-gray-500'>Transaction </Text>
                    <div className="mt-3  ">
                        <div className="grid grid-cols-2 gap-[16px]">
                            {statusCards.map(({ key, label, count, Icon, iconClass }) => (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => router.push(`/track/${storeSlug}/${key}`)}
                                    className="bg-white rounded-[20px] border  px-[16px] py-[18px] min-h-[132px] flex flex-col justify-between border-[#C1C1C1]"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className={`w-10 h-10 rounded-full  flex items-center justify-center ${iconClass}`}>
                                            <Icon size={22} />
                                        </div>
                                        <Text size="large" as="p" className="text-black" style={{ fontWeight: '600' }}>
                                            {count}
                                        </Text>
                                    </div>
                                    <Text size="medium" as="p" className="text-[#6E6376]">
                                        {label}
                                    </Text>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                <div className='bg-linear-to-r from-gray-100 via-gray-200 to-purple-300 flex rounded-2xl overflow-hidden w-full max-w-md'>
                    <div className='text-left flex flex-col gap-2 p-4 justify-between flex-1'>
                        <Text size='medium' as='p' className='text-xl text-purple-900' style={{ fontWeight: '500' }}>Go beyond limits</Text>
                        <Text size='small' as='p' className='text-gray-600 text-sm'>Enjoy seamless Escrow and lightning-fast transactions on the XedlaPay app</Text>
                        <Button variant='primary' size='sm' className='w-fit mt-2'>Get the app</Button>
                    </div>
                    <div className='shrink-0'>
                        <Image src='/images/phone.svg' alt='phone' width={160} height={160} className='object-contain' />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default page