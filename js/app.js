import data from "../data.js";
import { checkPassword } from "./hash.js";
import { icon } from "./icons.js";
import { createStore } from "./store.js";
import { startSparkles, confetti, reducedMotion } from "./effects.js";
import { openModal, closeModal } from "./modal.js";

const { settings, gate: gateText, dashboard: dash, ui } = data;
const store = createStore(settings.storageKey);

const $ = (sel, root = document) => root.querySelector(sel);
const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const wait = (ms) => new Promise((r) => setTimeout(r, reducedMotion() ? 0 : ms));
const isSmall = () => window.matchMedia("(max-width: 759px)").matches;
const paragraphs = (text) =>
  String(text ?? "")
    .split(/\n\s*\n/)
    .filter(Boolean)
    .map((p) => `<p>${esc(p)}</p>`)
    .join("");

function announce(msg) {
  const a = $("#announcer");
  a.textContent = "";
  setTimeout(() => (a.textContent = msg), 60);
}

function el(html) {
  const t = document.createElement("template");
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

/** Spielt eine CSS-Animation (Klasse) neu ab. */
function replay(node, cls) {
  node.classList.remove(cls);
  void node.offsetWidth;
  node.classList.add(cls);
}

// Platzhalter für gesperrte Namen – stehen statt des echten Titels im DOM.
const LOCKED_TEXT = [
  "Nicht schummeln, Caro",
  "Hier steht noch nichts",
  "Gut versteckt",
  "Bald verrate ich's dir",
  "Neugierig, hm?",
  "Geduld, Geburtstagskind",
];

// ── Zeiten ───────────────────────────────────────────────────────────
function timeRange(a) {
  const sp = a.startPrefix ? `${a.startPrefix} ` : "";
  if (!a.end) return `${sp}${a.start} ${ui.clock}`;
  const ep = a.endPrefix ? `${a.endPrefix} ` : "";
  if (sp || ep) return `${sp}${a.start} bis ${ep}${a.end} ${ui.clock}`;
  return `${a.start} – ${a.end} ${ui.clock}`;
}
const startLabel = (a) => `${a.startPrefix ? `${a.startPrefix} ` : ""}${a.start} ${ui.clock}`;

// ── Programm-Einträge (berücksichtigt die Vormittags-Wahl) ───────────
function entries() {
  return data.activities.map((act) => {
    if (act.type !== "choice") return { kind: "single", key: act.id, act };
    const chosen = act.options.find((o) => o.id === store.get().choice);
    if (chosen) {
      return {
        kind: "chosen",
        key: act.id,
        parent: act,
        act: { ...chosen, start: act.start, end: act.end, startPrefix: act.startPrefix, endPrefix: act.endPrefix },
      };
    }
    return { kind: "choice", key: act.id, act };
  });
}

// ════════════════════════════════════════════════════════════════════
//  Gate
// ════════════════════════════════════════════════════════════════════
const gateEl = $("#gate");
const appEl = $("#app");

function renderGate() {
  gateEl.innerHTML = `
    <div class="gate__inner">
      <div class="gate__lock" aria-hidden="true">${icon("lock")}</div>
      <h1 class="gate__title">${esc(gateText.title)} <span class="script">${esc(gateText.subtitle)}</span></h1>
      <p class="gate__prompt">${esc(gateText.prompt)}</p>
      <form class="gate__form" novalidate>
        <label class="gate__label" for="gate-pw">${esc(gateText.label)}</label>
        <div class="field">
          <input id="gate-pw" class="input" type="password" name="password" autocomplete="off"
                 autocapitalize="none" spellcheck="false" enterkeyhint="go" required />
          <button class="btn btn--gold" type="submit">${esc(gateText.button)}</button>
        </div>
        <p class="form-msg" role="status" aria-live="polite"></p>
      </form>
    </div>`;
  let tries = 0;
  const form = $("form", gateEl);
  const input = $("input", form);
  const msg = $(".form-msg", form);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!input.value.trim()) {
      input.focus();
      return;
    }
    if (await checkPassword(input.value, gateText.passwordHash)) {
      msg.textContent = "";
      store.set({ gate: true });
      gateEl.classList.add("is-opening");
      await wait(650);
      gateEl.classList.add("is-leaving");
      showDashboard();
      await wait(700);
      gateEl.hidden = true;
      gateEl.innerHTML = "";
    } else {
      const lines = gateText.wrong ?? [];
      const line = lines[tries % Math.max(1, lines.length)] ?? "";
      tries++;
      msg.innerHTML =
        esc(line) + (gateText.hint ? `<span class="form-msg__hint">${esc(ui.hintLabel)}: ${esc(gateText.hint)}</span>` : "");
      replay(form, "shake");
      input.select();
    }
  });
  gateEl.hidden = false;
  requestAnimationFrame(() => input.focus({ preventScroll: true }));
}

