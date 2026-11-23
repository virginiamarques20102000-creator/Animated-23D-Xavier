// 331 – 545 s: Caxias, fall of Humaitá, Asunción, López in the interior, Acosta Ñu, Cerro Corá, consequences, lesson, ending.
import { VW, VH, P, glow, fire, smokeCol, puff, clamp, lerp, smooth, easeOut, easeIn, hash, rays, sun, stamp, fall, C, mv, path, hand, walkF, walkS, runS, marchF, marchCol, crowd, ship, flag, caption, bigText, chapter, counter, panel, v,
  blast, scorch, rubble, embers, flutter, coins, sparks, lensFlare, glint, birds, dust, lightning, breath, loc, mtn, hillL, clouds, city, forest, wall, ruins, field, cliffs, mix, shade, DAY, GOLD, BACK, GREY, NIGHTFIRE, MOON, LAMP, COLD, NOON, RED,
  PEDRO, LOPEZ, LOPEZ_F, CAXIAS, CONDE, MITRE, FLORES, BR, BRV, AR, UY, PY, PYK, SAILBR, tone, pyciv, pykid, samap, MAPS, hlS, arrowS, pinS, SX, SY, river, battery, earthwork, abatis, volley, gunFire, funnel, ball, waterHit,
  say, wade, reeds, road, colonial, graves, campfire, haze, k01 } from "./scn";
import type { Shot } from "./scn";
import { facade } from "./paint";
const OLDPEDRO = { ...PEDRO, hair: "#f2f0ea", beard: "#f4f2ec", moustache: "#f4f2ec" };

