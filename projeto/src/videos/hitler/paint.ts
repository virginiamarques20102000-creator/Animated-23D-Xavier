// Painted locations for the 2.5D engine: each returns vertical layers (world metres, y up), a ground and a sky.
import { WP, Layer, Ground, Sprite, rng } from "./engine";
import { INK } from "./toon";

export type Loc = { layers: Layer[]; ground: Ground; sky?: [string, string]; interior?: boolean };
const Lr = (key: string, z: number, x0: number, x1: number, y0: number, y1: number, ppm: number, paint: (w: WP) => void, blur?: number): Layer => ({ key, z, x0, x1, y0, y1, ppm, paint, blur });

// ---------------- primitives ----------------
export const emblem = (w: WP, cx: number, cy: number, r: number) => { // white disc + abstract black eagle (no swastika)
  w.ell(cx, cy, r, r, "#f4efe6", 2);
  w.poly([[cx - 0.8 * r, cy + 0.15 * r], [cx - 0.2 * r, cy + 0.05 * r], [cx, cy + 0.38 * r], [cx + 0.2 * r, cy + 0.05 * r], [cx + 0.8 * r, cy + 0.15 * r], [cx + 0.6 * r, cy - 0.15 * r],
    [cx + 0.15 * r, cy - 0.15 * r], [cx, cy - 0.62 * r], [cx - 0.15 * r, cy - 0.15 * r], [cx - 0.6 * r, cy - 0.15 * r]], "#1a1414", 0);
};
export const banner = (w: WP, cx: number, top: number, bw: number, bh: number) => {
  w.poly([[cx - bw / 2, top], [cx + bw / 2, top], [cx + bw / 2, top - bh], [cx, top - bh - bw * 0.25], [cx - bw / 2, top - bh]], "#b3221c", 2.5);
  w.line([[cx - bw / 2 + 0.06 * bw, top - 0.05], [cx - bw / 2 + 0.06 * bw, top - bh]], 2, "rgba(0,0,0,0.25)");
  emblem(w, cx, top - bh * 0.3, bw * 0.36);
};
type Fac = { wall: string; floors: number; cols: number; roof?: "gable" | "hip" | "flat"; roofCol?: string; win?: string; lit?: number; shutter?: string; door?: number;
  ruin?: boolean; banner?: boolean; snow?: boolean; seed?: number; sign?: string; poster?: boolean; dark?: number };
export const facade = (w: WP, x: number, wid: number, hgt: number, f: Fac) => {
  const r = rng(f.seed ?? Math.round(Math.abs(x) * 97 + wid * 13 + 5));
  const top: number[][] = [];
  if (f.ruin) { const n = 7; for (let i = n; i >= 0; i--) top.push([x + (wid * i) / n + (i % n ? (r() - 0.5) * 0.6 : 0), hgt * (0.35 + 0.65 * r())]); }
  else top.push([x + wid, hgt], [x, hgt]);
  const body = [[x, 0], [x + wid, 0], ...top];
  w.poly(body, f.wall, 3);
  w.clip(body, () => {
    const fh = hgt / f.floors, cw = wid / f.cols;
    for (let fl = 0; fl < f.floors; fl++) {
      if (fl) w.line([[x, fl * fh], [x + wid, fl * fh]], 2, "rgba(40,25,20,0.3)");
      for (let c = 0; c < f.cols; c++) {
        const cx = x + cw * (c + 0.5), y0 = fl * fh + fh * 0.22, ww = cw * 0.44, wh = fh * 0.5;
        if (fl === 0 && f.door === c) { w.rect(cx - cw * 0.26, 0, cw * 0.52, fh * 0.78, "#5a3a26", 2.5); w.ell(cx, fh * 0.78, cw * 0.26, cw * 0.18, "#5a3a26", 2.5, 0, Math.PI); continue; }
        const lit = r() < (f.lit ?? 0), hole = f.ruin && r() < 0.5;
        w.rect(cx - ww / 2, y0, ww, wh, hole ? "#1b1513" : lit ? "#ffcf6e" : (f.win ?? "#4d6a86"), 2.5);
        if (!hole) { w.line([[cx, y0], [cx, y0 + wh]], 1.6, "#e9e2d0"); w.line([[cx - ww / 2, y0 + wh * 0.6], [cx + ww / 2, y0 + wh * 0.6]], 1.6, "#e9e2d0");
          if (!lit) w.poly([[cx - ww / 2, y0 + wh], [cx - ww * 0.1, y0 + wh], [cx - ww / 2, y0 + wh * 0.45]], "rgba(255,255,255,0.18)", 0); }
        w.rect(cx - ww / 2 - 0.08, y0 - 0.12, ww + 0.16, 0.12, f.snow ? "#f2f4f6" : "rgba(255,255,255,0.35)", 1.5);
        if (f.shutter && !hole) { w.rect(cx - ww / 2 - ww * 0.32, y0, ww * 0.3, wh, f.shutter, 2); w.rect(cx + ww / 2 + ww * 0.02, y0, ww * 0.3, wh, f.shutter, 2); }
      }
    }
    if (f.poster) for (let c = 0; c < f.cols; c += 2) { const cx = x + cw * (c + 0.5) + cw * 0.5; w.rect(cx - 0.4, 0.9, 0.8, 1.1, ["#e8dcc0", "#d9c9a0", "#c9b48a"][c % 3], 1.5);
      w.rect(cx - 0.3, 1.45, 0.6, 0.4, "#2a2220", 0); w.line([[cx - 0.3, 1.2], [cx + 0.3, 1.2]], 3, "#8a2a22"); w.line([[cx - 0.3, 1.05], [cx + 0.2, 1.05]], 2, "#4a4038"); }
    if (f.banner) { const nb = wid > 9 ? 2 : 1; for (let k = 0; k < nb; k++) banner(w, x + (wid * (k + 0.5)) / nb, hgt - 0.4, Math.min(1.7, wid * 0.2), hgt * 0.62); }
    const g = w.g.createLinearGradient(x, 0, x + wid, 0); g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(0.85, "rgba(0,0,0,0)"); g.addColorStop(1, "rgba(30,15,30,0.28)");
    w.rect(x, 0, wid, hgt, g, 0);
    w.rect(x, 0, wid, 0.5, "rgba(40,30,25,0.25)", 0);
    if (f.dark) w.rect(x, 0, wid, hgt + 5, `rgba(16,12,24,${f.dark})`, 0);
  });
  w.poly(body, null, 3);
  if (f.sign) { w.rect(x + wid / 2 - 2.2, hgt * 0.62, 4.4, 0.9, "#efe6cf", 2.5); w.text(f.sign, x + wid / 2, hgt * 0.62 + 0.45, 0.55, "#2a1d16"); }
  if (!f.ruin) {
    const rc = f.roofCol ?? "#a8483a";
    if (f.roof === "gable") { w.poly([[x - 0.3, hgt], [x + wid + 0.3, hgt], [x + wid / 2, hgt + wid * 0.42]], rc, 3);
      for (let k = 1; k < 5; k++) { const yy = hgt + (wid * 0.42 * k) / 5, hw = (wid / 2 + 0.3) * (1 - k / 5); w.line([[x + wid / 2 - hw, yy], [x + wid / 2 + hw, yy]], 1.5, "rgba(0,0,0,0.25)"); }
      if (f.snow) w.poly([[x - 0.3, hgt], [x + wid / 2, hgt + wid * 0.42], [x + wid + 0.3, hgt], [x + wid / 2, hgt + wid * 0.36]], "#f4f6f8", 2); }
    else if (f.roof === "hip") { w.poly([[x - 0.3, hgt], [x + wid + 0.3, hgt], [x + wid * 0.82, hgt + wid * 0.28], [x + wid * 0.18, hgt + wid * 0.28]], rc, 3);
      w.rect(x + wid * 0.3, hgt + wid * 0.1, wid * 0.12, wid * 0.12, f.win ?? "#4d6a86", 2); }
    else w.rect(x - 0.25, hgt - 0.1, wid + 0.5, 0.55, f.roofCol ?? "#8e8070", 3);
  } else if (f.snow) w.path(top, false);
};
export const tree = (w: WP, x: number, h: number, col = "#5c8a3c", seed = 1, y = 0) => {
  const r = rng(seed * 31 + 7);
  w.poly([[x - h * 0.04, y], [x + h * 0.04, y], [x + h * 0.025, y + h * 0.55], [x - h * 0.025, y + h * 0.55]], "#6a4a30", 2.5);
  const blobs = [[0, 0.62, 0.3], [-0.18, 0.5, 0.22], [0.2, 0.52, 0.22], [0.05, 0.8, 0.22], [-0.1, 0.72, 0.2]];
  for (const [bx, by, br] of blobs) w.ell(x + bx * h + (r() - 0.5) * 0.05 * h, y + by * h, br * h, br * h * 0.92, col, 2.5);
  for (const [bx, by, br] of blobs.slice(0, 3)) w.ell(x + bx * h - 0.04 * h, y + by * h - 0.05 * h, br * h * 0.55, br * h * 0.45, "rgba(255,255,220,0.13)", 0);
};
export const deadTree = (w: WP, x: number, h: number, seed = 1) => {
  const r = rng(seed * 13 + 3);
  w.poly([[x - h * 0.035, 0], [x + h * 0.035, 0], [x + h * 0.012, h], [x - h * 0.012, h]], "#3a302a", 2.5);
  for (let k = 0; k < 5; k++) { const y0 = h * (0.4 + 0.12 * k), s = k % 2 ? 1 : -1; w.line([[x, y0], [x + s * h * (0.15 + 0.1 * r()), y0 + h * (0.12 + 0.1 * r())]], 4 - k * 0.5, "#3a302a"); }
};
export const mountains = (w: WP, x0: number, x1: number, base: number, hmax: number, col: string, seed: number, snow = true) => {
  const r = rng(seed), pts: number[][] = [[x0, base - 5]]; const peaks: number[][] = [];
  for (let x = x0; x <= x1; x += (x1 - x0) / 14) { const h = hmax * (0.45 + 0.55 * r()); pts.push([x, base + h * 0.55], [x + (x1 - x0) / 28, base + h]); peaks.push([x + (x1 - x0) / 28, base + h]); }
  pts.push([x1, base - 5]);
  w.poly(pts, w.vgrad(base, base + hmax, col, "#c9d2dc"), 3);
  if (snow) for (const [px, py] of peaks) if (py > base + hmax * 0.75) w.poly([[px - hmax * 0.12, py - hmax * 0.16], [px, py], [px + hmax * 0.12, py - hmax * 0.16], [px + hmax * 0.04, py - hmax * 0.12], [px - hmax * 0.03, py - hmax * 0.14]], "#f3f6f8", 2);
};
const hills = (w: WP, x0: number, x1: number, h: number, col: string, seed: number, ink = 3) => {
  const r = rng(seed), pts: number[][] = [[x0, -5]];
  for (let i = 0; i <= 40; i++) { const x = x0 + ((x1 - x0) * i) / 40; pts.push([x, h * (0.55 + 0.25 * Math.sin(i * 0.7 + seed) + 0.2 * r())]); }
  pts.push([x1, -5]); w.poly(pts, col, ink);
};
export const barbed = (w: WP, x0: number, x1: number, ys: number[], col = "#2a2624") => {
  for (const y of ys) { const pts: number[][] = []; for (let x = x0; x <= x1; x += 0.5) pts.push([x, y + Math.sin(x * 3.1) * 0.03]); w.line(pts, 1.6, col);
    for (let x = x0; x <= x1; x += 0.35) w.line([[x - 0.05, y - 0.05], [x + 0.05, y + 0.05]], 1.4, col); }
};
const columns = (w: WP, cx: number, wid: number, h: number, n: number, col: string, base = 0) => {
  for (let i = 0; i < n; i++) { const x = cx - wid / 2 + (wid * (i + 0.5)) / n, cw = (wid / n) * 0.42;
    w.rect(x - cw / 2, base, cw, h, w.vgrad(base, base + h, col, "#f2ead8"), 2.5); w.rect(x - cw * 0.7, base + h - 0.3, cw * 1.4, 0.3, col, 2); w.rect(x - cw * 0.7, base, cw * 1.4, 0.3, col, 2);
    w.line([[x - cw * 0.2, base + 0.4], [x - cw * 0.2, base + h - 0.4]], 1.5, "rgba(0,0,0,0.15)"); }
};
const church = (w: WP, x: number, s = 1, col = "#efe6d2") => {
  w.rect(x - 5 * s, 0, 10 * s, 9 * s, col, 3); w.poly([[x - 5.4 * s, 9 * s], [x + 5.4 * s, 9 * s], [x, 13 * s]], "#a8483a", 3);
  w.rect(x - 1.8 * s, 0, 3.6 * s, 20 * s, col, 3); w.poly([[x - 2.1 * s, 20 * s], [x + 2.1 * s, 20 * s], [x, 31 * s]], "#3f6b5a", 3);
  w.ell(x, 16.5 * s, 1 * s, 1 * s, "#f4efe6", 2); w.line([[x, 16.5 * s], [x, 17.2 * s]], 2); w.line([[x, 16.5 * s], [x + 0.5 * s, 16.4 * s]], 2);
  w.line([[x, 31 * s], [x, 33 * s]], 2.5); w.line([[x - 0.6 * s, 32.2 * s], [x + 0.6 * s, 32.2 * s]], 2.5);
  w.ell(x, 12 * s, 0.6 * s, 1.2 * s, "#4d6a86", 2);
};
const PAL = { austria: ["#ecc96e", "#efe0bc", "#e09a68", "#cfd9ac", "#f2c1a4", "#e6d290"], berlin: ["#b9a78f", "#a89a86", "#c9b89a", "#9a8f80", "#b3a28c"], ruin: ["#7d7268", "#8b8076", "#6f665e", "#958a7e"] };
const row = (w: WP, x0: number, x1: number, o: { pal: string[]; floors: [number, number]; hgt: [number, number]; roof?: "gable" | "hip" | "flat"; seed: number; gap?: [number, number] } & Partial<Fac>) => {
  const r = rng(o.seed); let x = x0;
  while (x < x1) {
    const wid = 6 + r() * 4, fl = Math.round(o.floors[0] + r() * (o.floors[1] - o.floors[0])), h = o.hgt[0] + r() * (o.hgt[1] - o.hgt[0]);
    if (o.gap && x + wid > o.gap[0] && x < o.gap[1]) { x = o.gap[1]; continue; }
    facade(w, x, wid, h, { ...o, wall: o.pal[Math.floor(r() * o.pal.length)], floors: fl, cols: Math.max(2, Math.round(wid / 2.2)), door: r() < 0.6 ? 1 : undefined, seed: Math.round(x * 31 + o.seed) });
    x += wid + (o.roof === "gable" || o.roof === "hip" ? 0.6 : 0);
  }
};

