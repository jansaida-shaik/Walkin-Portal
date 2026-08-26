'use server';

import { prisma } from '../lib/db';

// ─── READ: Call Prisma directly ───────────────────────────────────────────────

export async function getCounselors() {
  try {
    const list = await prisma.counselorProfile.findMany({
      include: { user: true },
      orderBy: { id: 'asc' },
    });
    return list.map((c) => ({
      ...c,
      name: c.user?.name || 'Counselor',
      email: c.user?.email,
      roleId: c.user?.roleId,
      branchId: c.user?.branchId || 'branch_jntu1',
      branchName: c.user?.branchId === 'branch_jntu1' ? '1st Campus (JNTU-HYD)' : '1st Campus (JNTU-HYD)',
    }));
  } catch (err) {
    console.error('getCounselors error:', err);
    return [];
  }
}

// ─── WRITE: API routes (triggered from client components) ─────────────────────

const getBaseUrl = () => {
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
};

export async function updateCounselorStatus(counselorId: string, status: string) {
  try {
    const res = await fetch(`${getBaseUrl()}/api/counselors/${counselorId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (!res.ok) return { error: data.error || 'Failed to update counselor status.' };
    return { success: true, counselor: data.counselor };
  } catch (err: any) {
    return { error: err.message || 'Failed to update counselor status.' };
  }
}

export async function createCounselor(name: string, departmentId: string, branchId: string, location: string) {
  try {
    const res = await fetch(`${getBaseUrl()}/api/counselors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, departmentId, branchId, location }),
    });
    const data = await res.json();
    if (!res.ok) return { error: data.error || 'Failed to register counselor.' };
    return { success: true, counselor: data.counselor };
  } catch (err: any) {
    return { error: err.message || 'Failed to register counselor.' };
  }
}

export async function updateCounselorDetails(counselorId: string, patch: any) {
  try {
    const res = await fetch(`${getBaseUrl()}/api/counselors/${counselorId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
    const data = await res.json();
    if (!res.ok) return { error: data.error || 'Failed to update counselor details.' };
    return { success: true, counselor: data.counselor };
  } catch (err: any) {
    return { error: err.message || 'Failed to update counselor details.' };
  }
}
