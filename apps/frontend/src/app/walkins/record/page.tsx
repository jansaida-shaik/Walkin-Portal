import { getSession } from '../../../lib/auth';
import { prisma } from '../../../lib/db';
import { getCounselors } from '../../../actions/counselorActions';
import { redirect } from 'next/navigation';
import RecordClient from './RecordClient';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ studentId?: string; leadId?: string }>;
}

export default async function WalkinRecordPage({ searchParams }: PageProps) {
  const user = await getSession();
  if (!user) {
    redirect('/login');
  }

  const { studentId, leadId } = await searchParams;
  
  if (leadId) {
    redirect(`/converted-leads/${leadId}`);
  }

  if (!studentId) {
    redirect('/walkins');
  }

  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      sessions: true,
      queueEntry: true,
    }
  });

  if (!student || student.deletedAt) {
    redirect('/walkins');
  }

  const counselors = await getCounselors();

  return (
    <RecordClient
      student={student as any}
      counselors={counselors as any}
      user={user}
    />
  );
}
