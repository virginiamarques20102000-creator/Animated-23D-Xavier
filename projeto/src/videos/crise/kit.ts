// Cast, scene accumulator, cameras, animated vehicles, waving flags, signing insert, maps and overlays for the WW2 film.
import { Outfit, FrontOpts, SideOpts, INK, mix, shade } from "./toon";
import { Cam, Ctx, VW, VH, P, Act, drawAct, drawSprite, spriteCanvas, glow, puff, clamp, lerp, smooth, easeOut, easeIn, hash, rng, WP, mk, muzzle } from "./engine";
import { SPR, MX, MY, WX, WY, GER as GERP, POL as POLP, C14 } from "./paint";
import { TANKS, PLANES, PFS, FLAGS } from "./vehicles";
import { dust, wake, exhaust, glint, bounce } from "./fx";

// ---------------- cast (each scene gets its own variant via `v()`) ----------------
export const v = (o: Outfit, p: Partial<Outfit>): Outfit => ({ ...o, ...p });
export const HIT_CIV: Outfit = { jacket: "#3a3430", pants: "#2e2a26", boots: "#161210", hat: "sidepart", hair: "#2a1d16", moustache: "#1e1612", mstyle: "brush", tie: "#2a2420" };
export const HIT_BROWN: Outfit = { jacket: "#7a6644", pants: "#4a3a2a", boots: "#161210", hat: "sidepart", hair: "#2a1d16", moustache: "#1e1612", mstyle: "brush", tie: "#2a2420", sash: "#3a2a1c", buttons: "#c9a24a" };
export const HIT_GREY: Outfit = { jacket: "#6a6c62", pants: "#2a2a2c", boots: "#141414", hat: "sidepart", hair: "#2a1d16", moustache: "#1e1612", mstyle: "brush", sash: "#2a2420", buttons: "#c9a24a", medals: true };
export const HIT_CAP: Outfit = { ...HIT_GREY, hat: "peaked", cap: "#5a5c52" };
export const HIT_OLD: Outfit = { ...HIT_GREY, jacket: "#4e504a", hair: "#4a3e36", moustache: "#3a302a" };
export const STALIN: Outfit = { jacket: "#b8ae8a", pants: "#6a6448", boots: "#1e1a16", hat: "hair", hair: "#3a3632", moustache: "#2a2622", build: "stout", buttons: "#c9a24a" };
export const STALIN_CAP: Outfit = { ...STALIN, hat: "peaked", cap: "#6a6448", medals: true };
export const CHURCHILL: Outfit = { jacket: "#2a2a34", pants: "#2a2a34", boots: "#141414", hat: "bowler", build: "stout", tie: "#3a5a8a" };
export const FDR: Outfit = { jacket: "#3a4050", pants: "#3a4050", boots: "#141414", hat: "hair", hair: "#8a8682", glasses: true, tie: "#6a2a24" };
export const TRUMAN: Outfit = { jacket: "#4a4e58", pants: "#4a4e58", boots: "#141414", hat: "hair", hair: "#9a968e", glasses: true, tie: "#2a3a6a" };
export const CHAMBER: Outfit = { jacket: "#2a2826", pants: "#4a4844", boots: "#141414", hat: "homburg", cap: "#1d1b20", moustache: "#c8c0b6", tie: "#5a2a24" };
export const MUSSO: Outfit = { jacket: "#1e1c1e", pants: "#5a5a54", boots: "#141414", hat: "bald", build: "stout", sash: "#3a5a3a", buttons: "#c9a24a", medals: true };
export const HINDEN: Outfit = { jacket: "#4a5244", pants: "#3e463a", boots: "#141414", hat: "hair", hair: "#e8e6e0", moustache: "#f0efea", build: "stout", medals: true, buttons: "#c9a24a", sash: "#2a2a24" };
export const IKE: Outfit = { jacket: "#7a6a44", pants: "#7a6a44", boots: "#3a2a1a", hat: "garrison", cap: "#6a5a3a", hair: "#c8b48a", stars: true };
export const MACA: Outfit = { jacket: "#c4b28a", pants: "#c4b28a", boots: "#3a2a1a", hat: "peaked", cap: "#7a6a4a", glasses: false, tie: "#5a4a2a" };
export const SHIGE: Outfit = { jacket: "#1a1a1e", pants: "#3a3a40", boots: "#141414", hat: "tophat", glasses: true, tie: "#5a5a5a" };
export const UMEZU: Outfit = { jacket: "#7a6e46", pants: "#7a6e46", boots: "#2a2018", hat: "peaked", cap: "#7a6e46", moustache: "#1a1612", medals: true };
export const KEITEL: Outfit = { jacket: "#5e6458", pants: "#4a4e46", boots: "#141414", hat: "peaked", cap: "#5e6458", moustache: "#c8c0b6", medals: true, buttons: "#c9a24a", glasses: true };
export const PAULUS: Outfit = { jacket: "#5a5e54", pants: "#4a4e46", boots: "#141414", hat: "ushanka", cap: "#5a5248", medals: true, buttons: "#c9a24a" };
export const HIRO: Outfit = { jacket: "#2a2a2e", pants: "#2a2a2e", boots: "#141414", hat: "hair", hair: "#141414", glasses: true, moustache: "#141414", skin: "#f0d0a8" };
export const MOLOTOV: Outfit = { jacket: "#2e2e34", pants: "#2e2e34", boots: "#141414", hat: "hair", hair: "#3a3a3a", glasses: true, moustache: "#2a2a2a", tie: "#4a2a2a" };
export const RIBB: Outfit = { jacket: "#2a2a30", pants: "#2a2a30", boots: "#141414", hat: "hair", hair: "#7a6a5a", tie: "#1e1e1e" };
// soldiers: base looks, varied per scene (helmet tone, jacket tone) so no two scenes share the same soldier
export const WEH: Outfit = { jacket: "#6a7062", pants: "#5a6052", boots: "#1a1816", hat: "stahlhelm", cap: "#5c6458", rifle: true, sash: "#3a2a1c" };
export const RED: Outfit = { jacket: "#7e744a", pants: "#6a6240", boots: "#2a2018", hat: "pilotka", cap: "#7a7244", rifle: true, sash: "#4a3420" };
export const REDH: Outfit = { ...RED, hat: "m1", cap: "#4e5a36" };
export const REDW: Outfit = { ...RED, jacket: "#e8ece8", pants: "#dfe4e2", hat: "ushanka", cap: "#e0e4e2", boots: "#2a2a2a" };
export const GI: Outfit = { jacket: "#7a6c46", pants: "#6e6644", boots: "#5a4028", hat: "m1", cap: "#5c6136", rifle: true, sash: "#4a3a24" };
export const TOMMY: Outfit = { jacket: "#8a7a4e", pants: "#7a6c44", boots: "#3a2a1a", hat: "brodie", cap: "#6b6a46", rifle: true, sash: "#5a4a2e" };
export const CANUK: Outfit = { ...TOMMY, jacket: "#7e7048", cap: "#5e5e40" };
export const POLE: Outfit = { jacket: "#6a6e4a", pants: "#5e6242", boots: "#1e1a16", hat: "brodie", cap: "#5a5e3e", rifle: true, sash: "#3a2a1c" };
export const FRENCH: Outfit = { jacket: "#8a7e5a", pants: "#7a6e4e", boots: "#2a2420", hat: "adrian", cap: "#6a6a4e", rifle: true, sash: "#4a3a2a" };
export const JAP: Outfit = { jacket: "#8a7a4a", pants: "#7a6c40", boots: "#3a2a1a", hat: "japcap", cap: "#8a7a4a", rifle: true, sash: "#4a3a24", skin: "#f0d0a8" };
export const JAPH: Outfit = { ...JAP, hat: "helmetJ", cap: "#6a6a44" };
export const MARINE: Outfit = { jacket: "#5e6a4a", pants: "#56603e", boots: "#3a2a1a", hat: "m1", cap: "#4e5a36", rifle: true, sash: "#3a3a24" };
export const SAILOR: Outfit = { jacket: "#f2f2ee", pants: "#f2f2ee", boots: "#141414", hat: "sailor", scarf: "#1e2a4a" };
export const SAILOR_B: Outfit = { jacket: "#2a3450", pants: "#2a3450", boots: "#141414", hat: "sailor", scarf: "#f2f2ee" };
export const RAF: Outfit = { jacket: "#5a6a86", pants: "#4a5872", boots: "#141414", hat: "pilot", cap: "#6a4428", scarf: "#f2efe6" };
export const LUFT: Outfit = { jacket: "#5e6a7a", pants: "#4e5a6a", boots: "#141414", hat: "pilot", cap: "#4a3a2a" };
export const USPIL: Outfit = { jacket: "#6a4a30", pants: "#6e6644", boots: "#3a2a1a", hat: "pilot", cap: "#5a3a22", scarf: "#e8e0c8" };
export const NURSE: Outfit = { jacket: "#f2efe6", pants: "#f2efe6", boots: "#2a2a2a", hat: "bonnet", hair: "#6a4028", dress: "#f2efe6" };
export const MEDIC: Outfit = { ...GI, rifle: false, band: "#f2efe6" };
export const GESTAPO: Outfit = { jacket: "#2a2a2a", pants: "#2a2a2a", boots: "#141414", hat: "fedora", cap: "#1e1e1e" };
export const SSOFF: Outfit = { jacket: "#2e2e30", pants: "#2e2e30", boots: "#141414", hat: "peaked", cap: "#2a2a2c", sash: "#1a1a1a", buttons: "#bcbcbc" };
export const SA: Outfit = { jacket: "#7a6440", pants: "#3e3226", boots: "#1a1614", hat: "cap", cap: "#6a5634", sash: "#2a2018" };
export const VOLKS: Outfit = { jacket: "#4a4438", pants: "#3a362e", boots: "#1e1a16", hat: "cap", cap: "#3a3a34", hair: "#d8d4cc", moustache: "#d8d4cc", rifle: true };
export const HJ: Outfit = { jacket: "#4a5244", pants: "#2a2a2a", boots: "#1e1a16", hat: "stahlhelm", cap: "#5a6258", build: "kid", rifle: false };
const CIV_J = ["#5a4a3a", "#4a4a52", "#6a5a48", "#3e3a36", "#5e5446", "#4e4232", "#6a6458", "#3a3a40", "#7a5a44", "#4a5a6a", "#5a3a3a", "#6a6a52"];
const CIV_D = ["#7a5a6a", "#5a6a7a", "#8a6a4a", "#5a7a5a", "#9a5a4a", "#6a5a8a", "#a8806a", "#4a6a7a"];
/** civilians: palette `p` gives each scene its own clothing family */
export const civ = (i: number, p = 0, jp = false): Outfit => {
  const k = (i * 7 + p * 5) % 12, j = CIV_J[k], skin = jp ? "#f0d0a8" : i % 5 === 3 ? "#f5c9a0" : undefined;
  if ((i + p) % 3 === 1) return { jacket: j, pants: j, boots: "#2a1e18", hat: (i + p) % 4 === 1 ? "headscarf" : "longhair", cap: CIV_D[(i + p) % 8], hair: ["#8a5a32", "#4a3020", "#2a1d16", "#b8905a"][(i + p) % 4], dress: CIV_D[(i * 3 + p) % 8], skin };
  return { jacket: j, pants: "#2e2a28", boots: "#1e1a16", hat: ["fedora", "hair", "cap", "homburg", "hair", "beret"][(i + p) % 6], cap: ["#4a3a2c", "#3a3a40", "#5a4a3a"][(i + p) % 3], hair: ["#3a2a1e", "#6a4a2a", "#2a2420", "#8a8a8a", "#141414"][(i + p) % 5], tie: (i + p) % 2 ? "#5a2a24" : undefined, moustache: (i + p) % 4 === 0 ? "#3a2a1e" : undefined, skin };
};
export const kid = (i: number, p = 0): Outfit => ({ jacket: CIV_D[(i + p) % 8], pants: CIV_J[(i * 3 + p) % 12], boots: "#2a2a2a", hat: i % 2 ? "longhair" : "cap", cap: CIV_J[(i + 4) % 12], hair: ["#5a3a22", "#8a5a32", "#2a1d16"][i % 3], dress: i % 2 ? CIV_D[(i * 5 + p) % 8] : undefined, build: "kid" });
/** soldier variant per scene: shifts uniform tones slightly + toggles rifle */
export const sol = (o: Outfit, p: number, rifle = true): Outfit => ({ ...o, jacket: mix(o.jacket, p % 2 ? "#000000" : "#ffffff", 0.04 * (p % 4)), cap: o.cap ? mix(o.cap, "#2a2a2a", 0.05 * (p % 3)) : o.cap, rifle });

