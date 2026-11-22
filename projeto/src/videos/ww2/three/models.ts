// 3D models built from profiles (extruded/lathed, bevelled, tapered) — no boxy toys.
// Tanks: real running gear (road wheels inside an instanced link track that wraps sprocket and idler and scrolls with
// distance, wheels spin at v/r). Planes: lathed fuselage, tapered/elliptic/gull wings, spinning props with blur discs.
// Ships: planform hulls with flare, turrets, funnels, masts. Plus trucks, guns, rockets, buildings, trees and props.
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { cnv, grime, facadeTex, hs, V } from "./core";

export const M = {
  std: (col: string, rough = 0.85, metal = 0.15, seed = 1) => new THREE.MeshStandardMaterial({ map: grime(col, seed), roughness: rough, metalness: metal }),
  flat: (col: string, rough = 0.9) => new THREE.MeshStandardMaterial({ color: col, roughness: rough }),
  glass: () => new THREE.MeshStandardMaterial({ color: "#2a3440", roughness: 0.15, metalness: 0.6, transparent: true, opacity: 0.85 }),
};
const mesh = (g: THREE.BufferGeometry, m: THREE.Material | THREE.Material[], p?: THREE.Object3D, x = 0, y = 0, z = 0) => { const o = new THREE.Mesh(g, m); o.position.set(x, y, z); o.castShadow = o.receiveShadow = true; p?.add(o); return o; };
export const rbox = (w: number, h: number, d: number, m: THREE.Material, p?: THREE.Object3D, x = 0, y = 0, z = 0, r = 0.05) => mesh(new RoundedBoxGeometry(w, h, d, 2, Math.min(r, w / 2.2, h / 2.2, d / 2.2)), m, p, x, y, z);
export const cyl = (r0: number, r1: number, h: number, m: THREE.Material, p?: THREE.Object3D, seg = 16) => mesh(new THREE.CylinderGeometry(r0, r1, h, seg), m, p);
/** side profile (x forward, y up) extruded across width w (centred), bevelled; taper narrows the top (sloped side armour) */
export const prof = (pts: [number, number][], w: number, m: THREE.Material, p?: THREE.Object3D, taper = 0, bevel = 0.04) => {
  const s = new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2(x, y)));
  const g = new THREE.ExtrudeGeometry(s, { depth: w - 2 * bevel, bevelEnabled: bevel > 0, bevelSize: bevel, bevelThickness: bevel, bevelSegments: 2, curveSegments: 6 });
  g.translate(0, 0, -(w - 2 * bevel) / 2);
  if (taper) { const pa = g.getAttribute("position") as THREE.BufferAttribute; let y0 = Infinity, y1 = -Infinity; for (let i = 0; i < pa.count; i++) { y0 = Math.min(y0, pa.getY(i)); y1 = Math.max(y1, pa.getY(i)); }
    for (let i = 0; i < pa.count; i++) pa.setZ(i, pa.getZ(i) * (1 - taper * (pa.getY(i) - y0) / (y1 - y0))); g.computeVertexNormals(); }
  return mesh(g, m, p);
};
/** lathe along +x: rs = [[x, r], ...] */
export const lathe = (rs: [number, number][], m: THREE.Material, p?: THREE.Object3D, seg = 20) => { const g = new THREE.LatheGeometry(rs.map(([x, r]) => new THREE.Vector2(Math.max(0.001, r), x)), seg); g.rotateZ(-Math.PI / 2); return mesh(g, m, p); };

// ---------------- insignia ----------------
export type Nation = "de" | "su" | "us" | "uk" | "jp" | "pl" | "fr" | "none";
const insTex = (n: Nation) => cnv("ins" + n, 128, 128, (g) => {
  const c = (col: string, r: number) => { g.fillStyle = col; g.beginPath(); g.arc(64, 64, r, 0, Math.PI * 2); g.fill(); };
  const star = (col: string, r: number) => { g.fillStyle = col; g.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.4 : r; g.lineTo(64 + rr * Math.cos(a), 64 + rr * Math.sin(a)); } g.fill(); };
  if (n === "de") { g.fillStyle = "#f2f0e8"; g.fillRect(10, 44, 108, 40); g.fillRect(44, 10, 40, 108); g.fillStyle = "#141414"; g.fillRect(22, 54, 84, 20); g.fillRect(54, 22, 20, 84); }
  if (n === "su") { star("#f2f0e8", 60); star("#b8231e", 52); }
  if (n === "us") { c("#1e2a5a", 62); star("#f2f0e8", 58); }
  if (n === "uk") { c("#1e2a5a", 62); c("#f2f0e8", 42); c("#b8231e", 22); }
  if (n === "jp") { c("#f2f0e8", 62); c("#c41e1e", 50); }
  if (n === "fr") { c("#1e2a8a", 62); c("#f2f0e8", 42); c("#c41e1e", 22); }
  if (n === "pl") { g.fillStyle = "#f2f0e8"; g.fillRect(14, 14, 50, 50); g.fillRect(64, 64, 50, 50); g.fillStyle = "#c41e1e"; g.fillRect(64, 14, 50, 50); g.fillRect(14, 64, 50, 50); }
});
export const decal = (n: Nation, s: number, p: THREE.Object3D, x: number, y: number, z: number, ry = 0, rx = 0) => {
  if (n === "none") return null; const d = new THREE.Mesh(new THREE.PlaneGeometry(s, s), new THREE.MeshStandardMaterial({ map: insTex(n), transparent: true, roughness: 0.8, polygonOffset: true, polygonOffsetFactor: -2 }));
  d.position.set(x, y, z); d.rotation.set(rx, ry, 0); p.add(d); return d;
};

// ---------------- tanks ----------------
export type TankKind = "panzer" | "t34" | "sherman" | "tiger" | "crusader";
type TankSpec = { hull: [number, number][]; hw: number; sup?: [number, number][]; sw?: number; taper: number; wheels: number; wr: number; wx0: number; wx1: number; rollers: number;
  spr: [number, number, number]; idl: [number, number, number]; topY: number; tw: number; tz: number; turret: "box" | "round" | "cast"; tx: number; ty: number; tsz: [number, number, number]; gun: number; gr: number; brake: boolean; col: string; nation: Nation };
