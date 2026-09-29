import React from 'react';
import AppSidebar from '@/components/layout/app-sidebar.tsx';
import { SidebarProvider } from '@/components/ui/sidebar';
import AppTopbar from '@/components/layout/app-topbar.tsx';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className={'flex w-full'}>
        <AppSidebar />
        <div className={'flex w-full min-w-0 flex-col'}>
          <AppTopbar />
          <main className={'flex flex-1 flex-col px-5.5 py-4'}>{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
