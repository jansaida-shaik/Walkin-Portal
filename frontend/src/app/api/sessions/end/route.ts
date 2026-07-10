import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { triggerWebhook } from '@/lib/webhooks';

export async function POST(req: NextRequest) {
  try {
    const { studentId, notes, followUpStatus, transcript, summary } = await req.json();
    if (!studentId) return NextResponse.json({ error: 'studentId is required.' }, { status: 400 });

    const session = await prisma.counselingSession.findFirst({ where: { studentId, status: { in: ['IN_SESSION', 'ASSIGNED'] } } });
    if (!session) return NextResponse.json({ error: 'No active session found.' }, { status: 404 });

    const endTime = new Date();
    const durationSeconds = session.startTime ? Math.floor((endTime.getTime() - session.startTime.getTime()) / 1000) : 0;

    const result = await prisma.$transaction(async (tx: any) => {
      const completedSession = await tx.counselingSession.update({ where: { id: session.id }, data: { endTime, duration: durationSeconds, status: 'COMPLETED', notes: notes || '', followUpStatus: followUpStatus || null, transcript: transcript || null, summary: summary || null } });
      await tx.student.update({ where: { id: studentId }, data: { status: 'Completed' } });
      await tx.queueEntry.updateMany({ where: { studentId }, data: { status: 'completed' } });
      const profile = await tx.counselorProfile.update({ where: { id: session.counselorId }, data: { assignedStudentId: null, status: 'Available' }, include: { user: true } });

      let nextSession = null, nextStudent = null;
      const nextQueue = await tx.queueEntry.findFirst({ where: { student: { branchId: profile.user.branchId, status: 'Waiting' }, status: 'active' }, include: { student: true }, orderBy: { position: 'asc' } });
      if (nextQueue) {
        nextStudent = nextQueue.student;
        await tx.counselorProfile.update({ where: { id: profile.id }, data: { assignedStudentId: nextStudent.id } });
        await tx.student.update({ where: { id: nextStudent.id }, data: { status: 'Assigned' } });
        nextSession = await tx.counselingSession.create({ data: { studentId: nextStudent.id, counselorId: profile.id, status: 'ASSIGNED', notes: '' } });
      }
      return { completedSession, counselor: profile, nextStudent, nextSession };
    });

    triggerWebhook('Session Ended', { session: result.completedSession });
    triggerWebhook('Status Changed', { event: 'Session Ended', studentId, counselorId: result.completedSession.counselorId });
    if (result.nextStudent && result.nextSession) {
      const walkinPayload = { id: result.nextStudent.id, studentName: result.nextStudent.name, phone: result.nextStudent.phone, status: 'Assigned', counselorId: result.counselor.id, counselorName: result.counselor.user.name };
      triggerWebhook('Counsellor Assigned', { walkin: walkinPayload, counselorId: result.counselor.id, counselorName: result.counselor.user.name, session: result.nextSession });
      triggerWebhook('Status Changed', { event: 'Counsellor Assigned', walkinId: result.nextStudent.id, counselorId: result.counselor.id });
    }

    return NextResponse.json({ success: true, session: result.completedSession });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to complete session.' }, { status: 500 });
  }
}
