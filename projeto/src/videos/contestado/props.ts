// Contestado kit: southern-Brazil sprites (wooden houses, chapel, sawmill, logs, palisade, horse), araucaria forests,
// the Contestado flag, railway tracks on the ground, maps of Brazil and of the disputed region, outfits of the period.
import { WP, Layer, Sprite, P, Cam, Ctx, clamp, easeOut, glow, hash, rng, smooth } from "./engine";
import { SPR, Lr, Loc, hills, mountains } from "./paint";
import { FLAGS } from "./vehicles";
import { Outfit, mix, shade, INK } from "./toon";
import { Sc, v } from "./kit";

const add = (key: string, w: number, h: number, ppm: number, paint: (w: WP) => void) => { SPR[key] = { key, w, h, ppm, paint } as Sprite; };
const planks = (w: WP, x0: number, x1: number, y0: number, y1: number, col: string, step = 0.28) => {
  w.rect(x0, y0, x1 - x0, y1 - y0, w.vgrad(y0, y1, shade(col, 0.78), col), 3);
  const r = rng(Math.round(x0 * 13 + y1 * 7 + 99));
  for (let x = x0 + step; x < x1; x += step) w.line([[x, y0], [x, y1]], 1.3, "rgba(30,18,10,0.45)");
  for (let i = 0; i < (x1 - x0) * 3; i++) { const x = x0 + r() * (x1 - x0), y = y0 + r() * (y1 - y0); w.line([[x, y], [x, y + 0.2 + r() * 0.4]], 1, "rgba(255,240,210,0.12)"); }
};
// ---------------- sprites ----------------
/** caboclo wooden house: plank walls, shingle roof, porch, window with shutters */
add("casa", 8, 6, 90, (w) => {
  planks(w, -3.4, 3.4, 0.25, 3.0, "#9a6e46");
  for (const x of [-3.3, -1.1, 1.1, 3.3]) w.rect(x - 0.1, 0, 0.2, 0.3, "#3a2a1e", 1.5);
  w.poly([[-3.9, 2.9], [3.9, 2.9], [0, 5.2]], w.vgrad(2.9, 5.2, "#5a3a26", "#7a5232"), 3);
  for (let k = 0; k < 6; k++) { const y = 3.1 + k * 0.36, hw = 3.7 * (1 - (y - 2.9) / 2.3); w.line([[-hw, y], [hw, y]], 1.4, "rgba(20,12,8,0.45)"); }
  w.rect(-0.55, 0.25, 1.1, 2.1, "#4a2e1c", 2.5); w.ell(0.35, 1.3, 0.06, 0.06, "#c9a24a", 0);
  for (const x of [-2.2, 2.2]) { w.rect(x - 0.5, 1.2, 1.0, 0.9, "#2a1e16", 2.5); w.rect(x - 1.0, 1.2, 0.46, 0.9, "#6a7a4a", 2); w.rect(x + 0.54, 1.2, 0.46, 0.9, "#6a7a4a", 2); }
  w.rect(2.3, 4.2, 0.5, 1.0, "#6a5a4e", 2.5);
});
/** humble hut with straw roof (rancho) */
add("rancho", 6, 4.4, 100, (w) => {
  planks(w, -2.4, 2.4, 0.15, 2.2, "#8a6a4a", 0.22);
  w.poly([[-3.0, 2.1], [3.0, 2.1], [1.2, 3.9], [-1.2, 3.9]], w.vgrad(2.1, 3.9, "#a88a4a", "#d8bc7a"), 3);
  const r = rng(4); for (let i = 0; i < 70; i++) { const x = -2.9 + r() * 5.8; w.line([[x, 2.1], [x * 0.45, 3.85]], 1, "rgba(90,60,20,0.35)"); }
  w.rect(-0.45, 0.15, 0.9, 1.7, "#3a2418", 2.5);
});
/** wooden chapel with bell gable and cross */
add("capela", 7, 9, 80, (w) => {
  planks(w, -2.6, 2.6, 0, 4.2, "#e8dcc0", 0.32);
  w.poly([[-3.0, 4.1], [3.0, 4.1], [0, 6.4]], "#6a3e2a", 3);
  w.rect(-0.7, 6.0, 1.4, 1.4, "#e8dcc0", 2.5); w.poly([[-0.9, 7.4], [0.9, 7.4], [0, 8.1]], "#6a3e2a", 2.5); w.ell(0, 6.7, 0.28, 0.3, "#c9a24a", 2);
  w.rect(-0.06, 8.1, 0.12, 0.8, "#3a2a1e", 0); w.rect(-0.3, 8.5, 0.6, 0.1, "#3a2a1e", 0);
  w.rect(-0.75, 0, 1.5, 2.6, "#5a3624", 2.5); w.ell(0, 2.6, 0.75, 0.5, "#5a3624", 2.5, 0, Math.PI);
  for (const x of [-1.8, 1.8]) w.rect(x - 0.3, 1.8, 0.6, 1.2, "#4a6a8a", 2);
});
/** big rustic wooden cross */
add("cruz", 2.4, 4.2, 160, (w) => { w.rect(-0.12, 0, 0.24, 4.0, w.vgrad(0, 4, "#4a3020", "#7a5232"), 2.5); w.rect(-1.0, 2.8, 2.0, 0.24, "#6a4a2e", 2.5); w.line([[-0.05, 0.2], [-0.05, 3.8]], 1, "rgba(255,230,200,0.2)"); });
/** sawmill shed of the lumber company: long gable roof, chimney, sign */
add("serraria", 26, 12, 40, (w) => {
  planks(w, -12, 12, 0, 6.5, "#7a5a3e", 0.5);
  w.poly([[-12.8, 6.3], [12.8, 6.3], [11, 9.0], [-11, 9.0]], w.vgrad(6.3, 9, "#3a3a3e", "#5a5a60"), 3);
  for (let x = -11; x < 11; x += 0.6) w.line([[x, 6.4], [x * 0.86, 8.95]], 1, "rgba(0,0,0,0.25)");
  w.rect(7.5, 8, 1.4, 3.6, "#5a4a44", 3); w.rect(7.3, 11.4, 1.8, 0.4, "#3a302c", 2);
  for (const x of [-9, -4, 1, 6]) w.rect(x - 1.4, 0, 2.8, 3.8, "#2a1e16", 2.5);
  w.rect(-7.5, 4.4, 15, 1.4, "#e8dcc0", 2.5); w.text("SOUTHERN BRAZIL LUMBER", 0, 5.1, 0.95, "#3a2418");
});
/** pile of cut logs (end grain visible) */
add("toras", 6, 2.6, 110, (w) => { const r = rng(7); for (let row = 0; row < 3; row++) for (let i = 0; i < 6 - row; i++) { const x = -2.5 + row * 0.42 + i * 0.86, y = 0.42 + row * 0.74, rr = 0.4 + r() * 0.06;
  w.ell(x, y, rr, rr, "#b8875a", 2.5); w.ell(x, y, rr * 0.62, rr * 0.62, null, 1.2); w.ell(x, y, rr * 0.3, rr * 0.3, null, 1); w.ell(x, y, 0.05, 0.05, "#6a4428", 0); } });
