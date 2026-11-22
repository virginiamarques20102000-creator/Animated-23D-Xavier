// Realistic effects for the WW2 film: physical explosions (fireball, shock ring, ballistic debris that bounces, embers, lingering smoke),
// atomic cloud, flak, searchlights, lens flares and glints, sparks, glass, coins, confetti and paper with flutter physics, water, birds, breath.
import { Ctx, Cam, VW, VH, P, glow, puff, clamp, lerp, easeOut, hash, rng } from "./engine";

export const G = 9.81;
/** height of a bouncing body: dropped/thrown at vy0 (m/s) from y0, restitution e; returns [y, vy, bounces] */
export const bounce = (t: number, y0: number, vy0: number, e = 0.38, g = G): [number, number, number] => {
  let y = y0, v = vy0, tt = t, n = 0;
  for (let i = 0; i < 8; i++) {
    const disc = v * v + 2 * g * y, tHit = (v + Math.sqrt(Math.max(0, disc))) / g;
    if (tt < tHit) return [y + v * tt - 0.5 * g * tt * tt, v - g * tt, n];
    tt -= tHit; v = (Math.sqrt(Math.max(0, disc))) * e; y = 0; n++;
    if (v < 0.3) return [0, 0, n];
  }
  return [0, 0, n];
};
/** damped spring response 0..1 (overshoot) */
export const spring = (t: number, f = 3, z = 0.35) => (t <= 0 ? 0 : 1 - Math.exp(-z * f * 6.28 * t) * Math.cos(f * 6.28 * Math.sqrt(1 - z * z) * t));

