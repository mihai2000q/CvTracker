export interface Page<T> {
  items: T[];
  totalCount: number;
}

export interface CursorPage<T, Cursor = string> {
  items: T[];
  nextCursor: Cursor | null;
}

// A cursor is the last row's sort values, with its id last as a tie-break, so
// rows that share sort values (two documents with the same name, say) are never
// skipped or repeated across pages. JSON keeps any value, '|' included, safe.
export function encodeCursor(...parts: string[]): string {
  return JSON.stringify(parts);
}

// A malformed cursor reads as "no cursor": the first page.
export function decodeCursor(cursor: string, length: number): string[] | null {
  try {
    const parts: unknown = JSON.parse(cursor);
    const valid =
      Array.isArray(parts) &&
      parts.length === length &&
      parts.every((part) => typeof part === 'string');
    return valid ? parts : null;
  } catch {
    return null;
  }
}
