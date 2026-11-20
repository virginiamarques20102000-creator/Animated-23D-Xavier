// Our cast as lit flat sprites in the 3D world. Each frame every character asks for a drawing (a key + a draw call);
// the pool keeps one canvas per distinct drawing, so soldiers marching in step share canvases (7 head shapes x 4
// outfits). Characters are yaw-only billboards shaded by cardShade() (scene tint, bright floor, side gradient toward
// the sun, painted crescent in the drawing); standing ones get a soft multiply contact blob. Effects are unlit cards.
// Cards, effects and blobs live on the NOINK layer so the world ink pass never outlines their quads.
import * as THREE from "three";
import {
  Pen, bodyFront, bodySide, fxBurst, fxPuff, fxShadow, fxContact, fxFlame, fxHat,
  Outfit, Expr, FrontOpts, SideOpts,
} from "./toon";
import { FPS, D0, SHOTS, V3, smooth, clamp01, T_FIRE, T_SHOCK, T_HIT, T_MARIA, GUNSHOTS, SX, SZ, banditX, physT, TX, TZ, carPose, carPoint, T_CRASH, T_EXIT, T_DRAW, SHOTS_AT, INTRO_Z, TOWN_X, VIEW_Z } from "./story";
import { LIGHTS } from "./lights";
import { NOINK } from "./ink";
import { cardShade, blobMaterial, CARD_K } from "./cardshade";

// ---------------- canvas pool ----------------
type Entry = { cv: HTMLCanvasElement; tex: THREE.CanvasTexture; w: number; h: number };
export type Req = { key: string; w: number; h: number; k: number; draw: (p: Pen) => void; tex?: THREE.CanvasTexture };
const makeEntry = (w: number, h: number): Entry => {
  const cv = document.createElement("canvas");
  cv.width = w; cv.height = h;
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  return { cv, tex, w, h };
};
export class Pool {
  private live = new Map<string, Entry>();
  private free: Entry[] = [];
  private reqs: Req[] = [];
  req(key: string, w: number, h: number, k: number, draw: (p: Pen) => void) {
    const r: Req = { key: `${w}x${h}|${key}`, w, h, k, draw };
    this.reqs.push(r);
    return r;
  }
  flush() {
    const want = new Map<string, Req[]>();
    for (const r of this.reqs) { const l = want.get(r.key); if (l) l.push(r); else want.set(r.key, [r]); }
    for (const [key, e] of this.live) if (!want.has(key)) { this.live.delete(key); this.free.push(e); }
    for (const [key, rs] of want) {
      let e = this.live.get(key);
      if (!e) {
        const r = rs[0], i = this.free.findIndex((x) => x.w === r.w && x.h === r.h);
        e = i >= 0 ? this.free.splice(i, 1)[0] : makeEntry(r.w, r.h);
        const g = e.cv.getContext("2d")!;
        g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, e.w, e.h); g.setTransform(r.k, 0, 0, r.k, 0, 0);
        r.draw(new Pen(g));
        e.tex.needsUpdate = true;
        this.live.set(key, e);
      }
      for (const r of rs) r.tex = e.tex;
    }
    this.reqs = [];
  }
}

// ---------------- sprite meshes ----------------
const blank = (() => { const c = document.createElement("canvas"); c.width = c.height = 2; return new THREE.CanvasTexture(c); })();
export const SU = 0.00216; // metres per design unit: 1000 units = 2.16 m
export const SU_SWING = 2.3 / 1830; // swing canvas: rope of 1830 units = 2.3 m
const BODY = (() => { const g = new THREE.PlaneGeometry(600 * SU, 1000 * SU); g.translate(0, (975 - 500) * SU, 0); return g; })();
const CARD = new THREE.PlaneGeometry(1, 1);
/** world roots that hold actors (to find the scene's sun when world.ts does not pass it) */
const ROOTS = new Set<THREE.Object3D>();

/** lit flat character: cardShade() material, receives shadows (dims to the bright floor only), casts its silhouette
 *  when world.ts says so (golden). Drawn after the contact blobs (renderOrder 1). */
export class Actor {
  mesh: THREE.Mesh; mat: THREE.MeshLambertMaterial; dmat: THREE.MeshDepthMaterial; r: Req | null = null;
  constructor(parent: THREE.Object3D, geo: THREE.BufferGeometry = BODY) {
    this.mat = cardShade(new THREE.MeshLambertMaterial({ map: blank, alphaTest: 0.5, side: THREE.DoubleSide }));
    this.mat.alphaToCoverage = false; // A2C + MSAA left 1 px sky-depth seams on blurred far cards (POST)
    this.dmat = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: blank, alphaTest: 0.5, side: THREE.DoubleSide });
    this.mesh = new THREE.Mesh(geo, this.mat);
    this.mesh.customDepthMaterial = this.dmat;
    // rim width is in output pixels: tell the card shader the render height (1920 = 1080 x 1920 frame)
    this.mesh.onBeforeRender = (r) => { const rt = r.getRenderTarget(); CARD_K.uPx.value = (rt ? rt.height : r.domElement.height) / 1920; };
    this.mesh.castShadow = false; this.mesh.receiveShadow = true; this.mesh.visible = false;
    this.mesh.rotation.order = "YXZ"; this.mesh.renderOrder = 1; this.mesh.layers.set(NOINK);
    parent.add(this.mesh);
    ROOTS.add(parent);
  }
  bind() { const t = this.r?.tex; if (t) { this.mat.map = t; this.dmat.map = t; } }
}
/** unlit effect card: hard cut-out (ink drawings), soft see-through (dust, mist) or a multiply ground blob */
export class Fx {
  mesh: THREE.Mesh; mat: THREE.MeshBasicMaterial; soft: THREE.MeshBasicMaterial; blob: THREE.MeshBasicMaterial; r: Req | null = null;
  constructor(parent: THREE.Object3D) {
    this.mat = new THREE.MeshBasicMaterial({ map: blank, alphaTest: 0.5, side: THREE.DoubleSide });
    this.mat.alphaToCoverage = false; // A2C + MSAA left 1 px sky-depth seams on blurred far cards (POST)
    this.soft = new THREE.MeshBasicMaterial({ map: blank, transparent: true, depthWrite: false, side: THREE.DoubleSide });
    this.blob = blobMaterial(blank);
    this.mesh = new THREE.Mesh(CARD, this.mat);
    this.mesh.visible = false; this.mesh.layers.set(NOINK);
    parent.add(this.mesh);
  }
  use(soft: boolean) { this.mesh.material = soft ? this.soft : this.mat; }
  bind() {
    const t = this.r?.tex;
    if (!t) return;
    if (this.r!.key.includes("|blob|")) {
      // no mipmaps: at grazing views the mip chain averages the blob with its white surround and it fades out
      if (t.generateMipmaps) { t.generateMipmaps = false; t.minFilter = THREE.LinearFilter; t.needsUpdate = true; }
      this.blob.map = t; this.mesh.material = this.blob; this.mesh.renderOrder = 0.5;
    }
    else { this.mat.map = t; this.soft.map = t; this.mesh.renderOrder = 0; }
  }
}

