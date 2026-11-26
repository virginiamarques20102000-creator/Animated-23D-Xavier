// 421 – 571 s: ele agiu sozinho, os anos preso, Dachau, o reconhecimento tardio, a pergunta e o final.
import type { Shot } from "../ww2/types";
import { loc, wall, world, clouds, hillL, forest, field, city, skyline, mtn, MX, MY, ST } from "./places3";
import { LAMP, NIGHTFIRE, DAY, GOLD, BACK, GREY, MOON, COLD } from "../ww2/looks";
import { walkS, walkF, crowd, hl, arrow, pin, calPage, panel, hand, counter, civ, v, kid, GESTAPO, tank, plane, planeTop, idle, HIT_OLD, marchF, sol, WEH } from "../ww2/kit";
import { blast, embers, flutter, birds, lensFlare } from "../ww2/fx";
import { stamp, tint, sun, rays, weather } from "../ww2/engine";
import { hallL, hallOutL, streetL, shopL, roomL, cellL, mapL, mv, clockOver, column, mechanism, wallClock, torchBeam, mapLabel, xMark, oldFilm, bench, gearW,
  ELSER, ELSER_W, ELSER_C, ELSER_P, HIT, HIMMLER, GOERING, HESS, PARTY, GUARD, caption, bigText, P, glow, puff, VW, VH, clamp, lerp, smooth, easeOut, hash, mix, fire, smokeCol, din, dinT, soco } from "./ek";
import { hall, elserBench, sunbeam, CX, CZ, PZ } from "./scenes";

const dark = () => loc(undefined, { near: "#120c08", far: "#120c08", kind: "none", zFar: 4 }, [], true);
const INTER = (K: string) => roomL(K, "#3a3a3e", { dark: 0.45 });
const fieldL = (K: string) => loc(["#3a3e5e", "#e8b088"], { near: "#5a5a3a", far: "#8a8058", kind: "grass", seed: 21, zFar: 300 }, [clouds(K, 260, ["#f0b898", "#4a4e6e"], 3, 40, 110, 14, 4), hillL(K, 120, "#5a5a6a", 6, 10, 2), field(K, 18, "wheat", "#b89a5a", 3, 0.9, 40, 0.4)]);
const roadL = (K: string, dawn = false) => loc(dawn ? ["#3a4a7a", "#ffc890"] : ["#2a2a4a", "#d08a6a"], { near: "#4a4038", far: "#6a5a48", kind: "mud", seed: 97, zFar: 300 }, [clouds(K, 260, dawn ? ["#ffd8a8", "#5a6a9a"] : ["#e09a7a", "#3a3a5a"], 5, 40, 110, 16, 4), hillL(K, 130, dawn ? "#5a5a7a" : "#3a3448", 3, 12, 2), forest(K, 60, "poplar", dawn ? "#3a4a38" : "#2a3028", 14, 9, { blur: 1.4, h: 13 })]);
/** a janela da cela: estação do ano muda (neve / folhas / sol) */
const cellShot = (A: import("../ww2/kit").Sc, lt: number, o: { expr?: import("../ww2/kit").FO["expr"]; sit?: boolean; beam?: number; who?: boolean } = {}) => {
  A.sp("bed", -0.9, 0, 2.6, { sc: 1 }); if (o.who !== false) A.a(ELSER_P, 1, o.sit ? -0.6 : 0.5, 2.4, o.sit ? { mode: "sit", expr: o.expr ?? "sad", headTilt: 14, look: 0.5 } : { expr: o.expr ?? "sad", look: 0.6, headTilt: -10 }, { y: o.sit ? 0.45 : 0 });
  A.light((g) => { const [sx, sy, s] = P(A.cam, 1.1, 3.2, 3.6); g.save(); g.globalCompositeOperation = "lighter"; g.fillStyle = `rgba(220,230,255,${0.12 * (o.beam ?? 1)})`; g.beginPath(); g.moveTo(sx - 0.5 * s, sy - 0.4 * s); g.lineTo(sx + 0.5 * s, sy - 0.4 * s); g.lineTo(sx + 1.6 * s, sy + 3.3 * s); g.lineTo(sx - 0.2 * s, sy + 3.3 * s); g.closePath(); g.fill(); g.restore(); });
};

