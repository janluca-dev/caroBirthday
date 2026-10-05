// Kleine Dialog-Verwaltung: Fokus-Falle, Escape schließt, Rest der Seite wird inert.

const stack = [];
const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), textarea, select, [tabindex]:not([tabindex="-1"])';

function backgroundFor(index) {
  // Alles, was unter dem Dialog liegt: Hauptinhalt + tiefere Dialoge
  const els = [document.getElementById("app"), document.getElementById("gate")];
  for (let i = 0; i < index; i++) els.push(stack[i].el);
  return els.filter(Boolean);
}

function setInert() {
  const all = [document.getElementById("app"), document.getElementById("gate"), ...stack.map((m) => m.el)];
  all.forEach((el) => el && (el.inert = false));
  if (stack.length) backgroundFor(stack.length - 1).forEach((el) => (el.inert = true));
  document.documentElement.classList.toggle("has-modal", stack.length > 0);
}

function onKeydown(e) {
  const top = stack[stack.length - 1];
  if (!top) return;
  if (e.key === "Escape") {
    e.preventDefault();
    top.requestClose();
    return;
  }
  if (e.key !== "Tab") return;
  const items = [...top.el.querySelectorAll(FOCUSABLE)].filter(
    (n) => n.offsetParent !== null || n === document.activeElement,
  );
  if (!items.length) {
    e.preventDefault();
    return;
  }
  const first = items[0];
  const last = items[items.length - 1];
  if (!top.el.contains(document.activeElement)) {
    e.preventDefault();
    first.focus();
  } else if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
}
document.addEventListener("keydown", onKeydown);

/**
 * Öffnet einen Dialog.
 * @param {HTMLElement} el            Wurzel des Dialogs (wird an <body> gehängt)
 * @param {object} o
 * @param {() => void} o.onRequestClose  wird bei Escape / Klick auf Hintergrund aufgerufen
 * @param {HTMLElement} [o.initialFocus]
 * @param {HTMLElement} [o.returnFocus]
 */
export function openModal(el, { onRequestClose, initialFocus, returnFocus } = {}) {
  const entry = {
    el,
    requestClose: onRequestClose ?? (() => closeModal(el)),
    returnFocus: returnFocus ?? document.activeElement,
  };
  stack.push(entry);
  document.getElementById("layer").appendChild(el);
  setInert();
  const target = initialFocus ?? el.querySelector(FOCUSABLE) ?? el;
  requestAnimationFrame(() => target.focus({ preventScroll: true }));
  return entry;
}

/** Entfernt den Dialog aus dem Stapel und dem DOM; gibt den Fokus zurück. */
export function closeModal(el, { focus } = {}) {
  const i = stack.findIndex((m) => m.el === el);
  if (i === -1) return;
  const [entry] = stack.splice(i, 1);
  el.remove();
  setInert();
  const back = focus ?? entry.returnFocus;
  if (back && document.contains(back)) back.focus({ preventScroll: true });
}

export function isTopModal(el) {
  return stack[stack.length - 1]?.el === el;
}
