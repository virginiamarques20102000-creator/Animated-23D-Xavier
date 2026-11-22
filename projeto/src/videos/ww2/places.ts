// Scene builders for the WW2 film: every shot composes its own place (own key, own palette) from these painted layers.
import { WP, Layer, Ground, rng } from "./engine";
import { Loc, Lr, facade, tree, deadTree, mountains, hills, row, church, barbed, emblem, MX, MY, WX, WY } from "./paint";
import { mix, shade } from "./toon";
import { geoP, R39, MAPCOL } from "./kit";
import { C14 } from "./paint";
export type { Loc };
export const loc = (sky: [string, string] | undefined, ground: Ground, layers: Layer[], interior = false): Loc => ({ sky, ground, layers, interior });

// ---------------- far / mid layers ----------------
export const mtn = (K: string, z: number, col: string, seed: number, h = 60, snow = true, blur = 2, wid = 2.6) => Lr(K + "mt" + z, z, -z * wid, z * wid, -5, h * 1.25, Math.max(1.2, 300 / z), (w) => mountains(w, -z * wid, z * wid, 0, h, col, seed, snow), blur);
export const hillL = (K: string, z: number, col: string, seed: number, h = 10, blur = 1, wid = 2.2, ink = 3) => Lr(K + "hl" + z, z, -z * wid, z * wid, -5, h * 1.3, Math.max(2, 400 / z), (w) => hills(w, -z * wid, z * wid, h, col, seed, ink), blur);
export const clouds = (K: string, z: number, cols: [string, string], seed: number, y0 = 30, y1 = 90, n = 26, blur = 3, wid = 2.4) => Lr(K + "cl" + z, z, -z * wid, z * wid, y0 - 20, y1 + 30, Math.max(1, 220 / z), (w) => {
  const r = rng(seed); for (let i = 0; i < n; i++) { const cx = (r() * 2 - 1) * z * wid, cy = y0 + r() * (y1 - y0), s = 6 + r() * 16;
    for (let k = 0; k < 6; k++) { const ox = (k - 2.5) * s * 0.45, oy = Math.sin(k * 1.7) * s * 0.18, rr = s * (0.45 + 0.25 * Math.sin(k * 2.3 + i)); w.ell(cx + ox, cy + oy, rr, rr * 0.7, w.vgrad(cy + oy - rr, cy + oy + rr, cols[1], cols[0]), 0); } } }, blur);
/** generic city row of facades (uses the painted facade with windows, doors, roofs) */
export const city = (K: string, z: number, o: { pal: string[]; floors?: [number, number]; hgt?: [number, number]; roof?: "gable" | "hip" | "flat"; seed: number; ruin?: boolean; lit?: number; snow?: boolean; dark?: number; win?: string; roofCol?: string; gap?: [number, number]; x0?: number; x1?: number; blur?: number; banner?: boolean; shutter?: string; poster?: boolean }) =>
  Lr(K + "ci" + z, z, o.x0 ?? -z * 1.4 - 10, o.x1 ?? z * 1.4 + 10, -1, (o.hgt?.[1] ?? 14) + 12, Math.max(6, Math.min(40, 700 / z)), (w) => row(w, o.x0 ?? -z * 1.4 - 10, o.x1 ?? z * 1.4 + 10, { floors: [3, 5], hgt: [10, 14], roof: "flat", ...o }), o.blur);
