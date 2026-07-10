'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { SessionUser } from '../../lib/auth';
import { startCounsellingSession, endCounsellingSession, saveSessionNotes, updateStudentDetails, cancelCounsellingSession } from '../../actions/walkinActions';

import StudentDetailsRecord from '../../components/StudentDetailsRecord';

interface Session {
  id: string; studentId: string; counselorId: string;
  startTime: Date | string | null; endTime: Date | string | null;
  duration: number | null; status: string; notes: string | null; followUpStatus: string | null;
  audioUrl?: string | null;
  transcript?: string | null;
  summary?: string | null;
}
interface Student {
  id: string; name: string; phone: string; course: string; branchName?: string;
  walkinDate: Date | string; status: string; remarks: string | null;
  source: string; details: any; sessions: Session[];
}
interface Counselor { id: string; name: string; branchId: string; branchName: string; }

const FOLLOWUP_OPTIONS = [
  { value: 'No Follow-up',       label: 'No Follow-up (Direct Admission)' },
  { value: 'Follow-up Required', label: 'Follow-up Required' },
  { value: 'Ready to Enroll',    label: 'Ready to Enroll' },
  { value: 'Not Interested',     label: 'Not Interested' },
  { value: 'Callback Scheduled', label: 'Callback Scheduled' },
];

