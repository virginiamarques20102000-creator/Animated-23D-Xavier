// Cenários da crise de março de 2008 (Planalto, Miraflores, Carondelet, Casa de Nariño, Itamaraty, selva de Angostura,
// embaixada, fronteira, estúdio de TV, sala de imprensa), mapa da América do Sul, bandeiras e objetos novos.
import { WP, Layer, rng, Sprite } from "./engine";
import { Lr, SPR } from "./paint";
import { mix, shade } from "./toon";
import { FLAGS, TANKS } from "./vehicles";
import { loc, mtn, hillL, clouds, forest } from "./places";
import type { Loc } from "./places";
export type { Loc };

const add = (key: string, w: number, h: number, ppm: number, paint: (w: WP) => void) => { SPR[key] = { key, w, h, ppm, paint } as Sprite; };
const star = (w: WP, x: number, y: number, r: number, col: string, ink = 0, rot = 0) => { const p: number[][] = []; for (let i = 0; i < 10; i++) { const a = Math.PI / 2 + rot + (i * Math.PI) / 5, rr = i % 2 ? r * 0.4 : r; p.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]); } w.poly(p, col, ink); };

// ---------------- bandeiras (W = H = 1, y para cima) ----------------
FLAGS.ve = (w) => { w.rect(0, 2 / 3, 1, 1 / 3, "#f4c81e", 0); w.rect(0, 1 / 3, 1, 1 / 3, "#1e3a96", 0); w.rect(0, 0, 1, 1 / 3, "#cf1f2e", 0); for (let k = 0; k < 8; k++) { const a = Math.PI * (0.12 + (0.76 * k) / 7); w.ell(0.5 - Math.cos(a) * 0.16, 0.42 + Math.sin(a) * 0.14, 0.018, 0.028, "#ffffff", 0); } };
FLAGS.co = (w) => { w.rect(0, 0.5, 1, 0.5, "#fcd116", 0); w.rect(0, 0.25, 1, 0.25, "#1e3a96", 0); w.rect(0, 0, 1, 0.25, "#ce1126", 0); };
FLAGS.ec = (w) => { FLAGS.co(w, 1, 1); w.ell(0.5, 0.5, 0.07, 0.12, "#f2e6b0", 1); w.ell(0.5, 0.52, 0.045, 0.07, "#4a8ac0", 0); w.poly([[0.44, 0.62], [0.56, 0.62], [0.5, 0.67]], "#3a2a1a", 0); };
FLAGS.pt = (w) => { w.rect(0, 0, 1, 1, "#d8141c", 0); star(w, 0.5, 0.52, 0.3, "#ffffff", 0); w.text("PT", 0.5, 0.48, 0.17, "#d8141c", "bold"); };

