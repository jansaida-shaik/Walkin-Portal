import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { triggerWebhook } from '@/lib/webhooks';

export async function POST(req: NextRequest) {
  try {
    const { studentId } = await req.json();
    if (!studentId) return NextResponse.json({ error: 'studentId is required.' }, { status: 400 });

    const student = await prisma.student.findUnique({ where: { id: studentId } });
    if (!student) return NextResponse.json({ error: 'Student not found.' }, { status: 404 });

    let session = await prisma.counselingSession.findFirst({ where: { studentId, status: 'ASSIGNED' } });
    const startTime = new Date();

    const result = await prisma.$transaction(async (tx: any) => {
      if (!session) {
        const counselor = await tx.counselorProfile.findFirst({ where: { assignedStudentId: studentId }, include: { user: true } });
        if (!counselor) throw new Error('No counselor assigned to this student.');
        session = await tx.counselingSession.create({ data: { studentId, counselorId: counselor.id, status: 'ASSIGNED', notes: '' } });
      }
      const updatedSession = await tx.counselingSession.update({ where: { id: session!.id }, data: { startTime, status: 'IN_SESSION' } });
      await tx.student.update({ where: { id: studentId }, data: { status: 'In Session' } });
      await tx.counselorProfile.update({ where: { id: session!.counselorId }, data: { status: 'Busy' } });
      return { session: updatedSession };
    });

    triggerWebhook('Session Started', { session: result.session });
    triggerWebhook('Status Changed', { event: 'Session Started', studentId, counselorId: result.session.counselorId });
    return NextResponse.json({ success: true, session: result.session });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to start session.' }, { status: 500 });
  }
}
