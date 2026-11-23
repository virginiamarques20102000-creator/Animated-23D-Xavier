// 220 – 331 s: invasion of Paraguay, the esteros, Tuiuti, Curupaiti, two years of war, Humaitá, disease and hunger.
import { VW, VH, P, glow, fire, smokeCol, puff, clamp, lerp, smooth, easeOut, hash, rays, sun, stamp, fall, C, mv, path, hand, walkS, runS, marchF, marchCol, crowd, ship, flag, caption, bigText, chapter, calPage, panel, v,
  blast, scorch, rubble, embers, flutter, sparks, lensFlare, glint, birds, dust, lightning, breath, loc, mtn, hillL, clouds, city, forest, wall, ruins, field, cliffs, mix, shade, DAY, GOLD, BACK, GREY, NIGHTFIRE, MOON, LAMP, COLD, NOON, RED,
  LOPEZ, CAXIAS, BR, BRV, AR, UY, PY, PYK, tone, pyciv, samap, MAPS, hlS, arrowS, pinS, SX, SY, river, battery, earthwork, abatis, volley, gunFire, funnel, ball, waterHit,
  say, wade, reeds, road, colonial, graves, campfire, haze, k01 } from "./scn";
import type { Shot } from "./scn";

export const SHOTS_3: Shot[] = [
  // 36a "Em abril de 1866, os exércitos… atravessaram o rio Paraná" — boats packed with soldiers cross, steamers towing
  { t0: 220.32, L: () => loc(["#4a72b0", "#f0dcc0"], { near: "#a88a5a", far: "#c0a070", kind: "sand", seed: 81, zFar: 300 }, [
      clouds("a36", 260, ["#ffffff", "#a4b8cc"], 51, 40, 120, 18, 3), forest("a36", 150, "palm", "#4a6a3e", 40, 41, { blur: 1.3, h: 14 }), forest("a36b", 140, "oak", "#3a5a34", 30, 42, { blur: 1.5, h: 11 })]),
    cam: mv([-8, 4.5, -24, 42, -20], [2, 4.8, -21, 40, -20]), lite: DAY, bloom: 0.55, act: (A, lt, u, T) => {
      river(A, 3, 140, ["#6a5a44", "#c0a680"], { glit: "rgba(255,240,200,1)", seed: 91 });
      for (let i = 0; i < 5; i++) { const x = -14 + i * 7 + lt * 0.9, z = 14 + (i % 3) * 9; ship(A, "chata", x, z, { sc: 1.1 }); for (let k = 0; k < 4; k++) A.a(tone([BR, AR, UY, BRV][(i + k) % 4], i * 4 + k + 230), 400 + i * 4 + k, x - 2.4 + k * 1.5, z - 0.2, { expr: k % 2 ? "nervous" : "stern" }, { y: 0.66, sc: 0.95 }); }
      for (let i = 0; i < 2; i++) { const x = -20 + i * 30 + lt * 1.4, z = 55 + i * 15; ship(A, i ? "steamBR2" : "steamBR", x, z, { vel: 1.4, sc: 0.8 }); funnel(A, x + 1.4, 8.4, z, { a: 0.6, sc: 0.8 }); }
      A.over((g) => caption(g, "ABRIL DE 1866 · RIO PARANÁ", T - 220.6, 2.6));
    } },
  // 36b "…e invadiram o Paraguai." — troops run up the riverbank into the palms, flags forward
  { t0: 227.9, L: () => loc(["#5a86c0", "#eedcc0"], { near: "#8a6a42", far: "#a88a5a", kind: "sand", seed: 82 }, [
      clouds("b36", 240, ["#ffffff", "#a8bccc"], 52, 40, 110, 14, 3), forest("b36", 40, "palm", "#4a6a3a", 18, 43, { blur: 1.6, h: 13 }), field("b36", 16, "grass", "#8a9a4a", 21, 0.9, 30, 0.5)]),
    cam: hand(mv([-2, 1.4, -6, 42], [2, 1.6, -5, 40]), 0.03), lite: DAY, act: (A, lt) => {
      for (let i = 0; i < 8; i++) runS(A, tone([BR, AR, UY][i % 3], i + 250), 420 + i, lt, -4 - (i % 4) * 1.2, 2.5 + (i % 3) * 1.4, 2.6, { expr: "shout" });
      flag(A, "imp", -6 + 3 * lt, 3.4, 3.6, 1.4, 0.9, { wind: 1.4 }); flag(A, "arg", -9 + 3 * lt, 3.4, 5.4, 1.3, 0.85, { wind: 1.3 });
      A.fx(6, (g, c) => dust(g, c, lt, -6 + 3 * lt, 6, 1, 1.2, [200, 170, 120], 6));
    } },
  // 37 "Mas descobriram que conquistar aquele território seria muito mais difícil…" — waist-deep in the esteros, reeds and mosquitoes, exhausted faces
  { t0: 230.25, L: () => loc(["#6a7a7e", "#d0ccb0"], { near: "#4a5a42", far: "#6a7a5a", kind: "grass", seed: 83, zFar: 300 }, [
      clouds("c37", 220, ["#e0dccc", "#7a8484"], 53, 30, 100, 20, 5), forest("c37", 90, "palm", "#4a5a46", 26, 44, { blur: 1.8, h: 13 }), reeds("c37", 18, "#6a7a3a", 5, 2.4, 40)]),
    cam: mv([-1, 1.6, -5, 40], [0.6, 1.5, -4.0, 36]), lite: GREY, bloom: 0.45, act: (A, lt, u, T) => {
      for (let i = 0; i < 4; i++) { const x = -2.6 + i * 1.8 + lt * 0.35, bob = 0.05 * Math.sin(lt * 2 + i); A.a(tone([BR, AR, BRV, UY][i], i + 260), 440 + i, x, 2.2 + (i % 2) * 1.6, { expr: i === 1 ? "pained" : i === 2 ? "sad" : "nervous", look: i % 2 ? -0.4 : 0.6, armB: 0.6 }, { y: -0.9 + bob }); }
      wade(A, 1.6, 0.25, "rgba(70,84,62,0.92)", 5);
      A.fx(1.0, (g, c) => { for (let i = 0; i < 26; i++) { const [sx, sy] = P(c, -2 + (i % 7) * 0.8 + Math.sin(T * 7 + i) * 0.25, 1.6 + Math.floor(i / 7) * 0.35 + Math.cos(T * 9 + i * 2) * 0.12, 2.5); g.fillStyle = "#1a1a16"; g.beginPath(); g.arc(sx, sy, 2, 0, 7); g.fill(); } });
    } },
  // 38a "O Paraguai havia preparado posições defensivas e fortificações…" — Paraguayans dig trenches and set logs, camera tracks along
  { t0: 236.17, L: () => loc(["#5a80b8", "#f0d8b0"], { near: "#8a4a2e", far: "#a8603a", kind: "mud", seed: 84 }, [
      clouds("d38", 240, ["#ffffff", "#a8b8cc"], 54, 40, 110, 14, 3), forest("d38", 60, "palm", "#4a6a3a", 22, 45, { blur: 1.5, h: 13 }), earthwork("d38", 9, "#9a5434", { h: 1.5, wid: 30, logs: true, seed: 7 })]),
    cam: mv([-6, 1.7, -5, 40], [3, 1.7, -4.4, 38]), lite: GOLD, act: (A, lt) => {
      for (let i = 0; i < 6; i++) { const dig = Math.sin(lt * 4 + i * 1.3); A.a(v(tone(PYK, i + 270, false), { jacket: mix("#a3241d", "#e4dfd0", i % 2 ? 0.0 : 0.6) }), 450 + i, -7 + i * 2.6, 3 + (i % 2) * 1.6, { expr: "stern", prop: ["shovel", dig > 0 ? 1 : 0], crouch: 0.3 + 0.2 * dig, look: 0.2 }); }
      A.fx(4.6, (g, c) => { for (let i = 0; i < 6; i++) { const ph = (lt * 0.66 + i * 0.17) % 1, [sx, sy, s] = P(c, -7 + i * 2.6 + 0.6, 0.4 + 2.2 * ph - 3 * ph * ph, 4.6 + (i % 2) * 1.6); g.fillStyle = "#7a3e22"; g.beginPath(); g.arc(sx, sy, 0.07 * s, 0, 7); g.fill(); } });
    } },
  // 38b "…para impedir o avanço inimigo." — from inside an embrasure: cannon muzzle, sharpened stakes, the empty field beyond
  { t0: 239.55, L: () => loc(["#6a8aa8", "#e8dcc0"], { near: "#6a5a3a", far: "#9a8a5a", kind: "grass", seed: 85, zFar: 300 }, [
      clouds("e38", 240, ["#ffffff", "#a8bccc"], 55, 30, 100, 14, 3), forest("e38", 120, "palm", "#5a6a48", 34, 46, { blur: 1.4, h: 13 }), abatis("e38", 12, "#6a4a2c", 9, 26)]),
    cam: mv([-0.6, 1.3, -3.0, 44], [0.2, 1.35, -2.4, 40]), lite: DAY, act: (A, lt) => {
      A.sp("gun1860", -0.3, 0, 0.9, { sc: 1.2 });
      A.fx(0.4, (g, c) => { const [x0, y0] = P(c, -4, 0, 0.4), [x1, y1] = P(c, 4, 2.6, 0.4), [hx0] = P(c, -1.6, 0, 0.4), [hx1] = P(c, 1.6, 0, 0.4), [, hy] = P(c, 0, 0.8, 0.4), [, ty] = P(c, 0, 2.1, 0.4);
        g.fillStyle = "#3a2a1c"; g.beginPath(); g.rect(x0, y1, x1 - x0, y0 - y1); g.rect(hx1, hy, hx0 - hx1, ty - hy); g.fill("evenodd"); });
      A.a(tone(PY, 280), 460, 2.2, 1.6, { expr: "stern", look: -0.3 }, { dark: 0.25, darkCol: "#1a1210" });
    } },
  // 39a "Uma das maiores batalhas aconteceu em 24 de maio de 1866:" — Tuiuti camp at dawn: tents, cooking fires, men at ease
  { t0: 242.86, L: () => loc(["#3a4a7a", "#f8c48a"], { near: "#6a6a3e", far: "#8a8a56", kind: "grass", seed: 86, zFar: 300 }, [
      clouds("f39", 260, ["#ffd0a0", "#5a6a90"], 56, 30, 110, 18, 4), reeds("f39", 70, "#7a7a4a", 13, 2.4, 80), forest("f39", 100, "palm", "#3e4e3a", 30, 47, { blur: 1.4, h: 13 })]),
    cam: mv([-5, 2.4, -9, 42, -20], [2, 2.2, -7.5, 40, -20]), lite: GOLD, bloom: 0.7, act: (A, lt, u, T) => {
      for (let i = 0; i < 7; i++) A.sp("tent", -12 + i * 4.2, 0, 12 + (i % 2) * 3, { sc: 1 });
      campfire(A, -1.5, 4.2, 0.5, 3); campfire(A, 4.5, 7, 0.45, 4);
      A.a(tone(BRV, 290, false), 470, -2.6, 3.6, { expr: "smile", look: 0.6, crouch: 0.5 }); say(A, tone(AR, 30, false), 471, -0.4, 3.8, { expr: "grin", look: -0.6 }, {}, true); A.a(tone(UY, 31), 472, 3.4, 5.8, { expr: "neutral", look: -0.3 });
      walkS(A, tone(BR, 291), 473, lt, -8, 7.5, 1.2, { expr: "neutral" });
      A.light((g) => { sun(g, VW * 0.15, VH * 0.38, 26, "255,214,160"); lensFlare(g, VW * 0.15, VH * 0.38, 0.5); });
      A.over((g) => caption(g, "24 DE MAIO DE 1866", T - 244.9, 3.0));
    } },
  // 39b "…a Batalha de Tuiuti." — a signal rocket, then the first shells crash into the camp
  { t0: 248.3, L: () => loc(["#4a5a80", "#f0b884"], { near: "#5a5a36", far: "#7a7a4e", kind: "grass", seed: 87, zFar: 300 }, [
      clouds("g39", 260, ["#ffc090", "#4a5070"], 57, 30, 110, 20, 4), forest("g39", 70, "palm", "#2e3a2a", 24, 48, { blur: 1.2, h: 13 })]),
    cam: hand(mv([0, 1.8, -8, 44], [0, 2.4, -10, 44, -10]), 0.05), lite: GOLD, bloom: 0.8, kicks: [[249.0, 10], [249.7, 14], [250.3, 10]], act: (A, lt, u, T) => {
      A.fx(60, (g, c) => { const k = T - 248.4; if (k < 0 || k > 1.6) return; const [sx, sy, s] = P(c, -6 + k * 2, 2 + k * 22, 60); glow(g, sx, sy, 1.4 * s, "rgba(255,90,60,1)", 1); for (let i = 1; i < 10; i++) { const [px, py] = P(c, -6 + (k - i * 0.04) * 2, 2 + Math.max(0, k - i * 0.04) * 22, 60); puff(g, px, py, 0.4 * s, [220, 210, 200], 0.4 * (1 - i / 10)); } });
      for (const [at, x, z, s] of [[249.0, -4, 14, 2.4], [249.7, 5, 10, 2.8], [250.3, -9, 18, 2.2]] as number[][]) { A.fx(z, (g, c) => { blast(g, c, T - at, x, 0, z, s, x * 5 + 2); scorch(g, c, x, z, s * 1.2, clamp((T - at) * 2) * 0.6); }); A.sp("tent", x + 1, 0, z + 1, { sc: 1, rot: T > at ? Math.min(1.2, (T - at) * 3) : 0 }); }
      for (let i = 0; i < 4; i++) runS(A, tone([BR, AR, UY, BRV][i], i + 300), 480 + i, lt, 3 - i * 1.6, 3 + i, -2.8, { expr: "shock" });
      A.over((g) => bigText(g, "BATALHA DE TUIUTI", T - 249.0, 2.2, VH * 0.2, 90));
    } },
  // 40 "Milhares de soldados se enfrentaram em um combate brutal." — two lines collide in smoke, men fall
  { t0: 250.97, L: () => loc(["#6a6a7a", "#d8b898"], { near: "#5a5432", far: "#7a7048", kind: "grass", seed: 88, zFar: 300 }, [
      clouds("h40", 240, ["#e8c8b0", "#5a5a6a"], 58, 30, 100, 20, 5), forest("h40", 80, "palm", "#4a5040", 22, 49, { blur: 2, h: 13 })]),
    cam: hand(mv([-3, 1.5, -7, 44], [2, 1.6, -6, 40]), 0.045), lite: GREY, bloom: 0.6, kicks: [[251.6, 8], [252.4, 12], [253.4, 9]], act: (A, lt, u, T) => {
      haze(A, 14, [200, 196, 190], 0.4, 3);
      for (let i = 0; i < 6; i++) { if (i === 2) fall(A, tone(PY, i + 310), 490 + i, 0.8, 3.4, T, 252.4, { dir: 1, run: 2.4 }); else runS(A, tone(PY, i + 310), 490 + i, lt, -6 - (i % 3) * 1.3, 2.4 + (i % 3) * 1.3 + Math.floor(i / 3) * 0.6, 2.4, { expr: "shout" }); }
      for (let i = 0; i < 6; i++) { if (i === 4) fall(A, tone(BR, i + 320), 500 + i, 3.2, 4.2, T, 253.4, { dir: -1, blast: true, run: -2.4 }); else runS(A, tone([BR, AR, UY][i % 3], i + 320), 500 + i, lt, 7 + (i % 3) * 1.3, 2.6 + (i % 3) * 1.3 + Math.floor(i / 3) * 0.7, -2.4, { expr: "shout" }); }
      A.fx(4.6, (g, c) => blast(g, c, T - 253.4, 3, 0, 4.6, 1.8, 61)); volley(A, T, 251.6, 3, 9, 7, 1.4, -1, 6, 5);
    } },
  // 41a "Os paraguaios tentaram surpreender as tropas aliadas com um grande ataque," — they burst from the swamp forest, bayonets forward
  { t0: 255.14, L: () => loc(["#5a7aa0", "#e8d0a8"], { near: "#5a6a3a", far: "#7a8a52", kind: "grass", seed: 89 }, [
      clouds("i41", 240, ["#fff0d8", "#8094a8"], 59, 30, 100, 16, 4), forest("i41", 14, "palm", "#3a5a34", 12, 50, { blur: 0.8, h: 12, wid: 1.6 }), reeds("i41", 11, "#7a8a42", 15, 1.8, 30)]),
    cam: mv([0, 1.3, -6, 44], [0, 1.4, -4.2, 40]), lite: DAY, bloom: 0.5, act: (A, lt) => {
      for (let i = 0; i < 10; i++) { const z = 10 - lt * 2.6 + (i % 3) * 0.8, x = -6 + (i % 5) * 3 + (Math.floor(i / 5)) * 1.5; if (z < 1) continue; A.a(tone(i % 3 ? PY : PYK, i + 330), 520 + i, x, z, { mode: "march", phase: (lt * 2.6 / 1.5 + i * 0.3) % 1, expr: "shout", talk: (Math.floor(lt * 8) + i) % 4 + 1 }); }
      flag(A, "par", 0.5, 3.4, Math.max(2, 10.5 - lt * 2.6), 1.5, 1.0, { wind: 1.4 });
    } },
  // 41b "…mas foram derrotados." — an allied gun line fires down the rank; the charge breaks
  { t0: 258.7, L: () => loc(["#4a5a7a", "#d8b090"], { near: "#5a5a36", far: "#76724a", kind: "grass", seed: 90, zFar: 300 }, [
      clouds("j41", 240, ["#e0b898", "#4a5068"], 60, 30, 100, 18, 4), forest("j41", 90, "palm", "#3a4232", 24, 51, { blur: 1.4, h: 13 })]),
    cam: hand(mv([-7, 1.6, -5, 44], [-3, 1.7, -4.4, 40]), 0.04), lite: GREY, bloom: 0.6, kicks: [[258.8, 8], [259.2, 8], [259.6, 8], [260.0, 8]], act: (A, lt, u, T) => {
      for (let i = 0; i < 4; i++) { gunFire(A, -7 + i * 2.6, 2 + i * 1.6, T, 258.8 + i * 0.4, 1, 1); A.a(tone(BR, i + 340), 540 + i, -8.3 + i * 2.6, 2.6 + i * 1.6, { expr: "stern", look: 0.8 }); }
      for (let i = 0; i < 4; i++) fall(A, tone(PY, i + 350), 550 + i, 5 + i * 1.5, 6 + i * 1.2, T, 259.3 + i * 0.4, { dir: 1, run: -2.2, blast: i % 2 === 0 });
      for (let i = 0; i < 4; i++) A.fx(6 + i * 1.2, (g, c) => blast(g, c, T - 259.3 - i * 0.4, 5.6 + i * 1.5, 0, 6.2 + i * 1.2, 1.4, 70 + i));
    } },
  // 42 "Foi uma das batalhas mais sangrentas da história sul-americana." — aftermath under a red sky: smoke, fallen men, crows, one soldier kneels
  { t0: 261.32, L: () => loc(["#2a1a26", "#d0502e"], { near: "#3a2a20", far: "#5a3a28", kind: "grass", seed: 91, zFar: 300 }, [
      clouds("k42", 260, ["#e07040", "#2a1a2a"], 61, 30, 110, 22, 4), forest("k42", 90, "dead", "#1e1416", 18, 52, { blur: 1.4, h: 13 })]),
    cam: mv([0, 1.3, -6, 42], [0, 3.6, -9, 42, -60]), lite: { ...BACK, rim: "#ff8a5a" }, bloom: 0.8, grade: ["#ff6a40", 0.2], act: (A, lt) => {
      for (let i = 0; i < 9; i++) A.a(tone(i % 2 ? PY : [BR, AR, UY][i % 3], i + 360), 560 + i, -10 + i * 2.5 + hash(i) * 1.2, 4 + (i % 4) * 3, { expr: "dazed", armB: 1 }, { rot: (i % 2 ? 1 : -1) * Math.PI / 2, y: 0.06, noCast: true, dark: 0.35, darkCol: "#2a1010" });
      A.a(tone(BRV, 370), 570, 0.6, 3.0, { expr: "sad", crouch: 0.7, look: 0.4 }, { dark: 0.4, darkCol: "#2a1018" });
      A.fx(30, (g, c) => { smokeCol(g, c, lt, -12, 0, 30, { h: 30, w: 6, col: [40, 30, 30], a: 0.6, seed: 2, wind: 0.5 }); smokeCol(g, c, lt, 14, 0, 40, { h: 36, w: 6, col: [40, 30, 30], a: 0.6, seed: 3, wind: 0.5 }); birds(g, c, lt, 6, -8, 9, 30, 1.5, "#0e0a0e", 11, 0.7); });
      A.light((g) => sun(g, VW * 0.3, VH * 0.48, 30, "255,140,90"));
    } },
  // 43 "Mesmo assim, os aliados não conseguiram avançar rapidamente." — soldiers heave a cannon stuck in the mud, rain
  { t0: 265.51, L: () => loc(["#4a5260", "#8a929a"], { near: "#3e3024", far: "#5a4a38", kind: "mud", seed: 92 }, [
      clouds("l43", 220, ["#9aa0a8", "#3a4048"], 62, 20, 90, 24, 5), forest("l43", 60, "palm", "#3a4440", 20, 53, { blur: 2, h: 13 })]),
    cam: mv([-2, 1.4, -5.6, 42], [0.5, 1.5, -4.6, 38]), lite: GREY, bloom: 0.4, wx: ["rain", 320, 0.55], act: (A, lt) => {
      const jerk = 0.08 * Math.max(0, Math.sin(lt * 2.4)); A.sp("gun1860", 0.6 + jerk, -0.25, 3.2, { sc: 1.2, rot: -0.06 });
      for (let i = 0; i < 3; i++) A.s(tone([BRV, AR, BR][i], i + 380), 580 + i, -1.6 - i * 1.0, 3.0 + i * 0.3, { mode: "push", pose: 0.6 + 0.4 * Math.sin(lt * 2.4 - i * 0.4), expr: "pained" });
      A.a(tone(UY, 381), 584, 3.2, 3.6, { expr: "sad", look: -0.6, armB: 0.8 });
      A.fx(3.4, (g, c) => { for (let k = 0; k < 6; k++) { const ph = (lt * 1.6 + k / 6) % 1, [sx, sy, s] = P(c, 0.4 + (k - 3) * 0.3, 0.1 + ph * 0.5, 3.4); g.fillStyle = `rgba(60,44,30,${0.8 * (1 - ph)})`; g.beginPath(); g.arc(sx, sy, 0.05 * s, 0, 7); g.fill(); } });
    } },
  // 44 "Outra posição defensiva importante era Curupaiti." — earthworks atop the river bluff, flag, distant view
  { t0: 270.07, L: () => loc(["#5a7aa8", "#e8d8b8"], { near: "#5a6a3a", far: "#8a8a5a", kind: "grass", seed: 93, zFar: 400 }, [
      clouds("m44", 260, ["#ffffff", "#9ab0c8"], 63, 40, 120, 16, 3), cliffs("m44", 80, "#a07a52", "#4a6a3a", 21, 10, 1.4), earthwork("m44", 78, "#8a5a3a", { h: 2.4, wid: 70, emb: 14, blur: 1.2, seed: 5 }), reeds("m44", 22, "#7a8a46", 17, 1.8, 40)]),
    cam: mv([-6, 2.2, -12, 40], [0, 2.4, -10, 36]), lite: DAY, act: (A, lt, u, T) => {
      flag(A, "par", 4, 15.6, 77, 3, 2, { wind: 1.1 });
      A.fx(77, (g, c) => { for (let i = 0; i < 6; i++) { const [sx, sy, s] = P(c, -20 + i * 8, 12.6, 77); glow(g, sx, sy, 0.4 * s, "rgba(255,230,180,1)", 0.15 + 0.15 * Math.sin(T * 3 + i)); } });
      A.over((g) => bigText(g, "CURUPAITI", T - 272.3, 1.7, VH * 0.2, 96));
    } },
  // 45a "Em setembro de 1866, as tropas aliadas…" — ironclads bombard from the river
  { t0: 273.91, L: () => loc(["#5a6a8a", "#e0c8a8"], { near: "#5a5a40", far: "#7a7656", kind: "grass", seed: 94, zFar: 300 }, [
      clouds("n45", 240, ["#f0d8c0", "#5a6a84"], 64, 30, 110, 18, 4), cliffs("n45", 120, "#9a7a5a", "#4a6a3a", 23, 12, 1.4)]),
    cam: mv([-10, 3.4, -26, 42, -15], [-2, 3.6, -22, 40, -15]), lite: GREY, bloom: 0.6, kicks: [[275.2, 6], [276.4, 6], [277.6, 6]], act: (A, lt, u, T) => {
      river(A, 3, 110, ["#4a4a40", "#9a9078"], { seed: 101 });
      for (let i = 0; i < 3; i++) { const x = -14 + i * 13, z = 30 + i * 8; ship(A, "ironclad", x, z, { sc: 0.9, guns: [[T - 275.2 - i * 0.6, 4, 2.8], [T - 276.8 - i * 0.6, -3, 2.8]] }); funnel(A, x + 1.0, 7.6, z, { a: 0.6, sc: 0.9 }); }
      for (let i = 0; i < 4; i++) A.fx(119, (g, c) => blast(g, c, T - 275.8 - i * 0.6, -20 + i * 12, 12, 119, 5, 80 + i, { debris: 20 }));
      A.over((g) => caption(g, "SETEMBRO DE 1866", T - 274.2, 2.6));
    } },
  // 45b "…tentaram atacar as fortificações paraguaias." — infantry columns form up and step off, flags dipped forward
  { t0: 277.67, L: () => loc(["#5a7298", "#e4d0b0"], { near: "#5a6a38", far: "#7a8a50", kind: "grass", seed: 95, zFar: 300 }, [
      clouds("o45", 240, ["#ffffff", "#9aacc4"], 65, 30, 110, 16, 4), earthwork("o45", 70, "#8a5a3a", { h: 2.6, wid: 60, emb: 12, blur: 1.6, seed: 9 })]),
    cam: mv([0, 2.0, -5, 44], [0, 2.2, -7, 44, -10]), lite: DAY, act: (A, lt) => {
      marchF(A, (i) => tone(i % 2 ? AR : BR, i + 390), lt, 3, 7, 3, -1.6, 1.25, 1.6, 600, () => ({ expr: "stern" }));
      flag(A, "imp", -3, 3.4, 4 + lt * 1.6, 1.4, 0.9, { wind: 1.2 }); flag(A, "arg", 3, 3.4, 4 + lt * 1.6, 1.4, 0.9, { wind: 1.2 });
    } },
  // 46 "O resultado foi desastroso." — behind the parapet: Paraguayan guns fire canister in turn, officer shouting
  { t0: 280.91, L: () => loc(["#6a7a90", "#e0c8a8"], { near: "#7a4a2e", far: "#9a5a38", kind: "mud", seed: 96 }, [
      clouds("p46", 220, ["#ffe8d0", "#6a7488"], 66, 30, 100, 14, 4), earthwork("p46", 3.6, "#9a5434", { h: 1.3, wid: 20, logs: true, seed: 3 })]),
    cam: hand(mv([-3, 1.9, -4.5, 44], [1, 1.9, -3.6, 40]), 0.04), lite: DAY, bloom: 0.6, kicks: [[281.1, 9], [281.6, 9], [282.1, 9], [282.6, 9]], act: (A, lt, u, T) => {
      for (let i = 0; i < 4; i++) { gunFire(A, -5 + i * 3.2, 2.8, T, 281.1 + i * 0.5, 1, 1); A.a(tone(PY, i + 400), 610 + i, -6.3 + i * 3.2, 2.4, { expr: "stern", look: 0.8 }); }
      say(A, v(tone(PY, 410), { hat: "kepi", cap: "#1d1b1e", medals: true, sword: true }), 615, 1.2, 1.2, { expr: "shout", armB: 1, look: 1 }, {}, true);
    } },
  // 47a "Os soldados avançaram sob intenso fogo inimigo," — allied lines cross open marsh, the far parapet erupts in smoke, men drop
  { t0: 283.67, L: () => loc(["#5a6a80", "#d8c0a0"], { near: "#4e5a34", far: "#6e7a4a", kind: "grass", seed: 97, zFar: 300 }, [
      clouds("q47", 240, ["#e8d0b8", "#5a6478"], 67, 30, 100, 18, 4), earthwork("q47", 40, "#7a4a2e", { h: 2.2, wid: 40, emb: 10, blur: 1.0, seed: 11 }), reeds("q47", 30, "#6a7a3a", 19, 1.0, 40)]),
    cam: hand(mv([-2, 1.4, -6, 44], [-1, 1.5, -4.4, 40]), 0.04), lite: GREY, bloom: 0.6, kicks: [[284.9, 6], [285.6, 8]], act: (A, lt, u, T) => {
      volley(A, T, 284.6, -14, 14, 39, 2.0, -1, 14, 21); volley(A, T, 285.6, -14, 14, 39, 2.0, -1, 14, 22);
      for (let i = 0; i < 9; i++) { const x = -6 + (i % 5) * 3 + Math.floor(i / 5) * 1.4, z0 = 6 + Math.floor(i / 5) * 2; const hit = [1, 4, 7].includes(i) ? 284.9 + i * 0.15 : 0;
        if (hit) fall(A, tone([BR, AR, UY][i % 3], i + 420), 630 + i, x, z0 + 1.2, T, hit, { dir: -1 }); else A.a(tone([BR, AR, UY, BRV][i % 4], i + 420), 630 + i, x, z0 + lt * 1.3, { mode: "march", phase: (lt * 1.3 / 1.5 + i * 0.3) % 1, expr: i % 2 ? "fear" : "shout" }); }
      for (let i = 0; i < 3; i++) A.fx(10 + i * 4, (g, c) => blast(g, c, T - 285.0 - i * 0.7, -4 + i * 5, 0, 10 + i * 4, 1.6, 90 + i));
    } },
  // 47b "…enfrentando trincheiras e obstáculos em terreno difícil." — soldiers tangled in the abatis, a ladder against the ditch
  { t0: 286.9, L: () => loc(["#6a7488", "#d8c4a8"], { near: "#4a3a26", far: "#6a5236", kind: "mud", seed: 98 }, [
      clouds("r47", 220, ["#e0ccb8", "#5a6478"], 68, 30, 100, 16, 4), earthwork("r47", 9, "#7a4a2e", { h: 2.6, wid: 24, emb: 4, seed: 13 }), abatis("r47", 5, "#5a3e24", 17, 18)]),
    cam: hand(mv([1.5, 1.5, -4.6, 42], [-0.5, 1.6, -3.8, 38]), 0.035), lite: GREY, bloom: 0.5, kicks: [[288.2, 6]], act: (A, lt, u, T) => {
      A.fx(7.5, (g, c) => { const [ax, ay, s] = P(c, -1.8, 0, 7.5), [bx, by] = P(c, -1.0, 2.8, 8.6); g.strokeStyle = "#6a4a2c"; g.lineWidth = 0.08 * s; for (const o of [0, 0.5]) { g.beginPath(); g.moveTo(ax + o * s, ay); g.lineTo(bx + o * s, by); g.stroke(); } for (let k = 1; k < 7; k++) { const t = k / 7; g.beginPath(); g.moveTo(lerp(ax, bx, t), lerp(ay, by, t)); g.lineTo(lerp(ax, bx, t) + 0.5 * s, lerp(ay, by, t)); g.stroke(); } });
      A.a(tone(BR, 430), 650, -1.4, 7.2, { expr: "pained", armB: 1, crouch: 0.2 }, { y: 0.9 + 0.1 * Math.sin(lt * 3) });
      A.a(tone(AR, 431), 651, 1.2, 4.6, { expr: "fear", armB: 0.8, crouch: 0.4, look: 0.5 }); A.a(tone(UY, 432), 652, 3.0, 4.2, { expr: "nervous", crouch: 0.3, look: -0.4 });
      fall(A, tone(BRV, 433), 653, -3.6, 4.4, T, 288.2, { dir: -1, expr: "fear" });
      volley(A, T, 288.0, -6, 6, 8.8, 2.6, -1, 6, 31);
    } },
  // 48a "Os paraguaios conseguiram uma grande vitória," — cheering on the parapet, rifles raised, flag waving
  { t0: 290.83, L: () => loc(["#4a80c0", "#f0dcb8"], { near: "#8a5434", far: "#a8683e", kind: "mud", seed: 99 }, [clouds("s48", 240, ["#ffffff", "#a4b8cc"], 69, 30, 110, 14, 3), forest("s48", 90, "palm", "#4a6a3a", 24, 54, { blur: 2, h: 13 })]),
    cam: mv([0, 2.4, -8, 44], [0, 2.5, -7, 40]), lite: GOLD, bloom: 0.7, act: (A, lt, u, T) => {
      A.fx(4.2, (g, c) => { const [x0, y0, s] = P(c, -12, 1.4, 4.2), [x1] = P(c, 12, 0, 4.2); g.fillStyle = "#8a4a2c"; g.fillRect(x0, y0, x1 - x0, 1.6 * s + 400); g.strokeStyle = "#3a2010"; g.lineWidth = 3; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y0); g.stroke(); });
      for (let i = 0; i < 7; i++) { const j = Math.max(0, Math.sin((lt * 2.2 + i * 0.6) * Math.PI)) * 0.2; A.a(tone(i % 3 ? PY : PYK, i + 440), 660 + i, -6 + i * 2, 5 + (i % 2) * 0.6, { expr: i % 2 ? "laugh" : "grin", armB: 1, wave: 1, talk: (Math.floor(T * 7) + i) % 4 + 1 }, { y: 1.4 + j }); }
      flag(A, "par", 0.5, 5.4, 5.2, 2.0, 1.3, { wind: 1.5 });
    } },
  // 48b "…causando milhares de baixas aos adversários." — the ditch below the earthworks, littered with fallen allies, smoke drifting
  { t0: 293.65, L: () => loc(["#3a3a52", "#b87a5a"], { near: "#3e3222", far: "#5a4632", kind: "mud", seed: 100, zFar: 300 }, [
      clouds("t48", 240, ["#c88a6a", "#3a3a4a"], 70, 30, 100, 20, 4), earthwork("t48", 30, "#6a3e26", { h: 3.0, wid: 40, emb: 8, blur: 0.8, seed: 15 }), abatis("t48", 22, "#4a3420", 23, 30)]),
    cam: mv([-6, 2.8, -6, 42, -40], [5, 2.6, -5, 42, -40]), lite: { ...GREY, key: "#a08a8a", ka: 0.2 }, bloom: 0.5, act: (A, lt) => {
      for (let i = 0; i < 14; i++) A.a(tone([BR, AR, UY, BRV][i % 4], i + 450), 680 + i, -12 + i * 1.8 + hash(i) * 1.2, 4 + (i % 4) * 3.5, { expr: "dazed", armB: 1 }, { rot: (i % 2 ? 1 : -1) * Math.PI / 2, y: 0.06, noCast: true });
      haze(A, 12, [170, 160, 156], 0.35, 8);
    } },
  // 49a "A guerra, que muitos acreditavam que terminaria rapidamente," — in a tent, calendar pages flip by
  { t0: 296.7, L: () => loc(undefined, { near: "#6a5a40", far: "#6a5a40", kind: "wood", seed: 101 }, [wall("u49", 4, "#c8b890", { h: 4, wid: 8, blur: 1.4, panel: "#8a7650" })], true),
    cam: mv([0.4, 2.1, -2.8, 40], [0, 2.1, -2.2, 36]), lite: LAMP, bloom: 0.5, act: (A, lt, u, T) => {
      const ms = ["JUNHO", "SETEMBRO", "DEZEMBRO", "MARÇO", "JUNHO", "SETEMBRO", "DEZEMBRO", "FEVEREIRO"], ys = ["1865", "1865", "1865", "1866", "1866", "1866", "1866", "1867"];
      const per = 0.5, i = Math.min(ms.length - 2, Math.floor(lt / per)), k = lt - i * per;
      calPage(A, 0, 2.6, 0.8, ms[i + 1], String(1 + ((i * 7) % 28)), ys[i + 1], k, [ms[i], String(1 + (((i - 1) * 7 + 28) % 28)), ys[i]]);
      A.light((g) => glow(g, VW * 0.8, VH * 0.2, VW * 0.4, "rgba(255,190,110,1)", 0.25));
    } },
  // 49b "…já durava quase dois anos." — a bearded, worn-out soldier in the rain, close
  { t0: 300.72, L: () => loc(["#3a4450", "#7a848c"], { near: "#3a3024", far: "#4a3e30", kind: "mud", seed: 102 }, [clouds("v49", 200, ["#8a9098", "#2e343c"], 71, 20, 80, 22, 5), forest("v49", 30, "palm", "#2e3a34", 12, 55, { blur: 3, h: 12 })]),
    cam: mv([0.3, 1.8, -3.6, 36], [0.05, 1.64, -3.0, 32]), lite: GREY, bloom: 0.4, wx: ["rain", 380, 0.6], act: (A, lt) => {
      A.a(v(tone(BRV, 460), { beard: "#4a3424", moustache: "#3a2618" }), 700, 0, 0.6, { expr: "sad", look: 0.3, crouch: 0.1, headTilt: -3 });
      A.fx(0.55, (g, c) => breath(g, c, lt, 0.25, 1.75, 0.55, 1, 3));
    } },
  // 50 "E o pior ainda estava por vir." — storm over a dark fortress silhouette on the river, lightning
  { t0: 303.06, L: () => loc(["#0a0c16", "#2a2a3a"], { near: "#14141a", far: "#1e1e26", kind: "grass", seed: 103, zFar: 300 }, [
      clouds("w50", 220, ["#3a3a4e", "#0e0e16"], 72, 20, 100, 26, 5), battery("w50", 80, { col: "#3a2a26", wid: 60, h: 5, n: 22, blur: 1.2, seed: 7 })]),
    cam: mv([0, 1.6, -16, 40], [0, 1.8, -12, 36]), lite: MOON, bloom: 0.6, wx: ["rain", 300, 0.4], act: (A, lt, u, T) => {
      river(A, 4, 78, ["#0e1218", "#2a3040"], { seed: 111 });
      const fl = (T - 303.4) % 1.3; A.light((g) => { if (fl > 0 && fl < 0.15) { lightning(g, VW * 0.35, 0, VW * 0.3, VH * 0.45, 1 - fl / 0.15, 3); g.fillStyle = `rgba(190,200,255,${0.35 * (1 - fl / 0.15)})`; g.fillRect(0, 0, VW, VH); } });
    } },
  // 51 "Um dos maiores obstáculos para os aliados era a Fortaleza de Humaitá." — Humaitá's batteries and ruined church tower along the bank
  { t0: 306.21, L: () => loc(["#5a7aa8", "#f0d8b4"], { near: "#5a6a3a", far: "#7a8a52", kind: "grass", seed: 104, zFar: 300 }, [
      clouds("x51", 260, ["#ffffff", "#a0b4c8"], 73, 40, 120, 16, 3), battery("x51", 40, { col: "#a65e3e", wid: 40, h: 5, n: 16, seed: 21 }), forest("x51", 90, "palm", "#4a6a3e", 30, 56, { blur: 1.4, h: 14 })]),
    cam: mv([-10, 2.6, -18, 42, -15], [0, 3.0, -15, 40, -15]), lite: GOLD, bloom: 0.6, act: (A, lt, u, T) => {
      river(A, 3, 38, ["#5a5040", "#c0a880"], { glit: "rgba(255,230,180,1)", seed: 121 });
      A.sp("cathedral", 18, 0, 46, { sc: 0.7 }); flag(A, "par", -6, 9, 39.5, 3, 2, { wind: 1 });
      for (let i = 0; i < 6; i++) A.a(tone(PY, i + 470), 710 + i, -16 + i * 6, 39, { expr: "stern" }, { y: 5, sc: 1 });
      A.over((g) => bigText(g, "FORTALEZA DE HUMAITÁ", T - 308.9, 1.6, VH * 0.2, 84));
    } },
  // 52a "Localizada às margens do rio Paraguai, ela protegia uma posição estratégica" — map: the river bend at Humaitá
  { t0: 311.17, L: () => samap("y52", MAPS.steel, { towns: ["hum", "asu"] }), cam: mv([SX(-58.2), SY(-26.3), -22, 40], [SX(-58.5), SY(-27.0), -9, 38]), lite: DAY, act: (A, lt, u, T) => {
      pinS(A, "hum", T - 311.3, "star", "#d52b1e");
      A.fx(-0.06, (g, c) => { const k = k01(T, 312.4, 313.2); if (k <= 0) return; g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.6 * k; g.strokeStyle = "#8ae0ff"; g.lineWidth = 10; g.lineCap = "round"; g.beginPath();
        [[-57.6, -25.3], [-57.8, -25.9], [-58.5, -27.05], [-58.6, -27.3]].forEach(([lo, la], i) => { const [sx, sy] = P(c, SX(lo), SY(la), 0); i ? g.lineTo(sx, sy) : g.moveTo(sx, sy); }); g.stroke(); g.restore(); });
    } },
  // 52b "…e dificultava a passagem dos navios inimigos." — the chain boom across the river, an ironclad pounded by shot
  { t0: 316.1, L: () => loc(["#6a7a98", "#e8d0b0"], { near: "#5a5a3a", far: "#7a7a52", kind: "grass", seed: 105, zFar: 300 }, [
      clouds("z52", 240, ["#ffe8d0", "#6a7a98"], 74, 30, 110, 16, 4), battery("z52", 70, { col: "#9a5a3c", wid: 50, h: 5, n: 18, blur: 1, seed: 23 })]),
    cam: hand(mv([-4, 1.4, -12, 42], [0, 1.6, -10, 40]), 0.03), lite: DAY, bloom: 0.6, kicks: [[317.1, 6], [317.9, 7], [318.5, 6]], act: (A, lt, u, T) => {
      river(A, 3, 68, ["#4a4a3a", "#a8987a"], { seed: 131 });
      A.fx(24, (g, c) => { g.strokeStyle = "#1e1c1a"; g.lineWidth = 6; g.setLineDash([10, 6]); g.beginPath(); for (let i = 0; i <= 40; i++) { const x = -40 + i * 2, [sx, sy] = P(c, x, 0.3 + 0.25 * Math.cos(i * 0.4 + T), 24); i ? g.lineTo(sx, sy) : g.moveTo(sx, sy); } g.stroke(); g.setLineDash([]); });
      ship(A, "ironclad", -6 + lt * 0.4, 30, { sc: 0.95, vel: 0.4, guns: [[T - 317.5, 4, 2.8]] }); funnel(A, -5 + lt * 0.4, 7.6, 30, { a: 0.65, sc: 0.95 });
      volley(A, T, 316.6, -30, 30, 69, 2.2, -1, 14, 41);
      for (const [at, x] of [[317.1, -12], [317.9, 2], [318.5, -3]] as number[][]) A.fx(30.5, (g, c) => waterHit(g, c, T - at, x, 30.5, 8, x + 9));
      A.fx(29.8, (g, c) => { const k = T - 318.1; if (k > 0 && k < 0.5) { const [sx, sy, s] = P(c, -4, 2.6, 29.8); for (let i = 0; i < 14; i++) { const a = i * 0.45; g.fillStyle = "#ffe0a0"; g.beginPath(); g.arc(sx + Math.cos(a) * k * 6 * s, sy + Math.sin(a) * k * 4 * s, 0.08 * s, 0, 7); g.fill(); } } });
    } },
  // 53 "Durante muito tempo, os aliados tentaram superar aquela defesa." — night siege: allied mortars fire, flares hang over the forts
  { t0: 319.25, L: () => loc(["#0a0e1e", "#24284a"], { near: "#1e1e1a", far: "#2a2a22", kind: "grass", seed: 106, zFar: 300 }, [
      clouds("aa53", 220, ["#2e3450", "#0e1020"], 75, 30, 100, 18, 5), battery("aa53", 60, { col: "#4a2e24", wid: 50, h: 5, n: 18, blur: 1.2, seed: 25 })]),
    cam: mv([-4, 1.6, -6, 44], [2, 1.8, -5, 40]), lite: MOON, bloom: 0.8, kicks: [[319.7, 6], [320.6, 6], [321.5, 6], [322.4, 6]], act: (A, lt, u, T) => {
      for (let i = 0; i < 3; i++) { gunFire(A, -6 + i * 4.2, 3 + i, T, 319.7 + i * 0.9, 1, 1); A.a(tone([BR, AR, BRV][i], i + 480), 720 + i, -7.2 + i * 4.2, 2.6 + i, { expr: "stern", look: 0.6 }, { dark: 0.35, darkCol: "#10142a" }); }
      for (let i = 0; i < 4; i++) A.fx(59, (g, c) => blast(g, c, T - 320.4 - i * 0.8, -18 + i * 11, 4, 59, 4, 140 + i));
      A.fx(40, (g, c) => { for (let i = 0; i < 2; i++) { const k = (lt * 0.3 + i * 0.5) % 1, [sx, sy, s] = P(c, -8 + i * 16 + k * 3, 22 - k * 12, 40); glow(g, sx, sy, 6 * s, "rgba(255,240,200,1)", 0.7 * (1 - k)); glow(g, sx, sy, 0.5 * s, "rgba(255,255,255,1)", 1 - k); } });
    } },
  // 54a "Enquanto isso, os soldados enfrentavam doenças," — field hospital: cots under canvas, a nurse with a lamp
  { t0: 323.76, L: () => loc(undefined, { near: "#6a5a40", far: "#6a5a40", kind: "wood", seed: 107 }, [wall("bb54", 7, "#d8c8a0", { h: 4.6, wid: 14, blur: 1.6, lamps: 3 })], true),
    cam: mv([-3, 1.8, -5, 42], [1, 1.7, -4, 38]), lite: LAMP, bloom: 0.6, act: (A, lt, u, T) => {
      for (let i = 0; i < 4; i++) { A.sp("cot", -4.5 + i * 3, 0, 3 + (i % 2) * 2.4, { sc: 1 }); A.a(tone([BR, AR, UY, BRV][i], i + 490, false), 730 + i, -4.5 + i * 3, 3 + (i % 2) * 2.4 + 0.02, { expr: i % 2 ? "pained" : "dazed", armB: 0 }, { rot: Math.PI / 2, y: 0.62, noCast: true }); }
      walkS(A, v(pyciv(1, 90), { hat: "bonnet", jacket: "#f2efe6", dress: "#e8e2d0", skin: undefined }), 735, lt, -3, 1.6, 0.8, { expr: "sad" });
      A.fx(1.5, (g, c) => { const [sx, sy, s] = P(c, -3 + lt * 0.8 + 0.4, 1.2, 1.5); glow(g, sx, sy, 2.5 * s, "rgba(255,190,100,1)", 0.5); });
      A.over((g) => bigText(g, "CÓLERA", T - 326.0, 1.0, VH * 0.85, 54, "#f0e0c0"));
    } },
  // 54b "…fome, exaustão e condições extremamente difíceis." — a food line in the rain: empty bowls, a soldier asleep sitting up
  { t0: 327.05, L: () => loc(["#3e4652", "#7e868e"], { near: "#3a2e22", far: "#4e4030", kind: "mud", seed: 108 }, [clouds("cc54", 200, ["#9098a0", "#323a42"], 76, 20, 80, 22, 5), forest("cc54", 50, "palm", "#2e3a32", 16, 57, { blur: 2.2, h: 12 })]),
    cam: mv([2, 1.6, -5, 40], [-1, 1.7, -4.2, 38]), lite: GREY, bloom: 0.4, wx: ["rain", 300, 0.55], act: (A, lt, u, T) => {
      for (let i = 0; i < 4; i++) A.a(tone([AR, BR, UY, BRV][i], i + 500), 740 + i, -4 + i * 1.6, 3 + i * 0.4, { expr: i === 1 ? "sad" : "pained", look: -0.6, armB: 0.5 });
      A.a(tone(BR, 505), 745, 3.4, 2.4, { expr: T > 327.6 ? "dazed" : "sad", crouch: 0.8, headTilt: 14 }, { y: -0.2 });
      A.sp("drum", -5.6, 0, 3.2, { sc: 1.6 }); campfire(A, 1.4, 5.5, 0.3, 9);
    } },
];
