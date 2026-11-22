// 415 – 580 s: the end in Europe, the Pacific, the atomic bombs, Japan's surrender, the cost, the post-war world, the lesson.
import { VW, VH, P, glow, fire, smokeCol, puff, tint, clamp, lerp, smooth, easeOut, easeIn, hash, rays, sun, beam, muzzle } from "./engine";
import { Sc, C, mv, hand, walkS, walkF, runS, marchCol, marchF, crowd, tank, plane, planeTop, ship, flag, signing, hl, arrow, pin, panel, caption, bigText, counter, geoP,
  civ, kid, sol, v, idle, HIT_OLD, KEITEL, SHIGE, UMEZU, MACA, TRUMAN, STALIN_CAP, CHURCHILL, WEH, RED, REDH, GI, TOMMY, MARINE, JAP, JAPH, SAILOR, SAILOR_B, NURSE, MEDIC } from "./kit";
import { blast, scorch, rubble, embers, flutter, sparks, searchlight, lensFlare, glint, birds, breath, dust, lightning, exhaust, trail, flak, sea, wake, splash, bounce, mushroom } from "./fx";
import { loc, mtn, hillL, clouds, city, skyline, forest, wall, banners, ruins, field, wire, pier, cliffs, dunes, europe, ST, MX, MY, mix, shade } from "./places";
import { DAY, GOLD, BACK, GREY, NIGHTFIRE, MOON, LAMP, COLD, NOON, RED as REDL } from "./looks";
import type { Shot } from "./types";
import type { Outfit } from "./toon";

const VET: Outfit = { jacket: "#3a4a6a", pants: "#3a3a40", boots: "#141414", hat: "garrison", cap: "#3a4a6a", hair: "#e8e6e0", medals: true, glasses: true };
const GRAND: Outfit = { jacket: "#6a5a4a", pants: "#4a4a50", boots: "#2a2420", hat: "hair", hair: "#dcd8d0", glasses: true, moustache: "#dcd8d0" };
const DELEG = (i: number): Outfit => ({ ...civ(i, 91), hat: ["hair", "homburg", "hair", "bald", "hair", "fedora"][i % 6], jacket: ["#2a2a30", "#3a3a44", "#2e3440", "#4a3e34", "#1e2a3a", "#3a2e2e"][i % 6], pants: "#2a2a30", tie: ["#8a2a22", "#2a4a8a", "#2a6a3a", "#6a2a6a"][i % 4], skin: ["#ffe2c2", "#c99067", "#8a5a3a", "#f0d0a8", "#f5c9a0", "#b07a52"][i % 6], dress: undefined });

