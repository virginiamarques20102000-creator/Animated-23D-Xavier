// 0 – 182.6 s: the hook, Brazil, the war in one line, the questions, the disputed land, the caboclos, the railway, the lumber company, the revolt.
import { VW, VH, P, glow, fire, smokeCol, puff, clamp, lerp, smooth, easeOut, easeIn, hash, rays, sun } from "./engine";
import { Sc, mv, path, hand, walkF, walkS, runS, marchF, marchCol, crowd, flag, signing, panel, caption, bigText, counter, fall, tank } from "./kit";
import { blast, scorch, embers, flutter, sparks, lensFlare, glint, birds, dust, rubble, bounce, spring, coins } from "./fx";
import { cab, mulher, crianca, cabArm, sold, SOLDADO, OFICIAL, FARQUHAR, EXEC, POLIT, OPER, VAQ, v, train, railsX, railsZ, mapaBR, mapaSul, hlSul, hlBR, marca, rota, MST, CONTEST, lantern, BX, BY } from "./props";
import { plat, mata, sala, cidade, SKY, ground, loc } from "./lugares";
import { DAY, GOLD, BACK, GREY, NIGHTFIRE, MOON, LAMP, COLD, NOON } from "./looks";
import type { Shot } from "./types";
import type { Ctx } from "./engine";

// the opening family (reappears at the end)
export const PAI = { ...cab(0, 1), hat: "aba", cap: "#4a3626", moustache: "#2a1d16", jacket: "#d8ccb0", pants: "#5a4a3a" } as ReturnType<typeof cab>;
export const MAE = mulher(1, 2), FILHO = crianca(0, 1), FILHA = crianca(1, 2), AVO = { ...mulher(3, 4), hair: "#d8d4cc", hat: "headscarf", cap: "#5a4a6a" } as ReturnType<typeof mulher>;
const familia = (A: Sc, x: number, z: number, f: Partial<Record<string, unknown>> = {}, look = 0) => {
  A.a(PAI, 11, x - 0.9, z, { expr: "smile", look, ...(f.pai as object) }); A.a(MAE, 12, x + 0.2, z + 0.2, { expr: "smile", look, ...(f.mae as object) });
  A.a(FILHO, 13, x - 0.25, z - 0.5, { expr: "smile", look, ...(f.k as object) }); A.a(FILHA, 14, x + 0.8, z - 0.4, { expr: "smile_closed", look, ...(f.k as object) }); A.a(AVO, 15, x + 1.3, z + 0.5, { expr: "smile_closed", look, ...(f.avo as object) });
};
const chimney = (A: Sc, x: number, z: number, lt: number, y = 5.2) => A.fx(z + 0.05, (g, c) => smokeCol(g, c, lt, x, y, z, { h: 6, w: 0.5, col: [210, 206, 200], a: 0.45, n: 10, wind: 0.35 }));
const STAMP = (g: Ctx, txt: string, k: number, x: number, y: number, col = "#c42a22", size = 72) => { if (k <= 0) return; const e = easeOut(clamp(k / 0.2)); g.save(); g.translate(x, y); g.rotate(-0.13); g.scale(2.2 - 1.2 * e, 2.2 - 1.2 * e); g.globalAlpha = 0.9 * e; g.font = `bold ${size}px "DejaVu Sans", sans-serif`; const w = g.measureText(txt).width; g.strokeStyle = col; g.lineWidth = size * 0.12; g.strokeRect(-w / 2 - 30, -size * 0.8, w + 60, size * 1.6); g.fillStyle = col; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(txt, 0, 4); g.restore(); };
export { STAMP, chimney, familia };

