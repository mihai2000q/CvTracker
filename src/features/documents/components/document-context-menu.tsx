'use client';

import React, { useState } from 'react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu.tsx';
import { RiDeleteBinLine } from '@remixicon/react';
import DeleteDocumentAlertDialog from '@/features/documents/components/delete-document-alert-dialog.tsx';
import { Document } from '@/features/documents/types/document.ts';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip.tsx';

interface Props {
  document: Document;
  children: React.ReactElement;
}

const DocumentContextMenu = ({ document, children }: Props) => {
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger render={children} />
        <ContextMenuContent>
          <Tooltip disabled={document.jobApplicationsCount === 0}>
            <TooltipTrigger render={<div className="w-full" />}>
              <ContextMenuItem
                variant={'destructive'}
                disabled={document.jobApplicationsCount > 0}
                onClick={() => setDeleteOpen(true)}
              >
                <RiDeleteBinLine />
                Delete
              </ContextMenuItem>
            </TooltipTrigger>
            <TooltipContent side={'right'}>
              Used by {document.jobApplicationsCount}{' '}
              {document.jobApplicationsCount === 1 ? 'job' : 'jobs'}
            </TooltipContent>
          </Tooltip>
        </ContextMenuContent>
      </ContextMenu>

      <DeleteDocumentAlertDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        document={document}
      />
    </>
  );
};

export default DocumentContextMenu;
