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
import { FPS, D0, SHOTS, V3, smooth, clamp01, T_FIRE, T_SHOCK, T_HIT, T_MARIA, GUNSHOTS, SX, SZ, banditX, physT, TX, TZ, carPose, carPoint, T_CRASH, T_EXIT, T_DRAW, SHOTS_AT, driverBody, walkAt, SPOT, MUZZLE, HIT, T_LAND, T_UP, T_WALK, T_WALK_END, T_IMPACT, T_CRACK, treeFall, fallDir, T_TREE_DOWN, sideN, PT, ES, VZ, SEPE_WALK, TF, XF, ZH, horseAt, sepeThrown, T_SLAND, SEPE_REST, HILL, marchZ, CX, CZ, INTRO_Z, TOWN_X, VIEW_Z } from "./story";
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
    this.soft = new THREE.MeshBasicMaterial({ map: blank, transparent: true, depthWrite: true, alphaTest: 0.3, side: THREE.DoubleSide }); // dense core writes depth: hides the ink lines behind smoke
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
const pistolDraw = (p: Pen) => { p.poly([[10, 26], [52, 26], [52, 34], [24, 34], [20, 50], [10, 50]], "#2c2f36", 3); };
const batida = (cam: CamInfo, out: Stage, t: number) => {
  const f = t * FPS, cp = carPose(t), tc = t - T_CRASH, R = cam.right, B = driverBody(t);
  const blink = lidAt(t, 1), front = { side: false, mirror: false };
  const lookTo = (x: number, z: number, tx: number, tz: number) => ((tx - x) * R.x + (tz - z) * R.z > 0 ? -1 : 1) as -1 | 1;
  let x = B.x, y = B.y, z = B.z;
  // ---------- the driver ----------
  if (B.ph === "seat") {
    const expr: Expr = t < T_CRASH - 0.45 ? (Math.floor(f / 4) % 2 ? "whistle" : "smile") : "shock";
    out.places.push(person(cam, { i: 1, o: FIGHTER, okey: "lut" }, x, y, z, front, { mode: "sit", expr, blink, headTilt: t > T_CRASH - 0.45 ? -6 : 0 }, {}));
  } else if (B.ph === "fly" || B.ph === "slide" || B.ph === "lie" || B.ph === "up") {
    // the body turns about its own centre (not about the feet): place the card so its centre C stays where physics puts it
    const H = 0.85, th = Math.round(B.roll * 30) / 30;
    const put = (cx: number, cy: number, cz: number, fo: FrontOpts) => {
      const pl = person(cam, { i: 1, o: FIGHTER, okey: "lut" }, cx + R.x * H * Math.sin(th), cy - H * Math.cos(th), cz + R.z * H * Math.sin(th), front, fo, {});
      out.places.push({ ...pl, roll: th });
    };
    if (B.ph === "fly") {
      // thrown by inertia: limp tumbling body, face in shock, mouth flapping
      const u = clamp01((t - T_CRASH) / (T_LAND - T_CRASH));
      put(x, y + 0.7 * (1 - u) + 0.25 * u, z, { mode: "fall", expr: Math.floor(f / 3) % 2 ? "shock" : "pained", blink: 0 });
      blob(out, x, D0, z, 0.8, Math.max(0.2, 1 - y / 3));
    } else if (B.ph !== "up") {
      // face down in the dirt, dazed: eyes spiral, a slow head wobble; comes to (blinks, grimace) before getting up
      put(x, 0.25 + y, z, { mode: "stand", expr: t < T_UP - 0.35 ? "dazed" : "pained", blink: t < T_UP - 0.35 ? 0 : blink, headTilt: Math.round(4 * Math.sin(t * 5)) });
      blob(out, x, D0, z, 1.4, 0.7);
    } else {
      // pushes himself up: the body swings upright about its centre while the knees straighten
      const u = clamp01((t - T_UP) / 0.5);
      put(x, 0.25 + (H - 0.25) * u * u * (3 - 2 * u), z, { mode: "stand", expr: "pained", blink, crouch: Math.round((0.75 - 0.6 * u) * 20) / 20, stance: 0.5, armB: 0.6 * (1 - u) });
      blob(out, x, D0, z);
    }
  } else {
    let fo: FrontOpts | null = null;
    if (t < T_WALK) {
      // standing: shakes his head clear (decaying), then the anger sets in
      const k = t - T_UP - 0.5;
      fo = { mode: "stand", expr: k < 0.3 ? "dazed" : "stern", blink, headTilt: Math.round(12 * Math.exp(-4 * k) * Math.sin(k * 26)), crouch: 0.15, stance: 0.4 };
    } else if (t < T_WALK_END) {
      // a real walk: one foot always on the ground, the body moves exactly one stride per step (no skating, no hopping)
      const [wx, wz] = walkAt(t), [px2, pz2] = walkAt(t - 0.02), dx = wx - px2, dz = wz - pz2, sp = Math.hypot(dx, dz) || 1e-6;
      x = wx; z = wz;
      let dist = 0; for (let tt = T_WALK; tt < t; tt += 0.02) { const a2 = walkAt(tt), b2 = walkAt(tt + 0.02); dist += Math.hypot(b2[0] - a2[0], b2[1] - a2[1]); }
      const view = viewOf(cam, x, z, dx / sp, dz / sp), ph = (dist / 1.6) % 1;
      out.places.push(person(cam, { i: 1, o: FIGHTER, okey: "lut" }, x, 0, z, view, { mode: "stroll", phase: ph, lift: 28, expr: "stern", blink },
        { mode: "march", phase: ph, stride: Math.max(0.3, view.fs), stomp: 0.12, expr: "stern", blink }));
      blob(out, x, D0, z);
    } else {
      x = SPOT[0]; z = SPOT[1];
      const startle = T_CRACK + 0.15, sitAt = T_CRACK + 0.45;
      if (t < startle) {
        // draw (8 f, ease-out), aim, three shots: recoil snaps the hand up in 2 f and settles over ~6 f; the body rocks back
        let v = -1 + eo((t - T_DRAW) / 0.27), rock = 0;
        if (t < T_DRAW) v = -1;
        for (const g of SHOTS_AT) { const n = (t - g) * FPS; if (n >= 0 && n < 14) { v = n < 2 ? n / 2 : Math.exp(-(n - 2) / 3); rock = 4 * (n < 2 ? n / 2 : Math.exp(-(n - 2) / 3)); } }
        const expr: Expr = t < SHOTS_AT[0] - 0.2 ? "stern" : t < T_CRACK ? "pained" : "neutral";
        fo = { mode: "stand", expr, blink, facing: -1, look: -1, prop: ["pistol", Math.round(v * 20) / 20], stance: 0.65, crouch: 0.2,
          tilt: Math.round((-4 + rock) * 2) / 2, hip: Math.round(-4 * rock) / 2, headTilt: -2 + (t > T_CRACK ? 4 : 0) };
      } else if (t < sitAt) {
        // the startle: a jump of 4-5 frames, arms fly up, the pistol drops; then the legs give way into a squat
        const u = (t - startle) / (sitAt - startle);
        y = u < 0.45 ? 0.24 * Math.sin((u / 0.45) * Math.PI) : 0;
        fo = { mode: "stand", expr: "shock", blink: 0, armB: 1, look: lookTo(x, z, TX, TZ), crouch: u < 0.45 ? 0.1 : Math.round(((u - 0.45) / 0.55) * 18) / 20, stance: 0.6 };
      } else {
        // on his seat with a small bounce, then scoots back in pushes (fast push ~4 f, rest ~7 f), always staring at the tree
        const sn = sideN(), away = [sn[0] + 0.35 * (x - TX) / 3.2, sn[1] + 0.35 * (z - TZ) / 3.2], h = Math.hypot(away[0], away[1]); away[0] /= h; away[1] /= h;   // away from the fall line
        const ts = t - sitAt - 0.15, NP = 5, per = 0.36;
        let d = 0, lean = 0;
        for (let k = 0; k < NP; k++) { const u = (ts - k * per) / 0.13; d += 0.32 * clamp01(u) ** 0.7; if (u > 0 && u < 1.6) lean = -8 * Math.sin(Math.min(1, u) * Math.PI); }
        x += away[0] * d; z += away[1] * d;
        const bounce = t - sitAt < 0.2 ? 0.06 * Math.sin(((t - sitAt) / 0.2) * Math.PI) : 0;
        y = bounce;
        const pant = Math.floor(f / 5) % 2;
        const expr: Expr = t < T_TREE_DOWN + 0.6 ? (pant ? "shock" : "nervous") : pant ? "nervous" : "whistle";
        fo = { mode: "sit", expr, blink: t > T_TREE_DOWN + 0.8 ? blink : 0, look: lookTo(x, z, TX + fallDir[0] * 3, TZ + fallDir[1] * 3), tilt: Math.round(lean * 2) / 2,
          headTilt: Math.round(3 * Math.sin(t * 7)) };
      }
    }
    if (fo) { out.places.push(person(cam, { i: 1, o: FIGHTER, okey: "lut" }, x, y, z, front, fo, {})); blob(out, x, D0, z, 1.1); }
  }
  // ---------- crash: debris, dense dust, black smoke pouring from the hood ----------
  const fr = carPoint(carPose(Math.max(t, T_CRASH)), 0, 0.85, 1.6);
  if (tc >= 0) {
    burst(out, "deb", dot("#c8ccd4", "#ffffff"), tc, fr[0], fr[1], fr[2], 16, 51, [Math.PI * 0.6, 2.2], [3, 6], 0.9, 0.09);
    burst(out, "debR", dot("#d23c2c", "#ff8a70"), tc, fr[0], fr[1], fr[2], 8, 61, [Math.PI * 0.55, 2.0], [2.5, 5], 2.5, 0.1, true);
    if (tc < 0.25) { const u = q(tc / 0.25, 8); out.fx.push({ key: `hitc${u}`, cw: 500, ch: 500, draw: (p) => fxBurst(p, u, "#fff3b0", 12, 34, 220), x: fr[0], y: fr[1] + 0.2, z: fr[2], w: 2.4, h: 2.4 }); }
    for (let i = 0; i < 26; i++) {           // dust: brown, dense, rolling out low and settling
      const age = tc - 0.02 * i; if (age < 0 || age > 3.0) continue;
      const a = hh(i, 140) * 6.28, d = (0.4 + 1.4 * hh(i, 141)) * (1 - Math.exp(-2.2 * age)), r = (0.45 + 0.4 * hh(i, 142)) * (0.8 + 1.2 * (1 - Math.exp(-1.6 * age)));
      const al = q(Math.min(1, 1.3 * (1 - age / 3.0) ** 1.1), 10), v = i % 3;
      out.fx.push({ key: `dust${v}_${al}`, cw: 256, ch: 256, draw: smokeDraw(v, al, [150, 126, 96]), x: fr[0] + Math.cos(a) * d - 0.4, y: D0 + 0.3 + r * 0.4 + 0.2 * age, z: fr[2] + Math.sin(a) * d * 0.7, w: 2 * r, h: 2 * r, soft: true, rot: hh(i, 143) * 6 });
    }
    for (let k = 0; k < 90; k++) {           // smoke: near-black, opaque, a puff every 0.11 s, billowing up for the rest of the film
      const age = tc - 0.15 - k * 0.11; if (age < 0 || age > 2.6) continue;
      const al = q(Math.min(1, 1.2 * (1 - age / 2.6)), 10), v = k % 3, r = 0.4 + 0.85 * age;
      out.fx.push({ key: `smk${v}_${al}`, cw: 256, ch: 256, draw: smokeDraw(v, al, [46, 44, 50]), x: fr[0] - 0.15 + 0.4 * age + 0.12 * Math.sin(k), y: fr[1] + 0.1 + 1.0 * age, z: fr[2] - 0.35, w: 2 * r, h: 2 * r, soft: true, rot: k * 0.7 });
    }
  }
  // ---------- the driver lands: dust and pebbles from the contact ----------
  const tl = t - T_LAND;
  if (tl >= 0) {
    const L = driverBody(T_LAND);
    for (let i = 0; i < 12; i++) {
      const age = tl - 0.03 * i; if (age < 0 || age > 0.7) continue;
      const a = hh(i, 150) * 6.28, d = (0.3 + 0.9 * hh(i, 151)) * (1 - Math.exp(-3 * age)), r = (0.25 + 0.2 * hh(i, 152)) * (0.8 + 1.0 * (1 - Math.exp(-2 * age)));
      const al = q(Math.min(0.85, 1.1 * (1 - age / 0.7)), 10), v = i % 3;
      out.fx.push({ key: `dust${v}_${al}`, cw: 256, ch: 256, draw: smokeDraw(v, al, [150, 126, 96]), x: L.x + Math.cos(a) * d + 0.6, y: D0 + 0.2 + r * 0.4, z: L.z + Math.sin(a) * d * 0.7 + 0.3, w: 2 * r, h: 2 * r, soft: true });
    }
    burst(out, "peb", dot("#8a7a62", "#b8a888"), tl, L.x, 0.1, L.z, 14, 160, [Math.PI * 0.5, 2.4], [1.5, 3.5], 1.5, 0.05, true);
  }
  // ---------- leaves ----------
  const leaf = dot("#6fae44", "#9ad468");
  const leaves = (t0: number, n: number, seed: number, cx: number, cy: number, cz: number, spread: number) => {
    for (let i = 0; i < n; i++) {
      const tt = t - t0 - 0.04 * i; if (tt < 0 || tt > 3.2) continue;
      const x0 = cx + (hh(i, seed) - 0.5) * spread, z0 = cz + (hh(i, seed + 1) - 0.5) * spread, yy = cy + hh(i, seed + 2) * 1.5 - 1.2 * tt;
      if (yy < D0 + 0.05) continue;
      out.fx.push({ key: "leaf", cw: 64, ch: 64, draw: leaf, x: x0 + 0.35 * Math.sin(3 * tt + i), y: yy, z: z0 + 0.2 * Math.cos(2.5 * tt + i), w: 0.13, h: 0.09, rot: Math.sin(4 * tt + i) });
    }
  };
  leaves(T_CRASH, 24, 70, TX, D0 + 3.6, TZ, 3.5);
  [T_IMPACT, SHOTS_AT[1], SHOTS_AT[2]].forEach((g, k) => leaves(g + 0.05, 6, 80 + k * 7, TX, D0 + 3.6, TZ, 3.5));
  // ---------- shots: muzzle flame, smoke ring, chips + a hole on the trunk (until it cracks), casings ----------
  SHOTS_AT.forEach((g, k) => {
    const tt = t - g; if (tt < 0) return;
    if (tt < 0.1) { const u = q(tt / 0.1, 3); out.fx.push({ key: `muzzle${u}`, cw: 500, ch: 500, draw: (p) => fxBurst(p, u, "#ffb347", 10, 34, 230), x: MUZZLE[0], y: MUZZLE[1], z: MUZZLE[2], w: 1.3, h: 1.3 }); }
    if (tt < 0.6) { const al = q(0.7 * (1 - tt / 0.6), 6), r = 0.12 + 0.4 * tt; out.fx.push({ key: `ring${al}`, cw: 256, ch: 256, draw: smokeDraw(1, al, [200, 196, 190]), x: MUZZLE[0], y: MUZZLE[1] + 0.2 * tt, z: MUZZLE[2], w: 2 * r, h: 2 * r, soft: true }); }
    const hit = k === 0 ? T_IMPACT : g + 0.02, th = t - hit;
    const by = HIT[1] + 0.22 * (k - 1), bz = HIT[2] + 0.08 * k;
    burst(out, "chip", dot("#8a6440", "#c49a6c"), th, HIT[0], by, bz, 10, 90 + k * 5, [Math.PI * 0.85, 1.4], [2, 4.5], 0.8, 0.07);
    if (th >= 0 && th < 0.12) { const u = q(th / 0.12, 3); out.fx.push({ key: `hitw${u}`, cw: 500, ch: 500, draw: (p) => fxBurst(p, u, "#fff3b0", 9, 28, 200), x: HIT[0], y: by, z: bz, w: 0.9, h: 0.9 }); }
    if (th > 0 && t < T_CRACK) out.fx.push({ key: "hole", cw: 64, ch: 64, draw: dot("#2a1c12", "#140c08"), x: HIT[0] - 0.02, y: by, z: bz, w: 0.09, h: 0.09 });
    burst(out, "shell", dot("#d9a441", "#ffe08a"), tt, MUZZLE[0] - 0.5, MUZZLE[1] + 0.05, MUZZLE[2], 1, 120 + k, [Math.PI * 0.62, 0.2], [2.2, 2.6], 0.55, 0.05, true);
  });
  // ---------- the pistol drops when he startles ----------
  burst(out, "pistol", pistolDraw, t - T_CRACK - 0.18, SPOT[0] + 0.4, 1.1, SPOT[1], 1, 170, [Math.PI * 0.35, 0.1], [2.0, 2.2], 0.6, 0.28, true);
  // ---------- the tree comes down: a long dense dust wall along the trunk, a burst of leaves ----------
  const td = t - T_TREE_DOWN;
  if (td >= 0) {
    for (let i = 0; i < 30; i++) {
      const age = td - 0.015 * i; if (age < 0 || age > 3.0) continue;
      const s = 1 + 5.5 * hh(i, 180), a = hh(i, 181) * 6.28, d = 1.4 * hh(i, 182) * (1 - Math.exp(-2.5 * age)), r = (0.6 + 0.5 * hh(i, 183)) * (0.8 + 1.6 * (1 - Math.exp(-1.8 * age)));
      const al = q(Math.min(1, 1.3 * (1 - age / 3.0) ** 1.1), 10), v = i % 3;
      out.fx.push({ key: `dust${v}_${al}`, cw: 256, ch: 256, draw: smokeDraw(v, al, [150, 126, 96]), x: TX + fallDir[0] * s + Math.cos(a) * d, y: D0 + 0.3 + r * 0.4 + 0.15 * age, z: TZ + fallDir[1] * s + Math.sin(a) * d, w: 2 * r, h: 2 * r, soft: true, rot: hh(i, 184) * 6 });
    }
    leaves(T_TREE_DOWN, 40, 200, TX + fallDir[0] * 4.4, D0 + 2.0, TZ + fallDir[1] * 4.4, 4.5);
  }
  void treeFall;
};

