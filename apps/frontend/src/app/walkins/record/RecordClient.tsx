'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SessionUser } from '../../../lib/auth';
import {
  startCounsellingSession,
  saveSessionNotes,
  endCounsellingSession,
  cancelCounsellingSession,
  analyzeSessionAudio,
} from '../../../actions/walkinActions';
import StudentDetailsRecord from '../../../components/StudentDetailsRecord';
import AudioPlayerWithAnalyzer from '../../../components/AudioPlayerWithAnalyzer';

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
  branchName?: string;
}

interface Counselor {
  id: string;
  name: string;
  branchId: string;
  branchName: string;
}

interface RecordClientProps {
  student: Student;
  counselors: Counselor[];
  user: SessionUser | null;
}

const FOLLOWUP_OPTIONS = [
  { value: 'No Follow-up', label: 'No Follow-up (Direct Admission)' },
  { value: 'Follow-up Required', label: 'Follow-up Required' },
  { value: 'Ready to Enroll', label: 'Ready to Enroll' },
  { value: 'Not Interested', label: 'Not Interested' },
  { value: 'Callback Scheduled', label: 'Callback Scheduled' },
];

function formatHHMMSS(s: number) {
  if (isNaN(s) || s < 0) return '00:00:00';
  return [Math.floor(s / 3600), Math.floor((s % 3600) / 60), Math.floor(s % 60)]
    .map(n => String(n).padStart(2, '0')).join(':');
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return '—';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s}s`;
  if (s === 0) return `${m}m`;
  return `${m}m ${s}s`;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatDateTime(dt: Date | string | null): string {
  if (!dt) return '—';
  const d = new Date(dt);
  if (isNaN(d.getTime())) return '—';
  const day = d.getDate();
  const month = MONTHS[d.getMonth()];
  const year = d.getFullYear();
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${day} ${month} ${year}, ${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
}

function formatTime(dt: Date | string | null): string {
  if (!dt) return '—';
  const d = new Date(dt);
  if (isNaN(d.getTime())) return '—';
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${String(hours).padStart(2, '0')}:${minutes}:${seconds} ${ampm}`;
}

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function StatusPill({ status }: { status: string }) {
  const C: Record<string, { bg: string; color: string; border: string; dot?: string }> = {
    'Assigned': { bg: 'var(--primary-glow)', color: 'var(--primary)', border: 'var(--primary-glow)', dot: 'var(--primary)' },
    'In Session': { bg: 'var(--warning-glow)', color: 'var(--warning)', border: 'var(--warning-glow)', dot: 'var(--warning)' },
    'Completed': { bg: 'var(--success-glow)', color: 'var(--success)', border: 'var(--success-glow)', dot: 'var(--success)' },
    'Waiting': { bg: 'var(--info-glow)', color: 'var(--info)', border: 'var(--info-glow)', dot: 'var(--info)' },
    'Follow-up': { bg: 'var(--primary-glow)', color: 'var(--accent)', border: 'var(--primary-glow)', dot: 'var(--accent)' },
    'No Show': { bg: 'var(--border)', color: 'var(--muted)', border: 'var(--border)' },
    'Cancelled': { bg: 'var(--danger-glow)', color: 'var(--danger)', border: 'var(--danger-glow)' },
  };
  const c = C[status] || { bg: 'var(--border)', color: 'var(--muted)', border: 'var(--border)' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '5px 12px', borderRadius: 999,
      fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.06em',
      textTransform: 'uppercase', whiteSpace: 'nowrap', flexShrink: 0,
      background: c.bg, color: c.color, border: `1.5px solid ${c.border}`,
    }}>
      {c.dot && <span style={{
        width: 6, height: 6, borderRadius: '50%', background: c.dot,
        display: 'inline-block', boxShadow: `0 0 5px ${c.dot}`,
        animation: status === 'In Session' ? 'pulseDot 1.4s ease-in-out infinite' : undefined,
      }} />}
      {status}
    </span>
  );
}

function SessionStatusPill({ status }: { status: string }) {
  const C: Record<string, { bg: string; color: string }> = {
    'IN_SESSION': { bg: 'var(--warning-glow)', color: 'var(--warning)' },
    'ASSIGNED': { bg: 'var(--primary-glow)', color: 'var(--primary)' },
    'COMPLETED': { bg: 'var(--success-glow)', color: 'var(--success)' },
    'CANCELLED': { bg: 'var(--danger-glow)', color: 'var(--danger)' },
  };
  const c = C[status] || { bg: 'var(--border)', color: 'var(--muted)' };
  const label = status.replace('_', ' ');
  return (
    <span style={{
      background: c.bg, color: c.color, padding: '3px 10px',
      borderRadius: 999, fontSize: '0.68rem', fontWeight: 800,
      letterSpacing: '0.05em', textTransform: 'uppercase',
    }}>{label}</span>
  );
}

