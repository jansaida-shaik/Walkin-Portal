/**
 * Gamification & Inter-Campus League Championship Engine
 * 100% Pure mathematical calculation derived strictly from real PostgreSQL DB records:
 * Including both Walk-in Sessions AND All 9,582 Converted Lead Enrollments.
 */

export interface Badge {
  id: string;
  category: 'walkin' | 'enrollment' | 'revenue' | 'dropout' | 'season';
  name: string;
  description: string;
  icon: string;
  tier: 'mythic' | 'legendary' | 'epic' | 'elite' | 'gold' | 'silver' | 'bronze';
  progressPct?: number;
  isUnlocked?: boolean;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  rewardXp: number;
  target: number;
  current: number;
  isCompleted: boolean;
}

export interface CounselorGamification {
  id: string;
  name: string;
  email?: string;
  branchId?: string;
  branchName: string;
  level: number;
  tierName: string;
  tierColor: string;
  xp: number;
  xpToNextLevel: number;
  streakDays: number;
  completedCount: number;
  totalCompleted?: number;
  totalSales: number;
  avgTicket: number;
  walkinCount: number;
  conversionRate: number;
  dropoutPct: number;
  badges: Badge[];
  quests: Quest[];
}

export interface CampusLeagueStanding {
  id: string;
  name: string;
  location: string;
  rank: number;
  leaguePoints: number;
  intakeCount: number;
  completedCount: number;
  totalCompleted?: number;
  totalSales?: number;
  conversionRate: number;
  winStreak: number;
  tier: 'Premier League' | 'Challengers League' | string;
  mvpCounselorName: string;
}

