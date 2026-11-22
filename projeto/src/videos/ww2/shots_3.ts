// 254 – 415 s: Pearl Harbor, America enters, 1942 turning points (Midway, El Alamein, Stalingrad), D-Day, the squeeze on Germany, Berlin.
import { VW, VH, P, glow, fire, smokeCol, puff, tint, clamp, lerp, smooth, easeOut, easeIn, hash, rays, sun, beam, muzzle } from "./engine";
import { fall, Sc, C, mv, hand, walkS, runS, marchF, marchCol, crowd, tank, plane, planeTop, ship, flag, signing, hl, arrow, pin, panel, caption, bigText, counter, para,
  civ, kid, sol, v, idle, HIT_GREY, HIT_CAP, HIT_OLD, STALIN_CAP, FDR, MUSSO, IKE, PAULUS, WEH, RED, REDH, REDW, GI, TOMMY, CANUK, POLE, FRENCH, MARINE, SAILOR, SAILOR_B, USPIL, MEDIC, VOLKS, HJ, NURSE } from "./kit";
import { blast, scorch, rubble, embers, flutter, sparks, searchlight, lensFlare, glint, birds, breath, dust, lightning, exhaust, trail, flak, sea, wake, splash, bounce, spring } from "./fx";
import { loc, mtn, hillL, clouds, city, skyline, forest, wall, banners, ruins, field, wire, pier, cliffs, dunes, europe, world, ST, MX, MY, mix, shade } from "./places";
import { DAY, GOLD, BACK, GREY, NIGHTFIRE, MOON, LAMP, COLD, NOON, RED as REDL } from "./looks";
import type { Shot } from "./types";
import type { Ctx } from "./engine";

/** spurts of dirt / sand where bullets strike */
const spurts = (A: Sc, lt: number, n: number, x0: number, x1: number, z0: number, z1: number, seed = 2, col: [number, number, number] = [120, 100, 80]) => { for (let i = 0; i < n; i++) { const per = 0.45 + hash(seed + i) * 0.5, k = ((lt + hash(i + seed * 3) * per) % per) / per, x = lerp(x0, x1, hash(i * 7 + Math.floor((lt + hash(i) * per) / per))), z = lerp(z0, z1, hash(i * 5 + 1));
  A.fx(z, (g, c) => { const [sx, sy, s] = P(c, x, 0.1 + k * 0.7, z); puff(g, sx, sy, (0.1 + k * 0.32) * s, col, 0.85 * (1 - k)); }); } };
/** brass casings ejected from a machine gun: arc, bounce, glint */
const casings = (A: Sc, lt: number, x: number, y: number, z: number, t0 = 0, t1 = 99) => A.fx(z - 0.05, (g, c) => { for (let i = 0; i < 16; i++) { const born = t0 + i * 0.06, k = ((lt - born) % 1.0); if (lt < born || lt > t1 + 1) continue; const [hy] = bounce(k, y, 1.6 + hash(i) * 0.8, 0.35), px = x + 0.8 * Math.min(k, 0.9) + hash(i) * 0.2;
  const [sx, sy, s] = P(c, px, Math.max(0, hy), z - 0.3); g.save(); g.translate(sx, sy); g.rotate(k * 20 + i); g.fillStyle = "#d8a83a"; g.fillRect(-0.04 * s, -0.012 * s, 0.08 * s, 0.024 * s); g.restore(); if (hy > 0.2 && (i + Math.floor(lt * 20)) % 5 === 0) glint(g, sx, sy, 6, 0.6); } });
const STAMP = (g: Ctx, txt: string, k: number, x: number, y: number, col = "#c42a22", size = 72) => { if (k <= 0) return; const e = easeOut(clamp(k / 0.2)); g.save(); g.translate(x, y); g.rotate(-0.13); g.scale(2.2 - 1.2 * e, 2.2 - 1.2 * e); g.globalAlpha = 0.9 * e; g.font = `bold ${size}px "DejaVu Sans", sans-serif`; const w = g.measureText(txt).width; g.strokeStyle = col; g.lineWidth = size * 0.12; g.strokeRect(-w / 2 - 30, -size * 0.8, w + 60, size * 1.6); g.fillStyle = col; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(txt, 0, 4); g.restore(); };
const torpedoWake = (A: Sc, T: number, at: number, x: number, z0: number, z1: number, dur = 2.2) => A.fx(z0, (g, c) => { const k = clamp((T - at) / dur); if (T < at) return; for (let i = 0; i < 30; i++) { const q = (i / 30) * k, [sx, sy, s] = P(c, x, 0.05, lerp(z0, z1, q)); puff(g, sx, sy, (0.5 + (k - q) * 1.4) * s, [236, 244, 248], 0.6 * (1 - (k - q))); } });

