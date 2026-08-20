'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { SessionUser } from '../../lib/auth';
import StudentContextDrawer, { DrawerStudent } from '../../components/StudentContextDrawer';
import { updateStudentDetails } from '../../actions/walkinActions';

interface Branch {
  id: string;
  name: string;
}

interface Counselor {
  id: string;
  name: string;
  branchId: string;
  branchName?: string;
  status: string;
}

interface Session {
  id: string;
  studentId?: string;
  counselorId: string;
  startTime: Date | string | null;
  endTime: Date | string | null;
  duration: number | null;
  status: string;
  notes: string | null;
  followUpStatus?: string | null;
  audioUrl?: string | null;
  transcript?: string | null;
  summary?: string | null;
}

interface Student {
  id: string;
  name: string;
  phone: string;
  course: string;
  walkinDate: Date | string;
  status: string;
  remarks: string | null;
  source: string;
  details: any;
  sessions: Session[];
}

interface QueueClientProps {
  initialWalkins: Student[];
  branches: Branch[];
  counselors: Counselor[];
  user: SessionUser | null;
}

type PriorityLevel = 'Urgent' | 'High' | 'Medium' | 'Low';

const PRIORITY_ICONS: Record<PriorityLevel, string> = {
  Urgent: '🔴',
  High: '🟠',
  Medium: '🔵',
  Low: '⚪',
};

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function getWaitMinutes(walkinDate: Date | string): number {
  return Math.floor((Date.now() - new Date(walkinDate).getTime()) / 60000);
}

