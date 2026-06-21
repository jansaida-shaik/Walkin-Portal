'use client';

import { useState, useEffect, useRef } from 'react';

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

interface QueueEntry {
  id: string;
  studentId: string;
  position: number;
  status: string;
}

export interface DrawerStudent {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  course: string;
  walkinDate: Date | string;
  status: string;
  remarks: string | null;
  source: string;
  details: any;
  sessions: Session[];
  branchName?: string;
  branchId?: string;
  queueEntry?: QueueEntry | null;
}

interface Counselor {
  id: string;
  name: string;
  branchName?: string;
}

interface StudentContextDrawerProps {
  student: DrawerStudent | null;
  counselors?: Counselor[];
  isOpen: boolean;
  onClose: () => void;
}

type DrawerTab = 'overview' | 'queue' | 'sessions' | 'notes' | 'timeline';

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function formatWaitMins(walkinDate: Date | string): string {
  const now = Date.now();
  const created = new Date(walkinDate).getTime();
  const diffMins = Math.floor((now - created) / 60000);
  if (diffMins < 60) return `${diffMins}m`;
  const h = Math.floor(diffMins / 60);
  const m = diffMins % 60;
  return `${h}h ${m}m`;
}

function formatDate(d: Date | string | null): string {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatDateTime(d: Date | string | null): string {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function StatusChip({ status }: { status: string }) {
  const map: Record<string, string> = {
    'Waiting': 'pending',
    'Assigned': 'assigned',
    'In Session': 'in_session',
    'Completed': 'completed',
    'Follow-up': 'busy',
    'No Show': 'offline',
    'Cancelled': 'offline',
    'Available': 'available',
    'Busy': 'busy',
    'Break': 'break',
    'Offline': 'offline',
    'IN_SESSION': 'in_session',
    'COMPLETED': 'completed',
    'CANCELLED': 'offline',
    'ASSIGNED': 'assigned',
  };
  const cls = map[status] || 'offline';
  return <span className={`status-chip ${cls}`}>{status}</span>;
}

const TABS: { id: DrawerTab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'queue', label: 'Queue Status' },
  { id: 'sessions', label: 'Sessions' },
  { id: 'notes', label: 'Notes' },
  { id: 'timeline', label: 'Timeline' },
];

export default function StudentContextDrawer({
  student,
  counselors = [],
  isOpen,
  onClose,
}: StudentContextDrawerProps) {
  const [activeTab, setActiveTab] = useState<DrawerTab>('overview');
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previouslyFocusedElementRef = useRef<HTMLElement | null>(null);

  // Keyboard navigation & Focus management
  useEffect(() => {
    if (isOpen) {
      // Record currently focused element to return focus later
      previouslyFocusedElementRef.current = document.activeElement as HTMLElement;

      // Focus the drawer close button (or drawer panel itself) for screen readers
      const focusTimer = setTimeout(() => {
        if (closeButtonRef.current) {
          closeButtonRef.current.focus();
        }
      }, 50);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          handleClose();
        }
      };

      window.addEventListener('keydown', handleKeyDown);

      return () => {
        clearTimeout(focusTimer);
        window.removeEventListener('keydown', handleKeyDown);
        // Restore focus to the triggering element
        if (previouslyFocusedElementRef.current) {
          previouslyFocusedElementRef.current.focus();
        }
      };
    }
  }, [isOpen]);

  // Reset tab when drawer opens with a new student
  const handleClose = () => {
    setActiveTab('overview');
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`context-drawer-backdrop ${isOpen ? 'open' : ''}`}
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div
        className={`context-drawer-wrapper ${isOpen ? 'open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={student ? `Student profile: ${student.name}` : 'Student profile'}
      >
        {student ? (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

            {/* ── Drawer Header ── */}
            <div className="drawer-header">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div className="drawer-identity">
                  <div className="drawer-avatar" aria-hidden="true">
                    {getInitials(student.name)}
                  </div>
                  <div>
                    <p className="drawer-name">{student.name}</p>
                    <p className="drawer-meta">#{student.id.slice(-8).toUpperCase()}</p>
                  </div>
                </div>
                <button
                  ref={closeButtonRef}
                  type="button"
                  className="drawer-close-btn"
                  onClick={handleClose}
                  aria-label="Close student profile drawer"
                >
                  ✕
                </button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
                <StatusChip status={student.status} />
                <span style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>{student.course}</span>
                {student.branchName && (
                  <span style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>
                    📍 {student.branchName}
                  </span>
                )}
              </div>
            </div>

            {/* ── Tab Navigation ── */}
            <nav className="drawer-tab-nav" role="tablist" aria-label="Student profile sections">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  aria-controls={`drawer-panel-${tab.id}`}
                  id={`drawer-tab-${tab.id}`}
                  className={`drawer-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </nav>

            {/* ── Tab Panels ── */}
            <div className="drawer-body scroller">

              {/* ── Overview ── */}
              {activeTab === 'overview' && (
                <div
                  id="drawer-panel-overview"
                  role="tabpanel"
                  aria-labelledby="drawer-tab-overview"
                >
                  <span className="drawer-section-label">Contact Details</span>
                  <div className="drawer-info-grid">
                    <div className="drawer-info-item">
                      <span className="drawer-info-label">Phone</span>
                      <span className="drawer-info-value" style={{ fontFamily: 'var(--font-mono)' }}>{student.phone || '—'}</span>
                    </div>
                    <div className="drawer-info-item">
                      <span className="drawer-info-label">Email</span>
                      <span className="drawer-info-value">{student.email || student.details?.email || '—'}</span>
                    </div>
                    <div className="drawer-info-item">
                      <span className="drawer-info-label">Parent Phone</span>
                      <span className="drawer-info-value" style={{ fontFamily: 'var(--font-mono)' }}>
                        {student.details?.parent_phone || student.details?.['Parent Number'] || '—'}
                      </span>
                    </div>
                    <div className="drawer-info-item">
                      <span className="drawer-info-label">Lead Source</span>
                      <span className="drawer-info-value">{student.source || '—'}</span>
                    </div>
                    <div className="drawer-info-item">
                      <span className="drawer-info-label">Walk-in Date</span>
                      <span className="drawer-info-value">{formatDate(student.walkinDate)}</span>
                    </div>
                    <div className="drawer-info-item">
                      <span className="drawer-info-label">Branch</span>
                      <span className="drawer-info-value">{student.branchName || '—'}</span>
                    </div>
                  </div>

                  <div style={{ marginTop: 'var(--space-5)' }}>
                    <span className="drawer-section-label">Academic Profile</span>
                    <div className="drawer-info-grid">
                      <div className="drawer-info-item">
                        <span className="drawer-info-label">Qualification</span>
                        <span className="drawer-info-value">
                          {student.details?.qualification || student.details?.['Educational Qualification'] || '—'}
                        </span>
                      </div>
                      <div className="drawer-info-item">
                        <span className="drawer-info-label">College</span>
                        <span className="drawer-info-value">
                          {student.details?.college_name || student.details?.['Institution Name'] || '—'}
                        </span>
                      </div>
                      <div className="drawer-info-item">
                        <span className="drawer-info-label">Passout Year</span>
                        <span className="drawer-info-value">
                          {student.details?.passout_year || student.details?.['Year of Passout'] || '—'}
                        </span>
                      </div>
                      <div className="drawer-info-item">
                        <span className="drawer-info-label">Gender</span>
                        <span className="drawer-info-value">
                          {student.details?.gender || student.details?.['Gender'] || '—'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Queue Status ── */}
              {activeTab === 'queue' && (
                <div
                  id="drawer-panel-queue"
                  role="tabpanel"
                  aria-labelledby="drawer-tab-queue"
                >
                  <span className="drawer-section-label">Queue Status</span>
                  <div className="drawer-info-grid">
                    <div className="drawer-info-item">
                      <span className="drawer-info-label">Current Status</span>
                      <StatusChip status={student.status} />
                    </div>
                    <div className="drawer-info-item">
                      <span className="drawer-info-label">Queue Position</span>
                      <span className="drawer-info-value">
                        {student.queueEntry ? `#${student.queueEntry.position}` : '—'}
                      </span>
                    </div>
                    <div className="drawer-info-item">
                      <span className="drawer-info-label">Priority</span>
                      <span className="drawer-info-value">
                        {student.details?.priority || 'Medium'}
                      </span>
                    </div>
                    <div className="drawer-info-item">
                      <span className="drawer-info-label">Time in Queue</span>
                      <span className="drawer-info-value" style={{ fontFamily: 'var(--font-mono)' }}>
                        {(student.status === 'Waiting' || student.status === 'Assigned')
                          ? formatWaitMins(student.walkinDate)
                          : '—'}
                      </span>
                    </div>
                  </div>

                  {/* Assigned Counselor */}
                  {(() => {
                    const activeSession = student.sessions.find(
                      s => s.status === 'IN_SESSION' || s.status === 'ASSIGNED'
                    );
                    const counselor = activeSession
                      ? counselors.find(c => c.id === activeSession.counselorId)
                      : null;
                    return counselor ? (
                      <div style={{ marginTop: 'var(--space-5)' }}>
                        <span className="drawer-section-label">Assigned Counselor</span>
                        <div className="drawer-session-card">
                          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                            <div className="drawer-avatar" style={{ width: 32, height: 32, fontSize: '0.8rem' }}>
                              {getInitials(counselor.name)}
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{counselor.name}</div>
                              {counselor.branchName && (
                                <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{counselor.branchName}</div>
                              )}
                            </div>
                          </div>
                          {activeSession?.startTime && (
                            <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: 'var(--space-1)' }}>
                              Session started: {formatDateTime(activeSession.startTime)}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : null;
                  })()}
                </div>
              )}

              {/* ── Sessions ── */}
              {activeTab === 'sessions' && (
                <div
                  id="drawer-panel-sessions"
                  role="tabpanel"
                  aria-labelledby="drawer-tab-sessions"
                >
                  <span className="drawer-section-label">
                    Session History ({student.sessions.length})
                  </span>
                  {student.sessions.length === 0 ? (
                    <p style={{ color: 'var(--muted)', fontSize: '0.88rem' }}>No sessions recorded.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                      {[...student.sessions].reverse().map(sess => {
                        const counselorName = counselors.find(c => c.id === sess.counselorId)?.name || 'Counselor';
                        return (
                          <div key={sess.id} className="drawer-session-card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                              <span style={{ fontWeight: 700, fontSize: '0.86rem' }}>{counselorName}</span>
                              <StatusChip status={sess.status} />
                            </div>
                            <div style={{ display: 'flex', gap: 'var(--space-4)', fontSize: '0.78rem', color: 'var(--muted)' }}>
                              <span>Start: {formatDateTime(sess.startTime)}</span>
                              {sess.duration && (
                                <span>Duration: {Math.floor(sess.duration / 60)}m {sess.duration % 60}s</span>
                              )}
                            </div>
                            {sess.notes && (
                              <div style={{
                                fontSize: '0.82rem', color: 'var(--text)', lineHeight: 1.5,
                                background: 'var(--surface)', padding: 'var(--space-3)',
                                borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)',
                                whiteSpace: 'pre-wrap',
                              }}>
                                {sess.notes}
                              </div>
                            )}
                            {sess.followUpStatus && (
                              <div style={{ fontSize: '0.74rem', color: 'var(--muted)' }}>
                                Follow-up: <strong style={{ color: 'var(--text)' }}>{sess.followUpStatus}</strong>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ── Notes ── */}
              {activeTab === 'notes' && (
                <div
                  id="drawer-panel-notes"
                  role="tabpanel"
                  aria-labelledby="drawer-tab-notes"
                >
                  <span className="drawer-section-label">Intake Remarks</span>
                  {student.remarks ? (
                    <div style={{
                      background: 'var(--surface-alt)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)',
                      padding: 'var(--space-4)',
                      fontSize: '0.88rem',
                      color: 'var(--text)',
                      lineHeight: 1.6,
                      whiteSpace: 'pre-wrap',
                    }}>
                      {student.remarks}
                    </div>
                  ) : (
                    <p style={{ color: 'var(--muted)', fontSize: '0.88rem' }}>No remarks recorded.</p>
                  )}

                  {/* Session notes summary */}
                  {student.sessions.some(s => s.notes) && (
                    <div style={{ marginTop: 'var(--space-5)' }}>
                      <span className="drawer-section-label">Counselor Session Notes</span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                        {student.sessions.filter(s => s.notes).map(sess => {
                          const counselorName = counselors.find(c => c.id === sess.counselorId)?.name || 'Counselor';
                          return (
                            <div key={sess.id} className="drawer-session-card">
                              <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '0.05em' }}>
                                {counselorName} · {formatDateTime(sess.startTime)}
                              </div>
                              <div style={{ fontSize: '0.86rem', color: 'var(--text)', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                                {sess.notes}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── Timeline ── */}
              {activeTab === 'timeline' && (
                <div
                  id="drawer-panel-timeline"
                  role="tabpanel"
                  aria-labelledby="drawer-tab-timeline"
                >
                  <span className="drawer-section-label">Student Journey Timeline</span>
                  <ol className="drawer-timeline" aria-label="Student journey timeline">
                    {/* Check-in event */}
                    <li className="drawer-timeline-item check_in">
                      <time className="drawer-timeline-time" dateTime={new Date(student.walkinDate).toISOString()}>
                        {formatDateTime(student.walkinDate)}
                      </time>
                      <strong>Checked In</strong> — {student.course} at {student.branchName || 'branch'}
                    </li>

                    {/* Session events */}
                    {[...student.sessions]
                      .sort((a, b) =>
                        new Date(a.startTime || 0).getTime() - new Date(b.startTime || 0).getTime()
                      )
                      .map(sess => {
                        const counselorName = counselors.find(c => c.id === sess.counselorId)?.name || 'Counselor';
                        return (
                          <li key={sess.id + '-assigned'} className="drawer-timeline-item assigned">
                            <time className="drawer-timeline-time" dateTime={sess.startTime ? new Date(sess.startTime).toISOString() : ''}>
                              {sess.startTime ? formatDateTime(new Date(new Date(sess.startTime).getTime() - 2 * 60 * 1000)) : '—'}
                            </time>
                            <strong>Counselor Assigned</strong> — {counselorName}
                          </li>
                        );
                      })
                    }

                    {student.sessions
                      .filter(s => s.startTime)
                      .sort((a, b) =>
                        new Date(a.startTime || 0).getTime() - new Date(b.startTime || 0).getTime()
                      )
                      .map(sess => {
                        const counselorName = counselors.find(c => c.id === sess.counselorId)?.name || 'Counselor';
                        return (
                          <li key={sess.id + '-started'} className="drawer-timeline-item started">
                            <time className="drawer-timeline-time" dateTime={new Date(sess.startTime!).toISOString()}>
                              {formatDateTime(sess.startTime)}
                            </time>
                            <strong>Session Started</strong> — with {counselorName}
                          </li>
                        );
                      })
                    }

                    {student.sessions
                      .filter(s => s.status === 'COMPLETED' && s.endTime)
                      .sort((a, b) =>
                        new Date(a.endTime || 0).getTime() - new Date(b.endTime || 0).getTime()
                      )
                      .map(sess => {
                        const counselorName = counselors.find(c => c.id === sess.counselorId)?.name || 'Counselor';
                        return (
                          <li key={sess.id + '-completed'} className="drawer-timeline-item completed">
                            <time className="drawer-timeline-time" dateTime={new Date(sess.endTime!).toISOString()}>
                              {formatDateTime(sess.endTime)}
                            </time>
                            <strong>Session Completed</strong> — {counselorName}
                            {sess.duration ? ` (${Math.floor(sess.duration / 60)}m)` : ''}
                          </li>
                        );
                      })
                    }

                    {/* Current status if active */}
                    {(student.status === 'Waiting' || student.status === 'Assigned') && (
                      <li className="drawer-timeline-item check_in">
                        <span className="drawer-timeline-time">Now</span>
                        <strong>Currently {student.status}</strong> — waiting {formatWaitMins(student.walkinDate)}
                      </li>
                    )}
                  </ol>
                </div>
              )}

            </div>{/* end drawer-body */}
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--muted)', fontSize: '0.9rem' }}>
            No student selected.
          </div>
        )}
      </div>
    </>
  );
}
