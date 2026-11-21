// YouTube thumbnail (1920x1080, rendered at 2/3 → 1280x720): same young soldier, 1914 (cheerful send-off) vs 1918 (trench horror).
import React, { useLayoutEffect, useRef } from "react";
import { AbsoluteFill } from "remotion";
import { VW, VH, P, Ctx, mk, glow, boom, fire, smokeCol, tint, post, rays, sun, drawLayer, drawGround, skyGrad, weather, puff } from "./engine";
import { loc } from "./paint";
import { Sc, C, FR14, FR, civ, crowd, mudFront, flare } from "./kit";
import type { Cam } from "./engine";

const scene = (g: Ctx, L: string, v: string, cam: Cam, act: (A: Sc) => void, wx?: ["rain" | "ash", number, number]) => {
  const Lc = loc(L, v);
  if (Lc.sky) skyGrad(g, cam, Lc.sky[0], Lc.sky[1]); else { g.fillStyle = "#1a1412"; g.fillRect(0, 0, VW, VH); }
  drawGround(g, cam, Lc.ground);
  const A = new Sc(g, cam, 1.3);
  for (const l of Lc.layers) A.items.push({ z: l.z, d: () => drawLayer(g, cam, l) });
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
// zig-zag tear between the halves
const TEAR = [[1010, 0], [930, 150], [1020, 300], [920, 470], [1010, 640], [915, 800], [1000, 950], [940, 1080]];
const tearPath = (g: Ctx, side: "L" | "R") => { g.beginPath(); if (side === "L") { g.moveTo(0, 0); TEAR.forEach(([x, y]) => g.lineTo(x, y)); g.lineTo(0, VH); } else { g.moveTo(VW, 0); TEAR.forEach(([x, y]) => g.lineTo(x, y)); g.lineTo(VW, VH); } g.closePath(); };

export const renderCapa = (g: Ctx) => {
  const B = mk(VW, VH), b = B.getContext("2d")!;
  // LEFT — 1914, sunny send-off
  scene(b, "station", "", C(-2.35, 1.3, -2.4, 40, 60), (A) => {
    A.a(FR14, 1, -2.95, 1.0, { expr: "laugh", look: 0, prop: ["flag", 0.6], headTilt: -4 }, { sc: 1.0 });
    crowd(A, 14, -8, 2, 4, 8, 7, (i) => ({ expr: "grin", wave: Math.sin(i * 1.7) }));
    A.fx(0.8, (gg, c) => { for (let i = 0; i < 70; i++) { const [sx, sy, s] = P(c, -6.5 + ((i * 37) % 70) / 10, 3.4 - ((i * 53) % 34) / 10, 1.2 + (i % 5)); gg.save(); gg.translate(sx, sy); gg.rotate(i); gg.fillStyle = ["#e8463a", "#f4f1ea", "#ffd34a", "#3a6ab0"][i % 4]; gg.fillRect(-0.05 * s, -0.03 * s, 0.1 * s, 0.06 * s); gg.restore(); } });
    A.light((gg) => { sun(gg, 160, 120, 46); rays(gg, 160, 120, 1500, 0.28, "255,236,190", 18, 0); });
  });
  g.save(); tearPath(g, "L"); g.clip(); g.drawImage(B, 0, 0); g.restore();
  // RIGHT — 1918, same face in the mud, explosion behind
  b.setTransform(1, 0, 0, 1, 0, 0);
  scene(b, "trenchIn", "night", C(2.35, 1.3, -2.4, 40, 60), (A) => {
    A.a({ ...FR, moustache: undefined, jacket: "#6a7c96", pants: "#5a6a84" }, 1, 2.95, 1.0, { expr: "shock", look: -1, crouch: 0.1, headTilt: 5 }, { y: -0.1 });
    A.fx(0.99, (gg, c) => { for (let i = 0; i < 9; i++) { const [sx, sy, s] = P(c, 2.72 + ((i * 37) % 48) / 100, 1.08 + ((i * 23) % 26) / 100, 0.99); gg.fillStyle = "rgba(70,50,32,0.6)"; gg.beginPath(); gg.ellipse(sx, sy, 0.035 * s, 0.022 * s, i, 0, 7); gg.fill(); } });
    A.fx(3.0, (gg, c) => { boom(gg, c, 0.16, 4.0, 1.55, 3.0, 1.4, 3); boom(gg, c, 0.32, 1.2, 1.8, 3.1, 1.0, 8); fire(gg, c, 1.3, 4.2, 1.3, 3.05, 0.5, 4); });
    A.fx(3.2, (gg, c) => smokeCol(gg, c, 2, 3.5, 3, 3.2, { h: 6, w: 1.6, seed: 4, col: [30, 26, 28] }));
    mudFront(A, 0.5, 0, 6, 0.08);
    A.light((gg) => { glow(gg, VW * 0.78, VH * 0.3, 900, "rgba(255,120,40,0.55)", 0.85); tint(gg, "#3a1010", 0.15, "multiply"); });
  }, ["rain", 220, 0.45]);
  g.save(); tearPath(g, "R"); g.clip(); g.drawImage(B, 0, 0); g.restore();
  // tear edge: glowing seam
  g.save(); g.globalCompositeOperation = "lighter"; g.strokeStyle = "rgba(255,200,120,0.9)"; g.lineWidth = 22; g.filter = "blur(10px)"; g.beginPath(); TEAR.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); g.restore();
  g.save(); g.strokeStyle = "#fff6e0"; g.lineWidth = 9; g.lineJoin = "round"; g.beginPath(); TEAR.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); g.restore();
  post(g, 0, 0.35, 0.45, 1.3);
  // text
  label(g, "1914", 230, 120, 150, "#ffffff");
  label(g, "1918", VW - 230, 120, 150, "#ff3b2f");
  g.save(); g.fillStyle = "rgba(10,6,4,0.55)"; g.beginPath(); g.ellipse(VW / 2, VH - 150, 900, 150, 0, 0, 7); g.filter = "blur(30px)"; g.fill(); g.restore();
  label(g, "ANTES DO NATAL?", VW / 2, VH - 150, 170, "#ffe14a", "#140c0a", -0.03);
};

export const TrincheirasCapa: React.FC = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => { const g = ref.current!.getContext("2d")!; g.setTransform(1, 0, 0, 1, 0, 0); renderCapa(g); }, []);
  return <AbsoluteFill style={{ background: "#000" }}><canvas ref={ref} width={VW} height={VH} style={{ width: "100%", height: "100%" }} /></AbsoluteFill>;
};
