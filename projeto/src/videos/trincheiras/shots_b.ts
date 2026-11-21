// Shots 206.8 – 439.8 s: chapter 3 (weapons), chapter 4 (Verdun, Somme), chapter 5 (world war, USA, Russia).
import { VW, VH, P, glow, boom, fire, smokeCol, puff, tint, clamp, lerp, smooth, easeOut, easeIn, hash, rays, sun, muzzle, gas } from "./engine";
import { MX, MY, WX, WY } from "./paint";
import { Sc, C, mv, path, walkF, walkS, runS, marchF, marchCol, crowd, booms, mudFront, flare, tracers, spurts, muzzleAt, mgFire, flies, hl, arrow, frontLine, pin,
  chapter, calendar, counter, caption, bigText, scales, GER, GERN, BRI, BRIN, BOFF, FR, FRN, RUS, USA, OTT, SEN, IND, ANZ, CAN, BOL, KAISER, NICK, DIP, civ, mask } from "./kit";
import { waves } from "./shots_a";
import type { Shot } from "./types";

const ev = (T: number, w: number) => T - w;
const cannonLine = (A: Sc, lt: number, T: number, n: number, x0: number, z: number, fires: number[], dx = 5.5, flip = false) => {
  for (let i = 0; i < n; i++) { const x = x0 + i * dx, last = fires.filter((f, j) => j % n === i && T > f).pop(), rec = last !== undefined ? Math.exp(-(T - last) * 6) * 0.35 : 0;
    A.sp("cannon", x - (flip ? -1 : 1) * rec, 0, z, { sc: 1.3, flip }); A.a(i % 2 ? GER : GERN, 600 + i, x - 1.6, z - 0.4, { expr: "stern", crouch: 0.2 }, { dark: z > 12 ? 0.3 : 0 }); }
  fires.forEach((f, j) => { const i = j % n, x = x0 + i * dx + (flip ? -1 : 1) * 3.2; if (T > f && T < f + 0.09) A.fx(z - 0.1, (g, c) => { muzzle(g, c, x, 2.1, z, 1.3, flip ? -1 : 1); }); A.fx(z - 0.05, (g, c) => { const a = T - f; if (a > 0 && a < 2.5) { const [sx, sy, s] = P(c, x + a * 0.6, 2.1 + a * 0.5, z); puff(g, sx, sy, (0.6 + a * 0.9) * s, [200, 196, 188], 0.75 * (1 - a / 2.5)); } }); });
};
export const SHOTS_B: Shot[] = [
  // 50 CAPÍTULO 3 — ARMAS QUE TRANSFORMARAM A GUERRA
  { t0: 206.83, L: "field", v: "dusk", fade: 0.25, cam: mv([0, 1.6, -9, 46], [0, 1.9, -11, 48]), act: (A, lt, u, T) => {
    cannonLine(A, lt, T, 5, -12, 9, [207.1, 207.6, 208.1, 208.6, 209.1, 209.7, 210.2], 5.5); A.light((g) => { const [sx, sy] = P(A.cam, -30, 5, 200); sun(g, sx, sy, 34, "255,180,110"); rays(g, sx, sy, 900, 0.12, "255,180,120", 14, lt); });
    A.over((g) => chapter(g, "CAPÍTULO 3", "ARMAS QUE TRANSFORMARAM A GUERRA", lt - 0.1, 4.3));
  } },
  // 51 "A Primeira Guerra Mundial marcou uma nova era de destruição."
  { t0: 211.34, L: "nomans", v: "dusk", fade: 0.3, cam: mv([-4, 2.4, -12, 48, -60], [4, 3.0, -14, 50, -80]), act: (A, lt, u, T) => {
    for (let i = 0; i < 3; i++) A.sp("mk1", -16 + i * 12 + lt * 0.9, 0, 14 + i * 3); for (let i = 0; i < 4; i++) A.sp(i % 2 ? "biplane" : "biplaneB", -50 + i * 18 + lt * 10, 16 + i * 2, 60 + i * 8, { sc: 1.8, flip: i % 2 === 1 });
    booms(A, T, [[211.9, -18, 40, 4], [212.7, 10, 46, 5], [213.4, 22, 52, 5], [214.1, -6, 36, 4]]); A.fx(5, (g, c) => gas(g, c, lt, -14, 24, 34, 4 + lt * 1.5, 0.5));
  }, wx: ["ash", 100, 0.4] },
  // 52 "As metralhadoras podiam disparar centenas de tiros por minuto,"
  { t0: 215.35, L: "trenchIn", cam: path([[0, [0.8, 1.45, -3.0, 40]], [1, [0.5, 1.45, -3.8, 42]]]), act: (A, lt, u, T) => {
    A.sp("sandbags", 0.6, 0.85, 1.25, { sc: 0.9 }); A.sp("mg", 0.7, 1.08, 1.1, { sc: 0.55 }); A.s(GERN, 610, -0.1, 1.15, { mode: "stand", expr: "stern" }, { y: 0.15 });
    mgFire(A, lt, 1.3, 1.45, 1.1, 0.4); A.fx(1.05, (g, c) => { if (lt > 0.4) for (let i = 0; i < 8; i++) { const k = ((lt * 3 + i / 8) % 1), [sx, sy, s] = P(c, 0.9 - k * 0.6, 1.4 + k * 0.6 - k * k * 1.6, 1.05); g.fillStyle = "#d9b24a"; g.fillRect(sx, sy, 0.03 * s, 0.015 * s); } });
    A.over((g) => counter(g, Math.round(lerp(0, 600, smooth(clamp((T - 217.2) / 1.4)))), "TIROS POR MINUTO", ev(T, 217.1), 99, VH * 0.8));
  } },
  // 53 "tornando ataques de infantaria extremamente mortais."
  { t0: 219.28, L: "nomans", v: "grey", cam: mv([0, 1.2, -1.5, 42, 30], [0, 1.25, -1.0, 40, 30]), act: (A, lt, u, T) => {
    A.sp("sandbags", 0, 0, 1.3, { sc: 1.5 }); A.sp("mg", 0.3, 0.55, 1.2, { sc: 0.55 }); mgFire(A, lt, 0.68, 0.92, 1.2, 0);
    for (let i = 0; i < 12; i++) { const ft = T - (220.6 + hash(i) * 1.6), z = 18 - lt * 1.4 + (i % 3) * 2.5, fall = ft > 0 && i % 3 !== 0;
      A.a(FR, 620 + i, -10 + i * 1.8, z, { mode: fall ? "fall" : "march", phase: (lt * 0.9 + i * 0.3) % 1, expr: "shout" }, { rot: fall ? (i % 2 ? 1 : -1) * 1.35 * smooth(ft / 0.45) : 0, y: fall ? -0.25 * smooth(ft / 0.45) : undefined, dark: 0.15 }); }
    tracers(A, lt, 14, [1.0, 1.15, 1.25], [0, 1.2, 22], 0.22, 21, "255,225,150");
  } },
  // 54 "A artilharia pesada bombardeava posições inimigas durante horas,"
  { t0: 222.97, L: "field", v: "grey", fade: 0.3, cam: mv([-3, 1.4, -6, 44], [3, 1.6, -7.5, 46]), act: (A, lt, u, T) => {
    cannonLine(A, lt, T, 4, -9, 5, [223.3, 223.9, 224.3, 224.7, 225.3, 225.8, 226.3, 226.7], 5.5);
  } },
  // 55a "transformando campos,"
  { t0: 227.21, L: "field", cam: mv([0, 1.6, -8, 46], [0, 1.7, -8.6, 46]), act: (A, lt, u, T) => { booms(A, T, [[227.75, -6, 16, 4], [227.95, 8, 20, 4.5]]); } },
  // 55b "florestas"
  { t0: 228.5, L: "forest", cam: mv([0, 1.6, -8, 46], [0, 1.7, -8.6, 46]), act: (A, lt, u, T) => { booms(A, T, [[228.62, -4, 30, 5], [228.85, 9, 34, 5]]); } },
  // 55c "e cidades"
  { t0: 229.2, L: "sarajevo", v: "x", cam: mv([0, 2.2, -10, 46], [0, 2.3, -10.6, 46]), act: (A, lt, u, T) => { booms(A, T, [[229.35, -6, 22, 6], [229.6, 8, 22, 6]]); } },
  // 55d "em paisagens irreconhecíveis."
  { t0: 230.25, L: "nomans", v: "grey", fade: 0.6, cam: mv([0, 4, -16, 50, -140], [0, 5.5, -20, 52, -180]), act: (A, lt) => {
    A.fx(60, (g, c) => { for (const x of [-30, -8, 14, 34]) smokeCol(g, c, lt, x, 0, 60, { h: 26, w: 5, seed: x + 7, col: [70, 64, 60], a: 0.7 }); });
  }, wx: ["ash", 120, 0.5], mood: ["#8a8a90", 0.2] },
  // 56 "Em 1915, os alemães utilizaram gás cloro em larga escala na Frente Ocidental,"
  { t0: 232.73, L: "trenchIn", v: "grey", cam: mv([-2.6, 1.4, -3.6, 42], [0, 1.6, -5.5, 46, -40]), act: (A, lt, u, T) => {
    for (let i = 0; i < 6; i++) A.sp("cylinder", -4 + i * 1.6, 1.9, 2.0); for (let i = 0; i < 3; i++) A.a(GERN, 640 + i, -3.2 + i * 2.6, 1.3, { expr: "stern", look: 1, crouch: T > 235.6 ? 0.4 : 0 });
    A.fx(3.2, (g, c) => { if (T > 235.6) gas(g, c, T - 235.6, -6, 3, 9, (T - 235.6) * 3.5, 0.75, 4); });
    A.over((g) => caption(g, "1915 · GÁS CLORO", lt - 0.3, 4.4));
  } },
  // 57 "durante a Segunda Batalha de Ypres."
  { t0: 238.55, L: "ruins", cam: mv([0, 1.6, -9, 44], [0, 1.7, -10, 46]), act: (A, lt) => {
    A.fx(8, (g, c) => gas(g, c, lt + 6, -20, 6, 16, 18 + lt * 2.5, 0.8, 8)); A.over((g) => caption(g, "SEGUNDA BATALHA DE YPRES · BÉLGICA", lt - 0.2, 2.2));
  }, mood: ["#b8c090", 0.2] },
  // 58a "O gás se espalhava pelo campo de batalha,"
  { t0: 240.92, L: "nomans", v: "grey", cam: mv([0, 1.4, -4, 44], [0, 1.4, -5, 44]), act: (A, lt) => { A.fx(4, (g, c) => gas(g, c, lt, -14, 4, 30, 4 + lt * 3.2, 0.7, 12)); } },
  // 58b "atingindo os pulmões dos soldados e provocando sufocamento."
  { t0: 243.15, L: "trenchIn", cam: mv([0, 1.5, -2.8, 40], [0, 1.4, -2.4, 38]), act: (A, lt, u, T) => {
    const down = T > 246.0; for (let i = 0; i < 3; i++) A.a(i === 1 ? FR : FRN, 650 + i, -1.4 + i * 1.4, 1.0 + (i % 2) * 0.2, { expr: T > 244.2 ? "pained" : "shock", armB: 1, headTilt: T > 244.2 ? Math.sin(lt * 12 + i) * 6 : 0, mode: down && i !== 1 ? "sit" : "stand", crouch: down ? 0.5 : 0 }, { y: down && i !== 1 ? 0.1 : -0.1 });
    A.fx(2.6, (g, c) => gas(g, c, lt + 3, -10, 2.6, 5, 12, 0.4, 15)); A.light((g) => tint(g, "#c8d090", 0.3, "multiply"));
  } },
  // 59 "Máscaras de proteção começaram a ser utilizadas, mas nem sempre eram suficientes."
  { t0: 247.59, L: "trenchIn", fade: 0.25, cam: mv([0, 1.5, -2.5, 40], [0, 1.5, -3.2, 42]), act: (A, lt, u, T) => {
    for (let i = 0; i < 4; i++) { const on = T > 248.2 + i * 0.3, o = i % 2 ? FRN : FR; A.a(on ? mask(o) : o, 660 + i, -2.1 + i * 1.4, 1.0 + (i % 2) * 0.2, { expr: on ? "neutral" : "pained", armB: on ? 0 : 1, headTilt: i === 3 && T > 251.4 ? Math.sin(lt * 14) * 7 : 0 }); }
    A.fx(2.6, (g, c) => gas(g, c, lt + 5, -10, 2.6, 5, 14, 0.35, 18)); A.light((g) => tint(g, "#c8d090", 0.25, "multiply"));
  } },
  // 60 "Os tanques também surgiram nesse conflito."
  { t0: 253.07, L: "nomans", v: "grey", fade: 0.3, cam: mv([0, 1.3, -11, 42, 0], [0, 1.3, -9.5, 40, 0]), act: (A, lt) => {
    A.fx(9, (g, c) => { for (let i = 0; i < 6; i++) { const [sx, sy, s] = P(c, -6 + i * 2.4, 1.2, 10); puff(g, sx, sy, 2.4 * s, [120, 116, 110], 0.6 * clamp(1 - lt / 2.2)); } });
    A.sp("mk1", 0, 0, 9 - lt * 0.8, { sc: 0.85 }); A.over((g) => caption(g, "1916 · O TANQUE", lt - 0.3, 2.3));
  } },
  // 61 "Desenvolvidos para atravessar o arame farpado e superar as trincheiras,"
  { t0: 255.98, L: "nomans", v: "grey", cam: (u, lt) => C(-4 + lt * 1.1, 1.6, -11, 44), act: (A, lt, u, T) => {
    const x = -6 + lt * 1.1, crush = clamp((T - 257.6) / 0.6), tilt = T > 258.9 && T < 259.9 ? Math.sin((T - 258.9) * Math.PI) * 0.2 : 0;
    A.sp("mk1", x, 0, 3.8, { sc: 0.85, rot: -tilt }); A.fx(3.6, (g, c) => { const [sx, sy, s] = P(c, -1.5, 0, 3.6); g.strokeStyle = "#1e1a18"; g.lineWidth = 2; for (let k = 0; k < 3; k++) { g.beginPath(); for (let i = 0; i < 20; i++) { const xx = -4 + i * 0.4, yy = 0.35 + k * 0.32 - (Math.abs(xx - (x - 1.5)) < 2.5 ? crush * (0.35 + k * 0.3) : 0) + Math.sin(i * 3) * 0.03; const [px, py] = P(c, xx - 1.5, yy, 3.6); i ? g.lineTo(px, py) : g.moveTo(px, py); } g.stroke(); } });
  } },
  // 62 "eles eram lentos, barulhentos e frequentemente quebravam."
  { t0: 260.19, L: "nomans", v: "grey", cam: (u, lt) => C(-1 + lt * 0.25, 1.5, -10, 44), act: (A, lt, u, T) => {
    const broke = T > 263.1, x = -1.5 + Math.min(lt, 2.9) * 0.25; A.sp("mk1", x, 0, 3.6, { sc: 0.85, rot: broke ? 0 : Math.sin(lt * 20) * 0.006 });
    walkS(A, BRI, 670, lt, -4, 2.2, 0.9, { expr: "neutral" }); if (broke) { A.fx(3.4, (g, c) => smokeCol(g, c, T - 263.1, x - 1.5, 2.6, 3.4, { h: 6, w: 1, col: [40, 38, 38], seed: 2, rate: 0.3 })); A.a(BRIN, 671, x + 1.8, 3.0, { expr: "shock", armB: 1 }, { y: clamp((T - 263.4) / 0.3) * 1.6 }); }
    A.over((g) => { if (T > 261.2 && T < 262.3) for (let i = 0; i < 4; i++) { const [sx, sy] = P(A.cam, x - 3.5, 2.5, 3.6); g.save(); g.strokeStyle = "#f7eedc"; g.lineWidth = 6; g.beginPath(); g.arc(sx, sy, 40 + i * 26 + ((lt * 120) % 26), Math.PI * 0.8, Math.PI * 1.2); g.stroke(); g.restore(); } });
  } },
  // 63 "Mesmo assim, representavam uma nova forma de combater."
  { t0: 264.21, L: "nomans", v: "dusk", fade: 0.35, cam: mv([0, 0.9, -7, 44, 30], [0, 1.1, -5.5, 42, 30]), act: (A, lt) => {
    for (let i = 0; i < 4; i++) A.sp("mk1", -12 + i * 8, 0, 12 + (i % 2) * 3 - lt * 0.5, { sc: 0.85 }); marchCol(A, BRI, lt, 8, -8, 5, 0.6, 2.2);
    A.light((g) => { const [sx, sy] = P(A.cam, 0, 4, 200); sun(g, sx, sy, 38, "255,180,110"); rays(g, sx, sy, 1100, 0.16, "255,180,120", 16, lt); });
  } },
  // 64 "Nos céus, aviões inicialmente usados para reconhecimento"
  { t0: 268.13, L: "sky", cam: mv([0, 180, -10, 46, -40], [4, 182, -12, 46, -40]), act: (A, lt) => {
    A.sp("biplaneB", -2 + lt * 2.2, 179, 8, { sc: 1.1 }); A.fx(7.9, (g, c) => { const [sx, sy, s] = P(c, -2 + lt * 2.2 - 0.3, 179.8, 7.9); g.fillStyle = "#1e1a18"; g.fillRect(sx - 0.12 * s, sy, 0.24 * s, 0.18 * s); g.fillStyle = "#8ab4d0"; g.beginPath(); g.arc(sx + 0.1 * s, sy + 0.08 * s, 0.05 * s, 0, 7); g.fill(); });
  } },
  // 65a "passaram a enfrentar outros pilotos"
  { t0: 271.43, L: "sky", cam: mv([0, 200, -14, 48], [0, 201, -12, 46]), act: (A, lt, u, T) => {
    const a1 = lt * 1.4, a2 = lt * 1.4 + 2.4; A.sp("biplane", Math.cos(a1) * 6, 200 + Math.sin(a1 * 2) * 1.5, 12 + Math.sin(a1) * 4, { sc: 1, flip: Math.sin(a1) > 0, rot: Math.cos(a1 * 2) * 0.2 });
    A.sp("biplaneB", Math.cos(a2) * 6, 200 + Math.sin(a2 * 2) * 1.5, 12 + Math.sin(a2) * 4, { sc: 1, flip: Math.sin(a2) > 0, rot: Math.cos(a2 * 2) * 0.2 });
    tracers(A, lt, 5, [Math.cos(a2) * 6, 200, 12 + Math.sin(a2) * 4], [Math.cos(a1) * 6, 200.3, 12 + Math.sin(a1) * 4], 0.3, 31);
    if (T > 273.0) A.fx(12 + Math.sin(a1) * 4 - 0.1, (g, c) => smokeCol(g, c, T - 273, Math.cos(a1) * 6, 200, 12 + Math.sin(a1) * 4, { h: 5, w: 0.8, rate: 0.4, seed: 5 }));
  } },
  // 65b "e atacar posições terrestres."
  { t0: 273.6, L: "nomans", v: "grey", cam: mv([0, 1.4, -6, 44], [0, 1.6, -7, 46]), act: (A, lt, u, T) => {
    A.sp("biplane", 14 - lt * 9, 9 - lt * 2.2, 22, { flip: true, rot: 0.2, sc: 1.3 }); A.fx(16, (g, c) => boom(g, c, T - 274.4, 0, 0, 16, 4, 3)); A.fx(20, (g, c) => boom(g, c, T - 274.8, -6, 0, 20, 4, 6));
    for (let i = 0; i < 3; i++) A.a(GER, 680 + i, -3 + i * 2.6, 3.6, { expr: T > 274.3 ? "shock" : "stern", look: 1, crouch: T > 274.4 ? 0.6 : 0 }, { y: -0.6 });
  } },
  // 66 "A guerra estava mudando."
  { t0: 276.06, L: "nomans", v: "dusk", fade: 0.3, cam: mv([0, 2.8, -12, 48, -60], [0, 3.4, -15, 50, -90]), act: (A, lt) => {
    for (let i = 0; i < 3; i++) A.sp("mk1", -12 + i * 12 + lt, 0, 14 + i * 3); for (let i = 0; i < 4; i++) A.sp(i % 2 ? "biplane" : "biplaneB", -40 + i * 18 + lt * 9, 18 + i * 3, 70 + i * 6, { sc: 1.6 });
    A.fx(20, (g, c) => gas(g, c, lt, -30, 20, 30, 8 + lt * 2, 0.45)); A.light((g) => { const [sx, sy] = P(A.cam, 0, 5, 200); sun(g, sx, sy, 34, "255,170,100"); });
  } },
  // 67 "E a tecnologia, que prometia progresso para a humanidade,"
  { t0: 278.22, L: "sarajevo", fade: 0.4, cam: mv([-2, 1.5, -7, 44], [2, 1.6, -7, 44]), act: (A, lt) => {
    A.sp("car1914", -6 + lt * 2.4, 0, 3.6, { sc: 1.2 }); crowd(A, 12, -8, 8, 2, 6, 121, (i) => ({ expr: "smile", wave: i % 3 ? undefined : Math.sin(lt * 3 + i) }));
    A.sp("biplaneB", -20 + lt * 6, 14, 40, { sc: 1.5 }); A.light((g) => { const [sx, sy] = P(A.cam, -10, 30, 200); sun(g, sx, sy, 30); rays(g, sx, sy, 900, 0.14, "255,240,200", 14, lt); });
  }, sat: 1.3 },
  // 68 "estava sendo usada para tornar a morte cada vez mais eficiente."
  { t0: 281.62, L: "factory", v: "inside", fade: 0.25, cam: (u, lt) => C(-5 + lt * 1.6, 1.4, -4.4, 42), act: (A, lt) => {
    for (let r = 0; r < 3; r++) for (let i = 0; i < 18; i++) A.sp("shell", -12 + i * 1.4 + ((lt * 1.6) % 1.4), 0.9 * r * 0, 2.2 + r * 1.4);
    for (let i = 0; i < 5; i++) A.a(civ(i), 690 + i, -8 + i * 4.6, 4.4, { expr: "neutral" }, { dark: 0.3 }); A.light((g) => tint(g, "#7a1a14", 0.28, "multiply"));
  } },
  // 69 CAPÍTULO 4 — BATALHAS ONDE MILHARES MORRIAM
  { t0: 286.68, L: "nomans", v: "night", fade: 0.5, cam: mv([0, 2, -10, 46], [0, 2.4, -12, 48]), act: (A, lt) => {
    flare(A, lt, 0.2, -8, 40); flare(A, lt, 1.3, 9, 46, "255,200,170"); A.over((g) => chapter(g, "CAPÍTULO 4", "BATALHAS ONDE MILHARES MORRIAM", lt - 0.1, 4.3));
  } },
  // 70 "Algumas batalhas se tornaram símbolos da brutalidade desse conflito."
  { t0: 291.18, L: "nomans", v: "dusk", fade: 0.3, cam: mv([-3, 2.0, -9, 46, -30], [3, 2.4, -11, 48, -50]), act: (A, lt, u, T) => {
    booms(A, T, [[291.6, -12, 30, 4], [292.3, 6, 24, 4.5], [292.9, 16, 36, 5], [293.5, -2, 40, 5], [294.1, 10, 28, 4]]);
    for (let r = 0; r < 2; r++) for (let i = 0; i < 7; i++) runS(A, r ? FR : GER, 700 + i + r * 10, lt, (r ? 14 : -14) + i * (r ? 1.6 : -1.6), 8 + r * 2, r ? -2.2 : 2.2, { expr: "shout" }, { dark: 0.55 });
  }, wx: ["ash", 120, 0.5] },
  // 71a "Em 1916, os alemães lançaram uma enorme ofensiva"
  { t0: 295.73, L: "field", v: "grey", cam: mv([-4, 1.6, -9, 46], [4, 1.8, -10, 48]), act: (A, lt, u, T) => {
    cannonLine(A, lt, T, 6, -14, 8, [297.6, 298.0, 298.2, 298.5, 298.7, 299.0, 299.3, 299.5, 299.8], 5.5); A.over((g) => caption(g, "FEVEREIRO DE 1916", lt - 0.3, 3.8));
  } },
  // 71b "contra Verdun, na França."
  { t0: 300.0, L: "map", cam: mv([MX(5.4), MY(49.2), -10, 42], [MX(5.4), MY(49.2), -8, 42]), act: (A, lt, u, T) => {
    frontLine(A, 1); arrow(A, [7.6, 49.6], [5.5, 49.2], (T - 300.2) / 0.5, "#7a1a14", 0.25); pin(A, 5.38, 49.16, T - 300.4, "fire"); A.over((g) => caption(g, "VERDUN · FRANÇA", lt - 0.3, 2));
  } },
  // 72 "O objetivo era desgastar o exército francês em uma batalha de resistência."
  { t0: 301.98, L: "trenchIn", v: "grey", fade: 0.3, cam: mv([0, 1.4, -3.4, 42], [0, 1.4, -2.8, 40]), act: (A, lt, u, T) => {
    for (let i = 0; i < 5; i++) A.a(i % 2 ? FRN : FR, 720 + i, -3 + i * 1.5, 1.0 + (i % 2) * 0.25, { expr: i % 2 ? "stern" : "pained", crouch: 0.3 + 0.2 * Math.sin(lt * 2 + i), headTilt: 5 });
    booms(A, T, [[302.6, -4, 8, 3], [303.6, 3, 10, 3.5], [304.5, -1, 9, 3], [305.5, 5, 11, 3.5]]); A.fx(0.8, (g, c) => { for (let i = 0; i < 16; i++) { const k = (lt * 0.7 + hash(i)) % 1, [sx, sy, s] = P(c, -3 + hash(i + 2) * 6, 3 - k * 3, 1 + hash(i) * 2); g.fillStyle = "rgba(90,70,50,0.7)"; g.fillRect(sx, sy, 0.04 * s, 0.04 * s); } });
  }, wx: ["rain", 160, 0.3] },
  // 73 "Durante meses, soldados enfrentaram bombardeios, ataques e combates incessantes."
  { t0: 307.07, L: "nomans", v: "grey", cam: (u, lt) => C(-2 + lt * 0.8, 1.5, -6, 44), act: (A, lt, u, T) => {
    booms(A, T, [[309.6, -2, 10, 3.5], [309.9, 6, 14, 4], [310.2, 12, 18, 4]]);
    if (T > 310.4) for (let i = 0; i < 7; i++) runS(A, GER, 730 + i, T - 310.4, 14 + i * 1.5, 4 + (i % 2), -2.6, { expr: "shout" });
    if (T > 311.4) for (let i = 0; i < 5; i++) { A.s(FR, 740 + i, -1 + i * 1.6, 3 + (i % 2), { mode: "stand", aim: true, expr: "shout" }); muzzleAt(A, T - 311.4, [0.1 + i * 0.07, 0.4 + i * 0.1], 0.4 + i * 1.6, 1.45, 3 + (i % 2), 0.3); }
    A.over((g) => { const mo = ["FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"], i = Math.min(10, Math.floor(clamp(lt / 5.2) * 11)); calendar(g, "1916", mo[i], lt, VW - 300, 110); });
  } },
  // 74 "Verdun se tornou um símbolo da resistência francesa,"
  { t0: 313.34, L: "nomans", v: "dusk", fade: 0.35, cam: mv([0, 0.8, -3.6, 40, 60], [0, 0.9, -3.0, 38, 60]), act: (A, lt) => {
    A.a(FRN, 750, 0, 1.6, { expr: "stern", prop: ["flag", lt * 3], look: 0 }, { y: 0.3 }); A.a(FR, 751, -1.3, 2.0, { expr: "stern" }, { y: 0.1 }); A.a(FR, 752, 1.4, 2.1, { expr: "stern" }, { y: 0.1 });
    A.light((g) => { const [sx, sy] = P(A.cam, -6, 3.5, 60); sun(g, sx, sy, 40, "255,190,120"); rays(g, sx, sy, 1200, 0.2, "255,190,120", 18, lt); });
    A.over((g) => caption(g, "“NÃO PASSARÃO!”", lt - 0.5, 2.6));
  } },
  // 75a "mas o preço foi devastador: centenas de milhares de soldados foram mortos,"
  { t0: 316.81, L: "poppies", v: "x", fade: 0.3, cam: mv([0, 1.3, -3, 42], [0, 4, -10, 50, -160], easeIn), act: (A, lt, u, T) => {
    A.over((g) => counter(g, Math.round(lerp(0, 700000, smooth(clamp((T - 318.6) / 2.6)))), "BAIXAS EM VERDUN (MORTOS, FERIDOS E DESAPARECIDOS)", ev(T, 318.5), 99, VH * 0.8, "#f7eedc", 84));
  }, mood: ["#8a8aa0", 0.25] },
  // 75b "feridos ou desapareceram."
  { t0: 321.55, L: "nomans", v: "grey", cam: mv([0, 1.4, -4, 42], [0, 1.4, -4.6, 42]), act: (A, lt, u, T) => {
    walkS(A, BRIN, 760, lt, -1.2, 2.2, 0.7, { expr: "sad" }); walkS(A, BRIN, 761, lt, -3.4, 2.2, 0.7, { expr: "sad" }); A.sp("stretcher", -2.3 + lt * 0.7, 0.85, 2.15, { sc: 1.1 });
    A.fx(4, (g, c) => { if (T > 322.5) { const k = clamp((T - 322.5) / 0.8); for (let i = 0; i < 3; i++) { const [sx, sy, s] = P(c, 3 + i * 1.4, 1.1, 5); puff(g, sx, sy, 1.4 * s * k, [150, 146, 140], 0.7 * k); } } });
    for (let i = 0; i < 3; i++) A.a(FR, 762 + i, 3 + i * 1.4, 5, { expr: "neutral" }, { alpha: 1 - clamp((T - 322.6) / 0.6), dark: 0.3 });
  } },
  // 76 "No mesmo ano, os britânicos lançaram uma ofensiva no Somme."
  { t0: 324.48, L: "map", fade: 0.3, cam: mv([MX(2.8), MY(50), -10, 42], [MX(2.8), MY(50), -8, 42]), act: (A, lt, u, T) => {
    frontLine(A, 1); arrow(A, [1.8, 50.0], [3.2, 50.0], (T - 326.1) / 0.6, "#1e3a6a", 0.25); pin(A, 2.7, 49.95, T - 327.5, "fire"); A.over((g) => caption(g, "SOMME · FRANÇA · 1916", lt - 0.4, 3.2));
  } },
  // 77 "No primeiro dia do ataque, em 1º de julho de 1916,"
  { t0: 328.09, L: "trenchIn", v: "x", cam: mv([0, 1.45, -3.0, 40], [0, 1.6, -3.6, 42]), act: (A, lt, u, T) => {
    const wh = T > 329.1; A.a(BOFF, 770, -1.5, 0.95, { expr: wh ? "whistle" : "stern", look: 1, wave: wh ? Math.sin(lt * 4) * 0.4 : undefined });
    A.sp("ladder", 0.6, 0, 1.6); for (let i = 0; i < 3; i++) A.a(BRI, 771 + i, 0.2 + i * 1.1, 1.3 + i * 0.1, { expr: "nervous", look: 1 });
    A.light((g) => { const [sx, sy] = P(A.cam, 6, 6, 60); sun(g, sx, sy, 30, "255,214,160"); rays(g, sx, sy, 800, 0.18, "255,220,170", 14, lt); });
    A.over((g) => caption(g, "1º DE JULHO DE 1916 · 7h30", lt - 0.4, 4.3));
  } },
  // 78 "o exército britânico sofreu aproximadamente 57 mil baixas, incluindo cerca de 19 mil mortos."
  { t0: 333.09, L: "nomans", v: "x", fade: 0.25, cam: mv([0, 1.4, -6, 44], [0, 1.6, -7.5, 46]), act: (A, lt, u, T) => {
    for (let i = 0; i < 14; i++) { const ft = T - (334.6 + hash(i) * 4), z = 3 + (i % 4) * 1.6 + lt * 0.55, fall = ft > 0 && i % 3 !== 0;
      A.a(BRI, 780 + i, -8 + i * 1.2, z, { mode: fall ? "fall" : "march", phase: (lt * 0.55 / 1.6 + i * 0.3) % 1, expr: fall ? "pained" : "stern", facing: 0 }, { rot: fall ? (i % 2 ? 1 : -1) * 1.3 * smooth(ft / 0.5) : 0, y: fall ? -0.2 * smooth(ft / 0.5) : undefined }); }
    tracers(A, lt, 14, [0, 1.2, 40], [0, 1.3, 0], 0.3, 41, "255,225,150"); spurts(A, lt, 10, -8, 8, 3, 10, 7);
    A.over((g) => { counter(g, Math.round(lerp(0, 57000, smooth(clamp((T - 335.2) / 2.2)))), "BAIXAS BRITÂNICAS EM UM SÓ DIA", ev(T, 335.1), 99, VH * 0.18); if (T > 339.2) counter(g, 19000, "MORTOS", ev(T, 339.25), 99, VH * 0.75, "#ff9a8a", 76); });
  } },
  // 79 "Foi um dos dias mais sangrentos da história militar britânica."
  { t0: 341.33, L: "nomans", v: "dusk", fade: 0.4, cam: mv([0, 1.6, -6, 44], [0, 2.4, -10, 48, -40]), act: (A, lt) => {
    for (let i = 0; i < 14; i++) A.sp("grave", -14 + i * 2.1 + hash(i) * 0.6, 0, 6 + hash(i + 1) * 10); A.light((g) => { tint(g, "#8a2a1a", 0.22, "multiply"); const [sx, sy] = P(A.cam, 0, 2, 200); sun(g, sx, sy, 50, "255,140,90"); rays(g, sx, sy, 1200, 0.18, "255,150,100", 16, lt); });
  } },
  // 80 "Apesar de meses de combate, os avanços territoriais foram pequenos diante do enorme número de vidas perdidas."
  { t0: 345.53, L: "map", fade: 0.35, cam: mv([MX(2.8), MY(50), -8, 42], [MX(2.8), MY(50), -5, 42]), act: (A, lt, u, T) => {
    frontLine(A, 1, 0, "#5a3a22"); frontLine(A, 1, 0.1 * smooth(clamp((T - 347.6) / 1.8)), "#1e3a6a"); pin(A, 2.7, 49.95, 1, "x");
    A.over((g) => { caption(g, "AVANÇO: CERCA DE 10 KM", ev(T, 349.2), 99); if (T > 350.8) counter(g, 1000000, "BAIXAS NO SOMME (TODOS OS LADOS)", ev(T, 350.9), 99, VH * 0.2, "#f7eedc", 78); });
  } },
  // 81 "A guerra parecia consumir soldados sem oferecer uma vitória decisiva."
  { t0: 353.03, L: "nomans", v: "grey", fade: 0.3, cam: mv([0, 1.6, -4, 44], [0, 1.7, -4.6, 44]), act: (A, lt) => {
    marchF(A, BRI, -lt, 10, 3, 1.8, 1.4, 1.2, 1.6, 800, () => ({ expr: "sad" }), {}); A.fx(14, (g, c) => { for (let i = 0; i < 9; i++) { const [sx, sy, s] = P(c, -6 + i * 1.5, 1.2, 14 + hash(i) * 2); puff(g, sx, sy, 2.4 * s, [120, 114, 108], 0.85); } });
  } },
  // 82 CAPÍTULO 5 — O MUNDO INTEIRO ENTRA EM GUERRA
  { t0: 358.75, L: "world", fade: 0.5, cam: mv([WX(20), WY(20), -40, 44], [WX(20), WY(25), -34, 44]), act: (A, lt) => { A.over((g) => chapter(g, "CAPÍTULO 5", "O MUNDO INTEIRO ENTRA EM GUERRA", lt - 0.1, 4.4)); } },
  // 83 "O conflito não ficou limitado à Europa."
  { t0: 363.28, L: "world", cam: mv([WX(20), WY(25), -34, 44], [WX(30), WY(20), -46, 44]), act: (A, lt, u, T) => {
    A.fx(-0.05, (g, c) => { const [sx, sy, s] = P(c, WX(10), WY(50), 0), r = (0.8 + 5 * easeOut(clamp((T - 363.6) / 2))) * s; const gr = g.createRadialGradient(sx, sy, 0, sx, sy, r); gr.addColorStop(0, "rgba(180,30,24,0.55)"); gr.addColorStop(0.8, "rgba(180,30,24,0.25)"); gr.addColorStop(1, "rgba(180,30,24,0)"); g.fillStyle = gr; g.fillRect(sx - r, sy - r, 2 * r, 2 * r); });
  } },
  // 84 "Soldados de diferentes partes do mundo foram enviados para lutar."
  { t0: 366.04, L: "ocean", fade: 0.3, cam: mv([0, 3, -16, 46], [4, 3.2, -18, 46]), act: (A, lt) => {
    for (let i = 0; i < 3; i++) A.sp("liner", -30 + i * 30 + lt * 2, -0.3, 50 + i * 25); A.fx(30, (g, c) => waves(g, c, lt));
    A.sp("liner", -2 + lt * 1.5, -0.3, 22, { sc: 1 }); for (let i = 0; i < 8; i++) A.a(i % 3 === 0 ? IND : i % 3 === 1 ? ANZ : CAN, 820 + i, -9 + i * 1.6 + lt * 1.5, 22.5, { expr: "grin", wave: Math.sin(lt * 5 + i) }, { y: 6.6, shadow: 0, sc: 1 });
  } },
  // 85 "Tropas das colônias britânicas e francesas participaram das campanhas,"
  { t0: 370.30, L: "field", fade: 0.3, cam: (u, lt) => C(-2 + lt * 1.3, 1.4, -6.5, 44), act: (A, lt) => {
    marchCol(A, (i) => [SEN, IND, ANZ, CAN, SEN, IND][i % 6], lt, 12, 2, 3, 1.35, 1.3, 2, 1.3);
  } },
  // 86 "levando homens da África, da Índia, do Canadá, da Austrália e de outras regiões para campos de batalha distantes."
  { t0: 374.49, L: "world", fade: 0.3, cam: mv([WX(30), WY(20), -46, 44], [WX(30), WY(20), -44, 44]), act: (A, lt, u, T) => {
    const E = [3, 50]; ([[[15, 5], 375.4], [[78, 22], 376.2], [[-100, 55], 377.1], [[134, -25], 378.0], [[30, -25], 379.2], [[-60, -15], 379.5], [[150, 35], 379.8]] as [number[], number][]).forEach(([p, at]) => { arrow(A, p, E, (T - at) / 0.6, "#b3221c", 0.35, true); pin(A, p[0], p[1], T - at, "dot", true); });
  } },
  // 87a "O Império Otomano entrou na guerra ao lado das Potências Centrais,"
  { t0: 382.23, L: "desert", fade: 0.35, cam: mv([0, 1.5, -7, 44], [0, 1.6, -6, 44]), act: (A, lt) => {
    marchF(A, OTT, lt, 4, 6, 3.4, 1.3, 1.25, 1.5, 840); A.light((g) => { const [sx, sy] = P(A.cam, 20, 40, 200); sun(g, sx, sy, 30, "255,240,210"); });
    A.over((g) => caption(g, "IMPÉRIO OTOMANO · 1914", lt - 0.3, 3));
  } },
  // 87b "ampliando o conflito para o Oriente Médio."
  { t0: 385.6, L: "desert", cam: mv([0, 2.2, -10, 46], [0, 2.6, -13, 48, -40]), act: (A, lt, u, T) => {
    for (let i = 0; i < 6; i++) runS(A, BRI, 850 + i, lt, -14 + i * 1.5, 6, 2.2, { expr: "shout" }); for (let i = 0; i < 5; i++) A.s(OTT, 860 + i, 8 + i * 1.2, 9, { mode: "stand", aim: true }, { flip: true });
    booms(A, T, [[386.4, -2, 20, 4], [387.2, 10, 26, 4.5], [388.0, 2, 30, 4]]);
  }, wx: ["dust", 120, 0.6] },
  // 88 "Enquanto isso, em 1917, um acontecimento mudaria completamente o equilíbrio da guerra."
  { t0: 389.32, L: "map", fade: 0.35, cam: mv([MX(13), MY(50), -27, 42], [MX(13), MY(50), -25, 42]), act: (A, lt, u, T) => {
    A.light((g) => tint(g, "#1a1210", 0.35, "multiply")); A.over((g) => { bigText(g, "1917", ev(T, 390.4), 4, VH * 0.18, 130); scales(g, VW / 2, VH * 0.34, 1, Math.sin(lt * 2) * 0.12 + (T > 394.6 ? -0.7 * smooth((T - 394.6) / 0.8) : 0), 1, ["ALIADOS", "IMPÉRIOS CENTRAIS"]); });
  } },
  // 89 "Os Estados Unidos entraram no conflito ao lado dos Aliados."
  { t0: 396.41, L: "station", fade: 0.3, cam: mv([0, 1.5, -4, 42], [0, 1.7, -6, 46]), act: (A, lt) => {
    marchF(A, USA, lt, 6, 5, 3, 1.6, 1.3, 1.5, 870, (r, c) => ({ expr: "stern" })); crowd(A, 14, -10, 10, 7, 8.5, 131, (i) => ({ expr: "grin", wave: Math.sin(lt * 6 + i) }));
    A.over((g) => { const x = VW * 0.08, y = VH * 0.12, w = 240, h = 130; g.save(); for (let k = 0; k < 7; k++) { g.fillStyle = k % 2 ? "#f4f1ea" : "#b3221c"; g.fillRect(x, y + (k * h) / 7, w, h / 7 + 1); } g.fillStyle = "#1e3a6a"; g.fillRect(x, y, w * 0.42, h * 0.54);
      g.fillStyle = "#f4f1ea"; for (let a = 0; a < 4; a++) for (let b = 0; b < 3; b++) { g.beginPath(); g.arc(x + 14 + a * 24, y + 14 + b * 22, 4, 0, 7); g.fill(); } g.strokeStyle = "#241726"; g.lineWidth = 5; g.strokeRect(x, y, w, h); g.restore(); caption(g, "ESTADOS UNIDOS · ABRIL DE 1917", lt - 0.4, 3.6); });
  } },
  // 90a "A decisão foi influenciada por ataques submarinos alemães"
  { t0: 400.73, L: "ocean", v: "dusk", fade: 0.3, cam: mv([0, 0.9, -10, 44], [0, 0.9, -9, 44]), act: (A, lt, u, T) => {
    const up = clamp((T - 402.8) / 1.0); A.sp("sub", 2, -1.8 + up * 1.6, 20, { sc: 1 }); A.fx(19.9, (g, c) => { const [sx, sy, s] = P(c, 2, 0, 19.9); g.fillStyle = "rgba(240,248,255,0.6)"; g.beginPath(); g.ellipse(sx, sy, 8 * s * (0.3 + up), 0.15 * s, 0, 0, 7); g.fill(); });
    if (up < 0.2) A.fx(20, (g, c) => { const [sx, sy, s] = P(c, 2.6, 0.5, 20); g.fillStyle = "#2a2a2a"; g.fillRect(sx, sy - 1.6 * s, 0.12 * s, 1.6 * s); g.fillRect(sx, sy - 1.6 * s, 0.5 * s, 0.12 * s); }); A.fx(30, (g, c) => waves(g, c, lt));
  } },
  // 90b "contra navios"
  { t0: 404.3, L: "ocean", v: "dusk", cam: mv([0, 2.6, -16, 46], [0, 2.8, -18, 46]), act: (A, lt, u, T) => {
    const hit = 404.75, sink = clamp((T - hit - 0.3) / 1.2); A.sp("liner", 0, -0.3 - sink * 1.2, 40, { rot: sink * 0.08 }); A.fx(30, (g, c) => waves(g, c, lt));
    A.fx(20, (g, c) => { const k = clamp((T - 404.3) / 0.45), [ax, ay] = P(c, -4, 0, 8), [bx, by] = P(c, -1, 0, 39); g.strokeStyle = "rgba(255,255,255,0.75)"; g.lineWidth = 4; g.beginPath(); g.moveTo(ax, ay); g.lineTo(lerp(ax, bx, k), lerp(ay, by, k)); g.stroke(); });
    A.fx(39.5, (g, c) => boom(g, c, T - hit, -1, 1, 39.5, 6, 5)); A.fx(39.4, (g, c) => { if (T > hit) smokeCol(g, c, T - hit, 2, 6, 39.4, { h: 20, w: 3, seed: 3, col: [36, 32, 34] }); });
  } },
  // 91a "e pelo Telegrama Zimmermann, uma proposta alemã de aliança"
  { t0: 405.29, L: "office", fade: 0.25, cam: mv([0, 1.4, -2.6, 36, 120], [0, 1.35, -2.1, 34, 130]), act: (A, lt, u, T) => {
    A.sp("telegram", 0, 0.92, 0.9, { sc: 1 }); A.over((g) => stamp(g, "INTERCEPTADO", ev(T, 407.0), VW * 0.68, VH * 0.36, -0.15, 70));
    A.light((g) => glow(g, VW * 0.5, VH * 0.6, VW * 0.4, "rgba(255,220,150,0.35)", 0.6));
  } },
  // 91b "com o México caso os Estados Unidos entrassem na guerra."
  { t0: 409.0, L: "world", cam: mv([WX(-60), WY(35), -20, 42], [WX(-60), WY(35), -18, 42]), act: (A, lt, u, T) => {
    arrow(A, [12, 51], [-102, 23], (T - 409.1) / 0.9, "#7a1a14", 0.3, true); pin(A, -102, 23, T - 409.9, "dot", true); pin(A, -98, 40, T - 410.7, "x", true);
    A.over((g) => { caption(g, "ALEMANHA → MÉXICO", lt - 0.2, 2.9); });
  } },
  // 92 "A chegada de tropas, recursos e equipamentos americanos fortaleceu os Aliados."
  { t0: 412.56, L: "ocean", fade: 0.3, cam: mv([0, 2.4, -10, 44], [3, 2.6, -11, 44]), act: (A, lt) => {
    A.sp("liner", 0, -0.3, 30); A.fx(29, (g, c) => waves(g, c, lt)); for (let i = 0; i < 8; i++) A.sp("crate", -6 + i * 1.5, 0.2, 6 + (i % 2)); marchCol(A, USA, lt, 10, -1, 4, 1.4, 1.2);
    A.fx(5.8, (g, c) => { const [ax, ay] = P(c, -12, 0.2, 5.8), [bx] = P(c, 12, 0.2, 5.8); g.fillStyle = "#7a5a3a"; g.fillRect(ax, ay - 10, bx - ax, 1200); });
  } },
  // 93 "Ao mesmo tempo, a Rússia enfrentava uma crise interna devastadora."
  { t0: 418.32, L: "russia", fade: 0.35, cam: mv([-2, 1.5, -5.5, 44], [1, 1.5, -6, 44]), act: (A, lt) => {
    for (let i = 0; i < 9; i++) A.s(civ(i), 880 + i, -6 + i * 1.1, 3 + (i % 2) * 0.3, { mode: "stand", expr: i % 2 ? "sad" : "pained" }); A.a(RUS, 890, 3.6, 2.0, { mode: "sit", expr: "dazed", headTilt: 8 });
  }, wx: ["snow", 260, 0.7], mood: ["#8a90a0", 0.2] },
  // 94a "Revoluções derrubaram o governo"
  { t0: 423.03, L: "russia", v: "night", cam: mv([0, 1.6, -6, 44], [0, 1.7, -5, 44]), act: (A, lt, u, T) => {
    crowd(A, 30, -8, 8, 2, 6, 141, (i) => ({ expr: "shout", prop: i % 3 === 0 ? ["fist", 0] : undefined, wave: i % 3 === 1 ? Math.sin(lt * 6 + i) : undefined }), (i) => (i % 4 === 0 ? RUS : civ(i)));
    for (let i = 0; i < 4; i++) A.sp("flagRed", -6 + i * 4, 0, 4 + i * 0.4, { rot: Math.sin(lt * 3 + i) * 0.05 });
    const k = clamp((T - 423.7) / 0.5); A.sp("portrait", 0, 3.5 - easeIn(k) * 3.4, 9, { rot: k * 0.4, sc: 1.6 });
  } },
  // 94b "e, posteriormente, levaram os bolcheviques ao poder."
  { t0: 425.2, L: "russia", v: "night", cam: mv([0, 1.8, -5.2, 42], [0, 1.9, -4.4, 40]), act: (A, lt, u, T) => {
    A.sp("chairE", 0, 0, 2.6, { sc: 2 }); A.a(BOL, 900, 0, 2.62, { expr: T > 427 ? "shout" : "stern", prop: T > 427 ? ["fist", 0] : undefined }, { y: 0.9 }); A.sp("flagRed", -2, 0, 3, { sc: 1.5 }); A.sp("flagRed", 2.4, 0, 3, { sc: 1.5, flip: true });
    crowd(A, 20, -6, 6, 0.6, 1.6, 151, () => ({ expr: "shout", prop: ["fist", 0] }), (i) => (i % 3 ? RUS : civ(i)), { dark: 0.6 });
    A.light((g) => glow(g, VW * 0.5, VH * 0.3, VW * 0.5, "rgba(255,90,60,0.35)", 0.6));
  } },
  // 95 "Em 1918, a Rússia saiu da guerra após assinar o Tratado de Brest-Litovsk com a Alemanha."
  { t0: 428.89, L: "office", fade: 0.3, cam: mv([0, 1.5, -4.4, 42], [0, 1.4, -3.0, 40]), act: (A, lt, u, T) => {
    A.a({ ...DIP[1], hat: "cap", cap: "#2a2826" }, 910, -1.0, 2.25, { expr: "stern", facing: 1, prop: T > 432.2 && T < 433.5 ? ["pen", lt] : undefined, crouch: T > 432.2 && T < 433.5 ? 0.25 : 0 }); A.a({ ...GERN, hat: "peaked", cap: "#4a5040" }, 911, 1.1, 2.3, { expr: "smile", facing: -1 });
    A.sp("treatyBL", 0, 0.92, 1.25, { sc: 0.45 }); A.over((g) => { stamp(g, "ASSINADO", ev(T, 433.6), VW * 0.62, VH * 0.74, -0.1, 70); caption(g, "BREST-LITOVSK · MARÇO DE 1918", lt - 0.3, 5); });
  } },
  // 96 "Mas, no oeste, os combates continuavam."
  { t0: 435.85, L: "nomans", v: "grey", fade: 0.3, cam: mv([0, 1.6, -6, 44], [0, 1.8, -7.4, 46]), act: (A, lt, u, T) => {
    booms(A, T, [[436.3, -6, 18, 4], [436.9, 6, 24, 4], [437.6, -2, 30, 5], [438.4, 10, 20, 4]]); for (let i = 0; i < 5; i++) runS(A, GER, 920 + i, lt, -8 - i * 1.6, 4, 2.4, { expr: "shout" });
    tracers(A, lt, 8, [12, 1.2, 20], [-10, 1.4, 4], 0.4, 51);
  } },
];
function stamp(g: CanvasRenderingContext2D, txt: string, t: number, x: number, y: number, rot = -0.18, size = 120, col = "#c42a22") {
  if (t < 0) return; const k = t < 0.12 ? 2.2 - 1.2 * (t / 0.12) : 1, a = t < 0.12 ? t / 0.12 : 1;
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(k, k); g.globalAlpha = 0.9 * a; g.font = `bold ${size}px "DejaVu Serif", serif`; const w = g.measureText(txt).width;
  g.strokeStyle = col; g.lineWidth = size * 0.09; g.strokeRect(-w / 2 - size * 0.3, -size * 0.75, w + size * 0.6, size * 1.5); g.fillStyle = col; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(txt, 0, 4); g.restore();
}