export const SHOTS_4: Shot[] = [
  // 80 "Georg Elser havia planejado e executado o atentado sozinho." — ele remonta o mecanismo diante da Gestapo
  { t0: 421.01, fade: 0.25, L: () => INTER("i80"), cam: dinT(421.01, [0, 1.5, -3.4, 40], [[423.0, [0.2, 1.35, -2.2, 34]], [425.0, [0, 1.6, -4.0, 42]]]), lite: { ...LAMP, rdx: 0, rdy: -1 }, act: (A, lt, u, T) => {
      elserBench(A, lt, 0, 1.6, { gears: true, expr: "stern", out: ELSER_P });
      A.a(GESTAPO, 801, -1.6, 2.6, { expr: "shock", look: 1 }); A.a(v(GESTAPO, { hat: "hair", hair: "#3a2a1e" }), 802, 1.7, 2.7, { expr: "nervous", look: -1 });
      A.light((g) => { const [sx, sy, s] = P(A.cam, 0, 2.8, 1.8); glow(g, sx, sy, 3 * s, "rgba(255,236,190,1)", 0.6); });
      A.over((g) => { if (T > 425.0) bigText(g, "SOZINHO", T - 425.0, 1.2, VH * 0.18, 110, "#ffd060"); });
    } },
  // 81a "Ele não tinha um exército," — o campo vazio
  { t0: 426.15, fade: 0.25, L: () => fieldL("f81"), cam: mv([0, 3.5, -12, 44, -40], [0, 3.8, -14, 46, -40]), lite: GOLD, bloom: 0.7, act: (A, lt) => { A.a(ELSER, 1, 0, 2, { expr: "neutral" }); A.light((g) => { sun(g, VW * 0.82, VH * 0.42, 26, "255,214,160"); }); } },
  // 81b "não recebia ordens de uma potência estrangeira" — o telefone mudo, o telegrama em branco
  { t0: 427.73, fade: 0.2, L: () => roomL("r81", "#6a5a48", { win: true }), cam: mv([0, 1.3, -2.4, 36], [0, 1.3, -2.0, 32]), lite: LAMP, act: (A, lt, u, T) => {
      A.sp("desk", 0, 0, 1.4, { sc: 0.85 }); A.sp("radio", 0.6, 0.8, 1.35, { sc: 0.7 }); A.sp("telegram", -0.4, 0.8, 1.35, { sc: 0.45 });
      const k = clamp((T - 428.35) / 0.4); if (k > 0) A.over((g) => xMark(g, VW / 2, VH * 0.5, 170, k * 1.4));
    } },
  // 81c "e não fazia parte de uma conspiração internacional." — o mapa-múndi sem nenhuma linha
  { t0: 430.43, fade: 0.2, L: () => world("w81", ST.night), cam: mv([0, 1.5, -22, 40], [0, 1.5, -20, 40]), act: (A, lt, u, T) => {
      pin(A, 11.58, 48.14, T - 430.6, "star", true, "#ffd060"); const k = clamp((T - 431.65) / 0.6);
      for (const [lo, la] of [[-0.1, 51.5], [-77, 38.9], [37.6, 55.7], [2.3, 48.8]] as number[][]) arrow(A, [lo, la], [11.4, 48.2], 0.85, "#5a7aa8", 0.25, true, 0.15);
      if (k > 0) A.over((g) => xMark(g, VW / 2, VH * 0.5, 220, k * 1.4));
    } },
  // 82 "Era um homem que havia decidido tentar impedir a guerra eliminando os principais líderes nazistas." — na cela, a luz da janela
  { t0: 433.47, fade: 0.3, L: () => cellL("c82"), cam: dinT(433.47, [0, 1.6, -3.2, 40], [[435.8, [0.3, 1.6, -2.2, 34]]]), lite: COLD, act: (A, lt) => cellShot(A, lt, { expr: "stern" }) },
  // 83a "Durante os interrogatórios, sofreu violência" — sombra de um punho erguido na parede (sem mostrar a violência)
  { t0: 440.13, fade: 0.2, L: () => INTER("i83"), cam: mv([0, 1.5, -3.2, 40], [0.2, 1.45, -2.6, 36]), lite: { ...LAMP, rdx: 0, rdy: -1 }, mood: ["#3a3a5a", 0.25], kicks: [[442.1, 10]], act: (A, lt, u, T) => {
      const sw = 0.35 * Math.sin(lt * 2.4); A.sp("desk", 0, 0, 1.6, { sc: 1 }); A.a(ELSER_P, 1, 0, 2.2, { mode: "sit", expr: T > 442.1 ? "pained" : "fear", headTilt: T > 442.1 ? 18 : 0 }, { y: 0.3 });
      A.a(GESTAPO, 831, -1.3, 2.4, { expr: "shout", look: 1, facing: 1, prop: ["fist", 1] }, { dark: 0.6, darkCol: "#080608" });
      A.light((g) => { const [sx, sy, s] = P(A.cam, Math.sin(sw) * 1.2, 2.9, 1.8); const [tx, ty] = P(A.cam, 0, 4, 1.8); g.strokeStyle = "#141414"; g.lineWidth = 3; g.beginPath(); g.moveTo(tx, ty); g.lineTo(sx, sy); g.stroke(); glow(g, sx, sy, 3.2 * s, "rgba(255,236,190,1)", 0.6); });
      A.light((g) => { const k = T - 442.1; if (k > 0 && k < 0.2) { g.fillStyle = `rgba(255,255,255,${0.5 * (1 - k / 0.2)})`; g.fillRect(0, 0, VW, VH); } });
    } },
  // 83b "e foi pressionado a revelar supostos cúmplices." — fotos jogadas na mesa; ele balança a cabeça
  { t0: 442.73, fade: 0.2, L: () => INTER("i83"), cam: dinT(442.73, [0.4, 1.4, -2.4, 36], [[443.8, [0.1, 1.45, -1.6, 30]]]), lite: { ...LAMP, rdx: 0, rdy: -1 }, mood: ["#3a3a5a", 0.25], act: (A, lt, u, T) => {
      A.sp("desk", 0, 0, 1.6, { sc: 1 }); for (let i = 0; i < 4; i++) { const k = clamp((T - 443.0 - i * 0.2) / 0.25); if (k > 0) A.sp("doc", -0.6 + i * 0.4, 0.82 + i * 0.01, 1.5, { sc: 0.7, rot: (hash(i) - 0.5) * 0.4 }); }
      A.a(ELSER_P, 1, 0, 2.2, { mode: "sit", expr: "pained", look: 0, headTilt: 12 * Math.sin(lt * 7) }, { y: 0.3 });
    } },
  // 84 "Mas as investigações históricas posteriores confirmaram sua atuação independente." — o arquivo, o carimbo
  { t0: 446.05, fade: 0.3, L: () => roomL("r84", "#9a8a6e", { win: true, frames: 2 }), cam: mv([0, 1.4, -3.0, 38], [0.3, 1.4, -2.4, 34]), lite: { ...DAY, rdx: 1 }, act: (A, lt, u, T) => {
      A.sp("desk", 0, 0, 1.6, { sc: 1 }); for (let i = 0; i < 6; i++) A.sp("doc", -1 + i * 0.35, 0.82 + (i % 3) * 0.02, 1.5, { sc: 0.7 });
      A.a(v(civ(3, 40), { glasses: true, hat: "hair", hair: "#8a8a8a" }), 841, 0.2, 2.0, { mode: "sit", expr: "neutral", look: -0.3, prop: ["paper", 1] }, { y: 0.3 }); sunbeam(A, 1.5, 3, 4, 0.2);
      A.over((g) => { caption(g, "INVESTIGAÇÕES HISTÓRICAS", T - 446.4, 2.4); if (T > 449.9) stamp(g, "AGIU SOZINHO", T - 449.9, VW * 0.7, VH * 0.3, -0.14, 90, "#2a7a3a"); });
    } },
  // 85a "E enquanto o mundo mergulhava cada vez mais profundamente na Segunda Guerra Mundial," — bombardeiros e tanques
  { t0: 451.44, fade: 0.25, L: () => loc(["#2a1e2a", "#c0603a"], { near: "#4a3a2e", far: "#6a5040", kind: "mud", seed: 85, zFar: 400 }, [clouds("w85", 240, ["#e08a5a", "#3a2a3a"], 5, 30, 90, 16, 4), hillL("w85", 140, "#3a2a30", 5, 12, 2), skyline("w85", 90, "#2a1e22", "stalingrad", 9, 1.5)]),
    cam: mv([0, 2, -8, 44, 10], [0, 2.4, -10, 46, -10]), lite: NIGHTFIRE, bloom: 0.8, kicks: [[453.4, 8], [455.6, 10]], act: (A, lt, u, T) => {
      for (let i = 0; i < 6; i++) plane(A, "he111", -50 + i * 11 + lt * 14, 26 + (i % 2) * 4, 120 + i * 8, { sc: 1 });
      tank(A, "panzer", -12 + lt * 2.6, 12, { vel: 2.6, fire: T - 454.0 }); tank(A, "t34", 14 - lt * 2.6, 16, { vel: 2.6, dir: -1, fire: T - 455.2 });
      for (const [at, x, z, s] of [[453.4, 6, 30, 3.5], [455.6, -6, 24, 4]] as number[][]) A.fx(z, (g, c) => blast(g, c, T - at, x, 0, z, s, x));
    } },
  // 85b "Elser permanecia preso." — a cela
  { t0: 456.68, fade: 0.25, L: () => cellL("c85", "#8a98a8"), cam: mv([0, 1.5, -3.2, 40], [0.2, 1.5, -2.6, 36]), lite: COLD, act: (A, lt) => { cellShot(A, lt, { sit: true }); A.sp("bars", 0, 0, 0.9, { sc: 0.5 }); } },
  // 86a "A Alemanha invadiu outros países," — mapa com setas
  { t0: 459.04, fade: 0.2, L: () => mapL("m86", "rust"), cam: mv([MX(14), MY(50), -36, 42], [MX(14), MY(50), -40, 44]), act: (A, lt, u, T) => {
      hl(A, "GER", 1, "#4a3a30", 0.6); for (const [k, at] of [["POL", 459.9], ["FR", 460.2], ["NOR", 460.4], ["NLD", 460.5], ["BEL", 460.55], ["DEN", 460.6], ["USSR", 460.8]] as [string, number][]) hl(A, k, (T - at) / 0.5, "#9a2a1e", 0.4);
      arrow(A, [13.4, 52.5], [21, 52.2], (T - 459.9) / 0.6, "#8a1e16"); arrow(A, [8, 50], [2.3, 48.8], (T - 460.2) / 0.6, "#8a1e16"); arrow(A, [20, 53], [30.5, 52.5], (T - 460.8) / 0.6, "#8a1e16");
    } },
  // 86b "milhões de pessoas morreram" — um mar de velas
  { t0: 460.98, fade: 0.25, L: () => loc(undefined, { near: "#0e0a0a", far: "#120c0c", kind: "stone", zFar: 30 }, [], true), cam: mv([0, 1.2, -3, 40, -40], [0, 1.4, -2, 40, -60]), lite: LAMP, act: (A, lt) => {
      for (let i = 0; i < 110; i++) { const x = (hash(i) - 0.5) * 16, z = 0.5 + hash(i * 3) * 14; A.sp("candle", x, 0, z, { sc: 1 }); A.fx(z - 0.01, (g, c) => { const [sx, sy, s] = P(c, x, 0.4 + 0.01 * Math.sin(lt * 9 + i), z); glow(g, sx, sy, 0.35 * s, "rgba(255,190,100,1)", 0.7); g.fillStyle = "#fff2c0"; g.beginPath(); g.ellipse(sx, sy, 0.02 * s, 0.05 * s, 0.1 * Math.sin(lt * 7 + i), 0, 7); g.fill(); }); }
    } },
  // 86c "e o regime nazista continuou espalhando destruição pela Europa." — cidade em chamas
  { t0: 462.73, fade: 0.25, L: () => loc(["#140a10", "#8a3a1e"], { near: "#2e2420", far: "#4a3a2e", kind: "rubble", seed: 86, zFar: 300 }, [skyline("w86", 160, "#1a1216", "stalingrad", 7, 2.5), city("w86", 40, { pal: ["#4a3a34", "#3e3430"], seed: 86, ruin: true, blur: 1.2 })]),
    cam: mv([-2, 2, -8, 44], [2, 2.2, -7, 42]), lite: NIGHTFIRE, bloom: 0.8, act: (A, lt) => {
      for (const [x, z, s] of [[-14, 40, 3], [9, 30, 2.6], [24, 55, 3.2], [-2, 70, 3]] as number[][]) { A.fx(z, (g, c) => fire(g, c, lt, x, 0, z, s, x)); A.fx(z + 0.5, (g, c) => smokeCol(g, c, lt, x, s * 2, z + 0.5, { h: 40, w: 5, col: [36, 30, 32], a: 0.75, seed: x })); }
      A.fx(18, (g, c) => embers(g, c, lt, 0, 18, 40, 70, 18, 5)); for (let i = 0; i < 5; i++) planeTop(A, "he111", -40 + i * 14 + lt * 20, 26, 80 + i * 6, { head: Math.PI / 2, dark: 0.75 });
    } },
  // 87a "O homem que havia tentado impedir aquela catástrofe" — ele olha a janela da cela
  { t0: 467.52, fade: 0.3, L: () => cellL("c87"), cam: mv([0.6, 1.6, -2.8, 38], [0.5, 1.7, -2.2, 34]), lite: COLD, act: (A, lt) => cellShot(A, lt, { expr: "sad" }) },
  // 87b "não conseguiu sequer acompanhar o fim da guerra em liberdade." — as grades
  { t0: 470.68, fade: 0.2, L: () => cellL("c87"), cam: mv([0, 1.6, -1.6, 36], [0, 1.6, -1.2, 32]), lite: COLD, act: (A, lt) => { cellShot(A, lt, { sit: true }); A.sp("bars", 0, 0, 0.6, { sc: 0.55 }); } },
  // 88 "Durante anos, permaneceu sob custódia nazista." — as estações passam pela janela
  { t0: 474.59, fade: 0.25, L: () => cellL("c88", "#c8d4e0"), cam: mv([0, 1.8, -2.6, 38], [0, 1.9, -2.0, 34]), lite: COLD, act: (A, lt, u, T) => {
      cellShot(A, lt, { sit: true, expr: "sad" }); const yrs = ["1940", "1941", "1942", "1943", "1944"], i = Math.min(4, Math.floor(lt / 0.65));
      A.over((g) => { g.save(); g.font = `bold 120px "DejaVu Serif", serif`; g.textAlign = "center"; g.fillStyle = "rgba(246,239,224,0.85)"; g.strokeStyle = "rgba(10,6,6,0.8)"; g.lineWidth = 10; g.strokeText(yrs[i], VW * 0.25, VH * 0.3); g.fillText(yrs[i], VW * 0.25, VH * 0.3); g.restore(); });
      if (i % 2 === 0) A.over((g) => weather(g, lt, "snow", 90, 0.35));
    } },
  // 89a "Até que, em abril de 1945," — Berlim em ruínas
  { t0: 478.15, fade: 0.3, L: () => loc(["#5a5a64", "#b8a898"], { near: "#5a5048", far: "#7a6e60", kind: "rubble", seed: 89, zFar: 300 }, [skyline("w89", 150, "#4a4448", "berlin", 4, 2), city("w89", 40, { pal: ["#6a5e54", "#5a5048"], seed: 89, ruin: true, blur: 1.2 })]),
    cam: mv([0, 1.8, -8, 44], [1, 2.0, -7, 42]), lite: GREY, act: (A, lt, u, T) => {
      A.fx(60, (g, c) => smokeCol(g, c, lt, 10, 4, 60, { h: 40, w: 6, col: [70, 66, 66], a: 0.6, seed: 4 })); A.over((g) => caption(g, "ABRIL DE 1945", T - 478.5, 2.6));
      for (let i = 0; i < 3; i++) A.a(v(civ(i, 89), {}), 891 + i, -3 + i * 2.6, 4 + i, { expr: "sad", look: 0.3 }, { dark: 0.2 });
    } },
  // 89b "quando o regime de Hitler estava praticamente derrotado," — os tanques aliados avançam
  { t0: 480.93, fade: 0.2, L: () => loc(["#5a5a64", "#b8a898"], { near: "#5a5048", far: "#7a6e60", kind: "rubble", seed: 90, zFar: 300 }, [skyline("w89b", 150, "#4a4448", "berlin", 6, 2), city("w89b", 40, { pal: ["#6a5e54", "#5a5048"], seed: 90, ruin: true, blur: 1.2 })]),
    cam: mv([-2, 1.4, -8, 44], [1, 1.4, -7, 42]), lite: GREY, act: (A, lt) => { tank(A, "t34", -12 + lt * 2.4, 10, { vel: 2.4 }); tank(A, "t34", -20 + lt * 2.4, 14, { vel: 2.4 }); } },
  // 89c "chegou o último capítulo de sua história." — na cela, a luz diminui
  { t0: 484.48, fade: 0.3, L: () => cellL("c89", "#a8b0bc"), cam: mv([0, 1.6, -3.0, 38], [0, 1.6, -2.4, 34]), lite: COLD, mood: ["#4a4a5a", 0.15], act: (A, lt) => cellShot(A, lt, { sit: true, expr: "neutral", beam: 1 - lt * 0.2 }) },
  // 90a "No dia 9 de abril de 1945,"
  { t0: 487.81, fade: 0.25, L: () => roomL("r90", "#6a6058"), cam: mv([0, 1.5, -3.6, 36], [0, 1.5, -3.1, 32]), lite: GREY, act: (A) => { calPage(A, 0, 2.0, 1.2, "ABRIL", "9", "1945"); } },
  // 90b "Georg Elser foi assassinado no campo de concentração de Dachau." — o portão ao amanhecer cinzento; uma luz se apaga
  { t0: 491.43, fade: 0.35, L: () => loc(["#3a3e4a", "#9a9a9e"], { near: "#4a4a48", far: "#6a6a66", kind: "stone", seed: 90, zFar: 200 }, [clouds("d90", 260, ["#b8b8bc", "#4a4e5a"], 3, 30, 90, 22, 5), forest("d90", 90, "pine", "#2a302a", 26, 5, { blur: 2, h: 14 })]),
    cam: mv([0, 2, -14, 44, -10], [0, 2.2, -10, 42, -10]), lite: GREY, sat: 0.5, act: (A, lt, u, T) => {
      A.sp("gate", 0, 0, 30, { sc: 1 }); A.sp("tower", -16, 0, 26, { sc: 1 }); A.sp("tower", 18, 0, 28, { sc: 1 });
      A.fx(12, (g, c) => { for (let x = -30; x < 30; x += 3) { const [ax, ay, s] = P(c, x, 0, 12), [, by] = P(c, x, 2.4, 12); g.strokeStyle = "#2a2624"; g.lineWidth = 0.06 * s; g.beginPath(); g.moveTo(ax, ay); g.lineTo(ax, by); g.stroke(); } for (let k = 0; k < 5; k++) { const [ax, ay] = P(c, -30, 0.4 + k * 0.45, 12), [bx, by] = P(c, 30, 0.4 + k * 0.45, 12); g.strokeStyle = "rgba(30,28,28,0.8)"; g.lineWidth = 1.5; g.beginPath(); g.moveTo(ax, ay); g.lineTo(bx, by); g.stroke(); } });
      const off = clamp((T - 492.35) / 0.6); A.sp("candle", 0, 0, 6, { sc: 1.3 }); A.fx(5.99, (g, c) => { const [sx, sy, s] = P(c, 0, 0.72, 6); glow(g, sx, sy, 0.8 * s, "rgba(255,190,100,1)", 0.8 * (1 - off)); if (off < 1) { g.fillStyle = `rgba(255,242,192,${1 - off})`; g.beginPath(); g.ellipse(sx, sy, 0.04 * s, 0.1 * s, 0, 0, 7); g.fill(); } if (off > 0 && off < 1) puff(g, sx, sy - off * 0.6 * s, 0.25 * s, [200, 200, 200], 0.4 * (1 - off)); });
      A.over((g) => caption(g, "DACHAU · 9 DE ABRIL DE 1945", T - 493.4, 1.9));
    } },
  // 91 "Faltavam poucas semanas para o fim da guerra na Europa." — o calendário corre até 8 de maio
  { t0: 495.31, fade: 0.25, L: () => roomL("r90", "#6a6058"), cam: mv([0, 1.5, -3.4, 36], [0, 1.5, -3.0, 34]), lite: GREY, act: (A, lt, u, T) => {
      const days = [["ABRIL", "9"], ["ABRIL", "16"], ["ABRIL", "23"], ["ABRIL", "30"], ["MAIO", "8"]], i = Math.min(4, Math.floor(Math.max(0, T - 495.8) / 0.4)); calPage(A, 0, 2.0, 1.2, days[i][0], days[i][1], "1945");
      A.over((g) => { if (i === 4) bigText(g, "FIM DA GUERRA NA EUROPA", T - 497.5, 1.8, VH * 0.12, 70); });
    } },
  // 92 "Ele morreu sem ver a derrota do regime que havia tentado destruir." — a cela vazia, a luz some
  { t0: 499.12, fade: 0.35, L: () => cellL("c92", "#a8b0bc"), cam: mv([0, 1.6, -3.2, 38], [0, 1.6, -2.6, 34]), lite: COLD, mood: ["#3a3a4a", 0.25], act: (A, lt) => { cellShot(A, lt, { who: false, beam: 1 - clamp(lt / 3.5) }); } },
  // 93 "Sem saber que Hitler também estava próximo do fim." — Hitler sozinho no bunker
  { t0: 503.54, fade: 0.3, L: () => roomL("r93", "#4a4a46", { dark: 0.35 }), cam: mv([0, 1.3, -3.4, 40], [0, 1.3, -2.6, 36]), lite: { ...LAMP, rdx: -1 }, mood: ["#3a3a3a", 0.25], act: (A, lt) => {
      A.sp("desk", 0, 0, 1.8, { sc: 1 }); A.a(HIT_OLD, 931, 0, 2.2, { mode: "sit", expr: "sad", headTilt: 16, look: -0.4 }, { y: 0.55 });
      const fl = 0.7 + 0.3 * Math.sin(lt * 23) * Math.sin(lt * 7); A.light((g) => { const [sx, sy, s] = P(A.cam, 0, 2.9, 2.0); glow(g, sx, sy, 2.6 * s, "rgba(255,220,160,1)", 0.55 * fl); });
      A.over((g) => caption(g, "BERLIM · 30 DE ABRIL DE 1945", lt - 0.4, 2.4));
    } },
  // 94 "E sem receber, durante sua vida, o reconhecimento que sua história merecia." — a oficina vazia, poeira na luz
  { t0: 507.18, fade: 0.3, L: () => shopL("o94"), cam: mv([0.5, 1.4, -2.6, 40], [0.1, 1.35, -2.0, 36]), lite: { ...DAY, rdx: 1 }, sat: 0.7, act: (A, lt) => {
      bench(A, 0, 2.25, { plank: 1 }); A.sp("chair2", 1.2, 0, 2.4, { sc: 1 }); sunbeam(A, 2.7, 3, 6, 0.24);
      A.fx(2, (g, c) => { for (let i = 0; i < 26; i++) { const x = 0.5 + hash(i) * 2.5 + Math.sin(lt * 0.4 + i) * 0.1, y = 0.6 + ((hash(i * 3) + lt * 0.03) % 1) * 2.4, [sx, sy, s] = P(c, x, y, 2 + hash(i * 7)); g.fillStyle = "rgba(255,240,200,0.6)"; g.beginPath(); g.arc(sx, sy, 0.008 * s, 0, 7); g.fill(); } });
    } },
  // 95 "Hoje, Georg Elser é lembrado como um dos grandes nomes da resistência alemã contra o nazismo." — o memorial de perfil em Berlim, à noite
  { t0: 512.68, fade: 0.35, L: () => streetL("s95", { night: true, seed: 95 }), cam: dinT(512.68, [0, 1.6, -5, 42, 10], [[515.1, [0, 1.5, -9, 48, 110]]]), lite: { ...MOON, rim: "#ffe0a8" }, bloom: 0.8, act: (A, lt, u, T) => {
      panel(A, 6, (w) => { w.g.scale(0.5, 0.5); const pts: [number, number][] = [[-0.3, 0], [0.3, 0], [0.32, 6], [0.9, 6.6], [1.25, 7.6], [1.5, 8.4], [1.62, 9.1], [1.9, 9.4], [1.62, 9.6], [1.55, 10.0], [1.25, 10.9], [0.7, 11.6], [0.0, 11.8], [-0.7, 11.5], [-1.1, 10.8], [-1.2, 9.6], [-0.95, 8.6], [-0.65, 7.6], [-0.5, 6.4], [-0.32, 6]];
        w.poly(pts, w.vgrad(0, 12, "#8a8e96", "#d8dce4"), 2.5); for (let k = 0; k < 14; k++) w.ell(0, 0.4 + k * 0.82, 0.05, 0.05, "#fff0c0", 0); });
      A.light((g) => { for (let k = 0; k < 14; k++) { const [sx, sy, s] = P(A.cam, 0, 0.2 + k * 0.41, 6); glow(g, sx, sy, 0.3 * s, "rgba(255,220,150,1)", 0.6); } });
      crowd(A, 8, -5, 5, 2.4, 4.0, 95, (i) => ({ expr: "sad", look: 0, headTilt: -10, prop: i % 2 ? ["torch", 0.6] : undefined }), (i) => civ(i, 95), { dark: 0.45, darkCol: "#0a0a14" });
      A.over((g) => caption(g, "BERLIM · MEMORIAL GEORG ELSER", T - 513.0, 2.6));
    } },
  // 96 "E existe uma pergunta que continua intrigando historiadores:" — historiadores sobre livros; um "?"
  { t0: 518.91, fade: 0.3, L: () => roomL("r96", "#7a5a3a", { frames: 3 }), cam: mv([0, 1.4, -3.2, 40], [0.2, 1.4, -2.6, 36]), lite: LAMP, act: (A, lt, u, T) => {
      A.sp("desk", 0, 0, 1.6, { sc: 1 }); A.sp("lamp", -1, 0.78, 1.55, { sc: 0.6 }); A.a(v(civ(3, 40), { glasses: true, hat: "hair", hair: "#8a8a8a" }), 961, -0.4, 2.1, { mode: "sit", expr: "nervous", look: 0.4, prop: ["book", 1] }, { y: 0.3 });
      A.a(v(civ(1, 41), { glasses: true }), 962, 0.8, 2.3, { expr: "neutral", look: -0.6, headTilt: 10 }); A.over((g) => bigText(g, "?", T - 520.8, 1.6, VH * 0.3, 220, "#ffd060"));
      A.light((g) => { const [sx, sy, s] = P(A.cam, -1, 1.3, 1.55); glow(g, sx, sy, 2 * s, "rgba(255,210,140,1)", 0.7); });
    } },
  // 97 "O que teria acontecido se Hitler tivesse morrido naquela noite de novembro de 1939?" — o púlpito; Hitler some como fumaça
  { t0: 522.67, fade: 0.3, L: () => hallL("h9", { dark: 0.3 }), cam: dinT(522.67, [0.3, 2.2, 6, 42, -10], [[524.1, [0.5, 1.9, 10.4, 36, -5]]]), lite: LAMP, sat: 0.55, act: (A, lt, u, T) => {
      const k = clamp((T - 524.8) / 1.4); hall(A, lt, { dark: 0.3, full: 1.1, noCrowdRows: [4], col: { xray: 0.5 + 0.3 * Math.sin(lt * 6), bomb: true } });
      A.a(HIT, 900, -0.05, PZ + 0.3, { expr: "shout", prop: ["fist", 1] }, { y: 0.45, alpha: 1 - k });
      if (k > 0) A.fx(PZ + 0.2, (g, c) => { for (let i = 0; i < 8; i++) { const [sx, sy, s] = P(c, -0.05 + (hash(i) - 0.5) * 0.6, 1.4 + k * (1 + hash(i + 3) * 2), PZ + 0.2); puff(g, sx, sy, (0.2 + k * 0.5) * s, [200, 196, 190], 0.4 * (1 - k)); } });
      A.over((g) => bigText(g, "E SE...?", T - 523.4, 3.6, VH * 0.14, 90, "#ffd060"));
    } },
  // 98 "A Segunda Guerra Mundial teria sido evitada?" — os tanques se desfazem num campo de girassóis
  { t0: 528.87, fade: 0.35, L: () => loc(["#4a5a7a", "#f0c898"], { near: "#6a7048", far: "#9aa070", kind: "grass", seed: 98, zFar: 300 }, [clouds("o98", 240, ["#f4e0c8", "#5a6080"], 8, 30, 90, 20, 4), mtn("o98", 220, "#6a7a96", 4, 50, true, 3), field("o98", 14, "sunflower", "#e8b830", 5, 1.1, 30, 0.3)]),
    cam: mv([0, 1.4, -6, 42], [0, 1.6, -7, 44]), lite: GOLD, bloom: 0.8, act: (A, lt, u, T) => {
      const k = clamp((T - 530.1) / 1.0); if (k < 1) { A.fx(12.5, (g) => { g.save(); g.globalAlpha = 1 - k; }); tank(A, "panzer", -4 + lt * 1.5, 12, { vel: 1.5 }); A.fx(11.5, (g) => g.restore()); }
      A.light((g) => { sun(g, VW * 0.5, VH * 0.32, 40, "255,226,170"); rays(g, VW * 0.5, VH * 0.32, VW, 0.08 + 0.1 * k, "255,214,160", 20, lt); });
    } },
  // 99 "O regime nazista teria sobrevivido sem seu principal líder?" — as faixas vermelhas caem
  { t0: 531.41, fade: 0.25, L: () => streetL("s99", { seed: 99 }), cam: mv([0, 2.4, -7, 44, -20], [0, 2.6, -6, 42, -30]), lite: GREY, act: (A, lt, u, T) => {
      for (let i = 0; i < 5; i++) panel(A, 10, (w) => { const k = T - 532.5 - i * 0.25, y = k > 0 ? -0.5 * 9.81 * Math.min(k, 1.2) ** 2 : 0, rot = k > 0 ? Math.min(0.8, k * 1.2) * (i % 2 ? 1 : -1) : 0; w.g.save(); w.g.translate(-8 + i * 4, 10 + y); w.g.rotate(rot); w.rect(-0.8, -5, 1.6, 5, "#b3221c", 2.5); w.ell(0, -1.6, 0.5, 0.5, "#f4efe6", 2); w.poly([[-0.35, -1.5], [0, -1.25], [0.35, -1.5], [0, -1.95]], "#1a1414", 0); w.g.restore(); });
      crowd(A, 9, -7, 7, 2, 3.5, 99, () => ({ expr: "nervous", look: 0, headTilt: -10 }), (i) => civ(i, 99));
    } },
  // 100 "Milhões de pessoas poderiam ter sido poupadas?" — famílias à luz dourada
  { t0: 535.29, fade: 0.3, L: () => streetL("s100", { seed: 100, dusk: true }), cam: mv([0, 1.6, -6, 42], [0, 1.7, -8, 46]), lite: GOLD, bloom: 0.8, act: (A, lt) => {
      crowd(A, 24, -9, 9, 1.5, 6, 100, (i) => ({ expr: i % 2 ? "smile" : "laugh", look: 0, prop: i % 7 === 0 ? ["baby", 1] : undefined }), (i) => (i % 4 === 0 ? kid(i, 100) : civ(i, 100)));
      A.light((g) => { sun(g, VW * 0.12, VH * 0.4, 50, "255,200,140"); rays(g, VW * 0.12, VH * 0.4, VW, 0.12, "255,190,130", 16, lt); });
    } },
  // 101 "Não existe uma resposta definitiva." — a estrada no nevoeiro
  { t0: 538.59, fade: 0.35, L: () => roadL("r101"), cam: mv([0, 1.5, -4, 42], [0, 1.5, -2.5, 40]), lite: BACK, mood: ["#8a8a9a", 0.15], act: (A, lt) => { A.light((g) => { g.fillStyle = "rgba(200,200,210,0.35)"; g.fillRect(0, 0, VW, VH); }); } },
  // 102 "Mas existe algo que jamais poderá ser ignorado." — a silhueta dele contra a luz
  { t0: 540.99, fade: 0.3, L: () => roadL("r101"), cam: mv([0, 1.5, -2.8, 38], [0, 1.6, -2.2, 34]), lite: BACK, bloom: 0.8, act: (A, lt) => { A.a(ELSER, 1, 0, 2, { expr: "stern", look: 0 }, { dark: 0.6, darkCol: "#140c10" }); A.light((g) => { sun(g, VW * 0.5, VH * 0.48, 34, "255,210,160"); rays(g, VW * 0.5, VH * 0.48, VW, 0.15, "255,200,150", 18, lt); }); } },
  // 103a "Um simples carpinteiro conseguiu chegar" — na bancada
  { t0: 544.42, fade: 0.25, L: () => shopL("o3"), cam: mv([-0.6, 1.4, -3.2, 40], [0.1, 1.35, -2.2, 34]), lite: { ...DAY, rdx: 1, key: "#ffe8c8", ka: 0.12 }, bloom: 0.6, act: (A, lt) => { elserBench(A, lt); sunbeam(A); } },
  // 103b "a poucos minutos de eliminar Adolf Hitler." — o relógio
  { t0: 546.73, fade: 0.2, L: () => hallL("h5"), cam: mv([0.6, 1.9, 9.6, 38, -5], [0.8, 1.85, 10.8, 32, -5]), lite: LAMP, bloom: 0.6, act: (A, lt, u, T) => {
      hall(A, lt, { full: 1.1, hitler: T < 548.6 ? "shout" : null, noCrowdRows: [4], col: { xray: 0.6, bomb: true } }); if (T >= 548.6) A.a(HIT, 900, -0.05 + (T - 548.6) * 1.5, PZ + 0.3, { expr: "stern" }, { y: 0.45 });
      A.over((g) => clockOver(g, 21, 7 + 13 * smooth(clamp((T - 547.3) / 1.6)), T - 547.0, 2.3, { red: true, r: 130, x: VW * 0.8, y: VH * 0.34 }));
    } },
  // 104 "Ele não tinha poder político, não comandava soldados e não possuía uma estrutura militar." — sozinho na estrada
  { t0: 550.23, fade: 0.3, L: () => roadL("r104"), cam: dinT(550.23, [0, 1.5, -2.6, 36], [[552.25, [0, 2.6, -8, 42, -20]], [554.25, [0, 4.5, -16, 46, -60]]]), lite: BACK, bloom: 0.8, act: (A, lt) => {
      A.a(ELSER_C, 1, 0, 1.4, { expr: "stern", look: 0 }); A.light((g) => { sun(g, VW * 0.5, VH * 0.5, 30, "255,200,150"); rays(g, VW * 0.5, VH * 0.5, VW * 0.8, 0.12, "255,190,140", 16, lt); });
    } },
  // 105 "Tinha apenas uma convicção: precisava fazer alguma coisa antes que fosse tarde demais." — ele caminha para o nascer do sol
  { t0: 555.86, fade: 0.3, L: () => roadL("r105", true), cam: (u, lt) => ({ x: 0, y: 1.5, z: -3.6 + lt * 0.9, fov: 40, shift: 0 }), lite: BACK, bloom: 0.85, act: (A, lt) => {
      walkF(A, ELSER_C, 1, lt, 0, 6, [0, 0.8], [0, 6.2], { expr: "stern" }, { dark: 0.55, darkCol: "#1a1018" });
      A.light((g) => { sun(g, VW * 0.5, VH * 0.46, 40, "255,214,170"); rays(g, VW * 0.5, VH * 0.46, VW, 0.16, "255,206,160", 20, lt); lensFlare(g, VW * 0.5, VH * 0.46, 0.5); });
    } },
  // 106 "E, naquela noite, treze minutos fizeram toda a diferença." — o relógio e o salão
  { t0: 562.14, fade: 0.3, L: () => dark(), cam: mv([0, 0, -6, 40], [0, 0, -5, 38]), lite: LAMP, act: (A, lt, u, T) => {
      mechanism(A, 0, lt, { tick: true, light: 0.3 }); const m = 7 + 13 * smooth(clamp((T - 563.4) / 1.5)); A.over((g) => { clockOver(g, 21, m, lt, 4.0, { red: true, r: 180, y: VH * 0.4 }); bigText(g, "13 MINUTOS", T - 563.4, 2.7, VH * 0.86, 100, "#ffd060"); });
    } },
  // 107 "O nome dele era Georg Elser."
  { t0: 566.29, fade: 0.3, L: () => shopL("o3"), cam: mv([0.4, 1.75, -2.0, 36], [0.3, 1.75, -1.4, 32]), lite: { ...DAY, rdx: 1, key: "#ffe8c8", ka: 0.12 }, bloom: 0.7, act: (A, lt, u, T) => {
      A.a(ELSER_W, 1, 0.3, 1.6, { expr: "smile_closed", look: -0.2, headTilt: 4 }); sunbeam(A, 2.7, 3, 6, 0.22);
      A.over((g) => bigText(g, "GEORG ELSER", T - 567.6, 3.6, VH * 0.16, 110, "#f6efe0", "1903 – 1945"));
    } },
  // 108 "O homem que quase matou Hitler." — a fachada à noite, título final
  { t0: 568.91, fade: 0.3, L: () => hallOutL("hn"), cam: mv([0, 2.6, -6, 44, -60], [0, 2.8, -8, 46, -60]), lite: MOON, bloom: 0.8, act: (A, lt, u, T) => {
      for (const x of [-8, 8]) { A.sp("lamp", x, 0, 9, { sc: 1.6 }); A.light((g) => { const [sx, sy, s] = P(A.cam, x, 3.4, 9); glow(g, sx, sy, 2.6 * s, "rgba(255,200,120,1)", 0.6); }); }
      A.over((g) => bigText(g, "O HOMEM QUE QUASE MATOU HITLER", T - 569.2, 3, VH * 0.84, 72, "#ffd060"));
    } },
];
