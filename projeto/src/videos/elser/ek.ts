// Kit próprio da história de Georg Elser: elenco, a cervejaria Bürgerbräukeller (salão, mesas, púlpito, a coluna),
// o mecanismo da bomba, relógios, oficina, fronteira, cela, mapas. Usa o motor 2.5D da WW2 (../ww2).
import { Sc, panel, v, civ, crowd, HIT_BROWN, GESTAPO, SSOFF, caption, bigText, C, mv, idle } from "../ww2/kit";
import { loc, wall, banners, city, clouds, skyline, forest, hillL, europe, ST, field, wire, MX, MY, mix, shade } from "../ww2/places";
import { P, glow, puff, VW, VH, clamp, lerp, smooth, easeOut, easeIn, hash, beam, fire, smokeCol, Ctx, Cam, WP, Layer } from "../ww2/engine";
import { Lr } from "../ww2/paint";
import type { Outfit } from "../ww2/toon";
import { INK } from "../ww2/toon";
import { din, dinT, soco } from "../dinamica";
export { din, dinT, soco };

// ---------------- elenco ----------------
export const ELSER: Outfit = { jacket: "#5e5040", pants: "#3a342e", boots: "#1e1a16", hat: "hair", hair: "#2e2018" };
export const ELSER_W: Outfit = { ...ELSER, jacket: "#6a6a5e", pants: "#4a4a42" };            // avental/roupa de oficina
export const ELSER_C: Outfit = { ...ELSER, jacket: "#3e3a36", pants: "#2e2a28", hat: "fedora", cap: "#2e2a26" }; // casaco de viagem
export const ELSER_P: Outfit = { ...ELSER, jacket: "#5a5a60", pants: "#5a5a60", boots: "#2a2a2a" };  // preso
export const HIT: Outfit = HIT_BROWN;
export const HIMMLER: Outfit = { jacket: "#2e2e30", pants: "#2e2e30", boots: "#141414", hat: "peaked", cap: "#2a2a2c", glasses: true, moustache: "#2a2420", buttons: "#bcbcbc", sash: "#1a1a1a" };
export const GOERING: Outfit = { jacket: "#8a9098", pants: "#7a8088", boots: "#141414", hat: "peaked", cap: "#8a9098", build: "stout", medals: true, buttons: "#c9a24a" };
export const HESS: Outfit = { jacket: "#7a6644", pants: "#4a3a2a", boots: "#161210", hat: "hair", hair: "#1e1612", buttons: "#c9a24a", sash: "#3a2a1c" };
export const PARTY = (i: number): Outfit => i % 3 === 0 ? v(HIT_BROWN, { hat: "hair", hair: ["#3a2a1e", "#6a4a2a", "#8a8a8a", "#2a2420"][i % 4], moustache: i % 2 ? "#3a2a1e" : undefined, mstyle: undefined, medals: false })
  : i % 3 === 1 ? v(SSOFF, { hat: i % 2 ? "peaked" : "hair", hair: "#3a2a1e" }) : v(civ(i, 44), { tie: "#5a2a24" });
export const WAITER: Outfit = { jacket: "#f0ece2", pants: "#1e1e1e", boots: "#141414", hat: "hair", hair: "#5a3a22", tie: "#1e1e1e" };
export const WAITRESS: Outfit = { jacket: "#f2eee4", pants: "#3a5a3a", boots: "#2a1e18", hat: "longhair", hair: "#b8905a", dress: "#3a5a3a" };
export const CUSTOMS: Outfit = { jacket: "#4a5a44", pants: "#3a4436", boots: "#141414", hat: "peaked", cap: "#3a4a36", buttons: "#c9a24a" };
export const GUARD: Outfit = { jacket: "#4a4e46", pants: "#3a3e38", boots: "#141414", hat: "stahlhelm", cap: "#3e443c", rifle: true };
export { GESTAPO, SSOFF, v, civ, crowd, idle };

