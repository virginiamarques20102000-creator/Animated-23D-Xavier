// 182.6 – 302.9 s: José Maria, the monk; his followers; the authorities' fear; Taquaruçu → Irani; Paraná sends troops; the battle of Irani.
import { VW, VH, P, glow, fire, smokeCol, puff, clamp, lerp, smooth, easeOut, easeIn, hash, rays, sun, beam, muzzle } from "./engine";
import { Sc, mv, path, hand, walkF, walkS, runS, marchF, marchCol, crowd, flag, signing, panel, caption, bigText, counter, fall, calPage, chapter } from "./kit";
import { blast, scorch, embers, flutter, sparks, lensFlare, glint, birds, dust, bounce, spring } from "./fx";
import { cab, mulher, crianca, cabArm, sold, MONGE, POLIT, OPER, VAQ, EXEC, FARQUHAR, POLICIA, pol, GUALBERTO, OFICIAL, v, mapaSul, hlSul, marca, rota, MST, CONTEST, lantern, halo } from "./props";
import { plat, mata, sala, cidade } from "./lugares";
import { DAY, GOLD, BACK, GREY, NIGHTFIRE, MOON, LAMP, COLD } from "./looks";
import { STAMP, chimney } from "./shots_1";
import type { Shot } from "./types";

const TAQ: [number, number] = [-50.55, -27.15], IRANI: [number, number] = [-51.9, -26.98];
const fumo = (A: Sc, lt: number, z: number, n = 1) => A.fx(z, (g, c) => { for (let i = 0; i < 26 * n; i++) { const k = ((lt * 0.04 + hash(i)) % 1), [sx, sy, s] = P(c, -14 + 28 * k, 0.3 + hash(i + 3) * 1.6, z + hash(i + 6) * 6); puff(g, sx, sy, (2 + hash(i + 9) * 3) * s, [230, 226, 220], 0.12); } });

