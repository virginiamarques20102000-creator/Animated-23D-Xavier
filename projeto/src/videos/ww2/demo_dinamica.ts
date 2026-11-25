// Demonstração da câmera dinâmica (src/videos/dinamica.ts) nos 4 primeiros planos do filme da Segunda Guerra
// (0–13,5 s): mesmos lugares, bonecos, ações e narração; só a câmera muda. modo "antes" = câmera original (mv),
// "depois" = golpes nas palavras. Render: veja SKILL.md, "Câmera dinâmica".
import { VW, VH, post, smooth, mk, clamp } from "./engine";
import { hand } from "./kit";
import { drawShot } from "./story";
import { SHOTS_1 } from "./shots_1";
import { dinT, soco } from "../dinamica";
import type { Shot } from "./types";

export const DEMO_DUR = 13.5;
const BASE: Shot[] = SHOTS_1.filter((s) => s.t0 < DEMO_DUR);
// as palavras (tempos_palavras.txt, linha 0): cidades 1.60 · destruídas 3.05 · pessoas 4.50 · abandonar 5.45 · casas 6.35 ·
// soldados 7.20 · batalhas 8.25 · gigantescas 9.10 · mudam 10.25 · destino 10.75 · países 11.55 · inteiros 11.90
const CAMS: Shot["cam"][] = [
  // 0a: abre de drone sobre a cidade em chamas, golpe para baixo em "cidades", aproxima da fachada em "destruídas"
  soco(dinT(0, [0, 5.5, -15, 48, -100], [[1.60, [0, 2.6, -9.5, 44, -50]], [3.05, [1.2, 2.6, -6.5, 40, -55]]]), [[3.05, 0.12]]),
  // 0b: travelling de lado acompanhando quem foge; entra nas pessoas, segue, e abre em "casas" mostrando a fumaça
  dinT(3.9, (lt) => [-7 + lt * 1.05, 1.6, -9, 44], [
    [4.50, (lt) => [-3.5 + lt * 1.05, 1.4, -5.2, 38]], [5.45, (lt) => [-2.5 + lt * 1.05, 1.5, -6, 40]], [6.35, (lt) => [-1 + lt * 0.8, 2.6, -10, 44, -15]]]),
  // 0c: corre junto com os soldados, golpe baixo em "batalhas", afasta revelando os tanques em "gigantescas"
  soco(hand(dinT(7.1, [-9, 1.4, -9, 46], [
    [7.20, (lt) => [-9 + lt * 3.0, 1.2, -5.5, 42]], [8.25, (lt) => [-8 + lt * 3.2, 1.1, -4.3, 38]], [9.10, [3, 2.6, -10, 46, -25]]])), [[1.15, 0.1], [1.8, 0.08]]),
  // 0d: desce no posto da fronteira em "mudam", fecha em "destino" e "países", respira em "inteiros"
  dinT(9.9, [-1, 1.8, -8, 42, -10], [[10.25, [0, 1.35, -5.6, 40]], [10.75, [0.6, 1.3, -4.6, 37]], [11.55, [1.0, 1.4, -3.9, 34]], [11.90, [0.4, 1.6, -5.2, 38]]]),
];
const NOVO: Shot[] = BASE.map((s, i) => ({ ...s, cam: CAMS[i] ?? s.cam }));

let BUF: HTMLCanvasElement | null = null, MB: HTMLCanvasElement | null = null;
const um = (g: CanvasRenderingContext2D, t: number, lista: Shot[]) => {
  let i = lista.findIndex((s) => t >= s.t0 && t < s.t1!); if (i < 0) i = lista.length - 1;
  const sh = lista[i];
  drawShot(g, sh, t);
  const f = sh.fade ?? 0;
  if (f && i > 0 && t - sh.t0 < f) {
    if (!BUF) BUF = mk(VW, VH); const b = BUF.getContext("2d")!; b.setTransform(1, 0, 0, 1, 0, 0); drawShot(b, lista[i - 1], t);
    g.save(); g.globalAlpha = 1 - smooth((t - sh.t0) / f); g.drawImage(BUF, 0, 0); g.restore();
  }
  post(g, t, 0.42, (sh.bloom ?? 0.5) * 0.7, sh.sat ?? 1.18);
  if (t < 0.4) { g.fillStyle = `rgba(0,0,0,${1 - t / 0.4})`; g.fillRect(0, 0, VW, VH); }
  if (t > DEMO_DUR - 0.5) { g.fillStyle = `rgba(0,0,0,${clamp((t - (DEMO_DUR - 0.5)) / 0.5)})`; g.fillRect(0, 0, VW, VH); }
};
/** um quadro da demo, com o mesmo desfoque de movimento do filme (2 subquadros) */
export const demoQuadro = (g: CanvasRenderingContext2D, t: number, modo: "antes" | "depois") => {
  const lista = modo === "antes" ? BASE : NOVO;
  if (!MB) MB = mk(VW, VH); const m = MB.getContext("2d")!; m.setTransform(1, 0, 0, 1, 0, 0); um(m, t - 1 / 60, lista);
  um(g, t, lista); g.save(); g.globalAlpha = 0.5; g.drawImage(MB, 0, 0); g.restore();
};
