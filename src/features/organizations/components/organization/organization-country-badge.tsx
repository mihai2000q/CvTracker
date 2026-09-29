import React from 'react';
import { CountrySummary } from '@/features/countries/types/country.ts';

const OrganizationCountryBadge = ({ country }: { country: CountrySummary }) => {
  return (
    <div
      className={'flex gap-1.5 rounded-sm border bg-gray-800 px-2 py-1 text-[11px] leading-none'}
    >
      <div className={'text-blue-500'}>{country.isoCode}</div>
      <div>{country.name}</div>
    </div>
  );
};

export default OrganizationCountryBadge;
