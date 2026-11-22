// 3D kit core: math, procedural textures, sky dome with a real sun (always above the horizon), mood presets,
// and the Stage every 3D shot builds into (updaters, flash-light pool, camera shake, shadow focus).
import * as THREE from "three";

export const FPS = 30;
export const hs = (i: number, s = 0) => { const v = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return v - Math.floor(v); };
export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const sm = (x: number) => { const k = clamp(x); return k * k * (3 - 2 * k); };
export const eo = (x: number) => 1 - (1 - clamp(x)) ** 3;
export const ei = (x: number) => clamp(x) ** 3;
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
export type V3 = [number, number, number];

// ---------------- textures ----------------
const TEX = new Map<string, THREE.Texture>();
export const cnv = (key: string, w: number, h: number, d: (g: CanvasRenderingContext2D) => void, rep: [number, number] | null = null, srgb = true) => {
  const k = key + (rep ? rep.join("x") : "");
  const hit = TEX.get(k); if (hit) return hit;
  const c = document.createElement("canvas"); c.width = w; c.height = h; d(c.getContext("2d")!);
  const t = new THREE.CanvasTexture(c); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]); }
  TEX.set(k, t); return t;
};
export const noise = (g: CanvasRenderingContext2D, w: number, h: number, n: number, a: number, seed = 1) => {
  for (let i = 0; i < n; i++) { const v = hs(i, seed) > 0.5 ? 255 : 0; g.fillStyle = `rgba(${v},${v},${v},${a * hs(i, seed + 2)})`; g.fillRect(hs(i, seed + 3) * w, hs(i, seed + 4) * h, 1 + 3 * hs(i, seed + 5), 1 + 3 * hs(i, seed + 6)); }
};
const blot = (g: CanvasRenderingContext2D, w: number, h: number, n: number, col: string, a: number, r0: number, r1: number, seed: number) => {
  for (let i = 0; i < n; i++) { const r = r0 + (r1 - r0) * hs(i, seed), x = hs(i, seed + 1) * w, y = hs(i, seed + 2) * h; const gr = g.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, col.replace("A", String(a * (0.4 + 0.6 * hs(i, seed + 3))))); gr.addColorStop(1, col.replace("A", "0")); g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r); }
};
export const grime = (col: string, seed = 1) => cnv("grime" + col + seed, 256, 256, (g) => { g.fillStyle = col; g.fillRect(0, 0, 256, 256); noise(g, 256, 256, 5000, 0.28, seed);
  for (let i = 0; i < 14; i++) { g.fillStyle = `rgba(40,30,20,${0.16 * hs(i, seed)})`; g.fillRect(hs(i, seed + 1) * 256, hs(i, seed + 2) * 256, 4 + 30 * hs(i, 3), 40 + 120 * hs(i, 4)); }
  blot(g, 256, 256, 8, "rgba(255,255,255,A)", 0.07, 10, 40, seed + 9); });
