import { getSession } from '../../lib/auth';
import { getStudents } from '../../actions/walkinActions';
import { getCounselors } from '../../actions/counselorActions';
import DashboardClient from './DashboardClient';
import { redirect } from 'next/navigation';
import { prisma } from '../../lib/db';
import { getBranchName } from '../../lib/constants';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  // Step 1: Auth check
  let user;
  try {
    user = await getSession();
  } catch (e) {
    console.error('[Dashboard] getSession threw:', e);
    redirect('/login');
  }

  if (!user) {
    redirect('/login');
  }

  // Step 2: DB latency check (non-critical)
  let dbLatency: number | null = null;
  try {
    const startDb = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    dbLatency = Date.now() - startDb;
  } catch (e) {
    console.error('[Dashboard] DB latency check failed:', e);
  }

  // Step 3: Webhook status (non-critical)
  let webhookStatus: string | null = null;
  try {
    const totalSubs = await prisma.webhookSubscription.count({ where: { deletedAt: null } });
    if (totalSubs > 0) {
      const activeSubs = await prisma.webhookSubscription.count({ where: { enabled: true, deletedAt: null } });
      const recentLogs = await prisma.webhookLog.findMany({ take: 50, orderBy: { triggeredAt: 'desc' } });
      if (recentLogs.length > 0) {
        const successes = recentLogs.filter(l => l.status === 'Success').length;
        webhookStatus = `Active (${Math.round((successes / recentLogs.length) * 100)}%)`;
      } else {
        webhookStatus = `Active (${Math.round((activeSubs / totalSubs) * 100)}%)`;
      }
    }
  } catch (e) {
    console.error('[Dashboard] Webhook status failed:', e);
  }

  // Step 4: Load students and counselors
  let students: any[] = [];
  let rawCounselors: any[] = [];
  try {
    [students, rawCounselors] = await Promise.all([getStudents(), getCounselors()]);
  } catch (e) {
    console.error('[Dashboard] Failed to load students/counselors:', e);
  }

  // Step 5: Map raw Prisma CounselorProfile (nested user) to flat shape
  const counselors = rawCounselors.map((c: any) => ({
    id: c.id,
    name: c.user?.name || c.name || '',
    roleId: c.user?.roleId || '',
    roleName: c.user?.roleId || '',
    departmentId: c.user?.departmentId || '',
    departmentName: c.user?.departmentId || '',
    branchId: c.user?.branchId || '',
    branchName: getBranchName(c.user?.branchId || ''),
    location: c.user?.locationId || '',
    availability: c.availability || [],
    status: c.status || 'Available',
    assignedStudentId: c.assignedStudentId || null,
  }));

  return (
    <DashboardClient
      initialWalkins={students as any}
      initialCounselors={counselors}
      user={user}
      dbLatency={dbLatency}
      webhookStatus={webhookStatus}
    />
  );
}
