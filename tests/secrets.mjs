import fs from 'node:fs';
import path from 'node:path';
const root = new URL('..', import.meta.url);
const banned = [/sk-[A-Za-z0-9_-]{20,}/, /ghp_[A-Za-z0-9]{20,}/, /api[_-]?key\s*[:=]\s*["'][^"']+/i];
const allowedExt = new Set(['.html','.css','.js','.mjs','.json','.md','.txt','.xml','.yml','.yaml','']);
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '.git') continue;
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p);
    else if (allowedExt.has(path.extname(entry.name))) {
      const text = fs.readFileSync(p, 'utf8');
      for (const pattern of banned) if (pattern.test(text)) throw new Error(`Possible secret in ${p}`);
    }
  }
}
walk(root.pathname);
console.log('Secret scan passed.');
