'use server';

import { prisma } from '../lib/db';
import { revalidatePath } from 'next/cache';

export async function getSubscriptions() {
  try {
    const subs = await prisma.webhookSubscription.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
    return subs;
  } catch (err) {
    console.error('getSubscriptions error:', err);
    return [];
  }
}

export async function getWebhookLogs() {
  try {
    const logs = await prisma.webhookLog.findMany({
      orderBy: { triggeredAt: 'desc' },
      take: 100,
    });
    return logs;
  } catch (err) {
    console.error('getWebhookLogs error:', err);
    return [];
  }
}

export async function getWebhookConfig() {
  try {
    let config = await prisma.webhookConfig.findFirst();
    if (!config) {
      config = await prisma.webhookConfig.create({
        data: {
          id: 1,
          signingSecret: 'whsec_' + Math.random().toString(36).substring(2, 15),
          maxRetries: 2,
          retryDelayMs: 2000,
          timeoutMs: 5000,
          customHeaders: [],
          globalPayloadFields: [],
        }
      });
    }
    return config;
  } catch (err) {
    console.error('getWebhookConfig error:', err);
    return {
      customHeaders: [],
      globalPayloadFields: [],
      signingSecret: 'whsec_default',
      maxRetries: 2,
      retryDelayMs: 2000,
      timeoutMs: 5000
    };
  }
}

export async function createSubscription(
  name: string,
  url: string,
  events: string[],
  method: string,
  conditions: any[]
) {
  try {
    const sub = await prisma.webhookSubscription.create({
      data: {
        name,
        url,
        events,
        method: method || 'POST',
        conditions: conditions || [],
        enabled: true,
      }
    });
    revalidatePath('/webhooks');
    return { success: true, subscription: sub };
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
    const sub = await prisma.webhookSubscription.update({
      where: { id },
      data: {
        name,
        url,
        events,
        method: method || 'POST',
        conditions: conditions || [],
        enabled,
      }
    });
    revalidatePath('/webhooks');
    return { success: true, subscription: sub };
  } catch (err: any) {
    console.error('updateSubscription error:', err);
    return { error: err.message || 'Failed to update webhook subscription.' };
  }
}

export async function deleteSubscription(id: string) {
  try {
    await prisma.webhookSubscription.delete({
      where: { id }
    });
    revalidatePath('/webhooks');
    return { success: true };
  } catch (err: any) {
    console.error('deleteSubscription error:', err);
    return { error: err.message || 'Failed to delete webhook subscription.' };
  }
}

export async function toggleSubscription(id: string) {
  try {
    const sub = await prisma.webhookSubscription.findUnique({ where: { id } });
    if (!sub) return { error: 'Not found' };
    const updated = await prisma.webhookSubscription.update({
      where: { id },
      data: { enabled: !sub.enabled }
    });
    revalidatePath('/webhooks');
    return { success: true, subscription: updated };
  } catch (err: any) {
    console.error('toggleSubscription error:', err);
    return { error: err.message || 'Failed to toggle webhook.' };
  }
}

export async function updateWebhookConfig(patch: any) {
  try {
    const config = await prisma.webhookConfig.findFirst();
    let updated;
    if (config) {
      updated = await prisma.webhookConfig.update({
        where: { id: config.id },
        data: patch
      });
    } else {
      updated = await prisma.webhookConfig.create({
        data: { id: 1, ...patch }
      });
    }
    revalidatePath('/webhooks');
    return { success: true, config: updated };
  } catch (err: any) {
    console.error('updateWebhookConfig error:', err);
    return { error: err.message || 'Failed to update webhook config.' };
  }
}

export async function clearWebhookLogs() {
  try {
    await prisma.webhookLog.deleteMany({});
    revalidatePath('/webhooks');
    return { success: true };
  } catch (err: any) {
    console.error('clearWebhookLogs error:', err);
    return { error: err.message || 'Failed to clear webhook logs.' };
  }
}
