import React from 'react';
import { cn } from '@/lib/utils.ts';

interface Props {
  isoCode: string;
  className?: string;
  circle?: boolean;
}

const FlagIcon = ({ isoCode, className, circle }: Props) => {
  return (
    <span
      className={cn(`fi fi-${isoCode.toLowerCase()}`, circle && 'fis rounded-full', className)}
    />
  );
};

export default FlagIcon;