// ---------------- lugares ----------------
/** o grande salão da cervejaria: parede do fundo com arcos, galeria, faixas vermelhas (águia abstrata), lustres */
export const hallL = (K: string, o: { dark?: number; ruin?: boolean; banner?: boolean; full?: boolean } = {}) => {
  const d = o.dark ?? 0, wcol = mix("#9a7650", "#140e10", d * 0.85);
  const L: Layer[] = [wall(K, 18, wcol, { h: 10, wid: 30, panel: mix("#4a2a18", "#0e0808", d * 0.8), arch: true, win: 7, winCol: d > 0.5 ? "#1a1c2e" : "#e8d8b0", lamps: 0 }),
    Lr(K + "gal", 16, -30, 30, 3.6, 5.2, 40, (w) => { w.rect(-30, 3.7, 60, 0.35, mix("#5a3a22", "#0e0808", d * 0.8), 2.5); w.rect(-30, 4.05, 60, 0.08, mix("#c9a24a", "#2a2010", d), 0);
      for (let x = -29.5; x < 30; x += 0.5) w.rect(x, 4.13, 0.07, 0.95, mix("#6a4a2a", "#0e0808", d * 0.8), 0); w.rect(-30, 5.05, 60, 0.12, mix("#5a3a22", "#0e0808", d * 0.8), 2); })];
  if (o.banner !== false) L.push(banners(K, 17.8, 5, 22, 9.6, 5.2));
  return loc(undefined, { near: mix("#5a3a22", "#0a0606", d * 0.8), far: mix("#6a4a2a", "#0a0606", d * 0.8), kind: "wood", zFar: 30, seed: 7 }, L, true);
};
/** fachada da cervejaria (Rosenheimer Straße), à noite ou de dia */
export const hallOutL = (K: string, night = true) => loc(night ? ["#070a18", "#2a2e4a"] : ["#5a7aa6", "#d8d0c0"], { near: night ? "#2a2a2e" : "#6a6660", far: night ? "#34343a" : "#8a8478", kind: "cobble", seed: 31 }, [
  clouds(K, 260, night ? ["#3a3e5a", "#0e1020"] : ["#f4f0e8", "#8a9ab0"], 4, 40, 110, 14, 4),
  city(K + "b", 60, { pal: night ? ["#2a2a34", "#26262e", "#30303a"] : ["#b8a88e", "#a89880", "#c8b89c"], seed: 12, lit: night ? 0.35 : 0, blur: 2, floors: [4, 5], hgt: [14, 18], roof: "hip", roofCol: night ? "#1e1a22" : "#7a4a3a" }),
  Lr(K + "fac", 14, -16, 16, -0.5, 14, 40, (w) => {
    const wc = night ? "#5a4e48" : "#c8b49a"; w.rect(-15, 0, 30, 11, w.vgrad(0, 11, shade(wc, 0.85), wc), 3); w.poly([[-15.6, 11], [15.6, 11], [13, 13.4], [-13, 13.4]], night ? "#2a2224" : "#7a3e30", 3);
    for (let i = 0; i < 9; i++) { const x = -13 + i * 3.25; for (const y of [5.6, 8.2]) w.rect(x - 0.6, y, 1.2, 1.7, night ? (hash(i * 3 + y) > 0.35 ? "#ffcf7a" : "#1e1c26") : "#5a6a7a", 2.5); }
    w.rect(-2.6, 0, 5.2, 4.2, night ? "#ffd890" : "#3a2a1e", 3); w.ell(0, 4.2, 2.6, 1.4, night ? "#ffd890" : "#3a2a1e", 3, 0, Math.PI);
    w.rect(-10, 3.4, 20, 1.3, "#1e1612", 2.5); w.text("BÜRGERBRÄUKELLER", 0, 4.05, 0.95, night ? "#ffe2a0" : "#e8d8b0"); })]);
/** rua de Munique (1938-39), com faixas ou não */
export const streetL = (K: string, o: { night?: boolean; dusk?: boolean; banner?: boolean; seed?: number; sepia?: boolean } = {}) => {
  const n = o.night, s = o.seed ?? 5;
  const sky: [string, string] = n ? ["#060914", "#20263e"] : o.dusk ? ["#3a2e5a", "#f0a070"] : o.sepia ? ["#8a7a62", "#e0cca4"] : ["#5e86b8", "#dcd6c6"];
  const pal = n ? ["#2e2c36", "#34303a", "#2a2832"] : o.sepia ? ["#a8946e", "#9a8664", "#b8a27a"] : ["#c8b090", "#b89c80", "#d4bea0", "#a89070"];
  return loc(sky, { near: n ? "#2a2a2e" : o.sepia ? "#7a6a50" : "#7a7268", far: n ? "#34343a" : o.sepia ? "#9a8a6a" : "#9a9086", kind: "cobble", seed: s + 3 }, [
    clouds(K, 260, n ? ["#2a2e4a", "#0c0e1c"] : o.dusk ? ["#ffc890", "#6a4a6a"] : ["#f4f2ec", "#8a9ab0"], s, 40, 110, 14, 4),
    skyline(K, 140, n ? "#14141e" : o.dusk ? "#4a3a4a" : "#8a8a96", "generic", s, 2),
    city(K, 28, { pal, seed: s * 7 + 1, lit: n ? 0.45 : o.dusk ? 0.25 : 0, blur: 1.2, floors: [4, 5], hgt: [13, 17], roof: "hip", roofCol: n ? "#1e1a22" : "#7a4a3a", banner: o.banner })]);
};
/** oficina de marcenaria: parede de tábuas, ferramentas penduradas, janela com luz */
export const shopL = (K: string, o: { night?: boolean; warm?: boolean } = {}) => loc(undefined, { near: "#5a4630", far: "#6a5238", kind: "wood", zFar: 12, seed: 4 }, [
  Lr(K + "sh", 6, -10, 10, -0.5, 5.5, 70, (w) => {
    const c = o.night ? "#3a2a20" : "#7a5a3c"; w.rect(-10, 0, 20, 5, w.vgrad(0, 5, shade(c, 0.75), c), 3);
    for (let x = -10; x < 10; x += 0.32) w.line([[x, 0], [x, 5]], 1.2, "rgba(0,0,0,0.18)");
    w.rect(1.4, 1.6, 2.6, 2.2, o.night ? "#1a2038" : "#f2e4b8", 3); w.line([[2.7, 1.6], [2.7, 3.8]], 3, shade(c, 0.5)); w.line([[1.4, 2.7], [4, 2.7]], 3, shade(c, 0.5));
    w.rect(-7.5, 2.0, 6.5, 0.12, shade(c, 0.6), 2); // prateleira de ferramentas
    w.line([[-7, 3.3], [-7, 2.3]], 3, "#3a2a1a"); w.rect(-7.25, 3.3, 0.5, 0.2, "#6a6a6a", 2);  // martelo
    w.poly([[-6.2, 3.4], [-5.0, 3.4], [-5.0, 2.6], [-6.2, 2.8]], "#9a9a9a", 2); w.rect(-6.4, 3.2, 0.3, 0.3, "#6a4a2a", 2); // serrote
    for (let k = 0; k < 4; k++) w.line([[-4.4 + k * 0.4, 3.4], [-4.4 + k * 0.4, 2.5]], 2.5, k % 2 ? "#6a4a2a" : "#4a4a4a"); // formões
    w.ell(-2.2, 2.9, 0.42, 0.42, null, 3); w.ell(-2.2, 2.9, 0.34, 0.34, "#8a6a42", 2); // rolo de corda
    for (let k = 0; k < 5; k++) w.rect(5.5 + k * 0.5, 0, 0.35, 3.6 + (k % 2) * 0.4, mix("#b08a5a", "#6a4a2a", k * 0.15), 2); // tábuas encostadas
  })], true);
