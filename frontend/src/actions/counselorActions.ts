'use server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';

export async function getCounselors() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/counselors`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch counselors');
    return await res.json();
  } catch (err) {
    console.error('getCounselors error:', err);
    return [];
  }
}

export async function updateCounselorStatus(counselorId: string, status: string) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/counselors/${counselorId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status })
    });

    const data = await res.json();
    if (!res.ok) {
      return { error: data.error || 'Failed to update counselor status.' };
    }

    return {
      success: true,
      counselor: data.counselor
    };
  } catch (err: any) {
    console.error('updateCounselorStatus error:', err);
    return { error: err.message || 'Failed to update counselor status.' };
  }
}

export async function createCounselor(name: string, departmentId: string, branchId: string, location: string) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/counselors`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, departmentId, branchId, location })
    });

    const data = await res.json();
    if (!res.ok) {
      return { error: data.error || 'Failed to register counselor.' };
    }

    return {
      success: true,
      counselor: data.counselor
    };
  } catch (err: any) {
    console.error('createCounselor error:', err);
    return { error: err.message || 'Failed to register counselor.' };
  }
}

export async function updateCounselorDetails(counselorId: string, patch: any) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/counselors/${counselorId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(patch)
    });

    const data = await res.json();
    if (!res.ok) {
      return { error: data.error || 'Failed to update counselor details.' };
    }

    return {
      success: true,
      counselor: data.counselor
    };
  } catch (err: any) {
    console.error('updateCounselorDetails error:', err);
    return { error: err.message || 'Failed to update counselor details.' };
  }
}
