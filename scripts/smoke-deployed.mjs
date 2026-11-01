#!/usr/bin/env node

/**
 * AuraPlan Deployed Smoke Test
 * Usage: node scripts/smoke-deployed.mjs <target-url>
 */

const targetUrl = (process.argv[2] || '').trim().replace(/\/+$/, '');

if (!targetUrl) {
  console.error('[SMOKE ERROR] Target URL required: npm run smoke:deployed -- <url>');
  process.exit(1);
}

console.log(`[SMOKE] Testing deployment at: ${targetUrl}\n`);

const REQUEST_TIMEOUT_MS = 15000;

async function fetchWithTimeout(url, options = {}) {
  const signal = AbortSignal.timeout(REQUEST_TIMEOUT_MS);
  return fetch(url, { ...options, signal });
}

let failed = 0;
let passed = 0;

async function runCheck(name, checkFn) {
  try {
    await checkFn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ ${name}: ${err instanceof Error ? err.message : String(err)}`);
    failed++;
  }
}

// 1. GET /api/gemini-status = 200 JSON
await runCheck('GET /api/gemini-status returns 200 JSON', async () => {
  const res = await fetchWithTimeout(`${targetUrl}/api/gemini-status`);
  if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
  const json = await res.json();
  if (typeof json.configured !== 'boolean') throw new Error('Missing configured boolean');
});

// 2. GET /api/gemini = 405 JSON
await runCheck('GET /api/gemini returns 405 Method Not Allowed JSON', async () => {
  const res = await fetchWithTimeout(`${targetUrl}/api/gemini`);
  if (res.status !== 405) throw new Error(`Expected 405, got ${res.status}`);
  const json = await res.json();
  if (!json.error) throw new Error('Missing error field in 405 JSON');
});

// 3. POST /api/gemini invalid payload = 400 JSON
await runCheck('POST /api/gemini invalid payload returns 400 JSON', async () => {
  const res = await fetchWithTimeout(`${targetUrl}/api/gemini`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: 'invalid-json-{broken',
  });
  if (res.status !== 400) throw new Error(`Expected 400, got ${res.status}`);
  const json = await res.json();
  if (!json.error) throw new Error('Missing error field in 400 JSON');
});

// 4. POST /api/gemini valid payload = 200/502/503/504 JSON but never 500 and never hang
await runCheck('POST /api/gemini valid prompt responds with JSON without 500 or hang', async () => {
  const res = await fetchWithTimeout(`${targetUrl}/api/gemini`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: 'Ping test' }),
  });
  if (res.status === 500) throw new Error('Unexpected 500 server error');
  if (![200, 429, 502, 503, 504].includes(res.status)) {
    throw new Error(`Unexpected status code: ${res.status}`);
  }
  const json = await res.json();
  if (!json) throw new Error('Response is not valid JSON');
});

// 5. GET / = 200 HTML
let htmlText = '';
await runCheck('GET / returns 200 HTML', async () => {
  const res = await fetchWithTimeout(`${targetUrl}/`);
  if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
  const ct = res.headers.get('content-type') || '';
  if (!ct.includes('text/html')) throw new Error(`Expected text/html, got ${ct}`);
  htmlText = await res.text();
});

// 6. Hashed asset is immutable
await runCheck('Hashed asset has immutable cache-control header', async () => {
  const match = htmlText.match(/src="(\/assets\/[^"]+\.js)"/);
  if (!match) {
    console.log('    (no hashed asset found in HTML, skipping header check)');
    return;
  }
  const assetUrl = `${targetUrl}${match[1]}`;
  const res = await fetchWithTimeout(assetUrl);
  if (res.status !== 200) throw new Error(`Asset returned ${res.status}`);
  const cc = res.headers.get('cache-control') || '';
  if (!cc.includes('immutable')) throw new Error(`Expected immutable Cache-Control, got: ${cc}`);
});

// 7. Security headers present
await runCheck('Security headers present on /', async () => {
  const res = await fetchWithTimeout(`${targetUrl}/`);
  const nosniff = res.headers.get('x-content-type-options');
  const xframe = res.headers.get('x-frame-options');
  if (!nosniff || !nosniff.includes('nosniff')) throw new Error('Missing X-Content-Type-Options: nosniff');
  if (!xframe || (!xframe.includes('DENY') && !xframe.includes('SAMEORIGIN'))) {
    throw new Error('Missing X-Frame-Options');
  }
});

console.log(`\n[SMOKE RESULTS] Passed: ${passed}, Failed: ${failed}`);
if (failed > 0) process.exit(1);
