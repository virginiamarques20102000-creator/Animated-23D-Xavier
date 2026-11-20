// "O fim de Lampião" (73,6 s): timeline synced to the user's narration (public/narracao.mp3).
// Sentence starts (s, from silence detection): 0 Lampião era… | 3.65 Durante quase vinte anos… | 7.99 Mas, em uma manhã…
// 12.08 tudo mudou | 13.37 Ele estava escondido… | 19.61 às margens… | 24.58 cercado pela vegetação… | 27.28 Mas alguém
// descobriu… | 33.47 se aproximaram… | 38.31 Antes do amanhecer… | 42.16 Os cangaceiros… | 45.54 Lampião tentou reagir…
// 48.64 Maria Bonita… | 52.69 Ao todo, onze… | 56.31 Mas o que aconteceu depois… | 63.40 Naquele dia… | 68.89 E uma das…
export const FPS = 30;
export const TOTAL = 300;
export const D0 = 0;
export type V3 = [number, number, number];

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const smooth = (x: number) => { const u = clamp01(x); return u * u * (3 - 2 * u); };
export const easeOut = (u: number) => 1 - (1 - clamp01(u)) ** 4;

/** beats (s) */
export const T_NOISE = 3.0;   // the samurai hears something
export const T_RAISE = 5.0;   // anticipation: katana up, lean back
export const T_HIT = 190 / 30; // the strike
export const T_FIRE = 99, T_SHOCK = 99, T_MARIA = 99;
export const GUNSHOTS: number[] = [];

export type Light = "day" | "golden" | "night";
export type Crowd = "idle" | "face" | "charge" | "strike" | "after" | "intro" | "walk" | "dawn" | "river" | "none" | "rest" | "surround" | "watch" | "creep" | "aim" | "surprise" | "lampiao" | "maria" | "hats" | "town" | "end";
export type ShotDef = { id: number; a: number; b: number; light: Light; crowd: Crowd };
export const SHOTS: ShotDef[] = [
  { id: 1, a: 0, b: 80, light: "night", crowd: "idle" },
  { id: 2, a: 80, b: 122, light: "night", crowd: "face" },
  { id: 3, a: 122, b: 186, light: "night", crowd: "charge" },
  { id: 4, a: 186, b: 236, light: "night", crowd: "strike" },
  { id: 5, a: 236, b: TOTAL, light: "night", crowd: "after" },
];
export const XFADE: Record<number, number> = {};
export const FLASH_AT = 192;
export const shotAt = (f: number) => SHOTS.find((s) => f >= s.a && f < s.b) ?? SHOTS[SHOTS.length - 1];
export const layersAt = (f: number): { id: number; alpha: number }[] => [{ id: shotAt(f).id, alpha: 1 }];

// ---------------- places ----------------
export const INTRO_Z = -70;   // open caatinga where the band is introduced
export const TOWN_X = -600;   // Piranhas: church steps
export const VIEW_Z = 70;     // the rock above the river (ending)

// ---------------- camera ----------------
export type Cam = { pos: V3; look: V3; fov: number; roll: number };
type Shot = Partial<Cam> & { pos: V3; look: V3 };
type Key = { f: number; dur?: number; cut?: boolean; s: (f: number) => Shot };
export const glide = (u: number) => { const x = clamp01(u); return x * x * x * (x * (6 * x - 15) + 10); };
const mix = (a: Cam, b: Cam, k: number): Cam => ({
  pos: a.pos.map((v, i) => v + (b.pos[i] - v) * k) as V3, look: a.look.map((v, i) => v + (b.look[i] - v) * k) as V3,
  fov: a.fov + (b.fov - a.fov) * k, roll: a.roll + (b.roll - a.roll) * k,
});
const full = (c: Shot): Cam => ({ fov: 40, roll: 0, ...c });
const run = (keys: Key[], f: number) => {
  let cur = full(keys[0].s(f));
  for (let i = 1; i < keys.length; i++) {
    const k = keys[i];
    if (f < k.f) break;
    cur = k.cut ? full(k.s(f)) : mix(cur, full(k.s(f)), glide((f - k.f) / (k.dur ?? 24)));
  }
  return cur;
};
/** every hold creeps in: a slow zoom */
const dolly = (pos: V3, look: V3, f: number, f0: number, rate = 0.0025, rest: Partial<Cam> = {}): Shot => {
  const k = Math.exp(-rate * Math.max(0, f - f0)), fov = rest.fov ?? 40;
  return { pos, look, ...rest, fov: (360 / Math.PI) * Math.atan(Math.tan((fov * Math.PI) / 360) * k) };
};
const fh = (t: number) => Math.round(t * FPS);
const IZ = INTRO_Z, TX = TOWN_X;

