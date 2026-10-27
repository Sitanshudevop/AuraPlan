/**
 * Consolidated into unified src/utils/security.ts
 * Re-exported to maintain backwards compatibility with zero duplicate code.
 */
export {
  sanitizeText,
  sanitizeInput,
  sanitizeObject,
  aiRateLimiter,
  maskApiKey,
  CSP_POLICY_DIRECTIVES,
} from './security';
