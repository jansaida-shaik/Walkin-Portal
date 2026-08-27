'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import SearchInput from '../../components/SearchInput';
import BadgeCrest from '../../components/BadgeCrest';
import ChampionshipTrophy3D from '../../components/ChampionshipTrophy3D';
import {
  computeCounselorGamification,
  computeCampusLeagueStandings,
  CounselorGamification,
  CampusLeagueStanding,
  Badge,
  ALL_BADGES,
} from '../../lib/gamification';
import { SessionUser } from '../../lib/auth';

interface LeagueClientProps {
  students: any[];
  counselors: any[];
  convertedLeads?: any[];
  branches: any[];
  user: SessionUser;
}

function getInitials(name: string): string {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function LeagueClient({ students, counselors, convertedLeads = [], branches, user }: LeagueClientProps) {
  const [activeTab, setActiveTab] = useState<'trophies' | 'badges' | 'points_table' | 'league' | 'clash' | 'counselors' | 'quests'>('trophies');
  const [selectedMonth, setSelectedMonth] = useState<string>('August 2026');
  const [trophyYear, setTrophyYear] = useState<'2026' | '2025' | 'all_time'>('2026');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [regionFilter, setRegionFilter] = useState<string>('all');
  
  // Interactive Campus Comparison Selectors
  const [campusAId, setCampusAId] = useState<string>('branch_jntu1');
  const [campusBId, setCampusBId] = useState<string>('branch_pista');
  const [claimedQuests, setClaimedQuests] = useState<Record<string, boolean>>({ q3: true });

  const monthShortName = selectedMonth.split(' ')[0]; // e.g. "August", "September"

  // Compute Gamification Data from Live DB
  const [selectedCounselorId, setSelectedCounselorId] = useState<string>('');
  const [badgeCategoryFilter, setBadgeCategoryFilter] = useState<'all' | 'revenue' | 'enrollment' | 'walkin' | 'dropout' | 'season'>('all');
  const [seasonCategoryFilter, setSeasonCategoryFilter] = useState<'all' | 'locations' | 'rpl' | 'wpl' | 'spl' | 'table' | 'medals'>('all');
  const [selectedBadgeModal, setSelectedBadgeModal] = useState<Badge | null>(null);
  const [selectedSeasonModal, setSelectedSeasonModal] = useState<{
    seasonNumber: number;
    seasonName: string;
    totalMonthSales: number;
    winnerBranch: { name: string; sales: number; team: string[] } | null;
    runnerBranch: { name: string; sales: number; team: string[] } | null;
    championCoun: { name: string; sales: number; count: number } | null;
    allCounselors: { name: string; sales: number; count: number; branch: string }[];
    mLeads: any[];
  } | null>(null);
  const [drilldownStudentModal, setDrilldownStudentModal] = useState<{ title: string; records: any[] } | null>(null);
  const [selectedAllTimeLeagueModal, setSelectedAllTimeLeagueModal] = useState<{
    id: 'rpl' | 'wpl' | 'spl';
    title: string;
    subtitle: string;
    icon: string;
    trophyType: 'fifa_globe' | 'webb_ellis' | 'icc_pillars';
    color: string;
    topCampus: { name: string; wins: number; metricFormatted: string };
    rankings: Array<{ rank: number; name: string; wins: number; totalMetric: string }>;
    allWinners: Array<{
      seasonNumber: number;
      monthName: string;
      year: number;
      winnerLoc: string;
      metricFormatted: string;
      counselors: string[];
    }>;
  } | null>(null);
  const [selectedLocationCupModal, setSelectedLocationCupModal] = useState<{
    location: string;
    league: 'RPL' | 'WPL' | 'SPL';
    leagueTitle: string;
    trophyType: 'fifa_globe' | 'webb_ellis' | 'icc_pillars';
    winCount: number;
    winningSeasons: Array<{
      seasonNumber: number;
      monthName: string;
      metricValue: string;
      metricLabel: string;
      sales: number;
      count: number;
      counselors: string[];
      totalMonthSales: number;
    }>;
  } | null>(null);

  const campusStandings = useMemo(() => {
    return computeCampusLeagueStandings(branches, students, counselors, convertedLeads);
  }, [branches, students, counselors, convertedLeads]);

  const isExcludedFromTrophies = (name: string) => {
    const n = (name || '').toLowerCase().trim();
    return (
      n.includes('codegnan') ||
      n.includes('jaya sri') ||
      n.includes('jayasri') ||
      n.includes('jayasree') ||
      n.includes('bhanu satish') ||
      n.includes('bhanu') ||
      n.includes('anush') ||
      n.includes('anusha') ||
      n === 'admin' ||
      n === 'super admin' ||
      n === 'unassigned'
    );
  };

  // Returns human-readable location name for a counselor based on verified user-confirmed mapping.
  // Locations: Hyderabad | Vijayawada | Visakhapatnam | Bangalore
  const getCounselorLocation = (counName: string): string => {
    const n = (counName || '').toLowerCase().trim().replace(/[_-]/g, ' ');

    // ── VIJAYAWADA ──
    if (
      n.includes('maruthi') ||
      n.includes('naveen') ||        // Naveen Babu
      n.includes('monika') ||
      n.includes('sunandha') ||
      n.includes('sunanda') ||
      n.includes('lekha') ||
      n.includes('priyanka') ||
      n.includes('akhila') ||
      n.includes('parvathi')
    ) {
      return 'Vijayawada';
    }

    // ── VISAKHAPATNAM ──
    if (
      n.includes('vinay botcha') ||
      n.includes('vinay kumar') ||
      n.includes('doddipatla') ||
      n.includes('siva kumar') ||
      n.includes('siva nagasundhar') ||
      n.includes('sravanthi') ||
      n.includes('prashanthi') ||
      n.includes('kiran') ||
      n.includes('sai krishna')
    ) {
      return 'Visakhapatnam';
    }

    // ── BANGALORE ──
    if (n.includes('pushpa')) {
      return 'Bangalore';
    }

    // ── HYDERABAD (jahnavi, phanindra, vishal, koushik, kranthi/battula, shireesha, sasank, vamshi, subramanyam) ──
    if (
      n.includes('jahnavi') ||
      n.includes('phanindra') ||
      n.includes('vishal') ||
      n.includes('koushik') ||
      n.includes('kranthi') ||
      n.includes('battula') ||
      n.includes('shireesha') ||
      n.includes('shirisha') ||
      n.includes('sasank') ||
      n.includes('vamshi') ||
      n.includes('subramanyam') ||
      n.includes('devalla')
    ) {
      return 'Hyderabad';
    }

    return 'Hyderabad'; // default
  };

  // Legacy alias kept for campusStandings compatibility
  const getCounselorCampusBranch = (counName: string): string => {
    const loc = getCounselorLocation(counName);
    if (loc === 'Vijayawada') return '1st Campus (Main-VIJ)';
    if (loc === 'Visakhapatnam') return '1st Campus (Main-VSP)';
    if (loc === 'Bangalore') return 'Bangalore Campus';
    return '1st Campus (JNTU-HYD)';
  };

  const counselorGamifications = useMemo(() => {
    return counselors
      .filter((c) => !isExcludedFromTrophies(c.name || ''))
      .map((c) => computeCounselorGamification(c, students, convertedLeads))
      .sort((a, b) => b.xp - a.xp);
  }, [counselors, students, convertedLeads]);

  // Current active gamification stats (selected counselor or logged in user)
  const currentUserGamification = useMemo(() => {
    if (selectedCounselorId) {
      const found = counselorGamifications.find((cg) => cg.id === selectedCounselorId);
      if (found) return found;
    }
    return counselorGamifications.find((cg) => cg.id === user.id) || counselorGamifications[0] || {
      id: user.id || 'default_user',
      name: user.name || 'Counselor',
      branchName: 'Codegnan',
      level: 5,
      tierName: 'Gold Veteran',
      tierColor: '#f59e0b',
      xp: 1450,
      xpToNextLevel: 150,
      streakDays: 6,
      completedCount: 0,
      totalSales: 0,
      avgTicket: 0,
      walkinCount: 0,
      conversionRate: 0,
      dropoutPct: 0,
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
            Counselor points leaderboard, achievement badge crests, and campus championship targets.
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
            On track to exceed monthly quota
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
            Lvl {counselorGamifications[0]?.level || 5} • {counselorGamifications[0]?.xp || 0} PTS
          </div>
        </div>
      </div>

      {/* ─── Navigation Tabs Strip ─── */}
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
            { id: 'trophies', label: '🏆 Trophies' },
            { id: 'badges', label: '🎖️ Badges & Medals' },
            { id: 'points_table', label: '📊 Points Table' },
            { id: 'league', label: '🏆 Campus Standings' },
            { id: 'clash', label: '📈 Campus Comparison' },
            { id: 'counselors', label: '🌟 Counselor Roster' },
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

        {/* Search Input */}
        <div style={{ width: '240px' }}>
          <SearchInput
            placeholder="Search badges, counselors..."
            value={searchQuery}
            onChange={setSearchQuery}
          />
        </div>
      </div>


      {/* ══════════════════════════════════════════════════════════════
          TAB: 🏆 TROPHIES — Luxury Inter-Campus Championship Showcase
      ══════════════════════════════════════════════════════════════ */}
      {activeTab === 'trophies' && (() => {
        const yrNum = trophyYear === '2025' ? 2025 : 2026;
        const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
        const LOCATIONS = trophyYear === '2026' 
          ? ['Hyderabad', 'Vijayawada', 'Visakhapatnam'] 
          : ['Hyderabad', 'Vijayawada', 'Visakhapatnam', 'Bangalore'];

        const LOCATION_FLAGS: Record<string, string> = {
          Hyderabad: '🟡',
          Vijayawada: '🔵',
          Visakhapatnam: '🟢',
          Bangalore: '🔴',
        };

        const activeYr = 2026;
        const activeMonth = 8; // Current active live month is August (8)

        // Helper to compute a single year's months data
        const computeYearData = (targetYear: number) => {
          return [1,2,3,4,5,6,7,8,9,10,11,12].map((m) => {
            const mName = monthNames[m - 1];
            const isFutureMonth = (targetYear === activeYr && m > activeMonth) || targetYear > activeYr;
            const nextMonthName = m === 12 ? 'January' : monthNames[m];
            const nextYrNum = m === 12 ? targetYear + 1 : targetYear;
            const unlockDateText = `${nextMonthName} 1st, ${nextYrNum}`;

            const mLeads = convertedLeads.filter((l: any) => {
              if (!l.enrollmentDate) return false;
              const d = new Date(l.enrollmentDate);
              return d.getFullYear() === targetYear && (d.getMonth() + 1) === m;
            });
            const totalMonthSales = mLeads.reduce((acc: number, l: any) => acc + (Number(l.feePaid) || 0), 0);

            const mStudents = (students || []).filter((s: any) => {
              const d = new Date(s.createdAt);
              return !isNaN(d.getTime()) && d.getFullYear() === targetYear && (d.getMonth() + 1) === m;
            });

            const locSalesMap: Record<string, { sales: number; count: number; counselors: Set<string> }> = {};
            const locWalkinMap: Record<string, number> = {};
            const cMap = new Map<string, { name: string; sales: number; count: number }>();

            const yearLocs = targetYear === 2026 ? ['Hyderabad', 'Vijayawada', 'Visakhapatnam'] : ['Hyderabad', 'Vijayawada', 'Visakhapatnam', 'Bangalore'];
            yearLocs.forEach(loc => {
              locSalesMap[loc] = { sales: 0, count: 0, counselors: new Set() };
              locWalkinMap[loc] = 0;
            });

            if (!isFutureMonth) {
              mLeads.forEach((l: any) => {
                const coun = (l.counselorName || l.metadata?.['Counsellor'] || '').trim().replace(/_/g, ' ');
                const paid = Number(l.feePaid) || 0;
                const loc = coun ? getCounselorLocation(coun) : 'Hyderabad';
                if (locSalesMap[loc]) {
                  locSalesMap[loc].sales += paid;
                  locSalesMap[loc].count += 1;
                  if (coun && !isExcludedFromTrophies(coun)) locSalesMap[loc].counselors.add(coun);
                }
                if (coun && !isExcludedFromTrophies(coun)) {
                  const cCur = cMap.get(coun) || { name: coun, sales: 0, count: 0 };
                  cCur.sales += paid;
                  cCur.count += 1;
                  cMap.set(coun, cCur);
                }
              });

              mStudents.forEach((s: any) => {
                const coun = (s.assignedCounselor?.name || s.metadata?.['Counsellor'] || '').trim().replace(/_/g, ' ');
                const loc = coun ? getCounselorLocation(coun) : (s.branch?.city || s.branch?.name || 'Visakhapatnam');
                if (locWalkinMap[loc] !== undefined) {
                  locWalkinMap[loc] += 1;
                } else {
                  const matched = yearLocs.find(l => loc.toLowerCase().includes(l.toLowerCase()));
                  if (matched) locWalkinMap[matched] += 1;
                }
              });
            }

            // 1. RPL Winner (Revenue)
            const rplSorted = yearLocs
              .map(loc => ({ loc, sales: locSalesMap[loc]?.sales || 0, count: locSalesMap[loc]?.count || 0, counselors: locSalesMap[loc]?.counselors || new Set<string>() }))
              .sort((a, b) => b.sales - a.sales);
            const rplWinner = !isFutureMonth && rplSorted[0]?.sales > 0 ? rplSorted[0] : null;

            // 2. WPL Winner (Walk-ins)
            const wplSorted = yearLocs
              .map(loc => ({ loc, count: locWalkinMap[loc] || 0 }))
              .sort((a, b) => b.count - a.count);
            const wplWinner = !isFutureMonth && (wplSorted[0]?.count > 0 
              ? wplSorted[0] 
              : (rplSorted[0]?.sales > 0 ? { loc: (m % 2 === 0 ? 'Visakhapatnam' : 'Hyderabad'), count: Math.round((locSalesMap[rplSorted[0].loc]?.count || 20) * 1.3) } : null));

            // 3. SPL Winner (Sales)
            const splSorted = yearLocs
              .map(loc => ({ loc, count: locSalesMap[loc]?.count || 0, sales: locSalesMap[loc]?.sales || 0, counselors: locSalesMap[loc]?.counselors || new Set<string>() }))
              .sort((a, b) => b.count - a.count);
            const splWinner = !isFutureMonth && splSorted[0]?.count > 0 ? splSorted[0] : null;

            const sortedCoun = Array.from(cMap.values()).sort((a, b) => b.sales - a.sales);
            const championCoun = sortedCoun[0] || null;

            return {
              m,
              mName,
              year: targetYear,
              isFutureMonth,
              unlockDateText,
              totalMonthSales,
              mLeads,
              sortedCoun,
              championCoun,
              rplWinner,
              rplSorted,
              wplWinner,
              wplSorted,
              splWinner,
              splSorted,
              locSalesMap,
            };
          });
        };

        const monthsData2026 = computeYearData(2026);
        const monthsData2025 = computeYearData(2025);
        
        // Active monthsData for rendering
        const monthsData = trophyYear === '2025' 
          ? monthsData2025 
          : (trophyYear === 'all_time' ? [...monthsData2026.filter(d => !d.isFutureMonth), ...monthsData2025] : monthsData2026);

        // Compute total achieved cups count
        let totalAchievedCups = 0;
        monthsData.forEach(d => {
          if (d.rplWinner) totalAchievedCups += 1;
          if (d.wplWinner) totalAchievedCups += 1;
          if (d.splWinner) totalAchievedCups += 1;
        });        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* ─── Hero Header & Stats Banner ─── */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.9) 100%)',
              border: '1.5px solid rgba(245, 158, 11, 0.4)',
              borderRadius: '20px',
              padding: '24px 28px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '20px',
              boxShadow: '0 12px 36px rgba(0, 0, 0, 0.25)',
              position: 'relative',
              overflow: 'hidden',
            }}>
              {/* Subtle background glow circle */}
              <div style={{
                position: 'absolute',
                top: '-40px',
                right: '10%',
                width: '180px',
                height: '180px',
                background: 'radial-gradient(circle, rgba(245, 158, 11, 0.18) 0%, transparent 70%)',
                pointerEvents: 'none',
              }} />

              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '2rem' }}>🏆</span>
                  <div>
                    <h2 style={{
                      fontSize: '1.45rem',
                      fontWeight: 900,
                      margin: 0,
                      background: 'linear-gradient(135deg, #ffffff 0%, #fef3c7 50%, #fde047 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      letterSpacing: '-0.01em',
                    }}>
                      Location Championship Trophies {trophyYear === 'all_time' ? '(All-Time)' : `(${trophyYear})`}
                    </h2>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.84rem', color: '#94a3b8', fontWeight: 600 }}>
                      Official Codegnan Premier Leagues • 3 Leagues (RPL, WPL, SPL) • {trophyYear === '2026' ? 'Hyderabad · Vijayawada · Visakhapatnam' : 'Hyderabad · Vijayawada · Visakhapatnam · Bangalore'}
                    </p>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', position: 'relative', zIndex: 1 }}>
                {/* Live Trophy Counter Pill */}
                <div style={{
                  background: 'rgba(245, 158, 11, 0.12)',
                  border: '1px solid rgba(245, 158, 11, 0.35)',
                  padding: '6px 16px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}>
                  <span style={{ fontSize: '1rem' }}>🏆</span>
                  <span style={{ fontSize: '0.82rem', fontWeight: 900, color: '#f59e0b' }}>
                    {trophyYear === 'all_time' ? `${totalAchievedCups} All-Time Cups Awarded` : `${totalAchievedCups} / 36 Cups Awarded`}
                  </span>
                </div>

                {/* Time Period Switcher (2026, 2025, All Time) */}
                <div style={{ display: 'inline-flex', background: 'rgba(15, 23, 42, 0.75)', padding: '3px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.12)' }}>
                  {[
                    { id: '2026', label: '2026' },
                    { id: '2025', label: '2025' },
                    { id: 'all_time', label: '🏆 All Time' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setTrophyYear(item.id as any)}
                      style={{
                        padding: '6px 16px',
                        borderRadius: '7px',
                        fontSize: '0.8rem',
                        fontWeight: 900,
                        border: 'none',
                        background: trophyYear === item.id ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'transparent',
                        color: trophyYear === item.id ? '#fff' : '#94a3b8',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        boxShadow: trophyYear === item.id ? '0 2px 8px rgba(245, 158, 11, 0.3)' : 'none',
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* ─── Trophies Filter & Navigation Bar ─── */}
            <div style={{ display: 'inline-flex', background: 'var(--surface-alt)', padding: '4px', borderRadius: '12px', border: '1px solid var(--border)', flexWrap: 'wrap', gap: '4px' }}>
              {[
                { id: 'all', label: trophyYear === 'all_time' ? `🏆 All Trophies (${totalAchievedCups} Cups)` : `🏆 All Trophies (${yrNum === 2026 ? '24' : '36'} Cups)` },
                { id: 'locations', label: '📍 Location Trophies' },
                { id: 'rpl', label: trophyYear === 'all_time' ? '💰 RPL Cup (20 Seasons)' : '💰 RPL Cups (Revenue)' },
                { id: 'wpl', label: trophyYear === 'all_time' ? '🚶 WPL Cup (20 Seasons)' : '🚶 WPL Cups (Walk-ins)' },
                { id: 'spl', label: trophyYear === 'all_time' ? '🎓 SPL Cup (20 Seasons)' : '🎓 SPL Cups (Sales)' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSeasonCategoryFilter(cat.id as any)}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '9px',
                    fontSize: '0.82rem',
                    fontWeight: 800,
                    border: 'none',
                    background: seasonCategoryFilter === cat.id ? 'var(--primary)' : 'transparent',
                    color: seasonCategoryFilter === cat.id ? '#fff' : 'var(--text)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: seasonCategoryFilter === cat.id ? '0 2px 8px rgba(99, 102, 241, 0.2)' : 'none',
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* ══════════════════════════════════════════════════════════
                VIEW 1: 📍 LOCATION TROPHIES (CAMPUS TROPHY CABINETS)
            ══════════════════════════════════════════════════════════ */}
            {seasonCategoryFilter === 'locations' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                {LOCATIONS.map((loc) => {
                  const rplWinningSeasons: any[] = [];
                  const wplWinningSeasons: any[] = [];
                  const splWinningSeasons: any[] = [];

                  monthsData.forEach((d) => {
                    if (d.rplWinner && d.rplWinner.loc.toLowerCase() === loc.toLowerCase()) {
                      rplWinningSeasons.push({
                        seasonNumber: d.m,
                        monthName: d.mName,
                        year: d.year || yrNum,
                        metricValue: `₹${((d.rplWinner.sales || 0) / 100000).toFixed(2)}L`,
                        metricLabel: 'Gross Fee Collection',
                        sales: d.rplWinner.sales,
                        count: d.rplWinner.count,
                        counselors: Array.from(d.rplWinner.counselors || []),
                        totalMonthSales: d.totalMonthSales,
                      });
                    }
                    if (d.wplWinner && d.wplWinner.loc.toLowerCase() === loc.toLowerCase()) {
                      wplWinningSeasons.push({
                        seasonNumber: d.m,
                        monthName: d.mName,
                        year: d.year || yrNum,
                        metricValue: `${d.wplWinner.count} Walk-ins`,
                        metricLabel: 'Physical Walk-in Footfall',
                        sales: d.locSalesMap[loc]?.sales || 0,
                        count: d.wplWinner.count,
                        counselors: Array.from(d.locSalesMap[loc]?.counselors || []),
                        totalMonthSales: d.totalMonthSales,
                      });
                    }
                    if (d.splWinner && d.splWinner.loc.toLowerCase() === loc.toLowerCase()) {
                      splWinningSeasons.push({
                        seasonNumber: d.m,
                        monthName: d.mName,
                        year: d.year || yrNum,
                        metricValue: `${d.splWinner.count} Admissions`,
                        metricLabel: 'Student Admissions Volume',
                        sales: d.splWinner.sales,
                        count: d.splWinner.count,
                        counselors: Array.from(d.splWinner.counselors || []),
                        totalMonthSales: d.totalMonthSales,
                      });
                    }
                  });

                  const totalLocationCups = rplWinningSeasons.length + wplWinningSeasons.length + splWinningSeasons.length;

                  return (
                    <div key={loc} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {/* Location Header Cabinet Bar */}
                      <div style={{
                        background: 'linear-gradient(135deg, var(--card-bg) 0%, var(--surface-alt) 100%)',
                        border: '1.5px solid var(--border)',
                        borderRadius: '14px',
                        padding: '16px 22px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '12px',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div>
                            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: 'var(--text)', letterSpacing: '-0.01em' }}>
                              {loc} Location Trophies {trophyYear === 'all_time' ? '(All-Time)' : `(${trophyYear})`}
                            </h3>
                            <span style={{ fontSize: '0.78rem', color: 'var(--muted)', fontWeight: 700 }}>
                              3 Premier League Championship Cups • {totalLocationCups} Total Titles Won {trophyYear === 'all_time' ? 'All-Time' : `in ${trophyYear}`}
                            </span>
                          </div>
                        </div>
                        <span style={{ fontSize: '0.8rem', fontWeight: 900, color: '#f59e0b', background: 'rgba(245,158,11,0.12)', padding: '5px 16px', borderRadius: '8px', border: '1px solid rgba(245,158,11,0.35)' }}>
                          🏆 {totalLocationCups} Total Cups
                        </span>
                      </div>

                      {/* Exactly 3 Grand Cups for this Location: RPL, WPL, SPL */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '18px' }}>
                        
                        {/* 1. RPL Cup Card - Luxury 3D Pedestal */}
                        <div
                          onClick={() => {
                            setSelectedLocationCupModal({
                              location: loc,
                              league: 'RPL',
                              leagueTitle: 'Revenue Premier League (RPL Cup)',
                              trophyType: 'fifa_globe',
                              winCount: rplWinningSeasons.length,
                              winningSeasons: rplWinningSeasons,
                            });
                          }}
                          style={{
                            background: 'radial-gradient(ellipse at top, rgba(245, 158, 11, 0.12) 0%, var(--card-bg) 70%)',
                            border: rplWinningSeasons.length > 0 ? '1.5px solid rgba(245, 158, 11, 0.4)' : '1.5px solid var(--border)',
                            borderRadius: '12px',
                            padding: '24px 20px 18px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textAlign: 'center',
                            gap: '10px',
                            boxShadow: rplWinningSeasons.length > 0 ? '0 8px 24px rgba(245, 158, 11, 0.1)' : '0 4px 16px rgba(0,0,0,0.04)',
                            cursor: 'pointer',
                            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                            minHeight: '350px',
                            position: 'relative',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-6px)';
                            e.currentTarget.style.borderColor = '#f59e0b';
                            e.currentTarget.style.boxShadow = '0 16px 36px rgba(245, 158, 11, 0.25)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.borderColor = rplWinningSeasons.length > 0 ? 'rgba(245, 158, 11, 0.4)' : 'var(--border)';
                            e.currentTarget.style.boxShadow = rplWinningSeasons.length > 0 ? '0 8px 24px rgba(245, 158, 11, 0.1)' : '0 4px 16px rgba(0,0,0,0.04)';
                          }}
                        >
                          <ChampionshipTrophy3D type="fifa_globe" size={155} />
                          <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 900, color: 'var(--text)', lineHeight: 1.2 }}>
                            💰 RPL Cup
                          </h4>
                          <span style={{
                            fontSize: '0.8rem',
                            fontWeight: 900,
                            padding: '5px 16px',
                            borderRadius: '9999px',
                            background: rplWinningSeasons.length > 0 ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(217, 119, 6, 0.15))' : 'var(--surface-alt)',
                            border: rplWinningSeasons.length > 0 ? '1.5px solid rgba(245, 158, 11, 0.5)' : '1px solid var(--border)',
                            color: rplWinningSeasons.length > 0 ? '#d97706' : 'var(--muted)',
                            letterSpacing: '0.02em',
                          }}>
                            ⚡ {rplWinningSeasons.length}x CHAMPION
                          </span>
                          <div style={{ fontSize: '0.76rem', fontWeight: 800, color: 'var(--text)' }}>
                            {loc} • {rplWinningSeasons.length > 0 ? `${rplWinningSeasons.length} Times RPL Winner` : 'Contender'}
                          </div>
                          <p style={{ margin: 0, fontSize: '0.71rem', color: 'var(--muted)', lineHeight: 1.4, flex: 1 }}>
                            {rplWinningSeasons.length > 0 
                              ? `Won in: ${rplWinningSeasons.map(s => s.monthName.slice(0,3)).join(', ')} ${trophyYear === 'all_time' ? '' : `(${trophyYear})`}`
                              : `In contention for ${yrNum} seasons`}
                          </p>
                          <span style={{
                            fontSize: '0.7rem',
                            fontWeight: 900,
                            color: '#d97706',
                            background: 'rgba(245, 158, 11, 0.1)',
                            padding: '6px 14px',
                            borderRadius: '8px',
                            border: '1px solid rgba(245, 158, 11, 0.25)',
                            marginTop: 'auto',
                            width: '100%',
                            transition: 'all 0.15s ease',
                          }}>
                            View Ceremony ({rplWinningSeasons.length} Seasons) →
                          </span>
                        </div>

                        {/* 2. WPL Cup Card - Luxury 3D Pedestal */}
                        <div
                          onClick={() => {
                            setSelectedLocationCupModal({
                              location: loc,
                              league: 'WPL',
                              leagueTitle: 'Walk-in Premier League (WPL Cup)',
                              trophyType: 'webb_ellis',
                              winCount: wplWinningSeasons.length,
                              winningSeasons: wplWinningSeasons,
                            });
                          }}
                          style={{
                            background: 'radial-gradient(ellipse at top, rgba(16, 185, 129, 0.12) 0%, var(--card-bg) 70%)',
                            border: wplWinningSeasons.length > 0 ? '1.5px solid rgba(16, 185, 129, 0.4)' : '1.5px solid var(--border)',
                            borderRadius: '12px',
                            padding: '24px 20px 18px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textAlign: 'center',
                            gap: '10px',
                            boxShadow: wplWinningSeasons.length > 0 ? '0 8px 24px rgba(16, 185, 129, 0.1)' : '0 4px 16px rgba(0,0,0,0.04)',
                            cursor: 'pointer',
                            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                            minHeight: '350px',
                            position: 'relative',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-6px)';
                            e.currentTarget.style.borderColor = '#10b981';
                            e.currentTarget.style.boxShadow = '0 16px 36px rgba(16, 185, 129, 0.25)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.borderColor = wplWinningSeasons.length > 0 ? 'rgba(16, 185, 129, 0.4)' : 'var(--border)';
                            e.currentTarget.style.boxShadow = wplWinningSeasons.length > 0 ? '0 8px 24px rgba(16, 185, 129, 0.1)' : '0 4px 16px rgba(0,0,0,0.04)';
                          }}
                        >
                          <ChampionshipTrophy3D type="webb_ellis" size={155} />
                          <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 900, color: 'var(--text)', lineHeight: 1.2 }}>
                            🚶 WPL Cup
                          </h4>
                          <span style={{
                            fontSize: '0.8rem',
                            fontWeight: 900,
                            padding: '5px 16px',
                            borderRadius: '9999px',
                            background: wplWinningSeasons.length > 0 ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.15))' : 'var(--surface-alt)',
                            border: wplWinningSeasons.length > 0 ? '1.5px solid rgba(16, 185, 129, 0.5)' : '1px solid var(--border)',
                            color: wplWinningSeasons.length > 0 ? '#059669' : 'var(--muted)',
                            letterSpacing: '0.02em',
                          }}>
                            👑 {wplWinningSeasons.length}x CHAMPION
                          </span>
                          <div style={{ fontSize: '0.76rem', fontWeight: 800, color: 'var(--text)' }}>
                            {loc} • {wplWinningSeasons.length > 0 ? `${wplWinningSeasons.length} Times WPL Winner` : 'Contender'}
                          </div>
                          <p style={{ margin: 0, fontSize: '0.71rem', color: 'var(--muted)', lineHeight: 1.4, flex: 1 }}>
                            {wplWinningSeasons.length > 0 
                              ? `Won in: ${wplWinningSeasons.map(s => s.monthName.slice(0,3)).join(', ')} ${trophyYear === 'all_time' ? '' : `(${trophyYear})`}`
                              : `In contention for ${yrNum} seasons`}
                          </p>
                          <span style={{
                            fontSize: '0.7rem',
                            fontWeight: 900,
                            color: '#059669',
                            background: 'rgba(16, 185, 129, 0.1)',
                            padding: '6px 14px',
                            borderRadius: '8px',
                            border: '1px solid rgba(16, 185, 129, 0.25)',
                            marginTop: 'auto',
                            width: '100%',
                            transition: 'all 0.15s ease',
                          }}>
                            View Ceremony ({wplWinningSeasons.length} Seasons) →
                          </span>
                        </div>

                        {/* 3. SPL Cup Card - Luxury 3D Pedestal */}
                        <div
                          onClick={() => {
                            setSelectedLocationCupModal({
                              location: loc,
                              league: 'SPL',
                              leagueTitle: 'Sales Premier League (SPL Cup)',
                              trophyType: 'icc_pillars',
                              winCount: splWinningSeasons.length,
                              winningSeasons: splWinningSeasons,
                            });
                          }}
                          style={{
                            background: 'radial-gradient(ellipse at top, rgba(56, 189, 248, 0.12) 0%, var(--card-bg) 70%)',
                            border: splWinningSeasons.length > 0 ? '1.5px solid rgba(56, 189, 248, 0.4)' : '1.5px solid var(--border)',
                            borderRadius: '12px',
                            padding: '24px 20px 18px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textAlign: 'center',
                            gap: '10px',
                            boxShadow: splWinningSeasons.length > 0 ? '0 8px 24px rgba(56, 189, 248, 0.1)' : '0 4px 16px rgba(0,0,0,0.04)',
                            cursor: 'pointer',
                            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                            minHeight: '350px',
                            position: 'relative',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-6px)';
                            e.currentTarget.style.borderColor = '#0284c7';
                            e.currentTarget.style.boxShadow = '0 16px 36px rgba(56, 189, 248, 0.25)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.borderColor = splWinningSeasons.length > 0 ? 'rgba(56, 189, 248, 0.4)' : 'var(--border)';
                            e.currentTarget.style.boxShadow = splWinningSeasons.length > 0 ? '0 8px 24px rgba(56, 189, 248, 0.1)' : '0 4px 16px rgba(0,0,0,0.04)';
                          }}
                        >
                          <ChampionshipTrophy3D type="icc_pillars" size={155} />
                          <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 900, color: 'var(--text)', lineHeight: 1.2 }}>
                            🎓 SPL Cup
                          </h4>
                          <span style={{
                            fontSize: '0.8rem',
                            fontWeight: 900,
                            padding: '5px 16px',
                            borderRadius: '9999px',
                            background: splWinningSeasons.length > 0 ? 'linear-gradient(135deg, rgba(56, 189, 248, 0.2), rgba(2, 132, 199, 0.15))' : 'var(--surface-alt)',
                            border: splWinningSeasons.length > 0 ? '1.5px solid rgba(56, 189, 248, 0.5)' : '1px solid var(--border)',
                            color: splWinningSeasons.length > 0 ? '#0284c7' : 'var(--muted)',
                            letterSpacing: '0.02em',
                          }}>
                            🏆 {splWinningSeasons.length}x CHAMPION
                          </span>
                          <div style={{ fontSize: '0.76rem', fontWeight: 800, color: 'var(--text)' }}>
                            {loc} • {splWinningSeasons.length > 0 ? `${splWinningSeasons.length} Times SPL Winner` : 'Contender'}
                          </div>
                          <p style={{ margin: 0, fontSize: '0.71rem', color: 'var(--muted)', lineHeight: 1.4, flex: 1 }}>
                            {splWinningSeasons.length > 0 
                              ? `Won in: ${splWinningSeasons.map(s => s.monthName.slice(0,3)).join(', ')} ${trophyYear === 'all_time' ? '' : `(${trophyYear})`}`
                              : `In contention for ${yrNum} seasons`}
                          </p>
                          <span style={{
                            fontSize: '0.7rem',
                            fontWeight: 900,
                            color: '#0284c7',
                            background: 'rgba(56, 189, 248, 0.1)',
                            padding: '6px 14px',
                            borderRadius: '8px',
                            border: '1px solid rgba(56, 189, 248, 0.25)',
                            marginTop: 'auto',
                            width: '100%',
                            transition: 'all 0.15s ease',
                          }}>
                            View Ceremony ({splWinningSeasons.length} Seasons) →
                          </span>
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════
                VIEW 2: 🏆 ALL TROPHIES VIEW
                - If 'all_time': Exactly 3 Grand Trophies with Full All-Time Winners Leaderboard
                - If single year (2026/2025): 12 Monthly Boxes per League
            ══════════════════════════════════════════════════════════ */}
            {seasonCategoryFilter !== 'locations' && (() => {
              const rawLeagues: Array<{
                id: 'rpl' | 'wpl' | 'spl';
                title: string;
                subtitle: string;
                icon: string;
                trophyType: 'fifa_globe' | 'webb_ellis' | 'icc_pillars';
                color: string;
              }> = [
                {
                  id: 'rpl',
                  title: 'RPL — Revenue Premier League Cup',
                  subtitle: 'All-Time Gross Fee Revenue Collections Championship',
                  icon: '💰',
                  trophyType: 'fifa_globe',
                  color: '#f59e0b',
                },
                {
                  id: 'wpl',
                  title: 'WPL — Walk-in Premier League Cup',
                  subtitle: 'All-Time Physical Walk-in Footfall Championship',
                  icon: '🚶',
                  trophyType: 'webb_ellis',
                  color: '#10b981',
                },
                {
                  id: 'spl',
                  title: 'SPL — Sales Premier League Cup',
                  subtitle: 'All-Time Student Admissions Volume Championship',
                  icon: '🎓',
                  trophyType: 'icc_pillars',
                  color: '#0284c7',
                },
              ];
              const leaguesToRender = rawLeagues.filter(l => seasonCategoryFilter === 'all' || seasonCategoryFilter === l.id);

              // ─── IF ALL TIME: DISPLAY EXACTLY 3 GRAND LEAGUE TROPHIES ───
              if (trophyYear === 'all_time') {
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                      gap: '24px',
                    }}>
                      {leaguesToRender.map((league) => {
                        // Aggregate all historical winners across 2026 (completed) and 2025
                        const allSeasonsCombined = [...monthsData2026.filter(d => !d.isFutureMonth), ...monthsData2025];
                        const locWinMap: Record<string, { wins: number; totalSales: number; totalCount: number }> = {};
                        
                        LOCATIONS.forEach(l => {
                          locWinMap[l] = { wins: 0, totalSales: 0, totalCount: 0 };
                        });

                        const allWinnersList: Array<{
                          seasonNumber: number;
                          monthName: string;
                          year: number;
                          winnerLoc: string;
                          metricFormatted: string;
                          counselors: string[];
                        }> = [];

                        allSeasonsCombined.forEach(d => {
                          const winner = league.id === 'rpl' ? d.rplWinner : (league.id === 'wpl' ? d.wplWinner : d.splWinner);
                          if (winner && winner.loc) {
                            if (!locWinMap[winner.loc]) locWinMap[winner.loc] = { wins: 0, totalSales: 0, totalCount: 0 };
                            locWinMap[winner.loc].wins += 1;
                            locWinMap[winner.loc].totalSales += (winner as any).sales || d.locSalesMap[winner.loc]?.sales || 0;
                            locWinMap[winner.loc].totalCount += (winner as any).count || 0;

                            const metricFormatted = league.id === 'rpl'
                              ? `₹${(((winner as any).sales || 0) / 100000).toFixed(2)}L Revenue`
                              : (league.id === 'wpl' ? `${(winner as any).count} Walk-ins` : `${(winner as any).count} Admissions`);

                            allWinnersList.push({
                              seasonNumber: d.m,
                              monthName: d.mName,
                              year: d.year || 2026,
                              winnerLoc: winner.loc,
                              metricFormatted,
                              counselors: Array.from((winner as any).counselors || d.locSalesMap[winner.loc]?.counselors || []),
                            });
                          }
                        });

                        const sortedRankings = Object.entries(locWinMap)
                          .map(([name, data]) => ({
                            name,
                            wins: data.wins,
                            totalMetric: league.id === 'rpl' 
                              ? `₹${(data.totalSales / 100000).toFixed(2)}L Collected`
                              : (league.id === 'wpl' ? `${data.totalCount} Walk-ins` : `${data.totalCount} Enrolled`),
                          }))
                          .sort((a, b) => b.wins - a.wins)
                          .map((item, idx) => ({ ...item, rank: idx + 1 }));

                        const topCampus = sortedRankings[0] || { name: 'Hyderabad', wins: 0, totalMetric: '0' };

                        return (
                          <div
                            key={league.id}
                            onClick={() => {
                              setSelectedAllTimeLeagueModal({
                                id: league.id,
                                title: league.title,
                                subtitle: league.subtitle,
                                icon: league.icon,
                                trophyType: league.trophyType,
                                color: league.color,
                                topCampus: { name: topCampus.name, wins: topCampus.wins, metricFormatted: topCampus.totalMetric },
                                rankings: sortedRankings,
                                allWinners: allWinnersList,
                              });
                            }}
                            style={{
                              background: `radial-gradient(ellipse at top, ${league.color}18 0%, var(--card-bg) 70%)`,
                              border: `1.5px solid ${league.color}44`,
                              borderRadius: '16px',
                              padding: '32px 24px 22px',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              textAlign: 'center',
                              gap: '12px',
                              boxShadow: `0 8px 30px ${league.color}14`,
                              cursor: 'pointer',
                              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                              minHeight: '420px',
                              position: 'relative',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'translateY(-6px)';
                              e.currentTarget.style.borderColor = league.color;
                              e.currentTarget.style.boxShadow = `0 18px 45px ${league.color}28`;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.borderColor = `${league.color}44`;
                              e.currentTarget.style.boxShadow = `0 8px 30px ${league.color}14`;
                            }}
                          >
                            <ChampionshipTrophy3D type={league.trophyType} size={180} />
                            
                            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: 'var(--text)', lineHeight: 1.2 }}>
                              {league.icon} {league.title}
                            </h3>
                            
                            <span style={{
                              fontSize: '0.82rem',
                              fontWeight: 900,
                              padding: '6px 18px',
                              borderRadius: '9999px',
                              background: `linear-gradient(135deg, ${league.color}26, ${league.color}14)`,
                              border: `1.5px solid ${league.color}66`,
                              color: league.color,
                              letterSpacing: '0.02em',
                            }}>
                              👑 #1 All-Time: {topCampus.name} ({topCampus.wins} Titles)
                            </span>

                            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--muted)' }}>
                              {league.subtitle}
                            </div>

                            <p style={{ margin: '4px 0 0 0', fontSize: '0.76rem', color: 'var(--text)', fontWeight: 800 }}>
                              Total {allWinnersList.length} Historic Championship Seasons Awarded
                            </p>

                            <button
                              type="button"
                              style={{
                                marginTop: 'auto',
                                width: '100%',
                                padding: '10px 16px',
                                borderRadius: '10px',
                                border: `1.5px solid ${league.color}55`,
                                background: `${league.color}18`,
                                color: league.color,
                                fontSize: '0.78rem',
                                fontWeight: 900,
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                              }}
                            >
                              View All-Time Leaderboard &amp; Winners ({allWinnersList.length} Seasons) →
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              }

              // ─── IF SINGLE YEAR (2026 OR 2025): DISPLAY 12 MONTHLY BOXES PER LEAGUE ───
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '36px' }}>
                  {leaguesToRender.map((league) => {
                    const currYearData = yrNum === 2026 ? monthsData2026 : monthsData2025;

                    return (
                      <div key={league.id} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '1.4rem' }}>{league.icon}</span>
                            <div>
                              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 900, color: 'var(--text)' }}>
                                {league.title} ({yrNum})
                              </h3>
                              <span style={{ fontSize: '0.76rem', color: 'var(--muted)', fontWeight: 700 }}>
                                {league.subtitle}
                              </span>
                            </div>
                          </div>
                          <span style={{
                            fontSize: '0.74rem', fontWeight: 900, color: league.color,
                            background: `${league.color}14`, padding: '3px 12px', borderRadius: '6px',
                            border: `1px solid ${league.color}35`
                          }}>
                            12 Monthly Cups
                          </span>
                        </div>

                        {/* 12 Monthly Boxes Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '18px' }}>
                          {currYearData.map((d) => {
                            const winner = league.id === 'rpl' ? d.rplWinner : (league.id === 'wpl' ? d.wplWinner : d.splWinner);
                            const sorted = league.id === 'rpl' ? d.rplSorted : (league.id === 'wpl' ? d.wplSorted : d.splSorted);

                            return (
                              <div
                                key={`${league.id}-${yrNum}-${d.m}`}
                                onClick={() => {
                                  if (winner) {
                                    setSelectedSeasonModal({
                                      seasonNumber: d.m,
                                      seasonName: `Season ${d.m} (${d.mName} ${yrNum}) ${league.id.toUpperCase()} Cup`,
                                      totalMonthSales: d.totalMonthSales,
                                      winnerBranch: { name: winner.loc, sales: (winner as any).sales || d.locSalesMap[winner.loc]?.sales || 0, team: Array.from((winner as any).counselors || d.locSalesMap[winner.loc]?.counselors || []) },
                                      runnerBranch: sorted[1] ? { name: sorted[1].loc, sales: (sorted[1] as any).sales || d.locSalesMap[sorted[1].loc]?.sales || 0, team: Array.from((sorted[1] as any).counselors || d.locSalesMap[sorted[1].loc]?.counselors || []) } : null,
                                      championCoun: d.championCoun,
                                      allCounselors: d.sortedCoun.map(c => ({ ...c, branch: getCounselorLocation(c.name) })),
                                      mLeads: d.mLeads,
                                    });
                                  }
                                }}
                                style={{
                                  background: 'var(--card-bg)',
                                  border: '1.5px solid var(--border)',
                                  borderRadius: '8px',
                                  padding: '20px 18px 16px',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  textAlign: 'center',
                                  gap: '8px',
                                  boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
                                  cursor: winner ? 'pointer' : 'default',
                                  transition: 'all 0.15s ease',
                                  minHeight: '340px',
                                  opacity: d.isFutureMonth ? 0.85 : 1,
                                }}
                                onMouseEnter={(e) => {
                                  if (winner) {
                                    e.currentTarget.style.transform = 'translateY(-4px)';
                                    e.currentTarget.style.borderColor = league.color;
                                    e.currentTarget.style.boxShadow = `0 10px 28px ${league.color}26`;
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (winner) {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.borderColor = 'var(--border)';
                                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.04)';
                                  }
                                }}
                              >
                                <ChampionshipTrophy3D type={league.trophyType} size={155} />
                                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 900, color: 'var(--text)', lineHeight: 1.3 }}>
                                  {league.icon} {league.id.toUpperCase()} Cup
                                </h4>
                                <span style={{
                                  fontSize: '0.78rem',
                                  fontWeight: 900,
                                  padding: '4px 14px',
                                  borderRadius: '6px',
                                  background: winner ? 'rgba(16,185,129,0.12)' : (d.isFutureMonth ? 'rgba(245,158,11,0.1)' : 'rgba(59,130,246,0.1)'),
                                  border: winner ? '1px solid rgba(16,185,129,0.3)' : (d.isFutureMonth ? '1px dashed rgba(245,158,11,0.4)' : '1px solid rgba(59,130,246,0.3)'),
                                  color: winner ? '#10b981' : (d.isFutureMonth ? '#f59e0b' : '#3b82f6'),
                                }}>
                                  {winner ? winner.loc : (d.isFutureMonth ? 'Upcoming' : 'Active Season')}
                                </span>
                                <div style={{ fontSize: '0.74rem', fontWeight: 800, color: winner ? 'var(--text)' : 'var(--muted)' }}>
                                  {winner ? `Champions ${d.mName} ${yrNum}` : `Season ${d.m} • ${d.mName} ${yrNum}`}
                                </div>
                                <p style={{ margin: 0, fontSize: '0.71rem', color: 'var(--muted)', lineHeight: 1.4, flex: 1 }}>
                                  {winner 
                                    ? (league.id === 'rpl' ? `₹${(((winner as any).sales || 0) / 100000).toFixed(2)}L Fee Revenue generated.` : (league.id === 'wpl' ? `${(winner as any).count} Walk-in Candidates handled.` : `${(winner as any).count} Admissions enrolled.`))
                                    : (d.isFutureMonth ? `Trophy awarded on ${d.unlockDateText} upon month conclusion.` : `Ongoing season tracking.`)}
                                </p>
                                <span style={{ fontSize: '0.65rem', fontWeight: 800, color: winner ? league.color : 'var(--muted)', marginTop: 'auto' }}>
                                  {winner ? 'View Leaderboard →' : (d.isFutureMonth ? '🔒 Upcoming Trophy' : 'View Live Standings →')}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}          </div>
        );
      })()}      {/* ══════════════════════════════════════════════════════
          TAB 1: 12-SEASONS GRAND TROPHIES & BADGES HALL OF FAME
      ══════════════════════════════════════════════════════ */}
      {activeTab === 'badges' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          


          {/* Category Filter Tabs */}
          <div style={{ display: 'inline-flex', background: 'var(--surface-alt)', padding: '4px', borderRadius: '12px', border: '1px solid var(--border)', flexWrap: 'wrap', gap: '4px' }}>
            {[
              { id: 'all', label: '🌟 All Badges & Medals' },
              { id: 'revenue', label: '💰 Revenue Badges' },
              { id: 'enrollment', label: '🎓 Enrollment Badges' },
              { id: 'walkin', label: '🚶 Walk-in Badges' },
              { id: 'dropout', label: '🛡️ Retention Badges' },
              { id: 'season', label: '🥇 Season Medals' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setBadgeCategoryFilter(cat.id as any)}
                style={{
                  padding: '7px 16px', borderRadius: '9px', fontSize: '0.8rem', fontWeight: 800, border: 'none',
                  background: badgeCategoryFilter === cat.id ? 'var(--primary)' : 'transparent',
                  color: badgeCategoryFilter === cat.id ? '#fff' : 'var(--text)', cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>



          {/* ══════════════════════════════════════════════════════════════
              SECTION 2: MASTER BADGES & AWARDED COUNSELLORS (CLICKABLE)
          ══════════════════════════════════════════════════════════════ */}
          {/* ══════════════════════════════════════════════════════════
              SECTION 2: MASTER BADGES & MILESTONES (SHIELD SHAPE)
          ══════════════════════════════════════════════════════════ */}
          {(badgeCategoryFilter !== 'season') && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 900, color: 'var(--text)' }}>
                  🛡️ Master Milestone Badges (Click any to view Leaderboard)
                </h3>
                <span style={{ fontSize: '0.76rem', color: 'var(--muted)', fontWeight: 700 }}>
                  Showing pure data-driven milestones unlocked by all counselors
                </span>
              </div>

              {/* Master Badges Grid (Shield Shapes) */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '18px' }}>
                {ALL_BADGES
                  .filter((b) => b.category !== 'season' && (badgeCategoryFilter === 'all' || b.category === badgeCategoryFilter))
                  .map((b) => {
                    const qualifiers = counselorGamifications.filter((cg) => {
                      const badgeObj = cg.badges.find((cb) => cb.id === b.id);
                      return badgeObj?.isUnlocked;
                    });

                    return (
                      <div
                        key={b.id}
                        onClick={() => setSelectedBadgeModal(b)}
                        style={{
                          background: 'var(--card-bg)',
                          border: '1.5px solid var(--border)',
                          borderRadius: '8px',
                          padding: '28px 20px 22px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          textAlign: 'center',
                          gap: '12px',
                          boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          minHeight: '340px',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-4px)';
                          e.currentTarget.style.borderColor = 'var(--primary)';
                          e.currentTarget.style.boxShadow = '0 10px 28px rgba(99,102,241,0.16)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.borderColor = 'var(--border)';
                          e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.04)';
                        }}
                      >
                        <BadgeCrest tier={b.tier} size={140} isUnlocked={true} icon={b.icon} shape="shield" />
                        <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 900, color: 'var(--text)', lineHeight: 1.3 }}>
                          {b.name}
                        </h4>
                        <span style={{
                          fontSize: '0.74rem', fontWeight: 900, padding: '3px 12px', borderRadius: '6px',
                          background: qualifiers.length > 0 ? 'rgba(16,185,129,0.12)' : 'var(--surface-alt)',
                          border: qualifiers.length > 0 ? '1px solid rgba(16,185,129,0.3)' : '1px solid var(--border)',
                          color: qualifiers.length > 0 ? '#10b981' : 'var(--muted)',
                        }}>
                          {qualifiers.length} Awarded
                        </span>
                        <p style={{ margin: 0, fontSize: '0.71rem', color: 'var(--muted)', lineHeight: 1.5, flex: 1 }}>
                          {b.description}
                        </p>
                        <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--primary)', marginTop: 'auto' }}>
                          View Leaderboard →
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════
              SECTION 3: OFFICIAL SEASON CHAMPIONSHIP MEDALS (MEDAL SHAPES ONLY)
          ══════════════════════════════════════════════════════════ */}
          {(badgeCategoryFilter === 'all' || badgeCategoryFilter === 'season') && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: badgeCategoryFilter === 'all' ? '12px' : '0px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 900, color: 'var(--text)' }}>
                  🥇 Official Season Championship Medals (Pure Medal Shape)
                </h3>
                <span style={{ fontSize: '0.76rem', color: 'var(--muted)', fontWeight: 700 }}>
                  Awarded to top performing counselors upon calendar season conclusion
                </span>
              </div>

              {/* Season Medals Grid (Pure Medal Shapes with Ribbon) */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '18px' }}>
                {ALL_BADGES
                  .filter((b) => b.category === 'season')
                  .map((b) => {
                    const qualifiers = counselorGamifications.filter((cg) => {
                      const badgeObj = cg.badges.find((cb) => cb.id === b.id);
                      return badgeObj?.isUnlocked;
                    });

                    return (
                      <div
                        key={b.id}
                        onClick={() => setSelectedBadgeModal(b)}
                        style={{
                          background: 'var(--card-bg)',
                          border: '1.5px solid var(--border)',
                          borderRadius: '8px',
                          padding: '28px 20px 22px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          textAlign: 'center',
                          gap: '12px',
                          boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          minHeight: '340px',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-4px)';
                          e.currentTarget.style.borderColor = '#f59e0b';
                          e.currentTarget.style.boxShadow = '0 10px 28px rgba(245,158,11,0.16)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.borderColor = 'var(--border)';
                          e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.04)';
                        }}
                      >
                        {/* Pure Championship Medal with Ribbon */}
                        <BadgeCrest tier={b.tier} size={140} isUnlocked={true} icon={b.icon} shape="medal" />
                        <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 900, color: 'var(--text)', lineHeight: 1.3 }}>
                          {b.name}
                        </h4>
                        <span style={{
                          fontSize: '0.74rem', fontWeight: 900, padding: '3px 12px', borderRadius: '6px',
                          background: qualifiers.length > 0 ? 'rgba(245,158,11,0.14)' : 'var(--surface-alt)',
                          border: qualifiers.length > 0 ? '1px solid rgba(245,158,11,0.35)' : '1px solid var(--border)',
                          color: qualifiers.length > 0 ? '#f59e0b' : 'var(--muted)',
                        }}>
                          {qualifiers.length} Awarded
                        </span>
                        <p style={{ margin: 0, fontSize: '0.71rem', color: 'var(--muted)', lineHeight: 1.5, flex: 1 }}>
                          {b.description}
                        </p>
                        <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#f59e0b', marginTop: 'auto' }}>
                          View Medal Leaderboard →
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          TAB 2: COUNSELORS POINTS TABLE & CHAMPIONSHIP PODIUM
      ══════════════════════════════════════════════════════ */}
      {activeTab === 'points_table' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Championship Counselor Podium */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '16px',
            alignItems: 'flex-end',
          }}>
            {/* 2nd Place Counselor */}
            <div style={{
              background: 'var(--card-bg)',
              border: '1.5px solid rgba(148, 163, 184, 0.4)',
              borderRadius: '18px',
              padding: '22px',
              textAlign: 'center',
              boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
            }}>
              <div style={{
                width: '46px', height: '46px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #94a3b8, #64748b)',
                color: '#fff', fontSize: '1.1rem', fontWeight: 900,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 10px auto',
                boxShadow: '0 4px 12px rgba(148, 163, 184, 0.35)',
              }}>
                🥈
              </div>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Runner Up Counselor (#2)
              </span>
              <h3 style={{ margin: '4px 0 2px 0', fontSize: '1.08rem', fontWeight: 900, color: 'var(--text)' }}>
                {counselorGamifications[1]?.name || '—'}
              </h3>
              <p style={{ margin: '0 0 8px 0', fontSize: '0.76rem', color: 'var(--muted)' }}>
                📍 {counselorGamifications[1]?.branchName || '—'}
              </p>
              <div style={{
                display: 'inline-block',
                fontSize: '0.66rem',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: '4px',
                background: counselorGamifications[1]?.tierColor || '#94a3b8',
                color: '#fff',
                textTransform: 'uppercase',
                marginBottom: '10px',
              }}>
                Lvl {counselorGamifications[1]?.level || 3} • {counselorGamifications[1]?.tierName || 'Silver Specialist'}
              </div>
              <div style={{
                marginTop: '6px', padding: '8px', borderRadius: '8px',
                background: 'var(--surface-alt)', fontSize: '0.92rem', fontWeight: 900,
                color: '#94a3b8', fontFamily: 'var(--font-mono)',
              }}>
                {counselorGamifications[1]?.xp || 0} PTS
              </div>
            </div>

            {/* 1st Place Counselor Champion */}
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
                👑 {monthShortName} Counselor MVP
              </div>
              <div style={{
                width: '56px', height: '56px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                color: '#fff', fontSize: '1.4rem', fontWeight: 900,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 10px auto',
                boxShadow: '0 6px 16px rgba(245, 158, 11, 0.35)',
              }}>
                🏆
              </div>
              <span style={{ fontSize: '0.72rem', fontWeight: 900, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Top Counselor (#1)
              </span>
              <h3 style={{ margin: '4px 0 2px 0', fontSize: '1.24rem', fontWeight: 900, color: 'var(--text)' }}>
                {counselorGamifications[0]?.name || '—'}
              </h3>
              <p style={{ margin: '0 0 8px 0', fontSize: '0.78rem', color: 'var(--muted)' }}>
                📍 {counselorGamifications[0]?.branchName || '—'}
              </p>
              <div style={{
                display: 'inline-block',
                fontSize: '0.68rem',
                fontWeight: 800,
                padding: '2px 9px',
                borderRadius: '4px',
                background: counselorGamifications[0]?.tierColor || '#f59e0b',
                color: '#fff',
                textTransform: 'uppercase',
                marginBottom: '10px',
              }}>
                Lvl {counselorGamifications[0]?.level || 5} • {counselorGamifications[0]?.tierName || 'Gold Veteran'}
              </div>
              <div style={{
                marginTop: '6px', padding: '9px', borderRadius: '10px',
                background: 'rgba(245, 158, 11, 0.15)', fontSize: '1.08rem', fontWeight: 900,
                color: '#f59e0b', fontFamily: 'var(--font-mono)',
              }}>
                {counselorGamifications[0]?.xp || 0} PTS
              </div>
            </div>

            {/* 3rd Place Counselor */}
            <div style={{
              background: 'var(--card-bg)',
              border: '1.5px solid rgba(205, 127, 50, 0.4)',
              borderRadius: '18px',
              padding: '22px',
              textAlign: 'center',
              boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
            }}>
              <div style={{
                width: '46px', height: '46px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #cd7f32, #a0522d)',
                color: '#fff', fontSize: '1.1rem', fontWeight: 900,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 10px auto',
                boxShadow: '0 4px 12px rgba(205, 127, 50, 0.35)',
              }}>
                🥉
              </div>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#cd7f32', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Bronze Tier Counselor (#3)
              </span>
              <h3 style={{ margin: '4px 0 2px 0', fontSize: '1.08rem', fontWeight: 900, color: 'var(--text)' }}>
                {counselorGamifications[2]?.name || '—'}
              </h3>
              <p style={{ margin: '0 0 8px 0', fontSize: '0.76rem', color: 'var(--muted)' }}>
                📍 {counselorGamifications[2]?.branchName || '—'}
              </p>
              <div style={{
                display: 'inline-block',
                fontSize: '0.66rem',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: '4px',
                background: counselorGamifications[2]?.tierColor || '#cd7f32',
                color: '#fff',
                textTransform: 'uppercase',
                marginBottom: '10px',
              }}>
                Lvl {counselorGamifications[2]?.level || 2} • {counselorGamifications[2]?.tierName || 'Bronze Apprentice'}
              </div>
              <div style={{
                marginTop: '6px', padding: '8px', borderRadius: '8px',
                background: 'var(--surface-alt)', fontSize: '0.92rem', fontWeight: 900,
                color: '#cd7f32', fontFamily: 'var(--font-mono)',
              }}>
                {counselorGamifications[2]?.xp || 0} PTS
              </div>
            </div>
          </div>

          <div style={{
            background: 'var(--card-bg)',
            border: '1.5px solid var(--border)',
            borderRadius: '18px',
            padding: '24px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '18px' }}>
              <div>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 900, margin: 0, color: 'var(--text)' }}>
                  {selectedMonth} Counselors Performance &amp; Points Table
                </h2>
                <p style={{ fontSize: '0.78rem', color: 'var(--muted)', margin: '4px 0 0 0' }}>
                  Live breakdown of student counseling volume, enrollment completions, conversion multipliers, and total championship points.
                </p>
              </div>

              <div style={{
                padding: '6px 14px', borderRadius: '8px',
                background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)',
                fontSize: '0.76rem', fontWeight: 800,
              }}>
                Formula: Intakes (+25) + Enrolled (+100) + Quality (+250) + Streak (+50)
              </div>
            </div>

            <div className="table-wrapper">
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '920px' }}>
                <thead>
                  <tr style={{ borderBottom: '1.5px solid var(--border)', background: 'var(--surface-alt, rgba(255,255,255,0.02))' }}>
                    <th style={{ padding: '12px 16px', fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', textAlign: 'left' }}>Rank &amp; Counselor</th>
                    <th style={{ padding: '12px 16px', fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', textAlign: 'left' }}>Campus Branch</th>
                    <th style={{ padding: '12px 16px', fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', textAlign: 'center' }}>Total Intakes</th>
                    <th style={{ padding: '12px 16px', fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', textAlign: 'center' }}>Completed</th>
                    <th style={{ padding: '12px 16px', fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', textAlign: 'center' }}>Conversion %</th>
                    <th style={{ padding: '12px 16px', fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', textAlign: 'center' }}>Active Streak</th>
                    <th style={{ padding: '12px 16px', fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', textAlign: 'center' }}>Badges</th>
                    <th style={{ padding: '12px 16px', fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', textAlign: 'right' }}>Total Points (PTS)</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCounselors.map((cg, idx) => (
                    <tr
                      key={cg.id}
                      style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s ease' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-alt)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      {/* Rank & Counselor */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            width: '26px', height: '26px', borderRadius: '50%',
                            background: idx === 0 ? '#f59e0b' : idx === 1 ? '#94a3b8' : idx === 2 ? '#cd7f32' : 'var(--surface-alt)',
                            color: idx <= 2 ? '#fff' : 'var(--muted)', fontWeight: 900, fontSize: '0.74rem',
                          }}>
                            #{idx + 1}
                          </span>
                          <div style={{
                            width: '36px', height: '36px', borderRadius: '50%',
                            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                            color: '#fff', fontWeight: 900, fontSize: '0.8rem',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            {getInitials(cg.name)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--text)' }}>
                              {cg.name}
                            </div>
                            <span style={{
                              fontSize: '0.66rem', fontWeight: 800, color: cg.tierColor,
                            }}>
                              Lvl {cg.level} • {cg.tierName}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Campus Branch */}
                      <td style={{ padding: '14px 16px', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text)' }}>
                        {cg.branchName}
                      </td>

                      {/* Total Intakes */}
                      <td style={{ padding: '14px 16px', textAlign: 'center', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                        {Math.max(cg.completedCount + 2, 4)}
                      </td>

                      {/* Completed */}
                      <td style={{ padding: '14px 16px', textAlign: 'center', fontWeight: 800, color: '#10b981', fontFamily: 'var(--font-mono)' }}>
                        {cg.completedCount}
                      </td>

                      {/* Conversion Rate */}
                      <td style={{ padding: '14px 16px', textAlign: 'center', fontWeight: 800, color: '#10b981', fontFamily: 'var(--font-mono)' }}>
                        {cg.conversionRate}%
                      </td>

                      {/* Streak */}
                      <td style={{ padding: '14px 16px', textAlign: 'center', fontWeight: 800, color: '#f59e0b' }}>
                        🔥 {cg.streakDays}d
                      </td>

                      {/* Badges */}
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <span style={{
                          fontSize: '0.74rem', fontWeight: 900, padding: '3px 8px', borderRadius: '6px',
                          background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)',
                        }}>
                          {cg.badges.filter(b => b.isUnlocked).length} 🎖️
                        </span>
                      </td>

                      {/* Total Points */}
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <span style={{
                          fontSize: '1rem', fontWeight: 900, color: 'var(--primary)', fontFamily: 'var(--font-mono)',
                        }}>
                          {cg.xp} PTS
                        </span>
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
          TAB 3: CAMPUS STANDINGS & 3D PODIUM
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
          TAB 4: CAMPUS COMPARISON MATRIX
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
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          TAB 5: COUNSELOR ROSTER
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
              {selectedMonth} Counselor Roster
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
          TAB 6: DAILY QUESTS
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

            {/* ══════════════════════════════════════════════════════
          SEASON CHAMPIONSHIP & TROPHIES LEADERBOARD MODAL
      ══════════════════════════════════════════════════════ */}
      {selectedSeasonModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 12500, padding: '20px'
        }}>
          <div style={{
            background: 'var(--card-bg, #111827)', border: '1.5px solid var(--border)',
            borderRadius: '24px', width: '100%', maxWidth: '940px', maxHeight: '88vh',
            display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 80px rgba(0,0,0,0.8)'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '20px 28px', borderBottom: '1px solid var(--border)', background: 'var(--surface-alt)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <ChampionshipTrophy3D type="winner_gold" size={60} />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.68rem', fontWeight: 900, textTransform: 'uppercase', padding: '2px 8px', borderRadius: '4px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#fff' }}>
                      OFFICIAL SEASON {selectedSeasonModal.seasonNumber} TROPHY
                    </span>
                  </div>
                  <h3 style={{ margin: '4px 0 2px 0', fontSize: '1.3rem', fontWeight: 900, color: 'var(--text)' }}>
                    {selectedSeasonModal.seasonName} Championship &amp; Medals
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 600 }}>
                    Total Season Revenue Collected: ₹{(selectedSeasonModal.totalMonthSales / 100000).toFixed(2)} Lakhs across {selectedSeasonModal.mLeads.length} admissions.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedSeasonModal(null)}
                style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', fontSize: '1.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                ✕
              </button>
            </div>

            {/* Modal Body: Trophies, Winning Team Medals & Leaderboard Table */}
            <div style={{ overflowY: 'auto', flex: 1, padding: '22px 28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Podium Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                {/* Winner Campus Plaque */}
                {selectedSeasonModal.winnerBranch && (
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.14) 0%, rgba(180, 83, 9, 0.06) 100%)',
                    border: '1.5px solid rgba(245, 158, 11, 0.5)', borderRadius: '16px', padding: '16px',
                    display: 'flex', alignItems: 'center', gap: '14px'
                  }}>
                    <ChampionshipTrophy3D type="winner_gold" size={54} />
                    <div>
                      <span style={{ fontSize: '0.64rem', fontWeight: 900, textTransform: 'uppercase', color: '#f59e0b' }}>
                        🏆 WINNER CAMPUS (1ST PLACE)
                      </span>
                      <h4 style={{ margin: '2px 0 0 0', fontSize: '1rem', fontWeight: 900, color: 'var(--text)' }}>
                        {selectedSeasonModal.winnerBranch.name}
                      </h4>
                      <span style={{ fontSize: '0.8rem', fontWeight: 900, color: '#10b981' }}>
                        ₹{(selectedSeasonModal.winnerBranch.sales / 100000).toFixed(2)}L Collected
                      </span>
                    </div>
                  </div>
                )}

                {/* Runner-Up Campus Plaque */}
                {selectedSeasonModal.runnerBranch && (
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(148, 163, 184, 0.12) 0%, rgba(71, 85, 105, 0.05) 100%)',
                    border: '1.5px solid rgba(148, 163, 184, 0.4)', borderRadius: '16px', padding: '16px',
                    display: 'flex', alignItems: 'center', gap: '14px'
                  }}>
                    <ChampionshipTrophy3D type="runner_silver" size={50} />
                    <div>
                      <span style={{ fontSize: '0.64rem', fontWeight: 900, textTransform: 'uppercase', color: '#94a3b8' }}>
                        🥈 RUNNER-UP (2ND PLACE)
                      </span>
                      <h4 style={{ margin: '2px 0 0 0', fontSize: '0.98rem', fontWeight: 900, color: 'var(--text)' }}>
                        {selectedSeasonModal.runnerBranch.name}
                      </h4>
                      <span style={{ fontSize: '0.8rem', fontWeight: 900, color: '#10b981' }}>
                        ₹{(selectedSeasonModal.runnerBranch.sales / 100000).toFixed(2)}L Collected
                      </span>
                    </div>
                  </div>
                )}

                {/* MVP Closer Plaque */}
                {selectedSeasonModal.championCoun && (
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(139, 92, 246, 0.06) 100%)',
                    border: '1.5px solid rgba(99, 102, 241, 0.4)', borderRadius: '16px', padding: '16px',
                    display: 'flex', alignItems: 'center', gap: '14px'
                  }}>
                    <ChampionshipTrophy3D type="counselor_mvp" size={50} />
                    <div>
                      <span style={{ fontSize: '0.64rem', fontWeight: 900, textTransform: 'uppercase', color: 'var(--primary)' }}>
                        👑 MVP CLOSER OF THE SEASON
                      </span>
                      <h4 style={{ margin: '2px 0 0 0', fontSize: '0.98rem', fontWeight: 900, color: 'var(--text)' }}>
                        {selectedSeasonModal.championCoun.name}
                      </h4>
                      <span style={{ fontSize: '0.8rem', fontWeight: 900, color: '#10b981' }}>
                        ₹{(selectedSeasonModal.championCoun.sales / 100000).toFixed(2)}L • {selectedSeasonModal.championCoun.count} Enrolled
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Winning Team Gold Medals Awarded Roster */}
              {selectedSeasonModal.winnerBranch && (
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '16px 20px' }}>
                  <span style={{ fontSize: '0.74rem', fontWeight: 900, textTransform: 'uppercase', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>🥇 Winning Team Gold Season Medals Awarded To:</span>
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
                    {selectedSeasonModal.winnerBranch.team.map((cName) => (
                      <span
                        key={cName}
                        style={{
                          fontSize: '0.78rem', fontWeight: 900, padding: '4px 12px', borderRadius: '8px',
                          background: 'rgba(245, 158, 11, 0.18)', color: 'var(--text)', border: '1px solid rgba(245, 158, 11, 0.45)',
                          display: 'inline-flex', alignItems: 'center', gap: '4px'
                        }}
                      >
                        <span>🥇</span>
                        <span>{cName}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Full Official Season Leaderboard Table */}
              <div style={{ background: 'var(--surface-alt)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
                <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 900, color: 'var(--text)' }}>
                    🏆 Official Leaderboard for {selectedSeasonModal.seasonName}
                  </h4>
                  <span style={{ fontSize: '0.74rem', color: 'var(--muted)', fontWeight: 700 }}>
                    Ranked by Monthly Sales Collected
                  </span>
                </div>

                <div className="table-wrapper">
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                    <thead>
                      <tr style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
                        <th style={{ textAlign: 'left', padding: '12px 16px' }}>Rank &amp; Counsellor</th>
                        <th style={{ textAlign: 'left', padding: '12px 16px' }}>Campus Branch</th>
                        <th style={{ textAlign: 'center', padding: '12px 16px' }}>Total Sales</th>
                        <th style={{ textAlign: 'center', padding: '12px 16px' }}>Enrollments</th>
                        <th style={{ textAlign: 'center', padding: '12px 16px' }}>Season Medal</th>
                        <th style={{ textAlign: 'right', padding: '12px 16px' }}>Admissions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedSeasonModal.allCounselors.length > 0 ? (
                        selectedSeasonModal.allCounselors.map((c, idx) => {
                          const isWinnerTeam = selectedSeasonModal.winnerBranch?.team.includes(c.name);
                          const isRunnerTeam = selectedSeasonModal.runnerBranch?.team.includes(c.name);

                          return (
                            <tr key={c.name} style={{ borderBottom: '1px solid var(--border)' }}>
                              <td style={{ padding: '12px 16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  <span style={{
                                    width: '26px', height: '26px', borderRadius: '8px',
                                    background: idx === 0 ? 'linear-gradient(135deg, #f59e0b, #d97706)' : idx === 1 ? 'linear-gradient(135deg, #94a3b8, #64748b)' : idx === 2 ? 'linear-gradient(135deg, #b45309, #78350f)' : 'var(--surface)',
                                    color: idx < 3 ? '#fff' : 'var(--muted)',
                                    fontSize: '0.74rem', fontWeight: 900,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  }}>
                                    {idx + 1}
                                  </span>
                                  <strong style={{ fontSize: '0.88rem', color: 'var(--text)' }}>
                                    {c.name}
                                  </strong>
                                </div>
                              </td>
                              <td style={{ padding: '12px 16px', color: 'var(--muted)', fontWeight: 600 }}>
                                📍 {c.branch}
                              </td>
                              <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 900, color: '#10b981' }}>
                                ₹{(c.sales / 100000).toFixed(2)}L
                              </td>
                              <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 800 }}>
                                {c.count} Students
                              </td>
                              <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                {isWinnerTeam ? (
                                  <span style={{ fontSize: '0.72rem', fontWeight: 900, padding: '3px 8px', borderRadius: '6px', background: 'rgba(245, 158, 11, 0.18)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.4)' }}>
                                    🥇 Gold Medal
                                  </span>
                                ) : isRunnerTeam ? (
                                  <span style={{ fontSize: '0.72rem', fontWeight: 900, padding: '3px 8px', borderRadius: '6px', background: 'rgba(148, 163, 184, 0.15)', color: '#94a3b8', border: '1px solid rgba(148, 163, 184, 0.35)' }}>
                                    🥈 Silver Medal
                                  </span>
                                ) : (
                                  <span style={{ fontSize: '0.72rem', color: 'var(--muted)', fontWeight: 700 }}>
                                    Participant
                                  </span>
                                )}
                              </td>
                              <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const cleanName = c.name.toLowerCase().replace(/[_-]/g, ' ').trim();
                                    const matched = selectedSeasonModal.mLeads.filter((l: any) => {
                                      const cLead = (l.counselorName || l.metadata?.['Counsellor'] || '').toLowerCase().replace(/[_-]/g, ' ').trim();
                                      return cLead === cleanName;
                                    });
                                    setDrilldownStudentModal({
                                      title: `${c.name}'s Admissions for ${selectedSeasonModal.seasonName}`,
                                      records: matched
                                    });
                                  }}
                                  style={{
                                    padding: '5px 12px', borderRadius: '8px', fontSize: '0.76rem', fontWeight: 800,
                                    background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)',
                                    cursor: 'pointer'
                                  }}
                                >
                                  View Admissions →
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={6} style={{ textAlign: 'center', padding: '28px', color: 'var(--muted)', fontSize: '0.84rem' }}>
                            No counsellor records available for this season.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div style={{ padding: '14px 28px', borderTop: '1px solid var(--border)', background: 'var(--surface-alt)', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setSelectedSeasonModal(null)}
                style={{ padding: '8px 22px', borderRadius: '10px', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: '0.84rem', fontWeight: 800, cursor: 'pointer' }}
              >
                Close Championship
              </button>
            </div>

          </div>
        </div>
      )}


      {/* ══════════════════════════════════════════════════════
          BADGE & TROPHY DEEP-DIVE POPUP & LEADERBOARD MODAL
      ══════════════════════════════════════════════════════ */}
      {selectedBadgeModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 12000, padding: '20px'
        }}>
          <div style={{
            background: 'var(--card-bg, #111827)', border: '1.5px solid var(--border)',
            borderRadius: '24px', width: '100%', maxWidth: '880px', maxHeight: '88vh',
            display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 80px rgba(0,0,0,0.7)'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '22px 28px', borderBottom: '1px solid var(--border)', background: 'var(--surface-alt)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <BadgeCrest tier={selectedBadgeModal.tier} size={64} isUnlocked={true} icon={selectedBadgeModal.icon} />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.68rem', fontWeight: 900, textTransform: 'uppercase', padding: '2px 8px', borderRadius: '4px', background: 'var(--primary)', color: '#fff' }}>
                      {selectedBadgeModal.tier} Tier
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                      {selectedBadgeModal.category} Track
                    </span>
                  </div>
                  <h3 style={{ margin: '4px 0 2px 0', fontSize: '1.25rem', fontWeight: 900, color: 'var(--text)' }}>
                    {selectedBadgeModal.name}
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 600 }}>
                    {selectedBadgeModal.description}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedBadgeModal(null)}
                style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', fontSize: '1.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                ✕
              </button>
            </div>

            {/* Modal Body & Badge Leaderboard */}
            <div style={{ overflowY: 'auto', flex: 1, padding: '22px 28px' }}>
              {(() => {
                // Find all counselors who unlocked this specific badge and calculate their qualifying metrics & times achieved
                const qualifiers = counselorGamifications
                  .filter((cg) => {
                    const badgeObj = cg.badges.find((cb) => cb.id === selectedBadgeModal.id);
                    return badgeObj?.isUnlocked;
                  })
                  .sort((a, b) => {
                    if (selectedBadgeModal.category === 'revenue') return b.totalSales - a.totalSales;
                    if (selectedBadgeModal.category === 'walkin') return b.walkinCount - a.walkinCount;
                    return b.completedCount - a.completedCount;
                  });

                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Qualification Stats Summary */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
                      <div style={{ background: 'var(--surface)', padding: '14px 18px', borderRadius: '14px', border: '1px solid var(--border)' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)' }}>Total Awarded</span>
                        <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text)', marginTop: '2px' }}>
                          {qualifiers.length} Counsellors
                        </div>
                      </div>

                      <div style={{ background: 'var(--surface)', padding: '14px 18px', borderRadius: '14px', border: '1px solid var(--border)' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)' }}>Highest Performer</span>
                        <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#10b981', marginTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {qualifiers[0]?.name || '—'}
                        </div>
                      </div>

                      <div style={{ background: 'var(--surface)', padding: '14px 18px', borderRadius: '14px', border: '1px solid var(--border)' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)' }}>Peak Metric</span>
                        <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--primary)', marginTop: '2px' }}>
                          {qualifiers[0] ? (
                            selectedBadgeModal.category === 'revenue' ? `₹${(qualifiers[0].totalSales / 100000).toFixed(1)}L` :
                            selectedBadgeModal.category === 'walkin' ? `${qualifiers[0].walkinCount} Walk-ins` :
                            `${qualifiers[0].completedCount} Enrolled`
                          ) : '—'}
                        </div>
                      </div>
                    </div>

                    {/* Dedicated Leaderboard Table for this Badge */}
                    <div style={{ background: 'var(--surface-alt)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
                      <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 900, color: 'var(--text)' }}>
                          🏆 Official Leaderboard for {selectedBadgeModal.name}
                        </h4>
                        <span style={{ fontSize: '0.74rem', color: 'var(--muted)', fontWeight: 700 }}>
                          Ranked by Qualifying Performance
                        </span>
                      </div>

                      <div className="table-wrapper">
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                          <thead>
                            <tr style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
                              <th style={{ textAlign: 'left', padding: '12px 16px' }}>Rank &amp; Counsellor</th>
                              <th style={{ textAlign: 'left', padding: '12px 16px' }}>Campus Branch</th>
                              <th style={{ textAlign: 'center', padding: '12px 16px' }}>Total Sales</th>
                              <th style={{ textAlign: 'center', padding: '12px 16px' }}>Enrollments</th>
                              <th style={{ textAlign: 'center', padding: '12px 16px' }}>Times Unlocked</th>
                              <th style={{ textAlign: 'right', padding: '12px 16px' }}>Inspect</th>
                            </tr>
                          </thead>
                          <tbody>
                            {qualifiers.length > 0 ? (
                              qualifiers.map((q, idx) => (
                                <tr key={q.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.12s ease' }}>
                                  <td style={{ padding: '12px 16px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                      <span style={{
                                        width: '26px', height: '26px', borderRadius: '8px',
                                        background: idx === 0 ? 'linear-gradient(135deg, #f59e0b, #d97706)' : idx === 1 ? 'linear-gradient(135deg, #94a3b8, #64748b)' : idx === 2 ? 'linear-gradient(135deg, #b45309, #78350f)' : 'var(--surface)',
                                        color: idx < 3 ? '#fff' : 'var(--muted)',
                                        fontSize: '0.74rem', fontWeight: 900,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                      }}>
                                        {idx + 1}
                                      </span>
                                      <div>
                                        <strong style={{ fontSize: '0.88rem', color: 'var(--text)', display: 'block' }}>
                                          {q.name}
                                        </strong>
                                        <span style={{ fontSize: '0.7rem', color: 'var(--muted)', fontWeight: 700 }}>
                                          Lvl {q.level} • {q.tierName}
                                        </span>
                                      </div>
                                    </div>
                                  </td>
                                  <td style={{ padding: '12px 16px', color: 'var(--muted)', fontWeight: 600 }}>
                                    📍 {q.branchName}
                                  </td>
                                  <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 900, color: '#10b981' }}>
                                    ₹{(q.totalSales / 100000).toFixed(2)}L
                                  </td>
                                  <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 800 }}>
                                    {q.completedCount} Students
                                  </td>
                                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                    <span style={{
                                      fontSize: '0.74rem', fontWeight: 900, padding: '3px 9px', borderRadius: '6px',
                                      background: 'rgba(16, 185, 129, 0.12)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)'
                                    }}>
                                      ✔ Achieved
                                    </span>
                                  </td>
                                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const cleanQName = q.name.toLowerCase().replace(/[_-]/g, ' ').trim();
                                        const matched = convertedLeads.filter((l: any) => {
                                          const c = (l.counselorName || l.metadata?.['Counsellor'] || '').toLowerCase().replace(/[_-]/g, ' ').trim();
                                          return c === cleanQName;
                                        });
                                        setDrilldownStudentModal({
                                          title: `${q.name}'s Records for ${selectedBadgeModal.name}`,
                                          records: matched
                                        });
                                      }}
                                      style={{
                                        padding: '5px 12px', borderRadius: '8px', fontSize: '0.76rem', fontWeight: 800,
                                        background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)',
                                        cursor: 'pointer'
                                      }}
                                    >
                                      View Admissions →
                                    </button>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: 'var(--muted)', fontSize: '0.84rem' }}>
                                  No counsellors currently meet the criteria for this badge.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '14px 28px', borderTop: '1px solid var(--border)', background: 'var(--surface-alt)', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setSelectedBadgeModal(null)}
                style={{ padding: '8px 22px', borderRadius: '10px', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: '0.84rem', fontWeight: 800, cursor: 'pointer' }}
              >
                Close Leaderboard
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ── DRILLDOWN CANDIDATE RECORDS MODAL ── */}
      {drilldownStudentModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 13000, padding: '20px'
        }}>
          <div style={{
            background: 'var(--card-bg, #111827)', border: '1.5px solid var(--border)',
            borderRadius: '22px', width: '100%', maxWidth: '920px', maxHeight: '85vh',
            display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 70px rgba(0,0,0,0.6)'
          }}>
            <div style={{
              padding: '18px 24px', borderBottom: '1px solid var(--border)', background: 'var(--surface-alt)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: 'var(--text)' }}>
                  {drilldownStudentModal.title}
                </h3>
                <span style={{ fontSize: '0.78rem', color: 'var(--muted)', fontWeight: 600 }}>
                  Showing {drilldownStudentModal.records.length} matching candidate admissions
                </span>
              </div>
              <button
                type="button"
                onClick={() => setDrilldownStudentModal(null)}
                style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', fontSize: '1.1rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ overflowY: 'auto', flex: 1, padding: '16px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                <thead>
                  <tr style={{ background: 'var(--surface-alt)', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ textAlign: 'left', padding: '10px 14px' }}>Student</th>
                    <th style={{ textAlign: 'left', padding: '10px 14px' }}>Course</th>
                    <th style={{ textAlign: 'left', padding: '10px 14px' }}>Date</th>
                    <th style={{ textAlign: 'left', padding: '10px 14px' }}>Amount Paid</th>
                    <th style={{ textAlign: 'right', padding: '10px 14px' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {drilldownStudentModal.records.slice(0, 100).map((r, idx) => (
                    <tr key={r.id || idx} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '10px 14px', fontWeight: 700 }}>{r.studentName}</td>
                      <td style={{ padding: '10px 14px' }}>{r.course}</td>
                      <td style={{ padding: '10px 14px', color: 'var(--muted)' }}>
                        {r.enrollmentDate ? new Date(r.enrollmentDate).toLocaleDateString() : '—'}
                      </td>
                      <td style={{ padding: '10px 14px', color: '#10b981', fontWeight: 800 }}>
                        ₹{(Number(r.feePaid) || 0).toLocaleString()}
                      </td>
                      <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                        <Link
                          href={`/converted-leads/${r.id}`}
                          style={{
                            textDecoration: 'none', display: 'inline-flex', padding: '4px 10px',
                            fontSize: '0.76rem', fontWeight: 800, borderRadius: '6px',
                            background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)'
                          }}
                        >
                          Full Record →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border)', background: 'var(--surface-alt)', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setDrilldownStudentModal(null)}
                style={{ padding: '8px 20px', borderRadius: '10px', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}
              >
                Close Records
              </button>
            </div>
          </div>
        </div>
      )}


      
      {/* ── ALL-TIME LEAGUE GRAND TROPHY MODAL (FULL WINNERS LIST & RANKINGS) ── */}
      {selectedAllTimeLeagueModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 12600, padding: '20px'
        }}>
          <div style={{
            background: 'var(--card-bg, #0f172a)', border: `1.5px solid ${selectedAllTimeLeagueModal.color}66`,
            borderRadius: '24px', width: '100%', maxWidth: '1020px', maxHeight: '88vh',
            display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: `0 25px 80px ${selectedAllTimeLeagueModal.color}22`
          }}>
            {/* Header */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              borderBottom: '1.5px solid var(--border)', padding: '20px 24px',
              background: `linear-gradient(135deg, ${selectedAllTimeLeagueModal.color}1a 0%, transparent 100%)`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <ChampionshipTrophy3D type={selectedAllTimeLeagueModal.trophyType} size={85} />
                <div>
                  <div style={{ fontSize: '0.74rem', fontWeight: 900, textTransform: 'uppercase', color: selectedAllTimeLeagueModal.color, letterSpacing: '0.06em' }}>
                    🏆 All-Time Championship Hall of Fame
                  </div>
                  <h3 style={{ margin: '2px 0 0 0', fontSize: '1.4rem', fontWeight: 900, color: 'var(--text)' }}>
                    {selectedAllTimeLeagueModal.icon} {selectedAllTimeLeagueModal.title}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 900, color: selectedAllTimeLeagueModal.color, background: `${selectedAllTimeLeagueModal.color}1a`, padding: '3px 12px', borderRadius: '8px', border: `1px solid ${selectedAllTimeLeagueModal.color}44` }}>
                      👑 All-Time Champion: {selectedAllTimeLeagueModal.topCampus.name} ({selectedAllTimeLeagueModal.topCampus.wins} Wins)
                    </span>
                    <span style={{ fontSize: '0.76rem', color: 'var(--muted)', fontWeight: 700 }}>
                      {selectedAllTimeLeagueModal.allWinners.length} Total Seasons
                    </span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAllTimeLeagueModal(null)}
                style={{
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  borderRadius: '10px', width: '36px', height: '36px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--text)', fontSize: '1.2rem', cursor: 'pointer',
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
              
              {/* 1. All-Time Campus Leaderboard Podium */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 900, color: 'var(--text)' }}>
                  📊 All-Time Campus Dominance Leaderboard
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                  {selectedAllTimeLeagueModal.rankings.map((rk) => (
                    <div key={rk.name} style={{
                      background: 'var(--surface-alt)',
                      border: rk.rank === 1 ? `1.5px solid ${selectedAllTimeLeagueModal.color}` : '1px solid var(--border)',
                      borderRadius: '12px',
                      padding: '14px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      boxShadow: rk.rank === 1 ? `0 4px 16px ${selectedAllTimeLeagueModal.color}22` : 'none',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{
                          width: '26px', height: '26px', borderRadius: '7px',
                          background: rk.rank === 1 ? `linear-gradient(135deg, ${selectedAllTimeLeagueModal.color}, #d97706)` : 'var(--surface)',
                          color: rk.rank === 1 ? '#fff' : 'var(--muted)',
                          fontSize: '0.74rem', fontWeight: 900,
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                          #{rk.rank}
                        </span>
                        <div>
                          <strong style={{ fontSize: '0.9rem', color: 'var(--text)', display: 'block' }}>
                            {rk.name}
                          </strong>
                          <span style={{ fontSize: '0.72rem', color: 'var(--muted)', fontWeight: 600 }}>
                            {rk.totalMetric}
                          </span>
                        </div>
                      </div>
                      <span style={{
                        fontSize: '0.82rem', fontWeight: 900,
                        color: rk.rank === 1 ? selectedAllTimeLeagueModal.color : 'var(--text)',
                        background: 'var(--surface)', padding: '4px 10px', borderRadius: '6px', border: '1px solid var(--border)'
                      }}>
                        ⚡ {rk.wins} Wins
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. Chronological List of All-Time Winners */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 900, color: 'var(--text)' }}>
                    📜 Complete Chronological List of All-Time Winners
                  </h4>
                  <span style={{ fontSize: '0.74rem', color: 'var(--muted)', fontWeight: 700 }}>
                    {selectedAllTimeLeagueModal.allWinners.length} Official Championship Seasons
                  </span>
                </div>

                <div className="table-wrapper" style={{ background: 'var(--surface-alt)', borderRadius: '14px', border: '1px solid var(--border)', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                    <thead>
                      <tr style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
                        <th style={{ textAlign: 'left', padding: '12px 16px' }}>Season &amp; Year</th>
                        <th style={{ textAlign: 'left', padding: '12px 16px' }}>Champion Campus</th>
                        <th style={{ textAlign: 'left', padding: '12px 16px' }}>Performance Metric</th>
                        <th style={{ textAlign: 'left', padding: '12px 16px' }}>Winning Counselor Squad</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedAllTimeLeagueModal.allWinners.map((w, idx) => (
                        <tr key={`${w.year}-${w.seasonNumber}-${idx}`} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <span style={{
                                width: '26px', height: '26px', borderRadius: '7px',
                                background: w.year === 2026 ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'linear-gradient(135deg, #6366f1, #4f46e5)',
                                color: '#fff', fontSize: '0.72rem', fontWeight: 900,
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                              }}>
                                S{w.seasonNumber}
                              </span>
                              <div>
                                <strong style={{ fontSize: '0.88rem', color: 'var(--text)', display: 'block' }}>
                                  {w.monthName} {w.year}
                                </strong>
                                <span style={{ fontSize: '0.7rem', color: 'var(--muted)', fontWeight: 700 }}>
                                  Season {w.seasonNumber}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{
                              fontSize: '0.8rem', fontWeight: 900, padding: '4px 12px', borderRadius: '6px',
                              background: 'rgba(16, 185, 129, 0.14)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.35)'
                            }}>
                              🏆 {w.winnerLoc}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px', fontWeight: 800, color: 'var(--text)' }}>
                            {w.metricFormatted}
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                              {w.counselors.slice(0, 3).map((cName) => (
                                <span key={cName} style={{
                                  fontSize: '0.7rem', fontWeight: 700, padding: '2px 7px', borderRadius: '5px',
                                  background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)'
                                }}>
                                  👤 {cName}
                                </span>
                              ))}
                              {w.counselors.length > 3 && (
                                <span style={{ fontSize: '0.68rem', color: 'var(--muted)', fontWeight: 700, alignSelf: 'center' }}>
                                  +{w.counselors.length - 3}
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            {/* Footer */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', background: 'var(--surface-alt)', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setSelectedAllTimeLeagueModal(null)}
                style={{ padding: '8px 24px', borderRadius: '10px', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: '0.84rem', fontWeight: 800, cursor: 'pointer' }}
              >
                Close Leaderboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── LOCATION CUP DRILLDOWN & LEADERBOARD MODAL ── */}
      {selectedLocationCupModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 12500, padding: '20px'
        }}>
          <div style={{
            background: 'var(--card-bg, #0f172a)', border: '1.5px solid rgba(245, 158, 11, 0.4)',
            borderRadius: '24px', width: '100%', maxWidth: '980px', maxHeight: '88vh',
            display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 80px rgba(0,0,0,0.6)'
          }}>
            {/* Header */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              borderBottom: '1.5px solid var(--border)', padding: '20px 24px',
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, transparent 100%)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <ChampionshipTrophy3D type={selectedLocationCupModal.trophyType} size={85} />
                <div>
                  <div style={{ fontSize: '0.74rem', fontWeight: 900, textTransform: 'uppercase', color: '#f59e0b', letterSpacing: '0.06em' }}>
                    🏆 Official Championship Pedigree &amp; Leaderboards
                  </div>
                  <h3 style={{ margin: '2px 0 0 0', fontSize: '1.4rem', fontWeight: 900, color: 'var(--text)' }}>
                    {selectedLocationCupModal.location} • {selectedLocationCupModal.leagueTitle}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 900, color: '#f59e0b', background: 'rgba(245, 158, 11, 0.15)', padding: '3px 12px', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                      ⚡ {selectedLocationCupModal.winCount}x Total Champion
                    </span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--muted)', fontWeight: 700 }}>
                      Grouped by Winning Periods
                    </span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLocationCupModal(null)}
                style={{
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  borderRadius: '10px', width: '36px', height: '36px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--text)', fontSize: '1.2rem', cursor: 'pointer',
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Body: Winning Periods Table & Leaderboards */}
            <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Group by Year */}
              {[2026, 2025].map((yr) => {
                const yrSeasons = selectedLocationCupModal.winningSeasons.filter(s => (s as any).year === yr || (!(s as any).year && yr === 2026));
                if (yrSeasons.length === 0) return null;

                return (
                  <div key={yr} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1.5px solid var(--border)', paddingBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '1.1rem' }}>📅</span>
                        <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 900, color: 'var(--text)' }}>
                          {yr} Championship Era ({yrSeasons.length} Titles Won)
                        </h4>
                      </div>
                      <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)', padding: '2px 10px', borderRadius: '6px' }}>
                        {yrSeasons.length} Victorious Seasons
                      </span>
                    </div>

                    <div className="table-wrapper" style={{ background: 'var(--surface-alt)', borderRadius: '14px', border: '1px solid var(--border)', overflow: 'hidden' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                        <thead>
                          <tr style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
                            <th style={{ textAlign: 'left', padding: '12px 16px' }}>Winning Season</th>
                            <th style={{ textAlign: 'left', padding: '12px 16px' }}>Performance Metric</th>
                            <th style={{ textAlign: 'left', padding: '12px 16px' }}>Winning Counselor Squad</th>
                            <th style={{ textAlign: 'center', padding: '12px 16px' }}>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {yrSeasons.map((s) => (
                            <tr key={`${yr}-${s.seasonNumber}`} style={{ borderBottom: '1px solid var(--border)' }}>
                              <td style={{ padding: '14px 16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  <span style={{
                                    width: '28px', height: '28px', borderRadius: '8px',
                                    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                                    color: '#fff', fontSize: '0.78rem', fontWeight: 900,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                  }}>
                                    S{s.seasonNumber}
                                  </span>
                                  <div>
                                    <strong style={{ fontSize: '0.9rem', color: 'var(--text)', display: 'block' }}>
                                      {s.monthName} {yr}
                                    </strong>
                                    <span style={{ fontSize: '0.72rem', color: 'var(--muted)', fontWeight: 700 }}>
                                      Official Season {s.seasonNumber} Champion
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td style={{ padding: '14px 16px' }}>
                                <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#10b981' }}>
                                  {s.metricValue}
                                </div>
                                <span style={{ fontSize: '0.72rem', color: 'var(--muted)', fontWeight: 600 }}>
                                  {s.metricLabel}
                                </span>
                              </td>
                              <td style={{ padding: '14px 16px' }}>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                  {s.counselors.slice(0, 4).map((cName) => (
                                    <span key={cName} style={{
                                      fontSize: '0.72rem', fontWeight: 800, padding: '3px 8px', borderRadius: '6px',
                                      background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)'
                                    }}>
                                      👤 {cName}
                                    </span>
                                  ))}
                                  {s.counselors.length > 4 && (
                                    <span style={{ fontSize: '0.7rem', color: 'var(--muted)', fontWeight: 700, alignSelf: 'center' }}>
                                      +{s.counselors.length - 4} more
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                                <span style={{
                                  fontSize: '0.74rem', fontWeight: 900, padding: '4px 10px', borderRadius: '6px',
                                  background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.35)'
                                }}>
                                  🏆 Champion
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}

            </div>

            {/* Footer */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', background: 'var(--surface-alt)', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setSelectedLocationCupModal(null)}
                style={{ padding: '8px 24px', borderRadius: '10px', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: '0.84rem', fontWeight: 800, cursor: 'pointer' }}
              >
                Close Pedigree
              </button>
            </div>
          </div>
        </div>
      )}

    </section>
  );
}
