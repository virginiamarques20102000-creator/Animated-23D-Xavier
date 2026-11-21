// Shared cast, scene accumulator and effect helpers for the WWI film.
import { Outfit, FrontOpts, SideOpts } from "./toon";
import { Cam, Ctx, VW, VH, P, Act, drawAct, drawSprite, boom, muzzle, glow, puff, clamp, lerp, smooth, easeOut, hash, rng, WP, Sprite, bigText, caption } from "./engine";
import { SPR, MX, MY, C14, WX, WY, geoPts } from "./paint";

// ---------------- cast ----------------
const S = "#5a4a2e";
export const GER14: Outfit = { jacket: "#737a68", pants: "#5e6456", boots: "#1a1816", hat: "pickel", rifle: true, sash: "#3a2a1c" };
export const GER: Outfit = { jacket: "#6e7666", pants: "#5a6052", boots: "#1a1816", hat: "stahlhelm", cap: "#5f6a5c", rifle: true, sash: "#3a2a1c" };
export const GERN: Outfit = { ...GER, rifle: false };
export const BRI: Outfit = { jacket: "#8a7a4e", pants: "#7a6c44", boots: "#4a3a26", hat: "brodie", cap: "#6b6a46", rifle: true, sash: S };
export const BRIN: Outfit = { ...BRI, rifle: false };
export const BRI14: Outfit = { ...BRI, hat: "cap", cap: "#7a6c44" };
export const BOFF: Outfit = { ...BRI, rifle: false, hat: "peaked", cap: "#7a6c44", moustache: "#5a3a22", sash: "#6a4a2a" };
export const FR14: Outfit = { jacket: "#2e4a8a", pants: "#b8322a", boots: "#2a2420", hat: "kepi", cap: "#b8322a", rifle: true, sash: "#4a3a2a" };
export const FR: Outfit = { jacket: "#7a8eaa", pants: "#6e829e", boots: "#3a3028", hat: "adrian", cap: "#6f7f9a", rifle: true, sash: "#4a3a2a", moustache: "#4a3020" };
export const FRN: Outfit = { ...FR, rifle: false, moustache: undefined };
export const RUS: Outfit = { jacket: "#8a8456", pants: "#5e5a3e", boots: "#1e1a16", hat: "cap", cap: "#6a6440", rifle: true, sash: "#4a3a24" };
export const AUS: Outfit = { jacket: "#8a96a0", pants: "#7a868e", boots: "#1e1a16", hat: "kepi", cap: "#7a868e", rifle: true, sash: "#3a2a1c" };
export const SERB: Outfit = { jacket: "#6a6a4a", pants: "#5a5a40", boots: "#2a2018", hat: "cap", cap: "#5a5a3e", rifle: true, sash: "#3a2a1c" };
export const USA: Outfit = { jacket: "#8e7c50", pants: "#7e6e48", boots: "#5a4028", hat: "brodie", cap: "#6a6a40", rifle: true, sash: S };
export const OTT: Outfit = { jacket: "#a08c5e", pants: "#8a7a50", boots: "#4a3a26", hat: "fez", cap: "#9a8a5a", rifle: true, sash: S };
export const SEN: Outfit = { ...FR, hat: "fez", cap: "#c0302a", skin: "#8a5a3a", moustache: undefined };
export const IND: Outfit = { ...BRI, skin: "#b07a52", hat: "fez", cap: "#e8dcc0", beard: "#2a1d16", moustache: "#2a1d16" };
export const ANZ: Outfit = { ...BRI, hat: "fedora", cap: "#8a7a4e" };
export const CAN: Outfit = { ...BRI, skin: "#f5c9a0" };
export const KAISER: Outfit = { jacket: "#4e5648", pants: "#2a2a2e", boots: "#141414", hat: "peaked", cap: "#4a5040", moustache: "#3a2a1e", build: "stout", medals: true, buttons: "#c9a24a", sash: "#c9a24a" };
export const FRANZJ: Outfit = { jacket: "#e8e4da", pants: "#b8322a", boots: "#141414", hat: "hair", hair: "#e8e6e0", moustache: "#f0efea", beard: "#e8e6e0", build: "stout", medals: true, buttons: "#c9a24a", sash: "#2a8a4a" };
export const POINC: Outfit = { jacket: "#1e1c22", pants: "#1e1c22", boots: "#141414", hat: "tophat", beard: "#6a5a4a", moustache: "#6a5a4a", tie: "#f2efe6", sash: "#c0302a" };
export const GEORGE: Outfit = { jacket: "#26304a", pants: "#26304a", boots: "#141414", hat: "peaked", cap: "#26304a", beard: "#5a4030", moustache: "#5a4030", medals: true, buttons: "#c9a24a" };
export const NICK: Outfit = { jacket: "#8a8456", pants: "#2a2a2e", boots: "#141414", hat: "cap", cap: "#6a6440", beard: "#6a4a2a", moustache: "#6a4a2a", medals: true, buttons: "#c9a24a" };
export const FF: Outfit = { jacket: "#8aa8cc", pants: "#1e1e24", boots: "#141414", hat: "peaked", cap: "#2a3a4a", moustache: "#4a3020", build: "stout", medals: true, buttons: "#c9a24a", sash: "#c9a24a" };
export const SOPHIE: Outfit = { jacket: "#f2efe6", pants: "#f2efe6", boots: "#2a1e18", hat: "bonnet", hair: "#4a3020", dress: "#f2efe6" };
export const PRINCIP: Outfit = { jacket: "#3a3430", pants: "#2e2a26", boots: "#141210", hat: "hair", hair: "#2a1d16" };
export const POLICE: Outfit = { jacket: "#3a4a5a", pants: "#2e3a48", boots: "#141414", hat: "kepi", cap: "#2e3a48", sash: "#c9a24a" };
export const DIP: Outfit[] = [
  { jacket: "#2a2a30", pants: "#2a2a30", boots: "#141414", hat: "homburg", moustache: "#4a3a2a", tie: "#7a2a22" },
  { jacket: "#3a3430", pants: "#3a3430", boots: "#141414", hat: "hair", hair: "#8a8a8a", beard: "#8a8a8a", glasses: true, tie: "#2a3a5a" },
  { jacket: "#4a4038", pants: "#4a4038", boots: "#141414", hat: "tophat", moustache: "#2a1d16", tie: "#1e1a18" },
  { jacket: "#2e3440", pants: "#2e3440", boots: "#141414", hat: "hair", hair: "#3a2a1e", moustache: "#3a2a1e", tie: "#8a2a22" },
];
export const BOL: Outfit = { jacket: "#2a2826", pants: "#2a2826", boots: "#141414", hat: "cap", cap: "#2a2826", beard: "#6a4a2a", moustache: "#6a4a2a", sash: "#c0302a" };
export const MOM: Outfit = { jacket: "#5a4a6a", pants: "#5a4a6a", boots: "#2a1e18", hat: "longhair", hair: "#4a3020", dress: "#5a4a6a" };
export const KIDO: Outfit = { jacket: "#c0603a", pants: "#3a4a6a", boots: "#2a2a2a", hat: "hair", hair: "#5a3a22", build: "kid" };
export const KIDG: Outfit = { jacket: "#3e5a8a", pants: "#3e5a8a", boots: "#1e1a16", hat: "longhair", hair: "#8a5a32", dress: "#3e5a8a", build: "kid" };
export const NURSE: Outfit = { jacket: "#f2efe6", pants: "#f2efe6", boots: "#2a2a2a", hat: "bonnet", hair: "#6a4028", dress: "#f2efe6" };
export const POST: Outfit = { jacket: "#2e3a5a", pants: "#2e3a5a", boots: "#141414", hat: "kepi", cap: "#2e3a5a", sash: "#6a4a2a" };
const CIVS: Outfit[] = [0, 1, 2, 3, 4, 5, 6, 7].map((v) => {
  const j = ["#5a4a3a", "#4a4a52", "#6a5a48", "#3e3a36", "#5e5446", "#4e4232", "#6a6458", "#3a3a40"][v];
  if (v === 2 || v === 6) return { jacket: j, pants: j, boots: "#2a1e18", hat: "longhair", hair: ["#8a5a32", "#4a3020"][v % 2], dress: ["#7a5a6a", "#5a6a7a"][v % 2] };
  return { jacket: j, pants: "#2e2a28", boots: "#1e1a16", hat: v % 3 === 0 ? "fedora" : v === 5 ? "tophat" : "hair", hair: ["#3a2a1e", "#6a4a2a", "#2a2420", "#8a6a4a"][v % 4], tie: v % 2 ? "#5a2a24" : undefined, moustache: v === 1 || v === 5 ? "#3a2a1e" : undefined };
});
export const civ = (i: number) => CIVS[((i % 8) + 8) % 8];
export const mask = (o: Outfit): Outfit => ({ ...o, gasmask: true });

