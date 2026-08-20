import { getSession } from '../../../lib/auth';
import { prisma } from '../../../lib/db';
import { getCounselors } from '../../../actions/counselorActions';
import { redirect } from 'next/navigation';
import WorkspaceClient from './WorkspaceClient';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ studentId?: string }>;
}

export default async function WorkspacePage({ searchParams }: PageProps) {
  const user = await getSession();
  if (!user) {
    redirect('/login');
  }

  const { studentId } = await searchParams;
  if (!studentId) {
    redirect('/sessions');
  }

  // Fetch student, verify they exist
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      sessions: true,
      queueEntry: true
    }
  });

  if (!student || student.deletedAt) {
    redirect('/sessions');
  }

  // Fetch counselors
  const counselors = await getCounselors();

  return (
    <WorkspaceClient
      student={student as any}
      counselors={counselors as any}
      user={user}
    />
  );
}
