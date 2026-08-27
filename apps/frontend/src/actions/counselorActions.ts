'use server';

import { prisma } from '../lib/db';
import { getBranchName, getDepartment, getRole } from '../lib/constants';

// ─── READ: Call Prisma directly ───────────────────────────────────────────────

export async function getCounselors() {
  try {
    const list = await prisma.counselorProfile.findMany({
      include: { user: true, sessions: true, convertedLeads: true },
      orderBy: { id: 'asc' },
    });
    // Exclude system/admin/non-counselor accounts from the counselors list
    const EXCLUDED_NAMES = ['codegnan', 'jaya sri', 'jayasri', 'jayasree', 'bhanu satish', 'bhanu', 'anush', 'anusha', 'admin', 'super admin'];
    const isExcluded = (name: string) => {
      const n = (name || '').toLowerCase().trim();
      return EXCLUDED_NAMES.some(ex => n.includes(ex));
    };

    return list
      .filter((c) => !isExcluded(c.name || c.user?.name || ''))
      .map((c) => {
      const branchId = c.branchId || c.user?.branchId || 'branch_jntu1';
      return {
        id: c.id,
        userId: c.userId || c.user?.id,
        name: c.name || c.user?.name || 'Staff Counselor',
        email: c.email || c.user?.email || '',
        roleId: c.roleId || c.user?.roleId || 'role_counselor',
        roleName: getRole(c.roleId || c.user?.roleId || 'role_counselor'),
        departmentId: c.departmentId || c.user?.departmentId || 'dept_sales',
        departmentName: c.departmentName || getDepartment(c.departmentId || 'dept_sales'),
        branchId,
        branchName: c.branchName || getBranchName(branchId),
        location: c.location || c.user?.locationId || 'Hyderabad',
        availability: Array.isArray(c.availability) && c.availability.length > 0 ? c.availability : ['09:00 AM - 06:00 PM'],
        status: c.status || 'Available',
        assignedStudentId: c.assignedStudentId,
        sessions: c.sessions || [],
        convertedLeads: c.convertedLeads || [],
      };
    });
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

export async function deleteCounselor(counselorId: string) {
  try {
    const res = await fetch(`${getBaseUrl()}/api/counselors/${counselorId}`, {
      method: 'DELETE',
    });
    const data = await res.json();
    if (!res.ok) return { error: data.error || 'Failed to delete counselor.' };
    return { success: true };
  } catch (err: any) {
    return { error: err.message || 'Failed to delete counselor.' };
  }
}