// ---------------- placements ----------------
export type Place = {
  key: string; draw: (p: Pen) => void; x: number; y: number; z: number;
  scale?: number; mirror?: boolean; yaw?: number; geo?: "body" | "swing"; roll?: number; size?: [number, number, number];
};
export type FxPlace = { key: string; cw: number; ch: number; draw: (p: Pen) => void; x: number; y: number; z: number; w: number; h: number; flat?: boolean; rot?: number; soft?: boolean };
/** sun = world direction TOWARD the sun (optional: when absent the scene's shadow-casting light is used) */
export type CamInfo = { pos: THREE.Vector3; right: THREE.Vector3; sun?: THREE.Vector3 };

const hh = (i: number, s = 0) => { const v = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return v - Math.floor(v); };
const q = (v: number, n = 120) => Math.round(v * n) / n;
const vOf = (i: number) => (i * 7 + (i >> 2)) % 4;
/** head-shape seed: 7 shapes, so marching soldiers in step still share canvases */
const seedOf = (i: number) => ((i * 5 + 3) % 7) + 1;
/** drawing resolution by distance: [canvas w, h, scale from the 600 x 1000 design]; sized for the 1440 x 2560 final */
const tier = (d: number): [number, number, number] =>
  d < 3.2 ? [1800, 3000, 3.0] : d < 6.5 ? [1080, 1800, 1.8] : d < 16 ? [480, 800, 0.8] : [240, 400, 0.4];

// ---------------- light ----------------
const SUN = new THREE.Vector3(0.5, 0.75, -0.4).normalize();
const tmp = new THREE.Vector3();
let LNAME: "day" | "golden" | "night" = "day";
const sunOf = (root: THREE.Object3D) => {
  let s: THREE.DirectionalLight | null = null;
  root.traverse((o) => { if (!s && o instanceof THREE.DirectionalLight && o.castShadow) s = o; });
  return s as THREE.DirectionalLight | null;
};
/** the sun of the world that is calling: the attached root whose sun target sits on this camera's view axis */
const findSun = (cam: CamInfo, out: THREE.Vector3) => {
  if (cam.sun) return out.copy(cam.sun).normalize();
  let best: THREE.DirectionalLight | null = null, err = Infinity;
  for (const r of ROOTS) {
    if (!r.parent) continue;
    const s = sunOf(r);
    if (!s) continue;
    const d = tmp.copy(s.target.position).sub(cam.pos), e = Math.abs(d.dot(cam.right)) / (d.length() || 1);
    if (e < err) { err = e; best = s; }
  }
  return best ? out.copy(best.position).sub(best.target.position).normalize() : out;
};
/** canvas angle the sun comes FROM on an upright card facing the camera, in 45-degree steps (small texture cache) */
const light2D = (cam: CamInfo, mirror: boolean) => {
  const sx = SUN.dot(cam.right) * (mirror ? -1 : 1), sy = -SUN.y;
  return Math.round(Math.atan2(sy, sx) / (Math.PI / 4)) * (Math.PI / 4);
};

/** front / side view and mirroring for someone at (x, z) walking along (dx, dz); fs = foreshortening of the walk */
const viewOf = (cam: CamInfo, x: number, z: number, dx: number, dz: number) => {
  const tx = cam.pos.x - x, tz = cam.pos.z - z, tl = Math.hypot(tx, tz) || 1;
  const c = (tx * dx + tz * dz) / tl;
  return { side: c < 0.57, mirror: dx * cam.right.x + dz * cam.right.z < 0, fs: Math.round(Math.sqrt(Math.max(0, 1 - c * c)) * 20) / 20 };
};

// ---------------- life: blinks and reaction timing ----------------
/** reference expression and action changes land 0-3 f before the word onset */
const LEAD = 2 / FPS;
/** eyelid 0 open .. 1 shut. Reference: gaps 0.5-2.3 s, 4-frame blink half / shut / shut / half, plus a blink across
 *  every expression swap (the shut frames hide the swap) */
