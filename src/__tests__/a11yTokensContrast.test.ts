import { describe, it, expect } from 'vitest';
import fs from 'fs';

function sRgbToLinear(c: number): number {
  const norm = c / 255;
  return norm <= 0.03928 ? norm / 12.92 : Math.pow((norm + 0.055) / 1.055, 2.4);
}

function hexToRgb(hex: string): [number, number, number] {
  const cleaned = hex.replace('#', '').trim();
  const num = parseInt(cleaned, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex);
  return 0.2126 * sRgbToLinear(r) + 0.7152 * sRgbToLinear(g) + 0.0722 * sRgbToLinear(b);
}

function contrastRatio(hex1: string, hex2: string): number {
  const l1 = relativeLuminance(hex1);
  const l2 = relativeLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function extractCssVar(cssContent: string, selector: string, varName: string): string {
  const blockRegex = new RegExp(`${selector}\\s*\\{([^}]+)\\}`, 'm');
  const match = cssContent.match(blockRegex);
  if (!match) throw new Error(`Selector ${selector} not found in css`);
  const varRegex = new RegExp(`${varName}:\\s*([^;\\n]+);`);
  const varMatch = match[1].match(varRegex);
  if (!varMatch) throw new Error(`Variable ${varName} not found in selector ${selector}`);
  return varMatch[1].trim();
}

describe('A11Y-03: Design System Contrast Tokens (WCAG 2.1 AA Compliance)', () => {
  const css = fs.readFileSync('src/index.css', 'utf8');

  describe('Light Theme Tokens', () => {
    const surface = extractCssVar(css, ':root', '--color-surface');
    const surfaceRaised = extractCssVar(css, ':root', '--color-surface-raised');
    const borderControl = extractCssVar(css, ':root', '--border-control');
    const focusRing = extractCssVar(css, ':root', '--color-focus-ring');
    const placeholder = extractCssVar(css, ':root', '--color-placeholder');

    it('enforces form control border contrast >= 3:1 against surface and raised background', () => {
      const ratioSurface = contrastRatio(borderControl, surface);
      const ratioRaised = contrastRatio(borderControl, surfaceRaised);

      expect(ratioSurface).toBeGreaterThanOrEqual(3.0);
      expect(ratioRaised).toBeGreaterThanOrEqual(3.0);
    });

    it('enforces focus ring contrast >= 3:1 against surface', () => {
      const ratio = contrastRatio(focusRing, surface);
      expect(ratio).toBeGreaterThanOrEqual(3.0);
    });

    it('enforces placeholder text contrast >= 4.5:1 against surface', () => {
      const ratio = contrastRatio(placeholder, surface);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });
  });

  describe('Dark Theme Tokens', () => {
    const surface = extractCssVar(css, '\\.dark', '--color-surface');
    const surfaceRaised = extractCssVar(css, '\\.dark', '--color-surface-raised');
    const borderControl = extractCssVar(css, '\\.dark', '--border-control');
    const focusRing = extractCssVar(css, '\\.dark', '--color-focus-ring');
    const placeholder = extractCssVar(css, '\\.dark', '--color-placeholder');

    it('enforces form control border contrast >= 3:1 against dark surface and raised background', () => {
      const ratioSurface = contrastRatio(borderControl, surface);
      const ratioRaised = contrastRatio(borderControl, surfaceRaised);

      expect(ratioSurface).toBeGreaterThanOrEqual(3.0);
      expect(ratioRaised).toBeGreaterThanOrEqual(3.0);
    });

    it('enforces focus ring contrast >= 3:1 against dark surface', () => {
      const ratio = contrastRatio(focusRing, surface);
      expect(ratio).toBeGreaterThanOrEqual(3.0);
    });

    it('enforces placeholder text contrast >= 4.5:1 against dark surface', () => {
      const ratio = contrastRatio(placeholder, surface);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });
  });

  it('keeps decorative card hairlines subtle using low alpha transparency', () => {
    const lightHairline = extractCssVar(css, ':root', '--color-hairline');
    const darkHairline = extractCssVar(css, '\\.dark', '--color-hairline');

    expect(lightHairline).toContain('0.08');
    expect(darkHairline).toContain('0.08');
  });
});

