import { getSession } from '../../lib/auth';
import { prisma } from '../../lib/db';
import { branches } from '../../lib/constants';
import { redirect } from 'next/navigation';
import ConvertedLeadsClient from './ConvertedLeadsClient';

export const dynamic = 'force-dynamic';

export default async function ConvertedLeadsPage() {
  const user = await getSession();
  if (!user) {
    redirect('/login');
  }

  let leads: any[] = [];
  let counselors: any[] = [];

  try {
    if (prisma.convertedLead) {
      leads = await prisma.convertedLead.findMany({
        include: { counselor: true },
        orderBy: { enrollmentDate: 'desc' },
      });
    }
  } catch (e) {
    console.error('Error loading converted leads:', e);
  }

  try {
    if (prisma.counselorProfile) {
      counselors = await prisma.counselorProfile.findMany({
        orderBy: { name: 'asc' },
      });
    }
  } catch (e) {
    console.error('Error loading counselors:', e);
  }

  return (
    <ConvertedLeadsClient
      initialLeads={leads}
      counselors={counselors}
      branches={branches}
      currentUser={user}
    />
  );
}