const TK: Record<TankKind, TankSpec> = {
  panzer: { hull: [[-2.85, 0.55], [2.55, 0.55], [2.95, 0.98], [2.55, 1.3], [2.3, 1.85], [-2.55, 1.85], [-2.9, 1.45]], hw: 2.0, sup: [[-2.55, 1.32], [2.05, 1.32], [2.3, 1.86], [-2.55, 1.86]], sw: 2.86, taper: 0,
    wheels: 8, wr: 0.3, wx0: -2.25, wx1: 2.05, rollers: 4, spr: [2.72, 0.88, 0.36], idl: [-2.78, 0.84, 0.32], topY: 1.24, tw: 0.4, tz: 1.22, turret: "box", tx: -0.25, ty: 1.85, tsz: [2.3, 0.8, 1.9], gun: 3.3, gr: 0.08, brake: true, col: "#545a4c", nation: "de" },
  tiger: { hull: [[-3.1, 0.55], [2.85, 0.55], [3.2, 1.05], [3.0, 1.95], [-3.0, 1.95], [-3.15, 1.2]], hw: 2.1, sup: [[-3.0, 1.35], [2.95, 1.35], [3.0, 1.98], [-3.0, 1.98]], sw: 3.5, taper: 0,
    wheels: 8, wr: 0.42, wx0: -2.5, wx1: 2.3, rollers: 0, spr: [2.95, 0.95, 0.42], idl: [-3.0, 0.95, 0.4], topY: 1.32, tw: 0.62, tz: 1.45, turret: "box", tx: 0, ty: 1.98, tsz: [2.6, 0.9, 2.5], gun: 4.6, gr: 0.1, brake: true, col: "#8a7a52", nation: "de" },
  t34: { hull: [[-3.0, 0.55], [2.6, 0.55], [3.05, 0.95], [1.55, 1.72], [-2.7, 1.72], [-3.05, 1.2]], hw: 3.0, taper: 0.22,
    wheels: 5, wr: 0.42, wx0: -2.2, wx1: 2.0, rollers: 0, spr: [-2.75, 0.9, 0.4], idl: [2.8, 0.9, 0.38], topY: 1.28, tw: 0.5, tz: 1.22, turret: "cast", tx: 0.45, ty: 1.72, tsz: [2.2, 0.72, 1.8], gun: 3.4, gr: 0.075, brake: false, col: "#4c5a34", nation: "su" },
  sherman: { hull: [[-2.85, 0.6], [2.35, 0.6], [2.85, 0.95], [2.7, 1.45], [1.85, 2.05], [-2.55, 2.05], [-2.9, 1.65]], hw: 2.62, taper: 0.06,
    wheels: 6, wr: 0.28, wx0: -2.1, wx1: 2.0, rollers: 3, spr: [2.65, 1.0, 0.36], idl: [-2.75, 0.75, 0.32], topY: 1.2, tw: 0.42, tz: 1.3, turret: "round", tx: -0.1, ty: 2.05, tsz: [1.9, 0.75, 1.75], gun: 2.8, gr: 0.075, brake: false, col: "#5a5c38", nation: "us" },
  crusader: { hull: [[-3.0, 0.5], [2.7, 0.5], [3.0, 0.9], [2.4, 1.45], [-2.7, 1.45], [-3.0, 1.1]], hw: 2.6, taper: 0.05,
    wheels: 5, wr: 0.45, wx0: -2.2, wx1: 2.1, rollers: 0, spr: [-2.75, 0.9, 0.38], idl: [2.75, 0.85, 0.36], topY: 1.28, tw: 0.36, tz: 1.12, turret: "box", tx: 0.1, ty: 1.45, tsz: [1.9, 0.7, 1.7], gun: 2.0, gr: 0.05, brake: false, col: "#b8a274", nation: "uk" },
};
export type Tank = { g: THREE.Group; turret: THREE.Group; gun: THREE.Group; barrel: THREE.Group; roll: (dist: number) => void; muzzle: () => THREE.Vector3; spec: TankSpec };
const LINK = new RoundedBoxGeometry(1, 1, 1, 1, 0.12);
export const tank = (kind: TankKind, o: { col?: string; winter?: boolean; nation?: Nation; burnt?: boolean } = {}): Tank => {
  const S = TK[kind], g = new THREE.Group(), col = o.burnt ? "#2a2622" : o.winter ? "#d8dcd6" : o.col ?? S.col;
  const body = M.std(col, o.burnt ? 1 : 0.75, 0.3, kind.length * 7), dark = M.std("#1e1d1b", 0.9, 0.4, 3), rub = M.flat("#151514", 0.95), steel = M.std("#3a3a36", 0.6, 0.6, 5);
  prof(S.hull, S.hw, body, g, S.taper, 0.05);
  if (S.sup) prof(S.sup, S.sw!, body, g, 0, 0.04);
  else rbox(5.7, 0.06, S.tz * 2 + S.tw, body, g, -0.1, S.topY + 0.12, 0, 0.02);
  // fenders over tracks
  for (const s of [-1, 1]) rbox(5.9, 0.05, S.tw + 0.08, body, g, -0.05, S.topY + 0.14, s * S.tz, 0.02);
  // running gear
  const spin: { o: THREE.Object3D; r: number }[] = [];
  const wheel = (x: number, y: number, r: number, z: number, sprocket = false) => {
    const w = new THREE.Group(); w.position.set(x, y, z); g.add(w);
    const tyre = cyl(r, r, S.tw * 0.8, sprocket ? steel : rub, w, 24); tyre.rotation.x = Math.PI / 2;
    const disc = cyl(r * 0.78, r * 0.82, S.tw * 0.86, body, w, 20); disc.rotation.x = Math.PI / 2;
    const hub = cyl(r * 0.22, r * 0.26, S.tw * 0.98, steel, w, 10); hub.rotation.x = Math.PI / 2;
    for (let k = 0; k < (sprocket ? 12 : 6); k++) { const a = (k / (sprocket ? 12 : 6)) * Math.PI * 2, b = sprocket ? rbox(0.09, 0.12, S.tw * 0.5, steel, w, Math.cos(a) * r, Math.sin(a) * r, 0, 0.02) : rbox(0.05, 0.05, S.tw * 0.9, steel, w, Math.cos(a) * r * 0.5, Math.sin(a) * r * 0.5, 0, 0.01); b.rotation.z = a; }
    spin.push({ o: w, r });
  };
  for (const s of [-1, 1]) {
    const z = s * S.tz;
    for (let i = 0; i < S.wheels; i++) wheel(S.wx0 + (i * (S.wx1 - S.wx0)) / (S.wheels - 1), S.wr + 0.07, S.wr, z);
    for (let i = 0; i < S.rollers; i++) wheel(S.wx0 + 0.3 + (i * (S.wx1 - S.wx0 - 0.6)) / Math.max(1, S.rollers - 1), S.topY - 0.13, 0.11, z);
    wheel(S.spr[0], S.spr[1], S.spr[2], z, true); wheel(S.idl[0], S.idl[1], S.idl[2], z);
  }
  // track loop: closed curve hugging wheels, sprocket and idler; links are instanced and slide along it
  const front = S.spr[0] > 0 ? S.spr : S.idl, back = S.spr[0] > 0 ? S.idl : S.spr, th = 0.07;
  const pts: THREE.Vector3[] = [];
  const arc = (c: number[], a0: number, a1: number, n: number) => { for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * (i / n); pts.push(V(c[0] + Math.cos(a) * (c[2] + th / 2), c[1] + Math.sin(a) * (c[2] + th / 2), 0)); } };
  const by = th / 2 + 0.005;
  pts.push(V(S.wx0, by, 0), V(S.wx1, by, 0));
  arc(front, -Math.PI / 2 + 0.6, Math.PI / 2, 8);
  pts.push(V((front[0] + back[0]) * 0.5, S.topY + 0.0, 0));
  arc(back, Math.PI / 2, Math.PI * 1.5 - 0.6, 8);
  const curve = new THREE.CatmullRomCurve3(pts, true, "centripetal", 0.5), len = curve.getLength(), N = Math.round(len / 0.17);
  const links: THREE.InstancedMesh[] = [];
  for (const s of [-1, 1]) { const im = new THREE.InstancedMesh(LINK, M.std("#2a2826", 0.7, 0.55, 9), N); im.castShadow = im.receiveShadow = true; im.position.z = s * S.tz; g.add(im); links.push(im); }
  const mtx = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = V((len / N) * 0.86, th, S.tw), zA = V(0, 0, 1), pos = V(), tan = V();
  const roll = (dist: number) => {
    for (const w of spin) w.o.rotation.z = -dist / w.r;
    const off = ((dist / len) % 1 + 1) % 1;
    for (let i = 0; i < N; i++) { const u = (i / N + 1 - off) % 1; curve.getPointAt(u, pos); curve.getTangentAt(u, tan); q.setFromAxisAngle(zA, Math.atan2(tan.y, tan.x)); mtx.compose(pos, q, sc); links[0].setMatrixAt(i, mtx); links[1].setMatrixAt(i, mtx); }
    links[0].instanceMatrix.needsUpdate = links[1].instanceMatrix.needsUpdate = true;
  };
  roll(0);
  // hull details: exhausts, tools, hatches, MG, antenna, spare links
  for (const s of [-0.5, 0.5]) { const ex = cyl(0.12, 0.12, 0.6, dark, g, 12); ex.rotation.x = Math.PI / 2; ex.position.set(-2.95, 1.1, s); }
  rbox(1.4, 0.05, 0.12, M.std("#5a4430", 0.9, 0, 4), g, -0.6, (S.sup ? 1.88 : S.hull[4]?.[1] ?? 1.7) + 0.02, S.hw * 0.42, 0.01);
  const ant = cyl(0.012, 0.012, 2.0, steel, g, 4); ant.position.set(-2.2, 2.6, -0.8); ant.rotation.z = 0.08;
  for (let i = 0; i < 3; i++) rbox(0.16, 0.05, S.hw * 0.7, dark, g, 2.75 - i * 0.04, 1.05 + i * 0.12, 0, 0.01).rotation.z = 0.9;
  // turret
  const turret = new THREE.Group(); turret.position.set(S.tx, S.ty, 0); g.add(turret);
  const [tl, th2, tw2] = S.tsz;
  if (S.turret === "box") { prof([[-tl / 2, 0], [tl / 2, 0], [tl / 2 - 0.15, th2], [-tl / 2 + 0.1, th2]], tw2, body, turret, 0.18, 0.05);
    const cup = cyl(0.33, 0.36, 0.32, body, turret, 16); cup.position.set(-tl / 2 + 0.45, th2 + 0.15, 0); rbox(0.22, th2 * 0.9, tw2 * 0.92, body, turret, -tl / 2 - 0.08, th2 * 0.48, 0, 0.03); }
  else { const dome = mesh(new THREE.SphereGeometry(1, 24, 14, 0, Math.PI * 2, 0, Math.PI / 2), body, turret); dome.scale.set(tl / 2, th2 * 1.25, tw2 / 2);
    if (S.turret === "cast") { rbox(tl * 0.5, 0.25, tw2 * 0.7, body, turret, -tl * 0.28, 0.12, 0, 0.1); }
    const h = cyl(0.25, 0.27, 0.22, body, turret, 14); h.position.set(-0.2, th2 * 1.15, -0.35); }
  decal(o.nation ?? S.nation, 0.55, turret, 0, th2 * 0.5, tw2 / 2 * (S.turret === "box" ? 0.86 : 0.9) + 0.03);
  decal(o.nation ?? S.nation, 0.55, g, -1.0, (S.sup ? 1.6 : 1.3), (S.sup ? S.sw! : S.hw) / 2 + 0.05);
  // gun on a trunnion group (elevation) with a recoiling barrel
  const gun = new THREE.Group(); gun.position.set(S.turret === "box" ? tl / 2 : tl * 0.42, th2 * 0.5, 0); turret.add(gun);
  rbox(0.5, 0.45, 0.6, body, gun, 0.12, 0, 0, 0.08);
  const barrel = new THREE.Group(); gun.add(barrel);
  lathe([[0, S.gr * 1.4], [0.5, S.gr * 1.3], [0.6, S.gr * 1.05], [S.gun, S.gr * 0.85]], steel, barrel, 14).position.x = 0.25;
  if (S.brake) lathe([[0, S.gr * 1.6], [0.32, S.gr * 1.7], [0.34, S.gr * 1.2], [0.36, S.gr * 1.6], [0.36, 0.01]], steel, barrel, 14).position.x = 0.25 + S.gun;
  const tip = V(0.25 + S.gun + 0.4, 0, 0);
  return { g, turret, gun, barrel, roll, muzzle: () => barrel.localToWorld(tip.clone()), spec: S };
};

