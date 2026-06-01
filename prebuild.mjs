/**
 * prebuild.mjs — injects package.json version into index.html boot-screen
 * before each production build. Does NOT bump version — that happens on push.
 */
import { readFileSync, writeFileSync } from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pkg = require('./package.json');

const html = readFileSync('index.html', 'utf8');
const updated = html.replace(
  /(class="version">)v[^<]+/,
  '$1v' + pkg.version,
);
writeFileSync('index.html', updated);
console.log(`[prebuild] version injected: v${pkg.version}`);
