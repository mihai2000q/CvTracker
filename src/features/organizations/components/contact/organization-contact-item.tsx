'use client';

import React, { useState } from 'react';
import {
  RiDeleteBinLine,
  RiEdit2Line,
  RiMailLine,
  RiMoreLine,
  RiPhoneLine,
} from '@remixicon/react';
import { Card } from '@/components/ui/card.tsx';
import { Button } from '@/components/ui/button.tsx';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx';
import DeleteContactAlertDialog from '@/features/organizations/components/contact/delete-contact-alert-dialog.tsx';
import EditContactDialog from '@/features/organizations/components/contact/edit-contact-dialog.tsx';
import { Contact } from '@/features/organizations/types/contact.ts';

interface Props {
  contact: Contact;
  organizationId: string;
}

const OrganizationContactItem = ({ contact, organizationId }: Props) => {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <Card className={'gap-2 p-4'}>
        <div className={'flex items-start justify-between gap-2'}>
          <div className={'flex min-w-0 flex-col'}>
            <div title={contact.name} className={'truncate font-semibold'}>
              {contact.name}
            </div>
            {contact.role && (
              <div className={'text-muted-foreground truncate text-xs'}>{contact.role}</div>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant={'ghost'}
                  size={'icon-sm'}
                  aria-label={`Actions for ${contact.name}`}
                  className={'-mt-1 -mr-1 shrink-0'}
                />
              }
            >
              <RiMoreLine />
            </DropdownMenuTrigger>
            <DropdownMenuContent align={'end'}>
              <DropdownMenuItem onClick={() => setEditOpen(true)}>
                <RiEdit2Line />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant={'destructive'} onClick={() => setDeleteOpen(true)}>
                <RiDeleteBinLine />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {(contact.email || contact.phone) && (
          <div className={'text-muted-foreground flex flex-col gap-1 text-xs'}>
            {contact.email && (
              <a
                href={`mailto:${contact.email}`}
                title={contact.email}
                className={'link-underline flex w-fit max-w-full items-center gap-1.5'}
              >
                <RiMailLine className={'size-3.5 shrink-0'} />
                <span className={'truncate'}>{contact.email}</span>
              </a>
            )}
            {contact.phone && (
              <a
                href={`tel:${contact.phone}`}
                className={'link-underline flex w-fit items-center gap-1.5'}
              >
                <RiPhoneLine className={'size-3.5 shrink-0'} />
                {contact.phone}
              </a>
            )}
          </div>
        )}
      </Card>

      <EditContactDialog
        contact={contact}
        organizationId={organizationId}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
      <DeleteContactAlertDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        contact={contact}
        organizationId={organizationId}
      />
    </>
  );
};

export default OrganizationContactItem;
