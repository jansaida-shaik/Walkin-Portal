'use server';

import { createSession, deleteSession, getSession, SessionUser } from '../lib/auth';

const getBaseUrl = () => {
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8080';
};

export async function login(state: any, formData: FormData) {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  if (!username || !password) return { error: 'Username and password are required.' };
  if (password.length < 6) return { error: 'Password must be at least 6 characters long.' };

  try {
    const res = await fetch(`${getBaseUrl()}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return { error: errorData.error || 'Invalid username or password.' };
    }

    const data = await res.json();
    await createSession(data.user as SessionUser);
    return { success: true, user: data.user };
  } catch (err: any) {
    console.error('Login action error:', err);
    return { error: err.message || 'Something went wrong during login.' };
  }
}

export async function logout() {
  await deleteSession();
}

export async function getLoggedUser() {
  return await getSession();
}