const LID = [0.5, 1, 1, 0.5];
const SWAPS: Record<number, number[]> = { 9: [T_SHOCK], 10: [T_HIT], 11: [T_MARIA] };
const lidAt = (t: number, i: number, swaps: number[] = []) => {
  const f = Math.round(t * FPS);
  for (const ts of swaps) { const k = f - Math.round((ts - LEAD) * FPS) + 1; if (k >= 0 && k < 4) return LID[k]; }
  let s = Math.round(-60 * hh(i, 9));
  for (let n = 0; s <= f && n < 400; n++) {
    const k = f - s;
    if (k >= 0 && k < 4) return LID[k];
    s += Math.round(15 + 54 * hh(i * 31 + n, 13)); // next blink 0.5-2.3 s later
  }
  return 0;
};
const fkey = (o: object) => JSON.stringify(o, (_k, v) => (typeof v === "number" ? q(v) : v));

type Who = { i: number; o: Outfit; okey: string };
/** one character drawing in the 600 x 1000 design space, sized by distance, lit from the scene's sun */
const person = (cam: CamInfo, who: Who, x: number, y: number, z: number, view: { side: boolean; mirror: boolean }, fo: FrontOpts, so: SideOpts, scale = 1): Place & { tierKey: string } => {
  const d = cam.pos.distanceTo(tmp.set(x, y + 1.2, z)) / scale;
  const [w, h, k] = tier(d);
  const mirror = view.side && view.mirror, light = light2D(cam, mirror), seed = seedOf(who.i);
  const f2: FrontOpts = { ...fo, light, seed }, s2: SideOpts = { ...so, light, seed };
  const key = view.side ? `S|${who.okey}|${fkey(s2)}` : `F|${who.okey}|${fkey(f2)}`;
  return {
    key, x, y, z, scale, mirror, tierKey: `${w}`,
    draw: (p) => (view.side ? bodySide(p, who.o, s2) : bodyFront(p, who.o, f2)),
    size: [w, h, k],
  };
};

/** ground shadow under a standing / sitting card (review rounds 2-4), multiply, blue-violet: a TIGHT contact pool right under
 *  the feet (~.5 on screen at the core) so nobody floats, plus by day (cards cast no real shadow) a lighter soft tail
 *  stretched AWAY from the sun, length ~1.6 m / tan(sun elevation), capped. Golden: world.ts casts real card shadows. */
const CONTACT: Record<"day" | "golden" | "night", [number, number, number]> = { day: [0.2, 0.21, 0.33], golden: [0.24, 0.2, 0.33], night: [0.2, 0.21, 0.33] };
const TAIL: [number, number, number] = [0.42, 0.44, 0.62];
const toSrgb = (v: number) => { const c = clamp01(v); return c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055; };
const hexOf = (c: [number, number, number], k: number) => "#" + c.map((v) => Math.round(255 * toSrgb(1 - (1 - v) * k)).toString(16).padStart(2, "0")).join("");
const blob = (out: Stage, x: number, y: number, z: number, sc = 1, k = 1) => {
  const hl = Math.hypot(SUN.x, SUN.z) || 1, ox = -SUN.x / hl, oz = -SUN.z / hl, rot = Math.atan2(-ox, -oz);
  if (LNAME === "day") {
    const el = Math.asin(Math.min(0.99, Math.max(0.1, SUN.y)));
    const len = Math.min(2.4, Math.max(0.5, 1.6 / Math.tan(el))) * sc, h = len + 0.55 * sc, c = 0.3 * h; // feet at v = .2 of the card
    const tc = hexOf(TAIL, k);
    out.fx.push({ key: `blob|shadow|${tc}`, cw: 128, ch: 256, draw: (p) => fxShadow(p, tc), x: x + ox * c, y: y + 0.018, z: z + oz * c,
      w: 0.72 * sc, h, flat: true, rot });
  }
  const cc = hexOf(CONTACT[LNAME], k);
  out.fx.push({ key: `blob|contact|${cc}`, cw: 128, ch: 128, draw: (p) => fxContact(p, cc), x: x + ox * 0.03 * sc, y: y + 0.022, z: z + oz * 0.03 * sc,
    w: 0.52 * sc, h: 0.4 * sc, flat: true, rot });
};

// ---------------- crowd by shot ----------------
export type Stage = { places: Place[]; fx: FxPlace[] };


// ---------------- cast: o bando de Lampião e as volantes ----------------
const INK_ = "#241726";
const LAMPIAO: Outfit = { jacket: "#d9c9a6", pants: "#4a3626", boots: "#3a2618", hat: "cangaco", belt: "#5b3a24", scarf: "#c0342c", glasses: true, skin: "#f0c8a0" };
const MARIA: Outfit = { jacket: "#ece0c8", pants: "#4a3626", boots: "#2e2018", hat: "cangaco", dress: "#a8362c", scarf: "#c0342c", skin: "#f5d0ab" };
const CORISCO: Outfit = { jacket: "#d9c9a6", pants: "#4a3626", boots: "#3a2618", hat: "cangaco", belt: "#5b3a24", scarf: "#c0342c", skin: "#a8724e", moustache: "#1e1410" };
const DADA: Outfit = { jacket: "#ece0c8", pants: "#4a3626", boots: "#2e2018", hat: "lenco", cap: "#c0342c", dress: "#b52e28", scarf: "#c0342c", skin: "#8a5a3c" };
const CANG = (v: number): Outfit => ({ ...[LAMPIAO, CORISCO][v % 2], glasses: false, moustache: v % 3 === 0 ? "#1e1410" : undefined, skin: ["#c99067", "#a8724e", "#e8bc92"][v % 3] });
const SOLD_SKIN = ["#f0c8a0", "#c99067", "#a8724e", "#e8bc92"];
const SOLDIER = (v: number): Outfit => ({ jacket: "#8a8455", pants: "#7a7448", boots: "#241a14", hat: "cap", cap: "#7c7648", belt: "#5b3a24", rifle: true, skin: SOLD_SKIN[v % 4], moustache: v % 2 ? "#1e1410" : undefined });
const TOWN = (v: number): Outfit => v % 3 === 2
  ? { jacket: ["#e8dcc0", "#d9c7a0"][v % 2], pants: "#5b4a3a", boots: "#3a2618", hat: "hair", hair: "#2a201a", dress: ["#5a7fa8", "#9a6a8a", "#c08a3a"][v % 3], skin: SOLD_SKIN[v % 4] }
  : { jacket: ["#e8e0cc", "#c9b48a", "#8a9aa8", "#b58a6a"][v % 4], pants: ["#5b4a3a", "#3b3f52"][v % 2], boots: "#3a2618", hat: v % 2 ? "cap" : "hair", cap: "#d9c7a0", hair: "#2a201a", skin: SOLD_SKIN[(v + 1) % 4], moustache: v % 4 === 1 ? "#2a201a" : undefined };