const fireCol = (k: number, a: number) => { // k: 0 white-hot .. 1 dark smoke
  const stops: [number, number[]][] = [[0, [255, 250, 225]], [0.18, [255, 214, 120]], [0.38, [255, 130, 40]], [0.55, [200, 60, 20]], [0.72, [70, 40, 34]], [1, [44, 40, 42]]];
  let i = 0; while (i < stops.length - 2 && k > stops[i + 1][0]) i++;
  const [k0, c0] = stops[i], [k1, c1] = stops[i + 1], f = clamp((k - k0) / (k1 - k0));
  return `rgba(${c0.map((v, j) => Math.round(lerp(v, c1[j], f))).join(",")},${a})`;
};
/** full physical explosion at world point. age in s, size ~ fireball radius (m) */
export const blast = (g: Ctx, cam: Cam, age: number, x: number, y: number, z: number, size = 2.5, seed = 1, o: { debris?: number; dirt?: boolean; smoke?: number; ring?: boolean } = {}) => {
  if (age < 0 || age > 9) return;
  const [sx, sy, s] = P(cam, x, y, z), R = size * s, r = rng(seed * 977 + 13);
  // flash + light on everything around
  if (age < 0.25) { const k = 1 - age / 0.25; glow(g, sx, sy - 0.3 * R, R * 7, "rgba(255,236,190,1)", 0.9 * k); glow(g, sx, sy - 0.3 * R, R * 2.2, "rgba(255,255,240,1)", k); }
  // ground shock ring (dust)
  if (o.ring !== false && age < 1.2) { const k = easeOut(age / 1.2), [, gy, gs] = P(cam, x, 0, z), rr = (0.6 + 5 * k) * size * gs, fy = clamp(cam.y / (z - cam.z), 0.08, 0.5);
    g.save(); g.globalAlpha = 0.55 * (1 - k); g.strokeStyle = "rgba(200,180,150,1)"; g.lineWidth = Math.max(2, 0.5 * size * gs * (1 - k)); g.beginPath(); g.ellipse(sx, gy, rr, rr * fy, 0, 0, 7); g.stroke(); g.restore(); }
  // lingering smoke column (drifts, rises)
  const SM = o.smoke ?? 1;
  for (let i = 0; i < 14; i++) { const st = 0.35 + i * 0.12; const a2 = age - st; if (a2 < 0) continue;
    const rise = (2.2 + r() * 1.6) * a2 * size * 0.55, dx = (r() - 0.5) * size * 1.2 + a2 * 0.35 * size * 0.3;
    const [px, py, ps] = P(cam, x + dx, y + size * 0.6 + rise, z + (r() - 0.5) * size * 0.4), rad = (0.6 + 0.45 * a2) * size * ps;
    puff(g, px, py, rad, [52 + i * 2, 47 + i * 2, 46 + i], 0.82 * SM * clamp(a2 / 0.3) * clamp(1 - a2 / 8)); }
  // fireball: buoyant hot puffs cooling to smoke
  const n = 18;
  for (let i = 0; i < n; i++) {
    const ang = r() * Math.PI * 2, sp = 0.4 + r() * 0.8, life = 0.9 + r() * 0.9, k = clamp(age / life);
    const d = easeOut(clamp(age / 0.5)) * sp * size, px0 = Math.cos(ang) * d, py0 = Math.abs(Math.sin(ang)) * d * 0.9 + age * age * 1.6 * (0.5 + r());
    const [px, py, ps] = P(cam, x + px0, y + py0 + size * 0.25, z + (r() - 0.5) * size * 0.5), rad = (0.35 + 0.55 * easeOut(k)) * size * ps * (0.7 + r() * 0.5);
    if (k >= 1) continue;
    const hot = k < 0.45;
    const grd = g.createRadialGradient(px, py - rad * 0.2, rad * 0.05, px, py, rad);
    grd.addColorStop(0, fireCol(k * 0.9, 0.95 * (1 - k * 0.5))); grd.addColorStop(0.6, fireCol(Math.min(1, k * 0.9 + 0.2), 0.8 * (1 - k * 0.6))); grd.addColorStop(1, fireCol(1, 0));
    g.fillStyle = grd; g.beginPath(); g.arc(px, py, rad, 0, 7); g.fill();
    if (hot) { g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.5 * (1 - k / 0.45); g.fillStyle = "rgba(255,200,110,1)"; g.beginPath(); g.arc(px, py, rad * 0.55, 0, 7); g.fill(); g.restore(); }
  }
  // ballistic debris: chunks fly, spin, hit the ground, bounce and settle; dirt clods leave puffs
  const nd = o.debris ?? 22;
  for (let i = 0; i < nd; i++) {
    const vx = (r() - 0.5) * 18 * Math.sqrt(size / 2.5), vy = 5 + r() * 12 * Math.sqrt(size / 2.5), vz = (r() - 0.5) * 6, sz = 0.06 + r() * 0.22, spin = (r() - 0.5) * 30, dark = r();
    const [hy, , nb] = bounce(age, y + 0.3, vy, 0.3);
    const drag = 1 - Math.exp(-age * 0.8), tx = vx * (nb ? 1 : 1) * drag / 0.8, px = x + tx * (nb ? 0.9 : 1), pz = z + vz * drag / 0.8;
    if (pz - cam.z < 0.4) continue;
    const [qx, qy, qs] = P(cam, px, Math.max(0, hy), pz);
    g.save(); g.translate(qx, qy); g.rotate(spin * Math.min(age, 1.4)); g.fillStyle = o.dirt === false ? (dark > 0.5 ? "#2a2624" : "#6a625a") : dark > 0.5 ? "#3a2c20" : "#6e5a40";
    g.fillRect(-sz * qs, -sz * qs * 0.6, sz * 2 * qs, sz * 1.2 * qs); g.restore();
    if (age < 1.8 && i % 3 === 0) { const [tx2, ty2] = P(cam, px - vx * 0.03, Math.max(0, hy - 0.2), pz); g.strokeStyle = "rgba(60,50,40,0.35)"; g.lineWidth = Math.max(1, sz * qs); g.beginPath(); g.moveTo(qx, qy); g.lineTo(tx2, ty2); g.stroke(); }
  }
  // embers / sparks (hot, ballistic, fade)
  g.save(); g.globalCompositeOperation = "lighter";
  for (let i = 0; i < 26; i++) { const vx = (r() - 0.5) * 16, vy = 4 + r() * 14, life = 0.7 + r() * 1.3; if (age > life) continue;
    const px = x + vx * age, py = y + 0.5 + vy * age - 0.5 * G * age * age; if (py < 0) continue;
    const [qx, qy, qs] = P(cam, px, py, z + (r() - 0.5) * 2), [tx, ty] = P(cam, px - vx * 0.025, py - (vy - G * age) * 0.025, z);
    g.strokeStyle = `rgba(255,${190 + Math.round(60 * r())},120,${(1 - age / life) * 0.95})`; g.lineWidth = Math.max(1.2, 0.035 * qs); g.beginPath(); g.moveTo(qx, qy); g.lineTo(tx, ty); g.stroke(); }
  g.restore();
};
/** scorch / crater left on the ground after a blast */
export const scorch = (g: Ctx, cam: Cam, x: number, z: number, r: number, a = 0.7) => { const [sx, sy, s] = P(cam, x, 0, z), fy = clamp(cam.y / (z - cam.z), 0.06, 0.5);
  const gr = g.createRadialGradient(sx, sy, 0, sx, sy, r * s); gr.addColorStop(0, `rgba(20,14,12,${a})`); gr.addColorStop(1, "rgba(20,14,12,0)"); g.save(); g.translate(sx, sy); g.scale(1, fy); g.translate(-sx, -sy); g.fillStyle = gr; g.beginPath(); g.arc(sx, sy, r * s, 0, 7); g.fill(); g.restore(); };
