// YouTube thumbnails (1920x1080 → 1280x720). A: the same Paraguayan soldier, 1864 (proud parade) vs 1870 (ruins, fire). B: López proud vs the burning map.
import React, { useLayoutEffect, useRef } from "react";
import { AbsoluteFill } from "remotion";
import { VW, VH, P, Ctx, Cam, mk, glow, fire, smokeCol, tint, post, rays, sun, drawLayer, drawGround, skyGrad, weather, puff, setLite } from "./engine";
import { Sc, C, flag, marchCol } from "./kit";
import { loc, clouds, forest, hillL } from "./places";
import { GOLD, NIGHTFIRE } from "./looks";
import { PY, LOPEZ, LOPEZ_F, tone, pyciv } from "./px";
import { colonial } from "./scn";
import type { Loc } from "./places";

const scene = (g: Ctx, L: Loc, cam: Cam, lite: object, act: (A: Sc) => void, wx?: ["rain" | "ash", number, number]) => {
  setLite(lite);
  if (L.sky) skyGrad(g, cam, L.sky[0], L.sky[1]); else { g.fillStyle = "#1a1412"; g.fillRect(0, 0, VW, VH); }
  drawGround(g, cam, L.ground);
  const A = new Sc(g, cam, 1.3);
  for (const l of L.layers) A.items.push({ z: l.z, d: () => drawLayer(g, cam, l) });
  act(A);
  A.items.sort((a, b) => b.z - a.z).forEach((it) => it.d());
  if (wx) weather(g, 2.1, wx[0], wx[1], wx[2]);
  A.lights.forEach((d) => d(g));
};
const FONT = `"DejaVu Serif", serif`;
const label = (g: Ctx, s: string, x: number, y: number, size: number, fill: string, stroke = "#140c0a", rot = 0) => {
  g.save(); g.translate(x, y); g.rotate(rot); g.font = `900 ${size}px ${FONT}`; g.textAlign = "center"; g.textBaseline = "middle"; g.lineJoin = "round";
  g.lineWidth = size * 0.2; g.strokeStyle = stroke; g.strokeText(s, 0, 0); g.fillStyle = fill; g.fillText(s, 0, 0); g.restore();
};
const TEAR = [[1010, 0], [930, 150], [1020, 300], [920, 470], [1010, 640], [915, 800], [1000, 950], [940, 1080]];
const tearPath = (g: Ctx, side: "L" | "R") => { g.beginPath(); if (side === "L") { g.moveTo(0, 0); TEAR.forEach(([x, y]) => g.lineTo(x, y)); g.lineTo(0, VH); } else { g.moveTo(VW, 0); TEAR.forEach(([x, y]) => g.lineTo(x, y)); g.lineTo(VW, VH); } g.closePath(); };
const SOLDIER = { ...tone(PY, 2), hair: "#2a1d16", beard: undefined, moustache: undefined };

const leftBright = (b: Ctx, hero: "soldier" | "lopez") => scene(b, loc(["#3a78c8", "#ffd8a0"], { near: "#7a7a3a", far: "#a89a5a", kind: "grass", seed: 7 }, [
    clouds("cpL", 200, ["#ffffff", "#a8c0d8"], 3, 30, 90, 14, 3), forest("cpL", 40, "palm", "#4a7a3e", 14, 4, { blur: 2, h: 13 }), hillL("cpL", 90, "#7a9a6a", 5, 8, 2)]),
  C(-2.35, 1.6, -3.0, 40, 30), GOLD, (A) => {
    if (hero === "soldier") A.a(SOLDIER, 1, -2.95, 1.0, { expr: "laugh", look: 0.3, headTilt: -5, armB: 1, wave: 1 });
    else A.a(LOPEZ, 1, -2.95, 1.0, { expr: "smile", look: 0.4, headTilt: -4, armB: 0.8 });
    flag(A, "par", -6.2, 4.4, 8, 2.6, 1.7, { wind: 1.2, t: 1.1 });
    marchCol(A, (i) => tone(PY, i + 9), 0.8, 7, -1.5, 7, 1.3, 1.3, 1, 1.1, {}, { expr: "grin" }, 20);
    A.light((gg) => { sun(gg, 170, 130, 46); rays(gg, 170, 130, 1500, 0.28, "255,236,190", 18, 0); });
  });
