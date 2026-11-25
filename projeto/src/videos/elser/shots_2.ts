// 153 – 305 s: o plano, a pedreira, as 30 noites escondido na coluna, a bomba, o 8 de novembro e a saída antecipada.
import type { Shot } from "../ww2/types";
import { loc, wall, clouds, hillL, forest, city, skyline, MX, MY } from "../ww2/places";
import { LAMP, NIGHTFIRE, DAY, GOLD, BACK, GREY, MOON } from "../ww2/looks";
import { walkS, walkF, crowd, hl, arrow, pin, calPage, panel, hand, counter, civ, v, GESTAPO, kid } from "../ww2/kit";
import { blast, dust, rubble } from "../ww2/fx";
import { stamp, tint } from "../ww2/engine";
import { pancada } from "../fisica";
import { hallL, hallOutL, streetL, shopL, roomL, cellL, mapL, mv, clockOver, column, mechanism, wallClock, podium, chandeliers, torchBeam, mapLabel,
  ELSER, ELSER_W, ELSER_C, HIT, HIMMLER, GOERING, HESS, PARTY, WAITER, WAITRESS, caption, bigText, P, glow, puff, VW, VH, clamp, lerp, smooth, easeOut, hash, mix, din, dinT, soco } from "./ek";
import { hall, elserBench, sunbeam, leaders, CX, CZ, PZ } from "./scenes";

const dark = () => loc(undefined, { near: "#120c08", far: "#120c08", kind: "none", zFar: 4 }, [], true);
const COLDL = { sx: 0.5, sy: 0.25, sa: 0.28, rim: "#e0f0ff", ra: 0.6, rdx: 0.8, rdy: -0.8, key: "#c8d8ec", ka: 0.18 };
const NIGHT = { ...MOON, rim: "#ffe0a8", key: "#7080a8", ka: 0.35 };
/** Elser ajoelhado na base da coluna, à luz da lanterna, cinzelando */
const chisel = (A: import("../ww2/kit").Sc, lt: number, T: number, o: { dug?: number; expr?: import("../ww2/kit").FO["expr"]; freeze?: boolean; open?: number; bomb?: boolean } = {}) => {
  column(A, CX, CZ, { dark: 0.4, lt, dug: o.dug ?? 0.5, open: o.open, bomb: o.bomb });
  const hit = o.freeze ? 0.2 : ((lt * 1.6) % 1) < 0.2 ? 1 : 0.2;
  A.a(ELSER_W, 1, CX - 0.95, CZ - 0.6, { expr: o.expr ?? "stern", crouch: 0.75, prop: ["hammer", hit], look: 1, facing: 1, headTilt: 12 }, { dark: 0.35, darkCol: "#140c08" });
  torchBeam(A, CX - 0.5, 0.35, CZ - 0.9, -0.2, 1.4, 0.32);
  if (!o.freeze) A.fx(CZ - 0.7, (g, c) => { for (let i = 0; i < 6; i++) { const a = (lt * 1.6 + hash(i)) % 1; if (a > 0.5) continue; const [sx, sy, s] = P(c, CX - 0.3 + a * 0.6 * (hash(i + 2) - 0.3), 0.8 + a * 0.5 - a * a * 2.5, CZ - 0.7); g.fillStyle = "#c8b494"; g.fillRect(sx, sy, 0.03 * s, 0.03 * s); } });
};
const nightHall = (A: import("../ww2/kit").Sc, lt: number, o: Parameters<typeof hall>[2] = {}) => hall(A, lt, { dark: 0.85, empty: true, tablesMaxZ: 7.5, ...o });

