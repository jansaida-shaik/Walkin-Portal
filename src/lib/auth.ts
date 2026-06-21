import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('FATAL: JWT_SECRET environment variable is missing!');
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: string;
  roleId: string;
  branchId: string;
  branchName: string;
  locationId: string;
  locationName: string;
  departmentId: string;
  departmentName: string;
}

export async function createSession(user: SessionUser): Promise<void> {
  const token = jwt.sign(user, JWT_SECRET as string, { expiresIn: '7d' });
  const cookieStore = await cookies();
  cookieStore.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict', // Hardened to strict
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/',
  });
}

export async function getSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return null;

    const decoded = jwt.verify(token, JWT_SECRET as string) as SessionUser;
    return decoded;
  } catch (err) {
    return null;
  }
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('token');
}

/**
 * Validates the current session and optional role restrictions.
 * Throws an Error if unauthorized or forbidden.
 */
export async function validateSession(requiredRoles?: string[]): Promise<SessionUser> {
  const session = await getSession();
  if (!session) {
    throw new Error('Unauthorized: Session is invalid or expired.');
  }

  if (requiredRoles && requiredRoles.length > 0) {
    if (!requiredRoles.includes(session.roleId)) {
      throw new Error('Forbidden: Access denied for your user role.');
    }
  }

  return session;
}
