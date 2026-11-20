// "O fim de Lampião" (73,6 s): timeline synced to the user's narration (public/narracao.mp3).
// Sentence starts (s, from silence detection): 0 Lampião era… | 3.65 Durante quase vinte anos… | 7.99 Mas, em uma manhã…
// 12.08 tudo mudou | 13.37 Ele estava escondido… | 19.61 às margens… | 24.58 cercado pela vegetação… | 27.28 Mas alguém
// descobriu… | 33.47 se aproximaram… | 38.31 Antes do amanhecer… | 42.16 Os cangaceiros… | 45.54 Lampião tentou reagir…
// 48.64 Maria Bonita… | 52.69 Ao todo, onze… | 56.31 Mas o que aconteceu depois… | 63.40 Naquele dia… | 68.89 E uma das…
export const FPS = 30;
export const TOTAL = 360;
export const D0 = 0;
export type V3 = [number, number, number];

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const smooth = (x: number) => { const u = clamp01(x); return u * u * (3 - 2 * u); };
export const easeOut = (u: number) => 1 - (1 - clamp01(u)) ** 4;

/** beats (s) */
export const T_CRASH = 60 / 30;            // the car hits the tree
export const T_LAND = T_CRASH + 0.993;     // the driver, thrown out, hits the ground
export const T_UP = 4.2;                   // starts getting up
export const T_WALK = 4.9, T_WALK_END = 6.3;
export const T_DRAW = 6.4;                 // pulls the pistol
export const SHOTS_AT = [6.9, 8.15, 8.4];  // three shots into the tree (the first one is followed by the camera)
export const T_IMPACT = 7.9;               // the followed bullet hits the trunk
export const T_CRACK = 8.7;                // the trunk cracks and the tree starts to fall
export const T_EXIT = 99;
export const T_HIT = T_CRASH, T_NOISE = 99, T_RAISE = 99, T_FIRE = 99, T_SHOCK = 99, T_MARIA = 99;
export const GUNSHOTS: number[] = [];
export const physT = (tt: number) => tt;

export type Light = "day" | "golden" | "night";
export type Crowd = "drive" | "crash" | "wreck" | "out" | "wide" | "ginga" | "face" | "charge" | "strike" | "after" | "idle" | "intro" | "walk" | "dawn" | "river" | "none" | "rest" | "surround" | "watch" | "creep" | "aim" | "surprise" | "lampiao" | "maria" | "hats" | "town" | "end";
export type ShotDef = { id: number; a: number; b: number; light: Light; crowd: Crowd };
export const SHOTS: ShotDef[] = [
  { id: 1, a: 0, b: 44, light: "day", crowd: "drive" },     // driving, camera alongside
  { id: 2, a: 44, b: 62, light: "day", crowd: "crash" },    // wide by the tree: swerve, impact
  { id: 3, a: 62, b: 145, light: "day", crowd: "wreck" },   // follows the driver thrown out, lands, slides, lies dazed, gets up
  { id: 4, a: 145, b: 207, light: "day", crowd: "out" },    // walks (tracking from the side), turns, draws, aims, fires
  { id: 5, a: 207, b: 237, light: "day", crowd: "out" },    // the camera rides with the bullet (slow motion)
  { id: 6, a: 237, b: 260, light: "day", crowd: "out" },    // shots 2 and 3
  { id: 7, a: 260, b: TOTAL, light: "day", crowd: "wide" }, // the tree falls; he falls on his seat and scoots back
];
export const XFADE: Record<number, number> = { 5: 4 };
export const FLASH_AT = 60;
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
  const v = 13, t1 = T_CRASH - 0.85, z0 = TZ - CAR_L / 2 - 0.4 - v * T_CRASH;
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

