import { getSession } from '../../lib/auth';
import { getStudents } from '../../actions/walkinActions';
import { getCounselors } from '../../actions/counselorActions';
import { branches } from '../../lib/constants';
import QueueClient from './QueueClient';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function QueuePage() {
  const user = await getSession();
  if (!user) {
    redirect('/login');
  }

  const [students, counselors] = await Promise.all([
    getStudents(),
    getCounselors()
  ]);

  return (
    <QueueClient
      initialWalkins={students as any}
      branches={branches}
      counselors={counselors as any}
      user={user}
    />
  );
}
