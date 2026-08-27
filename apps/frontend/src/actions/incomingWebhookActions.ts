'use server';

import { prisma } from '../lib/db';
import { revalidatePath } from 'next/cache';

export async function getIncomingWebhooks() {
  try {
    const webhooks = await prisma.incomingWebhook.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return webhooks;
  } catch (error) {
    console.error('Error fetching incoming webhooks:', error);
    return [];
  }
}

export async function createIncomingWebhook(name: string, source: string = 'custom') {
  try {
    const webhook = await prisma.incomingWebhook.create({
      data: { name, source }
    });
    revalidatePath('/webhooks');
    return { success: true, webhook };
  } catch (error: any) {
    console.error('Error creating incoming webhook:', error);
    return { success: false, error: error.message };
  }
}

export async function toggleIncomingWebhook(id: string, active: boolean) {
  try {
    await prisma.incomingWebhook.update({
      where: { id },
      data: { active }
    });
    revalidatePath('/webhooks');
    return { success: true };
  } catch (error: any) {
    console.error('Error toggling incoming webhook:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteIncomingWebhook(id: string) {
  try {
    await prisma.incomingWebhook.delete({
      where: { id }
    });
    revalidatePath('/webhooks');
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting incoming webhook:', error);
    return { success: false, error: error.message };
  }
}
