// Texturas procedurais PBR (cor + relevo → normal map + rugosidade) para o mundo 3D do filme do Elser.
import * as THREE from "three";

const hs = (i: number, s = 0) => { const v = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return v - Math.floor(v); };
const vn = (x: number, y: number, s: number) => { const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const h = (a: number, b: number) => hs(a * 57 + b * 131, s); return (h(xi, yi) * (1 - u) + h(xi + 1, yi) * u) * (1 - v) + (h(xi, yi + 1) * (1 - u) + h(xi + 1, yi + 1) * u) * v; };
export const fbm = (x: number, y: number, s: number, o = 4) => { let f = 0, a = 0.5, fr = 1; for (let i = 0; i < o; i++) { f += a * vn(x * fr, y * fr, s + i); a *= 0.5; fr *= 2.03; } return f; };

type Mat = { map: THREE.Texture; normalMap: THREE.Texture; roughnessMap?: THREE.Texture };
const CACHE = new Map<string, Mat>();
/** pinta cor e altura no mesmo laço: f(x, y) → [r, g, b, altura 0..1] (x, y em 0..1) */
export const pbr = (key: string, N: number, f: (x: number, y: number) => [number, number, number, number], rep: [number, number] = [1, 1], nStr = 2.5): Mat => {
  const hit = CACHE.get(key); if (hit) { const m = { map: hit.map.clone(), normalMap: hit.normalMap.clone() }; for (const t of [m.map, m.normalMap]) { t.repeat.set(rep[0], rep[1]); t.needsUpdate = true; } return m; }
  const c = document.createElement("canvas"), n = document.createElement("canvas"); c.width = n.width = c.height = n.height = N;
  const gc = c.getContext("2d")!, gn = n.getContext("2d")!, ic = gc.createImageData(N, N), inn = gn.createImageData(N, N), H = new Float32Array(N * N);
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const [r, g, b, h] = f(x / N, y / N), i = y * N + x; ic.data[i * 4] = r; ic.data[i * 4 + 1] = g; ic.data[i * 4 + 2] = b; ic.data[i * 4 + 3] = 255; H[i] = h; }
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const i = y * N + x, dx = (H[y * N + ((x + 1) % N)] - H[y * N + ((x - 1 + N) % N)]) * nStr, dy = (H[((y + 1) % N) * N + x] - H[((y - 1 + N) % N) * N + x]) * nStr, l = Math.hypot(dx, dy, 1);
    inn.data[i * 4] = (-dx / l * 0.5 + 0.5) * 255; inn.data[i * 4 + 1] = (dy / l * 0.5 + 0.5) * 255; inn.data[i * 4 + 2] = (1 / l * 0.5 + 0.5) * 255; inn.data[i * 4 + 3] = 255; }
  gc.putImageData(ic, 0, 0); gn.putImageData(inn, 0, 0);
  const map = new THREE.CanvasTexture(c), normalMap = new THREE.CanvasTexture(n); map.colorSpace = THREE.SRGBColorSpace;
  for (const t of [map, normalMap]) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8; t.repeat.set(rep[0], rep[1]); }
  const m = { map, normalMap }; CACHE.set(key, m); return m;
};
const hx = (c: string) => { const n = parseInt(c.slice(1, 7), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
const tint = (c: number[], k: number): [number, number, number] => [c[0] * k, c[1] * k, c[2] * k];

/** tábuas de madeira (piso/mesa/parede): veios, emendas escuras, variação por tábua */
export const wood = (col: string, rep: [number, number], boards = 8, seed = 1, vertical = false) => pbr(`wood${col}${boards}${seed}${vertical}`, 512, (x0, y0) => {
  const x = vertical ? y0 : x0, y = vertical ? x0 : y0, b = Math.floor(y * boards), by = y * boards - b, off = hs(b, seed) * 3, len = 0.5 + hs(b, seed + 1) * 0.5, seg = Math.floor((x + off) / len);
  const c = hx(col), v = 0.82 + 0.3 * hs(b * 7 + seg, seed), grain = fbm(x * 3 + off, by * 0.4 + b * 3.1, seed + 5) * 0.5 + 0.25 * Math.sin((x * 40 + fbm(x * 4, by * 2 + b, seed) * 8) + b), seam = Math.min(by, 1 - by) < 0.04 || ((x + off) / len) % 1 < 0.006 ? 0.35 : 1;
  const k = v * (0.85 + 0.25 * grain) * seam; return [...tint(c, k), seam < 1 ? 0 : 0.55 + 0.2 * grain] as [number, number, number, number];
}, rep, 3);
/** reboco com manchas e um rodapé de sujeira */
export const plaster = (col: string, rep: [number, number], seed = 2) => pbr(`pl${col}${seed}`, 512, (x, y) => { const c = hx(col), f = fbm(x * 6, y * 6, seed, 5), stain = fbm(x * 2, y * 2, seed + 9, 3);
  return [...tint(c, 0.86 + 0.18 * f - 0.12 * Math.max(0, stain - 0.55) * 3), f] as [number, number, number, number]; }, rep, 1.2);
/** tijolo (ou pedra quando big) com argamassa */
export const brick = (col: string, rep: [number, number], big = false, seed = 3) => pbr(`br${col}${big}${seed}`, 512, (x, y) => {
  const rows = big ? 8 : 16, cols = big ? 4 : 8, r = Math.floor(y * rows), yy = y * rows - r, xx = x * cols + (r % 2) * 0.5, cI = Math.floor(xx), cx = xx - cI;
  const mort = Math.min(yy, 1 - yy) < 0.07 || Math.min(cx, 1 - cx) < (big ? 0.03 : 0.04), c = hx(col), v = 0.78 + 0.35 * hs(r * 31 + cI, seed), f = fbm(x * 14, y * 14, seed, 3);
  return mort ? [118 + 20 * f, 110 + 20 * f, 100 + 20 * f, 0.1] : [...tint(c, v * (0.85 + 0.25 * f)), 0.6 + 0.3 * f * (big ? 1.5 : 1)] as [number, number, number, number]; }, rep, big ? 4 : 3);
/** paralelepípedos */
export const cobble = (col: string, rep: [number, number], seed = 4) => pbr(`cb${col}${seed}`, 512, (x, y) => {
  const n = 10, r = Math.floor(y * n), xx = x * n + (r % 2) * 0.5, cI = Math.floor(xx), cx = xx - cI - 0.5, cy = y * n - r - 0.5, d = Math.max(Math.abs(cx), Math.abs(cy)) , c = hx(col), v = 0.75 + 0.4 * hs(r * 17 + cI, seed);
  const h = Math.max(0, 1 - Math.pow(d * 2.15, 6)); return [...tint(c, (0.5 + 0.5 * h) * v * (0.9 + 0.2 * fbm(x * 30, y * 30, seed, 2))), h] as [number, number, number, number]; }, rep, 4);
/** papel de parede listrado com flores discretas */
export const wallpaper = (col: string, rep: [number, number], seed = 5) => pbr(`wp${col}${seed}`, 256, (x, y) => { const c = hx(col), st = Math.sin(x * Math.PI * 12) > 0.6 ? 0.92 : 1, fl = Math.hypot(((x * 6) % 1) - 0.5, ((y * 6 + (Math.floor(x * 6) % 2) * 0.5) % 1) - 0.5) < 0.12 ? 0.85 : 1;
  return [...tint(c, st * fl * (0.95 + 0.08 * fbm(x * 8, y * 8, seed, 3))), 0.5] as [number, number, number, number]; }, rep, 0.5);
/** terra/grama/lama/neve/areia/entulho para paisagens */
export const soil = (kind: string, col: string, rep: [number, number], seed = 6) => pbr(`so${kind}${col}${seed}`, 512, (x, y) => {
  const c = hx(col), f = fbm(x * 10, y * 10, seed, 5), g = fbm(x * 60, y * 60, seed + 3, 2);
  if (kind === "grass") { const bl = hs(Math.floor(x * 300) + Math.floor(y * 300) * 300, seed); return [...tint(c, 0.7 + 0.35 * f + 0.25 * (bl - 0.5)), 0.3 + 0.5 * bl] as [number, number, number, number]; }
  if (kind === "rubble") { const st = fbm(x * 25, y * 25, seed + 7, 2) > 0.55; return [...tint(c, st ? 0.9 + 0.3 * g : 0.6 + 0.3 * f), st ? 0.8 : 0.2] as [number, number, number, number]; }
  if (kind === "snow") return [...tint(c, 0.93 + 0.07 * f), f] as [number, number, number, number];
  return [...tint(c, 0.72 + 0.4 * f + 0.1 * g), f * 0.7 + g * 0.3] as [number, number, number, number]; }, rep, kind === "grass" ? 1.5 : 2.5);
/** fachada com janelas (prédios das ruas/cidades) */
export const facadeT = (col: string, floors: number, cols: number, lit: number, seed: number, ruin = false) => pbr(`fa${col}${floors}${cols}${lit}${seed}${ruin}`, 512, (x, y) => {
  const c = hx(col), fy = (1 - y) * floors, fl = Math.floor(fy), wy = fy - fl, wx = x * cols, ci = Math.floor(wx), cx = wx - ci, f = fbm(x * 8, y * 8, seed, 4);
  const inWin = fl >= 1 && wy > 0.25 && wy < 0.8 && cx > 0.28 && cx < 0.72, frame = fl >= 1 && wy > 0.2 && wy < 0.85 && cx > 0.24 && cx < 0.76 && !inWin, ledge = fl >= 1 && wy > 0.17 && wy < 0.21 && cx > 0.2 && cx < 0.8;
  const door = fl === 0 && cx > 0.35 && cx < 0.65 && wy < 0.75 && ci % 3 === 1, shop = fl === 0 && wy > 0.2 && wy < 0.8 && !door && cx > 0.1 && cx < 0.9;
  if (inWin) { const on = hs(fl * 13 + ci * 7, seed) < lit, mull = Math.abs(cx - 0.5) < 0.02 || Math.abs(wy - 0.48) < 0.02, broken = ruin && hs(fl * 5 + ci, seed + 3) > 0.4;
    return broken ? [12, 10, 9, 0] : mull ? [60, 50, 44, 0.3] : on ? [255, 205, 130, 0.05] : [40 + 30 * (1 - wy), 50 + 30 * (1 - wy), 62 + 30 * (1 - wy), 0.05]; }
  if (door) return [58, 40, 28, 0.1]; if (shop) return hs(ci, seed) < lit * 0.8 ? [240, 190, 120, 0.05] : [48, 54, 60, 0.05];
  if (frame || ledge) return [...tint(c, 1.12), 0.9] as [number, number, number, number];
  const soot = ruin ? Math.max(0, fbm(x * 3, y * 3, seed + 4, 3) - 0.45) * 2 : 0;
  return [...tint(c, (0.84 + 0.2 * f) * (1 - 0.6 * soot) * (fl === 0 ? 0.85 : 1)), 0.5 + 0.2 * f] as [number, number, number, number]; }, [1, 1], 2);
/** pano de faixa com o emblema abstrato (sem suástica) */
export const bannerT = () => pbr("banner", 256, (x, y) => { const d = Math.hypot(x - 0.5, (y - 0.38) * 0.55), ring = d < 0.2, dia = Math.abs(x - 0.5) + Math.abs(y - 0.38) * 0.55 < 0.11, fold = 0.85 + 0.15 * Math.sin(x * 30);
  return dia ? [24, 20, 20, 0.5] : ring ? [236 * fold, 230 * fold, 220 * fold, 0.5] : [168 * fold, 30 * fold, 24 * fold, 0.5]; }, [1, 1], 1);
/** textura de texto (placas, letreiros) */
export const textT = (txt: string, w: number, h: number, bg: string, fg: string, font = "bold 120px DejaVu Serif") => { const c = document.createElement("canvas"); c.width = w; c.height = h; const g = c.getContext("2d")!;
  g.fillStyle = bg; g.fillRect(0, 0, w, h); g.fillStyle = fg; g.font = font; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(txt, w / 2, h / 2 + 6); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; };
/** textura radial macia (manchas de luz, sombra de contato, fumaça) */
export const radial = (key: string, inner: string, outer: string) => { const hit = RAD.get(key); if (hit) return hit; const c = document.createElement("canvas"); c.width = c.height = 128; const g = c.getContext("2d")!;
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, inner); gr.addColorStop(1, outer); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); const t = new THREE.CanvasTexture(c); RAD.set(key, t); return t; };
const RAD = new Map<string, THREE.Texture>();
