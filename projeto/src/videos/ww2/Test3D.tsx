// three.js test scene for the WW2 film: same toon characters (toon.ts cards) inside a real 3D world.
// Ruined street at dusk: a 3D Panzer rolls in (wheels turn, tracks scroll), traverses its turret and fires; the shell hits
// a building -> fireball, dense black smoke lit by fire, falling debris with gravity/bounce, flash light, camera shake.
// Three Wehrmacht soldiers walk beside the tank; real shadow maps (cards cast their silhouette), fog, bloom, ACES grade.
import React, { useMemo } from "react";
import * as THREE from "three";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useFrame, useThree } from "@react-three/fiber";
import { BlendFunction, BloomEffect, EffectComposer, EffectPass, RenderPass, ToneMappingEffect, ToneMappingMode, VignetteEffect, NoiseEffect } from "postprocessing";
import { Pen, bodySide } from "./toon";
import { WEH, sol } from "./kit";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

export const TEST3D_FRAMES = 300;
const FPS = 30;
const T_FIRE = 5.0, T_HIT = 5.12;
const hs = (i: number, s = 0) => { const v = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return v - Math.floor(v); };
const sm = (x: number) => { const k = Math.min(1, Math.max(0, x)); return k * k * (3 - 2 * k); };
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

// ---------- procedural textures ----------
const cnv = (w: number, h: number, d: (g: CanvasRenderingContext2D) => void, rep = 1) => {
  const c = document.createElement("canvas"); c.width = w; c.height = h; d(c.getContext("2d")!);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  if (rep !== 1) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep, rep); }
  return t;
};
const noise = (g: CanvasRenderingContext2D, w: number, h: number, n: number, a: number, seed = 1) => {
  for (let i = 0; i < n; i++) { const v = hs(i, seed) > 0.5 ? 255 : 0; g.fillStyle = `rgba(${v},${v},${v},${a * hs(i, seed + 2)})`; g.fillRect(hs(i, seed + 3) * w, hs(i, seed + 4) * h, 1 + 3 * hs(i, seed + 5), 1 + 3 * hs(i, seed + 6)); }
};
const groundTex = () => cnv(1024, 1024, (g) => {
  g.fillStyle = "#4a4640"; g.fillRect(0, 0, 1024, 1024);
  for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) { const k = hs(x + y * 32, 9); g.fillStyle = `hsl(30,${6 + 6 * k}%,${22 + 12 * k}%)`; g.fillRect(x * 32 + (y % 2) * 16 + 2, y * 32 + 2, 28, 28); }
  noise(g, 1024, 1024, 26000, 0.25, 3);
  for (let i = 0; i < 40; i++) { const r = 30 + 90 * hs(i, 7); const gr = g.createRadialGradient(hs(i, 1) * 1024, hs(i, 2) * 1024, 0, hs(i, 1) * 1024, hs(i, 2) * 1024, r); gr.addColorStop(0, "rgba(20,16,12,0.55)"); gr.addColorStop(1, "rgba(20,16,12,0)"); g.fillStyle = gr; g.fillRect(0, 0, 1024, 1024); }
}, 6);
const facadeTex = (hue: number, seed: number, broken: boolean) => cnv(512, 1024, (g) => {
  g.fillStyle = `hsl(${hue},18%,46%)`; g.fillRect(0, 0, 512, 1024);
  for (let y = 0; y < 1024; y += 10) for (let x = (y / 10) % 2 ? 0 : 12; x < 512; x += 24) { g.fillStyle = `hsl(${hue},${14 + 10 * hs(x + y, seed)}%,${38 + 12 * hs(x * 3 + y, seed)}%)`; g.fillRect(x, y, 22, 8); }
  noise(g, 512, 1024, 14000, 0.3, seed);
  for (let fl = 0; fl < 4; fl++) for (let w = 0; w < 3; w++) {
    const x = 60 + w * 150, y = 80 + fl * 240, dead = broken && hs(fl * 3 + w, seed + 1) > 0.45;
    g.fillStyle = "#2c2824"; g.fillRect(x - 10, y - 10, 92, 162);
    g.fillStyle = dead ? "#070606" : "#1a1c20"; g.fillRect(x, y, 72, 142);
    if (!dead) { g.fillStyle = "#3a4048"; g.fillRect(x + 34, y, 4, 142); g.fillRect(x, y + 60, 72, 4); }
    const sg = g.createLinearGradient(0, y - 40, 0, y - 200); sg.addColorStop(0, dead ? "rgba(10,8,6,0.8)" : "rgba(10,8,6,0.25)"); sg.addColorStop(1, "rgba(10,8,6,0)"); g.fillStyle = sg; g.fillRect(x - 20, y - 200, 112, 200);
  }
  const gr = g.createLinearGradient(0, 1024, 0, 700); gr.addColorStop(0, "rgba(30,24,18,0.7)"); gr.addColorStop(1, "rgba(30,24,18,0)"); g.fillStyle = gr; g.fillRect(0, 700, 512, 324);
});
const puffTex = () => cnv(256, 256, (g) => {
  for (let i = 0; i < 26; i++) { const r = 30 + 50 * hs(i, 4), x = 128 + (hs(i, 5) - 0.5) * 110, y = 128 + (hs(i, 6) - 0.5) * 110;
    const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, "rgba(255,255,255,0.6)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, 256, 256); }
  g.globalCompositeOperation = "source-atop"; const sh = g.createLinearGradient(60, 40, 200, 230); sh.addColorStop(0, "rgba(255,255,255,0)"); sh.addColorStop(1, "rgba(40,40,40,0.75)"); g.fillStyle = sh; g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 18; i++) { const x = 40 + 176 * hs(i, 21), y = 40 + 176 * hs(i, 22), r = 14 + 26 * hs(i, 23); const gr = g.createRadialGradient(x - r * 0.3, y - r * 0.3, 0, x, y, r); gr.addColorStop(0, "rgba(255,255,255,0.35)"); gr.addColorStop(0.7, "rgba(60,60,60,0.25)"); gr.addColorStop(1, "rgba(60,60,60,0)"); g.fillStyle = gr; g.fillRect(0, 0, 256, 256); }
  const m = g.createRadialGradient(128, 128, 50, 128, 128, 126); m.addColorStop(0, "rgba(0,0,0,0)"); m.addColorStop(1, "rgba(0,0,0,1)");
  g.globalCompositeOperation = "destination-out"; g.fillStyle = m; g.fillRect(0, 0, 256, 256);
});
const glowTex = () => cnv(128, 128, (g) => { const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.25, "rgba(255,220,160,0.8)"); gr.addColorStop(1, "rgba(255,120,30,0)"); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); });
const skyTex = () => cnv(16, 512, (g) => { const gr = g.createLinearGradient(0, 0, 0, 512);
  gr.addColorStop(0, "#2a2c38"); gr.addColorStop(0.45, "#5a5058"); gr.addColorStop(0.72, "#a8705a"); gr.addColorStop(0.86, "#d4905e"); gr.addColorStop(1, "#6a4a3e"); g.fillStyle = gr; g.fillRect(0, 0, 16, 512); });
