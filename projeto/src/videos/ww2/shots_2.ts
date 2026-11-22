// 105.9 – 254 s: persecution, expansion, Munich, invasion of Poland, Blitzkrieg, fall of France, Battle of Britain, Barbarossa, the Russian winter.
import { VW, VH, P, glow, fire, smokeCol, puff, tint, clamp, lerp, smooth, easeOut, easeIn, hash, rays, sun, beam, muzzle } from "./engine";
import { Sc, C, mv, path, hand, walkF, walkS, runS, marchF, marchCol, crowd, tank, plane, planeTop, ship, flag, signing, hl, arrow, pin, panel, caption, bigText, counter, frontLine,
  civ, kid, sol, v, idle, HIT_CIV, HIT_BROWN, HIT_GREY, HIT_CAP, STALIN, STALIN_CAP, CHURCHILL, CHAMBER, MOLOTOV, RIBB, WEH, RED, REDH, REDW, TOMMY, RAF, LUFT, GESTAPO, SA, SSOFF, POLE, FRENCH, SAILOR_B } from "./kit";
import { blast, scorch, rubble, embers, flutter, sparks, searchlight, lensFlare, glint, shards, birds, breath, dust, lightning, exhaust, trail, flak, sea, wake, splash, bounce, spring } from "./fx";
import { loc, mtn, hillL, clouds, city, skyline, forest, wall, banners, ruins, field, wire, pier, cliffs, europe, ST, MX, MY, facade, church, mix, shade } from "./places";
import { DAY, GOLD, BACK, GREY, NIGHTFIRE, MOON, LAMP, COLD, NOON, RED as REDL } from "./looks";
import type { Shot } from "./types";
import type { Ctx } from "./engine";

const bomb = (g: Ctx, sx: number, sy: number, s: number, ang: number) => { g.save(); g.translate(sx, sy); g.rotate(ang); g.fillStyle = "#2a2a2a"; g.strokeStyle = "#141414"; g.lineWidth = 1.5; g.beginPath(); g.ellipse(0, 0, 0.9 * s, 0.22 * s, 0, 0, 7); g.fill(); g.stroke(); g.fillRect(-1.1 * s, -0.25 * s, 0.25 * s, 0.5 * s); g.restore(); };
/** a bomb released at (x0,y0,z) at time at with forward speed vx: falls ballistically, nose tips into the velocity */
const dropBomb = (A: Sc, T: number, at: number, x0: number, y0: number, z: number, vx: number) => A.fx(z, (g, c) => { const k = T - at; if (k < 0) return; const y = y0 - 0.5 * 9.81 * k * k; if (y < 0) return; const [sx, sy, s] = P(c, x0 + vx * k, y, z); bomb(g, sx, sy, Math.max(1.5, s), Math.atan2(9.81 * k, vx)); });
const STAMP = (g: Ctx, txt: string, k: number, x: number, y: number, col = "#c42a22", size = 72) => { if (k <= 0) return; const e = easeOut(clamp(k / 0.2)); g.save(); g.translate(x, y); g.rotate(-0.13); g.scale(2.2 - 1.2 * e, 2.2 - 1.2 * e); g.globalAlpha = 0.9 * e; g.font = `bold ${size}px "DejaVu Sans", sans-serif`; const w = g.measureText(txt).width; g.strokeStyle = col; g.lineWidth = size * 0.12; g.strokeRect(-w / 2 - 30, -size * 0.8, w + 60, size * 1.6); g.fillStyle = col; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(txt, 0, 4); g.restore(); };

