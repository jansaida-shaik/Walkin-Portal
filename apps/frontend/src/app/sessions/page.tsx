import { getSession } from '../../lib/auth';
import { getStudents } from '../../actions/walkinActions';
import { getCounselors } from '../../actions/counselorActions';
import SessionsClient from './SessionsClient';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function SessionsPage() {
  const user = await getSession();
  if (!user) {
    redirect('/login');
  }

  const [students, counselors] = await Promise.all([
    getStudents(),
    getCounselors()
  ]);

  return (
    <SessionsClient
      initialWalkins={students as any}
      counselors={counselors as any}
      user={user}
    />
  );
}
