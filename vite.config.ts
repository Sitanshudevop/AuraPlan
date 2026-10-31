/// <reference types="vitest" />
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { handleGeminiProxyRequest } from './server/geminiProxy';

function geminiDevProxyPlugin(): Plugin {
  const handler = async (
    req: { method?: string; url?: string; headers: Record<string, string | string[] | undefined>; on: (event: string, callback: (chunk?: unknown) => void) => void },
    res: { statusCode: number; setHeader: (name: string, value: string) => void; end: (chunk?: string) => void },
    next: () => void
  ) => {
    if (req.url === '/api/gemini' || req.url?.startsWith('/api/gemini?')) {
      if (req.method !== 'POST') {
        res.statusCode = 405;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Method Not Allowed' }));
        return;
      }
      const chunks: Buffer[] = [];
      req.on('data', (chunk) => {
        if (chunk) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk as Uint8Array));
      });
      req.on('end', async () => {
        const bodyBuffer = Buffer.concat(chunks);
        const headers = new Headers();
        for (const [key, val] of Object.entries(req.headers)) {
          if (val) {
            if (Array.isArray(val)) {
              val.forEach((v) => headers.append(key, v));
            } else {
              headers.set(key, val);
            }
          }
        }
        const webReq = new Request(`http://${req.headers.host || 'localhost'}${req.url}`, {
          method: req.method,
          headers,
          body: bodyBuffer.length > 0 ? bodyBuffer : undefined,
        });

        const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
        const webRes = await handleGeminiProxyRequest(webReq, apiKey);
        res.statusCode = webRes.status;
        webRes.headers.forEach((value, key) => {
          res.setHeader(key, value);
        });
        const resBody = await webRes.text();
        res.end(resBody);
      });
      return;
    }
    next();
  };

  return {
    name: 'gemini-dev-proxy',
    configureServer(server) {
      server.middlewares.use(handler as never);
    },
    configurePreviewServer(server) {
      server.middlewares.use(handler as never);
    },
  };
}

export default defineConfig({
  plugins: [react(), geminiDevProxyPlugin()],
  build: {
    rollupOptions: {
      onwarn(warning, warn) {
        if (warning.code === 'INVALID_ANNOTATION') return;
        warn(warning);
      },
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-zod': ['zod'],
          'vendor-icons': ['lucide-react'],
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    testTimeout: 15000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'src/test/setup.ts', 'dist/**', '**/*.d.ts', 'server/**'],
    },
  },
});
