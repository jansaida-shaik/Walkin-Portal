import { getSession } from '../../../../lib/auth';
import { prisma } from '../../../../lib/db';
import { branches, locations, departments } from '../../../../lib/constants';
import { redirect } from 'next/navigation';
import CounselorEditClient from './CounselorEditClient';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CounselorEditPage({ params }: PageProps) {
  const user = await getSession();
  if (!user) {
    redirect('/login');
  }

  const { id } = await params;
  const counselor = await prisma.counselorProfile.findUnique({
    where: { id },
    include: {
      sessions: true,
    },
  });

  if (!counselor || counselor.deletedAt) {
    redirect('/counsellors');
  }

  return (
    <CounselorEditClient
      counselor={counselor as any}
      branches={branches}
      locations={locations}
      departments={departments}
      currentUser={user}
    />
  );
}
