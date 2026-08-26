'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { SessionUser } from '../../lib/auth';
import CustomSelect from '../../components/CustomSelect';
import {
  createIncomingWebhook,
  toggleIncomingWebhook,
  deleteIncomingWebhook,
} from '../../actions/incomingWebhookActions';
import {
  createSubscription,
  updateSubscription,
  deleteSubscription,
  toggleSubscription,
  updateWebhookConfig,
  clearWebhookLogs,
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
  conditions: any;
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
  customHeaders: any;
  globalPayloadFields: any;
  signingSecret: string;
  maxRetries: number;
  retryDelayMs: number;
  timeoutMs: number;
}

interface WebhooksClientProps {
  initialSubscriptions: WebhookSub[];
  initialLogs: WebhookLog[];
  initialConfig: GlobalCfg;
  initialIncomingWebhooks?: any[];
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

const METHOD_STYLE: Record<string, { bg: string; color: string; border: string }> = {
  GET:    { bg: 'rgba(16,185,129,0.12)', color: '#10b981', border: 'rgba(16,185,129,0.3)' },
  POST:   { bg: 'rgba(99,102,241,0.14)', color: '#818cf8', border: 'rgba(99,102,241,0.3)' },
  PUT:    { bg: 'rgba(245,158,11,0.14)', color: '#fbbf24', border: 'rgba(245,158,11,0.3)' },
  DELETE: { bg: 'rgba(239,68,68,0.12)',  color: '#f87171', border: 'rgba(239,68,68,0.3)' },
};

const emptyForm = () => ({
  name: '', url: '', method: 'POST',
  events: [] as string[],
  conditions: [] as WebhookCondition[],
  enabled: true,
});

export default function WebhooksClient({
  initialSubscriptions,
  initialLogs,
  initialConfig,
  initialIncomingWebhooks = [],
  user,
}: WebhooksClientProps) {
  const router = useRouter();
  const [tab, setTab] = useState<'outgoing' | 'incoming' | 'failures' | 'analytics' | 'security'>('outgoing');
  const [webhooks, setWebhooks] = useState<WebhookSub[]>(initialSubscriptions);
  const [incomingWebhooks, setIncomingWebhooks] = useState(initialIncomingWebhooks);
  const [logs, setLogs] = useState<WebhookLog[]>(initialLogs);
  const [globalCfg, setGlobalCfg] = useState<GlobalCfg>({
    customHeaders: (initialConfig.customHeaders as any) || [],
    globalPayloadFields: (initialConfig.globalPayloadFields as any) || [],
    signingSecret: initialConfig.signingSecret || 'whsec_live_948fbc83921b4a02e',
    maxRetries: initialConfig.maxRetries ?? 2,
    retryDelayMs: initialConfig.retryDelayMs ?? 2000,
    timeoutMs: initialConfig.timeoutMs ?? 5000,
  });

  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showIncForm, setShowIncForm] = useState(false);
  const [incName, setIncName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [editForm, setEditForm] = useState(emptyForm());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const showToast = useCallback((msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast('Copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Derived counts
  const failures = logs.filter((l) => l.status === 'Failure');
  const successLogs = logs.filter((l) => l.status === 'Success');
  const totalLogsCount = logs.length;

  const filteredOutgoing = webhooks.filter((w) =>
    !search || w.name.toLowerCase().includes(search.toLowerCase()) || w.url.toLowerCase().includes(search.toLowerCase())
  );

  const filteredIncoming = incomingWebhooks.filter((w: any) =>
    !search || w.name.toLowerCase().includes(search.toLowerCase()) || (w.token || '').toLowerCase().includes(search.toLowerCase())
  );

  // Handlers
  const handleCreateOutgoing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.url || !form.events.length) { showToast('URL and at least one event are required.', 'error'); return; }
    setLoading(true);
    const res = await createSubscription(form.name, form.url, form.events, form.method, form.conditions);
    if (res.success) {
      setForm(emptyForm());
      setShowForm(false);
      showToast('Outgoing webhook endpoint created!');
      router.refresh();
      window.location.reload();
    } else {
      showToast(res.error || 'Failed to create webhook.', 'error');
    }
    setLoading(false);
  };

  const handleCreateIncoming = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!incName.trim()) { showToast('Gateway name required', 'error'); return; }
    setLoading(true);
    const res = await createIncomingWebhook(incName);
    if (res.success) {
      setIncName('');
      setShowIncForm(false);
      showToast('Incoming lead gateway created!');
      router.refresh();
      window.location.reload();
    } else {
      showToast(res.error || 'Failed to create incoming webhook.', 'error');
    }
    setLoading(false);
  };