export type GroundKind = "cobble" | "mud" | "grass" | "steppe" | "snow" | "sand" | "desert" | "rubble" | "concrete" | "field";
const GROUND: Record<GroundKind, { base: string; hue: number; sat: number; lit: number; tiles?: boolean; blots: string }> = {
  cobble: { base: "#4a4640", hue: 30, sat: 8, lit: 28, tiles: true, blots: "rgba(20,16,12,A)" },
  mud: { base: "#4e4232", hue: 32, sat: 22, lit: 26, blots: "rgba(30,22,14,A)" },
  grass: { base: "#4e6a32", hue: 85, sat: 34, lit: 30, blots: "rgba(40,60,20,A)" },
  steppe: { base: "#8a7a4a", hue: 48, sat: 30, lit: 44, blots: "rgba(90,80,40,A)" },
  snow: { base: "#dfe4ea", hue: 210, sat: 18, lit: 88, blots: "rgba(160,175,200,A)" },
  sand: { base: "#b8a07a", hue: 38, sat: 32, lit: 60, blots: "rgba(120,100,70,A)" },
  desert: { base: "#c49a64", hue: 32, sat: 42, lit: 58, blots: "rgba(150,110,60,A)" },
  rubble: { base: "#5a5048", hue: 25, sat: 10, lit: 32, blots: "rgba(20,16,14,A)" },
  concrete: { base: "#6a6a66", hue: 40, sat: 4, lit: 42, tiles: true, blots: "rgba(30,30,30,A)" },
  field: { base: "#7a8a3a", hue: 70, sat: 40, lit: 38, blots: "rgba(60,70,20,A)" },
};
export const groundTex = (k: GroundKind, rep = 30) => cnv("g" + k, 1024, 1024, (g) => {
  const G = GROUND[k]; g.fillStyle = G.base; g.fillRect(0, 0, 1024, 1024);
  if (G.tiles) for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) { const q = hs(x + y * 32, 9); g.fillStyle = `hsl(${G.hue},${G.sat + 6 * q}%,${G.lit - 6 + 12 * q}%)`; g.fillRect(x * 32 + (y % 2) * 16 + 2, y * 32 + 2, 28, 28); }
  else for (let i = 0; i < 9000; i++) { const q = hs(i, 4); g.fillStyle = `hsla(${G.hue + 14 * (hs(i, 5) - 0.5)},${G.sat}%,${G.lit - 10 + 20 * q}%,0.5)`; g.fillRect(hs(i, 6) * 1024, hs(i, 7) * 1024, 2 + 10 * hs(i, 8), 2 + 4 * hs(i, 9)); }
  noise(g, 1024, 1024, 22000, 0.22, 3); blot(g, 1024, 1024, 46, G.blots, 0.55, 30, 140, 11);
  if (k === "mud" || k === "snow" || k === "steppe" || k === "sand") for (let i = 0; i < 8; i++) { g.strokeStyle = k === "snow" ? "rgba(140,150,170,0.35)" : "rgba(30,20,12,0.3)"; g.lineWidth = 10; g.beginPath(); const y = hs(i, 30) * 1024; g.moveTo(0, y); g.bezierCurveTo(300, y + 60 * (hs(i, 31) - 0.5), 700, y - 80 * (hs(i, 32) - 0.5), 1024, y); g.stroke(); }
}, [rep, rep]);
export const facadeTex = (hue: number, seed: number, broken: boolean, floors = 4, cols = 3, lit = 46) => cnv(`fac${hue}|${seed}|${broken}|${floors}|${cols}|${lit}`, 512, 1024, (g) => {
  g.fillStyle = `hsl(${hue},18%,${lit}%)`; g.fillRect(0, 0, 512, 1024);
  for (let y = 0; y < 1024; y += 10) for (let x = (y / 10) % 2 ? 0 : 12; x < 512; x += 24) { g.fillStyle = `hsl(${hue},${14 + 10 * hs(x + y, seed)}%,${lit - 8 + 12 * hs(x * 3 + y, seed)}%)`; g.fillRect(x, y, 22, 8); }
  noise(g, 512, 1024, 14000, 0.3, seed);
  const fh = 1024 / floors, cw = 512 / cols;
  for (let fl = 0; fl < floors; fl++) for (let w = 0; w < cols; w++) {
    const x = w * cw + cw * 0.28, y = fl * fh + fh * 0.2, ww = cw * 0.44, wh = fh * 0.58, dead = broken && hs(fl * 3 + w, seed + 1) > 0.45;
    g.fillStyle = "#2c2824"; g.fillRect(x - 8, y - 8, ww + 16, wh + 16);
    g.fillStyle = dead ? "#070606" : "#1a1c20"; g.fillRect(x, y, ww, wh);
    if (!dead) { g.fillStyle = "#3a4048"; g.fillRect(x + ww / 2 - 2, y, 4, wh); g.fillRect(x, y + wh * 0.4, ww, 4); g.fillStyle = "rgba(160,180,200,0.12)"; g.fillRect(x + 3, y + 3, ww / 2 - 6, wh * 0.4 - 6); }
    const sg = g.createLinearGradient(0, y - 10, 0, y - 160); sg.addColorStop(0, dead ? "rgba(10,8,6,0.8)" : "rgba(10,8,6,0.2)"); sg.addColorStop(1, "rgba(10,8,6,0)"); g.fillStyle = sg; g.fillRect(x - 20, y - 160, ww + 40, 150);
  }
  const gr = g.createLinearGradient(0, 1024, 0, 760); gr.addColorStop(0, "rgba(30,24,18,0.7)"); gr.addColorStop(1, "rgba(30,24,18,0)"); g.fillStyle = gr; g.fillRect(0, 760, 512, 264);
});
const vnoise = (x: number, y: number, s: number) => { const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const h = (a: number, b: number) => hs(a * 57 + b * 131, s); return (h(xi, yi) * (1 - u) + h(xi + 1, yi) * u) * (1 - v) + (h(xi, yi + 1) * (1 - u) + h(xi + 1, yi + 1) * u) * v; };
/** soft billowing smoke puff: fbm value noise inside a soft round mask, lit from the top-left */
export const puffTex = () => cnv("puff2", 256, 256, (g) => {
  const im = g.createImageData(256, 256);
  for (let y = 0; y < 256; y++) for (let x = 0; x < 256; x++) {
    const nx = x / 256, ny = y / 256; let f = 0, a = 0.55, fr = 3; for (let o = 0; o < 5; o++) { f += a * vnoise(nx * fr, ny * fr, 7 + o); a *= 0.5; fr *= 2.1; }
    const r = Math.hypot(nx - 0.5, ny - 0.5) * 2, m = Math.max(0, 1 - r * r * (1.25 - 0.6 * f)); const al = Math.max(0, Math.min(1, (f * 1.6 - 0.35) * 1.4)) * m ** 1.3;
    const lit = 0.62 + 0.38 * Math.max(0, Math.min(1, 1.2 - (nx + ny) * 0.9 + (f - 0.5) * 0.8)); const i = (y * 256 + x) * 4;
    im.data[i] = im.data[i + 1] = im.data[i + 2] = Math.round(255 * lit); im.data[i + 3] = Math.round(255 * al); }
  g.putImageData(im, 0, 0);
});
export const puffTexOld = () => cnv("puff", 256, 256, (g) => {
  for (let i = 0; i < 26; i++) { const r = 30 + 50 * hs(i, 4), x = 128 + (hs(i, 5) - 0.5) * 110, y = 128 + (hs(i, 6) - 0.5) * 110;
    const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, "rgba(255,255,255,0.6)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, 256, 256); }
  g.globalCompositeOperation = "source-atop"; const sh = g.createLinearGradient(60, 40, 200, 230); sh.addColorStop(0, "rgba(255,255,255,0)"); sh.addColorStop(1, "rgba(40,40,40,0.75)"); g.fillStyle = sh; g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 18; i++) { const x = 40 + 176 * hs(i, 21), y = 40 + 176 * hs(i, 22), r = 14 + 26 * hs(i, 23); const gr = g.createRadialGradient(x - r * 0.3, y - r * 0.3, 0, x, y, r); gr.addColorStop(0, "rgba(255,255,255,0.35)"); gr.addColorStop(0.7, "rgba(60,60,60,0.25)"); gr.addColorStop(1, "rgba(60,60,60,0)"); g.fillStyle = gr; g.fillRect(0, 0, 256, 256); }
  const m = g.createRadialGradient(128, 128, 50, 128, 128, 126); m.addColorStop(0, "rgba(0,0,0,0)"); m.addColorStop(1, "rgba(0,0,0,1)");
  g.globalCompositeOperation = "destination-out"; g.fillStyle = m; g.fillRect(0, 0, 256, 256);
});
export const glowTex = () => cnv("glow", 128, 128, (g) => { const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.25, "rgba(255,220,160,0.8)"); gr.addColorStop(1, "rgba(255,120,30,0)"); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); });
export const fireTex = () => cnv("fire", 128, 256, (g) => {
  for (let i = 0; i < 30; i++) { const x = 64 + (hs(i, 1) - 0.5) * 50, y = 150 + (hs(i, 2) - 0.5) * 140, r = 16 + 30 * hs(i, 3); const gr = g.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, "rgba(255,240,200,0.7)"); gr.addColorStop(0.5, "rgba(255,150,40,0.4)"); gr.addColorStop(1, "rgba(255,60,0,0)"); g.fillStyle = gr; g.fillRect(0, 0, 128, 256); }
  const m = g.createLinearGradient(0, 0, 0, 256); m.addColorStop(0, "rgba(0,0,0,1)"); m.addColorStop(0.5, "rgba(0,0,0,0)"); g.globalCompositeOperation = "destination-out"; g.fillStyle = m; g.fillRect(0, 0, 128, 256);
});
export const cloudTex = (seed = 1) => cnv("cloud" + seed, 512, 256, (g) => {
  for (let i = 0; i < 60; i++) { const x = 60 + 392 * hs(i, seed), y = 150 - 80 * Math.sin(Math.PI * (x - 60) / 392) * hs(i, seed + 1) , r = 30 + 60 * hs(i, seed + 2);
    const gr = g.createRadialGradient(x, y - r * 0.2, 0, x, y, r); gr.addColorStop(0, "rgba(255,255,255,0.55)"); gr.addColorStop(0.6, "rgba(225,228,238,0.3)"); gr.addColorStop(1, "rgba(200,205,220,0)"); g.fillStyle = gr; g.fillRect(0, 0, 512, 256); }
  const sh = g.createLinearGradient(0, 80, 0, 256); sh.addColorStop(0, "rgba(255,255,255,0)"); sh.addColorStop(1, "rgba(90,95,115,0.6)"); g.globalCompositeOperation = "source-atop"; g.fillStyle = sh; g.fillRect(0, 0, 512, 256);
});

