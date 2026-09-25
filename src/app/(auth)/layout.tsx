import React from 'react';
import { redirect } from 'next/navigation';
import { hasValidSession } from '@/lib/session';

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  if (await hasValidSession()) {
    redirect('/dashboard');
  }
  return children;
}
