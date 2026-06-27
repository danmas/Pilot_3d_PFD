/**
 * server.js — Единый сервер: статика + terrain proxy API + лог загрузки тайлов.
 *
 * Заменяет `serve dist -p 3410` + отдельный terrain-proxy.
 * Раздаёт статику из dist/ и обрабатывает /api/terrain/*
 * Логирует каждый запрос тайла в cache/terrain/access.log
 */
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';
import {
  CACHE_DIR,
  LOG_FILE,
  cacheFilePath,
  getQuota,
  appendLog,
  loadTileBuffer,
} from './terrain-tile-loader.js';
import { setupTerrainWebSocket } from './terrain-ws.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
dotenv.config({ path: path.join(ROOT, '.env') });

const DIST_DIR = path.join(ROOT, 'dist');
const PORT = 3410;

const MAPBOX_TOKEN = process.env.VITE_MAPBOX_TOKEN || process.env.MAPBOX_TOKEN;
if (!MAPBOX_TOKEN) {
  console.error('[server] ERROR: No VITE_MAPBOX_TOKEN in .env');
  process.exit(1);
}

// ─── Express ───
const app = express();

// CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// Parse JSON for client logs
app.use(express.json({ limit: '100kb' }));

// ─── Terrain API ───

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

// POST /api/terrain/log — accept client-side scene load events (with corners)
app.post('/api/terrain/log', (req, res) => {
  try {
    const entry = {
      ...req.body,
      t: req.body.t || new Date().toISOString(),
      source: 'client',
    };
    appendLog(entry);
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: 'bad log entry' });
  }
});

// GET /api/terrain/quota
app.get('/api/terrain/quota', (req, res) => {
  const quota = getQuota();
  res.json({
    month: quota.month, dem: quota.dem, sat: quota.sat,
    total: quota.total, limit: 50000,
    remaining: Math.max(0, 50000 - quota.total),
    resetDate: new Date(new Date().getFullYear(), new Date().getMonth()+1, 1).toISOString().split('T')[0],
  });
});

// GET /api/terrain/tile/:z/:x/:y?type=dem|sat
app.get('/api/terrain/tile/:z/:x/:y', async (req, res) => {
  const { z, x, y } = req.params;
  const type = req.query.type || 'dem';
  if (type !== 'dem' && type !== 'sat') return res.status(400).json({ error: 'Invalid type' });

  const zN = parseInt(z), xN = parseInt(x), yN = parseInt(y);
  if (!isFinite(zN) || !isFinite(xN) || !isFinite(yN)) return res.status(400).json({ error: 'Invalid coords' });

  const cached = cacheFilePath(zN, xN, yN, type);

  // 1. Cache check
  if (fs.existsSync(cached)) {
    const ct = type === 'dem' ? 'image/png' : 'image/jpeg';
    res.setHeader('Content-Type', ct);
    res.setHeader('X-Cache', 'HIT');
    // Лог: HIT — кэш
    appendLog({
      t: new Date().toISOString(),
      coord: { z: zN, x: xN, y: yN },
      type,
      status: 'HIT',
      quotaTotal: quota.total,
    });
    return res.sendFile(cached);
  }

  // 2. Quota check
  if (quota.total >= 45000) {
    // Лог: QUOTA_EXCEEDED
    appendLog({
      t: new Date().toISOString(),
      coord: { z: zN, x: xN, y: yN },
      type,
      status: 'QUOTA_EXCEEDED',
      quotaTotal: quota.total,
    });
    return res.status(429).json({ error: 'Quota near limit', quota: { used: quota.total, limit: 50000 } });
  }

  const buffer = await loadTileBuffer(zN, xN, yN, type);
  if (!buffer) {
    const quota = getQuota();
    if (quota.total >= 45000) {
      return res.status(429).json({ error: 'Quota near limit', quota: { used: quota.total, limit: 50000 } });
    }
    return res.status(502).json({ error: 'Upstream failed' });
  }

  const ct = type === 'dem' ? 'image/png' : 'image/jpeg';
  const cachedPath = cacheFilePath(zN, xN, yN, type);
  const isHit = fs.existsSync(cachedPath);

  res.setHeader('Content-Type', ct);
  res.setHeader('X-Cache', isHit ? 'HIT' : 'MISS');
  res.send(buffer);
});

// ─── Static files (SPA fallback) ───
// Serve all /assets files explicitly before the catch-all
app.get('/assets/*', (req, res) => {
  const filePath = path.join(DIST_DIR, req.path);
  if (fs.existsSync(filePath)) {
    const ext = path.extname(filePath).toLowerCase();
    const mime = {
      '.js': 'application/javascript',
      '.css': 'text/css',
      '.json': 'application/json',
      '.svg': 'image/svg+xml',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.webp': 'image/webp',
      '.ico': 'image/x-icon',
      '.woff2': 'font/woff2',
    }[ext] || 'application/octet-stream';
    res.setHeader('Content-Type', mime);
    return res.sendFile(filePath);
  }
  res.status(404).end();
});
app.get('*', (req, res) => {
  // SPA fallback: only for non-file routes
  res.sendFile(path.join(DIST_DIR, 'index.html'));
});

const server = app.listen(PORT, () => {
  const quota = getQuota();
  console.log(`[server] Static: ${DIST_DIR}`);
  console.log(`[server] Terrain cache: ${CACHE_DIR}`);
  console.log(`[server] Log: ${LOG_FILE}`);
  console.log(`[server] Quota: ${quota.total}/50000 (${quota.month})`);
  console.log(`[server] Listening on http://0.0.0.0:${PORT}`);
});

setupTerrainWebSocket(server);
