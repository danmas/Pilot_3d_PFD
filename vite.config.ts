import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';
import {bridgePlugin} from './bridge-plugin';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  const port = parseInt(env.PORT) || 3410;
  return {
    plugins: [react(), tailwindcss(), bridgePlugin({udpPort: parseInt(env.UDP_PORT) || 14443, config: env.UDP_CONFIG || undefined, captureDir: env.CAPTURE_DIR || 'captures', noCapture: env.NO_CAPTURE === 'true'})],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      port: port,
      host: '0.0.0.0',
    },
  };
});
