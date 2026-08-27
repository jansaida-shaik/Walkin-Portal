import { getSession } from '../../../lib/auth';
import { prisma } from '../../../lib/db';
import { getCounselors } from '../../../actions/counselorActions';
import { redirect } from 'next/navigation';
import WorkspaceClient from './WorkspaceClient';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ studentId?: string; id?: string }>;
}

export default async function WorkspacePage({ searchParams }: PageProps) {
  const user = await getSession();
  if (!user) {
    redirect('/login');
  }

  const { studentId, id } = await searchParams;
  const targetId = studentId || id;

  if (!targetId) {
    redirect('/sessions');
  }

  // 1. First try finding student directly by ID
  let student = await prisma.student.findUnique({
    where: { id: targetId },
    include: {
      sessions: true,
      queueEntry: true,
    },
  });

  // 2. If not found by student ID, check if targetId is a CounselingSession ID
  if (!student) {
    const session = await prisma.counselingSession.findUnique({
      where: { id: targetId },
      include: {
        student: {
          include: {
            sessions: true,
            queueEntry: true,
          },
        },
      },
    });
    if (session?.student) {
      student = session.student;
    }
  }

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