// ════════════════════════════════════════════════════════════════════
//  Dashboard
// ════════════════════════════════════════════════════════════════════
function greetingHTML() {
  const g = esc(dash.greeting);
  const name = esc(settings.name);
  if (name && g.endsWith(name)) return `${g.slice(0, -name.length)}<span class="script hero__name">${name}</span>`;
  return g;
}

function renderDashboard() {
  appEl.innerHTML = `
    <header class="hero">
      <p class="hero__kicker">${esc(dash.kicker)}</p>
      <h1 class="hero__title">${greetingHTML()}</h1>
      <p class="hero__intro">${esc(dash.intro)}</p>
      <section class="countdown" aria-labelledby="cd-label">
        <h2 class="countdown__label" id="cd-label">${esc(dash.countdownLabel)}</h2>
        <div class="countdown__grid" role="timer">
          ${[["d", "Tage"], ["h", "Stunden"], ["m", "Minuten"], ["s", "Sekunden"]]
            .map(([k, u]) => `<div class="cd"><span class="cd__num" data-cd="${k}">–</span><span class="cd__unit">${u}</span></div>`)
            .join("")}
        </div>
        <p class="countdown__done" hidden></p>
      </section>
    </header>

    <main class="program" aria-labelledby="program-title">
      <div class="program__head">
        <h2 class="program__title" id="program-title">${esc(dash.programTitle)}</h2>
        <p class="program__hint">${esc(dash.lockedHint)}</p>
      </div>
      <ol class="timeline"></ol>
    </main>

    <footer class="footer">
      <p class="footer__text">
        <span>${esc(dash.footer)}</span>
        <button type="button" class="footer__heart" aria-label="${esc(ui.toolsLabel)}" aria-expanded="false" aria-controls="footer-tools">${icon("heart")}</button>
      </p>
      <div class="footer__tools" id="footer-tools" hidden>
        <button type="button" class="link-btn" data-reset-all>${icon("undo")} ${esc(ui.resetAll)}</button>
      </div>
    </footer>`;

  renderProgram();
  startCountdown();

  $(".timeline", appEl).addEventListener("click", (e) => {
    const tile = e.target.closest("[data-key]");
    if (tile) onTile(tile.dataset.key);
  });

  const heart = $(".footer__heart", appEl);
  heart.addEventListener("click", () => {
    const tools = $("#footer-tools");
    tools.hidden = !tools.hidden;
    heart.setAttribute("aria-expanded", String(!tools.hidden));
  });
  $("[data-reset-all]", appEl).addEventListener("click", async () => {
    if (await confirmDialog(ui.resetAllQuestion, ui.resetAll)) {
      store.reset();
      window.scrollTo(0, 0);
      window.location.reload();
    }
  });
}

function showDashboard() {
  renderDashboard();
  appEl.hidden = false;
  replay(appEl, "is-entering");
  if (!store.get().welcomed) {
    store.set({ welcomed: true });
    setTimeout(() => confetti({ count: 170 }), reducedMotion() ? 0 : 450);
  }
}