/** felled araucaria trunk lying on the ground */
add("tronco", 12, 1.4, 70, (w) => { w.poly([[-5.8, 0], [5.4, 0.1], [5.8, 0.6], [5.4, 1.1], [-5.8, 1.2]], w.vgrad(0, 1.2, "#3e2a1c", "#7a5232"), 3); for (let x = -5; x < 5; x += 0.7) w.line([[x, 0.1], [x + 0.3, 1.1]], 1.2, "rgba(20,10,6,0.4)"); w.ell(5.6, 0.6, 0.22, 0.52, "#c8986a", 2); });
/** stump */
add("toco", 1.6, 1.0, 200, (w) => { w.poly([[-0.6, 0], [0.6, 0], [0.5, 0.7], [-0.5, 0.75]], "#5a3e28", 2.5); w.ell(0, 0.72, 0.5, 0.12, "#c8986a", 2); w.ell(0, 0.72, 0.25, 0.06, null, 1); });
/** railway flatcar loaded with logs */
add("vagaoToras", 13, 4.2, 60, (w) => { w.rect(-6, 0.95, 12, 0.5, "#2a2422", 3); for (const x of [-4.2, -3.0, 3.0, 4.2]) { w.ell(x, 0.55, 0.52, 0.52, "#1e1c1c", 2.5); w.ell(x, 0.55, 0.2, 0.2, "#6a6460", 0); }
  for (const x of [-5.6, 5.6]) w.rect(x - 0.1, 1.4, 0.2, 2.4, "#3a2a1e", 2);
  for (let row = 0; row < 3; row++) for (let i = 0; i < 4 - row; i++) w.rect(-5.5, 1.45 + row * 0.7 + 0.0 * i, 11, 0.7, w.vgrad(0, 1, i % 2 ? "#6a4630" : "#7a5236", "#8a6040"), 2.5);
  for (let row = 0; row < 3; row++) w.ell(5.5, 1.8 + row * 0.7, 0.32, 0.34, "#c8986a", 2); });
/** palisade of pointed logs (reduto) */
add("palicada", 14, 3.4, 70, (w) => { const r = rng(11); for (let x = -6.8; x < 6.8; x += 0.42) { const h = 2.4 + r() * 0.6; w.poly([[x - 0.2, 0], [x + 0.2, 0], [x + 0.2, h], [x, h + 0.35], [x - 0.2, h]], w.vgrad(0, h, "#4a3220", "#8a6440"), 2); }
  w.line([[-6.8, 1.9], [6.8, 1.9]], 4, "#3a2a1c"); w.line([[-6.8, 0.8], [6.8, 0.8]], 4, "#3a2a1c"); });
/** horse, side view (head to +x) */
add("cavalo", 3.4, 2.7, 160, (w) => { const c = "#7a4a2a", d = shade(c, 0.78), mane = "#2a1a12";
  const leg = (x: number, back: boolean, col: string) => w.poly(back ? [[x - 0.12, 1.15], [x + 0.1, 1.15], [x + 0.06, 0.62], [x + 0.1, 0.12], [x + 0.16, 0], [x - 0.04, 0], [x - 0.02, 0.6]] : [[x - 0.1, 1.1], [x + 0.1, 1.1], [x + 0.07, 0.55], [x + 0.08, 0.12], [x + 0.14, 0], [x - 0.05, 0], [x - 0.06, 0.55]], col, 2);
  leg(-0.85, true, d); leg(0.72, false, d);
  w.line([[-1.2, 1.55], [-1.45, 1.2], [-1.5, 0.75]], 9, mane);
  w.poly([[-1.25, 1.2], [-1.15, 1.62], [-0.6, 1.72], [0.4, 1.7], [0.95, 1.6], [1.15, 1.3], [0.9, 1.0], [0.2, 0.92], [-0.7, 0.95], [-1.15, 1.02]], w.vgrad(0.9, 1.75, d, c), 2.5);
  w.poly([[0.75, 1.55], [1.05, 2.15], [1.25, 2.35], [1.45, 2.3], [1.85, 1.8], [1.78, 1.68], [1.55, 1.78], [1.35, 1.75], [1.15, 1.3]], c, 2.5);
  w.poly([[0.8, 1.62], [1.05, 2.2], [1.2, 2.38], [1.12, 2.1], [0.95, 1.6]], mane, 1.2); w.poly([[1.25, 2.33], [1.3, 2.5], [1.38, 2.32]], c, 1.5);
  leg(-0.6, true, c); leg(0.95, false, c);
  w.ell(1.42, 2.08, 0.045, 0.045, INK, 0); w.ell(1.78, 1.76, 0.03, 0.02, INK, 0);
  w.poly([[-0.45, 1.68], [0.35, 1.68], [0.3, 1.82], [-0.4, 1.82]], "#4a2a1a", 2); w.rect(-0.12, 1.0, 0.05, 0.7, "#2a1a12", 0); w.ell(-0.1, 0.95, 0.08, 0.05, "#8a8682", 1); });
