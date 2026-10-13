'use client';

import React, { useState } from 'react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu.tsx';
import { RiDeleteBinLine, RiDownload2Line, RiExternalLinkLine } from '@remixicon/react';
import DeleteDocumentAlertDialog from '@/features/documents/components/delete-document-alert-dialog.tsx';
import { Document } from '@/features/documents/types/document.ts';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip.tsx';

interface Props {
  document: Document;
  children: React.ReactElement;
}

const DocumentContextMenu = ({ document, children }: Props) => {
  // Browsers only render PDFs; the other types would just download
  const isPdf = document.originalFilename.toLowerCase().endsWith('.pdf');
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger render={children} />
        <ContextMenuContent>
          <Tooltip disabled={isPdf}>
            <TooltipTrigger closeOnClick={false} render={<div className="w-full" />}>
              <ContextMenuItem
                disabled={!isPdf}
                render={
                  <a
                    href={`/api/documents/${document.id}/download?inline=1`}
                    target={'_blank'}
                    rel={'noopener noreferrer'}
                  />
                }
              >
                <RiExternalLinkLine />
                Open in new tab
              </ContextMenuItem>
            </TooltipTrigger>
            <TooltipContent side={'right'}>Only PDFs can be opened in the browser</TooltipContent>
          </Tooltip>
          <ContextMenuItem render={<a href={`/api/documents/${document.id}/download`} download />}>
            <RiDownload2Line />
            Download
          </ContextMenuItem>

          <ContextMenuSeparator />

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
