import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { triggerWebhook } from '@/lib/webhooks';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const counselorId = (await params).id;
    const { status } = await req.json();

    const validStatuses = ['available', 'busy', 'unavailable', 'on_leave', 'Available', 'Busy', 'Offline', 'Break'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status value.' }, { status: 400 });
    }

    const mapStatus = (s: string) => {
      const low = s.toLowerCase();
      if (low === 'available') return 'Available';
      if (low === 'busy') return 'Busy';
      if (low === 'break' || low === 'on_leave') return 'Break';
      return 'Offline';
    };
    const targetStatus = mapStatus(status);

    const result = await prisma.$transaction(async (tx: any) => {
      const profile = await tx.counselorProfile.update({ where: { id: counselorId }, data: { status: targetStatus }, include: { user: true } });
      let nextStudent = null, nextSession = null;

      if (targetStatus === 'Available') {
        const clearedProfile = await tx.counselorProfile.update({ where: { id: counselorId }, data: { assignedStudentId: null }, include: { user: true } });
        const nextQueue = await tx.queueEntry.findFirst({
          where: { student: { branchId: clearedProfile.user.branchId, status: 'Waiting' }, status: 'active' },
          include: { student: true }, orderBy: { position: 'asc' },
        });
        if (nextQueue) {
          nextStudent = nextQueue.student;
          await tx.counselorProfile.update({ where: { id: counselorId }, data: { assignedStudentId: nextStudent.id } });
          await tx.student.update({ where: { id: nextStudent.id }, data: { status: 'Assigned' } });
          nextSession = await tx.counselingSession.create({ data: { studentId: nextStudent.id, counselorId, status: 'ASSIGNED', notes: '' } });
        }
      }
      return { profile, nextStudent, nextSession };
    });

    const updated = result.profile;
    triggerWebhook('Status Changed', { event: 'Counselor Status Updated', counselorId, status: updated.status });
    const statusLower = status.toLowerCase();
    if (statusLower === 'available') triggerWebhook('Counsellor Available', { counselorId, counselorName: updated.user.name, status: updated.status });
    else if (statusLower === 'busy') triggerWebhook('Counsellor Busy', { counselorId, counselorName: updated.user.name, status: updated.status });
    else if (statusLower === 'offline') triggerWebhook('Counsellor Offline', { counselorId, counselorName: updated.user.name, status: updated.status });

    if (result.nextStudent && result.nextSession) {
      const walkinPayload = { id: result.nextStudent.id, studentName: result.nextStudent.name, phone: result.nextStudent.phone, status: 'Assigned', counselorId: updated.id, counselorName: updated.user.name };
      triggerWebhook('Counsellor Assigned', { walkin: walkinPayload, counselorId: updated.id, counselorName: updated.user.name, session: result.nextSession });
      triggerWebhook('Status Changed', { event: 'Counsellor Assigned', walkinId: result.nextStudent.id, counselorId: updated.id });
      triggerWebhook('Queue Updated', { event: 'Auto-Assigned', walkinId: result.nextStudent.id, counselorId: updated.id, branchId: updated.user.branchId });
    }

    return NextResponse.json({ success: true, counselor: { id: updated.id, name: updated.user.name, branchId: updated.user.branchId, status: updated.status, assignedStudentId: updated.assignedStudentId } });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update counselor status.' }, { status: 500 });
  }
}
