// Peças do filme da crise de 2008: mapa da América do Sul animado, veículos novos, telefone tocando, calendário, mira, TV.
import { Sc } from "./kit";
import { Ctx, P, VW, VH, glow, puff, clamp, lerp, easeOut, easeIn, smooth, hash, drawSprite } from "./engine";
import { SPR } from "./paint";
import { SX, SY, SAC, saPts } from "./cenarios";
import { INK, mix } from "./toon";
import type { Expr } from "./toon";

/** boca de quem fala: alterna três formas a cada ~3 quadros (a emoção fica nas sobrancelhas da forma base) */
export const fala = (T: number, kind: "bravo" | "calmo" | "feliz" | "firme" = "calmo"): Expr => {
  const k = Math.floor(T * 11) % 3; const S: Record<string, Expr[]> = { bravo: ["shout", "stern", "shout"], calmo: ["neutral", "relief_open", "smile"], feliz: ["laugh", "grin", "smile"], firme: ["stern", "relief_open", "stern"] };
  return S[kind][k];
};

// ---------------- mapa ----------------
export const hlSA = (A: Sc, key: string, k: number, col = "#c0281e", a = 0.6, z = -0.05) => { if (k <= 0) return; A.fx(z, (g, c) => { const pts = saPts(SAC[key]); g.save(); g.globalAlpha = a * clamp(k); g.fillStyle = col; g.beginPath(); pts.forEach(([x, y], i) => { const [sx, sy] = P(c, x, y, 0); i ? g.lineTo(sx, sy) : g.moveTo(sx, sy); }); g.closePath(); g.fill(); g.globalAlpha = clamp(k); g.strokeStyle = col; g.lineWidth = 4; g.stroke(); g.restore(); }); };
export const arrowSA = (A: Sc, a: [number, number], b: [number, number], k: number, col: string, wid = 0.5, bend = 0.2) => {
  if (k <= 0) return; A.fx(-0.08, (g, c) => {
    const kk = easeOut(clamp(k)), ax = SX(a[0]), ay = SY(a[1]), ex = SX(b[0]), ey = SY(b[1]), mx = (ax + ex) / 2 - (ey - ay) * bend, my = (ay + ey) / 2 + (ex - ax) * bend;
    const q = (u: number) => [(1 - u) * (1 - u) * ax + 2 * (1 - u) * u * mx + u * u * ex, (1 - u) * (1 - u) * ay + 2 * (1 - u) * u * my + u * u * ey];
    const pts: number[][] = []; for (let i = 0; i <= 30; i++) { const [x, y] = q((i / 30) * kk); pts.push(P(c, x, y, 0)); }
    const s = P(c, ax, ay, 0)[2]; g.save(); g.lineCap = "round"; g.lineJoin = "round";
    g.strokeStyle = "rgba(10,6,6,0.35)"; g.lineWidth = wid * s + 8; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y + 5) : g.moveTo(x, y + 5))); g.stroke();
    g.strokeStyle = col; g.lineWidth = wid * s; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke();
    const [x1, y1] = pts[30], [x2, y2] = pts[27], an = Math.atan2(y1 - y2, x1 - x2), h = wid * 2.3 * s; g.fillStyle = mix(col, "#ffffff", 0.15); g.strokeStyle = "rgba(10,6,6,0.6)"; g.lineWidth = 2;
    g.beginPath(); g.moveTo(x1 + Math.cos(an) * h, y1 + Math.sin(an) * h); g.lineTo(x1 + Math.cos(an + 2.4) * h, y1 + Math.sin(an + 2.4) * h); g.lineTo(x1 + Math.cos(an - 2.4) * h, y1 + Math.sin(an - 2.4) * h); g.closePath(); g.fill(); g.stroke();
    if (k < 1) glow(g, x1, y1, 2.2 * h, "rgba(255,220,160,1)", 0.5); g.restore();
  });
};
/** ponto da cidade + anéis que se espalham */
export const pinSA = (A: Sc, ll: [number, number], t: number, col = "#d8241c", rings = true, r0 = 0.45) => { if (t < 0) return; A.fx(-0.09, (g, c) => {
  const k = easeOut(clamp(t / 0.3)), [sx, sy, s] = P(c, SX(ll[0]), SY(ll[1]), 0), pr = r0 * s * k * (1 + 0.1 * Math.sin(t * 6));
  if (rings) for (let i = 0; i < 3; i++) { const f = ((t * 0.8 + i / 3) % 1); g.strokeStyle = col; g.globalAlpha = 0.7 * (1 - f); g.lineWidth = 4; g.beginPath(); g.arc(sx, sy, pr + f * 3.2 * s, 0, 7); g.stroke(); }
  g.globalAlpha = 1; glow(g, sx, sy, pr * 3, "rgba(255,120,90,1)", 0.45); g.fillStyle = col; g.strokeStyle = "#241726"; g.lineWidth = 3; g.beginPath(); g.arc(sx, sy, pr, 0, 7); g.fill(); g.stroke();
}); };
/** linha tracejada animada entre duas cidades (laços diplomáticos) */
export const laco = (A: Sc, a: [number, number], b: [number, number], k: number, col = "#f4e8a0", wid = 5) => { if (k <= 0) return; A.fx(-0.07, (g, c) => {
  const [x0, y0] = P(c, SX(a[0]), SY(a[1]), 0), [x1, y1] = P(c, SX(b[0]), SY(b[1]), 0), kk = easeOut(clamp(k)), mx = (x0 + x1) / 2, my = Math.min(y0, y1) - Math.hypot(x1 - x0, y1 - y0) * 0.18;
  g.save(); g.strokeStyle = col; g.lineWidth = wid; g.setLineDash([16, 10]); g.lineDashOffset = -A.t * 40; g.shadowColor = col; g.shadowBlur = 12; g.beginPath(); g.moveTo(x0, y0);
  for (let i = 1; i <= 24; i++) { const u = (i / 24) * kk; g.lineTo((1 - u) * (1 - u) * x0 + 2 * (1 - u) * u * mx + u * u * x1, (1 - u) * (1 - u) * y0 + 2 * (1 - u) * u * my + u * u * y1); } g.stroke(); g.restore(); }); };