// ── Countdown ───────────────────────────────────────────────────────
let cdTimer;
function startCountdown() {
  clearInterval(cdTimer);
  const target = new Date(settings.birthday).getTime();
  const pad = (n) => String(n).padStart(2, "0");
  const tick = () => {
    const now = Date.now();
    const diff = target - now;
    const grid = $(".countdown__grid", appEl);
    const done = $(".countdown__done", appEl);
    if (!grid) return clearInterval(cdTimer);
    if (diff <= 0) {
      grid.hidden = true;
      done.hidden = false;
      done.textContent = now - target < 24 * 3600e3 ? dash.countdownToday : dash.countdownPast;
      return;
    }
    const s = Math.floor(diff / 1000);
    const vals = { d: Math.floor(s / 86400), h: pad(Math.floor(s / 3600) % 24), m: pad(Math.floor(s / 60) % 60), s: pad(s % 60) };
    for (const [k, v] of Object.entries(vals)) {
      const n = grid.querySelector(`[data-cd="${k}"]`);
      if (n.textContent !== String(v)) n.textContent = v;
    }
  };
  tick();
  cdTimer = setInterval(tick, 1000);
}

// ── Kacheln ─────────────────────────────────────────────────────────
function lockedTitle(i) {
  return `<span class="locked-text" aria-hidden="true">${esc(LOCKED_TEXT[i % LOCKED_TEXT.length])}</span><span class="sr-only">${esc(ui.lockedName)}</span>`;
}

function tileHTML(entry, i) {
  const unlocked = store.isUnlocked(entry.key);
  const a = entry.act;
  const time = settings.showTimeOnDashboard ? `<span class="tile__time">${esc(startLabel(entry.parent ?? a))}</span>` : "";
  const seal = `<span class="tile__seal" aria-hidden="true">${icon("lock")}</span>`;

  if (entry.kind === "choice") {
    const half = (o, j) => `
      <span class="half" data-accent="${esc(o.accent)}">
        <span class="half__icon">${icon(o.icon)}</span>
        <span class="half__title">${unlocked ? esc(o.title) : lockedTitle(i + j + 2)}</span>
      </span>`;
    return `
      <button type="button" class="tile tile--choice ${unlocked ? "is-unlocked" : "is-locked"}" data-key="${esc(entry.key)}" data-accent="choice">
        <span class="tile__top">
          <span class="tile__icon">${icon("choice")}</span>
          ${time}
          <span class="tile__badge">${esc(ui.choiceTile)}</span>
        </span>
        <span class="halves">
          ${half(a.options[0], 0)}
          <span class="halves__or">${unlocked ? "oder" : `<span class="sr-only">oder</span>${icon("lock")}`}</span>
          ${half(a.options[1], 1)}
        </span>
        <span class="tile__foot">${unlocked ? `${esc(ui.choiceTitle)} <span class="arrow" aria-hidden="true">→</span>` : `${icon("lock")} Verschlossen`}</span>
        ${seal}
      </button>`;
  }

  return `
    <button type="button" class="tile ${unlocked ? "is-unlocked" : "is-locked"} ${entry.kind === "chosen" ? "tile--chosen" : ""}"
            data-key="${esc(entry.key)}" data-accent="${esc(a.accent)}">
      <span class="tile__top">
        <span class="tile__icon">${icon(a.icon)}</span>
        ${time}
      </span>
      <span class="tile__title">${unlocked ? esc(a.title) : lockedTitle(i)}</span>
      ${unlocked && a.tagline ? `<span class="tile__tagline">${esc(a.tagline)}</span>` : ""}
      <span class="tile__foot">${unlocked ? `Karte öffnen <span class="arrow" aria-hidden="true">→</span>` : `${icon("lock")} Verschlossen`}</span>
      ${seal}
    </button>`;
}

function renderProgram() {
  const list = $(".timeline", appEl);
  list.innerHTML = entries()
    .map(
      (e, i) => `
      <li class="slot ${e.kind === "choice" ? "slot--wide" : ""}" style="--i:${i}">
        <span class="slot__dot" aria-hidden="true"></span>
        ${tileHTML(e, i)}
      </li>`,
    )
    .join("");
}

const tileFor = (key) => appEl.querySelector(`.tile[data-key="${CSS.escape(key)}"]`);

