// Ipiranga ao entardecer: terreno, rio, árvores, céu físico e cavaleiros (tudo procedural)
import * as THREE from 'three';
import {Water} from 'three/examples/jsm/objects/Water.js';
import {Sky} from 'three/examples/jsm/objects/Sky.js';

export const SUN = new THREE.Vector3().setFromSphericalCoords(1, THREE.MathUtils.degToRad(90 - 3.5), THREE.MathUtils.degToRad(186));
const rnd = (s: number) => { const x = Math.sin(s * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const riverZ = (x: number) => 110 + 45 * Math.sin(x * 0.006);
export function H(x: number, z: number) {
  let h = 10 * Math.sin(x * 0.006 + 1) * Math.cos(z * 0.005) + 6 * Math.sin(x * 0.017 + z * 0.011);
  h += 26 * Math.exp(-(x * x + z * z) / (2 * 55 * 55));
  const d = z - riverZ(x); h -= 14 * Math.exp(-(d * d) / (2 * 22 * 22));
  return h + 4;
}

function terrain() {
  const g = new THREE.PlaneGeometry(3000, 3000, 260, 260); g.rotateX(-Math.PI / 2);
  const p = g.attributes.position as THREE.BufferAttribute, col: number[] = [];
  const c1 = new THREE.Color(0x2e4a1c), c2 = new THREE.Color(0x56622a), c3 = new THREE.Color(0x6b5a34);
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), z = p.getZ(i), h = H(x, z); p.setY(i, h);
    const n = rnd(i * 0.37);
    const c = c1.clone().lerp(c2, Math.min(1, Math.max(0, h / 30 + n * 0.3))).lerp(c3, Math.max(0, 0.6 - h / 4) * 0.8);
    col.push(c.r, c.g, c.b);
  }
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.computeVertexNormals();
  return new THREE.Mesh(g, new THREE.MeshStandardMaterial({vertexColors: true, roughness: 1}));
}
function mountains() {
  const g = new THREE.CylinderGeometry(2200, 2200, 1, 256, 8, true);
  const p = g.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), z = p.getZ(i), a = Math.atan2(z, x), top = p.getY(i) > 0;
    const hh = 90 + 70 * Math.sin(a * 5 + 1) + 40 * Math.sin(a * 13) + 20 * Math.sin(a * 31);
    p.setY(i, top ? hh : -20);
  }
  g.computeVertexNormals();
  return new THREE.Mesh(g, new THREE.MeshStandardMaterial({color: 0x3a4a55, roughness: 1, side: THREE.BackSide}));
}
function trees() {
  const N = 700, grp = new THREE.Group();
  const crown = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 1), new THREE.MeshStandardMaterial({color: 0x1f3517, roughness: 1, flatShading: true}), N * 2);
  const trunk = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.25, 0.35, 1, 6), new THREE.MeshStandardMaterial({color: 0x2a1d12, roughness: 1}), N);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), v = new THREE.Vector3();
  let k = 0, ci = 0;
  for (let i = 0; i < 4000 && k < N; i++) {
    const x = (rnd(i) - 0.5) * 1400, z = (rnd(i + 999) - 0.5) * 1400 - 150;
    if (Math.hypot(x, z) < 70 || Math.abs(z - riverZ(x)) < 26 || Math.abs(z + 15) < 18 && Math.abs(x) < 260) continue;
    const y = H(x, z), hgt = 5 + rnd(i + 5) * 7;
    m.compose(v.set(x, y + hgt * 0.35, z), q.identity(), s.set(1, hgt * 0.7, 1)); trunk.setMatrixAt(k, m);
    const r = 2.5 + rnd(i + 7) * 2.5;
    m.compose(v.set(x, y + hgt * 0.75, z), q.identity(), s.set(r, r * 0.85, r)); crown.setMatrixAt(ci++, m);
    m.compose(v.set(x + r * 0.5, y + hgt * 0.6, z + r * 0.3), q.identity(), s.set(r * 0.7, r * 0.6, r * 0.7)); crown.setMatrixAt(ci++, m);
    k++;
  }
  trunk.count = k; crown.count = ci; grp.add(trunk, crown); return grp;
}

