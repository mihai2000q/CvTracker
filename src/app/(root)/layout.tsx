import React from 'react';
import { redirect } from 'next/navigation';
import { hasValidSession } from '@/lib/session';
import AppSidebar from '@/components/layout/app-sidebar.tsx';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator.tsx';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  if (!(await hasValidSession())) {
    redirect('/sign-in');
  }

  return (
    <SidebarProvider>
      <div className={'flex w-full'}>
        <AppSidebar />
        <div className={'w-full'}>
          <header className="flex h-16 w-full shrink-0 items-center gap-2 px-4 transition-[width,height] ease-linear">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1" />
            </div>
          </header>
          <Separator />
          <main className={'p-6'}>{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
