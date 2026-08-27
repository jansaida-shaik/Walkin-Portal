'use client';

interface CounsellorBadge {
  id: string;
  category: 'walkin' | 'enrollment' | 'revenue' | 'dropout';
  name: string;
  icon: string;
  color: string;
  bg: string;
  border: string;
  description: string;
}

function getCounsellorBadges(stat: {
  count: number;
  sales: number;
  avgTicket?: number;
  walkins?: number;
  walkinConversions?: number;
  dropouts?: number;
  branchGoldMedals?: number;
  branchSilverMedals?: number;
}): CounsellorBadge[] {
  const badges: CounsellorBadge[] = [];
  const avg = stat.avgTicket || (stat.count > 0 ? Math.round(stat.sales / stat.count) : 0);
  const walkinCount = stat.walkins || 0;
  const walkinConvPct = walkinCount > 0 ? Math.round(((stat.walkinConversions || stat.count) / walkinCount) * 100) : 0;
  const dropoutCount = stat.dropouts || 0;
  const dropoutPct = stat.count > 0 ? Math.round((dropoutCount / (stat.count + dropoutCount)) * 100) : 0;

  // ── 1. REVENUE BADGES (Pure PostgreSQL Sales) ──
  if (stat.sales >= 30000000) {
    badges.push({
      id: 'crown-closer',
      category: 'revenue',
      name: '👑 ₹3Cr+ Crown Legend',
      icon: '👑',
      color: '#f59e0b',
      bg: 'rgba(245, 158, 11, 0.12)',
      border: 'rgba(245, 158, 11, 0.35)',
      description: 'Achieved over ₹3 Crore in collected revenue'
    });
  } else if (stat.sales >= 10000000) {
    badges.push({
      id: 'diamond-closer',
      category: 'revenue',
      name: '💎 ₹1Cr+ Diamond Closer',
      icon: '💎',
      color: '#06b6d4',
      bg: 'rgba(6, 182, 212, 0.12)',
      border: 'rgba(6, 182, 212, 0.35)',
      description: 'Achieved over ₹1 Crore in collected revenue'
    });
  } else if (stat.sales >= 5000000) {
    badges.push({
      id: 'gold-closer',
      category: 'revenue',
      name: '🥇 ₹50L+ Gold Closer',
      icon: '🥇',
      color: '#eab308',
      bg: 'rgba(234, 179, 8, 0.12)',
      border: 'rgba(234, 179, 8, 0.35)',
      description: 'Achieved over ₹50 Lakhs in collected revenue'
    });
  } else if (stat.sales >= 2500000) {
    badges.push({
      id: 'silver-closer',
      category: 'revenue',
      name: '🥈 ₹25L+ Silver Closer',
      icon: '🥈',
      color: '#94a3b8',
      bg: 'rgba(148, 163, 184, 0.14)',
      border: 'rgba(148, 163, 184, 0.35)',
      description: 'Achieved over ₹25 Lakhs in collected revenue'
    });
  } else if (stat.sales >= 1000000) {
    badges.push({
      id: 'bronze-closer',
      category: 'revenue',
      name: '🥉 ₹10L+ Bronze Closer',
      icon: '🥉',
      color: '#b45309',
      bg: 'rgba(180, 83, 9, 0.12)',
      border: 'rgba(180, 83, 9, 0.3)',
      description: 'Achieved over ₹10 Lakhs in collected revenue'
    });
  }

  if (avg >= 35000 && stat.count >= 10) {
    badges.push({
      id: 'high-ticket',
      category: 'revenue',
      name: '🚀 High-Ticket Pro',
      icon: '🚀',
      color: '#ec4899',
      bg: 'rgba(236, 72, 153, 0.12)',
      border: 'rgba(236, 72, 153, 0.35)',
      description: 'Maintained avg ticket size > ₹35,000 across 10+ enrollments'
    });
  }

  // ── 2. ENROLLMENT VOLUME BADGES (Pure Student Count) ──
  if (stat.count >= 500) {
    badges.push({
      id: 'master-enroller',
      category: 'enrollment',
      name: '🏛️ 500+ Master Enroller',
      icon: '🏛️',
      color: '#8b5cf6',
      bg: 'rgba(139, 92, 246, 0.12)',
      border: 'rgba(139, 92, 246, 0.35)',
      description: 'Enrolled more than 500 students'
    });
  } else if (stat.count >= 100) {
    badges.push({
      id: 'century-enroller',
      category: 'enrollment',
      name: '💯 Century Enroller',
      icon: '💯',
      color: '#10b981',
      bg: 'rgba(16, 185, 129, 0.12)',
      border: 'rgba(16, 185, 129, 0.35)',
      description: 'Enrolled more than 100 students'
    });
  } else if (stat.count >= 50) {
    badges.push({
      id: 'half-century',
      category: 'enrollment',
      name: '🎖️ Pacesetter (50+)',
      icon: '🎖️',
      color: '#3b82f6',
      bg: 'rgba(59, 130, 246, 0.12)',
      border: 'rgba(59, 130, 246, 0.3)',
      description: 'Enrolled more than 50 students'
    });
  } else if (stat.count >= 25) {
    badges.push({
      id: 'quarter-century',
      category: 'enrollment',
      name: '🎯 Achiever (25+)',
      icon: '🎯',
      color: '#0284c7',
      bg: 'rgba(2, 132, 199, 0.12)',
      border: 'rgba(2, 132, 199, 0.3)',
      description: 'Enrolled more than 25 students'
    });
  }

  // ── 3. WALKIN PERFORMANCE BADGES (Physical Walk-ins Handled) ──
  if (walkinCount >= 100) {
    badges.push({
      id: 'walkin-grandmaster',
      category: 'walkin',
      name: '🚶 100+ Walkin Grandmaster',
      icon: '🚶',
      color: '#059669',
      bg: 'rgba(5, 150, 105, 0.12)',
      border: 'rgba(5, 150, 105, 0.35)',
      description: 'Handled over 100 walk-in candidates in person'
    });
  } else if (walkinCount >= 50) {
    badges.push({
      id: 'walkin-specialist',
      category: 'walkin',
      name: '⚡ 50+ Walkin Specialist',
      icon: '⚡',
      color: '#0d9488',
      bg: 'rgba(13, 148, 136, 0.12)',
      border: 'rgba(13, 148, 136, 0.35)',
      description: 'Handled over 50 walk-in candidates in person'
    });
  } else if (walkinCount >= 20) {
    badges.push({
      id: 'walkin-handler',
      category: 'walkin',
      name: '🎯 20+ Walkin Handler',
      icon: '🎯',
      color: '#0891b2',
      bg: 'rgba(8, 145, 178, 0.12)',
      border: 'rgba(8, 145, 178, 0.35)',
      description: 'Handled over 20 walk-in candidates in person'
    });
  }

  if (walkinConvPct >= 60 && walkinCount >= 10) {
    badges.push({
      id: 'intake-sentinel',
      category: 'walkin',
      name: '🛡️ High Walk-in Converter (60%+)',
      icon: '🛡️',
      color: '#16a34a',
      bg: 'rgba(22, 163, 74, 0.12)',
      border: 'rgba(22, 163, 74, 0.35)',
      description: 'Converted ≥60% of handled walk-ins into enrolled students'
    });
  }

  // ── 4. RETENTION & DROPOUT BADGES ──
  if (stat.count >= 20 && dropoutPct <= 5) {
    badges.push({
      id: 'zero-dropout',
      category: 'dropout',
      name: '🛡️ Low-Dropout Champion (<5%)',
      icon: '🛡️',
      color: '#10b981',
      bg: 'rgba(16, 185, 129, 0.12)',
      border: 'rgba(16, 185, 129, 0.35)',
      description: 'Maintained less than 5% dropout rate across all admissions'
    });
  } else if (stat.count >= 20 && dropoutPct >= 30) {
    badges.push({
      id: 'dropout-alert',
      category: 'dropout',
      name: '⚠️ High Dropout Watch (>30%)',
      icon: '⚠️',
      color: '#ef4444',
      bg: 'rgba(239, 68, 68, 0.12)',
      border: 'rgba(239, 68, 68, 0.35)',
      description: 'Over 30% dropout rate — flagged for mentoring & retention support'
    });
  }

  // ── 5. BRANCH SEASON CHAMPIONSHIP MEDALS ──
  if (stat.branchGoldMedals && stat.branchGoldMedals > 0) {
    badges.push({
      id: 'branch-gold-medal',
      category: 'revenue',
      name: `🥇 ${stat.branchGoldMedals}x Season Champion Gold Medalist`,
      icon: '🥇',
      color: '#eab308',
      bg: 'rgba(234, 179, 8, 0.16)',
      border: 'rgba(234, 179, 8, 0.45)',
      description: `Awarded ${stat.branchGoldMedals} Gold Medals for winning Season Championships with the campus team`
    });
  }
  if (stat.branchSilverMedals && stat.branchSilverMedals > 0) {
    badges.push({
      id: 'branch-silver-medal',
      category: 'revenue',
      name: `🥈 ${stat.branchSilverMedals}x Season Silver Medalist`,
      icon: '🥈',
      color: '#94a3b8',
      bg: 'rgba(148, 163, 184, 0.14)',
      border: 'rgba(148, 163, 184, 0.35)',
      description: `Awarded ${stat.branchSilverMedals} Silver Medals for 2nd place Season Championships with the campus team`
    });
  }

  return badges;
}

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SessionUser } from '../../lib/auth';

interface ConvertedLead {
  id: string;
  studentId?: string | null;
  studentName: string;
  studentPhone?: string | null;
  studentEmail?: string | null;
  course: string;
  location?: string | null;
  branchName?: string | null;
  counselorId?: string | null;
  counselorName?: string | null;
  leadOwner?: string | null;
  leadSource: string;
  feePaid?: number | null;
  totalFee?: number | null;
  status: string;
  enrollmentDate: string | Date;
  notes?: string | null;
  metadata?: Record<string, any> | null;
  counselor?: any;
}

interface Student {
  id: string;
  name: string;
  phone: string;
  course: string;
  walkinDate: string | Date;
  status: string;
  remarks?: string | null;
  source: string;
  branchName?: string;
  details?: any;
  sessions?: any[];
}

interface CounselorProfile {
  id: string;
  name: string;
  status: string;
  branchId: string;
  branchName?: string;
  departmentId?: string;
  assignedStudentId?: string | null;
  location?: string;
}

interface Branch {
  id: string;
  name: string;
  location?: string;
}

interface ReportsClientProps {
  convertedLeads: ConvertedLead[];
  students: Student[];
  counselors: CounselorProfile[];
  branches: Branch[];
  user: SessionUser;
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// ── MODERN VECTOR SVG ICONS ──
const Icons = {
  Dashboard: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
  ),
  Trend: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  ),
  Building: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
      <path d="M9 22v-4h6v4" />
      <path d="M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01" />
    </svg>
  ),
  Users: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  Walkin: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <polyline points="16 11 18 13 22 9" />
    </svg>
  ),
  Funnel: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  ),
  Shield: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  Trophy: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.45 1-1 1H7v4h10v-4h-2c-.55 0-1-.45-1-1v-2.34" />
      <path d="M6 4h12a2 2 0 0 1 2 2v7a6 6 0 0 1-6 6 6 6 0 0 1-6-6V6a2 2 0 0 1 2-2z" />
    </svg>
  ),
  Badge: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="7" />
      <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
    </svg>
  ),
  Download: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  ),
  Reset: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="1 4 1 10 7 10" />
      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
    </svg>
  ),
  Search: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  ArrowUp: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="19" x2="12" y2="5" />
      <polyline points="5 12 12 5 19 12" />
    </svg>
  ),
  ArrowDown: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <polyline points="19 12 12 19 5 12" />
    </svg>
  ),
  ChevronRight: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
};

// Helper for formatted Indian Currency (e.g. ₹3.65 Cr / ₹25.04 L)
function formatCompactCurrency(val: number) {
  if (!val || val === 0) return '₹0';
  if (val >= 10000000) {
    return `₹${(val / 10000000).toFixed(2)} Cr`;
  }
  if (val >= 100000) {
    return `₹${(val / 100000).toFixed(2)} L`;
  }
  return `₹${val.toLocaleString()}`;
}

