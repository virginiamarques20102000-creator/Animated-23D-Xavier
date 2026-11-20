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
export type Crowd = "intro" | "walk" | "dawn" | "river" | "none" | "rest" | "watch" | "creep" | "aim" | "surprise" | "lampiao" | "maria" | "hats" | "town" | "end";
export type ShotDef = { id: number; a: number; b: number; light: Light; crowd: Crowd };
// cuts land ~2 frames before each sentence starts (silence detection of the narration)
export const SHOTS: ShotDef[] = [
  { id: 1, a: 0, b: 108, light: "day", crowd: "intro" },        // Lampião era o homem…
  { id: 2, a: 108, b: 238, light: "day", crowd: "walk" },       // Durante quase vinte anos…
  { id: 3, a: 238, b: 360, light: "golden", crowd: "dawn" },    // Mas, em uma manhã de julho de 1938,
  { id: 4, a: 360, b: 399, light: "golden", crowd: "dawn" },    // tudo mudou (crash zoom)
  { id: 5, a: 399, b: 586, light: "day", crowd: "none" },       // Ele estava escondido… Grota do Angico
  { id: 6, a: 586, b: 736, light: "day", crowd: "river" },      // às margens do Rio São Francisco
  { id: 7, a: 736, b: 816, light: "day", crowd: "rest" },       // cercado pela vegetação…
  { id: 8, a: 816, b: 1002, light: "night", crowd: "watch" },   // Mas alguém descobriu…
  { id: 9, a: 1002, b: 1148, light: "night", crowd: "creep" },  // se aproximaram silenciosamente
  { id: 10, a: 1148, b: 1263, light: "night", crowd: "aim" },   // Antes do amanhecer… disparar
  { id: 11, a: 1263, b: 1364, light: "night", crowd: "surprise" },
  { id: 12, a: 1364, b: 1458, light: "night", crowd: "lampiao" },
  { id: 13, a: 1458, b: 1579, light: "night", crowd: "maria" },
  { id: 14, a: 1579, b: 1688, light: "golden", crowd: "hats" },  // Ao todo, onze…
  { id: 15, a: 1688, b: 1900, light: "day", crowd: "town" },     // Mas o que aconteceu depois…
  { id: 16, a: 1900, b: TOTAL, light: "golden", crowd: "end" },  // Naquele dia…
];
export const XFADE: Record<number, number> = { 5: 8, 6: 10, 8: 14, 14: 14, 15: 10, 16: 16 };
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

/** circle around a subject: angle a (rad, 0 = camera on -z side), radius R, height h */
const orbit = (cx: number, cz: number, R: number, h: number, a: number, ly: number, f: number, f0: number, rate: number, rest: Partial<Cam> = {}): Shot =>
  dolly([cx + R * Math.sin(a), h, cz - R * Math.cos(a)], [cx, ly, cz], f, f0, rate, rest);