const grime = (col: string, seed: number) => cnv(256, 256, (g) => { g.fillStyle = col; g.fillRect(0, 0, 256, 256); noise(g, 256, 256, 6000, 0.35, seed);
  for (let i = 0; i < 14; i++) { g.fillStyle = `rgba(40,30,20,${0.15 * hs(i, seed)})`; g.fillRect(hs(i, seed + 1) * 256, hs(i, seed + 2) * 256, 4 + 30 * hs(i, 3), 40 + 120 * hs(i, 4)); } });
const trackTex = () => cnv(64, 256, (g) => { g.fillStyle = "#1e1c1a"; g.fillRect(0, 0, 64, 256); for (let y = 0; y < 256; y += 16) { g.fillStyle = "#3c3834"; g.fillRect(2, y + 2, 60, 10); g.fillStyle = "#56504a"; g.fillRect(28, y + 4, 8, 6); } noise(g, 64, 256, 600, 0.3, 5); });

// ---------- world ----------
type Smoke = { m: THREE.Sprite; seed: number; kind: number };
class World {
  root = new THREE.Group(); sun: THREE.DirectionalLight; flash: THREE.PointLight; fires: THREE.PointLight[] = [];
  tank = new THREE.Group(); turret = new THREE.Group(); gun = new THREE.Group(); wheels: THREE.Mesh[] = []; track: THREE.Texture = trackTex();
  men: { mesh: THREE.Mesh; cv: HTMLCanvasElement; tex: THREE.CanvasTexture; id: number }[] = [];
  smoke: Smoke[] = []; fireS: THREE.Sprite[] = []; debris: { m: THREE.Mesh; v: THREE.Vector3; w: THREE.Vector3; seed: number }[] = [];
  ball: THREE.Sprite[] = []; muzzle: THREE.Sprite; ash: THREE.Points; wall: THREE.Group;
  constructor() {
    const R = this.root;
    R.add(new THREE.HemisphereLight("#9aa0bc", "#6a5444", 1.5));
    const sun = (this.sun = new THREE.DirectionalLight("#ffc890", 4.2)); sun.position.set(-28, 20, 22); sun.castShadow = true;
    sun.shadow.mapSize.set(4096, 4096); Object.assign(sun.shadow.camera, { left: -30, right: 30, top: 20, bottom: -20, near: 1, far: 120 }); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03;
    R.add(sun, sun.target);
    this.flash = new THREE.PointLight("#ffb060", 0, 60, 1.6); this.flash.position.set(8, 4, -10); R.add(this.flash);
    // ground + rubble
    const gt = groundTex(), ground = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.MeshStandardMaterial({ map: gt, roughness: 0.95 }));
    ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; R.add(ground);
    const stone = new THREE.MeshStandardMaterial({ map: grime("#6a6258", 4), roughness: 1 }), brick = new THREE.MeshStandardMaterial({ map: grime("#7a5446", 8), roughness: 1 });
    for (let i = 0; i < 160; i++) { const s = 0.12 + 0.7 * hs(i, 1) ** 2, x = -26 + 52 * hs(i, 2), z = -9.5 + 5 * hs(i, 3) + (i % 4 === 0 ? 10 + 6 * hs(i, 9) : 0);
      if (i % 4 === 0 && (z > 3 || Math.abs(x + 8) < 9)) continue;
      const m = new THREE.Mesh(new THREE.DodecahedronGeometry(s, 0), i % 3 ? stone : brick); m.position.set(x, s * 0.5, z); m.rotation.set(hs(i, 4) * 6, hs(i, 5) * 6, hs(i, 6) * 6); m.scale.y = 0.6; m.castShadow = m.receiveShadow = true; R.add(m); }
    // buildings (far side of street), jagged broken tops
    for (let b = 0; b < 9; b++) {
      const w = 7 + 3 * hs(b, 1), h = 6.5 + 6 * hs(b, 2), x = -34 + b * 8.6, broken = b % 2 === 1 || b === 4;
      const mat = new THREE.MeshStandardMaterial({ map: facadeTex(20 + 25 * hs(b, 3), b + 1, broken), roughness: 0.92 });
      const side = new THREE.MeshStandardMaterial({ map: grime("#5a5048", b + 20), roughness: 1 });
      const box = new THREE.Mesh(new THREE.BoxGeometry(w, h, 8), [side, side, side, side, mat, side]); box.position.set(x, h / 2, -16); box.castShadow = box.receiveShadow = true; R.add(box);
      if (broken) for (let k = 0; k < 5; k++) { const bw = w * (0.15 + 0.25 * hs(b * 5 + k, 4)), bh = 1 + 3 * hs(b * 5 + k, 5);
        const c = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, 7.6), side); c.position.set(x - w / 2 + bw / 2 + (w - bw) * hs(b * 5 + k, 6), h + bh / 2 - 0.3, -16); c.rotation.z = (hs(k, b) - 0.5) * 0.3; c.castShadow = true; R.add(c); }
    }
    // the target wall that gets hit (separate group so the hole can open)
    this.wall = new THREE.Group(); R.add(this.wall);
    // background skyline silhouettes
    for (let b = 0; b < 16; b++) { const h = 8 + 16 * hs(b, 30); const m = new THREE.Mesh(new THREE.BoxGeometry(6 + 6 * hs(b, 31), h, 4), new THREE.MeshStandardMaterial({ color: "#3a3236", roughness: 1 })); m.position.set(-60 + b * 8, h / 2, -42 - 10 * hs(b, 32)); R.add(m); }
    // telegraph poles + a burnt car-less lamp post
    const wood = new THREE.MeshStandardMaterial({ map: grime("#3a2c20", 50), roughness: 1 });
    for (let i = 0; i < 5; i++) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.13, 8, 8), wood); p.position.set(-24 + i * 12, 4, -8.5); p.rotation.z = (hs(i, 51) - 0.5) * (i === 2 ? 0.5 : 0.08); p.castShadow = true; R.add(p);
      const a = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.1, 0.1), wood); a.position.set(0, 3.5, 0); p.add(a); }
    this.buildTank();
    // soldiers (toon cards)
    for (let i = 0; i < 3; i++) {
      const cv = document.createElement("canvas"); cv.width = 1200; cv.height = 2000; const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
      const geo = new THREE.PlaneGeometry(1.35, 2.25); geo.translate(0, 0.475 * 2.25, 0);
      const mat = new THREE.MeshStandardMaterial({ map: tex, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.9 });
      const mesh = new THREE.Mesh(geo, mat); mesh.castShadow = true; mesh.receiveShadow = true;
      mesh.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: tex, alphaTest: 0.5, side: THREE.DoubleSide });
      R.add(mesh); this.men.push({ mesh, cv, tex, id: 11 + i * 7 });
    }
    // smoke / fire sprites
    const pt = puffTex(), gl = glowTex();
    for (let i = 0; i < 130; i++) { const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: pt, color: "#000000", transparent: true, depthWrite: false, fog: false })); R.add(m); this.smoke.push({ m, seed: i, kind: i < 80 ? 0 : 1 }); }
    for (let i = 0; i < 40; i++) { const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: gl, color: "#ff9a40", transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); R.add(m); this.ball.push(m); }
    for (let i = 0; i < 3; i++) { const l = new THREE.PointLight("#ff7a2a", 6, 18, 1.8); l.position.set([-20, 13, 22][i], 1.2, [-11, -12, -10][i]); R.add(l); this.fires.push(l);
      for (let k = 0; k < 6; k++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: gl, color: "#ff8a30", transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); R.add(s); this.fireS.push(s); } }
    this.muzzle = new THREE.Sprite(new THREE.SpriteMaterial({ map: gl, color: "#ffd08a", transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); R.add(this.muzzle);
    for (let i = 0; i < 46; i++) { const s = 0.15 + 0.5 * hs(i, 61); const m = new THREE.Mesh(new THREE.BoxGeometry(s * 1.6, s, s * 0.8), i % 2 ? brick : stone); m.castShadow = true; m.visible = false; R.add(m);
      const a = -0.9 + 1.8 * hs(i, 62); this.debris.push({ m, seed: i, v: new THREE.Vector3(Math.sin(a) * (3 + 9 * hs(i, 63)), 4 + 10 * hs(i, 64), 2 + 8 * hs(i, 65)), w: new THREE.Vector3(hs(i, 66) * 12, hs(i, 67) * 12, hs(i, 68) * 12) }); }
    // drifting ash
    const N = 600, pos = new Float32Array(N * 3); this.ash = new THREE.Points(new THREE.BufferGeometry().setAttribute("position", new THREE.BufferAttribute(pos, 3)), new THREE.PointsMaterial({ color: "#c8b8a8", size: 0.05, transparent: true, opacity: 0.7 })); R.add(this.ash);

  }
  buildTank() {
    const T = this.tank, grey = new THREE.MeshStandardMaterial({ map: grime("#575c4e", 70), roughness: 0.8, metalness: 0.25 }), dark = new THREE.MeshStandardMaterial({ color: "#1c1c1a", roughness: 0.9 });
    const box = (w: number, h: number, d: number, x: number, y: number, z: number, m = grey, p: THREE.Object3D = T) => { const b = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 3, Math.min(0.07, w / 3, h / 3, d / 3)), m); b.position.set(x, y, z); b.castShadow = b.receiveShadow = true; p.add(b); return b; };
    box(5.9, 0.9, 2.0, 0, 1.0, 0); box(5.2, 0.7, 2.9, -0.2, 1.75, 0); box(0.9, 0.5, 2.0, 2.9, 0.8, 0).rotation.z = 0.5; box(1.2, 0.25, 0.4, 2.2, 2.15, -0.7);
    // tracks with scrolling link texture, road wheels, sprocket, idler, side skirts
    const tm = new THREE.MeshStandardMaterial({ map: this.track, roughness: 1 }); this.track.wrapS = this.track.wrapT = THREE.RepeatWrapping; this.track.repeat.set(1, 10);
    for (const s of [-1, 1]) {
      const tr = new THREE.Mesh(new THREE.BoxGeometry(6.0, 1.0, 0.5), [tm, tm, tm, tm, tm, tm]); tr.position.set(0, 0.6, s * 1.25); tr.castShadow = true; T.add(tr);
      for (let i = 0; i < 8; i++) { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.2, 18), dark); w.rotation.x = Math.PI / 2; w.position.set(-2.3 + i * 0.62, 0.42, s * 1.52); w.castShadow = true; T.add(w); this.wheels.push(w);
        const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.22, 8), grey); hub.position.y = 0.0; w.add(hub); hub.position.set(0.12, 0.01, 0); }
      for (const x of [2.85, -2.85]) { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.3, 10), grey); w.rotation.x = Math.PI / 2; w.position.set(x, 0.9, s * 1.45); T.add(w); this.wheels.push(w); }
      box(5.4, 0.85, 0.06, -0.1, 1.5, s * 1.82).rotation.x = s * 0.05;
    }
    // turret
    T.add(this.turret); this.turret.position.set(-0.3, 2.1, 0);
    box(2.6, 0.95, 2.2, 0, 0.47, 0, grey, this.turret); box(1.6, 0.6, 1.6, -0.2, 1.0, 0, grey, this.turret).scale.set(1, 1, 1);
    const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.38, 0.35, 12), grey); cup.position.set(-0.9, 1.1, 0); cup.castShadow = true; this.turret.add(cup);
    box(0.2, 0.7, 2.3, -1.4, 0.4, 0, grey, this.turret);
    this.turret.add(this.gun); this.gun.position.set(1.3, 0.5, 0);
    box(0.5, 0.5, 0.6, 0.15, 0, 0, grey, this.gun);
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.11, 3.4, 12), grey); barrel.rotation.z = -Math.PI / 2; barrel.position.x = 2.0; barrel.castShadow = true; this.gun.add(barrel);
    const brake = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.35, 12), dark); brake.rotation.z = -Math.PI / 2; brake.position.x = 3.75; this.gun.add(brake);
    // balkenkreuz decal
    const dec = cnv(128, 128, (g) => { g.fillStyle = "#f2f0e8"; g.fillRect(10, 44, 108, 40); g.fillRect(44, 10, 40, 108); g.fillStyle = "#141414"; g.fillRect(22, 54, 84, 20); g.fillRect(54, 22, 20, 84); });
    const d = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.7), new THREE.MeshStandardMaterial({ map: dec, transparent: true, roughness: 0.8 })); d.position.set(0.2, 1.75, 1.46); T.add(d);
    this.root.add(T);
  }
  update(f: number, cam: THREE.PerspectiveCamera) {
    const t = f / FPS, since = t - T_HIT;
    // tank: rolls in and brakes (eased), turret traverses then recoils
    const tx = lerp(-16, -3, sm(t / 4.2)), vx = (lerp(-16, -3, sm((t + 0.01) / 4.2)) - tx) / 0.01;
    this.tank.position.set(tx, 0, -3.2); this.tank.rotation.z = -0.012 * Math.sin(t * 9) * Math.min(1, vx / 2) + (t > 4.0 && t < 4.6 ? 0.02 * Math.sin((t - 4.0) * 10) * Math.exp(-(t - 4) * 5) : 0);
    const dist = tx + 16; for (const w of this.wheels) w.rotation.y = -dist / 0.35; this.track.offset.y = dist / 6;
    this.turret.rotation.y = 0.35 * sm((t - 3.4) / 1.3); this.gun.rotation.z = 0.06 * sm((t - 3.6) / 1.2);
    const rc = t > T_FIRE ? Math.exp(-(t - T_FIRE) * 8) * Math.sin(Math.min(Math.PI, (t - T_FIRE) * 40)) : 0; this.gun.position.x = 1.3 - 0.45 * Math.max(0, rc);
    if (t > T_FIRE && t < T_FIRE + 0.3) this.tank.rotation.z += 0.03 * Math.exp(-(t - T_FIRE) * 12);
    // muzzle
    const mf = t > T_FIRE ? Math.exp(-(t - T_FIRE) * 30) : 0; const mp = new THREE.Vector3(5.6, 0, 0); this.gun.localToWorld(mp);
    this.muzzle.position.copy(mp); this.muzzle.scale.setScalar(0.1 + 3.4 * mf); (this.muzzle.material as THREE.SpriteMaterial).opacity = mf;
    // explosion light + fireball cells
    const hit = new THREE.Vector3(9.5, 4.2, -11.8);
    const fl = since > 0 ? Math.exp(-since * 4) * (1 + 0.3 * Math.sin(since * 60)) : 0;
    this.flash.position.copy(hit); this.flash.intensity = 900 * fl + 300 * mf; if (mf > 0.01) this.flash.position.copy(mp);
    this.ball.forEach((m, i) => { const a = since - 0.02 * i * hs(i, 3); const mat = m.material as THREE.SpriteMaterial;
      if (a <= 0 || a > 1.6) { mat.opacity = 0; return; }
      const dir = new THREE.Vector3(hs(i, 1) - 0.5, hs(i, 2) * 0.8 - 0.1, hs(i, 4) * 0.6 + 0.2).normalize(), r = 4.5 * (1 - Math.exp(-a * 5)) * (0.5 + hs(i, 5));
      m.position.copy(hit).addScaledVector(dir, r).add(new THREE.Vector3(0, a * a * 2, 0)); m.scale.setScalar((1.5 + 3 * hs(i, 6)) * (0.5 + a));
      mat.opacity = Math.max(0, 1 - a / 1.6) ** 1.5; mat.color.setHSL(0.07 - 0.04 * a, 1, 0.55 - 0.2 * a); });
    // black smoke: billows rise and spread from the hit point (kind 0) and burning ruins (kind 1), lit orange from below while young
    this.smoke.forEach(({ m, seed: i, kind }) => {
      const mat = m.material as THREE.SpriteMaterial;
      if (kind === 0) { const a = since - 0.6 * hs(i, 1) - (i % 4) * 0.25; if (a <= 0) { mat.opacity = 0; return; }
        const dir = new THREE.Vector3((hs(i, 2) - 0.5) * 1.3, 0.2 + hs(i, 3) * 0.7, 0.3 + hs(i, 4) * 0.6).normalize();
        m.position.copy(hit).addScaledVector(dir, 5 * (1 - Math.exp(-a * 1.8))).add(new THREE.Vector3(0.6 * a, 0.75 * a + 0.06 * a * a, 0));
        m.scale.setScalar((3.2 + 3 * hs(i, 5)) * (0.6 + 0.6 * a)); m.material.rotation = hs(i, 6) * 6 + a * 0.3 * (hs(i, 7) - 0.5);
        const heat = Math.exp(-a * 1.4); const gv = 0.05 + 0.14 * hs(i, 12); mat.color.setRGB(gv + 0.7 * heat, gv * 0.92 + 0.22 * heat, gv * 0.85 + 0.02 * heat); mat.opacity = Math.min(1, a * 6) * Math.max(0, 1 - a / 12);
      } else { const k = i - 80, src = this.fires[k % 3].position, per = 5, a = ((t + hs(k, 8) * per) % per);
        m.position.set(src.x + (hs(k, 9) - 0.5) * 1.5 + 0.8 * a, src.y + 0.4 + 1.5 * a + 0.12 * a * a, src.z + (hs(k, 10) - 0.5));
        m.scale.setScalar(1.2 + 1.1 * a); m.material.rotation = hs(k, 11) * 6 + 0.2 * a;
        const heat = Math.exp(-a * 2.2); mat.color.setRGB(0.04 + 0.4 * heat, 0.035 + 0.12 * heat, 0.03); mat.opacity = Math.min(1, a * 3) * (1 - a / per) * 0.85; }
    });
    // burning ruins flicker
    this.fires.forEach((l, i) => { l.intensity = 30 * (0.75 + 0.25 * Math.sin(t * 13 + i * 2) * Math.sin(t * 7.3 + i)); });
    this.fireS.forEach((s, k) => { const src = this.fires[Math.floor(k / 6)].position, ph = (t * (1.6 + hs(k, 3)) + hs(k, 2)) % 1;
      s.position.set(src.x + (hs(k, 4) - 0.5) * 1.2, src.y - 0.6 + 1.6 * ph, src.z + 0.3); s.scale.setScalar((1.4 - ph) * (1 + 0.6 * hs(k, 5)));
      (s.material as THREE.SpriteMaterial).opacity = (1 - ph) * 0.9; (s.material as THREE.SpriteMaterial).color.setHSL(0.06 + 0.05 * (1 - ph), 1, 0.5); });
    // debris: ballistic with gravity, ground bounce with damping, tumbling
    this.debris.forEach(({ m, v, w, seed }) => { if (since <= 0) { m.visible = false; return; } m.visible = true;
      let a = since, p = hit.clone(), vy = v.y, y = 0, bounce = 0; const h0 = hit.y;
      // analytic piecewise bounce
      let tt = a, yy = h0, vv = vy;
      for (let k = 0; k < 4; k++) { const tl = (vv + Math.sqrt(vv * vv + 2 * 9.8 * yy)) / 9.8; if (tt < tl) { y = yy + vv * tt - 4.9 * tt * tt; break; } tt -= tl; yy = 0.0; vv = Math.abs(vv - 9.8 * tl) * 0.35; bounce++; y = 0; }
      const drag = 1 - Math.exp(-a * 1.2);
      p.x += v.x * drag / 1.2 * (bounce ? 0.8 : 1); p.z += v.z * drag / 1.2; p.y = Math.max(0.1, y);
      m.position.copy(p); const spin = bounce >= 3 ? 0 : 1; m.rotation.set(w.x * Math.min(a, 2) * spin + seed, w.y * Math.min(a, 2) * spin, w.z * Math.min(a, 2) * spin); });
    // soldiers: same toon cards, side-view walk/run, re-drawn every frame (continuous phase); face camera (yaw billboard)
    this.men.forEach((man, i) => {
      const vel = [1.35, 1.25, 1.4][i] * (i === 2 && since > 0.3 ? 2.2 : 1), x0 = [-14.5, -17.5, -11][i], z = [0.2, -0.6, 1.6][i];
      const run = i === 2 && since > 0.3, x = x0 + [1.35, 1.25, 1.4][i] * t + (run ? 1.4 * 1.2 * (since - 0.3) : 0);
      const ph = (Math.abs(x - x0) / (run ? 2.4 : 1.5) + hs(man.id)) % 1;
      const g = man.cv.getContext("2d")!; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, 1200, 2000); g.setTransform(2, 0, 0, 2, 0, 0);
      const duck = since > 0 && since < 1.2 && i !== 2;
      bodySide(new Pen(g), sol(WEH, i), { mode: duck ? "stand" : "march", phase: ph, stride: run ? 1.35 : 1, expr: since > 0 ? "shout" : "stern", seed: man.id, blink: 0 } as never);
      man.tex.needsUpdate = true;
      man.mesh.position.set(x, 0, z); man.mesh.rotation.y = Math.atan2(cam.position.x - x, cam.position.z - z);
      man.mesh.rotation.z = run ? -0.12 : duck ? -0.05 : 0; man.mesh.scale.y = duck ? 0.92 : 1 + 0.015 * Math.sin(ph * Math.PI * 4);
    });
    // ash drift
    const pa = this.ash.geometry.getAttribute("position") as THREE.BufferAttribute;
    for (let i = 0; i < pa.count; i++) { const y = (hs(i, 1) * 14 - t * (0.3 + 0.4 * hs(i, 2))) % 14; pa.setXYZ(i, -22 + 44 * hs(i, 3) + Math.sin(t + i) * 0.4 + t * 0.6, y < 0 ? y + 14 : y, -14 + 20 * hs(i, 4)); }
    pa.needsUpdate = true;
  }
}

