'use server';

import { redirect } from 'next/navigation';
import { deleteSession } from '@/lib/auth/session.ts';

export async function signOut() {
  await deleteSession();
  redirect('/sign-in');
}
