// Mundo 3D: mar, céu físico, caravelas, costa e gaivotas. Tudo procedural (sem modelos de terceiros).
import * as THREE from 'three';
import {Water} from 'three/examples/jsm/objects/Water.js';
import {Sky} from 'three/examples/jsm/objects/Sky.js';

export const SUN = new THREE.Vector3().setFromSphericalCoords(1, THREE.MathUtils.degToRad(90 - 6), THREE.MathUtils.degToRad(195));

function canvasTex(w: number, h: number, draw: (g: CanvasRenderingContext2D) => void) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d')!);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}
const rnd = (s: number) => { const x = Math.sin(s * 127.1) * 43758.5453; return x - Math.floor(x); };

const woodTex = () => canvasTex(512, 512, (g) => {
  g.fillStyle = '#5a3a1e'; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 32; i++) {
    const y = i * 16; g.fillStyle = `hsl(25,${35 + rnd(i) * 15}%,${16 + rnd(i + 9) * 10}%)`; g.fillRect(0, y, 512, 15);
    g.fillStyle = 'rgba(0,0,0,.45)'; g.fillRect(0, y + 15, 512, 1);
    for (let k = 0; k < 40; k++) { g.fillStyle = `rgba(0,0,0,${0.05 + rnd(i * 50 + k) * 0.08})`; g.fillRect(rnd(i * 7 + k) * 512, y + rnd(k + i) * 14, 40 + rnd(k) * 120, 1); }
  }
});
const sailTex = (cross: boolean) => canvasTex(512, 512, (g) => {
  const gr = g.createLinearGradient(0, 0, 0, 512); gr.addColorStop(0, '#efe4c8'); gr.addColorStop(1, '#d8c9a2'); g.fillStyle = gr; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 9; i++) { g.fillStyle = 'rgba(120,95,60,.18)'; g.fillRect(i * 57, 0, 2, 512); }
  for (let k = 0; k < 900; k++) { g.fillStyle = `rgba(110,85,50,${rnd(k) * 0.06})`; g.fillRect(rnd(k + 1) * 512, rnd(k + 2) * 512, 3, 3); }
  if (cross) { // cruz da Ordem de Cristo
    g.fillStyle = '#a8191b'; g.fillRect(206, 90, 100, 330); g.fillRect(96, 200, 320, 100);
    g.fillStyle = '#efe4c8'; g.fillRect(248, 130, 16, 250); g.fillRect(136, 242, 240, 16);
  }
});

