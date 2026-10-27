import { describe, it, expect, beforeEach } from 'vitest';
import { sanitizeText, sanitizeObject } from '../utils/security';
import { persistedStateSchema, eventWorkspaceStateSchema } from '../schemas/eventSchemas';
import { loadPersistedState, savePersistedState, clearPersistedState } from '../utils/storage';
import { weddingPreset } from '../data/weddingPreset';

describe('Storage Schema Validation & Prototype Pollution Security', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Prototype Pollution Prevention', () => {
    it('actively removes __proto__, constructor, and prototype keys from deeply sanitized objects', () => {
      // Create a payload with prototype pollution keys
      const maliciousPayload = JSON.parse(`{
        "title": "Legitimate Title",
        "__proto__": { "polluted": true },
        "constructor": { "prototype": { "isAdmin": true } },
        "nested": {
          "normalKey": "Safe Value",
          "prototype": { "injected": true }
        }
      }`);

      const sanitized = sanitizeObject(maliciousPayload) as Record<string, unknown>;

      expect(sanitized.title).toBe('Legitimate Title');
      expect(Object.prototype.hasOwnProperty.call(sanitized, '__proto__')).toBe(false);
      expect(Object.prototype.hasOwnProperty.call(sanitized, 'constructor')).toBe(false);
      expect(sanitized['__proto__']).not.toEqual({ polluted: true });
      expect((sanitized.nested as Record<string, unknown>)['prototype']).toBeUndefined();

      // Ensure global Object prototype is not polluted
      expect((Object.prototype as unknown as { polluted?: boolean }).polluted).toBeUndefined();
      expect((Object.prototype as unknown as { isAdmin?: boolean }).isAdmin).toBeUndefined();
    });
  });

  describe('Multi-Pass Nested Tag XSS Evasion', () => {
    it('completely strips multi-layered nested script tags', () => {
      const nestedXss = '<<script>script>alert("nested-xss")<</script>/script>VIP Lounge';
      const clean = sanitizeText(nestedXss);

      expect(clean).not.toContain('<script>');
      expect(clean).not.toContain('alert');
      expect(clean).toContain('VIP Lounge');
    });

    it('strips vbscript and data URI injection schemes', () => {
      const vbscriptPayload = 'vbscript:msgbox("xss")';
      const dataPayload = 'data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==';

      expect(sanitizeText(vbscriptPayload)).not.toContain('vbscript:');
      expect(sanitizeText(dataPayload)).not.toContain('data:');
    });
  });

  describe('Full Workspace & Storage Schema Validation', () => {
    it('validates a complete production workspace state against eventWorkspaceStateSchema', () => {
      const result = eventWorkspaceStateSchema.safeParse(weddingPreset);
      expect(result.success).toBe(true);
    });

    it('validates full persisted state envelope against persistedStateSchema', () => {
      const envelope = {
        version: 1,
        activePresetId: 'preset-wedding',
        states: {
          'preset-wedding': weddingPreset,
        },
        theme: 'light' as const,
      };

      const result = persistedStateSchema.safeParse(envelope);
      expect(result.success).toBe(true);
    });

    it('rejects tampered localStorage data with negative budget or missing fields', () => {
      const tamperedEnvelope = {
        version: 1,
        activePresetId: 'preset-wedding',
        states: {
          'preset-wedding': {
            ...weddingPreset,
            event: {
              ...weddingPreset.event,
              targetBudget: -999999, // Tampered negative budget
            },
          },
        },
        theme: 'dark',
      };

      localStorage.setItem('auraplan_workspace_v1', JSON.stringify(tamperedEnvelope));

      // loadPersistedState should reject the invalid schema safely and return null
      const loaded = loadPersistedState();
      expect(loaded).toBeNull();
    });

    it('successfully loads valid persisted state from storage', () => {
      const validEnvelope = {
        version: 1,
        activePresetId: 'preset-wedding',
        states: {
          'preset-wedding': weddingPreset,
        },
        theme: 'dark' as const,
      };

      savePersistedState(validEnvelope);
      const loaded = loadPersistedState();
      expect(loaded).not.toBeNull();
      expect(loaded?.activePresetId).toBe('preset-wedding');
      expect(loaded?.theme).toBe('dark');

      clearPersistedState();
      expect(loadPersistedState()).toBeNull();
    });
  });
});

