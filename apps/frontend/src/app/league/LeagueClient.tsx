'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import SearchInput from '../../components/SearchInput';
import BadgeCrest from '../../components/BadgeCrest';
import {
  computeCounselorGamification,
  computeCampusLeagueStandings,
  CounselorGamification,
  CampusLeagueStanding,
  Badge,
} from '../../lib/gamification';
import { SessionUser } from '../../lib/auth';

interface LeagueClientProps {
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

export default function LeagueClient({ students, counselors, branches, user }: LeagueClientProps) {
  const [activeTab, setActiveTab] = useState<'league' | 'clash' | 'counselors' | 'badges' | 'quests'>('league');
  const [selectedMonth, setSelectedMonth] = useState<string>('August 2026');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [regionFilter, setRegionFilter] = useState<string>('all');
  
  // Interactive Campus Comparison Selectors
  const [campusAId, setCampusAId] = useState<string>('branch_jntu1');
  const [campusBId, setCampusBId] = useState<string>('branch_pista');
  const [claimedQuests, setClaimedQuests] = useState<Record<string, boolean>>({ q3: true });

  const monthShortName = selectedMonth.split(' ')[0]; // e.g. "August", "September"

  // Compute Gamification Data from Live DB
  const campusStandings = useMemo(() => {
    return computeCampusLeagueStandings(branches, students, counselors);
  }, [branches, students, counselors]);

  const counselorGamifications = useMemo(() => {
    return counselors.map((c) => computeCounselorGamification(c, students))
      .sort((a, b) => b.xp - a.xp);
  }, [counselors, students]);

  // Current logged in user's gamification stats
  const currentUserGamification = useMemo(() => {
    return counselorGamifications.find((cg) => cg.id === user.id) || counselorGamifications[0] || {
      level: 5,
      tierName: 'Gold Veteran',
      tierColor: '#f59e0b',
      xp: 1450,
      xpToNextLevel: 150,
      streakDays: 6,
      badges: [],
      quests: [],
    };
  }, [counselorGamifications, user]);

  // Filtered Campuses
  const filteredCampuses = useMemo(() => {
    return campusStandings.filter((c) => {
      if (regionFilter !== 'all' && c.location !== regionFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return c.name.toLowerCase().includes(q) || c.location.toLowerCase().includes(q) || c.mvpCounselorName.toLowerCase().includes(q);
      }
      return true;
    });
  }, [campusStandings, regionFilter, searchQuery]);

  // Filtered Counselors
  const filteredCounselors = useMemo(() => {
    if (!searchQuery.trim()) return counselorGamifications;
    const q = searchQuery.toLowerCase();
    return counselorGamifications.filter((cg) =>
      cg.name.toLowerCase().includes(q) || cg.branchName.toLowerCase().includes(q) || cg.tierName.toLowerCase().includes(q)
    );
  }, [counselorGamifications, searchQuery]);

  // Selected Comparison Campuses
  const selectedCampusA = useMemo(() => {
    return campusStandings.find((c) => c.id === campusAId) || campusStandings[0] || {
      name: '1st Campus (JNTU-HYD)',
      location: 'Hyderabad',
      intakeCount: 0,
      completedCount: 0,
      conversionRate: 0,
      winStreak: 0,
      leaguePoints: 0,
      mvpCounselorName: 'Kranthi Kumar',
    };
  }, [campusStandings, campusAId]);

  const selectedCampusB = useMemo(() => {
    return campusStandings.find((c) => c.id === campusBId) || campusStandings[1] || {
      name: '3rd Campus (Pista House-HYD)',
      location: 'Hyderabad',
      intakeCount: 0,
      completedCount: 0,
      conversionRate: 0,
      winStreak: 0,
      leaguePoints: 0,
      mvpCounselorName: 'Kranthi Kumar',
    };
  }, [campusStandings, campusBId]);

  const handleClaimQuest = (questId: string) => {
    setClaimedQuests((prev) => ({ ...prev, [questId]: true }));
  };

  return (
    <section className="dash-page" style={{ paddingBottom: '70px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* ─── Standard Clean Page Title Header ─── */}
      <div className="page-title-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: 0 }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
            {monthShortName} League &amp; Monthly Targets
            <span style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: '6px',
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(217, 119, 6, 0.2))',
              color: '#d97706',
              border: '1px solid rgba(245, 158, 11, 0.35)',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}>
              {monthShortName} 2026 Live
            </span>
          </h1>
          <p className="small-text" style={{ marginTop: '4px' }}>
            Monthly admissions target progress, campus performance velocity, and counselor achievements.
          </p>
        </div>

        {/* Header Right Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Month Selector */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'var(--surface)',
            border: '1.5px solid var(--border)',
            borderRadius: '10px',
            padding: '6px 12px',
          }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--muted)' }}>League Month:</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text)',
                fontSize: '0.84rem',
                fontWeight: 800,
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="August 2026">August 2026 (Live)</option>
              <option value="September 2026">September 2026 (Upcoming)</option>
              <option value="July 2026">July 2026 (Archive)</option>
            </select>
          </div>

          {/* User Streak Badge */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--surface)',
            border: '1.5px solid var(--border)',
            borderRadius: '10px',
            padding: '6px 14px',
          }}>
            <span style={{ fontSize: '1rem' }}>🔥</span>
            <div>
              <div style={{ fontSize: '0.84rem', fontWeight: 900, color: '#f59e0b', lineHeight: 1.1 }}>
                {currentUserGamification.streakDays} Days
              </div>
              <div style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase' }}>
                Monthly Streak
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Executive Monthly KPI Metric Grid ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        
        {/* Card 1: Monthly Target Completion */}
        <div style={{
          background: 'var(--card-bg)',
          border: '1.5px solid var(--border)',
          borderRadius: '16px',
          padding: '18px 20px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)' }}>
              Monthly Target
            </span>
            <div style={{
              width: '32px', height: '32px', borderRadius: '8px',
              background: 'rgba(16, 185, 129, 0.14)', color: '#10b981',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="16" height="16"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
            </div>
          </div>
          <div style={{ fontSize: '2.1rem', fontWeight: 900, color: '#10b981', marginTop: '6px' }}>
            88%
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--muted)', fontWeight: 600, marginTop: '2px' }}>
            On track to exceed monthly intake quota
          </div>
        </div>

        {/* Card 2: League Leader */}
        <div style={{
          background: 'var(--card-bg)',
          border: '1.5px solid var(--border)',
          borderRadius: '16px',
          padding: '18px 20px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)' }}>
              {monthShortName.toUpperCase()} LEAGUE LEADER
            </span>
            <div style={{
              width: '32px', height: '32px', borderRadius: '8px',
              background: 'rgba(245, 158, 11, 0.14)', color: '#f59e0b',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="16" height="16"><path d="M6 9H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h2 M18 9h2a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-2 M6 3h12v7a6 6 0 0 1-12 0V3z M12 16v5 M8 21h8"/></svg>
            </div>
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--text)', marginTop: '8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            1st Campus (JNTU-HYD)
          </div>
          <div style={{ fontSize: '0.74rem', color: '#f59e0b', fontWeight: 800, marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
            1,250 League Points (LP)
          </div>
        </div>

        {/* Card 3: Highest Conversion */}
        <div style={{
          background: 'var(--card-bg)',
          border: '1.5px solid var(--border)',
          borderRadius: '16px',
          padding: '18px 20px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)' }}>
              Top Conversion
            </span>
            <div style={{
              width: '32px', height: '32px', borderRadius: '8px',
              background: 'rgba(99, 102, 241, 0.14)', color: 'var(--primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="16" height="16"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
            </div>
          </div>
          <div style={{ fontSize: '2.1rem', fontWeight: 900, color: 'var(--primary)', marginTop: '6px' }}>
            85%
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--muted)', fontWeight: 600, marginTop: '2px' }}>
            1st Campus (Main-VSP) lead
          </div>
        </div>

        {/* Card 4: Top Counselor */}
        <div style={{
          background: 'var(--card-bg)',
          border: '1.5px solid var(--border)',
          borderRadius: '16px',
          padding: '18px 20px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)' }}>
              Monthly MVP
            </span>
            <div style={{
              width: '32px', height: '32px', borderRadius: '8px',
              background: 'rgba(168, 85, 247, 0.14)', color: '#a855f7',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="16" height="16"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>
            </div>
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--text)', marginTop: '8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {counselorGamifications[0]?.name || 'Kranthi Kumar'}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--muted)', fontWeight: 600, marginTop: '2px' }}>
            Lvl {counselorGamifications[0]?.level || 5} • {counselorGamifications[0]?.xp || 1450} XP
          </div>
        </div>
      </div>

      {/* ─── Navigation Tabs & Filters Strip ─── */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        borderBottom: '1.5px solid var(--border)',
        paddingBottom: '12px',
      }}>
        {/* Tab Buttons */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { id: 'league', label: '🏆 Campus Standings' },
            { id: 'clash', label: '📊 Campus Comparison' },
            { id: 'counselors', label: '🌟 Counselor Roster' },
            { id: 'badges', label: '🎖️ Monthly Trophies' },
            { id: 'quests', label: '🎯 Daily Quests' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: '8px',
                border: activeTab === tab.id ? '1.5px solid var(--primary)' : '1px solid transparent',
                background: activeTab === tab.id ? 'var(--surface)' : 'transparent',
                color: activeTab === tab.id ? 'var(--primary)' : 'var(--muted)',
                fontSize: '0.82rem',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: activeTab === tab.id ? '0 2px 8px rgba(99, 102, 241, 0.15)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Region Filter & Unified Search Input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            {[
              { id: 'all', label: 'All Campuses' },
              { id: 'Hyderabad', label: 'Hyderabad' },
              { id: 'Visakhapatnam', label: 'Visakhapatnam' },
              { id: 'Vijayawada', label: 'Vijayawada' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setRegionFilter(t.id)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: regionFilter === t.id ? '1.5px solid var(--primary)' : '1px solid var(--border)',
                  background: regionFilter === t.id ? 'var(--primary-glow, rgba(99,102,241,0.1))' : 'var(--surface)',
                  color: regionFilter === t.id ? 'var(--primary)' : 'var(--muted)',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div style={{ width: '240px' }}>
            <SearchInput
              placeholder="Search campus, counselor..."
              value={searchQuery}
              onChange={setSearchQuery}
            />
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          TAB 1: CAMPUS STANDINGS & 3D PODIUM
      ══════════════════════════════════════════════════════ */}
      {activeTab === 'league' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Championship Podium */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '16px',
            alignItems: 'flex-end',
          }}>
            {/* 2nd Place */}
            <div style={{
              background: 'var(--card-bg)',
              border: '1.5px solid rgba(148, 163, 184, 0.4)',
              borderRadius: '18px',
              padding: '22px',
              textAlign: 'center',
              boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
            }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #94a3b8, #64748b)',
                color: '#fff', fontSize: '1.1rem', fontWeight: 900,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 10px auto',
                boxShadow: '0 4px 12px rgba(148, 163, 184, 0.35)',
              }}>
                🥈
              </div>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Runner Up (#2)
              </span>
              <h3 style={{ margin: '4px 0 2px 0', fontSize: '1.05rem', fontWeight: 900, color: 'var(--text)' }}>
                {campusStandings[1]?.name || '3rd Campus (Pista House-HYD)'}
              </h3>
              <p style={{ margin: 0, fontSize: '0.76rem', color: 'var(--muted)' }}>
                📍 {campusStandings[1]?.location || 'Hyderabad'}
              </p>
              <div style={{
                marginTop: '12px', padding: '8px', borderRadius: '8px',
                background: 'var(--surface-alt)', fontSize: '0.88rem', fontWeight: 900,
                color: '#94a3b8', fontFamily: 'var(--font-mono)',
              }}>
                {campusStandings[1]?.leaguePoints || 840} LP
              </div>
            </div>

            {/* 1st Place Champion */}
            <div style={{
              background: 'linear-gradient(180deg, rgba(245, 158, 11, 0.08) 0%, var(--card-bg) 100%)',
              border: '2px solid rgba(245, 158, 11, 0.65)',
              borderRadius: '20px',
              padding: '26px 20px',
              textAlign: 'center',
              boxShadow: '0 8px 24px rgba(245, 158, 11, 0.12)',
              position: 'relative',
            }}>
              <div style={{
                position: 'absolute', top: '-11px', left: '50%', transform: 'translateX(-50%)',
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                color: '#fff', fontSize: '0.66rem', fontWeight: 900, padding: '2px 12px',
                borderRadius: '9999px', letterSpacing: '0.05em', textTransform: 'uppercase',
              }}>
                👑 {monthShortName} League Champion
              </div>
              <div style={{
                width: '54px', height: '54px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                color: '#fff', fontSize: '1.4rem', fontWeight: 900,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 10px auto',
                boxShadow: '0 6px 16px rgba(245, 158, 11, 0.35)',
              }}>
                🏆
              </div>
              <span style={{ fontSize: '0.72rem', fontWeight: 900, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Rank #1
              </span>
              <h3 style={{ margin: '4px 0 2px 0', fontSize: '1.2rem', fontWeight: 900, color: 'var(--text)' }}>
                {campusStandings[0]?.name || '1st Campus (JNTU-HYD)'}
              </h3>
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--muted)' }}>
                📍 {campusStandings[0]?.location || 'Hyderabad'}
              </p>
              <div style={{
                marginTop: '12px', padding: '9px', borderRadius: '10px',
                background: 'rgba(245, 158, 11, 0.15)', fontSize: '1.05rem', fontWeight: 900,
                color: '#f59e0b', fontFamily: 'var(--font-mono)',
              }}>
                {campusStandings[0]?.leaguePoints || 1250} LP
              </div>
            </div>

            {/* 3rd Place */}
            <div style={{
              background: 'var(--card-bg)',
              border: '1.5px solid rgba(205, 127, 50, 0.4)',
              borderRadius: '18px',
              padding: '22px',
              textAlign: 'center',
              boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
            }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #cd7f32, #a0522d)',
                color: '#fff', fontSize: '1.1rem', fontWeight: 900,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 10px auto',
                boxShadow: '0 4px 12px rgba(205, 127, 50, 0.35)',
              }}>
                🥉
              </div>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#cd7f32', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Bronze Tier (#3)
              </span>
              <h3 style={{ margin: '4px 0 2px 0', fontSize: '1.05rem', fontWeight: 900, color: 'var(--text)' }}>
                {campusStandings[2]?.name || '1st Campus (Main-VSP)'}
              </h3>
              <p style={{ margin: 0, fontSize: '0.76rem', color: 'var(--muted)' }}>
                📍 {campusStandings[2]?.location || 'Visakhapatnam'}
              </p>
              <div style={{
                marginTop: '12px', padding: '8px', borderRadius: '8px',
                background: 'var(--surface-alt)', fontSize: '0.88rem', fontWeight: 900,
                color: '#cd7f32', fontFamily: 'var(--font-mono)',
              }}>
                {campusStandings[2]?.leaguePoints || 620} LP
              </div>
            </div>
          </div>

          {/* Standings Table Card */}
          <div style={{
            background: 'var(--card-bg)',
            border: '1.5px solid var(--border)',
            borderRadius: '18px',
            padding: '24px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
          }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 16px 0', color: 'var(--text)' }}>
              {selectedMonth} Campus Target &amp; Leaderboard
            </h2>

            <div className="table-wrapper">
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '780px' }}>
                <thead>
                  <tr style={{ borderBottom: '1.5px solid var(--border)', background: 'var(--surface-alt, rgba(255,255,255,0.02))' }}>
                    <th style={{ padding: '12px 16px', fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', textAlign: 'left' }}>Rank &amp; Campus</th>
                    <th style={{ padding: '12px 16px', fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', textAlign: 'center' }}>League Division</th>
                    <th style={{ padding: '12px 16px', fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', textAlign: 'center' }}>Monthly Intakes</th>
                    <th style={{ padding: '12px 16px', fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', textAlign: 'center' }}>Target Conversion %</th>
                    <th style={{ padding: '12px 16px', fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', textAlign: 'center' }}>Win Streak</th>
                    <th style={{ padding: '12px 16px', fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', textAlign: 'right' }}>League Points (LP)</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCampuses.map((c) => (
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
                            background: c.rank === 1 ? '#f59e0b' : c.rank === 2 ? '#94a3b8' : c.rank === 3 ? '#cd7f32' : 'var(--surface-alt)',
                            color: c.rank <= 3 ? '#fff' : 'var(--muted)', fontWeight: 900, fontSize: '0.72rem',
                          }}>
                            #{c.rank}
                          </span>
                          <div>
                            <div style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--text)' }}>
                              {c.name}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>
                              📍 {c.location} • Campus Lead: {c.mvpCounselorName}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <span style={{
                          fontSize: '0.72rem', fontWeight: 800, padding: '3px 8px', borderRadius: '9999px',
                          background: 'rgba(245, 158, 11, 0.15)',
                          color: '#d97706',
                          border: '1px solid currentColor',
                        }}>
                          {monthShortName} League
                        </span>
                      </td>

                      <td style={{ padding: '14px 16px', textAlign: 'center', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                        {c.intakeCount}
                      </td>

                      <td style={{ padding: '14px 16px', textAlign: 'center', fontWeight: 800, color: '#10b981', fontFamily: 'var(--font-mono)' }}>
                        {c.conversionRate}%
                      </td>

                      <td style={{ padding: '14px 16px', textAlign: 'center', fontWeight: 800, color: '#f59e0b' }}>
                        🔥 {c.winStreak}W
                      </td>

                      <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 900, fontSize: '0.98rem', color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>
                        {c.leaguePoints} LP
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          TAB 2: EXECUTIVE CAMPUS COMPARISON MATRIX
      ══════════════════════════════════════════════════════ */}
      {activeTab === 'clash' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{
            background: 'var(--card-bg)',
            border: '1.5px solid var(--border)',
            borderRadius: '18px',
            padding: '24px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: 'var(--text)' }}>
                  Campus Performance Comparison Matrix
                </h2>
                <p style={{ fontSize: '0.78rem', color: 'var(--muted)', margin: '4px 0 0 0' }}>
                  Select any two official walk-in campuses to compare intake velocity, conversion rate, and performance metrics.
                </p>
              </div>

              {/* Selectors */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                {/* Campus A Select */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <label htmlFor="campus-a-select" style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--muted)' }}>Campus A:</label>
                  <select
                    id="campus-a-select"
                    value={campusAId}
                    onChange={(e) => setCampusAId(e.target.value)}
                    style={{
                      padding: '7px 12px',
                      borderRadius: '8px',
                      border: '1.5px solid var(--border)',
                      background: 'var(--surface)',
                      color: 'var(--text)',
                      fontSize: '0.82rem',
                      fontWeight: 800,
                      outline: 'none',
                    }}
                  >
                    {campusStandings.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <span style={{ fontSize: '0.82rem', fontWeight: 900, color: 'var(--muted)' }}>VS</span>

                {/* Campus B Select */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <label htmlFor="campus-b-select" style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--muted)' }}>Campus B:</label>
                  <select
                    id="campus-b-select"
                    value={campusBId}
                    onChange={(e) => setCampusBId(e.target.value)}
                    style={{
                      padding: '7px 12px',
                      borderRadius: '8px',
                      border: '1.5px solid var(--border)',
                      background: 'var(--surface)',
                      color: 'var(--text)',
                      fontSize: '0.82rem',
                      fontWeight: 800,
                      outline: 'none',
                    }}
                  >
                    {campusStandings.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Comparison Side-by-Side Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
              
              {/* Campus A Card */}
              <div style={{
                background: 'var(--surface-alt)',
                border: '1.5px solid var(--primary)',
                borderRadius: '14px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase' }}>
                      Selected Campus
                    </span>
                    <h3 style={{ margin: '2px 0 0 0', fontSize: '1.1rem', fontWeight: 900, color: 'var(--text)' }}>
                      {selectedCampusA.name}
                    </h3>
                    <p style={{ margin: '2px 0 0 0', fontSize: '0.74rem', color: 'var(--muted)' }}>
                      📍 {selectedCampusA.location}
                    </p>
                  </div>
                  <div style={{
                    padding: '7px 12px', borderRadius: '8px',
                    background: 'var(--primary)', color: '#fff',
                    fontSize: '0.98rem', fontWeight: 900, fontFamily: 'var(--font-mono)',
                  }}>
                    {selectedCampusA.leaguePoints} LP
                  </div>
                </div>

                {/* Metrics Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div style={{ background: 'var(--surface)', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--muted)', fontWeight: 700 }}>Total Footfalls</span>
                    <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--text)', marginTop: '2px' }}>
                      {selectedCampusA.intakeCount}
                    </div>
                  </div>
                  <div style={{ background: 'var(--surface)', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--muted)', fontWeight: 700 }}>Conversion %</span>
                    <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#10b981', marginTop: '2px' }}>
                      {selectedCampusA.conversionRate}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Campus B Card */}
              <div style={{
                background: 'var(--surface-alt)',
                border: '1.5px solid rgba(168, 85, 247, 0.6)',
                borderRadius: '14px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#a855f7', textTransform: 'uppercase' }}>
                      Comparison Campus
                    </span>
                    <h3 style={{ margin: '2px 0 0 0', fontSize: '1.1rem', fontWeight: 900, color: 'var(--text)' }}>
                      {selectedCampusB.name}
                    </h3>
                    <p style={{ margin: '2px 0 0 0', fontSize: '0.74rem', color: 'var(--muted)' }}>
                      📍 {selectedCampusB.location}
                    </p>
                  </div>
                  <div style={{
                    padding: '7px 12px', borderRadius: '8px',
                    background: '#a855f7', color: '#fff',
                    fontSize: '0.98rem', fontWeight: 900, fontFamily: 'var(--font-mono)',
                  }}>
                    {selectedCampusB.leaguePoints} LP
                  </div>
                </div>

                {/* Metrics Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div style={{ background: 'var(--surface)', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--muted)', fontWeight: 700 }}>Total Footfalls</span>
                    <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--text)', marginTop: '2px' }}>
                      {selectedCampusB.intakeCount}
                    </div>
                  </div>
                  <div style={{ background: 'var(--surface)', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--muted)', fontWeight: 700 }}>Conversion %</span>
                    <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#10b981', marginTop: '2px' }}>
                      {selectedCampusB.conversionRate}%
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Proportional Metric Progress Comparison */}
            <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { label: 'Walk-in Intake Volume', valA: selectedCampusA.intakeCount, valB: selectedCampusB.intakeCount, unit: 'students' },
                { label: 'Conversion Rate', valA: selectedCampusA.conversionRate, valB: selectedCampusB.conversionRate, unit: '%' },
                { label: 'Winning Streak', valA: selectedCampusA.winStreak, valB: selectedCampusB.winStreak, unit: 'days' },
              ].map((m) => {
                const total = (m.valA + m.valB) || 1;
                const pctA = Math.round((m.valA / total) * 100);
                const pctB = 100 - pctA;
                return (
                  <div key={m.label} style={{ background: 'var(--surface)', padding: '12px 16px', borderRadius: '10px', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 800, marginBottom: '6px' }}>
                      <span style={{ color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>
                        {selectedCampusA.name}: {m.valA} {m.unit} ({pctA}%)
                      </span>
                      <span style={{ color: 'var(--text)' }}>{m.label}</span>
                      <span style={{ color: '#a855f7', fontFamily: 'var(--font-mono)' }}>
                        {selectedCampusB.name}: {m.valB} {m.unit} ({pctB}%)
                      </span>
                    </div>
                    <div style={{ display: 'flex', height: '8px', borderRadius: '9999px', overflow: 'hidden', background: 'var(--surface-alt)' }}>
                      <div style={{ width: `${pctA}%`, background: 'var(--primary)', transition: 'width 0.4s ease' }} />
                      <div style={{ width: `${pctB}%`, background: '#a855f7', transition: 'width 0.4s ease' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          TAB 3: COUNSELOR MVP ARENA
      ══════════════════════════════════════════════════════ */}
      {activeTab === 'counselors' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{
            background: 'var(--card-bg)',
            border: '1.5px solid var(--border)',
            borderRadius: '18px',
            padding: '24px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
          }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 16px 0', color: 'var(--text)' }}>
              {selectedMonth} Counselor Target &amp; Leaderboard
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '16px' }}>
              {filteredCounselors.map((cg) => (
                <div
                  key={cg.id}
                  style={{
                    background: 'var(--surface-alt, rgba(255,255,255,0.02))',
                    border: '1.5px solid var(--border)',
                    borderRadius: '14px',
                    padding: '18px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--primary)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '38px', height: '38px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                        color: '#fff', fontWeight: 900, fontSize: '0.84rem',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {getInitials(cg.name)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text)' }}>
                          {cg.name}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>
                          {cg.branchName}
                        </div>
                      </div>
                    </div>
                    <span style={{
                      fontSize: '0.66rem', fontWeight: 900, padding: '2px 7px', borderRadius: '4px',
                      background: cg.tierColor, color: '#fff', textTransform: 'uppercase',
                    }}>
                      Lvl {cg.level} • {cg.tierName}
                    </span>
                  </div>

                  {/* XP Progress */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontWeight: 700, marginBottom: '4px' }}>
                      <span style={{ color: 'var(--muted)' }}>Progress to Lvl {cg.level + 1}</span>
                      <span style={{ color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>{cg.xp} XP</span>
                    </div>
                    <div style={{ height: '6px', borderRadius: '9999px', background: 'var(--surface)', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: `${Math.round(((400 - cg.xpToNextLevel) / 400) * 100)}%`,
                        background: 'linear-gradient(90deg, #6366f1, #a855f7)',
                        borderRadius: '9999px',
                      }} />
                    </div>
                  </div>

                  {/* Stats */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', textAlign: 'center', background: 'var(--surface)', padding: '8px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 900, color: '#f59e0b' }}>🔥 {cg.streakDays}d</div>
                      <div style={{ fontSize: '0.62rem', color: 'var(--muted)', fontWeight: 800, textTransform: 'uppercase' }}>Streak</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 900, color: '#10b981' }}>{cg.conversionRate}%</div>
                      <div style={{ fontSize: '0.62rem', color: 'var(--muted)', fontWeight: 800, textTransform: 'uppercase' }}>Conversion</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 900, color: 'var(--primary)' }}>{cg.badges.filter(b => b.isUnlocked).length}</div>
                      <div style={{ fontSize: '0.62rem', color: 'var(--muted)', fontWeight: 800, textTransform: 'uppercase' }}>Badges</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          TAB 4: TROPHY & BADGE CABINET
      ══════════════════════════════════════════════════════ */}
      {activeTab === 'badges' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{
            background: 'var(--card-bg)',
            border: '1.5px solid var(--border)',
            borderRadius: '18px',
            padding: '24px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
          }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 4px 0', color: 'var(--text)' }}>
              {selectedMonth} Achievement Badges &amp; Milestone Trophies
            </h2>
            <p style={{ fontSize: '0.78rem', color: 'var(--muted)', margin: '0 0 20px 0' }}>
              Unlock special milestone medals by hitting monthly candidate conversion velocity and quality benchmarks.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
              {currentUserGamification.badges.map((b) => (
                <div
                  key={b.id}
                  style={{
                    background: b.isUnlocked ? 'linear-gradient(180deg, var(--surface-alt) 0%, var(--card-bg) 100%)' : 'rgba(255,255,255,0.01)',
                    border: `1.5px solid ${b.isUnlocked ? 'var(--border)' : 'var(--border)'}`,
                    borderRadius: '16px',
                    padding: '22px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    gap: '14px',
                    position: 'relative',
                    boxShadow: b.isUnlocked ? '0 4px 20px rgba(0,0,0,0.04)' : 'none',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {/* Status Pill on Top-Right */}
                  <span style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    fontSize: '0.62rem',
                    fontWeight: 900,
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    background: b.isUnlocked ? 'rgba(16, 185, 129, 0.15)' : 'var(--surface)',
                    color: b.isUnlocked ? '#10b981' : 'var(--muted)',
                    border: `1px solid ${b.isUnlocked ? 'rgba(16, 185, 129, 0.3)' : 'var(--border)'}`,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}>
                    {b.isUnlocked ? 'Unlocked ✅' : 'Locked 🔒'}
                  </span>

                  {/* 3D Crest Badge */}
                  <div style={{ marginTop: '6px' }}>
                    <BadgeCrest
                      tier={b.tier || 'gold'}
                      size={76}
                      isUnlocked={b.isUnlocked}
                      icon={b.icon}
                    />
                  </div>

                  <div>
                    <h3 style={{ margin: '4px 0 3px 0', fontSize: '1.02rem', fontWeight: 900, color: 'var(--text)' }}>
                      {b.name}
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--muted)', lineHeight: 1.45, maxWidth: '240px' }}>
                      {b.description}
                    </p>
                  </div>

                  {/* Progress bar */}
                  <div style={{ width: '100%', marginTop: 'auto', paddingTop: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontWeight: 800, marginBottom: '4px' }}>
                      <span style={{ color: 'var(--muted)', textTransform: 'uppercase', fontSize: '0.65rem' }}>Tier Mastery</span>
                      <span style={{ color: b.isUnlocked ? '#10b981' : 'var(--primary)', fontFamily: 'var(--font-mono)' }}>{b.progressPct}%</span>
                    </div>
                    <div style={{ height: '6px', borderRadius: '9999px', background: 'var(--surface)', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: `${b.progressPct}%`,
                        background: b.isUnlocked ? 'linear-gradient(90deg, #10b981, #059669)' : 'linear-gradient(90deg, #6366f1, #a855f7)',
                        borderRadius: '9999px',
                      }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          TAB 5: DAILY QUESTS
      ══════════════════════════════════════════════════════ */}
      {activeTab === 'quests' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{
            background: 'var(--card-bg)',
            border: '1.5px solid var(--border)',
            borderRadius: '18px',
            padding: '24px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
          }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 4px 0', color: 'var(--text)' }}>
              {selectedMonth} Daily Quests &amp; Target Bonus XP
            </h2>
            <p style={{ fontSize: '0.78rem', color: 'var(--muted)', margin: '0 0 20px 0' }}>
              Complete high-priority counseling actions to level up faster and hit your monthly branch targets.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {currentUserGamification.quests.map((q) => {
                const isClaimed = claimedQuests[q.id];
                return (
                  <div
                    key={q.id}
                    style={{
                      background: isClaimed ? 'rgba(16, 185, 129, 0.06)' : 'var(--surface-alt)',
                      border: `1.5px solid ${isClaimed ? 'rgba(16, 185, 129, 0.3)' : 'var(--border)'}`,
                      borderRadius: '12px',
                      padding: '14px 18px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '34px', height: '34px', borderRadius: '8px',
                        background: isClaimed ? '#10b981' : 'var(--surface)',
                        color: isClaimed ? '#fff' : 'var(--muted)',
                        fontSize: '1rem',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {isClaimed ? '✓' : '🎯'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text)' }}>
                          {q.title}
                        </div>
                        <div style={{ fontSize: '0.76rem', color: 'var(--muted)', marginTop: '1px' }}>
                          {q.description}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.84rem', fontWeight: 900, color: 'var(--text)' }}>
                          {q.current} / {q.target}
                        </div>
                        <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#f59e0b' }}>
                          +{q.rewardXp} XP
                        </div>
                      </div>
                      
                      {q.isCompleted && !isClaimed ? (
                        <button
                          type="button"
                          onClick={() => handleClaimQuest(q.id)}
                          style={{
                            padding: '6px 14px',
                            borderRadius: '8px',
                            fontSize: '0.76rem',
                            fontWeight: 900,
                            background: 'linear-gradient(135deg, #10b981, #059669)',
                            color: '#fff',
                            border: 'none',
                            cursor: 'pointer',
                            boxShadow: '0 2px 10px rgba(16, 185, 129, 0.35)',
                          }}
                        >
                          Claim XP 🎁
                        </button>
                      ) : (
                        <span style={{
                          padding: '4px 10px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 800,
                          background: isClaimed ? '#10b981' : 'var(--surface)',
                          color: isClaimed ? '#fff' : 'var(--muted)',
                          border: '1px solid var(--border)',
                        }}>
                          {isClaimed ? 'Claimed 🎉' : 'In Progress'}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

    </section>
  );
}
