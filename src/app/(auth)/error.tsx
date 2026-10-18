'use client';

import React from 'react';
import ErrorState from '@/components/error-state.tsx';

const AuthError = ({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) => {
  return (
    <div className={'flex min-h-screen items-center justify-center'}>
      <ErrorState error={error} retry={retry} className={'pt-12'} />
    </div>
  );
};

export default AuthError;