// ---------------- the driver thrown out (inertia), the bullet, the falling tree ----------------
export type Body = { x: number; y: number; z: number; roll: number; ph: "seat" | "fly" | "slide" | "lie" | "up" | "stand" };
const V0 = [-2.4, 4.2, 4.6];
const seat0 = () => carPoint(carPose(T_CRASH), 0.4, 0.66, -0.25);
const landAt = () => { const s0 = seat0(), T = T_LAND - T_CRASH; return [s0[0] + V0[0] * T, 0, s0[2] + V0[2] * T]; };
const SLIDE = 1.0;
export const upAt = () => { const l = landAt(), h = Math.hypot(V0[0], V0[2]); return [l[0] + (V0[0] / h) * SLIDE, 0, l[2] + (V0[2] / h) * SLIDE]; };
/** keeps going when the car stops: launched over the side of the windscreen, tumbles 1.25 turns, lands, bounces once,
 *  slides on his front and stops; lies dazed; rolls back up onto his feet */
export const driverBody = (t: number): Body => {
  if (t < T_CRASH) { const p = carPoint(carPose(t), 0.4, 0.66, -0.25); return { x: p[0], y: p[1], z: p[2], roll: 0, ph: "seat" }; }
  const s0 = seat0();
  if (t < T_LAND) {
    const tt = t - T_CRASH, u = tt / (T_LAND - T_CRASH);
    return { x: s0[0] + V0[0] * tt, y: Math.max(0, s0[1] + V0[1] * tt - 4.9 * tt * tt), z: s0[2] + V0[2] * tt, roll: (Math.PI / 2 + 2 * Math.PI) * u, ph: "fly" };
  }
  const l = landAt(), h = Math.hypot(V0[0], V0[2]), tl = t - T_LAND, d = SLIDE * (1 - Math.exp(-6.5 * tl));
  const bounce = tl < 0.16 ? 0.14 * Math.sin((tl / 0.16) * Math.PI) : 0;
  const x = l[0] + (V0[0] / h) * d, z = l[2] + (V0[2] / h) * d;
  if (t < T_UP) return { x, y: bounce, z, roll: Math.PI / 2, ph: tl < 0.5 ? "slide" : "lie" };
  const uu = clamp01((t - T_UP) / 0.5), e = uu * uu * (3 - 2 * uu);
  return { x, y: 0, z, roll: (Math.PI / 2) * (1 - e), ph: uu < 1 ? "up" : "stand" };
};
/** the shooting spot and the line of fire */
export const SPOT: [number, number] = [TX - 2.8, TZ + 1.6];
const FD = (() => { const dx = TX - SPOT[0], dz = TZ - SPOT[1], h = Math.hypot(dx, dz); return [dx / h, dz / h]; })();
export const MUZZLE: [number, number, number] = [SPOT[0] + FD[0] * 0.85, 1.22, SPOT[1] + FD[1] * 0.85];
export const HIT: [number, number, number] = [TX - FD[0] * 0.4, 1.28, TZ - FD[1] * 0.4];
export const FIRE_DIR = FD;
/** the followed bullet: a fast first burst (20 % of the time, 30 % of the way), then slow motion to the trunk */
export const bulletAt = (t: number) => {
  const u = clamp01((t - SHOTS_AT[0]) / (T_IMPACT - SHOTS_AT[0])); if (t < SHOTS_AT[0] || t >= T_IMPACT) return null;
  const p = u < 0.2 ? 1.5 * u : 0.3 + 0.7 * ((u - 0.2) / 0.8);
  return { x: MUZZLE[0] + (HIT[0] - MUZZLE[0]) * p, y: MUZZLE[1] + (HIT[1] - MUZZLE[1]) * p, z: MUZZLE[2] + (HIT[2] - MUZZLE[2]) * p, spin: t * 9, fast: u < 0.2 ? 1 : 0.35 };
};
/** the falling tree: a rigid rod pivoting on its base, theta'' = (3g / 2L) sin(theta), from a cracked lean; lands, bounces */
export const TREE_L = 6.5;
// falls toward him but 26 deg off his line: the trunk passes ~1.5 m beside the spot he was standing on
const FALL_DIR = (() => { let dx = SPOT[0] - TX, dz = SPOT[1] - TZ; const h0 = Math.hypot(dx, dz); dx /= h0; dz /= h0;
  const fx = dx * 3.2 + dz * 1.6, fz = dz * 3.2 - dx * 1.6, h = Math.hypot(fx, fz); return [fx / h, fz / h]; })();