// ---------------- planes ----------------
export type PlaneKind = "bf109" | "spit" | "stuka" | "zero" | "kate" | "dauntless" | "he111" | "b29" | "c47" | "hurricane";
type PlaneSpec = { len: number; r: number; span: number; root: number; tip: number; sweep: number; ellip?: boolean; gull?: boolean; wingX: number; wingY: number; eng: number[]; nose: boolean;
  top: string; bot: string; nation: Nation; blades: number; glass: number; tailH: number; gear?: boolean };
const PL: Record<PlaneKind, PlaneSpec> = {
  bf109: { len: 8.9, r: 0.5, span: 9.9, root: 2.0, tip: 0.9, sweep: 0.25, wingX: 0.9, wingY: -0.3, eng: [], nose: true, top: "#5a6a52", bot: "#9ab0c4", nation: "de", blades: 3, glass: 1.4, tailH: 1.2 },
  spit: { len: 9.1, r: 0.48, span: 11.2, root: 2.4, tip: 0.6, sweep: 0.1, ellip: true, wingX: 1.0, wingY: -0.35, eng: [], nose: true, top: "#6a6a46", bot: "#b0b4a8", nation: "uk", blades: 3, glass: 1.4, tailH: 1.2 },
  hurricane: { len: 9.6, r: 0.55, span: 12.2, root: 2.6, tip: 1.2, sweep: 0.2, wingX: 0.8, wingY: -0.4, eng: [], nose: true, top: "#5a5a3c", bot: "#b8b0a0", nation: "uk", blades: 3, glass: 1.4, tailH: 1.3 },
  stuka: { len: 11.1, r: 0.6, span: 13.8, root: 2.6, tip: 1.2, sweep: 0.15, gull: true, wingX: 0.8, wingY: -0.45, eng: [], nose: true, top: "#4e5a44", bot: "#8aa4bc", nation: "de", blades: 3, glass: 2.6, tailH: 1.6, gear: true },
  zero: { len: 9.1, r: 0.6, span: 12.0, root: 2.4, tip: 1.0, sweep: 0.1, wingX: 0.6, wingY: -0.35, eng: [], nose: true, top: "#c8c6b4", bot: "#c8c6b4", nation: "jp", blades: 3, glass: 1.8, tailH: 1.2 },
  kate: { len: 10.3, r: 0.6, span: 15.5, root: 3.0, tip: 1.2, sweep: 0.1, wingX: 0.6, wingY: -0.4, eng: [], nose: true, top: "#4a5a3a", bot: "#a8a898", nation: "jp", blades: 3, glass: 3.2, tailH: 1.4 },
  dauntless: { len: 10.1, r: 0.62, span: 12.7, root: 2.8, tip: 1.2, sweep: 0.12, wingX: 0.7, wingY: -0.4, eng: [], nose: true, top: "#4a5a72", bot: "#c8ccd0", nation: "us", blades: 3, glass: 2.6, tailH: 1.5 },
  he111: { len: 16.4, r: 0.95, span: 22.6, root: 4.6, tip: 1.6, sweep: 0.5, wingX: 1.5, wingY: -0.3, eng: [-4.2, 4.2], nose: false, top: "#4e5a46", bot: "#90a8c0", nation: "de", blades: 3, glass: 2.2, tailH: 2.0 },
  b29: { len: 30.2, r: 1.45, span: 43.0, root: 5.2, tip: 1.8, sweep: 0.4, wingX: 2.0, wingY: -0.2, eng: [-12.5, -6.2, 6.2, 12.5], nose: false, top: "#c4c8cc", bot: "#c4c8cc", nation: "us", blades: 4, glass: 3.0, tailH: 4.0 },
  c47: { len: 19.6, r: 1.25, span: 29.0, root: 4.2, tip: 1.6, sweep: 0.6, wingX: 2.5, wingY: -0.6, eng: [-3.0, 3.0], nose: false, top: "#4e5434", bot: "#8a8a7a", nation: "us", blades: 3, glass: 1.8, tailH: 2.4 },
};
export type Plane = { g: THREE.Group; props: THREE.Object3D[]; spin: (t: number) => void; spec: PlaneSpec };
export const plane = (kind: PlaneKind, o: { nation?: Nation; top?: string } = {}): Plane => {
  const S = PL[kind], g = new THREE.Group(), L = S.len, R = S.r, top = M.std(o.top ?? S.top, 0.55, 0.35, kind.length), bot = M.std(S.bot, 0.55, 0.35, 2), dark = M.std("#222", 0.6, 0.5), glass = M.glass();
  const body = new THREE.Group(); g.add(body);
  const nose = S.nose ? 0.85 : S.glass > 2.8 ? 1 : 0.55;
  lathe([[-L * 0.62, 0.04], [-L * 0.5, R * 0.35], [-L * 0.2, R * 0.75], [L * 0.1, R], [L * 0.28, R * nose], [L * 0.36, R * nose * 0.6], [L * 0.38, 0.02]], top, body, 22);
  // belly paint: a slightly larger lower half shell
  const belly = lathe([[-L * 0.5, R * 0.36], [-L * 0.2, R * 0.76], [L * 0.1, R * 1.01], [L * 0.28, R * nose * 1.01], [L * 0.35, R * nose * 0.62]], bot, body, 22);
  (belly.geometry as THREE.BufferGeometry).computeBoundingBox(); belly.scale.set(1, 1.0, 1.0); belly.position.y = -0.005; belly.rotation.x = 0; belly.visible = true;
  { const pa = belly.geometry.getAttribute("position") as THREE.BufferAttribute; for (let i = 0; i < pa.count; i++) if (pa.getY(i) > -R * 0.15) pa.setY(i, -R * 0.15 + (pa.getY(i) + R * 0.15) * 0.02); belly.geometry.computeVertexNormals(); }
  // canopy
  const can = mesh(new THREE.SphereGeometry(1, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), glass, body); can.scale.set(S.glass / 2, R * 0.7, R * 0.62); can.position.set(S.nose ? L * 0.02 : L * 0.25, R * 0.72, 0);
  if (!S.nose && S.glass > 2) { const ng = mesh(new THREE.SphereGeometry(R * 0.98, 20, 14, 0, Math.PI), glass, body); ng.rotation.y = -Math.PI / 2; ng.position.x = L * 0.33; }
  // wings
  const wing = (side: number) => {
    const half = S.span / 2, pts: THREE.Vector2[] = [];
    const n = 14; for (let i = 0; i <= n; i++) { const s = i / n, c = S.ellip ? S.root * Math.sqrt(Math.max(0.02, 1 - s * s)) : THREE.MathUtils.lerp(S.root, S.tip, s); pts.push(new THREE.Vector2(s * half, S.root * 0.3 - S.sweep * s * half * 0.2 + c * 0.0)); void c; }
    const le: THREE.Vector2[] = [], te: THREE.Vector2[] = [];
    for (let i = 0; i <= n; i++) { const s = i / n, c = S.ellip ? S.root * Math.sqrt(Math.max(0.03, 1 - s * s)) : THREE.MathUtils.lerp(S.root, S.tip, s), xLe = S.root * 0.35 - S.sweep * s * half * 0.18; le.push(new THREE.Vector2(s * half, xLe)); te.push(new THREE.Vector2(s * half, xLe - c)); }
    const shp = new THREE.Shape([...le, ...te.reverse()]);
    const geo = new THREE.ExtrudeGeometry(shp, { depth: S.root * 0.09, bevelEnabled: true, bevelSize: S.root * 0.03, bevelThickness: S.root * 0.03, bevelSegments: 2 });
    // map: shape x = span (-> world z), shape y = chord (-> world x), extrusion = thickness (-> world y)
    const pa = geo.getAttribute("position") as THREE.BufferAttribute;
    for (let i = 0; i < pa.count; i++) { const sx = pa.getX(i), sy = pa.getY(i), sz = pa.getZ(i), s = sx / half; const thin = 1 - 0.55 * s;
      const dih = S.gull ? (s < 0.35 ? -0.35 * sx : -0.35 * half * 0.35 + 0.16 * (sx - half * 0.35)) : 0.07 * sx;
      pa.setXYZ(i, sy, (sz - S.root * 0.045) * thin + dih, side * sx); }
    geo.computeVertexNormals(); const w = mesh(geo, [top, top], body); w.position.set(S.wingX, S.wingY, 0);
    const u = mesh(geo, bot, body); u.position.set(S.wingX, S.wingY - 0.012, 0); u.scale.set(1, 0.98, 1);
    decal(o.nation ?? S.nation, S.root * 0.55, w, -S.root * 0.25 - S.sweep * half * 0.13, 0.12 + (S.gull ? -0.06 * half : 0.07 * half * 0.75), side * half * 0.75, 0, -Math.PI / 2);
  };
  wing(1); wing(-1);
  // tail: stabilisers + fin
  for (const s of [-1, 1]) { const st = prof([[0, 0], [L * 0.09, 0], [L * 0.06, S.span * 0.085], [0.0, S.span * 0.085]], 0.08, top, body, 0, 0.02); st.rotation.x = s * Math.PI / 2; st.position.set(-L * 0.6, R * 0.15, 0); }
  prof([[-L * 0.02, 0], [L * 0.1, 0], [L * 0.02, S.tailH * 0.95], [-L * 0.03, S.tailH]], 0.1, top, body, 0, 0.03).position.set(-L * 0.6, R * 0.2, 0);
  decal(o.nation ?? S.nation, R * 1.1, body, -L * 0.3, 0, R * 0.92); decal(o.nation ?? S.nation, R * 1.1, body, -L * 0.3, 0, -R * 0.92, Math.PI);
  if (S.nation === "de" || o.nation === "de") { const sw = new THREE.Mesh(new THREE.PlaneGeometry(S.tailH * 0.5, S.tailH * 0.5), new THREE.MeshStandardMaterial({ map: insTex("de"), transparent: true })); sw.position.set(-L * 0.585, R * 0.2 + S.tailH * 0.55, 0.06); body.add(sw); }
  // engines + props
  const props: THREE.Object3D[] = [];
  const prop = (x: number, y: number, z: number, pr: number) => {
    const hub = new THREE.Group(); hub.position.set(x, y, z); body.add(hub);
    lathe([[-0.1, pr * 0.2], [0.25, pr * 0.16], [0.42, 0.02]], dark, hub, 12);
    const blades = new THREE.Group(); hub.add(blades);
    for (let i = 0; i < S.blades; i++) { const b = rbox(0.06, pr, 0.18, dark, blades, 0.15, 0, 0, 0.03); b.geometry.translate(0, pr / 2, 0); b.rotation.x = (i / S.blades) * Math.PI * 2; }
    const disc = new THREE.Mesh(new THREE.CircleGeometry(pr, 32), new THREE.MeshBasicMaterial({ color: "#222", transparent: true, opacity: 0.18, side: THREE.DoubleSide, depthWrite: false })); disc.rotation.y = Math.PI / 2; disc.position.x = 0.16; hub.add(disc);
    props.push(blades);
  };
  if (S.nose) prop(L * 0.38, 0, 0, L * 0.16);
  for (const z of S.eng) { const nac = lathe([[-1.8, 0.2], [-0.8, R * 0.55], [0.6, R * 0.6], [1.2, R * 0.5]], top, body, 16); nac.position.set(S.wingX + S.root * 0.5, S.wingY, z); prop(S.wingX + S.root * 0.5 + 1.3, S.wingY, z, R * 1.6); }
  if (S.gear) for (const s of [-1, 1]) { const leg = rbox(0.5, 1.4, 0.35, top, body, S.wingX + 0.2, S.wingY - 0.9, s * S.span * 0.16, 0.12); leg.rotation.x = s * 0.05; const wl = cyl(0.33, 0.33, 0.18, dark, body); wl.rotation.x = Math.PI / 2; wl.position.set(S.wingX + 0.25, S.wingY - 1.65, s * S.span * 0.16); }
  const spin = (t: number) => props.forEach((p, i) => (p.rotation.x = t * 7.3 + i));
  return { g, props, spin, spec: S };
};

