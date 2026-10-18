'use client';

import React from 'react';
import ErrorState from '@/components/error-state.tsx';

const RootError = ({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) => {
  return <ErrorState error={error} retry={retry} />;
};

export default RootError;
