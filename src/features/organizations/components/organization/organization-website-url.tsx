'use client';

import React from 'react';
import { RiLink } from '@remixicon/react';

const OrganizationWebsiteUrl = ({ link }: { link: string }) => {
  return (
    <div
      className={'flex gap-0.75 text-[0.6875rem] text-blue-500 hover:underline'}
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      <RiLink className={'size-3'} />
      <a target="_blank" href={link} rel="noopener noreferrer">
        {link}
      </a>
    </div>
  );
};

export default OrganizationWebsiteUrl;
