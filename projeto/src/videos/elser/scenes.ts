// Cenas reaproveitáveis (cada plano escolhe câmera, luz e o que acontece): salão cheio, discurso, oficina, trabalho noturno.
import { Sc, crowd, civ, v, idle, walkS, walkF, marchF } from "../ww2/kit";
import { P, glow, puff, hash, clamp, smooth, lerp, beam, VW, VH } from "../ww2/engine";
import { tables, podium, column, chandeliers, bench, HIT, PARTY, ELSER, ELSER_W, WAITRESS, WAITER, HIMMLER, GOERING, HESS, mix } from "./ek";
import type { FO } from "../ww2/kit";

/** o salão: fileiras de mesas com o público de pé atrás, púlpito no fundo (x=0, z=14.5) e a coluna logo atrás (x=1.9, z=15.4) */
export const PZ = 14.5, CX = 1.9, CZ = 15.4;
export type HallO = { full?: number; dark?: number; hitler?: "speak" | "shout" | "watch" | "leave" | null; leaveAt?: number; T?: number; col?: Parameters<typeof column>[3]; cheer?: number; expr?: FO["expr"]; podium?: boolean; noCrowdRows?: number[]; empty?: boolean; tablesMaxZ?: number };
export const hall = (A: Sc, lt: number, o: HallO = {}) => {
  const d = o.dark ?? 0, full = o.full ?? 1;
  if (d < 0.7) chandeliers(A, 9, [-7, 0, 7], 6.4, 0.45 * (1 - d)); if (d < 0.7) chandeliers(A, 4, [-5, 5], 5.8, 0.35 * (1 - d));
  if (o.podium !== false) podium(A, 0, PZ, { dark: d });
  column(A, CX, CZ, { dark: d, lt, ...(o.col ?? {}) });
  column(A, -CX - 4.5, CZ + 0.2, { dark: d }); column(A, CX + 5.5, CZ + 0.2, { dark: d });
  const rows = [2.2, 4.6, 7.0, 9.4, 11.8];
  rows.forEach((z, r) => {
    if (o.tablesMaxZ !== undefined && z > o.tablesMaxZ) return;
    tables(A, z, -9, 9, 11 + r * 5, { cloth: r % 2 ? undefined : mix("#e8e0cc", "#0a0808", d), dark: d, steins: o.empty ? 0.2 : 1.1 });
    if (o.empty || o.noCrowdRows?.includes(r)) return;
    const n = Math.round((7 + r * 1.3) * full), cheer = o.cheer ?? 0;
    crowd(A, n, -8.5, 8.5, z + 0.35, z + 0.55, 31 + r * 13, (i) => ({ mode: cheer > 0.5 && i % 2 ? "stand" : "sit", expr: o.expr ?? (cheer > 0.5 ? "shout" : i % 3 ? "neutral" : "stern"), look: 0, prop: cheer > 0 && i % 3 === 0 ? ["fist", cheer] : undefined }), (i) => PARTY(i + r * 7),
      { dark: 0.15 + d * 0.7, darkCol: "#140c0a", y: 0.12 });
  });
  const T = o.T ?? A.t;
  if (o.hitler === "speak" || o.hitler === "shout") A.a(HIT, 900, -0.05, PZ + 0.3, { expr: o.hitler === "shout" ? "shout" : "stern", prop: ["fist", o.hitler === "shout" ? 0.7 + 0.3 * Math.sin(lt * 6) : 0.35 + 0.25 * Math.sin(lt * 2.3)], look: 0 }, { y: 0.45 });
  if (o.hitler === "watch") A.a(HIT, 900, -0.05, PZ + 0.3, { expr: "nervous", look: 0.4 }, { y: 0.45 });
};
/** Hitler e os líderes saindo pela lateral (andam para a direita) a partir de t0 (segundos do plano) */
export const leaders = (A: Sc, lt: number, t0: number, x0 = -1, z = 13.2, vel = 1.5) => {
  const k = lt - t0; const os = [HIT, HIMMLER, GOERING, HESS];
  os.forEach((o, i) => { if (k < 0) A.a(o, 910 + i, x0 - i * 1.1, z + (i % 2) * 0.4, { expr: "stern", look: 1 }); else walkS(A, o, 910 + i, k, x0 - i * 1.1, z + (i % 2) * 0.4, vel, { expr: "stern" }); });
};
/** Elser trabalhando na bancada (plaina indo e voltando, aparas) */
export const elserBench = (A: Sc, lt: number, x = 0, z = 2.4, o: { gears?: boolean; expr?: FO["expr"]; out?: typeof ELSER } = {}) => {
  bench(A, x, z - 0.15, { plank: o.gears ? 0 : 1, gears: o.gears ? 1 : 0, lt });
  const k = (lt * 0.9) % 1, push = Math.sin(k * Math.PI * 2);
  A.a(o.out ?? ELSER_W, 1, x + 0.15 * push, z + 0.25, { expr: o.expr ?? "neutral", crouch: 0.18, prop: o.gears ? ["brush", 0.45] : ["hammer", 0.6 + 0.2 * push], look: -0.6, headTilt: 10, hip: 6 * push }, { y: 0 });
  if (!o.gears) A.fx(z - 0.2, (g, c) => { for (let i = 0; i < 6; i++) { const a = (lt * 1.7 + hash(i)) % 1, [sx, sy, s] = P(c, x - 0.6 + a * 1.4 + 0.2 * Math.sin(i), 1.05 + a * 0.4 - a * a * 1.2, z - 0.2); g.fillStyle = "#f0d8a0"; g.beginPath(); g.ellipse(sx, sy, 0.05 * s, 0.025 * s, a * 6 + i, 0, 7); g.fill(); } });
};
/** luz quente de uma janela de dia entrando na oficina */
export const sunbeam = (A: Sc, x = 2.7, y = 3, z = 6, a = 0.18) => A.light((g) => beam(g, A.cam, x, y, z, Math.PI / 2 + 0.55, 6, 2.6, a, "255,226,170"));
export { HIT, ELSER, ELSER_W, WAITRESS, WAITER };
