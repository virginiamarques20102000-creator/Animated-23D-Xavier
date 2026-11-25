// Demonstração curta (7 s, 16:9) da física do estilo palito + câmera dinâmica no motor da Segunda Guerra,
// com os bonecos e cenários da skill. Plano 1: fábrica de munição (pancada da prensa, faíscas, flash, tremida, soco de
// lente). Plano 2: 8 de maio de 1945 (bandeira sobe e freia, confete lançado, data com pop).
import { VW, VH, P, post, smooth, mk, clamp, glow } from "./engine";
import { drawShot } from "./story";
import { civ, sol, v, idle, flag, panel, TOMMY, GI } from "./kit";
import { loc, wall, city, clouds, hillL } from "./places";
import { DAY, LAMP } from "./looks";
import { dinT, soco } from "../dinamica";
import { pancada, amassa, sobe, pop, flash } from "../fisica";
import { faiscasImpacto, confeteEstouro, flashTela } from "./fx_palito";
import type { Shot } from "./types";

export const FIS_DUR = 7.2;
const HIT = 1.55, B0 = 3.2, ICE = 3.55, C1 = 4.75, C2 = 5.45, DATA = 3.45;

const SHOTS: Shot[] = [
  { t0: 0, t1: B0, L: () => loc(undefined, { near: "#4e4a44", far: "#5e5a52", kind: "stone", seed: 7, zFar: 12 },
      [wall("f1", 5.5, "#7a4a3a", { h: 6, wid: 12, win: 3, winCol: "#c8d8e4", pipes: true, lamps: 3, brick: true })], true),
    lite: LAMP, bloom: 0.6, kicks: [[HIT, 12]],
    cam: soco(dinT(0, [0.6, 1.9, -5.2, 44, -6], [[0.55, [-0.2, 1.8, -2.6, 40, -4]], [HIT, [-0.3, 1.15, -1.3, 36, 0]], [2.25, [0.5, 1.4, -2.0, 39, 0]]]), [[HIT, 0.14]]),
    act: (A, lt, u, T) => {
      const pc = pancada(T, HIT, { queda: 0.14, amp: 0.05, volta: [2.6, 0.5] }), ramY = 2.45 - (2.45 - 1.06) * pc.k + pc.vib;
      const sq = amassa(T, HIT);
      panel(A, 3.0, (w) => {
        w.rect(-1.5, 0, 2.2, 0.75, "#d8901c", 3);                                   // base
        w.rect(-1.45, 0.75, 0.32, 2.7, "#e8a028", 3); w.rect(0.43, 0.75, 0.32, 2.7, "#e8a028", 3);  // colunas
        w.rect(-1.65, 3.4, 2.6, 0.6, "#e8a028", 3);                                 // travessa
        w.rect(-0.43, ramY + 0.45, 0.12, Math.max(0.05, 3.4 - ramY - 0.45), "#c9cdd2", 2);           // haste
        w.rect(-0.95, ramY, 1.15, 0.48, "#5c626b", 3);                              // martelo
        w.rect(-0.58, 0.75, 0.42, 0.5 * sq, "#d8b048", 2.5);                        // cartucho de latão (amassa)
        w.rect(-0.58, 0.75 + 0.5 * sq - 0.08, 0.42, 0.08, "#f0d070", 0);
        w.rect(0.95, 1.4, 0.22, 0.22, T > HIT ? "#ff3a2a" : "#7a2a24", 2);            // lâmpada de aviso
      });
      if (T > HIT) A.fx(2.9, (g, c) => { const [sx, sy, s] = P(c, 1.06, 1.51, 2.95); glow(g, sx, sy, 0.6 * s, "rgba(255,60,40,1)", 0.5 + 0.3 * Math.sin(T * 18)); });
      A.fx(2.85, (g, c) => faiscasImpacto(g, c, T - HIT, -0.37, 1.1, 2.85, { n: 46, seed: 3 }));
      const susto = T > HIT - 0.05;
      A.a(v(civ(3, 1), { jacket: "#3a5a8a", pants: "#2e3a4e" }), 80, 1.35, 2.6, { expr: susto ? (T < HIT + 0.9 ? "shock" : "relief_open") : "neutral", look: -1, crouch: susto ? 0.25 * Math.exp(-(T - HIT) * 2) : 0, ...idle(lt, 80) });
      A.a(v(civ(5, 1), { jacket: "#6a5a4a" }), 81, -2.8, 4.2, { expr: susto ? "nervous" : "neutral", look: 1 });
      A.over((g) => flashTela(g, 0.7 * flash(T, [HIT])));
    } },
  { t0: B0, t1: FIS_DUR, fade: 0, L: () => loc(["#2f7fd8", "#cfe3f0"], { near: "#8a9a6a", far: "#aab088", kind: "grass", seed: 4, zFar: 300 },
      [clouds("f2", 220, ["#ffffff", "#bcd2ea"], 6, 40, 90, 14, 3), hillL("f2", 120, "#7a9a6a", 4, 10, 1.5),
       city("f2", 34, { pal: ["#e8d8b8", "#d8b898", "#c8a888", "#f0e4cc"], seed: 6, floors: [3, 5], roof: "gable", x0: -30, x1: 30 })]),
    lite: DAY, bloom: 0.5,
    cam: dinT(B0, [0, 6.5, -15, 46, -90], [[3.35, [0, 1.9, -6.5, 42, -6]], [4.3, [1.6, 2.7, -4.6, 40, 40]], [C1 + 0.05, [0.6, 2.4, -6.0, 42, 25]], [C2 + 0.35, [0, 2.0, -8.5, 44, -6]]]),
    act: (A, lt, u, T) => {
      const s = sobe(T, ICE, 1.1), sp = 0.06 * Math.sin((T - ICE - 1.1) * 9) * Math.exp(-Math.max(0, T - ICE - 1.1) * 4) * (T > ICE + 1.1 ? 1 : 0);
      A.fx(5.01, (g, c) => { const [px, py, sc] = P(c, 1.5, 0, 5), [, ty] = P(c, 1.5, 4.75, 5); g.strokeStyle = "#1a1416"; g.lineWidth = Math.max(3, 0.12 * sc); g.beginPath(); g.moveTo(px, py); g.lineTo(px, ty); g.stroke(); g.strokeStyle = "#e0dcd4"; g.lineWidth = Math.max(1.5, 0.07 * sc); g.stroke(); });
      flag(A, "br", 1.5, 1.6 + 2.9 * s + sp, 5, 1.7, 1.15, { pole: false });
      const gente = 12;
      for (let i = 0; i < gente; i++) {
        const x = -4.2 + i * 0.72 + (i % 2) * 0.2, z = 3.0 + (i % 3) * 0.7, fest = T > C1 - 0.2;
        const o = i % 4 === 0 ? sol(TOMMY, i, false) : i % 4 === 2 ? sol(GI, i, false) : civ(i, 2);
        const pulo = fest ? Math.abs(Math.sin(T * 7 + i)) * 0.18 : 0;
        A.a(o, 90 + i, x, z, { expr: fest ? (i % 2 ? "laugh" : "grin") : "smile", look: 1, prop: i % 3 === 1 ? "flag" : null, armB: fest ? 1.6 + 0.5 * Math.sin(T * 8 + i) : undefined, ...idle(lt, 90 + i) }, { y: pulo });
      }
      A.fx(2.5, (g, c) => confeteEstouro(g, c, T - C1, -1.6, 1.6, 3.4, { n: 110, seed: 2 }));
      A.fx(2.4, (g, c) => confeteEstouro(g, c, T - C2, 2.6, 1.6, 3.6, { n: 110, seed: 9, forca: 1.1 }));
      A.over((g) => {
        const k = pop(T, DATA, 0.3); if (k <= 0) return;
        g.save(); g.translate(VW * 0.36, VH * 0.11); g.scale(k, k); g.rotate(-0.03);
        g.font = "900 92px 'Arial Black', Arial, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle";
        g.lineJoin = "round"; g.lineWidth = 16; g.strokeStyle = "#1a1416"; g.strokeText("8 DE MAIO DE 1945", 0, 0); g.fillStyle = "#ffe14a"; g.fillText("8 DE MAIO DE 1945", 0, 0);
        g.restore();
      });
      A.over((g) => flashTela(g, 0.45 * flash(T, [C1], 0.2)));
    } },
];

let MB: HTMLCanvasElement | null = null;
const um = (g: CanvasRenderingContext2D, t: number) => {
  const sh = SHOTS.find((s) => t >= s.t0 && t < s.t1!) ?? SHOTS[SHOTS.length - 1];
  drawShot(g, sh, t);
  post(g, t, 0.42, (sh.bloom ?? 0.5) * 0.7, sh.sat ?? 1.18);
  if (t < 0.3) { g.fillStyle = `rgba(0,0,0,${1 - t / 0.3})`; g.fillRect(0, 0, VW, VH); }
  if (t > FIS_DUR - 0.4) { g.fillStyle = `rgba(0,0,0,${clamp((t - (FIS_DUR - 0.4)) / 0.4)})`; g.fillRect(0, 0, VW, VH); }
};
export const fisicaQuadro = (g: CanvasRenderingContext2D, t: number) => {
  if (!MB) MB = mk(VW, VH); const m = MB.getContext("2d")!; m.setTransform(1, 0, 0, 1, 0, 0); um(m, t - 1 / 60);
  um(g, t); g.save(); g.globalAlpha = 0.5; g.drawImage(MB, 0, 0); g.restore();
};
void smooth;