export default function ReportsClient({
  convertedLeads,
  students,
  counselors,
  branches,
  user,
}: ReportsClientProps) {
  const router = useRouter();

  // Navigation tab for the core analytical pillars + modular financial dashboards
  const [activePillar, setActivePillar] = useState<
    | 'overview'
    | 'monthly-sales'
    | 'branches'
    | 'counsellors'
    | 'finance-dashboards'
    | 'walkins'
    | 'conversion'
    | 'lead-owners'
    | 'leaderboards'
    | 'badge-analysis'
  >('counsellors');

  const [financeSelectedBranch, setFinanceSelectedBranch] = useState<string>('VIJ');
  const [selectedBadgeCategory, setSelectedBadgeCategory] = useState<'all' | 'walkin' | 'enrollment' | 'revenue' | 'dropout'>('all');
  const [selectedSeasonYear, setSelectedSeasonYear] = useState<string>('2026');

  // Counsellor tab: Active (Default) | Inactive (Historical) | All
  const [counselorStatusTab, setCounselorStatusTab] = useState<'active' | 'inactive' | 'all'>('active');
  const [counselorSortField, setCounselorSortField] = useState<'sales' | 'count' | 'avgTicket' | 'name'>('sales');
  const [counselorSortOrder, setCounselorSortOrder] = useState<'desc' | 'asc'>('desc');

  // Global Filter State
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [selectedCounselor, setSelectedCounselor] = useState<string>('all');
  const [selectedWalkinCounselor, setSelectedWalkinCounselor] = useState<string>('all');
  const [selectedLeadOwner, setSelectedLeadOwner] = useState<string>('all');
  const [conversionFilter, setConversionFilter] = useState<'all' | 'converted' | 'not-converted'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Drill-down Modal State
  const [drilldownTitle, setDrilldownTitle] = useState<string | null>(null);
  const [drilldownRecords, setDrilldownRecords] = useState<ConvertedLead[]>([]);

  // Clean string helper
  const cleanStr = (s?: string | null) => (s ? s.replace(/^zcrm_/i, '').trim() : '');

  // Active counselor names set for fast lookup (normalized)
  const activeCounselorNamesSet = useMemo(() => {
    const set = new Set<string>();
    counselors.forEach(c => {
      const norm = c.name.toLowerCase().replace(/[_-]/g, ' ').replace(/\s+/g, ' ').trim();
      set.add(norm);
      set.add(c.name.toLowerCase().trim());
    });
    ['vinay kumar doddipatla', 'meka bheema rao', 'manimala athili', 'codegnan', 'maruthi kotha', 'maruthi_kotha'].forEach(name => set.add(name));
    return set;
  }, [counselors]);

  // Extract unique filter options directly from 100% LIVE data
  const { availableYears, availableCounselorNames, availableWalkinCounselorNames, availableLeadOwners, availableBranches } = useMemo(() => {
    const years = new Set<string>();
    const couns = new Set<string>();
    const walkinCouns = new Set<string>();
    const owners = new Set<string>();
    const branchNames = new Set<string>();

    branches.forEach(b => branchNames.add(b.name));

    convertedLeads.forEach(l => {
      const d = new Date(l.enrollmentDate);
      if (!isNaN(d.getTime())) years.add(String(d.getFullYear()));

      const cName = cleanStr(l.counselorName || (l.metadata && l.metadata['Counsellor']));
      if (cName && cName !== 'Unassigned') couns.add(cName);

      const wcName = cleanStr(l.metadata && (l.metadata['Walk-in Counsellor'] || l.metadata['Walkin Counsellor']));
      if (wcName && wcName !== '—') walkinCouns.add(wcName);

      const oName = cleanStr(l.leadOwner || (l.metadata && l.metadata['Converted Lead Owner']));
      if (oName) owners.add(oName);

      const loc = cleanStr(l.location || (l.metadata && l.metadata['Batch Location']));
      if (loc) branchNames.add(loc);
    });

    students.forEach(s => {
      const d = new Date(s.walkinDate);
      if (!isNaN(d.getTime())) years.add(String(d.getFullYear()));
    });

    return {
      availableYears: Array.from(years).sort().reverse(),
      availableCounselorNames: Array.from(couns).sort(),
      availableWalkinCounselorNames: Array.from(walkinCouns).sort(),
      availableLeadOwners: Array.from(owners).sort(),
      availableBranches: Array.from(branchNames).sort(),
    };
  }, [convertedLeads, students, branches]);

  // ── Global Filtered Converted Leads ──
  const filteredLeads = useMemo(() => {
    return convertedLeads.filter(l => {
      const d = new Date(l.enrollmentDate);
      const year = !isNaN(d.getTime()) ? String(d.getFullYear()) : '';
      const month = !isNaN(d.getTime()) ? String(d.getMonth() + 1) : '';

      if (selectedYear !== 'all' && year !== selectedYear) return false;
      if (selectedMonth !== 'all' && month !== selectedMonth) return false;

      if (selectedBranch !== 'all') {
        const bLower = selectedBranch.toLowerCase();
        const locMatch = (l.location || '').toLowerCase().includes(bLower);
        const bNameMatch = (l.branchName || '').toLowerCase().includes(bLower);
        const metaLoc = (l.metadata?.['Batch Location'] || '').toLowerCase().includes(bLower);
        if (!locMatch && !bNameMatch && !metaLoc) return false;
      }

      if (selectedCounselor !== 'all') {
        const cName = cleanStr(l.counselorName || l.metadata?.['Counsellor']);
        if (cName.toLowerCase() !== selectedCounselor.toLowerCase()) return false;
      }

      if (selectedWalkinCounselor !== 'all') {
        const wcName = cleanStr(l.metadata?.['Walk-in Counsellor'] || l.metadata?.['Walkin Counsellor']);
        if (wcName.toLowerCase() !== selectedWalkinCounselor.toLowerCase()) return false;
      }

      if (selectedLeadOwner !== 'all') {
        const oName = cleanStr(l.leadOwner || l.metadata?.['Converted Lead Owner']);
        if (oName.toLowerCase() !== selectedLeadOwner.toLowerCase()) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const text = `${l.studentName} ${l.id} ${l.studentId || ''} ${l.course} ${l.leadOwner || ''} ${l.counselorName || ''} ${l.location || ''} ${l.studentPhone || ''}`.toLowerCase();
        if (!text.includes(q)) return false;
      }

      return true;
    });
  }, [convertedLeads, selectedYear, selectedMonth, selectedBranch, selectedCounselor, selectedWalkinCounselor, selectedLeadOwner, searchQuery]);

  // ── Global Filtered Walk-ins (Students) ──
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const d = new Date(s.walkinDate);
      const year = !isNaN(d.getTime()) ? String(d.getFullYear()) : '';
      const month = !isNaN(d.getTime()) ? String(d.getMonth() + 1) : '';

      if (selectedYear !== 'all' && year !== selectedYear) return false;
      if (selectedMonth !== 'all' && month !== selectedMonth) return false;

      if (selectedBranch !== 'all') {
        const bLower = selectedBranch.toLowerCase();
        const match = (s.branchName || '').toLowerCase().includes(bLower) || (s.details?.branchId || '').toLowerCase().includes(bLower);
        if (!match) return false;
      }

      if (conversionFilter === 'converted' && s.status !== 'Completed') return false;
      if (conversionFilter === 'not-converted' && s.status === 'Completed') return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const text = `${s.name} ${s.phone} ${s.course} ${s.branchName || ''}`.toLowerCase();
        if (!text.includes(q)) return false;
      }

      return true;
    });
  }, [students, selectedYear, selectedMonth, selectedBranch, conversionFilter, searchQuery]);

  // ── High-Level Global Financial & Enrollment Metrics (100% Live) ──
  const totalLeadsCount = filteredLeads.length;
  const totalSalesCollected = useMemo(() => filteredLeads.reduce((acc, l) => acc + (l.feePaid || 0), 0), [filteredLeads]);
  const totalGrossCourseFee = useMemo(() => filteredLeads.reduce((acc, l) => acc + (l.totalFee || 0), 0), [filteredLeads]);
  const totalWalkinsCount = filteredStudents.length;
  const totalCompletedWalkins = useMemo(() => filteredStudents.filter(s => s.status === 'Completed').length, [filteredStudents]);
  const overallConversionPct = totalWalkinsCount > 0 ? Math.round((totalCompletedWalkins / totalWalkinsCount) * 100) : 0;
  const avgTicketSize = totalLeadsCount > 0 ? Math.round(totalSalesCollected / totalLeadsCount) : 0;

  // Month-over-Month (MoM) Growth Computation (Current Month vs Prior Month)
  const momStats = useMemo(() => {
    const now = new Date();
    const currYear = now.getFullYear();
    const currMonth = now.getMonth() + 1;
    const prevMonth = currMonth === 1 ? 12 : currMonth - 1;
    const prevYear = currMonth === 1 ? currYear - 1 : currYear;

    let currMonthSales = 0;
    let currMonthCount = 0;
    let prevMonthSales = 0;
    let prevMonthCount = 0;

    filteredLeads.forEach(l => {
      const d = new Date(l.enrollmentDate);
      if (!isNaN(d.getTime())) {
        const y = d.getFullYear();
        const m = d.getMonth() + 1;
        if (y === currYear && m === currMonth) {
          currMonthSales += (l.feePaid || 0);
          currMonthCount += 1;
        } else if (y === prevYear && m === prevMonth) {
          prevMonthSales += (l.feePaid || 0);
          prevMonthCount += 1;
        }
      }
    });

    const salesGrowthPct = prevMonthSales > 0 ? Math.round(((currMonthSales - prevMonthSales) / prevMonthSales) * 100) : (currMonthSales > 0 ? 100 : 0);
    const countGrowthPct = prevMonthCount > 0 ? Math.round(((currMonthCount - prevMonthCount) / prevMonthCount) * 100) : (currMonthCount > 0 ? 100 : 0);

    return {
      currMonthSales,
      currMonthCount,
      prevMonthSales,
      prevMonthCount,
      salesGrowthPct,
      countGrowthPct,
    };
  }, [filteredLeads]);

  // Open drill-down records modal
  const openDrilldown = (title: string, records: ConvertedLead[]) => {
    setDrilldownTitle(title);
    setDrilldownRecords(records);
  };

  // CSV Export Engine
  const exportToCSV = (filename: string, rows: any[]) => {
    if (!rows || !rows.length) return;
    const headers = Object.keys(rows[0]);
    const csvContent = [
      headers.join(','),
      ...rows.map(row => headers.map(h => `"${String(row[h] || '').replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section className="dash-page" style={{ display: 'flex', flexDirection: 'column', gap: '22px', paddingBottom: '90px' }}>
      
      {/* ── TOP HEADER WITH LIVE PULSE ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px',
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(16, 185, 129, 0.05) 100%)',
        border: '1.5px solid var(--border)', borderRadius: '18px', padding: '20px 24px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '1.65rem', fontWeight: 900, color: 'var(--text)', margin: 0, letterSpacing: '-0.02em' }}>
              Reports &amp; Sales Analytics
            </h1>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '3px 10px', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 800,
              background: 'rgba(16, 185, 129, 0.12)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.25)'
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
              100% Live DB Sync ({convertedLeads.length.toLocaleString()} Master Records)
            </span>
          </div>
          <p style={{ margin: '6px 0 0 0', fontSize: '0.84rem', color: 'var(--muted)', fontWeight: 500 }}>
            Executive intelligence, multi-tier funnel attribution, and live financial scorecards.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => exportToCSV(`analytics_export_${activePillar}`, filteredLeads.map(l => ({
              'Record ID': l.id,
              'Student ID': l.studentId || '',
              'Student Name': l.studentName,
              'Course': l.course,
              'Counsellor': l.counselorName || l.metadata?.['Counsellor'] || '',
              'Lead Owner': l.leadOwner || l.metadata?.['Converted Lead Owner'] || '',
              'Batch Location': l.location || l.metadata?.['Batch Location'] || '',
              'Amount Paid': l.feePaid || 0,
              'Total Fee': l.totalFee || 0,
              'Enrollment Date': new Date(l.enrollmentDate).toLocaleDateString(),
              'Lead Source': l.leadSource,
            })))}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '9px 18px', borderRadius: '10px', border: '1.5px solid var(--border)',
              background: 'var(--card-bg)', color: 'var(--text)', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)', transition: 'all 0.15s ease'
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--primary)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
          >
            <Icons.Download />
            <span>Export View CSV</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedYear('all');
              setSelectedMonth('all');
              setSelectedBranch('all');
              setSelectedCounselor('all');
              setSelectedWalkinCounselor('all');
              setSelectedLeadOwner('all');
              setConversionFilter('all');
              setSearchQuery('');
            }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '9px 14px', borderRadius: '10px', border: '1.5px solid var(--border)',
              background: 'var(--surface)', color: 'var(--muted)', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <Icons.Reset />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* ── ULTRA-MODERN 2-ROW BALANCED NAVIGATION GRID (NO SCROLLBAR) ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '8px',
        padding: '10px',
        background: 'var(--card-bg)',
        border: '1.5px solid var(--border)',
        borderRadius: '18px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
      }}>
        {[
          { id: 'overview', label: 'Dashboard', Icon: Icons.Dashboard },
          { id: 'monthly-sales', label: 'Monthly Sales', Icon: Icons.Trend },
          { id: 'finance-dashboards', label: 'Finance & Balances', Icon: Icons.Trend },
          { id: 'branches', label: 'Branch Performance', Icon: Icons.Building },
          { id: 'counsellors', label: 'Counsellor Scorecards', Icon: Icons.Users },
          { id: 'walkins', label: 'Walk-in Analytics', Icon: Icons.Walkin },
          { id: 'conversion', label: 'Conversion Funnel', Icon: Icons.Funnel },
          { id: 'lead-owners', label: 'Lead Owners', Icon: Icons.Shield },
          { id: 'leaderboards', label: 'Leaderboards', Icon: Icons.Trophy },
          { id: 'badge-analysis', label: 'Badge Analysis', Icon: Icons.Badge },
        ].map(tab => {
          const isActive = activePillar === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActivePillar(tab.id as any)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '10px 14px',
                borderRadius: '12px',
                fontSize: '0.82rem',
                fontWeight: isActive ? 800 : 600,
                border: isActive ? '1.5px solid rgba(99, 102, 241, 0.4)' : '1px solid var(--border)',
                background: isActive ? 'linear-gradient(135deg, var(--primary) 0%, #4f46e5 100%)' : 'var(--surface)',
                color: isActive ? '#fff' : 'var(--text)',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.16s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: isActive ? '0 4px 14px rgba(99, 102, 241, 0.28)' : 'none',
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  e.currentTarget.style.background = 'var(--surface-alt)';
                  e.currentTarget.style.borderColor = 'var(--primary)';
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  e.currentTarget.style.background = 'var(--surface)';
                  e.currentTarget.style.borderColor = 'var(--border)';
                }
              }}
            >
              <tab.Icon />
              <span style={{ whiteSpace: 'nowrap' }}>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── MODERN GLASSMORPHIC FILTER PANEL ── */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: '12px', background: 'var(--card-bg)', border: '1.5px solid var(--border)',
        borderRadius: '16px', padding: '16px 20px', boxShadow: '0 4px 18px rgba(0,0,0,0.02)'
      }}>
        {/* Year Filter */}
        <div>
          <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '5px', letterSpacing: '0.04em' }}>
            Year ({availableYears.length})
          </label>
          <select
            value={selectedYear}
            onChange={e => setSelectedYear(e.target.value)}
            style={{ width: '100%', padding: '8px 12px', borderRadius: '9px', border: '1.5px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', fontSize: '0.82rem', fontWeight: 600, outline: 'none' }}
          >
            <option value="all">All Years</option>
            {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        {/* Month Filter */}
        <div>
          <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '5px', letterSpacing: '0.04em' }}>
            Month
          </label>
          <select
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
            style={{ width: '100%', padding: '8px 12px', borderRadius: '9px', border: '1.5px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', fontSize: '0.82rem', fontWeight: 600, outline: 'none' }}
          >
            <option value="all">All Months</option>
            {MONTH_NAMES.map((m, idx) => <option key={m} value={String(idx + 1)}>{m}</option>)}
          </select>
        </div>

        {/* Branch Filter */}
        <div>
          <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '5px', letterSpacing: '0.04em' }}>
            Branch ({availableBranches.length})
          </label>
          <select
            value={selectedBranch}
            onChange={e => setSelectedBranch(e.target.value)}
            style={{ width: '100%', padding: '8px 12px', borderRadius: '9px', border: '1.5px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', fontSize: '0.82rem', fontWeight: 600, outline: 'none' }}
          >
            <option value="all">All Branches</option>
            {availableBranches.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>

        {/* Counsellor Filter */}
        <div>
          <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '5px', letterSpacing: '0.04em' }}>
            Counsellor ({availableCounselorNames.length})
          </label>
          <select
            value={selectedCounselor}
            onChange={e => setSelectedCounselor(e.target.value)}
            style={{ width: '100%', padding: '8px 12px', borderRadius: '9px', border: '1.5px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', fontSize: '0.82rem', fontWeight: 600, outline: 'none' }}
          >
            <option value="all">All Counsellors</option>
            {availableCounselorNames.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Walk-in Counsellor Filter */}
        <div>
          <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '5px', letterSpacing: '0.04em' }}>
            Walk-in Counsellor ({availableWalkinCounselorNames.length})
          </label>
          <select
            value={selectedWalkinCounselor}
            onChange={e => setSelectedWalkinCounselor(e.target.value)}
            style={{ width: '100%', padding: '8px 12px', borderRadius: '9px', border: '1.5px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', fontSize: '0.82rem', fontWeight: 600, outline: 'none' }}
          >
            <option value="all">All Walk-in Counsellors</option>
            {availableWalkinCounselorNames.map(wc => <option key={wc} value={wc}>{wc}</option>)}
          </select>
        </div>

        {/* Lead Owner Filter */}
        <div>
          <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '5px', letterSpacing: '0.04em' }}>
            Lead Owner ({availableLeadOwners.length})
          </label>
          <select
            value={selectedLeadOwner}
            onChange={e => setSelectedLeadOwner(e.target.value)}
            style={{ width: '100%', padding: '8px 12px', borderRadius: '9px', border: '1.5px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', fontSize: '0.82rem', fontWeight: 600, outline: 'none' }}
          >
            <option value="all">All Lead Owners</option>
            {availableLeadOwners.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
      </div>

      {/* ── SEARCH INPUT WITH VECTOR ICON ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--card-bg)',
        border: '1.5px solid var(--border)', borderRadius: '14px', padding: '10px 18px'
      }}>
        <span style={{ color: 'var(--muted)' }}><Icons.Search /></span>
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Filter live reports by candidate name, record ID, phone, counsellor, owner, course, or location…"
          style={{ width: '100%', background: 'transparent', border: 'none', color: 'var(--text)', fontSize: '0.86rem', outline: 'none', fontWeight: 500 }}
        />
      </div>

      {/* ══════════════════════════════════════════════════════════════════════════
          PILLAR 4: COUNSELLOR SCORECARDS (DEFAULT VIEW WITH MODERN LAYOUT)
      ══════════════════════════════════════════════════════════════════════════ */}
      {activePillar === 'counsellors' && (
        <div className="dash-table-card" style={{ border: '1.5px solid var(--border)', borderRadius: '18px', overflow: 'hidden', boxShadow: '0 8px 30px rgba(0,0,0,0.03)' }}>
          
          {/* Card Header with Active / Inactive / All Segments */}
          <div style={{
            padding: '18px 24px', borderBottom: '1px solid var(--border)', background: 'var(--card-bg)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px'
          }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 900, color: 'var(--text)', letterSpacing: '-0.01em' }}>
                Individual Counsellor Performance Scorecards
              </h3>
              <span style={{ fontSize: '0.76rem', color: 'var(--muted)', fontWeight: 600 }}>
                Ranked and calculated live from {filteredLeads.length.toLocaleString()} converted enrollments
              </span>
            </div>

            {/* Active / Inactive / All Tabs */}
            <div style={{ display: 'inline-flex', background: 'var(--surface-alt)', padding: '3px', borderRadius: '10px', border: '1px solid var(--border)', gap: '3px' }}>
              {[
                { id: 'active', label: 'Active (Default)' },
                { id: 'inactive', label: 'Inactive' },
                { id: 'all', label: 'All' },
              ].map(tab => {
                const isActive = counselorStatusTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setCounselorStatusTab(tab.id as any)}
                    style={{
                      padding: '6px 14px', borderRadius: '8px', fontSize: '0.78rem',
                      fontWeight: isActive ? 800 : 600, border: 'none',
                      background: isActive ? 'var(--primary)' : 'transparent',
                      color: isActive ? '#fff' : 'var(--text)', cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow: isActive ? '0 2px 8px rgba(99, 102, 241, 0.3)' : 'none'
                    }}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {(() => {
            const counMap = new Map<string, { name: string; sales: number; count: number; totalFee: number }>();
            filteredLeads.forEach(l => {
              const coun = cleanStr(l.counselorName || l.metadata?.['Counsellor']);
              if (coun && coun !== 'Unassigned') {
                const cur = counMap.get(coun) || { name: coun, sales: 0, count: 0, totalFee: 0 };
                cur.sales += (l.feePaid || 0);
                cur.count += 1;
                cur.totalFee += (l.totalFee || 0);
                counMap.set(coun, cur);
              }
            });

            // Filter based on Active vs Inactive tab
            const filteredCounList = Array.from(counMap.values()).filter(c => {
              const isActive = activeCounselorNamesSet.has(c.name.toLowerCase().replace(/[_-]/g, ' ').trim());
              if (counselorStatusTab === 'active') return isActive;
              if (counselorStatusTab === 'inactive') return !isActive;
              return true;
            });

            // Find top volume for relative progress bar
            const maxSales = Math.max(...filteredCounList.map(c => c.sales), 1);

            // Sort from top to low (or selected column order)
            filteredCounList.sort((a, b) => {
              let valA = 0;
              let valB = 0;
              if (counselorSortField === 'sales') {
                valA = a.sales;
                valB = b.sales;
              } else if (counselorSortField === 'count') {
                valA = a.count;
                valB = b.count;
              } else if (counselorSortField === 'avgTicket') {
                valA = a.count > 0 ? a.sales / a.count : 0;
                valB = b.count > 0 ? b.sales / b.count : 0;
              } else if (counselorSortField === 'name') {
                return counselorSortOrder === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
              }
              return counselorSortOrder === 'desc' ? valB - valA : valA - valB;
            });

            return (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr style={{ background: 'var(--surface-alt)' }}>
                      <th
                        onClick={() => {
                          if (counselorSortField === 'name') {
                            setCounselorSortOrder(counselorSortOrder === 'asc' ? 'desc' : 'asc');
                          } else {
                            setCounselorSortField('name');
                            setCounselorSortOrder('asc');
                          }
                        }}
                        style={{ cursor: 'pointer', userSelect: 'none' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>Counsellor Name</span>
                          {counselorSortField === 'name' && (counselorSortOrder === 'desc' ? <Icons.ArrowDown /> : <Icons.ArrowUp />)}
                        </div>
                      </th>
                      <th>Status</th>
                      <th
                        onClick={() => {
                          if (counselorSortField === 'count') {
                            setCounselorSortOrder(counselorSortOrder === 'desc' ? 'asc' : 'desc');
                          } else {
                            setCounselorSortField('count');
                            setCounselorSortOrder('desc');
                          }
                        }}
                        style={{ cursor: 'pointer', userSelect: 'none' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>Total Enrollments</span>
                          {counselorSortField === 'count' ? (counselorSortOrder === 'desc' ? <Icons.ArrowDown /> : <Icons.ArrowUp />) : <span style={{ opacity: 0.3 }}>⇅</span>}
                        </div>
                      </th>
                      <th
                        onClick={() => {
                          if (counselorSortField === 'sales') {
                            setCounselorSortOrder(counselorSortOrder === 'desc' ? 'asc' : 'desc');
                          } else {
                            setCounselorSortField('sales');
                            setCounselorSortOrder('desc');
                          }
                        }}
                        style={{ cursor: 'pointer', userSelect: 'none' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>Total Sales Collected</span>
                          {counselorSortField === 'sales' ? (counselorSortOrder === 'desc' ? <Icons.ArrowDown /> : <Icons.ArrowUp />) : <span style={{ opacity: 0.3 }}>⇅</span>}
                        </div>
                      </th>
                      <th
                        onClick={() => {
                          if (counselorSortField === 'avgTicket') {
                            setCounselorSortOrder(counselorSortOrder === 'desc' ? 'asc' : 'desc');
                          } else {
                            setCounselorSortField('avgTicket');
                            setCounselorSortOrder('desc');
                          }
                        }}
                        style={{ cursor: 'pointer', userSelect: 'none' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>Average Ticket Size</span>
                          {counselorSortField === 'avgTicket' ? (counselorSortOrder === 'desc' ? <Icons.ArrowDown /> : <Icons.ArrowUp />) : <span style={{ opacity: 0.3 }}>⇅</span>}
                        </div>
                      </th>
                      <th style={{ textAlign: 'right' }}>Drill-Down</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCounList.length > 0 ? (
                      filteredCounList.map((cStat, rank) => {
                        const isActive = activeCounselorNamesSet.has(cStat.name.toLowerCase().replace(/[_-]/g, ' ').trim());
                        const pctOfTop = Math.round((cStat.sales / maxSales) * 100);

                        return (
                          <tr key={cStat.name} style={{ transition: 'background 0.12s ease' }}>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{
                                  width: '24px', height: '24px', borderRadius: '8px',
                                  background: rank === 0 ? 'linear-gradient(135deg, #f59e0b, #d97706)' : rank === 1 ? 'linear-gradient(135deg, #94a3b8, #64748b)' : rank === 2 ? 'linear-gradient(135deg, #b45309, #78350f)' : 'var(--surface-alt)',
                                  color: rank < 3 ? '#fff' : 'var(--muted)',
                                  fontSize: '0.74rem', fontWeight: 900,
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  boxShadow: rank < 3 ? '0 2px 6px rgba(0,0,0,0.15)' : 'none',
                                }}>
                                  {rank + 1}
                                </span>
                                <div>
                                  <strong style={{ fontSize: '0.88rem', color: 'var(--text)', display: 'block' }}>
                                    {cStat.name.replace(/_/g, ' ')}
                                  </strong>
                                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '4px' }}>
                                    {getCounsellorBadges(cStat).map(b => (
                                      <span
                                        key={b.id}
                                        title={b.description}
                                        style={{
                                          fontSize: '0.66rem', fontWeight: 800, padding: '1px 6px',
                                          borderRadius: '6px', background: b.bg, color: b.color, border: `1px solid ${b.border}`,
                                          letterSpacing: '0.02em', whiteSpace: 'nowrap'
                                        }}
                                      >
                                        {b.name}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span style={{
                                display: 'inline-flex', alignItems: 'center', gap: '5px',
                                padding: '3px 9px', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 800,
                                background: isActive ? 'rgba(16, 185, 129, 0.12)' : 'rgba(100, 116, 139, 0.1)',
                                color: isActive ? '#10b981' : 'var(--muted)',
                                border: `1px solid ${isActive ? 'rgba(16, 185, 129, 0.3)' : 'rgba(100, 116, 139, 0.25)'}`
                              }}>
                                <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: isActive ? '#10b981' : 'var(--muted)' }} />
                                {isActive ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td>
                              <span style={{ fontWeight: 800, fontSize: '0.88rem' }}>{cStat.count.toLocaleString()}</span>
                            </td>
                            <td>
                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <span style={{ fontWeight: 900, fontSize: '0.92rem', color: '#10b981' }}>
                                    {formatCompactCurrency(cStat.sales)}
                                  </span>
                                  <span style={{ fontSize: '0.74rem', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
                                    (₹{cStat.sales.toLocaleString()})
                                  </span>
                                </div>
                                <div style={{ width: '100%', height: '4px', background: 'var(--surface-alt)', borderRadius: '2px', marginTop: '5px', overflow: 'hidden' }}>
                                  <div style={{ width: `${pctOfTop}%`, height: '100%', background: 'linear-gradient(90deg, #10b981, #06b6d4)', borderRadius: '2px' }} />
                                </div>
                              </div>
                            </td>
                            <td>
                              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.84rem', fontWeight: 600 }}>
                                ₹{Math.round(cStat.sales / cStat.count).toLocaleString()}
                              </span>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <button
                                type="button"
                                className="table-btn-soft"
                                onClick={() => openDrilldown(`Counsellor: ${cStat.name.replace(/_/g, ' ')} (${cStat.count} Students)`, filteredLeads.filter(l => cleanStr(l.counselorName || l.metadata?.['Counsellor']).toLowerCase().replace(/[_-]/g, ' ').trim() === cStat.name.toLowerCase().replace(/[_-]/g, ' ').trim()))}
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                              >
                                <span>View Students</span>
                                <Icons.ChevronRight />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)', fontWeight: 600 }}>
                          No counsellors found matching the selected filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            );
          })()}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════
          PILLAR 1: MAIN DASHBOARD
      ══════════════════════════════════════════════════════════════════════════ */}
      {activePillar === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          
          {/* Executive KPI Matrix */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            
            {/* 1. Total Enrollments */}
            <div
              onClick={() => openDrilldown('Total Enrollments (Master Converted Leads)', filteredLeads)}
              style={{
                background: 'var(--card-bg)', border: '1.5px solid var(--border)', borderRadius: '18px',
                padding: '20px', cursor: 'pointer', transition: 'all 0.15s ease', boxShadow: '0 4px 18px rgba(0,0,0,0.03)'
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--primary)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '0.04em' }}>Total Enrollments</span>
                <span style={{ color: 'var(--primary)' }}><Icons.Users /></span>
              </div>
              <div style={{ fontSize: '1.85rem', fontWeight: 900, color: 'var(--text)', marginTop: '8px', letterSpacing: '-0.02em' }}>
                {totalLeadsCount.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700, marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Icons.ArrowUp />
                <span>+{momStats.countGrowthPct}% MoM Growth • Click to view records →</span>
              </div>
            </div>

            {/* 2. Total Sales Collected */}
            <div
              onClick={() => openDrilldown('Total Sales Collected', filteredLeads)}
              style={{
                background: 'var(--card-bg)', border: '1.5px solid var(--border)', borderRadius: '18px',
                padding: '20px', cursor: 'pointer', transition: 'all 0.15s ease', boxShadow: '0 4px 18px rgba(0,0,0,0.03)'
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = '#10b981')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '0.04em' }}>Total Sales Collected</span>
                <span style={{ color: '#10b981' }}><Icons.Trend /></span>
              </div>
              <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#10b981', marginTop: '8px', letterSpacing: '-0.02em' }}>
                {formatCompactCurrency(totalSalesCollected)}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 600, marginTop: '6px' }}>
                Exact Value: ₹{totalSalesCollected.toLocaleString()}
              </div>
            </div>

            {/* 3. Current Month Performance */}
            <div
              onClick={() => openDrilldown('Current Month Performance', filteredLeads)}
              style={{
                background: 'var(--card-bg)', border: '1.5px solid var(--border)', borderRadius: '18px',
                padding: '20px', cursor: 'pointer', transition: 'all 0.15s ease', boxShadow: '0 4px 18px rgba(0,0,0,0.03)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '0.04em' }}>Current Month Sales</span>
                <span style={{ color: 'var(--primary)' }}><Icons.Dashboard /></span>
              </div>
              <div style={{ fontSize: '1.85rem', fontWeight: 900, color: 'var(--primary)', marginTop: '8px', letterSpacing: '-0.02em' }}>
                {formatCompactCurrency(momStats.currMonthSales)}
              </div>
              <div style={{ fontSize: '0.75rem', color: momStats.salesGrowthPct >= 0 ? '#10b981' : '#ef4444', fontWeight: 700, marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                {momStats.salesGrowthPct >= 0 ? <Icons.ArrowUp /> : <Icons.ArrowDown />}
                <span>{momStats.salesGrowthPct >= 0 ? `+${momStats.salesGrowthPct}%` : `${momStats.salesGrowthPct}%`} vs prior month</span>
              </div>
            </div>

            {/* 4. Walk-in Conversion % */}
            <div
              style={{
                background: 'var(--card-bg)', border: '1.5px solid var(--border)', borderRadius: '18px',
                padding: '20px', boxShadow: '0 4px 18px rgba(0,0,0,0.03)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '0.04em' }}>Walk-in Conversion %</span>
                <span style={{ color: '#06b6d4' }}><Icons.Funnel /></span>
              </div>
              <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#06b6d4', marginTop: '8px', letterSpacing: '-0.02em' }}>
                {overallConversionPct}%
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 600, marginTop: '6px' }}>
                {totalCompletedWalkins.toLocaleString()} Converted / {totalWalkinsCount.toLocaleString()} Walk-ins
              </div>
            </div>

          </div>

          {/* Branch & Top Performers Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '18px' }}>
            
            {/* Campus Branch Live Summary */}
            <div style={{ background: 'var(--card-bg)', border: '1.5px solid var(--border)', borderRadius: '18px', padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: 'var(--primary)' }}><Icons.Building /></span>
                  <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 900, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Campus Branch Performance
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setActivePillar('branches')}
                  style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 800, fontSize: '0.8rem', cursor: 'pointer' }}
                >
                  View Drill-down →
                </button>
              </div>

              {(() => {
                const bMap = new Map<string, { count: number; sales: number }>();
                filteredLeads.forEach(l => {
                  const loc = cleanStr(l.location || l.metadata?.['Batch Location']) || 'Hyderabad';
                  const cur = bMap.get(loc) || { count: 0, sales: 0 };
                  cur.count += 1;
                  cur.sales += (l.feePaid || 0);
                  bMap.set(loc, cur);
                });

                const sorted = Array.from(bMap.entries()).sort((a, b) => b[1].sales - a[1].sales);
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {sorted.map(([loc, stat]) => (
                      <div
                        key={loc}
                        onClick={() => openDrilldown(`Branch: ${loc}`, filteredLeads.filter(l => (l.location || l.metadata?.['Batch Location'] || 'Hyderabad').toLowerCase().includes(loc.toLowerCase())))}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '12px 16px', background: 'var(--surface)', borderRadius: '12px',
                          border: '1px solid var(--border)', cursor: 'pointer', transition: 'all 0.12s ease',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-alt)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'var(--surface)')}
                      >
                        <div>
                          <span style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--text)' }}>{loc}</span>
                          <span style={{ marginLeft: '10px', fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 600 }}>({stat.count.toLocaleString()} Enrollments)</span>
                        </div>
                        <span style={{ fontWeight: 900, fontSize: '0.92rem', color: '#10b981' }}>{formatCompactCurrency(stat.sales)}</span>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            {/* Top 5 Enrollment Counsellors */}
            <div style={{ background: 'var(--card-bg)', border: '1.5px solid var(--border)', borderRadius: '18px', padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: '#f59e0b' }}><Icons.Trophy /></span>
                  <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 900, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Top 5 Performing Counsellors
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setActivePillar('counsellors')}
                  style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 800, fontSize: '0.8rem', cursor: 'pointer' }}
                >
                  View All →
                </button>
              </div>

              {(() => {
                const cMap = new Map<string, { count: number; sales: number }>();
                filteredLeads.forEach(l => {
                  const coun = cleanStr(l.counselorName || l.metadata?.['Counsellor']);
                  if (coun && coun !== 'Unassigned') {
                    const cur = cMap.get(coun) || { count: 0, sales: 0 };
                    cur.count += 1;
                    cur.sales += (l.feePaid || 0);
                    cMap.set(coun, cur);
                  }
                });

                const top5 = Array.from(cMap.entries()).sort((a, b) => b[1].sales - a[1].sales).slice(0, 5);
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {top5.map(([coun, stat], rank) => (
                      <div
                        key={coun}
                        onClick={() => openDrilldown(`Counsellor: ${coun}`, filteredLeads.filter(l => cleanStr(l.counselorName || l.metadata?.['Counsellor']).toLowerCase() === coun.toLowerCase()))}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '12px 16px', background: 'var(--surface)', borderRadius: '12px',
                          border: '1px solid var(--border)', cursor: 'pointer', transition: 'all 0.12s ease',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-alt)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'var(--surface)')}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{
                            width: 24, height: 24, borderRadius: '8px',
                            background: rank === 0 ? 'linear-gradient(135deg, #f59e0b, #d97706)' : rank === 1 ? 'linear-gradient(135deg, #94a3b8, #64748b)' : 'var(--primary)',
                            color: '#fff', fontSize: '0.74rem', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center'
                          }}>
                            {rank + 1}
                          </span>
                          <span style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--text)' }}>{coun.replace(/_/g, ' ')}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 600 }}>({stat.count.toLocaleString()} Students)</span>
                        </div>
                        <span style={{ fontWeight: 900, fontSize: '0.92rem', color: '#10b981' }}>{formatCompactCurrency(stat.sales)}</span>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

          </div>

        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════
          PILLAR 2: YEARLY PERFORMANCE DASHBOARD (UNIFIED BOX WITH SAME-MONTH YOY)
      ══════════════════════════════════════════════════════════════════════════ */}
      {activePillar === 'monthly-sales' && (
        <div style={{
          background: 'var(--card-bg)', border: '1.5px solid var(--border)', borderRadius: '22px',
          padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', boxShadow: '0 8px 30px rgba(0,0,0,0.03)'
        }}>
          
          {/* Master Dashboard Header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px',
            paddingBottom: '20px', borderBottom: '1.5px solid var(--border)'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.3rem' }}>📅</span>
                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: 'var(--text)' }}>
                  Yearly Performance Dashboard
                </h2>
                <span style={{
                  padding: '3px 10px', borderRadius: '8px', fontSize: '0.74rem', fontWeight: 800,
                  background: 'rgba(99, 102, 241, 0.12)', color: 'var(--primary)', border: '1px solid rgba(99, 102, 241, 0.25)'
                }}>
                  YoY Comparative Intelligence
                </span>
              </div>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: 'var(--muted)', fontWeight: 600 }}>
                Direct same-month comparison tracking growth from last year (2025) to current year (2026).
              </p>
            </div>

            {/* Quick Master Summary Pills */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <div style={{ background: 'var(--surface)', padding: '8px 14px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', display: 'block' }}>2026 Performance</span>
                <strong style={{ fontSize: '0.92rem', color: '#10b981' }}>₹10.52 Cr</strong>
                <span style={{ fontSize: '0.72rem', color: 'var(--muted)', marginLeft: '6px' }}>(3,028 Enrolled)</span>
              </div>

              <div style={{ background: 'var(--surface)', padding: '8px 14px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', display: 'block' }}>2025 Performance</span>
                <strong style={{ fontSize: '0.92rem', color: '#6366f1' }}>₹15.25 Cr</strong>
                <span style={{ fontSize: '0.72rem', color: 'var(--muted)', marginLeft: '6px' }}>(6,553 Enrolled)</span>
              </div>
            </div>
          </div>
          {(() => {
            const monthlyMap = new Map<string, { year: number; month: number; sales: number; count: number; totalCourseFee: number }>();
            filteredLeads.forEach(l => {
              const d = new Date(l.enrollmentDate);
              if (!isNaN(d.getTime())) {
                const y = d.getFullYear();
                const m = d.getMonth() + 1;
                const key = `${y}-${String(m).padStart(2, '0')}`;
                const cur = monthlyMap.get(key) || { year: y, month: m, sales: 0, count: 0, totalCourseFee: 0 };
                cur.sales += (l.feePaid || 0);
                cur.count += 1;
                cur.totalCourseFee += (l.totalFee || 0);
                monthlyMap.set(key, cur);
              }
            });

            const allMonthsSorted = Array.from(monthlyMap.entries()).sort((a, b) => b[0].localeCompare(a[0]));

            // Split into 2026 and 2025
            const months2026 = allMonthsSorted.filter(([k]) => k.startsWith('2026'));
            const months2025 = allMonthsSorted.filter(([k]) => k.startsWith('2025'));

            // Compute totals for 2026
            const total2026Sales = months2026.reduce((acc, [, s]) => acc + s.sales, 0);
            const total2026Count = months2026.reduce((acc, [, s]) => acc + s.count, 0);
            const total2026Fee = months2026.reduce((acc, [, s]) => acc + s.totalCourseFee, 0);

            // Compute totals for 2025
            const total2025Sales = months2025.reduce((acc, [, s]) => acc + s.sales, 0);
            const total2025Count = months2025.reduce((acc, [, s]) => acc + s.count, 0);
            const total2025Fee = months2025.reduce((acc, [, s]) => acc + s.totalCourseFee, 0);

            const renderYearSection = (
              yearTitle: string,
              monthsList: typeof months2026,
              totSales: number,
              totCount: number,
              totFee: number,
              accentColor: string
            ) => (
              <div
                className="dash-table-card"
                style={{
                  border: '1.5px solid var(--border)',
                  borderRadius: '18px',
                  overflow: 'hidden',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.03)',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  width: '100%'
                }}
              >
                {/* Year Card Header */}
                <div style={{
                  padding: '16px 18px', borderBottom: '1px solid var(--border)', background: 'var(--card-bg)',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      padding: '3px 10px', borderRadius: '7px', fontSize: '0.8rem', fontWeight: 900,
                      background: accentColor === '#10b981' ? 'rgba(16, 185, 129, 0.14)' : 'rgba(99, 102, 241, 0.14)',
                      color: accentColor, border: `1.5px solid ${accentColor}40`
                    }}>
                      {yearTitle}
                    </span>
                    <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 900, color: 'var(--text)' }}>
                      Monthly Performance
                    </h3>
                  </div>

                  {/* Summary Metric Badges for Year */}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <div style={{ background: 'var(--surface)', padding: '5px 10px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                      <span style={{ fontSize: '0.64rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)' }}>Enrollments: </span>
                      <strong style={{ fontSize: '0.8rem', color: 'var(--text)' }}>{totCount.toLocaleString()}</strong>
                    </div>

                    <div style={{ background: 'var(--surface)', padding: '5px 10px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                      <span style={{ fontSize: '0.64rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)' }}>Sales: </span>
                      <strong style={{ fontSize: '0.8rem', color: '#10b981' }}>{formatCompactCurrency(totSales)}</strong>
                    </div>
                  </div>
                </div>

                {/* Table for Year without horizontal scrollbar - Clickable Month Rows */}
                <div style={{ width: '100%', overflowX: 'hidden', flex: 1 }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'auto', fontSize: '0.78rem' }}>
                    <thead>
                      <tr style={{ background: 'var(--surface-alt)', borderBottom: '1px solid var(--border)' }}>
                        <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 800, color: 'var(--muted)', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Month</th>
                        <th style={{ padding: '10px 10px', textAlign: 'left', fontWeight: 800, color: 'var(--muted)', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Enrolled</th>
                        <th style={{ padding: '10px 10px', textAlign: 'left', fontWeight: 800, color: 'var(--muted)', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Sales</th>
                        <th style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 800, color: 'var(--muted)', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Gross Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {monthsList.length > 0 ? (
                        monthsList.map(([key, stat], idx) => {
                          const prevStat = allMonthsSorted.find(([, s]) => {
                            const prevDate = new Date(stat.year, stat.month - 2, 1);
                            return s.year === prevDate.getFullYear() && s.month === prevDate.getMonth() + 1;
                          })?.[1];

                          const growth = prevStat && prevStat.sales > 0 ? Math.round(((stat.sales - prevStat.sales) / prevStat.sales) * 100) : 0;
                          return (
                            <tr
                              key={key}
                              onClick={() => openDrilldown(`Month: ${MONTH_NAMES[stat.month - 1]} ${stat.year} (${stat.count} Students)`, filteredLeads.filter(l => {
                                const d = new Date(l.enrollmentDate);
                                return d.getFullYear() === stat.year && (d.getMonth() + 1) === stat.month;
                              }))}
                              style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer', transition: 'background 0.12s ease' }}
                              onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-alt)')}
                              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                            >
                              <td style={{ padding: '11px 14px', whiteSpace: 'nowrap' }}>
                                <strong style={{ fontSize: '0.84rem', color: 'var(--primary)', textDecoration: 'underline', textUnderlineOffset: '3px' }}>
                                  {MONTH_NAMES[stat.month - 1]} {stat.year}
                                </strong>
                              </td>
                              <td style={{ padding: '11px 10px', whiteSpace: 'nowrap' }}>
                                <span style={{ fontWeight: 800, fontSize: '0.84rem' }}>{stat.count.toLocaleString()}</span>
                              </td>
                              <td style={{ padding: '11px 10px', whiteSpace: 'nowrap' }}>
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                                  <span style={{ fontWeight: 900, fontSize: '0.86rem', color: '#10b981' }}>
                                    {formatCompactCurrency(stat.sales)}
                                  </span>
                                  {prevStat && (
                                    <span style={{
                                      display: 'inline-flex', alignItems: 'center', gap: '1px',
                                      fontSize: '0.65rem', fontWeight: 800, color: growth >= 0 ? '#10b981' : '#ef4444',
                                      padding: '1px 4px', borderRadius: '4px', background: growth >= 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'
                                    }}>
                                      {growth >= 0 ? '▲' : '▼'}{growth >= 0 ? `+${growth}%` : `${growth}%`}
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td style={{ padding: '11px 14px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                                <span style={{ color: 'var(--muted)', fontSize: '0.82rem', fontWeight: 600 }}>{formatCompactCurrency(stat.totalCourseFee)}</span>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={4} style={{ padding: '24px', textAlign: 'center', color: 'var(--muted)' }}>
                            No records found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            );

            // Calculate Same-Month YoY Comparison for Jan-Aug
            const yoyMonths = [8, 7, 6, 5, 4, 3, 2, 1].map(m => {
              const stat2026 = months2026.find(([, s]) => s.month === m)?.[1] || { sales: 0, count: 0, totalCourseFee: 0 };
              const stat2025 = months2025.find(([, s]) => s.month === m)?.[1] || { sales: 0, count: 0, totalCourseFee: 0 };
              const salesDiff = stat2026.sales - stat2025.sales;
              const salesGrowth = stat2025.sales > 0 ? Math.round((salesDiff / stat2025.sales) * 100) : 0;
              const countDiff = stat2026.count - stat2025.count;
              const countGrowth = stat2025.count > 0 ? Math.round((countDiff / stat2025.count) * 100) : 0;

              return {
                monthNum: m,
                monthName: MONTH_NAMES[m - 1],
                stat2026,
                stat2025,
                salesDiff,
                salesGrowth,
                countDiff,
                countGrowth
              };
            });

            return (
              <>
                {/* ── SECTION 1: SAME-MONTH YEAR-OVER-YEAR (YOY) COMPARISON TABLE ── */}
                <div style={{
                  background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: '16px',
                  overflow: 'hidden', display: 'flex', flexDirection: 'column'
                }}>
                  <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', background: 'var(--surface-alt)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: 'var(--primary)' }}><Icons.Trend /></span>
                      <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 900, color: 'var(--text)' }}>
                        Same-Month YoY Growth Matrix (2026 vs 2025)
                      </h4>
                    </div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--muted)', fontWeight: 700 }}>
                      Direct Month-to-Month Performance Comparison
                    </span>
                  </div>

                  <div style={{ width: '100%', overflowX: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                      <thead>
                        <tr style={{ background: 'var(--card-bg)', borderBottom: '1px solid var(--border)' }}>
                          <th style={{ padding: '9px 12px', textAlign: 'left', fontWeight: 800, color: 'var(--muted)', fontSize: '0.68rem', textTransform: 'uppercase' }}>Month</th>
                          <th style={{ padding: '9px 10px', textAlign: 'right', fontWeight: 800, color: 'var(--muted)', fontSize: '0.68rem', textTransform: 'uppercase' }}>2025 Enrolled</th>
                          <th style={{ padding: '9px 10px', textAlign: 'right', fontWeight: 800, color: 'var(--muted)', fontSize: '0.68rem', textTransform: 'uppercase' }}>2026 Enrolled</th>
                          <th style={{ padding: '9px 10px', textAlign: 'right', fontWeight: 800, color: 'var(--muted)', fontSize: '0.68rem', textTransform: 'uppercase' }}>Volume Delta</th>
                          <th style={{ padding: '9px 10px', textAlign: 'right', fontWeight: 800, color: 'var(--muted)', fontSize: '0.68rem', textTransform: 'uppercase' }}>2025 Sales</th>
                          <th style={{ padding: '9px 10px', textAlign: 'right', fontWeight: 800, color: 'var(--muted)', fontSize: '0.68rem', textTransform: 'uppercase' }}>2026 Sales</th>
                          <th style={{ padding: '9px 12px', textAlign: 'right', fontWeight: 800, color: 'var(--muted)', fontSize: '0.68rem', textTransform: 'uppercase' }}>YoY Sales Growth</th>
                        </tr>
                      </thead>
                      <tbody>
                        {yoyMonths.map(row => (
                          <tr key={row.monthNum} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.1s ease' }}>
                            <td style={{ padding: '9px 12px', fontWeight: 800, color: 'var(--text)' }}>
                              {row.monthName}
                            </td>
                            <td style={{ padding: '9px 10px', textAlign: 'right', color: 'var(--muted)' }}>
                              {row.stat2025.count.toLocaleString()}
                            </td>
                            <td style={{ padding: '9px 10px', textAlign: 'right', fontWeight: 800, color: 'var(--text)' }}>
                              {row.stat2026.count.toLocaleString()}
                            </td>
                            <td style={{ padding: '9px 10px', textAlign: 'right' }}>
                              <span style={{
                                display: 'inline-flex', alignItems: 'center', gap: '2px', fontSize: '0.72rem', fontWeight: 800,
                                color: row.countDiff >= 0 ? '#10b981' : '#ef4444'
                              }}>
                                {row.countDiff >= 0 ? `+${row.countDiff}` : `${row.countDiff}`} ({row.countGrowth >= 0 ? `+${row.countGrowth}%` : `${row.countGrowth}%`})
                              </span>
                            </td>
                            <td style={{ padding: '9px 10px', textAlign: 'right', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
                              {formatCompactCurrency(row.stat2025.sales)}
                            </td>
                            <td style={{ padding: '9px 10px', textAlign: 'right', fontWeight: 900, color: '#10b981', fontFamily: 'var(--font-mono)' }}>
                              {formatCompactCurrency(row.stat2026.sales)}
                            </td>
                            <td style={{ padding: '9px 12px', textAlign: 'right' }}>
                              <span style={{
                                display: 'inline-flex', alignItems: 'center', gap: '3px',
                                padding: '3px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 800,
                                background: row.salesGrowth >= 0 ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                                color: row.salesGrowth >= 0 ? '#10b981' : '#ef4444',
                                border: `1px solid ${row.salesGrowth >= 0 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
                              }}>
                                {row.salesGrowth >= 0 ? <Icons.ArrowUp /> : <Icons.ArrowDown />}
                                <span>{row.salesGrowth >= 0 ? `+${row.salesGrowth}%` : `${row.salesGrowth}%`}</span>
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* ── SECTION 2: 2-COLUMN SIDE-BY-SIDE MONTHLY BREAKDOWN ── */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: '18px', alignItems: 'start' }}>
                  {/* Column 1: 2026 Performance */}
                  <div>
                    {renderYearSection('2026 Performance', months2026, total2026Sales, total2026Count, total2026Fee, '#10b981')}
                  </div>

                  {/* Column 2: 2025 Performance */}
                  <div>
                    {renderYearSection('2025 Performance', months2025, total2025Sales, total2025Count, total2025Fee, '#6366f1')}
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════
          FINANCE & BALANCES MODULAR DASHBOARDS (ZOHO FINANCE ANALYTICS STYLE)
      ══════════════════════════════════════════════════════════════════════════ */}
      {activePillar === 'finance-dashboards' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Top Bar for Finance Dashboards */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px',
            background: 'var(--card-bg)', border: '1.5px solid var(--border)', borderRadius: '16px', padding: '16px 20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '1.2rem', color: '#10b981' }}>💰</span>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 900, color: 'var(--text)' }}>
                  Finance, Revenue &amp; Pending Balances Multi-Dashboard
                </h3>
                <span style={{ fontSize: '0.76rem', color: 'var(--muted)', fontWeight: 600 }}>
                  Live batch balances, branch month-wise collections, and course fee recovery from PostgreSQL
                </span>
              </div>
            </div>

            {/* Branch Selector for Month Wise Revenue */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase' }}>Branch View:</span>
              <div style={{ display: 'inline-flex', background: 'var(--surface-alt)', padding: '2px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                {['ALL', 'VIJ', 'HYD', 'VSP', 'BLR'].map(b => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setFinanceSelectedBranch(b)}
                    style={{
                      padding: '4px 12px', borderRadius: '6px', fontSize: '0.76rem', fontWeight: 800, border: 'none',
                      background: financeSelectedBranch === b ? 'var(--primary)' : 'transparent',
                      color: financeSelectedBranch === b ? '#fff' : 'var(--text)', cursor: 'pointer',
                      transition: 'all 0.12s ease'
                    }}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 3-Column Grid of Zoho Finance Style Dashboards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '18px' }}>
            
            {/* ── CARD 1: Pending Balances - Overall by Batch ID ── */}
            <div className="dash-table-card" style={{ border: '1.5px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', background: 'var(--surface-alt)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 900, color: 'var(--text)' }}>
                  Pending Balances - Overall
                </h4>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)', padding: '2px 8px', borderRadius: '6px' }}>
                  Batch Level
                </span>
              </div>

              {(() => {
                const batchMap = new Map<string, { batchId: string; grandTotal: number; balance: number; count: number }>();
                filteredLeads.forEach(l => {
                  const bId = cleanStr(l.metadata?.['Batch Id'] || l.metadata?.['Batch Master Name'] || l.course) || 'Unassigned Batch';
                  const cur = batchMap.get(bId) || { batchId: bId, grandTotal: 0, balance: 0, count: 0 };
                  const fee = (l.totalFee || l.feePaid || 0);
                  const paid = (l.feePaid || 0);
                  const bal = Math.max(0, fee - paid);
                  cur.grandTotal += fee;
                  cur.balance += bal;
                  cur.count += 1;
                  batchMap.set(bId, cur);
                });

                const sortedBatches = Array.from(batchMap.values()).sort((a, b) => b.balance - a.balance).slice(0, 15);
                const sumGrand = Array.from(batchMap.values()).reduce((a, b) => a + b.grandTotal, 0);
                const sumBal = Array.from(batchMap.values()).reduce((a, b) => a + b.balance, 0);

                return (
                  <div className="table-wrapper" style={{ maxHeight: '420px', overflowY: 'auto' }}>
                    <table style={{ fontSize: '0.8rem' }}>
                      <thead style={{ position: 'sticky', top: 0, zIndex: 2 }}>
                        <tr style={{ background: 'var(--card-bg)' }}>
                          <th>Batch ID (I)</th>
                          <th style={{ textAlign: 'right' }}>Sum Of Grand Total</th>
                          <th style={{ textAlign: 'right' }}>Sum Of Balance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedBatches.map(b => (
                          <tr key={b.batchId}>
                            <td><strong style={{ fontFamily: 'var(--font-mono)' }}>{b.batchId}</strong></td>
                            <td style={{ textAlign: 'right', fontWeight: 600 }}>₹{b.grandTotal.toLocaleString()}</td>
                            <td style={{ textAlign: 'right', fontWeight: 700, color: b.balance > 0 ? '#ef4444' : '#10b981' }}>
                              ₹{b.balance.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot style={{ position: 'sticky', bottom: 0, zIndex: 2, background: 'var(--surface-alt)', borderTop: '2px solid var(--border)' }}>
                        <tr style={{ fontWeight: 900 }}>
                          <td>Total</td>
                          <td style={{ textAlign: 'right', color: 'var(--text)' }}>₹{sumGrand.toLocaleString()}</td>
                          <td style={{ textAlign: 'right', color: '#ef4444' }}>₹{sumBal.toLocaleString()}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                );
              })()}
            </div>

            {/* ── CARD 2: Month Wise Revenue by Branch ── */}
            <div className="dash-table-card" style={{ border: '1.5px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', background: 'var(--surface-alt)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 900, color: 'var(--text)' }}>
                  Month Wise Revenue - {financeSelectedBranch}
                </h4>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '2px 8px', borderRadius: '6px' }}>
                  Invoice Date
                </span>
              </div>

              {(() => {
                const monthBranchMap = new Map<string, { key: string; dateStr: string; grandTotal: number; balance: number }>();
                filteredLeads.forEach(l => {
                  const loc = (l.location || l.metadata?.['Batch Location'] || '').toUpperCase();
                  if (financeSelectedBranch !== 'ALL' && !loc.includes(financeSelectedBranch)) return;

                  const d = new Date(l.enrollmentDate);
                  if (!isNaN(d.getTime())) {
                    const y = d.getFullYear();
                    const m = d.getMonth() + 1;
                    const key = `${y}-${String(m).padStart(2, '0')}`;
                    const cur = monthBranchMap.get(key) || { key, dateStr: `${MONTH_NAMES[m - 1]} ${y}`, grandTotal: 0, balance: 0 };
                    const fee = (l.totalFee || l.feePaid || 0);
                    const paid = (l.feePaid || 0);
                    cur.grandTotal += paid;
                    cur.balance += Math.max(0, fee - paid);
                    monthBranchMap.set(key, cur);
                  }
                });

                const sortedMonths = Array.from(monthBranchMap.values()).sort((a, b) => b.key.localeCompare(a.key)).slice(0, 15);
                const sumGrand = Array.from(monthBranchMap.values()).reduce((a, b) => a + b.grandTotal, 0);
                const sumBal = Array.from(monthBranchMap.values()).reduce((a, b) => a + b.balance, 0);

                return (
                  <div className="table-wrapper" style={{ maxHeight: '420px', overflowY: 'auto' }}>
                    <table style={{ fontSize: '0.8rem' }}>
                      <thead style={{ position: 'sticky', top: 0, zIndex: 2 }}>
                        <tr style={{ background: 'var(--card-bg)' }}>
                          <th>Invoice Date</th>
                          <th style={{ textAlign: 'right' }}>Sum Of Grand Total</th>
                          <th style={{ textAlign: 'right' }}>Sum Of Balance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedMonths.map(m => (
                          <tr key={m.key}>
                            <td><strong>{m.dateStr}</strong></td>
                            <td style={{ textAlign: 'right', fontWeight: 600 }}>₹{m.grandTotal.toLocaleString()}</td>
                            <td style={{ textAlign: 'right', fontWeight: 700, color: m.balance > 0 ? '#ef4444' : '#10b981' }}>
                              ₹{m.balance.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot style={{ position: 'sticky', bottom: 0, zIndex: 2, background: 'var(--surface-alt)', borderTop: '2px solid var(--border)' }}>
                        <tr style={{ fontWeight: 900 }}>
                          <td>Total</td>
                          <td style={{ textAlign: 'right', color: '#10b981' }}>₹{sumGrand.toLocaleString()}</td>
                          <td style={{ textAlign: 'right', color: '#ef4444' }}>₹{sumBal.toLocaleString()}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                );
              })()}
            </div>

            {/* ── CARD 3: Course Wise Revenue ── */}
            <div className="dash-table-card" style={{ border: '1.5px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', background: 'var(--surface-alt)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 900, color: 'var(--text)' }}>
                  Course Wise Revenue
                </h4>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#6366f1', background: 'rgba(99, 102, 241, 0.1)', padding: '2px 8px', borderRadius: '6px' }}>
                  Program Breakdown
                </span>
              </div>

              {(() => {
                const courseMap = new Map<string, { course: string; grandTotal: number; balance: number; count: number }>();
                filteredLeads.forEach(l => {
                  const cName = l.course || 'Other Courses';
                  const cur = courseMap.get(cName) || { course: cName, grandTotal: 0, balance: 0, count: 0 };
                  const fee = (l.totalFee || l.feePaid || 0);
                  const paid = (l.feePaid || 0);
                  cur.grandTotal += fee;
                  cur.balance += Math.max(0, fee - paid);
                  cur.count += 1;
                  courseMap.set(cName, cur);
                });

                const sortedCourses = Array.from(courseMap.values()).sort((a, b) => b.grandTotal - a.grandTotal).slice(0, 15);
                const sumGrand = Array.from(courseMap.values()).reduce((a, b) => a + b.grandTotal, 0);
                const sumBal = Array.from(courseMap.values()).reduce((a, b) => a + b.balance, 0);

                return (
                  <div className="table-wrapper" style={{ maxHeight: '420px', overflowY: 'auto' }}>
                    <table style={{ fontSize: '0.8rem' }}>
                      <thead style={{ position: 'sticky', top: 0, zIndex: 2 }}>
                        <tr style={{ background: 'var(--card-bg)' }}>
                          <th>Course Name</th>
                          <th style={{ textAlign: 'right' }}>Sum Of Grand Total</th>
                          <th style={{ textAlign: 'right' }}>Sum Of Balance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedCourses.map(c => (
                          <tr key={c.course}>
                            <td><strong>{c.course}</strong></td>
                            <td style={{ textAlign: 'right', fontWeight: 600 }}>₹{c.grandTotal.toLocaleString()}</td>
                            <td style={{ textAlign: 'right', fontWeight: 700, color: c.balance > 0 ? '#ef4444' : '#10b981' }}>
                              ₹{c.balance.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot style={{ position: 'sticky', bottom: 0, zIndex: 2, background: 'var(--surface-alt)', borderTop: '2px solid var(--border)' }}>
                        <tr style={{ fontWeight: 900 }}>
                          <td>Total</td>
                          <td style={{ textAlign: 'right', color: 'var(--text)' }}>₹{sumGrand.toLocaleString()}</td>
                          <td style={{ textAlign: 'right', color: '#ef4444' }}>₹{sumBal.toLocaleString()}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                );
              })()}
            </div>

          </div>

        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════
          PILLAR 3: BRANCH PERFORMANCE
      ══════════════════════════════════════════════════════════════════════════ */}
      {activePillar === 'branches' && (
        <div className="dash-table-card" style={{ border: '1.5px solid var(--border)', borderRadius: '18px', overflow: 'hidden' }}>
          <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border)', background: 'var(--card-bg)' }}>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 900, color: 'var(--text)' }}>
              Branch Performance (Attributed by Counsellor &amp; Batch Location)
            </h3>
          </div>

          {(() => {
            const branchDataMap = new Map<string, { branch: string; sales: number; count: number; totalFee: number; counselors: Set<string> }>();
            filteredLeads.forEach(l => {
              const loc = cleanStr(l.location || l.metadata?.['Batch Location']) || 'Hyderabad';
              const cur = branchDataMap.get(loc) || { branch: loc, sales: 0, count: 0, totalFee: 0, counselors: new Set() };
              cur.sales += (l.feePaid || 0);
              cur.count += 1;
              cur.totalFee += (l.totalFee || 0);
              const c = cleanStr(l.counselorName || l.metadata?.['Counsellor']);
              if (c && c !== 'Unassigned') cur.counselors.add(c);
              branchDataMap.set(loc, cur);
            });

            const sortedBranches = Array.from(branchDataMap.values()).sort((a, b) => b.sales - a.sales);

            return (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr style={{ background: 'var(--surface-alt)' }}>
                      <th>Branch / Location</th>
                      <th>Rank</th>
                      <th>Total Enrollments</th>
                      <th>Total Sales Collected</th>
                      <th>Active Counsellors</th>
                      <th>Avg Ticket Size</th>
                      <th style={{ textAlign: 'right' }}>Drill-Down</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedBranches.map((bStat, idx) => (
                      <tr key={bStat.branch}>
                        <td>
                          <strong style={{ fontSize: '0.9rem', color: 'var(--text)' }}>{bStat.branch}</strong>
                        </td>
                        <td>
                          <span style={{ fontWeight: 800, color: idx === 0 ? '#f59e0b' : 'var(--muted)' }}>#{idx + 1}</span>
                        </td>
                        <td>
                          <span style={{ fontWeight: 800 }}>{bStat.count.toLocaleString()}</span>
                        </td>
                        <td>
                          <span style={{ fontWeight: 900, color: '#10b981', fontSize: '0.92rem' }}>{formatCompactCurrency(bStat.sales)}</span>
                        </td>
                        <td>
                          <span style={{ fontSize: '0.82rem', color: 'var(--primary)', fontWeight: 700 }}>{bStat.counselors.size} Counsellors</span>
                        </td>
                        <td>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.84rem' }}>₹{Math.round(bStat.sales / bStat.count).toLocaleString()}</span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            type="button"
                            className="table-btn-soft"
                            onClick={() => openDrilldown(`Branch: ${bStat.branch} (${bStat.count} Students)`, filteredLeads.filter(l => (l.location || l.metadata?.['Batch Location'] || 'Hyderabad').toLowerCase().includes(bStat.branch.toLowerCase())))}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            <span>Branch Records</span>
                            <Icons.ChevronRight />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })()}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════
          PILLAR 5: WALK-IN ANALYTICS
      ══════════════════════════════════════════════════════════════════════════ */}
      {activePillar === 'walkins' && (
        <div className="dash-table-card" style={{ border: '1.5px solid var(--border)', borderRadius: '18px', overflow: 'hidden' }}>
          <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border)', background: 'var(--card-bg)' }}>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 900, color: 'var(--text)' }}>
              Dedicated Walk-in Analytics &amp; Walk-in Counsellor Ranking
            </h3>
          </div>

          {(() => {
            const wcMap = new Map<string, { count: number; sales: number }>();
            filteredLeads.forEach(l => {
              const wc = cleanStr(l.metadata?.['Walk-in Counsellor'] || l.metadata?.['Walkin Counsellor']);
              if (wc && wc !== '—') {
                const cur = wcMap.get(wc) || { count: 0, sales: 0 };
                cur.count += 1;
                cur.sales += (l.feePaid || 0);
                wcMap.set(wc, cur);
              }
            });

            const sortedWC = Array.from(wcMap.entries()).sort((a, b) => b[1].count - a[1].count);

            return (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr style={{ background: 'var(--surface-alt)' }}>
                      <th>Walk-in Counsellor</th>
                      <th>Rank</th>
                      <th>Attended Walk-ins (Converted)</th>
                      <th>Total Sales Generated</th>
                      <th style={{ textAlign: 'right' }}>Records</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedWC.map(([wcName, stat], idx) => (
                      <tr key={wcName}>
                        <td>
                          <strong style={{ fontSize: '0.88rem', color: 'var(--text)' }}>{wcName}</strong>
                        </td>
                        <td>
                          <span style={{ fontWeight: 800, color: idx === 0 ? '#f59e0b' : 'var(--muted)' }}>#{idx + 1}</span>
                        </td>
                        <td>
                          <span style={{ fontWeight: 800 }}>{stat.count.toLocaleString()}</span>
                        </td>
                        <td>
                          <span style={{ fontWeight: 900, color: '#10b981' }}>{formatCompactCurrency(stat.sales)}</span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            type="button"
                            className="table-btn-soft"
                            onClick={() => openDrilldown(`Walk-in Counsellor: ${wcName}`, filteredLeads.filter(l => cleanStr(l.metadata?.['Walk-in Counsellor'] || l.metadata?.['Walkin Counsellor']).toLowerCase() === wcName.toLowerCase()))}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            <span>View Records</span>
                            <Icons.ChevronRight />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })()}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════
          PILLAR 6: CONVERSION FUNNEL
      ══════════════════════════════════════════════════════════════════════════ */}
      {activePillar === 'conversion' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ background: 'var(--card-bg)', border: '1.5px solid var(--border)', borderRadius: '18px', padding: '24px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.05rem', fontWeight: 900, color: 'var(--text)' }}>
              Live Walk-in to Enrollment Conversion Funnel
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div style={{ background: 'var(--surface)', padding: '18px', borderRadius: '14px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)' }}>Stage 1: Walk-ins</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text)', marginTop: '6px' }}>{totalWalkinsCount.toLocaleString()}</div>
                <div style={{ fontSize: '0.74rem', color: 'var(--muted)', marginTop: '4px' }}>100% Pipeline Base</div>
              </div>

              <div style={{ background: 'var(--surface)', padding: '18px', borderRadius: '14px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)' }}>Stage 2: Counseled</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--primary)', marginTop: '6px' }}>{totalCompletedWalkins.toLocaleString()}</div>
                <div style={{ fontSize: '0.74rem', color: 'var(--primary)', marginTop: '4px', fontWeight: 700 }}>{overallConversionPct}% Counseled</div>
              </div>

              <div style={{ background: 'var(--surface)', padding: '18px', borderRadius: '14px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)' }}>Stage 3: Enrolled</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#10b981', marginTop: '6px' }}>{totalLeadsCount.toLocaleString()}</div>
                <div style={{ fontSize: '0.74rem', color: '#10b981', marginTop: '4px', fontWeight: 700 }}>Master Enrolled Candidates</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════
          PILLAR 7: LEAD OWNERS
      ══════════════════════════════════════════════════════════════════════════ */}
      {activePillar === 'lead-owners' && (
        <div className="dash-table-card" style={{ border: '1.5px solid var(--border)', borderRadius: '18px', overflow: 'hidden' }}>
          <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border)', background: 'var(--card-bg)' }}>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 900, color: 'var(--text)' }}>
              Lead Owner &amp; Historical Fallback Analysis
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--muted)' }}>
              Tracks Codegnan / Super Admin records and empty-counselor fallback data.
            </p>
          </div>

          {(() => {
            const ownerMap = new Map<string, { count: number; sales: number; emptyCounsellorCount: number }>();
            filteredLeads.forEach(l => {
              const oName = cleanStr(l.leadOwner || l.metadata?.['Converted Lead Owner']) || 'Codegnan';
              const cur = ownerMap.get(oName) || { count: 0, sales: 0, emptyCounsellorCount: 0 };
              cur.count += 1;
              cur.sales += (l.feePaid || 0);

              const coun = cleanStr(l.counselorName || l.metadata?.['Counsellor']);
              if (!coun || coun === 'Unassigned') {
                cur.emptyCounsellorCount += 1;
              }

              ownerMap.set(oName, cur);
            });

            const sortedOwners = Array.from(ownerMap.entries()).sort((a, b) => b[1].sales - a[1].sales);

            return (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr style={{ background: 'var(--surface-alt)' }}>
                      <th>Lead Owner Account</th>
                      <th>Total Associated Leads</th>
                      <th>Total Sales Value</th>
                      <th>Fallback Records (No Counsellor Assigned)</th>
                      <th style={{ textAlign: 'right' }}>Records</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedOwners.map(([oName, stat]) => (
                      <tr key={oName}>
                        <td>
                          <strong style={{ fontSize: '0.88rem', color: 'var(--text)' }}>{oName}</strong>
                        </td>
                        <td>
                          <span style={{ fontWeight: 800 }}>{stat.count.toLocaleString()}</span>
                        </td>
                        <td>
                          <span style={{ fontWeight: 900, color: '#10b981' }}>{formatCompactCurrency(stat.sales)}</span>
                        </td>
                        <td>
                          <span style={{ color: stat.emptyCounsellorCount > 0 ? '#f59e0b' : 'var(--muted)', fontWeight: 700, fontSize: '0.82rem' }}>
                            {stat.emptyCounsellorCount.toLocaleString()} Records
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            type="button"
                            className="table-btn-soft"
                            onClick={() => openDrilldown(`Lead Owner: ${oName}`, filteredLeads.filter(l => (cleanStr(l.leadOwner || l.metadata?.['Converted Lead Owner']) || 'Codegnan').toLowerCase() === oName.toLowerCase()))}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            <span>View Records</span>
                            <Icons.ChevronRight />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })()}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════
          PILLAR 8: 12 SEASONS TROPHIES & LEADERBOARDS SHOWCASE
      ══════════════════════════════════════════════════════════════════════════ */}
      {activePillar === 'leaderboards' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Header Card for Seasons */}
          <div style={{
            background: 'var(--card-bg)', border: '1.5px solid var(--border)', borderRadius: '20px',
            padding: '22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.5rem' }}>🏆</span>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: 'var(--text)' }}>
                  Annual 12-Seasons Trophies &amp; Hall of Fame
                </h3>
              </div>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: 'var(--muted)', fontWeight: 600 }}>
                Every calendar year consists of 12 Seasons. Each season awards the **Counsellor of the Season Trophy**, Gold/Silver/Bronze Medals, and Volume Badges.
              </p>
            </div>

            {/* Season Year Switcher */}
            <div style={{ display: 'inline-flex', background: 'var(--surface-alt)', padding: '4px', borderRadius: '12px', border: '1px solid var(--border)' }}>
              {['2026', '2025'].map(yr => (
                <button
                  key={yr}
                  type="button"
                  onClick={() => setSelectedSeasonYear(yr)}
                  style={{
                    padding: '6px 18px', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 900, border: 'none',
                    background: selectedSeasonYear === yr ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'transparent',
                    color: selectedSeasonYear === yr ? '#fff' : 'var(--text)', cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  Season Year {yr}
                </button>
              ))}
            </div>
          </div>

          {/* 12-Season Trophies Grid */}
          {(() => {
            const yrNum = parseInt(selectedSeasonYear, 10);
            
            // Build month-by-month season stats for all 12 seasons
            const seasons = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(m => {
              const monthName = MONTH_NAMES[m - 1];
              const monthLeads = filteredLeads.filter(l => {
                const d = new Date(l.enrollmentDate);
                return d.getFullYear() === yrNum && (d.getMonth() + 1) === m;
              });

              const cMap = new Map<string, { name: string; sales: number; count: number }>();
              monthLeads.forEach(l => {
                const coun = cleanStr(l.counselorName || l.metadata?.['Counsellor']);
                if (coun && coun !== 'Unassigned') {
                  const cur = cMap.get(coun) || { name: coun, sales: 0, count: 0 };
                  cur.sales += (l.feePaid || 0);
                  cur.count += 1;
                  cMap.set(coun, cur);
                }
              });

              const rankedBySales = Array.from(cMap.values()).sort((a, b) => b.sales - a.sales);
              const rankedByCount = Array.from(cMap.values()).sort((a, b) => b.count - a.count);

              const champion = rankedBySales[0] || null;
              const silver = rankedBySales[1] || null;
              const bronze = rankedBySales[2] || null;
              const volumeChamp = rankedByCount[0] || null;
              const totalSeasonSales = monthLeads.reduce((acc, l) => acc + (l.feePaid || 0), 0);

              return {
                seasonNumber: m,
                seasonName: `Season ${m} (${monthName} ${yrNum})`,
                monthName,
                totalLeads: monthLeads.length,
                totalSeasonSales,
                champion,
                silver,
                bronze,
                volumeChamp,
                monthLeads
              };
            });

            // Calculate winning branch per season and map counsellors to winning branches
            const branchSeasonMap: Record<number, { winningBranch: string; sales: number; team: string[] }> = {};
            [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].forEach(m => {
              const mLeads = filteredLeads.filter(l => {
                const d = new Date(l.enrollmentDate);
                return d.getFullYear() === yrNum && (d.getMonth() + 1) === m;
              });
              const bMap = new Map<string, { sales: number; counsellors: Set<string> }>();
              mLeads.forEach(l => {
                const loc = cleanStr(l.location || l.branchName) || 'Hyderabad';
                const coun = cleanStr(l.counselorName || l.metadata?.['Counsellor']);
                const cur = bMap.get(loc) || { sales: 0, counsellors: new Set<string>() };
                cur.sales += (l.feePaid || 0);
                if (coun && coun !== 'Unassigned') cur.counsellors.add(coun);
                bMap.set(loc, cur);
              });
              const sortedB = Array.from(bMap.entries()).sort((a, b) => b[1].sales - a[1].sales);
              if (sortedB[0]) {
                branchSeasonMap[m] = {
                  winningBranch: sortedB[0][0],
                  sales: sortedB[0][1].sales,
                  team: Array.from(sortedB[0][1].counsellors)
                };
              }
            });

            return (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '18px' }}>
                {seasons.map(s => {
                  const bChamp = branchSeasonMap[s.seasonNumber];
                  return (
                  <div
                    key={s.seasonNumber}
                    className="dash-table-card"
                    style={{
                      border: s.champion ? '1.5px solid var(--border)' : '1px dashed var(--border)',
                      borderRadius: '18px', overflow: 'hidden', display: 'flex', flexDirection: 'column',
                      boxShadow: s.champion ? '0 8px 24px rgba(0,0,0,0.03)' : 'none',
                      opacity: s.totalLeads > 0 ? 1 : 0.6
                    }}
                  >
                    {/* Season Header */}
                    <div style={{
                      padding: '16px 20px', borderBottom: '1px solid var(--border)', background: 'var(--surface-alt)',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '1.2rem' }}>🏆</span>
                        <h4 style={{ margin: 0, fontSize: '0.94rem', fontWeight: 900, color: 'var(--text)' }}>
                          {s.seasonName}
                        </h4>
                      </div>
                      <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '2px 8px', borderRadius: '6px' }}>
                        {formatCompactCurrency(s.totalSeasonSales)}
                      </span>
                    </div>

                    {/* Season Trophy & Medal Winners */}
                    <div style={{ padding: '16px 20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {s.champion ? (
                        <>
                          {/* 🏛️ Winning Branch Season Trophy & Team Gold Medals */}
                          {bChamp && (
                            <div style={{
                              background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.12) 0%, rgba(202, 138, 4, 0.06) 100%)',
                              border: '1.5px solid rgba(234, 179, 8, 0.35)', borderRadius: '12px', padding: '12px 14px'
                            }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <span style={{ fontSize: '1.3rem' }}>🏛️</span>
                                  <div>
                                    <span style={{ fontSize: '0.64rem', fontWeight: 900, textTransform: 'uppercase', color: '#eab308', letterSpacing: '0.04em' }}>
                                      Winning Branch Season Trophy
                                    </span>
                                    <strong style={{ fontSize: '0.88rem', color: 'var(--text)', display: 'block' }}>
                                      {bChamp.winningBranch}
                                    </strong>
                                  </div>
                                </div>
                                <span style={{ fontSize: '0.86rem', fontWeight: 900, color: '#10b981' }}>
                                  {formatCompactCurrency(bChamp.sales)}
                                </span>
                              </div>

                              {/* Counsellors receiving winning gold season medals */}
                              <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(234, 179, 8, 0.2)' }}>
                                <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#eab308', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <span>🥇 Winning Gold Season Medals Awarded To ({bChamp.team.length} Counsellors):</span>
                                </span>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                                  {bChamp.team.slice(0, 5).map(cName => (
                                    <span
                                      key={cName}
                                      onClick={() => openDrilldown(`${s.seasonName} Gold Medalist: ${cName}`, s.monthLeads.filter(l => cleanStr(l.counselorName || l.metadata?.['Counsellor']).toLowerCase() === cName.toLowerCase()))}
                                      style={{
                                        fontSize: '0.68rem', fontWeight: 800, padding: '2px 7px', borderRadius: '6px',
                                        background: 'rgba(234, 179, 8, 0.2)', color: 'var(--text)', border: '1px solid rgba(234, 179, 8, 0.4)',
                                        cursor: 'pointer'
                                      }}
                                    >
                                      🥇 {cName.replace(/_/g, ' ')}
                                    </span>
                                  ))}
                                  {bChamp.team.length > 5 && (
                                    <span style={{ fontSize: '0.66rem', color: 'var(--muted)', fontWeight: 700, padding: '2px 4px' }}>
                                      +{bChamp.team.length - 5} more
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* 🏆 Individual Counsellor of the Season Trophy */}
                          <div
                            onClick={() => openDrilldown(`${s.seasonName} Champion: ${s.champion?.name.replace(/_/g, ' ')}`, s.monthLeads.filter(l => cleanStr(l.counselorName || l.metadata?.['Counsellor']).toLowerCase() === s.champion?.name.toLowerCase()))}
                            style={{
                              padding: '12px 14px', borderRadius: '12px',
                              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.14) 0%, rgba(217, 119, 6, 0.08) 100%)',
                              border: '1.5px solid rgba(245, 158, 11, 0.35)', cursor: 'pointer',
                              display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <span style={{ fontSize: '1.4rem' }}>🏆</span>
                              <div>
                                <span style={{ fontSize: '0.66rem', fontWeight: 900, textTransform: 'uppercase', color: '#f59e0b', letterSpacing: '0.04em' }}>
                                  Counsellor of the Season
                                </span>
                                <strong style={{ fontSize: '0.92rem', color: 'var(--text)', display: 'block' }}>
                                  {s.champion.name.replace(/_/g, ' ')}
                                </strong>
                              </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <span style={{ fontSize: '0.92rem', fontWeight: 900, color: '#10b981', display: 'block' }}>
                                {formatCompactCurrency(s.champion.sales)}
                              </span>
                              <span style={{ fontSize: '0.72rem', color: 'var(--muted)', fontWeight: 700 }}>
                                {s.champion.count} Enrolled
                              </span>
                            </div>
                          </div>

                          {/* Medals & Volume Badge */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.78rem' }}>
                            {s.silver && (
                              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid var(--border)' }}>
                                <span style={{ color: 'var(--text)', fontWeight: 700 }}>🥈 Silver Medal: {s.silver.name.replace(/_/g, ' ')}</span>
                                <span style={{ color: '#10b981', fontWeight: 800 }}>{formatCompactCurrency(s.silver.sales)}</span>
                              </div>
                            )}
                            {s.bronze && (
                              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid var(--border)' }}>
                                <span style={{ color: 'var(--text)', fontWeight: 700 }}>🥉 Bronze Medal: {s.bronze.name.replace(/_/g, ' ')}</span>
                                <span style={{ color: '#10b981', fontWeight: 800 }}>{formatCompactCurrency(s.bronze.sales)}</span>
                              </div>
                            )}
                            {s.volumeChamp && s.volumeChamp.name !== s.champion.name && (
                              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                                <span style={{ color: 'var(--primary)', fontWeight: 800 }}>🎓 Volume Leader: {s.volumeChamp.name.replace(/_/g, ' ')}</span>
                                <span style={{ color: 'var(--primary)', fontWeight: 800 }}>{s.volumeChamp.count} Enrolled</span>
                              </div>
                            )}
                          </div>
                        </>
                      ) : (
                        <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--muted)', fontSize: '0.82rem' }}>
                          No admissions recorded for {s.seasonName} yet.
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              </div>
            );
          })()}

        </div>
      )}

            {/* ══════════════════════════════════════════════════════════════════════════
          PILLAR 9: DATA-DRIVEN 4-TRACK BADGES (WALKIN, ENROLLMENT, REVENUE, DROPOUT)
      ══════════════════════════════════════════════════════════════════════════ */}
      {activePillar === 'badge-analysis' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          
          {/* Header Card & Category Filter Switcher */}
          <div style={{
            background: 'var(--card-bg)', border: '1.5px solid var(--border)', borderRadius: '20px',
            padding: '22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.4rem' }}>🎖️</span>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: 'var(--text)' }}>
                  Performance Badge System &amp; Hall of Fame
                </h3>
              </div>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: 'var(--muted)', fontWeight: 600 }}>
                4 Distinct Performance Tracks: Walk-in Handling, Enrollment Volume, Sales Revenue, and Student Retention.
              </p>
            </div>

            {/* 4-Category Filter Switcher */}
            <div style={{ display: 'inline-flex', background: 'var(--surface-alt)', padding: '4px', borderRadius: '12px', border: '1px solid var(--border)', flexWrap: 'wrap', gap: '4px' }}>
              {[
                { id: 'all', label: '🌟 All Tracks' },
                { id: 'walkin', label: '🚶 Walk-in Badges' },
                { id: 'enrollment', label: '🎓 Enrollment Badges' },
                { id: 'revenue', label: '💰 Revenue Badges' },
                { id: 'dropout', label: '🛡️ Retention & Dropout Badges' },
              ].map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedBadgeCategory(cat.id as any)}
                  style={{
                    padding: '6px 14px', borderRadius: '9px', fontSize: '0.78rem', fontWeight: 800, border: 'none',
                    background: selectedBadgeCategory === cat.id ? 'var(--primary)' : 'transparent',
                    color: selectedBadgeCategory === cat.id ? '#fff' : 'var(--text)', cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* 4 Separate Category Renderers */}
          {(() => {
            // Aggregate all counselors with walk-in and enrollment data
            const cMap = new Map<string, { name: string; count: number; sales: number; avgTicket: number; walkins: number; walkinConversions: number; dropouts: number }>();
            
            // From Converted Leads
            filteredLeads.forEach(l => {
              const coun = cleanStr(l.counselorName || l.metadata?.['Counsellor']);
              if (coun && coun !== 'Unassigned') {
                const cur = cMap.get(coun) || { name: coun, count: 0, sales: 0, avgTicket: 0, walkins: 0, walkinConversions: 0, dropouts: 0 };
                cur.count += 1;
                cur.sales += (l.feePaid || 0);
                const isDropout = (l.status || '').toLowerCase().includes('drop') || (l.status || '').toLowerCase().includes('cancel') || (l.status || '').toLowerCase().includes('refund');
                if (isDropout) cur.dropouts += 1;
                cMap.set(coun, cur);
              }
            });

            // From Live Walk-in Students
            students.forEach(s => {
              const coun = cleanStr(counselors.find(c => c.id === s.sessions?.[0]?.counselorId)?.name);
              if (coun && coun !== 'Unassigned') {
                const cur = cMap.get(coun) || { name: coun, count: 0, sales: 0, avgTicket: 0, walkins: 0, walkinConversions: 0, dropouts: 0 };
                cur.walkins += 1;
                if (s.status === 'Completed' || s.status === 'Enrolled') cur.walkinConversions += 1;
                cMap.set(coun, cur);
              }
            });

            const allCouns = Array.from(cMap.values()).map(c => ({
              ...c,
              avgTicket: c.count > 0 ? Math.round(c.sales / c.count) : 0,
              badges: getCounsellorBadges(c)
            }));

            const allBadgeDefinitions: {
              id: string;
              category: 'walkin' | 'enrollment' | 'revenue' | 'dropout';
              categoryLabel: string;
              name: string;
              desc: string;
              color: string;
              qualifiers: typeof allCouns;
            }[] = [
              // ── 1. WALKIN BADGES ──
              {
                id: 'walkin-grandmaster',
                category: 'walkin',
                categoryLabel: '🚶 Walk-in Track',
                name: '🚶 100+ Walkin Grandmaster',
                desc: 'Handled ≥100 physical walk-in candidates in person',
                color: '#059669',
                qualifiers: allCouns.filter(c => c.walkins >= 100)
              },
              {
                id: 'walkin-specialist',
                category: 'walkin',
                categoryLabel: '🚶 Walk-in Track',
                name: '⚡ 50+ Walkin Specialist',
                desc: 'Handled ≥50 physical walk-in candidates in person',
                color: '#0d9488',
                qualifiers: allCouns.filter(c => c.walkins >= 50 && c.walkins < 100)
              },
              {
                id: 'walkin-handler',
                category: 'walkin',
                categoryLabel: '🚶 Walk-in Track',
                name: '🎯 20+ Walkin Handler',
                desc: 'Handled ≥20 physical walk-in candidates in person',
                color: '#0891b2',
                qualifiers: allCouns.filter(c => c.walkins >= 20 && c.walkins < 50)
              },
              {
                id: 'intake-sentinel',
                category: 'walkin',
                categoryLabel: '🚶 Walk-in Track',
                name: '🛡️ High Walk-in Converter (60%+)',
                desc: 'Converted ≥60% of handled walk-ins into enrolled students',
                color: '#16a34a',
                qualifiers: allCouns.filter(c => c.walkins >= 10 && (c.walkinConversions / c.walkins) >= 0.6)
              },

              // ── 2. ENROLLMENT BADGES ──
              {
                id: 'master-enroller',
                category: 'enrollment',
                categoryLabel: '🎓 Enrollment Track',
                name: '🏛️ 500+ Master Enroller',
                desc: 'Total enrolled students volume ≥ 500',
                color: '#8b5cf6',
                qualifiers: allCouns.filter(c => c.count >= 500)
              },
              {
                id: 'century-enroller',
                category: 'enrollment',
                categoryLabel: '🎓 Enrollment Track',
                name: '💯 Century Enroller (100+)',
                desc: 'Total enrolled students volume ≥ 100',
                color: '#10b981',
                qualifiers: allCouns.filter(c => c.count >= 100 && c.count < 500)
              },
              {
                id: 'half-century',
                category: 'enrollment',
                categoryLabel: '🎓 Enrollment Track',
                name: '🎖️ Pacesetter (50+)',
                desc: 'Total enrolled students volume ≥ 50',
                color: '#3b82f6',
                qualifiers: allCouns.filter(c => c.count >= 50 && c.count < 100)
              },
              {
                id: 'quarter-century',
                category: 'enrollment',
                categoryLabel: '🎓 Enrollment Track',
                name: '🎯 Achiever (25+)',
                desc: 'Total enrolled students volume ≥ 25',
                color: '#0284c7',
                qualifiers: allCouns.filter(c => c.count >= 25 && c.count < 50)
              },

              // ── 3. REVENUE BADGES ──
              {
                id: 'crown-closer',
                category: 'revenue',
                categoryLabel: '💰 Revenue Track',
                name: '👑 ₹3Cr+ Crown Legend',
                desc: 'Total collected sales revenue ≥ ₹3.00 Crore',
                color: '#f59e0b',
                qualifiers: allCouns.filter(c => c.sales >= 30000000)
              },
              {
                id: 'diamond-closer',
                category: 'revenue',
                categoryLabel: '💰 Revenue Track',
                name: '💎 ₹1Cr+ Diamond Closer',
                desc: 'Total collected sales revenue ≥ ₹1.00 Crore',
                color: '#06b6d4',
                qualifiers: allCouns.filter(c => c.sales >= 10000000 && c.sales < 30000000)
              },
              {
                id: 'gold-closer',
                category: 'revenue',
                categoryLabel: '💰 Revenue Track',
                name: '🥇 ₹50L+ Gold Closer',
                desc: 'Total collected sales revenue ≥ ₹50.00 Lakhs',
                color: '#eab308',
                qualifiers: allCouns.filter(c => c.sales >= 5000000 && c.sales < 10000000)
              },
              {
                id: 'silver-closer',
                category: 'revenue',
                categoryLabel: '💰 Revenue Track',
                name: '🥈 ₹25L+ Silver Closer',
                desc: 'Total collected sales revenue ≥ ₹25.00 Lakhs',
                color: '#94a3b8',
                qualifiers: allCouns.filter(c => c.sales >= 2500000 && c.sales < 5000000)
              },
              {
                id: 'high-ticket',
                category: 'revenue',
                categoryLabel: '💰 Revenue Track',
                name: '🚀 High-Ticket Pro (>₹35k Avg)',
                desc: 'Maintained avg ticket size > ₹35,000 with ≥10 enrollments',
                color: '#ec4899',
                qualifiers: allCouns.filter(c => c.avgTicket >= 35000 && c.count >= 10)
              },

              // ── 4. RETENTION & DROPOUT BADGES ──
              {
                id: 'zero-dropout',
                category: 'dropout',
                categoryLabel: '🛡️ Retention Track',
                name: '🛡️ Low-Dropout Sentinel (<5%)',
                desc: 'Maintained <5% dropout rate across all admissions',
                color: '#10b981',
                qualifiers: allCouns.filter(c => c.count >= 20 && (c.dropouts / (c.count + c.dropouts)) <= 0.05)
              },
              {
                id: 'dropout-alert',
                category: 'dropout',
                categoryLabel: '⚠️ Dropout Alert',
                name: '⚠️ High Dropout Watch (>30%)',
                desc: 'Over 30% dropout rate — flagged for retention mentoring',
                color: '#ef4444',
                qualifiers: allCouns.filter(c => c.count >= 20 && (c.dropouts / (c.count + c.dropouts)) >= 0.3)
              }
            ];

            const filteredBadges = selectedBadgeCategory === 'all'
              ? allBadgeDefinitions
              : allBadgeDefinitions.filter(b => b.category === selectedBadgeCategory);

            return (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '18px' }}>
                {filteredBadges.map(b => (
                  <div
                    key={b.id}
                    className="dash-table-card"
                    style={{ border: '1.5px solid var(--border)', borderRadius: '18px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
                  >
                    {/* Badge Card Header */}
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', background: 'var(--surface-alt)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', background: 'var(--surface)', padding: '1px 6px', borderRadius: '4px' }}>
                            {b.categoryLabel}
                          </span>
                        </div>
                        <h4 style={{ margin: '4px 0 0 0', fontSize: '0.96rem', fontWeight: 900, color: b.color }}>
                          {b.name}
                        </h4>
                        <span style={{ fontSize: '0.74rem', color: 'var(--muted)', fontWeight: 600 }}>
                          {b.desc}
                        </span>
                      </div>
                      <span style={{
                        padding: '4px 10px', borderRadius: '8px', fontSize: '0.76rem', fontWeight: 900,
                        background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)'
                      }}>
                        {b.qualifiers.length} Awarded
                      </span>
                    </div>

                    {/* Qualifiers Roster */}
                    <div style={{ padding: '14px 20px', flex: 1, maxHeight: '280px', overflowY: 'auto' }}>
                      {b.qualifiers.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {b.qualifiers.map((q, idx) => (
                            <div
                              key={q.name}
                              onClick={() => openDrilldown(`Counsellor: ${q.name.replace(/_/g, ' ')} (${q.count} Students)`, filteredLeads.filter(l => cleanStr(l.counselorName || l.metadata?.['Counsellor']).toLowerCase() === q.name.toLowerCase()))}
                              style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '8px 12px', background: 'var(--surface)', borderRadius: '10px',
                                border: '1px solid var(--border)', cursor: 'pointer', transition: 'all 0.12s ease'
                              }}
                              onMouseEnter={e => (e.currentTarget.style.borderColor = b.color)}
                              onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--muted)' }}>#{idx + 1}</span>
                                <strong style={{ fontSize: '0.84rem', color: 'var(--text)' }}>{q.name.replace(/_/g, ' ')}</strong>
                              </div>
                              <div style={{ textAlign: 'right' }}>
                                <span style={{ fontSize: '0.84rem', fontWeight: 900, color: '#10b981', display: 'block' }}>
                                  {formatCompactCurrency(q.sales)}
                                </span>
                                <span style={{ fontSize: '0.7rem', color: 'var(--muted)', fontWeight: 600 }}>
                                  {q.count} Enrolled • {q.walkins} Walk-ins
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--muted)', fontSize: '0.8rem' }}>
                          No counsellors currently meet this criteria.
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}

        </div>
      )}

      {/* ── DRILL-DOWN RECORD MODAL ── */}
      {drilldownTitle && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 12000, padding: '20px'
        }}>
          <div style={{
            background: 'var(--card-bg, #111827)', border: '1.5px solid var(--border)',
            borderRadius: '22px', width: '100%', maxWidth: '980px', maxHeight: '85vh',
            display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 70px rgba(0,0,0,0.6)'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '18px 24px', borderBottom: '1px solid var(--border)', background: 'var(--surface-alt)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: 'var(--text)' }}>
                  {drilldownTitle}
                </h3>
                <span style={{ fontSize: '0.78rem', color: 'var(--muted)', fontWeight: 600 }}>
                  Showing {drilldownRecords.length.toLocaleString()} matching records from PostgreSQL
                </span>
              </div>
              <button
                type="button"
                onClick={() => setDrilldownTitle(null)}
                style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', fontSize: '1.1rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {/* Modal Records Table */}
            <div style={{ overflowY: 'auto', flex: 1, padding: '16px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                <thead>
                  <tr style={{ background: 'var(--surface-alt)', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ textAlign: 'left', padding: '10px 14px' }}>Student</th>
                    <th style={{ textAlign: 'left', padding: '10px 14px' }}>Student ID</th>
                    <th style={{ textAlign: 'left', padding: '10px 14px' }}>Course</th>
                    <th style={{ textAlign: 'left', padding: '10px 14px' }}>Counsellor</th>
                    <th style={{ textAlign: 'left', padding: '10px 14px' }}>Amount Paid</th>
                    <th style={{ textAlign: 'right', padding: '10px 14px' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {drilldownRecords.slice(0, 100).map((r, idx) => (
                    <tr key={r.id || idx} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '10px 14px', fontWeight: 700 }}>{r.studentName}</td>
                      <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)' }}>{r.studentId || '—'}</td>
                      <td style={{ padding: '10px 14px' }}>{r.course}</td>
                      <td style={{ padding: '10px 14px', color: 'var(--primary)', fontWeight: 600 }}>{r.counselorName || r.metadata?.['Counsellor'] || '—'}</td>
                      <td style={{ padding: '10px 14px', color: '#10b981', fontWeight: 800 }}>₹{(r.feePaid || 0).toLocaleString()}</td>
                      <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                        <Link
                          href={`/converted-leads/${r.id}`}
                          className="table-btn-soft"
                          style={{ textDecoration: 'none', display: 'inline-flex', padding: '5px 12px', fontSize: '0.76rem' }}
                        >
                          Full Record →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {drilldownRecords.length > 100 && (
                <div style={{ textAlign: 'center', padding: '14px', color: 'var(--muted)', fontSize: '0.82rem', fontWeight: 600 }}>
                  Showing first 100 records of {drilldownRecords.length.toLocaleString()}.
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border)', background: 'var(--surface-alt)', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setDrilldownTitle(null)}
                style={{ padding: '8px 20px', borderRadius: '10px', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </section>
  );
}
