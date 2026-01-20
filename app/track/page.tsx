'use client';
import Button from '@/components/Button'
import Image from 'next/image'
import React, { useState } from 'react'
import { FaAngleDown } from 'react-icons/fa'

const TrackOrder = () => {
    const [showDropdown, setShowDropdown] = useState(false);
    return (
        <div className='min-h-screen bg-white   justify-center py-6 px-4 items-center'>
<p className='text-right mb-10'>Need Help? </p>
            <div className='text-center max-w-md px-4 flex flex-col gap-5'>
                <Image src='/images/logo.png' alt='nior' width={29} height={29} className='mb-4 mx-auto' />
                <h1 className='text-2xl clash ' style={{ fontWeight: '500' }}>Track your order live</h1>
                <p className='text-gray-500'>Provide your Access Key to track your order status in real-time.</p>
                <div className='flex flex-col items-center gap-6 py-10'>
                    <input type="text" placeholder='Access key' className='w-full p-2 py-4 rounded-md  bg-gray-100 border-gray-300' />
                    <Button variant='primary' size='lg' className='w-full'>Track my order</Button>
                </div>
                <div className='flex items-center gap-2 ' onClick={() => setShowDropdown(!showDropdown)} >
                    <p>Need help finding access key? </p>
                    <FaAngleDown size={15} className='float-right' />

                </div>
                {showDropdown && (<div className='bg-purple-100 rounded-lg p-4 my-2 text-purple-900 text-sm'>
                    <p>Your access key was sent to your email after payment. It remains active until the transaction is completed.</p>
                </div>)}

                <div className='bg-gradient-to-r from-gray-100 via-gray-200 to-purple-500 w-full flex rounded-2xl overflow-hidden '>
                    <div className='text-left  flex flex-col gap-2  p-3'>
                        <p className='text-xl text-purple-900 ' style={{ fontWeight: '500' }}>Go beyond limits</p>
                        <p className='text-gray-500 text-sm'>Enjoy seamless Escrow and lightning-fast transactions on the XedlaPay app</p>
                        <Button variant='primary' size='lg' className='w-fit'>Get the app</Button>
                    </div>
                    <div>
                        <Image src='/images/phone.svg' alt='nior' width={210} height={210} className='' />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TrackOrder