// ---------------- life ----------------
export const lid = (t: number, i: number) => { const per = 2.4 + 1.6 * hash(i), k = Math.floor(((t + hash(i + 3) * per) % per) * 30); return k < 4 ? [0.5, 1, 1, 0.5][k] : 0; };
export type FO = FrontOpts; export type SO = SideOpts;

// ---------------- scene accumulator ----------------
type Item = { z: number; d: () => void };
export class Sc {
  items: Item[] = []; overs: ((g: Ctx) => void)[] = []; lights: ((g: Ctx) => void)[] = [];
  constructor(public g: Ctx, public cam: Cam, public t: number) {}
  a(o: Outfit, id: number, x: number, z: number, f: FO = {}, extra: Partial<Act> = {}) { const t = this.t; this.items.push({ z, d: () => drawAct(this.g, this.cam, { o, id, x, z, f: { mode: "stand", blink: lid(t, id), ...f }, ...extra }) }); }
  s(o: Outfit, id: number, x: number, z: number, so: SO = {}, extra: Partial<Act> = {}) { const t = this.t; this.items.push({ z, d: () => drawAct(this.g, this.cam, { o, id, x, z, side: true, s: { mode: "stand", blink: lid(t, id), ...so }, ...extra }) }); }
  sp(k: string, x: number, y: number, z: number, o: Parameters<typeof drawSprite>[6] = {}) { this.items.push({ z, d: () => drawSprite(this.g, this.cam, SPR[k], x, y, z, o) }); }
  fx(z: number, d: (g: Ctx, c: Cam) => void) { this.items.push({ z, d: () => d(this.g, this.cam) }); }
  over(d: (g: Ctx) => void) { this.overs.push(d); }
  light(d: (g: Ctx) => void) { this.lights.push(d); }
}
export const C = (x: number, y: number, z: number, fov = 42, shift = 0): Cam => ({ x, y, z, fov, shift });
export const mv = (a: number[], b: number[], ease = smooth) => (u: number): Cam => { const k = ease(u); return C(lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k), lerp(a[3] ?? 42, b[3] ?? a[3] ?? 42, k), lerp(a[4] ?? 0, b[4] ?? a[4] ?? 0, k)); };
/** camera path through keys [u, cam[]] */
export const path = (keys: [number, number[]][]) => (u: number): Cam => { let i = 0; while (i < keys.length - 2 && u > keys[i + 1][0]) i++; const [u0, a] = keys[i], [u1, b] = keys[i + 1]; return mv(a, b)(clamp((u - u0) / (u1 - u0))); };

