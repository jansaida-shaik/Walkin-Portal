'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { SessionUser } from '../../lib/auth';
import {
  createSubscription,
  updateSubscription,
  deleteSubscription,
  toggleSubscription,
  updateWebhookConfig,
  clearWebhookLogs
} from '../../actions/webhookActions';

interface WebhookCondition {
  field: string;
  operator: string;
  value: string;
}

interface WebhookSub {
  id: string;
  name: string;
  url: string;
  method: string;
  events: string[];
  conditions: any; // json/array
  enabled: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

interface WebhookLog {
  id: string;
  subscriptionId: string;
  subscriptionName: string;
  url: string;
  method: string;
  event: string;
  conditionsMatched: boolean;
  conditionDetails: string;
  payload: any;
  status: string;
  statusCode?: number | null;
  response: string;
  retryCount: number;
  triggeredAt: Date | string;
  durationMs: number;
}

interface GlobalCfg {
  customHeaders: any; // json
  globalPayloadFields: any; // json
  signingSecret: string;
  maxRetries: number;
  retryDelayMs: number;
  timeoutMs: number;
}

interface WebhooksClientProps {
  initialSubscriptions: WebhookSub[];
  initialLogs: WebhookLog[];
  initialConfig: GlobalCfg;
  user: SessionUser | null;
}

const EVENT_GROUPS: Record<string, string[]> = {
  'Walk-in Lifecycle': ['Walk-in Created', 'Walk-in Updated', 'Walk-in Cancelled', 'Walk-in No-Show', 'Follow-up Required', 'Token Generated'],
  'Assignment & Queue': ['Counsellor Assigned', 'Queue Updated'],
  'Session Lifecycle': ['Session Started', 'Session Ended', 'Session Timeout'],
  'Counsellor Availability': ['Counsellor Available', 'Counsellor Busy', 'Counsellor Offline'],
  'General': ['Status Changed'],
};
const ALL_EVENTS = Object.values(EVENT_GROUPS).flat();

const COND_FIELDS = [
  { value: 'status', label: 'Walk-in Status' },
  { value: 'branch', label: 'Branch' },
  { value: 'source', label: 'Source' },
  { value: 'counselorName', label: 'Counsellor Name' },
  { value: 'purpose', label: 'Course / Purpose' },
  { value: 'priority', label: 'Priority' },
  { value: 'waitTime', label: 'Wait Time (min)' },
];
const COND_OPS = [
  { value: 'equals', label: 'equals' },
  { value: 'not_equals', label: 'not equals' },
  { value: 'contains', label: 'contains' },
  { value: 'not_contains', label: 'does not contain' },
  { value: 'greater_than', label: 'greater than' },
  { value: 'less_than', label: 'less than' },
];

const METHOD_STYLE: Record<string, { bg: string; color: string }> = {
  GET:    { bg: 'rgba(16,185,129,0.12)', color: '#10b981' },
  POST:   { bg: 'rgba(99,102,241,0.14)', color: '#818cf8' },
  PUT:    { bg: 'rgba(245,158,11,0.14)', color: '#fbbf24' },
  DELETE: { bg: 'rgba(239,68,68,0.12)',  color: '#f87171' },
};

const FAILURE_REASONS: Record<string, string> = {
  '404': 'Page not found',
  '400': 'Bad request',
  '401': 'Unauthorized',
  '403': 'Webhook blocked due to security reason',
  '500': 'Server error',
  'timeout': 'Socket timeout',
  'Network error / Timeout': 'Socket timeout',
};

function getFailureReason(response: string): string {
  for (const [k, v] of Object.entries(FAILURE_REASONS)) {
    if (response.includes(k)) return v;
  }
  return response.slice(0, 60) || 'Unknown error';
}

function DonutChart({ data, label, size = 140 }: {
  data: Array<{ label: string; value: number; color: string }>;
  label: string; size?: number;
}) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return <div style={{ width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.3, fontSize: '0.8rem' }}>No data</div>;

  const r = 42;
  const cx = 60;
  const cy = 60;
  const circ = 2 * Math.PI * r;

