// Cenários em perspectiva de verdade (salas e ruas como caixas 3D: chão, paredes laterais, teto, janelas com feixes de luz).
// A câmera andando revela as paredes laterais e o teto (paralaxe real) — visual diferente dos painéis chapados dos outros vídeos.
import { P, Cam, Ctx, VW, VH, clamp, hash, rng, glow } from "../ww2/engine";
import type { Loc } from "../ww2/paint";

type V3 = [number, number, number];
const hx = (c: string) => { const n = parseInt(c.slice(1, 7), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
const mixA = (a: number[], b: number[], t: number) => a.map((v, i) => v + (b[i] - v) * t);
const css = (a: number[], al = 1) => `rgba(${a.map((v) => Math.round(clamp(v, 0, 255))).join(",")},${al})`;
export type SetFn = (g: Ctx, c: Cam, t: number) => void;
export type Loc3 = Loc & { set?: SetFn };

/** recorta o polígono no plano z = cam.z + near e projeta */
const proj = (c: Cam, pts: V3[], near = 0.12): [number, number][] => {
  const zn = c.z + near, out: V3[] = [];
  for (let i = 0; i < pts.length; i++) { const a = pts[i], b = pts[(i + 1) % pts.length], ia = a[2] >= zn, ib = b[2] >= zn;
    if (ia) out.push(a); if (ia !== ib) { const u = (zn - a[2]) / (b[2] - a[2]); out.push([a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, zn]); } }
  return out.map((p) => { const q = P(c, p[0], p[1], p[2]); return [q[0], q[1]]; });
};
export class S3 {
  constructor(public g: Ctx, public c: Cam, public fog: number[], public fogD: number) {}
  shade(col: string | number[], z: number, k = 1) { const b = typeof col === "string" ? hx(col) : col; return mixA(b.map((v) => v * k), this.fog, clamp((z - this.c.z) / this.fogD, 0, 0.85)); }
  quad(pts: V3[], col: string | number[], k = 1, al = 1) { const q = proj(this.c, pts); if (q.length < 3) return; const g = this.g, zm = pts.reduce((s, p) => s + p[2], 0) / pts.length;
    g.beginPath(); q.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]))); g.closePath(); g.fillStyle = css(this.shade(col, zm, k), al); g.fill(); }
  /** quad com gradiente entre duas profundidades (escurece/clareia ao longo de z) */
  quadG(pts: V3[], col: string, kNear: number, kFar: number, za: number, zb: number, al = 1) { const q = proj(this.c, pts); if (q.length < 3) return; const g = this.g;
    const A = P(this.c, 0, 0, Math.max(za, this.c.z + 0.2)), B = P(this.c, 0, 0, zb); const p0 = pts[0], y0 = p0[1];
    const a = P(this.c, p0[0], y0, Math.max(za, this.c.z + 0.2)), b = P(this.c, p0[0], y0, zb); void A; void B;
    const gr = g.createLinearGradient(a[0], a[1], b[0], b[1]); gr.addColorStop(0, css(this.shade(col, za, kNear), al)); gr.addColorStop(1, css(this.shade(col, zb, kFar), al));
    g.beginPath(); q.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]))); g.closePath(); g.fillStyle = gr; g.fill(); }
  line(a: V3, b: V3, col: string | number[], px: number, al = 1) { const q = proj(this.c, [a, b, b]); if (q.length < 2) return; const g = this.g; const zm = (a[2] + b[2]) / 2, s = P(this.c, 0, 0, Math.max(zm, this.c.z + 0.3))[2];
    g.strokeStyle = css(this.shade(col, zm), al); g.lineWidth = Math.max(0.6, px * s / 200); g.beginPath(); g.moveTo(q[0][0], q[0][1]); g.lineTo(q[1][0], q[1][1]); g.stroke(); }
  /** feixe de luz volumétrico entre um polígono de origem (janela) e sua mancha no chão */
  beam(src: V3[], dst: V3[], col: number[], a: number) { const q1 = proj(this.c, src), q2 = proj(this.c, dst); if (q1.length < 3 || q2.length < 3) return; const g = this.g;
    const all = [...q1, ...q2], cx = all.reduce((s, p) => s + p[0], 0) / all.length, cy = all.reduce((s, p) => s + p[1], 0) / all.length;
    const hull = all.sort((p, q) => Math.atan2(p[1] - cy, p[0] - cx) - Math.atan2(q[1] - cy, q[0] - cx));
    const a1 = q1.reduce((s, p) => [s[0] + p[0] / q1.length, s[1] + p[1] / q1.length], [0, 0]), a2 = q2.reduce((s, p) => [s[0] + p[0] / q2.length, s[1] + p[1] / q2.length], [0, 0]);
    const gr = g.createLinearGradient(a1[0], a1[1], a2[0], a2[1]); gr.addColorStop(0, css(col, a)); gr.addColorStop(1, css(col, a * 0.15));
    g.save(); g.globalCompositeOperation = "lighter"; g.beginPath(); hull.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]))); g.closePath(); g.fillStyle = gr; g.fill(); g.restore(); }
}

