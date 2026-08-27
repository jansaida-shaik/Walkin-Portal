'use client';

import React, { useState, useEffect } from 'react';
import { getAttendanceSummary } from '../../actions/attendanceActions';

interface AttendanceTabProps {
  branches: { id: string; name: string }[];
}

export default function AttendanceTab({ branches }: AttendanceTabProps) {
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [summaryList, setSummaryList] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchSummary = async () => {
    setLoading(true);
    const branchId = selectedBranch === 'all' ? undefined : selectedBranch;
    const res = await getAttendanceSummary(selectedDate, branchId);
    if (res.success && res.summary) {
      setSummaryList(res.summary);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSummary();
    const interval = setInterval(fetchSummary, 15000); // Auto-refresh floor matrix every 15s
    return () => clearInterval(interval);
  }, [selectedDate, selectedBranch]);

  const filteredList = summaryList.filter(item => {
    if (searchQuery.trim() === '') return true;
    const q = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      (item.branchName || '').toLowerCase().includes(q) ||
      item.liveStatus.toLowerCase().includes(q)
    );
  });

  // Aggregates
  const totalClockedIn = summaryList.filter(s => s.clockIn && !s.clockOut).length;
  const inSessionCount = summaryList.filter(s => s.liveStatus === 'In Session').length;
  const onBreakCount = summaryList.filter(s => s.liveStatus.startsWith('Break') || s.liveStatus === '5m Buffer').length;
  const availableCount = summaryList.filter(s => s.liveStatus === 'Available').length;

  const handleExportCSV = () => {
    const branchQuery = selectedBranch !== 'all' ? `&branchId=${selectedBranch}` : '';
    window.open(`/api/attendance/export?date=${selectedDate}${branchQuery}`, '_blank');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* ── TOP KPI OVERVIEW CARDS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div style={{
          background: 'var(--card-bg, #ffffff)',
          border: '1px solid var(--border-color, #e2e8f0)',
          borderRadius: '16px',
          padding: '18px 20px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
        }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--muted, #64748b)' }}>🟢 Clocked In On Duty</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#16a34a', marginTop: '4px' }}>{totalClockedIn}</div>
          <div style={{ fontSize: '0.75rem', color: '#15803d', marginTop: '2px' }}>{availableCount} currently ready for walk-ins</div>
        </div>

        <div style={{
          background: 'var(--card-bg, #ffffff)',
          border: '1px solid var(--border-color, #e2e8f0)',
          borderRadius: '16px',
          padding: '18px 20px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
        }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--muted, #64748b)' }}>💬 In Live Sessions</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0284c7', marginTop: '4px' }}>{inSessionCount}</div>
          <div style={{ fontSize: '0.75rem', color: '#0369a1', marginTop: '2px' }}>Active student consultations</div>
        </div>

        <div style={{
          background: 'var(--card-bg, #ffffff)',
          border: '1px solid var(--border-color, #e2e8f0)',
          borderRadius: '16px',
          padding: '18px 20px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
        }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--muted, #64748b)' }}>☕ Breaks & Buffers</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#ea580c', marginTop: '4px' }}>{onBreakCount}</div>
          <div style={{ fontSize: '0.75rem', color: '#c2410c', marginTop: '2px' }}>Lunch, tea or 5m post-session buffer</div>
        </div>

        <div style={{
          background: 'var(--card-bg, #ffffff)',
          border: '1px solid var(--border-color, #e2e8f0)',
          borderRadius: '16px',
          padding: '18px 20px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
        }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--muted, #64748b)' }}>🚪 Offline / Shift Done</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#64748b', marginTop: '4px' }}>
            {summaryList.length - totalClockedIn}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>Clocked out or yet to clock in</div>
        </div>
      </div>

      {/* ── CONTROLS & FILTER BAR ── */}
      <div style={{
        background: 'var(--card-bg, #ffffff)',
        border: '1px solid var(--border-color, #e2e8f0)',
        borderRadius: '16px',
        padding: '16px 20px',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '14px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* Date Picker */}
          <div>
            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '4px' }}>
              Attendance Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '10px',
                border: '1.5px solid var(--border-color, #cbd5e1)',
                background: 'var(--input-bg, #ffffff)',
                color: 'var(--text)',
                fontWeight: 700,
                fontSize: '0.85rem',
                outline: 'none',
              }}
            />
          </div>

          {/* Campus Selector */}
          <div>
            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '4px' }}>
              Campus Branch
            </label>
            <select
              value={selectedBranch}
              onChange={e => setSelectedBranch(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '10px',
                border: '1.5px solid var(--border-color, #cbd5e1)',
                background: 'var(--input-bg, #ffffff)',
                color: 'var(--text)',
                fontWeight: 700,
                fontSize: '0.85rem',
                outline: 'none',
              }}
            >
              <option value="all">All Campuses</option>
              {branches.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div>
            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '4px' }}>
              Search Counselor
            </label>
            <input
              type="text"
              placeholder="Search by name..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                padding: '8px 14px',
                borderRadius: '10px',
                border: '1.5px solid var(--border-color, #cbd5e1)',
                background: 'var(--input-bg, #ffffff)',
                color: 'var(--text)',
                fontSize: '0.85rem',
                outline: 'none',
                minWidth: '180px',
              }}
            />
          </div>
        </div>

        {/* Export Button */}
        <button
          onClick={handleExportCSV}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #0284c7, #0369a1)',
            color: '#ffffff',
            fontWeight: 800,
            fontSize: '0.85rem',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)',
          }}
        >
          📥 Export CSV Register
        </button>
      </div>

      {/* ── DAILY ATTENDANCE & LIVE DUTY TABLE ── */}
      <div style={{
        background: 'var(--card-bg, #ffffff)',
        border: '1px solid var(--border-color, #e2e8f0)',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
      }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border-color, #e2e8f0)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900, color: 'var(--text)' }}>
              📋 Counselor Floor Presence & Daily Attendance Register
            </h3>
            <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: 'var(--muted)' }}>
              Real-time clock in/out timestamps, active break status, and session utilization for {selectedDate}.
            </p>
          </div>
          <button
            onClick={fetchSummary}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              background: '#f1f5f9',
              border: '1px solid #cbd5e1',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              color: '#334155'
            }}
          >
            🔄 Refresh
          </button>
        </div>

        {loading && summaryList.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)' }}>
            Loading floor presence matrix...
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
              <thead>
                <tr style={{ background: 'var(--table-header-bg, #f8fafc)', borderBottom: '1px solid var(--border-color, #e2e8f0)' }}>
                  <th style={{ padding: '14px 18px', fontWeight: 800, color: 'var(--muted)' }}>Counselor</th>
                  <th style={{ padding: '14px 18px', fontWeight: 800, color: 'var(--muted)' }}>Campus</th>
                  <th style={{ padding: '14px 18px', fontWeight: 800, color: 'var(--muted)' }}>Live Status</th>
                  <th style={{ padding: '14px 18px', fontWeight: 800, color: 'var(--muted)' }}>Clock In</th>
                  <th style={{ padding: '14px 18px', fontWeight: 800, color: 'var(--muted)' }}>Clock Out</th>
                  <th style={{ padding: '14px 18px', fontWeight: 800, color: 'var(--muted)' }}>Total Shift</th>
                  <th style={{ padding: '14px 18px', fontWeight: 800, color: 'var(--muted)' }}>Break Time</th>
                  <th style={{ padding: '14px 18px', fontWeight: 800, color: 'var(--muted)' }}>In-Session Time</th>
                  <th style={{ padding: '14px 18px', fontWeight: 800, color: 'var(--muted)' }}>Utilization %</th>
                </tr>
              </thead>
              <tbody>
                {filteredList.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ padding: '30px', textAlign: 'center', color: 'var(--muted)' }}>
                      No counselor attendance records found for this date.
                    </td>
                  </tr>
                ) : (
                  filteredList.map((item, idx) => {
                    const shiftMins = item.totalWorkMinutes || 0;
                    const sessionMins = item.totalSessionMinutes || 0;
                    const breakMins = item.totalBreakMinutes || 0;
                    const utilizationPct = shiftMins > 0 ? Math.min(100, Math.round((sessionMins / shiftMins) * 100)) : 0;

                    const formatTime = (dt?: string) => {
                      if (!dt) return '—';
                      return new Date(dt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    };

                    // Status Badge Styling
                    let statusBg = '#f1f5f9';
                    let statusColor = '#64748b';
                    let statusBorder = '#cbd5e1';

                    if (item.liveStatus === 'Available') {
                      statusBg = '#dcfce7'; statusColor = '#15803d'; statusBorder = '#86efac';
                    } else if (item.liveStatus === 'In Session') {
                      statusBg = '#e0f2fe'; statusColor = '#0369a1'; statusBorder = '#7dd3fc';
                    } else if (item.liveStatus.startsWith('Break')) {
                      statusBg = '#fed7aa'; statusColor = '#c2410c'; statusBorder = '#fdba74';
                    } else if (item.liveStatus === '5m Buffer') {
                      statusBg = '#fef3c7'; statusColor = '#b45309'; statusBorder = '#fcd34d';
                    }

                    return (
                      <tr
                        key={item.counselorId || idx}
                        style={{
                          borderBottom: '1px solid var(--border-color, #f1f5f9)',
                          transition: 'background 0.15s ease',
                        }}
                      >
                        {/* Counselor Name */}
                        <td style={{ padding: '14px 18px', fontWeight: 800, color: 'var(--text)' }}>
                          {item.name}
                        </td>

                        {/* Campus */}
                        <td style={{ padding: '14px 18px', color: 'var(--muted)', fontSize: '0.82rem' }}>
                          {item.branchName || item.location}
                        </td>

                        {/* Live Status */}
                        <td style={{ padding: '14px 18px' }}>
                          <span style={{
                            fontSize: '0.75rem',
                            fontWeight: 800,
                            padding: '4px 10px',
                            borderRadius: '9999px',
                            background: statusBg,
                            color: statusColor,
                            border: `1px solid ${statusBorder}`,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}>
                            {item.liveStatus}
                          </span>
                        </td>

                        {/* Clock In */}
                        <td style={{ padding: '14px 18px', fontWeight: 700, color: 'var(--text)' }}>
                          {formatTime(item.clockIn)}
                        </td>

                        {/* Clock Out */}
                        <td style={{ padding: '14px 18px', fontWeight: 700, color: item.clockOut ? 'var(--text)' : 'var(--muted)' }}>
                          {item.clockOut ? formatTime(item.clockOut) : (item.clockIn ? 'Active' : '—')}
                        </td>

                        {/* Total Shift */}
                        <td style={{ padding: '14px 18px', fontWeight: 700, color: 'var(--text)' }}>
                          {shiftMins > 0 ? `${Math.floor(shiftMins / 60)}h ${shiftMins % 60}m` : '—'}
                        </td>

                        {/* Break Time */}
                        <td style={{ padding: '14px 18px', color: breakMins > 0 ? '#ea580c' : 'var(--muted)', fontWeight: 700 }}>
                          {breakMins > 0 ? `${breakMins} mins` : '0m'}
                        </td>

                        {/* In-Session Time */}
                        <td style={{ padding: '14px 18px', color: '#0284c7', fontWeight: 800 }}>
                          {sessionMins > 0 ? `${Math.floor(sessionMins / 60)}h ${sessionMins % 60}m` : '0m'}
                          <span style={{ fontSize: '0.72rem', color: 'var(--muted)', display: 'block', fontWeight: 500 }}>
                            ({item.completedSessionsCount} completed)
                          </span>
                        </td>

                        {/* Utilization Bar */}
                        <td style={{ padding: '14px 18px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{
                              flex: 1,
                              height: '8px',
                              background: '#e2e8f0',
                              borderRadius: '9999px',
                              overflow: 'hidden',
                              minWidth: '60px',
                            }}>
                              <div style={{
                                height: '100%',
                                width: `${utilizationPct}%`,
                                background: utilizationPct > 70 ? '#16a34a' : (utilizationPct > 40 ? '#0284c7' : '#f59e0b'),
                                borderRadius: '9999px',
                              }} />
                            </div>
                            <span style={{ fontWeight: 800, fontSize: '0.78rem', minWidth: '32px' }}>
                              {utilizationPct}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