// ---------------- locations ----------------
const cache = new Map<string, Loc>();
export const loc = (id: string, v = ""): Loc => {
  const k = id + "|" + v; let L = cache.get(k); if (L) return L;
  L = build(id, v, k); cache.set(k, L); return L;
};
const has = (v: string, s: string) => v.split(",").includes(s);
const build = (id: string, v: string, K: string): Loc => {
  const night = has(v, "night"), dusk = has(v, "dusk"), grey = has(v, "grey"), ban = has(v, "banners");
  switch (id) {
    case "austria": return {
      sky: dusk ? ["#e59a72", "#fde0b0"] : ["#6fa6d9", "#dceaf0"],
      ground: { near: "#a8957a", far: "#c9bba0", kind: "cobble", zFar: 16 },
      layers: [
        Lr(K + "m", 320, -330, 330, -5, 150, 5, (w) => { mountains(w, -330, 330, 0, 120, "#6f86a6", 3); mountains(w, -300, 300, -2, 70, "#5d7a8e", 9, false); }, 2),
        Lr(K + "c", 60, -70, 70, -2, 40, 26, (w) => { hills(w, -70, 70, 8, "#7f9a58", 4); for (let i = 0; i < 14; i++) tree(w, -66 + i * 10, 9 + (i % 3) * 2, "#56803c", i, 3); church(w, 9, 1); }, 1),
        Lr(K + "h", 16, -42, 42, -1, 17, 95, (w) => row(w, -42, 42, { pal: PAL.austria, floors: [2, 3], hgt: [7.5, 10.5], roof: "gable", roofCol: "#b0503a", seed: 11, shutter: "#4f7a52", win: "#5a7f9a" })),
        Lr(K + "t", 11, -36, 36, -1, 9, 95, (w) => { for (let i = 0; i < 6; i++) tree(w, -33 + i * 13, 7.5, "#5f9142", i + 20); }),
      ],
    };
    case "vienna": return {
      sky: ["#7f8a98", "#c8cac6"],
      ground: { near: "#8f897e", far: "#aaa498", kind: "stone", zFar: 18 },
      layers: [
        Lr(K + "f", 45, -60, 60, -1, 30, 30, (w) => row(w, -60, 60, { pal: ["#b8ab94", "#c9bea6", "#a99c86"], floors: [4, 5], hgt: [14, 18], roof: "flat", seed: 5, gap: [-14, 14] }), 1),
        Lr(K + "a", 20, -16, 16, -1, 22, 80, (w) => {
          w.rect(-14, 0, 28, 15, "#d9ceb4", 3); for (let fl = 0; fl < 3; fl++) for (let c = 0; c < 10; c++) { const x = -13 + c * 2.8 + 0.7; if (Math.abs(x + 0.5) < 5) continue; w.rect(x, 1.2 + fl * 4.6, 1.2, 2.4, "#55697d", 2.5); w.ell(x + 0.6, 3.6 + fl * 4.6, 0.6, 0.45, "#55697d", 2.5, 0, Math.PI); }
          w.rect(-5.5, 0, 11, 15, "#e4dac2", 3); columns(w, 0, 10, 12, 6, "#efe6d0", 0.6); w.rect(-5.8, 12.6, 11.6, 1.2, "#e4dac2", 3);
          w.text("AKADEMIE DER BILDENDEN KÜNSTE", 0, 13.2, 0.55, "#4a3a2a"); w.poly([[-6, 13.8], [6, 13.8], [0, 17]], "#e4dac2", 3); w.ell(0, 15, 0.8, 0.6, "#c9b48a", 2);
          w.rect(-14.4, 14.8, 28.8, 0.5, "#c9bca2", 3); for (let i = 0; i < 4; i++) w.rect(-6 - i * 0.3, 0.6 - i * 0.2 - 0.2, 12 + i * 0.6, 0.2, "#cfc4ae", 2);
          w.rect(-1.1, 0.6, 2.2, 3.2, "#4a3324", 2.5);
        }),
        Lr(K + "l", 9, -20, 20, -1, 6, 110, (w) => { for (const x of [-9, 9]) { w.rect(x - 0.08, 0, 0.16, 4.2, "#2a2a2e", 2); w.poly([[x - 0.35, 4.2], [x + 0.35, 4.2], [x + 0.2, 4.8], [x - 0.2, 4.8]], "#e8d9a0", 2.5); } }),
      ],
    };
    case "trench": return {
      sky: ["#4e4b4a", "#9c9283"],
      ground: { near: "#3f3225", far: "#6a5844", kind: "mud", zFar: 120 },
      layers: [
        Lr(K + "h", 220, -260, 260, -5, 60, 5, (w) => hills(w, -260, 260, 30, "#5a5246", 2), 2),
        Lr(K + "d", 40, -60, 60, -2, 16, 30, (w) => { for (let i = 0; i < 9; i++) deadTree(w, -55 + i * 13 + (i % 2) * 4, 7 + (i % 3) * 3, i); for (let i = 0; i < 12; i++) w.ell(-55 + i * 10, 0, 2.5, 0.5, "#3e3226", 2); }, 1),
        Lr(K + "w", 10, -30, 30, -1, 3, 90, (w) => { for (let x = -29; x < 30; x += 3) { w.line([[x - 0.5, 0], [x + 0.5, 1.3]], 3, "#3a2e24"); w.line([[x + 0.5, 0], [x - 0.5, 1.3]], 3, "#3a2e24"); } barbed(w, -30, 30, [0.4, 0.8, 1.2]); }),
        Lr(K + "t", 1.6, -12, 12, -3, 1.9, 140, (w) => {
          w.rect(-12, -3, 24, 4.4, "#4a3a2a", 0); for (let x = -12; x < 12; x += 0.5) w.rect(x, -3, 0.48, 4.3, x % 1 ? "#6b5034" : "#5e462e", 2);
          for (let x = -12; x < 12; x += 0.7) w.ell(x + 0.35, 1.45, 0.38, 0.2, "#a08e66", 2.5); for (let x = -11.65; x < 12; x += 0.7) w.ell(x + 0.35, 1.72, 0.38, 0.2, "#968459", 2.5);
        }),
      ],
    };
    case "berlin": return {
      sky: night ? ["#0b1228", "#29324e"] : grey ? ["#6d7278", "#b4b0a6"] : dusk ? ["#5a5f80", "#e9b08a"] : ["#86a9c6", "#e2dccb"],
      ground: { near: night ? "#3a3a44" : "#857d72", far: night ? "#4a4a56" : "#aba293", kind: "cobble", zFar: 30 },
      layers: [
        Lr(K + "s", 120, -160, 160, -2, 40, 10, (w) => { for (let i = 0; i < 20; i++) { const x = -150 + i * 16; w.rect(x, 0, 12, 14 + (i % 4) * 4, night ? "#2a2d3e" : "#9a9890", 2); } w.ell(30, 26, 6, 6, night ? "#2a2d3e" : "#8f9a8a", 2, 0, Math.PI); w.rect(24, 0, 12, 26, night ? "#2a2d3e" : "#9a9890", 2); }, 1.5),
        Lr(K + "g", 70, -16, 16, -1, 26, 40, (w) => { // Brandenburg gate
          const c = night ? "#6d6a72" : "#d8cdb2"; w.rect(-13, 0, 26, 1, c, 3); columns(w, 0, 24, 13, 12, c, 1); w.rect(-13.5, 14, 27, 2.6, c, 3); w.rect(-6, 16.6, 12, 2.2, c, 3);
          w.poly([[-2.4, 18.8], [2.4, 18.8], [2.8, 21.6], [1.2, 22.4], [0, 23.6], [-1.2, 22.4], [-2.8, 21.6]], night ? "#3a3a40" : "#3f6b5a", 2.5);
          if (ban) for (const x of [-11.5, 11.5]) banner(w, x, 14, 1.4, 9);
        }),
        Lr(K + "f", 18, -48, 48, -1, 24, 85, (w) => row(w, -48, 48, { pal: PAL.berlin, floors: [4, 5], hgt: [14, 19], roof: "flat", seed: 23, gap: [-7, 7], lit: night ? 0.35 : 0, banner: ban, poster: has(v, "posters") || grey, win: night ? "#1d2436" : "#4d6278", dark: night ? 0.35 : 0 })),
        Lr(K + "l", 8, -24, 24, -1, 5.5, 110, (w) => { for (const x of [-6.5, 6.5, -19, 19]) { w.rect(x - 0.09, 0, 0.18, 4.4, "#26262c", 2); w.poly([[x - 0.32, 4.4], [x + 0.32, 4.4], [x + 0.18, 5], [x - 0.18, 5]], night ? "#ffd98a" : "#d9d0a8", 2.5); } }),
      ],
    };
    case "hall": return {
      interior: true, ground: { near: "#5e4128", far: "#7a5a3a", kind: "wood", zFar: 7, xr: 14 },
      layers: [
        Lr(K + "w", 7, -13, 13, -1, 9, 85, (w) => {
          w.rect(-13, -1, 26, 10, "#d8c095", 0); w.rect(-13, -1, 26, 2.4, "#6e4a2e", 3); for (let x = -12; x < 13; x += 1.2) w.line([[x, -1], [x, 1.4]], 2, "#4e331f");
          for (let i = -2; i <= 2; i++) { const x = i * 4.6; w.rect(x - 0.8, 2.4, 1.6, 2.8, night ? "#26304a" : "#a9c2d6", 3); w.ell(x, 5.2, 0.8, 0.6, night ? "#26304a" : "#a9c2d6", 3, 0, Math.PI); w.line([[x, 2.4], [x, 5.8]], 2, "#6e4a2e"); }
          w.rect(-13, 7.2, 26, 1.8, "#5a3c24", 3); for (let x = -12; x < 13; x += 2.4) w.rect(x, 7.2, 0.4, 1.8, "#4a301c", 2);
          if (ban) for (const x of [-6.9, -2.3, 2.3, 6.9]) banner(w, x, 7.1, 1.3, 4.4);
          w.rect(-13, -1, 26, 10, w.vgrad(9, 3, "rgba(30,15,10,0.45)", "rgba(0,0,0,0)"), 0);
        }),
        Lr(K + "t", 2.6, -9, 9, -1, 1.4, 120, (w) => { for (const x of [-5.5, 0, 5.5]) { w.rect(x - 2.2, 0.72, 4.4, 0.12, "#7a5434", 2.5); for (const s of [-1, 1]) w.rect(x + s * 1.9 - 0.06, 0, 0.12, 0.72, "#5a3a22", 2);
          for (let k = 0; k < 4; k++) { const mx = x - 1.5 + k; w.rect(mx - 0.09, 0.84, 0.18, 0.24, "#e6c45a", 2); w.rect(mx - 0.09, 1.04, 0.18, 0.06, "#f6f2e6", 1.5); } } }),
      ],
    };
    case "rally": return {
      sky: ["#04060d", "#1a1e30"],
      ground: { near: "#1d1b20", far: "#2a2830", kind: "stone", zFar: 60 },
      layers: [
        Lr(K + "b", 60, -90, 90, -1, 34, 14, (w) => { w.rect(-90, 0, 180, 9, "#2a2832", 3); for (let k = 0; k < 8; k++) w.line([[-90, 1 + k], [90, 1 + k]], 1.5, "rgba(0,0,0,0.4)");
          for (let x = -84; x <= 84; x += 10) { w.rect(x - 0.4, 0, 0.8, 30, "#3a3842", 2); banner(w, x + 5, 30, 3.2, 21); } }, 0.8),
        Lr(K + "p", 9, -10, 10, -1, 3.2, 110, (w) => { w.rect(-9, 0, 18, 1.2, "#5a5450", 3); for (let i = 0; i < 4; i++) w.rect(-2 + i * 0.1, -0.1 + i * 0.3, 4 - i * 0.2, 0.3, "#6a645e", 2);
          w.poly([[-0.9, 1.2], [0.9, 1.2], [0.75, 2.0], [-0.75, 2.0]], "#4a4440", 3); emblem(w, 0, 1.6, 0.28); w.rect(-1, 2.0, 2, 0.1, "#3a3430", 2);
          for (const x of [-0.4, 0.4]) w.line([[x, 2.1], [x * 1.4, 2.45]], 2.5, "#1a1a1a"); }),
      ],
    };
    case "cell": return {
      interior: true, ground: { near: "#5f5a53", far: "#6f6a61", kind: "stone", zFar: 3.5, xr: 8 },
      layers: [
        Lr(K + "w", 3.5, -7, 7, -1, 7, 110, (w) => {
          w.rect(-7, -1, 14, 8, "#8a8276", 0); for (let y = -1; y < 7; y += 0.45) for (let x = -7 + ((y * 2.2) % 1) * 0.9; x < 7; x += 0.9) w.rect(x, y, 0.88, 0.43, (x * 7 + y * 13) % 2 > 1 ? "#8f877a" : "#847c70", 1.2);
          w.rect(0.9, 2.6, 1.4, 1.1, "#d6e4ee", 3); for (let k = 1; k < 5; k++) w.line([[0.9 + k * 0.28, 2.6], [0.9 + k * 0.28, 3.7]], 4, "#2a2a2e");
          w.rect(-5.5, 0, 3.2, 0.55, "#6a5a48", 2.5); w.rect(-5.5, 0.55, 3.2, 0.18, "#c9bfa8", 2);
          w.rect(-7, -1, 14, 8, w.vgrad(7, 0, "rgba(10,8,12,0.55)", "rgba(10,8,12,0.1)"), 0);
        }),
        Lr(K + "d", 0.7, -1.4, 1.4, -1, 1.2, 260, (w) => { w.rect(-1.2, 0.74, 2.4, 0.09, "#6e4e30", 2.5); w.rect(-1.1, 0, 0.1, 0.74, "#5a3e24", 2); w.rect(1.0, 0, 0.1, 0.74, "#5a3e24", 2);
          w.poly([[-0.35, 0.83], [0.25, 0.83], [0.3, 0.86], [-0.3, 0.86]], "#f2ecda", 1.5); w.rect(0.5, 0.83, 0.12, 0.1, "#202024", 1.5); }),
      ],
    };
    case "office": return {
      interior: true, ground: { near: "#5a2a26", far: "#6b342e", zFar: 4.5, xr: 8 },
      layers: [
        Lr(K + "w", 4.5, -8, 8, -1, 7, 100, (w) => {
          w.rect(-8, -1, 16, 8, "#7c5236", 0); for (let x = -8; x < 8; x += 1.6) w.rect(x + 0.1, 0.2, 1.4, 2.2, "#86593a", 2); for (let x = -8; x < 8; x += 1.6) w.rect(x + 0.1, 2.7, 1.4, 3.6, "#86593a", 2);
          w.rect(-1.5, 1, 3, 4.2, "#c9dbe6", 3); w.line([[0, 1], [0, 5.2]], 3, "#6e4a2e"); w.line([[-1.5, 3.2], [1.5, 3.2]], 3, "#6e4a2e");
          for (const s of [-1, 1]) w.poly([[s * 1.4, 5.6], [s * 2.3, 5.6], [s * 2.1, 0.6], [s * 1.6, 0.6]], "#8a2a26", 3);
          w.rect(-5.2, 2.2, 1.8, 2.3, "#c9a24a", 3); w.rect(-5.0, 2.4, 1.4, 1.9, "#6a5a4a", 2); w.ell(-4.3, 3.6, 0.35, 0.4, "#d9b89a", 2);
          for (let k = 0; k < 3; k++) w.rect(3.4, 3.6 - k * 0.45, 1.6, 0.45, ["#1a1a1a", "#f2efe6", "#c0302a"][k], 2); w.line([[3.4, 0], [3.4, 4.2]], 3, "#c9a24a");
          w.rect(-8, -1, 16, 8, w.vgrad(7, 0, "rgba(20,10,5,0.45)", "rgba(0,0,0,0)"), 0);
        }),
        Lr(K + "d", 1.3, -3, 3, -1, 1.2, 200, (w) => { w.rect(-2.2, 0, 4.4, 0.86, "#5a3420", 3); w.rect(-2.35, 0.82, 4.7, 0.1, "#6e4428", 2.5); for (const x of [-1.2, 1.2]) w.rect(x - 0.5, 0.25, 1, 0.4, "#4e2c1a", 2);
          w.poly([[-0.4, 0.92], [0.35, 0.92], [0.4, 0.95], [-0.35, 0.95]], "#f2ecda", 1.5); w.rect(1.2, 0.92, 0.16, 0.14, "#c9a24a", 1.5); }),
      ],
    };
    case "reichstag": return {
      sky: night ? ["#070a18", "#2a2236"] : ["#86a9c6", "#e2dccb"],
      ground: { near: night ? "#2e2c30" : "#8c8678", far: night ? "#3a3640" : "#a8a090", kind: "stone", zFar: 55 },
      layers: [
        Lr(K + "r", 55, -40, 40, -1, 40, 32, (w) => {
          const c = night ? "#5e5862" : "#cdbfa2", win = has(v, "fire") ? "#ff9a3a" : night ? "#1c2030" : "#56687a";
          w.rect(-34, 0, 68, 18, c, 3); for (const x of [-34, 26]) { w.rect(x, 0, 8, 24, c, 3); w.rect(x - 0.3, 23.5, 8.6, 0.8, c, 3); }
          for (let fl = 0; fl < 3; fl++) for (let x = -32; x < 33; x += 2.4) { if (Math.abs(x) < 9) continue; w.rect(x, 1.5 + fl * 5.2, 1.1, 2.8, win, 2); }
          w.rect(-10, 0, 20, 19, c, 3); columns(w, 0, 18, 14, 6, c, 1); w.rect(-10.5, 15, 21, 1.6, c, 3); w.poly([[-10.5, 16.6], [10.5, 16.6], [0, 21]], c, 3);
          w.text("DEM DEUTSCHEN VOLKE", 0, 15.8, 0.9, "#3a2e22");
          if (has(v, "ruin")) { w.rect(-6, 21, 12, 3, c, 3); for (let k = -5; k <= 5; k++) w.line([[k * 1.1, 24], [k * 0.6, 24 + 7 * Math.cos(k * 0.28)]], 3, "#2a2420"); w.line([[-6, 26], [6, 26]], 2.5, "#2a2420"); }
          else { w.rect(-6, 21, 12, 3, c, 3); w.ell(0, 24, 6, 7, "rgba(170,200,210,0.8)", 3, 0, Math.PI); for (let k = -4; k <= 4; k++) w.line([[k * 1.4, 24], [k * 0.4, 30.6]], 2, "#3a3a40"); }
          if (night) w.rect(-40, 0, 80, 40, "rgba(10,8,25,0.35)", 0);
        }),
        Lr(K + "t", 28, -40, 40, -1, 12, 45, (w) => { for (const x of [-34, -27, -20, 20, 27, 34]) tree(w, x, 10, night ? "#1f2a24" : "#4f7a3c", x + 50); }, 0.6),
      ],
    };
    case "factory": return has(v, "inside") ? {
      interior: true, ground: { near: "#4a4844", far: "#5a5852", kind: "stone", zFar: 26, xr: 20 },
      layers: [
        Lr(K + "w", 26, -30, 30, -1, 20, 40, (w) => { w.rect(-30, -1, 60, 21, "#4f4c48", 0); for (let x = -28; x < 30; x += 4) for (let y = 6; y < 16; y += 3) w.rect(x, y, 3.4, 2.4, "#d8d2b4", 2);
          for (let x = -30; x < 30; x += 6) { w.line([[x, 18], [x + 3, 20], [x + 6, 18]], 4, "#2a2826"); w.line([[x, 18], [x + 6, 18]], 4, "#2a2826"); } w.rect(-30, 0, 60, 5, "#3e3c38", 3); }, 0.6),
      ],
    } : {
      sky: ["#6d7278", "#b4b0a6"],
      ground: { near: "#6e675e", far: "#8a8378", kind: "cobble", zFar: 30 },
      layers: [
        Lr(K + "b", 24, -40, 40, -1, 30, 40, (w) => { w.rect(-30, 0, 60, 12, "#8f4a36", 3); for (let x = -30; x < 30; x += 5) w.poly([[x, 12], [x + 5, 12], [x + 5, 15]], "#6a6460", 3);
          for (let x = -28; x < 29; x += 3) w.rect(x, 3, 2, 4.5, "#3e4650", 2); for (const x of [-22, 18]) { w.rect(x, 12, 2.4, 16, "#8f4a36", 3); w.rect(x - 0.2, 27, 2.8, 0.8, "#6a3a2a", 2); } w.text("FABRIK", 0, 10.5, 1.4, "#efe6cf"); }, 0.6),
        Lr(K + "g", 7, -16, 16, -1, 4, 110, (w) => { for (let x = -15; x <= 15; x += 0.35) { if (Math.abs(x) < 2.6 && false) continue; w.line([[x, 0], [x, 2.6]], 3, "#26262a"); w.poly([[x - 0.06, 2.6], [x + 0.06, 2.6], [x, 2.8]], "#26262a", 0); }
          w.line([[-15, 0.4], [15, 0.4]], 4, "#26262a"); w.line([[-15, 2.3], [15, 2.3]], 4, "#26262a"); for (const x of [-2.6, 2.6]) w.rect(x - 0.15, 0, 0.3, 3, "#3a3a40", 2.5);
          w.line([[-1.2, 1.2], [1.2, 1.6]], 4, "#8a8a90"); w.line([[-1.2, 1.6], [1.2, 1.2]], 4, "#8a8a90"); w.rect(-1, 1.7, 2, 0.8, "#efe6cf", 2.5); w.text("FECHADO", 0, 2.1, 0.42, "#b0201a"); }),
      ],
    };
    case "field": return {
      sky: grey ? ["#666a6e", "#aea89a"] : dusk ? ["#6e5a6a", "#e8a070"] : ["#78a8d6", "#e6e4d0"],
      ground: { near: grey ? "#6a6a4e" : "#8e9850", far: grey ? "#8a8a6a" : "#b4b874", kind: "grass", zFar: 200 },
      layers: [
        Lr(K + "h", 260, -320, 320, -5, 60, 4, (w) => hills(w, -320, 320, 30, grey ? "#6e7468" : "#7e9a6e", 5, 2), 2),
        Lr(K + "f", 80, -110, 110, -2, 20, 14, (w) => { hills(w, -110, 110, 5, grey ? "#7a7c60" : "#9aa45e", 8); for (let i = 0; i < 22; i++) tree(w, -105 + i * 10 + (i % 3) * 2, 6 + (i % 4), grey ? "#4e5a3e" : "#4f7a3c", i + 3, 2);
          w.rect(22, 3, 6, 4, "#d9cfb6", 2.5); w.poly([[21.6, 7], [28.4, 7], [25, 10]], "#8a4a36", 2.5); }, 1),
        ...(has(v, "border") ? [Lr(K + "x", 7, -14, 14, -1, 4, 120, (w) => { w.rect(-9, 0, 2.2, 2.6, "#d9cfb6", 2.5); w.poly([[-9.3, 2.6], [-6.5, 2.6], [-7.9, 3.4]], "#8a4a36", 2.5); w.rect(-6.2, 0, 0.25, 1.2, "#3a3a3a", 2);
          w.poly([[-6.1, 1.0], [5, 1.0], [5, 1.18], [-6.1, 1.18]], "#f2efe6", 2); for (let x = -5.5; x < 5; x += 1.1) w.rect(x, 1.0, 0.55, 0.18, "#c0302a", 0); w.poly([[-6.1, 1.0], [5, 1.0], [5, 1.18], [-6.1, 1.18]], null, 2); })] : []),
      ],
    };
    case "camp": { const dawn = has(v, "dawn"); return {
      sky: dawn ? ["#8c96a2", "#d6d4cc"] : ["#060912", "#1c2232"],
      ground: { near: dawn ? "#c9ccce" : "#26282c", far: dawn ? "#dcdedf" : "#30333a", kind: dawn ? "snow" : "mud", zFar: 70 },
      layers: [
        Lr(K + "f", 70, -90, 90, -2, 16, 14, (w) => { for (let i = 0; i < 60; i++) { const x = -88 + i * 3; w.poly([[x - 1.6, 0], [x + 1.6, 0], [x, 8 + (i % 4) * 1.5]], dawn ? "#4a5650" : "#0f1418", 1.5); } }, 1),
        Lr(K + "b", 34, -50, 50, -1, 8, 40, (w) => { for (let i = 0; i < 6; i++) { const x = -45 + i * 16; w.rect(x, 0, 12, 2.6, dawn ? "#6a5e52" : "#1c1a1c", 2.5); w.poly([[x - 0.3, 2.6], [x + 12.3, 2.6], [x + 11, 4], [x + 1, 4]], dawn ? "#4a423a" : "#141214", 2.5);
          if (dawn) w.poly([[x - 0.3, 2.6], [x + 12.3, 2.6], [x + 11.6, 3.2], [x + 0.7, 3.2]], "#e9ecee", 1.5); for (let k = 0; k < 5; k++) w.rect(x + 1 + k * 2.3, 1, 0.8, 0.7, dawn ? "#2a2a2c" : "#3a3020", 1.5); } }, 0.8),
        Lr(K + "w", 20, -24, 24, -1, 12, 60, (w) => { const x = 9; for (const s of [-1, 1]) w.line([[x + s * 1.6, 0], [x + s * 1.1, 8]], 4, "#3a2e24"); w.line([[x - 1.5, 3], [x + 1.5, 6]], 3, "#3a2e24"); w.line([[x + 1.5, 3], [x - 1.5, 6]], 3, "#3a2e24");
          w.rect(x - 1.6, 8, 3.2, 1.8, dawn ? "#5a4a3a" : "#1e1a18", 3); w.poly([[x - 2.1, 9.8], [x + 2.1, 9.8], [x, 11.2]], dawn ? "#3a3028" : "#121012", 3); w.rect(x - 1.2, 8.6, 2.4, 0.7, "#0e0c0c", 2); }),
        Lr(K + "r", 12, -40, 40, -1, 0.4, 60, (w) => { for (const y of [0.1, 0.25]) w.line([[-40, y], [40, y]], 3, "#4a4440"); for (let x = -40; x < 40; x += 0.8) w.rect(x, 0, 0.35, 0.12, "#3a2e24", 1); }),
        Lr(K + "x", 4.5, -16, 16, -1, 3.2, 120, (w) => { for (let x = -15; x <= 15; x += 3) { w.poly([[x - 0.1, 0], [x + 0.1, 0], [x + 0.1, 2.6], [x + 0.45, 2.95], [x + 0.38, 3.02], [x - 0.1, 2.68]], dawn ? "#9a9894" : "#4a4a4e", 2.5); }
          barbed(w, -16, 16, [0.4, 0.85, 1.3, 1.75, 2.2, 2.6], dawn ? "#3a3634" : "#5a5652"); }),
      ],
    }; }
    case "snow": return {
      sky: ["#8a9098", "#d4d5d4"],
      ground: { near: "#d3d7da", far: "#e6e8e9", kind: "snow", zFar: 60 },
      layers: [
        Lr(K + "s", 60, -90, 90, -2, 30, 14, (w) => row(w, -90, 90, { pal: PAL.ruin, floors: [3, 5], hgt: [10, 22], roof: "flat", seed: 41, ruin: true, snow: true }), 1.5),
        Lr(K + "r", 24, -40, 40, -1, 18, 60, (w) => { row(w, -40, 40, { pal: PAL.ruin, floors: [3, 4], hgt: [9, 15], roof: "flat", seed: 43, ruin: true, snow: true, gap: [-6, 6] }); }),
        Lr(K + "p", 8, -20, 20, -1, 3, 110, (w) => { for (const x of [-12, -7, 6, 13]) { w.poly([[x - 2.2, 0], [x - 1.2, 0.9], [x - 0.3, 1.4], [x + 0.8, 1.0], [x + 2.2, 0]], "#7a7068", 3); w.poly([[x - 1.6, 0.55], [x - 0.3, 1.4], [x + 1.4, 0.5], [x, 1.1]], "#eef0f2", 1.5); } }),
      ],
    };
    case "beach": return {
      sky: ["#73818e", "#c2c4be"],
      ground: { near: "#b8a47c", far: "#cbb994", kind: "sand", zFar: 26 },
      layers: [
        Lr(K + "c", 200, -260, 60, -2, 70, 5, (w) => { const pts: number[][] = [[-260, -2]]; for (let x = -260; x <= 40; x += 10) pts.push([x, 30 + Math.sin(x * 0.05) * 6 + (x > 0 ? -x : 0)]); pts.push([40, -2]); w.poly(pts, "#8a8676", 2); w.poly(pts.map(([x, y]) => [x, y * 0.4]), "#6f8a5c", 0); }, 1.5),
        Lr(K + "o", 9, -30, 30, -1, 2.5, 110, (w) => { for (const x of [-11, -5.5, 4, 10.5]) { for (const a of [0.6, -0.6, 0]) w.line([[x - 0.9 * Math.cos(a), 0.05], [x + 0.9 * Math.cos(a), 1.5 * Math.abs(Math.cos(a)) + 0.05]], 6, "#3a3632"); } }),
      ],
    };
    case "ruins": return {
      sky: ["#4f4945", "#a6978a"],
      ground: { near: "#5b544e", far: "#8a8076", kind: "rubble", zFar: 60 },
      layers: [
        Lr(K + "R", 95, -60, 60, -1, 40, 18, (w) => { const c = "#7a7068"; w.rect(-34, 0, 68, 16, c, 3); for (let x = -32; x < 33; x += 2.4) w.rect(x, 2, 1.1, 2.8, "#1e1816", 2); for (let x = -32; x < 33; x += 2.4) w.rect(x, 8, 1.1, 2.8, "#1e1816", 2);
          w.rect(-10, 0, 20, 18, c, 3); columns(w, 0, 18, 13, 6, "#8a8076", 1); w.rect(-6, 18, 12, 3, c, 3); for (let k = -5; k <= 5; k++) w.line([[k * 1.1, 21], [k * 0.6, 21 + 7 * Math.cos(k * 0.28)]], 3, "#2a2420"); w.line([[-6, 24], [6, 24]], 2.5, "#2a2420");
          row(w, -60, -36, { pal: PAL.ruin, floors: [3, 4], hgt: [10, 16], roof: "flat", seed: 61, ruin: true }); row(w, 36, 60, { pal: PAL.ruin, floors: [3, 4], hgt: [10, 16], roof: "flat", seed: 62, ruin: true }); }, 1.4),
        Lr(K + "f", 26, -44, 44, -1, 20, 60, (w) => row(w, -44, 44, { pal: PAL.ruin, floors: [3, 5], hgt: [9, 18], roof: "flat", seed: 67, ruin: true, gap: [-8, 8] })),
        Lr(K + "p", 9, -22, 22, -1, 6, 110, (w) => { for (const x of [-13, -6, 7, 14]) { w.poly([[x - 2.6, 0], [x - 1.4, 1.1], [x - 0.2, 1.7], [x + 1, 1.2], [x + 2.6, 0]], "#6d645c", 3); for (let k = 0; k < 4; k++) w.rect(x - 1.5 + k * 0.8, 0.3 + (k % 2) * 0.4, 0.6, 0.25, "#8f5a44", 1.5); }
          deadTree(w, -9.5, 5.5, 3); w.rect(10, 0, 0.16, 3.6, "#26262c", 2); w.line([[10.08, 3.6], [10.9, 3.1]], 3, "#26262c"); }),
      ],
    };
    case "bunker": return {
      interior: true, ground: { near: "#45423c", far: "#55524a", kind: "stone", zFar: 3.4, xr: 8 },
      layers: [
        Lr(K + "w", 3.4, -6.5, 6.5, -1, 6, 120, (w) => {
          w.rect(-6.5, -1, 13, 7, "#77736a", 0); for (let y = 0; y < 6; y += 1.2) w.line([[-6.5, y], [6.5, y]], 1.5, "rgba(30,28,24,0.35)"); for (let x = -6; x < 6.5; x += 1.6) w.line([[x, -1], [x, 6]], 1.2, "rgba(30,28,24,0.2)");
          w.rect(1.8, 0, 1.4, 2.3, "#4e5254", 3); w.rect(1.95, 0.15, 1.1, 2, "#5a5e60", 2); for (const y of [0.4, 1.15, 1.9]) for (const x of [2.05, 2.95]) w.ell(x, y, 0.035, 0.035, "#2a2a2a", 1); w.rect(2.85, 1.0, 0.12, 0.22, "#2a2a2a", 1.5);
          for (const y of [3.2, 3.45]) w.rect(-6.5, y, 13, 0.14, "#5a5a56", 2); w.rect(-4.6, 1.6, 1.8, 1.2, "#d9cfb0", 2.5); w.line([[-4.4, 2.2], [-3.2, 2.5]], 2, "#8a2a22"); w.line([[-4.2, 1.9], [-3.4, 2.0]], 2, "#2a4a8a");
          w.rect(-6.5, -1, 13, 7, w.vgrad(6, 0, "rgba(8,6,6,0.7)", "rgba(8,6,6,0.05)"), 0);
        }),
        Lr(K + "t", 1.1, -2, 2, -1, 1.2, 240, (w) => { w.rect(-1.4, 0.72, 2.8, 0.08, "#4a3a2a", 2.5); for (const x of [-1.3, 1.2]) w.rect(x, 0, 0.08, 0.72, "#3a2a1c", 2); w.poly([[-0.6, 0.8], [0.3, 0.8], [0.32, 0.83], [-0.58, 0.83]], "#e8e0c8", 1.5); }),
      ],
    };
    case "memorial": return {
      sky: dusk ? ["#e0a080", "#fbe3c0"] : ["#9db4c9", "#efe2cc"],
      ground: { near: "#7f7c78", far: "#9a9690", kind: "stone", zFar: 50 },
      layers: [
        Lr(K + "t", 60, -80, 80, -1, 20, 14, (w) => { for (let i = 0; i < 18; i++) tree(w, -78 + i * 9, 12 + (i % 3) * 3, "#5c7a48", i + 40); for (let i = 0; i < 8; i++) w.rect(-70 + i * 18, 0, 10, 14 + (i % 3) * 4, "#b0aaa0", 2); }, 1.4),
        ...[42, 32, 24, 17, 11.5, 7].map((z, k) => Lr(K + "s" + k, z, -40, 40, -1, 4, Math.min(110, 1300 / (z + 6)), (w) => {
          for (let x = -39 + (k % 2) * 1.2; x < 40; x += 2.4) { const h = 0.6 + 2.6 * Math.abs(Math.sin(x * 0.37 + k * 1.3)) * (0.5 + 0.5 * Math.cos(x * 0.08)); w.rect(x, 0, 1.6, h, "#8d8c88", 2.5); w.rect(x, h - 0.08, 1.6, 0.08, "#b6b4ae", 1.5); w.rect(x + 1.3, 0, 0.3, h, "rgba(30,25,35,0.18)", 0); }
        }, z > 20 ? 0.8 : 0)),
      ],
    };
    case "library": return {
      interior: true, ground: { near: "#5e4128", far: "#6e4e32", kind: "wood", zFar: 3.6, xr: 8 },
      layers: [
        Lr(K + "w", 3.6, -7, 7, -1, 6, 120, (w) => { w.rect(-7, -1, 14, 7, "#5a3c24", 0); const r = rng(77);
          for (let sh = 0; sh < 6; sh++) { const y = 0.2 + sh * 0.85; w.rect(-7, y - 0.06, 14, 0.06, "#3e2816", 1.5); for (let x = -6.9; x < 6.9;) { const bw = 0.08 + r() * 0.1, bh = 0.5 + r() * 0.25; if (x > 2 && x < 5 && sh > 0 && sh < 5) { x += 0.2; continue; }
            w.rect(x, y, bw, bh, ["#8a2a22", "#2a4a6a", "#3a5a3a", "#b08a3a", "#5a3a5a", "#d8cfb4"][Math.floor(r() * 6)], 1.2); x += bw + 0.01; } }
          w.rect(2.2, 1.0, 2.6, 3.2, "#cfe0ea", 3); w.line([[3.5, 1], [3.5, 4.2]], 3, "#5a3c24"); w.line([[2.2, 2.6], [4.8, 2.6]], 3, "#5a3c24"); }),
        Lr(K + "d", 1.0, -2, 2, -1, 1.5, 240, (w) => { w.rect(-1.6, 0.74, 3.2, 0.09, "#6e4a2c", 2.5); for (const x of [-1.5, 1.42]) w.rect(x, 0, 0.08, 0.74, "#4e321c", 2);
          w.poly([[-0.5, 0.83], [0, 0.86], [0.5, 0.83], [0.5, 0.86], [0, 0.89], [-0.5, 0.86]], "#f3eee0", 1.5); w.line([[0.9, 0.83], [0.9, 1.15]], 2.5, "#3a3a30"); w.poly([[0.72, 1.12], [1.08, 1.12], [1.0, 1.26], [0.8, 1.26]], "#2f6b4a", 2); }),
      ],
    };
    case "home": return {
      interior: true, ground: { near: "#6a4a30", far: "#7a5838", kind: "wood", zFar: 3.8, xr: 8 },
      layers: [
        Lr(K + "w", 3.8, -7, 7, -1, 6, 120, (w) => { w.rect(-7, -1, 14, 7, night ? "#6e6250" : "#c9b48a", 0); for (let x = -7; x < 7; x += 0.4) w.line([[x, 1], [x, 6]], 2, "rgba(120,80,50,0.18)"); w.rect(-7, -1, 14, 2, "#7a5a3a", 2.5);
          w.rect(-1.2, 1.4, 2.4, 2.2, night ? "#1a2238" : "#bcd2e0", 3); w.line([[0, 1.4], [0, 3.6]], 3, "#e9e2d0"); w.line([[-1.2, 2.5], [1.2, 2.5]], 3, "#e9e2d0");
          for (const s of [-1, 1]) w.poly([[s * 1.1, 3.9], [s * 1.8, 3.9], [s * 1.7, 1.2], [s * 1.3, 1.2]], "#7a2a2a", 2.5);
          w.rect(3, 0, 1.3, 2.4, "#5a3a24", 3); w.ell(4.1, 1.2, 0.05, 0.05, "#c9a24a", 1);
          w.rect(-5.2, 0, 2.4, 0.9, "#6a4428", 2.5); for (let k = -3; k <= 3; k++) w.line([[-4 + k * 0.12, 0.95], [-4 + k * 0.12, 1.25 - Math.abs(k) * 0.02]], 2.5, "#c9a24a"); w.line([[-4.36, 0.95], [-3.64, 0.95]], 3, "#c9a24a"); w.rect(-4.05, 0.9, 0.1, 0.06, "#c9a24a", 0);
          w.rect(-5, 2.2, 1.4, 1.1, "#c9a24a", 2.5); w.rect(-4.85, 2.35, 1.1, 0.8, "#8a7a62", 1.5);
          if (night) w.rect(-7, -1, 14, 7, "rgba(15,12,30,0.45)", 0); }),
        Lr(K + "t", 1.5, -3, 3, -1, 1.2, 200, (w) => { w.rect(-1.5, 0, 3, 0.8, "#f2ecdc", 2.5); w.rect(-1.5, 0.78, 3, 0.06, "#e8e0cc", 2); for (let k = 0; k < 3; k++) w.ell(-0.8 + k * 0.8, 0.86, 0.18, 0.04, "#ede6d4", 1.5); }),
      ],
    };
    case "map": return {
      interior: true, ground: { near: "#2a1e16", far: "#2a1e16", zFar: 1 },
      layers: [Lr(K, 0, -17, 17, -12, 12, 75, (w) => mapPaint(w))],
    };
  }
  throw new Error("loc " + id);
};

