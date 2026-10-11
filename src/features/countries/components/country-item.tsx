import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card.tsx';
import { Badge } from '@/components/ui/badge.tsx';
import { Country } from '@/features/countries/types/country.ts';
import { cn } from '@/lib/utils.ts';
import FlagIcon from '@/components/icon/flag-icon.tsx';

interface Props {
  country: Country;
}

const CountryItem = ({ country }: Props) => {
  return (
    <Card
      className={cn(
        '@container relative h-full gap-6 px-4 py-5',
        'hover:bg-muted hover:border-muted-foreground/50 transition-colors duration-125',
        'has-[a:focus-visible]:ring-ring has-[a:focus-visible]:ring-2'
      )}
    >
      <div className={'flex items-center gap-4 px-1'}>
        <FlagIcon
          isoCode={country.isoCode}
          className={cn(
            'ring-foreground/10 shrink-0 text-[clamp(2.75rem,20cqw,7rem)] shadow-sm ring-1',
            'rounded-lg brightness-90 saturate-80 transition-[filter] duration-125',
            'group-hover/card:brightness-100 group-hover/card:saturate-100'
          )}
        />

        <div className={'flex min-w-0 flex-col items-start gap-1'}>
          <Link
            href={`/countries/${country.id}`}
            prefetch={false}
            title={country.name}
            className={
              'line-clamp-2 text-lg leading-tight font-bold break-words outline-none after:absolute after:inset-0'
            }
          >
            {country.name}
          </Link>
          <Badge variant={'primary-alt'} className={'font-bold'}>
            {country.isoCode}
          </Badge>
        </div>
      </div>

      <div className={'mt-auto grid grid-cols-2 gap-2'}>
        <Stat label={'Jobs'} count={country.jobApplicationsCount} />
        <Stat label={'Organizations'} count={country.organizationsCount} />
      </div>
    </Card>
  );
};

const Stat = ({ label, count }: { label: string; count: number }) => (
  <div
    className={
      'bg-background flex min-w-0 flex-col rounded-lg px-3 py-[clamp(0.625rem,3.5cqw,1.25rem)]'
    }
  >
    <div className={'text-[clamp(1.25rem,7cqw,1.875rem)] leading-none font-semibold tabular-nums'}>
      {count}
    </div>
    <div className={'text-muted-foreground mt-1.5 truncate text-xs'}>{label}</div>
  </div>
);

export default CountryItem;
