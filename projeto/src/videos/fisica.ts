// Física dos objetos aprendida no vídeo do Lula (estilo palito) e aprovada pelo usuário: só matemática do tempo,
// sem motor nenhum (serve ao 2.5D e ao three.js). Os desenhos 2.5D ficam em ww2/fx_palito.ts.
// Já existiam no motor ww2 (fx.ts) e continuam valendo: bounce (queda com quique), spring (mola), sparks (solda contínua),
// flutter (papel caindo), flag (pano ondulando), fall (soldado atingido), blast (explosão).
export const G = 9.81;
const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const easeOut3 = (u: number) => 1 - Math.pow(1 - clamp(u), 3);
const easeIO3 = (u: number) => (u = clamp(u), u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
export const hash = (n: number) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

/** POP: a peça entra "estourando": 0 → 1,12 → 1 em d segundos (etiqueta, carimbo, data, X vermelho, ícone no mapa). */
export function pop(t: number, t0: number, d = 0.3, pico = 1.12) {
  const u = (t - t0) / d;
  if (u <= 0) return 0;
  if (u >= 1) return 1;
  return u < 0.6 ? easeOut3(u / 0.6) * pico : pico + (1 - pico) * easeIO3((u - 0.6) / 0.4);
}

/** SOBE E FREIA: 0 → 1 saindo rápido e freando (bandeira subindo no mastro, cortina, placa sendo erguida). */
export const sobe = (t: number, t0: number, d = 1) => easeOut3((t - t0) / d);

/** PANCADA MECÂNICA (prensa, martelo, porta de aço, comporta, tampa de canhão):
 *  cai ACELERANDO (u², gravidade) durante `queda` s e chega no fim exatamente em tHit; depois vibra amortecida.
 *  k = fração do curso (0 em cima, 1 batido); vib = tremor em metros (somar à posição); volta = recolhendo devagar. */
export function pancada(t: number, tHit: number, o: { queda?: number; freq?: number; amort?: number; amp?: number; volta?: [number, number] } = {}) {
  const q = o.queda ?? 0.14, f = o.freq ?? 40, am = o.amort ?? 8, a = o.amp ?? 0.04;
  if (t < tHit - q) return { k: 0, vib: 0, bateu: false };
  if (t < tHit) { const u = (t - (tHit - q)) / q; return { k: u * u, vib: 0, bateu: false }; }
  const dt = t - tHit, vib = Math.sin(dt * f) * a * Math.exp(-dt * am);
  let k = 1;
  if (o.volta) k = 1 - easeIO3((t - o.volta[0]) / o.volta[1]);      // depois de um tempo a peça recolhe devagar
  return { k, vib, bateu: true };
}
/** quanto o que foi prensado amassa: 1 (inteiro) → `fica` em 3 quadros, com um quique pequeno */
export const amassa = (t: number, tHit: number, fica = 0.62) => {
  if (t < tHit) return 1;
  const dt = t - tHit;
  return fica + (1 - fica) * Math.max(0, 1 - dt / 0.1) + 0.05 * Math.sin(dt * 30) * Math.exp(-dt * 10);
};

/** BALÍSTICO: posição de um corpo lançado com velocidade v (m/s) depois de t s, gravidade real. */
export const balistico = (v: [number, number, number], t: number, g = G): [number, number, number] => [v[0] * t, v[1] * t - 0.5 * g * t * t, v[2] * t];

/** CONFETE / PAPEL LANÇADO PARA CIMA: sobe balístico com arrasto e, quando a queda chega na velocidade terminal,
 *  passa a cair devagar balançando e girando. Devolve posição (relativa ao ponto de lançamento), giro e "tombo" (−1..1). */
export function lancado(i: number, age: number, o: { forca?: number; abre?: number; terminal?: number; seed?: number } = {}) {
  const s = o.seed ?? 1, F = o.forca ?? 1, abre = o.abre ?? 3, vt = o.terminal ?? 1.1;
  const vy = (4 + hash(i + s) * 5) * F, vx = (hash(i * 3 + s) - 0.5) * 2 * abre * F, vz = (hash(i * 5 + s) - 0.5) * 2 * F;
  const t1 = (vy + vt) / G;                                        // instante em que a queda atinge a velocidade terminal
  const ar = (tt: number) => (1 - Math.exp(-2.2 * tt)) / 2.2;      // arrasto no espalhamento lateral
  const y = age < t1 ? vy * age - 0.5 * G * age * age : vy * t1 - 0.5 * G * t1 * t1 - vt * (age - t1);
  const sway = age > t1 ? Math.sin((age - t1) * (2.4 + hash(i + 7) * 2) + i) * 0.35 : 0;
  return { x: vx * ar(age) + sway, y, z: vz * ar(age), giro: age * (3 + hash(i + 2) * 6) + i, tombo: Math.cos(age * (6 + hash(i + 4) * 6) + i) };
}

/** FLASH BRANCO: alfa 0..1 que some em `d` s depois de cada impacto (usar ~0,6–0,75 do alfa). */
export const flash = (t: number, hits: number[], d = 0.25) => Math.max(0, ...hits.map((h) => (t >= h && t < h + d ? 1 - (t - h) / d : 0)));

/** RODA: ângulo pela distância percorrida (nunca por tempo): giro = distância / raio. */
export const giroRoda = (distancia: number, raio: number) => distancia / raio;
/** SUSPENSÃO: quique do veículo andando em terreno ruim (m) e balanço lateral (rad). */
export const suspensao = (t: number, vel: number, o: { amp?: number; seed?: number } = {}) => ({
  y: Math.abs(Math.sin(t * (6 + vel * 1.4) + (o.seed ?? 0))) * (o.amp ?? 0.04),
  rot: Math.sin(t * 9 + (o.seed ?? 0)) * 0.012,
});

export { tremida } from "./dinamica";
