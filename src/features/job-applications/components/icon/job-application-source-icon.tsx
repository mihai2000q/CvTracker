import React from 'react';
import {
  RiGlobalLine,
  RiGroupLine,
  RiLinkedinLine,
  RiCompass3Line,
  RiSignpostLine,
  RiSearchEyeLine,
  RiRoadMapLine,
  RiStackLine,
  RiMore2Line,
  RiAddCircleLine,
  RiSparklingLine,
} from '@remixicon/react';
import IndeedIcon from '@/features/job-applications/components/icon/indeed-icon.tsx';
import StepstoneIcon from '@/features/job-applications/components/icon/stepstone-icon.tsx';
import { isJobSource, JobSource } from '@/features/job-applications/constants/job-sources.ts';

type IconComponent = React.ComponentType<{ className?: string }>;

const icons: Record<JobSource, IconComponent> = {
  LinkedIn: RiLinkedinLine,
  Indeed: IndeedIcon,
  Stepstone: StepstoneIcon,
  'Company site': RiGlobalLine,
  Referral: RiGroupLine,
};

// The icon of a source as it's stored. Anything that isn't one of the known sources,
// "Other" included, gets the generic one
const JobApplicationSourceIcon = ({
  source,
  className,
}: {
  source: string;
  className?: string;
}) => {
  const Icon = isJobSource(source) ? icons[source] : RiStackLine;
  return <Icon className={className} />;
};

export default JobApplicationSourceIcon;
