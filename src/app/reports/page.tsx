import { getSession } from '../../lib/auth';
import { getStudents } from '../../actions/walkinActions';
import { getCounselors } from '../../actions/counselorActions';
import { branches } from '../../lib/constants';
import StatusBadge from '../../components/StatusBadge';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function ReportsPage() {
  const user = await getSession();
  if (!user) {
    redirect('/login');
  }

  // Authorize: Admin/Super Admin/Manager only
  const roleId = user.roleId;
  const canAccess = roleId === 'role_super_admin' || roleId === 'role_admin' || roleId === 'role_manager';
  if (!canAccess) {
    redirect('/dashboard');
  }

  const [students, counselors] = await Promise.all([
    getStudents(),
    getCounselors()
  ]);

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

    return {
      branchId: b.id,
      branchName: b.name,
      walkins: walkinCount,
      tokens: tokenCount
    };
  });

  const counselorStatus = counselors.map(c => {
    const walkinsHandled = students.filter(w => 
      w.sessions.some(s => s.counselorId === c.id && s.status === 'COMPLETED')
    ).length;
    return {
      counselorId: c.id,
      counselorName: c.name,
      walkinsHandled,
      status: c.status
    };
  });

  return (
    <section className="dash-page">
      <div className="page-title-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Reports & Analytics</h1>
          <p className="small-text">Insights across branches, counselors, and walkin performance.</p>
        </div>
      </div>

      <div className="grid-three-columns report-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', marginTop: '20px' }}>
        <div className="report-card" style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px', textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '1rem', opacity: 0.8 }}>Total Walkins</h3>
          <p style={{ margin: 0, fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary)' }}>{totalWalkins}</p>
        </div>
        <div className="report-card" style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px', textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '1rem', opacity: 0.8 }}>Active Tokens</h3>
          <p style={{ margin: 0, fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary)' }}>{activeTokens}</p>
        </div>
        <div className="report-card" style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px', textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '1rem', opacity: 0.8 }}>Assigned Counselors</h3>
          <p style={{ margin: 0, fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary)' }}>{assignedCounselors}</p>
        </div>
        <div className="report-card" style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px', textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '1rem', opacity: 0.8 }}>Branches</h3>
          <p style={{ margin: 0, fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary)' }}>{branchCount}</p>
        </div>
        <div className="report-card" style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px', textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '1rem', opacity: 0.8 }}>Available Counselors</h3>
          <p style={{ margin: 0, fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary)' }}>{availableCounselors}</p>
        </div>
        <div className="report-card" style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px', textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '1rem', opacity: 0.8 }}>Pending Walkins</h3>
          <p style={{ margin: 0, fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary)' }}>{pendingWalkins}</p>
        </div>
      </div>

      <div className="report-details" style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '24px' }}>
        <div className="report-card expanded" style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px' }}>
          <h2 style={{ margin: '0 0 16px 0', fontSize: '1.25rem', fontWeight: 700 }}>Branch Performance</h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {branchStatus.map((branch) => (
              <li key={branch.branchId} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
                <strong>{branch.branchName}</strong>
                <span>{branch.walkins} walkins, {branch.tokens} tokens issued</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="report-card expanded" style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px' }}>
          <h2 style={{ margin: '0 0 16px 0', fontSize: '1.25rem', fontWeight: 700 }}>Counselor Utilization</h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {counselorStatus.map((counselor) => (
              <li key={counselor.counselorId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
                <strong>{counselor.counselorName}</strong>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
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