// ---------------- objetos ----------------
add("mesaPres", 3.2, 1.3, 160, (w) => { // mesa de presidente vista de frente: tampo, painel, telefone, papéis e placa
  w.rect(-1.5, 0, 3, 0.74, w.vgrad(0, 0.74, "#3a2416", "#6a4428"), 2.5); w.rect(-1.6, 0.74, 3.2, 0.08, "#7a5232", 2.5);
  for (const x of [-1.2, 0.3]) w.rect(x, 0.12, 0.9, 0.5, null, 1.5); w.rect(-0.12, 0.3, 0.24, 0.05, "#c9a24a", 1);
  w.rect(0.55, 0.82, 0.55, 0.05, "#f4efe4", 1.5); w.rect(0.62, 0.87, 0.5, 0.04, "#ece4d2", 1.5);
  w.rect(-1.2, 0.82, 0.42, 0.12, "#1e1e22", 2); w.ell(-0.99, 0.98, 0.2, 0.06, "#2a2a2e", 2);
});
add("telefone", 0.5, 0.3, 400, (w) => { w.poly([[-0.2, 0], [0.2, 0], [0.16, 0.12], [-0.16, 0.12]], "#c4231c", 2.5); w.ell(0, 0.08, 0.06, 0.04, "#f0e8d8", 1.5); w.poly([[-0.22, 0.14], [0.22, 0.14], [0.2, 0.2], [-0.2, 0.2]], "#c4231c", 2.5); });
add("tribuna", 1.4, 1.7, 220, (w) => { // púlpito com microfones
  w.poly([[-0.5, 0], [0.5, 0], [0.42, 1.1], [-0.42, 1.1]], w.vgrad(0, 1.1, "#2a2a32", "#4a4a56"), 2.5); w.rect(-0.5, 1.1, 1.0, 0.08, "#5a5a66", 2.5);
  w.ell(0, 0.62, 0.17, 0.17, "#d8b84a", 1.5); w.ell(0, 0.62, 0.11, 0.11, "#1e3a8a", 0);
  for (const [x, c] of [[-0.24, "#d8241c"], [-0.08, "#2a2a2a"], [0.1, "#1e5aa0"], [0.26, "#e8e8e8"]] as [number, string][]) { w.line([[x * 0.6, 1.15], [x, 1.42]], 2.5, "#1a1a1a"); w.ell(x, 1.46, 0.045, 0.06, c, 1.5); }
});
add("rede", 3.2, 1.6, 140, (w) => { // rede de dormir entre dois paus + lona por cima
  for (const x of [-1.4, 1.4]) w.line([[x, 0], [x, 1.5]], 5, "#5a3a22");
  w.poly([[-1.4, 1.5], [0, 1.58], [1.4, 1.5], [1.6, 1.2], [-1.6, 1.2]], "#1e3a5a", 2);
  w.poly([[-1.35, 0.9], [-0.8, 0.55], [0, 0.48], [0.8, 0.55], [1.35, 0.9], [0.8, 0.68], [0, 0.62], [-0.8, 0.68]], "#3a6a3a", 2);
});
add("rede_vazia", 3.2, 1.6, 140, (w) => { for (const x of [-1.4, 1.4]) w.line([[x, 0], [x, 1.2]], 5, "#3a2a1a"); w.poly([[-1.35, 0.9], [-0.6, 0.62], [0.2, 0.55], [0.4, 0.6], [-0.2, 0.7]], "#2e4a2e", 2); w.line([[0.4, 0.6], [1.35, 0.9]], 1.5, "#2a2a2a"); });
add("lona", 4.6, 2.6, 110, (w) => { w.poly([[-2.2, 0.5], [0, 2.4], [2.2, 0.5], [1.8, 0.5], [0, 2.0], [-1.8, 0.5]], "#1d3c6e", 2.5); w.poly([[-1.8, 0.5], [0, 2.0], [1.8, 0.5]], "rgba(10,20,40,0.6)", 0); for (const x of [-2.2, 2.2]) w.line([[x, 0], [x, 0.6]], 4, "#5a3a22"); });
add("caixas", 1.6, 1, 220, (w) => { w.rect(-0.75, 0, 0.7, 0.5, "#5a5a3a", 2.5); w.rect(0.0, 0, 0.7, 0.45, "#4e5434", 2.5); w.rect(-0.45, 0.5, 0.6, 0.4, "#62603e", 2.5); w.text("•", 0.35, 0.22, 0.2, "#e8e0c8"); });
add("radio", 0.8, 0.6, 320, (w) => { w.rect(-0.3, 0, 0.6, 0.36, "#3a3e2e", 2.5); w.ell(-0.12, 0.18, 0.08, 0.08, "#1e1e1e", 1.5); for (let k = 0; k < 3; k++) w.rect(0.04 + k * 0.08, 0.1, 0.04, 0.16, "#8a8a70", 1); w.line([[0.22, 0.36], [0.32, 0.58]], 2, "#2a2a2a"); });
add("oculos", 0.5, 0.2, 500, (w) => { for (const x of [-0.11, 0.11]) w.ell(x, 0.07, 0.085, 0.06, "rgba(200,220,230,0.4)", 3); w.line([[-0.03, 0.08], [0.03, 0.08]], 3, "#1a1a1a"); });
add("camera", 1.2, 1.9, 200, (w) => { // câmera de TV no tripé
  for (const dx of [-0.4, 0, 0.4]) w.line([[0, 1.05], [dx, 0]], 3.5, "#2a2a2a"); w.rect(-0.35, 1.05, 0.62, 0.42, "#3a3a40", 2.5); w.poly([[0.27, 1.12], [0.52, 1.08], [0.52, 1.46], [0.27, 1.42]], "#2a2a30", 2.5); w.ell(0.52, 1.27, 0.06, 0.14, "#5a7a9a", 1.5); w.rect(-0.2, 1.47, 0.3, 0.12, "#1e1e22", 2);
});
add("refletor", 1, 2.4, 180, (w) => { w.line([[0, 0], [0, 1.9]], 3.5, "#2a2a2a"); for (const dx of [-0.35, 0.35]) w.line([[0, 0.25], [dx, 0]], 3, "#2a2a2a"); w.poly([[-0.3, 1.8], [0.3, 1.8], [0.38, 2.3], [-0.38, 2.3]], "#2e2e34", 2.5); w.ell(0, 2.05, 0.24, 0.2, "#fff6d0", 1.5); });
add("caminhao", 7.6, 3.4, 90, (w) => { // caminhão militar (rodas animadas à parte)
  w.rect(-3.4, 0.7, 5.0, 0.35, "#2a2c22", 2.5); w.poly([[-3.5, 1.05], [1.6, 1.05], [1.6, 3.0], [-3.5, 3.0]], w.vgrad(1.05, 3.0, "#3e4a2c", "#5e6a42"), 3);
  for (let x = -3.1; x < 1.4; x += 0.75) w.line([[x, 1.1], [x, 2.95]], 1.5, "rgba(20,24,12,0.45)"); w.poly([[1.6, 0.75], [3.5, 0.75], [3.6, 1.6], [3.0, 2.5], [1.6, 2.5]], "#56623c", 3);
  w.poly([[2.0, 1.75], [2.9, 1.75], [3.15, 2.35], [2.0, 2.35]], "#9ab8c8", 2); w.ell(3.5, 1.2, 0.1, 0.1, "#fff0b0", 1.5); w.rect(-1.6, 1.8, 0.9, 0.5, "#f4c81e", 0); w.rect(-1.6, 1.8, 0.9, 0.17, "#cf1f2e", 0); w.rect(-1.6, 1.97, 0.9, 0.16, "#1e3a96", 0);
});
add("helicoptero", 13, 4, 60, (w) => { // UH-60 visto de lado, rotor animado à parte
  w.poly([[-1.5, 0.9], [3.6, 0.8], [4.6, 1.3], [4.7, 2.0], [3.8, 2.7], [-0.8, 2.75], [-1.6, 2.3]], w.vgrad(0.8, 2.8, "#2e3a2a", "#4e5a42"), 3);
  w.poly([[-1.6, 2.3], [-6.4, 2.25], [-6.6, 2.7], [-1.0, 2.75]], "#44503a", 3); w.poly([[-6.3, 2.5], [-6.9, 3.6], [-6.4, 3.6], [-5.8, 2.6]], "#44503a", 2.5);
  w.poly([[3.7, 1.5], [4.55, 1.45], [4.5, 2.1], [3.8, 2.5]], "#8ab0c4", 2); w.rect(0.4, 1.3, 1.4, 1.0, "#1e221a", 2); w.line([[-1.0, 0.45], [3.4, 0.45]], 4, "#1a1a1a"); for (const x of [-0.5, 2.8]) w.line([[x, 0.45], [x + 0.2, 0.9]], 3, "#1a1a1a");
  w.rect(0.6, 2.75, 1.2, 0.35, "#3a4432", 2.5); w.line([[1.2, 3.1], [1.2, 3.4]], 3, "#1a1a1a");
});
add("tucano", 11.4, 3.2, 60, (w) => { // A-29 Super Tucano de lado
  w.poly([[-4.6, 1.3], [3.6, 1.1], [4.9, 1.45], [3.7, 1.95], [-4.2, 1.75]], w.vgrad(1.1, 2.0, "#3a4a3a", "#6a7a66"), 3); w.poly([[0.4, 1.8], [2.4, 1.9], [1.6, 2.45], [0.6, 2.35]], "#8ab8d0", 2);
  w.poly([[-0.5, 1.4], [1.0, 1.4], [-1.8, 0.9], [-2.6, 0.9]], "#44543f", 2.5); w.poly([[-4.0, 1.7], [-3.4, 1.75], [-4.4, 2.9], [-4.8, 2.9]], "#44543f", 2.5); w.ell(4.9, 1.45, 0.1, 0.6, "rgba(220,224,228,0.35)", 0);
  w.rect(-1.6, 0.85, 0.9, 0.18, "#2a2a2a", 1.5);
});
add("tv", 2.4, 1.8, 160, (w) => { w.rect(-1.1, 0.25, 2.2, 1.4, "#18181c", 3); w.rect(-0.3, 0, 0.6, 0.25, "#2a2a30", 2); });
add("sofa", 3, 1.1, 160, (w) => { w.rect(-1.4, 0.1, 2.8, 0.45, "#6a2a24", 2.5); w.rect(-1.4, 0.55, 2.8, 0.45, "#7a3028", 2.5); for (const x of [-1.5, 1.2]) w.rect(x, 0.1, 0.3, 0.65, "#5a221e", 2.5); });
add("placaFront", 3.6, 2.6, 140, (w) => { // placa de fronteira
  for (const x of [-1.4, 1.4]) w.rect(x - 0.07, 0, 0.14, 1.4, "#4a4a4a", 2); w.rect(-1.7, 1.4, 3.4, 1.0, "#f2f2ea", 3); w.rect(-1.62, 1.48, 3.24, 0.84, "#1f6a3a", 0);
  w.text("REPÚBLICA DE", 0, 2.1, 0.22, "#ffffff"); w.text("COLOMBIA", 0, 1.74, 0.38, "#ffffff");
});
add("pombo", 1.2, 0.8, 300, (w) => { w.ell(0, 0.35, 0.32, 0.18, "#f6f6f2", 2); w.ell(0.3, 0.45, 0.12, 0.11, "#f6f6f2", 2); w.poly([[0.4, 0.46], [0.52, 0.43], [0.4, 0.4]], "#e8a030", 1); w.poly([[-0.1, 0.4], [-0.45, 0.75], [0.15, 0.48]], "#ecece6", 2); w.poly([[-0.25, 0.32], [-0.55, 0.28], [-0.3, 0.4]], "#ecece6", 1.5); w.line([[0.38, 0.42], [0.62, 0.3], [0.7, 0.34]], 2.5, "#3a8a3a"); });
add("documento", 1.0, 1.3, 260, (w) => { w.rect(-0.45, 0, 0.9, 1.22, "#f4ede0", 2.5); for (let i = 0; i < 9; i++) w.line([[-0.36, 0.95 - i * 0.09], [0.36 - (i % 3 === 2 ? 0.25 : 0), 0.95 - i * 0.09]], 1.5, "rgba(40,30,24,0.5)"); w.ell(0, 1.1, 0.07, 0.07, "#c9a24a", 1); });
add("mesaRedonda", 6, 1.2, 120, (w) => { w.ell(0, 0.78, 2.8, 0.28, "#5a3a24", 2.5); w.rect(-2.7, 0.62, 5.4, 0.16, "#4a2e1c", 2); w.rect(-0.2, 0, 0.4, 0.62, "#3a2418", 2); for (const x of [-1.8, -0.6, 0.7, 1.8]) w.rect(x - 0.2, 0.82, 0.4, 0.04, "#f4efe4", 1); w.ell(0, 0.9, 0.18, 0.05, "#2a6a8a", 1); });
// tanque leve moderno (AMX-30 venezuelano), no mesmo esquema dos tanques do kit (rodas e esteira animadas)
TANKS.amx = { len: 6.6, col: "#5a6040", wheels: [-2.2, -1.5, -0.8, -0.1, 0.6, 1.3, 2.0], wr: 0.32, trackTop: 0.82,
  hull: [[-3.1, 0.5], [2.8, 0.5], [3.3, 1.05], [2.6, 1.6], [-3.0, 1.6], [-3.2, 1.1]], turret: [[-1.7, 1.6], [1.0, 1.6], [1.5, 1.85], [1.0, 2.35], [-1.3, 2.45], [-1.9, 2.1]],
  gun: [2.05, 2.02, 5.0, 0.09] } as typeof TANKS[string];
{ // sprite of the new tank, painted like the others in vehicles.ts
  const T = TANKS.amx; add("tk_amx", T.len + 2.2, 3.4, 90, (w) => { w.poly(T.hull, w.vgrad(1.9, 0.4, mix(T.col, "#ffffff", 0.22), shade(T.col, 0.62)), 3); w.poly(T.turret, w.vgrad(2.5, 1.6, mix(T.col, "#ffffff", 0.25), shade(T.col, 0.7)), 3);
    w.rect(1.3, 1.96, T.gun[2] - 1.3, T.gun[3] * 2, "#3a3e2a", 2.5); w.rect(3.2, 1.9, 0.5, 0.2, "#3a3e2a", 2); w.ell(-0.4, 2.5, 0.35, 0.12, "#4a5034", 2); for (const x of [-2.6, -2.0]) w.line([[x, 1.62], [x, 1.62]], 2);
    w.rect(-2.2, 1.0, 0.8, 0.3, "#f4c81e", 0); w.rect(-2.2, 1.0, 0.8, 0.1, "#cf1f2e", 0); w.rect(-2.2, 1.1, 0.8, 0.1, "#1e3a96", 0); }); }

