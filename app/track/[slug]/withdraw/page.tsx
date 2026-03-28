'use client';
import Button from '@/components/Button'
import React from 'react'
import { FiArrowLeft, FiArrowRight } from 'react-icons/fi'
import { useRouter } from 'next/navigation'
import Text from '@/components/Text'

function page() {
    const router = useRouter();
    return (
        <div className='h-[calc(100vh-100px)] max-w-7xl m-auto  justify-center items-center relative'>
            <div>
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="text-black"
                >

                    <FiArrowLeft size={20} />

                </Button>
                <div>
                    <div className='flex flex-col gap-4'>
                        <Text size='large' as='h1' className='text-2xl font-bold'>Withdraw balance</Text>

                    </div>
                    <div className='flex flex-col gap-[40px] p-[16px] mt-[30px] rounded-[16px] bg-gray-100'>
                        <span className='flex justify-between items-center'>


                            <Text size='medium' as='p' className='text-gray-500'>Available balance</Text>
                            <Text size='medium' as='p' className='text-2xl font-bolf'>₦ 100,000</Text>
                        </span>

                        <span className='flex justify-between items-center'>


                            <Text size='medium' as='p' className='text-gray-500'>Processing time</Text>
                            <Text size='medium' as='p' className='text-2xl font-bolf'>24 hours</Text>
                        </span>

                        <span className='flex justify-between '>


                            <Text size='medium' as='p' className='text-gray-500'>Destination</Text>
                            <span>
                                <Text size='medium' as='p' className='text-2xl font-bolf'>Gift Orife . Opay</Text>
                                <Text size='medium' as='p' className='text-2xl text-right font-bolf'>(9007162216)</Text>
                            </span>
                        </span>

                    </div>
                    <Button
                        variant="primary"
                        size='lg'
                        className='w-full end-0'
                        onClick={() => router.push("withdraw/withdraw-success")}

                    >
                        <Text size='medium' as='p' className='text-white'>Withdraw balance</Text>
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default page