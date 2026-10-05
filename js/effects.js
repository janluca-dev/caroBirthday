// Funkeln im Hintergrund und Konfetti – beides abschaltbar über prefers-reduced-motion.

export const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const GOLD = ["#f3d27a", "#e7b74f", "#fff1c9", "#f6c6d0", "#bfe3f5"];

/** Sanft funkelnde Sterne auf einem Canvas, der den ganzen Hintergrund füllt. */
export function startSparkles(canvas) {
  const ctx = canvas.getContext("2d");
  let w, h, dpr, stars, raf;

  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.round(Math.min(110, (w * h) / 9000));
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.3 + 0.3,
      phase: Math.random() * Math.PI * 2,
      speed: 0.4 + Math.random() * 1.2,
      drift: 0.02 + Math.random() * 0.08,
      gold: Math.random() < 0.35,
    }));
  };

  const draw = (t) => {
    ctx.clearRect(0, 0, w, h);
    for (const s of stars) {
      const tw = reducedMotion() ? 0.7 : 0.45 + 0.55 * Math.sin(s.phase + (t / 1000) * s.speed);
      if (!reducedMotion()) {
        s.y += s.drift;
        if (s.y > h + 4) s.y = -4;
      }
      ctx.globalAlpha = Math.max(0.08, tw);
      ctx.fillStyle = s.gold ? "#f3d27a" : "#ffffff";
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
      if (s.r > 1.2 && tw > 0.8) {
        // kleines Kreuz-Funkeln
        ctx.globalAlpha = (tw - 0.8) * 2;
        ctx.fillRect(s.x - s.r * 3, s.y - 0.3, s.r * 6, 0.6);
        ctx.fillRect(s.x - 0.3, s.y - s.r * 3, 0.6, s.r * 6);
      }
    }
    ctx.globalAlpha = 1;
    if (!reducedMotion()) raf = requestAnimationFrame(draw);
  };

  resize();
  window.addEventListener("resize", () => {
    resize();
    if (reducedMotion()) draw(0);
  });
  raf = requestAnimationFrame(draw);
  return () => cancelAnimationFrame(raf);
}

/** Konfetti-Regen. origin in Bildschirmkoordinaten (optional). */
export function confetti({ count = 140, origin = null, colors = GOLD } = {}) {
  if (reducedMotion()) return;
  const canvas = document.createElement("canvas");
  canvas.className = "confetti-canvas";
  canvas.setAttribute("aria-hidden", "true");
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = window.innerWidth;
  const h = window.innerHeight;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  ctx.scale(dpr, dpr);

  const parts = Array.from({ length: count }, () => {
    const fromPoint = Boolean(origin);
    const angle = fromPoint ? -Math.PI / 2 + (Math.random() - 0.5) * 1.6 : Math.PI / 2;
    const speed = fromPoint ? 6 + Math.random() * 7 : 1.5 + Math.random() * 2.5;
    return {
      x: fromPoint ? origin.x : Math.random() * w,
      y: fromPoint ? origin.y : -20 - Math.random() * h * 0.5,
      vx: Math.cos(angle) * speed + (fromPoint ? 0 : (Math.random() - 0.5) * 1.5),
      vy: Math.sin(angle) * speed,
      size: 5 + Math.random() * 6,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.3,
      color: colors[Math.floor(Math.random() * colors.length)],
      shape: Math.random() < 0.25 ? "circle" : "rect",
      wobble: Math.random() * 10,
    };
  });

  const start = performance.now();
  const duration = 3200;
  const tick = (now) => {
    const t = now - start;
    ctx.clearRect(0, 0, w, h);
    const fade = t > duration - 800 ? Math.max(0, (duration - t) / 800) : 1;
    for (const p of parts) {
      p.vy += 0.12;
      p.vx *= 0.99;
      p.vy = Math.min(p.vy, 4.5);
      p.x += p.vx + Math.sin((t / 300) + p.wobble) * 0.4;
      p.y += p.vy;
      p.rot += p.vr;
      ctx.save();
      ctx.globalAlpha = fade;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      if (p.shape === "circle") {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 3, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      }
      ctx.restore();
    }
    if (t < duration) requestAnimationFrame(tick);
    else canvas.remove();
  };
  requestAnimationFrame(tick);
}