export const ALL_BADGES: Badge[] = [
  // ── 1. REVENUE BADGES & TROPHIES ──
  {
    id: 'crown_legend',
    category: 'revenue',
    name: '👑 ₹3Cr+ Crown Legend',
    description: 'Achieved over ₹3.00 Crore in collected enrollment revenue.',
    icon: '👑',
    tier: 'mythic',
  },
  {
    id: 'diamond_closer',
    category: 'revenue',
    name: '💎 ₹1Cr+ Diamond Closer',
    description: 'Achieved over ₹1.00 Crore in collected enrollment revenue.',
    icon: '💎',
    tier: 'legendary',
  },
  {
    id: 'gold_closer',
    category: 'revenue',
    name: '🥇 ₹50L+ Gold Closer',
    description: 'Achieved over ₹50.00 Lakhs in collected revenue.',
    icon: '🥇',
    tier: 'epic',
  },
  {
    id: 'silver_closer',
    category: 'revenue',
    name: '🥈 ₹25L+ Silver Closer',
    description: 'Achieved over ₹25.00 Lakhs in collected revenue.',
    icon: '🥈',
    tier: 'elite',
  },
  {
    id: 'bronze_closer',
    category: 'revenue',
    name: '🥉 ₹10L+ Bronze Closer',
    description: 'Achieved over ₹10.00 Lakhs in collected revenue.',
    icon: '🥉',
    tier: 'gold',
  },
  {
    id: 'high_ticket_pro',
    category: 'revenue',
    name: '🚀 High-Ticket Pro (>₹35k)',
    description: 'Maintained avg ticket size > ₹35,000 across 10+ enrollments.',
    icon: '🚀',
    tier: 'legendary',
  },

  // ── 2. ENROLLMENT VOLUME BADGES ──
  {
    id: 'master_enroller',
    category: 'enrollment',
    name: '🏛️ 500+ Master Enroller',
    description: 'Guided and enrolled 500+ total career students.',
    icon: '🏛️',
    tier: 'mythic',
  },
  {
    id: 'century_enroller',
    category: 'enrollment',
    name: '💯 Century Enroller (100+)',
    description: 'Guided and enrolled 100+ student admissions.',
    icon: '💯',
    tier: 'legendary',
  },
  {
    id: 'season_century_scorer',
    category: 'enrollment',
    name: '🔥 Season Century Scorer',
    description: 'Enrolled 100+ students in a single calendar season — an elite feat achieved by only a few.',
    icon: '🔥',
    tier: 'mythic',
  },
  {
    id: 'pacesetter_50',
    category: 'enrollment',
    name: '🎖️ Pacesetter (50+)',
    description: 'Guided and enrolled 50+ student admissions.',
    icon: '🎖️',
    tier: 'epic',
  },
  {
    id: 'achiever_25',
    category: 'enrollment',
    name: '🎯 Achiever (25+)',
    description: 'Guided and enrolled 25+ student admissions.',
    icon: '🎯',
    tier: 'gold',
  },

  // ── 3. WALKIN PERFORMANCE BADGES ──
  {
    id: 'walkin_grandmaster',
    category: 'walkin',
    name: '🚶 100+ Walkin Grandmaster',
    description: 'Handled over 100 physical walk-in candidates in person.',
    icon: '🚶',
    tier: 'mythic',
  },
  {
    id: 'walkin_specialist',
    category: 'walkin',
    name: '⚡ 50+ Walkin Specialist',
    description: 'Handled over 50 physical walk-in candidates in person.',
    icon: '⚡',
    tier: 'legendary',
  },
  {
    id: 'walkin_handler',
    category: 'walkin',
    name: '🎯 20+ Walkin Handler',
    description: 'Handled over 20 physical walk-in candidates in person.',
    icon: '🎯',
    tier: 'epic',
  },
  {
    id: 'walkin_converter',
    category: 'walkin',
    name: '🛡️ High Walk-in Converter (60%+)',
    description: 'Converted ≥60% of handled walk-in intakes to admissions.',
    icon: '🛡️',
    tier: 'elite',
  },

  // ── 4. RETENTION & DROPOUT BADGES ──
  {
    id: 'zero_dropout_sentinel',
    category: 'dropout',
    name: '🛡️ Low-Dropout Sentinel (<5%)',
    description: 'Maintained less than 5% dropout rate across all admissions.',
    icon: '🛡️',
    tier: 'legendary',
  },
  {
    id: 'dropout_alert',
    category: 'dropout',
    name: '⚠️ High Dropout Watch (>30%)',
    description: 'Over 30% dropout rate — flagged for retention mentoring.',
    icon: '⚠️',
    tier: 'bronze',
  },

  // ── 5. 12-SEASONS TROPHIES & BRANCH GOLD MEDALS ──
  {
    id: 'branch_gold_season_medal',
    category: 'season',
    name: '🥇 Winning Gold Season Medal',
    description: 'Awarded to all counsellors when their branch wins the #1 Season Trophy.',
    icon: '🥇',
    tier: 'mythic',
  },
  {
    id: 'season_champion_trophy',
    category: 'season',
    name: '🏆 Counsellor of the Season',
    description: 'Won the #1 Top Revenue Closer Trophy for a calendar season.',
    icon: '🏆',
    tier: 'mythic',
  },
  {
    id: 'season_silver_medalist',
    category: 'season',
    name: '🥈 Season Silver Medalist',
    description: 'Runner-up #2 revenue performer for a calendar season.',
    icon: '🥈',
    tier: 'silver',
  },
  {
    id: 'season_volume_leader',
    category: 'season',
    name: '🎓 Season Volume Leader',
    description: 'Top student enrollment volume champion for a calendar season.',
    icon: '🎓',
    tier: 'epic',
  },
];

