// Capas do YouTube (1920x1080 → 1280x720), acabamento realista: sombras projetadas, luz de contorno, explosão, gradação.
// A (#a): metade/metade — aliados ao sol (Lula e Chávez se abraçando) x noite na fronteira (tanque, explosão, Chávez furioso). "LULA NO MEIO"
// B (#b): Lula no centro, assustado e suando; Chávez e Correa gritando de um lado, Uribe apontando do outro; céu vermelho e explosão. "QUASE GUERRA?"
import { drawShot } from "./story";
import { VW, VH, Ctx, mk, glow, post, sun, rays, tint, P } from "./engine";
import { tank, flag } from "./kit";
import { loc, miraflores, avila, clouds, forest, mtn, hillL, selva, SKY } from "./cenarios";
import { LULA, CHAVEZ, CORREA, URIBE } from "./elenco";
import { DAY, NIGHTFIRE, RED } from "./looks";
import { blast, embers } from "./fx";
import { fire, smokeCol } from "./engine";
import type { Shot } from "./types";

const FONT = `"DejaVu Sans", sans-serif`;
const label = (g: Ctx, s: string, x: number, y: number, size: number, fill: string, rot = 0, stroke = "#120808") => {
  g.save(); g.translate(x, y); g.rotate(rot); g.font = `900 ${size}px ${FONT}`; g.textAlign = "center"; g.textBaseline = "middle"; g.lineJoin = "round";
  g.shadowColor = "rgba(0,0,0,0.7)"; g.shadowBlur = size * 0.25; g.lineWidth = size * 0.22; g.strokeStyle = stroke; g.strokeText(s, 0, 0); g.shadowBlur = 0; g.fillStyle = fill; g.fillText(s, 0, 0); g.restore();
};
const TEAR = [[1010, 0], [930, 150], [1020, 300], [920, 470], [1010, 640], [915, 800], [1000, 950], [940, 1080]];
const tearPath = (g: Ctx, side: "L" | "R") => { g.beginPath(); if (side === "L") { g.moveTo(0, 0); TEAR.forEach(([x, y]) => g.lineTo(x, y)); g.lineTo(0, VH); } else { g.moveTo(VW, 0); TEAR.forEach(([x, y]) => g.lineTo(x, y)); g.lineTo(VW, VH); } g.closePath(); };
const fixo = (c: number[]) => () => ({ x: c[0], y: c[1], z: c[2], fov: c[3], shift: c[4] ?? 0 });

// ---- A: esquerda (aliados ao sol) ----
const A_ESQ: Shot = { t0: 0, t1: 10, L: () => loc(SKY.day, { near: "#c8b48a", far: "#b8a47a", kind: "stone", seed: 16 }, [clouds("ca1", 260, ["#ffffff", "#c8dcee"], 6), avila("ca1", 200), forest("ca1", 60, "palm", "#3e7a3a", 18, 4, { blur: 1.3, h: 14 }), miraflores("ca1", 30)]),
  cam: fixo([0.05, 1.5, -2.4, 38, 10]), lite: { ...DAY, ra: 0.8, rim: "#fff0c8" }, act: (A) => {
    A.a(LULA, 1, -0.5, 2.6, { expr: "laugh", look: 1, facing: 1, armB: 1.1, prop: ["point", 0.4] }); A.a(CHAVEZ, 2, 0.55, 2.65, { expr: "laugh", look: -1, facing: -1, armB: 1.1, prop: ["point", 0.4] }, { flip: true });
    flag(A, "br", -3.4, 3.9, 6, 2.2, 1.45, { wind: 1.1 }); flag(A, "ve", 2.2, 3.9, 6, 2.2, 1.45, { wind: 1.1 });
    A.light((g) => { sun(g, VW * 0.12, VH * 0.12, 40); rays(g, VW * 0.12, VH * 0.12, VW * 0.9, 0.22, "255,236,190", 18, 0); });
  } };
// ---- A: direita (noite na fronteira) ----
const A_DIR: Shot = { t0: 0, t1: 10, L: () => loc(["#120608", "#5a1a10"], { near: "#2a1e16", far: "#3a2a1e", kind: "mud", seed: 61 }, [hillL("ca2", 200, "#1a0e10", 6, 16, 3), selva("ca2", 60, "#120e0c", 3, { blur: 1.3 })]),
  cam: fixo([0.0, 1.45, -2.6, 40, 10]), lite: { ...NIGHTFIRE, ra: 1 }, act: (A) => {
    tank(A, "amx", 2.6, 11, { vel: 0, dark: 0.3, fire: 0.05 });
    A.fx(9, (g, c) => { blast(g, c, 0.45, -1.8, 0, 9, 4.2, 5, { debris: 30 }); fire(g, c, 1.3, 2.6, 0, 8.6, 1.2, 7); });
    A.fx(12, (g, c) => smokeCol(g, c, 3, 0, 0, 12, { h: 14, w: 3, col: [26, 20, 22], a: 0.85, seed: 3, wind: 0.3 }));
    A.fx(5, (g, c) => embers(g, c, 2.2, 0, 5, 12, 60, 8, 5));
    A.a(CHAVEZ, 1, -0.15, 2.4, { expr: "shout", look: -0.3, prop: ["point", 0.05], headTilt: -6 });
    A.light((g) => { glow(g, VW * 0.45, VH * 0.45, 900, "rgba(255,120,40,1)", 0.55); });
  } };
