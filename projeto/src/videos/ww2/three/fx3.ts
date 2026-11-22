// Deterministic 3D effects (state is a pure function of shot time t): explosions with fireball + dense black smoke lit
// by the fire + ballistic debris that bounces + sparks + dirt jets + shock ring + scorch; water splashes; fires;
// smoke columns; vehicle dust; muzzle flashes; tracers; flak; rocket exhaust; mushroom cloud; rain/snow/ash; clouds.
import * as THREE from "three";
import { Stage, V, V3, hs, clamp, sm, puffTex, glowTex, fireTex, cloudTex } from "./core";

const sprite = (S: Stage, map: THREE.Texture, add = false, col = "#000") => { const m = new THREE.Sprite(new THREE.SpriteMaterial({ map, color: col, transparent: true, depthWrite: false, fog: !add, blending: add ? THREE.AdditiveBlending : THREE.NormalBlending })); m.visible = false; S.root.add(m); return m; };
const mat = (s: THREE.Sprite) => s.material as THREE.SpriteMaterial;
const v3 = (p: THREE.Vector3 | V3) => (Array.isArray(p) ? V(...p) : p.clone());
const tmp = V();

/** analytic bouncing fall: height of a body thrown up at vy from y0 (restitution e) */
export const bounceY = (y0: number, vy: number, a: number, e = 0.35) => { let tt = a, yy = y0, vv = vy; for (let k = 0; k < 5; k++) { const tl = (vv + Math.sqrt(vv * vv + 2 * 9.8 * Math.max(0, yy))) / 9.8; if (tt < tl) return { y: yy + vv * tt - 4.9 * tt * tt, n: k }; tt -= tl; yy = 0; vv = Math.abs(vv - 9.8 * tl) * e; } return { y: 0, n: 5 }; };

