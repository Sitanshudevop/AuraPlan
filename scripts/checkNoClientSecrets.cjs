const fs = require('fs');
const path = require('path');

let errors = [];

// (a) Check .env.example and src/ for /^VITE_.*(KEY|SECRET|TOKEN|PASSWORD)/
const secretPattern = /VITE_.*(KEY|SECRET|TOKEN|PASSWORD)/i;

if (fs.existsSync('.env.example')) {
  const envExample = fs.readFileSync('.env.example', 'utf8');
  envExample.split('\n').forEach((line, idx) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      if (secretPattern.test(trimmed)) {
        errors.push(`.env.example:${idx + 1} exposes sensitive variable pattern: ${trimmed}`);
      }
    }
  });
}

function scanDir(dir, filterFn) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '.git' && entry.name !== '__tests__') {
        scanDir(fullPath, filterFn);
      }
    } else if (entry.isFile()) {
      filterFn(fullPath);
    }
  }
}

// Check src/ (excluding test suites) for secret patterns and GEMINI env references
scanDir('src', (filePath) => {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    // Check (a)
    if (secretPattern.test(line)) {
      errors.push(`${filePath}:${idx + 1} contains browser-prefixed secret pattern: ${line.trim()}`);
    }
    // Check (b) Client-reachable code referencing GEMINI env vars or process.env
    if (/process\.env/i.test(line)) {
      errors.push(`${filePath}:${idx + 1} references process.env in client-side code: ${line.trim()}`);
    }
    if (/import\.meta\.env\..*GEMINI/i.test(line) || (/GEMINI_API_KEY/i.test(line) && !filePath.includes('__tests__'))) {
      errors.push(`${filePath}:${idx + 1} references GEMINI env var in client code: ${line.trim()}`);
    }
  });
});

// Check (b) vite.config.ts for define or envPrefix exposing GEMINI
if (fs.existsSync('vite.config.ts')) {
  const viteConfig = fs.readFileSync('vite.config.ts', 'utf8');
  if (/define:\s*\{[^}]*GEMINI/i.test(viteConfig)) {
    errors.push('vite.config.ts contains define config exposing GEMINI to client bundle');
  }
  if (/envPrefix:\s*\[[^\]]*GEMINI/i.test(viteConfig)) {
    errors.push('vite.config.ts contains envPrefix exposing GEMINI to client bundle');
  }
  const forbiddenVitePrefix = ['VITE', 'GEMINI', 'API_KEY'].join('_');
  if (viteConfig.includes(forbiddenVitePrefix)) {
    errors.push(`vite.config.ts references deprecated ${forbiddenVitePrefix}`);
  }
}

// (c) Check dist/ if present for API key patterns and local .env value
if (fs.existsSync('dist')) {
  const aizaPattern = /AIza[0-9A-Za-z_-]{35}/;
  const aqPattern = /AQ\.[A-Za-z0-9_-]{20,}/;

  let localEnvKey = '';
  if (fs.existsSync('.env')) {
    const envLines = fs.readFileSync('.env', 'utf8').split('\n');
    for (const line of envLines) {
      const match = line.match(/^\s*GEMINI_API_KEY\s*=\s*(.+)$/);
      if (match) {
        localEnvKey = match[1].trim().replace(/^['"]|['"]$/g, '');
        break;
      }
    }
  }

  scanDir('dist', (filePath) => {
    if (filePath.endsWith('.js') || filePath.endsWith('.html') || filePath.endsWith('.css') || filePath.endsWith('.json')) {
      const content = fs.readFileSync(filePath, 'utf8');
      if (aizaPattern.test(content)) {
        errors.push(`${filePath} matches Google AIza API key pattern!`);
      }
      if (aqPattern.test(content)) {
        errors.push(`${filePath} matches AQ API key pattern!`);
      }
      if (localEnvKey && localEnvKey.length > 5 && content.includes(localEnvKey)) {
        errors.push(`${filePath} contains the actual GEMINI_API_KEY value from .env!`);
      }
    }
  });
}

if (errors.length > 0) {
  console.error('[SECURITY VIOLATION] check:no-client-secrets failed with ' + errors.length + ' error(s):');
  errors.forEach(err => console.error('  - ' + err));
  process.exit(1);
} else {
  console.log('[SECURITY PASSED] Zero client-exposed secrets or GEMINI env vars detected.');
  process.exit(0);
}
