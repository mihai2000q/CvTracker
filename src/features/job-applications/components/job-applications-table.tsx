import React from 'react';
import {
  isInterviewing,
  JobApplication,
} from '@/features/job-applications/types/job-application.ts';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '@/components/ui/table.tsx';
import { Avatar, AvatarFallback } from '@/components/ui/avatar.tsx';
import { RiEarthFill, RiExternalLinkLine, RiFileFill } from '@remixicon/react';
import Link from 'next/link';
import PastDate from '@/components/date/past-date.tsx';
import DocumentHoverCard from '@/features/documents/components/document-hover-card.tsx';
import JobApplicationSourceIcon from '@/features/job-applications/components/source/job-application-source-icon.tsx';
import JobApplicationContextMenu from '@/features/job-applications/components/job-application-context-menu.tsx';
import InterviewRoundHoverCard from '@/features/job-applications/components/interview/interview-round-hover-card.tsx';
import NextInterview from '@/features/job-applications/components/interview/next-interview.tsx';
import TableHeadSortButton from '@/components/sort/table-head-sort-button.tsx';
import TableHeadSortMenu from '@/components/sort/table-head-sort-menu.tsx';
import { buildColumnSort, type SortEntry } from '@/lib/sort.ts';
import type { JobApplicationSortField } from '@/features/job-applications/constants/job-application-sorting.ts';
import JobApplicationStatusBadge from '@/features/job-applications/components/status/job-application-status-badge.tsx';

interface Props {
  jobApplications: JobApplication[];
  sortBy: string[];
  hrefForSortBy: (sortBy: SortEntry<JobApplicationSortField>[]) => string;
}

