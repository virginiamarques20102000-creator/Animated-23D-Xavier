// "Boneco vivo": personagem articulado (proporção humana estilizada) desenhado em vetor a cada quadro.
// Pernas com IK de dois ossos e pés PLANTADOS (o pé de apoio não escorrega: anda para trás exatamente na velocidade do corpo),
// quadril sobe e desce pela geometria da perna, braços em oposição às pernas, tronco inclina com a velocidade,
// cabeça com atraso (mola), cabelo/aba do casaco com inércia, respiração, troca de peso, piscadas, olhar que passeia,
// sobrancelhas e boca por emoção. Tudo é função do tempo (sem estado entre quadros).
import type { Outfit, Expr } from "../ww2/toon";
import { P, Cam, Ctx, clamp, lerp, hash, LITE } from "../ww2/engine";

const TAU = Math.PI * 2;
type V = [number, number];
export type Gait = { p: number; cyc: number; run?: boolean; v?: number };   // p = fração do ciclo (0..1), cyc = metros por ciclo (2 passos)
export type Pose = {
  view?: "side" | "front";            // side = 3/4 voltado para `dir`; front = de frente para a câmera
  dir?: 1 | -1; gait?: Gait | null; sit?: boolean; crouch?: number; expr?: Expr; look?: number; lookY?: number; headTilt?: number;
  prop?: null | [string, number]; armB?: number; wave?: number; talk?: boolean; t: number; id: number; lean?: number;
};
export type Extra = { y?: number; sc?: number; rot?: number; alpha?: number; dark?: number; darkCol?: string; shadow?: number; noCast?: boolean; flip?: boolean; local?: number };

// ---------------- cores ----------------
const hx = (c: string) => { if (c.startsWith("rgb")) { const m = c.match(/\d+/g)!.map(Number); return [m[0], m[1], m[2]]; } const n = parseInt(c.slice(1, 7), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
const rgb = (a: number[]) => `rgb(${a.map((v) => Math.round(clamp(v, 0, 255))).join(",")})`;
const mixC = (a: string, b: string, t: number) => { const A = hx(a), B = hx(b); return rgb(A.map((v, i) => v + (B[i] - v) * t)); };
const mulC = (a: string, k: number) => rgb(hx(a).map((v) => v * k));
const INKC = "#20141c";

// ---------------- emoções ----------------
type Face = { brow: number; browIn: number; eye: number; mouthW: number; open: number; curve: number; teeth?: boolean; pupil?: number; tongue?: boolean; sweat?: boolean };
const FACE: Record<string, Face> = {
  neutral: { brow: 0, browIn: 0, eye: 1, mouthW: 0.5, open: 0, curve: 0.05 },
  stern: { brow: -0.4, browIn: 0.9, eye: 0.75, mouthW: 0.5, open: 0, curve: -0.25 },
  grin: { brow: 0.3, browIn: -0.2, eye: 0.8, mouthW: 0.85, open: 0.25, curve: 0.9, teeth: true },
  laugh: { brow: 0.6, browIn: -0.4, eye: 0.35, mouthW: 0.85, open: 0.75, curve: 0.9, tongue: true },
  whistle: { brow: 0.3, browIn: 0, eye: 0.9, mouthW: 0.2, open: 0.3, curve: 0 },
  nervous: { brow: 0.45, browIn: -0.8, eye: 1.05, mouthW: 0.55, open: 0.08, curve: -0.35, sweat: true },
  shock: { brow: 1, browIn: -0.5, eye: 1.35, mouthW: 0.4, open: 0.9, curve: 0, pupil: 0.6 },
  relief: { brow: 0.3, browIn: -0.4, eye: 0.6, mouthW: 0.6, open: 0, curve: 0.5 },
  relief_open: { brow: 0.4, browIn: -0.4, eye: 0.6, mouthW: 0.6, open: 0.35, curve: 0.5 },
  dazed: { brow: 0.2, browIn: -0.3, eye: 0.5, mouthW: 0.5, open: 0.3, curve: -0.2 },
  pained: { brow: 0.3, browIn: -1, eye: 0.3, mouthW: 0.75, open: 0.3, curve: -0.6, teeth: true },
  smile: { brow: 0.25, browIn: -0.2, eye: 0.95, mouthW: 0.7, open: 0.15, curve: 0.8, teeth: true },
  smile_closed: { brow: 0.2, browIn: -0.2, eye: 0.7, mouthW: 0.6, open: 0, curve: 0.6 },
  lick: { brow: 0.2, browIn: 0, eye: 0.5, mouthW: 0.5, open: 0.5, curve: 0.2, tongue: true },
  shout: { brow: -0.5, browIn: 1, eye: 0.95, mouthW: 0.75, open: 1, curve: -0.2, teeth: true },
  sad: { brow: 0.2, browIn: -1, eye: 0.75, mouthW: 0.5, open: 0, curve: -0.6 },
  fear: { brow: 0.9, browIn: -0.9, eye: 1.3, mouthW: 0.6, open: 0.5, curve: -0.5, pupil: 0.65, teeth: true, sweat: true },
};

// ---------------- geometria ----------------
const ik = (hip: V, foot: V, l1: number, l2: number, bend: number): V => { // bend = sinal do lado para onde o joelho/cotovelo dobra
  const dx = foot[0] - hip[0], dy = foot[1] - hip[1], d = clamp(Math.hypot(dx, dy), 0.01, l1 + l2 - 1e-4);
  const a = Math.acos(clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1)), base = Math.atan2(dy, dx), k = base + a * bend;
  return [hip[0] + l1 * Math.cos(k), hip[1] + l1 * Math.sin(k)];
};
const sm = (u: number) => { u = clamp(u, 0, 1); return u * u * (3 - 2 * u); };

// ---------------- desenho ----------------
class Dr {
  constructor(public g: Ctx, public px: number, public L: { lit: number; dark: number; darkCol: string; key: string; ka: number; rim: string }) {}
  col(c: string) { let x = c; if (this.L.ka > 0) x = mixC(x, this.L.key, this.L.ka * 0.45); if (this.L.dark > 0) x = mixC(x, this.L.darkCol, this.L.dark); return x; }
  /** preenchimento com luz de um lado (luz principal) e sombra do outro */
  fill(c: string, x0: number, x1: number) { const g = this.g, gr = g.createLinearGradient(x0, 0, x1, 0), b = this.col(c), lit = this.L.lit;
    gr.addColorStop(0, lit > 0 ? mixC(b, "#fff8ea", 0.16) : mulC(b, 0.7)); gr.addColorStop(0.55, b); gr.addColorStop(1, lit > 0 ? mulC(b, 0.7) : mixC(b, "#fff8ea", 0.16)); return gr; }
  path(pts: V[], close = true) { const g = this.g; g.beginPath(); pts.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]))); if (close) g.closePath(); }
  shape(pts: V[], c: string, w = 1, flat = false) { const xs = pts.map((p) => p[0]); this.path(pts); const g = this.g; g.fillStyle = flat ? this.col(c) : this.fill(c, Math.min(...xs), Math.max(...xs)); g.fill(); if (w > 0) { g.lineWidth = this.px * 2.2 * w; g.strokeStyle = INKC; g.lineJoin = "round"; g.stroke(); } }
  /** membro afilado (cápsula) de a até b */
  limb(a: V, b: V, wa: number, wb: number, c: string, w = 1) {
    const g = this.g, an = Math.atan2(b[1] - a[1], b[0] - a[0]), nx = -Math.sin(an), ny = Math.cos(an);
    g.beginPath(); g.moveTo(a[0] + nx * wa, a[1] + ny * wa); g.lineTo(b[0] + nx * wb, b[1] + ny * wb); g.arc(b[0], b[1], wb, an + Math.PI / 2, an - Math.PI / 2, true);
    g.lineTo(a[0] - nx * wa, a[1] - ny * wa); g.arc(a[0], a[1], wa, an - Math.PI / 2, an + Math.PI / 2, true); g.closePath();
    g.fillStyle = this.fill(c, Math.min(a[0], b[0]) - wa, Math.max(a[0], b[0]) + wa); g.fill(); if (w > 0) { g.lineWidth = this.px * 2.2 * w; g.strokeStyle = INKC; g.stroke(); }
  }
  ell(x: number, y: number, rx: number, ry: number, c: string | null, w = 1, rot = 0, flat = false) { const g = this.g; g.beginPath(); g.ellipse(x, y, Math.abs(rx), Math.abs(ry), rot, 0, TAU); if (c) { g.fillStyle = flat ? this.col(c) : this.fill(c, x - rx, x + rx); g.fill(); } if (w > 0) { g.lineWidth = this.px * 2.2 * w; g.strokeStyle = INKC; g.stroke(); } }
  line(pts: V[], wpx: number, c: string) { this.path(pts, false); const g = this.g; g.lineWidth = this.px * wpx; g.strokeStyle = c; g.lineCap = "round"; g.lineJoin = "round"; g.stroke(); }
}

