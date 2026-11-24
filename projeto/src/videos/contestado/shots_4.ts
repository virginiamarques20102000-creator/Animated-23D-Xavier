// 441 – 635.6 s: hunger and disease, Santa Maria destroyed, flight and persecution, the vaqueanos, Adeodato, the end, the border treaty,
// who really won, the toll, the irony, and the closing on the land the families only wanted to keep.
import { VW, VH, P, glow, fire, smokeCol, puff, clamp, lerp, smooth, easeOut, easeIn, hash, rays, sun } from "./engine";
import { Sc, mv, path, hand, walkF, walkS, runS, marchF, marchCol, crowd, flag, signing, panel, caption, bigText, counter, fall, calPage, chapter } from "./kit";
import { blast, scorch, embers, flutter, sparks, lensFlare, glint, birds, dust, rubble, bounce, coins } from "./fx";
import { cab, mulher, crianca, cabArm, sold, MONGE, ADEODATO, POLIT, OPER, VAQ, EXEC, FARQUHAR, SETEMBRINO, OFICIAL, v, train, railsX, mapaSul, hlSul, marca, rota, MST, CONTEST, lantern, halo } from "./props";
import { plat, mata, sala, cidade } from "./lugares";
import { DAY, GOLD, BACK, GREY, NIGHTFIRE, MOON, LAMP, COLD } from "./looks";
import { STAMP, chimney, PAI, MAE, FILHO, FILHA, AVO, familia } from "./shots_1";
import { reduto } from "./shots_3";
import type { Shot } from "./types";

const STA: [number, number] = [-50.9, -26.85];
const crosses = (A: Sc, n: number, x0: number, x1: number, z0: number, z1: number, seed = 3) => { for (let i = 0; i < n; i++) A.sp("cruz", lerp(x0, x1, hash(seed + i * 7.1)), 0, lerp(z0, z1, hash(seed + i * 3.3)), { sc: 0.32 + hash(i) * 0.08, rot: (hash(i + 5) - 0.5) * 0.12 }); };

