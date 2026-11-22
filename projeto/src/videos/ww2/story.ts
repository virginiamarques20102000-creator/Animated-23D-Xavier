// "A Segunda Guerra Mundial" — 16:9, 580 s, synced word by word to the narration (out/ww2/tempos_palavras.txt).
import { HZ, Ctx, VW, VH, drawLayer, drawGround, skyGrad, weather, post, tint, clamp, smooth, mk, setLite } from "./engine";
import { Sc } from "./kit";
import type { Shot } from "./types";
import type { Loc } from "./places";
import { SHOTS_1 } from "./shots_1";
import { SHOTS_2 } from "./shots_2";
import { SHOTS_3 } from "./shots_3";
import { SHOTS_4 } from "./shots_4";

export const DUR = 580.6;
export const FRAMES = Math.ceil(DUR * 30);
const SH: Shot[] = [...SHOTS_1, ...SHOTS_2, ...SHOTS_3, ...SHOTS_4].sort((a, b) => a.t0 - b.t0);
SH.forEach((s, i) => { if (s.t1 === undefined) s.t1 = SH[i + 1]?.t0 ?? DUR; });
const LOCS = new Map<Shot, Loc>();
const place = (s: Shot) => { let L = LOCS.get(s); if (!L) { L = s.L(); LOCS.set(s, L); } return L; };

const shake = (sh: Shot, t: number): [number, number] => { let x = 0, y = 0; for (const [k, a] of sh.kicks ?? []) { const age = t - k; if (age < 0 || age > 0.8) continue; const e = a * Math.exp(-age * 6.5); x += e * Math.sin(age * 55 + k); y += e * Math.cos(age * 47 + k * 2); } return [x, y]; };
let BUF: HTMLCanvasElement | null = null;
const drawShot = (g: Ctx, sh: Shot, t: number) => {
  const lt = t - sh.t0, u = clamp(lt / (sh.t1! - sh.t0)), c0 = sh.cam(u, lt), L = place(sh);
  // living camera: continuous slow push-in + organic drift (never a frozen frame), scaled to the shot's distance
  const ph = sh.t0 * 1.7, amp = L.interior ? 0.05 : 0.14;
  const cam = { ...c0, x: c0.x + amp * (Math.sin(lt * 0.53 + ph) + 0.4 * Math.sin(lt * 1.31 + ph * 2)), y: c0.y + amp * 0.45 * Math.sin(lt * 0.71 + ph), fov: c0.fov * (1 - 0.05 * smooth(u)), shift: (c0.shift ?? 0) + 6 * Math.sin(lt * 0.43 + ph) };
  HZ.y = VH / 2 + (cam.shift ?? 0);
  setLite(sh.lite);
  const [kx, ky] = shake(sh, t);
  g.save(); if (kx || ky) { g.translate(VW / 2 + kx, VH / 2 + ky); g.scale(1.03, 1.03); g.translate(-VW / 2, -VH / 2); }
  if (L.sky) skyGrad(g, cam, L.sky[0], L.sky[1]); else { g.fillStyle = "#120e0c"; g.fillRect(0, 0, VW, VH); }
  drawGround(g, cam, L.ground);
  const A = new Sc(g, cam, t);
  for (const l of L.layers) A.items.push({ z: l.z, d: () => drawLayer(g, cam, l) });
  sh.act?.(A, lt, u, t);
  A.items.sort((a, b) => b.z - a.z).forEach((it) => it.d());
  if (sh.wx) weather(g, lt, sh.wx[0], sh.wx[1], sh.wx[2]);
  A.lights.forEach((d) => d(g));
  if (sh.mood) tint(g, sh.mood[0], sh.mood[1], "multiply");
  if (sh.grade) tint(g, sh.grade[0], sh.grade[1], "soft-light");
  g.restore();
  A.overs.forEach((d) => d(g));
};
// cinematic motion blur: the frame is the average of two sub-frames inside a 180° shutter
let MB: HTMLCanvasElement | null = null;
export const renderFrame = (g: Ctx, t: number) => {
  if (!MB) MB = mk(VW, VH); const m = MB.getContext("2d")!; m.setTransform(1, 0, 0, 1, 0, 0); renderOne(m, t - 1 / 60);
  renderOne(g, t); g.save(); g.globalAlpha = 0.5; g.drawImage(MB, 0, 0); g.restore();
};
const renderOne = (g: Ctx, t: number) => {
  let i = SH.findIndex((s) => t >= s.t0 && t < s.t1!); if (i < 0) i = SH.length - 1;
  const sh = SH[i];
  drawShot(g, sh, t);
  const f = sh.fade ?? 0;
  if (f && i > 0 && t - sh.t0 < f) {
    if (!BUF) BUF = mk(VW, VH); const b = BUF.getContext("2d")!; b.setTransform(1, 0, 0, 1, 0, 0); drawShot(b, SH[i - 1], t);
    g.save(); g.globalAlpha = 1 - smooth((t - sh.t0) / f); g.drawImage(BUF, 0, 0); g.restore();
  }
  post(g, t, 0.42, (sh.bloom ?? 0.5) * 0.7, sh.sat ?? 1.18);
  if (t > DUR - 1.2) { g.fillStyle = `rgba(0,0,0,${clamp((t - (DUR - 1.2)) / 1.0)})`; g.fillRect(0, 0, VW, VH); }
  if (t < 0.4) { g.fillStyle = `rgba(0,0,0,${1 - t / 0.4})`; g.fillRect(0, 0, VW, VH); }
};
export const SHOT_LIST = SH.map((s) => ({ t0: s.t0, t1: s.t1! }));