/** water column from a bomb / shell hitting the sea */
export const splash = (g: Ctx, cam: Cam, age: number, x: number, z: number, h = 12, seed = 1) => {
  if (age < 0 || age > 4) return; const r = rng(seed * 31 + 5);
  for (let i = 0; i < 40; i++) { const vx = (r() - 0.5) * h * 0.35, vy = h * (0.6 + 0.6 * r()) * 1.3, px = x + vx * age, py = vy * age - 0.5 * G * age * age; if (py < 0) continue;
    const [qx, qy, qs] = P(cam, px, py, z + (r() - 0.5) * 2); puff(g, qx, qy, (0.5 + age * 0.6) * qs * (0.5 + r()), [228, 236, 240], 0.8 * clamp(1 - age / 3.2)); }
  const [bx, by, bs] = P(cam, x, 0, z); puff(g, bx, by, h * 0.35 * bs * (0.4 + age), [235, 240, 242], 0.6 * clamp(1 - age / 3));
};
/** atomic explosion seen from afar: flash, fireball rising into a mushroom with a rolling cap, condensation ring, stem, ground shock */
export const mushroom = (g: Ctx, cam: Cam, age: number, x: number, z: number, S = 1, seed = 3) => {
  if (age < 0) return; const r = rng(seed);
  const H = (6 + 3.4 * easeOut(clamp(age / 9))) * 100 * S * clamp(age / 1.2, 0.15, 1) ** 0.6; // cap height (m)
  const capR = (90 + 260 * easeOut(clamp(age / 10))) * S, [bx, by, bs] = P(cam, x, 0, z);
  // ground base surge
  for (let i = 0; i < 26; i++) { const a = r() * Math.PI, d = easeOut(clamp(age / 6)) * (250 + r() * 500) * S, [px, py, ps] = P(cam, x + Math.cos(a) * d * (r() > 0.5 ? 1 : -1), 10 * S, z + Math.sin(a) * 30);
    puff(g, px, py, (40 + r() * 60) * S * ps * (0.6 + age * 0.1), [190, 170, 160], 0.7 * clamp(age / 0.6)); }
  // stem
  for (let i = 0; i < 22; i++) { const k = i / 22, [px, py, ps] = P(cam, x + Math.sin(i * 1.7 + age * 0.4) * 12 * S, k * H * 0.92, z);
    const hot = clamp(1 - age / 6); puff(g, px, py, (38 + 26 * (1 - k)) * S * ps, [Math.round(lerp(196, 255, hot)), Math.round(lerp(176, 170, hot)), Math.round(lerp(168, 120, hot))], 0.9); }
  // cap: rolling torus of puffs, hot underside glow
  for (let i = 0; i < 40; i++) { const a = (i / 40) * Math.PI * 2 + age * 0.25, rr = capR * (0.55 + 0.45 * hash(i + seed)), cx = x + Math.cos(a) * rr, cy = H + Math.sin(a * 2 + age) * capR * 0.22 + (Math.sin(a) > 0 ? 1 : -0.3) * capR * 0.25;
    const [px, py, ps] = P(cam, cx, cy, z + Math.sin(a) * capR * 0.3), hot = clamp(1 - age / 5) * (Math.sin(a) < 0 ? 1 : 0.4), rad = capR * 0.42 * ps * (0.8 + 0.4 * hash(i * 3));
    const grd = g.createRadialGradient(px, py - rad * 0.3, rad * 0.1, px, py, rad); grd.addColorStop(0, `rgba(${Math.round(lerp(236, 255, hot))},${Math.round(lerp(224, 200, hot))},${Math.round(lerp(216, 140, hot))},0.97)`);
    grd.addColorStop(0.7, `rgba(${Math.round(lerp(176, 230, hot))},${Math.round(lerp(150, 110, hot))},${Math.round(lerp(150, 60, hot))},0.9)`); grd.addColorStop(1, "rgba(150,120,120,0)"); g.fillStyle = grd; g.beginPath(); g.arc(px, py, rad, 0, 7); g.fill(); }
  // early fireball
  if (age < 3) { const [px, py, ps] = P(cam, x, H * 0.9, z), k = age / 3; glow(g, px, py, capR * 2.2 * ps, "rgba(255,190,110,1)", 0.9 * (1 - k)); glow(g, px, py, capR * 0.9 * ps, "rgba(255,250,220,1)", 1 - k); }
  // condensation ring (Wilson cloud)
  if (age > 0.6 && age < 5) { const k = (age - 0.6) / 4.4, [px, py, ps] = P(cam, x, H * 0.55, z); g.save(); g.globalAlpha = 0.55 * Math.sin(Math.PI * k); g.strokeStyle = "#f4f2ee"; g.lineWidth = 30 * S * ps;
    g.beginPath(); g.ellipse(px, py, capR * 2.2 * ps * (0.6 + k), capR * 0.25 * ps * (0.6 + k), 0, 0, 7); g.stroke(); g.restore(); }
  // initial flash over everything
  if (age < 0.6) { g.save(); g.globalAlpha = 1 - age / 0.6; g.fillStyle = "#fffdf4"; g.fillRect(0, 0, VW, VH); g.restore(); }
};
/** flak burst in the sky */
export const flak = (g: Ctx, cam: Cam, age: number, x: number, y: number, z: number, s0 = 1) => { if (age < 0 || age > 5) return; const [sx, sy, s] = P(cam, x, y, z);
  if (age < 0.12) glow(g, sx, sy, 3 * s * s0, "rgba(255,210,140,1)", 1 - age / 0.12); puff(g, sx + age * 4 * s, sy, (0.8 + 1.4 * easeOut(age / 1.5)) * s * s0, [34, 30, 32], 0.85 * clamp(1 - age / 5)); };