/** cast-iron field cooking pot with herbs (the monk's remedies) */
add("panela", 1.0, 0.9, 260, (w) => { w.ell(0, 0.35, 0.38, 0.3, "#2a2624", 2.5); w.rect(-0.4, 0.5, 0.8, 0.08, "#3a3634", 2); for (let k = 0; k < 6; k++) w.line([[-0.2 + k * 0.08, 0.55], [-0.25 + k * 0.1, 0.8]], 2, "#4f7a32"); });
/** wooden table */
add("mesa", 3.2, 1.2, 160, (w) => { w.rect(-1.5, 0.78, 3.0, 0.12, "#6a4428", 2.5); for (const x of [-1.35, 1.35]) w.rect(x - 0.06, 0, 0.12, 0.78, "#5a3820", 2); });
/** land deed */
add("escritura", 1.4, 1.2, 300, (w) => { w.rect(-0.62, 0, 1.24, 1.1, "#efe4c6", 2.5); w.text("ESCRITURA", 0, 0.92, 0.12, "#3a2418"); for (let k = 0; k < 7; k++) w.line([[-0.5, 0.75 - k * 0.08], [k % 3 === 2 ? 0.1 : 0.5, 0.75 - k * 0.08]], 1.2, "#8a8274"); w.ell(0.38, 0.14, 0.12, 0.12, "#a8281e", 1.5); });
/** railway concession contract */
add("contrato", 1.4, 1.2, 300, (w) => { w.rect(-0.62, 0, 1.24, 1.1, "#f2ead2", 2.5); w.text("CONCESSÃO", 0, 0.94, 0.12, "#2a2018"); w.text("BRAZIL RAILWAY CO.", 0, 0.8, 0.07, "#5a2a1e"); for (let k = 0; k < 7; k++) w.line([[-0.5, 0.68 - k * 0.075], [k % 3 === 2 ? 0.1 : 0.5, 0.68 - k * 0.075]], 1.2, "#8a8274"); w.ell(-0.38, 0.14, 0.12, 0.12, "#1e3a6a", 1.5); });
/** wanted / eviction notice nailed to a post */
add("aviso", 1.3, 2.4, 220, (w) => { w.rect(-0.06, 0, 0.12, 2.3, "#5a3a24", 2); w.rect(-0.5, 1.2, 1.0, 1.0, "#e8dcb8", 2.5); w.text("DESPEJO", 0, 2.0, 0.15, "#8a1e16"); for (let k = 0; k < 5; k++) w.line([[-0.38, 1.82 - k * 0.11], [0.38, 1.82 - k * 0.11]], 1.2, "#6a6254"); });
/** sacks of grain / food */
add("sacos", 2.4, 1.2, 180, (w) => { for (const [x, y] of [[-0.6, 0], [0.5, 0], [0, 0.55]] as [number, number][]) { w.ell(x, y + 0.32, 0.5, 0.34, "#c8b088", 2.5); w.line([[x - 0.1, y + 0.6], [x + 0.1, y + 0.66]], 2, "#6a5a3a"); } });

// Contestado flag: white with a green cross
FLAGS.cont = (w, W, H) => { w.rect(0, 0, W, H, "#f4f1e8", 0); w.rect(W * 0.42, H * 0.12, W * 0.14, H * 0.76, "#2e7a3e", 0); w.rect(W * 0.2, H * 0.52, W * 0.58, H * 0.14, "#2e7a3e", 0); };