const lin = (f: number, f0: number, f1: number) => clamp01((f - f0) / (f1 - f0));
const CAMS: Record<number, Key[]> = {
  1: [{ f: 0, s: (f) => orbit(0, IZ, 3.4 - lin(f, 0, 108) * 0.9, 1.45, -0.35 + lin(f, 0, 108) * 0.5, 1.45, f, 0, 0.002, { fov: 42, roll: 0.02 }) }],
  2: [{ f: 108, s: (f) => { const lx = -3 + (f - 108) / FPS * 1.3; return { pos: [lx - 1.2, 1.6, IZ + 3.5], look: [lx + 0.4, 1.15, IZ + 9.4], fov: 46, roll: -0.02 }; } }],
  3: [{ f: 238, s: (f) => orbit(0.9, 0.2, 3.6 - lin(f, 238, 360) * 1.2, 1.5, -0.7 + lin(f, 238, 360) * 1.0, 1.25, f, 238, 0.002, { fov: 42 }) }],
  4: [{ f: 360, s: (f) => { const u = easeOut(lin(f, 360, 372)); return { pos: [0.9 - 0.35, 1.55, 0.2 - 3.4 + u * 1.9], look: [0.9, 1.5, 0.2], fov: 40 - u * 6, roll: -0.05 * u }; } }],
  5: [
    { f: 395, s: (f) => dolly([-12, 30, -50], [0, 0, 2], f, 395, 0.002, { fov: 46 }) },
    { f: 410, dur: 170, s: (f) => dolly([-2, 9, -22], [0, 0.6, 2], f, 410, 0.002, { fov: 44, roll: 0.03 }) },
  ],
  6: [
    { f: 581, s: (f) => dolly([-4.2, 3.2, 99.5], [-0.6, 1.2, 108.4], f, 581, 0.002, { fov: 44 }) },
    { f: 600, dur: 130, s: (f) => dolly([-1.6, 1.5, 102.2], [-0.6, 1.25, 108.4], f, 600, 0.002, { fov: 42, roll: -0.02 }) },
  ],
  7: [{ f: 736, s: (f) => orbit(0.2, 0.5, 6.2, 1.7, 0.5 - lin(f, 736, 816) * 0.7, 0.9, f, 736, 0.002, { fov: 44 }) }],
  8: [
    { f: 809, s: (f) => dolly([-6.6, 1.45, -20.6], [0, 0.9, 0.4], f, 809, 0.004, { fov: 40 }) },
    { f: 905, dur: 60, s: (f) => dolly([-6.0, 1.5, -18.8], [-0.4, 0.9, 0.4], f, 905, 0.003, { fov: 36, roll: 0.02 }) },
  ],
  9: [{ f: 1002, s: (f) => { const lx = -8.5 + (f - 1002) / FPS * 0.9; return { pos: [lx + 0.6, 1.25, -33.2], look: [lx - 0.2, 1.0, -25.6], fov: 46, roll: 0.02 }; } }],
  10: [{ f: 1148, s: (f) => dolly([-11.2 + lin(f, 1148, 1263) * 0.6, 1.6, -13.5], [-10.1, 1.15, 0], f, 1148, 0.003, { fov: 44 }) }],
  11: [{ f: 1263, s: (f) => dolly([0.3, 1.2, -5.2], [0.3, 0.8, 0.3], f, 1263, 0.004, { fov: 42 }) }],
  12: [
    { f: 1364, s: (f) => dolly([0.5, 1.45, -3.4], [0.35, 1.3, 0.4], f, 1364, 0.004, { fov: 40 }) },
    { f: fh(T_HIT) + 4, dur: 14, s: (f) => dolly([1.35, 1.45, -3.3], [1.35, 0.3, 0.4], f, fh(T_HIT) + 4, 0.003, { fov: 48 }) },
  ],
  13: [
    { f: 1458, s: (f) => dolly([-0.6, 1.4, -3.0], [-0.6, 1.25, 0.6], f, 1458, 0.004, { fov: 40, roll: -0.02 }) },
    { f: fh(T_MARIA) + 4, dur: 14, s: (f) => dolly([0.4, 1.45, -3.0], [0.4, 0.3, 0.6], f, fh(T_MARIA) + 4, 0.003, { fov: 48 }) },
  ],
  14: [{ f: 1572, s: (f) => ({ pos: [-5.5 + (f - 1572) * 0.05, 1.5 - (f - 1572) * 0.003, -7.4], look: [-4.5 + (f - 1572) * 0.05, 0.2, -3], fov: 42, roll: 0.02 }) }],
  15: [
    { f: 1683, s: (f) => dolly([TX - 7, 2.3, -8], [TX - 5, 1.5, 12], f, 1683, 0.002, { fov: 46 }) },
    { f: 1700, dur: 150, s: (f) => dolly([TX - 5.6, 2.0, -5], [TX - 4.8, 1.5, 12], f, 1700, 0.002, { fov: 44, roll: 0.02 }) },
  ],
  16: [
    { f: 1892, s: (f) => dolly([-1, 1.3, VIEW_Z - 3.2], [0, 0.95, VIEW_Z + 2], f, 1892, 0.002, { fov: 40 }) },
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
  { f: 108, cInf: 8 },
  { f: 238, cInf: 11, focus: () => [0.9, 1.3, 0.2] },
  { f: 399, cInf: 0 },
  { f: 586, cInf: 9, focus: () => [-0.6, 1.2, 108.4] },
  { f: 736, cInf: 8, focus: () => [0.2, 0.9, 0.5] },
  { f: 816, cInf: 9, focus: () => [-5.3, 1.2, -16.5] },
  { f: 1002, cInf: 8 },
  { f: 1148, cInf: 9 },
  { f: 1263, cInf: 12, focus: () => [0.3, 0.8, 0.3] },
  { f: 1364, cInf: 14 },
  { f: 1458, cInf: 14 },
  { f: 1579, cInf: 10, focus: () => [0, 0.25, -3] },
  { f: 1688, cInf: 7 },
  { f: 1900, cInf: 12, focus: () => [0, 0.95, VIEW_Z] },
  { f: 2000, dur: 100, cInf: 0 },
];
export const dofAt = (f: number) => {
  let i = 0; while (i + 1 < DOF.length && f >= DOF[i + 1].f) i++;
  const d = DOF[i], p = DOF[Math.max(0, i - 1)];
  const k = d.dur ? Math.min(1, (f - d.f) / d.dur) : 1;
  return { cInf: p.cInf + (d.cInf - p.cInf) * k, focus: d.focus };
};
