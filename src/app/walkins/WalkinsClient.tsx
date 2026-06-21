'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { SessionUser } from '../../lib/auth';
import StatusBadge from '../../components/StatusBadge';
import InputField from '../../components/InputField';
import StudentContextDrawer, { DrawerStudent } from '../../components/StudentContextDrawer';
import { COURSES, COUNTRY_CODES, branches as BRANCHES } from '../../lib/constants';
import { createWalkin } from '../../actions/walkinActions';

interface Branch {
  id: string;
  name: string;
  locationId: string;
  profile: string;
  departmentIds: string[];
}

interface Counselor {
  id: string;
  name: string;
  roleId: string;
  roleName: string;
  branchId: string;
  branchName: string;
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
}

interface FailedWalkin {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  course: string;
  branchName: string;
  source: string;
  reason: string;
  createdAt: Date | string;
}

interface WalkinsClientProps {
  initialWalkins: Student[];
  branches: Branch[];
  counselors: Counselor[];
  user: SessionUser | null;
  failedWalkins?: FailedWalkin[];
}

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

const fieldStyle = {
  width: '100%',
  padding: '8px 12px',
  borderRadius: 'var(--radius-sm)',
  border: '1px solid var(--border)',
  background: 'var(--surface)',
  color: 'var(--text)',
  fontSize: '0.875rem',
  fontFamily: 'var(--font-sans)',
  outline: 'none',
  transition: 'var(--transition-fast)',
} as const;