// ---------- camera: low dolly behind rubble, rising crane + orbit, shake on the hit ----------
const camAt = (t: number, cam: THREE.PerspectiveCamera) => {
  const k = sm(t / 10), sh = t > T_HIT ? Math.exp(-(t - T_HIT) * 2.5) * 0.18 : 0, mf = t > T_FIRE ? Math.exp(-(t - T_FIRE) * 10) * 0.08 : 0;
  const ang = lerp(-0.45, 0.3, k), r = lerp(15, 18, k), cx = lerp(-9, 2, k);
  cam.position.set(cx + Math.sin(ang) * r + (sh + mf) * Math.sin(t * 47), lerp(1.7, 4.4, sm(t / 9)) + (sh + mf) * Math.sin(t * 61), Math.cos(ang) * r - 3);
  cam.lookAt(lerp(-9, 4, sm((t - 0.5) / 8)), lerp(1.6, 3.4, sm((t - 3.5) / 3)), -4.5);
  cam.fov = lerp(34, 40, k); cam.updateProjectionMatrix();
};

const Inner: React.FC = () => {
  const f = useCurrentFrame();
  const { camera, scene, gl, size } = useThree();
  const world = useMemo(() => new World(), []);
  useMemo(() => { const sky = skyTex(); sky.mapping = THREE.EquirectangularReflectionMapping; scene.background = skyTex(); scene.fog = new THREE.Fog("#8a6a5a", 25, 110); gl.shadowMap.type = THREE.PCFSoftShadowMap; }, [scene, gl]);
  const composer = useMemo(() => {
    const c = new EffectComposer(gl, { multisampling: 4, frameBufferType: THREE.HalfFloatType });
    c.addPass(new RenderPass(scene, camera));
    c.addPass(new EffectPass(camera, new BloomEffect({ blendFunction: BlendFunction.ADD, intensity: 1.1, luminanceThreshold: 0.85, luminanceSmoothing: 0.25, mipmapBlur: true, radius: 0.7 }),
      new ToneMappingEffect({ mode: ToneMappingMode.ACES_FILMIC }), new VignetteEffect({ offset: 0.3, darkness: 0.62 })));
    const n = new NoiseEffect({ blendFunction: BlendFunction.OVERLAY }); n.blendMode.opacity.value = 0.12; c.addPass(new EffectPass(camera, n));
    return c;
  }, [gl, scene, camera]);
  useMemo(() => composer.setSize(size.width, size.height), [composer, size]);
  useFrame(() => composer.render(), 1);
  const cam = camera as THREE.PerspectiveCamera;
  camAt(f / FPS, cam);
  world.update(f, cam);
  return <primitive object={world.root} dispose={null} />;
};

export const Ww2Test3D: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <ThreeCanvas width={1920} height={1080} shadows gl={{ antialias: false, stencil: false, toneMappingExposure: 1.0 }} camera={{ fov: 36, near: 0.1, far: 400 }}>
      <Inner />
    </ThreeCanvas>
  </AbsoluteFill>
);