/** distant landmark skyline silhouettes */
export const skyline = (K: string, z: number, col: string, kind: "london" | "paris" | "berlin" | "moscow" | "tokyo" | "rome" | "generic" | "stalingrad" | "hiroshima", seed = 3, blur = 1.5, lit = "") => Lr(K + "sk" + z + kind, z, -z * 1.6, z * 1.6, -2, z * 0.5, Math.max(2, 500 / z), (w) => {
  const r = rng(seed), X = z * 1.6, top = (h: number) => h;
  const ruin = kind === "stalingrad" || kind === "hiroshima";
  for (let x = -X; x < X;) { const wd = 6 + r() * 12, h = (ruin ? 4 + r() * 14 : 8 + r() * 22) * (kind === "tokyo" ? 0.45 : 1); if (ruin) { const pts = [[x, 0], [x + wd, 0]]; for (let k = 5; k >= 0; k--) pts.push([x + (wd * k) / 5, h * (0.3 + 0.7 * r())]); w.poly(pts, col, 2.5); for (let k = 0; k < 4; k++) w.rect(x + wd * (0.15 + 0.2 * k), h * 0.2 + r() * h * 0.3, wd * 0.08, h * 0.1, mix(col, "#000000", 0.5), 0); }
    else { w.rect(x, 0, wd, top(h), col, 2.5); if (lit) for (let k = 0; k < 6; k++) if (r() < 0.5) w.rect(x + r() * wd * 0.8, r() * h * 0.8, 0.9, 1.2, lit, 0);
      if (kind === "tokyo") w.poly([[x - 1, h], [x + wd + 1, h], [x + wd / 2, h + wd * 0.35]], shade(col, 0.85), 2.5); else if (r() < 0.3) w.poly([[x, h], [x + wd, h], [x + wd / 2, h + wd * 0.4]], col, 2.5); }
    x += wd + r() * 2; }
  const L = (fn: () => void) => fn();
  if (kind === "london") L(() => { const cx = 18; w.rect(cx - 9, 0, 18, 26, col, 2.5); w.rect(cx - 5, 26, 10, 8, col, 2.5); w.ell(cx, 34, 6.5, 8, col, 2.5, 0, Math.PI); w.rect(cx - 0.6, 41.5, 1.2, 5, col, 2); w.rect(-28, 0, 5, 58, col, 2.5); w.poly([[-28.6, 58], [-22.4, 58], [-25.5, 66]], col, 2.5); w.ell(-25.5, 50, 1.8, 1.8, lit || mix(col, "#ffffff", 0.2), 1.5); });
  if (kind === "paris") L(() => { const cx = -12; w.poly([[cx - 14, 0], [cx - 4, 18], [cx - 1.6, 48], [cx - 0.5, 72], [cx + 0.5, 72], [cx + 1.6, 48], [cx + 4, 18], [cx + 14, 0], [cx + 9, 0], [cx + 2.6, 13], [cx - 2.6, 13], [cx - 9, 0]], col, 2.5); w.rect(cx - 6, 17, 12, 1.4, col, 2); w.rect(cx - 2.8, 46, 5.6, 1.2, col, 2); w.line([[cx, 72], [cx, 78]], 2.5, col); w.rect(26, 0, 22, 18, col, 2.5); w.ell(37, 18, 6, 7, col, 2.5, 0, Math.PI); });
  if (kind === "berlin") L(() => { const cx = 14; w.rect(cx - 16, 0, 32, 16, col, 2.5); w.rect(cx - 6, 16, 12, 6, col, 2.5); w.ell(cx, 22, 6, 7, col, 2.5, 0, Math.PI); for (const dx of [-15, 15]) w.rect(cx + dx - 2, 0, 4, 20, col, 2.5); w.rect(-34, 0, 16, 14, col, 2.5); for (let k = 0; k < 6; k++) w.rect(-33.4 + k * 2.8, 0, 1.2, 12, mix(col, "#000", 0.25), 0); w.rect(-35, 14, 18, 2.4, col, 2.5); w.rect(-28, 16.4, 4, 2.4, col, 2); });
  if (kind === "moscow") L(() => { for (const [cx, h] of [[-20, 26], [-12, 34], [-4, 24]] as [number, number][]) { w.rect(cx - 2.5, 0, 5, h, col, 2.5); w.ell(cx, h + 2.6, 3.4, 3.8, col, 2.5); w.poly([[cx - 1, h + 6], [cx + 1, h + 6], [cx, h + 9]], col, 2); } w.rect(10, 0, 6, 44, col, 2.5); w.poly([[9.4, 44], [16.6, 44], [13, 54]], col, 2.5); });
  if (kind === "rome") L(() => { const cx = 10; w.rect(cx - 14, 0, 28, 14, col, 2.5); w.ell(cx, 14, 9, 12, col, 2.5, 0, Math.PI); w.rect(cx - 1, 26, 2, 4, col, 2); w.ell(-26, 10, 12, 10, col, 2.5); for (let k = 0; k < 6; k++) w.rect(-35 + k * 3.4, 4, 1.6, 5, mix(col, "#000", 0.35), 0); });
  if (kind === "hiroshima") L(() => { const cx = 6; w.rect(cx - 8, 0, 16, 10, col, 2.5); w.rect(cx - 4, 10, 8, 4, col, 2.5); for (let k = 0; k <= 8; k++) { const a = Math.PI * (k / 8); w.line([[cx, 14], [cx + Math.cos(a) * 4.6, 14 + Math.sin(a) * 5]], 1.8, col); } w.ell(cx, 14, 4.6, 5, null, 2, 0, Math.PI);
    for (let k = 0; k < 5; k++) w.rect(cx - 7 + k * 3, 2, 1.4, 3, mix(col, "#000", 0.5), 0); });
}, blur);
/** tree belts */
export const forest = (K: string, z: number, kind: "pine" | "birch" | "palm" | "poplar" | "oak" | "dead" | "cherry", col: string, n: number, seed: number, o: { blur?: number; snow?: boolean; h?: number; wid?: number; y?: number } = {}) => {
  const X = (o.wid ?? 1.5) * z + 8, H = o.h ?? 12;
  return Lr(K + "fo" + z + kind, z, -X, X, -1, H * 1.4 + (o.y ?? 0), Math.max(5, Math.min(40, 600 / z)), (w) => { const r = rng(seed);
    for (let i = 0; i < n; i++) { const x = -X + ((i + r() * 0.8) / n) * 2 * X, h = H * (0.7 + r() * 0.5), y = o.y ?? 0;
      if (kind === "pine") { w.poly([[x - h * 0.02, y], [x + h * 0.02, y], [x + h * 0.015, y + h * 0.3], [x - h * 0.015, y + h * 0.3]], "#4a3426", 2); for (let k = 0; k < 4; k++) { const yy = y + h * (0.2 + k * 0.2), ww = h * (0.28 - k * 0.055); w.poly([[x - ww, yy], [x + ww, yy], [x, yy + h * 0.32]], mix(col, "#000000", 0.08 * (3 - k)), 2.5); if (o.snow) w.poly([[x - ww * 0.6, yy + h * 0.1], [x, yy + h * 0.32], [x + ww * 0.5, yy + h * 0.12], [x, yy + h * 0.2]], "#f2f6f8", 1.5); } }
      else if (kind === "birch") { w.poly([[x - h * 0.018, y], [x + h * 0.018, y], [x + h * 0.01, y + h], [x - h * 0.01, y + h]], "#eeeae2", 2); for (let k = 0; k < 6; k++) w.rect(x - h * 0.015, y + h * (0.1 + k * 0.14), h * 0.02, h * 0.012, "#2a2624", 0); if (!o.snow) for (let k = 0; k < 4; k++) w.ell(x + (r() - 0.5) * h * 0.25, y + h * (0.65 + r() * 0.3), h * 0.12, h * 0.1, col, 2); }
      else if (kind === "palm") { const lean = (r() - 0.5) * h * 0.2; w.line([[x, y], [x + lean * 0.5, y + h * 0.5], [x + lean, y + h]], Math.max(3, h * 0.8), "#6a4a30"); for (let k = 0; k < 7; k++) { const a = (k / 7) * Math.PI * 2; w.line([[x + lean, y + h], [x + lean + Math.cos(a) * h * 0.3, y + h + Math.sin(a) * h * 0.1 - h * 0.08], [x + lean + Math.cos(a) * h * 0.42, y + h - h * 0.16]], Math.max(3, h * 0.6), mix(col, "#000000", 0.1 * (k % 2))); } }
      else if (kind === "poplar") { w.rect(x - h * 0.015, y, h * 0.03, h * 0.25, "#4a3426", 2); w.ell(x, y + h * 0.6, h * 0.12, h * 0.42, col, 2.5); w.ell(x - h * 0.03, y + h * 0.66, h * 0.05, h * 0.3, "rgba(255,255,220,0.14)", 0); }
      else if (kind === "dead") deadTree(w, x, h, i + seed);
      else if (kind === "cherry") { w.line([[x, y], [x + h * 0.05, y + h * 0.5]], Math.max(3, h * 0.5), "#4a3028"); for (let k = 0; k < 6; k++) w.ell(x + (r() - 0.5) * h * 0.5, y + h * (0.5 + r() * 0.35), h * 0.16, h * 0.12, k % 2 ? col : mix(col, "#ffffff", 0.3), 2); }
      else tree(w, x, h, col, i + seed, y); } }, o.blur);
};
/** interior back wall with optional windows (light), panels, maps, portrait */
export const wall = (K: string, z: number, col: string, o: { h?: number; wid?: number; win?: number; winCol?: string; panel?: string; floorLine?: string; map?: boolean; frames?: number; curtain?: string; brick?: boolean; tile?: boolean; pipes?: boolean; arch?: boolean; blur?: number; lamps?: number } = {}) => {
  const W = o.wid ?? 14, H = o.h ?? 6;
  return Lr(K + "wa" + z, z, -W, W, -0.5, H + 1, Math.max(25, Math.min(80, 800 / z)), (w) => {
    w.rect(-W, 0, 2 * W, H, w.vgrad(0, H, shade(col, 0.82), mix(col, "#ffffff", 0.08)), 3);
    if (o.brick) for (let y = 0; y < H; y += 0.25) for (let x = -W + ((y / 0.25) % 2) * 0.25; x < W; x += 0.5) w.rect(x, y, 0.48, 0.23, null, 0.8);
    if (o.tile) for (let y = 0; y < H * 0.45; y += 0.3) w.line([[-W, y], [W, y]], 1, "rgba(0,0,0,0.15)");
    if (o.panel) { w.rect(-W, 0, 2 * W, 1.1, o.panel, 2.5); for (let x = -W + 0.6; x < W; x += 1.6) w.rect(x, 0.15, 1.2, 0.8, null, 1.5); }
    for (let i = 0; i < (o.win ?? 0); i++) { const n = o.win!, x = -W + ((i + 0.5) / n) * 2 * W, ww = Math.min(2.6, (W * 2) / n * 0.45);
      if (o.arch) { w.rect(x - ww / 2, 1.2, ww, H * 0.55, w.vgrad(1.2, 1.2 + H * 0.55, o.winCol ?? "#cfe0ea", "#ffffff"), 3); w.ell(x, 1.2 + H * 0.55, ww / 2, ww * 0.5, o.winCol ?? "#e8f0f4", 3, 0, Math.PI); }
      else w.rect(x - ww / 2, 1.3, ww, H * 0.5, w.vgrad(1.3, 1.3 + H * 0.5, o.winCol ?? "#cfe0ea", "#ffffff"), 3);
      w.line([[x, 1.3], [x, 1.3 + H * 0.5]], 2.5, shade(col, 0.6)); w.line([[x - ww / 2, 1.3 + H * 0.3], [x + ww / 2, 1.3 + H * 0.3]], 2.5, shade(col, 0.6));
      if (o.curtain) { w.poly([[x - ww / 2 - 0.5, 1.0], [x - ww / 2 + 0.2, 1.0], [x - ww / 2, H * 0.9], [x - ww / 2 - 0.6, H * 0.9]], o.curtain, 2.5); w.poly([[x + ww / 2 + 0.5, 1.0], [x + ww / 2 - 0.2, 1.0], [x + ww / 2, H * 0.9], [x + ww / 2 + 0.6, H * 0.9]], o.curtain, 2.5); } }
    for (let i = 0; i < (o.frames ?? 0); i++) { const x = -W * 0.6 + i * 3.1; w.rect(x - 0.6, H * 0.45, 1.2, 1.5, "#c9a24a", 2.5); w.rect(x - 0.45, H * 0.45 + 0.15, 0.9, 1.2, ["#6a7a6a", "#7a6a5a", "#5a6a7a"][i % 3], 1.5); }
    if (o.map) { w.rect(-2.6, H * 0.32, 5.2, 3.2, "#d8cca8", 3); for (const a of [C14.FR, C14.ITA, C14.UK, R39.GER, R39.POL]) w.poly(a.reduce((p: number[][], _v, i) => (i % 2 ? p : [...p, [a[i] * 0.16 - 2.2, (a[i + 1] - 44) * 0.18 + H * 0.32]]), []), "#c4b48a", 1.4); }
    if (o.pipes) for (let k = 0; k < 3; k++) w.line([[-W, H - 0.4 - k * 0.25], [W, H - 0.4 - k * 0.25]], 5, shade(col, 0.55));
    for (let i = 0; i < (o.lamps ?? 0); i++) { const x = -W * 0.7 + (i * 1.4 * W) / Math.max(1, (o.lamps ?? 1) - 1); w.line([[x, H], [x, H - 0.8]], 2); w.poly([[x - 0.3, H - 0.8], [x + 0.3, H - 0.8], [x + 0.15, H - 0.55], [x - 0.15, H - 0.55]], "#3a3a30", 2); }
    if (o.floorLine) w.rect(-W, 0, 2 * W, 0.12, o.floorLine, 0);
  }, o.blur);
};
/** bunting / banners hanging across a hall (abstract eagle emblem, no swastika) */
export const banners = (K: string, z: number, n: number, wid: number, top: number, hgt: number, col = "#b3221c") => Lr(K + "bn" + z, z, -wid, wid, top - hgt - 2, top + 0.5, Math.max(20, 600 / z), (w) => {
  for (let i = 0; i < n; i++) { const cx = -wid + ((i + 0.5) / n) * 2 * wid, bw = Math.min(2.4, ((wid * 2) / n) * 0.55); w.poly([[cx - bw / 2, top], [cx + bw / 2, top], [cx + bw / 2, top - hgt], [cx - bw / 2, top - hgt]], w.vgrad(top - hgt, top, shade(col, 0.7), col), 2.5);
    w.line([[cx - bw * 0.3, top], [cx - bw * 0.3, top - hgt]], 3, "rgba(0,0,0,0.18)"); emblem(w, cx, top - hgt * 0.3, bw * 0.34); } });
