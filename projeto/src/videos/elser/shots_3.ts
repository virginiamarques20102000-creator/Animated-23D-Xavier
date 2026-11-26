// 305 – 421 s: a explosão às 21h20, os escombros, Hitler já longe, a prisão em Constança, a Gestapo e as suspeitas.
import type { Shot } from "../ww2/types";
import { loc, wall, clouds, hillL, forest, city, skyline, MX, MY, ST } from "./places3";
import { LAMP, NIGHTFIRE, DAY, GOLD, BACK, GREY, MOON } from "../ww2/looks";
import { walkS, walkF, crowd, hl, arrow, pin, calPage, panel, hand, counter, civ, v, GESTAPO, fall, idle } from "../ww2/kit";
import { blast, dust, rubble, embers, shards } from "../ww2/fx";
import { stamp, tint, sun, rays } from "../ww2/engine";
import { hallL, hallOutL, streetL, shopL, roomL, cellL, borderL, mapL, mv, clockOver, column, mechanism, wallClock, podium, chandeliers, torchBeam, mapLabel, hlPoly, SUI, xMark, ceilingFall, dustAir, gearW,
  ELSER, ELSER_W, ELSER_C, ELSER_P, HIT, HIMMLER, GOERING, HESS, PARTY, WAITER, CUSTOMS, caption, bigText, P, glow, puff, VW, VH, clamp, lerp, smooth, easeOut, hash, mix, fire, smokeCol, din, dinT, soco } from "./ek";
import { hall, leaders, CX, CZ, PZ } from "./scenes";

const BOOM = 311.84; // "explodiu" (início medido no áudio)
const dark = () => loc(undefined, { near: "#120c08", far: "#120c08", kind: "none", zFar: 4 }, [], true);
const NIGHT = { ...MOON, rim: "#ffe0a8", key: "#7080a8", ka: 0.35 };
const OFFICE = (K: string) => roomL(K, "#7a7462", { win: true, map: true });
const INTER = (K: string) => roomL(K, "#3a3a3e", { dark: 0.45 });
/** o salão destruído: coluna partida, montes de entulho, fumaça, fogo pequeno */
const ruinHall = (A: import("../ww2/kit").Sc, lt: number, T: number, o: { people?: boolean } = {}) => {
  hall(A, lt, { dark: 0.55, empty: true, podium: false, tablesMaxZ: 7.5 });
  column(A, CX, CZ, { dark: 0.6, h: 2.6 });
  A.fx(CZ - 0.5, (g, c) => { rubble(g, c, 3, CX, 0, CZ - 0.5, 9, 7, 70, "#8a7a62"); fire(g, c, lt, CX - 2, 0, CZ - 0.8, 0.8, 3); fire(g, c, lt, CX + 3, 0, CZ - 1.5, 0.6, 5); smokeCol(g, c, lt, CX, 1, CZ - 0.4, { h: 10, w: 3, col: [60, 54, 52], a: 0.4, seed: 2, wind: 0.2 }); });
  A.fx(10, (g, c) => rubble(g, c, 3, -3, 0, 10, 7, 9, 50, "#7a6a54"));
  dustAir(A, lt, 0.05, 3, 14, 16);
  if (o.people) for (let i = 0; i < 4; i++) { const x = -5 + i * 2.6; A.a(i % 2 ? v(civ(i, 77), { hat: "cap", cap: "#4a4a4a", band: "#f2efe6" }) : PARTY(i), 601 + i, x, 6 + (i % 2) * 2.2, { expr: i % 2 ? "nervous" : "sad", look: 1, ...idle(lt, 601 + i) }, { dark: 0.3, darkCol: "#140c08" }); }
};
const train = (A: import("../ww2/kit").Sc, x: number, z: number, lt: number) => {
  A.sp("loco", x, 0, z, { sc: 1 }); for (let k = 1; k <= 4; k++) A.sp("wagonT", x - k * 15, 0, z, { sc: 1 });
  A.fx(z - 0.1, (g, c) => { for (let i = 0; i < 10; i++) { const a = (lt * 2 + hash(i)) % 1, [sx, sy, s] = P(c, x + 4 - a * 14, 5 + a * 3, z + 0.2); puff(g, sx, sy, (0.6 + a * 2) * s, [120, 118, 124], 0.35 * (1 - a)); } });
};