export const SHOTS_4: Shot[] = [
  // 55a "O comando brasileiro passou a ganhar destaque com…" — Caxias rides into camp on foot with his staff; soldiers snap to attention
  { t0: 331.53, L: () => loc(["#4a7ab8", "#ecdcc0"], { near: "#6a6a3c", far: "#8a8a54", kind: "grass", seed: 121, zFar: 300 }, [
      clouds("a55", 240, ["#ffffff", "#a0b4c8"], 81, 40, 110, 14, 3), forest("a55", 80, "palm", "#4a6a3e", 24, 61, { blur: 1.4, h: 13 })]),
    cam: mv([-4, 1.8, -7, 42], [0, 1.8, -6, 40]), lite: DAY, act: (A, lt, u, T) => {
      for (let i = 0; i < 6; i++) A.sp("tent", -14 + i * 5.4, 0, 14 + (i % 2) * 2, { sc: 1 });
      walkS(A, CAXIAS, 800, lt, -5, 3.4, 1.0, { expr: "stern" }); walkS(A, tone(BR, 520, false), 801, lt, -6.6, 3.9, 1.0, { expr: "neutral" });
      for (let i = 0; i < 5; i++) A.a(tone(BR, i + 521), 802 + i, -2 + i * 1.6, 6 + (i % 2) * 0.4, { expr: T > 332.8 ? "stern" : "neutral", look: -0.6, armB: T > 332.8 ? 1 : 0.2, headTilt: 0 });
      flag(A, "imp", 6, 3.6, 8, 1.6, 1.0, { wind: 1.0 });
    } },
  // 55b "…Luís Alves de Lima e Silva, o Duque de Caxias." — close-up: Caxias, white moustache, steady gaze
  { t0: 334.3, L: () => loc(["#5a86c0", "#f0dcc0"], { near: "#6a6a3c", far: "#8a8a54", kind: "grass", seed: 122 }, [clouds("b55", 200, ["#ffffff", "#aabcd0"], 82, 30, 90, 12, 3), forest("b55", 30, "palm", "#4a6a3e", 12, 62, { blur: 3, h: 12 })]),
    cam: mv([0.3, 1.64, -3.8, 36], [0.05, 1.64, -3.1, 32]), lite: GOLD, bloom: 0.6, act: (A, lt, u, T) => {
      A.a(CAXIAS, 800, 0, 0.6, { expr: "stern", look: 0.3, headTilt: -2 }); flag(A, "imp", -2.6, 3.4, 3.6, 1.6, 1.0, { wind: 1.0 });
      A.over((g) => caption(g, "DUQUE DE CAXIAS", T - 336.3, 1.3));
    } },
  // 56a "Ele reorganizou as forças brasileiras" — drill: ranks wheel and dress lines under Caxias' eye
  { t0: 337.48, L: () => loc(["#5a86c0", "#e8dcc4"], { near: "#7a7a44", far: "#9a9a5e", kind: "grass", seed: 123, zFar: 300 }, [
      clouds("c56", 240, ["#ffffff", "#9ab0c8"], 83, 40, 110, 14, 3), hillL("c56", 160, "#7a8a7a", 21, 10, 2.5)]),
    cam: mv([0, 3.2, -9, 44, -60], [0, 3.6, -8, 42, -70]), lite: DAY, act: (A, lt) => {
      for (let r = 0; r < 3; r++) for (let c = 0; c < 8; c++) { const ph = (lt * 1.2 + r * 0.5) % 1; A.a(tone(r === 1 ? BRV : BR, r * 8 + c + 530), 820 + r * 8 + c, -6 + c * 1.6 + 0.2 * Math.sin(lt * 1.5 + r), 6 + r * 1.8, { mode: "march", phase: ph, expr: "stern" }); }
      A.a(CAXIAS, 800, 5.6, 3.2, { expr: "stern", look: -0.8 });
    } },
  // 56b "…e preparou novas operações militares." — an observation balloon rises over the lines (Caxias used them at Humaitá)
  { t0: 339.75, L: () => loc(["#4a7ab8", "#f0dcc0"], { near: "#6a7240", far: "#8a9058", kind: "grass", seed: 124, zFar: 300 }, [
      clouds("d56", 260, ["#ffffff", "#a8bccc"], 84, 30, 120, 16, 3), forest("d56", 90, "palm", "#4a6a3e", 28, 63, { blur: 1.3, h: 13 })]),
    cam: mv([0, 1.8, -10, 44, 150], [0, 2.4, -11, 44, 520]), lite: DAY, act: (A, lt) => {
      const h = 0.8 + lt * 1.4; A.fx(8, (g, c) => { const [bx, by, s] = P(c, 0.5, h + 3.2, 8), [gx, gy] = P(c, 0.5, 0, 8);
        g.strokeStyle = "rgba(40,30,24,0.7)"; g.lineWidth = 2; for (const d of [-3, 3]) { const [ax, ay] = P(c, 0.5 + d, 0, 8 - 1); g.beginPath(); g.moveTo(bx, by + 0.4 * s); g.lineTo(ax, ay); g.stroke(); } void gx; void gy;
        const gr = g.createRadialGradient(bx - 0.8 * s, by - 1.2 * s, 0.3 * s, bx, by, 2.6 * s); gr.addColorStop(0, "#f2e8d0"); gr.addColorStop(1, "#b8a07a"); g.fillStyle = gr; g.strokeStyle = "#2a1d16"; g.lineWidth = 3; g.beginPath(); g.ellipse(bx, by - 1.6 * s, 2.0 * s, 2.4 * s, 0, 0, 7); g.fill(); g.stroke();
        for (let k = -2; k <= 2; k++) { g.beginPath(); g.ellipse(bx, by - 1.6 * s, Math.abs(k) * 0.45 * s, 2.4 * s, 0, 0, 7); g.stroke(); }
        g.fillStyle = "#6a4a2c"; g.fillRect(bx - 0.5 * s, by + 0.9 * s, 1.0 * s, 0.5 * s); g.strokeRect(bx - 0.5 * s, by + 0.9 * s, 1.0 * s, 0.5 * s); g.beginPath(); g.moveTo(bx - 0.5 * s, by + 0.9 * s); g.lineTo(bx - 1.2 * s, by + 0.3 * s); g.moveTo(bx + 0.5 * s, by + 0.9 * s); g.lineTo(bx + 1.2 * s, by + 0.3 * s); g.stroke(); });
      A.a(tone(BR, 560, false), 850, 0.4, 7.9, { expr: "grin", look: 0.5, prop: ["paper", 0] }, { y: h + 1.4, sc: 0.5 });
      for (let i = 0; i < 4; i++) A.a(tone(BR, i + 561), 851 + i, -3 + i * 2.2, 5 + (i % 2), { expr: "shock", look: 0.2, headTilt: -10 });
    } },
  // 57a "Em agosto de 1868, após uma longa campanha," — ironclads force the passage under Humaitá's guns at night
  { t0: 342.79, L: () => loc(["#0e1022", "#3a3050"], { near: "#1e1e1a", far: "#2a2a24", kind: "grass", seed: 125, zFar: 300 }, [
      clouds("e57", 220, ["#3a3450", "#0e0e1a"], 85, 30, 100, 18, 5), battery("e57", 60, { col: "#5a3428", wid: 50, h: 5, n: 18, blur: 1.1, seed: 31 })]),
    cam: hand(mv([-6, 1.6, -14, 42], [2, 1.8, -12, 40]), 0.03), lite: MOON, bloom: 0.8, kicks: [[344.0, 6], [345.0, 7]], act: (A, lt, u, T) => {
      river(A, 3, 58, ["#10141e", "#3a3a52"], { seed: 141 });
      for (let i = 0; i < 2; i++) { const x = -18 + i * 9 + lt * 2.2, z = 26 + i * 8; ship(A, "ironclad", x, z, { vel: 2.2, sc: 0.95, guns: [[T - 343.6 - i * 0.5, 4, 2.8]] }); funnel(A, x + 1, 7.6, z, { a: 0.6, sc: 0.95 }); }
      volley(A, T, 343.2, -30, 30, 59, 2.6, -1, 16, 51); volley(A, T, 344.8, -30, 30, 59, 2.6, -1, 16, 52);
      for (const [at, x] of [[344.0, -6], [345.0, 6], [345.6, -12]] as number[][]) A.fx(30.4, (g, c) => waterHit(g, c, T - at, x, 30.4, 7, x + 13));
      A.over((g) => caption(g, "AGOSTO DE 1868", T - 343.0, 2.8));
    } },
  // 57b "…Humaitá finalmente caiu." — the ruined battery at dawn: the tricolour comes down, the imperial flag goes up
  { t0: 346.85, L: () => loc(["#5a6a90", "#f0c49a"], { near: "#4a3a2a", far: "#6a5238", kind: "rubble", seed: 126 }, [
      clouds("f57", 240, ["#ffd8b0", "#5a6a90"], 86, 30, 110, 16, 4), battery("f57", 20, { col: "#9a5a3c", wid: 24, h: 4.6, n: 8, ruin: true, seed: 33 })]),
    cam: mv([0, 2.2, -8, 42, -20], [0, 2.6, -6.5, 38, -40]), lite: GOLD, bloom: 0.7, act: (A, lt, u, T) => {
      A.fx(19, (g, c) => { smokeCol(g, c, lt, -8, 2, 19, { h: 20, w: 3, col: [60, 54, 52], a: 0.5, seed: 4, wind: 0.4 }); embers(g, c, lt, 6, 19, 6, 20, 5, 8); });
      flag(A, "par", -2, 5.2 - 4 * smooth(k01(T, 347.4, 349.0)), 18.5, 1.8, 1.2, { wind: 0.6, droop: 0.4 });
      flag(A, "imp", 2.4, 0.8 + 4.4 * easeOut(k01(T, 349.0, 350.0)), 18.5, 2.0, 1.3, { wind: 1.1 });
      for (let i = 0; i < 5; i++) A.a(tone(i % 2 ? BRV : BR, i + 570), 860 + i, -4 + i * 2, 5 + (i % 2), { expr: T > 349.1 ? "laugh" : "stern", armB: T > 349.1 ? 1 : 0.2, wave: T > 349.1 ? 1 : 0, look: 0.2 });
    } },
  // 58 "A partir daquele momento, o caminho até Assunção… ficou muito mais acessível." — map: green arrow runs up the river to the capital
  { t0: 349.97, L: () => samap("g58", MAPS.olive, { towns: ["hum", "asu"] }), cam: mv([SX(-58.2), SY(-26.6), -16, 40], [SX(-57.9), SY(-25.8), -12, 38]), lite: DAY, act: (A, lt, u, T) => {
      pinS(A, "hum", 1, "x", "#1f7a3a"); arrowS(A, [-58.5, -27.05], [-57.62, -25.4], k01(T, 351.7, 353.2), "#1f7a3a", 0.16, -0.25); pinS(A, "asu", T - 352.6, "star", "#d52b1e");
    } },
  // 59a "No final daquele ano… em batalhas como Itororó" — a narrow wooden bridge, the column charges across behind Caxias
  { t0: 356.6, L: () => loc(["#4a76b0", "#ecd8b8"], { near: "#5a6a38", far: "#7a8a50", kind: "grass", seed: 127, zFar: 300 }, [
      clouds("h59", 240, ["#ffffff", "#a0b4c8"], 87, 40, 110, 14, 3), forest("h59", 30, "oak", "#3e5a32", 14, 64, { blur: 1.4, h: 11 }), forest("h59b", 70, "palm", "#4a6a3e", 20, 65, { blur: 1.8, h: 13 })]),
    cam: hand(mv([-5, 1.8, -6, 44], [0, 1.9, -5, 40]), 0.035), lite: DAY, kicks: [[361.2, 8], [362.0, 8]], act: (A, lt, u, T) => {
      river(A, 4, 9, ["#4a5a50", "#8a9a8a"], { seed: 151 });
      A.fx(6.4, (g, c) => { const [x0, y0, s] = P(c, -12, 0.7, 6.4), [x1] = P(c, 12, 0.7, 6.4); g.fillStyle = "#7a5432"; g.fillRect(x0, y0, x1 - x0, 0.25 * s); g.strokeStyle = "#2a1d16"; g.lineWidth = 3; g.strokeRect(x0, y0, x1 - x0, 0.25 * s); for (let x = -12; x <= 12; x += 2) { const [px, py] = P(c, x, 0.7, 6.4); g.beginPath(); g.moveTo(px, py); g.lineTo(px, py - 0.8 * s); g.stroke(); } const [, ry] = P(c, 0, 1.5, 6.4); g.beginPath(); g.moveTo(x0, ry); g.lineTo(x1, ry); g.stroke(); });
      for (let i = 0; i < 7; i++) runS(A, tone(BR, i + 580), 870 + i, lt, -8 - i * 1.3, 6.3, 2.6, { expr: "shout" }, { y: 0.95 });
      A.a(CAXIAS, 800, -5 + Math.min(lt, 3) * 2.4, 6.2, { expr: "shout", armB: 1, talk: Math.floor(T * 8) % 4 + 1 }, { y: 0.95 });
      volley(A, T, 361.2, 9, 14, 12, 1.4, -1, 5, 61); A.fx(7, (g, c) => blast(g, c, T - 362.0, 4, 0, 7, 1.6, 33));
      A.over((g) => bigText(g, "ITORORÓ", T - 361.2, 1.2, VH * 0.18, 76));
    } },
  // 59b "…e Lomas Valentinas." — hillside trenches wreathed in white powder smoke at sunset
  { t0: 362.33, L: () => loc(["#3a3a60", "#f09060"], { near: "#4a4a30", far: "#6a6440", kind: "grass", seed: 128, zFar: 300 }, [
      clouds("i59", 240, ["#ffa878", "#3a3a5a"], 88, 30, 100, 18, 4), hillL("i59", 60, "#5a6a40", 23, 10, 1.2), earthwork("i59", 58, "#7a4a2e", { h: 1.8, wid: 50, emb: 10, blur: 1.2, seed: 17 })]),
    cam: mv([0, 2.0, -12, 42], [0, 2.2, -10, 40]), lite: BACK, bloom: 0.8, kicks: [[362.6, 5], [363.3, 5]], act: (A, lt, u, T) => {
      volley(A, T, 362.5, -20, 20, 57, 9, -1, 14, 71); volley(A, T, 363.2, -20, 20, 57, 9, -1, 14, 72);
      for (let i = 0; i < 4; i++) A.fx(40, (g, c) => blast(g, c, T - 362.8 - i * 0.3, -12 + i * 8, 7, 40, 3, 150 + i));
      A.over((g) => bigText(g, "LOMAS VALENTINAS", T - 362.4, 1.6, VH * 0.18, 70));
    } },
  // 60 "O exército paraguaio estava cada vez mais enfraquecido." — a few ragged men, bandaged, some barefoot, walking in the drizzle
  { t0: 363.92, L: () => loc(["#5a5e66", "#a8a49a"], { near: "#4a3e2e", far: "#6a5a44", kind: "mud", seed: 129 }, [clouds("j60", 220, ["#b8b4aa", "#4a4e56"], 89, 20, 90, 20, 5), forest("j60", 50, "palm", "#3a4436", 16, 66, { blur: 2, h: 12 })]),
    cam: mv([2, 1.6, -5.4, 40], [-1, 1.6, -4.4, 38]), lite: GREY, bloom: 0.4, wx: ["rain", 200, 0.4], act: (A, lt) => {
      for (let i = 0; i < 5; i++) walkS(A, v(tone(i % 2 ? PYK : PY, i + 590, i % 2 === 0), { jacket: mix("#a3241d", "#6a5a4a", 0.35), hat: i === 3 ? "hair" : i % 2 ? "cap" : "shako", band: i === 1 ? "#f2efe6" : undefined }), 880 + i, lt, -0.5 - i * 1.4, 2.6 + (i % 2) * 1.4, 0.75, { expr: i % 2 ? "sad" : "pained" });
    } },
  // 61 "Em primeiro de janeiro de 1869, as tropas brasileiras ocuparam Assunção." — the column marches past López's empty palace
  { t0: 367.94, L: () => loc(["#4a7ab8", "#f0e0c4"], { near: "#9a7a56", far: "#b09070", kind: "sand", seed: 130 }, [
      clouds("k61", 240, ["#ffffff", "#a8bccc"], 90, 40, 110, 14, 3), colonial("k61", 30, 101, { blur: 0.8 })]),
    cam: mv([-6, 2.4, -10, 42, -20], [2, 2.6, -9, 40, -20]), lite: NOON, act: (A, lt, u, T) => {
      A.sp("palace", 6, 0, 26, { sc: 0.85 }); flag(A, "imp", 6, 15.8 * 0.85 + 0.2 + 0 * T, 25.9, 2.0, 1.3, { wind: 0.9 });
      marchCol(A, (i) => tone(i % 3 ? BR : BRV, i + 600), lt, 10, -2, 5, 1.3, 1.25, 2, 1.2, {}, { expr: "stern" }, 890);
      for (let i = 0; i < 3; i++) A.a(pyciv(i + 4, 100), 920 + i, 6 + i * 1.6, 9, { expr: i % 2 ? "sad" : "fear", look: -0.6 });
      A.over((g) => caption(g, "1º DE JANEIRO DE 1869 · ASSUNÇÃO", T - 368.2, 3.0));
    } },
  // 62 "Parecia que a guerra havia terminado." — soldiers at ease under the palms: a guitar, laughter, a hat over the eyes
  { t0: 374.26, L: () => loc(["#4a80c0", "#f4e0c0"], { near: "#7a8a44", far: "#9aa05a", kind: "grass", seed: 131 }, [clouds("l62", 220, ["#ffffff", "#aac0d4"], 91, 40, 100, 12, 3), forest("l62", 18, "palm", "#4a7040", 10, 67, { blur: 1.8, h: 12 })]),
    cam: mv([-1, 1.4, -5, 40], [0.6, 1.4, -4.2, 36]), lite: GOLD, bloom: 0.7, act: (A, lt, u, T) => {
      A.a(tone(BR, 610, false), 930, -1.6, 2.4, { expr: "smile_closed", crouch: 0.8, headTilt: 8 });
      say(A, tone(BRV, 611, false), 931, 0.4, 2.6, { expr: "laugh", crouch: 0.7 }, {}, true); A.a(tone(AR, 612, false), 932, 2.2, 2.8, { expr: "relief", crouch: 0.75, look: -0.6 });
      A.fx(20, (g, c) => birds(g, c, lt, 5, -6, 8, 20, 1.5, "#2a2026", 21, 0.4));
    } },
  // 63 "Mas Solano López ainda não havia se rendido." — López by a forest campfire, eyes hard
  { t0: 376.83, L: () => loc(["#0a0c14", "#1a1e2a"], { near: "#1a1610", far: "#1e1a14", kind: "grass", seed: 132 }, [forest("m63", 14, "oak", "#141a16", 10, 68, { blur: 2.4, h: 12 }), forest("m63b", 30, "palm", "#0e1210", 14, 69, { blur: 3, h: 13 })]),
    cam: mv([0.4, 1.64, -3.9, 36], [0.1, 1.64, -3.1, 32]), lite: NIGHTFIRE, bloom: 0.8, act: (A, lt, u, T) => {
      A.a(LOPEZ_F, 1, 0, 0.6, { expr: "stern", look: T > 378.4 ? 0.9 : 0.4, headTilt: T > 378.4 ? -3 : 1 });
      campfire(A, 1.3, 0.2, 0.45, 13); A.light((g) => { const fl = 0.8 + 0.2 * Math.sin(lt * 19) * Math.sin(lt * 6); glow(g, VW * 0.8, VH * 0.85, VW * 0.6, "rgba(255,140,50,1)", 0.4 * fl); });
    } },
  // 64a "Mesmo depois da queda da capital, López continuou resistindo…" — map: arrow from Asunción east into the Cordillera
  { t0: 380.22, L: () => samap("n64", MAPS.blood, { towns: ["asu", "cc"] }), cam: mv([SX(-57), SY(-24.6), -18, 40], [SX(-56.6), SY(-24), -14, 38]), lite: DAY, act: (A, lt, u, T) => {
      hlS(A, "PAR", 1, "#5a1a14", 0.35); pinS(A, "asu", 1, "x", "#1f7a3a"); arrowS(A, [-57.5, -25.3], [-57.0, -25.4], k01(T, 381.5, 382.3), "#d52b1e", 0.16, 0.2); arrowS(A, [-57.0, -25.3], [-56.1, -22.9], k01(T, 382.8, 384.6), "#d52b1e", 0.16, 0.15);
    } },
  // 64b "…no interior do Paraguai." — López and a small band march through the hills
  { t0: 384.0, L: () => loc(["#5a7aa0", "#dcd4b8"], { near: "#5a6a38", far: "#7a8650", kind: "grass", seed: 133, zFar: 300 }, [
      clouds("o64", 240, ["#ffffff", "#9aacc0"], 92, 40, 110, 14, 3), hillL("o64", 120, "#5a7a5a", 25, 16, 2), forest("o64", 40, "oak", "#3e5a34", 16, 70, { blur: 1.4, h: 11 })]),
    cam: mv([-3, 2, -8, 42], [1, 2.2, -7, 40]), lite: DAY, act: (A, lt) => {
      walkS(A, LOPEZ_F, 1, lt, -3, 3.4, 1.1, { expr: "stern" }); for (let i = 0; i < 5; i++) walkS(A, tone(i % 2 ? PYK : PY, i + 620), 940 + i, lt, -4.6 - i * 1.3, 3.6 + (i % 2) * 1.2, 1.1, { expr: "sad" });
    } },
  // 65 "O que restava de suas forças estava cada vez mais debilitado." — old men and boys in a makeshift camp, a single gun
  { t0: 385.83, L: () => loc(["#4a5068", "#c8a888"], { near: "#4a4230", far: "#6a5c42", kind: "grass", seed: 134 }, [clouds("p65", 220, ["#d8b8a0", "#4a4c64"], 93, 30, 100, 18, 4), forest("p65", 30, "palm", "#3a4232", 12, 71, { blur: 2, h: 12 })]),
    cam: mv([0, 1.6, -5.4, 40], [0.3, 1.6, -4.4, 36]), lite: GOLD, bloom: 0.6, act: (A, lt) => {
      A.sp("gun1860", 3.2, 0, 4.4, { sc: 1, flip: true });
      A.a(v(tone(PY, 630), { hair: "#d8d4cc", moustache: "#e8e4dc", hat: "hair", jacket: "#7a4a3a" }), 950, -1.6, 2.6, { expr: "sad", crouch: 0.15, look: 0.4 });
      A.a(pykid(1, 9, true), 951, 0.4, 2.4, { expr: "nervous", look: -0.6 }); A.a(pykid(4, 9, true), 952, 1.6, 3.2, { expr: "sad", look: -0.2 });
      A.a(v(tone(PYK, 631), { hair: "#bab4aa", beard: "#d0cac0", hat: "hair" }), 953, -3.2, 3.6, { expr: "pained", crouch: 0.3 }); campfire(A, -0.6, 4.2, 0.35, 14);
    } },
  // 66 "A situação do país era desesperadora." — a burned farmstead; a mother and child stand in the ashes
  { t0: 389.96, L: () => loc(["#5a5a6a", "#c8a890"], { near: "#3a3026", far: "#5a4a38", kind: "rubble", seed: 135 }, [clouds("q66", 220, ["#c8b0a0", "#4a4a5a"], 94, 30, 100, 18, 4), forest("q66", 60, "dead", "#2a2422", 14, 72, { blur: 1.6, h: 12 })]),
    cam: mv([0, 2.4, -7, 42, -20], [0, 2.0, -5.4, 38, -10]), lite: GREY, bloom: 0.5, wx: ["ash", 120, 0.4], act: (A, lt) => {
      panel(A, 9, (w) => facade(w, -3, 6, 4.5, { wall: "#6a5a4a", floors: 1, cols: 3, roof: "gable", roofCol: "#3a2a22", win: "#141010", ruin: true, seed: 11 }));
      A.fx(8.6, (g, c) => { smokeCol(g, c, lt, 0, 1, 8.6, { h: 14, w: 2, col: [80, 76, 74], a: 0.45, seed: 6, wind: 0.3 }); embers(g, c, lt, 0, 8.6, 5, 16, 3, 5); });
      A.a(v(pyciv(1, 110), { dress: "#5a4a42", jacket: "#5a4a42" }), 960, -0.6, 3, { expr: "sad", look: 0.3 }); A.a(pykid(3, 110), 961, 0.4, 3.1, { expr: "fear", look: -0.6 }, { sc: 0.95 });
    } },
  // 67a "A população sofria com a destruição," — refugees on a red road: carts, bundles, an old woman helped along
  { t0: 392.9, L: () => loc(["#5a7aa0", "#e8d4b4"], { near: "#8a4a2e", far: "#a8603a", kind: "sand", seed: 136, zFar: 300 }, [
      clouds("r67", 240, ["#ffffff", "#a0b4c8"], 95, 40, 110, 14, 3), hillL("r67", 140, "#7a8a6a", 27, 12, 2), forest("r67", 60, "palm", "#4a6a3e", 18, 73, { blur: 1.4, h: 13 })]),
    cam: mv([4, 2.2, -9, 42], [0, 2.4, -8, 40]), lite: GOLD, act: (A, lt) => {
      A.sp("carreta", 5 - lt * 0.8, 0, 7, { sc: 0.6, flip: true });
      for (let i = 0; i < 8; i++) walkS(A, i === 5 ? pykid(i, 120) : pyciv(i, 120), 970 + i, lt, 2 + i * 1.3 - (i % 2) * 0.4, 3 + (i % 3) * 1.4, -0.8, { expr: i % 3 ? "sad" : "pained" });
      A.fx(10, (g, c) => dust(g, c, lt, 4 - lt * 0.8, 10, -1, 0.8, [200, 130, 90], 7));
    } },
  // 67b "…a fome e as doenças." — a mother gives her child the last piece of bread
  { t0: 395.6, L: () => loc(undefined, { near: "#4a3826", far: "#4a3826", kind: "wood", seed: 137 }, [wall("s67", 4, "#8a7458", { h: 3.6, wid: 8, win: 1, winCol: "#e0c890", blur: 2.4 })], true),
    cam: mv([0.4, 1.4, -3.6, 36], [0.1, 1.4, -3.0, 32]), lite: LAMP, bloom: 0.6, act: (A, lt, u, T) => {
      A.a(v(pyciv(3, 130), { dress: "#d8d0c0" }), 980, -0.5, 0.8, { expr: "sad", look: 0.8, prop: ["bread", 0], crouch: 0.2 }); A.a(pykid(2, 130), 981, 0.8, 0.9, { expr: T > 396.4 ? "smile" : "sad", look: -0.8 }, { sc: 1 });
    } },
  // 68a "Homens adultos haviam sido mortos ou estavam ausentes," — a village of women: they hoe the field, crosses on the hill behind
  { t0: 397.43, L: () => loc(["#5a80b8", "#f0dcc0"], { near: "#6a6a3a", far: "#8a8652", kind: "grass", seed: 138, zFar: 300 }, [
      clouds("t68", 240, ["#ffffff", "#a8bccc"], 96, 40, 110, 14, 3), hillL("t68", 50, "#6a7a4a", 29, 6, 1.2), forest("t68", 90, "palm", "#4a6a3e", 22, 74, { blur: 1.4, h: 13 })]),
    cam: mv([-3, 1.8, -7, 42], [1, 1.9, -6, 40]), lite: DAY, act: (A, lt) => {
      for (let i = 0; i < 12; i++) A.sp("crossW", -14 + i * 2.6, 3.4 + (i % 2) * 0.3, 50, { sc: 1.2 });
      for (let i = 0; i < 5; i++) { const h = Math.sin(lt * 3 + i * 1.7); A.a(v(pyciv(i * 2 + 1, 140), { dress: ["#efe8d8", "#e0d8c8", "#d8ccb8"][i % 3] }), 990 + i, -5 + i * 2.6, 3 + (i % 2) * 1.4, { expr: i % 2 ? "sad" : "neutral", prop: ["shovel", h > 0 ? 1 : 0], crouch: 0.3 + 0.15 * h }); }
    } },
  // 68b "…e o recrutamento passou a atingir até adolescentes e crianças…" — an officer hands rifles to boys in a line
  { t0: 400.3, L: () => loc(["#6a7a98", "#e0c8a8"], { near: "#7a5a3a", far: "#9a7650", kind: "sand", seed: 139 }, [clouds("u68", 220, ["#ffe8d0", "#6a7a98"], 97, 30, 100, 14, 4), colonial("u68", 22, 111, { blur: 1.4, ruin: true })]),
    cam: path([[0, [-1, 1.7, -6, 42]], [0.7, [1.2, 1.5, -4.2, 38]], [1, [1.6, 1.35, -3.2, 34]]]), lite: GOLD, bloom: 0.6, act: (A, lt, u, T) => {
      say(A, v(tone(PY, 640), { hat: "kepi", cap: "#1d1b1e", sword: true }), 1000, -2.6, 2.4, { expr: "stern", armB: 0.8, look: 1 }, {}, T < 403);
      for (let i = 0; i < 5; i++) A.a(pykid(i, 141, true), 1001 + i, -0.6 + i * 1.2, 2.2 + (i % 2) * 0.4, { expr: i === 3 ? "fear" : i % 2 ? "nervous" : "sad", look: -0.7 }, { sc: i % 2 ? 1.0 : 1.08 });
    } },
  // 69a "Em abril de 1869, o comando… passou para o Conde d'Eu," — the Count arrives; officers salute
  { t0: 406.67, L: () => loc(["#4a7ab8", "#ecdcc0"], { near: "#7a6a44", far: "#9a8858", kind: "grass", seed: 140 }, [clouds("v69", 240, ["#ffffff", "#a0b4c8"], 98, 40, 110, 14, 3), colonial("v69", 34, 121, { blur: 1.2 })]),
    cam: path([[0, [0, 1.9, -7, 42]], [0.65, [0, 1.8, -5.4, 38]], [1, [0.1, 1.64, -3.6, 32]]]), lite: DAY, act: (A, lt, u, T) => {
      A.a(CONDE, 1010, 0, 1.4, { expr: "stern", look: 0.2 });
      for (let i = 0; i < 4; i++) A.a(tone(BR, i + 650), 1011 + i, (i < 2 ? -1 : 1) * (2 + (i % 2) * 1.5), 3 + (i % 2), { expr: "stern", armB: 1, look: i < 2 ? 0.6 : -0.6 });
      flag(A, "imp", -3, 3.8, 5, 1.6, 1.0, { wind: 0.9 });
      A.over((g) => caption(g, "ABRIL DE 1869", T - 407.0, 2.4)); if (T > 412.1) A.over((g) => caption(g, "CONDE D'EU · GENRO DE DOM PEDRO II", T - 412.2, 1.7));
    } },
  // 70 "A perseguição a Solano López continuou." — soldiers hurry along a jungle trail, camera tracking backwards
  { t0: 414.97, L: () => loc(["#3a5a4a", "#a8c0a0"], { near: "#3a4a2a", far: "#4a5a36", kind: "grass", seed: 141 }, [forest("w70", 8, "palm", "#2a4a2a", 8, 75, { blur: 2.2, h: 12, wid: 1.4 }), forest("w70b", 20, "oak", "#2a4024", 16, 76, { blur: 1.6, h: 11 })]),
    cam: mv([0, 1.6, -5, 42], [0, 1.6, -3.6, 40]), lite: { ...DAY, key: "#c0e0b0", ka: 0.15 }, act: (A, lt) => {
      for (let i = 0; i < 6; i++) { const z = 9 - lt * 2.2 + Math.floor(i / 2) * 1.6, x = (i % 2 ? 0.7 : -0.7); if (z > 1) A.a(tone(i % 3 ? BR : BRV, i + 660), 1020 + i, x, z, { mode: "march", phase: (lt * 2.2 / 1.5 + i * 0.5) % 1, expr: "stern" }); }
    } },
  // 71a "Em agosto daquele ano, aconteceu a Batalha de Acosta Ñu…" — the open campo, tall grass, a smoke wall from grass fires
  { t0: 417.88, L: () => loc(["#6a6a7e", "#e0b890"], { near: "#8a7a42", far: "#a89a5a", kind: "grass", seed: 142, zFar: 400 }, [
      clouds("x71", 260, ["#f0c8a0", "#5a5a70"], 99, 30, 110, 18, 4), hillL("x71", 180, "#7a7a6a", 31, 10, 2.5), field("x71", 14, "wheat", "#c8a860", 25, 1.4, 40, 0.6)]),
    cam: mv([-6, 2.2, -10, 44], [4, 2.4, -9, 42]), lite: GOLD, bloom: 0.7, act: (A, lt, u, T) => {
      A.fx(40, (g, c) => { for (let i = 0; i < 8; i++) { smokeCol(g, c, lt, -28 + i * 8, 0, 40 + (i % 2) * 6, { h: 26, w: 5, col: [90, 80, 76], a: 0.55, seed: i + 3, wind: 0.6 }); fire(g, c, lt, -28 + i * 8, 0, 40 + (i % 2) * 6, 1.6, i); } });
      A.over((g) => caption(g, "AGOSTO DE 1869", T - 418.1, 2.4)); A.over((g) => bigText(g, "ACOSTA ÑU", T - 420.7, 2.5, VH * 0.2, 96, "#f6efe0", T > 422.6 ? "Campo Grande" : undefined));
    } },
  // 72a "Foi um dos episódios mais trágicos da guerra," — kneeling boys behind the grass, too-big rifles, smoke beyond
  { t0: 424.21, L: () => loc(["#6a6072", "#d0a080"], { near: "#7a6a3a", far: "#9a8a52", kind: "grass", seed: 143 }, [clouds("y72", 220, ["#e0a888", "#5a5068"], 100, 30, 100, 18, 4), field("y72", 3.4, "wheat", "#b89a52", 27, 1.0, 20, 0)]),
    cam: mv([-1, 1.2, -4, 40], [0.5, 1.2, -3.2, 36]), lite: { ...GOLD, key: "#ffc8a0", ka: 0.15 }, bloom: 0.7, wx: ["ash", 100, 0.35], act: (A, lt) => {
      A.fx(30, (g, c) => smokeCol(g, c, lt, 0, 0, 30, { h: 30, w: 10, col: [100, 86, 80], a: 0.6, seed: 9, wind: 0.6 }));
      for (let i = 0; i < 4; i++) A.a(pykid(i + 1, 150, true), 1030 + i, -2.4 + i * 1.6, 3.6 + (i % 2) * 0.6, { expr: i % 2 ? "fear" : "nervous", look: 0.6, crouch: 0.4 });
    } },
  // 72b "…numerosos combatentes muito jovens nas forças paraguaias." — close on one boy's face, breath shaking
  { t0: 428.6, L: () => loc(["#5a5868", "#c89878"], { near: "#6a5a32", far: "#8a7a4a", kind: "grass", seed: 144 }, [clouds("z72", 200, ["#d8a080", "#4a4860"], 101, 30, 90, 16, 5), field("z72", 3, "wheat", "#a88a48", 29, 0.9, 20, 1.5)]),
    cam: mv([0.3, 1.2, -3.4, 34], [0.05, 1.2, -2.8, 30]), lite: GOLD, bloom: 0.6, wx: ["ash", 80, 0.3], act: (A, lt, u, T) => {
      A.a(pykid(6, 160, true), 1040, 0, 0.6, { expr: T > 430.3 ? "fear" : "sad", look: 0.5 + 0.2 * Math.sin(lt * 3), headTilt: 2 * Math.sin(lt * 11) });
    } },
  // 73 "O Paraguai já não tinha condições de enfrentar seus inimigos em igualdade…" — camera pans from one old gun to a long allied gun line
  { t0: 432.58, L: () => loc(["#5a7aa8", "#e8d4b4"], { near: "#6a6a3c", far: "#8a8652", kind: "grass", seed: 145, zFar: 300 }, [clouds("aa73", 240, ["#ffffff", "#a0b4c8"], 102, 40, 110, 14, 3), hillL("aa73", 120, "#7a8a6a", 33, 8, 2)]),
    cam: path([[0, [-12, 1.6, -5, 42]], [0.35, [-12, 1.6, -5, 42]], [1, [6, 2.4, -10, 44]]]), lite: DAY, act: (A, lt) => {
      A.sp("gun1860", -12, 0, 2.6, { sc: 1 }); A.a(pykid(2, 170, true), 1050, -13.6, 2.2, { expr: "nervous", look: 0.8 }); A.a(v(tone(PY, 670), { hair: "#d8d4cc", hat: "hair" }), 1051, -10.4, 2.4, { expr: "sad", look: -0.4 });
      for (let i = 0; i < 9; i++) { A.sp("gun1860", -2 + i * 2.6, 0, 6 + (i % 2) * 0.6, { sc: 1, flip: true }); A.a(tone(BR, i + 680), 1060 + i, -1 + i * 2.6, 6.8 + (i % 2) * 0.6, { expr: "stern", look: -0.8 }); }
    } },
  // 74 "Mas López continuava fugindo e resistindo." — night river crossing with torches, López wading at the front
  { t0: 437.74, L: () => loc(["#0a0e1a", "#1e2638"], { near: "#14161a", far: "#1a1e22", kind: "grass", seed: 146 }, [forest("bb74", 30, "palm", "#0a0e0c", 14, 77, { blur: 1.4, h: 13 }), clouds("bb74", 200, ["#2a3040", "#0a0c14"], 103, 30, 90, 18, 5)]),
    cam: mv([-2, 1.4, -6, 42], [1, 1.5, -5, 40]), lite: NIGHTFIRE, bloom: 0.8, wx: ["rain", 200, 0.35], act: (A, lt) => {
      river(A, 1.2, 28, ["#0a1018", "#2a3040"], { seed: 161 });
      A.a(LOPEZ_F, 1, -2 + lt * 0.6, 2.8, { mode: "stroll", phase: (lt * 0.6) % 1, expr: "stern", look: 0.6 }, { y: -0.6 });
      for (let i = 0; i < 4; i++) A.a(tone(i % 2 ? PYK : PY, i + 690, i % 2 === 0), 1070 + i, -3.6 - i * 1.2 + lt * 0.6, 3.4 + (i % 2) * 0.8, { mode: "stroll", phase: (lt * 0.6 + i * 0.3) % 1, expr: "pained", prop: i === 1 ? ["torch", 0] : undefined }, { y: -0.6 });
      wade(A, 2.6, 0.0, "rgba(16,22,32,0.9)", 9);
      A.fx(3.6, (g, c) => { const [sx, sy, s] = P(c, -4.8 + lt * 0.6 + 0.5, 1.6, 4.2); glow(g, sx, sy, 3 * s, "rgba(255,150,60,1)", 0.5 + 0.15 * Math.sin(lt * 17)); });
    } },
  // 75 "Até que chegou o último capítulo dessa história." — Cerro Corá's hills in dawn mist; chapter card
  { t0: 441.23, L: () => loc(["#3a4a6a", "#f0b890"], { near: "#3a4a2e", far: "#5a6a46", kind: "grass", seed: 147, zFar: 400 }, [
      clouds("cc75", 260, ["#ffd0b0", "#5a6a8a"], 104, 30, 110, 16, 4), mtn("cc75", 180, "#5a6a78", 35, 30, false, 3), hillL("cc75", 90, "#4a6050", 36, 14, 2), forest("cc75", 40, "oak", "#2e4430", 16, 78, { blur: 1.4, h: 11 })]),
    cam: mv([0, 2.2, -10, 42], [0, 2.6, -8, 40]), lite: BACK, bloom: 0.8, act: (A, lt, u, T) => {
      A.fx(60, (g, c) => { for (let k = 0; k < 10; k++) { const [sx, sy, s] = P(c, -40 + k * 9 + Math.sin(lt * 0.2 + k) * 3, 3, 60); puff(g, sx, sy, 8 * s, [230, 220, 214], 0.35); } });
      A.light((g) => { sun(g, VW * 0.65, VH * 0.42, 26, "255,200,150"); rays(g, VW * 0.65, VH * 0.42, VW * 0.8, 0.12, "255,190,140", 16, lt, Math.PI, Math.PI * 0.5); });
      A.over((g) => chapter(g, "1870", "CERRO CORÁ", T - 441.5, 2.4));
    } },
  // 76a "Em primeiro de março de 1870, as tropas brasileiras alcançaram Solano López…" — Brazilian troops break out of the forest at the Aquidabán stream
  { t0: 444.51, L: () => loc(["#5a7aa8", "#e8d4b4"], { near: "#4a5a32", far: "#6a7848", kind: "grass", seed: 148 }, [clouds("dd76", 240, ["#ffffff", "#a0b4c8"], 105, 40, 110, 14, 3), forest("dd76", 16, "oak", "#2e4a2c", 12, 79, { blur: 1.2, h: 11 }), forest("dd76b", 40, "palm", "#3a5a36", 16, 80, { blur: 1.8, h: 13 })]),
    cam: hand(mv([-3, 1.6, -6, 42], [1, 1.7, -5, 40]), 0.03), lite: DAY, act: (A, lt, u, T) => {
      river(A, 6, 9, ["#4a5a50", "#8a9a88"], { seed: 171 });
      for (let i = 0; i < 7; i++) runS(A, tone(i % 2 ? BRV : BR, i + 700), 1080 + i, lt, -7 - (i % 3) * 1.4, 2.6 + (i % 3) * 1.2, 2.2, { expr: "shout" });
      A.over((g) => caption(g, "1º DE MARÇO DE 1870", T - 444.8, 3.0));
    } },
  // 76b "…na região de Cerro Corá." — López in his tiny camp turns, startled
  { t0: 449.33, L: () => loc(["#5a7aa0", "#e0d0b0"], { near: "#4a5432", far: "#6a7048", kind: "grass", seed: 149 }, [clouds("ee76", 220, ["#ffffff", "#a0b0c4"], 106, 40, 100, 12, 3), mtn("ee76", 120, "#5a6a62", 37, 22, false, 2.5), forest("ee76", 30, "oak", "#2e4a2c", 12, 81, { blur: 2, h: 11 })]),
    cam: mv([0.6, 1.8, -4.6, 38], [0.2, 1.64, -3.8, 34]), lite: DAY, act: (A, lt, u, T) => {
      A.sp("tent", 3.4, 0, 5, { sc: 1 }); campfire(A, -2.2, 3.4, 0.3, 19);
      A.a(LOPEZ_F, 1, 0, 1.0, { expr: T > 450.2 ? "shock" : "stern", look: T > 450.2 ? -1 : 0.3, headTilt: T > 450.2 ? -6 : 0 });
      A.a(tone(PY, 710), 1090, 1.9, 2.6, { expr: T > 450.4 ? "fear" : "sad", look: -0.8 });
    } },
  // 77 "O confronto foi decisivo." — shots across the stream, white smoke, splashes
  { t0: 452.1, L: () => loc(["#5a6a88", "#d8c4a4"], { near: "#3e4a2c", far: "#5a6440", kind: "grass", seed: 150 }, [clouds("ff77", 220, ["#f0d8c0", "#5a6a84"], 107, 30, 100, 14, 4), forest("ff77", 14, "oak", "#2a4228", 10, 82, { blur: 1.4, h: 11 })]),
    cam: hand(mv([-2, 1.4, -5, 42], [0, 1.5, -4.4, 40]), 0.045), lite: GREY, bloom: 0.6, kicks: [[452.4, 7], [453.0, 9], [453.5, 7]], act: (A, lt, u, T) => {
      river(A, 3.6, 6.4, ["#3a4a44", "#7a8a7a"], { seed: 181 });
      for (let i = 0; i < 3; i++) A.s(tone(BR, i + 720), 1100 + i, -5 + i * 1.4, 2.6 + i * 0.5, { mode: "stand", aim: true, expr: "stern" });
      volley(A, T, 452.4, -5, -1, 2.8, 1.4, 1, 3, 81); volley(A, T, 453.2, -5, -1, 2.8, 1.4, 1, 3, 82);
      fall(A, tone(PY, 730), 1110, 4.6, 8, T, 453.0, { dir: 1 }); A.a(tone(PYK, 731), 1111, 6.2, 9, { expr: "shout", look: -0.8 });
      for (const [at, x] of [[452.6, 2], [453.3, 3.5]] as number[][]) A.fx(5, (g, c) => { const a = T - at; if (a < 0 || a > 1) return; const [sx, sy, s] = P(c, x, 0, 5); for (let k = 0; k < 8; k++) puff(g, sx + (k - 4) * 0.06 * s, sy - (a * 3 - 4.9 * a * a) * s * (0.5 + k / 10), 0.12 * s, [230, 240, 244], 0.8 * (1 - a)); });
    } },
  // 78 "Cercado pelas forças brasileiras, o presidente paraguaio foi morto durante o combate." — the circle closes; then only his kepi drifting in the stream
  { t0: 454.36, L: () => loc(["#4a5a7a", "#c8b898"], { near: "#3a4428", far: "#56603e", kind: "grass", seed: 151 }, [clouds("gg78", 220, ["#d8c8b0", "#4a5470"], 108, 30, 100, 16, 4), forest("gg78", 18, "oak", "#24381f", 12, 83, { blur: 1.8, h: 11 })]),
    cam: path([[0, [0, 2.6, -7, 42, -50]], [0.6, [0, 2.2, -5.6, 40, -40]], [0.68, [0, 0.5, -2.4, 36, -30]], [1, [0.2, 0.45, -2.0, 34, -30]]]), lite: GREY, bloom: 0.5, act: (A, lt, u, T) => {
      river(A, 0.2, 7, ["#3a4640", "#7a8a7e"], { seed: 191 });
      if (T < 457.5) { A.a(LOPEZ_F, 1, 0, 3.0, { expr: T > 456.4 ? "fear" : "stern", look: Math.sin(lt * 2), armB: 0.6 });
        for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2, r = 4.2 - 1.6 * smooth(k01(T, 454.5, 456.6)); const x = Math.sin(a) * r, z = 3.2 + Math.cos(a) * r * 0.6; if (Math.cos(a) > -0.2) A.a(tone(i % 2 ? BRV : BR, i + 740), 1120 + i, x, z, { expr: "stern", look: -Math.sign(x) * 0.8 }); } }
      else { A.fx(1.2, (g, c) => { const k = T - 457.5, [sx, sy, s] = P(c, -0.4 + k * 0.25, 0.04 + 0.02 * Math.sin(k * 3), 1.2); g.save(); g.translate(sx, sy); g.scale(1.3, 1.3); g.rotate(0.3 + 0.1 * Math.sin(k * 2)); g.fillStyle = "#2a3048"; g.strokeStyle = "#141414"; g.lineWidth = 3; g.beginPath(); g.moveTo(-0.16 * s, 0); g.lineTo(-0.14 * s, -0.16 * s); g.lineTo(0.14 * s, -0.16 * s); g.lineTo(0.16 * s, 0); g.closePath(); g.fill(); g.stroke(); g.fillStyle = "#141414"; g.fillRect(-0.2 * s, -0.02 * s, 0.22 * s, 0.04 * s); g.restore();
          for (let i = 0; i < 3; i++) { const ph = (k * 0.6 + i / 3) % 1; g.strokeStyle = `rgba(255,255,255,${0.4 * (1 - ph)})`; g.lineWidth = 2; g.beginPath(); g.ellipse(sx, sy + 2, (0.2 + ph * 0.6) * s, (0.05 + ph * 0.12) * s, 0, 0, 7); g.stroke(); } }); }
    } },
  // 79 "Com sua morte, terminou a resistência organizada do governo paraguaio." — at dusk the last flag is lowered; rifles laid on the ground
  { t0: 459.64, L: () => loc(["#2a2a4a", "#d8804a"], { near: "#3a3424", far: "#5a4c34", kind: "grass", seed: 152 }, [clouds("hh79", 240, ["#e89a6a", "#3a3456"], 109, 30, 110, 18, 4), mtn("hh79", 140, "#3a3a50", 39, 24, false, 2.5)]),
    cam: mv([0, 1.8, -6, 42], [0, 2.0, -5, 38]), lite: BACK, bloom: 0.8, act: (A, lt, u, T) => {
      flag(A, "par", 0, 4.8 - 3.8 * smooth(k01(T, 460.0, 463.0)), 4.4, 1.8, 1.2, { wind: 0.4, droop: 0.5 });
      for (let i = 0; i < 4; i++) A.a(tone(i % 2 ? PYK : PY, i + 750, T < 460.6 + i * 0.4), 1130 + i, -4 + i * 2.6 + (i > 1 ? 0.8 : 0), 3 + (i % 2) * 0.6, { expr: "sad", look: 0.2, crouch: T > 460.6 + i * 0.4 && T < 461.2 + i * 0.4 ? 0.5 : 0.1 }, { dark: 0.4, darkCol: "#2a1a2a" });
      A.light((g) => { sun(g, VW * 0.5, VH * 0.46, 28, "255,180,120"); rays(g, VW * 0.5, VH * 0.46, VW, 0.12, "255,170,120", 16, lt, Math.PI, Math.PI * 0.5); });
    } },
  // 80 "Depois de quase seis anos, a Guerra do Paraguai chegava ao fim." — sunrise on a silent battlefield by the river, birds lift, a soldier lays his rifle down
  { t0: 464.4, L: () => loc(["#4a6a9a", "#ffd0a0"], { near: "#4a5232", far: "#6a7048", kind: "grass", seed: 153, zFar: 400 }, [
      clouds("ii80", 260, ["#ffe0c0", "#6a80a8"], 110, 30, 120, 16, 3), forest("ii80", 120, "palm", "#3a4a36", 30, 84, { blur: 1.4, h: 14 })]),
    cam: mv([0, 1.4, -7, 42], [0, 2.6, -9, 42, -30]), lite: GOLD, bloom: 0.9, act: (A, lt, u, T) => {
      river(A, 18, 110, ["#6a5a4a", "#ffd0a0"], { glit: "rgba(255,220,170,1)", seed: 201 });
      A.a(tone(BRV, 760, T < 465.4), 1140, -1, 3.4, { expr: "relief", crouch: T > 465.4 && T < 466 ? 0.5 : 0.1, look: 0.4 }); A.a(tone(AR, 761, false), 1141, 1.4, 4.4, { expr: "sad", look: -0.3 });
      A.fx(40, (g, c) => birds(g, c, lt, 12, -10, 3 + lt * 2, 40, 2, "#2a2028", 23, 0.5));
      A.light((g) => { sun(g, VW * 0.5, VH * 0.44, 32, "255,214,160"); rays(g, VW * 0.5, VH * 0.44, VW, 0.14, "255,200,150", 18, lt, Math.PI, Math.PI * 0.5); lensFlare(g, VW * 0.5, VH * 0.44, 0.6); });
      A.over((g) => bigText(g, "FIM DA GUERRA", T - 466.2, 1.9, VH * 0.22, 84, "#f6efe0", "1870"));
    } },
  // 81 "Mas a vitória dos aliados havia deixado marcas profundas…" — veterans on crutches and bandages come down a gangplank in Rio
  { t0: 468.81, L: () => loc(["#4a7ab8", "#ecdcc4"], { near: "#7a6a52", far: "#9a8a6e", kind: "wood", seed: 154 }, [clouds("jj81", 240, ["#ffffff", "#a0b4c8"], 111, 40, 110, 14, 3), city("jj81", 50, { pal: ["#efe6d2", "#e2d4b8", "#d8c8a8"], seed: 61, floors: [2, 3], hgt: [8, 11], roof: "hip", roofCol: "#9a4a2e", blur: 1.6 }), mtn("jj81", 200, "#5a7a72", 41, 40, false, 2.5)]),
    cam: mv([2, 1.8, -7, 42], [-1, 1.8, -6, 40]), lite: DAY, act: (A, lt) => {
      ship(A, "steamBR2", 10, 22, { sc: 0.8 });
      for (let i = 0; i < 5; i++) walkS(A, v(tone(i % 2 ? BRV : BR, i + 770, false), { band: i % 2 ? "#f2efe6" : undefined }), 1150 + i, lt, 5 + i * 1.6, 3 + (i % 2) * 1.2, -0.55, { expr: i % 2 ? "pained" : "sad" });
      for (let i = 0; i < 3; i++) A.a(v(pyciv(i * 3, 180), { skin: undefined, dress: "#2a2424" }), 1160 + i, -5 + i * 1.6, 5, { expr: "sad", look: 0.6 });
    } },
  // 82 "O Paraguai saiu da guerra completamente transformado." — Asunción in ruins, women in black walk an empty street
  { t0: 473.6, L: () => loc(["#6a6a7a", "#c8b8a0"], { near: "#6a5a48", far: "#8a7860", kind: "cobble", seed: 155 }, [clouds("kk82", 220, ["#d0c0b0", "#5a5a6a"], 112, 30, 100, 16, 4), colonial("kk82", 24, 131, { ruin: true, blur: 1.0, tint: "#8a7a6a" })]),
    cam: mv([0, 1.8, -8, 42], [0, 1.9, -6, 38]), lite: GREY, bloom: 0.4, wx: ["dust", 80, 0.25], act: (A, lt) => {
      for (let i = 0; i < 4; i++) walkF(A, v(pyciv(i * 2 + 1, 190), { dress: "#1e1a1c", jacket: "#1e1a1c", cap: "#141214" }), 1170 + i, lt, 0, 6, [-2 + i * 1.4, 12 + i], [-2 + i * 1.4, 4 + i], { expr: "sad" });
      A.sp("cathedral", -14, 0, 36, { sc: 0.6 });
    } },
  // 83a "Sua economia estava arrasada," — the last coins drop into an empty treasury chest
  { t0: 477.28, L: () => loc(undefined, { near: "#3a2a1e", far: "#3a2a1e", kind: "wood", seed: 156 }, [wall("ll83", 4, "#5a4a3a", { h: 4, wid: 8, blur: 2.4, brick: true })], true),
    cam: mv([0, 1.0, -3.6, 38], [0, 0.8, -3.0, 34]), lite: LAMP, bloom: 0.6, act: (A, lt) => {
      A.fx(1.2, (g, c) => { const [sx, sy, s] = P(c, 0, 0.0, 1.2); g.fillStyle = "#5a3a22"; g.strokeStyle = "#1e140e"; g.lineWidth = 4; g.fillRect(sx - 0.8 * s, sy - 0.8 * s, 1.6 * s, 0.8 * s); g.strokeRect(sx - 0.8 * s, sy - 0.8 * s, 1.6 * s, 0.8 * s); g.fillStyle = "#140c08"; g.fillRect(sx - 0.7 * s, sy - 0.78 * s, 1.4 * s, 0.12 * s);
        for (let i = 0; i < 3; i++) { const k = (lt * 0.7 + i * 0.33) % 1, y = 2.2 - k * k * 2.2 * 1.0; if (y > 0.82) { const [cx, cy] = P(c, -0.2 + i * 0.2, y, 1.2); g.fillStyle = "#d6b04a"; g.beginPath(); g.ellipse(cx, cy, 0.05 * s, 0.05 * s * Math.abs(Math.cos(k * 20)) + 1, 0, 0, 7); g.fill(); g.stroke(); } } });
      A.light((g) => glow(g, VW * 0.5, VH * 0.2, VW * 0.4, "rgba(255,180,100,1)", 0.25));
    } },
  // 83b "…cidades e infraestrutura haviam sido destruídas" — a burnt rail bridge and twisted track (Paraguay had one of the continent's first railways)
  { t0: 479.55, L: () => loc(["#5a6070", "#c0a890"], { near: "#4a3c2c", far: "#6a5640", kind: "rubble", seed: 157 }, [clouds("mm83", 220, ["#d0b8a0", "#4e5464"], 113, 30, 100, 18, 4), forest("mm83", 70, "dead", "#2a2420", 16, 85, { blur: 1.4, h: 12 })]),
    cam: mv([-3, 2.0, -8, 42], [2, 2.2, -7, 40]), lite: GREY, bloom: 0.4, act: (A, lt) => {
      river(A, 6, 16, ["#4a4a40", "#8a8270"], { seed: 211 });
      A.fx(10, (g, c) => { g.strokeStyle = "#3a2a1c"; g.lineWidth = 10; for (let x = -12; x < 12; x += 3) { if (x > -2 && x < 3) continue; const [ax, ay] = P(c, x, 0, 10), [bx, by] = P(c, x + (x > 0 ? 0.4 : -0.4), 3, 10); g.beginPath(); g.moveTo(ax, ay); g.lineTo(bx, by); g.stroke(); }
        g.strokeStyle = "#5a5a5e"; g.lineWidth = 7; g.beginPath(); const [l0x, l0y] = P(c, -14, 3, 10), [l1x, l1y] = P(c, -1.6, 3, 10), [l2x, l2y] = P(c, -0.6, 1.0, 10); g.moveTo(l0x, l0y); g.lineTo(l1x, l1y); g.quadraticCurveTo(l1x + 10, l1y + 20, l2x, l2y); g.stroke(); g.beginPath(); const [r0x, r0y] = P(c, 14, 3, 10), [r1x, r1y] = P(c, 2.6, 3, 10), [r2x, r2y] = P(c, 1.4, 0.6, 10); g.moveTo(r0x, r0y); g.lineTo(r1x, r1y); g.quadraticCurveTo(r1x - 8, r1y + 30, r2x, r2y); g.stroke(); });
      A.fx(10.5, (g, c) => smokeCol(g, c, lt, 0.4, 0, 10.5, { h: 14, w: 2.4, col: [60, 56, 54], a: 0.45, seed: 8, wind: 0.4 }));
    } },
  // 83c "…e sua população sofreu perdas humanas enormes." — candles in a ruined church, women kneeling in black
  { t0: 482.48, L: () => loc(undefined, { near: "#2a201a", far: "#2a201a", kind: "stone", seed: 158 }, [wall("nn83", 8, "#5a4a40", { h: 7, wid: 12, win: 3, arch: true, winCol: "#3a4a6a", blur: 1.6 })], true),
    cam: mv([0, 1.6, -5, 40], [0, 1.4, -3.8, 36]), lite: LAMP, bloom: 0.8, act: (A, lt) => {
      for (let i = 0; i < 9; i++) A.sp("candle", -2 + (i % 5) * 1.0 + (i > 4 ? 0.5 : 0), 0, 1.6 + (i > 4 ? 0.6 : 0), { sc: 1.3 });
      A.light((g) => { const fl = 0.8 + 0.2 * Math.sin(lt * 21) * Math.sin(lt * 5); glow(g, VW * 0.5, VH * 0.75, VW * 0.5, "rgba(255,170,80,1)", 0.4 * fl); });
      for (let i = 0; i < 4; i++) A.a(v(pyciv(i * 2 + 1, 200), { dress: "#18141a", jacket: "#18141a", cap: "#100e12" }), 1180 + i, -3 + i * 2, 3.6 + (i % 2) * 0.4, { expr: "sad", crouch: 0.6, look: 0 }, { dark: 0.3, darkCol: "#2a1810" });
    } },
  // 84a "O número exato de mortos continua sendo debatido pelos historiadores," — two historians argue over documents in a library
  { t0: 486.02, L: () => loc(undefined, { near: "#4a3424", far: "#4a3424", kind: "wood", seed: 159 }, [wall("oo84", 5, "#6a4a30", { h: 5, wid: 10, blur: 1.6, frames: 0, panel: "#3a2a1a" })], true),
    cam: mv([0, 1.8, -4.6, 40], [0, 1.8, -3.8, 36]), lite: LAMP, bloom: 0.6, act: (A, lt, u, T) => {
      A.fx(4.9, (g, c) => { for (let r = 0; r < 4; r++) for (let k = 0; k < 40; k++) { const [x, y, s] = P(c, -6 + k * 0.3, 0.6 + r * 1.1, 4.9); g.fillStyle = ["#7a2a24", "#2a4a6a", "#5a6a3a", "#8a6a3a", "#3a2a4a"][(k * 7 + r * 3) % 5]; g.fillRect(x, y - 0.9 * s, 0.26 * s, (0.7 + ((k * 13) % 5) * 0.04) * s); } });
      const a = Math.floor((T - 486) / 1.3) % 2 === 0; say(A, v(pyciv(0, 210), { glasses: true, skin: undefined, hair: "#a8a49c", jacket: "#3a3a42" }), 1190, -1.2, 1.6, { expr: a ? "stern" : "neutral", prop: ["book", 0], look: 1 }, {}, a);
      say(A, v(pyciv(2, 211), { skin: undefined, beard: "#5a4a3a", jacket: "#5a4232" }), 1191, 1.2, 1.6, { expr: a ? "nervous" : "stern", prop: ["paper", 0], look: -1 }, {}, !a);
    } },
  // 84b "…mas a dimensão da tragédia é incontestável." — map: Paraguay dimmed to ash, the camera slowly withdraws
  { t0: 490.33, L: () => samap("pp84", MAPS.ember, { towns: ["asu"] }), cam: mv([SX(-58), SY(-23.5), -14, 40], [SX(-58), SY(-23.5), -30, 40]), lite: NIGHTFIRE, act: (A, lt, u, T) => {
      hlS(A, "PAR", 1, "#1a0a08", 0.65); A.fx(-0.08, (g, c) => embers(g, c, lt, SX(-58), 0.5, 8, 40, 6, 13));
    } },
  // 85 "O Brasil também pagou um preço muito alto." — a widow in Rio receives the letter at her door
  { t0: 493.5, L: () => loc(["#5a80b8", "#e8dcc8"], { near: "#8a7a62", far: "#a8987c", kind: "cobble", seed: 160 }, [clouds("qq85", 220, ["#ffffff", "#a8bccc"], 114, 40, 100, 12, 3), city("qq85", 9, { pal: ["#f0e4cc", "#e8d8b8"], seed: 71, floors: [2, 2], hgt: [7, 8], roof: "hip", roofCol: "#9a4a2e", blur: 1.4 })]),
    cam: mv([0.3, 1.64, -3.9, 36], [0.05, 1.64, -3.2, 32]), lite: DAY, act: (A, lt, u, T) => {
      A.a(v(pyciv(1, 220), { skin: undefined, dress: "#3a3442", hat: "longhair", hair: "#4a3020" }), 1200, -0.4, 0.8, { expr: T > 494.4 ? "sad" : "nervous", prop: ["letter", 0], look: 0.6 });
      A.a(tone(BR, 790, false), 1201, 1.6, 1.4, { expr: "sad", look: -0.8 });
    } },
  // 86a "A guerra consumiu enormes recursos financeiros," — ledgers and coins slide off a treasury desk
  { t0: 496.58, L: () => loc(undefined, { near: "#3a2a20", far: "#3a2a20", kind: "wood", seed: 161 }, [wall("rr86", 5, "#2e4a3a", { h: 5, wid: 10, blur: 1.8, frames: 2 })], true),
    cam: mv([0, 1.7, -4.4, 40], [0, 1.6, -3.6, 36]), lite: LAMP, bloom: 0.6, act: (A, lt) => {
      A.fx(1.4, (g, c) => coins(g, c, lt, 0, 3.0, 1.4, 50, 14, 7));
      say(A, v(pyciv(4, 230), { skin: undefined, glasses: true, jacket: "#22222a", tie: "#5a2a24" }), 1210, -1.6, 1.8, { expr: "nervous", prop: ["book", 0], look: 0.8 }, {}, true);
    } },
  // 86b "…fortaleceu politicamente o Exército" — officers parade proudly in Rio, chests out
  { t0: 499.25, L: () => loc(["#4a7ab8", "#ecdcc4"], { near: "#8a7a5a", far: "#a8946c", kind: "cobble", seed: 162 }, [clouds("ss86", 240, ["#ffffff", "#a0b4c8"], 115, 40, 110, 12, 3), city("ss86", 36, { pal: ["#efe6d2", "#d8c8a8"], seed: 81, floors: [2, 3], hgt: [8, 11], roof: "hip", roofCol: "#8a4a2e", blur: 1.2 })]),
    cam: mv([0, 1.2, -6, 42, 30], [0, 1.3, -5, 40, 30]), lite: DAY, act: (A, lt) => {
      marchF(A, (i) => v(tone(BR, i + 800), { medals: i % 3 === 0, hat: i % 2 ? "kepi" : "peaked", sword: true }), lt, 3, 4, 6, 1.0, 1.4, 1.8, 1220, () => ({ expr: "smile" }));
      flag(A, "imp", 4, 4.2, 9 - lt, 1.6, 1.0, { wind: 1 });
    } },
  // 86c "…e contribuiu para aumentar as tensões que enfraqueceriam o Império…" — an aged Pedro II alone on the throne, the light fading
  { t0: 502.58, L: () => loc(undefined, { near: "#3a1c18", far: "#4a2420", kind: "wood", seed: 163 }, [wall("tt86", 7, "#23452e", { h: 6, wid: 10, win: 2, arch: true, winCol: "#a8b0c0", curtain: "#6a5a22", blur: 1.6 })], true),
    cam: mv([0, 1.9, -6, 40], [0, 1.64, -4.2, 34]), lite: { ...LAMP, ka: 0.3, key: "#a89aa0" }, bloom: 0.6, act: (A, lt, u, T) => {
      A.sp("throne", 0, 0, 1.6, { sc: 1.1 }); A.a(OLDPEDRO, 20, 0, 0.9, { expr: "sad", look: -0.2, headTilt: -4, crouch: 0.15 });
      A.sp("crown", 1.6, 0.9, 1.0, { sc: 0.6 });
      A.light((g) => { g.fillStyle = `rgba(0,0,10,${0.45 * k01(T, 503, 507)})`; g.fillRect(0, 0, VW, VH); });
    } },
  // 87 "Argentina e Uruguai também enfrentaram consequências…" — Buenos Aires: a crowd before the cabildo, flags at half-mast
  { t0: 507.71, L: () => loc(["#5a7aa8", "#e4d4bc"], { near: "#8a7a62", far: "#a8967a", kind: "cobble", seed: 164 }, [clouds("uu87", 240, ["#f4ece0", "#8a9ab0"], 116, 30, 100, 16, 4), colonial("uu87", 30, 141, { blur: 1.0 })]),
    cam: mv([-3, 2.4, -9, 42, -20], [2, 2.4, -8, 40, -20]), lite: GREY, act: (A, lt, u, T) => {
      flag(A, "arg", -4, 3.4, 12, 2, 1.3, { wind: 0.5, droop: 0.3 }); flag(A, "uru", 4, 3.4, 12, 2, 1.3, { wind: 0.5, droop: 0.3 });
      for (let i = 0; i < 12; i++) A.a(v(pyciv(i, 240), { skin: undefined }), 1240 + i, -7 + (i % 6) * 2.6 + (i > 5 ? 1.2 : 0), 5 + (i > 5 ? 1.6 : 0), { expr: i % 3 ? "sad" : "stern", talk: i % 4 === 0 ? (Math.floor(T * 8) + i) % 4 : 0, look: 0 });
    } },
  // 88 "A Guerra do Paraguai não foi apenas uma disputa entre quatro países." — four flags side by side at sunset, tracking shot
  { t0: 513.55, L: () => loc(["#2a3058", "#ff9a5a"], { near: "#3a3226", far: "#5a4a34", kind: "grass", seed: 165 }, [clouds("vv88", 260, ["#ffb080", "#3a3a5a"], 117, 30, 110, 18, 4), hillL("vv88", 120, "#3a3448", 43, 10, 2.5)]),
    cam: mv([-2.5, 2.4, -11, 42], [1.5, 2.4, -10, 40]), lite: BACK, bloom: 0.8, act: (A, lt, u, T) => {
      ["imp", "arg", "uru", "par"].forEach((f, i) => flag(A, f, -6 + i * 3.6, 3.2, 4, 2.2, 1.4, { wind: 0.9 + i * 0.1 }));
      A.light((g) => { sun(g, VW * 0.5, VH * 0.56, 30, "255,190,130"); lensFlare(g, VW * 0.5, VH * 0.56, 0.5); });
    } },
  // 89a "Foi um conflito que mudou o equilíbrio de poder na América do Sul" — map: the four countries pulse, Brazil and Argentina rise
  { t0: 517.65, L: () => samap("ww89", MAPS.parch, { towns: ["asu", "rio", "bai", "mvd"] }), cam: mv([SX(-56), SY(-25), -60, 40], [SX(-57), SY(-26), -48, 40]), lite: DAY, act: (A, lt, u, T) => {
      hlS(A, "BRA", k01(T, 518.6, 519.2), "#1f7a3a", 0.35); hlS(A, "ARG", k01(T, 518.9, 519.5), "#4a8ad8", 0.4); hlS(A, "URU", k01(T, 519.2, 519.8), "#2a3a8a", 0.4); hlS(A, "PAR", k01(T, 519.5, 520.1), "#3a1a14", 0.55);
    } },
  // 89b "…e deixou consequências que atravessaram gerações." — grandfather veteran and grandchild by the river at evening
  { t0: 521.5, L: () => loc(["#3a3a6a", "#ffb07a"], { near: "#4a4a2e", far: "#6a6440", kind: "grass", seed: 166 }, [clouds("xx89", 240, ["#ffc090", "#4a4a7a"], 118, 30, 110, 16, 4), forest("xx89", 80, "palm", "#262a22", 22, 86, { blur: 1.4, h: 13 })]),
    cam: mv([0, 1.4, -5, 40], [0.3, 1.3, -4, 36]), lite: BACK, bloom: 0.8, act: (A, lt) => {
      river(A, 6, 78, ["#4a3a3a", "#ffb07a"], { glit: "rgba(255,200,140,1)", seed: 221 });
      A.a(v(pyciv(0, 250), { hair: "#e8e4dc", moustache: "#ecE8e0".toLowerCase(), jacket: "#5a4a3a", band: "#a3241d" }), 1260, -0.6, 2.4, { expr: "sad", look: 0.6, crouch: 0.6 }, { dark: 0.3, darkCol: "#2a1a2a" });
      A.a(pykid(4, 250), 1261, 0.6, 2.4, { expr: "smile", look: -0.6 }, { dark: 0.3, darkCol: "#2a1a2a" });
      A.light((g) => sun(g, VW * 0.75, VH * 0.5, 24, "255,190,130"));
    } },
  // 90a "E talvez a maior lição dessa história seja esta:" — close: an old Paraguayan woman looks out over the river
  { t0: 524.59, L: () => loc(["#5a7aa8", "#f0d8b8"], { near: "#5a5a3a", far: "#7a7650", kind: "grass", seed: 167 }, [clouds("yy90", 200, ["#ffffff", "#a8bccc"], 119, 30, 90, 12, 3), forest("yy90", 40, "palm", "#4a6a3e", 14, 87, { blur: 3, h: 13 })]),
    cam: mv([0.3, 1.64, -3.9, 36], [0.05, 1.64, -3.2, 32]), lite: GOLD, bloom: 0.6, act: (A, lt) => {
      A.a(v(pyciv(5, 260), { hat: "headscarf", cap: "#3a2a2a", hair: "#d0ccc4" }), 1270, 0, 0.6, { expr: "sad", look: 0.7, headTilt: -2 });
    } },
  // 90b "…guerras podem começar com decisões políticas," — a fist slams a council table, papers jump
  { t0: 527.28, L: () => loc(undefined, { near: "#3a2418", far: "#3a2418", kind: "wood", seed: 168 }, [wall("zz90", 6, "#4a2a26", { h: 5, wid: 10, frames: 3, blur: 1.6, panel: "#2a1a12" })], true),
    cam: mv([0, 1.7, -4.6, 40], [0, 1.6, -3.8, 36]), lite: LAMP, bloom: 0.6, kicks: [[528.3, 7]], act: (A, lt, u, T) => {
      A.fx(2.0, (g, c) => { const [x0, y0, s] = P(c, -3, 0.85, 2.0), [x1] = P(c, 3, 0, 2.0); g.fillStyle = "#3a2216"; g.fillRect(x0, y0, x1 - x0, 1.0 * s); for (let i = 0; i < 4; i++) { const j = T > 528.3 ? Math.max(0, Math.sin(Math.min(Math.PI, (T - 528.3) * 9))) * 0.15 : 0; const [px, py] = P(c, -2 + i * 1.3, 0.86 + j, 2.0); g.fillStyle = "#f0e8d6"; g.fillRect(px, py - 0.03 * s, 0.6 * s, 0.05 * s); } });
      say(A, v(pyciv(3, 270), { skin: undefined, jacket: "#1e1e24", tie: "#7a1a14", moustache: "#2a1d16" }), 1280, 0, 2.6, { expr: T > 528.3 ? "shout" : "stern", armB: T > 528.3 ? 1 : 0.3 }, {}, true);
      A.a(v(pyciv(6, 270), { skin: undefined, jacket: "#2a2a30" }), 1281, -2.4, 3.0, { expr: "stern", look: 0.7 }); A.a(v(pyciv(1, 271), { skin: undefined, jacket: "#30282a", hat: "hair", dress: undefined, pants: "#2a2a2a" }), 1282, 2.4, 3.0, { expr: "nervous", look: -0.7 });
    } },
  // 90c "…disputas territoriais e ambições de poder," — map: rival arrows clash over the borders
  { t0: 530.53, L: () => samap("ab90", MAPS.blood, { labels: true }), cam: mv([SX(-58), SY(-27), -40, 40], [SX(-58), SY(-27), -32, 38]), lite: DAY, act: (A, lt, u, T) => {
      arrowS(A, [-50, -20], [-56.5, -24], k01(T, 530.7, 531.5), "#1f7a3a", 0.4, 0.15); arrowS(A, [-62, -32], [-58.4, -27.4], k01(T, 530.9, 531.7), "#4a8ad8", 0.4, -0.15); arrowS(A, [-57.6, -25.3], [-54.5, -27.8], k01(T, 531.2, 532.0), "#d52b1e", 0.4, 0.2);
      for (const [lo, la, at] of [[-56.4, -24.6, 531.6], [-58.3, -27.6, 531.9], [-55.2, -27.4, 532.2]] as number[][]) A.fx(-0.09, (g, c) => { const k = T - at; if (k < 0 || k > 1.5) return; const [sx, sy, s] = P(c, SX(lo), SY(la), 0); glow(g, sx, sy, (0.5 + k) * s, "rgba(255,200,120,1)", 1 - k / 1.5); });
    } },
  // 90d "…mas quem paga o preço mais alto quase sempre é a população." — families sitting in the ruins; the camera pushes in to a mother and child
  { t0: 533.13, L: () => loc(["#5a5a6a", "#d0b498"], { near: "#4a3c2e", far: "#6a5640", kind: "rubble", seed: 169 }, [clouds("ac90", 220, ["#e0c8b0", "#4e5064"], 120, 30, 100, 16, 4), colonial("ac90", 20, 151, { ruin: true, blur: 1.4, tint: "#8a7a6a" })]),
    cam: path([[0, [0, 1.8, -8, 42]], [1, [0.3, 1.5, -3.6, 34]]]), lite: GOLD, bloom: 0.6, wx: ["dust", 60, 0.2], act: (A, lt) => {
      for (let i = 0; i < 6; i++) A.a(i % 3 === 2 ? pykid(i, 280) : pyciv(i, 280), 1290 + i, -6 + i * 2.4 + (i > 2 ? 2.4 : 0), 5 + (i % 2) * 1.2, { expr: "sad", crouch: 0.6, look: 0.2 });
      A.a(v(pyciv(1, 281), { dress: "#c8b8a0" }), 1300, -0.4, 0.9, { expr: "sad", look: 0.5, crouch: 0.2 }); A.a(pykid(2, 281), 1301, 0.6, 1.0, { expr: "sad", look: -0.6 });
    } },
  // 91 "Essa foi a Guerra do Paraguai." — a lapacho in full pink bloom on the riverbank; the title returns
  { t0: 538.71, L: () => loc(["#3a4a7a", "#ffc890"], { near: "#4a5a34", far: "#6a7448", kind: "grass", seed: 170, zFar: 300 }, [clouds("ad91", 260, ["#ffd8b0", "#5a6a9a"], 121, 30, 120, 16, 3), forest("ad91", 110, "palm", "#2e3a2e", 28, 88, { blur: 1.4, h: 14 })]),
    cam: mv([-2, 2.4, -10, 42], [0, 2.6, -9, 40]), lite: GOLD, bloom: 0.9, act: (A, lt, u, T) => {
      river(A, 8, 100, ["#5a4a4a", "#ffc890"], { glit: "rgba(255,210,160,1)", seed: 231 });
      A.sp("lapacho", -6, 0, 12, { sc: 1.1 }); A.fx(5.8, (g, c) => flutterPetals(g, c, lt));
      A.over((g) => bigText(g, "A GUERRA DO PARAGUAI", T - 539.2, 2.0, VH * 0.42, 100, "#f6efe0", "1864 – 1870"));
    } },
  // 92 "Um dos conflitos mais devastadores da história da América Latina." — crane up over the river at sunset, birds, fade
  { t0: 540.98, fade: 0.3, L: () => loc(["#2a2a5a", "#ff8a4a"], { near: "#2a2620", far: "#3a3026", kind: "grass", seed: 171, zFar: 400 }, [clouds("ae92", 280, ["#ff9a6a", "#3a2a5a"], 122, 30, 130, 22, 4), forest("ae92", 140, "palm", "#14121a", 36, 89, { blur: 1.2, h: 14 }), mtn("ae92", 260, "#2a2440", 45, 30, false, 3)]),
    cam: mv([0, 1.6, -8, 42], [0, 6, -14, 44, -60]), lite: BACK, bloom: 0.9, act: (A, lt) => {
      river(A, 4, 138, ["#3a2a3a", "#ff9a5a"], { glit: "rgba(255,170,110,1)", seed: 241 });
      graves(A, 14, -10, 10, 6, 18, 31, 1.1);
      A.fx(60, (g, c) => birds(g, c, lt, 9, -12, 10, 60, 3, "#14101a", 29, 0.7));
      A.light((g) => { sun(g, VW * 0.5, VH * 0.52, 34, "255,180,120"); rays(g, VW * 0.5, VH * 0.52, VW, 0.14, "255,160,110", 20, lt, Math.PI, Math.PI * 0.5); });
    } },
];
import type { Cam, Ctx } from "./engine";
import { flutter as FL } from "./fx";
const flutterPetals = (g: Ctx, c: Cam, t: number) => FL(g, c, t, { n: 40, x0: -8, x1: 2, z0: 4, z1: 8, top: 8, cols: ["#f07ab4", "#e0559a", "#f59ac6"], size: 0.12, fall: 0.6, wind: 0.5, seed: 4, loop: true });