/** ruined walls with broken windows (Stalingrad, Berlin 1945) */
export const ruins = (K: string, z: number, pal: string[], seed: number, o: { hgt?: [number, number]; blur?: number; snow?: boolean; fire?: boolean; x0?: number; x1?: number } = {}) => city(K + "r", z, { pal, seed, ruin: true, floors: [3, 6], hgt: o.hgt ?? [9, 18], blur: o.blur, snow: o.snow, x0: o.x0, x1: o.x1 });
/** chalk cliffs (Dover) */
export const cliffs = (K: string, z: number, col: string, top: string, seed: number, h = 30, blur = 1) => Lr(K + "cf" + z, z, -z * 2, z * 2, -2, h + 8, Math.max(2, 300 / z), (w) => { const r = rng(seed), pts = [[-z * 2, -2]]; for (let x = -z * 2; x <= z * 2; x += 6) pts.push([x, h * (0.75 + 0.25 * r())]); pts.push([z * 2, -2]); w.poly(pts, w.vgrad(0, h, shade(col, 0.82), col), 3);
  for (let x = -z * 2; x < z * 2; x += 9 + r() * 6) w.line([[x, h * 0.9], [x + 2, h * 0.3], [x + 1, 0]], 2, "rgba(120,110,100,0.35)"); const tp = pts.slice(1, -1).map(([x, y]) => [x, y + 1.2]); w.poly([...pts.slice(1, -1), ...tp.reverse()], top, 2); }, blur);