// ---------------- céus e luz ----------------
export const SKY = { day: ["#3e7fd2", "#bcd8f0"] as [string, string], cerrado: ["#3a86d8", "#f2e2b8"] as [string, string], gold: ["#5a6aa8", "#ffc47c"] as [string, string],
  dusk: ["#2a2a5a", "#f08a5a"] as [string, string], night: ["#070a18", "#1c2c48"] as [string, string], andes: ["#4a88cc", "#d8e6ee"] as [string, string], storm: ["#3a3e4e", "#9aa0a8"] as [string, string] };

// ---------------- Brasília ----------------
/** Palácio do Planalto: laje longa sobre as colunas de Niemeyer (finas embaixo, abrindo em leque), rampa, espelho d'água */
export const planalto = (K: string, z: number, o: { blur?: number; lit?: number; dusk?: boolean } = {}) => Lr(K + "pl" + z, z, -46, 46, -1, 16, Math.max(12, Math.min(60, 900 / z)), (w) => {
  const H = 9.5, glass = o.dusk ? w.vgrad(1.2, H, "#4a5a72", "#e8b07a") : w.vgrad(1.2, H, "#5a7a8a", "#c8dce4");
  w.rect(-40, 0, 80, 1.2, "#e8e4da", 2.5); w.rect(-34, 1.2, 68, H - 1.2, glass, 2.5);
  for (let f = 1; f < 3; f++) w.line([[-34, 1.2 + f * 2.8], [34, 1.2 + f * 2.8]], 2.5, "rgba(30,40,50,0.55)"); for (let x = -34; x <= 34; x += 1.7) w.line([[x, 1.2], [x, H]], 1.2, "rgba(30,40,50,0.45)");
  if (o.lit) { const r = rng(7); for (let x = -33; x < 33; x += 1.7) for (let f = 0; f < 3; f++) if (r() < o.lit) w.rect(x + 0.15, 1.4 + f * 2.8, 1.4, 2.4, "rgba(255,214,150,0.65)", 0); }
  w.rect(-42, H, 84, 1.1, "#f4f2ec", 3); w.rect(-42, H + 1.1, 84, 0.25, "#d8d4ca", 1.5);
  for (let x = -38; x <= 38; x += 5.4) { const c = "#fbfaf6"; w.poly([[x - 0.18, 0], [x + 0.18, 0], [x + 0.55, 2.5], [x + 1.9, H], [x - 1.9, H], [x - 0.55, 2.5]], w.vgrad(0, H, "#d6d2c8", c), 2.5); w.line([[x + 0.3, 1], [x + 1.4, H - 0.2]], 1.5, "rgba(140,140,150,0.4)"); }
  w.poly([[-46, 0], [-30, H * 0.42], [-26, H * 0.42], [-26, H * 0.36], [-30, H * 0.36], [-44, 0]], "#ece8de", 2.5); // rampa
  w.rect(-46, -1, 92, 1, "#7aa6c0", 0);
}, o.blur);
/** Esplanada ao longe: Congresso (duas torres + cúpulas) */
export const congresso = (K: string, z: number, col: string, blur = 1.5) => Lr(K + "cg" + z, z, -z * 1.4, z * 1.4, -1, 40, Math.max(2, 400 / z), (w) => {
  w.rect(-z * 1.4, 0, z * 2.8, 3, shade(col, 0.95), 2); for (const x of [-3, 3]) w.rect(x - 2.2, 3, 4.4, 30, col, 2.5); w.rect(-3, 21, 6, 2, col, 2);
  w.ell(-16, 3, 8, 4.5, col, 2.5, 0, Math.PI); w.ell(16, 7.5, 8, 4.5, col, 2.5, Math.PI, Math.PI * 2); w.rect(9, 3, 14, 0.8, col, 1.5);
  for (let i = 0; i < 6; i++) w.rect(-60 + i * 9.5, 0, 6, 12, shade(col, 0.92), 2); for (let i = 0; i < 6; i++) w.rect(28 + i * 9.5, 0, 6, 12, shade(col, 0.92), 2);
}, blur);
/** Itamaraty: arcos finos sobre o espelho d'água */
export const itamaraty = (K: string, z: number, blur?: number) => Lr(K + "it" + z, z, -40, 40, -1, 16, Math.max(12, Math.min(60, 900 / z)), (w) => {
  w.rect(-40, -1, 80, 1.4, w.vgrad(-1, 0.4, "#3a6a8a", "#7ab0c8"), 0); w.rect(-30, 0.4, 60, 12, w.vgrad(0.4, 12.4, "#3a4a52", "#8aa0a8"), 2.5);
  for (let f = 1; f < 4; f++) w.line([[-30, 0.4 + f * 3], [30, 0.4 + f * 3]], 2, "rgba(20,26,30,0.5)");
  w.rect(-33, 12.4, 66, 1.4, "#f6f4ee", 3);
  for (let x = -33; x < 33; x += 4.4) { w.poly([[x, 0.4], [x + 0.35, 0.4], [x + 0.35, 9], [x + 2.2, 12.4], [x, 12.4]], "#fbfaf4", 2); w.poly([[x + 4.4, 0.4], [x + 4.05, 0.4], [x + 4.05, 9], [x + 2.2, 12.4], [x + 4.4, 12.4]], "#f2f0e8", 2); }
  for (let x = -33; x < 33; x += 4.4) w.line([[x + 0.6, 0.2], [x + 0.6, -0.8]], 3, "rgba(255,255,255,0.35)");
}, blur);
/** gabinete presidencial: madeira clara, janela panorâmica para Brasília */
export const gabinete = (K: string, z: number, night = false) => Lr(K + "gb" + z, z, -9, 9, -0.5, 4.2, 90, (w) => {
  w.rect(-9, 0, 18, 4.2, w.vgrad(0, 4.2, "#7a5434", "#a8784c"), 2.5); for (let x = -9; x < 9; x += 0.9) w.line([[x, 0], [x, 4.2]], 1.2, "rgba(40,22,10,0.35)");
  const sky = night ? w.vgrad(1, 3.6, "#1c2c48", "#0a0e1c") : w.vgrad(1, 3.6, "#f2e2b8", "#5a9ad8"); w.rect(-6.2, 1, 9.4, 2.6, sky, 3);
  w.rect(-6.2, 1, 9.4, 0.5, night ? "#2a2a3a" : "#c8c09a", 0); for (const x of [-5.2, -3.9, -2.6]) w.rect(x, 1.5, 0.9, 0.6 + (x + 6) * 0.1, night ? "#3a4058" : "#e8e4da", 1.5);
  for (const x of [-0.6, 0.6]) w.rect(x - 0.15, 1.5, 0.3, 1.5, night ? "#4a5068" : "#f4f2ea", 1.5); w.ell(1.9, 1.5, 0.7, 0.35, night ? "#3a4058" : "#f2f0e8", 1.5, 0, Math.PI);
  if (night) for (let i = 0; i < 30; i++) { const r = rng(i + 3); w.ell(-6 + r() * 9, 1.55 + r() * 0.6, 0.03, 0.03, "#ffd890", 0); }
  for (let x = -6.2; x <= 3.2; x += 2.35) w.line([[x, 1], [x, 3.6]], 4, "#3a2a1c"); w.line([[-6.2, 2.3], [3.2, 2.3]], 2.5, "#3a2a1c");
  w.rect(4.4, 1.6, 1.4, 1.8, "#c9a24a", 2.5); w.rect(4.55, 1.75, 1.1, 1.5, "#6a7a5a", 1.5); w.ell(5.1, 2.6, 0.28, 0.32, "#d8b898", 1); w.rect(4.8, 1.75, 0.6, 0.6, "#2a2a2e", 0);
  w.rect(-9, 0, 18, 0.15, "#3a2416", 0);
});

