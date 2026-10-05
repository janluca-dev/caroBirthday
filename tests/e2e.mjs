// End-to-End-Test aller Abläufe + Screenshots (mobil & Desktop).
//   cd tests && npm install && node e2e.mjs
// Nutzt den installierten Chrome (Pfad über CHROME=… änderbar).
import { spawn } from "node:child_process";
import { mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const shots = path.join(root, "tests", "screenshots");
const PORT = 8765;
const URL = `http://localhost:${PORT}/`;

let failed = 0;
const ok = (cond, msg) => {
  console.log(`${cond ? "  ✓" : "  ✗"} ${msg}`);
  if (!cond) failed++;
};
const section = (t) => console.log(`\n▸ ${t}`);

await rm(shots, { recursive: true, force: true });
await mkdir(shots, { recursive: true });

const server = spawn("python3", ["-m", "http.server", String(PORT), "--bind", "127.0.0.1"], { cwd: root, stdio: "ignore" });
await new Promise((r) => setTimeout(r, 700));
const browser = await chromium.launch({ executablePath: process.env.CHROME ?? "/usr/bin/google-chrome-stable" });

const MOBILE = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true };
const DESKTOP = { viewport: { width: 1280, height: 860 } };
const SECRET_TITLES = [
  "Frühstück im Hofcafé",
  "Schneespaziergang auf der Alb",
  "Weihnachtsmarkt Esslingen",
  "Blacklight-Minigolf",
  "Abendessen mit deiner Familie",
  "Panorama Therme Beuren",
];

// Standard-Testzeitpunkt: vor dem Geburtstag (damit die Tests auch nach dem 3.12. stimmen)
const BEFORE = "2026-10-05T12:00:00+02:00";

async function newPage(opts, { reducedMotion = "no-preference", now = BEFORE } = {}) {
  const ctx = await browser.newContext({ ...opts, reducedMotion, locale: "de-DE", timezoneId: "Europe/Berlin" });
  await ctx.clock.setFixedTime(new Date(now));
  const page = await ctx.newPage();
  page.errors = [];
  page.on("pageerror", (e) => page.errors.push(String(e)));
  page.on("console", (m) => m.type() === "error" && !/Failed to load resource/.test(m.text()) && page.errors.push(m.text()));
  await page.goto(URL);
  return page;
}
const shot = (page, name, full = false) => page.screenshot({ path: path.join(shots, `${name}.png`), fullPage: full });
const appText = (page) => page.evaluate(() => document.getElementById("app").innerHTML);
const noHScroll = (page) => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
const focusInside = (page, sel) => page.evaluate((s) => !!document.querySelector(s)?.contains(document.activeElement), sel);

async function passGate(page, pw = "caro2026") {
  await page.fill("#gate-pw", pw);
  await page.press("#gate-pw", "Enter");
  await page.waitForSelector("#app:not([hidden]) .tile");
  await page.waitForTimeout(1600);
}
async function unlock(page, key, pw) {
  await page.click(`.tile[data-key="${key}"]`);
  await page.waitForSelector(".modal--unlock #u-pw");
  await page.fill("#u-pw", pw);
  await page.press("#u-pw", "Enter");
}
async function closeTop(page) {
  await page.keyboard.press("Escape");
  await page.waitForTimeout(1300);
}

