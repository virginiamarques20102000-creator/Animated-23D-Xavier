// 302.9 – 441 s: the monk becomes a legend, Teodora, the holy redoubts, the attack on Taquaruçu, the burning of the Lumber mill,
// the federal army under Setembrino, machine guns, artillery and the first military aeroplane, the forest war, the siege.
import { VW, VH, P, glow, fire, smokeCol, puff, clamp, lerp, smooth, easeOut, easeIn, hash, rays, sun, beam, muzzle } from "./engine";
import { Sc, mv, path, hand, walkF, walkS, runS, marchF, marchCol, crowd, flag, signing, panel, caption, bigText, counter, fall, plane } from "./kit";
import { blast, scorch, embers, flutter, sparks, lensFlare, glint, birds, dust, rubble, bounce, spring } from "./fx";
import { cab, mulher, crianca, cabArm, sold, MONGE, TEODORA, POLIT, OPER, VAQ, EXEC, FARQUHAR, SETEMBRINO, OFICIAL, v, train, railsX, mapaSul, hlSul, marca, rota, MST, CONTEST, lantern, halo, SX, SY } from "./props";
import { plat, mata, sala, cidade, loc } from "./lugares";
import { DAY, GOLD, BACK, GREY, NIGHTFIRE, MOON, LAMP, COLD, NOON } from "./looks";
import { STAMP, chimney } from "./shots_1";
import type { Shot } from "./types";

const TAQ: [number, number] = [-50.55, -27.15];
/** a reduto: palisade, chapel, huts and the white flag with the green cross */
export const reduto = (A: Sc, lt: number, z0: number, o: { fire?: number; T?: number; n?: number; smoke?: boolean } = {}) => {
  A.sp("capela", 0, 0, z0 + 6); flag(A, "cont", 2.6, 6.2, z0 + 5.8, 1.6, 1.1, { wind: 1 }); A.sp("cruz", -3.2, 0, z0 + 4, { sc: 0.7 });
  for (let i = 0; i < (o.n ?? 6); i++) { const x = -14 + i * 5.2 + (i > 2 ? 4 : 0), z = z0 + 4 + (i % 2) * 3; A.sp(i % 2 ? "rancho" : "casa", x, 0, z, { sc: 0.8 }); if (o.smoke !== false) chimney(A, x + 1.8, z, lt + i, 4.2); }
  A.sp("palicada", -10, 0, z0 + 10); A.sp("palicada", 10, 0, z0 + 10);
};

