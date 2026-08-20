import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const list = await prisma.webhookSubscription.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json(list);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch webhook subscriptions' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, url, events, method, conditions } = await req.json();
    if (!name || !url || !events || !method) {
      return NextResponse.json({ error: 'Name, url, events, and method are required.' }, { status: 400 });
    }
    const sub = await prisma.webhookSubscription.create({ data: { name, url, method, events, conditions: conditions || [] } });
    await prisma.auditLog.create({ data: { action: 'CREATE_WEBHOOK', module: 'Webhooks', newValue: `Created webhook subscription ${sub.name} to ${sub.url}` } });
    return NextResponse.json({ success: true, subscription: sub }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create webhook subscription.' }, { status: 500 });
  }
}
