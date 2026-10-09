interface Pageable<Query> {
  limit(count: number): Query;
  offset(count: number): Query;
}

export interface PageParams {
  page: number; // 1-based
  pageSize: number;
}

export function paginate<Query extends Pageable<Query>>(
  query: Query,
  { page, pageSize }: PageParams
): Query {
  return query.limit(pageSize).offset((page - 1) * pageSize);
}
