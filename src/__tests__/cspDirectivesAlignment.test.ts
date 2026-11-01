import { describe, it, expect } from 'vitest';
import fs from 'fs';

interface VercelConfig {
  headers?: Array<{
    source: string;
    headers: Array<{ key: string; value: string }>;
  }>;
}

function parseCspDirectives(cspString: string): Map<string, string[]> {
  const directives = new Map<string, string[]>();
  const parts = cspString.split(';').map((s) => s.trim()).filter(Boolean);

  for (const part of parts) {
    const tokens = part.split(/\s+/).filter(Boolean);
    if (tokens.length > 0) {
      const name = tokens[0];
      const values = tokens.slice(1);
      directives.set(name, values);
    }
  }
  return directives;
}

describe('F4 Config Alignment: Content Security Policy & Runtime Directives', () => {
  const indexHtmlPath = 'index.html';
  const vercelJsonPath = 'vercel.json';

  it('aligns index.html meta CSP with vercel.json headers excluding meta-unsupported frame-ancestors', () => {
    const indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');
    const vercelJson = JSON.parse(fs.readFileSync(vercelJsonPath, 'utf8')) as VercelConfig;

    // 1. Extract meta CSP
    const metaMatch = indexHtml.match(/<meta\s+http-equiv="Content-Security-Policy"\s+content="([^"]*)"/i);
    expect(metaMatch).not.toBeNull();
    const metaCsp = metaMatch![1];
    const metaDirectives = parseCspDirectives(metaCsp);

    // 2. Extract vercel.json CSP from the main html catch-all rule
    const htmlRouteHeader = vercelJson.headers?.find((h) => h.source.includes('?!assets/|api/'))
      ?.headers.find((header) => header.key.toLowerCase() === 'content-security-policy');
    expect(htmlRouteHeader).toBeDefined();
    const vercelCsp = htmlRouteHeader!.value;
    const vercelDirectives = parseCspDirectives(vercelCsp);

    // 3. Confirm frame-ancestors is header-only per W3C specification (meta ignores it and logs console error)
    expect(vercelDirectives.has('frame-ancestors')).toBe(true);
    expect(metaDirectives.has('frame-ancestors')).toBe(false);

    // 4. Confirm form-action 'self' is present in both meta and header
    expect(metaDirectives.get('form-action')).toEqual(["'self'"]);
    expect(vercelDirectives.get('form-action')).toEqual(["'self'"]);

    // 5. Compare all non-frame-ancestors directives between vercel header and meta tag
    const metaUnsupportedDirectives = new Set(['frame-ancestors', 'report-uri', 'report-to', 'sandbox']);

    for (const [directiveName, expectedTokens] of vercelDirectives.entries()) {
      if (metaUnsupportedDirectives.has(directiveName)) {
        continue;
      }
      expect(metaDirectives.has(directiveName)).toBe(true);
      const actualTokens = metaDirectives.get(directiveName);
      expect(actualTokens?.sort()).toEqual(expectedTokens.slice().sort());
    }
  });

  it('aligns Node engine version consistently across .nvmrc, ci.yml, and package.json', () => {
    const nvmrc = fs.readFileSync('.nvmrc', 'utf8').trim();
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8')) as {
      engines?: { node?: string };
    };
    const ciYml = fs.readFileSync('.github/workflows/ci.yml', 'utf8');

    expect(nvmrc).toBe('22.12.0');
    expect(packageJson.engines?.node).toBe('>=22.12.0');
    expect(ciYml).toContain('node-version-file: .nvmrc');
  });
});
