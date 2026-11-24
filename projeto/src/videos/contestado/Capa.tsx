// YouTube thumbnail (1920x1080 → 1280x720): the same caboclo father — 1912 at home with his family in golden light
// vs 1916 the house burning, soldiers behind him. Text: years in the top corners, "GUERRA ESQUECIDA" below.
import React, { useLayoutEffect, useRef } from "react";
import { AbsoluteFill } from "remotion";
import { VW, VH, P, Ctx, mk, glow, fire, smokeCol, tint, post, rays, sun, drawLayer, drawGround, skyGrad, weather, setLite } from "./engine";
import { Sc, C, flag } from "./kit";
import { blast, embers } from "./fx";
import { sold } from "./props";
import { plat } from "./lugares";
import { PAI, MAE, FILHO, FILHA } from "./shots_1";
import { GOLD, NIGHTFIRE } from "./looks";
import type { Cam } from "./engine";
import type { Loc } from "./paint";
import "./props";

const scene = (g: Ctx, Lc: Loc, cam: Cam, act: (A: Sc) => void, wx?: ["rain" | "ash", number, number]) => {
  if (Lc.sky) skyGrad(g, cam, Lc.sky[0], Lc.sky[1]);
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
const TEAR = [[1010, 0], [930, 150], [1020, 300], [920, 470], [1010, 640], [915, 800], [1000, 950], [940, 1080]];
const tearPath = (g: Ctx, side: "L" | "R") => { g.beginPath(); if (side === "L") { g.moveTo(0, 0); TEAR.forEach(([x, y]) => g.lineTo(x, y)); g.lineTo(0, VH); } else { g.moveTo(VW, 0); TEAR.forEach(([x, y]) => g.lineTo(x, y)); g.lineTo(VW, VH); } g.closePath(); };

export const renderCapa = (g: Ctx) => {
  const B = mk(VW, VH), b = B.getContext("2d")!;
  // LEFT — 1912: the family smiling in front of their wooden house, golden sun
  setLite(GOLD);
  scene(b, plat("capaL", "gold", { fence: 12 }), C(-2.3, 1.35, -2.6, 40, 70), (A) => {
    A.sp("casa", -3.0, 0, 13);
    A.a(PAI, 11, -2.9, 1.1, { expr: "laugh", look: 0, headTilt: -4 });
    A.a(MAE, 12, -1.7, 1.9, { expr: "smile", look: -0.4 }); A.a(FILHO, 13, -3.9, 1.6, { expr: "laugh", look: 0.5 }); A.a(FILHA, 14, -1.2, 1.5, { expr: "smile", look: -0.6 });
    A.light((gg) => { sun(gg, 170, 130, 46, "255,220,160"); rays(gg, 170, 130, 1500, 0.3, "255,226,170", 18, 0); });
  });
  g.save(); tearPath(g, "L"); g.clip(); g.drawImage(B, 0, 0); g.restore();
  // RIGHT — 1916: the same man in shock, his house on fire, soldiers advancing
  b.setTransform(1, 0, 0, 1, 0, 0); setLite(NIGHTFIRE);
  scene(b, plat("capaR", "fire", { dense: 0.8 }), C(2.3, 1.35, -2.6, 40, 70), (A) => {
    A.sp("casa", 3.6, 0, 13);
    A.fx(12.9, (gg, c) => { fire(gg, c, 1.3, 1.6, 2.8, 12.8, 2.2, 3); fire(gg, c, 1.7, 4.8, 3.4, 12.8, 2.6, 5); fire(gg, c, 2.1, 3.6, 4.8, 12.8, 2.2, 7); fire(gg, c, 2.6, 6.4, 1.4, 12.8, 1.6, 9); smokeCol(gg, c, 2, 3.6, 5.5, 13, { h: 16, w: 3, seed: 4, col: [30, 26, 28] }); embers(gg, c, 2, 3.6, 10, 10, 70, 8, 3); });
    for (let i = 0; i < 4; i++) A.a(sold(i), 30 + i, 4.2 + i * 1.1, 3.6 + (i % 2) * 0.6, { expr: "stern", look: -1, facing: -1, prop: ["rifleUp", 0] }, { dark: 0.75, darkCol: "#160a08" });
    A.a(PAI, 11, 2.9, 1.1, { expr: "shock", look: -1, armB: 1, headTilt: 6 });
    
    A.light((gg) => { glow(gg, VW * 0.72, VH * 0.32, 900, "rgba(255,120,40,0.55)", 0.85); tint(gg, "#3a1010", 0.12, "multiply"); });
  }, ["ash", 160, 0.6]);
  g.save(); tearPath(g, "R"); g.clip(); g.drawImage(B, 0, 0); g.restore();
  g.save(); g.globalCompositeOperation = "lighter"; g.strokeStyle = "rgba(255,200,120,0.9)"; g.lineWidth = 22; g.filter = "blur(10px)"; g.beginPath(); TEAR.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); g.restore();
  g.save(); g.strokeStyle = "#fff6e0"; g.lineWidth = 9; g.lineJoin = "round"; g.beginPath(); TEAR.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); g.restore();
  post(g, 0, 0.35, 0.45, 1.3);
  label(g, "1912", 230, 120, 150, "#ffffff");
  label(g, "1916", VW - 230, 120, 150, "#ff3b2f");
  g.save(); g.fillStyle = "rgba(10,6,4,0.55)"; g.beginPath(); g.ellipse(VW / 2, VH - 150, 920, 150, 0, 0, 7); g.filter = "blur(30px)"; g.fill(); g.restore();
  label(g, "GUERRA ESQUECIDA", VW / 2, VH - 150, 150, "#ffe14a", "#140c0a", -0.03);
};

export const ContestadoCapa: React.FC = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => { const g = ref.current!.getContext("2d")!; g.setTransform(1, 0, 0, 1, 0, 0); renderCapa(g); }, []);
  return <AbsoluteFill style={{ background: "#000" }}><canvas ref={ref} width={VW} height={VH} style={{ width: "100%", height: "100%" }} /></AbsoluteFill>;
};