export const dunes = (K: string, z: number, col: string, seed: number, h = 6, blur = 1) => Lr(K + "du" + z, z, -z * 2, z * 2, -2, h * 1.6, Math.max(2, 300 / z), (w) => { const r = rng(seed); for (let k = 0; k < 3; k++) { const pts = [[-z * 2, -2]], hh = h * (1 - k * 0.25); for (let i = 0; i <= 30; i++) { const x = -z * 2 + (i / 30) * z * 4; pts.push([x, hh * (0.5 + 0.5 * Math.sin(i * 0.9 + seed + k * 2) * Math.sin(i * 0.31 + k)) + r() * 0.2]); } pts.push([z * 2, -2]); w.poly(pts, mix(col, k ? "#ffffff" : "#8a6a3a", 0.12 * (k ? k : 1)), 2); } }, blur);
/** row-crop field band near the ground (wheat, sunflowers, poppies) */
export const field = (K: string, z: number, kind: "wheat" | "sunflower" | "grass" | "reeds", col: string, seed: number, h = 1.2, wid = 30, blur = 0) => Lr(K + "fd" + z + kind, z, -wid, wid, -0.5, h * 1.6, Math.max(20, 900 / z), (w) => { const r = rng(seed);
  w.rect(-wid, -0.5, 2 * wid, h * 0.6 + 0.5, shade(col, 0.6), 0);
  for (let x = -wid; x < wid; x += kind === "sunflower" ? 0.55 : 0.12) { const hh = h * (0.75 + r() * 0.4), lean = (r() - 0.5) * 0.15;
    if (kind === "sunflower") { w.line([[x, 0], [x + lean, hh]], 3, "#4a6a2a"); w.ell(x + lean - 0.12, hh * 0.6, 0.18, 0.07, "#4f7a32", 1.2); w.ell(x + lean, hh, 0.22, 0.22, "#f2c22a", 2); w.ell(x + lean, hh, 0.1, 0.1, "#4a3018", 0); }
    else if (kind === "wheat") { w.line([[x, 0], [x + lean, hh]], 1.6, shade(col, 0.85)); w.ell(x + lean, hh, 0.035, 0.1, mix(col, "#ffffff", 0.15), 0); }
    else w.line([[x, 0], [x + lean, hh]], 1.4, r() < 0.5 ? col : shade(col, 0.8)); } }, blur);
