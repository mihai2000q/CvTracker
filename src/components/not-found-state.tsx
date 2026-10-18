import React from 'react';
import Link from 'next/link';
import { RiQuestionFill } from '@remixicon/react';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty.tsx';
import { Button } from '@/components/ui/button.tsx';

interface Props {
  title: string;
  description: string;
  href: string;
  linkLabel: string;
  className?: string;
}

const NotFoundState = ({ title, description, href, linkLabel, className }: Props) => {
  return (
    <Empty className={className}>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <RiQuestionFill />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent className="flex-row justify-center gap-2">
        <Button nativeButton={false} render={<Link href={href} />}>
          {linkLabel}
        </Button>
      </EmptyContent>
    </Empty>
  );
};

export default NotFoundState;