/** fronteira em Constança à noite: cerca, barreira, guarita */
export const borderL = (K: string) => loc(["#04060e", "#141c30"], { near: "#1e2420", far: "#283028", kind: "grass", seed: 41, zFar: 200 }, [
  clouds(K, 280, ["#2a3450", "#0a0e1c"], 7, 50, 120, 10, 5), hillL(K, 140, "#121a22", 3, 18, 2.5), forest(K, 50, "pine", "#16221c", 24, 4, { blur: 1.5, h: 13 }), wire(K, 9, 26, "#1a1a1a")]);
/** sala fechada (escritório da alfândega, interrogatório): parede lisa, lâmpada pendurada */
export const roomL = (K: string, col: string, o: { win?: boolean; dark?: number; map?: boolean; tile?: boolean; frames?: number } = {}) => loc(undefined, { near: mix("#3a3430", "#000", o.dark ?? 0), far: mix("#4a4440", "#000", o.dark ?? 0), kind: "stone", zFar: 10, seed: 9 },
  [wall(K, 4.5, mix(col, "#000000", o.dark ?? 0), { h: 4, wid: 9, win: o.win ? 1 : 0, winCol: "#1a2038", panel: shade(col, 0.6), map: o.map, tile: o.tile, frames: o.frames })], true);
/** cela: parede de pedra, janelinha alta com grade */
export const cellL = (K: string, sky = "#a8b8c8") => loc(undefined, { near: "#3a3836", far: "#44403c", kind: "stone", zFar: 8, seed: 13 }, [
  Lr(K + "ce", 3.6, -7, 7, -0.5, 4.5, 90, (w) => { w.rect(-7, 0, 14, 4.2, w.vgrad(0, 4.2, "#3e3a36", "#5a5650"), 3);
    for (let y = 0.3; y < 4.2; y += 0.45) for (let x = -7 + ((y * 2.2) % 0.9); x < 7; x += 0.9) w.rect(x, y, 0.86, 0.42, null, 0.7);
    w.rect(0.6, 2.8, 1.0, 0.8, sky, 3); for (let k = 0; k < 4; k++) w.line([[0.75 + k * 0.23, 2.8], [0.75 + k * 0.23, 3.6]], 3, "#1e1e22"); })], true);
/** mapa da Europa no estilo pedido */
export const mapL = (K: string, st: keyof typeof ST = "parch") => europe(K, ST[st]);

