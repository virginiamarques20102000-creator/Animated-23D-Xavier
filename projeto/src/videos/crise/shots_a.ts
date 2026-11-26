// 0 – 70 s: gancho (Lula no meio da crise; Chávez, Correa, Uribe), a pergunta, volta a março de 2008, Lula e o PT, os aliados.
import { Sc, mv, walkS, walkF, crowd, tank, flag, caption, bigText } from "./kit";
import { din, dinT, soco } from "../dinamica";
import { loc, planalto, congresso, gabinete, miraflores, avila, carondelet, pichincha, colonial, narino, monserrate, selva, rio, estudio, salaImprensa, itamaraty, sulAmerica, SAST, SKY, CITY, hillL, clouds, forest, mtn } from "./cenarios";
import { fala, hlSA, arrowSA, pinSA, laco, pulsoSA, heli, caminhao, telefone, tela, calendario, flashTela, flashes, clamp, easeOut, smooth, glow, P, VW, VH } from "./kit2";
import { LULA, LULA_T, CHAVEZ, CORREA, CORREA_T, URIBE, AMORIM, solCO, guerr, solVE, assessor, jornal, militante } from "./elenco";
import { DAY, GOLD, BACK, LAMP, MOON, NOON, COLD, RED } from "./looks";
import { fire, smokeCol, sun, rays } from "./engine";
import { lensFlare, flutter, birds, dust } from "./fx";
import type { Shot } from "./types";

const cerradoFar = (K: string) => [clouds(K, 260, ["#ffffff", "#cfe0f2"], 5, 40, 110, 16, 4), hillL(K, 220, "#9aa27a", 4, 14, 3)];
const praça = { near: "#d6d0c2", far: "#c4bc9e", kind: "stone" as const, seed: 3 };
const madeira = { near: "#6a4a30", far: "#8a6440", kind: "wood" as const, seed: 4 };