// ---------------- life ----------------
export const lid = (t: number, i: number) => { const per = 2.4 + 1.6 * hash(i), k = Math.floor(((t + hash(i + 3) * per) % per) * 30); return k < 4 ? [0.5, 1, 1, 0.5][k] : 0; };
export type FO = FrontOpts; export type SO = SideOpts;
/** idle sway (breathing) for standing figures: small head tilt and look drift */
export const idle = (t: number, id: number) => ({ headTilt: 2.5 * Math.sin(t * 0.9 + id) });

// ---------------- scene accumulator ----------------
type Item = { z: number; d: () => void };
export class Sc {
  items: Item[] = []; overs: ((g: Ctx) => void)[] = []; lights: ((g: Ctx) => void)[] = [];
  constructor(public g: Ctx, public cam: Cam, public t: number) {}
  a(o: Outfit, id: number, x: number, z: number, f: FO = {}, extra: Partial<Act> = {}) { const t = this.t;
    // always alive: breathing sway, head turns, glances and weight shifts layered on top of the pose (quantized to keep the card cache small)
    const still = !f.mode || f.mode === "stand" || f.mode === "sit", ph = id * 1.37;
    // gesture pulses (talkers and a third of the crowd): anticipation dip → fast rise → hold → springy settle
    const talker = f.expr === "shout" || f.expr === "stern" || f.expr === "grin" || f.expr === "smile" || id % 3 === 0, per = 2.4 + 1.3 * hash(id), gp = ((t + hash(id + 5) * per) % per) / per;
    const gest = !talker ? 0 : gp < 0.08 ? -0.18 * Math.sin((gp / 0.08) * Math.PI) : gp < 0.2 ? 0.95 * smooth((gp - 0.08) / 0.12) : gp < 0.42 ? 0.95 + 0.06 * Math.sin((gp - 0.2) * 40) : 0.95 * (1 - smooth((gp - 0.42) / 0.25)) - 0.06 * Math.sin(clamp((gp - 0.42) / 0.25) * Math.PI * 2);
    const breath = 0.5 + 0.5 * Math.sin(t * 1.9 + ph);
    const live: FO = still ? { headTilt: (f.headTilt ?? 0) + 4 * Math.sin(t * 1.05 + ph) + 2 * Math.sin(t * 2.3 + ph * 2) + (talker ? 3 * gest : 0),
      look: f.look !== undefined ? f.look + 0.18 * Math.sin(t * 0.7 + ph) : 0.6 * Math.sin(t * 0.45 + ph),
      hip: f.mode === "sit" ? f.hip : (f.hip ?? 0) + 3 * Math.sin(t * 0.6 + ph), crouch: f.mode === "sit" ? f.crouch : (f.crouch ?? 0) + 0.035 * breath,
      armB: f.armB ?? (f.prop ? undefined : 0.3 * Math.sin(t * 0.9 + ph) + gest) } : {};
    const rot = (extra.rot ?? 0) + (still ? 0.018 * Math.sin(t * 0.8 + ph) + 0.012 * gest : 0);
    this.items.push({ z, d: () => drawAct(this.g, this.cam, { o, id, x, z, f: { mode: "stand", blink: lid(t, id), ...f, ...live }, ...extra, rot }) }); }
  s(o: Outfit, id: number, x: number, z: number, so: SO = {}, extra: Partial<Act> = {}) { const t = this.t; this.items.push({ z, d: () => drawAct(this.g, this.cam, { o, id, x, z, side: true, s: { mode: "stand", blink: lid(t, id), ...so }, ...extra }) }); }
  sp(k: string, x: number, y: number, z: number, o: Parameters<typeof drawSprite>[6] = {}) { this.items.push({ z, d: () => drawSprite(this.g, this.cam, SPR[k], x, y, z, o) }); }
  fx(z: number, d: (g: Ctx, c: Cam) => void) { this.items.push({ z, d: () => d(this.g, this.cam) }); }
  over(d: (g: Ctx) => void) { this.overs.push(d); }
  light(d: (g: Ctx) => void) { this.lights.push(d); }
}
export const C = (x: number, y: number, z: number, fov = 42, shift = 0): Cam => ({ x, y, z, fov, shift });
export const mv = (a: number[], b: number[], ease = smooth) => (u: number): Cam => { const k = ease(u); return C(lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k), lerp(a[3] ?? 42, b[3] ?? a[3] ?? 42, k), lerp(a[4] ?? 0, b[4] ?? a[4] ?? 0, k)); };
export const path = (keys: [number, number[]][]) => (u: number): Cam => { let i = 0; while (i < keys.length - 2 && u > keys[i + 1][0]) i++; const [u0, a] = keys[i], [u1, b] = keys[i + 1]; return mv(a, b)(clamp((u - u0) / (u1 - u0))); };
/** handheld micro-shake for combat cameras (subtle, physically damped) */
export const hand = (c: (u: number, lt: number) => Cam, amp = 0.03) => (u: number, lt: number): Cam => { const k = c(u, lt); return { ...k, x: k.x + amp * (Math.sin(lt * 3.1) + 0.5 * Math.sin(lt * 7.3)), y: k.y + amp * 0.7 * (Math.sin(lt * 2.3 + 1) + 0.5 * Math.sin(lt * 6.1)) }; };

