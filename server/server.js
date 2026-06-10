/**
 * server.js — Единый сервер: статика + terrain proxy API.
 *
 * Заменяет `serve dist -p 3410` + отдельный terrain-proxy.
 * Раздаёт статику из dist/ и обрабатывает /api/terrain/*
 */
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
dotenv.config({ path: path.join(ROOT, '.env') });

const DIST_DIR = path.join(ROOT, 'dist');
const CACHE_DIR = path.join(ROOT, 'cache', 'terrain');
const QUOTA_FILE = path.join(ROOT, 'cache', 'terrain-quota.json');
const PORT = 3410;

const MAPBOX_TOKEN = process.env.VITE_MAPBOX_TOKEN || process.env.MAPBOX_TOKEN;
if (!MAPBOX_TOKEN) {
  console.error('[server] ERROR: No VITE_MAPBOX_TOKEN in .env');
  process.exit(1);
}

// ─── Quota ───
let quota = loadQuota();
function loadQuota() {
  try {
    if (fs.existsSync(QUOTA_FILE)) {
      const data = JSON.parse(fs.readFileSync(QUOTA_FILE, 'utf-8'));
      const now = new Date();
      const currentMonth = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
      if (data.month === currentMonth) return data;
    }
  } catch {}
  return { month: currentMonth(), dem: 0, sat: 0, total: 0 };
}
function currentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
}
function saveQuota() {
  try {
    const dir = path.dirname(QUOTA_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(QUOTA_FILE, JSON.stringify(quota, null, 2));
  } catch {}
}
function incrementQuota(type) {
  const cm = currentMonth();
  if (quota.month !== cm) quota = { month: cm, dem: 0, sat: 0, total: 0 };
  if (type === 'dem') quota.dem++;
  if (type === 'sat') quota.sat++;
  quota.total++;
  saveQuota();
}
function cacheFilePath(z, x, y, type) {
  const ext = type === 'dem' ? 'png' : 'webp';
  const dir = path.join(CACHE_DIR, String(z), String(x));
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return path.join(dir, `${y}-${type}.${ext}`);
}

// ─── Express ───
const app = express();

// CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// ─── Terrain API ───

// GET /api/terrain/quota
app.get('/api/terrain/quota', (req, res) => {
  const cm = currentMonth();
  if (quota.month !== cm) { quota = { month: cm, dem: 0, sat: 0, total: 0 }; saveQuota(); }
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

  // 1. Cache check
  const cached = cacheFilePath(zN, xN, yN, type);
  if (fs.existsSync(cached)) {
    const ct = type === 'dem' ? 'image/png' : 'image/jpeg';
    res.setHeader('Content-Type', ct);
    res.setHeader('X-Cache', 'HIT');
    return res.sendFile(cached);
  }

  // 2. Quota check
  if (quota.total >= 45000) return res.status(429).json({ error: 'Quota near limit', quota: { used: quota.total, limit: 50000 } });

  // 3. Proxy to Mapbox
  const url = type === 'dem'
    ? `https://api.mapbox.com/v4/mapbox.terrain-rgb/${zN}/${xN}/${yN}.pngraw?access_token=${MAPBOX_TOKEN}`
    : `https://api.mapbox.com/v4/mapbox.satellite/${zN}/${xN}/${yN}.jpg90?access_token=${MAPBOX_TOKEN}`;

  try {
    const resp = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!resp.ok) return res.status(resp.status).json({ error: `Mapbox: ${resp.status}` });

    const ct = resp.headers.get('content-type') || (type === 'dem' ? 'image/png' : 'image/jpeg');
    const buffer = Buffer.from(await resp.arrayBuffer());

    // Cache
    try { fs.writeFileSync(cached, buffer); } catch {}
    incrementQuota(type);

    console.log(`[tile] ${type} ${z}/${x}/${y} — cached (quota: ${quota.total}/50000)`);
    res.setHeader('Content-Type', ct);
    res.setHeader('X-Cache', 'MISS');
    res.send(buffer);
  } catch (err) {
    if (err.name === 'TimeoutError') return res.status(504).json({ error: 'Mapbox timeout' });
    console.error(`[tile] Error ${z}/${x}/${y}:`, err.message);
    res.status(502).json({ error: 'Upstream failed' });
  }
});

// ─── Static files (SPA fallback) ───
app.use(express.static(DIST_DIR));
app.get('*', (req, res) => {
  res.sendFile(path.join(DIST_DIR, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`[server] Static: ${DIST_DIR}`);
  console.log(`[server] Terrain cache: ${CACHE_DIR}`);
  console.log(`[server] Quota: ${quota.total}/50000 (${quota.month})`);
  console.log(`[server] Listening on http://0.0.0.0:${PORT}`);
});