/** tensão pulsando dentro de um país (vermelho que respira) */
export const pulsoSA = (A: Sc, key: string, t: number, col = "#ff2a1a") => { if (t < 0) return; hlSA(A, key, clamp(t / 0.4), col, 0.35 + 0.25 * (0.5 + 0.5 * Math.sin(t * 6)), -0.04); };

// ---------------- veículos ----------------
/** helicóptero de lado com rotor girando (disco borrado + pás), balançando no ar */
export const heli = (A: Sc, x: number, y: number, z: number, o: { dir?: 1 | -1; sc?: number; tilt?: number; dark?: number } = {}) => { const dir = o.dir ?? 1, sc = o.sc ?? 1, t = A.t, bob = 0.15 * Math.sin(t * 1.7 + x), tilt = (o.tilt ?? 0.08) * dir;
  A.fx(z, (g, c) => { drawSprite(g, c, SPR.helicoptero, x, y + bob, z, { flip: dir < 0, sc, rot: tilt });
    const [hx, hy, s] = P(c, x + dir * 1.2 * sc, y + bob + 3.4 * sc, z), R = 7.2 * sc * s; g.save(); g.translate(hx, hy); g.rotate(tilt); g.globalAlpha = 0.28; g.fillStyle = "#c8ccd0"; g.beginPath(); g.ellipse(0, 0, R, 0.25 * s * sc, 0, 0, 7); g.fill();
    g.globalAlpha = 0.85; g.strokeStyle = "#141414"; g.lineWidth = Math.max(2, 0.12 * s * sc); const b = Math.cos(t * 41) * R; g.beginPath(); g.moveTo(-b, 0); g.lineTo(b, 0); g.stroke(); g.restore();
    const [tx, ty] = P(c, x - dir * 6.6 * sc, y + bob + 3.1 * sc, z); g.save(); g.translate(tx, ty); g.strokeStyle = "rgba(20,20,20,0.7)"; g.lineWidth = Math.max(1.5, 0.08 * s * sc); const r2 = 1.0 * sc * s; g.beginPath(); g.moveTo(Math.cos(t * 50) * r2, Math.sin(t * 50) * r2); g.lineTo(-Math.cos(t * 50) * r2, -Math.sin(t * 50) * r2); g.stroke(); g.restore(); }); };