/** front-view walk from p0 to p1 (natural stroll, feet planted) */
export const walkF = (A: Sc, o: Outfit, id: number, lt: number, t0: number, t1: number, p0: [number, number], p1: [number, number], f: FO = {}, extra: Partial<Act> = {}) => {
  const k = clamp((lt - t0) / (t1 - t0)), x = lerp(p0[0], p1[0], k), z = lerp(p0[1], p1[1], k), d = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]) * k;
  A.a(o, id, x, z, { mode: k > 0 && k < 1 ? "stroll" : "stand", phase: (d / 1.4) % 1, ...f }, extra);
};
/** side-view walk at v m/s (stance foot planted, hip bob) */
export const walkS = (A: Sc, o: Outfit, id: number, lt: number, x0: number, z: number, vel: number, so: SO = {}, extra: Partial<Act> = {}) => {
  const x = x0 + vel * lt, ph = (Math.abs(vel * lt) / 1.5 + hash(id)) % 1;
  A.s(o, id, x, z, { mode: "march", phase: ph, stride: Math.min(1.2, Math.abs(vel) / 1.4), ...so }, { flip: vel < 0, ...extra });
};
/** running: longer stride, faster cadence, forward lean */
export const runS = (A: Sc, o: Outfit, id: number, lt: number, x0: number, z: number, vel: number, so: SO = {}, extra: Partial<Act> = {}) => {
  const x = x0 + vel * lt, ph = (Math.abs(vel * lt) / 2.4 + hash(id)) % 1;
  A.s(o, id, x, z, { mode: "march", phase: ph, stride: 1.35, ...so }, { flip: vel < 0, rot: (vel > 0 ? 1 : -1) * 0.13, ...extra });
};
export const marchF = (A: Sc, o: Outfit | ((i: number) => Outfit), lt: number, rows: number, cols: number, z0: number, vel: number, gapX = 1.25, gapZ = 1.6, id0 = 400, f: (r: number, c: number) => FO = () => ({}), extra: Partial<Act> = {}, x0 = 0) => {
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) { const z = z0 + r * gapZ - lt * vel; if (z < 0.6) continue; const x = x0 + (c - (cols - 1) / 2) * gapX;
    A.a(typeof o === "function" ? o(r * cols + c) : o, id0 + r * cols + c, x, z, { mode: "march", phase: ((lt * vel) / 1.5 + (r % 2) * 0.5 + c * 0.03) % 1, expr: "stern", ...f(r, c) }, extra); }
};
export const marchCol = (A: Sc, o: Outfit | ((i: number) => Outfit), lt: number, n: number, x0: number, z: number, vel: number, gap = 1.25, rows = 1, rowGap = 1.1, extra: Partial<Act> = {}, so: SO = {}, id0 = 40) => {
  for (let r = 0; r < rows; r++) for (let i = 0; i < n; i++) walkS(A, typeof o === "function" ? o(i + r * n) : o, id0 + i + r * 30, lt, x0 - Math.sign(vel) * i * gap + (r % 2) * gap * 0.4, z + r * rowGap, vel, so, extra);
};
export const crowd = (A: Sc, n: number, x0: number, x1: number, z0: number, z1: number, seed: number, f: (i: number) => FO = () => ({}), pick: (i: number) => Outfit = (i) => civ(i, seed), extra: Partial<Act> = {}) => {
  for (let i = 0; i < n; i++) { const x = lerp(x0, x1, hash(seed + i * 7.1)), z = lerp(z0, z1, hash(seed + i * 3.7)); A.a(pick(i), 100 + i + seed, x, z, { blink: lid(A.t, 100 + i + seed), ...f(i) }, extra); }
};

