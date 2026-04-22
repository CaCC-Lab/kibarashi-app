// zero-dep .env ローダ
// backend/.env → .env → .env.local の順に探し、最初に見つかったものを読み込む
const fs = require('fs');
const path = require('path');

function parseDotenv(content) {
  const out = {};
  for (const raw of content.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

function loadEnv(rootDir = process.cwd()) {
  // .env.vercel を先頭に置いて優先。vercel env pull で取得した本番envを上書きなしで使う。
  const candidates = [
    path.join(rootDir, '.env.vercel'),
    path.join(rootDir, '.env.production'),
    path.join(rootDir, 'backend', '.env'),
    path.join(rootDir, '.env'),
    path.join(rootDir, '.env.local'),
    path.join(rootDir, 'frontend', '.env'),
  ];
  for (const file of candidates) {
    if (!fs.existsSync(file)) continue;
    try {
      const parsed = parseDotenv(fs.readFileSync(file, 'utf8'));
      let loaded = 0;
      for (const [k, v] of Object.entries(parsed)) {
        if (process.env[k] === undefined) {
          process.env[k] = v;
          loaded += 1;
        }
      }
      if (loaded > 0) {
        console.log(`[env] ${path.relative(rootDir, file)} から ${loaded} 件読込`);
      }
    } catch (err) {
      console.warn(`[env] ${file} 読込失敗: ${err.message}`);
    }
  }
}

module.exports = { loadEnv };
