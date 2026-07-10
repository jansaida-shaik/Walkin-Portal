import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { name, url, events, method, conditions, enabled } = await req.json();
    const sub = await prisma.webhookSubscription.update({ where: { id }, data: { name, url, events, method, conditions: conditions || [], enabled } });
    await prisma.auditLog.create({ data: { action: 'UPDATE_WEBHOOK', module: 'Webhooks', newValue: `Updated webhook subscription ${sub.name} details.` } });
    return NextResponse.json({ success: true, subscription: sub });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update webhook subscription.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const sub = await prisma.webhookSubscription.delete({ where: { id } });
    await prisma.auditLog.create({ data: { action: 'DELETE_WEBHOOK', module: 'Webhooks', newValue: `Deleted webhook subscription ${sub.name}` } });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to delete webhook subscription.' }, { status: 500 });
  }
}
