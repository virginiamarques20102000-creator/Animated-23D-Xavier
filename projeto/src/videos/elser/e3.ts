// Motor híbrido do filme do Elser: cenário 3D de verdade (three.js: PBR, sombras, luzes, neblina, oclusão de ambiente)
// e personagens 2D articulados (rig.ts) como cartões vivos dentro do 3D (fazem sombra, ficam atrás das mesas).
// Efeitos 2D (fumaça, faíscas, textos, mapas) continuam por cima, no canvas 2D.
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { GTAOPass } from "three/examples/jsm/postprocessing/GTAOPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import type { Cam } from "../ww2/engine";
import { VW, VH, focal, spriteCanvas } from "../ww2/engine";
import { SPR } from "../ww2/paint";
import { Pen, bodyFront, bodySide, FrontOpts, SideOpts } from "../ww2/toon";
import type { Act } from "../ww2/engine";
import { World, WState, LIGHTS, moodOf, buildHall, buildStreet, buildPlaza, buildRoom, buildOutdoor, prop3, at, RoomP } from "./e3world";
import { radial } from "./e3tex";
import type { Loc } from "../ww2/paint";

export const E3 = { on: false, enabled: true, state: { mood: "day" } as WState };
export type ActorRec = Act;
export type PropRec = { k: string; x: number; y: number; z: number; o: { flip?: boolean; rot?: number; alpha?: number; sc?: number } };
export type S3Spec = { t: "hall"; dark?: number; banner?: boolean; ruin?: boolean } | { t: "street"; night?: boolean; dusk?: boolean; sepia?: boolean; banner?: boolean; seed?: number; pal: string[] } | { t: "plaza"; night: boolean } | ({ t: "room" } & RoomP);

let R: THREE.WebGLRenderer | null = null, comp: EffectComposer | null = null, rpass: RenderPass, ao: GTAOPass | null = null;
const cam3 = new THREE.PerspectiveCamera(40, VW / VH, 0.08, 3000);
const init = () => {
  const cv = document.createElement("canvas"); cv.width = VW; cv.height = VH;
  R = new THREE.WebGLRenderer({ canvas: cv, antialias: true, preserveDrawingBuffer: true, powerPreference: "high-performance" });
  R.setPixelRatio(1); R.setSize(VW, VH, false); R.toneMapping = THREE.ACESFilmicToneMapping; R.toneMappingExposure = 1.05; R.outputColorSpace = THREE.SRGBColorSpace;
  R.shadowMap.enabled = true; R.shadowMap.type = THREE.PCFSoftShadowMap;
  comp = new EffectComposer(R); rpass = new RenderPass(new THREE.Scene(), cam3); comp.addPass(rpass);
  try { ao = new GTAOPass(new THREE.Scene(), cam3, VW, VH); ao.output = GTAOPass.OUTPUT.Default; (ao as unknown as { blendIntensity: number }).blendIntensity = 1.0; ao.updateGtaoMaterial({ radius: 0.6, distanceExponent: 1.4, thickness: 1.2, scale: 1.0, samples: 12 }); comp.addPass(ao); } catch { ao = null; }
  comp.addPass(new OutputPass());
};

// ---------------- mundos (cache) ----------------
const WORLDS = new Map<string, World>(), ORDER: string[] = [];
const keyOf = (L: Loc & { s3?: S3Spec }, mood: string) => (L.s3 ? JSON.stringify(L.s3) + mood : "");
let anon = 0; const ANON = new WeakMap<object, string>();
export const worldFor = (L: Loc & { s3?: S3Spec }, lite: Record<string, unknown> | undefined): World | null => {
  const mood = moodOf(lite); let key = keyOf(L, mood);
  if (!key) { if (!L.sky && !L.layers.some((l) => (l as { spec?: { t: string } }).spec?.t === "wall")) return null; key = ANON.get(L) ?? "a" + anon++; ANON.set(L, key); key += mood; }
  const hit = WORLDS.get(key); if (hit) return hit;
  const Lg = LIGHTS[mood] ?? LIGHTS.day, s = L.s3; let W: World;
  if (s?.t === "hall") W = buildHall(s, Lg); else if (s?.t === "street") W = buildStreet(s, Lg); else if (s?.t === "plaza") W = buildPlaza(s.night, Lg);
  else if (s?.t === "room") W = buildRoom(s, Lg);
  else if (!L.sky) { const w = L.layers.find((l) => (l as { spec?: { t: string } }).spec?.t === "wall") as unknown as { spec: { col: string } }; W = buildRoom({ kind: "stage", wall: w.spec.col }, Lg); }
  else W = buildOutdoor(L.sky, L.ground, L.layers, Lg);
  WORLDS.set(key, W); ORDER.push(key);
  while (ORDER.length > 8) { const k = ORDER.shift()!; const w = WORLDS.get(k); WORLDS.delete(k); w?.scene.traverse((o) => { const m = o as THREE.Mesh; if (m.isMesh || (m as unknown as THREE.InstancedMesh).isInstancedMesh) m.geometry?.dispose(); }); }
  return W;
};

