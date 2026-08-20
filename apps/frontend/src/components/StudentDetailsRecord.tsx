'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { updateStudentDetails, analyzeSessionAudio } from '../actions/walkinActions';
import { COURSES, branches, locations } from '../lib/constants';
import PhoneInput from './PhoneInput';
import AudioPlayerWithAnalyzer from './AudioPlayerWithAnalyzer';

interface Session {
  id: string;
  studentId: string;
  counselorId: string;
  startTime: Date | string | null;
  endTime: Date | string | null;
  duration: number | null;
  status: string;
  notes: string | null;
  followUpStatus: string | null;
  audioUrl?: string | null;
  transcript?: string | null;
  summary?: string | null;
}

interface Student {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  course: string;
  walkinDate: Date | string;
  status: string;
  remarks: string | null;
  source: string;
  details: any;
  sessions: Session[];
  branchName?: string;
  branchId?: string;
}

interface Counselor {
  id: string;
  name: string;
  branchId: string;
  branchName: string;
}

interface StudentDetailsRecordProps {
  student: Student;
  counselors?: Counselor[];
  onClose?: () => void;
  hideHistory?: boolean;
}

function getDetailValue(details: any, possibleKeys: string[], fallback: string = ''): string {
  if (!details || typeof details !== 'object') return fallback;
  for (const key of possibleKeys) {
    if (details[key] !== undefined && details[key] !== null && details[key] !== '') {
      return String(details[key]);
    }
    const keyLower = key.toLowerCase();
    for (const dKey of Object.keys(details)) {
      const dKeyLower = dKey.toLowerCase().replace(/_/g, ' ').replace(/-/g, ' ').trim();
      if (dKeyLower === keyLower || dKey.toLowerCase() === keyLower.replace(/\s+/g, '')) {
        if (details[dKey] !== undefined && details[dKey] !== null && details[dKey] !== '') {
          return String(details[dKey]);
        }
      }
    }
  }
  return fallback;
}

/** Convert "DD/MM/YYYY" or "D-M-YYYY" or ISO string to yyyy-mm-dd for date input */
function toDateInputValue(raw: string): string {
  if (!raw) return '';
  // If already in yyyy-mm-dd
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.slice(0, 10);
  // Try DD/MM/YYYY or DD-MM-YYYY
  const parts = raw.split(/[\/\-]/);
  if (parts.length === 3) {
    if (parts[2].length === 4) return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    if (parts[0].length === 4) return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
  }
  // Try natural date e.g. "15-Oct-2008"
  const d = new Date(raw);
  if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  return '';
}

const GENDER_OPTIONS = [
  { value: '', label: 'Select Gender' },
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
  { value: 'Other', label: 'Other' },
];

const TRAINING_MODE_OPTIONS = [
  { value: '', label: 'Select Mode' },
  { value: 'Offline', label: 'Offline (In-Classroom)' },
  { value: 'Online', label: 'Online (Live Stream)' },
  { value: 'Hybrid', label: 'Hybrid (Blended)' },
];

const STATUS_OPTIONS = [
  { value: 'Waiting', label: 'Waiting' },
  { value: 'Assigned', label: 'Assigned' },
  { value: 'In Session', label: 'In Session' },
  { value: 'Completed', label: 'Completed' },
  { value: 'Follow-up', label: 'Follow-up' },
  { value: 'No Show', label: 'No Show' },
  { value: 'Cancelled', label: 'Cancelled' },
];

const SOURCE_OPTIONS = [
  { value: 'Walk-in', label: 'Walk-in' },
  { value: 'Walk-in Form', label: 'Walk-in Form (Self)' },
  { value: 'Google', label: 'Google' },
  { value: 'Social Media', label: 'Social Media' },
  { value: 'Referral', label: 'Referral' },
  { value: 'Just Dial', label: 'Just Dial' },
  { value: 'Other', label: 'Other' },
];