export const walkF = (A: Sc, o: Outfit, id: number, lt: number, t0: number, t1: number, p0: [number, number], p1: [number, number], f: FO = {}, extra: Partial<Act> = {}) => {
  const k = clamp((lt - t0) / (t1 - t0)), x = lerp(p0[0], p1[0], k), z = lerp(p0[1], p1[1], k), d = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]) * k;
  A.a(o, id, x, z, { mode: k > 0 && k < 1 ? "stroll" : "stand", phase: Math.round(((d / 1.5) % 1) * 24) / 24, ...f }, extra);
};
export const walkS = (A: Sc, o: Outfit, id: number, lt: number, x0: number, z: number, v: number, so: SO = {}, extra: Partial<Act> = {}) => {
  const x = x0 + v * lt, ph = Math.round(((Math.abs(v * lt) / 1.6 + hash(id)) % 1) * 24) / 24;
  A.s(o, id, x, z, { mode: "march", phase: ph, stride: Math.min(1.25, Math.abs(v) / 1.5), ...so }, { flip: v < 0, ...extra });
};
/** running: side view, faster cadence, forward lean */
export const runS = (A: Sc, o: Outfit, id: number, lt: number, x0: number, z: number, v: number, so: SO = {}, extra: Partial<Act> = {}) => {
  const x = x0 + v * lt, ph = Math.round(((Math.abs(v * lt) / 2.2 + hash(id)) % 1) * 24) / 24;
  A.s(o, id, x, z, { mode: "march", phase: ph, stride: 1.3, ...so }, { flip: v < 0, rot: (v > 0 ? 1 : -1) * 0.12, ...extra });
};
export const marchF = (A: Sc, o: Outfit, lt: number, rows: number, cols: number, z0: number, v: number, gapX = 1.25, gapZ = 1.6, id0 = 400, f: (r: number, c: number) => FO = () => ({}), extra: Partial<Act> = {}) => {
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) { const z = z0 + r * gapZ - lt * v; if (z < 0.6) continue; const x = (c - (cols - 1) / 2) * gapX; A.a(o, id0 + r * cols + c, x, z, { mode: "march", phase: ((lt * v) / 1.6 + (r % 2) * 0.5 + c * 0.03) % 1, expr: "stern", ...f(r, c) }, extra); }
};
export const marchCol = (A: Sc, o: Outfit | ((i: number) => Outfit), lt: number, n: number, x0: number, z: number, v: number, gap = 1.25, rows = 1, rowGap = 1.1, extra: Partial<Act> = {}, so: SO = {}) => {
  for (let r = 0; r < rows; r++) for (let i = 0; i < n; i++) walkS(A, typeof o === "function" ? o(i + r * n) : o, 40 + i + r * 30, lt, x0 - Math.sign(v) * i * gap, z + r * rowGap, v, so, extra);
};
export const crowd = (A: Sc, n: number, x0: number, x1: number, z0: number, z1: number, seed: number, f: (i: number) => FO = () => ({}), pick: (i: number) => Outfit = civ, extra: Partial<Act> = {}) => {
  for (let i = 0; i < n; i++) { const x = lerp(x0, x1, hash(seed + i * 7.1)), z = lerp(z0, z1, hash(seed + i * 3.7)); A.a(pick(i), 100 + i + seed, x, z, f(i), extra); }
};

