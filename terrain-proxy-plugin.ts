/**
 * terrain-proxy-plugin.ts — Vite-плагин, добавляющий Mapbox Terrain-RGB proxy
 * прямо в Vite dev-server. Заменяет отдельный Express server (server/server.js).
 *
 * Маршруты:
 *   GET  /api/terrain/tile/:z/:x/:y?type=dem|sat — прокси тайла
 *   GET  /api/terrain/logs — лог загрузок
 *   GET  /api/terrain/quota — состояние квоты
 *   POST /api/terrain/grid — лог сетки тайлов
 */
import type { Plugin, ViteDevServer } from 'vite';
import fs from 'fs';
import path from 'path';
import http from 'http';
import https from 'https';

/** Конфиг (читается из .env) */
function loadConfig(): { token: string; cacheDir: string } {
  const envPath = path.resolve(process.cwd(), '.env');
  const env: Record<string, string> = {};
  if (fs.existsSync(envPath)) {
    for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
      const m = line.match(/^\s*([^#=]+?)\s*=\s*(.*)\s*$/);
      if (m) env[m[1]] = m[2];
    }
  }
  const token = env.VITE_MAPBOX_TOKEN || env.MAPBOX_TOKEN || process.env.VITE_MAPBOX_TOKEN || process.env.MAPBOX_TOKEN || '';
  const cacheDir = path.resolve(process.cwd(), 'cache', 'terrain');
  return { token, cacheDir };
}

const QUOTA_FILE = path.resolve(process.cwd(), 'cache', 'terrain-quota.json');
const LOG_FILE = path.resolve(process.cwd(), 'cache', 'terrain', 'access.log');

function currentMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function readQuota() {
  try {
    if (fs.existsSync(QUOTA_FILE)) {
      const q = JSON.parse(fs.readFileSync(QUOTA_FILE, 'utf8'));
      return { month: q.month || '', dem: q.dem || 0, sat: q.sat || 0, total: q.total || 0 };
    }
  } catch {}
  return { month: '', dem: 0, sat: 0, total: 0 };
}

function saveQuota(quota: any) {
  const dir = path.dirname(QUOTA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(QUOTA_FILE, JSON.stringify(quota, null, 2), 'utf8');
}

function appendLog(entry: any) {
  const dir = path.dirname(LOG_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.appendFileSync(LOG_FILE, JSON.stringify(entry) + '\n', 'utf8');
}

function cacheFilePath(z: number, x: number, y: number, type: string) {
  const ext = type === 'dem' ? 'png' : 'webp';
  const dir = path.join(loadConfig().cacheDir, String(z), String(x));
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return path.join(dir, `${y}-${type}.${ext}`);
}

export function terrainProxyPlugin(): Plugin {
  let quota = readQuota();
  const cm = currentMonth();
  if (quota.month !== cm) { quota = { month: cm, dem: 0, sat: 0, total: 0 }; saveQuota(quota); }

  return {
    name: 'terrain-proxy',
    configureServer(server: ViteDevServer) {
      const { token } = loadConfig();
      if (!token) {
        console.warn('[terrain-proxy] ⚠ No VITE_MAPBOX_TOKEN in .env — terrain tiles will fail');
      }

      // CORS
      server.middlewares.use((req, res, next) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        if (req.method === 'OPTIONS') { res.statusCode = 204; res.end(); return; }
        next();
      });

      // GET /api/terrain/logs
      server.middlewares.use('/api/terrain/logs', (req, res) => {
        if (req.method !== 'GET') return;
        const url = new URL(req.url!, `http://${req.headers.host}`);
        const limit = Math.min(parseInt(url.searchParams.get('limit') || '100'), 500);
        try {
          if (!fs.existsSync(LOG_FILE)) { res.end('[]'); return; }
          const data = fs.readFileSync(LOG_FILE, 'utf8');
          const lines = data.trim().split('\n').filter(Boolean);
          const last = lines.slice(-limit).map(l => JSON.parse(l));
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(last));
        } catch {
          res.end('[]');
        }
      });

      // GET /api/terrain/quota
      server.middlewares.use('/api/terrain/quota', (req, res) => {
        if (req.method !== 'GET') return;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          month: quota.month, dem: quota.dem, sat: quota.sat,
          total: quota.total, limit: 50000,
          remaining: Math.max(0, 50000 - quota.total),
          resetDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString().split('T')[0],
        }));
      });

      // POST /api/terrain/grid
      server.middlewares.use('/api/terrain/grid', (req, res) => {
        if (req.method !== 'POST') return;
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
          try {
            const { tiles } = JSON.parse(body);
            if (!Array.isArray(tiles)) {
              res.writeHead(400); res.end(JSON.stringify({ error: 'tiles array required' })); return;
            }
            const summary = {
              t: new Date().toISOString(), type: 'GRID', count: tiles.length,
              grid: tiles.map((t: any) => ({
                k: t.key || t.zxy, x: t.gridX, y: t.gridY,
                N: `${t.NW?.lat ?? '?'},${t.NW?.lon ?? '?'}`,
                S: `${t.SE?.lat ?? '?'},${t.SE?.lon ?? '?'}`,
                wu: t.worldBounds, elev: t.elev,
              })),
            };
            appendLog(summary);

            const uniqX = [...new Set(tiles.map((t: any) => t.gridX))].sort((a: number, b: number) => a - b);
            const uniqY = [...new Set(tiles.map((t: any) => t.gridY))].sort((a: number, b: number) => a - b);
            console.log(`\n[terrain-grid] ${tiles.length} tiles, X: [${uniqX[0]}..${uniqX[uniqX.length - 1]}] (${uniqX.length}), Y: [${uniqY[0]}..${uniqY[uniqY.length - 1]}] (${uniqY.length})`);
            
            const byY = new Map<number, number[]>();
            for (const t of tiles) { if (!byY.has(t.gridY)) byY.set(t.gridY, []); byY.get(t.gridY)!.push(t.gridX); }
            for (const [y, xs] of byY) {
              xs.sort((a: number, b: number) => a - b);
              for (let i = 1; i < xs.length; i++) { if (xs[i] - xs[i - 1] !== 1) console.warn(`[terrain-grid] ⚠ GAP at Y=${y}: X${xs[i - 1]} → X${xs[i]}`); }
              if (xs.length < uniqX.length) {
                const missing = uniqX.filter(x => !xs.includes(x));
                console.warn(`[terrain-grid] ⚠ MISSING at Y=${y}: X=${missing.join(',')} (have ${xs.length}/${uniqX.length})`);
              }
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ ok: true, count: tiles.length }));
          } catch (err: any) {
            console.error('[terrain-grid] error:', err);
            res.writeHead(500);
            res.end(JSON.stringify({ error: String(err) }));
          }
        });
      });

      // GET /api/terrain/tile/:z/:x/:y?type=dem|sat
      server.middlewares.use(async (req, res, next) => {
        const m = req.url?.match(/^\/api\/terrain\/tile\/(\d+)\/(\d+)\/(\d+)/);
        if (!m) return next();
        if (req.method !== 'GET') return next();

        const z = parseInt(m[1]), x = parseInt(m[2]), y = parseInt(m[3]);
        const url = new URL(req.url!, `http://${req.headers.host}`);
        const type = url.searchParams.get('type') || 'dem';
        if (type !== 'dem' && type !== 'sat') { res.writeHead(400); res.end(JSON.stringify({ error: 'Invalid type' })); return; }

        if (quota.total >= 50000) {
          res.writeHead(429); res.end(JSON.stringify({ error: 'Quota near limit', quota: { used: quota.total, limit: 50000 } })); return;
        }

        const cached = cacheFilePath(z, x, y, type);
        if (fs.existsSync(cached)) {
          const buf = fs.readFileSync(cached);
          const ext = type === 'dem' ? 'png' : 'webp';
          res.setHeader('Content-Type', `image/${ext}`);
          res.setHeader('Cache-Control', 'public, max-age=86400');
          res.end(buf);
          appendLog({ t: new Date().toISOString(), coord: { z, x, y }, type, status: 'CACHE', quotaTotal: quota.total });
          return;
        }

        // Fetch from Mapbox
        const mapboxUrl = type === 'dem'
          ? `https://api.mapbox.com/v4/mapbox.terrain-rgb/${z}/${x}/${y}.png?access_token=${token}`
          : `https://api.mapbox.com/v4/mapbox.satellite/${z}/${x}/${y}@2x.webp?access_token=${token}`;

        try {
          const start = Date.now();
          const buf = await new Promise<Buffer>((resolve, reject) => {
            const get = mapboxUrl.startsWith('https') ? https.get : http.get;
            const req = get(mapboxUrl, { timeout: 15000 }, (resp) => {
              if (resp.statusCode !== 200) {
                let errData = '';
                resp.on('data', d => errData += d);
                resp.on('end', () => reject(new Error(`Mapbox ${resp.statusCode}: ${errData.slice(0, 200)}`)));
                return;
              }
              const chunks: Buffer[] = [];
              resp.on('data', d => chunks.push(d));
              resp.on('end', () => resolve(Buffer.concat(chunks)));
            });
            req.on('timeout', () => { req.destroy(); reject(new Error('Mapbox timeout')); });
            req.on('error', reject);
          });

          // Cache to disk
          try { fs.writeFileSync(cached, buf); } catch {}

          const elapsed = Date.now() - start;
          quota[type]++;
          quota.total++;
          if (quota.month !== currentMonth()) { quota = { month: currentMonth(), dem: 0, sat: 0, total: 0 }; }
          saveQuota(quota);

          const ext = type === 'dem' ? 'png' : 'webp';
          res.setHeader('Content-Type', `image/${ext}`);
          res.setHeader('Cache-Control', 'public, max-age=86400');
          res.end(buf);
          appendLog({ t: new Date().toISOString(), coord: { z, x, y }, type, status: 'FETCH', elapsedMs: elapsed, quotaTotal: quota.total });
        } catch (err: any) {
          console.error(`[terrain-proxy] Error ${z}/${x}/${y}:`, err.message);
          appendLog({ t: new Date().toISOString(), coord: { z, x, y }, type, status: 'ERROR', error: err.message, quotaTotal: quota.total });
          res.writeHead(502);
          res.end(JSON.stringify({ error: 'Upstream failed' }));
        }
      });
    },
  };
}
