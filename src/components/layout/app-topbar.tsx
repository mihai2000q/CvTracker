import React from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar.tsx';
import { Button } from '@/components/ui/button.tsx';
import { RiAddLine, RiArrowDownSLine, RiDownloadLine } from '@remixicon/react';
import CreateJobApplicationDialog from '@/features/job-applications/components/create-job-application-dialog.tsx';
import ExportJobApplicationsMenu from '@/features/job-applications/components/export-job-applications-menu.tsx';
import { Separator } from '@/components/ui/separator.tsx';

const AppTopbar = () => {
  return (
    <div className="flex flex-col">
      <header className="flex h-14 w-full shrink-0 items-center gap-2 px-4 transition-[width,height] ease-linear">
        <div className="flex w-full items-center justify-between">
          <SidebarTrigger className="-ml-1" />

          <div className={'flex items-center gap-2'}>
            <ExportJobApplicationsMenu>
              <Button variant={'outline'} className={'pl-2'}>
                <RiDownloadLine className={'mr-1'} />
                Export
                <RiArrowDownSLine className="ml-0.5 size-4" />
              </Button>
            </ExportJobApplicationsMenu>
            <CreateJobApplicationDialog>
              <Button className={'pl-1.5'}>
                <RiAddLine />
                New Application
              </Button>
            </CreateJobApplicationDialog>
          </div>
        </div>
      </header>
      <Separator />
    </div>
  );
};

export default AppTopbar;
