// Mundos 3D do filme (three.js): a cervejaria, ruas, praça com a fachada, salas, oficina, cela e paisagens.
// Convenção: coordenadas do filme (x direita, y cima, z para frente) → three (x, y, -z).
import * as THREE from "three";
import { wood, plaster, brick, cobble, wallpaper, soil, facadeT, bannerT, textT, radial, fbm } from "./e3tex";
import type { Spec } from "./places3";
import type { Layer } from "../ww2/engine";
import { layerCanvas } from "../ww2/engine";

const hs = (i: number, s = 0) => { const v = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return v - Math.floor(v); };
const C = (c: string) => new THREE.Color(c);
export const std = (o: THREE.MeshStandardMaterialParameters) => new THREE.MeshStandardMaterial({ roughness: 0.85, metalness: 0, ...o });
export const at = (o: THREE.Object3D, x: number, y: number, z: number) => { o.position.set(x, y, -z); return o; };
const mesh = (g: THREE.BufferGeometry, m: THREE.Material, sh = true) => { const k = new THREE.Mesh(g, m); k.castShadow = sh; k.receiveShadow = true; return k; };
export const boxM = (w: number, h: number, d: number, m: THREE.Material, x: number, y: number, z: number, sh = true) => at(mesh(new THREE.BoxGeometry(w, h, d), m, sh), x, y + h / 2, z);
/** plano vertical voltado para a câmera (normal para -z do filme) */
const planeF = (w: number, h: number, m: THREE.Material, x: number, y: number, z: number) => at(mesh(new THREE.PlaneGeometry(w, h), m, false), x, y + h / 2, z);
const planeX = (len: number, h: number, m: THREE.Material, x: number, y: number, z0: number, z1: number, faceRight: boolean) => { const p = mesh(new THREE.PlaneGeometry(len, h), m, false); p.rotation.y = faceRight ? Math.PI / 2 : -Math.PI / 2; return at(p, x, y + h / 2, (z0 + z1) / 2); };
const floorP = (w: number, d: number, m: THREE.Material, x: number, z: number, y = 0) => { const p = mesh(new THREE.PlaneGeometry(w, d), m, false); p.rotation.x = -Math.PI / 2; return at(p, x, y, z); };
const ceilP = (w: number, d: number, m: THREE.Material, x: number, z: number, y: number) => { const p = mesh(new THREE.PlaneGeometry(w, d), m, false); p.rotation.x = Math.PI / 2; return at(p, x, y, z); };
const glowMat = (col: string, a: number) => new THREE.MeshBasicMaterial({ map: radial("glw" + col, col, "rgba(0,0,0,0)"), transparent: true, opacity: a, blending: THREE.AdditiveBlending, depthWrite: false, fog: false });

/** o que o quadro precisa de um mundo construído */
export type World = { scene: THREE.Scene; sun: THREE.DirectionalLight; hemi: THREE.HemisphereLight; lamps: THREE.PointLight[]; tint: THREE.Color; fog: THREE.Fog;
  interior: boolean; up: (t: number, st: WState) => void; focus: THREE.Vector3; shadowR: number; sky?: THREE.Mesh };
export type WState = { mood: string; hall?: { dark?: number; empty?: boolean; podium?: boolean; tablesMaxZ?: number } };

const SKY_V = `varying vec3 vD; void main(){ vD = normalize(position); vec4 p = modelViewMatrix * vec4(position,1.0); gl_Position = projectionMatrix * p; gl_Position.z = gl_Position.w; }`;
const SKY_F = `uniform vec3 top, hor, gnd, sunDir, sunCol; uniform float disc, stars; varying vec3 vD;
float h(vec3 p){ return fract(sin(dot(p, vec3(12.9898,78.233,45.164))) * 43758.5453); }
void main(){ vec3 d = normalize(vD); float e = d.y; vec3 c = e > 0.0 ? mix(hor, top, smoothstep(0.0, 0.55, e)) : mix(hor, gnd, smoothstep(0.0, 0.08, -e));
  float s = max(dot(d, sunDir), 0.0); c += sunCol * (pow(s, 6.0) * 0.3 + pow(s, 60.0) * 0.5) * disc; c += sunCol * smoothstep(0.9993, 0.99965, s) * 5.0 * disc;
  if (stars > 0.5 && e > 0.02) { vec3 q = floor(d * 420.0); c += vec3(step(0.9968, h(q))) * 0.8 * smoothstep(0.02, 0.3, e); }
  gl_FragColor = vec4(c, 1.0); }`;
const skyDome = (top: string, hor: string, gnd: string, sunDir: THREE.Vector3, sunCol: string, disc: number, stars: boolean) => {
  const m = new THREE.ShaderMaterial({ vertexShader: SKY_V, fragmentShader: SKY_F, side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { top: { value: C(top) }, hor: { value: C(hor) }, gnd: { value: C(gnd) }, sunDir: { value: sunDir }, sunCol: { value: C(sunCol) }, disc: { value: disc }, stars: { value: stars ? 1 : 0 } } });
  const s = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 24), m); s.scale.setScalar(2500); s.renderOrder = -10; s.frustumCulled = false; return s;
};
/** luz por clima (rim/tom do "lite" do plano): elevação/azimute do sol, cores, céu */
export type Light = { el: number; az: number; sun: string; sunI: number; hemiS: string; hemiG: string; hemiI: number; fog: string; fogN: number; fogF: number; top: string; hor: string; disc: number; stars: boolean; tint: string };
export const LIGHTS: Record<string, Light> = {
  day: { el: 50, az: 35, sun: "#fff1dc", sunI: 3.2, hemiS: "#b8d0f0", hemiG: "#7a6a52", hemiI: 1.3, fog: "#b8c8da", fogN: 40, fogF: 700, top: "#2f6cc0", hor: "#c8daea", disc: 1, stars: false, tint: "#ffffff" },
  gold: { el: 10, az: 55, sun: "#ffb066", sunI: 3.4, hemiS: "#a898b8", hemiG: "#6a4a36", hemiI: 1.0, fog: "#d8a07a", fogN: 40, fogF: 600, top: "#4a5a8a", hor: "#ffc27a", disc: 1, stars: false, tint: "#ffe4c8" },
  back: { el: 7, az: 175, sun: "#ffc08a", sunI: 3.0, hemiS: "#8a88b0", hemiG: "#4a3a36", hemiI: 0.9, fog: "#c8907a", fogN: 30, fogF: 500, top: "#3a3e6a", hor: "#f0a878", disc: 1, stars: false, tint: "#e8d8e0" },
  grey: { el: 40, az: 30, sun: "#e8e4dc", sunI: 1.2, hemiS: "#b0b4bc", hemiG: "#5a5650", hemiI: 1.8, fog: "#9a9ca2", fogN: 25, fogF: 400, top: "#5a6270", hor: "#a8aaae", disc: 0, stars: false, tint: "#e8eaee" },
  night: { el: 40, az: -35, sun: "#a0b4e0", sunI: 1.6, hemiS: "#5a6a9a", hemiG: "#1e1e26", hemiI: 1.5, fog: "#141a2a", fogN: 20, fogF: 260, top: "#05070f", hor: "#24304a", disc: 0, stars: true, tint: "#c8d0ea" },
  fire: { el: 22, az: -60, sun: "#ff9a5a", sunI: 1.8, hemiS: "#8a6a70", hemiG: "#4a3020", hemiI: 1.2, fog: "#4a2a22", fogN: 15, fogF: 260, top: "#0e0a10", hor: "#a44a26", disc: 0, stars: false, tint: "#ffc8a8" },
  lamp: { el: 35, az: 60, sun: "#ffd8a0", sunI: 1.5, hemiS: "#8a7a6a", hemiG: "#3a2a20", hemiI: 0.9, fog: "#2a1a12", fogN: 15, fogF: 90, top: "#0a0a14", hor: "#2a2030", disc: 0, stars: false, tint: "#ffe8d0" },
  cold: { el: 35, az: 40, sun: "#dfe8ff", sunI: 1.6, hemiS: "#a8b8d0", hemiG: "#4a4a50", hemiI: 1.2, fog: "#6a7488", fogN: 15, fogF: 200, top: "#4a5a74", hor: "#a8b4c4", disc: 0, stars: false, tint: "#e0e8f4" },
};
export const moodOf = (lite: Record<string, unknown> | undefined): string => {
  const r = (lite?.rim as string) ?? "";
  if (r === "#ffa060" || r === "#ff6a4a") return "fire"; if (r === "#a8c8ff" || r === "#ffe0a8" && (lite?.key as string) === "#7080a8") return "night"; if (r === "#ffcf8a") return "gold";
  if (r === "#ffd8a0" && (lite?.rdy as number) === -1) return "back"; if (r === "#e8eef4") return "grey"; if (r === "#ffc880") return "lamp"; if (r === "#e0f0ff") return "cold"; if (r === "#ffd8a0") return "night"; return "day";
};