async function onTile(key) {
  const entry = entries().find((e) => e.key === key);
  if (!entry) return;
  const tile = tileFor(key);
  if (!store.isUnlocked(key)) {
    const ok = await unlockDialog(entry, tile);
    if (!ok) return;
    renderProgram();
    const fresh = tileFor(key);
    fresh.classList.add("just-unlocked");
    fresh.focus({ preventScroll: true });
    announce(`Entsperrt: ${entry.kind === "choice" ? entry.act.options.map((o) => o.title).join(" oder ") : entry.act.title}`);
    await wait(1100);
    fresh.classList.remove("just-unlocked");
    return onTile(key);
  }
  if (entry.kind === "choice") return openChoice(entry, tile);
  return openCard(entry, tile);
}

// ════════════════════════════════════════════════════════════════════
//  Passwort-Dialog für eine Kachel
// ════════════════════════════════════════════════════════════════════
function unlockDialog(entry, tile) {
  return new Promise((resolve) => {
    const a = entry.act;
    const accent = entry.kind === "choice" ? "choice" : a.accent;
    const m = el(`
      <div class="modal modal--unlock" role="dialog" aria-modal="true" aria-labelledby="u-title" aria-describedby="u-time">
        <div class="modal__backdrop" data-close></div>
        <div class="sheet" data-accent="${esc(accent)}">
          <button type="button" class="icon-btn sheet__close" data-close aria-label="${esc(ui.close)}">${icon("close")}</button>
          <div class="sheet__lock" aria-hidden="true">${icon(entry.kind === "choice" ? "choice" : a.icon)}<span class="sheet__lockbadge">${icon("lock")}</span></div>
          <h2 class="sheet__title" id="u-title">${esc(ui.unlockTitle)}</h2>
          <p class="sheet__time" id="u-time">${esc(timeRange(a))}</p>
          ${
            a.hint
              ? `<div class="hint"><p class="hint__label">${icon("spark")} ${esc(ui.hintLabel)}</p><p class="hint__text">${esc(a.hint)}</p></div>`
              : ""
          }
          <form class="sheet__form" novalidate>
            <label class="sheet__label" for="u-pw">${esc(ui.unlockLabel)}</label>
            <input id="u-pw" class="input input--light" type="text" autocomplete="off" autocapitalize="none"
                   autocorrect="off" spellcheck="false" enterkeyhint="go" />
            <p class="form-msg form-msg--dark" role="status" aria-live="polite"></p>
            <button type="submit" class="btn btn--accent">${icon("lock")} ${esc(ui.unlockButton)}</button>
          </form>
        </div>
      </div>`);
    const input = $("input", m);
    const form = $("form", m);
    const sheet = $(".sheet", m);
    let done = false;

    const finish = async (ok) => {
      if (done) return;
      done = true;
      m.classList.add("is-closing");
      await wait(ok ? 220 : 180);
      closeModal(m, { focus: tile });
      resolve(ok);
    };

    m.addEventListener("click", (e) => {
      if (e.target.closest("[data-close]")) finish(false);
    });
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!input.value.trim()) return input.focus();
      if (await checkPassword(input.value, a.passwordHash)) {
        store.unlock(entry.key);
        sheet.classList.add("is-unlocked");
        $(".form-msg", m).textContent = "";
        await wait(650);
        finish(true);
      } else {
        $(".form-msg", m).textContent = ui.wrong;
        replay(sheet, "shake");
        input.select();
      }
    });

    openModal(m, { onRequestClose: () => finish(false), initialFocus: input, returnFocus: tile });
    replay(m, "is-opening");
  });
}

// ════════════════════════════════════════════════════════════════════
//  Inhalt einer Karte
// ════════════════════════════════════════════════════════════════════
function imageHTML(a) {
  return `
    <figure class="art" data-accent="${esc(a.accent)}">
      <img src="${esc(a.image)}" alt="${esc(a.imageAlt ?? "")}" width="1200" height="800" decoding="async" />
      <span class="art__fallback" aria-hidden="true">${icon(a.icon)}</span>
    </figure>`;
}

function wireImages(root) {
  root.querySelectorAll(".art img").forEach((img) => {
    const fail = () => img.closest(".art").classList.add("is-fallback");
    img.addEventListener("error", fail, { once: true });
    // erst prüfen, wenn das Bild im Dokument hängt (vorher ist „complete“ bedeutungslos)
    if (img.isConnected && img.complete && img.naturalWidth === 0) fail();
  });
}

