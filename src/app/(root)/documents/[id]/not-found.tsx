import React from 'react';
import NotFoundState from '@/components/not-found-state.tsx';

const DocumentNotFound = () => {
  return (
    <NotFoundState
      title={'Document not found'}
      description={"This document doesn't exist or was deleted."}
      href={'/documents'}
      linkLabel={'Back to documents'}
    />
  );
};

export default DocumentNotFound;
