// Desenhos 2.5D da física do estilo palito (matemática em ../fisica.ts): estouro de faíscas de um impacto só,
// confete lançado para cima, flash de tela. Mesmo jeito do fx.ts: (g, cam, idade, ponto no mundo em metros).
import { Ctx, Cam, VW, VH, P, glow } from "./engine";
import { G, hash, lancado } from "../fisica";

/** faíscas de UM impacto (prensa, bala no metal, espada): riscos alinhados à velocidade, gravidade real, somem em ~0,9 s */
export const faiscasImpacto = (g: Ctx, cam: Cam, age: number, x: number, y: number, z: number, o: { n?: number; seed?: number; forca?: number; dir?: number } = {}) => {
  if (age < 0 || age > 1.1) return;
  const n = o.n ?? 40, s = o.seed ?? 1, F = o.forca ?? 1, d = o.dir ?? 0;
  g.save(); g.globalCompositeOperation = "lighter";
  for (let i = 0; i < n; i++) {
    const vx = ((hash(i + s) - 0.5) * 7 + d * 2) * F, vy = (1.5 + hash(i * 3 + s) * 4.5) * F, vz = (hash(i * 7 + s) - 0.5) * 2.5 * F;
    const vida = 0.45 + hash(i * 11 + s) * 0.5; if (age > vida) continue;
    const px = x + vx * age, py = y + vy * age - 0.5 * G * age * age, pz = z + vz * age;
    if (py < 0 || pz - cam.z < 0.3) continue;
    const vyA = vy - G * age, rastro = 0.035;
    const [qx, qy, qs] = P(cam, px, py, pz), [tx, ty] = P(cam, px - vx * rastro, py - vyA * rastro, pz - vz * rastro);
    const a = 1 - age / vida;
    g.strokeStyle = `rgba(255,${200 + Math.round(55 * hash(i))},${120 + Math.round(80 * a)},${a})`;
    g.lineWidth = Math.max(1.2, 0.025 * qs); g.beginPath(); g.moveTo(qx, qy); g.lineTo(tx, ty); g.stroke();
  }
  if (age < 0.12) { const [sx, sy, sc] = P(cam, x, y, z); glow(g, sx, sy, 1.6 * sc * (1 - age / 0.12), "rgba(255,240,200,1)", 0.9); }
  g.restore();
};

/** confete lançado para cima de um ponto (comemoração, vitória, fim da guerra): sobe, abre, cai balançando e girando */
export const confeteEstouro = (g: Ctx, cam: Cam, age: number, x: number, y: number, z: number, o: { n?: number; cols?: string[]; size?: number; forca?: number; seed?: number } = {}) => {
  if (age < 0 || age > 7) return;
  const n = o.n ?? 120, cols = o.cols ?? ["#f7d117", "#13994a", "#2f74c0", "#ffffff", "#e2483d"], sz0 = o.size ?? 0.09;
  for (let i = 0; i < n; i++) {
    const p = lancado(i, age, { forca: o.forca, seed: o.seed });
    const py = y + p.y; if (py < 0.02) continue;
    const pz = z + p.z; if (pz - cam.z < 0.4) continue;
    const [qx, qy, qs] = P(cam, x + p.x, py, pz), sz = sz0 * qs;
    g.save(); g.translate(qx, qy); g.rotate(p.giro); g.scale(1, Math.max(0.12, Math.abs(p.tombo)));
    g.fillStyle = cols[i % cols.length]; g.fillRect(-sz / 2, -sz * 0.32, sz, sz * 0.64);
    g.fillStyle = p.tombo > 0 ? "rgba(255,255,255,0.22)" : "rgba(0,0,0,0.2)"; g.fillRect(-sz / 2, -sz * 0.32, sz, sz * 0.64);
    g.restore();
  }
};

/** flash branco na tela inteira (alfa já calculado com fisica.flash) */
export const flashTela = (g: Ctx, a: number, cor = "255,255,255") => { if (a <= 0) return; g.fillStyle = `rgba(${cor},${a})`; g.fillRect(0, 0, VW, VH); };
