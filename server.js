/**
 * Wrapper to load .env before starting the app.
 * Use this as start command on Hostinger: node server.js
 * So NEXT_PUBLIC_WORDPRESS_URL and other vars are available at runtime.
 *
 * .env joylashuvi (Hostinger): public_html/.builds/config/.env
 * Rootdagi .env deploy/restart da o'chib ketadi, shuning uchun avval
 * .builds/config/.env ni tekshiramiz.
 */
const path = require('path');
const fs = require('fs');

const envPaths = [
  path.join(__dirname, '.builds', 'config', '.env'), // Hostinger – bu joyda qoladi
  path.join(__dirname, '.env'),
];

for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    require('dotenv').config({ path: envPath });
    break;
  }
}

const { spawnSync } = require('child_process');

const result = spawnSync('npm', ['run', 'start'], {
  stdio: 'inherit',
  env: process.env,
  cwd: __dirname,
  shell: true,
});

process.exit(result.status ?? 1);