const base = (interior: boolean, L: Light): World => {
  const scene = new THREE.Scene(), hemi = new THREE.HemisphereLight(L.hemiS, L.hemiG, L.hemiI), sun = new THREE.DirectionalLight(L.sun, L.sunI);
  sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0005; sun.shadow.normalBias = 0.03; scene.add(hemi, sun, sun.target);
  const fog = new THREE.Fog(L.fog, L.fogN, L.fogF); scene.fog = fog;
  return { scene, sun, hemi, lamps: [], tint: C(L.tint), fog, interior, up: () => {}, focus: new THREE.Vector3(0, 0, -6), shadowR: 18 };
};
export const sunDirOf = (L: Light) => { const el = THREE.MathUtils.degToRad(Math.max(4, L.el)), az = THREE.MathUtils.degToRad(L.az); return new THREE.Vector3(Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el)).normalize(); };
const lampLight = (W: World, x: number, y: number, z: number, col: string, I: number, dist = 14) => { const l = new THREE.PointLight(col, I, dist, 1.8); at(l, x, y, z); W.scene.add(l); W.lamps.push(l); return l; };
/** feixe de luz volumétrico (plano aditivo com gradiente) de uma janela até o chão */
const beam = (W: World, x: number, y: number, z: number, len: number, wid: number, rotZ: number, col: string, a: number, rotY = 0) => {
  const c = document.createElement("canvas"); c.width = 16; c.height = 128; const g = c.getContext("2d")!, gr = g.createLinearGradient(0, 0, 0, 128); gr.addColorStop(0, "rgba(255,255,255,0.9)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, 16, 128);
  const ed = g.createLinearGradient(0, 0, 16, 0); ed.addColorStop(0, "rgba(0,0,0,1)"); ed.addColorStop(0.3, "rgba(0,0,0,0)"); ed.addColorStop(0.7, "rgba(0,0,0,0)"); ed.addColorStop(1, "rgba(0,0,0,1)"); g.globalCompositeOperation = "destination-out"; g.fillStyle = ed; g.fillRect(0, 0, 16, 128);
  const t = new THREE.CanvasTexture(c), m = new THREE.MeshBasicMaterial({ map: t, color: C(col), transparent: true, opacity: a, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false });
  const p = new THREE.Mesh(new THREE.PlaneGeometry(wid, len), m); p.geometry.translate(0, -len / 2, 0); p.rotation.set(0, rotY, rotZ, "YXZ"); at(p, x, y, z); W.scene.add(p); return p;
};

// ---------------- adereços 3D (substituem os sprites chapados) ----------------
const WOOD = () => std({ ...wood("#7a5232", [1, 1], 4, 3), roughness: 0.7 });
export const prop3 = (kind: string, sc = 1): THREE.Object3D | null => {
  const g = new THREE.Group(), wm = WOOD(), dark = std({ color: "#2a2a2c", roughness: 0.5, metalness: 0.6 });
  const B = (w: number, h: number, d: number, m: THREE.Material, x: number, y: number, z: number) => { const k = mesh(new THREE.BoxGeometry(w, h, d), m); k.position.set(x, y + h / 2, z); g.add(k); return k; };
  switch (kind) {
    case "desk": case "deskG": case "deskW": { const top = kind === "deskG" ? std({ color: "#3a5a3a", roughness: 0.9 }) : wm; B(2.8, 0.08, 1.0, top, 0, 0.72, 0); for (const [x, z] of [[-1.3, -0.4], [1.3, -0.4], [-1.3, 0.4], [1.3, 0.4]]) B(0.08, 0.72, 0.08, wm, x, 0, z); B(2.6, 0.5, 0.04, wm, 0, 0.22, 0.42); break; }
    case "bench": B(2.2, 0.06, 0.4, wm, 0, 0.42, 0); for (const x of [-1, 1]) B(0.06, 0.42, 0.36, wm, x, 0, 0); B(2.2, 0.35, 0.05, wm, 0, 0.55, 0.18); break;
    case "chair": case "chair2": B(0.5, 0.05, 0.5, wm, 0, 0.45, 0); for (const [x, z] of [[-0.22, -0.22], [0.22, -0.22], [-0.22, 0.22], [0.22, 0.22]]) B(0.05, 0.45, 0.05, wm, x, 0, z); B(0.5, 0.55, 0.05, wm, 0, 0.5, 0.23); break;
    case "bed": B(2.0, 0.1, 0.9, dark, 0, 0.4, 0); B(1.9, 0.14, 0.85, std({ color: "#c8c2b4" }), 0, 0.5, 0); for (const x of [-0.95, 0.95]) B(0.05, 0.75, 0.9, dark, x, 0, 0); B(0.5, 0.12, 0.4, std({ color: "#ece6da" }), -0.65, 0.64, 0); break;
    case "crate": B(1.0, 0.85, 0.8, WOOD(), 0, 0, 0); break;
    case "radio": { B(0.6, 0.75, 0.35, std({ ...wood("#6a3a20", [1, 1], 3, 9), roughness: 0.4 }), 0, 0, 0); const sp = mesh(new THREE.CircleGeometry(0.18, 24), std({ color: "#c8b48a", roughness: 1 })); sp.position.set(0, 0.48, 0.18); g.add(sp); break; }
    case "lamp": { if (sc > 1) { B(0.12, 3.2, 0.12, dark, 0, 0, 0); B(0.35, 0.5, 0.35, std({ color: "#fff0c0", emissive: C("#ffcf80"), emissiveIntensity: 2 }), 0, 3.2, 0); }
      else { B(0.25, 0.04, 0.25, dark, 0, 0, 0); B(0.03, 0.5, 0.03, dark, 0, 0, 0); const sh = mesh(new THREE.ConeGeometry(0.22, 0.22, 20, 1, true), std({ color: "#3a5a3a", side: THREE.DoubleSide })); sh.position.set(0, 0.55, 0); g.add(sh);
        const b = mesh(new THREE.SphereGeometry(0.05), std({ color: "#fff", emissive: C("#ffd890"), emissiveIntensity: 3 }), false); b.position.set(0, 0.48, 0); g.add(b); } break; }
    case "bars": for (let i = 0; i < 21; i++) { const k = mesh(new THREE.CylinderGeometry(0.035, 0.035, 7, 10), dark); k.position.set(-4.4 + i * 0.44, 3.5, 0); g.add(k); } for (const y of [0.3, 3.4, 6.6]) B(9, 0.12, 0.08, dark, 0, y, 0); break;
    case "barrier": B(0.3, 1.3, 0.3, std({ color: "#e8e2d6" }), -3.8, 0, 0); for (let k = 0; k < 8; k++) B(0.9, 0.16, 0.12, std({ color: k % 2 ? "#e8e2d6" : "#c0302a" }), -3.3 + k * 0.9, 1.0, 0); break;
    case "candle": B(0.07, 0.22, 0.07, std({ color: "#f4ecd8", roughness: 0.6 }), 0, 0, 0); break;
    case "gate": { const st = std({ ...brick("#6a5648", [6, 3], false, 6) }); B(24, 8, 6, st, 0, 0, 0); B(6.4, 6.2, 6.2, std({ color: "#0e0c0a" }), 0, 0, 0); B(26, 0.8, 7, std({ color: "#3a2e28" }), 0, 8, 0); B(5, 5, 5, st, 0, 8.8, 0); B(5.6, 2.2, 5.6, std({ color: "#2a2420" }), 0, 13.8, 0); break; }
    case "tower": { for (const [x, z] of [[-1.6, -1.6], [1.6, -1.6], [-1.6, 1.6], [1.6, 1.6]]) { const k = mesh(new THREE.CylinderGeometry(0.15, 0.2, 8, 8), WOOD()); k.position.set(x, 4, z); g.add(k); } B(4.4, 2.4, 4.4, WOOD(), 0, 8, 0); B(5, 0.5, 5, std({ color: "#2a2420" }), 0, 10.4, 0); break; }
    default: return null;
  }
  g.scale.setScalar(kind === "lamp" ? 1 : sc); return g;
};

// ---------------- a cervejaria ----------------
export const CX = 1.9, CZ = 15.4, PZ = 14.5;
export const buildHall = (p: { dark?: number; ruin?: boolean; banner?: boolean }, L: Light): World => {
  const W = base(true, L), s = W.scene, d = p.dark ?? 0, night = d > 0.5, HH = 7.6, X = 11, Z0 = -14, Z1 = 18;
  W.fog.color = C(night ? "#0c1022" : "#3a2418"); W.fog.near = 12; W.fog.far = night ? 70 : 95;
  const floorM = std({ ...wood("#8a5a34", [10, 14], 6, 2), roughness: 0.55 }), wallM = std({ ...plaster("#d0b088", [6, 2], 3), roughness: 0.95 }), ceilM = std({ ...wood("#6a4428", [6, 10], 5, 5, true), roughness: 0.8 });
  const darkWood = std({ ...wood("#4a2c18", [8, 1], 2, 7), roughness: 0.6 }), pil = std({ ...plaster("#e0c8a0", [1, 3], 8), roughness: 0.9 });
  s.add(floorP(2 * X, Z1 - Z0, floorM, 0, (Z0 + Z1) / 2), ceilP(2 * X, Z1 - Z0, ceilM, 0, (Z0 + Z1) / 2, HH), planeF(2 * X, HH, wallM, 0, 0, Z1));
  s.add(planeX(Z1 - Z0, HH, wallM, -X, 0, Z0, Z1, true), planeX(Z1 - Z0, HH, wallM, X, 0, Z0, Z1, false));
  // rodapé de madeira alto, pilastras, vigas do teto
  s.add(boxM(2 * X, 1.2, 0.08, darkWood, 0, 0, Z1 - 0.05)); for (const x of [-X + 0.05, X - 0.05]) s.add(boxM(0.1, 1.2, Z1 - Z0, darkWood, x, 0, (Z0 + Z1) / 2));
  for (let z = -10; z < Z1; z += 4) for (const x of [-X + 0.25, X - 0.25]) s.add(boxM(0.5, HH, 0.6, pil, x, 0, z));
  for (let z = -12; z < Z1; z += 2.5) s.add(boxM(2 * X, 0.35, 0.3, darkWood, 0, HH - 0.35, z));
  for (let x = -X + 2; x < X; x += 4) s.add(boxM(0.3, 0.3, Z1 - Z0, darkWood, x, HH - 0.3, (Z0 + Z1) / 2));
  // galeria com balaustrada nas laterais e no fundo
  const gy = 3.4, gal = darkWood, bal = std({ color: "#6a4024", roughness: 0.5 });
  for (const sg of [-1, 1]) { const xi = sg * (X - 1.8); s.add(boxM(1.8, 0.3, Z1 - Z0, gal, sg * (X - 0.9), gy - 0.3, (Z0 + Z1) / 2)); s.add(boxM(0.12, 0.1, Z1 - Z0, bal, xi, gy + 0.95, (Z0 + Z1) / 2));
    const n = Math.floor((Z1 - Z0) / 0.35), im = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.035, 0.045, 0.95, 8), bal, n), m4 = new THREE.Matrix4(); for (let i = 0; i < n; i++) { m4.makeTranslation(xi, gy + 0.475, -(Z0 + i * 0.35)); im.setMatrixAt(i, m4); } im.castShadow = true; s.add(im);
    for (let z = -10; z < Z1; z += 4) s.add(boxM(0.35, gy - 0.3, 0.35, pil, xi, 0, z + 2)); }
  s.add(boxM(2 * X, 0.3, 1.6, gal, 0, gy - 0.3, Z1 - 0.8)); s.add(boxM(2 * X, 0.1, 0.12, bal, 0, gy + 0.95, Z1 - 1.6));
  // janelas altas nas laterais (emissivas) e feixes de luz
  const winM = std({ color: night ? "#0c1022" : "#fff2d0", emissive: C(night ? "#3a4c8a" : "#ffe6b0"), emissiveIntensity: night ? 1.3 : 1.6, roughness: 0.2 }), frameM = std({ color: "#3a2416" });
  for (const sg of [-1, 1]) for (let z = -6; z < 17; z += 4) { const x = sg * (X - 0.02); const w = planeX(1.6, 2.6, winM, x, 4.1, z - 0.8, z + 0.8, sg < 0); s.add(w); s.add(boxM(0.06, 2.7, 0.1, frameM, x - sg * 0.02, 4.05, z)); s.add(boxM(0.06, 0.08, 1.7, frameM, x - sg * 0.02, 5.4, z));
    if (!night && sg > 0) beam(W, x - 0.1, 6.6, z, 9, 1.6, -0.75, "#ffe0a8", 0.09, 0); }
  // faixas vermelhas com o emblema abstrato no fundo
  if (p.banner !== false) { const bm = std({ map: bannerT().map, roughness: 1, side: THREE.DoubleSide }); for (const x of [-8, -3.5, 3.5, 8]) { const b = mesh(new THREE.PlaneGeometry(1.7, 3.6, 8, 8), bm, false); const pos = b.geometry.attributes.position; for (let i = 0; i < pos.count; i++) pos.setZ(i, 0.04 * Math.sin(pos.getX(i) * 9)); b.geometry.computeVertexNormals(); s.add(at(b, x, 5.4, Z1 - 0.12)); } }
  // lustres com luz quente
  const brass = std({ color: "#b8902a", metalness: 0.8, roughness: 0.35 }), bulbM = std({ color: "#fff6d8", emissive: C("#ffd890"), emissiveIntensity: night ? 0 : 4 });
  for (const [x, z] of [[-5, 2], [5, 2], [-5, 8], [5, 8], [0, 13]] as number[][]) { const lit = x !== -5 || z !== 8; const ch = new THREE.Group(); const ring = mesh(new THREE.TorusGeometry(0.6, 0.04, 8, 24), brass); ring.rotation.x = Math.PI / 2; ch.add(ring);
    for (let k = 0; k < 6; k++) { const b = mesh(new THREE.SphereGeometry(0.07, 10, 8), bulbM, false); b.position.set(Math.cos(k) * 0.6, 0.08, Math.sin(k) * 0.6); ch.add(b); } const rod = mesh(new THREE.CylinderGeometry(0.015, 0.015, 1.6), brass); rod.position.y = 0.8; ch.add(rod);
    s.add(at(ch, x, HH - 1.7, z)); void lit; if (!night) { const gl = new THREE.Sprite(new THREE.SpriteMaterial({ map: radial("ch", "rgba(255,210,140,1)", "rgba(255,160,80,0)"), blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.55, fog: false })); gl.scale.set(3, 3, 1); s.add(at(gl, x, HH - 1.7, z)); } }
  if (!night) for (const z of [2, 8, 13]) lampLight(W, 0, HH - 1.9, z, "#ffc888", 36, 24);
  // mesas compridas, bancos e canecos
  const cloth = std({ color: "#ece4d0", roughness: 0.95 }), tw = std({ ...wood("#7a4e2c", [6, 1], 3, 11), roughness: 0.55 });
  const glass = std({ color: "#e0a030", roughness: 0.15, metalness: 0, emissive: C("#5a3000"), emissiveIntensity: 0.4, transparent: true, opacity: 0.9 }), foam = std({ color: "#fbf6ea", roughness: 0.9 });
  const tables: THREE.Object3D[] = [], steinsList: THREE.InstancedMesh[] = [];
  [2.2, 4.6, 7.0, 9.4, 11.8].forEach((z, r) => { const grp = new THREE.Group(); const top = mesh(new THREE.BoxGeometry(18, 0.07, 0.95), r % 2 ? tw : cloth); top.position.set(0, 0.76, 0); grp.add(top);
    for (let x = -8.6; x <= 8.6; x += 2.15) for (const dz of [-0.38, 0.38]) { const l = mesh(new THREE.BoxGeometry(0.08, 0.74, 0.08), tw); l.position.set(x, 0.37, dz); grp.add(l); }
    for (const dz of [-0.75, 0.75]) { const b = mesh(new THREE.BoxGeometry(18, 0.06, 0.32), tw); b.position.set(0, 0.45, dz); grp.add(b); }
    const n = 22, im = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.06, 0.055, 0.19, 12), glass, n), fm = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.062, 0.062, 0.03, 12), foam, n), m4 = new THREE.Matrix4();
    for (let i = 0; i < n; i++) { const x = -8.5 + hs(i, r + 3) * 17, dz = (hs(i, r + 7) - 0.5) * 0.6; m4.makeTranslation(x, 0.89, dz); im.setMatrixAt(i, m4); m4.makeTranslation(x, 0.995, dz); fm.setMatrixAt(i, m4); }
    im.castShadow = true; grp.add(im, fm); steinsList.push(im, fm); at(grp, 0, 0, z); s.add(grp); tables.push(grp); });
  // púlpito, microfones e as colunas (a da bomba em CX, CZ)
  const pod = new THREE.Group(); { const pw = std({ ...wood("#5a3420", [2, 1], 3, 13), roughness: 0.5 }); const b1 = mesh(new THREE.BoxGeometry(1.5, 1.3, 0.75), pw); b1.position.y = 0.65; pod.add(b1);
    const fr = mesh(new THREE.PlaneGeometry(1.1, 0.75), std({ map: bannerT().map, roughness: 1 }), false); fr.position.set(0, 0.68, 0.38); pod.add(fr); const tp = mesh(new THREE.BoxGeometry(1.7, 0.08, 0.85), pw); tp.position.y = 1.32; pod.add(tp);
    for (const x of [-0.35, 0.35]) { const st = mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.5), dark()), hd = mesh(new THREE.BoxGeometry(0.1, 0.16, 0.06), std({ color: "#c8c8cc", metalness: 0.8, roughness: 0.3 })); st.position.set(x, 1.6, 0.25); hd.position.set(x, 1.9, 0.25); pod.add(st, hd); } }
  s.add(at(pod, 0, 0, PZ));
  const col = (x: number, z: number, h = HH) => { const g = new THREE.Group(); const c = mesh(new THREE.BoxGeometry(1.5, h, 1.0), pil); c.position.y = h / 2; g.add(c); const p = mesh(new THREE.BoxGeometry(1.56, 2.2, 1.06), darkWood); p.position.y = 1.1 + 0.3; g.add(p);
    const cap = mesh(new THREE.BoxGeometry(1.9, 0.5, 1.3), pil); cap.position.y = h - 0.25; if (h > 5) g.add(cap); const bs = mesh(new THREE.BoxGeometry(1.8, 0.3, 1.2), pil); bs.position.y = 0.15; g.add(bs); return at(g, x, 0, z); };
  const mainCol = col(CX, CZ); s.add(mainCol, col(-CX - 4.5, CZ + 0.2), col(CX + 5.5, CZ + 0.2));
  if (p.ruin) { mainCol.visible = false; s.add(col(CX, CZ, 2.4)); const rub = std({ color: "#9a8a72", roughness: 1 }), im = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(0.3, 0), rub, 180), m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
    for (let i = 0; i < 180; i++) { const r = Math.sqrt(hs(i, 3)) * 7, a = hs(i, 4) * 6.28, sc = 0.3 + hs(i, 5) * 1.4; e.set(hs(i, 6) * 3, hs(i, 7) * 3, 0); q.setFromEuler(e); m4.compose(new THREE.Vector3(CX + Math.cos(a) * r, 0.1 * sc, -(CZ - 2 + Math.sin(a) * r * 0.7)), q, new THREE.Vector3(sc, sc * 0.6, sc)); im.setMatrixAt(i, m4); }
    im.castShadow = true; im.receiveShadow = true; s.add(im);
    for (let i = 0; i < 9; i++) { const bm = mesh(new THREE.BoxGeometry(5, 0.35, 0.3), darkWood); bm.rotation.set(hs(i, 8) * 0.6, hs(i, 9) * 2, 0.4 + hs(i, 2) * 0.6); s.add(at(bm, CX - 6 + hs(i, 1) * 12, 0.8 + hs(i, 3) * 1.5, CZ - 2 - hs(i, 4) * 8)); }
    lampLight(W, CX - 1, 0.8, CZ - 1.5, "#ff8a3a", 40, 14); lampLight(W, CX + 3, 0.6, CZ - 2.5, "#ff7a2a", 25, 10); W.fog.color = C("#4a3a30"); W.fog.near = 2; W.fog.far = 40; }
  W.sun.color = C(night ? "#a8b8e8" : "#ffe0b0"); W.sun.intensity = night ? 1.6 : 1.6; W.hemi.color = C(night ? "#8090c0" : "#8a7058"); W.hemi.groundColor = C(night ? "#0a0808" : "#3a2414"); W.hemi.intensity = night ? 1.5 : 0.9;
  W.tint = C(night ? "#b0b8d4" : p.ruin ? "#e8c8b0" : "#fff0dc");
  if (night) { lampLight(W, CX - 0.6, 0.6, CZ - 1.2, "#ffd8a0", 14, 9); for (let z = -6; z < 17; z += 4) beam(W, X - 0.1, 6.6, z, 9, 1.6, -0.75, "#8aa0e0", 0.06, 0); } W.focus.set(0, 0, -8); W.shadowR = 16;
  const sd = new THREE.Vector3(1.2, 1.4, 0.35).normalize(); W.up = (t, st) => { W.sun.position.copy(W.focus).addScaledVector(sd, 40); W.sun.target.position.copy(W.focus);
    const h = st.hall ?? {}; tables.forEach((tb, i) => { tb.visible = h.tablesMaxZ === undefined || [2.2, 4.6, 7.0, 9.4, 11.8][i] <= h.tablesMaxZ; }); steinsList.forEach((m) => (m.visible = !h.empty)); pod.visible = h.podium !== false;
    W.lamps.forEach((l, i) => { if (!p.ruin) l.intensity = (night ? 14 : 36) * (0.97 + 0.03 * Math.sin(t * 6 + i)); else l.intensity = (i ? 25 : 40) * (0.8 + 0.2 * Math.sin(t * 13 + i * 2) * Math.sin(t * 7)); }); };
  return W;
};
const dark = () => std({ color: "#1e1e20", metalness: 0.6, roughness: 0.45 });

