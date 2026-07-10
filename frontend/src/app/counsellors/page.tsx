import { getSession } from '../../lib/auth';
import { getCounselors } from '../../actions/counselorActions';
import { branches } from '../../lib/constants';
import CounselorsClient from './CounselorsClient';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function CounselorsPage() {
  const user = await getSession();
  if (!user) {
    redirect('/login');
  }

  const counselors = await getCounselors();

  return (
    <CounselorsClient
      initialCounselors={counselors as any}
      branches={branches}
      user={user}
    />
  );
}