// ---------------- adereços no mundo ----------------
const W = (A: Sc, z: number, f: (w: WP, g: Ctx) => void, o: Parameters<typeof panel>[3] = {}) => panel(A, z, f, o);
/** caneco de cerveja (vidro, espuma) em x,y (m) */
export const stein = (w: WP, x: number, y: number, s = 1, foam = 1) => {
  w.rect(x - 0.07 * s, y, 0.14 * s, 0.2 * s, "rgba(230,170,60,0.92)", 1.6); w.ell(x - 0.07 * s + 0.14 * s + 0.03 * s, y + 0.1 * s, 0.04 * s, 0.06 * s, null, 1.6);
  if (foam) w.ell(x, y + 0.2 * s, 0.085 * s, 0.035 * s * foam, "#fbf6ea", 1.2);
};
/** fileira de mesas compridas com canecos e toalha (vistas de frente), na profundidade z */
export const tables = (A: Sc, z: number, x0: number, x1: number, seed = 1, o: { cloth?: string; steins?: number; dark?: number } = {}) => W(A, z, (w) => {
  const top = 0.76, c = mix("#7a5232", "#0e0808", o.dark ?? 0);
  w.rect(x0, top - 0.06, x1 - x0, 0.08, w.vgrad(top - 0.06, top + 0.02, shade(c, 0.8), c), 2.5);
  if (o.cloth) w.rect(x0 + 0.1, top - 0.3, x1 - x0 - 0.2, 0.28, o.cloth, 2);
  for (let x = x0 + 0.3; x < x1; x += 2.4) w.rect(x, 0, 0.09, top - 0.06, shade(c, 0.6), 2);
  const n = Math.floor((x1 - x0) * (o.steins ?? 1.1));
  for (let i = 0; i < n; i++) { const x = x0 + 0.3 + hash(seed + i * 3.3) * (x1 - x0 - 0.6); stein(w, x, top + 0.02, 1 + 0.2 * hash(i + seed), 1); }
});
/** o púlpito com microfones e uma faixa na frente */
export const podium = (A: Sc, x: number, z: number, o: { mics?: boolean; dark?: number } = {}) => {
  W(A, z, (w) => { const c = mix("#5a3a24", "#0a0606", o.dark ?? 0); w.rect(-0.75, 0, 1.5, 1.35, w.vgrad(0, 1.35, shade(c, 0.7), c), 3); w.rect(-0.85, 1.3, 1.7, 0.1, shade(c, 0.6), 2.5);
    w.rect(-0.55, 0.3, 1.1, 0.75, mix("#a8241c", "#0a0606", o.dark ?? 0), 2); w.ell(0, 0.68, 0.22, 0.22, mix("#f2ece0", "#1a1010", o.dark ?? 0), 1.6); w.poly([[-0.16, 0.7], [0, 0.82], [0.16, 0.7], [0, 0.5]], "#1a1414", 0); }, { dx: x });
  if (o.mics !== false) { A.sp("mic", x - 0.35, 1.0, z - 0.05, { sc: 0.7 }); A.sp("mic", x + 0.35, 1.0, z - 0.05, { sc: 0.7 }); }
};
/** a coluna atrás do púlpito: alvenaria com revestimento de madeira embaixo; `open` 0..1 abre a portinhola do esconderijo;
 *  `bomb` mostra os explosivos e o relógio por dentro; `xray` desenha o corte translúcido; `blast` >0 = idade da explosão (some) */