// ---------------- Caracas, Quito, Bogotá ----------------
/** Palácio de Miraflores: fachada creme com arcadas, telhado de barro, palmeiras; o Ávila verde atrás (camada separada) */
export const miraflores = (K: string, z: number, blur?: number) => Lr(K + "mf" + z, z, -36, 36, -1, 16, Math.max(12, Math.min(60, 900 / z)), (w) => {
  const wall = "#efe2bc", trim = "#f8f2e0"; w.rect(-30, 0, 60, 10, w.vgrad(0, 10, shade(wall, 0.86), wall), 2.5); w.rect(-8, 0, 16, 12.5, wall, 2.5);
  w.poly([[-31, 10], [31, 10], [29, 12], [-29, 12]], "#b8582e", 2.5); w.poly([[-9, 12.5], [9, 12.5], [0, 14.8]], "#b8582e", 2.5); w.rect(-9, 12.2, 18, 0.4, trim, 1.5);
  for (let x = -28; x < 28; x += 3.2) { if (Math.abs(x + 1.6) < 8) continue; w.rect(x + 0.4, 0, 2.4, 3.8, "#5a4232", 2); w.ell(x + 1.6, 3.8, 1.2, 1.1, "#5a4232", 2, 0, Math.PI); w.rect(x + 0.7, 5.8, 1.8, 2.6, "#3a4a5a", 2); w.rect(x + 0.4, 5.6, 2.4, 0.25, trim, 1); w.rect(x + 0.3, 8.4, 2.6, 0.3, trim, 1); }
  w.rect(-3, 0, 6, 6.5, "#4a3020", 2.5); w.ell(0, 6.5, 3, 2.2, "#4a3020", 2.5, 0, Math.PI); w.rect(-3.6, 9.5, 7.2, 0.4, trim, 1.5); for (const x of [-6, -4.5, 4.5, 6]) w.rect(x - 0.35, 0, 0.7, 9.6, trim, 2);
  w.ell(0, 11, 0.9, 0.9, "#c9a24a", 2); w.rect(-30, 0, 60, 0.6, "#c8b48a", 1.5);
}, blur);
export const avila = (K: string, z: number) => mtn(K + "av", z, "#3e7a4a", 31, 60, false, 2.5, 2.4);
/** Palácio de Carondelet (Quito): branco, colunata dupla, balcões; o Pichincha atrás */
export const carondelet = (K: string, z: number, blur?: number) => Lr(K + "cd" + z, z, -34, 34, -1, 16, Math.max(12, Math.min(60, 900 / z)), (w) => {
  const c = "#f6f4ee"; w.rect(-28, 0, 56, 11.5, w.vgrad(0, 11.5, "#dedad0", c), 2.5); w.rect(-29, 11.5, 58, 0.8, "#e8e4da", 2.5); w.rect(-28, 5.4, 56, 0.5, "#e4e0d6", 1.5);
  for (let x = -27; x <= 27; x += 2.2) { w.rect(x - 0.25, 0.6, 0.5, 4.8, "#fbfaf6", 1.8); w.rect(x - 0.22, 5.9, 0.44, 5.4, "#fbfaf6", 1.8); }
  for (let x = -25.9; x < 26; x += 2.2) { w.rect(x + 0.2, 0.6, 1.4, 3.2, "#4a3a30", 1.5); w.rect(x + 0.25, 6.4, 1.3, 3.2, "#4a5a6a", 1.5); w.line([[x, 6.2], [x + 2, 6.2]], 1.5, "#2a2a2a"); }
  w.poly([[-6, 12.3], [6, 12.3], [0, 14.6]], c, 2.5); w.ell(0, 13.1, 0.8, 0.8, "#c9a24a", 1.5); w.rect(-28, 0, 56, 0.6, "#c8c0b0", 1.5);
}, blur);
export const pichincha = (K: string, z: number) => mtn(K + "pc", z, "#5a6a4e", 47, 80, true, 2.5, 2.4);
/** casario colonial (telhados de barro) para Quito e Bogotá */
export const colonial = (K: string, z: number, seed: number, blur = 1.2) => Lr(K + "co" + z, z, -z * 1.4, z * 1.4, -1, 14, Math.max(4, Math.min(30, 600 / z)), (w) => {
  const r = rng(seed); for (let x = -z * 1.4; x < z * 1.4;) { const wd = 5 + r() * 6, h = 5 + r() * 5, col = ["#f2ead8", "#e8d4a8", "#dcc8a0", "#f4e2c4", "#d8b890"][Math.floor(r() * 5)];
    w.rect(x, 0, wd, h, col, 2); w.poly([[x - 0.4, h], [x + wd + 0.4, h], [x + wd - 0.6, h + 1.6], [x + 0.6, h + 1.6]], "#b45a32", 2); for (let k = 0; k < Math.floor(wd / 2); k++) w.rect(x + 0.8 + k * 2, h * 0.45, 0.9, 1.4, "#4a3a30", 1.2); x += wd + r() * 0.5; }
  w.ell(z * 0.3, 14 * 0.62, 2.2, 2.6, "#e8e0cc", 2, 0, Math.PI); w.rect(z * 0.3 - 2.2, 0, 4.4, 8.7, "#ece4d0", 2); w.rect(z * 0.3 + 2.5, 0, 1.6, 12, "#ece4d0", 2); w.poly([[z * 0.3 + 2.3, 12], [z * 0.3 + 4.3, 12], [z * 0.3 + 3.3, 13.8]], "#b45a32", 2);
}, blur);
/** Casa de Nariño (Bogotá): neoclássica cinza-pedra, frontão, colunas; montanhas com Monserrate */
export const narino = (K: string, z: number, blur?: number) => Lr(K + "nr" + z, z, -34, 34, -1, 17, Math.max(12, Math.min(60, 900 / z)), (w) => {
  const c = "#d4d0c4"; w.rect(-30, 0, 60, 11, w.vgrad(0, 11, "#b0aca0", c), 2.5); w.rect(-31, 11, 62, 0.8, "#c8c4b8", 2.5);
  w.rect(-8, 0, 16, 12.6, c, 2.5); w.poly([[-9, 12.6], [9, 12.6], [0, 15.6]], "#cac6ba", 2.5); w.ell(0, 13.7, 1, 0.7, "#9a2a2a", 1.5);
  for (let x = -6.6; x <= 6.6; x += 2.2) { w.rect(x - 0.35, 1.2, 0.7, 10.2, "#ecebe4", 2); w.rect(x - 0.55, 11.1, 1.1, 0.4, "#e0ddd4", 1); }
  for (let x = -28.5; x < 28; x += 2.6) { if (Math.abs(x + 1) < 9) continue; w.rect(x + 0.6, 1.4, 1.3, 3.2, "#3a4250", 1.5); w.rect(x + 0.6, 6.4, 1.3, 3, "#3a4250", 1.5); w.poly([[x + 0.4, 9.6], [x + 2.1, 9.6], [x + 1.25, 10.3]], "#c0bcb0", 1.2); }
  w.rect(-9, 0, 18, 1.2, "#bdb9ad", 2); for (let k = 0; k < 4; k++) w.rect(-9 + k * 0.3, k * 0.3, 18 - k * 0.6, 0.3, "#c8c4b8", 1);
}, blur);
export const monserrate = (K: string, z: number) => Lr(K + "ms" + z, z, -z * 2.4, z * 2.4, -5, z * 0.42 + 8, Math.max(1.2, 300 / z), (w) => {
  const r = rng(19), pts: number[][] = [[-z * 2.4, -5]]; for (let i = 0; i <= 40; i++) { const x = -z * 2.4 + (i / 40) * z * 4.8, k = Math.abs(x - z * 0.25) / (z * 0.9); pts.push([x, z * 0.36 * Math.max(0.25, 1 - k * k) * (0.92 + 0.08 * r())]); } pts.push([z * 2.4, -5]);
  w.poly(pts, w.vgrad(0, z * 0.36, "#3e6a46", "#6a9a62"), 3); const cx = z * 0.25, top = z * 0.36 * 0.98; w.rect(cx - 2.4, top - 0.6, 4.8, 3.2, "#f4f2ea", 2); w.rect(cx - 0.8, top + 2.6, 1.6, 2.8, "#f4f2ea", 2); w.poly([[cx - 1, top + 5.4], [cx + 1, top + 5.4], [cx, top + 7.4]], "#b45a32", 2);
}, 2.2);

