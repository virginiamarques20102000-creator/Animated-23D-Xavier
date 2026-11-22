// 0 – 135 s: opening, the questions, chapter 1 (Versailles → Hitler's rise → Munich). Every shot has its own place and palette.
import { VW, VH, P, glow, fire, smokeCol, puff, tint, clamp, lerp, smooth, easeOut, easeIn, hash, rays, sun, beam } from "./engine";
import { Sc, C, mv, path, hand, walkF, walkS, runS, marchF, marchCol, crowd, tank, plane, planeTop, ship, flag, signing, hl, arrow, pin, panel, caption, bigText, chapter, counter, calPage,
  civ, kid, sol, v, idle, lid, HIT_CIV, HIT_BROWN, HIT_GREY, HIT_CAP, HINDEN, CHAMBER, WEH, GI, TOMMY, RAF, GESTAPO, SA, FRENCH } from "./kit";
import { blast, scorch, rubble, embers, flutter, coins, sparks, searchlight, lensFlare, glint, shards, birds, breath, dust, lightning, exhaust, trail, bounce, spring } from "./fx";
import { loc, mtn, hillL, clouds, city, skyline, forest, wall, banners, ruins, field, wire, pier, europe, world, ST, MX, MY, WX, WY, facade, church, mix, shade } from "./places";
import { DAY, GOLD, BACK, GREY, NIGHTFIRE, MOON, LAMP, COLD, NOON } from "./looks";
import type { Shot } from "./types";

const W1918: Outfit1 = { jacket: "#6e7262", pants: "#5a5e50", boots: "#2a2420", hat: "stahlhelm", cap: "#4e5448", rifle: true, sash: "#3a2a1c" };
type Outfit1 = import("./toon").Outfit;
const CLEM: Outfit1 = { jacket: "#2a2a2e", pants: "#2a2a2e", boots: "#141414", hat: "hair", hair: "#e8e6e0", moustache: "#f0efea", build: "stout", tie: "#4a4a4a" };
const WILSON: Outfit1 = { jacket: "#2e3038", pants: "#4a4a50", boots: "#141414", hat: "hair", hair: "#9a968e", glasses: true, tie: "#2a2a3a" };
const LLOYD: Outfit1 = { jacket: "#3a3430", pants: "#3a3430", boots: "#141414", hat: "hair", hair: "#e0ddd6", moustache: "#e0ddd6", tie: "#5a2a24" };
const GERDEL: Outfit1 = { jacket: "#1e1e22", pants: "#3a3a40", boots: "#141414", hat: "hair", hair: "#5a4a3a", glasses: true, tie: "#e8e4dc" };

