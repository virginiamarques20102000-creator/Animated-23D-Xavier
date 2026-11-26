// 70 – 151 s: Uribe e as FARC, a madrugada de 1º de março de 2008 (ataque em Angostura), Raúl Reyes, a vitória de Uribe,
// a acusação de Correa, a crise chega a Brasília, os telefonemas, o governo tenta impedir um conflito maior.
import { Sc, walkS, runS, crowd, flag, caption, fall } from "./kit";
import { din, dinT, soco } from "../dinamica";
import { loc, gabinete, carondelet, pichincha, colonial, narino, monserrate, selva, rio, salaImprensa, salaMapa, planalto, congresso, sulAmerica, SAST, SKY, CITY, hillL, clouds, mtn } from "./cenarios";
import { fala, hlSA, arrowSA, pinSA, pulsoSA, heli, jato, telefone, tela, mira, visaoNoturna, flashTela, flashes, clamp, easeOut, glow, puff, P, VW, VH, hash } from "./kit2";
import { LULA, CHAVEZ, CHAVEZ_H, CORREA, CORREA_T, URIBE, REYES, solCO, guerr, assessor, jornal } from "./elenco";
import { DAY, GOLD, BACK, LAMP, MOON, NOON, NIGHTFIRE, COLD, RED } from "./looks";
import { fire, smokeCol, sun } from "./engine";
import { blast, scorch, embers, birds, lightning, flutter, lensFlare } from "./fx";
import type { Shot } from "./types";

const GREYL = { sx: 0.3, sy: 0.2, sa: 0.16, rim: "#f0d8c8", ra: 0.35, rdx: 0.4, rdy: -1, key: "#c8b8b8", ka: 0.18 };
const madeira = { near: "#6a4a30", far: "#8a6440", kind: "wood" as const, seed: 4 };
const noiteSelva = (K: string) => loc(SKY.night, { near: "#1a2418", far: "#243024", kind: "grass", seed: 21 }, [hillL(K, 200, "#141e24", 6, 18, 3), selva(K + "a", 70, "#14241c", 4, { blur: 1.6, moon: true }), selva(K + "b", 30, "#18301e", 9, { h: 14, blur: 0.6 })]);
/** acampamento das FARC: lonas, redes, caixas, rádio, fogueira */
const acampamento = (A: Sc, lt: number, o: { fogo?: boolean; redes?: boolean } = {}) => {
  A.sp("lona", -4.5, 0, 9, { sc: 1 }); A.sp("lona", 3.6, 0, 11, { sc: 1.1 }); A.sp("lona", -0.5, 0, 14, { sc: 1.2 });
  if (o.redes !== false) { A.sp("rede", -4.5, 0, 9.2, { sc: 0.85 }); A.sp("rede", 3.6, 0, 11.2, { sc: 0.9 }); }
  A.sp("caixas", 1.2, 0, 7.5, { sc: 1 }); A.sp("radio", 1.0, 0.9, 7.4, { sc: 1 });
  if (o.fogo !== false) { A.fx(6, (g, c) => fire(g, c, lt, -1.2, 0, 6, 0.6, 3)); A.light((g) => { const [sx, sy] = P(A.cam, -1.2, 0.3, 6); glow(g, sx, sy, VW * 0.25, "rgba(255,140,60,1)", 0.35); }); }
};