// ---------------- rua ----------------
export const buildStreet = (p: { night?: boolean; dusk?: boolean; sepia?: boolean; banner?: boolean; seed?: number; pal: string[]; len?: number; plaza?: boolean }, L: Light): World => {
  const W = base(false, L), s = W.scene, Wd = 7, len = p.len ?? 140, seed = p.seed ?? 3;
  const sky = skyDome(L.top, L.hor, "#2a2622", sunDirOf(L), L.sun, L.disc, L.stars); s.add(sky); W.sky = sky;
  const road = std({ ...cobble(p.night ? "#4a4a50" : p.sepia ? "#8a7a60" : "#8a8680", [14, 140]), roughness: 0.75 }); s.add(floorP(2 * Wd, 180, road, 0, 60));
  const walk = std({ ...brick(p.sepia ? "#a8966e" : "#a8a29a", [6, 60], true, 21), roughness: 0.9 });
  for (const sg of [-1, 1]) { s.add(boxM(2.4, 0.16, 180, walk, sg * (Wd + 1.2), 0, 60)); s.add(boxM(0.18, 0.18, 180, std({ color: "#8a8680" }), sg * Wd, 0, 60)); }
  for (const x of [-0.75, 0.75]) s.add(boxM(0.08, 0.02, 180, std({ color: "#a8a8b0", metalness: 0.9, roughness: 0.3 }), x, 0, 60));
  // prédios dos dois lados
  const roofM = std({ color: p.night ? "#2a2028" : "#6a3a2c", roughness: 0.8 });
  for (const sg of [-1, 1]) { let z = -20 + hs(sg, seed) * 4, i = 0; while (z < len) { const lz = 7 + hs(i, seed + sg) * 8, h = 10 + hs(i + 9, seed + sg) * 8, col = p.pal[Math.floor(hs(i * 3, seed + sg * 2) * p.pal.length)], fl = Math.round(h / 3.3);
      const ft = facadeT(col, fl, Math.max(2, Math.round(lz / 2.4)), p.night ? 0.55 : 0, seed * 31 + i * 7 + sg), side = std({ map: ft.map, normalMap: ft.normalMap, roughness: 0.85, emissive: C(p.night ? "#ffcf78" : "#000000"), emissiveMap: p.night ? ft.map : null, emissiveIntensity: p.night ? 0.35 : 0 });
      const plain = std({ ...plaster(col, [2, 2], i), roughness: 0.9 }), x = sg * (Wd + 2.4 + 4);
      const mats = sg < 0 ? [side, plain, roofM, plain, plain, plain] : [plain, side, roofM, plain, plain, plain];
      const b = mesh(new THREE.BoxGeometry(8, h, lz), mats); at(b, x, h / 2, z + lz / 2); s.add(b);
      const cor = boxM(8.6, 0.45, lz, std({ color: col, roughness: 0.8 }), x - sg * 0.1, h, z + lz / 2); s.add(cor);
      const rf = mesh(new THREE.CylinderGeometry(0.01, 4.6, 3, 4, 1), roofM); rf.rotation.y = Math.PI / 4; rf.scale.set(1, 1, lz / 8); at(rf, x, h + 1.9, z + lz / 2); s.add(rf);
      if (p.banner && i % 2 === 0) { const bm = std({ map: bannerT().map, roughness: 1, side: THREE.DoubleSide }); const bb = mesh(new THREE.PlaneGeometry(1.6, 5), bm, false); bb.rotation.y = sg < 0 ? Math.PI / 2 : -Math.PI / 2; s.add(at(bb, sg * (Wd + 2.3), h - 3.6, z + 3)); }
      z += lz; i++; } }
  // postes
  const postM = dark(), lantM = std({ color: "#fff0c0", emissive: C(p.night ? "#ffcf80" : "#000000"), emissiveIntensity: p.night ? 3 : 0 });
  for (let z = 4; z < 80; z += 9) for (const sg of [-1, 1]) { const g = new THREE.Group(); const pl = mesh(new THREE.CylinderGeometry(0.06, 0.09, 4.2, 8), postM); pl.position.y = 2.1; g.add(pl); const lt = mesh(new THREE.BoxGeometry(0.3, 0.45, 0.3), lantM); lt.position.y = 4.35; g.add(lt); s.add(at(g, sg * (Wd + 0.6), 0.15, z));
    if (p.night && z < 40) lampLight(W, sg * (Wd + 0.3), 4.1, z, "#ffc070", 30, 16); }
  W.tint = C(p.night ? "#e8ecf8" : L.tint); W.focus.set(0, 0, -8); W.shadowR = 22; const sd = sunDirOf(L);
  W.up = (t) => { W.sun.position.copy(W.focus).addScaledVector(sd, 80); W.sun.target.position.copy(W.focus); sky.position.set(0, 0, 0); };
  return W;
};
/** a praça diante da cervejaria: rua curta e a fachada com o letreiro, porta iluminada */
export const buildPlaza = (night: boolean, L: Light): World => {
  const W = buildStreet({ night, pal: night ? ["#3a3640", "#34303a"] : ["#c8b49a", "#b8a48a"], seed: 12, len: 13 }, L), s = W.scene;
  const fc = night ? "#6a5e58" : "#c8b49a", fac = std({ ...plaster(fc, [6, 3], 31), roughness: 0.9 });
  s.add(boxM(32, 11, 4, fac, 0, 0, 16)); s.add(boxM(33, 0.6, 4.6, std({ color: night ? "#2a2224" : "#7a3e30" }), 0, 11, 16));
  const winM = std({ color: night ? "#ffcf7a" : "#4a5a6a", emissive: C(night ? "#ffb860" : "#000000"), emissiveIntensity: night ? 1.4 : 0, roughness: 0.2 });
  for (let i = 0; i < 9; i++) for (const y of [5.6, 8.2]) { if (night && hs(i * 3 + y) < 0.35) continue; s.add(planeF(1.2, 1.7, winM, -13 + i * 3.25, y, 13.97)); s.add(boxM(1.5, 0.12, 0.25, fac, -13 + i * 3.25, y - 0.12, 13.9)); }
  const door = std({ color: night ? "#ffd890" : "#3a2a1e", emissive: C(night ? "#ffc070" : "#000000"), emissiveIntensity: night ? 1.6 : 0 }); s.add(planeF(5.2, 4.2, door, 0, 0, 13.97));
  const sign = std({ map: textT("BÜRGERBRÄUKELLER", 2048, 140, "#1e1612", night ? "#ffe2a0" : "#e8d8b0"), emissive: C(night ? "#ffffff" : "#000000"), emissiveMap: textT("BÜRGERBRÄUKELLER", 2048, 140, "#000000", "#ffd890"), emissiveIntensity: night ? 1.4 : 0 });
  s.add(planeF(20, 1.35, sign, 0, 3.4, 13.95)); if (night) { lampLight(W, 0, 2.2, 12.5, "#ffc070", 40, 14); }
  return W;
};

