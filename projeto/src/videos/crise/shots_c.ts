// 151 – 221 s: Celso Amorim e a diplomacia, Chávez entra em cena, embaixada fechada, dez batalhões na fronteira,
// o Equador rompe com a Colômbia, a tensão se espalha, os parceiros de Lula em lados diferentes.
import { Sc, walkS, crowd, tank, flag, caption, marchCol } from "./kit";
import { din, dinT, soco } from "../dinamica";
import { loc, gabinete, carondelet, pichincha, narino, monserrate, salaImprensa, salaMapa, planalto, congresso, itamaraty, estudio, embaixada, sulAmerica, SAST, SKY, CITY, hillL, clouds, mtn, forest } from "./cenarios";
import { fala, hlSA, arrowSA, pinSA, pulsoSA, caminhao, rasgo, flashTela, flashes, clamp, easeOut, glow, P, VW, VH, hash } from "./kit2";
import { LULA, LULA_T, CHAVEZ, CORREA, CORREA_T, URIBE, AMORIM, solVE, assessor, jornal } from "./elenco";
import { DAY, GOLD, BACK, LAMP, MOON, NOON, COLD, RED } from "./looks";
import { sun, rays } from "./engine";
import { lightning, lensFlare, birds, flutter } from "./fx";
import type { Shot } from "./types";

const madeira = { near: "#6a4a30", far: "#8a6440", kind: "wood" as const, seed: 4 };
const llanos = (K: string, sky: [string, string]) => loc(sky, { near: "#8a7a4a", far: "#b0a070", kind: "grass", seed: 41 }, [clouds(K, 260, ["#ffe0b0", "#8a7a9a"], 17), mtn(K, 260, "#6a6a7a", 9, 50, false, 3), hillL(K, 100, "#7a7a4a", 7, 6, 1.5), forest(K, 50, "palm", "#4a6a3a", 14, 5, { blur: 1.2, h: 12 })]);