// ---------------- moods ----------------
export type Mood = { top: string; mid: string; hor: string; gnd: string; sunEl: number; sunAz: number; sunCol: string; sunI: number; disc: number;
  hemiS: string; hemiG: string; hemiI: number; fog: string; fogN: number; fogF: number; stars?: boolean };
export const MOODS = {
  dawn: { top: "#2e3e66", mid: "#8a7a96", hor: "#f2a878", gnd: "#4a3a34", sunEl: 6, sunAz: 30, sunCol: "#ffb27a", sunI: 3.2, disc: 1, hemiS: "#8a90b8", hemiG: "#5a4438", hemiI: 1.5, fog: "#c09080", fogN: 60, fogF: 1400 },
  day: { top: "#2f6cc0", mid: "#6a9ad8", hor: "#c8daea", gnd: "#6a6050", sunEl: 48, sunAz: 120, sunCol: "#fff1dc", sunI: 4.4, disc: 1, hemiS: "#b8d0f0", hemiG: "#7a6a52", hemiI: 1.5, fog: "#b8c8da", fogN: 120, fogF: 2600 },
  golden: { top: "#4a5a8a", mid: "#c08a7a", hor: "#ffc27a", gnd: "#5a4436", sunEl: 9, sunAz: 40, sunCol: "#ffb066", sunI: 4.2, disc: 1, hemiS: "#a898b8", hemiG: "#6a4a36", hemiI: 1.3, fog: "#d8a07a", fogN: 80, fogF: 1500 },
  dusk: { top: "#1e2440", mid: "#5a4a68", hor: "#c8785a", gnd: "#2e2626", sunEl: 4, sunAz: 20, sunCol: "#ff9050", sunI: 2.6, disc: 1, hemiS: "#6a6a90", hemiG: "#3a2a26", hemiI: 1.1, fog: "#7a5a5a", fogN: 60, fogF: 1200 },
  night: { top: "#05070f", mid: "#0e1426", hor: "#24304a", gnd: "#0c0c10", sunEl: 35, sunAz: 140, sunCol: "#8aa0d0", sunI: 0.8, disc: 0, hemiS: "#2a3456", hemiG: "#141416", hemiI: 0.9, fog: "#141a2a", fogN: 40, fogF: 900, stars: true },
  overcast: { top: "#5a6270", mid: "#848a94", hor: "#a8aaae", gnd: "#4a4844", sunEl: 40, sunAz: 100, sunCol: "#e8e4dc", sunI: 1.6, disc: 0, hemiS: "#b0b4bc", hemiG: "#5a5650", hemiI: 2.0, fog: "#9a9ca2", fogN: 50, fogF: 900 },
  snow: { top: "#6a7a90", mid: "#a6b2c2", hor: "#d8dee6", gnd: "#c8d0da", sunEl: 14, sunAz: 60, sunCol: "#e8eeff", sunI: 2.2, disc: 0.5, hemiS: "#c8d4e8", hemiG: "#a0a8b4", hemiI: 1.9, fog: "#c8d0da", fogN: 30, fogF: 500 },
  fire: { top: "#0e0a10", mid: "#3a2226", hor: "#a44a26", gnd: "#1a1210", sunEl: 25, sunAz: -60, sunCol: "#ff9a5a", sunI: 2.4, disc: 0, hemiS: "#8a6a70", hemiG: "#4a3020", hemiI: 1.7, fog: "#4a2a22", fogN: 40, fogF: 600 },
  desert: { top: "#3a70b8", mid: "#8ab0d6", hor: "#f0d8b0", gnd: "#a08060", sunEl: 22, sunAz: 50, sunCol: "#ffe0b0", sunI: 4.4, disc: 1, hemiS: "#c8d4e4", hemiG: "#a08060", hemiI: 1.5, fog: "#e8d0a8", fogN: 100, fogF: 2000 },
  pacific: { top: "#2a64b4", mid: "#6aa0d8", hor: "#f0d4b4", gnd: "#2a4a6a", sunEl: 12, sunAz: 35, sunCol: "#ffd2a0", sunI: 4.0, disc: 1, hemiS: "#a8c4e8", hemiG: "#3a5a7a", hemiI: 1.5, fog: "#c8c8d0", fogN: 150, fogF: 3200 },
} satisfies Record<string, Mood>;
export type MoodName = keyof typeof MOODS;

