'use server';

import { prisma } from '../lib/db';
import { getBranchName } from '../lib/constants';
import { triggerWebhook } from '../lib/webhooks';
import { validateSession } from '../lib/auth';
import { formatPhoneNumber, normalizePhoneForStorage } from '../lib/formatters';

// ─── READ OPERATIONS: Call Prisma directly (no HTTP fetch) ───────────────────

export async function getStudents() {
  try {
    return await prisma.student.findMany({
      include: { sessions: true, queueEntry: true },
      orderBy: { walkinDate: 'desc' },
    });
  } catch (err) {
    console.error('getStudents error:', err);
    return [];
  }
}

export async function getFailedWalkins() {
  try {
    return await prisma.failedWalkin.findMany({ orderBy: { createdAt: 'desc' } });
  } catch (err) {
    console.error('getFailedWalkins error:', err);
    return [];
  }
}

// ─── WRITE OPERATIONS: Still go through API routes (client-callable) ─────────

const getBaseUrl = () => {
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
};

export async function createWalkin(state: any, formData: FormData) {
  const studentName = formData.get('studentName') as string;
  const rawPhone    = (formData.get('student_phone') || formData.get('phone')) as string;
  const countryCode = formData.get('countryCode') as string;
  const phone       = normalizePhoneForStorage(rawPhone.startsWith('+') ? rawPhone : `${countryCode || '+91'}${rawPhone}`);
  const email       = (formData.get('email') as string || '').trim().toLowerCase();
  const course      = formData.get('course') as string;
  const branchId    = formData.get('branchId') as string;
  const remarks     = formData.get('remarks') as string || '';
  const source      = formData.get('source') as string || 'Walk-in';
  const walkinType  = (formData.get('walkinType') as string) || 'single';
  const parentAccompanied = (formData.get('parentAccompanied') as string) || 'solo';
  const parentName  = (formData.get('parentName') as string) || '';
  const parentPhone = (formData.get('parentPhone') as string) || '';

  if (!studentName || !phone || !branchId || !course) return { error: 'Name, phone, branch, and course are required.' };
  if (!email) return { error: 'Email address is required.' };

  try {
    const branchName = getBranchName(branchId);
    const existingPhone = await prisma.student.findFirst({ where: { phone } });
    if (existingPhone) {
      await prisma.failedWalkin.create({ data: { name: studentName, phone, email: email || '', course, branchId, branchName, source: source || 'Walk-in API', reason: 'Duplicate phone number', details: { studentName, phone, email, course, branchId, branchName, remarks, source } } }).catch(() => {});
      return { error: `A student with student phone number ${phone} is already registered.` };
    }
    if (email) {
      const existingEmail = await prisma.student.findFirst({ where: { email } });
      if (existingEmail) {
        await prisma.failedWalkin.create({ data: { name: studentName, phone, email, course, branchId, branchName, source: source || 'Walk-in API', reason: 'Duplicate email address', details: { studentName, phone, email, course, branchId, branchName, remarks, source } } }).catch(() => {});
        return { error: `A student with email ${email} is already registered.` };
      }
    }

    const candidates = await prisma.counselorProfile.findMany({
      where: { user: { branchId }, status: 'Available', assignedStudentId: null },
      include: { user: true }, orderBy: { id: 'asc' },
    });
    const counselor = candidates.length > 0 ? candidates[0] : null;
    const status = counselor ? 'Assigned' : 'Waiting';
    const assignedTime = counselor ? 'TBD' : 'Waitlist';

    const result = await prisma.$transaction(async (tx: any) => {
      const student = await tx.student.create({ data: { name: studentName, phone, email: email || null, course, branchId, branchName, status, remarks: remarks || '', source: source || 'Walk-in API', details: { branchId, branchName, email, walkinType, parentAccompanied, parentName, parentPhone } } });
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

    return { success: true, walkin: walkinPayload, token: tokenPayload };
  } catch (err: any) {
    return { error: err.message || 'Failed to check in student.' };
  }
}

export async function startCounsellingSession(studentId: string) {
  try {
    const res = await fetch(`${getBaseUrl()}/api/sessions/start`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ studentId }) });
    const data = await res.json();
    if (!res.ok) return { error: data.error || 'Failed to start session.' };
    return { success: true, session: data.session };
  } catch (err: any) {
    return { error: err.message || 'Failed to start session.' };
  }
}

