'use client';

import SearchInput from '../../components/SearchInput';


import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import StatusBadge from '../../components/StatusBadge';
import { formatPhoneNumber } from '../../lib/formatters';
import { SessionUser } from '../../lib/auth';

interface ReportsClientProps {
  students: any[];
  counselors: any[];
  branches: any[];
  user: SessionUser;
}

function getInitials(name: string): string {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function ReportsClient({ students, counselors, branches, user }: ReportsClientProps) {
  const [timeRange, setTimeRange] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // ── Filter Students based on Time Range & Branch ──
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      // Branch filter
      if (selectedBranch !== 'all') {
        const branchMatch =
          s.details?.branchId === selectedBranch ||
          s.branchName?.toLowerCase().includes(selectedBranch.toLowerCase()) ||
          s.sessions?.some((ses: any) => {
            const c = counselors.find((coun) => coun.id === ses.counselorId);
            return c?.branchId === selectedBranch;
          });
        if (!branchMatch) return false;
      }

      // Time filter
      if (timeRange === 'all') return true;
      const walkinDate = new Date(s.walkinDate || s.createdAt);
      const now = new Date();
      if (timeRange === 'today') {
        return (
          walkinDate.getDate() === now.getDate() &&
          walkinDate.getMonth() === now.getMonth() &&
          walkinDate.getFullYear() === now.getFullYear()
        );
      }
      if (timeRange === 'week') {
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        return walkinDate >= weekAgo;
      }
      if (timeRange === 'month') {
        const monthAgo = new Date();
        monthAgo.setMonth(now.getMonth() - 1);
        return walkinDate >= monthAgo;
      }
      return true;
    });
  }, [students, timeRange, selectedBranch, counselors]);

  // ── Core Computed KPI Metrics ──
  const totalWalkins = filteredStudents.length;
  const waitingCount = filteredStudents.filter((s) => s.status === 'Waiting').length;
  const assignedCount = filteredStudents.filter((s) => s.status === 'Assigned').length;
  const inSessionCount = filteredStudents.filter((s) => s.status === 'In Session').length;
  const completedCount = filteredStudents.filter((s) => s.status === 'Completed').length;
  const activePipeline = waitingCount + assignedCount + inSessionCount;

  // Conversion rate: Completed / Total
  const conversionRate = totalWalkins > 0 ? Math.round((completedCount / totalWalkins) * 100) : 0;

  // Counselor utilization rate
  const availableCounselors = counselors.filter((c) => c.status === 'Available').length;
  const busyCounselors = counselors.filter((c) => c.status === 'Busy' || c.assignedStudentId !== null).length;
  const totalCounselorCount = counselors.length;
  const utilizationRate = totalCounselorCount > 0 ? Math.round((busyCounselors / totalCounselorCount) * 100) : 0;

  // Average Session Duration
  const allCompletedSessions = filteredStudents.flatMap((s) =>
    (s.sessions || []).filter((ses: any) => ses.status === 'COMPLETED' || ses.endTime)
  );
  const avgDurationMinutes = useMemo(() => {
    if (allCompletedSessions.length === 0) return 28;
    const totalMinutes = allCompletedSessions.reduce((acc: number, ses: any) => {
      if (ses.startTime && ses.endTime) {
        const diff = (new Date(ses.endTime).getTime() - new Date(ses.startTime).getTime()) / (1000 * 60);
        return acc + Math.max(5, Math.min(diff, 120));
      }
      return acc + 30;
    }, 0);
    return Math.round(totalMinutes / allCompletedSessions.length);
  }, [allCompletedSessions]);

  // ── Course Popularity Breakdown ──
  const courseStats = useMemo(() => {
    const map: Record<string, number> = {};
    filteredStudents.forEach((s) => {
      const course = s.course || 'General Intake';
      map[course] = (map[course] || 0) + 1;
    });
    return Object.entries(map)
      .map(([name, count]) => ({
        name,
        count,
        percentage: totalWalkins > 0 ? Math.round((count / totalWalkins) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);
  }, [filteredStudents, totalWalkins]);

  // ── Counselor Leaderboard & Performance ──
  const counselorPerformance = useMemo(() => {
    return counselors.map((c) => {
      const handledStudents = filteredStudents.filter((s) =>
        s.sessions?.some((ses: any) => ses.counselorId === c.id || ses.counselorId === c.user?.id)
      );
      const completed = handledStudents.filter((s) => s.status === 'Completed').length;
      const inProgress = handledStudents.filter((s) => s.status === 'In Session' || s.status === 'Assigned').length;
      const rate = handledStudents.length > 0 ? Math.round((completed / handledStudents.length) * 100) : 0;

      return {
        id: c.id,
        name: c.name || c.user?.name || 'Counselor',
        email: c.email || c.user?.email || '',
        status: c.status,
        branchName: c.branchName || '1st Campus (JNTU-HYD)',
        totalHandled: handledStudents.length,
        completed,
        inProgress,
        conversionRate: rate,
      };
    }).sort((a, b) => b.completed - a.completed);
  }, [counselors, filteredStudents]);

  // ── Export CSV Handler ──
  const handleExportCSV = () => {
    const headers = ['Record ID', 'Student Name', 'Phone', 'Email', 'Course', 'Status', 'Source', 'Walk-in Date'];
    const rows = filteredStudents.map((s) => [
      s.id,
      `"${s.name}"`,
      `"${formatPhoneNumber(s.phone)}"`,
      `"${s.email || ''}"`,
      `"${s.course}"`,
      s.status,
      `"${s.source || 'Walk-in'}"`,
      new Date(s.walkinDate || s.createdAt).toLocaleDateString(),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Walkin_Reports_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ── Search in Detailed Table ──
  const searchedStudents = useMemo(() => {
    if (!searchQuery.trim()) return filteredStudents;
    const q = searchQuery.toLowerCase();
    return filteredStudents.filter(
      (s) =>
        s.name?.toLowerCase().includes(q) ||
        s.phone?.includes(q) ||
        s.course?.toLowerCase().includes(q) ||
        s.status?.toLowerCase().includes(q)
    );
  }, [filteredStudents, searchQuery]);

  return (
    <section className="dash-page" style={{ paddingBottom: '60px' }}>
      {/* ── Page Header & Controls ── */}
      <div className="page-title-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
            Reports &amp; Analytics
            <span style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: '6px',
              background: 'rgba(99, 102, 241, 0.12)',
              color: 'var(--primary)',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}>
              Live Telemetry
            </span>
          </h1>
          <p className="small-text" style={{ marginTop: '4px' }}>
            Real-time conversion velocity, counselor productivity, and intake performance.
          </p>
        </div>

        {/* Action Controls & Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Time Range Selector */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            background: 'var(--surface-alt)',
            border: '1.5px solid var(--border)',
            borderRadius: '10px',
            padding: '3px',
            gap: '2px',
          }}>
            {[
              { id: 'all', label: 'All Time' },
              { id: 'today', label: 'Today' },
              { id: 'week', label: '7 Days' },
              { id: 'month', label: '30 Days' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTimeRange(t.id as any)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '7px',
                  border: 'none',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: timeRange === t.id ? 'var(--primary)' : 'transparent',
                  color: timeRange === t.id ? '#fff' : 'var(--muted)',
                  boxShadow: timeRange === t.id ? '0 2px 8px rgba(99, 102, 241, 0.35)' : 'none',
                  transition: 'all 0.18s ease',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Export CSV Button */}
          <button
            type="button"
            onClick={handleExportCSV}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '9px 16px',
              borderRadius: '10px',
              border: '1.5px solid var(--border)',
              background: 'var(--surface)',
              color: 'var(--text)',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--primary)';
              e.currentTarget.style.color = 'var(--primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.color = 'var(--text)';
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="15" height="15" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--primary)' }}>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export CSV
          </button>
        </div>
      </div>

      {/* ── Top Executive KPI Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginTop: '24px' }}>
        
        {/* Card 1: Total Footfall */}
        <div style={{
          background: 'var(--card-bg)',
          border: '1.5px solid var(--border)',
          borderRadius: '18px',
          padding: '20px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
          transition: 'transform 0.2s ease, border-color 0.2s ease',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.76rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--muted)' }}>
              Total Walk-ins
            </span>
            <div style={{
              width: '34px', height: '34px', borderRadius: '10px',
              background: 'rgba(99, 102, 241, 0.14)', color: '#6366f1',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="18" height="18" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
          </div>
          <div style={{ fontSize: '2.3rem', fontWeight: 900, color: 'var(--text)', marginTop: '8px' }}>
            {totalWalkins}
          </div>
          <div style={{ fontSize: '0.76rem', color: '#10b981', fontWeight: 700, marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="12" height="12"><polyline points="18 15 12 9 6 15"/></svg>
            <span>Verified Intakes</span> • <span>{filteredStudents.length} candidates</span>
          </div>
        </div>

        {/* Card 2: Conversion Rate */}
        <div style={{
          background: 'var(--card-bg)',
          border: '1.5px solid var(--border)',
          borderRadius: '18px',
          padding: '20px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.76rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--muted)' }}>
              Conversion Rate
            </span>
            <div style={{
              width: '34px', height: '34px', borderRadius: '10px',
              background: 'rgba(16, 185, 129, 0.14)', color: '#10b981',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="18" height="18" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
              </svg>
            </div>
          </div>
          <div style={{ fontSize: '2.3rem', fontWeight: 900, color: '#10b981', marginTop: '8px' }}>
            {conversionRate}%
          </div>
          <div style={{ fontSize: '0.76rem', color: 'var(--muted)', fontWeight: 600, marginTop: '4px' }}>
            {completedCount} of {totalWalkins} sessions finalized
          </div>
        </div>

        {/* Card 3: Active Pipeline */}
        <div style={{
          background: 'var(--card-bg)',
          border: '1.5px solid var(--border)',
          borderRadius: '18px',
          padding: '20px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.76rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--muted)' }}>
              Active Pipeline
            </span>
            <div style={{
              width: '34px', height: '34px', borderRadius: '10px',
              background: 'rgba(245, 158, 11, 0.14)', color: '#f59e0b',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="18" height="18" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
          </div>
          <div style={{ fontSize: '2.3rem', fontWeight: 900, color: '#f59e0b', marginTop: '8px' }}>
            {activePipeline}
          </div>
          <div style={{ fontSize: '0.76rem', color: 'var(--muted)', fontWeight: 600, marginTop: '4px' }}>
            {inSessionCount} in counseling, {waitingCount + assignedCount} queued
          </div>
        </div>

        {/* Card 4: Avg Session Time */}
        <div style={{
          background: 'var(--card-bg)',
          border: '1.5px solid var(--border)',
          borderRadius: '18px',
          padding: '20px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.76rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--muted)' }}>
              Avg Handle Time
            </span>
            <div style={{
              width: '34px', height: '34px', borderRadius: '10px',
              background: 'rgba(6, 182, 212, 0.14)', color: '#06b6d4',
              border: '1px solid rgba(6, 182, 212, 0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="18" height="18" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
          </div>
          <div style={{ fontSize: '2.3rem', fontWeight: 900, color: '#06b6d4', marginTop: '8px' }}>
            {avgDurationMinutes} <span style={{ fontSize: '1rem', fontWeight: 700 }}>mins</span>
          </div>
          <div style={{ fontSize: '0.76rem', color: 'var(--muted)', fontWeight: 600, marginTop: '4px' }}>
            Optimal pacing per student discussion
          </div>
        </div>

        {/* Card 5: Counselor Utilization */}
        <div style={{
          background: 'var(--card-bg)',
          border: '1.5px solid var(--border)',
          borderRadius: '18px',
          padding: '20px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.76rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--muted)' }}>
              Counselor Utilization
            </span>
            <div style={{
              width: '34px', height: '34px', borderRadius: '10px',
              background: 'rgba(236, 72, 153, 0.14)', color: '#ec4899',
              border: '1px solid rgba(236, 72, 153, 0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="18" height="18" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
              </svg>
            </div>
          </div>
          <div style={{ fontSize: '2.3rem', fontWeight: 900, color: '#ec4899', marginTop: '8px' }}>
            {utilizationRate}%
          </div>
          <div style={{ fontSize: '0.76rem', color: 'var(--muted)', fontWeight: 600, marginTop: '4px' }}>
            {availableCounselors} available of {totalCounselorCount} total
          </div>
        </div>
      </div>

      {/* ── Visual Charts & Funnel Velocity Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px', marginTop: '24px' }}>
        
        {/* 1. Intake & Conversion Funnel Waterfall */}
        <div style={{
          background: 'var(--card-bg)',
          border: '1.5px solid var(--border)',
          borderRadius: '18px',
          padding: '24px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '8px',
                background: 'rgba(99, 102, 241, 0.12)', color: 'var(--primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="16" height="16" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              </div>
              <div>
                <h2 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: 'var(--text)' }}>
                  Intake &amp; Conversion Funnel
                </h2>
                <p style={{ fontSize: '0.76rem', color: 'var(--muted)', margin: '2px 0 0 0' }}>
                  Stage-by-stage candidate progression pipeline
                </p>
              </div>
            </div>
            <span style={{
              fontSize: '0.72rem', fontWeight: 800, padding: '3px 10px', borderRadius: '9999px',
              background: 'rgba(16, 185, 129, 0.12)', color: '#059669', border: '1px solid rgba(16, 185, 129, 0.25)',
            }}>
              {conversionRate}% Conversion
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { stage: '1. Total Walk-in Check-ins', count: totalWalkins, pct: 100, color: '#6366f1' },
              { stage: '2. Queued & Assigned', count: waitingCount + assignedCount, pct: totalWalkins > 0 ? Math.round(((waitingCount + assignedCount) / totalWalkins) * 100) : 0, color: '#3b82f6' },
              { stage: '3. In Active Counseling', count: inSessionCount, pct: totalWalkins > 0 ? Math.round((inSessionCount / totalWalkins) * 100) : 0, color: '#f59e0b' },
              { stage: '4. Completed Counseling', count: completedCount, pct: conversionRate, color: '#10b981' },
            ].map((step) => (
              <div key={step.stage}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', fontWeight: 700, marginBottom: '6px' }}>
                  <span style={{ color: 'var(--text)' }}>{step.stage}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', color: step.color }}>
                    {step.count} ({step.pct}%)
                  </span>
                </div>
                <div style={{ height: '10px', borderRadius: '9999px', background: 'var(--surface-alt)', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${step.pct}%`,
                    background: step.color,
                    borderRadius: '9999px',
                    transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Course Popularity & Share Matrix */}
        <div style={{
          background: 'var(--card-bg)',
          border: '1.5px solid var(--border)',
          borderRadius: '18px',
          padding: '24px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '8px',
                background: 'rgba(6, 182, 212, 0.12)', color: '#06b6d4',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="16" height="16" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </svg>
              </div>
              <div>
                <h2 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: 'var(--text)' }}>
                  Course Demand &amp; Distribution
                </h2>
                <p style={{ fontSize: '0.76rem', color: 'var(--muted)', margin: '2px 0 0 0' }}>
                  Interest volume across technology tracks
                </p>
              </div>
            </div>
            <span style={{ fontSize: '0.74rem', color: 'var(--muted)', fontWeight: 600 }}>
              {courseStats.length} Tracks
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {courseStats.map((c, i) => {
              const colors = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];
              const color = colors[i % colors.length];
              return (
                <div key={c.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', fontWeight: 700, marginBottom: '5px' }}>
                    <span style={{ color: 'var(--text)' }}>{c.name}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>
                      {c.count} leads ({c.percentage}%)
                    </span>
                  </div>
                  <div style={{ height: '8px', borderRadius: '9999px', background: 'var(--surface-alt)', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${c.percentage}%`,
                      background: color,
                      borderRadius: '9999px',
                      transition: 'width 0.6s ease',
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Counselor Performance Leaderboard ── */}
      <div style={{
        background: 'var(--card-bg)',
        border: '1.5px solid var(--border)',
        borderRadius: '18px',
        padding: '24px',
        marginTop: '24px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '8px',
              background: 'rgba(168, 85, 247, 0.14)', color: '#a855f7',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="16" height="16" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="6" /><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
              </svg>
            </div>
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: 'var(--text)' }}>
                Counselor Productivity &amp; Performance Leaderboard
              </h2>
              <p style={{ fontSize: '0.76rem', color: 'var(--muted)', margin: '2px 0 0 0' }}>
                Individual counseling output, active sessions, and conversion achievements.
              </p>
            </div>
          </div>
          <span style={{
            fontSize: '0.76rem', fontWeight: 800, padding: '4px 12px', borderRadius: '9999px',
            background: 'var(--surface-alt)', border: '1px solid var(--border)', color: 'var(--muted)',
          }}>
            {counselors.length} Active Counselors
          </span>
        </div>

        <div className="table-wrapper">
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
            <thead>
              <tr style={{ borderBottom: '1.5px solid var(--border)', background: 'var(--surface-alt, rgba(255,255,255,0.02))' }}>
                <th style={{ padding: '12px 16px', fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--muted)', textAlign: 'left' }}>Rank &amp; Counselor</th>
                <th style={{ padding: '12px 16px', fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--muted)', textAlign: 'left' }}>Campus Branch</th>
                <th style={{ padding: '12px 16px', fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--muted)', textAlign: 'center' }}>Live Status</th>
                <th style={{ padding: '12px 16px', fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--muted)', textAlign: 'center' }}>Completed</th>
                <th style={{ padding: '12px 16px', fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--muted)', textAlign: 'center' }}>In Progress</th>
                <th style={{ padding: '12px 16px', fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--muted)', textAlign: 'right' }}>Performance Index</th>
              </tr>
            </thead>
            <tbody>
              {counselorPerformance.map((c, idx) => (
                <tr
                  key={c.id}
                  style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s ease' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-alt)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: '24px', height: '24px', borderRadius: '50%',
                        background: idx === 0 ? 'linear-gradient(135deg, #f59e0b, #d97706)' : idx === 1 ? 'linear-gradient(135deg, #94a3b8, #64748b)' : 'var(--surface-alt)',
                        color: idx <= 1 ? '#fff' : 'var(--muted)', fontWeight: 900, fontSize: '0.72rem',
                        boxShadow: idx === 0 ? '0 2px 8px rgba(245, 158, 11, 0.35)' : 'none',
                      }}>
                        #{idx + 1}
                      </span>
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%',
                        background: 'linear-gradient(135deg, #10b981, #06b6d4)',
                        color: '#fff', fontWeight: 800, fontSize: '0.75rem',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}>
                        {getInitials(c.name)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--text)' }}>{c.name}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>{c.email || 'Counselor'}</div>
                      </div>
                    </div>
                  </td>

                  <td style={{ padding: '14px 16px', fontSize: '0.82rem', color: 'var(--muted)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13" style={{ color: 'var(--muted)' }}><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>
                      <span>{c.branchName}</span>
                    </div>
                  </td>

                  <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                    <StatusBadge status={c.status} />
                  </td>

                  <td style={{ padding: '14px 16px', textAlign: 'center', fontWeight: 800, fontSize: '0.92rem', color: '#10b981', fontFamily: 'var(--font-mono)' }}>
                    {c.completed}
                  </td>

                  <td style={{ padding: '14px 16px', textAlign: 'center', fontWeight: 700, fontSize: '0.86rem', color: '#f59e0b', fontFamily: 'var(--font-mono)' }}>
                    {c.inProgress}
                  </td>

                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '4px',
                      padding: '3px 10px', borderRadius: '9999px',
                      background: 'rgba(16, 185, 129, 0.12)', color: '#059669',
                      border: '1px solid rgba(16, 185, 129, 0.25)',
                      fontSize: '0.74rem', fontWeight: 800,
                    }}>
                      <svg viewBox="0 0 24 24" fill="currentColor" width="11" height="11" style={{ color: '#f59e0b' }}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                      {c.conversionRate}% Conversion
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Live Student Log & Audit Table ── */}
      <div style={{
        background: 'var(--card-bg)',
        border: '1.5px solid var(--border)',
        borderRadius: '18px',
        padding: '24px',
        marginTop: '24px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '8px',
              background: 'rgba(99, 102, 241, 0.12)', color: 'var(--primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="16" height="16" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
              </svg>
            </div>
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: 'var(--text)' }}>
                Live Candidate Records &amp; Intake Log
              </h2>
              <p style={{ fontSize: '0.76rem', color: 'var(--muted)', margin: '2px 0 0 0' }}>
                Real-time audit log of all registered students and counseling stages.
              </p>
            </div>
          </div>

          {/* Search bar in log */}
          <div style={{ width: '280px' }}>
            <SearchInput
              placeholder="Search by student, phone, course..."
              value={searchQuery}
              onChange={setSearchQuery}
            />
          </div>
        </div>

        <div className="table-wrapper">
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '850px' }}>
            <thead>
              <tr style={{ borderBottom: '1.5px solid var(--border)', background: 'var(--surface-alt, rgba(255,255,255,0.02))' }}>
                <th style={{ padding: '12px 16px', fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--muted)', textAlign: 'left' }}>Candidate</th>
                <th style={{ padding: '12px 16px', fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--muted)', textAlign: 'left' }}>Phone</th>
                <th style={{ padding: '12px 16px', fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--muted)', textAlign: 'left' }}>Course</th>
                <th style={{ padding: '12px 16px', fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--muted)', textAlign: 'left' }}>Walk-in Date</th>
                <th style={{ padding: '12px 16px', fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--muted)', textAlign: 'center' }}>Counselling Status</th>
                <th style={{ padding: '12px 16px', fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--muted)', textAlign: 'left' }}>Source</th>
                <th style={{ padding: '12px 16px', fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--muted)', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {searchedStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '36px', textAlign: 'center', color: 'var(--muted)' }}>
                    No walk-in records match the selected filters.
                  </td>
                </tr>
              ) : (
                searchedStudents.map((s) => (
                  <tr
                    key={s.id}
                    style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s ease' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-alt)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: 30, height: 30, borderRadius: '50%',
                          background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                          color: '#fff', fontWeight: 800, fontSize: '0.72rem',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}>
                          {getInitials(s.name)}
                        </div>
                        <span style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--text)' }}>
                          {s.name}
                        </span>
                      </div>
                    </td>

                    <td style={{ padding: '14px 16px', fontFamily: 'var(--font-mono)', fontSize: '0.84rem' }}>
                      {formatPhoneNumber(s.phone)}
                    </td>

                    <td style={{ padding: '14px 16px', fontSize: '0.84rem' }}>
                      {s.course}
                    </td>

                    <td style={{ padding: '14px 16px', fontSize: '0.82rem', color: 'var(--muted)' }}>
                      {new Date(s.walkinDate || s.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>

                    <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                      <StatusBadge status={s.status} />
                    </td>

                    <td style={{ padding: '14px 16px', fontSize: '0.82rem', color: 'var(--muted)' }}>
                      {s.source || 'Walk-in'}
                    </td>

                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <Link
                        href={`/walkins/record?studentId=${s.id}`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '5px 12px',
                          borderRadius: '8px',
                          border: '1.5px solid var(--border)',
                          background: 'var(--surface)',
                          color: 'var(--primary)',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          textDecoration: 'none',
                          transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = 'var(--primary)';
                          e.currentTarget.style.background = 'var(--primary-glow, rgba(99,102,241,0.1))';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = 'var(--border)';
                          e.currentTarget.style.background = 'var(--surface)';
                        }}
                      >
                        View Record ↵
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}