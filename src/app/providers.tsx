'use client';

import React from 'react';
import { TooltipProvider } from '@/components/ui/tooltip.tsx';
import { Toaster } from '@/components/ui/toast.tsx';
import TimeZoneSync from '@/components/layout/time-zone-sync.tsx';
import { ThemeProvider } from '@/components/theme-provider.tsx';
import { QueryClient, QueryClientConfig, QueryClientProvider } from '@tanstack/react-query';

let browserQueryClient: QueryClient | undefined;

function getQueryClient() {
  const config: QueryClientConfig = { defaultOptions: { queries: { staleTime: 5 * 60 * 1000 } } };
  if (typeof window === 'undefined') return new QueryClient(config);
  browserQueryClient ??= new QueryClient(config);
  return browserQueryClient;
}

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryClientProvider client={getQueryClient()}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <TooltipProvider>
          {children}
          <Toaster />
          <TimeZoneSync />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default Providers;
