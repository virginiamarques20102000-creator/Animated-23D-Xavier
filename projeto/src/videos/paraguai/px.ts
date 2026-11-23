// Paraguayan War kit (1864–1870): cast, period sprites, flags, South-America map, river battles, forts, lip-sync helper.
import { Outfit, mix, shade, INK } from "./toon";
import { Cam, Ctx, VW, VH, P, clamp, lerp, easeOut, smooth, hash, rng, WP, glow, puff, mk } from "./engine";
import { SPR, Lr } from "./paint";
import { FLAGS } from "./vehicles";
import { Sc, FO } from "./kit";
import { loc } from "./places";
import type { MapStyle } from "./places";

// ---------------- cast ----------------
export const PEDRO: Outfit = { jacket: "#1f2028", pants: "#1f2028", boots: "#121214", hat: "hair", hair: "#d9d4ca", beard: "#e6e1d6", moustache: "#e6e1d6", build: "stout", medals: true, sash: "#2f7a3e", buttons: "#d6b04a" };
export const PEDRO_Y: Outfit = { ...PEDRO, hair: "#a88a5a", beard: "#b8986a", moustache: "#b8986a", sash: "#c9a23a" };
export const LOPEZ: Outfit = { jacket: "#1c2234", pants: "#d8d2c2", boots: "#141414", hat: "kepi", cap: "#1c2234", beard: "#5a3a24", moustache: "#3a2618", hair: "#2a1d14", build: "stout", medals: true, buttons: "#d6b04a", sword: true, sash: "#9a1f1a" };
export const LOPEZ_F: Outfit = { ...LOPEZ, jacket: "#2a2a2e", pants: "#6a6050", medals: false, sash: "#5a1a16", cap: "#2a2a2e" };
export const CAXIAS: Outfit = { jacket: "#1e2a48", pants: "#1e2a48", boots: "#121212", hat: "peaked", cap: "#1e2a48", hair: "#e8e4dc", moustache: "#eeeae2", build: "stout", medals: true, buttons: "#d6b04a", sash: "#c9a23a", sword: true };
export const CONDE: Outfit = { jacket: "#22304e", pants: "#e2ddd0", boots: "#141414", hat: "kepi", cap: "#22304e", beard: "#7a5a3a", moustache: "#7a5a3a", hair: "#7a5a3a", medals: true, buttons: "#d6b04a", sword: true };
export const MITRE: Outfit = { jacket: "#2a2a30", pants: "#2a2a30", boots: "#141414", hat: "hair", hair: "#3a2a1e", beard: "#3a2a1e", moustache: "#3a2a1e", tie: "#1a1a1a" };
export const FLORES: Outfit = { jacket: "#3a2e28", pants: "#3a2e28", boots: "#2a1e16", hat: "fedora", cap: "#1e1a18", moustache: "#d8d2c8", beard: "#d8d2c8", scarf: "#b3221c" };
export const AGUIRRE: Outfit = { jacket: "#2a2a2c", pants: "#2a2a2c", boots: "#141414", hat: "hair", hair: "#5a4a3a", moustache: "#4a3a2a", scarf: "#f2efe6" };
export const BARROSO: Outfit = { jacket: "#1a2240", pants: "#1a2240", boots: "#121212", hat: "peaked", cap: "#1a2240", moustache: "#cfc8bc", hair: "#cfc8bc", medals: true, buttons: "#d6b04a", build: "stout" };
// armies (each scene re-tones them with `tone()` so no two scenes share the same soldier)
export const BR: Outfit = { jacket: "#26314e", pants: "#dcd6c6", boots: "#1a1614", hat: "kepi", cap: "#26314e", rifle: true, belt: "#e8e2d2", sash: "#3a2a1c" };
export const BRV: Outfit = { jacket: "#3a3a2e", pants: "#c8bfa6", boots: "#2a1e16", hat: "kepi", cap: "#2a2a24", rifle: true, belt: "#d8ceb4", sash: "#4a3a24" }; // Voluntários da Pátria
export const AR: Outfit = { jacket: "#3b4f78", pants: "#8a8f9a", boots: "#1a1614", hat: "kepi", cap: "#3b4f78", rifle: true, belt: "#e8e2d2", sash: "#2a2a34" };
export const UY: Outfit = { jacket: "#2c3046", pants: "#bdb39c", boots: "#1e1a16", hat: "kepi", cap: "#8a2620", rifle: true, belt: "#d8d2c0", sash: "#3a2a1c" };
export const PY: Outfit = { jacket: "#a3241d", pants: "#e4dfd0", boots: "#a8714a", hat: "shako", cap: "#1d1b1e", rifle: true, skin: "#d9a57c", belt: "#2a1e14", sash: "#2a1e14" };
export const PYK: Outfit = { jacket: "#a3241d", pants: "#e4dfd0", boots: "#a8714a", hat: "cap", cap: "#a3241d", rifle: true, skin: "#d9a57c", belt: "#2a1e14" };
export const SAILBR: Outfit = { jacket: "#22304e", pants: "#e8e4da", boots: "#141414", hat: "cap", cap: "#f2efe6", scarf: "#1a1a2a" };
export const SAILPY: Outfit = { jacket: "#b02a22", pants: "#d8d2c2", boots: "#a8714a", hat: "cap", cap: "#2a2420", skin: "#d9a57c" };
export const tone = (o: Outfit, p: number, rifle = o.rifle ?? true): Outfit => ({ ...o, jacket: mix(o.jacket, p % 2 ? "#000000" : "#ffffff", 0.035 * (p % 5)), pants: mix(o.pants, p % 3 ? "#5a4a3a" : "#ffffff", 0.05 * (p % 4)), cap: o.cap ? mix(o.cap, "#2a2a2a", 0.05 * (p % 3)) : o.cap, moustache: p % 4 === 1 ? ["#2a1d16", "#4a3020", "#6a4a2a"][p % 3] : o.moustache, beard: p % 7 === 3 ? "#3a2a1c" : o.beard, rifle });
const PYS = ["#d9a57c", "#c99068", "#e2b48c", "#b98058"];
/** Paraguayan civilians: women in white typoi with rebozo shawls, men in ponchos/hats; palette p keeps every scene distinct */
export const pyciv = (i: number, p = 0): Outfit => {
  const k = (i * 5 + p * 3) % 8, skin = PYS[(i + p) % 4], sh = ["#7a4a3a", "#5a5a6a", "#8a6a4a", "#4a5a4a", "#6a3a3a", "#5a4a6a", "#9a7a5a", "#3e4a5a"][k];
  if ((i + p) % 2) return { jacket: "#ece6d6", pants: "#ece6d6", boots: "#8a5a3a", hat: (i + p) % 3 ? "headscarf" : "longhair", cap: sh, hair: ["#1e1612", "#2a1d16", "#3a2a1e"][(i + p) % 3], dress: mix("#efe8d8", sh, 0.12), skin };
  return { jacket: sh, pants: "#e0d8c4", boots: "#8a5a3a", hat: ["fedora", "hair", "cap", "hair"][(i + p) % 4], cap: ["#d8cba0", "#3a2e24", "#5a4a32"][(i + p) % 3], hair: ["#1e1612", "#2a1d16", "#5a5a5a"][(i + p) % 3], moustache: (i + p) % 3 === 0 ? "#2a1d16" : undefined, skin, scarf: (i + p) % 4 === 2 ? "#b3221c" : undefined };
};
export const pykid = (i: number, p = 0, soldier = false): Outfit => ({ jacket: soldier ? mix("#a3241d", "#5a4a3a", 0.1 * (i % 4)) : ["#e8e2d2", "#8a6a4a", "#6a7a8a", "#a87a5a"][(i + p) % 4], pants: "#e0d8c4", boots: "#a8714a", hat: soldier ? (i % 3 ? "cap" : "hair") : i % 2 ? "longhair" : "hair", cap: "#a3241d", hair: ["#1e1612", "#2a1d16", "#3a2a1e"][i % 3], build: "kid", rifle: soldier && i % 2 === 0, skin: PYS[(i + p) % 4], dress: !soldier && i % 2 ? ["#efe8d8", "#c8b8a0"][p % 2] : undefined });
/** lip-sync: an open-mouth index that changes every ~0.11 s while talking (0 = the expression's own mouth) */
export const talk = (t: number, id: number, on = true) => (on ? [1, 2, 0, 3, 2, 1, 4, 0, 2, 1][Math.floor(t * 9 + hash(id) * 10) % 10] : 0);

