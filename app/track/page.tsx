'use client';
import Button from '@/components/Button'
import Input from '@/components/Input';
import Image from 'next/image'
import React, { useState } from 'react'
import { FaAngleDown } from 'react-icons/fa'
import Text from '@/components/Text';

const TrackOrder = () => {
    const [showDropdown, setShowDropdown] = useState(false);
    return (
        <div className='h-[calc(100vh-100px)] max-w-7xl m-auto   justify-center items-center relative'>
<Text size='small' as='p' className='text-right mb-10'>Need Help? </Text>
            <div className='text-center max-w-md  m-auto  flex flex-col gap-5'>
                <Image src='/images/xedla_png_logo.png' alt='nior' width={29} height={29} className='mb-4 mx-auto' />
                <Text size='large' as='h1' className='text-2xl clash ' style={{ fontWeight: '500' }}>Track your order live</Text>
                <Text size='medium' as='p' className='text-gray-500'>Provide your Access Key to track your order status in real-time.</Text>
                <div className='flex flex-col items-center gap-6 py-10'>
                    <Input type="text" placeholder='Access key' className='w-full p-2 py-4 rounded-md  bg-gray-100 border-gray-300' />
                    <Button variant='primary' size='lg' className='w-full'>Track my order</Button>
                </div>
                <div className='flex items-center gap-2 ' onClick={() => setShowDropdown(!showDropdown)} >
                    <Text size='small' as='p' className='text-gray-500'>Need help finding access key? </Text>
                    <FaAngleDown size={15} className='float-right' />

                </div>
                {showDropdown && (<div className='bg-purple-100 rounded-lg p-4 my-1 text-purple-900 text-sm'>
                    <Text size='small' as='p' className='text-gray-500'>Your access key was sent to your email after payment. It remains active until the transaction is completed.</Text>
                </div>)}

                <div className='bg-linear-to-r from-gray-100 via-gray-200 to-purple-300 flex rounded-2xl overflow-hidden w-full max-w-md mt-20'>
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

export default TrackOrder