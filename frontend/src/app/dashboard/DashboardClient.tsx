'use client';

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

interface SLAAlert {
  id: string;
  studentName: string;
  type: 'warning' | 'breach';
  message: string;
  duration: number;
}

function formatHHMMSS(seconds: number) {
  if (isNaN(seconds) || seconds < 0) return '00:00:00';
  const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
  const s = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
}

function getWaitTimeStr(w: Student, currentTime: number) {
  const created = new Date(w.walkinDate).getTime();
  const activeSession = w.sessions.find(s => s.status === 'IN_SESSION' || s.status === 'COMPLETED');
  const end = activeSession && activeSession.startTime ? new Date(activeSession.startTime).getTime() : currentTime;
  const diffMs = Math.max(0, end - created);
  const diffMins = Math.floor(diffMs / 60000);
  return `${diffMins}m`;
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
  // ⚠️ Initialize to 0 (not Date.now()) to avoid SSR/client hydration mismatch.
  // The real timestamp is set inside useEffect, which only runs on the client.
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedDetailsStudent, setSelectedDetailsStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(false);
  const [counselorStatus, setCounselorStatus] = useState<string>(() => {
    if (user && user.roleId === 'role_counselor') {
      const self = initialCounselors.find(c => c.id === user.id);
      return self?.status || 'Available';
    }
    return 'Available';
  });

  const [mounted, setMounted] = useState(false);

  // Context Drawer state for student quick-view from dashboard
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
    // Set the real time immediately on mount, then tick every second
    setCurrentTime(Date.now());
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Role detection
  const roleId = user?.roleId || 'role_frontdesk';
  const isCounselor = roleId === 'role_counselor';
  const isManager = roleId === 'role_manager';
  const isAdmin = roleId === 'role_super_admin' || roleId === 'role_admin';
  const isFrontDesk = roleId === 'role_frontdesk';

  // State derivations for active queues
  const activeQueue = walkins.filter(w => w.status === 'Waiting' || w.status === 'Assigned' || w.status === 'In Session');
  const waitingStudents = walkins.filter(w => w.status === 'Waiting');
  
  // Counselor assigned students
  const myStudents = walkins.filter(w => 
    (w.status === 'Assigned' || w.status === 'In Session') && 
    (isCounselor ? w.sessions.some(s => s.counselorId === user?.id && s.status !== 'COMPLETED') : true)
  );

  // Performance: memoized walkin index for O(1) counselor lookups
  const walkinById = useMemo(() => {
    const map = new Map<string, typeof walkins[0]>();
    walkins.forEach(w => map.set(w.id, w));
    return map;
  }, [walkins]);

  // Dynamic SLA Violations and warnings calculations — memoized for perf
  const slaAlerts: SLAAlert[] = useMemo(() => {
    if (!mounted || currentTime === 0) return [];
    const alerts: SLAAlert[] = [];
    walkins.forEach(w => {
      if (w.status === 'Waiting' || w.status === 'Assigned') {
        const created = new Date(w.walkinDate).getTime();
        const waitMins = Math.floor((currentTime - created) / 60000);
        if (waitMins >= 30) {
          alerts.push({
            id: `q-breach-${w.id}`,
            studentName: w.name,
            type: 'breach',
            message: `Queue Breach: ${w.name} is waiting for ${waitMins}m in queue.`,
            duration: waitMins
          });
        } else if (waitMins >= 20) {
          alerts.push({
            id: `q-warning-${w.id}`,
            studentName: w.name,
            type: 'warning',
            message: `Queue Warning: ${w.name} waiting time exceeded ${waitMins}m.`,
            duration: waitMins
          });
        }
      } else if (w.status === 'In Session') {
        const session = w.sessions.find(s => s.status === 'IN_SESSION');
        if (session && session.startTime) {
          const start = new Date(session.startTime).getTime();
          const sessionMins = Math.floor((currentTime - start) / 60000);
          if (sessionMins >= 60) {
            alerts.push({
              id: `s-breach-${w.id}`,
              studentName: w.name,
              type: 'breach',
              message: `Session Breach: Session with ${w.name} exceeded ${sessionMins}m limit.`,
              duration: sessionMins
            });
          } else if (sessionMins >= 45) {
            alerts.push({
              id: `s-warning-${w.id}`,
              studentName: w.name,
              type: 'warning',
              message: `Session Warning: Session with ${w.name} is at ${sessionMins}m.`,
              duration: sessionMins
            });
          }
        }
      }
    });
    return alerts;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walkins, currentTime, mounted]);

  // Memoized activity log feed — sorted newest-first, limited to 10 items
  const recentActivities = useMemo(() => {
    const activities: ActivityItem[] = [];
    walkins.forEach(w => {
      activities.push({
        timestamp: new Date(w.walkinDate),
        title: 'Student Checked In',
        description: `${w.name} checked in for ${w.course}`,
        type: 'check_in'
      });
      w.sessions.forEach(s => {
        const counselorName = counselors.find(c => c.id === s.counselorId)?.name || 'Counselor';
        if (s.startTime) {
          activities.push({
            timestamp: new Date(s.startTime),
            title: 'Session Started',
            description: `Counseling session started for ${w.name} by ${counselorName}`,
            type: 'started'
          });
          activities.push({
            timestamp: new Date(new Date(s.startTime).getTime() - 2 * 60 * 1000),
            title: 'Counselor Assigned',
            description: `${counselorName} assigned to student ${w.name}`,
            type: 'assigned'
          });
        }
        if (s.status === 'COMPLETED' && s.endTime) {
          activities.push({
            timestamp: new Date(s.endTime),
            title: 'Session Completed',
            description: `Session completed for ${w.name} by ${counselorName} (${s.duration ? Math.round(s.duration / 60) : 0}m)`,
            type: 'completed'
          });
        }
      });
    });
    return activities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 10);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walkins, counselors]);

  // Actions overrides
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

  // Rendering Helper Components
  const renderStatusPill = (status: string, waitTimeSecs?: number) => {
    let styleClass = 'status-chip offline';
    let label = status;
    let icon = '⚫';

    if (status === 'Available') {
      styleClass = 'status-chip available';
      icon = '🟢';
    } else if (status === 'Busy') {
      styleClass = 'status-chip busy';
      icon = '🔴';
    } else if (status === 'Break') {
      styleClass = 'status-chip break';
      icon = '☕';
    } else if (status === 'Offline') {
      styleClass = 'status-chip offline';
      icon = '⚫';
    } else if (status === 'Waiting') {
      const isBreached = waitTimeSecs && waitTimeSecs >= 1800; // 30m
      const isWarning = waitTimeSecs && waitTimeSecs >= 1200; // 20m
      styleClass = isBreached ? 'status-chip unavailable' : isWarning ? 'status-chip busy' : 'status-chip pending';
      label = isBreached ? 'Breached' : isWarning ? 'Delayed' : 'Waiting';
      icon = isBreached ? '🚨' : isWarning ? '⚠️' : '⏳';
    } else if (status === 'Assigned') {
      styleClass = 'status-chip assigned';
      icon = '👤';
    } else if (status === 'In Session') {
      const isBreached = waitTimeSecs && waitTimeSecs >= 3600; // 60m
      const isWarning = waitTimeSecs && waitTimeSecs >= 2700; // 45m
      styleClass = isBreached ? 'status-chip unavailable' : isWarning ? 'status-chip busy' : 'status-chip in_session';
      label = isBreached ? 'SLA Breach' : isWarning ? 'Overtime' : 'In Session';
      icon = isBreached ? '🚨' : isWarning ? '⚠️' : '💬';
    } else if (status === 'Completed') {
      styleClass = 'status-chip completed';
      icon = '✅';
    }

    return (
      <span className={styleClass} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
        <span aria-hidden="true">{icon}</span>
        <span>{label}</span>
      </span>
    );
  };

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* ─── Control Center Header ─── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            Operations Control Center
            <span style={{ fontSize: '0.8rem', background: 'rgba(99, 102, 241, 0.12)', color: 'var(--primary)', padding: '4px 10px', borderRadius: '6px', fontWeight: 700 }}>
              Live Telemetry
            </span>
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.88rem', margin: '4px 0 0 0' }}>
            Role Context: <strong>{user?.role || 'Guest'}</strong> | Branch ID: <strong>{user?.branchId || 'All'}</strong>
          </p>
        </div>

        {/* Dynamic header toggles based on role */}
        {isCounselor && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <label htmlFor="availability-status" style={{ fontSize: '0.84rem', color: 'var(--muted)', fontWeight: 600, marginBottom: 0 }}>My Availability Status:</label>
            <select
              id="availability-status"
              aria-label="My Availability Status"
              value={counselorStatus}
              onChange={(e) => handleUpdateAvailability(e.target.value)}
              style={{ width: 'auto', background: 'var(--surface-alt)', border: '1px solid var(--border)', padding: '6px 12px', fontSize: '0.82rem', height: '36px', borderRadius: 'var(--radius-sm)' }}
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
            style={{ height: '38px', minHeight: '38px', fontSize: '0.82rem', padding: '0 16px' }}
          >
            <span aria-hidden="true" style={{ marginRight: '4px' }}>➕</span> Check-In Walk-in
          </button>
        )}
      </div>

      {/* ─── Role-Aware Telemetry Highlights ─── */}
      <div className="ops-metric-compact-grid">
        {isFrontDesk && (
          <>
            <div className="ops-metric-compact">
              <div className="ops-metric-compact-icon" style={{ background: 'var(--primary-glow)', color: 'var(--primary)' }}>🎫</div>
              <div className="ops-metric-compact-details">
                <span className="ops-metric-compact-label">Waiting Students</span>
                <span className="ops-metric-compact-value">{waitingStudents.length}</span>
              </div>
            </div>
            <div className="ops-metric-compact">
              <div className="ops-metric-compact-icon" style={{ background: 'var(--success-glow)', color: 'var(--success)' }}>👥</div>
              <div className="ops-metric-compact-details">
                <span className="ops-metric-compact-label">Available Counselors</span>
                <span className="ops-metric-compact-value">{counselors.filter(c => c.status === 'Available').length}</span>
              </div>
            </div>
          </>
        )}

        {isCounselor && (
          <>
            <div className="ops-metric-compact">
              <div className="ops-metric-compact-icon" style={{ background: 'var(--warning-glow)', color: 'var(--warning)' }}>🎙️</div>
              <div className="ops-metric-compact-details">
                <span className="ops-metric-compact-label">My Active Sessions</span>
                <span className="ops-metric-compact-value">{myStudents.filter(w => w.status === 'In Session').length}</span>
              </div>
            </div>
            <div className="ops-metric-compact">
              <div className="ops-metric-compact-icon" style={{ background: 'var(--primary-glow)', color: 'var(--primary)' }}>⏳</div>
              <div className="ops-metric-compact-details">
                <span className="ops-metric-compact-label">My Assigned Queue</span>
                <span className="ops-metric-compact-value">{myStudents.filter(w => w.status === 'Assigned').length}</span>
              </div>
            </div>
          </>
        )}

        {isManager && (
          <>
            <div className="ops-metric-compact" style={{ borderLeft: slaAlerts.filter(a => a.type === 'breach').length > 0 ? '3px solid var(--danger)' : 'none' }}>
              <div className="ops-metric-compact-icon" style={{ background: 'var(--danger-glow)', color: 'var(--danger)' }}>🚨</div>
              <div className="ops-metric-compact-details">
                <span className="ops-metric-compact-label">Critical SLA Alerts</span>
                <span className="ops-metric-compact-value">{slaAlerts.filter(a => a.type === 'breach').length}</span>
              </div>
            </div>
            <div className="ops-metric-compact">
              <div className="ops-metric-compact-icon" style={{ background: 'var(--warning-glow)', color: 'var(--warning)' }}>⚠️</div>
              <div className="ops-metric-compact-details">
                <span className="ops-metric-compact-label">Active Warnings</span>
                <span className="ops-metric-compact-value">{slaAlerts.filter(a => a.type === 'warning').length}</span>
              </div>
            </div>
          </>
        )}

        {isAdmin && (
          <>
            <div className="ops-metric-compact">
              <div className="ops-metric-compact-icon" style={{ background: 'var(--success-glow)', color: 'var(--success)' }}>⚡</div>
              <div className="ops-metric-compact-details">
                <span className="ops-metric-compact-label">System State</span>
                <span className="ops-metric-compact-value" style={{ fontSize: '1rem', color: dbLatency !== null ? 'var(--success)' : 'var(--muted)', fontWeight: 800 }}>
                  {dbLatency !== null ? `Healthy (${dbLatency}ms)` : 'Unavailable'}
                </span>
              </div>
            </div>
            <div className="ops-metric-compact">
              <div className="ops-metric-compact-icon" style={{ background: 'var(--primary-glow)', color: 'var(--primary)' }}>🪝</div>
              <div className="ops-metric-compact-details">
                <span className="ops-metric-compact-label">Webhooks Status</span>
                <span className="ops-metric-compact-value" style={{ fontSize: '1rem', color: webhookStatus !== null ? 'var(--primary)' : 'var(--muted)', fontWeight: 800 }}>
                  {webhookStatus !== null ? webhookStatus : 'Unavailable'}
                </span>
              </div>
            </div>
          </>
        )}

        {/* Global base indicators */}
        <div className="ops-metric-compact">
          <div className="ops-metric-compact-icon" style={{ background: 'var(--border)', color: 'var(--text)' }}>🎫</div>
          <div className="ops-metric-compact-details">
            <span className="ops-metric-compact-label">Checked-In Today</span>
            <span className="ops-metric-compact-value">{walkins.length}</span>
          </div>
        </div>
      </div>

      {/* ─── Operations Command Center Grid Layout ─── */}
      <div className="ops-deck-grid">
        
        {/* COLUMN 1: Active Queue / Assignments */}
        <div className="ops-card">
          <div className="ops-card-header">
            <h2>Active Queue Board</h2>
            <span style={{ fontSize: '0.74rem', color: 'var(--muted)', fontWeight: 700 }}>Total: {activeQueue.length}</span>
          </div>
          <div tabIndex={0} role="region" aria-label="Active Queue Board List" style={{ flex: 1, overflowY: 'auto', maxHeight: '520px', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }} className="scroller">
            {activeQueue.length > 0 ? (
              activeQueue.map((w) => {
                const created = new Date(w.walkinDate).getTime();
                const waitSecs = Math.max(0, Math.floor((currentTime - created) / 1000));
                
                let sessionElapsedSecs = 0;
                const activeSession = w.sessions.find(s => s.status === 'IN_SESSION');
                if (activeSession && activeSession.startTime) {
                  sessionElapsedSecs = Math.max(0, Math.floor((currentTime - new Date(activeSession.startTime).getTime()) / 1000));
                }

                return (
                  <div key={w.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', background: 'var(--surface-alt)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <button
                        type="button"
                        onClick={() => openStudentDrawer(w)}
                        style={{
                          background: 'none', border: 'none', padding: 0,
                          cursor: 'pointer', fontSize: '0.86rem', fontWeight: 800,
                          color: 'var(--text)', fontFamily: 'var(--font-sans)',
                          textAlign: 'left', transition: 'color var(--transition-fast)',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.color = 'var(--primary)')}
                        onMouseLeave={e => (e.currentTarget.style.color = 'var(--text)')}
                        aria-label={`View profile for ${w.name}`}
                      >
                        {w.name}
                      </button>
                      <span style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>
                        Token: <strong>A{w.queueEntry ? w.queueEntry.position : w.id.slice(-3)}</strong> | Course: <strong>{w.course}</strong>
                      </span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--muted)', fontFamily: 'monospace' }}>
                        {mounted
                          ? (w.status === 'In Session'
                              ? `Session Time: ${formatHHMMSS(sessionElapsedSecs)}`
                              : `Waiting: ${formatHHMMSS(waitSecs)}`)
                          : '—'
                        }
                      </span>
                    </div>
                    <div>
                      {renderStatusPill(w.status, w.status === 'In Session' ? sessionElapsedSecs : waitSecs)}
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--muted)', fontSize: '0.84rem' }}>
                No active students waiting or in session.
              </div>
            )}
          </div>
        </div>

        {/* COLUMN 2: Counselor Availability & Operations Workspace */}
        <div className="ops-card">
          <div className="ops-card-header">
            <h2>Counselor Availability Roster</h2>
            <span style={{ fontSize: '0.74rem', color: 'var(--muted)', fontWeight: 700 }}>Active: {counselors.length}</span>
          </div>
          <div tabIndex={0} role="region" aria-label="Counselor Availability Roster List" style={{ flex: 1, overflowY: 'auto', maxHeight: '520px', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }} className="scroller">
            
            {/* If the user is a counselor, display their specific active desk workspace widget at the top */}
            {isCounselor && (
              <div style={{ border: '1.5px solid var(--primary)', borderRadius: 'var(--radius-sm)', padding: '12px', background: 'var(--primary-glow)', marginBottom: 'var(--space-2)' }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--primary)', display: 'block', letterSpacing: '0.04em' }}>
                  My Workspace Desk
                </span>
                <div style={{ marginTop: '8px' }}>
                  {myStudents.length > 0 ? (
                    myStudents.map(student => {
                      const activeSession = student.sessions.find(s => s.status === 'IN_SESSION');
                      return (
                        <div key={student.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <span style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text)' }}>{student.name}</span>
                            <span style={{ fontSize: '0.72rem', color: 'var(--muted)', display: 'block' }}>Course: {student.course}</span>
                          </div>
                          <button
                            type="button"
                            className="primary-btn"
                            onClick={() => handleOpenAndStartWorkspace(student)}
                            style={{ height: '32px', minHeight: '32px', padding: '0 12px', fontSize: '0.78rem' }}
                            disabled={loading}
                          >
                            {activeSession ? 'Open Desk' : 'Start Workspace'}
                          </button>
                        </div>
                      );
                    })
                  ) : (
                    <span style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>No student currently assigned to your desk.</span>
                  )}
                </div>
              </div>
            )}

            {/* Counselors roster */}
            {counselors.length > 0 ? (
              counselors.map((c) => {
                const activeWalkin = walkins.find(w => 
                  w.status === 'In Session' && 
                  w.sessions.some(s => s.counselorId === c.id && s.status === 'IN_SESSION')
                );
                const isAvailable = c.status === 'Available';
                
                let sessionSecs = 0;
                if (activeWalkin) {
                  const activeSession = activeWalkin.sessions.find(s => s.counselorId === c.id && s.status === 'IN_SESSION');
                  if (activeSession && activeSession.startTime) {
                    sessionSecs = Math.max(0, Math.floor((currentTime - new Date(activeSession.startTime).getTime()) / 1000));
                  }
                }

                return (
                  <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', background: 'var(--surface-alt)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--text)' }}>{c.name}</span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>
                        Branch: <strong>{c.branchName}</strong> | Handled: <strong>{c.status}</strong>
                      </span>
                      {activeWalkin && (
                        <span style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>
                          Session: <strong>{activeWalkin.name}</strong> ({mounted ? formatHHMMSS(sessionSecs) : '—'})
                        </span>
                      )}
                    </div>
                    <div>
                      {renderStatusPill(c.status, activeWalkin ? sessionSecs : undefined)}
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--muted)', fontSize: '0.84rem' }}>
                No counselors loaded.
              </div>
            )}
          </div>
        </div>

        {/* COLUMN 3: SLA Alerts & Recent Activity Feed */}
        <div className="ops-card">
          <div className="ops-card-header">
            <h2>Alerts & Activity Stream</h2>
            <span style={{ fontSize: '0.74rem', color: 'var(--muted)', fontWeight: 700 }}>Alarms: {slaAlerts.length}</span>
          </div>
          <div tabIndex={0} role="region" aria-label="Alerts and Activity Stream Timeline" style={{ flex: 1, overflowY: 'auto', maxHeight: '520px', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }} className="scroller">
            
            {/* Critical SLA alerts banner container */}
            {slaAlerts.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {/* A4 fix: promote to h3 for correct document heading outline */}
                <h3 style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--danger)', letterSpacing: '0.04em', margin: 0 }}>SLA Warnings</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {slaAlerts.slice(0, 4).map(alert => (
                    // A1 fix: breach = role="alert" (live), warning = role="status" (polite)
                    <div
                      key={alert.id}
                      className={`ops-alert-item ${alert.type}`}
                      role={alert.type === 'breach' ? 'alert' : 'status'}
                      aria-live={alert.type === 'breach' ? 'assertive' : 'polite'}
                      aria-label={alert.message}
                    >
                      <span aria-hidden="true" style={{ fontWeight: 800 }}>{alert.type === 'breach' ? '🚨' : '⚠️'}</span>
                      <span>{alert.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Vertical timeline activity stream */}
            <div>
              {/* A4 fix: h3 for correct document outline */}
              <h3 style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--primary)', letterSpacing: '0.04em', margin: '0 0 var(--space-2) 0' }}>Activity Stream</h3>
              {/* A2 fix: semantic ol/li for screen reader navigation */}
              <ol className="ops-activity-feed" aria-label="Recent activity events">
                {recentActivities.map((act, index) => (
                  <li key={index} className={`ops-activity-item ${act.type}`} aria-label={`${act.title}: ${act.description}`}>
                    <time className="ops-activity-time" dateTime={act.timestamp.toISOString()}>
                      {mounted ? act.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : ''}
                    </time>
                    <div className="ops-activity-desc">
                      <strong>{act.title}</strong>: {act.description}
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>

      </div>

      {/* Legacy Details CRM Modal (Preserving functionality for student records lookup) */}
      {showDetailsModal && selectedDetailsStudent && (
        <div className="modal-overlay" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(6, 9, 19, 0.8)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000
        }}>
          <div style={{
            background: 'var(--card-bg)', border: '1.5px solid var(--border)', borderRadius: '20px',
            width: '95vw', height: '90vh', maxWidth: '1200px',
            boxShadow: '0 24px 64px rgba(0, 0, 0, 0.5)',
            display: 'flex', flexDirection: 'column', overflow: 'hidden'
          }}>
            {/* Header */}
            <div style={{
              padding: '18px 24px', borderBottom: '1.5px solid var(--border)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              background: 'rgba(255,255,255,0.01)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, fontSize: '1rem', color: '#fff',
                  background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                  boxShadow: '0 3px 10px rgba(99,102,241,0.3)',
                }}>
                  {getInitials(selectedDetailsStudent.name)}
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {selectedDetailsStudent.name}
                    {renderStatusPill(selectedDetailsStudent.status)}
                  </h2>
                  <p style={{ margin: '2px 0 0 0', fontSize: '0.82rem', color: 'var(--muted)' }}>
                    Record ID: <strong>#{selectedDetailsStudent.id}</strong>
                  </p>
                </div>
              </div>
              <button
                type="button"
                aria-label="Close details modal"
                style={{
                  background: 'rgba(255,255,255,0.03)', border: '1.5px solid var(--border)',
                  borderRadius: '50%', color: 'var(--text)', cursor: 'pointer',
                  width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1rem', transition: 'all 0.2s', outline: 'none',
                }}
                onClick={() => setShowDetailsModal(false)}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', background: 'var(--card-bg)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: 'var(--text)' }}>
                  Lead Record Sheet
                </h3>
                <StudentDetailsRecord student={selectedDetailsStudent} counselors={counselors} onClose={() => setShowDetailsModal(false)} />
              </div>
            </div>
          </div>
        </div>
      )}
      {/* ── Student Context Drawer ── */}
      <StudentContextDrawer
        student={drawerStudent}
        counselors={counselors.map(c => ({ id: c.id, name: c.name, branchName: c.branchName }))}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </section>
  );
}
