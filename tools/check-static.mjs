#!/usr/bin/env node
/**
 * Vérifie que le UI Kit reste 100 % statique : aucun appel réseau / backend.
 * Usage : node tools/check-static.mjs [dossier]   (par défaut : src/app)
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = process.argv[2] ?? 'src/app';
const RULES = [
  [/\bHttpClient\b|provideHttpClient|HttpClientModule|@angular\/common\/http/, 'HttpClient / module HTTP'],
  [/\bfetch\s*\(/, 'fetch()'],
  [/\baxios\b/, 'axios'],
  [/\bWebSocket\b|ngx-socket-io|socket\.io/, 'WebSocket / socket.io'],
  [/\bXMLHttpRequest\b|EventSource\b/, 'XMLHttpRequest / EventSource'],
  [/environments?\/environment|environment\.(api|apiUrl|socketIoConfig)/, 'environment / apiUrl'],
  [/\/api\/|https?:\/\/(?!www\.w3\.org)[^'"`\s]+\/api/, 'endpoint API'],
  [/ngx-webstorage-service|@angular\/fire|firebase|@sentry\//, 'dépendance backend (storage/firebase/sentry)'],
  [/\bfrom ['"]moment['"]|@fullcalendar|ckeditor|ngx-quill/, 'dépendance non installée'],
];

const files = [];
(function walk(dir) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(ts|html)$/.test(f)) files.push(p);
  }
})(root);

let hits = 0;
for (const f of files) {
  const lines = readFileSync(f, 'utf8').split('\n');
  lines.forEach((line, i) => {
    if (/^\s*(\/\/|\*|\/\*)/.test(line)) return; // commentaires
    for (const [re, label] of RULES) {
      if (re.test(line)) {
        hits++;
        console.log(`${relative(process.cwd(), f)}:${i + 1}  [${label}]  ${line.trim().slice(0, 120)}`);
      }
    }
  });
}
console.log(hits ? `\n✖ ${hits} occurrence(s) interdite(s) dans ${files.length} fichiers.` : `✔ Aucun appel backend détecté (${files.length} fichiers analysés).`);
process.exit(hits ? 1 : 0);
