import React from 'react';
import NotFoundState from '@/components/not-found-state.tsx';

const JobApplicationNotFound = () => {
  return (
    <NotFoundState
      title={'Job application not found'}
      description={"This job application doesn't exist or was deleted."}
      href={'/jobs'}
      linkLabel={'Back to jobs'}
    />
  );
};

export default JobApplicationNotFound;