// casco por seções (proa fina, popa alta)
function hullGeo(L: number, B: number, D: number) {
  const nu = 40, nv = 16, pos: number[] = [], idx: number[] = [], uv: number[] = [];
  for (let i = 0; i <= nu; i++) {
    const u = i / nu, x = (u - 0.5) * L;
    const w = B * 0.5 * Math.pow(Math.sin(Math.PI * Math.min(1, u * 1.15 + 0.02)), u > 0.6 ? 0.9 : 0.35);
    const d = D * (0.55 + 0.45 * Math.sin(Math.PI * u));
    const top = 0.4 + 2.6 * Math.pow(1 - u, 6) + 1.6 * Math.pow(u, 5);
    for (let j = 0; j <= nv; j++) {
      const v = j / nv, a = -Math.PI / 2 + Math.PI * v;
      const y = -d * Math.pow(Math.cos(a), 0.7) + top * Math.pow(Math.abs(Math.sin(a)), 8);
      pos.push(x, Math.min(y, top), w * Math.sin(a)); uv.push(u * 4, v);
    }
  }
  for (let i = 0; i < nu; i++) for (let j = 0; j < nv; j++) { const a = i * (nv + 1) + j, b = a + nv + 1; idx.push(a, b, a + 1, b, b + 1, a + 1); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals(); return g;
}

export type Ship = {g: THREE.Group; sails: {m: THREE.Mesh; base: Float32Array; w: number; h: number; belly: number}[]; flags: {m: THREE.Mesh; base: Float32Array}[]; ph: number};
export function makeShip(seed: number, wood: THREE.Texture, sailC: THREE.Texture, sailP: THREE.Texture): Ship {
  const g = new THREE.Group();
  const woodM = new THREE.MeshStandardMaterial({map: wood, roughness: 0.75, metalness: 0.0, side: THREE.DoubleSide});
  const darkM = new THREE.MeshStandardMaterial({color: 0x2b1a0c, roughness: 0.8});
  const L = 24, B = 7, D = 3.2;
  const hull = new THREE.Mesh(hullGeo(L, B, D), woodM); hull.castShadow = true; g.add(hull);
  const deck = new THREE.Mesh(new THREE.BoxGeometry(L * 0.86, 0.2, B * 0.82), new THREE.MeshStandardMaterial({color: 0x8a6a44, roughness: 0.9})); deck.position.set(0, 0.35, 0); g.add(deck);
  const castle = new THREE.Mesh(new THREE.BoxGeometry(5, 2.4, B * 0.8), woodM); castle.position.set(-L * 0.38, 1.5, 0); g.add(castle);
  const fore = new THREE.Mesh(new THREE.BoxGeometry(3.5, 1.4, B * 0.6), woodM); fore.position.set(L * 0.36, 1.4, 0); g.add(fore);
  const rail = new THREE.Mesh(new THREE.BoxGeometry(L * 0.8, 0.5, 0.15), darkM); rail.position.set(0, 0.8, B * 0.42); g.add(rail); const r2 = rail.clone(); r2.position.z = -B * 0.42; g.add(r2);
  const bow = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.2, 9, 8), darkM); bow.rotation.z = -1.15; bow.position.set(L * 0.55, 2.4, 0); g.add(bow);
  const sails: Ship['sails'] = [], flags: Ship['flags'] = [];
  const masts: [number, number, number][] = [[3.5, 22, 1], [L * 0.3, 17, 0.75], [-L * 0.3, 14, 0.6]];
  masts.forEach(([x, hgt, k], mi) => {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(0.22 * k + 0.08, 0.35 * k + 0.1, hgt, 10), darkM); m.position.set(x, hgt / 2, 0); m.castShadow = true; g.add(m);
    const yards = mi === 0 ? [[hgt * 0.42, 13, 8.5], [hgt * 0.8, 9, 5]] : [[hgt * 0.5, 10 * k + 2, 7 * k + 1.5]];
    yards.forEach(([y, w, h], yi) => {
      const yard = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, w * 1.08, 6), darkM); yard.rotation.x = Math.PI / 2; yard.position.set(x, y + h / 2, 0); g.add(yard);
      const geo = new THREE.PlaneGeometry(w, h, 14, 12);
      const s = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({map: yi === 0 ? sailC : sailP, roughness: 0.95, side: THREE.DoubleSide, transparent: false}));
      s.rotation.y = Math.PI / 2; s.position.set(x + 0.4, y, 0); s.castShadow = true; g.add(s);
      sails.push({m: s, base: Float32Array.from(geo.attributes.position.array as Float32Array), w, h, belly: 1.4 + h * 0.12});
    });
    const fg = new THREE.PlaneGeometry(3.2, 0.8, 10, 2); fg.translate(1.6, 0, 0);
    const flag = new THREE.Mesh(fg, new THREE.MeshStandardMaterial({color: mi === 0 ? 0xb3201c : 0xefe4c8, side: THREE.DoubleSide, roughness: 0.9}));
    flag.position.set(x, hgt + 0.5, 0); g.add(flag); flags.push({m: flag, base: Float32Array.from(fg.attributes.position.array as Float32Array)});
  });
  // cordas (estais)
  const ropeM = new THREE.LineBasicMaterial({color: 0x1a120a, transparent: true, opacity: 0.8});
  const pts = [[L * 0.55, 5, 0, 3.5, 21, 0], [3.5, 21, 0, -L * 0.3, 13, 0], [3.5, 20, 0, 1, 0.8, B * 0.45], [3.5, 20, 0, 1, 0.8, -B * 0.45], [L * 0.3, 16, 0, L * 0.3 - 2, 0.8, B * 0.45], [L * 0.3, 16, 0, L * 0.3 - 2, 0.8, -B * 0.45]];
  pts.forEach((p) => g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(p[0], p[1], p[2]), new THREE.Vector3(p[3], p[4], p[5])]), ropeM)));
  return {g, sails, flags, ph: seed * 1.7};
}