export const column = (A: Sc, x: number, z: number, o: { open?: number; bomb?: boolean; xray?: number; dark?: number; lt?: number; dug?: number; h?: number } = {}) => W(A, z, (w, g) => {
  const d = o.dark ?? 0, H = o.h ?? 9, st = mix("#c8b494", "#141010", d * 0.85), wd = mix("#6a4428", "#0c0808", d * 0.8);
  w.rect(-0.75, 0, 1.5, H, w.vgrad(0, H, shade(st, 0.78), st), 3); w.rect(-0.95, H - 0.6, 1.9, 0.6, shade(st, 0.9), 3); w.rect(-0.9, 0, 1.8, 0.3, shade(st, 0.8), 2.5);
  for (let y = 2.6; y < H - 0.6; y += 0.5) w.line([[-0.75, y], [0.75, y]], 0.8, "rgba(0,0,0,0.08)");
  w.rect(-0.78, 0.3, 1.56, 2.2, w.vgrad(0.3, 2.5, shade(wd, 0.8), wd), 3); for (const yy of [0.5, 1.45]) w.rect(-0.6, yy, 1.2, 0.8, null, 1.8);
  const dug = o.dug ?? 0; if (dug > 0) { w.rect(-0.5, 0.55, 1.0, 1.6 * dug, "#1a120e", 2); for (let k = 0; k < 6 * dug; k++) w.rect(-0.45 + hash(k) * 0.8, 0.6 + hash(k + 9) * 1.4 * dug, 0.12, 0.06, "#8a7a62", 0); }
  const op = o.open ?? 0, xr = o.xray ?? 0;
  if ((op > 0 || xr > 0) && o.bomb) { // a cavidade com a bomba
    g.save(); if (xr > 0 && op <= 0) g.globalAlpha = xr;
    w.rect(-0.5, 0.55, 1.0, 1.65, "#1a120e", 2); for (let k = 0; k < 6; k++) w.rect(-0.42 + (k % 3) * 0.28, 0.62 + Math.floor(k / 3) * 0.3, 0.26, 0.26, "#c8a060", 1.6);
    w.rect(-0.42, 1.3, 0.84, 0.7, "#4a3a28", 2); const ang = (o.lt ?? 0) * 1.2;
    for (const [cx, cy, r, n] of [[-0.18, 1.62, 0.16, 12], [0.18, 1.55, 0.12, 9], [0.05, 1.84, 0.08, 7]] as number[][]) gearW(w, cx, cy, r, n, ang * (0.1 / r) * (n % 2 ? -1 : 1));
    w.line([[-0.3, 1.32], [-0.3, 1.0], [0.1, 0.9]], 1.6, "#b3221c"); w.line([[0.3, 1.32], [0.3, 1.05]], 1.6, "#2a5aa8");
    g.restore();
    if (xr > 0 && op <= 0) { g.save(); g.globalAlpha = 0.6 * xr; w.rect(-0.55, 0.5, 1.1, 1.75, null, 3); g.restore(); }
  }
  if (op > 0) { // portinhola de madeira girando na dobradiça da esquerda
    const sx = Math.cos(op * 1.4); w.rect(-0.5, 0.55, 1.0 * sx, 1.65, w.vgrad(0.55, 2.2, shade(wd, 0.9), mix(wd, "#ffffff", 0.08)), 2.5); }
}, { dx: x });
/** relógio de parede (no mundo) com ponteiros nas horas h:m */
export const wallClock = (A: Sc, x: number, y: number, z: number, h: number, m: number, r = 0.4) => W(A, z, (w) => {
  w.ell(0, 0, r * 1.12, r * 1.12, "#5a3a22", 3); w.ell(0, 0, r, r, "#f4ecd8", 2);
  for (let k = 0; k < 12; k++) { const a = (k / 12) * Math.PI * 2; w.line([[Math.sin(a) * r * 0.82, Math.cos(a) * r * 0.82], [Math.sin(a) * r * 0.95, Math.cos(a) * r * 0.95]], k % 3 ? 1.5 : 3, "#2a1d16"); }
  const am = (m / 60) * Math.PI * 2, ah = ((h % 12) / 12 + m / 720) * Math.PI * 2;
  w.line([[0, 0], [Math.sin(ah) * r * 0.5, Math.cos(ah) * r * 0.5]], 4, "#1a1410"); w.line([[0, 0], [Math.sin(am) * r * 0.78, Math.cos(am) * r * 0.78]], 2.5, "#1a1410");
}, { dx: x, dy: y });
/** bancada do carpinteiro com morsa, plaina e aparas */
export const bench = (A: Sc, x: number, z: number, o: { plank?: number; gears?: number; lt?: number } = {}) => W(A, z, (w) => {
  w.rect(-1.6, 0.82, 3.2, 0.14, w.vgrad(0.82, 0.96, "#8a6438", "#b08a58"), 2.5); for (const lx of [-1.45, 1.3]) w.rect(lx, 0, 0.14, 0.82, "#6a4a2a", 2); w.rect(-1.45, 0.25, 2.9, 0.08, "#6a4a2a", 1.6);
  w.rect(1.2, 0.96, 0.3, 0.22, "#4a4a4e", 2); // morsa
  if (o.plank) w.rect(-1.3, 0.96, 2.3, 0.08, "#d8b47a", 2);
  for (let k = 0; k < 9; k++) { const xx = -1.2 + hash(k * 7) * 2.4; w.ell(xx, 0.04, 0.08, 0.03, "#e8c890", 0.8); }
  if (o.gears) { const a = (o.lt ?? 0) * 1.5; for (const [cx, r, n] of [[-0.6, 0.13, 12], [-0.33, 0.09, 9], [-0.12, 0.065, 7]] as number[][]) gearW(w, cx, 0.98 + r, r, n, a * (0.1 / r) * (n % 2 ? -1 : 1)); }
}, { dx: x });

