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
export const T_CRASH = 72 / 30;            // the car hits the tree
export const T_EXIT = 4.3;                 // he jumps out of the convertible
export const T_DRAW = 6.0;                 // pulls the pistol
export const SHOTS_AT = [7.0, 7.5, 8.05];   // three shots into the tree
export const T_HIT = T_CRASH, T_NOISE = 99, T_RAISE = 99, T_FIRE = 99, T_SHOCK = 99, T_MARIA = 99;
export const GUNSHOTS: number[] = [];
export const physT = (tt: number) => tt;

export type Light = "day" | "golden" | "night";
export type Crowd = "drive" | "crash" | "wreck" | "out" | "wide" | "ginga" | "face" | "charge" | "strike" | "after" | "idle" | "intro" | "walk" | "dawn" | "river" | "none" | "rest" | "surround" | "watch" | "creep" | "aim" | "surprise" | "lampiao" | "maria" | "hats" | "town" | "end";
export type ShotDef = { id: number; a: number; b: number; light: Light; crowd: Crowd };
export const SHOTS: ShotDef[] = [
  { id: 1, a: 0, b: 56, light: "day", crowd: "drive" },
  { id: 2, a: 56, b: 84, light: "day", crowd: "crash" },
  { id: 3, a: 84, b: 124, light: "day", crowd: "wreck" },
  { id: 4, a: 124, b: 270, light: "day", crowd: "out" },
  { id: 5, a: 270, b: TOTAL, light: "day", crowd: "wide" },
];
export const XFADE: Record<number, number> = { 4: 6 };
export const FLASH_AT = 72;
export const shotAt = (f: number) => SHOTS.find((s) => f >= s.a && f < s.b) ?? SHOTS[SHOTS.length - 1];
export const layersAt = (f: number): { id: number; alpha: number }[] => {
  for (const s of SHOTS) {
    const x = XFADE[s.id];
    if (x && f >= s.a - x / 2 && f < s.a + x / 2) return [{ id: s.id - 1, alpha: 1 }, { id: s.id, alpha: (f - (s.a - x / 2) + 1) / (x + 1) }];
  }
  return [{ id: shotAt(f).id, alpha: 1 }];
};

// ---------------- the road, the tree, the car ----------------
export const CX = 0, CZ = -110;            // scene centre (cleared of scatter)
export const TX = CX + 3.4, TZ = CZ;       // the tree beside the road
export const CAR_L = 3.8;
const sm = (u: number) => { const x = clamp01(u); return x * x * (3 - 2 * x); };
/** damped spring settle after an impulse (s) */
export const settleS = (tt: number, w = 18, d = 6) => (tt < 0 ? 0 : Math.exp(-d * tt) * Math.cos(w * tt));
export type CarPose = { x: number; y: number; z: number; yaw: number; pitch: number; roll: number; wheel: number; crumple: number };
/** the car: 13 m/s up the road, swerves right into the tree; on impact it stops dead, the rear kicks up about the front
 *  axle (pitch) and slams back with two bounces; the body rocks side to side */