export function animShip(s: Ship, t: number) {
  const wind = 1 + 0.12 * Math.sin(t * 0.9 + s.ph);
  for (const sl of s.sails) {
    const p = sl.m.geometry.attributes.position as THREE.BufferAttribute, a = p.array as Float32Array, b = sl.base;
    for (let i = 0; i < a.length; i += 3) {
      const u = b[i] / sl.w + 0.5, v = b[i + 1] / sl.h + 0.5;
      const bell = Math.sin(Math.PI * u) * Math.pow(Math.sin(Math.PI * Math.min(1, v * 0.9 + 0.1)), 0.8);
      const ripple = 0.08 * Math.sin(u * 9 + t * 5 + s.ph) * Math.sin(Math.PI * u) * (1 - v);
      a[i + 2] = sl.belly * wind * bell + ripple;
    }
    p.needsUpdate = true; sl.m.geometry.computeVertexNormals();
  }
  for (const f of s.flags) {
    const p = f.m.geometry.attributes.position as THREE.BufferAttribute, a = p.array as Float32Array, b = f.base;
    for (let i = 0; i < a.length; i += 3) { const x = b[i]; a[i + 2] = Math.sin(x * 2.2 - t * 9 + s.ph) * 0.25 * (x / 3.2); }
    p.needsUpdate = true; f.m.geometry.computeVertexNormals();
  }
}

function coast() {
  const g = new THREE.PlaneGeometry(9000, 900, 220, 30); g.rotateX(-Math.PI / 2);
  const p = g.attributes.position as THREE.BufferAttribute, col: number[] = [];
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), z = p.getZ(i), back = (z + 450) / 900; // 0 = beira-mar, 1 = fundo
    const n = Math.sin(x * 0.004) * 0.5 + Math.sin(x * 0.011 + 2) * 0.3 + Math.sin(x * 0.027 + 5) * 0.15 + Math.sin(x * 0.07) * 0.05;
    const hgt = Math.max(0, (1 - back) * 1.2 - 0.05) > 0 ? Math.pow(1 - back, 1.2) * (70 + 60 * n) + 6 * Math.sin(x * 0.3) : 0;
    p.setY(i, Math.max(-2, hgt - (back > 0.93 ? 30 : 0)));
    const sand = back > 0.9 ? 1 : 0; const c = new THREE.Color(sand ? 0xc9b27c : 0x24461f).lerp(new THREE.Color(0x3d6b2c), sand ? 0 : Math.max(0, n) * 0.5);
    col.push(c.r, c.g, c.b);
  }
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.computeVertexNormals();
  const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({vertexColors: true, roughness: 1, flatShading: false}));
  m.position.set(0, 0, -3400); return m;
}