// ---------------- cavalo + cavaleiro
const cap = (r: number, l: number, mat: THREE.Material) => new THREE.Mesh(new THREE.CapsuleGeometry(r, l, 6, 12), mat);
export type Rider = {root: THREE.Group; pivot: THREE.Group; body: THREE.Group; legs: {thigh: THREE.Group; knee: THREE.Group; front: boolean; side: number}[];
  neck: THREE.Group; tail: THREE.Group; arm: THREE.Group; cape: THREE.Mesh; capeBase: Float32Array; seed: number};
export function makeRider(seed: number, hero: boolean): Rider {
  const horseM = new THREE.MeshStandardMaterial({color: hero ? 0x3a2416 : [0x2a1a10, 0x3b2414, 0x1a1410][seed % 3], roughness: 0.45});
  const dark = new THREE.MeshStandardMaterial({color: 0x15110c, roughness: 0.7});
  const uni = new THREE.MeshStandardMaterial({color: hero ? 0x1c2b4a : 0x24324d, roughness: 0.6});
  const gold = new THREE.MeshStandardMaterial({color: 0xd8a23a, roughness: 0.3, metalness: 0.9});
  const steel = new THREE.MeshStandardMaterial({color: 0xffffff, roughness: 0.12, metalness: 1});
  const root = new THREE.Group(), pivot = new THREE.Group(), body = new THREE.Group();
  root.add(pivot); pivot.position.set(-0.6, 0, 0); pivot.add(body); body.position.set(0.6, 0, 0);
  const torso = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), horseM); torso.scale.set(1.05, 0.46, 0.38); torso.position.set(0, 1.48, 0); body.add(torso);
  const chest = new THREE.Mesh(new THREE.SphereGeometry(0.42, 16, 12), horseM); chest.scale.set(1, 1.05, 0.9); chest.position.set(0.6, 1.45, 0); body.add(chest);
  const rump = new THREE.Mesh(new THREE.SphereGeometry(0.45, 16, 12), horseM); rump.scale.set(1, 1, 0.92); rump.position.set(-0.62, 1.55, 0); body.add(rump);
  const neck = new THREE.Group(); neck.position.set(0.82, 1.6, 0); neck.rotation.z = -0.8; body.add(neck);
  const nk = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.3, 0.95, 14), horseM); nk.position.set(0, 0.42, 0); neck.add(nk);
  const head = new THREE.Group(); head.position.set(0, 0.86, 0); head.rotation.z = -1.55; neck.add(head);
  const hd = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.09, 0.6, 12), horseM); hd.position.set(0, 0.28, 0); head.add(hd); const muz = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 8), horseM); muz.position.set(0, 0.58, 0); head.add(muz);
  [-0.07, 0.07].forEach((z) => { const e = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.16, 6), horseM); e.position.set(-0.1, 0.0, z); e.rotation.z = 1.2; head.add(e); });
  const mane = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.75, 0.05), dark); mane.position.set(-0.17, 0.4, 0); neck.add(mane);
  const tail = new THREE.Group(); tail.position.set(-1.0, 1.65, 0); tail.rotation.z = 2.5; body.add(tail);
  const tl = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.95, 8), dark); tl.position.set(0, 0.47, 0); tail.add(tl);
  const legs: Rider['legs'] = [];
  [[0.62, true], [-0.6, false]].forEach(([x, front]) => [-0.2, 0.2].forEach((z, si) => {
    const thigh = new THREE.Group(); thigh.position.set(x as number, 1.3, z); body.add(thigh);
    const u = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.14, 0.62, 10), horseM); u.position.set(0, -0.3, 0); thigh.add(u);
    const knee = new THREE.Group(); knee.position.set(0, -0.62, 0); thigh.add(knee);
    const l = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.06, 0.6, 8), horseM); l.position.set(0, -0.3, 0); knee.add(l);
    const hoof = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.1, 8), dark); hoof.position.set(0, -0.62, 0); knee.add(hoof);
    legs.push({thigh, knee, front: front as boolean, side: si});
  }));
  // cavaleiro
  const rider = new THREE.Group(); rider.position.set(0.0, 1.9, 0); body.add(rider);
  const tr = cap(0.2, 0.42, uni); tr.position.set(0, 0.42, 0); rider.add(tr);
  [-0.18, 0.18].forEach((z) => { const th = cap(0.09, 0.38, new THREE.MeshStandardMaterial({color: 0xe8e2d4, roughness: 0.7})); th.rotation.z = Math.PI / 2 - 0.3; th.position.set(0.18, 0.02, z); rider.add(th);
    const bt = cap(0.075, 0.42, dark); bt.position.set(0.36, -0.32, z); bt.rotation.z = 0.15; rider.add(bt); });
  const hd2 = new THREE.Mesh(new THREE.SphereGeometry(0.13, 16, 12), new THREE.MeshStandardMaterial({color: 0xd9b08c, roughness: 0.6})); hd2.position.set(0.02, 0.92, 0); rider.add(hd2);
  const hat = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.12, 24), dark); hat.scale.set(1, 1, 0.42); hat.position.set(0.0, 1.07, 0); hat.rotation.x = Math.PI / 2; hat.rotation.y = 0.0; rider.add(hat);
  const plume = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), new THREE.MeshStandardMaterial({color: 0x1c7a3a})); plume.position.set(0.05, 1.18, 0.05); rider.add(plume);
  [-0.21, 0.21].forEach((z) => { const ep = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 6), gold); ep.scale.set(1, 0.5, 1); ep.position.set(0, 0.68, z); rider.add(ep); });
  const arm = new THREE.Group(); arm.position.set(0.02, 0.66, 0.24); rider.add(arm);
  const ua = cap(0.06, 0.46, uni); ua.position.set(0, -0.28, 0); arm.add(ua);
  const sword = new THREE.Group(); sword.position.set(0, -0.6, 0); arm.add(sword);
  const blade = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.95, 0.012), steel); blade.position.set(0, -0.5, 0); sword.add(blade);
  const guard = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.03, 0.04), gold); sword.add(guard);
  const cg = new THREE.PlaneGeometry(0.55, 0.95, 6, 8); cg.translate(0, -0.47, 0);
  const cape = new THREE.Mesh(cg, new THREE.MeshStandardMaterial({color: hero ? 0x0f5a2a : 0x3a1010, side: THREE.DoubleSide, roughness: 0.8}));
  cape.position.set(-0.17, 0.78, 0); cape.rotation.y = Math.PI / 2; rider.add(cape);
  root.traverse((o) => { if ((o as THREE.Mesh).isMesh) o.castShadow = true; });
  return {root, pivot, body, legs, neck, tail, arm, cape, capeBase: Float32Array.from(cg.attributes.position.array as Float32Array), seed};
}

