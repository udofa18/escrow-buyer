import { NextResponse } from 'next/server';
import { DiscountCode } from '@/types';

// Dummy discount codes
const discountCodes: Record<string, DiscountCode> = {
  'SAVE10': { code: 'SAVE10', discount: 10, valid: true },
  'WELCOME20': { code: 'WELCOME20', discount: 20, valid: true },
  'NOIR15': { code: 'NOIR15', discount: 15, valid: true },
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const discount = discountCodes[code.toUpperCase()];
    
    if (!discount || !discount.valid) {
      return NextResponse.json(
        { message: 'Invalid discount code' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(discount);
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to validate discount code' },
      { status: 500 }
    );
  }
}