// ---------------- personagens (bonecos originais da skill) como cartões dentro do 3D ----------------
type Card = { mesh: THREE.Mesh; blob: THREE.Mesh; cv: HTMLCanvasElement; tex: THREE.CanvasTexture; mat: THREE.MeshBasicMaterial; dm: THREE.MeshDepthMaterial };
const CW = 1.35, CH = 2.25;
const GEO = (() => { const g = new THREE.PlaneGeometry(CW, CH); g.translate(0, CH / 2 - CH * 0.025, 0); return g; })();
const BLOB = new THREE.PlaneGeometry(1, 1);
const cards: Card[] = [];
const card = (i: number, scene: THREE.Scene): Card => {
  let c = cards[i];
  if (!c) { const cv = document.createElement("canvas"), tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
    const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, alphaTest: 0.35, toneMapped: false, side: THREE.DoubleSide }), dm = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: tex, alphaTest: 0.5 });
    const mesh = new THREE.Mesh(GEO, mat); mesh.castShadow = true; mesh.customDepthMaterial = dm;
    const blob = new THREE.Mesh(BLOB, new THREE.MeshBasicMaterial({ map: radial("blob", "rgba(10,6,12,0.55)", "rgba(10,6,12,0)"), transparent: true, depthWrite: false })); blob.rotation.x = -Math.PI / 2;
    c = cards[i] = { mesh, blob, cv, tex, mat, dm }; }
  if (c.mesh.parent !== scene) scene.add(c.mesh, c.blob);
  return c;
};
const TIERS = [0.08, 0.12, 0.17, 0.24, 0.34, 0.48, 0.66, 0.9, 1.2, 1.5];
const placeActors = (W: World, cam: Cam, list: Act[]) => {
  list.forEach((a, i) => {
    const c = card(i, W.scene), d = Math.max(0.4, a.z - cam.z), s = focal(cam) / d, sc = a.sc ?? 1, px = CH * sc * s, k = TIERS.find((q) => q >= (px / 1000) * 1.05) ?? 1.5;
    const w = Math.round(600 * k), h = Math.round(1000 * k); if (c.cv.width !== w || c.cv.height !== h) { c.cv.width = w; c.cv.height = h; c.tex.dispose(); c.tex = new THREE.CanvasTexture(c.cv); c.tex.colorSpace = THREE.SRGBColorSpace; c.mat.map = c.tex; c.dm.map = c.tex; c.mat.needsUpdate = true; c.dm.needsUpdate = true; }
    const g = c.cv.getContext("2d")!; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, w, h); g.setTransform(k, 0, 0, k, 0, 0);
    const p = new Pen(g); if (a.side) bodySide(p, a.o, { ...a.s, seed: a.id ?? 1 } as SideOpts); else bodyFront(p, a.o, { ...a.f, seed: a.id ?? 1 } as FrontOpts);
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = "source-atop"; const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "rgba(255,248,235,0.10)"); gr.addColorStop(0.5, "rgba(0,0,0,0)"); gr.addColorStop(1, "rgba(12,8,16,0.25)"); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    if (a.dark) { g.globalAlpha = a.dark; g.fillStyle = a.darkCol ?? "#140f1e"; g.fillRect(0, 0, w, h); g.globalAlpha = 1; } g.globalCompositeOperation = "source-over";
    c.tex.needsUpdate = true; c.mat.color.copy(W.tint).lerp(new THREE.Color(1, 1, 1), 0.35); c.mat.opacity = a.alpha ?? 1;
    c.mesh.visible = true; c.mesh.scale.set((a.flip ? -1 : 1) * sc, sc, 1); c.mesh.rotation.set(0, 0, -(a.rot ?? 0)); at(c.mesh, a.x, a.y ?? 0, a.z);
    c.mesh.castShadow = (a.alpha ?? 1) > 0.6 && !a.noCast;
    const gy = a.y ?? 0; c.blob.visible = Math.abs(gy) < 0.6 && (a.shadow ?? 1) > 0; c.blob.scale.set(0.95 * sc, 0.5 * sc, 1); at(c.blob, a.x, Math.max(0.012, gy + 0.012), a.z); (c.blob.material as THREE.MeshBasicMaterial).opacity = a.alpha ?? 1;
  });
  for (let i = list.length; i < cards.length; i++) { cards[i].mesh.visible = false; cards[i].blob.visible = false; }
};