// ---------------- insertos e sobreposições ----------------
/** o mecanismo em close (tela cheia, no mundo a z fixo): caixa de madeira, dois relógios, engrenagens, explosivo, fios */
export const mechanism = (A: Sc, z: number, lt: number, o: { setTo?: number; tick?: boolean; explo?: number; light?: number } = {}) => W(A, z, (w, g) => {
  const L = o.light ?? 1;
  w.rect(-2.2, -1.4, 4.4, 2.8, w.vgrad(-1.4, 1.4, mix("#3a2616", "#000", 1 - L), mix("#7a5232", "#000", 1 - L)), 3);
  for (let k = 0; k < 9; k++) w.line([[-2.2, -1.4 + k * 0.32], [2.2, -1.4 + k * 0.32]], 1, "rgba(0,0,0,0.2)");
  const ex = o.explo ?? 1; for (let k = 0; k < 8 * ex; k++) w.rect(-2.0 + (k % 4) * 0.5, -1.25 + Math.floor(k / 4) * 0.42, 0.46, 0.38, mix("#c8a060", "#000", 1 - L), 1.8);
  const tk = o.tick ? Math.floor(lt) + easeOut(clamp((lt % 1) / 0.12)) : lt;
  const gear = (cx: number, cy: number, r: number, n: number, sp: number) => gearW(w, cx, cy, r, n, tk * sp, L);
  gear(0.2, 0.55, 0.42, 16, 0.35); gear(0.85, 0.2, 0.26, 10, -0.57); gear(-0.45, 0.15, 0.2, 8, -0.74); gear(1.35, 0.75, 0.18, 8, 0.82);
  // mostrador do relógio de ajuste
  const dx = -1.25, dy = 0.75, r = 0.42; w.ell(dx, dy, r * 1.1, r * 1.1, mix("#c9a24a", "#000", 1 - L), 2.5); w.ell(dx, dy, r, r, mix("#f4ecd8", "#000", 1 - L), 1.6);
  for (let k = 0; k < 12; k++) { const a = (k / 12) * Math.PI * 2; w.line([[dx + Math.sin(a) * r * 0.8, dy + Math.cos(a) * r * 0.8], [dx + Math.sin(a) * r * 0.94, dy + Math.cos(a) * r * 0.94]], k % 3 ? 1.4 : 2.6, "#2a1d16"); }
  const hand = (o.setTo ?? 0) + tk * 0.03; w.line([[dx, dy], [dx + Math.sin(hand) * r * 0.75, dy + Math.cos(hand) * r * 0.75]], 3, "#1a1410");
  w.line([[dx, dy], [dx + Math.sin(tk * 0.6) * r * 0.85, dy + Math.cos(tk * 0.6) * r * 0.85]], 1.2, "#b3221c");
  w.line([[-0.9, -0.2], [-1.5, -0.6], [-1.6, -1.0]], 3, "#b3221c"); w.line([[1.5, 0.4], [1.8, -0.3], [1.2, -0.9]], 3, "#2a5aa8");
  w.rect(-0.25, -0.6, 0.5, 0.3, mix("#5a5a60", "#000", 1 - L), 2); // detonador
  g.save(); g.globalCompositeOperation = "lighter"; for (let k = 0; k < 3; k++) { const a = tk * 0.35 + k * 2.1; const [sx, sy] = [0.2 + Math.cos(a) * 0.42, 0.55 + Math.sin(a) * 0.42]; w.ell(sx, sy, 0.05, 0.05, `rgba(255,240,200,${0.25 * L})`, 0); } g.restore();
});
/** engrenagem de latão com dentes trapezoidais, raios e cubo */
export const gearW = (w: WP, cx: number, cy: number, r: number, n: number, a: number, L = 1) => {
  const pts: [number, number][] = [], t = r * 0.16;
  for (let k = 0; k < n; k++) { const b = a + (k / n) * Math.PI * 2, d = Math.PI / n;
    for (const [an, rr] of [[b - d * 0.5, r], [b - d * 0.28, r + t], [b + d * 0.28, r + t], [b + d * 0.5, r]] as number[][]) pts.push([cx + Math.cos(an) * rr, cy + Math.sin(an) * rr]); }
  w.poly(pts, w.vgrad(cy - r, cy + r, mix("#a87e2a", "#000", 1 - L), mix("#f0cc6a", "#000", 1 - L)), 2);
  w.ell(cx, cy, r * 0.72, r * 0.72, mix("#7a5a1e", "#000", 1 - L), 1.2);
  for (let k = 0; k < 4; k++) { const b = a + k * 1.5708; w.poly([[cx + Math.cos(b - 0.18) * r * 0.2, cy + Math.sin(b - 0.18) * r * 0.2], [cx + Math.cos(b - 0.09) * r * 0.72, cy + Math.sin(b - 0.09) * r * 0.72], [cx + Math.cos(b + 0.09) * r * 0.72, cy + Math.sin(b + 0.09) * r * 0.72], [cx + Math.cos(b + 0.18) * r * 0.2, cy + Math.sin(b + 0.18) * r * 0.2]], mix("#d8b050", "#000", 1 - L), 1); }
  w.ell(cx, cy, r * 0.22, r * 0.22, mix("#e8c870", "#000", 1 - L), 1.4); w.ell(cx, cy, r * 0.07, r * 0.07, "#2a1a10", 0);
};
const FONT = `"DejaVu Serif", serif`, SANS = `"DejaVu Sans", sans-serif`;
/** relógio grande na tela (sobreposição): ponteiros em h:m (minutos fracionários), número digital embaixo */
export const clockOver = (g: Ctx, h: number, m: number, t: number, dur: number, o: { x?: number; y?: number; r?: number; digital?: boolean; red?: boolean } = {}) => {
  if (t < 0 || t > dur) return; const a = clamp(t / 0.3) * clamp((dur - t) / 0.35), x = o.x ?? VW / 2, y = o.y ?? VH * 0.46, r = (o.r ?? 230) * (0.92 + 0.08 * easeOut(clamp(t / 0.4)));
  g.save(); g.globalAlpha = a; g.translate(x, y);
  g.shadowColor = "rgba(0,0,0,0.6)"; g.shadowBlur = 40; g.fillStyle = "#3a2416"; g.beginPath(); g.arc(0, 0, r * 1.12, 0, 7); g.fill(); g.shadowBlur = 0;
  const gr = g.createRadialGradient(-r * 0.3, -r * 0.4, r * 0.1, 0, 0, r); gr.addColorStop(0, "#fffaf0"); gr.addColorStop(1, "#e2d4b4"); g.fillStyle = gr; g.beginPath(); g.arc(0, 0, r, 0, 7); g.fill();
  g.strokeStyle = "#c9a24a"; g.lineWidth = r * 0.05; g.beginPath(); g.arc(0, 0, r * 1.06, 0, 7); g.stroke();
  for (let k = 0; k < 60; k++) { const an = (k / 60) * Math.PI * 2, big = k % 5 === 0; g.strokeStyle = "#2a1d16"; g.lineWidth = big ? r * 0.03 : r * 0.01; g.beginPath(); g.moveTo(Math.sin(an) * r * (big ? 0.8 : 0.87), -Math.cos(an) * r * (big ? 0.8 : 0.87)); g.lineTo(Math.sin(an) * r * 0.93, -Math.cos(an) * r * 0.93); g.stroke(); }
  g.fillStyle = "#2a1d16"; g.font = `bold ${Math.round(r * 0.16)}px ${FONT}`; g.textAlign = "center"; g.textBaseline = "middle";
  for (let k = 1; k <= 12; k++) { const an = (k / 12) * Math.PI * 2; g.fillText(String(k), Math.sin(an) * r * 0.66, -Math.cos(an) * r * 0.66); }
  if (o.red) { const m0 = 7, a0 = (m0 / 60) * Math.PI * 2 - Math.PI / 2, a1 = (m / 60) * Math.PI * 2 - Math.PI / 2; if (a1 > a0) { g.fillStyle = "rgba(200,40,30,0.32)"; g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, r * 0.93, a0, a1); g.closePath(); g.fill(); } }
  const am = (m / 60) * Math.PI * 2, ah = ((h % 12) / 12 + m / 720) * Math.PI * 2;
  const hand = (an: number, len: number, wd: number, col: string) => { g.save(); g.rotate(an); g.fillStyle = col; g.beginPath(); g.moveTo(-wd / 2, r * 0.1); g.lineTo(-wd * 0.3, -len); g.lineTo(0, -len - wd); g.lineTo(wd * 0.3, -len); g.lineTo(wd / 2, r * 0.1); g.closePath(); g.fill(); g.restore(); };
  hand(ah, r * 0.48, r * 0.07, "#1a1410"); hand(am, r * 0.76, r * 0.045, "#1a1410"); hand(((m % 1) * 60 / 60) * Math.PI * 2, r * 0.82, r * 0.012, "#b3221c");
  g.fillStyle = "#c9a24a"; g.beginPath(); g.arc(0, 0, r * 0.05, 0, 7); g.fill();
  if (o.digital !== false) { const hh = Math.floor(h), mm = Math.floor(m); const s = `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
    g.font = `bold ${Math.round(r * 0.36)}px ${SANS}`; g.lineWidth = r * 0.04; g.strokeStyle = "rgba(10,6,6,0.9)"; g.strokeText(s, 0, r * 1.45); g.fillStyle = "#f6efe0"; g.fillText(s, 0, r * 1.45); }
  g.restore();
};
/** vinheta de "flashback" (sépia + riscos), para 1903/1923 */
export const oldFilm = (g: Ctx, t: number, a = 1) => {
  g.save(); g.globalAlpha = 0.28 * a; g.globalCompositeOperation = "color"; g.fillStyle = "#8a6a40"; g.fillRect(0, 0, VW, VH); g.restore();
  g.save(); g.globalAlpha = 0.25 * a; for (let i = 0; i < 3; i++) { const x = (hash(Math.floor(t * 12) + i * 17) * VW); g.fillStyle = "rgba(255,250,230,0.5)"; g.fillRect(x, 0, 1.5, VH); } g.restore();
};
/** retrato emoldurado (cartão de bonecos 2D) — usado para "foto" de líderes na mesa de Elser */
export const xMark = (g: Ctx, x: number, y: number, r: number, k: number, col = "#c42a22") => {
  if (k <= 0) return; const a = easeOut(clamp(k)); g.save(); g.strokeStyle = col; g.lineCap = "round"; g.lineWidth = r * 0.16; g.globalAlpha = 0.9;
  g.beginPath(); g.moveTo(x - r, y - r); g.lineTo(x - r + 2 * r * clamp(a * 2), y - r + 2 * r * clamp(a * 2)); if (a > 0.5) { const b = (a - 0.5) * 2; g.moveTo(x + r, y - r); g.lineTo(x + r - 2 * r * b, y - r + 2 * r * b); } g.stroke(); g.restore();
};
/** realce de um polígono lon/lat no mapa (Suíça não está nas bordas prontas) */
export const SUI = [6.0, 46.2, 7.0, 45.9, 8.4, 46.0, 9.0, 45.8, 10.4, 46.5, 9.6, 47.5, 8.6, 47.75, 7.6, 47.6, 6.8, 47.3, 6.0, 46.5];
export const hlPoly = (A: Sc, ll: number[], k: number, col: string, a = 0.6) => { if (k <= 0) return; A.fx(-0.05, (g, c) => {
  g.save(); g.globalAlpha = a * clamp(k); g.fillStyle = col; g.beginPath(); for (let i = 0; i < ll.length; i += 2) { const [sx, sy] = P(c, MX(ll[i]), MY(ll[i + 1]), 0); i ? g.lineTo(sx, sy) : g.moveTo(sx, sy); } g.closePath(); g.fill(); g.globalAlpha = clamp(k); g.strokeStyle = col; g.lineWidth = 3; g.stroke(); g.restore(); }); };
/** rótulo de cidade no mapa */
export const mapLabel = (A: Sc, lon: number, lat: number, txt: string, t: number, col = "#2a1a12") => { if (t < 0) return; A.fx(-0.1, (g, c) => {
  const [sx, sy] = P(c, MX(lon), MY(lat), 0); g.save(); g.globalAlpha = clamp(t / 0.3); g.font = `bold 34px ${SANS}`; g.textAlign = "left"; g.textBaseline = "middle"; g.lineWidth = 6; g.strokeStyle = "rgba(255,248,230,0.85)"; g.strokeText(txt, sx + 22, sy - 4); g.fillStyle = col; g.fillText(txt, sx + 22, sy - 4); g.restore(); }); };
/** feixe de lanterna (luz de Elser trabalhando à noite) */
export const torchBeam = (A: Sc, x: number, y: number, z: number, ang: number, len = 2.2, a = 0.3) => A.light((g) => { beam(g, A.cam, x, y, z, ang, len, 0.7, a, "255,236,190"); const [sx, sy, s] = P(A.cam, x, y, z); glow(g, sx, sy, 0.3 * s, "rgba(255,240,200,1)", 0.7); });
/** luz quente dos lustres */
export const chandeliers = (A: Sc, z: number, xs: number[], y = 6.2, a = 0.5) => { for (const x of xs) { W(A, z, (w) => { w.line([[0, 3], [0, 0.3]], 2, "#1e1612"); w.ell(0, 0, 0.6, 0.18, "#c9a24a", 2); for (const dx of [-0.45, 0, 0.45]) w.ell(dx, 0.1, 0.07, 0.1, "#fff0c0", 1); }, { dx: x, dy: y });
  A.light((g) => { const [sx, sy, s] = P(A.cam, x, y, z); if (z - A.cam.z < 0.5) return; glow(g, sx, sy, 2.2 * s, "rgba(255,200,120,1)", a); }); } };
/** destroços caindo do teto (balístico, com poeira) */
export const ceilingFall = (A: Sc, age: number, x0: number, x1: number, z0: number, z1: number, n = 40, seed = 3) => { if (age < 0) return; for (let i = 0; i < n; i++) { const t0 = hash(seed + i) * 0.6, k = age - t0; if (k < 0) continue;
  const x = x0 + hash(seed + i * 3.1) * (x1 - x0), z = z0 + hash(seed + i * 5.7) * (z1 - z0), y = Math.max(0.05, 7 - 0.5 * 9.81 * k * k), sz = 0.15 + hash(i * 1.3) * 0.5, rot = k * (3 + hash(i) * 6);
  A.fx(z, (g, c) => { const [sx, sy, s] = P(c, x, y, z); g.save(); g.translate(sx, sy); g.rotate(rot); g.fillStyle = mix("#b8a488", "#5a4a3a", hash(i * 2.2)); g.strokeStyle = "rgba(24,16,22,0.7)"; g.lineWidth = 2; g.fillRect(-sz * s / 2, -sz * s * 0.3, sz * s, sz * s * 0.6); g.strokeRect(-sz * s / 2, -sz * s * 0.3, sz * s, sz * s * 0.6); g.restore();
    if (y <= 0.06 && k < 2.5) puff(g, sx, sy, (0.4 + (k - 1) * 0.6) * s, [170, 150, 130], 0.4 * clamp(1 - (k - 1) / 1.5)); }); } };
/** poeira suspensa no ar (depois da explosão) */
export const dustAir = (A: Sc, lt: number, a = 0.3, z0 = 2, z1 = 12, n = 22, col: [number, number, number] = [180, 160, 140]) => A.fx(z0 - 0.1, (g, c) => { for (let i = 0; i < n; i++) { const z = z0 + hash(i * 4.1) * (z1 - z0), x = -10 + 20 * hash(i * 2.7) + Math.sin(lt * 0.2 + i) * 0.8, y = 0.5 + hash(i * 1.9) * 4 + lt * 0.05;
  const [sx, sy, s] = P(c, x, y, z); puff(g, sx, sy, 1.6 * s, col, a); } });
export { caption, bigText, C, mv, P, glow, puff, VW, VH, clamp, lerp, smooth, easeOut, easeIn, hash, beam, fire, smokeCol, INK, mix, shade };