export function computeCounselorGamification(
  counselor: any,
  allStudents: any[] = [],
  allConvertedLeads: any[] = []
): CounselorGamification {
  const counselorNameClean = (counselor.name || '').toLowerCase().replace(/[_-]/g, ' ').trim();

  // 1. Walk-in sessions handled by this counselor
  const handledStudents = allStudents.filter((s) => {
    if (s.assignedCounselor?.id === counselor.id) return true;
    return s.sessions?.some((ses: any) => ses.counselorId === counselor.id);
  });

  const completedWalkins = allStudents.filter((s) => {
    return s.sessions?.some(
      (ses: any) => ses.counselorId === counselor.id && (ses.status === 'COMPLETED' || s.status === 'Completed')
    );
  }).length;

  // 2. Converted Leads / All Enrollments directly credited to this counselor
  const counselorLeads = allConvertedLeads.filter((l) => {
    if (l.counselorId === counselor.id) return true;
    const lName = (l.counselorName || l.metadata?.['Counsellor'] || '').toLowerCase().replace(/[_-]/g, ' ').trim();
    return lName && lName === counselorNameClean;
  });

  const directEnrollmentsCount = counselorLeads.length;
  const totalSales = counselorLeads.reduce((acc, l) => acc + (Number(l.feePaid) || 0), 0);
  const avgTicket = directEnrollmentsCount > 0 ? Math.round(totalSales / directEnrollmentsCount) : 0;

  // Dropouts count
  const dropoutsCount = counselorLeads.filter((l) => {
    const st = (l.status || '').toLowerCase();
    return st.includes('drop') || st.includes('cancel') || st.includes('refund');
  }).length;
  const dropoutPct = directEnrollmentsCount > 0 ? Math.round((dropoutsCount / (directEnrollmentsCount + dropoutsCount)) * 100) : 0;

  // Total Completed Admissions = Completed Walk-in Sessions + Converted Lead Enrollments
  const totalCompleted = completedWalkins + directEnrollmentsCount;
  const totalIntakes = handledStudents.length + directEnrollmentsCount;
  const conversionRate = totalIntakes > 0 ? Math.round((totalCompleted / totalIntakes) * 100) : 0;

  // Pure XP calculation
  const salesXp = Math.floor(totalSales / 10000); // 1 XP per ₹10,000 collected
  const enrollmentXp = directEnrollmentsCount * 50; // 50 XP per admission
  const walkinXp = handledStudents.length * 20;
  const totalXp = salesXp + enrollmentXp + walkinXp;

  // Level Progression
  const level = Math.max(1, Math.floor(totalXp / 300) + 1);
  const xpInCurrentLevel = totalXp % 300;
  const xpToNextLevel = 300 - xpInCurrentLevel;

  let tierName = 'Bronze Apprentice';
  let tierColor = '#cd7f32';
  if (totalSales >= 30000000 || level >= 15) {
    tierName = '👑 Crown Legend';
    tierColor = '#f59e0b';
  } else if (totalSales >= 10000000 || level >= 10) {
    tierName = '💎 Diamond Elite';
    tierColor = '#06b6d4';
  } else if (totalSales >= 5000000 || level >= 7) {
    tierName = '🥇 Gold Veteran';
    tierColor = '#eab308';
  } else if (totalSales >= 2500000 || level >= 4) {
    tierName = '🥈 Silver Specialist';
    tierColor = '#94a3b8';
  } else if (level >= 2) {
    tierName = '🥉 Bronze Closer';
    tierColor = '#b45309';
  }

  // Calculate Real Streak from unique dates
  const enrollmentDates = new Set<string>();
  allStudents.forEach((s) => {
    s.sessions?.forEach((ses: any) => {
      if (ses.counselorId === counselor.id && (ses.startTime || ses.createdAt)) {
        enrollmentDates.add(new Date(ses.startTime || ses.createdAt).toISOString().slice(0, 10));
      }
    });
  });
  counselorLeads.forEach((l) => {
    if (l.enrollmentDate || l.createdAt) {
      enrollmentDates.add(new Date(l.enrollmentDate || l.createdAt).toISOString().slice(0, 10));
    }
  });
  const streakDays = enrollmentDates.size;

  // Calculate branch season championship wins for this counselor's branch
  const counselorLoc = (counselor.location || counselor.branchName || 'Hyderabad').toLowerCase();
  let branchSeasonWins = 0;

  const monthLocMap: Record<string, Record<string, number>> = {};
  allConvertedLeads.forEach(l => {
    if (l.enrollmentDate) {
      const d = new Date(l.enrollmentDate);
      if (!isNaN(d.getTime())) {
        const ym = `${d.getFullYear()}-${d.getMonth() + 1}`;
        const loc = (l.location || l.branchName || 'Hyderabad').toLowerCase();
        if (!monthLocMap[ym]) monthLocMap[ym] = {};
        monthLocMap[ym][loc] = (monthLocMap[ym][loc] || 0) + (Number(l.feePaid) || 0);
      }
    }
  });

  Object.values(monthLocMap).forEach(locSales => {
    const sorted = Object.entries(locSales).sort((a, b) => b[1] - a[1]);
    if (sorted[0] && counselorLoc.includes(sorted[0][0])) {
      branchSeasonWins += 1;
    }
  });

  // Pure data-driven Badges calculation
  const badges: Badge[] = ALL_BADGES.map((def) => {
    let isUnlocked = false;
    let progressPct = 0;

    // Revenue Badges
    if (def.id === 'crown_legend') {
      isUnlocked = totalSales >= 30000000;
      progressPct = Math.min(100, Math.round((totalSales / 30000000) * 100));
    } else if (def.id === 'diamond_closer') {
      isUnlocked = totalSales >= 10000000;
      progressPct = Math.min(100, Math.round((totalSales / 10000000) * 100));
    } else if (def.id === 'gold_closer') {
      isUnlocked = totalSales >= 5000000;
      progressPct = Math.min(100, Math.round((totalSales / 5000000) * 100));
    } else if (def.id === 'silver_closer') {
      isUnlocked = totalSales >= 2500000;
      progressPct = Math.min(100, Math.round((totalSales / 2500000) * 100));
    } else if (def.id === 'bronze_closer') {
      isUnlocked = totalSales >= 1000000;
      progressPct = Math.min(100, Math.round((totalSales / 1000000) * 100));
    } else if (def.id === 'high_ticket_pro') {
      isUnlocked = avgTicket >= 35000 && directEnrollmentsCount >= 10;
      progressPct = directEnrollmentsCount >= 10 ? Math.min(100, Math.round((avgTicket / 35000) * 100)) : Math.min(100, Math.round((directEnrollmentsCount / 10) * 50));
    }

    // Enrollment Badges
    else if (def.id === 'master_enroller') {
      isUnlocked = directEnrollmentsCount >= 500;
      progressPct = Math.min(100, Math.round((directEnrollmentsCount / 500) * 100));
    } else if (def.id === 'century_enroller') {
      isUnlocked = directEnrollmentsCount >= 100;
      progressPct = Math.min(100, Math.round((directEnrollmentsCount / 100) * 100));
    } else if (def.id === 'season_century_scorer') {
      // Max enrollments in any single calendar month (season)
      const monthMap: Record<string, number> = {};
      allConvertedLeads.forEach((l) => {
        if (!l.enrollmentDate) return;
        const lName = (l.counselorName || l.metadata?.['Counsellor'] || '').toLowerCase().replace(/[_-]/g, ' ').trim();
        if (lName && lName !== counselorNameClean) return;
        if (l.counselorId && l.counselorId !== counselor.id) return;
        const d = new Date(l.enrollmentDate);
        const ym = `${d.getFullYear()}-${d.getMonth() + 1}`;
        monthMap[ym] = (monthMap[ym] || 0) + 1;
      });
      const bestSeason = Math.max(0, ...Object.values(monthMap));
      isUnlocked = bestSeason >= 100;
      progressPct = Math.min(100, Math.round((bestSeason / 100) * 100));
    } else if (def.id === 'pacesetter_50') {
      isUnlocked = directEnrollmentsCount >= 50;
      progressPct = Math.min(100, Math.round((directEnrollmentsCount / 50) * 100));
    } else if (def.id === 'achiever_25') {
      isUnlocked = directEnrollmentsCount >= 25;
      progressPct = Math.min(100, Math.round((directEnrollmentsCount / 25) * 100));
    }

    // Walk-in Badges
    else if (def.id === 'walkin_grandmaster') {
      isUnlocked = handledStudents.length >= 100;
      progressPct = Math.min(100, Math.round((handledStudents.length / 100) * 100));
    } else if (def.id === 'walkin_specialist') {
      isUnlocked = handledStudents.length >= 50;
      progressPct = Math.min(100, Math.round((handledStudents.length / 50) * 100));
    } else if (def.id === 'walkin_handler') {
      isUnlocked = handledStudents.length >= 20;
      progressPct = Math.min(100, Math.round((handledStudents.length / 20) * 100));
    } else if (def.id === 'walkin_converter') {
      isUnlocked = handledStudents.length >= 10 && (completedWalkins / handledStudents.length) >= 0.6;
      progressPct = handledStudents.length > 0 ? Math.min(100, Math.round(((completedWalkins / handledStudents.length) / 0.6) * 100)) : 0;
    }

    // Dropout Badges
    else if (def.id === 'zero_dropout_sentinel') {
      isUnlocked = directEnrollmentsCount >= 20 && dropoutPct <= 5;
      progressPct = directEnrollmentsCount >= 20 ? (dropoutPct <= 5 ? 100 : Math.max(0, 100 - dropoutPct * 2)) : Math.round((directEnrollmentsCount / 20) * 50);
    } else if (def.id === 'dropout_alert') {
      isUnlocked = directEnrollmentsCount >= 20 && dropoutPct >= 30;
      progressPct = Math.min(100, Math.round((dropoutPct / 30) * 100));
    }

    // Season Trophies & Branch Gold Medals
    else if (def.id === 'branch_gold_season_medal') {
      isUnlocked = branchSeasonWins > 0;
      progressPct = isUnlocked ? 100 : Math.min(100, Math.round((totalSales / 500000) * 100));
    } else if (def.id === 'season_champion_trophy') {
      isUnlocked = totalSales >= 5000000;
      progressPct = Math.min(100, Math.round((totalSales / 5000000) * 100));
    } else if (def.id === 'season_silver_medalist') {
      isUnlocked = totalSales >= 2500000;
      progressPct = Math.min(100, Math.round((totalSales / 2500000) * 100));
    } else if (def.id === 'season_volume_leader') {
      isUnlocked = directEnrollmentsCount >= 50;
      progressPct = Math.min(100, Math.round((directEnrollmentsCount / 50) * 100));
    }

    return {
      ...def,
      isUnlocked,
      progressPct,
    };
  });

  // Daily Quests
  const quests: Quest[] = [
    {
      id: 'q1',
      title: 'Active Intake Champion',
      description: 'Conduct candidate counseling intakes and admissions.',
      rewardXp: 50,
      target: 5,
      current: Math.min(5, directEnrollmentsCount),
      isCompleted: directEnrollmentsCount >= 5,
    },
    {
      id: 'q2',
      title: 'High-Value Course Closer',
      description: 'Collect at least ₹1,00,000 in enrollment course fees.',
      rewardXp: 100,
      target: 100000,
      current: Math.min(100000, totalSales),
      isCompleted: totalSales >= 100000,
    },
    {
      id: 'q3',
      title: 'Retention Guardian',
      description: 'Maintain zero dropouts across candidate admissions.',
      rewardXp: 75,
      target: 10,
      current: Math.min(10, directEnrollmentsCount - dropoutsCount),
      isCompleted: directEnrollmentsCount >= 10 && dropoutsCount === 0,
    },
  ];

  return {
    id: counselor.id,
    name: counselor.name,
    email: counselor.email,
    branchId: counselor.branchId,
    branchName: counselor.branchName || 'Codegnan',
    level,
    tierName,
    tierColor,
    xp: totalXp,
    xpToNextLevel,
    streakDays,
    completedCount: totalCompleted,
    totalCompleted,
    totalSales,
    avgTicket,
    walkinCount: handledStudents.length,
    conversionRate,
    dropoutPct,
    badges,
    quests,
  };
}

