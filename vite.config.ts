import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';
import {bridgePlugin} from './bridge-plugin';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  const port = parseInt(env.PORT) || 3410;
  return {
    plugins: [
      react({
        // When DISABLE_HMR=true, disable React Fast Refresh entirely
        ...(process.env.DISABLE_HMR === 'true' ? {
          include: [],
          exclude: [/.*/],
        } : {}),
      }),
      tailwindcss(),
      bridgePlugin({udpPort: parseInt(env.UDP_PORT) || 14443, config: env.UDP_CONFIG || undefined, captureDir: env.CAPTURE_DIR || 'captures', noCapture: env.NO_CAPTURE === 'true'}),
      // Strip @vite/client from HTML when HMR is disabled
      {
        name: 'strip-hmr-client',
        transformIndexHtml: {
          order: 'post',
          handler(html) {
            if (process.env.DISABLE_HMR !== 'true') return html;
            return html.replace(
              /<script[^>]*?src=["'][^"']*\/@vite\/client["'][^>]*><\/script>\s*/g,
              '',
            );
          },
        },
      },
    ],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR: when DISABLE_HMR=true, disable server-side HMR entirely.
      hmr: process.env.DISABLE_HMR === 'true' ? false : {},
      // Disable file watching when DISABLE_HMR is true to save CPU.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      port: port,
      host: '0.0.0.0',
    },
  };
});
