import { redirect } from 'next/navigation';
import { getSession } from '../lib/auth';

export const dynamic = 'force-dynamic';

export default async function IndexPage() {
  const user = await getSession();
  if (!user) {
    redirect('/login');
  } else {
    redirect('/dashboard');
  }
}