// ---------------- extra sprites (period 1864-70) ----------------
const S = SPR as Record<string, { key: string; w: number; h: number; ppm: number; paint: (w: WP) => void }>;
/** paddle steamer gunboat: black hull with a white strake, paddle box, tall funnel, two masts with rigging */
const steamer = (key: string, hull: string, strake: string, box: string, funnel: string, flagCol: string) => ({ key, w: 30, h: 15, ppm: 34, paint: (w: WP) => {
  w.poly([[-13.5, 0.2], [12, 0.2], [14.6, 2.8], [-14, 2.6], [-14.6, 1.2]], hull, 3); w.rect(-14, 2.1, 28.3, 0.35, strake, 1.5);
  for (let k = 0; k < 7; k++) w.rect(-10 + k * 3.2, 1.25, 0.55, 0.45, "#141210", 1.2);
  w.rect(-14, 2.6, 28.5, 0.25, shade(hull, 1.4), 1.5);
  w.ell(0, 2.8, 2.8, 2.6, box, 3, 0, Math.PI); for (let k = 0; k < 7; k++) { const a = (k / 6) * Math.PI; w.line([[0, 2.8], [Math.cos(a) * 2.6, 2.8 + Math.sin(a) * 2.4]], 1.6, shade(box, 0.6)); }
  w.rect(-4.5, 2.85, 9, 1.4, mix(box, "#ffffff", 0.2), 2.5); for (let k = 0; k < 5; k++) w.rect(-3.8 + k * 1.6, 3.3, 0.6, 0.5, "#2a2420", 1);
  w.poly([[1.2, 4.2], [2.4, 4.2], [2.5, 10.6], [1.1, 10.6]], funnel, 2.5); w.rect(1.0, 10.2, 1.6, 0.4, "#141210", 1.5);
  for (const [mx, mh] of [[-8.5, 12.5], [8, 11.5]]) { w.line([[mx, 2.8], [mx, mh]], 4, "#4a3424"); w.line([[mx - 2.2, mh - 2.8], [mx + 2.2, mh - 2.8]], 2.5, "#4a3424"); w.line([[mx, mh], [mx - 5.5, 2.9]], 1, "rgba(30,24,20,0.8)"); w.line([[mx, mh], [mx + 5.5, 2.9]], 1, "rgba(30,24,20,0.8)"); }
  w.line([[12, 2.8], [8, 11.5]], 1, "rgba(30,24,20,0.8)"); w.line([[-14, 2.6], [-8.5, 12.5]], 1, "rgba(30,24,20,0.8)");
  w.line([[-13.8, 2.6], [-13.8, 6]], 2, "#4a3424"); w.rect(-13.8, 4.6, 1.8, 1.2, flagCol, 1.5);
  for (const cx of [-11, 10.5]) { w.rect(cx - 0.9, 2.85, 1.8, 0.5, "#3a2a1c", 1.5); w.line([[cx, 3.2], [cx + (cx < 0 ? -1.6 : 1.6), 3.4]], 5, "#1e1e22"); }
} });
S.steamBR = steamer("steamBR", "#1e1c1e", "#e8e2d4", "#2a2a2e", "#2a2624", "#2f8a3e");
S.steamBR2 = steamer("steamBR2", "#2a2e34", "#c9a24a", "#3a3e46", "#1e1c1a", "#2f8a3e");
S.steamPY = steamer("steamPY", "#3a2a22", "#b3221c", "#4a3428", "#2e2420", "#b3221c");
S.steamPY2 = steamer("steamPY2", "#2a2420", "#e8e2d4", "#5a4030", "#3a2e26", "#b3221c");
/** Paraguayan "chata": flat gun barge with one big cannon */
S.chata = { key: "chata", w: 9, h: 2.6, ppm: 80, paint: (w) => { w.poly([[-4, 0.1], [4, 0.1], [4.3, 0.8], [-4.3, 0.8]], "#5a4030", 2.5); for (let k = 0; k < 8; k++) w.line([[-4 + k, 0.15], [-4 + k, 0.75]], 1.2, "rgba(20,14,10,0.5)");
  w.ell(-0.4, 1.15, 0.45, 0.45, "#4a3424", 2); w.poly([[-0.6, 0.9], [3.2, 1.25], [3.25, 1.55], [-0.6, 1.5]], "#2a2a2e", 2.5); w.ell(3.25, 1.4, 0.12, 0.17, "#0e0e10", 1.5); } };
/** Brazilian casemate ironclad (riveted armour box, low freeboard, one funnel) */
S.ironclad = { key: "ironclad", w: 26, h: 9, ppm: 34, paint: (w) => {
  w.poly([[-12, 0.2], [11.2, 0.2], [12.8, 1.6], [-12.6, 1.5]], "#2a2c30", 3); w.rect(-12.6, 1.45, 25.4, 0.22, "#5a5e64", 1.5);
  w.poly([[-6.5, 1.6], [6.5, 1.6], [5.2, 4.0], [-5.2, 4.0]], "#3e4248", 3); for (let k = 0; k < 9; k++) w.line([[-5.6 + k * 1.4, 1.7], [-4.6 + k * 1.15, 3.9]], 1, "rgba(0,0,0,0.25)");
  for (const x of [-3.6, 0, 3.6]) w.rect(x - 0.4, 2.4, 0.8, 0.7, "#0e0e10", 1.5);
  w.poly([[0.4, 4], [1.6, 4], [1.7, 7.8], [0.3, 7.8]], "#1e1e22", 2.5); w.rect(0.2, 7.5, 1.6, 0.35, "#b3221c", 1); w.line([[-9, 1.6], [-9, 6.2]], 2, "#4a3424"); w.rect(-9, 5, 1.6, 1.1, "#2f8a3e", 1.5); w.ell(-8.2, 5.55, 0.35, 0.3, "#f2c22a", 0); } };