export const SHOTS_4: Shot[] = [
  // 76a "Sem comida suficiente, sem medicamentos e sem condições de escapar," — an empty pot scraped by a child; the guards' fires on the ridge
  { t0: 440.99, fade: 0.2, L: () => plat("r0", "storm", { dense: 0.6 }), lite: COLD, cam: mv([0.4, 1.0, -2.6, 36, 40], [0.1, 1.0, -2.0, 32, 40]), mood: ["#7a8090", 0.25],
    act: (A, lt, u, T) => { A.sp("panela", 0, 0, 1.8, { sc: 1.1 }); A.a(crianca(3, 44), 1500, -0.6, 2.2, { expr: "sad", look: 0.6, mode: "sit", crouch: 0.5 }); A.a(mulher(3, 44), 1501, 0.8, 2.4, { expr: "sad", look: -0.5 });
      for (let i = 0; i < 4; i++) lantern(A, -10 + i * 6, 3.2, 30, lt + i, 0.8); } },
  // 76b "milhares de pessoas começaram a enfrentar a fome e as doenças." — the sick lie under blankets in the rain-soaked chapel
  { t0: 445.08, fade: 0.25, L: () => sala("r1", "#4a4440", { floor: ["#1e1a16", "#2a241e"], win: 2, winCol: "#6a7a8a" }), lite: COLD, cam: mv([-2, 1.8, -5, 40, -40], [1.5, 1.7, -4.6, 38, -40]), mood: ["#7a8494", 0.3],
    act: (A, lt) => { for (let i = 0; i < 4; i++) { A.sp("bed", -3 + i * 2, 0, 2.4 + (i % 2) * 0.6, { sc: 0.9 }); A.a(i % 2 ? mulher(i, 45) : cab(i, 45), 1510 + i, -3.1 + i * 2, 2.4 + (i % 2) * 0.6, { expr: "dazed", blink: 0.5 }, { rot: -Math.PI / 2, y: 0.7, shadow: 0, noCast: true }); }
      A.a(mulher(6, 45), 1520, 0.9, 3.4, { expr: "sad", look: -0.6, prop: ["bread", 0] }); A.sp("candle", 2.2, 0, 2.0); lantern(A, 2.2, 0.48, 2.0, lt, 0.7); } },
  // 77 "Um dos maiores redutos era Santa Maria, que chegou a reunir milhares de sertanejos." — the great redoubt from above, full of people
  { t0: 450.09, fade: 0.3, L: () => plat("r2", "gold", { dense: 0.8 }), lite: GOLD, bloom: 0.8, cam: path([[0, [-8, 12, -16, 48, -300]], [1, [6, 10, -12, 46, -260]]]),
    act: (A, lt, u, T) => { reduto(A, lt, 6, { n: 8 }); for (let i = 0; i < 9; i++) A.sp(i % 2 ? "rancho" : "casa", -22 + i * 5.6, 0, 20 + (i % 3) * 3, { sc: 0.8 });
      for (let i = 0; i < 60; i++) A.a(i % 3 ? cab(i, 46) : mulher(i, 46), 1530 + i, -18 + hash(i) * 36, 6 + hash(i + 3) * 18, { mode: i % 4 === 0 ? "stroll" : "stand", phase: (lt + i * 0.2) % 1, expr: "neutral" });
      A.over((g) => caption(g, "REDUTO DE SANTA MARIA", T - 451.6, 3.3)); } },
  // 78a "Mas, em 1915, depois de intensas operações militares," — night barrage: a row of guns fires in sequence
  { t0: 455.57, fade: 0.25, L: () => plat("r3", "night", { dense: 0.6 }), lite: NIGHTFIRE, bloom: 1.1, kicks: [[457.3, 5], [458.05, 5], [458.55, 6], [459.15, 6]], cam: mv([-6, 1.4, -6, 42], [4, 1.4, -6, 42], (x) => x),
    act: (A, lt, u, T) => { const shots = [457.3, 458.05, 458.55, 459.15];
      shots.forEach((t0, i) => { const x = -8 + i * 5, fa = T - t0, rec = fa > 0 && fa < 1 ? Math.exp(-fa * 6) * 0.35 : 0; A.sp("cannon", x - rec, 0, 4); A.a(sold(i), 1600 + i, x - 1.8, 4.6, { expr: "stern", look: 1, armB: fa > 0 && fa < 0.4 ? 1 : 0 });
        A.fx(3.95, (g, c) => { if (fa < 0 || fa > 2) return; const [mx, my, ms] = P(c, x + 2.8, 2.0, 3.95); if (fa < 0.12) { glow(g, mx, my, 6 * ms, "rgba(255,210,130,1)", 1); } for (let k = 0; k < 6; k++) puff(g, mx + (fa * 3 + k * 0.4) * ms, my - fa * ms, (0.4 + fa * 1.2) * ms, [120, 110, 104], 0.5 * clamp(1 - fa / 2)); }); });
      A.over((g) => caption(g, "SANTA MARIA · 1915", T - 455.9, 3.0)); } },
  // 78b "aquela comunidade foi destruída." — shells rain on Santa Maria; the chapel collapses in fire
  { t0: 459.73, fade: 0.1, tr: "flash", L: () => plat("r4", "fire", { dense: 0.6 }), lite: NIGHTFIRE, bloom: 1.3, kicks: [[460.0, 8], [460.7, 7], [461.7, 11]], wx: ["ash", 160, 0.6], cam: hand(path([[0, [0, 2.6, -9, 46, -40]], [1, [0, 2.0, -7, 44, -20]]]), 0.07),
    act: (A, lt, u, T) => { reduto(A, lt, 2, { smoke: false, n: 8 });
      A.fx(4, (g, c) => { blast(g, c, T - 460.0, -7, 0, 8, 2.8, 2); blast(g, c, T - 460.7, 7, 0, 9, 2.8, 4); blast(g, c, T - 461.7, 0, 0, 8.2, 3.6, 6); if (T > 461.7) rubble(g, c, T - 461.7, 0, 1, 8, 6, 3, 40, "#e8dcc0");
        for (const [x, z, t0] of [[-7, 8, 460.2], [7, 9, 460.9], [0, 8.3, 461.9], [-12, 7, 461], [12, 8, 461.4]]) if (T > t0) fire(g, c, lt, x, 0, z, 2.6, x + 3); embers(g, c, lt, 0, 8, 26, 80, 12, 5); }); } },
  // 79 "O lugar que havia representado esperança para tantas famílias se transformou em cenário de morte e desespero." — dawn over the smoking ruins; a broken cross; ash falls
  { t0: 462.88, fade: 0.4, L: () => plat("r5", "grey", { dense: 0.4, kind: "rubble" }), lite: GREY, wx: ["ash", 120, 0.5], cam: path([[0, [3, 1.4, -4, 40]], [1, [-1.5, 1.5, -3.2, 36]]]), mood: ["#9a9aa0", 0.3], sat: 0.7,
    act: (A, lt, u, T) => { A.sp("cruz", 0.4, 0, 3.2, { sc: 0.6, rot: 0.35 }); A.fx(6, (g, c) => { for (let i = 0; i < 6; i++) smokeCol(g, c, lt, -10 + i * 4, 0.5, 8 + (i % 2) * 4, { h: 12, w: 1.6, col: [70, 66, 66], a: 0.5, seed: i }); });
      for (let i = 0; i < 5; i++) panel(A, 7 + i * 1.3, (w) => { const x = -9 + i * 4.4; w.poly([[x - 1.2, 0], [x + 1.4, 0], [x + 1.2, 1.6], [x + 0.4, 2.4], [x - 0.6, 1.2]], "#2a221e", 2); w.line([[x - 0.6, 1.2], [x + 0.2, 3.2]], 6, "#1e1814"); });
      A.a(mulher(2, 47), 1620, -1.6, 2.6, { expr: "sad", look: 0.6, crouch: 0.6 }); A.over((g) => { if (T > 468.2) STAMP(g, "MORTE E DESESPERO", T - 468.2, VW * 0.5, VH * 0.2, "#c42a22", 58); }); } },
  // 80 "Muitos morreram." — a field of crosses at dusk, hats laid on them
  { t0: 470.11, fade: 0.25, L: () => plat("r6", "dusk", { dense: 0.6 }), lite: BACK, bloom: 0.9, cam: mv([0, 1.0, -3, 38, 40], [0, 1.4, -5, 42, 20]), sat: 0.8,
    act: (A, lt) => { crosses(A, 40, -12, 12, 3, 16, 5); A.light((g) => { sun(g, VW * 0.5, VH * 0.42, 30, "255,170,120"); rays(g, VW * 0.5, VH * 0.42, VW, 0.14, "255,170,120", 20, lt); }); } },
  // 81 "Outros fugiram para as matas." — figures vanish into the dark forest
  { t0: 471.55, fade: 0.15, tr: "whip", L: () => mata("r7", "night"), lite: MOON, cam: (u, lt) => ({ x: lt * 1.8, y: 1.4, z: -4, fov: 40, shift: 0 }),
    act: (A, lt) => { for (let i = 0; i < 7; i++) runS(A, i % 3 ? cab(i, 48) : mulher(i, 48), 1630 + i, lt, -3 - i * 1.3, 3.5 + (i % 3) * 1.2, 2.4, { expr: "fear" }, { dark: 0.4, darkCol: "#0e1420" }); } },
  // 82a "Famílias foram separadas" — a mother reaches for her son as soldiers lead them apart
  { t0: 473.84, fade: 0.2, L: () => plat("r8", "storm", { dense: 0.6 }), lite: COLD, wx: ["rain", 200, 0.4], cam: mv([0, 1.4, -3.4, 38], [0, 1.45, -2.6, 34]), mood: ["#7a8494", 0.25],
    act: (A, lt, u, T) => { const k = smooth((T - 474.6) / 1.4);
      A.a(mulher(1, 49), 1640, lerp(-0.7, -2.4, k), 2.6, { expr: "shout", look: 1, armB: 1, facing: 1 }); A.a(sold(1), 1641, lerp(-1.4, -3.0, k), 3.0, { expr: "stern", look: 1, prop: ["rifleUp", 0] });
      A.a(crianca(1, 49), 1642, lerp(0.7, 2.4, k), 2.5, { expr: "fear", look: -1, armB: 1, facing: -1 }); A.a(sold(2), 1643, lerp(1.4, 3.1, k), 3.0, { expr: "stern", look: -1, facing: -1 }); } },
  // 82b "e os sobreviventes passaram a enfrentar uma perseguição cada vez mais intensa." — soldiers chase through the forest, rifles firing
  { t0: 475.73, fade: 0.15, L: () => mata("r9", "grey"), lite: GREY, kicks: [[477.5, 4], [478.6, 4]], cam: hand((u, lt) => ({ x: -1 + lt * 2.6, y: 1.2, z: -4, fov: 42, shift: 0 }), 0.05),
    act: (A, lt, u, T) => { for (let i = 0; i < 3; i++) runS(A, cab(i, 50), 1650 + i, lt, 1 - i * 1.2, 3.2 + i * 0.6, 3.0, { expr: "fear" }); for (let i = 0; i < 5; i++) runS(A, sold(i), 1660 + i, lt, -5 - i * 1.1, 4 + (i % 2) * 0.8, 3.1, { expr: "shout" });
      A.fx(4, (g, c) => { for (const t0 of [477.5, 478.6]) { const k = T - t0; if (k > 0 && k < 0.08) { const [sx, sy, s] = P(c, -5 + (T - 475.73) * 3.1 + 0.6, 1.3, 4); glow(g, sx, sy, 0.6 * s, "rgba(255,220,140,1)", 1); } } }); } },
  // 83 "Mesmo depois da destruição dos principais redutos, a guerra ainda não havia terminado." — the map: redoubts crossed out one by one, but embers still glow
  { t0: 480.83, fade: 0.25, L: () => mapaSul("r10", MST.ember, false), lite: { sa: 0 }, cam: mv([-1.6, -0.8, -14, 40], [-1.2, -0.9, -11, 40]),
    act: (A, lt, u, T) => { hlSul(A, CONTEST, 1, "#b3221c", 0.2, true);
      const R: [number, number][] = [[-50.55, -27.15], [-50.9, -26.85], [-51.3, -26.7], [-50.3, -26.6], [-51.7, -27.1], [-50.7, -27.5]];
      R.forEach(([lo, la], i) => { marca(A, lo, la, 3, "", { kind: "fire" }); marca(A, lo, la, T - 481.4 - i * 0.3, "", { kind: "x", col: "#ff3a2a" }); });
      marca(A, -51.95, -26.45, T - 484.3, "", { kind: "fire" }); marca(A, -50.15, -27.0, T - 484.6, "", { kind: "fire" }); } },
  // 84 "Grupos armados conhecidos como vaqueanos também participaram da perseguição aos sertanejos." — riders gallop across the plain, ponchos flying
  { t0: 486.63, fade: 0.2, tr: "whip", L: () => plat("r11", "gold", { dense: 0.6 }), lite: GOLD, cam: (u, lt) => ({ x: -6 + lt * 5.5, y: 1.6, z: -6, fov: 42, shift: 0 }),
    act: (A, lt, u, T) => { for (let i = 0; i < 5; i++) { const x = -9 + i * 2.6 + lt * 6, z = 4 + (i % 3) * 1.4, b = Math.abs(Math.sin(lt * 9 + i)) * 0.12; A.sp("cavalo", x, b, z); A.a(VAQ(i), 1670 + i, x - 0.2, z + 0.02, { mode: "sit", expr: "grin", look: 1, prop: i % 2 ? ["rifleUp", 0] : undefined }, { y: 1.05 + b });
        A.fx(z + 0.3, (g, c) => dust(g, c, lt, x - 1.4, z + 0.2, 1, 0.8, [190, 170, 130], i)); }
      A.over((g) => bigText(g, "VAQUEANOS", T - 488.55, 2.0, VH * 0.18, 100)); } },
  // 85 "A resistência foi perdendo força, enquanto seus integrantes enfrentavam fome, doenças e a falta de qualquer proteção." — a few exhausted men by a small fire in the rain
  { t0: 492.97, fade: 0.3, L: () => mata("r12", "storm"), lite: NIGHTFIRE, wx: ["rain", 220, 0.4], cam: mv([0, 1.1, -3.2, 38, 30], [0, 1.0, -2.4, 34, 40]), mood: ["#8a8a9a", 0.2],
    act: (A, lt) => { A.fx(2.2, (g, c) => fire(g, c, lt, 0, 0, 2.2, 0.3, 4)); for (let i = 0; i < 4; i++) A.a({ ...cabArm(i, 51), rifle: false }, 1680 + i, -1.6 + i * 1.05, 2.6 + (i % 2) * 0.4, { expr: i === 2 ? "pained" : "sad", look: 0, mode: "sit", crouch: 0.6 }); } },
  // 86 "Um dos últimos grandes líderes do movimento era Adeodato Ramos." — portrait of Adeodato; his name
  { t0: 501.49, fade: 0.3, L: () => mata("r13", "grey"), lite: GREY, cam: mv([0.4, 1.62, -2.2, 32], [0, 1.66, -1.5, 24]),
    act: (A, lt, u, T) => { A.a(ADEODATO, 1700, 0, 1.4, { expr: "stern", look: 0, prop: ["rifleUp", 0] }); A.over((g) => bigText(g, "ADEODATO RAMOS", T - 504.5, 1.7, VH * 0.84, 100)); } },
  // 87 "Ele continuou resistindo mesmo quando praticamente todas as principais comunidades já haviam sido destruídas." — he leads a small band through the burned ruins
  { t0: 506.24, fade: 0.25, L: () => plat("r14", "grey", { dense: 0.4, kind: "rubble" }), lite: GREY, wx: ["ash", 80, 0.4], cam: (u, lt) => ({ x: -2 + lt * 0.9, y: 1.5, z: -4.6, fov: 40, shift: 0 }), sat: 0.75,
    act: (A, lt) => { walkS(A, ADEODATO, 1700, lt, -1.5, 3, 1.0, { expr: "stern" }); for (let i = 0; i < 4; i++) walkS(A, cabArm(i, 52), 1710 + i, lt, -3 - i * 1.2, 3.4 + (i % 2) * 0.6, 1.0, { expr: "sad" });
      for (let i = 0; i < 5; i++) panel(A, 8 + i, (w) => { const x = -6 + i * 4; w.poly([[x - 1.2, 0], [x + 1.4, 0], [x + 1.2, 1.6], [x + 0.4, 2.4], [x - 0.6, 1.2]], "#2a221e", 2); });
      A.fx(9, (g, c) => { for (let i = 0; i < 3; i++) smokeCol(g, c, lt, -4 + i * 5, 0.5, 10, { h: 10, w: 1.4, col: [80, 76, 76], a: 0.4, seed: i }); }); } },
  // 88 "Mas a situação era cada vez mais difícil." — only three left; they look at each other in the cold
  { t0: 513.24, fade: 0.25, L: () => mata("r15", "storm"), lite: COLD, cam: mv([0, 1.5, -3.4, 38], [0, 1.5, -2.6, 34]), mood: ["#7a8494", 0.3],
    act: (A) => { A.a(ADEODATO, 1700, 0, 2.6, { expr: "stern", look: 0 }); A.a(cabArm(2, 52), 1712, -1.3, 3.0, { expr: "sad", look: 0.6 }); A.a(cabArm(3, 52), 1713, 1.3, 3.1, { expr: "sad", look: -0.6 }); } },
  // 89 "Sem apoio suficiente e com seus seguidores dispersos, a resistência acabou sendo derrotada." — they walk off in different directions; the flag falls into the mud
  { t0: 516.91, fade: 0.25, L: () => plat("r16", "grey", { dense: 0.5 }), lite: GREY, kicks: [[521.9, 3]], cam: path([[0, [0, 1.6, -4, 40]], [1, [0, 3, -7, 44, -60]]]),
    act: (A, lt, u, T) => { for (let i = 0; i < 6; i++) { const a = -2.4 + i * 0.95, k = clamp((T - 518.0) / 4); A.a(cabArm(i, 53), 1720 + i, Math.cos(a) * (0.8 + k * 6), 3 + Math.sin(a) * (0.5 + k * 3) + 1, { mode: k > 0 ? "stroll" : "stand", phase: (lt * 1.2 + i * 0.3) % 1, expr: "sad", look: Math.cos(a) }); }
      const fk = clamp((T - 521.3) / 0.6); A.fx(3.5, (g, c) => { const [px, py, s] = P(c, 0, 0, 3.5); g.save(); g.translate(px, py); g.rotate(fk * fk * 1.45); g.strokeStyle = "#3a2a1c"; g.lineWidth = 0.08 * s; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -3 * s); g.stroke(); g.fillStyle = "#f4f1e8"; g.strokeStyle = "#241726"; g.lineWidth = 2; g.fillRect(0, -3 * s, 1.2 * s, 0.8 * s); g.strokeRect(0, -3 * s, 1.2 * s, 0.8 * s); g.fillStyle = "#2e7a3e"; g.fillRect(0.5 * s, -2.95 * s, 0.17 * s, 0.7 * s); g.fillRect(0.25 * s, -2.7 * s, 0.7 * s, 0.14 * s); g.restore(); }); } },
  // 90 "Em 1916, Adeodato foi capturado." — surrounded, he drops the rifle and raises his hands
  { t0: 523.39, fade: 0.25, tr: "punch", L: () => mata("r17", "grey"), lite: GREY, kicks: [[526.0, 4]], cam: path([[0, [0, 1.6, -3.4, 38]], [1, [0, 1.5, -2.6, 34]]]),
    act: (A, lt, u, T) => { const up = T > 525.9; A.a({ ...ADEODATO, rifle: !up }, 1700, 0, 2.8, { expr: up ? "sad" : "stern", look: 0, armB: up ? 1 : 0, prop: up ? ["fist", 1] : undefined });
      for (let i = 0; i < 6; i++) { const a = Math.PI * (0.05 + 0.18 * i), k = smooth((T - 524.0) / 1.6); A.a(sold(i), 1730 + i, Math.cos(a) * lerp(4, 2.2, k), 2.8 + Math.sin(a) * lerp(2, 1.2, k) + 0.5, { expr: "stern", look: -Math.cos(a), prop: ["rifleUp", 0] }); }
      A.over((g) => caption(g, "1916 · ADEODATO É CAPTURADO", T - 524.9, 3.0)); } },
  // 91 "Depois de quatro anos de violência, a Guerra do Contestado finalmente chegava ao fim." — the years tick 1912→1916 over a quiet smoking field at sunrise
  { t0: 527.62, fade: 0.4, L: () => plat("r18", "dawn", { near: [[-9, 12, 18]] }), lite: BACK, bloom: 1.0, cam: path([[0, [0, 1.4, -5, 42, 20]], [1, [0, 3.2, -8, 44, -40]]]),
    act: (A, lt, u, T) => { A.fx(8, (g, c) => { for (let i = 0; i < 4; i++) smokeCol(g, c, lt, -8 + i * 5, 0.3, 10, { h: 10, w: 1.2, col: [180, 176, 176], a: 0.25, seed: i }); });
      A.light((g) => { sun(g, VW * 0.5, VH * 0.5, 30, "255,210,170"); rays(g, VW * 0.5, VH * 0.5, VW, 0.2, "255,200,160", 26, lt); });
      A.over((g) => { const y = Math.round(lerp(1912, 1916, smooth((T - 528.2) / 1.6))); if (T < 531.7) bigText(g, String(y), T - 528.2, 3.5, VH * 0.3, 130, "#f6efe0", "QUATRO ANOS"); bigText(g, "FIM DA GUERRA", T - 531.9, 1.6, VH * 0.3, 110); }); } },
  // 92a "No mesmo ano, Paraná e Santa Catarina chegaram a um acordo sobre suas fronteiras," — the boundary agreement is signed
  { t0: 533.86, fade: 0.25, L: () => sala("r19", "#3a2a24"), lite: LAMP, cam: mv([0, 0.6, -2.2, 34, -340], [0, 0.55, -1.8, 30, -340]),
    act: (A, lt, u, T) => signing(A, (T - 535.0) / 2.4, { y: -1.5, z: 3, seed: 31, title: "ACORDO DE LIMITES", sub: "PARANÁ — SANTA CATARINA · 1916", sleeve: "#2a2a30", prior: 1 }) },
  // 92b "encerrando oficialmente uma disputa territorial que se arrastava havia décadas." — on the map, the new border is drawn through the Contestado
  { t0: 537.78, fade: 0.2, L: () => mapaSul("r20", MST.parch), lite: { sa: 0 }, cam: mv([-1, -0.4, -18, 40], [-1.6, -0.6, -13, 40]),
    act: (A, lt, u, T) => { hlSul(A, CONTEST, 1 - clamp((T - 539.6) / 1.5), "#b3221c", 0.3, true); rota(A, [-53.8, -26.7, -52.6, -26.55, -51.4, -26.35, -50.6, -26.25, -50.0, -26.1], (T - 538.4) / 1.8, "#2a1a10", 0.16);
      A.over((g) => STAMP(g, "1916", T - 540.2, VW * 0.78, VH * 0.22, "#2a6a3a", 80)); } },
  // 93 "Mas a guerra deixou uma pergunta que continua importante até hoje: quem realmente venceu?" — a boy alone in a field of stumps; the question
  { t0: 544.18, fade: 0.3, L: () => plat("r21", "grey", { dense: 0.15, kind: "mud" }), lite: GREY, cam: path([[0, [0, 1.2, -3, 38]], [1, [0, 4, -9, 44, -90]]]), sat: 0.8,
    act: (A, lt, u, T) => { for (let i = 0; i < 30; i++) A.sp("toco", -16 + (i % 15) * 2.2 + hash(i) * 1.2, 0, 5 + Math.floor(i / 15) * 6 + hash(i + 3) * 3, { sc: 0.9 }); A.a(crianca(0, 54), 1750, 0, 2.2, { expr: "sad", look: 0 });
      A.over((g) => bigText(g, "QUEM REALMENTE VENCEU?", T - 548.85, 1.8, VH * 0.2, 96)); } },
  // 94 "O governo conseguiu destruir os redutos e derrotar os principais líderes da resistência." — a victory parade, but the colour is drained
  { t0: 550.75, fade: 0.25, L: () => cidade("r22", "grey", ["#c8b89a", "#b8a888", "#d0c0a0"], 71), lite: GREY, sat: 0.65, cam: path([[0, [-4, 1.2, -5, 42, 30]], [1, [3, 1.4, -6, 42, 20]]]),
    act: (A, lt) => { marchCol(A, (i) => sold(i), lt, 14, -3, 4, 1.3, 1.2, 2, 1.2); flag(A, "br", -1 + lt * 1.3, 3.8, 3.6, 1.4, 0.95); A.a(SETEMBRINO, 1300, 5, 6, { expr: "stern", look: -1, prop: ["portfolio", 0] });
      A.fx(4, (g, c) => flutter(g, c, lt, { n: 24, x0: -6, x1: 6, z0: 2, z1: 7, top: 5, cols: ["#e8e4dc"], size: 0.1, fall: 1, loop: true, seed: 12 })); } },
  // 95 "Porém, milhares de pessoas perderam suas vidas, suas casas e suas famílias." — an empty, burned house; an old woman alone at the door
  { t0: 556.40, fade: 0.3, L: () => plat("r23", "dusk", { near: [[9, 12, 18]] }), lite: BACK, bloom: 0.9, cam: mv([0, 1.4, -4, 38], [0, 1.4, -2.8, 32]), sat: 0.85,
    act: (A, lt) => { panel(A, 6, (w) => { w.poly([[-3.2, 0], [3.2, 0], [3.0, 2.6], [1.4, 3.4], [0.2, 2.2], [-1.4, 3.0], [-3.0, 2.0]], "#2e2620", 3); w.rect(-0.5, 0, 1.0, 1.9, "#120e0c", 2); w.line([[-2.6, 2.4], [2.4, 3.6]], 8, "#1e1814"); });
      A.fx(6.1, (g, c) => smokeCol(g, c, lt, 1, 2, 6.1, { h: 8, w: 1, col: [90, 86, 84], a: 0.35 }));
      A.a(AVO, 15, -0.2, 3.2, { expr: "sad", look: 0 }); A.sp("chair2", 1.4, 0, 3.6, { sc: 0.9 }); } },
  // 96 "As estimativas de mortos variam conforme os estudos." — books and papers on a desk, a lamp: the historians' numbers disagree
  { t0: 562.62, fade: 0.25, L: () => sala("r24", "#4a3a2e", { frames: 1, panel: "#2a1e16" }), lite: LAMP, cam: mv([0.4, 1.4, -1.8, 34, 40], [0, 1.3, -1.3, 30, 40]),
    act: (A, lt) => { A.sp("mesa", 0, 0, 1.6, { sc: 0.9 }); for (let i = 0; i < 3; i++) A.sp("escritura", -0.7 + i * 0.7, 0.9, 1.55 + i * 0.02, { sc: 0.5, rot: (i - 1) * 0.12 }); A.sp("lamp", 1.1, 0.8, 1.6, { sc: 0.6 }); lantern(A, 1.1, 1.3, 1.6, lt, 0.8); } },
  // 97 "Algumas apontam cerca de 6 mil vítimas, enquanto outras chegam a 10 mil ou mais, incluindo aqueles que morreram de fome e doenças." — the crosses multiply as the count climbs
  { t0: 565.99, fade: 0.25, L: () => plat("r25", "dusk", { dense: 0.4 }), lite: BACK, bloom: 0.8, sat: 0.8, cam: path([[0, [0, 2, -4, 42, -30]], [1, [0, 7, -10, 48, -200]]]),
    act: (A, lt, u, T) => { const n = Math.floor(lerp(10, 140, smooth((T - 566.4) / 5))); crosses(A, n, -18, 18, 3, 30, 9);
      A.over((g) => { const v = T < 570.4 ? lerp(0, 6000, smooth((T - 567.4) / 0.7)) : lerp(6000, 10000, smooth((T - 570.4) / 0.6)); counter(g, v, T < 570.9 ? "VÍTIMAS" : "VÍTIMAS OU MAIS", T - 567.4, 7.6, VH * 0.24, "#f6efe0", 120); }); } },
  // 98 "E existe uma ironia difícil de ignorar." — a train passes the ruins at dusk
  { t0: 575.44, fade: 0.25, L: () => plat("r26", "dusk", { dense: 0.5 }), lite: BACK, bloom: 0.9, cam: mv([-1, 1.2, -4, 40, 20], [1, 1.2, -4, 40, 20]),
    act: (A, lt) => { panel(A, 6, (w) => { w.poly([[-6.2, 0], [-1.8, 0], [-2.0, 2.0], [-3.6, 2.8], [-4.8, 1.8], [-6.0, 2.2]], "#2e2620", 3); }); railsX(A, 12, -60, 60); train(A, -24 + lt * 9, 12, { vel: 9, wagons: ["vagaoToras", "vagaoToras"] }); } },
  // 99a "Enquanto milhares de brasileiros eram perseguidos e mortos," — refugees in the rain on a muddy road
  { t0: 578.32, fade: 0.2, L: () => plat("r27", "storm", { dense: 0.6, kind: "mud" }), lite: COLD, wx: ["rain", 220, 0.4], cam: mv([0, 1.4, -3.6, 40], [0, 1.4, -2.8, 36]), mood: ["#7a8494", 0.25],
    act: (A, lt) => { for (let i = 0; i < 6; i++) A.a(i % 3 === 1 ? mulher(i, 55) : i % 3 === 2 ? crianca(i, 55) : cab(i, 55), 1760 + i, -2.4 + i * 0.95, 3 + (i % 2) * 0.8 - lt * 0.4, { mode: "stroll", phase: (lt * 1.1 + i * 0.3) % 1, expr: "sad", prop: i === 0 ? ["suitcase", 0] : undefined }); } },
  // 99b "os interesses econômicos que ajudaram a provocar a crise continuavam sendo atendidos." — in a warm office, gold coins pour onto the desk; Farquhar smiles
  { t0: 581.18, fade: 0.15, tr: "whip", L: () => sala("r28", "#5a3a2e", { frames: 2, curtain: "#5a1e1a", lamps: 2, panel: "#2a1a12" }), lite: LAMP, bloom: 1.0, cam: mv([0.4, 1.4, -2.4, 36], [0, 1.35, -1.8, 32]),
    act: (A, lt) => { A.sp("mesa", 0, 0, 1.8, { sc: 1.0 }); A.fx(1.75, (g, c) => coins(g, c, lt, 0, 1.6, 1.75, 60, 14, 6)); A.a(FARQUHAR, 1230, -0.6, 2.4, { expr: "grin", look: 0.6 }); A.a(EXEC, 1231, 1.0, 2.5, { expr: "laugh", look: -0.6 }); } },
  // 100 "A ferrovia permaneceu." — the locomotive storms past, full steam
  { t0: 587.10, fade: 0.15, tr: "punch", L: () => plat("r29", "day", { dense: 0.7 }), lite: DAY, cam: mv([0, 1.0, -4, 44, 40], [0, 1.0, -3.4, 42, 40]),
    act: (A, lt) => { railsX(A, 6, -60, 60); train(A, -18 + lt * 14, 6, { vel: 14, wagons: ["vagaoToras", "wagonT"] }); } },
  // 101 "A exploração econômica continuou." — the mill's saw sings, logs stack higher
  { t0: 588.90, fade: 0.15, L: () => plat("r30", "day", { dense: 0.4, kind: "mud" }), lite: DAY, cam: mv([-2, 2.4, -9, 44, -20], [2, 2.4, -8, 42, -20]),
    act: (A, lt) => { A.sp("serraria", 0, 0, 16); A.fx(16.1, (g, c) => smokeCol(g, c, lt, 8.2, 11.6, 16, { h: 20, w: 2, col: [80, 76, 74], a: 0.7, wind: 0.4 })); for (let i = 0; i < 4; i++) A.sp("toras", -10 + i * 6, 0, 9 + (i % 2)); } },
  // 102 "E a população pobre da região teve que reconstruir sua vida depois de uma tragédia que marcou gerações." — dawn: a family raises the frame of a new house
  { t0: 591.43, fade: 0.3, L: () => plat("r31", "dawn", { near: [[-9, 12, 18]] }), lite: BACK, bloom: 1.0, cam: path([[0, [2, 1.4, -4, 40]], [1, [-1, 1.6, -4.6, 42]]]), kicks: [[594.1, 2], [594.6, 2]],
    act: (A, lt, u, T) => { panel(A, 5, (w) => { for (const x of [-2.6, -0.9, 0.9, 2.6]) w.rect(x - 0.1, 0, 0.2, 2.6, "#8a6040", 2.5); w.rect(-2.8, 2.5, 5.6, 0.22, "#7a5232", 2.5); w.poly([[-2.8, 2.7], [0, 4.2], [2.8, 2.7]], null, 0); w.line([[-2.8, 2.7], [0, 4.2], [2.8, 2.7]], 6, "#7a5232"); });
      const ph = (lt * 1.6) % 1; A.s(PAI, 11, -1.2, 3.4, { mode: "swing", pose: ph < 0.5 ? ph * 2 : 2 - ph * 2, expr: "stern" }); A.a(MAE, 12, 1.4, 3.2, { expr: "smile_closed", prop: ["bread", 0] }); A.a(FILHO, 13, 0.4, 2.8, { expr: "smile" });
      A.light((g) => { sun(g, VW * 0.72, VH * 0.42, 30, "255,214,170"); rays(g, VW * 0.72, VH * 0.42, VW, 0.2, "255,206,160", 24, lt); }); } },
  // 103 "A Guerra do Contestado não foi apenas uma disputa entre dois estados brasileiros." — the two states side by side on the map, the region between them
  { t0: 598.50, fade: 0.3, L: () => mapaSul("r32", MST.sepia), lite: { sa: 0 }, cam: mv([0, 0.6, -38, 40], [-0.6, 0, -28, 40]),
    act: (A, lt, u, T) => { hlSul(A, [-54.6, -25.5, -54.3, -24.1, -54.1, -23.9, -52.6, -22.6, -51.4, -22.6, -50.0, -22.9, -49.6, -23.5, -49.2, -24.6, -48.5, -25.0, -48.1, -25.6, -48.6, -26.0, -49.5, -26.2, -51.3, -26.6, -53.7, -26.2], (T - 601.2) / 0.4, "#3a8a4a", 0.3, false);
      hlSul(A, [-53.8, -26.2, -51.3, -26.6, -49.5, -26.2, -48.6, -26.0, -48.5, -26.6, -48.6, -27.5, -48.5, -28.2, -49.2, -28.6, -49.8, -29.3, -50.4, -28.6, -51.6, -27.8, -53.0, -27.25, -53.8, -27.15], (T - 601.6) / 0.4, "#c8702a", 0.3, false); hlSul(A, CONTEST, 1, "#b3221c", 0.25, true); } },
  // 104a "Foi também o resultado de uma população abandonada," — a woman and child alone on an empty road
  { t0: 603.32, fade: 0.25, L: () => plat("r33", "grey", { dense: 0.4 }), lite: GREY, cam: path([[0, [0, 1.3, -3, 38]], [1, [0, 3, -8, 44, -60]]]), sat: 0.8,
    act: (A) => { A.a(mulher(8, 56), 1780, -0.4, 2.6, { expr: "sad", prop: ["baby", 0] }); A.a(crianca(8, 56), 1781, 0.5, 2.4, { expr: "sad", look: -0.5 }); } },
  // 104b "de famílias expulsas de suas terras" — the family leaves the house again, soldiers at the gate
  { t0: 606.78, fade: 0.2, L: () => plat("r34", "grey", { near: [[11, 16, 20]] }), lite: GREY, cam: mv([-1, 1.5, -5, 40], [1, 1.5, -5.6, 42]),
    act: (A, lt) => { A.sp("casa", 1.5, 0, 9); A.a(sold(3), 1790, 3.2, 4, { expr: "stern", look: -1, facing: -1, prop: ["rifleUp", 0] });
      for (let i = 0; i < 4; i++) A.a([PAI, MAE, FILHO, AVO][i], 11 + i, 0.6 - i * 0.7 - lt * 1.1, 4.4 + i * 0.3, { mode: "stroll", phase: (lt * 1.2 + i * 0.25) % 1, expr: "sad", facing: -1, prop: i === 0 ? ["suitcase", 0] : undefined }); } },
  // 104c "e de interesses econômicos que tiveram mais força do que a vida de milhares de pessoas." — a set of scales: gold coins outweigh a crowd of tiny figures
  { t0: 608.83, fade: 0.2, L: () => sala("r35", "#2a2024"), lite: LAMP, bloom: 1.0, cam: mv([0, 1.6, -3.2, 38], [0, 1.6, -2.4, 34]),
    act: (A, lt, u, T) => { const tilt = 0.28 * smooth((T - 609.6) / 1.2);
      panel(A, 2.4, (w) => { w.rect(-0.08, 0, 0.16, 2.4, "#c9a24a", 2.5); w.rect(-0.6, 0, 1.2, 0.14, "#a8823a", 2.5); }, {});
      panel(A, 2.4, (w) => { w.rect(-1.6, 2.36, 3.2, 0.08, "#c9a24a", 2.5); }, { pivot: [0, 2.4], rot: -tilt });
      const L = { x: -1.5 * Math.cos(tilt), y: 2.4 + 1.5 * Math.sin(tilt) }, R = { x: 1.5 * Math.cos(tilt), y: 2.4 - 1.5 * Math.sin(tilt) };
      for (const p of [L, R]) panel(A, 2.38, (w) => { w.line([[p.x, p.y], [p.x - 0.4, p.y - 0.8]], 2, "#8a7a5a"); w.line([[p.x, p.y], [p.x + 0.4, p.y - 0.8]], 2, "#8a7a5a"); w.ell(p.x, p.y - 0.82, 0.55, 0.1, "#c9a24a", 2.5); });
      A.fx(2.36, (g, c) => { for (let i = 0; i < 18; i++) { const [sx, sy, s] = P(c, R.x - 0.4 + (i % 6) * 0.16, R.y - 0.76 + Math.floor(i / 6) * 0.06, 2.36); g.fillStyle = "#e8c24a"; g.strokeStyle = "#7a5a18"; g.lineWidth = 1.2; g.beginPath(); g.ellipse(sx, sy, 0.08 * s, 0.03 * s, 0, 0, 7); g.fill(); g.stroke(); } });
      for (let i = 0; i < 6; i++) A.a(i % 2 ? mulher(i, 57) : cab(i, 57), 1800 + i, L.x - 0.35 + i * 0.14, 2.34, { expr: "sad" }, { y: L.y - 0.78, sc: 0.14, shadow: 0, noCast: true }); } },
  // 105 "No final, aqueles sertanejos não estavam tentando conquistar o Brasil." — the men lower their wooden swords and rifles to the ground
  { t0: 614.27, fade: 0.3, L: () => plat("r36", "gold", { near: [[-9, 12, 18]] }), lite: GOLD, bloom: 0.9, cam: mv([0, 1.4, -4, 40], [0, 1.45, -3, 36]),
    act: (A, lt, u, T) => { const down = T > 616.3; for (let i = 0; i < 6; i++) A.a({ ...cabArm(i, 58), rifle: false }, 1820 + i, -3 + i * 1.2, 2.6 + (i % 2) * 0.6, { expr: down ? "sad" : "stern", look: 0, prop: down ? undefined : ["katana", 0], crouch: down ? 0.2 : 0 });
      A.fx(2.4, (g, c) => { if (!down) return; for (let i = 0; i < 6; i++) { const k = T - 616.3 - i * 0.1, [hy] = bounce(Math.max(0, k), 0.9, 0, 0.3), [sx, sy, s] = P(c, -2.7 + i * 1.2, Math.max(0.03, hy), 2.4 + (i % 2) * 0.6); g.strokeStyle = "#6a4a2e"; g.lineWidth = 0.05 * s; g.beginPath(); g.moveTo(sx - 0.4 * s, sy); g.lineTo(sx + 0.4 * s, sy - 0.03 * s); g.stroke(); } }); } },
  // 106 "Muitos só queriam continuar vivendo na terra onde suas famílias haviam construído suas histórias." — back to the opening: the family in front of their house in the golden light
  { t0: 618.83, fade: 0.4, L: () => plat("r37", "gold", { near: [[-9, 14, 20], [11, 18, 22]], fence: 12 }), lite: GOLD, bloom: 0.9, cam: path([[0, [0.6, 1.6, -4.2, 36]], [1, [0.4, 2.6, -8, 42, -60]]]),
    act: (A, lt) => { A.sp("casa", 0.4, 0, 7.5); chimney(A, 2.75, 7.5, lt); familia(A, 0.3, 3.2, {}, 0); runS(A, FILHA, 14, lt, -3.4, 4.6, 1.6, { expr: "laugh" });
      A.light((g) => { sun(g, VW * 0.8, VH * 0.24, 30, "255,214,160"); rays(g, VW * 0.8, VH * 0.24, VW * 0.9, 0.14, "255,200,150", 18, lt); }); } },
  // 107 "E talvez essa seja a parte mais triste de toda essa guerra: para milhares de brasileiros, lutar para não perder tudo significou enfrentar o próprio país." — a hat on a cross; the camera rises past the araucarias into the sunset; the title
  { t0: 625.20, fade: 0.5, L: () => plat("r38", "dusk", { near: [[-6, 10, 18], [7, 13, 20]] }), lite: BACK, bloom: 1.1, cam: path([[0, [0, 0.9, -2.2, 34, 30]], [0.55, [0, 2.4, -5, 40, 0]], [1, [0, 6, -10, 44, -60]]]),
    act: (A, lt, u, T) => { A.sp("cruz", 0, 0, 2.2, { sc: 0.45 }); A.fx(2.15, (g, c) => { const [sx, sy, s] = P(c, 0, 1.72, 2.15); g.fillStyle = "#4a3626"; g.strokeStyle = "#241726"; g.lineWidth = 2; g.beginPath(); g.ellipse(sx, sy + 0.06 * s, 0.42 * s, 0.07 * s, 0, 0, 7); g.fill(); g.stroke(); g.beginPath(); g.moveTo(sx - 0.22 * s, sy + 0.05 * s); g.lineTo(sx - 0.2 * s, sy - 0.16 * s); g.lineTo(sx + 0.2 * s, sy - 0.16 * s); g.lineTo(sx + 0.22 * s, sy + 0.05 * s); g.fill(); g.stroke(); });
      flag(A, "br", -3, 3.4, 9, 1.4, 0.95, { wind: 0.6 }); flag(A, "cont", 3, 3.0, 9.5, 1.2, 0.85, { wind: 0.6 });
      A.light((g) => { sun(g, VW * 0.5, VH * 0.5, 34, "255,180,130"); rays(g, VW * 0.5, VH * 0.5, VW, 0.22, "255,170,120", 26, lt); });
      A.over((g) => bigText(g, "A GUERRA DO CONTESTADO", T - 631.0, 4.6, VH * 0.44, 96, "#f6efe0", "1912 — 1916")); } },
];