const SKY_V = `varying vec3 vD; void main(){ vD = normalize(position); vec4 p = modelViewMatrix * vec4(position,1.0); gl_Position = projectionMatrix * p; gl_Position.z = gl_Position.w; }`;
const SKY_F = `uniform vec3 top, mid, hor, gnd, sunDir, sunCol; uniform float disc, stars; varying vec3 vD;
float h(vec3 p){ return fract(sin(dot(p, vec3(12.9898,78.233,45.164))) * 43758.5453); }
void main(){ vec3 d = normalize(vD); float e = d.y;
  vec3 c = e > 0.0 ? mix(hor, mid, smoothstep(0.0, 0.18, e)) : mix(hor, gnd, smoothstep(0.0, 0.06, -e));
  c = mix(c, top, smoothstep(0.18, 0.75, e));
  float s = max(dot(d, sunDir), 0.0);
  c += sunCol * (pow(s, 8.0) * 0.35 + pow(s, 64.0) * 0.5) * (0.4 + 0.6 * disc);
  c += sunCol * smoothstep(0.9993, 0.99965, s) * 6.0 * disc;
  if (stars > 0.5 && e > 0.02) { vec3 q = floor(d * 420.0); float st = step(0.9965, h(q)); c += vec3(st) * 0.9 * smoothstep(0.02, 0.3, e); }
  gl_FragColor = vec4(c, 1.0); }`;

