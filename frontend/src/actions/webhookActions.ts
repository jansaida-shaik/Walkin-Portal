'use server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';

export async function getSubscriptions() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/webhooks/subscriptions`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch webhook subscriptions');
    return await res.json();
  } catch (err) {
    console.error('getSubscriptions error:', err);
    return [];
  }
}

export async function getWebhookLogs() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/webhooks/logs`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch webhook logs');
    return await res.json();
  } catch (err) {
    console.error('getWebhookLogs error:', err);
    return [];
  }
}

export async function getWebhookConfig() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/webhooks/config`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch webhook config');
    return await res.json();
  } catch (err) {
    console.error('getWebhookConfig error:', err);
    return {
      customHeaders: [],
      globalPayloadFields: [],
      signingSecret: '',
      maxRetries: 1,
      retryDelayMs: 2000,
      timeoutMs: 5000
    };
  }
}

export async function createSubscription(name: string, url: string, events: string[], method: string, conditions: any[]) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/webhooks/subscriptions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, url, events, method, conditions })
    });

    const data = await res.json();
    if (!res.ok) {
      return { error: data.error || 'Failed to create webhook subscription.' };
    }

    return { success: true, subscription: data.subscription };
  } catch (err: any) {
    console.error('createSubscription error:', err);
    return { error: err.message || 'Failed to create webhook subscription.' };
  }
}

export async function updateSubscription(
  id: string,
  name: string,
  url: string,
  events: string[],
  method: string,
  conditions: any[],
  enabled: boolean
) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/webhooks/subscriptions/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, url, events, method, conditions, enabled })
    });

    const data = await res.json();
    if (!res.ok) {
      return { error: data.error || 'Failed to update webhook subscription.' };
    }

    return { success: true, subscription: data.subscription };
  } catch (err: any) {
    console.error('updateSubscription error:', err);
    return { error: err.message || 'Failed to update webhook subscription.' };
  }
}

export async function deleteSubscription(id: string) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/webhooks/subscriptions/${id}`, {
      method: 'DELETE'
    });

    const data = await res.json();
    if (!res.ok) {
      return { error: data.error || 'Failed to delete webhook subscription.' };
    }

    return { success: true };
  } catch (err: any) {
    console.error('deleteSubscription error:', err);
    return { error: err.message || 'Failed to delete webhook subscription.' };
  }
}

export async function toggleSubscription(id: string) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/webhooks/subscriptions/${id}/toggle`, {
      method: 'POST'
    });

    const data = await res.json();
    if (!res.ok) {
      return { error: data.error || 'Failed to toggle webhook.' };
    }

    return { success: true, subscription: data.subscription };
  } catch (err: any) {
    console.error('toggleSubscription error:', err);
    return { error: err.message || 'Failed to toggle webhook.' };
  }
}

export async function updateWebhookConfig(patch: any) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/webhooks/config`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(patch)
    });

    const data = await res.json();
    if (!res.ok) {
      return { error: data.error || 'Failed to update global webhook config.' };
    }

    return { success: true, config: data.config };
  } catch (err: any) {
    console.error('updateWebhookConfig error:', err);
    return { error: err.message || 'Failed to update global webhook config.' };
  }
}

export async function clearWebhookLogs() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/webhooks/logs`, {
      method: 'DELETE'
    });

    const data = await res.json();
    if (!res.ok) {
      return { error: data.error || 'Failed to clear webhook logs.' };
    }

    return { success: true };
  } catch (err: any) {
    console.error('clearWebhookLogs error:', err);
    return { error: err.message || 'Failed to clear webhook logs.' };
  }
}