export const SHOTS_1: Shot[] = [
  // 0 "Imagine perder a casa onde sua família vive há gerações." — golden morning: the family in front of their wooden house; the crane comes down onto them
  { t0: 0, L: () => plat("o0", "gold", { near: [[-9, 14, 20], [11, 18, 22]], fence: 12 }), lite: GOLD, bloom: 0.8,
    cam: path([[0, [0, 6.5, -14, 44, -150]], [0.55, [0.4, 2.2, -7, 40, -10]], [1, [0.6, 1.6, -4.2, 36, 0]]]), act: (A, lt) => {
      A.sp("casa", 0.4, 0, 7.5); chimney(A, 2.75, 7.5, lt); familia(A, 0.3, 3.2, {}, 0);
      A.a(v(crianca(2, 3), {}), 16, -2.4, 4.6, { mode: "stroll", phase: (lt * 1.6) % 1, expr: "laugh", look: 1 }, {});
      A.fx(20, (g, c) => birds(g, c, lt, 6, -12, 9, 20, 2.2, "#3a2a2a", 4, 0.35));
      A.light((g) => { sun(g, VW * 0.8, VH * 0.2, 30, "255,214,160"); rays(g, VW * 0.8, VH * 0.2, VW * 0.9, 0.14, "255,200,150", 18, lt); });
    } },
  // 1a "Imagine descobrir que uma empresa estrangeira agora é dona das terras" — a company man hammers a sign into their yard
  { t0: 4.41, fade: 0.25, L: () => plat("o1", "day", { near: [[12, 20, 22]] }), lite: DAY, kicks: [[8.15, 6], [8.6, 4]],
    cam: path([[0, [-3.5, 1.4, -3.5, 40]], [0.5, [-1.2, 1.5, -4.6, 38]], [1, [0.4, 1.2, -3.0, 32]]]), act: (A, lt, u, T) => {
      A.sp("casa", -2.5, 0, 9); chimney(A, -0.15, 9, lt);
      const hit = (T - 6.9) % 0.62, k = T < 6.9 ? 0 : hit < 0.3 ? hit / 0.3 : 1 - (hit - 0.3) / 0.32, drive = clamp((T - 6.9) / 1.6);
      A.a(EXEC, 21, 0.2, 2.6, { expr: "grin", look: -1, prop: ["paper", 0] });
      A.s(VAQ(0), 22, 1.5, 2.2, { mode: "swing", pose: T < 6.9 ? 0 : k }, {});
      panel(A, 2.0, (w) => { w.rect(2.3, -0.4, 0.12, 1.9 - 0.45 * drive, "#5a3a24", 2); w.rect(1.55, 0.95 - 0.45 * drive, 1.6, 0.8, "#e8dcb8", 2.5); w.text("PROPRIEDADE", 2.35, 1.48 - 0.45 * drive, 0.18, "#8a1e16"); w.text("BRAZIL RAILWAY CO.", 2.35, 1.2 - 0.45 * drive, 0.11, "#2a2018"); });
      A.fx(2.0, (g, c) => { const age = (T - 6.9) % 0.62; if (T > 6.9 && T < 8.6 && age < 0.12) { const [sx, sy, s] = P(c, 2.35, 1.75 - 0.45 * drive, 2.0); glow(g, sx, sy, 0.4 * s, "rgba(255,240,200,1)", 0.6); } });
      A.a(PAI, 11, -2.6, 4.2, { expr: T > 8.0 ? "shock" : "nervous", look: 1, armB: T > 8.0 ? 1 : 0 }); A.a(MAE, 12, -3.5, 4.6, { expr: T > 8.0 ? "fear" : "nervous", look: 1, prop: ["baby", 0] });
      A.over((g) => STAMP(g, "DONA DAS TERRAS", T - 8.15, VW * 0.72, VH * 0.24, "#c42a22", 64));
    } },
  // 1b "onde você nasceu," — newborn in the mother's arms by the window light
  { t0: 9.73, fade: 0.15, L: () => sala("o2", "#8a6446", { win: 1, winCol: "#fff0c8", floor: ["#3a2618", "#4a3220"] }), lite: LAMP, bloom: 0.9,
    cam: mv([0.2, 1.45, -1.6, 34], [0.05, 1.5, -1.1, 30]), act: (A, lt) => { A.a(MAE, 12, 0, 1.6, { expr: "smile_closed", look: 0.3, prop: ["baby", 0], headTilt: 8 }); A.light((g) => rays(g, VW * 0.5, VH * 0.3, VW * 0.6, 0.12, "255,230,180", 10, lt, 1.2, 1.9)); } },
  // 1c "cresceu" — the boy runs through the corn
  { t0: 10.03, fade: 0.1, L: () => plat("o3", "gold", { fields: true }), lite: GOLD, cam: mv([-2.5, 1.0, -4, 38], [0.5, 1.1, -4, 38]),
    act: (A, lt) => { runS(A, FILHO, 13, lt, -3.4, 2.2, 3.2, { expr: "laugh" }); runS(A, FILHA, 14, lt, -4.6, 2.6, 3.0, { expr: "laugh" }); } },
  // 1d "e construiu sua vida." — the father hammers the last plank of the roof
  { t0: 10.83, fade: 0.1, L: () => plat("o4", "gold", { near: [[-8, 16, 20]] }), lite: GOLD, cam: mv([1.2, 1.3, -3.0, 36, 0], [0.5, 1.25, -2.4, 32, 0]), kicks: [[11.2, 2], [11.55, 2]],
    act: (A, lt, u, T) => { A.sp("casa", 0, 0, 6); const ph = ((T - 10.83) % 0.36) / 0.36; A.s(PAI, 11, -0.6, 2.6, { mode: "swing", pose: ph < 0.5 ? ph * 2 : 2 - ph * 2, expr: "smile" }); A.sp("mesa", 0.2, 0, 2.65, { sc: 0.6 });
      A.fx(3.0, (g, c) => { if (ph > 0.45 && ph < 0.6) { const [sx, sy, s] = P(c, 0.1, 0.5, 2.6); for (let i = 0; i < 6; i++) puff(g, sx + (hash(i) - 0.5) * 0.4 * s, sy - hash(i + 3) * 0.2 * s, 0.08 * s, [200, 170, 120], 0.6); } }); } },
  // 2a "E, quando você tenta resistir, em vez de receber ajuda," — the father blocks the door, arms spread; the company men retreat a step
  { t0: 12.22, fade: 0.2, L: () => plat("o5", "day", { near: [[12, 18, 22]] }), lite: DAY, cam: path([[0, [2.2, 1.1, -3.2, 38, 30]], [1, [0.4, 1.0, -4.4, 40, 40]]]),
    act: (A, lt, u, T) => { A.sp("casa", 0, 0, 8.5); const r = smooth((T - 13.75) / 0.5);
      A.a(PAI, 11, 0, 4.5, { expr: T > 13.75 ? "shout" : "stern", look: 0, armB: 1, stance: 0.8, hip: 2 }); A.a(MAE, 12, 1.1, 5.2, { expr: "nervous", look: -1 }); A.a(FILHO, 13, -1.0, 5.0, { expr: "fear", look: 0.5 });
      A.a(EXEC, 21, -2.8 - r * 0.6, 2.0, { expr: T > 13.75 ? "nervous" : "grin", look: 1, facing: 1 }); A.a(VAQ(1), 22, 2.9 + r * 0.5, 2.2, { expr: "stern", look: -1, facing: -1 }); } },
  // 2b "encontra soldados armados" — low angle: a column of soldiers marches down the dirt road toward us
  { t0: 16.33, fade: 0.15, tr: "punch", L: () => plat("o6", "grey", { near: [[-7, 12, 18], [8, 14, 20]] }), lite: GREY, kicks: [[16.85, 3]],
    cam: mv([0.3, 0.55, -2, 40, 120], [0.0, 0.6, -2.6, 44, 110]), act: (A, lt, u, T) => {
      marchF(A, (i) => sold(i), lt, 5, 3, 7, 1.4, 1.2, 1.6, 300, () => ({ expr: "stern" })); A.a(OFICIAL, 30, -1.6, 4.5 - lt * 1.4, { mode: "march", phase: (lt * 1.4 / 1.5) % 1, expr: "stern", prop: ["pistol", 0] });
      A.fx(12, (g, c) => dust(g, c, lt, 0, 10, -1, 1.2, [150, 140, 120], 3)); } },
  // 2c "enviados pelo próprio governo para expulsá-lo." — the soldiers push the family out; they leave with bundles
  { t0: 18.18, fade: 0.15, L: () => plat("o7", "grey", { near: [[11, 16, 20]] }), lite: GREY, kicks: [[19.95, 4]], cam: path([[0, [-1.5, 1.5, -5, 40]], [1, [1.0, 1.6, -6.2, 42]]]),
    act: (A, lt, u, T) => { A.sp("casa", 1.5, 0, 9); const go = clamp((T - 19.95) / 2);
      A.a(OFICIAL, 30, 3.3, 3.5, { expr: "shout", look: -1, facing: -1, prop: ["pistol", 0], armB: 1 }); A.a(sold(1), 31, 2.3, 4.2, { expr: "stern", look: -1, facing: -1 }); A.a(sold(2), 32, 4.4, 4.6, { expr: "stern", look: -1, facing: -1 });
      walkF(A, PAI, 11, lt, 1.6, 4, [0.6, 5.0], [-3.2, 3.4], { expr: "sad", prop: ["suitcase", 0], look: -0.8 }); walkF(A, MAE, 12, lt, 1.7, 4, [1.4, 5.4], [-2.2, 3.8], { expr: "sad", prop: ["baby", 0] });
      walkF(A, AVO, 15, lt, 1.9, 4.2, [2.0, 5.8], [-1.2, 4.2], { expr: "sad" }); walkF(A, FILHO, 13, lt, 1.8, 4, [0.9, 4.6], [-2.8, 3.0], { expr: "fear", look: 1 }); void go; } },
  // 3 "Parece uma história de outro país." — the whole continent from far away, slow drift
  { t0: 21.42, fade: 0.3, L: () => mapaBR("o8", MST.night), lite: { sa: 0 }, cam: mv([3, 1, -40, 40], [1.4, 0.6, -34, 40]), bloom: 0.8,
    act: (A, lt) => { A.light((g) => { for (let i = 0; i < 30; i++) { const x = hash(i) * VW, y = hash(i + 9) * VH * 0.4; glow(g, x, y, 6, "rgba(200,220,255,1)", 0.3 + 0.2 * Math.sin(lt * 3 + i)); } }); } },
  // 4 "Mas aconteceu no Brasil." — crash zoom into Brazil; the country lights up green
  { t0: 23.79, tr: "punch", L: () => mapaBR("o9", MST.parch), lite: { sa: 0 }, cam: mv([1.4, 0.6, -34, 40], [0.2, -1.6, -22, 40], easeOut), kicks: [[24.75, 4]],
    act: (A, lt, u, T) => { hlBR(A, (T - 24.75) / 0.4); marca(A, -51.2, -26.9, T - 24.95, "", { br: true, kind: "fire" }); A.over((g) => bigText(g, "BRASIL", T - 24.75, 1.6, VH * 0.2, 120, "#f6efe0", undefined, "120,255,160")); } },
  // 5a "Entre 1912 e 1916," — silhouettes of sertanejos against a burning horizon
  { t0: 25.67, fade: 0.2, L: () => plat("o10", "fire", { near: [[-6, 12, 18], [7, 16, 22]] }), lite: NIGHTFIRE, bloom: 1.0, wx: ["ash", 90, 0.5],
    cam: mv([-1.0, 1.0, -6, 40, 40], [1.0, 1.1, -5, 38, 40]), act: (A, lt, u, T) => {
      for (let i = 0; i < 7; i++) A.a(cabArm(i, 3), 40 + i, -4 + i * 1.3, 4 + (i % 2) * 0.8, { expr: "stern", look: 0, prop: i % 3 === 0 ? ["flag", 0] : i % 3 === 1 ? ["katana", 0] : undefined }, { dark: 0.85, darkCol: "#1a0c08" });
      A.fx(40, (g, c) => { fire(g, c, lt, -10, 0, 40, 4, 2); fire(g, c, lt, 6, 0, 45, 5, 4); smokeCol(g, c, lt, -10, 3, 40, { h: 30, w: 5, a: 0.6 }); smokeCol(g, c, lt, 6, 3, 45, { h: 34, w: 6, a: 0.6 }); embers(g, c, lt, 0, 12, 20, 60, 10, 3); });
      A.over((g) => { bigText(g, "1912", T - 26.0, 1.4, VH * 0.24, 150); bigText(g, "1912 — 1916", T - 27.5, 1.6, VH * 0.24, 140); }); } },
  // 5b "milhares de brasileiros enfrentaram uma guerra contra as forças do governo." — the two sides on the plateau; the first shell lands
  { t0: 28.88, fade: 0.15, L: () => plat("o11", "storm", { dense: 0.7 }), lite: GREY, kicks: [[31.6, 9], [32.4, 5]], wx: ["dust", 60, 0.4],
    cam: path([[0, [-6, 1.9, -4, 42, -30]], [0.6, [0, 1.8, -4.5, 42, -20]], [1, [4.5, 1.6, -3.5, 40, -10]]]), act: (A, lt, u, T) => {
      for (let i = 0; i < 14; i++) A.a(cabArm(i, 5), 60 + i, -9 + (i % 7) * 1.1, 6 + Math.floor(i / 7) * 1.4, { expr: "shout", look: 1, prop: i % 4 === 0 ? ["flag", 0] : i % 4 === 2 ? ["katana", 0.2] : undefined, facing: 1 });
      flag(A, "cont", -8.5, 3.4, 7.2, 1.6, 1.1, { wind: 1.2 });
      for (let i = 0; i < 12; i++) A.a(sold(i), 80 + i, 4 + (i % 6) * 1.1, 6.5 + Math.floor(i / 6) * 1.4, { expr: "stern", look: -1, facing: -1, crouch: i < 6 ? 0.5 : 0 });
      A.sp("cannon", 9.6, 0, 8.6, { flip: true }); flag(A, "br", 8.0, 3.4, 8.4, 1.5, 1.0, { wind: 1 });
      A.fx(9.0, (g, c) => { blast(g, c, T - 31.6, -2, 0, 11, 2.0, 3); blast(g, c, T - 32.4, -6.5, 0, 14, 1.8, 5); });
      A.fx(8.5, (g, c) => { const k = T - 31.3; if (k > 0 && k < 0.1) { const [sx, sy, s] = P(c, 8.2, 1.0, 8.5); glow(g, sx, sy, 2 * s, "rgba(255,220,140,1)", 1); } }); } },
  // 6 "Não eram soldados de outro país, nem um exército estrangeiro." — foreign uniforms fade away under a red cross
  { t0: 34.0, fade: 0.2, tr: "whip", L: () => plat("o12", "grey", { noFar: true }), lite: GREY, cam: mv([0, 1.6, -7, 40], [0, 1.5, -5.8, 38]), mood: ["#8a8a9a", 0.25],
    act: (A, lt, u, T) => { const fadeA = 1 - smooth((T - 35.0) / 1.2);
      marchF(A, (i) => ({ jacket: "#5a6a7a", pants: "#4a5662", boots: "#141414", hat: i % 2 ? "pickel" : "shako", cap: "#2a2624", rifle: true }), lt, 2, 6, 3.5, 0.6, 1.2, 1.5, 500, () => ({ expr: "stern" }), { alpha: fadeA });
      A.over((g) => { STAMP(g, "✕", T - 34.5, VW * 0.5, VH * 0.45, "#c42a22", 260); }); } },
  // 7a "Eram sertanejos, trabalhadores e famílias pobres" — dolly past the people, one group per word
  { t0: 37.95, fade: 0.2, L: () => plat("o13", "gold", { near: [[-12, 15, 20], [14, 18, 22]] }), lite: GOLD, cam: mv([-4, 1.4, -3.6, 36], [4, 1.4, -3.4, 36], (x) => x),
    act: (A, lt, u, T) => {
      A.a(cab(2, 1), 100, -4.2, 2.4, { expr: "stern", prop: ["shovel", 0], look: 0 }); A.a(cab(5, 1), 101, -3.1, 3.2, { expr: "neutral", look: 0 });
      A.a(OPER(0), 102, -0.6, 2.5, { expr: "sad", prop: ["hammer", 0], look: 0 }); A.a(OPER(1), 103, 0.5, 3.0, { expr: "neutral", look: -0.3 });
      A.a(mulher(2, 3), 104, 3.0, 2.6, { expr: "sad", prop: ["baby", 0] }); A.a(crianca(3, 1), 105, 3.8, 2.3, { expr: "sad", look: -0.5 }); A.a(cab(8, 2), 106, 4.6, 3.1, { expr: "sad" }); } },
  // 7b "que estavam perdendo suas terras e tentando sobreviver." — a family walks away down the road at dusk, the house small behind them
  { t0: 41.18, fade: 0.25, L: () => plat("o14", "dusk", { near: [[9, 14, 18]] }), lite: BACK, bloom: 0.9, cam: mv([0, 1.2, -3, 40, 30], [0, 1.3, -1.5, 40, 30]),
    act: (A, lt, u, T) => { A.sp("casa", -3, 0, 30, { sc: 1 }); const look = T > 43.9 ? 1 : 0;
      for (let i = 0; i < 4; i++) A.a([PAI, MAE, FILHO, AVO][i], 11 + i, -1.2 + i * 0.8, 3 + i * 0.3 + lt * 1.0, { mode: T > 43.9 ? "stand" : "stroll", phase: (lt * 1.2 + i * 0.25) % 1, expr: "sad", facing: 0, look: look ? -0.8 : 0, prop: i === 0 ? ["suitcase", 0] : undefined }, { dark: 0.6, darkCol: "#2a1a24" });
      A.light((g) => { sun(g, VW * 0.42, VH * 0.42, 34, "255,190,140"); rays(g, VW * 0.42, VH * 0.42, VW * 0.8, 0.16, "255,180,130", 20, lt); }); } },
  // 8a "Mas como uma simples disputa territorial" — two politicians pull a map between them, tug of war
  { t0: 45.21, fade: 0.2, L: () => sala("o15", "#6a5a4a", { frames: 2, panel: "#3a2a1e", win: 2, winCol: "#e0d8c0" }), lite: LAMP, cam: mv([0, 1.6, -2.8, 38], [0, 1.55, -2.0, 34]),
    act: (A, lt, u, T) => { const tug = Math.sin(lt * 5) * 0.12;
      A.a(POLIT(0), 120, -1.3 + tug, 2.0, { expr: "shout", look: 1, facing: 1, armB: 1, hip: -5 }); A.a(POLIT(1), 121, 1.3 + tug, 2.0, { expr: "shout", look: -1, facing: -1, armB: 1, hip: 5 });
      panel(A, 1.9, (w) => { w.rect(-0.75 + tug, 1.05, 1.5, 0.9, "#ead8ac", 2.5); w.poly([[-0.5 + tug, 1.2], [0.2 + tug, 1.15], [0.5 + tug, 1.5], [0.1 + tug, 1.85], [-0.4 + tug, 1.7]], "#c8b48a", 1.5); w.line([[-0.1 + tug, 1.2], [0.05 + tug, 1.8]], 3, "#b3221c"); }); } },
  // 8b "se transformou em uma guerra tão violenta?" — a shell bursts among people who run
  { t0: 47.78, tr: "flash", L: () => plat("o16", "storm", { near: [[-8, 14, 20]] }), lite: GREY, kicks: [[48.8, 10], [49.5, 6]], wx: ["ash", 80, 0.5],
    cam: hand(mv([0, 1.3, -6, 42], [0.5, 1.2, -5, 40]), 0.06), act: (A, lt, u, T) => {
      A.fx(8, (g, c) => { blast(g, c, T - 48.8, 1.5, 0, 9, 2.6, 7); blast(g, c, T - 49.5, -4, 0, 13, 2.2, 9); });
      for (let i = 0; i < 6; i++) runS(A, cab(i, 6), 140 + i, lt, -1 - i * 1.3, 3 + (i % 3) * 0.7, -3.2, { expr: "fear" });
      fall(A, cab(7, 6), 150, 2.5, 6.5, T, 48.85, { dir: 1, blast: true }); } },
  // 9a "E por que o governo precisou mobilizar milhares de soldados" — rows and rows of soldiers; crane up reveals how many
  { t0: 50.58, fade: 0.2, L: () => plat("o17", "day", { dense: 0.5 }), lite: DAY, cam: path([[0, [0, 1.4, -3, 40, 20]], [1, [0, 9, -8, 46, -260]]]),
    act: (A, lt) => { marchF(A, (i) => sold(i), lt, 10, 9, 2, -0.3, 1.25, 1.6, 600, () => ({ expr: "stern" })); flag(A, "br", -6.5, 3.6, 6, 1.6, 1.1); flag(A, "br", 6.5, 3.6, 12, 1.6, 1.1); } },
  // 9b "para derrotar pessoas que, em muitos casos, mal tinham o que comer?" — a family at night around an empty pot
  { t0: 54.43, fade: 0.25, L: () => sala("o18", "#5a4232", { floor: ["#2a1e16", "#3a2a1e"] }), lite: NIGHTFIRE, bloom: 0.9, cam: mv([0, 1.2, -3.6, 38, 30], [0, 1.15, -2.8, 36, 30]),
    act: (A, lt, u, T) => { A.fx(1.6, (g, c) => fire(g, c, lt, 0, 0.05, 1.6, 0.35, 3)); A.sp("panela", 0, 0.15, 1.55, { sc: 0.9 });
      A.a(mulher(4, 5), 160, -1.0, 2.0, { expr: "sad", look: 0.4, mode: "sit", crouch: 0.6 }); A.a(crianca(4, 5), 161, 0.9, 1.9, { expr: "sad", look: -0.5, mode: "sit", prop: ["bread", 0] }); A.a(cab(9, 5), 162, 1.9, 2.6, { expr: "sad", look: -0.8 });
      A.light((g) => { const [sx, sy, s] = P(A.cam, 0, 0.5, 1.6); glow(g, sx, sy, 3 * s, "rgba(255,150,60,1)", 0.5); }); } },
  // 10 "Para entender essa história, precisamos voltar ao início do século XX." — sepia plateau, a lone rider crosses; the years roll back
  { t0: 58.93, fade: 0.6, L: () => plat("o19", "sepia", { near: [[-10, 16, 22], [12, 20, 24]] }), lite: GOLD, sat: 0.55, grade: ["#c8a070", 0.35],
    cam: path([[0, [-2, 3.5, -10, 44, -60]], [1, [1.5, 2.0, -6, 40, -10]]]), act: (A, lt, u, T) => {
      A.sp("cavalo", -6 + lt * 2.2, 0.02 * Math.sin(lt * 9), 9); A.a(cab(3, 8), 170, -6.1 + lt * 2.2, 9.02, { expr: "neutral", mode: "sit", look: 1 }, { y: 1.05 + 0.02 * Math.sin(lt * 9) });
      A.over((g) => { const yr = Math.round(lerp(1916, 1900, smooth((T - 60.2) / 2.0))); if (T > 60.2 && T < 62.0) bigText(g, String(yr), T - 60.2, 1.8, VH * 0.3, 150); bigText(g, "INÍCIO DO SÉCULO XX", T - 62.0, 1.3, VH * 0.82, 70); }); } },
  // 11 "Naquela época, existia uma região disputada entre os estados do Paraná e de Santa Catarina." — the map: Paraná lights up, then Santa Catarina
  { t0: 63.25, fade: 0.4, L: () => mapaSul("o20", MST.parch), lite: { sa: 0 }, cam: mv([0, 0.6, -40, 40], [-0.6, 0.2, -32, 40]),
    act: (A, lt, u, T) => {
      A.fx(-0.05, (g, c) => { const k1 = clamp((T - 66.9) / 0.4), k2 = clamp((T - 67.8) / 0.4); if (k1 > 0) { g.save(); g.globalAlpha = 0.35 * k1; g.fillStyle = "#3a8a4a"; g.fillRect(0, 0, 0, 0); g.restore(); } void k2; void c; });
      hlSul(A, [-54.6, -25.5, -54.3, -24.1, -54.1, -23.9, -52.6, -22.6, -51.4, -22.6, -50.0, -22.9, -49.6, -23.5, -49.2, -24.6, -48.5, -25.0, -48.1, -25.6, -48.6, -26.0, -49.5, -26.2, -51.3, -26.6, -53.7, -26.2], (T - 66.9) / 0.4, "#3a8a4a", 0.35, false);
      hlSul(A, [-53.8, -26.2, -51.3, -26.6, -49.5, -26.2, -48.6, -26.0, -48.5, -26.6, -48.6, -27.5, -48.5, -28.2, -49.2, -28.6, -49.8, -29.3, -50.4, -28.6, -51.6, -27.8, -53.0, -27.25, -53.8, -27.15], (T - 67.8) / 0.4, "#c8702a", 0.35, false);
      hlSul(A, CONTEST, (T - 65.2) / 0.8, "#b3221c", 0.25, true); } },
  // 12 "Como os dois governos reivindicavam o controle daquele território, ele ficou conhecido como Contestado." — flags from both sides plant in the same land
  { t0: 69.14, L: () => mapaSul("o21", MST.parch), lite: { sa: 0 }, cam: mv([-0.6, 0.2, -32, 40], [-1.8, -0.8, -13, 40]), kicks: [[74.5, 5]],
    act: (A, lt, u, T) => { hlSul(A, CONTEST, 1, "#b3221c", 0.3 + 0.25 * clamp((T - 74.5) / 0.3), true);
      for (const [lon, lat, col, tt] of [[-52.6, -26.5, "#3a8a4a", 70.2], [-51.2, -27.3, "#c8702a", 71.1], [-52.2, -26.9, "#3a8a4a", 72.0], [-50.7, -26.8, "#c8702a", 72.6]] as [number, number, string, number][])
        A.fx(-0.1, (g, c) => { const k = T - tt; if (k < 0) return; const [hy] = bounce(k, 1.6, 0, 0.3), [sx, sy, s] = P(c, (lon + 51) * 2, (lat + 26.5) * 2 + Math.max(0, hy), 0); g.strokeStyle = "#3a2a1c"; g.lineWidth = 0.06 * s; g.beginPath(); g.moveTo(sx, sy); g.lineTo(sx, sy - 1.1 * s); g.stroke(); g.fillStyle = col; g.strokeStyle = "#241726"; g.lineWidth = 2; g.beginPath(); g.moveTo(sx, sy - 1.1 * s); g.lineTo(sx + 0.7 * s, sy - 0.9 * s + Math.sin(T * 6 + lon) * 0.05 * s); g.lineTo(sx, sy - 0.65 * s); g.closePath(); g.fill(); g.stroke(); });
      A.over((g) => bigText(g, "CONTESTADO", T - 74.5, 1.4, VH * 0.82, 120, "#ffe0c0", undefined, "255,90,60")); } },
  // 13a "Mas, enquanto os políticos discutiam fronteiras," — the cabinet: shouting, a fist hits the table
  { t0: 75.70, fade: 0.2, tr: "whip", L: () => sala("o22", "#5a4e44", { frames: 3, panel: "#2e2218", lamps: 3 }), lite: LAMP, kicks: [[77.55, 6]], cam: path([[0, [-2, 1.7, -3.4, 40]], [1, [1.5, 1.6, -3.0, 38]]]),
    act: (A, lt, u, T) => { A.sp("mesa", 0, 0, 2.6, { sc: 1.3 }); panel(A, 2.55, (w) => { w.rect(-1.0, 1.0, 2.0, 0.06, "#ead8ac", 1.5); });
      for (let i = 0; i < 5; i++) A.a(POLIT(i), 180 + i, -2.4 + i * 1.2, 3.2 + (i % 2) * 0.4, { expr: i === 2 && T > 77.4 ? "shout" : i % 2 ? "stern" : "shout", look: i < 2 ? 1 : -1, prop: i === 2 ? ["fist", T > 77.4 ? 1 : 0] : undefined }); } },
  // 13b "milhares de famílias viviam naquela região." — aerial over the plateau, houses with smoking chimneys scattered among the pines
  { t0: 78.88, fade: 0.3, L: () => plat("o23", "dawn", { dense: 1.2 }), lite: DAY, bloom: 0.8, cam: path([[0, [0, 16, -20, 46, -320]], [1, [4, 9, -14, 44, -200]]]),
    act: (A, lt) => { for (let i = 0; i < 9; i++) { const x = -18 + i * 4.6 + hash(i) * 2, z = 8 + hash(i + 3) * 26; A.sp(i % 3 ? "casa" : "rancho", x, 0, z); chimney(A, x + 2.3, z, lt + i, 5); for (let k = 0; k < 2; k++) A.a(cab(i + k, 9), 200 + i * 3 + k, x - 1.5 + k * 3, z - 2, { mode: "stroll", phase: (lt + k) % 1 }); }
      A.fx(30, (g, c) => birds(g, c, lt, 8, -14, 14, 30, 2, "#2a2a2a", 7, 0.5)); } },
  // 14a "Eram principalmente caboclos e sertanejos" — portrait push-in on a group of faces
  { t0: 81.90, fade: 0.2, L: () => plat("o24", "gold", { near: [[-6, 10, 16]] }), lite: GOLD, cam: mv([0, 1.55, -3.6, 36], [0.3, 1.6, -2.4, 28]),
    act: (A) => { for (let i = 0; i < 6; i++) A.a(cab(i * 2, 4), 220 + i, -2.2 + i * 0.9, 2.2 + (i % 2) * 0.9, { expr: (["stern", "neutral", "smile_closed", "stern", "neutral", "smile_closed"] as const)[i], look: (i - 2.5) * -0.15 }); } },
  // 14b "que trabalhavam na agricultura," — hoes rise and fall in the cornfield
  { t0: 85.13, fade: 0.15, L: () => plat("o25", "day", { fields: true, near: [[13, 22, 22]] }), lite: DAY, cam: mv([-2, 1.4, -4, 38], [1.5, 1.4, -3.4, 36]),
    act: (A, lt) => { for (let i = 0; i < 3; i++) { const ph = ((lt * 1.4 + i * 0.33) % 1); A.s(cab(i + 1, 10), 240 + i, -2 + i * 2, 2.6 + i * 0.6, { mode: "swing", pose: ph < 0.4 ? ph / 0.4 : 1 - (ph - 0.4) / 0.6, expr: "stern" }); } } },
  // 14c "criavam animais" — a boy leads a horse past the fence, chickens peck
  { t0: 86.38, fade: 0.15, L: () => plat("o26", "day", { fence: 6 }), lite: DAY, cam: mv([-1, 1.2, -4, 38], [1.2, 1.2, -4, 38]),
    act: (A, lt) => { const x = -3.2 + lt * 1.3; A.sp("cavalo", x, 0.02 * Math.abs(Math.sin(lt * 5)), 5.2); walkS(A, crianca(5, 2), 250, lt, -1.4, 4.6, 1.3, { expr: "smile" });
      A.fx(2.5, (g, c) => { for (let i = 0; i < 5; i++) { const [sx, sy, s] = P(c, -2 + i * 0.8 + Math.sin(lt + i) * 0.1, 0.18 + Math.abs(Math.sin(lt * 6 + i)) * 0.04, 2.4); g.fillStyle = i % 2 ? "#f2ece0" : "#a8542a"; g.strokeStyle = "#241726"; g.lineWidth = 2; g.beginPath(); g.ellipse(sx, sy, 0.1 * s, 0.075 * s, 0, 0, 7); g.fill(); g.stroke(); g.fillStyle = "#c42a22"; g.beginPath(); g.arc(sx + 0.08 * s, sy - 0.07 * s, 0.022 * s, 0, 7); g.fill(); } }); } },
  // 14d "e sobreviviam com poucos recursos." — a woman shares a few beans from the pot among the children
  { t0: 87.53, fade: 0.15, L: () => sala("o27", "#7a5a40", { win: 1, winCol: "#ffe8c0", floor: ["#3a2618", "#4a3220"] }), lite: LAMP, cam: mv([0.6, 1.9, -2.8, 36, -60], [0, 1.85, -2.2, 32, -60]),
    act: (A, lt) => { A.sp("mesa", 0, 0, 1.8); A.sp("panela", 0, 0.78, 1.75, { sc: 0.6 }); A.a(mulher(5, 6), 260, 0.2, 2.3, { expr: "sad", look: 0, prop: ["bread", 0] }); A.a(crianca(6, 2), 261, -0.9, 1.6, { expr: "neutral", look: 0.5 }); A.a(crianca(7, 3), 262, 1.0, 1.5, { expr: "neutral", look: -0.5 }); } },
  // 15a "Muitos não possuíam documentos oficiais das terras," — an old man opens an empty chest: no papers
  { t0: 90.03, fade: 0.2, L: () => sala("o28", "#6a4e38", { win: 1, floor: ["#3a2618", "#4a3220"] }), lite: LAMP, cam: mv([0, 1.4, -2.3, 36], [0.1, 1.35, -1.5, 30]),
    act: (A, lt, u, T) => { A.a({ ...cab(4, 1), hair: "#d8d4cc", moustache: "#e8e4dc", hat: "hair" }, 270, 0, 1.9, { expr: T > 91.0 ? "sad" : "nervous", look: 0.2, armB: 1 }); A.sp("crate", 0.2, 0, 1.4, { sc: 0.8 });
      A.over((g) => STAMP(g, "SEM ESCRITURA", T - 91.5, VW * 0.7, VH * 0.25, "#8a1e16", 58)); } },
  // 15b "mas suas famílias ocupavam aquele território havia décadas." — three generations in front of the old house; crosses of the ancestors behind
  { t0: 92.38, fade: 0.25, L: () => plat("o29", "gold", { near: [[-10, 16, 22]] }), lite: GOLD, bloom: 0.8, cam: mv([2.5, 1.6, -4.4, 40], [-0.5, 1.6, -3.6, 38]),
    act: (A, lt, u, T) => { A.sp("rancho", 2, 0, 9); for (let i = 0; i < 4; i++) A.sp("cruz", -4 + i * 0.9, 0, 7 + i * 0.3, { sc: 0.45 });
      A.a({ ...cab(4, 1), hair: "#d8d4cc", moustache: "#e8e4dc", hat: "aba", cap: "#5a4a36" }, 270, -1.1, 3.2, { expr: "smile_closed" }); A.a(PAI, 11, 0, 3.0, { expr: "smile_closed" }); A.a(FILHO, 13, 0.9, 2.6, { expr: "smile" });
      A.over((g) => bigText(g, "DÉCADAS", T - 95.6, 1.3, VH * 0.18, 96)); } },
  // 16 "Tudo começou a mudar quando o Brasil decidiu expandir sua rede ferroviária." — rails laid toward the horizon, sledgehammers ring
  { t0: 96.99, fade: 0.25, L: () => plat("o30", "day", { dense: 0.6 }), lite: DAY, cam: path([[0, [0, 2.2, -6, 44, -40]], [1, [0, 1.6, -2, 42, -20]]]), kicks: [[98.25, 2]],
    act: (A, lt, u, T) => { railsZ(A, 0, -4, 90, 0.4 + u * 0.6);
      for (let i = 0; i < 6; i++) { const ph = ((lt * 1.6 + i * 0.37) % 1); A.s(OPER(i), 280 + i, i % 2 ? 1.6 : -1.6, 3 + i * 2.2, { mode: "swing", pose: ph < 0.45 ? ph / 0.45 : 1 - (ph - 0.45) / 0.55, expr: "stern" }, { flip: i % 2 === 1 }); }
      A.fx(1, (g, c) => { for (let i = 0; i < 6; i++) { const ph = ((lt * 1.6 + i * 0.37) % 1); if (ph > 0.42 && ph < 0.5) sparks(g, c, lt, i % 2 ? 0.8 : -0.8, 0.15, 3 + i * 2.2, i % 2 ? -1 : 1, 10, i); } }); } },
  // 17a "Uma empresa estrangeira chamada Brazil Railway Company," — a glossy company office in town, the sign goes up
  { t0: 101.51, fade: 0.2, L: () => cidade("o31", "day", ["#c8b89a", "#d8c8a8", "#b8a888"], 31), lite: DAY, cam: mv([0, 2.4, -7, 42, -20], [0, 2.0, -5, 38, -10]),
    act: (A, lt, u, T) => { panel(A, 9, (w) => { w.rect(-6, 0, 12, 5, "#e8dcc4", 3); for (const x of [-4.5, -1.5, 1.5, 4.5]) w.rect(x - 0.7, 0, 1.4, 3.2, "#d8ccb4", 2); w.rect(-5, 3.5, 10, 1.1, "#1e2a4a", 3); w.text("BRAZIL RAILWAY COMPANY", 0, 4.05, 0.62, "#e8c86a"); flagSpr(w); });
      A.a(EXEC, 300, -1.2, 3.5, { expr: "grin" }); A.a({ ...EXEC, tie: "#7a1e1a", hat: "tophat" }, 301, 1.0, 3.8, { expr: "smile" });
      A.over((g) => bigText(g, "BRAZIL RAILWAY COMPANY", T - 103.4, 2.4, VH * 0.82, 76)); } },
  // 17b "ligada ao empresário norte-americano Percival Farquhar," — Farquhar in his office, stars and stripes behind
  { t0: 104.48, fade: 0.2, L: () => sala("o32", "#4a3a34", { frames: 2, panel: "#2a1e18", curtain: "#5a1e1a", win: 1, winCol: "#dfe6ea" }), lite: LAMP, cam: mv([0.4, 1.65, -2.6, 36], [0, 1.7, -1.6, 30]),
    act: (A, lt, u, T) => { flag(A, "us", 1.8, 2.6, 3.0, 1.4, 0.9, { wind: 0.3 }); A.a(FARQUHAR, 310, 0, 2.0, { expr: "grin", look: 0 }); A.over((g) => caption(g, "PERCIVAL FARQUHAR · EMPRESÁRIO NORTE-AMERICANO", T - 107.0, 3.6)); } },
  // 17c "recebeu concessões" — the pen signs the concession
  { t0: 107.83, fade: 0.15, L: () => sala("o33", "#3a2a24"), lite: LAMP, cam: mv([0, 0.6, -2.2, 34, -340], [0, 0.55, -1.8, 30, -340]),
    act: (A, lt, u, T) => signing(A, (T - 108.4) / 1.6, { y: -1.5, z: 3, seed: 12, title: "CONCESSÃO", sub: "ESTRADA DE FERRO SÃO PAULO – RIO GRANDE", sleeve: "#26242c" }) },
  // 17d "para construir uma ferrovia que atravessaria a região." — on the map, the line is drawn across the Contestado
  { t0: 110.13, fade: 0.2, L: () => mapaSul("o34", MST.olive), lite: { sa: 0 }, cam: mv([-1, -0.3, -20, 40], [-1.6, -0.8, -15, 40]),
    act: (A, lt, u, T) => { hlSul(A, CONTEST, 1, "#b3221c", 0.22, true); rota(A, [-51.1, -26.2, -51.2, -26.6, -51.3, -27.0, -51.6, -27.4, -51.9, -27.9], (T - 110.3) / 1.6, "#2a2a2a", 0.22);
      marca(A, -51.1, -26.2, T - 110.3, "UNIÃO DA VITÓRIA", { col: "#2a2a2a" }); marca(A, -51.9, -27.9, T - 111.9, "MARCELINO RAMOS", { col: "#2a2a2a" }); } },
  // 18 "A promessa era levar desenvolvimento ao interior do país." — the first train arrives, people cheer and wave flags
  { t0: 112.62, fade: 0.25, L: () => plat("o35", "gold", { near: [[14, 16, 20]] }), lite: GOLD, bloom: 0.9, cam: path([[0, [-6, 1.8, -6, 42]], [1, [2, 1.6, -5, 40]]]),
    act: (A, lt, u, T) => { railsX(A, 9, -40, 40); const x = lerp(-30, -2, easeOut(clamp(lt / 3.2))); train(A, x, 9, { vel: 4 * (1 - clamp(lt / 3.2)), wagons: ["wagonT", "wagonCar"] });
      crowd(A, 12, -6, 6, 3, 5.5, 7, (i) => ({ expr: i % 2 ? "laugh" : "smile", look: -0.6, prop: i % 4 === 0 ? ["flag", 0] : undefined, armB: i % 3 === 0 ? 1 : undefined }), (i) => (i % 3 === 2 ? mulher(i, 7) : cab(i, 7)));
      A.fx(4, (g, c) => flutter(g, c, lt, { n: 40, x0: -6, x1: 6, z0: 2, z1: 6, top: 5, cols: ["#2e8a4a", "#f2d22a", "#f2efe6"], size: 0.12, fall: 1.2, loop: true, seed: 3 })); } },
  // 19 "Mas havia um detalhe que teria consequências devastadoras." — the contract, close: one clause glows red
  { t0: 116.56, fade: 0.25, L: () => sala("o36", "#2a201c"), lite: LAMP, cam: mv([0, 1.5, -1.4, 34], [0.1, 1.55, -0.8, 28]), mood: ["#a08070", 0.25],
    act: (A, lt, u, T) => { panel(A, 1.2, (w) => { w.rect(-0.75, 0.6, 1.5, 1.9, "#efe4c6", 3); w.text("CONCESSÃO", 0, 2.3, 0.12, "#2a2018"); for (let k = 0; k < 14; k++) w.line([[-0.6, 2.12 - k * 0.1], [k % 4 === 3 ? 0.1 : 0.6, 2.12 - k * 0.1]], 1.6, "#8a8274");
      const k = clamp((T - 117.3) / 0.6); w.rect(-0.66, 1.42, 1.32, 0.17, `rgba(200,40,30,${0.25 * k})`, 0); w.text("15 KM DE TERRA DE CADA LADO DOS TRILHOS", 0, 1.5, 0.062, k > 0.2 ? "#a8181a" : "#5a5248"); });
      A.light((g) => { const k = clamp((T - 117.3) / 0.6); const [sx, sy, s] = P(A.cam, 0, 1.5, 1.2); glow(g, sx, sy, 1.2 * s, "rgba(255,80,60,1)", 0.25 * k); }); } },
  // 20 "A empresa recebeu grandes extensões de terras próximas aos trilhos." — on the map, a wide band swells either side of the line
  { t0: 120.43, fade: 0.2, L: () => mapaSul("o37", MST.olive), lite: { sa: 0 }, cam: mv([-1.6, -0.8, -15, 40], [-1.7, -0.9, -11, 40]),
    act: (A, lt, u, T) => { const k = easeOut(clamp((T - 121.2) / 2.0)), line = [-51.1, -26.2, -51.2, -26.6, -51.3, -27.0, -51.6, -27.4, -51.9, -27.9], wd = 0.14 * k * 2.2;
      A.fx(-0.06, (g, c) => { g.save(); g.lineCap = "round"; g.lineJoin = "round"; g.strokeStyle = "rgba(200,60,40,0.45)"; const s = P(c, 0, 0, 0)[2]; g.lineWidth = wd * s * 2; g.beginPath(); for (let i = 0; i < line.length; i += 2) { const [x, y] = P(c, (line[i] + 51) * 2, (line[i + 1] + 26.5) * 2, 0); i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); g.restore(); });
      rota(A, line, 1, "#2a2a2a", 0.22); A.over((g) => bigText(g, "15 KM + 15 KM", T - 122.0, 2.2, VH * 0.82, 84, "#ffe0c0", undefined, "255,90,60")); } },
  // 21a "E, com isso, muitos moradores começaram a perder o direito" — an eviction notice is nailed in front of a house; the family reads it
  { t0: 124.74, fade: 0.2, L: () => plat("o38", "grey", { near: [[-9, 14, 18]] }), lite: GREY, kicks: [[125.6, 3], [126.2, 3]], cam: mv([1.6, 1.5, -3.6, 38], [0.6, 1.5, -2.6, 34]),
    act: (A, lt, u, T) => { A.sp("casa", -1, 0, 8); A.sp("aviso", 1.0, 0, 2.6); A.a(VAQ(2), 320, 2.2, 3.0, { expr: "grin", look: -1, prop: ["hammer", T < 126.4 ? ((T * 3) % 1 > 0.5 ? 1 : 0) : 0] }); A.a(EXEC, 321, 3.2, 3.8, { expr: "stern", look: -1, prop: ["paper", 0] });
      A.a(cab(6, 3), 322, -0.5, 3.2, { expr: T > 127.4 ? "shock" : "nervous", look: 1 }); A.a(mulher(6, 3), 323, -1.4, 3.6, { expr: "fear", look: 1 }); } },
  // 21b "de permanecer em lugares onde suas famílias sempre viveram." — the grandmother refuses to leave the porch, rosary in hand
  { t0: 128.68, fade: 0.25, L: () => plat("o39", "dusk", { near: [[10, 14, 18]] }), lite: BACK, bloom: 0.8, cam: mv([0, 1.3, -3.2, 36], [0.1, 1.35, -2.0, 28]),
    act: (A, lt) => { A.sp("casa", 0, 0, 4.4); A.a(AVO, 15, 0, 2.3, { expr: "sad", mode: "sit", look: 0, prop: ["letter", 0] }, { y: 0.25 }); A.light((g) => { sun(g, VW * 0.2, VH * 0.4, 28, "255,180,130"); rays(g, VW * 0.2, VH * 0.4, VW * 0.7, 0.12, "255,180,130", 16, lt); }); } },
  // 22a "Imagine a situação: pessoas que passaram a vida inteira trabalhando em uma pequena propriedade," — an old farmer works the land as the sun sets
  { t0: 132.37, fade: 0.25, L: () => plat("o40", "gold", { fields: true, fence: 9, near: [[-12, 18, 22]] }), lite: GOLD, bloom: 0.9, cam: path([[0, [3, 1.2, -5, 40]], [1, [-1, 1.4, -3.4, 36]]]),
    act: (A, lt) => { const ph = (lt * 1.1) % 1; A.s({ ...cab(4, 1), hair: "#d8d4cc", moustache: "#e8e4dc", hat: "palha" }, 330, 0, 3, { mode: "swing", pose: ph < 0.4 ? ph / 0.4 : 1 - (ph - 0.4) / 0.6, expr: "stern" }); A.sp("rancho", 5, 0, 12);
      A.light((g) => { sun(g, VW * 0.7, VH * 0.36, 32, "255,200,140"); rays(g, VW * 0.7, VH * 0.36, VW * 0.9, 0.18, "255,190,130", 20, lt); lensFlare(g, VW * 0.7, VH * 0.36, 0.5); }); } },
  // 22b "de repente, eram tratadas como invasoras de suas próprias casas." — the door bursts open, guns point at the family inside
  { t0: 138.53, tr: "punch", L: () => sala("o41", "#7a5a40", { win: 1, floor: ["#3a2618", "#4a3220"] }), lite: LAMP, kicks: [[139.0, 9]], cam: hand(mv([0, 1.4, -2.6, 38], [0, 1.4, -2.2, 36]), 0.03),
    act: (A, lt, u, T) => { A.a(PAI, 11, -0.8, 2.4, { expr: T > 139.1 ? "shock" : "neutral", look: 1, armB: T > 139.1 ? 1 : 0 }); A.a(MAE, 12, 0.2, 2.7, { expr: T > 139.1 ? "fear" : "smile_closed", look: 1, prop: ["baby", 0] }); A.a(FILHO, 13, -0.2, 2.1, { expr: T > 139.1 ? "fear" : "smile", look: 1 });
      if (T > 139.0) { A.a(VAQ(0), 340, 1.7, 1.5, { expr: "shout", look: -1, facing: -1, prop: ["pistol", 0] }); A.a(VAQ(1), 341, 2.6, 2.1, { expr: "stern", look: -1, facing: -1 }); }
      A.over((g) => STAMP(g, "INVASORES?", T - 140.5, VW * 0.3, VH * 0.22, "#c42a22", 64)); } },
  // 23 "Mas a situação ficou ainda pior quando a construção da ferrovia terminou." — the last spike: hammer, sparks, flash
  { t0: 142.67, fade: 0.2, L: () => plat("o42", "day", { dense: 0.5 }), lite: DAY, kicks: [[145.95, 8]], cam: mv([0.3, 1.0, -3.2, 36, 0], [0.2, 0.9, -2.6, 32, 0]),
    act: (A, lt, u, T) => { railsX(A, 2.6, -12, 12); const sw = T < 145.95 ? clamp((T - 144.9) / 1.0) : 1 - clamp((T - 145.95) / 0.3); A.s(OPER(2), 350, -0.7, 2.6, { mode: "swing", pose: T < 145.95 ? sw * 0.2 : 1, expr: T > 145.95 ? "grin" : "stern" });
      A.fx(2.5, (g, c) => { const k = T - 145.95; if (k > 0 && k < 1) sparks(g, c, k, 0, 0.2, 2.5, 1, 30, 4); if (k > 0 && k < 0.2) { const [sx, sy, s] = P(c, 0, 0.2, 2.5); glow(g, sx, sy, 2 * s, "rgba(255,240,200,1)", 1 - k / 0.2); } }); } },
  // 24 "Milhares de trabalhadores contratados para construir os trilhos ficaram desempregados." — the train leaves without them; tools are dropped in the dust
  { t0: 146.94, fade: 0.2, L: () => plat("o43", "grey", { dense: 0.6 }), lite: GREY, kicks: [[150.85, 3]], cam: path([[0, [0, 1.8, -7, 42]], [1, [0, 3.5, -10, 46, -40]]]),
    act: (A, lt, u, T) => { railsX(A, 14, -60, 60); train(A, lerp(-4, 30, easeIn(clamp(lt / 4))), 14, { vel: 5 * clamp(lt / 3), wagons: ["wagonT"] });
      for (let i = 0; i < 18; i++) { const drop = T > 150.85 + (i % 5) * 0.08; A.a(OPER(i), 360 + i, -7 + (i % 9) * 1.7, 4 + Math.floor(i / 9) * 1.8, { expr: drop ? "sad" : "nervous", look: 0.8, prop: drop ? undefined : i % 2 ? ["shovel", 0] : ["hammer", 0] }); }
      A.fx(3.9, (g, c) => { for (let i = 0; i < 18; i++) { const k = T - 150.85 - (i % 5) * 0.08; if (k < 0) continue; const [hy] = bounce(k, 0.9, 0, 0.3), [sx, sy, s] = P(c, -7 + (i % 9) * 1.7 + 0.3, Math.max(0.02, hy), 4 + Math.floor(i / 9) * 1.8 - 0.1); g.strokeStyle = "#4a3a2a"; g.lineWidth = 0.05 * s; g.beginPath(); g.moveTo(sx - 0.3 * s, sy); g.lineTo(sx + 0.3 * s, sy - 0.04 * s); g.stroke(); } }); } },
  // 25 "Muitos não tinham dinheiro, emprego ou qualquer perspectiva de futuro." — a worker in the rain turns out empty pockets on the rails
  { t0: 152.21, fade: 0.25, L: () => plat("o44", "storm", { dense: 0.5 }), lite: COLD, wx: ["rain", 260, 0.45], cam: mv([0, 1.2, -2.8, 36], [0.2, 1.25, -2.0, 30]), mood: ["#7a8494", 0.25],
    act: (A, lt, u, T) => { railsX(A, 2.6, -12, 12); A.a(OPER(3), 370, 0, 2.2, { expr: "sad", look: 0, armB: T > 153.0 ? 1 : 0, mode: "sit", crouch: 0.5 }, { y: 0.12 }); A.a(OPER(4), 371, 2.2, 3.6, { expr: "sad", look: -0.6 }); } },
  // 26a "Ao mesmo tempo, uma madeireira ligada ao grupo empresarial, a Southern Brazil Lumber," — the sawmill, its chimney smoking, logs everywhere
  { t0: 156.61, fade: 0.25, L: () => plat("o45", "day", { dense: 0.5, kind: "mud" }), lite: DAY, cam: path([[0, [-8, 3, -14, 44, -30]], [1, [2, 2.4, -10, 42, -20]]]),
    act: (A, lt, u, T) => { A.sp("serraria", 0, 0, 20); A.fx(20.1, (g, c) => smokeCol(g, c, lt, 8.2, 11.6, 20, { h: 20, w: 2, col: [80, 76, 74], a: 0.7, wind: 0.4 })); A.sp("toras", -9, 0, 12); A.sp("toras", 7, 0, 13); A.sp("toras", 10, 0, 14.5);
      for (let i = 0; i < 6; i++) walkS(A, OPER(i + 5), 380 + i, lt, -10 + i * 3.4, 9 + (i % 2) * 1.5, i % 2 ? 1.1 : -1.1, { expr: "stern" });
      A.over((g) => bigText(g, "SOUTHERN BRAZIL LUMBER", T - 160.7, 2.6, VH * 0.18, 80)); } },
  // 26b "começou a explorar as florestas da região." — flying over the endless araucaria forest, smoke from the mill on the horizon
  { t0: 161.58, fade: 0.25, L: () => plat("o46", "day", { dense: 2.2 }), lite: DAY, cam: path([[0, [-6, 10, -20, 48, -200]], [1, [6, 7, -12, 46, -140]]]),
    act: (A, lt) => { for (let i = 0; i < 14; i++) A.fx(10 + i * 3, (g, c) => { /* forest belts drawn as layers */ void g; void c; });
      A.fx(60, (g, c) => smokeCol(g, c, lt, 14, 4, 60, { h: 40, w: 4, col: [90, 86, 84], a: 0.6, wind: 0.5 })); A.fx(30, (g, c) => birds(g, c, lt, 7, -10, 12, 30, 2.5, "#2a2a2a", 5, 0.5)); } },
  // 27a "Árvores eram derrubadas em grande escala," — an araucaria falls, its crown sweeping down; others fall behind
  { t0: 164.92, fade: 0.2, L: () => plat("o47", "day", { dense: 0.8, kind: "mud" }), lite: DAY, kicks: [[166.4, 8], [167.0, 4]], cam: path([[0, [2, 2.2, -8, 46, -40]], [1, [0.5, 1.8, -7, 44, -20]]]),
    act: (A, lt, u, T) => { const fallT = (t0: number) => { const k = clamp((T - t0) / 1.1); return (Math.PI / 2) * k * k; };
      for (const [x, z, t0, h] of [[-1, 6, 165.3, 18], [-8, 14, 165.9, 20], [6, 16, 166.5, 22]] as [number, number, number, number][]) {
        panel(A, z, (w) => { araucariaSmall(w, x, h); }, { pivot: [x, 0], rot: -fallT(t0) }); A.sp("toco", x, 0, z - 0.05, { sc: 0.8 });
        A.fx(z - 0.1, (g, c) => { const k = T - t0 - 1.1; if (k < 0 || k > 2) return; for (let i = 0; i < 10; i++) { const [sx, sy, s] = P(c, x + 3 + i * 1.2, 0.4 + k * 1.2, z); puff(g, sx, sy, (0.6 + k) * s, [180, 160, 130], 0.5 * (1 - k / 2)); } }); }
      const ph = (lt * 1.8) % 1; A.s(OPER(8), 390, -2.4, 4.8, { mode: "swing", pose: T < 165.3 ? (ph < 0.5 ? ph * 2 : 2 - ph * 2) : 0, expr: T > 165.4 ? "shock" : "stern" }); } },
  // 27b "a madeira era transportada para longe" — a log train runs across the frame, the camera tracking alongside
  { t0: 167.28, fade: 0.15, tr: "whip", L: () => plat("o48", "day", { dense: 0.7 }), lite: DAY, cam: (u, lt) => ({ x: 4 + lt * 3, y: 2.4, z: -16, fov: 44, shift: -10 }),
    act: (A, lt) => { railsX(A, 6, -20, 120); train(A, -2 + lt * 8, 6, { vel: 8, wagons: ["vagaoToras", "vagaoToras", "vagaoToras", "vagaoToras"] }); } },
  // 27c "e os antigos moradores assistiam à transformação de suas terras." — the old family stands on the hill above a field of stumps
  { t0: 170.28, fade: 0.25, L: () => plat("o49", "grey", { dense: 0.15, kind: "mud" }), lite: GREY, cam: path([[0, [-1.5, 1.4, -4, 38]], [1, [1.5, 2.2, -6, 42, -40]]]), mood: ["#a0a0a8", 0.2],
    act: (A, lt) => { for (let i = 0; i < 26; i++) A.sp("toco", -16 + (i % 13) * 2.6 + hash(i) * 1.2, 0, 6 + Math.floor(i / 13) * 6 + hash(i + 3) * 3, { sc: 0.9 });
      A.a(cab(4, 4), 400, -0.8, 2.3, { expr: "sad", look: 0 }); A.a(mulher(4, 4), 401, 0.2, 2.5, { expr: "sad", look: 0 }); A.a(crianca(2, 4), 402, 1.0, 2.2, { expr: "sad", look: -0.3 });
      A.fx(6, (g, c) => flutter(g, c, lt, { n: 20, x0: -8, x1: 8, z0: 3, z1: 8, top: 4, cols: ["#8a6a3a", "#6a5a3a"], size: 0.12, fall: 0.6, wind: 0.8, loop: true, seed: 4 })); } },
  // 28 "A revolta crescia." — torches at dusk, angry faces, the camera pushes in
  { t0: 174.62, fade: 0.2, tr: "punch", L: () => plat("o50", "dusk", { near: [[-7, 10, 16]] }), lite: NIGHTFIRE, bloom: 1.0, cam: mv([0, 1.6, -4, 38], [0.2, 1.7, -2.4, 30]),
    act: (A, lt) => { for (let i = 0; i < 7; i++) A.a(cab(i, 11), 410 + i, -2.6 + i * 0.9, 2.2 + (i % 2) * 0.9, { expr: i % 2 ? "shout" : "stern", prop: i % 2 ? ["torch", 0] : ["fist", 1], look: 0 });
      A.fx(1.5, (g, c) => embers(g, c, lt, 0, 3, 6, 40, 5, 9)); } },
  // 29 "Mas aquelas pessoas não tinham influência política nem condições de enfrentar os grandes empresários." — a caboclo, hat in hand, at the gate; guards bar the way, the bosses laugh at the window
  { t0: 176.60, fade: 0.25, L: () => cidade("o51", "grey", ["#b8a890", "#c8b8a0", "#a89880"], 41), lite: GREY, cam: path([[0, [-2, 1.4, -3.4, 38]], [1, [0.5, 2.4, -5, 40, -20]]]),
    act: (A, lt, u, T) => { panel(A, 6, (w) => { w.rect(-4, 0, 8, 6, "#d8ccb4", 3); w.rect(-1.2, 3.6, 2.4, 1.4, "#ffe8b0", 2.5); w.rect(-3.5, 5.0, 7, 0.8, "#1e2a4a", 2.5); w.text("COMPANHIA", 0, 5.4, 0.42, "#e8c86a"); });
      A.a(FARQUHAR, 420, -0.4, 6.1, { expr: "laugh" }, { y: 3.25, sc: 0.7, shadow: 0, noCast: true }); A.a(EXEC, 421, 0.5, 6.1, { expr: "laugh" }, { y: 3.25, sc: 0.7, shadow: 0, noCast: true });
      A.a(VAQ(1), 422, -1.6, 3.3, { expr: "stern", look: 1, facing: 1 }); A.a(VAQ(2), 423, 1.6, 3.3, { expr: "stern", look: -1, facing: -1 });
      A.a({ ...cab(3, 2), hat: "hair" }, 424, 0, 1.8, { expr: "sad", look: 0, prop: ["portfolio", 0] }); } },
];
// helpers drawn inside panels (world painter)
const flagSpr = (w: { rect: (...a: never[]) => void }) => { void w; };
const araucariaSmall = (w: import("./engine").WP, x: number, h: number) => {
  w.poly([[x - h * 0.025, 0], [x + h * 0.025, 0], [x + h * 0.015, h * 0.86], [x - h * 0.015, h * 0.86]], w.vgrad(0, h, "#3a2618", "#6a4a30"), 2);
  for (let i = 0; i < 8; i++) { const k = (i / 7) * 2 - 1, len = h * (0.16 + 0.12 * (1 - Math.abs(k))), by = h * 0.86 - h * 0.1 * (1 - Math.abs(k)), ex = x + k * len, ey = h * 0.9 + h * 0.05 * (1 - Math.abs(k));
    w.line([[x, by], [ex, ey]], Math.max(1.2, h * 0.08), "#3a2a1c"); w.ell(ex, ey + h * 0.02, h * 0.075, h * 0.035, "#2a4a2c", 2); w.ell(ex, ey + h * 0.035, h * 0.05, h * 0.02, "#3a6a3a", 0); }
};
