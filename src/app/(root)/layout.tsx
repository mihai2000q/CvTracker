import React from 'react';
import { redirect } from 'next/navigation';
import { hasValidSession } from '@/lib/session';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  if (!(await hasValidSession())) {
    redirect('/sign-in');
  }

  return <div>{children}</div>;
}
