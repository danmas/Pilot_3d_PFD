import { execSync } from 'child_process';

/**
 * Cross-platform port killer.
 * Usage: node scripts/kill-port.js 3410 3409
 *
 * Kills any processes listening on the given TCP ports.
 * - Windows: netstat + taskkill
 * - Unix: lsof + kill
 *
 * Safe to run even if nothing is listening.
 * Used in "predev" to prevent Vite from silently falling back to 3411.
 */

const ports = process.argv.slice(2);

if (ports.length === 0) {
  ports.push('3410');
}

for (const port of ports) {
  console.log(`[kill-port] Cleaning port ${port}...`);

  try {
    if (process.platform === 'win32') {
      // Windows: find PIDs listening on the port
      let output = '';
      try {
        output = execSync(`netstat -ano | findstr :${port}`, {
          encoding: 'utf8',
          stdio: ['pipe', 'pipe', 'ignore']
        }).trim();
      } catch (e) {
        // no matches → port free
        console.log(`[kill-port]   Port ${port} is free.`);
        continue;
      }

      if (!output) {
        console.log(`[kill-port]   Port ${port} is free.`);
        continue;
      }

      const pids = new Set();
      output.split('\n').forEach((line) => {
        const trimmed = line.trim();
        if (!trimmed) return;
        const cols = trimmed.split(/\s+/);
        // Last column is usually the PID
        const last = cols[cols.length - 1];
        if (last && /^\d+$/.test(last)) {
          pids.add(last);
        }
      });

      if (pids.size === 0) {
        console.log(`[kill-port]   Port ${port} is free.`);
        continue;
      }

      for (const pid of pids) {
        try {
          execSync(`taskkill /PID ${pid} /F`, { stdio: 'inherit' });
          console.log(`[kill-port]   Killed PID ${pid} on port ${port}`);
        } catch (e) {
          // process may have already exited
        }
      }
    } else {
      // Unix / macOS / Linux
      let pidsStr = '';
      try {
        pidsStr = execSync(`lsof -ti :${port} || true`, {
          encoding: 'utf8'
        }).trim();
      } catch (e) {
        console.log(`[kill-port]   Port ${port} is free.`);
        continue;
      }

      if (!pidsStr) {
        console.log(`[kill-port]   Port ${port} is free.`);
        continue;
      }

      const pids = pidsStr.split('\n').filter(Boolean);
      for (const pid of pids) {
        try {
          execSync(`kill -9 ${pid}`, { stdio: 'inherit' });
          console.log(`[kill-port]   Killed PID ${pid} on port ${port}`);
        } catch (e) {}
      }
    }
  } catch (err) {
    console.log(`[kill-port]   Port ${port} is free or could not be inspected.`);
  }
}

console.log('[kill-port] Done.');