export const SHOTS_3: Shot[] = [
  // 38a "No dia 7 de dezembro de 1941," — torpedo bombers skim the sea at dawn
  { t0: 254.0, fade: 0.3, L: () => loc(["#3a4a7a", "#f6b88a"], { near: "#2e4a6a", far: "#6a7a9a", zFar: 600 }, [clouds("q0", 320, ["#ffc8a0", "#4a5a8a"], 61, 10, 70, 18, 4), mtn("q0", 360, "#4a4a6a", 63, 50, false, 3)]),
    cam: (u, lt) => C(lt * 18 - 10, 4, -14, 44), lite: BACK, act: (A, lt) => {
      A.fx(300, (g, c) => sea(g, c, lt, { crest: "rgba(255,220,190,0.4)", glitter: [40, "255,210,160"], z0: -12, z1: 600, n: 220, seed: 29 }));
      for (let i = 0; i < 5; i++) plane(A, i % 2 ? "zero" : "kate", -14 + lt * 20 - i * 9, 5 + (i % 3) * 1.6 + Math.sin(lt + i) * 0.3, 18 + i * 6, {});
      A.light((g) => { sun(g, VW * 0.8, VH * 0.48, 30, "255,200,140"); lensFlare(g, VW * 0.8, VH * 0.48, 0.5); });
      A.over((g) => caption(g, "7 DE DEZEMBRO DE 1941", lt - 0.3, 2.8));
    } },
  // 38b "o Japão atacou de surpresa" — Sunday morning on deck; the sailors look up as the planes appear
  { t0: 257.3, fade: 0.2, L: () => loc(["#4a8ad0", "#e8f0f4"], { near: "#8a8e92", far: "#9a9ea2", kind: "wood", zFar: 30 }, [mtn("q1", 260, "#4a7a5a", 65, 60, false, 2.5), forest("q1", 90, "palm", "#3a7a3a", 24, 67, { blur: 2, h: 16 })]),
    cam: mv([0, 1.6, -5, 42], [0, 1.7, -4.2, 40, 30]), lite: NOON, act: (A, lt, u, T) => {
      const see = T > 258.4; for (let i = 0; i < 4; i++) A.a(i % 2 ? SAILOR : SAILOR_B, 631 + i, -3 + i * 2, 2.4 + (i % 2) * 0.8, { expr: see ? (i % 2 ? "shock" : "fear") : ["smile", "neutral", "grin", "smile_closed"][i] as never, look: see ? 0 : (i % 2 ? -1 : 1), headTilt: see ? -12 : 0, armB: see && i % 2 ? 1 : undefined });
      for (let i = 0; i < 6; i++) planeTop(A, "zero", -30 + i * 10 + (T - 258.2) * 22, 40, 70 + i * 5, { head: Math.PI / 2, below: true, alpha: clamp((T - 258.2) / 0.3) });
      A.sp("flagpole", 4.6, 0, 3.6, { sc: 0.6 }); flag(A, "us", 4.64, 4.8, 3.59, 1.3, 0.8, { pole: false, t: lt });
    } },
  // 38c "a base naval americana de Pearl Harbor, no Havaí." — torpedoes run at battleship row
  { t0: 260.5, fade: 0.15, L: () => loc(["#5a90d0", "#eaf2f4"], { near: "#3a6a7a", far: "#6a9aa8", zFar: 600 }, [mtn("q2", 300, "#3e6a4e", 69, 80, false, 2.5), forest("q2", 180, "palm", "#3a6a3a", 30, 71, { blur: 2, h: 18 })]),
    cam: mv([-20, 14, -40, 42, -40], [-12, 15, -36, 42, -40]), lite: NOON, act: (A, lt, u, T) => {
      A.fx(300, (g, c) => sea(g, c, lt, { crest: "rgba(240,250,255,0.4)", z0: -30, z1: 400, n: 200, seed: 31 }));
      for (let i = 0; i < 3; i++) ship(A, "arizona", -60 + i * 70, 110 + i * 10, {}); for (let i = 0; i < 3; i++) { torpedoWake(A, T, 260.9 + i * 0.3, -50 + i * 60, 10, 105 + i * 10); plane(A, "kate", -60 + i * 50 + (T - 260.5) * 30, 8, 30 + i * 6, {}); }
      A.over((g) => caption(g, "PEARL HARBOR · HAVAÍ", lt - 0.2, 1.6));
    } },
  // 39a "O ataque destruiu navios" — the magazine of the battleship detonates
  { t0: 262.3, fade: 0.1, L: () => loc(["#6a8ab0", "#d8dce0"], { near: "#3a5a6a", far: "#5a7a8a", zFar: 600 }, [mtn("q3", 300, "#3e5a4a", 73, 70, false, 3)]),
    cam: hand(mv([0, 8, -60, 42, -40], [0, 9, -54, 42, -40]), 0.08), lite: DAY, kicks: [[263.15, 22]], act: (A, lt, u, T) => {
      A.fx(300, (g, c) => sea(g, c, lt, { crest: "rgba(240,250,255,0.35)", z0: -40, z1: 400, n: 160, seed: 33 }));
      const k = T - 263.15; ship(A, "arizona", 0, 100, { sink: k > 0 ? Math.min(6, k * 1.4) : 0, rock: k > 0 ? 0.04 : 0.01 });
      A.fx(99, (g, c) => { blast(g, c, k, 8, 12, 99, 22, 7, { debris: 40, smoke: 1.5 }); if (k > 0.8) { fire(g, c, lt, 0, 10, 99, 10, 3); smokeCol(g, c, lt, 0, 20, 100, { h: 160, w: 30, col: [26, 24, 26], a: 0.9, seed: 4 }); } });
    } },
  // 39b "e matou milhares de pessoas." — smoke over the harbour; a rescue launch in the oily water
  { t0: 264.05, fade: 0.25, L: () => loc(["#4a4a52", "#9a9490"], { near: "#2a3a42", far: "#4a5a62", zFar: 600 }, [skyline("q4", 300, "#3a3a40", "generic", 13, 3)]),
    cam: mv([-4, 2, -12, 42], [-2, 2.1, -10.5, 40]), lite: GREY, act: (A, lt) => {
      A.fx(200, (g, c) => { sea(g, c, lt, { crest: "rgba(200,200,210,0.25)", z0: -10, z1: 300, n: 160, seed: 35 }); for (const x of [-60, -10, 40, 90]) smokeCol(g, c, lt, x, 4, 200, { h: 120, w: 22, col: [24, 22, 24], a: 0.85, seed: x }); for (const x of [-60, 40]) fire(g, c, lt, x, 2, 199, 8, x); });
      A.sp("higgins", 0, -0.2, 5, { sc: 0.8 }); for (let i = 0; i < 3; i++) A.a(i % 2 ? SAILOR : SAILOR_B, 641 + i, -1.6 + i * 1.2, 5.1, { expr: "sad", look: i === 1 ? 0 : 1, headTilt: 8 }, { y: 0.5 });
    } },
  // 40a "No dia seguinte, os Estados Unidos entraram oficialmente na guerra" — Roosevelt at the Capitol rostrum
  { t0: 266.32, fade: 0.25, L: () => loc(undefined, { near: "#5a4030", far: "#6a4c38", kind: "wood", zFar: 12 }, [wall("q5", 5, "#c8b48a", { h: 8, wid: 14, panel: "#5a3a24", frames: 0 }), banners("q5", 4.9, 1, 1.4, 7, 3, "#2a3a6a")], true),
    cam: mv([0, 2.0, -4.4, 40, -40], [0, 2.0, -3.7, 36, -40]), lite: DAY, act: (A, lt) => {
      A.a(FDR, 651, 0, 2.6, { expr: "stern", look: 0, prop: ["fist", 0.4 + 0.2 * Math.sin(lt * 3)], ...idle(lt, 651) }, { y: 0.4 }); panel(A, 2.5, (w) => { w.rect(-1.4, -0.1, 2.8, 1.4, w.vgrad(-0.1, 1.3, "#4a2e1e", "#7a4e32"), 3); w.ell(0, 0.7, 0.4, 0.4, "#c9a24a", 2); });
      for (const x of [-0.45, 0, 0.45]) A.sp("mic", x, 1.25, 2.45, { sc: 0.8 }); flag(A, "us", 2.6, 3.4, 4.6, 1.8, 1.1, { t: lt, wind: 0.25, droop: 0.3 });
      A.light((g) => { for (const at of [0.4, 1.3]) { const k = lt - at; if (k > 0 && k < 0.25) { g.fillStyle = `rgba(255,255,255,${0.5 * (1 - k / 0.25)})`; g.fillRect(0, 0, VW, VH); } } });
      A.over((g) => caption(g, "8 DE DEZEMBRO DE 1941", lt - 0.2, 2.2));
    } },
  // 40b "...na guerra contra o Japão." — Roosevelt signs the declaration of war (close-up)
  { t0: 268.6, L: () => loc(undefined, { near: "#2a1a10", far: "#2a1a10", zFar: 1 }, [], true), cam: mv([0, 0.15, -1.7, 40], [0.3, -0.35, -0.6, 38]), act: (A, lt, u, T) => {
      signing(A, clamp((T - 269.4) / 1.5), { z: 3, seed: 41, title: "DECLARAÇÃO DE GUERRA", sub: "Resolução Conjunta · 8 de dezembro de 1941", sleeve: "#3a4050", desk: "#5a3a26", paper: "#f6f0de" });
      A.light((g) => glow(g, VW * 0.8, VH * 0.1, 700, "rgba(255,230,190,1)", 0.25));
    } },
  // 41a "Poucos dias depois, Alemanha" — Hitler at the Reichstag rostrum declares war on America
  { t0: 271.37, fade: 0.2, L: () => loc(undefined, { near: "#3a2a24", far: "#4a382e", kind: "wood", zFar: 14 }, [wall("q6", 6, "#5a4a42", { h: 9, wid: 14, panel: "#2a1e18" }), banners("q6", 5.9, 3, 5, 8.5, 5)], true),
    cam: mv([0, 2.2, -5, 40, -60], [0, 2.2, -4.2, 36, -60]), lite: { ...LAMP, rim: "#ffb080" }, act: (A, lt) => {
      A.a(HIT_GREY, 661, 0, 3, { expr: "shout", prop: ["fist", 0.6 + 0.4 * Math.sin(lt * 5)] }, { y: 0.7 }); panel(A, 2.9, (w) => w.rect(-1.2, 0, 2.4, 1.6, w.vgrad(0, 1.6, "#2a1e16", "#5a3e2a"), 3));
      crowd(A, 10, -5, 5, 0.6, 1.8, 73, () => ({ expr: "shout", prop: ["fist", 1] }), (i) => sol(v(WEH, { hat: "peaked", cap: "#4a4e46", rifle: false }), i), { dark: 0.85, darkCol: "#120c0a" });
      A.over((g) => caption(g, "11 DE DEZEMBRO DE 1941", lt - 0.2, 1.6));
    } },
  // 41b "e Itália também declararam guerra aos americanos." — Mussolini on the Roman balcony, the piazza roars
  { t0: 273.1, fade: 0.15, L: () => loc(["#5a90d0", "#f4e8d0"], { near: "#b8a07a", far: "#d0b890", kind: "stone", seed: 144 }, [skyline("q7", 200, "#c0a888", "rome", 75, 2), wall("q7", 9, "#d8b890", { h: 9, wid: 14, win: 3, arch: true, winCol: "#6a5040" })]),
    cam: mv([0, 3.2, -6, 42, -40], [0, 3.4, -5.4, 40, -50]), lite: DAY, act: (A, lt) => {
      panel(A, 8.6, (w) => { w.rect(-2.4, 3.6, 4.8, 0.3, "#c8a882", 2.5); for (let x = -2.2; x <= 2.2; x += 0.4) w.rect(x - 0.06, 3.9, 0.12, 0.8, "#c8a882", 1.5); w.rect(-2.4, 4.7, 4.8, 0.15, "#c8a882", 2); });
      A.a(MUSSO, 671, 0, 8.7, { expr: "shout", prop: ["fist", 0.8 + 0.2 * Math.sin(lt * 4)], look: 0 }, { y: 3.9 }); flag(A, "it", 2.8, 6.4, 8.5, 1.4, 0.9, { t: lt });
      crowd(A, 22, -8, 8, 0.6, 5.6, 77, (i) => ({ expr: "shout", prop: i % 3 === 0 ? ["fist", 1] : undefined }), (i) => civ(i, 77), { dark: 0.7, darkCol: "#2a1c14" });
    } },
  // 42 "Agora, o conflito havia se transformado verdadeiramente em uma guerra mundial." — night world map, every front ignites
  { t0: 276.5, fade: 0.25, L: () => world("q8", ST.night), cam: mv([0, 0.5, -26, 40], [0, 0.8, -22, 40]), act: (A, lt, u, T) => {
      const PTS: [number, number][] = [[2, 47], [-1, 51], [10, 51], [21, 52], [30, 50], [37, 55], [44, 48], [12, 42], [20, 31], [29, 31], [116, 40], [105, 35], [140, 36], [-158, 21], [120, 14], [150, -6], [160, -9], [178, 28], [100, 15], [130, -12], [-10, 45], [-40, 50], [-70, 40]];
      PTS.forEach(([lo, la], i) => pin(A, lo, la, T - 277.3 - i * 0.1, i > 19 ? "dot" : "fire", true, "#6ab0ff"));
      A.over((g) => bigText(g, "GUERRA MUNDIAL", T - 280.6, 1.6, VH * 0.86, 90, "#f6efe0", undefined, "120,180,255"));
    } },
  // 43a "Em 1942, as forças do Eixo ainda controlavam enormes territórios," — the Axis at its height
  { t0: 282.0, fade: 0.25, L: () => europe("q9", ST.rust), cam: mv([0.5, 3, -46, 40], [0.5, 3, -42, 40]), act: (A, lt, u, T) => {
      hl(A, "AXIS42", (T - 283.9) / 1.0, "#3a2a24", 0.62); hl(A, "GER", 1, "#2a1a14", 0.5); A.over((g) => caption(g, "1942", lt - 0.2, 2.8));
    } },
  // 43b "mas começaram a enfrentar derrotas importantes." — a German officer at dusk beside a burnt-out tank
  { t0: 286.75, fade: 0.25, L: () => loc(["#2a2a44", "#d0805a"], { near: "#4a4030", far: "#6a5a44", kind: "mud", seed: 146 }, [hillL("q10", 140, "#3a3040", 9, 10, 2), forest("q10", 50, "dead", "#000", 10, 79, { blur: 1, h: 10 })]),
    cam: mv([0, 1.5, -6, 40], [0.5, 1.5, -5, 38]), lite: BACK, act: (A, lt) => {
      tank(A, "panzer", 2.5, 5, { vel: 0, dark: 0.5 }); A.fx(4.9, (g, c) => { smokeCol(g, c, lt, 2.5, 2.2, 5, { h: 16, w: 2, col: [40, 34, 34], a: 0.8 }); fire(g, c, lt, 3, 1.8, 4.9, 0.7, 3); });
      A.a(sol(v(WEH, { hat: "peaked", cap: "#5e6458", rifle: false }), 9), 681, -1.4, 2.6, { expr: "nervous", look: 1, headTilt: 6 + 2 * Math.sin(lt) });
    } },
  // 44a "No Oceano Pacífico, a Batalha de Midway" — an American carrier launches its dive-bombers
  { t0: 290.5, fade: 0.25, L: () => loc(["#3a76c0", "#e0ecf4"], { near: "#2a5a8a", far: "#5a8ab0", zFar: 700 }, [clouds("q11", 350, ["#ffffff", "#9ab8d8"], 81, 30, 120, 24, 3)]),
    cam: mv([-30, 16, -70, 42], [-10, 17, -64, 42]), lite: NOON, act: (A, lt) => {
      A.fx(400, (g, c) => sea(g, c, lt, { crest: "rgba(240,250,255,0.45)", glitter: [30, "255,255,240"], z0: -60, z1: 700, n: 240, seed: 37 }));
      ship(A, "carrier", 0, 150, { vel: 4 }); for (let i = 0; i < 3; i++) { const k = Math.max(0, lt - 0.3 - i * 0.6), x = -60 + 0.5 * 28 * k * k, y = 18 + (k > 1.4 ? (k - 1.4) ** 2 * 8 : 0); plane(A, "dauntless", Math.min(x, 300), y, 149, { sc: 1.8, ang: -Math.min(0.3, (y - 18) * 0.05) }); }
      A.over((g) => caption(g, "MIDWAY · JUNHO DE 1942", lt - 0.2, 2.0));
    } },
  // 44b "representou uma grande vitória americana" — the dive: Dauntlesses peel off and plunge through the cloud
  { t0: 292.7, fade: 0.1, L: () => loc(["#2e64b0", "#c8dcee"], { near: "#2a4a7a", far: "#4a6a9a", zFar: 600 }, [clouds("q12", 200, ["#ffffff", "#8aa8cc"], 83, -20, 60, 26, 2.5)]),
    cam: (u, lt) => C(lt * 6 + 2, 62 - lt * lt * 9, -14, 50, 0), lite: DAY, act: (A, lt) => {
      for (let i = 0; i < 3; i++) { const k = Math.max(0, lt - i * 0.3), x = -6 + i * 6 + k * 8, y = 66 - k * k * 9 - i * 2; plane(A, "dauntless", x, y, 18 + i * 3, { ang: Math.min(1.25, 0.3 + k * 0.6) }); A.fx(18.2 + i * 3, (g, c) => { const [sx, sy, s] = P(c, x - 2, y + 2.5, 18.2 + i * 3); for (let j = 0; j < 3; j++) { g.strokeStyle = "rgba(255,255,255,0.3)"; g.lineWidth = 2; g.beginPath(); g.moveTo(sx, sy); g.lineTo(sx - 0.8 * s * (3 + j), sy - 1.6 * s * (3 + j)); g.stroke(); } }); }
    } },
  // 44c "contra a marinha japonesa." — bombs strike the carrier's deck, the hangar erupts
  { t0: 294.2, fade: 0.1, L: () => loc(["#4a76b0", "#e0e8ee"], { near: "#2a4a6a", far: "#4a6a8a", zFar: 600 }, [clouds("q13", 320, ["#ffffff", "#8aa0c0"], 85, 30, 100, 18, 3)]),
    cam: hand(mv([0, 10, -55, 42, -20], [6, 10.5, -50, 42, -20]), 0.06), lite: DAY, kicks: [[294.6, 14], [295.3, 18], [295.9, 12]], act: (A, lt, u, T) => {
      A.fx(400, (g, c) => sea(g, c, lt, { crest: "rgba(240,250,255,0.4)", z0: -50, z1: 600, n: 200, seed: 39 })); ship(A, "kaga", 0, 120, { vel: 2 });
      for (const [at, x] of [[294.6, -40], [295.3, 20], [295.9, 60]] as number[][]) A.fx(119, (g, c) => { blast(g, c, T - at, x, 20, 119, 12, at, { debris: 30 }); if (T > at + 0.4) { fire(g, c, lt, x, 19, 118.9, 7, at); smokeCol(g, c, lt, x, 26, 119.5, { h: 80, w: 14, col: [30, 26, 26], a: 0.85, seed: x }); } });
      A.fx(110, (g, c) => splash(g, c, T - 294.9, -90, 110, 22, 3));
    } },
  // 45a "Na África, os britânicos derrotaram" — El Alamein's night barrage: a thousand guns flash along the horizon
  { t0: 297.0, fade: 0.3, L: () => loc(["#08081a", "#2a2236"], { near: "#3a3024", far: "#4a3e30", kind: "sand", seed: 148 }, [dunes("q14", 100, "#2a2420", 87, 6, 1.5)]),
    cam: mv([0, 1.4, -6, 42], [0, 1.5, -5, 40]), lite: { ...NIGHTFIRE, rim: "#ffd090" }, kicks: [[297.4, 4], [298.0, 5], [298.7, 4]], act: (A, lt, u, T) => {
      for (let i = 0; i < 6; i++) { const at = 297.3 + i * 0.27, k = (lt - (at - 297)) % 1.6, x = -9 + i * 3.6, z = 4 + (i % 2) * 1.5; A.sp("howitzer", x, 0, z, { sc: 0.9, alpha: 1 }); A.fx(z - 0.05, (g, c) => { if (k > 0 && k < 0.1) { muzzle(g, c, x + 2.6, 2.0, z, 1.3, 1); glow(g, ...(P(c, x + 2.6, 2, z).slice(0, 2) as [number, number]), 260, "rgba(255,200,120,1)", 0.6); } }); }
      A.light((g) => { for (let i = 0; i < 26; i++) { const ph = (A.t * 1.3 + hash(i)) % 1; if (ph < 0.08) glow(g, VW * hash(i * 3), VH * 0.47, 120, "rgba(255,190,120,1)", 0.6); } });
      A.over((g) => caption(g, "EL ALAMEIN · OUTUBRO DE 1942", lt - 0.2, 2.2));
    } },
  // 45b "as forças alemãs e italianas na Batalha de El Alamein." — dawn: British tanks roll through the dust; the Afrika Korps surrenders
  { t0: 299.4, fade: 0.2, L: () => loc(["#c8a070", "#f6dcb0"], { near: "#c8a06a", far: "#e0c08a", kind: "sand", seed: 150, zFar: 400 }, [dunes("q15", 120, "#d8b07a", 89, 8, 2), dunes("q15b", 40, "#c89a62", 91, 3, 0.8)]),
    cam: mv([2, 1.5, -7, 42], [0, 1.5, -6, 40]), lite: GOLD, wx: ["dust", 200, 0.5], act: (A, lt) => {
      for (let i = 0; i < 3; i++) tank(A, "crusader", -14 + lt * 3 - i * 7, 8 + i * 3, { vel: 3, dustCol: [220, 190, 140], t: lt + i });
      for (let i = 0; i < 4; i++) A.a(sol(i % 2 ? v(WEH, { jacket: "#b8a070", pants: "#a89060", hat: "cap", cap: "#a89060" }) : v(WEH, { jacket: "#9a8e6a", pants: "#8a7e5a", hat: "cap", cap: "#6a6a4a" }), i, false), 691 + i, 1.5 + i * 1.2, 3 + (i % 2) * 0.6, { expr: "sad", armB: 1, wave: 0, headTilt: 6, look: -1 });
      A.a(sol(v(TOMMY, { jacket: "#b0985e", pants: "#a08a54", cap: "#9a8a5a" }), 3), 695, -2.2, 3.2, { expr: "stern", look: 1 });
    } },
  // 46 "Mas uma das batalhas mais importantes aconteceu na União Soviética." — boats cross the Volga at dusk under fire
  { t0: 302.95, fade: 0.25, L: () => loc(["#1e2440", "#a05a4a"], { near: "#2a3448", far: "#4a4a5a", zFar: 400 }, [ruins("q16", 120, ["#3a3034", "#2e282c"], 93, { hgt: [10, 24], blur: 1.5 })]),
    cam: mv([0, 2, -8, 42], [1, 2, -7, 40]), lite: NIGHTFIRE, act: (A, lt, u, T) => {
      A.fx(60, (g, c) => { sea(g, c, lt, { crest: "rgba(255,170,130,0.35)", z0: -6, z1: 110, n: 160, seed: 41 }); for (const x of [-40, 10, 50]) fire(g, c, lt, x, 6, 118, 6, x); });
      A.sp("higgins", 0, -0.3, 6, { sc: 0.8 }); for (let i = 0; i < 4; i++) A.a(sol(REDH, i + 2), 701 + i, -1.6 + i * 1.0, 6.1, { expr: i % 2 ? "nervous" : "stern", look: 1 }, { y: 0.4 });
      for (const at of [303.6, 304.8, 305.9]) A.fx(14, (g, c) => splash(g, c, T - at, -8 + at % 1 * 16, 14, 8, at));
      A.light((g) => { const k = (lt % 4) / 4; const [sx, sy, s] = P(A.cam, 6, 30 - k * 20, 60); glow(g, sx, sy, 2 * s, "rgba(255,240,200,1)", 0.9); glow(g, sx, sy, 30 * s, "rgba(255,240,200,1)", 0.2); });
    } },
  // 47 "A cidade de Stalingrado se transformou em um verdadeiro inferno." — the ruined city burns
  { t0: 307.55, fade: 0.2, L: () => loc(["#1a0e10", "#8a3a1e"], { near: "#2a2220", far: "#3a2e28", kind: "rubble", seed: 152 }, [skyline("q17", 160, "#1e1416", "stalingrad", 95, 2), ruins("q17", 50, ["#4a3a34", "#3e322e", "#56443c"], 97, { hgt: [8, 20], blur: 0.8 }), ruins("q17b", 18, ["#5a4a40", "#4a3e36"], 99, { hgt: [5, 11] })]),
    cam: mv([-3, 6, -14, 44, -60], [3, 7, -12, 42, -70]), lite: NIGHTFIRE, bloom: 0.95, act: (A, lt, u, T) => {
      A.fx(48, (g, c) => { for (const x of [-30, -12, 4, 20, 36]) { fire(g, c, lt, x, 4, 48, 4, x); smokeCol(g, c, lt, x, 8, 48.5, { h: 60, w: 9, col: [30, 22, 22], a: 0.75, seed: x }); } embers(g, c, lt, 0, 40, 60, 90, 30, 11); });
      A.over((g) => bigText(g, "STALINGRADO", T - 308.4, 2.9, VH * 0.24, 126, "#f6efe0", undefined, "255,120,60"));
    } },
  // 48a "Durante meses, soldados alemães e soviéticos lutaram" — inside a gutted flat: Soviet riflemen fire from the window, plaster rains down
  { t0: 312.0, fade: 0.2, L: () => loc(["#5a5a64", "#9a948a"], { near: "#5a4c42", far: "#6a5a4e", kind: "rubble", seed: 154, zFar: 20 }, [ruins("q18", 22, ["#7a6a5e", "#6a5a50"], 101, { hgt: [10, 16], blur: 2 }), wall("q18", 3.2, "#8a7a6a", { h: 4, wid: 10, win: 2, winCol: "#a8a8a8", brick: true })]),
    cam: hand(mv([0.2, 1.5, -3.6, 42], [0.1, 1.5, -3.0, 40]), 0.025), lite: GREY, kicks: [[313.4, 5], [314.6, 6]], act: (A, lt) => {
      for (let i = 0; i < 2; i++) { const x = -1.4 + i * 2.8; A.a(sol(REDH, i + 9), 711 + i, x, 2.6, { expr: "stern", look: i ? 1 : -1, facing: i ? 1 : -1, prop: ["rifleUp", 1], crouch: 0.2 }); const fire0 = [0.4 + i * 0.5, 1.6 + i * 0.4, 2.7]; for (const f of fire0) if (lt > f && lt < f + 0.07) A.fx(2.5, (g, c) => muzzle(g, c, x + (i ? 0.5 : -0.5), 1.85, 2.5, 0.35, i ? 1 : -1)); }
      A.fx(1.5, (g, c) => { for (let i = 0; i < 40; i++) { const k = ((lt * 0.7 + hash(i)) % 1), [sx, sy, s] = P(c, -3 + hash(i + 3) * 6, 4 - k * 4, 1.6 + hash(i) * 2); g.fillStyle = `rgba(220,214,200,${0.6 * (1 - k)})`; g.fillRect(sx, sy, Math.max(1.5, 0.02 * s), Math.max(1.5, 0.02 * s)); } });
    } },
  // 48b "casa por casa," — a soldier sprints across the rubble street, bullets kick up dust at his heels
  { t0: 315.6, fade: 0.1, L: () => loc(["#6a6a70", "#a8a29a"], { near: "#6a5e52", far: "#8a7c6e", kind: "rubble", seed: 156 }, [ruins("q19", 16, ["#8a7a6a", "#7a6a5c", "#94826e"], 103, { hgt: [8, 15] }), ruins("q19b", 40, ["#6a5e54", "#5e544a"], 105, { hgt: [10, 20], blur: 1.5 })]),
    cam: (u, lt) => C(-3 + lt * 4.0, 1.2, -6, 42), lite: GREY, act: (A, lt, u, T) => { fall(A, sol(REDH, 15), 722, 1.8, 3.8, T, 316.25, { dir: 1, run: 4.4 }); runS(A, sol(REDH, 14), 721, lt, -4, 3, 4.4, { expr: "fear" }); spurts(A, lt, 7, -5 + lt * 4.4 - 1.5, -5 + lt * 4.4 + 2.5, 2.6, 3.8, 7, [150, 140, 128]); } },
  // 48c "enfrentando frio extremo," — wrapped in a blanket, frost on the helmet, breath freezing
  { t0: 316.95, fade: 0.2, L: () => loc(["#7a8aa0", "#d8e0e8"], { near: "#c8ccd4", far: "#dfe4ea", kind: "snow", seed: 158 }, [ruins("q20", 14, ["#8a8a92", "#7a7a84"], 107, { hgt: [6, 12], snow: true, blur: 1.5 })]),
    cam: mv([0, 1.5, -2.6, 38], [0, 1.5, -2.1, 34]), lite: COLD, wx: ["snow", 260, 0.7], act: (A, lt) => {
      A.a(v(sol(RED, 15), { jacket: "#6a6450", hat: "ushanka", cap: "#7a6a58", scarf: "#5a4a3a" }), 731, 0, 1.9, { mode: "sit", expr: "pained", headTilt: 2 * Math.sin(lt * 22), armB: -1 }, { y: 0.1 }); A.fx(1.89, (g, c) => breath(g, c, lt, 0.1, 1.4, 1.9, 1, 7));
    } },
  // 48d "fome" — soldiers share a heel of bread over a tiny fire
  { t0: 318.85, fade: 0.15, L: () => loc(["#1a1a24", "#3a3036"], { near: "#3a3432", far: "#4a4240", kind: "rubble", seed: 160 }, [ruins("q21", 10, ["#4a403c", "#3e3632"], 109, { hgt: [5, 9], blur: 1 })]),
    cam: mv([0, 1.2, -2.6, 38], [0, 1.15, -2.2, 34]), lite: { ...NIGHTFIRE, sx: 0.4, sy: -0.4 }, act: (A, lt) => {
      A.fx(1.6, (g, c) => fire(g, c, lt, 0, 0, 1.6, 0.35, 3)); A.a(sol(REDH, 16, false), 741, -0.9, 1.9, { mode: "sit", expr: "sad", prop: ["bread", 0], look: 1 }, { y: 0.1 }); A.a(sol(RED, 17, false), 742, 0.9, 2.0, { mode: "sit", expr: "sad", look: -1, facing: -1 }, { y: 0.1 });
    } },
  // 48e "e bombardeios constantes." — a bomb hits; the façade collapses brick by brick
  { t0: 319.6, fade: 0.1, L: () => loc(["#5a5a60", "#a0988c"], { near: "#5a4e44", far: "#7a6c5e", kind: "rubble", seed: 162 }, [ruins("q22", 40, ["#6a5e54", "#5e544a"], 111, { hgt: [10, 18], blur: 1.4 })]),
    cam: hand(mv([0, 2, -8, 42], [0, 2, -7.4, 40]), 0.04), lite: GREY, kicks: [[319.9, 16]], act: (A, lt, u, T) => {
      const k = T - 319.9; panel(A, 10, (w) => { for (let y = 0; y < 10; y += 0.4) for (let x = -4 + ((y / 0.4) % 2) * 0.3; x < 4; x += 0.6) if (!(k > 0 && y > 4 + (x + 4) * 0.4 - k * 6)) w.rect(x, y, 0.58, 0.38, ["#8a6a52", "#7a5e48", "#94745a"][Math.floor(x * 3 + y * 7) % 3 & 3] ?? "#8a6a52", 0.8); });
      A.fx(9.9, (g, c) => { rubble(g, c, k, 0, 5, 9.6, 8, 13, 60, "#8a6a52"); blast(g, c, k, 0, 2, 9.5, 3, 31); });
    } },
  // 49a "Em fevereiro de 1943, o exército alemão cercado" — an endless column of prisoners crosses the snow
  { t0: 321.38, fade: 0.3, L: () => loc(["#9aa4b4", "#e8ecf0"], { near: "#d8dee6", far: "#eef2f6", kind: "snow", seed: 164, zFar: 400 }, [hillL("q23", 200, "#b0b8c8", 13, 10, 3), ruins("q23", 120, ["#8a8a92"], 113, { hgt: [6, 14], blur: 2.5, snow: true })]),
    cam: mv([0, 3, -10, 42, -50], [2, 3, -9, 40, -50]), lite: COLD, wx: ["snow", 160, 0.5], act: (A, lt) => {
      for (let r = 0; r < 3; r++) marchCol(A, (i) => v(sol(WEH, 130 + i + r, false), { scarf: "#5a4a3a" }), lt, 14, 12, 5 + r * 3, -0.9, 1.4, 1, 1, {}, { expr: "sad" }, 750 + r * 30);
      walkS(A, sol(REDW, 3), 801, lt, 6, 3.6, -0.9, { expr: "stern" }); A.over((g) => caption(g, "FEVEREIRO DE 1943", lt - 0.6, 2.6));
    } },
  // 49b "acabou se rendendo." — in a cellar, Paulus surrenders to Soviet officers
  { t0: 325.0, fade: 0.15, L: () => loc(undefined, { near: "#3a342e", far: "#4a423a", kind: "stone", seed: 166, zFar: 10 }, [wall("q24", 3, "#5a5450", { h: 3.5, wid: 8, brick: true, pipes: true })], true),
    cam: mv([0, 1.5, -3, 38], [0, 1.5, -2.5, 34]), lite: LAMP, act: (A, lt) => {
      A.a(PAULUS, 811, -0.7, 2, { expr: "sad", facing: 1, look: 1, headTilt: 8, prop: ["pistol", -0.4] }); A.a(sol(v(RED, { hat: "peaked", cap: "#6a6448", rifle: false }), 1), 812, 0.8, 2.1, { expr: "stern", facing: -1, look: -1 }); A.a(sol(REDH, 18), 813, 2.0, 2.6, { expr: "stern", look: -1, facing: -1 });
      A.light((g) => { const [sx, sy, s] = P(A.cam, 0, 3.3, 2.5); glow(g, sx, sy, 2.5 * s, "rgba(255,210,150,1)", 0.55); });
    } },
  // 50 "A derrota foi devastadora para Hitler." — Hitler slams the table: cup and pencils jump
  { t0: 327.3, fade: 0.2, L: () => loc(undefined, { near: "#4a3c30", far: "#5a4a3c", kind: "wood", zFar: 10 }, [wall("q25", 3.2, "#6a6050", { h: 4.5, wid: 9, map: true, panel: "#3a3226" })], true),
    cam: hand(mv([0, 1.6, -2.6, 38], [0, 1.55, -2.0, 34]), 0.01), lite: LAMP, kicks: [[328.2, 12]], act: (A, lt, u, T) => {
      const k = T - 328.2; A.a(HIT_GREY, 821, 0, 2.0, { expr: k > 0 ? "shout" : "stern", prop: ["fist", k > 0 && k < 0.2 ? 0 : 0.9], crouch: k > 0 && k < 0.4 ? 0.3 : 0 }); A.sp("deskG", 0, 0, 1.5, { sc: 1.1 });
      A.fx(1.48, (g, c) => { const [cy] = bounce(Math.max(0, k), 0, k > 0 ? 1.6 : 0, 0.3), [p1] = bounce(Math.max(0, k - 0.02), 0, k > 0 ? 2.2 : 0, 0.35); const [sx, sy, s] = P(c, 0.9, 0.82 + cy, 1.48); g.fillStyle = "#f2efe6"; g.strokeStyle = "#241726"; g.lineWidth = 2; g.fillRect(sx - 0.07 * s, sy - 0.14 * s, 0.14 * s, 0.14 * s); g.strokeRect(sx - 0.07 * s, sy - 0.14 * s, 0.14 * s, 0.14 * s);
        for (let i = 0; i < 3; i++) { const [px, py] = P(c, -0.8 + i * 0.15, 0.83 + p1 * (1 - i * 0.2), 1.48); g.save(); g.translate(px, py); g.rotate(k > 0 ? Math.min(k, 0.8) * (i - 1) * 8 : 0); g.fillStyle = ["#c0302a", "#2a4a8a", "#e8c23a"][i]; g.fillRect(-0.12 * s, -0.012 * s, 0.24 * s, 0.024 * s); g.restore(); } });
    } },
  // 51 "Pela primeira vez, uma grande força alemã havia sido completamente derrotada" — wrecks under snow, a helmet half buried, crows
  { t0: 330.1, fade: 0.3, L: () => loc(["#5a6478", "#c8ccd4"], { near: "#cfd4dc", far: "#e4e8ee", kind: "snow", seed: 168, zFar: 300 }, [hillL("q26", 160, "#9aa2b2", 17, 8, 3), forest("q26", 60, "dead", "#000", 12, 117, { blur: 1.4, h: 10 })]),
    cam: (u, lt) => C(-2 + lt * 0.5, 1.2, -5, 40), lite: GREY, wx: ["snow", 120, 0.45], act: (A, lt) => {
      tank(A, "panzerW", -6, 9, { vel: 0, dark: 0.3 }); A.sp("truck", 6, -0.4, 13, { rot: 0.15 }); A.sp("helmetG", 0.4, 0.05, 2.0, { sc: 1.3, rot: 0.3 }); panel(A, 1.98, (w) => w.ell(0.4, 0.05, 0.6, 0.12, "#e4e8ee", 0));
      A.fx(9, (g, c) => birds(g, c, lt, 6, -6, 6, 20, 1.2, "#141218", 13, 0.6));
    } },
  // 52 "A partir daquele momento, os soviéticos começaram a avançar em direção ao território alemão." — T-34s with tank riders sweep west
  { t0: 337.6, fade: 0.25, L: () => loc(["#5a8ac0", "#ecdcb8"], { near: "#6a8a3e", far: "#9aa860", kind: "grass", seed: 170, zFar: 400 }, [hillL("q27", 220, "#8a9aa0", 19, 14, 3), field("q27", 50, "grass", "#7a9a4a", 21, 1.0, 60, 1)]),
    cam: (u, lt) => C(4 - lt * 5, 1.6, -9, 42), lite: { ...GOLD, rdx: -1 }, act: (A, lt, u, T) => {
      for (let i = 0; i < 4; i++) { const x = 10 - lt * 5.2 - i * 8, z = 5 + i * 3.4; tank(A, "t34", x, z, { vel: 5.2, dir: -1, dustCol: [190, 170, 120], t: lt + i }); for (let j = 0; j < 2; j++) A.a(sol(REDH, 20 + i * 2 + j), 831 + i * 2 + j, x + 0.6 - j * 1.2, z - 0.3, { mode: "sit", expr: "stern", look: -1 }, { y: 1.45 }); }
      A.over((g) => { if (T > 340.6) { const k = clamp((T - 340.6) / 0.4); g.save(); g.globalAlpha = k; g.font = `bold 64px "DejaVu Sans", sans-serif`; g.fillStyle = "#ffd0c0"; g.strokeStyle = "rgba(20,10,10,0.8)"; g.lineWidth = 8; g.textAlign = "center"; g.strokeText("◀ BERLIM", VW * 0.22, VH * 0.18); g.fillText("◀ BERLIM", VW * 0.22, VH * 0.18); g.restore(); } });
    } },
  // 53a "Enquanto isso, os Aliados preparavam" — Eisenhower talks with paratroopers on the eve
  { t0: 343.5, fade: 0.25, L: () => loc(["#2a2e4a", "#b88a72"], { near: "#4a5a3a", far: "#6a7a50", kind: "grass", seed: 172 }, [forest("q28", 60, "oak", "#2e3e2a", 22, 121, { blur: 1.6, h: 13 })]),
    cam: mv([0, 1.6, -4, 40], [0.3, 1.6, -3.4, 36]), lite: BACK, act: (A, lt) => {
      A.a(IKE, 841, -0.8, 2.2, { expr: "smile", look: 1, facing: 1, prop: ["fist", 0.4 + 0.2 * Math.sin(lt * 3)] }); for (let i = 0; i < 4; i++) A.a(v(sol(GI, 30 + i), { paint: "#1e1e1e" }), 842 + i, 0.7 + i * 1.0, 2.6 + (i % 2) * 0.6, { expr: i % 2 ? "grin" : "stern", look: -1, facing: -1 });
      plane(A, "c47", 14, 0, 30, { sc: 0.9, t: 0 });
    } },
  // 53b "uma operação gigantesca no oeste europeu." — an English harbour packed with landing craft under barrage balloons
  { t0: 345.85, fade: 0.2, L: () => loc(["#7a90b0", "#e0e2de"], { near: "#3a5060", far: "#5a7080", zFar: 500 }, [skyline("q29", 200, "#7a8090", "generic", 123, 2.5), pier("q29", 12, "#5a4a3a", 30)]),
    cam: mv([-6, 6, -14, 44, -30], [4, 6.4, -12, 44, -30]), lite: DAY, act: (A, lt) => {
      A.fx(100, (g, c) => sea(g, c, lt, { crest: "rgba(230,240,250,0.35)", z0: 13, z1: 300, n: 160, seed: 43 }));
      for (let i = 0; i < 14; i++) A.sp("higgins", -40 + (i % 7) * 12, -0.2, 30 + Math.floor(i / 7) * 14, { sc: 1 }); ship(A, "destroyer", 20, 120, {}); ship(A, "bb", -60, 180, {});
      for (let i = 0; i < 6; i++) A.fx(150, (g, c) => { const x = -60 + i * 26, y = 50 + Math.sin(lt * 0.5 + i) * 1.5, [sx, sy, s] = P(c, x, y, 150); const [, gy] = P(c, x, 0, 150); g.strokeStyle = "rgba(40,40,40,0.5)"; g.lineWidth = 1; g.beginPath(); g.moveTo(sx, sy); g.lineTo(sx, gy); g.stroke(); g.fillStyle = "#b8bcc0"; g.strokeStyle = "#241726"; g.lineWidth = 2; g.beginPath(); g.ellipse(sx, sy, 4 * s, 1.6 * s, 0, 0, 7); g.fill(); g.stroke(); });
    } },
  // 54a "Na madrugada de 6 de junho de 1944," — C-47s over Normandy at night: paratroopers jump into flak and searchlights
  { t0: 349.19, fade: 0.3, L: () => loc(["#04060e", "#1a2236"], { near: "#10141a", far: "#1a1e26", zFar: 400 }, [hillL("q30", 140, "#0e1218", 25, 8, 2)]),
    cam: (u, lt) => C(lt * 6, 26, -24, 46, 60), lite: MOON, act: (A, lt, u, T) => {
      for (let i = 0; i < 4; i++) plane(A, "c47", -40 + lt * 30 + i * 20, 34 + (i % 2) * 4, 40 + i * 8, { sc: 1 });
      for (let i = 0; i < 9; i++) para(A, sol(v(GI, { jacket: "#6a6044" }), 40 + i), 851 + i, -20 + i * 5 + lt * 6, 30 - ((lt + i * 0.4) % 4) * 4.5, 20 + (i % 3) * 4, lt + i, "#dcd8c8");
      for (let i = 0; i < 14; i++) { const at = 349.5 + i * 0.3; A.fx(60, (g, c) => flak(g, c, T - at, -30 + hash(i) * 80 + lt * 6, 26 + hash(i + 3) * 14, 60 + hash(i + 7) * 20, 2)); }
      A.light((g) => { for (let i = 0; i < 3; i++) searchlight(g, A.cam, -20 + i * 25 + lt * 6, 120, 0.3 * Math.sin(lt * 0.7 + i * 2), 0.22); });
      A.over((g) => caption(g, "6 DE JUNHO DE 1944", T - 349.9, 3.0));
    } },
  // 54b "aconteceu uma das maiores operações militares da história." — dawn armada: battleships fire broadsides
  { t0: 353.3, fade: 0.25, L: () => loc(["#3a3e5a", "#d8a88a"], { near: "#3a4658", far: "#6a6e7e", zFar: 700 }, [clouds("q31", 320, ["#e8b8a0", "#4a4e6a"], 125, 20, 80, 18, 4)]),
    cam: mv([0, 8, -40, 42], [6, 8.4, -36, 42]), lite: BACK, kicks: [[353.8, 6], [354.6, 8], [355.5, 6]], act: (A, lt, u, T) => {
      A.fx(400, (g, c) => sea(g, c, lt, { crest: "rgba(255,220,200,0.3)", z0: -40, z1: 700, n: 220, seed: 45 }));
      ship(A, "bb", 0, 140, { guns: [[T - 353.8, 52, 13], [T - 353.85, 34, 15], [T - 354.6, -48, 13], [T - 355.5, 52, 13]] });
      for (let i = 0; i < 22; i++) A.sp(i % 4 ? "higgins" : "destroyer", -300 + i * 30 + hash(i) * 10, 0, 300 + hash(i * 3) * 200, { sc: i % 4 ? 3 : 1 });
    } },
  // 55 "O Dia D." — title over the ramp of a landing craft
  { t0: 357.1, fade: 0.1, L: () => loc(["#8a96a6", "#d0d2d0"], { near: "#4a5a64", far: "#6a7a82", zFar: 300 }, [cliffs("q32", 200, "#8a8478", "#5a6a3a", 127, 14, 2.5)]),
    cam: hand(mv([0, 1.8, -5, 42], [0, 1.8, -4.6, 40]), 0.04), lite: GREY, kicks: [[357.6, 10]], act: (A, lt, u, T) => {
      A.fx(100, (g, c) => sea(g, c, lt, { crest: "rgba(240,245,250,0.5)", z0: 0, z1: 300, n: 200, seed: 47 }));
      A.sp("higgins", 0, -0.2, 6, { sc: 1.1 }); A.fx(5.9, (g, c) => splash(g, c, T - 357.6, -3, 7, 2.2, 5));
      A.over((g) => bigText(g, "O DIA D", T - 357.3, 1.5, VH * 0.36, 170));
    } },
  // 56a "Milhares de soldados aliados atravessaram o Canal da Mancha" — inside the landing craft: spray, rolling, faces
  { t0: 358.6, fade: 0.15, L: () => loc(["#8a96a6", "#c8ccd0"], { near: "#5a6060", far: "#6a7070", kind: "wood", zFar: 8 }, [wall("q33", 5.5, "#5a6458", { h: 2.4, wid: 4 })]),
    cam: (u, lt) => ({ ...C(0, 1.6 + 0.15 * Math.sin(lt * 2.2), -2.2, 44), shift: 30 * Math.sin(lt * 1.7) }), lite: GREY, act: (A, lt) => {
      for (let i = 0; i < 6; i++) { const r = Math.floor(i / 3), x = -1.2 + (i % 3) * 1.2 + r * 0.6; A.a(sol(GI, 50 + i), 861 + i, x, 1.4 + r * 1.2, { expr: ["nervous", "stern", "sad", "pained", "fear", "stern"][i] as never, crouch: 0.15, headTilt: 6 * Math.sin(lt * 2 + i), look: 0 }); }
      A.fx(1.0, (g, c) => { for (let i = 0; i < 30; i++) { const per = 1.4, k = ((lt + hash(i) * per) % per) / per, x = -3 + hash(i + 3) * 6 + k * 1.5, y = 2.6 + 1.5 * k - 4 * k * k; const [sx, sy, s] = P(c, x, y, 1.2 + hash(i) * 4); g.fillStyle = `rgba(230,240,248,${0.7 * (1 - k)})`; g.beginPath(); g.arc(sx, sy, Math.max(2, 0.04 * s), 0, 7); g.fill(); } });
      A.over((g) => { const k = 0.5 + 0.5 * Math.sin(lt * 2.2); g.fillStyle = "#3e463e"; g.fillRect(0, VH - 160 - k * 30, VW, 260); g.strokeStyle = "#141414"; g.lineWidth = 6; g.strokeRect(-10, VH - 160 - k * 30, VW + 20, 300); });
    } },
  // 56b "e desembarcaram" — the ramp drops (hinge + bounce), men surge into the surf
  { t0: 362.0, fade: 0.1, L: () => loc(["#8a96a6", "#c8c8c4"], { near: "#b8a888", far: "#c8b898", kind: "sand", seed: 174 }, [cliffs("q34", 90, "#7a7468", "#5a6a3a", 129, 16, 2)]),
    cam: hand(mv([0, 1.7, -4.4, 44], [0, 1.6, -3.4, 42]), 0.03), lite: GREY, act: (A, lt, u, T) => {
      A.fx(40, (g, c) => sea(g, c, lt, { crest: "rgba(240,245,250,0.55)", z0: 0, z1: 8, n: 120, seed: 49 }));
      const k = T - 362.3, ang = k < 0 ? 0 : Math.min(1.45, 0.5 * 9.81 * k * k / 1.2) - (k > 0.5 ? 0.12 * Math.exp(-(k - 0.5) * 5) * Math.sin((k - 0.5) * 20) : 0);
      panel(A, 1.2, (w) => { w.rect(-2.4, 0, 4.8, 2.6, w.vgrad(0, 2.6, "#4a5244", "#6a7262"), 3); for (let y = 0.3; y < 2.6; y += 0.4) w.line([[-2.2, y], [2.2, y]], 2, "rgba(0,0,0,0.25)"); }, { pivot: [0, 0], rot: 0, dy: 0, dx: 0, alpha: k < 0 ? 1 : clamp(1 - ang / 1.45) });
      A.fx(1.1, (g, c) => splash(g, c, k - 0.45, 1.8, 2.4, 1.2, 9));
      for (let i = 0; i < 6; i++) { const at = 362.8 + i * 0.2; if (T > at) A.a(sol(GI, 60 + i), 871 + i, -1.4 + (i % 3) * 1.4, 1.8 + (T - at) * 2.2 + (i % 2) * 0.4, { mode: "march", phase: ((T - at) * 2.3 + i * 0.3) % 1, expr: "shout", prop: ["rifleUp", 1] }, { y: -0.35 }); }
    } },
  // 56c "nas praias da Normandia, na França ocupada." — the wide beach: craft, smoke, bunkers on the bluff
  { t0: 363.5, fade: 0.15, L: () => loc(["#8892a2", "#d4d0c8"], { near: "#bca888", far: "#cfbea0", kind: "sand", seed: 176, zFar: 300 }, [cliffs("q35", 70, "#8a8274", "#5a6a3a", 131, 20, 1.2)]),
    cam: mv([-8, 8, -20, 46, -60], [4, 8.6, -18, 44, -70]), lite: GREY, kicks: [[364.4, 6], [365.1, 5]], act: (A, lt, u, T) => {
      A.fx(60, (g, c) => sea(g, c, lt, { crest: "rgba(240,245,250,0.5)", z0: -20, z1: 4, n: 160, seed: 51 }));
      for (let i = 0; i < 5; i++) A.sp("higgins", -20 + i * 10, -0.2, 1 + (i % 2) * 2, { sc: 1 }); for (let i = 0; i < 14; i++) runS(A, sol(GI, 70 + i), 881 + i, lt, -16 + i * 2.4, 12 + (i % 4) * 4, 2.8, { expr: "shout" });
      fall(A, sol(GI, 85), 895, -2.4, 10, T, 364.4, { dir: -1, blast: true, run: 2.8 }); A.fx(10.6, (g, c) => blast(g, c, T - 364.4, -1.6, 0, 10.6, 2.2, 95)); fall(A, sol(GI, 86), 896, 4, 14, T, 364.9, { dir: 1, run: 2.8 }); fall(A, sol(GI, 87), 897, 9, 18, T, 365.3, { dir: -1, run: 2.8 });
      for (let i = 0; i < 8; i++) A.sp("hedgehog", -18 + i * 5, 0, 9 + (i % 3) * 5, { sc: 1 }); for (const [at, x] of [[364.4, -6], [365.1, 10]] as number[][]) A.fx(30, (g, c) => blast(g, c, T - at, x, 0, 30, 3, at, { debris: 20 }));
      A.fx(66, (g, c) => { for (const x of [-30, 0, 30]) smokeCol(g, c, lt, x, 8, 66, { h: 30, w: 6, col: [70, 66, 64], a: 0.6, seed: x }); });
      A.over((g) => caption(g, "NORMANDIA · FRANÇA OCUPADA", lt - 0.3, 2.0));
    } },
  // 57a "tropas americanas," — Omaha: GIs crouch behind the shingle
  { t0: 366.23, fade: 0.2, L: () => loc(["#7a8494", "#c4c0b8"], { near: "#8a8070", far: "#a89c88", kind: "rubble", seed: 178 }, [cliffs("q36", 40, "#7a7466", "#4a5a32", 133, 18, 1.5)]),
    cam: hand(mv([0, 1.3, -4.4, 42], [0.4, 1.3, -3.8, 40]), 0.02), lite: GREY, act: (A, lt) => {
      for (let i = 0; i < 4; i++) A.a(sol(GI, 90 + i), 901 + i, -2.4 + i * 1.6, 2.6 + (i % 2) * 0.5, { expr: ["stern", "shout", "nervous", "stern"][i] as never, crouch: 0.5, look: 0 }, { y: -0.2 }); flag(A, "us", 3.8, 2.6, 3.4, 1.0, 0.65, { t: lt, wind: 1.1 });
      spurts(A, lt, 5, -4, 4, 3.6, 6, 11, [150, 140, 120]);
    } },
  // 57b "britânicas," — Gold: Tommies wade ashore below seaside villas
  { t0: 368.7, fade: 0.15, L: () => loc(["#8a9cb4", "#d8dcdc"], { near: "#c0ae8a", far: "#d4c4a2", kind: "sand", seed: 180 }, [city("q37", 40, { pal: ["#e8dcc8", "#d8c8b0", "#efe2cc"], seed: 135, roof: "gable", roofCol: "#7a4a3a", floors: [2, 3], hgt: [8, 11], blur: 1.2 })]),
    cam: (u, lt) => C(-1 + lt * 1.6, 1.5, -6, 42), lite: DAY, act: (A, lt) => { for (let i = 0; i < 5; i++) walkS(A, sol(TOMMY, 20 + i), 911 + i, lt, -5 + i * 1.6, 2.6 + (i % 2) * 0.8, 1.5, { expr: "stern" }); flag(A, "uk", 5, 3.2, 5, 1.2, 0.7, { t: lt }); } },
  // 57c "canadenses" — Juno: Canadians among the dunes
  { t0: 369.45, fade: 0.15, L: () => loc(["#7aa0c8", "#e6e8e0"], { near: "#c8b48a", far: "#dccaa0", kind: "sand", seed: 182 }, [dunes("q38", 30, "#d0bc90", 137, 4, 1), field("q38", 12, "reeds", "#9a9a5a", 139, 0.8, 30, 0.4)]),
    cam: (u, lt) => C(1 - lt * 1.4, 1.5, -5.5, 42), lite: DAY, act: (A, lt) => { for (let i = 0; i < 4; i++) walkS(A, sol(CANUK, 30 + i), 921 + i, lt, 4 - i * 1.6, 2.8 + (i % 2) * 0.6, -1.4, { expr: "stern" }); flag(A, "ca", -3.6, 3.0, 4, 1.2, 0.7, { t: lt }); } },
  // 57d "e de outras nações aliadas." — flags of the other allies over the beachhead
  { t0: 370.4, fade: 0.15, L: () => loc(["#6a98d0", "#eef0ec"], { near: "#c8b890", far: "#dccca8", kind: "sand", seed: 184 }, [clouds("q39", 280, ["#ffffff", "#a8c0d8"], 141, 30, 100, 20, 3)]),
    cam: mv([-2, 2.4, -6, 42], [2, 2.4, -6, 42]), lite: DAY, act: (A, lt) => { ["fr", "pl", "no", "nl", "au", "gr"].forEach((k, i) => flag(A, k, -6 + i * 2.4, 3.6, 4 + (i % 2), 1.4, 0.9, { t: lt + i * 0.4 })); A.a(sol(FRENCH, 6), 931, -1, 3, { expr: "grin", look: 0 }); A.a(sol(POLE, 7), 932, 1, 3.2, { expr: "stern" }); } },
  // 58a "Os soldados enfrentaram intensas defesas alemãs, metralhadoras," — inside the bunker: the MG fires, casings spill and bounce
  { t0: 372.3, fade: 0.2, L: () => loc(["#9aa0a8", "#d8d8d4"], { near: "#5a5650", far: "#6a6660", kind: "stone", seed: 186, zFar: 12 }, [{ key: "q40w", z: 3.2, x0: -6, x1: 6, y0: -1, y1: 4, ppm: 120, paint: (w) => { w.rect(-6, -1, 12, 5, w.vgrad(-1, 4, "#4a4842", "#7a766c"), 3); w.rect(-2.2, 1.0, 4.4, 0.7, "#c8ccd0", 3); } }]),
    cam: hand(mv([0.6, 1.4, -2.6, 42], [0.5, 1.4, -2.1, 40]), 0.015), lite: { ...GREY, rim: "#fff0d0" }, kicks: [[373.0, 3], [374.0, 3], [375.0, 3]], act: (A, lt, u, T) => {
      A.fx(40, (g, c) => sea(g, c, lt, { crest: "rgba(240,245,250,0.4)", z0: 30, z1: 200, n: 80, seed: 53 }));
      A.a(sol(WEH, 150), 941, -0.6, 1.4, { expr: "shout", crouch: 0.3, look: 1, facing: 1 }); A.sp("mg42", 0.2, 1.0, 1.3, { sc: 1.3 });
      if (Math.floor(lt * 30) % 3 !== 2) A.fx(1.25, (g, c) => muzzle(g, c, 1.45, 1.13, 1.3, 0.3, 1)); casings(A, lt, 0.1, 1.1, 1.2, 0, 9); for (const [k, th] of [[0, 373.2], [1, 374.4], [2, 375.7]]) fall(A, sol(GI, 152 + k), 943 + k, -2 + k * 3, 26 + k * 3, T, th, { dir: k % 2 ? 1 : -1, run: 2.6 });
    } },
  // 58b "minas" — a mine erupts in a geyser of sand
  { t0: 376.55, fade: 0.1, L: () => loc(["#8a94a2", "#d0ccc4"], { near: "#bca88a", far: "#cfbea0", kind: "sand", seed: 188 }, [cliffs("q41", 80, "#8a8274", "#5a6a3a", 143, 18, 2)]),
    cam: hand(mv([0, 1.4, -6, 42], [0, 1.4, -5.5, 40]), 0.03), lite: GREY, kicks: [[376.75, 16]], act: (A, lt, u, T) => {
      A.fx(6, (g, c) => { blast(g, c, T - 376.75, 1.0, 0, 6, 2.4, 9, { debris: 26, ring: true }); for (let i = 0; i < 30; i++) { const k = T - 376.75; if (k < 0) break; const vx = (hash(i) - 0.5) * 6, vy = 6 + hash(i + 3) * 6, y = vy * k - 4.9 * k * k; if (y < 0) continue; const [sx, sy, s] = P(c, 1 + vx * k, y, 6); puff(g, sx, sy, (0.3 + k) * s, [200, 180, 140], 0.8 * clamp(1 - k / 2)); } });
      A.sp("hedgehog", -3, 0, 5); fall(A, sol(GI, 100), 951, 1.4, 6.2, T, 376.75, { dir: -1, blast: true, run: 2.2 }); A.fx(4, (g, c) => { const k = T - 376.75; if (k > 0.1) scorch(g, c, 1, 6, 1.6, 0.6); });
    } },
  // 58c "e obstáculos construídos nas praias." — Czech hedgehogs at low tide; men shelter behind the steel
  { t0: 377.15, fade: 0.15, L: () => loc(["#7a8494", "#c8c4bc"], { near: "#b8a484", far: "#c8b898", kind: "sand", seed: 190, zFar: 200 }, [cliffs("q42", 60, "#7a7468", "#4a5a32", 145, 16, 1.2)]),
    cam: mv([-3, 1.2, -5, 42], [1, 1.2, -5, 42]), lite: GREY, act: (A, lt) => {
      for (let i = 0; i < 10; i++) A.sp("hedgehog", -10 + i * 2.6, 0, 3 + (i % 3) * 3, { sc: 1.1 }); for (let i = 0; i < 3; i++) A.a(sol(GI, 110 + i), 961 + i, -2.7 + i * 5.2, 3.6, { expr: "nervous", crouch: 0.6, look: 1 });
      spurts(A, lt, 6, -8, 8, 2, 8, 13, [160, 146, 120]);
    } },
  // 59a "Mesmo diante das enormes perdas," — a medic kneels by a wounded man; the tide laps in
  { t0: 379.6, fade: 0.25, L: () => loc(["#6a7080", "#b4b0a8"], { near: "#9a8a70", far: "#b0a088", kind: "sand", seed: 192 }, [cliffs("q43", 50, "#6a645a", "#3e4a2e", 147, 14, 1.4)]),
    cam: mv([0, 1.1, -3, 38], [0, 1.1, -2.5, 34]), lite: GREY, act: (A, lt) => {
      A.a(MEDIC, 971, -0.4, 2, { expr: "sad", crouch: 0.7, look: 1, headTilt: 12 }); A.a(sol(GI, 120, false), 972, 0.7, 2.1, { mode: "sit", expr: "pained", look: -1, facing: -1 }, { y: 0.05 }); A.sp("helmetUS", 1.7, 0, 2.2, { rot: 0.4 });
      A.fx(6, (g, c) => sea(g, c, lt, { crest: "rgba(230,236,240,0.5)", z0: 5, z1: 40, n: 50, seed: 55 }));
    } },
  // 59b "conseguiram estabelecer posições" — atop the bluff: a machine-gun nest dug in, the flag goes up
  { t0: 382.2, fade: 0.2, L: () => loc(["#7aa0cc", "#e8e8e0"], { near: "#6a7a40", far: "#8a9a58", kind: "grass", seed: 194, zFar: 300 }, [clouds("q44", 260, ["#ffffff", "#a0b8d0"], 149, 30, 100, 16, 3)]),
    cam: mv([0, 1.4, -4.4, 40], [0.4, 1.5, -3.8, 36]), lite: DAY, act: (A, lt) => {
      A.fx(100, (g, c) => sea(g, c, lt, { crest: "rgba(240,248,255,0.5)", glitter: [20, "255,255,240"], z0: 60, z1: 400, n: 100, seed: 57 }));
      A.a(sol(GI, 130), 981, -1, 2.2, { expr: "stern", crouch: 0.6, look: 1 }, { y: -0.3 }); A.sp("mg42", -0.4, 0.3, 2.1, { sc: 1 }); const up = smooth(clamp((lt - 0.4) / 1.4)); A.a(sol(GI, 131), 982, 1.4, 2.6, { expr: "grin", look: 0, prop: ["fist", 0.6 + 0.3 * up] });
      A.sp("flagpole", 1.9, 0, 2.7, { sc: 0.4 }); flag(A, "us", 1.92, 1.3 + up * 1.6, 2.69, 0.9, 0.6, { pole: false, t: lt });
    } },
  // 59c "e iniciar a libertação da França." — a village cheers the jeep; flowers fly through the air
  { t0: 384.5, fade: 0.2, L: () => loc(["#6aa0dc", "#f2eee0"], { near: "#b0a088", far: "#c8b89c", kind: "cobble", seed: 196 }, [city("q45", 16, { pal: ["#efe2c4", "#e6d0a8", "#f2d8c0", "#e0d8b8"], seed: 151, roof: "gable", roofCol: "#a84a3a", floors: [2, 3], hgt: [8, 10], shutter: "#3a6a8a" })]),
    cam: (u, lt) => C(-1 + lt * 1.4, 1.6, -5, 42), lite: NOON, act: (A, lt) => {
      A.sp("jeep", -2 + lt * 1.5, 0, 3, { sc: 1.1 }); for (let i = 0; i < 2; i++) A.a(sol(GI, 140 + i), 991 + i, -2.4 + lt * 1.5 + i * 0.8, 3.1, { mode: "sit", expr: "laugh", wave: Math.sin(lt * 6 + i) }, { y: 0.45 });
      crowd(A, 10, -6, 8, 4.4, 6.2, 153, (i) => ({ expr: i % 2 ? "laugh" : "grin", wave: Math.sin(lt * 6 + i) }), (i) => civ(i, 153)); flag(A, "fr", 6, 4.6, 5.6, 1.3, 0.85, { t: lt });
      A.fx(2.0, (g, c) => flutter(g, c, lt, { n: 50, x0: -6, x1: 8, z0: 1.5, z1: 5, top: 5, cols: ["#e83a4a", "#f2d22a", "#f4f0f0", "#e86a9a", "#6a3aa8"], size: 0.1, fall: 0.7, wind: 0.2, loop: true, seed: 33 }));
    } },
  // 60 "Com os soviéticos avançando pelo leste e os Aliados pelo oeste," — teal map: two fronts close the vice on Germany
  { t0: 386.42, fade: 0.25, L: () => europe("q46", ST.teal), cam: mv([2, 1.5, -34, 40], [2, 1.5, -30, 40]), act: (A, lt, u, T) => {
      hl(A, "GER", 1, "#3a3a3a", 0.6); arrow(A, [30, 53], [17, 52.5], (T - 387.2) / 1.6, "#c0281e", 0.42); arrow(A, [27, 48.6], [17.5, 49], (T - 387.6) / 1.6, "#c0281e", 0.36);
      arrow(A, [-1, 48.5], [6.5, 50.4], (T - 388.8) / 1.5, "#2a6ac0", 0.42); arrow(A, [10, 44.5], [11, 47.4], (T - 389.2) / 1.5, "#2a6ac0", 0.34);
      A.fx(-0.1, (g, c) => { const k = clamp((T - 391.8) / 1.0); if (k <= 0) return; const [sx, sy, s] = P(c, MX(10.5), MY(51), 0); g.save(); g.globalAlpha = 0.4 * k; g.strokeStyle = "#ff4a3a"; g.lineWidth = 6; for (let r = 0; r < 3; r++) { g.beginPath(); g.arc(sx, sy, (3.4 - r * 0.6 - k * 0.8) * s, 0, 7); g.stroke(); } g.restore(); });
    } },
  // 61 "O fim do regime nazista estava cada vez mais próximo." — a great banner burns and tears free, falling down the façade
  { t0: 394.15, fade: 0.25, L: () => loc(["#0a0a14", "#3a1c1a"], { near: "#2a2420", far: "#3a2e28", kind: "rubble", seed: 198 }, [wall("q47", 8, "#6a5a4e", { h: 16, wid: 12, win: 3, winCol: "#1a1412" })]),
    cam: mv([0, 4, -8, 44, 60], [0, 3.6, -7, 42, 40]), lite: NIGHTFIRE, bloom: 0.9, act: (A, lt, u, T) => {
      const k = Math.max(0, T - 395.4), y = k > 0 ? Math.max(-6, -0.5 * 9.81 * 0.35 * k * k) : 0, sw = Math.sin(k * 3) * 0.15 * Math.min(1, k);
      panel(A, 7.9, (w) => { const burn = clamp(lt / 2.6); w.rect(-1.6, 3 + burn * 2.5, 3.2, 10 - burn * 2.5, w.vgrad(3, 13, "#6a1410", "#b3221c"), 3); w.ell(0, 10.2, 1.0, 1.0, "#f4efe6", 2); w.poly([[-0.7, 10.3], [0, 10.7], [0.7, 10.3], [0, 9.6]], "#1a1414", 0); }, { dy: y, pivot: [0, 13], rot: sw });
      A.fx(7.8, (g, c) => { const burn = clamp(lt / 2.6); for (let i = 0; i < 5; i++) fire(g, c, lt, -1.4 + i * 0.7, 3 + burn * 2.5 + y, 7.8, 0.6, i); embers(g, c, lt, 0, 7.8, 4, 30, 14, 3); });
    } },
  // 62a "Em 1945, as tropas soviéticas chegaram" — Katyushas ripple-fire into the night
  { t0: 398.31, fade: 0.25, L: () => loc(["#06060e", "#24182a"], { near: "#1a1a1e", far: "#24242a", kind: "mud", seed: 200 }, [hillL("q48", 100, "#121216", 27, 6, 1.5)]),
    cam: mv([-2, 1.6, -9, 42], [0, 1.7, -8, 40]), lite: NIGHTFIRE, bloom: 0.95, act: (A, lt) => {
      for (let i = 0; i < 2; i++) { const x = -4 + i * 7, z = 4 + i * 2; A.sp("katyusha", x, 0, z, { sc: 1 }); A.fx(z - 0.05, (g, c) => { for (let j = 0; j < 8; j++) { const k = ((lt * 1.6 + j / 8 + i * 0.3) % 1.4); if (k > 1) continue; const px = x - 1 + k * 30, py = 2.4 + k * 26; const [sx, sy, s] = P(c, px, py, z); exhaust(g, sx, sy, s * 0.5, Math.PI + Math.atan2(-26, 30) * -1, 3, lt); glow(g, sx, sy, 2 * s, "rgba(255,200,120,1)", 0.6); } }); }
      A.over((g) => caption(g, "ABRIL DE 1945", lt - 0.4, 2.6));
    } },
  // 62b "a Berlim." — Soviet soldiers before the Brandenburg Gate in the smoke
  { t0: 401.55, fade: 0.2, L: () => loc(["#5a4a4a", "#c08a6a"], { near: "#5a4a40", far: "#7a6454", kind: "rubble", seed: 202 }, [{ key: "q49g", z: 50, x0: -24, x1: 24, y0: -1, y1: 30, ppm: 12, blur: 1.2, paint: (w) => { const c = "#8a7a6a"; w.rect(-20, 0, 40, 18, w.vgrad(0, 18, "#6a5a4e", c), 3); for (let k = 0; k < 6; k++) w.rect(-19 + k * 7.2, 0, 3.6, 15, "#2a2220", 2); w.rect(-21, 18, 42, 3.6, c, 3); w.rect(-6, 21.6, 12, 3, c, 2.5); } }, ruins("q49", 20, ["#6a5a4c", "#5a4c40"], 155, { hgt: [6, 12] })]),
    cam: mv([0, 1.8, -7, 42, -20], [0, 1.9, -6, 40, -30]), lite: GOLD, act: (A, lt) => {
      for (let i = 0; i < 4; i++) A.a(sol(REDH, 40 + i), 1001 + i, -3.6 + i * 2.4, 3 + (i % 2), { expr: i % 2 ? "grin" : "stern", look: 0 }); flag(A, "su", 3.8, 4.2, 4.4, 1.4, 0.9, { t: lt });
      A.fx(45, (g, c) => { for (const x of [-20, 18]) smokeCol(g, c, lt, x, 4, 45, { h: 40, w: 8, col: [50, 40, 40], a: 0.6, seed: x }); });
    } },
  // 63a "A capital alemã estava cercada e os combates aconteciam" — a T-34 grinds down a ruined avenue, infantry in its lee
  { t0: 403.1, fade: 0.2, L: () => loc(["#6a6266", "#b0a296"], { near: "#5a5048", far: "#7a6c5e", kind: "rubble", seed: 204 }, [ruins("q50", 12, ["#7a6a5e", "#6a5c50"], 157, { hgt: [10, 16], x0: -40, x1: -6 }), ruins("q50b", 12.5, ["#84705e", "#705e50"], 159, { hgt: [10, 16], x0: 6, x1: 40 }), ruins("q50c", 60, ["#5a5048"], 161, { hgt: [12, 22], blur: 2 })]),
    cam: hand(mv([0, 1.6, -6, 44], [0, 1.6, -5, 42]), 0.02), lite: GREY, kicks: [[405.6, 10]], act: (A, lt, u, T) => {
      tank(A, "t34", 0, 14 - lt * 1.5, { vel: 0, fire: T - 405.6 }); for (let i = 0; i < 3; i++) A.a(sol(REDH, 50 + i), 1011 + i, -2.8 + i * 0.9, 10 - lt * 1.4 + i * 0.6, { mode: "march", phase: (lt * 1.2 + i * 0.3) % 1, expr: "stern" });
      A.fx(13, (g, c) => blast(g, c, T - 406.2, 3, 4, 40, 5, 17));
    } },
  // 63b "nas próprias ruas da cidade." — close-quarters: muzzle flashes across a barricade
  { t0: 406.0, fade: 0.1, L: () => loc(["#4a4246", "#8a7a70"], { near: "#4a4038", far: "#5a4e44", kind: "rubble", seed: 206 }, [ruins("q51", 16, ["#5e5048", "#524640"], 163, { hgt: [8, 14] })]),
    cam: hand(mv([0, 1.3, -4, 42], [0, 1.3, -3.6, 40]), 0.025), lite: NIGHTFIRE, act: (A, lt, u, T) => {
      panel(A, 2.4, (w) => { for (let i = 0; i < 10; i++) w.poly([[-4 + i * 0.8, 0], [-3.4 + i * 0.8, 0], [-3.6 + i * 0.8, 0.6 + (i % 3) * 0.2], [-3.9 + i * 0.8, 0.5]], ["#5a4a3e", "#6a5848", "#4a3e34"][i % 3], 2); });
      A.a(sol(REDH, 60), 1021, -1.5, 2.6, { expr: "shout", crouch: 0.4, prop: ["rifleUp", 1] }, { y: -0.2 }); fall(A, sol(WEH, 160), 1022, 2.4, 6, T, 407.2, { dir: 1, expr: "fear" });
      for (const t of [0.3, 0.9, 1.5]) if (lt > t && lt < t + 0.07) A.fx(2.5, (g, c) => muzzle(g, c, -1.0, 1.6, 2.5, 0.4, 1)); for (const t of [0.6, 1.3]) if (lt > t && lt < t + 0.07) A.fx(5.9, (g, c) => muzzle(g, c, 2.0, 1.4, 5.9, 0.3, -1));
    } },
  // 64a "O exército alemão estava praticamente destruído," — old men and boys of the last levy, exhausted in the rubble
  { t0: 408.5, fade: 0.25, L: () => loc(["#4a4650", "#9a8a80"], { near: "#5a5048", far: "#6a5e54", kind: "rubble", seed: 208 }, [ruins("q52", 14, ["#6a5c52", "#5c5048"], 165, { hgt: [7, 12] })]),
    cam: mv([0, 1.4, -4, 40], [0.3, 1.4, -3.4, 36]), lite: GREY, act: (A, lt) => {
      A.a(VOLKS, 1031, -1.4, 2.2, { mode: "sit", expr: "sad", headTilt: 10 }, { y: 0.1 }); A.a(HJ, 1032, 0.4, 2.0, { expr: "fear", look: -1, ...idle(lt, 1032) }); A.a(v(VOLKS, { hair: "#a8a49c", moustache: undefined, hat: "cap", cap: "#2a2a2a" }), 1033, 1.8, 2.6, { expr: "sad", look: -1, facing: -1 });
      A.sp("helmetG", -0.4, 0, 1.6, { rot: 0.6 });
    } },
  // 64b "e Hitler permanecia escondido em um bunker subterrâneo." — the bunker: bulbs flicker, dust sifts down at each impact
  { t0: 411.8, fade: 0.25, L: () => loc(undefined, { near: "#3e3a34", far: "#4a4640", kind: "stone", seed: 210, zFar: 16 }, [wall("q53", 3.4, "#6a665c", { h: 3, wid: 8, pipes: true })], true),
    cam: mv([0, 1.5, -3.2, 40], [0, 1.45, -2.6, 36]), lite: { ...LAMP, rim: "#ffe0a0", key: "#c8b8a0" }, kicks: [[412.6, 4], [413.8, 5]], act: (A, lt, u, T) => {
      const fl = (T > 412.6 && T < 412.8) || (T > 413.8 && T < 414.0) ? 0.5 : 0; A.a(HIT_OLD, 1041, 0, 2.2, { mode: "sit", expr: "nervous", headTilt: 8 + 2 * Math.sin(lt * 20), look: 0 }, { y: 0.15 }); A.sp("desk", 0, 0, 1.7, { sc: 0.9 });
      A.light((g) => { const [sx, sy, s] = P(A.cam, 0, 2.8, 2.5); g.strokeStyle = "#141414"; g.lineWidth = 2; g.beginPath(); g.moveTo(sx, 0); g.lineTo(sx, sy); g.stroke(); glow(g, sx, sy, 3 * s, "rgba(255,220,160,1)", 0.7 - fl); tint(g, "#000", fl * 0.6, "multiply"); });
      A.fx(1.5, (g, c) => { for (const at of [412.6, 413.8]) { const k = T - at; if (k < 0 || k > 2) continue; for (let i = 0; i < 40; i++) { const [sx, sy, s] = P(c, -2 + hash(i + at) * 4, 3 - k * k * 2.5 - hash(i) * 0.3, 1.6 + hash(i * 3) * 2); g.fillStyle = `rgba(200,190,170,${0.7 * (1 - k / 2)})`; g.fillRect(sx, sy, Math.max(1.5, 0.015 * s), Math.max(1.5, 0.015 * s)); } } });
    } },
];
void STAMP;
