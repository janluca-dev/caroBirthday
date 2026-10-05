// Einheitliche Inline-SVG-Symbole (24×24, Strichstärke 1.6, runde Enden).

const paths = {
  // Kaffeetasse mit Dampf
  cup: `<path d="M5 10h11v4.5a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5z"/><path d="M16 11.5h1.5a2.5 2.5 0 0 1 0 5H15.6"/><path d="M8 3.5c-.8 1 .8 2 0 3M11 3.5c-.8 1 .8 2 0 3M14 3.5c-.8 1 .8 2 0 3"/><path d="M4 21.5h14"/>`,
  // Schneeflocke über Bergkamm
  snow: `<path d="M12 2.5v9M8.1 4.75l7.8 4.5M15.9 4.75l-7.8 4.5"/><path d="M10.5 3.3 12 4.6l1.5-1.3M10.5 10.7 12 9.4l1.5 1.3"/><path d="M2.5 21l5.5-6.5 3.5 4 3-3 7 5.5"/>`,
  // Marktstand mit Stern
  market: `<path d="M4 9.5 5.5 5h13L20 9.5"/><path d="M4 9.5a2 2 0 0 0 4 0 2 2 0 0 0 4 0 2 2 0 0 0 4 0 2 2 0 0 0 4 0"/><path d="M5.5 11.5V20h13v-8.5"/><path d="M10 20v-4.5h4V20"/><path d="m12 1.4.6 1.3 1.4.2-1 1 .2 1.4-1.2-.7-1.2.7.2-1.4-1-1 1.4-.2z"/>`,
  // Minigolf: Fahne, Loch, Ball, Schläger
  golf: `<path d="M9 18V3l7 3-7 3"/><ellipse cx="9" cy="18.5" rx="5" ry="1.8"/><circle cx="18" cy="17" r="1.4"/><path d="m21.5 9-3.6 5.4M17.9 14.4l-1.4.4"/>`,
  // Topf mit Herz-Dampf
  dinner: `<path d="M4 11h16v3.5A5.5 5.5 0 0 1 14.5 20h-5A5.5 5.5 0 0 1 4 14.5z"/><path d="M2.5 11h19M10 8.6h4"/><path d="M12 7.2s-2.6-1.6-2.6-3.1A1.3 1.3 0 0 1 12 3.5a1.3 1.3 0 0 1 2.6.6c0 1.5-2.6 3.1-2.6 3.1z"/>`,
  // Therme: Wellen mit Dampf
  spa: `<path d="M2.5 15c1.6 0 1.6 1.2 3.2 1.2S7.3 15 8.9 15s1.6 1.2 3.1 1.2S13.6 15 15.2 15s1.6 1.2 3.2 1.2 1.5-1.2 3.1-1.2"/><path d="M2.5 19c1.6 0 1.6 1.2 3.2 1.2S7.3 19 8.9 19s1.6 1.2 3.1 1.2S13.6 19 15.2 19s1.6 1.2 3.2 1.2 1.5-1.2 3.1-1.2"/><path d="M8 11c-1-1.3 1-2.5 0-4M12 11c-1-1.3 1-2.5 0-4.5-.6-.9-.3-2 .3-2.5M16 11c-1-1.3 1-2.5 0-4"/>`,
  // Wahl: Weg, der sich gabelt
  choice: `<path d="M12 21.5v-7"/><path d="M12 14.5 6 8.5V4"/><path d="m12 14.5 6-6V4"/><path d="m3.8 6.2 2.2-2.2 2.2 2.2M15.8 6.2 18 4l2.2 2.2"/>`,
  // Schloss zu
  lock: `<rect x="4.5" y="10.5" width="15" height="10.5" rx="2.5"/><path class="shackle" d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/><path d="M12 14.6v2.4"/>`,
  // Uhr
  clock: `<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.2 2"/>`,
  // Ort
  pin: `<path d="M12 21.5s-7-6.2-7-11.5a7 7 0 0 1 14 0c0 5.3-7 11.5-7 11.5z"/><circle cx="12" cy="10" r="2.6"/>`,
  // Kleidung (Pulli)
  shirt: `<path d="M8.5 3.5 4 5.8 2.5 11l3 1V20.5h13V12l3-1L20 5.8l-4.5-2.3a3.5 3.5 0 0 1-7 0z"/>`,
  // Tasche
  bag: `<path d="M5 8h14l-1 12.5H6z"/><path d="M9 10.5V6a3 3 0 0 1 6 0v4.5"/>`,
  // Hinweis-Funkeln
  spark: `<path d="M12 3c.6 4.2 1.8 5.4 6 6-4.2.6-5.4 1.8-6 6-.6-4.2-1.8-5.4-6-6 4.2-.6 5.4-1.8 6-6z"/><path d="M19 15.5c.3 1.6.9 2.2 2.5 2.5-1.6.3-2.2.9-2.5 2.5-.3-1.6-.9-2.2-2.5-2.5 1.6-.3 2.2-.9 2.5-2.5z"/>`,
  // Pfeil nach außen
  external: `<path d="M14 4h6v6M20 4l-9 9"/><path d="M18 14v5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 4 19V7.5A1.5 1.5 0 0 1 5.5 6H10"/>`,
  close: `<path d="M6 6l12 12M18 6 6 18"/>`,
  check: `<path d="m4.5 12.5 4.5 4.5L19.5 6.5"/>`,
  undo: `<path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>`,
  heart: `<path d="M12 20s-7.5-4.6-7.5-10A4.2 4.2 0 0 1 12 7.4 4.2 4.2 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z"/>`,
  gift: `<rect x="3.5" y="8.5" width="17" height="4" rx="1"/><path d="M5 12.5v8h14v-8M12 8.5v12"/><path d="M12 8.5S10.8 4 8.3 4a2.2 2.2 0 0 0 0 4.5zM12 8.5S13.2 4 15.7 4a2.2 2.2 0 0 1 0 4.5z"/>`,
};

export function icon(name, { className = "", label = "" } = {}) {
  const a11y = label ? `role="img" aria-label="${label}"` : `aria-hidden="true" focusable="false"`;
  return `<svg class="icon ${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" ${a11y}>${paths[name] ?? ""}</svg>`;
}

export const iconNames = Object.keys(paths);
export const iconPaths = paths;