// ---------------- ships ----------------
export type ShipKind = "bb" | "carrier" | "destroyer" | "higgins" | "cruiser";
export type Ship = { g: THREE.Group; turrets: THREE.Group[]; guns: THREE.Object3D[]; ramp?: THREE.Group; L: number };
export const ship = (kind: ShipKind, o: { col?: string; nation?: Nation } = {}): Ship => {
  const g = new THREE.Group(), L = { bb: 180, carrier: 240, destroyer: 105, higgins: 11, cruiser: 160 }[kind], B = { bb: 30, carrier: 30, destroyer: 11, higgins: 3.2, cruiser: 19 }[kind];
  const col = o.col ?? (kind === "carrier" ? "#6a7078" : "#7c828a"), hullM = M.std(col, 0.7, 0.3, 21), dark = M.std("#3a3c40", 0.8, 0.4, 22), deck = M.std(kind === "carrier" ? "#5a5650" : "#8a7a62", 0.9, 0, 23), red = M.flat("#5a2a24");
  const fb = kind === "higgins" ? 1.6 : B * 0.36, dr = kind === "higgins" ? 0.6 : B * 0.3;
  // planform hull, flared bow
  const pl: THREE.Vector2[] = []; const n = 24;
  for (let i = 0; i <= n; i++) { const s = i / n, x = -L / 2 + s * L, w = kind === "higgins" ? (s > 0.85 ? 1 : 1) * B / 2 : (B / 2) * Math.min(1, Math.sqrt(Math.max(0, (1 - s) / 0.32))) * Math.min(1, 0.75 + s * 2); pl.push(new THREE.Vector2(x, w)); }
  const shp = new THREE.Shape([...pl, ...pl.slice().reverse().map((p) => new THREE.Vector2(p.x, -p.y))]);
  const hg = new THREE.ExtrudeGeometry(shp, { depth: fb + dr, bevelEnabled: false }); hg.rotateX(-Math.PI / 2); hg.translate(0, -dr, 0);
  { const pa = hg.getAttribute("position") as THREE.BufferAttribute; for (let i = 0; i < pa.count; i++) { const y = pa.getY(i), k = (y + dr) / (fb + dr); pa.setZ(i, pa.getZ(i) * (0.72 + 0.28 * Math.min(1, k * 1.4))); const s = (pa.getX(i) + L / 2) / L; pa.setY(i, y + (y > 0 ? 0.12 * B * Math.max(0, s - 0.75) * 2 : 0)); } hg.computeVertexNormals(); }
  const hull = mesh(hg, hullM, g);
  const boot = mesh(hg.clone(), red, g); boot.scale.set(1.001, 1, 1.004); boot.position.y = -0.02; { const pa = boot.geometry.getAttribute("position") as THREE.BufferAttribute; for (let i = 0; i < pa.count; i++) if (pa.getY(i) > 0) pa.setY(i, 0); }
  void hull;
  const turrets: THREE.Group[] = [], guns: THREE.Object3D[] = [];
  const turret = (x: number, y: number, s: number, nb: number, back = false) => { const t = new THREE.Group(); t.position.set(x, y, 0); t.rotation.y = back ? Math.PI : 0; g.add(t);
    prof([[-s * 0.6, 0], [s * 0.55, 0], [s * 0.75, s * 0.22], [s * 0.6, s * 0.42], [-s * 0.6, s * 0.42]], s * 1.05, hullM, t, 0.08, 0.06);
    const gg = new THREE.Group(); gg.position.set(s * 0.6, s * 0.2, 0); t.add(gg); guns.push(gg);
    for (let i = 0; i < nb; i++) lathe([[0, s * 0.07], [s * 2.0, s * 0.045]], dark, gg, 10).position.z = (i - (nb - 1) / 2) * s * 0.28;
    turrets.push(t); };
  let ramp: THREE.Group | undefined;
  if (kind === "bb" || kind === "cruiser") {
    const s = kind === "bb" ? 9 : 6; rbox(L, 0.3, B * 0.9, deck, g, -2, fb + 0.1, 0, 0.1).scale.set(0.92, 1, 1);
    turret(L * 0.3, fb, s, 3); turret(L * 0.17, fb + s * 0.42, s, 3); turret(-L * 0.28, fb, s, 3, true);
    prof([[-L * 0.12, 0], [L * 0.1, 0], [L * 0.06, B * 0.35], [-L * 0.1, B * 0.35]], B * 0.5, hullM, g, 0.12).position.y = fb;
    prof([[-L * 0.05, 0], [L * 0.04, 0], [L * 0.02, B * 0.95], [-L * 0.03, B * 0.95]], B * 0.22, hullM, g, 0.25).position.set(L * 0.08, fb + B * 0.3, 0);
    for (const x of [-0.02, -0.08]) { const f = cyl(B * 0.09, B * 0.11, B * 0.65, dark, g, 14); f.position.set(L * x, fb + B * 0.65, 0); f.rotation.z = 0.08; }
    const mast = cyl(0.4, 0.6, B * 1.6, dark, g, 8); mast.position.set(L * 0.04, fb + B * 1.3, 0);
    for (let i = 0; i < 10; i++) { const a = cyl(0.3, 0.3, 3, dark, g, 6); a.position.set(-L * 0.18 + i * 4, fb + 1.5, (i % 2 ? 1 : -1) * B * 0.38); a.rotation.z = -1.1; }
  }
  if (kind === "destroyer") { turret(L * 0.3, fb, 3, 1); turret(L * 0.2, fb + 1.2, 3, 1); turret(-L * 0.35, fb, 3, 1, true);
    prof([[-10, 0], [8, 0], [6, 8], [-8, 8]], 7, hullM, g, 0.2).position.set(L * 0.1, fb, 0); const f = cyl(1.6, 1.8, 9, dark, g, 12); f.position.set(-L * 0.05, fb + 6, 0); }
  if (kind === "carrier") {
    const fd = rbox(L * 1.04, 1.2, B * 1.25, deck, g, 0, fb + 4, 0, 0.3);
    const strip = new THREE.Mesh(new THREE.PlaneGeometry(L * 0.98, 0.6), M.flat("#e8e4d8")); strip.rotation.x = -Math.PI / 2; strip.position.set(0, fb + 4.62, 0); g.add(strip);
    rbox(L * 1.0, 4, B * 1.0, hullM, g, 0, fb + 2, 0, 0.2);
    prof([[-16, 0], [16, 0], [12, 14], [-12, 14]], 7, hullM, g, 0.15).position.set(L * 0.05, fb + 4.6, B * 0.5);
    const f = cyl(2.6, 3.0, 10, dark, g, 12); f.position.set(L * 0.02, fb + 20, B * 0.52); f.rotation.x = -0.25;
    if ((o.nation ?? "jp") === "jp") { const hm = new THREE.Mesh(new THREE.CircleGeometry(6, 32), M.flat("#b8231e")); hm.rotation.x = -Math.PI / 2; hm.position.set(L * 0.35, fb + 4.63, 0); g.add(hm); }
    void fd;
  }
  if (kind === "higgins") {
    rbox(L * 0.98, 0.15, B * 0.95, deck, g, 0, 0.2, 0, 0.05);
    for (const s of [-1, 1]) rbox(L, 1.9, 0.12, hullM, g, 0, 1.0, s * B / 2, 0.04);
    rbox(1.2, 1.4, B * 0.9, hullM, g, -L / 2 + 0.6, 1.5, 0, 0.1);
    ramp = new THREE.Group(); ramp.position.set(L / 2, 0.1, 0); g.add(ramp); rbox(0.15, 2.2, B * 0.95, hullM, ramp, 0, 1.1, 0, 0.04);
  }
  return { g, turrets, guns, ramp, L };
};

