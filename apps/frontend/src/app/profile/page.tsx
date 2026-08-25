import { getSession } from '../../lib/auth';
import { prisma } from '../../lib/db';
import { redirect } from 'next/navigation';
import ProfileClient from './ProfileClient';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const sessionUser = await getSession();
  if (!sessionUser) {
    redirect('/login');
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: sessionUser.id },
  });

  if (!dbUser) {
    redirect('/login');
  }

  // If counselor, fetch counselor profile
  let counselorProfile = null;
  if (sessionUser.roleId === 'role_counselor') {
    counselorProfile = await prisma.counselorProfile.findUnique({
      where: { id: sessionUser.id },
    });
  }

  return (
    <ProfileClient
      currentUser={sessionUser}
      userRecord={{
        id: dbUser.id,
        username: dbUser.username,
        name: dbUser.name,
        email: dbUser.email || '',
        roleId: dbUser.roleId,
        branchId: dbUser.branchId,
        departmentId: dbUser.departmentId,
        status: counselorProfile?.status || 'Active',
        createdAt: dbUser.createdAt.toISOString(),
      }}
    />
  );
}
