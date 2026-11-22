// The film's toon characters as lit cards inside the 3D world (same toon.ts drawings, same outfits).
// Cards yaw toward the camera, cast their real silhouette shadow, and are redrawn every frame from a continuous phase
// (pooled by pose key so soldiers in step share canvases). Deaths: the card pivots about the feet and falls with gravity.
import * as THREE from "three";
import { Pen, bodySide, bodyFront, Outfit, FrontOpts, SideOpts } from "../toon";
import { Stage, V, hs, clamp } from "./core";

type Ent = { cv: HTMLCanvasElement; tex: THREE.CanvasTexture; used: number };
class Pool {
  live = new Map<string, Ent>(); free: Map<number, Ent[]> = new Map(); frame = 0;
  get(key: string, k: number, draw: (p: Pen) => void) {
    let e = this.live.get(key);
    if (!e) { const fl = this.free.get(k); e = fl?.pop();
      if (!e) { const cv = document.createElement("canvas"); cv.width = 600 * k; cv.height = 1000 * k; const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8; e = { cv, tex, used: 0 }; }
      const g = e.cv.getContext("2d")!; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, e.cv.width, e.cv.height); g.setTransform(k, 0, 0, k, 0, 0); draw(new Pen(g)); e.tex.needsUpdate = true; this.live.set(key, e); }
    e.used = this.frame; return e.tex;
  }
  tick() { for (const [key, e] of this.live) if (e.used < this.frame) { this.live.delete(key); const k = e.cv.width / 600; if (!this.free.has(k)) this.free.set(k, []); this.free.get(k)!.push(e); } this.frame++; }
}
export const POOL = new Pool();
const oids = new Map<Outfit, string>(); let on = 0;
const oid = (o: Outfit) => { let s = oids.get(o); if (!s) { s = "o" + on++ + JSON.stringify(o).length; oids.set(o, s); } return s; };
const q = (v: number) => Math.round(v * 60) / 60;

export type Pose = { x: number; z: number; y?: number; side?: boolean; flip?: boolean; s?: SideOpts; f?: FrontOpts; fall?: number; fallDir?: number; lean?: number; sc?: number; hide?: boolean };
const GEO = (() => { const g = new THREE.PlaneGeometry(1.35, 2.25); g.translate(0, 0.475 * 2.25, 0); return g; })();
export const actor = (S: Stage, o: Outfit, id: number, pose: (t: number) => Pose) => {
  const mat = new THREE.MeshBasicMaterial({ alphaTest: 0.5, side: THREE.DoubleSide, color: S.charTint });
  const dm = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, alphaTest: 0.5, side: THREE.DoubleSide });
  const pivot = new THREE.Group(), m = new THREE.Mesh(GEO, mat); m.castShadow = true; m.receiveShadow = false; m.customDepthMaterial = dm; pivot.add(m); S.root.add(pivot);
  S.on((t) => {
    const P = pose(t); pivot.visible = !P.hide; if (P.hide) return;
    const cam = S.cam.position, d = Math.hypot(cam.x - P.x, cam.z - P.z), k = d < 9 ? 2 : 1;
    const opts = P.side ? { mode: "stand", ...P.s, seed: id } : { mode: "stand", ...P.f, seed: id };
    const key = `${oid(o)}|${P.side ? 1 : 0}|${k}|${JSON.stringify(opts, (_k, v) => (typeof v === "number" ? q(v) : v))}`;
    const tex = POOL.get(key, k, (p) => (P.side ? bodySide(p, o, opts as SideOpts) : bodyFront(p, o, opts as FrontOpts)));
    const had = !!mat.map; mat.map = tex; dm.map = tex; if (!had) { mat.needsUpdate = true; dm.needsUpdate = true; }
    pivot.position.set(P.x, P.y ?? 0, P.z);
    const yaw = Math.atan2(cam.x - P.x, cam.z - P.z); pivot.rotation.set(0, yaw, 0);
    m.scale.set((P.flip ? -1 : 1) * (P.sc ?? 1), P.sc ?? 1, 1);
    // fall: rotate the card about its feet in the camera plane (toward fallDir: +1 screen right / -1 left) or backward (0)
    const f = clamp(P.fall ?? 0), dir = P.fallDir ?? 1;
    m.rotation.set(dir === 0 ? -f * 1.45 : 0, 0, (dir === 0 ? 0 : -dir * f * 1.5) + (P.lean ?? 0));
    m.position.y = f > 0.95 ? 0.08 : 0;
  });
};
/** fall progress with gravity: 0 until t0, accelerates, small bounce at the end */
export const fallK = (t: number, t0: number) => { if (t < t0) return 0; const a = t - t0, k = 0.5 * 9.8 * a * a / 1.6; return k < 1 ? k : 1 - 0.04 * Math.exp(-(a - 0.57) * 9) * Math.abs(Math.sin((a - 0.57) * 18)); };
/** side-view walker/runner on the ground plane at depth z (x = x0 + v t), optional death */
export const walker = (S: Stage, o: Outfit, id: number, x0: number, z: number, v: number, opt: { run?: boolean; t0?: number; t1?: number; die?: number; expr?: string; dieDir?: number; sc?: number; stop?: number } = {}) =>
  actor(S, o, id, (t) => {
    const tt = Math.min(t, opt.die ?? 1e9, opt.stop ?? 1e9), x = x0 + v * Math.max(0, tt - (opt.t0 ?? 0)) + (opt.die !== undefined && t > opt.die ? v * 0.25 * Math.min(0.4, t - opt.die) : 0);
    const moving = t >= (opt.t0 ?? 0) && t < (opt.stop ?? 1e9) && !(opt.die !== undefined && t > opt.die), run = !!opt.run;
    const ph = (Math.abs(x - x0) / (run ? 2.4 : 1.5) + hs(id)) % 1;
    return { x, z, hide: opt.t1 !== undefined && t > opt.t1, side: true, flip: v < 0, sc: opt.sc, lean: moving && run ? -Math.sign(v) * 0.12 : 0,
      s: { mode: moving ? "march" : "stand", phase: ph, stride: run ? 1.35 : Math.min(1.2, Math.abs(v) / 1.4), expr: (opt.expr ?? (run ? "shout" : "stern")) as never, blink: 0 },
      fall: opt.die !== undefined ? fallK(t, opt.die + 0.1) : 0, fallDir: opt.dieDir ?? -Math.sign(v) };
  });
/** front-facing figure (stand/talk/aim) with live breathing + gestures */
export const stander = (S: Stage, o: Outfit, id: number, x: number, z: number, f: (t: number) => FrontOpts = () => ({}), opt: { die?: number; dieDir?: number; sc?: number } = {}) =>
  actor(S, o, id, (t) => ({ x, z, sc: opt.sc, f: { mode: "stand", headTilt: 4 * Math.sin(t * 1.05 + id), look: 0.5 * Math.sin(t * 0.45 + id), hip: 3 * Math.sin(t * 0.6 + id), crouch: 0.035 * (0.5 + 0.5 * Math.sin(t * 1.9 + id)), blink: 0, ...f(t) },
    fall: opt.die !== undefined ? fallK(t, opt.die) : 0, fallDir: opt.dieDir ?? 0 }));
/** front-facing march toward/away from camera along z */
export const marcherF = (S: Stage, o: Outfit, id: number, x: number, z0: number, vz: number, expr = "stern") =>
  actor(S, o, id, (t) => ({ x, z: z0 + vz * t, f: { mode: "march", phase: ((Math.abs(vz) * t) / 1.5 + hs(id)) % 1, expr: expr as never, blink: 0 } }));
export { V };
