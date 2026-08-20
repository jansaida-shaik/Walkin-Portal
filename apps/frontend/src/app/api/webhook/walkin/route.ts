import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';
import { triggerWebhook } from '../../../../lib/webhooks';
import { getBranchName } from '../../../../lib/constants';

async function getNextCounselor(branchId: string) {
  const candidates = await prisma.counselorProfile.findMany({
    where: {
      user: { branchId },
      status: 'Available',
      assignedStudentId: null
    },
    include: { user: true },
    orderBy: { id: 'asc' }
  });
  
  if (candidates.length === 0) return null;
  return candidates[0];
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { studentName, contact, phone, branchId, purpose, course, source, remarks } = body;

    const actualName = studentName || body.name;
    const actualPhone = phone || contact;
    const actualCourse = course || purpose;

    if (!actualName || !actualPhone || !branchId || !actualCourse) {
      return NextResponse.json({ error: 'Name, Phone, BranchId and Course are required.' }, { status: 400 });
    }

    const branchName = getBranchName(branchId);
    
    // Check if phone number already exists in active entries
    const existing = await prisma.student.findFirst({
      where: {
        phone: actualPhone,
        status: {
          in: ['Waiting', 'Assigned', 'In Session']
        }
      }
    });

    if (existing) {
      return NextResponse.json({ error: 'A student with this phone number is already active in the queue.' }, { status: 400 });
    }

    const counselor = await getNextCounselor(branchId);
    const assignedTime = counselor ? 'TBD' : 'Waitlist';
    const status = counselor ? 'Assigned' : 'Waiting';

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Student
      const student = await tx.student.create({
        data: {
          name: actualName,
          phone: actualPhone,
          course: actualCourse,
          branchId,
          branchName,
          status,
          remarks: remarks || '',
          source: source || 'External Webhook',
          details: { branchId, branchName }
        }
      });

      // 2. Generate Queue Token Position
      const maxPosition = await tx.queueEntry.aggregate({
        where: { student: { branchId }, status: 'active' },
        _max: { position: true }
      });
      const nextPos = (maxPosition._max.position || 100) + 1;

      const queueEntry = await tx.queueEntry.create({
        data: {
          id: String(nextPos),
          studentId: student.id,
          position: nextPos,
          status: 'active'
        }
      });

      // 3. Link Counselor if assigned
      let session = null;
      if (counselor) {
        await tx.counselorProfile.update({
          where: { id: counselor.id },
          data: { assignedStudentId: student.id }
        });

        session = await tx.counselingSession.create({
          data: {
            studentId: student.id,
            counselorId: counselor.id,
            status: 'ASSIGNED',
            notes: ''
          }
        });
      }

      return { student, queueEntry, session };
    });

    const walkinPayload = {
      id: result.student.id,
      studentName: result.student.name,
      contact: result.student.phone,
      phone: result.student.phone,
      branchId,
      branchName,
      counselorId: counselor ? counselor.id : 'unassigned',
      counselorName: counselor ? counselor.user.name : 'Unassigned',
      purpose: result.student.course,
      courseInterested: result.student.course,
      time: assignedTime,
      status: result.student.status,
      createdAt: result.student.createdAt.toISOString(),
      source: result.student.source,
      remarks: result.student.remarks
    };

    const tokenPayload = {
      id: parseInt(result.queueEntry.id),
      branchId,
      counselorId: counselor ? counselor.id : 'unassigned',
      purpose: result.student.course,
      time: assignedTime,
      branchName,
      counselorName: counselor ? counselor.user.name : 'Unassigned',
      location: counselor ? counselor.user.locationId : 'Waitlist',
      walkinId: result.student.id,
      status: 'active'
    };

    await triggerWebhook('Walk-in Created', { walkin: walkinPayload, token: tokenPayload });
    await triggerWebhook('Token Generated', { token: tokenPayload, walkin: walkinPayload, branch: branchName });
    await triggerWebhook('Status Changed', { event: 'Walk-in Created', walkinId: result.student.id, status: result.student.status });

    if (counselor) {
      await triggerWebhook('Counsellor Assigned', { walkin: walkinPayload, counselorId: counselor.id, counselorName: counselor.user.name, session: result.session });
      await triggerWebhook('Status Changed', { event: 'Counsellor Assigned', walkinId: result.student.id, counselorId: counselor.id });
    }

    return NextResponse.json({
      success: true,
      walkin: walkinPayload,
      token: tokenPayload
    });
  } catch (err: any) {
    console.error('Webhook API intake error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error.' }, { status: 500 });
  }
}
