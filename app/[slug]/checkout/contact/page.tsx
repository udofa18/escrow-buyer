'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/Button';
import { ContactInfo } from '@/types';
import type { Bank } from '@/types';
import { FaAngleDown } from 'react-icons/fa6';
import { FiSearch, FiX } from 'react-icons/fi';
import Text from '@/components/Text';
import Input from '@/components/Input';
import { getBanks, verifyAccount } from '@/lib/storefront-api';
import { useParams } from 'next/navigation';

export default function CheckoutContactPage() {
    const router = useRouter();
    const params = useParams();
    const slug = params.slug as string;
    const [banks, setBanks] = useState<Bank[]>([]);
    const [banksLoading, setBanksLoading] = useState(true);
    const [bankModalOpen, setBankModalOpen] = useState(false);
    const [bankSearch, setBankSearch] = useState('');
    const [selectedBankCode, setSelectedBankCode] = useState<string | null>(null);
    const [verifiedAccountName, setVerifiedAccountName] = useState<string | null>(null);
    const [verifyError, setVerifyError] = useState<string | null>(null);
    const [verifyLoading, setVerifyLoading] = useState(false);
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

    const filteredBanks = useMemo(() => {
        if (!bankSearch.trim()) return banks;
        const q = bankSearch.toLowerCase();
        return banks.filter((b) => b.name.toLowerCase().includes(q));
    }, [banks, bankSearch]);

    useEffect(() => {
        getBanks()
            .then((list) => setBanks(list))
            .catch(() => {})
            .finally(() => setBanksLoading(false));
    }, []);

    const openBankModal = () => {
        setBankSearch('');
        setBankModalOpen(true);
    };
    const selectBank = (bank: Bank) => {
        setFormData((prev) => ({ ...prev, bankName: bank.name, bankCode: bank.code }));
        setSelectedBankCode(bank.code);
        setVerifiedAccountName(null);
        setVerifyError(null);
        if (errors.bankName) setErrors((prev) => ({ ...prev, bankName: undefined }));
        setBankModalOpen(false);
    };

    useEffect(() => {
        const account = formData.accountDetails?.trim() || '';
        if (!account || !selectedBankCode || account.length < 10) {
            setVerifiedAccountName(null);
            setVerifyError(null);
            return;
        }
        const t = setTimeout(() => {
            setVerifyLoading(true);
            setVerifiedAccountName(null);
            setVerifyError(null);
            verifyAccount(account, selectedBankCode)
                .then((data) => {
                    setVerifiedAccountName(data.accountName);
                    setVerifyError(null);
                })
                .catch((err) => {
                    setVerifiedAccountName(null);
                    setVerifyError(err instanceof Error ? err.message : 'Account verification failed');
                })
                .finally(() => setVerifyLoading(false));
        }, 400);
        return () => clearTimeout(t);
    }, [formData.accountDetails, selectedBankCode]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (name === 'accountDetails') {
            setVerifiedAccountName(null);
            setVerifyError(null);
        }
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
            router.push(`/${ slug}/checkout/review`);
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

                        <Input error={errors.accountDetails} placeholder='Enter your account details' type='number' maxLength={10}  onChange={handleChange} value={formData.accountDetails} name='accountDetails' />
                        {errors.accountDetails && (
                            <Text size='small' className="text-red-500 text-sm mt-1">{errors.accountDetails}</Text>
                        )}
                    </div>
                    <div>
                        <Text size="medium" className="flex font-medium mb-2 justify-between">
                            Bank name
                        </Text>
                        <button
                            type="button"
                            onClick={openBankModal}
                            disabled={banksLoading}
                            className={`w-full h-[56px] px-4 py-2 bg-gray-100 rounded-lg text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-[#5D0C97] ${errors.bankName ? 'border border-red-500' : 'border border-gray-300'}`}
                        >
                            <span className={formData.bankName ? 'text-gray-900' : 'text-gray-500'}>
                                {formData.bankName || 'Select bank'}
                            </span>
                            <FaAngleDown size={14} className="text-gray-400 shrink-0" />
                        </button>
                        {verifyLoading && (
                            <p className="text-gray-500 text-sm mt-1">Verifying account...</p>
                        )}
                        {!verifyLoading && verifiedAccountName && (
                            <p className="text-green-600 text-sm mt-1 font-medium">{verifiedAccountName}</p>
                        )}
                        {!verifyLoading && verifyError && (
                            <p className="text-red-500 text-sm mt-1">{verifyError}</p>
                        )}
                        {errors.bankName && (
                            <p className="text-red-500 text-sm mt-1">{errors.bankName}</p>
                        )}

                        {/* Bank search modal */}
                        {bankModalOpen && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                                <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[85vh] flex flex-col">
                                    <div className="flex items-center justify-between p-4 border-b">
                                        <Text size="medium" as="h3" className="font-semibold">Select bank</Text>
                                        <button
                                            type="button"
                                            onClick={() => setBankModalOpen(false)}
                                            className="p-2 rounded-lg hover:bg-gray-100"
                                            aria-label="Close"
                                        >
                                            <FiX size={20} />
                                        </button>
                                    </div>
                                    <div className="p-3 border-b">
                                        <div className="relative">
                                            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <input
                                                type="text"
                                                value={bankSearch}
                                                onChange={(e) => setBankSearch(e.target.value)}
                                                placeholder="Search banks..."
                                                className="w-full h-11 pl-10 pr-4 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5D0C97]"
                                                autoFocus
                                            />
                                        </div>
                                    </div>
                                    <ul className="overflow-auto flex-1 py-2 min-h-0">
                                        {filteredBanks.length === 0 ? (
                                            <li className="px-4 py-6 text-center text-gray-500 text-sm">
                                                No banks found
                                            </li>
                                        ) : (
                                            filteredBanks.map((bank) => (
                                                <li key={bank.id}>
                                                    <button
                                                        type="button"
                                                        onClick={() => selectBank(bank)}
                                                        className="w-full px-4 py-3 text-left text-sm hover:bg-gray-100 flex items-center gap-3"
                                                    >
                                                        {bank.logo ? (
                                                            <img src={bank.logo} alt="" className="w-8 h-8 object-contain rounded" />
                                                        ) : (
                                                            <span className="w-8 h-8 rounded bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-500">
                                                                {bank.name.slice(0, 1)}
                                                            </span>
                                                        )}
                                                        <span>{bank.name}</span>
                                                    </button>
                                                </li>
                                            ))
                                        )}
                                    </ul>
                                </div>
                            </div>
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
                            onChange={handleChange}
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
