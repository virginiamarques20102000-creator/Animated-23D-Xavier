// "O inferno das trincheiras" (Primeira Guerra Mundial) — 16:9, 603 s. Cuts land ~2 frames before each sentence (silencedetect +
// syllable alignment in out/trinc/sentences.json); every action lands on its word (out/trinc/words.txt).
import { Outfit, FrontOpts, SideOpts } from "./toon";
import { Cam, Ctx, VW, VH, P, Act, drawAct, drawLayer, drawGround, drawSprite, skyGrad, smokeCol, fire, boom, muzzle, glow, weather, caption, bigText, stamp, post, tint,
  clamp, lerp, smooth, easeOut, easeIn, hash, mk, puff, rays, sun, gas, WP, Sprite } from "./engine";
import { loc, SPR, MX, MY, C14, WX, WY, geoPts } from "./paint";
import { SHOTS_A } from "./shots_a";
import { SHOTS_B } from "./shots_b";
import { SHOTS_C } from "./shots_c";

export const DUR = 603.25;
export const FRAMES = Math.ceil(DUR * 30);
import type { Shot } from "./types";
import { Sc } from "./kit";

const SH: Shot[] = [...SHOTS_A, ...SHOTS_B, ...SHOTS_C].sort((a, b) => a.t0 - b.t0);
SH.forEach((s, i) => { if (s.t1 === undefined) s.t1 = SH[i + 1]?.t0 ?? DUR; });

// impacts: screen kicks (time, px)
const KICKS: [number, number][] = [[8.55, 16], [38.35, 10], [38.9, 10], [39.3, 12], [51.95, 14], [92.72, 6], [92.95, 6], [128.4, 12], [145.8, 10], [162.9, 10], [163.3, 10], [189.75, 14], [205.3, 18],
  [207.1, 6], [208.1, 6], [209.1, 6], [210.2, 6], [223.3, 8], [224.3, 8], [225.3, 8], [226.3, 8], [227.75, 12], [228.62, 12], [229.35, 14], [274.4, 14], [274.8, 10], [297.6, 6], [298.5, 6], [299.3, 6],
  [302.6, 8], [303.6, 8], [309.6, 10], [309.9, 10], [404.75, 14], [436.3, 8], [437.6, 10], [445.6, 8], [447.3, 10], [8.8, 8]];
const shake = (t: number): [number, number] => { let x = 0, y = 0; for (const [k, a] of KICKS) { const age = t - k; if (age < 0 || age > 0.7) continue; const e = a * Math.exp(-age * 7); x += e * Math.sin(age * 55 + k); y += e * Math.cos(age * 47 + k * 2); } return [x, y]; };

let BUF: HTMLCanvasElement | null = null;
const drawShot = (g: Ctx, sh: Shot, t: number) => {
  const lt = t - sh.t0, u = clamp(lt / (sh.t1! - sh.t0)), cam = sh.cam(u, lt), L = loc(sh.L, sh.v ?? "");
  const [kx, ky] = shake(t);
  g.save(); if (kx || ky) { g.translate(VW / 2 + kx, VH / 2 + ky); g.scale(1.03, 1.03); g.translate(-VW / 2, -VH / 2); }
  if (L.sky) skyGrad(g, cam, L.sky[0], L.sky[1]); else { g.fillStyle = "#1a1412"; g.fillRect(0, 0, VW, VH); }
  drawGround(g, cam, L.ground);
  const A = new Sc(g, cam, t);
  for (const l of L.layers) A.items.push({ z: l.z, d: () => drawLayer(g, cam, l) });
  sh.act?.(A, lt, u, t);
  A.items.sort((a, b) => b.z - a.z).forEach((it) => it.d());
  if (sh.wx) weather(g, lt, sh.wx[0], sh.wx[1], sh.wx[2]);
  A.lights.forEach((d) => d(g));
  if (sh.mood) tint(g, sh.mood[0], sh.mood[1], "multiply");
  g.restore();
  A.overs.forEach((d) => d(g));
};
export const renderFrame = (g: Ctx, t: number) => {
  let i = SH.findIndex((s) => t >= s.t0 && t < s.t1!); if (i < 0) i = SH.length - 1;
  const sh = SH[i];
  drawShot(g, sh, t);
  const f = sh.fade ?? 0;
  if (f && i > 0 && t - sh.t0 < f) {
    if (!BUF) BUF = mk(VW, VH); const b = BUF.getContext("2d")!; b.setTransform(1, 0, 0, 1, 0, 0); drawShot(b, SH[i - 1], t);
    g.save(); g.globalAlpha = 1 - smooth((t - sh.t0) / f); g.drawImage(BUF, 0, 0); g.restore();
  }
  post(g, t, 0.42, sh.bloom ?? 0.5, sh.sat ?? 1.2);
};
export const SHOT_STARTS = SH.map((s) => s.t0);
export const SHOT_LIST = SH.map((s) => ({ t0: s.t0, t1: s.t1!, L: s.L }));
