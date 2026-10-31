/**
 * Utility for CSV escaping and construction with defense against CSV Formula Injection (CWE-1236).
 */

const FORMULA_PREFIX_REGEX = /^[=+\-@\t\r]/;

/**
 * Escapes an individual CSV cell according to RFC 4180 and formula injection security principles.
 * - Numbers and booleans remain unadulterated primitives (e.g., negative amounts remain valid numbers).
 * - Text fields starting with formula operators (=, +, -, @, \t, \r) are prefixed with a single quote (')
 *   to neutralize formula execution in spreadsheet software (Excel, Google Sheets, LibreOffice).
 * - Fields containing quotes, commas, or newlines are wrapped in double quotes, with internal quotes escaped.
 */
export function escapeCsvCell(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? String(value) : '';
  }

  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }

  let str = String(value);

  // Neutralize formula injection for text starting with unsafe characters
  if (FORMULA_PREFIX_REGEX.test(str)) {
    str = `'${str}`;
  }

  // Quote field if it contains commas, double quotes, newlines, or was prefixed
  if (/[",\r\n]/.test(str) || str.startsWith("'")) {
    return `"${str.replace(/"/g, '""')}"`;
  }

  return str;
}

/**
 * Builds an RFC-4180 compliant CSV string from headers and data rows.
 */
export function buildCsv(
  headers: string[],
  rows: (string | number | boolean | null | undefined)[][]
): string {
  const headerLine = headers.map((h) => escapeCsvCell(h)).join(',');
  const rowLines = rows.map((row) => row.map((cell) => escapeCsvCell(cell)).join(','));
  return [headerLine, ...rowLines].join('\r\n');
}

