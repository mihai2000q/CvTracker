import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination.tsx';
import { redirect } from 'next/navigation';
import { DEFAULT_PAGE_SIZE } from '@/schemas/page-pagination-schema.ts';

interface Props {
  page: number;
  totalCount: number;
  hrefForPage: (page: number) => string;
  pageSize?: number;
}

const AppPagination = ({ page, totalCount, hrefForPage, pageSize = DEFAULT_PAGE_SIZE }: Props) => {
  // guard when page is not within range
  const lastPage = Math.max(1, Math.ceil(totalCount / pageSize));
  if (page > lastPage) {
    redirect(hrefForPage(lastPage));
  }

  const totalPages = Math.ceil(totalCount / pageSize);
  if (totalPages <= 1) return null;

  return (
    <Pagination className={'mx-0 w-auto'}>
      <PaginationContent>
        {page > 1 && (
          <PaginationItem>
            <PaginationPrevious href={hrefForPage(page - 1)} />
          </PaginationItem>
        )}
        {getPageNumbers(page, totalPages).map((entry, index) => (
          <PaginationItem key={`${entry}-${index}`}>
            {entry === 'ellipsis' ? (
              <PaginationEllipsis />
            ) : (
              <PaginationLink href={hrefForPage(entry)} isActive={entry === page}>
                {entry}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}
        {page < totalPages && (
          <PaginationItem>
            <PaginationNext href={hrefForPage(page + 1)} />
          </PaginationItem>
        )}
      </PaginationContent>
    </Pagination>
  );
};

// First and last page, the current page and its neighbours; gaps become ellipses.
function getPageNumbers(current: number, total: number): (number | 'ellipsis')[] {
  const wanted = new Set([1, total, current - 1, current, current + 1]);
  const pages = [...wanted].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);
  return pages.flatMap((n, i) => (i > 0 && n - pages[i - 1] > 1 ? ['ellipsis' as const, n] : [n]));
}

export default AppPagination;
