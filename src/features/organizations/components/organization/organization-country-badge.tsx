import React from 'react';
import Link from 'next/link';
import { CountrySummary } from '@/features/countries/types/country.ts';
import { cn } from '@/lib/utils.ts';
import FlagIcon from '@/features/countries/components/flag-icon.tsx';

const OrganizationCountryBadge = ({
  country,
  className,
}: {
  country: CountrySummary;
  className?: string;
}) => {
  return (
    <Link
      href={`/countries/${country.id}`}
      prefetch={false}
      className={cn(
        'bg-muted/50 pointer-events-auto inline-flex items-center gap-1.5 rounded-sm border px-2 py-1 text-[0.6875rem]',
        'hover:bg-muted leading-none transition-colors',
        className
      )}
    >
      <FlagIcon isoCode={country.isoCode} circle className={'text-xs'} />
      <div>{country.name}</div>
    </Link>
  );
};

export default OrganizationCountryBadge;
