'use client';

import SearchInput from '../../components/SearchInput';

import CustomSelect from '../../components/CustomSelect';
import BadgeCrest from '../../components/BadgeCrest';
import { ALL_BADGES, computeCounselorGamification } from '../../lib/gamification';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SessionUser } from '../../lib/auth';
import StatusBadge from '../../components/StatusBadge';
import InputField from '../../components/InputField';
import { createCounselor, updateCounselorDetails, updateCounselorStatus, deleteCounselor } from '../../actions/counselorActions';

interface Branch {
  id: string;
  name: string;
}

interface Counselor {
  id: string;
  name?: string;
  email?: string;
  user?: { name?: string; email?: string };
  roleId?: string;
  roleName?: string;
  departmentId?: string;
  departmentName?: string;
  branchId?: string;
  branchName?: string;
  location?: string;
  availability?: string[];
  status?: string;
  sessions?: any[];
  convertedLeads?: any[];
}

interface CounselorsClientProps {
  initialCounselors: Counselor[];
  branches: Branch[];
  user: SessionUser | null;
}

const statusOptions = [
  { value: 'Available', label: 'Available' },
  { value: 'Busy', label: 'Busy' },
  { value: 'Break', label: 'Break' },
  { value: 'Offline', label: 'Offline' }
];

const locationOptions = ['Hyderabad', 'Vijayawada', 'Visakhapatnam'];

export const mapLocationIdToName = (locId: string) => {
  if (!locId) return 'Hyderabad';
  if (locId === 'loc_vij' || locId.toLowerCase() === 'vijayawada') return 'Vijayawada';
  if (locId === 'loc_vsp' || locId.toLowerCase() === 'visakhapatnam') return 'Visakhapatnam';
  if (locId === 'loc_hyd' || locId.toLowerCase() === 'hyderabad') return 'Hyderabad';
  return locId;
};


// Verified counselors list — all others are "unidentified" (inactive pending verification)
const KNOWN_COUNSELORS = [
  'kranthi','battula','shireesha','shirisha','sasank','vamshi','subramanyam','devalla',
  'jahnavi','phanindra','vishal','koushik',
  'naveen','naveen babu','monika','sunandha','sunanda','lekha','priyanka','akhila','parvathi','maruthi',
  'vinay botcha','vinay kumar','doddipatla','siva kumar','siva nagasundhar','sravanthi','prashanthi','kiran','sai krishna',
  'pushpa',
];

function isUnidentified(name: string): boolean {
  if (!name) return true;
  const n = name.toLowerCase().trim();
  return !KNOWN_COUNSELORS.some(k => n.includes(k));
}

interface TableSelectProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  style?: React.CSSProperties;
}

function TableSelect({ value, onChange, options, placeholder, style }: TableSelectProps) {
  return (
    <CustomSelect
      value={value}
      onChange={onChange}
      options={options}
      placeholder={placeholder}
      style={{ minWidth: '150px', height: '36px', minHeight: '36px', ...style }}
    />
  );
}

