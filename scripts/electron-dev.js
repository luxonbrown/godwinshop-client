// Runs the Vite dev server, waits until it responds, then launches Electron.
// Usage: node scripts/electron-dev.js
const { spawn } = require('child_process');
const http = require('http');
const electron = require('electron');

const DEV_URL = process.env.VITE_DEV_URL || 'http://localhost:5173';
const MAX_WAIT_MS = 60000;

function urlReady(url, timeoutMs) {
  return new Promise((resolve, reject) => {
    const started = Date.now();
    const check = () => {
      const req = http.get(url, (res) => {
        res.resume();
        if (res.statusCode < 500) return resolve();
        setTimeout(check, 500);
      });
      req.on('error', () => {
        if (Date.now() - started > timeoutMs) return reject(new Error(`Timed out waiting for ${url}`));
        setTimeout(check, 500);
      });
    };
    check();
  });
}

async function main() {
  console.log('[electron:dev] starting Vite dev server…');
  const vite = spawn('npx', ['vite'], {
    stdio: 'inherit',
    shell: process.platform === 'win32'
  });

  try {
    await urlReady(DEV_URL, MAX_WAIT_MS);
    console.log(`[electron:dev] ${DEV_URL} is up, launching Electron…`);
    const app = spawn(electron, ['.'], {
      stdio: 'inherit',
      shell: process.platform === 'win32'
    });

    const shutdown = () => {
      app.kill();
      vite.kill();
    };
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);

    app.on('close', () => {
      vite.kill();
      process.exit(0);
    });
  } catch (err) {
    console.error('[electron:dev]', err.message);
    vite.kill();
    process.exit(1);
  }
}

main();