'use client';

import StatusBadge from '../../components/StatusBadge';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { SessionUser } from '../../lib/auth';
import { startCounsellingSession } from '../../actions/walkinActions';
import { updateCounselorStatus } from '../../actions/counselorActions';
import StudentDetailsRecord from '../../components/StudentDetailsRecord';
import StudentContextDrawer, { DrawerStudent } from '../../components/StudentContextDrawer';

interface Session {
  id: string;
  studentId: string;
  counselorId: string;
  startTime: Date | string | null;
  endTime: Date | string | null;
  duration: number | null;
  status: string;
  notes: string | null;
  followUpStatus: string | null;
  audioUrl?: string | null;
  transcript?: string | null;
  summary?: string | null;
}

interface QueueEntry {
  id: string;
  studentId: string;
  position: number;
  status: string;
}

interface Student {
  id: string;
  name: string;
  phone: string;
  course: string;
  branchId?: string;
  branchName?: string;
  walkinDate: Date | string;
  status: string;
  remarks: string | null;
  source: string;
  details: any;
  sessions: Session[];
  queueEntry: QueueEntry | null;
}

interface Counselor {
  id: string;
  name: string;
  roleId: string;
  roleName: string;
  departmentId: string;
  departmentName: string;
  branchId: string;
  branchName: string;
  location: string;
  availability: string[];
  status: string;
  assignedStudentId: string | null;
}

interface DashboardClientProps {
  initialWalkins: Student[];
  initialCounselors: Counselor[];
  user: SessionUser | null;
  dbLatency: number | null;
  webhookStatus: string | null;
}

interface ActivityItem {
  timestamp: Date;
  title: string;
  description: string;
  type: 'check_in' | 'assigned' | 'started' | 'completed' | 'alert';
}

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

