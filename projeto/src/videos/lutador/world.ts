// O sertão: dry caatinga ground, rocky ravine (Grota do Angico) with the camp, the São Francisco river beyond, the
// rock above the river (ending) and, far away, the church steps of the town. Sky, light rig and cards as in the Pisa short.
import * as THREE from "three";
import { Batch, boxGeo, V, lam, house, Kit, quad, tri } from "./build";
import { ctex, cloudHD, rep } from "./paint";
import { LIGHTS, LOOK, LightPreset } from "./lights";
import { TONE, CHAR, untone } from "./shade";
import { NOINK } from "./ink";
import { Pool, Actor, Fx, stage } from "./cast";
import { FPS, D0, SHOTS, camAt, ShotDef, V3, INTRO_Z, TOWN_X, VIEW_Z } from "./story";

export const loadKit = async (): Promise<Kit> => ({});

const discTex = () => ctex("sunDisc", 128, 128, (g) => {
  const gr = g.createRadialGradient(64, 64, 58, 64, 64, 64); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
});
const SUN_SHOT: Record<number, { az?: number; el?: number }> = { 3: { az: 4, el: 6 }, 12: { az: 40, el: 9 }, 14: { az: 3, el: 5 } };

const quadUp = (x0: number, x1: number, z0: number, z1: number, u: number, v: number, y = D0) => {
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute([x0, y, z1, x1, y, z1, x1, y, z0, x0, y, z1, x1, y, z0, x0, y, z0], 3));
  g.setAttribute("normal", new THREE.Float32BufferAttribute([0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0], 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute([0, 0, u, 0, u, v, 0, 0, u, v, 0, v], 2));
  return g;
};
const cyl = (r0: number, r1: number, h: number, n = 16) => new THREE.CylinderGeometry(r1, r0, h, n, 1).translate(0, h / 2, 0);
const at = (x: number, y: number, z: number) => new THREE.Matrix4().makeTranslation(x, y, z);
const hash = (i: number, s = 0) => { const v = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return v - Math.floor(v); };

/** dry sertão earth: warm ochre with pebbles and cracks */
const earth = () => ctex("earthHD", 1024, 1024, (g, r) => {
  g.fillStyle = "#cfa772"; g.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < 260; i++) { g.fillStyle = ["#c79c66", "#d6b07c", "#bf935e", "#dbb98a"][i % 4]; g.beginPath(); g.ellipse(r() * 1024, r() * 1024, 20 + r() * 60, 10 + r() * 30, r() * 3, 0, 7); g.fill(); }
  g.strokeStyle = "rgba(120,80,50,0.45)"; g.lineWidth = 2;
  for (let i = 0; i < 40; i++) { let x = r() * 1024, y = r() * 1024; g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 5; k++) { x += (r() - 0.5) * 60; y += (r() - 0.5) * 60; g.lineTo(x, y); } g.stroke(); }
  for (let i = 0; i < 300; i++) { g.fillStyle = r() < 0.5 ? "#a98256" : "#e6cfa4"; g.beginPath(); g.ellipse(r() * 1024, r() * 1024, 3 + r() * 5, 2 + r() * 3, 0, 0, 7); g.fill(); }
});
const water = () => ctex("riverHD", 512, 512, (g, r) => {
  g.fillStyle = "#2f7fa8"; g.fillRect(0, 0, 512, 512);
  g.strokeStyle = "rgba(190,230,240,0.55)"; g.lineWidth = 3;
  for (let i = 0; i < 40; i++) { const x = r() * 512, y = r() * 512; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 20 + r() * 30, y + (r() - 0.5) * 3); g.stroke(); }
});

