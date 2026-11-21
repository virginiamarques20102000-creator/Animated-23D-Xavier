// Shots 0 – 206.8 s: hook, prologue, chapter 1 (road to war), chapter 2 (trenches).
import { VW, VH, P, glow, boom, fire, smokeCol, puff, tint, clamp, lerp, smooth, easeOut, easeIn, hash, rays, sun, muzzle } from "./engine";
import { MX, MY } from "./paint";
import { Sc, C, mv, path, walkF, walkS, runS, marchF, marchCol, crowd, booms, mudFront, flare, tracers, spurts, muzzleAt, mgFire, flies, stretchLight, hl, arrow, frontLine, pin,
  chapter, calendar, counter, caption, bigText, GER14, GER, GERN, BRI, BRIN, BRI14, BOFF, FR14, FR, FRN, RUS, AUS, SERB, KAISER, FRANZJ, POINC, GEORGE, NICK, FF, SOPHIE, PRINCIP, POLICE, DIP,
  MOM, KIDO, KIDG, civ } from "./kit";
import type { Shot } from "./types";

const ev = (T: number, w: number) => T - w;
export const SHOTS_A: Shot[] = [
  // 0 "Imagine acordar em um lugar onde a lama chega aos joelhos,"
  { t0: 0, L: "trenchIn", v: "grey", cam: path([[0, [0.3, 1.5, -2.2, 38]], [0.55, [0.2, 1.3, -2.6, 40]], [1, [0, 0.65, -2.9, 42, 80]]]), act: (A, lt, u, T) => {
    const awake = T > 0.75; A.a(BRI, 1, 0, 0.9, { mode: awake ? "stand" : "sit", expr: awake ? (T > 2.2 ? "nervous" : "shock") : "neutral", blink: awake ? 0 : 1, look: 0, headTilt: awake ? 0 : 10 }, { y: awake ? -0.45 * smooth((T - 0.75) / 0.6) - 0.05 : 0.15 });
    A.a(BRIN, 2, -1.5, 1.4, { mode: "sit", expr: "sad", blink: 1, headTilt: 8 }); A.a(BRI, 3, 1.7, 1.5, { expr: "stern", facing: -1, look: -1 }, { y: -0.4 });
    mudFront(A, 0.55, -4, 4, 0.12); mudFront(A, 1.2, -4, 4, 0.05, "#53412e");
    A.light((g) => tint(g, "#7a8aa0", 0.2, "multiply"));
  }, wx: ["rain", 160, 0.35], fade: 0 },
  // 1 "o cheiro de cadáveres invade o ar"
  { t0: 4.05, L: "nomans", v: "grey", cam: mv([-2, 1.4, -6, 44], [1.5, 1.6, -6.5, 44]), act: (A, lt) => {
    for (let i = 0; i < 6; i++) A.sp("grave", -7 + i * 2.8 + hash(i) * 0.8, 0, 4 + hash(i + 2) * 6); for (let i = 0; i < 4; i++) A.sp("helmet", -5 + i * 3.6, 0, 2.6 + i * 0.6);
    A.fx(3, (g, c) => { for (let i = 0; i < 16; i++) { const k = (lt * 0.12 + hash(i)) % 1, [sx, sy, s] = P(c, -9 + 18 * k, 0.6 + hash(i + 4) * 1.4, 2 + hash(i + 8) * 5); puff(g, sx, sy, 1.6 * s, [150, 160, 120], 0.16); } });
    A.a(BRIN, 4, 2.2, 1.4, { expr: "pained", facing: -1, look: -1, armB: 1, headTilt: -4 });
  }, mood: ["#a8b090", 0.22] },
  // 2 "e, a qualquer momento, uma explosão pode destruir tudo ao seu redor."
  { t0: 6.53, L: "trenchIn", cam: path([[0, [0, 1.45, -3.4, 42]], [0.45, [0, 1.42, -3.0, 40]], [0.52, [0, 1.6, -4.2, 46]], [1, [0, 1.6, -4.6, 46]]]), act: (A, lt, u, T) => {
    const hit = 8.55, k = T > hit ? 1 : 0;
    const ex = T < hit - 0.4 ? "nervous" : T < hit ? "fear" : "shock";
    A.a(BRI, 1, -0.4, 1.0, { expr: ex, look: T < hit - 0.4 ? -1 : 0, crouch: k * 0.6, headTilt: k * -6 }, { y: -0.08 });
    A.a(BRI, 3, 1.3, 1.3, { expr: k ? "shock" : "stern", facing: -1, crouch: k * 0.7, armB: k }); A.a(BRIN, 2, -2.0, 1.5, { mode: "sit", expr: k ? "shock" : "sad" });
    A.fx(6, (g, c) => boom(g, c, T - hit, 1.5, 3.0, 6, 3.4, 7)); A.fx(9, (g, c) => boom(g, c, T - hit - 0.25, -5, 3.0, 9, 2.6, 3));
    A.fx(0.6, (g, c) => { if (T > hit) for (let i = 0; i < 26; i++) { const a = T - hit - hash(i) * 0.3; if (a < 0) continue; const [sx, sy, s] = P(c, -3 + hash(i + 1) * 6, 3.6 - a * a * 4.9 * 0.6 - a * 0.5, 1.2 + hash(i) * 2); g.fillStyle = i % 2 ? "#3a2c1e" : "#6a5236"; g.fillRect(sx, sy, 0.06 * s, 0.06 * s); } });
  } },
  // 3 "Você não sabe se sobreviverá ao próximo minuto."
  { t0: 11.40, L: "trenchIn", v: "night", fade: 0.25, cam: mv([0, 1.5, -1.6, 36], [0, 1.52, -1.1, 34]), act: (A, lt) => {
    A.a(BRI, 1, 0, 1.0, { expr: "nervous", look: Math.sin(lt * 1.5) * 0.6, headTilt: -3 });
    flare(A, lt, 0.2, 4, 30); A.light((g) => { const k = clamp(lt / 0.8); glow(g, VW * 0.75, VH * 0.05, VW * 0.6, "rgba(230,240,255,0.35)", k * 0.6); });
    A.over((g) => { const x = VW * 0.83, y = VH * 0.72, r = 95; g.save(); g.fillStyle = "#c9a24a"; g.strokeStyle = "#241726"; g.lineWidth = 6; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); g.stroke(); g.fillStyle = "#f6eedb"; g.beginPath(); g.arc(x, y, r * 0.82, 0, 7); g.fill(); g.stroke();
      const sec = (lt * 1) % 60, an = (Math.floor(lt) / 60) * Math.PI * 2 + (lt % 1 < 0.12 ? 0.02 : 0); g.lineWidth = 5; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.sin(an + 4) * r * 0.7, y - Math.cos(an + 4) * r * 0.7); g.stroke(); g.strokeStyle = "#b3221c"; g.lineWidth = 3;
      g.beginPath(); g.moveTo(x, y); const sa = Math.floor(sec * 1) / 60 * Math.PI * 2 * 4; g.lineTo(x + Math.sin(sa) * r * 0.78, y - Math.cos(sa) * r * 0.78); g.stroke(); g.restore(); });
  } },
  // 4a "Não sabe se verá sua família"
  { t0: 14.60, L: "trenchIn", v: "night", cam: mv([0.3, 1.25, -2.6, 40], [0.1, 1.2, -2.2, 38]), act: (A, lt) => {
    A.a(BRIN, 1, 0, 1.0, { mode: "sit", expr: "sad", prop: ["letter", 0], look: 0, headTilt: 9 }, { y: 0.2 });
    A.light((g) => { const [sx, sy, s] = P(A.cam, -0.5, 1.0, 0.9); glow(g, sx, sy, 1.4 * s, "rgba(255,200,120,0.8)", 0.7); });
  } },
  // 4b "...novamente." (memory: home, sepia)
  { t0: 15.5, L: "home", fade: 0.35, cam: mv([0, 1.35, -3.6, 42], [0, 1.35, -3.1, 40]), act: (A, lt) => {
    A.a(MOM, 10, -0.6, 2.4, { expr: "smile_closed", wave: Math.sin(lt * 5) }); A.a(KIDO, 11, 0.4, 2.1, { expr: "grin", wave: Math.sin(lt * 6 + 1) }); A.a(KIDG, 12, 1.1, 2.3, { expr: "smile", look: -1 });
    A.light((g) => { tint(g, "#c8a070", 0.42, "color"); glow(g, VW * 0.5, VH * 0.4, VW * 0.6, "rgba(255,220,170,0.4)", 0.6); tint(g, "#1a1008", clamp((lt - 0.9) / 0.5) * 0.5, "multiply"); });
  } },
  // 5 "E, enquanto os tiros ecoam pelo campo de batalha,"
  { t0: 17.46, L: "nomans", v: "night", fade: 0.3, cam: mv([-3, 1.6, -5, 44], [2, 1.8, -6, 44]), act: (A, lt, u, T) => {
    for (let i = 0; i < 7; i++) { const x = -18 + i * 6, at = [0.2, 0.5, 0.9, 1.3, 1.6, 2.1, 2.5].map((t) => t + hash(i) * 0.3 + 18.6 - 17.46); muzzleAt(A, lt, at, x, 0.8, 34, 0.5, -1); }
    tracers(A, lt, 8, [12, 1.0, 34], [-10, 1.2, 6], 0.5, 3); tracers(A, lt, 6, [-12, 1.0, 34], [8, 1.4, 6], 0.6, 7, "255,200,120");
    flare(A, lt, 0.4, -6, 26); flare(A, lt, 1.6, 8, 30);
    A.sp("sandbags", 0, 0, 1.8, { sc: 1.6 }); A.a(BRI, 1, -0.6, 2.2, { expr: "fear", look: 1, crouch: 0.4 }, { y: -0.5 }); A.a(BRI, 2, 0.9, 2.3, { expr: "stern", look: 1 }, { y: -0.55 });
  } },
  // 6 "tudo o que pode fazer é esperar."
  { t0: 20.93, L: "trenchIn", v: "grey", cam: (u) => C(-2.2 + u * 3.6, 1.25, -3.4, 42), act: (A, lt) => {
    const ex = ["sad", "nervous", "neutral", "sad", "stern", "nervous"] as const;
    for (let i = 0; i < 6; i++) A.a(i % 2 ? BRIN : BRI, 20 + i, -3.5 + i * 1.4, 1.0 + (i % 2) * 0.25, { mode: i % 3 === 1 ? "stand" : "sit", expr: ex[i], headTilt: 6 - i * 2, look: i % 2 ? 1 : -1, wave: i === 2 ? Math.sin(lt * 9) * 0.3 : undefined }, { y: i % 3 === 1 ? -0.05 : 0.15 });
  }, wx: ["rain", 200, 0.35] },
  // 7 "Essa foi a realidade de milhões de soldados durante a Primeira Guerra Mundial."
  { t0: 23.86, L: "trenchIn", cam: mv([0, 1.5, -4, 44], [0, 6.5, -14, 52, -200], easeIn), act: (A, lt, u, T) => {
    for (let r = 0; r < 4; r++) for (let i = 0; i < 14; i++) A.a(i % 3 ? BRI : BRIN, 60 + r * 20 + i, -9 + i * 1.35 + (r % 2) * 0.6, 0.8 + r * 0.04, { expr: i % 2 ? "stern" : "sad", look: 0 }, { y: -0.1 - r * 0.02 });
    A.over((g) => bigText(g, "PRIMEIRA GUERRA MUNDIAL", ev(T, 26.85), 99, VH * 0.2, 100, "#f7eedc", "1914 – 1918"));
  } },
  // 8a "Entre 1914 e 1918,"
  { t0: 28.83, L: "map", fade: 0.35, cam: mv([MX(12), MY(50), -25, 42], [MX(13), MY(49.5), -22, 42]), act: (A, lt, u, T) => {
    for (const [k, at] of [["GER", 30.1], ["AH", 30.4], ["FR", 30.9], ["RUS", 31.2], ["UK", 31.5], ["SER", 31.0], ["BEL", 31.3], ["OTT", 31.8], ["ITA", 32.1]] as [string, number][]) hl(A, k, (T - at) / 0.4, "#9a1e18", 0.45);
    A.over((g) => { const yr = Math.round(lerp(1914, 1918, smooth(clamp((T - 30.5) / 1.4)))); bigText(g, String(yr), 0.6, 99, VH * 0.17, 140, "#f7eedc"); });
  } },
  // 8b "o mundo mergulhou em um dos conflitos mais devastadores da história."
  { t0: 32.4, L: "nomans", v: "dusk", fade: 0.3, cam: mv([0, 2.6, -10, 48, -60], [0, 2.2, -8, 46, -40]), act: (A, lt, u, T) => {
    booms(A, T, [[32.6, -14, 40, 4], [33.2, 6, 46, 4.5], [33.9, 18, 52, 5], [34.5, -4, 30, 4], [35.0, 12, 36, 4]]);
    for (let i = 0; i < 3; i++) A.sp("mk1", -14 + i * 11 + lt * 1.2, 0, 16 + i * 3); for (let i = 0; i < 4; i++) A.sp("biplane", -40 + i * 12 + lt * 9, 18 + (i % 2) * 3, 60 + i * 5, { sc: 1.6 });
    marchCol(A, GER, lt, 10, 8, 7, -1.5, 1.4); A.fx(70, (g, c) => { smokeCol(g, c, lt, -20, 0, 70, { h: 30, w: 5, seed: 3 }); smokeCol(g, c, lt, 24, 0, 74, { h: 34, w: 6, seed: 8 }); });
    A.light((g) => { const [sx, sy] = P(A.cam, 30, 8, 180); sun(g, sx, sy, 34, "255,190,120"); rays(g, sx, sy, 900, 0.12, "255,190,130", 12, lt); });
  }, wx: ["ash", 140, 0.5] },
  // 9a "Impérios desmoronaram,"
  { t0: 36.52, L: "mirrors", cam: mv([0, 1.6, -2.6, 40], [0, 1.2, -2.0, 38]), act: (A, lt, u, T) => {
    const k = clamp((T - 37.1) / 0.5), bounce = k < 1 ? 0 : Math.abs(Math.sin((T - 37.6) * 9)) * Math.exp(-(T - 37.6) * 4) * 0.15;
    A.sp("crown", lerp(0, 0.6, k), lerp(1.0, 0.0, easeIn(k)) + bounce, 1.3, { sc: 0.8, rot: k * 2.4 + (T - 37.6 > 0 ? (T - 37.6) * 1.5 : 0) });
    A.light((g) => glow(g, VW * 0.5, VH * 0.2, VW * 0.4, "rgba(255,220,150,0.45)", 0.6));
  } },
  // 9b "cidades foram destruídas"
  { t0: 38.2, L: "sarajevo", cam: mv([0, 2.2, -9, 46], [0, 2.4, -11, 48]), act: (A, lt, u, T) => {
    booms(A, T, [[38.35, -8, 22, 5], [38.9, 6, 22, 5.5], [39.3, 0, 24, 6]]); A.fx(21, (g, c) => { for (const x of [-12, -2, 9]) smokeCol(g, c, lt, x, 4, 21, { h: 18, w: 4, seed: x + 30, col: [34, 30, 32] }); });
    A.light((g) => tint(g, "#ff8a40", clamp((T - 38.4) / 0.6) * 0.18, "overlay"));
    crowd(A, 8, -6, 6, 4, 7, 22, () => ({ expr: "shock", armB: 1 }));
  }, wx: ["ash", 120, 0.5] },
  // 10 "e uma geração inteira foi marcada por um nível de violência que poucos poderiam imaginar."
  { t0: 39.97, L: "station", fade: 0.3, cam: (u) => C(-6 + u * 12, 1.5, -3.6, 40), act: (A, lt, u, T) => {
    const flash = clamp(1 - Math.abs(T - 42.55) / 0.25);
    for (let i = 0; i < 12; i++) A.a(i % 3 === 0 ? FR14 : i % 3 === 1 ? GER14 : BRI14, 140 + i, -8 + i * 1.5, 1.4 + (i % 2) * 0.35, { expr: T > 42.5 ? (i % 2 ? "fear" : "sad") : "neutral", look: 0, headTilt: T > 42.5 ? 5 : 0 });
    A.light((g) => { if (flash > 0) tint(g, "#fff2d0", flash * 0.8, "screen"); tint(g, "#3a2a30", clamp((T - 42.6) / 1) * 0.35, "multiply"); });
  } },
  // 11 "Mas como uma guerra que muitos acreditavam durar apenas alguns meses"
  { t0: 45.46, L: "station", cam: mv([0, 1.6, -7, 44], [0, 1.7, -6, 44]), act: (A, lt, u, T) => {
    crowd(A, 26, -9, 9, 3.5, 8, 41, (i) => ({ expr: i % 2 ? "grin" : "laugh", wave: Math.sin(lt * 6 + i) }), (i) => (i % 3 === 0 ? GER14 : civ(i)));
    A.over((g) => { const mo = ["AGO", "SET", "OUT", "NOV", "DEZ"], i = Math.min(4, Math.floor(clamp((T - 47.8) / 1.4) * 5)); calendar(g, "1914", mo[i], lt, VW - 300, 110, (T - 47.8) % 0.28 < 0.2 && T > 47.8 ? ((T - 47.8) % 0.28) : -1); });
  } },
  // 12 "se transformou em quatro anos de puro horror?"
  { t0: 49.61, L: "nomans", v: "night", fade: 0.2, cam: mv([0, 1.4, -5, 44], [0, 1.9, -7.5, 46]), act: (A, lt, u, T) => {
    A.fx(30, (g, c) => { for (const x of [-14, -3, 10]) fire(g, c, lt, x, 0, 28, 1.6, x + 60); smokeCol(g, c, lt, -8, 1, 30, { h: 20, w: 4, seed: 2 }); });
    booms(A, T, [[51.95, 0, 14, 4.5]]); A.a(GER, 1, -1, 3, { expr: "fear" }, { dark: 0.7 }); A.a(FR, 2, 1.2, 3.4, { expr: "fear" }, { dark: 0.7 });
    A.over((g) => { const yrs = ["1915", "1916", "1917", "1918"], i = Math.min(3, Math.floor(clamp((T - 50.4) / 1.4) * 4)); calendar(g, "ANO", yrs[i], lt, VW - 300, 110); });
  } },
  // 13 "No início do século XX, a Europa era uma região dominada por grandes impérios,"
  { t0: 53.32, L: "map", fade: 0.4, cam: mv([MX(14), MY(50), -27, 42], [MX(15), MY(50), -24, 42]), act: (A, lt, u, T) => {
    const K: [string, string][] = [["GER", "#5a6a8a"], ["AH", "#c9a24a"], ["RUS", "#3a7a5a"], ["UK", "#b3221c"], ["FR", "#2a5a9a"], ["OTT", "#8a4a2a"]];
    K.forEach(([k, col], i) => hl(A, k, (T - 58.2 - i * 0.12) / 0.35, col, 0.5));
    A.over((g) => caption(g, "EUROPA · INÍCIO DO SÉCULO XX", lt - 0.3, 5.5));
  } },
  // 14 "rivalidades políticas e uma corrida armamentista cada vez mais intensa."
  { t0: 59.58, L: "factory", v: "inside", cam: mv([-4, 1.7, -5, 44], [3, 2.0, -6.5, 46]), act: (A, lt, u, T) => {
    const n = Math.floor(clamp((T - 60.6) / 1.6) * 6) + 2; for (let r = 0; r < 2; r++) for (let i = 0; i < n; i++) A.sp("cannon", -12 + i * 4.2 + r * 2, 0, 5 + r * 5, { sc: 1.1 });
    for (let i = 0; i < 14; i++) A.sp("shell", -7 + i * 1.0, 0, 2.6); for (let i = 0; i < 4; i++) A.a(civ(i + 1), 160 + i, -6 + i * 4, 3.6, { expr: "stern", prop: ["hammer", (lt * 3 + i) % 1] });
    A.fx(4, (g, c) => { for (let i = 0; i < 3; i++) { const [sx, sy, s] = P(c, -4 + i * 5, 1.4, 4); if (hash(Math.floor(lt * 14) + i) > 0.35) glow(g, sx, sy, 0.9 * s, "rgba(255,210,120,1)", 0.9); } });
  } },
  // 15 "Alemanha, França, Reino Unido, Rússia e Áustria-Hungria disputavam poder, territórios e influência."
  { t0: 63.05, L: "mirrors", cam: mv([0, 1.6, -6.2, 46], [0, 1.6, -5.4, 44]), act: (A, lt, u, T) => {
    const L: [typeof KAISER, number, number][] = [[KAISER, -2.6, 63.1], [POINC, -1.3, 63.65], [GEORGE, 0, 64.15], [NICK, 1.3, 64.95], [FRANZJ, 2.6, 65.65]];
    const glare = T > 66.6;
    L.forEach(([o, x, at], i) => { const k = clamp((T - at + 0.05) / 0.25); if (k <= 0) return; A.a(o, 170 + i, x, 2.2, { expr: glare ? (i % 2 ? "stern" : "shout") : "stern", facing: glare ? (i < 2 ? 1 : -1) : 0, look: glare ? (i < 2 ? 1 : -1) : 0, prop: glare && i === 0 ? ["fist", 0] : undefined }, { y: (1 - easeOut(k)) * 0.5, alpha: k }); });
    A.light((g) => glow(g, VW * 0.5, VH * 0.15, VW * 0.5, "rgba(255,220,150,0.4)", 0.6));
  } },
  // 16 "Alianças militares foram criadas."
  { t0: 70.46, L: "map", cam: mv([MX(14), MY(50), -25, 42], [MX(14), MY(50.5), -23, 42]), act: (A, lt, u, T) => {
    for (const k of ["FR", "UK", "RUS"]) hl(A, k, (T - 70.6) / 0.3, "#2a5a9a", 0.5); for (const k of ["GER", "AH"]) hl(A, k, (T - 71.0) / 0.3, "#9a1e18", 0.5);
    arrow(A, [2, 47], [30, 55], (T - 71.2) / 0.6, "#1e3a6a", 0.22); arrow(A, [-1.5, 52.5], [2.2, 48], (T - 71.4) / 0.4, "#1e3a6a", 0.22); arrow(A, [10, 51.5], [16, 47.8], (T - 71.6) / 0.4, "#7a1a14", 0.22);
  } },
  // 17 "Exércitos cresceram."
  { t0: 72.65, L: "field", fade: 0.2, cam: mv([0, 1.8, -6, 46, -30], [0, 2.4, -8.5, 50, -60]), act: (A, lt, u, T) => {
    const rows = 2 + Math.floor(clamp((T - 73.2) / 0.7) * 6); marchF(A, GER14, lt, rows, 7, 4, 1.4, 1.2, 1.5, 300);
  } },
  // 18 "Navios de guerra se multiplicaram."
  { t0: 74.27, L: "ocean", cam: mv([0, 4, -20, 46], [6, 5, -24, 48]), act: (A, lt, u, T) => {
    const n = 1 + Math.floor(clamp((T - 74.9) / 1.0) * 6); for (let i = 0; i < n; i++) A.sp("ship", -40 + (i % 4) * 26 + lt * 2, -0.3, 60 + Math.floor(i / 4) * 40 + (i % 2) * 10, { alpha: clamp((T - 74.9 - i * 0.16) / 0.15 + (i === 0 ? 1 : 0)) });
    A.fx(30, (g, c) => waves(g, c, lt));
  } },
  // 19 "E qualquer crise poderia desencadear uma guerra de proporções continentais."
  { t0: 76.60, L: "map", fade: 0.3, cam: mv([MX(19), MY(44), -16, 42], [MX(14), MY(50), -26, 42]), act: (A, lt, u, T) => {
    const k = clamp((T - 77.5) / 3.0); A.fx(-0.09, (g, c) => { const pts = [[20.5, 43.8], [18.4, 44.2], [16, 46], [14, 48.5], [10, 50.5], [5, 49], [2, 48]], n = pts.length - 1, m = k * n;
      g.save(); g.strokeStyle = "#2a1d16"; g.lineWidth = 4; g.setLineDash([10, 8]); g.beginPath(); pts.forEach(([lo, la], i) => { const [sx, sy] = P(c, MX(lo), MY(la), 0); i ? g.lineTo(sx, sy) : g.moveTo(sx, sy); }); g.stroke(); g.restore();
      const i0 = Math.min(n - 1, Math.floor(m)), f = m - i0, lo = lerp(pts[i0][0], pts[i0 + 1][0], f), la = lerp(pts[i0][1], pts[i0 + 1][1], f), [sx, sy, s] = P(c, MX(lo), MY(la), 0);
      if (k < 1) { glow(g, sx, sy, 1.2 * s, "rgba(255,200,80,1)", 0.9); for (let j = 0; j < 6; j++) { const a = j + lt * 20; g.fillStyle = "#fff2a0"; g.fillRect(sx + Math.cos(a) * 0.4 * s * hash(j + Math.floor(lt * 20)), sy + Math.sin(a) * 0.4 * s, 4, 4); } } });
    for (const key of ["GER", "AH", "FR", "RUS", "UK", "SER", "BEL", "ITA"]) hl(A, key, (T - 80.4) / 0.4, "#b3221c", 0.5);
  } },
  // 20 "O estopim aconteceu em 28 de junho de 1914."
  { t0: 82.11, L: "sarajevo", fade: 0.4, cam: mv([0, 3.2, -14, 48, -60], [0, 1.6, -9, 44, 0], easeOut), act: (A, lt) => {
    crowd(A, 22, -9, 9, 1.2, 2.4, 51, (i) => ({ expr: i % 3 ? "smile" : "grin", wave: i % 4 === 0 ? Math.sin(lt * 4 + i) : undefined, facing: i % 2 ? 1 : -1 }));
    crowd(A, 18, -10, 10, 7.6, 8.8, 57, () => ({ expr: "smile" }));
    A.light((g) => { const [sx, sy] = P(A.cam, -20, 30, 200); sun(g, sx, sy, 26); rays(g, sx, sy, 800, 0.1, "255,236,190", 12, lt); });
    A.over((g) => caption(g, "SARAJEVO · 28 DE JUNHO DE 1914", lt - 0.3, 4));
  } },
  // 21a "Na cidade de Sarajevo, o arquiduque"
  { t0: 86.75, L: "sarajevo", cam: (u, lt) => C(-6 + lt * 1.1, 1.5, -6.5, 42), act: (A, lt) => {
    const x = -7 + lt * 1.1; A.sp("car1914", x, 0, 3.05, { sc: 0.85 }); A.a(FF, 1, x - 0.2, 3.0, { mode: "sit", expr: "smile", wave: Math.sin(lt * 3) * 0.6, facing: -1 }, { y: 0.42, shadow: 0 }); A.a(SOPHIE, 2, x - 0.95, 3.02, { mode: "sit", expr: "smile_closed" }, { y: 0.42, shadow: 0 });
    crowd(A, 16, -12, 12, 1.0, 1.6, 61, (i) => ({ expr: "grin", wave: Math.sin(lt * 5 + i), facing: 0 })); crowd(A, 14, -12, 12, 6.5, 7.5, 63, () => ({ expr: "smile" }));
  } },
  // 21b "Francisco Ferdinando, herdeiro do Império Austro-Húngaro,"
  { t0: 88.95, L: "sarajevo", cam: mv([0.2, 1.3, -1.9, 38], [0, 1.3, -1.6, 36]), act: (A, lt) => {
    A.sp("car1914", 0.2, 0, 1.75, { sc: 0.85 }); A.a(FF, 1, 0.1, 1.68, { mode: "sit", expr: lt > 1.3 ? "stern" : "smile", wave: lt < 1.3 ? Math.sin(lt * 3) * 0.5 : undefined, look: 0 }, { y: 0.42, shadow: 0 });
    A.a(SOPHIE, 2, -0.75, 1.7, { mode: "sit", expr: "smile_closed", facing: 1 }, { y: 0.42, shadow: 0 });
    A.over((g) => caption(g, "ARQUIDUQUE FRANCISCO FERDINANDO", lt - 0.3, 3.2));
  } },
  // 22a "foi assassinado" — Princip steps out, fires (no blood)
  { t0: 92.45, L: "sarajevo", cam: path([[0, [3.4, 1.45, -1.8, 40]], [0.45, [3.2, 1.5, -2.2, 40]], [1, [1.6, 1.6, -5, 44]]]), act: (A, lt, u, T) => {
    const shot = [92.72, 92.95], raise = clamp((T - 92.5) / 0.2);
    A.a(PRINCIP, 3, 3.2, 1.0, { expr: "stern", facing: -1, look: -1, prop: ["pistol", raise - 1 + (T > shot[0] && T < shot[0] + 0.08 ? 0.6 : 0)] });
    for (const s of shot) if (T > s && T < s + 0.07) A.fx(0.99, (g, c) => muzzle(g, c, 2.6, 1.5, 1.0, 0.35, -1));
    A.sp("car1914", -1.4, 0, 3.25, { sc: 0.85 }); A.a(FF, 1, -1.2, 3.2, { mode: "sit", expr: T > 92.75 ? "shock" : "smile", headTilt: T > 93.1 ? 18 : 0 }, { y: 0.42, shadow: 0, rot: T > 93.1 ? -0.25 * smooth((T - 93.1) / 0.4) : 0 });
    A.a(SOPHIE, 2, -1.95, 3.22, { mode: "sit", expr: T > 92.8 ? "shock" : "smile_closed", armB: T > 92.8 ? 1 : 0 }, { y: 0.42, shadow: 0 });
    crowd(A, 10, -8, 8, 6, 7, 71, () => ({ expr: T > 92.8 ? "shock" : "smile", armB: T > 92.8 ? 1 : 0 }));
  } },
  // 22b "por Gavrilo Princip, um nacionalista sérvio-bósnio."
  { t0: 93.45, L: "sarajevo", cam: mv([0, 1.55, -3.4, 40], [0, 1.6, -2.8, 38]), act: (A, lt) => {
    A.a(PRINCIP, 3, 0, 1.1, { expr: "stern", look: 0 }); A.a(POLICE, 4, -0.9 + Math.min(0.3, lt * 0.6), 1.25, { expr: "shout", facing: 1, armB: 1 }); A.a(POLICE, 5, 1.0 - Math.min(0.3, lt * 0.6), 1.3, { expr: "stern", facing: -1, armB: -1 });
    crowd(A, 10, -6, 6, 4, 5.5, 81, (i) => ({ expr: "shock", facing: i % 2 ? 1 : -1 }));
    A.over((g) => caption(g, "GAVRILO PRINCIP", lt - 0.4, 3.2));
  } },
  // 23 "O atentado desencadeou uma crise diplomática."
  { t0: 97.24, L: "office", fade: 0.3, cam: mv([0, 1.5, -4.4, 42], [0, 1.4, -3.4, 40]), act: (A, lt) => {
    A.a(DIP[0], 180, -1.4, 2.4, { expr: Math.floor(lt * 4) % 2 ? "shout" : "stern", facing: 1, prop: ["fist", 0] }); A.a(DIP[1], 181, 1.4, 2.4, { expr: "shout", facing: -1, armB: 1 });
    A.a(DIP[2], 182, 0, 2.9, { expr: "nervous", prop: ["paper", 0] });
    A.fx(1.0, (g, c) => { for (let i = 0; i < 10; i++) { const k = (lt * 0.5 + hash(i)) % 1, [sx, sy, s] = P(c, -2 + hash(i + 3) * 4, 2.6 - 2.4 * k, 1.6 + hash(i) * 1); g.save(); g.translate(sx, sy); g.rotate(lt * 4 + i); g.fillStyle = "#f2ecda"; g.strokeStyle = "#3a3024"; g.lineWidth = 1.5; g.fillRect(-0.14 * s, -0.1 * s, 0.28 * s, 0.2 * s); g.strokeRect(-0.14 * s, -0.1 * s, 0.28 * s, 0.2 * s); g.restore(); } });
  } },
  // 24 "A Áustria-Hungria declarou guerra à Sérvia."
  { t0: 100.38, L: "map", cam: mv([MX(18), MY(46), -16, 42], [MX(19), MY(45), -14, 42]), act: (A, lt, u, T) => {
    hl(A, "AH", (T - 100.6) / 0.3, "#c9a24a", 0.55); hl(A, "SER", (T - 101.9) / 0.3, "#9a1e18", 0.55); arrow(A, [17, 46.8], [20.6, 44.3], (T - 101.5) / 0.5, "#7a1a14", 0.3);
    A.over((g) => stamp(g, "GUERRA!", ev(T, 102.15), VW * 0.72, VH * 0.7, -0.12, 100));
  } },
  // 25 "A Rússia mobilizou suas tropas."
  { t0: 103.11, L: "russia", fade: 0.3, cam: mv([0, 1.6, -6, 44], [0, 1.8, -7.2, 46]), act: (A, lt) => { marchF(A, RUS, lt, 6, 6, 3.4, 1.5, 1.25, 1.5, 320); }, wx: ["snow", 220, 0.7] },
  // 26 "A Alemanha apoiou os austríacos e declarou guerra à Rússia e à França."
  { t0: 105.42, L: "map", cam: mv([MX(14), MY(50), -26, 42], [MX(14), MY(50), -24, 42]), act: (A, lt, u, T) => {
    hl(A, "GER", (T - 105.6) / 0.3, "#5a6a8a", 0.55); hl(A, "AH", (T - 106.2) / 0.3, "#c9a24a", 0.55); arrow(A, [11, 50], [15, 48], (T - 106.2) / 0.4, "#5a6a8a", 0.22);
    arrow(A, [16, 52.5], [28, 54], (T - 107.9) / 0.5, "#7a1a14", 0.3); arrow(A, [8.6, 50.4], [3.5, 48.6], (T - 108.9) / 0.5, "#7a1a14", 0.3);
    hl(A, "RUS", (T - 108.5) / 0.3, "#9a1e18", 0.4); hl(A, "FR", (T - 109.1) / 0.3, "#9a1e18", 0.4);
  } },
  // 27 "Em seguida, tropas alemãs invadiram a Bélgica para alcançar a França,"
  { t0: 110.02, L: "field", v: "border", fade: 0.3, cam: mv([-6, 1.3, -9, 44], [1, 1.5, -10, 46]), act: (A, lt, u, T) => {
    marchCol(A, GER14, lt, 12, -9, 4.4, 1.6, 1.3, 2, 1.3); for (let i = 0; i < 6; i++) A.sp("cannon", -26 + i * 6 + lt * 1.6, 0, 14, { sc: 1.2 });
    A.over((g) => caption(g, "BÉLGICA · AGOSTO DE 1914", lt - 0.3, 3.8));
  } },
  // 28 "provocando a entrada do Reino Unido no conflito."
  { t0: 114.36, L: "station", cam: mv([3, 1.6, -7, 44], [-1, 1.6, -7.5, 44]), act: (A, lt) => {
    marchCol(A, BRI14, lt, 12, 8, 3.2, -1.5, 1.25, 2, 1.1); crowd(A, 14, -10, 10, 7, 8.5, 91, (i) => ({ expr: "grin", wave: Math.sin(lt * 6 + i) }));
    A.over((g) => { const x = VW * 0.14, y = VH * 0.18, w = 210, h = 130; g.save(); g.translate(x, y); g.rotate(Math.sin(lt * 2) * 0.03); g.fillStyle = "#1e3a6a"; g.fillRect(0, 0, w, h); g.strokeStyle = "#f4f1ea"; g.lineWidth = 26; g.beginPath(); g.moveTo(0, 0); g.lineTo(w, h); g.moveTo(w, 0); g.lineTo(0, h); g.moveTo(w / 2, 0); g.lineTo(w / 2, h); g.moveTo(0, h / 2); g.lineTo(w, h / 2); g.stroke();
      g.strokeStyle = "#c0302a"; g.lineWidth = 14; g.beginPath(); g.moveTo(w / 2, 0); g.lineTo(w / 2, h); g.moveTo(0, h / 2); g.lineTo(w, h / 2); g.stroke(); g.strokeStyle = "#241726"; g.lineWidth = 5; g.strokeRect(0, 0, w, h); g.restore(); });
  } },
  // 29 "Em poucas semanas, grande parte da Europa estava em guerra."
  { t0: 117.29, L: "map", fade: 0.3, cam: mv([MX(14), MY(50), -27, 42], [MX(14), MY(50), -24, 42]), act: (A, lt, u, T) => {
    ["SER", "AH", "RUS", "GER", "FR", "BEL", "UK"].forEach((k, i) => hl(A, k, (T - 117.6 - i * 0.35) / 0.3, "#9a1e18", 0.5));
    [[20.6, 44], [17, 47.5], [30, 53], [10, 51], [3, 48], [4.4, 50.6], [-1.5, 52.5], [6.5, 49.5], [24, 50]].forEach(([lo, la], i) => pin(A, lo, la, T - 118 - i * 0.3, "fire"));
  } },
  // 30 "Milhões de jovens marcharam para os campos de batalha"
  { t0: 121.31, L: "station", fade: 0.3, cam: mv([0, 1.5, -3.5, 42], [0, 1.7, -5.5, 46]), act: (A, lt) => {
    marchF(A, FR14, lt, 6, 4, 3.2, 1.6, 1.3, 1.5, 340, (r, c) => ({ expr: (r + c) % 2 ? "grin" : "smile" }));
    crowd(A, 10, -9, -4, 1.6, 6, 101, (i) => ({ expr: "grin", wave: Math.sin(lt * 6 + i), facing: 1 })); crowd(A, 10, 4, 9, 1.6, 6, 111, (i) => ({ expr: "grin", wave: Math.sin(lt * 6 + i), facing: -1 }));
    A.fx(1.2, (g, c) => { for (let i = 0; i < 40; i++) { const k = (lt * 0.3 + hash(i)) % 1, [sx, sy, s] = P(c, -6 + hash(i + 2) * 12 + Math.sin(lt * 2 + i) * 0.4, 4 - k * 4, 1.4 + hash(i + 5) * 5); g.fillStyle = ["#e8463a", "#f4f1ea", "#e8c24a", "#3a6ab0"][i % 4]; g.fillRect(sx, sy, 0.06 * s, 0.04 * s); } });
  } },
  // 31a "acreditando que voltariam para casa"
  { t0: 124.33, L: "station", cam: mv([1.0, 1.5, -3.6, 42], [0.4, 1.5, -4.0, 42]), act: (A, lt) => {
    A.sp("wagon", 0.5, 0, 3.2, { sc: 1.0 }); for (let i = 0; i < 4; i++) A.a(i % 2 ? GER14 : FR14, 360 + i, -2.0 + i * 1.3, 1.6 + (i % 2) * 0.2, { expr: "laugh", wave: Math.sin(lt * 7 + i) });
  } },
  // 31b "antes do Natal."
  { t0: 126.15, L: "home", v: "night", fade: 0.3, cam: mv([0, 1.4, -3.5, 42], [0, 1.45, -3.0, 40]), act: (A, lt) => {
    A.sp("xmas", 1.6, 0, 2.9, { sc: 1.1 }); A.sp("chairE", -0.4, 0, 2.6, { sc: 1.6 }); A.a(MOM, 10, -1.5, 2.6, { expr: "smile_closed", facing: 1, look: 1 });
    A.light((g) => { const [sx, sy, s] = P(A.cam, 1.6, 1.2, 2.9); glow(g, sx, sy, 2 * s, "rgba(255,210,130,0.7)", 0.7); for (let i = 0; i < 6; i++) { const [lx, ly] = P(A.cam, 1.3 + hash(i) * 0.6, 0.4 + i * 0.25, 2.88); glow(g, lx, ly, 18, ["rgba(255,80,60,1)", "rgba(255,220,90,1)", "rgba(120,160,255,1)"][i % 3], 0.5 + 0.5 * Math.sin(lt * 6 + i)); } });
  }, wx: ["snow", 60, 0.4] },
  // 32 "Eles estavam completamente enganados."
  { t0: 127.64, L: "trenchIn", v: "grey", cam: mv([0, 1.45, -2.4, 38], [0, 1.4, -2.9, 40]), act: (A, lt, u, T) => {
    A.a(FR14, 1, 0, 0.95, { expr: T > 128.4 ? "shock" : "neutral", look: 0, crouch: T > 128.5 ? 0.4 : 0 }); A.a(GER14, 2, -1.6, 1.3, { expr: "sad", mode: "sit" }, { dark: 0.15 });
    mudFront(A, 0.5, -4, 4, 0.1); A.fx(8, (g, c) => boom(g, c, T - 128.4, 2, 2.6, 8, 3, 4));
    A.light((g) => tint(g, "#6a7080", 0.3, "multiply"));
  }, wx: ["rain", 240, 0.45] },
  // 33 CAPÍTULO 2 — O INFERNO DAS TRINCHEIRAS
  { t0: 131.03, L: "nomans", v: "dusk", fade: 0.5, cam: mv([0, 2.2, -10, 46, -40], [0, 2.6, -12, 48, -60]), act: (A, lt, u, T) => {
    booms(A, T, [[131.6, -16, 50, 4], [132.6, 10, 56, 4.5], [133.5, -4, 44, 4]]); A.fx(60, (g, c) => { smokeCol(g, c, lt, -10, 0, 60, { h: 26, w: 5, seed: 4 }); smokeCol(g, c, lt, 16, 0, 64, { h: 30, w: 5, seed: 9 }); });
    A.light((g) => { const [sx, sy] = P(A.cam, 0, 5, 200); sun(g, sx, sy, 40, "255,170,100"); rays(g, sx, sy, 1000, 0.14, "255,170,110", 16, lt); });
    A.over((g) => chapter(g, "CAPÍTULO 2", "O INFERNO DAS TRINCHEIRAS", lt - 0.1, 4.1));
  }, wx: ["ash", 100, 0.5] },
  // 34 "No início, os exércitos avançavam rapidamente."
  { t0: 135.22, L: "field", fade: 0.35, cam: (u, lt) => C(-3 + lt * 2.6, 1.3, -7.5, 44), act: (A, lt) => {
    for (let r = 0; r < 2; r++) for (let i = 0; i < 14; i++) runS(A, FR14, 380 + i + r * 20, lt, 2 - i * 1.5 + (r % 2) * 0.8, 3.2 + r * 1.3, 2.7, { expr: "shout" });
    A.light((g) => { const [sx, sy] = P(A.cam, 40, 30, 220); sun(g, sx, sy, 26); });
  } },
  // 35 "Mas, no fronte ocidental, a situação mudou."
  { t0: 138.51, L: "map", fade: 0.3, cam: mv([MX(5), MY(49.5), -16, 42], [MX(4.5), MY(49.5), -13, 42]), act: (A, lt, u, T) => {
    hl(A, "FR", 1, "#2a5a9a", 0.25); hl(A, "GER", 1, "#5a6a8a", 0.25); frontLine(A, clamp((T - 139.2) / 1.6));
    A.over((g) => caption(g, "FRENTE OCIDENTAL", lt - 0.4, 2.6));
  } },
  // 36a "Os soldados começaram a cavar trincheiras"
  { t0: 141.71, L: "field", v: "grey", fade: 0.25, cam: mv([0, 1.4, -4.2, 42], [0, 1.3, -3.6, 40]), act: (A, lt, u, T) => {
    for (let i = 0; i < 5; i++) { const ph = (lt * 1.6 + i * 0.37) % 1; A.a(i % 2 ? FR : FRN, 400 + i, -3.6 + i * 1.8, 1.4 + (i % 2) * 0.6, { expr: "stern", crouch: 0.3 + 0.3 * Math.sin(ph * 6.28), prop: ["shovel", 0.2 + 0.7 * Math.max(0, Math.sin(ph * 6.28))], facing: i % 2 ? -1 : 1 }, { y: -0.3 - Math.min(0.6, lt * 0.2) });
      A.fx(1.3 + (i % 2) * 0.6, (g, c) => { if (ph > 0.55 && ph < 0.95) { const k = (ph - 0.55) / 0.4, [sx, sy, s] = P(c, -3.2 + i * 1.8 + k * 0.8, 0.4 + k * 0.9 - k * k * 0.8, 1.4 + (i % 2) * 0.6); puff(g, sx, sy, 0.18 * s, [96, 76, 54], 0.9 * (1 - k)); } }); }
    A.sp("sandbags", -2, 0, 3.4, { sc: 1.2 }); A.sp("sandbags", 2.6, 0, 3.6, { sc: 1.2 }); mudFront(A, 0.9, -6, 6, -0.05, "#5a4632");
  } },
  // 36b "para se proteger das metralhadoras e da artilharia inimiga."
  { t0: 144.0, L: "trenchIn", cam: mv([0, 1.5, -3.4, 42], [0, 1.45, -3.0, 40]), act: (A, lt, u, T) => {
    const duck = T > 144.75 ? 1 : 0; for (let i = 0; i < 4; i++) A.a(i % 2 ? FR : FRN, 410 + i, -2.4 + i * 1.6, 1.0, { expr: duck ? "fear" : "stern", crouch: duck * 0.8, armB: duck }, { y: -0.05 - duck * 0.25 });
    tracers(A, lt, 10, [12, 2.9, 6], [-12, 2.6, 4], 0.3, 5, "255,220,140", 0.7); A.fx(6, (g, c) => boom(g, c, T - 145.8, 3, 3, 7, 3, 2));
  } },
  // 37 "O que deveria ser uma solução temporária"
  { t0: 147.70, L: "trenchIn", cam: mv([-1, 1.4, -3.6, 42], [1, 1.45, -3.9, 42]), act: (A, lt) => {
    for (let i = 0; i < 3; i++) { const ph = (lt * 0.8 + i * 0.33) % 1; A.a(BRIN, 420 + i, -2 + i * 2, 1.0, { expr: "stern", prop: ph < 0.5 ? ["suitcase", 0] : undefined, crouch: 0.2 + 0.3 * Math.sin(ph * 6.28) }); }
  } },
  // 38 "se transformou em um sistema gigantesco de valas que atravessava centenas de quilômetros."
  { t0: 149.92, L: "map", fade: 0.35, cam: mv([MX(4.6), MY(49.6), -10, 42], [MX(5), MY(49.4), -17, 42]), act: (A, lt, u, T) => {
    frontLine(A, 1, 0, "#5a3a22"); frontLine(A, clamp((T - 150.4) / 3.2), -0.12, "#7a1a14", 0.06); frontLine(A, clamp((T - 150.8) / 3.2), 0.14, "#1e3a6a", 0.06);
    A.over((g) => { const km = Math.round(lerp(0, 700, smooth(clamp((T - 152.6) / 1.8)))); counter(g, km, "QUILÔMETROS DE TRINCHEIRAS", ev(T, 152.6), 99, VH * 0.8, "#f7eedc", 86); });
  } },
  // 39 "Entre os exércitos, existia uma faixa de terra conhecida como terra de ninguém."
  { t0: 155.85, L: "nomans", v: "grey", fade: 0.3, cam: mv([0, 0.9, -1.0, 40, 60], [0, 1.6, -2.4, 42, 20]), act: (A, lt, u, T) => {
    A.sp("sandbags", -1.6, 0, 0.2, { sc: 1.1 }); A.sp("sandbags", 1.9, 0, 0.25, { sc: 1.1 }); for (let i = 0; i < 7; i++) A.a(GER, 430 + i, -12 + i * 4, 30, { expr: "stern" }, { y: -0.9, dark: 0.45 });
    A.over((g) => bigText(g, "TERRA DE NINGUÉM", ev(T, 159.7), 99, VH * 0.2, 96));
  } },
  // 40a "Um território devastado por crateras,"
  { t0: 161.14, L: "nomans", v: "grey", cam: (u, lt) => C(-4 + lt * 1.2, 2.2, -8, 44, -40), act: (A, lt, u, T) => { booms(A, T, [[162.9, -2, 16, 3.5], [163.3, 6, 22, 4]]); } },
  // 40b "arame farpado,"
  { t0: 163.6, L: "nomans", v: "grey", cam: mv([0.5, 0.75, 6.4, 34], [0.2, 0.75, 6.8, 32]), act: (A, lt) => { A.light((g) => glow(g, VW * 0.6, VH * 0.3, VW * 0.3, "rgba(255,230,200,0.15)", 0.5)); } },
  // 40c "cadáveres e tiros constantes."
  { t0: 164.8, L: "nomans", v: "dusk", fade: 0.2, cam: mv([0, 1.3, -3, 42], [0, 1.4, -4.2, 44]), act: (A, lt, u, T) => {
    for (let i = 0; i < 7; i++) A.sp("grave", -6 + i * 2 + hash(i) * 0.6, 0, 3 + hash(i + 3) * 4); for (let i = 0; i < 3; i++) A.sp("helmet", -2.5 + i * 2.4, 0, 1.6 + i * 0.4);
    tracers(A, lt, 12, [14, 1.2, 26], [-14, 1.6, 2], 0.4, 9, "255,220,140", 1.0); for (let i = 0; i < 6; i++) muzzleAt(A, lt, [1.1 + hash(i) * 0.2, 1.4 + hash(i) * 0.3, 1.8], -12 + i * 5, 0.8, 30, 0.4, -1);
    A.fx(8, (g, c) => { for (let i = 0; i < 3; i++) { const k = (lt * 0.4 + i * 0.33) % 1, [sx, sy, s] = P(c, -6 + k * 12, 5 + Math.sin(k * 6) * 0.5, 8 + i); g.strokeStyle = "#1e1a18"; g.lineWidth = Math.max(2, 0.04 * s); g.beginPath(); const fl = Math.sin(lt * 10 + i) * 0.12 * s; g.moveTo(sx - 0.3 * s, sy + fl); g.lineTo(sx, sy); g.lineTo(sx + 0.3 * s, sy + fl); g.stroke(); } });
  } },
  // 41a "Para atravessá-lo, os soldados precisavam sair das trincheiras"
  { t0: 167.09, L: "trenchIn", cam: mv([0, 1.45, -3.0, 40], [0, 2.0, -4.4, 44, -40]), act: (A, lt, u, T) => {
    const wh = T > 168.3; A.a(BOFF, 440, -1.6, 0.9, { expr: wh ? "whistle" : "stern", prop: wh ? ["pistol", 0] : undefined, look: 1, wave: wh ? undefined : 0 });
    A.sp("ladder", 0.4, 0, 1.6); A.sp("ladder", 2.4, 0, 1.6);
    for (let i = 0; i < 3; i++) { const k = clamp((T - 169.6 - i * 0.25) / 0.6), x = 0.4 + (i % 2) * 2; A.a(BRI, 441 + i, x, 1.4 + i * 0.05, { expr: "shout", mode: k > 0 && k < 1 ? "march" : "stand", phase: k * 2 }, { y: k * 2.2 - 0.05, alpha: 1 - clamp((k - 0.9) * 10) }); }
    A.a(BRI, 445, 1.4, 1.1, { expr: "fear", look: 1 });
  } },
  // 41b "e correr em direção ao inimigo,"
  { t0: 170.55, L: "nomans", v: "grey", cam: (u, lt) => C(-2 + lt * 3.2, 1.3, -7, 44), act: (A, lt) => {
    for (let r = 0; r < 2; r++) for (let i = 0; i < 8; i++) runS(A, BRI, 450 + i + r * 10, lt, -2 - i * 1.7 + r * 0.8, 2.6 + r * 1.4, 3.3, { expr: "shout" });
  } },
  // 42 "muitas vezes sob uma chuva de balas."
  { t0: 172.93, L: "nomans", v: "grey", cam: mv([0, 1.25, -5.5, 42], [0, 1.25, -4.6, 40]), act: (A, lt, u, T) => {
    for (let i = 0; i < 6; i++) { const z = 9 - lt * 2.6 + (i % 3) * 1.5, fall = T > 174.3 + hash(i) * 0.6 && i % 2 === 1; const ft = T - (174.3 + hash(i) * 0.6);
      A.a(BRI, 470 + i, -3.5 + i * 1.4, fall ? z + 0.3 : z, { mode: fall ? "fall" : "march", phase: (lt * 2.6 / 1.6 + i * 0.3) % 1, expr: fall ? "pained" : "shout" }, fall ? { rot: (i % 4 ? 1 : -1) * 1.3 * smooth(ft / 0.5), y: -0.2 * smooth(ft / 0.5) } : {}); }
    tracers(A, lt, 16, [0, 1.3, 40], [0, 1.2, -2], 0.25, 11, "255,225,150"); spurts(A, lt, 12, -5, 5, 2, 10, 4);
  } },
  // 43 "A vida dentro das trincheiras era igualmente terrível."
  { t0: 175.89, L: "trenchIn", v: "grey", fade: 0.35, cam: (u) => C(1.8 - u * 3.6, 1.35, -3.6, 42), act: (A, lt) => {
    for (let i = 0; i < 6; i++) A.a(i % 2 ? BRIN : BRI, 480 + i, -4 + i * 1.6, 1.0 + (i % 2) * 0.3, { mode: i % 3 === 0 ? "sit" : "stand", expr: i % 2 ? "sad" : "dazed", headTilt: 7 }, { y: i % 3 === 0 ? 0.1 : -0.25 });
    mudFront(A, 0.55, -6, 6, 0.04);
  }, wx: ["rain", 260, 0.45], mood: ["#8a8a96", 0.18] },
  // 44a "A lama, a água contaminada,"
  { t0: 179.79, L: "trenchIn", v: "grey", cam: mv([0, 0.7, -1.8, 40, 40], [0.3, 0.6, -1.6, 38, 60]), act: (A, lt) => {
    A.a(BRI, 490, 0, 1.0, { expr: "sad", mode: "march", phase: (lt * 0.5) % 1 }, { y: -0.35 }); mudFront(A, 0.75, -3, 3, 0.15, "#4e3e2a");
    A.fx(0.7, (g, c) => { const [sx, sy, s] = P(c, -0.6, 0.12, 0.7); g.fillStyle = "rgba(120,130,90,0.7)"; g.beginPath(); g.ellipse(sx, sy, 0.7 * s, 0.07 * s, 0, 0, 7); g.fill(); for (let i = 0; i < 3; i++) { const k = (lt * 0.8 + i / 3) % 1; g.strokeStyle = `rgba(210,220,190,${0.6 * (1 - k)})`; g.lineWidth = 2; g.beginPath(); g.ellipse(sx + (i - 1) * 0.3 * s, sy, k * 0.25 * s, k * 0.03 * s, 0, 0, 7); g.stroke(); } });
  }, wx: ["rain", 200, 0.35] },
  // 44b "os ratos e os piolhos faziam parte da rotina."
  { t0: 181.85, L: "trenchIn", v: "grey", cam: mv([0, 1.1, -2.6, 40, 30], [0, 1.2, -2.3, 38, 20]), act: (A, lt, u, T) => {
    for (let i = 0; i < 4; i++) { const x = -3 + ((lt * 2.2 + i * 0.9) % 6); A.sp("rat", x, 0, 0.6 + i * 0.12, { flip: true }); }
    const scratch = T > 182.6; A.a(BRIN, 491, 0.3, 1.1, { expr: scratch ? "pained" : "sad", wave: scratch ? Math.sin(lt * 22) * 0.5 : undefined, headTilt: scratch ? -6 : 3 });
    if (scratch) flies(A, lt, 0.3, 1.6, 1.08, 7);
  } },
  // 45a "Os soldados dormiam em espaços apertados,"
  { t0: 185.27, L: "trenchIn", v: "night", fade: 0.3, cam: mv([0, 1.15, -2.4, 40], [0, 1.12, -2.0, 38]), act: (A, lt) => {
    for (let i = 0; i < 4; i++) A.a(i % 2 ? BRIN : BRI, 500 + i, -1.6 + i * 1.05, 1.0 + (i % 2) * 0.12, { mode: "sit", expr: "neutral", blink: 1, headTilt: (i % 2 ? -1 : 1) * 12 }, { y: 0.1 });
    A.light((g) => { tint(g, "#101428", 0.3, "multiply"); const [sx, sy, s] = P(A.cam, -2.4, 1.4, 1.3); glow(g, sx, sy, 1.8 * s, "rgba(255,190,110,0.85)", 0.65 + 0.08 * Math.sin(lt * 9)); });
  } },
  // 45b "com medo de ataques noturnos e bombardeios."
  { t0: 187.85, L: "trenchIn", v: "night", cam: mv([0, 1.3, -2.8, 40], [0, 1.3, -3.2, 42]), act: (A, lt, u, T) => {
    const wake = T > 189.0; for (let i = 0; i < 4; i++) A.a(i % 2 ? BRIN : BRI, 500 + i, -1.6 + i * 1.05, 1.0 + (i % 2) * 0.12, { mode: "sit", expr: wake ? "shock" : "neutral", blink: wake ? 0 : 1, headTilt: wake ? 0 : (i % 2 ? -1 : 1) * 12, look: wake ? 1 : 0 }, { y: 0.1 });
    flare(A, lt, 0.2, 3, 20); A.fx(14, (g, c) => boom(g, c, T - 189.75, -2, 3, 14, 3.5, 6)); A.light((g) => { tint(g, "#101428", 0.28, "multiply"); tint(g, "#ffd090", clamp(1 - Math.abs(T - 189.8) / 0.3) * 0.5, "screen"); });
  } },
  // 46 "Alguns passavam dias sem tomar banho ou trocar de roupa."
  { t0: 190.96, L: "trenchIn", v: "grey", fade: 0.3, cam: mv([0, 1.45, -2.6, 40], [0, 1.45, -2.2, 38]), act: (A, lt, u, T) => {
    A.a({ ...BRI, jacket: "#6a5c3c", pants: "#5a4c34" }, 510, 0, 1.0, { expr: "dazed", headTilt: 4 }); A.a(BRIN, 511, -1.5, 1.3, { expr: "pained", facing: 1, armB: 1 }); A.a(BRIN, 512, 1.5, 1.3, { expr: "pained", facing: -1, armB: -1 });
    flies(A, lt, 0, 1.9, 0.98, 8); A.fx(0.97, (g, c) => { for (let i = 0; i < 18; i++) { const [sx, sy, s] = P(c, -0.4 + hash(i) * 0.8, 0.2 + hash(i + 4) * 1.3, 0.97); g.fillStyle = "rgba(60,44,30,0.55)"; g.beginPath(); g.ellipse(sx, sy, 0.06 * s, 0.04 * s, i, 0, 7); g.fill(); } });
    A.over((g) => { const d = 1 + Math.floor(clamp((T - 191.8) / 2.4) * 11); calendar(g, "DIA", String(d), lt, VW - 300, 110); });
  } },
  // 47 "O medo era permanente."
  { t0: 194.98, L: "trenchIn", v: "night", cam: mv([0, 1.52, -1.5, 34], [0, 1.52, -1.15, 32]), act: (A, lt) => {
    A.a(BRI, 520, Math.sin(lt * 40) * 0.006, 1.0, { expr: "fear", look: Math.sin(lt * 2) });
    A.light((g) => { const k = 0.5 + 0.5 * Math.sin(lt * 3); glow(g, VW * 0.8, VH * 0.1, VW * 0.5, "rgba(220,235,255,0.4)", 0.3 + 0.2 * k); });
  } },
  // 48 "E, mesmo quando os tiros cessavam, o silêncio não significava segurança."
  { t0: 197.15, L: "nomans", v: "night", fade: 0.3, cam: mv([0, 1.1, -1.4, 40, 40], [0, 1.15, -1.8, 40, 40]), act: (A, lt, u, T) => {
    if (T < 198.8) { for (let i = 0; i < 5; i++) muzzleAt(A, lt, [0.2 + hash(i) * 0.4, 0.8 + hash(i + 2) * 0.5, 1.3], -10 + i * 5, 0.8, 30, 0.45, -1); tracers(A, lt, 6, [10, 1, 30], [-6, 1.4, 4], 0.5, 13, "255,220,140", 0, 198.8 - 197.15); }
    flare(A, lt, 0.6, -3, 22); A.sp("sandbags", 0, 0, 0.35, { sc: 1.2 }); A.a(BRI, 530, -0.6, 0.9, { expr: "nervous", look: 1 }, { y: -0.28 }); A.a(BRI, 531, 0.7, 0.95, { expr: "fear", look: 0 }, { y: -0.32 });
  } },
  // 49 "Podia ser apenas o intervalo antes da próxima explosão."
  { t0: 202.50, L: "trenchIn", v: "night", cam: mv([0, 1.5, -2.2, 38], [0, 1.52, -1.4, 34]), act: (A, lt, u, T) => {
    A.a(BRI, 520, 0, 1.0, { expr: T > 204.6 ? "shock" : "nervous", look: T > 204 ? 0 : -1, headTilt: T > 204 ? -8 : 0 });
    A.light((g) => { const k = clamp((T - 205.25) / 0.12); if (k > 0) tint(g, "#fff4dc", 1 - clamp((T - 205.5) / 1.4), "screen"); });
  } },
];

