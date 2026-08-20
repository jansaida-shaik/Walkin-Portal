import { getSession } from '../../lib/auth';
import { getStudents } from '../../actions/walkinActions';
import { getCounselors } from '../../actions/counselorActions';
import DashboardClient from './DashboardClient';
import { redirect } from 'next/navigation';
import { prisma } from '../../lib/db';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const user = await getSession();
  if (!user) {
    redirect('/login');
  }

  // Measure database query responsiveness latency
  let dbLatency: number | null = null;
  try {
    const startDb = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    dbLatency = Date.now() - startDb;
  } catch (e) {
    console.error('Failed to run DB latency check:', e);
  }

  // Calculate webhook operational success rate or enabled subscriptions percent
  let webhookStatus: string | null = null;
  try {
    const totalSubs = await prisma.webhookSubscription.count({
      where: { deletedAt: null },
    });

    if (totalSubs > 0) {
      const activeSubs = await prisma.webhookSubscription.count({
        where: { enabled: true, deletedAt: null },
      });

      const recentLogs = await prisma.webhookLog.findMany({
        take: 50,
        orderBy: { triggeredAt: 'desc' },
      });

      if (recentLogs.length > 0) {
        const successes = recentLogs.filter(l => l.status === 'Success').length;
        const successRate = Math.round((successes / recentLogs.length) * 100);
        webhookStatus = `Active (${successRate}%)`;
      } else {
        const activePercent = Math.round((activeSubs / totalSubs) * 100);
        webhookStatus = `Active (${activePercent}%)`;
      }
    } else {
      // Data does not exist
      webhookStatus = null;
    }
  } catch (e) {
    console.error('Failed to get webhook telemetry status:', e);
  }

  const [students, rawCounselors] = await Promise.all([
    getStudents(),
    getCounselors()
  ]);

  // Map raw Prisma CounselorProfile (with nested user) to the flat shape DashboardClient expects
  const counselors = rawCounselors.map((c: any) => ({
    id: c.id,
    name: c.user?.name || '',
    roleId: c.user?.roleId || '',
    roleName: c.user?.roleId || '',
    departmentId: c.user?.departmentId || '',
    departmentName: c.user?.departmentId || '',
    branchId: c.user?.branchId || '',
    branchName: c.user?.branchId || '',
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