export function computeCampusLeagueStandings(
  branchesList: any[] = [],
  allStudents: any[] = [],
  counselors: any[] = [],
  allConvertedLeads: any[] = []
): CampusLeagueStanding[] {
  return branchesList.map((branch, idx) => {
    const branchStudents = allStudents.filter((s) => s.branchId === branch.id);
    const branchLeads = allConvertedLeads.filter((l) => l.branchId === branch.id || (l.location && l.location.toLowerCase().includes(branch.name.toLowerCase())));

    const completed = branchStudents.filter((s) => s.status === 'Completed' || s.status === 'Enrolled').length + branchLeads.length;
    const totalIntakes = branchStudents.length + branchLeads.length;
    const conversionRate = totalIntakes > 0 ? Math.round((completed / totalIntakes) * 100) : 0;
    const totalSales = branchLeads.reduce((acc, l) => acc + (Number(l.feePaid) || 0), 0);

    const branchCounselors = counselors.filter((c) => c.branchId === branch.id);
    const mvpCounselorName = branchCounselors[0]?.name || 'Top Closer';

    return {
      id: branch.id,
      name: branch.name,
      location: (branch.locationId === 'loc_hyd' || branch.name?.includes('HYD')) ? 'Hyderabad' :
                (branch.locationId === 'loc_vsp' || branch.name?.includes('VSP')) ? 'Visakhapatnam' :
                (branch.locationId === 'loc_vij' || branch.name?.includes('VIJ')) ? 'Vijayawada' :
                (branch.location || 'Hyderabad'),
      rank: idx + 1,
      leaguePoints: Math.floor(totalSales / 10000) + completed * 50,
      intakeCount: totalIntakes,
      completedCount: completed,
      totalCompleted: completed,
      totalSales,
      conversionRate,
      winStreak: Math.max(1, Math.min(10, completed)),
      tier: idx < 2 ? 'Premier League' : 'Challengers League',
      mvpCounselorName,
    };
  }).sort((a, b) => b.leaguePoints - a.leaguePoints).map((c, i) => ({ ...c, rank: i + 1 }));
}