const fieldStyle: React.CSSProperties = {
  background: 'var(--surface)',
  border: '1.5px solid var(--border)',
  borderRadius: '8px',
  color: 'var(--text)',
  padding: '10px 14px',
  fontSize: '0.86rem',
  fontWeight: 600,
  outline: 'none',
  transition: 'border-color 0.2s, box-shadow 0.2s',
  width: '100%',
  boxSizing: 'border-box' as any,
};

const labelStyle: React.CSSProperties = {
  fontSize: '0.72rem',
  color: 'var(--muted)',
  textTransform: 'uppercase',
  fontWeight: 800,
  letterSpacing: '0.05em',
  margin: '0 0 6px 0',
  display: 'block',
  lineHeight: '1.4',
};

function parseBoldText(text: string): React.ReactNode[] {
  const parts = text.split(/\*\*([^*]+)\*\*/g);
  return parts.map((part, index) => {
    if (index % 2 === 1) {
      return <strong key={index} style={{ color: 'var(--text)', fontWeight: 800 }}>{part}</strong>;
    }
    return part;
  });
}

function renderSummary(summaryText: string) {
  if (!summaryText) return null;

  const lines = summaryText.split('\n').map(l => l.trim()).filter(Boolean);
  const sections: { title: string; icon: string; items: React.ReactNode[] }[] = [];

  lines.forEach(line => {
    // Check if line is a header
    const headerMatch = line.match(/^([^\w\s*]*)\s*\*\*([^*]+)\*\*/);
    if (headerMatch && line.endsWith(':')) {
      const icon = headerMatch[1] || '📌';
      const title = headerMatch[2].replace(/:$/, '').trim();
      sections.push({ title, icon, items: [] });
      return;
    }

    if (sections.length === 0) {
      sections.push({ title: 'Discussion details', icon: '📝', items: [] });
    }

    const lastSection = sections[sections.length - 1];

    if (line.startsWith('-')) {
      const content = line.substring(1).trim();
      const itemMatch = content.match(/^\*\*([^*]+)\*\*\s*:\s*(.*)/);
      if (itemMatch) {
        const key = itemMatch[1];
        const val = itemMatch[2];
        lastSection.items.push(
          <div key={line} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '8px' }}>
            <span style={{
              background: 'rgba(16,185,129,0.08)',
              color: '#10b981',
              padding: '2px 8px',
              borderRadius: '6px',
              fontSize: '0.74rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              whiteSpace: 'nowrap',
              border: '1px solid rgba(16,185,129,0.15)',
              marginTop: '2px'
            }}>
              {key}
            </span>
            <span style={{ fontSize: '0.86rem', color: 'var(--text)', lineHeight: '1.5' }}>
              {parseBoldText(val)}
            </span>
          </div>
        );
      } else {
        lastSection.items.push(
          <div key={line} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '6px', paddingLeft: '4px' }}>
            <span style={{ color: '#10b981', fontSize: '0.9rem', marginTop: '-1px' }}>•</span>
            <span style={{ fontSize: '0.86rem', color: 'var(--text)', lineHeight: '1.5' }}>
              {parseBoldText(content)}
            </span>
          </div>
        );
      }
    } else {
      lastSection.items.push(
        <p key={line} style={{ margin: '4px 0 8px 0', fontSize: '0.86rem', color: 'var(--text)', lineHeight: '1.6' }}>
          {parseBoldText(line)}
        </p>
      );
    }
  });

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginTop: '4px' }}>
      {sections.map((sec, idx) => (
        <div key={idx} style={{
          background: 'rgba(255, 255, 255, 0.015)',
          border: '1.5px solid var(--border)',
          borderRadius: '12px',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
        }}>
          <h4 style={{
            margin: '0 0 12px 0',
            fontSize: '0.82rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: '#10b981',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            borderBottom: '1px solid rgba(16,185,129,0.1)',
            paddingBottom: '8px'
          }}>
            <span style={{ fontSize: '1.1rem' }}>{sec.icon}</span>
            <span>{sec.title}</span>
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            {sec.items}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function StudentDetailsRecord({ student, counselors = [], onClose, hideHistory = false }: StudentDetailsRecordProps) {
  const router = useRouter();
  const counselorBranch = counselors.find(c => c.id === student.sessions?.find(s => s.status !== 'COMPLETED' && s.status !== 'CANCELLED')?.counselorId)?.branchName || '';

  const buildForm = () => ({
    name: student.name,
    phone: student.phone,
    parent_phone: getDetailValue(student.details, ['parent_phone', 'Parent Number', 'Parent_Number']),
    email: student.email || getDetailValue(student.details, ['email', 'email_id', 'Email Address', 'Email']),
    course: student.course,
    source: student.source,
    branchId: student.branchId || getDetailValue(student.details, ['branchId']),
    branchName: student.branchName || counselorBranch || '',
    location: getDetailValue(student.details, ['Location', 'location']),
    remarks: student.remarks || '',
    status: student.status,
    // dates → yyyy-mm-dd for date input
    walkinDate: toDateInputValue(new Date(student.walkinDate).toISOString().slice(0, 10)),
    dob: toDateInputValue(getDetailValue(student.details, ['dob', 'Date of Birth'])),
    // academic
    qualification: getDetailValue(student.details, ['qualification', 'Educational Qualification']),
    college_name: getDetailValue(student.details, ['college_name', 'Institution Name']),
    passout_year: getDetailValue(student.details, ['passout_year', 'Year of Passout']),
    ssc_percentage: getDetailValue(student.details, ['ssc_percentage', '10th %', '10th_Percent']),
    inter_percentage: getDetailValue(student.details, ['inter_percentage', 'Intermediate %', 'Intermediate_Percent']),
    degree_percentage: getDetailValue(student.details, ['degree_percentage', 'B.Tech/Degree %']),
    pg_percentage: getDetailValue(student.details, ['pg_percentage', 'Post Graduation %']),
    // training
    training_mode: getDetailValue(student.details, ['training_mode', 'Mode of Training']),
    reason_for_course: getDetailValue(student.details, ['reason_for_course', 'Why do you want this Course?']),
    discount: getDetailValue(student.details, ['Discount']),
    course_fee: getDetailValue(student.details, ['Course Fee']),
    final_course_fee: getDetailValue(student.details, ['Final Course Fee']),
    duration: getDetailValue(student.details, ['Duration (In Days)']),
    prev_institute: getDetailValue(student.details, ['Previous Training Institute']),
    gender: getDetailValue(student.details, ['Gender']),
    // registration
    form_no: getDetailValue(student.details, ['Form No', 'form_number']),
    walkin_time: getDetailValue(student.details, ['Time', 'walkin_time']),
    know_about_us: getDetailValue(student.details, ['know_about_us', 'How Did You Know About Us']),
    referrer_name: getDetailValue(student.details, ['referrer_name', 'Referrer Name']),
    added_time: getDetailValue(student.details, ['added_time', 'Added Time']),
    added_email_id: getDetailValue(student.details, ['added_email_id', 'Added Email ID']),
    ip: getDetailValue(student.details, ['ip', 'IP Address']),
  });

  const [formData, setFormData] = useState(buildForm);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [showDetails, setShowDetails] = useState<Record<string, boolean>>({});
  const [activeTabs, setActiveTabs] = useState<Record<string, 'summary' | 'transcript'>>({});
  const [analyzing, setAnalyzing] = useState<Record<string, boolean>>({});
  const [analyzeError, setAnalyzeError] = useState<Record<string, string>>({});

  useEffect(() => {
    setFormData(buildForm());
  }, [student, counselorBranch]);

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveDetails = async () => {
    setSaving(true);
    setSaveMsg('');

    // Resolve branchName from branchId if changed
    const resolvedBranchName = branches.find(b => b.id === formData.branchId)?.name || formData.branchName;

    const res = await updateStudentDetails(student.id, {
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      course: formData.course,
      source: formData.source,
      branchName: resolvedBranchName,
      remarks: formData.remarks,
      status: formData.status,
      details: {
        'Educational Qualification': formData.qualification, qualification: formData.qualification,
        'Institution Name': formData.college_name, college_name: formData.college_name,
        'Year of Passout': formData.passout_year, passout_year: formData.passout_year,
        '10th %': formData.ssc_percentage, ssc_percentage: formData.ssc_percentage,
        'Intermediate %': formData.inter_percentage, inter_percentage: formData.inter_percentage,
        'B.Tech/Degree %': formData.degree_percentage, degree_percentage: formData.degree_percentage,
        'Post Graduation %': formData.pg_percentage, pg_percentage: formData.pg_percentage,
        'Date of Birth': formData.dob, dob: formData.dob,
        'Parent Number': formData.parent_phone, parent_phone: formData.parent_phone,
        'Email Address': formData.email, 'Email': formData.email, email: formData.email,
        'Address': '',
        'Mode of Training': formData.training_mode, training_mode: formData.training_mode,
        'Why do you want this Course?': formData.reason_for_course, reason_for_course: formData.reason_for_course,
        'Discount': formData.discount,
        'Course Fee': formData.course_fee,
        'Final Course Fee': formData.final_course_fee,
        'Duration (In Days)': formData.duration,
        'Previous Training Institute': formData.prev_institute,
        'Gender': formData.gender,
        'Form No': formData.form_no,
        'Time': formData.walkin_time, walkin_time: formData.walkin_time,
        'Location': formData.location, location: formData.location,
        'How Did You Know About Us': formData.know_about_us, know_about_us: formData.know_about_us,
        'Referrer Name': formData.referrer_name, referrer_name: formData.referrer_name,
        'Added Time': formData.added_time, added_time: formData.added_time,
        'Added Email ID': formData.added_email_id, added_email_id: formData.added_email_id,
        'IP Address': formData.ip, ip: formData.ip,
        branchId: formData.branchId,
        branchName: resolvedBranchName,
      },
    });

    if (res.success) {
      setSaveMsg('✅ Record details saved successfully!');
      setTimeout(() => { setSaveMsg(''); window.location.reload(); }, 1600);
      router.refresh();
    } else {
      setSaveMsg(`❌ Error: ${res.error || 'Failed to save'}`);
    }
    setSaving(false);
  };

  /* ── Render helpers ─────────────────────────────────────────────────── */
  const renderText = (label: string, field: keyof typeof formData) => (
    <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <label style={labelStyle}>{label}</label>
      <input
        type="text"
        value={formData[field]}
        onChange={e => handleChange(field, e.target.value)}
        style={fieldStyle}
        onFocus={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px var(--primary-glow)'; }}
        onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
      />
    </div>
  );

  const renderEmail = (label: string, field: keyof typeof formData) => (
    <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <label style={labelStyle}>{label}</label>
      <input
        type="email"
        value={formData[field]}
        onChange={e => handleChange(field, e.target.value.toLowerCase())}
        style={fieldStyle}
        onFocus={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px var(--primary-glow)'; }}
        onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
      />
    </div>
  );

  const renderDate = (label: string, field: keyof typeof formData) => (
    <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <label style={labelStyle}>{label}</label>
      <input
        type="date"
        value={formData[field]}
        onChange={e => handleChange(field, e.target.value)}
        style={fieldStyle}
        onFocus={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px var(--primary-glow)'; }}
        onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
      />
    </div>
  );

  const renderSelect = (label: string, field: keyof typeof formData, options: { value: string; label: string }[]) => (
    <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <label style={labelStyle}>{label}</label>
      <select
        value={formData[field]}
        onChange={e => handleChange(field, e.target.value)}
        style={{ ...fieldStyle, cursor: 'pointer' }}
        onFocus={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px var(--primary-glow)'; }}
        onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
      >
        {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
    </div>
  );

  const renderPhone = (label: string, field: keyof typeof formData) => (
    <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <label style={labelStyle}>{label}</label>
      <PhoneInput
        value={formData[field]}
        onChange={v => handleChange(field, v)}
      />
    </div>
  );

  const SectionHeader = ({ title }: { title: string }) => (
    <h3 style={{
      fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase',
      color: 'var(--primary)', letterSpacing: '0.06em',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
      paddingBottom: '6px', marginBottom: '16px', marginTop: 0,
    }}>{title}</h3>
  );

  return (
    <div style={{
      marginTop: 12, padding: '24px',
      background: 'rgba(255,255,255,0.015)',
      border: '1.5px solid var(--border)',
      borderRadius: '16px',
      display: 'flex', flexDirection: 'column', gap: '28px',
    }}>

      {/* ── Academic Profile ── */}
      <div>
        <SectionHeader title="Academic Profile" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '16px' }}>
          {renderText('Educational Qualification', 'qualification')}
          {renderText('Institution Name', 'college_name')}
          {renderText('Year of Passout', 'passout_year')}
          {renderText('10th %', 'ssc_percentage')}
          {renderText('Intermediate %', 'inter_percentage')}
          {renderText('B.Tech / Degree %', 'degree_percentage')}
          {renderText('Post Graduation %', 'pg_percentage')}
        </div>
      </div>

      {/* ── Personal Details ── */}
      <div>
        <SectionHeader title="Personal Details" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          {renderText('Student Name', 'name')}
          {renderPhone('Phone Number', 'phone')}
          {renderPhone('Parent Number', 'parent_phone')}
          {renderEmail('Email Address', 'email')}
          {renderDate('Date of Birth', 'dob')}
          {renderSelect('Gender', 'gender', GENDER_OPTIONS)}
        </div>
      </div>

      {/* ── Training & Course Preferences ── */}
      <div>
        <SectionHeader title="Training & Course Preferences" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          {renderSelect('Mode of Training', 'training_mode', TRAINING_MODE_OPTIONS)}
          {/* Course — searchable dropdown with COURSES list */}
          <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={labelStyle}>Preferred Course</label>
            <select
              value={COURSES.includes(formData.course) ? formData.course : 'Other'}
              onChange={e => {
                if (e.target.value !== 'Other') handleChange('course', e.target.value);
              }}
              style={{ ...fieldStyle, cursor: 'pointer' }}
            >
              <option value="">— Select Course —</option>
              {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {/* Free-text if not in list */}
            {!COURSES.slice(0, -1).includes(formData.course) && (
              <input
                type="text"
                placeholder="Type course name..."
                value={formData.course}
                onChange={e => handleChange('course', e.target.value)}
                style={{ ...fieldStyle, marginTop: '6px', fontSize: '0.82rem' }}
              />
            )}
          </div>
          {renderText('Why this Course', 'reason_for_course')}
          {renderText('Course Fee (₹)', 'course_fee')}
          {renderText('Discount (%)', 'discount')}
          {renderText('Final Course Fee (₹)', 'final_course_fee')}
          {renderText('Duration (In Days)', 'duration')}
          {renderText('Previous Training Institute', 'prev_institute')}
        </div>
      </div>

      {/* ── Registration & Intake Details ── */}
      <div>
        <SectionHeader title="Registration & Intake Details" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          {renderSelect('Lead Status', 'status', STATUS_OPTIONS)}
          {renderSelect('Lead Source', 'source', SOURCE_OPTIONS)}
          {renderText('Form No', 'form_no')}
          {renderDate('Walk-in Date', 'walkinDate')}

          {/* Branch — dropdown */}
          <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={labelStyle}>Walk-in Branch</label>
            <select
              value={formData.branchId || ''}
              onChange={e => {
                const b = branches.find(b => b.id === e.target.value);
                handleChange('branchId', e.target.value);
                if (b) handleChange('branchName', b.name);
              }}
              style={{ ...fieldStyle, cursor: 'pointer' }}
            >
              <option value="">— Select Branch —</option>
              {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>

          {renderText('Time', 'walkin_time')}

          {/* Location — dropdown */}
          <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={labelStyle}>Location</label>
            <select
              value={formData.location}
              onChange={e => handleChange('location', e.target.value)}
              style={{ ...fieldStyle, cursor: 'pointer' }}
            >
              <option value="">— Select Location —</option>
              {locations.map(l => <option key={l.id} value={l.name}>{l.name}</option>)}
            </select>
          </div>

          {renderText('How Did You Know Us', 'know_about_us')}
          {renderText('Referrer Name', 'referrer_name')}
          {renderText('Added Time', 'added_time')}
          {renderText('Added Email ID', 'added_email_id')}
          {renderText('IP Address', 'ip')}
        </div>

        <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={labelStyle}>Intake Remarks</label>
          <textarea
            value={formData.remarks}
            onChange={e => handleChange('remarks', e.target.value)}
            style={{
              ...fieldStyle, height: '100px', resize: 'vertical',
            }}
            onFocus={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px var(--primary-glow)'; }}
            onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
          />
        </div>
      </div>

      {/* ── Counselling Sessions History ── */}
      {!hideHistory && student.sessions && student.sessions.length > 0 && student.sessions.some(s => s.status === 'COMPLETED' || s.status === 'CANCELLED') && (
        <div>
          <SectionHeader title="Counselling Sessions History" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[...student.sessions].reverse().map((sess) => {
              const isActive = sess.status === 'IN_SESSION' || sess.status === 'ASSIGNED';
              if (isActive) return null; // Only show completed sessions here

              return (
                <div key={sess.id} style={{
                  background: 'var(--surface)',
                  border: '1.5px solid var(--border)',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text)' }}>
                      📅 Session Completed &nbsp;·&nbsp; <code style={{ fontSize: '0.74rem', color: 'var(--muted)' }}>#{sess.id.slice(-8).toUpperCase()}</code>
                    </div>
                    {sess.duration && (
                      <span style={{ fontSize: '0.74rem', color: 'var(--muted)', background: 'rgba(255,255,255,0.03)', padding: '2px 8px', borderRadius: '6px', border: '1px solid var(--border)' }}>
                        Duration: {Math.floor(sess.duration / 60)}m {sess.duration % 60}s
                      </span>
                    )}
                  </div>

                  {sess.notes && (
                    <div style={{
                      fontSize: '0.86rem',
                      color: 'var(--text)',
                      lineHeight: 1.6,
                      whiteSpace: 'pre-wrap',
                      background: 'rgba(255,255,255,0.01)',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid rgba(255,255,255,0.02)'
                    }}>
                      <div style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '4px' }}>
                        Notes
                      </div>
                      {sess.notes}
                    </div>
                  )}

                  {sess.audioUrl && (
                    <div style={{
                      padding: '16px 20px',
                      borderTop: '1px solid rgba(255,255,255,0.04)',
                      background: 'linear-gradient(135deg, rgba(99,102,241,0.04) 0%, rgba(16,185,129,0.02) 100%)',
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '16px',
                      marginTop: '8px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{
                          fontSize: '1.2rem',
                          background: 'rgba(99,102,241,0.08)',
                          padding: '8px',
                          borderRadius: '10px',
                          border: '1px solid rgba(99,102,241,0.15)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>🎙️</span>
                        <div>
                          <div style={{ fontSize: '0.76rem', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--primary)' }}>
                            Session Recording
                          </div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--muted)', marginTop: '2px' }}>
                            Recorded audio from this counseling session
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                        <AudioPlayerWithAnalyzer src={sess.audioUrl} />
                        
                        {(!sess.transcript || !sess.summary) && (
                          <button
                            type="button"
                            disabled={analyzing[sess.id]}
                            onClick={async () => {
                              setAnalyzing(prev => ({ ...prev, [sess.id]: true }));
                              setAnalyzeError(prev => ({ ...prev, [sess.id]: '' }));
                              const r = await analyzeSessionAudio(sess.id);
                              if (r.success) {
                                router.refresh();
                                setTimeout(() => window.location.reload(), 800);
                              } else {
                                setAnalyzeError(prev => ({ ...prev, [sess.id]: r.error || 'Failed to analyze.' }));
                              }
                              setAnalyzing(prev => ({ ...prev, [sess.id]: false }));
                            }}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '8px 16px',
                              borderRadius: '20px',
                              background: 'linear-gradient(135deg, #a855f7, #6366f1)',
                              color: '#fff',
                              fontSize: '0.78rem',
                              fontWeight: 800,
                              border: 'none',
                              cursor: 'pointer',
                              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                              boxShadow: '0 4px 12px rgba(168,85,247,0.3)',
                              opacity: analyzing[sess.id] ? 0.6 : 1,
                              pointerEvents: analyzing[sess.id] ? 'none' : 'auto',
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.transform = 'translateY(-1px)';
                              e.currentTarget.style.boxShadow = '0 6px 16px rgba(168,85,247,0.45)';
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = '0 4px 12px rgba(168,85,247,0.3)';
                            }}
                          >
                            {analyzing[sess.id] ? '⏳ Analyzing...' : '🪄 Analyze & Transcribe'}
                          </button>
                        )}
                        
                        {(sess.transcript || sess.summary) && (
                          <button
                            type="button"
                            onClick={() => {
                              setShowDetails(prev => ({ ...prev, [sess.id]: !prev[sess.id] }));
                              if (!activeTabs[sess.id]) {
                                setActiveTabs(prev => ({ ...prev, [sess.id]: sess.summary ? 'summary' : 'transcript' }));
                              }
                            }}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '8px 16px',
                              borderRadius: '20px',
                              background: showDetails[sess.id] ? 'linear-gradient(135deg, #4f46e5, #6366f1)' : 'rgba(99,102,241,0.06)',
                              color: showDetails[sess.id] ? '#fff' : '#818cf8',
                              fontSize: '0.78rem',
                              fontWeight: 800,
                              border: '1px solid rgba(99,102,241,0.25)',
                              cursor: 'pointer',
                              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                              boxShadow: showDetails[sess.id] ? '0 4px 12px rgba(99,102,241,0.3)' : 'none'
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.transform = 'translateY(-1px)';
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.transform = 'translateY(0)';
                            }}
                          >
                            📋 {showDetails[sess.id] ? 'Hide Analysis' : 'Show Analysis'}
                          </button>
                        )}

                        <a
                          href={sess.audioUrl}
                          download={`session-${sess.id}.webm`}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '8px 16px',
                            borderRadius: '20px',
                            background: 'rgba(255,255,255,0.03)',
                            color: 'var(--text)',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            textDecoration: 'none',
                            border: '1px solid var(--border)',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.background = 'var(--text)';
                            e.currentTarget.style.color = 'var(--card-bg)';
                            e.currentTarget.style.transform = 'translateY(-1px)';
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                            e.currentTarget.style.color = 'var(--text)';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }}
                        >
                          Download
                        </a>
                      </div>
                      
                      {analyzeError[sess.id] && (
                        <div style={{ color: '#ef4444', fontSize: '0.72rem', marginTop: '4px', width: '100%' }}>
                          ⚠️ {analyzeError[sess.id]}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Unified Analysis Details Panel — full width */}
                  {(sess.transcript || sess.summary) && showDetails[sess.id] && (
                    <div style={{
                      padding: '20px 24px',
                      borderTop: '1px solid var(--border)',
                      background: 'rgba(255, 255, 255, 0.015)',
                      borderBottom: '1px solid var(--border)',
                      borderRadius: '8px',
                      marginTop: '8px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '16px'
                    }}>
                      {/* Tab Bar */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                        paddingBottom: '12px'
                      }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {sess.summary && (
                            <button
                              type="button"
                              onClick={() => setActiveTabs(prev => ({ ...prev, [sess.id]: 'summary' }))}
                              style={{
                                background: (activeTabs[sess.id] || 'summary') === 'summary'
                                  ? 'rgba(16,185,129,0.12)'
                                  : 'transparent',
                                color: (activeTabs[sess.id] || 'summary') === 'summary'
                                  ? '#10b981'
                                  : 'var(--muted)',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '6px 14px',
                                fontSize: '0.8rem',
                                fontWeight: 800,
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                              }}
                            >
                              🪄 Summary
                            </button>
                          )}
                          {sess.transcript && (
                            <button
                              type="button"
                              onClick={() => setActiveTabs(prev => ({ ...prev, [sess.id]: 'transcript' }))}
                              style={{
                                background: (activeTabs[sess.id] || 'summary') === 'transcript'
                                  ? 'rgba(99,102,241,0.12)'
                                  : 'transparent',
                                color: (activeTabs[sess.id] || 'summary') === 'transcript'
                                  ? '#818cf8'
                                  : 'var(--muted)',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '6px 14px',
                                fontSize: '0.8rem',
                                fontWeight: 800,
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                              }}
                            >
                              🎙️ Transcript
                            </button>
                          )}
                        </div>
                        
                        <button
                          type="button"
                          onClick={() => setShowDetails(prev => ({ ...prev, [sess.id]: false }))}
                          style={{
                            background: 'rgba(239, 68, 68, 0.06)',
                            border: '1px solid rgba(239, 68, 68, 0.15)',
                            color: '#ef4444',
                            cursor: 'pointer',
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            padding: '4px 10px',
                            borderRadius: '6px',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = '#fff'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.06)'; e.currentTarget.style.color = '#ef4444'; }}
                        >
                          ✕ Close
                        </button>
                      </div>

                      {/* Content Area */}
                      <div>
                        {(activeTabs[sess.id] || 'summary') === 'summary' && sess.summary && (
                          <div>
                            <div style={{ fontSize: '0.74rem', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#10b981', marginBottom: '12px' }}>
                              🪄 Audio Session Summary
                            </div>
                            {renderSummary(sess.summary)}
                          </div>
                        )}
                        {(activeTabs[sess.id] || 'summary') === 'transcript' && sess.transcript && (
                          <div>
                            <div style={{ fontSize: '0.74rem', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#818cf8', marginBottom: '12px' }}>
                              🎙️ Session Transcript
                            </div>
                            <p style={{
                              margin: 0, fontSize: '0.86rem', color: 'var(--text)',
                              lineHeight: 1.65, whiteSpace: 'pre-wrap',
                              background: 'rgba(0,0,0,0.15)', padding: '14px', borderRadius: '10px',
                              border: '1px solid var(--border)'
                            }}>
                              {sess.transcript}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Save Button ── */}
      <div style={{
        borderTop: '1px solid var(--border)', paddingTop: '18px',
        display: 'flex', alignItems: 'center', gap: '14px', justifyContent: 'flex-end',
      }}>
        {saveMsg && (
          <span style={{
            fontSize: '0.86rem', fontWeight: 700,
            color: saveMsg.startsWith('✅') ? '#10b981' : '#ef4444',
          }}>{saveMsg}</span>
        )}
        <button
          type="button"
          onClick={handleSaveDetails}
          disabled={saving}
          style={{
            background: 'linear-gradient(135deg, #10b981, #059669)',
            border: 'none', borderRadius: '10px', color: '#fff',
            cursor: saving ? 'not-allowed' : 'pointer',
            fontSize: '0.88rem', fontWeight: 700,
            padding: '11px 24px',
            opacity: saving ? 0.6 : 1,
            boxShadow: '0 4px 14px rgba(16,185,129,0.25)',
            transition: 'opacity 0.2s, transform 0.15s',
          }}
          onMouseEnter={e => { if (!saving) e.currentTarget.style.transform = 'translateY(-1px)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          {saving ? 'Saving Details...' : 'Save Profile Details'}
        </button>
      </div>
    </div>
  );
}