// pose: gait 0 = parado, 1 = galope; rear 0..1 = empinar; sword 0..1 = erguer espada
export function poseRider(r: Rider, t: number, gait: number, rear: number, sword: number) {
  const ph = t * Math.PI * 2 * 2.1 + r.seed * 1.3;
  r.legs.forEach((L) => {
    const o = (L.front ? 0 : Math.PI * 0.85) + L.side * 0.45;
    let th = gait * 0.62 * Math.sin(ph + o) + (1 - gait) * 0.03 * Math.sin(t * 1.3 + o);
    let kn = -gait * 0.9 * Math.max(0, Math.sin(ph + o + 1.2));
    if (L.front) { th = th * (1 - rear) + rear * (0.9 + 0.3 * Math.sin(t * 9 + L.side * 2)); kn = kn * (1 - rear) + rear * -1.7; }
    else { th = th * (1 - rear) + rear * 0.55; kn = kn * (1 - rear) + rear * -0.25; }
    L.thigh.rotation.z = th; L.knee.rotation.z = L.front ? -Math.abs(kn) : Math.abs(kn);
  });
  r.body.position.y = gait * 0.12 * Math.sin(ph * 2) + (1 - gait) * 0.02 * Math.sin(t * 1.5);
  r.pivot.rotation.z = gait * 0.05 * Math.sin(ph) * (1 - rear) + rear * 0.6;
  r.neck.rotation.z = -0.8 - gait * 0.12 * Math.sin(ph + 0.6) + rear * 0.25;
  r.tail.rotation.z = 2.5 - gait * 0.5 - rear * 0.4 + 0.1 * Math.sin(t * 6 + r.seed);
  r.arm.rotation.z = -0.25 + sword * 3.05 + 0.04 * Math.sin(t * 5);
  r.arm.rotation.x = -sword * 0.25;
  const a = (r.cape.geometry.attributes.position as THREE.BufferAttribute), arr = a.array as Float32Array, b = r.capeBase;
  for (let i = 0; i < arr.length; i += 3) { const v = -b[i + 1]; arr[i + 2] = -(v * v) * (0.4 + gait * 0.9) + 0.06 * Math.sin(v * 8 - t * 10 + b[i] * 4) * v; }
  a.needsUpdate = true; r.cape.geometry.computeVertexNormals();
}