// ---------------- effects ----------------
export const booms = (A: Sc, lt: number, list: [number, number, number, number?][]) => { list.forEach(([at, x, z, size], i) => A.fx(z, (g, c) => boom(g, c, lt - at, x, 0, z, size ?? 3, i + 3))); };
/** muddy foreground that buries everything below `top` (knee-deep mud) */
export const mudFront = (A: Sc, z: number, x0: number, x1: number, top: number, col = "#4a3a2a") => A.fx(z, (g, c) => {
  const [ax, ay] = P(c, x0, top, z), [bx, by] = P(c, x1, -2, z); g.fillStyle = col; g.beginPath(); g.moveTo(ax, ay);
  for (let k = 1; k <= 16; k++) { const x = lerp(x0, x1, k / 16), [px, py] = P(c, x, top + 0.04 * Math.sin(k * 2.7), z); g.lineTo(px, py); } g.lineTo(bx, by); g.lineTo(ax, by); g.closePath(); g.fill();
  g.strokeStyle = "#241726"; g.lineWidth = 3; g.stroke(); for (let k = 0; k < 14; k++) { const [px, py, s] = P(c, lerp(x0, x1, hash(k + 3)), top - 0.05 - hash(k) * 0.3, z); g.fillStyle = k % 2 ? "rgba(30,22,16,0.45)" : "rgba(140,120,90,0.35)"; g.beginPath(); g.ellipse(px, py, 0.14 * s, 0.04 * s, 0, 0, 7); g.fill(); }
});
/** illumination flare drifting down under a little parachute */
export const flare = (A: Sc, lt: number, at: number, x: number, z: number, col = "255,236,190") => A.light((g) => {
  const k = lt - at; if (k < 0 || k > 7) return; const y = k < 0.8 ? 2 + 22 * easeOut(k / 0.8) : 24 - (k - 0.8) * 2.2, [sx, sy, s] = P(A.cam, x + k * 0.4, y, z);
  const a = clamp(k / 0.3) * clamp((7 - k) / 1.5); glow(g, sx, sy, 18 * s, `rgba(${col},0.4)`, a * 0.9); glow(g, sx, sy, 3 * s, `rgba(${col},1)`, a); g.save(); g.globalAlpha = a; g.fillStyle = "#fff"; g.beginPath(); g.arc(sx, sy, Math.max(2, 0.25 * s), 0, 7); g.fill(); g.restore();
});
/** tracer bullets from (x0,y0,z0) towards (x1,y1,z1): `n` streaks, period `per` */
export const tracers = (A: Sc, lt: number, n: number, src: [number, number, number], dst: [number, number, number], per = 0.35, seed = 1, col = "255,220,140", t0 = -99, t1 = 99) => {
  if (lt < t0 || lt > t1) return;
  A.light((g) => { for (let i = 0; i < n; i++) { const k = ((lt + hash(seed + i) * per) % per) / per, j = (hash(seed + i * 3) - 0.5);
    const a = [lerp(src[0], dst[0], k) + j * 0.8, lerp(src[1], dst[1], k) + j * 0.4, lerp(src[2], dst[2], k)], b = [lerp(src[0], dst[0], k + 0.08) + j * 0.8, lerp(src[1], dst[1], k + 0.08) + j * 0.4, lerp(src[2], dst[2], k + 0.08)];
    const [ax, ay, s] = P(A.cam, a[0], a[1], a[2]), [bx, by] = P(A.cam, b[0], b[1], b[2]); g.save(); g.globalCompositeOperation = "lighter"; g.strokeStyle = `rgba(${col},0.9)`; g.lineWidth = Math.max(1.5, 0.05 * s); g.lineCap = "round"; g.beginPath(); g.moveTo(ax, ay); g.lineTo(bx, by); g.stroke(); g.restore(); } });
};
/** dirt spurts from bullets hitting the ground */
export const spurts = (A: Sc, lt: number, n: number, x0: number, x1: number, z0: number, z1: number, seed = 2) => {
  for (let i = 0; i < n; i++) { const per = 0.5 + hash(seed + i) * 0.6, k = ((lt + hash(i + seed * 3) * per) % per) / per, x = lerp(x0, x1, hash(i * 7 + Math.floor((lt + hash(i) * per) / per))), z = lerp(z0, z1, hash(i * 5 + 1));
    A.fx(z, (g, c) => { const [sx, sy, s] = P(c, x, 0.1 + k * 0.6, z); puff(g, sx, sy, (0.12 + k * 0.3) * s, [92, 74, 56], 0.85 * (1 - k)); }); }
};
export const muzzleAt = (A: Sc, lt: number, at: number[], x: number, y: number, z: number, size = 0.3, dir = 1) => { for (const t of at) if (lt > t && lt < t + 0.07) A.fx(z - 0.01, (g, c) => muzzle(g, c, x, y, z, size, dir)); };
/** fast-burst machine-gun muzzle (flicker) */
export const mgFire = (A: Sc, lt: number, x: number, y: number, z: number, t0 = 0, t1 = 99, dir = 1) => { if (lt < t0 || lt > t1) return; if (Math.floor(lt * 30) % 3 !== 2) A.fx(z - 0.01, (g, c) => muzzle(g, c, x, y, z, 0.28 + 0.08 * hash(Math.floor(lt * 30)), dir)); };
/** flies / dust motes buzzing around a point */
export const flies = (A: Sc, lt: number, x: number, y: number, z: number, n = 6) => A.fx(z - 0.02, (g, c) => { for (let i = 0; i < n; i++) { const [sx, sy, s] = P(c, x + 0.35 * Math.sin(lt * (5 + i) + i * 2), y + 0.25 * Math.cos(lt * (7 + i) + i), z); g.fillStyle = "#1e1a18"; g.beginPath(); g.arc(sx, sy, Math.max(1.5, 0.025 * s), 0, 7); g.fill(); } });
export const stretchLight = (A: Sc, x: number, y: number, z: number, r: number, col: string, a: number) => A.light((g) => { const [sx, sy, s] = P(A.cam, x, y, z); glow(g, sx, sy, r * s, col, a); });

