'use server';

import { redirect } from 'next/navigation';
import { deleteSession } from '@/lib/session.ts';

export async function signOut() {
  await deleteSession();
  redirect('/sign-in');
}
