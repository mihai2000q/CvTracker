import React from 'react';
import NotFoundState from '@/components/not-found-state.tsx';

const OrganizationNotFound = () => {
  return (
    <NotFoundState
      title={'Organization not found'}
      description={"This organization doesn't exist or was deleted."}
      href={'/organizations'}
      linkLabel={'Back to organizations'}
    />
  );
};

export default OrganizationNotFound;
