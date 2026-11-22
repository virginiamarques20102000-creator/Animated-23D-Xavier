// Shot helpers: shot type, smooth camera paths (Catmull-Rom through keys), ground/sea/street builders,
// motion helpers (drive with arc-length wheel roll and suspension bob, fly with banking), barrier/planks, big sun.
import * as THREE from "three";
import { Stage, V, V3, sm, hs, lerp, clamp, groundTex, GroundKind, MoodName, Mood, glowTex } from "./core";
import { building, M, rbox } from "./models";

export type Cam = { p: V3; l: V3; fov?: number; roll?: number; near?: number };
export type Shot3 = { t0: number; t1: number; mood: MoodName; over?: Partial<Mood>; build: (S: Stage) => void; cam: (t: number) => Cam; hand?: number; bloom?: number; sat?: number; bright?: number; white?: (t: number) => number };

/** camera path through keys [u, p, l, fov, roll] with Catmull-Rom (no stops at keys) and eased time */
export const path = (d: number, keys: [number, V3, V3, number?, number?][], ease = (u: number) => sm(u) * 0.6 + u * 0.4) => {
  const P = new THREE.CatmullRomCurve3(keys.map((k) => V(...k[1])), false, "centripetal"), L = new THREE.CatmullRomCurve3(keys.map((k) => V(...k[2])), false, "centripetal");
  const us = keys.map((k) => k[0]);
  return (t: number): Cam => { const u = ease(clamp(t / d)); let i = 0; while (i < us.length - 2 && u > us[i + 1]) i++;
    const k = clamp((u - us[i]) / (us[i + 1] - us[i])), s = (i + k) / (keys.length - 1), p = P.getPoint(s), l = L.getPoint(s);
    return { p: [p.x, p.y, p.z], l: [l.x, l.y, l.z], fov: lerp(keys[i][3] ?? 38, keys[i + 1][3] ?? keys[i][3] ?? 38, sm(k)), roll: lerp(keys[i][4] ?? 0, keys[i + 1][4] ?? 0, sm(k)) }; };
};
/** camera that tracks a moving target from an offset */
export const track = (tgt: (t: number) => THREE.Vector3, off: (t: number) => V3, look: V3 = [0, 0, 0], fov = 38, roll: (t: number) => number = () => 0) => (t: number): Cam => {
  const p = tgt(t), o = off(t); return { p: [p.x + o[0], p.y + o[1], p.z + o[2]], l: [p.x + look[0], p.y + look[1], p.z + look[2]], fov, roll: roll(t) }; };

export const ground = (S: Stage, kind: GroundKind, size = 3000, rep = 120, y = 0) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(size, size), new THREE.MeshStandardMaterial({ map: groundTex(kind, rep), roughness: 0.95 }));
  m.rotation.x = -Math.PI / 2; m.position.y = y; m.receiveShadow = true; S.root.add(m); return m; };
/** low hills ring (silhouette depth) */
export const hills = (S: Stage, col: string, r = 900, h = 60, n = 26, seed = 1) => { const m = new THREE.MeshStandardMaterial({ color: col, roughness: 1, flatShading: true });
  for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2 + hs(i, seed) * 0.2, hh = h * (0.4 + hs(i, seed + 1)), w = r * 0.35 * (0.6 + hs(i, seed + 2)); const c = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2), m);
    c.scale.set(w, hh, w * 0.6); c.position.set(Math.cos(a) * r, 0, Math.sin(a) * r); c.rotation.y = -a; S.root.add(c); } };