// ---------------- ground vehicles / guns / rockets ----------------
export type Veh = { g: THREE.Group; roll: (d: number) => void; aux: THREE.Object3D[] };
const wheels4 = (g: THREE.Group, xs: number[], zs: number[], r: number, w: number) => { const ws: THREE.Object3D[] = []; const rub = M.flat("#161616"), hub = M.std("#4a4a44", 0.7, 0.4);
  for (const x of xs) for (const z of zs) { const p = new THREE.Group(); p.position.set(x, r, z); g.add(p); const t = cyl(r, r, w, rub, p, 20); t.rotation.x = Math.PI / 2; const h = cyl(r * 0.55, r * 0.55, w * 1.05, hub, p, 12); h.rotation.x = Math.PI / 2;
    for (let k = 0; k < 5; k++) { const b = rbox(0.04, 0.04, w * 1.1, hub, p, Math.cos(k * 1.26) * r * 0.35, Math.sin(k * 1.26) * r * 0.35, 0, 0.01); void b; } ws.push(p); } return ws; };
export const truck = (o: { col?: string; nation?: Nation; canvas?: boolean } = {}): Veh => {
  const g = new THREE.Group(), body = M.std(o.col ?? "#4a4e40", 0.8, 0.2, 31), cv = M.std("#6a6a50", 0.95, 0, 32), glass = M.glass();
  prof([[0, 0], [1.0, 0], [1.05, 0.55], [0.6, 0.75], [0, 0.78]], 1.7, body, g, 0.12).position.set(1.6, 0.95, 0);
  prof([[0, 0], [1.4, 0], [1.4, 1.05], [0.5, 1.15], [0, 1.15]], 2.1, body, g, 0.04).position.set(0.3, 0.9, 0);
  rbox(0.05, 0.45, 1.8, glass, g, 1.72, 1.75, 0, 0.01);
  rbox(3.6, 0.5, 2.3, body, g, -1.6, 1.15, 0, 0.04);
  if (o.canvas !== false) { const c = mesh(new THREE.CylinderGeometry(1.15, 1.15, 3.5, 16, 1, false, 0, Math.PI), cv, g); c.rotation.set(0, 0, Math.PI / 2); c.rotation.x = Math.PI / 2; c.rotation.z = Math.PI / 2; c.scale.set(1, 1, 0.7); c.position.set(-1.6, 1.45, 0); c.rotation.set(-Math.PI / 2, 0, Math.PI / 2); }
  for (const s of [-1, 1]) rbox(0.9, 0.08, 0.45, body, g, 1.9, 0.95, s * 0.95, 0.03).rotation.z = -0.2;
  const ws = wheels4(g, [2.0, -1.2, -2.4], [-0.95, 0.95], 0.46, 0.32);
  decal(o.nation ?? "none", 0.5, g, 0.9, 1.4, 1.06);
  return { g, aux: [], roll: (d) => ws.forEach((w) => (w.rotation.z = -d / 0.46)) };
};
export const jeep = (o: { col?: string } = {}): Veh => {
  const g = new THREE.Group(), body = M.std(o.col ?? "#4e5634", 0.8, 0.2, 33);
  prof([[-1.6, 0], [1.4, 0], [1.6, 0.25], [1.3, 0.55], [-1.6, 0.55]], 1.5, body, g, 0.04).position.y = 0.55;
  rbox(0.05, 0.4, 1.3, M.glass(), g, 0.5, 1.3, 0, 0.01);
  decal("us", 0.45, g, 0.9, 1.08, 0.0, 0, -Math.PI / 2);
  const ws = wheels4(g, [1.05, -1.05], [-0.72, 0.72], 0.38, 0.25);
  return { g, aux: [], roll: (d) => ws.forEach((w) => (w.rotation.z = -d / 0.38)) };
};
export const katyusha = (): Veh => {
  const v = truck({ col: "#4a5434", canvas: false, nation: "su" }), rails = new THREE.Group(); rails.position.set(-1.6, 1.6, 0); rails.rotation.z = 0.32; v.g.add(rails);
  const st = M.std("#3a3e30", 0.7, 0.5); for (let i = 0; i < 8; i++) rbox(4.2, 0.08, 0.12, st, rails, 0, (i % 2) * 0.22, -0.84 + i * 0.24, 0.02);
  v.aux.push(rails); return v;
};
export const howitzer = (o: { col?: string } = {}) => {
  const g = new THREE.Group(), body = M.std(o.col ?? "#4e5644", 0.75, 0.35, 41), dark = M.std("#2e302c", 0.7, 0.5);
  wheels4(g, [0], [-0.95, 0.95], 0.65, 0.22);
  prof([[-0.3, 0], [0.3, 0], [0.25, 1.4], [-0.25, 1.4]], 2.2, body, g, 0, 0.03).position.set(0.4, 0.4, 0);
  for (const s of [-1, 1]) { const tr = rbox(3.6, 0.18, 0.22, body, g, -1.8, 0.35, s * 0.4, 0.05); tr.rotation.y = s * 0.15; tr.rotation.z = -0.12; }
  const cradle = new THREE.Group(); cradle.position.set(0.2, 0.95, 0); cradle.rotation.z = 0.35; g.add(cradle);
  const barrel = new THREE.Group(); cradle.add(barrel); lathe([[-1.0, 0.2], [0, 0.17], [3.4, 0.11], [3.5, 0.13]], dark, barrel, 14); rbox(1.6, 0.35, 0.4, body, cradle, -0.3, -0.18, 0, 0.06);
  return { g, cradle, barrel, muzzle: () => barrel.localToWorld(V(3.7, 0, 0)) };
};
export const v2 = () => { const g = new THREE.Group(), m = M.std("#d8d6c8", 0.6, 0.2, 51), b = M.std("#1e1e1c", 0.6, 0.2, 52);
  const r = lathe([[0, 0.55], [1.5, 0.82], [9, 0.83], [12.5, 0.45], [14, 0.04]], m, g, 24); r.rotation.z = Math.PI / 2;
  for (let i = 0; i < 4; i++) { const f = prof([[0, 0], [2.2, 0], [1.6, 1.4], [0.4, 1.6]], 0.08, i % 2 ? b : m, g, 0, 0.02); f.rotation.set(0, (i * Math.PI) / 2, Math.PI / 2); f.position.y = 0.1; }
  for (let i = 0; i < 8; i++) { const s = rbox(0.06, 2.0, 0.9 * 0.6, b, g, 0, 4 + (i >> 1) * 2.2, 0, 0.01); s.position.set(Math.cos(i * 0.785) * 0.84, 4 + (i % 4) * 1.6, Math.sin(i * 0.785) * 0.84); s.rotation.y = -i * 0.785; }
  return g; };