  let cumPct = 0;
  const segments = data.map((d) => {
    const pct = d.value / total;
    const dash = pct * circ;
    const offset = circ - cumPct * circ;
    cumPct += pct;
    return { ...d, dash, offset };
  });

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
      <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
        <svg viewBox="0 0 120 120" width={size} height={size}>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="18" />
          {segments.map((seg, i) => (
            <circle
              key={i}
              cx={cx} cy={cy} r={r}
              fill="none"
              stroke={seg.color}
              strokeWidth="18"
              strokeDasharray={`${seg.dash} ${circ - seg.dash}`}
              strokeDashoffset={seg.offset}
              strokeLinecap="butt"
              style={{ transform: 'rotate(-90deg)', transformOrigin: `${cx}px ${cy}px`, transition: 'stroke-dasharray 0.5s ease' }}
            />
          ))}
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '0.62rem', opacity: 0.5, textAlign: 'center', lineHeight: 1.3 }}>{label}</span>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        {data.map((d) => (
          <div key={d.label} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
            <span style={{ opacity: 0.8, whiteSpace: 'nowrap' }}>{d.label}</span>
            <span style={{ marginLeft: 'auto', fontWeight: 600, opacity: 0.9, paddingLeft: '8px' }}>
              {total > 0 ? `${((d.value / total) * 100).toFixed(1)}%` : '0%'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

const emptyForm = () => ({
  name: '', url: '', method: 'POST',
  events: [] as string[],
  conditions: [] as WebhookCondition[],
  enabled: true,
});
const emptyCond = (): WebhookCondition => ({ field: 'status', operator: 'equals', value: '' });

export default function WebhooksClient({ initialSubscriptions, initialLogs, initialConfig, user }: WebhooksClientProps) {
  const router = useRouter();
  const [tab, setTab] = useState<'webhooks' | 'failures' | 'usage' | 'globalfields'>('webhooks');
  const [webhooks, setWebhooks] = useState<WebhookSub[]>(initialSubscriptions);
  const [logs, setLogs] = useState<WebhookLog[]>(initialLogs);
  const [globalCfg, setGlobalCfg] = useState<GlobalCfg>({
    customHeaders: (initialConfig.customHeaders as any) || [],
    globalPayloadFields: (initialConfig.globalPayloadFields as any) || [],
    signingSecret: initialConfig.signingSecret || '',
    maxRetries: initialConfig.maxRetries ?? 1,
    retryDelayMs: initialConfig.retryDelayMs ?? 2000,
    timeoutMs: initialConfig.timeoutMs ?? 5000
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [msgOk, setMsgOk] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [editForm, setEditForm] = useState(emptyForm());
  const [expandedLog, setExpandedLog] = useState<string | null>(null);
  const [usageDate, setUsageDate] = useState('Today');

  const showMsg = (m: string, ok = true) => { setMsg(m); setMsgOk(ok); setTimeout(() => setMsg(''), 4000); };

  // Derived data
  const failures = logs.filter((l) => l.status === 'Failure');
  const successLogs = logs.filter((l) => l.status === 'Success');
  const skippedLogs = logs.filter((l) => l.status === 'Skipped');

  const filteredWebhooks = webhooks.filter((w) =>
    !search || w.name.toLowerCase().includes(search.toLowerCase()) || w.url.toLowerCase().includes(search.toLowerCase())
  );

  const eventCounts: Record<string, number> = {};
  logs.forEach((l) => { eventCounts[l.event] = (eventCounts[l.event] || 0) + 1; });

  const subCounts: Record<string, number> = {};
  logs.forEach((l) => { subCounts[l.subscriptionName] = (subCounts[l.subscriptionName] || 0) + 1; });

  const DONUT_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#f87171', '#a855f7', '#38bdf8', '#fb923c', '#4ade80'];

  const eventDonutData = Object.entries(eventCounts).slice(0, 6).map(([label, value], i) => ({
    label, value, color: DONUT_COLORS[i % DONUT_COLORS.length],
  }));

  const subDonutData = Object.entries(subCounts).slice(0, 6).map(([label, value], i) => ({
    label, value, color: DONUT_COLORS[i % DONUT_COLORS.length],
  }));

  const DAILY_LIMIT = 16000;
  const totalToday = logs.length;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.url || !form.events.length) { showMsg('URL and at least one event are required.', false); return; }
    setLoading(true);
    const res = await createSubscription(form.name, form.url, form.events, form.method, form.conditions);
    if (res.success) {
      setForm(emptyForm());
      setShowForm(false);
      showMsg('Webhook registered successfully.');
      router.refresh();
      window.location.reload();
    } else {
      showMsg(res.error || 'Failed to create webhook.', false);
    }
    setLoading(false);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId || !editForm.url || !editForm.events.length) { showMsg('URL and at least one event are required.', false); return; }
    setLoading(true);
    const res = await updateSubscription(editingId, editForm.name, editForm.url, editForm.events, editForm.method, editForm.conditions, editForm.enabled);
    if (res.success) {
      setEditingId(null);
      showMsg('Webhook updated.');
      router.refresh();
      window.location.reload();
    } else {
      showMsg(res.error || 'Failed to update webhook.', false);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this webhook?')) return;
    const res = await deleteSubscription(id);
    if (res.success) {
      if (editingId === id) setEditingId(null);
      showMsg('Deleted.');
      router.refresh();
      window.location.reload();
    } else {
      showMsg(res.error || 'Failed to delete webhook.', false);
    }
  };

  const handleToggle = async (id: string) => {
    const res = await toggleSubscription(id);
    if (res.success) {
      router.refresh();
      window.location.reload();
    } else {
      showMsg(res.error || 'Failed to toggle webhook.', false);
    }
  };

  const startEdit = (sub: WebhookSub) => {
    setEditingId(sub.id);
    const condList = typeof sub.conditions === 'string' ? JSON.parse(sub.conditions) : (sub.conditions || []);
    setEditForm({
      name: sub.name,
      url: sub.url,
      method: sub.method,
      events: [...sub.events],
      conditions: condList,
      enabled: sub.enabled
    });
    setShowForm(false);
  };

  const handleGlobalCfgSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await updateWebhookConfig(globalCfg);
    if (res.success) {
      showMsg('Global configuration saved.');
      router.refresh();
    } else {
      showMsg(res.error || 'Failed to update config.', false);
    }
    setLoading(false);
  };

  const handleClearLogsClick = async () => {
    if (!confirm('Clear all delivery logs?')) return;
    const res = await clearWebhookLogs();
    if (res.success) {
      showMsg('Logs cleared.');
      router.refresh();
      window.location.reload();
    }
  };

  const toggleEvt = (evt: string, list: string[], setList: (v: string[]) => void) =>
    setList(list.includes(evt) ? list.filter(e => e !== evt) : [...list, evt]);

  const setHeadersList = (v: any) => setGlobalCfg({ ...globalCfg, customHeaders: v });
  const setPayloadFieldsList = (v: any) => setGlobalCfg({ ...globalCfg, globalPayloadFields: v });

  // CSS Styles inline helper
  const inp = { width: '100%', padding: '7px 11px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', fontSize: '0.85rem' };
  const smInp = { ...inp, padding: '5px 9px', fontSize: '0.8rem' };

  const CondBuilder = ({ conds, setConds }: { conds: WebhookCondition[]; setConds: (v: WebhookCondition[]) => void }) => (
    <div style={{ marginTop: '4px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <span style={{ fontSize: '0.82rem', fontWeight: 600, opacity: 0.85 }}>
          Conditions <span style={{ fontWeight: 400, opacity: 0.5 }}>(AND — all must pass)</span>
        </span>
        <button type="button" onClick={() => setConds([...conds, emptyCond()])}
          style={{ fontSize: '0.75rem', padding: '3px 9px', border: '1px solid var(--border)', borderRadius: '4px', background: 'transparent', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}>
          + Add
        </button>
      </div>
      {conds.length === 0 && <p style={{ fontSize: '0.78rem', opacity: 0.4, margin: 0 }}>No conditions — always fires.</p>}
      {conds.map((c, i) => (
        <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.2fr 1fr auto', gap: '5px', marginBottom: '5px' }}>
          <select value={c.field} onChange={e => { const n=[...conds]; n[i]={...n[i],field:e.target.value}; setConds(n); }} style={smInp}>
            {COND_FIELDS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>
          <select value={c.operator} onChange={e => { const n=[...conds]; n[i]={...n[i],operator:e.target.value}; setConds(n); }} style={smInp}>
            {COND_OPS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <input type="text" placeholder="value" value={c.value} onChange={e => { const n=[...conds]; n[i]={...n[i],value:e.target.value}; setConds(n); }} style={smInp} />
          <button type="button" onClick={() => setConds(conds.filter((_,idx)=>idx!==i))}
            style={{ background: 'rgba(239,68,68,0.1)', border: 'none', borderRadius: '4px', padding: '5px 8px', cursor: 'pointer', color: '#f87171', fontWeight: 700, fontSize: '0.82rem' }}>✕</button>
        </div>
      ))}
    </div>
  );

  const EventSel = ({ sel, setSel }: { sel: string[]; setSel: (v: string[]) => void }) => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <span style={{ fontSize: '0.82rem', fontWeight: 600, opacity: 0.85 }}>Events <span style={{ color: '#f87171' }}>*</span></span>
        <div style={{ display: 'flex', gap: '5px' }}>
          <button type="button" onClick={() => setSel(ALL_EVENTS)} style={{ fontSize: '0.7rem', padding: '2px 7px', border: '1px solid var(--border)', borderRadius: '3px', background: 'transparent', color: 'var(--primary)', cursor: 'pointer' }}>All</button>
          <button type="button" onClick={() => setSel([])} style={{ fontSize: '0.7rem', padding: '2px 7px', border: '1px solid var(--border)', borderRadius: '3px', background: 'transparent', color: 'var(--text)', cursor: 'pointer' }}>None</button>
        </div>
      </div>
      {Object.entries(EVENT_GROUPS).map(([grp, evts]) => (
        <div key={grp} style={{ marginBottom: '8px' }}>
          <p style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', opacity: 0.4, margin: '0 0 3px 0' }}>{grp}</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px' }}>
            {evts.map(evt => (
              <label key={evt} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.8rem', padding: '3px 4px', borderRadius: '4px', background: sel.includes(evt) ? 'var(--primary-glow)' : 'transparent' }}>
                <input type="checkbox" checked={sel.includes(evt)} onChange={() => toggleEvt(evt, sel, setSel)} style={{ width: 'auto', padding: 0, margin: 0, accentColor: 'var(--primary)' }} />
                <span>{evt}</span>
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  const KVList = ({ label, items, setItems, kp, vp }: { label: string; items: { key: string; value: string }[]; setItems: (v: { key: string; value: string }[]) => void; kp?: string; vp?: string }) => (
    <div style={{ marginBottom: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '7px' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{label}</span>
        <button type="button" onClick={() => setItems([...items, { key: '', value: '' }])}
          style={{ fontSize: '0.74rem', padding: '3px 9px', border: '1px solid var(--border)', borderRadius: '4px', background: 'transparent', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}>+ Add</button>
      </div>
      {items.length === 0 && <p style={{ fontSize: '0.78rem', opacity: 0.4, margin: 0 }}>None configured.</p>}
      {items.map((item, i) => (
        <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '5px', marginBottom: '5px' }}>
          <input type="text" value={item.key} placeholder={kp || 'Key'} onChange={e => { const n=[...items]; n[i]={...n[i],key:e.target.value}; setItems(n); }} style={smInp} />
          <input type="text" value={item.value} placeholder={vp || 'Value'} onChange={e => { const n=[...items]; n[i]={...n[i],value:e.target.value}; setItems(n); }} style={smInp} />
          <button type="button" onClick={() => setItems(items.filter((_,idx)=>idx!==i))}
            style={{ background: 'rgba(239,68,68,0.1)', border: 'none', borderRadius: '4px', padding: '5px 8px', cursor: 'pointer', color: '#f87171', fontWeight: 700, fontSize: '0.82rem' }}>✕</button>
        </div>
      ))}
    </div>
  );

  const WebhookFormPanel = ({
    f, setF, title, onSubmit, onCancel, submitLabel
  }: { f: typeof form; setF: (v: typeof form) => void; title: string; onSubmit: (e: React.FormEvent) => void; onCancel: () => void; submitLabel: string }) => (
    <div className="wh-form-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
      <div className="wh-form-panel" style={{ background: 'var(--card-bg)', padding: '24px', borderRadius: '12px', minWidth: '450px', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
        <div className="wh-form-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>{title}</h2>
          <button type="button" onClick={onCancel} style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: 'var(--text)', opacity: 0.5 }}>✕</button>
        </div>
        <div className="wh-form-body">
          <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600, fontSize: '0.85rem' }}>Webhook Name</label>
              <input type="text" placeholder="e.g. CRM Walk-in Listener" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} style={inp} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600, fontSize: '0.85rem' }}>URL to Notify <span style={{ color: '#f87171' }}>*</span></label>
              <input type="url" placeholder="https://yourserver.com/webhook" value={f.url} required onChange={e => setF({ ...f, url: e.target.value })} style={inp} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.85rem' }}>HTTP Method</label>
              <div style={{ display: 'flex', gap: '6px' }}>
                {['POST', 'GET', 'PUT', 'DELETE'].map(m => {
                  const s = METHOD_STYLE[m];
                  return (
                    <button key={m} type="button" onClick={() => setF({ ...f, method: m })} style={{ padding: '5px 14px', borderRadius: '6px', border: `1.5px solid ${f.method === m ? s.color : 'var(--border)'}`, background: f.method === m ? s.bg : 'transparent', color: f.method === m ? s.color : 'var(--text)', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}>
                      {m}
                    </button>
                  );
                })}
              </div>
            </div>
            <EventSel sel={f.events} setSel={v => setF({ ...f, events: v })} />
            <CondBuilder conds={f.conditions} setConds={v => setF({ ...f, conditions: v })} />
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
              <input type="checkbox" checked={f.enabled} onChange={e => setF({ ...f, enabled: e.target.checked })} style={{ width: 'auto', padding: 0, margin: 0, accentColor: 'var(--primary)' }} />
              <span style={{ fontWeight: 600 }}>Active</span>
            </label>
            <div style={{ display: 'flex', gap: '8px', paddingTop: '10px' }}>
              <button type="submit" className="primary-btn" disabled={loading} style={{ flex: 1 }}>
                {loading ? 'Saving...' : submitLabel}
              </button>
              <button type="button" onClick={onCancel} className="outline-btn" style={{ flex: 1 }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  return (
    <section className="wh-page">
      <div style={{ marginBottom: '16px' }}>
        <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800 }}>Webhooks</h1>
        <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', opacity: 0.55 }}>
          Webhooks let you communicate with third-party applications by sending instant web notifications when a particular event occurs.
        </p>
      </div>

      {msg && (
        <div style={{ padding: '9px 14px', borderRadius: '7px', marginBottom: '14px', background: msgOk ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: msgOk ? '#10b981' : '#f87171', border: `1px solid ${msgOk ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`, fontSize: '0.85rem', fontWeight: 600 }}>
          {msg}
        </div>
      )}

      {/* Tab Bar */}
      <div className="wh-tab-bar" style={{ display: 'flex', gap: '10px', borderBottom: '1px solid var(--border)', marginBottom: '20px', paddingBottom: '8px' }}>
        {(['webhooks', 'failures', 'usage', 'globalfields'] as const).map(t => {
          const labels: Record<string, string> = { webhooks: 'Webhooks', failures: `Failures${failures.length ? ` (${failures.length})` : ''}`, usage: 'Usage', globalfields: 'Global Fields' };
          return (
            <button key={t} onClick={() => setTab(t)} className={`outline-btn ${tab === t ? 'active' : ''}`} style={{ background: tab === t ? 'var(--primary-glow)' : 'transparent', color: tab === t ? 'var(--primary)' : 'var(--text)', border: tab === t ? '1.5px solid var(--primary)' : '1px solid var(--border)', padding: '6px 16px', borderRadius: '6px', cursor: 'pointer' }}>
              {labels[t]}
            </button>
          );
        })}
      </div>

      {/* WEBHOOKS TAB */}
      {tab === 'webhooks' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ position: 'relative', width: '300px' }}>
              <input type="search" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)' }} />
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="outline-btn" onClick={() => router.refresh()} style={{ fontSize: '0.82rem', padding: '6px 12px' }}>↻ Refresh</button>
              <button className="primary-btn" onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyForm()); }} style={{ fontSize: '0.85rem', padding: '7px 18px' }}>
                + Configure Webhook
              </button>
            </div>
          </div>

          <div className="dash-table-card">
            <div className="table-wrapper">
              <table style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Events</th>
                    <th>URL To Notify</th>
                    <th>Method</th>
                    <th>Status</th>
                    <th>Modified On</th>
                    <th style={{ width: '90px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredWebhooks.length ? filteredWebhooks.map((sub) => (
                    <tr key={sub.id} style={{ opacity: sub.enabled ? 1 : 0.55 }}>
                      <td>
                        <button
                          onClick={() => startEdit(sub)}
                          style={{ background: 'none', border: 'none', color: '#818cf8', fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer', textAlign: 'left', padding: 0 }}
                        >
                          {sub.name || 'Untitled'}
                        </button>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px', maxWidth: '220px' }}>
                          {sub.events.slice(0, 3).map(e => (
                            <span key={e} style={{ fontSize: '0.7rem', background: 'var(--primary-glow)', color: 'var(--primary)', padding: '1px 5px', borderRadius: '3px' }}>{e}</span>
                          ))}
                          {sub.events.length > 3 && (
                            <span style={{ fontSize: '0.7rem', opacity: 0.55 }}>+{sub.events.length - 3} more</span>
                          )}
                        </div>
                      </td>
                      <td style={{ maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sub.url}</td>
                      <td>
                        <span style={{ background: METHOD_STYLE[sub.method]?.bg || METHOD_STYLE.POST.bg, color: METHOD_STYLE[sub.method]?.color || METHOD_STYLE.POST.color, padding: '2px 7px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700 }}>
                          {sub.method}
                        </span>
                      </td>
                      <td>
                        <span style={{ background: sub.enabled ? 'rgba(16,185,129,0.1)' : 'rgba(156,163,175,0.1)', color: sub.enabled ? '#10b981' : '#9ca3af', padding: '2px 7px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700 }}>
                          {sub.enabled ? 'Active' : 'Paused'}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.78rem', opacity: 0.65 }}>
                        {mounted ? new Date(sub.updatedAt).toLocaleDateString() : ''}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '5px' }}>
                          <button onClick={() => startEdit(sub)} title="Edit" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem' }}>✏️</button>
                          <button onClick={() => handleToggle(sub.id)} title={sub.enabled ? 'Pause' : 'Enable'} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem' }}>{sub.enabled ? '⏸' : '▶️'}</button>
                          <button onClick={() => handleDelete(sub.id)} title="Delete" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem' }}>🗑️</button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan={7} className="empty-row">No webhooks configured.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* FAILURES TAB */}
      {tab === 'failures' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
            <button className="outline-btn" onClick={() => router.refresh()} style={{ fontSize: '0.82rem', padding: '6px 12px' }}>↻ Refresh</button>
          </div>

          <div className="dash-table-card">
            <div className="table-wrapper">
              <table style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Webhook</th>
                    <th>Event</th>
                    <th>Method</th>
                    <th>Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {failures.length ? failures.map((log) => (
                    <>
                      <tr key={log.id} style={{ cursor: 'pointer' }} onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}>
                        <td style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                          {mounted ? new Date(log.triggeredAt).toLocaleString() : ''}
                        </td>
                        <td>
                          <button style={{ background: 'none', border: 'none', color: '#818cf8', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', padding: 0 }}>
                            {log.subscriptionName}
                          </button>
                        </td>
                        <td>{log.event}</td>
                        <td>
                          <span style={{ fontSize: '0.72rem', background: 'var(--primary-glow)', color: 'var(--primary)', padding: '2px 6px', borderRadius: '3px' }}>
                            {log.method}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.82rem', color: '#f87171', fontWeight: 500 }}>
                          {getFailureReason(log.response)}
                        </td>
                      </tr>
                      {expandedLog === log.id && (
                        <tr key={`${log.id}-exp`}>
                          <td colSpan={5} style={{ padding: '12px 16px', background: 'rgba(239,68,68,0.04)', borderTop: '1px solid rgba(239,68,68,0.12)' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.8rem' }}>
                              <div>
                                <strong>URL:</strong> <span style={{ opacity: 0.7, wordBreak: 'break-all' }}>{log.url}</span><br />
                                <strong>Method:</strong> {log.method}<br />
                                {log.statusCode && <><strong>HTTP Status:</strong> {log.statusCode}<br /></>}
                                <strong>Full Response:</strong> <span style={{ opacity: 0.7 }}>{log.response}</span><br />
                                <strong>Retries:</strong> {log.retryCount}<br />
                                <strong>Duration:</strong> {log.durationMs}ms
                              </div>
                              <div>
                                <strong>Condition Details:</strong> <span style={{ opacity: 0.7 }}>{log.conditionDetails}</span><br />
                                <strong>Payload:</strong>
                                <pre style={{ fontSize: '0.72rem', background: 'var(--bg)', padding: '6px', borderRadius: '4px', overflow: 'auto', maxHeight: '100px', marginTop: '3px' }}>
                                  {JSON.stringify(log.payload, null, 2)}
                                </pre>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  )) : (
                    <tr><td colSpan={5} className="empty-row">No failures recorded.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* USAGE TAB */}
      {tab === 'usage' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="dash-table-card" style={{ padding: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
              <div>
                <h3 style={{ fontSize: '0.88rem', fontWeight: 700, opacity: 0.6, textTransform: 'uppercase', marginBottom: '16px' }}>Events Distribution</h3>
                <DonutChart
                  label={`${logs.length} total`}
                  data={eventDonutData.length ? eventDonutData : [{ label: 'No data', value: 1, color: 'rgba(255,255,255,0.1)' }]}
                  size={150}
                />
              </div>
              <div>
                <h3 style={{ fontSize: '0.88rem', fontWeight: 700, opacity: 0.6, textTransform: 'uppercase', marginBottom: '16px' }}>Webhooks Distribution</h3>
                <DonutChart
                  label={`${webhooks.length} endpoints`}
                  data={subDonutData.length ? subDonutData : [{ label: 'No data', value: 1, color: 'rgba(255,255,255,0.1)' }]}
                  size={150}
                />
              </div>
            </div>

            <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.88rem', opacity: 0.8 }}>
                  <strong>{totalToday}</strong> out of <strong>{DAILY_LIMIT}</strong> webhooks for today used
                </span>
                <span style={{ fontSize: '0.82rem', opacity: 0.55 }}>{((totalToday / DAILY_LIMIT) * 100).toFixed(2)}%</span>
              </div>
              <div style={{ height: '8px', background: 'rgba(255,255,255,0.07)', borderRadius: '999px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${Math.min((totalToday / DAILY_LIMIT) * 100, 100)}%`,
                  background: '#10b981',
                  borderRadius: '999px'
                }} />
              </div>
              <div style={{ display: 'flex', gap: '16px', marginTop: '10px' }}>
                {[{ label: 'Success', count: successLogs.length, color: '#10b981' }, { label: 'Failures', count: failures.length, color: '#f87171' }, { label: 'Skipped', count: skippedLogs.length, color: '#9ca3af' }].map(s => (
                  <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.82rem' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.color }} />
                    <span style={{ opacity: 0.7 }}>{s.label}:</span>
                    <strong style={{ color: s.color }}>{s.count}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* GLOBAL FIELDS TAB */}
      {tab === 'globalfields' && (
        <form onSubmit={handleGlobalCfgSave} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
            <div className="dash-table-card" style={{ padding: '20px' }}>
              <h3 style={{ marginTop: 0, fontSize: '1rem', marginBottom: '4px' }}>Custom HTTP Headers</h3>
              <p style={{ fontSize: '0.8rem', opacity: 0.55, margin: '0 0 14px 0' }}>
                Sent with every outgoing webhook. Use for Authorization, API keys, etc.
              </p>
              <KVList label="Headers" items={globalCfg.customHeaders} setItems={setHeadersList} kp="Header Name" vp="Value" />
            </div>
            <div className="dash-table-card" style={{ padding: '20px' }}>
              <h3 style={{ marginTop: 0, fontSize: '1rem', marginBottom: '4px' }}>Global Payload Fields</h3>
              <p style={{ fontSize: '0.8rem', opacity: 0.55, margin: '0 0 14px 0' }}>
                Extra fields merged into every webhook payload body.
              </p>
              <KVList label="Payload Fields" items={globalCfg.globalPayloadFields} setItems={setPayloadFieldsList} kp="Field Name" vp="Value" />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
            <div className="dash-table-card" style={{ padding: '20px' }}>
              <h3 style={{ marginTop: 0, fontSize: '1rem', marginBottom: '4px' }}>Security & Request Signing</h3>
              <p style={{ fontSize: '0.8rem', opacity: 0.55, margin: '0 0 14px 0' }}>
                HMAC-SHA256 signature added as X-Webhook-Signature to every request.
              </p>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600, fontSize: '0.85rem' }}>Signing Secret</label>
              <input type="password" placeholder="Leave empty to disable signing" value={globalCfg.signingSecret} onChange={e => setGlobalCfg({ ...globalCfg, signingSecret: e.target.value })} style={inp} />
            </div>
            <div className="dash-table-card" style={{ padding: '20px' }}>
              <h3 style={{ marginTop: 0, fontSize: '1rem', marginBottom: '4px' }}>Retry & Timeout Settings</h3>
              <p style={{ fontSize: '0.8rem', opacity: 0.55, margin: '0 0 14px 0' }}>
                Controls retry behavior on failed deliveries and timeout limits.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { label: 'Max Retries on Failure', key: 'maxRetries', min: 0, max: 5, step: 1 },
                  { label: 'Retry Delay (ms)', key: 'retryDelayMs', min: 500, max: 30000, step: 500 },
                  { label: 'Request Timeout (ms)', key: 'timeoutMs', min: 1000, max: 30000, step: 1000 },
                ].map(({ label, key, min, max, step }) => (
                  <div key={key}>
                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: 600, fontSize: '0.82rem' }}>{label}</label>
                    <input type="number" min={min} max={max} step={step} value={(globalCfg as any)[key]} onChange={e => setGlobalCfg({ ...globalCfg, [key]: Number(e.target.value) })} style={inp} />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button type="submit" className="primary-btn" disabled={loading} style={{ minWidth: '200px' }}>
              {loading ? 'Saving...' : '💾 Save Global Configuration'}
            </button>
            <button type="button" onClick={handleClearLogsClick} className="outline-btn" style={{ background: 'var(--danger)', color: '#fff', border: 'none' }}>
              🗑️ Clear Delivery Logs
            </button>
          </div>
        </form>
      )}

      {/* Slide-in Form Panel */}
      {(showForm || editingId) && (
        editingId ? (
          <WebhookFormPanel
            f={editForm} setF={setEditForm}
            title="Edit Webhook"
            onSubmit={handleUpdate}
            onCancel={() => setEditingId(null)}
            submitLabel="✓ Save Changes"
          />
        ) : (
          <WebhookFormPanel
            f={form} setF={setForm}
            title="Configure Webhook"
            onSubmit={handleCreate}
            onCancel={() => setShowForm(false)}
            submitLabel="+ Register Endpoint"
          />
        )
      )}
    </section>
  );
}