function placeHTML(a) {
  const p = a.place ?? {};
  const maps = p.mapsQuery || p.address;
  const href = maps ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(maps)}` : "";
  return `
    <div class="fact">
      <span class="fact__icon">${icon("pin")}</span>
      <div>
        <p class="fact__label">${esc(ui.where)}</p>
        <p class="fact__value">${esc(p.name)}${p.address ? `<br /><span class="fact__sub">${esc(p.address)}</span>` : ""}</p>
        ${href && p.address ? `<a class="maps-link" href="${href}" target="_blank" rel="noopener noreferrer">${icon("external")} ${esc(ui.openMaps)}<span class="sr-only"> (neues Fenster)</span></a>` : ""}
      </div>
    </div>`;
}

function detailsHTML(a, { headingLevel = 3 } = {}) {
  const h = `h${headingLevel}`;
  return `
    <div class="facts">
      <div class="fact">
        <span class="fact__icon">${icon("clock")}</span>
        <div><p class="fact__label">${esc(ui.when)}</p><p class="fact__value">${esc(timeRange(a))}</p></div>
      </div>
      ${placeHTML(a)}
    </div>
    <div class="prose">${paragraphs(a.description)}</div>
    <section class="info info--wear">
      <${h} class="info__title">${icon("shirt")} ${esc(ui.wear)}</${h}>
      <p>${esc(a.wear)}</p>
      ${
        a.bring?.length
          ? `<p class="info__sub">${icon("bag")} ${esc(ui.bring)}</p><ul class="checklist">${a.bring.map((b) => `<li>${esc(b)}</li>`).join("")}</ul>`
          : ""
      }
    </section>
    ${a.note ? `<section class="info info--note"><${h} class="info__title">${icon("spark")} ${esc(ui.note)}</${h}><p>${esc(a.note)}</p></section>` : ""}`;
}

// ════════════════════════════════════════════════════════════════════
//  Geburtstagskarte (klappt auf)
// ════════════════════════════════════════════════════════════════════
function growFrom(stageInner, tile, frontWidth, reverse = false) {
  if (reducedMotion() || !tile || !tile.isConnected) return Promise.resolve();
  const t = tile.getBoundingClientRect();
  const s = stageInner.getBoundingClientRect();
  if (!t.width || !s.width) return Promise.resolve();
  const dx = t.left + t.width / 2 - (s.left + s.width / 2);
  const dy = t.top + t.height / 2 - (s.top + s.height / 2);
  const scale = Math.max(0.15, Math.min(1, t.width / frontWidth));
  const from = { transform: `translate(${dx}px, ${dy}px) scale(${scale})`, opacity: 0.2 };
  const to = { transform: "none", opacity: 1 };
  const anim = stageInner.animate(reverse ? [to, from] : [from, to], {
    duration: reverse ? 360 : 480,
    easing: reverse ? "cubic-bezier(.5,0,.75,0)" : "cubic-bezier(.2,.8,.2,1)",
    fill: "both",
  });
  return anim.finished.catch(() => {});
}

function openCard(entry, tile) {
  const a = entry.act;
  const chosen = entry.kind === "chosen";
  const m = el(`
    <div class="modal modal--card" role="dialog" aria-modal="true" aria-labelledby="c-title">
      <div class="modal__backdrop" data-close></div>
      <div class="card-stage">
        <article class="bcard" data-accent="${esc(a.accent)}">
          <div class="bcard__grab" aria-hidden="true"></div>
          <div class="bcard__leaf">
            <div class="leaf__front" aria-hidden="true">
              <div class="front__art">${icon(a.icon)}</div>
              <p class="front__for">Für ${esc(settings.name)}</p>
              <p class="front__time">${esc(timeRange(a))}</p>
            </div>
            <div class="leaf__back">
              ${imageHTML(a)}
              <header class="bcard__head">
                <p class="bcard__kicker">${icon("gift")} ${esc(dash.kicker)}</p>
                <h2 class="bcard__title" id="c-title">${esc(a.title)}</h2>
                ${a.tagline ? `<p class="bcard__tagline">${esc(a.tagline)}</p>` : ""}
              </header>
            </div>
          </div>
          <div class="bcard__details">
            <p class="bcard__salute" aria-hidden="true">${esc(ui.salutation)}</p>
            ${detailsHTML(a)}
            ${
              chosen
                ? `<div class="bcard__reset"><button type="button" class="link-btn link-btn--dark" data-reset-choice>${icon("undo")} ${esc(ui.resetChoice)}</button></div>`
                : ""
            }
            <p class="bcard__sign">Alles Liebe, ${esc(settings.from)}</p>
          </div>
          <button type="button" class="icon-btn bcard__close" data-close aria-label="${esc(ui.close)}">${icon("close")}</button>
        </article>
      </div>
    </div>`);

  const bcard = $(".bcard", m);
  const stage = $(".card-stage", m);
  let closing = false;

  const close = async () => {
    if (closing) return;
    closing = true;
    bcard.classList.remove("is-open", "is-settled");
    m.classList.add("is-closing");
    if (!reducedMotion()) {
      bcard.scrollTop = 0;
      await wait(isSmall() ? 380 : 650);
      const front = isSmall() ? bcard.offsetWidth : bcard.offsetWidth / 2;
      await growFrom(stage, tileFor(entry.key), front, true);
    }
    closeModal(m, { focus: tileFor(entry.key) ?? undefined });
  };

  m.addEventListener("click", (e) => {
    if (e.target.closest("[data-close]")) close();
  });

  if (chosen) {
    $("[data-reset-choice]", m).addEventListener("click", async () => {
      if (!(await confirmDialog(ui.resetChoiceQuestion, ui.resetChoice))) return;
      store.set({ choice: null });
      await close();
      renderProgram();
      const t = tileFor(entry.key);
      t?.focus({ preventScroll: true });
      if (t) replay(t, "just-unlocked");
      announce(ui.resetChoice);
    });
  }

  swipeToClose(bcard, close);
  openModal(m, { onRequestClose: close, initialFocus: $(".bcard__close", m), returnFocus: tile });
  wireImages(m);

  // Öffnen: von der Kachel heranwachsen, dann aufklappen
  if (reducedMotion()) {
    bcard.classList.add("is-open", "is-settled");
    return;
  }
  const frontW = isSmall() ? bcard.offsetWidth : bcard.offsetWidth / 2;
  growFrom(stage, tile, frontW).then(async () => {
    await wait(120);
    if (closing) return;
    bcard.classList.add("is-open");
    await wait(isSmall() ? 750 : 1000);
    if (!closing) bcard.classList.add("is-settled");
  });
}

/** Wischen nach unten schließt (nur kleine Bildschirme, nur ganz oben). */
function swipeToClose(scroller, onClose) {
  let startY = null;
  let dy = 0;
  scroller.addEventListener(
    "touchstart",
    (e) => {
      if (!isSmall() || scroller.scrollTop > 0 || e.touches.length !== 1) return (startY = null);
      startY = e.touches[0].clientY;
      dy = 0;
    },
    { passive: true },
  );
  scroller.addEventListener(
    "touchmove",
    (e) => {
      if (startY === null) return;
      dy = e.touches[0].clientY - startY;
      if (dy > 0 && scroller.scrollTop <= 0) {
        e.preventDefault();
        scroller.style.transition = "none";
        scroller.style.transform = `translateY(${dy * 0.85}px)`;
        scroller.style.opacity = String(Math.max(0.4, 1 - dy / 600));
      } else {
        startY = null;
        scroller.style.transform = "";
        scroller.style.opacity = "";
      }
    },
    { passive: false },
  );
  scroller.addEventListener("touchend", () => {
    if (startY === null) return;
    startY = null;
    scroller.style.transition = "";
    if (dy > 110) {
      scroller.style.transform = "translateY(100%)";
      scroller.style.opacity = "0";
      setTimeout(onClose, reducedMotion() ? 0 : 220);
    } else {
      scroller.style.transform = "";
      scroller.style.opacity = "";
    }
  });
}

// ════════════════════════════════════════════════════════════════════
//  Vormittags-Wahl
// ════════════════════════════════════════════════════════════════════
function openChoice(entry, tile) {
  const parent = entry.act;
  const opts = parent.options.map((o) => ({ ...o, start: parent.start, end: parent.end }));
  const m = el(`
    <div class="modal modal--choice" role="dialog" aria-modal="true" aria-labelledby="ch-title" aria-describedby="ch-intro">
      <div class="modal__backdrop" data-close></div>
      <div class="choice-stage">
        <div class="choice-panel">
          <header class="choice-head">
            <p class="choice-head__kicker">${icon("clock")} ${esc(timeRange(parent))}</p>
            <h2 class="choice-head__title" id="ch-title">${esc(ui.choiceTitle)}</h2>
            <p class="choice-head__intro" id="ch-intro">${esc(ui.choiceIntro)}</p>
            <div class="choice-tabs">
              ${opts
                .map(
                  (o, i) =>
                    `<button type="button" class="choice-tab" data-accent="${esc(o.accent)}" data-tab="${i}" aria-controls="opt-${esc(o.id)}" aria-current="${i === 0}">${icon(o.icon)} <span>${esc(o.title)}</span></button>`,
                )
                .join("")}
            </div>
          </header>
          <div class="choice-track">
            ${opts
              .map(
                (o) => `
              <article class="option" id="opt-${esc(o.id)}" data-accent="${esc(o.accent)}" aria-labelledby="opt-${esc(o.id)}-title">
                ${imageHTML(o)}
                <div class="option__body">
                  <h3 class="option__title" id="opt-${esc(o.id)}-title"><span class="option__icon">${icon(o.icon)}</span>${esc(o.title)}</h3>
                  ${o.tagline ? `<p class="option__tagline">${esc(o.tagline)}</p>` : ""}
                  ${detailsHTML(o, { headingLevel: 4 })}
                  <div class="option__actions" data-actions="${esc(o.id)}">
                    <button type="button" class="btn btn--accent btn--wide" data-choose="${esc(o.id)}">${icon("heart")} ${esc(ui.choose)}</button>
                  </div>
                </div>
              </article>`,
              )
              .join("")}
          </div>
        </div>
        <div class="gatefold" aria-hidden="true">
          <div class="flap flap--l" data-accent="${esc(opts[0].accent)}"><span>${icon(opts[0].icon)}</span></div>
          <div class="flap flap--r" data-accent="${esc(opts[1].accent)}"><span>${icon(opts[1].icon)}</span></div>
        </div>
        <button type="button" class="icon-btn choice-close" data-close aria-label="${esc(ui.close)}">${icon("close")}</button>
      </div>
    </div>`);

  const track = $(".choice-track", m);
  const panel = $(".choice-panel", m);
  let closing = false;

  const close = async (focusEl) => {
    if (closing) return;
    closing = true;
    m.classList.add("is-closing");
    await wait(260);
    closeModal(m, { focus: focusEl ?? tileFor(entry.key) ?? undefined });
  };

  // Tabs (nur mobil sichtbar) ↔ Wisch-Spur
  const tabs = [...m.querySelectorAll(".choice-tab")];
  const setTab = (i) => tabs.forEach((t, j) => t.setAttribute("aria-current", String(i === j)));
  tabs.forEach((t, i) =>
    t.addEventListener("click", () => {
      const target = track.children[i];
      track.scrollTo({ left: target.offsetLeft - track.offsetLeft, behavior: reducedMotion() ? "auto" : "smooth" });
      setTab(i);
    }),
  );
  track.addEventListener("scroll", () => setTab(Math.round(track.scrollLeft / Math.max(1, track.clientWidth))), {
    passive: true,
  });

  m.addEventListener("click", async (e) => {
    if (e.target.closest("[data-close]")) return close();

    const chooseBtn = e.target.closest("[data-choose]");
    if (chooseBtn) {
      const id = chooseBtn.dataset.choose;
      const box = chooseBtn.parentElement;
      // Alle anderen offenen Rückfragen zurücksetzen
      m.querySelectorAll(".option__actions.is-confirming").forEach((b) => b !== box && resetActions(b));
      box.classList.add("is-confirming");
      box.innerHTML = `
        <p class="confirm__q">${esc(ui.confirmQuestion)}</p>
        <div class="confirm__btns">
          <button type="button" class="btn btn--accent" data-yes="${esc(id)}">${icon("check")} ${esc(ui.confirmYes)}</button>
          <button type="button" class="btn btn--ghost" data-no>${esc(ui.confirmNo)}</button>
        </div>`;
      $("[data-yes]", box).focus();
      return;
    }

    if (e.target.closest("[data-no]")) {
      const box = e.target.closest(".option__actions");
      resetActions(box);
      $("[data-choose]", box).focus();
      return;
    }

    const yes = e.target.closest("[data-yes]");
    if (yes) {
      const id = yes.dataset.yes;
      const box = yes.closest(".option__actions");
      const opt = opts.find((o) => o.id === id);
      store.set({ choice: id });
      const r = yes.getBoundingClientRect();
      box.classList.remove("is-confirming");
      box.classList.add("is-chosen");
      box.innerHTML = `<p class="chosen-msg" tabindex="-1">${icon("check")} ${esc(ui.chosen)}</p>`;
      $(".chosen-msg", box).focus();
      m.querySelectorAll("[data-choose]").forEach((b) => (b.disabled = true));
      confetti({ count: 90, origin: { x: r.left + r.width / 2, y: r.top }, colors: confettiColors(opt.accent) });
      announce(`${ui.chosen} ${opt.title}`);
      await wait(1700);
      renderProgram();
      const t = tileFor(entry.key);
      if (t) t.classList.add("just-chosen");
      await close(t);
      setTimeout(() => t?.classList.remove("just-chosen"), 1200);
    }
  });

  function resetActions(box) {
    const id = box.dataset.actions;
    box.classList.remove("is-confirming");
    box.innerHTML = `<button type="button" class="btn btn--accent btn--wide" data-choose="${esc(id)}">${icon("heart")} ${esc(ui.choose)}</button>`;
  }

  openModal(m, { onRequestClose: () => close(), initialFocus: $(".choice-close", m), returnFocus: tile });
  wireImages(m);
  if (reducedMotion()) {
    m.classList.add("is-open");
  } else {
    growFrom(panel, tile, panel.offsetWidth).then(() => {
      if (!closing) m.classList.add("is-open");
    });
  }
}

const confettiColors = (accent) =>
  ({
    ice: ["#bfe3f5", "#ffffff", "#7fb8dc", "#e8f3fa", "#f3d27a"],
    market: ["#c0392b", "#2f6b4f", "#f3d27a", "#ffffff", "#e8a33a"],
  })[accent];

// ════════════════════════════════════════════════════════════════════
//  Rückfrage-Dialog
// ════════════════════════════════════════════════════════════════════
function confirmDialog(text, yesLabel = ui.yes) {
  return new Promise((resolve) => {
    const m = el(`
      <div class="modal modal--confirm" role="alertdialog" aria-modal="true" aria-labelledby="cf-text">
        <div class="modal__backdrop" data-no></div>
        <div class="sheet sheet--small">
          <p class="sheet__text" id="cf-text">${esc(text)}</p>
          <div class="confirm__btns">
            <button type="button" class="btn btn--dark" data-yes>${esc(yesLabel)}</button>
            <button type="button" class="btn btn--ghost" data-no>${esc(ui.cancel)}</button>
          </div>
        </div>
      </div>`);
    const finish = (ok) => {
      closeModal(m);
      resolve(ok);
    };
    m.addEventListener("click", (e) => {
      if (e.target.closest("[data-yes]")) finish(true);
      else if (e.target.closest("[data-no]")) finish(false);
    });
    openModal(m, { onRequestClose: () => finish(false), initialFocus: $("[data-no].btn", m) });
    replay(m, "is-opening");
  });
}

// ════════════════════════════════════════════════════════════════════
//  Start
// ════════════════════════════════════════════════════════════════════
startSparkles($("#sky"));
if (store.get().gate) showDashboard();
else renderGate();