const IZ = INTRO_Z;
export class World {
  root = new THREE.Group();
  private pool = new Pool();
  private actors: Actor[] = [];
  private fxs: Fx[] = [];
  private hemi: THREE.HemisphereLight; private sun: THREE.DirectionalLight;
  private sky: THREE.Mesh; private skyMat: THREE.ShaderMaterial;
  private fog = new THREE.Fog("#bccbec", 25, 420);
  private sunDisc: THREE.Sprite;
  private sunCache = new Map<number, THREE.Vector3>();
  private cloudMaps: Record<"day" | "golden" | "night", THREE.Texture[]>;
  private clouds: THREE.Mesh[] = [];
  private earthM!: THREE.MeshLambertMaterial;
  private frustum = new THREE.Frustum();
  private m4 = new THREE.Matrix4(); private v = new THREE.Vector3(); private sph = new THREE.Sphere();

  constructor(_kit: Kit) {
    const R = this.root, M: Record<string, THREE.Material> = {};
    this.skyMat = new THREE.ShaderMaterial({
      uniforms: { c0: { value: new THREE.Color() }, c1: { value: new THREE.Color() }, c2: { value: new THREE.Color() },
        c3: { value: new THREE.Color() }, c4: { value: new THREE.Color() }, e: { value: new THREE.Vector4() } },
      vertexShader: "varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
      fragmentShader: `uniform vec3 c0, c1, c2, c3, c4; uniform vec4 e; varying vec3 vP;
        void main(){ float el = asin(clamp(normalize(vP).y, -1.0, 1.0));
          vec3 c = mix(c0, c1, smoothstep(0.0, e.x, el));
          c = mix(c, c2, smoothstep(e.x, e.y, el));
          c = mix(c, c3, smoothstep(e.y, e.z, el));
          c = mix(c, c4, smoothstep(e.z, e.w, el));
          gl_FragColor = vec4(c, 1.0); }`,
      side: THREE.BackSide, depthWrite: false, fog: false,
    });
    this.sky = new THREE.Mesh(new THREE.SphereGeometry(1100, 48, 24), this.skyMat);
    this.sky.renderOrder = -1; this.sky.frustumCulled = false; this.sky.layers.set(NOINK);
    R.add(this.sky);
    this.sunDisc = new THREE.Sprite(new THREE.SpriteMaterial({ map: discTex(), color: new THREE.Color(6.0, 4.4, 2.4), fog: false, depthWrite: false }));
    this.sunDisc.frustumCulled = false; this.sunDisc.layers.set(NOINK); R.add(this.sunDisc);
    this.hemi = new THREE.HemisphereLight("#cfe6ff", "#6c5c8c", 1.1);
    this.sun = new THREE.DirectionalLight("#fff0d6", 2.6);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(2048, 2048);
    R.add(this.hemi, this.sun, this.sun.target);
    this.cloudMaps = { day: [0, 1, 2, 3].map((k) => cloudHD(k, LOOK.day.cloud)), golden: [0, 1, 2, 3].map((k) => cloudHD(k, LOOK.golden.cloud)), night: [0, 1, 2, 3].map((k) => cloudHD(k, LOOK.night.cloud)) };
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2 + 0.3, d = 620 + (i % 3) * 60;
      const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: this.cloudMaps.day[i % 4], color: new THREE.Color(1.1, 1.1, 1.1), transparent: true, depthWrite: false, fog: false }));
      const w = 140 + (i % 4) * 30;
      m.position.set(Math.cos(a) * d, 110 + (i % 4) * 40, Math.sin(a) * d); m.scale.set(w, w / 2, 1);
      m.layers.set(NOINK);
      this.clouds.push(m); R.add(m);
    }

    // ---- materials ----
    M.earth = lam("earthHD", () => ({ map: rep(earth(), 1, 1) }));
    this.earthM = M.earth as THREE.MeshLambertMaterial;
    M.rockA = lam("rockA", () => ({ color: "#b49478" }));
    M.rockB = lam("rockB", () => ({ color: "#a08470" }));
    M.rockC = lam("rockC", () => ({ color: "#c2a68a" }));
    M.bark = lam("barkGrey", () => ({ color: "#8c8078" }));
    M.shrubA = lam("shrubA", () => ({ color: "#8a9a52" }));
    M.shrubB = lam("shrubB", () => ({ color: "#a3a35c" }));
    M.shrubC = lam("shrubC", () => ({ color: "#6f8a4c" }));
    M.cactus = lam("cactus", () => ({ color: "#4f8a5a" }));
    M.water = lam("river", () => ({ map: rep(water(), 60, 30) }));
    M.hill = lam("hillFar", () => ({ color: "#9c9a6a" }));
    M.hill2 = lam("hillFar2", () => ({ color: "#8a8c62" }));
    M.cloth = lam("tentCloth", () => ({ color: "#d8c9a4", side: THREE.DoubleSide }));
    M.wood = lam("logs", () => ({ color: "#6e4a30" }));
    M.ash = lam("ash", () => ({ color: "#5a5250" }));
    M.white = lam("churchWall", () => ({ color: "#f2ece0" }));
    M.trim = lam("churchTrim", () => ({ color: "#d9a441" }));
    M.step = lam("steps", () => ({ color: "#c9bda8" }));
    M.door = lam("churchDoor", () => ({ color: "#5a3a26" }));
    M.roof = lam("churchRoof", () => ({ color: "#b5543c", side: THREE.DoubleSide }));

    // ---- sight lines of every shot: nothing tall may stand between the lens and its subject ----
    const rays: { o: THREE.Vector3; e: THREE.Vector3 }[] = [];
    for (const s of SHOTS) for (let f = s.a; f < s.b; f += 12) { const c = camAt(s.id, f); rays.push({ o: V(...c.pos), e: V(...c.look) }); }
    const seg = new THREE.Vector3(), w2 = new THREE.Vector3();
    const blocks = (x: number, z: number, r: number, h: number) => rays.some(({ o, e }) => {
      seg.copy(e).sub(o); const L2 = seg.lengthSq();
      w2.set(x, Math.min(h, Math.max(0, o.y)), z).sub(o);
      const t = Math.max(0, Math.min(1, w2.dot(seg) / L2));
      const px = o.x + seg.x * t - x, pz = o.z + seg.z * t - z, py = o.y + seg.y * t;
      return py < h + 0.3 && Math.hypot(px, pz) < r + 0.6 && o.distanceTo(V(x, o.y, z)) > 0.4;
    });

    const b = new Batch();
    b.add(quadUp(-900, 900, -900, 120, 120, 68), M.earth);
    b.add(quadUp(-900, 900, 160, 900, 120, 50), M.earth);
    // river São Francisco (wide, green-blue) with sandy banks
    b.add(quadUp(-900, 900, 118, 165, 1, 1, D0 - 0.4), M.water);
    // far bank: low sertão hills
    ([[-260, 420, 260, 50, 120], [40, 460, 300, 70, 140], [320, 430, 240, 55, 120], [-520, 380, 220, 40, 120], [560, 360, 200, 45, 100]] as const)
      .forEach(([x, z, sx, sy, sz], i) => b.add(new THREE.SphereGeometry(1, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2), i % 2 ? M.hill : M.hill2, new THREE.Matrix4().compose(V(x, D0 - 2, z), new THREE.Quaternion(), V(sx, sy, sz))));
    // ---- rocks: the ravine walls of the Grota (x = +-14..30) and boulders ----
    const rock = (x: number, z: number, s: number, i: number, sy = 0.8) => {
      if (blocks(x, z, s, s * sy * 2)) return;
      const g = new THREE.DodecahedronGeometry(1, 0);
      const m = new THREE.Matrix4().compose(V(x, D0 + s * sy * 0.55, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(hash(i, 1) * 3, hash(i, 2) * 3, 0)), V(s * (1 + hash(i, 3) * 0.5), s * sy, s));
      b.add(g, [M.rockA, M.rockB, M.rockC][i % 3], m);
    };
    let ri = 0;
    for (let z = -40; z <= 60; z += 3.2) for (const side of [-1, 1]) {
      rock(side * (15 + hash(ri, 4) * 4), z + hash(ri, 5) * 2, 3 + hash(ri, 6) * 2.5, ri, 1.0); ri++;
      rock(side * (21 + hash(ri, 4) * 5), z + hash(ri, 5) * 2, 4.5 + hash(ri, 6) * 3, ri, 1.2); ri++;
    }
    // ridge above the river (ending): boulders around the viewpoint, the hat rock itself
    for (let i = 0; i < 14; i++) { const x = -12 + i * 1.9 + hash(i, 7); if (Math.abs(x) > 5) rock(x, VIEW_Z + 3 + hash(i, 8) * 4, 0.8 + hash(i, 9) * 1.2, ri++, 0.7); }
    b.add(new THREE.DodecahedronGeometry(1, 0), M.rockC, new THREE.Matrix4().compose(V(0, D0 + 0.35, VIEW_Z), new THREE.Quaternion(), V(0.9, 0.45, 0.8)));
    // ---- caatinga: dry grey trees, olive shrubs, mandacaru cacti ----
    const tree = (x: number, z: number, s: number, i: number) => {
      if (blocks(x, z, 1.6 * s, 4 * s)) return;
      b.add(cyl(0.16 * s, 0.1 * s, 2.4 * s, 6), M.bark, at(x, D0, z));
      for (let k = 0; k < 3; k++) {
        const a = hash(i, k + 10) * 6.28, br = new THREE.CylinderGeometry(0.05 * s, 0.08 * s, 1.6 * s, 5).translate(0, 0.8 * s, 0).rotateZ(0.6).rotateY(a);
        b.add(br, M.bark, at(x, D0 + 1.8 * s, z));
      }
      if (i % 3) b.add(new THREE.IcosahedronGeometry(1.0 * s, 0), i % 2 ? M.shrubB : M.shrubA, new THREE.Matrix4().compose(V(x, D0 + 2.9 * s, z), new THREE.Quaternion(), V(1.3, 0.6, 1.3)));
    };
    const shrub = (x: number, z: number, s: number, i: number) => {
      if (blocks(x, z, 0.9 * s, 1.4 * s)) return;
      for (let k = 0; k < 3; k++) b.add(new THREE.IcosahedronGeometry(0.6 * s, 1), [M.shrubA, M.shrubB, M.shrubC][(i + k) % 3], at(x + (k - 1) * 0.45 * s, D0 + 0.45 * s + (k % 2) * 0.2 * s, z + hash(i, k) * 0.4));
    };
    const cactus = (x: number, z: number, s: number, i: number) => {
      if (blocks(x, z, 0.8 * s, 3.5 * s)) return;
      b.add(cyl(0.22 * s, 0.2 * s, 3.2 * s, 10), M.cactus, at(x, D0, z));
      b.add(new THREE.SphereGeometry(0.2 * s, 10, 6), M.cactus, at(x, D0 + 3.2 * s, z));
      for (const sd of [-1, 1]) {
        const y0 = (1.2 + hash(i, sd + 3) * 0.6) * s;
        b.add(new THREE.CylinderGeometry(0.15 * s, 0.15 * s, 0.6 * s, 8).rotateZ(Math.PI / 2), M.cactus, at(x + sd * 0.4 * s, D0 + y0, z));
        b.add(cyl(0.15 * s, 0.14 * s, 1.1 * s, 8), M.cactus, at(x + sd * 0.7 * s, D0 + y0, z));
        b.add(new THREE.SphereGeometry(0.14 * s, 8, 6), M.cactus, at(x + sd * 0.7 * s, D0 + y0 + 1.1 * s, z));
      }
    };
    const clear = (x: number, z: number) =>
      (Math.abs(x) < 7 && Math.abs(z) < 9) || (Math.abs(x) < 3 && z > VIEW_Z - 12 && z < VIEW_Z + 4) || z > 112 || Math.abs(x - TOWN_X) < 60;
    for (let i = 0; i < 900; i++) {
      const x = (hash(i, 20) - 0.5) * 260, z = -150 + hash(i, 21) * 260;
      if (clear(x, z) || (Math.abs(x) > 13 && Math.abs(x) < 30 && z > -42 && z < 62)) continue;
      const k = i % 7, s = 0.8 + hash(i, 22) * 0.6;
      if (k < 3) shrub(x, z, s, i); else if (k < 6) tree(x, z, s, i); else cactus(x, z, s * 0.9, i);
    }
    // framing plants near the shots
    ([[-3.2, -12], [3.6, -13], [-8.5, -15], [-4, -19.8], [-6.2, -21.3], [2.8, -23], [-2.5, -27.5], [4.5, -28], [-12.5, -3], [-11.5, 2.5], [-13, 7],
      [-6, IZ + 5], [5, IZ + 6], [-3, IZ + 12], [7, IZ + 2], [-8, IZ - 1]] as const).forEach(([x, z], i) => (i % 3 === 2 ? tree(x, z, 1, i + 7) : shrub(x, z, 1.1, i)));
    cactus(-5.5, IZ + 9, 1.1, 3); cactus(6.5, IZ + 10, 1, 5); cactus(4.5, 6.5, 1, 9); cactus(-6.3, 5, 0.9, 11);
    // ---- the camp: a tarp lean-to, rolled blankets, the campfire ----
    const tx = 3.2, tz = 4.2;
    b.add(quad(V(tx - 2, D0, tz + 1.6), V(tx + 2, D0, tz + 1.6), V(tx + 2, D0 + 1.9, tz), V(tx - 2, D0 + 1.9, tz)), M.cloth);
    b.add(quad(V(tx + 2, D0, tz - 1.6), V(tx - 2, D0, tz - 1.6), V(tx - 2, D0 + 1.9, tz), V(tx + 2, D0 + 1.9, tz)), M.cloth);
    for (const sx of [-2, 2]) b.add(cyl(0.05, 0.05, 2.0, 6), M.wood, at(tx + sx, D0, tz));
    b.add(new THREE.CylinderGeometry(0.6, 0.7, 0.08, 16).translate(0, 0.04, 0), M.ash, at(0.2, D0, -1.2));
    for (let k = 0; k < 4; k++) b.add(new THREE.CylinderGeometry(0.07, 0.07, 1.1, 6).rotateZ(Math.PI / 2).rotateY(k * 0.8), M.wood, at(0.2, D0 + 0.12, -1.2));
    for (const [x, z] of [[-2.6, 2.5], [-1.4, 3.4], [1.5, 2.8]]) b.add(new THREE.CylinderGeometry(0.22, 0.22, 1.4, 10).rotateZ(Math.PI / 2), M.cloth, at(x, D0 + 0.22, z));
    // ---- the town (Piranhas): white church, steps, houses ----
    const cx = TOWN_X, cz = 20;
    b.add(boxGeo(V(cx - 7, D0, cz), V(cx + 7, D0 + 10, cz + 16)), M.white);
    b.add(tri(V(cx - 7, D0 + 10, cz - 0.02), V(cx + 7, D0 + 10, cz - 0.02), V(cx, D0 + 14, cz - 0.02)), M.white);
    b.add(boxGeo(V(cx - 7.3, D0 + 9.6, cz - 0.3), V(cx + 7.3, D0 + 10.2, cz + 0.2)), M.trim);
    b.add(quad(V(cx - 7.5, D0 + 10, cz + 16), V(cx - 7.5, D0 + 10, cz), V(cx, D0 + 14, cz), V(cx, D0 + 14, cz + 16)), M.roof);
    b.add(quad(V(cx + 7.5, D0 + 10, cz), V(cx + 7.5, D0 + 10, cz + 16), V(cx, D0 + 14, cz + 16), V(cx, D0 + 14, cz)), M.roof);
    b.add(boxGeo(V(cx + 7, D0, cz), V(cx + 11, D0 + 17, cz + 4)), M.white);
    b.add(new THREE.ConeGeometry(2.9, 4, 4).rotateY(Math.PI / 4).translate(0, 2, 0), M.roof, at(cx + 9, D0 + 17, cz + 2));
    b.add(boxGeo(V(cx - 1.4, D0 + 1.35, cz - 0.08), V(cx + 1.4, D0 + 5.6, cz)), M.door);
    for (let k = 0; k < 4; k++) b.add(boxGeo(V(cx - 6 + k * 0.3, D0, cz - 4 + k * 1.0), V(cx + 6 - k * 0.3, D0 + 0.35 * (k + 1), cz)), M.step);
    let hs = 2;
    for (const [x, z, yaw] of [[cx - 22, 18, 0], [cx - 34, 16, 0], [cx + 22, 18, 0], [cx + 34, 20, 0], [cx - 30, -18, Math.PI], [cx + 26, -18, Math.PI]] as const) { house(b, x, z, yaw + Math.PI, 10, 8, 6 + (hs % 2), hs); hs++; }
    for (let i = 0; i < 10; i++) { const x = cx - 60 + i * 13; if (Math.abs(x - cx) > 14) tree(x, 38 + hash(i, 30) * 6, 1.2, i); }
    b.build(R);
  }

  private shotSun(id: number, s: ShotDef, L: LightPreset) {
    let v = this.sunCache.get(id);
    if (v) return v;
    let fx = 0, fz = 0;
    for (let f = s.a; f < s.b; f += 3) {
      const c = camAt(id, f), x = c.look[0] - c.pos[0], z = c.look[2] - c.pos[2], n = Math.hypot(x, z) || 1;
      fx += x / n; fz += z / n;
    }
    const n = Math.hypot(fx, fz) || 1; fx /= n; fz /= n;
    const az = THREE.MathUtils.degToRad(SUN_SHOT[id]?.az ?? L.az), el = THREE.MathUtils.degToRad(SUN_SHOT[id]?.el ?? L.el);
    const hx = fx * Math.cos(az) - fz * Math.sin(az), hz = fz * Math.cos(az) + fx * Math.sin(az);
    v = new THREE.Vector3(hx * Math.cos(el), Math.sin(el), hz * Math.cos(el)).normalize();
    this.sunCache.set(id, v);
    return v;
  }
  private actor(i: number) { while (this.actors.length <= i) this.actors.push(new Actor(this.root)); return this.actors[i]; }
  private fx(i: number) { while (this.fxs.length <= i) this.fxs.push(new Fx(this.root)); return this.fxs[i]; }

  update(id: number, f: number, cam: THREE.PerspectiveCamera, scene: THREE.Scene) {
    const t = f / FPS, s = SHOTS[id - 1], L = LIGHTS[s.light];
    const c = camAt(id, f);
    cam.position.set(...c.pos); cam.up.set(0, 1, 0); cam.lookAt(...c.look); cam.rotateZ(c.roll);
    cam.fov = c.fov; cam.near = 0.2; cam.far = 1500; cam.updateProjectionMatrix(); cam.updateMatrixWorld();
    const focus = V(...c.look), dist = cam.position.distanceTo(focus);
    cam.layers.enable(NOINK);
    const K = LOOK[s.light], sunDir = this.shotSun(id, s, L);
    this.hemi.color.set(L.sky); this.hemi.groundColor.set(L.ground); this.hemi.intensity = L.hemiI;
    this.sun.color.set(L.sunCol); this.sun.intensity = L.sunI;
    let Rr = THREE.MathUtils.clamp(dist * 1.15 + 7, 14, 110);
    if (s.light === "golden") Rr = Math.max(Rr, 40);
    this.sun.position.copy(focus).addScaledVector(sunDir, 260); this.sun.target.position.copy(focus);
    const sc = this.sun.shadow.camera;
    sc.left = -Rr; sc.right = Rr; sc.top = Rr; sc.bottom = -Rr; sc.near = 20; sc.far = 560; sc.updateProjectionMatrix();
    this.sun.shadow.bias = L.bias; this.sun.shadow.normalBias = L.normalBias * (Rr / 12);
    TONE.uLitCol.value.set(...L.lit); TONE.uShadeCol.value.set(...L.shade); TONE.uShadeLift.value.set(...L.lift);
    TONE.uLambert.value = L.lambert; TONE.uSideK.value = L.sideK; TONE.uTerm.value = L.term; TONE.uBounce.value.set(...LOOK[s.light].bounce); TONE.uSat.value = LOOK[s.light].sat;
    CHAR.uCharTint.value.set(...L.charTint); CHAR.uCharShade.value = L.charShade; CHAR.uGrad.value = L.charGrad;
    CHAR.uBodyGrad.value = L.bodyGrad; CHAR.uSideTint.value.set(...L.sideTint);
    const su = this.skyMat.uniforms;
    K.sky.c.forEach((h, i) => untone(h, su["c" + i].value));
    const e = K.sky.e.map((deg) => THREE.MathUtils.degToRad(deg));
    su.e.value.set(e[1], e[2], e[3], e[4]);
    this.sky.position.copy(cam.position);
    untone(L.fog, this.fog.color); this.fog.near = L.fogNear; this.fog.far = L.fogFar * 1.4;
    scene.fog = this.fog; scene.background = null;
    this.sunDisc.visible = s.light === "golden";
    if (this.sunDisc.visible) {
      this.sunDisc.position.copy(cam.position).addScaledVector(sunDir, 900);
      this.sunDisc.scale.setScalar(2 * 900 * Math.tan(THREE.MathUtils.degToRad(1.7)));
    }
    for (let i = 0; i < this.clouds.length; i++) {
      const m = this.clouds[i];
      m.lookAt(cam.position.x, m.position.y, cam.position.z);
      (m.material as THREE.MeshBasicMaterial).map = this.cloudMaps[s.light][i % 4];
    }
    if (s.light === "night") this.earthM.color.setRGB(0.42, 0.46, 0.7); else this.earthM.color.setRGB(1, 1, 1);
    // ---- cast + effects ----
    const right = V(0, 0, 0).setFromMatrixColumn(cam.matrixWorld, 0);
    const st = stage(id, t, { pos: cam.position, right });
    this.frustum.setFromProjectionMatrix(this.m4.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse));
    const tint = s.light === "golden" ? "#ffcf9e" : "#ffffff";
    let ai = 0;
    const used: Actor[] = [];
    for (const p of st.places) {
      const sc2 = p.scale ?? 1;
      if (!this.frustum.intersectsSphere(this.sph.set(this.v.set(p.x, p.y + 1.1 * sc2, p.z), 3.5))) continue;
      const a = this.actor(ai++);
      const [w, h, k] = p.size ?? [300, 500, 0.5];
      a.r = this.pool.req(p.key, w, h, k, p.draw);
      a.mesh.visible = true;
      a.mesh.position.set(p.x, p.y, p.z);
      a.mesh.rotation.set(0, p.yaw ?? Math.atan2(cam.position.x - p.x, cam.position.z - p.z), p.roll ?? 0);
      a.mesh.scale.set(p.mirror ? -sc2 : sc2, sc2, sc2);
      if (a.mat.emissiveMap) a.mat.emissive.set(tint);
      a.mesh.castShadow = L.actorShadow;
      used.push(a);
    }
    for (let i = ai; i < this.actors.length; i++) this.actors[i].mesh.visible = false;
    let fi = 0;
    const fused: Fx[] = [];
    for (const p of st.fx) {
      if (!this.frustum.intersectsSphere(this.sph.set(this.v.set(p.x, p.y, p.z), Math.max(p.w, p.h)))) continue;
      const e2 = this.fx(fi++);
      e2.r = this.pool.req(p.key, p.cw, p.ch, 1, p.draw);
      e2.use(!!p.soft);
      e2.mesh.visible = true;
      e2.mesh.position.set(p.x, p.y, p.z);
      if (p.flat) e2.mesh.rotation.set(-Math.PI / 2, 0, p.rot ?? 0);
      else { e2.mesh.quaternion.copy(cam.quaternion); e2.mesh.rotateZ(p.rot ?? 0); }
      e2.mesh.scale.set(p.w, p.h, 1);
      fused.push(e2);
    }
    for (let i = fi; i < this.fxs.length; i++) this.fxs[i].mesh.visible = false;
    this.pool.flush();
    for (const a of used) a.bind();
    for (const e3 of fused) e3.bind();
    return focus;
  }
}
export type { V3 };
