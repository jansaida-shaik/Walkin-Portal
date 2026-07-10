import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const sub = await prisma.webhookSubscription.findUnique({ where: { id } });
    if (!sub) return NextResponse.json({ error: 'Webhook subscription not found.' }, { status: 404 });
    const updated = await prisma.webhookSubscription.update({ where: { id }, data: { enabled: !sub.enabled } });
    return NextResponse.json({ success: true, subscription: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to toggle webhook.' }, { status: 500 });
  }
}
