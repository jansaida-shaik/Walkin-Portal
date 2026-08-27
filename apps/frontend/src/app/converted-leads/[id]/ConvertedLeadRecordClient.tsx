'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { SessionUser } from '../../../lib/auth';

interface ConvertedLeadRecordClientProps {
  lead: {
    id: string;
    studentId?: string | null;
    studentName: string;
    studentEmail?: string | null;
    studentPhone?: string | null;
    course: string;
    location?: string | null;
    counselorName?: string | null;
    leadOwner?: string | null;
    leadSource: string;
    feePaid?: number | null;
    totalFee?: number | null;
    status: string;
    enrollmentDate: string;
    notes?: string | null;
    metadata?: Record<string, any> | null;
    counselor?: any;
  };
  currentUser: SessionUser;
}

// Exact list of excluded fields from the screenshot
const EXCLUDED_FIELDS = new Set([
  'Most Recent Visit',
  'First Page Visited',
  'Average Time Spent (Minutes)',
  'Number Of Chats',
  'Referrer',
  'Visitor Score',
  'First Visit',
  'Days Visited',
  'GCLID',
  'Keyword',
  'KEYWORDID',
  'Click Type',
  'Device Type',
  'Ad Network',
  'Search Partner Network',
  'Ad Campaign Name',
  'AdGroup Name',
  'Ad',
  'GADCONFIGID',
  'Ad Click Date',
  'Cost per Click',
  'Cost per Conversion',
  'Conversion Exported On',
  'Conversion Export Status',
  'Reason for Conversion Failure',
  'ZCAMPAIGNID',
  'ADGROUPID',
  'ADID',
  'Google Ads Date',
  'Google Ads Agency',
  'Google Ads Created Time',
  'Google Ads Time',
  'Google AdWords Information'
]);

