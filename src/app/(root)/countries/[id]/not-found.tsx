import React from 'react';
import NotFoundState from '@/components/not-found-state.tsx';

const CountryNotFound = () => {
  return (
    <NotFoundState
      title={'Country not found'}
      description={"This country doesn't exist."}
      href={'/countries'}
      linkLabel={'Back to countries'}
    />
  );
};

export default CountryNotFound;