export const SHOTS_2: Shot[] = [
  // 14a "O regime nazista passou a perseguir opositores," — night arrest, headlights
  { t0: 105.87, fade: 0.2, L: () => loc(["#070a14", "#1a2234"], { near: "#20242a", far: "#2a2e36", kind: "cobble", seed: 80 }, [city("p0", 14, { pal: ["#4a4650", "#3e3a44", "#544e58"], seed: 70, lit: 0.3, floors: [3, 4], hgt: [11, 13], roof: "gable", roofCol: "#2a2630", shutter: "#2a3a3a" })]),
    cam: mv([-1.5, 1.5, -5, 40], [-0.5, 1.5, -4.2, 38]), lite: MOON, act: (A, lt, u, T) => {
      A.sp("staff", 3.8, 0, 4.5, { flip: true, sc: 1.1 }); A.light((g) => { for (const dz of [0, 0.3]) beam(g, A.cam, 1.1, 0.95, 4.5 + dz, Math.PI + 0.06, 9, 1.0, 0.28, "255,240,200"); });
      const drag = clamp((T - 107.45) / 2.5); A.a(v(civ(3, 40), { hat: "hair", tie: undefined }), 261, lerp(-1.6, 0.4, drag), 3.0, { expr: "fear", look: -1, armB: 1, mode: drag > 0 && drag < 1 ? "stroll" : "stand", phase: (lt * 1.3) % 1 });
      A.a(GESTAPO, 262, lerp(-2.4, -0.4, drag), 3.2, { expr: "stern", look: 1, mode: drag > 0 && drag < 1 ? "stroll" : "stand", phase: (lt * 1.3 + 0.5) % 1 }); A.a(v(GESTAPO, { cap: "#2a2a2a", jacket: "#24222a" }), 263, lerp(-0.6, 1.4, drag), 3.3, { expr: "stern", look: -1, facing: -1, mode: drag > 0 && drag < 1 ? "stroll" : "stand", phase: (lt * 1.3 + 0.2) % 1 });
      A.a(v(civ(1, 40), { hat: "headscarf", cap: "#6a5a7a" }), 264, -4.2, 4.0, { expr: "shock", look: 1, armB: 1 }, { y: 2.2 }); A.light((g) => { const [sx, sy, s] = P(A.cam, -4.2, 3.4, 4.05); glow(g, sx, sy, 1.6 * s, "rgba(255,200,120,1)", 0.6); });
    } },
  // 14b "eliminar liberdades" — book burning: books thrown in ballistic arcs into the bonfire, pages fly up
  { t0: 108.95, fade: 0.15, L: () => loc(["#0e0a12", "#3a1e1a"], { near: "#3a2e28", far: "#4a3a30", kind: "cobble", seed: 82 }, [city("p1", 20, { pal: ["#6a5a50", "#5e5048", "#74645a"], seed: 72, lit: 0.2, floors: [4, 5], hgt: [14, 18], roof: "hip", roofCol: "#3a2a26", blur: 1.2 })]),
    cam: mv([0, 1.7, -6, 40], [0, 1.8, -5, 38]), lite: NIGHTFIRE, bloom: 0.9, act: (A, lt, u, T) => {
      A.fx(4, (g, c) => { fire(g, c, lt, 0, 0, 4, 1.6, 3); fire(g, c, lt, 0.8, 0, 4.2, 1.2, 5); fire(g, c, lt, -0.7, 0, 4.1, 1.3, 7); embers(g, c, lt, 0, 4, 3, 50, 7, 3); smokeCol(g, c, lt, 0, 2.5, 4.5, { h: 14, w: 2, col: [40, 32, 30], a: 0.55 }); });
      A.fx(3.9, (g, c) => flutter(g, c, lt, { n: 18, x0: -2, x1: 2, z0: 3, z1: 5, top: 6, cols: ["#f4ead0", "#e0d0b0"], size: 0.14, fall: 0.6, wind: 0.2, loop: true, seed: 21 }));
      for (let i = 0; i < 5; i++) { const at = 0.2 + i * 0.6, x0 = i % 2 ? -3 : 3, k = (lt - at) % 3; if (k < 0 || k > 0.9) continue; A.fx(3.95, (g, c) => { const x = lerp(x0, 0, k / 0.9), y = 1.6 + 3.5 * (k / 0.9) - 4.9 * (k * 1.0) ** 2 * 1.1; const [sx, sy, s] = P(c, x, Math.max(0.3, y), 4); g.save(); g.translate(sx, sy); g.rotate(k * 9); g.fillStyle = ["#7a2a22", "#2a4a6a", "#5a3a22"][i % 3]; g.fillRect(-0.18 * s, -0.12 * s, 0.36 * s, 0.24 * s); g.fillStyle = "#f2e8d0"; g.fillRect(-0.15 * s, -0.1 * s, 0.3 * s, 0.05 * s); g.restore(); }); }
      crowd(A, 10, -6, 6, 2.0, 6.5, 41, (i) => ({ expr: i % 3 ? "shout" : "stern", prop: i % 4 === 0 ? ["book", 0] : undefined }), (i) => (i % 2 ? v(SA, { cap: "#5a4a2a" }) : civ(i, 41)), { dark: 0.45, darkCol: "#2a1208" });
    } },
  // 14c "e promover uma ideologia racista e antissemita." — a shop window shatters; shards glint on the cobbles
  { t0: 111.25, fade: 0.15, L: () => loc(["#05060c", "#141a28"], { near: "#22242a", far: "#2e3036", kind: "cobble", seed: 84 }, [wall("p2", 3.6, "#5a5048", { h: 5, wid: 10 })]),
    cam: mv([0.6, 1.6, -6.4, 42], [0.6, 1.55, -5.6, 40]), lite: MOON, kicks: [[111.9, 6]], act: (A, lt, u, T) => {
      const br = T > 111.9; panel(A, 3.55, (w) => { w.rect(-2.6, 0.5, 5.2, 2.6, br ? "#3a2c22" : "rgba(170,200,215,0.55)", 3); if (br) for (let k = 0; k < 3; k++) w.rect(-2.4, 0.9 + k * 0.7, 4.8, 0.08, "#6a4a2a", 1.5); if (!br) w.line([[-2.2, 2.9], [-1.2, 0.8]], 3, "rgba(255,255,255,0.4)"); else for (let k = 0; k < 9; k++) { const a = k * 0.7; w.poly([[-2.6 + k * 0.6, 3.1], [-2.3 + k * 0.6, 2.7 - (k % 3) * 0.3], [-2.0 + k * 0.6, 3.1]], "rgba(170,200,215,0.5)", 1.5); void a; }
        w.rect(-2.8, 3.1, 5.6, 0.7, "#3a5a4a", 2.5); w.text("BÄCKEREI · GOLDBERG", 0, 3.45, 0.32, "#e8d8a0"); w.rect(2.8, 0, 1.4, 3.2, "#4a3020", 2.5); });
      A.fx(3.4, (g, c) => shards(g, c, T - 111.9, 0, 1.6, 3.5, 5, 2.4, 6, 60));
      A.a(v(civ(0, 44), { hat: "homburg", beard: "#4a4a4a", moustache: "#4a4a4a", glasses: true }), 271, 3.5, 3.2, { expr: br ? "shock" : "sad", look: -1, facing: -1, armB: br ? 1 : 0 });
      A.light((g) => { const [sx, sy, s] = P(A.cam, 3.5, 2.6, 3.3); glow(g, sx, sy, 2.5 * s, "rgba(255,200,130,1)", 0.5); });
    } },
  // 15a "Enquanto isso, Hitler começou a expandir o território alemão" — troops march across a Rhine bridge, cathedral silhouette
  { t0: 114.11, fade: 0.25, L: () => loc(["#5a7ab0", "#e8dcc4"], { near: "#5a6a7a", far: "#8a9aa8", zFar: 400 }, [skyline("p3", 160, "#7a8090", "generic", 11, 2), mtn("p3", 300, "#8a96aa", 14, 40, false, 3),
      { key: "p3c", z: 120, x0: -20, x1: 0, y0: -1, y1: 60, ppm: 6, blur: 1.5, paint: (w) => { const col = "#6a6a74"; for (const dx of [-14, -6]) { w.rect(dx - 2.5, 0, 5, 40, col, 2.5); w.poly([[dx - 2.8, 40], [dx + 2.8, 40], [dx, 56]], col, 2.5); } w.rect(-14, 0, 10, 24, col, 2.5); } }]),
    cam: mv([-6, 2.8, -10, 44, -50], [2, 3.0, -9, 42, -60]), lite: DAY, act: (A, lt) => {
      A.fx(30, (g, c) => sea(g, c, lt, { crest: "rgba(220,235,245,0.4)", glitter: [10, "255,250,230"], z0: 6, z1: 300, n: 160, seed: 3 }));
      panel(A, 5.2, (w) => { w.rect(-30, 0.9, 60, 0.5, "#8a7e70", 3); for (let x = -28; x < 30; x += 1.6) w.rect(x, 1.4, 0.12, 0.9, "#6a6058", 1.5); w.line([[-30, 2.3], [30, 2.3]], 4, "#6a6058"); for (let x = -24; x < 30; x += 12) w.rect(x - 1, -6, 2, 6.9, "#7a7064", 3); });
      marchCol(A, (i) => sol(WEH, i + 5), lt, 12, 4, 5.0, 1.4, 1.3, 1, 1, { y: 1.4 }, { expr: "stern" }, 280);
      A.over((g) => caption(g, "RENÂNIA · 1936", lt - 0.4, 3.0));
    } },
  // 15b "e a desafiar os acordos internacionais." — Hitler tears the treaty; the halves flutter down
  { t0: 117.85, fade: 0.15, L: () => loc(undefined, { near: "#3a2a24", far: "#4a3a2e", kind: "wood", zFar: 10 }, [wall("p4", 3.4, "#6a5a4e", { h: 5, wid: 10, frames: 2, panel: "#3a2a1e", curtain: "#5a2020", win: 1, winCol: "#c8d8e4" })], true),
    cam: mv([0, 1.6, -2.4, 38], [0, 1.65, -1.8, 34]), lite: LAMP, act: (A, lt, u, T) => {
      const tear = T - 118.65; A.a(HIT_BROWN, 291, 0, 1.7, { expr: tear > 0 ? "grin" : "stern", look: 0, prop: tear < 0 ? ["paper", 0] : ["fist", 0.6] }, {});
      A.fx(1.6, (g, c) => { if (tear < 0) return; for (const sd of [-1, 1]) { const k = tear, x = sd * (0.25 + 0.6 * k), y = 1.25 + Math.max(-1.1, 0.8 * k - 0.6 * k * k) + Math.sin(k * 5 + sd) * 0.05; const [sx, sy, s] = P(c, x, Math.max(0.05, y), 1.55); g.save(); g.translate(sx, sy); g.rotate(sd * (0.3 + k * 1.4) + Math.sin(k * 6) * 0.2);
        g.fillStyle = "#f2ead2"; g.strokeStyle = "#241726"; g.lineWidth = 2; g.beginPath(); g.moveTo(-0.2 * s, -0.28 * s); g.lineTo(0.2 * s, -0.28 * s); for (let j = 0; j <= 6; j++) g.lineTo((0.2 - (j % 2) * 0.04) * s, (-0.28 + j * 0.093) * s); g.lineTo(-0.2 * s, 0.28 * s); g.closePath(); g.fill(); g.stroke();
        g.fillStyle = "#3a2a1a"; for (let j = 0; j < 5; j++) g.fillRect(-0.15 * s, (-0.2 + j * 0.08) * s, 0.26 * s, 0.012 * s); g.restore(); } });
    } },
  // 16a "Em 1938, anexou a Áustria" — an alpine village: armoured cars roll in under the mountains
  { t0: 120.74, fade: 0.25, L: () => loc(["#4a86c8", "#e6eef2"], { near: "#9a8a70", far: "#b8a888", kind: "cobble", seed: 86 }, [mtn("p5", 260, "#6a7e9a", 18, 110, true, 2.5), hillL("p5", 70, "#6a9a4a", 3, 14, 1.2), city("p5", 24, { pal: ["#efe0bc", "#e6c890", "#f2c8a4", "#d8d8a8"], seed: 81, roof: "gable", roofCol: "#a84a3a", floors: [2, 3], hgt: [8, 11], shutter: "#4f7a52", gap: [-4, 4] })]),
    cam: mv([0, 1.8, -8, 42], [1, 1.9, -7, 40]), lite: DAY, act: (A, lt, u, T) => {
      A.sp("staff", 10 - Math.max(0, T - 121.2) * 2.6, 0, 9, { flip: true, sc: 1.1 }); marchCol(A, (i) => sol(v(WEH, { hat: "peaked", cap: "#5e6458", rifle: false }), i), lt, 5, 6, 11, -1.3, 1.3, 1, 1, {}, { expr: "stern" }, 300);
      crowd(A, 10, -9, -2, 2.6, 6, 47, (i) => ({ expr: i % 3 ? "grin" : "nervous", wave: i % 2 ? Math.sin(lt * 6 + i) : undefined }), (i) => civ(i, 47));
      A.over((g) => caption(g, "MARÇO DE 1938 · ÁUSTRIA", T - 121.0, 3.2));
    } },
  // 16b "e, posteriormente, ocupou parte da Tchecoslováquia." — olive map, Austria then the Sudetenland fill
  { t0: 124.0, fade: 0.2, L: () => europe("p6", ST.olive), cam: mv([0, 0.6, -13, 40], [1.2, 0.2, -11, 38]), act: (A, lt, u, T) => {
      hl(A, "GER", 1, "#4a4a3a", 0.55); hl(A, "AUT", 1, "#8a1e16", 0.7); hl(A, "CZE", (T - 125.6) / 0.6, "#b0281e", 0.7); arrow(A, [12.6, 51.2], [15.5, 50.2], (T - 124.75) / 0.8, "#8a1e16", 0.28);
    } },
  // 17a "As outras potências europeias tentaram evitar um novo conflito," — Chamberlain waves the paper at the airfield
  { t0: 127.61, fade: 0.2, L: () => loc(["#7a8ea8", "#d4d6d2"], { near: "#6a7458", far: "#8a9474", kind: "grass", seed: 88 }, [clouds("p7", 260, ["#f0f0ec", "#7a8494"], 5, 30, 90, 22, 4), forest("p7", 80, "oak", "#4a6a3a", 26, 6, { blur: 2, h: 14 })]),
    cam: mv([0.5, 1.6, -5, 40], [0, 1.6, -4.0, 36]), lite: GREY, wx: undefined, act: (A, lt, u, T) => {
      panel(A, 14, (w) => { w.poly([[-2, 0], [14, 0], [14, 6], [6, 8.5], [-2, 6]], w.vgrad(0, 8, "#5a5e62", "#8a8e92"), 3); w.rect(2, 0, 8, 5, "#2a2c30", 2.5); }); const gone = T > 131.75;
      A.a(CHAMBER, 311, 0, 2.2, { expr: gone ? "shock" : "smile", look: gone ? 1 : 0, prop: gone ? ["fist", 0.6] : ["paper", 0], wave: gone ? undefined : 0.3 * Math.sin(lt * 3) });
      crowd(A, 8, -6, 6, 3.4, 6, 51, (i) => ({ expr: gone ? "nervous" : "grin", wave: !gone && i % 2 ? Math.sin(lt * 5 + i) : undefined }), (i) => civ(i, 51));
      A.fx(2.0, (g, c) => { if (!gone) return; const k = T - 131.75, x = 0.4 + k * 2.2 + Math.sin(k * 4) * 0.3, y = 1.4 + k * 0.9 - 0.1 * k * k; const [sx, sy, s] = P(c, x, y, 2.0); g.save(); g.translate(sx, sy); g.rotate(k * 3); g.scale(1, Math.abs(Math.cos(k * 5)) + 0.15); g.fillStyle = "#f6f0e0"; g.fillRect(-0.15 * s, -0.2 * s, 0.3 * s, 0.4 * s); g.restore(); });
      A.light((g) => { const k = clamp((T - 131.75) / 1.4); tint(g, "#2a3040", 0.45 * k, "multiply"); if (k > 0.5) lightning(g, VW * 0.8, 0, VW * 0.72, VH * 0.4, T > 132.6 && T < 132.8 ? 1 : 0, 5); });
      A.over((g) => { if (lt < 3.6) { g.save(); g.globalAlpha = clamp(lt / 0.3) * clamp((3.6 - lt) / 0.4); g.font = `italic bold 46px "DejaVu Serif", serif`; g.fillStyle = "#f6efe0"; g.textAlign = "center"; g.shadowColor = "#000"; g.shadowBlur = 10; g.fillText("“Paz para o nosso tempo” — Munique, 1938", VW / 2, 96); g.restore(); } });
    } },
  // 17b "...não impediram os planos de Hitler." — Hitler at the great alpine window, grinning over the plans
  { t0: 133.3, fade: 0.2, L: () => loc(undefined, { near: "#5a3e2a", far: "#6a4a32", kind: "wood", zFar: 10 }, [wall("p8", 4.5, "#8a7660", { h: 6, wid: 12, win: 1, winCol: "#c8daf0", panel: "#4a3020" }), mtn("p8", 200, "#7a90b0", 23, 70, true, 2)], true),
    cam: mv([0, 1.6, -3.2, 38], [0.3, 1.6, -2.6, 34]), lite: { ...BACK, rim: "#dfefff" }, act: (A, lt) => {
      A.a(HIT_BROWN, 321, -0.5, 2.6, { expr: "grin", look: 1, facing: 1, ...idle(lt, 321) }); A.sp("desk", 0.8, 0, 2.2, { sc: 0.9 }); A.sp("doc", 0.6, 0.82, 2.18, { sc: 1.3 });
    } },
  // 18 "E então chegou setembro de 1939." — Polish farm at dawn; the farmer looks up as engines drone in
  { t0: 135.19, fade: 0.35, L: () => loc(["#3a5a8a", "#f6c8a0"], { near: "#8a7444", far: "#c8a868", kind: "grass", seed: 90, zFar: 300 }, [hillL("p9", 160, "#6a7a8a", 5, 12, 2.5), forest("p9", 70, "birch", "#7a9a5a", 26, 3, { blur: 1.5, h: 14 }), field("p9", 9, "wheat", "#d8b058", 6, 1.1, 30, 0.4)]),
    cam: mv([0, 1.6, -4, 40], [0, 1.65, -3.2, 36]), lite: GOLD, act: (A, lt, u, T) => {
      A.a(v(civ(4, 55), { hat: "cap", cap: "#5a4a32", jacket: "#6a5a3e" }), 331, -0.8, 3.0, { expr: T > 137.4 ? "nervous" : "neutral", look: T > 137.4 ? 1 : 0, headTilt: T > 137.4 ? -10 : 0 }); A.a(kid(2, 55), 332, 0.6, 3.3, { expr: T > 137.6 ? "shock" : "smile", look: 1 }, { sc: 1 });
      for (let i = 0; i < 6; i++) plane(A, "stuka", 60 - (T - 136.8) * 14 - i * 6, 26 + (i % 3) * 3, 140 + i * 8, { dir: -1, alpha: clamp((T - 136.8) / 0.6), sc: 1 });
      A.over((g) => caption(g, "SETEMBRO DE 1939", T - 136.15, 2.6));
      A.light((g) => { sun(g, VW * 0.2, VH * 0.4, 26, "255,214,160"); lensFlare(g, VW * 0.2, VH * 0.4, 0.5); });
    } },
  // 19a "No dia 1º de setembro de 1939," — the old battleship opens fire on Westerplatte at dawn
  { t0: 139.7, fade: 0.25, L: () => loc(["#2a3456", "#e09a7a"], { near: "#3a4a5e", far: "#6a7488", zFar: 600 }, [clouds("p10", 300, ["#e8a890", "#3a4466"], 7, 20, 80, 16, 4), hillL("p10", 220, "#3a4054", 9, 8, 2)]),
    cam: mv([-6, 6, -40, 40], [4, 6.5, -38, 40]), lite: BACK, kicks: [[140.0, 6], [141.2, 8], [142.4, 6]], act: (A, lt, u, T) => {
      A.fx(400, (g, c) => sea(g, c, lt, { crest: "rgba(255,200,170,0.35)", glitter: [-30, "255,200,150"], z0: -30, z1: 600, n: 200, seed: 7 }));
      ship(A, "oldbb", 10, 120, { dir: -1, guns: [[T - 140.0, 40, 10], [T - 140.3, -42, 10], [T - 141.2, 40, 10], [T - 142.4, -42, 10]] });
      for (const [at, x] of [[140.9, -60], [142.1, -48], [143.1, -70]] as number[][]) A.fx(300, (g, c) => blast(g, c, T - at, x, 2, 300, 9, at * 10));
      A.light((g) => { sun(g, VW * 0.86, VH * 0.5, 20, "255,190,150"); });
      A.over((g) => caption(g, "1º DE SETEMBRO DE 1939 · 4h45", T - 140.0, 2.8));
    } },
  // 19b "a Alemanha invadiu a Polônia" — the border barrier is torn up; soldiers walk through, tanks behind
  { t0: 142.9, fade: 0.15, L: () => loc(["#6a8ab8", "#e8e4d4"], { near: "#7a7a50", far: "#9a9a6a", kind: "grass", seed: 92 }, [forest("p11", 90, "pine", "#3e5a3e", 30, 9, { blur: 2, h: 16 }), hillL("p11", 40, "#7a8a50", 4, 4, 1)]),
    cam: hand(mv([-1.5, 1.6, -9, 44], [-1, 1.6, -8, 42]), 0.015), lite: DAY, act: (A, lt, u, T) => {
      const lift = clamp((T - 143.9) / 0.6), rot = -spring(T - 143.9, 1.4, 0.4) * 1.25; panel(A, 2.6, (w) => { w.rect(-3.8, 0, 0.3, 1.3, "#e8e2d6", 2.5); for (let k = 0; k < 8; k++) w.rect(-3.5 + k * 0.9, 1.0, 0.9, 0.18, k % 2 ? "#c0302a" : "#f2efe6", 2); }, { pivot: [-3.5, 1.09], rot });
      void lift; A.a(sol(WEH, 11), 341, -3.0, 2.4, { expr: "grin", look: 1, prop: ["fist", 0.8] }); walkS(A, sol(WEH, 12), 342, lt, -5.5, 3.4, 1.4, { expr: "stern" }); walkS(A, sol(WEH, 13), 343, lt, -7, 3.9, 1.4, { expr: "stern" });
      tank(A, "panzer", -14 + lt * 2.2, 9, { vel: 2.2, dustCol: [170, 150, 110] });
      panel(A, 2.7, (w) => { w.rect(1.2, 1.5, 1.4, 0.55, "#f2efe6", 2.5); w.text("POLSKA", 1.9, 1.78, 0.24, "#c0302a"); w.rect(1.85, 0, 0.1, 1.5, "#5a4a3a", 2); });
    } },
  // 19c "utilizando uma estratégia militar" — steel map: three spearheads into Poland
  { t0: 145.0, fade: 0.2, L: () => europe("p12", ST.steel), cam: mv([4, 1.6, -19, 40], [5, 1.4, -17, 40]), act: (A, lt, u, T) => {
      hl(A, "GER", 1, "#3a3e46", 0.55); hl(A, "POL", 1, "#c8b890", 0.4); arrow(A, [14, 53.5], [20, 53], (T - 145.3) / 1.4, "#2a2e36", 0.3); arrow(A, [14.5, 51.2], [20.2, 52.2], (T - 145.6) / 1.4, "#2a2e36", 0.3); arrow(A, [18.6, 49.6], [21, 51.6], (T - 145.9) / 1.4, "#2a2e36", 0.3);
      pin(A, 21, 52.23, T - 147.3, "fire");
    } },
  // 19d "conhecida como Blitzkrieg, ou guerra-relâmpago." — a Stuka screams down; lightning on "relâmpago"
  { t0: 147.85, fade: 0.1, L: () => loc(["#2a3a5a", "#9ab0c8"], { near: "#5a6a4a", far: "#7a8a6a", kind: "grass", seed: 94, zFar: 500 }, [clouds("p13", 300, ["#e0e8f0", "#4a5a7a"], 12, 30, 110, 22, 3), hillL("p13", 200, "#4a5a5a", 4, 12, 2)]),
    cam: (u, lt) => { const k = lt / 2.3; return C(-30 + 52 * k, 50 - 40 * k * k, -6, 46, 0); }, lite: DAY, kicks: [[149.1, 14]], act: (A, lt, u, T) => {
      const k = lt / 2.3, x = -32 + 56 * k, y = 52 - 44 * k * k; plane(A, "stuka", x, y, 20, { ang: 0.45 + 0.4 * k, sc: 1 }); A.fx(20.5, (g, c) => { const [sx, sy, s] = P(c, x - 3, y + 2, 20.5); for (let i = 0; i < 6; i++) { g.strokeStyle = `rgba(255,255,255,${0.3 - i * 0.04})`; g.lineWidth = 2; g.beginPath(); g.moveTo(sx - i * 8, sy - i * 6); g.lineTo(sx - 120 - i * 8, sy - 80 - i * 6); g.stroke(); } void s; });
      A.light((g) => { lightning(g, VW * 0.62, 0, VW * 0.55, VH * 0.85, T > 149.1 && T < 149.35 ? 1 : T > 149.45 && T < 149.6 ? 0.6 : 0, 11); if (T > 149.1 && T < 149.25) { g.fillStyle = "rgba(230,240,255,0.5)"; g.fillRect(0, 0, VW, VH); } });
      A.over((g) => bigText(g, "BLITZKRIEG", T - 148.15, 2.4, VH * 0.24, 128, "#f6efe0", T > 149.0 ? "guerra-relâmpago" : undefined, "190,210,255"));
    } },
  // 20a "A tática combinava tanques," — Panzer column racing, dust lit by the sun
  { t0: 150.72, fade: 0.15, L: () => loc(["#5a86c0", "#f0dcb0"], { near: "#9a8456", far: "#c8b07a", kind: "grass", seed: 96, zFar: 300 }, [hillL("p14", 180, "#9a9a88", 8, 16, 2.5), field("p14", 40, "wheat", "#c8a050", 9, 1.0, 60, 1)]),
    cam: (u, lt) => C(-4 + lt * 7.5, 1.3, -9, 40), lite: GOLD, act: (A, lt) => {
      for (let i = 0; i < 4; i++) tank(A, "panzer", -10 + lt * 8 - i * 9, 4 + i * 3.5, { vel: 8, dustCol: [200, 176, 130], t: lt + i });
    } },
  // 20b "aviões" — Stuka formation passes overhead, seen from below
  { t0: 152.45, L: () => loc(["#3e72b8", "#d8e6f0"], { near: "#3e72b8", far: "#3e72b8", zFar: 1 }, [clouds("p15", 350, ["#ffffff", "#a0b8d0"], 19, -20, 70, 30, 3)], true),
    cam: (u, lt) => C(0, 0, -10, 56, 420), lite: DAY, act: (A, lt) => { for (let i = 0; i < 9; i++) { const r = Math.floor(i / 3), c2 = i % 3, z = 90 + r * 30, x = (c2 - 1) * 22 + r * 6 - 30 + lt * 34; planeTop(A, "stuka", x, z * 0.28 + c2 * 2, z, { head: Math.PI / 2, below: true, t: lt + i, dark: 0.25 }); } } },
  // 20c "e tropas terrestres" — infantry rides and runs beside the trucks
  { t0: 152.9, L: () => loc(["#6a90c0", "#ece2c8"], { near: "#8a7a56", far: "#b8a47a", kind: "mud", seed: 98 }, [forest("p16", 70, "poplar", "#5a7a3a", 26, 11, { blur: 1.6, h: 15 })]),
    cam: (u, lt) => C(-2 + lt * 4, 1.6, -7, 42), lite: DAY, act: (A, lt) => {
      A.sp("truck", -1 + lt * 4.2, 0, 6, { sc: 1.0 }); A.sp("truck", -11 + lt * 4.2, 0, 7.5); A.fx(6.6, (g, c) => dust(g, c, lt, -4 + lt * 4.2, 6.5, 1, 1, [180, 160, 120]));
      for (let i = 0; i < 4; i++) runS(A, sol(WEH, 20 + i), 350 + i, lt, -5 - i * 1.7, 3.4 + (i % 2) * 0.6, 4.0, { expr: "shout" });
    } },
  // 20d "para atacar rapidamente" — a tank bursts through a wooden barricade, planks fly
  { t0: 154.15, L: () => loc(["#7a96b8", "#e0dccc"], { near: "#7a6a4a", far: "#9a8a66", kind: "mud", seed: 100 }, [city("p17", 30, { pal: ["#d8c8a8", "#c8b898", "#e8d8b8"], seed: 91, roof: "gable", roofCol: "#8a4a3a", floors: [1, 2], hgt: [5, 7], blur: 1 })]),
    cam: hand(mv([2, 1.0, -6, 42], [1, 1.0, -5.2, 40]), 0.02), lite: DAY, kicks: [[154.85, 12]], act: (A, lt, u, T) => {
      const k = T - 154.85; tank(A, "panzerD", -6 + lt * 4.5, 4, { vel: 4.5, dustCol: [160, 140, 100] });
      if (k < 0) panel(A, 3.9, (w) => { for (let i = 0; i < 6; i++) w.rect(-1 + i * 0.05, 0.2 + i * 0.28, 3, 0.2, "#8a6a42", 2); w.rect(-0.8, 0, 0.2, 1.8, "#6a4a2a", 2); w.rect(1.6, 0, 0.2, 1.8, "#6a4a2a", 2); });
      else A.fx(3.9, (g, c) => { for (let i = 0; i < 10; i++) { const vx = 2 + hash(i) * 5, vy = 2 + hash(i + 3) * 4, sp = (hash(i + 7) - 0.5) * 14, [y] = bounce(k, 0.3 + i * 0.15, vy, 0.3); const [sx, sy, s] = P(c, 0.2 + vx * Math.min(k, 1.2), Math.max(0.05, y), 3.9 - hash(i + 2) * 2 * Math.min(k, 1)); g.save(); g.translate(sx, sy); g.rotate(sp * Math.min(k, 0.9)); g.fillStyle = "#8a6a42"; g.strokeStyle = "#241726"; g.lineWidth = 2; g.fillRect(-0.6 * s, -0.08 * s, 1.2 * s, 0.16 * s); g.strokeRect(-0.6 * s, -0.08 * s, 1.2 * s, 0.16 * s); g.restore(); } });
    } },
  // 20e "e desorganizar as defesas inimigas." — Polish trench line under bombardment, defenders scatter
  { t0: 155.7, fade: 0.1, L: () => loc(["#8a96a8", "#d8d0c0"], { near: "#6a5a40", far: "#8a7a5a", kind: "mud", seed: 102 }, [hillL("p18", 120, "#7a7a6a", 6, 10, 2), forest("p18", 50, "birch", "#6a8a4a", 20, 12, { blur: 1.2, h: 12 })]),
    cam: hand(mv([0, 1.4, -5, 42], [0, 1.4, -4.4, 40]), 0.03), lite: DAY, kicks: [[156.2, 10], [156.9, 12], [157.6, 9]], act: (A, lt, u, T) => {
      panel(A, 2.2, (w) => { w.poly([[-8, -1], [8, -1], [8, 0.55], [-8, 0.55]], "#5a4a32", 3); for (let x = -7.6; x < 8; x += 0.75) w.ell(x, 0.65, 0.4, 0.18, "#b8a878", 2); });
      for (let i = 0; i < 5; i++) { const at = 156.2 + (i % 3) * 0.7, hit = T > at; if (hit && i % 2) runS(A, sol(POLE, i), 361 + i, T - at, -2 + i * 1.3, 2.8 + i * 0.3, (i % 2 ? 3.2 : -3.2), { expr: "fear" }); else A.a(sol(POLE, i), 361 + i, -3 + i * 1.5, 2.4, { expr: hit ? "shock" : "nervous", crouch: 0.5 }, { y: -0.35 }); }
      for (const [at, x, z] of [[156.2, -2, 6], [156.9, 3, 4.5], [157.6, -5, 9]] as number[][]) A.fx(z, (g, c) => { blast(g, c, T - at, x, 0, z, 2.6, at); scorch(g, c, x, z, 2.4, clamp((T - at) * 3) * 0.6); });
    } },
  // 21a "Dois dias depois, Reino Unido" — a London family gathered round the wireless
  { t0: 158.74, fade: 0.25, L: () => loc(undefined, { near: "#5a3a2a", far: "#6a4632", kind: "wood", zFar: 10 }, [wall("p19", 3.2, "#7a8a6a", { h: 4.5, wid: 9, frames: 2, panel: "#4a3a2a", win: 1, winCol: "#d8e4ea", curtain: "#7a3a3a" })], true),
    cam: mv([0, 1.3, -2.8, 38], [0, 1.25, -2.2, 34]), lite: LAMP, act: (A, lt) => {
      A.sp("radio", 0, 0, 2.2, { sc: 1.2 }); A.light((g) => { const [sx, sy, s] = P(A.cam, 0, 0.75, 2.2); glow(g, sx, sy, 0.4 * s, "rgba(255,210,120,1)", 0.35); });
      A.a(v(civ(0, 60), { hat: "hair", tie: "#2a3a6a" }), 371, -1.3, 2.3, { mode: "sit", expr: "nervous", look: 1 }, { y: 0.15 }); A.a(v(civ(1, 60), { hat: "longhair" }), 372, 1.3, 2.4, { mode: "sit", expr: "sad", look: -1, facing: -1, prop: ["baby", 0] }, { y: 0.15 }); A.a(kid(3, 60), 373, 0.5, 1.6, { expr: "nervous", look: -1 }, { sc: 0.9 });
      A.over((g) => caption(g, "3 DE SETEMBRO DE 1939 · LONDRES", lt - 0.3, 1.5));
    } },
  // 21b "e França declararam guerra à Alemanha." — Paris newsboy shouts the headline
  { t0: 160.5, fade: 0.15, L: () => loc(["#8ab0d8", "#f0e8d8"], { near: "#9a907e", far: "#b8ae9a", kind: "cobble", seed: 104 }, [skyline("p20", 120, "#9aa0b0", "paris", 5, 2), city("p20", 22, { pal: ["#e8dcc4", "#dccfb4", "#efe4cc"], seed: 101, floors: [5, 6], hgt: [16, 19], roof: "hip", roofCol: "#5a6a7a", blur: 0.8, shutter: "#3a4a5a" })]),
    cam: mv([0, 1.6, -4, 40], [0.3, 1.6, -3.4, 36]), lite: DAY, act: (A, lt, u, T) => {
      A.a(kid(4, 62), 381, 0, 2.0, { expr: "shout", prop: ["paper", 0], look: 0 }, { sc: 1.05 });
      crowd(A, 6, -5, 5, 3.2, 5.5, 63, (i) => ({ expr: i % 2 ? "shock" : "nervous", look: 0 }), (i) => civ(i, 63));
      A.over((g) => { const k = easeOut(clamp(lt / 0.35)); g.save(); g.translate(VW * 0.76, VH * 0.36); g.rotate(0.05); g.scale(k, k); g.fillStyle = "#f2ead6"; g.shadowColor = "rgba(0,0,0,0.5)"; g.shadowBlur = 24; g.fillRect(-250, -170, 500, 340); g.shadowBlur = 0; g.fillStyle = "#1e1a18"; g.font = `bold 30px "DejaVu Serif", serif`; g.textAlign = "center"; g.fillText("LE PETIT PARISIEN", 0, -125); g.fillRect(-230, -108, 460, 3);
        g.font = `bold 88px "DejaVu Serif", serif`; g.fillText("GUERRE!", 0, -20); g.font = `24px "DejaVu Serif", serif`; g.fillText("A França e a Inglaterra", 0, 36); g.fillText("declaram guerra à Alemanha", 0, 66); for (let i = 0; i < 4; i++) g.fillRect(-230, 96 + i * 16, 460 - (i % 2) * 90, 5); g.restore(); });
    } },
  // 22 "A Segunda Guerra Mundial havia começado." — storm front, soldiers' silhouettes, title
  { t0: 163.45, fade: 0.25, L: () => loc(["#0c0e18", "#3a3a4e"], { near: "#1a1a1e", far: "#2a2a30", zFar: 300 }, [clouds("p21", 260, ["#5a5a72", "#14141e"], 3, 20, 90, 24, 3), hillL("p21", 60, "#141418", 5, 5, 0.6)]),
    cam: mv([0, 1.4, -8, 42], [0, 1.5, -7, 40]), bloom: 0.8, act: (A, lt, u, T) => {
      marchCol(A, (i) => sol(WEH, 30 + i), lt, 14, 8, 14, -1.2, 1.5, 1, 1, { dark: 0.95, darkCol: "#08080c" }, { expr: "stern" }, 390);
      A.light((g) => { const f = (T > 164.3 && T < 164.5) || (T > 165.4 && T < 165.55) ? 1 : 0; lightning(g, VW * 0.3, 0, VW * 0.36, VH * 0.52, f, 17); if (f) { g.fillStyle = "rgba(200,210,255,0.35)"; g.fillRect(0, 0, VW, VH); } });
      A.over((g) => bigText(g, "A GUERRA COMEÇOU", lt - 0.3, 2.5, VH * 0.32, 112));
    } },
  // 23a "Pouco depois, a União Soviética também invadiu a Polônia pelo leste," — Red Army fords a river at sunrise
  { t0: 166.43, fade: 0.25, L: () => loc(["#4a5a8a", "#ffc890"], { near: "#5a6a7a", far: "#8a8a8a", zFar: 300 }, [clouds("p22", 280, ["#ffd0a0", "#5a5a7a"], 9, 30, 90, 16, 4), forest("p22", 60, "birch", "#5a7a4a", 26, 14, { blur: 1.4, h: 13 }), hillL("p22", 18, "#6a6a46", 5, 1.2, 0.3)]),
    cam: mv([3, 1.8, -7, 42], [-1, 1.9, -6, 40]), lite: { ...GOLD, rdx: -1 }, act: (A, lt) => {
      A.fx(12, (g, c) => sea(g, c, lt, { crest: "rgba(255,220,190,0.45)", glitter: [-6, "255,210,160"], z0: 2, z1: 17, n: 90, seed: 9 }));
      marchCol(A, (i) => sol(RED, i), lt, 9, 8, 5, -1.3, 1.4, 2, 1.4, {}, { expr: "stern" }, 400); tank(A, "t34", 12 - lt * 2.0, 12, { vel: 2, dir: -1 });
      flag(A, "su", 4.2 - lt * 1.3, 3.6, 5.2, 1.3, 0.85, { t: lt, wind: 0.9 }); A.over((g) => caption(g, "17 DE SETEMBRO DE 1939", lt - 0.4, 2.5));
    } },
  // 23b "conforme os acordos secretos firmados com Hitler." — the pact: handshake, Stalin smiles, SECRETO stamp
  { t0: 171.25, fade: 0.2, L: () => loc(undefined, { near: "#4a2e24", far: "#5a3a2c", kind: "wood", zFar: 10 }, [wall("p23", 3.6, "#8a6a52", { h: 5, wid: 10, panel: "#4a2a1a", frames: 1, curtain: "#6a1a18", win: 2, winCol: "#e0d8c0" })], true),
    cam: mv([0, 1.6, -3.2, 38], [0, 1.6, -2.6, 34]), lite: LAMP, act: (A, lt, u, T) => {
      A.a(MOLOTOV, 411, -0.6, 2.0, { expr: "neutral", facing: 1, look: 1, prop: ["fist", 0.2] }); A.a(RIBB, 412, 0.6, 2.0, { expr: "smile_closed", facing: -1, look: -1, prop: ["fist", 0.2] }); A.a(STALIN, 413, 1.9, 2.8, { expr: "grin", look: -1, facing: -1, ...idle(lt, 413) });
      A.over((g) => STAMP(g, "SECRETO", T - 171.95, VW * 0.22, VH * 0.25));
      A.over((g) => caption(g, "PACTO GERMANO-SOVIÉTICO", lt - 0.2, 2.2));
    } },
  // 24a "Em 1940, os alemães avançaram" — a Norwegian fjord: paratroopers drift down over the warships
  { t0: 174.16, fade: 0.25, L: () => loc(["#5a7aa8", "#dce6ec"], { near: "#3e5a6a", far: "#6a8a9a", zFar: 600 }, [mtn("p24", 300, "#4a5a6e", 31, 140, true, 2.5, 1.5), mtn("p24b", 120, "#3e4e5a", 7, 50, true, 1.2, 1.2)]),
    cam: mv([0, 10, -30, 44, -20], [3, 11, -27, 42, -30]), lite: COLD, act: (A, lt) => {
      A.fx(300, (g, c) => sea(g, c, lt, { crest: "rgba(230,240,250,0.35)", z0: 0, z1: 400, n: 160, seed: 11 }));
      ship(A, "destroyer", -10 + lt * 1.5, 140, { vel: 1.5 }); ship(A, "destroyer", 30 + lt * 1.5, 180, { vel: 1.5 });
      for (let i = 0; i < 7; i++) para(A, sol(v(WEH, { hat: "stahlhelm", cap: "#5a6a6a", jacket: "#7a8478" }), 50 + i), 420 + i, -14 + i * 4.5 + Math.sin(lt + i) * 0.5, 26 - lt * 4.5 + (i % 3) * 4, 30 + (i % 2) * 6, lt);
      A.over((g) => caption(g, "ABRIL DE 1940 · NORUEGA", lt - 0.3, 2.6));
    } },
  // 24b "sobre Dinamarca, Noruega, Bélgica, Holanda e França." — parchment map, each name lights as it's spoken
  { t0: 177.6, fade: 0.15, L: () => europe("p25", ST.parch), cam: mv([-2, 4.5, -18, 40], [-3, 3.5, -15, 40]), act: (A, lt, u, T) => {
      hl(A, "GER", 1, "#5a4a3a", 0.55); hl(A, "POL", 1, "#6a5a4a", 0.4);
      [["DEN", 177.7, [10, 53.8], [9.6, 56]], ["NOR", 178.55, [10.5, 54.2], [9, 60.5]], ["BEL", 179.25, [7, 51], [4.6, 50.7]], ["NLD", 179.9, [7.2, 52], [5.4, 52.3]], ["FR", 180.8, [7, 49.6], [2.5, 47.5]]].forEach(([k, at, a, b]) => {
        hl(A, k as string, (T - (at as number)) / 0.35, "#8a1a14", 0.6); arrow(A, a as number[], b as number[], (T - (at as number) + 0.2) / 0.6, "#6a1410", 0.24); });
    } },
  // 25a "Em poucas semanas, Paris foi ocupada" — the column marches past the Arc; a Parisian weeps
  { t0: 181.78, fade: 0.25, L: () => loc(["#8aa0c0", "#e8e0d0"], { near: "#9a9282", far: "#b8b0a0", kind: "cobble", seed: 106 }, [
      { key: "p26arc", z: 60, x0: -20, x1: 20, y0: -1, y1: 52, ppm: 14, blur: 1, paint: (w) => { const c = "#d8ccb4"; w.rect(-18, 0, 36, 48, w.vgrad(0, 48, "#b8aa90", c), 3); w.rect(-6, 0, 12, 28, "#5a5048", 3); w.ell(0, 28, 6, 6, "#5a5048", 0, 0, Math.PI); w.rect(-19, 40, 38, 3, c, 2.5); for (let k = 0; k < 6; k++) w.rect(-16 + k * 6, 31, 4, 6, "#c8baa0", 1.5); } },
      forest("p26", 30, "oak", "#4a6a3a", 14, 9, { blur: 1, h: 10 })]),
    cam: mv([0, 2, -7, 42, -30], [0, 2.2, -6, 40, -40]), lite: DAY, act: (A, lt) => {
      marchF(A, (i) => sol(WEH, 40 + i), lt, 5, 4, 12, 1.2, 1.3, 1.7, 440, () => ({ expr: "stern" }));
      flag(A, "ax", 0, 26, 59.5, 4, 6, { t: lt, wind: 0.4, pole: false, droop: 0.2 });
      A.a(v(civ(2, 66), { hat: "longhair", dress: "#2a3a5a" }), 461, -3.8, 1.6, { expr: "sad", look: 1, prop: ["letter", 0], headTilt: 8 }); A.a(v(civ(5, 66), { hat: "beret", cap: "#2a2a3a" }), 462, 3.6, 1.8, { expr: "sad", look: -1, facing: -1, ...idle(lt, 462) });
      A.over((g) => caption(g, "14 DE JUNHO DE 1940 · PARIS", lt - 0.3, 2.4));
    } },
  // 25b "e a França se rendeu." — the tricolour is lowered down the pole
  { t0: 184.4, fade: 0.15, L: () => loc(["#9aa8b8", "#e0dcd4"], { near: "#8a8478", far: "#a8a294", kind: "stone", seed: 108 }, [city("p27", 26, { pal: ["#d0c4ae", "#c4b8a2"], seed: 111, floors: [4, 4], hgt: [16, 16], roof: "hip", roofCol: "#4a5a6a", blur: 1.6 })]),
    cam: mv([0, 3.4, -6, 40, 40], [0, 3.2, -5, 38, 30]), lite: GREY, act: (A, lt) => {
      const y = lerp(6.2, 1.4, smooth(clamp(lt / 1.6))); A.sp("flagpole", 0, 0, 4, { sc: 0.8 }); flag(A, "fr", 0.06, y, 3.99, 1.6, 1.05, { t: lt, wind: 0.35, pole: false, droop: 0.25 });
      A.a(sol(FRENCH, 4, false), 471, 1.3, 3.0, { expr: "sad", look: -1, facing: -1, headTilt: 9 });
    } },
  // 26 "Parecia que ninguém conseguiria deter o avanço alemão." — a high, sweeping view of an endless armoured column on a poplar road
  { t0: 186.08, fade: 0.2, L: () => loc(["#6a9ad0", "#f0e8d0"], { near: "#8aa058", far: "#b8bc88", kind: "grass", seed: 110, zFar: 500 }, [hillL("p28", 260, "#9aa8a8", 3, 30, 3), forest("p28", 90, "poplar", "#5a7a3a", 40, 15, { blur: 1.5, h: 22 })]),
    cam: (u, lt) => C(lt * 6, 9, -22, 40, -150), lite: DAY, act: (A, lt) => {
      panel(A, 30, (w) => w.rect(-200, -0.02, 400, 0.04, "#000", 0)); for (let i = 0; i < 12; i++) tank(A, i % 3 ? "panzer" : "panzerD", -40 + i * 8 + lt * 7, 8 + (i % 2) * 2.5, { vel: 7, dustCol: [190, 180, 140], t: lt + i });
      for (let i = 0; i < 6; i++) planeTop(A, "bf109", -40 + i * 12 + lt * 30, 40, 60 + i * 5, { head: Math.PI / 2, below: false, dark: 0.1 });
    } },
  // 27 "Mas havia um país que ainda resistia: a Inglaterra." — the white cliffs; Churchill raises his hand
  { t0: 189.51, fade: 0.3, L: () => loc(["#5a86c0", "#e8eef2"], { near: "#6a8a4a", far: "#8aa864", kind: "grass", seed: 112, zFar: 300 }, [clouds("p29", 280, ["#ffffff", "#9aaac0"], 23, 30, 100, 22, 3), cliffs("p29", 30, "#efeae0", "#6a8a4a", 3, 4, 0.5)]),
    cam: mv([0, 1.7, -5, 40], [0.3, 1.7, -4.2, 36]), lite: DAY, act: (A, lt, u, T) => {
      A.fx(200, (g, c) => sea(g, c, lt, { crest: "rgba(240,250,255,0.4)", glitter: [30, "255,255,240"], z0: 30, z1: 400, n: 120, seed: 13 }));
      A.a(CHURCHILL, 481, 0, 2.0, { expr: T > 191.5 ? "smile_closed" : "stern", look: 0, prop: T > 191.5 ? ["fist", 1] : undefined, ...idle(lt, 481) });
      A.a(sol(TOMMY, 3), 482, -2.0, 2.8, { expr: "stern", look: 1 }); A.a(sol(TOMMY, 4), 483, 2.1, 2.9, { expr: "stern", look: -1, facing: -1 }); flag(A, "uk", 3.4, 3.8, 3.4, 1.4, 0.8, { t: lt });
    } },
  // 28 "Hitler sabia que precisava derrotar os britânicos" — Hitler scans England through binoculars from the French coast (lens glint)
  { t0: 193.55, fade: 0.2, L: () => loc(["#6a8ab0", "#e6e2d6"], { near: "#a89a78", far: "#c8b898", kind: "sand", seed: 114, zFar: 400 }, [cliffs("p30", 300, "#e8e4dc", "#7a9a6a", 31, 14, 3)]),
    cam: mv([-1, 1.6, -4.6, 40], [-0.5, 1.6, -3.8, 36]), lite: { ...DAY, rdx: -1 }, act: (A, lt, u, T) => {
      A.fx(200, (g, c) => sea(g, c, lt, { crest: "rgba(230,240,250,0.4)", z0: 6, z1: 300, n: 160, seed: 17 }));
      A.a(HIT_CAP, 491, 0.4, 2.0, { expr: "stern", look: 1, prop: ["fist", 0.9], headTilt: -3 }); A.a(sol(v(WEH, { hat: "peaked", cap: "#5e6458", rifle: false }), 7), 492, -1.4, 2.6, { expr: "stern", look: 1, ...idle(lt, 492) });
      A.light((g) => { const [sx, sy, s] = P(A.cam, 0.62, 1.86, 1.98); glint(g, sx, sy, 0.24 * s, 0.6 + 0.4 * Math.sin(lt * 2.5)); });
    } },
  // 29a "A Alemanha iniciou então uma intensa campanha de bombardeios" — bombers over the Thames at dusk, flak, bombs fall
  { t0: 199.76, fade: 0.25, L: () => loc(["#2a2a4a", "#e0906a"], { near: "#3a3a44", far: "#5a5058", zFar: 400 }, [skyline("p31", 200, "#3a3040", "london", 3, 2), clouds("p31", 300, ["#ffb88a", "#3a3a5a"], 31, 40, 90, 14, 4)]),
    cam: mv([0, 3, -12, 46, 120], [0, 3.4, -10, 44, 160]), lite: BACK, act: (A, lt, u, T) => {
      for (let i = 0; i < 8; i++) { const x = -60 + i * 14 + lt * 12, y = 46 + (i % 3) * 4, z = 120 + (i % 4) * 14; plane(A, "he111", x, y, z, { sc: 1 }); dropBomb(A, T, 202.9 + i * 0.12, x + (202.9 + i * 0.12 - 199.76) * 0, y - 1, z, 12); }
      for (let i = 0; i < 14; i++) { const at = 200 + i * 0.35; A.fx(140, (g, c) => flak(g, c, T - at, -40 + hash(i) * 90, 40 + hash(i + 3) * 18, 140 + hash(i + 7) * 30, 2)); }
      A.light((g) => searchlight(g, A.cam, -30, 200, 0.2 * Math.sin(lt * 0.6), 0.2));
    } },
  // 29b "contra cidades" — the Blitz: firemen fight a blaze, St Paul's dome through the smoke
  { t0: 203.7, fade: 0.15, L: () => loc(["#0a0a14", "#4a2018"], { near: "#2a2420", far: "#3a302a", kind: "rubble", seed: 116 }, [skyline("p32", 140, "#1a1418", "london", 9, 2), ruins("p32", 18, ["#6a5040", "#5a4436", "#76584a"], 41, { hgt: [8, 14] })]),
    cam: mv([0, 1.6, -5, 40], [0.4, 1.7, -4.4, 38]), lite: NIGHTFIRE, bloom: 0.95, act: (A, lt) => {
      A.fx(17.5, (g, c) => { for (const x of [-6, 2, 8]) fire(g, c, lt, x, 4, 17.5, 3, x); embers(g, c, lt, 0, 16, 18, 50, 18, 5); smokeCol(g, c, lt, 2, 10, 18, { h: 40, w: 6, col: [40, 30, 28], a: 0.65 }); });
      A.a(v(TOMMY, { hat: "brodie", cap: "#2a2a2e", jacket: "#2a2e3a", pants: "#2a2e3a", rifle: false }), 501, -1.2, 3.0, { expr: "stern", look: 1, crouch: 0.3 }); A.a(v(TOMMY, { hat: "brodie", cap: "#2a2a2e", jacket: "#2a2e3a", pants: "#2a2e3a", rifle: false }), 502, -2.3, 3.4, { expr: "nervous", look: 1 });
      A.fx(3.0, (g, c) => { g.save(); g.globalCompositeOperation = "lighter"; for (let i = 0; i < 90; i++) { const k = ((lt * 1.2 + i / 90) % 1), vx = 9 + hash(i) * 1.2, vy = 6 + hash(i + 2) * 0.8, x = -0.8 + vx * k * 0.8, y = 1.3 + vy * k * 0.8 - 4.9 * (k * 0.8) ** 2; if (y < 0) continue; const [sx, sy, s] = P(c, x, y, 3 + k * 10); g.fillStyle = `rgba(190,220,255,${0.5 * (1 - k)})`; g.beginPath(); g.arc(sx, sy, Math.max(1.5, 0.06 * s), 0, 7); g.fill(); } g.restore(); });
    } },
  // 29c "e instalações militares inglesas." — an airfield is hit: hangar blows, a parked fighter burns
  { t0: 204.35, L: () => loc(["#7a8ea8", "#d8dcd8"], { near: "#6a7a4a", far: "#8a9a6a", kind: "grass", seed: 118 }, [wall("p33", 24, "#6a6a60", { h: 8, wid: 12 }), forest("p33", 80, "oak", "#4a6a3a", 20, 17, { blur: 1.8, h: 12 })]),
    cam: hand(mv([0, 1.6, -8, 42], [0, 1.6, -7, 40]), 0.03), lite: DAY, kicks: [[204.6, 14], [205.4, 10]], act: (A, lt, u, T) => {
      plane(A, "spit", -3, 0, 10, { sc: 0.9, t: 0 }); A.fx(23.5, (g, c) => { blast(g, c, T - 204.6, 0, 3, 23.5, 7, 3, { debris: 40 }); if (T > 204.8) fire(g, c, lt, 0, 0, 23.4, 4, 2); });
      A.fx(9.9, (g, c) => { blast(g, c, T - 205.4, -3, 0.5, 9.9, 2.4, 5); if (T > 205.6) { fire(g, c, lt, -3, 0.6, 9.8, 1.4, 4); smokeCol(g, c, lt, -3, 2, 10, { h: 18, w: 2.4, col: [30, 28, 28], a: 0.8 }); } });
      runS(A, sol(RAF, 1), 511, Math.max(0, T - 204.7), 2, 4, 3.6, { expr: "fear" });
    } },
  // 30 "Esse confronto ficou conhecido como Batalha da Grã-Bretanha." — dogfight among the clouds; the Messerschmitt is hit and falls trailing smoke
  { t0: 206.72, fade: 0.2, L: () => loc(["#2e5a9a", "#cfe0ec"], { near: "#cfe0ec", far: "#cfe0ec", zFar: 1 }, [clouds("p34", 260, ["#ffffff", "#8aa4c4"], 41, -30, 40, 28, 3), clouds("p34b", 80, ["#ffffff", "#a8bcd4"], 43, -12, 14, 12, 1.2)], true),
    cam: (u, lt) => C(lt * 22 - 4, 0.5 + lt * 0.3, -20, 44, 0), lite: DAY, act: (A, lt, u, T) => {
      const hit = T - 208.4, bx = lt * 22 + 8, by = 1.5 + Math.sin(lt * 1.3) * 1.2 - (hit > 0 ? 0.5 * 4 * hit * hit : 0);
      plane(A, "bf109", bx, by, 12, { ang: hit > 0 ? Math.min(0.9, hit * 0.5) : -0.1 * Math.cos(lt * 1.3), sc: 1.0 });
      if (hit > 0) A.fx(12.2, (g, c) => { const pts: [number, number, number][] = []; for (let k = 0; k < 18; k++) { const tt = Math.max(0, hit - k * 0.08); pts.unshift([bx - k * 22 * 0.08 + 0, 1.5 + Math.sin((lt - k * 0.08) * 1.3) * 1.2 - 0.5 * 4 * tt * tt, 12.2]); } trail(g, c, pts); });
      const sx = lt * 22 - 3, sy = 0.8 + Math.sin(lt * 1.3 - 0.5) * 1.2; plane(A, "spit", sx, sy, 11, { ang: -0.1 * Math.cos(lt * 1.3 - 0.5) }); A.fx(10.9, (g, c) => { if (T > 207.2 && T < 208.6) { const [mx, my, s] = P(c, sx + 2.5, sy + 1.4, 10.9); if (Math.floor(lt * 30) % 2) { glow(g, mx, my, 0.8 * s, "rgba(255,220,140,1)", 0.9); } } });
      tracers2(A, T, sx + 3, sy + 1.4, 11, bx - 3, by + 1.6, 12, 207.2, 208.6);
      A.over((g) => bigText(g, "BATALHA DA GRÃ-BRETANHA", T - 208.7, 1.4, VH * 0.82, 92));
    } },
  // 31a "Apesar dos ataques," — Londoners shelter on an Underground platform
  { t0: 210.62, fade: 0.2, L: () => loc(undefined, { near: "#6a5e4e", far: "#7a6e5e", kind: "stone", seed: 120, zFar: 30 }, [wall("p35", 5, "#d8cca8", { h: 5, wid: 30, tile: true, lamps: 5, arch: false })], true),
    cam: mv([-2, 1.4, -4, 44], [1, 1.4, -3.6, 44]), lite: LAMP, kicks: [[211.2, 3]], act: (A, lt) => {
      for (let i = 0; i < 8; i++) A.a(i % 3 === 2 ? kid(i, 70) : civ(i, 70), 521 + i, -6 + i * 1.7, 3.2 + (i % 2) * 0.6, { mode: "sit", expr: ["sad", "nervous", "neutral", "smile_closed"][i % 4] as never, blink: i % 4 === 3 ? 1 : undefined, headTilt: i % 2 ? 8 : -5 }, { y: 0.1 });
      panel(A, 4.9, (w) => { w.ell(0, 3.4, 1.1, 1.1, "#c0302a", 2.5); w.ell(0, 3.4, 0.7, 0.7, "#f2efe6", 0); w.rect(-1.5, 3.2, 3.0, 0.4, "#1e3a8a", 2); w.text("UNDERGROUND", 0, 3.4, 0.22, "#f2efe6"); });
      A.light((g) => { if (A.t > 211.2 && A.t < 211.5) tint(g, "#000", 0.25, "multiply"); });
    } },
  // 31b "os britânicos resistiram," — dawn: the milkman picks his way through the rubble
  { t0: 212.45, fade: 0.2, L: () => loc(["#a8b0c4", "#f0d8c0"], { near: "#7a6e62", far: "#9a8e80", kind: "rubble", seed: 122 }, [ruins("p36", 16, ["#8a7462", "#7a6656", "#9a8270"], 51, { hgt: [6, 12] }), skyline("p36", 120, "#8a8494", "london", 19, 2.5)]),
    cam: (u, lt) => C(-1 + lt * 0.8, 1.5, -4.5, 40), lite: GOLD, act: (A, lt) => {
      walkS(A, { jacket: "#e8e4dc", pants: "#2a2a30", boots: "#141414", hat: "cap", cap: "#2a2a30" }, 531, lt, -2, 2.2, 0.9, { expr: "smile_closed" });
      A.fx(2.1, (g, c) => { const [sx, sy, s] = P(c, -2 + lt * 0.9 + 0.35, 0.9, 2.1); g.fillStyle = "#3a3a3a"; g.fillRect(sx - 0.14 * s, sy - 0.25 * s, 0.28 * s, 0.25 * s); for (let k = 0; k < 3; k++) { g.fillStyle = "#f4f4f0"; g.fillRect(sx + (-0.12 + k * 0.09) * s, sy - 0.42 * s, 0.07 * s, 0.2 * s); } });
      A.fx(6, (g, c) => smokeCol(g, c, lt, 4, 0, 8, { h: 12, w: 2, col: [150, 140, 140], a: 0.4, rate: 0.05 }));
    } },
  // 31c "impedindo uma invasão alemã." — scramble! pilots sprint to their Spitfires, which roll and lift off
  { t0: 213.0, fade: 0.1, L: () => loc(["#6a96cc", "#e8eef0"], { near: "#5a8a3e", far: "#8ab060", kind: "grass", seed: 124, zFar: 300 }, [forest("p37", 90, "oak", "#3e6a32", 24, 19, { blur: 2, h: 14 }), clouds("p37", 300, ["#ffffff", "#a8bcd4"], 47, 30, 90, 16, 3)]),
    cam: (u, lt) => C(lt * 4, 1.6, -9, 42), lite: DAY, act: (A, lt) => {
      for (let i = 0; i < 3; i++) runS(A, sol(RAF, i + 2), 541 + i, lt, -4 - i * 1.4, 3 + i * 0.5, 4.2, { expr: "shout" });
      for (let i = 0; i < 2; i++) { const k = Math.max(0, lt - 0.3 - i * 0.4), x = 4 + i * 9 + 0.5 * 9 * k * k, y = k > 1.0 ? (k - 1) ** 2 * 2.4 : 0; plane(A, "spit", x, y, 12 + i * 4, { ang: -Math.min(0.25, y * 0.25) }); A.fx(12.5 + i * 4, (g, c) => dust(g, c, lt, x - 4, 12.5 + i * 4, 1, 0.6, [160, 180, 120], i)); }
    } },
  // 32 "Mas Hitler tinha outro objetivo ainda maior." — Hitler at the map table turns to the East; the map lamp glows
  { t0: 215.52, fade: 0.25, L: () => loc(undefined, { near: "#3a2c24", far: "#4a382c", kind: "wood", zFar: 10 }, [wall("p38", 4, "#2e3a3a", { h: 6, wid: 12, map: true, panel: "#1e2626" })], true),
    cam: mv([-1, 1.7, -3.6, 40], [-0.4, 1.7, -2.8, 36]), lite: { ...LAMP, rim: "#a8d0ff", key: "#b8c8d0" }, act: (A, lt, u, T) => {
      A.a(HIT_GREY, 551, -1.0, 2.6, { expr: T > 217.8 ? "grin" : "stern", look: 1, facing: 1, prop: T > 216.9 ? ["fist", 0.9] : undefined }); A.sp("deskG", 0, 0, 2.0, { sc: 1.1 });
      A.light((g) => { const [sx, sy, s] = P(A.cam, 1.6, 3.2, 3.95); glow(g, sx, sy, 2.0 * s, "rgba(255,80,60,1)", 0.25 + 0.2 * clamp((T - 217) / 0.8)); });
      A.over((g) => { if (T > 217.85) { g.save(); g.globalAlpha = clamp((T - 217.85) / 0.4); g.font = `bold 60px "DejaVu Sans", sans-serif`; g.fillStyle = "#ff8a6a"; g.textAlign = "center"; g.shadowColor = "#000"; g.shadowBlur = 12; g.fillText("➜ LESTE", VW * 0.72, VH * 0.22); g.restore(); } });
    } },
  // 33a "Em junho de 1941," — short summer night on the river Bug: the barrage lights the horizon
  { t0: 219.02, fade: 0.3, L: () => loc(["#141c3a", "#8a5a6a"], { near: "#1e2620", far: "#2e3a30", zFar: 400 }, [hillL("p39", 120, "#1a2228", 5, 6, 1.5), forest("p39", 50, "birch", "#2a3a2a", 30, 23, { blur: 1, h: 12 })]),
    cam: mv([0, 1.6, -6, 42], [0, 1.7, -5, 40]), lite: MOON, kicks: [[219.6, 4], [220.4, 5]], act: (A, lt, u, T) => {
      A.fx(20, (g, c) => sea(g, c, lt, { crest: "rgba(200,180,200,0.35)", z0: 4, z1: 30, n: 80, seed: 19 }));
      A.light((g) => { for (let i = 0; i < 16; i++) { const at = 219.3 + i * 0.15 + hash(i) * 0.4, k = ((T - at) % 1.1); if (T < at || k > 0.22) continue; glow(g, VW * (0.05 + 0.9 * hash(i * 7)), VH * 0.46, 220, "rgba(255,190,120,1)", 0.7 * (1 - k / 0.22)); } });
      for (let i = 0; i < 5; i++) A.a(sol(WEH, 60 + i), 561 + i, -6 + i * 3, 3 + (i % 2), { expr: "stern", look: 1 }, { dark: 0.85, darkCol: "#0a0a12" });
      A.over((g) => caption(g, "22 DE JUNHO DE 1941", T - 219.4, 2.6));
    } },
  // 33b "rompeu o acordo com Stalin" — the pact is torn in two
  { t0: 221.5, L: () => loc(undefined, { near: "#2a1a14", far: "#2a1a14", zFar: 1 }, [], true), cam: mv([0, 0, -4, 40], [0, 0, -3.4, 38]), act: (A, lt, u, T) => {
      A.over((g) => { const k = clamp((T - 221.75) / 0.9), sp = easeOut(k); g.save(); g.fillStyle = "#1a100c"; g.fillRect(0, 0, VW, VH); g.restore();
        for (const sd of [-1, 1]) { g.save(); g.translate(VW / 2 + sd * sp * 260, VH / 2 + sp * sp * 120); g.rotate(sd * sp * 0.35); g.shadowColor = "rgba(0,0,0,0.6)"; g.shadowBlur = 30; g.fillStyle = "#efe4c8"; g.beginPath(); g.moveTo(sd * 360, -260); g.lineTo(0, -260);
          for (let j = 0; j <= 12; j++) g.lineTo((j % 2 ? 14 : -10) * sd * 0.6, -260 + j * 43); g.lineTo(sd * 360, 260); g.closePath(); g.fill(); g.shadowBlur = 0; g.fillStyle = "#2a1d16"; g.font = `bold 34px "DejaVu Serif", serif`; g.textAlign = "center";
          g.fillText(sd < 0 ? "PACTO DE NÃO" : "AGRESSÃO", sd * 170, -190); for (let i = 0; i < 9; i++) g.fillRect(sd * 40 + (sd < 0 ? -300 : 0), -140 + i * 34, 260, 6); g.restore(); }
        glow(g, VW / 2, VH / 2, 200, "rgba(255,120,60,1)", 0.4 * (1 - k)); });
    } },
  // 33c "e lançou a Operação Barbarossa," — a line of howitzers fires in sequence at dawn (recoil, flash, dust)
  { t0: 223.2, L: () => loc(["#3a4a7a", "#f0a87a"], { near: "#5a5a3a", far: "#7a7a50", kind: "grass", seed: 126 }, [hillL("p40", 150, "#5a5a6a", 7, 10, 2)]),
    cam: hand(mv([-3, 1.3, -6, 44], [3, 1.4, -6, 44]), 0.02), lite: BACK, kicks: [[223.5, 8], [223.8, 8], [224.1, 8], [224.4, 10]], act: (A, lt, u, T) => {
      for (let i = 0; i < 5; i++) { const at = 223.5 + i * 0.3, k = T - at, rc = k > 0 ? Math.exp(-k * 4) * Math.sin(k * 14) * 0.25 + Math.exp(-k * 4) * 0.3 : 0, x = -8 + i * 4.5 - rc, z = 3 + i * 1.6; A.sp("howitzer", x, 0, z, { sc: 1.1 });
        A.fx(z - 0.05, (g, c) => { if (k > 0 && k < 0.1) muzzle(g, c, x + 3.1, 2.4, z, 1.3, 1); for (let j = 0; j < 6; j++) { const a = k * (0.6 + j * 0.15); if (k > 0 && k < 2.5) { const [sx, sy, s] = P(c, x + 3 + a * 3, 2.4 + a * 0.6, z); puff(g, sx, sy, (0.4 + a) * s, [210, 200, 190], 0.6 * clamp(1 - k / 2.5)); } } });
        A.a(sol(WEH, 70 + i), 571 + i, x - 1.2, z + 0.4, { expr: k > -0.1 && k < 0.5 ? "pained" : "stern", crouch: 0.2 }); }
      A.over((g) => bigText(g, "OPERAÇÃO BARBAROSSA", T - 223.8, 1.6, VH * 0.2, 96));
    } },
  // 33d "invadindo a União Soviética com milhões de soldados." — endless columns pour through the sunflower fields
  { t0: 225.25, fade: 0.15, L: () => loc(["#5a8ac8", "#f4e4b4"], { near: "#a8902e", far: "#d8c050", kind: "grass", seed: 128, zFar: 500 }, [hillL("p41", 280, "#9aa0a0", 9, 20, 3), field("p41", 60, "sunflower", "#e8b82a", 13, 1.8, 80, 1.2), field("p41b", 14, "sunflower", "#e8b82a", 19, 1.8, 30, 0)]),
    cam: (u, lt) => C(lt * 1.5, 3.2, -8, 42, -60), lite: NOON, act: (A, lt) => {
      for (let r = 0; r < 4; r++) marchCol(A, (i) => sol(WEH, 80 + i + r), lt, 22, 30, 18 + r * 6, -1.5, 1.4, 1, 1, {}, { expr: "stern" }, 600 + r * 40);
      for (let i = 0; i < 4; i++) tank(A, "panzer", 30 - lt * 3 - i * 12, 45, { vel: 3, dir: -1, dustCol: [200, 190, 140], t: lt + i });
      A.over((g) => counter(g, 3000000 * clamp((lt - 1.8) / 1.0), "SOLDADOS DO EIXO", lt - 1.7, 1.6, VH * 0.78, "#f6efe0", 86));
    } },
  // 34 "O ataque abriu uma gigantesca frente de batalha no leste europeu." — icy map: the front from the Baltic to the Black Sea, three spearheads
  { t0: 228.87, fade: 0.2, L: () => europe("p42", ST.ice), cam: mv([9, 3, -24, 40], [10, 3.2, -21, 40]), act: (A, lt, u, T) => {
      hl(A, "USSR", 1, "#b84a3a", 0.28); frontLine(A, [21.2, 56.5, 22, 54.8, 23.6, 53.9, 24, 52, 24.2, 50.5, 23.6, 48.8, 25.5, 47.6, 28.2, 45.5], (T - 229.6) / 1.4, "#3a4a6a", 8);
      arrow(A, [22, 55], [30, 59.4], (T - 230.4) / 1.4, "#2a3a5a", 0.36); arrow(A, [24, 52.4], [36, 55.5], (T - 230.7) / 1.4, "#2a3a5a", 0.36); arrow(A, [24.5, 49], [34, 48], (T - 231.0) / 1.4, "#2a3a5a", 0.36);
    } },
  // 35a "As forças alemãs avançaram rapidamente," — panzers race across the open steppe
  { t0: 233.18, fade: 0.15, L: () => loc(["#4a8ad0", "#f0e8c8"], { near: "#a89a5a", far: "#d0c080", kind: "grass", seed: 130, zFar: 500 }, [hillL("p43", 260, "#a8a890", 13, 10, 3), clouds("p43", 320, ["#ffffff", "#a8c0d8"], 51, 30, 120, 20, 3)]),
    cam: hand((u, lt) => C(-6 + lt * 9, 1.0, -7, 42), 0.02), lite: NOON, act: (A, lt) => { for (let i = 0; i < 3; i++) tank(A, "panzer", -2 + lt * 10 - i * 8, 3 + i * 4, { vel: 10, dustCol: [210, 196, 150], t: lt + i * 2 }); } },
  // 35b "conquistando territórios e cercando cidades." — the pincers close around a burning city
  { t0: 235.35, fade: 0.15, L: () => loc(["#7a8aa0", "#e0d4bc"], { near: "#8a8a5a", far: "#a8a87a", kind: "grass", seed: 132, zFar: 600 }, [skyline("p44", 220, "#6a6070", "moscow", 23, 2.5)]),
    cam: mv([0, 26, -60, 40, -200], [0, 30, -54, 40, -210]), lite: DAY, act: (A, lt, u, T) => {
      A.fx(219, (g, c) => { for (const x of [-20, 6, 30]) smokeCol(g, c, lt, x, 10, 219, { h: 90, w: 12, col: [60, 52, 52], a: 0.6, seed: x }); });
      const k = smooth(clamp((T - 236.6) / 1.4)); for (let i = 0; i < 6; i++) { tank(A, "panzer", -80 + k * 50 + i * 2, 120 - i * 12, { vel: 6, dustCol: [190, 180, 140] }); tank(A, "panzer", 80 - k * 50 - i * 2, 120 - i * 12, { vel: 6, dir: -1, dustCol: [190, 180, 140] }); }
    } },
  // 36a "Entretanto, o inverno soviético," — blizzard: soldiers freeze, breath steaming
  { t0: 238.63, fade: 0.25, L: () => loc(["#8a9ab0", "#e8eef4"], { near: "#e4eaf0", far: "#f0f4f8", kind: "snow", seed: 134 }, [forest("p45", 60, "pine", "#5a6a74", 26, 29, { blur: 3, h: 14, snow: true })]),
    cam: hand(mv([0, 1.5, -3.6, 40], [0, 1.5, -3.0, 36]), 0.015), lite: COLD, wx: ["snow", 420, 0.8], act: (A, lt) => {
      for (let i = 0; i < 3; i++) { const x = -1.6 + i * 1.6, z = 2 + (i % 2) * 0.6; A.a(v(sol(WEH, 90 + i), { scarf: "#6a5a4a", cap: "#e8ecf0" }), 581 + i, x, z, { expr: i === 1 ? "pained" : "sad", crouch: 0.25, headTilt: 6 * Math.sin(lt * 18 + i) * 0.3 }); A.fx(z - 0.01, (g, c) => breath(g, c, lt, x + 0.1, 1.95, z, 1, i)); }
      A.light((g) => tint(g, "#dfe8f4", 0.18, "screen"));
    } },
  // 36b "a resistência do Exército Vermelho" — white-clad ski troops sweep through the birches; a T-34 bursts from the snow
  { t0: 240.45, fade: 0.15, L: () => loc(["#9aaac0", "#eef2f6"], { near: "#e6ecf2", far: "#f2f6fa", kind: "snow", seed: 136 }, [forest("p46", 30, "birch", "#000", 34, 31, { blur: 1, h: 14, snow: true }), forest("p46b", 90, "pine", "#6a7a84", 30, 33, { blur: 2.5, h: 16, snow: true })]),
    cam: (u, lt) => C(-lt * 3, 1.5, -6, 42), lite: COLD, wx: ["snow", 200, 0.6], act: (A, lt) => {
      for (let i = 0; i < 6; i++) { const x = 8 - lt * 5.5 - i * 1.8, z = 3 + (i % 3) * 1.6; A.s(sol(REDW, i), 591 + i, x, z, { mode: "march", phase: (lt * 1.2 + i * 0.3) % 1, stride: 1.25, expr: "shout" }, { flip: true, rot: -0.1 }); A.fx(z + 0.01, (g, c) => { const [sx, sy, s] = P(c, x, 0.02, z); g.strokeStyle = "#5a4a3a"; g.lineWidth = Math.max(1.5, 0.04 * s); g.beginPath(); g.moveTo(sx - 0.9 * s, sy); g.lineTo(sx + 0.9 * s, sy); g.stroke(); }); }
      tank(A, "t34W", 12 - lt * 4, 9, { vel: 4, dir: -1, dustCol: [240, 244, 250] });
    } },
  // 36c "e os problemas de abastecimento" — a supply truck sinks in the mud, wheels spin, men push, mud flies
  { t0: 242.55, fade: 0.15, L: () => loc(["#6a6e72", "#b8b4a8"], { near: "#4a3e30", far: "#6a5c48", kind: "mud", seed: 138 }, [forest("p47", 60, "birch", "#6a6a4a", 24, 37, { blur: 1.5, h: 12 })]),
    cam: mv([0, 1.4, -6, 42], [0.4, 1.4, -5.4, 40]), lite: GREY, wx: ["rain", 120, 0.3], act: (A, lt) => {
      const rock = 0.02 * Math.sin(lt * 9); A.sp("truck", 0.5, -0.35, 4, { rot: rock });
      A.fx(3.9, (g, c) => { for (let i = 0; i < 24; i++) { const k = ((lt * 2 + i / 24) % 1), vx = -3 - hash(i) * 3, vy = 2 + hash(i + 2) * 3, x = -1.6 + vx * k * 0.5, y = 0.3 + vy * k * 0.5 - 4.9 * (k * 0.5) ** 2; if (y < 0) continue; const [sx, sy, s] = P(c, x, y, 3.9); g.fillStyle = "#3a2c20"; g.beginPath(); g.arc(sx, sy, Math.max(1.5, 0.05 * s), 0, 7); g.fill(); } });
      for (let i = 0; i < 3; i++) A.s(sol(WEH, 100 + i), 601 + i, 4.6 + i * 0.6, 3.6 + i * 0.3, { mode: "march", phase: 0.25 + 0.05 * Math.sin(lt * 4 + i), stride: 0.6, expr: "pained" }, { flip: true, rot: -0.25 });
      A.fx(4.2, (g, c) => { const [sx, sy, s] = P(c, 0, 0.02, 4.2); g.fillStyle = "#3a2e22"; g.beginPath(); g.ellipse(sx, sy, 4 * s, 0.25 * s, 0, 0, 7); g.fill(); });
    } },
  // 36d "começaram a dificultar o avanço alemão." — a whitewashed panzer frozen in place, frost creeping, a sentry shivers
  { t0: 244.95, fade: 0.2, L: () => loc(["#3a4a6a", "#a8b4c8"], { near: "#d8e0ea", far: "#e8eef4", kind: "snow", seed: 140 }, [forest("p48", 70, "pine", "#3a4a5a", 24, 41, { blur: 2, h: 14, snow: true })]),
    cam: mv([0, 1.5, -6.5, 40], [0, 1.4, -5.6, 38]), lite: MOON, wx: ["snow", 260, 0.7], act: (A, lt) => {
      tank(A, "panzerW", 0, 4.5, { vel: 0 }); panel(A, 4.45, (w) => { w.poly([[-3.4, 0], [3.4, 0], [3.0, 0.5], [1, 0.7], [-1, 0.6], [-3, 0.4]], "#eef2f6", 2); w.poly([[-2.4, 1.72], [2.4, 1.72], [2.2, 1.86], [-2.2, 1.9]], "#f4f8fa", 1.5); });
      A.a(v(sol(WEH, 110), { scarf: "#5a4a3a", cap: "#e0e6ec" }), 611, 3.6, 3.6, { expr: "pained", crouch: 0.3, headTilt: 4 * Math.sin(lt * 25) }); A.fx(3.59, (g, c) => breath(g, c, lt, 3.7, 1.95, 3.6, 1, 3));
      A.light((g) => { const k = clamp(lt / 2.5); g.save(); const gr = g.createRadialGradient(VW / 2, VH / 2, VH * 0.3, VW / 2, VH / 2, VW * 0.6); gr.addColorStop(0, "rgba(230,240,255,0)"); gr.addColorStop(1, `rgba(230,240,255,${0.55 * k})`); g.fillStyle = gr; g.fillRect(0, 0, VW, VH); g.restore(); });
    } },
  // 37a "E, enquanto a Europa estava em chamas," — a burning village in the snow, soldiers' silhouettes trudge past
  { t0: 247.35, fade: 0.3, L: () => loc(["#0a0a16", "#5a2418"], { near: "#3a3440", far: "#4a404a", kind: "snow", seed: 142 }, [city("p49", 30, { pal: ["#3a2e2a", "#4a3a30"], seed: 121, roof: "gable", roofCol: "#2a2020", floors: [1, 2], hgt: [5, 7], lit: 0.4, win: "#ff9a4a", snow: true, blur: 1 }), forest("p49", 70, "pine", "#141820", 20, 43, { blur: 2, h: 14 })]),
    cam: mv([0, 1.5, -6, 42], [0, 1.6, -5, 40]), lite: NIGHTFIRE, bloom: 0.9, act: (A, lt) => {
      A.fx(29, (g, c) => { for (const x of [-12, -2, 9, 18]) { fire(g, c, lt, x, 4, 29, 3.5, x); smokeCol(g, c, lt, x, 8, 29.5, { h: 30, w: 5, col: [30, 24, 26], a: 0.7, seed: x }); } embers(g, c, lt, 0, 28, 40, 60, 20, 9); });
      marchCol(A, (i) => sol(WEH, 120 + i), lt, 8, 7, 7, -1.0, 1.5, 1, 1, { dark: 0.85, darkCol: "#120808" }, { expr: "sad" }, 620);
    } },
  // 37b "outro acontecimento mudaria completamente o rumo da guerra." — dawn in the Pacific: a Japanese carrier launches its fighters
  { t0: 249.6, fade: 0.35, L: () => loc(["#2a3a6a", "#ffb47a"], { near: "#2a3a5a", far: "#6a6a8a", zFar: 700 }, [clouds("p50", 320, ["#ffc090", "#3a4a7a"], 55, 20, 90, 18, 4)]),
    cam: mv([-10, 14, -60, 40, 30], [0, 15, -55, 40, 20]), lite: BACK, act: (A, lt, u, T) => {
      A.fx(400, (g, c) => sea(g, c, lt, { crest: "rgba(255,210,170,0.35)", glitter: [40, "255,200,150"], z0: -50, z1: 700, n: 220, seed: 23 }));
      A.light((g) => { sun(g, VW * 0.64, VH * 0.56, 40, "255,190,120"); rays(g, VW * 0.64, VH * 0.56, VW, 0.12, "255,180,120", 16, lt); });
      ship(A, "kaga", 0, 160, { vel: 3 }); for (let i = 0; i < 3; i++) { const k = Math.max(0, lt - 0.5 - i * 0.9), x = 60 + 0.5 * 30 * k * k, y = 19 + (k > 1.1 ? (k - 1.1) ** 2 * 10 : 0); if (k > 0 || i === 0) plane(A, "zero", Math.min(x, 400), y, 159, { sc: 1.6, ang: -Math.min(0.3, (y - 19) * 0.05) }); }
    } },
];
/** tracer stream between two moving points (world) */
function tracers2(A: Sc, T: number, x0: number, y0: number, z0: number, x1: number, y1: number, z1: number, t0: number, t1: number) {
  if (T < t0 || T > t1) return; A.light((g) => { for (let i = 0; i < 6; i++) { const k = ((T * 3 + i / 6) % 1), a = [lerp(x0, x1, k), lerp(y0, y1, k), lerp(z0, z1, k)], b = [lerp(x0, x1, k + 0.06), lerp(y0, y1, k + 0.06), lerp(z0, z1, k + 0.06)];
    const [ax, ay, s] = P(A.cam, a[0], a[1], a[2]), [bx, by] = P(A.cam, b[0], b[1], b[2]); g.save(); g.globalCompositeOperation = "lighter"; g.strokeStyle = "rgba(255,220,140,0.95)"; g.lineWidth = Math.max(2, 0.06 * s); g.lineCap = "round"; g.beginPath(); g.moveTo(ax, ay); g.lineTo(bx, by); g.stroke(); g.restore(); } });
}
import { para } from "./kit";
import { WEH as _W } from "./kit";
void _W;