export const carPose = (t: number): CarPose => {
  const v = 13, t1 = 1.55, z0 = TZ - CAR_L / 2 - 0.4 - v * T_CRASH;
  const lat = (tt: number) => (CX - 1.0) + (TX - 0.15 - (CX - 1.0)) * sm((tt - t1) / (T_CRASH - t1)) ** 1.6;
  if (t < T_CRASH) {
    const z = z0 + v * t, x = lat(t), dx = (lat(t + 0.02) - lat(t)) / 0.02;
    return { x, y: 0, z, yaw: Math.atan2(dx, v), pitch: 0, roll: -0.03 * dx, wheel: (v * t) / 0.36, crumple: 0 };
  }
  const tt = t - T_CRASH, zc = z0 + v * T_CRASH + 0.25 * (1 - Math.exp(-30 * tt));
  const up = tt < 0.16 ? Math.sin((tt / 0.16) * Math.PI / 2) : Math.max(0, Math.cos(Math.min(1, (tt - 0.16) / 0.2) * Math.PI / 2));
  const bounce = tt > 0.36 ? 0.25 * Math.abs(Math.sin((tt - 0.36) * 14)) * Math.exp(-5 * (tt - 0.36)) : 0;
  const pitch = 0.32 * up + 0.32 * bounce;  // + = rear up (rotation about the front axle)
  const x = lat(T_CRASH), dxe = (lat(T_CRASH) - lat(T_CRASH - 0.02)) / 0.02;
  return { x, y: 0, z: zc, yaw: Math.atan2(dxe, v), pitch, roll: 0.06 * settleS(tt, 14, 4), wheel: (v * T_CRASH) / 0.36 + 2 * (1 - Math.exp(-10 * tt)), crumple: Math.min(1, tt / 0.05) };
};
/** a point fixed to the car body (local x, y, z; front axle pivot at z = +1.25, y = 0.36) in world space */
export const carPoint = (c: CarPose, lx: number, ly: number, lz: number): [number, number, number] => {
  const py = ly - 0.36, pz = lz - 1.25, cp = Math.cos(c.pitch), sp = Math.sin(c.pitch);
  const y2 = py * cp - pz * sp + 0.36, z2 = py * sp + pz * cp + 1.25;
  const cy = Math.cos(c.yaw), sy = Math.sin(c.yaw);
  return [c.x + lx * cy + z2 * sy, c.y + y2, c.z - lx * sy + z2 * cy];
};
/** the front-right tyre tears off and rolls away (projectile, then rolling with friction) */
export const tyrePose = (t: number) => {
  const tt = t - T_CRASH; if (tt < 0) return null;
  const c = carPose(T_CRASH), x0 = c.x + 0.8, z0 = c.z + 1.2, vy = 3.2, g = 9.8, ta = (2 * vy) / g;
  const vx = -2.6, vz = -3.0;
  if (tt < ta) return { x: x0 + vx * tt, y: 0.36 + vy * tt - 0.5 * g * tt * tt, z: z0 + vz * tt, spin: 14 * tt, tilt: 0.5 };
  const u = tt - ta, d = (1 - Math.exp(-0.9 * u)) / 0.9;
  return { x: x0 + vx * ta + vx * d, y: 0.36 + 0.12 * Math.abs(Math.sin(u * 9)) * Math.exp(-4 * u), z: z0 + vz * ta + vz * d, spin: 14 * ta + 9 * d, tilt: 0.15 };
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
const IZ = INTRO_Z;

/** circle around a subject: angle a (rad, 0 = camera on -z side), radius R, height h */
const orbit = (cx: number, cz: number, R: number, h: number, a: number, ly: number, f: number, f0: number, rate: number, rest: Partial<Cam> = {}): Shot =>
  dolly([cx + R * Math.sin(a), h, cz - R * Math.cos(a)], [cx, ly, cz], f, f0, rate, rest);
const lin = (f: number, f0: number, f1: number) => clamp01((f - f0) / (f1 - f0));
export const SX = TX - 2.8, SZ = TZ + 1.6;   // where he stands to shoot the tree
export const banditX = (_f: number) => 0;
const CAMS: Record<number, Key[]> = {
  // tracking alongside the convertible, low, slightly ahead, drifting around it
  1: [{ f: 0, s: (f) => { const c = carPose(f / FPS), a = -1.25 + 0.35 * lin(f, 0, 56);
    return { pos: [c.x + 6.2 * Math.sin(a), 1.7, c.z - 6.2 * Math.cos(a) + 0.5], look: [c.x - 0.2, 1.05, c.z], fov: 44, roll: 0.02 }; } }],
  // wide by the tree: the swerve and the impact (crash zoom)
  2: [{ f: 56, s: (f) => dolly([CX - 5.5, 1.4, TZ - 11], [TX - 1.2, 1.0, TZ - 2.5], f, 56, 0.002, { fov: 46 - 8 * easeOut(lin(f, 72, 75)), roll: -0.02 }) }],
  // low close on the wreck: smoke, the dazed driver, the tyre rolling at the lens
  3: [{ f: 84, s: (f) => dolly([TX - 4.6, 0.9, TZ - 7.2], [TX - 0.6, 0.95, TZ - 2.4], f, 84, 0.004, { fov: 44, roll: 0.03 }) }],
  // he jumps out; a fast flight (14 f) round to the side, character screen-left and tree screen-right; low hero angle
  4: [
    { f: 120, s: (f) => orbit(TX - 1.9, TZ - 2.6, 5.2, 1.5, -0.95 + 0.25 * lin(f, 120, 170), 1.0, f, 120, 0.002, { fov: 46 }) },
    { f: 168, dur: 14, s: (f) => dolly([SX - 2.0, 1.3, SZ + 5.0], [SX + 1.4, 1.3, TZ + 0.8], f, 168, 0.002, { fov: 46 }) },
    { f: 200, dur: 26, s: (f) => dolly([SX - 1.9, 0.95, SZ + 4.6], [SX + 1.05, 1.35, TZ + 0.8], f, 200, 0.003, { fov: 46, roll: -0.03 }) },
  ],
  // crane up and back: the whole scene
  5: [{ f: 270, s: (f) => { const u = sm(lin(f, 270, 300)); return { pos: [SX + 0.5 - 1.5 * u, 1.6 + 4.2 * u, SZ + 8 + 5 * u], look: [TX - 1.4, 1.0, TZ - 0.8], fov: 46 }; } }],
};
/** impact kicks: flip sign every frame, decay over 7 frames */
const KICKS = [T_CRASH, ...[7.0, 7.5, 8.05]];
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
  { f: 0, cInf: 10 },
  { f: 56, cInf: 7, focus: () => [TX - 1, 1.0, TZ - 2] },
  { f: 84, cInf: 12, focus: () => [TX - 0.6, 0.9, TZ - 2.2] },
  { f: 124, cInf: 9 },
  { f: 270, cInf: 6, focus: () => [TX - 1.4, 1.0, TZ - 0.8] },
];
export const dofAt = (f: number) => {
  let i = 0; while (i + 1 < DOF.length && f >= DOF[i + 1].f) i++;
  const d = DOF[i], p = DOF[Math.max(0, i - 1)];
  const k = d.dur ? Math.min(1, (f - d.f) / d.dur) : 1;
  return { cInf: p.cInf + (d.cInf - p.cInf) * k, focus: d.focus };
};
