// Shared shot helpers for the Paraguayan War film (imports re-exported so every shots file has one import line).
export { VW, VH, P, glow, fire, smokeCol, puff, tint, clamp, lerp, smooth, easeOut, easeIn, hash, rays, sun, beam, stamp, rng } from "./engine";
export { fall, Sc, C, mv, path, hand, walkF, walkS, runS, marchF, marchCol, crowd, ship, flag, signing, caption, bigText, chapter, counter, calPage, panel, v, lid } from "./kit";
export { blast, scorch, rubble, embers, flutter, coins, sparks, lensFlare, glint, shards, birds, breath, dust, lightning, bounce, spring, splash, wake } from "./fx";
export { loc, mtn, hillL, clouds, city, forest, wall, ruins, field, wire, pier, dunes, cliffs, mix, shade } from "./places";
export { DAY, GOLD, BACK, GREY, NIGHTFIRE, MOON, LAMP, COLD, RED, NOON } from "./looks";
export * from "./px";
export type { Shot } from "./types";
import { Sc } from "./kit";
import { P, VW, clamp, puff, rng } from "./engine";
import { Lr } from "./paint";
import { mix, shade } from "./toon";
import { talk } from "./px";
import type { Outfit } from "./toon";
import type { FO } from "./kit";
/** speaking character (lip-sync + gestures) */
export const say = (A: Sc, o: Outfit, id: number, x: number, z: number, f: FO = {}, extra = {}, on = true) => A.a(o, id, x, z, { expr: "stern", ...f, talk: talk(A.t, id, on) }, extra);
/** water in front of waders: covers everything below `h` at depth z with ripples */
export const wade = (A: Sc, z: number, h: number, col: string, seed = 3) => A.fx(z - 0.04, (g, c) => {
  const [, y0] = P(c, 0, h, z), [, yb] = P(c, 0, -0.2, z - 2), t = A.t; g.fillStyle = col; g.fillRect(0, y0, VW, yb - y0 + 4000); const r = rng(seed);
  for (let i = 0; i < 50; i++) { const x = c.x + (r() - 0.5) * 30 + Math.sin(t + i) * 0.4, [sx, sy, s] = P(c, x, h + 0.01, z); g.strokeStyle = `rgba(255,255,255,${0.12 + 0.12 * Math.sin(t * 2 + i)})`; g.lineWidth = Math.max(1, 0.03 * s); g.beginPath(); g.moveTo(sx - 0.6 * s, sy); g.lineTo(sx + 0.6 * s, sy); g.stroke(); }
  g.fillStyle = "rgba(255,255,255,0.18)"; g.fillRect(0, y0 - 2, VW, 3); });
/** tall reeds / swamp grass band */
export const reeds = (K: string, z: number, col: string, seed: number, h = 1.8, wid = 30) => Lr(K + "rd" + z, z, -wid, wid, -0.3, h * 1.4, Math.max(20, 900 / z), (w) => { const r = rng(seed);
  for (let x = -wid; x < wid; x += 0.08) { const hh = h * (0.6 + r() * 0.6), l = (r() - 0.5) * 0.4; w.line([[x, -0.3], [x + l * 0.5, hh * 0.6], [x + l, hh]], 1.4, r() < 0.5 ? col : shade(col, 0.75)); if (r() < 0.06) w.ell(x + l, hh + 0.1, 0.05, 0.16, mix(col, "#6a4a2a", 0.5), 0); } });
