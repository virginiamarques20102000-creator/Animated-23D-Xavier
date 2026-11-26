// 0 – 153 s: gancho, quem era Elser, o perigo, a decisão, a cervejaria e a tradição do 8 de novembro.
import type { Shot } from "../ww2/types";
import { loc, wall, world, ST, clouds, hillL, forest, field, city, skyline, mtn } from "./places3";
import { LAMP, NIGHTFIRE, DAY, GOLD, BACK, GREY, MOON, NOON, COLD } from "../ww2/looks";
import { walkS, walkF, runS, marchF, marchCol, crowd, tank, plane, planeTop, flag, hl, arrow, pin, calPage, panel, idle, kid, sol, WEH, SA, GESTAPO, SSOFF, civ, v } from "../ww2/kit";
import { blast, scorch, embers, flutter, lensFlare, birds, dust } from "../ww2/fx";
import { stamp, sun, rays, tint } from "../ww2/engine";
import { hallL, hallOutL, streetL, shopL, roomL, mapL, mv, clockOver, column, mechanism, wallClock, tables, podium, chandeliers, xMark, oldFilm, mapLabel, torchBeam,
  ELSER, ELSER_W, ELSER_C, HIT, HIMMLER, GOERING, HESS, PARTY, caption, bigText, P, glow, puff, VW, VH, clamp, lerp, smooth, easeOut, hash, fire, smokeCol, mix, din, dinT, soco } from "./ek";
import { hall, elserBench, sunbeam, leaders, CX, CZ, PZ } from "./scenes";

import { hand } from "../ww2/kit";
import { stein } from "./ek";
import { MX, MY } from "./places3";
const MX0 = MX(11.58), MY0 = MY(48.14);
const GUARD1923: import("../ww2/toon").Outfit = { jacket: "#3a4a3a", pants: "#2e3a2e", boots: "#141414", hat: "stahlhelm", cap: "#3a4436", rifle: true };
const paperP = (A: import("../ww2/kit").Sc, x: number, y: number, z: number, head: string) => panel(A, z, (w) => { w.rect(-0.22, 0, 0.44, 0.56, "#ece4d0", 2); w.text("MÜNCHNER ZEITUNG", 0, 0.5, 0.035, "#1e1a18"); w.line([[-0.2, 0.47], [0.2, 0.47]], 1.5, "#1e1a18"); w.text(head, 0, 0.4, 0.07, "#8a1a14"); w.rect(-0.16, 0.12, 0.14, 0.2, "#7a6a5a", 1); for (let k = 0; k < 6; k++) w.line([[0.0, 0.3 - k * 0.035], [0.18, 0.3 - k * 0.035]], 1, "#6a6056"); }, { dx: x, dy: y, rot: -0.1, pivot: [0, 0] });
const dark = () => loc(undefined, { near: "#120c08", far: "#120c08", kind: "none", zFar: 4 }, [], true);
const homeL = (K: string) => roomL(K, "#6a5a48", { win: true, frames: 1 });