export const abomb = (fat: boolean) => { const g = new THREE.Group(), m = M.std(fat ? "#d6c890" : "#5a6070", 0.5, 0.5, 53);
  if (fat) { const b = lathe([[-1.6, 0.05], [-1.2, 0.55], [0, 0.76], [1.0, 0.7], [1.6, 0.3], [1.65, 0.02]], m, g, 24); void b; rbox(0.9, 1.5, 1.5, m, g, -1.8, 0, 0, 0.1); }
  else { lathe([[-1.6, 0.05], [-1.4, 0.36], [1.4, 0.36], [1.6, 0.2], [1.62, 0.02]], m, g, 20); for (let i = 0; i < 4; i++) { const f = rbox(0.6, 0.04, 0.9, m, g, -1.5, 0, 0, 0.01); f.rotation.x = (i * Math.PI) / 4; } }
  return g; };

// ---------------- architecture / nature / props ----------------
export const building = (p: THREE.Object3D, x: number, z: number, w: number, h: number, d: number, o: { hue?: number; seed?: number; broken?: boolean; roof?: "flat" | "pitch"; floors?: number; lit?: number; rot?: number } = {}) => {
  const seed = o.seed ?? Math.round(x * 7 + z * 3), hue = o.hue ?? 20 + 25 * hs(seed, 3), broken = o.broken ?? false;
  const fm = new THREE.MeshStandardMaterial({ map: facadeTex(Math.round(hue), seed % 9, broken, o.floors ?? Math.max(2, Math.round(h / 3.2)), Math.max(2, Math.round(w / 3)), o.lit ?? 46), roughness: 0.92 });
  const sm2 = M.std(`hsl(${Math.round(hue)},14%,36%)`, 1, 0, seed);
  const gr = new THREE.Group(); gr.position.set(x, 0, z); gr.rotation.y = o.rot ?? 0; p.add(gr);
  mesh(new THREE.BoxGeometry(w, h, d), [sm2, sm2, sm2, sm2, fm, sm2], gr, 0, h / 2, 0);
  rbox(w + 0.3, 0.3, d + 0.3, sm2, gr, 0, h, 0, 0.05);
  if (o.roof === "pitch" && !broken) { const r = prof([[-d / 2 - 0.4, 0], [d / 2 + 0.4, 0], [0, d * 0.45]], w + 0.4, M.std("#6a3a2e", 0.9, 0, seed + 1), gr, 0, 0.02); r.rotation.y = Math.PI / 2; r.position.y = h; }
  if (broken) for (let k = 0; k < 6; k++) { const bw = w * (0.12 + 0.22 * hs(seed * 5 + k, 4)), bh = 0.6 + 2.6 * hs(seed * 5 + k, 5);
    const c = rbox(bw, bh, d * 0.96, sm2, gr, -w / 2 + bw / 2 + (w - bw) * hs(seed * 5 + k, 6), h + bh / 2 - 0.3, 0, 0.1); c.rotation.z = (hs(k, seed) - 0.5) * 0.4; }
  return gr;
};
export const tree = (p: THREE.Object3D, x: number, z: number, kind: "pine" | "birch" | "palm" | "oak" | "poplar" | "dead" | "bare", s = 1, seed = 1) => {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.scale.setScalar(s * (0.8 + 0.4 * hs(seed, 1))); g.rotation.y = hs(seed, 2) * 6; p.add(g);
  const bark = M.std(kind === "birch" || kind === "bare" ? "#d8d4c8" : kind === "palm" ? "#7a6448" : "#4a3828", 1, 0, 61), leaf = new THREE.MeshStandardMaterial({ color: kind === "pine" ? "#2a3e2a" : kind === "palm" ? "#4a7a2e" : kind === "birch" ? "#6a8a3a" : "#3e5a28", roughness: 0.95, flatShading: true });
  if (kind === "palm") { const tr = cyl(0.12, 0.2, 7, bark, g, 8); tr.position.set(0.3, 3.5, 0); tr.rotation.z = -0.1; for (let i = 0; i < 8; i++) { const f = rbox(3.2, 0.05, 0.6, leaf, g, 0, 0, 0, 0.02); f.geometry.translate(1.6, 0, 0); f.position.set(0.65, 7, 0); f.rotation.set(0, (i / 8) * Math.PI * 2, -0.35 - 0.2 * hs(i, seed)); } return g; }
  const tr = cyl(0.08, kind === "oak" ? 0.35 : 0.2, kind === "poplar" ? 9 : 6, bark, g, 8); tr.position.y = kind === "poplar" ? 4.5 : 3;
  if (kind === "dead" || kind === "bare") { for (let i = 0; i < 5; i++) { const b = cyl(0.03, 0.08, 2.2, bark, g, 5); b.position.set(0, 3 + i * 0.6, 0); b.rotation.set(0.9 * (hs(i, seed) - 0.5) * 2, i * 1.3, 0.8); } return g; }
  if (kind === "pine") for (let i = 0; i < 5; i++) { const c = mesh(new THREE.ConeGeometry(2.2 - i * 0.38, 2.4, 9), leaf, g); c.position.y = 2.2 + i * 1.25; c.rotation.y = i; }
  else for (let i = 0; i < (kind === "poplar" ? 6 : 7); i++) { const r = kind === "oak" ? 2.2 : kind === "poplar" ? 1.3 : 1.4; const c = mesh(new THREE.IcosahedronGeometry(r * (0.7 + 0.5 * hs(i, seed + 3)), 1), leaf, g);
    c.position.set((hs(i, seed + 4) - 0.5) * r * 1.4, (kind === "poplar" ? 4 + i * 1.0 : 5 + (hs(i, seed + 5) - 0.3) * 2.4), (hs(i, seed + 6) - 0.5) * r * 1.4); c.scale.y = kind === "poplar" ? 1.6 : 0.85; }
  return g;
};
export const rocks = (p: THREE.Object3D, n: number, x0: number, x1: number, z0: number, z1: number, cols = ["#6a6258", "#7a5446"], s0 = 0.12, s1 = 0.8, seed = 1, avoid?: (x: number, z: number) => boolean) => {
  const mats = cols.map((c, i) => M.std(c, 1, 0, seed + i)), geo = new THREE.DodecahedronGeometry(1, 0);
  for (let i = 0; i < n; i++) { const s = s0 + (s1 - s0) * hs(i, seed) ** 2, x = x0 + (x1 - x0) * hs(i, seed + 2), z = z0 + (z1 - z0) * hs(i, seed + 3); if (avoid?.(x, z)) continue;
    const m = mesh(geo, mats[i % mats.length], p, x, s * 0.35, z); m.scale.set(s * (0.8 + 0.6 * hs(i, seed + 7)), s * 0.6, s); m.rotation.set(hs(i, seed + 4) * 6, hs(i, seed + 5) * 6, hs(i, seed + 6) * 6); }
};
export const sandbags = (p: THREE.Object3D, x: number, z: number, len: number, rows = 3, rot = 0) => { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = rot; p.add(g); const m = M.std("#8a7a5a", 1, 0, 71);
  for (let r = 0; r < rows; r++) for (let i = 0; i < len / 0.62; i++) { const b = rbox(0.6, 0.22, 0.38, m, g, -len / 2 + i * 0.62 + (r % 2) * 0.3, 0.11 + r * 0.21, 0, 0.1); b.rotation.y = (hs(i + r * 30, 3) - 0.5) * 0.15; } return g; };