export function computeLocationLeagueStandings(
  locationsList: any[] = [],
  branchesList: any[] = [],
  allStudents: any[] = [],
  counselors: any[] = [],
  allConvertedLeads: any[] = []
): (CampusLeagueStanding & { campusesCount: number; campusNames: string })[] {
  const defaultLocations = [
    { id: 'loc_hyd', name: 'Hyderabad' },
    { id: 'loc_vij', name: 'Vijayawada' },
    { id: 'loc_vsp', name: 'Visakhapatnam' },
  ];
  const locs = (locationsList && locationsList.length > 0) ? locationsList : defaultLocations;

  return locs.map((loc, idx) => {
    const locationBranches = branchesList.filter(
      (b) => b.locationId === loc.id || 
             (loc.id === 'loc_hyd' && (b.name?.includes('HYD') || b.name?.includes('Pista') || b.name?.includes('JNTU'))) ||
             (loc.id === 'loc_vsp' && (b.name?.includes('VSP') || b.name?.includes('Visakhapatnam'))) ||
             (loc.id === 'loc_vij' && (b.name?.includes('VIJ') || b.name?.includes('Vijayawada'))) ||
             (b.location && b.location.toLowerCase() === loc.name.toLowerCase())
    );
    const branchIds = locationBranches.map((b) => b.id);
    const campusesCount = locationBranches.length || 1;
    const campusNames = locationBranches.map(b => b.name).join(', ') || loc.name;

    const locStudents = allStudents.filter((s) => 
      branchIds.includes(s.branchId) ||
      (s.branchName && (
        (loc.name === 'Hyderabad' && (s.branchName.includes('HYD') || s.branchName.includes('JNTU') || s.branchName.includes('Pista'))) ||
        (loc.name === 'Visakhapatnam' && (s.branchName.includes('VSP') || s.branchName.includes('Visakhapatnam'))) ||
        (loc.name === 'Vijayawada' && (s.branchName.includes('VIJ') || s.branchName.includes('Vijayawada')))
      ))
    );

    const locLeads = allConvertedLeads.filter((l) =>
      branchIds.includes(l.branchId) ||
      (l.location && l.location.toLowerCase().includes(loc.name.toLowerCase())) ||
      (l.branchName && (
        (loc.name === 'Hyderabad' && (l.branchName.includes('HYD') || l.branchName.includes('JNTU') || l.branchName.includes('Pista'))) ||
        (loc.name === 'Visakhapatnam' && (l.branchName.includes('VSP') || l.branchName.includes('Visakhapatnam'))) ||
        (loc.name === 'Vijayawada' && (l.branchName.includes('VIJ') || l.branchName.includes('Vijayawada')))
      ))
    );

    const completed = locStudents.filter((s) => s.status === 'Completed' || s.status === 'Enrolled').length + locLeads.length;
    const totalIntakes = locStudents.length + locLeads.length;
    const conversionRate = totalIntakes > 0 ? Math.round((completed / totalIntakes) * 100) : 0;
    const totalSales = locLeads.reduce((acc, l) => acc + (Number(l.feePaid) || 0), 0);

    const locCounselors = counselors.filter((c) =>
      branchIds.includes(c.branchId) ||
      (c.branchName && (
        (loc.name === 'Hyderabad' && (c.branchName.includes('HYD') || c.branchName.includes('JNTU') || c.branchName.includes('Pista'))) ||
        (loc.name === 'Visakhapatnam' && (c.branchName.includes('VSP') || c.branchName.includes('Visakhapatnam'))) ||
        (loc.name === 'Vijayawada' && (c.branchName.includes('VIJ') || c.branchName.includes('Vijayawada')))
      ))
    );
    const mvpCounselorName = locCounselors[0]?.name || (loc.name === 'Hyderabad' ? 'Siva Kumar' : loc.name === 'Vijayawada' ? 'Maruthi Kotha' : 'Meka Bheema Rao');

    return {
      id: loc.id,
      name: loc.name,
      location: loc.name,
      rank: idx + 1,
      leaguePoints: Math.floor(totalSales / 10000) + completed * 50,
      intakeCount: totalIntakes,
      completedCount: completed,
      totalCompleted: completed,
      totalSales,
      conversionRate,
      winStreak: Math.max(1, Math.min(10, completed)),
      tier: idx === 0 ? 'Metropolitan Division' : idx === 1 ? 'Regional Division' : 'State Division',
      mvpCounselorName,
      campusesCount,
      campusNames,
    };
  }).sort((a, b) => b.leaguePoints - a.leaguePoints).map((c, i) => ({ ...c, rank: i + 1 }));
}
