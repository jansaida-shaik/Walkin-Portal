import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    let cfg = await prisma.webhookConfig.findUnique({ where: { id: 1 } });
    if (!cfg) {
      cfg = await prisma.webhookConfig.create({ data: { id: 1, customHeaders: [], globalPayloadFields: [], signingSecret: '', maxRetries: 1, retryDelayMs: 2000, timeoutMs: 5000 } });
    }
    return NextResponse.json(cfg);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch webhook configuration' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const patch = await req.json();
    const updated = await prisma.webhookConfig.update({ where: { id: 1 }, data: patch });
    await prisma.auditLog.create({ data: { action: 'UPDATE_WEBHOOK_CONFIG', module: 'Webhooks', newValue: `Updated global webhook preferences: ${JSON.stringify(patch)}` } });
    return NextResponse.json({ success: true, config: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update global webhook config.' }, { status: 500 });
  }
}
