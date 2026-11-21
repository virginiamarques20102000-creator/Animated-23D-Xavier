// Shots 439.8 – 603.25 s: chapter 6 (end of the war), chapter 7 (scars), closing.
import { VW, VH, P, glow, boom, fire, smokeCol, puff, tint, clamp, lerp, smooth, easeOut, easeIn, hash, rays, sun, muzzle } from "./engine";
import { MX, MY } from "./paint";
import { Sc, C, mv, path, walkF, walkS, runS, marchF, marchCol, crowd, booms, mudFront, flare, tracers, spurts, muzzleAt, flies, hl, arrow, frontLine, pin,
  chapter, calendar, counter, caption, bigText, clockFace, GER, GERN, BRI, BRIN, BOFF, FR, FRN, FR14, GER14, BRI14, USA, KAISER, FRANZJ, POINC, GEORGE, NICK, DIP, MOM, KIDO, KIDG, NURSE, POST, civ } from "./kit";
import { waves } from "./shots_a";
import type { Shot } from "./types";

const ev = (T: number, w: number) => T - w;
const VET: typeof BRI = { ...BRIN, jacket: "#6e6244", pants: "#5e5438" };
export const SHOTS_C: Shot[] = [
  // 97 CAPÍTULO 6 — O FIM DA GUERRA
  { t0: 439.83, L: "nomans", v: "dusk", fade: 0.5, cam: mv([0, 1.8, -9, 46], [0, 2.0, -10, 46]), act: (A, lt) => {
    A.light((g) => { const [sx, sy] = P(A.cam, 0, 3, 200); sun(g, sx, sy, 44, "255,190,120"); rays(g, sx, sy, 1100, 0.18, "255,190,130", 18, lt); });
    A.over((g) => chapter(g, "CAPÍTULO 6", "O FIM DA GUERRA", lt - 0.1, 3.4));
  } },
  // 98a "Em 1918, a Alemanha tentou uma última grande ofensiva"
  { t0: 443.30, L: "nomans", v: "grey", fade: 0.3, cam: (u, lt) => C(-3 + lt * 2.4, 1.35, -7, 44), act: (A, lt, u, T) => {
    for (let r = 0; r < 2; r++) for (let i = 0; i < 9; i++) runS(A, GER, 940 + i + r * 10, lt, -4 - i * 1.6 + r * 0.7, 3 + r * 1.4, 2.8, { expr: "shout" });
    booms(A, T, [[445.6, 8, 14, 4], [446.6, 2, 20, 4], [447.3, 14, 24, 5]]); A.over((g) => caption(g, "OFENSIVA DA PRIMAVERA · 1918", lt - 0.4, 3.8));
  } },
  // 98b "antes que as forças americanas chegassem em número ainda maior."
  { t0: 448.0, L: "ocean", fade: 0.3, cam: mv([0, 3, -14, 46], [0, 3.6, -18, 48]), act: (A, lt, u, T) => {
    const n = 2 + Math.floor(clamp((T - 449.2) / 1.8) * 8); for (let i = 0; i < n; i++) A.sp("liner", -40 + (i % 5) * 20 + lt * 2, -0.3, 40 + Math.floor(i / 5) * 30 + (i % 2) * 8, { sc: 0.9 }); A.fx(30, (g, c) => waves(g, c, lt));
  } },
  // 99 "No início, os alemães conseguiram avançar."
  { t0: 452.01, L: "map", fade: 0.3, cam: mv([MX(4), MY(49.6), -12, 42], [MX(4), MY(49.6), -10, 42]), act: (A, lt, u, T) => {
    frontLine(A, 1, -0.8 * smooth(clamp((T - 453.2) / 1.2)), "#7a1a14"); arrow(A, [5.5, 50.5], [2.6, 49.6], (T - 453.4) / 0.7, "#5a6a8a", 0.3); arrow(A, [6.2, 49.2], [3.8, 48.9], (T - 453.7) / 0.7, "#5a6a8a", 0.3);
  } },
  // 100a "Mas o desgaste, a falta de recursos,"
  { t0: 455.11, L: "trenchIn", v: "grey", cam: mv([0, 1.4, -4.4, 42], [0, 1.35, -3.9, 40]), act: (A, lt) => {
    A.sp("crate", -0.6, 0, 2.2, { sc: 0.8 }); A.sp("crate", 0.5, 0, 2.3, { rot: 0.1, sc: 0.8 }); A.a(GERN, 960, 1.4, 1.2, { expr: "sad", look: -1, prop: ["bread", 0] }); A.a(GER, 961, -1.6, 1.2, { mode: "sit", expr: "dazed" });
  } },
  // 100b "o bloqueio naval"
  { t0: 457.25, L: "ocean", v: "storm", cam: mv([0, 3, -18, 46], [3, 3, -19, 46]), act: (A, lt) => { for (let i = 0; i < 6; i++) A.sp("ship", -60 + i * 24, -0.3, 70 + (i % 2) * 10); A.fx(30, (g, c) => waves(g, c, lt)); } },
  // 100c "e o fortalecimento dos Aliados começaram a pesar."
  { t0: 458.75, L: "field", fade: 0.25, cam: mv([0, 1.6, -7, 46], [0, 1.8, -8.2, 48]), act: (A, lt) => {
    for (let i = 0; i < 3; i++) A.sp("mk1", -10 + i * 9, 0, 10 + (i % 2) * 2 - lt * 0.5); marchF(A, USA, lt, 3, 6, 4, 1.4, 1.2, 1.5, 970); marchF(A, FR, lt, 2, 6, 8.5, 1.4, 1.2, 1.5, 990);
  } },
  // 101 "As tropas alemãs estavam exaustas."
  { t0: 462.48, L: "trenchIn", v: "grey", fade: 0.3, cam: (u) => C(1.6 - u * 3, 1.25, -3.2, 42), act: (A, lt) => {
    for (let i = 0; i < 5; i++) A.a(i % 2 ? GERN : GER, 1000 + i, -3 + i * 1.5, 1.0 + (i % 2) * 0.2, { mode: i % 2 ? "sit" : "stand", expr: i % 2 ? "dazed" : "sad", headTilt: 10, crouch: 0.2 }, { y: i % 2 ? 0.1 : -0.1 });
  }, wx: ["rain", 200, 0.4], mood: ["#7a7a86", 0.22] },
  // 102 "A população enfrentava fome."
  { t0: 465.11, L: "berlin", v: "grey", fade: 0.25, cam: mv([0, 1.3, -4.2, 42], [0, 1.3, -3.6, 40]), act: (A, lt) => {
    for (let i = 0; i < 7; i++) A.s(civ(i), 1010 + i, -4 + i * 1.0, 2.6, { mode: "stand", expr: "sad" }); A.a(KIDG, 1020, 1.6, 1.4, { expr: "sad", headTilt: 6 }); A.a(MOM, 1021, 2.4, 1.6, { expr: "sad", facing: -1, prop: ["bread", 0] });
  }, mood: ["#8a8a92", 0.2] },
  // 103 "A economia estava enfraquecida."
  { t0: 467.29, L: "factory", cam: mv([0, 1.5, -6, 44], [0, 1.5, -5, 44]), act: (A, lt) => {
    A.fx(1.5, (g, c) => { for (let i = 0; i < 18; i++) { const k = (lt * 0.4 + hash(i)) % 1, [sx, sy, s] = P(c, -4 + hash(i + 3) * 8 + Math.sin(lt * 2 + i), 3.5 - k * 3.5, 1.5 + hash(i) * 3); g.save(); g.translate(sx, sy); g.rotate(lt * 2 + i); g.fillStyle = "#b8c4a6"; g.strokeStyle = "#3a3024"; g.lineWidth = 1.5; g.fillRect(-0.16 * s, -0.08 * s, 0.32 * s, 0.16 * s); g.strokeRect(-0.16 * s, -0.08 * s, 0.32 * s, 0.16 * s); g.restore(); } });
  }, mood: ["#8a8a90", 0.2] },
  // 104 "Os Aliados passaram a contra-atacar e recuperar territórios."
  { t0: 469.78, L: "nomans", fade: 0.3, cam: (u, lt) => C(-2 + lt * 2.2, 1.4, -7, 44), act: (A, lt, u, T) => {
    for (let r = 0; r < 2; r++) for (let i = 0; i < 8; i++) runS(A, r ? USA : BRI, 1030 + i + r * 10, lt, -4 - i * 1.6, 3 + r * 1.4, 2.6, { expr: "shout" }); A.sp("mk1", -2 + lt * 1.6, 0, 7);
  } },
  // 105 "Dentro da Alemanha, revoltas e manifestações se espalharam."
  { t0: 474.10, L: "berlin", v: "grey,posters", fade: 0.3, cam: mv([0, 1.6, -7, 44], [0, 1.7, -5.6, 42]), act: (A, lt) => {
    crowd(A, 34, -8, 8, 2, 8, 161, (i) => ({ mode: "march", phase: (lt * 1.2 + i * 0.13) % 1, expr: "shout", prop: i % 3 === 0 ? ["fist", 0] : undefined }), (i) => (i % 4 === 0 ? GERN : civ(i)), {});
    for (let i = 0; i < 4; i++) A.sp("flagRed", -6 + i * 4, 0, 3 + i, { rot: Math.sin(lt * 3 + i) * 0.05 });
  } },
  // 106a "A monarquia entrou em colapso,"
  { t0: 478.10, L: "mirrors", fade: 0.3, cam: mv([0, 1.6, -4.2, 42], [0, 1.5, -3.6, 40]), act: (A, lt, u, T) => {
    A.a(KAISER, 1050, 0, 1.6, { expr: T > 479.3 ? "shock" : "stern", look: 0 }); const k = clamp((T - 479.35) / 0.5); A.sp("crown", 1.4 * k, 1.5 - easeIn(k) * 1.5, 1.2, { rot: k * 2, sc: 0.55 });
  } },
  // 106b "e o imperador Guilherme II abdicou."
  { t0: 480.4, L: "mirrors", cam: mv([0, 1.6, -4.4, 42], [0, 1.6, -5.2, 44]), act: (A, lt, u, T) => {
    const go = T > 481.9; if (go) walkS(A, KAISER, 1050, T - 481.9, 0, 1.6, 1.1, { expr: "sad" }); else A.a(KAISER, 1050, 0, 1.6, { expr: "sad", headTilt: 6 });
    A.sp("crown", 1.4, 0, 1.2, { rot: 2, sc: 0.55 }); A.over((g) => caption(g, "GUILHERME II · 9 DE NOVEMBRO DE 1918", lt - 0.3, 2.8));
  } },
  // 107a "Finalmente, em 11 de novembro de 1918,"
  { t0: 483.36, L: "forest", fade: 0.4, cam: mv([0, 1.6, -9, 44], [0, 1.7, -8, 44]), act: (A, lt) => {
    A.sp("wagonCar", 0, 0, 6); for (let i = 0; i < 2; i++) A.a(i ? POINC : BOFF, 1060 + i, -4 + i * 1.2, 4.2, { expr: "stern" }); A.light((g) => { const [sx, sy] = P(A.cam, -12, 6, 80); rays(g, sx, sy, 900, 0.18, "255,236,200", 14, lt); });
    A.over((g) => caption(g, "COMPIÈGNE · 11 DE NOVEMBRO DE 1918", lt - 0.3, 3.4));
  }, mood: ["#c0c8d0", 0.08] },
  // 107b "às onze horas da manhã,"
  { t0: 487.2, L: "trenchIn", cam: mv([0, 1.5, -2.6, 40], [0, 1.5, -2.2, 38]), act: (A, lt, u, T) => {
    A.a(BOFF, 1070, -0.6, 1.0, { expr: "nervous", prop: ["letter", 0], look: 0 }); A.a(BRI, 1071, 0.9, 1.2, { expr: "nervous", facing: -1, look: -1 });
    A.over((g) => clockFace(g, VW * 0.76, VH * 0.36, 160, lerp(10.9667, 11, smooth(clamp((T - 487.4) / 0.6))), clamp(lt / 0.2)));
  } },
  // 107c "o armistício entrou em vigor."
  { t0: 488.9, L: "forest", cam: mv([0, 1.35, -2.4, 36, 110], [0, 1.3, -2.0, 34, 120]), act: (A, lt, u, T) => {
    A.sp("armistice", 0, 0.92, 0.9); A.over((g) => { stamp(g, "ARMISTÍCIO", ev(T, 489.3), VW * 0.5, VH * 0.5, -0.12, 110, "#2a5a9a"); });
    A.light((g) => glow(g, VW * 0.5, VH * 0.4, VW * 0.5, "rgba(255,236,200,0.4)", 0.6));
  } },
  // 108 "Os tiros cessaram."
  { t0: 491.25, L: "nomans", v: "x", fade: 0.3, cam: mv([0, 1.3, -4, 42], [0, 1.6, -6, 44]), act: (A, lt, u, T) => {
    if (T < 491.85) { muzzleAt(A, lt, [0.1, 0.3, 0.5], -6, 0.8, 24, 0.45, -1); tracers(A, lt, 4, [10, 1, 24], [-6, 1.4, 4], 0.4, 61, "255,220,140", 0, 0.6); }
    const k = clamp((T - 491.9) / 1.2); for (let i = 0; i < 4; i++) A.a(i % 2 ? BRIN : BRI, 1080 + i, -3 + i * 2, 2.2 + (i % 2) * 0.4, { expr: k > 0.3 ? "relief" : "nervous", look: 1 }, { y: -0.9 + k * 0.9 });
    A.light((g) => { const [sx, sy] = P(A.cam, 2, 4, 120); sun(g, sx, sy, 30); rays(g, sx, sy, 1100, 0.25 * k, "255,236,200", 18, lt); });
  }, sat: 1.25 },
  // 109 "Depois de quatro anos de destruição, a Primeira Guerra Mundial havia terminado."
  { t0: 492.99, L: "nomans", v: "x", cam: mv([0, 1.5, -5, 44], [0, 1.9, -7, 46]), act: (A, lt, u, T) => {
    const party = T > 496.8; for (let i = 0; i < 10; i++) A.a(i % 3 ? BRI : i % 2 ? USA : FR, 1090 + i, -6 + i * 1.3, 2 + (i % 3) * 0.8, { expr: party ? (i % 2 ? "laugh" : "relief_open") : "relief", wave: party ? Math.sin(lt * 7 + i) : undefined, prop: party && i % 4 === 0 ? ["rifleUp", 0] : undefined }, { y: party ? Math.abs(Math.sin(lt * 6 + i)) * 0.15 : 0 });
    if (party) A.fx(1.5, (g, c) => { for (let i = 0; i < 5; i++) { const a = T - 496.8 - i * 0.12; if (a < 0 || a > 1.2) continue; const [sx, sy, s] = P(c, -4 + i * 2, 2 + a * 4 - a * a * 4.9, 2.4); g.save(); g.translate(sx, sy); g.rotate(a * 8); g.fillStyle = "#6b6a46"; g.strokeStyle = "#241726"; g.lineWidth = 3; g.beginPath(); g.ellipse(0, 0, 0.3 * s, 0.12 * s, 0, Math.PI, 0); g.fill(); g.stroke(); g.restore(); } });
    A.light((g) => { const [sx, sy] = P(A.cam, 2, 5, 120); sun(g, sx, sy, 30); rays(g, sx, sy, 1100, 0.22, "255,236,200", 18, lt); });
  }, sat: 1.25 },
  // 110 "Mas o mundo não voltaria a ser o mesmo."
  { t0: 498.63, L: "nomans", v: "dusk", fade: 0.4, cam: mv([0, 1.4, -2.6, 40], [0, 2.4, -7, 46, -40]), act: (A, lt) => {
    A.a(VET, 1100, 0, 1.0, { expr: "sad", look: 0, headTilt: 6 }); for (let i = 0; i < 10; i++) A.sp("grave", -10 + i * 2.2 + hash(i) * 0.6, 0, 6 + hash(i + 1) * 8);
    A.light((g) => { const [sx, sy] = P(A.cam, 3, 2, 200); sun(g, sx, sy, 44, "255,160,100"); });
  } },
  // 111 CAPÍTULO 7 — AS CICATRIZES QUE NUNCA DESAPARECERAM
  { t0: 501.37, L: "poppies", v: "dusk", fade: 0.4, cam: mv([0, 1.0, -3, 42], [0, 1.2, -4, 44]), act: (A, lt) => {
    A.light((g) => { const [sx, sy] = P(A.cam, 0, 3, 200); sun(g, sx, sy, 46, "255,190,120"); rays(g, sx, sy, 1100, 0.2, "255,190,130", 18, lt); });
    A.over((g) => chapter(g, "CAPÍTULO 7", "AS CICATRIZES QUE NUNCA DESAPARECERAM", lt - 0.1, 4.3));
  } },
  // 112 "A guerra deixou milhões de mortos, feridos e desaparecidos."
  { t0: 505.97, L: "poppies", fade: 0.3, cam: mv([0, 1.3, -3, 42], [0, 5, -12, 52, -200], easeIn), act: (A, lt, u, T) => {
    A.over((g) => counter(g, Math.round(lerp(0, 10000000, smooth(clamp((T - 506.8) / 2.2)))), "MILITARES MORTOS (APROXIMADAMENTE)", ev(T, 506.7), 99, VH * 0.8, "#f7eedc", 84));
  } },
  // 113 "Famílias perderam seus filhos, maridos e irmãos."
  { t0: 510.83, L: "home", fade: 0.35, cam: mv([0, 1.35, -3.6, 42], [0, 1.35, -3.0, 40]), act: (A, lt, u, T) => {
    A.a(POST, 1110, 2.0, 2.6, { expr: "sad", facing: -1, look: -1 }); A.a(MOM, 1111, -0.4, 2.4, { expr: T > 512 ? "sad" : "neutral", prop: ["letter", 0], headTilt: T > 512 ? 10 : 0 });
    A.a(KIDO, 1112, -1.3, 2.2, { expr: "sad", look: 1 }); A.a(KIDG, 1113, 0.6, 2.1, { expr: "sad", look: -1 }); A.sp("chairE", -2.6, 0, 2.9, { sc: 1.6 });
    A.light((g) => { const [sx, sy, s] = P(A.cam, 0, 2.5, 3.8); glow(g, sx, sy, 2.6 * s, "rgba(220,230,255,0.6)", 0.5); });
  }, mood: ["#8a8a9a", 0.15] },
  // 114a "Soldados voltaram para casa com ferimentos físicos"
  { t0: 514.64, L: "hospital", fade: 0.3, cam: mv([-1, 1.5, -7.4, 46], [1, 1.5, -6.6, 44]), act: (A, lt) => {
    for (let i = 0; i < 3; i++) A.a({ ...VET, hat: "hair", hair: "#4a3020" }, 1120 + i, -4.2 + i * 4.2, 2.2, { mode: "sit", expr: i === 1 ? "pained" : "sad", headTilt: 6 }, { y: 0.4 });
    A.a(NURSE, 1124, 2.2, 1.8, { expr: "smile_closed", facing: -1, look: -1 }); A.fx(2.15, (g, c) => { for (let i = 0; i < 3; i++) { const [sx, sy, s] = P(c, -4.2 + i * 4.2, 2.05, 2.15); g.strokeStyle = "#f4f1ea"; g.lineWidth = 0.1 * s; g.beginPath(); g.arc(sx, sy - 0.12 * s, 0.2 * s, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); } });
    A.light((g) => glow(g, VW * 0.5, VH * 0.2, VW * 0.5, "rgba(255,245,220,0.4)", 0.5));
  } },
  // 114b "e traumas psicológicos que, naquela época, muitas vezes eram incompreendidos."
  { t0: 518.0, L: "home", cam: mv([0, 1.5, -1.9, 36], [0, 1.5, -1.5, 34]), act: (A, lt, u, T) => {
    A.a(VET, 1130, Math.sin(lt * 35) * 0.008, 1.0, { expr: Math.floor(lt * 1.2) % 2 ? "fear" : "dazed", headTilt: 4 }); const fl = Math.floor(lt * 10) % 17 === 0 || Math.floor(lt * 10) % 23 === 0;
    A.light((g) => { if (fl) tint(g, "#ff9a50", 0.35, "screen"); tint(g, "#30303c", 0.25, "multiply"); });
    A.a(civ(2), 1131, -1.6, 2.2, { expr: "nervous", facing: 1, look: 1 }, { alpha: clamp((T - 519.8) / 0.4) });
  } },
  // 115 "Impérios desapareceram."
  { t0: 523.31, L: "map", fade: 0.3, cam: mv([MX(16), MY(50), -27, 42], [MX(16), MY(50), -25, 42]), act: (A, lt, u, T) => {
    ([["GER", "#5a6a8a"], ["AH", "#c9a24a"], ["RUS", "#3a7a5a"], ["OTT", "#8a4a2a"]] as [string, string][]).forEach(([k, col]) => hl(A, k, 1 - clamp((T - 523.9) / 0.9), col, 0.55));
  } },
  // 116 "O Império Alemão, o Austro-Húngaro, o Russo e o Otomano foram profundamente transformados ou desmantelados."
  { t0: 525.25, L: "map", cam: mv([MX(16), MY(50), -25, 42], [MX(18), MY(49), -22, 42]), act: (A, lt, u, T) => {
    ([["GER", "#5a6a8a", 526.0], ["AH", "#c9a24a", 526.9], ["RUS", "#3a7a5a", 528.0], ["OTT", "#8a4a2a", 528.6]] as [string, string, number][]).forEach(([k, col, at]) => hl(A, k, Math.min((T - at) / 0.3, 1 - clamp((T - 531.2) / 0.6) * 0.6), col, 0.6));
    A.fx(-0.1, (g, c) => { const k = clamp((T - 530.4) / 1.2); if (k <= 0) return; g.save(); g.strokeStyle = "#2a1d16"; g.lineWidth = 4; g.setLineDash([12, 8]);
      for (const L of [[[14.5, 50.9], [18.8, 49.6], [22.5, 49]], [[16.9, 48.7], [19, 48.2]], [[13.6, 46.5], [16.5, 46.4], [19, 46.1]], [[22.8, 54.3], [24, 53], [24, 50.5]], [[24, 57], [27.8, 56]], [[26, 59.4], [28, 57.8]], [[36, 36.3], [42, 37.2]]]) {
        g.beginPath(); L.forEach(([lo, la], i) => { const [sx, sy] = P(c, MX(lerp(L[0][0], lo, k)), MY(lerp(L[0][1], la, k)), 0); i ? g.lineTo(sx, sy) : g.moveTo(sx, sy); }); g.stroke(); } g.restore(); });
  } },
  // 117 "Em 1919, o Tratado de Versalhes impôs duras condições à Alemanha,"
  { t0: 532.73, L: "mirrors", fade: 0.35, cam: mv([0, 1.6, -5.4, 44], [0, 1.45, -3.6, 40]), act: (A, lt, u, T) => {
    A.a(DIP[0], 1140, -2.2, 2.0, { expr: "stern", facing: 1 }); A.a(POINC, 1141, -1.1, 2.3, { expr: "stern", facing: 1 }); A.a(DIP[3], 1142, 2.2, 2.1, { expr: "stern", facing: -1 });
    const sign = T > 536.1; A.a(DIP[1], 1143, 0.8, 1.85, { expr: sign ? "sad" : "nervous", facing: -1, prop: sign ? ["pen", lt] : undefined, crouch: sign ? 0.3 : 0, headTilt: sign ? 8 : 0 });
    A.sp("treatyV", 0.2, 0.92, 1.55, { sc: 0.4 }); A.over((g) => caption(g, "VERSALHES · 28 DE JUNHO DE 1919", lt - 0.3, 4.6));
  } },
  // 118a "incluindo perdas territoriais,"
  { t0: 538.27, L: "map", fade: 0.25, cam: mv([MX(11), MY(51), -16, 42], [MX(11), MY(51), -14, 42]), act: (A, lt, u, T) => {
    hl(A, "GER", 1, "#5a6a8a", 0.5); const k = smooth(clamp((T - 539.0) / 0.9));
    A.fx(-0.06, (g, c) => { for (const [poly, dx, dy] of [[[6.2, 49.4, 7.6, 47.6, 8.2, 48.9, 7.4, 49.3], -1.2, 0], [[16.5, 54.5, 22.8, 54.3, 22.5, 53.4, 18.6, 51.6, 16, 52.4], 0.8, 0.6], [[8.6, 54.8, 9.9, 54.8, 9.6, 54.3], 0, 0.6]] as [number[], number, number][]) {
      g.save(); g.fillStyle = "#c9a24a"; g.strokeStyle = "#241726"; g.lineWidth = 3; g.beginPath(); for (let i = 0; i < poly.length; i += 2) { const [sx, sy] = P(c, MX(poly[i] + dx * k), MY(poly[i + 1] + dy * k), 0); i ? g.lineTo(sx, sy) : g.moveTo(sx, sy); } g.closePath(); g.fill(); g.stroke(); g.restore(); } });
  } },
  // 118b "limitações militares"
  { t0: 539.85, L: "field", v: "grey", cam: mv([0, 1.5, -6, 44], [0, 1.5, -5.4, 42]), act: (A, lt, u, T) => {
    for (let i = 0; i < 4; i++) A.sp("cannon", -6 + i * 4, 0, 4); A.over((g) => { if (T > 540.75) { const k = clamp((T - 540.75) / 0.25); g.save(); g.strokeStyle = "#c42a22"; g.lineWidth = 36; g.lineCap = "round"; g.beginPath(); g.moveTo(VW * 0.25, VH * 0.25); g.lineTo(lerp(VW * 0.25, VW * 0.75, k), lerp(VH * 0.25, VH * 0.75, k)); g.stroke(); g.restore(); } });
  } },
  // 118c "e reparações financeiras."
  { t0: 541.5, L: "office", cam: mv([0, 1.4, -3.6, 40], [0, 1.35, -3.0, 38]), act: (A, lt, u, T) => {
    const n = 1 + Math.floor(clamp((T - 541.9) / 1.0) * 8); for (let i = 0; i < n; i++) A.sp("money", -1.05 + (i % 4) * 0.7, 0.92 + Math.floor(i / 4) * 0.3, 1.3, { sc: 0.5 });
    A.over((g) => caption(g, "REPARAÇÕES DE GUERRA", ev(T, 542.3), 99));
  } },
  // 119 "A paz, porém, não resolveu todas as tensões."
  { t0: 543.51, L: "mirrors", fade: 0.3, cam: mv([0, 1.25, -1.2, 34, 100], [0, 1.2, -0.9, 32, 110]), act: (A, lt, u, T) => {
    A.sp("treatyV", 0, 0.92, 1.55, { sc: 1 }); A.fx(1.5, (g, c) => { const k = clamp((T - 544.4) / 1.6); if (k <= 0) return; const [sx, sy, s] = P(c, -0.2, 1.45, 1.5); g.save(); g.strokeStyle = "#1e1a18"; g.lineWidth = 3; g.beginPath(); g.moveTo(sx, sy);
      let x = sx, y = sy; for (let i = 0; i < 10 * k; i++) { x += (0.05 + hash(i) * 0.04) * s; y += (hash(i + 3) - 0.3) * 0.06 * s; g.lineTo(x, y); } g.stroke(); g.restore(); });
  } },
  // 120 "O ressentimento, a instabilidade econômica e as disputas políticas continuaram alimentando conflitos."
  { t0: 547.00, L: "berlin", v: "grey,posters", fade: 0.3, cam: mv([-2, 1.6, -7, 44], [2, 1.6, -6, 44]), act: (A, lt) => {
    crowd(A, 26, -8, 8, 2, 7, 171, (i) => ({ expr: i % 2 ? "shout" : "stern", prop: i % 3 === 0 ? ["fist", 0] : undefined }), civ); A.sp("money", 1.6, 0, 2.6, { sc: 0.9 }); A.sp("money", 2.3, 0, 2.7, { sc: 0.9 });
    A.light((g) => tint(g, "#5a2a2a", 0.2, "multiply"));
  } },
  // 121 "Pouco mais de duas décadas depois, o mundo mergulharia novamente em uma guerra ainda maior."
  { t0: 553.49, L: "nomans", v: "night", fade: 0.4, cam: mv([0, 1.8, -8, 46], [0, 2.6, -12, 50, -60]), act: (A, lt, u, T) => {
    for (let i = 0; i < 8; i++) A.sp("biplane", -50 + i * 10 + lt * 6, 20 + (i % 3) * 3, 60 + i * 4, { sc: 1.6, alpha: 0.6 }); A.fx(50, (g, c) => { for (const x of [-20, 0, 18]) fire(g, c, lt, x, 0, 46, 2.4, x + 9); });
    A.light((g) => tint(g, "#7a1a14", clamp((T - 557) / 1.5) * 0.3, "multiply"));
    A.over((g) => { const yr = Math.round(lerp(1919, 1939, smooth(clamp((T - 554.2) / 2.2)))); bigText(g, String(yr), ev(T, 554.0), 99, VH * 0.2, 140); });
  } },
  // 122 "A Primeira Guerra Mundial começou com promessas de glória, patriotismo e vitórias rápidas."
  { t0: 560.01, L: "station", fade: 0.4, cam: mv([0, 1.6, -6, 44], [0, 1.6, -5, 42]), act: (A, lt) => {
    marchF(A, FR14, lt, 4, 4, 3, 1.5, 1.3, 1.5, 1150, () => ({ expr: "grin" })); crowd(A, 18, -9, 9, 6, 8.5, 181, (i) => ({ expr: "laugh", wave: Math.sin(lt * 6 + i) }));
    A.light((g) => tint(g, "#c8a070", 0.4, "color"));
  } },
  // 123a "Mas terminou com cidades destruídas,"
  { t0: 565.82, L: "ruins", fade: 0.25, cam: mv([0, 1.8, -8, 46], [0, 2.0, -9, 46]), act: (A, lt) => { A.fx(28, (g, c) => { for (const x of [-12, 4, 14]) smokeCol(g, c, lt, x, 2, 28, { h: 18, w: 3, seed: x + 4 }); }); }, wx: ["ash", 120, 0.5] },
  // 123b "milhões de vidas perdidas"
  { t0: 567.75, L: "poppies", cam: mv([0, 1.2, -4, 42], [0, 1.6, -6, 44]), act: () => {} },
  // 123c "e uma geração marcada para sempre."
  { t0: 569.45, L: "trenchIn", v: "grey", fade: 0.25, cam: (u) => C(-2 + u * 4, 1.45, -2.8, 38), act: (A, lt) => {
    for (let i = 0; i < 5; i++) A.a(i % 2 ? BRIN : FRN, 1160 + i, -3 + i * 1.5, 1.0, { expr: "sad", headTilt: 6, look: 0 });
  } },
  // 124 "Homens que partiram acreditando que seriam heróis"
  { t0: 572.59, L: "station", fade: 0.35, cam: mv([0, 1.55, -2.4, 38], [0, 1.55, -2.0, 36]), act: (A, lt) => {
    A.a(BRI14, 1170, 0, 1.0, { expr: "grin", look: 0, prop: ["flag", lt * 3] }); A.light((g) => { glow(g, VW * 0.5, VH * 0.3, VW * 0.5, "rgba(255,230,170,0.45)", 0.7); tint(g, "#d0a870", 0.25, "color"); });
  } },
  // 125 "descobriram que, no campo de batalha, a sobrevivência era a única vitória que realmente importava."
  { t0: 575.23, L: "nomans", v: "dusk", fade: 0.4, cam: mv([0, 0.95, -2.4, 38, 60], [0, 1.3, -4.6, 44, 40]), act: (A, lt, u, T) => {
    A.a(VET, 1170, 0, 1.0, { mode: "sit", expr: T > 577.5 ? "relief" : "dazed", headTilt: 6 }); for (let i = 0; i < 6; i++) A.sp("grave", -6 + i * 2.4, 0, 5 + hash(i) * 4);
    A.light((g) => { const [sx, sy] = P(A.cam, 2, 1.8, 120); sun(g, sx, sy, 36, "255,190,120"); rays(g, sx, sy, 1100, 0.22 * clamp((T - 577) / 1.5), "255,200,140", 18, lt); });
  } },
  // 126 "A guerra mostrou que o avanço da tecnologia não significa necessariamente o avanço da humanidade."
  { t0: 581.78, L: "library", fade: 0.4, cam: mv([0, 1.5, -3.2, 40, -200], [0, 1.45, -2.6, 38, -200]), act: (A, lt) => {
    A.sp("helmet", 0.55, 0.89, 1.0, { sc: 0.7 }); A.a(KIDO, 1180, -0.5, 1.4, { expr: "neutral", facing: 1, look: 1 });
    A.light((g) => { const [sx, sy, s] = P(A.cam, 3.4, 3, 3.6); rays(g, sx, sy, 900, 0.2, "255,236,190", 10, lt, 1.2, Math.PI * 0.75); });
  } },
  // 127 "E que, quando o orgulho, o poder e o ódio se tornam maiores que a vida humana,"
  { t0: 587.91, L: "nomans", v: "dusk", fade: 0.35, cam: mv([0, 1.4, -6, 46, -60], [0, 1.6, -7, 48, -80]), act: (A, lt, u, T) => {
    [KAISER, POINC, GEORGE, NICK, FRANZJ].forEach((o, i) => A.a(o, 1190 + i, -24 + i * 12, 40, { expr: T > 590.3 ? "shout" : "stern" }, { sc: 5.5, dark: 0.9, darkCol: "#1a0e10", shadow: 0, alpha: 0.85 }));
    marchF(A, BRI, lt, 3, 7, 3, 1.3, 1.2, 1.4, 1200, () => ({ expr: "sad" })); A.light((g) => { tint(g, "#7a2a1a", 0.22, "multiply"); const [sx, sy] = P(A.cam, 0, 4, 200); sun(g, sx, sy, 40, "255,150,90"); });
  } },
  // 128 "o preço pode ser pago por gerações inteiras."
  { t0: 593.10, L: "poppies", fade: 0.4, cam: mv([0, 1.1, -2, 40], [0, 9, -20, 54, -300], easeIn), act: (A, lt) => {
    A.a(MOM, 1210, -0.6, 1.4, { expr: "sad", facing: 1, headTilt: 6 }); A.a(KIDG, 1211, 0.2, 1.3, { expr: "sad", look: -1 });
  } },
  // 129 "Porque algumas guerras terminam quando os tiros cessam."
  { t0: 596.48, L: "poppies", v: "dusk", fade: 0.4, cam: mv([0.2, 0.9, -1.4, 38, 60], [0, 0.95, -1.8, 40, 60]), act: (A, lt) => {
    A.sp("grave", 0.3, 0, 2.4, { sc: 1.1 }); A.light((g) => { const [sx, sy] = P(A.cam, -2, 1.6, 200); sun(g, sx, sy, 46, "255,180,110"); rays(g, sx, sy, 1100, 0.22, "255,190,120", 18, lt); });
  } },
  // 130 "Mas suas consequências continuam ecoando muito depois."
  { t0: 599.68, t1: 603.25, L: "poppies", v: "dusk", cam: mv([0, 1.4, -4, 44], [0, 4, -12, 50, -120]), act: (A, lt, u, T) => {
    A.light((g) => { const [sx, sy] = P(A.cam, 0, 2, 200); sun(g, sx, sy, 50, "255,170,100"); rays(g, sx, sy, 1200, 0.2, "255,180,110", 18, lt); });
    A.over((g) => tint(g, "#000", clamp((T - 602.4) / 0.8), "source-over"));
  } },
];
function stamp(g: CanvasRenderingContext2D, txt: string, t: number, x: number, y: number, rot = -0.18, size = 120, col = "#c42a22") {
  if (t < 0) return; const k = t < 0.12 ? 2.2 - 1.2 * (t / 0.12) : 1, a = t < 0.12 ? t / 0.12 : 1;
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(k, k); g.globalAlpha = 0.9 * a; g.font = `bold ${size}px "DejaVu Serif", serif`; const w = g.measureText(txt).width;
  g.strokeStyle = col; g.lineWidth = size * 0.09; g.strokeRect(-w / 2 - size * 0.3, -size * 0.75, w + size * 0.6, size * 1.5); g.fillStyle = col; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(txt, 0, 4); g.restore();
}