function parseBoldText(text: string): React.ReactNode[] {
  const parts = text.split(/\*\*([^*]+)\*\*/g);
  return parts.map((part, index) => {
    if (index % 2 === 1) {
      return <strong key={index} style={{ color: 'var(--text)', fontWeight: 800 }}>{part}</strong>;
    }
    return part;
  });
}

function renderSummary(summaryText: string) {
  if (!summaryText) return null;

  const lines = summaryText.split('\n').map(l => l.trim()).filter(Boolean);
  const sections: { title: string; icon: string; items: React.ReactNode[] }[] = [];

  lines.forEach(line => {
    // Check if line is a header
    const headerMatch = line.match(/^([^\w\s*]*)\s*\*\*([^*]+)\*\*/);
    if (headerMatch && line.endsWith(':')) {
      const icon = headerMatch[1] || '📌';
      const title = headerMatch[2].replace(/:$/, '').trim();
      sections.push({ title, icon, items: [] });
      return;
    }

    if (sections.length === 0) {
      sections.push({ title: 'Discussion details', icon: '📝', items: [] });
    }

    const lastSection = sections[sections.length - 1];

    if (line.startsWith('-')) {
      const content = line.substring(1).trim();
      const itemMatch = content.match(/^\*\*([^*]+)\*\*\s*:\s*(.*)/);
      if (itemMatch) {
        const key = itemMatch[1];
        const val = itemMatch[2];
        lastSection.items.push(
          <div key={line} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '8px' }}>
            <span style={{
              background: 'rgba(16,185,129,0.08)',
              color: '#10b981',
              padding: '2px 8px',
              borderRadius: '6px',
              fontSize: '0.74rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              whiteSpace: 'nowrap',
              border: '1px solid rgba(16,185,129,0.15)',
              marginTop: '2px'
            }}>
              {key}
            </span>
            <span style={{ fontSize: '0.86rem', color: 'var(--text)', lineHeight: '1.5' }}>
              {parseBoldText(val)}
            </span>
          </div>
        );
      } else {
        lastSection.items.push(
          <div key={line} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '6px', paddingLeft: '4px' }}>
            <span style={{ color: '#10b981', fontSize: '0.9rem', marginTop: '-1px' }}>•</span>
            <span style={{ fontSize: '0.86rem', color: 'var(--text)', lineHeight: '1.5' }}>
              {parseBoldText(content)}
            </span>
          </div>
        );
      }
    } else {
      lastSection.items.push(
        <p key={line} style={{ margin: '4px 0 8px 0', fontSize: '0.86rem', color: 'var(--text)', lineHeight: '1.6' }}>
          {parseBoldText(line)}
        </p>
      );
    }
  });

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginTop: '4px' }}>
      {sections.map((sec, idx) => (
        <div key={idx} style={{
          background: 'rgba(255, 255, 255, 0.015)',
          border: '1.5px solid var(--border)',
          borderRadius: '12px',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
        }}>
          <h4 style={{
            margin: '0 0 12px 0',
            fontSize: '0.82rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: '#10b981',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            borderBottom: '1px solid rgba(16,185,129,0.1)',
            paddingBottom: '8px'
          }}>
            <span style={{ fontSize: '1.1rem' }}>{sec.icon}</span>
            <span>{sec.title}</span>
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            {sec.items}
          </div>
        </div>
      ))}
    </div>
  );
}



