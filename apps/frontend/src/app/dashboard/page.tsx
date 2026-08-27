import { getSession } from '../../lib/auth';
import { getStudents } from '../../actions/walkinActions';
import { getCounselors } from '../../actions/counselorActions';
import DashboardClient from './DashboardClient';
import { redirect } from 'next/navigation';
import { prisma } from '../../lib/db';
import { getBranchName } from '../../lib/constants';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
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

  // DB latency check
  let dbLatency: number | null = null;
  try {
    const startDb = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    dbLatency = Date.now() - startDb;
  } catch (e) {
    console.error('[Dashboard] DB latency check failed:', e);
  }

  // Webhook status
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

  // Load 100% LIVE data (Master Converted Leads, Walk-ins, and Counselors)
  let students: any[] = [];
  let rawCounselors: any[] = [];
  let convertedLeads: any[] = [];

  try {
    [students, rawCounselors, convertedLeads] = await Promise.all([
      getStudents(),
      getCounselors(),
      prisma.convertedLead.findMany({
        orderBy: { enrollmentDate: 'desc' },
      }),
    ]);
  } catch (e) {
    console.error('[Dashboard] Failed to load dashboard data:', e);
  }

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
      convertedLeads={convertedLeads as any}
      user={user}
      dbLatency={dbLatency}
      webhookStatus={webhookStatus}
    />
  );
}