// ---------------- o personagem ----------------
export const drawPerson = (ctx: Ctx, cam: Cam, o: Outfit, x: number, z: number, ps: Pose, ex: Extra = {}) => {
  const LOC = ex.local; if (!LOC && z - cam.z < 0.35) return;
  const kid = o.build === "kid", stout = o.build === "stout", S = (ex.sc ?? 1) * (kid ? 0.68 : 1);
  const [sx, sy, s] = LOC ? [0, 0, LOC] : P(cam, x, ex.y ?? 0, z), k = s * S;
  if (!LOC && sx < -2 * k || sx > 1920 + 2 * k || sy < -0.2 * k || sy - 2.2 * k > 1080 + 50) return;
  const t = ps.t, id = ps.id, view = ps.view ?? "side", f = view === "front" ? 1 : (ps.dir ?? 1) as number;
  const L = LITE, litLeft = (L.rdx ?? 1) * f < 0 ? 1 : 0;
  const g = ctx; g.save(); g.translate(sx, sy);
  // sombra de contato + sombra projetada suave
  if (!LOC && (ex.shadow ?? 1) > 0 && Math.abs(ex.y ?? 0) < 0.6) { const ry = 0.06 * k, fy = clamp((cam.y - (ex.y ?? 0)) / (z - cam.z), 0.08, 0.6);
    g.fillStyle = `rgba(18,10,22,${0.32 * (ex.shadow ?? 1) * clamp(ex.alpha ?? 1)})`; g.beginPath(); g.ellipse(0, 0, 0.32 * k, 0.32 * k * fy * 1.2 + ry * 0.2, 0, 0, TAU); g.fill();
    if (!ex.noCast && L.sa > 0) { g.save(); g.globalAlpha = L.sa * 0.5 * clamp(ex.alpha ?? 1); g.fillStyle = "rgba(14,8,20,0.55)"; g.filter = `blur(${Math.max(1, 0.03 * k)}px)`; g.beginPath(); g.ellipse(-L.sx * 0.5 * k, 0, 0.55 * k, 0.12 * k * fy * 3, 0, 0, TAU); g.fill(); g.restore(); } }
  if (ex.rot) g.rotate(ex.rot);
  if (ex.alpha !== undefined && !LOC) g.globalAlpha = clamp(ex.alpha);
  g.scale(k, -k);  // metros, y para cima, origem entre os pés
  const d = new Dr(g, 1 / k, { lit: litLeft ? 1 : 0, dark: ex.dark ?? 0, darkCol: ex.darkCol ?? "#140f1e", key: L.key ?? "#ffffff", ka: L.ka ?? 0, rim: L.rim });
  if (litLeft === 0 && f < 0) d.L.lit = 1;
  // ---- proporções ----
  const TH = kid ? 0.42 : 0.46, SH = kid ? 0.4 : 0.44, UA = 0.29, FA = 0.27;
  const hipW = stout ? 0.19 : 0.16, shW = stout ? 0.25 : 0.22, torsoH = kid ? 0.44 : 0.53;
  const ph = id * 1.37 + 3, legLen = TH + SH;
  // ---- marcha ----
  const gt = ps.gait, run = !!gt?.run, cyc = gt?.cyc ?? 1.5, duty = run ? 0.38 : 0.6, stanceLen = cyc * duty, L1 = stanceLen / 2;
  const v = gt ? (gt.v ?? (run ? 3.4 : 1.3)) : 0;
  const crouch = clamp(ps.crouch ?? 0, 0, 1), breathe = Math.sin(t * 1.9 + ph);
  // troca de peso parado (a cada ~4 s, suave)
  const wsh = gt || ps.sit ? 0 : 0.035 * Math.sin(t * 0.55 + ph) * (0.6 + 0.4 * Math.sin(t * 0.23 + id));
  const LL = TH + SH + 0.04;
  let hipX = wsh * f, hipY = LL + 0.07 - 0.018 - crouch * 0.32, feet: { x: number; y: number; pitch: number }[] = [], stanceDx: number[] = [];
  if (ps.sit) { hipY = 0.47; hipX = 0; }
  else if (gt && view === "side") {
    for (let i = 0; i < 2; i++) { const q = ((gt.p + i * 0.5) % 1 + 1) % 1;
      if (q < duty) { const u = q / duty, lx = L1 - u * stanceLen; feet.push({ x: lx * f, y: 0, pitch: u > 0.75 ? (u - 0.75) * 1.6 : u < 0.12 ? -(0.12 - u) * 2 : 0 }); stanceDx.push(lx); }
      else { const u = (q - duty) / (1 - duty), e = sm(u), lx = -L1 + e * stanceLen, lift = (run ? 0.26 : 0.11) * Math.sin(Math.PI * u) + (run ? 0.12 * Math.sin(Math.PI * clamp(u * 1.6, 0, 1)) : 0);
        feet.push({ x: lx * f, y: lift, pitch: lerp(0.5, -0.25, e) }); } }
    // quadril: o mais alto que a perna de apoio permite (sobe no meio do apoio, desce na batida do calcanhar)
    const want = run ? LL * 0.93 + 0.07 : LL * 0.985 + 0.07;
    hipY = stanceDx.length ? Math.min(want, ...stanceDx.map((dx) => Math.sqrt(Math.max(0.01, LL * LL - dx * dx)) * 0.992 + 0.07)) : want + (run ? 0.05 * Math.sin(Math.PI * (((gt.p * 2) % 1))) : 0);
    hipY -= crouch * 0.3; hipX = 0;
  } else if (gt && view === "front") {
    for (let i = 0; i < 2; i++) { const q = ((gt.p + i * 0.5) % 1 + 1) % 1, sw = q >= duty, u = sw ? (q - duty) / (1 - duty) : 0; feet.push({ x: (i ? -1 : 1) * 0.1, y: sw ? 0.1 * Math.sin(Math.PI * u) : 0, pitch: 0 }); }
    hipY = LL * 0.98 + 0.07 - 0.025 * Math.abs(Math.cos(TAU * gt.p)); hipX = 0.025 * Math.sin(TAU * gt.p);
  } else { const st = view === "front" ? 0.1 : 0.09; feet = [{ x: st + hipX * 0.3, y: 0, pitch: 0 }, { x: -st + hipX * 0.3, y: 0, pitch: 0 }]; if (view === "side") { feet[0].x = 0.1 * f; feet[1].x = -0.05 * f; } }
  // ---- tronco ----
  const lean = (ps.lean ?? 0) + (gt ? (run ? 0.22 : 0.05 + 0.02 * v) * f : 0) + crouch * 0.25 * f + (ps.sit ? 0 : 0);
  const pel: V = [hipX, hipY], bob = gt ? 0 : 0.008 * breathe;
  const chestUp: V = [pel[0] + Math.sin(lean) * torsoH, pel[1] + Math.cos(lean) * torsoH + bob];
  const neck: V = [chestUp[0] + Math.sin(lean) * 0.05, chestUp[1] + 0.05];
  // cabeça: atraso em mola em relação ao balanço do corpo
  const headLag = gt ? -0.012 * Math.cos(TAU * 2 * gt.p - 0.6) : 0, tilt = ((ps.headTilt ?? 0) * Math.PI) / 180 + 0.04 * Math.sin(t * 1.05 + ph) + 0.025 * Math.sin(t * 2.3 + ph * 2) - lean * 0.5;
  const HR = kid ? 0.18 : 0.165, head: V = [neck[0] + Math.sin(lean * 0.6) * 0.02, neck[1] + HR * 1.05 + headLag];
  // ---- braços ----
  const shN: V = [chestUp[0] + (view === "front" ? shW * 0.95 : shW * 0.35 * f), chestUp[1] - 0.04], shF: V = [chestUp[0] - (view === "front" ? shW * 0.95 : shW * 0.55 * f), chestUp[1] - 0.03];
  const armLen = UA + FA, prop = ps.prop, pk = prop ? prop[1] : 0, pn = prop ? prop[0] : "";
  const swingA = gt ? (run ? 0.75 : 0.42) * Math.sin(TAU * gt.p) : 0;
  // gestos de quem fala/grita: antecipação → subida rápida → segura → acomodação
  const talker = ps.talk || ps.expr === "shout" || ps.expr === "stern" || ps.expr === "grin" || ps.expr === "laugh" || id % 3 === 0;
  const per = 2.2 + 1.3 * hash(id), gp = ((t + hash(id + 5) * per) % per) / per;
  const gest = gt || ps.sit || !talker ? 0 : gp < 0.08 ? -0.15 * Math.sin((gp / 0.08) * Math.PI) : gp < 0.2 ? sm((gp - 0.08) / 0.12) : gp < 0.42 ? 1 + 0.05 * Math.sin((gp - 0.2) * 40) : 1 - sm((gp - 0.42) / 0.25);
  const rest = (sh: V, sgn: number, sw: number): V => { const a = sw + sgn * 0.08; return [sh[0] + Math.sin(a) * armLen * 0.97 * (view === "front" ? 0.35 : 1) + (view === "front" ? sgn * 0.05 : 0), sh[1] - Math.cos(a) * armLen * 0.97]; };
  let hN: V = rest(shN, view === "front" ? 1 : 0.4 * f, view === "front" ? 0 : -swingA * f), hF: V = rest(shF, view === "front" ? -1 : -0.3 * f, view === "front" ? 0 : swingA * f), elbowOutN = 1, elbowOutF = 1;
  if (view === "front" && gt) { hN = [hN[0], hN[1] + 0.06 * Math.sin(TAU * gt.p)]; hF = [hF[0], hF[1] - 0.06 * Math.sin(TAU * gt.p)]; }
  const fw = (dx: number, dy: number, sh = shN): V => [sh[0] + dx * (view === "front" ? 1 : f), sh[1] + dy];
  // braço livre animado (armB) e gesticulação
  const armB = ps.armB ?? 0;
  if (!gt && !ps.sit && !prop) { const gk = gest * 0.85 + armB * 0.6; if (gk > 0.02) hN = [lerp(hN[0], fw(0.3, 0.05)[0], clamp(gk, 0, 1)), lerp(hN[1], fw(0.3, 0.05)[1] + 0.08 * Math.sin(t * 3 + ph), clamp(gk, 0, 1))]; }
  let held: { kind: string; at: V; ang: number } | null = null;
  switch (pn) {
    case "fist": { const up = clamp(pk, 0, 1.2); hN = [lerp(hN[0], fw(0.12, 0.5)[0], up), lerp(hN[1], fw(0.12, 0.5)[1] + 0.05 * Math.sin(t * 6 + ph), up)]; break; }
    case "hammer": { const a = lerp(2.2, -0.2, clamp(pk, 0, 1)); hN = [shN[0] + Math.sin(a) * 0.48 * f + 0.15 * f, shN[1] + Math.cos(a) * 0.44 - 0.05]; held = { kind: "hammer", at: hN, ang: a }; elbowOutN = -1; break; }
    case "paper": case "book": case "bread": case "letter": case "pen": { hN = fw(0.26, -0.24); hF = fw(0.22, -0.26, shF); held = { kind: pn, at: [(hN[0] + hF[0]) / 2, hN[1] + 0.04], ang: 0 }; break; }
    case "baby": { hN = fw(0.2, -0.3); hF = fw(0.3, -0.24, shF); held = { kind: "baby", at: [(hN[0] + hF[0]) / 2, hN[1] + 0.05], ang: 0 }; break; }
    case "suitcase": { hN = fw(0.05, -armLen * 0.95); held = { kind: "suitcase", at: hN, ang: 0 }; break; }
    case "torch": { hN = fw(0.35, -0.12 + 0.3 * clamp(pk, 0, 1)); held = { kind: "torch", at: hN, ang: 0 }; break; }
    case "brush": { hN = fw(0.38, -0.32 + 0.03 * Math.sin(t * 14)); held = { kind: "chisel", at: hN, ang: 0 }; break; }
    case "flag": { hN = fw(0.18, 0.2); held = { kind: "flag", at: hN, ang: 0 }; break; }
    case "point": { hN = fw(0.55, 0.05); break; }
  }
  if (ps.wave) hN = fw(0.2 + 0.08 * Math.sin(t * 9), 0.55);
  if (ps.sit && !prop) { hN = fw(0.32, -0.3); hF = fw(0.28, -0.32, shF); }
  // ---- desenho (de trás para frente) ----
  const skin = o.skin ?? "#f2c8a0", pants = o.pants, jacket = o.jacket, boots = o.boots;
  const knee = (hp: V, ft: V): V => ik(hp, ft, TH, SH + 0.04, view === "front" ? -1 : f > 0 ? 1 : -1);
  const hipN: V = view === "front" ? [pel[0] + hipW * 0.55, pel[1]] : [pel[0] + 0.04 * f, pel[1]], hipF: V = view === "front" ? [pel[0] - hipW * 0.55, pel[1]] : [pel[0] - 0.04 * f, pel[1]];
  const legW = stout ? 0.085 : 0.072;
  const drawLeg = (hp: V, ft: { x: number; y: number; pitch: number }, far: boolean) => {
    if (ps.sit) { const fr = view === "front", kn: V = fr ? [hp[0] * 1.4, 0.47] : [hp[0] + 0.42 * f, 0.5], an: V = fr ? [kn[0], 0.08] : [kn[0] + 0.04 * f, 0.08]; const c = far ? mulC(pants, 0.82) : pants; d.limb(hp, kn, legW, legW * 0.9, c); d.limb(kn, an, legW * 0.9, legW * 0.75, c); shoe(an, 0, far); return; }
    const ankle: V = [ft.x, ft.y + 0.07]; const kn = knee(hp, ankle), c = far ? mulC(pants, 0.82) : pants;
    if (o.dress && !far) { /* a saia cobre a coxa; meia na canela */ d.limb(kn, ankle, 0.045, 0.04, mulC(skin, 0.85)); }
    else if (o.dress) d.limb(kn, ankle, 0.045, 0.04, mulC(skin, 0.75));
    else { d.limb(hp, kn, legW, legW * 0.88, c); d.limb(kn, ankle, legW * 0.88, legW * 0.7, c); }
    shoe(ankle, ft.pitch, far);
  };
  const shoe = (an: V, pitch: number, far: boolean) => { const c = far ? mulC(boots, 0.8) : boots; g.save(); g.translate(an[0], an[1] - 0.04); g.rotate(view === "front" ? 0 : -pitch * f);
    if (view === "front") d.ell(0, -0.005, 0.06, 0.045, c); else d.shape([[-0.06 * f, -0.04], [0.15 * f, -0.04], [0.16 * f, 0.0], [0.08 * f, 0.03], [-0.06 * f, 0.05]], c); g.restore(); };
  const drawArm = (sh: V, hand: V, far: boolean, out: number) => {
    const el = ik(sh, hand, UA, FA, (view === "front" ? (sh[0] > pel[0] ? 1 : -1) : -f) * out * (view === "front" ? -1 : 1)), c = far ? mulC(jacket, 0.8) : jacket, aw = stout ? 0.062 : 0.052;
    d.limb(sh, el, aw, aw * 0.9, c); d.limb(el, hand, aw * 0.9, aw * 0.78, c); d.ell(hand[0], hand[1], 0.045, 0.05, far ? mulC(skin, 0.85) : skin, 0.8);
  };
  // braço e perna de trás
  if (view === "side") { drawArm(shF, hF, true, elbowOutF); drawLeg(hipF, feet[1], true); drawLeg(hipN, feet[0], false); }
  else { drawLeg(hipF, feet[1], false); drawLeg(hipN, feet[0], false); }
  // rifle nas costas
  if (o.rifle) d.line([[chestUp[0] - 0.12 * f, chestUp[1] + 0.12], [pel[0] - 0.05 * f, pel[1] - 0.35]], 7, "#3a2a1c");
  // tronco (casaco com caimento e aba que balança)
  const flap = gt ? 0.025 * Math.sin(TAU * gt.p * 2 - 1.2) : 0.006 * Math.sin(t * 1.3 + ph);
  const tw = view === "front" ? 1 : 0.78, bw = (stout ? 1.18 : 1) * (1 + 0.012 * breathe);
  const hemY = pel[1] - (o.dress ? 0.42 : 0.12);
  const torso: V[] = [[chestUp[0] - shW * tw * bw, chestUp[1] - 0.02], [chestUp[0] + shW * tw * bw, chestUp[1] - 0.02],
    [pel[0] + hipW * 1.05 * tw * bw + (o.dress ? 0.12 : 0), hemY + flap], [pel[0] - hipW * 1.05 * tw * bw - (o.dress ? 0.12 : 0), hemY - flap]];
  d.shape(torso, o.dress ?? jacket);
  if (o.dress) d.shape([[chestUp[0] - shW * tw * 0.95, chestUp[1] - 0.02], [chestUp[0] + shW * tw * 0.95, chestUp[1] - 0.02], [pel[0] + hipW * tw, pel[1] + 0.02], [pel[0] - hipW * tw, pel[1] + 0.02]], jacket);
  const cx = chestUp[0] + (view === "front" ? 0 : 0.07 * f);
  // gola/lapela/camisa/gravata
  if (!o.dress) { d.shape([[cx - 0.07, chestUp[1] - 0.01], [cx + 0.07, chestUp[1] - 0.01], [cx, chestUp[1] - 0.2]], o.tie ? "#ece6da" : mulC(jacket, 0.8), 0.8);
    if (o.tie) d.shape([[cx - 0.018, chestUp[1] - 0.03], [cx + 0.018, chestUp[1] - 0.03], [cx + 0.025, chestUp[1] - 0.2], [cx, chestUp[1] - 0.23], [cx - 0.025, chestUp[1] - 0.2]], o.tie, 0.6);
    d.line([[cx - 0.08, chestUp[1] - 0.01], [cx - 0.01, chestUp[1] - 0.24]], 2, mulC(jacket, 0.6)); d.line([[cx + 0.08, chestUp[1] - 0.01], [cx + 0.01, chestUp[1] - 0.24]], 2, mulC(jacket, 0.6)); }
  if (o.buttons) for (let i = 0; i < 4; i++) d.ell(cx + 0.012, chestUp[1] - 0.25 - i * 0.075, 0.012, 0.012, o.buttons, 0.5, 0, true);
  if (o.sash) d.line([[chestUp[0] + shW * 0.6 * tw, chestUp[1] - 0.02], [pel[0] - hipW * 0.8 * tw, pel[1] + 0.06]], 5, d.col(o.sash));
  if (o.belt || o.sash) d.line([[pel[0] - hipW * 1.0 * tw, pel[1] + 0.03], [pel[0] + hipW * 1.0 * tw, pel[1] + 0.03]], 5, d.col(o.belt ?? o.sash!));
  if (o.medals) for (let i = 0; i < 3; i++) d.ell(cx - 0.1 * f + i * 0.035, chestUp[1] - 0.15, 0.014, 0.02, ["#c9a24a", "#b3221c", "#d8d8d8"][i], 0.5, 0, true);
  if (o.band) d.limb([shN[0], shN[1] - 0.12], [shN[0], shN[1] - 0.17], 0.058, 0.058, o.band, 0.5);
  if (o.scarf) d.shape([[neck[0] - 0.09, neck[1] - 0.02], [neck[0] + 0.09, neck[1] - 0.02], [neck[0] + 0.05, neck[1] - 0.1], [neck[0] - 0.05, neck[1] - 0.1]], o.scarf, 0.8);
  // pescoço e cabeça
  d.limb([neck[0], neck[1] - 0.04], [neck[0], neck[1] + 0.05], 0.042, 0.042, mulC(skin, 0.9), 0.8);
  drawHead(d, o, head, HR, ps, f, view, tilt, t, id, ph);
  // mão/objeto e braço da frente
  if (view === "side") drawArm(shN, hN, false, elbowOutN); else { drawArm(shF, hF, false, 1); drawArm(shN, hN, false, 1); }
  if (held) drawHeld(d, held, f, t);
  g.restore();
};