// ---------------- maps ----------------
export const hl = (A: Sc, key: string, k: number, col = "#b3221c", a = 0.6) => { if (k <= 0) return; A.fx(-0.05, (g, c) => { const pts = geoPts(C14[key]); g.save(); g.globalAlpha = a * clamp(k); g.fillStyle = col; g.beginPath(); pts.forEach(([x, y], i) => { const [sx, sy] = P(c, x, y, 0); i ? g.lineTo(sx, sy) : g.moveTo(sx, sy); }); g.closePath(); g.fill(); g.globalAlpha = clamp(k); g.strokeStyle = col; g.lineWidth = 3; g.stroke(); g.restore(); }); };
export const arrow = (A: Sc, a: number[], b: number[], k: number, col: string, wid = 0.32, world = false) => {
  if (k <= 0) return; A.fx(-0.08, (g, c) => {
    const X = world ? WX : MX, Y = world ? WY : MY;
    const ax = X(a[0]), ay = Y(a[1]), bx = lerp(ax, X(b[0]), easeOut(k)), by = lerp(ay, Y(b[1]), easeOut(k)), mx = (ax + bx) / 2 - (by - ay) * 0.18, my = (ay + by) / 2 + (bx - ax) * 0.18;
    const [x0, y0, s] = P(c, ax, ay, 0), [x1, y1] = P(c, bx, by, 0), [x2, y2] = P(c, mx, my, 0);
    g.save(); g.strokeStyle = "rgba(20,12,10,0.35)"; g.lineWidth = wid * s + 6; g.lineCap = "round"; g.beginPath(); g.moveTo(x0, y0 + 4); g.quadraticCurveTo(x2, y2 + 4, x1, y1 + 4); g.stroke();
    g.strokeStyle = col; g.lineWidth = wid * s; g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo(x2, y2, x1, y1); g.stroke();
    const an = Math.atan2(y1 - y2, x1 - x2), h = wid * 2.2 * s; g.fillStyle = col; g.beginPath(); g.moveTo(x1 + Math.cos(an) * h, y1 + Math.sin(an) * h); g.lineTo(x1 + Math.cos(an + 2.4) * h, y1 + Math.sin(an + 2.4) * h); g.lineTo(x1 + Math.cos(an - 2.4) * h, y1 + Math.sin(an - 2.4) * h); g.fill(); g.restore();
  });
};
/** western-front line (North Sea to Switzerland) drawn up to fraction k */
export const FRONT = [2.6, 51.1, 2.9, 50.6, 2.8, 50.2, 3.2, 49.8, 3.0, 49.4, 3.8, 49.3, 4.6, 49.2, 5.4, 49.2, 5.8, 48.9, 6.3, 48.6, 6.9, 48.2, 7.1, 47.8, 7.2, 47.5];
export const frontLine = (A: Sc, k: number, shift = 0, col = "#7a1a14", zig = 0) => { if (k <= 0) return; A.fx(-0.07, (g, c) => {
  const n = FRONT.length / 2, m = Math.max(1, k * (n - 1)); g.save(); g.strokeStyle = col; g.lineWidth = 7; g.lineJoin = "round"; g.lineCap = "round"; g.beginPath();
  for (let i = 0; i <= Math.ceil(m); i++) { const j = Math.min(i, m), i0 = Math.floor(j), f = j - i0, i1 = Math.min(n - 1, i0 + 1);
    const lon = lerp(FRONT[i0 * 2], FRONT[i1 * 2], f) + shift, lat = lerp(FRONT[i0 * 2 + 1], FRONT[i1 * 2 + 1], f), [sx, sy] = P(c, MX(lon) + (zig ? Math.sin(i * 9) * zig : 0), MY(lat), 0); i ? g.lineTo(sx, sy) : g.moveTo(sx, sy); }
  g.stroke(); g.restore(); }); };