// ---------------- salas ----------------
export type RoomP = { kind: "home" | "office" | "inter" | "shop" | "cell" | "stage"; wall?: string; dark?: number; win?: boolean; map?: boolean; frames?: number; tile?: boolean; night?: boolean; sky?: string };
export const buildRoom = (p: RoomP, L: Light): World => {
  const W = base(true, L), s = W.scene, k = p.kind;
  const dims = k === "shop" ? { w: 6.4, h: 3.2, back: 6 } : k === "cell" ? { w: 4.2, h: 3.4, back: 3.6 } : k === "stage" ? { w: 14, h: 6, back: 6 } : { w: 6.6, h: 3.1, back: 4.5 };
  const X = dims.w / 2, H = dims.h, Z1 = dims.back, Z0 = -10, wc = p.wall ?? "#8a7a64", dk = 1 - (p.dark ?? 0) * 0.6;
  const wallM = k === "shop" ? std({ ...wood(p.night ? "#5a3e28" : "#9a7450", [6, 1], 14, 31, true), roughness: 0.8 }) : k === "cell" ? std({ ...brick("#7a746a", [4, 2], true, 41), roughness: 0.95 })
    : k === "inter" || (p.dark ?? 0) > 0.3 ? std({ ...plaster(wc, [3, 1.5], 44), roughness: 0.95 }) : k === "stage" ? std({ ...plaster(wc, [4, 2], 47) }) : std({ ...wallpaper(wc, [5, 2], 45), roughness: 0.9 });
  const floorM = k === "cell" ? std({ ...brick("#6a665e", [4, 6], true, 42), roughness: 0.95 }) : p.tile ? std({ ...brick("#9a948a", [8, 10], true, 43), roughness: 0.5 }) : std({ ...wood("#7a5634", [5, 7], 7, 46), roughness: 0.6 });
  const ceilM = std({ ...plaster(k === "cell" ? "#5a5650" : "#d8d0c0", [3, 3], 48) });
  s.add(floorP(2 * X, Z1 - Z0, floorM, 0, (Z0 + Z1) / 2), ceilP(2 * X, Z1 - Z0, ceilM, 0, (Z0 + Z1) / 2, H), planeF(2 * X, H, wallM, 0, 0, Z1), planeX(Z1 - Z0, H, wallM, -X, 0, Z0, Z1, true), planeX(Z1 - Z0, H, wallM, X, 0, Z0, Z1, false));
  const trim = std({ ...wood("#4a2e1c", [4, 1], 2, 49), roughness: 0.6 });
  if (k === "home" || k === "office") { s.add(boxM(2 * X, 0.9, 0.05, trim, 0, 0, Z1 - 0.03)); for (const x of [-X + 0.03, X - 0.03]) s.add(boxM(0.05, 0.9, Z1 - Z0, trim, x, 0, (Z0 + Z1) / 2)); s.add(boxM(2 * X, 0.06, 0.08, trim, 0, 0.9, Z1 - 0.05)); }
  if (k === "shop") { for (let z = -6; z < Z1; z += 1.6) s.add(boxM(2 * X, 0.2, 0.2, trim, 0, H - 0.2, z)); s.add(boxM(3.2, 0.06, 0.3, trim, -1.6, 1.9, Z1 - 0.2));
    for (let i = 0; i < 7; i++) s.add(boxM(0.04, 0.6, 0.04, i % 2 ? trim : dark(), -2.9 + i * 0.45, 2.1, Z1 - 0.1)); for (let i = 0; i < 4; i++) { const pl = boxM(0.3, 2.6 + hs(i) * 0.4, 0.05, std({ ...wood("#c8a070", [1, 1], 1, 50 + i) }), 1.2 + i * 0.38, 0, Z1 - 0.3); pl.rotation.z = 0.08; s.add(pl); } }
  // janela (parede esquerda; oficina: direita) com feixe de luz
  const winSide = k === "shop" ? 1 : -1, wy0 = k === "cell" ? 2.4 : 1.0, wy1 = k === "cell" ? 3.0 : 2.5, wz = k === "cell" ? 1.8 : 1.8, wl = k === "cell" ? 0.8 : 1.3;
  if (p.win !== false && (p.win || k === "shop" || k === "cell")) { const night = !!p.night, glass = std({ color: night ? "#101830" : p.sky ?? "#e8f0f8", emissive: C(night ? "#18203a" : p.sky ?? "#f4f0e0"), emissiveIntensity: night ? 0.5 : 1.8 });
    const x = winSide * (X - 0.02); s.add(planeX(wl, wy1 - wy0, glass, x, wy0, wz - wl / 2, wz + wl / 2, winSide < 0)); s.add(boxM(0.08, 0.06, wl + 0.1, trim, x, (wy0 + wy1) / 2, wz)); s.add(boxM(0.08, wy1 - wy0, 0.06, trim, x, wy0, wz));
    if (k === "cell") for (let i = 0; i < 4; i++) s.add(boxM(0.04, wy1 - wy0, 0.04, dark(), x - winSide * 0.05, wy0, wz - wl / 2 + 0.15 + i * 0.17));
    if (!night) { beam(W, x - winSide * 0.05, wy1, wz, 4.5, wl, winSide * 0.95, p.sky ?? "#ffe8c0", k === "cell" ? 0.16 : 0.12, 0); const sp = new THREE.Mesh(new THREE.PlaneGeometry(1.6, wl * 1.2), new THREE.MeshBasicMaterial({ map: radial("spot", "rgba(255,240,210,0.7)", "rgba(255,240,210,0)"), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.6 }));
      sp.rotation.x = -Math.PI / 2; at(sp, x - winSide * (wy1 * 0.9), 0.01, wz); s.add(sp); } }
  // decoração da parede do fundo
  if (p.map) { s.add(planeF(2.8, 1.5, std({ color: "#d8cca0", roughness: 1 }), 0, 1.3, Z1 - 0.02)); s.add(planeF(1.6, 0.9, std({ color: "#b8a878" }), -0.2, 1.55, Z1 - 0.03)); }
  for (let i = 0; i < (p.frames ?? 0); i++) { const x = -2.0 + i * 2.0; s.add(boxM(0.8, 1.0, 0.05, std({ color: "#b8902a", metalness: 0.7, roughness: 0.4 }), x, 1.5, Z1 - 0.04)); s.add(planeF(0.62, 0.8, std({ color: ["#5a6a5a", "#6a5a4a", "#4a5a6a"][i % 3] }), x, 1.6, Z1 - 0.08)); }
  if (k === "home" || k === "office") { const door = std({ ...wood("#5a3a22", [1, 1], 3, 51) }); s.add(planeX(1.0, 2.2, door, X - 0.03, 0, 0.6, 1.6, false)); }
  // lâmpada pendurada
  const bulbY = H - 0.6, bulb = mesh(new THREE.SphereGeometry(0.06, 12, 10), std({ color: "#fff", emissive: C("#ffe0a0"), emissiveIntensity: 5 }), false); s.add(at(bulb, 0, bulbY, 2.0));
  const shade = mesh(new THREE.ConeGeometry(0.3, 0.2, 24, 1, true), std({ color: k === "inter" ? "#2a2a2a" : "#e8dcc0", side: THREE.DoubleSide, emissive: C("#3a2a10"), emissiveIntensity: 0.2 })); s.add(at(shade, 0, bulbY + 0.08, 2.0));
  s.add(at(mesh(new THREE.CylinderGeometry(0.008, 0.008, H - bulbY), dark()), 0, (H + bulbY) / 2, 2.0));
  const lamp = lampLight(W, 0, bulbY - 0.1, 2.0, k === "cell" ? "#c8d4f0" : "#ffd8a0", k === "inter" ? 14 : k === "cell" ? 3 : 8, 10);
  W.fog.color = C("#0e0a0a"); W.fog.near = 8; W.fog.far = 40;
  W.sun.color = C(k === "cell" ? "#c8d8f0" : "#ffe8c8"); W.sun.intensity = (p.night || k === "inter" ? 0.2 : k === "cell" ? 1.2 : 1.6) * dk; W.hemi.color = C(k === "cell" ? "#6a7488" : "#8a7a68"); W.hemi.groundColor = C("#2a2018"); W.hemi.intensity = (k === "inter" ? 0.25 : 0.7) * dk;
  W.tint = C(k === "cell" ? "#c8d0e0" : k === "inter" ? "#e8d8c0" : "#ffece0"); W.focus.set(0, 0, -2); W.shadowR = 8;
  const sd = new THREE.Vector3(-winSide * 1.1, 1.0, -0.25).normalize();
  W.up = (t) => { W.sun.position.copy(W.focus).addScaledVector(sd, 20); W.sun.target.position.copy(W.focus); if (k === "inter") lamp.position.x = 0.4 * Math.sin(t * 2.2); };
  void lamp; return W;
};