export const SHOTS_C: Shot[] = [
  // 22a "O ministro das Relações Exteriores," — o Itamaraty: arcos sobre o espelho d'água
  { t0: 151.0, fade: 0.25, L: () => loc(SKY.cerrado, { near: "#d6d0c2", far: "#c4bc9e", kind: "stone", seed: 42 }, [clouds("q1", 260, ["#ffffff", "#cfe0f2"], 19), hillL("q1", 220, "#9aa27a", 4, 14, 3), itamaraty("q1", 36)]), cam: dinT(151.0, [6, 3, -16, 46, -20], [[151.3, (lt) => [3 - lt * 1.0, 2.2, -10, 44, -10]]]), lite: DAY, act: (A, lt) => {
      A.light((g) => { sun(g, VW * 0.15, VH * 0.14, 26); lensFlare(g, VW * 0.15, VH * 0.14, 0.4); }); A.fx(60, (g, c) => birds(g, c, lt, 5, -12, 18, 60, 2.5));
      A.over((g) => caption(g, "Itamaraty, Brasília", lt - 0.4, 2.6));
    } },
  // 22b "Celso Amorim, passou a atuar diretamente" — Amorim sai andando com a pasta, firme
  { t0: 154.2, fade: 0.15, L: () => loc(SKY.cerrado, { near: "#d6d0c2", far: "#c4bc9e", kind: "stone", seed: 43 }, [clouds("q2", 260, ["#ffffff", "#cfe0f2"], 21), itamaraty("q2", 22)]), cam: dinT(154.2, [-1.6, 1.6, -2.6, 40], [[154.25, (lt) => [-1.6 + lt * 0.9, 1.6, -2.2, 38]]]), lite: DAY, act: (A, lt, u, T) => {
      walkS(A, AMORIM, 1, lt, -2.2, 2.4, 0.9, { expr: "stern" }); walkS(A, assessor(5), 2, lt, -3.6, 3.4, 0.9, { expr: "neutral" });
      A.items.slice(-2).forEach(() => 0); void T;
    } },
  // 22c "nas negociações" — Amorim na mesa de negociação, ao telefone, papéis
  { t0: 156.0, fade: 0.15, L: () => loc(undefined, madeira, [salaMapa("q3", 6)], true), cam: dinT(156.0, [1.5, 2.0, -4.0, 44, -10], [[157.3, [0.2, 1.8, -3.0, 40, -5]]]), lite: LAMP, act: (A, lt, u, T) => {
      A.sp("mesaRedonda", 0, 0, 2.4, { sc: 0.85 }); A.a(AMORIM, 1, 0, 3.4, { expr: fala(T, "firme"), prop: ["phone", 0] });
      [[-2, 3.2], [2, 3.2]].forEach(([x, z], i) => A.a(assessor(i + 7), 10 + i, x, z, { expr: "neutral", look: x > 0 ? -0.8 : 0.8, facing: x > 0 ? -1 : 1, prop: ["paper", 0] }));
    } },
  // 23a "A orientação brasileira era clara:" — Lula e Amorim no gabinete, Lula bate o dedo na mesa
  { t0: 158.32, fade: 0.2, L: () => loc(undefined, madeira, [gabinete("r1", 6)], true), cam: soco(dinT(158.32, [-1.5, 1.6, -3.2, 42], [[158.5, [-0.4, 1.6, -2.2, 40]], [160.0, [0.1, 1.55, -1.5, 36]]]), [[1.7, 0.08]]), lite: DAY, kicks: [[160.05, 5]], act: (A, lt, u, T) => {
      A.sp("mesaPres", 0, 0, 2.2, { sc: 0.95 }); A.a(LULA_T, 1, -0.5, 2.9, { expr: T > 160 ? fala(T, "firme") : "stern", prop: T > 160 ? ["point", 0.35] : null, look: 0.2 });
      A.a(AMORIM, 2, 1.2, 3.2, { expr: "neutral", look: -1, facing: -1 });
    } },
  // 23b "a crise precisava ser resolvida pela diplomacia," — uma pomba branca sobe sobre o Planalto ao sol
  { t0: 160.6, fade: 0.2, L: () => loc(SKY.cerrado, { near: "#d6d0c2", far: "#c4bc9e", kind: "stone", seed: 44 }, [clouds("r2", 260, ["#ffffff", "#cfe0f2"], 23), congresso("r2", 150, "#ece8de"), planalto("r2", 50)]), cam: dinT(160.6, [0, 1.6, -8, 44, 0], [[163.6, [0, 2.6, -6, 40, 40]]]), lite: DAY, bloom: 0.7, act: (A, lt, u, T) => {
      const k = clamp((T - 162.9) / 2.2), x = -4 + k * 7, y = 1.5 + k * 6 + 0.2 * Math.sin(T * 9); A.sp("pombo", x * 0.5, y * 0.5 + 0.5, 3.5, { sc: 1.6, rot: -0.1 + 0.15 * Math.sin(T * 14) });
      flag(A, "br", 8, 10, 30, 3.6, 2.4, { wind: 1 }); A.light((g) => { sun(g, VW * 0.72, VH * 0.12, 30); rays(g, VW * 0.72, VH * 0.12, VW * 0.6, 0.12, "255,240,200", 14, lt); });
    } },
  // 23c "e não pela força militar." — um tanque para; o canhão baixa devagar
  { t0: 164.8, fade: 0.12, L: () => llanos("r3", SKY.gold), cam: dinT(164.8, [-3, 1.3, -5, 42], [[165.55, [-1.4, 1.2, -3.4, 38]]]), lite: GOLD, act: (A, lt, u, T) => {
      const v = Math.max(0, 2.4 * (1 - clamp((T - 165.2) / 0.9))); tank(A, "amx", 0 + Math.min(lt, 1.3) * 1.2, 7, { vel: v, dustCol: [190, 160, 110] });
    } },
  // 24 "Mas então Hugo Chávez decidiu entrar em cena." — o estúdio acende; Chávez entra andando e para no centro
  { t0: 167.16, fade: 0.15, L: () => loc(undefined, { near: "#2a2a3a", far: "#3a3a4e", kind: "wood", seed: 45 }, [estudio("s1", 7)], true), cam: soco(dinT(167.16, [0, 2.6, -9, 46, -10], [[167.7, [0, 2.0, -6, 44, -5]], [169.95, [0.2, 1.55, -2.6, 36]]]), [[2.85, 0.15]]), lite: RED, bloom: 0.8, kicks: [[170.05, 8]], act: (A, lt, u, T) => {
      const on = clamp((T - 167.7) / 0.1), k = clamp((T - 168.6) / 1.4); for (const x of [-3, 3]) A.sp("refletor", x, 0, 5.2, {});
      if (k < 1) walkS(A, CHAVEZ, 1, Math.min(lt, 1.4 + (T - 167.16)), -4.6 + k * 4.6 - (T - 167.16) * 0, 3.0, 0, { expr: "grin" }, {});
      if (k < 1) { A.items.pop(); A.s(CHAVEZ, 1, -4.6 + k * 4.6, 3.0, { mode: "march", phase: (k * 4) % 1, stride: 1, expr: "grin" }); } else A.a(CHAVEZ, 1, 0, 3.0, { expr: T > 170.0 ? "shout" : "grin", prop: T > 170.0 ? ["fist", 0] : null });
      A.sp("camera", -2.2, 0, 1.4, { sc: 0.9 }); A.over((g) => { g.fillStyle = `rgba(0,0,0,${0.7 * (1 - on)})`; g.fillRect(0, 0, VW, VH); flashTela(g, T - 170.05, 0.4, 0.2); });
    } },
  // 25a "O presidente venezuelano ficou ao lado de Rafael Correa" — Chávez e Correa lado a lado, braço no ombro
  { t0: 170.48, fade: 0.15, L: () => loc(SKY.andes, { near: "#b8ae9a", far: "#a8a088", kind: "cobble", seed: 46 }, [clouds("s2", 260, ["#ffffff", "#d8e4ee"], 25), pichincha("s2", 220), carondelet("s2", 26)]), cam: dinT(170.48, [-2, 1.7, -4.6, 42], [[173.6, [0, 1.6, -2.8, 38]]]), lite: DAY, act: (A, lt, u, T) => {
      const k = clamp((T - 172.6) / 0.6); A.a(CHAVEZ, 1, -0.55 - 0.6 * (1 - k), 2.8, { expr: "grin", look: 1, facing: 1, armB: 0.4 + 0.9 * k }); A.a(CORREA, 2, 0.55, 2.8, { expr: T > 173.6 ? "laugh" : "smile", look: -0.5, prop: T > 174 ? ["fist", 0] : null });
      flag(A, "ve", -4.4, 3.8, 6, 2.0, 1.3, { wind: 0.9 }); flag(A, "ec", 3.0, 3.8, 6, 2.0, 1.3, { wind: 0.9 }); flashes(A, T, [-3, 2.6], 1.5, 1.2, 41);
    } },
  // 25b "e reagiu duramente contra Álvaro Uribe." — no estúdio, Chávez bate na mesa e grita; Uribe no telão atrás
  { t0: 174.7, fade: 0.1, L: () => loc(undefined, { near: "#2a2a3a", far: "#3a3a4e", kind: "wood", seed: 47 }, [estudio("s3", 7)], true), cam: soco(hand(dinT(174.7, [1.5, 1.5, -3.4, 40], [[174.95, [0.4, 1.45, -1.9, 34]], [176.5, [0.9, 1.6, -2.6, 38]]]), 0.03), [[0.3, 0.14]]), lite: RED, kicks: [[175.0, 12], [175.6, 8]], act: (A, lt, u, T) => {
      A.fx(4.5, (g, c) => { const [x0, y0, s] = P(c, 1.4, 3.6, 4.5); g.fillStyle = "#101014"; g.fillRect(x0, y0, 1.9 * s, 1.25 * s); g.fillStyle = "#2a3a5a"; g.fillRect(x0 + 0.06 * s, y0 + 0.06 * s, 1.78 * s, 1.13 * s); });
      A.a(URIBE, 3, 2.35, 4.45, { expr: "stern" }, { sc: 0.42, y: 2.45, shadow: 0, noCast: true });
      A.fx(2.4, (g, c) => { const [x0, y0] = P(c, -1.4, 0.8, 2.4), [x1, y1] = P(c, 1.4, 0, 2.4); g.fillStyle = "#3a2a24"; g.fillRect(x0, y0, x1 - x0, y1 - y0); g.fillStyle = "#5a3a2a"; g.fillRect(x0, y0, x1 - x0, (y1 - y0) * 0.12); });
      const slam = T > 175.0 && T < 175.35; A.a(CHAVEZ, 1, -0.2, 2.9, { expr: fala(T, "bravo"), prop: T > 175.6 ? ["point", 0.1] : ["fist", slam ? 0 : 0], armB: slam ? -0.4 : 0.3, crouch: slam ? 0.25 : 0 });
    } },
  // 26a "Chávez anunciou o fechamento da embaixada venezuelana na Colômbia" — em Bogotá, a bandeira desce e a porta fecha; funcionários saem com caixas
  { t0: 177.89, fade: 0.2, L: () => loc(SKY.storm, { near: "#6a6a6a", far: "#7a7a7a", kind: "cobble", seed: 48 }, [clouds("t1", 260, ["#c8ccd4", "#6a6e7a"], 27), monserrate("t1", 190), embaixada("t1", 18)]), cam: dinT(177.89, [-3, 2.4, -10, 46, -10], [[178.45, [-0.6, 2.0, -6, 42]], [180.9, [0.4, 1.8, -4.6, 40]]]), lite: { ...COLD, sa: 0.18 }, grade: ["#8a9ab0", 0.15], act: (A, lt, u, T) => {
      const down = clamp((T - 178.6) / 2.6); flag(A, "ve", 3.6, 7.2 - down * 5.2, 16, 2.2, 1.45, { wind: 0.5, pole: false }); A.fx(16.05, (g, c) => { const [px, py, s] = P(c, 3.6, 0, 16.05), [, ty] = P(c, 3.6, 7.5, 16.05); g.strokeStyle = "#d8d4cc"; g.lineWidth = Math.max(2, 0.1 * s); g.beginPath(); g.moveTo(px, py); g.lineTo(px, ty); g.stroke(); });
      const close = clamp((T - 180.6) / 0.5); A.fx(17.9, (g, c) => { const [x0, y0, s] = P(c, -2.2, 3.6, 17.9); g.fillStyle = "#1a120c"; g.fillRect(x0, y0, 4.4 * s, 3.6 * s); g.fillStyle = "#5a3a24"; g.fillRect(x0, y0, 2.2 * s * close, 3.6 * s); g.fillRect(x0 + 4.4 * s - 2.2 * s * close, y0, 2.2 * s * close, 3.6 * s); });
      for (let i = 0; i < 3; i++) walkS(A, assessor(i + 9), 20 + i, lt, -1 + i * 1.2 - 0.2, 12 - i * 0.8, -1.1, { expr: "sad" }, {});
      A.sp("caixas", -2.4 - lt * 1.1, 0.8, 11.9, { sc: 0.5 });
    } },
  // 26b "e ordenou" — Chávez dá a ordem, braço estendido
  { t0: 181.6, fade: 0.08, L: () => loc(undefined, { near: "#2a2a3a", far: "#3a3a4e", kind: "wood", seed: 49 }, [estudio("s4", 7)], true), cam: soco(dinT(181.6, [-1.4, 1.5, -2.6, 38], [[181.65, [-0.5, 1.5, -1.6, 32]]]), [[0.1, 0.15]]), lite: RED, kicks: [[181.7, 10]], act: (A, lt, u, T) => {
      A.a(CHAVEZ, 1, 0, 3.0, { expr: fala(T, "bravo"), prop: ["point", 0.05], look: 0.5 });
    } },
  // 26c "o deslocamento de dez batalhões militares" — coluna de tanques, caminhões e soldados nos llanos
  { t0: 183.05, fade: 0.1, L: () => llanos("t2", SKY.gold), cam: soco(dinT(183.05, [-4, 6, -24, 50, -60], [[183.1, (lt) => [-2 + lt * 2.4, 3.4, -18, 46, -30]]]), [[0.15, 0.08]]), lite: GOLD, bloom: 0.6, act: (A, lt, u, T) => {
      for (let i = 0; i < 4; i++) tank(A, "amx", -20 + i * 9 + lt * 3, 14 + (i % 2) * 6, { vel: 3, dustCol: [200, 170, 120] });
      for (let i = 0; i < 2; i++) caminhao(A, -26 + i * 14 + lt * 3, 26, 3, { poeira: true });
      marchCol(A, (i) => solVE(i), lt, 9, 4 + lt * 0, 8, 1.4, 1.2, 2, 1.0, {}, { expr: "stern" }, 60);
    } },
  // 26d "para a fronteira colombiana." — a placa da fronteira; os tanques chegam e param
  { t0: 184.8, fade: 0.12, L: () => llanos("t3", SKY.gold), cam: dinT(184.8, [4, 1.6, -6, 42], [[184.85, [2.5, 1.6, -4.5, 40]]]), lite: GOLD, act: (A, lt, u, T) => {
      A.sp("placaFront", 4.2, 0, 4.2, { sc: 0.9 }); const v = Math.max(0, 3 * (1 - clamp((T - 185.4) / 0.8)));
      tank(A, "amx", -8 + Math.min(lt, 1.4) * 2.6, 10, { vel: v, dustCol: [200, 170, 120] }); for (let i = 0; i < 3; i++) A.a(solVE(i + 3), 70 + i, -1.6 + i * 1.1, 5.4 + i * 0.4, { expr: "stern" });
    } },
  // 27 "A situação ficou muito mais delicada." — Lula na janela à noite, chuva e relâmpago
  { t0: 186.43, fade: 0.3, L: () => loc(undefined, madeira, [gabinete("u1", 6, true)], true), cam: dinT(186.43, [1.0, 1.7, -2.6, 42], [[187.85, [0.0, 1.7, -1.8, 38]], [189.45, [-0.3, 1.7, -1.2, 36]]]), lite: { ...MOON, key: "#7080a8", ka: 0.4 }, kicks: [[188.36, 4]], act: (A, lt, u, T) => {
      A.a(LULA, 1, -0.6, 3.4, { expr: T > 188.3 ? "nervous" : "sad", look: -0.3, facing: -1, headTilt: 5 });
      A.over((g) => { const f = T - 188.36; if (f > 0 && f < 0.35) { g.save(); g.globalAlpha = 0.35 * (1 - f / 0.35); g.fillStyle = "#dfe8ff"; g.fillRect(0, 0, VW, VH); g.restore(); lightning(g, VW * 0.22, 0, VW * 0.3, VH * 0.45, 1 - f / 0.35, 7); } });
    }, wx: ["rain", 220, 0.35] },
  // 28 "Agora, Lula não estava lidando apenas com uma discussão entre dois presidentes." — Correa e Uribe em púlpitos frente a frente; Lula atrás, no meio
  { t0: 190.55, fade: 0.2, L: () => loc(undefined, { near: "#3a3030", far: "#4a3e3a", kind: "wood", seed: 50 }, [salaImprensa("v1", 9, "br", "#2a2a3a")], true), cam: dinT(190.55, [0, 2.4, -7, 46, -15], [[190.85, [0, 1.8, -4.6, 42, -5]], [194.0, [0, 1.7, -3.6, 40]]]), lite: DAY, act: (A, lt, u, T) => {
      A.sp("tribuna", -1.8, 0, 2.6, {}); A.sp("tribuna", 1.8, 0, 2.6, {});
      A.a(CORREA_T, 1, -1.8, 3.0, { expr: fala(T + 0.3, "bravo"), look: 1, facing: 1, prop: T > 194 ? ["point", 0.2] : null }); A.a(URIBE, 2, 1.8, 3.0, { expr: fala(T, "firme"), look: -1, facing: -1 }, { flip: true });
      A.a(LULA_T, 3, 0, 5.4, { expr: T > 191 ? "nervous" : "stern", look: Math.sin(T * 1.6) });
    } },
  // 29a "A Venezuela havia colocado forças militares em movimento," — tanques em travelling de lado
  { t0: 196.16, fade: 0.15, L: () => llanos("w1", SKY.day), cam: dinT(196.16, [-6, 1.3, -6, 42], [[196.3, (lt) => [-5 + lt * 3.2, 1.3, -5, 40]], [198.45, (lt) => [-5 + lt * 3.2, 1.1, -3.8, 36]]]), lite: DAY, act: (A, lt) => {
      tank(A, "amx", -6 + lt * 3.2, 7, { vel: 3.2, dustCol: [200, 180, 130] }); caminhao(A, -16 + lt * 3.2, 11, 3.2, { poeira: true }); tank(A, "amx", -24 + lt * 3.2, 15, { vel: 3.2, dustCol: [200, 180, 130] });
      for (let i = 0; i < 4; i++) A.s(solVE(i + 6), 90 + i, -4 + i * 1.3 + lt * 3.2, 3.2 + (i % 2) * 0.6, { mode: "march", phase: (lt * 2.3 + i * 0.25) % 1, stride: 1.35, expr: "stern" }, { rot: 0.1 });
    } },
  // 29b "o Equador havia rompido relações diplomáticas com a Colômbia" — Correa rasga o documento em dois
  { t0: 200.3, fade: 0.2, L: () => loc(undefined, { near: "#4a3a30", far: "#5a4a3a", kind: "wood", seed: 51 }, [salaImprensa("w2", 6, "ec", "#3a2a2a")], true), cam: soco(dinT(200.3, [1.4, 1.6, -3.4, 42], [[200.55, [0.4, 1.6, -2.2, 38]], [201.55, [0.1, 1.55, -1.6, 34]], [205.1, [0.4, 1.7, -2.6, 40]]]), [[1.3, 0.12]]), lite: LAMP, kicks: [[201.6, 7]], act: (A, lt, u, T) => {
      const torn = T - 201.6; A.a(CORREA_T, 1, 0, 3.0, { expr: torn > 0 ? fala(T, "bravo") : "stern", armB: torn > 0 ? 1.2 : 0.6, prop: torn > 0 ? ["fist", 0] : ["paper", 0] });
      if (torn > -0.05) rasgo(A, 0.35, 1.55, 2.8, torn);
      A.fx(1.5, (g, c) => { if (torn < 0) return; flutter(g, c, torn, { n: 18, x0: -1, x1: 1.4, z0: 1.8, z1: 2.6, top: 1.8, cols: ["#f4ede0", "#e8e0cc"], size: 0.06, fall: 0.5, seed: 9 } as any); });
    } },
  // 29c "e a tensão se espalhava pela região." — mapa: o vermelho pulsa e se espalha
  { t0: 205.8, fade: 0.2, L: () => sulAmerica("w3", SAST.tensao), cam: dinT(205.8, [-9, 7, -36, 40], [[207.15, [-6, 3, -70, 40]]]), act: (A, lt, u, T) => {
      pulsoSA(A, "VEN", T - 205.8); pulsoSA(A, "ECU", T - 205.9); pulsoSA(A, "COL", T - 206.0);
      arrowSA(A, CITY.caracas, [-72.6, 7.6], (T - 206.2) / 0.5, "#ff3a2a", 0.4, 0.2); arrowSA(A, CITY.quito, [-77.2, 1.2], (T - 206.5) / 0.5, "#ff3a2a", 0.35, -0.3);
      pulsoSA(A, "PER", T - 207.3, "#ff7a3a"); pulsoSA(A, "BRA", T - 207.8, "#ff9a3a");
    } },
  // 30a "E o presidente brasileiro teria que lidar com um problema ainda mais complicado:" — Lula, mão na testa, gota de suor
  { t0: 208.98, fade: 0.25, L: () => loc(undefined, madeira, [gabinete("x1", 6, true)], true), cam: dinT(208.98, [-1.4, 1.6, -2.4, 42], [[209.6, [-0.4, 1.6, -1.2, 36]], [211.8, [-0.1, 1.62, -0.3, 32]]]), lite: LAMP, act: (A, lt, u, T) => {
      A.sp("mesaPres", 0, 0, 2.6, {}); A.a(LULA, 1, 0.1, 3.1, { expr: T > 211.8 ? "nervous" : "sad", prop: ["phone", 0], headTilt: 8, look: -0.4 });
    } },
  // 30b "seus parceiros políticos estavam envolvidos em lados diferentes de uma disputa internacional." — Lula no meio: Chávez e Correa de um lado, Uribe do outro
  { t0: 213.3, fade: 0.25, L: () => sulAmerica("x2", SAST.noite), cam: dinT(213.3, [-8, 5.0, -6.5, 40, 0], [[213.55, [-8, 5.1, -7.5, 42]], [216.4, [-8, 5.4, -10, 44]], [218.7, [-8, 6.0, -13, 46]]]), lite: BACK, bloom: 0.7, act: (A, lt, u, T) => {
      hlSA(A, "VEN", 1, "#d8a020", 0.45); hlSA(A, "ECU", 1, "#a060c0", 0.45); hlSA(A, "COL", 1, "#d85a20", 0.45);
      const sp = clamp((T - 216.4) / 0.6), x0 = -8, y0 = 3.6;
      A.a(LULA, 1, x0, -2.2, { expr: T > 216.4 ? "nervous" : "stern", look: Math.sin(T * 1.8), armB: 0.8 }, { y: y0 });
      A.a(CHAVEZ, 2, x0 - 1.4 - 0.9 * sp, -1.8, { expr: "shout", look: 1, facing: 1, prop: ["point", 0.3] }, { y: y0 }); A.a(CORREA, 3, x0 - 2.5 - 0.4 * sp, -1.6, { expr: "stern", look: 1, facing: 1 }, { y: y0 });
      A.a(URIBE, 4, x0 + 1.6 + 1.1 * sp, -1.8, { expr: "stern", look: -1, facing: -1, prop: ["point", 0.3] }, { y: y0, flip: true });
      if (T > 216.4) A.fx(-2.0, (g, c) => { const [ax, ay] = P(c, x0 - 0.9, y0 + 1.3, -2.0), [bx, by] = P(c, x0 + 1.0, y0 + 1.3, -2.0); for (const [qx, qy] of [[ax, ay], [bx, by]]) lightning(g, qx, qy - 40, qx + (qx < VW / 2 ? -60 : 60), qy + 30, 0.6 * (Math.floor(T * 14) % 2), Math.floor(T * 9)); });
    } },
];

function hand(c: (u: number, lt: number) => import("./engine").Cam, amp = 0.03) { return (u: number, lt: number) => { const k = c(u, lt); return { ...k, x: k.x + amp * (Math.sin(lt * 3.1) + 0.5 * Math.sin(lt * 7.3)), y: k.y + amp * 0.7 * (Math.sin(lt * 2.3 + 1) + 0.5 * Math.sin(lt * 6.1)) }; }; }
void crowd; void narino; void din; void pinSA; void glow; void easeOut; void hash; void jornal; void NOON; void LULA_T; void flashTela; void arrowSA;
