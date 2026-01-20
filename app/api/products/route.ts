import { NextResponse } from 'next/server';
import { dummyProducts } from '@/data/products';

export async function GET() {
  try {
    return NextResponse.json(dummyProducts);
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