// ---------------- map ----------------
export const MX = (lon: number) => (lon - 13) * 0.62, MY = (lat: number) => (lat - 50) * 0.95;
const geo = (a: number[]) => { const p: number[][] = []; for (let i = 0; i < a.length; i += 2) p.push([MX(a[i]), MY(a[i + 1])]); return p; };
const EUROPE = [-9, 43.2, -8.8, 41, -9.4, 38.8, -8.8, 37, -6.3, 36.8, -5.6, 36, -4.2, 36.7, -2, 36.8, -0.3, 38.5, 0.2, 39.5, -0.3, 40, 1, 41, 3.2, 41.9, 3.1, 43.1, 4.5, 43.4, 6.5, 43.1, 7.5, 43.8, 8.8, 44.4,
  10.2, 43.9, 10.6, 42.9, 12.3, 41.7, 14, 40.8, 15.6, 40, 16.2, 38.6, 15.7, 38, 16.1, 37.9, 17.2, 39, 18.5, 40.1, 16.9, 41.2, 15.9, 41.9, 14, 42.6, 13.6, 43.5, 12.3, 44.3, 12.2, 45.3, 13.7, 45.6,
  14.3, 45.2, 15.3, 44.3, 17.5, 43, 19.4, 41.9, 19.6, 40, 21, 38.5, 22.2, 36.7, 23.2, 37.9, 24, 38.2, 23, 39.4, 24, 40.7, 26, 40.8, 26.3, 41.2, 29, 41.2, 28, 42.5, 27.9, 43.4, 28.8, 44.5, 29.7, 45.3,
  30.8, 46.5, 33, 46, 35.5, 45.3, 36.5, 45.2, 37.8, 47, 39.5, 47, 40, 48, 44, 48, 44, 64, 25.5, 64, 25.5, 63, 21.5, 61.8, 21.4, 60.7, 22.9, 59.9, 26, 60.4, 29.8, 60.2, 28.5, 59.5, 24.5, 59.4, 23.5, 58.5,
  24.2, 57.2, 21.6, 57.4, 21, 56, 21.2, 55.2, 19.6, 54.4, 18.6, 54.5, 16.5, 54.5, 14.2, 53.9, 12.5, 54.4, 11, 54, 10.9, 54.5, 9.9, 54.8, 10.3, 56.5, 10.6, 57.7, 8.6, 57.1, 8.1, 56, 8.6, 55.1, 8.9, 54,
  8.2, 53.5, 7, 53.3, 5, 53.3, 4.5, 52.2, 3.6, 51.5, 2.5, 51.1, 1.6, 50.9, 1.6, 50.2, 0.2, 49.7, -1.3, 49.6, -1.6, 48.7, -4.6, 48.6, -4.4, 47.8, -2.4, 47.2, -1.9, 46.5, -1.2, 45.7, -1.2, 44.5, -1.6, 43.4, -3.8, 43.4, -8, 43.7];