export const SHOTS_1: Shot[] = [
  // 0a "Imagine um mundo onde cidades inteiras são destruídas,"
  { t0: 0, L: () => loc(["#0c0d1c", "#6a2c1e"], { near: "#2a201c", far: "#3a2a24", kind: "rubble", seed: 3 }, [
      skyline("o0", 160, "#1a1216", "stalingrad", 7, 2.5), ruins("o0", 52, ["#4a3a34", "#3e3430", "#56443a"], 11, { blur: 1.2 }), ruins("o0b", 22, ["#5a4a40", "#4e4038", "#62503e"], 4, { hgt: [8, 13] })]),
    cam: mv([0, 2.2, -10, 46, -40], [0, 3.2, -6, 42, -60]), lite: NIGHTFIRE, bloom: 0.7, kicks: [[3.05, 14]], act: (A, lt, u, T) => {
      for (let i = 0; i < 7; i++) planeTop(A, "he111", -50 + i * 16 + lt * 20, 26 + (i % 2) * 4, 80 + i * 6, { head: Math.PI / 2 + 0.05, dark: 0.75, sc: 1 });
      for (const [x, z, s] of [[-14, 40, 2.6], [9, 30, 2.2], [24, 55, 3.2], [-30, 60, 3], [2, 70, 2.4]] as number[][]) { A.fx(z, (g, c) => fire(g, c, lt, x, 0, z, s, x)); A.fx(z + 0.5, (g, c) => smokeCol(g, c, lt, x, s * 2, z + 0.5, { h: 40, w: 5, col: [36, 30, 32], a: 0.75, seed: x, wind: 0.4 })); }
      A.fx(18, (g, c) => embers(g, c, lt, 0, 18, 40, 70, 18, 5));
      // the facade that collapses on "destruídas" (rotates about its base, then breaks into rubble)
      const k = T - 3.05, rot = k > 0 ? -Math.min(1.5, 0.5 * 9.81 * k * k / 6) : 0;
      if (k < 0.9) panel(A, 15, (w) => facade(w, 2, 9, 15, { wall: "#6a5040", floors: 4, cols: 4, ruin: false, roof: "flat", lit: 0.2, win: "#2a1e1a", seed: 9 }), { pivot: [11, 0], rot });
      A.fx(14.9, (g, c) => { rubble(g, c, k - 0.5, 4, 3, 15, 10, 12, 40, "#6a5040"); if (k > 0.4) blast(g, c, k - 0.4, 6, 0, 15, 3, 21, { debris: 30 }); });
      A.a(v(civ(2, 5), { jacket: "#4a3a3a" }), 11, -2.2, 6, { expr: T > 3.1 ? "shock" : "fear", look: 1, armB: T > 3.1 ? 1 : 0 }, { dark: 0.35, darkCol: "#2a1010" });
      A.light((g) => glow(g, VW * 0.5, VH * 0.95, VW * 0.6, "rgba(255,110,40,1)", 0.25));
    } },
  // 0b "milhões de pessoas precisam abandonar suas casas"
  { t0: 3.9, fade: 0.3, L: () => loc(["#57607a", "#e8a070"], { near: "#7a6650", far: "#a48a68", kind: "mud", seed: 5, zFar: 300 }, [
      clouds("o1", 260, ["#c88a70", "#5a5a78"], 4, 40, 110, 20, 4), hillL("o1", 120, "#6a6a6e", 3, 14, 2.5), forest("o1", 60, "poplar", "#5a6a4a", 22, 7, { blur: 1.4, h: 14 }), hillL("o1b", 34, "#7a7058", 9, 3, 0.6)]),
    cam: mv([-3, 1.5, -7, 40], [1.5, 1.6, -6, 38]), lite: GOLD, grade: ["#ff9a60", 0.18], act: (A, lt) => {
      A.fx(120, (g, c) => smokeCol(g, c, lt, 30, 0, 120, { h: 60, w: 10, col: [60, 52, 56], a: 0.7, seed: 3, wind: 0.3 }));
      const pp: [number, number, number, string | null][] = [[-6, 3, 1.05, "suitcase"], [-4.4, 3.8, 1.0, null], [-2.6, 2.6, 1.1, "baby"], [-0.6, 4.4, 0.95, "suitcase"], [1.6, 3.2, 1.0, null], [3.6, 4.0, 1.05, "suitcase"], [-8.4, 4.6, 0.9, null], [5.8, 2.8, 1.0, "suitcase"]];
      pp.forEach(([x, z, sp, pr], i) => walkS(A, civ(i, 3), 30 + i, lt, x, z, sp * 1.05, { expr: i % 3 ? "sad" : "nervous" }, {}));
      walkS(A, kid(1, 3), 50, lt, -5.2, 2.4, 1.05, { expr: "sad" }, { sc: 0.95 });
      A.fx(5, (g, c) => { const x = -1.5 + lt * 1.0, [sx, sy] = P(c, x, 0, 5); void sx; void sy; });
      A.sp("cart", -9 + lt * 1.0, 0, 5.2, { sc: 1.2 });
      A.light((g) => { sun(g, VW * 0.82, VH * 0.42, 26, "255,214,160"); rays(g, VW * 0.82, VH * 0.42, VW * 0.8, 0.12, "255,200,150", 16, lt, Math.PI * 0.9, Math.PI * 0.85); lensFlare(g, VW * 0.82, VH * 0.42, 0.5); });
    } },
  // 0c "e soldados lutam em batalhas tão gigantescas"
  { t0: 7.1, L: () => loc(["#6e8296", "#e8c48a"], { near: "#8a7454", far: "#bca478", kind: "grass", seed: 8, zFar: 400 }, [
      hillL("o2", 200, "#8a8a7a", 2, 22, 3), hillL("o2b", 80, "#9a8a5e", 6, 8, 1.2), field("o2", 30, "wheat", "#c8a858", 4, 0.9, 50, 0.5)]),
    cam: hand(mv([-6, 1.2, -6, 44], [4, 1.4, -4, 40])), lite: GOLD, bloom: 0.6, kicks: [[8.25, 8], [8.9, 10], [9.6, 8]], act: (A, lt, u, T) => {
      tank(A, "t34", -14 + lt * 3.2, 26, { vel: 3.2, dustCol: [190, 160, 110], fire: T - 8.9 });
      tank(A, "t34", -24 + lt * 3.0, 36, { vel: 3.0, dustCol: [190, 160, 110], fire: T - 10.2 });
      for (const [at, x, z, s] of [[8.25, 10, 30, 3], [8.9, 3, 45, 4], [9.6, -8, 22, 2.6], [10.6, 16, 50, 4.5]] as number[][]) { A.fx(z, (g, c) => { blast(g, c, T - at, x, 0, z, s, x * 3 + 1); scorch(g, c, x, z, s * 1.4, clamp((T - at) * 2) * 0.6); }); }
      for (let i = 0; i < 6; i++) runS(A, sol(v(WEH, { hat: "pilotka", cap: "#7a7244", jacket: "#7e744a", pants: "#6a6240" }), i), 60 + i, lt, -9 - i * 1.6 + hash(i) * 0.8, 6 + (i % 3) * 2.2, 3.6, { expr: "shout" });
      A.light((g) => { sun(g, VW * 0.12, VH * 0.3, 20, "255,226,170"); lensFlare(g, VW * 0.12, VH * 0.3, 0.6); });
    } },
  // 0d "que mudam o destino de países inteiros." — a border post pulled up and re-planted
  { t0: 9.9, fade: 0.2, L: () => loc(["#3e5e86", "#d8d0c0"], { near: "#6e7a4a", far: "#9aa070", kind: "grass", seed: 12 }, [
      mtn("o3", 260, "#5e7088", 5, 70, true, 3), forest("o3", 70, "pine", "#3e5a3e", 30, 3, { blur: 1.5, h: 16 }), wire("o3", 9, 24)]),
    cam: mv([0, 1.3, -5.5, 40], [0.6, 1.25, -4.4, 36]), lite: DAY, act: (A, lt, u, T) => {
      const k = clamp((T - 10.3) / 1.0), lift = Math.sin(k * Math.PI) * 0.8, x = lerp(-1.4, 1.6, smooth(k));
      panel(A, 3.1, (w) => { w.rect(-0.06, 0, 0.12, 2.0, "#e8e2d6", 2.5); for (let i = 0; i < 5; i++) w.rect(-0.06, 0.2 + i * 0.36, 0.12, 0.18, i % 2 ? "#c0302a" : "#f2efe6", 0); w.rect(-0.6, 1.6, 1.2, 0.45, "#f2efe6", 2.5); w.text("GRENZE", 0, 1.83, 0.22, "#2a2a2a"); }, { dx: x, dy: lift, pivot: [0, 0], rot: Math.sin(k * Math.PI) * 0.15 });
      A.a(sol(WEH, 2, false), 71, x - 0.8, 3.0, { expr: "stern", look: 1, crouch: lift * 0.4 }); A.a(sol(WEH, 3), 72, x + 0.9, 3.2, { expr: "stern", look: -1, facing: -1 });
      A.a(civ(5, 1), 73, -3.0, 4.6, { expr: "shock", look: 1, ...idle(lt, 73) }); A.a(civ(6, 1), 74, -3.8, 5.0, { expr: "sad", look: 1 });
      A.fx(3.08, (g, c) => { if (T > 11.2) { const [sx, sy, s] = P(c, 1.6, 0, 3.1); puff(g, sx, sy, 0.6 * s * (T - 11.2 + 0.3), [150, 130, 100], 0.5 * clamp(1 - (T - 11.2) / 1.2)); } });
    } },
  // 1a "Entre 1939 e 1945," — dawn, helmet on a rifle, mist
  { t0: 13.56, fade: 0.5, L: () => loc(["#2a3a5e", "#f0b890"], { near: "#4a4a3a", far: "#8a7a6a", kind: "mud", seed: 21 }, [
      clouds("o4", 300, ["#f0a888", "#3a4a6e"], 9, 50, 130, 18, 4), hillL("o4", 150, "#4e5068", 4, 18, 2.5), forest("o4", 60, "dead", "#000", 14, 4, { blur: 1, h: 10 }), wire("o4", 6, 16)]),
    cam: mv([0, 0.9, -3.2, 36], [0, 1.0, -2.4, 32]), lite: BACK, bloom: 0.8, act: (A, lt, u, T) => {
      panel(A, 1.6, (w) => { w.line([[0, 0], [0.04, 1.15]], 4, "#3a2a1c"); w.line([[0.02, 0.5], [0.03, 1.1]], 2, "#5a5e62"); w.ell(0.05, 1.18, 0.32, 0.24, "#4e5448", 2.5, 0, Math.PI); w.ell(0.05, 1.18, 0.4, 0.05, "#3e4438", 2); });
      A.fx(4, (g, c) => { for (let i = 0; i < 12; i++) { const k = (lt * 0.05 + hash(i)) % 1, [sx, sy, s] = P(c, -10 + 20 * k, 0.5 + hash(i + 3) * 0.8, 3 + hash(i + 6) * 8); puff(g, sx, sy, 1.8 * s, [240, 210, 200], 0.14); } });
      A.light((g) => { sun(g, VW * 0.5, VH * 0.56, 34, "255,220,170"); rays(g, VW * 0.5, VH * 0.56, VW * 0.9, 0.16, "255,200,150", 22, lt); lensFlare(g, VW * 0.5, VH * 0.56, 0.8); });
      A.over((g) => { bigText(g, "1939", T - 13.85, 1.9, VH * 0.3, 150); bigText(g, "1939 — 1945", T - 15.85, 2.3, VH * 0.3, 150); });
    } },
  // 1b "o mundo viveu o conflito mais devastador da história da humanidade:"
  { t0: 18.15, fade: 0.3, L: () => world("o5", ST.ember), cam: mv([0, 2.0, -24, 40], [1.0, 2.6, -19, 40]), act: (A, lt, u, T) => {
      const P0: [number, number][] = [[10, 51], [21, 52], [2, 47], [-1, 52], [30, 50], [37, 55], [44, 48], [12, 42], [20, 30], [30, 31], [105, 35], [116, 40], [140, 36], [-158, 21], [120, 14], [150, -6], [160, -9], [100, 15], [128, 37], [-2, 36]];
      P0.forEach(([lo, la], i) => pin(A, lo, la, T - 18.5 - i * 0.17, "fire", true));
      A.light((g) => tint(g, "#ff7a3a", 0.08 + 0.05 * Math.sin(lt * 3), "soft-light"));
    } },
  // 1c "a Segunda Guerra Mundial." — bombers against a huge setting sun
  { t0: 22.4, fade: 0.25, L: () => loc(["#3a1e32", "#ff9a3a"], { near: "#1e1418", far: "#3a2020", zFar: 400 }, [clouds("o6", 220, ["#ffb070", "#6a2a3a"], 12, 25, 70, 14, 5), hillL("o6", 140, "#2a1a20", 7, 10, 1.5)]),
    cam: mv([0, 8, -10, 40], [0, 9, -8, 38]), bloom: 0.9, act: (A, lt, u, T) => {
      A.light((g) => { sun(g, VW * 0.5, VH * 0.62, 150, "255,170,90"); rays(g, VW * 0.5, VH * 0.62, VW, 0.12, "255,160,90", 20, lt); });
      for (let i = 0; i < 5; i++) plane(A, "he111", -60 + i * 9 + lt * 16, 22 + (i % 2) * 3 - i * 0.6, 120 + i * 10, { sc: 1, alpha: 1 });
      A.light((g) => tint(g, "#140810", 0.0));
      A.over((g) => bigText(g, "A SEGUNDA GUERRA MUNDIAL", lt - 0.15, 2.3, VH * 0.3, 104));
    } },
  // 2a "Mais de 30 países participaram dessa guerra,"
  { t0: 24.69, fade: 0.2, L: () => loc(["#6a9ad6", "#e6eef4"], { near: "#b8aa94", far: "#d6cbb6", kind: "stone", seed: 30, zFar: 200 }, [
      clouds("o7", 250, ["#ffffff", "#b8cce0"], 5, 40, 100, 18, 3), city("o7", 70, { pal: ["#e6dccb", "#d8ccb8", "#efe6d4"], floors: [4, 6], hgt: [18, 26], seed: 7, blur: 2, win: "#6a8aa6" })]),
    cam: mv([-6, 2.4, -6, 44], [5, 2.6, -6, 44]), lite: NOON, act: (A, lt, u, T) => {
      const K = ["uk", "us", "su", "fr", "pl", "cn", "br", "ca", "au", "nl", "no", "gr", "in", "jp", "it", "ax"];
      K.forEach((k, i) => flag(A, k, -16 + i * 2.6, 4.2, 6 + (i % 2) * 1.5, 1.6, 1.05, { t: lt + i * 0.3, wind: 0.9 }));
      A.over((g) => counter(g, Math.min(30, Math.floor(clamp((T - 24.95) / 1.6) * 30)), "PAÍSES", T - 24.8, 3.0, VH * 0.78));
    } },
  // 2b "dezenas de milhões de pessoas morreram" — endless rows of helmets on rifles in snow, blue hour
  { t0: 27.9, fade: 0.35, L: () => loc(["#1e2a4e", "#8a9ac4"], { near: "#c8d0e0", far: "#e0e6f0", kind: "snow", seed: 33 }, [
      hillL("o8", 180, "#5a6a8e", 6, 12, 2.5), forest("o8", 70, "pine", "#2e4058", 40, 8, { blur: 1.4, h: 14, snow: true })]),
    cam: mv([0, 1.6, -4, 40], [0, 1.9, -1, 40]), lite: MOON, wx: ["snow", 160, 0.6], act: (A, lt) => {
      for (let r = 0; r < 9; r++) for (let c = -6; c <= 6; c++) { const x = c * 1.8 + (r % 2) * 0.9, z = 3 + r * 2.4; A.sp(r % 3 === 1 ? "helmetUS" : "helmetG", x, 0.95, z, { sc: 1 }); panel(A, z + 0.01, (w) => w.line([[0, 0], [0, 1.0]], 3.5, "#3a2a1c"), { dx: x }); }
      A.fx(9, (g, c) => birds(g, c, lt, 5, -8, 7, 20, 1.6, "#141218", 7, 0.5));
    } },
  // 2c "e novas armas foram utilizadas" — V-2 lift-off (acceleration, exhaust, ground cloud)
  { t0: 29.95, L: () => loc(["#5e86b8", "#dfe6e4"], { near: "#5a6450", far: "#7a8466", kind: "grass", seed: 36 }, [forest("o9", 90, "pine", "#2e4a36", 36, 4, { blur: 2, h: 18 }), forest("o9b", 34, "pine", "#3a5a40", 16, 9, { blur: 0.6, h: 16 })]),
    cam: (u, lt) => { const yy = lt < 0.85 ? 0 : 0.5 * 4.2 * (lt - 0.85) ** 2; return C(0, 8 + yy * 0.85, -40, 44, 0); }, lite: DAY, kicks: [[30.8, 10], [31.2, 6]], bloom: 0.7, act: (A, lt, u, T) => {
      const lift = T < 30.8 ? 0 : 0.5 * 4.2 * (T - 30.8) ** 2; A.sp("v2", 0, lift, 4); if (T > 30.5) A.fx(3.99, (g, c) => { const [sx, sy, s] = P(c, 0, lift + 0.2, 4); exhaust(g, sx, sy, s, Math.PI / 2, 4 + (T - 30.5) * 2, lt); });
      A.fx(3.5, (g, c) => { if (T > 30.6) for (let i = 0; i < 18; i++) { const a = T - 30.6, k = (i / 18) * Math.PI * 2, d = easeOut(a / 2) * (4 + hash(i) * 5); const [sx, sy, s] = P(c, Math.cos(k) * d, 0.8 + Math.abs(Math.sin(k)) * 0.6, 4 + Math.sin(k) * 2); puff(g, sx, sy, (1.2 + a * 0.8) * s, [226, 222, 214], 0.75); } });
      A.a(sol(v(WEH, { hat: "peaked", cap: "#5c6458", rifle: false }), 1), 81, -9, -12, { expr: "stern", look: 1, ...idle(lt, 81) }); A.a(v(civ(1, 9), { jacket: "#e8e4da", pants: "#5a5a5a" }), 82, -10.4, -11.6, { expr: "shock", look: 1 });
      A.light((g) => { if (T > 30.6) { const [sx, sy] = P(A.cam, 0, lift, 4); glow(g, sx, sy, 600, "rgba(255,220,170,1)", 0.35); } });
    } },
  // 2d "em uma escala nunca vista antes." — a sky full of bombers, seen from below
  { t0: 32.35, fade: 0.2, L: () => loc(["#3a6ab0", "#c8dcee"], { near: "#3a6ab0", far: "#3a6ab0", zFar: 1 }, [clouds("o10", 400, ["#ffffff", "#9ab8d8"], 15, -40, 60, 30, 3)], true),
    cam: (u, lt) => C(0, 0, -10, 58, 560 + lt * 8), lite: DAY, act: (A, lt) => {
      for (let i = 0; i < 26; i++) { const r = Math.floor(i / 5), c2 = i % 5, z = 140 + r * 55 + hash(i) * 15, x = (c2 - 2) * 46 + (r % 2) * 22 + hash(i * 3) * 8, y = z * (0.16 + 0.07 * hash(i * 5)) + lt * 3;
        A.fx(z + 1, (g, c) => { for (const ex of [-4.4, -8.6, 4.4, 8.6]) { const [sx, sy, s] = P(c, x + ex, y - 6, z + 0.5); const gr = g.createLinearGradient(0, sy, 0, sy - 60 * s); gr.addColorStop(0, "rgba(255,255,255,0.7)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(sx - 0.3 * s, sy - 60 * s, 0.6 * s, 60 * s); } });
        planeTop(A, "b17", x, y, z, { head: Math.PI, below: true, t: lt + i }); }
      A.light((g) => { sun(g, VW * 0.85, VH * 0.12, 30); lensFlare(g, VW * 0.85, VH * 0.12, 0.7); });
    } },
  // 3 "Mas como tudo isso começou?" — a golden pocket watch whose hands race backwards over a blurred 1910s street
  { t0: 35.22, fade: 0.3, L: () => loc(["#3a2a2a", "#8a6a4a"], { near: "#4a3a2e", far: "#6a5440", kind: "cobble", seed: 40 }, [city("o11", 30, { pal: ["#8a6a50", "#7a6050", "#9a7a5a"], seed: 22, lit: 0.5, win: "#3a2a22", blur: 6, roof: "gable", roofCol: "#5a3a2a" })]),
    cam: mv([0, 2, -6, 40], [0, 2, -5, 38]), grade: ["#c08850", 0.35], act: (A, lt) => {
      for (let i = 0; i < 4; i++) A.fx(14, (g, c) => { const [sx, sy, s] = P(c, -12 + i * 8, 4, 14); glow(g, sx, sy, 1.6 * s, "rgba(255,200,120,1)", 0.8); });
      A.over((g) => { const cx = VW / 2, cy = VH / 2 + 10, r = 300, sp = -easeIn(clamp(lt / 1.4)) * 40;
        g.save(); g.shadowColor = "rgba(0,0,0,0.6)"; g.shadowBlur = 40; const gr = g.createRadialGradient(cx - r * 0.3, cy - r * 0.3, r * 0.1, cx, cy, r * 1.1); gr.addColorStop(0, "#fff0b0"); gr.addColorStop(0.5, "#d9a840"); gr.addColorStop(1, "#7a5418");
        g.fillStyle = gr; g.beginPath(); g.arc(cx, cy, r, 0, 7); g.fill(); g.restore(); g.fillStyle = "#c9a24a"; g.fillRect(cx - 30, cy - r - 60, 60, 70); g.strokeStyle = "#7a5418"; g.lineWidth = 14; g.beginPath(); g.arc(cx, cy - r - 80, 36, 0, 7); g.stroke();
        const fg = g.createRadialGradient(cx, cy, 0, cx, cy, r * 0.85); fg.addColorStop(0, "#fbf6ea"); fg.addColorStop(1, "#e4dac4"); g.fillStyle = fg; g.beginPath(); g.arc(cx, cy, r * 0.86, 0, 7); g.fill(); g.strokeStyle = "#2a1d16"; g.lineWidth = 4; g.stroke();
        g.fillStyle = "#2a1d16"; g.font = `bold 46px "DejaVu Serif", serif`; g.textAlign = "center"; g.textBaseline = "middle"; ["XII", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI"].forEach((n, i) => { const a = (i / 12) * Math.PI * 2; g.fillText(n, cx + Math.sin(a) * r * 0.68, cy - Math.cos(a) * r * 0.68); });
        const hA = sp * 0.08 + 1.2, mA = sp; g.lineCap = "round"; g.lineWidth = 14; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.sin(hA) * r * 0.42, cy - Math.cos(hA) * r * 0.42); g.stroke(); g.lineWidth = 8; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.sin(mA) * r * 0.7, cy - Math.cos(mA) * r * 0.7); g.stroke();
        g.fillStyle = "#b3221c"; g.beginPath(); g.arc(cx, cy, 14, 0, 7); g.fill(); const gl = g.createLinearGradient(cx - r, cy - r, cx + r, cy + r); gl.addColorStop(0.3, "rgba(255,255,255,0)"); gl.addColorStop(0.45, "rgba(255,255,255,0.35)"); gl.addColorStop(0.55, "rgba(255,255,255,0)"); g.fillStyle = gl; g.beginPath(); g.arc(cx, cy, r * 0.86, 0, 7); g.fill();
        glint(g, cx - r * 0.55, cy - r * 0.6, 40, 0.7 + 0.3 * Math.sin(lt * 4)); });
    } },
  // 4a "Como Hitler conseguiu conquistar" — red-lit map room
  { t0: 37.28, fade: 0.2, L: () => loc(undefined, { near: "#2a1a18", far: "#3a2420", kind: "wood", zFar: 10 }, [wall("o12", 4, "#4a2a24", { h: 6, map: true, panel: "#2a1812", lamps: 2 })], true),
    cam: mv([0.2, 1.65, -3.6, 40], [0.0, 1.6, -2.8, 36]), lite: { ...NIGHTFIRE, rim: "#ff4a3a", key: "#d08080" }, act: (A, lt) => {
      A.a(HIT_GREY, 91, 0.9, 2.0, { expr: "stern", look: -1, facing: -1, ...idle(lt, 91) }); A.sp("deskG", 0.2, 0, 1.4, { sc: 1.1 });
      A.light((g) => { glow(g, VW * 0.3, VH * 0.1, 600, "rgba(255,60,40,1)", 0.25); glow(g, VW * 0.72, VH * 0.12, 300, "rgba(255,200,140,1)", 0.25); });
    } },
  // 4b "...tantos territórios?" — Europe floods dark red, country after country
  { t0: 38.85, L: () => europe("o13", ST.night), cam: mv([2, 1, -20, 40], [3, 1.4, -17, 40]), act: (A, lt, u, T) => {
      ["AUT", "CZE", "POL", "DEN", "NOR", "NLD", "BEL", "FR"].forEach((k, i) => hl(A, k, (T - 39.0 - i * 0.16) / 0.3, "#c0281e", 0.7)); hl(A, "GER", 1, "#8a1a14", 0.75);
    } },
  // 5a "E como uma guerra que parecia impossível de vencer" — rain, a foxhole at night
  { t0: 40.73, fade: 0.25, L: () => loc(["#0e1420", "#2e3a4a"], { near: "#2a2620", far: "#3a3a34", kind: "mud", seed: 50 }, [hillL("o14", 90, "#1e2430", 4, 10, 2), forest("o14", 40, "dead", "#000", 10, 6, { blur: 1.4, h: 9 })]),
    cam: hand(mv([0, 1.2, -3.2, 38], [0.2, 1.1, -2.6, 36]), 0.02), lite: MOON, wx: ["rain", 260, 0.45], kicks: [[42.0, 4]], act: (A, lt, u, T) => {
      A.a(sol(MARINE_ALT(), 1), 101, -0.5, 1.4, { expr: "sad", look: 0.4, headTilt: 6, crouch: 0.6 }, { y: -0.6 }); A.a(sol(MARINE_ALT(), 2), 102, 0.8, 1.6, { expr: "nervous", look: -1, facing: -1, crouch: 0.5 }, { y: -0.65 });
      panel(A, 1.0, (w) => { w.poly([[-4, -1], [4, -1], [4, 0.3], [2, 0.5], [0, 0.35], [-2, 0.55], [-4, 0.3]], "#2e2a22", 3); });
      A.light((g) => { const f = T > 41.9 && T < 42.15 ? 1 - (T - 41.9) / 0.25 : 0; glow(g, VW * 0.8, VH * 0.35, 700, "rgba(255,200,140,1)", 0.5 * f); });
    } },
  // 5b "terminou com duas bombas atômicas?" — hangar, two bombs lit one after the other
  { t0: 43.85, fade: 0.2, L: () => loc(undefined, { near: "#3a3a3c", far: "#4a4a4c", kind: "stone", seed: 52, zFar: 30 }, [wall("o15", 16, "#2a2c30", { h: 14, wid: 20, pipes: true }), wall("o15b", 30, "#1e2024", { h: 20, wid: 30 })], true),
    cam: mv([0, 1.6, -9, 42], [0, 1.5, -7.6, 38]), lite: { ...MOON, rim: "#e8f0ff", key: "#a0a8b8" }, bloom: 0.8, act: (A, lt, u, T) => {
      const l1 = T > 44.6 ? 1 : 0, l2 = T > 44.95 ? 1 : 0;
      A.sp("littleboy", -2.0, 0.25, 3, { sc: 0.75 }); A.sp("fatman", 2.2, 0.2, 3.2, { sc: 0.7 }); for (const x of [-2.0, 2.2]) panel(A, 3.05, (w) => { w.rect(x - 1.3, 0, 2.6, 0.25, "#3a3c40", 2.5); for (const dx of [-1, 1]) w.ell(x + dx, 0.1, 0.12, 0.12, "#1e1e1e", 2); });
      A.light((g) => { for (const [on, x] of [[l1, -2.0], [l2, 2.2]] as number[][]) if (on) { const [sx, sy, s] = P(A.cam, x, 0.7, 3); beam(g, A.cam, x, 9, 3, Math.PI / 2, 9, 1.6, 0.3, "220,230,255"); glow(g, sx, sy, 2.4 * s, "rgba(200,215,255,1)", 0.4); glint(g, sx + 0.5 * s, sy - 0.2 * s, 26, 0.8); } });
      A.light((g) => tint(g, "#05070c", 0.55 * (1 - l1 * 0.4 - l2 * 0.4), "multiply"));
      A.a(sol(GI, 4), 111, -4.2, 4.2, { expr: "stern", ...idle(lt, 111) }); A.a(sol(GI, 5), 112, 4.6, 4.4, { expr: "stern", facing: -1 });
    } },
  // 6 "Prepare-se, porque agora você vai conhecer toda a história..." — above the clouds, a fighter squadron sweeps past
  { t0: 46.68, fade: 0.4, L: () => loc(["#1e3a78", "#e8a878"], { near: "#c89a90", far: "#d8a890", zFar: 2 }, [clouds("o16", 300, ["#f0d0b8", "#7a6a8e"], 21, -30, 20, 30, 4), clouds("o16b", 90, ["#f8e0c8", "#a87a8a"], 8, -14, 2, 18, 1.5)], true),
    cam: (u, lt) => C(lt * 1.5, 0, -10, 44, 40), lite: GOLD, bloom: 0.85, act: (A, lt, u, T) => {
      for (let i = 0; i < 4; i++) { const x = -26 + (lt - i * 0.45) * 13, y = -1 + i * 1.4 - Math.sin(lt * 0.8 + i) * 0.3; plane(A, "spit", x, y, 9 + i * 4, { ang: -0.04 + 0.03 * Math.sin(lt + i) }); }
      A.light((g) => { sun(g, VW * 0.82, VH * 0.3, 34, "255,226,180"); rays(g, VW * 0.82, VH * 0.3, VW, 0.08, "255,220,170", 18, lt); lensFlare(g, VW * 0.82, VH * 0.3, 0.6); });
      A.over((g) => bigText(g, "SEGUNDA GUERRA MUNDIAL", T - 50.0, 2.0, VH * 0.5, 108, "#f6efe0", "a história completa"));
    } },

  // ================= CAPÍTULO 1 — AS ORIGENS =================
  // 7 "Para entender..., precisamos voltar ao final da Primeira Guerra Mundial, em 1918." — a soldier walks home, autumn, teal fog
  { t0: 52.93, fade: 0.5, L: () => loc(["#4a6a72", "#c8c0a0"], { near: "#5e5a3e", far: "#8a8a6a", kind: "mud", seed: 60, zFar: 220 }, [
      hillL("o17", 140, "#5a7478", 9, 16, 3), forest("o17", 50, "oak", "#b8662a", 18, 5, { blur: 1.6, h: 12 }), forest("o17b", 22, "dead", "#000", 6, 3, { blur: 0.5, h: 8 })]),
    cam: (u, lt) => C(-6 + lt * 1.05, 1.5, -5, 40), lite: { ...GREY, sa: 0.22 }, grade: ["#e09050", 0.2], act: (A, lt, u, T) => {
      walkS(A, v(W1918, { rifle: true }), 121, lt, -6.3, 2.2, 1.05, { expr: "sad" });
      A.fx(2, (g, c) => flutter(g, c, lt, { n: 40, x0: -14, x1: 14, z0: 0.5, z1: 10, top: 7, cols: ["#c8642a", "#e09a3a", "#a84a22", "#d8b44a"], size: 0.12, fall: 0.8, wind: 0.6, loop: true, seed: 4 }));
      A.over((g) => { chapter(g, "CAPÍTULO 1", "AS ORIGENS", lt - 0.1, 3.4); caption(g, "NOVEMBRO DE 1918", T - 57.8, 2.0); });
    } },
  // 8a "A Alemanha havia sido derrotada" — defeated column marches home in the rain
  { t0: 60.38, fade: 0.3, L: () => loc(["#3a4048", "#8a8e8c"], { near: "#4a463a", far: "#6a6a5e", kind: "cobble", seed: 62 }, [
      city("o18", 46, { pal: ["#8a7e70", "#7a6e62", "#968a7a"], seed: 31, roof: "gable", roofCol: "#5a4a44", blur: 1.5, floors: [2, 3], hgt: [8, 12] })]),
    cam: mv([2, 1.5, -6, 40], [0, 1.5, -5.2, 38]), lite: GREY, wx: ["rain", 220, 0.4], act: (A, lt) => {
      marchCol(A, (i) => sol(W1918, i, i % 2 === 0), lt, 7, 6, 4, -1.0, 1.4, 2, 1.2, {}, { expr: "sad" }, 130);
      flag(A, "ax", -2, 3.2, 3.0, 1.4, 0.9, { t: lt, wind: 0.15, droop: 0.4, pole: true });
      A.a(civ(3, 8), 141, -4.6, 1.6, { expr: "sad", look: 1, ...idle(lt, 141) });
    } },
  // 8b "e obrigada a assinar o Tratado" — gilded hall, the German delegate bends over the table and signs
  { t0: 62.45, fade: 0.2, L: () => loc(undefined, { near: "#6a4a2a", far: "#8a6a3a", kind: "wood", zFar: 16 }, [wall("o19", 6, "#d6b872", { h: 9, wid: 16, win: 4, arch: true, winCol: "#f8e8c0", frames: 0, panel: "#a8803a", curtain: "#8a2a24" })], true),
    cam: mv([0, 2.0, -6.2, 40, -120], [0, 1.95, -5.2, 36, -130]), lite: LAMP, bloom: 0.85, act: (A, lt, u, T) => {
      const sign = T > 63.3; A.sp("deskG", 0, 0, 1.6, { sc: 1.0 });
      A.a(GERDEL, 151, 0, 2.0, { mode: "sit", expr: sign ? "sad" : "nervous", prop: sign ? ["pen", lt] : undefined, headTilt: sign ? 10 : 0 }, { y: 0.18 });
      A.a(CLEM, 152, -2.0, 2.8, { expr: "stern", look: 1, ...idle(lt, 152) }); A.a(WILSON, 153, 1.9, 2.9, { expr: "neutral", look: -1, facing: -1 }); A.a(LLOYD, 154, 3.2, 3.3, { expr: "stern", look: -1, facing: -1 });
      A.light((g) => { for (let i = 0; i < 5; i++) { const x = VW * (0.1 + i * 0.2), y = VH * 0.08; glow(g, x, y, 120, "rgba(255,220,150,1)", 0.5); glint(g, x, y + 20, 18, 0.5 + 0.4 * Math.sin(lt * 3 + i)); } });
    } },
  // 8c "...de Versalhes, em 1919." — close-up: the pen writes the signature
  { t0: 64.4, L: () => loc(undefined, { near: "#2a1a12", far: "#2a1a12", zFar: 1 }, [], true), cam: mv([0.1, 0.15, -1.7, 40], [0.3, -0.4, -0.5, 38]), act: (A, lt, u, T) => {
      signing(A, clamp((T - 64.5) / 1.6), { z: 3, seed: 19, title: "TRATADO DE PAZ", sub: "Versalhes, 28 de junho de 1919", sleeve: "#1e1e22", prior: 1, desk: "#3a5a3a" });
      A.light((g) => { glow(g, VW * 0.2, VH * 0.1, 900, "rgba(255,210,150,1)", 0.25); });
      A.over((g) => caption(g, "VERSALHES · 1919", T - 65.0, 2.2));
    } },
  // 9a "O acordo impôs enormes punições ao país, incluindo perdas territoriais," — parchment map: Germany shrinks
  { t0: 67.37, fade: 0.25, L: () => europe("o20", ST.sepia), cam: mv([-1, 2.8, -12, 40], [-0.4, 2.9, -10, 38]), act: (A, lt, u, T) => {
      hl(A, "GER", 1, "#5a4a3a", 0.5);
      for (const [lo, la, at] of [[7.4, 48.4, 70.7], [17.6, 53.2, 71.0], [6.9, 49.3, 71.3], [8.4, 54.9, 71.5]] as number[][]) { pin(A, lo, la, T - at, "x", false, "#9a1a14"); A.fx(-0.06, (g, c) => { const k = clamp((T - at) / 0.4); if (k <= 0) return; const [sx, sy, s] = P(c, MX(lo), MY(la), 0); g.save(); g.globalAlpha = 0.5 * k; g.fillStyle = "#c0302a"; g.beginPath(); g.arc(sx, sy, 0.9 * s * k, 0, 7); g.fill(); g.restore(); }); }
      A.over((g) => { if (T > 68.9) { const k = easeOut(clamp((T - 68.9) / 0.25)); g.save(); g.translate(VW * 0.74, VH * 0.24); g.rotate(-0.12); g.scale(2 - k, 2 - k); g.globalAlpha = 0.85 * k; g.strokeStyle = "#b3221c"; g.lineWidth = 9; g.strokeRect(-230, -60, 460, 120); g.fillStyle = "#b3221c"; g.font = `bold 72px "DejaVu Sans", sans-serif`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("PUNIÇÕES", 0, 4); g.restore(); } });
    } },
  // 9b "limitações militares" — a scrapyard: cannon barrels cut with torches, sparks fly
  { t0: 71.85, fade: 0.15, L: () => loc(["#7a8696", "#c4c2b6"], { near: "#5a5248", far: "#7a7266", kind: "rubble", seed: 64 }, [wall("o21", 22, "#6e665e", { h: 9, wid: 30, win: 6, winCol: "#b8c4cc", brick: true })]),
    cam: mv([-1, 1.4, -4.6, 40], [0.4, 1.3, -3.8, 36]), lite: GREY, act: (A, lt) => {
      A.sp("howitzer", -3.6, 0, 4.8, { sc: 1.1 }); A.sp("howitzer", 3.4, 0, 6.2, { flip: true }); A.sp("flak88", 0.6, 0, 8, { sc: 0.9 });
      A.a(v(civ(4, 11), { hat: "cap", cap: "#3a3a3a", jacket: "#4a4038" }), 161, -1.2, 2.4, { expr: "stern", crouch: 0.5, prop: ["brush", 0.6], look: -1 }); A.fx(2.39, (g, c) => sparks(g, c, lt, -1.9, 0.75, 2.4, -1, 50, 3));
      A.a(sol(FRENCH, 1), 162, 2.2, 2.8, { expr: "stern", look: -1, facing: -1, ...idle(lt, 162) }); A.a(v(civ(8, 11), { hat: "cap" }), 163, 0.6, 3.6, { expr: "sad", look: -1 });
      A.fx(4, (g, c) => { for (let i = 0; i < 8; i++) { const [sx, sy, s] = P(c, -6 + i * 1.6, 0.15 + (i % 3) * 0.12, 4 + (i % 2)); g.save(); g.translate(sx, sy); g.rotate(-0.1 + hash(i) * 0.2); g.fillStyle = "#3a3634"; g.fillRect(-1.2 * s, -0.08 * s, 2.4 * s, 0.16 * s); g.strokeStyle = "#141414"; g.strokeRect(-1.2 * s, -0.08 * s, 2.4 * s, 0.16 * s); g.restore(); } });
    } },
  // 9c "e pesadas indenizações financeiras." — gold pours from sacks onto the table, banknotes flutter
  { t0: 73.95, fade: 0.15, L: () => loc(undefined, { near: "#3a2c1e", far: "#4a3a28", kind: "wood", zFar: 12 }, [wall("o22", 4.5, "#5a4e3a", { h: 6, panel: "#3a2a1a", lamps: 1, pipes: false })], true),
    cam: mv([0, 1.3, -2.6, 38], [0, 1.2, -2.1, 34]), lite: LAMP, bloom: 0.8, act: (A, lt, u, T) => {
      A.sp("desk", 0, 0, 1.6, { sc: 1.3 }); A.fx(1.55, (g, c) => coins(g, c, T - 74.0, -0.3, 1.5, 1.6, 60, 22, 7)); A.sp("coins", 0.6, 0.98, 1.58, { sc: 1.2 });
      A.a(v(civ(2, 13), { hat: "homburg", jacket: "#2a2a30", glasses: true }), 171, -1.6, 2.4, { expr: "sad", look: 1, ...idle(lt, 171) }); A.a(v(civ(9, 13), { hat: "hair", jacket: "#3a3a44" }), 172, 1.7, 2.5, { expr: "stern", look: -1, facing: -1 });
      A.fx(1.0, (g, c) => flutter(g, c, lt, { n: 26, x0: -3, x1: 3, z0: 0.6, z1: 3, top: 3, cols: ["#9ab08a", "#b8c49a", "#c8b48a"], size: 0.16, fall: 0.7, wind: 0.1, loop: true, seed: 9 }));
      A.light((g) => glow(g, VW * 0.5, VH * 0.08, 500, "rgba(255,210,140,1)", 0.4));
    } },
  // 10a "A população alemã enfrentava dificuldades econômicas," — a wheelbarrow full of worthless banknotes
  { t0: 76.74, fade: 0.25, L: () => loc(["#7a8494", "#d8d0c0"], { near: "#7a6e60", far: "#9a8e7c", kind: "cobble", seed: 66 }, [
      city("o23", 18, { pal: ["#a8927a", "#b8a28a", "#9a8470"], seed: 41, roof: "gable", roofCol: "#6a4a3a", floors: [3, 4], hgt: [11, 14], shutter: "#4a5a4a", poster: true })]),
    cam: (u, lt) => C(-3 + lt * 0.9, 1.4, -4.8, 40), lite: GREY, act: (A, lt) => {
      walkS(A, v(civ(1, 15), { hat: "headscarf", cap: "#5a3a3a" }), 181, lt, -3.5, 2.0, 0.9, { expr: "sad" });
      A.sp("wheelbarrow", -2.6 + lt * 0.9, 0, 1.98, { sc: 1.4 });
      A.fx(1.5, (g, c) => flutter(g, c, lt, { n: 22, x0: -6, x1: 8, z0: 0.6, z1: 4, top: 2.5, cols: ["#9ab08a", "#c8b48a", "#d8d0b0"], size: 0.15, fall: 0.35, wind: 1.2, loop: true, seed: 14 }));
      crowd(A, 4, 2.5, 6, 3.4, 5.4, 15, (i) => ({ expr: "sad", look: -1, ...idle(lt, i) }));
      A.over((g) => { if (lt > 0.6) { const k = clamp((lt - 0.6) / 0.4); g.save(); g.globalAlpha = k; g.font = `bold 40px "DejaVu Sans", sans-serif`; g.fillStyle = "#f6efe0"; g.textAlign = "right"; g.shadowColor = "#000"; g.shadowBlur = 8; g.fillText("1 PÃO = 200.000.000.000 MARCOS (1923)", VW - 80, 90); g.restore(); } });
    } },
  // 10b "desemprego" — a long queue outside a closed factory gate, breath in the cold
  { t0: 80.05, fade: 0.2, L: () => loc(["#6a7280", "#b8bcc0"], { near: "#5a5650", far: "#7a7670", kind: "stone", seed: 68 }, [
      wall("o24", 12, "#7a6a5a", { h: 7, wid: 30, brick: true, win: 7, winCol: "#4a5258" }), skyline("o24", 80, "#5a5a62", "generic", 4, 2)]),
    cam: mv([3, 1.5, -4.8, 42], [1.5, 1.5, -4.2, 40]), lite: COLD, act: (A, lt) => {
      for (let i = 0; i < 9; i++) { const x = -6 + i * 1.25, z = 3.2 + (i % 2) * 0.5; A.a(civ(i, 17), 191 + i, x, z, { expr: i % 2 ? "sad" : "neutral", look: 1, ...idle(lt, 191 + i) }); A.fx(z - 0.01, (g, c) => breath(g, c, lt, x + 0.15, 1.95, z, 1, i)); }
      A.sp("posterW", 6.2, 1.4, 11.9, { sc: 1.3 });
    } },
  // 10c "e um profundo sentimento de humilhação." — a veteran alone on a bench, rain, lamplight
  { t0: 81.8, fade: 0.35, L: () => loc(["#0e1018", "#2a2e3a"], { near: "#2a2a2e", far: "#3a3a40", kind: "cobble", seed: 70 }, [city("o25", 26, { pal: ["#3a3640", "#34303a", "#403a44"], seed: 51, lit: 0.25, blur: 2, floors: [3, 4] })]),
    cam: mv([0, 1.2, -3.4, 38], [0, 1.15, -2.9, 34]), lite: LAMP, wx: ["rain", 200, 0.4], act: (A, lt) => {
      A.sp("bench", 0, 0, 1.6, { sc: 1.1 }); A.sp("lamp", 1.7, 0, 1.8, { sc: 1.4 });
      A.a(v(W1918, { hat: "cap", cap: "#4a4e44", rifle: false, medals: true }), 201, 0, 1.62, { mode: "sit", expr: "sad", headTilt: 14, look: 0 }, { y: 0.2 });
      A.light((g) => { const [sx, sy, s] = P(A.cam, 1.7, 2.2, 1.8); glow(g, sx, sy, 2.6 * s, "rgba(255,200,120,1)", 0.7); beam(g, A.cam, 1.7, 2.2, 1.8, Math.PI / 2 + 0.3, 2.2, 0.9, 0.18, "255,210,150"); });
    } },
  // 11 "Foi nesse cenário que surgiu Adolf Hitler, líder do Partido Nazista." — smoky beer hall
  { t0: 84.1, fade: 0.25, L: () => loc(undefined, { near: "#4a3020", far: "#5a3a26", kind: "wood", zFar: 14 }, [wall("o26", 7, "#7a5a3a", { h: 6, wid: 16, panel: "#4a2a18", lamps: 4, arch: true })], true),
    cam: mv([0.5, 2.3, -5.4, 40, -60], [0.2, 2.4, -4.4, 36, -70]), lite: LAMP, bloom: 0.7, act: (A, lt, u, T) => {
      const on = T > 85.65; A.a(HIT_CIV, 211, 0.2, 3.4, { expr: on ? "shout" : "stern", prop: on ? ["fist", 1] : undefined, look: 0 }, { y: 1.0 }); A.sp("desk", 0.2, 0.28, 3.35, { sc: 1.0 });
      crowd(A, 9, -5, 5, 0.8, 2.2, 21, (i) => ({ expr: on ? "shout" : "neutral", look: 0, prop: i % 3 === 0 ? ["fist", on ? 1 : 0.3] : undefined }), (i) => civ(i, 21), { dark: 0.55, darkCol: "#1a1010" });
      A.fx(2.8, (g, c) => { for (let i = 0; i < 10; i++) { const k = (lt * 0.06 + hash(i)) % 1, [sx, sy, s] = P(c, -8 + 16 * hash(i + 2), 3 + k * 3, 4 + hash(i) * 3); puff(g, sx, sy, 2.4 * s, [200, 170, 130], 0.12); } });
      if (T > 86.55) panel(A, 6.8, (w) => { const k = easeOut(clamp((T - 86.55) / 0.5)); for (const x of [-4.5, 4.5]) { w.rect(x - 1, 5.8 - 4 * k, 2, 4 * k, "#b3221c", 2.5); if (k > 0.8) { w.ell(x, 4.2, 0.62, 0.62, "#f4efe6", 2); w.poly([[x - 0.45, 4.3], [x, 4.6], [x + 0.45, 4.3], [x, 3.8]], "#1a1414", 0); } } });
      A.over((g) => caption(g, "ADOLF HITLER · PARTIDO NAZISTA", T - 86.2, 2.4));
    } },
  // 12a "Prometendo recuperar o orgulho alemão," — podium with 1930s microphones, sea of silhouettes
  { t0: 89.44, fade: 0.2, L: () => loc(["#3a3a5a", "#c89a7a"], { near: "#5a4a40", far: "#7a6a5a", kind: "stone", seed: 72 }, [wall("o27", 14, "#c8b8a0", { h: 12, wid: 24, win: 0 }), banners("o27", 13.8, 6, 18, 11.5, 7)]),
    cam: mv([0, 2.2, -5.8, 40, -40], [0, 2.4, -4.8, 36, -60]), lite: { ...BACK, rim: "#ffe0b0" }, act: (A, lt, u, T) => {
      A.a(HIT_BROWN, 221, 0, 6, { expr: T > 90.9 ? "shout" : "stern", prop: ["fist", 0.6 + 0.4 * Math.sin(lt * 5)], look: 0 }, { y: 1.4 });
      A.sp("mic", -0.5, 1.4, 5.9); A.sp("mic", 0.5, 1.4, 5.9); panel(A, 5.95, (w) => { w.rect(-1.2, -0.1, 2.4, 1.5, w.vgrad(-0.1, 1.4, "#3a2a1e", "#6a4a32"), 3); w.line([[-1.1, 1.2], [1.1, 1.2]], 3, "#c9a24a"); });
      crowd(A, 30, -9, 9, 0.6, 4.8, 23, (i) => ({ expr: "shout", prop: i % 4 === 0 ? ["fist", 1] : undefined }), (i) => civ(i, 23), { dark: 0.85, darkCol: "#140c10" });
    } },
  // 12b "reconstruir o exército" — tank factory: welding sparks, a turret swings down on the crane
  { t0: 92.2, fade: 0.15, L: () => loc(undefined, { near: "#4a4a48", far: "#5a5a56", kind: "stone", seed: 74, zFar: 40 }, [wall("o28", 24, "#3e4244", { h: 16, wid: 30, win: 8, winCol: "#a8c0cc", pipes: true }), skyline("o28", 60, "#2a2e30", "generic", 9, 3)], true),
    cam: mv([-2, 2, -7, 42], [1, 2.2, -6, 40]), lite: { ...DAY, rim: "#b8d8ff", key: "#c8d0d8", ka: 0.15 }, act: (A, lt, u, T) => {
      tank(A, "panzer", -1.5, 5, { vel: 0 }); tank(A, "panzer", 5.5, 9, { vel: 0, dir: -1 });
      const drop = clamp((T - 92.6) / 1.2), sw = 0.12 * Math.exp(-lt * 0.8) * Math.sin(lt * 3.2), ty = lerp(7, 2.0, smooth(drop));
      A.fx(4.95, (g, c) => { const [hx, hy, s] = P(c, -1.9, 12, 5), px = hx + Math.sin(sw) * (12 - ty) * s, py = P(c, -1.9, ty, 5)[1]; g.strokeStyle = "#1e1e1e"; g.lineWidth = Math.max(2, 0.03 * s); g.beginPath(); g.moveTo(hx, hy); g.lineTo(px, py - 0.9 * s); g.stroke();
        g.save(); g.translate(px, py); g.rotate(sw); g.fillStyle = "#5e6462"; g.strokeStyle = "#241726"; g.lineWidth = 3; g.beginPath(); g.moveTo(-1.3 * s, 0); g.lineTo(1.0 * s, 0); g.lineTo(0.8 * s, -0.8 * s); g.lineTo(-1.1 * s, -0.85 * s); g.closePath(); g.fill(); g.stroke(); g.fillRect(1.0 * s, -0.48 * s, 2.0 * s, 0.16 * s); g.restore(); });
      A.a(v(civ(2, 25), { hat: "cap", cap: "#2a2a2a", jacket: "#3a4a5a", pants: "#3a4a5a" }), 231, 3.0, 3.4, { expr: "stern", crouch: 0.4, prop: ["brush", 0.6], look: -1, facing: -1 }); A.fx(3.39, (g, c) => sparks(g, c, lt, 2.4, 0.9, 3.4, -1, 40, 5));
      A.a(v(civ(7, 25), { hat: "cap", cap: "#2a2a2a", jacket: "#3a4a5a", pants: "#3a4a5a" }), 232, -4.6, 3.6, { expr: "neutral", look: 1, ...idle(lt, 232) });
      A.light((g) => { for (let i = 0; i < 4; i++) beam(g, A.cam, -12 + i * 8, 15, 22, Math.PI / 2 + 0.35, 18, 3.2, 0.1, "220,235,255"); });
    } },
  // 12c "e transformar novamente o país em uma grande potência," — the zeppelin over the city at sunset
  { t0: 93.85, fade: 0.25, L: () => loc(["#4a3a6a", "#ffb06a"], { near: "#5a4a40", far: "#8a6a50", kind: "cobble", seed: 76 }, [clouds("o29", 300, ["#ffc890", "#7a4a6a"], 3, 40, 120, 16, 4), skyline("o29", 160, "#4a3a44", "berlin", 6, 2, "#ffd890"), city("o29", 40, { pal: ["#c8a888", "#b89878", "#d8b898"], seed: 61, roof: "hip", roofCol: "#7a4a3a", lit: 0.3, blur: 1, floors: [4, 5], hgt: [14, 18] })]),
    cam: mv([0, 2, -8, 44, -80], [3, 2.4, -8, 44, -40]), lite: GOLD, bloom: 0.85, act: (A, lt) => {
      A.sp("zeppelin", -40 + lt * 9, 34, 230, { sc: 1 }); crowd(A, 14, -6, 6, 3, 6, 25, (i) => ({ expr: i % 2 ? "grin" : "smile", look: 0, headTilt: -8 }), (i) => civ(i, 27), { dark: 0.5, darkCol: "#2a1a24" });
      A.light((g) => { sun(g, VW * 0.12, VH * 0.5, 50, "255,200,140"); rays(g, VW * 0.12, VH * 0.5, VW, 0.12, "255,190,130", 16, A.t); });
    } },
  // 12d "Hitler conquistou cada vez mais apoio." — night rally: a cathedral of searchlights, torches
  { t0: 97.2, fade: 0.25, L: () => loc(["#04060e", "#141a30"], { near: "#14121a", far: "#1a1820", kind: "stone", seed: 78 }, [banners("o30", 30, 8, 24, 10, 8)]),
    cam: mv([0, 3, -8, 46, -30], [0, 3.6, -7, 44, -60]), lite: { ...NIGHTFIRE, rim: "#ffc070" }, bloom: 0.9, act: (A, lt) => {
      A.light((g) => { for (let i = 0; i < 14; i++) searchlight(g, A.cam, -60 + i * 9.2, 80, (i - 6.5) * 0.012 + Math.sin(lt * 0.3 + i) * 0.01, 0.22); });
      crowd(A, 40, -14, 14, 1.0, 12, 31, (i) => ({ expr: "shout", prop: i % 3 === 0 ? ["torch", 1] : ["fist", 1] }), (i) => i % 2 ? v(SA, { jacket: mix(SA.jacket, "#000", (i % 5) * 0.05) }) : civ(i, 31), { dark: 0.8, darkCol: "#0c0810" });
      for (let i = 0; i < 14; i++) { const x = -14 + 28 * hash(31 + i * 3 * 7.1), z = 1 + 11 * hash(31 + i * 3 * 3.7); if (i % 3 === 0) A.fx(z - 0.02, (g, c) => fire(g, c, A.t, x + 0.25, 2.1, z, 0.18, i)); }
    } },
  // 13a "Em 1933, chegou ao poder" — Hindenburg shakes Hitler's hand; flashbulbs
  { t0: 99.92, fade: 0.2, L: () => loc(undefined, { near: "#6a4a30", far: "#7a5a3a", kind: "wood", zFar: 12 }, [wall("o31", 5, "#a8906a", { h: 7, wid: 14, win: 2, winCol: "#f4ecd8", curtain: "#4a2a3a", frames: 2, panel: "#5a3a24" })], true),
    cam: mv([0, 1.6, -4.0, 40], [0, 1.6, -3.4, 36]), lite: { ...DAY, rdx: -1 }, act: (A, lt, u, T) => {
      const shake = T > 101.5 && T < 103 ? 0.04 * Math.sin(lt * 18) : 0;
      A.a(HINDEN, 241, -0.65, 2.0, { expr: "neutral", facing: 1, look: 1, prop: ["fist", 0.2 + shake], headTilt: 2 }); A.a(v(HIT_CIV, { jacket: "#1e1e22", tie: "#d8d4cc" }), 242, 0.65, 2.05, { expr: "smile_closed", facing: -1, look: -1, headTilt: 6, prop: ["fist", 0.2 + shake] });
      A.light((g) => { for (const at of [101.6, 102.3, 103.1]) { const k = T - at; if (k > 0 && k < 0.3) g.fillStyle = `rgba(255,255,255,${0.6 * (1 - k / 0.3)})`, g.fillRect(0, 0, VW, VH); } });
      A.over((g) => caption(g, "30 DE JANEIRO DE 1933", T - 100.2, 2.6));
    } },
  // 13b "e rapidamente estabeleceu uma ditadura." — the Reichstag burns, its reflection in the river
  { t0: 102.55, fade: 0.2, L: () => loc(["#06060e", "#3a1a16"], { near: "#0e1420", far: "#1a1e2a", zFar: 300 }, [skyline("o32", 90, "#141014", "berlin", 8, 1.2), pier("o32", 14, "#3a2e2a", 30)]),
    cam: mv([0, 3, -10, 44, 20], [0, 3.2, -8.5, 40, 10]), lite: NIGHTFIRE, bloom: 0.95, kicks: [[104.6, 6]], act: (A, lt, u, T) => {
      A.fx(88, (g, c) => { for (const x of [8, 14, 20]) { fire(g, c, lt, x, 10 + (x === 14 ? 5 : 0), 88, 5, x); smokeCol(g, c, lt, x, 16, 89, { h: 70, w: 9, col: [40, 30, 30], a: 0.7, seed: x }); } embers(g, c, lt, 14, 86, 30, 60, 40, 7); });
      A.fx(20, (g, c) => { g.save(); g.globalCompositeOperation = "lighter"; for (let i = 0; i < 18; i++) { const [sx, sy, s] = P(c, 8 + i * 0.7, 0, 30 + i * 2); const w = (4 + hash(i) * 6) * s; g.fillStyle = `rgba(255,${120 + i * 4},40,${0.25 + 0.15 * Math.sin(lt * 6 + i)})`; g.fillRect(sx - w / 2, sy + 2 + i * 0.5, w, 2); } g.restore(); });
      for (let i = 0; i < 4; i++) A.a(v(civ(i, 33), { hat: "cap", cap: "#3a2a2a" }), 251 + i, -5 + i * 1.3, 14.3, { expr: "shock", look: 1, ...idle(lt, 251 + i) }, { y: 1.0, dark: 0.7, darkCol: "#140a08" });
      A.over((g) => { if (T > 104.6) { const k = easeOut(clamp((T - 104.6) / 0.2)); g.save(); g.translate(VW * 0.24, VH * 0.22); g.rotate(-0.14); g.scale(2.2 - 1.2 * k, 2.2 - 1.2 * k); g.globalAlpha = 0.85 * k; g.strokeStyle = "#d8322a"; g.lineWidth = 9; g.strokeRect(-220, -60, 440, 120); g.fillStyle = "#d8322a"; g.font = `bold 74px "DejaVu Sans", sans-serif`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("DITADURA", 0, 4); g.restore(); } });
    } },
];
function MARINE_ALT() { return v(GI, { jacket: "#5a5a3e", cap: "#4a5030" }); }
function emblem2(w: import("./engine").WP) { w.ell(0, 0.75, 0.42, 0.42, "#f4efe6", 2); w.poly([[-0.32, 0.8], [0, 0.95], [0.32, 0.8], [0, 0.55]], "#1a1414", 0); }
