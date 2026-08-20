import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const list = await prisma.failedWalkin.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json(list);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch failed walkins' }, { status: 500 });
  }
}
