// Erzeugt die Platzhalterbilder in images/ (SVG-Quelle + JPG).
// Nur nötig, wenn du die Platzhalter neu bauen willst:  cd tests && node make-placeholders.mjs
import { writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { chromium } from "playwright-core";
import { iconPaths } from "../js/icons.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const W = 1200;
const H = 800;

// Zufall mit festem Startwert, damit die Bilder bei jedem Lauf gleich aussehen
let seed = 7;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

const sparkle = (x, y, r, o = 0.8, c = "#fff") =>
  `<path d="M${x} ${y - r}C${x + r * 0.15} ${y - r * 0.15} ${x + r * 0.15} ${y - r * 0.15} ${x + r} ${y}C${x + r * 0.15} ${y + r * 0.15} ${x + r * 0.15} ${y + r * 0.15} ${x} ${y + r}C${x - r * 0.15} ${y + r * 0.15} ${x - r * 0.15} ${y + r * 0.15} ${x - r} ${y}C${x - r * 0.15} ${y - r * 0.15} ${x - r * 0.15} ${y - r * 0.15} ${x} ${y - r}Z" fill="${c}" opacity="${o}"/>`;

const dots = (n, c, maxR = 3, op = 0.6) =>
  Array.from({ length: n }, () => `<circle cx="${rnd() * W}" cy="${rnd() * H}" r="${0.6 + rnd() * maxR}" fill="${c}" opacity="${(0.2 + rnd() * op).toFixed(2)}"/>`).join("");

const images = {
  fruehstueck: {
    icon: "cup",
    stops: ["#fbe7b5", "#e7b45a", "#a8692a"],
    deco: () =>
      `<circle cx="980" cy="160" r="260" fill="#fff6dc" opacity=".35"/>` +
      dots(60, "#fff7e0", 4, 0.5) +
      [180, 1030, 260, 900].map((x, i) => sparkle(x, [180, 620, 640, 110][i], 26 + i * 6, 0.75)).join(""),
  },
  schnee: {
    icon: "snow",
    stroke: "#1d5577",
    stops: ["#f2fbff", "#a7d6f0", "#3f7fb3"],
    deco: () =>
      `<path d="M0 640 L220 470 L380 560 L560 400 L760 560 L930 470 L1200 620 V800 H0Z" fill="#ffffff" opacity=".55"/>` +
      `<path d="M0 700 L260 590 L470 660 L700 560 L940 670 L1200 600 V800 H0Z" fill="#ffffff" opacity=".8"/>` +
      dots(140, "#ffffff", 4, 0.8),
  },
  weihnachtsmarkt: {
    icon: "market",
    stops: ["#d5503e", "#9d2329", "#24563f"],
    deco: () => {
      let s = "";
      for (let row = 0; row < 2; row++) {
        const y0 = 90 + row * 70;
        s += `<path d="M-20 ${y0} Q300 ${y0 + 90} 600 ${y0} T1220 ${y0}" stroke="#2c1a10" stroke-width="2" fill="none" opacity=".35"/>`;
        for (let i = 0; i <= 24; i++) {
          const t = i / 24;
          const x = -20 + t * 1240;
          const y = y0 + Math.sin(t * Math.PI * 2) * 45 * (row ? -1 : 1) * 0 + (Math.sin((t * 2 % 1) * Math.PI) * 45);
          s += `<circle cx="${x}" cy="${y + 8}" r="9" fill="#ffd77a" opacity=".95"/><circle cx="${x}" cy="${y + 8}" r="24" fill="#ffd77a" opacity=".18"/>`;
        }
      }
      return s + dots(50, "#ffe9b0", 2.5, 0.6);
    },
  },
  minigolf: {
    icon: "golf",
    stops: ["#1a0b3a", "#3b1070", "#0b2240"],
    stroke: "#f6e9ff",
    deco: () =>
      `<circle cx="200" cy="180" r="240" fill="#8f3cf7" opacity=".35"/><circle cx="1020" cy="640" r="260" fill="#2fd8e6" opacity=".25"/><circle cx="980" cy="160" r="160" fill="#ff4fb3" opacity=".28"/>` +
      [["#ff4fb3", 560], ["#2fd8e6", 620], ["#b98cff", 680]]
        .map(([c, y]) => `<path d="M-20 ${y} C300 ${y - 80} 600 ${y + 60} 1220 ${y - 40}" stroke="${c}" stroke-width="5" fill="none" opacity=".8"/>`)
        .join("") +
      dots(70, "#e6d4ff", 2.5, 0.7),
  },
  abendessen: {
    icon: "dinner",
    stops: ["#fbd79a", "#df8a32", "#7a3a14"],
    deco: () =>
      [220, 980].map((x) => `<circle cx="${x}" cy="300" r="160" fill="#fff1c9" opacity=".22"/><rect x="${x - 12}" y="330" width="24" height="170" rx="6" fill="#fff6e3" opacity=".8"/><path d="M${x} 270 c-18 22 -14 46 0 58 c14 -12 18 -36 0 -58z" fill="#fff3c4"/>`).join("") +
      dots(60, "#fff1d0", 3, 0.5),
  },
  therme: {
    icon: "spa",
    stops: ["#b4f3ea", "#2fb5aa", "#103f5c"],
    deco: () =>
      Array.from({ length: 45 }, () => {
        const r = 6 + rnd() * 26;
        return `<circle cx="${rnd() * W}" cy="${rnd() * H}" r="${r}" fill="none" stroke="#ffffff" stroke-width="2" opacity="${(0.15 + rnd() * 0.4).toFixed(2)}"/>`;
      }).join("") + dots(40, "#ffffff", 3, 0.6),
  },
};

function svgFor(name, cfg) {
  const [a, b, c] = cfg.stops;
  const size = 300;
  const scale = size / 24;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${a}"/><stop offset=".55" stop-color="${b}"/><stop offset="1" stop-color="${c}"/>
    </linearGradient>
    <radialGradient id="vig" cx=".5" cy=".5" r=".75">
      <stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".28"/>
    </radialGradient>
    <filter id="soft"><feGaussianBlur stdDeviation="2"/></filter>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  ${cfg.deco()}
  <circle cx="${W / 2}" cy="${H / 2}" r="230" fill="#ffffff" opacity=".14"/>
  <circle cx="${W / 2}" cy="${H / 2}" r="230" fill="none" stroke="#ffffff" stroke-width="2" opacity=".5"/>
  <g transform="translate(${W / 2 - size / 2} ${H / 2 - size / 2}) scale(${scale})" fill="none" stroke="#000" stroke-opacity=".18" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" filter="url(#soft)">${iconPaths[cfg.icon]}</g>
  <g transform="translate(${W / 2 - size / 2} ${H / 2 - size / 2 - 4}) scale(${scale})" fill="none" stroke="${cfg.stroke ?? "#ffffff"}" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round">${iconPaths[cfg.icon]}</g>
  <rect width="${W}" height="${H}" fill="url(#vig)"/>
</svg>`;
}

await mkdir(path.join(root, "images", "platzhalter"), { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROME ?? "/usr/bin/google-chrome-stable" });
const page = await browser.newPage({ viewport: { width: W, height: H } });
for (const [name, cfg] of Object.entries(images)) {
  const svg = svgFor(name, cfg);
  await writeFile(path.join(root, "images", "platzhalter", `${name}.svg`), svg);
  await page.setContent(`<html><body style="margin:0">${svg}</body></html>`);
  await page.screenshot({ path: path.join(root, "images", `${name}.jpg`), type: "jpeg", quality: 82 });
  console.log("✓", name);
}
await browser.close();