// ---- B: Lula no meio ----
const B_CENA: Shot = { t0: 0, t1: 10, L: () => loc(["#1a0608", "#c8401c"], { near: "#3a2418", far: "#5a3420", kind: "sand", seed: 62 }, [clouds("cb", 260, ["#ff9a50", "#3a1018"], 9, 40, 110, 20, 4), mtn("cb", 260, "#2a1014", 9, 50, false, 3), hillL("cb", 90, "#3a1a14", 3, 6, 1.5)]),
  cam: fixo([0, 1.5, -3.4, 44, 8]), lite: { ...RED, ra: 1, rim: "#ffb070" }, act: (A) => {
    for (const [x, z, s, a] of [[-6, 14, 5, 0.42], [6.5, 16, 5.5, 0.55]] as number[][]) A.fx(z, (g, c) => blast(g, c, a, x, 0, z, s, x * 3, { debris: 20 }));
    tank(A, "amx", -6, 13, { vel: 0, dark: 0.4 }); tank(A, "amx", 6.5, 14, { vel: 0, dark: 0.4, dir: -1 });
    A.a({ ...LULA, hair: "#9e9a92", beard: "#b4b0a8", moustache: "#a8a49c" }, 1, 0, 2.0, { expr: "shock", look: 0, armB: 0.9, headTilt: 3 });
    A.a(CHAVEZ, 2, -1.45, 3.0, { expr: "shout", look: 1, facing: 1, prop: ["point", 0.2] }); A.a(CORREA, 3, -2.5, 3.6, { expr: "shout", look: 1, facing: 1 });
    A.a(URIBE, 4, 1.6, 3.0, { expr: "stern", look: -1, facing: -1, prop: ["point", 0.2] }, { flip: true });
    A.fx(4, (g, c) => embers(g, c, 2.2, 0, 4, 12, 60, 8, 7));
    A.light((g) => glow(g, VW / 2, VH * 0.3, 1000, "rgba(255,110,40,1)", 0.4));
  } };

// ---- C (clean): só o Lula, grande, no escuro com luz vermelha | tanques em silhueta contra o clarão ----
const C_LULA: Shot = { t0: 0, t1: 10, L: () => loc(["#050304", "#1a0606"], { near: "#0a0606", far: "#140808", kind: "none", seed: 70 }, []),
  cam: fixo([0.0, 1.22, -1.5, 34, 0]), lite: { sx: -0.4, sy: 0.2, sa: 0, scol: "#000", rim: "#ff2a1a", ra: 1, rdx: 1, rdy: -0.3, key: "#ffc0b0", ka: 0.14 }, act: (A) => {
    A.a({ ...LULA, hair: "#a8a49c", beard: "#b8b4ac", moustache: "#aaa69e" }, 1, 0, 2.6, { expr: "stern", look: 0.35, headTilt: -3, armB: 0 }, { shadow: 0 });
    A.fx(4, (g, c) => smokeCol(g, c, 2, 0.5, -1, 4, { h: 4, w: 2.5, col: [40, 8, 8], a: 0.5, seed: 9, wind: 0.2 }));
  } };
const C_FRONT: Shot = { t0: 0, t1: 10, L: () => loc(["#0a0204", "#8a1a08"], { near: "#080404", far: "#1a0806", kind: "none", seed: 71 }, [hillL("cc2", 160, "#0a0405", 6, 10, 2)]),
  cam: fixo([0, 1.2, -6, 40, -10]), lite: { sx: 0.2, sy: -0.3, sa: 0, scol: "#000", rim: "#ff7a30", ra: 1, rdx: 0, rdy: -1, key: "#200808", ka: 0.9 }, act: (A) => {
    A.fx(40, (g, c) => { fire(g, c, 1.2, 0, 0, 40, 6, 3); fire(g, c, 2.1, 7, 0, 46, 5, 8); }); A.light((g) => glow(g, VW * 0.62, VH * 0.48, 700, "rgba(255,110,30,1)", 0.7));
    A.fx(44, (g, c) => smokeCol(g, c, 4, 4, 0, 44, { h: 40, w: 8, col: [14, 8, 8], a: 0.9, seed: 4, wind: 0.25 }));
    for (const [x, z, d] of [[-5, 14, 1], [3.5, 18, -1], [10, 24, -1]] as number[][]) tank(A, "amx", x, z, { vel: 0, dark: 1, dir: d as 1 | -1 });
    A.fx(8, (g, c) => embers(g, c, 2.5, 0, 8, 20, 90, 10, 3));
  } };

