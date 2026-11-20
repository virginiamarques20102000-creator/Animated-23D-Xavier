// "O fim de Lampião" (73,6 s): timeline synced to the user's narration (public/narracao.mp3).
// Sentence starts (s, from silence detection): 0 Lampião era… | 3.65 Durante quase vinte anos… | 7.99 Mas, em uma manhã…
// 12.08 tudo mudou | 13.37 Ele estava escondido… | 19.61 às margens… | 24.58 cercado pela vegetação… | 27.28 Mas alguém
// descobriu… | 33.47 se aproximaram… | 38.31 Antes do amanhecer… | 42.16 Os cangaceiros… | 45.54 Lampião tentou reagir…
// 48.64 Maria Bonita… | 52.69 Ao todo, onze… | 56.31 Mas o que aconteceu depois… | 63.40 Naquele dia… | 68.89 E uma das…
export const FPS = 30;
export const TOTAL = 1926;
export const D0 = 0;
export type V3 = [number, number, number];

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const smooth = (x: number) => { const u = clamp01(x); return u * u * (3 - 2 * u); };
export const easeOut = (u: number) => 1 - (1 - clamp01(u)) ** 4;

/** beats (s) */
export const T_CRASH = 900;            // the car hits the tree
export const T_LAND = T_CRASH + 0.993;     // the driver, thrown out, hits the ground
export const T_UP = 905;                   // starts getting up
export const T_WALK = 906, T_WALK_END = 907;
export const T_DRAW = 908;                 // pulls the pistol
export const SHOTS_AT = [909, 910, 911];  // three shots into the tree (the first one is followed by the camera)
export const T_IMPACT = 909.5;               // the followed bullet hits the trunk
export const T_CRACK = 920;                // the trunk cracks and the tree starts to fall
export const T_EXIT = 99;
export const T_HIT = T_CRASH, T_NOISE = 99, T_RAISE = 99, T_FIRE = 99, T_SHOCK = 99, T_MARIA = 99;
export const GUNSHOTS: number[] = [];
export const physT = (tt: number) => tt;

export type Light = "day" | "golden" | "night";
export type Crowd = "aerial" | "treaty" | "port" | "esp" | "reveal" | "village" | "war" | "sepe" | "gather" | "march" | "front" | "ride" | "fallen" | "caiboate" | "feather" | "centuries" | "legend"
  | "drive" | "crash" | "wreck" | "out" | "wide" | "ginga" | "face" | "charge" | "strike" | "after" | "idle" | "intro" | "walk" | "dawn" | "river" | "none" | "rest" | "surround" | "watch" | "creep" | "aim" | "surprise" | "lampiao" | "maria" | "hats" | "town" | "end";