// ---------------- adereços (modelos 3D ou sprites em cartão) ----------------
const PROPS = new Map<string, THREE.Object3D[]>(); const STEX = new Map<string, THREE.Texture>();
const placeProps = (W: World, list: PropRec[]) => {
  for (const arr of PROPS.values()) for (const o of arr) o.visible = false;
  const used = new Map<string, number>();
  for (const p of list) { const key = p.k + "|" + (p.o.sc ?? 1).toFixed(2), n = used.get(key) ?? 0; used.set(key, n + 1); let arr = PROPS.get(key); if (!arr) PROPS.set(key, (arr = []));
    let obj = arr[n]; if (!obj) { obj = prop3(p.k, p.o.sc ?? 1) ?? spriteCard(p.k, p.o.sc ?? 1); obj.userData.sx = obj.scale.x; arr[n] = obj; }
    if (obj.parent !== W.scene) W.scene.add(obj); obj.visible = true; at(obj, p.x, p.y, p.z); obj.rotation.z = -(p.o.rot ?? 0); obj.scale.x = obj.userData.sx * (p.o.flip ? -1 : 1); }
};
const spriteCard = (k: string, sc: number) => { const S = SPR[k]; let t = STEX.get(k); if (!t) { t = new THREE.CanvasTexture(spriteCanvas(S)); t.colorSpace = THREE.SRGBColorSpace; STEX.set(k, t); }
  const g = new THREE.PlaneGeometry(S.w * sc, S.h * sc); g.translate(0, (S.h * sc) / 2, 0); const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ map: t, transparent: true, alphaTest: 0.3, roughness: 0.8, side: THREE.DoubleSide })); m.castShadow = true; m.receiveShadow = true; return m; };

// ---------------- render de um quadro ----------------
export const render3D = (W: World, cam: Cam, t: number, actors: ActorRec[], props: PropRec[], shake: [number, number] = [0, 0]): HTMLCanvasElement => {
  if (!R) init();
  cam3.position.set(cam.x, cam.y, -cam.z); cam3.rotation.set(0, 0, 0);
  cam3.fov = (2 * Math.atan(Math.tan((cam.fov * Math.PI) / 360) * (VH / VW)) * 180) / Math.PI; cam3.aspect = VW / VH;
  cam3.setViewOffset(VW, VH, -shake[0], -(cam.shift ?? 0) - shake[1], VW, VH); cam3.updateProjectionMatrix();
  W.focus.set(cam.x, 0, -(cam.z + Math.min(14, W.shadowR * 0.6))); W.up(t, E3.state);
  const sc = W.sun.shadow.camera as THREE.OrthographicCamera, r = W.shadowR; Object.assign(sc, { left: -r, right: r, top: r, bottom: -r, near: 1, far: 260 }); sc.updateProjectionMatrix();
  placeActors(W, cam, actors); placeProps(W, props);
  if (W.sky) W.sky.position.copy(cam3.position);
  rpass.scene = W.scene; if (ao) { ao.scene = W.scene; ao.enabled = W.interior && !(globalThis as unknown as { NOAO?: boolean }).NOAO; }
  comp!.render();
  return R!.domElement;
};