// ---------------- selva de Angostura (Equador, junto ao rio Putumayo) ----------------
export const selva = (K: string, z: number, dark: string, seed: number, o: { h?: number; blur?: number; wid?: number; moon?: boolean } = {}) => Lr(K + "sv" + z, z, -(o.wid ?? 1.6) * z - 8, (o.wid ?? 1.6) * z + 8, -1, (o.h ?? 18) * 1.6, Math.max(4, Math.min(40, 600 / z)), (w) => {
  const r = rng(seed), X = (o.wid ?? 1.6) * z + 8, H = o.h ?? 18;
  for (let i = 0; i < 70; i++) { const x = -X + r() * 2 * X, h = H * (0.6 + r() * 0.7), col = mix(dark, i % 3 ? "#000000" : "#2a5a3a", 0.25 + 0.2 * r());
    if (i % 4 === 0) { w.line([[x, 0], [x + 0.3, h]], 4, shade(dark, 0.6)); for (let k = 0; k < 7; k++) { const a = (k / 7) * Math.PI * 2; w.line([[x + 0.3, h], [x + 0.3 + Math.cos(a) * h * 0.22, h + Math.sin(a) * h * 0.08 - h * 0.05], [x + 0.3 + Math.cos(a) * h * 0.3, h - h * 0.1]], 5, col); } }
    else { w.line([[x, 0], [x, h * 0.7]], 3, shade(dark, 0.5)); for (let k = 0; k < 5; k++) w.ell(x + (r() - 0.5) * h * 0.4, h * (0.62 + r() * 0.32), h * (0.14 + r() * 0.1), h * (0.1 + r() * 0.06), col, 2); } }
  for (let i = 0; i < 40; i++) w.ell(-X + r() * 2 * X, r() * 2, 1.5 + r() * 2, 0.8 + r(), mix(dark, "#000000", 0.3), 1.5);
  if (o.moon) for (let i = 0; i < 26; i++) w.ell(-X + r() * 2 * X, H * (0.8 + r() * 0.5), 1.2, 0.5, "rgba(170,200,255,0.18)", 0);
}, o.blur);
export const rio = (K: string, z: number, col: string, wid = 60) => Lr(K + "rio" + z, z, -wid, wid, -1, 2, Math.max(6, 300 / z), (w) => { w.rect(-wid, -1, 2 * wid, 1.6, w.vgrad(-1, 0.6, shade(col, 0.6), col), 0); for (let i = 0; i < 40; i++) { const r = rng(i * 3); w.line([[-wid + r() * 2 * wid, r() * 0.5 - 0.6], [-wid + r() * 2 * wid + 2, r() * 0.5 - 0.6]], 2, "rgba(255,255,255,0.18)"); } });