function formatWaitTime(mins: number): string {
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m}m`;
}

function getSLAClass(waitMins: number, priority: PriorityLevel): string {
  const breachThreshold = priority === 'Urgent' ? 10 : priority === 'High' ? 20 : 30;
  const warnThreshold = breachThreshold - 10;
  if (waitMins >= breachThreshold) return 'sla-breach';
  if (waitMins >= warnThreshold) return 'sla-warning';
  return '';
}

function getWaitBadgeClass(waitMins: number, priority: PriorityLevel): string {
  const breachThreshold = priority === 'Urgent' ? 10 : priority === 'High' ? 20 : 30;
  const warnThreshold = breachThreshold - 10;
  if (waitMins >= breachThreshold) return 'breach';
  if (waitMins >= warnThreshold) return 'warn';
  return '';
}

export default function QueueClient({ initialWalkins, branches, counselors, user }: QueueClientProps) {
  const router = useRouter();
  const [walkins, setWalkins] = useState<Student[]>(initialWalkins);
  const [branchFilter, setBranchFilter] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerStudent, setDrawerStudent] = useState<DrawerStudent | null>(null);

  useEffect(() => { setMounted(true); }, []);

  // Auto-refresh queue state every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh();
    }, 30000);
    return () => clearInterval(interval);
  }, [router]);

  const openDrawer = useCallback((student: Student) => {
    setDrawerStudent(student as DrawerStudent);
    setDrawerOpen(true);
  }, []);

  // Existing business logic — untouched
  const handleReassign = async (walkinId: string, counselorId: string) => {
    setLoading(true);
    setMessage('Reassigning counselor…');
    const res = await updateStudentDetails(walkinId, { counselorId });
    if (res.success) {
      setMessage('Counselor reassigned successfully.');
      router.refresh();
      window.location.reload();
    } else {
      setMessage(res.error || 'Failed to reassign counselor.');
    }
    setLoading(false);
  };

  const handlePriorityChange = async (walkinId: string, priority: string) => {
    setLoading(true);
    setMessage('Updating priority…');
    const res = await updateStudentDetails(walkinId, { priority });
    if (res.success) {
      setMessage('Queue priority updated.');
      router.refresh();
      window.location.reload();
    } else {
      setMessage(res.error || 'Failed to update priority.');
    }
    setLoading(false);
  };

  const getBranchId = (w: Student) => {
    const session = w.sessions.find(s => s.status !== 'CANCELLED');
    if (session) {
      const counselor = counselors.find(c => c.id === session.counselorId);
      if (counselor) return counselor.branchId;
    }
    return w.details?.branchId || 'branch_jntu1';
  };

  const getEstimatedWaitTime = (position: number, priority: string) => {
    let baseMins = 15;
    if (priority === 'Urgent') return '5 mins';
    if (priority === 'High') baseMins = 8;
    if (priority === 'Low') baseMins = 20;
    return `${position * baseMins} mins`;
  };

  const waitingQueue = walkins
    .filter(w => {
      const statusMatch = w.status === 'Waiting' || w.status === 'Assigned';
      const branchId = getBranchId(w);
      const branchMatch = branchFilter ? branchId === branchFilter : true;
      return statusMatch && branchMatch;
    })
    .sort((a, b) => {
      const getPriorityVal = (p: string) => {
        if (p === 'Urgent') return 4;
        if (p === 'High') return 3;
        if (p === 'Low') return 1;
        return 2;
      };
      const aPriority = a.details?.priority || 'Medium';
      const bPriority = b.details?.priority || 'Medium';
      const aVal = getPriorityVal(aPriority);
      const bVal = getPriorityVal(bPriority);
      if (bVal !== aVal) return bVal - aVal;
      return new Date(a.walkinDate).getTime() - new Date(b.walkinDate).getTime();
    });

  // Queue summary metrics
  const urgentCount = waitingQueue.filter(w => (w.details?.priority || 'Medium') === 'Urgent').length;
  const avgWait = mounted && waitingQueue.length > 0
    ? Math.round(waitingQueue.reduce((sum, w) => sum + getWaitMinutes(w.walkinDate), 0) / waitingQueue.length)
    : 0;
  const breachCount = mounted ? waitingQueue.filter(w => {
    const mins = getWaitMinutes(w.walkinDate);
    const p = (w.details?.priority || 'Medium') as PriorityLevel;
    const threshold = p === 'Urgent' ? 10 : p === 'High' ? 20 : 30;
    return mins >= threshold;
  }).length : 0;

  const drawerCounselors = counselors.map(c => ({ id: c.id, name: c.name, branchName: c.branchName || '' }));

  return (
    <section className="dash-page">
      {/* ── Header ── */}
      <div className="page-title-row">
        <div>
          <h1 className="page-title">Queue Board</h1>
          <p className="small-text">Live waiting list — priority routing and counselor assignment.</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
          <label htmlFor="queue-branch-filter" className="sr-only">Filter by branch</label>
          <select
            id="queue-branch-filter"
            value={branchFilter}
            onChange={e => setBranchFilter(e.target.value)}
            style={{
              padding: '0 var(--space-4)',
              height: '38px',
              borderRadius: 'var(--radius-sm)',
              border: '1.5px solid var(--border)',
              background: 'var(--surface)',
              color: 'var(--text)',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              outline: 'none',
              boxSizing: 'border-box',
              fontFamily: 'var(--font-sans)',
            }}
          >
            <option value="">All Branches</option>
            {branches.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
          <button
            type="button"
            className="sc-refresh"
            onClick={() => window.location.reload()}
            disabled={loading}
            aria-label="Refresh queue data"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="14" height="14" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M23 4v6h-6M1 20v-6h6" /><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
            </svg>
            Live Refresh
          </button>
        </div>
      </div>

      {message && (
        <div className="inline-message" role="status" aria-live="polite" style={{ margin: 'var(--space-2) 0 var(--space-4) 0' }}>
          {message}
        </div>
      )}

      {/* ── Queue Summary Strip ── */}
      <div className="queue-summary-strip" role="region" aria-label="Queue summary metrics">
        <div className="queue-summary-card">
          <span className="queue-summary-label">Total Waiting</span>
          <span className="queue-summary-value">{waitingQueue.length}</span>
        </div>
        <div className="queue-summary-card">
          <span className="queue-summary-label">Urgent</span>
          <span className="queue-summary-value" style={{ color: urgentCount > 0 ? 'var(--danger)' : 'var(--text)' }}>
            {urgentCount}
          </span>
        </div>
        <div className="queue-summary-card">
          <span className="queue-summary-label">SLA Breaches</span>
          <span className="queue-summary-value" style={{ color: breachCount > 0 ? 'var(--danger)' : 'var(--text)' }}>
            {mounted ? breachCount : '—'}
          </span>
        </div>
        <div className="queue-summary-card">
          <span className="queue-summary-label">Avg Wait</span>
          <span className="queue-summary-value" style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem' }}>
            {mounted && waitingQueue.length > 0 ? formatWaitTime(avgWait) : '—'}
          </span>
        </div>
      </div>

      {/* ── Queue Card Board ── */}
      <div className="dash-table-card">
        <div className="dash-table-header">
          <h2>Waiting Queue ({waitingQueue.length} Students)</h2>
        </div>

        {waitingQueue.length === 0 ? (
          <div style={{ padding: 'var(--space-12)', textAlign: 'center', color: 'var(--muted)' }}>
            <div style={{ fontSize: '2rem', marginBottom: 'var(--space-3)' }}>✅</div>
            <strong>Queue is clear</strong>
            <p style={{ fontSize: '0.88rem', marginTop: 'var(--space-2)' }}>No students are currently waiting.</p>
          </div>
        ) : (
          <div className="queue-board-grid" style={{ padding: 'var(--space-4)' }} role="list" aria-label="Queue board">
            {waitingQueue.map((w, index) => {
              const position = index + 1;
              const priority = (w.details?.priority || 'Medium') as PriorityLevel;
              const activeSession = w.sessions.find(s => s.status === 'ASSIGNED' || s.status === 'IN_SESSION');
              const counselorId = activeSession ? activeSession.counselorId : 'unassigned';
              const counselorName = activeSession
                ? counselors.find(c => c.id === activeSession.counselorId)?.name || 'Unassigned'
                : 'Unassigned';
              const branchId = getBranchId(w);
              const waitMins = mounted ? getWaitMinutes(w.walkinDate) : 0;
              const slaClass = mounted ? getSLAClass(waitMins, priority) : '';
              const waitBadgeClass = mounted ? getWaitBadgeClass(waitMins, priority) : '';
              const estWait = getEstimatedWaitTime(position, priority);

              return (
                <div
                  key={w.id}
                  className={`queue-card ${slaClass}`}
                  role="listitem"
                  aria-label={`Position ${position}: ${w.name}, ${priority} priority, waiting ${mounted ? formatWaitTime(waitMins) : '—'}`}
                >
                  {/* Position Badge */}
                  <div className="queue-position-badge" aria-hidden="true">
                    #{position}
                  </div>

                  {/* Student Info */}
                  <div className="queue-card-body">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                      <button
                        type="button"
                        className="queue-student-name"
                        onClick={() => openDrawer(w)}
                        style={{
                          background: 'none', border: 'none', padding: 0,
                          cursor: 'pointer', fontWeight: 800, fontSize: '0.92rem',
                          color: 'var(--text)', fontFamily: 'var(--font-sans)',
                          textAlign: 'left', transition: 'color var(--transition-fast)',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.color = 'var(--primary)')}
                        onMouseLeave={e => (e.currentTarget.style.color = 'var(--text)')}
                        aria-label={`View profile for ${w.name}`}
                      >
                        {w.name}
                      </button>
                      <span className={`priority-badge ${priority}`} aria-label={`Priority: ${priority}`}>
                        <span aria-hidden="true">{PRIORITY_ICONS[priority]}</span>
                        {priority}
                      </span>
                    </div>

                    <div className="queue-student-meta">
                      <span>{w.course}</span>
                      <span aria-label={`Assigned counselor: ${counselorName}`}>
                        👤 {counselorName}
                      </span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--muted)' }}>
                        #{w.id.slice(-6).toUpperCase()}
                      </span>
                    </div>

                    {/* Inline controls */}
                    <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-2)', flexWrap: 'wrap', alignItems: 'center' }}>
                      {/* Priority selector */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <label htmlFor={`priority-${w.id}`} style={{ fontSize: '0.7rem', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>Priority</label>
                        <select
                          id={`priority-${w.id}`}
                          value={priority}
                          onChange={e => handlePriorityChange(w.id, e.target.value)}
                          aria-label={`Change priority for ${w.name}`}
                          style={{
                            padding: '3px var(--space-2)',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--border)',
                            background: 'var(--surface-alt)',
                            color: 'var(--text)',
                            fontWeight: 700,
                            fontSize: '0.78rem',
                            cursor: 'pointer',
                            fontFamily: 'var(--font-sans)',
                            outline: 'none',
                          }}
                        >
                          <option value="Low">Low</option>
                          <option value="Medium">Medium</option>
                          <option value="High">High</option>
                          <option value="Urgent">Urgent</option>
                        </select>
                      </div>

                      {/* Counselor reassign */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <label htmlFor={`counselor-${w.id}`} style={{ fontSize: '0.7rem', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>Assign</label>
                        <select
                          id={`counselor-${w.id}`}
                          value={counselorId}
                          onChange={e => handleReassign(w.id, e.target.value)}
                          aria-label={`Assign counselor for ${w.name}`}
                          style={{
                            padding: '3px var(--space-2)',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--border)',
                            background: 'var(--surface-alt)',
                            color: 'var(--text)',
                            fontSize: '0.78rem',
                            cursor: 'pointer',
                            fontFamily: 'var(--font-sans)',
                            outline: 'none',
                            maxWidth: '160px',
                          }}
                        >
                          <option value="unassigned">Unassigned (Waitlist)</option>
                          {counselors.filter(c => c.branchId === branchId).map(c => (
                            <option key={c.id} value={c.id}>{c.name} ({c.status})</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Wait time + quick view */}
                  <div className="queue-card-actions">
                    <span
                      className={`queue-wait-badge ${waitBadgeClass}`}
                      aria-label={`Waiting for ${mounted ? formatWaitTime(waitMins) : '—'}`}
                      title={`Estimated wait: ${estWait}`}
                    >
                      ⏱ {mounted ? formatWaitTime(waitMins) : '—'}
                    </span>
                    <span style={{ fontSize: '0.68rem', color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                      Est: {estWait}
                    </span>
                    <button
                      type="button"
                      className="outline-btn"
                      onClick={() => openDrawer(w)}
                      style={{ padding: '4px 10px', fontSize: '0.75rem', borderRadius: 'var(--radius-sm)', marginTop: 'var(--space-1)' }}
                      aria-label={`Quick view profile for ${w.name}`}
                    >
                      Profile
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Student Context Drawer ── */}
      <StudentContextDrawer
        student={drawerStudent}
        counselors={drawerCounselors}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </section>
  );
}
