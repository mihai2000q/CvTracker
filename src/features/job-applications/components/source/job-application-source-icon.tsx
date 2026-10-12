import React from 'react';
import { RiGlobalLine, RiGroupLine, RiLinkedinLine, RiStackLine } from '@remixicon/react';
import IndeedIcon from '@/features/job-applications/components/source/indeed-icon.tsx';
import StepstoneIcon from '@/features/job-applications/components/source/stepstone-icon.tsx';
import { isJobSource, JobSource } from '@/features/job-applications/constants/job-sources.ts';
import { cn } from '@/lib/utils.ts';

type IconComponent = React.ComponentType<{ className?: string }>;

const icons: Record<JobSource, IconComponent> = {
  LinkedIn: RiLinkedinLine,
  Indeed: IndeedIcon,
  Stepstone: StepstoneIcon,
  'Company site': RiGlobalLine,
  Referral: RiGroupLine,
};

const colors: Record<JobSource, string> = {
  LinkedIn: 'text-sky-500',
  Indeed: 'text-blue-500',
  Stepstone: 'text-emerald-500',
  'Company site': 'text-slate-400',
  Referral: 'text-violet-400',
};

// The icon of a source as it's stored. Anything that isn't one of the known sources,
// "Other" included, gets the generic one
const JobApplicationSourceIcon = ({
  source,
  className,
  colored = false,
}: {
  source: string;
  className?: string;
  colored?: boolean;
}) => {
  const known = isJobSource(source);
  const Icon = known ? icons[source] : RiStackLine;
  return <Icon className={cn(colored && known && colors[source], className)} />;
};

export default JobApplicationSourceIcon;