export type BlastOpts = { smoke?: number; debris?: number; dirt?: boolean; water?: boolean; col?: string; up?: number; shake?: number; light?: number; smokeLife?: number; grey?: number };
export const blast = (S: Stage, pos: THREE.Vector3 | V3, t0: number, sc = 1, o: BlastOpts = {}) => {
  const P = v3(pos), seed = Math.round(t0 * 97 + P.x * 13 + P.z * 7);
  S.flash(P.clone().add(V(0, 2 * sc, 0)), t0, (o.light ?? 1) * sc, 0.35);
  if (o.shake !== 0) S.shake(t0, o.shake ?? 0.12 * sc);
  const pt = puffTex(), gl = glowTex();
  // fireball cells
  const fb = Array.from({ length: o.water ? 6 : 22 }, () => sprite(S, gl, true, "#ff9a40"));
  // smoke billows
  const ns = Math.round((o.smoke ?? 1) * 34), sm2 = Array.from({ length: ns }, () => sprite(S, pt));
  // dirt jets / water column
  const jets = Array.from({ length: o.dirt || o.water ? 18 : 0 }, () => sprite(S, pt, false, o.water ? "#e8eef2" : "#5a4632"));
  // sparks
  const sp = Array.from({ length: 16 }, () => sprite(S, gl, true, "#ffd080"));
  // debris (instanced chunks)
  const nd = o.water ? 0 : o.debris ?? 28, dg = new THREE.DodecahedronGeometry(1, 0), dm = new THREE.MeshStandardMaterial({ color: o.col ?? "#4a3e34", roughness: 1 });
  const deb = new THREE.InstancedMesh(dg, dm, Math.max(1, nd)); deb.castShadow = true; deb.visible = false; S.root.add(deb);
  const scorch = new THREE.Mesh(new THREE.CircleGeometry(3.2 * sc, 24), new THREE.MeshBasicMaterial({ color: "#000", transparent: true, opacity: 0, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -3 }));
  scorch.rotation.x = -Math.PI / 2; scorch.position.set(P.x, 0.03, P.z); if (!o.water && P.y < 1) S.root.add(scorch);
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.9, 1, 48), new THREE.MeshBasicMaterial({ color: "#fff4e0", transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide }));
  ring.rotation.x = -Math.PI / 2; ring.position.set(P.x, 0.15, P.z); S.root.add(ring);
  const life = o.smokeLife ?? 9, grey = o.grey ?? 0.06, m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), s3 = V();
  S.on((t) => {
    const a = t - t0;
    fb.forEach((m, i) => { const b = a - 0.025 * i * hs(i, seed); if (b <= 0 || b > 1.3) { m.visible = false; return; } m.visible = true;
      const d = tmp.set(hs(i, seed + 1) - 0.5, hs(i, seed + 2) * 0.9, hs(i, seed + 4) - 0.5).normalize(), r = 3.2 * sc * (1 - Math.exp(-b * 6)) * (0.4 + hs(i, seed + 5));
      m.position.copy(P).addScaledVector(d, r).add(V(0, b * b * 2.5 * sc, 0)); m.scale.setScalar(sc * (1.4 + 2.6 * hs(i, seed + 6)) * (0.5 + b));
      mat(m).opacity = (1 - b / 1.3) ** 1.6; mat(m).color.setHSL(0.08 - 0.05 * b, 1, 0.6 - 0.25 * b); });
    sm2.forEach((m, i) => { const b = a - 0.05 - 0.5 * hs(i, seed + 7) - (i % 4) * 0.18; if (b <= 0 || b > life) { m.visible = false; return; } m.visible = true;
      const d = tmp.set((hs(i, seed + 8) - 0.5) * 1.4, 0.25 + hs(i, seed + 9) * 0.7, (hs(i, seed + 10) - 0.5) * 1.4).normalize();
      m.position.copy(P).addScaledVector(d, 4 * sc * (1 - Math.exp(-b * 2))).add(V(0.5 * b, (o.up ?? 1) * (0.9 * b + 0.05 * b * b) * sc, 0));
      m.scale.setScalar(sc * (2.4 + 2.4 * hs(i, seed + 11)) * (0.55 + 0.5 * b)); mat(m).rotation = hs(i, seed + 12) * 6 + b * 0.25 * (hs(i, seed + 13) - 0.5);
      const heat = Math.exp(-b * 1.6), gv = grey + 0.12 * hs(i, seed + 14); mat(m).color.setRGB(gv + 0.75 * heat, gv * 0.92 + 0.24 * heat, gv * 0.85 + 0.03 * heat);
      mat(m).opacity = Math.min(1, b * 5) * Math.max(0, 1 - b / life); });
    jets.forEach((m, i) => { const b = a - 0.02 * (i % 5); if (b <= 0 || b > 2.6) { m.visible = false; return; } m.visible = true;
      const ang = (hs(i, seed + 15) - 0.5) * (o.water ? 0.5 : 1.1), sp0 = (o.water ? 17 : 13) * sc * (0.6 + 0.6 * hs(i, seed + 16)), dir = hs(i, seed + 17) * 6.28;
      const y = Math.max(0, sp0 * Math.cos(ang) * b - 4.9 * b * b); m.position.set(P.x + Math.sin(ang) * Math.cos(dir) * sp0 * b * 0.5, P.y + y, P.z + Math.sin(ang) * Math.sin(dir) * sp0 * b * 0.5);
      m.scale.setScalar(sc * (0.8 + 1.6 * b) * (o.water ? 1.3 : 1)); mat(m).opacity = Math.min(1, b * 8) * Math.max(0, 1 - b / 2.6) * 0.9; });
    sp.forEach((m, i) => { const b = a - 0.01 * i; if (b <= 0 || b > 1.4) { m.visible = false; return; } m.visible = true;
      const d = V(hs(i, seed + 18) - 0.5, 0.4 + hs(i, seed + 19), hs(i, seed + 20) - 0.5).normalize().multiplyScalar(14 * sc * (0.5 + hs(i, seed + 21)));
      m.position.set(P.x + d.x * b, P.y + d.y * b - 4.9 * b * b, P.z + d.z * b); m.scale.setScalar(0.25 * sc); mat(m).opacity = 1 - b / 1.4; });
    if (nd) { deb.visible = a > 0; if (a > 0) { for (let i = 0; i < nd; i++) { const ang = hs(i, seed + 22) * 6.28, out = (3 + 10 * hs(i, seed + 23)) * sc, vy = (5 + 11 * hs(i, seed + 24)) * sc, s = (0.06 + 0.3 * hs(i, seed + 25) ** 2) * Math.min(2.2, Math.sqrt(sc));
      const bb = bounceY(P.y, vy, a), drag = (1 - Math.exp(-a * 1.1)) / 1.1, slide = bb.n ? 0.75 : 1; const spin = Math.min(a, 1.5 + bb.n * 0.3) * (bb.n >= 3 ? 0.3 : 1);
      s3.setScalar(s); e.set(spin * 9 * hs(i, 30), spin * 9 * hs(i, 31), spin * 9 * hs(i, 32)); q.setFromEuler(e);
      m4.compose(tmp.set(P.x + Math.cos(ang) * out * drag * slide, Math.max(s * 0.5, bb.y), P.z + Math.sin(ang) * out * drag * slide), q, s3); deb.setMatrixAt(i, m4); } deb.instanceMatrix.needsUpdate = true; } }
    (scorch.material as THREE.MeshBasicMaterial).opacity = a > 0 ? 0.55 * sm(a * 3) : 0;
    const rm = ring.material as THREE.MeshBasicMaterial; rm.opacity = !o.water && P.y < 1 && a > 0 && a < 0.5 ? 0.18 * (1 - a / 0.5) : 0; ring.scale.setScalar(1 + a * 40 * sc);
  });
};
/** burning fire: flickering flames, embers, steady light; optional smoke column */
export const fire = (S: Stage, pos: THREE.Vector3 | V3, sc = 1, o: { smoke?: boolean; t0?: number; light?: number } = {}) => {
  const P = v3(pos), seed = Math.round(P.x * 11 + P.z * 5), ft = fireTex(), t0 = o.t0 ?? -99;
  const fl = Array.from({ length: 9 }, () => sprite(S, ft, true, "#ff8a30")), em = Array.from({ length: 10 }, () => sprite(S, glowTex(), true, "#ffb060"));
  S.flash(P.clone().add(V(0, 1.2 * sc, 0)), t0, 0.12 * sc * (o.light ?? 1), 1e6, "#ff7a2a");
  S.on((t) => { const a = t - t0; const on = a > 0 ? Math.min(1, a * 2) : 0;
    fl.forEach((m, i) => { const ph = (t * (1.3 + 0.8 * hs(i, seed)) + hs(i, seed + 1)) % 1; m.visible = on > 0; m.position.set(P.x + (hs(i, seed + 2) - 0.5) * 1.6 * sc, P.y + (0.2 + 1.8 * ph) * sc, P.z + (hs(i, seed + 3) - 0.5) * sc);
      m.scale.set(sc * 1.6 * (1.2 - ph), sc * 3.0 * (1.2 - ph), 1); mat(m).opacity = on * (1 - ph) * 0.95; mat(m).color.setHSL(0.05 + 0.06 * (1 - ph), 1, 0.55); });
    em.forEach((m, i) => { const ph = (t * 0.35 + hs(i, seed + 4)) % 1; m.visible = on > 0; m.position.set(P.x + (hs(i, seed + 5) - 0.5) * 3 * sc + Math.sin(t * 2 + i) * 0.5, P.y + ph * 9 * sc, P.z + (hs(i, seed + 6) - 0.5) * 2); m.scale.setScalar(0.12); mat(m).opacity = on * (1 - ph); }); });
  if (o.smoke !== false) smokeCol(S, P.clone().add(V(0, 1.5 * sc, 0)), sc, { t0, heat: 1 });
};
/** rising smoke column (continuous) */
export const smokeCol = (S: Stage, pos: THREE.Vector3 | V3, sc = 1, o: { t0?: number; grey?: number; wind?: number; heat?: number; per?: number; n?: number; h?: number } = {}) => {
  const P = v3(pos), seed = Math.round(P.x * 3 + P.z * 17), n = o.n ?? 22, per = o.per ?? 7, t0 = o.t0 ?? -99, grey = o.grey ?? 0.07, wind = o.wind ?? 0.6, h = o.h ?? 2.2;
  const ps = Array.from({ length: n }, () => sprite(S, puffTex()));
  S.on((t) => { const on = clamp((t - t0) * 0.8);
    ps.forEach((m, i) => { const a = (t + (i / n) * per + 50) % per, k = a / per; m.visible = on > 0; m.position.set(P.x + wind * a * sc + (hs(i, seed) - 0.5) * 1.5 * sc, P.y + h * a * sc, P.z + (hs(i, seed + 1) - 0.5) * sc);
      m.scale.setScalar(sc * (1.3 + 4.5 * k) * (0.8 + 0.4 * hs(i, seed + 2))); mat(m).rotation = hs(i, seed + 3) * 6 + a * 0.15;
      const heat = (o.heat ?? 0) * Math.exp(-a * 1.6), gv = grey + 0.08 * hs(i, seed + 4); mat(m).color.setRGB(gv + 0.6 * heat, gv + 0.2 * heat, gv * 0.9); mat(m).opacity = on * Math.min(1, k * 8) * (1 - k) * 0.92; }); });
};
/** dust/snow kicked behind a moving vehicle: pos(t) is the vehicle rear contact point */
export const dust = (S: Stage, pos: (t: number) => THREE.Vector3, t0: number, t1: number, o: { col?: string; rate?: number; sc?: number; life?: number } = {}) => {
  const rate = o.rate ?? 6, life = o.life ?? 3, n = Math.ceil((t1 - t0) * rate), sc = o.sc ?? 1, ps = Array.from({ length: Math.min(n, 60) }, () => sprite(S, puffTex(), false, o.col ?? "#a08a68"));
  S.on((t) => ps.forEach((m, j) => { // ring buffer over spawn index
    const iNow = Math.floor((t - t0) * rate); let i = iNow - ((iNow - j) % ps.length + ps.length) % ps.length; if (i < 0 || i >= n) { m.visible = false; return; }
    const ts = t0 + i / rate, a = t - ts; if (a < 0 || a > life) { m.visible = false; return; } m.visible = true; const p = pos(ts);
    m.position.set(p.x + (hs(i, 1) - 0.5) * 1.5, p.y + 0.4 + a * 0.7, p.z + (hs(i, 2) - 0.5) * 2.2); m.scale.setScalar(sc * (1 + 2.6 * a)); mat(m).rotation = hs(i, 3) * 6; mat(m).opacity = (1 - a / life) * 0.55 * Math.min(1, a * 6); }));
};
/** muzzle flash + smoke puff at given times; at(t) gives muzzle position, dir(t) the bore direction */
export const muzzle = (S: Stage, at: () => THREE.Vector3, times: number[], sc = 1, o: { dir?: () => THREE.Vector3; smoke?: boolean } = {}) => {
  const f = sprite(S, glowTex(), true, "#ffd090"), f2 = sprite(S, fireTex(), true, "#ffb060"), sm3 = Array.from({ length: o.smoke === false ? 0 : 10 }, () => sprite(S, puffTex(), false, "#8a8680"));
  times.forEach((t0) => S.flash(V(), t0, 0.35 * sc, 0.06, "#ffc880"));
  const fl = S.flashes.slice(-times.length);
  S.on((t) => { const p = at(), d = o.dir?.() ?? V(1, 0, 0); fl.forEach((x) => x.pos.copy(p));
    let last = -99; for (const x of times) if (x <= t) last = x; const a = t - last, k = a < 0.09 ? 1 - a / 0.09 : 0;
    f.visible = f2.visible = k > 0; f.position.copy(p); f.scale.setScalar(sc * 3.2 * k); mat(f).opacity = k;
    f2.position.copy(p).addScaledVector(d, 0.8 * sc); f2.scale.set(sc * 2.5 * k, sc * 2.5 * k, 1); mat(f2).rotation = Math.atan2(d.y, d.x) - Math.PI / 2; mat(f2).opacity = k;
    sm3.forEach((m, i) => { const b = a - 0.02 * i; if (last < 0 || b < 0 || b > 3) { m.visible = false; return; } m.visible = true; m.position.copy(p).addScaledVector(d, sc * (1 + 3 * (1 - Math.exp(-b * 3))) * (0.5 + hs(i, 4))).add(V((hs(i, 5) - 0.5) * sc, b * 0.6 + (hs(i, 6) - 0.3) * sc, (hs(i, 7) - 0.5) * sc));
      m.scale.setScalar(sc * (0.6 + 1.8 * b)); mat(m).opacity = (1 - b / 3) * 0.6; }); });
};
/** tracers: glowing streaks flying from a(t) to b(t) at the given times */
export const tracers = (S: Stage, from: (t: number) => THREE.Vector3, to: (t: number) => THREE.Vector3, times: number[], col = "#ffcc66", speed = 0.25) => {
  const g = new THREE.CylinderGeometry(0.035, 0.035, 1, 4); g.rotateZ(Math.PI / 2); const ms = times.map(() => { const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: col, transparent: true, blending: THREE.AdditiveBlending })); m.visible = false; S.root.add(m); return m; });
  S.on((t) => ms.forEach((m, i) => { const a = (t - times[i]) / speed; if (a < 0 || a > 1) { m.visible = false; return; } m.visible = true; const A = from(times[i]), B = to(times[i]), d = B.clone().sub(A);
    m.position.copy(A).addScaledVector(d, a); m.scale.set(Math.min(6, d.length() * 0.15), 1.6, 1.6); m.quaternion.setFromUnitVectors(V(1, 0, 0), d.normalize()); (m.material as THREE.MeshBasicMaterial).color.set(col).multiplyScalar(3); }));
};
/** flak: black bursts with a flash at random points in a box */
export const flak = (S: Stage, c: V3, size: V3, t0: number, t1: number, n: number, seed = 1) => {
  for (let i = 0; i < n; i++) { const tt = t0 + (t1 - t0) * hs(i, seed), p = V(c[0] + (hs(i, seed + 1) - 0.5) * size[0], c[1] + (hs(i, seed + 2) - 0.5) * size[1], c[2] + (hs(i, seed + 3) - 0.5) * size[2]);
    const f = sprite(S, glowTex(), true, "#ffc070"), ps = Array.from({ length: 5 }, () => sprite(S, puffTex(), false, "#141210"));
    S.on((t) => { const a = t - tt; f.visible = a > 0 && a < 0.12; f.position.copy(p); f.scale.setScalar(5 * (1 - a / 0.12)); mat(f).opacity = 1;
      ps.forEach((m, k) => { m.visible = a > 0; if (a <= 0) return; m.position.copy(p).add(V((hs(k, i) - 0.5) * 2, (hs(k, i + 1) - 0.5) * 2 + a * 0.3, (hs(k, i + 2) - 0.5) * 2)); m.scale.setScalar(2.2 + 2 * (1 - Math.exp(-a * 3)) + a * 0.3); mat(m).opacity = Math.min(1, a * 20) * Math.max(0, 1 - a / 9) * 0.85; mat(m).rotation = k + i; }); }); }
};
/** rocket exhaust: flame + smoke trail spawned along pos(t) */
export const exhaust = (S: Stage, pos: (t: number) => THREE.Vector3, back: (t: number) => THREE.Vector3, t0: number, t1: number, sc = 1, o: { rate?: number; life?: number; grey?: number; ground?: number } = {}) => {
  const fl = sprite(S, fireTex(), true, "#ffd8a0"), fl2 = sprite(S, glowTex(), true, "#fff0d0"), rate = o.rate ?? 14, life = o.life ?? 5, n = Math.ceil((t1 - t0) * rate), ps = Array.from({ length: Math.min(n, 90) }, () => sprite(S, puffTex(), false, "#bcb8b0"));
  S.flash(V(), t0, 0.5 * sc, 1e6, "#ffd0a0", true); const lf = S.flashes[S.flashes.length - 1];
  S.on((t) => { const on = t >= t0 && t <= t1; const p = pos(t), b = back(t).normalize(); lf.pos.copy(p).addScaledVector(b, 2 * sc); lf.power = on ? 0.5 * sc : 0;
    fl.visible = fl2.visible = on; fl.position.copy(p).addScaledVector(b, 1.6 * sc); fl.scale.set(1.6 * sc, (3.2 + 0.5 * Math.sin(t * 50)) * sc, 1); mat(fl).rotation = Math.atan2(-b.x, b.y) + Math.PI; mat(fl).opacity = 1;
    fl2.position.copy(p).addScaledVector(b, 0.6 * sc); fl2.scale.setScalar(2.6 * sc);
    ps.forEach((m, j) => { const iNow = Math.floor((t - t0) * rate); const i = iNow - ((iNow - j) % ps.length + ps.length) % ps.length; if (i < 0 || i >= n) { m.visible = false; return; }
      const ts = t0 + i / rate, a = t - ts; if (a < 0 || a > life) { m.visible = false; return; } m.visible = true; const q = pos(ts), bb = back(ts).normalize();
      const spread = (o.ground && q.y < o.ground) ? 6 * (1 - Math.exp(-a)) : 0;
      m.position.copy(q).addScaledVector(bb, (2 + 2 * a) * sc).add(V((hs(i, 1) - 0.5) * (0.6 + spread) * sc, 0.4 * a, (hs(i, 2) - 0.5) * (0.6 + spread) * sc));
      if (m.position.y < 0.6) { const k = 0.6 - m.position.y; m.position.y = 0.6 + 0.3 * k; m.position.x += (hs(i, 4) - 0.5) * k * 2; m.position.z += (hs(i, 5) - 0.5) * k * 2; }
      m.scale.setScalar(sc * (0.9 + 2.6 * a)); const gv = (o.grey ?? 0.75) - 0.1 * hs(i, 3), heat = Math.exp(-a * 5); mat(m).color.setRGB(gv + heat * 0.5, gv + heat * 0.3, gv); mat(m).opacity = (1 - a / life) * 0.75; mat(m).rotation = i; }); });
};
/** atomic fireball rising into a mushroom: stem, cap with roll, condensation ring, ground surge */
export const mushroom = (S: Stage, pos: V3, t0: number, sc = 1) => {
  const P = V(...pos), pt = puffTex(), cap = Array.from({ length: 70 }, () => sprite(S, pt)), stem = Array.from({ length: 30 }, () => sprite(S, pt)), surge = Array.from({ length: 40 }, () => sprite(S, pt)), core = sprite(S, glowTex(), true, "#fff4e0");
  S.flash(P.clone().add(V(0, 60 * sc, 0)), t0, 40 * sc, 1.2, "#fff0d8", false); S.shake(t0 + 0.6, 0.35, 1.2);
  S.on((t) => { const a = t - t0; const H = 30 * sc + 260 * sc * (1 - Math.exp(-a / 5));
    core.visible = a > 0 && a < 6; core.position.set(P.x, P.y + H, P.z); core.scale.setScalar(sc * (40 + 60 * Math.min(1, a))); mat(core).opacity = Math.max(0, 1 - a / 6);
    cap.forEach((m, i) => { if (a <= 0) { m.visible = false; return; } m.visible = true; const ang = hs(i, 1) * 6.28 + a * 0.15 * (hs(i, 2) - 0.5), rr = sc * (25 + 110 * (1 - Math.exp(-a / 3))) * Math.sqrt(hs(i, 3)), yy = H + (hs(i, 4) - 0.4) * 50 * sc * Math.min(1, a / 2) - rr * 0.25;
      m.position.set(P.x + Math.cos(ang) * rr, P.y + yy, P.z + Math.sin(ang) * rr); m.scale.setScalar(sc * (40 + 40 * hs(i, 5)) * Math.min(1.4, 0.3 + a / 3)); const heat = Math.exp(-a / 1.6);
      mat(m).color.setRGB(0.55 + 0.45 * heat, 0.42 + 0.3 * heat * hs(i, 6), 0.36 + 0.1 * heat); mat(m).opacity = Math.min(1, a * 4) * 0.95; mat(m).rotation = i; });
    stem.forEach((m, i) => { if (a <= 0.3) { m.visible = false; return; } m.visible = true; const k = i / stem.length; m.position.set(P.x + (hs(i, 7) - 0.5) * 18 * sc, P.y + H * k * Math.min(1, (a - 0.3) / 2), P.z); m.scale.setScalar(sc * (18 + 14 * (1 - k)) * Math.min(1, a / 2)); mat(m).color.setRGB(0.55, 0.47, 0.42); mat(m).opacity = 0.9; mat(m).rotation = i; });
    surge.forEach((m, i) => { if (a <= 0.5) { m.visible = false; return; } m.visible = true; const ang = (i / surge.length) * 6.28, rr = sc * 220 * (1 - Math.exp(-(a - 0.5) / 2)); m.position.set(P.x + Math.cos(ang) * rr, P.y + 10 * sc, P.z + Math.sin(ang) * rr); m.scale.setScalar(sc * 50); mat(m).color.setRGB(0.5, 0.42, 0.36); mat(m).opacity = 0.75; }); });
};
/** weather particles in a box that follows the camera */
export const weather = (S: Stage, kind: "rain" | "snow" | "ash" | "embers", n = 2500) => {
  const pos = new Float32Array(n * 3), geo = new THREE.BufferGeometry().setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const m = kind === "rain" ? new THREE.PointsMaterial({ color: "#b8c4d4", size: 0.06, transparent: true, opacity: 0.55 }) : kind === "embers" ? new THREE.PointsMaterial({ color: "#ffa040", size: 0.09, transparent: true, blending: THREE.AdditiveBlending }) : new THREE.PointsMaterial({ color: kind === "snow" ? "#ffffff" : "#c8b8a8", size: kind === "snow" ? 0.09 : 0.05, transparent: true, opacity: 0.85 });
  const pts = new THREE.Points(geo, m); pts.frustumCulled = false; S.root.add(pts);
  const fall = kind === "rain" ? 14 : kind === "snow" ? 1.2 : kind === "embers" ? -1.2 : 0.4, B = 30;
  S.on((t) => { const c = S.cam.position; const pa = geo.getAttribute("position") as THREE.BufferAttribute;
    for (let i = 0; i < n; i++) { const y = ((hs(i, 1) * B - t * fall * (0.8 + 0.4 * hs(i, 2))) % B + B) % B; const x = ((hs(i, 3) * B + t * (kind === "snow" ? 1.5 : 0.6) + Math.sin(t + i) * 0.3 - c.x) % B + B) % B; const z = ((hs(i, 4) * B - c.z) % B + B) % B;
      pa.setXYZ(i, c.x + x - B / 2, c.y + y - B / 2, c.z + z - B / 2); } pa.needsUpdate = true; });
};
/** sky clouds: big billboards in a band */
export const clouds = (S: Stage, n: number, c: V3, size: V3, col = "#ffffff", drift = 2, seed = 1, sc = 1) => {
  for (let i = 0; i < n; i++) { const m = sprite(S, cloudTex(1 + (i % 3)), false, col); m.visible = true; mat(m).opacity = 0.92; mat(m).fog = true;
    const p = V(c[0] + (hs(i, seed) - 0.5) * size[0], c[1] + (hs(i, seed + 1) - 0.5) * size[1], c[2] + (hs(i, seed + 2) - 0.5) * size[2]), w = sc * (40 + 60 * hs(i, seed + 3));
    m.scale.set(w, w * 0.5, 1); S.on((t) => m.position.set(p.x + drift * t, p.y, p.z)); }
};