/** circle around a subject: angle a (rad, 0 = camera on -z side), radius R, height h */
const orbit = (cx: number, cz: number, R: number, h: number, a: number, ly: number, f: number, f0: number, rate: number, rest: Partial<Cam> = {}): Shot =>
  dolly([cx + R * Math.sin(a), h, cz - R * Math.cos(a)], [cx, ly, cz], f, f0, rate, rest);
const lin = (f: number, f0: number, f1: number) => clamp01((f - f0) / (f1 - f0));
/** samurai stands at (SX, SZ), the campfire glows behind him */
export const SX = 0, SZ = -3.4;
export const banditX = (f: number) => { const u = clamp01((f - 128) / 58); return -7 + 5.7 * u * u * (3 - 2 * u); };
const CAMS: Record<number, Key[]> = {
  1: [{ f: 0, s: (f) => orbit(SX, SZ, 5.2 - lin(f, 0, 80) * 1.0, 1.7, -0.55 + lin(f, 0, 80) * 0.5, 1.2, f, 0, 0.001, { fov: 44, roll: 0.02 }) }],
  2: [{ f: 80, s: (f) => orbit(SX, SZ, 2.3 - lin(f, 80, 122) * 0.3, 1.75, 0.25 - lin(f, 80, 122) * 0.15, 1.65, f, 80, 0.001, { fov: 40, roll: lin(f, 88, 96) * -0.06 }) }],
  3: [{ f: 122, s: (f) => dolly([SX - 0.7 + lin(f, 122, 186) * 0.4, 1.5, SZ - 6.6], [SX - 0.95, 1.0, SZ], f, 122, 0.003, { fov: 50, roll: -0.02 }) }],
  4: [{ f: 186, s: (f) => orbit(SX - 0.7, SZ, 5.8, 1.3, 0.35 - lin(f, 186, 236) * 0.2, 1.1, f, 186, 0.002, { fov: 46, roll: 0.05 }) }],
  5: [{ f: 236, s: (f) => orbit(SX - 0.9, SZ + 0.4, 6.8 - lin(f, 236, 300) * 1.3, 1.5, 0.2 - lin(f, 236, 300) * 0.3, 1.2, f, 236, 0.001, { fov: 44 }) }],
};
/** impact kicks: flip sign every frame, decay over 7 frames */
const KICKS = [T_HIT, T_HIT + 0.12];
export const kickAt = (t: number) => {
  for (const k of KICKS) { const n = Math.round((t - k) * FPS); if (n >= 0 && n < 7) return (n % 2 ? -1 : 1) * (1 - n / 7); }
  return 0;
};
export const camAt = (id: number, f: number): Cam => {
  const c = run(CAMS[id], f), a = kickAt(f / FPS);
  if (!a) return c;
  const d: V3 = [c.look[0] - c.pos[0], c.look[1] - c.pos[1], c.look[2] - c.pos[2]];
  const L = Math.hypot(...d), h = Math.hypot(d[0], d[2]) || 1;
  const m = (3 / 640) * Math.tan((c.fov * Math.PI) / 360) * L * a * 2.5;
  return { ...c, look: [c.look[0] - (d[2] / h) * m, c.look[1] + 0.6 * m, c.look[2] + (d[0] / h) * m], roll: c.roll + a * 0.006 };
};

// ---------------- lens blur per beat (cInf px at 1080; 0 = sharp) ----------------
export type Dof = { f: number; dur?: number; cInf: number; focus?: (f: number) => V3 };
export const DOF: Dof[] = [
  { f: 0, cInf: 12, focus: () => [SX, 1.3, SZ] },
  { f: 80, cInf: 16, focus: () => [SX, 1.6, SZ] },
  { f: 122, cInf: 9, focus: () => [SX - 1.2, 1.1, SZ] },
  { f: 186, cInf: 11, focus: () => [SX - 0.6, 1.1, SZ] },
  { f: 236, cInf: 12, focus: () => [SX, 1.2, SZ] },
];
export const dofAt = (f: number) => {
  let i = 0; while (i + 1 < DOF.length && f >= DOF[i + 1].f) i++;
  const d = DOF[i], p = DOF[Math.max(0, i - 1)];
  const k = d.dur ? Math.min(1, (f - d.f) / d.dur) : 1;
  return { cInf: p.cInf + (d.cInf - p.cInf) * k, focus: d.focus };
};
