// 0 – 113 s: hook, title, 1864 background (Plata basin, Pedro II, López, Uruguay crisis, rising tension). Every shot has its own place, palette and extras.
import { VW, VH, P, glow, fire, smokeCol, puff, clamp, lerp, smooth, easeOut, hash, rays, sun, beam, stamp, fall, C, mv, path, hand, walkS, runS, marchF, marchCol, crowd, ship, flag, caption, bigText, chapter, calPage, panel, v,
  blast, scorch, rubble, embers, flutter, sparks, lensFlare, glint, birds, dust, lightning, loc, mtn, hillL, clouds, city, forest, wall, ruins, field, mix, shade, DAY, GOLD, BACK, GREY, NIGHTFIRE, MOON, LAMP, COLD, NOON,
  PEDRO, LOPEZ, MITRE, FLORES, AGUIRRE, BR, BRV, AR, UY, PY, PYK, SAILBR, tone, pyciv, pykid, samap, MAPS, mapCam, hlS, arrowS, pinS, SX, SY, river, battery, earthwork, volley, gunFire, funnel, ball, waterHit,
  say, wade, reeds, road, colonial, graves, campfire, haze, k01 } from "./scn";
import type { Shot } from "./scn";
import { facade } from "./paint";

export const SHOTS_1: Shot[] = [
  // 0a "O Paraguai entrou nessa guerra acreditando…" — Paraguayan column marching out at dawn under the tricolour, drum beating
  { t0: 0, L: () => loc(["#3a5a8e", "#f2b27a"], { near: "#6a5a32", far: "#a8885a", kind: "grass", seed: 21, zFar: 300 }, [
      clouds("a0", 240, ["#ffd8b0", "#7a6a8a"], 11, 40, 110, 22, 4), hillL("a0", 140, "#5a5a6e", 4, 18, 2.5), forest("a0", 55, "palm", "#4a6a38", 26, 5, { blur: 1.3, h: 13 }), field("a0", 22, "grass", "#8a8a46", 3, 1.0, 40, 0.6)]),
    cam: mv([-4, 1.6, -8, 42], [1.5, 1.8, -6.5, 38]), lite: GOLD, bloom: 0.7, act: (A, lt) => {
      marchCol(A, (i) => tone(PY, i + 3), lt, 9, 4, 6, 1.35, 1.25, 2, 1.1, {}, { expr: "stern" }, 10);
      walkS(A, tone(PYK, 2, false), 30, lt, 5.6, 5.0, 1.35, { expr: "grin" });
      A.sp("drum", 5.6 + 1.35 * lt + 0.25, 0.55 + 0.03 * Math.sin(lt * 12), 4.95, { sc: 1 });
      flag(A, "par", 3.2 + 1.35 * lt, 3.1, 6.4, 1.7, 1.1, { wind: 1.1 });
      A.fx(80, (g, c) => birds(g, c, lt, 7, -20, 18, 80, 3, "#2a2030", 4, 0.6));
      A.light((g) => { sun(g, VW * 0.78, VH * 0.36, 30, "255,210,160"); rays(g, VW * 0.78, VH * 0.36, VW * 0.9, 0.13, "255,200,150", 18, lt, Math.PI * 0.9, Math.PI * 0.8); lensFlare(g, VW * 0.78, VH * 0.36, 0.55); });
    } },
  // 0b "…que poderia enfrentar seus vizinhos." — López, proud close-up on a hill, sword hilt, flag behind
  { t0: 2.68, L: () => loc(["#4a6a9a", "#f0c08a"], { near: "#5a5030", far: "#8a7a50", kind: "grass", seed: 22 }, [
      clouds("a1", 200, ["#ffe0c0", "#8a7a9a"], 12, 30, 90, 18, 5), hillL("a1", 90, "#6a6a5a", 9, 9, 3), forest("a1", 30, "palm", "#4a6034", 12, 8, { blur: 2.4, h: 11 })]),
    cam: mv([0.4, 1.64, -3.8, 38], [0.1, 1.64, -3.1, 34]), lite: GOLD, bloom: 0.6, act: (A, lt, u, T) => {
      flag(A, "par", -2.6, 3.0, 3.2, 2.2, 1.4, { wind: 1.2 });
      A.a(LOPEZ, 1, 0, 0.6, { expr: T > 3.4 ? "smile" : "stern", look: T > 3.4 ? 0.9 : 0.2, armB: 0.2 + 0.4 * smooth(k01(T, 3.4, 4.0)) });
      A.light((g) => { glow(g, VW * 0.85, VH * 0.25, VW * 0.4, "rgba(255,200,140,1)", 0.25); });
    } },
  // 1 "Mas, seis anos depois, estaria completamente devastado." — burnt village at dusk; a house front collapses on "devastado"
  { t0: 5.39, fade: 0.25, L: () => loc(["#1e1a26", "#a24a2a"], { near: "#2e2620", far: "#4a3a2e", kind: "rubble", seed: 23 }, [
      clouds("b1", 220, ["#c0603a", "#3a2a34"], 13, 30, 100, 24, 4), forest("b1", 90, "dead", "#2a2220", 18, 4, { blur: 1.6, h: 14 }), colonial("b1", 34, 31, { ruin: true, blur: 1.2, tint: "#4a3a3a" })]),
    cam: mv([-2, 2.4, -8.5, 42, -30], [1.5, 2.0, -6, 38, -20]), lite: NIGHTFIRE, bloom: 0.75, wx: ["ash", 160, 0.5], kicks: [[9.0, 12]], act: (A, lt, u, T) => {
      for (const [x, z, s] of [[-9, 26, 2.2], [7, 30, 2.6], [15, 40, 3], [-16, 45, 2.4]] as number[][]) { A.fx(z, (g, c) => fire(g, c, lt, x, 0, z, s, x)); A.fx(z + 0.5, (g, c) => smokeCol(g, c, lt, x, s * 2, z + 0.5, { h: 34, w: 4, col: [34, 28, 30], a: 0.75, seed: x, wind: 0.5 })); }
      const k = T - 9.0, rot = k > 0 ? -Math.min(1.45, 0.5 * 9.81 * k * k / 4) : 0;
      if (k < 1.1) panel(A, 12, (w) => facade(w, 2.5, 7, 6, { wall: "#8a7460", floors: 2, cols: 3, roof: "gable", roofCol: "#7a3a24", win: "#1a1210", ruin: true, seed: 5 }), { pivot: [6, 0], rot });
      A.fx(11.9, (g, c) => { rubble(g, c, k - 0.45, 5.5, 2, 12, 7, 14, 36, "#7a6450"); embers(g, c, lt, 4, 12, 10, 50, 8, 6); });
      A.a(v(pyciv(1, 40), { dress: "#3a3230", jacket: "#2e2826" }), 2, -1.6, 4.4, { expr: T > 9.05 ? "shock" : "sad", crouch: 0.5, look: 1 }, { dark: 0.3, darkCol: "#2a1010" });
      A.light((g) => glow(g, VW * 0.6, VH * 0.95, VW * 0.6, "rgba(255,110,40,1)", 0.25));
    } },
  // 2 "E o mais impressionante?" — old woman's face by a candle, eyes widening
  { t0: 10.64, L: () => loc(undefined, { near: "#2a1e16", far: "#2a1e16", kind: "wood", seed: 24 }, [wall("c2", 5, "#5a4232", { h: 4, wid: 8, win: 1, winCol: "#3a4a6a", brick: false, panel: "#3a2a1e", blur: 2 })], true),
    cam: mv([0.2, 1.8, -3.4, 36], [0, 1.82, -2.8, 32]), lite: LAMP, bloom: 0.7, act: (A, lt, u, T) => {
      A.a(v(pyciv(5, 2), { hat: "headscarf", cap: "#2a2420", hair: "#bfbab2", jacket: "#3a302a", dress: "#3a302a" }), 3, 0, 0.6, { expr: T > 11.1 ? "shock" : "nervous", look: -0.4 });
      A.sp("candle", 0.9, 0.95, 0.2, { sc: 1.2 }); A.light((g) => { const fl = 0.85 + 0.15 * Math.sin(lt * 23) * Math.sin(lt * 7); glow(g, VW * 0.72, VH * 0.42, VW * 0.5, "rgba(255,170,80,1)", 0.35 * fl); });
    } },
  // 3a "O conflito que parecia uma guerra rápida…" — allied officers laughing over a map in a tent
  { t0: 12.33, L: () => loc(undefined, { near: "#6a5a40", far: "#6a5a40", kind: "wood", seed: 25 }, [wall("c3", 6, "#d8cba6", { h: 4.5, wid: 10, panel: "#8a7a5a", blur: 1.5, frames: 0 })], true),
    cam: mv([-1.2, 1.7, -4.5, 40], [0.6, 1.6, -3.6, 36]), lite: LAMP, act: (A, lt, u, T) => {
      A.sp("lamp", 0, 2.6, 2.2, { sc: 1 });
      say(A, tone(BR, 9, false), 4, -1.5, 1.6, { expr: "laugh", look: 0.6, armB: 0.8 }); A.a(tone(AR, 4, false), 5, 0.3, 2.0, { expr: T > 13.9 ? "laugh" : "grin", look: -0.4 }); A.a(tone(UY, 2, false), 6, 1.9, 1.5, { expr: "grin", look: -0.8, armB: 0.5 });
      A.fx(1.0, (g, c) => { const [x0, y0, s] = P(c, -2.4, 0.8, 1.0), [x1] = P(c, 2.4, 0, 1.0); g.fillStyle = "#4a3020"; g.fillRect(x0, y0, x1 - x0, 0.9 * s); g.fillStyle = "#c8b48a"; g.fillRect(x0 + 0.9 * s, y0 - 0.03 * s, (x1 - x0) * 0.45, 0.05 * s); });
      A.light((g) => glow(g, VW * 0.5, VH * 0.3, VW * 0.4, "rgba(255,190,110,1)", 0.25));
    } },
  // 3b "…acabou se transformando em uma das maiores tragédias…" — sunset field of crosses, crane up
  { t0: 14.9, fade: 0.4, L: () => loc(["#2a2a4a", "#e07a4a"], { near: "#3a3226", far: "#6a5a40", kind: "grass", seed: 26, zFar: 400 }, [
      clouds("d3", 260, ["#f0a070", "#4a3a5a"], 14, 30, 120, 22, 4), hillL("d3", 160, "#3e3a4a", 5, 14, 2.5), forest("d3", 70, "palm", "#2e3424", 18, 9, { blur: 1.5, h: 12 })]),
    cam: mv([0, 1.2, -5, 40], [0.5, 4.2, -9, 40, -60]), lite: BACK, bloom: 0.8, grade: ["#ff8a50", 0.18], act: (A, lt) => {
      graves(A, 90, -18, 18, 3, 50, 7, 1.1);
      A.a(v(pyciv(3, 7), { dress: "#2a2424", jacket: "#2a2424" }), 7, 0.8, 4.2, { expr: "sad", crouch: 0.6, look: -0.6 }, { dark: 0.45, darkCol: "#2a1a2a" });
      A.fx(60, (g, c) => birds(g, c, lt, 9, -10, 14, 60, 2, "#1a1420", 8, 0.7));
      A.light((g) => { sun(g, VW * 0.5, VH * 0.52, 34, "255,190,130"); rays(g, VW * 0.5, VH * 0.52, VW, 0.15, "255,170,120", 20, lt, Math.PI * 0.9, Math.PI * 0.5); lensFlare(g, VW * 0.5, VH * 0.52, 0.6); });
    } },
  // 4 "Brasil, Argentina e Uruguai se uniram contra os paraguaios." — three flags rise one per name, then three soldiers step in side by side
  { t0: 20.18, L: () => loc(["#4a7ab8", "#d8e4ea"], { near: "#9a8a6a", far: "#c0ae86", kind: "cobble", seed: 27 }, [
      clouds("e4", 220, ["#ffffff", "#9ab0c8"], 15, 40, 100, 18, 3), city("e4", 40, { pal: ["#e8dcc2", "#d8c8a8", "#cbb894"], seed: 13, floors: [2, 3], hgt: [7, 10], roof: "hip", roofCol: "#8a4a2e", blur: 1.4 })]),
    cam: mv([0, 2.2, -7.5, 44], [0, 1.8, -5.4, 40]), lite: DAY, act: (A, lt, u, T) => {
      const up = (t0: number) => 0.6 + 3.2 * easeOut(k01(T, t0, t0 + 0.9));
      flag(A, "imp", -4.6, up(20.2), 9, 2.2, 1.5, { wind: 1.0 }); flag(A, "arg", -0.6, up(20.55), 9, 2.2, 1.4, { wind: 1.1 }); flag(A, "uru", 3.4, up(21.6), 9, 2.2, 1.4, { wind: 0.9 });
      const step = (t0: number, x0: number, x1: number, o: typeof BR, id: number) => { const k = smooth(k01(T, t0, t0 + 0.8)); A.a(o, id, lerp(x0, x1, k), 3.4, { mode: k > 0 && k < 1 ? "stroll" : "stand", phase: k * 1.6, expr: T > 23.1 ? "stern" : "neutral", look: T > 23.1 ? 0 : (x1 < 0 ? 0.7 : -0.7) }); };
      step(22.5, -3.6, -1.3, tone(BR, 1), 8); step(22.6, 3.6, 1.3, tone(AR, 1), 9); step(22.7, 0, 0, tone(UY, 1), 10);
    } },
  // 5a "Milhares de soldados marcharam para os campos de batalha," — huge allied column on a red-earth road, dust
  { t0: 24.8, L: () => loc(["#5a86c0", "#e8d8b8"], { near: "#8a5a3a", far: "#b08a62", kind: "sand", seed: 28, zFar: 500 }, [
      clouds("f5", 260, ["#ffffff", "#a8b4c4"], 16, 40, 120, 16, 3), hillL("f5", 220, "#8a8a8e", 6, 26, 3), forest("f5", 80, "palm", "#5a7040", 30, 11, { blur: 1.2, h: 12 }), field("f5", 30, "grass", "#9a9a52", 9, 0.9, 60, 0.3)]),
    cam: mv([-3, 3.4, -10, 44, -50], [2, 5.5, -12, 42, -90]), lite: NOON, act: (A, lt) => {
      marchF(A, (i) => tone(i % 3 ? BR : BRV, i), lt, 9, 6, 4, -1.3, 1.25, 1.7, 400, () => ({ expr: "stern" }));
      flag(A, "imp", -3.5, 3.4, 10 - lt * 1.3, 1.4, 0.95, { wind: 0.9 });
      A.fx(20, (g, c) => dust(g, c, lt, 0, 20, 1, 1.6, [190, 140, 100], 4));
    } },
  // 5b "fortalezas foram destruídas" — brick battery hit by shells, wall collapses
  { t0: 28.35, L: () => loc(["#6a6a7a", "#d8b896"], { near: "#6a5040", far: "#8a6a50", kind: "rubble", seed: 29 }, [
      clouds("g5", 240, ["#e8d0c0", "#6a6a7a"], 17, 30, 100, 20, 4), battery("g5", 18, { col: "#a05e40", wid: 22, h: 4.4, n: 9, seed: 3 })]),
    cam: hand(mv([-2, 2.4, -7, 42], [0, 2.6, -5.5, 40]), 0.04), lite: GREY, bloom: 0.6, kicks: [[29.4, 16], [29.9, 10], [30.3, 8]], act: (A, lt, u, T) => {
      for (const [at, x, z, s] of [[29.4, 0, 17, 3.0], [29.9, -7, 17.5, 2.4], [30.3, 7, 17, 2.6]] as number[][]) A.fx(z - 0.6, (g, c) => { blast(g, c, T - at, x, 1.2, z - 0.6, s, x * 7 + 3, { debris: 34 }); rubble(g, c, T - at - 0.1, x, 2.5, z - 0.8, 6, x + 9, 30, "#9a5a3e"); });
      const k = T - 29.45; if (k > 0) A.fx(17.9, (g, c) => { const [sx, sy, s] = P(c, -2, 0, 17.9), [ex] = P(c, 2, 0, 17.9); g.fillStyle = "rgba(40,30,26,0.9)"; g.beginPath(); g.moveTo(sx, sy); g.lineTo(ex, sy); g.lineTo(ex - 0.4 * s, sy - Math.max(0, 4.4 - k * 6) * s); g.lineTo(sx + 0.3 * s, sy - Math.max(0, 4.4 - k * 5) * s); g.fill(); });
    } },
  // 5c "e até crianças acabaram envolvidas nos últimos momentos da guerra." — a boy with a too-big rifle, smoke behind, close
  { t0: 30.4, fade: 0.2, L: () => loc(["#4a4a5a", "#b8a088"], { near: "#4a4030", far: "#6a5a40", kind: "grass", seed: 30 }, [
      clouds("h5", 200, ["#c8b0a0", "#4a4a5a"], 18, 30, 90, 18, 5), forest("h5", 40, "palm", "#3a4a30", 14, 12, { blur: 2.6, h: 11 })]),
    cam: mv([0.6, 1.25, -3.0, 36], [0.15, 1.2, -2.2, 32]), lite: GREY, bloom: 0.55, wx: ["ash", 90, 0.4], act: (A, lt, u, T) => {
      A.fx(30, (g, c) => smokeCol(g, c, lt, 6, 0, 30, { h: 30, w: 6, col: [70, 64, 62], a: 0.7, seed: 4, wind: 0.6 }));
      A.a(pykid(2, 4, true), 11, 0, 0.6, { expr: T > 31.8 ? "fear" : "sad", look: T > 31.8 ? -0.7 : 0.2, armB: 0.2 }, { sc: 1.05 });
      A.a(pykid(5, 4, true), 12, -1.8, 2.6, { expr: "nervous", look: 0.5 });
    } },
  // 6 "Como tudo isso aconteceu?" — candle-lit desk, old map unrolls, quill; push toward it
  { t0: 35.08, L: () => samap("i6", MAPS.sepia, { labels: false }), cam: mv([SX(-58), SY(-26) - 2, -30, 40], [SX(-58), SY(-26), -22, 38]), lite: LAMP, bloom: 0.6, act: (A, lt) => {
      for (const k of ["asu", "hum", "cor", "uru", "cc"]) pinS(A, k, lt - hash(k.length) * 0.4, "ring", "#7a1a14");
      A.light((g) => { const fl = 0.8 + 0.2 * Math.sin(lt * 19) * Math.sin(lt * 5); glow(g, VW * 0.15, VH * 0.85, VW * 0.6, "rgba(255,170,80,1)", 0.4 * fl); g.fillStyle = "rgba(0,0,0,0.3)"; g.fillRect(0, 0, VW, VH * 0.08); });
    } },
  // 7a "Esta é a história da Guerra do Paraguai, de 1864 a 1870," — title over the river at sunset, a steamer crossing
  { t0: 37.16, fade: 0.3, L: () => loc(["#2a2a52", "#ff9a5a"], { near: "#2a2420", far: "#3a3026", kind: "grass", seed: 31, zFar: 300 }, [
      clouds("j7", 280, ["#ffb080", "#4a3a6a"], 19, 30, 120, 22, 4), forest("j7", 120, "palm", "#1e1a1e", 34, 13, { blur: 1.2, h: 14 }), forest("j7b", 26, "palm", "#14121a", 8, 14, { blur: 0.6, h: 12, wid: 1.2 })]),
    cam: mv([-2, 1.6, -10, 42], [2, 1.8, -9, 40]), lite: BACK, bloom: 0.9, act: (A, lt, u, T) => {
      river(A, 8, 110, ["#5a3a3a", "#ffb070"], { glit: "rgba(255,190,120,1)", seed: 7 });
      ship(A, "steamPY2", -30 + lt * 3.2, 60, { vel: 3, sc: 0.9 }); funnel(A, -30 + lt * 3.2 + 1.6, 9.5, 60, { a: 0.6 });
      A.light((g) => { sun(g, VW * 0.5, VH * 0.5, 36, "255,190,130"); rays(g, VW * 0.5, VH * 0.5, VW, 0.12, "255,170,120", 18, lt, Math.PI, Math.PI * 0.5); });
      A.over((g) => bigText(g, "A GUERRA DO PARAGUAI", T - 38.5, 5.0, VH * 0.42, 104, "#f6efe0", T > 39.8 ? "1864 – 1870" : undefined));
    } },
  // 7b "…contada em apenas 10 minutos." — pocket watch ticking on a leather map case
  { t0: 43.45, L: () => loc(undefined, { near: "#3a2418", far: "#3a2418", kind: "wood", seed: 32 }, [wall("k7", 4, "#3a2a20", { h: 4, wid: 8, blur: 3, frames: 2 })], true),
    cam: mv([0, 1.2, -3.4, 36], [0, 1.15, -2.7, 32]), lite: LAMP, bloom: 0.6, act: (A, lt) => {
      A.fx(0.6, (g, c) => { const [cx, cy, s] = P(c, 0, 1.15, 0.6), R = 0.42 * s; g.fillStyle = "#c9a24a"; g.beginPath(); g.arc(cx, cy, R * 1.08, 0, 7); g.fill(); g.fillStyle = "#f4ecd8"; g.beginPath(); g.arc(cx, cy, R, 0, 7); g.fill(); g.strokeStyle = "#2a1d16"; g.lineWidth = 3; g.stroke();
        g.fillStyle = "#2a1d16"; g.font = `bold ${Math.round(R * 0.2)}px "DejaVu Serif", serif`; g.textAlign = "center"; g.textBaseline = "middle"; for (let k = 1; k <= 12; k++) { const a = (k / 12) * Math.PI * 2 - Math.PI / 2; g.fillText(["I", "II", "III", "IIII", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"][k - 1], cx + Math.cos(a) * R * 0.8, cy + Math.sin(a) * R * 0.8); }
        const sec = Math.floor(lt * 4) / 4, a1 = (sec / 60) * Math.PI * 2 - Math.PI / 2, a2 = (10 / 60) * Math.PI * 2 - Math.PI / 2; g.lineCap = "round"; g.lineWidth = 6; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a2) * R * 0.5, cy + Math.sin(a2) * R * 0.5); g.stroke();
        g.strokeStyle = "#9a1e18"; g.lineWidth = 2.5; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a1 * 6) * R * 0.85, cy + Math.sin(a1 * 6) * R * 0.85); g.stroke(); glint(g, cx - R * 0.4, cy - R * 0.5, R * 0.2, 0.6 + 0.3 * Math.sin(lt * 3)); });
      A.light((g) => glow(g, VW * 0.3, VH * 0.2, VW * 0.5, "rgba(255,180,100,1)", 0.25));
    } },
  // 8 "Para entender essa história, precisamos voltar a 1864." — wall calendar torn back to 1864
  { t0: 46.7, L: () => loc(undefined, { near: "#4a3828", far: "#4a3828", kind: "wood", seed: 33 }, [wall("l8", 4, "#7a8a72", { h: 4, wid: 8, panel: "#4a3a2a", blur: 1.5, win: 1, winCol: "#e8d8b0" })], true),
    cam: mv([0.6, 1.9, -2.6, 38], [0, 1.95, -1.6, 34]), lite: DAY, bloom: 0.5, act: (A, lt, u, T) => {
      const tears: [number, string, string, string][] = [[47.0, "MARÇO", "1", "1870"], [47.5, "JANEIRO", "1", "1869"], [48.0, "AGOSTO", "5", "1868"], [48.4, "MAIO", "24", "1866"], [48.8, "MAIO", "1", "1865"]];
      const cur = tears.filter((x) => T >= x[0] + 0.6).length; const shown = cur < tears.length ? tears[cur] : ["JANEIRO", "1", "1864"] as [number, string, string, string] | string[];
      const nxt = cur + 1 < tears.length ? tears[cur + 1] : ["", "JANEIRO", "1", "1864"];
      const tearing = tears.find((x) => T >= x[0] && T < x[0] + 0.6);
      if (tearing) { const i = tears.indexOf(tearing), under = i + 1 < tears.length ? tears[i + 1] : [0, "JANEIRO", "1", "1864"]; calPage(A, 0, 2.45, 0.8, under[1] as string, under[2] as string, under[3] as string, T - tearing[0], [tearing[1], tearing[2], tearing[3]]); }
      else if (cur < tears.length) calPage(A, 0, 2.45, 0.8, (shown as string[])[1], (shown as string[])[2], (shown as string[])[3]); else calPage(A, 0, 2.45, 0.8, "JANEIRO", "1", "1864");
      void nxt;
      if (T > 49.25) A.over((g) => stamp(g, "1864", T - 49.25, VW * 0.75, VH * 0.3, -0.16, 120, "#b3221c"));
    } },
  // 9 "Naquela época, a América do Sul ainda era marcada por disputas territoriais e conflitos políticos." — the continent, borders flaring
  { t0: 51.8, L: () => samap("m9", MAPS.parch), cam: mv([SX(-60), SY(-18), -78, 40], [SX(-59), SY(-24), -44, 40]), lite: DAY, act: (A, lt, u, T) => {
      hlS(A, "BOL", k01(T, 54.95, 55.4) * (0.6 + 0.4 * Math.sin(T * 6)), "#b3221c", 0.4); hlS(A, "PAR", k01(T, 55.3, 55.8) * (0.6 + 0.4 * Math.sin(T * 6 + 1)), "#c4501c", 0.45); hlS(A, "URU", k01(T, 56.25, 56.7), "#8a1a4a", 0.5); hlS(A, "ARG", k01(T, 56.8, 57.3) * 0.7, "#5a2a8a", 0.3);
      A.over((g) => caption(g, "AMÉRICA DO SUL · 1864", lt - 0.3, 5));
    } },
  // 10a "Uma das regiões mais importantes era a Bacia do Rio da Prata," — zoom into the river system, rivers glowing
  { t0: 58.2, L: () => samap("n10", MAPS.teal, { towns: ["asu", "bai", "mvd", "cor"] }), cam: mv([SX(-58), SY(-28), -40, 40], [SX(-58.3), SY(-29.5), -22, 40]), lite: DAY, act: (A, lt, u, T) => {
      A.fx(-0.06, (g, c) => { const k = k01(T, 60.5, 61.9); if (k <= 0) return; g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.5 * k * (0.7 + 0.3 * Math.sin(T * 5)); g.strokeStyle = "#7ae0ff"; g.lineWidth = 9; g.lineCap = "round";
        for (const r of [[-58.6, -27.3, -58.8, -27.5, -59.6, -29.2, -60.6, -31.6, -60.7, -32.9, -59.3, -33.8, -58.5, -34.2], [-57.6, -25.3, -57.8, -25.9, -58.5, -27.05, -58.6, -27.3], [-57.08, -29.75, -57.6, -30.2, -58.2, -31.3, -58.1, -32.3, -58.4, -33.6]]) { g.beginPath(); for (let i = 0; i < r.length; i += 2) { const [sx, sy] = P(c, SX(r[i]), SY(r[i + 1]), 0); i ? g.lineTo(sx, sy) : g.moveTo(sx, sy); } g.stroke(); } g.restore(); });
      A.over((g) => bigText(g, "BACIA DO PRATA", T - 60.5, 3.2, VH * 0.18, 70, "#e8f4f6", undefined, "120,220,255"));
    } },
  // 10b "…por onde passavam rotas comerciais e militares fundamentais." — cargo boats and a gunboat on the wide brown river
  { t0: 61.9, fade: 0.25, L: () => loc(["#5a8ac8", "#f0dcb8"], { near: "#6a5a3a", far: "#8a7a50", kind: "sand", seed: 34, zFar: 300 }, [
      clouds("o10", 260, ["#ffffff", "#b0bccc"], 20, 40, 120, 18, 3), forest("o10", 150, "palm", "#4a6a3e", 40, 15, { blur: 1.4, h: 13 }), forest("o10b", 140, "oak", "#3e5a34", 30, 16, { blur: 1.6, h: 11 })]),
    cam: mv([-6, 2.4, -12, 42, -20], [4, 2.8, -10, 40, -30]), lite: GOLD, bloom: 0.6, act: (A, lt, u, T) => {
      river(A, 4, 135, ["#7a5a3a", "#c8a878"], { glit: "rgba(255,230,170,1)", seed: 9 });
      ship(A, "steamBR2", -24 + lt * 4, 58, { vel: 4, sc: 0.8 }); funnel(A, -24 + lt * 4 + 1.4, 8.4, 58, { a: 0.55, sc: 0.8 });
      ship(A, "chata", 14 - lt * 1.2, 28, { dir: -1, vel: 1.2, sc: 1.4 });
      for (let i = 0; i < 3; i++) A.a(tone(SAILBR, i + 4, false), 13 + i, 14 - lt * 1.2 - 2 + i * 1.6, 27.6, { expr: "neutral" }, { y: 0.9, sc: 0.9 });
      A.light((g) => { sun(g, VW * 0.18, VH * 0.3, 24, "255,226,170"); lensFlare(g, VW * 0.18, VH * 0.3, 0.5); });
      if (T > 64.2) A.fx(40, (g, c) => { const k = T - 64.3; if (k > 0 && k < 3) { const [sx, sy, s] = P(c, 6, 1.2, 40); glow(g, sx, sy, 2 * s, "rgba(255,220,150,1)", Math.max(0, 1 - k * 4)); } });
    } },
  // 11a "O Brasil, governado pelo imperador Dom Pedro II," — São Cristóvão palace hall, push to the emperor
  { t0: 66.47, L: () => loc(undefined, { near: "#5a2a22", far: "#7a3a2a", kind: "wood", seed: 35 }, [wall("p11", 8, "#2e5a3e", { h: 7, wid: 12, win: 3, arch: true, winCol: "#f4e8c8", curtain: "#b08a2a", panel: "#6a4a2a", blur: 1.2, frames: 0 })], true),
    cam: path([[0, [0, 2.2, -9, 42, -20]], [0.5, [0, 1.9, -5, 38]], [1, [0.1, 1.75, -1.6, 32]]]), lite: { ...LAMP, rim: "#ffe0a0" }, bloom: 0.7, act: (A, lt, u, T) => {
      A.sp("throne", 0, 0, 1.6, { sc: 1.1 }); A.a(PEDRO, 20, 0, 0.9, { expr: T > 68.7 ? "stern" : "neutral", look: 0.1, armB: 0.2 });
      for (let i = 0; i < 4; i++) A.a(tone(BR, i + 20, false), 21 + i, (i < 2 ? -1 : 1) * (2.6 + (i % 2) * 1.4), 3 + (i % 2), { expr: "stern" });
      flag(A, "imp", -4, 4.4, 6, 1.8, 1.2, { wind: 0.35 }); flag(A, "imp", 4, 4.4, 6, 1.8, 1.2, { wind: 0.3 });
      A.light((g) => { glow(g, VW * 0.5, VH * 0.1, VW * 0.5, "rgba(255,220,160,1)", 0.25); });
      if (T > 68.7) A.over((g) => caption(g, "DOM PEDRO II · IMPERADOR DO BRASIL", T - 68.8, 2.6));
    } },
  // 11b "…queria garantir a navegação pelos rios da região" — imperial gunboat steaming upriver, flag cracking, camera tracking along the hull
  { t0: 70.13, L: () => loc(["#3a76c0", "#e0ecf2"], { near: "#4a6a3a", far: "#7a8a5a", kind: "grass", seed: 36, zFar: 300 }, [
      clouds("q11", 240, ["#ffffff", "#a8c0d8"], 21, 40, 120, 16, 3), forest("q11", 90, "palm", "#3e6a38", 34, 17, { blur: 1.1, h: 14 }), reeds("q11", 40, "#7a8a4a", 3, 2.2, 60)]),
    cam: mv([-8, 5.5, -26, 42, -20], [2, 5.8, -23, 40, -20]), lite: DAY, bloom: 0.55, act: (A, lt) => {
      river(A, 3, 39, ["#6a5a3a", "#a89068"], { glit: "rgba(255,255,220,1)", seed: 3 });
      const x = -10 + lt * 3.2; ship(A, "steamBR", x, 18, { vel: 3.2, sc: 1 }); funnel(A, x + 1.8, 10.6, 18.05, { col: [40, 36, 38], a: 0.7 });
      A.fx(17.9, (g, c) => { const [sx, sy, s] = P(c, x, 2.8, 17.9); const ph = lt * 7; for (let k = 0; k < 6; k++) { g.strokeStyle = `rgba(250,250,250,${0.4 - k * 0.06})`; g.lineWidth = 3; g.beginPath(); g.arc(sx, sy + 0.05 * s, (0.6 + k * 0.4 + (ph % 1) * 0.4) * s * 0.6, Math.PI * 0.1, Math.PI * 0.9); g.stroke(); } });
      for (let i = 0; i < 3; i++) A.a(tone(SAILBR, i, false), 26 + i, x - 6 + i * 2.2, 17.7, { expr: "neutral", look: 0.8 }, { y: 2.85, sc: 0.95 });
      flag(A, "imp", x - 13.8, 7.2, 18.1, 2.2, 1.4, { wind: 1.5, pole: false });
    } },
  // 11c "…e manter sua influência sobre os países vizinhos." — map: Brazil glows, arrows of influence to every neighbour
  { t0: 73.18, L: () => samap("r11", MAPS.olive, { towns: ["rio", "asu", "mvd", "bai"] }), cam: mv([SX(-52), SY(-22), -44, 40], [SX(-55), SY(-25), -36, 40]), lite: DAY, act: (A, lt, u, T) => {
      hlS(A, "BRA", k01(T, 73.2, 73.8), "#1f7a3a", 0.42);
      arrowS(A, [-43.2, -22.9], [-57.6, -25.3], k01(T, 74.3, 75.1), "#2f8a3e", 0.28, 0.1); arrowS(A, [-43.2, -22.9], [-56.2, -34.9], k01(T, 74.6, 75.4), "#2f8a3e", 0.28, -0.1); arrowS(A, [-43.2, -22.9], [-58.4, -34.6], k01(T, 74.9, 75.7), "#2f8a3e", 0.24, -0.2);
    } },
  // 12a "Enquanto isso, o Paraguai era governado por…" — Asunción at sunset, López's palace, sentries
  { t0: 76.31, L: () => loc(["#3a3a6a", "#ffae6a"], { near: "#8a6a4a", far: "#b08a62", kind: "sand", seed: 37 }, [
      clouds("s12", 240, ["#ffc090", "#5a4a7a"], 22, 40, 110, 18, 4), forest("s12", 70, "palm", "#2e3a2a", 20, 18, { blur: 1.2, h: 14 }), colonial("s12", 36, 41, { blur: 0.8, lit: 0.3 })]),
    cam: mv([-6, 2.2, -14, 44, -20], [-1, 2.6, -10, 40, -30]), lite: GOLD, bloom: 0.7, act: (A, lt) => {
      A.sp("palace", 0, 0, 24, { sc: 0.9 }); flag(A, "par", 0, 16.6, 23.9, 2.0, 1.3, { wind: 0.8 });
      for (let i = 0; i < 4; i++) A.a(tone(PY, i + 30), 40 + i, -5 + i * 3.3, 9 + (i % 2), { expr: "stern" });
      walkS(A, pyciv(2, 12), 45, lt, -10, 6, 1.2, { expr: "neutral" }); walkS(A, pyciv(3, 12), 46, lt, 8, 7, -1.1, { expr: "smile" });
      A.light((g) => { sun(g, VW * 0.88, VH * 0.4, 24, "255,200,150"); lensFlare(g, VW * 0.88, VH * 0.4, 0.4); });
    } },
  // 12b "…por Francisco Solano López, um presidente autoritário" — López slams the desk, ministers flinch
  { t0: 79.1, L: () => loc(undefined, { near: "#4a2a1e", far: "#4a2a1e", kind: "wood", seed: 38 }, [wall("t12", 6, "#8a2a24", { h: 5, wid: 10, frames: 3, panel: "#3a2016", blur: 1.4, win: 2, winCol: "#f0c890", curtain: "#4a1a14" })], true),
    cam: path([[0, [0, 1.8, -3.8, 36]], [0.35, [0, 1.64, -3.1, 32]], [0.55, [-0.4, 1.7, -5.4, 40]], [1, [0, 1.75, -4.8, 38]]]), lite: LAMP, bloom: 0.6, kicks: [[81.5, 8]], act: (A, lt, u, T) => {
      const slam = T > 81.45; say(A, LOPEZ, 1, 0, 0.8, { expr: slam ? "shout" : "stern", armB: slam ? 1 : 0.3 * Math.sin(lt * 2), look: slam ? 0.5 : 0 }, {}, T > 80.4);
      for (let i = 0; i < 3; i++) A.a(v(pyciv(i * 2, 30), { jacket: ["#2a2a2e", "#3a3028", "#2e2a34"][i], pants: "#2a2a2e", hat: "hair" }), 50 + i, 1.8 + i * 1.1, 1.6 + i * 0.5, { expr: slam ? (i % 2 ? "fear" : "shock") : "nervous", look: -1, crouch: slam ? 0.25 : 0.05 });
      if (T > 80.3) A.over((g) => caption(g, "FRANCISCO SOLANO LÓPEZ", T - 80.3, 2.4));
    } },
  // 12c "…que desejava transformar seu país em uma potência regional." — the Ybycuí iron foundry: sparks, molten iron, cannons being cast
  { t0: 82.5, L: () => loc(undefined, { near: "#2a1a14", far: "#3a2418", kind: "stone", seed: 39 }, [wall("u12", 9, "#4a3a30", { h: 8, wid: 16, brick: true, pipes: true, blur: 1.6, win: 4, winCol: "#ff9a4a" })], true),
    cam: mv([-3, 2.0, -6, 42], [1.5, 1.8, -4.4, 38]), lite: NIGHTFIRE, bloom: 0.9, act: (A, lt, u, T) => {
      A.fx(4.2, (g, c) => { const [sx, sy, s] = P(c, 0.6, 0.2, 4.2); g.fillStyle = "#ffb040"; g.beginPath(); g.ellipse(sx, sy, 1.6 * s, 0.25 * s, 0, 0, 7); g.fill(); glow(g, sx, sy, 3 * s, "rgba(255,140,40,1)", 0.8 + 0.2 * Math.sin(lt * 9)); });
      A.fx(4.0, (g, c) => sparks(g, c, lt, 0.6, 1.0, 4.0, 1, 50, 3));
      A.sp("gun1860", -2.8, 0, 3.4, { sc: 1.2 }); A.sp("gun1860", 3.6, 0, 5.4, { sc: 1.1, flip: true });
      for (let i = 0; i < 3; i++) { const h = Math.sin(lt * 6 + i * 2); A.a(v(tone(PYK, i + 5, false), { jacket: "#6a3a2a", hat: "cap", cap: "#3a2a20" }), 60 + i, -1.6 + i * 1.6, 2.6 + (i % 2) * 0.8, { expr: "stern", prop: ["hammer", h > 0 ? 1 : 0], armB: 0.3 }); }
      if (T > 84.5) A.fx(2, (g) => void g);
      A.light((g) => glow(g, VW * 0.55, VH * 0.75, VW * 0.6, "rgba(255,120,40,1)", 0.35));
    } },
  // 13 "Mas uma crise no Uruguai mudaria tudo." — Montevideo port street at dusk, people hurry, the Uruguayan flag snaps
  { t0: 86.5, L: () => loc(["#2a3456", "#d88a6a"], { near: "#5a5050", far: "#7a6a62", kind: "cobble", seed: 40 }, [
      clouds("v13", 220, ["#e89a7a", "#3a3a5a"], 23, 30, 100, 20, 4), city("v13", 30, { pal: ["#d8c8b0", "#c8b8a0", "#b8a890", "#e0d0b8"], seed: 21, floors: [2, 3], hgt: [8, 11], roof: "flat", blur: 0.9, lit: 0.35 })]),
    cam: hand(mv([2, 1.8, -7, 42], [-1, 1.7, -5, 38]), 0.025), lite: GOLD, bloom: 0.6, kicks: [[88.6, 5]], act: (A, lt, u, T) => {
      flag(A, "uru", -3.5, 5.6, 12, 2.4, 1.6, { wind: 1.4 });
      for (let i = 0; i < 6; i++) (i % 2 ? runS : walkS)(A, v(pyciv(i, 50), { skin: undefined }), 70 + i, lt, (i % 2 ? -8 : 9) + i * 0.4, 3 + i * 0.9, (i % 2 ? 2.6 : -1.6), { expr: i % 3 ? "nervous" : "fear" });
      A.a(v(FLORES, { hat: "fedora", scarf: undefined, jacket: "#3a3a40" }), 76, 0.4, 2.2, { expr: T > 88.0 ? "shock" : "nervous", look: -0.5 });
    } },
  // 14 "O país enfrentava uma guerra civil… os Blancos e os Colorados." — two gaucho bands face off on the pampa; camera swings white → red
  { t0: 89.8, L: () => loc(["#4a7ab0", "#e8dcc0"], { near: "#7a7a4a", far: "#a8a06a", kind: "grass", seed: 41, zFar: 400 }, [
      clouds("w14", 260, ["#ffffff", "#9ab0c8"], 24, 40, 120, 14, 3), hillL("w14", 180, "#8a9a7a", 7, 10, 2.5), field("w14", 26, "grass", "#9a9a5a", 11, 0.8, 50, 0.6)]),
    cam: path([[0, [0, 1.8, -10, 44]], [0.55, [-4.5, 1.6, -5.5, 38]], [1, [4.5, 1.6, -5.5, 38]]]), lite: DAY, act: (A, lt, u, T) => {
      flag(A, "blanco", -6.2, 3.4, 5.6, 1.6, 1.1, { wind: 1.1 }); flag(A, "colorado", 6.2, 3.4, 5.6, 1.6, 1.1, { wind: 1.2 });
      for (let i = 0; i < 4; i++) A.a(v(pyciv(i, 61), { scarf: "#f4f2ec", hat: "fedora", cap: "#2a2a2a", skin: undefined, rifle: i % 2 === 0, jacket: ["#3a3a40", "#5a4a3a", "#2a2a2e", "#4a4a3a"][i] }), 80 + i, -6.6 + (i % 2) * 1.2, 3 + i * 0.8, { expr: T > 93.8 ? "shout" : "stern", look: 0.9, talk: T > 93.8 ? (i + Math.floor(T * 8)) % 4 : 0 });
      A.a(AGUIRRE, 84, -5.0, 2.4, { expr: "stern", look: 1 });
      for (let i = 0; i < 4; i++) A.a(v(pyciv(i + 3, 62), { scarf: "#c4241c", hat: i % 2 ? "fedora" : "hair", cap: "#3a2a1e", skin: undefined, rifle: i % 2 === 1, jacket: ["#5a3a2a", "#3a3028", "#4a3a3a", "#6a4a3a"][i] }), 90 + i, 6.6 - (i % 2) * 1.2, 3 + i * 0.8, { expr: T > 94.5 ? "shout" : "stern", look: -0.9, talk: T > 94.5 ? (i + Math.floor(T * 8)) % 4 : 0 });
      A.a(FLORES, 94, 5.0, 2.4, { expr: "stern", look: -1 });
    } },
  // 15a "O Brasil decidiu apoiar militarmente os Colorados," — Brazilian officer and Flores shake hands, troops behind
  { t0: 96.12, L: () => loc(["#5a8ac0", "#f0dcb0"], { near: "#6a6a3a", far: "#9a9060", kind: "grass", seed: 42 }, [
      clouds("x15", 240, ["#ffffff", "#a0b4c8"], 25, 40, 110, 14, 3), forest("x15", 60, "oak", "#4a6a3a", 20, 19, { blur: 1.6, h: 10 })]),
    cam: mv([0, 1.8, -4.4, 38], [0, 1.8, -3.5, 34]), lite: GOLD, act: (A, lt, u, T) => {
      flag(A, "imp", -3, 3.4, 5, 1.8, 1.2, { wind: 0.9 }); flag(A, "colorado", 3, 3.4, 5, 1.6, 1.1, { wind: 1.0 });
      const shake = T > 97.2 ? 0.7 + 0.25 * Math.sin(T * 14) : 0.2;
      say(A, tone(BR, 31, false), 100, -0.75, 1.0, { expr: "smile", look: 1, armB: shake }, {}, T > 98.1); A.a(FLORES, 101, 0.75, 1.0, { expr: "grin", look: -1, armB: shake });
      marchCol(A, (i) => tone(BR, i + 40), lt, 8, -8, 6, 1.2, 1.25, 1, 1.1, {}, { expr: "stern" }, 110);
    } },
  // 15b "…intervindo no conflito em 1864." — Brazilian gunboats shelling the river town of Paysandú
  { t0: 98.7, L: () => loc(["#3a4a6a", "#c89a7a"], { near: "#4a3a2a", far: "#6a5040", kind: "mud", seed: 43, zFar: 300 }, [
      clouds("y15", 240, ["#d8a888", "#4a4a5a"], 26, 30, 100, 18, 4), colonial("y15", 70, 51, { blur: 1.0, tint: "#c8b8a8" })]),
    cam: hand(mv([-4, 3.4, -24, 42], [2, 3.6, -21, 40]), 0.04), lite: GREY, bloom: 0.7, kicks: [[100.0, 9], [100.6, 12], [101.4, 9]], act: (A, lt, u, T) => {
      river(A, 4, 60, ["#4a3e34", "#8a7460"], { seed: 11 });
      ship(A, "steamBR2", -6, 30, { sc: 0.9, guns: [[T - 99.4, 10, 3.2], [T - 100.2, -9, 3.2]] }); funnel(A, -4.6, 9.2, 30, { a: 0.6, sc: 0.9 });
      ship(A, "steamBR", 10, 40, { sc: 0.8, dir: -1, guns: [[T - 99.9, 10, 3.2]] });
      for (const [at, x] of [[100.0, -12], [100.6, 4], [101.4, 18], [102.0, -2]] as number[][]) A.fx(70.5, (g, c) => blast(g, c, T - at, x, 2, 70.5, 6, x + 21, { debris: 26 }));
      A.over((g) => caption(g, "PAYSANDÚ · 1864", T - 100.5, 2.0));
    } },
  // 16a "Solano López considerou essa intervenção uma ameaça…" — López reads the dispatch by lamplight; face hardens
  { t0: 103.05, L: () => loc(undefined, { near: "#3a241a", far: "#3a241a", kind: "wood", seed: 44 }, [wall("z16", 4, "#3a4a5a", { h: 4, wid: 8, frames: 1, blur: 2.4 })], true),
    cam: mv([0.3, 1.64, -3.6, 34], [0.05, 1.64, -3.0, 30]), lite: LAMP, bloom: 0.6, act: (A, lt, u, T) => {
      A.a(v(LOPEZ, { hat: "hair" }), 1, 0, 0.6, { expr: T > 105.6 ? "stern" : T > 104.6 ? "nervous" : "neutral", prop: ["paper", 0], look: T > 106.3 ? 0.9 : -0.3, headTilt: T > 105.6 ? -4 : 2 });
      A.light((g) => { const fl = 0.85 + 0.15 * Math.sin(lt * 17); glow(g, VW * 0.25, VH * 0.6, VW * 0.5, "rgba(255,170,80,1)", 0.35 * fl); });
    } },
  // 16b "…aos interesses paraguaios e ao equilíbrio de poder na região." — a brass balance tipping on the map table
  { t0: 107.55, L: () => samap("aa16", MAPS.rust, { labels: true }), cam: mv([SX(-58), SY(-27), -26, 40], [SX(-58), SY(-27), -21, 38]), lite: LAMP, act: (A, lt, u, T) => {
      const tip = 0.32 * Math.tanh((T - 108.4) * 2) * (T > 108.1 ? 1 : 0);
      A.fx(-6, (g, c) => { const [px, py, s] = P(c, SX(-58), SY(-23), -6), L = 4.2 * s; g.strokeStyle = "#c9a24a"; g.lineWidth = 0.18 * s; g.lineCap = "round"; g.beginPath(); g.moveTo(px, py); g.lineTo(px, py + 5 * s); g.stroke();
        const ax = Math.cos(tip) * L, ay = Math.sin(tip) * L; g.beginPath(); g.moveTo(px - ax, py - ay); g.lineTo(px + ax, py + ay); g.stroke();
        for (const [sd, fl] of [[-1, "par"], [1, "imp"]] as [number, string][]) { const hx = px + sd * ax, hy = py + sd * ay; g.lineWidth = 0.05 * s; g.beginPath(); g.moveTo(hx, hy); g.lineTo(hx - 0.8 * s, hy + 1.8 * s); g.moveTo(hx, hy); g.lineTo(hx + 0.8 * s, hy + 1.8 * s); g.stroke();
          g.fillStyle = "#b8923a"; g.beginPath(); g.ellipse(hx, hy + 1.8 * s, 1.0 * s, 0.25 * s, 0, 0, 7); g.fill(); g.fillStyle = fl === "par" ? "#d52b1e" : "#1f7a3a"; g.fillRect(hx - 0.35 * s, hy + 1.15 * s, 0.7 * s, 0.6 * s); }
        glint(g, px, py, 0.4 * s, 0.6 + 0.3 * Math.sin(T * 3)); });
    } },
  // 17 "A tensão aumentou rapidamente." — night riverbank: Paraguayan gunners load a cannon, lightning on the horizon
  { t0: 110.27, L: () => loc(["#0c1020", "#2a2a44"], { near: "#2a2620", far: "#3a3428", kind: "mud", seed: 45 }, [
      clouds("bb17", 220, ["#4a4a6a", "#14141e"], 27, 30, 90, 22, 4), forest("bb17", 60, "palm", "#0e1014", 20, 20, { blur: 1.4, h: 13 }), earthwork("bb17", 6, "#4a3a2a", { h: 1.2, wid: 18, logs: true, emb: 3 })]),
    cam: mv([-1, 1.6, -4.4, 40], [0.4, 1.5, -3.2, 34]), lite: MOON, bloom: 0.7, act: (A, lt, u, T) => {
      A.sp("gun1860", 0.6, 0, 3.2, { sc: 1.1 });
      A.a(tone(PY, 50), 120, -1.4, 2.6, { expr: "nervous", look: 0.8, prop: ["torch", 0] }); A.a(tone(PY, 51), 121, 2.6, 2.9, { expr: "stern", look: -0.6 });
      A.fx(2.5, (g, c) => { const [sx, sy, s] = P(c, -1.0, 1.9, 2.5); glow(g, sx, sy, 1.6 * s, "rgba(255,150,60,1)", 0.5 + 0.2 * Math.sin(lt * 15)); });
      const fl = (lt * 1.7) % 2.2; A.light((g) => { if (fl < 0.12) { lightning(g, VW * 0.7, 0, VW * 0.78, VH * 0.42, 1 - fl / 0.12, 7); g.fillStyle = `rgba(200,210,255,${0.25 * (1 - fl / 0.12)})`; g.fillRect(0, 0, VW, VH); } });
    } },
];
