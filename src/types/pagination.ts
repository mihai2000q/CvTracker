export interface CursorPage<T, Cursor = string> {
  items: T[];
  nextCursor: Cursor | null;
}
