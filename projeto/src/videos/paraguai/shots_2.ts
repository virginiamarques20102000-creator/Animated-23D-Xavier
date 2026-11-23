// 113 – 220 s: Marquês de Olinda, Mato Grosso, Corrientes, the Triple Alliance, Riachuelo, Uruguaiana.
import { VW, VH, P, glow, fire, smokeCol, puff, clamp, lerp, smooth, easeOut, easeIn, hash, rays, sun, stamp, fall, C, mv, path, hand, walkS, runS, marchF, marchCol, crowd, ship, flag, signing, caption, bigText, chapter, panel, v,
  blast, scorch, rubble, embers, flutter, sparks, lensFlare, glint, birds, dust, lightning, loc, mtn, hillL, clouds, city, forest, wall, ruins, field, cliffs, mix, shade, DAY, GOLD, BACK, GREY, NIGHTFIRE, MOON, LAMP, COLD, NOON, RED,
  PEDRO, PEDRO_Y, LOPEZ, MITRE, FLORES, BARROSO, BR, BRV, AR, UY, PY, PYK, SAILBR, SAILPY, tone, pyciv, pykid, samap, MAPS, hlS, arrowS, pinS, SX, SY, river, battery, earthwork, volley, gunFire, funnel, ball, waterHit,
  say, wade, reeds, road, colonial, graves, campfire, haze, k01 } from "./scn";
import type { Shot } from "./scn";

