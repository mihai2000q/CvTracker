import React from 'react';
import type { Metadata } from 'next';
import NotFoundState from '@/components/not-found-state.tsx';

export const metadata: Metadata = { title: 'Page not found' };

// Unmatched URLs land here, outside the app shell
const NotFound = () => {
  return (
    <div className={'flex min-h-screen items-center justify-center'}>
      <NotFoundState
        title={'Page not found'}
        description={"The page you're looking for doesn't exist or has moved."}
        href={'/dashboard'}
        linkLabel={'Go to dashboard'}
        className={'pt-12'}
      />
    </div>
  );
};

export default NotFound;
