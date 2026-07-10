'use server';

import { validateSession } from '../lib/auth';

const getBaseUrl = () => {
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8080';
};

export async function getStudents() {
  try {
    const res = await fetch(`${getBaseUrl()}/api/walkins`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch walkins');
    return await res.json();
  } catch (err) {
    console.error('getStudents error:', err);
    return [];
  }
}

export async function createWalkin(state: any, formData: FormData) {
  const studentName = formData.get('studentName') as string;
  const rawPhone    = formData.get('phone') as string;
  const countryCode = formData.get('countryCode') as string;
  const phone       = rawPhone.startsWith('+') ? rawPhone : `${countryCode || ''}${rawPhone}`;
  const email       = (formData.get('email') as string || '').trim().toLowerCase();
  const course      = formData.get('course') as string;
  const branchId    = formData.get('branchId') as string;
  const remarks     = formData.get('remarks') as string || '';
  const source      = formData.get('source') as string || 'Walk-in';

  if (!studentName || !phone || !branchId || !course) return { error: 'Name, phone, branch, and course are required.' };
  if (!email) return { error: 'Email address is required.' };

  try {
    const res = await fetch(`${getBaseUrl()}/api/walkins`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentName, phone, email, course, branchId, remarks, source }),
    });
    const data = await res.json();
    if (!res.ok) return { error: data.error || 'Failed to check in student.' };
    return { success: true, walkin: data.walkin, token: data.token };
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

export async function getFailedWalkins() {
  try {
    const res = await fetch(`${getBaseUrl()}/api/failed-walkins`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch failed walkins');
    return await res.json();
  } catch (err) {
    console.error('getFailedWalkins error:', err);
    return [];
  }
}
