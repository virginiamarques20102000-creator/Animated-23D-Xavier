// 2.5D canvas engine: vertical painted layers at depth z, a projected ground plane, character cards from toon.ts,
// screen-space fx. Camera looks along +z; x right, y up. Much faster than the three.js pipeline (no WebGL).
import { Pen, bodyFront, bodySide, FrontOpts, SideOpts, Outfit, INK } from "./toon";

export const VW = 1920, VH = 1080, FPS = 30;
export type Ctx = CanvasRenderingContext2D;
export type Cam = { x: number; y: number; z: number; fov: number; shift?: number };
export const focal = (c: Cam) => VW / 2 / Math.tan((c.fov * Math.PI) / 360);
/** world -> [screen x, screen y, px per metre at that depth] */
export const P = (c: Cam, x: number, y: number, z: number): [number, number, number] => {
  const s = focal(c) / Math.max(0.05, z - c.z);
  return [VW / 2 + (x - c.x) * s, VH / 2 + (c.shift ?? 0) - (y - c.y) * s, s];
};
export const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const smooth = (t: number) => { t = clamp(t); return t * t * (3 - 2 * t); };
export const easeOut = (t: number) => 1 - Math.pow(1 - clamp(t), 3);
export const easeIn = (t: number) => Math.pow(clamp(t), 2.2);
export const rng = (seed: number) => () => ((seed = (seed * 16807 + 11) % 2147483647) / 2147483647);
export const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
export const mk = (w: number, h: number) => { const c = document.createElement("canvas"); c.width = Math.max(1, Math.round(w)); c.height = Math.max(1, Math.round(h)); return c; };

// ---------------- world painter (metres, y up) ----------------
type Pt = number[];
export class WP {
  constructor(public g: Ctx, public ppm: number) {}
  lw(px: number) { return px / this.ppm; }
  path(pts: Pt[], close = true) { const g = this.g; g.beginPath(); pts.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]))); if (close) g.closePath(); }
  poly(pts: Pt[], fill: string | CanvasGradient | null, ink = 2.5, inkCol = INK) {
    this.path(pts); const g = this.g;
    if (fill) { g.fillStyle = fill; g.fill(); }
    if (ink) { g.lineWidth = this.lw(ink); g.strokeStyle = inkCol; g.lineJoin = "round"; g.stroke(); }
  }
  rect(x: number, y: number, w: number, h: number, fill: string | CanvasGradient | null, ink = 2.5) { this.poly([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], fill, ink); }
  ell(x: number, y: number, rx: number, ry: number, fill: string | CanvasGradient | null, ink = 2.5, a0 = 0, a1 = Math.PI * 2) {
    const g = this.g; g.beginPath(); g.ellipse(x, y, rx, ry, 0, a0, a1); if (a1 - a0 < 6.28) g.closePath();
    if (fill) { g.fillStyle = fill; g.fill(); } if (ink) { g.lineWidth = this.lw(ink); g.strokeStyle = INK; g.stroke(); }
  }
  line(pts: Pt[], px: number, col = INK) { this.path(pts, false); const g = this.g; g.lineWidth = this.lw(px); g.strokeStyle = col; g.lineCap = "round"; g.lineJoin = "round"; g.stroke(); }
  vgrad(y0: number, y1: number, c0: string, c1: string) { const gr = this.g.createLinearGradient(0, y0, 0, y1); gr.addColorStop(0, c0); gr.addColorStop(1, c1); return gr; }
  text(s: string, x: number, y: number, size: number, col: string, font = "bold", align: CanvasTextAlign = "center") {
    const g = this.g; g.save(); g.translate(x, y); g.scale(1 / this.ppm, -1 / this.ppm);
    g.font = `${font} ${Math.round(size * this.ppm)}px "DejaVu Serif", serif`; g.textAlign = align; g.textBaseline = "middle"; g.fillStyle = col; g.fillText(s, 0, 0); g.restore();
  }
  clip(pts: Pt[], fn: () => void) { const g = this.g; g.save(); this.path(pts); g.clip(); fn(); g.restore(); }
}