/** muzzle-loading field gun with spoked wooden wheel (La Hitte / Whitworth type) */
S.gun1860 = { key: "gun1860", w: 4.2, h: 2.2, ppm: 140, paint: (w) => {
  w.poly([[-1.9, 0.12], [0.2, 0.55], [0.3, 0.8], [-1.95, 0.32]], "#5a3e26", 2.5);
  w.poly([[-0.6, 0.95], [1.9, 1.1], [1.9, 1.32], [-0.6, 1.32]], "#2c2e30", 2.5); w.rect(1.75, 1.05, 0.2, 0.32, "#1e2022", 1.5); w.ell(-0.62, 1.13, 0.15, 0.2, "#2c2e30", 1.5);
  w.ell(0, 0.7, 0.7, 0.7, null, 3); w.ell(0, 0.7, 0.62, 0.62, null, 2, 0, Math.PI * 2); for (let k = 0; k < 12; k++) { const a = (k / 12) * Math.PI * 2; w.line([[0, 0.7], [Math.cos(a) * 0.64, 0.7 + Math.sin(a) * 0.64]], 1.8, "#6a4a2c"); }
  w.ell(0, 0.7, 0.7, 0.7, null, 6, 0, Math.PI * 2); w.ell(0, 0.7, 0.13, 0.13, "#3a2a1a", 1.5); } };
/** ox cart (carreta) with two huge wheels and a hide roof */
S.carreta = { key: "carreta", w: 6.6, h: 3.6, ppm: 110, paint: (w) => {
  w.rect(-2.6, 1.0, 5.2, 0.35, "#6a4a2c", 2.5); w.line([[2.6, 1.15], [3.3, 0.9]], 5, "#5a3e26"); w.poly([[-2.6, 1.35], [2.6, 1.35], [2.2, 2.9], [-2.2, 2.9]], "#a8865a", 2.5);
  w.ell(0, 2.9, 2.2, 0.5, "#a8865a", 2.5, 0, Math.PI); for (let k = -2; k <= 2; k++) w.line([[k, 1.4], [k * 0.9, 3.3]], 1.4, "rgba(60,40,20,0.4)");
  w.ell(-0.6, 0.95, 0.95, 0.95, null, 6, 0, Math.PI * 2); for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2; w.line([[-0.6, 0.95], [-0.6 + Math.cos(a) * 0.9, 0.95 + Math.sin(a) * 0.9]], 2.2, "#5a3e26"); } } };
S.tent = { key: "tent", w: 5, h: 3, ppm: 110, paint: (w) => { w.poly([[-2.3, 0], [0, 2.5], [2.3, 0]], "#d8cfb6", 3); w.poly([[-0.5, 0], [0, 1.6], [0.5, 0]], "#3a3226", 2); w.line([[0, 2.5], [0, 2.9]], 3, "#5a3e26"); w.line([[-2.3, 0], [-2.3, 0.2]], 2); } };
S.crossW = { key: "crossW", w: 1.2, h: 1.6, ppm: 160, paint: (w) => { w.rect(-0.06, 0, 0.12, 1.4, "#6a5038", 2); w.rect(-0.38, 0.95, 0.76, 0.11, "#6a5038", 2); } };
S.cot = { key: "cot", w: 2.6, h: 0.9, ppm: 160, paint: (w) => { w.rect(-1.15, 0.38, 2.3, 0.16, "#cfc6ae", 2); w.line([[-1.1, 0], [-0.9, 0.4]], 2, "#5a3e26"); w.line([[1.1, 0], [0.9, 0.4]], 2, "#5a3e26"); w.line([[-0.9, 0], [-1.1, 0.4]], 2, "#5a3e26"); w.line([[0.9, 0], [1.1, 0.4]], 2, "#5a3e26"); } };
S.drum = { key: "drum", w: 0.8, h: 0.8, ppm: 260, paint: (w) => { w.rect(-0.28, 0.1, 0.56, 0.42, "#b3221c", 2); w.ell(0, 0.52, 0.28, 0.07, "#efe6d2", 2); for (let k = 0; k < 4; k++) w.line([[-0.28 + k * 0.18, 0.12], [-0.18 + k * 0.18, 0.5]], 1.4, "#e8c46a"); } };
S.throne = { key: "throne", w: 2, h: 2.6, ppm: 160, paint: (w) => { w.rect(-0.7, 0.5, 1.4, 0.25, "#7a1a18", 2.5); w.poly([[-0.65, 0.75], [0.65, 0.75], [0.6, 2.3], [0, 2.5], [-0.6, 2.3]], "#8a1e1c", 2.5); w.line([[-0.65, 0.75], [-0.6, 2.3], [0, 2.5], [0.6, 2.3], [0.65, 0.75]], 6, "#d6b04a"); for (const x of [-0.7, 0.62]) w.rect(x, 0, 0.08, 0.6, "#d6b04a", 1.5); w.ell(0, 2.05, 0.18, 0.18, "#d6b04a", 1.5); } };
S.palace = { key: "palace", w: 30, h: 18, ppm: 36, paint: (w) => {
  w.rect(-13, 0, 26, 7.5, "#ece6d6", 3); w.rect(-13, 7.5, 26, 0.6, "#d8d0bc", 2); for (let k = 0; k < 10; k++) { const x = -12 + k * 2.6; w.rect(x, 1.2, 1.1, 2.2, "#3a4a5a", 1.5); w.rect(x, 4.4, 1.1, 2.2, "#3a4a5a", 1.5); w.ell(x + 0.55, 6.6, 0.55, 0.4, "#ece6d6", 1.5, 0, Math.PI); }
  w.rect(-2.6, 8.1, 5.2, 4.5, "#f2ece0", 3); w.rect(-1.6, 12.6, 3.2, 2.2, "#f2ece0", 3); w.ell(0, 14.8, 1.6, 1.8, "#e8e2d2", 3, 0, Math.PI); w.line([[0, 16.6], [0, 17.6]], 2.5); for (const x of [-1.2, 0.2]) w.rect(x, 9, 1, 2.6, "#3a4a5a", 1.5);
  w.rect(-13.4, 0, 26.8, 0.5, "#c8bea6", 2); } };
S.cathedral = { key: "cathedral", w: 22, h: 20, ppm: 34, paint: (w) => {
  w.rect(-7, 0, 14, 10, "#e6dcc6", 3); w.poly([[-7, 10], [7, 10], [0, 13]], "#d8ccb2", 3); for (const x of [-9.5, 9.5]) { w.rect(x - 2.4, 0, 4.8, 15, "#e6dcc6", 3); w.rect(x - 2.6, 15, 5.2, 0.5, "#cfc4aa", 2); w.ell(x, 15.5, 1.8, 2, "#c9c0a8", 2.5, 0, Math.PI); w.rect(x - 0.6, 10.5, 1.2, 2.4, "#2a2a30", 1.5); w.line([[x, 17.5], [x, 18.8]], 2); w.line([[x - 0.4, 18.4], [x + 0.4, 18.4]], 2); }
  w.ell(0, 0, 1.6, 4.2, "#3a2a22", 2.5, 0, Math.PI); w.ell(0, 7.2, 1, 1, "#9ab4c8", 2); } };
S.lapacho = { key: "lapacho", w: 9, h: 10, ppm: 60, paint: (w) => { const r = rng(17); w.line([[0, 0], [0.3, 3.5], [-1.4, 6], [-2.4, 7.2]], 9, "#4a3426"); w.line([[0.3, 3.5], [1.8, 6.2], [2.8, 7]], 7, "#4a3426");
  for (let i = 0; i < 70; i++) { const x = (r() - 0.5) * 7.4, y = 6 + r() * 3.4 - Math.abs(x) * 0.3; w.ell(x, y, 0.5 + r() * 0.5, 0.35 + r() * 0.3, ["#e0559a", "#f07ab4", "#c8407e", "#f59ac6"][i % 4], 1); } } };