// ---------------- outfits ----------------
const CAB_J = ["#8a6a4a", "#6a5a4a", "#9a8060", "#5a4a3a", "#7a6a52", "#a08868", "#6e5844", "#4e4a42"];
const CAB_S = ["#d8ccb0", "#c8b898", "#e0d4bc", "#b8a888", "#cfc0a0"];
/** caboclo / sertanejo of the plateau: shirt, wide-brim hat or straw hat, poor and patched */
export const cab = (i: number, p = 0): Outfit => {
  const k = (i * 5 + p * 3) % 8;
  if ((i + p) % 4 === 2) return { jacket: CAB_S[(i + p) % 5], pants: CAB_J[k], boots: "#3a2a1e", hat: (i + p) % 3 ? "lenco" : "headscarf", cap: ["#8a3a2a", "#4a5a7a", "#7a6a3a", "#5a2a3a"][(i + p) % 4], hair: ["#3a2418", "#5a3a22", "#2a1d16"][i % 3], dress: ["#7a4a3a", "#5a5a6a", "#8a6a4a", "#4a5a4a"][(i + p) % 4], skin: (i % 3 === 1 ? "#d8a07a" : i % 3 === 2 ? "#b8805a" : undefined) };
  return { jacket: (i + p) % 2 ? CAB_S[(i * 3 + p) % 5] : CAB_J[k], pants: CAB_J[(k + 3) % 8], boots: (i + p) % 3 === 0 ? "#c8a888" : "#3a2a1e", hat: (i + p) % 3 === 1 ? "palha" : "aba", cap: (i + p) % 3 === 1 ? undefined : ["#4a3626", "#3a2e26", "#5a4a36", "#2a2420"][(i + p) % 4],
    hair: ["#2a1d16", "#3a2418", "#1a1410"][i % 3], moustache: (i + p) % 3 === 0 ? "#2a1d16" : undefined, beard: (i + p) % 7 === 3 ? "#3a2a1e" : undefined, scarf: (i + p) % 4 === 1 ? "#8a2a22" : undefined, skin: (i % 3 === 1 ? "#d8a07a" : i % 3 === 2 ? "#b8805a" : undefined) };
};
/** caboclo woman */
export const mulher = (i: number, p = 0): Outfit => ({ jacket: CAB_S[(i + p) % 5], pants: CAB_J[(i + p) % 8], boots: "#3a2a1e", hat: i % 2 ? "headscarf" : "longhair", cap: ["#8a3a2a", "#4a5a7a", "#7a6a3a"][(i + p) % 3], hair: ["#2a1d16", "#3a2418"][i % 2], dress: ["#7a4a3a", "#5a5a6a", "#8a6a4a", "#4a5a4a", "#6a3a4a"][(i + p) % 5], skin: i % 2 ? "#d8a07a" : undefined });
export const crianca = (i: number, p = 0): Outfit => ({ jacket: CAB_S[(i + p) % 5], pants: CAB_J[(i * 3 + p) % 8], boots: "#c8a888", hat: i % 2 ? "longhair" : "hair", hair: ["#3a2418", "#2a1d16", "#5a3a22"][i % 3], dress: i % 2 ? ["#7a4a3a", "#5a6a8a", "#8a6a4a"][(i + p) % 3] : undefined, build: "kid", skin: i % 3 === 1 ? "#d8a07a" : undefined });
/** armed sertanejo (rifle) */
export const cabArm = (i: number, p = 0): Outfit => ({ ...cab(i, p), dress: undefined, hat: (i + p) % 2 ? "aba" : "palha", rifle: true, sash: "#5a3a24", band: (i + p) % 3 === 0 ? "#f4f1e8" : undefined });
/** José Maria, the monk: long hair, dark beard, pale tunic */
export const MONGE: Outfit = { jacket: "#e6dcc6", pants: "#cfc4aa", boots: "#4a3626", hat: "monge", hair: "#2a1d16", beard: "#2a1d16", moustache: "#2a1d16", cross: true, sash: "#6a4a2e" };
/** Teodora, the girl seer */
export const TEODORA: Outfit = { jacket: "#f2ece0", pants: "#e8dcc0", boots: "#c8a888", hat: "longhair", hair: "#3a2418", dress: "#f2ece0", build: "kid", cross: true };
/** Adeodato Ramos, last leader */
export const ADEODATO: Outfit = { jacket: "#5a4a3a", pants: "#3a3028", boots: "#2a1e16", hat: "aba", cap: "#2a2018", hair: "#1a1410", beard: "#1a1410", moustache: "#1a1410", rifle: true, sash: "#3a2418", scarf: "#a8281e" };
/** Brazilian army soldier, 1912–1916 (khaki uniform, kepi) */
export const SOLDADO: Outfit = { jacket: "#7a7254", pants: "#6a6448", boots: "#2a1e16", hat: "kepi", cap: "#5e5a40", rifle: true, sash: "#4a3a24", buttons: "#c9a24a" };
export const sold = (i: number): Outfit => ({ ...SOLDADO, jacket: mix(SOLDADO.jacket, i % 2 ? "#000000" : "#ffffff", 0.04 * (i % 4)), moustache: i % 3 === 0 ? "#2a1d16" : undefined, skin: i % 4 === 1 ? "#d8a07a" : i % 4 === 3 ? "#a8704a" : undefined });
/** Paraná state troops (darker blue-grey), and their commander João Gualberto */
export const POLICIA: Outfit = { jacket: "#3e4a5e", pants: "#2e3646", boots: "#1a1614", hat: "kepi", cap: "#2e3646", rifle: true, sash: "#2a2018", buttons: "#c9a24a" };
export const pol = (i: number): Outfit => ({ ...POLICIA, jacket: mix(POLICIA.jacket, i % 2 ? "#000000" : "#ffffff", 0.05 * (i % 3)), moustache: i % 3 === 1 ? "#2a1d16" : undefined });
export const GUALBERTO: Outfit = { jacket: "#2e3a50", pants: "#262e3e", boots: "#141210", hat: "peaked", cap: "#2a3448", moustache: "#2a1d16", sword: true, buttons: "#c9a24a", medals: true };
/** General Setembrino de Carvalho */
export const SETEMBRINO: Outfit = { jacket: "#6a6648", pants: "#5a5640", boots: "#1e1a16", hat: "peaked", cap: "#5a5640", moustache: "#d8d0c4", hair: "#c8c0b4", medals: true, buttons: "#c9a24a", sword: true, build: "stout" };
export const OFICIAL: Outfit = { jacket: "#6e6a4c", pants: "#5a5640", boots: "#1e1a16", hat: "peaked", cap: "#5a5640", moustache: "#2a1d16", buttons: "#c9a24a", sword: true };
/** Percival Farquhar & company men (top hat, frock coat) */
export const FARQUHAR: Outfit = { jacket: "#26242c", pants: "#3a3842", boots: "#141414", hat: "tophat", hair: "#8a7a6a", moustache: "#8a7a6a", tie: "#7a1e1a" };
export const EXEC: Outfit = { jacket: "#3a3a44", pants: "#3a3a44", boots: "#141414", hat: "bowler", moustache: "#2a1d16", tie: "#2a3a6a" };
/** politicians (suits, moustaches) */
export const POLIT = (i: number): Outfit => ({ jacket: ["#2a2a30", "#3a3430", "#2e3440"][i % 3], pants: "#2a2a2e", boots: "#141414", hat: i % 2 ? "homburg" : "hair", hair: ["#5a5a5a", "#2a1d16", "#8a8682"][i % 3], moustache: ["#4a4a4a", "#2a1d16", "#c8c0b6"][i % 3], tie: "#5a2a24" });
/** vaqueano (hired gunman of the ranchers): poncho-coloured shirt, wide brim, rifle */
export const VAQ = (i: number): Outfit => ({ jacket: ["#5a2a22", "#3a3a3a", "#4a3a2a"][i % 3], pants: "#2a2420", boots: "#1a1410", hat: "aba", cap: "#1e1612", moustache: "#1a1410", scarf: "#d8c8a0", rifle: true, sash: "#2a1a12" });
/** railway labourer */
export const OPER = (i: number): Outfit => ({ ...cab(i, 7), jacket: ["#7a8a9a", "#8a7a5a", "#6a6a5a", "#9a8a6a"][i % 4], hat: i % 2 ? "cap" : "palha", cap: "#4a4a44", dress: undefined });
export { v };