// ---------------- layers ----------------
export type Layer = { key: string; z: number; x0: number; x1: number; y0: number; y1: number; ppm: number; blur?: number; paint: (w: WP) => void; dx?: number; dy?: number; alpha?: number };
const LC = new Map<string, HTMLCanvasElement>();
let lcPix = 0;
const getCached = (key: string, w: number, h: number, paint: (g: Ctx) => void, blur = 0) => {
  let c = LC.get(key);
  if (c) { LC.delete(key); LC.set(key, c); return c; }
  c = mk(w, h); paint(c.getContext("2d")!);
  if (blur) { const c2 = mk(w, h), g2 = c2.getContext("2d")!; g2.filter = `blur(${blur}px)`; g2.drawImage(c, 0, 0); c = c2; }
  lcPix += c.width * c.height; LC.set(key, c);
  while (lcPix > 9e7 && LC.size > 1) { const [k0, c0] = LC.entries().next().value as [string, HTMLCanvasElement]; LC.delete(k0); lcPix -= c0.width * c0.height; }
  return c;
};
export const layerCanvas = (L: Layer) => getCached(L.key, (L.x1 - L.x0) * L.ppm, (L.y1 - L.y0) * L.ppm, (g) => {
  g.setTransform(L.ppm, 0, 0, -L.ppm, -L.x0 * L.ppm, L.y1 * L.ppm); L.paint(new WP(g, L.ppm));
}, L.blur ?? 0);
export const drawLayer = (ctx: Ctx, cam: Cam, L: Layer) => {
  if (L.z - cam.z < 0.2) return;
  const c = layerCanvas(L), dx = L.dx ?? 0, dy = L.dy ?? 0;
  const [sx0, sy0, s] = P(cam, L.x0 + dx, L.y1 + dy, L.z), w = (L.x1 - L.x0) * s, h = (L.y1 - L.y0) * s;
  const ax = Math.max(0, sx0), bx = Math.min(VW, sx0 + w), ay = Math.max(0, sy0), by = Math.min(VH, sy0 + h);
  if (bx <= ax || by <= ay) return;
  const kx = c.width / w, ky = c.height / h;
  if (L.alpha !== undefined) ctx.globalAlpha = L.alpha;
  ctx.drawImage(c, (ax - sx0) * kx, (ay - sy0) * ky, (bx - ax) * kx, (by - ay) * ky, ax, ay, bx - ax, by - ay);
  ctx.globalAlpha = 1;
};