export const SHOTS_1: Shot[] = [
  // 0a "Imagine conseguir mudar o destino do mundo inteiro…"
  { t0: 0, L: () => world("w0", ST.ember), cam: dinT(0, [0, 1.5, -14, 40], [[1.7, [0, 1.8, -19, 40]], [2.35, [0, 2.0, -26, 42]]]), act: (A, lt, u, T) => {
      const P0: [number, number][] = [[11.6, 48.1], [2.3, 48.8], [-0.1, 51.5], [13.4, 52.5], [37.6, 55.7], [21, 52.2], [12.5, 41.9], [-74, 40.7], [139.7, 35.7], [116.4, 39.9], [31.2, 30], [151, -33.8], [-43, -22.9], [28, -26], [77, 28.6]];
      P0.forEach(([lo, la], i) => pin(A, lo, la, T - 2.35 - i * 0.08, i === 0 ? "star" : "dot", true, i === 0 ? "#ffd060" : "#e0a060"));
      A.light((g) => tint(g, "#ff8a3a", 0.06 + 0.04 * Math.sin(lt * 2), "soft-light"));
    } },
  // 0b "mas falhar por apenas treze minutos." — o relógio corre de 21h07 a 21h20
  { t0: 3.83, fade: 0.25, L: () => hallL("h0", { dark: 0.75 }), cam: mv([0.6, 2.2, 5, 40, -10], [0.3, 2.0, 7.5, 38, -10]), lite: LAMP, bloom: 0.6, act: (A, lt, u, T) => {
      hall(A, lt, { dark: 0.75, empty: true, col: { xray: 0.6 + 0.3 * Math.sin(lt * 5), bomb: true } });
      const m = 7 + 13 * smooth(clamp((T - 4.1) / 1.6)); A.over((g) => { clockOver(g, 21, m, lt, 3.4, { red: true, r: 190, y: VH * 0.42 }); bigText(g, "13 MINUTOS", T - 5.45, 1.9, VH * 0.86, 96); });
    } },
  // 1a "Em 1939, um homem" — rua de Munique à noite, um homem sozinho andando
  { t0: 7.15, fade: 0.35, L: () => streetL("s1", { night: true, seed: 3 }), cam: dinT(7.15, [-3, 1.6, -6, 42], [[9.35, (lt) => [-1.6 + lt * 1.1, 1.45, -3.6, 38]]]), lite: { ...MOON, rim: "#ffd8a0" }, wx: ["rain", 160, 0.3], act: (A, lt, u, T) => {
      walkS(A, ELSER_C, 1, lt, -4.2, 2.4, 1.2, { expr: "stern" });
      for (const x of [-6, 2, 10]) { A.sp("lamp", x, 0, 3.6, { sc: 1.5 }); A.light((g) => { const [sx, sy, s] = P(A.cam, x, 3.1, 3.6); glow(g, sx, sy, 2.2 * s, "rgba(255,200,120,1)", 0.6); }); }
      A.over((g) => caption(g, "MUNIQUE · 1939", T - 7.4, 2.6));
    } },
  // 1b "conseguiu chegar tão perto de assassinar Adolf Hitler" — Hitler no púlpito, a coluna atrás dele brilha
  { t0: 9.98, fade: 0.2, L: () => hallL("h1"), cam: soco(dinT(9.98, [0.9, 1.8, 7.5, 42], [[10.45, [0.9, 1.75, 9.0, 40]], [11.25, [0.95, 1.7, 10.2, 40]], [12.2, [0.9, 1.7, 10.6, 38]]]), [[1.3, 0.08]]), lite: LAMP, bloom: 0.7, act: (A, lt, u, T) => {
      hall(A, lt, { hitler: "shout", cheer: 0.3, noCrowdRows: [4, 3], col: { xray: clamp((T - 11.25) / 0.4) * (0.75 + 0.25 * Math.sin(lt * 9)), bomb: true } });
      if (T > 11.25) A.light((g) => { const [sx, sy, s] = P(A.cam, CX, 1.4, CZ); glow(g, sx, sy, 1.6 * s, "rgba(255,60,40,1)", 0.35 * clamp((T - 11.25) / 0.4)); });
    } },
  // 1c "que uma pequena diferença no horário foi suficiente"
  { t0: 12.63, fade: 0.2, L: () => dark(), cam: mv([0, 0, -5.5, 40], [0, 0, -4.6, 40]), lite: LAMP, act: (A, lt, u, T) => {
      mechanism(A, 0, lt, { tick: true, light: 0.45 });
      const m = 7 + 13 * smooth(clamp((T - 14.2) / 1.3)); A.over((g) => clockOver(g, 21, m, lt, 3.5, { red: true }));
    } },
  // 1d "para separar a história que conhecemos" — a guerra que conhecemos
  { t0: 16.23, fade: 0.15, L: () => loc(["#1a1420", "#7a3a24"], { near: "#3a2e26", far: "#5a4434", kind: "rubble", seed: 33, zFar: 300 }, [skyline("s1d", 150, "#1e1618", "stalingrad", 5, 2), city("s1d", 40, { pal: ["#4a3e36", "#3e342e", "#56483c"], seed: 33, ruin: true, blur: 1.2 })]),
    cam: hand(mv([-3, 1.3, -7, 42], [2, 1.5, -6, 40])), lite: NIGHTFIRE, bloom: 0.7, kicks: [[16.9, 10], [17.8, 8]], act: (A, lt, u, T) => {
      tank(A, "panzer", -12 + lt * 3, 14, { vel: 3, dustCol: [120, 100, 90], fire: T - 17.2 });
      for (const [at, x, z, s] of [[16.9, 8, 30, 3], [17.8, -6, 40, 4]] as number[][]) A.fx(z, (g, c) => blast(g, c, T - at, x, 0, z, s, x));
      for (const [x, z, s] of [[-14, 50, 3], [14, 35, 2.6]] as number[][]) { A.fx(z, (g, c) => fire(g, c, lt, x, 0, z, s, x)); A.fx(z + 0.5, (g, c) => smokeCol(g, c, lt, x, s * 2, z + 0.5, { h: 40, w: 6, col: [30, 26, 28], a: 0.75, seed: x })); }
      A.fx(12, (g, c) => embers(g, c, lt, 0, 12, 30, 50, 14, 3));
    } },
  // 1e "de uma realidade completamente diferente." — a mesma rua, em paz e ao sol
  { t0: 18.28, fade: 0.45, L: () => streetL("s1e", { seed: 9 }), cam: mv([0, 1.5, -6, 42], [0.5, 1.7, -7.5, 44]), lite: GOLD, bloom: 0.8, grade: ["#ffd8a0", 0.15], act: (A, lt, u, T) => {
      walkS(A, kid(1, 4), 31, lt, -4, 3, 1.6, { expr: "laugh" }); walkS(A, kid(2, 5), 32, lt, -5.2, 3.3, 1.6, { expr: "grin" });
      A.a(civ(3, 6), 33, 2.5, 4, { expr: "smile", look: -1, prop: ["bread", 1] }); A.a(civ(4, 6), 34, 3.5, 4.4, { expr: "laugh", look: -1 });
      A.fx(4, (g, c) => flutter(g, c, lt, { n: 18, x0: -6, x1: 6, z0: 3, z1: 9, top: 5, cols: ["#ffd0e0", "#fff4c0", "#ffffff"], size: 0.08, fall: 0.4, seed: 4, loop: true }));
      A.light((g) => { sun(g, VW * 0.8, VH * 0.25, 30, "255,226,170"); rays(g, VW * 0.8, VH * 0.25, VW * 0.8, 0.12, "255,210,160", 14, lt); });
    } },
  // 2a "E o mais surpreendente é que ele não era um militar," — soldados marchando; ele não está entre eles
  { t0: 22.03, fade: 0.25, L: () => streetL("s2a", { seed: 14, banner: false }), cam: dinT(22.03, [-1, 1.5, -6, 42], [[24.3, [0.8, 1.4, -4.6, 38]]]), lite: DAY, act: (A, lt, u, T) => {
      marchF(A, (i) => sol(WEH, i), lt, 3, 5, 5, 1.2, 1.3, 1.5, 300);
      const k = clamp((T - 24.3) / 0.4); A.a(ELSER, 1, 2.3, 1.6, { expr: "neutral", look: -1, headTilt: 6 }, { alpha: 1 });
      if (k > 0) A.over((g) => { const [sx, sy] = P(A.cam, 0, 1.6, 6); xMark(g, sx, sy, 140, k * 1.4); });
    } },
  // 2b "não fazia parte de uma organização secreta" — uma reunião secreta à luz de vela, sem ele
  { t0: 24.68, fade: 0.2, L: () => roomL("c2b", "#3a3028", { dark: 0.5 }), cam: mv([0, 1.5, -3.2, 40], [0.3, 1.4, -2.6, 36]), lite: { ...LAMP, rdx: 0, rdy: 1 }, mood: ["#4a3a5a", 0.25], act: (A, lt, u, T) => {
      A.sp("desk", 0, 0, 2.2, { sc: 1.1 }); A.sp("candle", 0, 0.82, 2.1, { sc: 0.9 });
      [[-1.1, 2.7, 1], [-0.4, 3.0, 1], [0.5, 3.0, -1], [1.2, 2.7, -1]].forEach(([x, z, f], i) => A.a(v(GESTAPO, { jacket: ["#2a2a2a", "#3a3430", "#2a3036", "#342a2a"][i] }), 41 + i, x, z, { expr: "stern", look: -f * 0.5, facing: (f > 0 ? 1 : -1) as 1 | -1 }, { dark: 0.45, darkCol: "#140a06" }));
      A.light((g) => { const [sx, sy, s] = P(A.cam, 0, 1.05, 2.1); glow(g, sx, sy, 2.6 * s, "rgba(255,190,100,1)", 0.75); });
      const k = clamp((T - 26.85) / 0.4); if (k > 0) A.over((g) => xMark(g, VW / 2, VH * 0.45, 150, k * 1.4));
    } },
  // 2c "e não tinha um exército ao seu lado." — sozinho num campo vazio, a câmera se afasta
  { t0: 27.28, fade: 0.3, L: () => loc(["#3a3e5e", "#e8b088"], { near: "#5a5a3a", far: "#8a8058", kind: "grass", seed: 21, zFar: 300 }, [clouds("c2c", 260, ["#f0b898", "#4a4e6e"], 3, 40, 110, 14, 4), hillL("c2c", 120, "#5a5a6a", 6, 10, 2), field("c2c", 18, "wheat", "#b89a5a", 3, 0.9, 40, 0.4)]),
    cam: dinT(27.28, [0, 1.5, -2.4, 36], [[28.35, [0, 3.5, -12, 44, -40]]]), lite: GOLD, bloom: 0.7, act: (A, lt) => {
      A.a(ELSER, 1, 0, 2, { expr: "neutral", look: 0.2 }); A.fx(60, (g, c) => birds(g, c, lt, 5, -20, 18, 60, 3));
      A.light((g) => { sun(g, VW * 0.82, VH * 0.42, 26, "255,214,160"); lensFlare(g, VW * 0.82, VH * 0.42, 0.4); });
    } },
  // 3 "Era apenas um carpinteiro."
  { t0: 30.03, fade: 0.25, L: () => shopL("o3"), cam: dinT(30.03, [-0.6, 1.4, -3.2, 40], [[31.15, [0.1, 1.35, -1.9, 34]]]), lite: { ...DAY, rdx: 1, key: "#ffe8c8", ka: 0.12 }, bloom: 0.6, act: (A, lt) => { elserBench(A, lt); sunbeam(A); } },
  // 4 "Seu nome era Georg Elser."
  { t0: 32.48, fade: 0.2, L: () => shopL("o3"), cam: mv([0.4, 1.75, -2.0, 36], [0.3, 1.75, -1.4, 32]), lite: { ...DAY, rdx: 1, key: "#ffe8c8", ka: 0.12 }, bloom: 0.6, act: (A, lt, u, T) => {
      A.a(ELSER_W, 1, 0.3, 1.6, { expr: "neutral", look: -0.2, headTilt: 4, prop: ["hammer", 0.1] }); sunbeam(A, 2.7, 3, 6, 0.22);
      A.over((g) => bigText(g, "GEORG ELSER", T - 33.7, 1.9, VH * 0.18, 110));
    } },
  // 5a "E ele estava prestes a realizar" — a fachada da cervejaria à noite
  { t0: 34.91, fade: 0.3, L: () => hallOutL("ho"), cam: mv([0, 2.4, -6, 44, -40], [0, 2.8, -3.5, 42, -70]), lite: MOON, bloom: 0.8, act: (A, lt) => {
      for (const x of [-8, 8]) { A.sp("lamp", x, 0, 9, { sc: 1.6 }); A.light((g) => { const [sx, sy, s] = P(A.cam, x, 3.4, 9); glow(g, sx, sy, 2.6 * s, "rgba(255,200,120,1)", 0.6); }); }
      for (let i = 0; i < 6; i++) walkS(A, PARTY(i), 60 + i, lt, -10 + i * 1.6, 8 + (i % 2) * 0.6, 1.0, { expr: "neutral" }, { dark: 0.4, darkCol: "#0a0a14" });
    } },
  // 5b "um dos atentados mais impressionantes" — clarão dentro do salão
  { t0: 37.23, fade: 0.1, L: () => hallL("h0", { dark: 0.7 }), cam: soco(mv([0.6, 2, 6, 42, -10], [0.6, 2.1, 7, 40, -10]), [[0.88, 0.12]]), lite: NIGHTFIRE, bloom: 0.9, kicks: [[38.1, 16]], act: (A, lt, u, T) => {
      hall(A, lt, { dark: 0.7, empty: true, col: { bomb: true } }); A.fx(CZ - 0.6, (g, c) => blast(g, c, T - 38.1, CX, 1.2, CZ - 0.6, 3.2, 5, { debris: 40 }));
      A.light((g) => { const k = T - 38.1; if (k > 0 && k < 0.3) { g.fillStyle = `rgba(255,240,220,${0.7 * (1 - k / 0.3)})`; g.fillRect(0, 0, VW, VH); } });
    } },
  // 5c "contra Hitler"
  { t0: 38.88, fade: 0.15, L: () => hallL("h1"), cam: mv([0, 1.95, 11.2, 34], [0, 1.95, 11.8, 30]), lite: LAMP, bloom: 0.7, act: (A, lt) => hall(A, lt, { hitler: "shout", noCrowdRows: [3, 4], cheer: 0.6 }) },
  // 5d "durante a Segunda Guerra Mundial." — bombardeiros sobre a cidade ao pôr do sol
  { t0: 40.23, fade: 0.25, L: () => loc(["#3a1e32", "#ff9a3a"], { near: "#1e1418", far: "#3a2020", zFar: 400 }, [clouds("o5d", 220, ["#ffb070", "#6a2a3a"], 12, 25, 70, 14, 5), skyline("o5d", 140, "#2a1a20", "generic", 7, 1.5)]),
    cam: mv([0, 6, -10, 42, 60], [0, 7, -8, 40, 80]), bloom: 0.9, act: (A, lt) => {
      A.light((g) => { sun(g, VW * 0.5, VH * 0.7, 120, "255,170,90"); rays(g, VW * 0.5, VH * 0.7, VW, 0.1, "255,160,90", 18, lt); });
      for (let i = 0; i < 5; i++) plane(A, "he111", -50 + i * 9 + lt * 16, 24 + (i % 2) * 3, 110 + i * 10, { sc: 1 });
    } },
  // 6a "Mas, antes de entender como tudo aconteceu, precisamos voltar" — o calendário volta no tempo
  { t0: 42.1, fade: 0.25, L: () => roomL("r6", "#7a6a56", { frames: 0 }), cam: mv([0, 1.5, -3.6, 36], [0, 1.5, -3.1, 32]), lite: LAMP, act: (A, lt, u, T) => {
      const pages = [["NOVEMBRO", "8", "1939"], ["AGOSTO", "5", "1939"], ["ABRIL", "2", "1939"], ["DEZEMBRO", "1", "1938"], ["SETEMBRO", "14", "1938"]];
      const i = Math.min(pages.length - 1, Math.floor(Math.max(0, T - 44.8) / 0.6)); const p = pages[i]; calPage(A, -0.2, 2.2, 1.2, p[0], p[1], p[2]);
      A.over((g) => { if (T > 44.8) { g.save(); g.globalAlpha = 0.25; g.fillStyle = "#fff"; for (let k = 0; k < 6; k++) g.fillRect(0, ((lt * 900 + k * 180) % VH), VW, 3); g.restore(); } });
      A.over((g) => clockOver(g, 9, 30 - Math.max(0, T - 44.8) * 400, lt, 4.2, { digital: false, x: VW * 0.78, y: VH * 0.42, r: 150 }));
    } },
  // 6b "ao momento em que ele decidiu que Adolf Hitler precisava morrer." — à noite, o jornal com o rosto de Hitler
  { t0: 46.28, fade: 0.3, L: () => homeL("r6b"), cam: dinT(46.28, [0.4, 1.2, -2.6, 38], [[47.45, [0.2, 1.2, -1.9, 34]], [49.7, [0.1, 1.3, -1.3, 28]]]), lite: { ...LAMP, rdx: -1 }, mood: ["#5a4a6a", 0.12], act: (A, lt, u, T) => {
      A.sp("desk", 0, 0, 1.4, { sc: 0.9 }); A.sp("lamp", -1.0, 0.75, 1.3, { sc: 0.6 }); paperP(A, 0.55, 0.95, 1.2, "GUERRA?");
      A.a(ELSER, 1, 0.1, 1.75, { mode: "sit", expr: T > 49.6 ? "stern" : "sad", look: 0.4, headTilt: 8, prop: ["paper", 1] }, { y: 0.3 });
      A.light((g) => { const [sx, sy, s] = P(A.cam, -1.0, 1.25, 1.3); glow(g, sx, sy, 1.8 * s, "rgba(255,200,120,1)", 0.75); });
    } },
  // 7 "Em 1938, a Alemanha estava cada vez mais dominada pelo regime nazista." — faixas vermelhas e marcha nas ruas
  { t0: 50.89, fade: 0.25, L: () => streetL("s7", { seed: 17, banner: true }), cam: dinT(50.89, [0, 1.4, -5, 40], [[53.15, [0, 2.0, -7, 42, -20]], [54.85, [0, 4.5, -12, 46, -60]]]), lite: GREY, act: (A, lt, u, T) => {
      marchF(A, (i) => v(SA, { jacket: mix(SA.jacket, "#000", (i % 4) * 0.04) }), lt, 4, 6, 6, 1.3, 1.25, 1.5, 320);
      crowd(A, 10, -8, 8, 1.2, 2.0, 70, (i) => ({ expr: i % 3 ? "nervous" : "neutral", look: 0 }), (i) => civ(i, 70), { dark: 0.25 });
      A.over((g) => caption(g, "ALEMANHA · 1938", T - 51.1, 2.5));
    } },
  // 8a "Hitler acumulava poder," — no gabinete, carimbando ordens
  { t0: 57.26, fade: 0.2, L: () => roomL("r8", "#a89070", { frames: 2 }), cam: mv([0, 1.3, -3.2, 38], [0, 1.3, -2.5, 34]), lite: { ...DAY, rdx: -1 }, act: (A, lt, u, T) => {
      A.sp("deskG", 0, 0, 1.6, { sc: 1 }); for (let i = 0; i < 5; i++) A.sp("doc", -0.6 + i * 0.3, 0.82 + i * 0.02, 1.55, { sc: 0.8 });
      const hit = (T - 58.4) % 0.45, up = T > 58.2 ? Math.max(0, 1 - hit / 0.15) : 0.3; A.a(v(HIT, { hat: "sidepart" }), 900, 0, 2.0, { mode: "sit", expr: "stern", prop: ["hammer", 1 - up] }, { y: 0.4 });
      A.over((g) => { if (T > 58.4) stamp(g, "DECRETO", T - 58.4, VW * 0.72, VH * 0.3, -0.16, 90); });
    } },
  // 8b "perseguia seus adversários" — Gestapo leva um homem à noite
  { t0: 58.93, fade: 0.15, L: () => streetL("s8b", { night: true, seed: 22 }), cam: hand(mv([-1, 1.5, -5, 40], [0.5, 1.4, -4, 36])), lite: { ...MOON, rim: "#ffd8a0" }, mood: ["#2a3050", 0.2], act: (A, lt, u, T) => {
      A.sp("staff", 3.2, 0, 4.5, { sc: 1 }); const k = clamp((T - 59.2) / 1.2);
      const x = lerp(-1.5, 1.6, smooth(k)); A.a(civ(5, 2), 81, x, 3.2, { expr: "fear", look: -1, armB: 1 }, { rot: -0.1 * k });
      A.a(GESTAPO, 82, x - 0.7, 3.0, { expr: "stern", facing: 1 }); A.a(v(GESTAPO, { cap: "#2a2420" }), 83, x + 0.7, 3.4, { expr: "stern", facing: -1 });
      A.sp("lamp", -4, 0, 3.8, { sc: 1.5 }); A.light((g) => { const [sx, sy, s] = P(A.cam, -4, 3.3, 3.8); glow(g, sx, sy, 2 * s, "rgba(255,200,120,1)", 0.6); });
    } },
  // 8c "e expandia o território alemão." — mapa: Áustria e Sudetos
  { t0: 60.33, fade: 0.2, L: () => mapL("m8", "olive"), cam: mv([2, 0.5, -24, 40], [2.5, 0.8, -20, 38]), act: (A, lt, u, T) => {
      hl(A, "GER", 1, "#5a4a3a", 0.55); hl(A, "AUT", (T - 60.45) / 0.5, "#9a1e16", 0.7); hl(A, "CZE", (T - 61.3) / 0.6, "#b0281e", 0.45);
      arrow(A, [11.5, 48.6], [15.5, 47.6], (T - 60.45) / 0.7, "#8a1e16", 0.3); arrow(A, [12.8, 51.0], [15.0, 50.4], (T - 61.3) / 0.7, "#8a1e16", 0.3);
      A.over((g) => caption(g, "1938 · ÁUSTRIA E SUDETOS", T - 60.6, 1.9));
    } },
  // 9 "Para muitos, ele era um líder admirado." — multidão com flores ao passar do carro
  { t0: 63.1, fade: 0.25, L: () => streetL("s9", { seed: 26, banner: true }), cam: mv([0, 1.6, -6, 42], [1.5, 1.7, -5.2, 40]), lite: DAY, bloom: 0.6, act: (A, lt, u, T) => {
      A.sp("staff", -6 + lt * 2.2, 0, 2.6, { sc: 1 }); A.a(v(HIT, { hat: "peaked", cap: "#5a4a34" }), 900, -6.4 + lt * 2.2, 2.65, { expr: "smile_closed", prop: ["fist", 0.8] }, { y: 0.75, sc: 0.9 });
      crowd(A, 18, -9, 9, 3.6, 5.5, 90, (i) => ({ expr: i % 2 ? "laugh" : "grin", look: 0.5, prop: i % 3 === 0 ? ["fist", 1] : undefined, wave: i % 4 === 1 ? 1 : undefined }), (i) => civ(i, 90));
      A.fx(4, (g, c) => flutter(g, c, lt, { n: 30, x0: -6, x1: 6, z0: 2, z1: 6, top: 5, cols: ["#e83a3a", "#f4f0e0", "#ffd060"], size: 0.07, fall: 0.6, seed: 9, loop: true }));
    } },
  // 10a "Para outros, representava uma ameaça" — uma família assustada atrás da janela
  { t0: 65.81, fade: 0.25, L: () => homeL("r10"), cam: mv([0, 1.5, -2.6, 38], [0.2, 1.5, -2.0, 34]), lite: { ...LAMP, rdx: 1 }, mood: ["#3a4a6a", 0.2], act: (A, lt, u, T) => {
      A.a(civ(2, 8), 101, -0.7, 2.0, { expr: "fear", look: 1 }); A.a(civ(5, 8), 102, 0.3, 2.1, { expr: "nervous", look: 1 }); A.a(kid(2, 8), 103, -0.2, 1.7, { expr: "sad", look: 1 }, { sc: 0.9 });
      A.light((g) => { const fl = 0.5 + 0.5 * Math.sin(lt * 13) * Math.sin(lt * 7); glow(g, VW * 0.8, VH * 0.35, 260, "rgba(255,120,80,1)", 0.18 * fl); });
    } },
  // 10b "que poderia levar toda a Europa à destruição." — o mapa pega fogo
  { t0: 68.43, fade: 0.25, L: () => mapL("m10", "ember"), cam: mv([1, 1.5, -30, 40], [1, 2, -36, 42]), act: (A, lt, u, T) => {
      const P0: [number, number][] = [[13.4, 52.5], [21, 52.2], [2.3, 48.8], [-0.1, 51.5], [4.4, 50.8], [12.5, 41.9], [30.5, 50.4], [37.6, 55.7], [23.7, 38], [18, 59.3], [10.7, 59.9], [20.5, 44.8], [14.4, 50], [16.4, 48.2]];
      P0.forEach(([lo, la], i) => pin(A, lo, la, T - 68.9 - i * 0.12, "fire"));
      A.light((g) => tint(g, "#ff6a2a", 0.1 * clamp((T - 70.6) / 0.5), "soft-light"));
    } },
  // 11 "Georg Elser estava entre aqueles que enxergavam o perigo." — todos vibram, ele não
  { t0: 71.85, fade: 0.25, L: () => streetL("s11", { seed: 29, banner: true }), cam: dinT(71.85, [0, 1.6, -6, 42], [[73.95, [0.1, 1.55, -2.0, 32]]]), lite: DAY, act: (A, lt, u, T) => {
      crowd(A, 22, -7, 7, 2.0, 4.4, 110, (i) => ({ expr: i % 2 ? "shout" : "grin", look: 0.3, prop: ["fist", 1] }), (i) => civ(i, 110), { dark: 0.1 });
      A.a(ELSER, 1, 0.1, 1.3, { expr: T > 73.9 ? "stern" : "nervous", look: -0.3, armB: 0, headTilt: -4 });
    } },
  // 12a "Nascido em 1903," — a aldeia de Hermaringen, filme antigo
  { t0: 75.89, fade: 0.3, L: () => loc(["#8a7a62", "#e0cca4"], { near: "#7a6a50", far: "#9a8a6a", kind: "grass", seed: 61, zFar: 200 }, [hillL("v12", 120, "#8a7a62", 4, 12, 2), forest("v12", 50, "oak", "#6a6a4a", 18, 4, { blur: 1.4, h: 12 }), city("v12", 22, { pal: ["#d8c8a8", "#c8b494", "#e0d0b0"], seed: 61, floors: [2, 2], hgt: [7, 9], roof: "gable", roofCol: "#8a5a3a", blur: 1 })]),
    cam: mv([0, 1.6, -5, 40], [0.5, 1.6, -4, 38]), lite: GOLD, act: (A, lt, u, T) => {
      A.a(civ(1, 12), 121, 0, 2.4, { expr: "smile", prop: ["baby", 1], look: 0.2 }); A.a(civ(0, 12), 122, 0.9, 2.6, { expr: "smile_closed", look: -1 });
      A.over((g) => { oldFilm(g, lt); caption(g, "1903 · HERMARINGEN, ALEMANHA", T - 76.3, 2.4); });
    } },
  // 12b "ele era um trabalhador habilidoso,"
  { t0: 77.38, fade: 0.25, L: () => shopL("o12"), cam: mv([-0.8, 1.5, -3.4, 42], [-0.3, 1.45, -2.8, 38]), lite: { ...DAY, rdx: 1 }, bloom: 0.6, act: (A, lt) => { elserBench(A, lt); sunbeam(A); A.sp("crate", 2.2, 0, 3.2, { sc: 1 }); } },
  // 12c "especializado em marcenaria." — close da bancada: aparas voando
  { t0: 79.73, fade: 0.15, L: () => shopL("o12"), cam: mv([1.2, 1.35, -1.2, 36], [0.9, 1.35, -0.6, 32]), lite: { ...DAY, rdx: 1 }, bloom: 0.6, act: (A, lt) => { elserBench(A, lt, 0, 2.4); sunbeam(A); } },
  // 13a "Levava uma vida simples" — pão e café na mesa da cozinha
  { t0: 81.83, fade: 0.3, L: () => homeL("r13"), cam: mv([0, 1.15, -2.8, 38], [0.3, 1.15, -2.2, 34]), lite: { ...DAY, rdx: 1, key: "#ffe8c8", ka: 0.1 }, act: (A, lt) => {
      A.sp("desk", 0, 0, 1.4, { sc: 0.85 }); A.a(ELSER, 1, 0, 1.75, { mode: "sit", expr: "smile_closed", prop: ["bread", 1], look: 0.2 }, { y: 0.3 }); sunbeam(A, 1.5, 3, 4, 0.2);
    } },
  // 13b "e não ocupava nenhuma posição importante na sociedade alemã." — passa despercebido entre senhores importantes
  { t0: 83.28, fade: 0.25, L: () => streetL("s13", { seed: 33 }), cam: mv([-2, 1.6, -6, 42], [1, 1.6, -6, 42]), lite: DAY, act: (A, lt) => {
      walkS(A, ELSER, 1, lt, -4, 2.2, 1.3, { expr: "neutral" });
      [[-1, 4.4, -1.2], [3, 4.0, -1.0], [6, 4.6, -1.3]].forEach(([x, z, vv], i) => walkS(A, v(civ(i, 50), { hat: "tophat", jacket: "#1e1e22", pants: "#3a3a40" }), 131 + i, lt, x, z, vv, { expr: "grin" }));
      A.a(v(SSOFF, {}), 135, 4.5, 3.0, { expr: "stern", look: -1 });
    } },
  // 14a "Mas acompanhava os acontecimentos políticos" — rádio e jornal
  { t0: 87.07, fade: 0.25, L: () => homeL("r14"), cam: mv([0.3, 1.15, -2.6, 36], [0.1, 1.15, -2.0, 32]), lite: LAMP, act: (A, lt, u, T) => {
      A.sp("desk", 0, 0, 1.4, { sc: 0.85 }); A.sp("radio", 0.8, 0.8, 1.35, { sc: 0.8 });
      A.a(ELSER, 1, -0.1, 1.75, { mode: "sit", expr: "nervous", prop: ["paper", 1], look: 0.8, headTilt: 10 }, { y: 0.3 });
      A.fx(1.3, (g, c) => { const [sx, sy, s] = P(c, 0.8, 1.6, 1.35); g.save(); g.strokeStyle = "rgba(255,240,200,0.5)"; g.lineWidth = 3; for (let k = 0; k < 3; k++) { const r = ((lt * 0.8 + k / 3) % 1) * 0.5 * s; g.globalAlpha = 1 - ((lt * 0.8 + k / 3) % 1); g.beginPath(); g.arc(sx, sy, r, -0.8, 0.8); g.stroke(); } g.restore(); });
    } },
  // 14b "e acreditava que Hitler estava conduzindo o país" — Hitler à frente de colunas que marcham
  { t0: 89.68, fade: 0.25, L: () => loc(["#4a4a5a", "#c8a888"], { near: "#5a5248", far: "#7a6e60", kind: "stone", seed: 91 }, [skyline("o14", 120, "#4a4048", "berlin", 4, 2), wall("o14", 30, "#b8a890", { h: 12, wid: 40 })]),
    cam: mv([0, 1.4, -6, 42], [0, 1.6, -7, 44]), lite: BACK, act: (A, lt) => {
      A.a(v(HIT, { hat: "peaked", cap: "#5a4a34" }), 900, 0, 2.6 - lt * 0.3, { mode: "march", phase: (lt * 1.2) % 1, expr: "stern" });
      marchF(A, (i) => sol(WEH, i), lt, 5, 7, 5, 0.3, 1.25, 1.5, 340);
    } },
  // 14c "para uma guerra devastadora." — visão: tanques e explosões
  { t0: 92.53, fade: 0.15, L: () => loc(["#2a1418", "#a04020"], { near: "#4a3428", far: "#6a4a34", kind: "mud", seed: 93, zFar: 300 }, [hillL("o14c", 120, "#3a2a2a", 3, 14, 2), forest("o14c", 50, "dead", "#000", 12, 3, { blur: 1, h: 9 })]),
    cam: hand(soco(mv([-2, 1.3, -6, 42], [1, 1.2, -4.8, 38]), [[0.95, 0.1]])), lite: NIGHTFIRE, bloom: 0.8, kicks: [[93.4, 12]], act: (A, lt, u, T) => {
      tank(A, "panzer", -10 + lt * 3, 12, { vel: 3, fire: T - 93.0 }); A.fx(25, (g, c) => blast(g, c, T - 93.4, 4, 0, 25, 4, 7)); A.fx(40, (g, c) => blast(g, c, T - 93.9, -8, 0, 40, 5, 9));
      A.fx(10, (g, c) => embers(g, c, lt, 0, 10, 20, 40, 10, 2));
    } },
  // 15a "Elser chegou a uma conclusão radical:" — à luz do lampião, pensando
  { t0: 94.76, fade: 0.25, L: () => homeL("r15"), cam: dinT(94.76, [0.3, 1.15, -2.6, 36], [[96.35, [0.1, 1.25, -1.4, 28]]]), lite: { ...LAMP, rdx: -1 }, mood: ["#3a3050", 0.15], act: (A, lt, u, T) => {
      A.sp("desk", 0, 0, 1.4, { sc: 0.85 }); A.sp("lamp", -0.9, 0.75, 1.3, { sc: 0.6 });
      A.a(ELSER, 1, 0.1, 1.75, { mode: "sit", expr: T > 96.3 ? "stern" : "nervous", look: -0.3, headTilt: -6 }, { y: 0.3 });
      A.light((g) => { const [sx, sy, s] = P(A.cam, -0.9, 1.25, 1.3); glow(g, sx, sy, 1.8 * s, "rgba(255,200,120,1)", 0.75); });
    } },
  // 15b "se Hitler e os principais líderes nazistas" — os quatro sob o holofote
  { t0: 96.78, fade: 0.2, L: () => loc(undefined, { near: "#1a1416", far: "#1a1416", kind: "stone", zFar: 10 }, [wall("o15", 6, "#2a1e1e", { h: 6, wid: 10 })], true), cam: dinT(96.78, [0, 1.5, -2.6, 36], [[98.3, [0, 1.55, -4.2, 42]]]), lite: BACK, bloom: 0.7, act: (A, lt, u, T) => {
      const xs = [-1.5, -0.5, 0.5, 1.5], os = [HIT, HIMMLER, GOERING, HESS];
      os.forEach((o, i) => { const on = i === 0 ? T > 96.9 : T > 98.3 + (i - 1) * 0.3; if (on) { A.a(o, 900 + i, xs[i], 2.2, { expr: "stern", look: 0 }); A.light((g) => { const [sx, sy, s] = P(A.cam, xs[i], 2.8, 2.2); g.save(); g.globalCompositeOperation = "lighter"; const gr = g.createLinearGradient(sx, 0, sx, sy + 1.4 * s); gr.addColorStop(0, "rgba(255,240,210,0.0)"); gr.addColorStop(1, "rgba(255,240,210,0.12)"); g.fillStyle = gr; g.beginPath(); g.moveTo(sx - 0.15 * s, 0); g.lineTo(sx + 0.15 * s, 0); g.lineTo(sx + 0.6 * s, sy + 1.5 * s); g.lineTo(sx - 0.6 * s, sy + 1.5 * s); g.fill(); g.restore(); }); } });
    } },
  // 15c "fossem eliminados," — as luzes se apagam uma a uma
  { t0: 99.78, fade: 0.1, L: () => loc(undefined, { near: "#1a1416", far: "#1a1416", kind: "stone", zFar: 10 }, [wall("o15", 6, "#2a1e1e", { h: 6, wid: 10 })], true), cam: mv([0, 1.55, -4.2, 42], [0, 1.55, -3.8, 40]), lite: BACK, act: (A, lt, u, T) => {
      const xs = [-1.5, -0.5, 0.5, 1.5], os = [HIT, HIMMLER, GOERING, HESS];
      os.forEach((o, i) => { const off = clamp((T - 100.15 - i * 0.18) / 0.15); A.a(o, 900 + i, xs[i], 2.2, { expr: off > 0 ? "shock" : "stern" }, { dark: off * 0.92, darkCol: "#050304", alpha: 1 - off * 0.85 }); });
    } },
  // 15d "talvez fosse possível impedir que aquela tragédia continuasse." — as nuvens de guerra se abrem
  { t0: 100.93, fade: 0.35, L: () => loc(["#4a5a7a", "#f0c898"], { near: "#6a7048", far: "#9aa070", kind: "grass", seed: 95, zFar: 300 }, [clouds("o15d", 240, ["#f4e0c8", "#5a6080"], 8, 30, 90, 20, 4), mtn("o15d", 220, "#6a7a96", 4, 50, true, 3), field("o15d", 14, "sunflower", "#e8b830", 5, 1.1, 30, 0.3)]),
    cam: mv([0, 1.4, -5, 42, 10], [0, 1.6, -6.5, 44, -10]), lite: GOLD, bloom: 0.8, act: (A, lt, u, T) => {
      const k = clamp((T - 103.6) / 1.2); A.light((g) => { sun(g, VW * 0.5, VH * 0.32, 40, "255,226,170"); rays(g, VW * 0.5, VH * 0.32, VW, 0.08 + 0.12 * k, "255,214,160", 20, lt); });
      A.light((g) => { g.fillStyle = `rgba(30,24,34,${0.55 * (1 - k)})`; g.fillRect(0, 0, VW, VH); });
    } },
  // 16 "E foi então que tomou uma decisão que mudaria sua vida para sempre." — ele se levanta
  { t0: 105.48, fade: 0.25, L: () => homeL("r15"), cam: dinT(105.48, [0.2, 1.15, -2.8, 38], [[107.1, [0.1, 1.5, -2.0, 34]], [108.3, [0.1, 1.6, -1.6, 30]]]), lite: { ...LAMP, rdx: -1 }, mood: ["#3a3050", 0.15], act: (A, lt, u, T) => {
      A.sp("desk", 0, 0, 1.4, { sc: 0.85 }); A.sp("lamp", -0.9, 0.75, 1.3, { sc: 0.6 }); const up = smooth(clamp((T - 106.9) / 0.6));
      A.a(ELSER, 1, 0.1, 1.75, up < 0.5 ? { mode: "sit", expr: "stern", look: 0 } : { expr: "stern", look: 0, armB: 0 }, { y: up < 0.5 ? 0.3 : 0 });
      A.light((g) => { const [sx, sy, s] = P(A.cam, -0.9, 1.25, 1.3); glow(g, sx, sy, 1.8 * s, "rgba(255,200,120,1)", 0.75); });
    } },
  // 17 "Ele tentaria matar Hitler sozinho." — sozinho numa estrada, a câmera se afasta muito
  { t0: 110.08, fade: 0.3, L: () => loc(["#2a2a4a", "#d08a6a"], { near: "#4a4038", far: "#6a5a48", kind: "mud", seed: 97, zFar: 300 }, [clouds("o17", 260, ["#e09a7a", "#3a3a5a"], 5, 40, 110, 16, 4), hillL("o17", 130, "#3a3448", 3, 12, 2), forest("o17", 60, "poplar", "#2a3028", 14, 9, { blur: 1.4, h: 13 })]),
    cam: dinT(110.08, [0, 1.5, -2.6, 36], [[111.85, [0, 4.5, -16, 46, -60]]]), lite: BACK, bloom: 0.8, act: (A, lt) => {
      A.a(ELSER_C, 1, 0, 1.4, { expr: "stern", look: 0 }); A.light((g) => { sun(g, VW * 0.5, VH * 0.5, 30, "255,200,150"); rays(g, VW * 0.5, VH * 0.5, VW * 0.8, 0.12, "255,190,140", 16, lt); });
    } },
  // 18a "Mas como um simples carpinteiro conseguiria chegar perto" — ele olha de longe o prédio vigiado
  { t0: 113.17, fade: 0.25, L: () => loc(["#5a6e8e", "#d8d0c0"], { near: "#6a6660", far: "#8a8478", kind: "stone", seed: 99 }, [wall("o18", 22, "#b8a88e", { h: 14, wid: 36, win: 10, winCol: "#4a5a6a" }), city("o18", 50, { pal: ["#9a8a76", "#a8987e"], seed: 99, blur: 2 })]),
    cam: mv([-3, 1.5, -5, 42], [-2.4, 1.5, -4.2, 40]), lite: GREY, act: (A, lt) => {
      A.a(ELSER_C, 1, -3.5, 1.6, { expr: "nervous", look: 1, facing: 1 });
      for (let i = 0; i < 6; i++) A.a(sol(v(SSOFF, { hat: "stahlhelm", cap: "#1e1e20", rifle: true }), i), 181 + i, -1 + i * 1.5, 12, { expr: "stern" });
    } },
  // 18b "de um dos homens mais protegidos do planeta?" — Hitler cercado de guardas
  { t0: 116.53, fade: 0.2, L: () => loc(["#5a6e8e", "#d8d0c0"], { near: "#6a6660", far: "#8a8478", kind: "stone", seed: 101 }, [wall("o18b", 20, "#c8b89e", { h: 14, wid: 36, win: 10, winCol: "#4a5a6a" })]),
    cam: dinT(116.53, [0, 1.0, -2.5, 40, 30], [[117.4, [0, 1.0, -4.0, 46, 40]]]), lite: DAY, act: (A, lt) => {
      walkF(A, v(HIT, { hat: "peaked", cap: "#5a4a34" }), 900, lt, 0, 3, [0, 5], [0, 3.6], { expr: "stern" });
      for (let i = 0; i < 10; i++) { const a = -0.25 + (i / 9) * (Math.PI + 0.5); walkF(A, sol(v(SSOFF, { hat: "stahlhelm", cap: "#1e1e20", rifle: true }), i), 191 + i, lt, 0, 3, [Math.cos(a) * 2.3, 5 + Math.sin(a) * 1.4], [Math.cos(a) * 2.3, 3.6 + Math.sin(a) * 1.4], { expr: "stern" }); }
    } },
  // 19 "A resposta estava em um evento que acontecia todos os anos." — o calendário passa ano a ano, sempre no 8 de novembro
  { t0: 119.37, fade: 0.25, L: () => roomL("r19", "#8a7a64"), cam: mv([0, 1.5, -3.8, 36], [0, 1.5, -3.4, 34]), lite: LAMP, act: (A, lt, u, T) => {
      const years = ["1934", "1935", "1936", "1937", "1938"], i = Math.min(4, Math.floor(Math.max(0, T - 121.4) / 0.35)); calPage(A, 0, 2.0, 1.2, "NOVEMBRO", "8", years[i]);
    } },
  // 20a "No dia 8 de novembro,"
  { t0: 123.77, fade: 0.2, L: () => roomL("r19", "#8a7a64"), cam: soco(mv([0, 1.5, -3.2, 34], [0, 1.5, -2.9, 32]), [[0.3, 0.08]]), lite: LAMP, act: (A) => { calPage(A, 0, 2.0, 1.2, "NOVEMBRO", "8", ""); } },
  // 20b "Hitler costumava participar de uma cerimônia" — chegada à cervejaria à noite
  { t0: 124.88, fade: 0.25, L: () => hallOutL("ho"), cam: mv([2, 1.6, -2, 40, -10], [0.5, 1.8, 0, 40, -20]), lite: MOON, bloom: 0.8, act: (A, lt) => {
      A.sp("staff", 1 - Math.max(0, 1.5 - lt) * 3, 0, 8, { sc: 1 }); walkF(A, v(HIT, { hat: "peaked", cap: "#5a4a34" }), 900, lt, 1.2, 3.0, [0.5, 7.5], [0, 10.5], { expr: "stern" });
      crowd(A, 14, -7, 7, 5.5, 7.0, 120, (i) => ({ expr: "shout", prop: ["fist", 1] }), (i) => PARTY(i), { dark: 0.35, darkCol: "#0a0a14" });
      for (const x of [-8, 8]) { A.sp("lamp", x, 0, 9, { sc: 1.6 }); A.light((g) => { const [sx, sy, s] = P(A.cam, x, 3.4, 9); glow(g, sx, sy, 2.6 * s, "rgba(255,200,120,1)", 0.6); }); }
    } },
  // 20c "no Bürgerbräukeller, uma cervejaria"
  { t0: 127.83, fade: 0.2, L: () => hallOutL("ho"), cam: mv([0, 4.2, -2, 40, -20], [0, 4.2, 1.5, 36, -20]), lite: MOON, bloom: 0.8, act: (A) => { for (const x of [-8, 8]) A.sp("lamp", x, 0, 9, { sc: 1.6 }); } },
  // 20d "localizada em Munique." — mapa
  { t0: 129.98, fade: 0.2, L: () => mapL("m20", "parch"), cam: mv([0, 1, -24, 40], [MX0, MY0, -12, 36]), act: (A, lt, u, T) => {
      hl(A, "GER", 1, "#8a7a5a", 0.45); pin(A, 11.58, 48.14, T - 130.9, "star", false, "#c42a22"); mapLabel(A, 11.58, 48.14, "Munique", T - 131.0);
    } },
  // 21a "O encontro celebrava o aniversário" — canecos erguidos no salão cheio
  { t0: 132.03, fade: 0.25, L: () => hallL("h1"), cam: mv([-2, 2.4, 0, 42, -20], [1, 2.6, 1.5, 42, -30]), lite: LAMP, bloom: 0.7, act: (A, lt) => hall(A, lt, { cheer: 0.8 }) },
  // 21b "da tentativa de golpe realizada pelos nazistas em 1923." — 1923, a marcha do golpe
  { t0: 134.18, fade: 0.3, L: () => streetL("s21", { sepia: true, seed: 41 }), cam: mv([0, 1.5, -6, 42], [0, 1.6, -5, 40]), lite: GREY, act: (A, lt, u, T) => {
      marchF(A, (i) => i === 2 ? v(HIT, { hat: "fedora", cap: "#3a3028", jacket: "#5a5040" }) : v(SA, { jacket: mix("#7a6a54", "#000", (i % 4) * 0.05), hat: i % 3 ? "cap" : "hair", hair: "#3a2a1e" }), lt, 4, 5, 6, 1.0, 1.3, 1.5, 360);
      for (let i = 0; i < 6; i++) A.a(v(GUARD1923, {}), 211 + i, -5 + i * 2, 11.5, { expr: "stern" });
      A.over((g) => { oldFilm(g, lt); caption(g, "MUNIQUE · 1923", T - 136.6, 1.9); });
    } },
  // 22 "Era uma tradição." — canecos se tocam
  { t0: 138.84, fade: 0.2, L: () => hallL("h1"), cam: mv([0.2, 1.3, 0.4, 34], [0.2, 1.35, 0.9, 32]), lite: LAMP, bloom: 0.7, act: (A, lt, u, T) => {
      hall(A, lt, { cheer: 0.3, expr: "laugh" }); const k = Math.sin(clamp((T - 139.3) / 0.4) * Math.PI);
      panel(A, 3.0, (w) => { w.g.save(); w.g.translate(-0.35 + 0.22 * k, 1.1); w.g.rotate(-0.25 * k); stein(w, 0, 0, 0.9); w.g.restore(); w.g.save(); w.g.translate(0.35 - 0.22 * k, 1.1); w.g.rotate(0.25 * k); stein(w, 0, 0, 0.9); w.g.restore(); });
    } },
  // 23a "Hitler fazia um discurso diante de integrantes importantes do partido"
  { t0: 140.12, fade: 0.25, L: () => hallL("h1"), cam: dinT(140.12, [0, 2.3, 4, 42, -10], [[141.0, [0, 2.0, 9.5, 38, -10]], [141.95, [-1.5, 2.6, 5.5, 44, -30]]]), lite: LAMP, bloom: 0.7, act: (A, lt) => hall(A, lt, { hitler: "speak" }) },
  // 23b "e, geralmente, permanecia bastante tempo no local." — o relógio da parede corre
  { t0: 143.88, fade: 0.2, L: () => hallL("h1"), cam: mv([4.4, 3.3, 9.6, 42, -10], [4.2, 3.4, 10.4, 40, -10]), lite: LAMP, bloom: 0.7, act: (A, lt, u, T) => {
      hall(A, lt, { hitler: "speak", noCrowdRows: [4] }); const m = 30 + Math.max(0, T - 144.4) * 55; wallClock(A, 3.6, 4.2, CZ - 0.2, 20 + Math.floor(m / 60), m % 60, 0.45);
    } },
  // 24 "Elser percebeu que aquela rotina poderia representar uma oportunidade única." — Elser, numa mesa do fundo
  { t0: 147.63, fade: 0.25, L: () => hallL("h1"), cam: dinT(147.63, [-3.4, 1.4, 2.5, 40], [[149.1, [-3.2, 1.45, 3.3, 34]], [150.95, [-3.05, 1.5, 4.1, 26]]]), lite: LAMP, bloom: 0.7, act: (A, lt, u, T) => {
      hall(A, lt, { noCrowdRows: [0, 1] }); A.a(ELSER, 1, -3.05, 6.2, { mode: "sit", expr: T > 150.9 ? "stern" : "neutral", look: 0.3, headTilt: -5 }, { y: 0.12 });
      if (T > 151.2) A.light((g) => { const [sx, sy, s] = P(A.cam, -2.95, 1.55, 6.2); glow(g, sx + 0.05 * s, sy, 0.15 * s, "rgba(255,240,200,1)", 0.8 * clamp((T - 151.2) / 0.2) * clamp((152.2 - T) / 0.4)); });
    } },
];
