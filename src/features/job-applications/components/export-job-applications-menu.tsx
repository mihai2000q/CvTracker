import React from 'react';
import { RiFileExcelLine, RiFileTextLine } from '@remixicon/react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx';

// The route answers with an attachment, so the page stays where it is while the file downloads
const exportUrl = (format: 'csv' | 'xlsx') => `/api/job-applications/export?format=${format}`;

const ExportJobApplicationsMenu = ({ children }: { children: React.ReactElement }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={children} />
      <DropdownMenuContent align={'center'} className={'min-w-fit'}>
        <DropdownMenuItem render={<a href={exportUrl('csv')} download />}>
          <RiFileTextLine />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem render={<a href={exportUrl('xlsx')} download />}>
          <RiFileExcelLine />
          Export as Excel
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ExportJobApplicationsMenu;
