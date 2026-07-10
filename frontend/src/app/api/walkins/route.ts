import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getBranchName } from '@/lib/constants';
import { triggerWebhook } from '@/lib/webhooks';

async function getNextCounselor(branchId: string) {
  const candidates = await prisma.counselorProfile.findMany({
    where: { user: { branchId }, status: 'Available', assignedStudentId: null },
    include: { user: true }, orderBy: { id: 'asc' },
  });
  return candidates.length > 0 ? candidates[0] : null;
}

export async function GET() {
  try {
    const list = await prisma.student.findMany({ include: { sessions: true, queueEntry: true }, orderBy: { walkinDate: 'desc' } });
    return NextResponse.json(list);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch walkins' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { studentName, phone, email, course, branchId, remarks, source } = await req.json();
    if (!studentName || !phone || !branchId || !course) {
      return NextResponse.json({ error: 'Name, phone, branchId, and course are required.' }, { status: 400 });
    }
    const branchName = getBranchName(branchId);

    const existingPhone = await prisma.student.findFirst({ where: { phone } });
    if (existingPhone) {
      await prisma.failedWalkin.create({ data: { name: studentName, phone, email: email || '', course, branchId, branchName, source: source || 'Walk-in API', reason: 'Duplicate phone number', details: { studentName, phone, email, course, branchId, branchName, remarks, source } } }).catch(() => {});
      return NextResponse.json({ error: `A student with phone number ${phone} is already registered.` }, { status: 400 });
    }
    if (email) {
      const existingEmail = await prisma.student.findFirst({ where: { email } });
      if (existingEmail) {
        await prisma.failedWalkin.create({ data: { name: studentName, phone, email, course, branchId, branchName, source: source || 'Walk-in API', reason: 'Duplicate email address', details: { studentName, phone, email, course, branchId, branchName, remarks, source } } }).catch(() => {});
        return NextResponse.json({ error: `A student with email ${email} is already registered.` }, { status: 400 });
      }
    }

    const counselor = await getNextCounselor(branchId);
    const status = counselor ? 'Assigned' : 'Waiting';
    const assignedTime = counselor ? 'TBD' : 'Waitlist';

    const result = await prisma.$transaction(async (tx: any) => {
      const student = await tx.student.create({ data: { name: studentName, phone, email: email || null, course, branchId, branchName, status, remarks: remarks || '', source: source || 'Walk-in API', details: { branchId, branchName, email } } });
      const maxPosition = await tx.queueEntry.aggregate({ where: { student: { branchId }, status: 'active' }, _max: { position: true } });
      const nextPos = (maxPosition._max.position || 100) + 1;
      const queueEntry = await tx.queueEntry.create({ data: { id: String(nextPos), studentId: student.id, position: nextPos, status: 'active' } });
      let session = null;
      if (counselor) {
        await tx.counselorProfile.update({ where: { id: counselor.id }, data: { assignedStudentId: student.id } });
        session = await tx.counselingSession.create({ data: { studentId: student.id, counselorId: counselor.id, status: 'ASSIGNED', notes: '' } });
      }
      return { student, queueEntry, session };
    });

    const walkinPayload = { id: result.student.id, studentName: result.student.name, contact: result.student.phone, phone: result.student.phone, email: email || '', branchId, branchName, counselorId: counselor ? counselor.id : 'unassigned', counselorName: counselor ? counselor.user.name : 'Unassigned', purpose: result.student.course, courseInterested: result.student.course, time: assignedTime, status: result.student.status, createdAt: result.student.createdAt.toISOString(), source: result.student.source, remarks: result.student.remarks };
    const tokenPayload = { id: parseInt(result.queueEntry.id), branchId, counselorId: counselor ? counselor.id : 'unassigned', purpose: result.student.course, time: assignedTime, branchName, counselorName: counselor ? counselor.user.name : 'Unassigned', location: counselor ? counselor.user.locationId : 'Waitlist', walkinId: result.student.id, status: 'active' };

    triggerWebhook('Walk-in Created', { walkin: walkinPayload, token: tokenPayload });
    triggerWebhook('Token Generated', { token: tokenPayload, walkin: walkinPayload, branch: branchName });
    triggerWebhook('Status Changed', { event: 'Walk-in Created', walkinId: result.student.id, status: result.student.status });
    if (counselor) {
      triggerWebhook('Counsellor Assigned', { walkin: walkinPayload, counselorId: counselor.id, counselorName: counselor.user.name, session: result.session });
      triggerWebhook('Status Changed', { event: 'Counsellor Assigned', walkinId: result.student.id, counselorId: counselor.id });
    }

    return NextResponse.json({ success: true, walkin: walkinPayload, token: tokenPayload }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create walkin' }, { status: 500 });
  }
}
