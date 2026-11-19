// "O fim de Lampião" (73,6 s): timeline synced to the user's narration (public/narracao.mp3).
// Sentence starts (s, from silence detection): 0 Lampião era… | 3.65 Durante quase vinte anos… | 7.99 Mas, em uma manhã…
// 12.08 tudo mudou | 13.37 Ele estava escondido… | 19.61 às margens… | 24.58 cercado pela vegetação… | 27.28 Mas alguém
// descobriu… | 33.47 se aproximaram… | 38.31 Antes do amanhecer… | 42.16 Os cangaceiros… | 45.54 Lampião tentou reagir…
// 48.64 Maria Bonita… | 52.69 Ao todo, onze… | 56.31 Mas o que aconteceu depois… | 63.40 Naquele dia… | 68.89 E uma das…
export const FPS = 30;
export const TOTAL = 2210;
export const D0 = 0;
export type V3 = [number, number, number];

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const smooth = (x: number) => { const u = clamp01(x); return u * u * (3 - 2 * u); };
export const easeOut = (u: number) => 1 - (1 - clamp01(u)) ** 4;

/** narration beats (s) */
export const T_FIRE = 41.2;   // "disparar"
export const T_SHOCK = 43.0;  // "surpreendidos"
export const T_HIT = 47.55;   // "atingido"
export const T_MARIA = 50.3;  // "morta"
/** every gunshot (s): flashes in the picture and shots in the sound */
export const GUNSHOTS = [41.2, 41.45, 41.6, 41.95, 42.25, 42.4, 42.8, 43.15, 43.35, 43.9, 44.3, 44.7, 45.05, 45.6, 46.3, 46.95, 47.55,
  48.3, 49.0, 49.55, 50.3, 50.95, 51.6, 52.1];

// ---------------- shots ----------------
export type Light = "day" | "golden" | "night";
export type Crowd = "intro" | "walk" | "none" | "rest" | "watch" | "creep" | "aim" | "surprise" | "lampiao" | "maria" | "hats" | "town" | "end";
export type ShotDef = { id: number; a: number; b: number; light: Light; crowd: Crowd };
export const SHOTS: ShotDef[] = [
  { id: 1, a: 0, b: 107, light: "day", crowd: "intro" },
  { id: 2, a: 107, b: 231, light: "day", crowd: "walk" },
  { id: 3, a: 231, b: 393, light: "golden", crowd: "none" },
  { id: 4, a: 393, b: 582, light: "day", crowd: "none" },
  { id: 5, a: 582, b: 813, light: "day", crowd: "rest" },
  { id: 6, a: 813, b: 996, light: "night", crowd: "watch" },
  { id: 7, a: 996, b: 1140, light: "night", crowd: "creep" },
  { id: 8, a: 1140, b: 1263, light: "night", crowd: "aim" },
  { id: 9, a: 1263, b: 1359, light: "night", crowd: "surprise" },
  { id: 10, a: 1359, b: 1452, light: "night", crowd: "lampiao" },
  { id: 11, a: 1452, b: 1572, light: "night", crowd: "maria" },
  { id: 12, a: 1572, b: 1683, light: "golden", crowd: "hats" },
  { id: 13, a: 1683, b: 1896, light: "day", crowd: "town" },
  { id: 14, a: 1896, b: TOTAL, light: "golden", crowd: "end" },
];
export const XFADE: Record<number, number> = { 3: 10, 4: 10, 6: 14, 12: 14, 13: 10, 14: 16 };
export const FLASH_AT = 362; // "tudo mudou"
export const shotAt = (f: number) => SHOTS.find((s) => f >= s.a && f < s.b) ?? SHOTS[SHOTS.length - 1];
export const layersAt = (f: number): { id: number; alpha: number }[] => {
  for (const s of SHOTS) {
    const x = XFADE[s.id];
    if (x && f >= s.a - x / 2 && f < s.a + x / 2) return [{ id: s.id - 1, alpha: 1 }, { id: s.id, alpha: (f - (s.a - x / 2) + 1) / (x + 1) }];
  }
  return [{ id: shotAt(f).id, alpha: 1 }];
};

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