// ---------------- flags ----------------
const F = FLAGS as Record<string, (w: WP, W: number, H: number) => void>;
F.imp = (w, W, H) => { w.rect(0, 0, W, H, "#1f7a3a", 0); w.poly([[W * 0.08, H / 2], [W / 2, H * 0.92], [W * 0.92, H / 2], [W / 2, H * 0.08]], "#f2c22a", 0);
  w.ell(W / 2, H / 2, W * 0.13, H * 0.2, "#1e4a9a", 0); w.ell(W / 2, H / 2, W * 0.13, H * 0.2, null, 3); w.ell(W / 2, H / 2, W * 0.09, H * 0.13, null, 2); w.rect(W * 0.45, H * 0.7, W * 0.1, H * 0.08, "#d6b04a", 1.5); for (let k = 0; k < 3; k++) w.ell(W * (0.46 + k * 0.04), H * 0.8, W * 0.012, H * 0.02, "#d6b04a", 0);
  for (const s of [-1, 1]) w.line([[W / 2 + s * W * 0.16, H * 0.3], [W / 2 + s * W * 0.18, H * 0.55], [W / 2 + s * W * 0.14, H * 0.7]], 6, s < 0 ? "#3a6a2a" : "#6a4a2a"); };
F.arg = (w, W, H) => { w.rect(0, 0, W, H / 3, "#74acdf", 0); w.rect(0, H / 3, W, H / 3, "#f6f4ee", 0); w.rect(0, (2 * H) / 3, W, H / 3, "#74acdf", 0); w.ell(W / 2, H / 2, W * 0.05, W * 0.05, "#f6b40e", 1.5); for (let k = 0; k < 16; k++) { const a = (k / 16) * Math.PI * 2; w.line([[W / 2 + Math.cos(a) * W * 0.055, H / 2 + Math.sin(a) * W * 0.055], [W / 2 + Math.cos(a) * W * 0.085, H / 2 + Math.sin(a) * W * 0.085]], 3, "#e8a40e"); } };
F.uru = (w, W, H) => { for (let k = 0; k < 9; k++) w.rect(0, (H * k) / 9, W, H / 9, k % 2 ? "#0038a8" : "#f6f4ee", 0); w.rect(0, H * 4 / 9, W * 0.38, H * 5 / 9, "#f6f4ee", 0); const cx = W * 0.19, cy = H * 0.72; w.ell(cx, cy, W * 0.05, W * 0.05, "#fcd116", 1.5); for (let k = 0; k < 16; k++) { const a = (k / 16) * Math.PI * 2; w.line([[cx + Math.cos(a) * W * 0.055, cy + Math.sin(a) * W * 0.055], [cx + Math.cos(a) * W * 0.09, cy + Math.sin(a) * W * 0.09]], 3, "#e8a40e"); } };
F.par = (w, W, H) => { w.rect(0, (2 * H) / 3, W, H / 3, "#d52b1e", 0); w.rect(0, H / 3, W, H / 3, "#f6f4ee", 0); w.rect(0, 0, W, H / 3, "#0038a8", 0); w.ell(W / 2, H / 2, H * 0.14, H * 0.14, null, 4); w.ell(W / 2, H / 2, H * 0.1, H * 0.1, null, 2); w.ell(W / 2, H / 2, H * 0.04, H * 0.04, "#f6c80e", 1.5); for (const s of [-1, 1]) w.line([[W / 2 + s * H * 0.09, H * 0.42], [W / 2 + s * H * 0.12, H * 0.55]], 4, "#3a8a2a"); };
F.blanco = (w, W, H) => { w.rect(0, 0, W, H, "#f4f2ec", 0); w.rect(0, 0, W, H * 0.12, "#2a3a6a", 0); };
F.colorado = (w, W, H) => { w.rect(0, 0, W, H, "#c4241c", 0); w.rect(0, 0, W, H * 0.12, "#7a1410", 0); };
F.white = (w, W, H) => { w.rect(0, 0, W, H, "#f4f2ec", 0); };