export function buildWorld(scene: THREE.Scene, renderer: THREE.WebGLRenderer, normals: THREE.Texture) {
  const root = new THREE.Group();
  const sky = new Sky(); sky.scale.setScalar(15000);
  const u = sky.material.uniforms; u.turbidity.value = 7; u.rayleigh.value = 2.5; u.mieCoefficient.value = 0.01; u.mieDirectionalG.value = 0.88; u.sunPosition.value.copy(SUN);
  root.add(sky);
  const pm = new THREE.PMREMGenerator(renderer); const sc = new THREE.Scene(); const s2 = new Sky(); s2.scale.setScalar(1000);
  s2.material.uniforms.sunPosition.value.copy(SUN); s2.material.uniforms.turbidity.value = 7; s2.material.uniforms.rayleigh.value = 2.5; sc.add(s2);
  scene.environment = pm.fromScene(sc).texture; scene.environmentIntensity = 0.55;
  const sun = new THREE.DirectionalLight(0xffc890, 3.5); sun.position.copy(SUN).multiplyScalar(300); root.add(sun); root.add(sun.target);
  root.add(new THREE.HemisphereLight(0xa8b8d8, 0x2a2418, 0.9));
  const fill = new THREE.DirectionalLight(0x8090c0, 0.25); fill.position.set(40, 30, 80); root.add(fill);
  scene.fog = new THREE.FogExp2(0xc8926a, 0.0016);
  root.add(terrain(), mountains(), trees());
  const water = new Water(new THREE.PlaneGeometry(3000, 220, 1, 1), {textureWidth: 512, textureHeight: 512, waterNormals: normals,
    sunDirection: SUN.clone(), sunColor: 0xffd0a0, waterColor: 0x1d2f2a, distortionScale: 2.2, fog: true});
  water.rotation.x = -Math.PI / 2; water.position.set(0, -3.2, 110); (water.material as THREE.ShaderMaterial).uniforms.size.value = 3;
  root.add(water);
  const hero = makeRider(0, true); hero.root.position.set(0, H(0, 0) - 0.05, 0); root.add(hero.root);
  const guards: Rider[] = [];
  for (let i = 0; i < 9; i++) { const g = makeRider(i + 1, false); root.add(g.root); guards.push(g); }
  scene.add(root);
  return {water, hero, guards};
}

export type World = ReturnType<typeof buildWorld>;
export function animate(W: World, t: number, rear: number, sword: number, heroGait: number) {
  (W.water.material as THREE.ShaderMaterial).uniforms.time.value = t * 0.6;
  poseRider(W.hero, t, heroGait, rear, sword);
  W.guards.forEach((g, i) => {
    // galopam pela encosta e sobem até o príncipe
    const lane = (i % 3) - 1, row = Math.floor(i / 3);
    const x = -150 + t * 11.5 - row * 7 + (i % 2) * 2, z = -6 + lane * 6;
    const arrive = Math.min(1, Math.max(0, (t - 11.5) / 2.5));
    const fx = x + (Math.max(x, -14 - row * 4) - x) * 0; // mantém trajetória
    const px = Math.min(fx, -9 - row * 4.5), pz = z;
    g.root.position.set(px, H(px, pz) - 0.05, pz);
    const moving = px < -9 - row * 4.5 - 0.01 ? 1 : 0;
    g.root.rotation.y = 0; poseRider(g, t, moving ? 1 : 0.15, 0, arrive * (t > 9.3 ? 1 : 0));
  });
}
