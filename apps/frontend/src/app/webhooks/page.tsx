import { getSession } from '../../lib/auth';
import { getSubscriptions, getWebhookLogs, getWebhookConfig } from '../../actions/webhookActions';
import WebhooksClient from './WebhooksClient';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function WebhooksPage() {
  const user = await getSession();
  if (!user) {
    redirect('/login');
  }

  // Authorize: Admin/Super Admin/Manager only
  const roleId = user.roleId;
  const canAccess = roleId === 'role_super_admin' || roleId === 'role_admin' || roleId === 'role_manager';
  if (!canAccess) {
    redirect('/dashboard');
  }

  const [subscriptions, logs, config] = await Promise.all([
    getSubscriptions(),
    getWebhookLogs(),
    getWebhookConfig()
  ]);

  return (
    <WebhooksClient
      initialSubscriptions={subscriptions as any}
      initialLogs={logs as any}
      initialConfig={config as any}
      user={user}
    />
  );
}
