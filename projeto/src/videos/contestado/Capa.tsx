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
  // clean split portrait: the same caboclo, 1912 at peace (left) / 1916 at war (right); straight cut, flat light, no bloom
  const B = mk(VW, VH), b = B.getContext("2d")!, cam = C(0, 1.42, -1.1, 40, 175);
  setLite({ ...GOLD, ra: 0.25, ka: 0.05 });
  scene(b, plat("capaL2", "day", { fence: 10 }), cam, (A) => {
    A.sp("casa", -6.5, 0, 26); A.sp("rancho", 5.5, 0, 30);
    A.a(PAI, 11, 0, 1.25, { expr: "smile_closed", look: 0, headTilt: 0, armB: 0 }, { shadow: 0, noCast: true });
  });
  g.save(); g.beginPath(); g.rect(0, 0, VW / 2, VH); g.clip(); g.drawImage(B, 0, 0); g.restore();
  b.setTransform(1, 0, 0, 1, 0, 0); setLite({ ...NIGHTFIRE, ra: 0.5, ka: 0.18 });
  scene(b, plat("capaR2", "dusk", { dense: 0.7 }), cam, (A) => {
    A.sp("casa", 6.5, 0, 26);
    A.fx(25.9, (gg, c) => { fire(gg, c, 1.3, 5.3, 3.0, 25.8, 1.8, 3); fire(gg, c, 1.7, 7.7, 3.6, 25.8, 2.0, 5); smokeCol(gg, c, 2, 6.5, 6, 26, { h: 22, w: 3, seed: 4, col: [46, 40, 44], a: 0.7 }); });
    for (let i = 0; i < 4; i++) A.a(sold(i), 30 + i, 2.2 + i * 1.3, 12 + (i % 2) * 1.0, { expr: "stern", look: -1, facing: -1, prop: ["rifleUp", 0] }, { dark: 0.55, darkCol: "#1a1016" });
    A.a(PAI, 11, 0, 1.25, { expr: "fear", look: 0, headTilt: 0, armB: 0 }, { shadow: 0, noCast: true });
  });
  g.save(); g.beginPath(); g.rect(VW / 2, 0, VW / 2, VH); g.clip(); g.drawImage(B, 0, 0); g.restore();
  post(g, 0, 0.18, 0, 1.08);
  g.fillStyle = "#f4efe6"; g.fillRect(VW / 2 - 3, 0, 6, VH);
  // title: bold sans, wide tracking, white with a dark outline and soft shadow
  const title = (s: string, y: number, size: number) => { g.save(); g.font = `bold ${size}px "DejaVu Sans", sans-serif`; g.textAlign = "center"; g.textBaseline = "middle";
    if ("letterSpacing" in g) (g as unknown as { letterSpacing: string }).letterSpacing = `${Math.round(size * 0.1)}px`;
    g.shadowColor = "rgba(0,0,0,0.45)"; g.shadowBlur = 18; g.shadowOffsetY = 6; g.lineJoin = "round"; g.lineWidth = size * 0.16; g.strokeStyle = "#1c1820"; g.strokeText(s, VW / 2, y);
    g.shadowColor = "transparent"; g.fillStyle = "#ffffff"; g.fillText(s, VW / 2, y); g.restore(); };
  title("GUERRA DO", 95, 100); title("CONTESTADO", 205, 118);
};

export const ContestadoCapa: React.FC = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => { const g = ref.current!.getContext("2d")!; g.setTransform(1, 0, 0, 1, 0, 0); renderCapa(g); }, []);
  return <AbsoluteFill style={{ background: "#000" }}><canvas ref={ref} width={VW} height={VH} style={{ width: "100%", height: "100%" }} /></AbsoluteFill>;
};
