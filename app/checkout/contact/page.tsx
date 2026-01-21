'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/Button';
import { ContactInfo } from '@/types';
import { FaAngleDown } from 'react-icons/fa6';
import Text from '@/components/Text';
import Input from '@/components/Input';
export default function CheckoutContactPage() {
    const router = useRouter();
    const [formData, setFormData] = useState<ContactInfo>({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        accountDetails: '',
        note: '',
        deliveryAddress: '',
        bankName: '',
    });
    const [errors, setErrors] = useState<Partial<Record<keyof ContactInfo, string>>>({});
    const [showDropdown, setShowDropdown] = useState(false);
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name as keyof ContactInfo]) {
            setErrors((prev) => ({ ...prev, [name]: undefined }));
        }
    };

    const validate = (): boolean => {
        const newErrors: Partial<Record<keyof ContactInfo, string>> = {};

        if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Invalid email address';
        }
        if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
        if (!formData.accountDetails.trim()) newErrors.accountDetails = 'Account details are required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            // Store in sessionStorage to pass to next page
            sessionStorage.setItem('contactInfo', JSON.stringify(formData));
            router.push('/checkout/review');
        }
    };

    return (
        <div className=" ">
            <div className="max-w-2xl mx-auto ">


                <Text size='medium' className="font-bold mb-6 border-b border-gray-300 pb-4">Contact Information</Text>

                <form onSubmit={handleSubmit} className="space-y-4 flex flex-col gap-4">
                    <div>

                        <Input label='Full Name *' error={errors.fullName} placeholder='Enter your full name' onChange={handleChange} value={formData.fullName} name='fullName' />

                    </div>

                    <div>

                        <Input label='Email *' error={errors.email} placeholder='Enter your email address' onChange={handleChange} value={formData.email} name='email' />
                    </div>

                    <div>


                        <Input label='Phone Number *' error={errors.phone} placeholder='Enter your phone number' onChange={handleChange} value={formData.phone} name='phone' />
                    </div>

                    <div>
                        <Text size='medium' className=" flex font-medium mb-2 justify-between">
                            <Text size='medium'>Account Details</Text>
                            <span onClick={() => setShowDropdown(!showDropdown)} className='flex items-center gap-2 float-right text-[#5D0C97] cursor-pointer'>
                                <Text size='small'>why is this needed?</Text>
                                <FaAngleDown size={15} className='float-right' /></span>
                        </Text>
                        {showDropdown && (<div className='bg-purple-100 p-4 my-2 text-gray-500 text-sm rounded-[16px]'>
                            <Text size='small'>We require this to ensure your money is safely returned to you if the deal doesn’t go through.</Text>
                        </div>)}

                        <Input error={errors.accountDetails} placeholder='Enter your account details' onChange={handleChange} value={formData.accountDetails} name='accountDetails' />
                        {errors.accountDetails && (
                            <Text size='small' className="text-red-500 text-sm mt-1">{errors.accountDetails}</Text>
                        )}
                    </div>
                    <div>
                        <Text size='medium' className=" flex font-medium mb-2 justify-between">
                            Bank name

                        </Text>

                        <select

                            id="bankName"
                            name="bankName"
                            value={formData.bankName}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleChange(e as unknown as React.ChangeEvent<HTMLInputElement>)}

                            className={`w-full h-[56px] px-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5D0C97] ${errors.bankName ? 'border-red-500' : 'border-gray-300'
                                }`}
                        >
                            <option value="Access Bank"> </option>

                            <option value="Access Bank">Access Bank</option>
                            <option value="Zenith Bank">Zenith Bank</option>
                            <option value="GT Bank">GT Bank</option>
                            <option value="UBA">UBA</option>
                            <option value="Fidelity Bank">Fidelity Bank</option>
                            <option value="Stanbic IBTC Bank">Stanbic IBTC Bank</option>
                        </select>
                        {errors.bankName && (
                            <p className="text-red-500 text-sm mt-1">{errors.bankName}</p>
                        )}
                    </div>
                    <div>

                        <Input label='Delivery Address' error={errors.address} placeholder='Enter your delivery address' onChange={handleChange} value={formData.address} name='address' />
                    </div>
                    <div>
                        <Text size='medium' className="block font-medium mb-2">Custom note (optional)</Text>
                        <textarea
                            id="note"
                            name="note"
                            value={formData.note}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleChange(e as unknown as React.ChangeEvent<HTMLInputElement>)}
                            placeholder='Anything the vendor should know?'

                            className={`w-full h-40 px-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5D0C97] ${errors.address ? 'border-red-500' : 'border-gray-300'
                                }`}
                        />
                        {errors.address && (
                            <p className="text-red-500 text-sm mt-1">{errors.address}</p>
                        )}
                    </div>

                    <div className="flex flex-col gap-4 ">
                        <Button variant="primary"
                        type="submit"
                            size="lg"
                            className="w-full">
                            Continue
                        </Button>
                        <Button
                            variant="outline"
                            size='lg'
                            onClick={() => router.back()}
                            className="flex-1"
                        >
                            Back
                        </Button>

                    </div>
                </form>
            </div>
        </div>
    );
}
