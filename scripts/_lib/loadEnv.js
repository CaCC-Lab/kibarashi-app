// zero-dep .env ローダ
// .env.vercel を最優先で読み、既存の process.env は上書きしない。複数ファイルをマージする。
const fs = require('fs');
const path = require('path');

/** 行末のインラインコメント（直前が空白の #）を除去。URL の #fragment は空白なしのため残る。 */
function stripUnquotedInlineComment(val) {
  return val.replace(/\s+#.*$/, '').trim();
}

function parseDoubleQuotedBody(s) {
  let out = '';
  let i = 1;
  while (i < s.length) {
    const c = s[i];
    if (c === '\\') {
      i++;
      if (i >= s.length) break;
      const n = s[i];
      if (n === 'n') out += '\n';
      else if (n === 'r') out += '\r';
      else if (n === 't') out += '\t';
      else if (n === '"') out += '"';
      else if (n === '\\') out += '\\';
      else out += '\\' + n;
      i++;
      continue;
    }
    if (c === '"') return { value: out, end: i };
    out += c;
    i++;
  }
  return null;
}

/**
 * KEY= の右辺を解釈（dotenv に近い: 未引用値の末尾 # コメント、引用値の閉じ後の # コメント）
 */
function parseDotenvValue(raw) {
  const trimmed = raw.trim();
  if (!trimmed) return '';

  if (trimmed.startsWith("'")) {
    const end = trimmed.indexOf("'", 1);
    if (end !== -1) {
      return trimmed.slice(1, end).replace(/[\s\r\n]+$/, '');
    }
  } else if (trimmed.startsWith('"')) {
    const parsed = parseDoubleQuotedBody(trimmed);
    if (parsed) return parsed.value.replace(/[\s\r\n]+$/, '');
  }

  return stripUnquotedInlineComment(trimmed).replace(/[\s\r\n]+$/, '');
}

function parseDotenv(content) {
  const out = {};
  for (const raw of content.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    const val = parseDotenvValue(line.slice(eq + 1));
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