// ---------------- paisagens (a partir das camadas com spec) ----------------
const treeGeo = (() => { const m = new Map<string, { trunk: THREE.BufferGeometry; crown: THREE.BufferGeometry }>(); return (kind: string) => {
  if (m.has(kind)) return m.get(kind)!; const trunk = new THREE.CylinderGeometry(0.04, 0.07, 1, 6); trunk.translate(0, 0.5, 0); let crown: THREE.BufferGeometry;
  if (kind === "pine") { crown = new THREE.ConeGeometry(0.32, 0.85, 8); crown.translate(0, 0.62, 0); }
  else if (kind === "poplar") { crown = new THREE.SphereGeometry(0.16, 10, 8); crown.scale(1, 2.6, 1); crown.translate(0, 0.62, 0); }
  else if (kind === "dead") { crown = new THREE.ConeGeometry(0.01, 0.01, 3); }
  else { crown = new THREE.IcosahedronGeometry(0.33, 1); const pos = crown.attributes.position; for (let i = 0; i < pos.count; i++) { const k = 1 + 0.18 * (hs(i, 3) - 0.5); pos.setXYZ(i, pos.getX(i) * k, pos.getY(i) * k * 0.85, pos.getZ(i) * k); } crown.computeVertexNormals(); crown.translate(0, 0.72, 0); }
  const v = { trunk, crown }; m.set(kind, v); return v; }; })();