// ---------------- South America map (SX/SY: map metres) ----------------
export const SX = (lon: number) => (lon + 58) * 0.9, SY = (lat: number) => (lat + 24) * 0.9;
const sp = (a: number[]) => { const p: number[][] = []; for (let i = 0; i < a.length; i += 2) p.push([SX(a[i]), SY(a[i + 1])]); return p; };
const CONT = [-77.5, 8.5, -75.5, 10.5, -72, 11.8, -71.3, 12.4, -68, 10.6, -64, 10.7, -61.5, 10.5, -60, 8.5, -57, 6, -54, 5.8, -51.5, 4.4, -50, 1.8, -49.9, 0, -48.5, -1.3, -44.5, -2.4, -41.5, -2.9, -38.5, -3.7, -35.2, -5.5, -34.8, -7.5, -35.2, -9.4, -37.1, -11.1, -38.5, -13, -39, -15, -39.2, -17.7, -40.5, -20.5, -41.5, -22.4, -43.2, -23, -45, -23.6, -48, -25.5, -48.6, -28.2, -50, -30.5, -51.5, -32, -53.2, -33.7, -54.9, -34.9, -56.2, -34.9, -57.8, -34.4, -58.4, -33.9, -58.5, -34.4, -58.3, -34.7, -57.2, -35.6, -57.3, -36.2, -56.7, -36.5, -57.5, -38.2, -62, -38.9, -62.3, -40.5, -65, -41, -64, -42.4, -65.2, -45, -67.5, -46.5, -66, -47.8, -68.5, -50.2, -69, -51.6, -68.4, -52.4, -70.5, -53.5, -71.5, -54, -74, -52.5, -75.5, -48.5, -74, -44, -73.5, -41, -73.6, -37.5, -71.6, -33, -71.4, -29, -70.5, -25, -70.2, -18.5, -72, -17, -76.2, -14, -77.3, -12, -79.5, -8, -81.2, -5.5, -80, -2.2, -80.8, -1, -80, 1, -78.8, 1.8, -77.3, 4, -77.4, 7];
export const SAC: Record<string, number[]> = {
  PAR: [-58.16, -19.85, -59.1, -19.3, -61.8, -19.6, -62.6, -22.2, -61.0, -23.5, -59.5, -24.6, -57.6, -25.3, -57.8, -25.9, -58.6, -27.3, -56.4, -27.5, -55.6, -27.3, -54.6, -25.6, -54.3, -24.1, -55.4, -23.9, -55.8, -22.3, -57.9, -22.1, -57.9, -20.7],
  URU: [-57.6, -30.2, -56.8, -30.1, -55.6, -30.9, -54.1, -31.9, -53.4, -32.6, -53.6, -33.7, -54.9, -34.9, -56.2, -34.9, -57.8, -34.4, -58.4, -33.6, -58.1, -32.3, -58.2, -31.3],
  ARG: [-65.7, -22.1, -64.3, -22.8, -62.6, -22.2, -61.0, -23.5, -59.5, -24.6, -57.6, -25.3, -57.8, -25.9, -58.6, -27.3, -56.4, -27.5, -55.6, -27.3, -54.6, -25.6, -53.6, -26.2, -53.8, -27.1, -55.7, -28.2, -57.6, -30.2, -58.2, -31.3, -58.1, -32.3, -58.4, -33.6, -58.4, -33.9, -58.5, -34.4, -58.3, -34.7, -57.2, -35.6, -57.3, -36.2, -56.7, -36.5, -57.5, -38.2, -62, -38.9, -62.3, -40.5, -65, -41, -64, -42.4, -65.2, -45, -67.5, -46.5, -66, -47.8, -68.5, -50.2, -69, -51.6, -68.4, -52.4, -72.3, -51.5, -73.2, -49, -72, -46, -71.7, -44, -71.8, -40, -71, -36, -70, -33, -69.8, -30, -68.5, -27, -68.3, -24.5, -67.0, -22.8],
  BOL: [-69.5, -10.9, -65.3, -9.8, -60.5, -13.7, -60.2, -16.3, -58.2, -16.3, -57.6, -18.2, -58.16, -19.85, -59.1, -19.3, -61.8, -19.6, -62.6, -22.2, -64.3, -22.8, -65.7, -22.1, -67.0, -22.8, -68.3, -24.5, -70.5, -25, -70.2, -21.4, -68.7, -19, -69.4, -17.5, -69.0, -15.2],
  BRA: [-73.9, -7.4, -72.9, -9.4, -70.6, -9.5, -69.5, -10.9, -65.3, -9.8, -60.5, -13.7, -60.2, -16.3, -58.2, -16.3, -57.6, -18.2, -58.16, -19.85, -57.9, -20.7, -57.9, -22.1, -55.8, -22.3, -55.4, -23.9, -54.3, -24.1, -54.6, -25.6, -53.6, -26.2, -53.8, -27.1, -55.7, -28.2, -57.6, -30.2, -56.8, -30.1, -55.6, -30.9, -54.1, -31.9, -53.4, -32.6, -53.6, -33.7, -53.2, -33.7, -51.5, -32, -50, -30.5, -48.6, -28.2, -48, -25.5, -45, -23.6, -43.2, -23, -41.5, -22.4, -40.5, -20.5, -39.2, -17.7, -39, -15, -38.5, -13, -37.1, -11.1, -35.2, -9.4, -34.8, -7.5, -35.2, -5.5, -38.5, -3.7, -41.5, -2.9, -44.5, -2.4, -48.5, -1.3, -49.9, 0, -50, 1.8, -51.5, 4.4, -54, 2.2, -56, 1.9, -59.7, 1.6, -60, 4.5, -63.4, 3.9, -64.8, 1.3, -67, 1.8, -69.8, 1.1, -69.4, -1.1, -70, -4.2],
  MT: [-65.3, -9.8, -60.5, -13.7, -60.2, -16.3, -58.2, -16.3, -57.6, -18.2, -58.16, -19.85, -57.9, -20.7, -57.9, -22.1, -55.8, -22.3, -54.2, -22.6, -51, -20, -51, -15.5, -50.7, -12.5, -51, -9, -58, -8.5],
  COR: [-58.6, -27.3, -56.4, -27.5, -55.6, -27.3, -55.7, -28.2, -57.6, -30.2, -58.2, -30.3, -59.6, -30.4, -59.4, -29.3, -59.1, -28.0],
  RGS: [-57.6, -30.2, -55.7, -28.2, -53.8, -27.1, -51.5, -27.5, -50, -29.3, -50, -30.5, -51.5, -32, -53.2, -33.7, -53.6, -33.7, -53.4, -32.6, -54.1, -31.9, -55.6, -30.9, -56.8, -30.1],
};
export const SACOL: Record<string, string> = { PAR: "#d9b27a", URU: "#c9d2a6", ARG: "#d8cba6", BOL: "#d2c2a2", BRA: "#b8cc98" };
const RIVERS: number[][] = [
  [-56.6, -14.6, -57.4, -16.3, -57.65, -19.0, -58.16, -19.85, -57.9, -20.7, -57.9, -22.1, -57.4, -23.3, -57.6, -25.3, -57.8, -25.9, -58.5, -27.05, -58.6, -27.3],
  [-51.0, -20.0, -53.0, -22.6, -54.3, -24.1, -54.6, -25.6, -55.6, -27.3, -56.4, -27.5, -58.6, -27.3, -58.8, -27.5, -59.6, -29.2, -60.6, -31.6, -60.7, -32.9, -59.3, -33.8, -58.5, -34.2],
  [-51.5, -27.6, -53.8, -27.1, -55.7, -28.2, -57.08, -29.75, -57.6, -30.2, -58.2, -31.3, -58.1, -32.3, -58.4, -33.6],
  [-62.6, -22.2, -61.0, -23.5, -59.5, -24.6, -57.6, -25.3],
];
export const TOWNS: Record<string, [number, number, string]> = {
  asu: [-57.6, -25.3, "Assunção"], hum: [-58.5, -27.07, "Humaitá"], cor: [-58.83, -27.47, "Corrientes"], uru: [-57.08, -29.75, "Uruguaiana"], tui: [-58.3, -27.28, "Tuiuti"],
  cur: [-58.56, -27.15, "Curupaiti"], mvd: [-56.2, -34.9, "Montevidéu"], bai: [-58.4, -34.6, "Buenos Aires"], rio: [-43.2, -22.9, "Rio de Janeiro"], cba: [-57.65, -19.0, "Corumbá"],
  cuy: [-56.1, -15.6, "Cuiabá"], ria: [-58.75, -27.5, "Riachuelo"], ito: [-57.55, -25.48, "Itororó"], lom: [-57.48, -25.56, "Lomas Valentinas"], acn: [-57.05, -25.4, "Acosta Ñu"],
  cc: [-55.95, -22.65, "Cerro Corá"], pir: [-57.05, -25.45, "Piribebuy"],
};
/** the South-America map at z = 0, each shot with its own style; `detail` adds the Plata basin rivers at high resolution */
export const samap = (K: string, st: MapStyle, o: { labels?: boolean; towns?: string[]; rivers?: boolean } = {}) => loc(undefined, { near: st.sea, far: st.sea, zFar: 1 }, [
  Lr(K + "sa", 0.02, -24, 26, -32, 36, 48, (w) => {
    w.rect(-24, -32, 50, 68, st.sea, 0); if (st.paper) for (let i = 0; i < 500; i++) { const r = rng(i + 3); w.ell((r() - 0.5) * 50, (r() - 0.5) * 68, 0.3 + r() * 1.2, 0.2 + r() * 0.8, "rgba(120,90,50,0.05)", 0); }
    for (let k = 0; k < 18; k++) w.line([[-24, -32 + k * 4], [26, -32 + k * 4]], 1, st.grid); for (let k = 0; k < 13; k++) w.line([[-24 + k * 4, -32], [-24 + k * 4, 36]], 1, st.grid);
    w.poly(sp(CONT), st.land, 3, st.ink);
    for (const k of ["BRA", "ARG", "BOL", "PAR", "URU"]) w.poly(sp(SAC[k]), mix(st.land, SACOL[k], 0.5), 2, st.ink);
    const g = w.g.createRadialGradient(SX(-58), SY(-26), 8, SX(-58), SY(-26), 46); g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(1, st.vign); w.rect(-24, -32, 50, 68, g, 0);
  }),
  Lr(K + "sd", 0.01, SX(-69), SX(-43), SY(-39), SY(-11), 100, (w) => {
    if (o.rivers !== false) for (const r of RIVERS) { w.line(sp(r), 9, mix(st.sea, "#000000", 0.25)); w.line(sp(r), 5, mix(st.sea, "#ffffff", 0.18)); }
    if (o.labels !== false) { const lab: [string, number, number, number][] = [["PARAGUAI", -58.6, -23.2, 0.62], ["BRASIL", -52.2, -18.5, 0.9], ["ARGENTINA", -62, -30.5, 0.8], ["URUGUAI", -55.8, -32.6, 0.5], ["BOLÍVIA", -62.5, -17.5, 0.55], ["MATO GROSSO", -55.2, -15.8, 0.42], ["CORRIENTES", -58, -28.8, 0.32], ["RIO PARANÁ", -60.8, -29.6, 0.26], ["RIO PARAGUAI", -56.6, -21, 0.24]];
      for (const [s, lo, la, sz] of lab) w.text(s, SX(lo), SY(la), sz * 1.4, st.lab); }
    for (const k of o.towns ?? []) { const [lo, la, n] = TOWNS[k]; w.ell(SX(lo), SY(la), 0.14, 0.14, "#2a1d16", 2); w.text(n, SX(lo) + 0.2, SY(la) + 0.28, 0.34, st.lab, "bold", "left"); }
  }, 0),
], true);
export const MAPS: Record<string, MapStyle> = {
  parch: { sea: "#9bb7b4", land: "#ead8ac", ink: "#5a4630", grid: "rgba(255,255,255,0.18)", vign: "rgba(80,50,20,0.55)", lab: "#3a2a1c", paper: true },
  night: { sea: "#16283c", land: "#34404e", ink: "#88a8c8", grid: "rgba(120,170,220,0.12)", vign: "rgba(0,0,0,0.7)", lab: "#b8d4f0" },
  ember: { sea: "#2a1a16", land: "#6a4430", ink: "#e8a868", grid: "rgba(255,160,80,0.1)", vign: "rgba(0,0,0,0.65)", lab: "#ffe0b0" },
  olive: { sea: "#8aa6a0", land: "#d6cfa4", ink: "#4a4a30", grid: "rgba(255,255,255,0.15)", vign: "rgba(40,40,20,0.5)", lab: "#2e2e1c", paper: true },
  steel: { sea: "#5f7786", land: "#c9c2ae", ink: "#2e3036", grid: "rgba(255,255,255,0.14)", vign: "rgba(20,24,30,0.6)", lab: "#1e2228" },
  teal: { sea: "#1e4a52", land: "#d8d0b4", ink: "#1a2a2a", grid: "rgba(200,255,255,0.1)", vign: "rgba(0,20,24,0.6)", lab: "#1a2a2a" },
  dusk: { sea: "#3a3256", land: "#c8a8a0", ink: "#2a1e2e", grid: "rgba(255,200,220,0.1)", vign: "rgba(20,10,30,0.6)", lab: "#2a1a2a" },
  sepia: { sea: "#a89272", land: "#e8d6b0", ink: "#4a3420", grid: "rgba(255,255,255,0.12)", vign: "rgba(60,30,10,0.6)", lab: "#3a2410", paper: true },
  rust: { sea: "#4a5560", land: "#c8b494", ink: "#3a2a20", grid: "rgba(255,255,255,0.1)", vign: "rgba(30,15,10,0.6)", lab: "#2a1a12" },
  jade: { sea: "#2e5a4e", land: "#e2d8b8", ink: "#24302a", grid: "rgba(220,255,240,0.1)", vign: "rgba(0,20,14,0.6)", lab: "#1e2a22" },
  blood: { sea: "#3a1e1e", land: "#b89a86", ink: "#2a1414", grid: "rgba(255,180,160,0.08)", vign: "rgba(20,0,0,0.65)", lab: "#2a1010" },
  ice: { sea: "#b8cdd8", land: "#eef0ea", ink: "#3a4a5a", grid: "rgba(80,110,140,0.15)", vign: "rgba(40,60,80,0.45)", lab: "#2a3a4a" },
};
/** camera framing a lon/lat on the map from distance d */
export const mapCam = (lon: number, lat: number, d: number, fov = 40) => [SX(lon), SY(lat), -d, fov, 0];
export const hlS = (A: Sc, key: string, k: number, col = "#9a1e18", a = 0.6) => { if (k <= 0) return; A.fx(-0.05, (g, c) => { const pts = sp(SAC[key]); g.save(); g.globalAlpha = a * clamp(k) * (0.85 + 0.15 * Math.sin(A.t * 4)); g.fillStyle = col; g.beginPath(); pts.forEach(([x, y], i) => { const [sx, sy] = P(c, x, y, 0); i ? g.lineTo(sx, sy) : g.moveTo(sx, sy); }); g.closePath(); g.fill(); g.globalAlpha = clamp(k); g.strokeStyle = mix(col, "#ffffff", 0.3); g.lineWidth = 4; g.stroke(); g.restore(); }); };
export const arrowS = (A: Sc, a: [number, number], b: [number, number], k: number, col: string, wid = 0.3, bend = 0.18) => {
  if (k <= 0) return; A.fx(-0.08, (g, c) => {
    const kk = easeOut(clamp(k)), ax = SX(a[0]), ay = SY(a[1]), ex = SX(b[0]), ey = SY(b[1]), mx = (ax + ex) / 2 - (ey - ay) * bend, my = (ay + ey) / 2 + (ex - ax) * bend;
    const q = (u: number) => [(1 - u) * (1 - u) * ax + 2 * (1 - u) * u * mx + u * u * ex, (1 - u) * (1 - u) * ay + 2 * (1 - u) * u * my + u * u * ey];
    const pts: number[][] = []; for (let i = 0; i <= 30; i++) { const [x, y] = q((i / 30) * kk); pts.push(P(c, x, y, 0)); }
    const s = P(c, ax, ay, 0)[2]; g.save(); g.lineCap = "round"; g.lineJoin = "round";
    g.strokeStyle = "rgba(10,6,6,0.35)"; g.lineWidth = wid * s + 8; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y + 5) : g.moveTo(x, y + 5))); g.stroke();
    g.strokeStyle = col; g.lineWidth = wid * s; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke();
    const [x1, y1] = pts[30], [x2, y2] = pts[27], an = Math.atan2(y1 - y2, x1 - x2), h = wid * 2.3 * s; g.fillStyle = mix(col, "#ffffff", 0.15); g.strokeStyle = "rgba(10,6,6,0.6)"; g.lineWidth = 2;
    g.beginPath(); g.moveTo(x1 + Math.cos(an) * h, y1 + Math.sin(an) * h); g.lineTo(x1 + Math.cos(an + 2.4) * h, y1 + Math.sin(an + 2.4) * h); g.lineTo(x1 + Math.cos(an - 2.4) * h, y1 + Math.sin(an - 2.4) * h); g.closePath(); g.fill(); g.stroke();
    if (k < 1) glow(g, x1, y1, 2.2 * h, "rgba(255,220,160,1)", 0.5); g.restore();
  });
};
export const pinS = (A: Sc, key: string, t: number, kind: "fire" | "x" | "dot" | "star" | "ring" = "dot", col = "#b3221c") => { if (t < 0) return; const [lon, lat] = TOWNS[key]; A.fx(-0.09, (g, c) => {
  const k = easeOut(clamp(t / 0.3)), [sx, sy, s] = P(c, SX(lon), SY(lat), 0);
  if (kind === "fire") { glow(g, sx, sy - 0.2 * s, 1.2 * s * k, "rgba(255,140,40,0.9)", 0.8 + 0.2 * Math.sin(t * 9)); g.fillStyle = "#ffb03a"; g.beginPath(); g.ellipse(sx, sy - 0.22 * s * k, 0.18 * s * k, (0.32 + 0.05 * Math.sin(t * 13)) * s * k, 0, 0, 7); g.fill(); g.fillStyle = "#fff0a0"; g.beginPath(); g.ellipse(sx, sy - 0.16 * s * k, 0.08 * s * k, 0.15 * s * k, 0, 0, 7); g.fill(); }
  else if (kind === "x") { g.strokeStyle = col; g.lineWidth = 0.1 * s; g.lineCap = "round"; const r = 0.3 * s * k; g.beginPath(); g.moveTo(sx - r, sy - r); g.lineTo(sx + r, sy + r); g.moveTo(sx + r, sy - r); g.lineTo(sx - r, sy + r); g.stroke(); }
  else if (kind === "ring") { for (let i = 0; i < 3; i++) { const ph = (t * 0.8 + i / 3) % 1; g.strokeStyle = `rgba(255,220,150,${0.7 * (1 - ph)})`; g.lineWidth = 3; g.beginPath(); g.arc(sx, sy, (0.2 + ph * 1.2) * s, 0, 7); g.stroke(); } g.fillStyle = col; g.beginPath(); g.arc(sx, sy, 0.16 * s * k, 0, 7); g.fill(); }
  else if (kind === "star") { glow(g, sx, sy, 1.0 * s * k, "rgba(255,230,140,1)", 0.6); g.fillStyle = col; g.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, r = (i % 2 ? 0.13 : 0.33) * s * k; g.lineTo(sx + Math.cos(a) * r, sy + Math.sin(a) * r); } g.closePath(); g.fill(); g.strokeStyle = INK; g.lineWidth = 2; g.stroke(); }
  else { const pr = 0.22 * s * k * (1 + 0.15 * Math.sin(t * 6)); glow(g, sx, sy, pr * 3, "rgba(255,120,90,1)", 0.4); g.fillStyle = col; g.strokeStyle = "#241726"; g.lineWidth = 3; g.beginPath(); g.arc(sx, sy, pr, 0, 7); g.fill(); g.stroke(); }
}); };

