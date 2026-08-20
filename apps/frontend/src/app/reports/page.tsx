import { getSession } from '../../lib/auth';
import { getStudents } from '../../actions/walkinActions';
import { getCounselors } from '../../actions/counselorActions';
import { branches } from '../../lib/constants';
import StatusBadge from '../../components/StatusBadge';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function ReportsPage() {
  const user = await getSession();
  if (!user) redirect('/login');

  const roleId = user.roleId;
  const canAccess = roleId === 'role_super_admin' || roleId === 'role_admin' || roleId === 'role_manager';
  if (!canAccess) redirect('/dashboard');

  const [students, counselors] = await Promise.all([getStudents(), getCounselors()]);

  const totalWalkins = students.length;
  const activeTokens = students.filter(w => w.status === 'Waiting' || w.status === 'Assigned' || w.status === 'In Session').length;
  const assignedCounselors = counselors.filter(c => c.assignedStudentId !== null).length;
  const branchCount = branches.length;
  const availableCounselors = counselors.filter(c => c.status === 'Available').length;
  const pendingWalkins = students.filter(w => w.status === 'Waiting').length;

  const branchStatus = branches.map(b => {
    const walkinCount = students.filter(w => {
      if (w.details && (w.details as any).branchId === b.id) return true;
      return w.sessions.some(s => {
        const counselor = counselors.find(c => c.id === s.counselorId);
        return counselor?.branchId === b.id;
      });
    }).length;
    const tokenCount = students.filter(w => {
      if (!w.queueEntry) return false;
      if (w.details && (w.details as any).branchId === b.id) return true;
      return w.sessions.some(s => {
        const counselor = counselors.find(c => c.id === s.counselorId);
        return counselor?.branchId === b.id;
      });
    }).length;
    return { branchId: b.id, branchName: b.name, walkins: walkinCount, tokens: tokenCount };
  });

  const counselorStatus = counselors.map(c => {
    const walkinsHandled = students.filter(w =>
      w.sessions.some(s => s.counselorId === c.id && s.status === 'COMPLETED')
    ).length;
    return { counselorId: c.id, counselorName: c.name, walkinsHandled, status: c.status };
  });

  const statCards = [
    { label: 'Total Walkins', value: totalWalkins },
    { label: 'Active Tokens', value: activeTokens },
    { label: 'Assigned Counselors', value: assignedCounselors },
    { label: 'Branches', value: branchCount },
    { label: 'Available Counselors', value: availableCounselors },
    { label: 'Pending Walkins', value: pendingWalkins },
  ];

  return (
    <section className="dash-page">
      <div className="page-title-row flex justify-between items-center">
        <div>
          <h1>Reports &amp; Analytics</h1>
          <p className="small-text">Insights across branches, counselors, and walkin performance.</p>
        </div>
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-5 mt-5">
        {statCards.map(({ label, value }) => (
          <div key={label} className="report-card bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-6 text-center">
            <h3 className="m-0 mb-3 text-base opacity-80">{label}</h3>
            <p className="m-0 text-[2.5rem] font-extrabold text-[var(--primary)]">{value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-6 mt-6">
        <div className="report-card expanded bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-6">
          <h2 className="m-0 mb-4 text-xl font-bold">Branch Performance</h2>
          <ul className="list-none p-0 m-0 flex flex-col gap-3">
            {branchStatus.map((branch) => (
              <li key={branch.branchId} className="flex justify-between pb-3 border-b border-[var(--border)]">
                <strong>{branch.branchName}</strong>
                <span>{branch.walkins} walkins, {branch.tokens} tokens issued</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="report-card expanded bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-6">
          <h2 className="m-0 mb-4 text-xl font-bold">Counselor Utilization</h2>
          <ul className="list-none p-0 m-0 flex flex-col gap-3">
            {counselorStatus.map((counselor) => (
              <li key={counselor.counselorId} className="flex justify-between items-center pb-3 border-b border-[var(--border)]">
                <strong>{counselor.counselorName}</strong>
                <div className="flex items-center gap-4">
                  <span>{counselor.walkinsHandled} walkins completed</span>
                  <StatusBadge status={counselor.status} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