/** small icon pin (fire / crown / swords) on the map at lon/lat */
export const pin = (A: Sc, lon: number, lat: number, t: number, kind: "fire" | "x" | "dot" = "dot", world = false) => { if (t < 0) return; A.fx(-0.09, (g, c) => {
  const k = easeOut(clamp(t / 0.3)), [sx, sy, s] = P(c, world ? WX(lon) : MX(lon), world ? WY(lat) : MY(lat), 0);
  if (kind === "fire") { glow(g, sx, sy - 0.2 * s, 1.2 * s * k, "rgba(255,140,40,0.9)", 0.8); g.fillStyle = "#ffb03a"; g.beginPath(); g.ellipse(sx, sy - 0.25 * s * k, 0.22 * s * k, 0.38 * s * k, 0, 0, 7); g.fill(); g.fillStyle = "#fff0a0"; g.beginPath(); g.ellipse(sx, sy - 0.18 * s * k, 0.1 * s * k, 0.18 * s * k, 0, 0, 7); g.fill(); }
  else if (kind === "x") { g.strokeStyle = "#8a1a14"; g.lineWidth = 0.14 * s; g.lineCap = "round"; const r = 0.4 * s * k; g.beginPath(); g.moveTo(sx - r, sy - r); g.lineTo(sx + r, sy + r); g.moveTo(sx + r, sy - r); g.lineTo(sx - r, sy + r); g.stroke(); }
  else { g.fillStyle = "#b3221c"; g.strokeStyle = "#241726"; g.lineWidth = 3; g.beginPath(); g.arc(sx, sy, 0.3 * s * k, 0, 7); g.fill(); g.stroke(); }
}); };

// ---------------- extra sprites ----------------
const add = (k: string, sp: Sprite) => { SPR[k] = sp; };
add("cross", { key: "cross", w: 1.2, h: 1.4, ppm: 220, paint: (w) => { w.rect(-0.07, 0, 0.14, 1.2, "#f4f1ea", 2.5); w.rect(-0.38, 0.78, 0.76, 0.13, "#f4f1ea", 2.5); } });
add("grave", { key: "grave", w: 1.2, h: 1.6, ppm: 220, paint: (w) => { w.line([[0, 0], [0.08, 1.15]], 5, "#5a3a22"); w.line([[0.05, 0.6], [0.05, 1.1]], 2, "#8d949c"); w.ell(0.1, 1.18, 0.3, 0.2, "#5f6a5c", 2.5, 0, Math.PI); w.ell(0.1, 1.2, 0.36, 0.05, "#4e5a4c", 2); } });
add("helmet", { key: "helmetG", w: 0.8, h: 0.4, ppm: 400, paint: (w) => { w.ell(0, 0.02, 0.3, 0.2, "#6b6a46", 2.5, 0, Math.PI); w.ell(0, 0.02, 0.38, 0.05, "#5a5a3a", 2); } });
add("xmas", { key: "xmas", w: 1.4, h: 2, ppm: 260, paint: (w) => { w.rect(-0.08, 0, 0.16, 0.25, "#6a4426", 2); for (let k = 0; k < 4; k++) w.poly([[-0.6 + k * 0.12, 0.25 + k * 0.38], [0.6 - k * 0.12, 0.25 + k * 0.38], [0, 0.75 + k * 0.38]], "#2f6b4a", 2.5);
  for (const [x, y, c] of [[-0.3, 0.45, "#c0302a"], [0.25, 0.7, "#e8c24a"], [-0.1, 1.05, "#2a5a9a"], [0.15, 1.3, "#c0302a"]] as [number, number, string][]) w.ell(x, y, 0.06, 0.06, c, 1.5); w.poly([[0, 1.95], [0.08, 1.8], [-0.08, 1.8]], "#ffd84a", 1.5); } });
