// zero-dep .env ローダ
// .env.vercel を最優先で読み、既存の process.env は上書きしない。複数ファイルをマージする。
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
    // 引用符で囲まれている場合は外す
    const dbl = val.startsWith('"') && val.endsWith('"');
    const sgl = val.startsWith("'") && val.endsWith("'");
    if (dbl || sgl) {
      val = val.slice(1, -1);
      // ダブルクォートの場合はエスケープ列を展開（Vercel env pull が末尾に \n を付けるケースに対応）
      if (dbl) {
        val = val.replace(/\\n/g, '\n').replace(/\\r/g, '\r').replace(/\\t/g, '\t').replace(/\\"/g, '"').replace(/\\\\/g, '\\');
      }
    }
    // キー/URLの末尾に残った制御文字を除去（JWT や URL に改行/空白が混入すると検証が落ちるため）
    val = val.replace(/[\s\r\n]+$/, '');
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