const GB = [-5.7, 50, -3.5, 50.3, -1, 50.7, 1.4, 51.2, 1.7, 52.6, 0.2, 53.4, -0.5, 54.5, -1.6, 55.6, -2.1, 56, -1.9, 57.6, -3, 58.6, -5, 58.6, -6.2, 57.6, -5.6, 56.3, -6.2, 55.6, -4.9, 55.1, -5.1, 54.7, -3.5, 54.4, -3.2, 53.4, -4.6, 53.3, -4.2, 52.3, -5.1, 51.8, -3.1, 51.4, -4.5, 51.1];
const IE = [-6, 52.2, -6.3, 53.9, -5.5, 54.6, -6.2, 55.3, -7.3, 55.3, -8.4, 54.6, -9.9, 53.9, -9.5, 53.1, -10.4, 51.9, -8.5, 51.6];
const SC = [5, 64, 5, 61, 5.3, 59.3, 5.6, 58.4, 7, 58, 8.2, 58.1, 9.8, 59, 10.6, 59.4, 11.1, 59, 11.7, 58, 12.5, 56.3, 12.8, 55.4, 14.2, 55.4, 16, 56.2, 16.6, 57.5, 18.8, 59.4, 17.2, 60.7, 17.5, 62.3, 19, 64];
export const GER = [6.1, 50.8, 6, 51.9, 7, 52.4, 7.1, 53.3, 8.6, 53.9, 8.9, 54.9, 9.9, 54.8, 11, 54, 12.5, 54.4, 14.2, 53.9, 16.6, 54.5, 17.5, 53.5, 15.8, 52.5, 16.3, 51.6, 17.8, 51.2, 18.6, 50.1, 16.5, 50.2, 15, 50.9,
  14.3, 50.9, 12.3, 50.2, 13.8, 48.8, 16.9, 48.7, 17.1, 47.7, 16.4, 46.8, 14.5, 46.4, 12.1, 46.9, 10.5, 46.9, 9.6, 47.3, 7.6, 47.6, 7.6, 48.9, 6.4, 49.4];