// ---------------- araucaria forest (Paraná pine: straight trunk, candelabra crown) ----------------
const araucaria = (w: WP, x: number, h: number, col: string, seed: number, y = 0) => {
  const r = rng(seed * 17 + 3), tw = h * 0.025;
  w.poly([[x - tw, y], [x + tw, y], [x + tw * 0.6, y + h * 0.86], [x - tw * 0.6, y + h * 0.86]], w.vgrad(y, y + h, "#3a2618", "#6a4a30"), 2);
  const n = 7 + Math.floor(r() * 3), top = y + h * 0.88;
  for (let i = 0; i < n; i++) { const k = (i / (n - 1)) * 2 - 1, len = h * (0.16 + 0.12 * (1 - Math.abs(k) ** 1.5)) * (0.85 + r() * 0.3), by = top - h * 0.12 * (1 - Math.abs(k)) - r() * h * 0.04, ex = x + k * len, ey = top + h * 0.05 * (1 - Math.abs(k)) + r() * h * 0.03;
    w.line([[x, by], [x + k * len * 0.5, by + h * 0.02], [ex, ey]], Math.max(1.2, h * 0.08), "#3a2a1c");
    w.ell(ex, ey + h * 0.02, h * 0.075, h * 0.035, mix(col, "#000000", 0.12), 2); w.ell(ex - k * h * 0.03, ey + h * 0.035, h * 0.06, h * 0.03, col, 0); w.ell(ex - k * h * 0.02, ey + h * 0.045, h * 0.035, h * 0.014, "rgba(255,255,220,0.16)", 0); }
  w.ell(x, top + h * 0.06, h * 0.06, h * 0.03, col, 2);
};
export const arauc = (K: string, z: number, col: string, n: number, seed: number, o: { blur?: number; h?: number; wid?: number; y?: number; under?: string } = {}): Layer => {
  const X = (o.wid ?? 1.5) * z + 8, H = o.h ?? 22;
  return Lr(K + "ar" + z, z, -X, X, -1, H * 1.25 + (o.y ?? 0), Math.max(4, Math.min(30, 500 / z)), (w) => { const r = rng(seed);
    if (o.under) { const pts: number[][] = [[-X, -1]]; for (let i = 0; i <= 60; i++) pts.push([-X + (2 * X * i) / 60, H * (0.18 + 0.08 * Math.sin(i * 1.3 + seed)) + (o.y ?? 0)]); pts.push([X, -1]); w.poly(pts, o.under, 2); }
    for (let i = 0; i < n; i++) araucaria(w, -X + ((i + r() * 0.9) / n) * 2 * X, H * (0.7 + r() * 0.45), col, i + seed, o.y ?? 0); }, o.blur);
};
/** a single araucaria as a layer (foreground framing) */
export const arauc1 = (K: string, x: number, z: number, h: number, col = "#2e5a32", blur = 0): Layer => Lr(K + "a1" + x + z, z, x - h * 0.4, x + h * 0.4, -0.5, h * 1.1, Math.max(8, Math.min(60, 900 / z)), (w) => araucaria(w, x, h, col, Math.round(x * 7 + z), 0), blur);
/** rolling plateau hills with grass */
export const campos = (K: string, z: number, col: string, seed: number, h = 8, blur = 1) => Lr(K + "cp" + z, z, -z * 2.2, z * 2.2, -5, h * 1.4, Math.max(2, 400 / z), (w) => hills(w, -z * 2.2, z * 2.2, h, col, seed, 2), blur);
export const serra = (K: string, z: number, col: string, seed: number, h = 50, blur = 2) => Lr(K + "se" + z, z, -z * 2.4, z * 2.4, -5, h * 1.3, Math.max(1.2, 300 / z), (w) => mountains(w, -z * 2.4, z * 2.4, 0, h, col, seed, false), blur);
/** fence of split rails */
export const cerca = (K: string, z: number, wid = 20, col = "#6a4a2e") => Lr(K + "ce" + z, z, -wid, wid, -0.3, 1.5, Math.max(30, 900 / z), (w) => { for (let x = -wid; x < wid; x += 2.2) w.rect(x - 0.06, 0, 0.12, 1.3, col, 2); for (const y of [0.5, 1.0]) w.line([[-wid, y], [wid, y + 0.05]], 3, shade(col, 0.85)); });
/** planted field rows (corn) */
export const milho = (K: string, z: number, wid = 30, seed = 3) => Lr(K + "mi" + z, z, -wid, wid, -0.3, 2.4, Math.max(20, 700 / z), (w) => { const r = rng(seed); w.rect(-wid, -0.3, 2 * wid, 0.5, "#5a4a2a", 0);
  for (let x = -wid; x < wid; x += 0.35) { const h = 1.4 + r() * 0.6, l = (r() - 0.5) * 0.12; w.line([[x, 0], [x + l, h]], 2.2, "#5a7a2a"); for (let k = 0; k < 3; k++) { const y = h * (0.3 + k * 0.22), s = k % 2 ? 1 : -1; w.line([[x + l * y / h, y], [x + s * 0.32, y + 0.18]], 1.6, "#6a8a32"); } w.ell(x + l, h + 0.05, 0.05, 0.12, "#d8c06a", 1); } });

