'use client';

import React from 'react';
import Link from 'next/link';
import { CountrySummary } from '@/features/countries/types/country.ts';
import { cn } from '@/lib/utils.ts';

const OrganizationCountryBadge = ({ country }: { country: CountrySummary }) => {
  return (
    <Link
      href={`/countries/${country.id}`}
      prefetch={false}
      onClick={(e) => e.stopPropagation()}
      className={cn(
        'inline-flex gap-1.5 rounded-sm border bg-gray-800 px-2 py-1 text-[0.6875rem]',
        'hover:bg-muted leading-none transition-colors'
      )}
    >
      <div className={'text-blue-500'}>{country.isoCode}</div>
      <div>{country.name}</div>
    </Link>
  );
};

export default OrganizationCountryBadge;
