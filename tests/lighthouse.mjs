// Lighthouse-Accessibility für Gate, Dashboard (gesperrt) und Dashboard (alles offen).
//   cd tests && node lighthouse.mjs
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";
import lighthouse from "lighthouse";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const data = (await import("../data.js")).default;
const PORT = 8766;
const URL = `http://localhost:${PORT}/`;
const server = spawn("python3", ["-m", "http.server", String(PORT), "--bind", "127.0.0.1"], { cwd: root, stdio: "ignore" });
await new Promise((r) => setTimeout(r, 700));
const browser = await chromium.launch({ executablePath: process.env.CHROME ?? "/usr/bin/google-chrome-stable", args: ["--remote-debugging-port=9333"] });
const page = await (await browser.newContext()).newPage();
await page.goto(URL);

const key = data.settings.storageKey;
const states = {
  gate: null,
  "dashboard-gesperrt": { gate: true, unlocked: {}, choice: null, welcomed: true },
  "dashboard-offen": { gate: true, unlocked: Object.fromEntries(data.activities.map((a) => [a.id, true])), choice: "schnee", welcomed: true },
};
let worst = 100;
for (const [name, state] of Object.entries(states)) {
  await page.evaluate(([k, s]) => (s ? localStorage.setItem(k, JSON.stringify(s)) : localStorage.removeItem(k)), [key, state]);
  for (const formFactor of ["mobile", "desktop"]) {
    const r = await lighthouse(URL, { port: 9333, onlyCategories: ["accessibility", "best-practices", "seo"], disableStorageReset: true, formFactor,
      screenEmulation: formFactor === "mobile" ? undefined : { mobile: false, width: 1280, height: 860, deviceScaleFactor: 1, disabled: false } , logLevel: "error" });
    const c = r.lhr.categories;
    const a11y = Math.round(c.accessibility.score * 100);
    worst = Math.min(worst, a11y);
    console.log(`${name.padEnd(20)} ${formFactor.padEnd(8)} Accessibility ${a11y}  Best Practices ${Math.round(c["best-practices"].score * 100)}`);
    for (const audit of Object.values(r.lhr.audits)) {
      if (audit.score !== null && audit.score < 1 && c.accessibility.auditRefs.some((x) => x.id === audit.id)) console.log(`    – ${audit.id}: ${audit.title}`);
    }
  }
}
await browser.close();
server.kill();
process.exit(worst >= 90 ? 0 : 1);
