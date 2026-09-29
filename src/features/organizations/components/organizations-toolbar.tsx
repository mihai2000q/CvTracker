import React from 'react';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group.tsx';
import { RiSearchLine } from '@remixicon/react';
import { Button } from '@/components/ui/button.tsx';
import CreateOrganizationDialog from '@/features/organizations/components/create-organization-dialog.tsx';

const OrganizationsToolbar = () => {
  return (
    <div className={'flex gap-2'}>
      <CreateOrganizationDialog>
        <Button variant={'secondary'}>Create Organization</Button>
      </CreateOrganizationDialog>

      <InputGroup className={'w-auto'}>
        <InputGroupAddon>
          <RiSearchLine />
        </InputGroupAddon>
        <InputGroupInput placeholder="Search by name" />
      </InputGroup>
    </div>
  );
};

export default OrganizationsToolbar;