export async function cancelCounsellingSession(studentId: string) {
  try {
    await validateSession(['role_super_admin']);
    const res = await fetch(`${getBaseUrl()}/api/sessions/cancel`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ studentId }) });
    const data = await res.json();
    if (!res.ok) return { error: data.error || 'Failed to cancel session.' };
    return { success: true, session: data.session };
  } catch (err: any) {
    return { error: err.message || 'Failed to cancel session.' };
  }
}

export async function endCounsellingSession(studentId: string, notes: string, followUpStatus: string, transcript?: string, summary?: string) {
  try {
    const res = await fetch(`${getBaseUrl()}/api/sessions/end`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ studentId, notes, followUpStatus, transcript, summary }) });
    const data = await res.json();
    if (!res.ok) return { error: data.error || 'Failed to complete session.' };
    return { success: true, session: data.session };
  } catch (err: any) {
    return { error: err.message || 'Failed to complete session.' };
  }
}

export async function uploadSessionAudio(sessionId: string, base64Audio: string) {
  try {
    const audioBuffer = Buffer.from(base64Audio, 'base64');
    const res = await fetch(`${getBaseUrl()}/api/sessions/${sessionId}/audio`, { method: 'POST', headers: { 'Content-Type': 'audio/webm' }, body: audioBuffer });
    const data = await res.json();
    if (!res.ok) return { error: data.error || 'Failed to upload session audio.' };
    return { success: true, audioUrl: data.audioUrl, session: data.session };
  } catch (err: any) {
    return { error: err.message || 'Failed to upload session audio.' };
  }
}

export async function analyzeSessionAudio(sessionId: string) {
  try {
    const res = await fetch(`${getBaseUrl()}/api/sessions/${sessionId}/analyze`, { method: 'POST', headers: { 'Content-Type': 'application/json' } });
    const data = await res.json();
    if (!res.ok) return { error: data.error || 'Failed to analyze audio.' };
    return { success: true, session: data.session };
  } catch (err: any) {
    return { error: err.message || 'Failed to analyze audio.' };
  }
}

export async function updateStudentDetails(studentId: string, patch: any) {
  try {
    const res = await fetch(`${getBaseUrl()}/api/walkins/${studentId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(patch) });
    const data = await res.json();
    if (!res.ok) return { error: data.error || 'Failed to update student.' };
    return { success: true, student: data.student };
  } catch (err: any) {
    return { error: err.message || 'Failed to update student.' };
  }
}

export async function saveSessionNotes(studentId: string, notes: string, followUpStatus: string, summary?: string) {
  try {
    const res = await fetch(`${getBaseUrl()}/api/sessions/notes`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ studentId, notes, followUpStatus, summary }) });
    const data = await res.json();
    if (!res.ok) return { error: data.error || 'Failed to save session notes.' };
    return { success: true, session: data.session };
  } catch (err: any) {
    return { error: err.message || 'Failed to save session notes.' };
  }
}


export async function mergeWalkinsIntoGroup(studentIds: string[], groupName?: string) {
  try {
    if (!studentIds || studentIds.length < 2) {
      return { error: 'At least 2 walk-in candidates are required to create a group walk-in.' };
    }
    const groupId = `grp_${Date.now()}`;
    const students = await prisma.student.findMany({
      where: { id: { in: studentIds } },
    });
    if (students.length < 2) {
      return { error: 'Selected students were not found.' };
    }
    const names = students.map(s => s.name).join(', ');
    const autoGroupName = groupName || `Group of ${students.length} (${names})`;

    await prisma.$transaction(async (tx: any) => {
      for (const st of students) {
        const existingDetails = (st.details as any) || {};
        await tx.student.update({
          where: { id: st.id },
          data: {
            details: {
              ...existingDetails,
              walkinType: 'group',
              groupId,
              groupName: autoGroupName,
              groupMembers: students.map(s => ({ id: s.id, name: s.name, phone: s.phone })),
              groupSize: students.length,
            },
          },
        });
      }
    });

    return { success: true, groupId, groupName: autoGroupName, count: students.length };
  } catch (err: any) {
    return { error: err.message || 'Failed to merge walk-ins into a group.' };
  }
}
