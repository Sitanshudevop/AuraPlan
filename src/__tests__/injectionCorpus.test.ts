import { describe, it, expect } from 'vitest';
import { sanitizeText, sanitizeObject } from '../utils/security';

describe('Injection Corpus Security Suite (F7)', () => {
  it('strips null bytes (\\0) to prevent poison null byte exploits', () => {
    const malicious = 'image.png\0.php<script>alert(1)</script>';
    const cleaned = sanitizeText(malicious);
    expect(cleaned).not.toContain('\0');
    expect(cleaned).not.toContain('<script>');
    expect(cleaned).toBe('image.png.php');
  });

  it('strips unicode bidirectional overrides (RLO/LRO/etc.) to prevent text spoofing', () => {
    // U+202E is RIGHT-TO-LEFT OVERRIDE
    const bidiPayload = 'normal\u202Ecodereversed\u202Ctest';
    const cleaned = sanitizeText(bidiPayload);
    expect(cleaned).not.toContain('\u202E');
    expect(cleaned).not.toContain('\u202C');
    expect(cleaned).toBe('normalcodereversedtest');
  });

  it('safely handles template literals ${...} without execution', () => {
    const templateInput = 'Hello ${process.env.SECRET_KEY || eval("evil")} world';
    const cleaned = sanitizeText(templateInput);
    // Preserves literal string content safely without executing
    expect(cleaned).toBe('Hello ${process.env.SECRET_KEY || eval("evil")} world');
  });

  it('neutralizes multi-layer JSON evasion strings', () => {
    const layered = '{"nested": "{\\"payload\\": \\"<script>alert(1)</script>\\"}"}';
    const sanitized = sanitizeText(layered);
    expect(sanitized).not.toContain('<script>');
    expect(sanitized).not.toContain('alert(1)');
  });

  it('handles nested and malformed tags like <<script>', () => {
    const nested = '<<script>alert(1)</script>';
    const cleaned = sanitizeText(nested);
    expect(cleaned).not.toContain('<script');
    expect(cleaned).not.toContain('alert(1)');
  });

  it('sanitizes deeply nested JSON (depth > 20) without crashing or overflowing stack', () => {
    // Build a nested object with depth 25
    let deepObj: Record<string, unknown> = {
      level: 25,
      content: '<script>alert("deep")</script>clean',
    };
    for (let i = 24; i >= 0; i--) {
      deepObj = { level: i, child: deepObj };
    }

    const sanitized = sanitizeObject(deepObj, 30);
    expect(sanitized).toBeDefined();

    // Traverse down to leaf
    let current: unknown = sanitized;
    for (let i = 0; i <= 24; i++) {
      current = (current as Record<string, unknown>).child;
    }
    const leaf = current as { level: number; content: string };
    expect(leaf.content).toBe('clean');
    expect(leaf.content).not.toContain('<script>');
  });
});

