import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { triggerWebhook } from '@/lib/webhooks';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const studentId = (await params).id;
    const patch = await req.json();

    const result = await prisma.$transaction(async (tx: any) => {
      const student = await tx.student.findUnique({ where: { id: studentId } });
      if (!student) throw new Error('Student not found.');

      let updatedStatus = patch.status || student.status;
      let details = (student.details as any) || {};
      if (patch.priority) details.priority = patch.priority;
      if (patch.details) details = { ...details, ...patch.details };

      if (patch.counselorId !== undefined) {
        await tx.counselorProfile.updateMany({ where: { assignedStudentId: studentId }, data: { assignedStudentId: null } });
        if (patch.counselorId !== 'unassigned') {
          const c = await tx.counselorProfile.findUnique({ where: { id: patch.counselorId }, include: { user: true } });
          if (c) {
            await tx.counselorProfile.update({ where: { id: c.id }, data: { assignedStudentId: studentId } });
            updatedStatus = 'Assigned';
            const existingSession = await tx.counselingSession.findFirst({ where: { studentId, counselorId: c.id, status: 'ASSIGNED' } });
            if (!existingSession) await tx.counselingSession.create({ data: { studentId, counselorId: c.id, status: 'ASSIGNED', notes: '' } });
          }
        } else {
          updatedStatus = 'Waiting';
          await tx.counselingSession.updateMany({ where: { studentId, status: { in: ['ASSIGNED', 'IN_SESSION'] } }, data: { status: 'CANCELLED' } });
        }
      }

      return tx.student.update({ where: { id: studentId }, data: { name: patch.name || student.name, phone: patch.phone || student.phone, course: patch.course || student.course, branchName: patch.branchName || student.branchName, status: updatedStatus, source: patch.source || student.source, remarks: patch.remarks !== undefined ? patch.remarks : student.remarks, details } });
    });

    await prisma.auditLog.create({ data: { action: 'UPDATE_STUDENT', module: 'Students', newValue: `Updated student ID ${studentId} with values: ${JSON.stringify(patch)}` } });
    triggerWebhook('Walk-in Updated', { walkinId: studentId, walkin: result });
    triggerWebhook('Status Changed', { event: 'Walk-in Updated', walkinId: studentId, status: result.status });
    if (result.status === 'Cancelled') triggerWebhook('Walk-in Cancelled', { walkinId: studentId, walkin: result });
    else if (result.status === 'No Show') triggerWebhook('Walk-in No-Show', { walkinId: studentId, walkin: result });

    return NextResponse.json({ success: true, student: result });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update student.' }, { status: 500 });
  }
}