export type ShotDef = { id: number; a: number; b: number; light: Light; crowd: Crowd };
// cuts ~2 frames before each sentence of the narration (silence detection + syllable alignment)
export const SHOTS: ShotDef[] = [
  { id: 1, a: 0, b: 56, light: "day", crowd: "aerial" },          // Em 1750,
  { id: 2, a: 56, b: 203, light: "day", crowd: "treaty" },        // dois impérios decidiram trocar uma terra que nem sequer lhes pertencia.
  { id: 3, a: 203, b: 261, light: "day", crowd: "port" },         // De um lado, Portugal.
  { id: 4, a: 261, b: 319, light: "day", crowd: "esp" },          // Do outro, Espanha.
  { id: 5, a: 319, b: 443, light: "day", crowd: "reveal" },       // Mas havia um problema: aquela terra já tinha habitantes.
  { id: 6, a: 443, b: 533, light: "day", crowd: "village" },      // E eles não estavam dispostos a abandoná-la.
  { id: 7, a: 533, b: 678, light: "day", crowd: "war" },          // Foi assim que começou uma das guerras mais impressionantes...
  { id: 8, a: 678, b: 816, light: "day", crowd: "sepe" },         // No meio desse conflito surgiu um líder indígena chamado Sepé Tiaraju.
  { id: 9, a: 816, b: 1003, light: "day", crowd: "gather" },      // Ele reuniu guerreiros Guarani ... Sete Povos das Missões.
  { id: 10, a: 1003, b: 1100, light: "day", crowd: "march" },     // Mas Portugal e Espanha tinham armas, soldados
  { id: 11, a: 1100, b: 1206, light: "day", crowd: "front" },     // e um objetivo: conquistar aquele território.
  { id: 12, a: 1206, b: 1398, light: "day", crowd: "ride" },      // Em 7 de fevereiro de 1756, durante um confronto, o cavalo de Sepé caiu.
  { id: 13, a: 1398, b: 1501, light: "day", crowd: "fallen" },    // Ele foi ferido e morto pelas tropas inimigas.
  { id: 14, a: 1501, b: 1674, light: "golden", crowd: "caiboate" },  // Três dias depois ... Batalha de Caiboaté.
  { id: 15, a: 1674, b: 1717, light: "golden", crowd: "feather" },   // Sepé morreu.
  { id: 16, a: 1717, b: 1808, light: "golden", crowd: "centuries" }, // Mas sua resistência atravessou os séculos.
  { id: 17, a: 1808, b: TOTAL, light: "golden", crowd: "legend" },   // E sua história ainda precisa ser conhecida.
];
export const XFADE: Record<number, number> = { 4: 4, 14: 14, 16: 10, 17: 12 };
export const FLASH_AT = -100;
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
export const TX = CX + 10, TZ = CZ - 3;    // a lone tree on the field
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
// ---------------- the story's places ----------------
export const PT: [number, number] = [CX - 1.4, CZ], ES: [number, number] = [CX + 1.4, CZ];       // the two soldiers of the treaty
export const FLAG_P: [number, number] = [CX - 3.1, CZ + 1.2], FLAG_E: [number, number] = [CX + 3.1, CZ + 1.2];
export const VZ = CZ + 10.5;                                                                         // the Guarani at the plaza
export const MZ = CZ + 26;                                                                            // church front
export const SEPE_WALK = (t: number): [number, number] => { const u = clamp01((t - 22.6) / 2.5), e = u * (2 - u); return [CX, CZ - 2.5 - 4.0 * e]; };
// ---------------- Sepé's horse: gallops at 7.5 m/s, shot from under him at TF; he is thrown ----------------
export const TF = 45.4, XF = CX + 2, ZH = CZ - 14, HV = 7.5;
export const horseAt = (t: number) => {
  if (t < TF) return { x: XF - HV * (TF - t), fall: 0, ph: ((t * 2.3) % 1 + 1) % 1 };
  const tt = t - TF; return { x: XF + (HV * (1 - Math.exp(-3.2 * tt))) / 3.2, fall: Math.min(1, tt / 0.55), ph: 0 };
};
const TV = [6.2, 3.0];
export const T_SLAND = TF + 0.06 + (TV[1] + Math.sqrt(TV[1] * TV[1] + 2 * 9.8 * 1.35)) / 9.8;
export const sepeThrown = (t: number) => {
  const t0 = TF + 0.06, h0 = horseAt(t0);
  if (t < t0) return null;
  if (t < T_SLAND) { const tt = t - t0; return { x: h0.x + TV[0] * tt, y: 1.6 + TV[1] * tt - 4.9 * tt * tt, roll: (Math.PI / 2 + 2 * Math.PI) * (tt / (T_SLAND - t0)), ph: "fly" as const }; }
  const tl = t - T_SLAND, xl = h0.x + TV[0] * (T_SLAND - t0);
  return { x: xl + 1.0 * (1 - Math.exp(-6 * tl)), y: 0.25 + (tl < 0.16 ? 0.12 * Math.sin((tl / 0.16) * Math.PI) : 0), roll: Math.PI / 2, ph: "lie" as const };
};
export const SEPE_REST = (() => { const s2 = sepeThrown(TF + 6)!; return [s2.x, ZH] as [number, number]; })();
export const HILL: [number, number, number] = [CX - 26, 3.0, CZ + 6];
const lerp3 = (a: V3, b: V3, k: number): V3 => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
const CAMS: Record<number, Key[]> = {
  // aerial over the pampa toward the Mission, descending fast
  1: [{ f: 0, s: (f) => { const u = easeOut(lin(f, 0, 56)); return { pos: lerp3([CX - 14, 26, CZ - 48], [CX - 4, 9, CZ - 24], u), look: [CX, 2, CZ + 14], fov: 50, roll: 0.03 * (1 - u) }; } }],
  // the two soldiers of the treaty with their flags; then the camera rises over them toward the land and the church
  2: [
    { f: 52, s: (f) => orbit(CX, CZ + 0.3, 6.2, 1.5, -0.25 + 0.35 * lin(f, 52, 150), 1.3, f, 52, 0.002, { fov: 44 }) },
    { f: 150, dur: 50, s: (f) => dolly([CX, 3.2, CZ - 1.0], [CX, 4.0, MZ], f, 150, 0.002, { fov: 46 }) },
  ],
  3: [{ f: 203, s: (f) => dolly([PT[0] + 2.0, 1.5, PT[1] - 2.0], [PT[0], 1.45, PT[1]], f, 203, 0.005, { fov: 40, roll: 0.02 }) }],
  4: [{ f: 257, s: (f) => { const c = dolly([ES[0] - 2.0, 1.5, ES[1] - 2.0], [ES[0], 1.45, ES[1]], f, 257, 0.005, { fov: 40, roll: -0.02 });
    return { ...c, look: [c.look[0] - 5 * (1 - easeOut(lin(f, 257, 268))) * (f < 268 ? 1 : 0), c.look[1], c.look[2]] }; } }],   // lands from a whip pan
  // pull back and up: the soldiers small in the foreground, the Guarani and the Mission beyond
  5: [{ f: 319, s: (f) => { const u = easeOut(lin(f, 319, 420)); return { pos: lerp3([CX, 1.6, CZ - 3.5], [CX - 2, 6.5, CZ - 11], u), look: lerp3([CX, 1.4, CZ + 2], [CX, 1.6, VZ], u), fov: 46 }; } }],
  // low hero push-in on the Guarani who will not leave
  6: [{ f: 443, s: (f) => dolly([CX + 0.4, 0.75, VZ - 6.2], [CX, 1.35, VZ], f, 443, 0.004, { fov: 46, roll: 0.02 }) }],
  // the war: down the soldiers' firing line from its end, tracking along it; smoke and arrows
  7: [{ f: 533, s: (f) => { const k = lin(f, 533, 678); return dolly([CX - 12 + 4 * k, 1.35, CZ - 17.6], [CX - 1 + 4 * k, 1.2, CZ - 15.4], f, 533, 0.002, { fov: 48, roll: -0.02 }); } }],
  // Sepé walks out of the gunsmoke toward the low camera
  8: [{ f: 678, s: (f) => { const p2 = SEPE_WALK(f / FPS); return dolly([CX + 0.3, 0.85, p2[1] - 4.8 + 0.6 * lin(f, 678, 816)], [CX, 1.45, p2[1]], f, 678, 0.003, { fov: 42 }); } }],
  // he and the warriors; then the crane up reveals the Mission behind them
  9: [
    { f: 816, s: (f) => orbit(CX, CZ - 1.5, 7.0, 1.1, -0.35 + 0.3 * lin(f, 816, 905), 1.3, f, 816, 0.002, { fov: 46 }) },
    { f: 905, dur: 70, s: (f) => dolly([CX + 1, 7.5, CZ - 13], [CX, 5.5, MZ + 4], f, 905, 0.0015, { fov: 50 }) },
  ],
  // the column marching, tracked from the side
  10: [{ f: 1003, s: (f) => { const z = marchZ(f / FPS); return { pos: [CX - 8.5, 1.3, z - 3.5], look: [CX + 2, 1.15, z - 3.0], fov: 48, roll: 0.02 }; } }],
  // the front rank comes on at the low lens
  11: [{ f: 1100, s: (f) => dolly([CX + 0.3, 0.6, CZ - 15.5], [CX, 1.4, CZ - 22], f, 1100, 0.003, { fov: 44 }) }],
  // the ride, tracked from the side; slows and stops when the horse goes down
  12: [{ f: 1206, s: (f) => { const t = f / FPS, h = horseAt(t), x = t < TF ? h.x : XF + (horseAt(TF + 3).x - XF) * 0.6 + 2.6 * easeOut((t - TF) / 1.2);
    return { pos: [x - 0.6, 1.35, ZH - 6.4], look: [x - 0.3, 1.1, ZH], fov: 46, roll: 0.02 }; } }],
  // low on the ground beside him
  13: [{ f: 1398, s: (f) => dolly([SEPE_REST[0] + 0.1, 1.35, ZH - 3.3], [SEPE_REST[0] + 0.45, 0.3, ZH], f, 1398, 0.004, { fov: 44 }) }],
  // Caiboaté at sunset: crane up and back over the lines in their smoke
  14: [{ f: 1494, s: (f) => { const u = smooth(lin(f, 1494, 1674)); return { pos: lerp3([CX - 9, 1.2, CZ - 24], [CX - 15, 9, CZ - 34], u), look: [CX, 1.2, CZ - 12], fov: 50 }; } }],
  // the feather on the grass
  15: [{ f: 1674, s: (f) => dolly([SEPE_REST[0] + 0.5, 1.25, ZH - 1.1], [SEPE_REST[0] + 0.1, 0.02, ZH], f, 1674, 0.003, { fov: 40 }) }],
  // rising from the feather to the Mission at sunset
  16: [{ f: 1712, s: (f) => { const u = smooth(lin(f, 1712, 1808)); return { pos: lerp3([SEPE_REST[0] + 0.5, 1.25, ZH - 1.1], [SEPE_REST[0] - 3, 10, ZH - 6], u), look: lerp3([SEPE_REST[0] + 0.2, 0.1, ZH], [CX, 6, MZ], u), fov: 46 }; } }],
  // the legend on the hill at sunset; the camera pulls back and up
  17: [{ f: 1802, s: (f) => { const u = smooth(lin(f, 1802, 1926)); return { pos: lerp3([HILL[0] + 1.6, HILL[1] + 0.6, HILL[2] - 3.0], [HILL[0] + 4.5, HILL[1] + 1.6, HILL[2] - 8.5], u), look: [HILL[0], HILL[1] + 1.3, HILL[2]], fov: 44 }; } }],
};
/** the column marches north at 1.15 m/s */
export const marchZ = (t: number) => CZ - 46 + 1.15 * (t - 33.4);
/** unit normal to the fall line pointing to the side the shooter is on */
export const sideN = (): [number, number] => { let nx = -fallDir[1], nz = fallDir[0]; if ((SPOT[0] - TX) * nx + (SPOT[1] - TZ) * nz < 0) { nx = -nx; nz = -nz; } return [nx, nz]; };
/** the walk: from where he got up to the shooting spot at 1.3 m/s (eased in/out at the ends) */
export const walkAt = (t: number): [number, number] => {
  const u = upAt(), k = clamp01((t - T_WALK) / (T_WALK_END - T_WALK)), e = k * k * (3 - 2 * k);
  return [u[0] + (SPOT[0] - u[0]) * e, u[2] + (SPOT[1] - u[2]) * e];
};
/** impact kicks: flip sign every frame, decay over 7 frames */
const KICKS = [TF, T_SLAND, 18.2, 19.0, 19.8, 51.0, 52.2, 53.4];
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
  { f: 0, cInf: 0 }, { f: 56, cInf: 9 }, { f: 150, dur: 40, cInf: 4 }, { f: 203, cInf: 14 }, { f: 319, cInf: 6 }, { f: 443, cInf: 12 },
  { f: 533, cInf: 8 }, { f: 678, cInf: 14 }, { f: 816, cInf: 9 }, { f: 905, dur: 40, cInf: 3 }, { f: 1003, cInf: 10 }, { f: 1100, cInf: 12 },
  { f: 1206, cInf: 9 }, { f: 1398, cInf: 16 }, { f: 1501, cInf: 5 }, { f: 1674, cInf: 18 }, { f: 1717, dur: 60, cInf: 4 }, { f: 1808, cInf: 8 },
];
export const dofAt = (f: number) => {
  let i = 0; while (i + 1 < DOF.length && f >= DOF[i + 1].f) i++;
  const d = DOF[i], p = DOF[Math.max(0, i - 1)];
  const k = d.dur ? Math.min(1, (f - d.f) / d.dur) : 1;
  return { cInf: p.cInf + (d.cInf - p.cInf) * k, focus: d.focus };
};