// ---------------- animated vehicles ----------------
/** tank: body sprite + spinning road wheels, scrolling track links, exhaust, dust; `fire` = age since shot (recoil, flash, smoke ring, rocking spring) */
export const tank = (A: Sc, kind: string, x: number, z: number, o: { dir?: 1 | -1; vel?: number; t?: number; fire?: number; sc?: number; dustCol?: [number, number, number]; dark?: number; y?: number } = {}) => {
  const T = TANKS[kind], dir = o.dir ?? 1, sc = o.sc ?? 1, t = o.t ?? A.t, vel = o.vel ?? 0, fa = o.fire ?? -1;
  const recoil = fa >= 0 && fa < 1.2 ? Math.exp(-fa * 5) * Math.sin(fa * 18) * 0.05 : 0, bob = vel ? 0.02 * Math.sin(t * 9 + x) : 0, y = (o.y ?? 0) + bob;
  if (vel && o.dustCol !== undefined) A.fx(z + 0.6, (g, c) => dust(g, c, t, x - dir * T.len * 0.45 * sc, z + 0.4, dir, 1.1 * sc, o.dustCol, 3));
  A.fx(z + 0.02, (g, c) => { const [sx, sy, s] = P(c, x, 0, z), fy = clamp(c.y / (z - c.z), 0.06, 0.5); const gr = g.createRadialGradient(sx, sy, 0, sx, sy, T.len * 0.62 * sc * s); gr.addColorStop(0, "rgba(16,10,20,0.55)"); gr.addColorStop(1, "rgba(16,10,20,0)");
    g.save(); g.translate(sx, sy); g.scale(1, fy * 1.4); g.fillStyle = gr; g.beginPath(); g.arc(0, 0, T.len * 0.62 * sc * s, 0, 7); g.fill(); g.restore(); });
  A.fx(z, (g, c) => { g.save(); if (o.dark) g.filter = `brightness(${(1 - o.dark).toFixed(2)})`;
    const S = SPR["tk_" + kind]; drawSprite(g, c, S, x - dir * recoil * 3, y, z, { flip: dir < 0, sc, rot: -dir * recoil });
    const [, gy, s] = P(c, x, y, z), roll = (vel * t) / (T.wr * sc);
    // tracks
    const [l0] = P(c, x - (T.len / 2 - 0.15) * sc, 0, z), [l1] = P(c, x + (T.len / 2 - 0.15) * sc, 0, z), top = gy - T.trackTop * sc * s, bot = gy - 0.02 * s;
    g.fillStyle = "#26221f"; g.strokeStyle = INK; g.lineWidth = Math.max(1.5, 0.035 * s); g.beginPath(); g.roundRect(Math.min(l0, l1), top, Math.abs(l1 - l0), bot - top, (bot - top) * 0.48); g.fill(); g.stroke();
    g.save(); g.beginPath(); g.roundRect(Math.min(l0, l1), top, Math.abs(l1 - l0), bot - top, (bot - top) * 0.48); g.clip(); g.strokeStyle = "rgba(120,110,100,0.5)"; g.lineWidth = Math.max(1, 0.03 * s);
    const link = 0.16 * sc * s, off = ((vel * t * sc * s * dir) % link + link) % link; for (let px = Math.min(l0, l1) - link + off; px < Math.max(l0, l1) + link; px += link) { g.beginPath(); g.moveTo(px, top); g.lineTo(px, top + 0.08 * s); g.moveTo(px, bot - 0.08 * s); g.lineTo(px, bot); g.stroke(); } g.restore();
    for (const wx of T.wheels) { const [qx, qy] = P(c, x + dir * wx * sc - dir * recoil * 3, (T.wr + 0.06) * sc, z), r = T.wr * sc * s; g.fillStyle = shade(T.col, 0.75); g.beginPath(); g.arc(qx, qy, r, 0, 7); g.fill(); g.stroke();
      g.fillStyle = shade(T.col, 0.55); g.beginPath(); g.arc(qx, qy, r * 0.38, 0, 7); g.fill(); g.strokeStyle = "rgba(20,16,14,0.6)"; for (let k = 0; k < 5; k++) { const an = roll * dir + (k * Math.PI * 2) / 5; g.beginPath(); g.moveTo(qx + Math.cos(an) * r * 0.4, qy + Math.sin(an) * r * 0.4); g.lineTo(qx + Math.cos(an) * r * 0.85, qy + Math.sin(an) * r * 0.85); g.stroke(); } g.strokeStyle = INK; }
    if (o.dark) { g.save(); g.globalCompositeOperation = "source-atop"; g.restore(); }
    // exhaust shimmer
    const [ex, ey, es] = P(c, x - dir * (T.len / 2) * sc, 1.3 * sc, z); for (let k = 0; k < 4; k++) { const a = ((t * 1.3 + k / 4) % 1); puff(g, ex - dir * a * es * 1.2, ey - a * es * 1.4, (0.15 + a * 0.6) * es * sc, [70, 66, 64], 0.35 * (1 - a)); }
    if (fa >= 0 && fa < 2.5) { const [mx, my, ms] = P(c, x + dir * (T.gun[2] + 0.35) * sc, T.gun[1] * sc + y, z - 0.05);
      if (fa < 0.09) { glow(g, mx, my, 4 * ms * sc, "rgba(255,220,140,1)", 1); g.save(); g.translate(mx, my); if (dir < 0) g.scale(-1, 1); g.fillStyle = "#fff3c8"; g.beginPath(); g.moveTo(0, -0.35 * ms); g.lineTo(2.2 * ms * sc, 0); g.lineTo(0, 0.35 * ms); g.fill(); g.restore(); }
      for (let k = 0; k < 7; k++) { const a = fa * (0.6 + k * 0.1); puff(g, mx + dir * (a * 3 + k * 0.4) * ms, my - a * 0.8 * ms, (0.4 + a * 1.3) * ms * sc, [200, 196, 190], 0.6 * clamp(1 - fa / 2.5)); } }
 g.restore();
  });
};
/** side-view aircraft along a pitch angle `ang` (rad, screen), spinning prop disc, optional exhaust and hit smoke */
export const plane = (A: Sc, kind: string, x: number, y: number, z: number, o: { ang?: number; dir?: 1 | -1; sc?: number; smoke?: boolean; t?: number; alpha?: number } = {}) => {
  const p = PLANES[kind], dir = o.dir ?? 1, sc = o.sc ?? 1, t = o.t ?? A.t;
  A.fx(z, (g, c) => {
    const S = SPR["pl_" + kind], ang = o.ang ?? 0; drawSprite(g, c, S, x, y, z, { flip: dir < 0, sc, rot: ang, alpha: o.alpha });
    if (p.prop) { const [px, py, ps] = P(c, x, y, z), R = (p.len * 0.42) * sc * ps, ox = dir * (p.prop[0]) * sc * ps, oy = -(p.prop[1]) * sc * ps; const ca = Math.cos(ang), sa = Math.sin(ang);
      const hx = px + ox * ca - oy * sa, hy = py + ox * sa + oy * ca; g.save(); g.translate(hx, hy); g.rotate(ang); g.globalAlpha = (o.alpha ?? 1) * 0.35; g.fillStyle = "#d8dce0"; g.beginPath(); g.ellipse(0, 0, 0.12 * sc * ps, p.prop[2] / 2 * sc * ps, 0, 0, 7); g.fill();
      g.globalAlpha = (o.alpha ?? 1) * 0.8; g.strokeStyle = "#1e1c1a"; g.lineWidth = Math.max(1.5, 0.06 * sc * ps); const b = Math.sin(t * 47) * p.prop[2] / 2 * sc * ps; g.beginPath(); g.moveTo(0, -b); g.lineTo(0, b); g.stroke(); g.restore(); void R; }
  });
};
/** planform aircraft (seen from below when `below`), heading in screen radians (0 = flying up the screen), bank squashes the wings */
export const planeTop = (A: Sc, kind: string, x: number, y: number, z: number, o: { head?: number; bank?: number; below?: boolean; sc?: number; t?: number; dark?: number; alpha?: number } = {}) => {
  const p = PFS[kind], t = o.t ?? A.t, sc = o.sc ?? 1;
  A.fx(z, (g, c) => {
    const S = SPR[(o.below === false ? "pt_" : "pf_") + kind], [sx, sy, s0] = P(c, x, y, z), s = s0 * sc, w = S.w * s, h = S.h * s;
    if (sx < -w || sx > VW + w || sy < -h || sy > VH + h || z - c.z < 1) return;
    g.save(); g.translate(sx, sy); g.rotate(o.head ?? 0); g.scale(Math.max(0.15, Math.cos(o.bank ?? 0)), 1); if (o.alpha !== undefined) g.globalAlpha = o.alpha;
    // sprite: nose at +y (world) -> screen up; canvas origin bottom-centre
    g.drawImage(spriteCanvas(S), -w / 2, -h / 2, w, h);
    for (const ex of p.eng) { const px = ex * s, py = h / 2 - (ex === 0 ? p.len + 0.25 : p.wingY + p.chord * 1.3) * s, R = (p.eng.length > 1 ? 1.7 : 1.5) * s;
      g.globalAlpha = 0.28 * (o.alpha ?? 1); g.fillStyle = "#e6eaee"; g.beginPath(); g.ellipse(px, py, R, Math.max(1, 0.12 * s), 0, 0, 7); g.fill();
      g.globalAlpha = 0.85 * (o.alpha ?? 1); g.strokeStyle = "#1e1c1a"; g.lineWidth = Math.max(1, 0.07 * s); const b = Math.sin(t * 43 + ex) * R; g.beginPath(); g.moveTo(px - b, py); g.lineTo(px + b, py); g.stroke(); }
    g.restore();
  });
};
/** ship: sprite rocking on the swell with bow wave + wake; `guns` = list of [age, x offset] for broadside flashes */
export const ship = (A: Sc, kind: string, x: number, z: number, o: { dir?: 1 | -1; vel?: number; t?: number; guns?: [number, number, number][]; sc?: number; rock?: number; sink?: number } = {}) => {
  const dir = o.dir ?? 1, t = o.t ?? A.t, S = SPR[kind], sc = o.sc ?? 1, rock = (o.rock ?? 0.012) * Math.sin(t * 0.9 + x), heave = 0.25 * Math.sin(t * 0.7 + x * 0.1) * sc - (o.sink ?? 0);
  if (o.vel) A.fx(z - 0.5, (g, c) => wake(g, c, t, x - dir * S.w * 0.45 * sc, z, S.w * 0.6 * sc, dir, 6 * sc));
  A.fx(z, (g, c) => {
    drawSprite(g, c, S, x, heave, z, { flip: dir < 0, sc, rot: rock });
    const [, wy, ws] = P(c, x, 0, z), [l0] = P(c, x - S.w * 0.5 * sc, 0, z), [l1] = P(c, x + S.w * 0.5 * sc, 0, z); g.fillStyle = "rgba(240,248,255,0.55)"; for (let k = 0; k < 14; k++) { const px = lerp(l0, l1, k / 13); g.beginPath(); g.ellipse(px, wy + 1, (l1 - l0) / 20, 0.25 * ws * sc + 1, 0, 0, 7); g.fill(); }
    for (const [age, ox, oy] of o.guns ?? []) { if (age < 0 || age > 3) continue; const [gx, gy, gs] = P(c, x + dir * ox * sc, oy * sc + heave, z - 1);
      if (age < 0.1) { glow(g, gx, gy, 30 * gs * sc, "rgba(255,210,130,1)", 1); g.fillStyle = "#fff3c8"; g.beginPath(); g.ellipse(gx + dir * 10 * gs * sc, gy, 12 * gs * sc, 3 * gs * sc, 0, 0, 7); g.fill(); }
      for (let k = 0; k < 6; k++) puff(g, gx + dir * (8 + age * 8 + k * 3) * gs * sc, gy - age * 4 * gs, (5 + age * 9) * gs * sc, [200, 194, 186], 0.75 * clamp(1 - age / 3)); }
  });
};
/** paratrooper: canopy swaying (pendulum), descending at ~5 m/s */
export const para = (A: Sc, o: Outfit, id: number, x: number, y: number, z: number, t: number, col = "#dcd6c2") => {
  const sw = 0.18 * Math.sin(t * 1.6 + id);
  A.fx(z, (g, c) => { const [hx, hy, s] = P(c, x, y + 2.2, z); const cx = hx + Math.sin(sw) * 3.2 * s, cy = hy - Math.cos(sw) * 3.2 * s;
    g.strokeStyle = "rgba(40,36,30,0.7)"; g.lineWidth = Math.max(1, 0.02 * s); for (const k of [-1, -0.4, 0.4, 1]) { g.beginPath(); g.moveTo(hx, hy); g.lineTo(cx + k * 1.7 * s, cy); g.stroke(); }
    g.save(); g.translate(cx, cy); g.rotate(sw); g.fillStyle = col; g.strokeStyle = INK; g.lineWidth = Math.max(1.5, 0.04 * s); g.beginPath(); g.ellipse(0, 0, 1.9 * s, 1.2 * s, 0, Math.PI, 0); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "rgba(0,0,0,0.12)"; g.beginPath(); g.ellipse(0.6 * s, 0, 0.9 * s, 1.15 * s, 0, Math.PI, 0); g.fill(); for (const k of [-0.95, 0, 0.95]) { g.beginPath(); g.moveTo(k * s, -Math.sqrt(1 - (k / 1.9) ** 2) * 1.2 * s); g.lineTo(k * 1.05 * s, 0); g.stroke(); } g.restore(); });
  A.items.push({ z: z - 0.01, d: () => drawAct(A.g, A.cam, { o, id, x, z, y, f: { mode: "stand", expr: "stern", armB: 0.6, wave: 0, look: 0 }, rot: sw * 0.5, shadow: 0, noCast: true }) });
};

