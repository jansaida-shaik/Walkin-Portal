import { NextResponse } from 'next/server';
import { branches } from '@/lib/constants';

export async function GET() {
  return NextResponse.json(branches);
}
