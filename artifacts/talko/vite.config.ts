import path from 'path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

import runtimeErrorOverlay from '@replit/vite-plugin-runtime-error-modal';

// PORT and BASE_PATH are required for the dev server but not for static
// builds (e.g. Render). Fall back to safe defaults so `vite build` doesn't
// throw in environments that don't inject these vars.
const rawPort = process.env.PORT ?? '3000';
const port = Number(rawPort);
if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const basePath = process.env.BASE_PATH ?? '/';

// VITE_API_URL: set to the API server origin on Render so the frontend can
// reach it across origins. Leave unset on Replit/local (uses relative paths).
const firebasePublicEnv: Record<string, string> = {
  'import.meta.env.VITE_API_URL': JSON.stringify(
    process.env.VITE_API_URL ?? '',
  ),
  'import.meta.env.VITE_FIREBASE_API_KEY': JSON.stringify(
    process.env.FIREBASE_API_KEY ?? '',
  ),
  'import.meta.env.VITE_FIREBASE_AUTH_DOMAIN': JSON.stringify(
    process.env.FIREBASE_AUTH_DOMAIN ?? '',
  ),
  'import.meta.env.VITE_FIREBASE_PROJECT_ID': JSON.stringify(
    process.env.FIREBASE_PROJECT_ID ?? '',
  ),
  'import.meta.env.VITE_FIREBASE_STORAGE_BUCKET': JSON.stringify(
    process.env.FIREBASE_STORAGE_BUCKET ?? '',
  ),
  'import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID': JSON.stringify(
    process.env.FIREBASE_MESSAGING_SENDER_ID ?? '',
  ),
  'import.meta.env.VITE_FIREBASE_APP_ID': JSON.stringify(
    process.env.FIREBASE_APP_ID ?? '',
  ),
};

export default defineConfig({
  base: basePath,
  define: firebasePublicEnv,
  plugins: [
    react(),
    tailwindcss(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== 'production' &&
    process.env.REPL_ID !== undefined
      ? [
          await import('@replit/vite-plugin-cartographer').then((m) =>
            m.cartographer({
              root: path.resolve(import.meta.dirname, '..'),
            }),
          ),
          await import('@replit/vite-plugin-dev-banner').then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src'),
      '@assets': path.resolve(
        import.meta.dirname,
        '..',
        '..',
        'attached_assets',
      ),
    },
    dedupe: ['react', 'react-dom'],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, 'dist/public'),
    emptyOutDir: true,
  },
  server: {
    port,
    strictPort: true,
    host: '0.0.0.0',
    allowedHosts: true,
    fs: {
      strict: true,
    },
  },
  preview: {
    port,
    host: '0.0.0.0',
    allowedHosts: true,
  },
});