// ---------------- character cards ----------------
const OID = new WeakMap<object, number>(); let oidN = 0;
const oid = (o: object) => { let i = OID.get(o); if (i === undefined) { i = ++oidN; OID.set(o, i); } return i; };
const TIERS = [0.1, 0.14, 0.2, 0.28, 0.38, 0.5, 0.66, 0.86, 1.1, 1.4];
export type Act = { o: Outfit; x: number; z: number; y?: number; sc?: number; side?: boolean; flip?: boolean; f?: FrontOpts; s?: SideOpts; id?: number; dark?: number; darkCol?: string; alpha?: number; shadow?: number; rot?: number };
const q = (v: number) => Math.round(v * 40) / 40;
export const CARD_H = 2.25;
export const drawAct = (ctx: Ctx, cam: Cam, a: Act) => {
  const sc = a.sc ?? 1, y = a.y ?? 0;
  if (a.z - cam.z < 0.3) return;
  const [sx, sy, s] = P(cam, a.x, y, a.z), k = (CARD_H * sc * s) / 1000;
  if (sx < -700 * k || sx > VW + 700 * k || sy < -50 || sy - 1000 * k > VH + 50) return;
  if ((a.shadow ?? 0.32) > 0 && a.y === undefined) {
    const rx = 0.42 * sc * s, ry = rx * clamp((cam.y - y) / (a.z - cam.z), 0.06, 0.5);
    ctx.fillStyle = `rgba(28,18,36,${a.shadow ?? 0.32})`; ctx.beginPath(); ctx.ellipse(sx, sy - ry * 0.2, rx, ry, 0, 0, 7); ctx.fill();
  }
  const tier = TIERS.find((t) => t >= k * 1.02) ?? 1.4;
  const seed = a.id ?? 1;
  const fo = a.side ? undefined : { ...a.f, seed }, so = a.side ? { ...a.s, seed } : undefined;
  const key = `${oid(a.o)}|${a.side ? 1 : 0}|${JSON.stringify(fo ?? so, (_k, v) => (typeof v === "number" ? q(v) : v))}|${tier}|${a.dark ?? 0}|${a.darkCol ?? ""}`;
  const c = getCached(key, 600 * tier, 1000 * tier, (g) => {
    g.setTransform(tier, 0, 0, tier, 0, 0);
    const p = new Pen(g);
    if (a.side) bodySide(p, a.o, so as SideOpts); else bodyFront(p, a.o, fo as FrontOpts);
    if (a.dark) { g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = "source-atop"; g.fillStyle = a.darkCol ?? "#140f1e"; g.globalAlpha = a.dark; g.fillRect(0, 0, 9999, 9999); }
  });
  ctx.save(); ctx.translate(sx, sy);
  if (a.rot) ctx.rotate(a.rot);
  if (a.flip) ctx.scale(-1, 1);
  if (a.alpha !== undefined) ctx.globalAlpha = clamp(a.alpha);
  ctx.drawImage(c, -300 * k, -975 * k, 600 * k, 1000 * k);
  ctx.restore();
};

// ---------------- sprites (vehicles, props): painted once in metres, placed per frame ----------------
export type Sprite = { key: string; w: number; h: number; ppm: number; paint: (w: WP) => void };
export const drawSprite = (ctx: Ctx, cam: Cam, S: Sprite, x: number, y: number, z: number, o: { flip?: boolean; rot?: number; alpha?: number; sc?: number } = {}) => {
  if (z - cam.z < 0.3) return;
  const c = getCached(S.key, S.w * S.ppm, S.h * S.ppm, (g) => { g.setTransform(S.ppm, 0, 0, -S.ppm, S.w * S.ppm / 2, S.h * S.ppm); S.paint(new WP(g, S.ppm)); });
  const [sx, sy, s0] = P(cam, x, y, z), s = s0 * (o.sc ?? 1), w = S.w * s, h = S.h * s;
  if (sx + w < 0 || sx - w > VW) return;
  ctx.save(); ctx.translate(sx, sy); if (o.rot) ctx.rotate(o.rot); if (o.flip) ctx.scale(-1, 1);
  if (o.alpha !== undefined) ctx.globalAlpha = o.alpha;
  ctx.drawImage(c, -w / 2, -h, w, h); ctx.restore();
};