export default function RecordClient({ student, counselors, user }: RecordClientProps) {
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState<number>(Date.now());
  const [notes, setNotes] = useState<string>('');
  const [followUp, setFollowUp] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string>('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');
  const [showDetails, setShowDetails] = useState<Record<string, boolean>>({});
  const [activeTabs, setActiveTabs] = useState<Record<string, 'summary' | 'transcript'>>({});

  const activeSession = student.sessions.find(
    s => s.status === 'ASSIGNED' || s.status === 'IN_SESSION'
  );
  const completedSessions = student.sessions.filter(s => s.status === 'COMPLETED' || s.status === 'CANCELLED');
  const isInSession = student.status === 'In Session';
  const isAssigned = student.status === 'Assigned';

  useEffect(() => {
    if (activeSession) {
      setNotes(activeSession.notes || '');
      setFollowUp(activeSession.followUpStatus || '');
    }
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [student, activeSession]);

  const showToast = (txt: string, t: 'success' | 'error' | 'info' = 'info') => {
    setToastMsg(txt);
    setToastType(t);
    if (t !== 'error') setTimeout(() => setToastMsg(''), 3500);
  };

  const handleStartCounselling = async () => {
    setLoading(true);
    showToast('Starting counselling session…', 'info');
    const r = await startCounsellingSession(student.id);
    if (r.success) {
      showToast('✅ Session started!', 'success');
      setTimeout(() => window.location.reload(), 1200);
    } else {
      showToast(r.error || 'Failed to start session.', 'error');
    }
    setLoading(false);
  };

  const handleSaveNotes = async () => {
    setLoading(true);
    showToast('Saving notes...', 'info');
    const r = await saveSessionNotes(student.id, notes, followUp);
    if (r.success) {
      showToast('✅ Notes saved successfully.', 'success');
      router.refresh();
    } else {
      showToast(r.error || 'Failed to save notes.', 'error');
    }
    setLoading(false);
  };

  const handleEndSession = async () => {
    if (!followUp) {
      showToast('⚠️ Please select a Follow-up Status before ending the session.', 'error');
      return;
    }
    setLoading(true);
    showToast('Ending session...', 'info');
    await saveSessionNotes(student.id, notes, followUp);
    const r = await endCounsellingSession(student.id, notes, followUp);
    if (r.success) {
      showToast('✅ Session ended successfully.', 'success');
      setTimeout(() => router.push('/walkins'), 1500);
    } else {
      showToast(r.error || 'Failed to end session.', 'error');
    }
    setLoading(false);
  };

  const handleCancelStart = async () => {
    if (!confirm('Are you sure you want to cancel the start of this counselling session? It will be returned to the Assigned state.')) {
      return;
    }
    setLoading(true);
    showToast('Cancelling session start...', 'info');
    const r = await cancelCounsellingSession(student.id);
    if (r.success) {
      showToast('✅ Session reverted successfully.', 'success');
      setTimeout(() => window.location.reload(), 1200);
    } else {
      showToast(r.error || 'Failed to cancel session.', 'error');
    }
    setLoading(false);
  };

  // Compute elapsed time for active session
  let elapsed = 0;
  if (activeSession?.startTime) {
    elapsed = Math.max(0, Math.floor((currentTime - new Date(activeSession.startTime).getTime()) / 1000));
  }

  return (
    <section className="dash-page" style={{ paddingBottom: 64 }}>
      {/* ── Toast notification ── */}
      {toastMsg && (
        <div style={{
          position: 'fixed', top: '24px', right: '24px', zIndex: 11000,
          background: toastType === 'success' ? 'rgba(16,185,129,0.97)' : toastType === 'error' ? 'rgba(239,68,68,0.97)' : 'rgba(59,130,246,0.97)',
          color: '#fff', padding: '13px 22px', borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          fontWeight: 700, fontSize: '0.88rem',
          display: 'flex', alignItems: 'center', gap: '8px',
          backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.12)',
        }}>
          {toastMsg}
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          PAGE HEADER — Identity + Controls
      ══════════════════════════════════════════════════ */}
      <div style={{
        background: 'var(--card-bg)',
        border: '1.5px solid var(--border)',
        borderRadius: '18px',
        padding: '20px 28px',
        marginBottom: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        {/* Left — Student identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div style={{
            width: 54, height: 54, borderRadius: '50%', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: '1.2rem', color: '#fff',
            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
            boxShadow: '0 4px 16px rgba(99,102,241,0.38)',
          }}>
            {getInitials(student.name)}
          </div>
          <div>
            <h1 style={{
              margin: 0, fontSize: '1.4rem', fontWeight: 800,
              color: 'var(--text)', display: 'flex', alignItems: 'center',
              gap: '10px', flexWrap: 'wrap',
            }}>
              {student.name}
              <StatusPill status={student.status} />
            </h1>
            <p style={{ margin: '5px 0 0 0', fontSize: '0.83rem', color: 'var(--muted)', display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
              <span>Record ID: <strong style={{ color: 'var(--text)' }}>#{student.id}</strong></span>
              <span style={{ color: 'var(--border)' }}>|</span>
              <span>Course: <strong style={{ color: 'var(--text)' }}>{student.course}</strong></span>
              {student.phone && (
                <>
                  <span style={{ color: 'var(--border)' }}>|</span>
                  <strong style={{ color: 'var(--text)' }}>{student.phone}</strong>
                </>
              )}
              {student.branchName && (
                <>
                  <span style={{ color: 'var(--border)' }}>|</span>
                  <span>Branch: <strong style={{ color: 'var(--text)' }}>{student.branchName}</strong></span>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Right — Action buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>

          {/* Live session timer */}
          {isInSession && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: 'rgba(245,158,11,0.08)',
              border: '1.5px solid rgba(245,158,11,0.25)',
              padding: '9px 18px', borderRadius: '12px',
            }}>
              <div style={{
                width: 8, height: 8, borderRadius: '50%',
                background: '#f59e0b', boxShadow: '0 0 8px #f59e0b',
                animation: 'pulseDot 1.4s infinite',
              }} />
              <span style={{
                fontSize: '1rem', fontWeight: 800, color: '#f59e0b',
                fontFamily: 'monospace', letterSpacing: '0.06em',
              }}>
                {formatHHMMSS(elapsed)}
              </span>
            </div>
          )}

          {/* ▶ Start Counselling — shown only for Assigned */}
          {isAssigned && (
            <button
              type="button"
              onClick={handleStartCounselling}
              disabled={loading}
              style={{
                display: 'flex', alignItems: 'center', gap: '7px',
                background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                border: 'none', borderRadius: '11px', color: '#fff',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '0.875rem', fontWeight: 700,
                padding: '0 22px', height: '42px',
                opacity: loading ? 0.6 : 1,
                boxShadow: '0 4px 16px rgba(99,102,241,0.38)',
                transition: 'opacity 0.2s, transform 0.15s, box-shadow 0.2s',
              }}
              onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(99,102,241,0.48)'; } }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(99,102,241,0.38)'; }}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15"><path d="M8 5v14l11-7z" /></svg>
              Start Counselling
            </button>
          )}

          {/* 💾 Save Notes — only In Session */}
          {isInSession && (
            <button
              type="button"
              onClick={handleSaveNotes}
              disabled={loading}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                background: 'rgba(99,102,241,0.12)',
                border: '1.5px solid rgba(99,102,241,0.3)',
                borderRadius: '11px', color: '#818cf8',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '0.875rem', fontWeight: 700,
                padding: '0 20px', height: '42px',
                opacity: loading ? 0.6 : 1,
                transition: 'background 0.2s, border-color 0.2s, color 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.22)'; e.currentTarget.style.color = '#a5b4fc'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.12)'; e.currentTarget.style.color = '#818cf8'; }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="14" height="14"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>
              Save Notes
            </button>
          )}

          {/* 🔴 End Session — only In Session */}
          {isInSession && (
            <button
              type="button"
              onClick={handleEndSession}
              disabled={loading}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
                border: 'none', borderRadius: '11px', color: '#fff',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '0.875rem', fontWeight: 700,
                padding: '0 20px', height: '42px',
                opacity: loading ? 0.6 : 1,
                boxShadow: '0 4px 14px rgba(220,38,38,0.3)',
                transition: 'opacity 0.2s, transform 0.15s',
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><rect x="6" y="6" width="12" height="12" rx="2" /></svg>
              End Session
            </button>
          )}

          {/* 🔴 Cancel Session — only In Session and for Super Admin */}
          {isInSession && user?.roleId === 'role_super_admin' && (
            <button
              type="button"
              onClick={handleCancelStart}
              disabled={loading}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1.5px solid var(--border)', borderRadius: '11px', color: '#ef4444',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '0.875rem', fontWeight: 700,
                padding: '0 20px', height: '42px',
                opacity: loading ? 0.6 : 1,
                transition: 'background 0.2s, border-color 0.2s, color 0.2s, transform 0.15s',
              }}
              onMouseEnter={e => { if (!loading) { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)'; e.currentTarget.style.borderColor = '#ef4444'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)'; e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="14" height="14" strokeLinecap="round">
                <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
              Cancel Counselling
            </button>
          )}

          {/* ← Back */}
          <button
            type="button"
            onClick={() => router.push('/walkins')}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: 'transparent',
              border: '1.5px solid var(--border)', borderRadius: '11px',
              color: 'var(--muted)', cursor: 'pointer',
              fontSize: '0.875rem', fontWeight: 600,
              padding: '0 18px', height: '42px',
              transition: 'border-color 0.2s, color 0.2s, background 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)';
              e.currentTarget.style.color = 'var(--text)';
              e.currentTarget.style.background = 'rgba(99,102,241,0.05)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.color = 'var(--muted)';
              e.currentTarget.style.background = 'transparent';
            }}
          >
            ← Back to Walk-ins
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          ACTIVE SESSION PANEL — notes + follow-up
      ══════════════════════════════════════════════════ */}
      {isInSession && (
        <div style={{
          background: 'var(--card-bg)', border: '1.5px solid rgba(245,158,11,0.22)',
          borderRadius: '16px', padding: '24px', marginBottom: '24px',
          display: 'flex', flexDirection: 'column', gap: '20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b', boxShadow: '0 0 6px #f59e0b', animation: 'pulseDot 1.4s infinite' }} />
            <h2 style={{
              margin: 0, fontSize: '0.83rem', fontWeight: 800,
              textTransform: 'uppercase', color: '#f59e0b', letterSpacing: '0.06em',
            }}>
              Active Session — Notes &amp; Follow-up
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            {/* Notes */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{
                fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.07em',
                textTransform: 'uppercase', color: 'var(--muted)',
              }}>
                Counselling Notes
              </label>
              <textarea
                style={{
                  width: '100%', height: '150px', padding: '12px 14px', borderRadius: '10px',
                  border: '1.5px solid var(--border)', background: 'var(--surface)', color: 'var(--text)',
                  fontSize: '0.875rem', fontFamily: 'inherit', lineHeight: 1.6,
                  resize: 'vertical', outline: 'none', boxSizing: 'border-box',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = 'rgba(245,158,11,0.5)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
                placeholder="Enter student background, qualifications, goals, discussion points..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
            </div>

            {/* Follow-up + Remarks */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{
                  display: 'block', fontSize: '0.7rem', fontWeight: 800,
                  letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--muted)',
                  marginBottom: '8px',
                }}>
                  Follow-up Status <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  value={followUp}
                  onChange={e => setFollowUp(e.target.value)}
                  style={{
                    width: '100%', padding: '11px 14px', borderRadius: '10px',
                    border: followUp ? '1.5px solid rgba(245,158,11,0.4)' : '1.5px solid var(--border)',
                    background: 'var(--surface)',
                    color: followUp ? 'var(--text)' : 'var(--muted)',
                    fontSize: '0.88rem', fontFamily: 'inherit', fontWeight: 600,
                    cursor: 'pointer', outline: 'none', boxSizing: 'border-box',
                  }}
                >
                  <option value="">— Select Follow-up Status —</option>
                  {FOLLOWUP_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                {!followUp && (
                  <p style={{ margin: '6px 0 0 2px', fontSize: '0.75rem', color: '#f59e0b', fontWeight: 600 }}>
                    ⚠ Required before ending session
                  </p>
                )}
              </div>

              <div>
                <span style={{
                  fontSize: '0.7rem', color: 'var(--muted)', display: 'block',
                  textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.04em', marginBottom: '8px'
                }}>
                  Intake Remarks
                </span>
                <p style={{
                  margin: 0, fontSize: '0.86rem', color: student.remarks ? 'var(--text)' : 'var(--muted)',
                  background: 'var(--surface)', padding: '12px 14px', fontStyle: student.remarks ? 'normal' : 'italic',
                  borderRadius: '10px', border: '1.5px solid var(--border)', lineHeight: 1.6, boxSizing: 'border-box',
                }}>
                  {student.remarks || 'No remarks added at registration.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          STUDENT SUBMISSION RECORD SHEET
      ══════════════════════════════════════════════════ */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: 3, height: 22, borderRadius: 2, background: 'var(--primary)', flexShrink: 0 }} />
          <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--text)' }}>
            Student Submission Record Sheet
          </h2>
        </div>
        <StudentDetailsRecord
          student={student}
          counselors={counselors}
          onClose={() => router.push('/walkins')}
          hideHistory={true}
        />
      </div>

      {/* ══════════════════════════════════════════════════
          COUNSELLOR SESSION HISTORY — at the bottom
      ══════════════════════════════════════════════════ */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* Section header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: 3, height: 22, borderRadius: 2, background: '#6366f1', flexShrink: 0 }} />
          <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--text)' }}>
            Counsellor Session History
          </h2>
          <span style={{
            marginLeft: 6, background: 'rgba(99,102,241,0.12)', color: '#818cf8',
            border: '1px solid rgba(99,102,241,0.25)', borderRadius: 999,
            fontSize: '0.72rem', fontWeight: 800, padding: '2px 10px',
            letterSpacing: '0.04em',
          }}>
            {student.sessions.length} session{student.sessions.length !== 1 ? 's' : ''}
          </span>
        </div>

        {student.sessions.length === 0 ? (
          <div style={{
            background: 'var(--card-bg)', border: '1.5px solid var(--border)',
            borderRadius: '14px', padding: '32px',
            textAlign: 'center', color: 'var(--muted)', fontSize: '0.9rem',
          }}>
            No counselling sessions have been recorded yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[...student.sessions].reverse().map((sess, idx) => {
              const counselor = counselors.find(c => c.id === sess.counselorId);
              const isActive = sess.status === 'IN_SESSION' || sess.status === 'ASSIGNED';
              const liveElapsed = isActive && sess.startTime
                ? Math.max(0, Math.floor((currentTime - new Date(sess.startTime).getTime()) / 1000))
                : null;

              return (
                <div key={sess.id} style={{
                  background: 'var(--card-bg)',
                  border: isActive ? '1.5px solid rgba(245,158,11,0.3)' : '1.5px solid var(--border)',
                  borderRadius: '14px',
                  overflow: 'hidden',
                  boxShadow: isActive ? '0 0 0 3px rgba(245,158,11,0.06)' : 'none',
                }}>
                  {/* Session card header */}
                  <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '16px 22px',
                    background: isActive ? 'rgba(245,158,11,0.04)' : 'rgba(255,255,255,0.01)',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    flexWrap: 'wrap', gap: '10px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      {/* Counsellor avatar */}
                      <div style={{
                        width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 800, fontSize: '0.85rem', color: '#fff',
                        background: isActive
                          ? 'linear-gradient(135deg, #f59e0b, #f97316)'
                          : 'linear-gradient(135deg, #4f46e5, #6366f1)',
                        boxShadow: isActive
                          ? '0 3px 10px rgba(245,158,11,0.3)'
                          : '0 3px 10px rgba(79,70,229,0.25)',
                      }}>
                        {counselor ? getInitials(counselor.name) : '?'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {counselor?.name || 'Unknown Counsellor'}
                          <SessionStatusPill status={sess.status} />
                          {isActive && liveElapsed !== null && (
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', gap: 5,
                              background: 'rgba(245,158,11,0.1)', color: '#f59e0b',
                              border: '1px solid rgba(245,158,11,0.2)',
                              borderRadius: 999, padding: '2px 10px',
                              fontSize: '0.72rem', fontWeight: 800, fontFamily: 'monospace',
                            }}>
                              <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#f59e0b', animation: 'pulseDot 1.4s infinite', display: 'inline-block' }} />
                              {formatHHMMSS(liveElapsed)}
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: '2px' }}>
                          {counselor?.branchName || '—'} &nbsp;·&nbsp; Session ID: <code style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>#{sess.id.slice(-8).toUpperCase()}</code>
                        </div>
                      </div>
                    </div>

                    {/* Duration badge */}
                    <div style={{
                      background: sess.status === 'COMPLETED'
                        ? 'rgba(16,185,129,0.1)' : 'rgba(100,116,139,0.1)',
                      border: `1px solid ${sess.status === 'COMPLETED' ? 'rgba(16,185,129,0.2)' : 'rgba(100,116,139,0.15)'}`,
                      color: sess.status === 'COMPLETED' ? '#10b981' : 'var(--muted)',
                      borderRadius: '10px', padding: '6px 16px',
                      fontSize: '0.8rem', fontWeight: 800, textAlign: 'center', whiteSpace: 'nowrap',
                    }}>
                      <div style={{ fontSize: '0.66rem', letterSpacing: '0.05em', textTransform: 'uppercase', opacity: 0.7 }}>Duration</div>
                      <div style={{ marginTop: 2 }}>
                        {isActive && liveElapsed !== null ? formatHHMMSS(liveElapsed) : formatDuration(sess.duration)}
                      </div>
                    </div>
                  </div>

                  {/* Session details grid */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))',
                    gap: '0',
                  }}>
                    {[
                      {
                        icon: '📅',
                        label: 'Started At',
                        value: formatDateTime(sess.startTime),
                      },
                      {
                        icon: '🏁',
                        label: 'Ended At',
                        value: sess.endTime ? formatDateTime(sess.endTime) : (isActive ? 'In Progress…' : '—'),
                        highlight: isActive,
                      },
                      {
                        icon: '🏢',
                        label: 'Branch',
                        value: counselor?.branchName || '—',
                      },
                      {
                        icon: '🔄',
                        label: 'Follow-up Status',
                        value: sess.followUpStatus || '—',
                      },
                    ].map((item, i) => (
                      <div key={i} style={{
                        padding: '14px 20px',
                        borderRight: i < 3 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                        borderBottom: '1px solid rgba(255,255,255,0.04)',
                      }}>
                        <div style={{ fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '5px' }}>
                          {item.icon} {item.label}
                        </div>
                        <div style={{
                          fontSize: '0.86rem', fontWeight: 700,
                          color: item.highlight ? '#f59e0b' : 'var(--text)',
                        }}>
                          {item.value}
                        </div>
                      </div>
                    ))}

                    {/* Notes — full width */}
                    {sess.notes && (
                      <div style={{
                        gridColumn: '1 / -1',
                        padding: '14px 20px',
                        borderTop: '1px solid rgba(255,255,255,0.04)',
                        background: 'rgba(255,255,255,0.01)',
                      }}>
                        <div style={{ fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '6px' }}>
                          📝 Session Notes
                        </div>
                        <p style={{
                          margin: 0, fontSize: '0.86rem', color: 'var(--text)',
                          lineHeight: 1.65, whiteSpace: 'pre-wrap',
                        }}>
                          {sess.notes}
                        </p>
                      </div>
                    )}

                    {/* Audio Recording — full width */}
                    {sess.audioUrl && (
                      <div style={{
                        gridColumn: '1 / -1',
                        padding: '16px 20px',
                        borderTop: '1px solid rgba(255,255,255,0.04)',
                        background: 'linear-gradient(135deg, rgba(99,102,241,0.04) 0%, rgba(16,185,129,0.02) 100%)',
                        borderBottom: '1px solid rgba(255,255,255,0.04)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '16px',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{
                            fontSize: '1.2rem',
                            background: 'rgba(99,102,241,0.08)',
                            padding: '8px',
                            borderRadius: '10px',
                            border: '1px solid rgba(99,102,241,0.15)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>🎙️</span>
                          <div>
                            <div style={{ fontSize: '0.76rem', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--primary)' }}>
                              SESSION RECORDING
                            </div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--muted)', marginTop: '2px' }}>
                              Recorded audio from this counseling session
                            </div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                          <AudioPlayerWithAnalyzer src={sess.audioUrl} />
                          
                          {(!sess.transcript || !sess.summary) && (
                            <button
                              type="button"
                              disabled={loading}
                              onClick={async () => {
                                setLoading(true);
                                showToast('🪄 Analyzing audio & generating AI summary...', 'info');
                                const r = await analyzeSessionAudio(sess.id);
                                if (r.success) {
                                  showToast('✅ Session analyzed successfully!', 'success');
                                  setTimeout(() => window.location.reload(), 1500);
                                } else {
                                  showToast(r.error || 'Failed to analyze recording.', 'error');
                                }
                                setLoading(false);
                              }}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '8px 16px',
                                borderRadius: '20px',
                                background: 'linear-gradient(135deg, #a855f7, #6366f1)',
                                color: '#fff',
                                fontSize: '0.78rem',
                                fontWeight: 800,
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                boxShadow: '0 4px 12px rgba(168,85,247,0.3)',
                                opacity: loading ? 0.6 : 1,
                                pointerEvents: loading ? 'none' : 'auto',
                              }}
                              onMouseEnter={e => {
                                e.currentTarget.style.transform = 'translateY(-1px)';
                                e.currentTarget.style.boxShadow = '0 6px 16px rgba(168,85,247,0.45)';
                              }}
                              onMouseLeave={e => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(168,85,247,0.3)';
                              }}
                            >
                              🪄 {loading ? 'Analyzing...' : 'Analyze & Transcribe'}
                            </button>
                          )}

                          {(sess.transcript || sess.summary) && (
                            <button
                              type="button"
                              onClick={() => {
                                setShowDetails(prev => ({ ...prev, [sess.id]: !prev[sess.id] }));
                                if (!activeTabs[sess.id]) {
                                  setActiveTabs(prev => ({ ...prev, [sess.id]: sess.summary ? 'summary' : 'transcript' }));
                                }
                              }}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '8px 16px',
                                borderRadius: '20px',
                                background: showDetails[sess.id] ? 'linear-gradient(135deg, #4f46e5, #6366f1)' : 'rgba(99,102,241,0.06)',
                                color: showDetails[sess.id] ? '#fff' : '#818cf8',
                                fontSize: '0.78rem',
                                fontWeight: 800,
                                border: '1px solid rgba(99,102,241,0.25)',
                                cursor: 'pointer',
                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                boxShadow: showDetails[sess.id] ? '0 4px 12px rgba(99,102,241,0.3)' : 'none'
                              }}
                              onMouseEnter={e => {
                                e.currentTarget.style.transform = 'translateY(-1px)';
                              }}
                              onMouseLeave={e => {
                                e.currentTarget.style.transform = 'translateY(0)';
                              }}
                            >
                              📋 {showDetails[sess.id] ? 'Hide Analysis' : 'Show Analysis'}
                            </button>
                          )}

                          <a
                            href={sess.audioUrl}
                            download={`session-${sess.id}.webm`}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '8px 16px',
                              borderRadius: '20px',
                              background: 'rgba(255,255,255,0.03)',
                              color: 'var(--text)',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              textDecoration: 'none',
                              border: '1px solid var(--border)',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.background = 'var(--text)';
                              e.currentTarget.style.color = 'var(--card-bg)';
                              e.currentTarget.style.transform = 'translateY(-1px)';
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                              e.currentTarget.style.color = 'var(--text)';
                              e.currentTarget.style.transform = 'translateY(0)';
                            }}
                          >
                            <svg viewBox="0 0 16 16" fill="currentColor" width="13" height="13">
                              <path d="M8 12l-4-4h2.5V3h3v5H12L8 12zM3 14h10v-1.5H3V14z" />
                            </svg>
                            Download
                          </a>
                        </div>
                      </div>
                    )}

                    {/* Unified Analysis Details Panel — full width */}
                    {(sess.transcript || sess.summary) && showDetails[sess.id] && (
                      <div style={{
                        gridColumn: '1 / -1',
                        padding: '24px',
                        borderTop: '1px solid var(--border)',
                        background: 'rgba(255, 255, 255, 0.015)',
                        borderBottom: '1px solid var(--border)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '16px'
                      }}>
                        {/* Tab Bar */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                          paddingBottom: '12px'
                        }}>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            {sess.summary && (
                              <button
                                type="button"
                                onClick={() => setActiveTabs(prev => ({ ...prev, [sess.id]: 'summary' }))}
                                style={{
                                  background: (activeTabs[sess.id] || 'summary') === 'summary'
                                    ? 'rgba(16,185,129,0.12)'
                                    : 'transparent',
                                  color: (activeTabs[sess.id] || 'summary') === 'summary'
                                    ? '#10b981'
                                    : 'var(--muted)',
                                  border: 'none',
                                  borderRadius: '6px',
                                  padding: '6px 14px',
                                  fontSize: '0.8rem',
                                  fontWeight: 800,
                                  cursor: 'pointer',
                                  transition: 'all 0.2s',
                                }}
                              >
                                🪄 Summary
                              </button>
                            )}
                            {sess.transcript && (
                              <button
                                type="button"
                                onClick={() => setActiveTabs(prev => ({ ...prev, [sess.id]: 'transcript' }))}
                                style={{
                                  background: (activeTabs[sess.id] || 'summary') === 'transcript'
                                    ? 'rgba(99,102,241,0.12)'
                                    : 'transparent',
                                  color: (activeTabs[sess.id] || 'summary') === 'transcript'
                                    ? '#818cf8'
                                    : 'var(--muted)',
                                  border: 'none',
                                  borderRadius: '6px',
                                  padding: '6px 14px',
                                  fontSize: '0.8rem',
                                  fontWeight: 800,
                                  cursor: 'pointer',
                                  transition: 'all 0.2s',
                                }}
                              >
                                🎙️ Transcript
                              </button>
                            )}
                          </div>
                          
                          <button
                            type="button"
                            onClick={() => setShowDetails(prev => ({ ...prev, [sess.id]: false }))}
                            style={{
                              background: 'rgba(239, 68, 68, 0.06)',
                              border: '1px solid rgba(239, 68, 68, 0.15)',
                              color: '#ef4444',
                              cursor: 'pointer',
                              fontSize: '0.72rem',
                              fontWeight: 800,
                              padding: '4px 10px',
                              borderRadius: '6px',
                              transition: 'all 0.15s ease'
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = '#fff'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.06)'; e.currentTarget.style.color = '#ef4444'; }}
                          >
                            ✕ Close
                          </button>
                        </div>

                        {/* Content Area */}
                        <div>
                          {(activeTabs[sess.id] || 'summary') === 'summary' && sess.summary && (
                            <div>
                              <div style={{ fontSize: '0.74rem', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#10b981', marginBottom: '12px' }}>
                                🪄 Audio Session Summary
                              </div>
                              {renderSummary(sess.summary)}
                            </div>
                          )}
                          {(activeTabs[sess.id] || 'summary') === 'transcript' && sess.transcript && (
                            <div>
                              <div style={{ fontSize: '0.74rem', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#818cf8', marginBottom: '12px' }}>
                                🎙️ Session Transcript
                              </div>
                              <p style={{
                                margin: 0, fontSize: '0.86rem', color: 'var(--text)',
                                lineHeight: 1.65, whiteSpace: 'pre-wrap',
                                background: 'rgba(0,0,0,0.15)', padding: '14px', borderRadius: '10px',
                                border: '1px solid var(--border)'
                              }}>
                                {sess.transcript}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