function getInitials(name: string): string {
  if (!name) return '??';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function formatSlotTime(slot: string): string {
  if (!slot) return '';
  if (slot.includes('AM') || slot.includes('PM')) return slot;
  const parts = slot.split(':');
  if (parts.length >= 2) {
    let h = parseInt(parts[0], 10);
    const m = parts[1];
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h.toString().padStart(2, '0')}:${m} ${ampm}`;
  }
  return slot;
}

export default function CounselorsClient({ initialCounselors, branches, user }: CounselorsClientProps) {
  const router = useRouter();
  const [counselors, setCounselors] = useState<Counselor[]>(initialCounselors);
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'busy' | 'break' | 'offline' | 'inactive'>('all');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [locationFilter, setLocationFilter] = useState<string>('');
  const [branchFilter, setBranchFilter] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [selectedCounselorShowcase, setSelectedCounselorShowcase] = useState<Counselor | null>(null);
  
  const [newCounselor, setNewCounselor] = useState({
    name: '',
    departmentId: 'dept_sales',
    branchId: '',
    location: 'Hyderabad'
  });

  async function handleBranchChange(counselorId: string, branchId: string) {
    const bName = branches.find(b => b.id === branchId)?.name || '';
    setMessage(`Updating branch to ${bName}...`);
    setCounselors(prev => prev.map(c => c.id === counselorId ? { ...c, branchId, branchName: bName } : c));
    const res = await updateCounselorDetails(counselorId, { branchId });
    if (res.success) {
      setMessage(`Branch updated to ${bName}.`);
      router.refresh();
    } else {
      setMessage(res.error || 'Failed to update branch.');
    }
  }

  async function handleLocationChange(counselorId: string, location: string) {
    setMessage(`Updating location to ${location}...`);
    setCounselors(prev => prev.map(c => c.id === counselorId ? { ...c, location } : c));
    const res = await updateCounselorDetails(counselorId, { location });
    if (res.success) {
      setMessage(`Location updated to ${location}.`);
      router.refresh();
    } else {
      setMessage(res.error || 'Failed to update location.');
    }
  }

  async function handleStatusChange(counselorId: string, status: string) {
    setMessage('Updating status...');
    const res = await updateCounselorStatus(counselorId, status);
    if (res.success) {
      setMessage(`Status updated for counselor.`);
      router.refresh();
      window.location.reload();
    } else {
      setMessage(res.error || 'Failed to update status.');
    }
  }

  async function handleDeleteCounselor(counselorId: string, name: string) {
    if (!window.confirm(`Are you sure you want to permanently delete "${name}"? This cannot be undone.`)) return;
    setMessage('Deleting counselor...');
    const res = await deleteCounselor(counselorId);
    if (res.success) {
      setCounselors(prev => prev.filter(c => c.id !== counselorId));
      setMessage(`Counselor "${name}" deleted successfully.`);
      setTimeout(() => setMessage(''), 3000);
    } else {
      setMessage(res.error || 'Failed to delete counselor.');
    }
  }

  async function handleAddCounselorSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newCounselor.name || !newCounselor.branchId) {
      setMessage('Name and Branch are required.');
      return;
    }
    setLoading(true);
    setMessage('');
    const res = await createCounselor(
      newCounselor.name,
      newCounselor.departmentId,
      newCounselor.branchId,
      newCounselor.location === 'Vijayawada' ? 'loc_vij' : (newCounselor.location === 'Visakhapatnam' ? 'loc_vsp' : 'loc_hyd')
    );

    if (res.success) {
      setShowAddModal(false);
      setNewCounselor({ name: '', departmentId: 'dept_sales', branchId: '', location: 'Hyderabad' });
      setMessage(`Counselor added successfully.`);
      router.refresh();
      window.location.reload();
    } else {
      setMessage(res.error || 'Failed to register counselor.');
    }
    setLoading(false);
  }

  const canManage = user?.roleId === 'role_super_admin' || user?.roleId === 'role_admin' || user?.roleId === 'role_manager';

  const totalCount = counselors.length;
  const inactiveCount = counselors.filter(c => isUnidentified(c.name || '')).length;
  const availableCount = counselors.filter(c => (c.status || '').toLowerCase() === 'available').length;
  const busyCount = counselors.filter(c => (c.status || '').toLowerCase() === 'busy' || (c.status || '').toLowerCase() === 'in session' || (c.status || '').toLowerCase() === 'in_session').length;
  const breakCount = counselors.filter(c => (c.status || '').toLowerCase() === 'break').length;
  const offlineCount = counselors.filter(c => (c.status || '').toLowerCase() === 'offline').length;

  const filteredCounselors = counselors.filter((c) => {
    const name = c.name || '';
    const email = c.email || c.user?.email || '';
    const branch = c.branchName || branches.find(b => b.id === c.branchId)?.name || '';
    const location = mapLocationIdToName(c.location || '');
    const department = c.departmentName || '';
    const status = (c.status || 'available').toLowerCase();

    // 1. Search Query Filter
    const matchSearch = searchQuery.trim() ? (
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      branch.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      department.toLowerCase().includes(searchQuery.toLowerCase())
    ) : true;

    // 2. Status Bubble Filter (inactive = unidentified counselors)
    const unidentified = isUnidentified(name);
    const matchStatus = statusFilter !== 'all' ? (
      statusFilter === 'inactive' ? unidentified :
      statusFilter === 'available' ? (!unidentified && status === 'available') :
      statusFilter === 'busy' ? (!unidentified && (status === 'busy' || status === 'in session' || status === 'in_session')) :
      statusFilter === 'break' ? (!unidentified && status === 'break') :
      statusFilter === 'offline' ? (!unidentified && status === 'offline') : true
    ) : true;

    // 3. Location Filter
    const matchLocation = locationFilter ? (
      location.toLowerCase() === locationFilter.toLowerCase() ||
      (c.location || '').toLowerCase() === locationFilter.toLowerCase()
    ) : true;

    // 4. Branch Filter
    const matchBranch = branchFilter ? (c.branchId === branchFilter) : true;

    return matchSearch && matchStatus && matchLocation && matchBranch;
  });

  return (
    <section className="dash-page">
      <div className="page-title-row flex justify-between items-center">
        <div>
          <h1>Counselors</h1>
          <p className="small-text">Manage counselor profiles, branch assignments and availability status.</p>
        </div>
        {canManage && (
          <button className="primary-btn" onClick={() => setShowAddModal(true)}>
            + Add Counselor
          </button>
        )}
      </div>

      {message && <div className="inline-message" style={{ margin: '14px 0' }}>{message}</div>}

      <div className="dash-table-card">
        <div className="dash-table-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 900, color: 'var(--text)' }}>
              Counselors
            </h2>

            {/* ── Top Location Filter Tabs ── */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              background: 'var(--surface-alt, rgba(0,0,0,0.04))',
              padding: '3px',
              borderRadius: '10px',
              border: '1px solid var(--border)',
              gap: '4px',
            }}>
              {[
                { id: '', label: 'All', count: counselors.length },
                { id: 'Hyderabad', label: 'Hyderabad', count: counselors.filter(c => mapLocationIdToName(c.location) === 'Hyderabad').length },
                { id: 'Vijayawada', label: 'Vijayawada', count: counselors.filter(c => mapLocationIdToName(c.location) === 'Vijayawada').length },
                { id: 'Visakhapatnam', label: 'Visakhapatnam', count: counselors.filter(c => mapLocationIdToName(c.location) === 'Visakhapatnam').length },
              ].map(tab => {
                const isActive = locationFilter === tab.id;
                return (
                  <button
                    key={tab.id || 'all'}
                    type="button"
                    onClick={() => setLocationFilter(tab.id)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '5px 12px',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      fontWeight: isActive ? 800 : 600,
                      border: 'none',
                      background: isActive ? 'var(--primary)' : 'transparent',
                      color: isActive ? '#fff' : 'var(--text)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow: isActive ? '0 2px 8px rgba(99, 102, 241, 0.35)' : 'none',
                    }}
                  >
                    <span>{tab.label}</span>
                    <span style={{
                      padding: '1px 6px',
                      borderRadius: '9999px',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      background: isActive ? 'rgba(255,255,255,0.25)' : 'var(--surface, rgba(0,0,0,0.06))',
                      color: isActive ? '#fff' : 'var(--muted)',
                    }}>
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Real-time Status Counter Bubbles */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {/* Total */}
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 12px',
                borderRadius: '9999px',
                fontSize: '0.74rem',
                fontWeight: 800,
                border: statusFilter === 'all' ? '1.5px solid var(--primary)' : '1.5px solid var(--border)',
                background: statusFilter === 'all' ? 'rgba(99, 102, 241, 0.15)' : 'var(--surface)',
                color: statusFilter === 'all' ? 'var(--primary)' : 'var(--muted)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <span>TOTAL</span>
              <span style={{
                background: 'rgba(255,255,255,0.08)',
                padding: '1px 6px',
                borderRadius: '9999px',
                fontSize: '0.72rem',
                fontWeight: 800,
              }}>{totalCount}</span>
            </button>

            {/* Available */}
            <button
              type="button"
              onClick={() => setStatusFilter(statusFilter === 'available' ? 'all' : 'available')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 12px',
                borderRadius: '9999px',
                fontSize: '0.74rem',
                fontWeight: 800,
                border: statusFilter === 'available' ? '1.5px solid #10b981' : '1.5px solid rgba(16, 185, 129, 0.3)',
                background: 'rgba(16, 185, 129, 0.12)',
                color: '#059669',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: statusFilter === 'available' ? '0 0 10px rgba(16, 185, 129, 0.3)' : 'none',
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981', animation: 'pulseDot 1.4s ease-in-out infinite' }} />
              <span>AVAILABLE</span>
              <span style={{
                background: 'rgba(16, 185, 129, 0.2)',
                padding: '1px 6px',
                borderRadius: '9999px',
                fontSize: '0.72rem',
                fontWeight: 800,
                color: '#059669',
              }}>{availableCount}</span>
            </button>

            {/* Busy */}
            <button
              type="button"
              onClick={() => setStatusFilter(statusFilter === 'busy' ? 'all' : 'busy')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 12px',
                borderRadius: '9999px',
                fontSize: '0.74rem',
                fontWeight: 800,
                border: statusFilter === 'busy' ? '1.5px solid #f59e0b' : '1.5px solid rgba(245, 158, 11, 0.3)',
                background: 'rgba(245, 158, 11, 0.12)',
                color: '#d97706',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: statusFilter === 'busy' ? '0 0 10px rgba(245, 158, 11, 0.3)' : 'none',
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#f59e0b', boxShadow: '0 0 6px #f59e0b' }} />
              <span>BUSY</span>
              <span style={{
                background: 'rgba(245, 158, 11, 0.2)',
                padding: '1px 6px',
                borderRadius: '9999px',
                fontSize: '0.72rem',
                fontWeight: 800,
                color: '#d97706',
              }}>{busyCount}</span>
            </button>

            {/* Break */}
            <button
              type="button"
              onClick={() => setStatusFilter(statusFilter === 'break' ? 'all' : 'break')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 12px',
                borderRadius: '9999px',
                fontSize: '0.74rem',
                fontWeight: 800,
                border: statusFilter === 'break' ? '1.5px solid #f97316' : '1.5px solid rgba(249, 115, 22, 0.3)',
                background: 'rgba(249, 115, 22, 0.12)',
                color: '#ea580c',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: statusFilter === 'break' ? '0 0 10px rgba(249, 115, 22, 0.3)' : 'none',
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#f97316' }} />
              <span>BREAK</span>
              <span style={{
                background: 'rgba(249, 115, 22, 0.2)',
                padding: '1px 6px',
                borderRadius: '9999px',
                fontSize: '0.72rem',
                fontWeight: 800,
                color: '#ea580c',
              }}>{breakCount}</span>
            </button>

            {/* Inactive (Unidentified / Pending Verification) */}
            <button
              type="button"
              onClick={() => setStatusFilter(statusFilter === 'inactive' ? 'all' : 'inactive')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 12px',
                borderRadius: '9999px',
                fontSize: '0.74rem',
                fontWeight: 800,
                border: statusFilter === 'inactive' ? '1.5px solid #ef4444' : '1.5px solid rgba(239, 68, 68, 0.3)',
                background: 'rgba(239, 68, 68, 0.10)',
                color: '#dc2626',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: statusFilter === 'inactive' ? '0 0 10px rgba(239, 68, 68, 0.3)' : 'none',
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444' }} />
              <span>INACTIVE</span>
              <span style={{
                background: 'rgba(239, 68, 68, 0.2)',
                padding: '1px 6px',
                borderRadius: '9999px',
                fontSize: '0.72rem',
                fontWeight: 800,
                color: '#dc2626',
              }}>{inactiveCount}</span>
            </button>

            {/* Offline */}
            <button
              type="button"
              onClick={() => setStatusFilter(statusFilter === 'offline' ? 'all' : 'offline')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 12px',
                borderRadius: '9999px',
                fontSize: '0.74rem',
                fontWeight: 800,
                border: statusFilter === 'offline' ? '1.5px solid #94a3b8' : '1.5px solid rgba(100, 116, 139, 0.3)',
                background: 'rgba(100, 116, 139, 0.12)',
                color: '#64748b',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: statusFilter === 'offline' ? '0 0 10px rgba(100, 116, 139, 0.3)' : 'none',
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#94a3b8' }} />
              <span>OFFLINE</span>
              <span style={{
                background: 'rgba(100, 116, 139, 0.2)',
                padding: '1px 6px',
                borderRadius: '9999px',
                fontSize: '0.72rem',
                fontWeight: 800,
                color: '#64748b',
              }}>{offlineCount}</span>
            </button>
          </div>
        </div>
                {/* ── Global Search + Filters Bar ── */}
        <div
          role="search"
          aria-label="Filter counselors"
          style={{
            display: 'flex',
            gap: '12px',
            padding: '12px 20px',
            background: 'var(--surface-alt, rgba(255, 255, 255, 0.02))',
            borderBottom: '1px solid var(--border)',
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          {/* Search Input */}
          <div style={{ flex: '1 1 260px' }}>
            <SearchInput
              id="counselors-search"
              placeholder="Search by name, branch, location, or email…"
              value={searchQuery}
              onChange={setSearchQuery}
              ariaLabel="Search counselors"
            />
          </div>

          {/* Location filter */}
          <div style={{ flex: '0 1 180px' }}>
            <TableSelect
              value={locationFilter}
              onChange={e => setLocationFilter(e.target.value)}
              options={[
                { value: '', label: 'All Locations' },
                ...locationOptions.map(l => ({ value: l, label: l }))
              ]}
              style={{ background: 'var(--surface)' }}
            />
          </div>

          {/* Branch filter */}
          <div style={{ flex: '0 1 210px' }}>
            <TableSelect
              value={branchFilter}
              onChange={e => setBranchFilter(e.target.value)}
              options={[
                { value: '', label: 'All Branches' },
                ...branches.map(b => ({ value: b.id, label: b.name }))
              ]}
              style={{ background: 'var(--surface)' }}
            />
          </div>

          {/* Results count */}
          <span style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 600, whiteSpace: 'nowrap', marginLeft: 'auto' }}>
            {filteredCounselors.length} counselor{filteredCounselors.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Location</th>
                <th>Branch</th>
                <th>Department</th>
                <th>Status</th>
                <th>Availability</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCounselors.length ? (
                filteredCounselors.map((c) => (
                  <tr key={c.id}>
                    <td className="counselor-name-cell">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '34px', height: '34px', borderRadius: '50%',
                          background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                          color: '#fff', fontWeight: 900, fontSize: '0.76rem',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0,
                        }}>
                          {getInitials(c.name || 'Counselor')}
                        </div>
                        <div>
                          <button
                            type="button"
                            onClick={() => setSelectedCounselorShowcase(c)}
                            style={{
                              background: 'none', border: 'none', padding: 0,
                              cursor: 'pointer', fontWeight: 800, fontSize: '0.9rem',
                              color: 'var(--primary)', fontFamily: 'inherit', textAlign: 'left',
                              display: 'block',
                            }}
                            onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
                            onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}
                          >
                            {c.name || 'Counselor'}
                          </button>
                          <span style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>
                            {c.email || `${(c.name || 'counselor').toLowerCase().replace(/[^a-z0-9]/g, '')}@office.com`}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      {canManage ? (
                        <TableSelect
                          value={mapLocationIdToName(c.location)}
                          onChange={(e) => handleLocationChange(c.id, e.target.value)}
                          options={locationOptions.map((loc) => ({ value: loc, label: loc }))}
                        />
                      ) : (
                        <span>{mapLocationIdToName(c.location)}</span>
                      )}
                    </td>
                    <td>
                      {canManage ? (
                        <TableSelect
                          value={c.branchId || ''}
                          onChange={(e) => handleBranchChange(c.id, e.target.value)}
                          options={branches.map((b) => ({ value: b.id, label: b.name }))}
                        />
                      ) : (
                        <span>{c.branchName}</span>
                      )}
                    </td>
                    <td>{c.departmentName || "Sales"}</td>
                    <td>
                      {isUnidentified(c.name || '') ? (
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '5px',
                          padding: '3px 10px', borderRadius: '9999px', fontSize: '0.72rem',
                          fontWeight: 800, background: 'rgba(239,68,68,0.12)',
                          color: '#dc2626', border: '1px solid rgba(239,68,68,0.3)',
                        }}>
                          ⚠️ Inactive — Pending Verification
                        </span>
                      ) : (
                        <StatusBadge status={c.status || 'Available'} />
                      )}
                    </td>
                    <td className="availability-cell">
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {(c.availability && c.availability.length > 0 ? c.availability : ["09:00", "12:00", "15:00"]).map((slot) => (
                          <span key={slot} style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: '3px 8px',
                            background: 'rgba(99, 102, 241, 0.08)',
                            border: '1px solid rgba(99, 102, 241, 0.2)',
                            borderRadius: '6px',
                            fontSize: '0.76rem',
                            fontWeight: 700,
                            color: 'var(--text)',
                          }}>
                            {formatSlotTime(slot)}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          type="button"
                          onClick={() => setSelectedCounselorShowcase(c)}
                          style={{
                            padding: '5px 10px',
                            borderRadius: '6px',
                            border: '1px solid var(--border)',
                            background: 'var(--surface-alt)',
                            color: 'var(--text)',
                            fontSize: '0.76rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          👁️ View
                        </button>
                        {canManage && (
                          <button
                            type="button"
                            id={`delete-counselor-${c.id}`}
                            onClick={() => handleDeleteCounselor(c.id, c.name || 'Counselor')}
                            style={{
                              padding: '5px 10px',
                              borderRadius: '6px',
                              border: '1.5px solid rgba(239,68,68,0.5)',
                              background: 'rgba(239,68,68,0.08)',
                              color: '#ef4444',
                              fontSize: '0.76rem',
                              fontWeight: 800,
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.background = '#ef4444';
                              e.currentTarget.style.color = '#fff';
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.background = 'rgba(239,68,68,0.08)';
                              e.currentTarget.style.color = '#ef4444';
                            }}
                          >
                            🗑️ Delete
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => router.push(`/counsellors/${c.id}/edit`)}
                          style={{
                            padding: '5px 12px',
                            borderRadius: '6px',
                            border: '1.5px solid var(--primary)',
                            background: 'rgba(99, 102, 241, 0.1)',
                            color: 'var(--primary)',
                            fontSize: '0.78rem',
                            fontWeight: 800,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.background = 'var(--primary)';
                            e.currentTarget.style.color = '#fff';
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)';
                            e.currentTarget.style.color = 'var(--primary)';
                          }}
                        >
                          ✏️ Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={7} className="empty-row">No counselors found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Counselor Modal */}
      {showAddModal && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="modal-content" style={{ background: 'var(--card-bg)', padding: '24px', borderRadius: '12px', minWidth: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <h2 style={{ marginTop: 0, marginBottom: '16px' }}>Add Counselor</h2>
            <form onSubmit={handleAddCounselorSubmit}>
              <InputField
                id="add-counselor-name"
                label="Name"
                value={newCounselor.name}
                onChange={(e) => setNewCounselor({ ...newCounselor, name: e.target.value })}
                required
              />

              <div className="mb-3">
                <label style={{ display: 'block', marginBottom: '6px' }}>Location</label>
                <select
                  value={newCounselor.location}
                  onChange={(e) => setNewCounselor({ ...newCounselor, location: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)' }}
                >
                  {locationOptions.map(l => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label style={{ display: 'block', marginBottom: '6px' }}>Branch</label>
                <select
                  value={newCounselor.branchId}
                  onChange={(e) => setNewCounselor({ ...newCounselor, branchId: e.target.value })}
                  required
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)' }}
                >
                  <option value="">Select Branch</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
                <button type="button" className="outline-btn" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="primary-btn" disabled={loading}>
                  {loading ? 'Adding...' : 'Add Counselor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ── Counselor Public Achievement Showcase Modal ── */}
      {selectedCounselorShowcase && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 11000, padding: '20px',
        }}>
          <div style={{
            background: 'var(--card-bg, #111827)', border: '1.5px solid var(--border)',
            borderRadius: '20px', width: '100%', maxWidth: '640px', padding: '24px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', gap: '18px',
          }}>
            {/* Header */}
            {(() => {
              const gam = computeCounselorGamification(selectedCounselorShowcase, selectedCounselorShowcase.sessions || [], selectedCounselorShowcase.convertedLeads || []);
              const unlockedBadges = gam.badges.filter(b => b.isUnlocked);

              return (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{
                        width: '56px', height: '56px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, #6366f1, #a855f7)', color: '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.4rem', fontWeight: 900, border: '2px solid rgba(255,255,255,0.2)',
                      }}>
                        {getInitials(selectedCounselorShowcase.name || 'Counselor')}
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: 'var(--text)' }}>
                            {selectedCounselorShowcase.name}
                          </h2>
                          <span style={{
                            fontSize: '0.68rem', fontWeight: 900, padding: '2px 8px', borderRadius: '6px',
                            background: gam.tierColor || '#cd7f32', color: '#fff', textTransform: 'uppercase',
                          }}>
                            {gam.tierName} • Lvl {gam.level}
                          </span>
                        </div>
                        <p style={{ margin: '3px 0 0 0', fontSize: '0.8rem', color: 'var(--muted)' }}>
                          📍 {selectedCounselorShowcase.branchName || 'Campus Branch'} • {selectedCounselorShowcase.departmentName || 'Sales'} • 🔥 {gam.streakDays}-Day Active Streak
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedCounselorShowcase(null)}
                      style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: '1.3rem', cursor: 'pointer' }}
                    >
                      ✕
                    </button>
                  </div>

                  {/* Real Performance Stats Strip */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', textAlign: 'center' }}>
                    <div style={{ background: 'var(--surface)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border)' }}>
                      <div style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--text)' }}>{gam.completedCount}</div>
                      <div style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)' }}>Sessions Completed</div>
                    </div>
                    <div style={{ background: 'var(--surface)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border)' }}>
                      <div style={{ fontSize: '1.3rem', fontWeight: 900, color: gam.conversionRate > 0 ? '#10b981' : 'var(--muted)' }}>{gam.conversionRate}%</div>
                      <div style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)' }}>Conversion %</div>
                    </div>
                    <div style={{ background: 'var(--surface)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border)' }}>
                      <div style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>{gam.xp} PTS</div>
                      <div style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)' }}>League Points</div>
                    </div>
                  </div>

                  {/* Achievement Badges Trophy Shelf */}
                  <div>
                    <span style={{ display: 'block', fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '10px' }}>
                      🎖️ Achievement Badges ({unlockedBadges.length}/{gam.badges.length} Unlocked)
                    </span>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                      {gam.badges.slice(0, 3).map((b) => (
                        <div key={b.id} style={{
                          background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px',
                          padding: '12px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
                          opacity: b.isUnlocked ? 1 : 0.65,
                        }}>
                          <BadgeCrest tier={b.tier} size={48} isUnlocked={b.isUnlocked} icon={b.icon} />
                          <div style={{ fontWeight: 800, fontSize: '0.8rem', color: 'var(--text)', marginTop: '6px' }}>{b.name}</div>
                          <div style={{
                            fontSize: '0.66rem',
                            color: b.isUnlocked ? '#10b981' : 'var(--muted)',
                            fontWeight: 800,
                            marginTop: '2px'
                          }}>
                            {b.isUnlocked ? 'UNLOCKED ✔' : `${b.progressPct || 0}% Progress`}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              );
            })()}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
              <button
                type="button"
                onClick={() => setSelectedCounselorShowcase(null)}
                style={{
                  padding: '8px 20px', borderRadius: '8px',
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  color: 'var(--text)', fontSize: '0.84rem', fontWeight: 700, cursor: 'pointer',
                }}
              >
                Close Showcase
              </button>
            </div>
          </div>
        </div>
      )}

    </section>
  );
}