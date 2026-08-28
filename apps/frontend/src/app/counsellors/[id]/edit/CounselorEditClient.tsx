'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateCounselorDetails } from '../../../../actions/counselorActions';
import StatusBadge from '../../../../components/StatusBadge';
import { SessionUser } from '../../../../lib/auth';

interface Counselor {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  roleId: string;
  departmentId: string;
  departmentName?: string | null;
  branchId: string;
  branchName?: string | null;
  location: string;
  availability: string[];
  status: string;
  assignedStudentId?: string | null;
  sessions?: any[];
}

interface CounselorEditClientProps {
  counselor: Counselor;
  branches: Array<{ id: string; name: string }>;
  locations: Array<{ id: string; name: string }>;
  departments: Array<{ id: string; name: string }>;
  currentUser: SessionUser;
}

export default function CounselorEditClient({
  counselor,
  branches,
  locations,
  departments,
  currentUser,
}: CounselorEditClientProps) {
  const router = useRouter();

  const [form, setForm] = useState({
    name: counselor.name || '',
    email: counselor.email || '',
    phone: counselor.phone || '',
    branchId: counselor.branchId || 'branch_jntu1',
    location: counselor.location || 'loc_hyd',
    departmentId: counselor.departmentId || 'dept_sales',
    status: counselor.status || 'Available',
    availability: counselor.availability?.length ? counselor.availability : ['09:00', '12:00', '15:00'],
  });

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleToggleSlot = (slot: string) => {
    if (form.availability.includes(slot)) {
      if (form.availability.length === 1) return; // keep at least 1 slot
      setForm({ ...form, availability: form.availability.filter((s) => s !== slot) });
    } else {
      setForm({ ...form, availability: [...form.availability, slot].sort() });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    showToast('Saving counselor profile changes…', 'info' as any);

    const bName = branches.find((b) => b.id === form.branchId)?.name || '1st Campus (JNTU-HYD)';
    const dName = departments.find((d) => d.id === form.departmentId)?.name || 'Sales & Career Guidance';

    const res = await updateCounselorDetails(counselor.id, {
      name: form.name,
      email: form.email,
      phone: form.phone,
      branchId: form.branchId,
      branchName: bName,
      location: form.location,
      departmentId: form.departmentId,
      departmentName: dName,
      status: form.status,
      availability: form.availability,
    });

    if (res.success) {
      showToast('✅ Counselor details updated successfully!', 'success');
      router.refresh();
      setTimeout(() => {
        router.push('/counsellors');
      }, 1000);
    } else {
      showToast(res.error || 'Failed to update counselor.', 'error');
    }
    setLoading(false);
  };

  const allAvailableSlots = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'];

  return (
    <section className="dash-page" style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '60px' }}>
      
      {/* ── Toast ── */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 28, right: 28, zIndex: 9999,
          padding: '12px 22px', borderRadius: '12px', fontSize: '0.88rem', fontWeight: 700,
          background: toast.type === 'success' ? 'rgba(16,185,129,0.18)' : 'rgba(239,68,68,0.18)',
          color: toast.type === 'success' ? '#10b981' : '#ef4444',
          border: `1.5px solid ${toast.type === 'success' ? 'rgba(16,185,129,0.4)' : 'rgba(239,68,68,0.4)'}`,
          backdropFilter: 'blur(16px)',
          boxShadow: '0 12px 36px rgba(0,0,0,0.35)',
          display: 'flex', alignItems: 'center', gap: '10px',
        }}>
          <span>{toast.type === 'success' ? '✓' : '⚠️'}</span>
          <span>{toast.msg}</span>
        </div>
      )}

      {/* ── Header Bar ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'var(--card-bg)',
        border: '1.5px solid var(--border)',
        borderRadius: '16px',
        padding: '20px 24px',
        flexWrap: 'wrap',
        gap: '12px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            type="button"
            onClick={() => router.push('/counsellors')}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              background: 'var(--surface)',
              color: 'var(--text)',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            ← Back to Directory
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontSize: '1.28rem', fontWeight: 900, color: 'var(--text)', margin: 0 }}>
                Edit Counselor: {counselor.name}
              </h1>
              <StatusBadge status={form.status} />
            </div>
            <p style={{ margin: '3px 0 0 0', fontSize: '0.8rem', color: 'var(--muted)' }}>
              Counselor ID: <span style={{ fontFamily: 'var(--font-mono)' }}>#{counselor.id}</span> • {counselor.branchName || 'Campus Branch'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          style={{
            padding: '9px 22px',
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
          {loading ? 'Saving…' : '💾 Save Counselor Details'}
        </button>
      </div>

      {/* ── Edit Form Card ── */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{
          background: 'var(--card-bg)',
          border: '1.5px solid var(--border)',
          borderRadius: '16px',
          padding: '26px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}>
          
          {/* Section 1: Basic Profile */}
          <div>
            <h2 style={{ fontSize: '0.96rem', fontWeight: 800, color: 'var(--text)', margin: '0 0 14px 0', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
              1. Counselor Identification &amp; Contact
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '6px' }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: '8px',
                    border: '1.5px solid var(--border)', background: 'var(--surface-alt)', color: 'var(--text)',
                    fontSize: '0.88rem', fontWeight: 700, outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '6px' }}>
                  Official Email Address
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="name@office.com"
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: '8px',
                    border: '1.5px solid var(--border)', background: 'var(--surface-alt)', color: 'var(--text)',
                    fontSize: '0.88rem', fontWeight: 600, outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '6px' }}>
                  Contact Phone Number
                </label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+91 9888748888"
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: '8px',
                    border: '1.5px solid var(--border)', background: 'var(--surface-alt)', color: 'var(--text)',
                    fontSize: '0.88rem', fontWeight: 600, outline: 'none',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Campus & Department */}
          <div>
            <h2 style={{ fontSize: '0.96rem', fontWeight: 800, color: 'var(--text)', margin: '0 0 14px 0', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
              2. Campus Center &amp; Department Allocation
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '6px' }}>
                  Assigned Walk-in Campus *
                </label>
                <select
                  value={form.branchId}
                  onChange={(e) => setForm({ ...form, branchId: e.target.value })}
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: '8px',
                    border: '1.5px solid var(--border)', background: 'var(--surface-alt)', color: 'var(--text)',
                    fontSize: '0.88rem', fontWeight: 700, outline: 'none', cursor: 'pointer',
                  }}
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      🏛️ {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '6px' }}>
                  City Location *
                </label>
                <select
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: '8px',
                    border: '1.5px solid var(--border)', background: 'var(--surface-alt)', color: 'var(--text)',
                    fontSize: '0.88rem', fontWeight: 700, outline: 'none', cursor: 'pointer',
                  }}
                >
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '6px' }}>
                  Department
                </label>
                <select
                  value={form.departmentId}
                  onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: '8px',
                    border: '1.5px solid var(--border)', background: 'var(--surface-alt)', color: 'var(--text)',
                    fontSize: '0.88rem', fontWeight: 700, outline: 'none', cursor: 'pointer',
                  }}
                >
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Presence & Availability Slots */}
          <div>
            <h2 style={{ fontSize: '0.96rem', fontWeight: 800, color: 'var(--text)', margin: '0 0 14px 0', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
              3. Real-Time Status &amp; Counseling Schedule Slots
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '8px' }}>
                  Current Real-Time Presence Status
                </label>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {['Available', 'Busy', 'Break', 'Offline'].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setForm({ ...form, status: st })}
                      style={{
                        padding: '7px 18px',
                        borderRadius: '9999px',
                        fontSize: '0.82rem',
                        fontWeight: 800,
                        border: form.status === st ? '2px solid var(--primary)' : '1px solid var(--border)',
                        background: form.status === st ? 'rgba(99, 102, 241, 0.15)' : 'var(--surface)',
                        color: form.status === st ? 'var(--primary)' : 'var(--muted)',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <span style={{
                        width: 8, height: 8, borderRadius: '50%',
                        background: st === 'Available' ? '#10b981' : st === 'Busy' ? '#ef4444' : st === 'Break' ? '#f59e0b' : '#94a3b8'
                      }} />
                      {st.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '8px' }}>
                  Active Working Hours Slots (Click to toggle)
                </label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {allAvailableSlots.map((slot) => {
                    const isSelected = form.availability.includes(slot);
                    let displayTime = slot;
                    const h = parseInt(slot.split(':')[0], 10);
                    displayTime = `${h >= 12 ? (h % 12 || 12) : h}:00 ${h >= 12 ? 'PM' : 'AM'}`;

                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => handleToggleSlot(slot)}
                        style={{
                          padding: '6px 14px',
                          borderRadius: '8px',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          border: isSelected ? '1.5px solid var(--primary)' : '1px solid var(--border)',
                          background: isSelected ? 'var(--primary)' : 'var(--surface)',
                          color: isSelected ? '#fff' : 'var(--muted)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {isSelected ? `✓ ${displayTime}` : displayTime}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
            <button
              type="button"
              onClick={() => router.push('/counsellors')}
              style={{
                padding: '9px 18px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                background: 'var(--surface-alt)',
                color: 'var(--text)',
                fontSize: '0.84rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '9px 24px',
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
              {loading ? 'Saving Changes…' : '💾 Save Counselor Details'}
            </button>
          </div>

        </div>
      </form>

    </section>
  );
}