export const POL = [16.6, 54.5, 18.6, 54.6, 19.6, 54.4, 22.8, 54.3, 23.6, 53.9, 24, 53, 26, 54, 28, 53.5, 27, 51.5, 26, 50.5, 24.5, 48.4, 22.5, 49.1, 19.5, 49.4, 18.8, 49.6, 18.6, 50.1, 17.8, 51.2, 16.3, 51.6, 15.8, 52.5, 17.5, 53.5];
const mapPaint = (w: WP) => {
  w.rect(-17, -12, 34, 24, "#a9bdb6", 0);
  for (let k = 0; k < 9; k++) w.line([[-17, -12 + k * 3], [17, -12 + k * 3]], 1, "rgba(60,80,80,0.18)");
  for (let k = 0; k < 12; k++) w.line([[-17 + k * 3, -12], [-17 + k * 3, 12]], 1, "rgba(60,80,80,0.18)");
  for (const a of [EUROPE, GB, IE, SC, [12.4, 38, 15.6, 38.2, 15.1, 36.7], [8.4, 39.1, 9.6, 41.1, 9.8, 39.1]]) w.poly(geo(a), "#e6d3a6", 3, "#5a4630");
  w.poly(geo(POL), "#dcc79c", 2.5, "#5a4630"); w.poly(geo(GER), "#a89c88", 3, "#3a2a1c");
  const lab: [string, number, number, number][] = [["ALEMANHA", 10.6, 51.3, 0.62], ["POLÔNIA", 21.5, 52.2, 0.55], ["FRANÇA", 2.4, 46.8, 0.6], ["REINO UNIDO", -2.2, 53.2, 0.42], ["URSS", 34, 54.5, 0.8], ["ITÁLIA", 12.8, 42.6, 0.45], ["ESPANHA", -4, 40, 0.5]];
  for (const [s, lo, la, sz] of lab) w.text(s, MX(lo), MY(la), sz, "#3a2a1c");
  const g = w.g.createRadialGradient(0, 0, 8, 0, 0, 22); g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(1, "rgba(80,50,20,0.55)"); w.rect(-17, -12, 34, 24, g, 0);
  w.rect(-16.8, -11.8, 33.6, 23.6, null, 6);
};