// ---------------- sala ----------------
export type RoomO = {
  w: number; h: number; back: number; near?: number; x0?: number;
  floor: string; wall: string; ceil: string; fog?: string; fogD?: number;
  floorKind?: "planks" | "tiles" | "stone" | "concrete"; wallKind?: "plaster" | "brick" | "stone" | "boards" | "wallpaper" | "tile";
  wains?: string; beams?: string; winL?: number; winR?: number; winBack?: number; winCol?: string; winH?: [number, number]; beam?: number; beamCol?: string;
  pilasters?: string; lamps?: number; lampCol?: string; gallery?: string; bulb?: [number, number, number]; dark?: number; backDeco?: (s: S3) => void; seed?: number;
};
export const room = (o: RoomO): SetFn => (g, c, t) => {
  const s = new S3(g, c, hx(o.fog ?? "#120c0a"), o.fogD ?? 60), W = o.w / 2, H = o.h, Z1 = o.back, Z0 = Math.min(c.z - 2, o.near ?? -30), X0 = o.x0 ?? 0, dk = 1 - (o.dark ?? 0);
  const xl = X0 - W, xr = X0 + W;
  // teto, paredes, chão (de trás para frente: a ordem não importa porque não se sobrepõem por dentro da caixa)
  s.quadG([[xl, H, Z0], [xr, H, Z0], [xr, H, Z1], [xl, H, Z1]], o.ceil, 0.75 * dk, 0.9 * dk, Z0, Z1);
  for (const [x, sgn] of [[xl, -1], [xr, 1]] as [number, number][]) s.quadG([[x, 0, Z0], [x, H, Z0], [x, H, Z1], [x, 0, Z1]], o.wall, (sgn < 0 ? 0.82 : 0.68) * dk, 0.9 * dk, Z0, Z1);
  s.quad([[xl, 0, Z1], [xr, 0, Z1], [xr, H, Z1], [xl, H, Z1]], o.wall, 0.95 * dk);
  s.quadG([[xl, 0, Z0], [xr, 0, Z0], [xr, 0, Z1], [xl, 0, Z1]], o.floor, 0.85 * dk, 1.0 * dk, Z0, Z1);
  const fk = o.floorKind ?? "planks", r = rng(o.seed ?? 5);
  // textura do chão
  if (fk === "planks") { for (let x = xl; x <= xr; x += 0.28) s.line([x, 0, Z0], [x, 0, Z1], "#1a100a", 2, 0.35); for (let z = Math.ceil(c.z); z < Z1; z += 1.2) for (let x = xl; x < xr; x += 0.28) if (r() < 0.35) s.line([x, 0, z + r()], [x + 0.28, 0, z + r()], "#1a100a", 1.5, 0.3); }
  else if (fk === "tiles" || fk === "stone") { const q = fk === "tiles" ? 0.6 : 0.9; for (let x = xl; x <= xr; x += q) s.line([x, 0, Z0], [x, 0, Z1], "#140e0c", 1.6, 0.35); for (let z = Math.ceil(c.z); z <= Z1; z += q) s.line([xl, 0, z], [xr, 0, z], "#140e0c", 1.6, 0.35);
    if (fk === "tiles") for (let x = xl; x < xr; x += q) for (let z = Math.ceil(c.z); z < Z1; z += q) if ((Math.round(x / q) + Math.round(z / q)) % 2 === 0) s.quad([[x, 0.001, z], [x + q, 0.001, z], [x + q, 0.001, z + q], [x, 0.001, z + q]], "#000000", 1, 0.08); }
  else if (fk === "concrete") for (let i = 0; i < 30; i++) { const x = xl + r() * o.w, z = c.z + 1 + r() * (Z1 - c.z); s.quad([[x, 0.001, z], [x + 0.6, 0.001, z], [x + 0.5, 0.001, z + 0.4]], "#000000", 1, 0.07); }
  // textura das paredes
  const wk = o.wallKind ?? "plaster";
  const wallLines = (x: number) => { if (wk === "brick" || wk === "stone") { const hh = wk === "brick" ? 0.25 : 0.5; for (let y = hh; y < H; y += hh) s.line([x, y, Z0], [x, y, Z1], "#140c0a", 1.2, 0.3); for (let y = 0; y < H; y += hh) for (let z = Math.ceil(c.z) + ((y / hh) % 2) * 0.4; z < Z1; z += wk === "brick" ? 0.8 : 1.1) s.line([x, y, z], [x, y + hh, z], "#140c0a", 1, 0.25); }
    if (wk === "boards") for (let z = Math.ceil(c.z); z < Z1; z += 0.3) s.line([x, 0, z], [x, H, z], "#1a100a", 1.2, 0.35);
    if (wk === "wallpaper") for (let z = Math.ceil(c.z); z < Z1; z += 0.5) s.line([x, 1.0, z], [x, H, z], "#000000", 1, 0.12);
    if (o.wains) { s.quad([[x, 0, Z0], [x, 1.1, Z0], [x, 1.1, Z1], [x, 0, Z1]], o.wains, (x < X0 ? 0.8 : 0.66) * dk); s.line([x, 1.1, Z0], [x, 1.1, Z1], "#e0c070", 3, 0.5); }
    if (o.pilasters) for (let z = Math.ceil(c.z / 4) * 4; z < Z1; z += 4) s.quad([[x, 0, z - 0.3], [x, H, z - 0.3], [x, H, z + 0.3], [x, 0, z + 0.3]], o.pilasters, (x < X0 ? 0.9 : 0.75) * dk); };
  wallLines(xl); wallLines(xr);
  if (wk === "brick" || wk === "stone") { const hh = wk === "brick" ? 0.25 : 0.5; for (let y = hh; y < H; y += hh) s.line([xl, y, Z1], [xr, y, Z1], "#140c0a", 1.2, 0.3); }
  if (wk === "boards") for (let x = xl; x < xr; x += 0.3) s.line([x, 0, Z1], [x, H, Z1], "#1a100a", 1.2, 0.35);
  if (o.wains) { s.quad([[xl, 0, Z1 - 0.01], [xr, 0, Z1 - 0.01], [xr, 1.1, Z1 - 0.01], [xl, 1.1, Z1 - 0.01]], o.wains, 0.85 * dk); s.line([xl, 1.1, Z1 - 0.02], [xr, 1.1, Z1 - 0.02], "#e0c070", 3, 0.5); }
  // vigas do teto
  if (o.beams) for (let z = Math.ceil(c.z / 2.5) * 2.5; z < Z1; z += 2.5) { s.quad([[xl, H, z], [xr, H, z], [xr, H - 0.3, z], [xl, H - 0.3, z]], o.beams, 0.7 * dk); s.quad([[xl, H - 0.3, z], [xr, H - 0.3, z], [xr, H - 0.3, z + 0.3], [xl, H - 0.3, z + 0.3]], o.beams, 0.55 * dk); }
  // galeria (balcão em volta) para o salão
  if (o.gallery) { const gy = H * 0.48; for (const x of [xl, xr]) { const xi = x + (x < X0 ? 1.6 : -1.6);
      s.quad([[x, gy, Z0], [xi, gy, Z0], [xi, gy, Z1], [x, gy, Z1]], o.gallery, 0.5 * dk); s.quad([[xi, gy - 0.35, Z0], [xi, gy, Z0], [xi, gy, Z1], [xi, gy - 0.35, Z1]], o.gallery, 0.8 * dk);
      for (let z = Math.ceil(c.z); z < Z1; z += 0.35) s.line([xi, gy, z], [xi, gy + 1.0, z], o.gallery, 2.2, 0.9); s.line([xi, gy + 1.0, Z0], [xi, gy + 1.0, Z1], o.gallery, 5, 1); s.line([xi, gy - 0.35, Z0], [xi, gy - 0.35, Z1], "#e0c070", 2, 0.6);
      for (let z = Math.ceil(c.z / 5) * 5 + 1; z < Z1; z += 5) s.quad([[xi - 0.2, 0, z - 0.2], [xi + 0.2, 0, z - 0.2], [xi + 0.2, gy - 0.35, z - 0.2], [xi - 0.2, gy - 0.35, z - 0.2]], o.pilasters ?? o.gallery, 0.85 * dk); }
    s.quad([[xl, gy, Z1 - 0.05], [xr, gy, Z1 - 0.05], [xr, gy - 0.35, Z1 - 0.05], [xl, gy - 0.35, Z1 - 0.05]], o.gallery, 0.8 * dk); }
  // janelas laterais e do fundo com feixes de luz
  const [wy0, wy1] = o.winH ?? [1.2, Math.min(H - 0.5, 3.2)], wc = hx(o.winCol ?? "#ffe8b8"), bc = hx(o.beamCol ?? o.winCol ?? "#ffe0a8");
  const side = (x: number, n: number, sgn: number) => { if (!n) return; const step = (Z1 - 1) / n;
    for (let i = 0; i < n; i++) { const z = 1 + i * step + step * 0.3, zw = Math.min(1.6, step * 0.55); s.quad([[x, wy0, z], [x, wy1, z], [x, wy1, z + zw], [x, wy0, z + zw]], wc, 1);
      s.line([x, (wy0 + wy1) / 2, z], [x, (wy0 + wy1) / 2, z + zw], "#2a1a12", 3); s.line([x, wy0, z + zw / 2], [x, wy1, z + zw / 2], "#2a1a12", 3);
      if (o.beam) { const dx = -sgn * wy1 * 0.9; s.beam([[x, wy0, z], [x, wy1, z], [x, wy1, z + zw], [x, wy0, z + zw]], [[x + dx * 0.6, 0, z + 0.4], [x + dx * 1.2, 0, z + 0.4], [x + dx * 1.2, 0, z + zw + 0.4], [x + dx * 0.6, 0, z + zw + 0.4]], bc, 0.12 * o.beam);
        s.quad([[x + dx * 0.6, 0.002, z + 0.4], [x + dx * 1.2, 0.002, z + 0.4], [x + dx * 1.2, 0.002, z + zw + 0.4], [x + dx * 0.6, 0.002, z + zw + 0.4]], bc, 1, 0.14 * o.beam); } } };
  side(xl, o.winL ?? 0, -1); side(xr, o.winR ?? 0, 1);
  for (let i = 0; i < (o.winBack ?? 0); i++) { const n = o.winBack!, x = xl + ((i + 0.5) / n) * o.w, ww = Math.min(1.6, o.w / n * 0.45);
    s.quad([[x - ww / 2, wy0, Z1 - 0.02], [x + ww / 2, wy0, Z1 - 0.02], [x + ww / 2, wy1, Z1 - 0.02], [x - ww / 2, wy1, Z1 - 0.02]], wc, 1); s.line([x, wy0, Z1 - 0.03], [x, wy1, Z1 - 0.03], "#2a1a12", 3); }
  o.backDeco?.(s);
  // lustres/luminárias no teto, com luz quente que pulsa de leve
  for (let i = 0; i < (o.lamps ?? 0); i++) { const z = 2 + i * ((Z1 - 2) / Math.max(1, o.lamps!)), x = X0 + (i % 2 ? -1 : 1) * (o.w * 0.18); const top = P(c, x, H, z), b = P(c, x, H - 1.1, z); if (z - c.z < 0.6) continue;
    g.strokeStyle = "rgba(20,14,12,0.9)"; g.lineWidth = Math.max(1, 0.012 * b[2]); g.beginPath(); g.moveTo(top[0], top[1]); g.lineTo(b[0], b[1]); g.stroke();
    g.fillStyle = "#3a2a1a"; g.beginPath(); g.ellipse(b[0], b[1], 0.35 * b[2], 0.1 * b[2], 0, 0, 7); g.fill(); glow(g, b[0], b[1] + 0.05 * b[2], 2.2 * b[2], o.lampCol ?? "rgba(255,196,120,1)", 0.42 * dk * (0.95 + 0.05 * Math.sin(t * 7 + i))); }
  if (o.bulb) { const [x, y, z] = o.bulb, b = P(c, x, y, z), top = P(c, x, H, z); g.strokeStyle = "#141010"; g.lineWidth = 2; g.beginPath(); g.moveTo(top[0], top[1]); g.lineTo(b[0], b[1]); g.stroke(); glow(g, b[0], b[1], 3.5 * b[2], "rgba(255,236,190,1)", 0.6); g.fillStyle = "#fff6d8"; g.beginPath(); g.arc(b[0], b[1], 0.05 * b[2], 0, 7); g.fill(); }
};