export const SHOTS_3: Shot[] = [
  // 51 "Para muitos seguidores, José Maria não havia desaparecido." — praying at the grave, a soft light glows behind the cross
  { t0: 302.94, fade: 0.25, L: () => plat("q0", "night", { near: [[7, 10, 16]] }), lite: MOON, bloom: 1.2, cam: mv([0.6, 1.3, -3.2, 36], [0.1, 1.5, -2.2, 30]),
    act: (A, lt, u, T) => { A.sp("cruz", 0, 0, 3.4, { sc: 0.55 }); halo(A, 0, 1.6, 3.6, 2.6, 0.25 + 0.35 * smooth((T - 304.2) / 1.2));
      for (let i = 0; i < 4; i++) A.a(i % 2 ? mulher(i, 23) : cab(i, 23), 900 + i, -1.8 + i * 1.2, 2.2, { expr: T > 305 ? "relief" : "sad", look: 0, crouch: 0.5 }, { dark: 0.45, darkCol: "#1a1424" });
      for (let i = 0; i < 6; i++) { A.sp("candle", -1.2 + i * 0.5, 0, 3.0); lantern(A, -1.2 + i * 0.5, 0.48, 3.0, lt + i, 0.6); } } },
  // 52a "Eles acreditavam que ele retornaria acompanhado de um exército encantado," — riders of light in the clouds above the plateau
  { t0: 306.81, fade: 0.3, L: () => plat("q1", "dusk", { near: [[-10, 12, 18]], cloudy: true }), lite: BACK, bloom: 1.4, cam: path([[0, [0, 1.0, -3, 40, 140]], [1, [0, 1.2, -4, 42, 220]]]),
    act: (A, lt, u, T) => { const k = smooth((T - 309.6) / 1.4);
      for (let i = 0; i < 9; i++) { const x = -14 + i * 3.4 + lt * 1.2, y = 9 + Math.sin(i * 1.7) * 1.4, z = 24 + (i % 3) * 3; A.sp("cavalo", x, y, z, { alpha: 0.55 * k }); A.a(sold(i), 920 + i, x + 0.1, z + 0.02, { mode: "sit", expr: "stern", prop: ["katana", 0] }, { y: y + 1.05, alpha: 0.55 * k, shadow: 0, noCast: true }); halo(A, x, y + 1.4, z, 3.2, 0.22 * k, "255,226,170"); }
      for (let i = 0; i < 5; i++) A.a(i % 2 ? mulher(i, 24) : cab(i, 24), 940 + i, -2.4 + i * 1.2, 2.4, { expr: "shock", look: 0.2 * (i - 2), headTilt: -10 }, { dark: 0.7, darkCol: "#2a1a2a" }); } },
  // 52b "liderado por São Sebastião." — at the head of the host, a radiant young warrior saint
  { t0: 311.63, fade: 0.2, L: () => plat("q2", "dusk", { cloudy: true }), lite: BACK, bloom: 1.6, cam: mv([0, 4, -6, 40, 60], [0, 5, -4, 34, 40]),
    act: (A, lt, u, T) => { halo(A, 0, 6.4, 6, 6, 0.6); A.a({ jacket: "#f2ead2", pants: "#e8dcc0", boots: "#c9a24a", hat: "hair", hair: "#6a4a2a", sash: "#c9a24a", buttons: "#c9a24a" }, 950, 0, 6, { expr: "neutral", prop: ["spear", 0], look: 0 }, { y: 4.2, sc: 1.1, shadow: 0, noCast: true });
      A.light((g) => { const [sx, sy] = P(A.cam, 0, 6.8, 6); rays(g, sx, sy, VW * 0.8, 0.25, "255,236,190", 24, lt); });
      A.over((g) => bigText(g, "SÃO SEBASTIÃO", T - 312.5, 1.3, VH * 0.86, 96)); } },
  // 53 "A morte do líder não destruiu a resistência." — the white flag with the green cross is raised again over the camp
  { t0: 313.62, fade: 0.25, L: () => plat("q3", "gold", { near: [[9, 12, 18]] }), lite: GOLD, bloom: 0.9, cam: path([[0, [0, 0.6, -3, 40, 140]], [1, [0, 0.9, -3.6, 40, 100]]]),
    act: (A, lt, u, T) => { const up = smooth((T - 313.9) / 1.8); A.fx(3.6, (g, c) => { const [px, py, s] = P(c, 0, 0, 3.6), [, ty] = P(c, 0, 5.2, 3.6); g.strokeStyle = "#3a2a1c"; g.lineWidth = 0.1 * s; g.beginPath(); g.moveTo(px, py); g.lineTo(px, ty); g.stroke(); });
      flag(A, "cont", 0, 1.6 + 3.4 * up, 3.6, 1.5, 1.0, { pole: false, wind: 1.2 });
      for (let i = 0; i < 6; i++) A.a(cabArm(i, 25), 960 + i, -3 + i * 1.2 + (i > 2 ? 0.6 : 0), 2.4 + (i % 2) * 0.6, { expr: T > 315.4 ? "shout" : "stern", look: 0, prop: i % 2 ? ["katana", 1] : ["fist", T > 315.4 ? 1 : 0] }); } },
  // 54 "Transformou José Maria em um símbolo religioso ainda mais poderoso." — an altar with his portrait among the candles, people kneel; push into the portrait
  { t0: 316.83, fade: 0.25, L: () => sala("q4", "#5a4030", { floor: ["#22180e", "#2e2218"] }), lite: LAMP, bloom: 1.1, cam: mv([0, 1.2, -3.2, 38], [0, 1.85, -0.6, 28]),
    act: (A, lt) => { panel(A, 2.6, (w) => { w.rect(-0.8, 1.0, 1.6, 2.0, "#c9a24a", 3); w.rect(-0.68, 1.12, 1.36, 1.76, "#3a2a22", 0); w.rect(-1.6, 0, 3.2, 1.0, "#e8dcc0", 3); });
      A.a(MONGE, 500, 0, 2.55, { expr: "smile_closed", look: 0 }, { y: 0.25, sc: 0.7, shadow: 0, noCast: true });
      for (let i = 0; i < 8; i++) { const x = -1.4 + i * 0.4; A.sp("candle", x, 1.0, 2.45); lantern(A, x, 1.48, 2.45, lt + i, 0.7); }
      for (let i = 0; i < 4; i++) A.a(i % 2 ? mulher(i, 26) : cab(i, 26), 970 + i, [-2.7, -1.8, 1.8, 2.7][i], 1.6, { expr: "sad", look: 0, crouch: 0.6 }, { dark: 0.6, darkCol: "#1a0e0a" }); } },
  // 55 "Em 1913, seus seguidores começaram a se reunir novamente em Taquaruçu." — people stream back into the valley with flags and bundles
  { t0: 321.28, fade: 0.25, L: () => plat("q5", "day", { near: [[-12, 14, 20]] }), lite: DAY, cam: path([[0, [-6, 3.2, -10, 44, -60]], [1, [2, 2.6, -8, 42, -40]]]),
    act: (A, lt, u, T) => { for (let i = 0; i < 18; i++) walkS(A, i % 3 === 0 ? mulher(i, 27) : cab(i, 27), 980 + i, lt, -16 + i * 1.6 - (i % 3) * 0.4, 6 + (i % 4) * 1.2, 1.2, { expr: "smile" });
      flag(A, "cont", -2 + lt * 1.2, 3.4, 6.5, 1.3, 0.9); A.sp("capela", 8, 0, 20); A.over((g) => caption(g, "TAQUARUÇU · 1913", T - 321.6, 5.0)); } },
  // 56a "Uma menina chamada Teodora, de apenas 11 anos," — the girl, portrait; her name
  { t0: 327.39, fade: 0.25, L: () => plat("q6", "gold", { near: [[-5, 8, 14]] }), lite: GOLD, bloom: 0.9, cam: mv([0.3, 1.3, -2.2, 32], [0, 1.25, -1.6, 26]),
    act: (A, lt, u, T) => { A.a(TEODORA, 1000, 0, 1.4, { expr: "smile_closed", look: 0 }); A.over((g) => bigText(g, "TEODORA", T - 328.85, 2.4, VH * 0.84, 110, "#f6efe0", "11 ANOS")); } },
  // 56b "dizia receber mensagens do monge em seus sonhos." — asleep by night; the monk's face glows above her in a dream
  { t0: 331.33, fade: 0.3, L: () => sala("q7", "#2e2a3a", { win: 1, winCol: "#2a3a5a", floor: ["#18141e", "#221c28"] }), lite: MOON, bloom: 1.4, cam: mv([0, 1.9, -3.6, 38, -70], [0, 1.9, -3.0, 34, -70]),
    act: (A, lt, u, T) => { A.sp("bed", 0, 0, 2.0); A.a(TEODORA, 1000, -0.2, 2.0, { expr: "smile_closed", blink: 1 }, { rot: -Math.PI / 2, y: 0.75, shadow: 0, noCast: true });
      const k = smooth((T - 332.3) / 1.0); halo(A, 0.2, 2.4, 2.4, 2.0, 0.5 * k); A.a(MONGE, 500, 0.2, 2.5, { expr: "smile_closed", look: 0 }, { y: 1.25, sc: 0.55, alpha: 0.6 * k, shadow: 0, noCast: true });
      A.fx(2.3, (g, c) => { for (let i = 0; i < 20; i++) { const [sx, sy, s] = P(c, -1.6 + hash(i) * 3.6, 1.3 + hash(i + 2) * 1.8 + Math.sin(lt + i) * 0.05, 2.3); glow(g, sx, sy, 0.05 * s, "rgba(255,240,200,1)", k * (0.5 + 0.5 * Math.sin(lt * 3 + i))); } }); } },
  // 57 "Essas mensagens ajudaram a fortalecer a esperança de milhares de pessoas." — Teodora speaks at sunrise; hands rise in the crowd
  { t0: 334.63, fade: 0.25, L: () => plat("q8", "dawn", { near: [[10, 12, 18]] }), lite: BACK, bloom: 1.1, cam: path([[0, [0, 1.0, -3, 38, 60]], [1, [0, 3.0, -6, 42, -40]]]),
    act: (A, lt, u, T) => { A.sp("toco", 0, 0, 3.4); A.a(TEODORA, 1000, 0, 3.4, { expr: "smile", armB: 1 }, { y: 0.7 });
      for (let i = 0; i < 26; i++) A.a(i % 3 ? cab(i, 28) : mulher(i, 28), 1010 + i, -6 + (i % 9) * 1.5 + hash(i) * 0.4, 1.4 + Math.floor(i / 9) * 1.2, { expr: "smile", look: 0.3, armB: T > 336.3 + hash(i) * 1.2 ? 1 : 0 }, { dark: 0.55, darkCol: "#2a1a2a" });
      A.light((g) => { sun(g, VW * 0.5, VH * 0.44, 30, "255,214,170"); rays(g, VW * 0.5, VH * 0.44, VW, 0.2, "255,210,160", 24, lt); }); } },
  // 58a "Novas lideranças surgiram" — armed leaders step forward one by one
  { t0: 339.68, fade: 0.2, tr: "punch", L: () => plat("q9", "gold", { near: [[-8, 10, 16]] }), lite: GOLD, cam: mv([0, 1.3, -4, 38, 20], [0, 1.4, -3.2, 34, 20]),
    act: (A, lt, u, T) => { for (let i = 0; i < 4; i++) { const k = smooth((T - 339.9 - i * 0.3) / 0.4); A.a({ ...cabArm(i * 3, 29), beard: i % 2 ? "#2a1d16" : undefined, scarf: "#a8281e" }, 1040 + i, -2.4 + i * 1.6, lerp(4.4, 2.6, k), { expr: "stern", look: 0, prop: i % 2 ? ["katana", 0] : undefined }); } } },
  // 58b "e os chamados redutos santos começaram a crescer." — a reduto rises: palisade, chapel, huts; crane up
  { t0: 341.58, fade: 0.2, L: () => plat("q10", "day", { dense: 0.8 }), lite: DAY, cam: path([[0, [0, 1.6, -6, 42]], [1, [0, 8, -12, 46, -220]]]),
    act: (A, lt, u, T) => { reduto(A, lt, 4); for (let i = 0; i < 16; i++) A.a(i % 3 ? cab(i, 30) : mulher(i, 30), 1060 + i, -10 + hash(i) * 20, 6 + hash(i + 3) * 6, { mode: "stroll", phase: (lt + i * 0.3) % 1, expr: "smile" });
      A.over((g) => bigText(g, "REDUTOS SANTOS", T - 342.35, 2.4, VH * 0.18, 96)); } },
  // 59a "Eram comunidades onde os sertanejos compartilhavam alimentos," — a long shared table, bowls passed from hand to hand
  { t0: 345.11, fade: 0.25, L: () => plat("q11", "gold", { near: [[-9, 12, 18]] }), lite: GOLD, bloom: 0.9, cam: mv([-2.6, 1.6, -3.6, 38], [2.6, 1.6, -3.4, 38]),
    act: (A, lt) => { for (let i = 0; i < 3; i++) A.sp("mesa", -3.2 + i * 3.2, 0, 3); A.fx(2.9, (g, c) => { for (let i = 0; i < 12; i++) { const [sx, sy, s] = P(c, -4.2 + i * 0.75, 0.86, 2.95); g.fillStyle = "#e8dcc0"; g.strokeStyle = "#3a2a1e"; g.lineWidth = 2; g.beginPath(); g.ellipse(sx, sy, 0.16 * s, 0.05 * s, 0, 0, 7); g.fill(); g.stroke(); } });
      for (let i = 0; i < 9; i++) A.a(i % 3 === 1 ? mulher(i, 31) : i % 3 === 2 ? crianca(i, 31) : cab(i, 31), 1080 + i, -4.4 + i * 1.1, 3.5, { expr: i % 2 ? "laugh" : "smile", look: (i % 2 ? -1 : 1) * 0.6, prop: i % 3 === 0 ? ["bread", 0] : undefined });
      A.fx(4, (g, c) => { fire(g, c, lt, 6, 0, 6, 0.6, 2); smokeCol(g, c, lt, 6, 1, 6, { h: 5, w: 0.6, col: [220, 216, 210], a: 0.3 }); }); A.sp("panela", 6, 0.1, 5.9); } },
  // 59b "organizavam sua própria vida" — work and drill: men practise with wooden swords, women wash, kids run
  { t0: 348.88, fade: 0.2, L: () => plat("q12", "day", { near: [[11, 14, 20]] }), lite: DAY, cam: path([[0, [3, 1.8, -5, 40]], [1, [-2, 1.8, -5, 40]]]),
    act: (A, lt) => { for (let i = 0; i < 8; i++) { const ph = (lt * 1.6 + (i % 2) * 0.5) % 1; A.a(cabArm(i, 32), 1100 + i, -5 + (i % 4) * 1.4, 4 + Math.floor(i / 4) * 1.3, { expr: "stern", prop: ["katana", ph < 0.5 ? ph * 2 : 2 - ph * 2], look: 0.4 }); }
      for (let i = 0; i < 3; i++) A.a(mulher(i + 4, 32), 1110 + i, 2.6 + i * 1.1, 3.2, { expr: "smile", prop: ["bread", 0] }); runS(A, crianca(1, 32), 1115, lt, -2, 2.4, 2.6, { expr: "laugh" }); runS(A, crianca(2, 32), 1116, lt, -3, 2.8, 2.6, { expr: "laugh" }); } },
  // 59c "e acreditavam estar construindo uma sociedade mais justa." — sunset prayer around the great cross; the camera rises with the light
  { t0: 350.83, fade: 0.25, L: () => plat("q13", "gold", { near: [[-9, 10, 16], [9, 12, 18]] }), lite: BACK, bloom: 1.2, cam: path([[0, [0, 1.0, -4, 40, 40]], [1, [0, 2.6, -6, 42, -20]]]),
    act: (A, lt) => { A.sp("cruz", 0, 0, 5, { sc: 0.9 }); for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2, r = 2.6 + (i % 2) * 0.8; A.a(i % 3 ? cab(i, 33) : mulher(i, 33), 1120 + i, Math.cos(a) * r, 5 + Math.sin(a) * r * 0.6, { expr: "smile_closed", look: -Math.cos(a) * 0.6, crouch: 0.3 }, { dark: 0.5, darkCol: "#2a1626" }); }
      A.light((g) => { sun(g, VW * 0.5, VH * 0.46, 34, "255,200,140"); rays(g, VW * 0.5, VH * 0.46, VW, 0.2, "255,190,130", 26, lt); }); } },
  // 60 "Mas o governo não enxergava aquilo como uma tentativa de sobrevivência." — in the capital, officials read the reports, stone-faced
  { t0: 354.69, fade: 0.25, L: () => sala("q14", "#4a4a4e", { frames: 2, panel: "#2a2a2e", win: 2, winCol: "#a8b4c0" }), lite: COLD, cam: mv([0, 1.6, -3, 38], [0, 1.6, -2.2, 34]), mood: ["#8890a0", 0.2],
    act: (A, lt) => { A.sp("mesa", 0, 0, 2.4, { sc: 1.2 }); for (let i = 0; i < 3; i++) A.a(i === 1 ? OFICIAL : POLIT(i + 8), 1140 + i, -1.4 + i * 1.4, 2.9, { expr: "stern", look: 0, prop: i === 1 ? ["paper", 0] : undefined }); } },
  // 61 "Enxergava como uma ameaça que precisava ser eliminada." — a hand marks the redoubt on the map with a red X
  { t0: 359.19, fade: 0.2, tr: "punch", L: () => mapaSul("q15", MST.ember), lite: { sa: 0 }, cam: mv([-0.6, -0.4, -16, 40], [0.2, -1.2, -9, 40]), kicks: [[361.95, 6]],
    act: (A, lt, u, T) => { hlSul(A, CONTEST, 1, "#b3221c", 0.25, true); marca(A, TAQ[0], TAQ[1], 3, "TAQUARUÇU", { kind: "fire" }); marca(A, TAQ[0], TAQ[1], T - 361.95, "", { kind: "x", col: "#ff3a2a" });
      A.over((g) => STAMP(g, "ELIMINAR", T - 361.95, VW * 0.5, VH * 0.76, "#ff3a2a", 90)); } },
  // 62a "Em 1914, as forças militares atacaram Taquaruçu" — artillery opens fire from the ridge
  { t0: 363.28, fade: 0.2, L: () => plat("q16", "grey", { near: [[-10, 12, 18]] }), lite: GREY, kicks: [[366.15, 9], [366.9, 6]], cam: path([[0, [-1, 1.6, -8, 42, 0]], [1, [0, 1.5, -7, 40, 0]]]),
    act: (A, lt, u, T) => { for (const [x, z, t0] of [[-1.2, 3.4, 366.15], [3.2, 5, 366.9]] as [number, number, number][]) { const fa = T - t0, rec = fa > 0 && fa < 1 ? Math.exp(-fa * 6) * 0.35 : 0;
        A.sp("cannon", x - rec, 0, z); A.fx(z - 0.05, (g, c) => { if (fa < 0 || fa > 2.5) return; const [mx, my, ms] = P(c, x + 2.8, 2.0, z); if (fa < 0.1) { glow(g, mx, my, 3 * ms, "rgba(255,220,140,1)", 1); } for (let k = 0; k < 6; k++) puff(g, mx + (fa * 3 + k * 0.4) * ms, my - fa * 0.8 * ms, (0.4 + fa * 1.2) * ms, [210, 206, 200], 0.6 * clamp(1 - fa / 2.5)); }); }
      for (let i = 0; i < 4; i++) A.a(sold(i), 1150 + i, -3 + i * 1.6, 4 + (i % 2) * 1.4, { expr: "stern", look: 1, facing: 1 });
      A.over((g) => caption(g, "TAQUARUÇU · 1914", T - 363.5, 2.6)); } },
  // 62b "e destruíram o reduto." — shells fall on the redoubt; the chapel bursts into flame
  { t0: 367.73, fade: 0.1, tr: "flash", L: () => plat("q17", "fire", { dense: 0.8 }), lite: NIGHTFIRE, bloom: 1.2, kicks: [[367.8, 10], [368.3, 7], [368.8, 6]], wx: ["ash", 120, 0.6], cam: hand(mv([0, 2.2, -7, 44, -20], [0, 1.8, -6, 42, -10]), 0.06),
    act: (A, lt, u, T) => { reduto(A, lt, 2, { smoke: false });
      A.fx(4, (g, c) => { blast(g, c, T - 367.8, 0, 0, 8, 3, 3); blast(g, c, T - 368.3, -8, 0, 7, 2.6, 5); blast(g, c, T - 368.8, 7, 0, 9, 2.6, 7); for (const [x, z] of [[0, 8], [-8, 6.5], [7, 7.5]]) if (T > 368) fire(g, c, lt, x, 0, z, 2.4, x + 9); embers(g, c, lt, 0, 7, 20, 70, 10, 4); });
      for (let i = 0; i < 5; i++) runS(A, i % 2 ? mulher(i, 34) : cab(i, 34), 1160 + i, lt, 3 - i * 1.2, 2.6 + (i % 3) * 0.6, -3.4, { expr: "fear" }); } },
  // 63 "Mas os sobreviventes fugiram e se reorganizaram em outras comunidades." — night: survivors with torches run into the forest
  { t0: 369.59, fade: 0.25, L: () => mata("q18", "night"), lite: NIGHTFIRE, bloom: 1.0, cam: (u, lt) => ({ x: -2 + lt * 2.2, y: 1.4, z: -4, fov: 40, shift: 0 }),
    act: (A, lt) => { for (let i = 0; i < 8; i++) runS(A, i % 3 === 0 ? mulher(i, 35) : cab(i, 35), 1170 + i, lt, -4 - i * 1.4, 3 + (i % 3) * 0.8, 2.6, { expr: "fear" });
      for (let i = 0; i < 3; i++) lantern(A, -2.4 - i * 3.6 + lt * 2.6, 1.9, 3.2 + i * 0.6, lt + i, 1); } },
  // 64 "O movimento continuava vivo." — dawn, a new camp; a man raises his fist and the flag goes up
  { t0: 374.16, fade: 0.3, L: () => plat("q19", "dawn", { near: [[-8, 10, 16]] }), lite: BACK, bloom: 1.1, cam: mv([0, 0.7, -3, 38, 120], [0, 0.8, -2.2, 34, 120]),
    act: (A, lt, u, T) => { A.a(cabArm(3, 36), 1180, 0, 2.6, { expr: T > 375.5 ? "shout" : "stern", prop: ["fist", T > 375.5 ? 1 : 0] }); flag(A, "cont", 1.4, 3.6, 3.6, 1.5, 1.0, { wind: 1.2 });
      A.light((g) => { sun(g, VW * 0.3, VH * 0.6, 34, "255,210,160"); rays(g, VW * 0.3, VH * 0.6, VW, 0.22, "255,200,150", 26, lt); lensFlare(g, VW * 0.3, VH * 0.6, 0.6); }); } },
  // 65a "Em setembro daquele ano, os sertanejos atacaram a madeireira Lumber," — torches rush across the dark yard toward the mill
  { t0: 376.72, fade: 0.25, L: () => plat("q20", "night", { dense: 0.5, kind: "mud" }), lite: NIGHTFIRE, bloom: 1.0, cam: path([[0, [-6, 1.4, -6, 42]], [1, [0, 1.8, -8, 44]]]),
    act: (A, lt, u, T) => { A.sp("serraria", 4, 0, 18); A.sp("toras", -6, 0, 12);
      for (let i = 0; i < 12; i++) { runS(A, cabArm(i, 37), 1190 + i, Math.max(0, T - 379.1), -10 - (i % 6) * 1.4, 6 + Math.floor(i / 6) * 1.6 + (i % 2) * 0.3, 3.4, { expr: "shout" }); if (i % 2 === 0) lantern(A, -9.6 - (i % 6) * 1.4 + Math.max(0, T - 379.1) * 3.4, 2.0, 6 + Math.floor(i / 6) * 1.6, lt + i, 1); }
      A.over((g) => caption(g, "SETEMBRO DE 1914 · MADEIREIRA LUMBER", T - 377.0, 3.6)); } },
  // 65b "um dos principais símbolos da exploração econômica na região." — the sawmill burns, the sign blazing
  { t0: 380.93, fade: 0.15, tr: "flash", L: () => plat("q21", "fire", { dense: 0.4, kind: "mud" }), lite: NIGHTFIRE, bloom: 1.4, kicks: [[381.3, 6]], wx: ["ash", 140, 0.6], cam: path([[0, [0, 2.4, -10, 44, -20]], [1, [0, 3.4, -14, 46, -40]]]),
    act: (A, lt, u, T) => { A.sp("serraria", 0, 0, 14);
      A.fx(13.8, (g, c) => { for (let i = 0; i < 7; i++) fire(g, c, lt, -10 + i * 3.4, 5 + hash(i) * 2, 13.6, 3 + hash(i + 2) * 2, i); smokeCol(g, c, lt, -4, 9, 14, { h: 40, w: 6, a: 0.8, wind: 0.4 }); smokeCol(g, c, lt, 6, 9, 15, { h: 36, w: 6, a: 0.8, wind: 0.5, seed: 4 }); embers(g, c, lt, 0, 12, 26, 90, 20, 6); });
      for (let i = 0; i < 6; i++) A.a(cabArm(i, 38), 1210 + i, -5 + i * 2, 4 + (i % 2), { expr: "shout", prop: ["torch", 0], look: 0 }, { dark: 0.7, darkCol: "#1a0a06" }); } },
  // 66 "A situação havia se tornado muito mais grave." — a newspaper spins in and slams into frame
  { t0: 384.87, fade: 0.2, L: () => sala("q22", "#3a3a40"), lite: LAMP, cam: mv([0, 1.55, -2.8, 38], [0, 1.55, -2.4, 36]), kicks: [[385.6, 6]],
    act: (A, lt, u, T) => { const k = easeOut(clamp((T - 385.0) / 0.6)); panel(A, 1.6, (w) => { w.rect(-0.9, 0.5, 1.8, 2.1, "#ece4d0", 3); w.text("CONFLITO NO CONTESTADO", 0, 2.35, 0.13, "#1e1a18"); w.text("REBELDES QUEIMAM SERRARIA", 0, 2.12, 0.09, "#8a1e16"); for (let i = 0; i < 14; i++) w.line([[-0.8, 1.9 - i * 0.09], [i % 3 === 2 ? 0 : 0.8, 1.9 - i * 0.09]], 1.6, "#5a5248"); w.rect(-0.8, 0.6, 0.7, 0.6, "#5a5248", 0); },
      { pivot: [0, 1.55], rot: (1 - k) * 9, dx: 0, dy: 0 }); } },
  // 67 "O conflito já ameaçava interesses empresariais e políticos." — the company men panic in their office; papers fly
  { t0: 388.09, fade: 0.2, L: () => sala("q23", "#4a3a34", { frames: 2, panel: "#2a1e18", curtain: "#5a1e1a", win: 1 }), lite: LAMP, cam: path([[0, [-1, 1.65, -2.8, 38]], [1, [0.8, 1.6, -2.4, 36]]]),
    act: (A, lt) => { A.a(FARQUHAR, 1230, -0.8, 2.4, { expr: "shout", look: 1, armB: 1 }); A.a(EXEC, 1231, 0.8, 2.6, { expr: "nervous", look: -1, prop: ["letter", 0] }); A.a(POLIT(2), 1232, 2.0, 3.0, { expr: "shock", look: -1 });
      A.fx(2, (g, c) => flutter(g, c, lt, { n: 14, x0: -2, x1: 2, z0: 1.6, z1: 3, top: 2.6, cols: ["#f2ead2"], size: 0.18, fall: 0.5, loop: true, seed: 8 })); } },
  // 68 "Foi então que o governo federal decidiu intervir." — the palace in Rio, flag flying; the order is signed
  { t0: 392.33, fade: 0.25, L: () => cidade("q24", "day", ["#efe6d2", "#e6dcc4", "#f2ead6"], 61), lite: DAY, cam: path([[0, [0, 4.5, -16, 44, -40]], [1, [0, 5, -13, 42, -50]]]),
    act: (A, lt, u, T) => { panel(A, 10, (w) => { w.rect(-9, 0, 18, 9, "#efe6d2", 3); for (let i = 0; i < 8; i++) w.rect(-8 + i * 2.2, 0, 0.7, 7.2, "#e0d6c0", 2); w.rect(-9.4, 7.2, 18.8, 1.0, "#d8ccb4", 3); w.poly([[-4, 8.2], [4, 8.2], [0, 10.2]], "#e6dcc4", 3); w.text("GOVERNO FEDERAL", 0, 7.7, 0.6, "#5a4a2a"); });
      flag(A, "br", 0, 10.6, 9.9, 2.6, 1.8, { wind: 1 }); for (let i = 0; i < 2; i++) A.a(sold(i), 1240 + i, -1.6 + i * 3.2, 7, { expr: "stern", prop: ["rifleUp", 0] }); } },
  // 69a "Milhares de soldados foram enviados para a região," — troop trains unload; columns form up on the platform
  { t0: 395.81, fade: 0.2, tr: "whip", L: () => plat("q25", "day", { dense: 0.6 }), lite: DAY, cam: path([[0, [-4, 2, -7, 44, -20]], [1, [4, 4.6, -10, 46, -120]]]),
    act: (A, lt) => { railsX(A, 12, -60, 60); train(A, 6, 12, { wagons: ["wagonT", "wagonT", "wagonT"] });
      for (let i = 0; i < 16; i++) walkS(A, sold(i), 1250 + i, lt, -10 + i * 1.2, 9.2, 1.0, { expr: "stern" }); marchF(A, (i) => sold(i + 3), lt, 4, 8, 3, 0.4, 1.2, 1.5, 1270); } },
  // 69b "sob o comando do general Fernando Setembrino de Carvalho." — the general, saluted; his name
  { t0: 398.48, fade: 0.2, L: () => plat("q26", "day", { near: [[-8, 10, 16]] }), lite: DAY, cam: mv([1.2, 1.6, -2.8, 36], [0.2, 1.65, -2.0, 30]),
    act: (A, lt, u, T) => { A.a(SETEMBRINO, 1300, 0, 2.0, { expr: "stern", look: 0, prop: ["portfolio", 0] }); A.a(sold(2), 1301, 1.6, 2.8, { expr: "stern", look: -1, facing: -1, prop: ["rifleUp", 0] }); flag(A, "br", -1.8, 3.2, 3.6, 1.4, 0.95);
      A.over((g) => caption(g, "GENERAL FERNANDO SETEMBRINO DE CARVALHO", T - 400.3, 2.0)); } },
  // 70a "Agora, os sertanejos enfrentariam uma força militar muito superior," — the federal army spread across the plateau
  { t0: 402.78, fade: 0.25, L: () => plat("q27", "grey", { dense: 0.6 }), lite: GREY, cam: path([[0, [0, 2.4, -4, 44, -30]], [1, [0, 6, -9, 48, -160]]]),
    act: (A, lt) => { marchF(A, (i) => sold(i), lt, 8, 12, 3, 0.8, 1.2, 1.6, 1310, () => ({ expr: "stern" })); for (let i = 0; i < 4; i++) A.sp("cannon", -12 + i * 8, 0, 18); flag(A, "br", 0, 3.6, 4, 1.5, 1.0); } },
  // 70b "equipada com metralhadoras," — machine gun firing, cartridges flying
  { t0: 407.33, fade: 0.1, tr: "punch", L: () => plat("q28", "grey", { near: [[8, 10, 16]] }), lite: GREY, kicks: [[408.2, 4]], cam: hand(mv([-0.4, 1.1, -3.4, 36, 0], [-0.2, 1.1, -2.8, 32, 0]), 0.04),
    act: (A, lt, u, T) => { A.sp("mg", 0, 0, 1.6, { sc: 1.4 }); A.a(sold(4), 1400, -0.9, 2.0, { expr: "shout", crouch: 0.6, look: 1 });
      A.fx(1.55, (g, c) => { if (T < 408.2) return; const f = (T * 12) % 1; const [mx, my, s] = P(c, 0.9, 0.75, 1.55); if (f < 0.5) { glow(g, mx, my, 0.5 * s, "rgba(255,220,140,1)", 1); g.fillStyle = "#fff3c8"; g.beginPath(); g.moveTo(mx, my - 0.05 * s); g.lineTo(mx + 0.5 * s, my); g.lineTo(mx, my + 0.05 * s); g.fill(); }
        for (let i = 0; i < 8; i++) { const k = ((T - 408.2) * 4 + i / 8) % 1, [hy] = bounce(k, 0.7, 2, 0.3), [sx, sy, ss] = P(c, -0.1 - k * 1.2, Math.max(0, hy), 1.5); g.fillStyle = "#d8a84a"; g.fillRect(sx, sy, 0.04 * ss, 0.08 * ss); } }); } },
  // 70c "artilharia" — a cannon recoils with a flash
  { t0: 409.13, fade: 0.05, L: () => plat("q29", "grey", { near: [[-8, 10, 16]] }), lite: GREY, kicks: [[409.2, 8]], cam: mv([1.6, 1.6, -7, 40], [1.2, 1.5, -6, 38]),
    act: (A, lt, u, T) => { const fa = T - 409.2, rec = fa > 0 && fa < 1 ? Math.exp(-fa * 6) * 0.4 : 0; A.sp("cannon", -rec, 0, 2.6); A.a(sold(5), 1401, -2, 3, { expr: "stern", look: 1, armB: 1 });
      A.fx(2.55, (g, c) => { if (fa < 0 || fa > 2) return; const [mx, my, ms] = P(c, 2.8, 2.0, 2.55); if (fa < 0.1) glow(g, mx, my, 4 * ms, "rgba(255,220,140,1)", 1); for (let k = 0; k < 7; k++) puff(g, mx + (fa * 3 + k * 0.4) * ms, my - fa * ms, (0.4 + fa * 1.4) * ms, [210, 206, 200], 0.6 * clamp(1 - fa / 2)); }); } },
  // 70d "e outros recursos modernos." — the first military aeroplane in Brazil flies over the forest
  { t0: 410.13, fade: 0.1, L: () => plat("q30", "day", { dense: 1.4 }), lite: DAY, cam: mv([0, 2, -6, 44, 160], [1, 2.2, -6, 44, 140]),
    act: (A, lt, u, T) => { A.sp("biplane", -12 + lt * 11, 8.5 + Math.sin(lt) * 0.3, 22, { sc: 1.4, rot: -0.04 }); A.fx(25.9, (g, c) => { for (let i = 0; i < 10; i++) { const [sx, sy, s] = P(c, -12 + (lt - i * 0.05) * 11 - 3.5, 9.4, 22); puff(g, sx, sy, (0.3 + i * 0.1) * s, [200, 200, 200], 0.3 * (1 - i / 10)); } });
      for (let i = 0; i < 3; i++) A.a(cab(i, 39), 1410 + i, -2 + i * 1.6, 3.2, { expr: "shock", look: 0.4, headTilt: -14 }); } },
  // 71a "Mas os soldados encontraram uma dificuldade:" — a patrol stops in the dense forest, lost, looking around
  { t0: 412.24, fade: 0.25, L: () => mata("q31", "grey"), lite: GREY, cam: path([[0, [-1, 1.5, -4, 40]], [1, [1, 1.5, -3.2, 36]]]), mood: ["#8a9a8a", 0.2],
    act: (A, lt) => { for (let i = 0; i < 5; i++) A.a(sold(i), 1420 + i, -2.4 + i * 1.2, 2.6 + (i % 2) * 0.8, { expr: i % 2 ? "nervous" : "stern", look: Math.sin(lt * 1.3 + i * 2), prop: ["rifleUp", 0] }); } },
  // 71b "os combatentes do Contestado conheciam profundamente aquelas matas." — sertanejos slip between the trunks, unseen
  { t0: 415.23, fade: 0.2, L: () => mata("q32", "grey"), lite: GREY, cam: (u, lt) => ({ x: -1 + lt * 0.9, y: 1.4, z: -3.6, fov: 38, shift: 0 }),
    act: (A, lt) => { for (let i = 0; i < 4; i++) walkS(A, cabArm(i, 40), 1430 + i, lt, -3 + i * 1.8, 4 + (i % 2) * 2, 1.2, { expr: "stern" }, { dark: 0.3, darkCol: "#1a2418" });
      for (let i = 0; i < 6; i++) panel(A, 2.6 + i * 1.2, (w) => { const x = -4 + i * 1.9; w.poly([[x - 0.35, 0], [x + 0.35, 0], [x + 0.3, 8], [x - 0.3, 8]], w.vgrad(0, 8, "#2a1e16", "#4a3626"), 3); }); } },
  // 72 "Sabiam utilizar trilhas, esconderijos e caminhos que dificultavam o avanço das tropas." — ambush: they pop up from cover and fire; soldiers dive
  { t0: 419.73, fade: 0.2, L: () => mata("q33", "grey"), lite: GREY, kicks: [[422.8, 6], [423.4, 5]], cam: hand(path([[0, [-2, 1.2, -4, 40]], [1, [1.5, 1.3, -4.6, 42]]]), 0.04),
    act: (A, lt, u, T) => { const up = smooth((T - 422.2) / 0.3);
      for (let i = 0; i < 3; i++) A.a(cabArm(i, 41), 1440 + i, -3.5 + i * 1.4, 2.2, { expr: up > 0.5 ? "shout" : "stern", look: 1, facing: 1, crouch: 0.9 - 0.5 * up, prop: ["rifleUp", 0] });
      A.sp("toras", -2.4, 0, 1.6, { sc: 0.7 }); for (let i = 0; i < 4; i++) fall(A, sold(i), 1450 + i, 2 + i * 1.3, 5 + (i % 2) * 1.2, T, 422.9 + i * 0.25, { dir: 1, run: -1.2 });
      A.fx(2.1, (g, c) => { for (let i = 0; i < 3; i++) { const k = (T - 422.8 - i * 0.3); if (k > 0 && k < 0.08) { const [sx, sy, s] = P(c, -3.0 + i * 1.4, 1.3, 2.1); glow(g, sx, sy, 0.6 * s, "rgba(255,220,140,1)", 1); } } }); } },
  // 73 "Então, o Exército adotou uma estratégia diferente." — the general at the map table draws a circle around the redoubt
  { t0: 425.75, fade: 0.25, L: () => sala("q34", "#4a4a40", { map: true, lamps: 2, panel: "#2a2a24" }), lite: LAMP, cam: mv([0.8, 1.6, -2.8, 38], [0.2, 1.55, -2.0, 34]),
    act: (A, lt) => { A.sp("mesa", 0, 0, 2.2, { sc: 1.1 }); A.a(SETEMBRINO, 1300, 0, 2.6, { expr: "stern", look: 0, prop: ["pen", (lt * 2) % 1] }); A.a(OFICIAL, 1460, 1.5, 2.9, { expr: "neutral", look: -1 }); A.a({ ...OFICIAL, moustache: undefined }, 1461, -1.5, 2.9, { expr: "neutral", look: 1 }); } },
  // 74a "Em vez de depender apenas de ataques diretos, começou a cercar os redutos" — the ring of troops closes around the redoubt on the map
  { t0: 429.54, fade: 0.2, L: () => mapaSul("q35", MST.olive, false), lite: { sa: 0 }, cam: mv([0.6, -1.7, -15, 40], [0.6, -1.7, -10, 40]),
    act: (A, lt, u, T) => { const k = smooth((T - 432.3) / 2.4), R = lerp(3.2, 1.1, k), cx = (TAQ[0] + 51) * 2 - 0.3, cy = (TAQ[1] + 26.5) * 2 - 0.4;
      marca(A, TAQ[0], TAQ[1], 3, "REDUTO", { kind: "fire" });
      A.fx(-0.1, (g, c) => { for (let i = 0; i < 36; i++) { const a = (i / 36) * Math.PI * 2, [sx, sy, s] = P(c, cx + Math.cos(a) * R, cy + Math.sin(a) * R, 0); g.fillStyle = "#2a3a5a"; g.strokeStyle = "#f2ead2"; g.lineWidth = 2; g.beginPath(); g.arc(sx, sy, 0.1 * s, 0, 7); g.fill(); g.stroke(); }
        const [ox, oy, s] = P(c, cx, cy, 0); g.strokeStyle = "rgba(42,58,90,0.6)"; g.lineWidth = 0.08 * s; g.setLineDash([12, 8]); g.beginPath(); g.arc(ox, oy, R * s, 0, 7); g.stroke(); g.setLineDash([]); }); } },
  // 74b "e impedir que alimentos e mantimentos chegassem até a população." — a cart of food sacks is stopped at a checkpoint; bayonets lowered
  { t0: 434.18, fade: 0.2, L: () => plat("q36", "grey", { near: [[-10, 12, 18]] }), lite: GREY, cam: path([[0, [-1.6, 1.6, -7, 40]], [1, [0.6, 1.6, -6, 38]]]),
    act: (A, lt, u, T) => { const stop = clamp((T - 434.25) / 1.2); A.sp("cart", lerp(-4, -1.6, easeOut(stop)), 0, 3.4); A.sp("sacos", lerp(-4, -1.6, easeOut(stop)) - 0.2, 0.8, 3.38, { sc: 0.6 });
      A.a(cab(6, 42), 1470, lerp(-2.3, 0.1, easeOut(stop)), 3.6, { expr: T > 435.5 ? "fear" : "neutral", look: 1, mode: stop < 1 ? "stroll" : "stand", phase: (lt * 1.2) % 1 });
      for (let i = 0; i < 3; i++) A.a(sold(i + 6), 1480 + i, 1.6 + i * 0.9, 3.2 + (i % 2) * 0.5, { expr: "stern", look: -1, facing: -1, prop: ["rifleUp", 0] }); A.sp("barrier", 1.0, 0, 3.0, { sc: 0.7 }); } },
  // 75 "E essa decisão foi devastadora." — inside the ring: hollow faces in the grey redoubt, slow push
  { t0: 438.18, fade: 0.3, L: () => plat("q37", "storm", { dense: 0.6 }), lite: COLD, wx: ["rain", 160, 0.3], cam: mv([0, 1.4, -4, 38], [0, 1.45, -2.8, 32]), mood: ["#7a8090", 0.3],
    act: (A, lt) => { A.sp("rancho", -3, 0, 7); A.sp("capela", 4, 0, 10); for (let i = 0; i < 5; i++) A.a(i % 2 ? mulher(i, 43) : cab(i, 43), 1490 + i, -2.4 + i * 1.2, 2.6 + (i % 2) * 0.6, { expr: "sad", look: 0 }); } },
];