// ---------------- painted places for 1860s South America ----------------
/** river surface band between z0 and z1 with moving ripples and sun glitter (drawn as an fx so it animates) */
export const river = (A: Sc, z0: number, z1: number, col: [string, string], o: { glit?: string; t?: number; seed?: number; amp?: number } = {}) => A.fx(z1 + 0.5, (g, c) => {
  const t = o.t ?? A.t, [, y0] = P(c, 0, 0, z0), [, y1] = P(c, 0, 0, z1); const gr = g.createLinearGradient(0, Math.min(y0, y1), 0, Math.max(y0, y1)); gr.addColorStop(0, col[1]); gr.addColorStop(1, col[0]);
  g.fillStyle = gr; g.fillRect(0, Math.min(y0, y1), VW, Math.abs(y0 - y1) + 2); const r = rng(o.seed ?? 5);
  for (let i = 0; i < 140; i++) { const z = lerp(z0, z1, Math.pow(r(), 1.6)), x = c.x + (r() - 0.5) * (z - c.z) * 2.4 + Math.sin(t * 0.6 + i) * 0.6, [sx, sy, s] = P(c, x + t * 0.4, 0, z); if (sy < Math.min(y0, y1) || sy > Math.max(y0, y1)) continue;
    const L = (0.6 + r() * 1.6) * s, a = 0.12 + 0.18 * (0.5 + 0.5 * Math.sin(t * 2 + i * 1.7)); g.strokeStyle = i % 3 ? `rgba(255,255,255,${a})` : `rgba(0,0,0,${a * 0.6})`; g.lineWidth = Math.max(1, 0.04 * s); g.beginPath(); g.moveTo(sx - L, sy); g.quadraticCurveTo(sx, sy - 0.05 * s, sx + L, sy); g.stroke(); }
  if (o.glit) for (let i = 0; i < 60; i++) { const ph = (t * 1.3 + i * 0.37) % 1, x = VW * 0.5 + (r() - 0.5) * VW * 0.4, y = lerp(Math.min(y0, y1), Math.max(y0, y1), r() * 0.6); glow(g, x, y, 6 + 10 * r(), o.glit, 0.5 * Math.sin(ph * Math.PI)); }
});
/** earthwork parapet / trench line with sandbag-free 1860s profile (packed earth + logs) */
export const earthwork = (K: string, z: number, col: string, o: { h?: number; wid?: number; logs?: boolean; emb?: number; blur?: number; seed?: number } = {}) => { const H = o.h ?? 1.6, W = o.wid ?? 30;
  return Lr(K + "ew" + z, z, -W, W, -0.3, H + 0.6, Math.max(20, Math.min(70, 900 / z)), (w) => { const r = rng(o.seed ?? 3); const pts: number[][] = [[-W, -0.3]]; for (let x = -W; x <= W; x += 0.8) pts.push([x, H * (0.85 + 0.15 * r())]); pts.push([W, -0.3]); w.poly(pts, w.vgrad(0, H, shade(col, 0.7), col), 3);
    if (o.logs) for (let x = -W; x < W; x += 0.35) w.rect(x, H * 0.55, 0.3, H * 0.4, mix("#6a4a2c", "#3a2a1c", r()), 1.2);
    for (let i = 0; i < (o.emb ?? 0); i++) { const x = -W + ((i + 0.5) / (o.emb ?? 1)) * 2 * W; w.rect(x - 0.6, H * 0.45, 1.2, H * 0.6, "#1e1612", 2); }
    for (let i = 0; i < 80; i++) w.ell(-W + r() * 2 * W, r() * H * 0.8, 0.1 + r() * 0.3, 0.06 + r() * 0.15, "rgba(30,20,12,0.25)", 0); }, o.blur); };