export const hedgehog = (p: THREE.Object3D, x: number, z: number, rot = 0) => { const g = new THREE.Group(); g.position.set(x, 0.75, z); g.rotation.y = rot; p.add(g); const m = M.std("#4a3a2e", 0.7, 0.6, 72);
  for (let i = 0; i < 3; i++) { const b = rbox(2.2, 0.16, 0.16, m, g, 0, 0, 0, 0.02); b.rotation.set(i === 0 ? 0.7 : 0, i === 1 ? 1.2 : -1.2 * (i - 1), 0.7); } return g; };
export const bunker = (p: THREE.Object3D, x: number, z: number, rot = 0) => { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = rot; p.add(g); const m = M.std("#8a867a", 0.95, 0, 73);
  prof([[-3, 0], [3, 0], [2.6, 2.4], [-3, 2.6]], 6, m, g, 0.1, 0.15); rbox(2.6, 0.35, 0.3, M.flat("#0a0a0a"), g, 2.75, 1.6, 0, 0.05).rotation.z = 0.15; return g; };
export const pole = (p: THREE.Object3D, x: number, z: number, h = 8, lean = 0) => { const m = M.std("#3a2c20", 1, 0, 74); const o = cyl(0.1, 0.13, h, m, p, 8); o.position.set(x, h / 2, z); o.rotation.z = lean; const a = rbox(1.6, 0.1, 0.1, m, o, 0, h / 2 - 0.5, 0, 0.02); void a; return o; };
export const wire = (p: THREE.Object3D, x0: number, x1: number, z: number) => { const m = M.std("#3a3430", 0.7, 0.6, 75); for (let x = x0; x < x1; x += 2.4) { const a = rbox(0.08, 1.2, 0.08, m, p, x, 0.6, z, 0.01); a.rotation.z = 0.2; }
  const c = new THREE.Mesh(new THREE.TorusGeometry(0.45, 0.012, 4, 40), M.flat("#4a4440")); for (let x = x0; x < x1; x += 0.5) { const k = c.clone(); k.position.set(x, 0.45, z); k.rotation.y = Math.PI / 2 + 0.3 * Math.sin(x); p.add(k); } };
export const crater = (p: THREE.Object3D, x: number, z: number, r = 2) => { const m = new THREE.Mesh(new THREE.TorusGeometry(r, r * 0.25, 6, 24), M.std("#3a2e24", 1, 0, 76)); m.rotation.x = -Math.PI / 2; m.scale.z = 0.6; m.position.set(x, 0, z); m.receiveShadow = true; p.add(m);
  const d = new THREE.Mesh(new THREE.CircleGeometry(r, 20), M.flat("#1e1812")); d.rotation.x = -Math.PI / 2; d.position.set(x, 0.02, z); p.add(d); };