export const SHOTS_3: Shot[] = [
  // 58a "Às 21h20," — salão ainda com gente; o relógio salta para 21h20
  { t0: 305.48, fade: 0.25, L: () => hallL("h5"), cam: mv([0, 2.4, 3, 42, -10], [0, 2.3, 4.5, 40, -10]), lite: LAMP, bloom: 0.6, act: (A, lt, u, T) => {
      hall(A, lt, { full: 0.7, expr: "laugh" }); A.over((g) => clockOver(g, 21, 7 + 13 * easeOut(clamp((T - 305.7) / 0.6)), T - 305.6, 2.6, { r: 190, red: true }));
    } },
  // 58b "apenas treze minutos depois da saída de Hitler," — o púlpito vazio, a coluna pulsa
  { t0: 308.08, fade: 0.2, L: () => hallL("h5"), cam: mv([0.6, 1.9, 9.6, 38, -5], [0.9, 1.8, 10.6, 34, -5]), lite: LAMP, bloom: 0.6, act: (A, lt, u, T) => {
      hall(A, lt, { full: 0.6, noCrowdRows: [4, 3], col: { xray: 0.5 + 0.4 * ((lt * 2) % 1 < 0.2 ? 1 : 0), bomb: true } });
      A.over((g) => bigText(g, "13 MINUTOS DEPOIS", T - 308.6, 2.3, VH * 0.16, 90));
    } },
  // 58c "a bomba explodiu." — a explosão
  { t0: 311.08, fade: 0.15, L: () => hallL("h5"), cam: hand(soco(mv([0, 2.6, 1.5, 44, -10], [0, 2.7, 0.8, 46, -10]), [[BOOM - 311.08, 0.15]])), lite: LAMP, bloom: 0.95, kicks: [[BOOM, 22], [BOOM + 0.35, 10]], act: (A, lt, u, T) => {
      const k = T - BOOM; hall(A, lt, { full: 0.6, expr: k > 0 ? "shock" : "laugh", noCrowdRows: k > 0.2 ? [3, 4] : [], col: { bomb: true }, podium: k < 0.1 });
      A.fx(CZ - 0.6, (g, c) => blast(g, c, k, CX, 1.0, CZ - 0.6, 5, 11, { debris: 70, smoke: 1.4 })); ceilingFall(A, k - 0.15, -6, 8, 8, 15, 50, 21);
      A.light((g) => { if (k > 0 && k < 0.35) { g.fillStyle = `rgba(255,236,210,${0.8 * (1 - k / 0.35)})`; g.fillRect(0, 0, VW, VH); } if (k > 0) tint(g, "#ff7a2a", 0.25 * Math.exp(-k * 2), "soft-light"); });
    } },
  // 59 "A força da detonação destruiu parte do salão." — poeira, fogo, o salão partido
  { t0: 312.83, fade: 0.1, L: () => hallL("hr", { dark: 0.4 }), cam: hand(mv([-1, 2.0, 3, 42, -10], [0.5, 2.2, 4.5, 40, -10]), 0.05), lite: NIGHTFIRE, bloom: 0.8, kicks: [[314.35, 8]], act: (A, lt, u, T) => {
      ruinHall(A, lt, T); ceilingFall(A, T - 314.2, -4, 6, 7, 14, 30, 33);
      A.fx(CZ - 1, (g, c) => blast(g, c, T - 312.2, CX, 2, CZ - 1, 4, 13, { debris: 0, smoke: 0.6 }));
    } },
  // 60a "O teto desabou," — o teto cai sobre o salão
  { t0: 316.21, fade: 0.1, L: () => hallL("hr", { dark: 0.45 }), cam: hand(soco(mv([0, 1.5, 0, 46, 60], [0, 1.6, 0.5, 46, 70]), [[0.6, 0.1]]), 0.06), lite: NIGHTFIRE, kicks: [[316.8, 16]], act: (A, lt, u, T) => {
      ruinHall(A, lt, T); ceilingFall(A, T - 316.5, -7, 7, 4, 12, 70, 41);
      panel(A, 11, (w) => { const k = clamp((T - 316.6) / 0.8), rot = -0.5 * 9.81 * (k * 0.8) ** 2 / 3; w.g.save(); w.g.translate(-6, 7.5); w.g.rotate(rot); w.rect(0, 0, 12, 0.6, "#6a5038", 2.5); for (let x = 0.4; x < 12; x += 1.2) w.rect(x, -0.35, 0.3, 0.35, "#5a4030", 1.5); w.g.restore(); });
    } },
  // 60b "estruturas foram destruídas e pessoas foram atingidas pelos destroços." — a galeria cede; gente cai (sem sangue)
  { t0: 317.53, fade: 0.1, L: () => hallL("hr", { dark: 0.45 }), cam: hand(mv([-2, 1.8, 1, 44, -10], [1, 1.8, 2, 44, -10]), 0.05), lite: NIGHTFIRE, bloom: 0.8, kicks: [[318.65, 12], [319.6, 8]], act: (A, lt, u, T) => {
      ruinHall(A, lt, T); ceilingFall(A, T - 318.4, -6, 6, 5, 11, 40, 51);
      panel(A, 13.5, (w) => { const k = clamp((T - 318.65) / 1.0), rot = Math.min(1.2, 0.5 * 9.81 * k * k / 4); w.g.save(); w.g.translate(-10, 3.8); w.g.rotate(-rot); w.rect(0, 0, 9, 0.4, "#5a3a22", 2.5); for (let x = 0.2; x < 9; x += 0.5) w.rect(x, 0.4, 0.07, 0.95, "#6a4a2a", 0); w.g.restore(); });
      [[-3, 6, 319.6, -1], [-0.6, 7.2, 319.9, 1], [2.2, 6.4, 320.25, 1], [4.4, 8, 320.6, -1]].forEach(([x, z, th, d], i) => fall(A, PARTY(i + 2), 621 + i, x, z, T, th, { dir: d, blast: i % 2 === 0, expr: "fear" }));
    } },
  // 61 "Oito pessoas morreram e dezenas ficaram feridas." — socorristas com macas na poeira
  { t0: 322.45, fade: 0.3, L: () => hallL("hr", { dark: 0.5 }), cam: mv([0, 1.7, 0, 42, -10], [0.6, 1.7, 1.2, 40, -10]), lite: { ...LAMP, key: "#a8a0a0", ka: 0.2 }, mood: ["#5a5a6a", 0.2], act: (A, lt, u, T) => {
      ruinHall(A, lt, T, { people: true });
      for (let i = 0; i < 2; i++) { const z = 4 + i * 2.5, x0 = -6 + i * 3; walkS(A, v(civ(i, 91), { band: "#f2efe6", hat: "cap", cap: "#e8e4dc" }), 641 + i * 2, lt, x0, z, 0.9); walkS(A, v(civ(i + 3, 91), { band: "#f2efe6", hat: "cap", cap: "#e8e4dc" }), 642 + i * 2, lt, x0 - 2.2, z, 0.9);
        A.fx(z - 0.05, (g, c) => { const x = x0 + lt * 0.9 - 1.1, [ax, ay, s] = P(c, x - 1.0, 0.85, z), [bx, by] = P(c, x + 1.0, 0.85, z); g.strokeStyle = "#5a4a32"; g.lineWidth = 0.05 * s; g.beginPath(); g.moveTo(ax, ay); g.lineTo(bx, by); g.stroke(); g.fillStyle = "#e8e2d4"; g.fillRect(ax + 0.15 * s, ay - 0.12 * s, bx - ax - 0.3 * s, 0.16 * s); }); }
      A.over((g) => { counter(g, Math.round(8 * clamp((T - 322.6) / 0.6)), "MORTOS", T - 322.6, 2.3, VH * 0.22, "#f6efe0", 110); bigText(g, "DEZENAS DE FERIDOS", T - 324.1, 1.5, VH * 0.86, 60); });
    } },
  // 62 "O atentado havia acontecido." — o salão em ruínas, visto do alto
  { t0: 326.2, fade: 0.3, L: () => hallL("hr", { dark: 0.5 }), cam: mv([-3, 4.6, -2, 46, -150], [2, 4.6, -1, 46, -140]), lite: { ...LAMP, key: "#a8a0a0", ka: 0.2 }, mood: ["#5a5a6a", 0.2], act: (A, lt, u, T) => ruinHall(A, lt, T, { people: true }) },
  // 63 "A bomba funcionou exatamente como planejado." — onde estava a coluna
  { t0: 328.6, fade: 0.25, L: () => hallL("hr", { dark: 0.5 }), cam: dinT(328.6, [CX - 0.5, 1.5, CZ - 7, 40], [[329.55, [CX, 1.3, CZ - 4.6, 36]]]), lite: NIGHTFIRE, act: (A, lt, u, T) => ruinHall(A, lt, T) },
  // 64 "Mas Hitler não estava mais ali." — o trem noturno já corre para Berlim
  { t0: 331.8, fade: 0.25, L: () => loc(["#04060e", "#1a2238"], { near: "#1a1c22", far: "#24262e", kind: "grass", seed: 71, zFar: 300 }, [clouds("t64", 260, ["#2a3450", "#0a0e1c"], 7, 50, 120, 10, 5), hillL("t64", 120, "#101820", 3, 14, 2.5), forest("t64", 40, "pine", "#121a16", 20, 3, { blur: 1.4, h: 11 })]),
    cam: mv([0, 2.4, -14, 46, -10], [3, 2.4, -14, 46, -10]), lite: NIGHT, act: (A, lt) => {
      train(A, -10 + lt * 14, 8, lt); A.light((g) => { glow(g, VW * 0.85, VH * 0.18, 70, "rgba(220,230,255,1)", 0.45); g.fillStyle = "#f2f0e6"; g.beginPath(); g.arc(VW * 0.85, VH * 0.18, 22, 0, 7); g.fill(); });
      A.over((g) => caption(g, "TREM ESPECIAL PARA BERLIM", lt - 0.4, 2.2));
    } },
  // 65 "Ele havia escapado por apenas treze minutos."
  { t0: 334.4, fade: 0.25, L: () => dark(), cam: mv([0, 0, -6, 40], [0, 0, -5.2, 38]), lite: LAMP, act: (A, lt, u, T) => {
      mechanism(A, 0, lt, { tick: true, light: 0.3 }); const m = 7 + 13 * smooth(clamp((T - 335.6) / 0.8)); A.over((g) => { clockOver(g, 21, m, lt, 2.6, { red: true, r: 180, y: VH * 0.4 }); bigText(g, "13 MINUTOS", T - 336.2, 1.0, VH * 0.86, 100, "#ffd060"); });
    } },
  // 66a "Pense nisso:" — Elser, close no escuro
  { t0: 337.81, fade: 0.2, L: () => INTER("i66"), cam: mv([0, 1.6, -1.6, 32], [0, 1.6, -1.2, 28]), lite: BACK, mood: ["#3a3a5a", 0.2], act: (A, lt) => A.a(ELSER, 1, 0, 1.3, { expr: "stern", look: 0 }) },
  // 66b "meses de preparação," — as páginas do calendário voam
  { t0: 338.98, fade: 0.15, L: () => roomL("r66", "#8a7a64"), cam: mv([0, 1.5, -3.6, 36], [0, 1.5, -3.2, 34]), lite: LAMP, act: (A, lt, u, T) => {
      const ms = [["JANEIRO", "1939"], ["MARÇO", "1939"], ["MAIO", "1939"], ["JULHO", "1939"], ["SETEMBRO", "1939"], ["NOVEMBRO", "1939"]], i = Math.min(5, Math.floor(lt / 0.2)); calPage(A, 0, 2.0, 1.2, ms[i][0], "8", ms[i][1]);
    } },
  // 66c "dezenas de noites escondido," — a lanterna na coluna
  { t0: 340.08, fade: 0.15, L: () => hallL("h4", { dark: 0.9 }), cam: mv([CX - 1.8, 1.3, CZ - 7, 40], [CX - 1.4, 1.2, CZ - 6, 38]), lite: NIGHT, act: (A, lt) => {
      hall(A, lt, { dark: 0.85, empty: true, tablesMaxZ: 7.5 }); column(A, CX, CZ, { dark: 0.4, lt, dug: 0.7 });
      A.a(ELSER_W, 1, CX - 0.95, CZ - 0.6, { expr: "stern", crouch: 0.75, prop: ["hammer", ((lt * 1.6) % 1) < 0.2 ? 1 : 0.2], look: 1, facing: 1 }, { dark: 0.35, darkCol: "#140c08" }); torchBeam(A, CX - 0.5, 0.35, CZ - 0.9, -0.2, 1.4, 0.32);
    } },
  // 66d "um mecanismo cuidadosamente construído"
  { t0: 341.88, fade: 0.15, L: () => dark(), cam: mv([0.5, 0.3, -4.6, 40], [-0.2, 0.2, -3.8, 36]), lite: LAMP, act: (A, lt) => mechanism(A, 0, lt + 12, { tick: true }) },
  // 66e "e uma oportunidade praticamente perfeita." — Hitler no púlpito, a coluna atrás
  { t0: 344.68, fade: 0.2, L: () => hallL("h5"), cam: mv([0.4, 2.0, 8.8, 40, -10], [0.6, 1.9, 10.4, 36, -5]), lite: LAMP, bloom: 0.7, act: (A, lt) => hall(A, lt, { full: 1.2, hitler: "shout", noCrowdRows: [4], col: { xray: 0.5, bomb: true } }) },
  // 67 "Tudo terminou porque Hitler decidiu sair mais cedo." — ele sai pela porta, que se fecha
  { t0: 349.01, fade: 0.25, L: () => hallOutL("hn"), cam: dinT(349.01, [0, 1.8, -2, 40, -15], [[351.25, [0, 1.9, 0.5, 36, -15]]]), lite: MOON, bloom: 0.8, act: (A, lt, u, T) => {
      walkF(A, HIT, 900, lt, 0, 1.8, [0, 10.6], [0, 8.0], { expr: "stern" });
      A.fx(9.5, (g, c) => { const k = clamp((T - 351.3) / 0.4); const [ax, ay, s] = P(c, -2.6, 0, 10.9); g.fillStyle = "#3a2a1e"; g.fillRect(ax, ay - 4.2 * s, 2.6 * s * k, 4.2 * s); g.fillRect(ax + 5.2 * s - 2.6 * s * k, ay - 4.2 * s, 2.6 * s * k, 4.2 * s); });
    } },
  // 68 "Mas a história ainda tinha outra reviravolta." — chicote para a fronteira à noite
  { t0: 352.9, fade: 0.15, L: () => borderL("b68"), cam: (u, lt) => ({ x: -8 + 8 * easeOut(clamp(lt / 0.6)), y: 1.6, z: -5, fov: 42 + 10 * Math.exp(-lt * 4), shift: 0 }), lite: NIGHT, wx: undefined, act: (A, lt) => {
      walkS(A, ELSER_C, 1, lt, -1.5, 4, 0.9, { expr: "nervous" }); A.sp("barrier", 4, 0, 8, { sc: 1 });
      A.fx(9.5, (g, c) => { const [sx, sy, s] = P(c, 6, 2.2, 10); glow(g, sx, sy, 1.6 * s, "rgba(255,210,140,1)", 0.6); });
    } },
  // 69a "Enquanto a explosão acontecia em Munique," — clarão sobre a cidade ao longe
  { t0: 356.39, fade: 0.25, L: () => loc(["#04060e", "#2a2236"], { near: "#14141a", far: "#1e1e26", kind: "cobble", seed: 75, zFar: 300 }, [skyline("m69", 140, "#0e0e16", "generic", 5, 2, "#ffcf7a"), city("m69", 40, { pal: ["#24222c", "#2a2832"], seed: 75, lit: 0.4, blur: 1.4 })]),
    cam: mv([0, 3, -10, 44, -20], [0, 3.2, -8, 42, -20]), lite: NIGHT, act: (A, lt, u, T) => {
      A.fx(120, (g, c) => blast(g, c, T - 357.1, 6, 0, 120, 14, 3, { debris: 0 })); A.light((g) => { const k = T - 357.1; if (k > 0 && k < 1.2) glow(g, VW * 0.55, VH * 0.6, 500, "rgba(255,150,80,1)", 0.5 * (1 - k / 1.2)); });
      A.over((g) => caption(g, "MUNIQUE · 21h20", T - 356.6, 2.4));
    } },
  // 69b "Georg Elser já estava sendo interrogado em outro lugar."
  { t0: 359.08, fade: 0.25, L: () => OFFICE("o69"), cam: dinT(359.08, [0.5, 1.5, -3.2, 40], [[360.5, [0.2, 1.35, -2.0, 32]]]), lite: LAMP, act: (A, lt, u, T) => {
      A.sp("desk", 0, 0, 1.6, { sc: 1 }); A.sp("lamp", 0.9, 0.78, 1.55, { sc: 0.6 }); A.a(ELSER_C, 1, -0.6, 2.1, { mode: "sit", expr: "nervous", look: 1 }, { y: 0.3 });
      A.a(CUSTOMS, 691, 0.8, 2.3, { expr: "stern", look: -1, facing: -1, prop: ["paper", 1] }); A.a(v(CUSTOMS, { hat: "hair", hair: "#5a3a22" }), 692, 1.8, 2.8, { expr: "neutral", look: -1 });
      A.light((g) => { const [sx, sy, s] = P(A.cam, 0.9, 1.3, 1.55); glow(g, sx, sy, 2.2 * s, "rgba(255,210,140,1)", 0.7); });
    } },
  // 70 "Naquela mesma noite, ele havia tentado atravessar a fronteira para a Suíça." — mapa
  { t0: 362.75, fade: 0.25, L: () => mapL("m70", "night"), cam: mv([MX(10), MY(48), -14, 40], [MX(9.6), MY(47.6), -10, 38]), act: (A, lt, u, T) => {
      hl(A, "GER", 1, "#3e4a5e", 0.5); hlPoly(A, SUI, (T - 366.3) / 0.4, "#c8302a", 0.5);
      pin(A, 11.58, 48.14, T - 363.0, "dot"); mapLabel(A, 11.58, 48.14, "Munique", T - 363.0, "#e8f0ff"); arrow(A, [11.4, 48.1], [9.3, 47.7], (T - 364.8) / 1.0, "#ffd060", 0.18);
      pin(A, 9.17, 47.66, T - 365.6, "star", false, "#ffd060"); mapLabel(A, 9.17, 47.9, "Constança", T - 365.7, "#e8f0ff"); mapLabel(A, 7.8, 46.8, "SUÍÇA", T - 366.4, "#ffb0a0");
    } },
  // 71a "Por volta das 20h45," — a cerca na noite
  { t0: 367.26, fade: 0.25, L: () => borderL("b71"), cam: mv([0, 1.5, -5, 42], [0.5, 1.5, -4.2, 40]), lite: NIGHT, act: (A, lt, u, T) => {
      walkS(A, ELSER_C, 1, lt, -2.5, 4, 0.7, { expr: "nervous" }); A.over((g) => clockOver(g, 20, 44.5 + lt * 0.2, T - 367.8, 2.4, { r: 130, x: VW * 0.8, y: VH * 0.3 }));
    } },
  // 71b "antes mesmo da explosão, foi detido por agentes da alfândega em Constança." — lanternas; o agarram
  { t0: 370.23, fade: 0.2, L: () => borderL("b71"), cam: dinT(370.23, [0.5, 1.5, -4.5, 42], [[371.75, [0.4, 1.45, -3.0, 36]]]), lite: NIGHT, kicks: [[371.75, 6]], act: (A, lt, u, T) => {
      const k = clamp((T - 371.75) / 0.4); A.a(ELSER_C, 1, 0, 4, { expr: k > 0 ? "shock" : "nervous", look: 1, armB: k }, { rot: -0.05 * k });
      walkF(A, CUSTOMS, 711, lt, 0, 1.6, [3.5, 5.5], [0.9, 4.2], { expr: "shout", prop: ["torch", 1] }); walkF(A, v(CUSTOMS, { cap: "#2e3a2a" }), 712, lt, 0.2, 1.7, [-3.5, 5.0], [-0.9, 4.3], { expr: "stern" });
      A.light((g) => { const [sx, sy, s] = P(A.cam, lerp(3.5, 0.9, clamp(lt / 1.6)) + 0.4, 1.2, 4.3); g.save(); g.globalCompositeOperation = "lighter"; const gr = g.createRadialGradient(sx, sy, 0, sx, sy, 2.6 * s); gr.addColorStop(0, "rgba(255,240,200,0.5)"); gr.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = gr; g.fillRect(0, 0, VW, VH); g.restore(); });
      A.over((g) => caption(g, "CONSTANÇA · FRONTEIRA COM A SUÍÇA", T - 373.4, 1.9));
    } },
  // 72 "A princípio, sua prisão não parecia relacionada ao atentado." — rotina: o agente boceja, carimba
  { t0: 375.28, fade: 0.25, L: () => OFFICE("o72"), cam: mv([0, 1.5, -3.4, 40], [0.3, 1.45, -2.8, 36]), lite: LAMP, act: (A, lt, u, T) => {
      A.sp("desk", 0, 0, 1.6, { sc: 1 }); A.sp("lamp", 0.9, 0.78, 1.55, { sc: 0.6 }); A.a(ELSER_C, 1, -0.8, 2.1, { mode: "sit", expr: "nervous", look: 1 }, { y: 0.3 });
      A.a(CUSTOMS, 691, 0.6, 2.2, { mode: "sit", expr: lt % 2 < 0.8 ? "lick" : "neutral", look: -0.5, prop: ["hammer", (lt * 1.5) % 1 < 0.2 ? 1 : 0.3] }, { y: 0.3 });
      A.light((g) => { const [sx, sy, s] = P(A.cam, 0.9, 1.3, 1.55); glow(g, sx, sy, 2.2 * s, "rgba(255,210,140,1)", 0.7); });
    } },
  // 73a "Mas os agentes encontraram objetos suspeitos em seus pertences," — a mala aberta
  { t0: 379.13, fade: 0.2, L: () => OFFICE("o72"), cam: dinT(379.13, [0, 1.5, -3.0, 40], [[380.6, [0.2, 1.3, -1.6, 32]]]), lite: LAMP, act: (A, lt, u, T) => {
      A.sp("desk", 0, 0, 1.6, { sc: 1 }); A.sp("lamp", 0.9, 0.78, 1.55, { sc: 0.6 }); A.a(CUSTOMS, 691, 0.3, 2.2, { expr: T > 380.6 ? "shock" : "neutral", look: -0.4, crouch: 0.2 });
      panel(A, 1.5, (w) => { w.rect(-0.45, 0.82, 0.9, 0.14, "#6a4a2a", 2); const k = clamp((T - 379.5) / 0.5); w.g.save(); w.g.translate(-0.45, 0.96); w.g.rotate(k * 1.2); w.rect(0, 0, 0.9, 0.1, "#7a5432", 2); w.g.restore(); }, { dx: 0 });
      A.light((g) => { const [sx, sy, s] = P(A.cam, 0.9, 1.3, 1.55); glow(g, sx, sy, 2.2 * s, "rgba(255,210,140,1)", 0.7); });
    } },
  // 73b "incluindo peças relacionadas a mecanismos de explosivos" — close: engrenagens, detonador, fio
  { t0: 382.36, fade: 0.2, L: () => dark(), cam: mv([0, 0.1, -6.2, 40], [0.2, 0.1, -5.4, 36]), lite: LAMP, act: (A, lt, u, T) => {
      panel(A, 0, (w) => { w.rect(-5, -3, 10, 6, w.vgrad(-2, 2, "#3a2616", "#6a4a2c"), 0); for (let k = 0; k < 8; k++) w.line([[-3, -2 + k * 0.5], [3, -2 + k * 0.5]], 1, "rgba(0,0,0,0.25)");
        const items = (n: number) => T > 382.9 + n * 0.45; if (items(0)) gearW(w, -0.9, 0.3, 0.42, 14, 0.2); if (items(1)) gearW(w, -0.2, -0.45, 0.26, 9, 0.7); if (items(2)) { w.rect(0.4, 0.0, 0.7, 0.4, "#5a5a60", 2); w.line([[0.75, 0.4], [0.95, 0.8], [1.3, 0.7]], 3, "#b3221c"); }
        if (items(3)) for (let k = 0; k < 3; k++) w.rect(0.7 + k * 0.25, -0.95, 0.18, 0.7, "#c8a060", 1.6); });
    } },
  // 73c "e uma imagem do Bürgerbräukeller." — o cartão-postal
  { t0: 386.33, fade: 0.2, L: () => dark(), cam: soco(mv([0, 0, -3.4, 40], [0, 0, -2.8, 36]), [[0.4, 0.08]]), lite: LAMP, act: (A, lt, u, T) => {
      panel(A, 0, (w) => { w.rect(-3, -2, 6, 4, w.vgrad(-2, 2, "#3a2616", "#6a4a2c"), 0); w.g.save(); w.g.rotate(-0.06); w.rect(-1.4, -0.9, 2.8, 1.8, "#efe6cc", 3); w.rect(-1.25, -0.6, 2.5, 1.35, "#8a7a62", 1.5);
        w.rect(-1.0, -0.6, 2.0, 0.9, "#c8b49a", 1.5); for (let i = 0; i < 6; i++) w.rect(-0.85 + i * 0.32, -0.1, 0.16, 0.22, "#5a6a7a", 0.8); w.rect(-0.85, 0.12, 1.7, 0.14, "#1e1612", 0); w.text("BÜRGERBRÄUKELLER", 0, 0.19, 0.1, "#e8d8b0"); w.text("MÜNCHEN", 0, -0.75, 0.1, "#3a2a1c"); w.g.restore(); });
      A.light((g) => { const k = T - 387.35; if (k > 0) glow(g, VW / 2, VH / 2, 600, "rgba(255,60,40,1)", 0.12 * clamp(k / 0.3)); });
    } },
  // 74 "Quando a notícia da explosão chegou, as suspeitas aumentaram." — o telefone; todos se viram para ele
  { t0: 388.99, fade: 0.25, L: () => OFFICE("o72"), cam: dinT(388.99, [0.6, 1.5, -3.4, 40], [[391.1, [-0.5, 1.5, -2.0, 32]]]), lite: LAMP, mood: ["#4a3a5a", 0.12], act: (A, lt, u, T) => {
      A.sp("desk", 0, 0, 1.6, { sc: 1 }); A.sp("lamp", 0.9, 0.78, 1.55, { sc: 0.6 }); A.a(ELSER_C, 1, -0.8, 2.1, { mode: "sit", expr: T > 391 ? "fear" : "nervous", look: 1 }, { y: 0.3 });
      A.a(CUSTOMS, 691, 0.6, 2.2, { expr: T > 390.4 ? "shock" : "neutral", look: T > 391 ? -1 : 0, prop: ["paper", 1] }); A.a(v(CUSTOMS, { hat: "hair", hair: "#5a3a22" }), 692, 1.6, 2.8, { expr: T > 391 ? "stern" : "neutral", look: -1 });
      A.over((g) => { const k = T - 389.1; if (k < 0 || k > 1.4) return; g.save(); g.font = `bold 70px "DejaVu Sans", sans-serif`; g.fillStyle = "#f6efe0"; g.strokeStyle = "#140a08"; g.lineWidth = 8; g.textAlign = "center"; const sh = (Math.floor(k * 20) % 2) * 6; g.strokeText("TRRRIM!", VW * 0.74 + sh, VH * 0.22); g.fillText("TRRRIM!", VW * 0.74 + sh, VH * 0.22); g.restore(); });
      A.light((g) => { const [sx, sy, s] = P(A.cam, 0.9, 1.3, 1.55); glow(g, sx, sy, 2.2 * s, "rgba(255,210,140,1)", 0.7); });
    } },
  // 75 "Elser acabou sendo identificado como o responsável." — a foto de ficha, o carimbo
  { t0: 392.76, fade: 0.2, L: () => dark(), cam: mv([0, 0, -7.2, 40], [0, 0, -6.4, 36]), lite: LAMP, act: (A, lt, u, T) => {
      panel(A, 0.2, (w) => { w.rect(-6, -4, 12, 8, "#2a221c", 0); w.rect(-1.1, -1.3, 2.2, 2.6, "#efe6cc", 3); w.rect(-0.8, -0.4, 1.6, 1.5, "#9a9488", 1.5); w.text("GEORG ELSER", 0, -0.75, 0.16, "#2a1d16"); w.text("* 4.1.1903", 0, -1.05, 0.1, "#2a1d16"); });
      A.a(ELSER_P, 1, 0, 0.15, { expr: "neutral", look: 0 }, { y: -0.45, sc: 0.62 });
      A.over((g) => { if (T > 394.7) stamp(g, "RESPONSÁVEL", T - 394.7, VW * 0.66, VH * 0.86, -0.16, 100); });
    } },
  // 76a "A Gestapo, a polícia secreta nazista," — chegam de carro à noite
  { t0: 396.49, fade: 0.25, L: () => streetL("s76", { night: true, seed: 81 }), cam: mv([-1, 1.4, -5, 42], [0.5, 1.4, -4.2, 40]), lite: { ...MOON, rim: "#ffd8a0" }, wx: ["rain", 200, 0.35], act: (A, lt) => {
      const x = Math.min(1.5, -6 + lt * 5); A.sp("staff", x, 0, 5, { sc: 1 }); for (let i = 0; i < 3; i++) walkF(A, v(GESTAPO, { jacket: ["#1e1e1e", "#26262a", "#2a2420"][i] }), 761 + i, lt, 1.4 + i * 0.2, 2.8, [x - 1 + i * 1.2, 4.2], [-1.5 + i * 1.5, 2.6], { expr: "stern" });
      A.sp("lamp", -4, 0, 3.8, { sc: 1.5 }); A.light((g) => { const [sx, sy, s] = P(A.cam, -4, 3.3, 3.8); glow(g, sx, sy, 2 * s, "rgba(255,200,120,1)", 0.6); });
    } },
  // 76b "iniciou uma investigação brutal." — a sala de interrogatório, a lâmpada balança
  { t0: 399.18, fade: 0.2, L: () => INTER("i76"), cam: mv([0, 1.5, -3.2, 40], [0.2, 1.45, -2.6, 36]), lite: { ...LAMP, rdx: 0, rdy: -1 }, mood: ["#3a3a5a", 0.2], kicks: [[400.65, 8]], act: (A, lt, u, T) => {
      const sw = 0.25 * Math.sin(lt * 2.2); A.sp("desk", 0, 0, 1.6, { sc: 1 }); A.a(ELSER_P, 1, 0, 2.2, { mode: "sit", expr: "fear", look: 0.4 }, { y: 0.3 });
      A.a(GESTAPO, 762, -1.2, 2.0, { expr: "shout", look: 1, facing: 1, prop: ["fist", T > 400.6 ? 1 : 0.3] }); A.a(v(GESTAPO, { hat: "hair", hair: "#3a2a1e" }), 763, 1.3, 2.4, { expr: "stern", look: -1 });
      A.light((g) => { const [sx, sy, s] = P(A.cam, Math.sin(sw) * 1.2, 2.9, 1.8); g.strokeStyle = "#141414"; g.lineWidth = 3; const [tx, ty] = P(A.cam, 0, 4, 1.8); g.beginPath(); g.moveTo(tx, ty); g.lineTo(sx, sy); g.stroke(); glow(g, sx, sy, 3.2 * s, "rgba(255,236,190,1)", 0.65); });
      A.light((g) => { const gr = g.createRadialGradient(VW / 2, VH * 0.35, 100, VW / 2, VH * 0.45, VW * 0.6); gr.addColorStop(0, "rgba(0,0,0,0)"); gr.addColorStop(1, "rgba(0,0,0,0.6)"); g.fillStyle = gr; g.fillRect(0, 0, VW, VH); });
    } },
  // 77a "Os líderes do regime não queriam acreditar que um homem comum" — Hitler e Himmler, furiosos
  { t0: 401.74, fade: 0.25, L: () => roomL("r77", "#8a7a62", { frames: 2 }), cam: mv([0, 1.5, -3.6, 40], [0, 1.5, -3.0, 36]), lite: { ...DAY, rdx: -1 }, kicks: [[403.45, 10]], act: (A, lt, u, T) => {
      A.sp("deskG", 0, 0, 1.6, { sc: 1 }); A.a(HIT, 900, -0.6, 2.2, { expr: T > 403.4 ? "shout" : "stern", look: 0.4, prop: ["hammer", T > 403.4 && T < 403.8 ? 1 : 0.2] }); A.a(HIMMLER, 901, 0.8, 2.3, { expr: "nervous", look: -1 });
      A.over((g) => { if (T > 405.6) stamp(g, "SOZINHO?", T - 405.6, VW * 0.72, VH * 0.25, -0.12, 90); });
    } },
  // 77b "tivesse conseguido planejar sozinho uma operação daquela dimensão." — a planta do salão, enorme
  { t0: 406.13, fade: 0.2, L: () => hallL("hr", { dark: 0.5 }), cam: mv([-2, 4.6, -3, 46, -150], [2, 4.8, -2, 48, -150]), lite: NIGHTFIRE, act: (A, lt, u, T) => {
      ruinHall(A, lt, T); A.a(ELSER_P, 1, 0, 2, { expr: "neutral" }, { sc: 0.9 }); A.over((g) => bigText(g, "UM SÓ HOMEM?", T - 407.6, 1.6, VH * 0.2, 80));
    } },
  // 78a "A primeira suspeita era de que existisse uma organização poderosa por trás dele," — sombras gigantes atrás dele
  { t0: 409.81, fade: 0.25, L: () => INTER("i78"), cam: dinT(409.81, [0, 1.6, -2.4, 38], [[413.0, [0, 1.9, -4.4, 44]]]), lite: BACK, mood: ["#3a3a5a", 0.25], act: (A, lt, u, T) => {
      A.a(ELSER_P, 1, 0, 1.6, { expr: "nervous", look: 0 });
      for (let i = 0; i < 5; i++) { const k = clamp((T - 412.2 - i * 0.25) / 0.5); if (k > 0) A.a(v(GESTAPO, { jacket: "#000000" }), 781 + i, -2.4 + i * 1.2, 3.6 + (i % 2) * 0.4, { expr: "stern" }, { sc: 1.5, dark: 1, darkCol: "#050506", alpha: 0.85 * k }); }
    } },
  // 78b "talvez até agentes britânicos envolvidos." — mapa: uma seta de Londres a Munique, com interrogação
  { t0: 414.58, fade: 0.2, L: () => mapL("m78", "steel"), cam: mv([MX(5), MY(50), -26, 40], [MX(5.5), MY(50), -22, 38]), act: (A, lt, u, T) => {
      hl(A, "UK", (T - 415.25) / 0.4, "#2a5aa8", 0.5); hl(A, "GER", 1, "#5a5a5a", 0.4); arrow(A, [-0.1, 51.5], [11.4, 48.2], (T - 415.6) / 0.9, "#2a5aa8", 0.28);
      mapLabel(A, -0.1, 51.5, "Londres", T - 415.3); pin(A, 11.58, 48.14, T - 414.8, "dot"); A.over((g) => bigText(g, "?", T - 416.2, 1.4, VH * 0.4, 200, "#ffd060"));
    } },
  // 79 "Mas a verdade era muito mais impressionante." — o refletor revela: ele está sozinho
  { t0: 417.64, fade: 0.25, L: () => INTER("i79"), cam: dinT(417.64, [0, 1.8, -4.4, 44], [[419.5, [0, 1.55, -2.0, 32]]]), lite: BACK, act: (A, lt, u, T) => {
      A.a(ELSER_P, 1, 0, 1.6, { expr: "stern", look: 0 }); const k = clamp((T - 418.0) / 0.3);
      A.light((g) => { const [sx, sy, s] = P(A.cam, 0, 1.6, 1.6); g.save(); g.fillStyle = `rgba(0,0,0,${0.55 * k})`; g.fillRect(0, 0, VW, VH); g.globalCompositeOperation = "lighter"; const gr = g.createRadialGradient(sx, sy, 0.3 * s, sx, sy, 1.6 * s); gr.addColorStop(0, `rgba(255,240,210,${0.35 * k})`); gr.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = gr; g.fillRect(0, 0, VW, VH); g.restore(); });
    } },
];