/** avião de ataque (Super Tucano) com hélice e chama do escapamento */
export const jato = (A: Sc, x: number, y: number, z: number, o: { dir?: 1 | -1; sc?: number; ang?: number; luz?: boolean } = {}) => { const dir = o.dir ?? 1, sc = o.sc ?? 1;
  A.fx(z, (g, c) => { drawSprite(g, c, SPR.tucano, x, y, z, { flip: dir < 0, sc, rot: o.ang ?? 0 }); const [px, py, s] = P(c, x + dir * 4.9 * sc, y + 1.45 * sc, z); g.strokeStyle = "rgba(20,20,20,0.8)"; g.lineWidth = Math.max(1.5, 0.08 * s); const b = Math.sin(A.t * 47) * 0.8 * s * sc; g.beginPath(); g.moveTo(px, py - b); g.lineTo(px, py + b); g.stroke();
    if (o.luz) { const [lx, ly] = P(c, x - dir * 4.4 * sc, y + 2.8 * sc, z); glow(g, lx, ly, 0.6 * s, Math.floor(A.t * 2) % 2 ? "rgba(255,60,40,1)" : "rgba(255,255,255,1)", 0.9); } }); };
/** caminhão militar com rodas girando pela distância */
export const caminhao = (A: Sc, x: number, z: number, vel: number, o: { dir?: 1 | -1; sc?: number; poeira?: boolean } = {}) => { const dir = o.dir ?? 1, sc = o.sc ?? 1, t = A.t, bob = vel ? 0.025 * Math.sin(t * 11 + x) : 0;
  if (o.poeira && vel) A.fx(z + 0.5, (g, c) => { for (let k = 0; k < 6; k++) { const a = ((t * 1.1 + k / 6) % 1), [sx, sy, s] = P(c, x - dir * (3.6 + a * 3) * sc, 0.3 + a * 1.2, z + 0.4); puff(g, sx, sy, (0.4 + a * 1.4) * s * sc, [180, 160, 120], 0.45 * (1 - a)); } });
  A.fx(z, (g, c) => { drawSprite(g, c, SPR.caminhao, x, bob, z, { flip: dir < 0, sc });
    for (const wx of [-2.6, -1.4, 2.6]) { const [qx, qy, s] = P(c, x + dir * wx * sc, 0.5 * sc, z), r = 0.5 * sc * s, an = (vel * t) / (0.5 * sc) * dir; g.fillStyle = "#1a1a1a"; g.strokeStyle = INK; g.lineWidth = Math.max(1.5, 0.04 * s); g.beginPath(); g.arc(qx, qy, r, 0, 7); g.fill(); g.stroke();
      g.fillStyle = "#4a4e3a"; g.beginPath(); g.arc(qx, qy, r * 0.5, 0, 7); g.fill(); g.strokeStyle = "rgba(200,200,180,0.5)"; for (let k = 0; k < 4; k++) { const a = an + (k * Math.PI) / 2; g.beginPath(); g.moveTo(qx + Math.cos(a) * r * 0.15, qy + Math.sin(a) * r * 0.15); g.lineTo(qx + Math.cos(a) * r * 0.45, qy + Math.sin(a) * r * 0.45); g.stroke(); } } }); };

// ---------------- telas ----------------
/** telefone tocando sobre a mesa: pula, linhas de vibração e brilho */
export const telefone = (A: Sc, x: number, y: number, z: number, ring: number) => { A.fx(z, (g, c) => { const on = ring >= 0 && ring < 3 && Math.floor(ring * 5) % 2 === 0, jy = on ? 0.03 * Math.abs(Math.sin(ring * 60)) : 0;
  drawSprite(g, c, SPR.telefone, x + (on ? 0.012 * Math.sin(ring * 90) : 0), y + jy, z, {}); if (on) { const [sx, sy, s] = P(c, x, y + 0.25, z); g.strokeStyle = "rgba(255,250,220,0.9)"; g.lineWidth = Math.max(2, 0.02 * s);
    for (const sd of [-1, 1]) for (let k = 1; k <= 3; k++) { g.beginPath(); g.arc(sx, sy, k * 0.08 * s, sd < 0 ? Math.PI * 0.8 : -Math.PI * 0.2, sd < 0 ? Math.PI * 1.2 : Math.PI * 0.2); g.stroke(); } } }); };