const JobApplicationsTable = ({ jobApplications, sortBy, hrefForSortBy }: Props) => {
  const sortOf = (field: JobApplicationSortField) => buildColumnSort(field, sortBy, hrefForSortBy);

  return (
    // Fixed, so every column keeps its share of the width and long text truncates instead of growing it
    <Table className={'min-w-5xl table-fixed'}>
      <TableHeader>
        <TableRow>
          <TableHeadSortMenu
            className={'w-[32%]'}
            options={[
              { label: 'Title', ...sortOf('title') },
              { label: 'Organization', ...sortOf('organization') },
            ]}
          >
            Title & Organization
          </TableHeadSortMenu>
          <TableHeadSortMenu
            className={'2xl:w-[16%]'}
            options={[
              { label: 'Country', ...sortOf('country') },
              { label: 'Source', ...sortOf('source') },
            ]}
          >
            Context
          </TableHeadSortMenu>
          <TableHeadSortMenu
            className={'hidden xl:table-cell 2xl:w-[16%]'}
            options={[
              { label: 'CV', ...sortOf('cv') },
              { label: 'Cover letter', ...sortOf('coverLetter') },
            ]}
          >
            Documents
          </TableHeadSortMenu>
          <TableHeadSortButton className={'2xl:w-[14%]'} sort={sortOf('status')}>
            Status
          </TableHeadSortButton>
          <TableHeadSortButton
            className={'hidden w-[15%] 2xl:table-cell'}
            sort={sortOf('nextInterview')}
          >
            Next interview
          </TableHeadSortButton>
          <TableHeadSortButton className={'2xl:w-[12%]'} sort={sortOf('appliedAt')}>
            Applied at
          </TableHeadSortButton>
        </TableRow>
      </TableHeader>

      <TableBody>
        {jobApplications.map((jobApplication) => (
          <JobApplicationContextMenu key={jobApplication.id} jobApplication={jobApplication}>
            <TableRow>
              <TableCell>
                <div className={'flex flex-row items-center gap-4'}>
                  <Avatar className={'size-10 rounded-xl'}>
                    <AvatarFallback>
                      <span className={'text-lg'}>{jobApplication.organization.name[0]}</span>
                    </AvatarFallback>
                  </Avatar>
                  <div className={'flex min-w-0 flex-col'}>
                    <div className={'flex items-center gap-1.5'}>
                      <Link
                        href={`/jobs/${jobApplication.id}`}
                        prefetch={false}
                        title={jobApplication.title}
                        className={'link-underline max-w-64 truncate'}
                      >
                        {jobApplication.title}
                      </Link>
                      {jobApplication.postingUrl && (
                        <a
                          href={jobApplication.postingUrl}
                          target={'_blank'}
                          rel={'noopener noreferrer'}
                          aria-label={'Open job posting'}
                          title={'Open the job posting'}
                          className={
                            'text-muted-foreground/60 hover:text-foreground mb-1 shrink-0 transition-colors'
                          }
                        >
                          <RiExternalLinkLine className={'size-3.5'} />
                        </a>
                      )}
                    </div>
                    <Link
                      href={`/organizations/${jobApplication.organization.id}`}
                      prefetch={false}
                      title={jobApplication.organization.name}
                      className={
                        'link-underline text-muted-foreground w-fit max-w-64 truncate text-xs'
                      }
                    >
                      {jobApplication.organization.name}
                    </Link>
                  </div>
                </div>
              </TableCell>

              <TableCell>
                <div className={'flex flex-col gap-2 text-xs'}>
                  <Link
                    href={`/countries/${jobApplication.country.id}`}
                    prefetch={false}
                    className={
                      'link-underline flex w-fit max-w-full flex-row items-center gap-1 leading-none'
                    }
                  >
                    <RiEarthFill className={'size-4 -translate-y-px'} />
                    <span className={'truncate'}>{jobApplication.country.name}</span>
                  </Link>
                  {jobApplication.source && (
                    <div
                      className={
                        'text-muted-foreground flex flex-row items-center gap-1 leading-none'
                      }
                    >
                      <JobApplicationSourceIcon
                        source={jobApplication.source}
                        className={'size-4 -translate-y-px'}
                      />
                      <span className={'truncate'}>{jobApplication.source}</span>
                    </div>
                  )}
                </div>
              </TableCell>

              <TableCell className={'hidden xl:table-cell'}>
                <div className={'text-muted-foreground flex flex-col gap-1.5 text-xs'}>
                  <DocumentHoverCard document={jobApplication.cv}>
                    <Link
                      href={`/documents/${jobApplication.cv.id}`}
                      prefetch={false}
                      className={
                        'link-underline flex w-fit max-w-full flex-row items-center gap-1 leading-none'
                      }
                    >
                      <RiFileFill
                        data-document-type={jobApplication.cv.type}
                        className={'size-4 -translate-y-px text-(--document-color)'}
                      />
                      <span className={'truncate'}>{jobApplication.cv.name}</span>
                    </Link>
                  </DocumentHoverCard>
                  {jobApplication.coverLetter && (
                    <DocumentHoverCard document={jobApplication.coverLetter}>
                      <Link
                        href={`/documents/${jobApplication.coverLetter.id}`}
                        prefetch={false}
                        className={
                          'link-underline flex w-fit max-w-full flex-row items-center gap-1 leading-none'
                        }
                      >
                        <RiFileFill
                          data-document-type={jobApplication.coverLetter.type}
                          className={'size-4 -translate-y-px text-(--document-color)'}
                        />
                        <span className={'truncate'}>{jobApplication.coverLetter.name}</span>
                      </Link>
                    </DocumentHoverCard>
                  )}
                </div>
              </TableCell>

              <TableCell>
                {isInterviewing(jobApplication) ? (
                  <InterviewRoundHoverCard rounds={jobApplication.interviewRounds}>
                    <JobApplicationStatusBadge status={jobApplication.currentStatus} />
                  </InterviewRoundHoverCard>
                ) : (
                  <JobApplicationStatusBadge status={jobApplication.currentStatus} />
                )}
              </TableCell>

              <TableCell className={'hidden 2xl:table-cell'}>
                {isInterviewing(jobApplication) ? (
                  <NextInterview rounds={jobApplication.interviewRounds} />
                ) : (
                  <span className={'text-muted-foreground/60 text-xs italic'}>No interview</span>
                )}
              </TableCell>

              <TableCell className={'text-muted-foreground text-xs'}>
                <PastDate date={jobApplication.appliedAt} />
              </TableCell>
            </TableRow>
          </JobApplicationContextMenu>
        ))}
      </TableBody>
    </Table>
  );
};

export default JobApplicationsTable;
