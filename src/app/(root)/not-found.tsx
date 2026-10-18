import React from 'react';
import NotFoundState from '@/components/not-found-state.tsx';

const RootNotFound = () => {
  return (
    <NotFoundState
      title={'Page not found'}
      description={"The page you're looking for doesn't exist or has moved."}
      href={'/dashboard'}
      linkLabel={'Go to dashboard'}
    />
  );
};

export default RootNotFound;