// ---------------- rua em perspectiva ----------------
export type StreetO = { w?: number; len?: number; pal: string[]; night?: boolean; dusk?: boolean; sepia?: boolean; banner?: boolean; seed?: number; lamps?: boolean; fog?: string; road?: string; walk?: string; endFacade?: { z: number; col: string; sign?: string } };
export const street = (o: StreetO): SetFn => (g, c, t) => {
  const s = new S3(g, c, hx(o.fog ?? (o.night ? "#141826" : o.dusk ? "#c88a6a" : o.sepia ? "#c8b490" : "#b8c4d2")), o.night ? 90 : 140), W = o.w ?? 7, Lz = o.len ?? 120, r = rng(o.seed ?? 3), Z0 = c.z - 2;
  const road = o.road ?? (o.night ? "#2a2a30" : o.sepia ? "#8a7a5e" : "#7a746c"), walk = o.walk ?? (o.night ? "#38363c" : o.sepia ? "#a8966e" : "#a8a29a");
  s.quadG([[-W, 0, Z0], [W, 0, Z0], [W, 0, Lz], [-W, 0, Lz]], road, 0.85, 1, Z0, Lz);
  for (const sg of [-1, 1]) { s.quadG([[sg * W, 0.15, Z0], [sg * (W + 2.2), 0.15, Z0], [sg * (W + 2.2), 0.15, Lz], [sg * W, 0.15, Lz]], walk, 0.9, 1, Z0, Lz); s.quad([[sg * W, 0, Z0], [sg * W, 0.15, Z0], [sg * W, 0.15, Lz], [sg * W, 0, Lz]], walk, 0.6); }
  // paralelepípedos (linhas em perspectiva) e trilho do bonde
  for (let z = Math.max(Math.ceil(c.z), 0); z < Math.min(Lz, c.z + 50); z += 0.45) s.line([-W, 0, z], [W, 0, z], "#000000", 1.2, 0.18);
  for (let x = -W; x <= W; x += 0.45) s.line([x, 0, Z0], [x, 0, c.z + 50], "#000000", 1, 0.1);
  for (const x of [-0.75, 0.75]) s.line([x, 0.01, Z0], [x, 0.01, Lz], "#c8c8cc", 2.4, o.night ? 0.25 : 0.45);
  // prédios dos dois lados: fachada voltada para a rua + topo + face frontal; janelas acesas à noite
  for (const sg of [-1, 1]) { let z = -20 + r() * 4; const r2 = rng((o.seed ?? 3) * 7 + (sg > 0 ? 1 : 2));
    const blds: { z0: number; z1: number; h: number; col: string }[] = []; while (z < Lz) { const len = 6 + r2() * 8, h = 9 + r2() * 9; blds.push({ z0: z, z1: z + len, h, col: o.pal[Math.floor(r2() * o.pal.length)] }); z += len; }
    blds.sort((a, b) => b.z0 - a.z0).forEach((b, bi) => { if (b.z1 < c.z) return; const x = sg * (W + 2.2), k = sg < 0 ? 0.92 : 0.72;
      s.quadG([[x, 0, b.z0], [x, b.h, b.z0], [x, b.h, b.z1], [x, 0, b.z1]], b.col, k, k, b.z0, b.z1);
      // cornija + telhado inclinado
      s.quad([[x, b.h, b.z0], [x - sg * 0.6, b.h, b.z0], [x - sg * 0.6, b.h, b.z1], [x, b.h, b.z1]], b.col, 0.55); s.quad([[x, b.h, b.z0], [x + sg * 3, b.h + 2.6, b.z0], [x + sg * 3, b.h + 2.6, b.z1], [x, b.h, b.z1]], o.night ? "#1a1620" : "#7a4a38", sg < 0 ? 0.8 : 0.6);
      // face frontal (aparece quando o prédio da frente é mais baixo)
      s.quad([[x, 0, b.z0], [x + sg * 6, 0, b.z0], [x + sg * 6, b.h, b.z0], [x, b.h, b.z0]], b.col, 0.62);
      // janelas
      for (let fl = 0; fl < Math.floor((b.h - 3) / 3.2); fl++) for (let wz = b.z0 + 1; wz < b.z1 - 1; wz += 2.2) { const y = 3.2 + fl * 3.2, on = o.night ? hash(wz * 3.1 + fl * 7 + sg + bi) > 0.45 : false;
        s.quad([[x - sg * 0.02, y, wz], [x - sg * 0.02, y + 1.7, wz], [x - sg * 0.02, y + 1.7, wz + 1.0], [x - sg * 0.02, y, wz + 1.0]], on ? "#ffcf78" : o.night ? "#1a1c2a" : "#4a5a6a", on ? 1.15 : 1);
        s.quad([[x - sg * 0.03, y - 0.1, wz - 0.1], [x - sg * 0.2, y - 0.1, wz - 0.1], [x - sg * 0.2, y - 0.1, wz + 1.1], [x - sg * 0.03, y - 0.1, wz + 1.1]], b.col, 0.5); }
      // porta e vitrine no térreo
      s.quad([[x - sg * 0.02, 0.15, b.z0 + 1.5], [x - sg * 0.02, 2.6, b.z0 + 1.5], [x - sg * 0.02, 2.6, b.z0 + 2.6], [x - sg * 0.02, 0.15, b.z0 + 2.6]], "#3a2618", 1);
      if (o.banner && bi % 2 === 0) { s.quad([[x - sg * 0.1, b.h - 1, b.z0 + 3], [x - sg * 0.1, b.h - 6, b.z0 + 3], [x - sg * 0.1, b.h - 6, b.z0 + 4.4], [x - sg * 0.1, b.h - 1, b.z0 + 4.4]], "#b3221c", 1); }
    }); }
  if (o.endFacade) { const e = o.endFacade, x0 = -W - 2.2, x1 = W + 2.2; s.quad([[x0, 0, e.z], [x1, 0, e.z], [x1, 14, e.z], [x0, 14, e.z]], e.col, 0.95); }
  // postes com luz
  if (o.lamps !== false) for (let z = 4; z < 70; z += 9) for (const sg of [-1, 1]) { if (z - c.z < 0.8) continue; const x = sg * (W + 0.6), a = P(c, x, 0.15, z), b = P(c, x, 4.2, z);
    g.strokeStyle = "rgba(20,18,22,0.95)"; g.lineWidth = Math.max(1, 0.09 * a[2]); g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke();
    g.fillStyle = o.night ? "#ffe2a0" : "#3a3a3e"; g.beginPath(); g.ellipse(b[0], b[1], 0.16 * b[2], 0.22 * b[2], 0, 0, 7); g.fill(); if (o.night) { glow(g, b[0], b[1], 2.6 * b[2], "rgba(255,200,120,1)", 0.5); const fl = P(c, x - sg * 0.8, 0, z); glow(g, fl[0], fl[1], 2.2 * fl[2], "rgba(255,190,110,1)", 0.22); } }
};

/** Loc 3D: céu (gradiente), sem chão pintado (o set pinta tudo) */
export const loc3 = (sky: [string, string] | undefined, set: SetFn, interior = true): Loc3 => ({ sky, ground: { near: "#000000", far: "#000000", kind: "none", zFar: 0.5 }, layers: [], interior, set });