const fh = (t: number) => Math.round(t * FPS);
const front = (cam: CamInfo, out: Stage, who: Who, x: number, z: number, fo: FrontOpts, sc = 1, y = D0) => {
  out.places.push(person(cam, who, x, y, z, { side: false, mirror: false }, fo, {}, sc));
  blob(out, x, D0, z, sc);
};
/** a muzzle flash at a soldier's rifle (side view, aiming to +x) */
const muzzle = (cam: CamInfo, out: Stage, x: number, z: number, t: number, i: number, n: number) => {
  GUNSHOTS.forEach((g, k) => {
    if (k % n !== i) return;
    const d = t - g;
    if (d < 0 || d >= 0.1) return;
    const u = q(d / 0.1, 3);
    out.fx.push({ key: `muzzle${u}`, cw: 500, ch: 500, draw: (p) => fxBurst(p, u, "#ffd27a", 9, 30, 200), x: x + cam.right.x * 0.72, y: D0 + 1.2, z: z + cam.right.z * 0.72, w: 0.75, h: 0.75 });
  });
};
/** dust kicked up by bullets around the camp */
const dust = (out: Stage, t: number, spots: [number, number][]) => {
  GUNSHOTS.forEach((g, k) => {
    const d = t - g - 0.08;
    if (d < 0 || d >= 0.5) return;
    const [x, z] = spots[k % spots.length], u = q(d / 0.5, 15);
    out.fx.push({ key: `puff${u}`, cw: 300, ch: 300, draw: (p) => fxPuff(p, u), x, y: D0 + 0.35, z, w: 1.1, h: 1.1, soft: true });
  });
};
const campfire = (out: Stage, t: number) => {
  const u = q((t * 6) % 1, 8);
  out.fx.push({ key: `flame${u}`, cw: 300, ch: 400, draw: (p) => fxFlame(p, u * 3), x: 0.2, y: D0 + 0.45, z: -1.2, w: 0.75, h: 1.0 });
};
/** where the band rests in the camp (x, z, outfit) */
const CAMP: [number, number, Outfit, string][] = [[-2.1, 0.4, CORISCO, "cor"], [-0.6, 0.6, MARIA, "maria"], [0.9, 0.2, LAMPIAO, "lamp"], [2.3, 0.9, CANG(1), "c1"], [-3.4, 1.8, CANG(2), "c2"], [3.4, 2.0, CANG(3), "c3"]];
/** someone shot: stands (expr), staggers on t0 ("fall" pose), then lies still with the eyes shut */
const struck = (cam: CamInfo, out: Stage, who: Who, x: number, z: number, t: number, t0: number, expr: Expr) => {
  if (t < t0) { front(cam, out, who, x, z, { mode: "stand", expr, blink: lidAt(t, who.i, [t0]), facing: 0 }); return; }
  const k = (t - t0) * FPS;
  if (k < 7) {
    front(cam, out, who, x, z, { mode: "fall", expr: "pained", blink: 0, tilt: -6 * k });
    if (k < 5) { const u = q(k / 5, 5); out.fx.push({ key: `hit${u}`, cw: 500, ch: 500, draw: (p) => fxBurst(p, u, "#fff3b0", 10, 30, 210), x: x + 0.15, y: D0 + 1.2, z: z - 0.2, w: 1.3, h: 1.3 }); }
    return;
  }
  const pl = person(cam, who, x, D0 + 0.2, z, { side: false, mirror: false }, { mode: "stand", expr: "neutral", blink: 1 }, {});
  out.places.push({ ...pl, roll: Math.PI / 2 - 0.06 });
  blob(out, x + 1.0, D0, z, 1.4, 0.7);
};