export const SHOTS_2: Shot[] = [
  // 18a "Em novembro de 1864, o Paraguai apreendeu o navio brasileiro Marquês de Olinda." — the Tacuarí overtakes the Brazilian packet, warning shot
  { t0: 113.09, L: () => loc(["#4a7ab8", "#e8dcc8"], { near: "#5a6a3a", far: "#7a8a5a", kind: "grass", seed: 51, zFar: 300 }, [
      clouds("a18", 260, ["#ffffff", "#a8b8cc"], 31, 40, 120, 16, 3), forest("a18", 160, "palm", "#4a6a40", 40, 21, { blur: 1.4, h: 14 }), forest("a18b", 150, "oak", "#3a5a34", 30, 22, { blur: 1.6, h: 11 })]),
    cam: mv([-10, 5, -30, 42, -15], [6, 5.4, -26, 40, -15]), lite: DAY, bloom: 0.6, kicks: [[116.65, 6]], act: (A, lt, u, T) => {
      river(A, 3, 150, ["#6a5a40", "#b8a07a"], { glit: "rgba(255,255,220,1)", seed: 21 });
      const xb = 2 + lt * 1.2, xp = -26 + lt * 3.6; ship(A, "steamBR", xb, 40, { vel: 1.2, sc: 0.9 }); funnel(A, xb + 1.6, 9.5, 40, { a: 0.55, sc: 0.9 });
      ship(A, "steamPY", xp, 30, { vel: 3.6, sc: 0.9, guns: [[T - 116.65, 13, 3.2]] }); funnel(A, xp + 1.6, 9.5, 30, { a: 0.7, sc: 0.9 });
      A.fx(40.5, (g, c) => waterHit(g, c, T - 117.2, xb + 15, 40.5, 7, 3));
      A.over((g) => caption(g, "NOVEMBRO DE 1864", T - 113.3, 2.6));
      if (T > 117.6) A.over((g) => bigText(g, "MARQUÊS DE OLINDA", T - 117.7, 1.9, VH * 0.18, 60));
    } },
  // 18b — on deck: Paraguayan sailors board, the Brazilian crew raises hands
  { t0: 118.0, L: () => loc(["#5a86c0", "#e8dcc0"], { near: "#7a5a3a", far: "#8a6a48", kind: "wood", seed: 52 }, [
      clouds("b18", 220, ["#ffffff", "#b0bccc"], 32, 30, 100, 12, 3), forest("b18", 90, "palm", "#4a6a40", 24, 23, { blur: 2.4, h: 14 })]),
    cam: hand(mv([1, 1.7, -4.4, 40], [0, 1.65, -3.6, 36]), 0.02), lite: DAY, act: (A, lt, u, T) => {
      for (let i = 0; i < 3; i++) A.a(tone(SAILBR, i + 7, false), 130 + i, 1.2 + i * 1.2, 1.4 + i * 0.5, { expr: i === 0 ? "shock" : "fear", armB: 1, look: -0.8 });
      for (let i = 0; i < 2; i++) runS(A, tone(SAILPY, i + 2), 135 + i, Math.min(lt, 0.7), -4.6 - i * 1.2, 1.6 + i * 0.6, 2.4, { expr: "shout", aim: lt > 0.7 });
      A.a(tone(PY, 60), 137, -1.2, 2.6, { expr: "stern", look: 0.8 });
    } },
  // 19a "No mês seguinte, tropas paraguaias invadiram a província brasileira de Mato Grosso." — map: arrow up the river into Mato Grosso
  { t0: 119.66, L: () => samap("c19", MAPS.ember, { towns: ["asu", "cba", "cuy"] }), cam: mv([SX(-57), SY(-22), -40, 40], [SX(-57), SY(-19), -30, 40]), lite: NIGHTFIRE, act: (A, lt, u, T) => {
      arrowS(A, [-57.6, -25.3], [-57.7, -19.3], k01(T, 121.6, 122.8), "#d52b1e", 0.34, -0.06); arrowS(A, [-57.2, -23.3], [-55.6, -21.0], k01(T, 122.0, 123.0), "#d52b1e", 0.24, 0.15);
      hlS(A, "MT", k01(T, 123.6, 124.2), "#ff6a3a", 0.42); pinS(A, "cba", T - 123.0, "fire");
    } },
  // 19b — Paraguayan infantry storm the walls of Fort Coimbra on its river cliff
  { t0: 122.35, L: () => loc(["#6a7a9a", "#e8c8a0"], { near: "#5a4a32", far: "#7a6a48", kind: "grass", seed: 53 }, [
      clouds("d19", 240, ["#ffe0c0", "#6a6a8a"], 33, 30, 100, 18, 4), cliffs("d19", 40, "#8a7a62", "#4a6a3a", 9, 12, 1.2), battery("d19", 34, { col: "#b8a890", wid: 14, h: 5, n: 6, seed: 5 })]),
    cam: hand(mv([-5, 1.4, -6, 42], [1, 1.5, -5, 38]), 0.035), lite: GOLD, bloom: 0.6, kicks: [[123.0, 8], [124.0, 10]], act: (A, lt, u, T) => {
      for (let i = 0; i < 7; i++) runS(A, tone(PY, i + 70), 140 + i, lt, -6 - i * 1.3, 3 + (i % 3) * 1.2, 3.4, { expr: "shout" });
      volley(A, T, 122.9, -8, 8, 33.5, 6, -1, 8, 11); volley(A, T, 124.1, -6, 6, 33.5, 6, -1, 7, 12);
      A.fx(20, (g, c) => blast(g, c, T - 123.0, 3, 0, 20, 2.2, 31)); A.fx(26, (g, c) => blast(g, c, T - 124.0, -6, 0, 26, 2.6, 32));
      flag(A, "imp", 2, 10, 34.5, 1.8, 1.2, { wind: 1, droop: T > 124.2 ? 0.6 : 0 });
    } },
  // 20 "O ataque surpreendeu o Império." — Pedro II reads the dispatch; ministers gasp
  { t0: 124.99, L: () => loc(undefined, { near: "#4a3424", far: "#4a3424", kind: "wood", seed: 54 }, [wall("e20", 6, "#e8dcc0", { h: 5, wid: 10, win: 2, arch: true, winCol: "#c8e0f0", curtain: "#2e6a3e", panel: "#8a6a40", blur: 1.4, frames: 2 })], true),
    cam: path([[0, [0, 1.7, -6, 40]], [0.4, [0, 1.6, -4.2, 36]], [1, [0.1, 1.64, -3.4, 32]]]), lite: DAY, bloom: 0.5, kicks: [[125.7, 4]], act: (A, lt, u, T) => {
      A.a(PEDRO_Y, 150, 0, 0.4, { expr: T > 125.7 ? "shock" : "neutral", prop: ["letter", 0], look: 0 });
      for (let i = 0; i < 3; i++) A.a(v(tone(BR, i + 80, false), { jacket: ["#1e1e24", "#2a2620", "#24242e"][i], pants: "#2a2a2e", hat: "hair", hair: ["#d0ccc4", "#3a2a1e", "#6a5a4a"][i], belt: null, moustache: i ? "#3a2a1e" : "#d0ccc4" }), 151 + i, (i - 1) * 1.6 + (i === 1 ? 0 : 0), 2.4 + (i % 2) * 0.6, { expr: T > 125.8 ? (i % 2 ? "shock" : "fear") : "nervous", look: i === 0 ? 0.6 : -0.6 });
    } },
  // 21 "Mas López tinha planos ainda maiores." — López over a map table by candlelight, sly grin, low angle
  { t0: 127.56, L: () => loc(undefined, { near: "#2a1c14", far: "#2a1c14", kind: "wood", seed: 55 }, [wall("f21", 5, "#2a2a36", { h: 4.5, wid: 8, blur: 2.4, frames: 1 })], true),
    cam: mv([0.6, 1.4, -3.8, 40, 20], [0.2, 1.45, -3.2, 36, 20]), lite: LAMP, bloom: 0.7, act: (A, lt, u, T) => {
      A.a(LOPEZ, 1, 0, 0.8, { expr: T > 128.6 ? "smile" : "stern", look: -0.5, armB: 0.6 + 0.2 * Math.sin(lt * 2), headTilt: -3 });
      A.fx(0.2, (g, c) => { const [x0, y0, s] = P(c, -2.2, 0.85, 0.2), [x1] = P(c, 2.2, 0, 0.2); g.fillStyle = "#3a2418"; g.fillRect(x0, y0, x1 - x0, 1.2 * s); g.fillStyle = "#d8c49a"; g.fillRect(x0 + 0.3 * s, y0 - 0.02 * s, (x1 - x0) * 0.7, 0.06 * s); });
      A.sp("candle", -1.4, 0.9, 0.1, { sc: 1.1 });
      A.light((g) => { const fl = 0.85 + 0.15 * Math.sin(lt * 21) * Math.sin(lt * 4); glow(g, VW * 0.3, VH * 0.6, VW * 0.5, "rgba(255,160,70,1)", 0.4 * fl); g.fillStyle = "rgba(0,0,10,0.25)"; g.fillRect(0, 0, VW, VH * 0.25); });
    } },
  // 22a "Em março de 1865, tropas paraguaias…" — canoes and a steamer land troops on the Corrientes bank
  { t0: 130.52, L: () => loc(["#3a5a90", "#f4c89a"], { near: "#9a7a52", far: "#b89a6a", kind: "sand", seed: 56, zFar: 300 }, [
      clouds("g22", 260, ["#ffd8b0", "#6a7aa0"], 34, 40, 120, 18, 3), colonial("g22", 120, 61, { blur: 1.3 }), forest("g22", 110, "palm", "#3e5a34", 30, 24, { blur: 1.3, h: 13 })]),
    cam: mv([-6, 3.4, -18, 42, -25], [2, 3.0, -14, 40, -25]), lite: GOLD, bloom: 0.6, act: (A, lt, u, T) => {
      river(A, 14, 100, ["#6a5a46", "#d8b088"], { glit: "rgba(255,220,170,1)", seed: 33 });
      ship(A, "steamPY2", -16 + lt * 1.5, 60, { vel: 1.5, sc: 0.85 }); funnel(A, -14.4 + lt * 1.5, 9, 60, { a: 0.6, sc: 0.85 });
      for (let i = 0; i < 4; i++) { const x = -10 + i * 6 + lt * 0.4, z = 22 + i * 6; ship(A, "chata", x, z, { sc: 0.8, vel: 0.4 }); for (let k = 0; k < 3; k++) A.a(tone(PY, i * 3 + k + 90), 160 + i * 3 + k, x - 1.6 + k * 1.3, z - 0.2, { expr: "stern" }, { y: 0.6 * 0.8, sc: 0.95 }); }
      for (let i = 0; i < 5; i++) runS(A, tone(PY, i + 100), 175 + i, lt, -8 + i * 1.5, 6 + (i % 2) * 1.5, 2.6, { expr: "shout" });
      A.over((g) => caption(g, "MARÇO DE 1865 · CORRIENTES", T - 130.8, 2.4));
    } },
  // 22b "…invadiram a província argentina de Corrientes," — townsfolk flee across a colonial plaza as soldiers pour in
  { t0: 133.93, L: () => loc(["#5a8ac8", "#e8e0d0"], { near: "#a89070", far: "#c0a888", kind: "cobble", seed: 57 }, [
      clouds("h22", 220, ["#ffffff", "#a8bccc"], 35, 40, 100, 12, 3), colonial("h22", 22, 71, { blur: 0.8 })]),
    cam: hand(mv([3, 1.7, -7, 42], [-2, 1.8, -6, 40]), 0.03), lite: DAY, act: (A, lt, u, T) => {
      for (let i = 0; i < 5; i++) runS(A, v(pyciv(i, 70), { skin: undefined }), 190 + i, lt, -2.5 + i * 1.0, 2.5 + i * 0.8, 1.6 + (i % 2) * 0.4, { expr: i % 2 ? "fear" : "shock" });
      for (let i = 0; i < 6; i++) runS(A, tone(PY, i + 110), 200 + i, lt, -7 - i * 1.0, 4 + (i % 3) * 1.1, 2.6, { expr: "shout" });
      flag(A, "arg", 6, 5.2, 14, 1.8, 1.2, { wind: 1.1 });
    } },
  // 22c "…depois que a Argentina negou autorização para a passagem de seu exército." — Mitre pushes the request back, NEGADO stamp
  { t0: 136.48, L: () => loc(undefined, { near: "#3a2a20", far: "#3a2a20", kind: "wood", seed: 58 }, [wall("i22", 5, "#d8d0bc", { h: 5, wid: 9, win: 1, winCol: "#e8f0f4", curtain: "#3a5a8a", frames: 1, blur: 1.6 })], true),
    cam: mv([-0.4, 1.64, -3.8, 36], [0, 1.64, -3.3, 32]), lite: DAY, bloom: 0.5, kicks: [[138.2, 5]], act: (A, lt, u, T) => {
      say(A, MITRE, 210, 0, 0.8, { expr: T > 138.1 ? "stern" : "neutral", armB: T > 138.1 ? 0.9 : 0.2, look: 0.2, headTilt: T > 138.1 ? 5 * Math.sin(T * 9) : 0 }, {}, T > 138.3);
      flag(A, "arg", 2.4, 3.6, 2.4, 1.3, 0.9, { wind: 0.25 });
      if (T > 138.15) A.over((g) => stamp(g, "NEGADO", T - 138.15, VW * 0.28, VH * 0.62, -0.18, 110, "#b3221c"));
    } },
  // 23 "Agora, o conflito envolvia diretamente Brasil e Argentina." — map: both giants flare, red arrows out of Paraguay
  { t0: 141.69, L: () => samap("j23", MAPS.dusk, { towns: ["asu", "cor", "cba"] }), cam: mv([SX(-56), SY(-24), -58, 40], [SX(-57), SY(-25), -46, 40]), lite: DAY, act: (A, lt, u, T) => {
      arrowS(A, [-57.6, -25.3], [-57.7, -19.3], 1, "#d52b1e", 0.4, -0.06); arrowS(A, [-57.8, -25.9], [-58.8, -27.6], 1, "#d52b1e", 0.4, 0.2);
      hlS(A, "BRA", k01(T, 144.5, 145.0), "#1f7a3a", 0.45); hlS(A, "ARG", k01(T, 145.1, 145.6), "#4a8ad8", 0.5); hlS(A, "PAR", 1, "#d52b1e", 0.35);
    } },
  // 24a "Em primeiro de maio de 1865, os três países…" — Buenos Aires hall, three envoys meet at the table
  { t0: 146.8, L: () => loc(undefined, { near: "#5a3a2a", far: "#5a3a2a", kind: "wood", seed: 59 }, [wall("k24", 7, "#c8b8a0", { h: 6, wid: 12, win: 3, arch: true, winCol: "#f8ecd0", curtain: "#7a2a24", panel: "#5a4030", frames: 2, blur: 1.2 })], true),
    cam: mv([-2, 2.2, -7, 42, -30], [1, 2.0, -5.4, 38, -30]), lite: { ...DAY, rim: "#ffe8c0" }, bloom: 0.6, act: (A, lt, u, T) => {
      A.fx(2.6, (g, c) => { const [x0, y0, s] = P(c, -2.6, 0.82, 2.6), [x1] = P(c, 2.6, 0, 2.6); g.fillStyle = "#5a3424"; g.fillRect(x0, y0, x1 - x0, 0.82 * s); g.fillStyle = "#f2ead6"; g.fillRect(x0 + 1.6 * s, y0 - 0.02 * s, 1.0 * s, 0.05 * s); });
      say(A, v(MITRE, { tie: "#74acdf" }), 220, 0, 3.6, { expr: "neutral", look: -0.5 }, {}, T < 149.5);
      A.a(v(tone(BR, 3, false), { hat: "hair", hair: "#5a4a3a", moustache: "#3a2a1e", jacket: "#1e2234", belt: null }), 221, -2.4, 3.3, { expr: "smile", look: 0.7 }); A.a(v(FLORES, { scarf: "#c4241c" }), 222, 2.4, 3.3, { expr: "stern", look: -0.7 });
      flag(A, "imp", -5, 4.6, 6.4, 1.6, 1.0, { wind: 0.3 }); flag(A, "arg", -0.8, 4.6, 6.4, 1.6, 1.0, { wind: 0.3 }); flag(A, "uru", 3.4, 4.6, 6.4, 1.6, 1.0, { wind: 0.3 });
      A.over((g) => caption(g, "1º DE MAIO DE 1865 · BUENOS AIRES", T - 147.1, 2.8));
    } },
  // 24b "…assinaram o Tratado da Tríplice Aliança." — the pen writes the signature
  { t0: 150.7, L: () => loc(undefined, { near: "#3a2418", far: "#3a2418", kind: "wood", seed: 60 }, [], true), cam: mv([0, 0, -3.4, 40], [0.2, -0.1, -2.9, 36]), lite: DAY, act: (A, lt, u, T) => {
      signing(A, k01(T, 150.8, 152.9), { title: "TRATADO DA TRÍPLICE ALIANÇA", sub: "Império do Brasil · República Argentina · República Oriental do Uruguai", seed: 11, prior: 1, desk: "#4a2a1a", sleeve: "#1e2234" });
    } },
  // 25 "Brasil, Argentina e Uruguai agora lutariam juntos contra o Paraguai." — three columns converge on the plain, crane up
  { t0: 153.95, L: () => loc(["#4a7ab8", "#e4dcc4"], { near: "#6a7a3a", far: "#9aa060", kind: "grass", seed: 61, zFar: 400 }, [
      clouds("l25", 260, ["#ffffff", "#9ab4cc"], 36, 40, 120, 16, 3), hillL("l25", 200, "#7a8a8a", 8, 16, 2.5), forest("l25", 90, "oak", "#4a6a3a", 26, 25, { blur: 1.4, h: 10 })]),
    cam: mv([0, 1.6, -8, 44], [0, 4.6, -12, 42, -70]), lite: DAY, act: (A, lt, u, T) => {
      marchCol(A, (i) => tone(BR, i + 120), lt, 7, -6, 8, 1.4, 1.25, 2, 1.2, {}, { expr: "stern" }, 230); flag(A, "imp", -6 + 1.4 * lt + 1.0, 3.4, 8.2, 1.4, 0.9, { wind: 1 });
      marchCol(A, (i) => tone(AR, i + 20), lt, 7, 6, 10, -1.4, 1.25, 2, 1.2, {}, { expr: "stern" }, 260); flag(A, "arg", 6 - 1.4 * lt - 1.0, 3.4, 10.2, 1.4, 0.9, { wind: 1 });
      marchF(A, (i) => tone(UY, i + 5), lt, 3, 4, 16, 1.4, 1.3, 1.7, 290, () => ({ expr: "stern" })); flag(A, "uru", 0, 3.6, 15 - 1.4 * lt, 1.4, 0.9, { wind: 1 });
    } },
  // 26 "O maior conflito armado da história da América do Sul estava oficialmente em andamento." — a battery fires in sequence at dusk; chapter card
  { t0: 159.13, L: () => loc(["#2a2446", "#ff8a4a"], { near: "#3a3024", far: "#5a4a34", kind: "grass", seed: 62, zFar: 300 }, [
      clouds("m26", 260, ["#ffa070", "#3a2a4a"], 37, 30, 110, 20, 4), hillL("m26", 150, "#3a3448", 10, 12, 2.5), forest("m26", 60, "palm", "#1e1a1e", 18, 26, { blur: 1.1, h: 12 })]),
    cam: mv([-6, 1.4, -6, 44], [4, 1.6, -5, 40]), lite: BACK, bloom: 0.8, kicks: [[159.4, 7], [160.2, 7], [161.0, 7], [161.8, 7]], act: (A, lt, u, T) => {
      for (let i = 0; i < 4; i++) { gunFire(A, -6 + i * 3.6, 4 + i * 0.4, T, 159.4 + i * 0.8, 1, 1); A.a(tone(BRV, i + 130), 300 + i, -7.2 + i * 3.6, 3.6 + i * 0.4, { expr: "stern", look: 0.6 }, { dark: 0.45, darkCol: "#2a1a2a" }); }
      A.light((g) => { sun(g, VW * 0.82, VH * 0.48, 30, "255,190,130"); lensFlare(g, VW * 0.82, VH * 0.48, 0.5); });
      A.over((g) => chapter(g, "1865", "A GUERRA COMEÇA", T - 160.4, 4.0));
    } },
  // 27 "No início, os paraguaios conseguiram avançar em território inimigo." — Paraguayan column surging across the gaúcho pampa, cattle scattering
  { t0: 164.97, L: () => loc(["#4a80c0", "#ecdcc0"], { near: "#7a8a42", far: "#a8b06a", kind: "grass", seed: 63, zFar: 500 }, [
      clouds("n27", 280, ["#ffffff", "#a8bccc"], 38, 40, 130, 16, 3), hillL("n27", 220, "#8aa07a", 11, 18, 2.5), hillL("n27b", 90, "#7a9a5a", 12, 6, 1.2)]),
    cam: mv([-10, 2.0, -9, 44], [3, 2.2, -8, 40]), lite: DAY, act: (A, lt) => {
      for (let i = 0; i < 9; i++) runS(A, tone(PY, i + 140), 310 + i, lt, -8 - (i % 3) * 1.6 - Math.floor(i / 3) * 0.8, 3 + (i % 3) * 1.6, 3.4, { expr: "shout" });
      flag(A, "par", -9 + 3.4 * lt + 1, 3.4, 5.2, 1.6, 1.0, { wind: 1.4 });
      A.fx(12, (g, c) => dust(g, c, lt, -18 + 3.4 * lt, 12, 1, 1.4, [180, 170, 120], 5));
      A.fx(30, (g, c) => birds(g, c, lt, 12, 6, 6, 30, 5, "#2a2026", 9, 0.5));
    } },
  // 28 "Mas uma batalha naval mudaria completamente o rumo do conflito." — the Brazilian squadron emerges from river mist, camera at water level
  { t0: 169.55, L: () => loc(["#6a7488", "#c8ccd0"], { near: "#4a5040", far: "#6a7060", kind: "grass", seed: 64, zFar: 300 }, [
      clouds("o28", 240, ["#dde0e4", "#7a8090"], 39, 20, 90, 24, 6), forest("o28", 130, "palm", "#5a6a62", 30, 27, { blur: 3, h: 14 })]),
    cam: mv([0, 0.8, -10, 40], [0, 1.1, -8, 36]), lite: GREY, bloom: 0.5, act: (A, lt) => {
      river(A, 0.5, 120, ["#3e4a4a", "#8a9494"], { seed: 41 });
      for (let i = 0; i < 4; i++) { const x = -18 + i * 11 + lt * 1.2, z = 36 + i * 10; ship(A, i % 2 ? "steamBR2" : "steamBR", x, z, { vel: 1.2, sc: 0.9 }); funnel(A, x + 1.6, 9.5, z, { a: 0.5, sc: 0.9 }); }
      A.fx(20, (g, c) => { for (let k = 0; k < 12; k++) { const [sx, sy, s] = P(c, -20 + k * 4 + Math.sin(lt * 0.3 + k) * 2, 1.2, 20 + (k % 3) * 8); puff(g, sx, sy, 5 * s, [210, 214, 218], 0.35); } });
    } },
  // 29 "Em 11 de junho de 1865, aconteceu a Batalha do Riachuelo." — wide: fleets clash, shore batteries fire, title
  { t0: 174.3, L: () => loc(["#5a6e90", "#e0c8a8"], { near: "#5a5a3a", far: "#7a7650", kind: "grass", seed: 65, zFar: 300 }, [
      clouds("p29", 260, ["#f4dcc0", "#5a6a84"], 40, 30, 120, 18, 4), forest("p29", 140, "palm", "#3e5a3a", 36, 28, { blur: 1.4, h: 14 }), cliffs("p29", 100, "#9a7a5a", "#4a6a3a", 15, 8, 1.4)]),
    cam: mv([-6, 6, -36, 42, -25], [4, 6.4, -32, 40, -25]), lite: GREY, bloom: 0.7, kicks: [[176.2, 6], [177.8, 8], [178.6, 8]], act: (A, lt, u, T) => {
      river(A, 5, 99, ["#4a4a40", "#a89a80"], { seed: 51 });
      ship(A, "steamBR", -8 + lt * 0.8, 40, { vel: 0.8, sc: 0.95, guns: [[T - 176.0, 10, 3.2], [T - 178.4, -10, 3.2]] }); funnel(A, -6.4 + lt * 0.8, 10, 40, { a: 0.7, sc: 0.95 });
      ship(A, "steamPY", 16 - lt * 1.0, 60, { dir: -1, vel: 1, sc: 0.85, guns: [[T - 177.0, 10, 3.2]] }); funnel(A, 14.6 - lt, 9, 60, { a: 0.7, sc: 0.85 });
      ship(A, "steamPY2", 34 - lt * 0.9, 70, { dir: -1, vel: 0.9, sc: 0.8, guns: [[T - 178.9, 10, 3.2]] });
      for (const [at, x, z] of [[176.6, 10, 58], [177.8, -2, 42], [178.6, 20, 64], [179.4, -14, 46]] as number[][]) A.fx(z + 0.6, (g, c) => waterHit(g, c, T - at, x, z + 0.6, 9, x));
      A.over((g) => caption(g, "11 DE JUNHO DE 1865", T - 174.5, 3.0)); A.over((g) => bigText(g, "BATALHA DO RIACHUELO", T - 178.4, 2.4, VH * 0.2, 86));
    } },
  // 30a "No rio Paraná, a Marinha brasileira…" — Admiral Barroso on the Amazonas' deck, shouting orders, signal flags up
  { t0: 180.71, L: () => loc(["#5a6a88", "#d8c8b0"], { near: "#6a4a30", far: "#7a5a3a", kind: "wood", seed: 66 }, [clouds("q30", 200, ["#e8d8c8", "#5a6a84"], 41, 20, 80, 16, 5)]),
    cam: hand(mv([0.5, 1.8, -4.2, 38], [0, 1.64, -3.5, 34]), 0.02), lite: GREY, bloom: 0.5, kicks: [[182.0, 4]], act: (A, lt, u, T) => {
      say(A, BARROSO, 320, 0, 0.8, { expr: "shout", armB: 0.6 + 0.35 * Math.sin(lt * 5), look: 0.5 }, {}, true);
      A.fx(6, (g, c) => { const [sx, sy, s] = P(c, -2.2, 0, 6); g.strokeStyle = "#3a2a1c"; g.lineWidth = 0.18 * s; g.beginPath(); g.moveTo(sx, sy); g.lineTo(sx, sy - 9 * s); g.stroke(); });
      for (let i = 0; i < 4; i++) flag(A, ["imp", "white", "colorado", "blanco"][i], -2.2, 7.6 - i * 1.0, 6, 0.9, 0.6, { wind: 1.4, pole: false });
      for (let i = 0; i < 2; i++) A.a(tone(SAILBR, i + 12, false), 321 + i, (i ? 2.2 : -2.0), 2.6, { expr: "stern", look: i ? -0.6 : 0.6 });
      A.fx(40, (g, c) => { for (let k = 0; k < 6; k++) { const [sx, sy, s] = P(c, -20 + k * 8, 3, 40); puff(g, sx, sy, 6 * s, [190, 186, 180], 0.4); } });
    } },
  // 30b "…enfrentou a frota paraguaia em um combate decisivo." — broadsides at close range, the Amazonas rams a Paraguayan steamer
  { t0: 183.0, L: () => loc(["#4a5068", "#c0a890"], { near: "#3a3a30", far: "#5a5644", kind: "grass", seed: 67, zFar: 300 }, [
      clouds("r30", 240, ["#d8b8a0", "#3a4058"], 42, 20, 100, 20, 5), forest("r30", 120, "palm", "#2e3a2e", 30, 29, { blur: 1.6, h: 14 })]),
    cam: hand(mv([-4, 3.6, -22, 42, -15], [2, 3.8, -19, 40, -15]), 0.04), lite: { ...NIGHTFIRE, rim: "#ffc080" }, bloom: 0.8, kicks: [[183.3, 8], [184.0, 8], [185.35, 18]], act: (A, lt, u, T) => {
      river(A, 3, 110, ["#3a3428", "#8a7460"], { seed: 61 });
      const ram = T - 185.35, xb = -16 + Math.min(T - 183.0, 2.35) * 6 - (ram > 0 ? Math.min(ram, 0.3) * 2 : 0), roll = ram > 0 ? Math.min(0.5, ram * 0.35) : 0;
      ship(A, "steamBR", xb, 22, { vel: ram > 0 ? 0 : 6, sc: 1, guns: [[T - 183.3, 10, 3.2], [T - 184.0, -8, 3.2]] }); funnel(A, xb + 1.8, 10.4, 22, { a: 0.75 });
      ship(A, "steamPY", 15, 24, { dir: -1, sc: 1, rock: roll, sink: ram > 0 ? Math.min(3, ram * 0.9) : 0, guns: [[T - 183.6, 8, 3.2]] }); if (ram < 0) funnel(A, 13.4, 10.4, 24, { a: 0.7 });
      if (ram > 0) { A.fx(23, (g, c) => { blast(g, c, ram, 6, 2.5, 23, 3, 41, { debris: 40 }); fire(g, c, T, 14, 4, 24, 2.2, 3); }); A.fx(24.5, (g, c) => smokeCol(g, c, T, 14, 6, 24.5, { h: 30, w: 4, col: [30, 26, 26], a: 0.8, seed: 5, wind: 0.4 })); }
      for (const [at, x, z] of [[183.5, 4, 30], [184.3, -10, 18], [184.9, 20, 28]] as number[][]) A.fx(z + 0.4, (g, c) => waterHit(g, c, T - at, x, z + 0.4, 7, x + 3));
    } },
  // 31a "Os brasileiros conseguiram uma vitória fundamental," — sailors cheer on deck, caps flung into the air
  { t0: 186.99, L: () => loc(["#4a78b8", "#f0d8b4"], { near: "#7a5a3a", far: "#8a6a48", kind: "wood", seed: 68 }, [clouds("s31", 220, ["#ffffff", "#aabcd0"], 43, 30, 100, 12, 3), forest("s31", 100, "palm", "#4a6a40", 26, 30, { blur: 2.2, h: 14 })]),
    cam: mv([-1.5, 1.6, -5.2, 40], [1, 1.7, -4.4, 38]), lite: GOLD, bloom: 0.7, act: (A, lt, u, T) => {
      for (let i = 0; i < 6; i++) { const jump = Math.max(0, Math.sin((lt * 2.4 + i * 0.7) * Math.PI)) * 0.25; A.a(tone(SAILBR, i + 20, false), 330 + i, -4 + i * 1.6, 2 + (i % 2) * 1.2, { expr: i % 2 ? "laugh" : "relief_open", armB: 1, wave: 1, talk: (Math.floor(T * 7) + i) % 4 }, { y: jump }); }
      A.fx(1.5, (g, c) => { for (let i = 0; i < 4; i++) { const k = (lt * 0.8 + i * 0.25) % 1.4, [sx, sy, s] = P(c, -3 + i * 2, 2.2 + 3 * k - 4.9 * k * k * 0.5, 1.5); g.save(); g.translate(sx, sy); g.rotate(k * 9 + i); g.fillStyle = "#f2efe6"; g.beginPath(); g.ellipse(0, 0, 0.18 * s, 0.08 * s, 0, 0, 7); g.fill(); g.strokeStyle = "#1a1a2a"; g.lineWidth = 2; g.stroke(); g.restore(); } });
      flag(A, "imp", 5, 4.4, 5, 1.8, 1.2, { wind: 1.3 });
    } },
  // 31b "…praticamente destruindo a capacidade naval do Paraguai." — burning Paraguayan steamers sinking, black smoke columns
  { t0: 190.25, L: () => loc(["#3a2e3a", "#c86a3a"], { near: "#2e2620", far: "#4a3a2e", kind: "grass", seed: 69, zFar: 300 }, [
      clouds("t31", 240, ["#d0784a", "#2e2838"], 44, 20, 100, 22, 5), forest("t31", 120, "palm", "#1e1a1a", 30, 31, { blur: 1.4, h: 14 })]),
    cam: mv([-3, 2.4, -16, 42, -10], [2, 2.0, -13, 40, -10]), lite: NIGHTFIRE, bloom: 0.9, act: (A, lt, u, T) => {
      river(A, 3, 110, ["#3a2a22", "#c87a4a"], { glit: "rgba(255,150,80,1)", seed: 71 });
      for (const [x, z, sk, kind] of [[-10, 30, 1.6, "steamPY2"], [9, 42, 2.4, "steamPY"]] as [number, number, number, string][]) { const s = Math.min(6, sk + lt * 0.5); ship(A, kind, x, z, { sc: 0.9, rock: 0.25 + lt * 0.02, sink: s });
        A.fx(z - 0.1, (g, c) => fire(g, c, T, x, Math.max(0, 3 - s * 0.4), z - 0.1, 2.6, x)); A.fx(z + 0.4, (g, c) => smokeCol(g, c, T, x, 4, z + 0.4, { h: 40, w: 5, col: [22, 18, 18], a: 0.85, seed: x, wind: 0.5 })); }
      ship(A, "chata", 2, 18, { sc: 1.2, rock: 0.3, sink: 0.6 + lt * 0.15 }); A.fx(17.9, (g, c) => embers(g, c, T, 2, 17.9, 6, 30, 6, 4));
    } },
  // 32a "Isso dificultou o transporte de soldados, armas e suprimentos," — an idle Paraguayan river port: crates, carts, a lone soldier watching the empty river
  { t0: 194.08, L: () => loc(["#7a8aa0", "#e0d4c0"], { near: "#7a6040", far: "#9a7a52", kind: "wood", seed: 70 }, [
      clouds("u32", 240, ["#ecdccc", "#7a8498"], 45, 30, 100, 16, 4), forest("u32", 110, "palm", "#4a5a40", 26, 32, { blur: 1.6, h: 13 })]),
    cam: mv([3, 1.8, -7, 42], [-1, 1.9, -6, 40]), lite: GREY, act: (A, lt, u, T) => {
      river(A, 10, 100, ["#5a5040", "#a89a80"], { seed: 81 });
      A.sp("carreta", -4, 0, 4.4, { sc: 1 }); A.sp("carreta", 5.5, 0, 7.2, { sc: 0.95, flip: true });
      for (let i = 0; i < 5; i++) A.fx(5, (g, c) => { const [sx, sy, s] = P(c, -1 + i * 0.9 - (i > 2 ? 1.8 : 0), (i > 2 ? 0.7 : 0), 5); g.fillStyle = "#8a6a44"; g.strokeStyle = "#2a1d16"; g.lineWidth = 2.5; g.fillRect(sx - 0.38 * s, sy - 0.7 * s, 0.76 * s, 0.7 * s); g.strokeRect(sx - 0.38 * s, sy - 0.7 * s, 0.76 * s, 0.7 * s); g.beginPath(); g.moveTo(sx - 0.38 * s, sy - 0.7 * s); g.lineTo(sx + 0.38 * s, sy); g.stroke(); });
      A.a(tone(PY, 160), 340, 1.6, 2.6, { expr: T > 198.3 ? "sad" : "nervous", look: 0.9 }); A.a(pyciv(4, 80), 341, 3.4, 3.4, { expr: "sad", look: 0.7 });
      A.fx(70, (g, c) => { const [sx, sy, s] = P(c, 18, 0, 70); for (let k = 0; k < 3; k++) puff(g, sx + k * 30, sy - 6 * s, 3 * s, [60, 60, 66], 0.4); });
      ship(A, "steamBR", 26, 75, { sc: 0.7 });
    } },
  // 32b "…deixando o país cada vez mais isolado." — map: Paraguay ringed by a dashed blockade, camera pulls away
  { t0: 198.3, fade: 0.2, L: () => samap("v32", MAPS.night, { towns: ["asu", "hum"] }), cam: mv([SX(-58), SY(-23.5), -18, 40], [SX(-58), SY(-23.5), -36, 40]), lite: MOON, act: (A, lt, u, T) => {
      hlS(A, "PAR", 1, "#d52b1e", 0.4);
      A.fx(-0.07, (g, c) => { const [cx, cy, s] = P(c, SX(-58.4), SY(-23.6), 0); g.save(); g.strokeStyle = "#e8eef4"; g.lineWidth = 6; g.setLineDash([22, 14]); g.lineDashOffset = -T * 40; g.beginPath(); g.ellipse(cx, cy, 5.4 * s, 4.6 * s * (0.6 + 0.4 * k01(T, 198.4, 199.4)), 0, 0, 7 * k01(T, 198.4, 199.4)); g.stroke(); g.restore(); });
    } },
  // 33 "Enquanto isso, no sul do Brasil, os paraguaios haviam ocupado a cidade de Uruguaiana." — the town at dusk with the tricolour on the church tower
  { t0: 201.72, L: () => loc(["#3a4068", "#f0a878"], { near: "#6a5a40", far: "#8a7452", kind: "grass", seed: 71 }, [
      clouds("w33", 240, ["#f8b888", "#4a4a6a"], 46, 30, 110, 18, 4), hillL("w33", 140, "#6a6a6a", 13, 8, 2), colonial("w33", 30, 81, { blur: 0.7, lit: 0.4, tint: "#ffd8b0" })]),
    cam: mv([0, 2.4, -10, 42, -20], [0, 2.2, -7.5, 38, -10]), lite: GOLD, bloom: 0.7, act: (A, lt, u, T) => {
      A.sp("cathedral", 3, 0, 40, { sc: 0.7 }); flag(A, "par", 9.6, 14.6, 39.9, 1.8, 1.2, { wind: 0.9 });
      A.fx(16, (g, c) => { const [x0, y0, s] = P(c, -14, 1.1, 16), [x1] = P(c, 14, 0, 16); g.fillStyle = "#5a4430"; g.fillRect(x0, y0, x1 - x0, 1.1 * s + 4); });
      for (let i = 0; i < 5; i++) A.a(tone(PY, i + 170), 350 + i, -6 + i * 3, 15 + (i % 2) * 0.5, { expr: "stern", look: 0 });
      A.over((g) => caption(g, "URUGUAIANA · RIO GRANDE DO SUL", T - 204.0, 2.6));
    } },
  // 34a "Mas as forças da Tríplice Aliança cercaram a região" — map: three arrows close a ring around Uruguaiana
  { t0: 207.47, L: () => samap("x34", MAPS.jade, { towns: ["uru", "cor"] }), cam: mv([SX(-57.1), SY(-29.7), -20, 40], [SX(-57.1), SY(-29.7), -15, 38]), lite: DAY, act: (A, lt, u, T) => {
      pinS(A, "uru", T - 207.5, "fire");
      arrowS(A, [-54.6, -28.4], [-56.8, -29.6], k01(T, 208.8, 209.6), "#1f7a3a", 0.18, 0.2); arrowS(A, [-59.4, -29.0], [-57.4, -29.7], k01(T, 209.0, 209.8), "#4a8ad8", 0.18, 0.2); arrowS(A, [-56.6, -31.6], [-57.1, -30.0], k01(T, 209.2, 210.0), "#2c3046", 0.18, 0.2);
      A.fx(-0.07, (g, c) => { const [cx, cy, s] = P(c, SX(-57.08), SY(-29.75), 0), k = k01(T, 209.6, 210.4); if (k <= 0) return; g.strokeStyle = "#f2c22a"; g.lineWidth = 5; g.beginPath(); g.arc(cx, cy, 1.4 * s, -Math.PI / 2, -Math.PI / 2 + 6.283 * k); g.stroke(); });
    } },
  // 34b "…em setembro de 1865, os paraguaios se renderam." — before Pedro II, the Paraguayan commander lays down his sword; rifles dropped, white flag
  { t0: 210.38, L: () => loc(["#6a8ab0", "#ecd8b8"], { near: "#7a7a44", far: "#9a9660", kind: "grass", seed: 72 }, [
      clouds("y34", 240, ["#ffffff", "#9ab0c8"], 47, 40, 120, 14, 3), colonial("y34", 50, 91, { blur: 1.4 }), field("y34", 20, "grass", "#9a9a5a", 13, 0.7, 40, 0.8)]),
    cam: path([[0, [0, 1.9, -8, 42]], [0.6, [0, 1.7, -5, 38]], [1, [0.6, 1.6, -4, 34]]]), lite: DAY, act: (A, lt, u, T) => {
      A.a(v(PEDRO_Y, { jacket: "#4a3a2a", scarf: "#e8e0d0", hat: "fedora", cap: "#d8cba0" }), 360, 1.6, 2.4, { expr: "stern", look: -0.8 });
      A.a(tone(BR, 200, false), 361, 3.2, 3.2, { expr: "stern", look: -0.6 }); flag(A, "imp", 4.4, 3.6, 4.4, 1.6, 1.0, { wind: 0.8 });
      const k = k01(T, 213.6, 214.8); A.a(v(tone(PY, 210, false), { hat: "kepi", cap: "#1d1b1e", medals: true }), 362, -1.2 + 0.8 * smooth(k), 2.4, { expr: T > 214.6 ? "sad" : "stern", look: 0.9, crouch: 0.35 * Math.sin(Math.PI * k), armB: k > 0 && k < 1 ? 0.9 : 0.2 });
      A.fx(2.3, (g, c) => { const [sx, sy, s] = P(c, -0.2 + 0.8 * smooth(k), 0.2 + (T > 214.8 ? 0 : 0.6), 2.3); g.strokeStyle = "#d8dce0"; g.lineWidth = 0.05 * s; g.beginPath(); g.moveTo(sx - 0.45 * s, sy); g.lineTo(sx + 0.45 * s, sy); g.stroke(); glint(g, sx, sy, 0.1 * s, 0.6); });
      for (let i = 0; i < 4; i++) A.a(tone(PY, i + 215, T < 214.0 + i * 0.15), 363 + i, -4.8 + i * 1.1, 4 + (i % 2), { expr: "sad", look: 0.4, crouch: 0.1 });
      flag(A, "white", -5.4, 3.0, 5.4, 1.2, 0.8, { wind: 0.7, droop: 0.2 });
      A.over((g) => caption(g, "SETEMBRO DE 1865", T - 211.6, 2.6));
    } },
  // 35 "A partir dali, a iniciativa militar passou para os aliados." — allied generals around a map table, camera orbit; arrows pointing north
  { t0: 216.14, L: () => loc(undefined, { near: "#7a6a4a", far: "#7a6a4a", kind: "wood", seed: 73 }, [wall("z35", 7, "#e0d4b4", { h: 5, wid: 12, panel: "#a08a60", blur: 1.6, map: false })], true),
    cam: path([[0, [-2.0, 1.9, -5.5, 42]], [1, [2.0, 1.9, -5.0, 40]]]), lite: LAMP, bloom: 0.6, act: (A, lt, u, T) => {
      A.fx(2.2, (g, c) => { const [x0, y0, s] = P(c, -2.2, 0.85, 2.2), [x1] = P(c, 2.2, 0.85, 2.2), y1 = y0 - 0.25 * s; g.fillStyle = "#5a3a24"; g.fillRect(x0, y0, x1 - x0, 0.85 * s); g.fillStyle = "#e8d8ac"; g.fillRect(x0 + 0.6 * s, y1 + 0.1 * s, (x1 - x0) * 0.6, 0.12 * s);
        g.strokeStyle = "#1f7a3a"; g.lineWidth = 6; g.beginPath(); g.moveTo(x0 + 1.2 * s, y0 - 0.1 * s); g.lineTo(x0 + (1.2 + 1.2 * k01(T, 217.2, 218.4)) * s, y0 - (0.1 + 0.35 * k01(T, 217.2, 218.4)) * s); g.stroke(); });
      say(A, tone(BR, 220, false), 370, -1.6, 3.4, { expr: "stern", armB: 0.8, look: 0.5 }, {}, T < 218.4); A.a(MITRE, 371, 0.2, 3.7, { expr: "neutral", look: -0.3 }); A.a(v(FLORES, { scarf: "#c4241c" }), 372, 1.9, 3.4, { expr: "smile", look: -0.6 });
    } },
];