const drawHeld = (d: Dr, h: { kind: string; at: V; ang: number }, f: number, t: number) => {
  const [x, y] = h.at, g = d.g;
  if (h.kind === "hammer") { g.save(); g.translate(x, y); g.rotate(-(h.ang - 1.2) * f); d.limb([0, -0.02], [0, 0.3], 0.014, 0.014, "#7a5230", 0.7); d.shape([[-0.06, 0.28], [0.08, 0.28], [0.08, 0.34], [-0.06, 0.34]], "#5a5a60", 0.8); g.restore(); }
  else if (h.kind === "paper" || h.kind === "letter") d.shape([[x - 0.13, y - 0.06], [x + 0.13, y - 0.05], [x + 0.12, y + 0.2], [x - 0.12, y + 0.19]], "#ece4d0", 0.8, true);
  else if (h.kind === "book") d.shape([[x - 0.12, y - 0.05], [x + 0.12, y - 0.05], [x + 0.12, y + 0.13], [x - 0.12, y + 0.13]], "#6a2a24", 0.8);
  else if (h.kind === "bread") d.ell(x, y + 0.02, 0.1, 0.05, "#c8904a", 0.8);
  else if (h.kind === "baby") { d.ell(x, y, 0.14, 0.08, "#f2eee6", 0.8); d.ell(x + 0.1 * f, y + 0.04, 0.05, 0.05, "#f2c8a0", 0.6); }
  else if (h.kind === "suitcase") { d.shape([[x - 0.18, y - 0.32], [x + 0.18, y - 0.32], [x + 0.18, y - 0.04], [x - 0.18, y - 0.04]], "#6a4a2a"); d.line([[x - 0.05, y - 0.04], [x - 0.04, y + 0.01], [x + 0.04, y + 0.01], [x + 0.05, y - 0.04]], 2.5, "#3a2a1a"); }
  else if (h.kind === "torch") { d.line([[x, y], [x, y - 0.06]], 2, "#2a2a2a"); d.shape([[x - 0.05, y - 0.06], [x + 0.05, y - 0.06], [x + 0.04, y - 0.18], [x - 0.04, y - 0.18]], "#ffe8a0", 0.8, true); }
  else if (h.kind === "chisel") d.limb([x - 0.04 * f, y], [x + 0.16 * f, y - 0.04], 0.012, 0.008, "#9a9a9e", 0.6);
  else if (h.kind === "flag") { d.line([[x, y - 0.3], [x, y + 0.6]], 3, "#5a3a22"); d.shape([[x, y + 0.6], [x + 0.4 * f, y + 0.55 + 0.03 * Math.sin(t * 5)], [x + 0.4 * f, y + 0.3], [x, y + 0.33]], "#b3221c", 0.8); }
};

