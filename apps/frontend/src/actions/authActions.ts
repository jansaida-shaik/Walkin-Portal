'use server';

import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';
import { prisma } from '../lib/db';
import { createSession, deleteSession, getSession, SessionUser } from '../lib/auth';
import { getBranchName, getDepartment, getLocation, getRole } from '../lib/constants';

export async function login(state: any, formData: FormData) {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  if (!username || !password) return { error: 'Username and password are required.' };
  if (password.length < 6) return { error: 'Password must be at least 6 characters long.' };

  try {
    const user = await prisma.user.findFirst({ where: { username, deletedAt: null } });
    if (!user) {
      return { error: 'Invalid username or password.' };
    }

    const isBcryptHash = user.password.startsWith('$2a$') || user.password.startsWith('$2b$');
    let isPasswordCorrect = false;
    let needsMigration = false;

    if (isBcryptHash) {
      isPasswordCorrect = await bcrypt.compare(password, user.password);
    } else {
      isPasswordCorrect = user.password === password;
      if (isPasswordCorrect) needsMigration = true;
    }

    if (!isPasswordCorrect) {
      return { error: 'Invalid username or password.' };
    }

    if (needsMigration) {
      try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await prisma.user.update({ where: { id: user.id }, data: { password: hashedPassword } });
      } catch (e) {
        console.error('Password migration failed:', e);
      }
    }

    const sessionUser: SessionUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: getRole(user.roleId),
      roleId: user.roleId,
      branchId: user.branchId,
      branchName: getBranchName(user.branchId),
      locationId: user.locationId,
      locationName: getLocation(user.locationId),
      departmentId: user.departmentId,
      departmentName: getDepartment(user.departmentId),
    };

    // Set the cookie AND redirect server-side in the same response
    await createSession(sessionUser);

    try {
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'USER_LOGIN',
          module: 'Authentication',
          newValue: `User ${user.username} logged in successfully.`,
        },
      });
    } catch (e) {
      console.error('Audit log failed:', e);
    }

  } catch (err: any) {
    console.error('Login action error:', err);
    return { error: err.message || 'Something went wrong during login.' };
  }

  // redirect() must be called OUTSIDE the try/catch
  // Next.js redirect() throws a special error internally
  redirect('/dashboard');
}

export async function logout() {
  await deleteSession();
  redirect('/login');
}

export async function getLoggedUser() {
  return await getSession();
}
