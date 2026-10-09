export interface Page<T> {
  items: T[];
  totalCount: number;
}

export interface CursorPage<T, Cursor = string> {
  items: T[];
  nextCursor: Cursor | null;
}
