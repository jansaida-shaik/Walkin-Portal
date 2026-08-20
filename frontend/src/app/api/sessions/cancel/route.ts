import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { triggerWebhook } from '@/lib/webhooks';

export async function POST(req: NextRequest) {
  try {
    const { studentId } = await req.json();
    if (!studentId) return NextResponse.json({ error: 'studentId is required.' }, { status: 400 });

    const session = await prisma.counselingSession.findFirst({ where: { studentId, status: 'IN_SESSION' } });
    if (!session) return NextResponse.json({ error: 'No active session found.' }, { status: 404 });

    const result = await prisma.$transaction(async (tx: any) => {
      const revertedSession = await tx.counselingSession.update({ where: { id: session.id }, data: { startTime: null, status: 'ASSIGNED', notes: '' } });
      await tx.student.update({ where: { id: studentId }, data: { status: 'Assigned' } });
      await tx.counselorProfile.update({ where: { id: session.counselorId }, data: { status: 'Available' } });
      return { session: revertedSession };
    });

    await prisma.auditLog.create({ data: { action: 'CANCEL_SESSION_START', module: 'Sessions', newValue: `Cancelled start of session ID ${session.id} for student ID ${studentId}` } });
    triggerWebhook('Status Changed', { event: 'Session Cancelled', studentId, counselorId: result.session.counselorId });
    return NextResponse.json({ success: true, session: result.session });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to cancel session start.' }, { status: 500 });
  }
}
