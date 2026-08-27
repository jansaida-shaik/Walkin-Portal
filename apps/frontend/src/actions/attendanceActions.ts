'use server';

const getBaseUrl = () => {
  if (process.env.INTERNAL_BACKEND_URL) return process.env.INTERNAL_BACKEND_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
};

export async function clockIn(counselorId: string, notes?: string) {
  try {
    const res = await fetch(`${getBaseUrl()}/api/attendance/clock-in`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ counselorId, notes }),
      cache: 'no-store'
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to clock in.');
    return { success: true, attendance: data.attendance };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function clockOut(counselorId: string) {
  try {
    const res = await fetch(`${getBaseUrl()}/api/attendance/clock-out`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ counselorId }),
      cache: 'no-store'
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to clock out.');
    return { success: true, attendance: data.attendance };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function startBreak(counselorId: string, breakType: string = 'Lunch', reason?: string) {
  try {
    const res = await fetch(`${getBaseUrl()}/api/attendance/break/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ counselorId, breakType, reason }),
      cache: 'no-store'
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to start break.');
    return { success: true, break: data.break };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function endBreak(counselorId: string) {
  try {
    const res = await fetch(`${getBaseUrl()}/api/attendance/break/end`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ counselorId }),
      cache: 'no-store'
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to end break.');
    return { success: true, attendance: data.attendance };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function completeBuffer(counselorId: string) {
  try {
    const res = await fetch(`${getBaseUrl()}/api/attendance/buffer/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ counselorId }),
      cache: 'no-store'
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to complete buffer.');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function getTodayAttendance(counselorId: string, branchId?: string) {
  try {
    const url = new URL(`${getBaseUrl()}/api/attendance/today`);
    url.searchParams.set('counselorId', counselorId);
    if (branchId) url.searchParams.set('branchId', branchId);

    const res = await fetch(url.toString(), { cache: 'no-store' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to get today attendance.');
    return { success: true, ...data };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function getAttendanceSummary(date?: string, branchId?: string) {
  try {
    const url = new URL(`${getBaseUrl()}/api/attendance/summary`);
    if (date) url.searchParams.set('date', date);
    if (branchId) url.searchParams.set('branchId', branchId);

    const res = await fetch(url.toString(), { cache: 'no-store' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to get attendance summary.');
    return { success: true, summary: data.summary, date: data.date };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