// ---------------- railway on the ground (perspective ties + rails) ----------------
/** track running along x at depth z (side view), from x0 to x1 */
export const railsX = (A: Sc, z: number, x0: number, x1: number, z0 = 0.0) => A.fx(z + 0.9, (g, c) => {
  const zz = [z - 0.72 + z0, z + 0.72 + z0];
  for (let x = x0; x < x1; x += 0.65) { const [ax, ay] = P(c, x, 0, zz[0] - 0.25), [bx, by] = P(c, x + 0.1, 0, zz[1] + 0.25), [cx2, cy2] = P(c, x + 0.25, 0, zz[1] + 0.25), [dx, dy] = P(c, x + 0.15, 0, zz[0] - 0.25);
    g.fillStyle = "#4a3424"; g.beginPath(); g.moveTo(ax, ay); g.lineTo(bx, by); g.lineTo(cx2, cy2); g.lineTo(dx, dy); g.closePath(); g.fill(); }
  for (const zr of zz) { const [ax, ay, s] = P(c, x0, 0.1, zr), [bx, by] = P(c, x1, 0.1, zr); g.strokeStyle = "#3a3a3c"; g.lineWidth = Math.max(1.5, 0.08 * s); g.beginPath(); g.moveTo(ax, ay); g.lineTo(bx, by); g.stroke(); g.strokeStyle = "rgba(230,230,235,0.6)"; g.lineWidth = Math.max(0.8, 0.025 * s); g.beginPath(); g.moveTo(ax, ay - 0.03 * s); g.lineTo(bx, by - 0.03 * s); g.stroke(); }
});
/** track running into the distance (+z) at x */
export const railsZ = (A: Sc, x: number, z0: number, z1: number, built = 1) => A.fx(z1, (g, c) => {
  const zend = z0 + (z1 - z0) * clamp(built);
  for (let z = z0; z < zend; z += 0.7) { if (z - c.z < 0.5) continue; const [ax, ay] = P(c, x - 1.25, 0, z), [bx] = P(c, x + 1.25, 0, z), [, cy] = P(c, x, 0, z + 0.22); g.fillStyle = "#4a3424"; g.fillRect(ax, cy, bx - ax, Math.max(1, ay - cy)); }
  for (const dx of [-0.72, 0.72]) { const za = Math.max(z0, c.z + 0.6), [ax, ay, s] = P(c, x + dx, 0.1, za), [bx, by] = P(c, x + dx, 0.1, zend); g.strokeStyle = "#3a3a3c"; g.lineWidth = Math.max(1.5, 0.08 * s); g.beginPath(); g.moveTo(ax, ay); g.lineTo(bx, by); g.stroke(); g.strokeStyle = "rgba(230,230,235,0.55)"; g.lineWidth = Math.max(0.8, 0.025 * s); g.beginPath(); g.moveTo(ax, ay - 2); g.lineTo(bx, by - 1); g.stroke(); }
});
/** steam locomotive (+ optional wagons) moving along x at depth z; smoke trails from the stack, wheels turn */
export const train = (A: Sc, x: number, z: number, o: { dir?: 1 | -1; vel?: number; t?: number; wagons?: string[]; sc?: number; smoke?: boolean } = {}) => {
  const dir = o.dir ?? 1, sc = o.sc ?? 1, t = o.t ?? A.t, vel = o.vel ?? 0, bob = vel ? 0.015 * Math.sin(t * 14) : 0;
  const cars = o.wagons ?? [];
  A.sp("loco", x, bob, z, { flip: dir < 0, sc });
  cars.forEach((k, i) => A.sp(k, x - dir * (15 + i * 13.6) * sc, bob * 0.5, z, { flip: dir < 0, sc }));
  if (o.smoke !== false) A.fx(z - 0.1, (g, c) => { for (let i = 0; i < 18; i++) { const a = ((t * 0.9 + i / 18) % 1), [sx, sy, s] = P(c, x + dir * 3.9 * sc - dir * vel * a * 1.6 - a * 1.5, 5.8 * sc + a * 6, z + a * 2);
    const gr = g.createRadialGradient(sx, sy, 0, sx, sy, (0.5 + a * 3) * s * sc); const al = 0.75 * (1 - a) * clamp(a * 8); gr.addColorStop(0, `rgba(236,232,228,${al})`); gr.addColorStop(0.6, `rgba(190,186,184,${al * 0.7})`); gr.addColorStop(1, "rgba(160,156,154,0)"); g.fillStyle = gr; g.beginPath(); g.arc(sx, sy, (0.5 + a * 3) * s * sc, 0, 7); g.fill(); } });
  if (vel) A.fx(z - 0.05, (g, c) => { for (let k = 0; k < 5; k++) { const a = (t * 1.6 + k / 5) % 1, [sx, sy, s] = P(c, x + dir * 6 * sc + a * 0.8, 0.4, z - 0.6); g.fillStyle = `rgba(240,240,245,${0.35 * (1 - a)})`; g.beginPath(); g.arc(sx, sy, (0.2 + a * 0.6) * s, 0, 7); g.fill(); } });
};

// ---------------- maps ----------------
export type MapSt = { sea: string; land: string; ink: string; grid: string; vign: string; lab: string; other: string };
export const MST: Record<string, MapSt> = {
  parch: { sea: "#8fb0b0", land: "#ead8ac", ink: "#5a4630", grid: "rgba(255,255,255,0.16)", vign: "rgba(80,50,20,0.55)", lab: "#3a2a1c", other: "#dccaa0" },
  night: { sea: "#14243a", land: "#2e3a48", ink: "#8aaac8", grid: "rgba(120,170,220,0.12)", vign: "rgba(0,0,0,0.7)", lab: "#c8dcf0", other: "#26303c" },
  ember: { sea: "#2a1a16", land: "#5a3a2a", ink: "#e0a060", grid: "rgba(255,160,80,0.1)", vign: "rgba(0,0,0,0.65)", lab: "#ffd8a0", other: "#3e2a20" },
  olive: { sea: "#7a9a96", land: "#d6cfa4", ink: "#4a4a30", grid: "rgba(255,255,255,0.15)", vign: "rgba(40,40,20,0.5)", lab: "#2e2e1c", other: "#c4bc94" },
  sepia: { sea: "#a08a6a", land: "#e8d6b0", ink: "#4a3420", grid: "rgba(255,255,255,0.12)", vign: "rgba(60,30,10,0.6)", lab: "#3a2410", other: "#d4c098" },
};
const BRA = [-35, -5.5, -37, -4.8, -41, -2.9, -44, -2.4, -48, -1, -50, 0, -51, 4, -52, 2.4, -55, 2.2, -57, 1.9, -60, 4.5, -61, 2.5, -64, 4, -67, 2, -70, 1, -69.5, -1, -70, -4, -73, -4.5, -74, -7.5, -72.5, -9.5, -70.5, -11, -65.5, -10, -62, -13, -60, -14.5, -58, -17.5, -58, -20, -55, -24, -54.6, -25.6, -53.8, -27.1, -56, -30, -53.4, -33.7, -51, -31, -48.6, -28.4, -48.5, -26, -47, -24.5, -44.5, -23, -41, -22, -40, -20, -39, -17, -39, -13, -37.3, -10.8, -35, -8.5];
const SAM = [-35, -5.5, -35, -8.5, -39, -13, -40, -20, -44.5, -23, -48.5, -26, -51, -31, -53.4, -33.7, -58, -34.5, -62, -39, -65, -42, -66, -47, -68, -50, -69, -55, -72, -53, -74, -46, -73, -38, -71.5, -30, -70.5, -18, -76, -14, -81, -6, -80, -2, -78, 1, -77.5, 7, -72, 12, -66, 10.5, -60, 9, -57, 6, -52, 4.5, -50, 1, -48, -1, -44, -2.4, -41, -2.9, -37, -4.8];
export const BX = (lon: number) => (lon + 52) * 0.32, BY = (lat: number) => (lat + 14) * 0.32;
const PR = [-54.6, -25.5, -54.3, -24.1, -54.1, -23.9, -52.6, -22.6, -51.4, -22.6, -50.0, -22.9, -49.6, -23.5, -49.2, -24.6, -48.5, -25.0, -48.1, -25.6, -48.6, -26.0, -49.5, -26.2, -51.3, -26.6, -53.7, -26.2];
const SC = [-53.8, -26.2, -51.3, -26.6, -49.5, -26.2, -48.6, -26.0, -48.5, -26.6, -48.6, -27.5, -48.5, -28.2, -49.2, -28.6, -49.8, -29.3, -50.4, -28.6, -51.6, -27.8, -53.0, -27.25, -53.8, -27.15];
const SP = [-53.1, -22.4, -52.6, -22.6, -51.4, -22.6, -50.0, -22.9, -49.6, -23.5, -49.2, -24.6, -48.5, -25.0, -48.0, -25.2, -46.5, -24.0, -45.0, -23.4, -44.6, -22.5, -46.0, -21.5, -47.5, -20.5, -50.0, -20.0, -52.0, -20.6];
const RS = [-53.8, -27.15, -53.0, -27.25, -51.6, -27.8, -50.4, -28.6, -49.8, -29.3, -50.5, -30.5, -51.5, -31.8, -53.4, -33.7, -55.5, -31.0, -56.0, -30.1, -55.0, -28.6];
const ARG = [-54.6, -25.5, -53.7, -26.2, -53.8, -27.15, -55.0, -28.6, -56.0, -30.1, -57.8, -30.2, -58.0, -27.0, -56.0, -27.3, -55.0, -25.9];
export const CONTEST = [-53.75, -26.25, -51.3, -26.62, -50.2, -26.42, -50.05, -26.9, -50.4, -27.35, -51.6, -27.8, -53.0, -27.25, -53.8, -27.15];
export const SX = (lon: number) => (lon + 51) * 2.0, SY = (lat: number) => (lat + 26.5) * 2.0;
const pts = (a: number[], X: (n: number) => number, Y: (n: number) => number) => { const p: number[][] = []; for (let i = 0; i < a.length; i += 2) p.push([X(a[i]), Y(a[i + 1])]); return p; };
/** map of Brazil (whole country) at z = 0 */
export const mapaBR = (K: string, st: MapSt): Loc => ({ sky: undefined, ground: { near: st.sea, far: st.sea, zFar: 1 }, interior: true, layers: [Lr(K + "br", 0, -18, 18, -12, 12, 60, (w) => {
  w.rect(-18, -12, 36, 24, st.sea, 0); for (let k = -9; k <= 9; k++) w.line([[k * 2, -12], [k * 2, 12]], 1, st.grid); for (let k = -6; k <= 6; k++) w.line([[-18, k * 2], [18, k * 2]], 1, st.grid);
  w.poly(pts(SAM, BX, BY), st.other, 3, st.ink); w.poly(pts(BRA, BX, BY), st.land, 3.5, st.ink);
  w.text("BRASIL", BX(-52), BY(-10), 0.9, st.lab); w.text("OCEANO ATLÂNTICO", BX(-34), BY(-20), 0.45, st.lab);
  const g = w.g.createRadialGradient(0, 0, 6, 0, 0, 20); g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(1, st.vign); w.rect(-18, -12, 36, 24, g, 0); })] });