export function buildWorld(scene: THREE.Scene, renderer: THREE.WebGLRenderer, normals: THREE.Texture) {
  const root = new THREE.Group();
  const water = new Water(new THREE.PlaneGeometry(20000, 20000), {
    textureWidth: 512, textureHeight: 512,
    waterNormals: normals,
    sunDirection: SUN.clone(), sunColor: 0xffe2b0, waterColor: 0x062a38, distortionScale: 5.5, fog: true, size: 2.2,
  });
  water.rotation.x = -Math.PI / 2; (water.material as THREE.ShaderMaterial).uniforms.size.value = 2.2; root.add(water);
  const sky = new Sky(); sky.scale.setScalar(15000);
  const u = sky.material.uniforms; u.turbidity.value = 6; u.rayleigh.value = 2.2; u.mieCoefficient.value = 0.008; u.mieDirectionalG.value = 0.86; u.sunPosition.value.copy(SUN);
  root.add(sky);
  // reflexos do céu nos navios
  const pm = new THREE.PMREMGenerator(renderer); const sc = new THREE.Scene(); const sk2 = new Sky(); sk2.scale.setScalar(1000); Object.assign(sk2.material.uniforms, {}); sk2.material.uniforms.sunPosition.value.copy(SUN);
  sk2.material.uniforms.turbidity.value = 6; sk2.material.uniforms.rayleigh.value = 2.2; sc.add(sk2);
  scene.environment = pm.fromScene(sc).texture; scene.environmentIntensity = 0.7;
  const sun = new THREE.DirectionalLight(0xffd2a0, 3.2); sun.position.copy(SUN).multiplyScalar(500); root.add(sun);
  root.add(new THREE.HemisphereLight(0x9fb8d8, 0x1a2a30, 0.6));
  scene.fog = new THREE.FogExp2(0xc99a78, 0.00014);
  root.add(coast());
  const wood = woodTex(), sailC = sailTex(true), sailP = sailTex(false);
  const ships: Ship[] = [];
  const FLEET: [number, number][] = [[0, 0], [-70, 60], [60, 110], [-30, 190], [110, 240], [-120, 300], [30, 380]];
  FLEET.forEach(([x, z], i) => { const s = makeShip(i, wood, sailC, sailP); s.g.userData.base = [x, z]; s.g.rotation.y = Math.PI / 2; root.add(s.g); ships.push(s); });
  const birds: THREE.Line[] = [];
  for (let i = 0; i < 9; i++) {
    const b = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-1, 0, 0), new THREE.Vector3(0, 0, 0), new THREE.Vector3(1, 0, 0)]), new THREE.LineBasicMaterial({color: 0x1a1a1a}));
    b.userData.i = i; root.add(b); birds.push(b);
  }
  scene.add(root);
  return {water, ships, birds, root};
}

export const SPEED = 5; // m/s rumo a -z (oeste)
export function shipPos(s: Ship, t: number) {
  const [x, z] = s.g.userData.base as [number, number];
  return new THREE.Vector3(x, 0, z - SPEED * t);
}
export function placeShips(W: ReturnType<typeof buildWorld>, t: number) {
  for (const s of W.ships) {
    const p = shipPos(s, t);
    s.g.position.set(p.x, 0.25 * Math.sin(t * 1.1 + s.ph) + 1.5, p.z);
    s.g.rotation.set(0.05 * Math.sin(t * 0.9 + s.ph), Math.PI / 2, 0.03 * Math.sin(t * 0.7 + s.ph * 2), 'YXZ');
    animShip(s, t);
  }
  for (const b of W.birds) {
    const i = b.userData.i as number, a = t * 0.35 + i * 0.7;
    b.position.set(Math.sin(a) * 40 + (i - 4) * 12, 28 + i * 2 + Math.sin(t + i) * 2, -SPEED * t + Math.cos(a) * 40 - 20);
    const fl = Math.sin(t * 8 + i) * 0.6;
    const arr = (b.geometry.attributes.position as THREE.BufferAttribute).array as Float32Array;
    arr[1] = fl; arr[7] = fl; (b.geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;
    b.scale.setScalar(1.3); b.lookAt(b.position.x + Math.cos(a), b.position.y, b.position.z - Math.sin(a));
  }
  (W.water.material as THREE.ShaderMaterial).uniforms.time.value = t * 0.9;
}