export const SHOTS_A: Shot[] = [
  // 0a "Luiz Inácio Lula da Silva estava no meio de uma das maiores crises" — Brasília ao entardecer, o Planalto aceso; a câmera desce de drone até Lula na rampa
  { t0: 0, L: () => loc(SKY.dusk, { ...praça, near: "#8a8494", far: "#a0909a" }, [clouds("a0", 260, ["#ffb080", "#5a4a7a"], 9, 40, 110, 18, 4), hillL("a0", 220, "#4a4058", 4, 12, 3), congresso("a0", 150, "#6a6078"), planalto("a0", 46, { lit: 0.55, dusk: true })]),
    cam: dinT(0, [0, 9, -30, 50, -120], [[0.9, [-1.5, 3.2, -16, 44, -40]], [1.9, (lt) => [-2.2 + lt * 0.2, 1.7, -7.5, 40, -8]]]), lite: GOLD, bloom: 0.8, grade: ["#ff9a70", 0.12], act: (A, lt, u, T) => {
      flag(A, "br", 9, 9.5, 30, 3.6, 2.4, { wind: 0.8 });
      walkS(A, LULA, 1, lt, -3.4, 2.6, 0.55, { expr: T > 1.9 ? "stern" : "neutral" });
      [0, 1].forEach((i) => walkS(A, assessor(i), 10 + i, lt, -5.2 - i * 1.2, 3.4 + i * 0.6, 0.55, { expr: "nervous" }));
      A.light((g) => { sun(g, VW * 0.12, VH * 0.36, 30, "255,190,140"); rays(g, VW * 0.12, VH * 0.36, VW * 0.7, 0.1, "255,180,130", 14, lt, Math.PI * 0.9, 0); });
      A.over((g) => caption(g, "Brasília", lt - 0.5, 2.3));
    } },
  // 0b "diplomáticas da América do Sul" — o mapa: três países pulsando em vermelho
  { t0: 3.0, L: () => sulAmerica("a1", SAST.noite), cam: dinT(3.0, [2, -4, -110, 40], [[3.45, [-8, 5, -62, 40]], [4.3, [-8.5, 5, -56, 40]]]), act: (A, lt, u, T) => {
      hlSA(A, "BRA", 1, "#2a7a4a", 0.45); pulsoSA(A, "VEN", T - 3.5); pulsoSA(A, "COL", T - 3.7); pulsoSA(A, "ECU", T - 3.9);
      pinSA(A, CITY.brasilia, T - 3.1, "#3ad86a");
    } },
  // 0c "quando recebeu notícias que poderiam mudar completamente o rumo daquela história" — o gabinete: um assessor entra correndo com o papel, o telefone toca
  { t0: 4.75, L: () => loc(undefined, madeira, [gabinete("a2", 6, true)], true), cam: dinT(4.75, [0.6, 1.45, -2.2, 42], [[4.85, [0.3, 1.4, -1.4, 40]], [6.6, [0, 1.5, -0.6, 36]]]), lite: LAMP, bloom: 0.6, act: (A, lt, u, T) => {
      A.sp("mesaPres", 0, 0, 2.6, { sc: 1 }); telefone(A, -1.0, 0.82, 2.55, T - 5.1);
      A.a(LULA, 1, 0.1, 3.1, { expr: T > 5.2 ? (T > 6.5 ? "shock" : "nervous") : "neutral", look: T > 5.2 ? 0.9 : 0, prop: T > 5.3 ? ["paper", 0] : null });
      const k = clamp((T - 4.75) / 0.6); A.a(assessor(2), 12, 2.6 - k * 1.1, 3.4, { mode: k < 1 ? "march" : "stand", phase: (k * 2) % 1, expr: "nervous", look: -1, facing: -1, prop: k < 1 ? ["paper", 0] : null });
      A.light((g) => glow(g, VW * 0.3, VH * 0.2, VW * 0.4, "rgba(255,200,130,1)", 0.25));
    }, kicks: [[6.6, 5]] },
  // 1 "Hugo Chávez ameaçava a Colômbia" — no estúdio de TV, Chávez aponta o dedo e grita
  { t0: 7.74, L: () => loc(undefined, { near: "#2a2a3a", far: "#3a3a4e", kind: "wood", seed: 5 }, [estudio("b1", 7)], true), cam: soco(dinT(7.74, [3, 1.8, -7, 44], [[8.0, [0.6, 1.6, -3.4, 40]], [9.5, [0.4, 1.55, -2.4, 36]]]), [[1.8, 0.12]]), lite: RED, bloom: 0.7, kicks: [[9.5, 9]], act: (A, lt, u, T) => {
      A.a(CHAVEZ, 1, 0, 3.0, { expr: T > 8.6 ? fala(T, "bravo") : "stern", prop: T > 8.6 ? ["point", 0.15] : null, look: 0.3, headTilt: T > 9.5 ? -6 : 0 });
      for (const x of [-3, 3]) A.sp("refletor", x, 0, 5.2, { sc: 1 }); A.sp("camera", -1.9, 0, 1.6, { sc: 0.9 });
      A.light((g) => { glow(g, VW * 0.2, VH * 0.1, VW * 0.3, "rgba(255,240,200,1)", 0.3); glow(g, VW * 0.8, VH * 0.1, VW * 0.3, "rgba(255,240,200,1)", 0.3); });
    } },
  // 2 "Rafael Correa acusava o governo colombiano de invadir seu território" — Carondelet, Quito: Correa no púlpito, acusando
  { t0: 10.35, L: () => loc(SKY.andes, { near: "#b8ae9a", far: "#a8a088", kind: "cobble", seed: 6 }, [clouds("b2", 260, ["#ffffff", "#d8e4ee"], 8, 40, 110, 16, 4), pichincha("b2", 240), colonial("b2", 110, 4), carondelet("b2", 34)]),
    cam: dinT(10.35, [-4, 2.6, -9, 46, -20], [[10.4, [-1.2, 1.7, -4.2, 42]], [12.0, [-0.6, 1.6, -2.6, 38]], [13.1, [-0.3, 1.55, -1.8, 34]]]), lite: DAY, kicks: [[13.2, 7]], act: (A, lt, u, T) => {
      A.sp("tribuna", 0, 0, 2.4, { sc: 1.05 }); A.a(CORREA, 1, 0, 2.9, { expr: T > 11.2 ? fala(T, "bravo") : "stern", prop: T > 12.9 ? ["point", 0.1] : null });
      flag(A, "ec", -3.2, 3.0, 4.2, 1.9, 1.25, { wind: 0.7 }); crowd(A, 6, -6, 6, 0.3, 0.8, 21, (i) => ({ expr: "stern", look: 0, facing: 0 }), (i) => jornal(i + 2));
      flashes(A, T, [-5, -2.4, 2.2, 4.8], 1.5, 0.6, 3);
    } },
  // 3a "E Álvaro Uribe se recusava a aceitar as acusações" — Casa de Nariño, Bogotá: Uribe balança a cabeça, firme
  { t0: 14.96, L: () => loc(SKY.andes, { near: "#a8a498", far: "#989480", kind: "stone", seed: 7 }, [clouds("b3", 260, ["#f4f6f8", "#c8d4de"], 2, 40, 110, 16, 4), monserrate("b3", 200), narino("b3", 36)]),
    cam: dinT(14.96, [3, 3.2, -12, 46, -30], [[15.2, [0.8, 1.7, -4.4, 40]], [17.85, [0.3, 1.6, -2.4, 36]], [19.2, [0.0, 1.55, -1.9, 34]]]), lite: DAY, act: (A, lt, u, T) => {
      A.sp("tribuna", 0, 0, 2.4, { sc: 1.05 }); A.a(URIBE, 1, 0, 2.9, { expr: T > 16.5 ? fala(T, "firme") : "stern", headTilt: T > 16.0 && T < 17.6 ? 9 * Math.sin((T - 16) * 9) : 0, prop: T > 19.2 ? ["fist", 0] : null });
      flag(A, "co", 3.0, 3.0, 4.0, 1.9, 1.25, { wind: 0.6 }); flashes(A, T, [-4.6, -1.8, 2.6], 1.5, 0.6, 7);
    } },
  // 3b "sem defender sua operação militar" — base militar colombiana: helicóptero decola, soldados correm
  { t0: 20.35, fade: 0.15, L: () => loc(SKY.day, { near: "#7a8a5a", far: "#9aa070", kind: "grass", seed: 9 }, [clouds("b4", 260, ["#ffffff", "#c8d8ec"], 4), mtn("b4", 240, "#5e7a5a", 12, 60, false, 3), selva("b4", 60, "#2e5a36", 3, { blur: 1.3 })]),
    cam: hand(dinT(20.35, [-4, 1.3, -8, 44], [[20.45, [0, 1.6, -6, 40, -10]]]), 0.03), lite: NOON, act: (A, lt, u, T) => {
      heli(A, -2 + lt * 1.5, Math.max(0, (lt - 0.2) * 1.8), 14, { sc: 0.9 }); A.fx(14.5, (g, c) => dust(g, c, lt, -2 + lt * 1.5, 14.5, 1, 1.4, [170, 160, 120], 4));
      for (let i = 0; i < 5; i++) A.s(solCO(i), 30 + i, -6 + i * 1.3 + lt * 3.2, 5 + (i % 2) * 1.4, { mode: "march", phase: (lt * 2.2 + i * 0.3) % 1, stride: 1.3, expr: "stern" });
    } },
  // 4 "Lula precisava tomar uma posição." — close de Lula no gabinete, pensativo; a câmera fecha devagar
  { t0: 21.78, fade: 0.2, L: () => loc(undefined, madeira, [gabinete("a2", 6, true)], true), cam: dinT(21.78, [-0.8, 1.6, -0.5, 36], [[22.5, [-0.1, 1.72, -0.8, 36]], [24.0, [0.05, 1.72, -0.45, 34]]]), lite: LAMP, act: (A, lt, u, T) => {
      A.sp("mesaPres", 0, 0, 2.6, {}); A.a(LULA, 1, 0.1, 3.1, { expr: T > 24.0 ? "stern" : "sad", look: T > 24.0 ? 0 : -0.6, headTilt: T > 24.0 ? 0 : 7, armB: 0.3 });
      A.light((g) => glow(g, VW * 0.25, VH * 0.25, VW * 0.4, "rgba(255,190,120,1)", 0.25));
    } },
  // 5a "Mas como o presidente brasileiro foi parar" — a rampa do Planalto de dia, Lula subindo, a faixa presidencial
  { t0: 25.24, L: () => loc(SKY.cerrado, praça, [...cerradoFar("c1"), congresso("c1", 150, "#ece8de"), planalto("c1", 46)]), cam: dinT(25.24, [-6, 1.6, -10, 44], [[26.1, (lt) => [-4 + lt * 0.7, 1.6, -7, 40]]]), lite: DAY, act: (A, lt, u, T) => {
      flag(A, "br", 9, 9.5, 30, 3.6, 2.4, { wind: 0.9 }); walkS(A, LULA, 1, lt, -4.2, 2.8, 0.7, { expr: "smile" });
      for (let i = 0; i < 2; i++) A.a({ jacket: "#f2f2ea", pants: "#f2f2ea", boots: "#141414", hat: "peaked", cap: "#f2f2ea", rifle: true }, 40 + i, 1.5 + i * 4, 5.5, { expr: "stern" });
    } },
  // 5b "no centro de uma crise" — o mapa: o Brasil no meio, a câmera recua e revela os vizinhos
  { t0: 29.0, fade: 0.2, L: () => loc(undefined, { near: "#0e1e34", far: "#0e1e34", zFar: 1 }, sulAmerica("c2", SAST.noite).layers, true), cam: dinT(29.0, [-2, -2, -40, 40], [[29.2, [-4, 0, -95, 40]], [30.25, [-6, 3, -80, 40]]]), act: (A, lt, u, T) => {
      hlSA(A, "BRA", 1, "#2a9a5a", 0.5); pinSA(A, CITY.brasilia, T - 29.0, "#3ad86a"); for (const k of ["VEN", "COL", "ECU"]) pulsoSA(A, k, T - 30.3);
    } },
  // 5c "envolvendo ameaças militares" — tanques na estrada, poeira
  { t0: 31.55, L: () => loc(SKY.gold, { near: "#a08a5a", far: "#c8a878", kind: "sand", seed: 11 }, [mtn("c3", 260, "#7a6a7a", 22, 50, false, 3), hillL("c3", 90, "#9a8a5a", 3, 6, 1.5)]), cam: soco(dinT(31.55, [-8, 1.0, -6, 42], [[31.6, (lt) => [-6 + lt * 3, 1.0, -4, 38]]]), [[0.25, 0.1]]), lite: GOLD, act: (A, lt) => {
      tank(A, "amx", -10 + lt * 3.4, 9, { vel: 3.4, dustCol: [200, 170, 120] }); tank(A, "amx", -20 + lt * 3.4, 14, { vel: 3.4, dustCol: [200, 170, 120] }); caminhao(A, -3 + lt * 3.4, 18, 3.4, { poeira: true });
    } },
  // 5d "guerrilheiros" — coluna de guerrilheiros na mata
  { t0: 33.0, fade: 0.12, L: () => loc(["#4a6a5a", "#a8c0a0"], { near: "#3a4a2a", far: "#5a6a3a", kind: "grass", seed: 12 }, [selva("c4", 80, "#2a4a30", 5, { blur: 1.6 }), selva("c4b", 26, "#244a2c", 8, { h: 12 })]), cam: dinT(33.0, [-5, 1.4, -6, 42], [[33.05, (lt) => [-4.5 + lt * 1.2, 1.3, -4.5, 40]]]), lite: { ...DAY, key: "#c8e0b0", ka: 0.2 }, act: (A, lt) => {
      for (let i = 0; i < 6; i++) walkS(A, guerr(i), 50 + i, lt, -1 - i * 1.4, 3.2 + (i % 2) * 0.6, 1.2, { expr: "stern" });
    } },
  // 5e "e três países sul-americanos?" — Venezuela, Colômbia e Equador acendem um por um
  { t0: 34.45, fade: 0.15, L: () => sulAmerica("c5", SAST.dia), cam: dinT(34.45, [-6, 4, -80, 40], [[34.5, [-8, 6, -58, 40]]]), act: (A, lt, u, T) => {
      hlSA(A, "VEN", (T - 34.55) / 0.25, "#d8a020", 0.75); hlSA(A, "COL", (T - 34.85) / 0.25, "#d85a20", 0.75); hlSA(A, "ECU", (T - 35.3) / 0.25, "#a060c0", 0.75);
    } },
  // 6a "Para entender essa história, precisamos" — Lula olha para o calendário na parede do gabinete
  { t0: 36.44, fade: 0.25, L: () => loc(undefined, madeira, [gabinete("a6", 6)], true), cam: dinT(36.44, [1.2, 1.6, -3.2, 42], [[37.2, [0.8, 1.7, -2.2, 40]]]), lite: DAY, act: (A, lt, u, T) => {
      A.a(LULA, 1, -0.2, 3.2, { expr: "neutral", look: 1, facing: 1 }); A.fx(5.6, (g, c) => { const [sx, sy, s] = P(c, 1.6, 2.6, 5.6); g.fillStyle = "#f6efe0"; g.fillRect(sx - 0.4 * s, sy - 0.5 * s, 0.8 * s, 1 * s); g.fillStyle = "#c8161e"; g.fillRect(sx - 0.4 * s, sy - 0.5 * s, 0.8 * s, 0.25 * s); g.strokeStyle = "#241726"; g.lineWidth = 3; g.strokeRect(sx - 0.4 * s, sy - 0.5 * s, 0.8 * s, 1 * s); });
    } },
  // 6b "voltar a março de 2008" — o calendário folheia para trás e para em março de 2008
  { t0: 40.45, L: () => loc(undefined, { near: "#3a2a20", far: "#4a3424", kind: "wood", seed: 4 }, [gabinete("a6b", 6)], true), cam: din([1.6, 2.4, -0.4, 34], [[0.1, [1.6, 2.5, 1.2, 30]]]), lite: DAY, act: (A, lt, u, T) => {
      A.over((g) => { g.fillStyle = "rgba(10,6,4,0.45)"; g.fillRect(0, 0, VW, VH); calendario(g, T - 40.45, 41.55 - 40.45); flashTela(g, T - 41.55, 0.5, 0.2); });
    } },
  // 7a "Naquele momento, Lula estava em seu segundo mandato" — posse de 2007: Lula com a faixa na rampa, faz o "2" com os dedos
  { t0: 43.56, fade: 0.25, L: () => loc(SKY.cerrado, praça, [...cerradoFar("d1"), congresso("d1", 150, "#ece8de"), planalto("d1", 40)]), cam: dinT(43.56, [3, 2.4, -9, 46, -10], [[45.2, [0.4, 1.7, -3.6, 40]], [47.0, [0.2, 1.65, -2.2, 36]]]), lite: DAY, bloom: 0.6, act: (A, lt, u, T) => {
      flag(A, "br", -7, 8, 26, 3.6, 2.4, { wind: 1 }); A.a(LULA_T, 1, 0, 3.0, { expr: T > 46.9 ? "laugh" : "smile", prop: T > 46.9 ? ["fist", 0] : null, look: 0 });
            crowd(A, 12, -9, 9, 7, 12, 31, (i) => ({ expr: i % 2 ? "laugh" : "grin", armB: 1.3 + 0.3 * Math.sin(T * 5 + i), prop: i % 3 === 0 ? ["flag", T * 6 + i] : null }), (i) => militante(i));
      A.fx(10, (g, c) => flutter(g, c, lt, { n: 60, x0: -8, x1: 8, z0: 5, z1: 12, top: 7, cols: ["#2a9a4a", "#f2d22a", "#ffffff", "#c8161e"], seed: 3 } as any));
    } },
  // 7b "como presidente do Brasil" — o Planalto inteiro, bandeira no mastro
  { t0: 48.2, fade: 0.15, L: () => loc(SKY.cerrado, praça, [...cerradoFar("d2"), congresso("d2", 150, "#ece8de"), planalto("d2", 52)]), cam: dinT(48.2, [-8, 2.0, -14, 46, -10], [[48.3, [-4, 3.2, -22, 48, -30]]]), lite: DAY, act: (A, lt) => {
      flag(A, "br", 2, 11, 18, 4.4, 3.0, { wind: 1.1 }); A.light((g) => { sun(g, VW * 0.85, VH * 0.15, 26); lensFlare(g, VW * 0.85, VH * 0.15, 0.5); }); A.fx(60, (g, c) => birds(g, c, lt, 6, -20, 20, 60, 2.5));
    } },
  // 8a "Ele havia chegado ao poder pelo Partido dos Trabalhadores" — comício do PT: mar de bandeiras vermelhas, Lula no palanque de punho erguido
  { t0: 49.94, fade: 0.2, L: () => loc(SKY.gold, { near: "#7a4a3a", far: "#9a6a4a", kind: "stone", seed: 14 }, [clouds("e1", 260, ["#ffd0a0", "#a06a8a"], 3), hillL("e1", 160, "#6a5a7a", 6, 12, 2.5)]), cam: dinT(49.94, [0, 4.5, -14, 48, -60], [[50.6, [0, 2.6, -9, 44, -20]], [52.1, [0, 2.4, -6.4, 40, -15]]]), lite: BACK, bloom: 0.8, act: (A, lt, u, T) => {
      A.fx(6.2, (g, c) => { const [x0, y0] = P(c, -4, 1.1, 6.2), [x1, y1] = P(c, 4, 0, 6.2); g.fillStyle = "#3a2a2a"; g.fillRect(x0, y0, x1 - x0, y1 - y0); g.fillStyle = "#c8161e"; g.fillRect(x0, y0, x1 - x0, (y1 - y0) * 0.3); });
      A.a(LULA, 1, 0, 6.0, { expr: T > 52.1 ? fala(T, "feliz") : "grin", prop: T > 52.1 ? ["fist", 0] : ["phone", 0], armB: 0.8 }, { y: 1.1 });
      flag(A, "pt", -4.6, 4.2, 6.4, 2.2, 1.5, { wind: 1.2 }); flag(A, "pt", 3.0, 4.0, 6.4, 2.2, 1.5, { wind: 1.0 });
      for (let i = 0; i < 16; i++) { const x = -7 + (i % 8) * 2 + (i > 7 ? 1 : 0), z = 2 + (i > 7 ? 1.6 : 0); A.a(militante(i), 60 + i, x, z, { expr: i % 2 ? "laugh" : "grin", look: 0, facing: 0, armB: 1.4 + 0.3 * Math.sin(T * 6 + i), prop: i % 3 === 1 ? ["flag", T * 7 + i] : i % 3 === 2 ? ["fist", 0] : null }, { y: 0.15 * Math.abs(Math.sin(T * 5 + i)) }); }
      A.fx(4, (g, c) => flutter(g, c, lt, { n: 90, x0: -8, x1: 8, z0: 2, z1: 9, top: 7, cols: ["#c8161e", "#ffffff", "#e8282e"], seed: 5 } as any));
      A.light((g) => { sun(g, VW * 0.5, VH * 0.28, 30, "255,200,150"); rays(g, VW * 0.5, VH * 0.28, VW * 0.7, 0.14, "255,190,140", 18, lt); });
    } },
  // 8b "e defendia uma política externa de aproximação" — cúpula: Lula aperta mãos, fila de bandeiras
  { t0: 54.0, fade: 0.2, L: () => loc(undefined, { near: "#4a3a30", far: "#6a5444", kind: "wood", seed: 15 }, [itamaraty("e2", 30)], true), cam: dinT(54.0, [-3, 1.6, -4, 42], [[54.05, (lt) => [-2.4 + lt * 0.5, 1.6, -3, 40]], [56.55, [0.2, 1.5, -1.6, 36]]]), lite: DAY, act: (A, lt, u, T) => {
      ["br", "ve", "co", "ec"].forEach((k, i) => flag(A, k, -6 + i * 3.6, 3.4, 9, 1.6, 1.05, { wind: 0.25, droop: 0.2 }));
      const shake = T > 56.55 ? 0.06 * Math.sin(T * 14) : 0; A.a(LULA, 1, -0.55, 2.8, { expr: "grin", look: 1, facing: 1, prop: ["point", 0.6 + shake * 3] }); A.a(CORREA_T, 2, 0.75, 2.85, { expr: "smile", look: -1, facing: -1, prop: ["point", 0.6 - shake * 3] }, { flip: true });
      crowd(A, 5, -4, 4, 5.5, 7, 41, () => ({ expr: "smile" }), (i) => assessor(i)); flashes(A, T, [-3, 3.2], 1.6, 1.2, 11);
    } },
  // 8c "entre os países da América Latina" — o mapa: laços de luz saindo de Brasília para as capitais
  { t0: 57.45, fade: 0.2, L: () => sulAmerica("e3", SAST.papel), cam: dinT(57.45, [-2, -6, -110, 40], [[57.5, [-3, -4, -88, 40]]]), act: (A, lt, u, T) => {
      hlSA(A, "BRA", 1, "#2a9a5a", 0.5); pinSA(A, CITY.brasilia, 1, "#2a9a5a", false);
      const alvos: [number, number][] = [CITY.caracas, CITY.bogota, CITY.quito, [-77, -12], [-58.4, -34.6], [-70.6, -33.4], [-68.1, -16.5], [-57.6, -25.3], [-56.2, -34.9]];
      alvos.forEach((c, i) => { laco(A, CITY.brasilia, c, (T - 57.6 - i * 0.12) / 0.5, "#c8161e", 5); pinSA(A, c, T - 58.0 - i * 0.12, "#c8161e", false, 0.35); });
    } },
  // 9 "Entre seus aliados políticos estava Hugo Chávez, presidente da Venezuela" — Miraflores, Caracas: abraço de Lula e Chávez
  { t0: 60.08, fade: 0.25, L: () => loc(SKY.day, { near: "#c8b48a", far: "#b8a47a", kind: "stone", seed: 16 }, [clouds("f1", 260, ["#ffffff", "#c8dcee"], 6), avila("f1", 200), forest("f1", 60, "palm", "#3e7a3a", 18, 4, { blur: 1.3, h: 14 }), miraflores("f1", 30)]),
    cam: dinT(60.08, [-2.4, 1.6, -3.2, 40], [[61.7, [0, 1.55, -2.0, 36]], [63.35, [0.4, 2.6, -8, 46, -15]]]), lite: DAY, act: (A, lt, u, T) => {
      const hug = clamp((T - 61.75) / 0.35); A.a(LULA, 1, -0.6 + 0.12 * hug, 2.6, { expr: "laugh", look: 1, facing: 1, armB: 0.2 + 0.9 * hug, prop: ["point", 0.4] }); A.a(CHAVEZ, 2, 0.65 - 0.12 * hug, 2.65, { expr: "laugh", look: -1, facing: -1, armB: 0.2 + 0.9 * hug, prop: ["point", 0.4] }, { flip: true });
      flag(A, "ve", -4.6, 4.2, 7, 2.2, 1.45, { wind: 0.9 }); flag(A, "br", 3.0, 4.2, 7, 2.2, 1.45, { wind: 0.9 }); flashes(A, T, [-3, -1.4, 2.5], 1.5, 1.0, 13);
      A.over((g) => caption(g, "Caracas, Venezuela", lt - 2.2, 2.0));
    } },
  // 10 "Também mantinha relações com Rafael Correa, presidente do Equador" — Carondelet, Quito: aperto de mão com Correa
  { t0: 64.28, fade: 0.25, L: () => loc(SKY.andes, { near: "#c0b6a2", far: "#aea48e", kind: "cobble", seed: 17 }, [clouds("f2", 260, ["#ffffff", "#d0dcea"], 7), pichincha("f2", 220), colonial("f2", 90, 8), carondelet("f2", 28)]),
    cam: dinT(64.28, [3, 2.4, -8, 44, -10], [[66.85, [0.2, 1.55, -2.2, 36]], [69.25, [-0.5, 2.0, -4.6, 42]]]), lite: DAY, act: (A, lt, u, T) => {
      const k = clamp((T - 64.4) / 2.2), sh = T > 66.9 ? 0.06 * Math.sin(T * 14) : 0;
      walkS(A, LULA, 1, Math.min(lt, 2.2), -2.6, 2.8, 0.85, { expr: "smile" }, {}); void k;
      if (T > 66.65) { A.items.pop(); A.a(LULA, 1, -0.7, 2.8, { expr: "grin", look: 1, facing: 1, prop: ["point", 0.6 + sh * 3] }); }
      A.a(CORREA, 2, 0.6, 2.85, { expr: T > 66.9 ? "laugh" : "smile", look: -1, facing: -1, prop: T > 66.6 ? ["point", 0.6 - sh * 3] : null }, { flip: true });
      flag(A, "ec", -5, 4.4, 8, 2.2, 1.45, { wind: 0.8 }); flag(A, "br", 3.6, 4.4, 8, 2.2, 1.45, { wind: 0.8 });
      for (let i = 0; i < 2; i++) A.a({ jacket: "#1e2a5a", pants: "#f2f2ea", boots: "#141414", hat: "kepi", cap: "#c41e1e", rifle: true }, 30 + i, -3.4 + i * 7, 6, { expr: "stern" });
      A.over((g) => caption(g, "Quito, Equador", lt - 2.6, 2.4));
    } },
];

function hand(c: (u: number, lt: number) => import("./engine").Cam, amp = 0.03) { return (u: number, lt: number) => { const k = c(u, lt); return { ...k, x: k.x + amp * (Math.sin(lt * 3.1) + 0.5 * Math.sin(lt * 7.3)), y: k.y + amp * 0.7 * (Math.sin(lt * 2.3 + 1) + 0.5 * Math.sin(lt * 6.1)) }; }; }
void walkF; void bigText; void fire; void smokeCol; void easeOut; void smooth; void forest; void rio; void salaImprensa; void BACK; void MOON; void COLD; void LULA_T; void AMORIM; void solVE; void jornal; void tela; void arrowSA; void selva; void narino; void monserrate;
