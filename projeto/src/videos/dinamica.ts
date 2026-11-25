// Câmera dinâmica (aprendida no estilo palito e aprovada pelo usuário): a câmera dá um "golpe" na palavra —
// sai rápido, chega ~88 % do caminho em ~0,55 s (uns 14-16 quadros, curva expo out) e desliza devagar o resto
// até a próxima palavra-chave. Nunca fica parada, nunca anda num ritmo só do começo ao fim do plano.
//
// Serve para o motor 2.5D (trincheiras, ww2, hitler: Cam = {x, y, z, fov, shift}) e para o three.js (vetores soltos).
// Não depende de nenhum motor: é só matemática do tempo (nada de random, nada de estado entre quadros).
//
// Uso no 2.5D (no lugar de mv/path):
//   cam: din([0, 6, -16, 48, -110], [[1.60, [0, 2.6, -9.5, 44, -50]], [3.05, [1.5, 2.4, -7, 40, -45]]])
//   - o 1º argumento é onde a câmera começa (no 1º quadro do plano);
//   - cada chave é [segundo DENTRO do plano em que o golpe começa, destino]; use `palavra - t0 - 0.05`;
//   - com tempos ABSOLUTOS do filme (os do tempos_palavras.txt) use dinT(t0, inicio, chaves);
//   - um destino pode ser uma função do tempo do plano, para seguir quem anda: (lt) => [x0 + lt * 1.1, 1.4, -6, 40].
import type { Cam } from "./ww2/engine";

const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const expoOut = (u: number) => (u >= 1 ? 1 : 1 - Math.pow(2, -10 * clamp(u)));

export type Vec = number[];
export type Alvo = Vec | ((lt: number) => Vec);
export type Chave = [number, Alvo];
export type Golpe = { dur?: number; parte?: number };

const val = (a: Alvo, lt: number) => (typeof a === "function" ? a(lt) : a);
/** quanto do caminho já foi feito, dt segundos depois de o golpe começar, num trecho que dura `span` */
export const golpe = (dt: number, span: number, o: Golpe = {}) => {
  const d = o.dur ?? 0.55, p = o.parte ?? 0.88;
  return p * expoOut(dt / d) + (1 - p) * clamp(dt / Math.max(d, span));
};

/** os valores no tempo lt: cada golpe parte de onde a câmera está naquele instante (contínuo, sem pulo) */
export function dinVals(inicio: Alvo, chaves: Chave[], lt: number, dur = 4, o: Golpe = {}): Vec {
  const ks = [...chaves].sort((a, b) => a[0] - b[0]);
  let v = val(inicio, lt).slice();
  for (let j = 0; j < ks.length; j++) {
    const [tj, alvo] = ks[j];
    if (lt < tj) break;
    const fim = j + 1 < ks.length ? ks[j + 1][0] : dur;
    const ate = Math.min(lt, fim);
    // de onde partiu: o valor no começo deste golpe (o anterior já andou até aqui)
    const e = golpe(ate - tj, fim - tj, o), A = val(alvo, lt);
    v = v.map((x, i) => x + ((A[i] ?? x) - x) * e);
    if (lt < fim) break;
  }
  return v;
}

const paraCam = (v: Vec): Cam => ({ x: v[0], y: v[1], z: v[2], fov: v[3] ?? 42, shift: v[4] ?? 0 });

/** câmera 2.5D por golpes nas palavras (tempos dentro do plano) */
export const din = (inicio: Alvo, chaves: Chave[], o: Golpe = {}) => (u: number, lt: number): Cam => {
  const dur = u > 0.001 ? lt / u : 8;
  return paraCam(dinVals(inicio, chaves, lt, dur, o));
};
/** o mesmo, com os tempos absolutos do filme (as palavras do tempos_palavras.txt); t0 = começo do plano */
export const dinT = (t0: number, inicio: Alvo, chaves: Chave[], o: Golpe = {}) =>
  din(inicio, chaves.map(([t, a]) => [t - t0 - 0.05, a] as Chave), o);

/** soco de lente no impacto: a lente fecha `amt` (0,15 = 15 %) em 3 quadros e volta em mola em ~0,5 s */
export const soco = (c: (u: number, lt: number) => Cam, hits: [number, number][]) => (u: number, lt: number): Cam => {
  const k = c(u, lt);
  let m = 1;
  for (const [t, amt] of hits) {
    const a = lt - t;
    if (a < 0 || a > 1) continue;
    const env = a < 0.1 ? a / 0.1 : Math.exp(-(a - 0.1) * 7) * Math.cos((a - 0.1) * 14);
    m -= amt * env;
  }
  return { ...k, fov: k.fov * m };
};

/** tremida do impacto no jeito palito: troca de lado a cada quadro e some em 7 quadros (px na tela) */
export const tremida = (lt: number, hits: [number, number][], fps = 30): [number, number] => {
  let x = 0, y = 0;
  for (const [t, px] of hits) {
    const q = Math.floor((lt - t) * fps);
    if (q < 0 || q >= 7) continue;
    const s = (q % 2 ? 1 : -1) * px * (1 - q / 7);
    x += s; y += s * 0.6;
  }
  return [x, y];
};

/** three.js: o mesmo golpe para vetores [px,py,pz, lx,ly,lz, fov, roll]; tempos em segundos */
export const din3 = (inicio: Alvo, chaves: Chave[], o: Golpe = {}) => (t: number, dur = 8) => {
  const v = dinVals(inicio, chaves, t, dur, o);
  return { pos: [v[0], v[1], v[2]] as [number, number, number], look: [v[3], v[4], v[5]] as [number, number, number], fov: v[6] ?? 40, roll: v[7] ?? 0 };
};
