import { NextResponse } from 'next/server';
import { PaymentAccount } from '@/types';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    
    // Dummy payment account
    const account: PaymentAccount = {
      accountName: 'Noir Essentials Escrow',
      accountNumber: '1234567890',
      bankName: 'Access Bank',
    };
    
    return NextResponse.json(account);
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to fetch payment account' },
      { status: 500 }
    );
  }
}
