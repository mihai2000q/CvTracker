import React from 'react';
import { RiBuildingLine, RiFileFill, RiFileLine, RiGlobalLine, RiLink } from '@remixicon/react';
import LinkMultiCombobox from '@/components/combobox/link-multi-combobox.tsx';
import FlagIcon from '@/features/countries/components/flag-icon.tsx';
import AppliedAtFilter from '@/features/job-applications/components/applied-at-filter.tsx';
import JobApplicationSourceIcon from '@/features/job-applications/components/source/job-application-source-icon.tsx';
import JobApplicationsSearchInput from '@/features/job-applications/components/job-applications-search-input.tsx';
import { JOB_SOURCES } from '@/features/job-applications/constants/job-sources.ts';
import { DocumentType } from '@/features/documents/types/enums/document-type.ts';
import type { FilterOperator } from '@/lib/filter.ts';
import type { LinkOption } from '@/lib/link-option.ts';
import type { JobApplicationFilterField } from '@/features/job-applications/constants/job-application-filtering.ts';
import type { JobApplicationFiltersMetadata } from '@/features/job-applications/types/job-application-filters-metadata.ts';

// Names of organizations and CVs run long: the dropdown fits the longest, up to a limit
const WIDE_DROPDOWN = 'w-max max-w-[min(20rem,var(--available-width))]';

type FilterLink = Pick<LinkOption, 'href' | 'active'>;

interface Props {
  filtersMetadata: JobApplicationFiltersMetadata;
  filterOption: (
    field: JobApplicationFilterField,
    operator: FilterOperator,
    value: unknown
  ) => FilterLink;
  filterToggle: (field: JobApplicationFilterField, value: unknown) => FilterLink;
}

const JobApplicationsToolbar = ({
  filtersMetadata: { organizations, countries, cvs },
  filterOption,
  filterToggle,
}: Props) => {
  const clearHref = (field: JobApplicationFilterField) => filterOption(field, 'in', undefined).href;

  return (
    <div className={'flex flex-row flex-wrap gap-4'}>
      <JobApplicationsSearchInput
        placeholder="Search by title or organization..."
        className={'min-w-55 flex-1'}
      />

      <LinkMultiCombobox
        icon={<RiBuildingLine />}
        options={organizations.map(({ id, name }) => ({
          label: name,
          ...filterToggle('organization', id),
        }))}
        allLabel="All organizations"
        clearHref={clearHref('organization')}
        contentClassName={WIDE_DROPDOWN}
        inputProps={{ className: 'w-full sm:w-60' }}
      />

      <LinkMultiCombobox
        icon={<RiGlobalLine />}
        options={countries.map(({ id, name, isoCode }) => ({
          label: name,
          icon: <FlagIcon isoCode={isoCode} circle />,
          ...filterToggle('country', id),
        }))}
        allLabel="All countries"
        clearHref={clearHref('country')}
        contentClassName={'w-55'}
        contentAlign={'center'}
        inputProps={{ className: 'w-full sm:w-45' }}
      />

      <LinkMultiCombobox
        icon={<RiLink />}
        options={JOB_SOURCES.map((source) => ({
          label: source,
          icon: <JobApplicationSourceIcon source={source} colored />,
          ...filterToggle('source', source),
        }))}
        allLabel="All sources"
        clearHref={clearHref('source')}
        inputProps={{ className: 'w-full sm:w-50' }}
      />

      <LinkMultiCombobox
        icon={<RiFileLine />}
        options={cvs.map(({ id, name }) => ({
          label: name,
          icon: (
            <RiFileFill
              data-document-type={DocumentType.CV}
              className={'text-(--document-color)'}
            />
          ),
          ...filterToggle('cv', id),
        }))}
        allLabel="All CVs"
        clearHref={clearHref('cv')}
        contentClassName={WIDE_DROPDOWN}
        inputProps={{ className: 'w-full sm:w-45' }}
      />

      <AppliedAtFilter className={'w-full sm:w-48'} />
    </div>
  );
};

export default JobApplicationsToolbar;