function CustomDropdown({ value, onChange, isOpen, onToggle, onClose, disabled }: {
  value: string;
  onChange: (v: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  disabled?: boolean;
}) {
  const options = FOLLOWUP_OPTIONS;
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef   = useRef<HTMLDivElement>(null);
  const selected   = options.find(o => o.value === value);

  useEffect(() => {
    if (!isOpen) return;
    const fn = (e: MouseEvent) => {
      const t = e.target as Node;
      if (
        panelRef.current && !panelRef.current.contains(t) &&
        triggerRef.current && !triggerRef.current.contains(t)
      ) {
        onClose();
      }
    };
    document.addEventListener('mousedown', fn);
    return () => {
      document.removeEventListener('mousedown', fn);
    };
  }, [isOpen, onClose]);

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {/* ── Trigger ── */}
      <button
        ref={triggerRef}
        type="button"
        onClick={disabled ? undefined : onToggle}
        disabled={disabled}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 10, padding: '11px 14px', minHeight: 44,
          borderRadius: 10,
          border: isOpen ? '1.5px solid var(--primary)' : '1.5px solid var(--border)',
          background: isOpen ? 'var(--surface-alt)' : 'var(--surface)',
          color: 'var(--text)',
          fontSize: '0.88rem', fontFamily: 'inherit', fontWeight: 500,
          cursor: disabled ? 'not-allowed' : 'pointer', outline: 'none', textAlign: 'left',
          boxShadow: isOpen ? '0 0 0 3px var(--primary-glow)' : 'none',
          transition: 'border-color 0.18s, box-shadow 0.18s',
          opacity: disabled ? 0.6 : 1,
        }}
      >
        <span style={{
          flex: 1,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          color: selected ? 'var(--text)' : 'var(--muted)',
        }}>
          {selected ? selected.label : 'Select Follow-up Status'}
        </span>
        <svg viewBox="0 0 12 8" fill="none" width="11" height="11"
          style={{ flexShrink: 0, opacity: 0.5, transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          <path d="M1 1l5 5 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* ── Panel ── */}
      {isOpen && (
        <div
          ref={panelRef}
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            width: '100%',
            marginTop: 6,
            zIndex: 9999,
            background: 'var(--surface)',
            border: '1.5px solid var(--border)',
            borderRadius: 12,
            overflow: 'hidden',
            boxShadow: '0 16px 48px rgba(0,0,0,0.2), 0 4px 12px rgba(0,0,0,0.1)',
            animation: 'ddIn 0.16s cubic-bezier(0.4,0,0.2,1)',
          }}
        >
          <div style={{ padding: '5px 5px' }}>
            {options.map(opt => {
              const isSel = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => { onChange(opt.value); onToggle(); }}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    gap: 10, padding: '10px 12px', border: 'none', borderRadius: 8,
                    background: isSel ? 'var(--primary-glow)' : 'transparent',
                    color: isSel ? 'var(--primary)' : 'var(--text)',
                    fontSize: '0.875rem', fontFamily: 'inherit', fontWeight: isSel ? 700 : 400,
                    cursor: 'pointer', textAlign: 'left',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={e => { if (!isSel)(e.currentTarget as HTMLElement).style.background = 'rgba(99,102,241,0.07)'; }}
                  onMouseLeave={e => { if (!isSel)(e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                >
                  <span>{opt.label}</span>
                  {isSel && (
                    <svg viewBox="0 0 16 16" fill="none" width="13" height="13">
                      <path d="M3 8l4 4 6-7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function getInitials(name: string) {
  if (!name) return '';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function StatusPill({ status }: { status: string }) {
  const C: Record<string, { bg: string; color: string; border: string; dot?: string }> = {
    'Assigned':   { bg: 'rgba(99,102,241,0.12)',  color: '#6366f1', border: 'rgba(99,102,241,0.25)', dot: '#6366f1' },
    'In Session': { bg: 'rgba(245,158,11,0.12)',  color: '#f59e0b', border: 'rgba(245,158,11,0.28)', dot: '#f59e0b' },
    'Completed':  { bg: 'rgba(16,185,129,0.12)',  color: '#10b981', border: 'rgba(16,185,129,0.25)', dot: '#10b981' },
    'Waiting':    { bg: 'rgba(59,130,246,0.12)',  color: '#3b82f6', border: 'rgba(59,130,246,0.25)', dot: '#3b82f6' },
  };
  const c = C[status] || { bg: 'rgba(100,116,139,0.1)', color: '#64748b', border: 'rgba(100,116,139,0.2)' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '5px 12px', borderRadius: 999,
      fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.06em',
      textTransform: 'uppercase', whiteSpace: 'nowrap', flexShrink: 0,
      background: c.bg, color: c.color, border: `1.5px solid ${c.border}`,
    }}>
      {c.dot && <span style={{
        width: 6, height: 6, borderRadius: '50%', background: c.dot,
        display: 'inline-block', boxShadow: `0 0 5px ${c.dot}`,
        animation: status === 'In Session' ? 'pulseDot 1.4s ease-in-out infinite' : undefined,
      }}/>}
      {status}
    </span>
  );
}

function formatHHMMSS(s: number) {
  if (isNaN(s) || s < 0) return '00:00:00';
  return [Math.floor(s / 3600), Math.floor((s % 3600) / 60), Math.floor(s % 60)]
    .map(n => String(n).padStart(2, '0')).join(':');
}

interface SessionsClientProps {
  initialWalkins: Student[]; counselors: Counselor[]; user: SessionUser | null;
}

export default function SessionsClient({ initialWalkins, counselors, user }: SessionsClientProps) {
  const router = useRouter();
  const [walkins]           = useState<Student[]>(initialWalkins);
  const [currentTime, setCurrentTime]   = useState<number>(Date.now());
  const [message, setMessage]           = useState('');
  const [msgType, setMsgType]           = useState<'success'|'error'|'info'>('info');
  const [loading, setLoading]           = useState(false);
  const [loadingId, setLoadingId]       = useState<string|null>(null);
  const [sessionNotes, setSessionNotes] = useState<Record<string,string>>({});
  const [followUpStatus, setFollowUpStatus] = useState<Record<string,string>>({});
  const [openDropId, setOpenDropId]     = useState<string|null>(null);  // tracks which card's dropdown is open
  const [activeCounsellingStudent, setActiveCounsellingStudent] = useState<Student | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedDetailsStudent, setSelectedDetailsStudent] = useState<Student | null>(null);

  useEffect(() => {
    const no: Record<string,string> = {}, fo: Record<string,string> = {};
    initialWalkins.forEach(w => {
      const s = w.sessions.find(s => s.status !== 'CANCELLED' && s.status !== 'COMPLETED');
      no[w.id] = s?.notes || '';
      fo[w.id] = s?.followUpStatus || '';
    });
    setSessionNotes(no); setFollowUpStatus(fo);
    const t1 = setInterval(() => setCurrentTime(Date.now()), 1000);
    const t2 = setInterval(() => router.refresh(), 15000);
    return () => { clearInterval(t1); clearInterval(t2); };
  }, [initialWalkins, router]);

  const showMsg = (txt: string, t: 'success'|'error'|'info' = 'info') => {
    setMessage(txt); setMsgType(t);
    if (t !== 'error') setTimeout(() => setMessage(''), 3500);
  };

  const handleStart = async (id: string) => {
    setLoading(true); setLoadingId(id); showMsg('Starting session…', 'info');
    const r = await startCounsellingSession(id);
    r.success ? (showMsg('✅ Session started!', 'success'), router.refresh(), window.location.reload())
              : showMsg(r.error || 'Failed.', 'error');
    setLoading(false); setLoadingId(null);
  };

  const handleOpenAndStartWorkspace = async (student: Student) => {
    setLoading(true);
    setLoadingId(student.id);
    showMsg('Starting session…', 'info');
    const r = await startCounsellingSession(student.id);
    if (r.success) {
      showMsg('✅ Session started!', 'success');
      router.refresh();
      router.push(`/sessions/workspace?studentId=${student.id}`);
    } else {
      showMsg(r.error || 'Failed to start session.', 'error');
    }
    setLoading(false);
    setLoadingId(null);
  };
  const handleSave = async (id: string) => {
    setLoading(true); setLoadingId(id); showMsg('Saving notes…', 'info');
    const r = await saveSessionNotes(id, sessionNotes[id]||'', followUpStatus[id]||'');
    r.success ? showMsg('✅ Notes saved.', 'success') : showMsg(r.error||'Failed.', 'error');
    setLoading(false); setLoadingId(null);
  };
  const handleEnd = async (id: string) => {
    const status = followUpStatus[id];
    if (!status || status === '') {
      showMsg('⚠️ Please select a Follow-up Status before ending the session.', 'error');
      return;
    }
    setLoading(true); setLoadingId(id); showMsg('Ending session…', 'info');
    await saveSessionNotes(id, sessionNotes[id]||'', status);
    const r = await endCounsellingSession(id, sessionNotes[id]||'', status);
    r.success ? (showMsg('✅ Session ended.', 'success'), router.refresh(), window.location.reload())
              : showMsg(r.error||'Failed.', 'error');
    setLoading(false); setLoadingId(null);
  };

  const handleCancelStart = async (id: string) => {
    if (!confirm('Are you sure you want to cancel the start of this counselling session? It will be returned to the Assigned state.')) {
      return;
    }
    setLoading(true); setLoadingId(id); showMsg('Cancelling session start…', 'info');
    const r = await cancelCounsellingSession(id);
    r.success ? (showMsg('✅ Session reverted to ready status!', 'success'), router.refresh(), window.location.reload())
              : showMsg(r.error || 'Failed to cancel session.', 'error');
    setLoading(false); setLoadingId(null);
  };

  const isCounselor = user?.roleId === 'role_counselor';
  const myId = isCounselor ? user?.id : null;
  const active = walkins.filter(w =>
    (w.status === 'Assigned' || w.status === 'In Session') &&
    (myId ? w.sessions.some(s => s.counselorId === myId && s.status !== 'COMPLETED' && s.status !== 'CANCELLED') : true)
  );
  const inSessionCount = active.filter(w => w.status === 'In Session').length;
  const assignedCount  = active.filter(w => w.status === 'Assigned').length;

  return (
    <>
      <style>{`
        @keyframes pulseDot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(1.6)} }
        @keyframes fadeUp   { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes ddIn     { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin     { to{transform:rotate(360deg)} }

        /* ── Card ── */
        .sc-card {
          background: var(--card-bg);
          border: 1.5px solid var(--border);
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          /* NO overflow:hidden — lets dropdown escape */
          /* NO transform — avoids stacking context trapping dropdown */
          box-shadow: 0 2px 16px rgba(0,0,0,.07);
          transition: box-shadow .25s, border-color .25s;
          animation: fadeUp .3s ease both;
          position: relative;      /* needed for z-index to work */
          z-index: 1;
        }
        .sc-card:hover {
          border-color: rgba(99,102,241,.3);
          box-shadow: 0 8px 32px rgba(99,102,241,.1);
          /* only box-shadow lift, NO transform — keeps stacking clean */
        }
        .sc-card.is-session { border-color: rgba(245,158,11,.25); }
        .sc-card.is-session:hover { border-color: rgba(245,158,11,.45); box-shadow: 0 8px 32px rgba(245,158,11,.1); }
        .sc-card.dd-open { z-index: 100; }  /* lift card above siblings when dropdown is open */

        /* ── Card header ── */
        .sc-head {
          padding: 16px 18px;
          display: flex; align-items: flex-start; justify-content: space-between; gap: 12px;
          border-bottom: 1.5px solid var(--border);
          border-radius: 15px 15px 0 0;
        }
        .sc-head.h-assigned { background: linear-gradient(135deg,rgba(99,102,241,.06),rgba(168,85,247,.03)); }
        .sc-head.h-session  { background: linear-gradient(135deg,rgba(245,158,11,.07),rgba(251,191,36,.03)); }

        /* ── Avatar ── */
        .sc-av { width:42px; height:42px; border-radius:50%; flex-shrink:0; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:.88rem; color:#fff; }
        .sc-av.indigo { background:linear-gradient(135deg,#6366f1,#a855f7); box-shadow:0 3px 10px rgba(99,102,241,.3); }
        .sc-av.amber  { background:linear-gradient(135deg,#f59e0b,#fbbf24); box-shadow:0 3px 10px rgba(245,158,11,.3); }

        /* ── Info chips ── */
        .sc-chip {
          display:inline-flex; align-items:center; gap:5px; padding:5px 10px;
          border-radius:8px; font-size:.76rem; font-weight:600;
          background:var(--surface); border:1.5px solid var(--border); color:var(--muted);
          overflow:hidden; min-width:0;
        }
        .sc-chip span { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }

        /* ── Live timer ── */
        .sc-timer {
          display:flex; align-items:center; justify-content:space-between;
          padding:12px 16px; border-radius:12px;
          background:rgba(245,158,11,.07); border:1.5px solid rgba(245,158,11,.2);
        }
        .sc-timer-val {
          font-family:'JetBrains Mono','Fira Code',monospace;
          font-size:1.5rem; font-weight:800; letter-spacing:.1em;
          color:#f59e0b; text-shadow:0 0 16px rgba(245,158,11,.35);
        }

        /* ── Textarea ── */
        .sc-notes {
          width:100%; height:90px;
          padding:10px 12px; border-radius:10px;
          border:1.5px solid var(--border);
          background:var(--surface); color:var(--text);
          font-size:.875rem; font-family:inherit; line-height:1.6;
          resize:none; outline:none;
          transition:border-color .18s,box-shadow .18s;
        }
        .sc-notes:focus { border-color:var(--primary); box-shadow:0 0 0 3px var(--primary-glow); }
        .sc-notes:disabled { opacity:.45; cursor:not-allowed; }
        .sc-notes::placeholder { color:var(--muted); }

        /* ── Label ── */
        .sc-label { display:block; margin-bottom:6px; font-size:.7rem; font-weight:800; letter-spacing:.07em; text-transform:uppercase; color:var(--muted); }

        /* ── Footer ── */
        .sc-footer { padding:14px 18px; border-top:1.5px solid var(--border); background:var(--surface); border-radius:0 0 15px 15px; }

        /* ── START button ── */
        .sc-btn-start {
          width:100%; padding:13px 18px; border-radius:10px;
          font-size:.9rem; font-weight:700; letter-spacing:.02em;
          border:none; cursor:pointer;
          display:flex; align-items:center; justify-content:center; gap:8px;
          background:linear-gradient(135deg,#6366f1,#a855f7);
          color:#fff; box-shadow:0 4px 14px rgba(99,102,241,.3);
          transition:all .22s ease;
        }
        .sc-btn-start:hover:not(:disabled) { box-shadow:0 8px 24px rgba(99,102,241,.44); filter:brightness(1.06); }
        .sc-btn-start:disabled { opacity:.5; cursor:not-allowed; box-shadow:none; }

        /* ── SAVE NOTES button — solid indigo ── */
        .sc-btn-save {
          flex:1; padding:12px 16px; border-radius:10px;
          font-size:.86rem; font-weight:700;
          display:flex; align-items:center; justify-content:center; gap:7px;
          cursor:pointer; transition:all .18s ease;
          border:none;
          background:linear-gradient(135deg,#4f46e5,#6366f1);
          color:#fff;
          box-shadow:0 3px 12px rgba(79,70,229,.28);
        }
        .sc-btn-save:hover:not(:disabled) { box-shadow:0 6px 20px rgba(79,70,229,.4); filter:brightness(1.07); }
        .sc-btn-save:disabled { opacity:.5; cursor:not-allowed; box-shadow:none; }

        /* ── END SESSION button — solid red ── */
        .sc-btn-end {
          flex:1; padding:12px 16px; border-radius:10px;
          font-size:.86rem; font-weight:700;
          display:flex; align-items:center; justify-content:center; gap:7px;
          cursor:pointer; transition:all .18s ease;
          border:none;
          background:linear-gradient(135deg,#dc2626,#ef4444);
          color:#fff;
          box-shadow:0 3px 12px rgba(220,38,38,.28);
        }
        .sc-btn-end:hover:not(:disabled) { box-shadow:0 6px 20px rgba(220,38,38,.4); filter:brightness(1.07); }
        .sc-btn-end:disabled { opacity:.5; cursor:not-allowed; box-shadow:none; }

        /* ── CANCEL SESSION button ── */
        .sc-btn-cancel {
          width: 100%; padding:11px 16px; border-radius:10px;
          font-size:.86rem; font-weight:700;
          display:flex; align-items:center; justify-content:center; gap:7px;
          cursor:pointer; transition:all .18s ease;
          border:1.5px solid var(--border);
          background:rgba(239,68,68,0.08);
          color:#ef4444;
        }
        .sc-btn-cancel:hover:not(:disabled) { background:rgba(239,68,68,0.15); border-color:#ef4444; box-shadow:0 4px 12px rgba(239,68,68,0.15); }
        .sc-btn-cancel:disabled { opacity:.5; cursor:not-allowed; box-shadow:none; }

        /* ── Toast ── */
        .sc-toast { padding:11px 18px; border-radius:10px; font-size:.88rem; font-weight:600; display:flex; align-items:center; gap:8px; animation:fadeUp .25s ease; }
        .sc-toast-success { background:rgba(16,185,129,.1); border:1.5px solid rgba(16,185,129,.22); color:#059669; }
        .sc-toast-error   { background:rgba(239,68,68,.1);  border:1.5px solid rgba(239,68,68,.22);  color:#dc2626; }
        .sc-toast-info    { background:rgba(99,102,241,.08); border:1.5px solid rgba(99,102,241,.18); color:#4f46e5; }



        /* ── Empty state ── */
        .sc-empty {
          background:var(--card-bg); border:1.5px solid var(--border); border-radius:18px;
          padding:72px 36px; text-align:center;
        }
      `}</style>

      <section className="dash-page">

        {/* ── Page Header ── */}
        <div className="page-title-row">
          <div>
            <h1 className="page-title">Sessions Tracking</h1>
            <p className="small-text">
              Start, monitor, and record counselling notes with live timers.
            </p>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
            {inSessionCount > 0 && (
              <div className="sc-stat sc-stat-session">
                <span style={{ width:7, height:7, borderRadius:'50%', background:'#f59e0b', boxShadow:'0 0 6px #f59e0b', animation:'pulseDot 1.4s infinite', display:'inline-block' }}/>
                {inSessionCount} In Session
              </div>
            )}
            {assignedCount > 0 && (
              <div className="sc-stat sc-stat-assigned">
                <span style={{ width:7, height:7, borderRadius:'50%', background:'#6366f1', display:'inline-block' }}/>
                {assignedCount} Assigned
              </div>
            )}
            <button type="button" className="sc-refresh" onClick={() => window.location.reload()} disabled={loading}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="14" height="14" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
              </svg>
              Refresh
            </button>
          </div>
        </div>

        {/* ── Toast ── */}
        {message && <div className={`sc-toast sc-toast-${msgType}`} style={{ marginBottom:20 }}>{message}</div>}

        {/* ── Cards Grid ── */}
        {active.length > 0 ? (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(340px,1fr))', gap:20, alignItems:'start' }}>
            {active.map((student, idx) => {
              const ses = student.sessions.find(s => s.status === 'ASSIGNED' || s.status === 'IN_SESSION');
              const counselorName = counselors.find(c => c.id === ses?.counselorId)?.name || 'Unassigned';
              const branchName    = student.branchName || counselors.find(c => c.id === ses?.counselorId)?.branchName || 'N/A';
              const isInSes  = student.status === 'In Session';
              const isBusy   = loadingId === student.id && loading;
              const isDropOpen = openDropId === student.id;
              let elapsed = 0;
              if (ses?.startTime) elapsed = Math.max(0, Math.floor((currentTime - new Date(ses.startTime).getTime()) / 1000));

              return (
                <div
                  key={student.id}
                  className={[
                    'sc-card',
                    isInSes ? 'is-session' : '',
                    isDropOpen ? 'dd-open' : '',
                  ].join(' ')}
                  style={{ animationDelay: `${idx * 0.05}s` }}
                >
                  {/* ── Header ── */}
                  <div className={`sc-head ${isInSes ? 'h-session' : 'h-assigned'}`}>
                    <div style={{ display:'flex', alignItems:'center', gap:12, flex:1, minWidth:0 }}>
                      <div className={`sc-av ${isInSes ? 'amber' : 'indigo'}`}>{getInitials(student.name)}</div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                          <div style={{ fontWeight:800, fontSize:'1.1rem', color:'var(--text)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                            {student.name}
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedDetailsStudent(student);
                              setShowDetailsModal(true);
                            }}
                            style={{
                              background: 'none', border: 'none', cursor: 'pointer', padding: 2, display: 'inline-flex',
                              alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', transition: 'color 0.2s',
                              outline: 'none',
                            }}
                            onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'}
                            onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}
                            title="View student profile details"
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="14" height="14" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
                            </svg>
                          </button>
                        </div>
                        <div style={{ fontSize:'.82rem', color:'var(--muted)', marginTop:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                          {student.course}
                        </div>
                      </div>
                    </div>
                    <StatusPill status={student.status} />
                  </div>

                  {/* ── Body ── */}
                  <div style={{ padding:'16px 18px', flex:1, display:'flex', flexDirection:'column', gap:14 }}>

                    {/* Info chips */}
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                      <div className="sc-chip">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="12" height="12" strokeLinecap="round" style={{ flexShrink:0 }}>
                          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                        </svg>
                        <span>{branchName}</span>
                      </div>
                      <div className="sc-chip">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="12" height="12" strokeLinecap="round" style={{ flexShrink:0 }}>
                          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
                        </svg>
                        <span>{counselorName}</span>
                      </div>
                    </div>

                    {/* Timer */}
                    {isInSes && (
                      <div className="sc-timer" style={{ cursor: 'pointer' }} onClick={() => setActiveCounsellingStudent(student)} title="Click to open workspace">
                        <div>
                          <div style={{ fontSize:'.72rem', fontWeight:800, letterSpacing:'.1em', textTransform:'uppercase', color:'rgba(245,158,11,.6)', marginBottom:3 }}>
                            ⏱ Active Time
                          </div>
                          <div className="sc-timer-val">{formatHHMMSS(elapsed)}</div>
                        </div>
                        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                          <span style={{ fontSize:'.7rem', fontWeight:800, letterSpacing:'.08em', color:'rgba(245,158,11,.5)' }}>LIVE</span>
                          <div style={{ width:9, height:9, borderRadius:'50%', background:'#f59e0b', boxShadow:'0 0 8px #f59e0b', animation:'pulseDot 1.4s infinite' }}/>
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    <div>
                      <label className="sc-label">Counselling Notes</label>
                      <textarea
                        className="sc-notes"
                        placeholder="Type student background, qualification, and interested fields..."
                        value={sessionNotes[student.id] || ''}
                        onChange={e => setSessionNotes(p => ({ ...p, [student.id]: e.target.value }))}
                        disabled={!isInSes}
                      />
                    </div>

                    {/* Follow-up */}
                    <div>
                      <label className="sc-label">Follow-up Status</label>
                      <CustomDropdown
                        value={followUpStatus[student.id] || ''}
                        onChange={v => setFollowUpStatus(p => ({ ...p, [student.id]: v }))}
                        isOpen={openDropId === student.id}
                        onToggle={() => setOpenDropId(p => p === student.id ? null : student.id)}
                        onClose={() => setOpenDropId(p => p === student.id ? null : p)}
                        disabled={!isInSes}
                      />
                    </div>
                  </div>

                  {/* ── Footer ── */}
                  <div className="sc-footer">
                    {student.status === 'Assigned' && (
                      <button type="button" className="sc-btn-start" onClick={() => handleOpenAndStartWorkspace(student)} disabled={loading}>
                        {isBusy
                          ? <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="15" height="15" strokeLinecap="round" style={{ animation:'spin 1s linear infinite' }}><path d="M21 12a9 9 0 11-6.22-8.56"/></svg> Starting…</>
                          : <><svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15"><path d="M8 5v14l11-7z"/></svg> Start Counselling</>
                        }
                      </button>
                    )}
                    {isInSes && (
                      <div style={{ display:'flex', gap:10, flexDirection: 'column' }}>
                        <button type="button" className="sc-btn-start" onClick={() => router.push(`/sessions/workspace?studentId=${student.id}`)}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="15" height="15" strokeLinecap="round">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                            <line x1="9" y1="3" x2="9" y2="21"/>
                          </svg>
                          Open Workspace
                        </button>
                        <div style={{ display:'flex', gap:10 }}>
                          <button type="button" className="sc-btn-save" onClick={() => handleSave(student.id)} disabled={loading}>
                            Save Notes
                          </button>
                          <button type="button" className="sc-btn-end" onClick={() => handleEnd(student.id)} disabled={loading}>
                            End Session
                          </button>
                        </div>
                        {user?.roleId === 'role_super_admin' && (
                          <button type="button" className="sc-btn-cancel" onClick={() => handleCancelStart(student.id)} disabled={loading} style={{ marginTop: 4 }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="14" height="14" strokeLinecap="round">
                              <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
                            </svg>
                            Cancel Counselling
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="sc-empty">
            <div style={{ width:60, height:60, borderRadius:16, background:'var(--primary-glow)', border:'1.5px solid rgba(99,102,241,.18)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 18px', fontSize:'1.7rem' }}>🎓</div>
            <h3 style={{ margin:0, fontSize:'1.25rem', fontWeight:800, color:'var(--text)' }}>No Active Sessions</h3>
            <p style={{ fontSize:'.875rem', color:'var(--muted)', marginTop:8, maxWidth:360, marginInline:'auto', lineHeight:1.7 }}>
              {isCounselor
                ? 'No students assigned to you right now. Check back soon!'
                : 'No active or assigned counselling sessions in the queue.'}
            </p>
            <button type="button" className="sc-refresh" style={{ marginTop:18 }} onClick={() => window.location.reload()}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="14" height="14" strokeLinecap="round">
                <path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
              </svg>
              Refresh
            </button>
          </div>
        )}
      </section>


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
                    <StatusPill status={selectedDetailsStudent.status} />
                  </h2>
                  <p style={{ margin: '2px 0 0 0', fontSize: '0.82rem', color: 'var(--muted)' }}>
                    Record ID: <strong>#{selectedDetailsStudent.id}</strong>
                  </p>
                </div>
              </div>
              <button
                type="button"
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

            {/* Scrollable CRM Page Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', background: 'var(--card-bg)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: 'var(--text)' }}>
                  Lead Record Sheet
                </h3>
                <StudentDetailsRecord student={selectedDetailsStudent} onClose={() => setShowDetailsModal(false)} />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