// ---------------- stage ----------------
type Flash = { pos: THREE.Vector3; t0: number; power: number; dur: number; col: THREE.Color; flick: boolean };
export class Stage {
  root = new THREE.Group(); ups: ((t: number) => void)[] = []; flashes: Flash[] = []; shakes: [number, number, number][] = [];
  sun: THREE.DirectionalLight; hemi: THREE.HemisphereLight; skyMat: THREE.ShaderMaterial; lights: THREE.PointLight[] = []; mood: Mood;
  sunDir = V(); focus = V(); charTint = new THREE.Color(); focusR = 40; cam!: THREE.PerspectiveCamera; t = 0;
  constructor(mood: Mood | MoodName, over: Partial<Mood> = {}) {
    const m = (this.mood = { ...(typeof mood === "string" ? MOODS[mood] : mood), ...over });
    const el = THREE.MathUtils.degToRad(Math.max(3, m.sunEl)), az = THREE.MathUtils.degToRad(m.sunAz);
    this.sunDir.set(Math.sin(az) * Math.cos(el), Math.sin(el), -Math.cos(az) * Math.cos(el)).normalize();
    this.skyMat = new THREE.ShaderMaterial({ vertexShader: SKY_V, fragmentShader: SKY_F, side: THREE.BackSide, depthWrite: false, fog: false,
      uniforms: { top: { value: new THREE.Color(m.top) }, mid: { value: new THREE.Color(m.mid) }, hor: { value: new THREE.Color(m.hor) }, gnd: { value: new THREE.Color(m.gnd) },
        sunDir: { value: this.sunDir }, sunCol: { value: new THREE.Color(m.sunCol) }, disc: { value: m.disc }, stars: { value: m.stars ? 1 : 0 } } });
    // character cards are unlit: tint = mix of sun and sky light, normalised, darker for night/fire moods
    const tc = new THREE.Color(m.sunCol).multiplyScalar(0.5).add(new THREE.Color(m.hemiS).multiplyScalar(0.5)), mx = Math.max(tc.r, tc.g, tc.b);
    this.charTint.copy(tc).multiplyScalar(1 / mx).lerp(new THREE.Color(1, 1, 1), 0.45).multiplyScalar(m.stars ? 0.5 : m.fog === "#4a2a22" ? 0.72 : m.sunEl < 6 ? 0.82 : 0.97);
    const sky = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 24), this.skyMat); sky.scale.setScalar(3000); sky.renderOrder = -10; sky.frustumCulled = false; this.root.add(sky);
    this.ups.push(() => sky.position.copy(this.cam.position));
    this.hemi = new THREE.HemisphereLight(m.hemiS, m.hemiG, m.hemiI); this.root.add(this.hemi);
    const sun = (this.sun = new THREE.DirectionalLight(m.sunCol, m.sunI)); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.04; this.root.add(sun, sun.target);
    for (let i = 0; i < 4; i++) { const l = new THREE.PointLight("#ffa050", 0, 80, 1.7); this.lights.push(l); this.root.add(l); }
  }
  /** equirect sky image (same gradient + sun glow as the dome) for PMREM reflections */
  envTex() { const m = this.mood, W = 256, H = 128, c = document.createElement("canvas"); c.width = W; c.height = H; const g = c.getContext("2d")!, im = g.createImageData(W, H);
    const C = (s: string) => new THREE.Color(s), top = C(m.top), mid = C(m.mid), hor = C(m.hor), gnd = C(m.gnd), sc = C(m.sunCol), col = new THREE.Color(), d = V();
    const ss = (a: number, b: number, x: number) => { const k = clamp((x - a) / (b - a)); return k * k * (3 - 2 * k); };
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const th = (y / H) * Math.PI, ph = (x / W) * Math.PI * 2; d.set(Math.sin(th) * Math.cos(ph), Math.cos(th), Math.sin(th) * Math.sin(ph)); const e = d.y;
      if (e > 0) col.copy(hor).lerp(mid, ss(0, 0.18, e)).lerp(top, ss(0.18, 0.75, e)); else col.copy(hor).lerp(gnd, ss(0, 0.06, -e));
      const s = Math.max(0, d.dot(this.sunDir)); col.r += sc.r * (s ** 8 * 0.5 + s ** 200 * 3) * m.disc; col.g += sc.g * (s ** 8 * 0.5 + s ** 200 * 3) * m.disc; col.b += sc.b * (s ** 8 * 0.5 + s ** 200 * 3) * m.disc;
      const i = (y * W + x) * 4; im.data[i] = Math.min(255, col.r * 255); im.data[i + 1] = Math.min(255, col.g * 255); im.data[i + 2] = Math.min(255, col.b * 255); im.data[i + 3] = 255; }
    g.putImageData(im, 0, 0); const t = new THREE.CanvasTexture(c); t.mapping = THREE.EquirectangularReflectionMapping; t.colorSpace = THREE.SRGBColorSpace; return t; }
  add<T extends THREE.Object3D>(o: T, shadow = true): T { if (shadow) o.traverse((c) => { if ((c as THREE.Mesh).isMesh) { c.castShadow = true; c.receiveShadow = true; } }); this.root.add(o); return o; }
  on(f: (t: number) => void) { this.ups.push(f); }
  /** shadow camera follows a point (shot focus) with a given radius */
  shadowAt(x: number, y: number, z: number, r = 40) { this.focus.set(x, y, z); this.focusR = r; }
  flash(pos: THREE.Vector3 | V3, t0: number, power = 1, dur = 0.6, col = "#ffb060", flick = true) { this.flashes.push({ pos: Array.isArray(pos) ? V(...pos) : pos.clone(), t0, power, dur, col: new THREE.Color(col), flick }); }
  shake(t0: number, amp: number, decay = 2.5) { this.shakes.push([t0, amp, decay]); }
  shakeAt(t: number) { let a = 0; for (const [t0, amp, d] of this.shakes) if (t >= t0) a += amp * Math.exp(-(t - t0) * d); return a; }
  update(t: number) {
    this.t = t;
    for (const f of this.ups) f(t);
    // shadow box around the focus, sun far along its direction
    const s = this.sun, r = this.focusR; s.target.position.copy(this.focus); s.position.copy(this.focus).addScaledVector(this.sunDir, 200);
    Object.assign(s.shadow.camera, { left: -r, right: r, top: r, bottom: -r, near: 50, far: 400 }); s.shadow.camera.updateProjectionMatrix();
    // flash pool: 4 strongest active flashes get the 4 point lights
    const act = this.flashes.map((f) => { const a = t - f.t0; if (a < 0 || a > f.dur * 4) return null; const k = Math.exp(-a / f.dur) * Math.min(1, a * 40 + 0.2) * (f.flick ? 0.8 + 0.2 * Math.sin(a * 70 + f.t0) : 1); return { f, k: k * f.power }; })
      .filter(Boolean).sort((a, b) => b!.k - a!.k) as { f: Flash; k: number }[];
    this.lights.forEach((l, i) => { const a = act[i]; if (!a) { l.intensity = 0; return; } l.position.copy(a.f.pos); l.color.copy(a.f.col); l.intensity = 900 * a.k; });
  }
}
export const fogFor = (m: Mood) => new THREE.Fog(m.fog, m.fogN, m.fogF);
