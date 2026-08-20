import { getSession } from '../../lib/auth';
import { prisma } from '../../lib/db';
import { branches, locations, roles, departments } from '../../lib/constants';
import SettingsClient from './SettingsClient';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const user = await getSession();
  if (!user) {
    redirect('/login');
  }

  // Authorize: Admin/Super Admin/Manager only
  const roleId = user.roleId;
  const canAccess = roleId === 'role_super_admin' || roleId === 'role_admin' || roleId === 'role_manager';
  if (!canAccess) {
    redirect('/dashboard');
  }

  // Fetch users from database
  const dbUsers = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' }
  });

  // Map database users to settings panel structure
  const mappedUsers = dbUsers.map(u => ({
    id: u.id,
    username: u.username,
    name: u.name,
    email: u.email,
    roleId: u.roleId,
    branchId: u.branchId,
    departmentId: u.departmentId,
    active: true // Standard active status
  }));

  // Enriched branches with details
  const enrichedBranches = branches.map(b => ({
    ...b,
    locationName: locations.find(l => l.id === b.locationId)?.name || 'Unknown',
    departmentNames: b.departmentIds.map(dId => departments.find(d => d.id === dId)?.name || dId)
  }));

  return (
    <SettingsClient
      branches={enrichedBranches}
      locations={locations}
      users={mappedUsers}
      roles={roles}
      departments={departments}
      currentUser={user}
    />
  );
}
