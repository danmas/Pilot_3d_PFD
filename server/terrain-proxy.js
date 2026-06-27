/**
 * terrain-proxy.js — Terrain tile proxy server with disk cache + quota tracking.
 *
 * Проксирует запросы к Mapbox Terrain-RGB / Satellite, кэширует на диск,
 * и считает количество запросов к Mapbox для контроля лимита (50k/мес).
 *
 * Эндпоинты:
 *   GET /api/terrain/tile/:z/:x/:y?type=dem|sat  — прокси тайла
 *   GET /api/terrain/quota                        — статистика запросов
 *
 * Запуск: node server/terrain-proxy.js
 * Порт: 3409 (чтобы не конфликтовать с 3410)
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import {
  CACHE_DIR,
  cacheFilePath,
  getQuota,
  appendLog,
  loadTileBuffer,
} from './terrain-tile-loader.js';
import { setupTerrainWebSocket } from './terrain-ws.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PORT = parseInt(process.env.TERRAIN_PROXY_PORT || '3409', 10);

// ─── Express app ───
const app = express();

// CORS для фронтенда
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }
  next();
});

// Parse JSON for client-side logs
app.use(express.json({ limit: '100kb' }));

// GET /api/terrain/logs — последние N записей лога
app.get('/api/terrain/logs', (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 100, 500);
  try {
    if (!fs.existsSync(LOG_FILE)) return res.json([]);
    const data = fs.readFileSync(LOG_FILE, 'utf-8');
    const lines = data.trim().split('\n').filter(Boolean);
    const last = lines.slice(-limit).map(l => JSON.parse(l));
    res.json(last);
  } catch {
    res.json([]);
  }
});

// POST /api/terrain/log — receive client scene events (with tile corners)
// ALWAYS succeed (200) — logs are best-effort for analysis only; must never cause
// visible errors or aborts in browser console. Client sends fire-and-forget.
app.post('/api/terrain/log', (req, res) => {
  try {
    const body = req.body || {};
    const entry = {
      ...body,
      t: body.t || new Date().toISOString(),
      source: 'client',
    };
    appendLog(entry);
  } catch (e) {
    // swallow any bad payload; do not fail the request
  }
  res.json({ ok: true });
});

// GET /api/terrain/cached — список всех кэшированных тайлов (только DEM)
app.get('/api/terrain/cached', (req, res) => {
  try {
    const tiles = [];
    if (!fs.existsSync(CACHE_DIR)) return res.json({ tiles: [], count: 0 });

    // Проходим по z-уровням
    const zDirs = fs.readdirSync(CACHE_DIR, { withFileTypes: true });
    for (const zd of zDirs) {
      if (!zd.isDirectory()) continue;
      const z = parseInt(zd.name, 10);
      if (!isFinite(z)) continue;
      const xDirs = fs.readdirSync(path.join(CACHE_DIR, zd.name), { withFileTypes: true });
      for (const xd of xDirs) {
        if (!xd.isDirectory()) continue;
        const x = parseInt(xd.name, 10);
        if (!isFinite(x)) continue;
        const files = fs.readdirSync(path.join(CACHE_DIR, zd.name, xd.name), { withFileTypes: true });
        for (const f of files) {
          if (!f.isFile()) continue;
          const match = f.name.match(/^(\d+)-dem\.png$/);
          if (match) {
            tiles.push({ z, x, y: parseInt(match[1]) });
          }
        }
      }
    }

    res.json({ tiles, count: tiles.length });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/terrain/quota — статистика запросов
app.get('/api/terrain/quota', (req, res) => {
  const quota = getQuota();
  res.json({
    month: quota.month,
    dem: quota.dem,
    sat: quota.sat,
    total: quota.total,
    limit: 50000,
    remaining: Math.max(0, 50000 - quota.total),
    resetDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString().split('T')[0],
  });
});

// GET /api/terrain/tile/:z/:x/:y?type=dem|sat — прокси тайла
app.get('/api/terrain/tile/:z/:x/:y', async (req, res) => {
  const { z, x, y } = req.params;
  const type = req.query.type || 'dem';

  if (type !== 'dem' && type !== 'sat') {
    return res.status(400).json({ error: 'Invalid type. Use dem or sat.' });
  }

  const zNum = parseInt(z, 10);
  const xNum = parseInt(x, 10);
  const yNum = parseInt(y, 10);

  if (!isFinite(zNum) || !isFinite(xNum) || !isFinite(yNum)) {
    return res.status(400).json({ error: 'Invalid tile coordinates' });
  }

  const buffer = await loadTileBuffer(zNum, xNum, yNum, type);
  if (!buffer) {
    const quota = getQuota();
    if (quota.total >= 45000) {
      return res.status(429).json({ error: 'Mapbox quota limit approaching', quota: { used: quota.total, limit: 50000 } });
    }
    return res.status(502).json({ error: 'Upstream fetch failed' });
  }

  const contentType = type === 'dem' ? 'image/png' : 'image/jpeg';
  const cachedPath = cacheFilePath(zNum, xNum, yNum, type);
  const isHit = fs.existsSync(cachedPath);

  res.setHeader('Content-Type', contentType);
  res.setHeader('X-Cache', isHit ? 'HIT' : 'MISS');
  res.send(buffer);
});

// ─── Запуск ───
const server = app.listen(PORT, () => {
  const quota = getQuota();
  console.log(`[terrain-proxy] Server running on http://0.0.0.0:${PORT}`);
  console.log(`[terrain-proxy] Cache dir: ${CACHE_DIR}`);
  console.log(`[terrain-proxy] Quota: ${quota.total}/50000 (${quota.month})`);
});

setupTerrainWebSocket(server);