export const fallDir = FALL_DIR;
const FALL = (() => {
  const out: number[] = [], dt = 1 / 240; let th = 0, w = 0, landed = -1;
  for (let i = 0; i < 240 * 5; i++) {
    const t = i * dt;
    if (t < 0.25) { th = 0.03 * (t / 0.25) + 0.004 * Math.sin(t * 90); w = 0.4; }       // creak: small jerky lean
    else if (landed < 0) { w += 3.0 * (3 * 9.8 / (2 * TREE_L)) * Math.sin(th) * dt; th += w * dt; if (th >= Math.PI / 2 - 0.06) { th = Math.PI / 2 - 0.06; landed = t; w = -w * 0.18; } }
    else { w += -40 * (th - (Math.PI / 2 - 0.06)) * dt - 6 * w * dt; th += w * dt; th = Math.min(th, Math.PI / 2 - 0.06); }
    if (i % 8 === 0) out.push(th, landed);
  }
  return out;
})();
export const treeFall = (t: number) => {
  if (t < T_CRACK) return { th: 0, landed: -1 };
  const i = Math.min(FALL.length / 2 - 1, Math.floor(((t - T_CRACK) * 240) / 8));
  return { th: FALL[2 * i], landed: FALL[2 * i + 1] >= 0 ? T_CRACK + FALL[2 * i + 1] : -1 };
};
export const T_TREE_DOWN = (() => { for (let t = T_CRACK; t < T_CRACK + 5; t += 1 / 60) { const r = treeFall(t); if (r.landed > 0) return r.landed; } return T_CRACK + 1.2; })();

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
export const SX = SPOT[0], SZ = SPOT[1];
export const banditX = (_f: number) => 0;
const bodyAt = (f: number) => driverBody(f / FPS);
const CAMS: Record<number, Key[]> = {
  // tracking alongside the convertible, low, slightly ahead, drifting around it
  1: [{ f: 0, s: (f) => { const c = carPose(f / FPS), a = -1.25 + 0.35 * lin(f, 0, 44);
    return { pos: [c.x + 6.2 * Math.sin(a), 1.7, c.z - 6.2 * Math.cos(a) + 0.5], look: [c.x - 0.2, 1.05, c.z], fov: 44, roll: 0.02 }; } }],
  // wide by the tree: the swerve and the impact (crash zoom)
  2: [{ f: 44, s: (f) => dolly([CX - 5.5, 1.4, TZ - 11], [TX - 1.2, 1.0, TZ - 2.5], f, 44, 0.002, { fov: 46 - 8 * easeOut(lin(f, 60, 63)), roll: -0.02 }) }],
  // rides alongside the body in flight (side, low), then drops to a low close on the dazed face, then rises as he stands
  3: [
    { f: 62, s: (f) => { const b = bodyAt(f); return { pos: [b.x - 4.2, 0.9 + 0.5 * b.y, b.z - 1.2], look: [b.x, 0.6 + 0.6 * b.y, b.z + 0.3], fov: 44, roll: -0.03 }; } },
    { f: 98, dur: 16, s: (f) => { const u = upAt(); return dolly([u[0] - 2.3 + 0.14, 0.45, u[2] - 0.9 - 0.37], [u[0] + 0.14, 0.3, u[2] - 0.37], f, 98, 0.004, { fov: 40 }); } },
    { f: 126, dur: 18, s: (f) => { const u = upAt(); return dolly([u[0] - 3.4, 1.2, u[2] - 1.3], [u[0], 1.0, u[2]], f, 126, 0.002, { fov: 44 }); } },
  ],
  // tracks him from the side as he walks; swings round behind his shoulder for the draw (tree screen-right)
  4: [
    { f: 145, s: (f) => { const p = walkAt(f / FPS); return { pos: [p[0] - 4.4, 1.15, p[1] - 0.6], look: [p[0], 1.0, p[1] - 0.4], fov: 44 }; } },
    { f: 184, dur: 14, s: (f) => dolly([SX - 2.0, 1.25, SZ + 5.0], [SX + 1.4, 1.3, TZ + 0.8], f, 184, 0.003, { fov: 46 }) },
  ],
  // the bullet camera: beside and just behind the bullet, looking along its path; the trunk grows ahead
  5: [{ f: 203, s: (f) => { const t = f / FPS, b = bulletAt(Math.max(SHOTS_AT[0] + 0.001, Math.min(t, T_IMPACT - 0.001)))!, sx = -FIRE_DIR[1], sz = FIRE_DIR[0];
    return { pos: [b.x + sx * 0.34 - FIRE_DIR[0] * 0.24, b.y + 0.05, b.z + sz * 0.34 - FIRE_DIR[1] * 0.24], look: [b.x + FIRE_DIR[0] * 0.02, b.y, b.z + FIRE_DIR[1] * 0.02], fov: 46, roll: 0.05 * Math.sin(t * 3) }; } }],
  // back on the shooter: shots 2 and 3
  6: [{ f: 237, s: (f) => dolly([SX - 1.9, 0.95, SZ + 4.6], [SX + 1.05, 1.35, TZ + 0.8], f, 237, 0.003, { fov: 46, roll: -0.03 }) }],
  // wide and low, side-on to the fall: the tree comes down beside him, he scoots back
  // on HIS side of the fall line, so he is never hidden behind the trunk; looks up at the tree, follows it down
  7: [
    { f: 255, s: (f) => { const [nx, nz] = sideN(), mx = TX + fallDir[0] * 2.6, mz = TZ + fallDir[1] * 2.6;
      return dolly([mx + nx * 9.5, 1.8, mz + nz * 9.5], [mx, 3.2, mz], f, 255, 0.0012, { fov: 55 }); } },
    { f: Math.round((T_CRACK + 0.55) * FPS), dur: 26, s: (f) => { const [nx, nz] = sideN(), mx = TX + fallDir[0] * 3.4, mz = TZ + fallDir[1] * 3.4;
      return dolly([mx + nx * 8.0, 1.4, mz + nz * 8.0], [mx, 1.0, mz], f, Math.round((T_CRACK + 0.55) * FPS), 0.002, { fov: 52 }); } },
  ],
};
/** unit normal to the fall line pointing to the side the shooter is on */
export const sideN = (): [number, number] => { let nx = -fallDir[1], nz = fallDir[0]; if ((SPOT[0] - TX) * nx + (SPOT[1] - TZ) * nz < 0) { nx = -nx; nz = -nz; } return [nx, nz]; };
/** the walk: from where he got up to the shooting spot at 1.3 m/s (eased in/out at the ends) */
export const walkAt = (t: number): [number, number] => {
  const u = upAt(), k = clamp01((t - T_WALK) / (T_WALK_END - T_WALK)), e = k * k * (3 - 2 * k);
  return [u[0] + (SPOT[0] - u[0]) * e, u[2] + (SPOT[1] - u[2]) * e];
};
/** impact kicks: flip sign every frame, decay over 7 frames */
const KICKS = [T_CRASH, T_LAND, SHOTS_AT[0], T_IMPACT, SHOTS_AT[1], SHOTS_AT[2], T_TREE_DOWN];
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
  { f: 44, cInf: 7, focus: () => [TX - 1, 1.0, TZ - 2] },
  { f: 62, cInf: 12 },
  { f: 145, cInf: 9 },
  { f: 207, cInf: 16 },
  { f: 237, cInf: 9 },
  { f: 260, cInf: 6 },
];
export const dofAt = (f: number) => {
  let i = 0; while (i + 1 < DOF.length && f >= DOF[i + 1].f) i++;
  const d = DOF[i], p = DOF[Math.max(0, i - 1)];
  const k = d.dur ? Math.min(1, (f - d.f) / d.dur) : 1;
  return { cInf: p.cInf + (d.cInf - p.cInf) * k, focus: d.focus };
};