/** red-earth road band toward the horizon */
export const road = (K: string, z: number, col: string, wid = 3) => Lr(K + "ro" + z, z, -40, 40, -0.2, 0.05, 30, (w) => { w.rect(-wid, -0.2, wid * 2, 0.25, col, 0); });
/** colonial town row (white walls, red tile roofs, arcades) */
export const colonial = (K: string, z: number, seed: number, o: { ruin?: boolean; lit?: number; blur?: number; tint?: string; x0?: number; x1?: number } = {}) => Lr(K + "co" + z, z, o.x0 ?? -z * 1.2 - 10, o.x1 ?? z * 1.2 + 10, -0.5, 9, Math.max(10, Math.min(46, 700 / z)), (w) => { const r = rng(seed);
  for (let x = o.x0 ?? -z * 1.2 - 10; x < (o.x1 ?? z * 1.2 + 10);) { const wd = 6 + r() * 6, h = 3.6 + r() * 2.2, wall = mix(["#efe8d8", "#e8dcc2", "#f2e6cc", "#e2d6c0", "#ead2b4"][Math.floor(r() * 5)], o.tint ?? "#ffffff", 0.15);
    const top = o.ruin ? h * (0.5 + r() * 0.4) : h; w.rect(x, 0, wd, top, w.vgrad(0, top, shade(wall, 0.8), wall), 2.5);
    if (!o.ruin) { w.poly([[x - 0.4, h], [x + wd + 0.4, h], [x + wd - 0.6, h + 1.4], [x + 0.6, h + 1.4]], "#a4502e", 2.5); for (let k = 0; k < wd * 3; k++) w.line([[x + k / 3, h + 0.05], [x + k / 3 + 0.2, h + 1.35]], 0.8, "rgba(60,20,10,0.35)"); }
    else { for (let k = 0; k < 4; k++) w.ell(x + r() * wd, top + 0.1, 0.3, 0.2, "#4a3a30", 1); }
    for (let k = 0; k < Math.floor(wd / 1.6); k++) { const wx = x + 0.6 + k * 1.6; if (r() < 0.25) w.rect(wx, 0, 0.9, 2.1, "#5a3a24", 2); else w.rect(wx, 1.1, 0.8, 1.1, r() < (o.lit ?? 0) ? "#ffc870" : "#2e2a2c", 2); }
    if (r() < 0.4) { w.rect(x, 0, wd, 0.3, "rgba(0,0,0,0.12)", 0); for (let k = 0; k < wd; k += 1.4) w.rect(x + k, 0, 0.18, h - 0.4, shade(wall, 0.86), 1.2); w.rect(x, h - 0.6, wd, 0.25, shade(wall, 0.8), 1.5); }
    x += wd + r() * 0.6; } }, o.blur);
/** crosses on a field (graves), rows receding */
export const graves = (A: Sc, n: number, x0: number, x1: number, z0: number, z1: number, seed: number, sc = 1) => { const r = rng(seed); for (let i = 0; i < n; i++) A.sp("crossW", x0 + r() * (x1 - x0), 0, z0 + Math.pow(r(), 0.8) * (z1 - z0), { sc: sc * (0.85 + r() * 0.3), rot: (r() - 0.5) * 0.12 }); };
/** campfire with flicker + smoke */
export const campfire = (A: Sc, x: number, z: number, size = 0.6, seed = 1) => { const { fire: F, smokeCol: SC } = FX; A.fx(z, (g, c) => F(g, c, A.t, x, 0, z, size, seed)); A.fx(z + 0.2, (g, c) => SC(g, c, A.t, x, size * 1.5, z + 0.2, { h: 6, w: 0.8, col: [80, 74, 70], a: 0.35, seed, wind: 0.3 })); };
import { fire as FIRE, smokeCol as SMOKE } from "./engine";
const FX = { fire: FIRE, smokeCol: SMOKE };
/** a pair of hands / table insert helper: a flat plane seen from above (z = depth of tabletop) */
export const table = (A: Sc, z: number, col: string, w = 3, d = 2) => A.fx(z + d, (g, c) => { const [x0, y0] = P(c, -w, 0, z), [x1] = P(c, w, 0, z), [, y1] = P(c, 0, 0, z + d); g.fillStyle = col; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y0); const [x2] = P(c, w, 0, z + d), [x3] = P(c, -w, 0, z + d); g.lineTo(x2, y1); g.lineTo(x3, y1); g.fill(); });
/** dust/powder haze over a battlefield */
export const haze = (A: Sc, z: number, col: [number, number, number], a = 0.35, seed = 4) => A.fx(z, (g, c) => { const r = rng(seed); for (let i = 0; i < 22; i++) { const x = c.x + (r() - 0.5) * 40 + Math.sin(A.t * 0.2 + i) * 2, y = 0.5 + r() * 3, [sx, sy, s] = P(c, x, y, z + r() * 10); puff(g, sx, sy, (2 + r() * 3) * s, col, a * (0.5 + 0.5 * r())); } });
export const k01 = (T: number, a: number, b: number) => clamp((T - a) / (b - a));