export const SHOTS_2: Shot[] = [
  // 25a "Se Hitler aparecia todos os anos no mesmo lugar," — o púlpito vazio; os anos se empilham
  { t0: 152.86, fade: 0.25, L: () => hallL("h2", { banner: false }), cam: mv([0, 2.0, 7.5, 40, -10], [0, 2.0, 9.0, 38, -10]), lite: DAY, act: (A, lt, u, T) => {
      hall(A, lt, { empty: true }); ["1934", "1935", "1936", "1937", "1938"].forEach((y, i) => A.over((g) => { const t = T - 153.3 - i * 0.4; if (t < 0) return; g.save(); g.globalAlpha = clamp(t / 0.2) * 0.9; g.font = `bold 64px "DejaVu Sans", sans-serif`; g.textAlign = "center"; g.fillStyle = "#f6efe0"; g.strokeStyle = "rgba(10,6,6,0.85)"; g.lineWidth = 7; const x = VW * (0.2 + i * 0.15), yy = VH * 0.18; g.strokeText(y, x, yy); g.fillText(y, x, yy); g.restore(); }));
      ["1934", "1935", "1936", "1937", "1938"].forEach((_, i) => { const t = T - 153.3 - i * 0.4; if (t > 0) A.a(HIT, 950 + i, -0.05, PZ + 0.3, { expr: "shout", prop: ["fist", 1] }, { y: 0.45, alpha: 0.18 * clamp(t / 0.3) }); });
    } },
  // 25b "seria possível preparar um atentado" — ele estuda a coluna atrás do púlpito
  { t0: 155.68, fade: 0.2, L: () => hallL("h2", { banner: false }), cam: dinT(155.68, [-1.0, 1.6, 8.5, 42], [[157.55, [0.3, 1.7, 10.0, 38]]]), lite: DAY, act: (A, lt, u, T) => {
      hall(A, lt, { empty: true, col: { xray: clamp((T - 157.55) / 0.5) * 0.7, bomb: true, lt } });
      A.a(ELSER, 1, -0.9, 12.2, { expr: "stern", look: 1, facing: 1, headTilt: -6 });
    } },
  // 25c "sem precisar se aproximar diretamente dele." — a câmera recua do púlpito até muito longe
  { t0: 158.13, fade: 0.2, L: () => hallL("h2"), cam: mv([0, 1.9, 11, 34, -5], [0, 3.6, 0, 46, -40]), lite: LAMP, bloom: 0.7, act: (A, lt) => hall(A, lt, { hitler: "speak", col: { xray: 0.5, bomb: true } }) },
  // 26 "Mas o plano exigia paciência." — o relógio da cozinha gira, a vela derrete
  { t0: 161.31, fade: 0.25, L: () => roomL("r26", "#6a5a48", { win: true }), cam: mv([0, 1.3, -2.2, 36], [0, 1.35, -1.8, 32]), lite: LAMP, act: (A, lt, u, T) => {
      A.sp("desk", 0, 0, 1.4, { sc: 0.85 }); A.a(ELSER, 1, 0.2, 1.75, { mode: "sit", expr: "neutral", look: -0.6, headTilt: 14 }, { y: 0.3 });
      wallClock(A, -1.3, 2.2, 2.0, 9, lt * 140 % 60, 0.32);
      const hgt = 0.25 * (1 - clamp(lt / 2.2)); A.fx(1.3, (g, c) => { const [sx, sy, s] = P(c, -0.6, 0.82, 1.3); g.fillStyle = "#f4ecd8"; g.fillRect(sx - 0.03 * s, sy - hgt * s - 0.02 * s, 0.06 * s, hgt * s + 0.02 * s); glow(g, sx, sy - hgt * s - 0.06 * s, 0.4 * s, "rgba(255,190,100,1)", 0.8); });
    } },
  // 27a "Durante 1939," — a pedreira
  { t0: 163.71, fade: 0.3, L: () => quarry("q27"), cam: mv([0, 1.8, -7, 44], [1, 1.9, -6, 42]), lite: DAY, act: (A, lt, u, T) => {
      for (let i = 0; i < 4; i++) A.a(v(civ(i, 63), { hat: "cap", cap: "#4a4038" }), 271 + i, -4 + i * 2.6, 6 + (i % 2), { expr: "neutral", prop: ["hammer", ((lt * 1.3 + i * 0.3) % 1) < 0.2 ? 1 : 0.1], crouch: 0.3 });
      A.over((g) => caption(g, "1939 · PEDREIRA DE KÖNIGSBRONN", T - 164.0, 2.3));
    } },
  // 27b "Elser trabalhou para conseguir explosivos" — explosão ao longe; ele guarda cartuchos na sacola
  { t0: 166.28, fade: 0.2, L: () => quarry("q27"), cam: dinT(166.28, [-0.4, 1.4, -3, 40], [[168.0, [0.2, 1.2, -1.8, 32]]]), lite: DAY, kicks: [[166.6, 6]], act: (A, lt, u, T) => {
      A.fx(40, (g, c) => blast(g, c, T - 166.6, -10, 0, 40, 4, 3, { debris: 20 }));
      A.sp("crate", 0.9, 0, 1.6, { sc: 0.9 }); const k = clamp((T - 168.0) / 0.6);
      panel(A, 1.55, (w) => { for (let i = 0; i < 3; i++) w.rect(-0.12 + i * 0.09, 0.9 + (i === 1 ? 0.25 * k : 0), 0.06, 0.28, "#c8a060", 1.6); }, { dx: 0.9 });
      A.a(ELSER_W, 1, 0.2, 1.9, { expr: "nervous", look: 1, facing: 1, crouch: 0.3, prop: ["suitcase", 0] });
    } },
  // 27c "e desenvolveu um mecanismo de temporização." — engrenagens na bancada à noite
  { t0: 168.78, fade: 0.2, L: () => shopL("o27", { night: true }), cam: mv([0, 1.3, -1.6, 36], [0.2, 1.25, -1.0, 32]), lite: LAMP, mood: ["#4a3a5a", 0.15], act: (A, lt) => { elserBench(A, lt, 0, 1.6, { gears: true, expr: "stern" }); A.sp("lamp", -1.2, 0.95, 1.5, { sc: 0.6 }); A.light((g) => { const [sx, sy, s] = P(A.cam, -1.2, 1.45, 1.5); glow(g, sx, sy, 1.6 * s, "rgba(255,200,120,1)", 0.8); }); } },
  // 28a "Sua experiência com ferramentas e mecanismos" — close do mecanismo
  { t0: 172.02, fade: 0.2, L: () => dark(), cam: mv([0.3, 0.2, -4.4, 40], [0, 0, -3.8, 38]), lite: LAMP, act: (A, lt) => mechanism(A, 0, lt, { explo: 0 }) },
  // 28b "seria fundamental para preparar tudo."
  { t0: 174.48, fade: 0.2, L: () => shopL("o27", { night: true }), cam: mv([-1.2, 1.5, -3.2, 42], [-0.6, 1.45, -2.4, 38]), lite: LAMP, mood: ["#4a3a5a", 0.15], act: (A, lt) => { elserBench(A, lt, 0, 1.6, { gears: true, expr: "smile_closed" }); A.sp("lamp", -1.2, 0.95, 1.5, { sc: 0.6 }); A.light((g) => { const [sx, sy, s] = P(A.cam, -1.2, 1.45, 1.5); glow(g, sx, sy, 1.6 * s, "rgba(255,200,120,1)", 0.8); }); } },
  // 29a "Em agosto, mudou-se para Munique" — chega com a mala
  { t0: 177.88, fade: 0.3, L: () => streetL("s29", { seed: 51, dusk: true }), cam: mv([-2, 1.5, -5, 42], [1, 1.5, -5, 42]), lite: GOLD, act: (A, lt, u, T) => {
      walkS(A, ELSER_C, 1, lt, -3.5, 2.4, 1.3, { expr: "neutral" }); A.over((g) => caption(g, "AGOSTO DE 1939 · MUNIQUE", T - 178.1, 2.0));
      crowd(A, 5, -8, 8, 5, 7, 52, () => ({ expr: "neutral" }), (i) => civ(i, 52), { dark: 0.2 });
    } },
  // 29b "e começou a frequentar a cervejaria." — entra pela porta de dia
  { t0: 180.08, fade: 0.2, L: () => hallOutL("hd", false), cam: mv([0, 1.8, -1.5, 40, -20], [0, 2.0, 1.5, 38, -20]), lite: DAY, act: (A, lt) => walkF(A, ELSER, 1, lt, 0, 2.2, [-1.5, 8], [0, 12.5], { expr: "neutral" }) },
  // 30 "Durante o dia, observava o ambiente." — de dia, ele janta e observa
  { t0: 182.52, fade: 0.25, L: () => hallL("h2", { banner: false }), cam: dinT(182.52, [-2.5, 1.35, 3.4, 40], [[183.3, [-2.9, 1.4, 4.4, 34]]]), lite: DAY, act: (A, lt, u, T) => {
      hall(A, lt, { full: 0.3, noCrowdRows: [0, 1] }); A.a(ELSER, 1, -3.05, 6.2, { mode: "sit", expr: "neutral", look: Math.sin(lt * 1.3) * 0.9, headTilt: -4 }, { y: 0.12 });
      walkS(A, WAITRESS, 301, lt, -7, 5.6, 1.2, { expr: "smile" });
    } },
  // 31a "À noite, quando o estabelecimento fechava," — as luzes se apagam
  { t0: 185.3, fade: 0.2, L: () => hallL("h3", { dark: 0.6 }), cam: mv([0, 2.6, 2, 44, -20], [0, 2.6, 3, 42, -20]), lite: LAMP, act: (A, lt, u, T) => {
      const off = clamp((T - 186.5) / 0.6); hall(A, lt, { dark: 0.55 + 0.3 * off, empty: true }); walkS(A, WAITER, 311, lt, 4, 8, -1.0, { expr: "neutral" });
      A.light((g) => { g.fillStyle = `rgba(4,4,12,${0.45 * off})`; g.fillRect(0, 0, VW, VH); });
    } },
  // 31b "escondia-se no local" — olhos no escuro, atrás da cortina da galeria
  { t0: 188.18, fade: 0.2, L: () => hallL("h4", { dark: 0.9 }), cam: mv([-3, 4.8, 8.6, 38, -5], [-3, 4.8, 9.4, 36, -5]), lite: NIGHT, act: (A, lt) => {
      panel(A, 15.0, (w) => { w.rect(-1.6, 3.6, 3.2, 3.2, "#3a1414", 2.5); for (let k = 0; k < 7; k++) w.line([[-1.5 + k * 0.5, 3.6], [-1.5 + k * 0.5, 6.8]], 2, "rgba(0,0,0,0.3)"); }, { dx: -3 });
      A.a(ELSER, 1, -2.7, 14.9, { expr: "nervous", look: -0.6, headTilt: 6 }, { y: 3.65, dark: 0.55, darkCol: "#0a0608" });
      panel(A, 14.8, (w) => { w.rect(-1.6, 3.6, 1.7, 3.2, "#4a1a1a", 2.5); }, { dx: -3 });
    } },
  // 31c "e trabalhava discretamente em uma coluna de madeira e alvenaria"
  { t0: 189.38, fade: 0.2, L: () => hallL("h4", { dark: 0.9 }), cam: dinT(189.38, [CX - 2.6, 1.3, CZ - 8.5, 40], [[191.15, [CX - 1.2, 1.1, CZ - 6.0, 36]], [192.4, [CX - 0.6, 1.4, CZ - 7.5, 40]]]), lite: NIGHT, act: (A, lt, u, T) => { nightHall(A, lt, { podium: true }); chisel(A, lt, T, { dug: 0.2 + lt * 0.05 }); } },
  // 31d "localizada atrás do púlpito onde Hitler costumava discursar." — vista da plateia: o fantasma de Hitler diante da coluna
  { t0: 192.88, fade: 0.25, L: () => hallL("h4", { dark: 0.9 }), cam: mv([0.4, 2.0, 7.0, 40, -10], [0.6, 1.9, 9.0, 38, -10]), lite: NIGHT, act: (A, lt, u, T) => {
      nightHall(A, lt); chisel(A, lt, T, { dug: 0.4 });
      if (T > 195.3) A.a(HIT, 900, -0.05, PZ + 0.3, { expr: "shout", prop: ["fist", 1] }, { y: 0.45, alpha: 0.35 * clamp((T - 195.3) / 0.4) });
    } },
  // 32 "Foram mais de trinta noites de trabalho." — a lua passa, as noites se somam
  { t0: 197.51, fade: 0.25, L: () => hallOutL("hn"), cam: mv([0, 2.6, -6, 44, -50], [0, 2.8, -5, 44, -60]), lite: MOON, act: (A, lt, u, T) => {
      A.light((g) => { const k = (lt * 0.55) % 1, x = VW * (0.1 + 0.8 * k), y = VH * (0.25 - 0.12 * Math.sin(k * Math.PI)); glow(g, x, y, 90, "rgba(220,230,255,1)", 0.5); g.fillStyle = "#f2f0e6"; g.beginPath(); g.arc(x, y, 26, 0, 7); g.fill(); });
      A.over((g) => counter(g, Math.min(30, Math.floor(1 + clamp((T - 197.8) / 1.4) * 29)) + (T > 199.3 ? 3 : 0), "NOITES", T - 197.8, 2.2, VH * 0.72));
    } },
  // 33 "Imagine o risco que aquele homem estava correndo." — close, suor
  { t0: 200.45, fade: 0.2, L: () => hallL("h4", { dark: 0.9 }), cam: mv([CX - 1.3, 1.1, CZ - 5.2, 34], [CX - 1.1, 1.05, CZ - 4.6, 30]), lite: NIGHT, act: (A, lt, u, T) => { nightHall(A, lt); chisel(A, lt, T, { dug: 0.6, expr: "nervous" }); } },
  // 34 "Qualquer funcionário poderia encontrá-lo." — o vigia passa com o lampião; ele congela
  { t0: 203.38, fade: 0.2, L: () => hallL("h4", { dark: 0.9 }), cam: mv([CX - 1.6, 1.4, CZ - 9.5, 42], [CX - 1.2, 1.4, CZ - 9.0, 40]), lite: NIGHT, act: (A, lt, u, T) => {
      nightHall(A, lt); chisel(A, lt, T, { dug: 0.6, expr: "fear", freeze: true });
      const x = -6 + lt * 1.6; walkS(A, WAITER, 341, lt, -6, 9.0, 1.6, { expr: "neutral" }); A.light((g) => { const [sx, sy, s] = P(A.cam, x + 0.4, 1.0, 9.0); glow(g, sx, sy, 2.4 * s, "rgba(255,200,120,1)", 0.7); });
    } },
  // 35 "Qualquer barulho poderia despertar suspeitas." — o formão escapa e cai no chão
  { t0: 205.94, fade: 0.2, L: () => hallL("h4", { dark: 0.9 }), cam: soco(mv([CX - 1.4, 1.1, CZ - 5.6, 36], [CX - 1.2, 1.05, CZ - 5.0, 34]), [[0.5, 0.1]]), lite: NIGHT, kicks: [[206.45, 9]], act: (A, lt, u, T) => {
      nightHall(A, lt); chisel(A, lt, T, { dug: 0.65, expr: T > 206.45 ? "shock" : "stern", freeze: T > 206.4 });
      const k = T - 206.1; if (k > 0) { const y = Math.max(0.02, 0.9 - 0.5 * 9.81 * k * k), rot = k * 9; A.fx(CZ - 1.2, (g, c) => { const [sx, sy, s] = P(c, CX - 0.6 + k * 0.3, y, CZ - 1.2); g.save(); g.translate(sx, sy); g.rotate(y > 0.03 ? rot : 1.4); g.fillStyle = "#9a9a9e"; g.fillRect(-0.12 * s, -0.01 * s, 0.18 * s, 0.025 * s); g.fillStyle = "#6a4a2a"; g.fillRect(0.06 * s, -0.015 * s, 0.1 * s, 0.035 * s); g.restore(); }); }
      A.over((g) => { const k2 = T - 206.45; if (k2 < 0 || k2 > 0.8) return; g.save(); g.globalAlpha = 1 - k2 / 0.8; g.font = `bold 110px "DejaVu Sans", sans-serif`; g.textAlign = "center"; g.fillStyle = "#f6efe0"; g.strokeStyle = "#140a08"; g.lineWidth = 10; g.translate(VW * 0.62, VH * 0.6); g.rotate(-0.12); g.scale(1 + k2 * 0.4, 1 + k2 * 0.4); g.strokeText("CLANG!", 0, 0); g.fillText("CLANG!", 0, 0); g.restore(); });
    } },
  // 36a "E, se fosse descoberto," — sombras da Gestapo na parede
  { t0: 209.14, fade: 0.2, L: () => roomL("r36", "#3a3640", { dark: 0.3 }), cam: mv([0, 1.6, -3.4, 40], [0, 1.6, -2.8, 36]), lite: BACK, mood: ["#3a3a5a", 0.25], act: (A, lt) => {
      for (let i = 0; i < 3; i++) walkF(A, v(GESTAPO, { jacket: ["#1e1e1e", "#26262a", "#2a2420"][i] }), 361 + i, lt, 0, 2.2, [-1.2 + i * 1.2, 4.0], [-1.2 + i * 1.2, 2.4], { expr: "stern" }, { dark: 0.85, darkCol: "#050506" });
      A.light((g) => { const gr = g.createRadialGradient(VW / 2, VH * 0.2, 50, VW / 2, VH * 0.2, VW * 0.6); gr.addColorStop(0, "rgba(255,240,210,0.25)"); gr.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = gr; g.fillRect(0, 0, VW, VH); });
    } },
  // 36b "estaria nas mãos de um regime que não demonstrava piedade com seus inimigos." — a grade da cela despenca
  { t0: 211.08, fade: 0.2, L: () => cellL("c36", "#2a3040"), cam: soco(mv([0, 1.5, -2.6, 40], [0, 1.5, -2.2, 38]), [[0.75, 0.1]]), lite: COLDL, kicks: [[211.8, 12]], act: (A, lt, u, T) => {
      A.a(v(civ(4, 9), {}), 371, 0.3, 2.6, { mode: "sit", expr: "sad", headTilt: 16 }, { y: 0.0 });
      const p = pancada(T, 211.8, { queda: 0.35, amp: 0.05 }); A.sp("bars", 0, 6.5 * (1 - p.k) + p.vib, 0.8, { sc: 0.4 });
      A.fx(0.7, (g, c) => dust(g, c, T - 211.8, 0, 0.8, 1, 1.2, [120, 110, 100]));
    } },
  // 37 "Mesmo assim, continuou." — ele volta ao trabalho
  { t0: 216.16, fade: 0.25, L: () => hallL("h4", { dark: 0.9 }), cam: dinT(216.16, [CX - 2.4, 1.3, CZ - 7.5, 40], [[216.9, [CX - 1.2, 1.1, CZ - 5.2, 34]]]), lite: NIGHT, act: (A, lt, u, T) => { nightHall(A, lt); chisel(A, lt, T, { dug: 0.8, expr: "stern" }); } },
  // 38 "Pouco a pouco, preparou um espaço dentro da coluna para esconder o explosivo."
  { t0: 218.29, fade: 0.2, L: () => hallL("h4", { dark: 0.9 }), cam: dinT(218.29, [CX - 0.4, 1.3, CZ - 6.5, 38], [[220.65, [CX - 0.1, 1.35, CZ - 4.6, 34]], [221.9, [CX, 1.4, CZ - 3.8, 30]]]), lite: NIGHT, act: (A, lt, u, T) => {
      nightHall(A, lt); column(A, CX, CZ, { dark: 0.4, lt, dug: T < 221.9 ? clamp(0.8 + (T - 218.3) * 0.08) : 0, open: T > 221.9 ? 0.6 : 0, bomb: T > 221.9 });
      torchBeam(A, CX - 0.6, 0.6, CZ - 1.0, -0.1, 1.4, 0.35);
      A.a(ELSER_W, 1, CX - 0.95, CZ - 0.6, { expr: "stern", crouch: 0.7, look: 1, facing: 1, prop: T > 221.9 ? ["paper", 1] : ["hammer", ((lt * 1.6) % 1) < 0.2 ? 1 : 0.2] }, { dark: 0.35, darkCol: "#140c08" });
    } },
  // 39 "Também instalou um mecanismo de relógio que permitiria programar a detonação com antecedência." — ajusta o mostrador
  { t0: 223.18, fade: 0.2, L: () => dark(), cam: dinT(223.18, [0, 0, -4.6, 40], [[224.9, [-0.6, 0.3, -3.6, 36]], [226.2, [-0.9, 0.5, -3.3, 34]]]), lite: LAMP, act: (A, lt, u, T) => {
      mechanism(A, 0, lt, { tick: true, setTo: 2 * Math.PI * smooth(clamp((T - 226.2) / 1.0)) * 0.7 });
      A.light((g) => { const [sx, sy, s] = P(A.cam, -1.6, 1.5, 0); glow(g, sx, sy, 3 * s, "rgba(255,230,180,1)", 0.35); });
    } },
  // 40a "Seu objetivo era fazer a bomba explodir durante o discurso," — o plano desenhado sobre o salão
  { t0: 228.99, fade: 0.25, L: () => hallL("h2", { banner: false }), cam: mv([0, 2.3, 5.5, 42, -10], [0, 2.2, 7.5, 40, -10]), lite: DAY, mood: ["#4a5a7a", 0.18], act: (A, lt, u, T) => {
      hall(A, lt, { empty: true, col: { xray: 0.8, bomb: true } }); A.a(HIT, 900, -0.05, PZ + 0.3, { expr: "shout", prop: ["fist", 1] }, { y: 0.45, alpha: 0.4 });
      A.over((g) => { const k = clamp((T - 231.1) / 0.6); if (k <= 0) return; const [ax, ay] = P(A.cam, CX, 1.4, CZ), [bx, by] = P(A.cam, 0, 1.9, PZ); g.save(); g.strokeStyle = "rgba(255,80,60,0.9)"; g.lineWidth = 5; g.setLineDash([16, 12]); g.beginPath(); g.moveTo(ax, ay); g.lineTo(lerp(ax, bx, k), lerp(ay, by, k)); g.stroke(); g.restore(); });
    } },
  // 40b "exatamente quando Hitler estivesse diante dela." — o alvo se fecha sobre o púlpito
  { t0: 232.93, fade: 0.2, L: () => hallL("h2", { banner: false }), cam: dinT(232.93, [0.5, 1.9, 10.2, 38], [[234.15, [0.6, 1.85, 11.2, 32]]]), lite: DAY, mood: ["#4a5a7a", 0.18], act: (A, lt, u, T) => {
      hall(A, lt, { empty: true, noCrowdRows: [4], col: { xray: 0.8, bomb: true } }); A.a(HIT, 900, -0.05, PZ + 0.3, { expr: "shout", prop: ["fist", 1] }, { y: 0.45, alpha: 0.5 });
      A.over((g) => { const k = easeOut(clamp((T - 234.15) / 0.5)); if (k <= 0) return; const [x, y] = P(A.cam, -0.05, 1.9, PZ + 0.3); g.save(); g.strokeStyle = "rgba(230,40,30,0.9)"; g.lineWidth = 6; const r = lerp(380, 120, k); g.beginPath(); g.arc(x, y, r, 0, 7); g.stroke(); g.beginPath(); g.moveTo(x - r - 30, y); g.lineTo(x - r + 40, y); g.moveTo(x + r + 30, y); g.lineTo(x + r - 40, y); g.moveTo(x, y - r - 30); g.lineTo(x, y - r + 40); g.moveTo(x, y + r + 30); g.lineTo(x, y + r - 40); g.stroke(); g.restore(); });
    } },
  // 41 "No início de novembro, o plano estava praticamente concluído." — ele fecha a portinhola
  { t0: 236.35, fade: 0.25, L: () => hallL("h4", { dark: 0.9 }), cam: mv([CX - 0.8, 1.3, CZ - 5.6, 36], [CX - 0.4, 1.3, CZ - 4.8, 32]), lite: NIGHT, act: (A, lt, u, T) => {
      nightHall(A, lt); const op = 1 - smooth(clamp((T - 238.2) / 1.0)); column(A, CX, CZ, { dark: 0.4, lt, open: op > 0.02 ? op : 0, bomb: true });
      torchBeam(A, CX - 0.6, 0.6, CZ - 1.0, -0.1, 1.4, 0.35); A.a(ELSER_W, 1, CX - 1.0, CZ - 0.6, { expr: T > 239.4 ? "smile_closed" : "stern", crouch: 0.6, look: 1, facing: 1 }, { dark: 0.35, darkCol: "#140c08" });
      A.over((g) => caption(g, "NOVEMBRO DE 1939", T - 236.6, 2.6));
    } },
  // 42 "Agora, tudo dependia de uma única noite." — a cervejaria à noite, a câmera avança
  { t0: 240.52, fade: 0.3, L: () => hallOutL("hn"), cam: mv([0, 2.4, -8, 44, -40], [0, 2.6, -3, 40, -60]), lite: MOON, bloom: 0.8, act: (A) => { for (const x of [-8, 8]) { A.sp("lamp", x, 0, 9, { sc: 1.6 }); A.light((g) => { const [sx, sy, s] = P(A.cam, x, 3.4, 9); glow(g, sx, sy, 2.6 * s, "rgba(255,200,120,1)", 0.6); }); } } },
  // 43 "O dia 8 de novembro de 1939 chegou."
  { t0: 244.11, fade: 0.2, L: () => roomL("r43", "#8a7a64"), cam: soco(mv([0, 1.5, -3.6, 36], [0, 1.5, -3.0, 32]), [[1.4, 0.08]]), lite: LAMP, act: (A, lt, u, T) => {
      calPage(A, 0, 2.0, 1.2, "NOVEMBRO", "8", "1939", T > 244.4 ? -1 : -1); A.over((g) => bigText(g, "8 DE NOVEMBRO DE 1939", T - 245.6, 2.2, VH * 0.12, 76));
    } },
  // 44 "Naquela noite, o Bürgerbräukeller estava cheio." — da galeria, o salão lotado
  { t0: 248.51, fade: 0.25, L: () => hallL("h5"), cam: mv([-4, 4.4, -4, 50, -230], [2, 4.2, -3, 50, -210]), lite: LAMP, bloom: 0.7, act: (A, lt) => hall(A, lt, { full: 1.3, cheer: 0.4 }) },
  // 45a "Integrantes do Partido Nazista se reuniram" — chegam pela porta
  { t0: 252.19, fade: 0.2, L: () => hallOutL("hn"), cam: mv([2, 1.6, -1, 42, -10], [0, 1.7, 1, 40, -15]), lite: MOON, bloom: 0.8, act: (A, lt) => {
      for (let i = 0; i < 9; i++) walkF(A, PARTY(i + 3), 451 + i, lt - i * 0.25, 0, 3.5, [-5 + (i % 3) * 1.2 + i * 0.6, 5 + (i % 2)], [-0.5 + (i % 3) * 0.5, 10.5], { expr: i % 2 ? "grin" : "neutral" }, { dark: 0.3, darkCol: "#0a0a14" });
      for (const x of [-8, 8]) { A.sp("lamp", x, 0, 9, { sc: 1.6 }); A.light((g) => { const [sx, sy, s] = P(A.cam, x, 3.4, 9); glow(g, sx, sy, 2.6 * s, "rgba(255,200,120,1)", 0.6); }); }
    } },
  // 45b "para acompanhar o tradicional discurso de Hitler."
  { t0: 254.43, fade: 0.2, L: () => hallL("h5"), cam: mv([0, 1.4, -1.2, 40], [0, 1.5, 0.4, 38]), lite: LAMP, bloom: 0.7, act: (A, lt) => hall(A, lt, { full: 1.2 }) },
  // 46 "O líder alemão chegou e começou a falar." — atravessa até o púlpito
  { t0: 257.88, fade: 0.2, L: () => hallL("h5"), cam: dinT(257.88, [-1, 2.2, 8, 42, -10], [[259.95, [0, 1.95, 10.8, 34, -5]]]), lite: LAMP, bloom: 0.7, act: (A, lt, u, T) => {
      if (T < 259.3) { hall(A, lt, { full: 1.2, cheer: 1 }); walkS(A, HIT, 900, lt, -4.5, PZ - 0.9, 3.0, { expr: "stern" }); } else hall(A, lt, { full: 1.2, hitler: T > 259.95 ? "shout" : "speak", cheer: T < 259.9 ? 0.8 : 0 });
    } },
  // 47 "Tudo parecia acontecer conforme o planejamento de Elser."
  { t0: 260.87, fade: 0.25, L: () => hallL("h5"), cam: mv([3, 2.6, 2, 42, -20], [1.5, 2.4, 4, 40, -20]), lite: LAMP, bloom: 0.7, act: (A, lt) => hall(A, lt, { full: 1.2, hitler: "speak" }) },
  // 48 "A bomba estava escondida." — o raio-x da coluna
  { t0: 264.68, fade: 0.2, L: () => hallL("h5"), cam: mv([CX + 0.6, 1.5, CZ - 4.4, 36], [CX + 0.2, 1.4, CZ - 3.4, 32]), lite: LAMP, bloom: 0.7, act: (A, lt, u, T) => {
      hall(A, lt, { full: 1.2, hitler: "speak", noCrowdRows: [4, 3], col: { xray: clamp((T - 265.0) / 0.4) * 0.85, bomb: true } });
      A.light((g) => { const [sx, sy, s] = P(A.cam, CX, 1.4, CZ); glow(g, sx, sy, 1.4 * s, "rgba(255,80,50,1)", 0.3 * clamp((T - 265) / 0.4)); });
    } },
  // 49 "O mecanismo estava funcionando."
  { t0: 266.43, fade: 0.15, L: () => dark(), cam: mv([0, 0.2, -3.6, 36], [0.2, 0.3, -3.1, 32]), lite: LAMP, act: (A, lt) => mechanism(A, 0, lt + 30, { tick: true, setTo: 4.4 }) },
  // 50 "E Hitler estava exatamente no local que o atentado pretendia atingir."
  { t0: 268.49, fade: 0.2, L: () => hallL("h5"), cam: dinT(268.49, [0.3, 2.2, 6, 42, -10], [[269.55, [0.6, 1.9, 9.6, 38, -5]], [271.1, [0.8, 1.85, 11.0, 34, -5]]]), lite: LAMP, bloom: 0.7, act: (A, lt, u, T) => {
      hall(A, lt, { full: 1.2, hitler: "shout", noCrowdRows: T > 270.5 ? [4] : [], col: { xray: T > 271.1 ? 0.6 + 0.3 * Math.sin(lt * 8) : 0, bomb: true } });
    } },
  // 51 "Mas havia um detalhe que Elser não poderia prever." — tudo congela e perde a cor
  { t0: 273.36, fade: 0.2, L: () => hallL("h5"), cam: mv([0.2, 2.0, 10.2, 38, -5], [0.2, 2.0, 10.5, 37, -5]), lite: LAMP, sat: 0.35, mood: ["#6a6a7a", 0.3], act: (A) => hall(A, 0.3, { full: 1.2, hitler: "speak", noCrowdRows: [4] }) },
  // 52 "Naquela noite, Hitler tinha pressa." — o relógio de bolso
  { t0: 276.93, fade: 0.2, L: () => hallL("h5"), cam: dinT(276.93, [0, 1.95, 11.0, 34, -5], [[278.9, [0, 2.0, 12.4, 26, -5]]]), lite: LAMP, bloom: 0.7, act: (A, lt, u, T) => {
      hall(A, lt, { full: 1.2, noCrowdRows: [4], podium: true }); A.a(HIT, 900, -0.05, PZ + 0.3, { expr: "nervous", look: -0.6, headTilt: 12, prop: ["paper", 1] }, { y: 0.45 });
      A.over((g) => clockOver(g, 21, 1 + lt * 0.6, T - 277.6, 1.8, { r: 120, x: VW * 0.78, y: VH * 0.38 }));
    } },
  // 53a "Por causa da situação militar e dos compromissos em Berlim," — mapa: Munique → Berlim
  { t0: 279.81, fade: 0.2, L: () => mapL("m53", "steel"), cam: mv([MX(12.3), MY(50), -24, 40], [MX(12.5), MY(50.3), -18, 38]), act: (A, lt, u, T) => {
      hl(A, "GER", 1, "#5a5a5a", 0.45); pin(A, 11.58, 48.14, T - 280.0, "dot"); mapLabel(A, 11.58, 48.14, "Munique", T - 280.1); pin(A, 13.4, 52.52, T - 282.4, "star", false, "#c42a22"); mapLabel(A, 13.4, 52.52, "Berlim", T - 282.5);
      arrow(A, [11.58, 48.3], [13.3, 52.3], (T - 282.4) / 0.9, "#8a1e16", 0.3);
    } },
  // 53b "seu discurso foi mais curto do que o habitual." — o relógio da parede mal anda
  { t0: 282.73, fade: 0.2, L: () => hallL("h5"), cam: mv([1.2, 2.6, 8.8, 42, -10], [0.9, 2.5, 9.8, 40, -10]), lite: LAMP, bloom: 0.7, act: (A, lt, u, T) => {
      hall(A, lt, { full: 1.2, hitler: "speak" }); wallClock(A, 3.6, 4.2, CZ - 0.2, 21, 2 + lt * 0.5, 0.45);
      A.over((g) => { const k = clamp((T - 284.1) / 0.5); if (k <= 0) return; g.save(); g.globalAlpha = k; g.font = `bold 80px "DejaVu Sans", sans-serif`; g.textAlign = "center"; g.lineWidth = 8; g.strokeStyle = "#140a08"; g.fillStyle = "#ffd060"; g.strokeText("MAIS CURTO", VW * 0.3, VH * 0.25); g.fillText("MAIS CURTO", VW * 0.3, VH * 0.25); g.restore(); });
    } },
  // 54 "Normalmente, ele permanecia muito mais tempo na cervejaria." — anos anteriores: o relógio dá voltas
  { t0: 286.1, fade: 0.3, L: () => hallL("h1"), cam: mv([0, 2.3, 4, 42, -10], [0, 2.3, 5.5, 40, -10]), lite: LAMP, bloom: 0.6, sat: 0.6, act: (A, lt, u, T) => {
      hall(A, lt, { hitler: "shout", cheer: 0.5 }); A.over((g) => { clockOver(g, 20 + lt * 0.6, (lt * 40) % 60, T - 286.4, 2.8, { r: 150, x: VW * 0.8, y: VH * 0.36, digital: false }); });
      A.light((g) => tint(g, "#c8a070", 0.25, "soft-light"));
    } },
  // 55 "Mas, naquela ocasião, decidiu encerrar a cerimônia antes do esperado." — fim abrupto, aplausos
  { t0: 289.88, fade: 0.25, L: () => hallL("h5"), cam: dinT(289.88, [0, 1.9, 10, 36, -5], [[291.7, [0, 2.2, 7, 42, -10]]]), lite: LAMP, bloom: 0.7, act: (A, lt, u, T) => {
      const end = T > 291.7; hall(A, lt, { full: 1.2, hitler: end ? null : "speak", cheer: end ? 1 : 0 });
      if (end) A.a(HIT, 900, -0.05 + (T - 291.7) * 0.6, PZ + 0.3, { expr: "stern", look: 1 }, { y: 0.45 });
    } },
  // 56a "Por volta das 21h07," — o relógio
  { t0: 294.71, fade: 0.2, L: () => hallL("h5"), cam: mv([0, 2.4, 6, 42, -10], [0, 2.4, 6.6, 40, -10]), lite: LAMP, bloom: 0.6, act: (A, lt, u, T) => {
      hall(A, lt, { full: 1.2, cheer: 0.6 }); leaders(A, lt, 0.4, 0.5, 13.2, 1.4);
      A.over((g) => clockOver(g, 21, 6.6 + clamp((T - 295.4) / 0.5) * 0.4 + Math.max(0, T - 296) * 0.02, T - 295.0, 2.7, { r: 180, y: VH * 0.42 }));
    } },
  // 56b "Hitler deixou o salão acompanhado de outros líderes nazistas." — saem pela lateral
  { t0: 297.73, fade: 0.2, L: () => hallL("h5"), cam: (u, lt) => ({ x: 2.5 + lt * 1.2, y: 1.9, z: 5.5, fov: 42, shift: -10 }), lite: LAMP, bloom: 0.7, act: (A, lt, u, T) => {
      hall(A, lt, { full: 1.2, cheer: 0.8, noCrowdRows: [4] }); leaders(A, lt, 0, 2.8, 12.4, 1.4);
    } },
  // 56c a porta se fecha, o carro parte
  { t0: 300.0, fade: 0.2, L: () => hallOutL("hn"), cam: mv([-2, 1.6, -3, 42], [1, 1.6, -3, 42]), lite: MOON, bloom: 0.8, act: (A, lt) => {
      const x = 0 + Math.max(0, lt - 0.3) ** 1.6 * 4; A.sp("staff", x, 0, 6, { sc: 1 }); A.a(v(HIT, { hat: "peaked", cap: "#5a4a34" }), 900, x - 0.4, 6.05, { expr: "stern" }, { y: 0.75, sc: 0.9 });
      A.fx(5.9, (g, c) => dust(g, c, lt, x - 2.4, 6, -1, 0.6, [120, 120, 130]));
      for (const xx of [-8, 8]) { A.sp("lamp", xx, 0, 9, { sc: 1.6 }); A.light((g) => { const [sx, sy, s] = P(A.cam, xx, 3.4, 9); glow(g, sx, sy, 2.6 * s, "rgba(255,200,120,1)", 0.6); }); }
    } },
  // 57 "E então aconteceu algo que entraria para a história." — o púlpito vazio; tique-taque
  { t0: 301.64, fade: 0.25, L: () => hallL("h5"), cam: mv([0.4, 2.0, 7.5, 40, -10], [0.9, 1.8, 10.5, 34, -5]), lite: LAMP, bloom: 0.6, act: (A, lt, u, T) => {
      hall(A, lt, { full: 0.8, noCrowdRows: [4, 3], col: { xray: 0.3 + 0.3 * ((lt % 1) < 0.15 ? 1 : 0), bomb: true } });
    } },
];
/** a pedreira: paredões de pedra clara cortados em degraus */
function quarry(K: string) {
  return loc(["#6a8ab8", "#e0dccc"], { near: "#a8a090", far: "#c8c0ae", kind: "stone", seed: 81, zFar: 200 }, [
    clouds(K, 260, ["#f4f2ec", "#8a9ab0"], 6, 40, 110, 14, 4), forest(K, 70, "pine", "#3a5a3a", 22, 6, { blur: 1.6, h: 14 }),
    { key: K + "qw", z: 16, x0: -30, x1: 30, y0: -1, y1: 14, ppm: 30, paint: (w) => { for (let k = 0; k < 4; k++) { const y = k * 3; w.rect(-30, y, 60, 3.2, w.vgrad(y, y + 3, mix("#b8ac94", "#7a7060", 0.3 * k), mix("#d8ceb8", "#9a907c", 0.2 * k)), 3); for (let x = -29; x < 30; x += 2.3) w.line([[x + (k % 2), y], [x + (k % 2) + 0.4, y + 3]], 1.5, "rgba(0,0,0,0.14)"); } } }]);
}