const drawHead = (d: Dr, o: Outfit, c: V, R: number, ps: Pose, f: number, view: string, tilt: number, t: number, id: number, ph: number) => {
  const g = d.g; g.save(); g.translate(c[0], c[1]); g.rotate(-tilt * f);
  const skin = o.skin ?? "#f2c8a0", F = FACE[ps.expr ?? "neutral"] ?? FACE.neutral;
  // olhar que passeia (sacadas a cada ~1,3 s) + direção pedida
  const sac = Math.floor(t / (1.1 + hash(id) * 0.8) + hash(id + 2) * 9), lookX = clamp((ps.look ?? 0) * 0.8 + (hash(sac * 3.1 + id) - 0.5) * 0.5, -1, 1), lookY = (ps.lookY ?? 0) + (hash(sac * 7.7 + id) - 0.5) * 0.3;
  const yaw = view === "front" ? clamp((ps.look ?? 0) * 0.35, -0.4, 0.4) : 0.62 * f;      // quanto o rosto está virado
  const per = 2.4 + 1.7 * hash(id * 3), bk = ((t + hash(id + 9) * per) % per), blink = bk < 0.05 ? bk / 0.05 : bk < 0.13 ? 1 - (bk - 0.05) / 0.08 : 0;
  const micro = 0.15 * Math.sin(t * 0.8 + ph) * (hash(Math.floor(t / 3) + id) > 0.6 ? 1 : 0);            // levantada de sobrancelha de vez em quando
  // orelha (lado de trás), cabeça
  if (view !== "front") d.ell(-0.085 * f + yaw * 0.02, 0.0, 0.03, 0.045, skin, 0.8);
  else for (const sgn of [-1, 1]) d.ell(sgn * 0.12, 0.0, 0.028, 0.042, skin, 0.8);
  g.beginPath(); const W = R * 0.88, Hh = R; g.moveTo(-W, 0.1 * R); g.bezierCurveTo(-W, Hh * 1.05, W, Hh * 1.05, W, 0.1 * R); g.bezierCurveTo(W * 0.95, -Hh * 0.75, W * 0.3 + yaw * 0.03, -Hh * 1.05, 0 + yaw * 0.04, -Hh * 1.05); g.bezierCurveTo(-W * 0.3 + yaw * 0.03, -Hh * 1.05, -W * 0.95, -Hh * 0.75, -W, 0.1 * R); g.closePath();
  g.fillStyle = d.fill(skin, -W, W); g.fill(); g.lineWidth = d.px * 2.2; g.strokeStyle = INKC; g.stroke();
  // bochecha corada leve
  g.fillStyle = "rgba(230,110,100,0.16)"; g.beginPath(); g.ellipse(yaw * 0.06 + 0.06, -0.04, 0.03, 0.02, 0, 0, TAU); g.fill();
  // olhos
  const ex = (side: number) => yaw * 0.085 + side * 0.058 * (1 - Math.abs(yaw) * 0.35), ey = 0.025, es = (side: number) => (view === "front" ? 1 : side * f > 0 ? 1 : 0.8);
  for (const side of [-1, 1]) { const x = ex(side), sc = es(side), open = Math.max(0, F.eye * (1 - blink)), rx = 0.035 * sc, ry = 0.041 * open * sc;
    if (ry > 0.004) { d.ell(x, ey, rx, ry, "#fbf8f2", 0.8, 0, true); const pr = 0.0175 * (F.pupil ?? 1) * sc; g.fillStyle = "#1e1612"; g.beginPath(); g.ellipse(x + lookX * 0.015 + yaw * 0.008, ey + lookY * 0.011, pr, Math.min(pr * 1.2, ry), 0, 0, TAU); g.fill(); g.fillStyle = "#fff"; g.beginPath(); g.arc(x + lookX * 0.011 - 0.004, ey + 0.006, pr * 0.35, 0, TAU); g.fill(); }
    else d.line([[x - rx, ey], [x + rx, ey]], 2.2, INKC);
    // pálpebra superior para expressões de olhos semicerrados
    if (F.eye < 0.9 && ry > 0.004) { g.fillStyle = d.col(skin); g.beginPath(); g.ellipse(x, ey + ry * 0.9, rx * 1.15, ry * (0.9 - F.eye) * 1.2, 0, 0, TAU); g.fill(); }
    // sobrancelha
    const bh = ey + 0.064 + (F.brow + micro) * 0.026, inn = F.browIn * 0.022 * (side > 0 ? 1 : -1) * (view === "front" ? 1 : 1);
    d.line([[x - 0.036 * sc, bh - (side > 0 ? -inn : inn) * 0.5 - (side < 0 ? inn : 0)], [x + 0.036 * sc, bh + (side > 0 ? -inn : 0) - (side < 0 ? -inn * 0.5 : 0)]], 4.6, o.hair && o.hat !== "bald" ? mulC(o.hair, 0.8) : "#3a2a1e"); }
  // nariz
  const nx = yaw * 0.105; d.path([[nx - 0.008, 0.0], [nx + 0.03 * Math.sign(f) * (view === "front" ? 0.3 : 1), -0.045], [nx - 0.004, -0.05]], false); g.lineWidth = d.px * 2; g.strokeStyle = mulC(skin, 0.6); g.stroke();
  // boca (larga/aberta/curva por emoção; fala = abre e fecha)
  const talkOpen = ps.talk ? 0.35 + 0.35 * Math.abs(Math.sin(t * 13 + id)) : 0, op = Math.max(F.open, talkOpen) * (1 + 0.08 * Math.sin(t * 9 + ph)), mw = 0.058 * F.mouthW * 1.6, mx = yaw * 0.095, my = -0.1, cv = F.curve * 0.03;
  if (op < 0.05) { g.beginPath(); g.moveTo(mx - mw, my + cv); g.quadraticCurveTo(mx, my - cv, mx + mw, my + cv); g.lineWidth = d.px * 2.4; g.strokeStyle = INKC; g.lineCap = "round"; g.stroke(); }
  else { const oh = 0.062 * op; g.beginPath(); g.moveTo(mx - mw, my + cv); g.quadraticCurveTo(mx, my - cv * 0.4 + 0.004, mx + mw, my + cv); g.quadraticCurveTo(mx, my - oh - cv * 0.6, mx - mw, my + cv); g.closePath();
    g.fillStyle = "#5a1a1e"; g.fill(); g.save(); g.clip(); if (F.teeth) { g.fillStyle = "#fbf8f2"; g.fillRect(mx - mw, my - 0.012 + cv * 0.3, mw * 2, 0.014); } if (F.tongue || op > 0.6) { g.fillStyle = "#d8606a"; g.beginPath(); g.ellipse(mx, my - oh * 0.9, mw * 0.6, oh * 0.4, 0, 0, TAU); g.fill(); } g.restore();
    g.lineWidth = d.px * 2; g.strokeStyle = INKC; g.stroke(); }
  // bigode / barba / óculos
  if (o.moustache) { if (o.mstyle === "brush") d.shape([[mx - 0.022, my + 0.028], [mx + 0.022, my + 0.028], [mx + 0.02, my + 0.006], [mx - 0.02, my + 0.006]], o.moustache, 0.5, true);
    else d.shape([[mx - 0.05, my + 0.012], [mx, my + 0.032], [mx + 0.05, my + 0.012], [mx + 0.03, my + 0.002], [mx - 0.03, my + 0.002]], o.moustache, 0.5, true); }
  if (o.beard) d.shape([[-0.1, -0.02], [0.1, -0.02], [0.06, -0.14], [-0.06, -0.14]], o.beard, 0.6, true);
  if (o.glasses) for (const side of [-1, 1]) d.ell(ex(side), ey, 0.034, 0.03, null, 1.1);
  if (F.sweat) { g.fillStyle = "rgba(160,210,255,0.85)"; g.beginPath(); g.ellipse(-0.1 * f, 0.06 - ((t * 0.3) % 0.1), 0.01, 0.016, 0, 0, TAU); g.fill(); }
  drawHair(d, o, R, f, view, t, ps);
  g.restore();
};