// ---------------- waving flag (cloth strips with travelling wave + shading) ----------------
const FLAGC = new Map<string, HTMLCanvasElement>();
export const flag = (A: Sc, kind: string, x: number, y: number, z: number, W: number, H: number, o: { wind?: number; t?: number; pole?: boolean; droop?: number; alpha?: number } = {}) => {
  const t = o.t ?? A.t, wind = o.wind ?? 1, droop = o.droop ?? 0;
  if (o.pole !== false) A.fx(z + 0.01, (g, c) => { const [px, py, s] = P(c, x, 0, z), [, ty] = P(c, x, y + 0.3, z); g.strokeStyle = INK; g.lineWidth = Math.max(2, 0.12 * s); g.beginPath(); g.moveTo(px, py); g.lineTo(px, ty); g.stroke(); g.strokeStyle = "#d8d4cc"; g.lineWidth = Math.max(1, 0.07 * s); g.stroke(); });
  A.fx(z, (g, c) => {
    let src = FLAGC.get(kind); if (!src) { src = mk(400, 260); const cg = src.getContext("2d")!; cg.setTransform(400, 0, 0, -260, 0, 260); FLAGS[kind](new WP(cg, 400), 1, 1); FLAGC.set(kind, src); }
    const [px, py, s] = P(c, x, y, z), w = W * s, h = H * s, n = 28;
    g.save(); if (o.alpha !== undefined) g.globalAlpha = o.alpha;
    for (let i = 0; i < n; i++) { const k = i / n, k1 = (i + 1) / n, amp = k * h * 0.12 * wind, ph = t * 7 * wind - k * 7, dy = Math.sin(ph) * amp + droop * k * k * h, dy1 = Math.sin(t * 7 * wind - k1 * 7) * k1 * h * 0.12 * wind + droop * k1 * k1 * h;
      const sq = 1 - 0.18 * Math.abs(Math.cos(ph)) * k * wind; g.drawImage(src, k * 400, 0, 400 / n + 1, 260, px + k * w * (1 - droop * 0.4), py + dy + (h * (1 - sq)) / 2, w / n + 1, h * sq);
      g.fillStyle = Math.cos(ph) > 0 ? `rgba(255,255,255,${0.16 * Math.cos(ph) * k * wind})` : `rgba(0,0,0,${-0.32 * Math.cos(ph) * k * wind})`; g.fillRect(px + k * w * (1 - droop * 0.4), py + dy + (h * (1 - sq)) / 2, w / n + 1, h * sq); void dy1; }
    g.restore();
  });
};

// ---------------- signing insert: tabletop seen from above, ink signature written stroke by stroke, hand + pen follow the nib ----------------
const sigPath = (seed: number, n = 150): [number, number][] => { const r = rng(seed), pts: [number, number][] = []; let x = 0;
  const loops = 6 + Math.floor(r() * 3); for (let i = 0; i <= n; i++) { const k = i / n, L = k * loops, ph = L * Math.PI * 2, amp = 0.08 + 0.05 * Math.sin(L * 1.7 + seed);
    x = k * 1.5 + Math.sin(ph) * 0.05; pts.push([x, Math.cos(ph) * amp + (k < 0.12 ? (0.12 - k) * 1.2 : 0) - (k > 0.9 ? (k - 0.9) * 0.6 : 0)]); }
  return pts; };
