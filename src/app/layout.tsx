import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono, Roboto } from 'next/font/google';
import './globals.css';
import 'flag-icons/css/flag-icons.min.css';
import { cn } from '@/lib/utils';
import Providers from '@/app/providers.tsx';

const roboto = Roboto({ subsets: ['latin'], variable: '--font-sans' });

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: { default: 'CvTracker', template: '%s | CvTracker' },
  description: 'Track your job applications, organizations, countries and documents in one place',
  // A private, login-only app: nothing in it belongs in search results
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  colorScheme: 'light dark',
};

export default function AppLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="en"
      className={cn(
        'h-full',
        'antialiased',
        geistSans.variable,
        geistMono.variable,
        'font-sans',
        roboto.variable
      )}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col">
        <Providers>
          <div>{children}</div>
        </Providers>
      </body>
    </html>
  );
}