/** tela de TV na parede: brilho que pisca com as cores da notícia */
export const tela = (A: Sc, x: number, y: number, z: number, w: number, h: number, cols: string[], T: number) => A.fx(z, (g, c) => {
  const [x0, y0, s] = P(c, x - w / 2, y + h, z), W = w * s, H = h * s, k = Math.floor(T * 3) % cols.length; g.fillStyle = "#101014"; g.fillRect(x0 - 0.08 * s, y0 - 0.08 * s, W + 0.16 * s, H + 0.16 * s);
  const gr = g.createLinearGradient(x0, y0, x0, y0 + H); gr.addColorStop(0, cols[k]); gr.addColorStop(1, mix(cols[k], "#000000", 0.6)); g.fillStyle = gr; g.fillRect(x0, y0, W, H);
  for (let i = 0; i < 6; i++) { const f = hash(i + Math.floor(T * 8)); g.fillStyle = `rgba(255,${180 + 60 * f},120,${0.35 * f})`; g.beginPath(); g.ellipse(x0 + W * hash(i * 3), y0 + H * (0.55 + 0.3 * hash(i * 7)), W * 0.12, H * 0.1, 0, 0, 7); g.fill(); }
  g.fillStyle = "#c41a1a"; g.fillRect(x0, y0 + H * 0.82, W, H * 0.12); g.fillStyle = "rgba(255,255,255,0.85)"; g.fillRect(x0 + W * 0.04, y0 + H * 0.85, W * 0.5, H * 0.05);
  glow(g, x0 + W / 2, y0 + H / 2, W * 0.9, "rgba(140,170,255,1)", 0.18);
});

// ---------------- sobreposições ----------------
/** calendário que folheia para trás (os anos descem até 2008) e para em MARÇO 2008 com um pulo */
export const calendario = (g: Ctx, t: number, tStop: number) => {
  if (t < 0) return; const meses = ["JANEIRO", "FEVEREIRO", "MARÇO", "ABRIL", "MAIO", "JUNHO", "JULHO", "AGOSTO", "SETEMBRO", "OUTUBRO", "NOVEMBRO", "DEZEMBRO"];
  const flips = Math.max(0, Math.ceil((tStop - t) / 0.11)), ano = Math.min(2026, 2008 + flips), mes = t >= tStop ? "MARÇO" : meses[(flips * 5 + 2) % 12];
  const k = easeOut(clamp(t / 0.35)), pop = t >= tStop ? 1 + 0.12 * Math.exp(-(t - tStop) * 7) * Math.cos((t - tStop) * 22) : 1, W = 460, H = 520;
  g.save(); g.globalAlpha = k; g.translate(VW / 2, VH / 2 + (1 - k) * 80); g.scale(pop, pop); g.fillStyle = "rgba(0,0,0,0.35)"; g.fillRect(-W / 2 + 14, -H / 2 + 18, W, H);
  g.fillStyle = "#f6efe0"; g.fillRect(-W / 2, -H / 2, W, H); g.fillStyle = "#c8161e"; g.fillRect(-W / 2, -H / 2, W, H * 0.24); g.strokeStyle = "#241726"; g.lineWidth = 6; g.strokeRect(-W / 2, -H / 2, W, H);
  for (const dx of [-W * 0.3, W * 0.3]) { g.fillStyle = "#8a8a8a"; g.beginPath(); g.arc(dx, -H / 2, 14, 0, 7); g.fill(); g.stroke(); }
  g.fillStyle = "#fff"; g.textAlign = "center"; g.textBaseline = "middle"; g.font = `bold 60px "DejaVu Sans", sans-serif`; g.fillText(mes, 0, -H / 2 + H * 0.12);
  g.fillStyle = "#241726"; g.font = `bold 180px "DejaVu Serif", serif`; g.fillText(String(ano), 0, H * 0.1);
  if (t < tStop) { const f = 1 - (((tStop - t) / 0.11) % 1); g.save(); g.globalAlpha = 0.95 * (1 - f); g.fillStyle = "#ece4d0"; g.strokeStyle = "#241726"; g.lineWidth = 3; const top = -H / 2 + H * 0.24; g.beginPath(); g.moveTo(-W / 2, top); g.lineTo(W / 2, top); g.lineTo(W / 2 - 30 * f, top - (H * 0.76) * f * 0.9); g.lineTo(-W / 2 + 30 * f, top - (H * 0.76) * f * 0.9); g.closePath(); g.fill(); g.stroke(); g.restore(); }
  g.restore();
};
/** mira de visão noturna que se fecha sobre o alvo */
export const mira = (g: Ctx, t: number, x: number, y: number) => { if (t < 0) return; const k = easeOut(clamp(t / 0.6)), r = lerp(420, 150, k), a = Math.min(1, t / 0.2);
  g.save(); g.globalAlpha = 0.9 * a; g.strokeStyle = "rgba(170,255,170,0.9)"; g.lineWidth = 4; g.beginPath(); g.arc(x, y, r, 0, 7); g.stroke(); g.beginPath(); g.arc(x, y, r * 0.35, 0, 7); g.stroke();
  for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { g.beginPath(); g.moveTo(x + dx * r * 0.45, y + dy * r * 0.45); g.lineTo(x + dx * r * 1.25, y + dy * r * 1.25); g.stroke(); }
  if (Math.floor(t * 4) % 2 === 0 && k >= 1) { g.fillStyle = "rgba(255,80,60,0.95)"; g.beginPath(); g.arc(x, y, 9, 0, 7); g.fill(); } g.restore(); };
