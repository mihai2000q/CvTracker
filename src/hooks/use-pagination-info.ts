interface Props {
  totalCount: number | undefined;
  pageSize: number;
  currentPage: number;
}
interface ReturnType {
  startCount: number;
  endCount: number;
  totalPages: number;
}

export function usePaginationInfo({ totalCount, pageSize, currentPage }: Props): ReturnType {
  if (!totalCount || totalCount === 0) {
    return { startCount: 0, endCount: 0, totalPages: 0 };
  }

  const totalPages = Math.ceil(totalCount / pageSize);

  const startCount = currentPage === 1 ? 1 : pageSize * (currentPage - 1) + 1;

  const endCount = currentPage === totalPages ? totalCount : currentPage * pageSize;

  return { startCount, endCount, totalPages };
}