export const SHOTS_2: Shot[] = [
  // 30 "Foi nesse cenário que surgiu um homem que mudaria completamente o destino daquela população." — dawn mist; a figure walks out of the forest with a staff, god rays behind
  { t0: 182.65, fade: 0.5, L: () => plat("p0", "dawn", { near: [[-6, 9, 16], [6, 11, 18], [-12, 16, 22]], dense: 1.4 }), lite: BACK, bloom: 1.1,
    cam: path([[0, [0, 0.7, -6, 40, 80]], [1, [0, 1.1, -3.4, 36, 50]]]), act: (A, lt, u, T) => {
      walkF(A, MONGE, 500, lt, 0, 5.4, [0, 9], [0, 3.2], { expr: "neutral", prop: ["spear", 0] }, { dark: clamp(0.85 - lt * 0.12), darkCol: "#2a2236" });
      fumo(A, lt, 4, 1.2); A.light((g) => { sun(g, VW * 0.5, VH * 0.38, 26, "255,226,180"); rays(g, VW * 0.5, VH * 0.38, VW * 0.9, 0.22, "255,220,170", 26, lt); }); } },
  // 31 "Seu nome era José Maria." — portrait, slow push; the name appears
  { t0: 188.65, fade: 0.25, L: () => plat("p1", "gold", { near: [[-4, 7, 14]] }), lite: GOLD, bloom: 0.9, cam: mv([0, 1.62, -2.6, 32], [0, 1.64, -2.0, 28]),
    act: (A, lt, u, T) => { A.a(MONGE, 500, 0, 1.4, { expr: "smile_closed", look: 0, prop: ["spear", 0] }); A.over((g) => bigText(g, "JOSÉ MARIA", T - 189.75, 1.9, VH * 0.84, 110)); } },
  // 32 "Ele era um curandeiro e rezador conhecido como monge." — he blesses a kneeling woman by candlelight
  { t0: 191.07, fade: 0.2, L: () => sala("p2", "#6a4a34", { floor: ["#2a1e16", "#3a2a1e"] }), lite: LAMP, bloom: 1.0, cam: path([[0, [1.6, 1.4, -3, 38]], [1, [0.2, 1.4, -2.2, 34]]]),
    act: (A, lt, u, T) => { A.a(MONGE, 500, 0.6, 2.4, { expr: "neutral", look: -1, facing: -1, armB: 1 }); A.a(mulher(2, 9), 501, -0.6, 2.0, { expr: "sad", look: 1, mode: "sit", crouch: 0.8 }, { y: 0.0 });
      for (let i = 0; i < 4; i++) { A.sp("candle", -1.6 + i * 0.25, 0.8, 2.8, { sc: 1 }); lantern(A, -1.6 + i * 0.25, 1.22, 2.8, lt + i, 0.6); }
      A.sp("mesa", -1.25, 0, 2.85, { sc: 0.4 }); A.over((g) => bigText(g, "O MONGE", T - 194.2, 0.9, VH * 0.18, 96)); } },
  // 33a "Percorria comunidades oferecendo conselhos," — he walks the trail between villages; the camera tracks with him
  { t0: 195.06, fade: 0.2, L: () => plat("p3", "day", { near: [[8, 12, 18]] }), lite: DAY, cam: (u, lt) => ({ x: -3 + lt * 1.3, y: 1.4, z: -4.5, fov: 40, shift: 0 }),
    act: (A, lt) => { walkS(A, MONGE, 500, lt, -3, 2.6, 1.3, { expr: "neutral" }); A.sp("rancho", 2, 0, 9); chimney(A, 3.2, 9, lt, 3.6); A.a(cab(2, 12), 510, 2.6, 4.6, { expr: "smile", look: -1, armB: 1 }); A.a(mulher(3, 12), 511, 3.6, 5.0, { expr: "smile_closed", look: -1 }); } },
  // 33b "benzimentos e remédios preparados com ervas." — herbs simmer in the iron pot; he hands a bowl to a mother
  { t0: 197.73, fade: 0.15, L: () => plat("p4", "gold", { near: [[-6, 9, 16]] }), lite: GOLD, bloom: 0.9, cam: mv([-0.8, 0.9, -2.2, 34, 60], [0, 1.1, -1.8, 32, 40]),
    act: (A, lt, u, T) => { A.fx(1.5, (g, c) => { fire(g, c, lt, 0, 0.02, 1.5, 0.35, 5); smokeCol(g, c, lt, 0, 0.6, 1.5, { h: 2.5, w: 0.3, col: [236, 236, 232], a: 0.35, n: 8, wind: 0.1, rate: 0.3 }); }); A.sp("panela", 0, 0.1, 1.45, { sc: 0.9 });
      A.a(MONGE, 500, -0.9, 2.2, { expr: "smile_closed", look: 1, facing: 1, prop: ["bread", 0] }); A.a(mulher(4, 10), 520, 1.0, 2.3, { expr: "smile", look: -1, facing: -1, prop: ["baby", 0] }); } },
  // 34a "Para uma população pobre, sem acesso adequado à medicina e abandonada pelas autoridades," — a sick child in bed, the mother watches by a candle
  { t0: 201.06, fade: 0.25, L: () => sala("p5", "#4a3a2e", { win: 1, winCol: "#3a4a6a", floor: ["#22180e", "#2e2218"] }), lite: MOON, cam: mv([0.8, 1.7, -3.6, 38, -60], [0.2, 1.6, -3.0, 34, -60]), mood: ["#7080a0", 0.25],
    act: (A, lt) => { A.sp("bed", 0, 0, 2.2, { sc: 1 }); A.a(crianca(4, 8), 530, -0.2, 2.2, { expr: "dazed", look: 0 }, { rot: -Math.PI / 2, y: 0.75, shadow: 0, noCast: true }); A.a(mulher(5, 8), 531, 1.3, 2.6, { expr: "sad", look: -1, facing: -1 });
      A.sp("candle", 1.0, 0.6, 1.9); lantern(A, 1.0, 1.02, 1.9, lt, 0.8); } },
  // 34b "José Maria representava esperança." — he appears in the doorway with light behind; faces lift
  { t0: 206.93, fade: 0.2, L: () => sala("p6", "#4a3a2e", { floor: ["#22180e", "#2e2218"] }), lite: BACK, bloom: 1.3, cam: mv([0, 1.4, -3.4, 38], [0, 1.5, -2.6, 34]),
    act: (A, lt, u, T) => { panel(A, 3.9, (w) => { w.rect(-0.8, 0, 1.6, 2.4, "#fff2d0", 2.5); }); A.a(MONGE, 500, 0, 3.7, { expr: "smile_closed", look: 0 }, { dark: 0.75, darkCol: "#3a2a2a" });
      A.a(mulher(5, 8), 531, -1.4, 2.0, { expr: T > 207.9 ? "relief" : "sad", look: 0.8 }); A.a(cab(5, 8), 532, 1.5, 2.2, { expr: T > 208.3 ? "smile" : "sad", look: -0.8 });
      A.light((g) => { const [sx, sy, s] = P(A.cam, 0, 1.4, 3.9); glow(g, sx, sy, 3 * s, "rgba(255,230,170,1)", 0.6); rays(g, sx, sy - 40, VW * 0.5, 0.2, "255,226,170", 18, lt, 1.4, 1.6); }); } },
  // 35 "Seus seguidores começaram a se reunir ao seu redor." — people walk in from every side to the monk under a great araucaria; crane up
  { t0: 209.71, fade: 0.25, L: () => plat("p7", "gold", { near: [[0, 9, 22]] }), lite: GOLD, bloom: 0.8, cam: path([[0, [0, 1.6, -5, 40]], [1, [0, 6.5, -9, 44, -180]]]),
    act: (A, lt) => { A.a(MONGE, 500, 0, 6, { expr: "smile_closed", look: 0, armB: 1 });
      for (let i = 0; i < 22; i++) { const ang = (i / 22) * Math.PI * 2, r1 = 7 + hash(i) * 3, r0 = 2.2 + hash(i + 4) * 1.6, k = smooth(clamp(lt / 2.6 - hash(i + 2) * 0.2)), r = lerp(r1, r0, k);
        A.a(i % 3 === 0 ? mulher(i, 13) : cab(i, 13), 540 + i, Math.cos(ang) * r, 6 + Math.sin(ang) * r * 0.8, { mode: k < 1 ? "stroll" : "stand", phase: (lt * 1.3 + i * 0.3) % 1, expr: "smile_closed", look: -Math.cos(ang) * 0.8 }); } } },
  // 36a "Eram pessoas que haviam perdido suas terras, trabalhadores desempregados" — dolly past the crowd: families with bundles, rail workers with caps
  { t0: 212.91, fade: 0.2, L: () => plat("p8", "gold", { near: [[-10, 12, 18]] }), lite: GOLD, cam: mv([-3.5, 1.5, -3.4, 36], [3.5, 1.5, -3.4, 36], (x) => x),
    act: (A) => { A.a(cab(1, 14), 560, -4.2, 2.4, { expr: "sad", prop: ["suitcase", 0] }); A.a(mulher(1, 14), 561, -3.3, 2.9, { expr: "sad", prop: ["baby", 0] }); A.a(crianca(1, 14), 562, -2.6, 2.2, { expr: "sad" });
      A.a(OPER(1), 563, 0, 2.5, { expr: "stern", look: -0.3 }); A.a(OPER(2), 564, 1.0, 3.0, { expr: "sad" }); A.a(OPER(3), 565, 2.6, 2.4, { expr: "stern", prop: ["shovel", 0] }); A.a(OPER(4), 566, 3.6, 3.2, { expr: "sad" }); } },
  // 36b "e famílias que já não acreditavam que o governo faria alguma coisa por elas." — a family knocks at the government office; the shutters close in their faces
  { t0: 216.83, fade: 0.2, L: () => cidade("p9", "grey", ["#c8b89a", "#b8a888", "#d0c0a0"], 52), lite: GREY, kicks: [[219.6, 4]], cam: mv([1.5, 1.6, -4, 38], [0.4, 1.7, -3, 34]),
    act: (A, lt, u, T) => { const shut = clamp((T - 219.4) / 0.35);
      panel(A, 5, (w) => { w.rect(-3.4, 0, 6.8, 5, "#e0d4bc", 3); w.rect(-3.0, 4.2, 6, 0.6, "#2a2a30", 2); w.text("GOVERNO DO ESTADO", 0, 4.5, 0.32, "#e8c86a"); w.rect(-1.0, 1.4, 2.0, 1.6, "#ffe8b8", 2.5); w.rect(-1.0, 1.4, 1.0 * shut, 1.6, "#4a5a4a", 2.5); w.rect(1.0 - 1.0 * shut, 1.4, 1.0 * shut, 1.6, "#4a5a4a", 2.5); w.rect(2.0, 0, 1.0, 2.4, "#4a3020", 2.5); });
      if (shut < 1) A.a(POLIT(1), 570, 0, 5.1, { expr: "stern", look: 0 }, { y: 1.2, sc: 0.6, shadow: 0, noCast: true, alpha: 1 - shut });
      A.a(cab(7, 15), 571, -0.5, 3.2, { expr: T > 219.6 ? "sad" : "nervous", look: 0.4, armB: T < 219.5 ? 1 : 0 }); A.a(mulher(7, 15), 572, -1.6, 3.5, { expr: "sad", look: 0.6 }); A.a(crianca(5, 15), 573, -1.0, 2.9, { expr: "sad", look: 0.6 }); } },
  // 37 "Em pouco tempo, aquele grupo cresceu." — time-lapse from above: tents and people multiply around the monk
  { t0: 222.0, fade: 0.25, L: () => plat("p10", "day", { dense: 0.8 }), lite: DAY, cam: path([[0, [0, 9, -12, 46, -260]], [1, [0, 13, -16, 48, -330]]]),
    act: (A, lt, u, T) => { const n = Math.floor(lerp(8, 70, smooth((T - 222.6) / 1.6)));
      A.a(MONGE, 500, 0, 6, { expr: "smile_closed", armB: 1 });
      for (let i = 0; i < n; i++) { const ang = hash(i * 3) * Math.PI * 2, r = 1.8 + Math.sqrt(i) * 1.15; A.a(i % 4 === 0 ? mulher(i, 16) : cab(i, 16), 580 + i, Math.cos(ang) * r, 6 + Math.sin(ang) * r, { expr: "smile_closed", look: -Math.cos(ang) }); }
      for (let i = 0; i < Math.floor(n / 6); i++) A.sp("rancho", -16 + (i % 6) * 6.4, 0, 16 + Math.floor(i / 6) * 6, { sc: 0.8 });
      A.over((g) => counter(g, n * 40, "SEGUIDORES", T - 222.6, 2.2, VH * 0.82, "#f6efe0", 90)); } },
  // 38 "As autoridades começaram a enxergar a concentração de pessoas como uma ameaça." — officers on a ridge with field glasses; glint; the camp below
  { t0: 224.83, fade: 0.2, L: () => plat("p11", "grey", { near: [[-9, 10, 18]] }), lite: GREY, cam: path([[0, [2.6, 1.6, -2.8, 36]], [1, [1.0, 1.7, -2.0, 30]]]),
    act: (A, lt, u, T) => { A.a(OFICIAL, 600, 0.8, 1.6, { expr: "stern", look: -1, facing: -1, prop: ["portfolio", 0] }); A.a(POLIT(2), 601, -0.4, 2.0, { expr: T > 228.6 ? "nervous" : "stern", look: -1, facing: -1 });
      for (let i = 0; i < 30; i++) A.a(cab(i, 17), 610 + i, -14 + hash(i) * 12, 26 + hash(i + 5) * 10, { expr: "neutral" }); for (let i = 0; i < 6; i++) A.sp("rancho", -16 + i * 3, 0, 30 + hash(i) * 4, { sc: 0.9 });
      A.light((g) => { const [sx, sy] = P(A.cam, 0.65, 1.62, 1.55); glint(g, sx, sy, 14, 0.6 + 0.4 * Math.sin(lt * 4)); });
      A.over((g) => STAMP(g, "AMEAÇA", T - 228.75, VW * 0.72, VH * 0.24, "#c42a22", 72)); } },
  // 39a "Afinal, José Maria estava reunindo uma população" — the monk preaches from a stump, arms raised; the crowd answers
  { t0: 229.71, fade: 0.2, L: () => plat("p12", "gold", { near: [[9, 12, 20]] }), lite: GOLD, bloom: 0.9, cam: path([[0, [-3, 0.8, -3.6, 40, 80]], [1, [-1, 1.0, -4.6, 42, 60]]]),
    act: (A, lt, u, T) => { A.sp("toco", 0.5, 0, 4.4); A.a(MONGE, 500, 0.5, 4.4, { expr: "smile", look: 0, armB: 1, prop: ["spear", 0] }, { y: 0.7 });
      for (let i = 0; i < 14; i++) A.a(i % 3 ? cab(i, 18) : mulher(i, 18), 650 + i, -5 + (i % 7) * 1.4 + hash(i) * 0.4, 1.8 + Math.floor(i / 7) * 0.9, { expr: i % 2 ? "smile" : "laugh", look: 0.5, armB: (T * 0.8 + i) % 2 > 1.2 ? 1 : 0 }, { dark: 0.35, darkCol: "#2a1a1a" }); } },
  // 39b "que não obedecia aos interesses dos grandes proprietários e dos políticos locais." — the colonels and politicians at the club table, furious
  { t0: 233.03, fade: 0.2, tr: "whip", L: () => sala("p13", "#5a3a2e", { frames: 3, panel: "#2a1a12", curtain: "#5a1e1a", lamps: 2 }), lite: LAMP, kicks: [[235.45, 5]], cam: path([[0, [-1.5, 1.6, -3.2, 38]], [1, [1.0, 1.55, -2.6, 36]]]),
    act: (A, lt, u, T) => { A.sp("mesa", 0, 0, 2.6, { sc: 1.4 });
      for (let i = 0; i < 4; i++) A.a(i === 1 ? { ...VAQ(0), hat: "aba", rifle: false, jacket: "#3a2a22", medals: false } : POLIT(i + 3), 670 + i, -2 + i * 1.3, 3.0 + (i % 2) * 0.3, { expr: i === 1 ? "shout" : "stern", look: 0, prop: i === 1 ? ["fist", T > 235.3 ? 1 : 0] : i === 3 ? ["paper", 0] : undefined }); } },
  // 40 "Em 1912, seus seguidores estavam reunidos em Taquaruçu, em Santa Catarina." — the map, a fire marker at Taquaruçu
  { t0: 238.08, fade: 0.3, L: () => mapaSul("p14", MST.sepia), lite: { sa: 0 }, cam: mv([0, 0.6, -34, 40], [-0.6, -0.8, -16, 40]),
    act: (A, lt, u, T) => { hlSul(A, CONTEST, 1, "#b3221c", 0.2, true); marca(A, TAQ[0], TAQ[1], T - 241.5, "TAQUARUÇU", { kind: "fire" }); A.over((g) => caption(g, "TAQUARUÇU · SANTA CATARINA · 1912", T - 238.3, 5.6)); } },
  // 41a "Mas, diante da pressão das autoridades, José Maria deixou o local" — mounted police at the edge of the camp; the monk leads the people away
  { t0: 244.01, fade: 0.25, L: () => plat("p15", "grey", { near: [[-10, 14, 18]] }), lite: GREY, cam: path([[0, [3, 1.6, -5, 40]], [1, [-1, 1.8, -6, 42]]]),
    act: (A, lt, u, T) => { for (let i = 0; i < 4; i++) { A.sp("cavalo", 5 + i * 2.2, 0, 7 + i * 0.6, { flip: true }); A.a(pol(i), 700 + i, 5.2 + i * 2.2, 7.02 + i * 0.6, { expr: "stern", mode: "sit", look: -1 }, { y: 1.05 }); }
      const go = clamp((T - 246.95) / 3);
      walkS(A, MONGE, 500, Math.max(0, T - 246.95), 0.5, 4, -1.1, { expr: "neutral" });
      for (let i = 0; i < 8; i++) walkS(A, i % 3 ? cab(i, 19) : mulher(i, 19), 710 + i, Math.max(0, T - 247.1 - i * 0.12), 1.5 + i * 0.9, 4.5 + (i % 3) * 0.5, -1.1, { expr: "sad" });
      void go; for (let i = 0; i < 3; i++) A.sp("rancho", -6 + i * 4, 0, 13); } },
  // 41b "e seguiu com seus seguidores até Irani, uma região disputada entre Paraná e Santa Catarina." — the route on the map, Taquaruçu → Irani
  { t0: 247.83, fade: 0.2, L: () => mapaSul("p16", MST.sepia), lite: { sa: 0 }, cam: mv([-0.6, -0.8, -16, 40], [-1.8, -0.9, -13, 40]),
    act: (A, lt, u, T) => { hlSul(A, CONTEST, 1, "#b3221c", 0.2, true); marca(A, TAQ[0], TAQ[1], 5, "TAQUARUÇU"); rota(A, [TAQ[0], TAQ[1], -51.0, -27.0, -51.5, -26.9, IRANI[0], IRANI[1]], (T - 248.0) / 1.8, "#f2d24a");
      marca(A, IRANI[0], IRANI[1], T - 249.7, "IRANI", { kind: "fire", dx: -2.2, dy: -0.6 }); } },
  // 42 "A chegada daquele grupo provocou uma reação imediata." — the telegraph clatters in Curitiba; a messenger runs out
  { t0: 254.84, fade: 0.2, tr: "punch", L: () => sala("p17", "#5a4e40", { win: 2, winCol: "#d8e0e4", frames: 1, panel: "#2e2418" }), lite: LAMP, cam: mv([0, 1.4, -2.4, 36], [0.4, 1.35, -1.8, 32]),
    act: (A, lt, u, T) => { A.sp("mesa", 0, 0, 2.0, { sc: 0.7 }); A.sp("radio", -0.3, 0.78, 1.95, { sc: 0.6 }); A.a(POLIT(4), 720, -0.3, 2.4, { expr: "nervous", look: 0, prop: ["pen", (lt * 8) % 1] });
      A.fx(1.9, (g, c) => { const [sx, sy, s] = P(c, -0.3, 1.05, 1.9); if ((lt * 9) % 1 < 0.5) glow(g, sx, sy, 0.1 * s, "rgba(255,200,120,1)", 0.8); });
      runS(A, pol(3), 721, Math.max(0, T - 256.4), 0.6, 2.8, 3.6, { expr: "shout" }); A.over((g) => STAMP(g, "URGENTE", T - 257.1, VW * 0.74, VH * 0.24, "#c42a22", 70)); } },
  // 43a "O governo paranaense interpretou a movimentação como uma possível tentativa de ocupação catarinense" — Paraná's leaders over the map; a red arrow from the south
  { t0: 258.58, fade: 0.2, L: () => mapaSul("p18", MST.olive), lite: { sa: 0 }, cam: mv([-1.2, -0.2, -22, 40], [-1.6, -0.4, -16, 40]),
    act: (A, lt, u, T) => { hlSul(A, [-54.6, -25.5, -54.3, -24.1, -54.1, -23.9, -52.6, -22.6, -51.4, -22.6, -50.0, -22.9, -49.6, -23.5, -49.2, -24.6, -48.5, -25.0, -48.1, -25.6, -48.6, -26.0, -49.5, -26.2, -51.3, -26.6, -53.7, -26.2], 1, "#3a8a4a", 0.25, false);
      rota(A, [-50.4, -28.0, -51.2, -27.5, IRANI[0], IRANI[1]], (T - 262.0) / 1.2, "#d0302a", 0.3); marca(A, IRANI[0], IRANI[1], 3, "IRANI", { kind: "fire", dx: -2.2, dy: -0.6 });
      A.over((g) => STAMP(g, "INVASÃO?", T - 263.1, VW * 0.7, VH * 0.22, "#c42a22", 70)); } },
  // 43b "e decidiu enviar tropas para enfrentar os sertanejos." — the Paraná regiment marches out under its commander
  { t0: 264.78, fade: 0.2, tr: "whip", L: () => plat("p19", "day", { near: [[-12, 14, 20]] }), lite: DAY, cam: path([[0, [6, 1.0, -5, 42, 40]], [1, [1, 1.3, -6, 42, 20]]]),
    act: (A, lt) => { A.a(GUALBERTO, 730, 1.0, 3.0 - lt * 1.2 + 4, { mode: "march", phase: (lt * 1.2 / 1.5) % 1, expr: "stern", prop: ["katana", 0] }); marchF(A, (i) => pol(i), lt, 6, 4, 5.5, 1.2, 1.15, 1.5, 740, () => ({ expr: "stern" }), {}, 1.0);
      flag(A, "br", -2.4, 3.4, 6 - lt * 1.2 + 3, 1.3, 0.9); A.fx(10, (g, c) => dust(g, c, lt, 1, 9, -1, 1.3, [170, 150, 120], 5)); } },
  // 44 "Em 22 de outubro de 1912, aconteceu o primeiro grande combate da Guerra do Contestado." — calendar page in the misty field, then the chapter title
  { t0: 268.31, fade: 0.3, L: () => plat("p20", "dawn", { near: [[-7, 10, 16], [8, 12, 18]], dense: 1.2 }), lite: BACK, bloom: 0.9, cam: mv([0, 1.7, -2.4, 36], [0, 1.7, -1.4, 30]),
    act: (A, lt, u, T) => { if (T < 271.5) calPage(A, 0, 2.3, 2.0, "OUTUBRO", "22", "1912"); fumo(A, lt, 3, 1.4);
      A.over((g) => chapter(g, "O PRIMEIRO COMBATE", "A GUERRA DO CONTESTADO", T - 271.6, 3.4)); } },
  // 45 "De um lado estavam soldados armados." — the Paraná line kneels in the mist, rifles and a machine gun; dolly along
  { t0: 275.61, fade: 0.25, L: () => plat("p21", "dawn", { near: [[10, 12, 18]], dense: 1.2 }), lite: BACK, cam: mv([-3, 1.0, -2.4, 38, 40], [2, 1.0, -2.4, 38, 40], (x) => x),
    act: (A, lt) => { for (let i = 0; i < 9; i++) A.a(pol(i), 760 + i, -5 + i * 1.25, 2.6 + (i % 2) * 0.6, { expr: "stern", look: 1, facing: 1, crouch: 0.55, prop: ["rifleUp", 0] });
      A.sp("mg", 1.6, 0, 2.2, { sc: 1.1 }); A.a(GUALBERTO, 730, 4.2, 3.6, { expr: "stern", look: 1, prop: ["katana", 0] }); fumo(A, lt, 5, 1.2); } },
  // 46 "Do outro, seguidores de José Maria, que acreditavam estar defendendo sua comunidade e sua fé." — the faithful with wooden swords and the white flag, the monk with the cross; they kneel to pray
  { t0: 278.28, fade: 0.2, L: () => plat("p22", "dawn", { near: [[-10, 12, 18]], dense: 1.2 }), lite: GOLD, bloom: 1.0, cam: path([[0, [2, 1.2, -3.4, 38, 30]], [1, [-0.5, 1.4, -2.8, 36, 20]]]),
    act: (A, lt, u, T) => { const kneel = clamp((T - 283.6) / 0.5);
      A.a(MONGE, 500, 0, 3.6, { expr: "neutral", look: 0, prop: ["spear", 0], crouch: kneel * 0.4 }); flag(A, "cont", -1.6, 3.2, 4.0, 1.4, 1.0, { wind: 1.1 });
      for (let i = 0; i < 10; i++) A.a({ ...cabArm(i, 20), rifle: false }, 780 + i, -4.4 + (i % 5) * 2.0 + (i > 4 ? 1 : 0), 2.8 + Math.floor(i / 5) * 1.6, { expr: "stern", look: -0.6, prop: i % 2 ? ["katana", 0] : ["rifleUp", 0], crouch: kneel * 0.6 });
      fumo(A, lt, 6, 1); A.light((g) => rays(g, VW * 0.5, VH * 0.1, VW * 0.8, 0.12 * kneel + 0.06, "255,230,180", 16, lt, 1.2, 1.57)); } },
  // 47 "O confronto terminou com mortes dos dois lados." — the clash: volleys, smoke, men fall on both sides
  { t0: 284.73, fade: 0.1, tr: "flash", L: () => plat("p23", "dawn", { dense: 1.2 }), lite: GREY, kicks: [[285.0, 6], [285.6, 5], [286.3, 7]], wx: ["ash", 60, 0.4], cam: hand(path([[0, [-2, 1.4, -5, 42]], [1, [2, 1.3, -4.5, 40]]]), 0.05),
    act: (A, lt, u, T) => { for (let i = 0; i < 5; i++) A.a(pol(i), 800 + i, 3 + i * 1.1, 4 + (i % 2) * 0.8, { expr: "shout", look: -1, facing: -1, crouch: 0.4 });
      for (let i = 0; i < 5; i++) A.a(cabArm(i, 21), 810 + i, -6 + i * 1.1, 4 + (i % 2) * 0.8, { expr: "shout", look: 1, facing: 1, prop: ["katana", 0.5] });
      fall(A, pol(7), 820, 2.2, 3.4, T, 286.3, { dir: 1 }); fall(A, cabArm(7, 21), 821, -2.2, 3.6, T, 286.7, { dir: -1 });
      A.fx(3.5, (g, c) => { for (let i = 0; i < 6; i++) { const k = (T * 2.3 + hash(i)) % 1; if (k < 0.08) { const [sx, sy, s] = P(c, i < 3 ? 2.6 + i : -5.4 + i, 1.2, 4); glow(g, sx, sy, 0.6 * s, "rgba(255,220,140,1)", 1); } }
        for (let i = 0; i < 14; i++) { const [sx, sy, s] = P(c, -6 + i, 1 + hash(i) * 2, 5 + hash(i + 2) * 2); puff(g, sx, sy, (1 + hash(i + 3)) * s, [200, 196, 190], 0.22); } }); } },
  // 48a "Entre as vítimas estavam o próprio José Maria" — slow motion: the monk falls, the cross slipping from his hand
  { t0: 288.10, fade: 0.25, L: () => plat("p24", "dawn", { near: [[8, 12, 18]], dense: 1.2 }), lite: BACK, bloom: 0.9, cam: mv([0, 1.2, -3, 36, 20], [0, 0.8, -2.2, 32, 60]), mood: ["#9a8aa0", 0.2],
    act: (A, lt, u, T) => { fall(A, MONGE, 500, 0, 2.6, 289.4 + (T - 289.4) * 0.45, 289.9, { dir: -1, expr: "pained" }); fumo(A, lt, 4, 1.3); } },
  // 48b "e o comandante das forças paranaenses, João Gualberto." — the commander, sword raised, falls; his name
  { t0: 290.95, fade: 0.2, L: () => plat("p25", "dawn", { near: [[-8, 12, 18]], dense: 1.2 }), lite: BACK, cam: mv([0.6, 1.4, -3, 38], [0.2, 1.2, -2.4, 34]),
    act: (A, lt, u, T) => { fall(A, GUALBERTO, 730, 0, 2.6, T, 292.4, { dir: 1, expr: "shock" }); fumo(A, lt, 4, 1.3); A.over((g) => caption(g, "JOÃO GUALBERTO · COMANDANTE PARANAENSE", T - 293.2, 2.0)); } },
  // 49 "O governo acreditava que, com a morte do monge, o movimento perderia sua força." — officials in Curitiba, relieved: a toast, a telegram on the desk
  { t0: 294.75, fade: 0.25, L: () => sala("p26", "#5a3a2e", { frames: 3, curtain: "#5a1e1a", lamps: 2, panel: "#2a1a12" }), lite: LAMP, cam: mv([0, 1.55, -2.8, 38], [0.2, 1.55, -2.2, 34]),
    act: (A, lt, u, T) => { A.sp("mesa", 0, 0, 2.2, { sc: 1.1 }); A.sp("telegram", 0, 0.82, 2.15, { sc: 0.35 });
      for (let i = 0; i < 3; i++) A.a(POLIT(i + 6), 840 + i, -1.4 + i * 1.4, 2.7, { expr: T > 296.6 ? "grin" : "stern", look: 0, prop: ["bread", 0] }); } },
  // 50 "Mas aconteceu exatamente o contrário." — night, the monk's grave: candles multiply as more and more people arrive
  { t0: 299.97, fade: 0.25, tr: "punch", L: () => plat("p27", "night", { near: [[-6, 10, 16]] }), lite: MOON, bloom: 1.0, cam: path([[0, [0, 1.2, -2.6, 36]], [1, [0, 2.6, -5, 42, -80]]]),
    act: (A, lt, u, T) => { A.sp("cruz", 0, 0, 3, { sc: 0.55 });
      const n = Math.floor(lerp(4, 40, smooth((T - 300.7) / 2))); for (let i = 0; i < n; i++) { const a = hash(i) * Math.PI - Math.PI, r = 1.2 + hash(i + 3) * 3.2, x = Math.cos(a) * r, z = 3 + Math.sin(a) * r * 0.6 + 1.5;
        A.sp("candle", x, 0, z, { sc: 1.2 }); lantern(A, x, 0.48, z, lt + i, 0.7); }
      for (let i = 0; i < Math.floor(n / 3); i++) A.a(i % 2 ? mulher(i, 22) : cab(i, 22), 860 + i, -4 + (i % 7) * 1.3, 5 + Math.floor(i / 7) * 1.2, { expr: "sad", look: 0, crouch: 0.4 }, { dark: 0.5, darkCol: "#1a1424" }); } },
];