export const signing = (A: Sc, k: number, o: { x?: number; y?: number; z?: number; seed?: number; paper?: string; title?: string; sub?: string; skin?: string; sleeve?: string; ink?: string; prior?: number; desk?: string } = {}) => {
  const X = o.x ?? 0, Y = o.y ?? 0, Z = o.z ?? 3, seed = o.seed ?? 3, pts = sigPath(seed);
  A.fx(Z + 0.02, (g, c) => { const w = (px: number, py: number) => P(c, X + px, Y + py, Z);
    // desk + paper with typed text
    const [d0x, d0y, s] = w(-3, 2), [d1x, d1y] = w(3, -2); g.fillStyle = o.desk ?? "#4a3020"; g.fillRect(d0x, d0y, d1x - d0x, d1y - d0y);
    const [p0x, p0y] = w(-1.15, 1.45), [p1x, p1y] = w(1.15, -1.4); g.save(); g.shadowColor = "rgba(0,0,0,0.45)"; g.shadowBlur = 0.25 * s; g.shadowOffsetY = 0.06 * s; g.fillStyle = o.paper ?? "#f3ead2"; g.fillRect(p0x, p0y, p1x - p0x, p1y - p0y); g.restore();
    g.fillStyle = "#2a2018"; g.textAlign = "center"; g.font = `bold ${Math.round(0.12 * s)}px "DejaVu Serif", serif`; const [tx, ty] = w(0, 1.2); g.fillText(o.title ?? "", tx, ty); g.font = `${Math.round(0.07 * s)}px "DejaVu Serif", serif`; const [ux, uy] = w(0, 1.06); g.fillText(o.sub ?? "", ux, uy);
    g.strokeStyle = "rgba(40,30,24,0.55)"; g.lineWidth = Math.max(1, 0.012 * s); for (let i = 0; i < 13; i++) { const [lx, ly] = w(-0.95, 0.9 - i * 0.075), [rx] = w(0.95 - (i % 4 === 3 ? 0.5 : 0), 0); g.beginPath(); g.moveTo(lx, ly); g.lineTo(rx, ly); g.stroke(); }
    const [sx0, sy0] = w(-0.8, -0.72), [sx1] = w(0.85, 0); g.strokeStyle = "rgba(40,30,24,0.8)"; g.beginPath(); g.moveTo(sx0, sy0 + 0.05 * s); g.lineTo(sx1, sy0 + 0.05 * s); g.stroke();
    if (o.prior) { g.strokeStyle = "#1a2448"; g.lineWidth = Math.max(1.4, 0.016 * s); g.beginPath(); sigPath(seed + 9, 80).forEach(([a, b], i) => { const [qx, qy] = w(-0.8 + a * 0.5, -0.4 + b * 0.6); i ? g.lineTo(qx, qy) : g.moveTo(qx, qy); }); g.stroke(); }
    // wet ink up to k
    const m = Math.floor(clamp(k) * (pts.length - 1)); g.strokeStyle = o.ink ?? "#141a3a"; g.lineCap = "round"; g.lineJoin = "round";
    for (let i = 1; i <= m; i++) { const [a0, b0] = pts[i - 1], [a1, b1] = pts[i], [q0x, q0y] = w(-0.75 + a0, -0.62 + b0), [q1x, q1y] = w(-0.75 + a1, -0.62 + b1), sp = Math.hypot(a1 - a0, b1 - b0) * 90; g.lineWidth = Math.max(1.4, (0.022 - 0.01 * clamp(sp - 1)) * s); g.beginPath(); g.moveTo(q0x, q0y); g.lineTo(q1x, q1y); g.stroke(); }
    if (m > 2 && k < 1) { const [a, b] = pts[m], [nx, ny] = w(-0.75 + a, -0.62 + b); g.fillStyle = "rgba(20,26,58,0.6)"; g.beginPath(); g.arc(nx, ny, 0.012 * s, 0, 7); g.fill(); }
    // hand + pen
    const [a, b] = pts[Math.max(0, m)], lift = k <= 0 ? 0.25 : k >= 1 ? clamp((k - 1) * 4) * 0.4 : 0, [nx, ny] = w(-0.75 + a + lift * 0.3, -0.62 + b + lift);
    const pa = -0.95, penL = 0.46 * s; g.save(); g.translate(nx, ny); g.rotate(pa);
    g.fillStyle = "rgba(0,0,0,0.22)"; g.beginPath(); g.ellipse(penL * 0.9 + 0.05 * s, 0.12 * s, penL * 0.7, 0.18 * s, 0.2, 0, 7); g.fill();
    g.fillStyle = "#161414"; g.strokeStyle = INK; g.lineWidth = Math.max(1.5, 0.012 * s); g.beginPath(); g.moveTo(0, 0); g.lineTo(penL * 0.12, -0.018 * s); g.lineTo(penL, -0.03 * s); g.lineTo(penL, 0.03 * s); g.lineTo(penL * 0.12, 0.018 * s); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#d9b24a"; g.fillRect(penL * 0.1, -0.02 * s, penL * 0.06, 0.04 * s); g.fillRect(penL * 0.55, -0.032 * s, penL * 0.04, 0.064 * s); glint(g, penL * 0.58, -0.02 * s, 0.03 * s, 0.6 + 0.4 * Math.sin(A.t * 3));
    const sk = o.skin ?? "#f2cfb0"; g.fillStyle = sk; g.beginPath(); g.ellipse(penL * 0.35, 0.07 * s, 0.2 * s, 0.13 * s, 0.25, 0, 7); g.fill(); g.stroke();
    for (let f = 0; f < 3; f++) { g.beginPath(); g.ellipse(penL * (0.2 + f * 0.05), (0.02 + f * 0.05) * s, 0.08 * s, 0.035 * s, -0.4, 0, 7); g.fill(); g.stroke(); }
    g.fillStyle = mix(sk, "#000000", 0.18); g.beginPath(); g.ellipse(penL * 0.4, 0.13 * s, 0.14 * s, 0.05 * s, 0.3, 0, 7); g.fill();
    g.fillStyle = o.sleeve ?? "#2a2a30"; g.beginPath(); g.moveTo(penL * 0.48, -0.06 * s); g.lineTo(penL * 2.4, -0.25 * s); g.lineTo(penL * 2.4, 0.55 * s); g.lineTo(penL * 0.5, 0.22 * s); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#f4f2ec"; g.beginPath(); g.moveTo(penL * 0.48, -0.06 * s); g.lineTo(penL * 0.6, -0.08 * s); g.lineTo(penL * 0.62, 0.25 * s); g.lineTo(penL * 0.5, 0.22 * s); g.closePath(); g.fill(); g.stroke();
    g.restore(); void d1y; void p1y;
  });
};

