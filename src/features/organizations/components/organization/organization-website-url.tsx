import React from 'react';
import { RiLink } from '@remixicon/react';

const toHostname = (link: string) => {
  try {
    return new URL(link).hostname.replace(/^www\./, '');
  } catch {
    return link;
  }
};

const OrganizationWebsiteUrl = ({ link }: { link: string }) => {
  return (
    <div
      className={
        'flex max-w-[50%] min-w-0 items-center gap-1 text-[0.6875rem] font-medium text-muted-foreground'
      }
    >
      <RiLink className={'size-3 shrink-0'} />
      <a
        target="_blank"
        href={link}
        title={link}
        rel="noopener noreferrer"
        className={'pointer-events-auto truncate hover:underline'}
      >
        {toHostname(link)}
      </a>
    </div>
  );
};

export default OrganizationWebsiteUrl;
