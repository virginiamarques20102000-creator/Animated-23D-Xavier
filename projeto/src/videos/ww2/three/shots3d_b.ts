// 3D action shots, part B (254 – 480 s): Pacific, Africa, Stalingrad, D-Day, Berlin, the bombs, Manchuria.
import * as THREE from "three";
import { Stage, V, hs, sm, lerp } from "./core";
import { tank, plane, ship, truck, howitzer, katyusha, abomb, building, tree, rocks, sandbags, hedgehog, bunker, crater, rbox, cyl, M } from "./models";
import { blast, fire, smokeCol, dust, muzzle, tracers, flak, exhaust, weather, clouds, mushroom } from "./fx3";
import { actor, walker, stander, marcherF, fallK } from "./actors";
import { Shot3, path, track, ground, hills, sea, seaY, street, drive, fly } from "./set";
import { WEH, RED, REDH, GI, TOMMY, MARINE, VOLKS, sol } from "../kit";

function deckY0() { return 11.8; }
const wakeLine = (S: Stage, from: (t: number) => THREE.Vector3, t0: number, t1: number) => dust(S, from, t0, t1, { col: "#e8eef2", rate: 12, sc: 0.8, life: 2.5 });

export const SHOTS_B: Shot3[] = [
  // "No dia 7 de dezembro de 1941," — torpedo bombers skim the sea at dawn, roaring past the lens
  { t0: 254.0, t1: 257.3, mood: "pacific", over: { sunAz: -10, sunEl: 6 }, bloom: 1.2, build: (S) => {
      sea(S, "#1e4466", 0.8); clouds(S, 20, [0, 300, -900], [3000, 120, 1200], "#ffe2c8", 3, 2, 2.4);
      for (let i = 0; i < 5; i++) { const p = plane("kate"); fly(S, p.g, (t) => V(-8 + i * 16 - 3 * i * 0, 9 + i * 1.5 + 0.4 * Math.sin(t + i), -220 + 70 * t + i * 22), (t) => 0.06 * Math.sin(t * 1.3 + i), p.spin);
        dust(S, (t) => V(-8 + i * 16, 0.2, -230 + 70 * t + i * 22), 0, 3.3, { col: "#dfe8ee", rate: 6, sc: 0.8, life: 1.5 }); } },
    cam: path(3.3, [[0, [4, 2.6, 6], [0, 8, -120], 36], [0.7, [4, 2.4, 6], [6, 10, -20], 42], [1, [4, 2.6, 6], [16, 12, 60], 48]]) },
  // "a base naval americana de Pearl Harbor" — torpedoes run at battleship row; the first one strikes
  { t0: 260.5, t1: 262.3, mood: "pacific", over: { sunAz: 60, sunEl: 14 }, build: (S) => {
      sea(S, "#2a5470", 0.25); ground(S, "grass", 3000, 100, 0.4).position.z = -1900;
      for (let i = 0; i < 3; i++) { const B = ship("bb", { col: "#7a8088" }); B.g.position.set(-60 + i * 200, 0, -260); S.add(B.g); }
      for (let i = 0; i < 4; i++) { const z0 = -40 - i * 5, x = -40 + i * 18; wakeLine(S, (t) => V(x + 4 * t, 0.2, z0 - 90 * t), 0, 1.8); }
      for (let i = 0; i < 3; i++) { const p = plane("kate"); fly(S, p.g, (t) => V(-30 + i * 20, 14 + 30 * t * t, -130 - 80 * t), (t) => -0.3 * t, p.spin); }
      blast(S, [-20, 0, -248], 1.45, 4, { water: true, smoke: 0.6, shake: 0.08 }); },
    cam: path(1.8, [[0, [-30, 3, 40], [-20, 2, -200], 34], [1, [-26, 3.4, 36], [-20, 8, -250], 34]]) },
  // "O ataque destruiu navios" — the battleship's magazine detonates: a towering fireball and black smoke
  { t0: 262.3, t1: 264.05, mood: "pacific", over: { sunAz: 30, sunEl: 20 }, bloom: 1.4, build: (S) => {
      sea(S, "#24506a", 0.25); const B = ship("bb", { col: "#6a7078" }); B.g.position.set(0, 0, -300); S.add(B.g); S.shadowAt(0, 0, -300, 160);
      blast(S, [10, 18, -300], 0.25, 14, { debris: 60, smoke: 2.2, shake: 0.3, light: 4, up: 3, smokeLife: 14 }); blast(S, [-20, 10, -300], 0.55, 8, { debris: 30, smoke: 1.2, up: 2 });
      fire(S, [0, 12, -300], 10); S.on((t) => { const k = t - 0.3; if (k > 0) { B.g.rotation.x = -0.04 * Math.min(1, k); B.g.position.y = -1.2 * Math.min(1, k); } }); },
    cam: path(1.75, [[0, [90, 6, -60], [0, 30, -300], 34], [1, [80, 7, -70], [0, 60, -300], 38]]) },
  // "No Oceano Pacífico, a Batalha de Midway" — an American carrier launches its dive-bombers
  { t0: 290.5, t1: 292.7, mood: "pacific", over: { sunAz: 80, sunEl: 25 }, build: (S) => {
      sea(S, "#1e4a72", 0.6); const C = ship("carrier", { nation: "us", col: "#5a6470" }); C.g.position.set(0, 0, 0); S.add(C.g); S.shadowAt(30, 10, 0, 90);
      const deckY = 7.2 + 4.6; for (let i = 0; i < 6; i++) { const p = plane("dauntless"); p.g.position.set(-60 - (i % 3) * 14, deckY + 1.7, -12 + Math.floor(i / 3) * 18); S.add(p.g); S.on((t) => p.spin(t)); }
      const L = plane("dauntless"), x = (t: number) => 0 + 0.5 * 14 * t * t + 6 * t; fly(S, L.g, (t) => V(x(t), deckY + 1.7 + (x(t) > 110 ? (x(t) - 110) * 0.15 : 0), 0), () => 0, L.spin);
      for (let i = 0; i < 3; i++) stander(S, sol(GI, i, false), 150 + i, 30 + i * 4, 12 + i, () => ({ wave: 1, expr: "shout" as never })); },
    cam: path(2.2, [[0, [40, deckY0() + 14, 26], [10, deckY0() + 2, 0], 42], [1, [60, deckY0() + 12, 22], [110, deckY0() + 6, 0], 40]]) },
  // "representou uma grande vitória americana" — the Dauntlesses peel off and plunge through the clouds
  { t0: 292.7, t1: 294.2, mood: "pacific", over: { sunEl: 40 }, build: (S) => {
      sea(S, "#1e4a72", 0.6, 4000, 80); clouds(S, 30, [0, 1300, -800], [3000, 200, 2000], "#ffffff", 0, 6, 3);
      const K = ship("carrier", { nation: "jp", col: "#6a6e70" }); K.g.position.set(400, 0, -900); K.g.rotation.y = 0.5; S.add(K.g); wakeLine(S, () => V(300, 0.2, -840), -2, 1.5);
      for (let i = 0; i < 3; i++) { const p = plane("dauntless"); fly(S, p.g, (t) => { const a = Math.max(0, t - i * 0.25); return V(i * 16 + 40 * t + 60 * a * a, 1500 - 8 * i - 140 * a * a, -i * 10 - 80 * a * a); }, (t) => (t > i * 0.25 ? -2.6 * sm((t - i * 0.25) / 0.6) : 0), p.spin); } },
    cam: (t) => ({ p: [-20 + 40 * t, 1520, 26], l: [60 + 120 * t, 1440 - 150 * t, -60 - 40 * t], fov: 46, roll: -0.2 }) },
  // "contra a marinha japonesa." — bombs strike the carrier's deck; the hangar erupts
  { t0: 294.2, t1: 297.0, mood: "pacific", over: { sunEl: 35, sunAz: 120 }, bloom: 1.2, build: (S) => {
      sea(S, "#1e4a72", 0.6); const K = ship("carrier", { nation: "jp", col: "#6a6e70" }); S.add(K.g); S.shadowAt(0, 10, 0, 140);
      for (let i = 0; i < 8; i++) { const p = plane("zero"); p.g.position.set(-90 + i * 13, 13.5, (i % 2) * 10 - 5); S.add(p.g); }
      [[20, 12, 0, 0.4, 5], [-40, 12, 5, 1.0, 6], [-80, 12, -3, 1.6, 5], [40, 4, 0, 2.1, 8]].forEach(([x, y, z, t0, s]) => blast(S, [x, y, z], t0, s, { debris: 40, smoke: 1.5, light: 2, up: 2 }));
      fire(S, [20, 12, 0], 6, { t0: 0.7 }); fire(S, [-40, 12, 5], 7, { t0: 1.3 }); fire(S, [-80, 12, -3], 6, { t0: 1.9 });
      const d = plane("dauntless"); fly(S, d.g, (t) => V(-200 + 140 * t, 60 + 40 * t * t, 40), () => -0.4, d.spin); },
    cam: path(2.8, [[0, [160, 30, 140], [0, 10, 0], 36], [1, [120, 22, 160], [-30, 14, 0], 38]]) },
  // "Na África, os britânicos derrotaram" — El Alamein's night barrage: a thousand guns flash along the horizon
  { t0: 297.0, t1: 299.4, mood: "night", over: { hor: "#3a3040", gnd: "#1a1612" }, bloom: 1.4, build: (S) => {
      ground(S, "desert"); S.shadowAt(0, 0, 0, 30);
      for (let i = 0; i < 40; i++) { const x = -300 + i * 15 + 6 * hs(i, 2), z = -60 - 40 * hs(i, 3), ts = Array.from({ length: 4 }, (_, k) => 0.1 + k * 0.6 + 0.5 * hs(i, k + 4)); muzzle(S, () => V(x, 2, z), ts, 3, { smoke: false }); }
      for (let i = 0; i < 3; i++) { const H = howitzer({ col: "#9a8a62" }); H.g.position.set(-6 + i * 8, 0, 2 - i * 3); H.g.rotation.y = Math.PI * 0.95; S.add(H.g); const tf = 0.4 + i * 0.6;
        S.on((t) => { const a = t - tf; H.barrel.position.x = a > 0 ? -0.9 * Math.exp(-a * 7) * Math.min(1, a * 60) : 0; }); muzzle(S, H.muzzle, [tf, tf + 1.5], 2.4);
        stander(S, sol(TOMMY, i, false), 160 + i, -8 + i * 8, 4 - i * 3, (t) => ({ crouch: 0.2, expr: "stern" as never, armB: t > tf - 0.2 && t < tf + 0.3 ? 1 : 0 })); } },
    cam: path(2.4, [[0, [6, 1.6, 14], [-10, 3, -40], 40], [1, [12, 1.4, 12], [-30, 3, -60], 40]]) },
  // "...Batalha de El Alamein." — dawn: British tanks roll through the dust; infantry walk beside
  { t0: 299.4, t1: 302.95, mood: "desert", over: { sunEl: 8, sunAz: -30 }, hand: 0.04, build: (S) => {
      ground(S, "desert"); hills(S, "#b08a5a", 700, 20); S.shadowAt(0, 0, -6, 40);
      for (let i = 0; i < 5; i++) { const T = tank(i % 2 ? "sherman" : "crusader", { col: i % 2 ? "#a08a60" : undefined, nation: "uk" }), x0 = -24 - i * 14, z = -6 - (i % 2) * 8; drive(S, T, (t) => V(x0 + 5 * t, 0, z)); dust(S, (t) => V(x0 + 5 * t - 3, 0, z), -3, 3.5, { col: "#d8b888", rate: 7, sc: 1.8 }); }
      for (let i = 0; i < 6; i++) walker(S, sol(TOMMY, i), 170 + i, -14 - i * 3, 1 + (i % 2) * 1.2, 1.5);
      const W = tank("panzer", { burnt: true }); W.g.position.set(12, 0, -14); W.g.rotation.y = 2.2; W.turret.rotation.y = 0.6; W.barrel.rotation.z = -0.2; S.add(W.g); smokeCol(S, [12, 2, -14], 1.4); },
    cam: path(3.55, [[0, [-26, 1.4, 9], [-20, 1.4, -6], 38], [1, [-8, 1.8, 10], [-4, 1.4, -8], 40]]) },
  // "A cidade de Stalingrado se transformou em um verdadeiro inferno." — the ruined city burns under a red sky
  { t0: 307.55, t1: 312.0, mood: "fire", bloom: 1.3, build: (S) => {
      ground(S, "rubble"); S.shadowAt(0, 0, -40, 90);
      for (let r = 0; r < 4; r++) street(S, -20 - r * 34, -160, 160, { broken: 0.85, h: [8, 22], hue: 22, seed: 30 + r, lit: 36 });
      rocks(S.root, 260, -80, 80, -140, 10, ["#4a4038", "#5a4438"], 0.2, 1.4, 5);
      for (let i = 0; i < 9; i++) fire(S, [-120 + i * 30, 6 + 8 * hs(i, 1), -30 - 34 * (i % 4)], 3 + 2 * hs(i, 2));
      for (let i = 0; i < 4; i++) smokeCol(S, [-100 + i * 60, 10, -90 - 20 * i], 7, { grey: 0.05, per: 9 });
      [[-30, -60, 1.2], [50, -110, 2.6], [-80, -130, 3.6]].forEach(([x, z, t0]) => blast(S, [x, 4, z], t0, 5, { debris: 30, shake: 0.03 }));
      const st = plane("stuka"); fly(S, st.g, (t) => V(-160 + 60 * t, 90 - 4 * t, -80), () => 0.2, st.spin); weather(S, "ash", 1500); },
    cam: path(4.45, [[0, [0, 42, 60], [0, 12, -80], 44], [0.5, [-20, 30, 40], [-10, 14, -90], 42], [1, [-36, 18, 26], [-20, 12, -80], 40]]) },
  // "casa por casa," — a Soviet soldier sprints across the rubble street; bullets kick up dust at his heels
  { t0: 315.6, t1: 316.95, mood: "overcast", over: { top: "#4a4a50", hor: "#8a8078" }, hand: 0.06, build: (S) => {
      ground(S, "rubble"); street(S, -12, -40, 40, { broken: 1, h: [8, 14], seed: 44, hue: 24 }); rocks(S.root, 80, -20, 20, -10, 2, ["#5a5048", "#6a5040"], 0.2, 0.9, 7, (x, z) => Math.abs(z) < 1.5 && x > -10 && x < 10);
      S.shadowAt(0, 0, 0, 20); walker(S, sol(RED, 3), 180, -9, 0, 6.8, { run: true });
      for (let i = 0; i < 8; i++) blast(S, [-9 + 6.8 * (0.1 + i * 0.16) - 0.8 - 0.6 * hs(i, 1), 0, (hs(i, 2) - 0.5) * 1.2], 0.1 + i * 0.16, 0.18, { dirt: true, debris: 4, smoke: 0.2, shake: 0, light: 0.05 }); },
    cam: (t) => ({ p: [-6 + 5.5 * t, 1.1, 7], l: [-5 + 6.2 * t, 1.1, 0], fov: 40 }) },
  // "e bombardeios constantes." — a bomb hits; the façade collapses brick by brick
  { t0: 319.6, t1: 321.38, mood: "overcast", over: { top: "#3a3e48", hor: "#7a7470" }, build: (S) => {
      ground(S, "rubble"); S.shadowAt(0, 6, -14, 30); street(S, -30, -60, 60, { broken: 0.9, seed: 51 });
      const mat = M.std("#8a5a44", 1, 0, 91), geo = new THREE.BoxGeometry(1.2, 0.6, 0.8), N = 16 * 20, im = new THREE.InstancedMesh(geo, mat, N); im.castShadow = im.receiveShadow = true; S.root.add(im);
      const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), p = V(), s = V(1, 1, 1);
      S.on((t) => { for (let i = 0; i < N; i++) { const c = i % 16, r = Math.floor(i / 16), x0 = -9.6 + c * 1.22 + (r % 2) * 0.6, y0 = 0.3 + r * 0.62, win = (r % 5 > 1 && r % 5 < 4) && (c % 4 === 1 || c % 4 === 2);
          if (win) { s.setScalar(0); m4.compose(p.set(0, -50, 0), q, s); im.setMatrixAt(i, m4); continue; }
          const tf = 0.35 + (20 - r) * 0.035 + 0.15 * hs(i, 1) + Math.abs(c - 8) * 0.01, a = t - tf; s.setScalar(1);
          if (a <= 0 || r < 3) { e.set(0, 0, 0); q.setFromEuler(e); m4.compose(p.set(x0, y0, -14), q, s); }
          else { const vx = (hs(i, 2) - 0.5) * 4, vz = 2 + 5 * hs(i, 3); let y = y0 - 4.9 * a * a; const land = y < 0.3; const ta = land ? Math.sqrt((y0 - 0.3) / 4.9) : a; if (land) y = 0.3 + 0.2 * Math.exp(-(a - ta) * 6) * Math.abs(Math.sin((a - ta) * 14));
            e.set(ta * 4 * hs(i, 4), ta * 3 * hs(i, 5), ta * 5 * (hs(i, 6) - 0.5)); q.setFromEuler(e); m4.compose(p.set(x0 + vx * Math.min(a, ta + 0.3), y, -14 + vz * Math.min(a, ta + 0.3)), q, s); }
          im.setMatrixAt(i, m4); } im.instanceMatrix.needsUpdate = true; });
      blast(S, [0, 7, -13], 0.2, 3.5, { debris: 30, smoke: 1.4, shake: 0.18 }); smokeCol(S, [0, 2, -12], 4, { t0: 0.6, grey: 0.4 }); },
    cam: path(1.78, [[0, [6, 2.5, 18], [0, 7, -14], 44], [1, [8, 2.2, 20], [0, 5, -14], 44]]) },
  // "A partir daquele momento, os soviéticos começaram a avançar..." — T-34s roll west with infantry riding, past a burnt German wreck
  { t0: 337.6, t1: 343.5, mood: "dawn", over: { sunAz: 100, sunEl: 12, hor: "#e8b080" }, bloom: 1.1, build: (S) => {
      ground(S, "snow"); hills(S, "#8a90a0", 800, 40); S.shadowAt(0, 0, -6, 40); for (let i = 0; i < 30; i++) tree(S.root, -150 + 300 * hs(i, 1), -40 - 80 * hs(i, 2), "bare", 1.2, i);
      for (let i = 0; i < 5; i++) { const T = tank("t34"), x0 = 30 + i * 15, z = -4 - (i % 2) * 8; drive(S, T, (t) => V(x0 - 5 * t, 0, z)); dust(S, (t) => V(x0 - 5 * t + 3, 0, z), -2, 6, { col: "#eef2f6", rate: 6, sc: 1.5 });
        for (let k = 0; k < 2; k++) actor(S, sol(REDH, i * 2 + k), 190 + i * 2 + k, (t) => ({ x: x0 - 5 * t - 0.8 + k * 1.2, y: 1.75, z: z + 0.6 - k, f: { mode: "sit", expr: "stern", headTilt: 3 * Math.sin(t * 3 + k), blink: 0 } as never })); }
      const W = tank("panzer", { burnt: true, winter: false }); W.g.position.set(-8, -0.2, -12); W.g.rotation.set(0.05, 0.7, 0.06); W.turret.rotation.y = 1.0; S.add(W.g); smokeCol(S, [-8, 2, -12], 1.0, { grey: 0.2 }); weather(S, "snow", 1200); },
    cam: path(5.9, [[0, [-30, 2, 16], [0, 2, -6], 40], [0.5, [-14, 6, 18], [10, 2, -6], 42], [1, [-4, 3, 14], [16, 2.4, -6], 40]]) },
  // "Na madrugada de 6 de junho de 1944," — C-47s over Normandy at night; paratroopers jump into the flak
  { t0: 349.19, t1: 353.3, mood: "night", over: { stars: true, hor: "#2a3450" }, bloom: 1.3, build: (S) => {
      ground(S, "field").position.y = -300; clouds(S, 16, [0, -120, -600], [2400, 40, 1600], "#6a7490", 1, 4, 2);
      const lead = (t: number) => V(40 * t, 0, 0);
      for (let i = 0; i < 7; i++) { const p = plane("c47"), o = V(-(i % 4) * 40, -(i % 3) * 8, -Math.floor(i / 2) * 45 + 20); fly(S, p.g, (t) => lead(t).add(o), (t) => 0.04 * Math.sin(t + i), p.spin); }
      for (let k = 0; k < 8; k++) { const tj = 0.6 + k * 0.4; const can = new THREE.Mesh(new THREE.SphereGeometry(3.2, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), M.std("#c8c0a0", 0.95, 0)); can.visible = false; S.root.add(can);
        actor(S, sol(GI, k), 200 + k, (t) => { const a = t - tj; const p = lead(tj).add(V(-4, -1.5, 3)); if (a < 0) return { x: 0, z: 0, hide: true }; const op = Math.min(1, a / 0.7);
          const pos = V(p.x + 10 * Math.min(a, 1) , p.y - (a < 0.7 ? 4.9 * a * a : 2.4 + 5 * (a - 0.7)), p.z + 2 * a); can.visible = a > 0.5; can.position.set(pos.x, pos.y + 4.2, pos.z); can.scale.setScalar(op);
          return { x: pos.x, y: pos.y, z: pos.z, f: { mode: "stand", expr: "fear", armB: 1, blink: 0 } as never, sc: 0.9 }; }); }
      flak(S, [0, -10, -40], [300, 80, 200], 0.1, 4, 30, 9);
      tracers(S, (t) => V(-60 + 80 * hs(Math.round(t * 10), 1), -300, -100 + 80 * hs(Math.round(t * 10), 2)), (t) => V(40 * t + 40 * (hs(Math.round(t * 10), 3) - 0.5), 20, -30), Array.from({ length: 30 }, (_, i) => 0.1 + i * 0.13), "#ff9a50", 0.5); },
    cam: (t) => ({ p: [40 * t - 30, 4, 34], l: [40 * t + 10, -6, -10], fov: 44, roll: 0.05 * Math.sin(t * 0.8) }) },
  // "aconteceu uma das maiores operações militares da história." — dawn armada: battleships fire broadsides over the landing craft
  { t0: 353.3, t1: 357.1, mood: "overcast", over: { hor: "#c8b8a8", sunAz: 90, sunEl: 8 }, hand: 0.05, build: (S) => {
      sea(S, "#3a4a52", 0.9); const ships = [[-200, -500], [150, -650], [450, -520]].map(([x, z], i) => { const B = ship(i === 1 ? "cruiser" : "bb", { col: "#6a7078" }); B.g.position.set(x, 0, z); B.g.rotation.y = 0.15; S.add(B.g); B.turrets.forEach((tt) => (tt.rotation.y = 1.5)); B.guns.forEach((g) => (g.rotation.z = 0.1)); return B; });
      ships.forEach((B, i) => B.guns.forEach((g, k) => muzzle(S, () => g.localToWorld(V(20, 0, 0)), [0.4 + i * 0.7 + k * 0.08, 2.4 + i * 0.5 + k * 0.08], 10)));
      for (let i = 0; i < 16; i++) { const H = ship("higgins"), x0 = -120 + i * 18, z0 = -60 - 40 * hs(i, 1); S.add(H.g); H.g.rotation.y = Math.PI / 2; S.on((t) => { const z = z0 + 8 * t; H.g.position.set(x0, seaY(x0, z, t, 0.9) - 0.4, z); H.g.rotation.x = 0.06 * Math.sin(t * 1.4 + i); }); wakeLine(S, (t) => V(x0, 0.2, z0 + 8 * t - 6), -2, 3.8); } },
    cam: path(3.8, [[0, [0, 3, 40], [0, 10, -400], 40], [1, [30, 4, 30], [80, 14, -500], 38]]) },
  // "e desembarcaram" — the ramp drops (hinge + bounce), the men surge into the surf; one is hit
  { t0: 362.0, t1: 363.5, mood: "overcast", over: { hor: "#b8b0a4" }, hand: 0.09, build: (S) => {
      sea(S, "#4a5a5a", 0.5, 800, 120); ground(S, "sand", 1200, 60, 0.3).position.z = -640;
      const H = ship("higgins"); H.g.rotation.y = Math.PI / 2; S.add(H.g); S.shadowAt(0, 0, -10, 20);
      S.on((t) => { H.g.position.y = seaY(0, 0, t, 0.5) - 0.3; const a = t - 0.25; H.ramp!.rotation.z = a < 0 ? 0 : -Math.min(1.45, 4.9 * a * a) + (a > 0.55 ? 0.12 * Math.exp(-(a - 0.55) * 6) * Math.abs(Math.sin((a - 0.55) * 18)) : 0); });
      for (let i = 0; i < 6; i++) actor(S, sol(GI, i), 220 + i, (t) => { const a = Math.max(0, t - 0.45 - 0.08 * i), z = 3 - i * 1.0 - 4.8 * a, x = (i % 2 ? 0.5 : -0.5); const die = i === 1 ? 1.0 : 99;
        return { x, z, f: { mode: a > 0 && t < die ? "march" : "stand", phase: (4.8 * a / 1.9 + i * 0.3) % 1, expr: "fear", blink: 0 } as never, fall: fallK(t, die), fallDir: 0 }; });
      [0.6, 0.8, 0.95, 1.2].forEach((t0, i) => blast(S, [(hs(i, 1) - 0.5) * 6, 0, -8 - 6 * hs(i, 2)], t0, 0.25, { water: true, smoke: 0, shake: 0, light: 0.02 })); },
    cam: path(1.5, [[0, [0, 2.4, 6.5], [0, 1.6, -10], 50], [1, [0.3, 2.1, 6], [0, 1.4, -14], 50]]) },
  // "nas praias da Normandia, na França ocupada." — the wide beach: craft, smoke, hedgehogs, bunkers on the bluff firing
  { t0: 363.5, t1: 366.23, mood: "overcast", over: { hor: "#a8a49c", fogF: 600 }, hand: 0.05, build: (S) => {
      sea(S, "#4a5a5a", 0.5, 1200, 120, 0, 380); ground(S, "sand", 1200, 60, 0.15).position.z = -420; S.shadowAt(0, 0, -20, 60);
      const bluff = new THREE.Mesh(new THREE.BoxGeometry(800, 26, 60), M.std("#6a6a4a", 1, 0)); bluff.position.set(0, 13, -110); bluff.rotation.x = 0.35; S.root.add(bluff);
      for (let i = 0; i < 4; i++) { bunker(S.root, -90 + i * 60, -84, 0); muzzle(S, () => V(-87 + i * 60, 23, -78), Array.from({ length: 10 }, (_, k) => 0.1 + k * 0.25 + 0.1 * hs(i, k)), 1, { smoke: false }); }
      for (let i = 0; i < 24; i++) hedgehog(S.root, -80 + 160 * hs(i, 2), -10 - 40 * hs(i, 3), hs(i, 4) * 3);
      for (let i = 0; i < 5; i++) { const H = ship("higgins"); H.g.position.set(-70 + i * 32, 0, 16 + 8 * hs(i, 1)); H.g.rotation.y = Math.PI / 2; H.ramp!.rotation.z = -1.4; S.add(H.g); }
      for (let i = 0; i < 14; i++) walker(S, sol(GI, i), 230 + i, -40 + i * 6 + 2 * hs(i, 3), 6 - 2 * (i % 4), 0, { stop: 99 });
      for (let i = 0; i < 10; i++) actor(S, sol(GI, i + 20), 250 + i, (t) => { const x = -36 + i * 8, z = 8 - 6.5 * t, die = [0.9, 99, 1.8, 99, 99, 2.2, 99, 99, 99, 1.4][i]; return { x, z: t > die ? 8 - 6.5 * die : z, f: { mode: t < die ? "march" : "stand", phase: (6.5 * t / 1.9 + i * 0.37) % 1, expr: "shout", blink: 0 } as never, fall: fallK(t, die), fallDir: 0 }; });
      [[-20, -20, 0.3, 2], [30, -40, 1.1, 2.6], [-50, -5, 1.7, 2], [10, -12, 2.3, 2.4]].forEach(([x, z, t0, s]) => blast(S, [x, 0, z], t0, s, { dirt: true, debris: 20, col: "#a89070" }));
      smokeCol(S, [-60, 20, -90], 5, { grey: 0.15 }); smokeCol(S, [50, 20, -100], 6); },
    cam: path(2.73, [[0, [-30, 9, 50], [0, 6, -40], 44], [1, [10, 8, 46], [10, 6, -40], 44]]) },
  // "minas" — a mine erupts in a geyser of sand; men nearby are thrown down
  { t0: 376.55, t1: 377.15, mood: "overcast", over: { hor: "#a8a49c" }, hand: 0.1, build: (S) => {
      ground(S, "sand"); S.shadowAt(0, 0, -6, 20); for (let i = 0; i < 6; i++) hedgehog(S.root, -12 + i * 5, -12 - 4 * hs(i, 1), i);
      blast(S, [0, 0, -6], 0.08, 2.2, { dirt: true, debris: 30, col: "#b8a080", shake: 0.3 });
      for (let i = 0; i < 3; i++) walker(S, sol(GI, i + 40), 260 + i, -2.5 + i * 2.4, -4 + (i % 2) * 2, -3, { run: true, die: 0.12, dieDir: i === 0 ? -1 : 1 }); },
    cam: () => ({ p: [2, 1.6, 8], l: [0, 2, -6], fov: 44 }) },
  // "Em 1945, as tropas soviéticas chegaram" — Katyushas ripple-fire into the night
  { t0: 398.31, t1: 401.55, mood: "night", over: { hor: "#3a2a30" }, bloom: 1.4, build: (S) => {
      ground(S, "mud"); S.shadowAt(0, 0, 0, 30); for (let i = 0; i < 16; i++) tree(S.root, -80 + 160 * hs(i, 1), -40 - 30 * hs(i, 2), "pine", 1.3, i);
      for (let v = 0; v < 3; v++) { const K = katyusha(); K.g.position.set(-10 + v * 9, 0, -2 - v * 3); K.g.rotation.y = -0.3; S.add(K.g);
        for (let r = 0; r < 8; r++) { const tf = 0.2 + v * 0.35 + r * 0.16, rk = cyl(0.07, 0.07, 1.6, M.std("#4a4a40", 0.6, 0.5), S.root, 6); rk.visible = false;
          const p0 = () => K.aux[0].localToWorld(V(1.5, (r % 2) * 0.22 + 0.1, -0.84 + r * 0.24)), dir = V(Math.cos(0.32), Math.sin(0.32), 0).applyAxisAngle(V(0, 1, 0), -0.3);
          const pos = (t: number) => { const a = Math.max(0, t - tf), P = p0(); return P.add(dir.clone().multiplyScalar(40 * a * a + 8 * a)).add(V(0, -1.5 * a * a, 0)); };
          S.on((t) => { rk.visible = t > tf; rk.position.copy(pos(t)); rk.lookAt(pos(t + 0.02)); rk.rotateX(Math.PI / 2); });
          exhaust(S, pos, (t) => pos(t - 0.02).sub(pos(t)), tf, tf + 3, 0.4, { rate: 16, life: 2.5, grey: 0.55 }); } } },
    cam: path(3.24, [[0, [-22, 2, 12], [0, 3, -6], 40], [1, [-16, 2.4, 14], [20, 14, -30], 44]]) },
  // "A capital alemã estava cercada..." — a T-34 grinds down a ruined Berlin avenue, infantry behind it
  { t0: 403.1, t1: 406.0, mood: "overcast", over: { top: "#3a3a42", hor: "#9a8a7a" }, hand: 0.05, build: (S) => {
      ground(S, "cobble"); S.shadowAt(0, 0, -10, 30); for (const s of [-1, 1]) for (let i = 0; i < 9; i++) building(S.root, s * 14, 10 - i * 12, 10, 10 + 8 * hs(i, s + 3), 10, { broken: hs(i, s + 7) < 0.7, rot: -s * Math.PI / 2, seed: 70 + i + (s > 0 ? 20 : 0), hue: 35, lit: 50 });
      rocks(S.root, 120, -10, 10, -100, 10, ["#6a6258", "#7a6a5a"], 0.2, 1.0, 9, (x) => Math.abs(x) < 3);
      const T = tank("t34"); drive(S, T, (t) => V(0, 0, -30 + 3.5 * t)); T.g.rotation.y = Math.PI / 2; S.on(() => (T.turret.rotation.y = 0.2)); muzzle(S, T.muzzle, [1.6], 1.6);
      blast(S, [-9, 6, -60], 1.9, 3, { debris: 30 }); fire(S, [10, 2, -40], 2.5); smokeCol(S, [-6, 10, -90], 5);
      for (let i = 0; i < 5; i++) marcherF(S, sol(RED, i), 270 + i, -3 + (i % 3) * 3, -42 - i * 2, 3.4, "stern"); },
    cam: (t) => ({ p: [2.5, 1.3, -14 + 3.0 * t], l: [0, 2, -34 + 3.3 * t], fov: 40 }) },
  // "nas próprias ruas da cidade." — close quarters: muzzle flashes across a barricade, a defender falls
  { t0: 406.0, t1: 408.5, mood: "fire", over: { hor: "#8a4a2a" }, hand: 0.08, bloom: 1.2, build: (S) => {
      ground(S, "cobble"); S.shadowAt(0, 0, -6, 20); street(S, -26, -40, 40, { broken: 1, seed: 77, hue: 30 }); sandbags(S.root, 0, -8, 14, 4); rocks(S.root, 30, -8, 8, -9, -6, ["#5a5048"], 0.3, 1.1, 3);
      const defs = [0, 1, 2, 3].map((i) => { const x = -5 + i * 3.2; stander(S, i % 2 ? sol(VOLKS, i) : sol(WEH, i), 280 + i, x, -9.2, () => ({ expr: "shout" as never, crouch: 0.2 }), { die: i === 2 ? 1.3 : undefined, dieDir: 0, sc: 0.95 }); muzzle(S, () => V(x + 0.4, 1.4, -8.6), [0.2 + i * 0.3, 0.9 + i * 0.25, 1.7 + i * 0.2].filter((x) => i !== 2 || x < 1.3), 0.5); return x; });
      for (let i = 0; i < 3; i++) { const x = -3 + i * 3; actor(S, sol(RED, i + 5), 290 + i, (t) => ({ x, z: 3 + i * 0.4, side: true, flip: true, s: { mode: "stand", expr: "shout", blink: 0, pose: 0 } as never })); muzzle(S, () => V(x - 0.2, 1.3, 2.4), [0.4 + i * 0.2, 1.1 + i * 0.3, 1.9], 0.5); }
      tracers(S, () => V(-2, 1.3, 2.4), (t) => V(defs[Math.round(t * 3) % 4] + 0.2, 1.2, -9), [0.5, 0.8, 1.1, 1.4, 1.7, 2.0], "#ffb860"); tracers(S, (t) => V(defs[Math.round(t * 5) % 4], 1.4, -8.6), () => V(0, 1.4, 3), [0.3, 0.7, 1.2, 1.6, 2.1], "#ff9050");
      fire(S, [12, 0.3, -12], 1.6); weather(S, "ash", 800); },
    cam: path(2.5, [[0, [3, 1.5, 7], [-2, 1.3, -8], 42], [1, [1, 1.3, 6.5], [-3, 1.2, -9], 44]]) },
  // "e os combates no Pacífico permaneciam extremamente violentos." — a kamikaze dives through the flak onto the ship
  { t0: 437.55, t1: 440.3, mood: "pacific", over: { sunEl: 30, sunAz: 140 }, hand: 0.07, build: (S) => {
      sea(S, "#1e4a72", 0.7); const D = ship("cruiser", { col: "#5a6470" }); D.g.position.set(0, 0, -40); D.g.rotation.y = 0.3; S.add(D.g); S.shadowAt(0, 0, -40, 100);
      const z = plane("zero"), zp = (t: number) => V(-260 + 120 * t, 160 - 70 * t - 6 * t * t, -380 + 150 * t); fly(S, z.g, (t) => (t < 2.3 ? zp(t) : zp(2.3)), (t) => 0.3 * Math.sin(t * 2), z.spin); S.on((t) => (z.g.visible = t < 2.32));
      exhaust(S, zp, (t) => zp(t - 0.05).sub(zp(t)), 1.2, 2.3, 0.5, { grey: 0.12, rate: 20, life: 2 });
      flak(S, [-120, 90, -250], [200, 120, 260], 0.0, 2.6, 30, 11);
      tracers(S, () => V(10, 14, -30), (t) => zp(t + 0.2), Array.from({ length: 20 }, (_, i) => 0.1 + i * 0.11), "#ffcc66", 0.4);
      blast(S, [16, 14, -40], 2.3, 6, { debris: 50, smoke: 1.6, shake: 0.2, light: 3, up: 2 }); fire(S, [16, 14, -40], 6, { t0: 2.5 }); },
    cam: path(2.75, [[0, [40, 18, 10], [-100, 90, -260], 44], [0.8, [40, 17, 10], [-10, 40, -100], 46], [1, [42, 17, 12], [10, 16, -40], 46]]) },
  // "No dia 6 de agosto de 1945," — the B-29 alone, high in a clear morning sky, contrails streaming
  { t0: 445.44, t1: 448.95, mood: "day", over: { sunEl: 30, sunAz: 90, gnd: "#9ab0c8", hor: "#d8e4f0" }, build: (S) => {
      clouds(S, 60, [0, -400, 0], [4000, 60, 4000], "#ffffff", 0, 14, 3.5);
      const B = plane("b29"); fly(S, B.g, (t) => V(90 * t, 0, 0), () => 0, B.spin);
      for (const z of B.spec.eng) { const tr = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.3, 200, 10, 1, true), new THREE.MeshBasicMaterial({ color: "#ffffff", transparent: true, opacity: 0.55, depthWrite: false }));
        tr.geometry.rotateZ(Math.PI / 2); tr.geometry.translate(-100, 0, 0); S.root.add(tr); S.on((t) => tr.position.set(90 * t - 6, B.spec.wingY - 0.2, z)); } },
    cam: (t) => ({ p: [90 * t + 30 - 8 * t, 10 + 1.5 * t, 46 - 4 * t], l: [90 * t - 6, 0, 0], fov: 40 }) },
  // "uma bomba atômica foi lançada" — the bomb drops from the bay, tumbles, its fins catch the air
  { t0: 448.95, t1: 450.95, mood: "day", over: { sunEl: 30, sunAz: 90, gnd: "#9ab0c8" }, build: (S) => {
      clouds(S, 50, [0, -400, 0], [4000, 60, 4000], "#ffffff", 0, 15, 3.5);
      const B = plane("b29"); fly(S, B.g, (t) => V(90 * t, 0, 0), () => 0, B.spin); const bomb = abomb(false); S.add(bomb);
      S.on((t) => { const a = Math.max(0, t - 1.0); bomb.position.set(90 * t - 2 - 6 * a * a * 0.3 - 0, -1.6 - 4.9 * a * a, 0); bomb.position.x = 90 * 1.0 + 86 * a - 2; bomb.rotation.set(0, 0, -0.05 - (a > 0 ? 0.9 * sm(a / 1.2) + 0.15 * Math.sin(a * 6) * Math.exp(-a * 2) : 0)); }); },
    cam: (t) => { const a = Math.max(0, t - 1.0); return { p: [90 * Math.min(t, 1.0) + 86 * a + 8, -6 - 4.9 * a * a * 0.85, 14], l: [90 * Math.min(t, 1.0) + 86 * a, -2 - 4.9 * a * a, 0], fov: 44 }; } },
  // "A explosão destruiu grande parte da cidade" — white flash, the fireball climbs into the mushroom
  { t0: 452.24, t1: 454.8, mood: "day", over: { sunEl: 40, sunAz: 120, fogF: 8000, hor: "#d8e0e8" }, bloom: 1.6,
    white: (t) => (t < 0.08 ? 0 : t < 0.2 ? 1 : Math.max(0, 1 - (t - 0.2) / 0.5)), build: (S) => {
      ground(S, "grass", 20000, 400); hills(S, "#5a6a5a", 3500, 260, 30); sea(S, "#3a5a7a", 0.3, 6000, 60, 0, 2600);
      for (let i = 0; i < 260; i++) { const r = 1600 * Math.sqrt(hs(i, 1)), a = hs(i, 2) * 6.28; rbox(14 + 20 * hs(i, 3), 8 + 10 * hs(i, 4), 14 + 20 * hs(i, 5), M.std("#8a8070", 1, 0, 3), S.root, Math.cos(a) * r, 5, Math.sin(a) * r - 400, 2); }
      mushroom(S, [0, 0, -400], 0.1, 1.6); },
    cam: path(2.56, [[0, [600, 120, 2600], [0, 200, -400], 40], [1, [560, 130, 2500], [0, 420, -400], 42]]) },
  // "Nesse mesmo período, a União Soviética declarou guerra ao Japão" — Soviet armour crosses the Manchurian grassland
  { t0: 472.31, t1: 479.88, mood: "golden", over: { sunAz: -50, sunEl: 10 }, bloom: 1.1, build: (S) => {
      ground(S, "steppe"); hills(S, "#6a5a3a", 700, 70); hills(S, "#4a3e2e", 1100, 120, 20, 3); S.shadowAt(10, 0, -10, 60);
      for (let i = 0; i < 9; i++) { const T = tank("t34"), x0 = -60 - (i % 3) * 20, z = -2 - Math.floor(i / 3) * 14; drive(S, T, (t) => V(x0 + 7 * t, 0, z)); dust(S, (t) => V(x0 + 7 * t - 3, 0, z), -3, 7.6, { col: "#b8a070", rate: 5, sc: 1.8 });
        if (i < 3) for (let k = 0; k < 2; k++) actor(S, sol(REDH, i * 2 + k), 300 + i * 2 + k, (t) => ({ x: x0 + 7 * t - 0.8 + k * 1.2, y: 1.75, z: z + 0.6 - k, f: { mode: "sit", expr: "stern", headTilt: 3 * Math.sin(t * 3 + k), blink: 0 } as never })); }
      for (let i = 0; i < 4; i++) { const v = truck({ col: "#5a6040", nation: "su" }), x0 = -110 - i * 14; drive(S, v, (t) => V(x0 + 7 * t, 0, -44)); }
      for (let i = 0; i < 8; i++) walker(S, sol(RED, i), 310 + i, -40 + i * 3, 6 + (i % 2), 1.6); },
    cam: path(7.57, [[0, [-60, 1.4, 16], [-40, 1.6, -4], 38], [0.35, [-30, 8, 22], [-20, 2, -6], 40], [0.7, [0, 22, 30], [-10, 1, -14], 42], [1, [30, 30, 10], [-6, 0, -16], 44]]) },
];

void lerp; void hs; void crater; void rbox; void track; void howitzer; void MARINE; void REDH; void street; void weather; void stander; void fly; void marcherF; void sandbags;
