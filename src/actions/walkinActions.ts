'use server';

import { validateSession } from '../lib/auth';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';

export async function getStudents() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/walkins`, { cache: 'no-store' });
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

  if (!studentName || !phone || !branchId || !course) {
    return { error: 'Name, phone, branch, and course are required.' };
  }
  if (!email) {
    return { error: 'Email address is required.' };
  }

  try {
    const res = await fetch(`${BACKEND_URL}/api/walkins`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        studentName,
        phone,
        email,
        course,
        branchId,
        remarks,
        source
      })
    });

    const data = await res.json();
    if (!res.ok) {
      return { error: data.error || 'Failed to check in student.' };
    }

    return {
      success: true,
      walkin: data.walkin,
      token: data.token
    };
  } catch (err: any) {
    console.error('createWalkin action error:', err);
    return { error: err.message || 'Failed to check in student.' };
  }
}

export async function startCounsellingSession(studentId: string) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/sessions/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ studentId })
    });

    const data = await res.json();
    if (!res.ok) {
      return { error: data.error || 'Failed to start session.' };
    }

    return { success: true, session: data.session };
  } catch (err: any) {
    console.error('startSession error:', err);
    return { error: err.message || 'Failed to start session.' };
  }
}

export async function cancelCounsellingSession(studentId: string) {
  try {
    // Only allow super admins to cancel the start of counselling
    await validateSession(['role_super_admin']);

    const res = await fetch(`${BACKEND_URL}/api/sessions/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ studentId })
    });

    const data = await res.json();
    if (!res.ok) {
      return { error: data.error || 'Failed to cancel session.' };
    }

    return { success: true, session: data.session };
  } catch (err: any) {
    console.error('cancelCounsellingSession error:', err);
    return { error: err.message || 'Failed to cancel session.' };
  }
}

export async function endCounsellingSession(studentId: string, notes: string, followUpStatus: string, transcript?: string, summary?: string) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/sessions/end`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ studentId, notes, followUpStatus, transcript, summary })
    });

    const data = await res.json();
    if (!res.ok) {
      return { error: data.error || 'Failed to complete session.' };
    }

    return { success: true, session: data.session };
  } catch (err: any) {
    console.error('endSession error:', err);
    return { error: err.message || 'Failed to complete session.' };
  }
}

export async function uploadSessionAudio(sessionId: string, audioBlob: Blob) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/sessions/${sessionId}/audio`, {
      method: 'POST',
      headers: {
        'Content-Type': 'audio/webm'
      },
      body: audioBlob
    });

    const data = await res.json();
    if (!res.ok) {
      return { error: data.error || 'Failed to upload session audio.' };
    }

    return { success: true, audioUrl: data.audioUrl, session: data.session };
  } catch (err: any) {
    console.error('uploadSessionAudio error:', err);
    return { error: err.message || 'Failed to upload session audio.' };
  }
}

export async function analyzeSessionAudio(sessionId: string) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/sessions/${sessionId}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await res.json();
    if (!res.ok) {
      return { error: data.error || 'Failed to analyze audio.' };
    }

    return { success: true, session: data.session };
  } catch (err: any) {
    console.error('analyzeSessionAudio error:', err);
    return { error: err.message || 'Failed to analyze audio.' };
  }
}

export async function updateStudentDetails(studentId: string, patch: any) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/walkins/${studentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(patch)
    });

    const data = await res.json();
    if (!res.ok) {
      return { error: data.error || 'Failed to update student.' };
    }

    return { success: true, student: data.student };
  } catch (err: any) {
    console.error('updateStudentDetails error:', err);
    return { error: err.message || 'Failed to update student.' };
  }
}

export async function saveSessionNotes(studentId: string, notes: string, followUpStatus: string, summary?: string) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/sessions/notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ studentId, notes, followUpStatus, summary })
    });

    const data = await res.json();
    if (!res.ok) {
      return { error: data.error || 'Failed to save session notes.' };
    }

    return { success: true, session: data.session };
  } catch (err: any) {
    console.error('saveSessionNotes error:', err);
    return { error: err.message || 'Failed to save session notes.' };
  }
}

export async function getFailedWalkins() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/failed-walkins`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch failed walkins');
    return await res.json();
  } catch (err) {
    console.error('getFailedWalkins error:', err);
    return [];
  }
}
