// 3D action shots, part A (0 – 242 s). Times are film seconds (word-synced, tempos_palavras.txt); t inside build/cam is shot-local.
import * as THREE from "three";
import { Stage, V, hs, sm, lerp, clamp, ei, eo } from "./core";
import { tank, plane, ship, truck, howitzer, v2, building, tree, rocks, sandbags, pole, wire, crater, rbox, cyl, M, decal } from "./models";
import { blast, fire, smokeCol, dust, muzzle, tracers, flak, exhaust, weather, clouds } from "./fx3";
import { actor, walker, stander, marcherF, fallK } from "./actors";
import { Shot3, path, track, ground, hills, sea, street, drive, fly, bigSun, planks } from "./set";
import { WEH, RED, REDW, POLE, RAF, civ, sol, v as ov } from "../kit";

const stukaP = (t: number) => (t < 1.7 ? V(-20 + 30 * t, 260 - 150 * t, -60 + 6 * t) : V(-20 + 30 * t, 5 + (260 - 150 * 1.7) - 5 + 120 * (t - 1.7) ** 2, -60 + 6 * t));
const near = (x: number, z: number) => (cx: number, cz: number, r: number) => Math.hypot(x - cx, z - cz) < r;
void near;

export const SHOTS_A: Shot3[] = [
  // "Imagine um mundo onde cidades inteiras são destruídas," — burning street at night, bombers overhead, a block collapses on "destruídas" (3.05)
  { t0: 0, t1: 3.9, mood: "fire", bloom: 1.1, build: (S) => {
      ground(S, "cobble"); S.shadowAt(0, 0, -20, 45);
      for (let i = 0; i < 7; i++) building(S.root, -12, -12 - i * 11, 9, 9 + 8 * hs(i, 5), 9, { broken: i % 2 === 0, seed: 40 + i, rot: Math.PI / 2 });
      const fall = building(S.root, 12, -20, 9, 15, 9, { broken: false, seed: 55, rot: -Math.PI / 2 });
      for (let i = 1; i < 7; i++) building(S.root, 12, -20 - i * 11, 9, 8 + 9 * hs(i, 6), 9, { broken: i % 2 === 1, seed: 60 + i, rot: -Math.PI / 2 });
      rocks(S.root, 120, -9, 9, -70, 4, ["#5a4a40", "#6a5446"], 0.15, 0.7, 3, (x) => Math.abs(x) < 2.2);
      S.on((t) => { const k = t - 3.05; if (k < 0) return; const r = Math.min(1.45, 0.5 * 9.8 * k * k / 7); fall.rotation.z = r; fall.position.y = -Math.min(4, k * k * 3); fall.visible = k < 1.6; });
      blast(S, [9, 6, -20], 3.05, 2.4, { debris: 40, smoke: 1.4, shake: 0.25 }); blast(S, [7, 0.5, -16], 3.45, 1.6, { dirt: true });
      for (const [x, z, s] of [[-9, -30, 1.6], [10, -45, 2], [-10, -60, 2.2], [3, -80, 2.6], [-6, -24, 1.0]] as number[][]) fire(S, [x, 0.4, z], s);
      for (let i = 0; i < 6; i++) { const p = plane("he111"); fly(S, p.g, (t) => V(-160 + 55 * t + i * 9, 75 + (i % 2) * 6, -40 - i * 16), () => 0.02 * Math.sin(i), p.spin); }
      [0, 1, 2].forEach((i) => actor(S, civ(i, 5), 11 + i, (t) => ({ x: [-1.8, 0.6, 2.1][i], z: -9 + (2.6 + 0.3 * i) * t, f: { mode: "march", phase: (2.6 * t / 1.6 + i * 0.3) % 1, expr: t > 3.1 ? "shock" : "fear", look: t > 3.1 ? 1 : 0 } as never })));
      weather(S, "embers", 500); },
    cam: path(3.9, [[0, [0, 10, 16], [0, 7, -40], 44], [0.6, [-1, 3.2, 9], [1, 4.5, -30], 40], [1, [-1.5, 2.2, 6], [4, 5.5, -22], 38]]) },
  // "e soldados lutam em batalhas tão gigantescas" — golden battlefield: a line of men charges through blasts, tanks fire behind
  { t0: 7.1, t1: 9.9, mood: "golden", over: { sunAz: 10, sunEl: 7 }, hand: 0.06, build: (S) => {
      ground(S, "mud"); hills(S, "#4a4038", 700, 50); S.shadowAt(0, 0, -6, 40);
      for (let i = 0; i < 12; i++) crater(S.root, -40 + 80 * hs(i, 3), -30 + 40 * hs(i, 4), 1.4 + 1.5 * hs(i, 5));
      wire(S.root, -30, 30, -2); for (let i = 0; i < 8; i++) pole(S.root, -40 + i * 12, -38, 6, (hs(i, 9) - 0.5) * 0.6);
      for (let i = 0; i < 14; i++) walker(S, sol(RED, i), 20 + i, -22 + (i % 7) * 2.6 - (i > 6 ? 3 : 0), -3 - (i % 3) * 2.2 - (i > 6 ? 4 : 0), 4.2 + hs(i, 2), { run: true, die: [0.9, 1.6, 2.2][i % 9] ?? undefined, dieDir: -1 });
      for (let i = 0; i < 3; i++) { const T = tank("t34"); T.g.position.set(-30 + i * 14, 0, -26 - i * 3); T.g.rotation.y = 0.1; S.add(T.g); T.turret.rotation.y = 0.05 * i; muzzle(S, T.muzzle, [0.4 + i * 0.7, 2.2 + i * 0.3], 1.4); }
      [[4, -8, 0.3, 1.6], [-6, -14, 0.9, 2.1], [12, -5, 1.4, 1.5], [0, -22, 1.9, 2.6], [-14, -6, 2.4, 1.7]].forEach(([x, z, t0, s]) => blast(S, [x, 0, z], t0, s, { dirt: true, debris: 18 }));
      smokeCol(S, [20, 0, -60], 4, { grey: 0.1 }); smokeCol(S, [-35, 0, -80], 5, { grey: 0.08 }); },
    cam: path(2.8, [[0, [-14, 1.4, 6], [-8, 1.6, -6], 40], [1, [2, 1.8, 6], [6, 1.4, -8], 36]], (u) => u) },
  // "a Segunda Guerra Mundial." — a bomber formation crosses a huge setting sun (telephoto)
  { t0: 22.4, t1: 24.69, mood: "dusk", over: { sunEl: 3, sunAz: 0, fogF: 3000 }, bloom: 1.3, build: (S) => {
      ground(S, "field"); hills(S, "#1e1618", 1200, 40, 30); bigSun(S, 520, "#ff9050");
      for (let i = 0; i < 9; i++) { const p = plane("he111"); const row = i % 3, col = Math.floor(i / 3); fly(S, p.g, (t) => V(-260 + 70 * t + col * 30 + row * 12, 70 + row * 10 + col * 4, -1500 - row * 60), () => 0, p.spin); } },
    cam: path(2.29, [[0, [0, 8, 0], [0, 75, -1500], 9], [1, [0, 8, 0], [10, 72, -1500], 8]]) },
  // "e novas armas foram utilizadas" — V-2 lift-off: ignition, ground cloud, slow then fast climb
  { t0: 29.95, t1: 32.35, mood: "overcast", over: { sunEl: 20 }, bloom: 1.2, build: (S) => {
      ground(S, "concrete"); S.shadowAt(0, 0, 0, 40); for (let i = 0; i < 26; i++) tree(S.root, (hs(i, 1) - 0.5) * 160, -40 - 60 * hs(i, 2), "pine", 1.4, i);
      const r = v2(); S.add(r); const y = (t: number) => (t < 0.7 ? 0 : 0.5 * 9 * (t - 0.7) ** 2); S.on((t) => { r.position.set(0, 0.6 + y(t), 0); r.rotation.z = (t > 1.2 ? 0.01 * (t - 1.2) : 0); });
      rbox(6, 0.6, 6, M.std("#5a5a56", 1, 0.3), S.root, 0, 0.3, 0, 0.1); for (const s of [-1, 1]) rbox(0.4, 9, 0.4, M.std("#3a3a36", 0.8, 0.5), S.root, s * 3.5, 4.5, 0, 0.05);
      exhaust(S, (t) => V(0, 0.6 + y(t), 0), () => V(0, -1, 0), 0.15, 3, 2.0, { rate: 26, life: 4, ground: 3 }); S.shake(0.2, 0.06, 0.6);
      for (let i = 0; i < 3; i++) stander(S, sol(WEH, i, false), 30 + i, -14 + i * 2.2, 12, () => ({ look: 0.2, expr: "stern" as never })); },
    cam: path(2.4, [[0, [-16, 1.6, 22], [0, 6, 0], 34], [0.5, [-14, 1.4, 20], [0, 9, 0], 36], [1, [-12, 1.2, 19], [0, 26, 0], 42]]) },
  // "em uma escala nunca vista antes." — a sky full of bombers, from below, flak bursting among them
  { t0: 32.35, t1: 35.22, mood: "day", over: { sunEl: 55, sunAz: 160 }, build: (S) => {
      ground(S, "field"); clouds(S, 12, [0, 900, -600], [2400, 200, 1600], "#ffffff", 3, 3, 3);
      for (let i = 0; i < 30; i++) { const p = plane("b29"); const r = i % 6, c = Math.floor(i / 6); fly(S, p.g, (t) => V(-500 + 28 * t + r * 70 - c * 35, 420 + c * 35 + (r % 2) * 18, -140 - c * 120 + r * 18), () => 0, p.spin); }
      flak(S, [-200, 450, -350], [600, 120, 400], 0.1, 2.8, 22, 5); },
    cam: path(2.87, [[0, [0, 1.7, 0], [-220, 420, -300], 46], [1, [0, 1.7, 0], [-120, 460, -360], 44]]) },
  // "Prepare-se..." — a fighter squadron above a sea of clouds at golden hour, the camera flies with them
  { t0: 46.68, t1: 52.93, mood: "golden", over: { sunEl: 12, sunAz: 70, fogF: 2600, gnd: "#c8a890" }, bloom: 1.0, build: (S) => {
      clouds(S, 70, [0, -60, -400], [3000, 30, 2400], "#ffe8d8", 4, 9, 2.6); clouds(S, 10, [0, 160, -1600], [3000, 60, 300], "#ffd8c0", 2, 12, 3);
      const fm = [[0, 0, 0], [-14, -2, 12], [-14, 2, -12], [-28, -3, 24], [-28, 3, -24]];
      fm.forEach(([dx, dy, dz], i) => { const p = plane("spit"); fly(S, p.g, (t) => V(62 * t + dx + 2 * Math.sin(t * 0.7 + i), 40 + dy + 1.2 * Math.sin(t * 0.9 + i * 2) + (i === 4 && t > 4.5 ? -12 * (t - 4.5) ** 2 : 0), dz + (i === 4 && t > 4.5 ? -6 * (t - 4.5) ** 2 : 0)), (t) => 0.08 * Math.sin(t * 0.6 + i) + (i === 4 ? -1.4 * sm((t - 4.4) / 0.9) : 0), p.spin); }); },
    cam: (t) => { const x = 62 * t, a = lerp(-0.3, 1.25, sm(t / 6.25)); return { p: [x + 6 + Math.cos(a) * 15, 43 + 2.5 * Math.sin(t * 0.5), Math.sin(a) * 22 + 4], l: [x - 8, 40, 0], fov: 42, roll: 0.06 * Math.sin(t * 0.4) }; } },
  // "No dia 1º de setembro de 1939," — the old battleship opens fire on Westerplatte at dawn
  { t0: 139.7, t1: 142.9, mood: "dawn", over: { sunAz: -70, sunEl: 5, fogF: 2200 }, bloom: 1.1, build: (S) => {
      sea(S, "#2a3a52", 0.4); const B = ship("bb", { col: "#6a7078" }); B.g.position.set(0, 0, -170); B.g.rotation.y = 0.2; S.add(B.g); B.turrets.forEach((tt) => (tt.rotation.y = -1.3)); B.guns.forEach((g) => (g.rotation.z = 0.08));
      S.shadowAt(0, 0, -170, 120); const shoreZ = 40; ground(S, "sand", 1200, 60).position.set(0, 0.6, shoreZ + 600);
      for (let i = 0; i < 10; i++) tree(S.root, -120 + i * 26, shoreZ + 20 + 8 * hs(i, 1), "pine", 1.5, i);
      const muz = (i: number) => () => B.guns[i].localToWorld(V(20, 0, 0)), times = [[0.5], [0.9], [1.35]];
      B.guns.forEach((_, i) => muzzle(S, muz(i), times[i % 3].map((x) => x + Math.floor(i / 3) * 0.15), 9));
      [1.1, 1.5, 1.9, 2.4].forEach((t0, i) => blast(S, [-30 + i * 22, 1, shoreZ + 40 + i * 6], t0, 3, { dirt: true, debris: 24, shake: 0.02 }));
      smokeCol(S, [-40, 1, shoreZ + 60], 3); },
    cam: path(3.2, [[0, [70, 5, 20], [0, 14, -170], 36], [1, [50, 3.5, 14], [-10, 16, -170], 34]]) },
  // "a Alemanha invadiu a Polônia" — the border barrier is torn up; soldiers walk through, tanks behind
  { t0: 142.9, t1: 145.0, mood: "dawn", over: { sunAz: 60, sunEl: 8 }, build: (S) => {
      ground(S, "grass"); hills(S, "#3e4a3a", 600, 40); S.shadowAt(0, 0, 0, 30); for (let i = 0; i < 14; i++) tree(S.root, -60 + 120 * hs(i, 4), -50 - 60 * hs(i, 5), "poplar", 1.2, i);
      const post = rbox(0.4, 1.3, 0.4, M.std("#d8d4c8", 0.8, 0), S.root, -3.5, 0.65, 0, 0.05); void post;
      const bar = new THREE.Group(); bar.position.set(-3.5, 1.2, 0); S.root.add(bar);
      for (let i = 0; i < 7; i++) { const s = cyl(0.08, 0.08, 1.0, M.flat(i % 2 ? "#c41e1e" : "#f2f0e8"), bar, 10); s.rotation.z = Math.PI / 2; s.position.x = 0.5 + i; }
      S.on((t) => { const k = t - 0.35; bar.rotation.z = k < 0 ? 0 : Math.min(1.9, 2.2 * k * k + 1.2 * k); if (k > 0.9) { bar.position.y = 1.2 - Math.min(1.1, 4.9 * (k - 0.9) ** 2); } });
      const sign = rbox(1.4, 0.9, 0.06, M.flat("#f2f0e8"), S.root, 4.5, 2.4, 0, 0.02); decal("pl", 0.6, sign, 0, 0, 0.04); cyl(0.06, 0.06, 2.0, M.std("#555", 0.7, 0.4), S.root, 8).position.set(4.5, 1.0, -0.05);
      stander(S, sol(WEH, 1), 40, -2.6, 0.8, (t) => ({ expr: "grin" as never, armB: t < 0.6 ? 1 : 0.2 }));
      for (let i = 0; i < 6; i++) walker(S, sol(WEH, i + 2), 41 + i, -16 - i * 2.4, 1.5 + (i % 2) * 1.2, 1.5, { t0: 0.6 });
      const T = tank("panzer"); drive(S, T, (t) => V(-30 + 4.5 * t, 0, -8)); dust(S, (t) => V(-33 + 4.5 * t, 0, -8), 0, 2.1, { col: "#8a7a60" }); },
    cam: path(2.1, [[0, [3, 1.2, 9], [-3, 1.3, 0], 34], [1, [5, 1.6, 10], [-6, 1.8, -2], 38]]) },
  // "...guerra-relâmpago." — a Stuka screams down, releases, pulls out; lightning flashes on "relâmpago" (149.10)
  { t0: 147.85, t1: 150.72, mood: "overcast", over: { top: "#3a4048", mid: "#5a6068", hor: "#7a7c80" }, white: (t) => { const a = t - 1.25; return a > 0 && a < 0.35 ? (a < 0.06 ? 0.85 : 0.35 * (1 - (a - 0.06) / 0.29)) : 0; }, build: (S) => {
      ground(S, "field"); for (let i = 0; i < 12; i++) building(S.root, -30 + (i % 4) * 14, -40 - Math.floor(i / 4) * 16, 7, 5, 8, { roof: "pitch", seed: 90 + i }); S.shadowAt(0, 0, -50, 60);
      for (let i = 0; i < 30; i++) tree(S.root, -120 + 240 * hs(i, 6), -10 - 160 * hs(i, 7), "oak", 1.2, i);
      const st = plane("stuka"), sp = stukaP;
      fly(S, st.g, sp, (t) => 0.1 * Math.sin(t * 3), st.spin);
      const bomb = rbox(1.6, 0.35, 0.35, M.std("#3a3e34", 0.6, 0.5), S.root, 0, -100, 0, 0.15);
      S.on((t) => { const a = t - 1.45; if (a < 0) { bomb.visible = false; return; } bomb.visible = a < 0.9; const p0 = sp(1.45); bomb.position.set(p0.x + 30 * a, p0.y - 150 * a - 4.9 * a * a, p0.z + 6 * a); bomb.rotation.z = -1.1; });
      blast(S, [24, 0, -50], 2.35, 3.2, { dirt: true, debris: 40, smoke: 1.3, shake: 0.05 }); weather(S, "rain", 1500); },
    cam: track(stukaP, (t) => [-16 + 4 * t, 8 - 2 * t, 14], [12, -14, -3], 46, (t) => 0.15 * Math.sin(t * 1.5)) },
  // "A tática combinava tanques," — panzer column racing, dust lit by a low sun (backlight)
  { t0: 150.72, t1: 152.45, mood: "golden", over: { sunAz: -20, sunEl: 8 }, hand: 0.05, bloom: 1.2, build: (S) => {
      ground(S, "steppe"); hills(S, "#5a4a38", 700, 30); S.shadowAt(0, 0, -6, 40);
      for (let i = 0; i < 6; i++) { const T = tank(i % 3 === 2 ? "tiger" : "panzer"), x0 = -10 - i * 13, z = -4 - (i % 2) * 7; drive(S, T, (t) => V(x0 + 11 * t, 0, z)); dust(S, (t) => V(x0 + 11 * t - 3, 0, z), -3, 1.8, { col: "#c8a878", rate: 8, sc: 1.6 }); T.turret.rotation.y = 0.04 * i; } },
    cam: (t) => ({ p: [-2 + 11 * t, 0.9, 10], l: [-8 + 11 * t, 1.4, -6], fov: 40 }) },
  // "aviões" — a Stuka trio passes right over the lens
  { t0: 152.45, t1: 152.9, mood: "day", over: { sunEl: 40 }, build: (S) => {
      ground(S, "grass"); clouds(S, 10, [0, 500, -300], [1500, 100, 800], "#fff", 2, 4, 2);
      for (let i = 0; i < 3; i++) { const p = plane("stuka"); fly(S, p.g, (t) => V(-60 + 120 * t + i * 8, 28 + i * 4, -30 + 70 * t - i * 10), () => -0.15, p.spin); } },
    cam: () => ({ p: [0, 1.6, 0], l: [-6, 30, -10], fov: 60 }) },
  // "e tropas terrestres" — infantry runs beside trucks, others ride
  { t0: 152.9, t1: 154.15, mood: "day", over: { sunEl: 30, sunAz: 80 }, hand: 0.05, build: (S) => {
      ground(S, "mud"); S.shadowAt(0, 0, -4, 30); for (let i = 0; i < 18; i++) tree(S.root, -80 + 160 * hs(i, 1), -30 - 50 * hs(i, 2), "birch", 1.1, i);
      for (let i = 0; i < 3; i++) { const v = truck({ nation: "de" }), x0 = -1 - i * 11; drive(S, v, (t) => V(x0 + 6 * t, 0, -6)); dust(S, (t) => V(x0 + 6 * t - 3, 0, -6), -2, 1.3, { col: "#7a6a50" }); }
      for (let i = 0; i < 9; i++) walker(S, sol(WEH, i), 60 + i, -18 + i * 2.6, -2 + (i % 2) * 0.8, 5.4 + 0.4 * hs(i, 3), { run: true }); },
    cam: (t) => ({ p: [-4 + 5.8 * t, 1.5, 7], l: [-2 + 5.8 * t, 1.4, -4], fov: 42 }) },
  // "para atacar rapidamente" — a panzer bursts through a wooden barricade, planks fly
  { t0: 154.15, t1: 155.7, mood: "day", over: { sunEl: 25, sunAz: 110 }, hand: 0.05, build: (S) => {
      ground(S, "cobble"); S.shadowAt(0, 0, 0, 25); street(S, -16, -50, 50, { h: [7, 12], seed: 14, roof: true });
      const T = tank("panzer"); drive(S, T, (t) => V(-14 + 13 * t, 0, 0)); planks(S, 0.5, 0, 24, 0.82, [1, 0, 0.3], "#6a4a30", 3.6, 2);
      for (const s of [-1, 1]) rbox(0.3, 2.4, 0.3, M.std("#4a3626", 1, 0), S.root, 0.5, 1.2, s * 2, 0.05);
      blast(S, [1.5, 0.6, 0], 0.85, 0.6, { debris: 10, smoke: 0.4, shake: 0.12, light: 0.2 }); dust(S, (t) => V(-17 + 13 * t, 0, 0), 0, 1.5, { col: "#8a8070", sc: 1.3 }); },
    cam: path(1.55, [[0, [9, 0.8, 8], [0, 1.5, 0], 36], [1, [11, 1.0, 9], [3, 1.5, 0], 42]]) },
  // "e desorganizar as defesas inimigas." — a Polish trench line under bombardment; defenders scatter, some fall
  { t0: 155.7, t1: 158.74, mood: "overcast", hand: 0.08, build: (S) => {
      ground(S, "mud"); S.shadowAt(0, 0, -4, 30); sandbags(S.root, 0, -2, 40, 3); wire(S.root, -20, 20, -10); for (let i = 0; i < 9; i++) crater(S.root, -20 + 40 * hs(i, 1), -16 - 12 * hs(i, 2), 1.5);
      for (let i = 0; i < 6; i++) stander(S, sol(POLE, i), 70 + i, -9 + i * 3.4, -0.8, (t) => ({ expr: (t > 0.6 ? "fear" : "stern") as never, crouch: 0.25 }), { die: [1.1, undefined, 2.0, undefined, undefined, 2.5][i], dieDir: 0 });
      for (let i = 0; i < 5; i++) walker(S, sol(POLE, i + 6), 80 + i, -2 + i * 3, 1.6 + (i % 2), -5, { run: true, t0: 0.7 + 0.2 * i, die: i === 3 ? 1.9 : undefined, dieDir: 1 });
      [[-6, -5, 0.4, 2], [5, -1, 1.0, 2.4], [-2, 2, 1.8, 1.8], [9, -6, 2.3, 2.2], [-11, -3, 2.6, 2]].forEach(([x, z, t0, s]) => blast(S, [x, 0, z], t0, s, { dirt: true, debris: 20 }));
      smokeCol(S, [-30, 0, -40], 3); },
    cam: path(3.04, [[0, [-3, 2.2, 10], [0, 1, -3], 40], [1, [3, 1.8, 9], [-1, 1, -4], 44]]) },
  // "Parecia que ninguém conseguiria deter o avanço alemão." — a high sweeping view of an endless armoured column
  { t0: 186.08, t1: 189.51, mood: "day", over: { sunEl: 35, sunAz: 140 }, build: (S) => {
      ground(S, "field"); hills(S, "#5a6a4a", 900, 60); S.shadowAt(0, 0, 0, 120);
      const road = new THREE.Mesh(new THREE.PlaneGeometry(1400, 7), M.std("#8a7a60", 1, 0)); road.rotation.x = -Math.PI / 2; road.rotation.z = 0.25; road.position.y = 0.02; S.root.add(road);
      for (let i = 0; i < 30; i++) { const s = -60 + i * 13 - 300 * 0, isT = i % 4 !== 3; const v = isT ? tank(i % 5 === 0 ? "tiger" : "panzer") : truck({ nation: "de" }); const d0 = 150 - i * 14;
        drive(S, v, (t) => { const d = d0 + 7 * t; return V(-Math.cos(0.25) * d, 0, Math.sin(0.25) * d); }); void s; }
      for (let i = 0; i < 40; i++) tree(S.root, -300 + 600 * hs(i, 1), -300 + 600 * hs(i, 2), "poplar", 1.3, i);
      dust(S, () => V(-60, 0, 20), 0, 3.4, { col: "#b8a888", sc: 6, rate: 3, life: 4 }); },
    cam: path(3.43, [[0, [80, 70, 90], [-40, 0, 0], 44], [1, [20, 55, 110], [-90, 0, 20], 44]]) },
  // "Hitler sabia..." skipped (2D). "...bombardeios" — bombers over the Thames at dusk: flak, searchlights, fires
  { t0: 199.76, t1: 203.7, mood: "dusk", over: { sunAz: -100, sunEl: 3 }, bloom: 1.2, build: (S) => {
      sea(S, "#1e2830", 0.12, 1600, 100); street(S, -140, -400, 400, { h: [10, 26], hue: 30, d: 20, seed: 21, lit: 30 });
      const dome = new THREE.Mesh(new THREE.SphereGeometry(18, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), M.std("#6a6a66", 0.8, 0.2)); dome.position.set(60, 40, -160); S.root.add(dome); rbox(30, 40, 30, M.std("#5a5650", 1, 0), S.root, 60, 20, -160);
      for (let i = 0; i < 8; i++) { const p = plane("he111"); fly(S, p.g, (t) => V(-300 + 40 * t + (i % 4) * 30, 130 + (i % 3) * 14, -60 - Math.floor(i / 4) * 50 - (i % 4) * 12), () => 0, p.spin); }
      flak(S, [-150, 140, -80], [300, 60, 120], 0.2, 3.8, 26, 7);
      for (let i = 0; i < 4; i++) { const beam = new THREE.Mesh(new THREE.ConeGeometry(5, 300, 16, 1, true), new THREE.MeshBasicMaterial({ color: "#c8d4ff", transparent: true, opacity: 0.08, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
        beam.geometry.translate(0, -150, 0); beam.position.set(-120 + i * 70, 0, -150); S.root.add(beam); S.on((t) => { beam.rotation.set(0.4 * Math.sin(t * 0.4 + i), 0, Math.PI + 0.5 * Math.sin(t * 0.3 + i * 2)); }); }
      for (const [x, z] of [[-60, -140], [40, -150], [120, -140]]) fire(S, [x, 4, z], 5); },
    cam: path(3.94, [[0, [0, 6, 120], [-80, 70, -100], 44], [1, [20, 5, 110], [-40, 110, -100], 46]]) },
  // "e instalações militares inglesas." — an airfield is hit: the hangar blows, a parked fighter burns
  { t0: 204.35, t1: 206.72, mood: "day", over: { sunEl: 30, sunAz: 120 }, hand: 0.06, build: (S) => {
      ground(S, "grass"); S.shadowAt(0, 0, -20, 50); for (let i = 0; i < 20; i++) tree(S.root, -120 + 240 * hs(i, 1), -80 - 40 * hs(i, 2), "oak", 1.2, i);
      const hang = new THREE.Group(); hang.position.set(-8, 0, -34); S.root.add(hang); const roof = new THREE.Mesh(new THREE.CylinderGeometry(10, 10, 30, 24, 1, false, 0, Math.PI), M.std("#7a7a70", 0.8, 0.4)); roof.rotation.set(Math.PI / 2, 0, Math.PI / 2); roof.position.y = 3; hang.add(roof);
      rbox(20, 3, 30, M.std("#6a645a", 1, 0), hang, 0, 1.5, 0); S.on((t) => { const k = t - 0.45; if (k > 0) { roof.position.y = 3 + 6 * k - 6 * k * k; roof.rotation.y = k * 0.4; hang.visible = k < 1.6; } });
      blast(S, [-8, 2, -34], 0.45, 4, { debris: 50, smoke: 1.6, shake: 0.12 }); fire(S, [-8, 0, -34], 4, { t0: 0.6 });
      for (let i = 0; i < 3; i++) { const p = plane("spit"); p.g.position.set(10 + i * 14, 1.8, -12 - i * 4); p.g.rotation.set(0, -0.6, 0.18); S.add(p.g); }
      blast(S, [10, 0.5, -12], 1.25, 1.8, { debris: 20 }); fire(S, [10, 0.5, -12], 1.6, { t0: 1.4 });
      for (let i = 0; i < 4; i++) walker(S, sol(RAF, i, false), 100 + i, 4 + i * 2, 4 + i, -4.5, { run: true, t0: 0.6 + 0.1 * i }); },
    cam: path(2.37, [[0, [18, 2.2, 14], [-2, 3, -24], 40], [1, [14, 2.0, 15], [-6, 4, -28], 42]]) },
  // "Batalha da Grã-Bretanha." — dogfight in the clouds: the Spitfire chases a 109, hits it; smoke, fire, it rolls over and falls
  { t0: 206.72, t1: 210.62, mood: "day", over: { sunEl: 35, sunAz: 40 }, hand: 0.05, build: (S) => {
      clouds(S, 40, [0, 800, -600], [3000, 300, 2400], "#ffffff", 0, 5, 2.4);
      const e = (t: number) => V(80 * t, 900 + 18 * Math.sin(t * 0.9) - (t > 2.4 ? 22 * (t - 2.4) ** 2 : 0), 30 * Math.sin(t * 0.55)), f = (t: number) => { const p = e(t - 0.55); return V(p.x - 6, p.y + 2, p.z + 3); };
      const a = plane("bf109"), b = plane("spit"); fly(S, a.g, e, (t) => 0.5 * Math.sin(t * 0.8) + (t > 2.3 ? 4 * (t - 2.3) : 0), a.spin); fly(S, b.g, f, (t) => 0.45 * Math.sin((t - 0.55) * 0.8), b.spin);
      const tt = Array.from({ length: 16 }, (_, i) => 1.4 + i * 0.06); tracers(S, (t) => f(t).add(V(4, -0.3, 0)), (t) => e(t + 0.2), tt);
      exhaust(S, (t) => e(t), (t) => e(t - 0.05).sub(e(t)), 2.0, 3.9, 0.6, { grey: 0.15, rate: 18, life: 3 }); },
    cam: (t) => { const p = (t: number) => V(80 * (t - 0.55), 900 + 18 * Math.sin((t - 0.55) * 0.9), 30 * Math.sin((t - 0.55) * 0.55)); const c = p(t); return { p: [c.x - 30, c.y + 6, c.z + 9 + 6 * Math.sin(t * 0.6)], l: [c.x + 30, c.y - (t > 2.4 ? 14 * (t - 2.4) ** 2 : 0), c.z], fov: 42, roll: 0.3 * Math.sin(t * 0.8) }; } },
  // "impedindo uma invasão alemã." — scramble! pilots sprint, a Spitfire rolls and lifts off
  { t0: 213.0, t1: 215.52, mood: "dawn", over: { sunAz: 90, sunEl: 10 }, build: (S) => {
      ground(S, "grass"); S.shadowAt(0, 0, -10, 40); for (let i = 0; i < 16; i++) tree(S.root, -140 + 280 * hs(i, 3), -100 - 50 * hs(i, 4), "oak", 1.3, i);
      const p = plane("spit"), x = (t: number) => -30 + 0.5 * 9 * Math.max(0, t) ** 2, y = (t: number) => (x(t) > 10 ? 1.9 + (x(t) - 10) * 0.12 : 1.9);
      fly(S, p.g, (t) => V(x(t), y(t), -14), () => 0, p.spin); p.g.rotation.order = "XYZ";
      const q = plane("spit"); q.g.position.set(-14, 1.9, -24); q.g.rotation.z = 0.18; q.g.rotation.y = 0.4; S.add(q.g); q.spin(0);
      S.on((t) => q.spin(t)); dust(S, (t) => V(x(t) - 4, 0, -14), 0, 2.5, { col: "#9aa070", rate: 10 });
      for (let i = 0; i < 4; i++) walker(S, sol(RAF, i, false), 110 + i, 4 + i * 1.6, -6 + i * 1.3, -6.2, { run: true }); },
    cam: path(2.52, [[0, [14, 1.6, 6], [-10, 1.8, -14], 40], [1, [10, 1.4, 4], [12, 4, -14], 44]]) },
  // "e lançou a Operação Barbarossa," — a line of howitzers fires in sequence at dawn (recoil, flash, dust)
  { t0: 223.2, t1: 225.25, mood: "dawn", over: { sunAz: 0, sunEl: 3 }, bloom: 1.3, build: (S) => {
      ground(S, "grass"); hills(S, "#2a2a34", 600, 30); S.shadowAt(0, 0, 0, 40);
      for (let i = 0; i < 6; i++) { const H = howitzer(); H.g.position.set(-15 + i * 7, 0, -2 - i * 1.2); H.g.rotation.y = 0.15; S.add(H.g); const tf = 0.25 + i * 0.28;
        S.on((t) => { const a = t - tf; H.barrel.position.x = a > 0 ? -0.9 * Math.exp(-a * 7) * Math.min(1, a * 60) : 0; H.g.position.y = a > 0 && a < 0.2 ? 0.03 * Math.sin(a * 80) : 0; });
        muzzle(S, H.muzzle, [tf], 2.5); dust(S, () => V(-15 + i * 7 + 2, 0, -2 - i * 1.2), tf, tf + 0.3, { col: "#7a7060", rate: 20, sc: 1.4, life: 2 });
        stander(S, sol(WEH, i, false), 130 + i, -16.5 + i * 7, 1.4 - i * 1.2, (t) => ({ expr: "stern" as never, crouch: t > tf && t < tf + 0.5 ? 0.3 : 0.1 })); } },
    cam: path(2.05, [[0, [-24, 2.0, 8], [0, 1.6, -4], 40], [1, [-10, 1.6, 9], [12, 1.6, -8], 38]]) },
  // "As forças alemãs avançaram rapidamente," — panzers race across the open steppe toward the lens
  { t0: 233.18, t1: 235.35, mood: "day", over: { sunEl: 40, sunAz: -60, hor: "#e8e0c8" }, hand: 0.06, build: (S) => {
      ground(S, "steppe"); hills(S, "#8a7a5a", 900, 25); S.shadowAt(0, 0, -10, 50);
      for (let i = 0; i < 5; i++) { const T = tank("panzer"), x0 = -50 + i * 16 - 30, z0 = -60 + i * 4; drive(S, T, (t) => V(x0 + 9 * t, 0, z0 + 12 * t)); dust(S, (t) => V(x0 + 9 * t - 2.5, 0, z0 + 12 * t - 3), -3, 2.2, { col: "#c8b890", rate: 8, sc: 2 }); } },
    cam: path(2.17, [[0, [6, 0.7, -12], [-30, 2, -60], 40], [1, [2, 0.9, -10], [-18, 1.6, -38], 42]]) },
  // "a resistência do Exército Vermelho" — white-clad ski troops sweep through the birches; a T-34 bursts out in a spray of snow
  { t0: 240.45, t1: 242.55, mood: "snow", hand: 0.05, build: (S) => {
      ground(S, "snow"); S.shadowAt(0, 0, -6, 30); for (let i = 0; i < 70; i++) { const x = -70 + 140 * hs(i, 1), z = -6 - 60 * hs(i, 2); if (Math.abs(x - 2) < 6 && z > -26) continue; tree(S.root, x, z, "bare", 1.1, i); }
      for (let i = 0; i < 8; i++) walker(S, sol(REDW, i), 140 + i, -24 + i * 2.4, -1 - (i % 3) * 1.8, 6.5, { run: true });
      const T = tank("t34", { winter: true }); drive(S, T, (t) => V(2 + 0.5 * t, 0, -26 + 9 * t)); dust(S, (t) => V(2 + 0.5 * t, 0, -29 + 9 * t), 0, 2.1, { col: "#e8eef4", sc: 1.8, rate: 10 });
      muzzle(S, T.muzzle, [1.5], 1.6); weather(S, "snow", 2000); },
    cam: path(2.1, [[0, [-8, 1.4, 10], [0, 1.5, -10], 40], [1, [-2, 1.2, 10], [4, 1.8, -6], 44]]) },
];
void ei; void eo; void clamp; void ov; void marcherF; void fallK; void rocks;
