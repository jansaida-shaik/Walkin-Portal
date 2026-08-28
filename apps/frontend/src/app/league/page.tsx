import { getSession } from '../../lib/auth';
import { getStudents } from '../../actions/walkinActions';
import { getCounselors } from '../../actions/counselorActions';
import { branches } from '../../lib/constants';
import { prisma } from '../../lib/db';
import LeagueClient from './LeagueClient';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function LeaguePage({
  searchParams,
}: {
  searchParams?: Promise<{ tab?: string }>;
}) {
  const user = await getSession();
  if (!user) redirect('/login');

  const resolvedParams = searchParams ? await searchParams : {};
  const rawTab = resolvedParams?.tab || 'trophies';
  const initialTab = rawTab === 'counselors' ? 'points_table' : rawTab;

  const [students, counselors, convertedLeads] = await Promise.all([
    getStudents(),
    getCounselors(),
    prisma.convertedLead.findMany({
      orderBy: { enrollmentDate: 'desc' },
    }),
  ]);

  return (
    <LeagueClient
      students={students as any}
      counselors={counselors as any}
      convertedLeads={convertedLeads as any}
      branches={branches as any}
      user={user}
      initialTab={initialTab as any}
    />
  );
}