const drawHair = (d: Dr, o: Outfit, R: number, f: number, view: string, t: number, ps: Pose) => {
  const hat = o.hat ?? "hair", hair = o.hair ?? "#3a2a1e", cap = o.cap ?? "#3a3a3a", W = R * 0.92, top = R * 1.02, g = d.g;
  const sway = ps.gait ? 0.01 * Math.sin(Math.PI * 2 * ps.gait.p * 2 - 1.5) : 0.003 * Math.sin(t * 1.7);
  const crown = (col: string, low = 0.35) => d.shape([[-W * 1.02, R * low], [-W * 0.9, R * 0.8], [-W * 0.4, top * 1.06], [W * 0.4, top * 1.06], [W * 0.92, R * 0.8], [W * 1.02, R * low], [W * 0.55, R * 0.62 + 0.02], [-W * 0.2 * f, R * 0.66 + 0.01]], col, 1);
  switch (hat) {
    case "bald": break;
    case "sidepart": crown(hair, 0.3); d.shape([[-W * 0.1 * f, R * 0.95], [W * 0.95 * f, R * 0.55], [W * 0.6 * f, R * 0.35 + sway], [W * 0.1 * f, R * 0.6]], hair, 0.8); break;
    case "longhair": case "bonnet": { d.shape([[-W * 1.08, R * 0.5], [-W * 1.0, -R * 0.9 + sway], [-W * 0.75, -R * 0.95 + sway], [-W * 0.72, R * 0.2], [W * 0.72, R * 0.2], [W * 0.75, -R * 0.95 + sway], [W * 1.0, -R * 0.9 + sway], [W * 1.08, R * 0.5], [W * 0.5, top * 1.08], [-W * 0.5, top * 1.08]], hair, 1); break; }
    case "headscarf": d.shape([[-W * 1.1, -R * 0.3], [-W * 1.05, R * 0.6], [0, top * 1.12], [W * 1.05, R * 0.6], [W * 1.1, -R * 0.3], [W * 0.8, R * 0.2], [-W * 0.8, R * 0.2]], cap, 1); break;
    case "fedora": case "homburg": case "tophat": case "bowler": { crown(hair, 0.25); const hh = hat === "tophat" ? 0.22 : hat === "bowler" ? 0.11 : 0.13;
      d.shape([[-W * 1.45, R * 0.62], [W * 1.45, R * 0.62], [W * 1.3, R * 0.72], [-W * 1.3, R * 0.72]], cap, 1);
      if (hat === "bowler") d.ell(0, R * 0.72, W * 0.85, hh, cap, 1, 0); else d.shape([[-W * 0.85, R * 0.7], [W * 0.85, R * 0.7], [W * 0.75, R * 0.7 + hh], [0, R * 0.7 + hh - (hat === "fedora" ? 0.025 : 0)], [-W * 0.75, R * 0.7 + hh]], cap, 1);
      d.line([[-W * 0.84, R * 0.74], [W * 0.84, R * 0.74]], 4, mulC(cap, 0.55)); break; }
    case "peaked": case "garrison": case "kepi": case "pilotka": { crown(hair, 0.3); d.shape([[-W * 0.95, R * 0.6], [W * 0.95, R * 0.6], [W * 1.15, R * 0.95], [-W * 1.15, R * 0.95]], cap, 1);
      d.line([[-W * 0.95, R * 0.62], [W * 0.95, R * 0.62]], 4, "#b3221c"); d.shape([[W * 0.2 * f, R * 0.62], [W * 1.25 * f, R * 0.5], [W * 1.1 * f, R * 0.62]], "#141414", 0.8, true); break; }
    case "cap": crown(hair, 0.3); d.shape([[-W * 1.0, R * 0.55], [W * 1.0, R * 0.55], [W * 0.85, top * 1.05], [-W * 0.85, top * 1.05]], cap, 1); d.shape([[W * 0.2 * f, R * 0.56], [W * 1.4 * f, R * 0.5], [W * 1.3 * f, R * 0.6]], mulC(cap, 0.7), 0.8); break;
    case "beret": crown(hair, 0.3); d.ell(W * 0.15 * f, R * 0.9, W * 1.05, R * 0.25, cap, 1, -0.15 * f); break;
    case "stahlhelm": case "brodie": case "adrian": case "m1": case "pickel": case "helmetJ": case "ushanka": {
      d.shape([[-W * 1.2, R * 0.2], [-W * 1.05, R * 0.75], [-W * 0.5, top * 1.12], [W * 0.5, top * 1.12], [W * 1.05, R * 0.75], [W * 1.2, R * 0.2], [W * 1.0, R * 0.3], [-W * 1.0, R * 0.3]], cap, 1);
      g.save(); g.globalAlpha *= 0.3; d.ell(-W * 0.35, R * 0.8, W * 0.3, R * 0.12, "#ffffff", 0, -0.3, true); g.restore(); break; }
    default: crown(hair, 0.32);
  }
};
