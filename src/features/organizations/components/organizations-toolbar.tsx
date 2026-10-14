import React from 'react';
import { RiAddLine, RiGlobalLine } from '@remixicon/react';
import { Button } from '@/components/ui/button.tsx';
import CreateOrganizationDialog from '@/features/organizations/components/create-organization-dialog.tsx';
import OrganizationsSearchInput from '@/features/organizations/components/organizations-search-input.tsx';
import FlagIcon from '@/features/countries/components/flag-icon.tsx';
import { Card } from '@/components/ui/card.tsx';
import LinkCombobox from '@/components/combobox/link-combobox.tsx';
import LinkMultiCombobox from '@/components/combobox/link-multi-combobox.tsx';
import { buildSortOptions, SortEntry } from '@/lib/sort.ts';
import type { FilterOperator } from '@/lib/filter.ts';
import type { LinkOption } from '@/lib/link-option.ts';
import {
  ORGANIZATION_SORT_PRESETS,
  OrganizationSortField,
} from '@/features/organizations/constants/organization-sorting.tsx';
import type { OrganizationFilterField } from '@/features/organizations/constants/organization-filtering.ts';
import type { OrganizationFiltersMetadata } from '@/features/organizations/types/organization-filters-metadata.ts';

type FilterLink = Pick<LinkOption, 'href' | 'active'>;

interface Props {
  filtersMetadata: OrganizationFiltersMetadata;
  sortBy: string[];
  hrefForSortBy: (sortBy: SortEntry<OrganizationSortField>[]) => string;
  filterOption: (
    field: OrganizationFilterField,
    operator: FilterOperator,
    value: unknown
  ) => FilterLink;
  filterToggle: (field: OrganizationFilterField, value: unknown) => FilterLink;
}

const OrganizationsToolbar = ({
  filtersMetadata: { countries },
  sortBy,
  hrefForSortBy,
  filterOption,
  filterToggle,
}: Props) => {
  return (
    <Card className={'flex flex-row flex-wrap gap-4 px-4.5 py-4'}>
      <CreateOrganizationDialog>
        <Button className={'pl-1.5'}>
          <RiAddLine />
          New Organization
        </Button>
      </CreateOrganizationDialog>

      <OrganizationsSearchInput
        placeholder="Search by name..."
        className={'dark:bg-background min-w-48 flex-1'}
      />

      <LinkMultiCombobox
        icon={<RiGlobalLine />}
        options={countries.map(({ id, name, isoCode }) => ({
          label: name,
          icon: <FlagIcon isoCode={isoCode} circle />,
          ...filterToggle('country', id),
        }))}
        allLabel="All countries"
        clearHref={filterOption('country', 'in', undefined).href}
        inputProps={{ className: 'dark:bg-background w-full sm:w-50' }}
      />

      <LinkCombobox
        options={buildSortOptions(ORGANIZATION_SORT_PRESETS, sortBy, hrefForSortBy)}
        inputProps={{
          className: 'dark:bg-background w-full sm:w-50',
          placeholder: 'Sort organizations by...',
        }}
      />
    </Card>
  );
};

export default OrganizationsToolbar;
