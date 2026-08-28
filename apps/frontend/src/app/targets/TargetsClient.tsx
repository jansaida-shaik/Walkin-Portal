'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Student } from '../../types';
import { Counselor } from '../../actions/counselorActions';
import { Branch } from '../../lib/constants';
import { computeCounselorGamification, computeCampusStandings } from '../../lib/gamification';

interface TargetsClientProps {
  students: Student[];
  counselors: Counselor[];
  convertedLeads: any[];
  branches: Branch[];
  user: any;
}

export interface TargetPlan {
  id: string;
  entityId: string;
  entityName: string;
  type: 'counselor' | 'campus';
  location: string;
  periodType: 'monthly' | 'weekly' | 'daily';
  periodLabel: string;
  targets: {
    revenue: number;
    admissions: number;
    walkins: number;
  };
  incentives: {
    baseBonus: number;
    stretchBonus: number;
    perSaleBonus: number;
  };
  createdAt: string;
}

export default function TargetsClient({ students, counselors, convertedLeads = [], branches, user }: TargetsClientProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'allocate' | 'leaderboard' | 'payouts'>('overview');
  const [selectedHorizon, setSelectedHorizon] = useState<'monthly' | 'weekly' | 'daily'>('monthly');
  const [selectedScope, setSelectedScope] = useState<'counselor' | 'campus'>('counselor');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('August 2026');
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Target Plans Store (Initialized with standard benchmarks)
  const [targetPlans, setTargetPlans] = useState<TargetPlan[]>([
    // Campus Targets
    {
      id: 'tgt-hyd-aug',
      entityId: 'branch_jntu1',
      entityName: 'Hyderabad Campus',
      type: 'campus',
      location: 'Hyderabad',
      periodType: 'monthly',
      periodLabel: 'August 2026',
      targets: { revenue: 3500000, admissions: 120, walkins: 280 },
      incentives: { baseBonus: 35000, stretchBonus: 20000, perSaleBonus: 500 },
      createdAt: '2026-08-01',
    },
    {
      id: 'tgt-vij-aug',
      entityId: 'branch_main_vij',
      entityName: 'Vijayawada Campus',
      type: 'campus',
      location: 'Vijayawada',
      periodType: 'monthly',
      periodLabel: 'August 2026',
      targets: { revenue: 2500000, admissions: 80, walkins: 200 },
      incentives: { baseBonus: 25000, stretchBonus: 15000, perSaleBonus: 500 },
      createdAt: '2026-08-01',
    },
    {
      id: 'tgt-vsp-aug',
      entityId: 'branch_main_vsp',
      entityName: 'Visakhapatnam Campus',
      type: 'campus',
      location: 'Visakhapatnam',
      periodType: 'monthly',
      periodLabel: 'August 2026',
      targets: { revenue: 1800000, admissions: 60, walkins: 150 },
      incentives: { baseBonus: 18000, stretchBonus: 10000, perSaleBonus: 500 },
      createdAt: '2026-08-01',
    },
  ]);

  // Form State for "Give / Assign New Target"
  const [newTargetType, setNewTargetType] = useState<'counselor' | 'campus'>('counselor');
  const [newTargetEntity, setNewTargetEntity] = useState<string>('');
  const [newTargetPeriodType, setNewTargetPeriodType] = useState<'monthly' | 'weekly' | 'daily'>('monthly');
  const [newTargetPeriodLabel, setNewTargetPeriodLabel] = useState<string>('August 2026');
  const [newTargetRevenue, setNewTargetRevenue] = useState<number>(500000);
  const [newTargetAdmissions, setNewTargetAdmissions] = useState<number>(20);
  const [newTargetWalkins, setNewTargetWalkins] = useState<number>(50);
  const [newTargetBaseBonus, setNewTargetBaseBonus] = useState<number>(5000);
  const [newTargetStretchBonus, setNewTargetStretchBonus] = useState<number>(3000);
  const [newTargetPerSaleBonus, setNewTargetPerSaleBonus] = useState<number>(300);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  // Gamification & Real-time actuals
  const counselorGamifications = useMemo(() => {
    return computeCounselorGamification(students);
  }, [students]);

  const campusStandings = useMemo(() => {
    return computeCampusStandings(branches, students);
  }, [branches, students]);

  // Handle Target Creation
  const handleCreateTarget = (e: React.FormEvent) => {
    e.preventDefault();
    const entityName = newTargetEntity || (newTargetType === 'counselor' ? (counselorGamifications[0]?.name || 'Counselor') : 'Hyderabad Campus');
    const location = newTargetType === 'counselor' 
      ? (counselorGamifications.find(c => c.name === entityName)?.branchName || 'Hyderabad')
      : (entityName.split(' ')[0] || 'Hyderabad');

    const newPlan: TargetPlan = {
      id: `tgt-${Date.now()}`,
      entityId: entityName,
      entityName,
      type: newTargetType,
      location,
      periodType: newTargetPeriodType,
      periodLabel: newTargetPeriodLabel,
      targets: {
        revenue: Number(newTargetRevenue) || 500000,
        admissions: Number(newTargetAdmissions) || 20,
        walkins: Number(newTargetWalkins) || 50,
      },
      incentives: {
        baseBonus: Number(newTargetBaseBonus) || 5000,
        stretchBonus: Number(newTargetStretchBonus) || 3000,
        perSaleBonus: Number(newTargetPerSaleBonus) || 300,
      },
      createdAt: new Date().toISOString().split('T')[0],
    };

    setTargetPlans(prev => [newPlan, ...prev.filter(p => !(p.entityName === entityName && p.periodType === newTargetPeriodType && p.periodLabel === newTargetPeriodLabel))]);
    setIsSuccessModalOpen(true);
  };

  // Compute Achievements Matrix
  const targetAchievements = useMemo(() => {
    if (selectedScope === 'counselor') {
      return counselorGamifications.map((cg) => {
        const assignedPlan = targetPlans.find(
          p => p.type === 'counselor' && p.entityName.toLowerCase() === cg.name.toLowerCase()
        );

        const revTarget = assignedPlan?.targets.revenue || 500000;
        const admTarget = assignedPlan?.targets.admissions || 20;
        const walkinTarget = assignedPlan?.targets.walkins || 50;
        const baseBonus = assignedPlan?.incentives.baseBonus || 5000;
        const stretchBonus = assignedPlan?.incentives.stretchBonus || 3000;
        const perSaleBonus = assignedPlan?.incentives.perSaleBonus || 300;

        const actRev = cg.totalSales || 0;
        const actAdm = cg.completedCount || 0;
        const actWalkin = cg.walkinCount || 0;

        const revPct = revTarget > 0 ? Math.min(200, Math.round((actRev / revTarget) * 100)) : 0;
        const admPct = admTarget > 0 ? Math.min(200, Math.round((actAdm / admTarget) * 100)) : 0;
        const walkinPct = walkinTarget > 0 ? Math.min(200, Math.round((actWalkin / walkinTarget) * 100)) : 0;
        const compositePct = Math.round((revPct * 0.4) + (admPct * 0.4) + (walkinPct * 0.2));

        let incentiveEarned = 0;
        let status = 'On Track ⚡';
        let statusColor = '#3b82f6';

        if (compositePct >= 120) {
          incentiveEarned = baseBonus + stretchBonus + (Math.max(0, actAdm - admTarget) * perSaleBonus);
          status = 'Super Stretch 🚀';
          statusColor = '#8b5cf6';
        } else if (compositePct >= 100) {
          incentiveEarned = baseBonus + (Math.max(0, actAdm - admTarget) * perSaleBonus);
          status = 'Target Hit 🎉';
          statusColor = '#10b981';
        } else if (compositePct >= 75) {
          incentiveEarned = Math.round(baseBonus * 0.5);
          status = 'On Track ⚡';
          statusColor = '#0284c7';
        } else if (compositePct >= 50) {
          incentiveEarned = 0;
          status = 'In Progress ⏳';
          statusColor = '#f59e0b';
        } else {
          incentiveEarned = 0;
          status = 'Behind Target ⚠️';
          statusColor = '#ef4444';
        }

        return {
          id: cg.id,
          name: cg.name,
          location: cg.branchName,
          type: 'counselor' as const,
          targetRevenue: revTarget,
          actualRevenue: actRev,
          revenuePct: revPct,
          targetAdmissions: admTarget,
          actualAdmissions: actAdm,
          admissionsPct: admPct,
          targetWalkins: walkinTarget,
          actualWalkins: actWalkin,
          walkinsPct: walkinPct,
          compositePct,
          status,
          statusColor,
          incentiveEarned: Math.round(incentiveEarned),
          hasCustomPlan: !!assignedPlan,
        };
      }).sort((a, b) => b.compositePct - a.compositePct);
    } else {
      return campusStandings.map((c) => {
        const assignedPlan = targetPlans.find(
          p => p.type === 'campus' && p.entityName.toLowerCase().includes(c.location.toLowerCase())
        );

        const revTarget = assignedPlan?.targets.revenue || 2500000;
        const admTarget = assignedPlan?.targets.admissions || 100;
        const walkinTarget = assignedPlan?.targets.walkins || 250;
        const baseBonus = assignedPlan?.incentives.baseBonus || 25000;
        const stretchBonus = assignedPlan?.incentives.stretchBonus || 15000;

        const actRev = c.totalSales || (c.intakeCount * 45000) || 0;
        const actAdm = c.completedCount || 0;
        const actWalkin = c.intakeCount || 0;

        const revPct = revTarget > 0 ? Math.min(200, Math.round((actRev / revTarget) * 100)) : 0;
        const admPct = admTarget > 0 ? Math.min(200, Math.round((actAdm / admTarget) * 100)) : 0;
        const walkinPct = walkinTarget > 0 ? Math.min(200, Math.round((actWalkin / walkinTarget) * 100)) : 0;
        const compositePct = Math.round((revPct * 0.4) + (admPct * 0.4) + (walkinPct * 0.2));

        let incentiveEarned = 0;
        let status = 'On Track ⚡';
        let statusColor = '#3b82f6';

        if (compositePct >= 120) {
          incentiveEarned = baseBonus + stretchBonus;
          status = 'Super Stretch 🚀';
          statusColor = '#8b5cf6';
        } else if (compositePct >= 100) {
          incentiveEarned = baseBonus;
          status = 'Target Hit 🎉';
          statusColor = '#10b981';
        } else if (compositePct >= 75) {
          incentiveEarned = Math.round(baseBonus * 0.5);
          status = 'On Track ⚡';
          statusColor = '#0284c7';
        } else {
          incentiveEarned = 0;
          status = 'Behind Target ⚠️';
          statusColor = '#ef4444';
        }

        return {
          id: c.id,
          name: c.name,
          location: c.location,
          type: 'campus' as const,
          targetRevenue: revTarget,
          actualRevenue: actRev,
          revenuePct: revPct,
          targetAdmissions: admTarget,
          actualAdmissions: actAdm,
          admissionsPct: admPct,
          targetWalkins: walkinTarget,
          actualWalkins: actWalkin,
          walkinsPct: walkinPct,
          compositePct,
          status,
          statusColor,
          incentiveEarned: Math.round(incentiveEarned),
          hasCustomPlan: !!assignedPlan,
        };
      }).sort((a, b) => b.compositePct - a.compositePct);
    }
  }, [counselorGamifications, campusStandings, targetPlans, selectedScope]);

  const totalTargetRevenue = targetAchievements.reduce((acc, t) => acc + t.targetRevenue, 0);
  const totalActualRevenue = targetAchievements.reduce((acc, t) => acc + t.actualRevenue, 0);
  const totalTargetAdmissions = targetAchievements.reduce((acc, t) => acc + t.targetAdmissions, 0);
  const totalActualAdmissions = targetAchievements.reduce((acc, t) => acc + t.actualAdmissions, 0);
  const totalIncentivesEarned = targetAchievements.reduce((acc, t) => acc + t.incentiveEarned, 0);

  return (
    <section className="dash-page" style={{ paddingBottom: '70px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
      
      {/* ─── Header Banner ─── */}
      <div className="page-title-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
            🎯 Target Management &amp; Incentive Engine
            <span style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: '6px',
              background: 'rgba(16, 185, 129, 0.15)',
              color: '#10b981',
              border: '1px solid rgba(16, 185, 129, 0.3)',
            }}>
              Active Quotas
            </span>
          </h1>
          <p className="small-text" style={{ marginTop: '4px' }}>
            Assign monthly, weekly, and daily targets for Revenue, Walk-ins, and Admissions with live cash incentive tracking.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Link
            href="/league"
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              background: 'var(--card-bg)',
              color: 'var(--text)',
              fontSize: '0.8rem',
              fontWeight: 800,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>🏆</span> Champions League
          </Link>
          <button
            type="button"
            onClick={() => setActiveTab('allocate')}
            style={{
              padding: '8px 18px',
              borderRadius: '8px',
              border: 'none',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: '#ffffff',
              fontSize: '0.8rem',
              fontWeight: 900,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>➕</span> Give / Set Target
          </button>
        </div>
      </div>

      {/* ─── Top Level Tabs ─── */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1.5px solid var(--border)', paddingBottom: '12px' }}>
        {[
          { id: 'overview', label: '📊 Target Overview & KPIs' },
          { id: 'allocate', label: '✍️ Give / Assign Targets' },
          { id: 'leaderboard', label: '🏆 Quota Achievers Matrix' },
          { id: 'payouts', label: '💵 Incentive Disbursal Register' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            style={{
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

      {/* ══════════════════════════════════════════════════════
          TAB 1: TARGET OVERVIEW & EXECUTIVE STATS
      ══════════════════════════════════════════════════════ */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          
          {/* Executive Stat Strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div style={{
              background: 'var(--card-bg)',
              border: '1.5px solid var(--border)',
              borderRadius: '16px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
            }}>
              <span style={{ fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: '#f59e0b', letterSpacing: '0.05em' }}>
                💰 Total Revenue Target
              </span>
              <div style={{ fontSize: '1.4rem', fontWeight: 950, color: 'var(--text)', fontFamily: 'var(--font-mono)' }}>
                ₹{(totalActualRevenue / 100000).toFixed(2)}L <span style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 700 }}>/ ₹{(totalTargetRevenue / 100000).toFixed(2)}L</span>
              </div>
              <div style={{ fontSize: '0.76rem', color: totalActualRevenue >= totalTargetRevenue ? '#10b981' : '#f59e0b', fontWeight: 800 }}>
                {totalTargetRevenue > 0 ? Math.round((totalActualRevenue / totalTargetRevenue) * 100) : 0}% Realized
              </div>
            </div>

            <div style={{
              background: 'var(--card-bg)',
              border: '1.5px solid var(--border)',
              borderRadius: '16px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
            }}>
              <span style={{ fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: '#38bdf8', letterSpacing: '0.05em' }}>
                🎓 Admissions Target
              </span>
              <div style={{ fontSize: '1.4rem', fontWeight: 950, color: 'var(--text)', fontFamily: 'var(--font-mono)' }}>
                {totalActualAdmissions} <span style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 700 }}>/ {totalTargetAdmissions} Seats</span>
              </div>
              <div style={{ fontSize: '0.76rem', color: totalActualAdmissions >= totalTargetAdmissions ? '#10b981' : '#38bdf8', fontWeight: 800 }}>
                {totalTargetAdmissions > 0 ? Math.round((totalActualAdmissions / totalTargetAdmissions) * 100) : 0}% Target Filled
              </div>
            </div>

            <div style={{
              background: 'var(--card-bg)',
              border: '1.5px solid var(--border)',
              borderRadius: '16px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
            }}>
              <span style={{ fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: '#a855f7', letterSpacing: '0.05em' }}>
                ⚡ Quota Hit Rate
              </span>
              <div style={{ fontSize: '1.4rem', fontWeight: 950, color: 'var(--text)', fontFamily: 'var(--font-mono)' }}>
                {targetAchievements.filter(t => t.compositePct >= 100).length} / {targetAchievements.length} <span style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 700 }}>Hit 100%</span>
              </div>
              <div style={{ fontSize: '0.76rem', color: '#10b981', fontWeight: 800 }}>
                🚀 Top Achievers Eligible for Cash Bonuses
              </div>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(5, 150, 105, 0.06) 100%)',
              border: '1.5px solid rgba(16, 185, 129, 0.45)',
              borderRadius: '16px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              boxShadow: '0 4px 16px rgba(16, 185, 129, 0.1)',
            }}>
              <span style={{ fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: '#10b981', letterSpacing: '0.05em' }}>
                💵 Total Incentive Pool
              </span>
              <div style={{ fontSize: '1.4rem', fontWeight: 950, color: '#10b981', fontFamily: 'var(--font-mono)' }}>
                ₹{totalIncentivesEarned.toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: '0.76rem', color: '#059669', fontWeight: 800 }}>
                ✨ Unlocked for August 2026 Sprints
              </div>
            </div>
          </div>

          {/* Active Target Campaigns */}
          <div style={{
            background: 'var(--card-bg)',
            border: '1.5px solid var(--border)',
            borderRadius: '18px',
            padding: '24px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900, color: 'var(--text)' }}>
                  📋 Active Target Configurations ({targetPlans.length})
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.78rem', color: 'var(--muted)' }}>
                  Configured targets and cash bonus pools for campuses and counselors.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('allocate')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '7px',
                  border: '1px solid var(--border)',
                  background: 'var(--surface)',
                  color: 'var(--text)',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                + Add Plan
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              {targetPlans.map((plan) => (
                <div
                  key={plan.id}
                  style={{
                    background: 'var(--surface-alt)',
                    border: '1.5px solid var(--border)',
                    borderRadius: '14px',
                    padding: '18px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{
                      padding: '3px 8px',
                      borderRadius: '6px',
                      background: plan.type === 'counselor' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                      color: plan.type === 'counselor' ? 'var(--primary)' : '#10b981',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                    }}>
                      {plan.type.toUpperCase()} TARGET
                    </span>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--muted)' }}>
                      {plan.periodLabel}
                    </span>
                  </div>

                  <div>
                    <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 900, color: 'var(--text)' }}>
                      {plan.entityName}
                    </h4>
                    <p style={{ margin: '2px 0 0 0', fontSize: '0.74rem', color: 'var(--muted)' }}>
                      📍 {plan.location}
                    </p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', background: 'var(--card-bg)', padding: '10px', borderRadius: '10px', border: '1px solid var(--border)' }}>
                    <div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--muted)', fontWeight: 700 }}>Revenue</div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 900, color: 'var(--text)' }}>₹{(plan.targets.revenue / 100000).toFixed(1)}L</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--muted)', fontWeight: 700 }}>Admissions</div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 900, color: 'var(--text)' }}>{plan.targets.admissions}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--muted)', fontWeight: 700 }}>Walk-ins</div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 900, color: 'var(--text)' }}>{plan.targets.walkins}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.74rem', color: '#10b981', fontWeight: 800 }}>
                    <span>💵 Base Bonus: ₹{plan.incentives.baseBonus.toLocaleString('en-IN')}</span>
                    <span>🚀 Stretch: ₹{plan.incentives.stretchBonus.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          TAB 2: GIVE / SET TARGETS FORM
      ══════════════════════════════════════════════════════ */}
      {activeTab === 'allocate' && (
        <div style={{
          background: 'var(--card-bg)',
          border: '1.5px solid var(--border)',
          borderRadius: '20px',
          padding: '28px 32px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.04)',
          maxWidth: '820px',
          margin: '0 auto',
          width: '100%',
        }}>
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 900, color: 'var(--text)' }}>
              🎯 Assign Targets &amp; Define Incentives
            </h2>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.84rem', color: 'var(--muted)', fontWeight: 600 }}>
              Set customized quotas for monthly benchmarks, weekly pacing, or daily conversion sprints with live cash incentives.
            </p>
          </div>

          <form onSubmit={handleCreateTarget} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Step 1: Target Level & Time Horizon */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: 'var(--text)', marginBottom: '8px' }}>
                  1. Target Scope
                </label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setNewTargetType('counselor');
                      setNewTargetEntity(counselorGamifications[0]?.name || '');
                    }}
                    style={{
                      flex: 1,
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: newTargetType === 'counselor' ? '1.5px solid var(--primary)' : '1px solid var(--border)',
                      background: newTargetType === 'counselor' ? 'rgba(99, 102, 241, 0.12)' : 'var(--surface)',
                      color: newTargetType === 'counselor' ? 'var(--primary)' : 'var(--text)',
                      fontWeight: 800,
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                    }}
                  >
                    👤 Individual Counselor
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNewTargetType('campus');
                      setNewTargetEntity('Hyderabad Campus');
                    }}
                    style={{
                      flex: 1,
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: newTargetType === 'campus' ? '1.5px solid #10b981' : '1px solid var(--border)',
                      background: newTargetType === 'campus' ? 'rgba(16, 185, 129, 0.12)' : 'var(--surface)',
                      color: newTargetType === 'campus' ? '#10b981' : 'var(--text)',
                      fontWeight: 800,
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                    }}
                  >
                    🏢 Campus / Location
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: 'var(--text)', marginBottom: '8px' }}>
                  2. Select Entity
                </label>
                <select
                  value={newTargetEntity}
                  onChange={(e) => setNewTargetEntity(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1.5px solid var(--border)',
                    background: 'var(--surface)',
                    color: 'var(--text)',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    outline: 'none',
                  }}
                >
                  {newTargetType === 'counselor' ? (
                    counselorGamifications.map(c => (
                      <option key={c.id} value={c.name}>{c.name} ({c.branchName})</option>
                    ))
                  ) : (
                    ['Hyderabad Campus', 'Vijayawada Campus', 'Visakhapatnam Campus', 'Bangalore Campus'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))
                  )}
                </select>
              </div>
            </div>

            {/* Step 2: Timeframe Horizon */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: 'var(--text)', marginBottom: '8px' }}>
                  3. Sprint Horizon
                </label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {[
                    { id: 'monthly', label: 'Monthly' },
                    { id: 'weekly', label: 'Weekly' },
                    { id: 'daily', label: 'Daily' },
                  ].map(h => (
                    <button
                      key={h.id}
                      type="button"
                      onClick={() => setNewTargetPeriodType(h.id as any)}
                      style={{
                        flex: 1,
                        padding: '8px',
                        borderRadius: '7px',
                        border: newTargetPeriodType === h.id ? '1.5px solid var(--primary)' : '1px solid var(--border)',
                        background: newTargetPeriodType === h.id ? 'var(--primary)' : 'var(--surface)',
                        color: newTargetPeriodType === h.id ? '#ffffff' : 'var(--text)',
                        fontWeight: 800,
                        fontSize: '0.78rem',
                        cursor: 'pointer',
                      }}
                    >
                      {h.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: 'var(--text)', marginBottom: '8px' }}>
                  4. Period Label
                </label>
                <input
                  type="text"
                  value={newTargetPeriodLabel}
                  onChange={(e) => setNewTargetPeriodLabel(e.target.value)}
                  placeholder="e.g. August 2026, Week 35, 28 Aug"
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1.5px solid var(--border)',
                    background: 'var(--surface)',
                    color: 'var(--text)',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            {/* Step 3: The 3 Core Target Metrics */}
            <div style={{
              background: 'var(--surface-alt)',
              border: '1.5px solid var(--border)',
              borderRadius: '14px',
              padding: '18px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}>
              <div style={{ fontSize: '0.86rem', fontWeight: 900, color: 'var(--text)' }}>
                🎯 Quota Benchmarks
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 800, color: '#f59e0b', marginBottom: '6px' }}>
                    💰 Revenue Target (₹)
                  </label>
                  <input
                    type="number"
                    value={newTargetRevenue}
                    onChange={(e) => setNewTargetRevenue(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1.5px solid var(--border)',
                      background: 'var(--card-bg)',
                      color: 'var(--text)',
                      fontSize: '0.84rem',
                      fontWeight: 800,
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                  <span style={{ fontSize: '0.68rem', color: 'var(--muted)', marginTop: '3px', display: 'block' }}>
                    = ₹{(newTargetRevenue / 100000).toFixed(2)} Lakhs
                  </span>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 800, color: '#0284c7', marginBottom: '6px' }}>
                    🎓 Admissions Target
                  </label>
                  <input
                    type="number"
                    value={newTargetAdmissions}
                    onChange={(e) => setNewTargetAdmissions(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1.5px solid var(--border)',
                      background: 'var(--card-bg)',
                      color: 'var(--text)',
                      fontSize: '0.84rem',
                      fontWeight: 800,
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                  <span style={{ fontSize: '0.68rem', color: 'var(--muted)', marginTop: '3px', display: 'block' }}>
                    Confirmed enrollments
                  </span>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 800, color: '#10b981', marginBottom: '6px' }}>
                    🚶 Walk-ins Target
                  </label>
                  <input
                    type="number"
                    value={newTargetWalkins}
                    onChange={(e) => setNewTargetWalkins(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1.5px solid var(--border)',
                      background: 'var(--card-bg)',
                      color: 'var(--text)',
                      fontSize: '0.84rem',
                      fontWeight: 800,
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                  <span style={{ fontSize: '0.68rem', color: 'var(--muted)', marginTop: '3px', display: 'block' }}>
                    Physical footfalls
                  </span>
                </div>
              </div>
            </div>

            {/* Step 4: Incentive Rewards Matrix */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(5, 150, 105, 0.03) 100%)',
              border: '1.5px solid rgba(16, 185, 129, 0.35)',
              borderRadius: '14px',
              padding: '18px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}>
              <div style={{ fontSize: '0.86rem', fontWeight: 900, color: '#10b981' }}>
                💵 Cash Incentive Payout Rules
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 800, color: 'var(--text)', marginBottom: '6px' }}>
                    Base 100% Bonus (₹)
                  </label>
                  <input
                    type="number"
                    value={newTargetBaseBonus}
                    onChange={(e) => setNewTargetBaseBonus(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1.5px solid var(--border)',
                      background: 'var(--card-bg)',
                      color: '#10b981',
                      fontSize: '0.84rem',
                      fontWeight: 900,
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 800, color: 'var(--text)', marginBottom: '6px' }}>
                    Super Stretch &gt;120% (₹)
                  </label>
                  <input
                    type="number"
                    value={newTargetStretchBonus}
                    onChange={(e) => setNewTargetStretchBonus(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1.5px solid var(--border)',
                      background: 'var(--card-bg)',
                      color: '#8b5cf6',
                      fontSize: '0.84rem',
                      fontWeight: 900,
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 800, color: 'var(--text)', marginBottom: '6px' }}>
                    Per Sale Bonus beyond Quota (₹)
                  </label>
                  <input
                    type="number"
                    value={newTargetPerSaleBonus}
                    onChange={(e) => setNewTargetPerSaleBonus(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1.5px solid var(--border)',
                      background: 'var(--card-bg)',
                      color: '#0284c7',
                      fontSize: '0.84rem',
                      fontWeight: 900,
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  background: 'transparent',
                  color: 'var(--text)',
                  fontSize: '0.84rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{
                  padding: '10px 28px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: '#ffffff',
                  fontSize: '0.86rem',
                  fontWeight: 900,
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
                }}
              >
                Publish &amp; Activate Target Plan 🚀
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          TAB 3: TARGET LEADERBOARD & MATRIX TABLE
      ══════════════════════════════════════════════════════ */}
      {activeTab === 'leaderboard' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Controls Bar */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '10px',
            background: 'var(--surface)',
            border: '1.5px solid var(--border)',
            borderRadius: '12px',
            padding: '8px 14px',
          }}>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <span style={{ fontSize: '0.76rem', fontWeight: 800, color: 'var(--muted)' }}>Level:</span>
              <button
                type="button"
                onClick={() => setSelectedScope('counselor')}
                style={{
                  padding: '4px 12px',
                  borderRadius: '6px',
                  border: selectedScope === 'counselor' ? '1.5px solid var(--primary)' : '1px solid transparent',
                  background: selectedScope === 'counselor' ? 'var(--primary)' : 'transparent',
                  color: selectedScope === 'counselor' ? '#fff' : 'var(--text)',
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                👤 Counselors
              </button>
              <button
                type="button"
                onClick={() => setSelectedScope('campus')}
                style={{
                  padding: '4px 12px',
                  borderRadius: '6px',
                  border: selectedScope === 'campus' ? '1.5px solid #10b981' : '1px solid transparent',
                  background: selectedScope === 'campus' ? '#10b981' : 'transparent',
                  color: selectedScope === 'campus' ? '#fff' : 'var(--text)',
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                🏢 Campuses
              </button>
            </div>

            <div style={{ fontSize: '0.74rem', color: 'var(--muted)', fontWeight: 700 }}>
              Live Payout &amp; Achievement Matrix ({targetAchievements.length} Entities)
            </div>
          </div>

          {/* Table Card */}
          <div style={{
            background: 'var(--card-bg)',
            border: '1.5px solid var(--border)',
            borderRadius: '18px',
            padding: '24px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
          }}>
            <div className="table-wrapper">
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '850px' }}>
                <thead>
                  <tr style={{ borderBottom: '1.5px solid var(--border)', background: 'var(--surface-alt, rgba(255,255,255,0.02))' }}>
                    <th style={{ padding: '12px 16px', fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', textAlign: 'left' }}>Rank &amp; Entity</th>
                    <th style={{ padding: '12px 16px', fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', textAlign: 'left' }}>Location</th>
                    <th style={{ padding: '12px 16px', fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', textAlign: 'center' }}>💰 Revenue Quota</th>
                    <th style={{ padding: '12px 16px', fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', textAlign: 'center' }}>🎓 Admissions Quota</th>
                    <th style={{ padding: '12px 16px', fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', textAlign: 'center' }}>🚶 Walk-ins Quota</th>
                    <th style={{ padding: '12px 16px', fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', textAlign: 'center' }}>Overall %</th>
                    <th style={{ padding: '12px 16px', fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', textAlign: 'center' }}>Status</th>
                    <th style={{ padding: '12px 16px', fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', textAlign: 'right' }}>Bonus Earned</th>
                  </tr>
                </thead>
                <tbody>
                  {targetAchievements.map((t, idx) => (
                    <tr
                      key={t.id}
                      style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s ease' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-alt)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{
                            width: '24px', height: '24px', borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.72rem', fontWeight: 900,
                            background: idx === 0 ? '#f59e0b' : idx === 1 ? '#94a3b8' : idx === 2 ? '#cd7f32' : 'var(--surface-alt)',
                            color: idx < 3 ? '#ffffff' : 'var(--muted)',
                          }}>
                            {idx + 1}
                          </span>
                          <div>
                            <div style={{ fontWeight: 800, fontSize: '0.86rem', color: 'var(--text)' }}>
                              {t.name}
                            </div>
                            {t.hasCustomPlan && (
                              <span style={{ fontSize: '0.64rem', color: '#10b981', fontWeight: 800 }}>
                                Custom Plan Active
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '14px 16px', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text)' }}>
                        📍 {t.location}
                      </td>

                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text)', fontFamily: 'var(--font-mono)' }}>
                            ₹{(t.actualRevenue / 100000).toFixed(2)}L / ₹{(t.targetRevenue / 100000).toFixed(2)}L
                          </span>
                          <div style={{ width: '90px', height: '5px', background: 'var(--border)', borderRadius: '9999px', overflow: 'hidden' }}>
                            <div style={{ width: `${Math.min(100, t.revenuePct)}%`, height: '100%', background: t.revenuePct >= 100 ? '#10b981' : '#f59e0b' }} />
                          </div>
                          <span style={{ fontSize: '0.68rem', fontWeight: 800, color: t.revenuePct >= 100 ? '#10b981' : '#f59e0b' }}>
                            {t.revenuePct}%
                          </span>
                        </div>
                      </td>

                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text)', fontFamily: 'var(--font-mono)' }}>
                            {t.actualAdmissions} / {t.targetAdmissions}
                          </span>
                          <div style={{ width: '80px', height: '5px', background: 'var(--border)', borderRadius: '9999px', overflow: 'hidden' }}>
                            <div style={{ width: `${Math.min(100, t.admissionsPct)}%`, height: '100%', background: t.admissionsPct >= 100 ? '#10b981' : '#38bdf8' }} />
                          </div>
                          <span style={{ fontSize: '0.68rem', fontWeight: 800, color: t.admissionsPct >= 100 ? '#10b981' : '#38bdf8' }}>
                            {t.admissionsPct}%
                          </span>
                        </div>
                      </td>

                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text)', fontFamily: 'var(--font-mono)' }}>
                            {t.actualWalkins} / {t.targetWalkins}
                          </span>
                          <div style={{ width: '80px', height: '5px', background: 'var(--border)', borderRadius: '9999px', overflow: 'hidden' }}>
                            <div style={{ width: `${Math.min(100, t.walkinsPct)}%`, height: '100%', background: t.walkinsPct >= 100 ? '#10b981' : '#a855f7' }} />
                          </div>
                          <span style={{ fontSize: '0.68rem', fontWeight: 800, color: t.walkinsPct >= 100 ? '#10b981' : '#a855f7' }}>
                            {t.walkinsPct}%
                          </span>
                        </div>
                      </td>

                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '8px',
                          background: t.compositePct >= 100 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(99, 102, 241, 0.1)',
                          color: t.compositePct >= 100 ? '#10b981' : 'var(--primary)',
                          fontWeight: 900,
                          fontSize: '0.84rem',
                          fontFamily: 'var(--font-mono)',
                        }}>
                          {t.compositePct}%
                        </span>
                      </td>

                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: '6px',
                          background: `${t.statusColor}18`,
                          border: `1px solid ${t.statusColor}44`,
                          color: t.statusColor,
                          fontWeight: 800,
                          fontSize: '0.72rem',
                        }}>
                          {t.status}
                        </span>
                      </td>

                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <span style={{
                          fontWeight: 950,
                          fontSize: '0.94rem',
                          color: t.incentiveEarned > 0 ? '#10b981' : 'var(--muted)',
                          fontFamily: 'var(--font-mono)',
                        }}>
                          ₹{t.incentiveEarned.toLocaleString('en-IN')}
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
          TAB 4: INCENTIVE PAYOUTS REGISTER
      ══════════════════════════════════════════════════════ */}
      {activeTab === 'payouts' && (
        <div style={{
          background: 'var(--card-bg)',
          border: '1.5px solid var(--border)',
          borderRadius: '18px',
          padding: '24px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: 'var(--text)' }}>
                💵 Cash Incentive Payout Register ({selectedPeriod})
              </h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.78rem', color: 'var(--muted)' }}>
                Live rewards earned based on target realization and stretch metrics.
              </p>
            </div>

            <div style={{
              padding: '6px 14px',
              borderRadius: '8px',
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#10b981',
              fontWeight: 900,
              fontSize: '0.86rem',
              fontFamily: 'var(--font-mono)',
            }}>
              Total Disbursable: ₹{totalIncentivesEarned.toLocaleString('en-IN')}
            </div>
          </div>

          <div className="table-wrapper">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1.5px solid var(--border)', background: 'var(--surface-alt)' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.74rem', color: 'var(--muted)', fontWeight: 800, textTransform: 'uppercase' }}>Beneficiary</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.74rem', color: 'var(--muted)', fontWeight: 800, textTransform: 'uppercase' }}>Branch</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '0.74rem', color: 'var(--muted)', fontWeight: 800, textTransform: 'uppercase' }}>Target Hit %</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '0.74rem', color: 'var(--muted)', fontWeight: 800, textTransform: 'uppercase' }}>Milestone Level</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '0.74rem', color: 'var(--muted)', fontWeight: 800, textTransform: 'uppercase' }}>Incentive Amount</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '0.74rem', color: 'var(--muted)', fontWeight: 800, textTransform: 'uppercase' }}>Payout Status</th>
                </tr>
              </thead>
              <tbody>
                {targetAchievements.filter(t => t.incentiveEarned > 0).map((t) => (
                  <tr key={t.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 800, fontSize: '0.86rem', color: 'var(--text)' }}>
                      {t.name}
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 700 }}>
                      📍 {t.location}
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'center', fontWeight: 900, color: '#10b981' }}>
                      {t.compositePct}%
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: '6px',
                        background: `${t.statusColor}18`,
                        border: `1px solid ${t.statusColor}44`,
                        color: t.statusColor,
                        fontWeight: 800,
                        fontSize: '0.72rem',
                      }}>
                        {t.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 950, color: '#10b981', fontSize: '0.94rem', fontFamily: 'var(--font-mono)' }}>
                      ₹{t.incentiveEarned.toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                      <span style={{
                        padding: '3px 10px',
                        borderRadius: '9999px',
                        background: 'rgba(16, 185, 129, 0.15)',
                        color: '#10b981',
                        fontWeight: 800,
                        fontSize: '0.72rem',
                      }}>
                        ✅ Approved
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Success Notification Modal */}
      {isSuccessModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
        }}>
          <div style={{
            background: 'var(--card-bg)',
            border: '1.5px solid var(--border)',
            borderRadius: '16px',
            padding: '28px',
            maxWidth: '400px',
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>🎉</div>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: 'var(--text)' }}>
              Target Plan Activated!
            </h3>
            <p style={{ margin: '8px 0 20px 0', fontSize: '0.82rem', color: 'var(--muted)' }}>
              The new target benchmarks and incentive bonus rules have been successfully assigned and synced live.
            </p>
            <button
              type="button"
              onClick={() => {
                setIsSuccessModalOpen(false);
                setActiveTab('overview');
              }}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border: 'none',
                background: 'var(--primary)',
                color: '#ffffff',
                fontSize: '0.84rem',
                fontWeight: 900,
                cursor: 'pointer',
              }}
            >
              Done
            </button>
          </div>
        </div>
      )}

    </section>
  );
}