const rightDark = (b: Ctx, hero: "soldier" | "lopez") => scene(b, loc(["#120a12", "#8a2a14"], { near: "#2a2018", far: "#3a2a20", kind: "rubble", seed: 9 }, [
    clouds("cpR", 200, ["#c0502a", "#2a1a22"], 4, 30, 90, 20, 4), colonial("cpR", 30, 31, { ruin: true, blur: 1.4, tint: "#5a3a3a" }), forest("cpR", 60, "dead", "#1e1416", 12, 6, { blur: 1.6, h: 12 })]),
  C(2.35, 1.6, -3.0, 40, 30), NIGHTFIRE, (A) => {
    if (hero === "soldier") A.a({ ...SOLDIER, jacket: "#5a2420", pants: "#7a7262", cap: "#2a2426" }, 1, 2.95, 1.0, { expr: "shock", look: -0.9, headTilt: 5, crouch: 0.1 });
    else A.a({ ...LOPEZ_F, hat: "hair" }, 1, 2.95, 1.0, { expr: "fear", look: -0.9, headTilt: 5 });
    A.fx(1.0, (gg, c) => { for (let i = 0; i < 10; i++) { const [sx, sy, s] = P(c, 2.72 + ((i * 37) % 48) / 100, 1.55 + ((i * 23) % 30) / 100, 0.99); gg.fillStyle = "rgba(40,30,26,0.55)"; gg.beginPath(); gg.ellipse(sx, sy, 0.03 * s, 0.02 * s, i, 0, 7); gg.fill(); } });
    for (const [x, z, s] of [[5.5, 6, 1.6], [0.6, 9, 1.3], [8, 12, 2]] as number[][]) { A.fx(z, (gg, c) => fire(gg, c, 1.3 + x, x, 0, z, s, x)); A.fx(z + 0.3, (gg, c) => smokeCol(gg, c, 2, x, s * 2, z + 0.3, { h: 10, w: 2, seed: x, col: [24, 20, 22], a: 0.8 })); }
    A.light((gg) => { glow(gg, VW * 0.8, VH * 0.75, 900, "rgba(255,110,40,0.6)", 0.8); tint(gg, "#3a1010", 0.15, "multiply"); });
  }, ["ash", 200, 0.5]);

export const renderCapa = (g: Ctx, v: "A" | "B") => {
  const B = mk(VW, VH), b = B.getContext("2d")!; const hero = v === "A" ? "soldier" : "lopez";
  leftBright(b, hero); g.save(); tearPath(g, "L"); g.clip(); g.drawImage(B, 0, 0); g.restore();
  b.setTransform(1, 0, 0, 1, 0, 0); rightDark(b, hero); g.save(); tearPath(g, "R"); g.clip(); g.drawImage(B, 0, 0); g.restore();
  g.save(); g.globalCompositeOperation = "lighter"; g.strokeStyle = "rgba(255,200,120,0.9)"; g.lineWidth = 22; g.filter = "blur(10px)"; g.beginPath(); TEAR.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); g.restore();
  g.save(); g.strokeStyle = "#fff6e0"; g.lineWidth = 9; g.lineJoin = "round"; g.beginPath(); TEAR.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); g.restore();
  post(g, 0, 0.35, 0.45, 1.3);
  label(g, "1864", 230, 120, 150, "#ffffff");
  label(g, "1870", VW - 230, 120, 150, "#ff3b2f");
  g.save(); g.fillStyle = "rgba(10,6,4,0.55)"; g.beginPath(); g.ellipse(VW / 2, VH - 150, 920, 150, 0, 0, 7); g.filter = "blur(30px)"; g.fill(); g.restore();
  label(g, v === "A" ? "SERIA RÁPIDA?" : "ELE PERDEU TUDO", VW / 2, VH - 150, v === "A" ? 170 : 150, "#ffe14a", "#140c0a", -0.03);
  void puff; void pyciv;
};
export const ParaguaiCapa: React.FC<{ v?: "A" | "B" }> = ({ v = "A" }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => { const g = ref.current!.getContext("2d")!; g.setTransform(1, 0, 0, 1, 0, 0); renderCapa(g, v); }, [v]);
  return <AbsoluteFill style={{ background: "#000" }}><canvas ref={ref} width={VW} height={VH} style={{ width: "100%", height: "100%" }} /></AbsoluteFill>;
};
export const ParaguaiCapaB: React.FC = () => <ParaguaiCapa v="B" />;
