'use client';

import SearchInput from '../../components/SearchInput';


import TestRibbonTag, { isTestRecord } from '../../components/TestRibbonTag';


import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { SessionUser } from '../../lib/auth';
import { formatPhoneNumber } from '../../lib/formatters';
import StudentContextDrawer, { DrawerStudent } from '../../components/StudentContextDrawer';
import CustomSelect from '../../components/CustomSelect';
import { updateStudentDetails, mergeWalkinsIntoGroup } from '../../actions/walkinActions';

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

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

export default function QueueClient({ initialWalkins, branches, counselors, user }: QueueClientProps) {
  const router = useRouter();
  const [walkins, setWalkins] = useState<Student[]>(initialWalkins);
  const [branchFilter, setBranchFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [counselorFilter, setCounselorFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [queueStatusFilter, setQueueStatusFilter] = useState<string>('all');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showMergeModal, setShowMergeModal] = useState<boolean>(false);
  const [groupNameInput, setGroupNameInput] = useState<string>('');
  const [merging, setMerging] = useState<boolean>(false);

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

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === waitingQueue.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(waitingQueue.map(w => w.id));
    }
  };

  const handleMergeSubmit = async () => {
    if (selectedIds.length < 2) {
      setMessage('Please select at least 2 candidates to merge into a group walk-in.');
      return;
    }
    setMerging(true);
    const res = await mergeWalkinsIntoGroup(selectedIds, groupNameInput.trim() || undefined);
    if (res.success) {
      setMessage(`✅ Successfully merged ${res.count} candidates into a Group Walk-in!`);
      setSelectedIds([]);
      setShowMergeModal(false);
      setGroupNameInput('');
      router.refresh();
      window.location.reload();
    } else {
      setMessage(res.error || 'Failed to merge walk-ins.');
    }
    setMerging(false);
  };

  const openDrawer = useCallback((student: Student) => {
    setDrawerStudent(student as DrawerStudent);
    setDrawerOpen(true);
  }, []);

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

  const rawQueue = walkins.filter(w => w.status === 'Waiting' || w.status === 'Assigned');
  const totalWaitingCount = rawQueue.filter(w => w.status === 'Waiting').length;
  const totalAssignedCount = rawQueue.filter(w => w.status === 'Assigned').length;
  const totalUrgentCount = rawQueue.filter(w => (w.details?.priority || 'Medium') === 'Urgent').length;
  const totalHighCount = rawQueue.filter(w => (w.details?.priority || 'Medium') === 'High').length;

  const waitingQueue = rawQueue
    .filter(w => {
      const branchId = getBranchId(w);
      const branchMatch = branchFilter ? branchId === branchFilter : true;

      const p = (w.details?.priority || 'Medium');
      const activeSession = w.sessions.find(s => s.status === 'ASSIGNED' || s.status === 'IN_SESSION');
      const cId = activeSession ? activeSession.counselorId : 'unassigned';

      // Status bubble filter
      let statusMatch = true;
      if (queueStatusFilter === 'waiting') statusMatch = w.status === 'Waiting';
      else if (queueStatusFilter === 'assigned') statusMatch = w.status === 'Assigned';
      else if (queueStatusFilter === 'urgent') statusMatch = p === 'Urgent';
      else if (queueStatusFilter === 'high') statusMatch = p === 'High';
      else if (queueStatusFilter === 'medium') statusMatch = p === 'Medium';
      else if (queueStatusFilter === 'low') statusMatch = p === 'Low';

      // Priority dropdown filter
      const priorityMatch = priorityFilter ? p === priorityFilter : true;

      // Counselor dropdown filter
      const counselorMatch = counselorFilter ? (
        counselorFilter === 'unassigned' ? cId === 'unassigned' : cId === counselorFilter
      ) : true;

      // Search query
      const name = w.name || '';
      const phone = w.phone || '';
      const course = w.course || '';
      const searchMatch = searchQuery.trim() ? (
        name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        phone.includes(searchQuery) ||
        course.toLowerCase().includes(searchQuery.toLowerCase())
      ) : true;

      return branchMatch && statusMatch && priorityMatch && counselorMatch && searchMatch;
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

      {/* ── Real-time Queue Status Bubbles ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        margin: 'var(--space-4) 0 var(--space-3) 0',
        flexWrap: 'wrap',
      }}>
        {/* TOTAL */}
        <button
          type="button"
          onClick={() => setQueueStatusFilter('all')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 14px',
            borderRadius: '9999px',
            fontSize: '0.74rem',
            fontWeight: 800,
            letterSpacing: '0.04em',
            border: queueStatusFilter === 'all' ? '1.5px solid var(--primary)' : '1.5px solid var(--border)',
            background: queueStatusFilter === 'all' ? 'rgba(99, 102, 241, 0.15)' : 'var(--surface)',
            color: queueStatusFilter === 'all' ? 'var(--primary)' : 'var(--muted)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <span>TOTAL QUEUE</span>
          <span style={{
            background: queueStatusFilter === 'all' ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255,255,255,0.08)',
            padding: '1px 7px',
            borderRadius: '9999px',
            fontSize: '0.72rem',
            fontWeight: 800,
          }}>{rawQueue.length}</span>
        </button>

        {/* WAITING */}
        <button
          type="button"
          onClick={() => setQueueStatusFilter(queueStatusFilter === 'waiting' ? 'all' : 'waiting')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 14px',
            borderRadius: '9999px',
            fontSize: '0.74rem',
            fontWeight: 800,
            letterSpacing: '0.04em',
            border: queueStatusFilter === 'waiting' ? '1.5px solid #0ea5e9' : '1.5px solid rgba(14, 165, 233, 0.3)',
            background: 'rgba(14, 165, 233, 0.12)',
            color: '#0284c7',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: queueStatusFilter === 'waiting' ? '0 0 10px rgba(14, 165, 233, 0.35)' : 'none',
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#0ea5e9', boxShadow: '0 0 6px #0ea5e9', animation: 'pulseDot 1.4s ease-in-out infinite' }} />
          <span>WAITING</span>
          <span style={{
            background: 'rgba(14, 165, 233, 0.22)',
            padding: '1px 7px',
            borderRadius: '9999px',
            fontSize: '0.72rem',
            fontWeight: 800,
            color: '#0284c7',
          }}>{totalWaitingCount}</span>
        </button>

        {/* ASSIGNED */}
        <button
          type="button"
          onClick={() => setQueueStatusFilter(queueStatusFilter === 'assigned' ? 'all' : 'assigned')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 14px',
            borderRadius: '9999px',
            fontSize: '0.74rem',
            fontWeight: 800,
            letterSpacing: '0.04em',
            border: queueStatusFilter === 'assigned' ? '1.5px solid #6366f1' : '1.5px solid rgba(99, 102, 241, 0.3)',
            background: 'rgba(99, 102, 241, 0.12)',
            color: '#6366f1',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: queueStatusFilter === 'assigned' ? '0 0 10px rgba(99, 102, 241, 0.35)' : 'none',
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#6366f1', boxShadow: '0 0 6px #6366f1' }} />
          <span>ASSIGNED</span>
          <span style={{
            background: 'rgba(99, 102, 241, 0.22)',
            padding: '1px 7px',
            borderRadius: '9999px',
            fontSize: '0.72rem',
            fontWeight: 800,
            color: '#6366f1',
          }}>{totalAssignedCount}</span>
        </button>

        {/* URGENT */}
        <button
          type="button"
          onClick={() => setQueueStatusFilter(queueStatusFilter === 'urgent' ? 'all' : 'urgent')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 14px',
            borderRadius: '9999px',
            fontSize: '0.74rem',
            fontWeight: 800,
            letterSpacing: '0.04em',
            border: queueStatusFilter === 'urgent' ? '1.5px solid #ef4444' : '1.5px solid rgba(239, 68, 68, 0.3)',
            background: 'rgba(239, 68, 68, 0.12)',
            color: '#dc2626',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: queueStatusFilter === 'urgent' ? '0 0 10px rgba(239, 68, 68, 0.35)' : 'none',
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 6px #ef4444', animation: 'pulseDot 1.4s ease-in-out infinite' }} />
          <span>URGENT</span>
          <span style={{
            background: 'rgba(239, 68, 68, 0.22)',
            padding: '1px 7px',
            borderRadius: '9999px',
            fontSize: '0.72rem',
            fontWeight: 800,
            color: '#dc2626',
          }}>{totalUrgentCount}</span>
        </button>

        {/* HIGH PRIORITY */}
        <button
          type="button"
          onClick={() => setQueueStatusFilter(queueStatusFilter === 'high' ? 'all' : 'high')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 14px',
            borderRadius: '9999px',
            fontSize: '0.74rem',
            fontWeight: 800,
            letterSpacing: '0.04em',
            border: queueStatusFilter === 'high' ? '1.5px solid #f59e0b' : '1.5px solid rgba(245, 158, 11, 0.3)',
            background: 'rgba(245, 158, 11, 0.12)',
            color: '#d97706',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: queueStatusFilter === 'high' ? '0 0 10px rgba(245, 158, 11, 0.35)' : 'none',
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#f59e0b', boxShadow: '0 0 6px #f59e0b' }} />
          <span>HIGH</span>
          <span style={{
            background: 'rgba(245, 158, 11, 0.22)',
            padding: '1px 7px',
            borderRadius: '9999px',
            fontSize: '0.72rem',
            fontWeight: 800,
            color: '#d97706',
          }}>{totalHighCount}</span>
        </button>
      </div>

      {/* ── Search + Multi-Filters Bar ── */}
      <div style={{
        display: 'flex',
        gap: '12px',
        margin: '0 0 16px 0',
        background: 'var(--surface)',
        padding: '12px 18px',
        borderRadius: '12px',
        border: '1.5px solid var(--border)',
        flexWrap: 'wrap',
        alignItems: 'center',
      }}>
        {/* Search */}
        <div style={{ flex: '1 1 240px' }}>
          <SearchInput
            placeholder="Search queue by student name, phone, course..."
            value={searchQuery}
            onChange={setSearchQuery}
          />
        </div>

        {/* Priority Filter */}
        <div style={{ flex: '0 1 160px' }}>
          <CustomSelect
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
            placeholder="All Priorities"
            options={[
              { value: 'Urgent', label: '🔴 Urgent' },
              { value: 'High', label: '🟠 High' },
              { value: 'Medium', label: '🔵 Medium' },
              { value: 'Low', label: '⚪ Low' },
            ]}
          />
        </div>

        {/* Counselor Filter */}
        <div style={{ flex: '0 1 180px' }}>
          <CustomSelect
            value={counselorFilter}
            onChange={e => setCounselorFilter(e.target.value)}
            placeholder="All Counselors"
            options={[
              { value: 'unassigned', label: '👤 Unassigned' },
              ...counselors.map(c => ({ value: c.id, label: `👤 ${c.name}` }))
            ]}
          />
        </div>

        {/* Branch Filter */}
        <div style={{ flex: '0 1 180px' }}>
          <CustomSelect
            value={branchFilter}
            onChange={e => setBranchFilter(e.target.value)}
            placeholder="All Branches"
            options={branches.map(b => ({ value: b.id, label: b.name }))}
          />
        </div>

        <span style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 600, whiteSpace: 'nowrap', marginLeft: 'auto' }}>
          {waitingQueue.length} student{waitingQueue.length !== 1 ? 's' : ''} in view
        </span>
      </div>

      {/* ── Modern Queue Directory Table ── */}
      <div className="dash-table-card">
        <div className="table-wrapper">
          <table style={{ minWidth: '950px', borderCollapse: 'collapse', width: '100%' }} aria-label="Waiting Queue">
            <thead>
              <tr style={{ borderBottom: '1.5px solid var(--border)', background: 'var(--surface-alt, rgba(255,255,255,0.02))' }}>
                <th style={{ padding: '12px 16px', width: '40px', textAlign: 'center' }}>
                  <input
                    type="checkbox"
                    checked={waitingQueue.length > 0 && selectedIds.length === waitingQueue.length}
                    onChange={handleSelectAll}
                    style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: 'var(--primary)' }}
                    aria-label="Select all students in queue"
                  />
                </th>
                <th style={{ padding: '12px 16px', fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--muted)', width: '70px', textAlign: 'center' }}>Token</th>
                <th style={{ padding: '12px 16px', fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--muted)' }}>Student</th>
                <th style={{ padding: '12px 16px', fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--muted)' }}>Course</th>
                <th style={{ padding: '12px 16px', fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--muted)' }}>Priority</th>
                <th style={{ padding: '12px 16px', fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--muted)' }}>Assigned Counselor</th>
                <th style={{ padding: '12px 16px', fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--muted)' }}>Queue Status</th>
                <th style={{ padding: '12px 16px', fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--muted)', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {waitingQueue.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--muted)' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '8px' }}>✅</div>
                    <strong style={{ fontSize: '1rem', color: 'var(--text)' }}>Queue is clear</strong>
                    <p style={{ fontSize: '0.86rem', marginTop: '4px' }}>No students currently matching queue filters.</p>
                  </td>
                </tr>
              ) : (
                waitingQueue.map((w, index) => {
                  const position = index + 1;
                  const priority = (w.details?.priority || 'Medium') as PriorityLevel;
                  const activeSession = w.sessions?.find(s => 
                    s.status?.toUpperCase() === 'IN_SESSION' || 
                    s.status?.toUpperCase() === 'ASSIGNED' ||
                    s.status === 'In Session' ||
                    s.status === 'Assigned'
                  );
                  const matchedCounselor = activeSession ? counselors.find(c => c.id === activeSession.counselorId || (c as any).user?.id === activeSession.counselorId) : null;
                  const counselorName = matchedCounselor?.name || (matchedCounselor as any)?.user?.name || w.details?.counselorName || 'Unassigned';
                  const counselorId = activeSession ? activeSession.counselorId : 'unassigned';

                  return (
                    <tr
                      key={w.id}
                      style={{
                        borderBottom: '1px solid var(--border)',
                        transition: 'background 0.15s ease',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-alt, rgba(255,255,255,0.02))')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      {/* Multi-Select Checkbox */}
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(w.id)}
                          onChange={() => handleToggleSelect(w.id)}
                          style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: 'var(--primary)' }}
                          aria-label={`Select ${w.name} for group merge`}
                        />
                      </td>

                      {/* Token / Position */}
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          background: position <= 3 ? 'rgba(99, 102, 241, 0.15)' : 'var(--surface-alt)',
                          border: position <= 3 ? '1.5px solid rgba(99, 102, 241, 0.35)' : '1px solid var(--border)',
                          color: position <= 3 ? 'var(--primary)' : 'var(--muted)',
                          fontWeight: 900,
                          fontSize: '0.84rem',
                          fontFamily: 'var(--font-mono)',
                        }}>
                          #{position.toString().padStart(2, '0')}
                        </span>
                      </td>

                      {/* Student Info */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: 32, height: 32, borderRadius: '50%',
                            background: 'var(--primary-glow)', color: 'var(--primary)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.72rem', fontWeight: 800, flexShrink: 0,
                            border: '1px solid rgba(99,102,241,0.2)',
                          }}>
                            {getInitials(w.name)}
                          </div>
                          <div>
                            <button
                              type="button"
                              onClick={() => openDrawer(w)}
                              style={{
                                background: 'none', border: 'none', padding: 0,
                                cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem',
                                color: 'var(--primary)', fontFamily: 'inherit', textAlign: 'left',
                              }}
                              onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
                              onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}
                            >
                              {w.name}
                            </button>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px', fontSize: '0.76rem', color: 'var(--muted)' }}>
                              <span style={{ fontFamily: 'var(--font-mono)' }}>{formatPhoneNumber(w.phone)}</span>
                              <span>•</span>
                              <span style={{ fontFamily: 'var(--font-mono)' }}>#{w.id.slice(-6).toUpperCase()}</span>
                              {w.details?.walkinType === 'group' && (
                                <span style={{
                                  fontSize: '0.66rem',
                                  fontWeight: 800,
                                  padding: '1px 6px',
                                  borderRadius: '4px',
                                  background: 'rgba(99, 102, 241, 0.15)',
                                  color: 'var(--primary)',
                                  border: '1px solid rgba(99, 102, 241, 0.3)',
                                }}>
                                  👥 Group ({w.details?.groupSize || 2})
                                </span>
                              )}
                              {w.details?.parentAccompanied && w.details?.parentAccompanied !== 'solo' && (
                                <span style={{
                                  fontSize: '0.66rem',
                                  fontWeight: 800,
                                  padding: '1px 6px',
                                  borderRadius: '4px',
                                  background: 'rgba(16, 185, 129, 0.12)',
                                  color: '#10b981',
                                  border: '1px solid rgba(16, 185, 129, 0.3)',
                                }}>
                                  {w.details?.parentAccompanied === 'both' ? '👨‍👩‍👦 Parents Present' :
                                   w.details?.parentAccompanied === 'father' ? '👨 Father' :
                                   w.details?.parentAccompanied === 'mother' ? '👩 Mother' : '👥 Guardian'}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Course */}
                      <td style={{ padding: '14px 16px', fontSize: '0.86rem', fontWeight: 600, color: 'var(--text)' }}>
                        {w.course}
                      </td>

                      {/* Priority Select */}
                      <td style={{ padding: '14px 16px' }}>
                        <select
                          id={`priority-${w.id}`}
                          value={priority}
                          onChange={e => handlePriorityChange(w.id, e.target.value)}
                          aria-label={`Change priority for ${w.name}`}
                          style={{
                            padding: '5px 10px',
                            borderRadius: '6px',
                            border: priority === 'Urgent' ? '1.5px solid rgba(239,68,68,0.4)' : (priority === 'High' ? '1.5px solid rgba(245,158,11,0.4)' : '1px solid var(--border)'),
                            background: priority === 'Urgent' ? 'rgba(239,68,68,0.1)' : (priority === 'High' ? 'rgba(245,158,11,0.1)' : 'var(--surface-alt)'),
                            color: priority === 'Urgent' ? 'var(--danger)' : (priority === 'High' ? '#d97706' : 'var(--text)'),
                            fontWeight: 700,
                            fontSize: '0.78rem',
                            cursor: 'pointer',
                            outline: 'none',
                          }}
                        >
                          <option value="Urgent">🔴 Urgent</option>
                          <option value="High">🟠 High</option>
                          <option value="Medium">🔵 Medium</option>
                          <option value="Low">⚪ Low</option>
                        </select>
                      </td>

                      {/* Assigned Counselor Select */}
                      <td style={{ padding: '14px 16px' }}>
                        <select
                          id={`counselor-${w.id}`}
                          value={counselorId}
                          onChange={e => handleReassign(w.id, e.target.value)}
                          aria-label={`Assign counselor for ${w.name}`}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            border: counselorId === 'unassigned' ? '1.5px dashed rgba(245,158,11,0.5)' : '1px solid var(--border)',
                            background: 'var(--surface-alt)',
                            color: counselorId === 'unassigned' ? '#d97706' : 'var(--text)',
                            fontWeight: 600,
                            fontSize: '0.82rem',
                            cursor: 'pointer',
                            outline: 'none',
                            minWidth: '160px',
                          }}
                        >
                          <option value="unassigned">⏳ Unassigned (Waitlist)</option>
                          {counselors.map(c => (
                            <option key={c.id} value={c.id}>
                              👤 {c.name} {c.status ? `(${c.status})` : ''}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Queue Status (clean without running timer or false SLA breach) */}
                      <td style={{ padding: '14px 16px' }}>
                        {w.status === 'Assigned' ? (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '4px 10px',
                            borderRadius: '9999px',
                            fontSize: '0.75rem',
                            fontWeight: 800,
                            background: 'rgba(99, 102, 241, 0.12)',
                            color: '#6366f1',
                            border: '1px solid rgba(99, 102, 241, 0.3)',
                          }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#6366f1' }} />
                            ASSIGNED
                          </span>
                        ) : (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '4px 10px',
                            borderRadius: '9999px',
                            fontSize: '0.75rem',
                            fontWeight: 800,
                            background: 'rgba(14, 165, 233, 0.12)',
                            color: '#0284c7',
                            border: '1px solid rgba(14, 165, 233, 0.3)',
                          }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#0ea5e9', animation: 'pulseDot 1.4s ease-in-out infinite' }} />
                            WAITING
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={() => openDrawer(w)}
                            style={{
                              padding: '5px 12px',
                              borderRadius: '6px',
                              border: '1px solid var(--border)',
                              background: 'var(--surface-alt)',
                              color: 'var(--text)',
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                            }}
                            onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--primary)')}
                            onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                          >
                            Quick View
                          </button>
                          <button
                            type="button"
                            onClick={() => router.push(`/walkins/record?studentId=${w.id}`)}
                            style={{
                              padding: '5px 12px',
                              borderRadius: '6px',
                              border: '1.5px solid var(--primary)',
                              background: 'rgba(99,102,241,0.1)',
                              color: 'var(--primary)',
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            Full Record
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Student Context Drawer ── */}
      <StudentContextDrawer
        student={drawerStudent}
        counselors={drawerCounselors}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
      {/* ── Floating Merge Group Bar (When 2+ Candidates Selected) ── */}
      {selectedIds.length >= 2 && (
        <div style={{
          position: 'fixed',
          bottom: '28px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          background: 'var(--card-bg, #111827)',
          border: '2px solid var(--primary)',
          borderRadius: '16px',
          padding: '12px 24px',
          boxShadow: '0 12px 36px rgba(0,0,0,0.4)',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          backdropFilter: 'blur(12px)',
          animation: 'slideUp 0.25s ease-out',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.2rem' }}>👥</span>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text)' }}>
                {selectedIds.length} Walk-in Candidates Selected
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>
                Merge friends / batchmates into a single group session
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '7px 12px',
                color: 'var(--muted)',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => setShowMergeModal(true)}
              style={{
                background: 'linear-gradient(135deg, var(--primary), #818cf8)',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 18px',
                color: '#fff',
                fontSize: '0.84rem',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 2px 10px rgba(99, 102, 241, 0.35)',
              }}
            >
              Merge into Group Walk-in 👥
            </button>
          </div>
        </div>
      )}

      {/* ── Merge Walk-ins Modal ── */}
      {showMergeModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 11000,
          background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
        }}>
          <div style={{
            background: 'var(--card-bg, #111827)',
            border: '1.5px solid var(--border)',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '520px',
            padding: '24px',
            boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>👥</span> Merge into Group Walk-in
              </h2>
              <button
                type="button"
                onClick={() => setShowMergeModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: '1.2rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: '0.82rem', color: 'var(--muted)', margin: 0 }}>
              The selected candidates will be linked together into a single counseling session so they can be guided at the same time by the same counselor.
            </p>

            {/* Selected Candidates List */}
            <div style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '12px',
              maxHeight: '180px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)' }}>
                Selected Candidates ({selectedIds.length})
              </span>
              {walkins.filter(w => selectedIds.includes(w.id)).map(s => (
                <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.84rem' }}>
                  <span style={{ fontWeight: 700, color: 'var(--text)' }}>👤 {s.name}</span>
                  <span style={{ fontSize: '0.76rem', color: 'var(--muted)' }}>{s.course}</span>
                </div>
              ))}
            </div>

            {/* Optional Group Title */}
            <div>
              <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '6px' }}>
                Group Label / Batch Name (Optional)
              </label>
              <input
                type="text"
                value={groupNameInput}
                onChange={e => setGroupNameInput(e.target.value)}
                placeholder="e.g. SRM College Friends / Java Batch"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1.5px solid var(--border)',
                  background: 'var(--surface)',
                  color: 'var(--text)',
                  fontSize: '0.86rem',
                  outline: 'none',
                }}
              />
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
              <button
                type="button"
                onClick={() => setShowMergeModal(false)}
                disabled={merging}
                style={{
                  padding: '9px 16px',
                  borderRadius: '8px',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleMergeSubmit}
                disabled={merging}
                style={{
                  padding: '9px 20px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, var(--primary), #818cf8)',
                  border: 'none',
                  color: '#fff',
                  fontSize: '0.84rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 2px 10px rgba(99, 102, 241, 0.35)',
                }}
              >
                {merging ? 'Merging Candidates…' : 'Confirm Group Merge 👥'}
              </button>
            </div>
          </div>
        </div>
      )}

    </section>
  );
}