// ---------------- lugares compostos ----------------
export const placeSky = (K: string, sky: [string, string], cl: [string, string], seed: number) => clouds(K, 260, cl, seed, 40, 110, 18, 4);
/** estúdio de TV (programa de domingo): fundo com a bandeira, painel, refletores */
export const estudio = (K: string, z: number) => Lr(K + "es" + z, z, -12, 12, -0.5, 6.5, 80, (w) => {
  w.rect(-12, 0, 24, 6.5, w.vgrad(0, 6.5, "#1a1a2a", "#2e2e4a"), 0);
  const fx = -5, fw = 10; w.rect(fx, 1.0, fw, 5, "#f4c81e", 2.5); w.rect(fx, 1.0, fw, 5 / 3, "#cf1f2e", 0); w.rect(fx, 1.0 + 5 / 3, fw, 5 / 3, "#1e3a96", 0);
  for (let k = 0; k < 8; k++) { const a = Math.PI * (0.12 + (0.76 * k) / 7); star(w, fx + fw / 2 - Math.cos(a) * 1.6, 3.0 + Math.sin(a) * 1.0, 0.18, "#ffffff"); }
  for (let x = -11; x < 12; x += 2) w.line([[x, 6.3], [x + 1, 6.3]], 6, "rgba(255,240,200,0.5)");
  for (const x of [-9, 9]) { w.rect(x - 1.5, 0, 3, 4.5, "#222236", 2); for (let k = 0; k < 5; k++) w.rect(x - 1.2, 0.4 + k * 0.8, 2.4, 0.5, k % 2 ? "#3a5ac0" : "#c03a3a", 0); }
});
/** sala de imprensa: painel com brasão e bandeiras */
export const salaImprensa = (K: string, z: number, flag: string, wall = "#2a3a5a") => Lr(K + "si" + z + flag, z, -10, 10, -0.5, 5.5, 90, (w) => {
  w.rect(-10, 0, 20, 5.5, w.vgrad(0, 5.5, shade(wall, 0.7), wall), 0); for (let x = -10; x < 10; x += 1.25) w.line([[x, 0], [x, 5.5]], 1.2, "rgba(255,255,255,0.06)");
  w.ell(0, 3.4, 0.9, 0.9, "#c9a24a", 2.5); w.ell(0, 3.4, 0.7, 0.7, shade(wall, 1.2), 1.5); star(w, 0, 3.4, 0.45, "#e8c45a");
  const f = FLAGS[flag]; for (const x of [-4.2, 3.0]) { w.line([[x + 0.6, 0], [x + 0.6, 4.6]], 4, "#c9a24a"); w.g.save(); w.g.translate(x - 0.6, 2.6); w.g.scale(1.8, 1.2); f(w, 1, 1); w.g.restore(); }
});
/** sala de reunião no Planalto: mapa da América do Sul na parede */
export const salaMapa = (K: string, z: number) => Lr(K + "sm" + z, z, -10, 10, -0.5, 5, 90, (w) => {
  w.rect(-10, 0, 20, 5, w.vgrad(0, 5, "#8a6a48", "#c8a878"), 2); for (let x = -10; x < 10; x += 0.8) w.line([[x, 0], [x, 5]], 1, "rgba(60,30,10,0.25)");
  w.rect(-3, 1.2, 6, 3.4, "#7fb0c4", 3); const sp: number[][] = []; for (let i = 0; i < SA.length; i += 2) sp.push([SX(SA[i]) * 0.085, SY(SA[i + 1]) * 0.085 + 2.7]); w.poly(sp, "#ecd9a8", 1.5);
  const bp: number[][] = []; for (let i = 0; i < BRA.length; i += 2) bp.push([SX(BRA[i]) * 0.085, SY(BRA[i + 1]) * 0.085 + 2.7]); w.poly(bp, "#9ac48a", 1);
  for (const x of [-7, 6]) { w.rect(x - 0.9, 1.4, 1.8, 2.4, "#c9a24a", 2); w.rect(x - 0.75, 1.55, 1.5, 2.1, "#5a6a7a", 1); }
});
/** rua de Bogotá com a embaixada da Venezuela */
export const embaixada = (K: string, z: number) => Lr(K + "em" + z, z, -24, 24, -1, 16, Math.max(12, Math.min(60, 900 / z)), (w) => {
  w.rect(-10, 0, 20, 12, w.vgrad(0, 12, "#a89a86", "#d8ccb4"), 2.5); w.rect(-10.5, 12, 21, 0.6, "#c8bca4", 2);
  for (let f = 0; f < 3; f++) for (let x = -8.5; x < 8.5; x += 2.4) w.rect(x, 4 + f * 2.6, 1.4, 1.8, "#3a4a5a", 1.5);
  w.rect(-2.2, 0, 4.4, 3.6, "#2a1e16", 2.5); w.rect(-2.6, 3.6, 5.2, 0.4, "#c8bca4", 1.5); w.rect(-3.4, 2.4, 1.1, 0.7, "#c9a24a", 1.2); w.text("EMBAJADA DE VENEZUELA", 0, 3.85, 0.32, "#2a1e16");
  for (const x of [-22, 13]) { w.rect(x, 0, 9, 9 + (x > 0 ? 2 : 0), "#b8a890", 2.5); for (let f = 0; f < 3; f++) for (let k = 0; k < 3; k++) w.rect(x + 1 + k * 2.8, 2 + f * 2.6, 1.3, 1.6, "#4a5a6a", 1.5); }
});

