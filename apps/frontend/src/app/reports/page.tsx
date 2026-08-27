import { getSession } from '../../lib/auth';
import { prisma } from '../../lib/db';
import { branches } from '../../lib/constants';
import ReportsClient from './ReportsClient';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function ReportsPage() {
  const user = await getSession();
  if (!user) redirect('/login');

  const roleId = user.roleId;
  const canAccess =
    roleId === 'role_super_admin' ||
    roleId === 'role_admin' ||
    roleId === 'role_manager' ||
    roleId === 'role_counselor' ||
    roleId === 'role_frontdesk';

  if (!canAccess) redirect('/dashboard');

  // Load 100% LIVE data from PostgreSQL
  const [convertedLeads, students, counselors] = await Promise.all([
    prisma.convertedLead.findMany({
      include: { counselor: true },
      orderBy: { enrollmentDate: 'desc' },
    }),
    prisma.student.findMany({
      where: { deletedAt: null },
      include: {
        sessions: true,
        queueEntry: true,
      },
      orderBy: { walkinDate: 'desc' },
    }),
    prisma.counselorProfile.findMany({
      orderBy: { name: 'asc' },
    }),
  ]);

  return (
    <ReportsClient
      convertedLeads={convertedLeads as any}
      students={students as any}
      counselors={counselors as any}
      branches={branches as any}
      user={user}
    />
  );
}