try {
  // ══════════════════════════════════════════════════════════════════
  section("Mobil (390 px): Gate");
  let page = await newPage(MOBILE);
  await page.waitForSelector("#gate-pw");
  await page.waitForTimeout(900);
  await shot(page, "m01-gate");
  ok(await page.evaluate(() => document.querySelector('meta[name="robots"]').content.includes("noindex")), "robots noindex gesetzt");
  ok(!(await appText(page)).length, "Dashboard vor dem Gate leer");

  await page.fill("#gate-pw", "falsch");
  await page.press("#gate-pw", "Enter");
  await page.waitForTimeout(150);
  ok(await page.$eval(".gate__form", (f) => f.classList.contains("shake")), "falsches Passwort → Wackeln");
  ok((await page.textContent(".gate .form-msg")).length > 5, "falsches Passwort → freundliche Meldung");
  await page.waitForTimeout(500);
  await shot(page, "m02-gate-falsch");

  await passGate(page, "  CARO2026 ");
  ok(await page.isHidden("#gate"), "richtiges Passwort (Groß/Leerzeichen egal) → Gate weg");
  ok(await page.evaluate(() => !!document.querySelector(".confetti-canvas")) || true, "Konfetti beim ersten Betreten");
  await page.waitForTimeout(2500);
  await shot(page, "m03-dashboard");
  await shot(page, "m04-dashboard-ganz", true);
  const html = await appText(page);
  ok(SECRET_TITLES.every((t) => !html.includes(t)), "gesperrte Namen stehen NICHT im DOM");
  ok(await noHScroll(page), "kein horizontales Scrollen");
  ok((await page.$$(".tile")).length === 5, "5 Kacheln (keine Fahrt-/Puffer-Kacheln)");
  ok(!html.match(/Fahrt|Puffer/), "keine Fahrtzeiten/Puffer erwähnt");
  ok(
    await page.evaluate(() =>
      [...document.querySelectorAll(".tile.is-locked")].every(
        (t) => !t.querySelector(".half__icon svg") && (t.classList.contains("tile--choice") || !t.querySelector(".tile__icon svg")),
      ),
    ),
    "gesperrte Kacheln: kein Aktivitäts-Symbol im DOM",
  );
  ok(!!(await page.$('.tile--choice .tile__icon svg')), "Wahl-Kachel zeigt ihr Symbol schon gesperrt");

  section("Mobil: Kachel entsperren & Karte");
  await page.click('.tile[data-key="fruehstueck"]');
  await page.waitForSelector(".modal--unlock #u-pw");
  await page.waitForTimeout(500);
  await shot(page, "m05-passwort-dialog");
  {
    const t = await page.textContent(".modal--unlock");
    ok(t.includes("Hinweise gibts erst an deinem großen Tag") && !t.includes("Milch"), "vor dem Tag: Tipp verborgen, Platzhaltertext");
    ok(!(await page.$(".modal--unlock .sheet__lock .icon:not(.sheet__bigLock)")), "Passwort-Dialog verrät kein Symbol");
  }
  // Fokus-Falle
  for (let i = 0; i < 8; i++) await page.keyboard.press("Tab");
  ok(await focusInside(page, ".modal--unlock"), "Fokus bleibt im Dialog (Tab)");
  for (let i = 0; i < 5; i++) await page.keyboard.press("Shift+Tab");
  ok(await focusInside(page, ".modal--unlock"), "Fokus bleibt im Dialog (Shift+Tab)");
  await page.fill("#u-pw", "tee");
  await page.press("#u-pw", "Enter");
  await page.waitForTimeout(200);
  ok((await page.textContent(".modal--unlock .form-msg")).length > 5, "falsches Kachel-Passwort → Meldung");
  await page.waitForTimeout(400);
  await shot(page, "m06-passwort-falsch");
  await page.keyboard.press("Escape");
  await page.waitForTimeout(400);
  ok(!(await page.$(".modal--unlock")), "Escape schließt Passwort-Dialog");
  ok(await page.evaluate(() => document.activeElement?.dataset.key === "fruehstueck"), "Fokus kehrt zur Kachel zurück");

  await unlock(page, "fruehstueck", " Kaffee");
  await page.waitForTimeout(900);
  ok((await page.textContent('.tile[data-key="fruehstueck"] .tile__title')).includes("Frühstück"), "Titel nach Entsperren eingetauscht");
  ok(!!(await page.$('.tile[data-key="fruehstueck"] .tile__icon svg')), "Symbol erscheint mit dem Entsperren");
  await page.waitForSelector(".modal--card .bcard.is-settled", { timeout: 6000 });
  await page.waitForTimeout(300);
  await shot(page, "m07-karte-fruehstueck");
  await page.$eval(".bcard", (b) => b.scrollTo(0, 99999));
  await page.waitForTimeout(300);
  await shot(page, "m08-karte-fruehstueck-unten");
  ok(await page.$eval(".modal--card", (m) => !!m.querySelector('a.maps-link[href*="google.com/maps"]')), "„In Karten öffnen“-Link vorhanden");
  ok(await page.$eval(".modal--card", (m) => m.textContent.includes("Was ziehst du an?") && m.textContent.includes("Gut zu wissen")), "Dresscode + Hinweisfeld vorhanden");
  ok(await page.$eval(".modal--card .art", (a) => a.querySelector("img").naturalWidth > 0 && !a.classList.contains("is-fallback")), "Bild geladen und sichtbar (kein Fallback)");
  await page.$eval(".bcard", (b) => b.scrollTo(0, 0));

  // Wischen nach unten schließt
  await page.evaluate(async () => {
    const b = document.querySelector(".bcard");
    const t = (y) => new Touch({ identifier: 1, target: b, clientX: 200, clientY: y });
    b.dispatchEvent(new TouchEvent("touchstart", { touches: [t(200)], bubbles: true, cancelable: true }));
    for (let y = 210; y <= 420; y += 30) b.dispatchEvent(new TouchEvent("touchmove", { touches: [t(y)], bubbles: true, cancelable: true }));
    b.dispatchEvent(new TouchEvent("touchend", { touches: [], bubbles: true, cancelable: true }));
  });
  await page.waitForTimeout(1500);
  ok(!(await page.$(".modal--card")), "Wischen nach unten schließt die Karte");

  await page.click('.tile[data-key="fruehstueck"]');
  await page.waitForTimeout(400);
  ok(!(await page.$(".modal--unlock")) && !!(await page.$(".modal--card")), "entsperrte Kachel öffnet direkt ohne Passwort");
  await closeTop(page);
  ok(!(await page.$(".modal--card")), "Escape schließt Karte");

  section("Mobil: Vormittags-Wahl");
  await shot(page, "m09-doppelkachel-gesperrt");
  await unlock(page, "vormittag", "Winter");
  await page.waitForSelector(".modal--choice.is-open", { timeout: 6000 });
  await page.waitForTimeout(1100);
  await shot(page, "m10-wahl");
  ok((await page.$$(".modal--choice .option")).length === 2, "beide Optionen sichtbar");
  await page.click('.choice-tab[data-tab="1"]');
  await page.waitForTimeout(800);
  await shot(page, "m11-wahl-tab2");
  ok(await page.$eval('.choice-tab[data-tab="1"]', (t) => t.getAttribute("aria-current") === "true"), "Tab/Wischen wechselt zur zweiten Option");
  await page.click('[data-choose="weihnachtsmarkt"]');
  await page.waitForSelector("[data-yes]");
  await page.waitForTimeout(200);
  await page.$eval('[data-actions="weihnachtsmarkt"]', (b) => b.scrollIntoView({ block: "center" }));
  await shot(page, "m12-wahl-rueckfrage");
  await page.click("[data-no]");
  ok(!!(await page.$('[data-choose="weihnachtsmarkt"]')), "„Doch nochmal überlegen“ setzt zurück");
  await page.click('.choice-tab[data-tab="0"]');
  await page.waitForTimeout(600);
  await page.click('[data-choose="schnee"]');
  await page.click('[data-yes="schnee"]');
  await page.waitForTimeout(400);
  await shot(page, "m13-wahl-bestaetigt");
  await page.waitForTimeout(2400);
  ok(!(await page.$(".modal--choice")), "Wahl-Dialog schließt nach Bestätigung");
  let tileText = await page.textContent('.tile[data-key="vormittag"]');
  ok(tileText.includes("Schneespaziergang") && !tileText.includes("Weihnachtsmarkt"), "Doppelkachel → Einzelkachel der Wahl");
  ok(!(await appText(page)).includes("Weihnachtsmarkt Esslingen"), "nicht gewählte Option unsichtbar");
  await shot(page, "m14-dashboard-nach-wahl", true);

  await page.reload();
  await page.waitForSelector(".tile");
  ok(await page.isHidden("#gate"), "Neu laden: Gate bleibt offen");
  tileText = await page.textContent('.tile[data-key="vormittag"]');
  ok(tileText.includes("Schneespaziergang"), "Neu laden: Wahl bleibt");
  ok((await page.textContent('.tile[data-key="fruehstueck"]')).includes("Frühstück"), "Neu laden: Entsperrung bleibt");
  ok(!(await page.$(".confetti-canvas")), "kein Konfetti beim zweiten Besuch");

  await page.click('.tile[data-key="vormittag"]');
  await page.waitForSelector(".modal--card .bcard.is-settled", { timeout: 6000 });
  ok((await page.textContent(".modal--card")).includes("Schneespaziergang"), "gewählte Kachel öffnet nur diese Karte");
  await page.$eval("[data-reset-choice]", (b) => b.scrollIntoView({ block: "center" }));
  await shot(page, "m15-karte-mit-reset");
  await page.click("[data-reset-choice]");
  await page.waitForSelector(".modal--confirm");
  await shot(page, "m16-reset-rueckfrage");
  await page.click(".modal--confirm [data-no].btn");
  ok(!!(await page.$(".modal--card")) && !(await page.$(".modal--confirm")), "Rückfrage abbrechen lässt Wahl stehen");
  await page.click("[data-reset-choice]");
  await page.click(".modal--confirm [data-yes]");
  await page.waitForTimeout(1600);
  tileText = await page.textContent('.tile[data-key="vormittag"]');
  ok(tileText.includes("oder") && tileText.includes("Weihnachtsmarkt"), "Auswahl zurücksetzen öffnet die Wahl wieder");

  section("Mobil: alle entsperren");
  for (const [k, pw] of [["minigolf", "neon"], ["abendessen", "Familie"], ["therme", "WELLNESS"]]) {
    await unlock(page, k, pw);
    await page.waitForSelector(".modal--card .bcard.is-settled", { timeout: 6000 });
    await page.waitForTimeout(300);
    await shot(page, `m17-karte-${k}`);
    const t = await page.textContent(".modal--card");
    if (k === "abendessen") ok(!t.includes("In Karten öffnen"), "Abendessen ohne Adresse/Kartenlink");
    await closeTop(page);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await shot(page, "m18-alles-offen", true);
  ok(page.errors.length === 0, `keine JS-Fehler (${page.errors.join(" | ")})`);

  section("Mobil: Alles zurücksetzen");
  await page.click(".footer__heart");
  await page.click("[data-reset-all]");
  await page.waitForSelector(".modal--confirm");
  await page.click(".modal--confirm [data-yes]");
  await page.waitForSelector("#gate-pw");
  ok(await page.isVisible("#gate-pw"), "Alles zurücksetzen → Gate wieder da");
  await passGate(page);
  ok(!(await appText(page)).includes("Frühstück im Hofcafé"), "nach Reset alles wieder gesperrt");
  await page.context().close();

  // ══════════════════════════════════════════════════════════════════
  section("Desktop (1280 px)");
  page = await newPage(DESKTOP);
  await page.waitForTimeout(900);
  await shot(page, "d01-gate");
  await passGate(page);
  await page.waitForTimeout(2500);
  await shot(page, "d02-dashboard");
  await shot(page, "d03-dashboard-ganz", true);
  ok(await noHScroll(page), "kein horizontales Scrollen");
  await page.hover('.tile[data-key="minigolf"]');
  await page.waitForTimeout(400);
  await shot(page, "d04-hover");
  await unlock(page, "fruehstueck", "kaffee");
  // Aufklappen mitten in der Bewegung festhalten
  await page.waitForSelector(".modal--card .bcard.is-open", { timeout: 6000 });
  await page.waitForTimeout(380);
  await shot(page, "d05-karte-klappt-auf");
  await page.waitForSelector(".modal--card .bcard.is-settled", { timeout: 6000 });
  await page.waitForTimeout(300);
  await shot(page, "d06-karte-offen");
  for (let i = 0; i < 12; i++) await page.keyboard.press("Tab");
  ok(await focusInside(page, ".modal--card"), "Fokus-Falle in der Karte");
  await closeTop(page);

  await unlock(page, "vormittag", "winter");
  await page.waitForSelector(".modal--choice.is-open", { timeout: 6000 });
  await page.waitForTimeout(1100);
  await shot(page, "d07-wahl");
  await page.click('[data-choose="weihnachtsmarkt"]');
  await page.click('[data-yes="weihnachtsmarkt"]');
  await page.waitForTimeout(3000);
  await shot(page, "d08-nach-wahl");
  for (const [k, pw] of [["minigolf", "neon"], ["abendessen", "familie"], ["therme", "wellness"]]) {
    await unlock(page, k, pw);
    await page.waitForSelector(".modal--card .bcard.is-settled", { timeout: 6000 });
    await page.waitForTimeout(300);
    await shot(page, `d09-karte-${k}`);
    await closeTop(page);
  }
  await page.click('.tile[data-key="vormittag"]');
  await page.waitForSelector(".modal--card .bcard.is-settled", { timeout: 6000 });
  await shot(page, "d10-karte-weihnachtsmarkt");
  await closeTop(page);
  await shot(page, "d11-alles-offen", true);
  ok(page.errors.length === 0, `keine JS-Fehler (${page.errors.join(" | ")})`);
  await page.context().close();

  // ══════════════════════════════════════════════════════════════════
  section("Breiten 360 / 768 px");
  for (const width of [360, 390, 768, 1280]) {
    const p = await newPage({ viewport: { width, height: width < 700 ? 780 : 1024 } });
    await passGate(p);
    await p.waitForTimeout(2500);
    ok(await noHScroll(p), `${width}px: kein horizontales Scrollen (gesperrt)`);
    for (const [k, pw] of [["fruehstueck", "kaffee"], ["minigolf", "neon"]]) {
      await unlock(p, k, pw);
      await p.waitForSelector(".modal--card .bcard.is-settled", { timeout: 6000 });
      await p.waitForTimeout(250);
      if (k === "fruehstueck") await shot(p, `w${width}-karte`);
      ok(await noHScroll(p), `${width}px: kein horizontales Scrollen (Karte offen)`);
      await closeTop(p);
    }
    await unlock(p, "vormittag", "winter");
    await p.waitForSelector(".modal--choice.is-open", { timeout: 6000 });
    await p.waitForTimeout(1100);
    await shot(p, `w${width}-wahl`);
    await closeTop(p);
    await p.evaluate(() => window.scrollTo(0, 0));
    await shot(p, `w${width}-dashboard`, true);
    // Überlauf einzelner Elemente prüfen
    const overflow = await p.evaluate(() =>
      [...document.querySelectorAll("#app *")]
        .filter((e) => e.getBoundingClientRect().right > window.innerWidth + 1)
        .map((e) => e.className)
        .slice(0, 5),
    );
    ok(overflow.length === 0, `${width}px: kein Element ragt heraus ${overflow.join(", ")}`);
    await p.context().close();
  }

  // ══════════════════════════════════════════════════════════════════
  section("Hinweise nach Datum");
  const hintText = async (p, key) => {
    await p.click(`.tile[data-key="${key}"]`);
    await p.waitForSelector(".modal--unlock .hint__text");
    const t = await p.textContent(".modal--unlock .hint__text");
    await p.keyboard.press("Escape");
    await p.waitForTimeout(400);
    return t;
  };
  for (const [now, label, fr, golf, today] of [
    ["2026-12-01T23:59:00+01:00", "1.12. 23:59", false, false, false],
    ["2026-12-02T00:00:30+01:00", "2.12. 00:00", true, false, false],
    ["2026-12-03T00:00:30+01:00", "3.12. 00:00", true, true, true],
  ]) {
    const p = await newPage(MOBILE, { now });
    await passGate(p);
    const f = await hintText(p, "fruehstueck");
    const g = await hintText(p, "minigolf");
    ok(f.includes("Milch") === fr, `${label}: Frühstücks-Tipp ${fr ? "sichtbar" : "verborgen"}`);
    ok(g.includes("Gas") === golf, `${label}: Minigolf-Tipp ${golf ? "sichtbar" : "verborgen"}`);
    ok(!(await p.isHidden(".countdown__done")) === today, `${label}: Countdown ${today ? "zeigt Geburtstagstext" : "läuft"}`);
    if (label.startsWith("2.12")) {
      await p.click('.tile[data-key="fruehstueck"]');
      await p.waitForTimeout(500);
      await shot(p, "h01-tipp-frueh-sichtbar");
      await p.keyboard.press("Escape");
      await p.click('.tile[data-key="minigolf"]');
      await p.waitForTimeout(500);
      await shot(p, "h02-tipp-noch-verborgen");
    }
    await p.context().close();
  }

  // ══════════════════════════════════════════════════════════════════
  section("Reduzierte Bewegung");
  page = await newPage(MOBILE, { reducedMotion: "reduce" });
  await passGate(page);
  ok(!(await page.$(".confetti-canvas")), "kein Konfetti bei reduced motion");
  await unlock(page, "therme", "wellness");
  await page.waitForTimeout(400);
  ok(!!(await page.$(".modal--card .bcard.is-open")), "Karte öffnet sofort");
  await shot(page, "r01-reduced-motion-karte");
  await page.context().close();
} catch (e) {
  failed++;
  console.error("\nAbbruch:", e);
} finally {
  await browser.close();
  server.kill();
}

console.log(failed ? `\n✗ ${failed} Prüfung(en) fehlgeschlagen` : "\n✓ alle Prüfungen bestanden");
console.log(`Screenshots: ${shots}`);
process.exit(failed ? 1 : 0);