/** map of Paraná, Santa Catarina and the disputed region at z = 0 */
export const mapaSul = (K: string, st: MapSt, labels = true): Loc => ({ sky: undefined, ground: { near: st.sea, far: st.sea, zFar: 1 }, interior: true, layers: [Lr(K + "sul", 0, -16, 16, -10, 10, 70, (w) => {
  w.rect(-16, -10, 32, 20, st.sea, 0); for (let k = -8; k <= 8; k++) w.line([[k * 2, -10], [k * 2, 10]], 1, st.grid); for (let k = -5; k <= 5; k++) w.line([[-16, k * 2], [16, k * 2]], 1, st.grid);
  w.rect(-16, -10, SX(-48.6) + 16 - 0.2, 20, st.other, 0);
  for (const a of [SP, RS, ARG]) w.poly(pts(a, SX, SY), st.other, 2.5, st.ink);
  w.poly(pts(PR, SX, SY), mix(st.land, "#a8c08a", 0.25), 3.5, st.ink); w.poly(pts(SC, SX, SY), mix(st.land, "#d8a88a", 0.25), 3.5, st.ink);
  // rivers: Iguaçu / Negro (north border of the dispute) and Uruguai (south)
  w.line(pts([-54.5, -25.6, -53.5, -25.9, -52.0, -26.0, -51.0, -26.2, -50.0, -26.1, -49.5, -26.2], SX, SY), 2.5, "#5a8ab0");
  w.line(pts([-53.8, -27.15, -53.0, -27.3, -51.6, -27.85, -50.6, -28.1], SX, SY), 2.5, "#5a8ab0");
  if (labels) { w.text("PARANÁ", SX(-51.3), SY(-24.4), 0.85, st.lab); w.text("SANTA CATARINA", SX(-50.0), SY(-28.2), 0.62, st.lab); w.text("RIO GRANDE DO SUL", SX(-52.6), SY(-29.4), 0.45, shade(st.lab, 1.2)); w.text("SÃO PAULO", SX(-48.5), SY(-22.4), 0.45, shade(st.lab, 1.2)); w.text("ARGENTINA", SX(-56.5), SY(-27.2), 0.45, shade(st.lab, 1.2)); w.text("OCEANO", SX(-46.6), SY(-27.4), 0.5, st.lab); }
  const g = w.g.createRadialGradient(0, 0, 6, 0, 0, 18); g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(1, st.vign); w.rect(-16, -10, 32, 20, g, 0); })] });
/** highlight a polygon (south-map coordinates) with an animated hatched fill */
export const hlSul = (A: Sc, poly: number[], k: number, col = "#b3221c", a = 0.6, hatch = true) => { if (k <= 0) return; A.fx(-0.05, (g, c) => {
  const p = pts(poly, SX, SY).map(([x, y]) => P(c, x, y, 0)); g.save(); g.beginPath(); p.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath();
  g.globalAlpha = a * clamp(k); g.fillStyle = col; g.fill(); g.globalAlpha = clamp(k); g.lineWidth = 4; g.strokeStyle = col; g.setLineDash([16, 9]); g.lineDashOffset = -A.t * 30; g.stroke(); g.setLineDash([]);
  if (hatch) { g.clip(); g.globalAlpha = 0.35 * clamp(k); g.strokeStyle = "#f4ecd8"; g.lineWidth = 3; for (let x = -1000; x < 3000; x += 26) { g.beginPath(); g.moveTo(x + A.t * 12, 0); g.lineTo(x + A.t * 12 - 1080, 1080); g.stroke(); } }
  g.restore(); }); };
