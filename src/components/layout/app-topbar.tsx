import React from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar.tsx';
import { Button } from '@/components/ui/button.tsx';
import { RiAddLine } from '@remixicon/react';
import CreateJobApplicationDialog from '@/features/job-applications/components/create-job-application-dialog.tsx';
import { Separator } from '@/components/ui/separator.tsx';

const AppTopbar = () => {
  return (
    <div className="flex flex-col">
      <header className="flex h-14 w-full shrink-0 items-center gap-2 px-4 transition-[width,height] ease-linear">
        <div className="flex w-full items-center justify-between">
          <SidebarTrigger className="-ml-1" />

          <div className={'flex items-center'}>
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