/** searchlight beam from a ground point, sweeping */
export const searchlight = (g: Ctx, cam: Cam, x: number, z: number, ang: number, a = 0.32, len = 900, col = "220,230,255") => {
  const [sx, sy, s] = P(cam, x, 0, z), L = len * s * 0.02 + VH * 1.4; g.save(); g.globalCompositeOperation = "lighter"; g.translate(sx, sy); g.rotate(ang);
  const gr = g.createLinearGradient(0, 0, 0, -L); gr.addColorStop(0, `rgba(${col},${a})`); gr.addColorStop(1, `rgba(${col},0)`); g.fillStyle = gr; g.beginPath(); g.moveTo(-3, 0); g.lineTo(-L * 0.035, -L); g.lineTo(L * 0.035, -L); g.lineTo(3, 0); g.fill(); g.restore();
  glow(g, sx, sy, 30, `rgba(${col},1)`, 0.7);
};
/** anamorphic lens flare: streak + ghosts mirrored through the frame centre */
export const lensFlare = (g: Ctx, x: number, y: number, a: number, col = "255,214,160") => {
  if (a <= 0) return; g.save(); g.globalCompositeOperation = "lighter";
  const gr = g.createLinearGradient(x - VW * 0.6, y, x + VW * 0.6, y); gr.addColorStop(0, `rgba(${col},0)`); gr.addColorStop(0.5, `rgba(${col},${0.5 * a})`); gr.addColorStop(1, `rgba(${col},0)`);
  a *= 0.6; g.fillStyle = gr; g.fillRect(x - VW * 0.6, y - 3, VW * 1.2, 6); glow(g, x, y, 120, `rgba(${col},1)`, 0.6 * a);
  const cx = VW / 2, cy = VH / 2; [[0.4, 40, "160,200,255"], [0.75, 22, "255,180,120"], [1.25, 70, "140,255,200"], [1.6, 34, "255,140,200"]].forEach(([k, rr, c]) => {
    const px = x + (cx - x) * 2 * (k as number) * 0.5, py = y + (cy - y) * 2 * (k as number) * 0.5; g.globalAlpha = 0.16 * a; g.fillStyle = `rgba(${c},1)`; g.beginPath(); g.arc(px, py, rr as number, 0, 7); g.fill(); });
  g.restore();
};
/** star glint (binocular lens, metal, medal) at a screen point */
export const glint = (g: Ctx, x: number, y: number, r: number, a: number, rot = 0.3) => {
  if (a <= 0) return; g.save(); g.globalCompositeOperation = "lighter"; g.translate(x, y); g.rotate(rot); glow(g, 0, 0, r * 0.9, "rgba(255,250,230,1)", a);
  g.fillStyle = `rgba(255,252,240,${a})`; for (let k = 0; k < 2; k++) { g.rotate(Math.PI / 2); g.beginPath(); g.moveTo(-r * 2.2, 0); g.lineTo(0, -r * 0.08); g.lineTo(r * 2.2, 0); g.lineTo(0, r * 0.08); g.fill(); }
  g.rotate(Math.PI / 4); g.globalAlpha = 0.5; for (let k = 0; k < 2; k++) { g.rotate(Math.PI / 2); g.beginPath(); g.moveTo(-r, 0); g.lineTo(0, -r * 0.05); g.lineTo(r, 0); g.lineTo(0, r * 0.05); g.fill(); } g.restore();
};
/** welding/grinding sparks fountain (ballistic streaks) */
export const sparks = (g: Ctx, cam: Cam, t: number, x: number, y: number, z: number, dir = 1, n = 40, seed = 1) => {
  g.save(); g.globalCompositeOperation = "lighter";
  for (let i = 0; i < n; i++) { const per = 0.5 + hash(seed + i) * 0.5, k = ((t + hash(i * 7 + seed) * per) % per), vx = dir * (1.5 + hash(i) * 4), vy = 0.5 + hash(i + 3) * 3.5;
    const px = x + vx * k, py = y + vy * k - 0.5 * G * k * k; if (py < 0) continue; const [qx, qy, qs] = P(cam, px, py, z + (hash(i + 9) - 0.5) * 0.5), [tx, ty] = P(cam, px - vx * 0.02, py - (vy - G * k) * 0.02, z);
    g.strokeStyle = `rgba(255,${200 + Math.round(55 * hash(i))},140,${1 - k / per})`; g.lineWidth = Math.max(1, 0.02 * qs); g.beginPath(); g.moveTo(qx, qy); g.lineTo(tx, ty); g.stroke(); }
  const [sx, sy, s] = P(cam, x, y, z); glow(g, sx, sy, 0.8 * s, "rgba(190,220,255,1)", 0.7 + 0.3 * Math.sin(t * 60)); g.restore();
};
/** rising embers over a fire area */
export const embers = (g: Ctx, cam: Cam, t: number, x: number, z: number, w = 8, n = 40, h = 10, seed = 2) => {
  g.save(); g.globalCompositeOperation = "lighter";
  for (let i = 0; i < n; i++) { const per = 2 + hash(i + seed) * 3, k = ((t + hash(i * 3 + seed) * per) % per) / per, px = x + (hash(i * 5 + seed) - 0.5) * w + Math.sin(t * 2 + i) * 0.4 + k * 1.5, py = k * h;
    const [qx, qy, qs] = P(cam, px, py, z + (hash(i) - 0.5) * 3); g.fillStyle = `rgba(255,${150 + Math.round(80 * hash(i + 1))},60,${(1 - k) * 0.9})`; g.beginPath(); g.arc(qx, qy, Math.max(1.2, 0.03 * qs), 0, 7); g.fill(); }
  g.restore();
};
/** glass shards breaking out of a pane: fall, tumble, glint, bounce on the pavement */
export const shards = (g: Ctx, cam: Cam, age: number, x: number, y: number, z: number, w: number, h: number, seed = 4, n = 30) => {
  if (age < 0) return; const r = rng(seed);
  for (let i = 0; i < n; i++) { const ox = (r() - 0.5) * w, oy = r() * h, vx = (r() - 0.5) * 2.4, vz = -0.5 - r() * 2.0, vy = r() * 1.6, sz = 0.04 + r() * 0.14, sp = (r() - 0.5) * 14;
    const [hy] = bounce(age, y + oy, vy, 0.22), drag = Math.min(age, 1.2), px = x + ox + vx * drag, pz = z + vz * drag; if (pz - cam.z < 0.3) continue;
    const [qx, qy, qs] = P(cam, px, Math.max(0, hy), pz), ang = sp * Math.min(age, 1.0) + i; g.save(); g.translate(qx, qy); g.rotate(ang);
    g.fillStyle = "rgba(200,225,235,0.55)"; g.strokeStyle = "rgba(255,255,255,0.8)"; g.lineWidth = 1; g.beginPath(); g.moveTo(0, -sz * qs); g.lineTo(sz * 0.7 * qs, sz * 0.5 * qs); g.lineTo(-sz * 0.6 * qs, sz * 0.3 * qs); g.closePath(); g.fill(); g.stroke(); g.restore();
    if (Math.sin(ang * 3 + age * 9) > 0.93) glint(g, qx, qy, 6 + sz * qs * 0.5, 0.8); }
};
/** coins pouring & bouncing, spinning (edge-on flicker) */
export const coins = (g: Ctx, cam: Cam, t: number, x: number, y0: number, z: number, n = 40, rate = 12, seed = 6) => {
  for (let i = 0; i < n; i++) { const born = i / rate, age = t - born; if (age < 0) continue; const vx = (hash(i + seed) - 0.5) * 1.6, vz = (hash(i * 3) - 0.5) * 0.8;
    const [hy, , nb] = bounce(age, y0, -1, 0.45), px = x + vx * Math.min(age, 0.8 + nb * 0.1), pz = z + vz * Math.min(age, 0.8); const [qx, qy, qs] = P(cam, px, Math.max(0.02, hy) + (i % 7) * 0.01, pz);
    const spin = Math.abs(Math.cos(age * 18 + i)) * (nb > 2 ? 0.2 : 1) + 0.15, r = 0.06 * qs;
    g.fillStyle = "#e8c24a"; g.strokeStyle = "#7a5a18"; g.lineWidth = 1.2; g.beginPath(); g.ellipse(qx, qy - r * 0.3, r, r * spin, 0, 0, 7); g.fill(); g.stroke();
    if ((i + Math.floor(t * 8)) % 9 === 0) glint(g, qx, qy - r * 0.4, 8, 0.6); }
};
/** fluttering sheets (paper, banknotes, confetti, petals): fall with drag, sway and tumble */
export const flutter = (g: Ctx, cam: Cam, t: number, o: { n: number; x0: number; x1: number; z0: number; z1: number; top: number; cols: string[]; size: number; fall?: number; wind?: number; seed?: number; loop?: boolean; t0?: number }) => {
  const fall = o.fall ?? 0.9, wind = o.wind ?? 0.3, seed = o.seed ?? 1;
  for (let i = 0; i < o.n; i++) { const born = (o.t0 ?? 0) + hash(i + seed) * (o.loop ? 0 : 0.6), age = t - born; if (age < 0) continue;
    const per = o.top / fall, k = o.loop ? (age / per + hash(i * 7 + seed)) % 1 : clamp(age / per), y = o.top * (1 - k), sway = Math.sin(age * (2 + hash(i) * 2) + i) * 0.4;
    const x = lerp(o.x0, o.x1, hash(i * 3 + seed)) + wind * age * (o.loop ? 0 : 1) + sway, z = lerp(o.z0, o.z1, hash(i * 5 + seed)); if (z - cam.z < 0.4) continue;
    const [qx, qy, qs] = P(cam, x, Math.max(0.01, y), z), tumble = Math.cos(age * (5 + hash(i + 2) * 6) + i), sz = o.size * qs;
    g.save(); g.translate(qx, qy); g.rotate(sway * 0.8 + i); g.scale(1, Math.max(0.12, Math.abs(tumble))); g.fillStyle = o.cols[i % o.cols.length]; g.fillRect(-sz / 2, -sz * 0.32, sz, sz * 0.64);
    g.fillStyle = tumble > 0 ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.18)"; g.fillRect(-sz / 2, -sz * 0.32, sz, sz * 0.64); g.restore(); }
};
/** animated sea surface over the ground plane: horizontal wave crests + sun glitter */
export const sea = (g: Ctx, cam: Cam, t: number, o: { crest?: string; glitter?: [number, string]; z0?: number; z1?: number; amp?: number; n?: number; seed?: number } = {}) => {
  const n = o.n ?? 220, r = rng(o.seed ?? 5), z0 = o.z0 ?? cam.z + 2, z1 = o.z1 ?? 600;
  for (let i = 0; i < n; i++) { const z = z0 + (z1 - z0) * Math.pow(r(), 1.8), x = cam.x + (r() - 0.5) * (z - cam.z) * 2.2, ph = r() * 7; if (z - cam.z < 1) continue;
    const [sx, sy, s] = P(cam, x + Math.sin(t * 0.6 + ph) * 0.5, 0, z), L = (1.2 + r() * 2.4) * s, k = 0.5 + 0.5 * Math.sin(t * 1.4 + ph);
    g.strokeStyle = o.crest ?? "rgba(240,248,255,0.5)"; g.globalAlpha = 0.35 + 0.5 * k; g.lineWidth = Math.max(1, 0.06 * s); g.beginPath(); g.moveTo(sx - L, sy); g.quadraticCurveTo(sx, sy - 0.12 * s * k, sx + L, sy); g.stroke(); }
  g.globalAlpha = 1;
  if (o.glitter) { const [gx, col] = o.glitter; g.save(); g.globalCompositeOperation = "lighter";
    for (let i = 0; i < 160; i++) { const z = cam.z + 5 + 500 * Math.pow(hash(i + 3), 1.5), x = gx + (hash(i * 7) - 0.5) * (z - cam.z) * 0.18, tw = Math.sin(t * 6 + i * 2.7); if (tw < 0.4) continue;
      const [sx, sy, s] = P(cam, x, 0, z); g.fillStyle = `rgba(${col},${(tw - 0.4) * 1.4})`; g.fillRect(sx - Math.max(2, 0.25 * s), sy - 1, Math.max(4, 0.5 * s), 2); } g.restore(); }
};
/** foamy wake + bow wave behind a moving hull */
export const wake = (g: Ctx, cam: Cam, t: number, x: number, z: number, len: number, dir = 1, wid = 3) => {
  for (let i = 0; i < 30; i++) { const k = i / 30, px = x - dir * k * len + Math.sin(t * 2 + i) * 0.3, [sx, sy, s] = P(cam, px, 0.1, z + (hash(i) - 0.5) * wid * (0.3 + k));
    puff(g, sx, sy, (0.6 + k * 1.6) * wid * 0.35 * s, [236, 244, 248], 0.55 * (1 - k)); }
};
/** smoke trail of a hit aircraft: list of past positions */
export const trail = (g: Ctx, cam: Cam, pts: [number, number, number][], dark = true, fire = true) => {
  pts.forEach(([x, y, z], i) => { const k = i / pts.length, [sx, sy, s] = P(cam, x, y, z); puff(g, sx, sy, (0.6 + (1 - k) * 2.2) * s, dark ? [40, 36, 38] : [230, 232, 236], 0.7 * k); });
  if (fire && pts.length) { const [x, y, z] = pts[pts.length - 1], [sx, sy, s] = P(cam, x, y, z); glow(g, sx, sy, 2.2 * s, "rgba(255,150,40,1)", 0.9); }
};
/** flock of birds flapping (V shapes) crossing the frame in world space */
export const birds = (g: Ctx, cam: Cam, t: number, n: number, x0: number, y0: number, z: number, vx: number, col = "#1e1a1e", seed = 3, size = 0.5) => {
  for (let i = 0; i < n; i++) { const ox = (hash(i + seed) - 0.5) * n * 1.4, oy = (hash(i * 3 + seed) - 0.5) * n * 0.5, ph = t * (6 + hash(i) * 2) + i, x = x0 + vx * t + ox + Math.sin(t + i) * 0.4, y = y0 + oy + Math.sin(t * 0.7 + i) * 0.3;
    const [sx, sy, s] = P(cam, x, y, z + hash(i + 7) * 6), w = size * s, f = Math.sin(ph) * 0.6 * w; g.strokeStyle = col; g.lineWidth = Math.max(1.2, 0.08 * s); g.beginPath(); g.moveTo(sx - w, sy - f); g.quadraticCurveTo(sx - w * 0.4, sy - f * 0.2 - w * 0.15, sx, sy); g.quadraticCurveTo(sx + w * 0.4, sy - f * 0.2 - w * 0.15, sx + w, sy - f); g.stroke(); }
};
/** visible breath (cold) puffing from a mouth every ~2 s */
export const breath = (g: Ctx, cam: Cam, t: number, x: number, y: number, z: number, dir = 1, seed = 1) => {
  const per = 2.2 + hash(seed) * 0.8, k = ((t + hash(seed * 3) * per) % per) / per; if (k > 0.55) return; const a = k / 0.55;
  const [sx, sy, s] = P(cam, x + dir * (0.1 + a * 0.5), y + a * 0.15, z); puff(g, sx, sy, (0.06 + a * 0.28) * s, [236, 240, 246], 0.55 * (1 - a));
};
/** dust kicked behind wheels / tracks / boots */
export const dust = (g: Ctx, cam: Cam, t: number, x: number, z: number, dir = 1, amt = 1, col: [number, number, number] = [190, 170, 140], seed = 2) => {
  for (let i = 0; i < 12; i++) { const k = ((t * 0.9 + hash(i + seed)) % 1), [sx, sy, s] = P(cam, x - dir * k * 4 * amt, 0.2 + k * 1.4 * amt, z + (hash(i * 3) - 0.5) * 1.2);
    puff(g, sx, sy, (0.3 + k * 1.4) * amt * s, col, 0.5 * (1 - k)); }
};
/** bricks / chunks falling from a wall with gravity, bouncing and leaving dust */
export const rubble = (g: Ctx, cam: Cam, age: number, x: number, y: number, z: number, w: number, seed = 5, n = 26, col = "#8a6a52") => {
  if (age < 0) return; const r = rng(seed);
  for (let i = 0; i < n; i++) { const ox = (r() - 0.5) * w, oy = r() * 2, delay = r() * 0.4, a = age - delay; if (a < 0) continue; const vx = (r() - 0.5) * 2, vz = -r() * 2.5, sp = (r() - 0.5) * 12, sz = 0.12 + r() * 0.2;
    const [hy] = bounce(a, y + oy, 0.5 + r() * 1.5, 0.25), px = x + ox + vx * Math.min(a, 1.4), pz = z + vz * Math.min(a, 1.2); const [qx, qy, qs] = P(cam, px, Math.max(0, hy), pz);
    g.save(); g.translate(qx, qy); g.rotate(sp * Math.min(a, 1.1)); g.fillStyle = i % 3 ? col : "#5a4a3e"; g.strokeStyle = "#241c18"; g.lineWidth = 1.2; g.fillRect(-sz * qs, -sz * 0.5 * qs, sz * 2 * qs, sz * qs); g.strokeRect(-sz * qs, -sz * 0.5 * qs, sz * 2 * qs, sz * qs); g.restore(); }
  for (let i = 0; i < 10; i++) { const a = age - 0.3 - i * 0.05; if (a < 0) continue; const [qx, qy, qs] = P(cam, x + (hash(i + seed) - 0.5) * w, 0.3 + a * 1.2, z - 0.5); puff(g, qx, qy, (0.6 + a * 1.4) * qs, [170, 156, 140], 0.55 * clamp(1 - a / 3)); }
};
/** jagged lightning bolt in screen space */
export const lightning = (g: Ctx, x0: number, y0: number, x1: number, y1: number, a: number, seed = 1) => {
  if (a <= 0) return; const r = rng(seed); const pts: number[][] = [[x0, y0]]; const n = 14;
  for (let i = 1; i < n; i++) pts.push([lerp(x0, x1, i / n) + (r() - 0.5) * 120, lerp(y0, y1, i / n) + (r() - 0.5) * 30]); pts.push([x1, y1]);
  g.save(); g.globalCompositeOperation = "lighter"; for (const [lw, al] of [[22, 0.18], [9, 0.45], [3, 1]]) { g.strokeStyle = `rgba(220,230,255,${al * a})`; g.lineWidth = lw; g.lineJoin = "round"; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); }
  g.restore();
};
/** rocket exhaust flame + smoke trail behind a point moving along dir (radians, screen) */
export const exhaust = (g: Ctx, sx: number, sy: number, s: number, ang: number, len: number, t: number) => {
  g.save(); g.globalCompositeOperation = "lighter"; g.translate(sx, sy); g.rotate(ang);
  const L = len * s * (0.9 + 0.2 * Math.sin(t * 50)); const gr = g.createLinearGradient(0, 0, L, 0); gr.addColorStop(0, "rgba(255,255,230,1)"); gr.addColorStop(0.3, "rgba(255,190,90,0.9)"); gr.addColorStop(1, "rgba(255,90,30,0)");
  g.fillStyle = gr; g.beginPath(); g.moveTo(0, -0.35 * s); g.quadraticCurveTo(L * 0.5, -0.6 * s, L, 0); g.quadraticCurveTo(L * 0.5, 0.6 * s, 0, 0.35 * s); g.fill(); g.restore(); glow(g, sx, sy, 3 * s, "rgba(255,200,120,1)", 0.7);
};