/** abatis: felled trees with sharpened branches pointing at the attacker (Curupaiti) */
export const abatis = (K: string, z: number, col: string, seed: number, wid = 26) => Lr(K + "ab" + z, z, -wid, wid, -0.2, 2.0, Math.max(30, 900 / z), (w) => { const r = rng(seed);
  for (let x = -wid; x < wid; x += 0.9 + r() * 0.6) { const h = 0.8 + r() * 0.9, l = (r() - 0.5) * 0.8; w.line([[x, 0], [x + l, h]], 5, col); for (let k = 0; k < 3; k++) { const y = h * (0.3 + k * 0.25); w.line([[x + l * (y / h), y], [x + l * (y / h) + (r() - 0.3) * 0.8, y + 0.3 + r() * 0.3]], 3, shade(col, 0.85)); } } });
/** Humaitá-style brick battery: long wall with casemate embrasures, roof, flag staff */
export const battery = (K: string, z: number, o: { col?: string; wid?: number; h?: number; n?: number; ruin?: boolean; seed?: number; blur?: number } = {}) => { const W = o.wid ?? 26, H = o.h ?? 4.2, col = o.col ?? "#9a5a3e";
  return Lr(K + "bt" + z, z, -W, W, -0.5, H + 3, Math.max(14, Math.min(50, 700 / z)), (w) => { const r = rng(o.seed ?? 9);
    const top: number[][] = []; for (let x = -W; x <= W; x += 1.4) top.push([x, o.ruin ? H * (0.45 + 0.55 * r()) : H]);
    w.poly([[-W, -0.5], ...top, [W, -0.5]], w.vgrad(0, H, shade(col, 0.72), col), 3);
    for (let y = 0.3; y < H; y += 0.28) for (let x = -W + ((y / 0.28) % 2) * 0.3; x < W; x += 0.6) w.line([[x, y], [x + 0.55, y]], 0.8, "rgba(40,20,10,0.25)");
    for (let i = 0; i < (o.n ?? 12); i++) { const x = -W + ((i + 0.5) / (o.n ?? 12)) * 2 * W; w.rect(x - 0.55, H * 0.35, 1.1, 0.95, "#140e0c", 2.5); w.ell(x, H * 0.35 + 0.95, 0.55, 0.35, "#140e0c", 0, 0, Math.PI); }
    if (!o.ruin) { w.rect(-W, H, 2 * W, 0.35, shade(col, 0.6), 2); for (let x = -W; x < W; x += 2.2) w.poly([[x, H + 0.35], [x + 1.6, H + 0.35], [x + 0.8, H + 1.1]], "#6a5a4a", 2); }
  }, o.blur); };