// Definition of Section Boxes
const SECTIONS_CONFIG = [
  {
    id: 'contact',
    title: 'Basic & Contact Details',
    icon: '👤',
    color: '#6366f1',
    keys: [
      'Converted Lead Name', 'Last Name', 'Student ID', 'Record Id', 'Converted Lead Owner', 'Converted Lead Owner.id',
      'Counsellor', 'Counsellor Location', 'Email', 'Secondary Email', 'Phone', 'Mobile', 'Fax', 'Gender',
      'Date of Birth', 'Assistant', 'Skype ID', 'Mailing Street', 'Mailing City', 'Mailing State', 'Mailing Zip',
      'Mailing Country', 'Other Street', 'Other City', 'Other State', 'Other Zip', 'Other Country'
    ]
  },
  {
    id: 'academic',
    title: 'Academic & Educational Background',
    icon: '🎓',
    color: '#06b6d4',
    keys: [
      'Highest Qualification', 'Passed Out Year', 'Meta Passed Out Year', 'Institution', 'UG (%)', 'PG (%)',
      'Class 12th (%)', 'Class 10th (%)', 'Previous Training Institute', 'Referred By', 'Referred Student ID'
    ]
  },
  {
    id: 'finance',
    title: 'Fees, Invoicing & Financials',
    icon: '💰',
    color: '#10b981',
    keys: [
      'Course Name', 'Course Fee', 'Discount', 'Final Course Fee', 'Amount Paid', 'Balance Due', 'Invoice Amount',
      'Invoice ID', 'Invoice Date', 'Due Date', 'Due Date (30)', 'Last Payment Date', 'Drop Amount', 'Drop Date',
      'Write Off Date', 'Place Of Supply', 'Invoice Details'
    ]
  },
  {
    id: 'batch',
    title: 'Batch & Training Program',
    icon: '🏢',
    color: '#f59e0b',
    keys: [
      'Batch Master Name', 'Batch Master Name.id', 'Batch Id', 'Batch Start Date', 'Batch Mode', 'Batch Location',
      'Mode of Study', 'Duration (In Days)', 'Available Seats', 'Student Status', 'Walk-in Branch', 'Walk-in Date',
      'Walkin ID', 'Admission Type', 'Admission Date', 'Walk-in Status', 'Walk-in Type'
    ]
  },
  {
    id: 'placement',
    title: 'Placement & Career Details',
    icon: '💼',
    color: '#ec4899',
    keys: [
      'Company', 'Designation', 'Package', 'Placed Date', 'Placements'
    ]
  },
  {
    id: 'ai',
    title: 'AI Intelligence & Call Analytics',
    icon: '🤖',
    color: '#8b5cf6',
    keys: [
      'AI Interest Score', 'AI Interest Level', 'AI Interest Reasoning', 'AI Summary', 'AI Call Outcome',
      'AI Action Items', 'AI Lost Reasons', 'AI Objections', 'AI Transcript', 'AI Courses Interested', 'AI Agent',
      'Joining Interest', 'Tele Caller', 'Tele Caller.id', 'Inbound Calls', 'Outbound Calls', 'Total Calls',
      'Missed Calls', 'Inbound', 'Outbound', 'Outbound Minutes', 'Outbound SLA', 'First Inbound Activity',
      'First Outbound Activity', 'Last Call Made On', 'Last Call Received On'
    ]
  },
  {
    id: 'marketing',
    title: 'Marketing, Meta Ads & Lead Origin',
    icon: '📢',
    color: '#3b82f6',
    keys: [
      'Lead Source', 'Lead Origin', 'Meta Campaign Name', 'Meta Adset Name', 'Meta Ad Name', 'Meta Platform',
      'Meta Form Name', 'Meta Ads ID', 'Meta Ads Date', 'Meta Ads Time', 'Meta Ads Created Time', 'Meta Ad Agency',
      'BDE Name', 'Touch Points', 'First Touch Point', 'Last Touch Point', 'Chatrace Tag', 'Social Lead ID',
      'Webinar Date', 'Inbox Link', 'Parent\'s Meet City', 'Walk-in Scanner', 'Walk-in Counsellor'
    ]
  },
  {
    id: 'system',
    title: 'System Audit & Additional Metadata',
    icon: '⚙️',
    color: '#64748b',
    keys: [
      'Created By', 'Created By.id', 'Created Time', 'Modified By', 'Modified By.id', 'Modified Time',
      'Last Activity Time', 'Change Log Time', 'Last Enriched Time', 'Enrich Status', 'Layout', 'Layout.id',
      'Reporting To', 'Reporting To.id', 'Connected To.module', 'Connected To.id', 'CRM Contact ID',
      'Customer ID', 'Lead Owners', 'First Owner', 'Last Owner', 'Tag', 'Locked', 'Unsubscribed Mode',
      'Unsubscribed Time', 'Description'
    ]
  }
];

