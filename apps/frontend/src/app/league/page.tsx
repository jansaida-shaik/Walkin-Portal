import { getSession } from '../../lib/auth';
import { getStudents } from '../../actions/walkinActions';
import { getCounselors } from '../../actions/counselorActions';
import { branches } from '../../lib/constants';
import LeagueClient from './LeagueClient';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function LeaguePage() {
  const user = await getSession();
  if (!user) redirect('/login');

  const [students, counselors] = await Promise.all([getStudents(), getCounselors()]);

  return (
    <LeagueClient
      students={students as any}
      counselors={counselors as any}
      branches={branches as any}
      user={user}
    />
  );
}