// ---------------- mapa da América do Sul ----------------
export const SX = (lon: number) => (lon + 62) * 0.8, SY = (lat: number) => (lat + 12) * 0.8;
export const SA = [-77.2, 8.6, -75.5, 10.6, -73, 11.3, -71.6, 12.4, -71.1, 11.6, -70, 12.2, -68.2, 10.6, -66, 10.6, -64.2, 10.6, -62, 10.7, -60.8, 8.5, -59.8, 8.3, -57.1, 6, -54, 5.8, -51.6, 4.2, -50, 1.8, -49.9, 0, -48.4, -1.2, -44.6, -2.5, -41.5, -2.9, -38.5, -3.7, -35.3, -5.2, -34.8, -7.5, -35.2, -9.4, -37.1, -11.1, -39, -13.6, -39.2, -17.7, -40.9, -21.9, -43, -23, -46.4, -24, -48.6, -26.3, -48.8, -28.6, -51.2, -31.4, -53.4, -33.8, -55, -34.9, -57.6, -34.4, -58.4, -35.2, -57.3, -36.5, -58.2, -38.5, -62.3, -38.9, -62.2, -40.6, -65, -41, -64.2, -42.4, -65.4, -45, -67.5, -46.4, -65.8, -47.8, -68.3, -50.1, -68.8, -52.3, -68.6, -54.9, -71, -54.1, -73.6, -52, -74.8, -50, -75.5, -46.6, -74, -43.5, -73.6, -41.5, -73.5, -37.5, -71.6, -33, -71.5, -30, -70.3, -23.5, -70.2, -18.4, -71.4, -17.7, -75.2, -15.3, -77.2, -12.1, -78.9, -8.4, -81.2, -6.1, -81.3, -4.3, -80.3, -3.4, -80, -2.2, -80.9, -1, -80, 0.9, -78.9, 1.4, -77.4, 4, -77.4, 6.6, -77.9, 7.2];
const N_VE_CO = [-71.1, 11.6, -72.3, 11.1, -72.9, 10.0, -73.3, 9.1, -72.4, 8.0, -72.4, 7.4, -70.1, 7.0, -69.4, 6.1, -67.5, 6.2, -67.8, 5.0, -67.3, 3.5, -67.8, 2.8, -67.2, 2.0];
const N_VE_BR = [-67.2, 2.0, -66.3, 0.8, -65.0, 1.1, -64.2, 1.5, -63.4, 2.2, -64.0, 2.5, -64.6, 4.1, -62.8, 4.0, -60.2, 5.2];
const N_CO_BR = [-67.2, 2.0, -69.9, 1.7, -69.4, 1.1, -70.0, 0.6, -69.5, -0.2, -70.0, -0.8, -69.9, -4.2];
const N_CO_PE = [-69.9, -4.2, -70.6, -3.8, -72.9, -2.4, -74.2, -0.9, -75.3, -0.1];
const N_CO_EC = [-75.3, -0.1, -77.1, 0.8, -78.9, 1.4];
const N_EC_PE = [-75.3, -0.1, -75.6, -1.6, -76.6, -2.6, -78.3, -3.4, -79.2, -4.9, -80.3, -3.4];
const rev = (a: number[]) => { const o: number[] = []; for (let i = a.length - 2; i >= 0; i -= 2) o.push(a[i], a[i + 1]); return o; };
export const VEN = [...N_VE_CO, ...N_VE_BR, -61.4, 5.9, -60.6, 6.9, -59.8, 8.3, -60.8, 8.5, -62, 10.7, -64.2, 10.6, -66, 10.6, -68.2, 10.6, -70, 12.2];
export const COL = [-78.9, 1.4, -77.4, 4, -77.4, 6.6, -77.9, 7.2, -77.2, 8.6, -75.5, 10.6, -73, 11.3, -71.6, 12.4, ...N_VE_CO, ...N_CO_BR, ...N_CO_PE, ...N_CO_EC.slice(2)];
export const ECU = [...N_CO_EC, -80, 0.9, -80.9, -1, -80, -2.2, -80.3, -3.4, ...rev(N_EC_PE).slice(2, -2)];
export const BRA = [-60.2, 5.2, -59.6, 4.0, -59.6, 2.0, -56.5, 1.9, -54.9, 2.4, -51.6, 4.2, -50, 1.8, -49.9, 0, -48.4, -1.2, -44.6, -2.5, -41.5, -2.9, -38.5, -3.7, -35.3, -5.2, -34.8, -7.5, -35.2, -9.4, -37.1, -11.1, -39, -13.6, -39.2, -17.7, -40.9, -21.9, -43, -23, -46.4, -24, -48.6, -26.3, -48.8, -28.6, -51.2, -31.4, -53.4, -33.8,
  -56.0, -30.9, -57.6, -30.2, -55.8, -28.2, -53.8, -27.1, -54.6, -25.6, -55.1, -24.0, -55.7, -22.4, -57.9, -22.1, -58.2, -20.1, -57.8, -19.9, -57.6, -18.0, -58.4, -17.3, -58.2, -16.3, -60.4, -15.1, -60.2, -13.6, -62.2, -13.1, -65.3, -11.5, -65.4, -9.8, -68.7, -11.1, -69.6, -10.9, -70.5, -9.5, -72.9, -9.0, -73.9, -7.3, -72.9, -5.2, -70.9, -4.4, -69.9, -4.2, ...rev(N_CO_BR).slice(2), ...N_VE_BR.slice(2)];