export default function DashboardClient({
  initialWalkins,
  initialCounselors,
  user,
  dbLatency,
  webhookStatus,
}: DashboardClientProps) {
  const router = useRouter();
  const [walkins, setWalkins] = useState<Student[]>(initialWalkins);
  const [counselors, setCounselors] = useState<Counselor[]>(initialCounselors);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedDetailsStudent, setSelectedDetailsStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(false);
  const [counselorStatus, setCounselorStatus] = useState<string>(() => {
    if (user && user.roleId === 'role_counselor') {
      const self = initialCounselors.find(c => c.id === user.id);
      return self?.status || 'Offline';
    }
    return 'Offline';
  });

  const [mounted, setMounted] = useState(false);

  // Context Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerStudent, setDrawerStudent] = useState<DrawerStudent | null>(null);

  const openStudentDrawer = (student: Student) => {
    setDrawerStudent(student as DrawerStudent);
    setDrawerOpen(true);
  };

  useEffect(() => {
    setWalkins(initialWalkins);
  }, [initialWalkins]);

  useEffect(() => {
    setCounselors(initialCounselors);
  }, [initialCounselors]);

  useEffect(() => {
    if (user && user.roleId === 'role_counselor') {
      const self = counselors.find(c => c.id === user.id);
      if (self && self.status) {
        setCounselorStatus(self.status);
      }
    }
  }, [counselors, user]);

  useEffect(() => {
    setMounted(true);
    setCurrentTime(Date.now());
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Role detection
  const roleId = user?.roleId || 'role_frontdesk';
  const isCounselor = roleId === 'role_counselor';
  const isFrontDesk = roleId === 'role_frontdesk';

  // State derivations
  const activeQueue = walkins.filter(w => w.status === 'Waiting' || w.status === 'Assigned' || w.status === 'In Session');
  const waitingStudents = walkins.filter(w => w.status === 'Waiting');
  const assignedStudents = walkins.filter(w => w.status === 'Assigned');
  const inSessionStudents = walkins.filter(w => w.status === 'In Session');
  const completedStudents = walkins.filter(w => w.status === 'Completed');
  const availableCounselors = counselors.filter(c => (c.status || '').toLowerCase() === 'available');
  const offlineCounselors = counselors.filter(c => (c.status || '').toLowerCase() === 'offline');

  // Counselor assigned students
  const myStudents = walkins.filter(w => 
    (w.status === 'Assigned' || w.status === 'In Session') && 
    (isCounselor ? w.sessions.some(s => s.counselorId === user?.id && s.status !== 'COMPLETED') : true)
  );

  // Memoized activity log feed
  const recentActivities = useMemo(() => {
    const activities: ActivityItem[] = [];
    walkins.forEach(w => {
      activities.push({
        timestamp: new Date(w.walkinDate),
        title: 'Student Checked In',
        description: `${w.name} registered for ${w.course}`,
        type: 'check_in'
      });
      w.sessions.forEach(s => {
        const counselorName = counselors.find(c => c.id === s.counselorId)?.name || 'Counselor';
        if (s.startTime) {
          activities.push({
            timestamp: new Date(s.startTime),
            title: 'Session Started',
            description: `Session started for ${w.name} by ${counselorName}`,
            type: 'started'
          });
        }
        if (s.status === 'COMPLETED' && s.endTime) {
          activities.push({
            timestamp: new Date(s.endTime),
            title: 'Session Completed',
            description: `Session completed for ${w.name}`,
            type: 'completed'
          });
        }
      });
    });
    return activities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 8);
  }, [walkins, counselors]);

  const handleOpenAndStartWorkspace = async (student: Student) => {
    setLoading(true);
    const res = await startCounsellingSession(student.id);
    if (res.success) {
      router.refresh();
      router.push(`/sessions/workspace?studentId=${student.id}`);
    } else {
      alert(res.error || 'Failed to start session.');
    }
    setLoading(false);
  };

  const handleUpdateAvailability = async (status: string) => {
    if (!user?.id) return;
    setLoading(true);
    const res = await updateCounselorStatus(user.id, status);
    if (res.success) {
      setCounselorStatus(status);
      setCounselors(prev => prev.map(c => c.id === user.id ? { ...c, status } : c));
      router.refresh();
    } else {
      alert(res.error || 'Failed to update counselor status.');
    }
    setLoading(false);
  };

  const drawerCounselors = counselors.map(c => ({ id: c.id, name: c.name, branchName: c.branchName || '' }));

  return (
    <section className="dash-page" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* ─── Control Center Header ─── */}
      <div className="page-title-row" style={{ marginBottom: 0 }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            Operations Control Center
            <span style={{
              fontSize: '0.72rem',
              background: 'rgba(99, 102, 241, 0.12)',
              color: 'var(--primary)',
              padding: '2px 8px',
              borderRadius: '6px',
              fontWeight: 800,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}>
              Live Telemetry
            </span>
          </h1>
          <p className="small-text">
            Real-time walk-in intake, student pipeline, and workforce availability.
          </p>
        </div>

        {/* Dynamic header toggles based on role */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {isCounselor && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label htmlFor="availability-status" style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 700 }}>My Status:</label>
              <select
                id="availability-status"
                aria-label="My Availability Status"
                value={counselorStatus}
                onChange={(e) => handleUpdateAvailability(e.target.value)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '1.5px solid var(--border)',
                  background: 'var(--surface)',
                  color: 'var(--text)',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                <option value="Available">🟢 Available</option>
                <option value="Busy">🔴 Busy</option>
                <option value="Break">☕ Break</option>
                <option value="Offline">⚫ Offline</option>
              </select>
            </div>
          )}

          {isFrontDesk && (
            <button
              type="button"
              className="primary-btn"
              onClick={() => router.push('/walkins')}
            >
              + Register Walk-in
            </button>
          )}

          <button
            type="button"
            className="sc-refresh"
            onClick={() => window.location.reload()}
            disabled={loading}
            aria-label="Refresh Dashboard data"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="14" height="14" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 4v6h-6M1 20v-6h6" /><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* ─── Live Telemetry Status Bubbles ─── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        flexWrap: 'wrap',
      }}>
        {/* TOTAL WALK-INS */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 14px',
          borderRadius: '9999px',
          fontSize: '0.74rem',
          fontWeight: 800,
          letterSpacing: '0.04em',
          border: '1.5px solid var(--border)',
          background: 'var(--surface)',
          color: 'var(--muted)',
        }}>
          <span>TODAY WALK-INS</span>
          <span style={{ background: 'rgba(255,255,255,0.08)', padding: '1px 7px', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 800, color: 'var(--text)' }}>
            {walkins.length}
          </span>
        </div>

        {/* WAITING */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 14px',
          borderRadius: '9999px',
          fontSize: '0.74rem',
          fontWeight: 800,
          letterSpacing: '0.04em',
          border: '1.5px solid rgba(14, 165, 233, 0.3)',
          background: 'rgba(14, 165, 233, 0.12)',
          color: '#0284c7',
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#0ea5e9', boxShadow: '0 0 6px #0ea5e9', animation: 'pulseDot 1.4s ease-in-out infinite' }} />
          <span>WAITING</span>
          <span style={{ background: 'rgba(14, 165, 233, 0.22)', padding: '1px 7px', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 800 }}>
            {waitingStudents.length}
          </span>
        </div>

        {/* ASSIGNED */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 14px',
          borderRadius: '9999px',
          fontSize: '0.74rem',
          fontWeight: 800,
          letterSpacing: '0.04em',
          border: '1.5px solid rgba(99, 102, 241, 0.3)',
          background: 'rgba(99, 102, 241, 0.12)',
          color: '#6366f1',
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#6366f1' }} />
          <span>ASSIGNED</span>
          <span style={{ background: 'rgba(99, 102, 241, 0.22)', padding: '1px 7px', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 800 }}>
            {assignedStudents.length}
          </span>
        </div>

        {/* IN SESSION */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 14px',
          borderRadius: '9999px',
          fontSize: '0.74rem',
          fontWeight: 800,
          letterSpacing: '0.04em',
          border: '1.5px solid rgba(245, 158, 11, 0.3)',
          background: 'rgba(245, 158, 11, 0.12)',
          color: '#d97706',
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#f59e0b', boxShadow: '0 0 6px #f59e0b', animation: 'pulseDot 1.4s ease-in-out infinite' }} />
          <span>IN SESSION</span>
          <span style={{ background: 'rgba(245, 158, 11, 0.22)', padding: '1px 7px', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 800 }}>
            {inSessionStudents.length}
          </span>
        </div>

        {/* COMPLETED */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 14px',
          borderRadius: '9999px',
          fontSize: '0.74rem',
          fontWeight: 800,
          letterSpacing: '0.04em',
          border: '1.5px solid rgba(16, 185, 129, 0.3)',
          background: 'rgba(16, 185, 129, 0.12)',
          color: '#059669',
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981' }} />
          <span>COMPLETED</span>
          <span style={{ background: 'rgba(16, 185, 129, 0.22)', padding: '1px 7px', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 800 }}>
            {completedStudents.length}
          </span>
        </div>

        {/* COUNSELORS ONLINE */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 14px',
          borderRadius: '9999px',
          fontSize: '0.74rem',
          fontWeight: 800,
          letterSpacing: '0.04em',
          border: '1.5px solid rgba(100, 116, 139, 0.3)',
          background: 'rgba(100, 116, 139, 0.12)',
          color: '#64748b',
          marginLeft: 'auto',
        }}>
          <span>COUNSELORS:</span>
          <span style={{ color: 'var(--success)' }}>🟢 {availableCounselors.length} Available</span>
          <span style={{ opacity: 0.4 }}>|</span>
          <span style={{ color: '#94a3b8' }}>⚫ {offlineCounselors.length} Offline</span>
        </div>
      </div>

      {/* ─── Main 2-Column Dashboard Grid ─── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.55fr) minmax(0, 1fr)',
        gap: '20px',
        alignItems: 'start',
      }}>
        {/* LEFT COLUMN: Active Student Pipeline */}
        <div className="dash-table-card">
          <div className="dash-table-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2>Live Student Queue & Pipeline</h2>
            <span style={{ fontSize: '0.78rem', color: 'var(--muted)', fontWeight: 700 }}>
              {activeQueue.length} Active Student{activeQueue.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="table-wrapper">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1.5px solid var(--border)', background: 'var(--surface-alt, rgba(255,255,255,0.02))' }}>
                  <th style={{ padding: '10px 14px', fontSize: '0.72rem', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase' }}>Student</th>
                  <th style={{ padding: '10px 14px', fontSize: '0.72rem', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase' }}>Course</th>
                  <th style={{ padding: '10px 14px', fontSize: '0.72rem', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase' }}>Assigned Counselor</th>
                  <th style={{ padding: '10px 14px', fontSize: '0.72rem', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '10px 14px', fontSize: '0.72rem', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {activeQueue.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--muted)' }}>
                      <div style={{ fontSize: '1.8rem', marginBottom: '6px' }}>✅</div>
                      <strong>No students waiting or in session</strong>
                      <p style={{ fontSize: '0.82rem', marginTop: '4px' }}>All daily registrations are currently processed.</p>
                    </td>
                  </tr>
                ) : (
                  activeQueue.map((w) => {
                    const activeSession = w.sessions.find(s => s.status === 'ASSIGNED' || s.status === 'IN_SESSION');
                    const counselorName = activeSession
                      ? counselors.find(c => c.id === activeSession.counselorId)?.name || 'Unassigned'
                      : 'Unassigned';

                    return (
                      <tr
                        key={w.id}
                        style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s ease' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-alt, rgba(255,255,255,0.02))')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        <td style={{ padding: '12px 14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                              width: 30, height: 30, borderRadius: '50%',
                              background: 'var(--primary-glow)', color: 'var(--primary)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '0.7rem', fontWeight: 800, flexShrink: 0,
                              border: '1px solid rgba(99,102,241,0.2)',
                            }}>
                              {getInitials(w.name)}
                            </div>
                            <div>
                              <button
                                type="button"
                                onClick={() => openStudentDrawer(w)}
                                style={{
                                  background: 'none', border: 'none', padding: 0,
                                  cursor: 'pointer', fontWeight: 700, fontSize: '0.88rem',
                                  color: 'var(--primary)', fontFamily: 'inherit', textAlign: 'left',
                                }}
                                onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
                                onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}
                              >
                                {w.name}
                              </button>
                              <div style={{ fontSize: '0.74rem', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
                                {w.phone}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '12px 14px', fontSize: '0.84rem', fontWeight: 600, color: 'var(--text)' }}>
                          {w.course}
                        </td>
                        <td style={{ padding: '12px 14px', fontSize: '0.82rem', color: counselorName === 'Unassigned' ? '#d97706' : 'var(--text)', fontWeight: 600 }}>
                          👤 {counselorName}
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <StatusBadge status={w.status} />
                        </td>
                        <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                          <button
                            type="button"
                            onClick={() => router.push(`/walkins/record?studentId=${w.id}`)}
                            style={{
                              padding: '4px 10px',
                              borderRadius: '6px',
                              border: '1px solid var(--border)',
                              background: 'var(--surface-alt)',
                              color: 'var(--text)',
                              fontSize: '0.76rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                            }}
                            onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--primary)')}
                            onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                          >
                            Profile
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT COLUMN: Counselor Roster & Activity Feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Counselor Availability Roster */}
          <div className="dash-table-card">
            <div className="dash-table-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2>Counselor Availability Roster</h2>
              <span style={{ fontSize: '0.78rem', color: 'var(--muted)', fontWeight: 700 }}>
                {counselors.length} Team Members
              </span>
            </div>

            <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {counselors.map((c) => (
                <div
                  key={c.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    background: 'var(--surface-alt, rgba(255,255,255,0.02))',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text)' }}>
                      {c.name || (c as any).user?.name}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--muted)', marginTop: '2px' }}>
                      {c.branchName || 'Main Campus'} • {c.departmentName || 'Sales'}
                    </div>
                  </div>
                  <div>
                    <StatusBadge status={c.status || 'Offline'} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Stream */}
          <div className="dash-table-card">
            <div className="dash-table-header">
              <h2>Recent Activity Feed</h2>
            </div>
            <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {recentActivities.length === 0 ? (
                <div style={{ padding: '16px', textAlign: 'center', color: 'var(--muted)', fontSize: '0.82rem' }}>
                  No recent activity recorded today.
                </div>
              ) : (
                recentActivities.map((act, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px',
                      paddingBottom: i !== recentActivities.length - 1 ? '10px' : '0',
                      borderBottom: i !== recentActivities.length - 1 ? '1px solid var(--border)' : 'none',
                    }}
                  >
                    <div style={{
                      width: 24, height: 24, borderRadius: '50%',
                      background: act.type === 'completed' ? 'rgba(16,185,129,0.15)' : 'rgba(99,102,241,0.12)',
                      color: act.type === 'completed' ? '#10b981' : 'var(--primary)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.7rem', flexShrink: 0, marginTop: '2px',
                    }}>
                      {act.type === 'completed' ? '✓' : '•'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text)' }}>
                        {act.title}
                      </div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--muted)', marginTop: '1px' }}>
                        {act.description}
                      </div>
                    </div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--muted)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>
                      {mounted ? act.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Student Context Drawer ─── */}
      <StudentContextDrawer
        student={drawerStudent}
        counselors={drawerCounselors}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </section>
  );
}
