'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { RiAddLine, RiDeleteBinLine, RiExternalLinkLine, RiEyeLine } from '@remixicon/react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu.tsx';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip.tsx';
import CreateJobApplicationDialog from '@/features/job-applications/components/create-job-application-dialog.tsx';
import DeleteOrganizationAlertDialog from '@/features/organizations/components/delete-organization-alert-dialog.tsx';
import { Organization } from '@/features/organizations/types/organization.ts';

interface Props {
  organization: Pick<Organization, 'id' | 'name' | 'websiteUrl' | 'countries'>;
  jobApplicationsCount: number;
  children: React.ReactElement;
}

const OrganizationContextMenu = ({ organization, jobApplicationsCount, children }: Props) => {
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger render={children} />
        <ContextMenuContent>
          <ContextMenuItem
            render={<Link href={`/organizations/${organization.id}`} prefetch={false} />}
          >
            <RiEyeLine />
            View details
          </ContextMenuItem>
          <ContextMenuItem onClick={() => setCreateOpen(true)}>
            <RiAddLine />
            Add job application
          </ContextMenuItem>

          <Tooltip disabled={!!organization.websiteUrl}>
            <TooltipTrigger closeOnClick={false} render={<div className="w-full" />}>
              <ContextMenuItem
                disabled={!organization.websiteUrl}
                render={
                  <a
                    href={organization.websiteUrl ?? undefined}
                    target={'_blank'}
                    rel={'noopener noreferrer'}
                  />
                }
              >
                <RiExternalLinkLine />
                Open website
              </ContextMenuItem>
            </TooltipTrigger>
            <TooltipContent side={'right'}>This organization has no website</TooltipContent>
          </Tooltip>

          <ContextMenuSeparator />

          <ContextMenuItem variant={'destructive'} onClick={() => setDeleteOpen(true)}>
            <RiDeleteBinLine />
            Delete
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      <CreateJobApplicationDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        organization={organization}
      />
      <DeleteOrganizationAlertDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        organization={organization}
        jobApplicationsCount={jobApplicationsCount}
      />
    </>
  );
};

export default OrganizationContextMenu;
