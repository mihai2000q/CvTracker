'use client';

import React from 'react';
import { TooltipProvider } from '@/components/ui/tooltip.tsx';
import { Toaster } from '@/components/ui/toast.tsx';
import { ThemeProvider } from '@/components/theme-provider.tsx';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

let browserQueryClient: QueryClient | undefined;

function getQueryClient() {
  if (typeof window === 'undefined') return new QueryClient();
  browserQueryClient ??= new QueryClient();
  return browserQueryClient;
}

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryClientProvider client={getQueryClient()}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <TooltipProvider>
          {children}
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default Providers;