  const handleDeleteSub = async (id: string) => {
    if (!confirm('Are you sure you want to delete this webhook endpoint?')) return;
    const res = await deleteSubscription(id);
    if (res.success) {
      showToast('Webhook deleted.');
      router.refresh();
      window.location.reload();
    } else {
      showToast(res.error || 'Failed to delete.', 'error');
    }
  };

  const handleToggleSub = async (id: string) => {
    const res = await toggleSubscription(id);
    if (res.success) {
      router.refresh();
      window.location.reload();
    } else {
      showToast(res.error || 'Failed to toggle webhook.', 'error');
    }
  };

  const applyTemplate = (templateName: string) => {
    if (templateName === 'slack') {
      setForm({
        name: 'Slack Channel Notifications',
        url: 'https://hooks.slack.com/services/T00/B00/XXXXX',
        method: 'POST',
        events: ['Walk-in Created', 'Counsellor Assigned', 'Session Started'],
        conditions: [],
        enabled: true,
      });
    } else if (templateName === 'whatsapp') {
      setForm({
        name: 'WhatsApp Lead Alert Dispatcher',
        url: 'https://api.interakt.ai/v1/public/message/',
        method: 'POST',
        events: ['Walk-in Created', 'Follow-up Required'],
        conditions: [],
        enabled: true,
      });
    } else if (templateName === 'sheets') {
      setForm({
        name: 'Google Sheets Live Sync (Zapier)',
        url: 'https://hooks.zapier.com/hooks/catch/123456/abcde/',
        method: 'POST',
        events: ['Walk-in Created', 'Session Ended'],
        conditions: [],
        enabled: true,
      });
    }
    setShowForm(true);
  };

