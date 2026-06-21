import { getSession } from '../../lib/auth';
import { getStudents, getFailedWalkins } from '../../actions/walkinActions';
import { getCounselors } from '../../actions/counselorActions';
import { branches } from '../../lib/constants';
import WalkinsClient from './WalkinsClient';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function WalkinsPage() {
  const user = await getSession();
  if (!user) {
    redirect('/login');
  }

  const [students, counselors, failedWalkins] = await Promise.all([
    getStudents(),
    getCounselors(),
    getFailedWalkins(),
  ]);

  return (
    <WalkinsClient
      initialWalkins={students as any}
      branches={branches}
      counselors={counselors as any}
      user={user}
      failedWalkins={failedWalkins as any}
    />
  );
}
