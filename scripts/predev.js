/**
 * predev.js — подготовка перед `npm run dev`.
 *
 * 1. Убивает процесс на порту 3410 (Vite), чтобы не было fallback на 3411.
 * 2. Проверяет, запущен ли terrain-proxy на порту 3409.
 *    Если нет — запускает его в фоне и ждёт готовности.
 */

import { spawn, execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const PROXY_PORT = 3409;
const VITE_PORT = 3410;
const PROXY_READY_TIMEOUT_MS = 10_000;
const PROXY_POLL_INTERVAL_MS = 200;

async function isPortReady(port) {
  try {
    const response = await fetch(`http://localhost:${port}/api/terrain/quota`, {
      signal: AbortSignal.timeout(500),
    });
    return response.ok;
  } catch {
    return false;
  }
}

async function waitForProxy() {
  const start = Date.now();
  while (Date.now() - start < PROXY_READY_TIMEOUT_MS) {
    if (await isPortReady(PROXY_PORT)) {
      console.log(`[predev] terrain-proxy is ready on port ${PROXY_PORT}`);
      return true;
    }
    await new Promise(r => setTimeout(r, PROXY_POLL_INTERVAL_MS));
  }
  return false;
}

function killPort(port) {
  try {
    execSync(`node "${path.join(ROOT, 'scripts', 'kill-port.js')}" ${port}`, {
      stdio: 'inherit',
      cwd: ROOT,
    });
  } catch (e) {
    // ignore
  }
}

function startProxy() {
  console.log('[predev] Starting terrain-proxy...');
  const child = spawn('node', ['server/terrain-proxy.js'], {
    cwd: ROOT,
    detached: true,
    stdio: 'ignore',
    windowsHide: true,
  });
  child.unref();
}

async function main() {
  // 1. Очистка Vite-порта
  killPort(VITE_PORT);

  // 2. Проверяем/запускаем terrain-proxy
  const proxyReady = await isPortReady(PROXY_PORT);
  if (proxyReady) {
    console.log(`[predev] terrain-proxy already running on port ${PROXY_PORT}`);
  } else {
    startProxy();
    const ready = await waitForProxy();
    if (!ready) {
      console.error(`[predev] ERROR: terrain-proxy did not become ready on port ${PROXY_PORT}`);
      process.exit(1);
    }
  }

  console.log('[predev] Done.');
}

main().catch((err) => {
  console.error('[predev] ERROR:', err.message);
  process.exit(1);
});