// ---------------- o lutador, o carro e a árvore ----------------
const FIGHTER: Outfit = { jacket: "#1f8a4c", pants: "#23408e", boots: "#2a1f1a", hat: "samurai", hair: "#1e1612", sash: "#f2c230", skin: "#c99067" };
const ease = (u: number) => { const x = clamp01(u); return x * x * (3 - 2 * x); };
const eo = (u: number) => 1 - (1 - clamp01(u)) ** 3;
const sett = (tt: number, w = 18, d = 6) => (tt < 0 ? 0 : Math.exp(-d * tt) * Math.cos(w * tt));
const dot = (col: string, core: string) => (p: Pen) => { p.ell(32, 32, 30, 30, col, 0); p.ell(32, 32, 14, 14, core, 0); };
/** ballistic burst of n particles from (x, y, z) at time tt after the event */
const burst = (out: Stage, key: string, draw: (p: Pen) => void, tt: number, x: number, y: number, z: number, n: number, seed: number,
  dir: [number, number], sp: [number, number], life: number, size: number, rest = false) => {
  for (let i = 0; i < n; i++) {
    const L = life * (0.6 + 0.4 * hh(i, seed)); if (tt < 0 || (!rest && tt > L)) continue;
    const a = dir[0] + (hh(i, seed + 1) - 0.5) * dir[1], v = sp[0] + (sp[1] - sp[0]) * hh(i, seed + 2), vz = (hh(i, seed + 3) - 0.5) * 2;
    const tc = Math.min(tt, L);
    let py = y + Math.sin(a) * v * tc - 4.9 * tc * tc; const px = x + Math.cos(a) * v * tc, pz = z + vz * tc;
    if (py < D0 + 0.03) { if (!rest) continue; py = D0 + 0.03; }
    const s2 = rest ? size : size * (1 - 0.6 * tc / L);
    out.fx.push({ key, cw: 64, ch: 64, draw, x: px, y: py, z: pz, w: s2, h: s2 });
  }
};
/** a soft lit cloud puff: overlapping circles, light from the upper left, dark underside */
const smokeDraw = (v: number, al: number, rgb: [number, number, number]) => (p: Pen) => {
  const n = 9;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * 6.28 + v, d = 40 + 18 * Math.sin(i * 2.3 + v), x = 128 + d * Math.cos(a), y = 128 + d * 0.8 * Math.sin(a), r = 46 + 14 * Math.sin(i * 1.7 + v * 2);
    const lift = 1.15 - 0.35 * ((y - 80) / 100);
    p.ell(x, y, r, r, `rgba(${Math.round(rgb[0] * lift)},${Math.round(rgb[1] * lift)},${Math.round(rgb[2] * lift)},${(al * 0.75).toFixed(2)})`, 0);
  }
  p.ell(110, 110, 60, 52, `rgba(${Math.min(255, rgb[0] + 50)},${Math.min(255, rgb[1] + 50)},${Math.min(255, rgb[2] + 50)},${(al * 0.35).toFixed(2)})`, 0);
};
const batida = (cam: CamInfo, out: Stage, t: number) => {
  const f = t * FPS, cp = carPose(t), tc = t - T_CRASH, R = cam.right;
  // ---- the driver ----
  let fo: FrontOpts, px: number, py: number, pz: number;
  if (t < T_EXIT) {
    // sits in the convertible; on impact the body keeps going (inertia), slams forward and springs back
    const lurch = tc > 0 ? 0.42 * Math.exp(-7 * tc) * Math.sin(Math.min(tc * 11, Math.PI * 1.5) + 0.0) : 0;
    [px, py, pz] = carPoint(cp, 0.4, 0.66, -0.25 + lurch);
    const expr: Expr = t < 1.5 ? (Math.floor(f / 4) % 2 ? "whistle" : "smile") : t < T_CRASH ? "shock" : tc < 0.2 ? "pained" : t < 3.9 ? "dazed" : "stern";
    const crouchUp = ease((t - 4.05) / 0.25);
    fo = { mode: "sit", expr, blink: lidAt(t, 1), tilt: Math.round((-30 * Math.max(0, lurch) / 0.42 + 4 * crouchUp) * 2) / 2, headTilt: Math.round(10 * sett(tc, 12, 4)), facing: 0 };
    void crouchUp;
  } else {
    const [sx0, sy0, sz0] = carPoint(carPose(T_EXIT), 0.4, 0.66, -0.25);
    const lx = TX - 2.3, lz = sz0, tj = t - T_EXIT, J = 0.45;
    if (tj < J) {
      // the jump out: a projectile arc, arms up, legs tucked
      const u = tj / J; px = sx0 + (lx - sx0) * u; pz = sz0 + (lz - sz0) * u; py = sy0 * (1 - u) + 4 * 0.8 * u * (1 - u);
      fo = { mode: "stand", expr: "stern", blink: 0, crouch: 0.25, stance: 0.4, armB: 0.9, tilt: -8, headTilt: -4 };
    } else {
      const tl = tj - J;                  // landed: squash into a deep crouch, spring up over ~10 frames
      const walk = clamp01((t - 5.1) / 0.9);
      px = lx + (SX - lx) * ease(walk); pz = lz + (SZ - lz) * ease(walk); py = D0;
      const crouch = tl < 0.4 ? 0.7 * Math.exp(-6 * tl) + 0.1 : 0.15;
      if (t < 5.1) fo = { mode: "stand", expr: "stern", blink: lidAt(t, 1), crouch, stance: 0.7, armB: 0.5 * Math.exp(-5 * tl), tilt: Math.round(6 * sett(tl, 14, 5) * 2) / 2 };
      else if (t < 6.0) fo = { mode: walk < 1 ? "march" : "stand", phase: ((t * 2.2) % 1 + 1) % 1, lift: 90, expr: "pained", blink: 0, tilt: -3, facing: -1, look: -1 };
      else {
        // draw (8 f, ease-out), aim, three shots: recoil snaps the hand up in 2 f and settles over ~6 f; the body rocks back
        let v = -1 + eo((t - T_DRAW) / 0.27), rock = 0;
        for (const g of SHOTS_AT) { const n = (t - g) * FPS; if (n >= 0 && n < 14) { v = n < 2 ? n / 2 : Math.exp(-(n - 2) / 3); rock = 4 * (n < 2 ? n / 2 : Math.exp(-(n - 2) / 3)); } }
        const end = t > 8.6;
        const expr: Expr = end ? (t > 9.1 ? "grin" : "whistle") : t < 6.9 ? "stern" : "pained";
        fo = { mode: "stand", expr, blink: lidAt(t, 1), facing: -1, look: -1, prop: ["pistol", end ? -0.35 : Math.round(v * 20) / 20], stance: 0.65, crouch: 0.2,
          tilt: Math.round((-4 + rock + (end ? 4 : 0)) * 2) / 2, hip: Math.round(-4 * rock) / 2 * 1, headTilt: end ? 6 : -2 };
      }
    }
  }
  out.places.push(person(cam, { i: 1, o: FIGHTER, okey: "lut" }, px, py, pz, { side: false, mirror: false }, fo, {}));
  if (t >= T_EXIT + 0.45) blob(out, px, D0, pz);
  // ---- crash: debris, smoke from the hood, falling leaves, landing dust ----
  const front = carPoint(carPose(Math.max(t, T_CRASH)), 0, 0.85, 1.6);
  if (tc >= 0) {
    burst(out, "deb", dot("#c8ccd4", "#ffffff"), tc, front[0], front[1], front[2], 16, 51, [Math.PI * 0.6, 2.2], [3, 6], 0.9, 0.09);
    burst(out, "debR", dot("#d23c2c", "#ff8a70"), tc, front[0], front[1], front[2], 8, 61, [Math.PI * 0.55, 2.0], [2.5, 5], 2.5, 0.1, true);
    if (tc < 0.25) { const u = q(tc / 0.25, 8); out.fx.push({ key: `hitc${u}`, cw: 500, ch: 500, draw: (p) => fxBurst(p, u, "#fff3b0", 12, 34, 220), x: front[0], y: front[1] + 0.2, z: front[2], w: 2.2, h: 2.2 }); }
    // dense dust cloud at the impact: 28 lit puffs expanding and drifting, fading over ~2.5 s
    for (let i = 0; i < 28; i++) {
      const age = tc - 0.02 * i; if (age < 0 || age > 2.6) continue;
      const a = hh(i, 140) * 6.28, d = (0.4 + 1.6 * hh(i, 141)) * (1 - Math.exp(-2.2 * age));
      const r = (0.5 + 0.5 * hh(i, 142)) * (0.7 + 1.6 * (1 - Math.exp(-1.6 * age)));
      const al = q(Math.min(1, 1.25 * (1 - age / 2.6) ** 1.2), 10), v = i % 3;
      out.fx.push({ key: `dust${v}_${al}`, cw: 256, ch: 256, draw: smokeDraw(v, al, [176, 158, 132]), x: front[0] + Math.cos(a) * d - 0.4, y: D0 + 0.35 + r * 0.45 + 0.25 * age, z: front[2] + Math.sin(a) * d * 0.7, w: 2 * r, h: 2 * r, soft: true, rot: hh(i, 143) * 6 });
    }
    // grey smoke pouring from the hood: a puff every 0.15 s, rising, growing, darker core
    for (let k = 0; k < 44; k++) {
      const age = tc - 0.25 - k * 0.15; if (age < 0 || age > 2.2) continue;
      const al = q(0.75 * (1 - age / 2.2), 10), v = k % 3, r = 0.35 + 0.75 * age;
      out.fx.push({ key: `smk${v}_${al}`, cw: 256, ch: 256, draw: smokeDraw(v, al, [120, 120, 126]), x: front[0] - 0.15 + 0.35 * age + 0.1 * Math.sin(k), y: front[1] + 0.15 + 0.9 * age, z: front[2] - 0.35, w: 2 * r, h: 2 * r, soft: true, rot: k * 0.7 });
    }
  }
  // leaves: shaken loose by the crash (24) and by every shot (6), fluttering down
  const leaf = dot("#6fae44", "#9ad468");
  const leaves = (t0: number, n: number, seed: number) => {
    for (let i = 0; i < n; i++) {
      const tt = t - t0 - 0.05 * i; if (tt < 0 || tt > 3.2) continue;
      const x0 = TX + (hh(i, seed) - 0.5) * 3.5, z0 = TZ + (hh(i, seed + 1) - 0.5) * 3.5, y = D0 + 3.6 + hh(i, seed + 2) * 1.5 - 1.25 * tt;
      if (y < D0 + 0.05) continue;
      out.fx.push({ key: "leaf", cw: 64, ch: 64, draw: leaf, x: x0 + 0.35 * Math.sin(3 * tt + i), y, z: z0 + 0.2 * Math.cos(2.5 * tt + i), w: 0.13, h: 0.09, rot: Math.sin(4 * tt + i) });
    }
  };
  leaves(T_CRASH, 24, 70);
  SHOTS_AT.forEach((g, k) => leaves(g + 0.05, 6, 80 + k * 7));
  // ---- the shots: muzzle flash, bark chips flying off the trunk, a bullet hole that stays, shell casings ----
  SHOTS_AT.forEach((g, k) => {
    const tt = t - g; if (tt < 0) return;
    const hx = SX + R.x * 0.95, hz = SZ + R.z * 0.95, hy = D0 + 1.2;
    if (tt < 0.1) { const u = q(tt / 0.1, 3); out.fx.push({ key: `muzzle${u}`, cw: 500, ch: 500, draw: (p) => fxBurst(p, u, "#ffd27a", 9, 30, 200), x: hx + R.x * 0.25, y: hy, z: hz + R.z * 0.25, w: 0.8, h: 0.8 }); }
    const bx = TX - 0.42, by = D0 + 1.35 + 0.25 * (k - 1), bz = TZ + 0.25 + 0.1 * k;
    burst(out, "chip", dot("#8a6440", "#c49a6c"), tt - 0.02, bx, by, bz, 9, 90 + k * 5, [Math.PI * 0.85, 1.4], [2, 4.5], 0.8, 0.07);
    if (tt > 0.02) out.fx.push({ key: "hole", cw: 64, ch: 64, draw: dot("#2a1c12", "#140c08"), x: bx - 0.02, y: by, z: bz, w: 0.09, h: 0.09 });
    burst(out, "shell", dot("#d9a441", "#ffe08a"), tt, hx - R.x * 0.2, hy + 0.05, hz - R.z * 0.2, 1, 120 + k, [Math.PI * 0.62, 0.2], [2.2, 2.6], 0.55, 0.05, true);
  });
};

