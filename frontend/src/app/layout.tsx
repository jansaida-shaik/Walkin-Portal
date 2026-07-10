import './globals.css';
import { getSession } from '../lib/auth';
import Layout from '../components/Layout';
import { ReactNode } from 'react';
import { Analytics } from '@vercel/analytics/next';

export const metadata = {
  title: 'Walk-In Management Control Center',
  description: 'Manage student walk-ins, counselor queues, and live sessions.',
};

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getSession();

  return (
    <html lang="en" data-theme="dark" data-scroll-behavior="smooth">
      <body>
        <Layout user={user}>{children}</Layout>
        <Analytics />
      </body>
    </html>
  );
}