export const renderCapa = (g: Ctx, v: string) => {
  const B = mk(VW, VH), b = B.getContext("2d")!;
  if (v === "c") {
    drawShot(g, C_FRONT, 0.8); b.setTransform(1, 0, 0, 1, 0, 0); drawShot(b, C_LULA, 0.8);
    // os tanques ficam pretos como silhuetas
    const m = mk(VW, VH), mg = m.getContext("2d")!; const gr = mg.createLinearGradient(VW * 0.42, 0, VW * 0.6, 0); gr.addColorStop(0, "#000"); gr.addColorStop(1, "rgba(0,0,0,0)");
    mg.drawImage(B, -VW * 0.22, 0); mg.globalCompositeOperation = "destination-in"; mg.fillStyle = gr; mg.fillRect(0, 0, VW, VH); g.drawImage(m, 0, 0);
    post(g, 0, 0.6, 0.55, 1.15);
    g.save(); g.globalCompositeOperation = "multiply"; const vg = g.createLinearGradient(0, VH * 0.55, 0, VH); vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(0,0,0,0.85)"); g.fillStyle = vg; g.fillRect(0, 0, VW, VH); g.restore();
    { const sx = VW * 0.445, sy = VH * 0.25, r = 165; glow(g, sx, sy, r * 2.4, "rgba(255,30,20,1)", 0.5);
      g.save(); g.translate(sx, sy); g.rotate(0.1); g.beginPath(); for (let i = 0; i < 10; i++) { const an = -Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? r * 0.42 : r; g.lineTo(Math.cos(an) * rr, Math.sin(an) * rr); } g.closePath();
      const gr = g.createRadialGradient(0, -r * 0.3, r * 0.1, 0, 0, r); gr.addColorStop(0, "#ff4a36"); gr.addColorStop(1, "#b0000c"); g.fillStyle = gr; g.shadowColor = "rgba(255,40,20,1)"; g.shadowBlur = 50; g.fill(); g.shadowBlur = 0;
      g.lineJoin = "round"; g.lineWidth = 10; g.strokeStyle = "#ffffff"; g.stroke(); g.fillStyle = "#ffffff"; g.font = `900 ${Math.round(r * 0.6)}px "DejaVu Sans", sans-serif`; g.textAlign = "center"; g.textBaseline = "middle"; g.lineWidth = 12; g.strokeStyle = "#5a0006"; g.strokeText("PT", 0, r * 0.1); g.fillText("PT", 0, r * 0.1); g.restore(); }
    label(g, "QUASE", VW * 0.72, VH * 0.68, 165, "#ffffff"); label(g, "GUERRA", VW * 0.72, VH * 0.85, 185, "#ff2a1a", 0, "#0a0000");
    return;
  }
  if (v === "b") {
    drawShot(g, B_CENA, 0.8); post(g, 0, 0.42, 0.45, 1.3);
    label(g, "2008", 210, 110, 120, "#ffffff"); label(g, "QUASE GUERRA?", VW / 2, VH - 130, 175, "#ffe14a", -0.02);
    return;
  }
  drawShot(b, A_ESQ, 0.8); g.save(); tearPath(g, "L"); g.clip(); g.drawImage(B, -VW * 0.24, 0); g.restore();
  b.setTransform(1, 0, 0, 1, 0, 0); drawShot(b, A_DIR, 0.8); g.save(); tearPath(g, "R"); g.clip(); g.drawImage(B, VW * 0.22, 0); g.restore();
  g.save(); g.globalCompositeOperation = "lighter"; g.strokeStyle = "rgba(255,200,120,0.9)"; g.lineWidth = 24; g.filter = "blur(10px)"; g.beginPath(); TEAR.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); g.restore();
  g.save(); g.strokeStyle = "#fff6e0"; g.lineWidth = 9; g.lineJoin = "round"; g.beginPath(); TEAR.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); g.restore();
  post(g, 0, 0.38, 0.45, 1.3); tint(g, "#000000", 0, "multiply");
  label(g, "ALIADOS", 300, 110, 120, "#ffffff"); label(g, "2008", VW - 230, 110, 130, "#ff3b2f");
  g.save(); g.fillStyle = "rgba(10,6,4,0.6)"; g.filter = "blur(30px)"; g.beginPath(); g.ellipse(VW / 2, VH - 135, 880, 140, 0, 0, 7); g.fill(); g.restore();
  label(g, "LULA NO MEIO", VW / 2, VH - 135, 180, "#ffe14a", -0.03);
};