// ---------------- sprites ----------------
export const SPR: Record<string, Sprite> = {
  tank: { key: "tank", w: 7.2, h: 3.2, ppm: 90, paint: (w) => { const c = "#59604f";
    w.poly([[-3.3, 0.15], [3.3, 0.15], [3.6, 0.7], [3.3, 1.2], [-3.3, 1.2], [-3.6, 0.7]], "#2e2f2a", 3); for (let k = -5; k <= 5; k++) w.ell(k * 0.6, 0.62, 0.27, 0.27, "#4a4b44", 2);
    w.poly([[-3.4, 1.1], [3.5, 1.1], [3.2, 1.75], [-3.2, 1.75]], c, 3); w.poly([[-1.6, 1.75], [1.4, 1.75], [1.1, 2.55], [-1.3, 2.55]], c, 3); w.rect(1.3, 2.05, 2.6, 0.18, "#4a5040", 2.5); w.rect(-0.4, 2.55, 0.6, 0.18, "#4a5040", 2);
    w.rect(-1.0, 1.95, 0.6, 0.4, "#1e1e1a", 1.5); w.line([[-3.2, 1.3], [3.2, 1.3]], 1.5, "rgba(0,0,0,0.3)"); } },
  tankRed: { key: "tankR", w: 7.2, h: 3.2, ppm: 90, paint: (w) => { const c = "#5e6a3c";
    w.poly([[-3.3, 0.15], [3.3, 0.15], [3.6, 0.7], [3.3, 1.2], [-3.3, 1.2], [-3.6, 0.7]], "#2e2f2a", 3); for (let k = -5; k <= 5; k++) w.ell(k * 0.6, 0.62, 0.27, 0.27, "#4a4b44", 2);
    w.poly([[-3.4, 1.1], [3.5, 1.1], [3.0, 1.75], [-3.0, 1.75]], c, 3); w.poly([[-1.4, 1.75], [1.4, 1.75], [1.0, 2.6], [-1.0, 2.6]], c, 3); w.rect(1.2, 2.1, 2.8, 0.18, "#4a5432", 2.5);
    const sx = -0.2, sy = 2.15, st: number[][] = []; for (let k = 0; k < 10; k++) { const t = Math.PI / 2 + (k * Math.PI) / 5, r = (k % 2 ? 0.1 : 0.24); st.push([sx + r * Math.cos(t), sy + r * Math.sin(t)]); } w.poly(st, "#d0302a", 1.5); } },
  plane: { key: "plane", w: 9, h: 3, ppm: 40, paint: (w) => { w.poly([[-4, 1.2], [3.4, 1.0], [4, 1.3], [3.4, 1.7], [-3.6, 1.6]], "#5a5e58", 3); w.poly([[-0.6, 1.4], [0.8, 1.4], [-1.6, 2.9], [-2.4, 2.9]], "#4e524c", 3);
    w.poly([[-0.6, 1.3], [0.8, 1.3], [-1.4, 0.1], [-2.2, 0.1]], "#4e524c", 3); w.poly([[-4, 1.4], [-3.4, 1.4], [-4.2, 2.2], [-4.6, 2.2]], "#4e524c", 2.5); w.rect(3.9, 0.9, 0.12, 0.9, "#2a2a2a", 1.5); } },
  wagon: { key: "wagon", w: 10.4, h: 4.2, ppm: 60, paint: (w) => { w.rect(-4.8, 0.9, 9.6, 2.9, "#6a3a2a", 3); for (let x = -4.6; x < 4.8; x += 0.4) w.line([[x, 1], [x, 3.7]], 1.2, "rgba(0,0,0,0.25)");
    w.rect(-1, 1.1, 2, 2.4, "#5a3022", 2.5); w.rect(3.2, 2.9, 0.8, 0.4, "#1a1414", 2); for (const x of [-3.1, -2.1, 2.1, 3.1]) w.ell(x, 0.55, 0.45, 0.45, "#2a2626", 2.5); w.rect(-5.1, 3.7, 10.2, 0.25, "#4a3a32", 2.5); } },
  craft: { key: "craft", w: 7, h: 2.8, ppm: 60, paint: (w) => { w.poly([[-3.2, 0], [3.2, 0], [3.4, 2.1], [-3.4, 2.1]], "#5a6266", 3); w.rect(-3.4, 2.0, 6.8, 0.2, "#4a5256", 2); w.line([[-3.2, 0.9], [3.2, 0.9]], 2, "rgba(0,0,0,0.3)"); } },
  lamp: { key: "lamp", w: 0.8, h: 1.6, ppm: 300, paint: (w) => { w.line([[0, 1.6], [0, 0.5]], 2.5, "#1a1a1a"); w.poly([[-0.25, 0.25], [0.25, 0.25], [0.12, 0.5], [-0.12, 0.5]], "#3a3a36", 2.5); w.ell(0, 0.22, 0.1, 0.07, "#fff0b0", 1.5); } },
  bars: { key: "bars", w: 9, h: 7, ppm: 70, paint: (w) => { for (let x = -4.4; x <= 4.4; x += 0.42) w.rect(x - 0.04, 0, 0.08, 7, "#26262a", 2.5); for (const y of [0.3, 3.4, 6.6]) w.rect(-4.5, y, 9, 0.12, "#26262a", 2.5); } },
  candle: { key: "candle", w: 0.2, h: 0.4, ppm: 600, paint: (w) => { w.rect(-0.04, 0, 0.08, 0.22, "#f4ecd8", 2); w.line([[0, 0.22], [0, 0.25]], 2, "#2a2a2a"); } },
  newspaper: { key: "news", w: 1.2, h: 1.5, ppm: 260, paint: (w) => { w.rect(-0.55, 0, 1.1, 1.45, "#ece4d0", 2.5); w.text("BERLINER ZEITUNG", 0, 1.33, 0.08, "#1e1a18"); w.line([[-0.5, 1.26], [0.5, 1.26]], 2, "#1e1a18");
    w.text("CRISE!", 0, 1.1, 0.2, "#1e1a18"); w.text("1929", 0, 0.92, 0.12, "#8a2a22"); for (let k = 0; k < 8; k++) w.line([[-0.48, 0.78 - k * 0.09], [k % 3 ? 0.48 : 0.2, 0.78 - k * 0.09]], 1.5, "#7a7468"); w.rect(-0.48, 0.05, 0.4, 0.3, "#9a9488", 1.5); } },
  treaty: { key: "treaty", w: 1.6, h: 1.2, ppm: 300, paint: (w) => { w.rect(-0.75, 0, 1.5, 1.15, "#efe6cc", 2.5); w.text("TRATADO DE VERSALHES", 0, 1.0, 0.075, "#2a1d16"); w.text("1919", 0, 0.9, 0.06, "#2a1d16");
    for (let k = 0; k < 9; k++) w.line([[-0.62, 0.8 - k * 0.07], [k % 4 === 3 ? 0.2 : 0.62, 0.8 - k * 0.07]], 1.2, "#8a8274"); w.ell(0.45, 0.15, 0.09, 0.09, "#a8261e", 1.5); } },
  ballotbox: { key: "bbox", w: 1, h: 1.3, ppm: 260, paint: (w) => { w.rect(-0.4, 0, 0.8, 0.9, "#6e4a2c", 2.5); w.rect(-0.25, 0.87, 0.5, 0.05, "#1e1a18", 1.5); w.text("WAHL", 0, 0.5, 0.12, "#efe6cf"); w.rect(-0.45, 0.88, 0.9, 0.06, "#5a3a22", 2); } },
  poster: { key: "poster", w: 1.6, h: 2.2, ppm: 200, paint: (w) => { w.rect(-0.75, 0, 1.5, 2.1, "#b3221c", 2.5); w.ell(0, 1.3, 0.38, 0.45, "#e9c9a6", 2.5); w.poly([[-0.38, 1.4], [0.25, 1.75], [0.3, 1.5], [-0.3, 1.6]], "#2a1d16", 0);
    w.rect(-0.08, 1.1, 0.16, 0.06, "#2a1d16", 0); w.poly([[-0.55, 0.6], [0.55, 0.6], [0.4, 0.9], [-0.4, 0.9]], "#5a4a32", 2); w.text("DEUTSCHLAND", 0, 0.3, 0.16, "#f4efe6"); } },
  chair: { key: "chair", w: 1, h: 1.2, ppm: 300, paint: (w) => { w.rect(-0.3, 0.42, 0.6, 0.07, "#4a3424", 2.5); w.rect(-0.3, 0.49, 0.07, 0.6, "#4a3424", 2.5); w.rect(-0.3, 0, 0.06, 0.42, "#3a2618", 2); w.rect(0.24, 0, 0.06, 0.42, "#3a2618", 2); } },
  easel: { key: "easel", w: 1.6, h: 2.2, ppm: 260, paint: (w) => { w.line([[-0.5, 0], [0, 2]], 4, "#7a5232"); w.line([[0.5, 0], [0, 2]], 4, "#7a5232"); w.line([[-0.35, 0.8], [0.35, 0.8]], 3, "#7a5232");
    w.rect(-0.55, 0.85, 1.1, 0.85, "#f2ecda", 2.5); w.rect(-0.47, 0.92, 0.94, 0.71, "#8fb8d8", 0); w.poly([[-0.47, 0.92], [0.47, 0.92], [0.47, 1.1], [0.1, 1.25], [-0.2, 1.15], [-0.47, 1.2]], "#7a9a58", 0);
    w.rect(0.05, 1.1, 0.2, 0.28, "#e8c46a", 1); w.poly([[0.02, 1.38], [0.28, 1.38], [0.15, 1.5]], "#b0503a", 1); w.poly([[-0.3, 1.18], [-0.24, 1.48], [-0.18, 1.18]], "#efe6d2", 1); } },
};