// ================= Sepé Tiaraju (Guerra Guaranítica) =================
const GSKIN = ["#b07a4e", "#a06a44", "#c08858", "#9a6440"];
const SEPE: Outfit = { jacket: "#a8432c", pants: "#b07a4e", boots: "#6e4a30", hat: "headband", hair: "#1a1412", band: "#c0342c", paint: "#c0342c", necklace: true, sash: "#5a3a22", skin: "#b07a4e" };
const WARRIOR = (v: number): Outfit => ({ jacket: ["#c9a060", "#b8905a", "#d2ab6e", "#a8432c"][v % 4], pants: GSKIN[v % 4], boots: "#6e4a30", hat: "longhair", hair: "#1a1412", necklace: v % 2 === 0, sash: "#5a3a22", skin: GSKIN[v % 4], paint: v % 3 === 1 ? "#c0342c" : undefined });
const WOMAN: Outfit = { jacket: "#d9b98a", dress: "#b8432c", pants: "#b88a5c", boots: "#6e4a30", hat: "longhair", hair: "#1a1412", skin: "#b88a5c", necklace: true };
const PORT: Outfit = { jacket: "#2c4a8a", pants: "#efe6d2", boots: "#18181c", hat: "tricorn", belt: "#f4f0e6", buttons: "#d9a441", rifle: true, skin: "#f0c8a0" };
const ESP: Outfit = { jacket: "#b8322c", pants: "#efe6d2", boots: "#18181c", hat: "tricorn", belt: "#f4f0e6", buttons: "#d9a441", rifle: true, skin: "#e8bc92", moustache: "#2a1c14" };
const PRIEST: Outfit = { jacket: "#1e1e24", dress: "#1e1e24", pants: "#1e1e24", boots: "#18181c", hat: "hair", hair: "#3a2a20", cross: true, skin: "#f0c8a0" };
const FRONT = { side: false, mirror: false };
const fig = (cam: CamInfo, out: Stage, i: number, o: Outfit, key: string, x: number, z: number, fo: FrontOpts, y = D0, sc = 1) => {
  out.places.push(person(cam, { i, o, okey: key }, x, y, z, FRONT, fo, {}, sc)); blob(out, x, D0, z, sc);
};
/** looks toward a world point: -1 = screen right, 1 = screen left (card convention) */
const lookAt2 = (cam: CamInfo, x: number, z: number, tx: number, tz: number) => ((tx - x) * cam.right.x + (tz - z) * cam.right.z > 0 ? -1 : 1) as -1 | 1;
/** the Guarani at the plaza: the woman in the middle, warriors around, the Jesuit at the side */
const VILLAGE: [number, number, string][] = [[CX, VZ, "woman"], [CX - 1.3, VZ + 0.6, "w0"], [CX + 1.3, VZ + 0.5, "w1"], [CX - 2.6, VZ + 1.3, "w2"], [CX + 2.7, VZ + 1.4, "priest"], [CX - 0.6, VZ + 2.2, "w3"], [CX + 1.6, VZ + 2.4, "w4"]];
const village = (cam: CamInfo, out: Stage, t: number, mood: "calm" | "firm") => {
  VILLAGE.forEach(([x, z, k], i) => {
    const b = lidAt(t, 100 + i), hdt = Math.round(2 * Math.sin(t * 1.3 + i));
    if (k === "woman") fig(cam, out, 100 + i, WOMAN, "gw", x, z, { mode: "stand", expr: mood === "firm" ? "stern" : "neutral", blink: b, headTilt: hdt });
    else if (k === "priest") fig(cam, out, 100 + i, PRIEST, "pr", x, z, { mode: "stand", expr: "nervous", blink: b, headTilt: hdt, look: 1 });
    else { const v = Number(k.slice(1)), up = mood === "firm" ? 0.25 * smooth((t - 15.6 - 0.1 * v) / 0.3) : 0;
      fig(cam, out, 100 + i, WARRIOR(v), `gw${v}`, x, z, { mode: "stand", expr: "stern", blink: b, headTilt: hdt, prop: [v % 2 ? "bow" : "spear", Math.round(up * 20) / 20], stance: 0.3 }); }
  });
};
/** a soldier seen from the side aiming (side card), firing at the given times: flash at the muzzle, a dense white powder cloud */
const rifleman = (cam: CamInfo, out: Stage, i: number, o: Outfit, key: string, x: number, z: number, t: number, fires: number[], aim = true) => {
  out.places.push(person(cam, { i, o, okey: key }, x, D0, z, { side: true, mirror: false }, {}, { mode: "stand", expr: "stern", blink: lidAt(t, i), aim }));
  blob(out, x, D0, z);
  const mx = x + cam.right.x * 0.78, mz = z + cam.right.z * 0.78;
  for (const g of fires) {
    const d = t - g; if (d < 0 || d > 2.6) continue;
    if (d < 0.1) { const u = q(d / 0.1, 3); out.fx.push({ key: `mz${u}`, cw: 500, ch: 500, draw: (p) => fxBurst(p, u, "#ffd27a", 10, 30, 210), x: mx, y: D0 + 1.22, z: mz, w: 0.95, h: 0.95 }); }
    const al = q(Math.min(1, 1.1 * (1 - d / 2.6)), 10), r = 0.25 + 0.55 * (1 - Math.exp(-1.8 * d));
    out.fx.push({ key: `gun${(i % 3)}_${al}`, cw: 256, ch: 256, draw: smokeDraw(i % 3, al, [222, 218, 212]), x: mx + cam.right.x * 0.5 * d, y: D0 + 1.2 + 0.25 * d, z: mz + cam.right.z * 0.5 * d, w: 2 * r, h: 2 * r, soft: true });
  }
};
const arrowDraw = (p: Pen) => { p.stroke([[8, 16], [112, 16]], 3, "#6a4426"); p.poly([[112, 10], [126, 16], [112, 22]], "#8a9096", 1.5); p.poly([[8, 16], [20, 8], [26, 16], [20, 24]], "#f4efe6", 1); };
/** arrows in ballistic arcs from (x0,z0) to around (x1,z1) */
const arrows = (cam: CamInfo, out: Stage, t: number, t0: number, n: number, seed: number, x0: number, z0: number, x1: number, z1: number) => {
  for (let i = 0; i < n; i++) {
    const ts = t0 + i * 0.13, T = 0.9, u = (t - ts) / T; if (u < 0 || u > 1) continue;
    const ax = x0 + (hh(i, seed) - 0.5) * 6, az = z0 + hh(i, seed + 1) * 1.5, bx = x1 + (hh(i, seed + 2) - 0.5) * 6, bz = z1 + (hh(i, seed + 3) - 0.5) * 2;
    const x = ax + (bx - ax) * u, z = az + (bz - az) * u, y = 1.4 + 4.5 * u * (1 - u);
    const vx = bx - ax, vz = bz - az, vy = 4.5 * (1 - 2 * u);
    const sx = vx * cam.right.x + vz * cam.right.z, rot = Math.atan2(vy, sx);
    out.fx.push({ key: "arrow", cw: 128, ch: 32, draw: arrowDraw, x, y, z, w: 0.75, h: 0.19, rot });
  }
};
/** the horse, drawn side-on: gallop cycle (rotary gallop, legs as two-bone strokes) and a fall (front legs fold, nose down, rolls onto its side) */
const horseDraw = (ph: number, fall: number, left: boolean) => (p: Pen) => {
  const X = (x: number) => (left ? 900 - x : x), PS = (pts: [number, number][]) => pts.map(([x, y]) => [X(x), y] as [number, number]);
  const lie = Math.max(0, (fall - 0.45) / 0.55), pitch = fall < 0.45 ? (fall / 0.45) * 22 : 22 * (1 - lie);
  const cy = 300 + 60 * Math.min(1, fall / 0.45) + 110 * lie, cx = 450;
  const ang = ((left ? -1 : 1) * pitch * Math.PI) / 180;
  p.rot = ang ? [ang, X(cx), cy] : null;
  const coat = "#6e4126", dark = "#3a2214", hoof = "#2a1c14";
  // legs: [hip x, phase offset, near?]
  const legs: [number, number, boolean][] = [[355, 0.0, false], [385, 0.1, true], [560, 0.45, false], [590, 0.55, true]];
  for (const [hx, off, near] of legs) {
    const front = hx > 450, a = 2 * Math.PI * (ph + off);
    let th1 = (front ? 0.55 : -0.5) * Math.sin(a), th2 = (front ? -0.9 : 0.9) * Math.max(0, Math.sin(a + 1.2));
    if (fall > 0 && front && fall < 0.45) { th1 = 0.9 * (fall / 0.45); th2 = -2.2 * (fall / 0.45); }
    if (lie > 0) { th1 = (front ? 1.3 : -1.3) * lie + th1 * (1 - lie); th2 = 0.2 * (1 - lie); }
    const k: [number, number] = [hx + 115 * Math.sin(th1), cy + 70 + 115 * Math.cos(th1)], f2: [number, number] = [k[0] + 115 * Math.sin(th1 + th2), k[1] + 115 * Math.cos(th1 + th2)];
    const col = near ? coat : "#5a3420";
    p.stroke(PS([[hx, cy + 40], k, f2]), near ? 30 : 26, INK_); p.stroke(PS([[hx, cy + 40], k, f2]), near ? 22 : 18, col);
    p.ell(X(f2[0]), f2[1] + 6, 15, 10, hoof, 3);
  }
  p.ell(X(cx), cy, 190, 88, coat, 7);                                                                    // barrel
  p.ell(X(cx - 20), cy - 30, 120, 30, "rgba(255,220,180,0.18)", 0);                                    // sheen
  p.poly(PS([[580, cy - 50], [650, cy - 170], [700, cy - 190], [720, cy - 150], [640, cy - 10], [600, cy + 20]]), coat, 7);   // neck
  p.ell(X(735), cy - 160, 62, 32, coat, 7, 0, 360, (left ? 1 : -1) * 35);                                // head
  p.poly(PS([[690, cy - 205], [700, cy - 245], [712, cy - 200]]), coat, 5);                             // ear
  p.ell(X(770), cy - 140, 8, 6, dark, 0); p.ell(X(722), cy - 172, 7, 7, "#120c08", 0);                  // nostril, eye
  p.stroke(PS([[586, cy - 60], [640, cy - 165], [690, cy - 200]]), 22, dark);                           // mane
  const sw = Math.sin(2 * Math.PI * ph) * 25;
  p.stroke(PS([[262, cy - 30], [215, cy + 40 + sw], [205, cy + 140 + sw]]), 26, dark);                 // tail
  p.band(PS([[400, cy - 86], [520, cy - 86]]), "#5a3a22", 26, 4);                                      // saddle blanket
  p.rot = null;
};
const featherDraw = (p: Pen) => {
  p.poly([[20, 60], [120, 30], [230, 52], [120, 70]], "#f4efe6", 3); p.poly([[160, 40], [230, 52], [170, 62]], "#c0342c", 2); p.stroke([[10, 62], [228, 52]], 2.5, "#8a7a62");
};
const bandDraw = (p: Pen) => { p.ell(128, 128, 110, 70, null, 18); p.ell(128, 128, 110, 70, null, 0); p.arc(128, 128, 110, 70, 0, 360, 14, "#c0342c"); };
/** the thrown body, rotated about its centre (as in the crash study) */
const putBody = (cam: CamInfo, out: Stage, i: number, o: Outfit, key: string, cx: number, cy: number, cz: number, th: number, fo: FrontOpts) => {
  const H = 0.85, R = cam.right, pl = person(cam, { i, o, okey: key }, cx + R.x * H * Math.sin(th), cy - H * Math.cos(th), cz + R.z * H * Math.sin(th), FRONT, fo, {});
  out.places.push({ ...pl, roll: th });
};
const sepeStage = (cam: CamInfo, out: Stage, t: number, crowd: string) => {
  const f = t * FPS, B = lidAt(t, 1), breathe = Math.sin(t * 2.9);
  switch (crowd) {
    case "aerial": case "treaty": case "port": case "esp": case "reveal": {
      const ex: Expr = t < 3.4 ? "smile" : t < 5.0 ? "neutral" : "grin";
      const lookOther = t > 3.4 && t < 5.2;
      fig(cam, out, 10, PORT, "pt", PT[0], PT[1], { mode: "stand", expr: crowd === "port" ? "smile" : ex, blink: lidAt(t, 10), facing: lookOther ? 1 : 0, look: lookOther ? 1 : 0, headTilt: Math.round(2 * breathe), tilt: crowd === "port" ? -2 : 0 });
      fig(cam, out, 11, ESP, "es", ES[0], ES[1], { mode: "stand", expr: crowd === "esp" ? "grin" : ex, blink: lidAt(t, 11), facing: lookOther ? -1 : 0, look: lookOther ? -1 : 0, headTilt: Math.round(-2 * breathe) });
      if (crowd !== "port" && crowd !== "esp") village(cam, out, t, "calm");
      break;
    }
    case "village": village(cam, out, t, "firm"); break;
    case "war": {
      for (let k = 0; k < 8; k++) { const x = CX - 6.5 + k * 1.9, o = k < 4 ? PORT : ESP; rifleman(cam, out, 20 + k, o, k < 4 ? "pt" : "es", x, CZ - 16 + (k % 2) * 0.6, t, [18.2 + 0.18 * k, 19.6 + 0.15 * k, 21.0 + 0.12 * k]); }
      for (let k = 0; k < 7; k++) fig(cam, out, 40 + k, WARRIOR(k), `gw${k % 4}`, CX - 6 + k * 2.0, CZ - 4.5 + (k % 2) * 0.8, { mode: "stand", expr: "stern", blink: lidAt(t, 40 + k), prop: ["bow", 0.3 + 0.3 * Math.max(0, Math.sin(t * 3 + k))], stance: 0.5, crouch: 0.15 });
      arrows(cam, out, t, 18.6, 14, 300, CX, CZ - 4.5, CX, CZ - 15.5);
      arrows(cam, out, t, 20.4, 12, 320, CX, CZ - 4.5, CX, CZ - 15.5);
      break;
    }
    case "sepe": {
      const [x, z] = SEPE_WALK(t), walking = t < 25.0, up = smooth((t - 25.2) / 0.35);
      fig(cam, out, 1, SEPE, "sepe", x, z, { mode: walking ? "stroll" : "stand", phase: walking ? (((t - 22.6) * 0.95) % 1) : 0, lift: 30, expr: "stern", blink: B, prop: ["spear", Math.round(up * 20) / 20], headTilt: Math.round(2 * breathe) });
      for (let k = 0; k < 16; k++) {      // drifting gunsmoke he walks out of
        const ph2 = (t * 0.12 + hh(k, 400)) % 1, x2 = CX - 5 + hh(k, 401) * 10 + 2.5 * ph2, z2 = CZ - 1 - hh(k, 402) * 5, r = 0.9 + 0.8 * hh(k, 403);
        const al = q(0.75 * Math.sin(Math.PI * ph2), 8);
        out.fx.push({ key: `gun${k % 3}_${al}`, cw: 256, ch: 256, draw: smokeDraw(k % 3, al, [214, 210, 204]), x: x2, y: D0 + 0.6 + r * 0.5, z: z2, w: 2 * r, h: 2 * r, soft: true });
      }
      for (let k = 0; k < 4; k++) fig(cam, out, 40 + k, WARRIOR(k), `gw${k % 4}`, CX - 3 + k * 2, CZ + 1.5, { mode: "stand", expr: "stern", blink: lidAt(t, 40 + k), prop: [k % 2 ? "bow" : "spear", 0] });
      break;
    }
    case "gather": {
      const cry = (k: number) => Math.max(smooth((t - 28.2 - 0.06 * k) / 0.25) * (1 - smooth((t - 29.4 - 0.06 * k) / 0.3)), smooth((t - 30.4 - 0.05 * k) / 0.25) * (1 - smooth((t - 31.8) / 0.4)));
      const sc = cry(0);
      fig(cam, out, 1, SEPE, "sepe", CX, CZ - 3.5, { mode: "stand", expr: sc > 0.5 ? "laugh" : "stern", blink: B, prop: ["spear", Math.round(Math.max(0.15, sc) * 20) / 20], headTilt: Math.round(2 * breathe), stance: 0.4 });
      for (let k = 0; k < 10; k++) {
        const row = k < 6 ? 0 : 1, x = CX - 4 + (row ? 1 : 0) + (k % 6) * 1.6, z = CZ - 0.6 + row * 1.6, c2 = cry(k + 1);
        fig(cam, out, 40 + k, WARRIOR(k), `gw${k % 4}`, x, z, { mode: "stand", expr: c2 > 0.5 ? "laugh" : "stern", blink: lidAt(t, 40 + k), prop: [k % 2 ? "bow" : "spear", Math.round(c2 * 20) / 20], stance: 0.3 });
      }
      break;
    }
    case "march": {
      for (let k = 0; k < 10; k++) {
        const file = k % 2, rank = Math.floor(k / 2), x = CX + 1.4 + file * 1.1, z = marchZ(t) - rank * 1.5, dist = 1.15 * (t - 33.4) + rank * 0.37;
        const view = viewOf(cam, x, z, 0, 1), ph = (dist / 1.6) % 1;
        out.places.push(person(cam, { i: 20 + k, o: file ? ESP : PORT, okey: file ? "es" : "pt" }, x, D0, z, view, { mode: "march", phase: ph, lift: 35, expr: "stern" },
          { mode: "march", phase: ph, stride: Math.max(0.3, view.fs), stomp: 0.18, expr: "stern", blink: lidAt(t, 20 + k) }));
        blob(out, x, D0, z);
      }
      break;
    }
    case "front": {
      for (let k = 0; k < 9; k++) {
        const rank = k < 5 ? 0 : 1, x = CX - 2.6 + (k % 5) * 1.3 + rank * 0.65, z = CZ - 26 + 1.0 * (t - 36.7) - rank * 1.6, ph = ((t - 36.7) * 0.62 + rank * 0.5) % 1;
        fig(cam, out, 20 + k, k % 2 ? ESP : PORT, k % 2 ? "es" : "pt", x, z, { mode: "march", phase: ph, lift: 32, expr: t > 38.9 && k % 3 === 0 ? "grin" : "stern", blink: lidAt(t, 20 + k) });
      }
      break;
    }
    case "ride": case "fallen": {
      const h = horseAt(t), left = true;
      out.fx.push({ key: `horse${q(h.ph, 12)}_${q(h.fall, 10)}`, cw: 900, ch: 600, draw: horseDraw(q(h.ph, 12), q(h.fall, 10), left), x: h.x, y: D0 + 0.95, z: ZH + 0.15, w: 2.85, h: 1.9 });
      blob(out, h.x, D0, ZH + 0.15, 1.6, 0.8);
      const th = sepeThrown(t);
      if (!th) {
        const bob = 0.07 * Math.abs(Math.sin(Math.PI * 2 * h.ph));
        fig(cam, out, 1, SEPE, "sepe", h.x - 0.05, ZH - 0.12, { mode: "sit", expr: t > TF - 0.15 ? "shock" : "stern", blink: B, prop: ["spear", 0.35], tilt: 4 }, D0 + 0.98 + bob);
      } else if (th.ph === "fly") {
        putBody(cam, out, 1, SEPE, "sepe", th.x, th.y, ZH - 0.12, Math.round(th.roll * 30) / 30, { mode: "fall", expr: "shock", blink: 0 });
      } else {
        const dead = t > 49.0;
        putBody(cam, out, 1, SEPE, "sepe", th.x, th.y, ZH - 0.12, Math.PI / 2 - 0.05, { mode: "stand", expr: dead ? "neutral" : "pained", blink: dead ? 1 : B, headTilt: dead ? 0 : Math.round(3 * Math.sin(t * 4)) });
        blob(out, th.x, D0, ZH - 0.12, 1.4, 0.7);
      }
      // dust: the horse going down, Sepé landing
      for (const [t0, x0] of [[TF + 0.15, horseAt(TF + 0.5).x], [T_SLAND, sepeThrown(T_SLAND + 0.01)!.x]] as const) {
        for (let i = 0; i < 12; i++) {
          const age = t - t0 - 0.03 * i; if (age < 0 || age > 1.6) continue;
          const a = hh(i, 500) * 6.28, d = (0.3 + 1.1 * hh(i, 501)) * (1 - Math.exp(-3 * age)), r = (0.35 + 0.3 * hh(i, 502)) * (0.8 + 1.2 * (1 - Math.exp(-2 * age)));
          const al = q(Math.min(0.9, 1.1 * (1 - age / 1.6)), 10);
          out.fx.push({ key: `dust${i % 3}_${al}`, cw: 256, ch: 256, draw: smokeDraw(i % 3, al, [150, 126, 96]), x: x0 + Math.cos(a) * d, y: D0 + 0.25 + r * 0.4, z: ZH + 0.6 + Math.sin(a) * d * 0.5, w: 2 * r, h: 2 * r, soft: true });
        }
      }
      // the enemy line behind: firing as he rides; then walking up to him
      for (let k = 0; k < 5; k++) {
        const x = XF - 3 + k * 2.2, o = k % 2 ? ESP : PORT, walk = crowd === "fallen", z = walk ? CZ - 7 - 1.0 * Math.max(0, t - 46.8) : CZ - 7;
        fig(cam, out, 20 + k, o, k % 2 ? "es" : "pt", x, z, walk ? { mode: "march", phase: ((t * 0.6 + k * 0.3) % 1), lift: 28, expr: "stern", blink: lidAt(t, 20 + k) } : { mode: "stand", expr: "stern", blink: lidAt(t, 20 + k) });
        for (const g of [44.4 + 0.2 * k, 45.2 + 0.03 * k, 47.6 + 0.1 * k]) {
          const d = t - g; if (d < 0 || d > 2.2) continue;
          if (d < 0.1) { const u = q(d / 0.1, 3); out.fx.push({ key: `mz${u}`, cw: 500, ch: 500, draw: (p) => fxBurst(p, u, "#ffd27a", 10, 30, 210), x: x + 0.45, y: D0 + 1.3, z: z - 0.4, w: 0.8, h: 0.8 }); }
          const al = q(Math.min(1, 1.1 * (1 - d / 2.2)), 10), r = 0.25 + 0.5 * (1 - Math.exp(-1.8 * d));
          out.fx.push({ key: `gun${k % 3}_${al}`, cw: 256, ch: 256, draw: smokeDraw(k % 3, al, [222, 218, 212]), x: x + 0.45 + 0.3 * d, y: D0 + 1.35 + 0.25 * d, z: z - 0.5, w: 2 * r, h: 2 * r, soft: true });
        }
      }
      break;
    }
    case "caiboate": {
      for (let k = 0; k < 12; k++) {
        const x = CX - 10 + k * 1.8, o = k % 2 ? ESP : PORT, fires: number[] = [];
        for (let v = 0; v < 4; v++) fires.push(50.3 + v * 1.4 + k * 0.09);
        rifleman(cam, out, 20 + k, o, k % 2 ? "es" : "pt", x, CZ - 14 + (k % 3) * 0.5, t, fires);
      }
      for (let k = 0; k < 9; k++) {
        const x = CX - 8 + k * 2.0, z0 = CZ - 3 + (k % 2) * 1.0, tdown = k % 3 === 0 ? 51.2 + k * 0.35 : -1;
        if (tdown > 0 && t > tdown) {
          const tt = t - tdown, th2 = Math.min(Math.PI / 2 - 0.05, (tt / 0.4) ** 2 * (Math.PI / 2));
          putBody(cam, out, 40 + k, WARRIOR(k), `gw${k % 4}`, x, 0.25 + 0.6 * Math.cos(th2), z0, th2, { mode: tt < 0.4 ? "fall" : "stand", expr: "pained", blink: tt > 0.6 ? 1 : 0 });
        } else {
          const flee = k % 3 !== 0 && t > 52.0, zz = flee ? z0 + 1.3 * (t - 52.0) : z0, view = flee ? viewOf(cam, x, zz, 0, 1) : FRONT;
          const ph = flee ? ((1.3 * (t - 52.0)) / 1.6) % 1 : 0;
          out.places.push(person(cam, { i: 40 + k, o: WARRIOR(k), okey: `gw${k % 4}` }, x, D0, zz, view,
            flee ? { mode: "march", phase: ph, lift: 30, expr: "shock" } : { mode: "stand", expr: "stern", blink: lidAt(t, 40 + k), prop: ["bow", 0.4] },
            { mode: "march", phase: ph, stride: Math.max(0.3, view.fs), stomp: 0.12, expr: "shock" }));
          blob(out, x, D0, zz);
        }
      }
      arrows(cam, out, t, 50.5, 10, 340, CX, CZ - 3.5, CX, CZ - 13.5);
      break;
    }
    case "feather": case "centuries": {
      const [x0, z0] = SEPE_REST;
      out.fx.push({ key: "feather", cw: 256, ch: 96, draw: featherDraw, x: x0 + 0.25, y: D0 + 0.03, z: z0 - 0.1, w: 0.55, h: 0.2, flat: true, rot: 0.4 + 0.05 * Math.sin(t * 3) });
      out.fx.push({ key: "band", cw: 256, ch: 256, draw: bandDraw, x: x0 - 0.15, y: D0 + 0.025, z: z0 + 0.1, w: 0.42, h: 0.42, flat: true, rot: 0.2 });
      for (let i = 0; i < 8; i++) {           // a few leaves and dust motes drifting past in the wind
        const u = ((t * 0.35 + hh(i, 600)) % 1), x = x0 - 2 + 4 * u, y = D0 + 0.15 + 0.5 * hh(i, 601) + 0.2 * Math.sin(t * 2 + i);
        out.fx.push({ key: "leafg", cw: 64, ch: 64, draw: dot("#c9a050", "#e9c070"), x, y, z: z0 - 0.5 + hh(i, 602), w: 0.07, h: 0.05, rot: t * 3 + i });
      }
      break;
    }
    case "legend": {
      const up = smooth((t - 61.2) / 0.5);
      fig(cam, out, 1, SEPE, "sepe", HILL[0], HILL[2], { mode: "stand", expr: "stern", blink: B, prop: ["spear", Math.round(Math.max(0.2, up) * 20) / 20], headTilt: Math.round(3 * Math.sin(t * 1.4)), stance: 0.45, tilt: Math.round(breathe) }, D0 + HILL[1] + 0.05);
      break;
    }
  }
};

export const stage = (id: number, t: number, cam: CamInfo): Stage => {
  const out: Stage = { places: [], fx: [] };
  const s = SHOTS[id - 1];
  LNAME = s.light;
  findSun(cam, SUN);
  const IZ = INTRO_Z;
  switch (s.crowd) {
    case "drive": case "crash": case "wreck": case "out": case "wide": { batida(cam, out, t); break; }
    default: { sepeStage(cam, out, t, s.crowd); break; }
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
