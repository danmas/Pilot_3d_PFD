/**
 * terrain-tile-loader.js — Shared tile loader used by HTTP proxy and WebSocket.
 *
 * Reads from disk cache (cache/terrain) or fetches from Mapbox,
 * tracks quota and writes access log.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
dotenv.config({ path: path.join(ROOT, '.env') });

export const CACHE_DIR = path.join(ROOT, 'cache', 'terrain');
export const QUOTA_FILE = path.join(ROOT, 'cache', 'terrain-quota.json');
export const LOG_FILE = path.join(ROOT, 'cache', 'terrain', 'access.log');

if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

const MAPBOX_TOKEN = process.env.VITE_MAPBOX_TOKEN || process.env.MAPBOX_TOKEN;
if (!MAPBOX_TOKEN) {
  console.error('[terrain-tile-loader] ERROR: No VITE_MAPBOX_TOKEN or MAPBOX_TOKEN in .env');
  process.exit(1);
}

let quota = loadQuota();

function currentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function loadQuota() {
  try {
    if (fs.existsSync(QUOTA_FILE)) {
      const data = JSON.parse(fs.readFileSync(QUOTA_FILE, 'utf-8'));
      const cm = currentMonth();
      if (data.month === cm) return data;
    }
  } catch (e) {
    console.warn('[terrain-tile-loader] Failed to load quota:', e.message);
  }
  return { month: currentMonth(), dem: 0, sat: 0, total: 0 };
}

export function saveQuota() {
  try {
    const dir = path.dirname(QUOTA_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(QUOTA_FILE, JSON.stringify(quota, null, 2));
  } catch (e) {
    console.error('[terrain-tile-loader] Failed to save quota:', e.message);
  }
}

export function incrementQuota(type) {
  const cm = currentMonth();
  if (quota.month !== cm) {
    quota = { month: cm, dem: 0, sat: 0, total: 0 };
  }
  if (type === 'dem') quota.dem++;
  if (type === 'sat') quota.sat++;
  quota.total++;
  saveQuota();
}

export function appendLog(entry) {
  try {
    const dir = path.dirname(LOG_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.appendFileSync(LOG_FILE, JSON.stringify(entry) + '\n');
  } catch {}
}

export function getQuota() {
  const cm = currentMonth();
  if (quota.month !== cm) {
    quota = { month: cm, dem: 0, sat: 0, total: 0 };
    saveQuota();
  }
  return quota;
}

export function cacheFilePath(z, x, y, type) {
  const ext = type === 'dem' ? 'png' : 'webp';
  const dir = path.join(CACHE_DIR, String(z), String(x));
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return path.join(dir, `${y}-${type}.${ext}`);
}

function mapboxDemUrl(z, x, y) {
  return `https://api.mapbox.com/v4/mapbox.terrain-rgb/${z}/${x}/${y}.pngraw?access_token=${MAPBOX_TOKEN}`;
}

function mapboxSatUrl(z, x, y) {
  return `https://api.mapbox.com/v4/mapbox.satellite/${z}/${x}/${y}.jpg90?access_token=${MAPBOX_TOKEN}`;
}

/**
 * Load a single tile as Buffer.
 * Returns null if quota exceeded or fetch failed.
 */
export async function loadTileBuffer(z, x, y, type) {
  if (type !== 'dem' && type !== 'sat') {
    throw new Error(`Invalid tile type: ${type}`);
  }

  const cached = cacheFilePath(z, x, y, type);

  // 1. Cache hit
  if (fs.existsSync(cached)) {
    appendLog({
      t: new Date().toISOString(),
      coord: { z, x, y },
      type,
      status: 'HIT',
      quotaTotal: quota.total,
    });
    return fs.readFileSync(cached);
  }

  // 2. Quota check
  if (quota.total >= 45000) {
    appendLog({
      t: new Date().toISOString(),
      coord: { z, x, y },
      type,
      status: 'QUOTA_EXCEEDED',
      quotaTotal: quota.total,
    });
    return null;
  }

  // 3. Fetch from Mapbox
  const url = type === 'dem' ? mapboxDemUrl(z, x, y) : mapboxSatUrl(z, x, y);

  try {
    let response;
    for (let attempt = 0; attempt < 2; attempt++) {
      response = await fetch(url, { signal: AbortSignal.timeout(10000) });
      if (response.ok) break;
      if (attempt === 0 && response.status >= 500) {
        await new Promise(r => setTimeout(r, 200));
        continue;
      }
      appendLog({
        t: new Date().toISOString(),
        coord: { z, x, y },
        type,
        status: 'ERROR',
        error: `Mapbox: ${response.status}`,
        quotaTotal: quota.total,
      });
      return null;
    }

    if (!response || !response.ok) return null;

    const buffer = Buffer.from(await response.arrayBuffer());

    try {
      fs.writeFileSync(cached, buffer);
    } catch (e) {
      console.error(`[terrain-tile-loader] Failed to cache ${z}/${x}/${y} ${type}:`, e.message);
    }

    incrementQuota(type);

    console.log(`[terrain-tile-loader] ${type} ${z}/${x}/${y} — cached (quota: ${quota.total}/50000)`);

    appendLog({
      t: new Date().toISOString(),
      coord: { z, x, y },
      type,
      status: 'MISS',
      quotaTotal: quota.total,
    });

    return buffer;
  } catch (err) {
    appendLog({
      t: new Date().toISOString(),
      coord: { z, x, y },
      type,
      status: err.name === 'TimeoutError' ? 'TIMEOUT' : 'ERROR',
      error: err.message,
      quotaTotal: quota.total,
    });
    return null;
  }
}