export const SHOTS_B: Shot[] = [
  // 11a "Mas havia outro personagem importante nessa história:" — sala escura, um refletor acende sobre uma silhueta
  { t0: 70.2, fade: 0.25, L: () => loc(undefined, { near: "#141418", far: "#1e1e24", kind: "wood", seed: 22 }, [salaImprensa("g1", 7, "co", "#141a2a")], true), cam: dinT(70.2, [0, 1.6, -5, 42], [[72.0, [0, 1.6, -3.4, 38]], [73.85, [0, 1.6, -2.6, 34]]]), lite: BACK, act: (A, lt, u, T) => {
      const on = clamp((T - 71.1) / 0.15), rev = clamp((T - 73.9) / 0.4);
      A.a(URIBE, 1, 0, 3.0, { expr: "stern", look: 0 }, { dark: 1 - rev * 0.9, darkCol: "#0a0a10" });
      A.over((g) => { g.save(); g.fillStyle = `rgba(0,0,0,${0.75 - 0.5 * on})`; g.fillRect(0, 0, VW, VH); g.globalCompositeOperation = "lighter"; const gr = g.createRadialGradient(VW / 2, VH * 0.45, 20, VW / 2, VH * 0.5, VH * 0.6); gr.addColorStop(0, `rgba(255,240,200,${0.35 * on})`); gr.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = gr; g.fillRect(0, 0, VW, VH); g.restore(); });
    } },
  // 11b "Álvaro Uribe, presidente da Colômbia," — Casa de Nariño, Uribe na escadaria, bandeira colombiana
  { t0: 74.4, fade: 0.15, L: () => loc(SKY.andes, { near: "#a8a498", far: "#989480", kind: "stone", seed: 23 }, [clouds("g2", 260, ["#f4f6f8", "#c8d4de"], 5), monserrate("g2", 190), narino("g2", 30)]),
    cam: dinT(74.4, [-3, 1.5, -3.2, 40], [[74.45, [-1, 1.6, -2.6, 38]], [75.8, [1.5, 2.6, -9, 46, -15]]]), lite: DAY, act: (A, lt, u, T) => {
      A.a(URIBE, 1, 0, 2.6, { expr: "smile_closed", look: 0, armB: T > 75.2 ? 1.4 : 0.2 }); flag(A, "co", 2.8, 4.6, 6, 2.4, 1.6, { wind: 0.9 });
      for (let i = 0; i < 2; i++) A.a({ jacket: "#1e2a4a", pants: "#c8c4b8", boots: "#141414", hat: "peaked", cap: "#1e2a4a", rifle: true }, 30 + i, -4 + i * 8, 6.5, { expr: "stern" });
      A.over((g) => caption(g, "Bogotá, Colômbia", lt - 0.3, 2.1));
    } },
  // 11c "que tinha uma relação difícil com Chávez" — Uribe e Chávez frente a frente numa cúpula, faíscas entre os dois
  { t0: 76.75, fade: 0.15, L: () => loc(undefined, { near: "#3a2a24", far: "#4a3a30", kind: "wood", seed: 24 }, [salaImprensa("g3", 8, "ve", "#3a2a3a")], true), cam: soco(dinT(76.75, [0, 1.55, -4.2, 40], [[78.55, [0, 1.5, -2.8, 36]], [79.6, [0.6, 1.5, -2.6, 34]]]), [[1.9, 0.1]]), lite: RED, kicks: [[78.6, 8], [79.65, 6]], act: (A, lt, u, T) => {
      const k = T - 78.6; A.a(URIBE, 1, 1.0, 3.0, { expr: T > 78.6 ? fala(T, "firme") : "stern", look: -1, facing: -1, prop: T > 78.6 ? ["point", 0.3] : null }, { flip: true });
      A.a(CHAVEZ, 2, -1.0, 3.0, { expr: T > 79.0 ? fala(T, "bravo") : "stern", look: 1, facing: 1, prop: T > 79.0 ? ["point", 0.2] : null });
      if (k > 0) A.fx(2.9, (g, c) => { const [sx, sy, s] = P(c, 0, 1.9, 2.9); for (let i = 0; i < 3; i++) lightning(g, sx - 0.4 * s, sy - (0.1 + i * 0.1) * s, sx + 0.4 * s, sy - (0.05 + i * 0.1) * s, 0.8 * (Math.floor(T * 15 + i) % 2), Math.floor(T * 10) + i); });
    } },
  // 11d "e enfrentava um conflito armado" — soldados colombianos avançam na selva atirando
  { t0: 80.2, fade: 0.12, L: () => loc(["#5a7a6a", "#c8d8b8"], { near: "#3a4a28", far: "#5a6a3a", kind: "grass", seed: 25 }, [selva("g4", 70, "#2a4a30", 7, { blur: 1.5 }), selva("g4b", 22, "#2a5030", 11, { h: 12 })]), cam: hand(dinT(80.2, [-2, 1.1, -3.5, 40], [[80.85, (lt) => [-1.5 + lt * 0.9, 1.0, -2.6, 36]]]), 0.04), lite: { ...DAY, key: "#d0e8c0", ka: 0.15 }, kicks: [[81.2, 5], [82.0, 5]], act: (A, lt, u, T) => {
      for (let i = 0; i < 4; i++) { const x = -2.6 + i * 1.5 + lt * 0.9, z = 2.8 + (i % 2) * 1.2; A.s(solCO(i), 60 + i, x, z, { mode: "stand", aim: true, expr: "stern" });
        const sh = (T * 7 + i * 0.37) % 1; if (sh < 0.12) A.fx(z - 0.01, (g, c) => { const [sx, sy, s] = P(c, x + 0.9, 1.3, z); glow(g, sx, sy, 0.6 * s, "rgba(255,220,140,1)", 1); g.fillStyle = "#fff3c8"; g.beginPath(); g.moveTo(sx, sy - 0.05 * s); g.lineTo(sx + 0.4 * s, sy); g.lineTo(sx, sy + 0.05 * s); g.fill(); }); }
    } },
  // 11e "contra as Forças Armadas Revolucionárias da Colômbia, as FARC." — guerrilheiros no acampamento, de dia
  { t0: 83.3, fade: 0.15, L: () => loc(["#6a8a7a", "#d8e0c0"], { near: "#4a4a2a", far: "#6a6a3a", kind: "mud", seed: 26 }, [selva("g5", 60, "#2a4a30", 13, { blur: 1.4 }), rio("g5", 40, "#5a7a6a")]),
    cam: dinT(83.3, [4, 2.4, -6, 44, -15], [[84.2, [1, 1.6, -3, 40]], [86.95, [0, 1.5, -2.0, 36]]]), lite: DAY, act: (A, lt, u, T) => {
      acampamento(A, lt, { fogo: true });
      for (let i = 0; i < 6; i++) A.a(guerr(i), 80 + i, -3.4 + i * 1.35, 2.6 + (i % 3) * 0.9, { expr: "stern", look: hash(i) - 0.5 });
    } },
  // 12 "E foi justamente esse conflito que colocou Lula diante de uma situação delicada." — Lula diante do mapa na sala de reuniões, suando
  { t0: 87.46, fade: 0.25, L: () => loc(undefined, madeira, [salaMapa("h1", 6)], true), cam: dinT(87.46, [2, 1.8, -3, 42], [[89.15, [0.8, 1.8, -2.6, 42]], [91.0, [0.3, 1.75, -2.0, 38]], [92.6, [0.15, 1.75, -1.5, 36]]]), lite: LAMP, act: (A, lt, u, T) => {
      A.a(LULA, 1, 0, 3.2, { expr: T > 92.6 ? "nervous" : "stern", look: T > 91.0 ? 0 : -0.8, facing: T > 91.0 ? 0 : -1, headTilt: T > 92.6 ? -5 : 0 });
      A.fx(5.9, (g, c) => { for (const [lo, la] of [CITY.caracas, CITY.bogota, CITY.quito]) { const [sx, sy, s] = P(c, (lo + 62) * 0.8 * 0.085, (la + 12) * 0.8 * 0.085 + 2.7, 5.9); glow(g, sx, sy, 0.3 * s, "rgba(255,60,40,1)", 0.6 + 0.4 * Math.sin(T * 6)); } });
    } },
  // 13a "Na madrugada de primeiro de março de 2008" — selva à noite, o acampamento dormindo sob a lua
  { t0: 94.08, fade: 0.4, L: () => noiteSelva("i1"), cam: dinT(94.08, [0, 6, -18, 46, -60], [[94.45, [0, 2.4, -6, 42, -10]], [96.4, [0.5, 1.8, -3, 40]]]), lite: MOON, bloom: 0.7, act: (A, lt, u, T) => {
      acampamento(A, lt); A.a(guerr(1), 90, 2.4, 6.5, { expr: "neutral", look: -0.5, prop: ["rifleUp", 0] });
      A.light((g) => { const mx = VW * 0.78, my = VH * 0.16; glow(g, mx, my, 160, "rgba(200,220,255,1)", 0.35); g.fillStyle = "#eef2ff"; g.beginPath(); g.arc(mx, my, 34, 0, 7); g.fill(); });
      A.over((g) => caption(g, "1º de março de 2008 — madrugada", lt - 1.8, 4.4));
    } },
  // 13b "militares colombianos" — aviões de ataque passam baixo no céu escuro
  { t0: 98.5, fade: 0.15, L: () => loc(SKY.night, { near: "#141c18", far: "#1a2420", kind: "grass", seed: 27 }, [hillL("i2", 200, "#101820", 6, 18, 3), selva("i2", 40, "#121e18", 5, { blur: 0.8, moon: true })]), cam: soco(din([0, 2, -6, 46, 60], [[0.1, [0, 2.4, -6, 42, 80]]]), [[0.4, 0.1]]), lite: MOON, act: (A, lt) => {
      jato(A, -22 + lt * 22, 7, 18, { luz: true, sc: 1, ang: -0.04 }); jato(A, -34 + lt * 22, 9, 24, { luz: true, sc: 1, ang: -0.04 }); heli(A, 12 - lt * 5, 6, 22, { dir: -1, sc: 0.8 });
    } },
  // 13c "atacaram um acampamento das FARC" — as bombas caem no acampamento: clarão, fumaça preta, tremor
  { t0: 100.2, L: () => noiteSelva("i3"), cam: soco(hand(dinT(100.2, [0, 3.2, -14, 46, -25], [[100.25, [0, 2.6, -12, 44, -20]], [101.5, [-1, 2.2, -9, 42, -12]]]), 0.05), [[0.05, 0.14], [1.3, 0.1]]), lite: NIGHTFIRE, bloom: 0.9, kicks: [[100.24, 16], [100.7, 12], [101.52, 14], [102.3, 10]], act: (A, lt, u, T) => {
      acampamento(A, lt, { redes: false });
      for (const [at, x, z, s] of [[100.24, -2, 10, 3.6], [100.7, 4, 13, 3.0], [101.52, -5, 15, 3.8], [102.3, 1.5, 18, 3.2], [103.0, -8, 20, 3]] as number[][]) A.fx(z - 0.2, (g, c) => { blast(g, c, T - at, x, 0, z - 0.2, s, x * 7 + 3, { debris: 26 }); scorch(g, c, x, z, s * 1.2, clamp((T - at) * 2) * 0.7); });
      A.fx(22, (g, c) => embers(g, c, lt, 0, 22, 30, 60, 14, 3));
      A.over((g) => flashTela(g, T - 100.24, 0.75, 0.25));
    } },
  // 13d "localizado em território equatoriano" — o mapa: a seta sai da Colômbia e cai do lado do Equador
  { t0: 103.7, fade: 0.15, L: () => sulAmerica("i4", SAST.noite), cam: dinT(103.7, [-11, 9, -40, 40], [[103.75, [-11.4, 9.6, -24, 40]]]), act: (A, lt, u, T) => {
      hlSA(A, "ECU", clamp((T - 103.8) / 0.3), "#a060c0", 0.7); hlSA(A, "COL", 1, "#8a4a2a", 0.4);
      arrowSA(A, [-75.5, 2.6], CITY.angostura, (T - 103.8) / 0.6, "#ff3a2a", 0.3, 0.3); pinSA(A, CITY.angostura, T - 104.35, "#ff3a2a", true, 0.3);
    } },
  // 14 "O alvo era Raúl Reyes, um dos principais comandantes da guerrilha." — visão noturna: Reyes na barraca com o rádio, a mira se fecha
  { t0: 105.26, fade: 0.1, L: () => noiteSelva("j1"), cam: dinT(105.26, [0.4, 1.6, -2.2, 38], [[105.95, [0.1, 1.55, -0.6, 32]], [108.2, [0.05, 1.55, -0.1, 30]]]), lite: MOON, act: (A, lt, u, T) => {
      A.sp("lona", 0, 0, 4.6, { sc: 0.9 }); A.sp("caixas", 1.4, 0, 2.6, { sc: 0.9 }); A.sp("radio", 1.25, 0.85, 2.55, {});
      A.a(REYES, 1, 0, 3.0, { expr: T > 107.6 ? fala(T, "firme") : "stern", prop: ["phone", 0], look: 0.4 });
      for (let i = 0; i < 2; i++) A.a(guerr(i + 3), 70 + i, -2.2 + i * 4.2, 5.2, { expr: "stern" });
      A.over((g) => { visaoNoturna(g, lt, 0.85); mira(g, T - 106.0, VW / 2, VH * 0.36); });
    } },
  // 15 "A operação terminou com a morte de Reyes e de outros integrantes das FARC." — amanhecer: fumaça, crateras, rede vazia, os óculos no chão
  { t0: 109.16, fade: 0.35, L: () => loc(["#6a6a7a", "#d8b8a0"], { near: "#3a3226", far: "#5a4a38", kind: "mud", seed: 28 }, [selva("k1", 60, "#3a4a3a", 4, { blur: 1.5 }), selva("k1b", 24, "#2e3a2e", 31, { h: 10 })]),
    cam: dinT(109.16, [3, 2.6, -7, 44, -20], [[111.1, [0.4, 0.9, -1.2, 38, 10]], [112.3, [0.8, 1.4, -3.2, 42]]]), lite: GREYL, grade: ["#8a7a8a", 0.2], act: (A, lt, u, T) => {
      A.sp("rede_vazia", -2.2, 0, 4.5, { sc: 0.9 }); A.sp("oculos", 0.25, 0, 1.4, { sc: 1 }); A.sp("radio", -0.6, 0, 2.2, { rot: 0.4 });
      for (const [x, z] of [[-3, 7], [3, 9], [0, 12]]) A.fx(z, (g, c) => { scorch(g, c, x, z, 2.6, 0.75); smokeCol(g, c, lt + 3, x, 0, z, { h: 18, w: 2.2, col: [40, 36, 38], a: 0.7, seed: x }); });
      for (let i = 0; i < 3; i++) walkS(A, solCO(i + 5), 40 + i, lt, -6 + i * 1.6, 6 + i * 0.8, 0.6, { expr: "stern" });
      A.fx(8, (g, c) => embers(g, c, lt, 0, 8, 10, 30, 6, 9));
    } },
  // 16a "Para Álvaro Uribe, era uma vitória" — coletiva em Bogotá: Uribe ergue o punho, flashes
  { t0: 114.2, fade: 0.2, L: () => loc(undefined, { near: "#2a2a34", far: "#3a3a44", kind: "wood", seed: 29 }, [salaImprensa("l1", 6, "co")], true), cam: soco(dinT(114.2, [2, 1.6, -4.4, 42], [[114.35, [0.3, 1.6, -2.6, 38]], [115.85, [0.1, 1.55, -1.7, 34]]]), [[1.7, 0.1]]), lite: DAY, kicks: [[115.9, 5]], act: (A, lt, u, T) => {
      A.sp("tribuna", 0, 0, 2.4, {}); A.a(URIBE, 1, 0, 2.9, { expr: T > 115.85 ? "grin" : fala(T, "firme"), prop: T > 115.85 ? ["fist", 0] : null });
      crowd(A, 3, -4.2, -1.6, 0.9, 1.3, 51, () => ({ expr: "neutral", look: 0.5 }), (i) => jornal(i)); crowd(A, 3, 1.6, 4.2, 0.9, 1.3, 57, () => ({ expr: "neutral", look: -0.5 }), (i) => jornal(i + 3)); flashes(A, T, [-3.4, -1.6, 1.2, 3.1, 4.4], 1.5, 0.5, 21);
    } },
  // 16b "contra um dos principais líderes da organização" — capa de jornal: retrato de Reyes com um X vermelho
  { t0: 117.3, fade: 0.15, L: () => loc(undefined, { near: "#4a3a2a", far: "#5a4834", kind: "wood", seed: 30 }, [gabinete("l2", 6)], true), cam: dinT(117.3, [0, 1.3, -0.9, 38], [[117.35, [0, 1.3, -0.3, 34]]]), lite: LAMP, act: (A, lt, u, T) => {
      A.fx(3, (g, c) => { const [sx, sy, s] = P(c, 0, 1.3, 3); const w = 1.5 * s, h = 1.0 * s; g.save(); g.translate(sx, sy); g.rotate(-0.05); g.fillStyle = "#efe8d8"; g.fillRect(-w / 2, -h / 2, w, h); g.strokeStyle = "#241726"; g.lineWidth = 4; g.strokeRect(-w / 2, -h / 2, w, h);
        g.fillStyle = "#1a1a1a"; g.font = `bold ${Math.round(0.11 * s)}px "DejaVu Serif", serif`; g.textAlign = "center"; g.fillText("EL TIEMPO", 0, -h / 2 + 0.14 * s); g.fillRect(-w / 2 + 0.05 * s, -h / 2 + 0.2 * s, w - 0.1 * s, 0.015 * s);
        g.fillStyle = "#8a8a7a"; g.fillRect(-w / 2 + 0.1 * s, -h / 2 + 0.28 * s, 0.6 * s, 0.6 * s); g.fillStyle = "#3a3a30"; for (let i = 0; i < 7; i++) g.fillRect(0.0 * s, -h / 2 + (0.3 + i * 0.08) * s, 0.6 * s, 0.03 * s); g.restore(); });
      A.a(REYES, 1, -0.37, 3.0, { expr: "stern" }, { sc: 0.28, y: 0.95, shadow: 0, noCast: true });
      A.over((g) => { const k = easeOut(clamp((T - 118.4) / 0.25)); if (k <= 0) return; g.save(); g.strokeStyle = "#d8141c"; g.lineWidth = 22; g.lineCap = "round"; const cx = VW * 0.39, cy = VH * 0.55, r = 170 * k; g.beginPath(); g.moveTo(cx - r, cy - r); g.lineTo(cx + r, cy + r); g.moveTo(cx + r, cy - r); g.lineTo(cx - r, cy + r); g.stroke(); g.restore(); });
    } },
  // 17a "Mas Rafael Correa enxergou algo completamente diferente." — Correa vê o ataque na TV e se levanta furioso
  { t0: 121.15, fade: 0.25, L: () => loc(undefined, madeira, [gabinete("m1", 6, true)], true), cam: dinT(121.15, [-0.2, 1.3, -3.2, 42], [[121.4, [0.2, 1.3, -2.6, 40]], [124.4, [-0.4, 1.5, -2.0, 36]]]), lite: { ...COLD, key: "#a8c0ff", ka: 0.35 }, kicks: [[124.45, 6]], act: (A, lt, u, T) => {
      A.sp("tv", 1.9, 0.9, 4.0, { sc: 1.1 }); tela(A, 1.9, 1.25, 3.95, 2.3, 1.45, ["#3a2a20", "#7a3a1a", "#2a2a2a"], T);
      A.sp("sofa", -0.6, 0, 3.6, {}); const up = T > 124.4; A.a(CORREA, 1, -0.6, 3.4, { expr: up ? "shout" : T > 122.4 ? "shock" : "neutral", look: up ? -0.3 : 1, facing: up ? 0 : 1, mode: up ? "stand" : "sit" }, { y: up ? 0 : 0.05 });
      A.light((g) => glow(g, VW * 0.7, VH * 0.45, VW * 0.4, "rgba(140,170,255,1)", 0.3));
    } },
  // 18a "O presidente equatoriano acusou a Colômbia" — Carondelet: Correa no púlpito, dedo em riste
  { t0: 126.09, fade: 0.15, L: () => loc(SKY.andes, { near: "#b8ae9a", far: "#a8a088", kind: "cobble", seed: 32 }, [clouds("m2", 260, ["#ffffff", "#d8e4ee"], 11), pichincha("m2", 220), carondelet("m2", 26)]),
    cam: soco(dinT(126.09, [3, 1.9, -6, 44, -5], [[126.7, [0.6, 1.6, -3.4, 40]], [128.3, [0.1, 1.55, -2.4, 34]]]), [[2.2, 0.12]]), lite: DAY, kicks: [[128.35, 8]], act: (A, lt, u, T) => {
      A.sp("tribuna", 0, 0, 2.4, {}); A.a(CORREA_T, 1, 0, 2.9, { expr: fala(T, "bravo"), prop: T > 128.3 ? ["point", 0.05] : null }); flag(A, "ec", -3.2, 3.2, 4.4, 2, 1.3, { wind: 0.8 });
      flashes(A, T, [-4, -1.6, 2.4, 4.2], 1.4, 0.7, 31);
    } },
  // 18b "de invadir seu país" — no mapa, a fronteira atravessada: Equador pisca
  { t0: 129.1, fade: 0.12, L: () => sulAmerica("m3", SAST.tensao), cam: dinT(129.1, [-11, 9, -30, 40], [[129.15, [-11.5, 9.5, -22, 40]]]), act: (A, lt, u, T) => {
      hlSA(A, "COL", 1, "#c86a3a", 0.6); pulsoSA(A, "ECU", T - 129.15, "#ff2a1a"); arrowSA(A, [-75.6, 2.4], CITY.angostura, (T - 129.2) / 0.5, "#ff3a2a", 0.25, 0.3); pinSA(A, CITY.angostura, T - 129.6, "#ffe04a", true, 0.25);
    } },
  // 18c "e violar sua soberania." — a bandeira do Equador ao vento no céu de Quito, câmera sobe
  { t0: 131.6, fade: 0.15, L: () => loc(SKY.andes, { near: "#9a9080", far: "#a8a090", kind: "cobble", seed: 33 }, [clouds("m4", 260, ["#ffffff", "#d0dcea"], 13), pichincha("m4", 200), colonial("m4", 60, 12)]), cam: dinT(131.6, [0, 2.6, -6, 46, 20], [[131.65, [0, 3.2, -5, 42, 45]]]), lite: DAY, act: (A, lt) => {
      flag(A, "ec", -1.4, 6.2, 9, 4.6, 3, { wind: 1.3 }); A.fx(40, (g, c) => birds(g, c, lt, 5, -10, 16, 40, 3));
      A.light((g) => { sun(g, VW * 0.82, VH * 0.12, 26); lensFlare(g, VW * 0.82, VH * 0.12, 0.5); });
    } },
  // 19 "E não demorou para que a crise chegasse ao presidente brasileiro." — Planalto ao anoitecer, a câmera vai até a janela acesa
  { t0: 133.82, fade: 0.3, L: () => loc(SKY.dusk, { near: "#7a7484", far: "#8a8090", kind: "stone", seed: 34 }, [clouds("n1", 260, ["#ffb080", "#4a3a6a"], 15), hillL("n1", 220, "#3a3048", 4, 12, 3), congresso("n1", 150, "#5a5068"), planalto("n1", 30, { lit: 0.35, dusk: true })]),
    cam: dinT(133.82, [-6, 2.2, -16, 46, -10], [[134.2, [-2, 4, -6, 40, -10]], [135.5, [-1.4, 4.8, 8, 36, -5]]]), lite: GOLD, act: (A, lt, u, T) => {
      flag(A, "br", 10, 9.5, 20, 3.6, 2.4, { wind: 0.8 }); A.light((g) => { sun(g, VW * 0.1, VH * 0.4, 30, "255,180,130"); });
    } },
  // 20a "Lula começou a conversar com os líderes envolvidos." — Lula ao telefone no gabinete
  { t0: 137.78, fade: 0.15, L: () => loc(undefined, madeira, [gabinete("o1", 6, true)], true), cam: dinT(137.78, [1.5, 1.6, -2.6, 42], [[137.85, [0.6, 1.6, -1.6, 38]], [139.2, [0.3, 1.6, -0.9, 36]]]), lite: LAMP, act: (A, lt, u, T) => {
      A.sp("mesaPres", 0, 0, 2.6, {}); A.a(LULA, 1, 0.1, 3.1, { expr: fala(T, "firme"), prop: ["phone", 0], look: -0.3, armB: 0.4 + 0.5 * Math.max(0, Math.sin(T * 3)) });
    } },
  // 20b Correa ao telefone (Quito)
  { t0: 139.6, L: () => loc(undefined, { near: "#4a3a30", far: "#5a4a3a", kind: "wood", seed: 35 }, [salaImprensa("o2", 6, "ec", "#3a2a2a")], true), cam: dinT(139.6, [-0.8, 1.6, -1.6, 38], [[139.65, [-0.3, 1.6, -0.9, 34]]]), lite: LAMP, act: (A, lt, u, T) => {
      A.a(CORREA, 1, 0, 3.0, { expr: fala(T, "bravo"), prop: ["phone", 0] });
    } },
  // 20c Uribe ao telefone (Bogotá)
  { t0: 140.5, L: () => loc(undefined, { near: "#3a3a40", far: "#4a4a50", kind: "wood", seed: 36 }, [salaImprensa("o3", 6, "co")], true), cam: dinT(140.5, [0.8, 1.6, -1.6, 38], [[140.55, [0.3, 1.6, -0.9, 34]]]), lite: COLD, act: (A, lt, u, T) => {
      A.a(URIBE, 1, 0, 3.0, { expr: fala(T, "firme"), prop: ["phone", 0] });
    } },
  // 21a "Seu governo precisava entender o que havia acontecido e impedir" — reunião no Planalto: assessores, papéis, mapa na parede
  { t0: 141.5, fade: 0.2, L: () => loc(undefined, madeira, [salaMapa("p1", 6)], true), cam: dinT(141.5, [-3, 2.2, -5, 46, -10], [[142.8, [-1, 1.9, -3.8, 44, -5]], [144.7, [0.5, 1.8, -3.0, 42, -3]]]), lite: LAMP, act: (A, lt, u, T) => {
      A.sp("mesaRedonda", 0, 0, 2.6, { sc: 0.9 });
      A.a(LULA, 1, 0, 3.6, { expr: T > 144.7 ? "stern" : fala(T, "calmo"), prop: T > 144.7 ? ["point", 0.3] : null, armB: 0.5 });
      [[-2.0, 3.3], [2.0, 3.3], [-1.2, 4.2], [1.3, 4.2]].forEach(([x, z], i) => A.a(assessor(i + 3), 20 + i, x, z, { expr: i % 2 ? "nervous" : "stern", look: x > 0 ? -0.8 : 0.8, facing: x > 0 ? -1 : 1, prop: i === 1 ? ["paper", 0] : null }));
    } },
  // 21b "que a situação se transformasse em um conflito ainda maior." — o mapa: o vermelho se espalha pela região
  { t0: 146.7, fade: 0.2, L: () => sulAmerica("p2", SAST.tensao), cam: dinT(146.7, [-8, 6, -40, 40], [[148.25, [-5, 2, -75, 40]], [149.6, [-4, 0, -88, 40]]]), act: (A, lt, u, T) => {
      pulsoSA(A, "COL", T - 146.8); pulsoSA(A, "ECU", T - 147.2); pulsoSA(A, "VEN", T - 147.6); pulsoSA(A, "PER", T - 148.4, "#ff6a3a"); pulsoSA(A, "BRA", T - 149.0, "#ff8a3a");
      for (const c of [CITY.caracas, CITY.bogota, CITY.quito]) pinSA(A, c, T - 147, "#ff3a2a");
    } },
];

function hand(c: (u: number, lt: number) => import("./engine").Cam, amp = 0.03) { return (u: number, lt: number) => { const k = c(u, lt); return { ...k, x: k.x + amp * (Math.sin(lt * 3.1) + 0.5 * Math.sin(lt * 7.3)), y: k.y + amp * 0.7 * (Math.sin(lt * 2.3 + 1) + 0.5 * Math.sin(lt * 6.1)) }; }; }
void runS; void fall; void CHAVEZ_H; void mtn; void planalto; void NOON; void BACK; void flutter; void puff; void telefone; void colonial; void narino;