add("shell", { key: "shellA", w: 0.5, h: 1.1, ppm: 300, paint: (w) => { w.rect(-0.14, 0, 0.28, 0.62, "#c9a24a", 2.5); w.poly([[-0.14, 0.62], [0.14, 0.62], [0.1, 0.85], [0, 0.98], [-0.1, 0.85]], "#6a6e70", 2.5); w.rect(-0.15, 0.08, 0.3, 0.05, "#8a6a2a", 1); } });
add("crate", { key: "crate", w: 1.4, h: 1.2, ppm: 220, paint: (w) => { w.rect(-0.55, 0, 1.1, 0.9, "#9a7a4a", 2.5); w.line([[-0.55, 0], [0.55, 0.9]], 2, "#6a4a2a"); w.line([[-0.55, 0.9], [0.55, 0]], 2, "#6a4a2a"); w.text("USA", 0, 0.45, 0.2, "#2a1d16"); } });
add("portrait", { key: "portrait", w: 1.6, h: 2, ppm: 220, paint: (w) => { w.rect(-0.65, 0, 1.3, 1.7, "#c9a24a", 3); w.rect(-0.52, 0.13, 1.04, 1.44, "#5a6a5a", 2); w.ell(0, 1.0, 0.28, 0.32, "#f0d2b0", 2); w.ell(0, 0.78, 0.24, 0.16, "#6a4a2a", 0); w.rect(-0.42, 0.13, 0.84, 0.5, "#8a8456", 2); } });
add("money", { key: "money", w: 1.2, h: 1, ppm: 260, paint: (w) => { for (let k = 0; k < 6; k++) w.rect(-0.4 + (k % 2) * 0.05, k * 0.12, 0.8, 0.11, "#9ab08a", 1.6); w.ell(0.5, 0.2, 0.22, 0.22, "#d9b24a", 2); w.text("M", 0.5, 0.2, 0.16, "#7a5a1a"); } });
add("cylinder", { key: "cyl", w: 0.6, h: 1.4, ppm: 300, paint: (w) => { w.rect(-0.13, 0, 0.26, 1.05, "#5a6a5a", 2.5); w.ell(0, 1.05, 0.13, 0.06, "#4a5a4a", 2); w.rect(-0.04, 1.05, 0.08, 0.14, "#2a2a2a", 1.5); w.line([[0, 1.18], [0.25, 1.3]], 3, "#2a2a2a"); } });
add("stretcher", { key: "stretch", w: 2.4, h: 0.8, ppm: 200, paint: (w) => { w.rect(-1.0, 0.3, 2.0, 0.1, "#e8e0c8", 2); w.line([[-1.15, 0.35], [1.15, 0.35]], 3, "#5a3a22"); w.ell(-0.75, 0.48, 0.14, 0.12, "#f0d2b0", 2); w.rect(-0.6, 0.4, 1.3, 0.14, "#7a7458", 2); } });
add("ladder", { key: "ladder", w: 1, h: 2.6, ppm: 200, paint: (w) => { for (const x of [-0.25, 0.25]) w.line([[x, 0], [x, 2.5]], 3.5, "#6a4a2a"); for (let y = 0.3; y < 2.5; y += 0.4) w.line([[-0.25, y], [0.25, y]], 3, "#6a4a2a"); } });
add("chairE", { key: "chairE", w: 1, h: 1.2, ppm: 300, paint: (w) => { w.rect(-0.3, 0.42, 0.6, 0.07, "#4a3424", 2.5); w.rect(-0.3, 0.49, 0.07, 0.6, "#4a3424", 2.5); w.rect(-0.3, 0, 0.06, 0.42, "#3a2618", 2); w.rect(0.24, 0, 0.06, 0.42, "#3a2618", 2); } });