export const stage = (id: number, t: number, cam: CamInfo): Stage => {
  const out: Stage = { places: [], fx: [] };
  const s = SHOTS[id - 1];
  LNAME = s.light;
  findSun(cam, SUN);
  const IZ = INTRO_Z;
  switch (s.crowd) {
    case "drive": case "crash": case "wreck": case "out": case "wide": { batida(cam, out, t); break; }
    case "intro": {
      front(cam, out, { i: 1, o: LAMPIAO, okey: "lamp" }, 0, IZ, { mode: "stand", expr: "stern", blink: lidAt(t, 1), facing: 0 });
      front(cam, out, { i: 2, o: MARIA, okey: "maria" }, -1.7, IZ + 3.2, { mode: "stand", expr: "neutral", blink: lidAt(t, 2), facing: 1 });
      front(cam, out, { i: 3, o: CORISCO, okey: "cor" }, 1.8, IZ + 3.6, { mode: "stand", expr: "stern", blink: lidAt(t, 3), facing: -1 });
      front(cam, out, { i: 4, o: DADA, okey: "dada" }, 3.3, IZ + 5.2, { mode: "stand", expr: "neutral", blink: lidAt(t, 4), facing: -1 });
      break;
    }
    case "walk": {
      const t0 = s.a / FPS, line: [Outfit, string][] = [[LAMPIAO, "lamp"], [MARIA, "maria"], [CORISCO, "cor"], [DADA, "dada"], [CANG(1), "c1"], [CANG(2), "c2"], [CANG(4), "c4"]];
      line.forEach(([o, okey], i) => {
        const x = -3 + (t - t0) * 1.3 - i * 1.7, z = IZ + 9 + (i % 2) * 0.8;
        const ph = (((t - t0) * 0.9 + i * 0.13) % 1 + 1) % 1, view = viewOf(cam, x, z, 1, 0);
        const so: SideOpts = { phase: ph, expr: i ? "neutral" : "stern", mode: "march", blink: lidAt(t, 10 + i), stomp: 0.7, stride: view.fs * 0.8 };
        const fo: FrontOpts = { phase: ph, expr: "neutral", mode: "stroll", blink: lidAt(t, 10 + i) };
        out.places.push(person(cam, { i: 10 + i, o, okey }, x, D0, z, view, fo, so));
        blob(out, x, D0, z);
      });
      break;
    }
    case "dawn": {
      const shock = t >= 12.1;
      CAMP.forEach(([x, z, o, okey], i) => {
        if (okey === "lamp") front(cam, out, { i: 1, o, okey }, x, z, { mode: "stand", expr: shock ? "shock" : "stern", blink: lidAt(t, 1, [12.1]) });
        else front(cam, out, { i: 20 + i, o, okey }, x, z, { mode: "sit", expr: shock ? "nervous" : "neutral", blink: lidAt(t, 20 + i), facing: x < 0 ? 1 : -1 });
      });
      break;
    }
    case "river": {
      front(cam, out, { i: 1, o: LAMPIAO, okey: "lamp" }, 0, 108.4, { mode: "stand", expr: "stern", blink: lidAt(t, 1), facing: 0 });
      front(cam, out, { i: 2, o: MARIA, okey: "maria" }, -1.25, 108.9, { mode: "stand", expr: "smile", blink: lidAt(t, 2), facing: 1 });
      break;
    }
    case "rest": {
      CAMP.forEach(([x, z, o, okey], i) => {
        const expr: Expr = (["smile", "smile_closed", "neutral", "grin", "neutral", "smile"] as Expr[])[i];
        front(cam, out, { i: 20 + i, o, okey }, x, z, { mode: "sit", expr, blink: lidAt(t, 20 + i), facing: x < 0 ? 1 : -1 });
      });
      break;
    }
    case "watch": {
      campfire(out, t);
      CAMP.slice(0, 4).forEach(([x, z, o, okey], i) => front(cam, out, { i: 20 + i, o, okey }, x, z, { mode: "sit", expr: "neutral", blink: i % 2 ? 1 : lidAt(t, 20 + i) }));
      const x = -5.3, z = -16.5, view = { side: true, mirror: false };
      out.places.push(person(cam, { i: 40, o: SOLDIER(1), okey: "s1" }, x, D0, z, view, {}, { mode: "stand", expr: "stern", blink: lidAt(t, 40) }));
      blob(out, x, D0, z);
      break;
    }
    case "creep": {
      const t0 = s.a / FPS;
      for (let i = 0; i < 7; i++) {
        const x = -4 + (t - t0) * 0.9 - i * 1.5, z = -25 - (i % 2) * 1.2, ph = (((t - t0) * 0.6 + i * 0.21) % 1 + 1) % 1;
        const view = viewOf(cam, x, z, 1, 0);
        out.places.push(person(cam, { i: 41 + i, o: SOLDIER(i), okey: `s${i % 4}` }, x, D0, z, view, { phase: ph, mode: "stroll", expr: "stern" },
          { phase: ph, mode: "march", expr: i % 3 ? "stern" : "neutral", blink: lidAt(t, 41 + i), stomp: 0.6, stride: view.fs * 0.6 }));
        blob(out, x, D0, z);
      }
      break;
    }
    case "aim": {
      const spots: [number, number][] = [[-10, -6], [-10.6, -3.6], [-9.6, -1.2], [-10.4, 1.4], [-9.8, 3.8]];
      spots.forEach(([x, z], i) => {
        const firing = t >= T_FIRE - 0.5;
        out.places.push(person(cam, { i: 50 + i, o: SOLDIER(i), okey: `s${i % 4}` }, x, D0, z, { side: true, mirror: false }, {},
          { mode: "stand", expr: "stern", blink: lidAt(t, 50 + i), aim: firing }));
        blob(out, x, D0, z);
        muzzle(cam, out, x, z, t, i, spots.length);
      });
      break;
    }
    case "surround": {
      campfire(out, t);
      CAMP.forEach(([x, z, o, okey], i) => front(cam, out, { i: 20 + i, o, okey }, x, z, { mode: "sit", expr: t > T_FIRE ? "shock" : "neutral", blink: lidAt(t, 20 + i) }));
      const k = smooth((t - 38.3) / 2.6), N = 12;
      for (let i = 0; i < N; i++) {
        const a = (i / N) * Math.PI * 2 + 0.2, r = 11 - 4.2 * k + (i % 2) * 0.6, x = Math.sin(a) * r, z = 0.4 + Math.cos(a) * r;
        const walking = k < 0.98, ph = ((t * 0.9 + i * 0.17) % 1 + 1) % 1;
        front(cam, out, { i: 50 + i, o: SOLDIER(i), okey: `s${i % 4}` }, x, z, { mode: walking ? "stroll" : "stand", phase: ph, expr: "stern", blink: lidAt(t, 50 + i) });
        GUNSHOTS.forEach((g, n) => {
          const d = t - g; if (n % 4 !== i % 4 || d < 0 || d >= 0.1) return;
          const u = q(d / 0.1, 3);
          out.fx.push({ key: `muzzle${u}`, cw: 500, ch: 500, draw: (p) => fxBurst(p, u, "#ffd27a", 9, 30, 200), x: x * 0.93, y: D0 + 1.15, z: 0.4 + (z - 0.4) * 0.93, w: 0.9, h: 0.9 });
        });
      }
      dust(out, t, [[-1.4, -0.8], [1.8, -0.5], [-3.0, 0.2], [0.4, 1.6], [2.8, -1.4]]);
      break;
    }
    case "surprise": {
      campfire(out, t);
      CAMP.forEach(([x, z, o, okey], i) => {
        const after = t >= T_SHOCK - 2 / FPS;
        front(cam, out, { i: 20 + i, o, okey }, x, z, { mode: after ? "stand" : "sit", expr: after ? (i % 2 ? "shock" : "nervous") : "neutral", blink: after ? lidAt(t, 20 + i, [T_SHOCK]) : 1, look: -1 });
      });
      dust(out, t, [[-1.4, -0.8], [1.8, -0.5], [-3.0, 0.2], [0.4, 1.6], [2.8, -1.4]]);
      break;
    }
    case "lampiao": {
      front(cam, out, { i: 60, o: { ...LAMPIAO, rifle: true }, okey: "lampR" }, -1.9, 1.8, { mode: "stand", expr: "shock", blink: lidAt(t, 61) });
      struck(cam, out, { i: 1, o: { ...LAMPIAO, rifle: true }, okey: "lampR" }, 0.4, 0.4, t, T_HIT, "stern");
      dust(out, t, [[1.6, 1.2], [-0.8, 1.0], [1.2, -0.6]]);
      break;
    }
    case "maria": {
      struck(cam, out, { i: 2, o: MARIA, okey: "maria" }, -0.6, 0.6, t, T_MARIA, "shock");
      dust(out, t, [[0.8, 1.4], [-1.8, 1.1], [0.3, -0.4]]);
      break;
    }
    case "hats": {
      for (let i = 0; i < 11; i++) {
        const x = -5 + i * 1.0 + (hash2(i) - 0.5) * 0.3, z = -3 + (hash2(i + 9) - 0.5) * 0.8;
        out.fx.push({ key: "hat", cw: 400, ch: 220, draw: (p) => fxHat(p), x, y: D0 + 0.14, z, w: 0.62, h: 0.34, rot: (hash2(i + 3) - 0.5) * 0.3 });
      }
      break;
    }
    case "town": {
      const cx = TOWN_X, cz = 20;
      for (let i = 0; i < 11; i++) {
        const k = Math.floor(i / 6), j = i % 6, x = cx - 4 + j * 1.6 + k * 0.8, step = 2 + k, y = D0 + 0.35 * (step + 1), z = cz - 4 + step * 1.0 + 0.4;
        out.fx.push({ key: "hat", cw: 400, ch: 220, draw: (p) => fxHat(p), x, y: y + 0.16, z, w: 0.62, h: 0.34 });
      }
      const crowd: [number, number][] = [[cx - 9, 6], [cx - 7.6, 5.2], [cx - 6.2, 6.4], [cx - 4.6, 5.0], [cx - 3.0, 6.2], [cx - 8.4, 3.4], [cx - 5.4, 3.6], [cx - 2.2, 3.2]];
      crowd.forEach(([x, z], i) => front(cam, out, { i: 70 + i, o: TOWN(i), okey: `t${i}` }, x, z,
        { mode: "stand", expr: (["shock", "nervous", "stern", "neutral", "shock", "nervous", "stern", "neutral"] as Expr[])[i], blink: lidAt(t, 70 + i), look: 1, facing: 1 }));
      ([[cx + 7.5, 13.5], [cx - 7.6, 13.2]] as [number, number][]).forEach(([x, z], i) => front(cam, out, { i: 80 + i, o: SOLDIER(i + 1), okey: `s${(i + 1) % 4}` }, x, z, { mode: "stand", expr: "stern", blink: lidAt(t, 80 + i) }));
      break;
    }
    case "end": {
      out.fx.push({ key: "hat", cw: 400, ch: 220, draw: (p) => fxHat(p), x: 0, y: D0 + 0.98, z: VIEW_Z, w: 0.7, h: 0.38 });
      break;
    }
  }
  return out;
};
const hash2 = (i: number) => hh(i, 3);
export { FPS, smooth, clamp01, INK_ };
