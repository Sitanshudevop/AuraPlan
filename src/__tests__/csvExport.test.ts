import { describe, it, expect } from 'vitest';
import { escapeCsvCell, buildCsv } from '../utils/csv';

describe('CSV Security and Formatting (RFC 4180 & CWE-1236)', () => {
  it('neutralizes spreadsheet formula injection prefixes (=, +, -, @, \\t, \\r)', () => {
    expect(escapeCsvCell('=1+1')).toBe(`"'=1+1"`);
    expect(escapeCsvCell('+SUM(A1:A10)')).toBe(`"'+SUM(A1:A10)"`);
    expect(escapeCsvCell('-2+3')).toBe(`"'-2+3"`);
    expect(escapeCsvCell('@cmd|/C calc')).toBe(`"'@cmd|/C calc"`);
    expect(escapeCsvCell('\tmalicious')).toBe(`"'\tmalicious"`);
    expect(escapeCsvCell('\rmalicious')).toBe(`"'\rmalicious"`);
  });

  it('neutralizes formula injection with leading whitespace, pipe, percent, and newline', () => {
    expect(escapeCsvCell('   =1+1')).toBe(`"'   =1+1"`);
    expect(escapeCsvCell('  +2+3')).toBe(`"'  +2+3"`);
    expect(escapeCsvCell('\t@cmd')).toBe(`"'\t@cmd"`);
    expect(escapeCsvCell('|cmd|/C calc')).toBe(`"'|cmd|/C calc"`);
    expect(escapeCsvCell('%1+1')).toBe(`"'%1+1"`);
    expect(escapeCsvCell('\n=DANGEROUS()')).toBe(`"'\n=DANGEROUS()"`);
  });

  it('preserves valid numbers and booleans as safe primitives', () => {
    expect(escapeCsvCell(123)).toBe('123');
    expect(escapeCsvCell(-45.67)).toBe('-45.67');
    expect(escapeCsvCell(0)).toBe('0');
    expect(escapeCsvCell(true)).toBe('Yes');
    expect(escapeCsvCell(false)).toBe('No');
  });

  it('handles null, undefined, and empty values gracefully', () => {
    expect(escapeCsvCell(null)).toBe('');
    expect(escapeCsvCell(undefined)).toBe('');
    expect(escapeCsvCell('')).toBe('');
  });

  it('escapes embedded quotes and wraps strings with commas in quotes', () => {
    expect(escapeCsvCell('Hello, World')).toBe('"Hello, World"');
    expect(escapeCsvCell('Quote "Test"')).toBe('"Quote ""Test"""');
    expect(escapeCsvCell('Multi\nLine')).toBe('"Multi\nLine"');
  });

  it('builds compliant RFC 4180 CSV tables with headers', () => {
    const headers = ['Name', 'Role', 'Formula Test'];
    const rows = [
      ['Alice', 'Bride', 'Normal String'],
      ['Bob', 'Groom', '=1+1'],
      ['Eve', 'Guest', '@SUM(A1)'],
    ];

    const csv = buildCsv(headers, rows);
    const lines = csv.split('\r\n');

    expect(lines[0]).toBe('Name,Role,Formula Test');
    expect(lines[1]).toBe('Alice,Bride,Normal String');
    expect(lines[2]).toBe('Bob,Groom,"\'=1+1"');
    expect(lines[3]).toBe('Eve,Guest,"\'@SUM(A1)"');
  });
});