// ---------------- overlays ----------------
const FONT = `"DejaVu Serif", serif`;
export const chapter = (g: Ctx, n: string, title: string, t: number, dur: number) => {
  if (t < 0 || t > dur) return; const a = clamp(t / 0.4) * clamp((dur - t) / 0.4), w = 700 * easeOut(clamp((t - 0.15) / 0.7));
  g.save(); g.globalAlpha = a * 0.55; g.fillStyle = "#120a08"; g.fillRect(0, VH * 0.36, VW, VH * 0.3); g.restore();
  g.save(); g.globalAlpha = a; g.strokeStyle = "#e8c46a"; g.lineWidth = 3; g.beginPath(); g.moveTo(VW / 2 - w, VH * 0.43); g.lineTo(VW / 2 + w, VH * 0.43); g.moveTo(VW / 2 - w, VH * 0.6); g.lineTo(VW / 2 + w, VH * 0.6); g.stroke();
  g.textAlign = "center"; g.textBaseline = "middle"; g.font = `bold 44px ${FONT}`; g.fillStyle = "#e8c46a"; g.fillText(n, VW / 2, VH * 0.395); g.restore();
  bigText(g, title, t - 0.25, dur - 0.25, VH * 0.515, Math.min(84, Math.floor(1560 / (title.length * 0.74))), "#f7eedc");
};
/** tear-off calendar page in the corner */
export const calendar = (g: Ctx, top: string, big: string, t: number, x = VW - 300, y = 120, flipAt = -1) => {
  if (t < 0) return; const k = flipAt >= 0 ? clamp((t - flipAt) / 0.18) : 0;
  g.save(); g.translate(x, y); g.fillStyle = "rgba(0,0,0,0.25)"; g.fillRect(10, 12, 220, 250);
  g.fillStyle = "#f4ecd8"; g.strokeStyle = "#241726"; g.lineWidth = 4; g.fillRect(0, 0, 220, 250); g.strokeRect(0, 0, 220, 250); g.fillStyle = "#b3221c"; g.fillRect(0, 0, 220, 64); g.strokeRect(0, 0, 220, 64);
  g.fillStyle = "#fff"; g.font = `bold 34px ${FONT}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(top, 110, 34); g.fillStyle = "#2a1d16"; g.font = `bold 96px ${FONT}`; g.fillText(big, 110, 160);
  if (k > 0 && k < 1) { g.save(); g.translate(110, 0); g.scale(1, 1 - k); g.fillStyle = "#efe4cc"; g.fillRect(-110, 0, 220, 250); g.restore(); }
  g.restore();
};
/** counting number, bottom centre */
export const counter = (g: Ctx, n: number, unit: string, t: number, dur: number, y = VH * 0.82, col = "#f7eedc", size = 92) => {
  if (t < 0 || t > dur) return; const a = clamp(t / 0.3) * clamp((dur - t) / 0.4);
  g.save(); g.globalAlpha = a; g.textAlign = "center"; g.textBaseline = "middle"; g.font = `bold ${size}px ${FONT}`; g.lineWidth = size * 0.12; g.strokeStyle = "rgba(20,12,14,0.9)"; g.lineJoin = "round";
  const s = Math.round(n).toLocaleString("pt-BR"); g.strokeText(s, VW / 2, y); g.fillStyle = col; g.fillText(s, VW / 2, y);
  g.font = `bold ${Math.round(size * 0.42)}px ${FONT}`; g.lineWidth = size * 0.07; g.strokeText(unit, VW / 2, y + size * 0.78); g.fillStyle = "#e8c46a"; g.fillText(unit, VW / 2, y + size * 0.78); g.restore();
};
/** wall clock face overlay with hands: hours h (0-12) */
export const clockFace = (g: Ctx, cx: number, cy: number, r: number, h: number, a = 1) => {
  g.save(); g.globalAlpha = a; g.fillStyle = "rgba(0,0,0,0.3)"; g.beginPath(); g.arc(cx + 8, cy + 10, r, 0, 7); g.fill();
  g.fillStyle = "#f6eedb"; g.strokeStyle = "#2a1d16"; g.lineWidth = r * 0.07; g.beginPath(); g.arc(cx, cy, r, 0, 7); g.fill(); g.stroke();
  g.lineWidth = r * 0.03; for (let k = 0; k < 12; k++) { const an = (k / 12) * Math.PI * 2; g.beginPath(); g.moveTo(cx + Math.sin(an) * r * 0.8, cy - Math.cos(an) * r * 0.8); g.lineTo(cx + Math.sin(an) * r * 0.92, cy - Math.cos(an) * r * 0.92); g.stroke(); }
  g.font = `bold ${Math.round(r * 0.2)}px ${FONT}`; g.fillStyle = "#2a1d16"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("XI", cx + Math.sin(-Math.PI / 6) * r * 0.62, cy - Math.cos(-Math.PI / 6) * r * 0.62); g.fillText("XII", cx, cy - r * 0.62);
  const ha = (h / 12) * Math.PI * 2, ma = ((h * 60) % 60) / 60 * Math.PI * 2; g.lineCap = "round";
  g.lineWidth = r * 0.07; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.sin(ha) * r * 0.5, cy - Math.cos(ha) * r * 0.5); g.stroke();
  g.lineWidth = r * 0.045; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.sin(ma) * r * 0.78, cy - Math.cos(ma) * r * 0.78); g.stroke();
  g.fillStyle = "#b3221c"; g.beginPath(); g.arc(cx, cy, r * 0.06, 0, 7); g.fill(); g.restore();
};
/** balance scale overlay: tilt -1..1 (positive = right pan down) */
export const scales = (g: Ctx, cx: number, cy: number, s: number, tilt: number, a = 1, lab: [string, string] = ["", ""]) => {
  g.save(); g.globalAlpha = a; g.translate(cx, cy); g.strokeStyle = "#2a1d16"; g.fillStyle = "#d9b24a"; g.lineWidth = 6;
  g.fillRect(-12, 0, 24, 260 * s); g.strokeRect(-12, 0, 24, 260 * s); g.beginPath(); g.ellipse(0, 260 * s, 90 * s, 20 * s, 0, 0, 7); g.fill(); g.stroke();
  const an = tilt * 0.35; g.rotate(an); g.fillRect(-260 * s, -8, 520 * s, 16); g.strokeRect(-260 * s, -8, 520 * s, 16); g.rotate(-an);
  for (const sd of [-1, 1]) { const px = Math.cos(an) * 250 * s * sd, py = Math.sin(an) * 250 * s * sd; g.beginPath(); g.moveTo(px, py); g.lineTo(px - 70 * s, py + 130 * s); g.moveTo(px, py); g.lineTo(px + 70 * s, py + 130 * s); g.stroke();
    g.beginPath(); g.ellipse(px, py + 130 * s, 90 * s, 22 * s, 0, 0, Math.PI); g.fill(); g.stroke();
    g.font = `bold ${Math.round(40 * s)}px ${FONT}`; g.textAlign = "center"; g.fillStyle = "#f7eedc"; g.lineWidth = 6; g.strokeText(lab[sd < 0 ? 0 : 1], px, py + 200 * s); g.fillText(lab[sd < 0 ? 0 : 1], px, py + 200 * s); g.fillStyle = "#d9b24a"; }
  g.beginPath(); g.arc(0, 0, 16, 0, 7); g.fill(); g.stroke(); g.restore();
};
export { caption, bigText };