export const buildOutdoor = (sky: [string, string] | undefined, ground: { near: string; far: string; kind?: string; zFar?: number }, layers: Layer[], L: Light): World => {
  const W = base(false, L), s = W.scene, sd = sunDirOf(L);
  const top = sky?.[0] ?? L.top, hor = sky?.[1] ?? L.hor; const dome = skyDome(top, hor, ground.far, sd, L.sun, L.disc, L.stars); s.add(dome); W.sky = dome;
  W.fog.color = C(hor); W.fog.near = 30; W.fog.far = Math.max(250, (ground.zFar ?? 400) * 1.2);
  const gk = ground.kind ?? "grass", gkind = gk === "cobble" || gk === "stone" ? "stone" : gk === "wood" ? "mud" : gk === "none" ? "mud" : gk;
  const gm = std({ ...soil(gkind, ground.near, [60, 60]), roughness: 0.95 }); const gp = mesh(new THREE.PlaneGeometry(800, 800, 1, 1), gm, false); gp.rotation.x = -Math.PI / 2; s.add(at(gp, 0, 0, 380));
  for (const Ly of layers as (Layer & { spec?: Spec })[]) {
    const sp = Ly.spec, z = Ly.z;
    if (!sp) { // camada pintada sem spec: plano vertical texturizado no lugar dela
      const cv = layerCanvas(Ly), tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace; const m = new THREE.MeshStandardMaterial({ map: tx, transparent: true, alphaTest: 0.05, roughness: 0.95, side: THREE.DoubleSide });
      const pl = mesh(new THREE.PlaneGeometry(Ly.x1 - Ly.x0, Ly.y1 - Ly.y0), m, true); pl.castShadow = false; s.add(at(pl, (Ly.x0 + Ly.x1) / 2, Ly.y0 + (Ly.y1 - Ly.y0) / 2 - (Ly.y0 + (Ly.y1 - Ly.y0) / 2) + (Ly.y0 + Ly.y1) / 2, z)); pl.position.y = (Ly.y0 + Ly.y1) / 2; continue; }
    if (sp.t === "mtn" || sp.t === "hill") { const wid = z * ((sp.wid as number) ?? 2.4) * 1.1, h = (sp.h as number) * (sp.t === "mtn" ? 1.15 : 1.0), nx = 160, geo = new THREE.PlaneGeometry(wid * 2, h * 1.6, nx, 12), pos = geo.attributes.position, sd2 = sp.seed as number;
      const cols: number[] = [], c0 = C(sp.col as string), cs = C("#f2f4f8");
      for (let i = 0; i < pos.count; i++) { const x = pos.getX(i), yy = pos.getY(i) / (h * 1.6) + 0.5, ridge = (sp.t === "mtn" ? 0.55 + 0.45 * Math.abs(fbm(x / (h * 1.1), 0, sd2, 5) * 2 - 1) : 0.5 + 0.5 * fbm(x / (h * 3), 0, sd2, 3)) * h, y = yy * ridge, dz = (1 - yy) * h * 0.9;
        pos.setXYZ(i, x, y, dz + fbm(x / 9, yy * 3, sd2 + 3, 2) * h * 0.15); const sn = sp.t === "mtn" && sp.snow && y > ridge * 0.72 && y > h * 0.45; const c = sn ? cs : c0.clone().multiplyScalar(0.78 + 0.3 * yy + 0.12 * fbm(x / 5, yy * 4, sd2 + 7, 2)); cols.push(c.r, c.g, c.b); }
      geo.setAttribute("color", new THREE.Float32BufferAttribute(cols, 3)); geo.computeVertexNormals(); const m = mesh(geo, std({ vertexColors: true, roughness: 1, flatShading: sp.t === "mtn" }), false); m.receiveShadow = false; s.add(at(m, 0, 0, z)); continue; }
    if (sp.t === "forest") { const o = (sp.o ?? {}) as { h?: number; wid?: number; snow?: boolean; y?: number }, X = (o.wid ?? 1.5) * z + 8, Hh = o.h ?? 12, n = Math.min(400, (sp.n as number) * 3), kind = sp.kind as string, g = treeGeo(kind === "birch" || kind === "cherry" || kind === "palm" ? "oak" : kind);
      const tm = std({ color: kind === "birch" ? "#e8e4dc" : "#4a3426", roughness: 1 }), cm = std({ color: kind === "cherry" ? "#f0b8c8" : (sp.col as string) === "#000" ? "#2a2420" : (sp.col as string), roughness: 0.95 });
      const it = new THREE.InstancedMesh(g.trunk, tm, n), ic = new THREE.InstancedMesh(g.crown, cm, n), m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), cc = new THREE.Color();
      for (let i = 0; i < n; i++) { const x = -X + hs(i, sp.seed as number) * 2 * X, zz = z + (hs(i, (sp.seed as number) + 1) - 0.3) * z * 0.25, hh = Hh * (0.6 + hs(i, 5) * 0.6); q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), hs(i, 6) * 6);
        m4.compose(new THREE.Vector3(x, (o.y ?? 0), -zz), q, new THREE.Vector3(hh * (kind === "dead" ? 0.6 : 1), hh, hh * (kind === "dead" ? 0.6 : 1))); it.setMatrixAt(i, m4); ic.setMatrixAt(i, m4); ic.setColorAt(i, cc.copy(cm.color).multiplyScalar(0.75 + 0.5 * hs(i, 8))); }
      it.castShadow = ic.castShadow = z < 80; it.receiveShadow = ic.receiveShadow = true; s.add(it, ic); continue; }
    if (sp.t === "clouds") { const n = Math.min(26, sp.n as number), wid = z * ((sp.wid as number) ?? 2.4), cols = sp.cols as [string, string]; for (let i = 0; i < n; i++) { const tx = cloudTex(i % 4), m = new THREE.SpriteMaterial({ map: tx, color: C(cols[0]).lerp(C(cols[1]), 0.35), transparent: true, opacity: 0.9, depthWrite: false, fog: false });
      const sp2 = new THREE.Sprite(m), sc = 30 + hs(i, 3) * 60; sp2.scale.set(sc * 2, sc, 1); s.add(at(sp2, -wid + hs(i, sp.seed as number) * 2 * wid, (sp.y0 as number) + hs(i, 4) * ((sp.y1 as number) - (sp.y0 as number)), z)); } continue; }
    if (sp.t === "city" || sp.t === "skyline") { const o = (sp.o ?? {}) as { pal?: string[]; hgt?: [number, number]; ruin?: boolean; lit?: number; seed?: number; x0?: number; x1?: number }, pal = o.pal ?? [sp.col as string], ruin = !!o.ruin || sp.kind === "stalingrad" || sp.kind === "hiroshima";
      const X0 = o.x0 ?? -z * 1.4 - 10, X1 = o.x1 ?? z * 1.4 + 10, [h0, h1] = o.hgt ?? (sp.t === "skyline" ? [8, 30] : [10, 16]), sd2 = (o.seed ?? (sp.seed as number) ?? 3) as number, lit = o.lit ?? ((sp.lit as string) ? 0.4 : 0);
      for (let x = X0, i = 0; x < X1; i++) { const w = 6 + hs(i, sd2) * 9, h = h0 + hs(i + 3, sd2) * (h1 - h0), col = pal[i % pal.length], ft = facadeT(col, Math.max(2, Math.round(h / 3.3)), Math.max(2, Math.round(w / 2.6)), lit, sd2 * 13 + i, ruin);
        const fm = std({ map: ft.map, normalMap: ft.normalMap, roughness: 0.9, emissive: C(lit > 0 ? "#ffcf78" : "#000000"), emissiveMap: lit > 0 ? ft.map : null, emissiveIntensity: lit > 0 ? 0.3 : 0 }), pm = std({ color: col, roughness: 0.9 });
        const b = mesh(new THREE.BoxGeometry(w - 0.3, h, 8), [pm, pm, std({ color: ruin ? "#2a2420" : "#5a3a2e" }), pm, fm, pm], z < 90); at(b, x + w / 2, h / 2, z + 4); s.add(b);
        if (ruin) for (let k = 0; k < 4; k++) { const r2 = boxM(1 + hs(i * 4 + k, 2) * 2, 1 + hs(i + k, 3) * 4, 1.5, pm, x + hs(k + i, 4) * w, h - 0.5, z + 1 + k); r2.rotation.z = hs(i, k) - 0.5; s.add(r2); }
        x += w; } continue; }
    if (sp.t === "wall") { const o = (sp.o ?? {}) as { h?: number; wid?: number; win?: number; winCol?: string; brick?: boolean }, Wd = o.wid ?? 14, Hh = o.h ?? 6, m = std({ ...(o.brick ? brick(sp.col as string, [Wd / 2, Hh / 2]) : plaster(sp.col as string, [Wd / 4, Hh / 4], 61)), roughness: 0.92 });
      s.add(boxM(2 * Wd, Hh, 0.6, m, 0, 0, z + 0.3)); const n = o.win ?? 0; for (let i = 0; i < n; i++) { const x = -Wd + ((i + 0.5) / n) * 2 * Wd, ww = Math.min(2.6, (Wd * 2) / n * 0.45);
        s.add(planeF(ww, Hh * 0.5, std({ color: o.winCol ?? "#cfe0ea", emissive: C(o.winCol ?? "#cfe0ea"), emissiveIntensity: 0.5, roughness: 0.15, metalness: 0.2 }), x, 1.3, z - 0.02)); s.add(boxM(ww + 0.3, 0.2, 0.3, m, x, 1.15, z - 0.1)); } continue; }
    if (sp.t === "banners") { const bm = std({ map: bannerT().map, side: THREE.DoubleSide, roughness: 1 }), n = sp.n as number; for (let i = 0; i < n; i++) { const x = -(sp.wid as number) + ((i + 0.5) / n) * 2 * (sp.wid as number); s.add(planeF(2, sp.hgt as number, bm, x, (sp.top as number) - (sp.hgt as number), z - 0.2)); } continue; }
    if (sp.t === "field") { const kind = sp.kind as string, n = 2600, geo = kind === "sunflower" ? new THREE.CylinderGeometry(0.12, 0.12, 0.03, 10) : new THREE.ConeGeometry(0.05, 1, 4), m = std({ color: kind === "sunflower" ? "#f0b820" : (sp.col as string), roughness: 1 });
      const im = new THREE.InstancedMesh(geo, m, n), m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), hh = (sp.h as number) ?? 1; for (let i = 0; i < n; i++) { const x = (hs(i, 1) - 0.5) * 2 * (sp.wid as number), zz = z + hs(i, 2) * 30; q.setFromEuler(new THREE.Euler(kind === "sunflower" ? Math.PI / 2 - 0.3 : (hs(i, 3) - 0.5) * 0.3, 0, (hs(i, 4) - 0.5) * 0.3));
        m4.compose(new THREE.Vector3(x, kind === "sunflower" ? hh : hh * 0.5, -zz), q, new THREE.Vector3(1, hh * (0.8 + 0.4 * hs(i, 5)), 1)); im.setMatrixAt(i, m4); } im.castShadow = false; im.receiveShadow = true; s.add(im);
      s.add(at((() => { const p2 = mesh(new THREE.PlaneGeometry(2 * (sp.wid as number), 30), std({ color: kind === "sunflower" ? "#4a6a2a" : (sp.col as string), roughness: 1 }), false); p2.rotation.x = -Math.PI / 2; return p2; })(), 0, 0.02, z + 15)); continue; }
    if (sp.t === "wire") { const pm = std({ color: "#3a2e24" }), wd = sp.wid as number; for (let x = -wd; x <= wd; x += 3) { const pst = boxM(0.1, 1.5, 0.1, pm, x, 0, z); pst.rotation.z = (hs(x) - 0.5) * 0.1; s.add(pst); }
      for (let k = 0; k < 4; k++) s.add(boxM(2 * wd, 0.015, 0.015, dark(), 0, 0.35 + k * 0.32, z)); continue; }
    if (sp.t === "pier") { s.add(boxM(2 * (sp.wid as number), 1.0, 3, std({ ...wood(sp.col as string, [10, 1], 4, 71) }), 0, 0, z + 1.5)); continue; }
  }
  W.tint = C(L.tint); W.focus.set(0, 0, -10); W.shadowR = 25;
  W.up = (t) => { W.sun.position.copy(W.focus).addScaledVector(sd, 90); W.sun.target.position.copy(W.focus); };
  return W;
};
const CLOUDS = new Map<number, THREE.Texture>();
const cloudTex = (seed: number) => { if (CLOUDS.has(seed)) return CLOUDS.get(seed)!; const c = document.createElement("canvas"); c.width = 512; c.height = 256; const g = c.getContext("2d")!;
  for (let i = 0; i < 70; i++) { const x = 60 + 392 * hs(i, seed), y = 160 - 90 * Math.sin(Math.PI * (x - 60) / 392) * hs(i, seed + 1), r = 26 + 56 * hs(i, seed + 2); const gr = g.createRadialGradient(x, y - r * 0.25, 0, x, y, r);
    gr.addColorStop(0, "rgba(255,255,255,0.6)"); gr.addColorStop(0.6, "rgba(230,232,240,0.3)"); gr.addColorStop(1, "rgba(200,205,220,0)"); g.fillStyle = gr; g.fillRect(0, 0, 512, 256); }
  const sh = g.createLinearGradient(0, 90, 0, 256); sh.addColorStop(0, "rgba(255,255,255,0)"); sh.addColorStop(1, "rgba(90,95,115,0.6)"); g.globalCompositeOperation = "source-atop"; g.fillStyle = sh; g.fillRect(0, 0, 512, 256);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; CLOUDS.set(seed, t); return t; };
