'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RiDeleteBinLine, RiDownload2Line, RiEdit2Line } from '@remixicon/react';
import { Button } from '@/components/ui/button.tsx';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip.tsx';
import DeleteDocumentAlertDialog from '@/features/documents/components/delete-document-alert-dialog.tsx';
import EditDocumentDialog from '@/features/documents/components/edit-document-dialog.tsx';
import { Document } from '@/features/documents/types/document.ts';

const DocumentActions = ({ document }: { document: Document }) => {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const isUsed = document.jobApplicationsCount > 0;

  return (
    <>
      <div className={'flex w-full flex-col gap-2'}>
        <Button
          variant={'secondary'}
          nativeButton={false}
          render={<a href={`/api/documents/${document.id}/download`} download />}
        >
          <RiDownload2Line />
          Download
        </Button>

        <div className={'grid grid-cols-2 gap-2'}>
          <Button variant={'tertiary'} onClick={() => setEditOpen(true)}>
            <RiEdit2Line />
            Edit
          </Button>
          <Tooltip disabled={!isUsed}>
            <TooltipTrigger render={<div className={'w-full'} />}>
              <Button
                variant={'destructive'}
                className={'w-full'}
                disabled={isUsed}
                onClick={() => setDeleteOpen(true)}
              >
                <RiDeleteBinLine />
                Delete
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Used by {document.jobApplicationsCount}{' '}
              {document.jobApplicationsCount === 1 ? 'job' : 'jobs'}
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      <EditDocumentDialog document={document} open={editOpen} onOpenChange={setEditOpen} />
      <DeleteDocumentAlertDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        document={document}
        onDeleted={() => router.replace('/documents')}
      />
    </>
  );
};

export default DocumentActions;