export const PER = [-80.3, -3.4, -81.3, -4.3, -81.2, -6.1, -78.9, -8.4, -77.2, -12.1, -75.2, -15.3, -71.4, -17.7, -70.4, -18.3, -69.5, -17.5, -69.0, -16.2, -68.9, -12.9, -69.6, -10.9, -70.5, -9.5, -72.9, -9.0, -73.9, -7.3, -72.9, -5.2, -70.9, -4.4, -69.9, -4.2, ...rev(N_CO_PE).slice(2), ...rev(N_EC_PE).slice(2)];
export const SAC: Record<string, number[]> = { VEN, COL, ECU, BRA, PER };
export const CITY: Record<string, [number, number]> = { brasilia: [-47.9, -15.8], caracas: [-66.9, 10.5], bogota: [-74.1, 4.7], quito: [-78.5, -0.2], angostura: [-76.2, 0.3] };
export type SAStyle = { sea: string; land: string; ink: string; grid: string; vign: string; lab: string; col: Record<string, string> };
export const SAST: Record<string, SAStyle> = {
  dia: { sea: "#7fb6d0", land: "#e8d8ae", ink: "#4a3a28", grid: "rgba(255,255,255,0.18)", vign: "rgba(30,40,60,0.45)", lab: "#2a1e14", col: { BRA: "#9cc98a", VEN: "#e8c87a", COL: "#e8b090", ECU: "#d8c0e0", PER: "#e0d0a0" } },
  noite: { sea: "#0e1e34", land: "#2a3646", ink: "#8aaac8", grid: "rgba(120,170,220,0.12)", vign: "rgba(0,0,0,0.7)", lab: "#b8d4f0", col: { BRA: "#2e4a3a", VEN: "#4a4234", COL: "#4a3a34", ECU: "#3e3a4e", PER: "#3a3a30" } },
  tensao: { sea: "#3a2a2e", land: "#8a7060", ink: "#1e1010", grid: "rgba(255,160,120,0.1)", vign: "rgba(20,0,0,0.7)", lab: "#ffe0c8", col: { BRA: "#5a7a4a", VEN: "#9a5a3a", COL: "#a0604a", ECU: "#8a6a7a", PER: "#7a6a5a" } },
  papel: { sea: "#a8c4c0", land: "#efdfb8", ink: "#5a4630", grid: "rgba(255,255,255,0.2)", vign: "rgba(90,60,20,0.45)", lab: "#3a2a1c", col: { BRA: "#b8d49a", VEN: "#f0d090", COL: "#f0c0a0", ECU: "#e0c8e8", PER: "#ecdcb0" } },
};
const sp = (a: number[]) => { const p: number[][] = []; for (let i = 0; i < a.length; i += 2) p.push([SX(a[i]), SY(a[i + 1])]); return p; };
export const saPts = sp;
export const sulAmerica = (K: string, st: SAStyle, labels = true): Loc => loc(undefined, { near: st.sea, far: st.sea, zFar: 1 }, [Lr(K + "sa", 0, -50, 50, -60, 45, 36, (w) => {
  w.rect(-50, -60, 100, 105, st.sea, 0); for (let k = -48; k <= 50; k += 4) w.line([[k, -60], [k, 45]], 1, st.grid); for (let k = -60; k <= 45; k += 4) w.line([[-50, k], [50, k]], 1, st.grid);
  w.poly(sp(SA), st.land, 4, st.ink); for (const k of ["BRA", "PER", "VEN", "COL", "ECU"]) w.poly(sp(SAC[k]), st.col[k], 2.5, st.ink);
  if (labels) { const lab: [string, number, number, number][] = [["BRASIL", -52, -10, 2.2], ["VENEZUELA", -66, 7.4, 1.0], ["COLÔMBIA", -73.6, 3.2, 1.0], ["EQUADOR", -78.4, -1.6, 0.62], ["PERU", -75, -9.5, 1.0], ["OCEANO PACÍFICO", -84, -20, 0.9], ["OCEANO ATLÂNTICO", -32, 0, 0.9]];
    for (const [s, lo, la, sz] of lab) w.text(s, SX(lo), SY(la), sz, st.lab); }
  const g = w.g.createRadialGradient(SX(-65), SY(0), 10, SX(-65), SY(0), 70); g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(1, st.vign); w.rect(-50, -60, 100, 105, g, 0);
})], true);

export type { Layer };
export { loc, mtn, hillL, clouds, forest };
