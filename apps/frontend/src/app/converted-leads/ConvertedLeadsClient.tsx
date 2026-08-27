'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { SessionUser } from '../../lib/auth';
import SearchInput from '../../components/SearchInput';

interface ConvertedLead {
  id: string; // Record Id (clean numeric ID)
  leadOwner?: string | null; // Converted Lead Owner
  counselorName?: string | null; // Counsellor
  studentId?: string | null; // Student ID
  studentName: string; // Converted Lead Name
  studentPhone?: string | null; // Phone / Mobile
  studentEmail?: string | null; // Email
  location?: string | null; // Batch Location (exact raw from CSV)
  course: string; // Course Name
  leadSource: string; // Lead Source
  feePaid?: number | null;
  totalFee?: number | null;
  status: string;
  enrollmentDate: string;
  notes?: string | null;
  metadata?: Record<string, any> | null; // All 185 exact fields
}

interface ConvertedLeadsClientProps {
  initialLeads: ConvertedLead[];
  counselors: Array<{ id: string; name: string; branchId: string; branchName?: string | null }>;
  branches: Array<{ id: string; name: string }>;
  currentUser: SessionUser;
}

export default function ConvertedLeadsClient({
  initialLeads,
  currentUser,
}: ConvertedLeadsClientProps) {
  const router = useRouter();
  const [leads] = useState<ConvertedLead[]>(initialLeads);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [counselorFilter, setCounselorFilter] = useState('');
  const [ownerFilter, setOwnerFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 50;

  // Selected lead for Full Record View Modal
  const [selectedLead, setSelectedLead] = useState<ConvertedLead | null>(null);
  const [modalSearch, setModalSearch] = useState('');

  // Exact fields to exclude
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

  // Helper to cleanly strip any 'zcrm_' prefix from IDs
  const cleanId = (id: string | null | undefined) => {
    if (!id) return '—';
    return String(id).replace(/^zcrm_/i, '').trim();
  };

  // Helper to get initials
  const getInitials = (name: string) => {
    if (!name) return 'ST';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Extract exact raw Student ID
  const getRawStudentId = (l: ConvertedLead) => {
    const sid = (l.studentId || (l.metadata && (l.metadata['Student ID'] || l.metadata['Student Id'] || l.metadata['Referred Student ID'])) || '').trim();
    return sid && sid !== '—' ? sid : '—';
  };

  // Extract exact raw CSV fields
  const getRawLocation = (l: ConvertedLead) => {
    return (l.location || (l.metadata && l.metadata['Batch Location']) || (l.metadata && l.metadata['Counsellor Location']) || 'Hyderabad').trim();
  };

  const getRawCounsellor = (l: ConvertedLead) => {
    return (l.counselorName || (l.metadata && l.metadata['Counsellor']) || (l.metadata && l.metadata['Walk-in Counsellor']) || 'Unassigned').trim();
  };

  const getRawOwner = (l: ConvertedLead) => {
    return (l.leadOwner || (l.metadata && l.metadata['Converted Lead Owner']) || (l.metadata && l.metadata['Created By']) || 'Codegnan').trim();
  };

  const getRawSource = (l: ConvertedLead) => {
    return (l.leadSource || (l.metadata && l.metadata['Lead Source']) || 'Direct').trim();
  };

  const getRawCourse = (l: ConvertedLead) => {
    return (l.course || (l.metadata && l.metadata['Course Name']) || 'Full Stack Program').trim();
  };

  // Dynamic lists of all exact locations, counsellors, owners, sources, courses directly from CSV
  const { uniqueLocations, uniqueCounselors, uniqueOwners, uniqueSources, uniqueCourses } = useMemo(() => {
    const locMap = new Map<string, number>();
    const counsMap = new Map<string, number>();
    const ownMap = new Map<string, number>();
    const srcMap = new Map<string, number>();
    const crsMap = new Map<string, number>();

    leads.forEach((l) => {
      const loc = getRawLocation(l);
      if (loc) locMap.set(loc, (locMap.get(loc) || 0) + 1);

      const coun = getRawCounsellor(l);
      if (coun) counsMap.set(coun, (counsMap.get(coun) || 0) + 1);

      const own = getRawOwner(l);
      if (own) ownMap.set(own, (ownMap.get(own) || 0) + 1);

      const src = getRawSource(l);
      if (src) srcMap.set(src, (srcMap.get(src) || 0) + 1);

      const crs = getRawCourse(l);
      if (crs) crsMap.set(crs, (crsMap.get(crs) || 0) + 1);
    });

    return {
      uniqueLocations: Array.from(locMap.entries()).sort((a, b) => b[1] - a[1]),
      uniqueCounselors: Array.from(counsMap.entries()).sort((a, b) => b[1] - a[1]),
      uniqueOwners: Array.from(ownMap.entries()).sort((a, b) => b[1] - a[1]),
      uniqueSources: Array.from(srcMap.entries()).sort((a, b) => b[1] - a[1]),
      uniqueCourses: Array.from(crsMap.entries()).sort((a, b) => b[1] - a[1]),
    };
  }, [leads]);

  // Live filter evaluation
  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      const loc = getRawLocation(l);
      const coun = getRawCounsellor(l);
      const own = getRawOwner(l);
      const src = getRawSource(l);
      const crs = getRawCourse(l);

      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          own.toLowerCase().includes(q) ||
          coun.toLowerCase().includes(q) ||
          (l.id && l.id.toLowerCase().includes(q)) ||
          (l.studentId && l.studentId.toLowerCase().includes(q)) ||
          l.studentName.toLowerCase().includes(q) ||
          (l.studentPhone && l.studentPhone.includes(q)) ||
          loc.toLowerCase().includes(q) ||
          crs.toLowerCase().includes(q) ||
          src.toLowerCase().includes(q);
        if (!match) return false;
      }

      // 2. Batch Location Filter
      if (locationFilter) {
        if (loc.toLowerCase() !== locationFilter.toLowerCase()) return false;
      }

      // 3. Counsellor Filter
      if (counselorFilter) {
        if (coun.toLowerCase() !== counselorFilter.toLowerCase()) return false;
      }

      // 4. Converted Lead Owner Filter
      if (ownerFilter) {
        if (own.toLowerCase() !== ownerFilter.toLowerCase()) return false;
      }

      // 5. Lead Source Filter
      if (sourceFilter) {
        if (src.toLowerCase() !== sourceFilter.toLowerCase()) return false;
      }

      // 6. Course Name Filter
      if (courseFilter) {
        if (crs.toLowerCase() !== courseFilter.toLowerCase()) return false;
      }

      return true;
    });
  }, [leads, searchQuery, locationFilter, counselorFilter, ownerFilter, sourceFilter, courseFilter]);

  // Pagination (50 / page)
  const totalPages = Math.ceil(filteredLeads.length / pageSize) || 1;
  const paginatedLeads = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredLeads.slice(start, start + pageSize);
  }, [filteredLeads, currentPage]);

  return (
    <section className="dash-page" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header Bar */}
      <div className="page-title-row flex justify-between items-center" style={{ flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text)', margin: 0 }}>
            Converted Leads &amp; All Enrollments
          </h1>
          <p className="small-text" style={{ margin: '4px 0 0 0', color: 'var(--muted)' }}>
            Complete master database ({leads.length.toLocaleString()} records mapped directly from CSV).
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            onClick={() => {
              setLocationFilter('');
              setCounselorFilter('');
              setOwnerFilter('');
              setSourceFilter('');
              setCourseFilter('');
              setSearchQuery('');
              setCurrentPage(1);
            }}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              background: 'var(--surface-alt)',
              color: 'var(--text)',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Reset All Filters
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="dash-table-card">
        
        {/* ALL Batch Location Tabs in Exact Counsellor Location Style */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap',
          gap: '14px', padding: '16px 20px', borderBottom: '1px solid var(--border)', background: 'var(--card-bg)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 900, color: 'var(--text)' }}>
              Batch Location
            </h2>

            {/* Exactly Matching Counsellor Location Style Container */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              background: 'var(--surface-alt, rgba(0,0,0,0.04))',
              padding: '3px',
              borderRadius: '10px',
              border: '1px solid var(--border)',
              gap: '4px',
              flexWrap: 'wrap',
            }}>
              {/* All Tab */}
              <button
                type="button"
                onClick={() => { setLocationFilter(''); setCurrentPage(1); }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '5px 12px',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  fontWeight: locationFilter === '' ? 800 : 600,
                  border: 'none',
                  background: locationFilter === '' ? 'var(--primary)' : 'transparent',
                  color: locationFilter === '' ? '#fff' : 'var(--text)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: locationFilter === '' ? '0 2px 8px rgba(99, 102, 241, 0.35)' : 'none',
                }}
              >
                <span>All</span>
                <span style={{
                  padding: '1px 6px',
                  borderRadius: '9999px',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  background: locationFilter === '' ? 'rgba(255,255,255,0.25)' : 'var(--surface, rgba(0,0,0,0.06))',
                  color: locationFilter === '' ? '#fff' : 'var(--muted)',
                }}>
                  {leads.length.toLocaleString()}
                </span>
              </button>

              {/* All Unique Batch Locations from CSV in Exact Counsellor Style */}
              {uniqueLocations.map(([locName, count]) => {
                const isActive = locationFilter.toLowerCase() === locName.toLowerCase();
                return (
                  <button
                    key={locName}
                    type="button"
                    onClick={() => { setLocationFilter(locName); setCurrentPage(1); }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '5px 12px',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      fontWeight: isActive ? 800 : 600,
                      border: 'none',
                      background: isActive ? 'var(--primary)' : 'transparent',
                      color: isActive ? '#fff' : 'var(--text)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow: isActive ? '0 2px 8px rgba(99, 102, 241, 0.35)' : 'none',
                    }}
                  >
                    <span>{locName}</span>
                    <span style={{
                      padding: '1px 6px',
                      borderRadius: '9999px',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      background: isActive ? 'rgba(255,255,255,0.25)' : 'var(--surface, rgba(0,0,0,0.06))',
                      color: isActive ? '#fff' : 'var(--muted)',
                    }}>
                      {count.toLocaleString()}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Real CSV Data Filter Dropdowns */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '10px', padding: '14px 20px', background: 'var(--surface-alt)', borderBottom: '1px solid var(--border)'
        }}>
          {/* 1. Counsellor */}
          <div>
            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '4px' }}>
              Filter by Counsellor ({uniqueCounselors.length})
            </label>
            <select
              value={counselorFilter}
              onChange={(e) => { setCounselorFilter(e.target.value); setCurrentPage(1); }}
              style={{
                width: '100%', padding: '7px 10px', borderRadius: '8px', border: '1px solid var(--border)',
                background: 'var(--surface)', color: 'var(--text)', fontSize: '0.8rem', fontWeight: 600, outline: 'none'
              }}
            >
              <option value="">All Counsellors ({leads.length.toLocaleString()})</option>
              {uniqueCounselors.map(([cName, count]) => (
                <option key={cName} value={cName}>
                  {cName} ({count.toLocaleString()})
                </option>
              ))}
            </select>
          </div>

          {/* 2. Converted Lead Owner */}
          <div>
            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '4px' }}>
              Filter by Converted Lead Owner ({uniqueOwners.length})
            </label>
            <select
              value={ownerFilter}
              onChange={(e) => { setOwnerFilter(e.target.value); setCurrentPage(1); }}
              style={{
                width: '100%', padding: '7px 10px', borderRadius: '8px', border: '1px solid var(--border)',
                background: 'var(--surface)', color: 'var(--text)', fontSize: '0.8rem', fontWeight: 600, outline: 'none'
              }}
            >
              <option value="">All Lead Owners</option>
              {uniqueOwners.map(([oName, count]) => (
                <option key={oName} value={oName}>
                  {oName} ({count.toLocaleString()})
                </option>
              ))}
            </select>
          </div>

          {/* 3. Lead Source */}
          <div>
            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '4px' }}>
              Filter by Lead Source ({uniqueSources.length})
            </label>
            <select
              value={sourceFilter}
              onChange={(e) => { setSourceFilter(e.target.value); setCurrentPage(1); }}
              style={{
                width: '100%', padding: '7px 10px', borderRadius: '8px', border: '1px solid var(--border)',
                background: 'var(--surface)', color: 'var(--text)', fontSize: '0.8rem', fontWeight: 600, outline: 'none'
              }}
            >
              <option value="">All Lead Sources</option>
              {uniqueSources.map(([sName, count]) => (
                <option key={sName} value={sName}>
                  {sName} ({count.toLocaleString()})
                </option>
              ))}
            </select>
          </div>

          {/* 4. Course Name */}
          <div>
            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '4px' }}>
              Filter by Course Name ({uniqueCourses.length})
            </label>
            <select
              value={courseFilter}
              onChange={(e) => { setCourseFilter(e.target.value); setCurrentPage(1); }}
              style={{
                width: '100%', padding: '7px 10px', borderRadius: '8px', border: '1px solid var(--border)',
                background: 'var(--surface)', color: 'var(--text)', fontSize: '0.8rem', fontWeight: 600, outline: 'none'
              }}
            >
              <option value="">All Course Programs</option>
              {uniqueCourses.map(([crsName, count]) => (
                <option key={crsName} value={crsName}>
                  {crsName} ({count.toLocaleString()})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Global Live Search */}
        <div style={{ padding: '12px 20px', background: 'var(--surface-alt)', borderBottom: '1px solid var(--border)' }}>
          <SearchInput
            id="leads-search"
            placeholder="Search across all 9,582 records by Converted Lead Owner, Counsellor, Record Id, Student ID, Converted Lead Name, Phone, Batch Location, Course Name, Lead Source…"
            value={searchQuery}
            onChange={(q) => {
              setSearchQuery(q);
              setCurrentPage(1);
            }}
            ariaLabel="Search leads"
          />
        </div>

        {/* Exact Table Layout Matching Counselors & Walk-ins Table Style */}
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Converted Lead Owner</th>
                <th>Counsellor</th>
                <th>Record ID</th>
                <th>Student ID</th>
                <th>Student</th>
                <th>Phone</th>
                <th>Batch Location</th>
                <th>Course</th>
                <th>Source</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedLeads.length > 0 ? (
                paginatedLeads.map((l) => {
                  const loc = getRawLocation(l);
                  const coun = getRawCounsellor(l);
                  const own = getRawOwner(l);
                  const src = getRawSource(l);
                  const crs = getRawCourse(l);

                  return (
                    <tr
                      key={l.id}
                      style={{ transition: 'background 0.15s ease' }}
                    >
                      {/* 1. Converted Lead Owner */}
                      <td>
                        <span style={{
                          fontWeight: 700, fontSize: '0.86rem', color: 'var(--text)',
                        }}>
                          {own}
                        </span>
                      </td>

                      {/* 2. Counsellor */}
                      <td>
                        <span style={{
                          fontWeight: 700, fontSize: '0.86rem', color: 'var(--primary)',
                        }}>
                          {coun}
                        </span>
                      </td>

                      {/* 3. Record ID */}
                      <td>
                        <span style={{
                          fontFamily: 'var(--font-mono)', fontSize: '0.84rem', color: 'var(--muted)',
                        }}>
                          {cleanId(l.id)}
                        </span>
                      </td>

                      {/* 4. Student ID */}
                      <td>
                        <span style={{
                          fontFamily: 'var(--font-mono)', fontSize: '0.84rem',
                          color: getRawStudentId(l) !== '—' ? 'var(--text)' : 'var(--muted)',
                          fontWeight: 600,
                        }}>
                          {getRawStudentId(l)}
                        </span>
                      </td>

                      {/* 5. Student (Clean Clickable Name) */}
                      <td>
                        <button
                          type="button"
                          onClick={() => setSelectedLead(l)}
                          style={{
                            background: 'none', border: 'none', padding: 0,
                            cursor: 'pointer', color: 'var(--primary)',
                            fontWeight: 700, fontSize: '0.9rem', fontFamily: 'var(--font-sans)',
                            textAlign: 'left',
                          }}
                          onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
                          onMouseLeave={e => (e.currentTarget.style.color = 'var(--primary)')}
                        >
                          {l.studentName}
                        </button>
                      </td>

                      {/* 6. Phone */}
                      <td>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.84rem' }}>
                          {l.studentPhone || '—'}
                        </span>
                      </td>

                      {/* 7. Batch Location */}
                      <td>
                        <span style={{ fontSize: '0.86rem', color: 'var(--text)' }}>
                          {loc}
                        </span>
                      </td>

                      {/* 8. Course */}
                      <td>
                        <span style={{ fontSize: '0.86rem' }}>
                          {crs}
                        </span>
                      </td>

                      {/* 9. Source */}
                      <td>
                        <span style={{ fontSize: '0.84rem' }}>
                          {src}
                        </span>
                      </td>

                      {/* 10. Actions (Quick View & Full Record pair) */}
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                          <button
                            type="button"
                            className="table-btn-soft"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedLead(l);
                            }}
                          >
                            Quick View
                          </button>
                          <a
                            href={`/converted-leads/${l.id}`}
                            className="table-btn-outline"
                            style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/converted-leads/${l.id}`);
                            }}
                          >
                            Full Record
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={10} className="empty-row" style={{ textAlign: 'center', padding: '36px' }}>
                    <p style={{ margin: 0, fontWeight: 700, color: 'var(--text)' }}>No matching enrollment records found.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 20px', borderTop: '1px solid var(--border)', flexWrap: 'wrap', gap: '10px',
        }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 600 }}>
            Showing {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, filteredLeads.length)} of {filteredLeads.length.toLocaleString()} matching records (Total Database: {leads.length.toLocaleString()})
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              style={{
                padding: '6px 14px', borderRadius: '6px', border: '1px solid var(--border)',
                background: 'var(--surface)', color: currentPage === 1 ? 'var(--muted)' : 'var(--text)',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer', fontSize: '0.8rem', fontWeight: 700,
              }}
            >
              ← Previous
            </button>

            <span style={{ fontSize: '0.82rem', fontWeight: 800, padding: '0 8px', color: 'var(--text)' }}>
              Page {currentPage} of {totalPages}
            </span>

            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              style={{
                padding: '6px 14px', borderRadius: '6px', border: '1px solid var(--border)',
                background: 'var(--surface)', color: currentPage === totalPages ? 'var(--muted)' : 'var(--text)',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', fontSize: '0.8rem', fontWeight: 700,
              }}
            >
              Next →
            </button>
          </div>
        </div>

      </div>

      {/* ── FULL RECORD VIEW DRAWER ── */}
      {selectedLead && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 12000, padding: '20px',
        }}>
          <div style={{
            background: 'var(--card-bg, #111827)', border: '1.5px solid var(--border)',
            borderRadius: '20px', width: '100%', maxWidth: '880px', maxHeight: '90vh',
            boxShadow: '0 25px 70px rgba(0,0,0,0.6)', display: 'flex', flexDirection: 'column',
            overflow: 'hidden',
          }}>
            
            {/* Modal Header */}
            <div style={{
              padding: '20px 24px', borderBottom: '1px solid var(--border)', background: 'var(--surface-alt)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: 'var(--text)' }}>
                    {selectedLead.studentName}
                  </h2>
                  <span style={{
                    padding: '2px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 800,
                    background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary)', border: '1px solid rgba(99,102,241,0.3)',
                  }}>
                    {getRawOwner(selectedLead)}
                  </span>
                </div>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--muted)' }}>
                  Record ID: <span style={{ fontFamily: 'var(--font-mono)' }}>{cleanId(selectedLead.id)}</span> • Student ID: <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--primary)', fontWeight: 800 }}>{getRawStudentId(selectedLead)}</span> • {getRawLocation(selectedLead)}
                </p>
              </div>

              <button
                type="button"
                onClick={() => { setSelectedLead(null); setModalSearch(''); }}
                style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  border: '1px solid var(--border)', background: 'var(--surface)',
                  color: 'var(--text)', fontSize: '1.1rem', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Search Bar */}
            <div style={{ padding: '10px 24px', background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
              <input
                type="text"
                value={modalSearch}
                onChange={(e) => setModalSearch(e.target.value)}
                placeholder="Search across record fields (e.g. Fee, Phone, Batch, Mode)…"
                style={{
                  width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)',
                  background: 'var(--surface-alt)', color: 'var(--text)', fontSize: '0.82rem', outline: 'none'
                }}
              />
            </div>

            {/* Modal Body */}
            <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Highlight Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
                <div style={{ background: 'var(--surface)', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)' }}>Counsellor</div>
                  <div style={{ fontSize: '0.94rem', fontWeight: 800, color: 'var(--primary)', marginTop: '2px' }}>{getRawCounsellor(selectedLead)}</div>
                </div>

                <div style={{ background: 'var(--surface)', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)' }}>Course</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text)', marginTop: '2px' }}>{getRawCourse(selectedLead)}</div>
                </div>

                <div style={{ background: 'var(--surface)', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)' }}>Phone</div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text)', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>{selectedLead.studentPhone || '—'}</div>
                </div>

                <div style={{ background: 'var(--surface)', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)' }}>Amount Paid / Fee</div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#10b981', marginTop: '2px' }}>
                    ₹{(selectedLead.feePaid || 0).toLocaleString()} / ₹{(selectedLead.totalFee || 0).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Record Metadata Table */}
              <div>
                <h3 style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text)', margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Complete Record Fields
                </h3>
                
                <div style={{ border: '1px solid var(--border)', borderRadius: '10px', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                    <thead>
                      <tr style={{ background: 'var(--surface-alt)', borderBottom: '1px solid var(--border)' }}>
                        <th style={{ textAlign: 'left', padding: '8px 12px', width: '38%', color: 'var(--muted)', fontWeight: 800 }}>Field Name</th>
                        <th style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--muted)', fontWeight: 800 }}>Field Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const meta = selectedLead.metadata || {};
                        const entries = Object.entries(meta).filter(([key, val]) => {
                          if (EXCLUDED_FIELDS.has(key)) return false;
                          if (!modalSearch.trim()) return true;
                          const q = modalSearch.toLowerCase();
                          return key.toLowerCase().includes(q) || String(val).toLowerCase().includes(q);
                        });

                        if (entries.length === 0) {
                          return (
                            <tr>
                              <td colSpan={2} style={{ padding: '20px', textAlign: 'center', color: 'var(--muted)' }}>
                                No fields match your search query "{modalSearch}".
                              </td>
                            </tr>
                          );
                        }

                        return entries.map(([key, val], idx) => (
                          <tr key={key} style={{ background: idx % 2 === 0 ? 'var(--surface)' : 'transparent', borderBottom: '1px solid var(--border)' }}>
                            <td style={{ padding: '7px 12px', fontWeight: 700, color: 'var(--text)' }}>
                              {key}
                            </td>
                            <td style={{ padding: '7px 12px', color: val ? 'var(--text)' : 'var(--muted)', fontFamily: String(val).startsWith('+') ? 'var(--font-mono)' : 'inherit' }}>
                              {val !== '' && val !== null && val !== undefined ? cleanId(String(val)) : <em style={{ opacity: 0.5 }}>empty</em>}
                            </td>
                          </tr>
                        ));
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border)', background: 'var(--surface-alt)', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => { setSelectedLead(null); setModalSearch(''); }}
                style={{
                  padding: '8px 22px', borderRadius: '8px',
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  color: 'var(--text)', fontSize: '0.84rem', fontWeight: 700, cursor: 'pointer'
                }}
              >
                Close Record View
              </button>
            </div>

          </div>
        </div>
      )}

    </section>
  );
}