export default function WalkinsClient({ initialWalkins, branches, counselors, user, failedWalkins = [] }: WalkinsClientProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRejected, setShowRejected] = useState(false);

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerStudent, setDrawerStudent] = useState<DrawerStudent | null>(null);

  useEffect(() => { setMounted(true); }, []);

  const openDrawer = useCallback((student: Student) => {
    setDrawerStudent(student as DrawerStudent);
    setDrawerOpen(true);
  }, []);

  /* ── Add form state ── */
  const [newWalkin, setNewWalkin] = useState({
    studentName: '', countryCode: '+91', phone: '', email: '',
    branchId: '', course: '', source: 'Walk-in', remarks: '',
  });

  const handleAddWalkinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWalkin.studentName || !newWalkin.phone || !newWalkin.email || !newWalkin.branchId || !newWalkin.course) {
      setMessage('Name, phone, email, branch, and course are required.');
      return;
    }
    setLoading(true);
    setMessage('');

    const formData = new FormData();
    formData.append('studentName', newWalkin.studentName);
    formData.append('phone', newWalkin.countryCode + newWalkin.phone);
    formData.append('countryCode', newWalkin.countryCode);
    formData.append('email', newWalkin.email);
    formData.append('branchId', newWalkin.branchId);
    formData.append('course', newWalkin.course);
    formData.append('source', newWalkin.source);
    formData.append('remarks', newWalkin.remarks);

    const res = await createWalkin(null, formData);
    if (res && (res as any).error) {
      setMessage((res as any).error);
    } else {
      setShowAddModal(false);
      setNewWalkin({ studentName: '', countryCode: '+91', phone: '', email: '', branchId: '', course: '', source: 'Walk-in', remarks: '' });
      setMessage('Walk-in registered successfully.');
      router.refresh();
      window.location.reload();
    }
    setLoading(false);
  };

  /* ── Filters (newest first) ── */
  const filteredWalkins = initialWalkins.filter(w => {
    const matchSearch = w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.id.toString().includes(searchQuery) || w.phone.includes(searchQuery);
    const matchStatus = statusFilter ? w.status === statusFilter : true;
    const matchBranch = branchFilter ? (w.branchId === branchFilter || w.details?.branchId === branchFilter) : true;
    return matchSearch && matchStatus && matchBranch;
  }).sort((a, b) => new Date(b.walkinDate).getTime() - new Date(a.walkinDate).getTime());

  const canManage = ['role_super_admin', 'role_admin', 'role_frontdesk', 'role_manager'].includes(user?.roleId || '');

  // Counselor data for drawer (simplified interface)
  const drawerCounselors = counselors.map(c => ({ id: c.id, name: c.name, branchName: c.branchName }));

  return (
    <section className="dash-page">
      {/* ── Header ── */}
      <div className="page-title-row">
        <div>
          <h1 className="page-title">Walk-ins Directory</h1>
          <p className="small-text">
            Comprehensive registry of student walk-ins, assignations, and statuses.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', flexWrap: 'wrap' }}>
          {failedWalkins.length > 0 && (
            <button
              id="rejected-toggle-btn"
              type="button"
              onClick={() => setShowRejected(!showRejected)}
              aria-expanded={showRejected}
              aria-controls="rejected-submissions-panel"
              style={{
                display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                padding: '9px 16px', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                background: showRejected ? 'var(--danger-glow)' : 'rgba(239,68,68,0.06)',
                border: `1.5px solid ${showRejected ? 'rgba(239,68,68,0.35)' : 'rgba(239,68,68,0.15)'}`,
                color: 'var(--danger)', fontSize: '0.85rem', fontWeight: 700,
                transition: 'var(--transition-fast)',
              }}
            >
              <span style={{
                background: 'var(--danger)', color: '#fff',
                borderRadius: 999, minWidth: 20, height: 20,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.7rem', fontWeight: 900, padding: '0 5px',
              }}>
                {failedWalkins.length}
              </span>
              Rejected
              <span aria-hidden="true">{showRejected ? '▲' : '▼'}</span>
            </button>
          )}
          {canManage && (
            <button
              id="register-walkin-btn"
              type="button"
              className="primary-btn"
              onClick={() => setShowAddModal(true)}
              aria-label="Register a new walk-in student"
            >
              <span aria-hidden="true">+</span> Register Walk-in
            </button>
          )}
        </div>
      </div>

      {message && (
        <div className="inline-message" role="status" aria-live="polite" style={{ margin: 'var(--space-2) 0 var(--space-4) 0' }}>
          {message}
        </div>
      )}

      {/* ── Rejected Submissions Panel ── */}
      {showRejected && failedWalkins.length > 0 && (
        <div
          id="rejected-submissions-panel"
          role="region"
          aria-label="Rejected walk-in submissions"
          style={{
            margin: 'var(--space-4) 0',
            background: 'rgba(239,68,68,0.03)',
            border: '1.5px solid rgba(239,68,68,0.16)',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
          }}
        >
          <div style={{
            padding: '14px 20px',
            borderBottom: '1px solid rgba(239,68,68,0.1)',
            display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
            background: 'rgba(239,68,68,0.05)',
          }}>
            <span aria-hidden="true" style={{ fontSize: '1rem' }}>🚫</span>
            <div>
              <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--danger)' }}>
                Rejected Submissions
              </span>
              <span style={{ fontSize: '0.78rem', color: 'var(--muted)', marginLeft: 'var(--space-3)' }}>
                Rejected due to duplicate phone or email already in system.
              </span>
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
              <thead>
                <tr style={{ background: 'rgba(239,68,68,0.04)' }}>
                  {['Name', 'Phone', 'Email', 'Course', 'Branch', 'Reason', 'Attempted At'].map(h => (
                    <th key={h} style={{
                      padding: 'var(--space-3) var(--space-4)', textAlign: 'left',
                      fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.05em',
                      textTransform: 'uppercase', color: 'var(--muted)',
                      borderBottom: '1px solid rgba(239,68,68,0.1)',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {failedWalkins.map(f => (
                  <tr
                    key={f.id}
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.04)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: 'var(--space-3) var(--space-4)', fontSize: '0.86rem', fontWeight: 700 }}>{f.name}</td>
                    <td style={{ padding: 'var(--space-3) var(--space-4)', fontSize: '0.83rem', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>{f.phone}</td>
                    <td style={{ padding: 'var(--space-3) var(--space-4)', fontSize: '0.83rem', color: 'var(--muted)' }}>{f.email || '—'}</td>
                    <td style={{ padding: 'var(--space-3) var(--space-4)', fontSize: '0.83rem' }}>{f.course}</td>
                    <td style={{ padding: 'var(--space-3) var(--space-4)', fontSize: '0.83rem', color: 'var(--muted)' }}>{f.branchName}</td>
                    <td style={{ padding: 'var(--space-3) var(--space-4)' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                        background: f.reason.includes('phone') ? 'var(--warning-glow)' : 'var(--danger-glow)',
                        color: f.reason.includes('phone') ? 'var(--warning)' : 'var(--danger)',
                        border: `1px solid ${f.reason.includes('phone') ? 'rgba(245,158,11,0.2)' : 'rgba(239,68,68,0.2)'}`,
                        borderRadius: 999, padding: '3px 10px',
                        fontSize: '0.72rem', fontWeight: 800,
                      }}>
                        {f.reason.includes('phone') ? '📱' : '📧'} {f.reason}
                      </span>
                    </td>
                    <td style={{ padding: 'var(--space-3) var(--space-4)', fontSize: '0.78rem', color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                      {mounted ? new Date(f.createdAt).toLocaleString([], { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Search + Filters ── */}
      <div
        role="search"
        aria-label="Filter walk-ins"
        style={{
          display: 'flex', gap: 'var(--space-3)', margin: 'var(--space-5) 0 var(--space-4) 0',
          background: 'var(--surface)', padding: 'var(--space-3) var(--space-4)',
          borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        {/* Search */}
        <div style={{ flex: '1 1 260px', display: 'flex', alignItems: 'center', gap: 'var(--space-2)', background: 'var(--surface-alt)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', padding: '0 var(--space-3)' }}>
          <svg aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" width="15" height="15" style={{ color: 'var(--muted)', flexShrink: 0 }}>
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.3-4.3" />
          </svg>
          <input
            id="walkins-search"
            type="search"
            placeholder="Search by name, ID, or phone…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            aria-label="Search walk-ins"
            style={{ border: 'none', background: 'transparent', width: '100%', fontSize: '0.875rem', color: 'var(--text)', outline: 'none', padding: 'var(--space-2) 0', fontFamily: 'var(--font-sans)' }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', display: 'flex', padding: 2 }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Status filter */}
        <div style={{ flex: '0 1 175px' }}>
          <label htmlFor="walkins-status-filter" className="sr-only">Filter by status</label>
          <select
            id="walkins-status-filter"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            style={fieldStyle}
          >
            <option value="">All Statuses</option>
            {['Waiting', 'Assigned', 'In Session', 'Completed', 'Follow-up', 'No Show', 'Cancelled'].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Branch filter */}
        <div style={{ flex: '0 1 200px' }}>
          <label htmlFor="walkins-branch-filter" className="sr-only">Filter by branch</label>
          <select
            id="walkins-branch-filter"
            value={branchFilter}
            onChange={e => setBranchFilter(e.target.value)}
            style={fieldStyle}
          >
            <option value="">All Branches</option>
            {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>

        {/* Results count */}
        <span style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 600, whiteSpace: 'nowrap' }}>
          {filteredWalkins.length} result{filteredWalkins.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* ── Main Table ── */}
      <div className="dash-table-card">
        <div className="table-wrapper">
          <table style={{ minWidth: '1050px' }} aria-label="Walk-ins directory">
            <thead>
              <tr>
                <th scope="col">Walk-in ID</th>
                <th scope="col">Student</th>
                <th scope="col">Phone</th>
                <th scope="col">Email</th>
                <th scope="col">Course</th>
                <th scope="col">Walk-in Date</th>
                <th scope="col">Status</th>
                <th scope="col">Source</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredWalkins.length ? (
                filteredWalkins.map(w => (
                  <tr key={w.id}>
                    <td className="mono-text">#{w.id.slice(-6).toUpperCase()}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                        <div style={{
                          width: 30, height: 30, borderRadius: '50%',
                          background: 'var(--primary-glow)', color: 'var(--primary)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.7rem', fontWeight: 800, flexShrink: 0,
                          border: '1px solid rgba(99,102,241,0.2)',
                        }}>
                          {getInitials(w.name)}
                        </div>
                        <button
                          type="button"
                          onClick={() => openDrawer(w)}
                          style={{
                            background: 'none', border: 'none', padding: 0,
                            cursor: 'pointer', color: 'var(--primary)',
                            fontWeight: 700, fontSize: '0.9rem', fontFamily: 'var(--font-sans)',
                            transition: 'color var(--transition-fast)',
                            textAlign: 'left',
                          }}
                          onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
                          onMouseLeave={e => (e.currentTarget.style.color = 'var(--primary)')}
                          aria-label={`View profile for ${w.name}`}
                        >
                          {w.name}
                        </button>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.84rem' }}>{w.phone}</span>
                    </td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--muted)', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                      title={w.email || ''}>
                      {w.email || <span style={{ opacity: 0.35 }}>—</span>}
                    </td>
                    <td style={{ fontSize: '0.86rem' }}>{w.course}</td>
                    <td style={{ fontSize: '0.84rem', color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                      {mounted ? new Date(w.walkinDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : ''}
                    </td>
                    <td><StatusBadge status={w.status} /></td>
                    <td style={{ fontSize: '0.84rem' }}>{w.source}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                        <button
                          type="button"
                          className="outline-btn"
                          style={{ padding: '5px 12px', fontSize: '0.78rem', borderRadius: 'var(--radius-sm)' }}
                          onClick={() => openDrawer(w)}
                          aria-label={`Quick view profile for ${w.name}`}
                        >
                          Quick View
                        </button>
                        <button
                          type="button"
                          className="outline-btn"
                          style={{ padding: '5px 12px', fontSize: '0.78rem', borderRadius: 'var(--radius-sm)' }}
                          onClick={() => router.push(`/walkins/record?studentId=${w.id}`)}
                          aria-label={`Open full record for ${w.name}`}
                        >
                          Full Record
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="empty-row">
                    No walk-ins match your search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Add Walk-in Modal ── */}
      {showAddModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-walkin-title"
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 'var(--z-modal)' as any,
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-5)',
          }}
          onClick={e => { if (e.target === e.currentTarget) setShowAddModal(false); }}
        >
          <div style={{
            background: 'var(--card-bg)', padding: 'var(--space-8) var(--space-6)', borderRadius: 'var(--radius-lg)',
            minWidth: '460px', maxWidth: '540px', width: '100%',
            boxShadow: 'var(--shadow-xl)',
            border: '1.5px solid var(--border)',
            maxHeight: '90vh', overflowY: 'auto',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
              <h2 id="add-walkin-title" style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>Register Walk-in</h2>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="drawer-close-btn"
                aria-label="Close registration form"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddWalkinSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {/* Name */}
              <InputField id="add-name" label="Student Name" value={newWalkin.studentName}
                onChange={e => setNewWalkin({ ...newWalkin, studentName: e.target.value })} required />

              {/* Phone + country code */}
              <div>
                <label htmlFor="add-phone" style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 'var(--space-2)' }}>
                  Phone Number <span style={{ color: 'var(--danger)' }} aria-hidden="true">*</span>
                </label>
                <div style={{ display: 'flex' }}>
                  <select
                    aria-label="Country code"
                    value={newWalkin.countryCode}
                    onChange={e => setNewWalkin({ ...newWalkin, countryCode: e.target.value })}
                    style={{ ...fieldStyle, width: 'auto', minWidth: '90px', borderRight: 'none', borderTopRightRadius: 0, borderBottomRightRadius: 0, flexShrink: 0 }}
                  >
                    {COUNTRY_CODES.map(cc => <option key={cc.code} value={cc.code}>{cc.flag} {cc.code}</option>)}
                  </select>
                  <input
                    id="add-phone"
                    type="tel"
                    inputMode="numeric"
                    placeholder="9876543210"
                    value={newWalkin.phone}
                    onChange={e => setNewWalkin({ ...newWalkin, phone: e.target.value.replace(/[^0-9]/g, '') })}
                    required
                    style={{ ...fieldStyle, borderTopLeftRadius: 0, borderBottomLeftRadius: 0, flex: 1 }}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="add-email" style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 'var(--space-2)' }}>
                  Email Address <span style={{ color: 'var(--danger)' }} aria-hidden="true">*</span>
                </label>
                <input
                  id="add-email"
                  type="email"
                  placeholder="name@example.com"
                  value={newWalkin.email}
                  onChange={e => setNewWalkin({ ...newWalkin, email: e.target.value.toLowerCase() })}
                  required
                  style={fieldStyle}
                />
              </div>

              {/* Branch */}
              <div>
                <label htmlFor="add-branch" style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 'var(--space-2)' }}>Branch</label>
                <select
                  id="add-branch"
                  value={newWalkin.branchId}
                  onChange={e => setNewWalkin({ ...newWalkin, branchId: e.target.value })}
                  required
                  style={fieldStyle}
                >
                  <option value="">— Select Branch —</option>
                  {BRANCHES.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>

              {/* Course */}
              <div>
                <label htmlFor="add-course" style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 'var(--space-2)' }}>Course Interested</label>
                <select
                  id="add-course"
                  value={COURSES.includes(newWalkin.course) ? newWalkin.course : (newWalkin.course ? 'Other' : '')}
                  onChange={e => {
                    if (e.target.value !== 'Other') setNewWalkin({ ...newWalkin, course: e.target.value });
                    else setNewWalkin({ ...newWalkin, course: '' });
                  }}
                  required={!newWalkin.course}
                  style={fieldStyle}
                >
                  <option value="">— Select Course —</option>
                  {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                {newWalkin.course && !COURSES.slice(0, -1).includes(newWalkin.course) && (
                  <input
                    type="text"
                    placeholder="Type course…"
                    value={newWalkin.course}
                    onChange={e => setNewWalkin({ ...newWalkin, course: e.target.value })}
                    required
                    style={{ ...fieldStyle, marginTop: 'var(--space-2)' }}
                  />
                )}
              </div>

              {/* Source */}
              <div>
                <label htmlFor="add-source" style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 'var(--space-2)' }}>Lead Source</label>
                <select
                  id="add-source"
                  value={newWalkin.source}
                  onChange={e => setNewWalkin({ ...newWalkin, source: e.target.value })}
                  style={fieldStyle}
                >
                  {['Walk-in', 'Google', 'Social Media', 'Referral', 'Just Dial', 'Other'].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Remarks */}
              <div>
                <label htmlFor="add-remarks" style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 'var(--space-2)' }}>Remarks</label>
                <textarea
                  id="add-remarks"
                  value={newWalkin.remarks}
                  onChange={e => setNewWalkin({ ...newWalkin, remarks: e.target.value })}
                  style={{ ...fieldStyle, height: '70px', resize: 'vertical', fontFamily: 'var(--font-sans)' } as any}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', paddingTop: 'var(--space-2)' }}>
                <button type="button" className="outline-btn" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="primary-btn" disabled={loading}>
                  {loading ? 'Registering…' : 'Register Walk-in'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
