import { getSession } from '../../../lib/auth';
import { prisma } from '../../../lib/db';
import { redirect } from 'next/navigation';
import ConvertedLeadRecordClient from './ConvertedLeadRecordClient';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ConvertedLeadFullRecordPage({ params }: PageProps) {
  const user = await getSession();
  if (!user) {
    redirect('/login');
  }

  const { id } = await params;
  if (!id) {
    redirect('/converted-leads');
  }

  const lead = await prisma.convertedLead.findUnique({
    where: { id },
    include: { counselor: true },
  });

  if (!lead) {
    redirect('/converted-leads');
  }

  return (
    <ConvertedLeadRecordClient
      lead={{
        ...lead,
        enrollmentDate: lead.enrollmentDate ? lead.enrollmentDate.toISOString() : new Date().toISOString(),
        metadata: lead.metadata as any,
      }}
      currentUser={user}
    />
  );
}
