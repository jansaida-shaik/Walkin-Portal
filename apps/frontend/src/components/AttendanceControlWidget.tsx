'use client';

import React, { useState, useEffect } from 'react';
import { clockIn, clockOut, startBreak, endBreak, completeBuffer, getTodayAttendance } from '../actions/attendanceActions';

interface AttendanceControlWidgetProps {
  counselorId: string;
  counselorName?: string;
  branchId?: string;
  onStatusChange?: (newStatus: string) => void;
}

export default function AttendanceControlWidget({
  counselorId,
  counselorName = 'Counselor',
  branchId,
  onStatusChange,
}: AttendanceControlWidgetProps) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [showBreakModal, setShowBreakModal] = useState(false);
  const [selectedBreakType, setSelectedBreakType] = useState('Lunch');
  const [breakReason, setBreakReason] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Live seconds ticker for active timers
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const refreshData = async () => {
    if (!counselorId) return;
    const res = await getTodayAttendance(counselorId, branchId);
    if (res.success) {
      setData(res);
      if (onStatusChange && res.counselorStatus) {
        onStatusChange(res.counselorStatus);
      }
    }
  };

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, [counselorId, branchId]);

  const attendance = data?.attendance;
  const isClockedIn = attendance && !attendance.clockOut;
  const activeBreak = data?.activeBreak;
  const isBuffer = activeBreak?.breakType === 'SessionBuffer';
  const waitingCount = data?.waitingQueueCount || 0;

  // Compute live elapsed times
  const computeElapsedTime = (startTimeStr?: string) => {
    if (!startTimeStr) return '00:00:00';
    const diffSecs = Math.max(0, Math.floor((now - new Date(startTimeStr).getTime()) / 1000));
    const h = String(Math.floor(diffSecs / 3600)).padStart(2, '0');
    const m = String(Math.floor((diffSecs % 3600) / 60)).padStart(2, '0');
    const s = String(diffSecs % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  // Compute 5-minute buffer countdown
  const computeBufferCountdown = (startTimeStr?: string) => {
    if (!startTimeStr) return '05:00';
    const elapsedSecs = Math.floor((now - new Date(startTimeStr).getTime()) / 1000);
    const remainingSecs = Math.max(0, 300 - elapsedSecs);
    const m = String(Math.floor(remainingSecs / 60)).padStart(2, '0');
    const s = String(remainingSecs % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  // Handlers
  const handleClockIn = async () => {
    setLoading(true);
    setErrorMessage(null);
    const res = await clockIn(counselorId);
    setLoading(false);
    if (!res.success) {
      setErrorMessage(res.error);
    } else {
      await refreshData();
    }
  };

  const handleClockOut = async () => {
    if (!confirm('Are you sure you want to clock out for today?')) return;
    setLoading(true);
    setErrorMessage(null);
    const res = await clockOut(counselorId);
    setLoading(false);
    if (!res.success) {
      setErrorMessage(res.error);
    } else {
      await refreshData();
    }
  };

  const handleStartBreak = async () => {
    setLoading(true);
    setErrorMessage(null);
    const res = await startBreak(counselorId, selectedBreakType, breakReason);
    setLoading(false);
    if (!res.success) {
      setErrorMessage(res.error);
    } else {
      setShowBreakModal(false);
      await refreshData();
    }
  };

  const handleEndBreak = async () => {
    setLoading(true);
    setErrorMessage(null);
    const res = await endBreak(counselorId);
    setLoading(false);
    if (!res.success) {
      setErrorMessage(res.error);
    } else {
      await refreshData();
    }
  };

  const handleReadyNow = async () => {
    setLoading(true);
    setErrorMessage(null);
    const res = await completeBuffer(counselorId);
    setLoading(false);
    if (!res.success) {
      setErrorMessage(res.error);
    } else {
      await refreshData();
    }
  };

  return (
    <div style={{
      background: 'var(--card-bg, #ffffff)',
      border: '1px solid var(--border-color, #e2e8f0)',
      borderRadius: '16px',
      padding: '16px 20px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '16px',
      marginBottom: '20px',
      position: 'relative',
    }}>
      {/* ── LEFT: STATUS CHIP & ACTIVE DUTY INFO ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
        <div style={{
          width: '42px',
          height: '42px',
          borderRadius: '12px',
          background: isClockedIn 
            ? (activeBreak ? (isBuffer ? '#fef3c7' : '#fed7aa') : (data?.counselorStatus === 'Busy' ? '#e0f2fe' : '#dcfce7')) 
            : '#f1f5f9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.4rem',
        }}>
          {isClockedIn 
            ? (activeBreak ? (isBuffer ? '⏳' : '☕') : (data?.counselorStatus === 'Busy' ? '💬' : '🟢')) 
            : '🚪'}
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: 800, fontSize: '0.98rem', color: 'var(--text, #0f172a)' }}>
              {counselorName}
            </span>
            
            {/* Status Badge */}
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 800,
              padding: '3px 10px',
              borderRadius: '9999px',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              background: isClockedIn
                ? (activeBreak 
                    ? (isBuffer ? '#fef3c7' : '#fed7aa') 
                    : (data?.counselorStatus === 'Busy' ? '#e0f2fe' : '#dcfce7'))
                : '#f1f5f9',
              color: isClockedIn
                ? (activeBreak 
                    ? (isBuffer ? '#b45309' : '#c2410c') 
                    : (data?.counselorStatus === 'Busy' ? '#0369a1' : '#15803d'))
                : '#64748b',
              border: `1px solid ${
                isClockedIn
                  ? (activeBreak 
                      ? (isBuffer ? '#fcd34d' : '#fdba74') 
                      : (data?.counselorStatus === 'Busy' ? '#7dd3fc' : '#86efac'))
                  : '#cbd5e1'
              }`
            }}>
              {isClockedIn
                ? (activeBreak 
                    ? (isBuffer ? '⏳ 5m Wrap-up Buffer' : `☕ On Break (${activeBreak.breakType})`) 
                    : (data?.counselorStatus === 'Busy' ? '💬 In Session' : '🟢 Available (Ready)'))
                : '🚪 Clocked Out'}
            </span>
          </div>

          {/* Subtitle / Active timer */}
          <div style={{ fontSize: '0.8rem', color: 'var(--muted, #64748b)', marginTop: '2px', display: 'flex', gap: '12px' }}>
            {isClockedIn && (
              <>
                <span>Shift: <strong style={{ color: 'var(--text)' }}>{computeElapsedTime(attendance?.clockIn)}</strong></span>
                {activeBreak && !isBuffer && (
                  <span style={{ color: '#ea580c' }}>Break elapsed: <strong>{computeElapsedTime(activeBreak?.startTime)}</strong></span>
                )}
                {isBuffer && (
                  <span style={{ color: '#d97706' }}>Buffer remaining: <strong>{computeBufferCountdown(activeBreak?.startTime)}</strong></span>
                )}
                <span>Sessions today: <strong style={{ color: 'var(--text)' }}>{data?.completedSessionsCount || 0}</strong></span>
              </>
            )}
            {!isClockedIn && (
              <span>Shift not started. Click Clock In to begin receiving student walk-ins.</span>
            )}
          </div>
        </div>
      </div>

      {/* ── RIGHT: ACTION BUTTONS ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        {/* Error Alert if any */}
        {errorMessage && (
          <div style={{
            fontSize: '0.78rem',
            color: '#dc2626',
            background: '#fef2f2',
            border: '1px solid #fca5a5',
            padding: '6px 12px',
            borderRadius: '8px',
            maxWidth: '280px',
            lineHeight: 1.3
          }}>
            ⚠️ {errorMessage}
          </div>
        )}

        {/* 1. CLOCK IN BUTTON */}
        {!isClockedIn ? (
          <button
            onClick={handleClockIn}
            disabled={loading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 18px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #16a34a, #15803d)',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '0.88rem',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 12px rgba(22, 163, 74, 0.25)',
              transition: 'transform 0.15s ease',
            }}
          >
            ⏱️ {loading ? 'Clocking In...' : 'Clock In for Shift'}
          </button>
        ) : (
          <>
            {/* 2. BUFFER READY NOW BUTTON */}
            {isBuffer && (
              <button
                onClick={handleReadyNow}
                disabled={loading}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '9px 16px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
                }}
              >
                ⚡ Ready Now (Skip Buffer)
              </button>
            )}

            {/* 3. RESUME WORK BUTTON (If on manual break) */}
            {activeBreak && !isBuffer && (
              <button
                onClick={handleEndBreak}
                disabled={loading}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '9px 16px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                }}
              >
                ▶️ Resume Work (End Break)
              </button>
            )}

            {/* 4. TAKE BREAK BUTTON (Only when not already on break/buffer) */}
            {!activeBreak && (
              <button
                onClick={() => {
                  setErrorMessage(null);
                  setShowBreakModal(true);
                }}
                disabled={loading}
                title={waitingCount > 0 ? `Cannot take break while ${waitingCount} student(s) in queue` : 'Take Break'}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '9px 16px',
                  borderRadius: '10px',
                  background: 'var(--card-bg, #ffffff)',
                  border: '1.5px solid #fed7aa',
                  color: '#ea580c',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                ☕ Take Break
                {waitingCount > 0 && (
                  <span style={{
                    background: '#ef4444',
                    color: '#fff',
                    fontSize: '0.65rem',
                    padding: '1px 6px',
                    borderRadius: '9999px',
                    marginLeft: '4px'
                  }}>
                    Queue: {waitingCount}
                  </span>
                )}
              </button>
            )}

            {/* 5. CLOCK OUT BUTTON */}
            <button
              onClick={handleClockOut}
              disabled={loading}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 16px',
                borderRadius: '10px',
                background: 'var(--card-bg, #ffffff)',
                border: '1.5px solid var(--border-color, #e2e8f0)',
                color: '#64748b',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              🚪 Clock Out
            </button>
          </>
        )}
      </div>

      {/* ── BREAK SELECTION MODAL ── */}
      {showBreakModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.55)',
          backdropFilter: 'blur(4px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
        }}>
          <div style={{
            background: 'var(--card-bg, #ffffff)',
            borderRadius: '18px',
            padding: '28px',
            width: '100%',
            maxWidth: '440px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
            border: '1px solid var(--border-color, #e2e8f0)',
          }}>
            <h3 style={{ margin: '0 0 6px', fontSize: '1.25rem', fontWeight: 900, color: 'var(--text, #0f172a)' }}>
              ☕ Select Break Type
            </h3>
            <p style={{ margin: '0 0 16px', fontSize: '0.85rem', color: 'var(--muted, #64748b)' }}>
              Taking a break temporarily pauses automatic student walk-in assignments.
            </p>

            {/* Warning if queue has waiting students */}
            {waitingCount > 0 && (
              <div style={{
                background: '#fef2f2',
                border: '1.5px solid #fca5a5',
                color: '#b91c1c',
                padding: '10px 14px',
                borderRadius: '10px',
                fontSize: '0.82rem',
                fontWeight: 700,
                marginBottom: '16px',
                lineHeight: 1.4
              }}>
                ⚠️ <strong>Queue Busy:</strong> There {waitingCount === 1 ? 'is 1 student' : `are ${waitingCount} students`} waiting in the queue. You must serve waiting students before taking a break.
              </div>
            )}

            {/* Break options */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
              {[
                { type: 'Lunch', icon: '🍱', label: 'Lunch Break (30m)' },
                { type: 'Tea Break', icon: '☕', label: 'Tea Break (15m)' },
                { type: 'Meeting', icon: '💼', label: 'Team Meeting (30m)' },
                { type: 'Personal', icon: '🚻', label: 'Personal (10m)' },
              ].map(opt => (
                <button
                  key={opt.type}
                  type="button"
                  onClick={() => setSelectedBreakType(opt.type)}
                  style={{
                    padding: '12px',
                    borderRadius: '12px',
                    border: selectedBreakType === opt.type ? '2px solid #ea580c' : '1.5px solid #e2e8f0',
                    background: selectedBreakType === opt.type ? '#fff7ed' : 'var(--card-bg, #ffffff)',
                    color: selectedBreakType === opt.type ? '#c2410c' : 'var(--text)',
                    fontWeight: 800,
                    fontSize: '0.82rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span style={{ fontSize: '1.4rem' }}>{opt.icon}</span>
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text)' }}>
                Optional Notes / Remarks:
              </label>
              <input
                type="text"
                value={breakReason}
                onChange={e => setBreakReason(e.target.value)}
                placeholder="e.g. Heading for lunch with team..."
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1.5px solid var(--border-color, #cbd5e1)',
                  background: 'var(--input-bg, #ffffff)',
                  color: 'var(--text)',
                  fontSize: '0.85rem',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setShowBreakModal(false)}
                style={{
                  padding: '10px 18px',
                  borderRadius: '10px',
                  background: '#f1f5f9',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  color: '#475569',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              
              <button
                type="button"
                onClick={handleStartBreak}
                disabled={loading || waitingCount > 0}
                style={{
                  padding: '10px 20px',
                  borderRadius: '10px',
                  background: waitingCount > 0 ? '#94a3b8' : 'linear-gradient(135deg, #ea580c, #c2410c)',
                  border: 'none',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  color: '#ffffff',
                  cursor: (loading || waitingCount > 0) ? 'not-allowed' : 'pointer',
                  boxShadow: waitingCount > 0 ? 'none' : '0 4px 12px rgba(234, 88, 12, 0.3)',
                }}
              >
                {loading ? 'Starting Break...' : 'Start Break Now'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