// ---------------- ground plane ----------------
export type Ground = { near: string; far: string; zFar?: number; kind?: "cobble" | "mud" | "snow" | "sand" | "grass" | "wood" | "stone" | "rubble" | "none"; seed?: number; xr?: number };
const hex = (c: string) => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
export const mixc = (a: string, b: string, t: number) => { const A = hex(a), B = hex(b); return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(",")})`; };
export const drawGround = (ctx: Ctx, cam: Cam, G: Ground) => {
  const zf = G.zFar ?? 400, n = 26;
  for (let i = 0; i < n; i++) {
    const za = cam.z + 0.4 + (zf - cam.z) * Math.pow(i / n, 2.2), zb = cam.z + 0.4 + (zf - cam.z) * Math.pow((i + 1) / n, 2.2);
    const ya = P(cam, 0, 0, za)[1], yb = P(cam, 0, 0, zb)[1];
    if (yb > VH || ya < 0 && yb < 0) continue;
    ctx.fillStyle = mixc(G.near, G.far, Math.pow(i / n, 0.6)); ctx.fillRect(0, Math.min(yb, VH) - 1, VW, Math.min(VH, ya) - yb + 2);
  }
  const kind = G.kind ?? "none"; if (kind === "none") return;
  const r = rng(G.seed ?? 7), xr = G.xr ?? 40, N = kind === "wood" ? 0 : 520;
  const zmax = Math.min(60, zf);
  for (let i = 0; i < N; i++) {
    const x = (r() * 2 - 1) * xr, z = r() * zmax, v = r(), v2 = r();
    if (z - cam.z < 0.8) continue;
    const [sx, sy, s] = P(cam, x, 0, z); if (sx < -60 || sx > VW + 60 || sy > VH + 30) continue;
    const fy = clamp((cam.y) / (z - cam.z), 0.08, 0.6);
    if (kind === "cobble" || kind === "stone") { const rr = (kind === "cobble" ? 0.13 : 0.3) * s; ctx.strokeStyle = "rgba(40,28,30,0.28)"; ctx.lineWidth = Math.max(0.6, 0.012 * s); ctx.beginPath(); ctx.ellipse(sx, sy, rr, rr * fy, 0, 0, 7); ctx.stroke(); }
    else if (kind === "grass") { ctx.strokeStyle = v > 0.5 ? "rgba(40,70,30,0.5)" : "rgba(150,170,80,0.45)"; ctx.lineWidth = Math.max(0.7, 0.02 * s); ctx.beginPath(); for (let k = -1; k <= 1; k++) { ctx.moveTo(sx + k * 0.04 * s, sy); ctx.lineTo(sx + k * 0.07 * s, sy - (0.12 + 0.1 * v2) * s); } ctx.stroke(); }
    else if (kind === "mud" || kind === "rubble") { ctx.fillStyle = kind === "mud" ? (v > 0.5 ? "rgba(40,30,22,0.35)" : "rgba(120,100,80,0.3)") : (v > 0.5 ? "rgba(60,55,52,0.55)" : "rgba(150,140,128,0.5)"); const rr = (0.08 + 0.18 * v2) * s; ctx.beginPath(); ctx.ellipse(sx, sy, rr, rr * fy * (kind === "rubble" ? 1.6 : 1), v * 3, 0, 7); ctx.fill(); }
    else if (kind === "snow") { ctx.fillStyle = "rgba(255,255,255,0.5)"; ctx.beginPath(); ctx.ellipse(sx, sy, 0.25 * s, 0.25 * s * fy, 0, 0, 7); ctx.fill(); }
    else if (kind === "sand") { ctx.fillStyle = v > 0.5 ? "rgba(120,96,60,0.22)" : "rgba(255,240,200,0.25)"; ctx.beginPath(); ctx.ellipse(sx, sy, 0.3 * s, 0.3 * s * fy, 0, 0, 7); ctx.fill(); }
  }
  if (kind === "wood") { ctx.strokeStyle = "rgba(40,24,18,0.35)"; ctx.lineWidth = 1.5;
    for (let x = -xr; x <= xr; x += 0.32) { const [ax, ay] = P(cam, x, 0, cam.z + 0.5), [bx, by] = P(cam, x, 0, zf); ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke(); } }
};

// ---------------- fx ----------------
export const glow = (ctx: Ctx, x: number, y: number, r: number, col: string, a: number, op: GlobalCompositeOperation = "lighter") => {
  if (a <= 0.003 || r < 1) return;
  const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col); g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.save(); ctx.globalCompositeOperation = op; ctx.globalAlpha = clamp(a); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r); ctx.restore();
};
/** soft opaque-core puff (dense smoke / dust) */
export const puff = (ctx: Ctx, x: number, y: number, r: number, col: [number, number, number], a: number) => {
  if (a <= 0.003 || r < 1) return;
  const g = ctx.createRadialGradient(x, y - r * 0.15, r * 0.1, x, y, r);
  g.addColorStop(0, `rgba(${col[0] + 25},${col[1] + 25},${col[2] + 25},${a})`); g.addColorStop(0.55, `rgba(${col.join(",")},${a * 0.85})`); g.addColorStop(1, `rgba(${col.join(",")},0)`);
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
};
/** rising smoke column at world (x,y0,z): `t` seconds, dark = near-black dense smoke */
export const smokeCol = (ctx: Ctx, cam: Cam, t: number, x: number, y0: number, z: number, o: { h?: number; w?: number; col?: [number, number, number]; a?: number; n?: number; seed?: number; wind?: number; rate?: number } = {}) => {
  const h = o.h ?? 12, w = o.w ?? 1.6, n = o.n ?? 14, col = o.col ?? [40, 36, 38], A = o.a ?? 0.85, wind = o.wind ?? 0.25, rate = o.rate ?? 0.08;
  for (let i = n - 1; i >= 0; i--) {
    const age = (t * rate + i / n + hash((o.seed ?? 1) + i) * 0.03) % 1;
    const yy = y0 + age * h, xx = x + wind * age * h + Math.sin(i * 2.3 + t * 0.6) * 0.25 * w * age;
    const [sx, sy, s] = P(cam, xx, yy, z + (hash(i + 3) - 0.5) * 0.4);
    puff(ctx, sx, sy, (0.35 + age * 1.1) * w * s, col, A * Math.min(1, age * 6) * (1 - age) ** 0.7);
  }
};
export const fire = (ctx: Ctx, cam: Cam, t: number, x: number, y: number, z: number, size = 1, seed = 1) => {
  const [sx, sy, s] = P(cam, x, y, z), r = size * s;
  glow(ctx, sx, sy - 0.4 * r, 3.2 * r, "rgba(255,120,40,0.55)", 0.8);
  ctx.save(); ctx.globalCompositeOperation = "lighter";
  for (let i = 0; i < 7; i++) {
    const ph = (t * 2.6 + hash(seed * 7 + i)) % 1, fx = sx + (hash(seed + i * 3) - 0.5) * 0.9 * r + Math.sin(t * 9 + i) * 0.06 * r, fy = sy - ph * 1.3 * r;
    const rr = (1 - ph) * 0.45 * r + 0.05 * r;
    const g = ctx.createRadialGradient(fx, fy, 0, fx, fy, rr); g.addColorStop(0, "rgba(255,240,170,0.95)"); g.addColorStop(0.4, "rgba(255,150,40,0.8)"); g.addColorStop(1, "rgba(200,40,10,0)");
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(fx, fy, rr * 0.7, rr * 1.25, 0, 0, 7); ctx.fill();
  }
  ctx.restore();
};
/** explosion at world point, age in seconds */
export const boom = (ctx: Ctx, cam: Cam, age: number, x: number, y: number, z: number, size = 2, seed = 1) => {
  if (age < 0 || age > 3.5) return;
  const [sx, sy, s] = P(cam, x, y, z), r = size * s;
  if (age < 0.35) { glow(ctx, sx, sy - 0.3 * r, r * (1.5 + 3 * age), "rgba(255,230,160,1)", 1 - age / 0.35); }
  const r2 = rng(seed);
  for (let i = 0; i < 12; i++) { // debris arcs
    const vx = (r2() - 0.5) * 9, vy = 4 + r2() * 7, tt = age; if (tt > 1.6) break;
    const px = sx + vx * tt * s * 0.6, py = sy - (vy * tt - 4.9 * tt * tt) * s * 0.6;
    if (py > sy + 5) continue; ctx.fillStyle = INK; ctx.fillRect(px, py, 0.07 * s, 0.07 * s);
  }
  for (let i = 0; i < 9; i++) { // dark billowing smoke
    const a = (i / 9) * Math.PI * 2, d = (0.3 + 0.7 * easeOut(age / 1.2)) * r * (0.5 + hash(seed + i) * 0.6);
    const px = sx + Math.cos(a) * d, py = sy - 0.5 * r - Math.abs(Math.sin(a)) * d * 0.8 - age * 0.35 * r;
    puff(ctx, px, py, (0.45 + 0.5 * easeOut(age)) * r, [38, 34, 36], 0.9 * clamp(1 - (age - 1.2) / 2.3));
  }
  if (age < 0.6) { const k = 1 - age / 0.6; ctx.save(); ctx.globalCompositeOperation = "lighter";
    puff(ctx, sx, sy - 0.5 * r, r * (0.6 + age), [255, 150, 50], 0.9 * k); puff(ctx, sx, sy - 0.5 * r, r * 0.4, [255, 230, 160], k); ctx.restore(); }
};
export const muzzle = (ctx: Ctx, cam: Cam, x: number, y: number, z: number, size = 0.35, dir = 1) => {
  const [sx, sy, s] = P(cam, x, y, z), r = size * s;
  glow(ctx, sx, sy, r * 2.2, "rgba(255,210,120,1)", 0.9);
  ctx.fillStyle = "#fff6c8"; ctx.beginPath(); ctx.moveTo(sx, sy - r * 0.25); ctx.lineTo(sx + dir * r * 1.6, sy); ctx.lineTo(sx, sy + r * 0.25); ctx.fill();
};
export const beam = (ctx: Ctx, cam: Cam, x: number, y: number, z: number, ang: number, len: number, wid: number, a = 0.35, col = "255,245,210") => {
  const [sx, sy, s] = P(cam, x, y, z), L = len * s, Wd = wid * s;
  ctx.save(); ctx.globalCompositeOperation = "lighter"; ctx.translate(sx, sy); ctx.rotate(ang);
  const g = ctx.createLinearGradient(0, 0, L, 0); g.addColorStop(0, `rgba(${col},${a})`); g.addColorStop(1, `rgba(${col},0)`);
  ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(0, -0.03 * s); ctx.lineTo(L, -Wd); ctx.lineTo(L, Wd); ctx.lineTo(0, 0.03 * s); ctx.fill(); ctx.restore();
};
/** falling particles in screen space (rain / snow / ash / dust) */
export const weather = (ctx: Ctx, t: number, kind: "rain" | "snow" | "ash" | "dust", n = 220, a = 0.5) => {
  const r = rng(99);
  for (let i = 0; i < n; i++) {
    const x0 = r() * VW, sp = 0.5 + r(), dep = 0.4 + r() * 0.8;
    if (kind === "rain") { const y = ((r() * VH + t * 1900 * sp) % (VH + 80)) - 40, x = (x0 + t * 260 * sp) % VW;
      ctx.strokeStyle = `rgba(210,220,235,${a * dep})`; ctx.lineWidth = 1.4 * dep; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 9 * dep, y - 42 * dep); ctx.stroke(); }
    else { const fall = kind === "snow" ? 70 : kind === "ash" ? 45 : 12, y = ((r() * VH + t * fall * sp) % (VH + 20)) - 10, x = (x0 + Math.sin(t * 0.9 + i) * 25 + t * 20 * sp) % VW;
      ctx.fillStyle = kind === "snow" ? `rgba(255,255,255,${a * dep})` : kind === "ash" ? `rgba(70,64,62,${a * dep})` : `rgba(255,236,200,${a * dep * 0.6})`;
      ctx.beginPath(); ctx.arc(x, y, (kind === "dust" ? 1.6 : 2.6) * dep, 0, 7); ctx.fill(); }
  }
};

// ---------------- screen overlays ----------------
const FONT = `"DejaVu Serif", serif`;
export const caption = (ctx: Ctx, txt: string, t: number, dur: number) => { // lower-left date stamp, typed on, fades
  if (t < 0 || t > dur) return;
  const a = clamp(t / 0.3) * clamp((dur - t) / 0.4), n = Math.floor(clamp(t / 0.9) * txt.length);
  ctx.save(); ctx.globalAlpha = a; ctx.font = `bold 46px ${FONT}`; ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
  const s = txt.slice(0, n), w = ctx.measureText(txt).width;
  ctx.fillStyle = "rgba(20,14,12,0.55)"; ctx.fillRect(70, VH - 150, w + 60, 76);
  ctx.fillStyle = "#c0342c"; ctx.fillRect(70, VH - 150, 8, 76);
  ctx.fillStyle = "#f4ead6"; ctx.fillText(s, 100, VH - 96); ctx.restore();
};
export const bigText = (ctx: Ctx, txt: string, t: number, dur: number, y = VH / 2, size = 110, col = "#f4ead6", sub?: string) => {
  if (t < 0 || t > dur) return;
  const a = clamp(t / 0.35) * clamp((dur - t) / 0.4), sc = 1 + 0.04 * (1 - easeOut(t / 0.8));
  ctx.save(); ctx.globalAlpha = a; ctx.translate(VW / 2, y); ctx.scale(sc, sc); ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.font = `bold ${size}px ${FONT}`; ctx.lineWidth = size * 0.12; ctx.strokeStyle = "rgba(20,12,14,0.85)"; ctx.lineJoin = "round"; ctx.strokeText(txt, 0, 0);
  ctx.fillStyle = col; ctx.fillText(txt, 0, 0);
  if (sub) { ctx.font = `italic bold ${Math.round(size * 0.62)}px ${FONT}`; ctx.lineWidth = size * 0.08; ctx.strokeText(sub, 0, size * 0.95); ctx.fillStyle = "#e8dcc4"; ctx.fillText(sub, 0, size * 0.95); }
  ctx.restore();
};
/** rubber stamp slammed on screen */
export const stamp = (ctx: Ctx, txt: string, t: number, x: number, y: number, rot = -0.18, size = 120, col = "#c42a22") => {
  if (t < 0) return;
  const k = t < 0.12 ? 2.2 - 1.2 * (t / 0.12) : 1, a = t < 0.12 ? t / 0.12 : 1;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(k, k); ctx.globalAlpha = 0.9 * a;
  ctx.font = `bold ${size}px ${FONT}`; const w = ctx.measureText(txt).width;
  ctx.strokeStyle = col; ctx.lineWidth = size * 0.09; ctx.strokeRect(-w / 2 - size * 0.3, -size * 0.75, w + size * 0.6, size * 1.5);
  ctx.fillStyle = col; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(txt, 0, 4); ctx.restore();
};
let VIG: HTMLCanvasElement | null = null, BL1: HTMLCanvasElement | null = null, BL2: HTMLCanvasElement | null = null, GR: HTMLCanvasElement | null = null;
/** finishing: colour grade (vibrance + contrast), bloom on bright areas, warm-light lift, soft vignette. No grain. */
export const post = (ctx: Ctx, t: number, vig = 0.42, bloom = 0.5, sat = 1.2) => {
  if (!GR) GR = mk(VW, VH);
  const gg = GR.getContext("2d")!; gg.globalCompositeOperation = "copy"; gg.filter = `saturate(${sat}) contrast(1.07) brightness(1.04)`; gg.drawImage(ctx.canvas, 0, 0); gg.filter = "none";
  ctx.save(); ctx.globalCompositeOperation = "copy"; ctx.drawImage(GR, 0, 0); ctx.restore();
  if (bloom > 0) {
    if (!BL1) { BL1 = mk(VW / 4, VH / 4); BL2 = mk(VW / 4, VH / 4); }
    const b1 = BL1.getContext("2d")!, b2 = BL2!.getContext("2d")!;
    b1.globalCompositeOperation = "copy"; b1.filter = "brightness(0.85) contrast(2.6) saturate(1.4)"; b1.drawImage(ctx.canvas, 0, 0, VW / 4, VH / 4); b1.filter = "none";
    b2.globalCompositeOperation = "copy"; b2.filter = "blur(9px)"; b2.drawImage(BL1, 0, 0); b2.filter = "none";
    ctx.save(); ctx.globalCompositeOperation = "screen"; ctx.globalAlpha = bloom; ctx.imageSmoothingQuality = "high"; ctx.drawImage(BL2!, 0, 0, VW, VH);
    ctx.globalAlpha = bloom * 0.6; b1.filter = "blur(3px)"; b1.globalCompositeOperation = "copy"; b1.drawImage(BL2!, 0, 0); b1.filter = "none"; ctx.restore();
  }
  if (!VIG) { VIG = mk(VW, VH); const g = VIG.getContext("2d")!, gr = g.createRadialGradient(VW / 2, VH * 0.48, VH * 0.42, VW / 2, VH / 2, VW * 0.64);
    gr.addColorStop(0, "rgba(0,0,0,0)"); gr.addColorStop(1, "rgba(20,10,24,1)"); g.fillStyle = gr; g.fillRect(0, 0, VW, VH); }
  ctx.save(); ctx.globalAlpha = vig; ctx.drawImage(VIG, 0, 0); ctx.restore();
};
/** god rays from a screen point (sun / window / flare) */
export const rays = (ctx: Ctx, x: number, y: number, len: number, a: number, col = "255,226,170", n = 14, t = 0, spread = Math.PI * 2, dir = Math.PI / 2) => {
  if (a <= 0) return; ctx.save(); ctx.globalCompositeOperation = "lighter";
  for (let i = 0; i < n; i++) { const ang = dir - spread / 2 + (spread * (i + 0.5)) / n + 0.04 * Math.sin(t * 0.7 + i * 2.1), w = 0.035 + 0.04 * hash(i + 7), L = len * (0.6 + 0.4 * hash(i + 3));
    const g = ctx.createLinearGradient(x, y, x + Math.cos(ang) * L, y + Math.sin(ang) * L); g.addColorStop(0, `rgba(${col},${a * (0.5 + 0.5 * hash(i))})`); g.addColorStop(1, `rgba(${col},0)`);
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(ang - w) * L, y + Math.sin(ang - w) * L); ctx.lineTo(x + Math.cos(ang + w) * L, y + Math.sin(ang + w) * L); ctx.fill(); }
  ctx.restore();
};
/** sun disc with halo */
export const sun = (ctx: Ctx, x: number, y: number, r: number, col = "255,236,200") => { glow(ctx, x, y, r * 9, `rgba(${col},0.55)`, 0.8); glow(ctx, x, y, r * 3, `rgba(${col},1)`, 0.9); ctx.save(); ctx.fillStyle = `rgb(${col})`; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); ctx.restore(); };
/** gas cloud: yellow-green rolling puffs drifting along +x at world z band */
export const gas = (ctx: Ctx, cam: Cam, t: number, x0: number, z0: number, z1: number, front: number, a = 0.75, seed = 3) => {
  for (let i = 0; i < 46; i++) { const z = z0 + (z1 - z0) * hash(seed + i * 1.7), xx = x0 + front - hash(i + seed) * 26 + Math.sin(t * 0.6 + i) * 0.6, yy = 0.4 + hash(i * 3.3) * 1.6 + Math.sin(t * 0.8 + i * 1.3) * 0.2;
    if (xx < x0 - 2) continue; const [sx, sy, s] = P(cam, xx, yy, z); puff(ctx, sx, sy, (1.4 + hash(i + 9) * 1.6) * s, [150 + Math.round(hash(i) * 24), 162, 92], a * 0.7 * clamp((front - (x0 + front - xx)) / 4 + 1)); }
};
export const tint = (ctx: Ctx, col: string, a: number, op: GlobalCompositeOperation = "multiply") => {
  if (a <= 0) return; ctx.save(); ctx.globalCompositeOperation = op; ctx.globalAlpha = clamp(a); ctx.fillStyle = col; ctx.fillRect(0, 0, VW, VH); ctx.restore();
};
export const skyGrad = (ctx: Ctx, cam: Cam, top: string, hor: string) => {
  const hy = VH / 2 + (cam.shift ?? 0) + cam.y * 0, g = ctx.createLinearGradient(0, Math.min(0, hy - VH), 0, hy);
  g.addColorStop(0, top); g.addColorStop(1, hor); ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH);
};