export const hlBR = (A: Sc, k: number, col = "#2e8a4a", a = 0.35) => { if (k <= 0) return; A.fx(-0.05, (g, c) => { const p = pts(BRA, BX, BY).map(([x, y]) => P(c, x, y, 0)); g.save(); g.beginPath(); p.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.globalAlpha = a * clamp(k); g.fillStyle = col; g.fill(); g.globalAlpha = clamp(k); g.strokeStyle = mix(col, "#ffffff", 0.3); g.lineWidth = 5; g.stroke(); g.restore(); }); };
/** pulsing marker at lon/lat on the south map (or Brazil map when br) with a label */
export const marca = (A: Sc, lon: number, lat: number, t: number, label = "", o: { br?: boolean; col?: string; kind?: "dot" | "fire" | "x"; dx?: number; dy?: number } = {}) => { if (t < 0) return; A.fx(-0.09, (g, c) => {
  const k = easeOut(clamp(t / 0.35)), [sx, sy, s] = P(c, o.br ? BX(lon) : SX(lon), o.br ? BY(lat) : SY(lat), 0), col = o.col ?? "#c42a22";
  if (o.kind === "fire") { glow(g, sx, sy - 0.2 * s, 1.4 * s * k, "rgba(255,140,40,0.9)", 0.8 + 0.2 * Math.sin(t * 9)); g.fillStyle = "#ffb03a"; g.beginPath(); g.ellipse(sx, sy - 0.25 * s * k, 0.2 * s * k, (0.36 + 0.05 * Math.sin(t * 13)) * s * k, 0, 0, 7); g.fill(); g.fillStyle = "#fff0a0"; g.beginPath(); g.ellipse(sx, sy - 0.18 * s * k, 0.09 * s * k, 0.17 * s * k, 0, 0, 7); g.fill(); }
  else if (o.kind === "x") { g.strokeStyle = col; g.lineWidth = 0.12 * s; g.lineCap = "round"; const r = 0.32 * s * k; g.beginPath(); g.moveTo(sx - r, sy - r); g.lineTo(sx + r, sy + r); g.moveTo(sx + r, sy - r); g.lineTo(sx - r, sy + r); g.stroke(); }
  else { const pr = 0.22 * s * k * (1 + 0.15 * Math.sin(t * 6)); glow(g, sx, sy, pr * 3.4, "rgba(255,120,90,1)", 0.45); g.fillStyle = col; g.strokeStyle = "#241726"; g.lineWidth = 3; g.beginPath(); g.arc(sx, sy, pr, 0, 7); g.fill(); g.stroke(); }
  if (label) { g.save(); g.globalAlpha = clamp(t / 0.5); g.font = `bold ${Math.round(0.42 * s)}px "DejaVu Sans", sans-serif`; g.textAlign = "left"; g.textBaseline = "middle"; g.lineWidth = 0.1 * s; g.strokeStyle = "rgba(20,12,10,0.85)"; g.lineJoin = "round";
    const lx = sx + (o.dx ?? 0.45) * s, ly = sy + (o.dy ?? 0) * s; g.strokeText(label, lx, ly); g.fillStyle = "#fff4e0"; g.fillText(label, lx, ly); g.restore(); }
}); };
/** animated route line on the south map (lon/lat pairs) */
export const rota = (A: Sc, a: number[], k: number, col = "#f2d24a", wid = 0.16) => { if (k <= 0) return; A.fx(-0.08, (g, c) => {
  const p = pts(a, SX, SY), n = p.length - 1, m = clamp(k) * n; g.save(); g.lineCap = "round"; g.lineJoin = "round";
  const path: number[][] = []; for (let i = 0; i <= Math.ceil(m); i++) { const j = Math.min(i, m), i0 = Math.floor(j), f = j - i0, i1 = Math.min(n, i0 + 1); path.push(P(c, p[i0][0] + (p[i1][0] - p[i0][0]) * f, p[i0][1] + (p[i1][1] - p[i0][1]) * f, 0)); }
  const s = P(c, 0, 0, 0)[2]; g.strokeStyle = "rgba(10,6,6,0.4)"; g.lineWidth = wid * s + 6; g.beginPath(); path.forEach(([x, y], i) => (i ? g.lineTo(x, y + 4) : g.moveTo(x, y + 4))); g.stroke();
  g.strokeStyle = col; g.lineWidth = wid * s; g.setLineDash([wid * s * 1.6, wid * s * 0.9]); g.beginPath(); path.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); g.setLineDash([]);
  const [hx, hy] = path[path.length - 1]; if (k < 1) glow(g, hx, hy, wid * s * 5, "rgba(255,230,160,1)", 0.6); g.restore(); }); };

// ---------------- small fx helpers ----------------
/** spectral glow figure (the enchanted army / the monk's return): translucent, haloed */
export const halo = (A: Sc, x: number, y: number, z: number, r: number, a: number, col = "255,236,190") => A.fx(z - 0.05, (g, c) => { const [sx, sy, s] = P(c, x, y, z); glow(g, sx, sy, r * s, `rgba(${col},1)`, a); });
/** god rays through forest canopy from a screen point */
export const lantern = (A: Sc, x: number, y: number, z: number, t: number, a = 1) => A.fx(z - 0.02, (g, c) => { const [sx, sy, s] = P(c, x, y, z), f = 0.85 + 0.15 * Math.sin(t * 11 + x) * Math.sin(t * 7.3); glow(g, sx, sy, 2.4 * s, "rgba(255,180,90,1)", 0.55 * f * a); glow(g, sx, sy, 0.5 * s, "rgba(255,240,200,1)", 0.9 * f * a); });
export const wobble = (t: number, id: number) => Math.sin(t * 1.3 + hash(id) * 6) * 0.5 + 0.5;
export { smooth };
export type { Cam, Ctx };
