// Read by Excel as UTF-8 only with this mark in front, otherwise umlauts come out garbled
const UTF8_BOM = '﻿';

// A cell starting with one of these is run as a formula by spreadsheet apps, so a job title or
// note like `=HYPERLINK(...)` would execute when the file is opened
const FORMULA_TRIGGER = /^[=+\-@\t\r]/;

function toCell(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '';

  let text = String(value);
  if (typeof value === 'string' && FORMULA_TRIGGER.test(text)) {
    text = `'${text}`;
  }
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function toCsv(
  headers: readonly string[],
  rows: readonly (string | number | null | undefined)[][]
): string {
  const lines = [headers, ...rows].map((row) => row.map(toCell).join(','));
  return UTF8_BOM + lines.join('\r\n') + '\r\n';
}