const CAMS: Record<number, Key[]> = {
  1: [{ f: 0, s: (f) => dolly([0.3, 1.45, IZ - 3.6], [0, 1.5, IZ], f, 0, 0.0022, { fov: 42, roll: 0.02 }) }],
  2: [{ f: 107, s: (f) => dolly([0, 1.7, IZ - 2], [0.5, 1.3, IZ + 9], f, 107, 0.0014, { fov: 48, roll: -0.02 }) }],
  3: [
    { f: 226, s: (f) => dolly([0, 7, VIEW_Z - 22], [0, 3, 200], f, 226, 0.0012, { fov: 50 }) },
    { f: 300, dur: 60, s: (f) => dolly([0, 9, VIEW_Z - 24], [0, 8, 200], f, 300, 0.0012, { fov: 50, roll: 0.02 }) },
  ],
  4: [
    { f: 388, s: (f) => dolly([-5, 24, -46], [0, 0, 4], f, 388, 0.0018, { fov: 46 }) },
    { f: 440, dur: 120, s: (f) => dolly([-3, 15, -36], [0, 0.5, 4], f, 440, 0.0016, { fov: 46, roll: 0.03 }) },
  ],
  5: [
    { f: 582, s: (f) => dolly([-1.2, 1.6, -9.5], [0.4, 0.9, 0.5], f, 582, 0.0018, { fov: 44 }) },
    { f: 700, dur: 60, s: (f) => dolly([1.5, 1.5, -8.5], [0.2, 0.9, 0.5], f, 700, 0.0018, { fov: 42, roll: -0.02 }) },
  ],
  6: [{ f: 806, s: (f) => dolly([-7, 1.3, -19], [0, 0.9, 0], f, 806, 0.002, { fov: 38 }) }],
  7: [{ f: 996, s: (f) => dolly([1.5, 1.2, -33.5], [0, 1.0, -25], f, 996, 0.0016, { fov: 46, roll: 0.02 }) }],
  8: [{ f: 1140, s: (f) => dolly([-15, 1.9, -10.5], [-8.5, 1.3, -1], f, 1140, 0.0022, { fov: 42 }) }],
  9: [{ f: 1263, s: (f) => dolly([0.3, 1.2, -5.2], [0.3, 0.8, 0.3], f, 1263, 0.0025, { fov: 42 }) }],
  10: [
    { f: 1359, s: (f) => dolly([0.6, 1.45, -3.4], [0.4, 1.3, 0.4], f, 1359, 0.003, { fov: 40 }) },
    { f: fh(T_HIT) + 4, dur: 18, s: (f) => dolly([1.6, 1.3, -3.0], [1.6, 0.3, 0.4], f, fh(T_HIT) + 4, 0.002, { fov: 44 }) },
  ],
  11: [
    { f: 1452, s: (f) => dolly([-0.4, 1.4, -3.0], [-0.6, 1.25, 0.6], f, 1452, 0.003, { fov: 40, roll: -0.02 }) },
    { f: fh(T_MARIA) + 4, dur: 18, s: (f) => dolly([0.55, 1.3, -2.7], [0.55, 0.3, 0.6], f, fh(T_MARIA) + 4, 0.002, { fov: 44 }) },
  ],
  12: [{ f: 1565, s: (f) => ({ pos: [-5.5 + (f - 1565) * 0.03, 1.6, -8.8], look: [-1.5 + (f - 1565) * 0.025, 0.2, -3], fov: 44, }) }],
  13: [
    { f: 1678, s: (f) => dolly([TX - 15, 2.2, -7], [TX - 3, 1.5, 10], f, 1678, 0.0016, { fov: 50 }) },
    { f: 1790, dur: 70, s: (f) => dolly([TX - 13, 1.9, -4], [TX - 2, 1.3, 12], f, 1790, 0.0016, { fov: 46, roll: 0.02 }) },
  ],
  14: [
    { f: 1888, s: (f) => dolly([-1, 1.3, VIEW_Z - 3.2], [0, 0.95, VIEW_Z + 2], f, 1888, 0.001, { fov: 40 }) },
    { f: 2000, dur: 140, s: (f) => dolly([-1.5, 3.2, VIEW_Z - 8], [0, 4, VIEW_Z + 80], f, 2000, 0.0008, { fov: 46, roll: 0.02 }) },
  ],
};
/** impact kicks: flip sign every frame, decay over 7 frames */
const KICKS = [T_FIRE, 41.95, 42.8, T_HIT, T_MARIA];
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
  { f: 0, cInf: 13, focus: () => [0, 1.5, IZ] },
  { f: 107, cInf: 8 },
  { f: 231, cInf: 0 },
  { f: 582, cInf: 10, focus: () => [0, 0.9, 0.3] },
  { f: 813, cInf: 9, focus: () => [-5.3, 1.2, -16.5] },
  { f: 996, cInf: 8, focus: () => [0, 1.0, -25] },
  { f: 1140, cInf: 9, focus: () => [-10, 1.3, -6] },
  { f: 1263, cInf: 12, focus: () => [0.3, 0.8, 0.3] },
  { f: 1359, cInf: 14, focus: () => [0.4, 1.2, 0.4] },
  { f: 1452, cInf: 14, focus: () => [-0.6, 1.2, 0.6] },
  { f: 1572, cInf: 10, focus: () => [0, 0.25, -3] },
  { f: 1683, cInf: 7, focus: () => [TX - 5, 1.5, 5] },
  { f: 1896, cInf: 12, focus: () => [0, 0.95, VIEW_Z] },
  { f: 2000, dur: 100, cInf: 0 },
];
export const dofAt = (f: number) => {
  let i = 0; while (i + 1 < DOF.length && f >= DOF[i + 1].f) i++;
  const d = DOF[i], p = DOF[Math.max(0, i - 1)];
  const k = d.dur ? Math.min(1, (f - d.f) / d.dur) : 1;
  return { cInf: p.cInf + (d.cInf - p.cInf) * k, focus: d.focus };
};
