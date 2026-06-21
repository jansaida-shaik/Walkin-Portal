'use server';

import { createSession, deleteSession, getSession, SessionUser } from '../lib/auth';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';

export async function login(state: any, formData: FormData) {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  if (!username || !password) {
    return { error: 'Username and password are required.' };
  }

  if (password.length < 6) {
    return { error: 'Password must be at least 6 characters long.' };
  }

  try {
    const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });

    if (!res.ok) {
      try {
        const errorData = await res.json();
        return { error: errorData.error || 'Invalid username or password.' };
      } catch {
        return { error: `Backend API server returned an error (status ${res.status}). Please ensure your BACKEND_URL environment variable is set correctly and the backend is running.` };
      }
    }

    const data = await res.json();
    const sessionUser: SessionUser = data.user;
    await createSession(sessionUser);

    return { success: true, user: sessionUser };
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
