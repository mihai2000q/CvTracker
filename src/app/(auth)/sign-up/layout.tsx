import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Sign up' };

export default function SignUpLayout({ children }: LayoutProps<'/sign-up'>) {
  return <main>{children}</main>;
}
