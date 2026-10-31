import { describe, it, expect } from 'vitest';
import { execSync } from 'child_process';
import fs from 'fs';

describe('Security Regression Guard: Zero Client-Side Secrets', () => {
  it('executes check:no-client-secrets successfully with exit code 0', () => {
    const output = execSync('node scripts/checkNoClientSecrets.cjs', { encoding: 'utf8' });
    expect(output).toContain('[SECURITY PASSED]');
  });

  it('verifies .env.example does not contain VITE_ prefixes on sensitive keys', () => {
    const envExample = fs.readFileSync('.env.example', 'utf8');
    expect(envExample).not.toMatch(/VITE_.*(KEY|SECRET|TOKEN|PASSWORD)/i);
    expect(envExample).toContain('GEMINI_API_KEY=');
  });

  it('verifies client code in src/ never accesses process.env', () => {
    const checkFile = (filePath: string) => {
      const content = fs.readFileSync(filePath, 'utf8');
      expect(content).not.toMatch(/process\.env/i);
    };

    const walk = (dir: string) => {
      const files = fs.readdirSync(dir, { withFileTypes: true });
      for (const f of files) {
        const full = `${dir}/${f.name}`;
        if (f.isDirectory() && f.name !== '__tests__') {
          walk(full);
        } else if (f.isFile() && (f.name.endsWith('.ts') || f.name.endsWith('.tsx')) && !dir.includes('__tests__')) {
          checkFile(full);
        }
      }
    };
    walk('src');
  });
});