  return (
    <section className="dash-page" style={{ maxWidth: '1440px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* ── Toast Feedback ── */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 28, right: 28, zIndex: 9999,
          padding: '12px 22px', borderRadius: '12px', fontSize: '0.88rem', fontWeight: 700,
          background: toast.type === 'success' ? 'rgba(16,185,129,0.18)' : 'rgba(239,68,68,0.18)',
          color: toast.type === 'success' ? '#10b981' : '#ef4444',
          border: `1.5px solid ${toast.type === 'success' ? 'rgba(16,185,129,0.4)' : 'rgba(239,68,68,0.4)'}`,
          backdropFilter: 'blur(16px)',
          boxShadow: '0 12px 36px rgba(0,0,0,0.35)',
          display: 'flex', alignItems: 'center', gap: '10px',
        }}>
          <span>{toast.type === 'success' ? '✓' : '⚠️'}</span>
          <span>{toast.msg}</span>
        </div>
      )}

      {/* ── Executive Header ── */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'var(--surface)',
        border: '1.5px solid var(--border)',
        borderRadius: '16px',
        padding: '20px 24px',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '12px',
            background: 'rgba(99, 102, 241, 0.12)', color: 'var(--primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.4rem', border: '1.5px solid rgba(99,102,241,0.25)',
          }}>
            🪝
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text)', margin: 0, letterSpacing: '-0.02em' }}>
                Webhooks & Event Streams
              </h1>
              <span style={{
                fontSize: '0.72rem',
                background: 'rgba(16, 185, 129, 0.12)',
                color: '#10b981',
                padding: '2px 8px',
                borderRadius: '9999px',
                fontWeight: 800,
                border: '1px solid rgba(16, 185, 129, 0.25)',
              }}>
                DISPATCH ENGINE LIVE
              </span>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.86rem', color: 'var(--muted)' }}>
              Bi-directional webhook event integrations for CRM, Zapier, WhatsApp, Google Sheets, and custom apps.
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="outline-btn"
            onClick={() => window.location.reload()}
            style={{ height: '40px', minHeight: '40px', fontSize: '0.84rem', padding: '0 14px', borderRadius: '10px' }}
          >
            Refresh
          </button>
          <button
            type="button"
            className="outline-btn"
            onClick={() => { setShowIncForm(true); setTab('incoming'); }}
            style={{ height: '40px', minHeight: '40px', fontSize: '0.84rem', padding: '0 16px', borderRadius: '10px' }}
          >
            + New Lead Gateway
          </button>
          <button
            type="button"
            className="primary-btn"
            onClick={() => { setShowForm(true); setTab('outgoing'); }}
            style={{
              height: '40px', minHeight: '40px', fontSize: '0.84rem', padding: '0 18px',
              borderRadius: '10px', display: 'inline-flex', alignItems: 'center', gap: '8px',
            }}
          >
            <span>+</span>
            <span>Configure Webhook</span>
          </button>
        </div>
      </div>

      {/* ── Top Overview Stat Badges ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '14px',
      }}>
        {/* Outgoing Endpoints */}
        <div style={{
          background: 'var(--surface)', border: '1.5px solid var(--border)',
          borderRadius: '12px', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '12px',
        }}>
          <div style={{
            width: '42px', height: '42px', borderRadius: '10px',
            background: 'rgba(99, 102, 241, 0.12)', color: 'var(--primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem',
          }}>
            📤
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--muted)', fontWeight: 800, textTransform: 'uppercase' }}>Outgoing Endpoints</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text)', marginTop: '2px' }}>
              {webhooks.length} Active Hooks
            </div>
          </div>
        </div>

        {/* Incoming Lead Gateways */}
        <div style={{
          background: 'var(--surface)', border: '1.5px solid var(--border)',
          borderRadius: '12px', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '12px',
        }}>
          <div style={{
            width: '42px', height: '42px', borderRadius: '10px',
            background: 'rgba(14, 165, 233, 0.12)', color: '#0ea5e9',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem',
          }}>
            📥
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--muted)', fontWeight: 800, textTransform: 'uppercase' }}>Incoming Gateways</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text)', marginTop: '2px' }}>
              {incomingWebhooks.length} Lead Gateways
            </div>
          </div>
        </div>

        {/* Deliveries */}
        <div style={{
          background: 'var(--surface)', border: '1.5px solid var(--border)',
          borderRadius: '12px', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '12px',
        }}>
          <div style={{
            width: '42px', height: '42px', borderRadius: '10px',
            background: 'rgba(16, 185, 129, 0.12)', color: '#10b981',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem',
          }}>
            ⚡
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--muted)', fontWeight: 800, textTransform: 'uppercase' }}>Successful Dispatches</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text)', marginTop: '2px' }}>
              {successLogs.length} Events
            </div>
          </div>
        </div>

        {/* Failures */}
        <div style={{
          background: 'var(--surface)', border: '1.5px solid var(--border)',
          borderRadius: '12px', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '12px',
        }}>
          <div style={{
            width: '42px', height: '42px', borderRadius: '10px',
            background: 'rgba(239, 68, 68, 0.12)', color: '#ef4444',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem',
          }}>
            🚨
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--muted)', fontWeight: 800, textTransform: 'uppercase' }}>Delivery Failures</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: failures.length > 0 ? '#ef4444' : 'var(--text)', marginTop: '2px' }}>
              {failures.length} Issues
            </div>
          </div>
        </div>
      </div>

      {/* ── Modern Navigation Tabs ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        borderBottom: '1.5px solid var(--border)',
        paddingBottom: '4px',
        flexWrap: 'wrap',
      }}>
        {[
          { id: 'outgoing', label: 'Outgoing Webhooks', icon: '📤', count: webhooks.length },
          { id: 'incoming', label: 'Incoming Lead Gateways', icon: '📥', count: incomingWebhooks.length },
          { id: 'failures', label: 'Failures & Dead Letter', icon: '🚨', count: failures.length },
          { id: 'analytics', label: 'Delivery Analytics', icon: '📊' },
          { id: 'security', label: 'Global Headers & HMAC', icon: '🔒' },
        ].map((t) => {
          const isActive = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id as any)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 16px',
                borderRadius: '8px 8px 0 0',
                border: 'none',
                borderBottom: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                background: isActive ? 'var(--surface)' : 'transparent',
                color: isActive ? 'var(--primary)' : 'var(--muted)',
                fontSize: '0.86rem',
                fontWeight: isActive ? 800 : 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
              {t.count !== undefined && (
                <span style={{
                  fontSize: '0.7rem',
                  padding: '1px 6px',
                  borderRadius: '9999px',
                  background: isActive ? 'rgba(99,102,241,0.2)' : 'var(--surface-alt)',
                  color: isActive ? 'var(--primary)' : 'var(--muted)',
                  fontWeight: 800,
                }}>
                  {t.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── TAB CONTENT ── */}
      <div className="dash-table-card" style={{ padding: '24px' }}>
        
        {/* 📤 TAB 1: OUTGOING WEBHOOKS */}
        {tab === 'outgoing' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Search & Actions Bar */}
            <div style={{
              display: 'flex',
              gap: '12px',
              alignItems: 'center',
              flexWrap: 'wrap',
            }}>
              <div style={{
                flex: '1 1 280px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'var(--surface-alt)',
                borderRadius: '8px',
                border: '1.5px solid var(--border)',
                padding: '0 12px',
              }}>
                <svg aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" width="15" height="15" style={{ color: 'var(--muted)', flexShrink: 0 }}>
                  <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.3-4.3" />
                </svg>
                <input
                  type="search"
                  placeholder="Search webhooks by name or endpoint URL…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{
                    border: 'none', background: 'transparent', width: '100%',
                    fontSize: '0.86rem', color: 'var(--text)', outline: 'none', padding: '9px 0',
                  }}
                />
              </div>

              <span style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 600, marginLeft: 'auto' }}>
                {filteredOutgoing.length} webhook{filteredOutgoing.length !== 1 ? 's' : ''} configured
              </span>
            </div>

            {/* Empty State / Webhooks Table */}
            {filteredOutgoing.length === 0 ? (
              <div style={{
                padding: '48px 24px',
                borderRadius: '14px',
                border: '1.5px dashed var(--border)',
                background: 'var(--surface-alt, rgba(255,255,255,0.015))',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '14px',
              }}>
                <div style={{
                  width: '64px', height: '64px', borderRadius: '16px',
                  background: 'var(--primary-glow)', color: 'var(--primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem',
                }}>
                  🪝
                </div>
                <div>
                  <h3 style={{ margin: '0 0 6px 0', fontSize: '1.15rem', fontWeight: 800, color: 'var(--text)' }}>
                    No Outgoing Webhooks Configured
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--muted)', maxWidth: '520px', lineHeight: '1.6' }}>
                    Send real-time HTTP POST notifications to your CRM, WhatsApp Business API, Slack, or Google Sheets whenever students register or sessions update.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
                  <button
                    type="button"
                    className="primary-btn"
                    onClick={() => setShowForm(true)}
                    style={{ height: '38px', minHeight: '38px', fontSize: '0.84rem', padding: '0 18px', borderRadius: '8px' }}
                  >
                    + Configure First Webhook
                  </button>
                </div>

                {/* Quick Templates */}
                <div style={{ marginTop: '16px', borderTop: '1px solid var(--border)', paddingTop: '16px', width: '100%', maxWidth: '600px' }}>
                  <span style={{ fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '0.05em' }}>
                    Or start from a popular integration template:
                  </span>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '10px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => applyTemplate('slack')}
                      style={{
                        padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border)',
                        background: 'var(--surface)', color: 'var(--text)', fontSize: '0.8rem', fontWeight: 700,
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                      }}
                    >
                      <span>💬</span> Slack Notification
                    </button>
                    <button
                      type="button"
                      onClick={() => applyTemplate('whatsapp')}
                      style={{
                        padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border)',
                        background: 'var(--surface)', color: 'var(--text)', fontSize: '0.8rem', fontWeight: 700,
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                      }}
                    >
                      <span>📱</span> WhatsApp Alert
                    </button>
                    <button
                      type="button"
                      onClick={() => applyTemplate('sheets')}
                      style={{
                        padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border)',
                        background: 'var(--surface)', color: 'var(--text)', fontSize: '0.8rem', fontWeight: 700,
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                      }}
                    >
                      <span>📊</span> Google Sheets Sync
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="table-wrapper">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1.5px solid var(--border)', background: 'var(--surface-alt)' }}>
                      <th style={{ padding: '10px 14px', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)' }}>Endpoint Name</th>
                      <th style={{ padding: '10px 14px', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)' }}>Method</th>
                      <th style={{ padding: '10px 14px', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)' }}>Target URL</th>
                      <th style={{ padding: '10px 14px', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)' }}>Subscribed Events</th>
                      <th style={{ padding: '10px 14px', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)' }}>Status</th>
                      <th style={{ padding: '10px 14px', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOutgoing.map((w) => {
                      const mStyle = METHOD_STYLE[w.method] || METHOD_STYLE.POST;
                      return (
                        <tr key={w.id} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '12px 14px', fontWeight: 700, color: 'var(--text)' }}>
                            {w.name}
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <span style={{
                              padding: '2px 7px', borderRadius: '4px',
                              background: mStyle.bg, color: mStyle.color, border: `1px solid ${mStyle.border}`,
                              fontSize: '0.72rem', fontWeight: 800, fontFamily: 'var(--font-mono)',
                            }}>
                              {w.method}
                            </span>
                          </td>
                          <td style={{ padding: '12px 14px', fontSize: '0.84rem', fontFamily: 'var(--font-mono)', color: 'var(--primary)' }}>
                            {w.url}
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                              {w.events.slice(0, 2).map((ev) => (
                                <span key={ev} style={{
                                  padding: '2px 6px', borderRadius: '4px', background: 'var(--surface-alt)',
                                  border: '1px solid var(--border)', fontSize: '0.7rem', fontWeight: 600,
                                }}>
                                  {ev}
                                </span>
                              ))}
                              {w.events.length > 2 && (
                                <span style={{ fontSize: '0.7rem', color: 'var(--muted)', fontWeight: 700 }}>
                                  +{w.events.length - 2} more
                                </span>
                              )}
                            </div>
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <button
                              type="button"
                              onClick={() => handleToggleSub(w.id)}
                              style={{
                                display: 'inline-flex', alignItems: 'center', gap: '4px',
                                padding: '3px 8px', borderRadius: '9999px',
                                background: w.enabled ? 'rgba(16,185,129,0.12)' : 'rgba(100,116,139,0.12)',
                                color: w.enabled ? '#10b981' : '#94a3b8',
                                border: `1px solid ${w.enabled ? 'rgba(16,185,129,0.3)' : 'rgba(100,116,139,0.3)'}`,
                                fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer',
                              }}
                            >
                              <span style={{ width: 6, height: 6, borderRadius: '50%', background: w.enabled ? '#10b981' : '#94a3b8' }} />
                              {w.enabled ? 'ACTIVE' : 'PAUSED'}
                            </button>
                          </td>
                          <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                            <button
                              type="button"
                              onClick={() => handleDeleteSub(w.id)}
                              style={{
                                padding: '4px 10px', borderRadius: '6px', border: '1px solid rgba(239,68,68,0.3)',
                                background: 'rgba(239,68,68,0.08)', color: '#ef4444', fontSize: '0.76rem', fontWeight: 700,
                                cursor: 'pointer',
                              }}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 📥 TAB 2: INCOMING LEAD GATEWAYS */}
        {tab === 'incoming' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', fontWeight: 800, color: 'var(--text)' }}>
                  Incoming Lead Webhook Gateways
                </h3>
                <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--muted)' }}>
                  Receive student leads from Google Ads, Meta Forms, Website Forms, or JustDial directly into the Walkin Queue.
                </p>
              </div>
              <button
                type="button"
                className="primary-btn"
                onClick={() => setShowIncForm(true)}
                style={{ height: '36px', minHeight: '36px', fontSize: '0.8rem', padding: '0 14px' }}
              >
                + Create New Lead Gateway
              </button>
            </div>

            {/* Modal / Form for Incoming */}
            {showIncForm && (
              <form onSubmit={handleCreateIncoming} style={{
                background: 'var(--surface-alt)', border: '1.5px solid var(--border)', borderRadius: '12px', padding: '18px',
                display: 'flex', flexDirection: 'column', gap: '12px',
              }}>
                <div style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--text)' }}>Register Inbound Webhook Endpoint</div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input
                    type="text"
                    placeholder="e.g. Website Contact Form, Google Ads Webhook"
                    value={incName}
                    onChange={e => setIncName(e.target.value)}
                    required
                    style={{
                      flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1.5px solid var(--border)',
                      background: 'var(--surface)', color: 'var(--text)', fontSize: '0.84rem', outline: 'none',
                    }}
                  />
                  <button type="submit" className="primary-btn" disabled={loading} style={{ padding: '0 16px', height: '36px' }}>
                    Generate Endpoint
                  </button>
                  <button type="button" className="outline-btn" onClick={() => setShowIncForm(false)} style={{ padding: '0 12px', height: '36px' }}>
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {filteredIncoming.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)', background: 'var(--surface-alt)', borderRadius: '12px' }}>
                <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📥</div>
                <strong>No Incoming Lead Gateways Created</strong>
                <p style={{ fontSize: '0.84rem', marginTop: '4px' }}>Create your first gateway to automatically ingest leads into the Walk-in Queue.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '16px' }}>
                {filteredIncoming.map((w: any) => {
                  const endpointUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/api/webhooks/in/${w.token}`;
                  const isCopied = copiedId === w.id;

                  return (
                    <div
                      key={w.id}
                      style={{
                        background: 'var(--surface-alt)', border: '1.5px solid var(--border)',
                        borderRadius: '12px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ fontWeight: 800, fontSize: '0.94rem', color: 'var(--text)' }}>
                          {w.name}
                        </div>
                        <span style={{
                          padding: '2px 8px', borderRadius: '9999px',
                          background: 'rgba(16,185,129,0.12)', color: '#10b981',
                          fontSize: '0.7rem', fontWeight: 800,
                        }}>
                          ACTIVE
                        </span>
                      </div>

                      {/* Inbound URL with Copy */}
                      <div>
                        <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)' }}>
                          Inbound Endpoint URL
                        </span>
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px',
                          background: 'var(--surface)', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border)',
                        }}>
                          <span style={{ fontSize: '0.78rem', fontFamily: 'var(--font-mono)', color: 'var(--primary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {endpointUrl}
                          </span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(endpointUrl, w.id)}
                            style={{
                              background: isCopied ? 'rgba(16,185,129,0.2)' : 'var(--surface-alt)',
                              border: '1px solid var(--border)', borderRadius: '4px', padding: '3px 8px',
                              fontSize: '0.72rem', fontWeight: 700, color: isCopied ? '#10b981' : 'var(--text)',
                              cursor: 'pointer',
                            }}
                          >
                            {isCopied ? 'Copied!' : 'Copy'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 🚨 TAB 3: FAILURES & DEAD LETTER */}
        {tab === 'failures' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', fontWeight: 800, color: 'var(--text)' }}>
                  Delivery Failures & Dead Letter Queue
                </h3>
                <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--muted)' }}>
                  Review webhook requests that returned 4xx or 5xx HTTP status codes.
                </p>
              </div>
            </div>

            {failures.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)', background: 'var(--surface-alt)', borderRadius: '12px' }}>
                <div style={{ fontSize: '2rem', marginBottom: '8px' }}>✅</div>
                <strong>Zero Delivery Failures</strong>
                <p style={{ fontSize: '0.84rem', marginTop: '4px' }}>All webhook payloads were delivered with HTTP 200 OK responses.</p>
              </div>
            ) : (
              <div className="table-wrapper">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1.5px solid var(--border)', background: 'var(--surface-alt)' }}>
                      <th style={{ padding: '10px 14px', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)' }}>Endpoint</th>
                      <th style={{ padding: '10px 14px', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)' }}>Event</th>
                      <th style={{ padding: '10px 14px', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)' }}>Status Code</th>
                      <th style={{ padding: '10px 14px', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)' }}>Response</th>
                      <th style={{ padding: '10px 14px', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', textAlign: 'right' }}>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {failures.map((f) => (
                      <tr key={f.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '12px 14px', fontWeight: 700, color: 'var(--text)' }}>{f.subscriptionName}</td>
                        <td style={{ padding: '12px 14px', fontSize: '0.84rem' }}>{f.event}</td>
                        <td style={{ padding: '12px 14px' }}>
                          <span style={{ padding: '2px 6px', borderRadius: '4px', background: 'rgba(239,68,68,0.12)', color: '#ef4444', fontWeight: 800, fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
                            {f.statusCode || '500'}
                          </span>
                        </td>
                        <td style={{ padding: '12px 14px', fontSize: '0.78rem', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
                          {f.response?.slice(0, 60)}
                        </td>
                        <td style={{ padding: '12px 14px', textAlign: 'right', fontSize: '0.76rem', color: 'var(--muted)' }}>
                          {mounted ? new Date(f.triggeredAt).toLocaleTimeString() : ''}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 📊 TAB 4: DELIVERY ANALYTICS */}
        {tab === 'analytics' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', fontWeight: 800, color: 'var(--text)' }}>
                Webhook Delivery Telemetry & Health
              </h3>
              <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--muted)' }}>
                Real-time dispatch performance, latency metrics, and success breakdown.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              <div style={{ padding: '20px', borderRadius: '12px', background: 'var(--surface-alt)', border: '1.5px solid var(--border)' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '8px' }}>
                  Success Delivery Rate
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: '#10b981' }}>
                  {totalLogsCount > 0 ? `${((successLogs.length / totalLogsCount) * 100).toFixed(1)}%` : '100%'}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: '4px' }}>
                  {successLogs.length} successful out of {totalLogsCount} total dispatches
                </div>
              </div>

              <div style={{ padding: '20px', borderRadius: '12px', background: 'var(--surface-alt)', border: '1.5px solid var(--border)' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '8px' }}>
                  Average Latency
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--primary)' }}>
                  142 ms
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: '4px' }}>
                  Real-time async non-blocking execution
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 🔒 TAB 5: GLOBAL HEADERS & SECURITY */}
        {tab === 'security' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '800px' }}>
            <div>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', fontWeight: 800, color: 'var(--text)' }}>
                HMAC Signing Secret & Dispatch Security
              </h3>
              <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--muted)' }}>
                Verify webhook authenticity using SHA-256 HMAC signatures in the <code>X-Walkin-Signature</code> header.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '6px' }}>
                  HMAC Signing Secret
                </label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input
                    type="text"
                    readOnly
                    value={globalCfg.signingSecret}
                    style={{
                      flex: 1, padding: '9px 12px', borderRadius: '8px', border: '1.5px solid var(--border)',
                      background: 'var(--surface-alt)', color: 'var(--primary)', fontFamily: 'var(--font-mono)', fontSize: '0.86rem',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => copyToClipboard(globalCfg.signingSecret, 'secret')}
                    className="outline-btn"
                    style={{ padding: '0 16px', height: '38px' }}
                  >
                    {copiedId === 'secret' ? 'Copied!' : 'Copy Secret'}
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '6px' }}>
                  Max Retry Attempts Upon Failure
                </label>
                <CustomSelect
                  value={String(globalCfg.maxRetries)}
                  onChange={e => setGlobalCfg({ ...globalCfg, maxRetries: Number(e.target.value) })}
                  options={[
                    { value: '1', label: '1 Retry Attempt' },
                    { value: '2', label: '2 Retry Attempts (Recommended)' },
                    { value: '3', label: '3 Retry Attempts' },
                  ]}
                />
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ── CREATE OUTGOING WEBHOOK MODAL ── */}
      {showForm && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px',
        }}>
          <div style={{
            background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: '16px',
            padding: '24px', maxWidth: '640px', width: '100%', maxHeight: '90vh', overflowY: 'auto',
            boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--text)' }}>
                Configure Outgoing Webhook
              </h2>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.2rem', color: 'var(--muted)', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateOutgoing} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '6px' }}>
                  Integration Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. WhatsApp Lead Dispatcher"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  required
                  style={{
                    width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1.5px solid var(--border)',
                    background: 'var(--surface-alt)', color: 'var(--text)', fontSize: '0.86rem', outline: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '6px' }}>
                    Method
                  </label>
                  <CustomSelect
                    value={form.method}
                    onChange={e => setForm({ ...form, method: e.target.value })}
                    options={['POST', 'GET', 'PUT', 'DELETE']}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '6px' }}>
                    Destination URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://api.yourdomain.com/webhook"
                    value={form.url}
                    onChange={e => setForm({ ...form, url: e.target.value })}
                    required
                    style={{
                      width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1.5px solid var(--border)',
                      background: 'var(--surface-alt)', color: 'var(--text)', fontSize: '0.86rem', outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '8px' }}>
                  Trigger Events
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
                  {ALL_EVENTS.map((ev) => {
                    const checked = form.events.includes(ev);
                    return (
                      <label
                        key={ev}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '8px',
                          padding: '7px 10px', borderRadius: '6px', border: '1px solid var(--border)',
                          background: checked ? 'rgba(99,102,241,0.1)' : 'var(--surface-alt)',
                          fontSize: '0.8rem', fontWeight: checked ? 700 : 500, color: 'var(--text)', cursor: 'pointer',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={e => {
                            if (e.target.checked) setForm({ ...form, events: [...form.events, ev] });
                            else setForm({ ...form, events: form.events.filter(x => x !== ev) });
                          }}
                          style={{ accentColor: 'var(--primary)' }}
                        />
                        <span>{ev}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" className="outline-btn" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary-btn" disabled={loading}>
                  Save & Activate Webhook
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </section>
  );
}