/** sea surface highlights & foam */
export function waves(g: CanvasRenderingContext2D, c: ReturnType<typeof C>, lt: number) {
  g.save(); g.strokeStyle = "rgba(240,248,255,0.5)"; g.lineWidth = 2;
  for (let i = 0; i < 18; i++) { const z = 8 + i * i * 2.2, [, y] = P(c, 0, 0, z); if (y > VH + 10) continue; g.beginPath(); for (let x = 0; x <= VW; x += 40) g.lineTo(x, y + Math.sin(x * 0.015 + lt * 1.6 + i) * 2.5); g.stroke(); }
  g.restore();
}
function stamp(g: CanvasRenderingContext2D, txt: string, t: number, x: number, y: number, rot = -0.18, size = 120, col = "#c42a22") {
  if (t < 0) return; const k = t < 0.12 ? 2.2 - 1.2 * (t / 0.12) : 1, a = t < 0.12 ? t / 0.12 : 1;
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(k, k); g.globalAlpha = 0.9 * a; g.font = `bold ${size}px "DejaVu Serif", serif`; const w = g.measureText(txt).width;
  g.strokeStyle = col; g.lineWidth = size * 0.09; g.strokeRect(-w / 2 - size * 0.3, -size * 0.75, w + size * 0.6, size * 1.5); g.fillStyle = col; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(txt, 0, 4); g.restore();
}
