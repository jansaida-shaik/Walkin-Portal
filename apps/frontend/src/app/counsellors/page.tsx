import { getSession } from '../../lib/auth';
import { getCounselors } from '../../actions/counselorActions';
import { branches } from '../../lib/constants';
import CounselorsClient from './CounselorsClient';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function CounselorsPage() {
  const user = await getSession();
  if (!user) {
    redirect('/login');
  }

  const rawCounselors = await getCounselors();
  const counselors = rawCounselors.map((c: any) => ({
    id: c.id,
    name: c.name || c.user?.name || 'Counselor',
    email: c.email || c.user?.email || '',
    departmentId: c.departmentId || '',
    departmentName: c.departmentName || 'Sales',
    branchId: c.branchId || c.user?.branchId || '',
    branchName: c.branchName || branches.find(b => b.id === (c.branchId || c.user?.branchId))?.name || '—',
    location: c.user?.locationId || c.location || '',
    status: c.status || 'Offline',
    availability: Array.isArray(c.availability) && c.availability.length > 0 ? c.availability : ['09:00 AM - 06:00 PM'],
    userId: c.userId || '',
  }));

  return (
    <CounselorsClient
      initialCounselors={counselors as any}
      branches={branches}
      user={user}
    />
  );
}