export const SHOTS_4: Shot[] = [
  // 65a "No dia 30 de abril de 1945," — the bunker corridor; a heavy door swings shut
  { t0: 415.36, fade: 0.3, L: () => loc(undefined, { near: "#36322c", far: "#3e3a34", kind: "stone", seed: 220, zFar: 20 }, [wall("r0", 9, "#5a564c", { h: 2.8, wid: 3, pipes: true }), wall("r0b", 16, "#2a2824", { h: 2.8, wid: 3 })], true),
    cam: mv([0, 1.5, -2, 44], [0, 1.5, -0.6, 42]), lite: LAMP, act: (A, lt) => {
      for (const sd of [-1, 1]) panel(A, 0.5, (w) => { w.rect(sd * 1.6 - 1, -0.5, 2, 4, w.vgrad(-0.5, 3.5, "#3e3a34", "#5a564c"), 3); });
      const ang = smooth(clamp((lt - 0.8) / 2.4)) * 1.35; A.fx(6, (g, c) => { const [hx, hy, s] = P(c, 1.0, 0, 6), [, ty] = P(c, 1.0, 2.2, 6), w = 2.0 * s * Math.cos(ang); g.fillStyle = "#4a4e46"; g.strokeStyle = "#141414"; g.lineWidth = 3; g.fillRect(hx - w, ty, w, hy - ty); g.strokeRect(hx - w, ty, w, hy - ty); for (let k = 0; k < 6; k++) { g.fillStyle = "#2a2c28"; g.beginPath(); g.arc(hx - w * 0.9, ty + (hy - ty) * (0.1 + k * 0.16), 3, 0, 7); g.fill(); } });
      A.light((g) => { for (let i = 0; i < 4; i++) { const [sx, sy, s] = P(A.cam, 0, 2.6, 2 + i * 3); glow(g, sx, sy, 0.7 * s, "rgba(255,214,150,1)", 0.45 * (i === 2 && Math.floor(lt * 7) % 5 === 0 ? 0.3 : 1)); } });
      A.over((g) => caption(g, "30 DE ABRIL DE 1945 · BERLIM", lt - 0.3, 3.0));
    } },
  // 65b "Adolf Hitler tirou a própria vida." — an empty chair, the cap on the table, the bulb fades out
  { t0: 418.75, fade: 0.25, L: () => loc(undefined, { near: "#3a342e", far: "#46403a", kind: "wood", zFar: 8 }, [wall("r1", 2.6, "#5e584c", { h: 3, wid: 6, frames: 1 })], true),
    cam: mv([0, 1.3, -1.8, 38], [0, 1.25, -1.4, 34]), lite: LAMP, act: (A, lt, u, T) => {
      A.sp("desk", 0, 0, 1.5, { sc: 0.9 }); A.sp("chair2", 0.2, 0, 1.9, { sc: 1 }); panel(A, 1.48, (w) => { w.ell(-0.4, 0.86, 0.26, 0.07, "#4a4c44", 2); w.ell(-0.4, 0.92, 0.18, 0.08, "#5a5c52", 2); w.ell(-0.4, 0.92, 0.02, 0.02, "#c9a24a", 0); });
      const k = clamp((T - 420.4) / 1.0); A.light((g) => { const [sx, sy, s] = P(A.cam, 0, 2.6, 1.8); glow(g, sx, sy, 2.4 * s, "rgba(255,210,150,1)", 0.7 * (1 - k)); tint(g, "#000", 0.75 * k, "multiply"); });
    } },
  // 66a "Poucos dias depois, em 8 de maio," — Karlshorst: Keitel strides in with his baton
  { t0: 421.46, fade: 0.3, L: () => loc(undefined, { near: "#4a3a2e", far: "#5a483a", kind: "wood", zFar: 14 }, [wall("r2", 6, "#c8c0a8", { h: 7, wid: 14, win: 3, winCol: "#e8ecf0" })], true),
    cam: mv([0, 1.8, -5.5, 42, -40], [0.4, 1.8, -4.8, 40, -40]), lite: DAY, act: (A, lt) => {
      walkS(A, KEITEL, 1101, Math.min(lt, 2.2), -4.5, 2.6, 1.2, { expr: "stern" }); A.sp("deskG", 1.6, 0, 3.6, { sc: 1.2 });
      A.a(sol(v(RED, { hat: "peaked", cap: "#6a6448", rifle: false, medals: true }), 2), 1102, 2.4, 4.2, { expr: "stern", look: -1, facing: -1 }); A.a(v(TOMMY, { hat: "peaked", cap: "#7a6c44", rifle: false, medals: true }), 1103, 0.6, 4.4, { expr: "stern", look: -1 }); A.a(v(GI, { hat: "peaked", cap: "#5c6136", rifle: false, medals: true }), 1104, 3.8, 4.6, { expr: "stern", look: -1, facing: -1 });
      for (const k of ["su", "uk", "us", "fr"]) void k; flag(A, "su", -3, 5.2, 5.8, 1.6, 1, { t: lt, wind: 0.15, droop: 0.4 }); flag(A, "us", 5, 5.2, 5.8, 1.6, 1, { t: lt, wind: 0.15, droop: 0.4 });
      A.over((g) => caption(g, "8 DE MAIO DE 1945", lt - 1.0, 2.8));
    } },
  // 66b "a Alemanha se rendeu oficialmente aos Aliados." — the instrument of surrender is signed
  { t0: 424.3, L: () => loc(undefined, { near: "#2a1a12", far: "#2a1a12", zFar: 1 }, [], true), cam: mv([0, 0.15, -1.7, 40], [0.3, -0.35, -0.6, 38]), act: (A, lt, u, T) => {
      signing(A, clamp((T - 424.55) / 1.8), { z: 3, seed: 57, title: "ATO DE RENDIÇÃO MILITAR", sub: "Berlim, 8 de maio de 1945", sleeve: "#5e6458", desk: "#3a4a3a", prior: 1 });
    } },
  // 67 "Na Europa, a guerra finalmente havia terminado." — VE Day: the crowd erupts, hats in the air, confetti
  { t0: 427.11, fade: 0.25, L: () => loc(["#6aa0dc", "#f2eee4"], { near: "#a8a090", far: "#c0b8a8", kind: "stone", seed: 222 }, [skyline("r3", 140, "#9a9aa8", "london", 21, 2), city("r3", 26, { pal: ["#d8ccb4", "#e6dcc4", "#cfc2aa"], seed: 171, floors: [4, 5], hgt: [15, 18], blur: 1 })]),
    cam: mv([0, 2.2, -6, 44, -30], [0, 2.3, -5, 42, -40]), lite: NOON, act: (A, lt, u, T) => {
      crowd(A, 26, -8, 8, 1.2, 7, 173, (i) => ({ expr: i % 3 ? "laugh" : "grin", wave: Math.sin(lt * 7 + i), prop: i % 5 === 0 ? ["flag", 1] : undefined }), (i) => (i % 4 === 0 ? sol(TOMMY, i, false) : i % 4 === 1 ? SAILOR_B : civ(i, 173)));
      for (let i = 0; i < 5; i++) A.fx(3, (g, c) => { const k = (lt - i * 0.3) % 2.2, x = -5 + i * 2.4, [y] = bounce(Math.max(0, k), 2.0, 6, 0); if (k < 0 || y <= 0.05) return; const [sx, sy, s] = P(c, x + k * 0.3, y, 3 + i * 0.5); g.save(); g.translate(sx, sy); g.rotate(k * 8); g.fillStyle = "#2a2a30"; g.beginPath(); g.ellipse(0, 0, 0.2 * s, 0.07 * s, 0, 0, 7); g.fill(); g.fillRect(-0.12 * s, -0.16 * s, 0.24 * s, 0.14 * s); g.restore(); });
      A.fx(1.0, (g, c) => flutter(g, c, lt, { n: 90, x0: -8, x1: 8, z0: 1, z1: 8, top: 7, cols: ["#e83a4a", "#f4f0f0", "#2a5ac0", "#f2d22a"], size: 0.08, fall: 0.6, wind: 0.2, loop: true, seed: 41 }));
      A.over((g) => bigText(g, "FIM DA GUERRA NA EUROPA", T - 429.2, 1.6, VH * 0.18, 84));
    } },
  // 68 "Mas no outro lado do mundo, o conflito continuava." — jungle rain, marines push through the steam
  { t0: 430.72, fade: 0.3, L: () => loc(["#2a3a34", "#6a8070"], { near: "#3a4a2a", far: "#4a5a36", kind: "grass", seed: 224 }, [forest("r4", 40, "palm", "#2e5a2a", 30, 175, { blur: 1.6, h: 16 }), forest("r4b", 14, "palm", "#3a6a2a", 10, 177, { blur: 0.4, h: 10 })]),
    cam: (u, lt) => C(-lt * 0.9, 1.5, -5, 42), lite: GREY, wx: ["rain", 260, 0.4], act: (A, lt) => {
      for (let i = 0; i < 4; i++) walkS(A, sol(MARINE, i), 1111 + i, lt, 3 + i * 1.6, 2.6 + (i % 2) * 0.8, -1.0, { expr: i % 2 ? "nervous" : "stern" });
      A.fx(6, (g, c) => { for (let i = 0; i < 14; i++) { const k = (lt * 0.08 + hash(i)) % 1, [sx, sy, s] = P(c, -10 + 20 * hash(i + 2) + k * 2, 0.4 + k * 1.6, 3 + hash(i) * 8); puff(g, sx, sy, 1.6 * s, [200, 214, 200], 0.14); } });
    } },
  // 69a "O Japão ainda resistia" — Iwo Jima's black sand under Suribachi; fire from the caves
  { t0: 434.3, fade: 0.25, L: () => loc(["#8a8e96", "#d4d0c8"], { near: "#2e2c2a", far: "#3e3c38", kind: "rubble", seed: 226 }, [mtn("r5", 180, "#4a4440", 181, 90, false, 2.5, 0.6), hillL("r5", 30, "#36322e", 183, 3, 0.8)]),
    cam: hand(mv([0, 1.3, -6, 42], [0.5, 1.3, -5.4, 40]), 0.02), lite: GREY, act: (A, lt) => {
      A.fx(170, (g, c) => { for (const [x, y] of [[-20, 30], [12, 46], [30, 22]]) { const [sx, sy, s] = P(c, x, y, 170); g.fillStyle = "#141210"; g.beginPath(); g.ellipse(sx, sy, 3 * s, 1.8 * s, 0, 0, 7); g.fill(); if (Math.floor(lt * 30 + x) % 9 < 2) glow(g, sx, sy, 5 * s, "rgba(255,210,130,1)", 0.9); } });
      for (let i = 0; i < 4; i++) A.a(sol(MARINE, 10 + i), 1121 + i, -3 + i * 2, 2.4 + (i % 2) * 0.8, { expr: i % 2 ? "fear" : "stern", crouch: 0.5, look: 1 }, { y: -0.15 });
      A.over((g) => caption(g, "IWO JIMA · 1945", lt - 0.3, 2.4));
    } },
  // 69b "e os combates no Pacífico permaneciam extremamente violentos." — a kamikaze dives through the flak onto the carrier
  { t0: 437.55, fade: 0.15, L: () => loc(["#4a6a9a", "#d8e0e8"], { near: "#2a4a6a", far: "#4a6a8a", zFar: 600 }, [clouds("r6", 300, ["#ffffff", "#8aa0c0"], 185, 30, 110, 22, 3)]),
    cam: hand(mv([0, 12, -60, 42], [4, 12.4, -56, 42]), 0.05), lite: DAY, kicks: [[438.9, 18]], act: (A, lt, u, T) => {
      A.fx(400, (g, c) => sea(g, c, lt, { crest: "rgba(240,250,255,0.4)", z0: -60, z1: 600, n: 200, seed: 61 })); ship(A, "carrier", 0, 130, { vel: 3 });
      const k = clamp((T - 437.6) / 1.3); if (T < 438.95) { plane(A, "zero", lerp(-120, -10, k), lerp(90, 21, k * k), 129, { sc: 1.8, ang: 0.3 + 0.5 * k }); A.fx(129.5, (g, c) => trail(g, c, Array.from({ length: 12 }, (_, j) => { const q = Math.max(0, k - j * 0.03); return [lerp(-120, -10, q) - 6, lerp(90, 21, q * q) + 3, 129.5] as [number, number, number]; }).reverse(), true, true)); }
      A.light((g) => { for (let i = 0; i < 10; i++) { const kk = ((lt * 2 + i / 10) % 1); const [ax, ay] = P(A.cam, -40 + i * 9, 18, 128), [bx, by] = P(A.cam, -40 + i * 9 - 30 * kk - 10, 18 + 70 * kk, 128); g.save(); g.globalCompositeOperation = "lighter"; g.strokeStyle = "rgba(255,210,140,0.8)"; g.lineWidth = 3; g.beginPath(); g.moveTo(bx, by); g.lineTo(bx + (bx - ax) * 0.06, by + (by - ay) * 0.06); g.stroke(); g.restore(); } });
      A.fx(129, (g, c) => { blast(g, c, T - 438.95, -10, 20, 129, 14, 9, { debris: 40 }); if (T > 439.3) { fire(g, c, lt, -10, 19, 128.9, 6, 3); smokeCol(g, c, lt, -10, 24, 129.5, { h: 70, w: 12, col: [30, 28, 28], a: 0.85, seed: 5 }); } });
    } },
  // 70a "Os Estados Unidos buscavam uma maneira de encerrar rapidamente a guerra" — Truman alone at his desk, the decision
  { t0: 440.3, fade: 0.3, L: () => loc(undefined, { near: "#3a4a6a", far: "#4a5a7a", kind: "none", zFar: 10 }, [wall("r7", 3.4, "#e8e0c8", { h: 5, wid: 9, win: 3, arch: true, winCol: "#f4f0e0", curtain: "#c8b46a" })], true),
    cam: mv([0, 1.5, -3.2, 40], [0, 1.45, -2.6, 36]), lite: { ...BACK, rim: "#fff4d0" }, act: (A, lt) => {
      A.a(TRUMAN, 1131, 0, 2.2, { mode: "sit", expr: "nervous", prop: ["paper", 0], headTilt: 6 } as never, { y: 0.15 }); A.sp("desk", 0, 0, 1.8, { sc: 1 }); flag(A, "us", -2.4, 2.8, 3.0, 1.2, 0.75, { t: lt, wind: 0.1, droop: 0.5 });
    } },
  // 70b "...contra o Japão." — a test tower stands in the desert night, scientists wait
  { t0: 442.45, fade: 0.2, L: () => loc(["#0a0c1a", "#3a3046"], { near: "#3a3028", far: "#4a3e32", kind: "sand", seed: 228, zFar: 400 }, [mtn("r8", 220, "#1e1a26", 187, 40, false, 2)]),
    cam: mv([0, 1.6, -6, 42], [0, 1.6, -5, 40]), lite: MOON, act: (A, lt) => {
      A.fx(80, (g, c) => { const [sx, sy, s] = P(c, 4, 0, 80); for (const dx of [-3, 3]) { const [tx, ty] = P(c, 4 + dx * 0.2, 30, 80); g.strokeStyle = "#141414"; g.lineWidth = 3; g.beginPath(); g.moveTo(sx + dx * s, sy); g.lineTo(tx, ty); g.stroke(); } const [tx, ty] = P(c, 4, 30, 80); g.fillStyle = "#2a2a2a"; g.fillRect(tx - 1.5 * s, ty - 2 * s, 3 * s, 2 * s); glow(g, tx, ty - s, 0.8 * s, "rgba(255,80,60,1)", 0.5 + 0.5 * Math.sin(lt * 4)); });
      for (let i = 0; i < 3; i++) A.a(v(civ(i, 95), { hat: "fedora", glasses: true }), 1141 + i, -2.4 + i * 1.6, 2.6, { expr: "nervous", look: 1 }, { dark: 0.5 });
      A.over((g) => caption(g, "NOVO MÉXICO · JULHO DE 1945", lt - 0.3, 1.8));
    } },
  // 71a "No dia 6 de agosto de 1945," — the B-29 high in a clear morning sky, contrails behind
  { t0: 445.44, fade: 0.3, L: () => loc(["#2a5aa8", "#cfe2f2"], { near: "#cfe2f2", far: "#cfe2f2", zFar: 1 }, [clouds("r9", 600, ["#ffffff", "#a8c4e0"], 189, -200, -40, 30, 4)], true),
    cam: (u, lt) => C(lt * 14, 0, -30, 40), lite: DAY, act: (A, lt) => {
      const x = lt * 15; plane(A, "b29", x, -1, 25, { sc: 1 }); A.fx(25.5, (g, c) => { for (const ex of [6.2, 1.5]) { const [sx, sy, s] = P(c, x - 14, 3.0, 25.5); const gr = g.createLinearGradient(sx, 0, sx - 60 * s, 0); gr.addColorStop(0, "rgba(255,255,255,0.75)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(sx - 60 * s, sy - (ex * 0.1 + 0.3) * s, 60 * s, 0.5 * s); } });
      A.light((g) => { sun(g, VW * 0.85, VH * 0.18, 30); lensFlare(g, VW * 0.85, VH * 0.18, 0.5); });
      A.over((g) => caption(g, "6 DE AGOSTO DE 1945 · 8h15", lt - 0.2, 3.2));
    } },
  // 71b "uma bomba atômica foi lançada" — the bomb drops from the bay, tumbles, its fins catch the air and it steadies
  { t0: 448.95, fade: 0.1, L: () => loc(["#3a6ab4", "#d8e6f2"], { near: "#d8e6f2", far: "#d8e6f2", zFar: 1 }, [clouds("r10", 500, ["#ffffff", "#a8c4e0"], 191, -260, -60, 30, 3)], true),
    cam: (u, lt, ) => { const k = Math.max(0, lt - 1.2); return C(lt * 3, -0.5 * 9.81 * k * k * 0.7, -18, 42); }, lite: DAY, act: (A, lt) => {
      plane(A, "b29", 0 + lt * 0.0, 2, 30, { sc: 1 }); const k = Math.max(0, lt - 1.2), y = 3.2 - 0.5 * 9.81 * k * k, ang = k < 0.6 ? Math.sin(k * 9) * 0.5 * (1 - k / 0.6) : 0.15 + 0.4 * Math.min(1, (k - 0.6) * 0.5);
      A.fx(24, (g, c) => { const [sx, sy, s] = P(c, 2.8 + k * 3, y, 24); g.save(); g.translate(sx, sy); g.rotate(Math.PI / 2 - ang + Math.PI / 2 * 0); g.restore(); });
      A.sp("littleboy", 2.8 + k * 3, y, 24, { rot: Math.PI / 2 * 0.2 + ang, sc: 1 });
    } },
  // 71c "sobre Hiroshima." — the city on its river delta, a calm summer morning
  { t0: 450.95, fade: 0.25, L: () => loc(["#5a8ad0", "#e8eef0"], { near: "#7a8a6a", far: "#9aa48a", kind: "grass", seed: 230, zFar: 4000 }, [mtn("r11", 2600, "#6a809a", 193, 600, false, 3), skyline("r11", 900, "#8a8a84", "tokyo", 195, 1.5), skyline("r11b", 420, "#7a7670", "tokyo", 196, 1)]),
    cam: mv([0, 260, -100, 42, -140], [0, 255, -40, 42, -140]), lite: NOON, act: (A, lt) => { A.fx(1200, (g, c) => { for (const x of [-300, -60, 200]) { const [ax, ay] = P(c, x, 0, 400), [bx, by] = P(c, x + 80, 0, 3000); g.strokeStyle = "rgba(140,180,210,0.7)"; g.lineWidth = 10; g.beginPath(); g.moveTo(ax, ay); g.lineTo(bx, by); g.stroke(); } }); A.over((g) => caption(g, "HIROSHIMA", lt - 0.2, 1.2)); } },
  // 72a "A explosão destruiu grande parte da cidade" — white flash, the fireball climbs into the mushroom, the shock ring races out
  { t0: 452.24, L: () => loc(["#4a6ab0", "#e4dcd0"], { near: "#6a6a5a", far: "#8a887a", kind: "grass", seed: 232, zFar: 5000 }, [mtn("r12", 3200, "#5a6a80", 197, 700, false, 3), skyline("r12", 1400, "#6a6a66", "tokyo", 199, 1.8)]),
    cam: hand((u, lt) => C(0, 280, -200, 46, -120 + lt * 12), 0.6), lite: DAY, kicks: [[452.6, 18], [453.0, 10]], act: (A, lt, u, T) => {
      A.fx(2999, (g, c) => mushroom(g, c, T - 452.4, 0, 3000, 2.0, 7)); A.light((g) => { const k = T - 452.4; if (k > 0 && k < 3) tint(g, "#ffd8a0", 0.35 * (1 - k / 3), "screen"); });
    } },
  // 72b "e provocou a morte de dezenas de milhares de pessoas." — the ruins: the dome's skeleton, smoke, a child's tricycle
  { t0: 454.8, fade: 0.4, L: () => loc(["#5a564e", "#a8a094"], { near: "#5a5248", far: "#7a7064", kind: "rubble", seed: 234 }, [skyline("r13", 60, "#3e3a36", "hiroshima", 201, 1), forest("r13", 30, "dead", "#000", 8, 203, { blur: 0.8, h: 7 })]),
    cam: (u, lt) => C(-1 + lt * 0.3, 1.2, -4, 40), lite: GREY, wx: ["ash", 160, 0.6], act: (A, lt) => {
      A.sp("tricycle", 0.4, 0, 1.6, { sc: 1.1, rot: 0.12 }); A.fx(20, (g, c) => { for (const x of [-10, 4, 14]) smokeCol(g, c, lt, x, 0, 24, { h: 20, w: 3, col: [80, 74, 70], a: 0.5, seed: x, rate: 0.05 }); });
    } },
  // 73a "Três dias depois, em 9 de agosto," — Nagasaki's harbour between green hills
  { t0: 458.63, fade: 0.35, L: () => loc(["#7a9ac0", "#ecece4"], { near: "#5a7a4a", far: "#7a9a6a", kind: "grass", seed: 236, zFar: 3000 }, [mtn("r14", 2400, "#5a7a6a", 205, 400, false, 3), hillL("r14", 600, "#5e7a52", 207, 120, 2)]),
    cam: mv([0, 120, -200, 42, -80], [20, 120, -180, 42, -80]), lite: DAY, act: (A, lt) => { A.fx(1000, (g, c) => sea(g, c, lt, { crest: "rgba(240,248,255,0.35)", z0: 300, z1: 1500, n: 120, seed: 63 })); A.over((g) => caption(g, "9 DE AGOSTO DE 1945 · NAGASAKI", lt - 0.3, 3.0)); } },
  // 73b "outra bomba atômica foi lançada sobre Nagasaki." — seen from a far ridge: a lone figure watches the second cloud rise
  { t0: 461.2, fade: 0.2, L: () => loc(["#7a8ab0", "#f0dcc0"], { near: "#3a3a2e", far: "#5a5a46", kind: "grass", seed: 238, zFar: 5000 }, [mtn("r15", 3600, "#6a7a96", 209, 600, false, 3), hillL("r15", 14, "#2a2a22", 211, 1.6, 0.4)]),
    cam: mv([0, 1.8, -6, 44, -60], [0, 1.9, -5.4, 42, -70]), lite: BACK, kicks: [[462.95, 8]], act: (A, lt, u, T) => {
      A.fx(4999, (g, c) => mushroom(g, c, T - 462.9, -400, 5000, 3.0, 9)); A.a(v(civ(3, 97, true), { hat: "headscarf", cap: "#5a5a6a" }), 1151, -1.6, 2.6, { expr: T > 463 ? "shock" : "neutral", look: 1 }, { y: 1.4, dark: 0.8, darkCol: "#1e1a20" });
    } },
  // 74a "As duas cidades sofreram uma destruição terrível, e os sobreviventes" — a flattened plain; survivors walk through the dust
  { t0: 464.65, fade: 0.3, L: () => loc(["#7a6e66", "#c4b4a0"], { near: "#6a5e50", far: "#8a7c6a", kind: "rubble", seed: 240, zFar: 400 }, [skyline("r16", 120, "#5a524a", "stalingrad", 213, 2.5), forest("r16", 40, "dead", "#000", 10, 215, { blur: 1, h: 8 })]),
    cam: (u, lt) => C(-lt * 0.4, 1.4, -5, 40), lite: GREY, wx: ["ash", 140, 0.5], act: (A, lt) => {
      for (let i = 0; i < 4; i++) walkS(A, v(civ(i, 99, true), { jacket: "#8a8070", pants: "#6a6256", band: "#f2efe6" }), 1161 + i, lt, 4 + i * 1.4, 2.4 + (i % 2) * 1.0, -0.6, { expr: "sad" });
      A.a(kid(2, 99), 1165, -1.6, 2.0, { expr: "sad", look: 1, ...idle(lt, 1165) }, { sc: 1 });
    } },
  // 74b "enfrentaram consequências devastadoras da radiação." — a makeshift clinic: a nurse tends a survivor; a counter clicks
  { t0: 468.85, fade: 0.25, L: () => loc(undefined, { near: "#5a5448", far: "#6a6456", kind: "wood", zFar: 8 }, [wall("r17", 3, "#9a9282", { h: 4, wid: 8, win: 1, winCol: "#d8dcd8" })], true),
    cam: mv([0, 1.3, -2.8, 38], [0, 1.3, -2.3, 34]), lite: { ...BACK, rim: "#f4f0e0" }, act: (A, lt) => {
      A.sp("bench", -0.4, 0, 2.0, { sc: 1.1 }); A.a(v(civ(1, 101, true), { jacket: "#e0dcd0", pants: "#e0dcd0" }), 1171, -0.5, 2.0, { mode: "sit", expr: "pained", headTilt: 10 }, { y: 0.2 }); A.a(v(NURSE, { skin: "#f0d0a8" }), 1172, 0.9, 2.2, { expr: "sad", look: -1, facing: -1, crouch: 0.2 });
      A.sp("geiger", 1.6, 0.75, 1.9, { sc: 1 }); A.light((g) => { const [sx, sy, s] = P(A.cam, 1.6, 0.95, 1.9); if (Math.floor(lt * 11) % 3 === 0) glow(g, sx, sy, 0.15 * s, "rgba(255,220,120,1)", 0.9); });
    } },
  // 75 "Nesse mesmo período, a União Soviética declarou guerra ao Japão" — Manchuria: Soviet armour crosses the grass hills at dawn
  { t0: 472.31, fade: 0.3, L: () => loc(["#4a6aa0", "#f4d8a8"], { near: "#8a9a5a", far: "#aab47a", kind: "grass", seed: 242, zFar: 500 }, [mtn("r18", 320, "#7a8aa0", 217, 80, false, 3), hillL("r18", 90, "#8a9a62", 219, 14, 1.5)]),
    cam: (u, lt) => C(lt * 4, 2.2, -10, 42, -20), lite: GOLD, act: (A, lt, u, T) => {
      for (let i = 0; i < 4; i++) tank(A, "t34", -10 + lt * 5 + i * 9, 6 + (i % 2) * 4, { vel: 5, dustCol: [200, 186, 140], t: lt + i, fire: i === 1 ? T - 476.1 : -1 });
      for (let i = 0; i < 6; i++) walkS(A, sol(RED, 30 + i), 1181 + i, lt, -6 + i * 2.2, 3 + (i % 2) * 0.7, 1.6, { expr: "stern" });
      A.over((g) => caption(g, "MANCHÚRIA · 9 DE AGOSTO DE 1945", lt - 0.3, 3.0));
    } },
  // 76 "Diante da situação militar e da destruição..., o Japão anunciou sua rendição." — a courtyard: people kneel before the radio as the Emperor speaks
  { t0: 479.88, fade: 0.3, L: () => loc(["#6a90c0", "#f0e8d4"], { near: "#a89a7a", far: "#c0b294", kind: "stone", seed: 244 }, [{ key: "r19w", z: 8, x0: -14, x1: 14, y0: -1, y1: 8, ppm: 40, paint: (w) => { w.rect(-14, 0, 28, 4, w.vgrad(0, 4, "#6a4a32", "#8a6a4a"), 3); for (let x = -13; x < 14; x += 2) w.rect(x, 0.4, 1.6, 3.2, "#e8e0c8", 2); w.poly([[-15, 4], [15, 4], [12, 6.2], [-12, 6.2]], "#3a3a3e", 3); } }, forest("r19", 30, "cherry", "#e8a8b8", 6, 221, { blur: 1, h: 6 })]),
    cam: mv([0, 1.6, -5, 40, -60], [0, 1.6, -4.2, 38, -70]), lite: { ...DAY, rdx: -1 }, act: (A, lt, u, T) => {
      A.sp("radio", 0, 0.8, 4, { sc: 1.3 }); panel(A, 4.05, (w) => w.rect(-0.5, 0, 1.0, 0.8, "#4a3424", 2.5)); A.light((g) => { const [sx, sy, s] = P(A.cam, 0, 1.6, 4); glow(g, sx, sy, 0.6 * s, "rgba(255,210,120,1)", 0.5); });
      for (let i = 0; i < 7; i++) A.a(civ(i, 103, true), 1191 + i, -4 + i * 1.3, 2.2 + (i % 2) * 0.9, { mode: "sit", expr: T > 484.6 ? (i % 2 ? "sad" : "pained") : "nervous", headTilt: T > 484.6 ? 14 : 4, look: 0 }, { y: 0.05 });
      A.over((g) => caption(g, "15 DE AGOSTO DE 1945", lt - 0.4, 3.4));
    } },
  // 77a "No dia 2 de setembro de 1945," — the deck of the USS Missouri in Tokyo Bay: the delegations face each other
  { t0: 486.35, fade: 0.3, L: () => loc(["#6a90c4", "#e8e6de"], { near: "#9a9890", far: "#a8a69e", kind: "wood", zFar: 30 }, [mtn("r20", 400, "#8a9ab8", 223, 120, true, 3, 0.3),
      { key: "r20t", z: 14, x0: -10, x1: 10, y0: -1, y1: 8, ppm: 40, paint: (w) => { const c = "#7a8288"; w.rect(-8, 0, 16, 3, w.vgrad(0, 3, "#6a7278", "#9aa2a8"), 3); for (let k = 0; k < 3; k++) w.rect(4, 1.0 + k * 0.6, 7, 0.35, c, 2); w.rect(-9, 3, 18, 3.5, w.vgrad(3, 6.5, "#6a7278", "#9aa2a8"), 3); } }]),
    cam: mv([0, 2.0, -6, 42, -30], [0.3, 2.0, -5.2, 40, -30]), lite: DAY, act: (A, lt) => {
      A.fx(300, (g, c) => sea(g, c, lt, { crest: "rgba(240,248,255,0.4)", z0: 20, z1: 400, n: 80, seed: 65 }));
      A.sp("deskG", 0, 0, 3, { sc: 1.1 }); A.a(MACA, 1201, 1.8, 3.6, { expr: "stern", look: -1, facing: -1, ...idle(lt, 1201) }); A.a(SHIGE, 1202, -1.8, 3.4, { expr: "sad", look: 1, facing: 1 }); A.a(UMEZU, 1203, -2.9, 3.9, { expr: "sad", look: 1 });
      for (let i = 0; i < 8; i++) A.a(i % 2 ? SAILOR : SAILOR_B, 1204 + i, -6 + i * 1.6, 13.8, { expr: "stern", look: 0 }, { y: 3.0 });
      for (let i = 0; i < 6; i++) planeTop(A, "b29", -200 + i * 60 + lt * 40, 140, 300 + i * 8, { head: Math.PI / 2, below: true });
      A.over((g) => caption(g, "2 DE SETEMBRO DE 1945 · USS MISSOURI", lt - 0.3, 3.0));
    } },
  // 77b "a rendição foi oficialmente assinada." — the pen moves across the instrument of surrender
  { t0: 489.85, L: () => loc(undefined, { near: "#2a3a2a", far: "#2a3a2a", zFar: 1 }, [], true), cam: mv([0, 0.15, -1.7, 40], [0.3, -0.35, -0.6, 38]), act: (A, lt, u, T) => {
      signing(A, clamp((T - 490.35) / 1.7), { z: 3, seed: 77, title: "INSTRUMENTO DE RENDIÇÃO", sub: "Baía de Tóquio, 2 de setembro de 1945", sleeve: "#1a1a1e", skin: "#f0d0a8", desk: "#2a4a30" });
    } },
  // 78 "Depois de seis anos de destruição, a Segunda Guerra Mundial finalmente chegava ao fim." — homecoming at sunset: hats fly, families run to embrace
  { t0: 492.39, fade: 0.3, L: () => loc(["#4a3a6a", "#ffb07a"], { near: "#6a5048", far: "#8a6a58", kind: "wood", zFar: 60 }, [clouds("r21", 300, ["#ffc090", "#5a3a6a"], 225, 20, 80, 16, 4)]),
    cam: mv([0, 2.2, -7, 44, -20], [0, 2.3, -6, 42, -30]), lite: GOLD, bloom: 0.85, act: (A, lt, u, T) => {
      A.fx(200, (g, c) => sea(g, c, lt, { crest: "rgba(255,210,170,0.35)", glitter: [10, "255,200,150"], z0: 14, z1: 300, n: 120, seed: 67 })); ship(A, "destroyer", 10, 40, {});
      A.light((g) => { sun(g, VW * 0.55, VH * 0.5, 44, "255,190,120"); rays(g, VW * 0.55, VH * 0.5, VW, 0.12, "255,180,120", 18, lt); });
      for (let i = 0; i < 6; i++) { const x = -5 + i * 2; A.a(i % 2 ? SAILOR : sol(GI, 200 + i, false), 1221 + i, x, 3 + (i % 2) * 0.8, { expr: "laugh", wave: Math.sin(lt * 7 + i) }); A.fx(3, (g, c) => { const k = (lt - 0.6 - i * 0.2) % 2.4, [y] = bounce(Math.max(0, k), 2.0, 7, 0); if (k < 0 || y <= 0.05) return; const [sx, sy, s] = P(c, x + k * 0.2, y, 3); g.save(); g.translate(sx, sy); g.rotate(k * 9); g.fillStyle = i % 2 ? "#f4f4f0" : "#5c6136"; g.beginPath(); g.ellipse(0, 0, 0.18 * s, 0.08 * s, 0, 0, 7); g.fill(); g.restore(); }); }
      crowd(A, 8, -6, 6, 1.2, 2.2, 227, (i) => ({ expr: "laugh", wave: Math.sin(lt * 6 + i) }), (i) => (i % 3 === 2 ? kid(i, 227) : civ(i, 227)));
      A.over((g) => bigText(g, "1939 — 1945", T - 495.3, 2.5, VH * 0.2, 110, "#f6efe0", "o fim da guerra"));
    } },
  // 79 "O mundo que surgiu depois da guerra era completamente diferente." — dawn over a scarred city, birds rise, the first scaffolds
  { t0: 498.97, fade: 0.35, L: () => loc(["#6a80b0", "#f8dcb8"], { near: "#6a6050", far: "#8a7e68", kind: "rubble", seed: 246 }, [skyline("r22", 160, "#7a7488", "berlin", 229, 2), ruins("r22", 40, ["#8a7a6a", "#7a6c5e"], 231, { hgt: [6, 14], blur: 1 })]),
    cam: mv([0, 3, -10, 42, -30], [2, 3.4, -9, 42, -40]), lite: GOLD, act: (A, lt) => { A.sp("crane", 14, 0, 60, { sc: 1 }); A.fx(30, (g, c) => birds(g, c, lt, 9, -10, 8, 30, 2.4, "#2a2430", 233, 0.6)); A.light((g) => { sun(g, VW * 0.2, VH * 0.5, 30, "255,214,170"); lensFlare(g, VW * 0.2, VH * 0.5, 0.5); }); } },
  // 80a "Estima-se que entre 70 e 85 milhões de pessoas tenham morrido durante o conflito," — a sea of candles in the dark
  { t0: 503.58, fade: 0.4, L: () => loc(["#04040a", "#120e16"], { near: "#14100e", far: "#1a1612", kind: "stone", seed: 248 }, []),
    cam: mv([0, 1.2, -4, 42, -60], [0, 1.4, -3, 40, -80]), lite: { ...NIGHTFIRE, sa: 0 }, bloom: 0.9, act: (A, lt, u, T) => {
      for (let i = 0; i < 120; i++) { const x = (hash(i) - 0.5) * 16, z = 0.5 + hash(i * 3) * 14; A.sp("candle", x, 0, z, { sc: 1 }); A.fx(z - 0.01, (g, c) => { const [sx, sy, s] = P(c, x, 0.4 + 0.01 * Math.sin(lt * 9 + i), z); glow(g, sx, sy, 0.35 * s, "rgba(255,190,100,1)", 0.7); g.fillStyle = "#fff2c0"; g.beginPath(); g.ellipse(sx, sy, 0.02 * s, 0.05 * s, 0.1 * Math.sin(lt * 7 + i), 0, 7); g.fill(); }); }
      const n = T < 504.6 ? 0 : T < 505.35 ? 70e6 * clamp((T - 504.6) / 0.6) : lerp(70e6, 85e6, clamp((T - 505.35) / 0.9)); A.over((g) => counter(g, n, "MORTOS ESTIMADOS", T - 504.4, 5.0, VH * 0.24, "#f6efe0", 104));
    } },
  // 80b "entre militares e civis." — a soldier's helmet and a woman's hat lie side by side in the rain
  { t0: 509.6, fade: 0.3, L: () => loc(["#2a2e38", "#6a6e76"], { near: "#3a3a3a", far: "#4a4a4c", kind: "stone", seed: 250 }, []),
    cam: mv([0, 0.9, -2.2, 36, 60], [0, 0.85, -1.8, 32, 60]), lite: GREY, wx: ["rain", 200, 0.35], act: (A) => {
      A.sp("bench", 0, 0, 1.6, { sc: 1.1 }); A.sp("helmetG", -0.4, 0.5, 1.58, { sc: 1 }); panel(A, 1.57, (w) => { w.ell(0.45, 0.55, 0.32, 0.06, "#7a3a4a", 2); w.ell(0.45, 0.62, 0.2, 0.1, "#8a4a5a", 2); w.ell(0.6, 0.66, 0.05, 0.04, "#e8c8d0", 0); });
    } },
  // 81a "O regime nazista também foi responsável pelo Holocausto," — rails lead through the snow to a dark gate in the mist
  { t0: 512.13, fade: 0.45, L: () => loc(["#6a6e78", "#c8ccd0"], { near: "#c8ccd0", far: "#dadde0", kind: "snow", seed: 252, zFar: 300 }, [wire("r23", 40, 40)]),
    cam: mv([0, 1.6, -6, 40], [0, 1.6, -3, 38]), lite: { ...GREY, sa: 0.1 }, wx: ["snow", 90, 0.4], act: (A, lt, u, T) => {
      A.sp("gate", 0, 0, 60, { sc: 1 }); A.fx(59, (g, c) => { for (let i = 0; i < 2; i++) { const [ax, ay] = P(c, -0.7 + i * 1.4, 0, -2), [bx, by] = P(c, -0.7 + i * 1.4, 0, 60); g.strokeStyle = "#3a3a3e"; g.lineWidth = 4; g.beginPath(); g.moveTo(ax, ay); g.lineTo(bx, by); g.stroke(); } for (let z = -1; z < 60; z += 0.9) { const [ax, ay, s] = P(c, -1.0, 0, z), [bx] = P(c, 1.0, 0, z); g.strokeStyle = "#4a3e34"; g.lineWidth = Math.max(1, 0.12 * s); g.beginPath(); g.moveTo(ax, ay); g.lineTo(bx, ay); g.stroke(); } });
      A.fx(30, (g, c) => { for (let i = 0; i < 14; i++) { const k = (lt * 0.04 + hash(i)) % 1, [sx, sy, s] = P(c, -20 + 40 * k, 1 + hash(i + 2) * 2, 10 + hash(i) * 40); puff(g, sx, sy, 4 * s, [214, 216, 220], 0.2); } });
      A.over((g) => bigText(g, "HOLOCAUSTO", T - 514.7, 1.2, VH * 0.18, 80, "#e8e8ec", undefined, "180,190,210"));
    } },
  // 81b "o assassinato sistemático" — rows of empty shoes in cold light
  { t0: 515.85, fade: 0.35, L: () => loc(undefined, { near: "#4a4a4c", far: "#5a5a5c", kind: "stone", seed: 254, zFar: 20 }, [wall("r24", 6, "#7a7a7c", { h: 5, wid: 12 })], true),
    cam: (u, lt) => C(-1 + lt * 0.35, 0.7, -2.4, 40, 40), lite: GREY, act: () => { for (let r = 0; r < 8; r++) for (let c = -3; c <= 3; c++) A_SHOE(r, c); } },
  // 81c "de aproximadamente seis milhões de judeus," — memorial candles before a stone with the Star of David
  { t0: 518.75, fade: 0.35, L: () => loc(["#0a0a12", "#1e1c26"], { near: "#1e1c1c", far: "#2a2826", kind: "stone", seed: 256, zFar: 20 }, []),
    cam: mv([0, 1.0, -2.6, 38], [0, 1.0, -2.2, 34]), lite: { ...NIGHTFIRE, sa: 0 }, bloom: 0.8, act: (A, lt, u, T) => {
      panel(A, 2.6, (w) => { w.rect(-1.2, 0, 2.4, 1.8, w.vgrad(0, 1.8, "#3a3a3e", "#6a6a6e"), 3); const st = (rot: number) => { const p: number[][] = []; for (let k = 0; k < 3; k++) { const a = rot + (k * Math.PI * 2) / 3; p.push([Math.cos(a) * 0.42, 1.05 + Math.sin(a) * 0.42]); } w.poly(p, null, 5, "#c8b878"); }; st(Math.PI / 2); st(-Math.PI / 2); });
      for (let i = 0; i < 9; i++) { const x = -1.6 + i * 0.4, z = 1.2 + (i % 3) * 0.3; A.sp("candle", x, 0, z, { sc: 1.2 }); A.fx(z - 0.01, (g, c) => { const [sx, sy, s] = P(c, x, 0.46, z); glow(g, sx, sy, 0.5 * s, "rgba(255,190,100,1)", 0.7); g.fillStyle = "#fff2c0"; g.beginPath(); g.ellipse(sx, sy, 0.025 * s, 0.06 * s, 0.1 * Math.sin(lt * 7 + i), 0, 7); g.fill(); }); }
      A.over((g) => counter(g, 6e6, "JUDEUS ASSASSINADOS", T - 518.9, 3.2, VH * 0.2, "#eeeae0", 90));
    } },
  // 81d "além da perseguição e morte de milhões de outras vítimas." — walking between the grey stelae of a memorial
  { t0: 520.7, fade: 0.3, L: () => loc(["#8a96a6", "#dcdee0"], { near: "#9a9a96", far: "#b0b0ac", kind: "stone", seed: 258, zFar: 200 }, [skyline("r25", 200, "#a8aab0", "berlin", 235, 2.5)]),
    cam: (u, lt) => C(0.6, 1.5, -2 + lt * 0.9, 44, 30), lite: { ...DAY, sa: 0.5 }, act: () => { for (let r = 0; r < 16; r++) for (let c = -4; c <= 4; c++) { if (c === 0) continue; A_STELA(c * 2.6, r * 2.4, r, c); } } },
  // 82a "Cidades estavam destruídas," — the rubble women pass bricks hand to hand
  { t0: 524.3, fade: 0.3, L: () => loc(["#8a96a8", "#e0d8c8"], { near: "#7a6a5a", far: "#9a8a76", kind: "rubble", seed: 260 }, [ruins("r26", 18, ["#9a8470", "#8a7462", "#a48c76"], 237, { hgt: [7, 13] })]),
    cam: mv([0, 1.5, -4.6, 42], [0.4, 1.5, -4, 40]), lite: DAY, act: (A, lt) => {
      for (let i = 0; i < 5; i++) A.a(v(civ(i * 3 + 1, 105), { hat: "headscarf" }), 1231 + i, -4 + i * 2, 2.6 + (i % 2) * 0.4, { expr: "stern", look: i % 2 ? -1 : 1, facing: i % 2 ? -1 : 1, crouch: 0.2 + 0.2 * Math.sin(lt * 3 + i) });
      A.fx(2.5, (g, c) => { const k = (lt * 0.8) % 1, seg = Math.floor((lt * 0.8) % 4), x = -4 + seg * 2 + k * 2, y = 1.3 + Math.sin(k * Math.PI) * 0.5; const [sx, sy, s] = P(c, x, y, 2.6); g.fillStyle = "#9a5a42"; g.strokeStyle = "#241726"; g.lineWidth = 2; g.save(); g.translate(sx, sy); g.rotate(k * 1.5); g.fillRect(-0.12 * s, -0.05 * s, 0.24 * s, 0.1 * s); g.strokeRect(-0.12 * s, -0.05 * s, 0.24 * s, 0.1 * s); g.restore(); });
      panel(A, 3.4, (w) => { for (let k = 0; k < 18; k++) w.rect(3.4 + (k % 6) * 0.26, Math.floor(k / 6) * 0.11, 0.24, 0.1, "#9a5a42", 1.2); });
    } },
  // 82b "países precisavam ser reconstruídos" — scaffolds, a crane swings a beam, welders' sparks, aid crates
  { t0: 527.55, fade: 0.25, L: () => loc(["#5a9ad8", "#eef0ea"], { near: "#8a8070", far: "#a89c88", kind: "stone", seed: 262 }, [city("r27", 30, { pal: ["#d8ccb4", "#c8bca4"], seed: 239, floors: [4, 5], hgt: [14, 18], blur: 1 })]),
    cam: mv([0, 2.6, -8, 44, -40], [0.6, 2.8, -7, 42, -40]), lite: NOON, act: (A, lt) => {
      A.sp("crane", 6, 0, 16, { sc: 0.6 }); const sw = 0.08 * Math.sin(lt * 1.4); A.fx(15.9, (g, c) => { const [hx, hy, s] = P(c, 12, 19, 15.9), L = 8 * s, px = hx + Math.sin(sw) * L, py = hy + Math.cos(sw) * L; g.strokeStyle = "#1e1e1e"; g.lineWidth = 2; g.beginPath(); g.moveTo(hx, hy); g.lineTo(px, py); g.stroke(); g.save(); g.translate(px, py); g.rotate(sw * 0.5); g.fillStyle = "#7a5a3a"; g.strokeStyle = "#241726"; g.lineWidth = 2.5; g.fillRect(-3 * s, 0, 6 * s, 0.4 * s); g.strokeRect(-3 * s, 0, 6 * s, 0.4 * s); g.restore(); });
      panel(A, 6, (w) => { for (let y = 0; y < 9; y += 1.8) w.line([[-6, y], [2, y]], 3, "#8a6a42"); for (let x = -6; x <= 2; x += 2) w.line([[x, 0], [x, 9]], 3, "#8a6a42"); });
      A.a(v(civ(4, 107), { hat: "cap", cap: "#3a3a3a" }), 1241, -1.6, 5.9, { expr: "stern", crouch: 0.3, prop: ["brush", 0.6] }, { y: 3.6 }); A.fx(5.8, (g, c) => sparks(g, c, lt, -2.1, 4.6, 5.8, -1, 40, 7));
      for (let i = 0; i < 3; i++) A.sp("crate", -5 + i * 1.5, 0, 2.6 + (i % 2) * 0.4, { sc: 0.9 }); A.a(sol(GI, 210, false), 1242, 3, 3, { expr: "smile", look: -1, facing: -1 });
    } },
  // 82c "e milhões de pessoas haviam perdido suas famílias." — a child with a suitcase searches the station's notice wall
  { t0: 530.3, fade: 0.25, L: () => loc(undefined, { near: "#4a4440", far: "#5a524c", kind: "stone", seed: 264, zFar: 30 }, [wall("r28", 4, "#8a8274", { h: 6, wid: 12, win: 3, winCol: "#c8ccd0", arch: true })], true),
    cam: mv([0, 1.3, -3, 40], [0.3, 1.3, -2.4, 36]), lite: { ...BACK, rim: "#e8ecf0" }, act: (A, lt) => {
      panel(A, 3.9, (w) => { w.rect(-3, 0.8, 6, 2.6, "#5a4630", 3); for (let i = 0; i < 26; i++) { const x = -2.8 + (i % 9) * 0.64, y = 0.95 + Math.floor(i / 9) * 0.8; w.rect(x, y, 0.5, 0.62, ["#f4ecd8", "#e8dcc0", "#f0e8e0"][i % 3], 1.2); for (let l = 0; l < 3; l++) w.line([[x + 0.06, y + 0.48 - l * 0.12], [x + 0.42, y + 0.48 - l * 0.12]], 1, "#4a3a2a"); } });
      A.a(kid(1, 109), 1251, 0.2, 2.0, { expr: "sad", look: 0, prop: ["suitcase", 0], headTilt: -8 }, { sc: 1 }); A.fx(10, (g, c) => smokeCol(g, c, lt, -5, 2, 12, { h: 6, w: 2, col: [220, 220, 224], a: 0.5, rate: 0.12 }));
    } },
  // 83a "A Alemanha foi dividida em zonas de ocupação," — the four zones slide apart on a dusk-toned map
  { t0: 532.77, fade: 0.3, L: () => europe("r29", ST.dusk, false), cam: mv([-1.6, 1.0, -16, 40], [-1.6, 1.0, -14.5, 38]), act: (A, lt, u, T) => {
      const k = easeOut(clamp((T - 533.6) / 1.0)) * 0.35; const Z: [string, number, number, number, number, string, number, number][] = [["#c03a2e", 11.2, 47, 20, 56, "SOVIÉTICA", 1, 0], ["#2a5ac0", 8.4, 47, 11.2, 50.6, "AMERICANA", 0.4, -1], ["#3a8a4a", 4, 50.6, 11.2, 56, "BRITÂNICA", -0.6, 0.8], ["#c8a02a", 4, 46, 8.4, 50.6, "FRANCESA", -1, -1]];
      for (const [col, lo0, la0, lo1, la1, lab, dx, dy] of Z) A.fx(-0.05, (g, c) => { const pts = geoP(R39GER); g.save(); g.translate(dx * k * 40, -dy * k * 40); g.beginPath(); const [r0x, r0y] = P(c, MX(lo0), MY(la1), 0), [r1x, r1y] = P(c, MX(lo1), MY(la0), 0); g.rect(r0x, r0y, r1x - r0x, r1y - r0y); g.clip();
        g.beginPath(); pts.forEach(([x, y], i) => { const [sx, sy] = P(c, x, y, 0); i ? g.lineTo(sx, sy) : g.moveTo(sx, sy); }); g.closePath(); g.fillStyle = col; g.globalAlpha = 0.85; g.fill(); g.globalAlpha = 1; g.strokeStyle = "#1a1420"; g.lineWidth = 3; g.stroke(); g.restore();
        if (T > 534.3) { const [lx, ly] = P(c, MX((lo0 + Math.min(lo1, 15)) / 2), MY((la0 + la1) / 2), 0); g.save(); g.globalAlpha = clamp((T - 534.3) / 0.4); g.font = `bold 26px "DejaVu Sans", sans-serif`; g.fillStyle = "#ffffff"; g.strokeStyle = "rgba(0,0,0,0.7)"; g.lineWidth = 5; g.textAlign = "center"; g.strokeText(lab, lx + dx * k * 40, ly - dy * k * 40); g.fillText(lab, lx + dx * k * 40, ly - dy * k * 40); g.restore(); } });
    } },
  // 83b "e duas novas superpotências passaram a disputar influência mundial: os Estados Unidos e a União Soviética." — Truman and Stalin face off, blue light against red
  { t0: 535.75, fade: 0.25, L: () => loc(undefined, { near: "#2a2228", far: "#3a3036", kind: "wood", zFar: 10 }, [wall("r30", 4, "#3a3440", { h: 6, wid: 10 })], true),
    cam: mv([0, 1.6, -3.6, 40], [0, 1.6, -3.0, 36]), lite: { sx: 0, sy: 0.3, sa: 0.3, rim: "#ffffff", ra: 0.3, rdx: 0, rdy: -1 }, act: (A, lt, u, T) => {
      A.sp("deskG", 0, 0, 2.0, { sc: 1.1 }); A.a(TRUMAN, 1261, -1.4, 2.4, { expr: "stern", facing: 1, look: 1, ...idle(lt, 1261) }); A.a(STALIN_CAP, 1262, 1.4, 2.4, { expr: "stern", facing: -1, look: -1, ...idle(lt, 1262) });
      const bu = clamp((T - 539.3) / 0.5), re = clamp((T - 541.3) / 0.5); A.light((g) => { glow(g, 0, VH * 0.5, VW * 0.6, "rgba(60,120,255,1)", 0.25 + 0.3 * bu); glow(g, VW, VH * 0.5, VW * 0.6, "rgba(255,50,40,1)", 0.25 + 0.3 * re); });
      flag(A, "us", -3.6, 3.2, 3.6, 1.3, 0.8, { t: lt, alpha: 0.4 + 0.6 * bu }); flag(A, "su", 2.4, 3.2, 3.6, 1.3, 0.8, { t: lt, alpha: 0.4 + 0.6 * re });
    } },
  // 84 "Essa rivalidade daria início à Guerra Fria." — a border fence in the snow, a watchtower's searchlight; frost creeps across the frame
  { t0: 543.25, fade: 0.3, L: () => loc(["#06080e", "#1e2836"], { near: "#a8b0bc", far: "#c0c8d2", kind: "snow", seed: 266 }, [wire("r31", 6, 30), forest("r31", 50, "pine", "#141a22", 30, 241, { blur: 1.4, h: 14, snow: true })]),
    cam: mv([0, 1.4, -3, 40], [0, 1.4, -2.4, 36]), lite: MOON, wx: ["snow", 120, 0.4], act: (A, lt, u, T) => {
      A.sp("tower", 6, 0, 16, { sc: 1 }); A.light((g) => { const [sx, sy] = P(A.cam, 6, 9.3, 16); g.save(); g.globalCompositeOperation = "lighter"; g.translate(sx, sy); g.rotate(Math.PI / 2 + 0.5 * Math.sin(lt * 0.8) + 0.4); const gr = g.createLinearGradient(0, 0, 1400, 0); gr.addColorStop(0, "rgba(220,230,255,0.45)"); gr.addColorStop(1, "rgba(220,230,255,0)"); g.fillStyle = gr; g.beginPath(); g.moveTo(0, -6); g.lineTo(1400, -180); g.lineTo(1400, 180); g.lineTo(0, 6); g.fill(); g.restore(); glow(g, sx, sy, 40, "rgba(220,230,255,1)", 0.8); });
      A.light((g) => { const k = clamp((T - 543.6) / 2.2); const gr = g.createRadialGradient(VW / 2, VH / 2, VH * 0.25, VW / 2, VH / 2, VW * 0.62); gr.addColorStop(0, "rgba(200,225,255,0)"); gr.addColorStop(1, `rgba(200,225,255,${0.6 * k})`); g.fillStyle = gr; g.fillRect(0, 0, VW, VH); });
      A.over((g) => bigText(g, "GUERRA FRIA", T - 545.2, 1.6, VH * 0.5, 130, "#eef4ff", undefined, "150,200,255"));
    } },
  // 85a "Em 1945, também foi criada a Organização das Nações Unidas," — San Francisco: delegates of many nations in the hall
  { t0: 546.83, fade: 0.3, L: () => loc(undefined, { near: "#3a4a6a", far: "#4a5a7a", kind: "none", zFar: 16 }, [wall("r32", 7, "#c8c4b4", { h: 9, wid: 16, win: 0, panel: "#6a5a42" }), banners("r32", 6.9, 1, 1.2, 8.6, 4, "#4a8ad0")], true),
    cam: mv([0, 2, -5.5, 42, -30], [0, 2, -4.6, 40, -30]), lite: DAY, act: (A, lt) => {
      A.sp("deskW", 0, 0, 3, { sc: 1.3 }); for (let i = 0; i < 9; i++) A.a(DELEG(i), 1271 + i, -5 + i * 1.25, 3.8 + (i % 2) * 0.8, { expr: i % 3 ? "smile" : "neutral", look: 0, ...idle(lt, 1271 + i) });
      A.over((g) => caption(g, "SÃO FRANCISCO · JUNHO DE 1945", lt - 0.3, 2.4));
    } },
  // 85b "...das Nações Unidas," — the Charter is signed
  { t0: 549.4, L: () => loc(undefined, { near: "#1e2a3a", far: "#1e2a3a", zFar: 1 }, [], true), cam: mv([0, 0.15, -1.7, 40], [0.3, -0.35, -0.7, 38]), act: (A, lt, u, T) => {
      signing(A, clamp((T - 549.9) / 1.8), { z: 3, seed: 91, title: "CARTA DAS NAÇÕES UNIDAS", sub: "São Francisco, 26 de junho de 1945", sleeve: "#2a2a30", skin: "#c99067", desk: "#2a4a6a", prior: 1 });
    } },
  // 85c "com o objetivo de promover a cooperação internacional" — handshakes across nations
  { t0: 552.9, fade: 0.2, L: () => loc(["#6aa0dc", "#eef2f4"], { near: "#a8a49c", far: "#bcb8b0", kind: "stone", seed: 268 }, [city("r33", 40, { pal: ["#e8e4dc", "#d8d4cc"], seed: 243, floors: [6, 8], hgt: [22, 28], blur: 2 })]),
    cam: mv([0, 1.6, -4.4, 40], [0.3, 1.6, -3.8, 36]), lite: NOON, act: (A, lt) => {
      for (let p = 0; p < 2; p++) { A.a(DELEG(p * 2 + 1), 1281 + p * 2, -2.6 + p * 3.4, 2.2 + p * 0.6, { expr: "smile", facing: 1, look: 1, prop: ["fist", 0.25 + 0.04 * Math.sin(lt * 10)] }); A.a(DELEG(p * 2 + 4), 1282 + p * 2, -1.5 + p * 3.4, 2.25 + p * 0.6, { expr: "grin", facing: -1, look: -1, prop: ["fist", 0.25 + 0.04 * Math.sin(lt * 10)] }); }
    } },
  // 85d "e evitar novos conflitos de proporções semelhantes." — the blue flag rises, doves take flight
  { t0: 555.4, fade: 0.25, L: () => loc(["#4a8ad8", "#e8f2f8"], { near: "#8aa070", far: "#a8b890", kind: "grass", seed: 270 }, [clouds("r34", 300, ["#ffffff", "#a8c8e8"], 245, 30, 100, 18, 3)]),
    cam: mv([0, 4.4, -7, 42, 0], [0, 4.8, -6, 40, 0]), lite: DAY, act: (A, lt) => {
      A.sp("flagpole", 0, 0, 4, { sc: 0.8 }); A.fx(3.99, (g, c) => { const [sx, sy, s] = P(c, 0.06, 6.4, 3.99); g.save(); g.translate(sx, sy); const W = 2.6 * s, H = 1.7 * s; for (let i = 0; i < 24; i++) { const k = i / 24, dy = Math.sin(lt * 6 - k * 7) * k * H * 0.1; g.drawImage(UNC(), k * 340, 0, 340 / 24 + 1, 220, k * W, dy, W / 24 + 1, H); } g.restore(); });
      A.fx(6, (g, c) => birds(g, c, lt, 7, -3, 4, 10, 2.2, "#f8f8f8", 247, 0.45));
    } },
  // 86 "A Segunda Guerra Mundial deixou uma marca permanente na história da humanidade." — a veteran lays a wreath at the wall of names at sunset
  { t0: 559.2, fade: 0.35, L: () => loc(["#4a3a5a", "#ffb07a"], { near: "#6a5a50", far: "#8a766a", kind: "stone", seed: 272 }, [{ key: "r35w", z: 4.2, x0: -12, x1: 12, y0: -1, y1: 4, ppm: 60, paint: (w) => { w.rect(-12, 0, 24, 2.6, w.vgrad(0, 2.6, "#3a3638", "#6a6266"), 3); for (let r = 0; r < 9; r++) for (let c = 0; c < 30; c++) w.rect(-11.5 + c * 0.78, 0.3 + r * 0.25, 0.6, 0.06, "rgba(220,200,170,0.55)", 0); } }]),
    cam: mv([0, 1.3, -3.4, 40], [0.3, 1.3, -2.8, 36]), lite: GOLD, act: (A, lt) => {
      const k = smooth(clamp((lt - 0.5) / 2)); A.a(VET, 1291, -0.6, 2.8, { expr: "sad", crouch: 0.3 * Math.sin(k * Math.PI), look: 1, headTilt: 10 }); A.sp("wreath", lerp(-0.1, 0.5, k), lerp(0.9, 0.05, k), lerp(2.8, 4.1, k), { sc: 1 });
      A.fx(2.5, (g, c) => flutter(g, c, lt, { n: 14, x0: -3, x1: 3, z0: 1, z1: 4, top: 3, cols: ["#c0302a", "#e86060"], size: 0.06, fall: 0.5, wind: 0.3, loop: true, seed: 51 }));
    } },
  // 87a "E talvez sua maior lição seja justamente esta:" — a grandfather and grandchild before a museum case; the helmet behind glass
  { t0: 564.07, fade: 0.3, L: () => loc(undefined, { near: "#3a3632", far: "#4a4640", kind: "wood", zFar: 12 }, [wall("r36", 4, "#2e3236", { h: 5, wid: 10, frames: 3 })], true),
    cam: mv([0, 1.4, -3.4, 40], [0.3, 1.4, -2.8, 36]), lite: { ...LAMP, rim: "#ffe8c0" }, act: (A, lt) => {
      panel(A, 3.0, (w) => { w.rect(-0.9, 0, 1.8, 1.0, "#2a2a2c", 3); w.rect(-0.85, 1.0, 1.7, 1.1, "rgba(190,215,230,0.2)", 3); }); A.sp("helmetUS", 0, 1.1, 2.99, { sc: 1.2 }); A.light((g) => { const [sx, sy, s] = P(A.cam, 0.5, 1.9, 2.98); glint(g, sx, sy, 0.15 * s, 0.6 + 0.3 * Math.sin(lt * 2)); });
      A.a(GRAND, 1301, -1.4, 2.0, { expr: "sad", look: 1, facing: 1, headTilt: 5 }); A.a(kid(5, 113), 1302, -0.4, 1.7, { expr: "neutral", look: 1, headTilt: -6 }, { sc: 1 });
    } },
  // 87b "quando o ódio, o extremismo e a ambição pelo poder" — red montage: boots march past burning banners
  { t0: 567.6, fade: 0.2, L: () => loc(["#0a0404", "#4a0c08"], { near: "#1a0a08", far: "#2a100c", kind: "stone", seed: 274 }, [banners("r37", 14, 5, 12, 9, 7, "#8a1410")]),
    cam: mv([0, 1.2, -5, 44], [0, 1.0, -4.4, 42]), lite: REDL, bloom: 0.9, act: (A, lt) => {
      A.fx(13.9, (g, c) => { for (let i = 0; i < 5; i++) fire(g, c, lt, -9.6 + i * 4.8, 2 + (lt * 0.6) % 1, 13.9, 1.2, i); embers(g, c, lt, 0, 13, 20, 50, 10, 13); });
      marchCol(A, (i) => sol(WEH, 220 + i), lt, 10, -9, 4, 2.0, 1.4, 1, 1, { dark: 0.9, darkCol: "#140404" }, { expr: "stern" }, 1310);
    } },
  // 87c "ultrapassam todos os limites," — a line painted across the road; the marching column crosses it, the light turns to fire
  { t0: 570.55, fade: 0.15, L: () => loc(["#2a1418", "#a04a2a"], { near: "#3a2a22", far: "#5a3e30", kind: "mud", seed: 276 }, [hillL("r38", 100, "#2a1a1a", 249, 8, 2)]),
    cam: mv([0, 1.6, -5, 42], [0, 1.6, -4.4, 40]), lite: BACK, act: (A, lt) => {
      panel(A, 3.0, (w) => w.rect(-10, 0, 20, 0.04, "#f2efe6", 0)); A.fx(3.01, (g, c) => { const [ax, ay] = P(c, -10, 0, 3), [bx] = P(c, 10, 0, 3); g.strokeStyle = "#f2efe6"; g.lineWidth = 6; g.setLineDash([30, 20]); g.beginPath(); g.moveTo(ax, ay); g.lineTo(bx, ay); g.stroke(); g.setLineDash([]); });
      marchF(A, (i) => sol(WEH, 240 + i), lt, 4, 4, 8, 1.6, 1.3, 1.5, 1330, () => ({ expr: "stern" }), { dark: 0.85, darkCol: "#1a0606" });
      A.light((g) => tint(g, "#ff5a2a", 0.25 * clamp(lt / 2), "soft-light"));
    } },
  // 87d "o preço pode ser pago por gerações inteiras." — three generations stand before an endless field of white crosses at sunset
  { t0: 573.2, fade: 0.3, L: () => loc(["#3a3a6a", "#ffbe8a"], { near: "#5a7a3a", far: "#8aa060", kind: "grass", seed: 278, zFar: 300 }, [hillL("r39", 160, "#5a6a5a", 251, 8, 2.5)]),
    cam: mv([0, 1.5, -4, 40], [0, 1.6, -3.0, 36]), lite: BACK, bloom: 0.8, act: (A, lt) => {
      for (let r = 0; r < 10; r++) for (let c = -7; c <= 7; c++) A.sp("cross", c * 1.6 + (r % 2) * 0.8, 0, 6 + r * 2.4, { sc: 0.9 });
      A.a(GRAND, 1351, -1.0, 2.0, { expr: "sad", look: 0 }, { dark: 0.6, darkCol: "#2a1a24" }); A.a(civ(3, 115), 1352, 0.0, 2.1, { expr: "sad", look: 0 }, { dark: 0.6, darkCol: "#2a1a24" }); A.a(kid(6, 115), 1353, 0.9, 1.9, { expr: "neutral", look: 0 }, { dark: 0.6, darkCol: "#2a1a24" });
      A.light((g) => { sun(g, VW * 0.5, VH * 0.46, 40, "255,200,140"); rays(g, VW * 0.5, VH * 0.46, VW, 0.14, "255,190,130", 20, lt); });
    } },
  // 88 "Essa foi a história da Segunda Guerra Mundial." — Normandy today at sunset: children play by a lone rusted obstacle
  { t0: 577.0, fade: 0.4, L: () => loc(["#3a4a7a", "#ffc890"], { near: "#c8a880", far: "#dcbc94", kind: "sand", seed: 280, zFar: 300 }, [cliffs("r40", 120, "#a89a88", "#6a7a4a", 253, 16, 2.5)]),
    cam: mv([0, 1.6, -6, 42], [0, 1.8, -5, 40]), lite: GOLD, bloom: 0.85, act: (A, lt) => {
      A.fx(80, (g, c) => sea(g, c, lt, { crest: "rgba(255,220,180,0.45)", glitter: [-10, "255,210,160"], z0: 10, z1: 300, n: 140, seed: 69 }));
      A.sp("hedgehog", 2.6, 0, 5, { sc: 1.1 }); runS(A, kid(7, 117), 1361, lt, -4, 3.2, 1.8, { expr: "laugh" }); runS(A, kid(8, 117), 1362, lt, -5.2, 3.6, 1.8, { expr: "grin" });
      A.light((g) => { sun(g, VW * 0.3, VH * 0.5, 36, "255,200,140"); lensFlare(g, VW * 0.3, VH * 0.5, 0.5); });
      A.over((g) => bigText(g, "A SEGUNDA GUERRA MUNDIAL", lt - 0.2, 3.4, VH * 0.26, 96, "#f6efe0", "1939 – 1945"));
    } },
];
// helpers that need the live scene (bound at draw time via a module-level accumulator)
let CUR: Sc | null = null;
function A_SHOE(r: number, c: number) { const A = CUR!; A.sp("shoes", c * 2.7, 0, 1.4 + r * 1.2, { sc: 1 }); }
function A_STELA(x: number, z: number, r: number, c: number) { const A = CUR!; A.sp("stela", x, 0, z + 1, { sc: 0.8 + 0.25 * hash(r * 9 + c) }); }
import { R39 } from "./kit";
const R39GER = R39.GER;
let UNCV: HTMLCanvasElement | null = null;
function UNC() { if (!UNCV) { UNCV = document.createElement("canvas"); UNCV.width = 340; UNCV.height = 220; const g = UNCV.getContext("2d")!; g.fillStyle = "#4a96e0"; g.fillRect(0, 0, 340, 220); g.strokeStyle = "#ffffff"; g.lineWidth = 5; g.beginPath(); g.arc(170, 110, 52, 0, 7); g.stroke(); g.beginPath(); g.arc(170, 110, 28, 0, 7); g.stroke(); g.beginPath(); g.moveTo(118, 110); g.lineTo(222, 110); g.moveTo(170, 58); g.lineTo(170, 162); g.stroke();
  for (const sd of [-1, 1]) for (let k = 0; k < 9; k++) { const a = Math.PI * (0.6 + 0.08 * k); g.fillStyle = "#fff"; g.beginPath(); g.ellipse(170 + sd * Math.cos(a) * -72, 110 + Math.sin(a) * 72 - 10, 5, 11, sd * (a - Math.PI / 2), 0, 7); g.fill(); } } return UNCV; }
// wrap act functions that use A_SHOE / A_STELA so CUR points at the live scene
for (const s of SHOTS_4) { const f = s.act; if (f) s.act = (A, lt, u, T) => { CUR = A; f(A, lt, u, T); }; }
