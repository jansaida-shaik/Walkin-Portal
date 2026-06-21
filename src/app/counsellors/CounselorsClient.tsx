'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SessionUser } from '../../lib/auth';
import StatusBadge from '../../components/StatusBadge';
import InputField from '../../components/InputField';
import { createCounselor, updateCounselorDetails, updateCounselorStatus } from '../../actions/counselorActions';

interface Branch {
  id: string;
  name: string;
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
}

interface CounselorsClientProps {
  initialCounselors: Counselor[];
  branches: Branch[];
  user: SessionUser | null;
}

const statusOptions = [
  { value: 'available', label: 'Available' },
  { value: 'busy', label: 'Busy' },
  { value: 'offline', label: 'Offline' },
  { value: 'break', label: 'Break' }
];

const locationOptions = ['Hyderabad', 'Vijayawada', 'Visakhapatnam'];

const mapLocationIdToName = (locId: string) => {
  if (locId === 'loc_vij') return 'Vijayawada';
  if (locId === 'loc_vsp') return 'Visakhapatnam';
  return 'Hyderabad';
};

export default function CounselorsClient({ initialCounselors, branches, user }: CounselorsClientProps) {
  const router = useRouter();
  const [counselors, setCounselors] = useState<Counselor[]>(initialCounselors);
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  
  const [newCounselor, setNewCounselor] = useState({
    name: '',
    departmentId: 'dept_sales',
    branchId: '',
    location: 'Hyderabad'
  });

  async function handleBranchChange(counselorId: string, branchId: string) {
    setMessage('Updating branch...');
    const res = await updateCounselorDetails(counselorId, { branchId });
    if (res.success) {
      setMessage(`Branch updated for counselor.`);
      router.refresh();
      window.location.reload();
    } else {
      setMessage(res.error || 'Failed to update branch.');
    }
  }

  async function handleLocationChange(counselorId: string, location: string) {
    setMessage('Updating location...');
    const res = await updateCounselorDetails(counselorId, { location });
    if (res.success) {
      setMessage(`Location updated for counselor.`);
      router.refresh();
      window.location.reload();
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

  return (
    <section className="dash-page">
      <div className="page-title-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
        <div className="dash-table-header">
          <h2>All Counselors ({counselors.length})</h2>
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
              </tr>
            </thead>
            <tbody>
              {counselors.length ? (
                counselors.map((c) => (
                  <tr key={c.id}>
                    <td className="counselor-name-cell">
                      <div className="counselor-avatar">
                        {c.name.charAt(0).toUpperCase()}
                      </div>
                      <span>{c.name}</span>
                    </td>
                    <td>
                      {canManage ? (
                        <select
                          className="inline-select"
                          value={mapLocationIdToName(c.location)}
                          onChange={(e) => handleLocationChange(c.id, e.target.value)}
                        >
                          {locationOptions.map((loc) => (
                            <option key={loc} value={loc}>{loc}</option>
                          ))}
                        </select>
                      ) : (
                        <span>{mapLocationIdToName(c.location)}</span>
                      )}
                    </td>
                    <td>
                      {canManage ? (
                        <select
                          className="inline-select"
                          value={c.branchId}
                          onChange={(e) => handleBranchChange(c.id, e.target.value)}
                        >
                          {branches.map((b) => (
                            <option key={b.id} value={b.id}>{b.name}</option>
                          ))}
                        </select>
                      ) : (
                        <span>{c.branchName}</span>
                      )}
                    </td>
                    <td>{c.departmentName}</td>
                    <td>
                      {canManage || user?.id === c.id ? (
                        <select
                          className="inline-select"
                          value={c.status.toLowerCase()}
                          onChange={(e) => handleStatusChange(c.id, e.target.value)}
                        >
                          {statusOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      ) : (
                        <StatusBadge status={c.status} />
                      )}
                    </td>
                    <td className="availability-cell">
                      {c.availability.map((slot) => (
                        <span key={slot} className="time-tag">{slot}</span>
                      ))}
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={6} className="empty-row">No counselors found</td></tr>
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

              <div style={{ marginBottom: '12px' }}>
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

              <div style={{ marginBottom: '12px' }}>
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
    </section>
  );
}