export const wire = (K: string, z: number, wid = 20, col = "#2a2624") => Lr(K + "wi" + z, z, -wid, wid, -0.3, 1.6, Math.max(30, 900 / z), (w) => { for (let x = -wid; x < wid; x += 3) w.line([[x, 0], [x + 0.1, 1.3]], 3, "#4a3a2a"); barbed(w, -wid, wid, [0.4, 0.8, 1.2], col); });
export const pier = (K: string, z: number, col = "#6a5040", wid = 20) => Lr(K + "pi" + z, z, -wid, wid, -1.5, 1.4, Math.max(30, 900 / z), (w) => { w.rect(-wid, 0, 2 * wid, 1.0, w.vgrad(0, 1, shade(col, 0.7), col), 3); for (let x = -wid; x < wid; x += 2.5) w.rect(x, -1.5, 0.3, 1.5, shade(col, 0.6), 2); });

// ---------------- maps ----------------
const EUROPE_OUT = [-9, 43.2, -9.4, 38.8, -6.3, 36.8, -2, 36.8, 0.2, 39.5, 3.2, 41.9, 3.1, 43.1, 6.5, 43.1, 8.8, 44.4, 12.3, 41.7, 15.6, 40, 16.2, 38.6, 18.5, 40.1, 15.9, 41.9, 12.3, 44.3, 13.7, 45.6, 15.3, 44.3, 19.4, 41.9, 21, 38.5, 22.2, 36.7, 24, 38.2, 24, 40.7, 26.3, 41.2, 29, 41.2, 28, 42.5, 28.8, 44.5, 30.8, 46.5, 33, 46, 35.5, 45.3, 37.8, 47, 40, 48, 44, 48, 44, 64, 25.5, 64, 21.5, 61.8, 22.9, 59.9, 29.8, 60.2, 23.5, 58.5, 24.2, 57.2, 21, 56, 21.2, 55.2, 19.6, 54.4, 16.5, 54.5, 14.2, 53.9, 11, 54, 9.9, 54.8, 10.6, 57.7, 8.1, 56, 8.9, 54, 7, 53.3, 5, 53.3, 3.6, 51.5, 1.6, 50.9, 0.2, 49.7, -1.6, 48.7, -4.6, 48.6, -2.4, 47.2, -1.2, 45.7, -1.6, 43.4, -8, 43.7];
const GB2 = [-5.7, 50, -1, 50.7, 1.4, 51.2, 1.7, 52.6, 0.2, 53.4, -1.6, 55.6, -1.9, 57.6, -3, 58.6, -5, 58.6, -6.2, 57.6, -5.6, 56.3, -4.9, 55.1, -3.2, 53.4, -4.6, 53.3, -5.1, 51.8];
const SCAN = [5, 64, 5, 61, 5.6, 58.4, 8.2, 58.1, 10.6, 59.4, 12.5, 56.3, 14.2, 55.4, 16, 56.2, 18.8, 59.4, 17.2, 60.7, 19, 64];
export type MapStyle = { sea: string; land: string; ink: string; grid: string; vign: string; lab: string; paper?: boolean };
/** Europe map painted at z = 0 in map metres (MX/MY), own style per shot */
export const europe = (K: string, st: MapStyle, labels = true) => loc(undefined, { near: st.sea, far: st.sea, zFar: 1 }, [Lr(K + "eu", 0, -17, 17, -12, 12, 75, (w) => {
  w.rect(-17, -12, 34, 24, st.sea, 0); if (st.paper) for (let i = 0; i < 400; i++) { const r = rng(i); w.ell((r() - 0.5) * 34, (r() - 0.5) * 24, 0.3 + r() * 1.2, 0.2 + r() * 0.8, "rgba(120,90,50,0.05)", 0); }
  for (let k = 0; k < 9; k++) w.line([[-17, -12 + k * 3], [17, -12 + k * 3]], 1, st.grid); for (let k = 0; k < 12; k++) w.line([[-17 + k * 3, -12], [-17 + k * 3, 12]], 1, st.grid);
  for (const a of [EUROPE_OUT, GB2, SCAN, [-6, 52.2, -6.3, 53.9, -7.3, 55.3, -9.9, 53.9, -10.4, 51.9, -8.5, 51.6]]) w.poly(geoP(a), st.land, 3, st.ink);
  for (const k of Object.keys(MAPCOL)) if (k !== "AXIS42") w.poly(geoP(R39[k]), mix(st.land, MAPCOL[k], 0.35), 1.8, st.ink);
  if (labels) { const lab: [string, number, number, number][] = [["ALEMANHA", 10.4, 51.4, 0.5], ["POLÔNIA", 19.6, 52.2, 0.46], ["FRANÇA", 2.4, 46.8, 0.56], ["INGLATERRA", -1.6, 52.6, 0.36], ["UNIÃO SOVIÉTICA", 36, 55.5, 0.62], ["ITÁLIA", 12.8, 42.6, 0.4], ["ESPANHA", -4, 40, 0.48], ["ÁUSTRIA", 14.2, 47.6, 0.3], ["TCHECOSLOVÁQUIA", 17.2, 49.4, 0.26], ["NORUEGA", 8.4, 61.4, 0.36], ["DINAMARCA", 9.4, 56.3, 0.24], ["BÉLGICA", 4.4, 50.5, 0.2], ["HOLANDA", 5.4, 52.4, 0.2]];
    for (const [s, lo, la, sz] of lab) w.text(s, MX(lo), MY(la), sz * 1.5, st.lab); }
  const g = w.g.createRadialGradient(0, 0, 8, 0, 0, 22); g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(1, st.vign); w.rect(-17, -12, 34, 24, g, 0);
})], true);
const CONT2: number[][] = [
  [-168, 66, -140, 70, -95, 72, -80, 66, -64, 60, -56, 52, -66, 44, -76, 35, -81, 25, -97, 26, -97, 19, -87, 15, -78, 8, -82, 9, -92, 15, -105, 20, -117, 32, -124, 40, -124, 48, -135, 58, -152, 60, -165, 60],
  [-78, 8, -60, 10, -50, 0, -35, -7, -40, -22, -48, -28, -58, -38, -65, -55, -72, -50, -73, -40, -71, -18, -80, -5],
  [-17, 21, -10, 35, 10, 37, 32, 31, 43, 12, 51, 11, 40, -15, 33, -26, 20, -35, 12, -18, 9, 2, -8, 5, -17, 15],
  [-10, 36, -9, 43, -2, 48, 5, 51, 8, 54, 12, 57, 5, 62, 15, 69, 30, 71, 60, 70, 80, 73, 110, 76, 140, 72, 180, 68, 170, 60, 140, 54, 135, 43, 128, 35, 122, 30, 121, 23, 108, 18, 105, 9, 98, 8, 92, 21, 80, 15, 77, 8, 72, 21, 66, 25, 57, 26, 52, 17, 43, 13, 35, 30, 28, 37, 26, 40, 20, 40, 15, 38, 12, 44, 8, 44, 3, 43],
  [114, -22, 122, -18, 130, -12, 142, -11, 146, -19, 153, -26, 151, -34, 145, -39, 138, -35, 129, -32, 116, -35],
  [-5.7, 50, 1.7, 51.2, 0.2, 53.4, -1.9, 57.6, -5, 58.6, -6.2, 55.6, -3.2, 53.4, -5.1, 51.8],
  [130, 31, 132, 34, 135, 34, 140, 35, 141, 38, 142, 41, 140, 41, 139, 38, 136, 36, 132, 35],
  [141, 42, 145, 43, 144, 45, 141, 45], [95, 5, 105, -6, 110, -7, 115, -8, 120, -5, 125, -2, 120, 1, 110, 2, 100, 3],
  [140, -2, 150, -6, 145, -9, 138, -8], [120, 18, 122, 18, 125, 10, 123, 7, 120, 12], [-158, 21, -157, 21.6, -155, 20, -155.8, 19],
];
/** world map at z = 0 (WX/WY), own style per shot */
export const world = (K: string, st: MapStyle) => loc(undefined, { near: st.sea, far: st.sea, zFar: 1 }, [Lr(K + "wo", 0, -18, 18, -10, 10, 70, (w) => {
  w.rect(-18, -10, 36, 20, st.sea, 0); for (let k = -9; k <= 9; k++) w.line([[k * 2, -10], [k * 2, 10]], 1, st.grid); for (let k = -5; k <= 5; k++) w.line([[-18, k * 2], [18, k * 2]], 1, st.grid);
  for (const a of CONT2) { const p: number[][] = []; for (let i = 0; i < a.length; i += 2) p.push([WX(a[i]), WY(a[i + 1])]); w.poly(p, st.land, 3, st.ink); }
  const lab: [string, number, number, number][] = [["EUROPA", 15, 52, 0.45], ["URSS", 90, 62, 0.7], ["JAPÃO", 146, 38, 0.36], ["EUA", -100, 40, 0.7], ["ÁFRICA", 20, 5, 0.6], ["CHINA", 105, 33, 0.55], ["OCEANO PACÍFICO", -150, 5, 0.42], ["OCEANO ATLÂNTICO", -40, 25, 0.36], ["AUSTRÁLIA", 134, -26, 0.4]];
  for (const [s, lo, la, sz] of lab) w.text(s, WX(lo), WY(la), sz, st.lab);
  const g = w.g.createRadialGradient(0, 0, 9, 0, 0, 22); g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(1, st.vign); w.rect(-18, -10, 36, 20, g, 0);
})], true);
export const ST = {
  parch: { sea: "#9bb7b4", land: "#ead8ac", ink: "#5a4630", grid: "rgba(255,255,255,0.18)", vign: "rgba(80,50,20,0.55)", lab: "#3a2a1c", paper: true } as MapStyle,
  night: { sea: "#14243a", land: "#2e3a48", ink: "#7a9ab8", grid: "rgba(120,170,220,0.12)", vign: "rgba(0,0,0,0.7)", lab: "#a8c8e8" } as MapStyle,
  steel: { sea: "#6f8796", land: "#c9c2ae", ink: "#2e3036", grid: "rgba(255,255,255,0.14)", vign: "rgba(20,24,30,0.6)", lab: "#1e2228" } as MapStyle,
  ember: { sea: "#2a1a16", land: "#5a3a2a", ink: "#e0a060", grid: "rgba(255,160,80,0.1)", vign: "rgba(0,0,0,0.65)", lab: "#ffd8a0" } as MapStyle,
  olive: { sea: "#8aa6a0", land: "#d6cfa4", ink: "#4a4a30", grid: "rgba(255,255,255,0.15)", vign: "rgba(40,40,20,0.5)", lab: "#2e2e1c", paper: true } as MapStyle,
  ice: { sea: "#b8cdd8", land: "#eef0ea", ink: "#3a4a5a", grid: "rgba(80,110,140,0.15)", vign: "rgba(40,60,80,0.45)", lab: "#2a3a4a" } as MapStyle,
  rust: { sea: "#4a5560", land: "#c8b494", ink: "#3a2a20", grid: "rgba(255,255,255,0.1)", vign: "rgba(30,15,10,0.6)", lab: "#2a1a12" } as MapStyle,
  teal: { sea: "#1e4a52", land: "#d8d0b4", ink: "#1a2a2a", grid: "rgba(200,255,255,0.1)", vign: "rgba(0,20,24,0.6)", lab: "#1a2a2a" } as MapStyle,
  dusk: { sea: "#3a3256", land: "#c8a8a0", ink: "#2a1e2e", grid: "rgba(255,200,220,0.1)", vign: "rgba(20,10,30,0.6)", lab: "#2a1a2a" } as MapStyle,
  sepia: { sea: "#a89272", land: "#e8d6b0", ink: "#4a3420", grid: "rgba(255,255,255,0.12)", vign: "rgba(60,30,10,0.6)", lab: "#3a2410", paper: true } as MapStyle,
};
export { MX, MY, WX, WY, church, facade, tree, emblem, mix, shade, rng };
