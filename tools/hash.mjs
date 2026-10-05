#!/usr/bin/env node
// Wandelt Klartext-Passwörter in die Hashes für data.js um.
//
//   node tools/hash.mjs kaffee
//   node tools/hash.mjs caro2026 kaffee "zwei wörter"
//
// Groß/Kleinschreibung und Leerzeichen am Rand spielen keine Rolle –
// genau wie später auf der Seite.

import { hashPassword, normalize } from "../js/hash.js";

const words = process.argv.slice(2);
if (words.length === 0) {
  console.log('Aufruf: node tools/hash.mjs <passwort> [weitere …]');
  process.exit(1);
}

for (const w of words) {
  const h = await hashPassword(w);
  console.log(`${JSON.stringify(normalize(w))}\n  ${h}\n`);
}