// ---------------- maps ----------------
export const geoP = (a: number[]) => { const p: number[][] = []; for (let i = 0; i < a.length; i += 2) p.push([MX(a[i]), MY(a[i + 1])]); return p; };
export const R39: Record<string, number[]> = {
  GER: GERP, POL: POLP, FR: C14.FR, UK: C14.UK, ITA: C14.ITA, BEL: C14.BEL,
  AUT: [9.6, 47.3, 12.1, 46.9, 14.5, 46.4, 16.4, 46.8, 17.1, 47.7, 16.9, 48.7, 15.0, 49.0, 13.8, 48.8, 12.9, 47.6, 10.5, 47.6],
  CZE: [12.3, 50.2, 14.3, 50.9, 15.0, 50.9, 16.5, 50.2, 18.6, 50.1, 18.8, 49.6, 19.5, 49.4, 22.5, 49.1, 22.4, 48.4, 18.9, 47.8, 17.1, 47.7, 16.9, 48.7, 15.0, 49.0, 13.8, 48.8],
  DEN: [8.1, 54.9, 9.9, 54.8, 10.9, 55.6, 10.6, 57.7, 8.6, 57.1, 8.1, 56.0],
  NOR: [5.0, 62.0, 5.3, 59.3, 5.6, 58.4, 7.0, 58.0, 8.2, 58.1, 9.8, 59.0, 10.6, 59.4, 11.1, 59.0, 12.0, 60.5, 12.4, 62.5, 14.0, 64.0, 5.0, 64.0],
  NLD: [3.6, 51.4, 5.8, 51.2, 6.0, 51.9, 7.0, 52.4, 7.1, 53.3, 5.0, 53.3, 4.5, 52.2],
  USSR: [26.0, 54.0, 28.0, 53.5, 27.0, 51.5, 26.0, 50.5, 26.6, 48.3, 28.2, 48.1, 28.2, 45.5, 29.7, 45.3, 30.8, 46.5, 33.0, 46.0, 35.5, 45.3, 37.8, 47.0, 40.0, 47.2, 44.0, 46.5, 44.0, 64.0, 30.0, 64.0, 30.0, 60.2, 28.0, 59.0, 27.8, 57.5, 28.0, 56.0],
  AXIS42: [-4.6, 48.6, -1.6, 43.4, 3.1, 43.1, 7.5, 43.8, 12.3, 41.7, 16.2, 38.6, 18.5, 40.1, 19.4, 41.9, 22.2, 36.7, 26.0, 40.8, 28.0, 42.5, 28.8, 44.5, 30.8, 46.5, 35.5, 45.3, 38.0, 47.0, 44.0, 46.5, 44.0, 49.5, 40.0, 50.5, 37.5, 52.5, 35.0, 55.5, 33.0, 57.0, 31.5, 59.9, 28.0, 59.9, 24.0, 59.4, 21.0, 56.0, 14.0, 64.0, 5.0, 64.0, 5.0, 61.0, 7.0, 58.0, 8.1, 56.0, 8.2, 53.5, 4.5, 52.2, 2.5, 51.1, 1.6, 50.2, -1.3, 49.6],
};
export const MAPCOL: Record<string, string> = { GER: "#8e8a7a", POL: "#d8cba4", FR: "#d9cfa6", UK: "#cfd3a8", ITA: "#d6c49a", BEL: "#e6d6a8", AUT: "#dccba0", CZE: "#d2c49c", DEN: "#e2d4aa", NOR: "#d8d0a8", NLD: "#e4d2a0", USSR: "#d4c098" };
/** fill a country (or region) on a map location drawn at z=0 */
export const hl = (A: Sc, key: string, k: number, col = "#9a1e18", a = 0.62, z = -0.05) => { if (k <= 0) return; A.fx(z, (g, c) => { const pts = geoP(R39[key] ?? C14[key]); g.save(); g.globalAlpha = a * clamp(k); g.fillStyle = col; g.beginPath(); pts.forEach(([x, y], i) => { const [sx, sy] = P(c, x, y, 0); i ? g.lineTo(sx, sy) : g.moveTo(sx, sy); }); g.closePath(); g.fill(); g.globalAlpha = clamp(k); g.strokeStyle = col; g.lineWidth = 3; g.stroke(); g.restore(); }); };
/** animated campaign arrow on a map (lon/lat, or world map lon/lat when world) with a moving glow head */
export const arrow = (A: Sc, a: number[], b: number[], k: number, col: string, wid = 0.32, world = false, bend = 0.18) => {
  if (k <= 0) return; A.fx(-0.08, (g, c) => {
    const X = world ? WX : MX, Y = world ? WY : MY, kk = easeOut(clamp(k));
    const ax = X(a[0]), ay = Y(a[1]), ex = X(b[0]), ey = Y(b[1]), mx = (ax + ex) / 2 - (ey - ay) * bend, my = (ay + ey) / 2 + (ex - ax) * bend;
    const q = (u: number) => [(1 - u) * (1 - u) * ax + 2 * (1 - u) * u * mx + u * u * ex, (1 - u) * (1 - u) * ay + 2 * (1 - u) * u * my + u * u * ey];
    const pts: number[][] = []; for (let i = 0; i <= 30; i++) { const [x, y] = q((i / 30) * kk); pts.push(P(c, x, y, 0)); }
    const s = P(c, ax, ay, 0)[2]; g.save(); g.lineCap = "round"; g.lineJoin = "round";
    g.strokeStyle = "rgba(10,6,6,0.35)"; g.lineWidth = wid * s + 8; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y + 5) : g.moveTo(x, y + 5))); g.stroke();
    const gr = g.createLinearGradient(pts[0][0], pts[0][1], pts[30][0], pts[30][1]); gr.addColorStop(0, mix(col, "#000000", 0.25)); gr.addColorStop(1, mix(col, "#ffffff", 0.15));
    g.strokeStyle = gr; g.lineWidth = wid * s; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke();
    const [x1, y1] = pts[30], [x2, y2] = pts[27], an = Math.atan2(y1 - y2, x1 - x2), h = wid * 2.3 * s; g.fillStyle = mix(col, "#ffffff", 0.15); g.strokeStyle = "rgba(10,6,6,0.6)"; g.lineWidth = 2;
    g.beginPath(); g.moveTo(x1 + Math.cos(an) * h, y1 + Math.sin(an) * h); g.lineTo(x1 + Math.cos(an + 2.4) * h, y1 + Math.sin(an + 2.4) * h); g.lineTo(x1 + Math.cos(an - 2.4) * h, y1 + Math.sin(an - 2.4) * h); g.closePath(); g.fill(); g.stroke();
    if (k < 1) glow(g, x1, y1, 2.2 * h, "rgba(255,220,160,1)", 0.5); g.restore();
  });
};
export const pin = (A: Sc, lon: number, lat: number, t: number, kind: "fire" | "x" | "dot" | "star" = "dot", world = false, col = "#b3221c") => { if (t < 0) return; A.fx(-0.09, (g, c) => {
  const k = easeOut(clamp(t / 0.3)), [sx, sy, s] = P(c, world ? WX(lon) : MX(lon), world ? WY(lat) : MY(lat), 0);
  if (kind === "fire") { glow(g, sx, sy - 0.2 * s, 1.4 * s * k, "rgba(255,140,40,0.9)", 0.8 + 0.2 * Math.sin(t * 9)); g.fillStyle = "#ffb03a"; g.beginPath(); g.ellipse(sx, sy - 0.25 * s * k, 0.22 * s * k, (0.38 + 0.05 * Math.sin(t * 13)) * s * k, 0, 0, 7); g.fill(); g.fillStyle = "#fff0a0"; g.beginPath(); g.ellipse(sx, sy - 0.18 * s * k, 0.1 * s * k, 0.18 * s * k, 0, 0, 7); g.fill(); }
  else if (kind === "x") { g.strokeStyle = col; g.lineWidth = 0.14 * s; g.lineCap = "round"; const r = 0.4 * s * k; g.beginPath(); g.moveTo(sx - r, sy - r); g.lineTo(sx + r, sy + r); g.moveTo(sx + r, sy - r); g.lineTo(sx - r, sy + r); g.stroke(); }
  else if (kind === "star") { glow(g, sx, sy, 1.2 * s * k, "rgba(255,230,140,1)", 0.6); g.fillStyle = col; g.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, r = (i % 2 ? 0.16 : 0.4) * s * k; g.lineTo(sx + Math.cos(a) * r, sy + Math.sin(a) * r); } g.closePath(); g.fill(); g.strokeStyle = INK; g.lineWidth = 2; g.stroke(); }
  else { const pr = 0.3 * s * k * (1 + 0.15 * Math.sin(t * 6)); glow(g, sx, sy, pr * 3, "rgba(255,120,90,1)", 0.4); g.fillStyle = col; g.strokeStyle = "#241726"; g.lineWidth = 3; g.beginPath(); g.arc(sx, sy, pr, 0, 7); g.fill(); g.stroke(); }
}); };
export const frontLine = (A: Sc, pts: number[], k: number, col = "#7a1a14", wid = 7) => { if (k <= 0) return; A.fx(-0.07, (g, c) => {
  const n = pts.length / 2, m = Math.max(1, k * (n - 1)); g.save(); g.strokeStyle = col; g.lineWidth = wid; g.lineJoin = "round"; g.lineCap = "round"; g.setLineDash([18, 10]); g.lineDashOffset = -A.t * 30; g.beginPath();
  for (let i = 0; i <= Math.ceil(m); i++) { const j = Math.min(i, m), i0 = Math.floor(j), f = j - i0, i1 = Math.min(n - 1, i0 + 1); const [sx, sy] = P(c, MX(lerp(pts[i0 * 2], pts[i1 * 2], f)), MY(lerp(pts[i0 * 2 + 1], pts[i1 * 2 + 1], f)), 0); i ? g.lineTo(sx, sy) : g.moveTo(sx, sy); }
  g.stroke(); g.restore(); }); };

