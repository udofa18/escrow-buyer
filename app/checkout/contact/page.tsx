'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiArrowLeft } from 'react-icons/fi';
import Button from '@/components/Button';
import { ContactInfo } from '@/types';
import { GiAccordion } from 'react-icons/gi';
import { RiDropdownList } from 'react-icons/ri';
import { BiDownArrow } from 'react-icons/bi';
import { FaAngleDown } from 'react-icons/fa6';

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
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-4 py-6">
     

        <h1 className="text-sm font-bold mb-6 border-b border-gray-300 pb-4">Contact Information</h1>

        <form onSubmit={handleSubmit} className="space-y-4 flex flex-col gap-4">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium mb-2">
              Full Name *
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              placeholder='Enter full name'
              onChange={handleChange}
              className={`w-full px-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5D0C97] ${
                errors.fullName ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.fullName && (
              <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder='Enter email address'
              className={`w-full px-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5D0C97] ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium mb-2">
              Phone Number *
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder='Enter phone number'

              className={`w-full px-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5D0C97] ${
                errors.phone ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.phone && (
              <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
            )}
          </div>

          <div>
            <label htmlFor="accountDetails" className=" flex text-sm font-medium mb-2 justify-between">
              Account Details
              <span onClick={() => setShowDropdown(!showDropdown)} className='flex items-center gap-2 float-right text-[#5D0C97] cursor-pointer'>
                <p>why is this needed?</p>
              <FaAngleDown size={15} className='float-right' /></span>
            </label>
            {showDropdown && (<div className='bg-purple-100 p-4 my-2 text-gray-500 text-sm'>
                <p>We require this to ensure your money is safely returned to you if the deal doesn’t go through.</p>
            </div>)}
            <input
              type="text"
              id="accountDetails"
              name="accountDetails"
              value={formData.accountDetails}
              onChange={handleChange}
              placeholder='Enter your account details'

              className={`w-full  px-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5D0C97] ${
                errors.accountDetails ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.accountDetails && (
              <p className="text-red-500 text-sm mt-1">{errors.accountDetails}</p>
            )}
          </div>
          <div>
            <label htmlFor="accountDetails" className=" flex text-sm font-medium mb-2 justify-between">
             Bank name
             
            </label>
           
            <select
             
              id="bankName"
              name="bankName"
              value={formData.bankName}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleChange(e as unknown as React.ChangeEvent<HTMLInputElement>)}

              className={`w-full  px-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5D0C97] ${
                errors.bankName ? 'border-red-500' : 'border-gray-300'
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
            <label htmlFor="address" className="block text-sm font-medium mb-2">
            Delivery Address 
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder='Enter delivery address'

              className={`w-full  px-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5D0C97] ${
                errors.address ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.address && (
              <p className="text-red-500 text-sm mt-1">{errors.address}</p>
            )}
          </div>
          <div>
            <label htmlFor="note" className="block text-sm font-medium mb-2">
              Custom note (optional)
            </label>
            <textarea
              id="note"
              name="note"
              value={formData.note}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleChange(e as unknown as React.ChangeEvent<HTMLInputElement>)}
              placeholder='Anything the vendor should know?'

              className={`w-full h-40 px-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5D0C97] ${
                errors.address ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.address && (
              <p className="text-red-500 text-sm mt-1">{errors.address}</p>
            )}
          </div>
  
          <div className="flex flex-col-reverse gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="flex-1"
            >
              Back
            </Button>
            <Button type="submit" variant="primary" className="flex-1">
              Continue
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