/** visão noturna (verde, granulada, linhas) */
export const visaoNoturna = (g: Ctx, t: number, a = 1) => { g.save(); g.globalAlpha = a; g.globalCompositeOperation = "multiply"; g.fillStyle = "#6aff8a"; g.fillRect(0, 0, VW, VH); g.globalCompositeOperation = "source-over";
  for (let y = 0; y < VH; y += 4) { g.fillStyle = "rgba(0,0,0,0.12)"; g.fillRect(0, y, VW, 1.5); }
  const gr = g.createRadialGradient(VW / 2, VH / 2, VH * 0.35, VW / 2, VH / 2, VH * 0.85); gr.addColorStop(0, "rgba(0,0,0,0)"); gr.addColorStop(1, "rgba(0,0,0,0.85)"); g.fillStyle = gr; g.fillRect(0, 0, VW, VH);
  g.fillStyle = "rgba(200,255,200,0.9)"; g.font = `bold 30px "DejaVu Sans Mono", monospace`; g.textAlign = "left"; g.fillText(`REC ● 00:${String(17 + Math.floor(t)).padStart(2, "0")}:${String(Math.floor((t * 30) % 60)).padStart(2, "0")}`, 70, 80); g.restore(); };
/** flash branco de tela */
export const flashTela = (g: Ctx, age: number, a = 0.7, d = 0.25) => { if (age < 0 || age > d) return; g.save(); g.globalAlpha = a * (1 - age / d); g.fillStyle = "#fff"; g.fillRect(0, 0, VW, VH); g.restore(); };
/** flashes das câmeras dos jornalistas */
export const flashes = (A: Sc, T: number, xs: number[], y: number, z: number, seed = 1) => A.fx(z - 0.1, (g, c) => { for (let i = 0; i < xs.length; i++) { const ph = (T * (1.3 + hash(i + seed)) + hash(i * 7 + seed)) % 1; if (ph > 0.08) continue; const [sx, sy, s] = P(c, xs[i], y, z); glow(g, sx, sy, 1.6 * s, "rgba(255,255,255,1)", 1 - ph / 0.08); g.fillStyle = "#fff"; g.beginPath(); g.arc(sx, sy, 0.08 * s, 0, 7); g.fill(); } });
/** papel rasgado em dois que voa */
export const rasgo = (A: Sc, x: number, y: number, z: number, age: number) => A.fx(z, (g, c) => { const [sx, sy, s] = P(c, x, y, z), w = 0.5 * s, h = 0.66 * s, k = clamp(age / 0.5);
  for (const sd of [-1, 1]) { const dx = age > 0 ? sd * (0.05 + age * 0.9) * s : 0, dy = age > 0 ? (0.5 * 9.81 * Math.max(0, age - 0.25) ** 2 * 0.4) * s : 0, rot = age > 0 ? sd * Math.min(1.2, age * 2.2) : 0;
    g.save(); g.translate(sx + dx, sy + dy); g.rotate(rot); g.fillStyle = "#f4ede0"; g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.moveTo(0, -h / 2);
    for (let i = 0; i <= 8; i++) g.lineTo((i % 2 ? 0.03 : -0.03) * s * (age > 0 ? 1 : 0), -h / 2 + (i / 8) * h); g.lineTo(sd * w / 2, h / 2); g.lineTo(sd * w / 2, -h / 2); g.closePath(); g.fill(); g.stroke();
    g.strokeStyle = "rgba(40,30,24,0.45)"; g.lineWidth = 2; for (let i = 0; i < 6; i++) { g.beginPath(); g.moveTo(sd * 0.05 * s, -h / 2 + (i + 1) * h / 8); g.lineTo(sd * w * 0.42, -h / 2 + (i + 1) * h / 8); g.stroke(); } g.restore(); } void k; });
export { clamp, lerp, easeOut, easeIn, smooth, hash, glow, puff, P, VW, VH };
