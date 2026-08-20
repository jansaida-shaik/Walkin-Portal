import crypto from 'crypto';
import { prisma } from './db';

function signPayload(body: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(body).digest('hex');
}

function evaluateCondition(condition: any, payload: any): boolean {
  const data = payload?.data || payload || {};
  const walkin = data.walkin || data.student || data;
  const session = data.session || {};
  const fieldMap: Record<string, any> = {
    status:        walkin.status || data.status || session.status || '',
    branch:        walkin.branchName || walkin.branch || data.branchName || '',
    source:        walkin.source || data.source || '',
    counselorName: walkin.counselorName || session.counselor_name || data.counselorName || '',
    purpose:       walkin.purpose || walkin.course || data.purpose || '',
    priority:      walkin.priority || data.priority || '',
    waitTime:      walkin.waitTime || data.waitTime || 0,
  };
  const raw = fieldMap[condition.field];
  const actual = String(raw ?? '').toLowerCase().trim();
  const expected = String(condition.value ?? '').toLowerCase().trim();
  switch (condition.operator) {
    case 'equals':       return actual === expected;
    case 'not_equals':   return actual !== expected;
    case 'contains':     return actual.includes(expected);
    case 'not_contains': return !actual.includes(expected);
    case 'greater_than': return parseFloat(actual) > parseFloat(expected);
    case 'less_than':    return parseFloat(actual) < parseFloat(expected);
    default:             return true;
  }
}

function evaluateAllConditions(conditions: any[], payload: any): { pass: boolean; detail: string } {
  if (!conditions || conditions.length === 0) return { pass: true, detail: 'No conditions (always fires)' };
  const results = conditions.map((c) => {
    const pass = evaluateCondition(c, payload);
    return { condition: `${c.field} ${c.operator.replace('_', ' ')} "${c.value}"`, pass };
  });
  const all = results.every((r) => r.pass);
  const detail = results.map((r) => `${r.condition}: ${r.pass ? '✓' : '✗'}`).join('; ');
  return { pass: all, detail };
}

async function dispatchWithRetry(
  sub: any, event: string, bodyStr: string, queryUrl: string, isGet: boolean, cfg: any,
): Promise<{ status: 'Success' | 'Failure'; statusCode?: number; response: string; retryCount: number; durationMs: number }> {
  const maxAttempts = 1 + (cfg.maxRetries || 0);
  let lastResult: { status: 'Success' | 'Failure'; statusCode?: number; response: string; retryCount: number; durationMs: number } = { status: 'Failure', statusCode: undefined as number | undefined, response: 'Not attempted', retryCount: 0, durationMs: 0 };
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    if (attempt > 0) await new Promise((r) => setTimeout(r, cfg.retryDelayMs));
    const startMs = Date.now();
    try {
      const headers: Record<string, string> = {};
      const customHdrs = (cfg.customHeaders as unknown as { key: string; value: string }[]) || [];
      for (const h of customHdrs) {
        if (h && typeof h === 'object' && 'key' in h) headers[h.key] = h.value;
      }
      if (!isGet) headers['Content-Type'] = 'application/json';
      if (cfg.signingSecret) headers['X-Webhook-Signature'] = `sha256=${signPayload(bodyStr, cfg.signingSecret)}`;
      headers['X-Webhook-Event'] = event;
      headers['X-Webhook-Id'] = sub.id;
      headers['X-Webhook-Timestamp'] = new Date().toISOString();
      const fetchOptions: RequestInit = {
        method: sub.method, headers,
        signal: AbortSignal.timeout(cfg.timeoutMs || 5000),
        ...(isGet ? {} : { body: bodyStr }),
      };
      const res = await fetch(isGet ? queryUrl : sub.url, fetchOptions);
      const text = await res.text();
      lastResult = { status: res.ok ? 'Success' : 'Failure', statusCode: res.status, response: `HTTP ${res.status}: ${text.slice(0, 300)}`, retryCount: attempt, durationMs: Date.now() - startMs };
      if (res.ok) break;
    } catch (err: any) {
      lastResult = { status: 'Failure', statusCode: undefined, response: err.message || 'Network error / Timeout', retryCount: attempt, durationMs: Date.now() - startMs };
    }
  }
  return lastResult;
}

async function runWebhookTriggers(event: string, payloadData: any): Promise<void> {
  try {
    let cfg = await prisma.webhookConfig.findUnique({ where: { id: 1 } });
    if (!cfg) {
      cfg = await prisma.webhookConfig.create({ data: { id: 1, customHeaders: [], globalPayloadFields: [], signingSecret: '', maxRetries: 1, retryDelayMs: 2000, timeoutMs: 5000 } });
    }
    const payloadFields = (cfg.globalPayloadFields as unknown as { key: string; value: string }[]) || [];
    const extraFields: Record<string, string> = {};
    for (const f of payloadFields) {
      if (f && typeof f === 'object' && 'key' in f) extraFields[f.key] = f.value;
    }
    const subscriptions = await prisma.webhookSubscription.findMany({ where: { enabled: true, deletedAt: null, events: { has: event } } });
    for (const sub of subscriptions) {
      const triggeredAt = new Date();
      const conditions = Array.isArray(sub.conditions) ? sub.conditions : [];
      const { pass: conditionsMatched, detail: conditionDetails } = evaluateAllConditions(conditions as any[], payloadData);
      if (!conditionsMatched) {
        await prisma.webhookLog.create({ data: { subscriptionId: sub.id, subscriptionName: sub.name, url: sub.url, method: sub.method, event, conditionsMatched: false, conditionDetails, payload: payloadData, status: 'Skipped', response: 'Conditions not met — webhook skipped.', retryCount: 0, durationMs: 0, triggeredAt } });
        continue;
      }
      const fullPayload = { event, timestamp: triggeredAt.toISOString(), data: payloadData, ...extraFields };
      const isGet = sub.method === 'GET';
      let bodyStr = '';
      let queryUrl = sub.url;
      if (isGet) {
        const params = new URLSearchParams({ event, timestamp: triggeredAt.toISOString(), data: JSON.stringify(payloadData), ...extraFields });
        queryUrl = sub.url.includes('?') ? `${sub.url}&${params.toString()}` : `${sub.url}?${params.toString()}`;
      } else {
        bodyStr = JSON.stringify(fullPayload);
      }
      const result = await dispatchWithRetry(sub, event, bodyStr, queryUrl, isGet, cfg);
      await prisma.webhookLog.create({ data: { subscriptionId: sub.id, subscriptionName: sub.name, url: sub.url, method: sub.method, event, conditionsMatched: true, conditionDetails, payload: payloadData, status: result.status, statusCode: result.statusCode ?? null, response: result.response, retryCount: result.retryCount, durationMs: result.durationMs, triggeredAt } });
    }
    const count = await prisma.webhookLog.count();
    if (count > 100) {
      const oldestLogs = await prisma.webhookLog.findMany({ orderBy: { triggeredAt: 'asc' }, take: count - 100, select: { id: true } });
      await prisma.webhookLog.deleteMany({ where: { id: { in: oldestLogs.map((l: any) => l.id) } } });
    }
  } catch (err) {
    console.error('runWebhookTriggers error:', err);
  }
}

export function triggerWebhook(event: string, payloadData: any): void {
  runWebhookTriggers(event, payloadData).catch((err) => console.error('Background webhook dispatch error:', err));
}
