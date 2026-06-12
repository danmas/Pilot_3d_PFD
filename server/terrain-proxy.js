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
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import dotenv from 'dotenv';

// ─── Пути ───
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
dotenv.config({ path: path.join(ROOT, '.env') });

const CACHE_DIR = path.join(ROOT, 'cache', 'terrain');
const QUOTA_FILE = path.join(ROOT, 'cache', 'terrain-quota.json');
const LOG_FILE = path.join(ROOT, 'cache', 'terrain', 'access.log');
const PORT = parseInt(process.env.TERRAIN_PROXY_PORT || '3409', 10);

// Создаём папки кэша
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

// ─── Mapbox Token ───
const MAPBOX_TOKEN = process.env.VITE_MAPBOX_TOKEN || process.env.MAPBOX_TOKEN;
if (!MAPBOX_TOKEN) {
  console.error('[terrain-proxy] ERROR: No VITE_MAPBOX_TOKEN or MAPBOX_TOKEN in .env');
  process.exit(1);
}

// ─── Quota tracking ───
let quota = loadQuota();

function loadQuota() {
  try {
    if (fs.existsSync(QUOTA_FILE)) {
      const data = JSON.parse(fs.readFileSync(QUOTA_FILE, 'utf-8'));
      // Проверяем месяц — если не текущий, сбрасываем
      const now = new Date();
      const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      if (data.month === currentMonth) {
        return data;
      }
    }
  } catch (e) {
    console.warn('[terrain-proxy] Failed to load quota, resetting:', e.message);
  }
  return { month: currentMonth(), dem: 0, sat: 0, total: 0 };
}

function currentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function saveQuota() {
  try {
    const dir = path.dirname(QUOTA_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(QUOTA_FILE, JSON.stringify(quota, null, 2));
  } catch (e) {
    console.error('[terrain-proxy] Failed to save quota:', e.message);
  }
}

// ─── Log ───
function appendLog(entry) {
  try {
    const dir = path.dirname(LOG_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.appendFileSync(LOG_FILE, JSON.stringify(entry) + '\n');
  } catch {}
}

function incrementQuota(type) {
  const now = new Date();
  const cm = currentMonth();
  if (quota.month !== cm) {
    quota = { month: cm, dem: 0, sat: 0, total: 0 };
  }
  if (type === 'dem') quota.dem++;
  if (type === 'sat') quota.sat++;
  quota.total++;
  saveQuota();
}

// ─── Cache helpers ───
function cacheFileName(z, x, y, type) {
  // Структура: cache/terrain/z/x/y-type.ext
  const ext = type === 'dem' ? 'png' : 'webp';
  const dir = path.join(CACHE_DIR, String(z), String(x));
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return path.join(dir, `${y}-${type}.${ext}`);
}

function getFromCache(z, x, y, type) {
  const filePath = cacheFileName(z, x, y, type);
  if (fs.existsSync(filePath)) {
    return filePath;
  }
  return null;
}

function saveToCache(z, x, y, type, data) {
  try {
    const filePath = cacheFileName(z, x, y, type);
    fs.writeFileSync(filePath, data);
  } catch (e) {
    console.error(`[terrain-proxy] Failed to cache ${z}/${x}/${y} ${type}:`, e.message);
  }
}

// ─── Mapbox URLs ───
function mapboxDemUrl(z, x, y, token) {
  return `https://api.mapbox.com/v4/mapbox.terrain-rgb/${z}/${x}/${y}.pngraw?access_token=${token}`;
}

function mapboxSatUrl(z, x, y, token) {
  return `https://api.mapbox.com/v4/mapbox.satellite/${z}/${x}/${y}.jpg90?access_token=${token}`;
}

// ─── Express app ───
const app = express();

// CORS для фронтенда
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }
  next();
});

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

// GET /api/terrain/quota — статистика запросов
app.get('/api/terrain/quota', (req, res) => {
  const now = new Date();
  const cm = currentMonth();
  if (quota.month !== cm) {
    quota = { month: cm, dem: 0, sat: 0, total: 0 };
    saveQuota();
  }
  res.json({
    month: quota.month,
    dem: quota.dem,
    sat: quota.sat,
    total: quota.total,
    limit: 50000,
    remaining: Math.max(0, 50000 - quota.total),
    resetDate: getNextMonthDate(),
  });
});

function getNextMonthDate() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString().split('T')[0];
}

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

  // 1. Проверяем кэш
  const cached = getFromCache(zNum, xNum, yNum, type);
  if (cached) {
    const contentType = type === 'dem' ? 'image/png' : 'image/jpeg';
    res.setHeader('Content-Type', contentType);
    res.setHeader('X-Cache', 'HIT');
    appendLog({
      t: new Date().toISOString(),
      coord: { z: zNum, x: xNum, y: yNum },
      type,
      status: 'HIT',
      quotaTotal: quota.total,
    });
    return res.sendFile(cached);
  }

  // 2. Проверяем лимит (оставляем 10% буфер)
  if (quota.total >= 45000) {
    console.warn(`[terrain-proxy] Quota near limit: ${quota.total}/50000`);
    return res.status(429).json({
      error: 'Mapbox quota limit approaching',
      quota: { used: quota.total, limit: 50000 },
    });
  }

  // 3. Прокси к Mapbox
  const url = type === 'dem'
    ? mapboxDemUrl(zNum, xNum, yNum, MAPBOX_TOKEN)
    : mapboxSatUrl(zNum, xNum, yNum, MAPBOX_TOKEN);

  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      return res.status(response.status).json({
        error: `Mapbox API error: ${response.status} ${response.statusText}`,
      });
    }

    const contentType = response.headers.get('content-type') || (type === 'dem' ? 'image/png' : 'image/jpeg');
    const buffer = Buffer.from(await response.arrayBuffer());

    // 4. Кэшируем + считаем
    saveToCache(zNum, xNum, yNum, type, buffer);
    incrementQuota(type);

    console.log(`[terrain-proxy] ${type} ${z}/${x}/${y} — cached (quota: ${quota.total}/50000)`);

    appendLog({
      t: new Date().toISOString(),
      coord: { z: zNum, x: xNum, y: yNum },
      type,
      status: 'MISS',
      quotaTotal: quota.total,
    });

    res.setHeader('Content-Type', contentType);
    res.setHeader('X-Cache', 'MISS');
    res.send(buffer);
  } catch (err) {
    if (err.name === 'TimeoutError' || err.name === 'AbortError') {
      appendLog({
        t: new Date().toISOString(),
        coord: { z: zNum, x: xNum, y: yNum },
        type,
        status: 'TIMEOUT',
        error: 'Mapbox timeout',
        quotaTotal: quota.total,
      });
      return res.status(504).json({ error: 'Mapbox timeout' });
    }
    console.error(`[terrain-proxy] Error fetching ${type} ${z}/${x}/${y}:`, err.message);
    appendLog({
      t: new Date().toISOString(),
      coord: { z: zNum, x: xNum, y: yNum },
      type,
      status: 'ERROR',
      error: err.message,
      quotaTotal: quota.total,
    });
    res.status(502).json({ error: 'Upstream fetch failed' });
  }
});

// ─── Запуск ───
app.listen(PORT, () => {
  console.log(`[terrain-proxy] Server running on http://0.0.0.0:${PORT}`);
  console.log(`[terrain-proxy] Cache dir: ${CACHE_DIR}`);
  console.log(`[terrain-proxy] Quota: ${quota.total}/50000 (${quota.month})`);
});