// ---------------- overlays ----------------
const FONT = `"DejaVu Serif", serif`, SANS = `"DejaVu Sans", sans-serif`;
/** typewriter date caption with a red rule, lower-left */
export const caption = (g: Ctx, txt: string, t: number, dur: number) => {
  if (t < 0 || t > dur) return; const a = clamp(t / 0.3) * clamp((dur - t) / 0.45), n = Math.floor(clamp(t / 0.8) * txt.length);
  g.save(); g.globalAlpha = a; g.font = `bold 44px ${SANS}`; g.textAlign = "left"; g.textBaseline = "alphabetic"; const w = g.measureText(txt).width;
  const gr = g.createLinearGradient(60, 0, 60 + w + 120, 0); gr.addColorStop(0, "rgba(8,6,6,0.7)"); gr.addColorStop(1, "rgba(8,6,6,0)"); g.fillStyle = gr; g.fillRect(60, VH - 156, w + 140, 80);
  g.fillStyle = "#d8322a"; g.fillRect(60, VH - 156, 6, 80); g.fillStyle = "#f6efe0"; g.shadowColor = "rgba(0,0,0,0.6)"; g.shadowBlur = 8; g.fillText(txt.slice(0, n), 88, VH - 102);
  if (n < txt.length && Math.floor(t * 8) % 2) { const cw = g.measureText(txt.slice(0, n)).width; g.fillRect(90 + cw, VH - 138, 4, 40); } g.restore();
};
export const bigText = (g: Ctx, txt: string, t: number, dur: number, y = VH / 2, size = 110, col = "#f6efe0", sub?: string, glowCol = "255,190,110") => {
  if (t < 0 || t > dur) return; const a = clamp(t / 0.35) * clamp((dur - t) / 0.4), sc = 1 + 0.05 * (1 - easeOut(t / 0.9)), tr = (1 - easeOut(t / 0.9)) * 18;
  g.save(); g.globalAlpha = a; g.translate(VW / 2, y); g.scale(sc, sc); g.textAlign = "center"; g.textBaseline = "middle"; g.font = `bold ${size}px ${FONT}`;
  if ("letterSpacing" in g) (g as unknown as { letterSpacing: string }).letterSpacing = `${Math.round(tr)}px`;
  g.shadowColor = `rgba(${glowCol},0.55)`; g.shadowBlur = size * 0.35; g.lineWidth = size * 0.1; g.strokeStyle = "rgba(14,8,10,0.9)"; g.lineJoin = "round"; g.strokeText(txt, 0, 0); g.shadowBlur = 0;
  const gr = g.createLinearGradient(0, -size / 2, 0, size / 2); gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.55, col); gr.addColorStop(1, mix(col.startsWith("#") ? col : "#f6efe0", "#8a6a3a", 0.35)); g.fillStyle = gr; g.fillText(txt, 0, 0);
  if (sub) { g.font = `italic bold ${Math.round(size * 0.5)}px ${FONT}`; g.lineWidth = size * 0.07; g.strokeText(sub, 0, size * 0.95); g.fillStyle = "#eadcc0"; g.fillText(sub, 0, size * 0.95); }
  g.restore();
};
/** chapter card: letterbox bars slide in, gold rules draw, numeral + title */
export const chapter = (g: Ctx, n: string, title: string, t: number, dur: number) => {
  if (t < 0 || t > dur) return; const a = clamp(t / 0.4) * clamp((dur - t) / 0.45), bar = easeOut(clamp(t / 0.6)) * VH * 0.12, w = 640 * easeOut(clamp((t - 0.2) / 0.8));
  g.save(); g.fillStyle = "#050404"; g.globalAlpha = clamp((dur - t) / 0.45); g.fillRect(0, 0, VW, bar); g.fillRect(0, VH - bar, VW, bar); g.restore();
  g.save(); g.globalAlpha = a * 0.5; const gr = g.createLinearGradient(0, VH * 0.34, 0, VH * 0.68); gr.addColorStop(0, "rgba(10,6,6,0)"); gr.addColorStop(0.5, "rgba(10,6,6,1)"); gr.addColorStop(1, "rgba(10,6,6,0)"); g.fillStyle = gr; g.fillRect(0, VH * 0.34, VW, VH * 0.34); g.restore();
  g.save(); g.globalAlpha = a; g.strokeStyle = "#e3bf6a"; g.lineWidth = 2.5; g.beginPath(); g.moveTo(VW / 2 - w, VH * 0.43); g.lineTo(VW / 2 + w, VH * 0.43); g.moveTo(VW / 2 - w, VH * 0.61); g.lineTo(VW / 2 + w, VH * 0.61); g.stroke();
  g.textAlign = "center"; g.textBaseline = "middle"; g.font = `bold 40px ${SANS}`; g.fillStyle = "#e3bf6a"; if ("letterSpacing" in g) (g as unknown as { letterSpacing: string }).letterSpacing = "10px"; g.fillText(n, VW / 2, VH * 0.395); g.restore();
  bigText(g, title, t - 0.25, dur - 0.25, VH * 0.52, Math.min(84, Math.floor(1560 / (title.length * 0.74))));
};
export const counter = (g: Ctx, n: number, unit: string, t: number, dur: number, y = VH * 0.8, col = "#f6efe0", size = 96) => {
  if (t < 0 || t > dur) return; const a = clamp(t / 0.3) * clamp((dur - t) / 0.4);
  g.save(); g.globalAlpha = a; g.textAlign = "center"; g.textBaseline = "middle"; g.font = `bold ${size}px ${FONT}`; g.lineWidth = size * 0.1; g.strokeStyle = "rgba(14,8,10,0.9)"; g.lineJoin = "round";
  const s = Math.round(n).toLocaleString("pt-BR"); g.shadowColor = "rgba(255,170,90,0.5)"; g.shadowBlur = 30; g.strokeText(s, VW / 2, y); g.shadowBlur = 0; g.fillStyle = col; g.fillText(s, VW / 2, y);
  g.font = `bold ${Math.round(size * 0.4)}px ${SANS}`; g.lineWidth = size * 0.06; g.strokeText(unit, VW / 2, y + size * 0.8); g.fillStyle = "#e3bf6a"; g.fillText(unit, VW / 2, y + size * 0.8); g.restore();
};
/** wall calendar page (world space) that tears off */
export const calPage = (A: Sc, x: number, y: number, z: number, month: string, day: string, year: string, tear = -1) => A.fx(z, (g, c) => {
  const [sx, sy, s] = P(c, x, y, z), w = 0.9 * s, h = 1.1 * s; const k = tear >= 0 ? clamp(tear / 0.6) : 0;
  const draw = (m: string, d: string, yy: string, rot: number, dx: number, dy: number, al: number) => { g.save(); g.globalAlpha = al; g.translate(sx + dx, sy + dy); g.rotate(rot); g.fillStyle = "rgba(0,0,0,0.3)"; g.fillRect(-w / 2 + 6, 8, w, h);
    g.fillStyle = "#f4ecd8"; g.fillRect(-w / 2, 0, w, h); g.fillStyle = "#b3221c"; g.fillRect(-w / 2, 0, w, h * 0.24); g.strokeStyle = INK; g.lineWidth = 3; g.strokeRect(-w / 2, 0, w, h);
    g.fillStyle = "#fff"; g.textAlign = "center"; g.textBaseline = "middle"; g.font = `bold ${Math.round(h * 0.13)}px ${SANS}`; g.fillText(m, 0, h * 0.12); g.fillStyle = "#2a1d16"; g.font = `bold ${Math.round(h * 0.48)}px ${FONT}`; g.fillText(d, 0, h * 0.56);
    g.font = `bold ${Math.round(h * 0.12)}px ${SANS}`; g.fillText(yy, 0, h * 0.88); g.restore(); };
  draw(month, day, year, 0, 0, 0, 1);
  if (tear >= 0 && k < 1) { const fall = easeIn(k), [yy] = [fall]; draw("AGOSTO", "31", year, fall * 1.2, fall * w * 1.4, yy * h * 3, 1 - k); }
});
export { muzzle, puff, glow, VW, VH };
/** paint arbitrary world-space content on a vertical plane at depth z (optionally rotated about a pivot: collapsing walls, falling signs) */
export const panel = (A: Sc, z: number, fn: (w: WP, g: Ctx) => void, o: { pivot?: [number, number]; rot?: number; alpha?: number; dx?: number; dy?: number } = {}) => A.fx(z, (g, c) => {
  if (z - c.z < 0.3) return; const [ox, oy, s] = P(c, o.dx ?? 0, o.dy ?? 0, z); g.save(); if (o.alpha !== undefined) g.globalAlpha = clamp(o.alpha); g.translate(ox, oy); g.scale(s, -s);
  if (o.pivot && o.rot) { g.translate(o.pivot[0], o.pivot[1]); g.rotate(o.rot); g.translate(-o.pivot[0], -o.pivot[1]); } fn(new WP(g, s), g); g.restore();
});

/** a soldier is hit: `blast` throws him ballistically (spinning, lands, bounces, lies still); otherwise he buckles and collapses.
 *  Before tHit he runs (dir) or stands. No blood — dust kicks where he lands. */
export const fall = (A: Sc, o: Outfit, id: number, x: number, z: number, T: number, tHit: number, opt: { dir?: number; blast?: boolean; run?: number; expr?: FO["expr"] } = {}) => {
  const dir = opt.dir ?? 1, k = T - tHit, run = opt.run ?? 0;
  if (k < 0) { if (run) { const lt = T - (tHit - 3); runS(A, o, id, lt, x - run * 3, z, run, { expr: opt.expr ?? "shout" }); } else A.a(o, id, x, z, { expr: opt.expr ?? "nervous" }); return; }
  const x0 = x;
  if (opt.blast) { const vx = dir * 3.2, vy = 4.5, [hy, , nb] = bounce(k, 0.2, vy, 0.25), air = nb === 0, dx = vx * Math.min(k, 0.95 + nb * 0.08);
    const rot = air ? dir * Math.min(Math.PI * 1.5, k * 7) : dir * Math.PI / 2; A.a(o, id, x0 + dx, z, { expr: "dazed", mode: "stand", armB: 1 }, { rot, y: Math.max(0, hy) + (air ? 0 : 0.05), shadow: 0.3, noCast: true });
    if (!air) A.fx(z - 0.02, (g, c) => { const kk = k - 0.95; if (kk > 1.2) return; const [sx, sy, s] = P(c, x0 + dx, 0.2, z); puff(g, sx, sy, (0.3 + kk) * s, [150, 130, 110], 0.6 * clamp(1 - kk / 1.2)); });
  } else { const fk = clamp(k / 0.55), rot = dir * (Math.PI / 2) * fk * fk + (fk >= 1 ? -dir * 0.06 * Math.exp(-(k - 0.55) * 8) * Math.sin((k - 0.55) * 30) : 0);
    A.a(o, id, x0 + (run ? run * 0.4 * Math.min(k, 0.5) : 0), z, { expr: fk < 0.3 ? "pained" : "dazed", crouch: Math.min(0.8, k * 3), armB: 1 }, { rot, y: fk >= 1 ? 0.06 : undefined, noCast: fk > 0.4 });
    if (fk >= 1) A.fx(z - 0.02, (g, c) => { const kk = k - 0.55; if (kk > 1.0) return; const [sx, sy, s] = P(c, x0 + dir * 1.0, 0.1, z); puff(g, sx, sy, (0.3 + kk) * s, [150, 130, 110], 0.55 * clamp(1 - kk)); }); }
};
