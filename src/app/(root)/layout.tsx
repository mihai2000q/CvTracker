import React from 'react';
import AppSidebar from '@/components/layout/app-sidebar.tsx';
import { SidebarProvider } from '@/components/ui/sidebar';
import AppTopbar from '@/components/layout/app-topbar.tsx';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className={'flex w-full'}>
        <AppSidebar />
        <div className={'w-full'}>
          <AppTopbar />
          <main className={'p-6'}>{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