/** animated sea: CPU-displaced grid (sum of directional waves), glossy so the sun paints a glitter path */
export const sea = (S: Stage, col = "#2a5a7a", amp = 0.6, size = 2400, seg = 150, cx = 0, cz = 0) => {
  const g = new THREE.PlaneGeometry(size, size, seg, seg); g.rotateX(-Math.PI / 2);
  const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: col, roughness: 0.18, metalness: 0.1, envMapIntensity: 1.4 })); m.position.set(cx, 0, cz); m.receiveShadow = true; S.root.add(m);
  const pa = g.getAttribute("position") as THREE.BufferAttribute, x0 = Float32Array.from({ length: pa.count }, (_, i) => pa.getX(i)), z0 = Float32Array.from({ length: pa.count }, (_, i) => pa.getZ(i));
  const W = [[0.035, 0.8, 1.0, 0.0], [0.06, 0.45, 1.4, 0.7], [0.11, 0.22, 1.9, 2.1], [0.19, 0.12, 2.6, 3.9], [0.3, 0.06, 3.3, 5.2]];
  S.on((t) => { for (let i = 0; i < pa.count; i++) { const x = x0[i] + cx, z = z0[i] + cz; let y = 0; const fade = Math.max(0.15, 1 - Math.hypot(x - S.cam.position.x, z - S.cam.position.z) / 900);
      for (const [k, a, w, d] of W) y += a * Math.sin(k * (x * Math.cos(d) + z * Math.sin(d)) - w * t); pa.setY(i, y * amp * fade); } pa.needsUpdate = true; g.computeVertexNormals(); });
  return m;
};
export const seaY = (x: number, z: number, t: number, amp = 0.6) => { let y = 0; for (const [k, a, w, d] of [[0.035, 0.8, 1.0, 0.0], [0.06, 0.45, 1.4, 0.7], [0.11, 0.22, 1.9, 2.1]]) y += a * Math.sin(k * (x * Math.cos(d) + z * Math.sin(d)) - w * t); return y * amp; };
/** a row of city blocks along x at depth z (facing +z unless rot) */
export const street = (S: Stage, z: number, x0: number, x1: number, o: { broken?: number; hue?: number; h?: [number, number]; d?: number; rot?: number; seed?: number; lit?: number; roof?: boolean } = {}) => {
  let x = x0, i = 0; const seed = o.seed ?? 1;
  while (x < x1) { const w = 7 + 5 * hs(i, seed), h = (o.h?.[0] ?? 8) + ((o.h?.[1] ?? 16) - (o.h?.[0] ?? 8)) * hs(i, seed + 1);
    building(S.root, x + w / 2, z, w, h, o.d ?? 9, { broken: hs(i, seed + 2) < (o.broken ?? 0), hue: o.hue !== undefined ? o.hue + 12 * (hs(i, seed + 3) - 0.5) : undefined, seed: seed * 31 + i, rot: o.rot ?? 0, lit: o.lit, roof: o.roof ? "pitch" : "flat" });
    x += w + 0.4; i++; }
};
/** vehicle on a path: heading from the path tangent, wheels/tracks roll by arc length, suspension bob */
export const drive = (S: Stage, v: { g: THREE.Object3D; roll: (d: number) => void }, pos: (t: number) => THREE.Vector3, bob = 0.012) => {
  S.root.add(v.g); v.g.traverse((c) => { if ((c as THREE.Mesh).isMesh) { c.castShadow = true; c.receiveShadow = true; } });
  S.on((t) => { const p = pos(t), q = pos(t + 0.05), dx = q.x - p.x, dz = q.z - p.z, sp = Math.hypot(dx, dz) / 0.05;
    let d = 0; const n = 30; for (let i = 0; i < n; i++) d += pos((t * (i + 1)) / n).distanceTo(pos((t * i) / n)); v.roll(d);
    v.g.position.copy(p); if (sp > 0.05) v.g.rotation.y = Math.atan2(-dz, dx);
    v.g.rotation.z = bob * Math.min(1, sp / 4) * Math.sin(d * 2.1) + bob * 0.5 * Math.sin(d * 5.3); v.g.rotation.x = bob * 0.6 * Math.min(1, sp / 4) * Math.sin(d * 1.7); });
};
/** aircraft on a path: nose along the velocity, bank(t) about the nose */
export const fly = (S: Stage, o: THREE.Object3D, pos: (t: number) => THREE.Vector3, bank: (t: number) => number = () => 0, spin?: (t: number) => void) => {
  S.root.add(o); o.traverse((c) => { if ((c as THREE.Mesh).isMesh) { c.castShadow = true; } });
  const m = new THREE.Matrix4(), x = V(), y = V(), z = V(), up = V(0, 1, 0), q = new THREE.Quaternion();
  S.on((t) => { const p = pos(t); x.copy(pos(t + 0.04)).sub(p).normalize(); if (x.lengthSq() < 1e-6) x.set(1, 0, 0);
    z.crossVectors(x, up).normalize(); y.crossVectors(z, x); m.makeBasis(x, y, z); o.quaternion.setFromRotationMatrix(m); q.setFromAxisAngle(V(1, 0, 0), bank(t)); o.quaternion.multiply(q); o.position.copy(p); spin?.(t); });
};
/** a giant sun disc + halo far along the sun direction (for silhouettes against the sun) */
export const bigSun = (S: Stage, size = 260, col = "#ffb070") => { const disc = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(), color: col, transparent: true, depthWrite: false, fog: false, blending: THREE.AdditiveBlending }));
  disc.scale.setScalar(size); S.root.add(disc); const core = new THREE.Mesh(new THREE.CircleGeometry(size * 0.16, 48), new THREE.MeshBasicMaterial({ color: "#fff0d0", fog: false })); S.root.add(core);
  S.on(() => { const p = S.cam.position.clone().addScaledVector(S.sunDir, 2200); disc.position.copy(p); core.position.copy(p); core.lookAt(S.cam.position); }); };
/** wooden planks/beams that fly apart when hit at t0 from direction dir */
export const planks = (S: Stage, x: number, z: number, n: number, t0: number, dir: V3, col = "#6a4a30", w = 4, h = 1.6) => {
  const mat = M.std(col, 0.95, 0, 81), ps = Array.from({ length: n }, (_, i) => { const b = rbox(w * (0.4 + 0.6 * hs(i, 3)), 0.18, 0.12, mat, S.root); b.castShadow = true; return b; });
  S.on((t) => ps.forEach((b, i) => { const y0 = 0.2 + (i % 6) * (h / 6), z0 = z + (Math.floor(i / 6) - 0.5) * 0.4, a = t - t0 - 0.01 * i;
    if (a <= 0) { b.position.set(x, y0, z0); b.rotation.set(0, Math.PI / 2, (hs(i, 4) - 0.5) * 0.2); return; }
    const vx = dir[0] * (6 + 8 * hs(i, 5)), vy = 3 + 7 * hs(i, 6), vz = dir[2] * 6 + (hs(i, 7) - 0.5) * 9; let yy = y0 + vy * a - 4.9 * a * a; const land = yy < 0.1; if (land) yy = 0.1;
    const tl = Math.min(a, (vy + Math.sqrt(vy * vy + 19.6 * y0)) / 9.8); b.position.set(x + vx * tl * 0.9, yy, z0 + vz * tl); b.rotation.set(tl * 6 * hs(i, 8), Math.PI / 2 + tl * 5 * hs(i, 9), tl * 9 * (hs(i, 10) - 0.5) + (land ? 0 : 0)); }));
};
export { V, hs, sm, lerp, clamp };
