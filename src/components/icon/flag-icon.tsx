import React from 'react';
import { cn } from '@/lib/utils.ts';

interface Props {
  isoCode: string;
  className?: string;
}

const FlagIcon = ({ isoCode, className }: Props) => {
  return <span className={cn(`fi rounded-full fi-${isoCode.toLowerCase()}`, className)} />;
};

export default FlagIcon;