/** a whole rifle line firing (muzzle flashes + white powder smoke drifting) along x0..x1 at depth z */
export const volley = (A: Sc, T: number, at: number, x0: number, x1: number, z: number, y = 1.35, dir = 1, n = 10, seed = 3) => A.fx(z - 0.3, (g, c) => {
  const age = T - at; if (age < -0.05 || age > 6) return; const r = rng(seed);
  for (let i = 0; i < n; i++) { const x = lerp(x0, x1, (i + 0.5) / n) + (r() - 0.5) * 0.3, dt = r() * 0.25, a = age - dt; if (a < 0) continue; const [sx, sy, s] = P(c, x + dir * 0.9, y, z);
    if (a < 0.07) { glow(g, sx, sy, 0.9 * s, "rgba(255,220,140,1)", 1); g.fillStyle = "#fff3c8"; g.beginPath(); g.ellipse(sx + dir * 0.35 * s, sy, 0.45 * s, 0.1 * s, 0, 0, 7); g.fill(); }
    for (let k = 0; k < 4; k++) { const kk = a * (0.5 + k * 0.25); puff(g, sx + dir * (0.4 + kk * 0.9) * s + kk * 0.5 * s, sy - kk * 0.35 * s, (0.25 + kk * 0.7) * s, [232, 228, 220], 0.55 * clamp(1 - a / 6)); } }
});
/** cannon shot from a gun1860 sprite at (x,z): recoil spring, flash, big white smoke bank */
export const gunFire = (A: Sc, x: number, z: number, T: number, at: number, dir = 1, sc = 1) => {
  const age = T - at, rec = age > 0 && age < 1.5 ? -dir * 0.45 * Math.exp(-age * 4) * Math.sin(Math.min(Math.PI / 2, age * 30)) : 0;
  A.sp("gun1860", x + rec, 0, z, { flip: dir < 0, sc });
  if (age > -0.02 && age < 7) A.fx(z - 0.2, (g, c) => { const [mx, my, s] = P(c, x + rec + dir * 1.95 * sc, 1.2 * sc, z - 0.2);
    if (age < 0.09) { glow(g, mx, my, 3 * s, "rgba(255,210,130,1)", 1); g.fillStyle = "#fff3c8"; g.beginPath(); g.ellipse(mx + dir * 0.8 * s, my, 1.1 * s, 0.32 * s, 0, 0, 7); g.fill(); }
    for (let k = 0; k < 9; k++) { const kk = age * (0.45 + k * 0.12); puff(g, mx + dir * (0.6 + kk * 1.6 + k * 0.2) * s, my - kk * 0.5 * s, (0.3 + kk * 0.8) * s, [236, 232, 226], 0.42 * clamp(1 - age / 7)); } });
};
/** cannonball impact on water: white column, ring, falling spray */
export const waterHit = (g: Ctx, c: Cam, age: number, x: number, z: number, h = 8, seed = 2) => { if (age < 0 || age > 3) return; const r = rng(seed), [sx, sy, s] = P(c, x, 0, z);
  const up = Math.min(1, age / 0.35), fall = Math.max(0, age - 0.6);
  for (let i = 0; i < 26; i++) { const a = (r() - 0.5) * 0.9, hh = h * (0.5 + r() * 0.6) * up - 4.9 * fall * fall, px = sx + Math.sin(a) * hh * 0.4 * s + (r() - 0.5) * 0.6 * s, py = sy - Math.max(0, hh) * s * Math.cos(a);
    puff(g, px, py, (0.5 + r() * 0.8 + age * 0.6) * s, [236, 242, 246], 0.75 * clamp(1 - age / 3)); }
  g.strokeStyle = `rgba(255,255,255,${0.6 * clamp(1 - age / 2)})`; g.lineWidth = 3; g.beginPath(); g.ellipse(sx, sy, (1 + age * 4) * s, (0.25 + age) * s * 0.25, 0, 0, 7); g.stroke(); };
/** smoke pouring from a steamer funnel (x offset of funnel) */
export const funnel = (A: Sc, x: number, y: number, z: number, o: { col?: [number, number, number]; wind?: number; a?: number; sc?: number; t?: number } = {}) => A.fx(z + 0.05, (g, c) => {
  const t = o.t ?? A.t, sc = o.sc ?? 1; for (let k = 0; k < 16; k++) { const ph = (t * 0.35 + k / 16) % 1, [sx, sy, s] = P(c, x - ph * 9 * (o.wind ?? 1) * sc, y + ph * 5 * sc, z); puff(g, sx + Math.sin(ph * 9 + k) * 0.4 * s, sy, (0.5 + ph * 2.6) * s * sc, o.col ?? [46, 42, 44], (o.a ?? 0.75) * (1 - ph)); }
});
/** cannonball flying along a ballistic arc from a to b, starting at t0, with a faint smoke trail */
export const ball = (A: Sc, T: number, t0: number, a: [number, number, number], b: [number, number, number], dur = 0.8, hgt = 3) => { const k = (T - t0) / dur; if (k < 0 || k > 1) return;
  const pos = (u: number): [number, number, number] => [lerp(a[0], b[0], u), lerp(a[1], b[1], u) + 4 * hgt * u * (1 - u), lerp(a[2], b[2], u)];
  const [x, y, z] = pos(k); A.fx(z - 0.1, (g, c) => { for (let i = 1; i < 8; i++) { const [px, py, pz] = pos(Math.max(0, k - i * 0.03)), [sx, sy, s] = P(c, px, py, pz); puff(g, sx, sy, 0.15 * s * (1 + i * 0.2), [210, 206, 200], 0.25 * (1 - i / 8)); }
    const [sx, sy, s] = P(c, x, y, z); g.fillStyle = "#141414"; g.beginPath(); g.arc(sx, sy, Math.max(2, 0.1 * s), 0, 7); g.fill(); }); };
/** handheld + speech helpers */
export const face = (f: FO, T: number, id: number, on = true): FO => ({ ...f, talk: talk(T, id, on) });
export { mk, smooth, hash };