export default function ConvertedLeadRecordClient({ lead, currentUser }: ConvertedLeadRecordClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Clean value helper (removes zcrm_ prefix)
  const cleanVal = (v: any) => {
    if (v === null || v === undefined || v === '') return '—';
    const s = String(v).trim();
    if (s.startsWith('zcrm_')) return s.slice(5);
    return s;
  };

  const meta = lead.metadata || {};

  // Build a lookup map of all available cleaned fields
  const allFieldEntries = useMemo(() => {
    const map = new Map<string, string>();
    Object.entries(meta).forEach(([k, v]) => {
      if (!EXCLUDED_FIELDS.has(k)) {
        map.set(k, cleanVal(v));
      }
    });
    return map;
  }, [meta]);

  const studentId = lead.studentId || cleanVal(meta['Student ID']) || cleanVal(meta['Referred Student ID']);
  const leadOwner = lead.leadOwner || cleanVal(meta['Converted Lead Owner']) || 'Codegnan';
  const counsellor = lead.counselorName || cleanVal(meta['Counsellor']) || cleanVal(meta['Walk-in Counsellor']) || 'Unassigned';

  // Build the boxes with their matched key-value pairs
  const sectionBoxes = useMemo(() => {
    const assignedKeys = new Set<string>();
    const boxes: Array<{
      id: string;
      title: string;
      icon: string;
      color: string;
      items: Array<{ key: string; value: string }>;
    }> = [];

    // Filter by tab if not 'all'
    const targetSections = activeTab === 'all'
      ? SECTIONS_CONFIG
      : SECTIONS_CONFIG.filter(s => s.id === activeTab);

    targetSections.forEach(sec => {
      const items: Array<{ key: string; value: string }> = [];
      sec.keys.forEach(k => {
        if (allFieldEntries.has(k)) {
          const val = allFieldEntries.get(k)!;
          assignedKeys.add(k);
          
          if (!searchQuery.trim()) {
            items.push({ key: k, value: val });
          } else {
            const q = searchQuery.toLowerCase();
            if (k.toLowerCase().includes(q) || val.toLowerCase().includes(q)) {
              items.push({ key: k, value: val });
            }
          }
        }
      });

      if (items.length > 0) {
        boxes.push({
          id: sec.id,
          title: sec.title,
          icon: sec.icon,
          color: sec.color,
          items,
        });
      }
    });

    // Catch any remaining fields in All Fields view
    if (activeTab === 'all') {
      const otherItems: Array<{ key: string; value: string }> = [];
      allFieldEntries.forEach((val, k) => {
        if (!assignedKeys.has(k)) {
          if (!searchQuery.trim()) {
            otherItems.push({ key: k, value: val });
          } else {
            const q = searchQuery.toLowerCase();
            if (k.toLowerCase().includes(q) || val.toLowerCase().includes(q)) {
              otherItems.push({ key: k, value: val });
            }
          }
        }
      });
      if (otherItems.length > 0) {
        boxes.push({
          id: 'other',
          title: 'Additional Custom Record Fields',
          icon: '📋',
          color: '#6366f1',
          items: otherItems,
        });
      }
    }

    return boxes;
  }, [allFieldEntries, activeTab, searchQuery]);

  return (
    <section className="dash-page" style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '80px' }}>
      
      {/* ── TOP BACK NAVIGATION ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <button
          type="button"
          onClick={() => router.push('/converted-leads')}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '8px 16px', borderRadius: '10px',
            background: 'var(--surface-alt)', border: '1.5px solid var(--border)',
            color: 'var(--text)', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          ← Back to Converted Leads
        </button>

        <span style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 600 }}>
          Record ID: <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--text)' }}>#{lead.id}</strong>
        </span>
      </div>

      {/* ── TOP IDENTITY BANNER ── */}
      <div style={{
        background: 'var(--card-bg)',
        border: '1.5px solid var(--border)',
        borderRadius: '18px',
        padding: '24px 28px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <h1 style={{ margin: 0, fontSize: '1.45rem', fontWeight: 900, color: 'var(--text)' }}>
                {lead.studentName}
              </h1>
              <span style={{
                padding: '3px 10px', borderRadius: '9999px', fontSize: '0.74rem', fontWeight: 800,
                background: 'rgba(16, 185, 129, 0.12)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.25)',
              }}>
                {lead.status || 'Enrolled'}
              </span>
              <span style={{
                padding: '3px 10px', borderRadius: '8px', fontSize: '0.74rem', fontWeight: 800,
                background: 'rgba(99, 102, 241, 0.12)', color: 'var(--primary)', border: '1px solid rgba(99, 102, 241, 0.25)',
              }}>
                Owner: {leadOwner}
              </span>
            </div>

            <p style={{ margin: '8px 0 0 0', fontSize: '0.86rem', color: 'var(--muted)', display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
              <span>Student ID: <strong style={{ color: '#06b6d4', fontFamily: 'var(--font-mono)', fontWeight: 800 }}>{studentId}</strong></span>
              <span style={{ color: 'var(--border)' }}>•</span>
              <span>Counsellor: <strong style={{ color: 'var(--primary)', fontWeight: 800 }}>{counsellor}</strong></span>
              <span style={{ color: 'var(--border)' }}>•</span>
              <span>Course: <strong style={{ color: 'var(--text)', fontWeight: 700 }}>{lead.course}</strong></span>
              <span style={{ color: 'var(--border)' }}>•</span>
              <span>Location: <strong style={{ color: 'var(--text)', fontWeight: 700 }}>{lead.location || 'Hyderabad'}</strong></span>
            </p>
          </div>
        </div>

        {/* Live Metrics */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ background: 'var(--surface)', padding: '10px 16px', borderRadius: '12px', border: '1.5px solid var(--border)', minWidth: 140 }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)' }}>Amount Paid</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#10b981', marginTop: '2px' }}>
              ₹{(lead.feePaid || 0).toLocaleString()}
            </div>
          </div>

          <div style={{ background: 'var(--surface)', padding: '10px 16px', borderRadius: '12px', border: '1.5px solid var(--border)', minWidth: 140 }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)' }}>Total Course Fee</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--text)', marginTop: '2px' }}>
              ₹{(lead.totalFee || 0).toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* ── TAB BAR & SEARCH BAR ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap',
        gap: '12px', background: 'var(--card-bg)', border: '1.5px solid var(--border)',
        borderRadius: '14px', padding: '14px 20px',
      }}>
        {/* Category Tabs */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', background: 'var(--surface-alt, rgba(0,0,0,0.04))',
          padding: '3px', borderRadius: '10px', border: '1px solid var(--border)', gap: '4px', flexWrap: 'wrap'
        }}>
          {[
            { id: 'all', label: `All Fields (${allFieldEntries.size})` },
            { id: 'contact', label: 'Basic & Contact' },
            { id: 'academic', label: 'Academic & Education' },
            { id: 'finance', label: 'Fees & Invoicing' },
            { id: 'batch', label: 'Batch & Training' },
            { id: 'placement', label: 'Placement & Career' },
            { id: 'ai', label: 'AI & Calls' },
            { id: 'marketing', label: 'Marketing & Origin' },
            { id: 'system', label: 'System & Audit' },
          ].map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '6px 14px', borderRadius: '8px', fontSize: '0.8rem',
                  fontWeight: isActive ? 800 : 600, border: 'none',
                  background: isActive ? 'var(--primary)' : 'transparent',
                  color: isActive ? '#fff' : 'var(--text)', cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: isActive ? '0 2px 8px rgba(99, 102, 241, 0.35)' : 'none',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Quick Search */}
        <div style={{ width: 300 }}>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search across all fields in this record…"
            style={{
              width: '100%', padding: '7px 14px', borderRadius: '8px',
              border: '1.5px solid var(--border)', background: 'var(--surface)',
              color: 'var(--text)', fontSize: '0.82rem', outline: 'none'
            }}
          />
        </div>
      </div>

      {/* ── SECTION BOXES CONTAINER ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {sectionBoxes.length > 0 ? (
          sectionBoxes.map(section => (
            <div
              key={section.id}
              style={{
                background: 'var(--card-bg)',
                border: '1.5px solid var(--border)',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 4px 16px rgba(0,0,0,0.04)'
              }}
            >
              {/* Box Section Header */}
              <div style={{
                padding: '14px 22px',
                background: 'var(--surface-alt)',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '1.1rem' }}>{section.icon}</span>
                  <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {section.title}
                  </h3>
                </div>
                <span style={{
                  padding: '2px 8px', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 800,
                  background: 'var(--surface)', color: 'var(--muted)', border: '1px solid var(--border)'
                }}>
                  {section.items.length} Fields
                </span>
              </div>

              {/* Box Grid Layout */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '1px',
                background: 'var(--border)',
              }}>
                {section.items.map(({ key, value }) => (
                  <div
                    key={key}
                    style={{
                      background: 'var(--card-bg)',
                      padding: '12px 18px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                    }}
                  >
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      color: 'var(--muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}>
                      {key}
                    </span>
                    <span style={{
                      fontSize: '0.88rem',
                      color: value !== '—' ? 'var(--text)' : 'var(--muted)',
                      fontWeight: value !== '—' ? 600 : 400,
                      fontFamily: value.startsWith('+') || /^\d+$/.test(value) || /^[A-Z0-9_-]+$/.test(value) ? 'var(--font-mono)' : 'inherit',
                      wordBreak: 'break-word',
                      lineHeight: '1.4',
                    }}>
                      {value !== '—' ? value : <span style={{ opacity: 0.35 }}>—</span>}
                    </span>
                  </div>
                ))}
              </div>

            </div>
          ))
        ) : (
          <div style={{
            background: 'var(--card-bg)', border: '1.5px solid var(--border)',
            borderRadius: '16px', padding: '48px 24px', textAlign: 'center',
          }}>
            <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--muted)' }}>
              No fields match your search query "{searchQuery}".
            </p>
          </div>
        )}
      </div>

    </section>
  );
}
