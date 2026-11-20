// "Quem foi Hitler?" — 16:9, 326 s. Cuts land on sentence starts measured from the narration (silencedetect + syllable rate).
import { Outfit, FrontOpts, SideOpts } from "./toon";
import { Cam, Ctx, VW, VH, P, Act, drawAct, drawLayer, drawGround, drawSprite, skyGrad, smokeCol, fire, boom, muzzle, beam, glow, weather, caption, bigText, stamp, post, tint,
  clamp, lerp, smooth, easeOut, hash, mk, puff } from "./engine";
import { loc, SPR, MX, MY } from "./paint";

export const DUR = 327.2;
export const FRAMES = Math.ceil(DUR * 30);

// ---------------- cast ----------------
const HY: Outfit = { jacket: "#2e2a27", pants: "#25211e", boots: "#181412", hat: "sidepart", hair: "#2a1d16", tie: "#2a2420" };
const HS: Outfit = { ...HY, jacket: "#4a3e30", pants: "#3a3026", moustache: "#1e1612", mstyle: "brush" };
const HA: Outfit = { jacket: "#6e5a3e", pants: "#5e4c34", boots: "#161210", hat: "sidepart", hair: "#2a1d16", moustache: "#1e1612", mstyle: "brush", buttons: "#c9a24a", tie: "#2a2420", sash: "#3a2a1c" };
const HW: Outfit = { jacket: "#6a7060", pants: "#5a6052", boots: "#1e1a16", hat: "stahlhelm", rifle: true, moustache: "#2a1d16", mstyle: "brush", sash: "#3a2a1c" };
const HIN: Outfit = { jacket: "#4a5244", pants: "#3e463a", boots: "#141414", hat: "hair", hair: "#e8e6e0", moustache: "#f0efea", build: "stout", medals: true, buttons: "#c9a24a", sash: "#2a2a24" };
const GER: Outfit = { jacket: "#5e665a", pants: "#4e5650", boots: "#1a1816", hat: "stahlhelm", rifle: true, sash: "#2a2420" };
const GERN: Outfit = { ...GER, rifle: false };
const ALLY: Outfit = { jacket: "#8a7a4e", pants: "#6e6440", boots: "#5a4028", hat: "m1", rifle: true, sash: "#4a3a24" };
const SOV: Outfit = { jacket: "#7a7046", pants: "#6a6240", boots: "#2a2018", hat: "pilotka", hair: "#4a3a2a", rifle: true, sash: "#4a3420" };
const POL: Outfit = { jacket: "#2e4060", pants: "#26344c", boots: "#141414", hat: "cap", cap: "#26344c", rifle: true };
const SA: Outfit = { jacket: "#7a6440", pants: "#3e3226", boots: "#1a1614", hat: "cap", cap: "#6a5634", rifle: true, sash: "#2a2018" };
const SAN: Outfit = { ...SA, rifle: false };
const JF: Outfit = { jacket: "#3a2e26", pants: "#2a2420", boots: "#1a1614", hat: "homburg", hair: "#2a1d16", beard: "#2a1d16", moustache: "#2a1d16", glasses: true, star: true, tie: "#4a2a20" };
const JM: Outfit = { jacket: "#7a2e2a", pants: "#7a2e2a", boots: "#2a1e18", hat: "longhair", hair: "#6a4028", dress: "#7a2e2a", star: true };
const JG: Outfit = { jacket: "#3e5a8a", pants: "#3e5a8a", boots: "#1e1a16", hat: "longhair", hair: "#6a4028", dress: "#3e5a8a", build: "kid", star: true };
const KLARA: Outfit = { jacket: "#5a4a6a", pants: "#5a4a6a", boots: "#2a1e18", hat: "longhair", hair: "#4a3020", dress: "#5a4a6a" };
const READER: Outfit = { jacket: "#c0603a", pants: "#3a4a6a", boots: "#2a2a2a", hat: "longhair", hair: "#5a3a22", build: "kid" };
const CIVS: Outfit[] = [0, 1, 2, 3, 4, 5, 6, 7].map((v) => {
  const j = ["#5a4a3a", "#4a4a52", "#6a5a48", "#3e3a36", "#5e5446", "#4e4232", "#6a6458", "#3a3a40"][v];
  if (v === 2 || v === 6) return { jacket: j, pants: j, boots: "#2a1e18", hat: "longhair", hair: ["#8a5a32", "#4a3020"][v % 2], dress: ["#7a5a6a", "#5a6a7a"][v % 2] };
  return { jacket: j, pants: "#2e2a28", boots: "#1e1a16", hat: v % 3 === 0 ? "fedora" : "hair", hair: ["#3a2a1e", "#6a4a2a", "#2a2420", "#8a6a4a"][v % 4], tie: v % 2 ? "#5a2a24" : undefined, moustache: v === 1 || v === 5 ? "#3a2a1e" : undefined };
});
const civ = (i: number) => CIVS[i % CIVS.length];

// ---------------- life ----------------
const lid = (t: number, i: number) => { const per = 2.4 + 1.6 * hash(i), k = Math.floor(((t + hash(i + 3) * per) % per) * 30); return k < 4 ? [0.5, 1, 1, 0.5][k] : 0; };
type FO = FrontOpts; type SO = SideOpts;

// ---------------- scene accumulator ----------------
type Item = { z: number; d: () => void };
class Sc {
  items: Item[] = []; overs: ((g: Ctx) => void)[] = []; lights: ((g: Ctx) => void)[] = [];
  constructor(public g: Ctx, public cam: Cam, public t: number) {}
  a(o: Outfit, id: number, x: number, z: number, f: FO = {}, extra: Partial<Act> = {}) { const t = this.t; this.items.push({ z, d: () => drawAct(this.g, this.cam, { o, id, x, z, f: { mode: "stand", blink: lid(t, id), ...f }, ...extra }) }); }
  s(o: Outfit, id: number, x: number, z: number, so: SO = {}, extra: Partial<Act> = {}) { const t = this.t; this.items.push({ z, d: () => drawAct(this.g, this.cam, { o, id, x, z, side: true, s: { mode: "stand", blink: lid(t, id), ...so }, ...extra }) }); }
  sp(k: string, x: number, y: number, z: number, o: Parameters<typeof drawSprite>[6] = {}) { this.items.push({ z, d: () => drawSprite(this.g, this.cam, SPR[k], x, y, z, o) }); }
  fx(z: number, d: (g: Ctx, c: Cam) => void) { this.items.push({ z, d: () => d(this.g, this.cam) }); }
  over(d: (g: Ctx) => void) { this.overs.push(d); }
  light(d: (g: Ctx) => void) { this.lights.push(d); }
}
/** front walker between two points over [t0, t1] (seconds, shot-local), stroll phase from distance */
const walkF = (A: Sc, o: Outfit, id: number, lt: number, t0: number, t1: number, p0: [number, number], p1: [number, number], f: FO = {}, extra: Partial<Act> = {}) => {
  const k = clamp((lt - t0) / (t1 - t0)), x = lerp(p0[0], p1[0], k), z = lerp(p0[1], p1[1], k), d = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]) * k;
  A.a(o, id, x, z, { mode: k > 0 && k < 1 ? "stroll" : "stand", phase: Math.round(((d / 1.5) % 1) * 24) / 24, ...f }, extra);
};
/** side walker: x = x0 + v*lt, faces screen-right for v > 0 */
const walkS = (A: Sc, o: Outfit, id: number, lt: number, x0: number, z: number, v: number, so: SO = {}, extra: Partial<Act> = {}) => {
  const x = x0 + v * lt, ph = Math.round(((Math.abs(v * lt) / 1.6 + hash(id) ) % 1) * 24) / 24;
  A.s(o, id, x, z, { mode: "march", phase: ph, stride: Math.min(1.1, Math.abs(v) / 1.5), ...so }, { flip: v < 0, ...extra });
};
const crowd = (A: Sc, n: number, x0: number, x1: number, z0: number, z1: number, seed: number, f: (i: number) => FO = () => ({}), pick: (i: number) => Outfit = civ, extra: Partial<Act> = {}) => {
  for (let i = 0; i < n; i++) { const x = lerp(x0, x1, hash(seed + i * 7.1)), z = lerp(z0, z1, hash(seed + i * 3.7)); A.a(pick(i), 100 + i + seed, x, z, f(i), extra); }
};
const C = (x: number, y: number, z: number, fov = 42, shift = 0): Cam => ({ x, y, z, fov, shift });
const mv = (a: number[], b: number[], ease = smooth) => (u: number): Cam => { const k = ease(u); return C(lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k), lerp(a[3] ?? 42, b[3] ?? a[3] ?? 42, k), lerp(a[4] ?? 0, b[4] ?? a[4] ?? 0, k)); };

// ---------------- shots ----------------
type Shot = { t0: number; t1?: number; L: string; v?: string; cam: (u: number, lt: number) => Cam; act?: (A: Sc, lt: number, u: number, T: number) => void; fade?: number; mood?: [string, number]; wx?: ["rain" | "snow" | "ash" | "dust", number, number] };
const searchlights = (A: Sc, lt: number, n = 5, z = 58, a = 0.2) => { for (let i = 0; i < n; i++) { const x = -40 + (80 * i) / (n - 1); A.fx(z, (g, c) => beam(g, c, x, 0, z, -Math.PI / 2 + 0.35 * Math.sin(lt * 0.5 + i * 1.7), 70, 4, a)); } };
const torchGlow = (A: Sc, x: number, z: number, lt: number, id: number) => A.fx(z - 0.01, (g, c) => { const [sx, sy, s] = P(c, x + 0.36, 2.02, z); glow(g, sx, sy, 1.3 * s * (1 + 0.1 * Math.sin(lt * 17 + id)), "rgba(255,150,60,0.9)", 0.75); });
const wall = (A: Sc, lt: number, h = 9) => A.fx(55, (g, c) => { for (const x of [-26, -12, 0, 12, 26]) fire(g, c, lt, x, h, 54, 2.2, x + 40); for (const x of [-20, 6, 20]) smokeCol(g, c, lt, x, h + 2, 54.5, { h: 30, w: 4, n: 16, seed: x, col: [30, 26, 28] }); });
const stamps = (A: Sc, lt: number, txt: string, at: number[], pos: [number, number][], size = 120) => A.over((g) => at.forEach((t, i) => stamp(g, txt, lt - t, pos[i][0], pos[i][1], i % 2 ? 0.12 : -0.16, size)));
const marchCol = (A: Sc, o: Outfit, lt: number, n: number, x0: number, z: number, v: number, gap = 1.25, rows = 1, rowGap = 1.1, dark = 0) => {
  for (let r = 0; r < rows; r++) for (let i = 0; i < n; i++) walkS(A, o, 40 + i + r * 30, lt, x0 - Math.sign(v) * i * gap, z + r * rowGap, v, {}, dark ? { dark } : {});
};

const SH: Shot[] = [
  // 0 "Quem foi Hitler? O homem que levou uma nação ao abismo."
  { t0: 0, L: "berlin", v: "night,banners", cam: mv([0, 1.25, -4.4, 40], [0, 1.45, -8.5, 44]), act: (A, lt) => {
    A.a(HA, 1, 0, 0.6, { expr: "stern", look: 0 }, { dark: 0.25 });
    marchCol(A, GER, lt, 14, -14, 9, 1.4, 1.3, 2, 1.2, 0.35);
    searchlights(A, lt, 6, 60, 0.18);
    A.light((g) => tint(g, "#5a1a20", 0.25, "multiply"));
    A.over((g) => { bigText(g, "QUEM FOI HITLER?", lt - 0.1, 1.7, VH * 0.24, 120); bigText(g, "O homem que levou", lt - 1.8, 3.2, VH * 0.2, 76, "#f4ead6", "uma nação ao abismo"); });
  } },
  // 2 "Imagine um homem que nasceu em uma pequena cidade da Áustria e sonhava em se tornar artista."
  { t0: 5.03, L: "austria", fade: 0.6, cam: mv([-7, 2.6, -12, 46, -120], [0.6, 1.3, -3.6, 40, 0]), act: (A, lt) => {
    A.sp("easel", 0.15, 0, 3.2); A.a(HY, 2, 0.95, 3.4, { expr: "neutral", facing: -1, look: -1, prop: ["brush", 0], hip: -2 }, {});
    walkF(A, civ(1), 3, lt, 0, 6, [-9, 9], [-2, 9.4]); walkF(A, civ(2), 4, lt, 0, 6, [8, 10], [3, 10.2]); walkF(A, civ(5), 5, lt, 0, 6, [-4, 11], [5, 11]);
    A.over((g) => caption(g, "ÁUSTRIA · FIM DO SÉCULO XIX", lt - 0.4, 3.4));
  } },
  // 3a "Anos depois, esse homem estaria no comando de uma das maiores máquinas de guerra da história,"
  { t0: 11.02, L: "field", v: "dusk", fade: 0.4, cam: mv([-3, 0.9, -9, 44], [3, 1.2, -11, 44]), act: (A, lt) => {
    for (let i = 0; i < 4; i++) A.sp("tank", -16 + i * 9 + lt * 2.2, 0, 10 + i * 2.5, {});
    for (let i = 0; i < 5; i++) A.sp("plane", -30 + i * 7 + lt * 9, 22 + (i % 2) * 3, 60 + i * 4, {});
    for (let i = 0; i < 4; i++) { const at = 0.6 + i * 1.4; A.fx(80, (g, c) => boom(g, c, lt - at, -20 + i * 13, 0, 80, 4, i)); }
    A.fx(70, (g, c) => { smokeCol(g, c, lt, -12, 0, 70, { h: 26, w: 4, seed: 3 }); smokeCol(g, c, lt, 18, 0, 75, { h: 30, w: 5, seed: 8 }); });
  } },
  // 3b "seria responsável por um dos regimes mais violentos que o mundo já conheceu"
  { t0: 17.36, L: "berlin", v: "banners,grey", cam: mv([0, 0.55, -5, 46, 60], [0, 0.7, -7.5, 46, 60]), act: (A, lt) => {
    for (let r = 0; r < 4; r++) for (let c = -2; c <= 2; c++) { const z = 3 + r * 1.7 - lt * 1.3; A.a(GER, 60 + r * 5 + c, c * 1.15, z + 6, { mode: "march", phase: ((lt * 1.3) / 1.6 + (r % 2) * 0.5) % 1, expr: "stern" }); }
  } },
  // 3c "e levaria a humanidade a uma guerra devastadora."
  { t0: 22.08, L: "ruins", cam: mv([0, 1.4, -6, 44], [0, 3.6, -10, 48, -140]), act: (A, lt) => {
    A.fx(30, (g, c) => { for (const x of [-14, -4, 9, 16]) fire(g, c, lt, x, 0, 26, 1.6, x + 60); smokeCol(g, c, lt, -10, 2, 28, { h: 22, w: 3.4, seed: 2 }); smokeCol(g, c, lt, 12, 2, 28, { h: 22, w: 3.4, seed: 5 }); });
    A.fx(40, (g, c) => boom(g, c, lt - 0.7, 3, 0, 40, 4, 9)); A.fx(40, (g, c) => boom(g, c, lt - 2.2, -12, 0, 44, 4, 4));
  }, wx: ["ash", 160, 0.6] },
  // 4 "Seu nome era Adolf Hitler."
  { t0: 25.83, L: "rally", cam: mv([0, 1.5, -3.6, 38], [0, 1.5, -3.0, 38]), act: (A, lt) => {
    A.a(HA, 1, 0, 1.0, { expr: "stern", look: 0 }); searchlights(A, lt, 6, 58, 0.22);
    A.light((g) => glow(g, VW * 0.5, VH * 0.25, VW * 0.5, "rgba(255,90,60,0.35)", 0.6));
    A.over((g) => bigText(g, "ADOLF HITLER", lt - 0.35, 2.6, VH * 0.84, 96, "#f4ead6", "1889 – 1945"));
  } },
  // 5 "Mas como alguém conseguiu conquistar o apoio de milhões de pessoas e transformar um país inteiro em uma ditadura?"
  { t0: 28.75, L: "rally", cam: mv([0, 2.4, 10.2, 46, -60], [0, 7.5, 6, 52, -330]), act: (A, lt) => {
    crowd(A, 170, -22, 22, 15, 52, 11, (i) => ({ expr: i % 3 ? "shout" : "grin", prop: i % 4 === 0 ? ["fist", 0] : undefined, wave: i % 4 === 1 ? Math.sin(lt * 5 + i) : undefined }), (i) => (i % 5 === 0 ? GERN : civ(i)), { dark: 0.3, darkCol: "#140a12" });
    A.a(HA, 1, -1.6, 11.6, { wave: Math.sin(lt * 3) }, { dark: 0.92 });
    searchlights(A, lt, 6, 58, 0.25);
  } },
  // 6 "Para entender essa história, precisamos voltar ao começo."
  { t0: 35.70, L: "austria", v: "dusk", fade: 0.5, cam: mv([0, 9, -16, 50, -300], [0, 1.6, -9, 44, 0], easeOut), act: (A, lt) => {
    A.light((g) => { tint(g, "#9a7a52", 0.35, "color"); for (let i = 0; i < 6; i++) { const y = hash(Math.floor(lt * 12) + i) * VH; g.fillStyle = "rgba(255,240,220,0.08)"; g.fillRect(0, y, VW, 2); } });
    A.over((g) => { const yr = Math.round(lerp(1945, 1889, smooth(clamp((lt - 0.2) / 3)))); bigText(g, String(yr), 0.5, 99, VH * 0.5, 190, "#f4ead6"); });
  } },
  // 7 "Adolf Hitler nasceu em 1889, na Áustria."
  { t0: 39.86, L: "austria", cam: mv([-2.5, 1.35, -5.5, 40], [-1.2, 1.3, -4.2, 38]), act: (A, lt) => {
    A.a(KLARA, 7, -1.3, 4.2, { expr: "smile_closed", prop: ["baby", 0], headTilt: 4 }); A.a(civ(1), 8, -0.1, 4.6, { expr: "smile" });
    walkF(A, civ(4), 9, lt, 0, 5, [4, 9.5], [-6, 9.5]);
    A.over((g) => caption(g, "BRAUNAU AM INN, ÁUSTRIA · 1889", lt - 0.3, 4));
  } },
  // 8 "Durante a juventude, sonhava em estudar artes,"
  { t0: 44.42, L: "vienna", fade: 0.5, cam: mv([3, 1.4, -6.5, 42], [1.2, 1.3, -4.8, 40]), act: (A, lt) => {
    A.sp("easel", -0.1, 0, 2.8); A.a(HY, 2, 0.75, 3.0, { expr: "smile", facing: -1, look: -1, prop: ["brush", 0], hip: -2 });
    walkF(A, civ(3), 11, lt, 0, 3, [-6, 9], [-1, 9]); walkF(A, civ(6), 12, lt, 0, 3, [6, 10], [2, 10]);
    A.over((g) => caption(g, "VIENA · 1907", lt - 0.2, 2.8));
  } },
  // 9 "mas foi rejeitado duas vezes pela Academia de Belas-Artes de Viena."
  { t0: 47.47, L: "vienna", cam: mv([0, 1.5, -5.2, 40], [0, 1.62, -2.6, 36]), act: (A, lt) => {
    A.a(HY, 2, 0, 1.2, { expr: lt > 0.6 ? "sad" : "neutral", prop: ["paper", 0], look: 0, headTilt: lt > 0.6 ? 5 : 0 });
    stamps(A, lt, "REJEITADO", [0.55, 1.25], [[VW * 0.3, VH * 0.36], [VW * 0.7, VH * 0.6]]);
    A.light((g) => tint(g, "#5a6a80", clamp((lt - 1.6) / 1.5) * 0.35, "multiply"));
  }, wx: ["rain", 260, 0.45] },
  // 10 "Depois de enfrentar dificuldades financeiras, mudou-se para a Alemanha."
  { t0: 52.01, L: "berlin", v: "grey", fade: 0.4, cam: (u, lt) => C(-4 + lt * 1.3 + 0.6, 1.3, -5.2, 42), act: (A, lt) => {
    walkS(A, HY, 2, lt, -4.6, 2.5, 1.3, { expr: "sad" }, {}); // suitcase is carried in the front card only; side walk reads as travelling
    walkF(A, civ(7), 13, lt, 0, 4.5, [6, 7], [-3, 7]);
    A.over((g) => caption(g, "MUNIQUE, ALEMANHA · 1913", lt - 0.5, 3.6));
  }, wx: ["rain", 120, 0.3] },
  // 11a "Quando começou a Primeira Guerra Mundial, em 1914,"
  { t0: 56.56, L: "berlin", v: "banners,dusk", cam: mv([-2, 1.1, -7, 44], [2, 1.3, -8, 44]), act: (A, lt) => {
    marchCol(A, GER, lt, 12, -10, 4, 1.5, 1.25, 2, 1.1);
    crowd(A, 22, -12, 12, 9, 11, 21, (i) => ({ expr: "grin", wave: Math.sin(lt * 6 + i) }));
    A.over((g) => caption(g, "1914 · PRIMEIRA GUERRA MUNDIAL", lt - 0.3, 3.4));
  } },
  // 11b "Hitler entrou para o Exército alemão e serviu como soldado."
  { t0: 60.43, L: "trench", cam: mv([-1.5, 1.35, -4.2, 42], [0, 1.45, -3.0, 40]), act: (A, lt) => {
    A.a(HW, 2, 0, 0.9, { expr: "stern", look: 0 }); A.a(GER, 21, -1.4, 1.2, { expr: "nervous" }); A.a(GER, 22, 1.5, 1.3, { expr: "stern", facing: -1 });
    for (let i = 0; i < 3; i++) { const at = 0.5 + i * 1.2; A.fx(22 + i * 6, (g, c) => boom(g, c, lt - at, -6 + i * 7, 0, 22 + i * 6, 2.4, i + 3)); }
    A.fx(30, (g, c) => smokeCol(g, c, lt, 4, 0, 30, { h: 14, w: 3, seed: 2, col: [60, 54, 50] }));
  } },
  // 12 "Mas a guerra terminou em derrota para a Alemanha."
  { t0: 64.40, L: "trench", fade: 0.5, mood: ["#6a6a72", 0.3], cam: mv([0, 1.2, -5, 42], [0, 1.4, -6.5, 42]), act: (A, lt) => {
    A.a(HW, 2, 0.2, 0.9, { mode: "sit", expr: "sad", headTilt: 6 }); A.a(GER, 21, -1.6, 1.0, { mode: "sit", expr: "sad" }); A.a(GERN, 23, 1.9, 1.2, { expr: "sad", prop: ["flag", lt * 2] });
    A.fx(30, (g, c) => { smokeCol(g, c, lt, -6, 0, 30, { h: 12, w: 3, seed: 6, col: [70, 66, 64], a: 0.6 }); smokeCol(g, c, lt, 8, 0, 34, { h: 12, w: 3, seed: 9, col: [70, 66, 64], a: 0.6 }); });
  } },
  // 13 "O país ficou profundamente abalado."
  { t0: 67.47, L: "berlin", v: "grey", cam: mv([1, 1.4, -6, 42], [-1, 1.3, -5, 42]), act: (A, lt) => {
    for (let i = 0; i < 5; i++) walkF(A, civ(i + 2), 30 + i, lt, 0, 4, [-5 + i * 2.6, 3 + i * 1.3], [-5 + i * 2.6 + (i % 2 ? 1 : -1), 1 + i * 1.3], { expr: "sad", headTilt: 5 });
  }, wx: ["rain", 200, 0.4] },
  // 14a "A economia entrou em crise, milhões de pessoas enfrentaram dificuldades"
  { t0: 70.31, L: "berlin", v: "grey,posters", cam: mv([-3, 1.3, -6, 42], [1, 1.3, -6.5, 42]), act: (A, lt) => {
    for (let i = 0; i < 9; i++) A.s(civ(i), 50 + i, -6 + i * 1.05, 4, { mode: "stand", expr: i % 2 ? "sad" : "neutral" });
    A.a(civ(2), 61, 1.5, 1.6, { expr: "sad", prop: ["paper", 0] });
    A.fx(0.5, (g, c) => { for (let i = 0; i < 26; i++) { const k = (lt * 0.35 + hash(i)) % 1, x = -6 + 12 * k + Math.sin(i + lt) * 0.6, y = 3.2 - 3 * k + Math.sin(lt * 3 + i) * 0.3, z = 1 + hash(i + 5) * 6; const [sx, sy, s] = P(c, x, y, z);
      g.save(); g.translate(sx, sy); g.rotate(lt * 3 + i); g.fillStyle = i % 2 ? "#cfc6a2" : "#b8c4a6"; g.strokeStyle = "#3a3024"; g.lineWidth = 1.5; g.fillRect(-0.16 * s, -0.08 * s, 0.32 * s, 0.16 * s); g.strokeRect(-0.16 * s, -0.08 * s, 0.32 * s, 0.16 * s); g.restore(); } });
  } },
  // 14b "e o Tratado de Versalhes impôs duras condições aos alemães."
  { t0: 75.02, L: "office", cam: mv([0, 1.45, -4.2, 40], [0, 1.25, -2.2, 38]), act: (A, lt) => {
    A.a(civ(1), 70, -1.0, 2.2, { expr: "stern", facing: 1 }); A.a(civ(5), 71, 1.1, 2.3, { expr: "stern", facing: -1, prop: ["paper", 0] }); A.a(civ(3), 72, 0.1, 2.9, { expr: "sad" });
    A.sp("treaty", 0, 0.92, 1.25, { sc: 1 }); A.over((g) => { stamp(g, "ASSINADO", lt - 2.6, VW * 0.62, VH * 0.72, -0.1, 70); caption(g, "TRATADO DE VERSALHES · 1919", lt - 0.3, 3.8); });
  } },
  // 15 "Foi nesse cenário de revolta e instabilidade que Hitler começou sua trajetória política."
  { t0: 79.30, L: "berlin", v: "grey,posters", cam: mv([-3, 1.6, -7.5, 44], [1.4, 1.75, -5, 42]), act: (A, lt) => {
    crowd(A, 26, -6, 4, 2.6, 7, 31, (i) => ({ expr: "shout", prop: i % 2 ? ["fist", 0] : undefined }));
    A.sp("chair", 2.6, 0, 3.0, { sc: 1.6 }); A.a(HS, 1, 2.6, 3.05, { expr: Math.floor(lt * 4) % 2 ? "shout" : "stern", wave: Math.sin(lt * 4), facing: -1 }, { y: 0.72 });
    A.fx(12, (g, c) => smokeCol(g, c, lt, -8, 0, 12, { h: 10, w: 2, seed: 4, col: [60, 56, 54], a: 0.6 }));
  } },
  // 16a "Ele se aproximou de um pequeno movimento nacionalista"
  { t0: 85.10, L: "hall", cam: mv([-2, 1.4, -4.5, 42], [0, 1.4, -3.8, 42]), act: (A, lt) => {
    for (let i = 0; i < 5; i++) A.a(civ(i), 80 + i, -4 + i * 2, 3.3, { mode: "sit", expr: i % 2 ? "stern" : "neutral", facing: i < 2 ? 1 : -1 });
    walkF(A, HS, 1, lt, 0, 2.2, [3.5, 4.3], [0.8, 4.4], { expr: "stern" });
    A.light((g) => { for (const x of [-4.6, 0, 4.6]) { const [sx, sy, s] = P(A.cam, x, 6, 7); glow(g, sx, sy, 3 * s, "rgba(255,190,110,0.5)", 0.5); } });
  } },
  // 16b "que mais tarde se transformaria no Partido Nazista."
  { t0: 88.6, L: "hall", v: "banners", fade: 0.5, cam: mv([0, 1.6, -6, 46], [0, 1.9, -7.5, 48]), act: (A, lt) => {
    crowd(A, 30, -6, 6, 3.2, 6, 41, (i) => ({ expr: "stern" }), (i) => (i % 3 ? SAN : civ(i)));
    A.a(HS, 1, 0, 2.0, { expr: "shout", wave: Math.sin(lt * 4) });
    A.light((g) => tint(g, "#7a2a20", 0.18, "multiply"));
  } },
  // 17a "Hitler tinha uma habilidade perigosa:"
  { t0: 91.62, L: "hall", v: "banners", cam: mv([0.2, 1.1, -2.2, 38], [0, 1.0, -1.7, 36]), act: (A, lt) => {
    A.a(HS, 1, 0, 0.8, { expr: Math.floor(lt * 5) % 3 ? "shout" : "stern", wave: Math.sin(lt * 5), look: 0 });
    A.light((g) => glow(g, VW * 0.3, VH * 0.1, VW * 0.6, "rgba(255,150,80,0.35)", 0.6));
  } },
  // 17b "sabia explorar o medo, a frustração e a revolta das pessoas."
  { t0: 94.20, L: "berlin", v: "night", cam: (u) => C(u < 0.33 ? -3 : u < 0.66 ? 0 : 3, 1.45, -3.6 + u * 0.4, 40), act: (A, lt, u) => {
    const ex = u < 0.33 ? "fear" : u < 0.66 ? "sad" : "shout";
    crowd(A, 18, -6, 6, 1.6, 4.2, 51, (i) => ({ expr: ex, prop: ex === "shout" && i % 2 ? ["fist", 0] : undefined, headTilt: ex === "sad" ? 5 : 0 }));
    A.light((g) => glow(g, VW * 0.5, VH * 0.4, VW * 0.5, "rgba(255,170,90,0.3)", 0.5));
  } },
  // 18a "Em seus discursos, prometia recuperar o orgulho alemão, reconstruir a economia"
  { t0: 99.07, L: "rally", cam: mv([0, 1.7, -4, 44], [0, 3.2, -1.5, 40, -120]), act: (A, lt) => {
    crowd(A, 70, -9, 9, 0.6, 7, 61, (i) => ({ wave: i % 3 ? undefined : Math.sin(lt * 4 + i) }), civ, { dark: 0.85, darkCol: "#0a0810" });
    A.a(HA, 1, 0, 9.5, { expr: "shout", wave: Math.sin(lt * 3) }, { y: 1.2, shadow: 0 });
    searchlights(A, lt, 7, 58, 0.25); A.light((g) => { const [sx, sy] = P(A.cam, 0, 2.5, 9.5); glow(g, sx, sy, 500, "rgba(255,220,160,0.6)", 0.5); });
  } },
  // 18b "e transformar o país em uma grande potência."
  { t0: 103.3, L: "rally", cam: mv([0, 2.6, 5.4, 38], [0, 2.6, 6.4, 36]), act: (A, lt) => {
    A.a(HA, 1, 0, 9.5, { expr: Math.floor(lt * 4) % 2 ? "shout" : "stern", prop: lt % 2 < 1 ? ["fist", 0] : undefined, wave: lt % 2 < 1 ? undefined : Math.sin(lt * 4) }, { y: 1.2, shadow: 0 });
    searchlights(A, lt, 7, 58, 0.3);
  } },
  // 19 "Mas também espalhava ideias racistas e antissemitas, culpando falsamente os judeus pelos problemas da Alemanha."
  { t0: 107.68, L: "berlin", v: "grey,posters,banners", fade: 0.4, cam: mv([0, 1.3, -3.8, 42], [0, 1.3, -6.2, 42]), act: (A, lt) => {
    const z = 3.2 - lt * 0.32; A.a(JF, 90, -0.7, z, { mode: "stroll", phase: ((lt * 0.32) / 1.5) % 1, expr: "fear" }); A.a(JM, 91, 0.45, z + 0.2, { mode: "stroll", phase: ((lt * 0.32) / 1.5 + 0.5) % 1, expr: "fear" }); A.a(JG, 92, 0.05, z - 0.3, { mode: "stroll", phase: ((lt * 0.32) / 1.5) % 1, expr: "fear" });
    for (let i = 0; i < 6; i++) A.a(civ(i), 93 + i, (i % 2 ? 1 : -1) * (2.6 + (i >> 1) * 1.5), 4 + (i >> 1) * 1.6, { expr: "stern", facing: i % 2 ? -1 : 1, prop: i === 1 ? ["fist", 0] : undefined });
    A.sp("poster", -4.2, 0.5, 6.5); A.sp("poster", 4.4, 0.5, 6.5);
  } },
  // 20a "Em 1923, tentou tomar o poder pela força,"
  { t0: 114.96, L: "berlin", v: "grey", cam: mv([0, 1.1, -5, 42], [0, 1.2, -6.5, 42]), act: (A, lt) => {
    for (let r = 0; r < 3; r++) for (let c = -1; c <= 1; c++) { const z = 9 + r * 1.6 - lt * 1.2; A.a(r === 0 && c === 0 ? HS : SA, 110 + r * 3 + c, c * 1.3, z, { mode: "march", phase: ((lt * 1.2) / 1.6 + r * 0.5) % 1, expr: "stern" }); }
    A.over((g) => caption(g, "MUNIQUE · 1923", lt - 0.3, 3.2));
  } },
  // 20b "mas fracassou e acabou preso."
  { t0: 118.82, L: "berlin", v: "grey", cam: mv([-1, 1.3, -6, 44], [-0.5, 1.3, -6.5, 44]), act: (A, lt) => {
    for (let i = 0; i < 4; i++) A.s(POL, 120 + i, -4.2, 2 + i * 1.2, { mode: "stand", aim: true, expr: "stern" });
    for (let i = 0; i < 4; i++) { const at = 0.15 + i * 0.22; if (lt > at && lt < at + 0.08) A.fx(2 + i * 1.2 - 0.01, (g, c) => muzzle(g, c, -2.9, 1.42, 2 + i * 1.2, 0.3)); A.fx(2 + i * 1.2 - 0.02, (g, c) => { if (lt > at) puff(g, ...(P(c, -2.7 + (lt - at) * 0.5, 1.45 + (lt - at) * 0.3, 2 + i * 1.2).slice(0, 2) as [number, number]), 60 + (lt - at) * 90, [225, 222, 215], clamp(0.8 - (lt - at) * 0.4)); }); }
    for (let i = 0; i < 4; i++) A.s(SA, 130 + i, 2 + i * 0.8 + lt * 2.2, 3 + i, { mode: "march", phase: ((lt * 2.2) / 1.6 + i * 0.3) % 1, expr: "fear" });
    const k = clamp((lt - 1.75) / 0.18); if (k > 0) A.sp("bars", -0.5, 7 * (1 - k), -2.2, {});
  } },
  // 21 "Na prisão, escreveu parte de seu livro, Mein Kampf, no qual apresentou suas ideias extremistas."
  { t0: 121.30, L: "cell", cam: mv([0.6, 1.8, -3.4, 42, -380], [0.2, 1.7, -2.4, 40, -400]), act: (A, lt) => {
    A.a(HS, 1, 0, 1.15, { mode: "sit", expr: "stern", look: 1, headTilt: 8 }, { y: 0.34 });
    A.light((g) => { const [sx, sy, s] = P(A.cam, 1.6, 3.15, 3.5); beamDown(g, sx, sy, s); });
    A.over((g) => { caption(g, "PRISÃO DE LANDSBERG · 1924", lt - 0.2, 3.2); caption(g, "MEIN KAMPF", lt - 3.6, 3.0); });
  }, wx: ["dust", 90, 0.6] },
  // 22 "Depois de ser libertado, decidiu mudar de estratégia."
  { t0: 128.23, L: "berlin", v: "day", fade: 0.4, cam: mv([0, 1.35, -3.2, 40], [0, 1.35, -4.6, 40]), act: (A, lt) => {
    walkF(A, HS, 1, lt, 0, 3.6, [0, 4.5], [0, 1.6], { expr: "stern" });
  } },
  // 23a "Em vez de tentar conquistar o governo por meio de um golpe,"
  { t0: 131.93, L: "reichstag", cam: mv([-2, 1.4, -6, 42], [2, 3, -10, 46, -80]), act: (A, lt) => {
    A.a(HS, 1, 0.6, 1.5, { expr: "stern", facing: 1, look: 1 }); crowd(A, 14, -12, 12, 18, 26, 71, () => ({}));
  } },
  // 23b "passou a utilizar as eleições e as instituições políticas."
  { t0: 135.14, L: "hall", cam: mv([1.2, 1.35, -4.0, 40], [0.3, 1.3, -3.4, 38]), act: (A, lt) => {
    A.sp("ballotbox", 0.2, 0, 1.9, { sc: 1.3 }); A.sp("poster", -2.6, 0.9, 6.9); A.sp("poster", 2.6, 0.9, 6.9);
    walkF(A, civ(2), 141, lt, 0, 1.2, [2.8, 2.9], [1.1, 2.6], { prop: ["ballot", 0] }); A.a(civ(1), 142, -1.1, 2.4, { prop: ["ballot", 0], facing: 1 }); A.a(civ(4), 143, -2.3, 3.0, {});
  } },
  // 24 "Então, uma nova crise econômica atingiu a Alemanha."
  { t0: 139.33, L: "berlin", v: "grey,posters", cam: mv([0, 1.4, -6, 44], [0, 1.4, -5, 44]), act: (A, lt) => {
    const k = easeOut(clamp(lt / 1.2)); A.sp("newspaper", 0, -0.2, lerp(8, -2.3, k), { rot: (1 - k) * 9, sc: 1 });
    A.over((g) => caption(g, "1929 · CRISE MUNDIAL", lt - 1.0, 2.6));
  } },
  // 25 "O desemprego aumentou, empresas fecharam e milhões de pessoas perderam a esperança."
  { t0: 143.19, L: "factory", cam: mv([-3, 1.4, -5.5, 42], [2, 1.6, -7, 44]), act: (A, lt) => {
    for (let i = 0; i < 11; i++) A.s(civ(i), 150 + i, -7 + i * 1.1, 4.4 + (i % 2) * 0.3, { mode: "stand", expr: "sad" });
    A.a(civ(5), 165, 3.4, 2.2, { mode: "sit", expr: "sad", headTilt: 9 });
  }, mood: ["#7a7a80", 0.25] },
  // 26 "Hitler aproveitou aquele momento para ampliar sua popularidade."
  { t0: 149.25, L: "berlin", v: "posters,banners", cam: mv([0, 1.6, -7.5, 44], [0, 1.7, -5.2, 42]), act: (A, lt) => {
    crowd(A, 34, -6, 6, 1.4, 5.5, 81, (i) => ({ expr: "grin", wave: i % 3 ? undefined : Math.sin(lt * 5 + i) }));
    A.sp("chair", 0, 0, 6.2, { sc: 1.6 }); A.a(HA, 1, 0, 6.25, { expr: "shout", wave: Math.sin(lt * 4) }, { y: 0.72 });
    for (let i = 0; i < 6; i++) if (lt > 0.4 + i * 0.4) A.sp("poster", -9 + i * 3.6 * (i % 2 ? 1 : 1), 0.4, 14.5, { alpha: clamp((lt - 0.4 - i * 0.4) / 0.2) });
  } },
  // 27 "Em janeiro de 1933, foi nomeado chanceler da Alemanha pelo presidente Paul von Hindenburg."
  { t0: 153.37, L: "office", cam: mv([0, 1.5, -4.4, 42], [0.1, 1.45, -2.8, 40]), act: (A, lt) => {
    A.a(HIN, 200, -0.9, 2.5, { expr: "stern", facing: 1, look: 1, prop: lt > 3 ? ["paper", 0] : undefined }); A.a(HA, 1, 0.95, 2.45, { expr: lt > 4 ? "smile" : "stern", facing: -1, look: -1 });
    A.over((g) => caption(g, "30 DE JANEIRO DE 1933", lt - 0.4, 4.2));
  } },
  // 28 "E foi assim que começou uma das transformações mais sombrias da história."
  { t0: 160.66, L: "berlin", v: "night,banners", fade: 0.5, cam: mv([0, 1.5, -6, 44], [0, 2.4, -8, 46, -60]), act: (A, lt) => {
    for (let r = 0; r < 7; r++) for (let c = -1; c <= 1; c++) { const z = 3 + r * 2 + 6 - lt * 1.4, x = c * 1.3, id = 210 + r * 3 + c; if (z < 1) continue;
      A.a(SAN, id, x, z, { mode: "march", phase: ((lt * 1.4) / 1.6 + r * 0.5) % 1, prop: ["torch", Math.floor(lt * 12 + id) % 4], expr: "stern" }, { dark: 0.3 }); torchGlow(A, x, z, lt, id); }
    A.light((g) => tint(g, "#2a1830", 0.25, "multiply"));
  } },
  // 29 "Depois de chegar ao poder, Hitler começou a destruir a democracia alemã."
  { t0: 165.02, L: "reichstag", v: "night,fire", cam: mv([0, 1.5, -8, 44], [0, 3.5, -14, 50, -100]), act: (A, lt) => {
    wall(A, lt, 6); crowd(A, 16, -10, 10, 5, 9, 91, () => ({ expr: "shock" }), civ, { dark: 0.8, darkCol: "#120808" });
    A.light((g) => glow(g, VW * 0.5, VH * 0.4, VW * 0.7, "rgba(255,110,40,0.35)", 0.7));
    A.over((g) => caption(g, "INCÊNDIO DO REICHSTAG · 1933", lt - 0.4, 3.8));
  } },
  // 30a "Partidos foram proibidos,"
  { t0: 170.21, L: "berlin", v: "grey,banners", cam: mv([0, 1.35, -4.5, 42], [0, 1.35, -3.8, 40]), act: (A, lt) => {
    A.a(SA, 220, -1.1, 2.4, { expr: "stern" }); A.a(SA, 221, 1.1, 2.4, { expr: "stern" }); stamps(A, lt, "PROIBIDO", [0.35], [[VW * 0.5, VH * 0.42]]);
  } },
  // 30b "adversários políticos foram perseguidos,"
  { t0: 171.95, L: "berlin", v: "night", cam: mv([-1.5, 1.3, -5.5, 42], [1.5, 1.3, -5.5, 42]), act: (A, lt) => {
    walkS(A, SA, 230, lt, -3.2, 2.4, 1.2, {}); walkS(A, civ(1), 231, lt, -2.2, 2.6, 1.2, { expr: "fear" }); walkS(A, SA, 232, lt, -1.2, 2.4, 1.2, {});
    A.light((g) => { const [sx, sy, s] = P(A.cam, 6.5, 4.7, 8); glow(g, sx, sy, 3 * s, "rgba(255,210,130,0.6)", 0.7); });
  } },
  // 30c "jornais sofreram censura"
  { t0: 174.63, L: "berlin", v: "night", cam: mv([0, 1.2, -3.2, 40], [0, 1.2, -2.6, 38]), act: (A, lt) => {
    A.sp("newspaper", 0, 0.2, 0.5, {}); A.fx(4, (g, c) => fire(g, c, lt, 0.8, 0, 4, 1.2, 3)); stamps(A, lt, "CENSURADO", [0.4], [[VW * 0.5, VH * 0.5]]);
  } },
  // 30d "e a população passou a viver sob vigilância e medo."
  { t0: 176.57, L: "home", v: "night", cam: mv([0, 1.35, -3.6, 42], [0, 1.4, -2.8, 40]), act: (A, lt) => {
    A.a(civ(2), 240, -0.5, 2.6, { expr: "fear", facing: 1, look: 1 }); A.a(civ(4), 241, 0.5, 2.7, { expr: "fear", facing: -1, look: 1 }); A.a(READER, 242, 0, 2.2, { expr: "fear" });
    A.light((g) => { const k = (lt * 0.45) % 1, [sx, sy, s] = P(A.cam, -1.2 + 2.4 * k, 2.5, 3.7); glow(g, sx, sy, 1.3 * s, "rgba(220,235,255,0.9)", 0.9); });
  } },
  // 31 "A propaganda nazista estava por toda parte."
  { t0: 180.37, L: "berlin", v: "banners,posters", cam: mv([-6, 1.6, -9, 46], [6, 1.6, -9, 46]), act: (A, lt) => {
    for (let i = 0; i < 9; i++) A.sp("poster", -12 + i * 3, 0.5, 13 + (i % 2) * 0.2); for (let i = 0; i < 6; i++) walkS(A, civ(i), 250 + i, lt, -10 + i * 3.5, 6 + (i % 2), i % 2 ? 1.1 : -1.1);
  } },
  // 32a "Hitler se tornou um ditador"
  { t0: 183.50, L: "rally", cam: mv([0, 2.75, 5.6, 34], [0, 2.75, 6.1, 32]), act: (A, lt) => {
    A.a(HA, 1, 0, 9.5, { expr: "stern", look: 0 }, { y: 1.2, shadow: 0 }); searchlights(A, lt, 7, 58, 0.3);
  } },
  // 32b "e passou a preparar a Alemanha para uma política de expansão territorial e guerra."
  { t0: 185.31, L: "factory", v: "inside", cam: mv([-4, 1.8, -6, 46], [4, 2.4, -8, 48, -40]), act: (A, lt) => {
    for (let r = 0; r < 3; r++) for (let i = 0; i < 6; i++) A.sp("tank", -15 + i * 6 + r * 2, 0, 6 + r * 5);
    for (let i = 0; i < 4; i++) A.a(civ(i), 260 + i, -6 + i * 4, 4.5, { expr: "neutral" });
    A.fx(5, (g, c) => { for (let i = 0; i < 3; i++) { const [sx, sy, s] = P(c, -4 + i * 5, 1.6, 5); if (hash(Math.floor(lt * 14) + i) > 0.4) glow(g, sx, sy, 0.9 * s, "rgba(255,220,140,1)", 0.9); } });
  } },
  // 33 "Em primeiro de setembro de 1939, as tropas alemãs invadiram a Polônia."
  { t0: 190.31, L: "field", v: "border", cam: mv([-6, 1.2, -9, 44], [2, 1.5, -10, 46]), act: (A, lt) => {
    const tx = -14 + lt * 3; A.sp("tank", tx, 0, 7.6); if (tx > -9) A.fx(7.5, (g, c) => boom(g, c, (tx + 9) / 3, -6.2, 0.6, 7.5, 0.8, 2));
    marchCol(A, GER, lt, 10, -12, 4.5, 1.6, 1.3);
    for (let i = 0; i < 6; i++) A.sp("plane", -40 + i * 6 + lt * 10, 18 + (i % 3) * 2, 50 + i * 3);
    for (let i = 0; i < 3; i++) A.fx(70, (g, c) => boom(g, c, lt - 1.5 - i * 1.3, 10 + i * 9, 0, 70, 4, i + 7));
    A.over((g) => caption(g, "1º DE SETEMBRO DE 1939", lt - 0.3, 5));
  } },
  // 34 "Pouco depois, Reino Unido e França declararam guerra à Alemanha."
  { t0: 196.31, L: "map", cam: mv([MX(8), MY(50), -26, 42], [MX(6), MY(50.5), -21, 42]), act: (A, lt) => {
    A.fx(-0.1, (g, c) => { arrow(g, c, [12, 52], [20, 52], clamp(lt / 0.8), "#7a1a14"); flagPin(g, c, -1.5, 52.5, "uk", lt - 1.2); flagPin(g, c, 2.3, 47, "fr", lt - 1.6);
      if (lt > 2.2) { arrow(g, c, [-0.5, 52], [7.5, 51.5], clamp((lt - 2.2) / 0.8), "#1e3a6a"); arrow(g, c, [3, 47.5], [7.8, 49.6], clamp((lt - 2.4) / 0.8), "#1e3a6a"); } });
  } },
  // 35 "Começava a Segunda Guerra Mundial na Europa."
  { t0: 200.56, L: "field", v: "dusk", cam: mv([0, 2.5, -12, 48, -80], [0, 2.2, -10, 46, -60]), act: (A, lt) => {
    for (let i = 0; i < 5; i++) A.fx(40 + i * 8, (g, c) => boom(g, c, lt - i * 0.6, -20 + i * 10, 0, 40 + i * 8, 3.5, i)); for (let i = 0; i < 3; i++) A.sp("tank", -10 + i * 9 + lt * 1.5, 0, 14 + i * 3);
    A.over((g) => bigText(g, "SEGUNDA GUERRA MUNDIAL", lt - 0.2, 3.1, VH * 0.22, 92, "#f4ead6", "1939 – 1945"));
  } },
  // 36a "Mas enquanto os exércitos avançavam pelo continente,"
  { t0: 203.92, L: "field", v: "grey", cam: (u, lt) => C(-2 + lt * 1.5, 1.3, -8, 44), act: (A, lt) => {
    marchCol(A, GER, lt, 16, -2, 3.5, 1.5, 1.3, 2, 1.2); for (let i = 0; i < 3; i++) A.sp("tank", -14 + i * 8 + lt * 1.5, 0, 9);
  } },
  // 36b "uma tragédia ainda mais cruel acontecia."
  { t0: 207.07, L: "home", v: "night", fade: 0.6, cam: mv([0, 1.3, -3.8, 42], [0, 1.25, -3.0, 40]), act: (A, lt) => {
    A.a(JF, 90, -0.9, 2.6, { expr: "sad", facing: 1 }); A.a(JM, 91, 0.9, 2.6, { expr: "sad", facing: -1 }); A.a(JG, 92, 0, 2.1, { expr: "fear" });
    A.light((g) => { const [sx, sy, s] = P(A.cam, -4, 1.2, 3.8); glow(g, sx, sy, 1.3 * s, "rgba(255,200,120,0.9)", 0.6); });
  } },
  // 37 "O regime nazista iniciou uma perseguição sistemática contra os judeus e outros grupos considerados indesejáveis."
  { t0: 210.37, L: "berlin", v: "grey,banners", cam: (u, lt) => C(-3 + lt * 0.5, 1.35, -6.5, 44), act: (A, lt) => {
    walkS(A, JF, 90, lt, -5, 3.0, 0.75, { expr: "sad" }); walkS(A, JM, 91, lt, -6.2, 3.3, 0.75, { expr: "sad" }); walkS(A, JG, 92, lt, -5.6, 2.7, 0.75, { expr: "fear" });
    for (let i = 0; i < 5; i++) walkS(A, i % 2 ? civ(i) : { ...civ(i), star: true }, 280 + i, lt, -9 - i * 1.4, 3.4 + (i % 2) * 0.4, 0.75, { expr: "sad" });
    for (let i = 0; i < 3; i++) A.a(GER, 290 + i, -2 + i * 4, 1.4, { expr: "stern" });
  }, mood: ["#6a6a74", 0.3] },
  // 38a "Milhões de pessoas foram retiradas de suas casas,"
  { t0: 217.80, L: "home", cam: mv([0, 1.4, -4.2, 42], [0, 1.4, -3.6, 42]), act: (A, lt) => {
    A.a(GER, 300, 3.0, 2.3, { expr: "stern", facing: -1 }); A.a(GER, 301, 2.0, 2.0, { expr: "shout", facing: -1, prop: ["fist", 0] });
    walkF(A, JF, 90, lt, 0.3, 3, [-1.4, 2.4], [-0.2, 2.2], { prop: ["suitcase", 0], expr: "fear" }); A.a(JM, 91, -1.6, 2.7, { expr: "fear" }); A.a(JG, 92, -0.9, 2.0, { expr: "fear" });
  }, mood: ["#6a6a74", 0.2] },
  // 38b "separadas de suas famílias"
  { t0: 220.99, L: "camp", cam: mv([0, 1.3, -4.5, 42], [0, 1.3, -4.0, 42]), act: (A, lt) => {
    walkS(A, JF, 90, lt, 0.2, 2.2, 0.9, { expr: "sad" }); walkS(A, GER, 310, lt, 1.4, 2.4, 0.9, {});
    A.a(JM, 91, -1.6, 2.0, { expr: "sad", facing: 1, look: 1 }); A.a(JG, 92, -0.8, 1.6, { expr: "fear", facing: 1, look: 1, wave: 0.5 });
    A.light((g) => { const [sx, sy] = P(A.cam, 9, 9, 20); glow(g, sx, sy, 300, "rgba(220,235,255,0.6)", 0.6); });
  } },
  // 38c "e enviadas para campos de concentração e centros de extermínio."
  { t0: 222.85, L: "camp", cam: mv([-3, 1.8, -7, 46], [1, 2.4, -9, 48, -40]), act: (A, lt) => {
    for (let i = 0; i < 5; i++) A.sp("wagon", -24 + i * 10.6 + lt * 1.6, 0.15, 12.2);
    A.fx(19.9, (g, c) => beam(g, c, 9, 9, 19.9, Math.PI * 0.55 + 0.4 * Math.sin(lt * 0.8), 30, 3.5, 0.35));
    A.fx(13, (g, c) => smokeCol(g, c, lt, -18 + lt * 1.6, 4, 12.2, { h: 10, w: 1.2, seed: 3, col: [70, 70, 74], a: 0.6 }));
  } },
  // 39 "O resultado foi o Holocausto, no qual aproximadamente seis milhões de judeus foram assassinados."
  { t0: 226.99, L: "camp", v: "dawn", fade: 1.0, cam: mv([0, 1.6, -6, 44], [0, 1.6, -4.6, 42]), act: (A, lt) => {
    A.over((g) => { bigText(g, "HOLOCAUSTO", lt - 0.5, 2.6, VH * 0.3, 120, "#f4ead6"); bigText(g, "≈ 6 MILHÕES", lt - 3.3, 3.3, VH * 0.3, 120, "#f4ead6", "de judeus assassinados"); });
  }, wx: ["snow", 160, 0.55], mood: ["#8a8a96", 0.3] },
  // 40 "Além deles, milhões de outras vítimas também morreram devido à perseguição nazista."
  { t0: 233.57, L: "camp", v: "dawn", cam: mv([-1.5, 0.9, -3.6, 40], [1.5, 0.9, -3.6, 40]), act: (A, lt) => {
    for (let r = 0; r < 4; r++) for (let i = 0; i < 14; i++) { const x = -4 + i * 0.6 + (r % 2) * 0.3, z = 0.5 + r * 0.8; A.sp("candle", x, 0, z); A.fx(z - 0.01, (g, c) => { const [sx, sy, s] = P(c, x, 0.29, z); glow(g, sx, sy, 0.22 * s * (1 + 0.15 * Math.sin(lt * 13 + i * 3 + r)), "rgba(255,190,90,0.95)", 0.9); }); }
  }, wx: ["snow", 120, 0.45], mood: ["#8a8a96", 0.25] },
  // 41 "Era um genocídio organizado pelo próprio Estado."
  { t0: 239.02, L: "office", cam: mv([0, 1.3, -3.4, 40], [0, 1.25, -2.6, 38]), act: (A, lt) => {
    A.a({ ...GERN, hat: "hair", hair: "#3a2a1e" }, 320, 0, 2.0, { expr: "neutral", prop: ["paper", 0] }); stamps(A, lt, "DEUTSCHES REICH", [0.9, 1.9], [[VW * 0.36, VH * 0.72], [VW * 0.66, VH * 0.6]], 80);
  }, mood: ["#4a4a58", 0.4] },
  // 42 "Enquanto isso, a Alemanha começou a perder a guerra."
  { t0: 242.50, L: "field", v: "grey", cam: mv([3, 1.3, -7, 44], [-1, 1.3, -7, 44]), act: (A, lt) => {
    A.sp("tank", 4, 0, 9, { rot: 0.05 }); A.fx(9.1, (g, c) => { fire(g, c, lt, 4, 2.4, 9, 1.0, 5); smokeCol(g, c, lt, 4, 2.6, 9.2, { h: 14, w: 2.2, seed: 7, col: [26, 24, 26], a: 0.95 }); });
    for (let i = 0; i < 6; i++) walkS(A, GER, 330 + i, lt, 2 + i * 1.6, 3.2 + (i % 2) * 0.6, -0.8, { expr: "sad" });
  }, mood: ["#6a6a74", 0.2] },
  // 43 "Em 1943, sofreu uma derrota decisiva em Stalingrado, diante das forças soviéticas."
  { t0: 245.99, L: "snow", cam: mv([0, 1.3, -5, 44], [0, 1.4, -7, 46]), act: (A, lt) => {
    for (let r = 0; r < 3; r++) for (let c = -2; c <= 2; c++) { const z = 7 + r * 2 - lt * 1.1, x = c * 1.5 + (r % 2) * 0.6; A.a(SOV, 340 + r * 5 + c, x, z, { mode: "march", phase: ((lt * 1.1) / 1.4 + r * 0.33 + c * 0.2) % 1, expr: "shout" }); }
    for (let i = 0; i < 3; i++) A.fx(24, (g, c) => boom(g, c, lt - 1 - i * 1.8, -10 + i * 10, 0, 24, 3, i + 2));
    A.over((g) => caption(g, "STALINGRADO · 1943", lt - 0.3, 4.5));
  }, wx: ["snow", 260, 0.7] },
  // 44 "No ano seguinte, os Aliados desembarcaram na Normandia e avançaram pela Europa Ocidental."
  { t0: 252.82, L: "beach", cam: mv([0, 1.3, -6, 44], [0, 1.4, -8, 46]), act: (A, lt) => {
    A.fx(400, (g, c) => sea(g, c, lt)); for (let i = 0; i < 4; i++) A.sp("craft", -18 + i * 11, 0, 34 + i * 3);
    for (let i = 0; i < 9; i++) { const z = 14 + (i % 3) * 2 - lt * 2.2, x = -6 + i * 1.5; if (z > 0.5) A.a(ALLY, 360 + i, x, z, { mode: "march", phase: ((lt * 2.2) / 1.6 + i * 0.3) % 1, expr: "shout" }); }
    for (let i = 0; i < 3; i++) A.fx(18, (g, c) => boom(g, c, lt - 0.8 - i * 1.5, -8 + i * 8, 0, 18, 2.4, i + 11));
    A.over((g) => caption(g, "NORMANDIA · 6 DE JUNHO DE 1944", lt - 0.3, 4.6));
  } },
  // 45 "As tropas soviéticas também se aproximavam pelo leste."
  { t0: 258.54, L: "field", v: "grey", cam: (u, lt) => C(3 - lt * 1.4, 1.3, -8, 44), act: (A, lt) => {
    for (let i = 0; i < 3; i++) A.sp("tankRed", 10 + i * 8 - lt * 1.6, 0, 10, { flip: true }); marchCol(A, SOV, lt, 14, 4, 4, -1.5, 1.3, 2, 1.2);
  } },
  // 46 "A Alemanha estava cercada."
  { t0: 262.09, L: "map", cam: mv([MX(14), MY(50), -26, 42], [MX(13), MY(50.5), -22, 42]), act: (A, lt) => {
    A.fx(-0.1, (g, c) => { shadeGer(g, c, clamp(lt / 1.2)); arrow(g, c, [-1, 49.3], [7.5, 50.5], clamp(lt / 1.4), "#1e3a6a"); arrow(g, c, [36, 49], [17.5, 52], clamp(lt / 1.4), "#a01e18"); arrow(g, c, [12, 43], [11.5, 47.2], clamp((lt - 0.4) / 1.2), "#1e3a6a"); });
  } },
  // 47 "Em abril de 1945, Berlim foi invadida."
  { t0: 264.42, L: "ruins", cam: mv([0, 1.3, -5, 44], [0, 1.4, -6.5, 46]), act: (A, lt) => {
    for (let i = 0; i < 7; i++) { const z = 8 - lt * 1.4 + (i % 3) * 1.3, x = -4 + i * 1.4; A.a(SOV, 380 + i, x, z, { mode: "march", phase: ((lt * 1.4) / 1.5 + i * 0.27) % 1, expr: "shout" }); }
    A.fx(28, (g, c) => { fire(g, c, lt, -11, 0, 24, 1.4, 2); smokeCol(g, c, lt, -11, 1, 24, { h: 16, w: 2.5, seed: 4 }); smokeCol(g, c, lt, 10, 4, 30, { h: 22, w: 3, seed: 6 }); });
    for (let i = 0; i < 3; i++) A.fx(35, (g, c) => boom(g, c, lt - 0.6 - i * 1.3, -8 + i * 9, 0, 35, 3, i + 21));
    A.over((g) => caption(g, "BERLIM · ABRIL DE 1945", lt - 0.3, 3.8));
  }, wx: ["ash", 140, 0.5] },
  // 48 "Hitler estava escondido em um bunker subterrâneo, enquanto seu império desmoronava."
  { t0: 268.67, L: "bunker", cam: mv([0.4, 1.8, -3.6, 42, -380], [0.1, 1.7, -2.6, 40, -380]), act: (A, lt) => {
    A.sp("chair", 0, 0.36, 1.75, { sc: 1.6 }); A.a(HA, 1, 0, 1.8, { mode: "sit", expr: "nervous", look: 0, headTilt: 5 }, { y: 0.36 });
    lamp(A, lt, [0.8, 3.3]);
  }, wx: ["dust", 70, 0.7] },
  // 49 "No dia 30 de abril de 1945, Adolf Hitler tirou a própria vida."
  { t0: 273.94, L: "bunker", cam: mv([0, 1.3, -3.2, 42], [0, 1.3, -3.6, 42]), act: (A, lt) => {
    if (lt < 2.2) walkS(A, HA, 1, lt, 0.2, 3.0, 1.0, { expr: "sad" }, { alpha: clamp((2.2 - lt) / 0.6) });
    A.sp("chair", -0.6, 0, 1.75, { sc: 1.6 }); lamp(A, lt, [3.5]);
    A.light((g) => tint(g, "#000000", clamp((lt - 4.0) / 1.4), "source-over"));
    A.over((g) => caption(g, "30 DE ABRIL DE 1945", lt - 0.3, 4.4));
  } },
  // 50 "Poucos dias depois, a Alemanha nazista se rendeu."
  { t0: 279.88, L: "ruins", fade: 0.4, cam: mv([0, 1.35, -4.6, 42], [0, 1.4, -5.4, 42]), act: (A, lt) => {
    A.a(GERN, 400, 0, 1.6, { expr: "sad", prop: ["flag", lt * 2] }); A.a(GERN, 401, -1.5, 2.2, { mode: "sit", expr: "sad" }); A.a(GERN, 402, 1.6, 2.4, { mode: "sit", expr: "sad", headTilt: 8 });
    A.a(SOV, 403, -3.4, 4.5, { expr: "stern" }); A.a(SOV, 404, 3.4, 4.6, { expr: "stern" });
    A.over((g) => caption(g, "8 DE MAIO DE 1945", lt - 0.3, 3.0));
  }, wx: ["ash", 80, 0.4] },
  // 51a "A Segunda Guerra Mundial na Europa chegava ao fim,"
  { t0: 283.45, L: "ruins", cam: mv([0, 1.6, -6, 44], [0, 6, -14, 50, -220]), act: (A, lt) => {
    A.fx(30, (g, c) => { smokeCol(g, c, lt, -14, 3, 28, { h: 24, w: 3, seed: 1, a: 0.6 }); smokeCol(g, c, lt, 12, 3, 28, { h: 24, w: 3, seed: 2, a: 0.6 }); });
    A.light((g) => glow(g, VW * 0.7, VH * 0.15, VW * 0.6, "rgba(255,200,140,0.45)", 0.6));
  } },
  // 51b "deixando cidades destruídas, famílias devastadas e milhões de mortos."
  { t0: 286.46, L: "ruins", cam: mv([0.6, 1.0, -3.4, 40], [0.2, 1.0, -2.6, 38]), act: (A, lt) => {
    A.a(KLARA, 410, -0.5, 1.6, { mode: "sit", expr: "sad", headTilt: 7 }); A.a(JG, 411, 0.45, 1.5, { expr: "sad", facing: -1, look: -1, headTilt: 5 });
  }, wx: ["ash", 90, 0.4], mood: ["#7a7280", 0.2] },
  // 52 "Mas a história de Hitler deixou uma lição que o mundo não pode esquecer."
  { t0: 291.84, L: "library", fade: 0.6, cam: mv([0, 1.8, -3.5, 42, -380], [0, 1.7, -2.7, 40, -380]), act: (A, lt) => {
    A.sp("chair", 0, 0.45, 1.6, { sc: 1.5 }); A.a(READER, 420, 0, 1.65, { mode: "sit", expr: "neutral", look: 0, headTilt: 8 }, { y: 0.45 });
    A.light((g) => { const [sx, sy, s] = P(A.cam, 0.9, 1.25, 1.0); glow(g, sx, sy, 1.4 * s, "rgba(255,220,150,0.8)", 0.6); });
  } },
  // 53 "Ele não conquistou o poder sozinho."
  { t0: 296.21, L: "rally", cam: mv([0, 2.75, 5.6, 34], [0, 3.4, -1.0, 48, -120]), act: (A, lt) => {
    A.a(HA, 1, 0, 9.5, { expr: "shout", wave: Math.sin(lt * 3) }, { y: 1.2, shadow: 0 });
    for (let i = 0; i < 4; i++) A.a(i % 2 ? HIN : GERN, 430 + i, (i < 2 ? -1 : 1) * (1.6 + (i % 2) * 1.1), 10.3, { expr: "stern" }, { y: 1.2, shadow: 0, dark: 0.2 });
    crowd(A, 60, -9, 9, 0.6, 7, 61, () => ({}), civ, { dark: 0.85, darkCol: "#0a0810" }); searchlights(A, lt, 7, 58, 0.25);
  } },
  // 54a "Sua ascensão foi possível por meio de propaganda,"
  { t0: 298.85, L: "berlin", v: "banners,posters", cam: mv([-3, 1.4, -5, 42], [3, 1.4, -5, 42]), act: (A) => { for (let i = 0; i < 9; i++) A.sp("poster", -8 + i * 2, 0.4, 4 + (i % 2) * 0.2); } },
  // 54b "manipulação,"
  { t0: 302.92, L: "rally", cam: mv([0, 2.4, 10.2, 46, -60], [0, 3.4, 9, 48, -150]), act: (A, lt) => {
    crowd(A, 120, -18, 18, 14, 40, 11, (i) => ({ expr: "shout", prop: i % 3 === 0 ? ["fist", 0] : undefined }), civ, { dark: 0.3, darkCol: "#140a12" }); searchlights(A, lt, 6, 58, 0.25);
  } },
  // 54c "preconceito,"
  { t0: 303.96, L: "berlin", v: "grey,posters", cam: mv([0, 1.35, -3.6, 42], [0, 1.35, -3.2, 40]), act: (A) => {
    A.a(JF, 90, -0.5, 2.4, { expr: "fear" }); A.a(JG, 92, 0.3, 2.1, { expr: "fear" }); for (let i = 0; i < 4; i++) A.a(civ(i), 93 + i, (i % 2 ? 1 : -1) * (2 + (i >> 1)), 3.6 + i * 0.3, { expr: "stern", facing: i % 2 ? -1 : 1 });
  } },
  // 54d "violência e"
  { t0: 304.92, L: "berlin", v: "night", cam: mv([0, 1.3, -5.5, 42], [0.6, 1.3, -5.5, 42]), act: (A, lt) => {
    walkS(A, SA, 230, lt + 2, -3.2, 2.4, 1.2, {}); walkS(A, civ(1), 231, lt + 2, -2.2, 2.6, 1.2, { expr: "fear" }); walkS(A, SA, 232, lt + 2, -1.2, 2.4, 1.2, {});
  } },
  // 54e "decisões políticas"
  { t0: 306.3, L: "office", cam: mv([0, 1.5, -3.6, 42], [0, 1.45, -3.2, 40]), act: (A) => {
    A.a(HIN, 200, -0.9, 2.5, { expr: "stern", facing: 1, prop: ["paper", 0] }); A.a(HA, 1, 0.95, 2.45, { expr: "smile", facing: -1 });
  } },
  // 54f "que permitiram a destruição da democracia."
  { t0: 307.6, L: "reichstag", v: "night,fire", cam: mv([0, 2, -10, 46], [0, 2.4, -12, 48]), act: (A, lt) => { wall(A, lt + 3, 6); A.light((g) => glow(g, VW * 0.5, VH * 0.4, VW * 0.7, "rgba(255,110,40,0.35)", 0.7)); } },
  // 55a "Hitler morreu,"
  { t0: 309.07, L: "bunker", cam: mv([0, 1.3, -3.4, 42], [0, 1.3, -3.1, 42]), act: (A, lt) => { A.sp("chair", -0.6, 0, 1.75, { sc: 1.6 }); }, mood: ["#202028", 0.45] },
  // 55b "mas os crimes de seu regime continuam sendo lembrados como um dos maiores exemplos de crueldade da história humana."
  { t0: 310.24, L: "memorial", fade: 0.6, cam: mv([-3, 1.5, -6, 44], [2, 3.6, -9, 48, -110]), act: (A, lt) => {
    for (let i = 0; i < 4; i++) walkS(A, civ(i + 1), 440 + i, lt, -6 + i * 3.4, 4.5 + (i % 2) * 2.5, i % 2 ? -0.6 : 0.6, { expr: "sad" });
    for (let i = 0; i < 8; i++) A.sp("candle", -1.2 + i * 0.32, 0, 1.8);
  } },
  // 56 "Porque conhecer o passado não significa apenas saber o que aconteceu."
  { t0: 317.17, L: "library", fade: 0.5, cam: mv([0.3, 1.7, -2.6, 38, -400], [0.1, 1.65, -2.2, 36, -400]), act: (A, lt) => {
    A.sp("chair", 0, 0.45, 1.6, { sc: 1.5 }); A.a(READER, 420, 0, 1.65, { mode: "sit", expr: lt > 2.4 ? "smile" : "neutral", look: 0, headTilt: lt > 2.4 ? 0 : 8 }, { y: 0.45 });
    A.light((g) => { const [sx, sy, s] = P(A.cam, 0.9, 1.25, 1.0); glow(g, sx, sy, 1.4 * s, "rgba(255,220,150,0.8)", 0.6); });
  } },
  // 57 "Significa entender como tudo aquilo foi possível, para que nunca mais se repita."
  { t0: 321.26, t1: DUR, L: "memorial", v: "dusk", fade: 0.6, cam: mv([0, 2, -8, 46, -60], [0, 4.5, -14, 50, -200]), act: (A, lt) => {
    A.light((g) => glow(g, VW * 0.5, VH * 0.25, VW * 0.7, "rgba(255,200,140,0.5)", 0.6));
    A.over((g) => { bigText(g, "PARA QUE NUNCA", lt - 2.2, 4.0, VH * 0.42, 96, "#f4ead6", "MAIS SE REPITA"); tint(g, "#000", clamp((lt - 5.3) / 0.6), "source-over"); });
  } },
];
SH.forEach((s, i) => { if (s.t1 === undefined) s.t1 = SH[i + 1]?.t0 ?? DUR; });

// ---------------- helpers used by shots ----------------
function beamDown(g: Ctx, sx: number, sy: number, s: number) {
  g.save(); g.globalCompositeOperation = "lighter"; const gr = g.createLinearGradient(sx, sy, sx - 2.5 * s, sy + 3.5 * s); gr.addColorStop(0, "rgba(255,240,200,0.35)"); gr.addColorStop(1, "rgba(255,240,200,0)");
  g.fillStyle = gr; g.beginPath(); g.moveTo(sx - 0.7 * s, sy - 0.5 * s); g.lineTo(sx + 0.7 * s, sy - 0.5 * s); g.lineTo(sx - 1.4 * s, sy + 3.6 * s); g.lineTo(sx - 3.6 * s, sy + 3.6 * s); g.fill(); g.restore();
}
function lamp(A: Sc, lt: number, booms: number[]) {
  let sw = 0.05 * Math.sin(lt * 2.1); for (const b of booms) if (lt > b) sw += 0.22 * Math.exp(-(lt - b) * 1.4) * Math.sin((lt - b) * 7);
  const flick = booms.some((b) => lt > b && lt - b < 0.5 && hash(Math.floor(lt * 30)) > 0.5) ? 0.3 : 1;
  A.sp("lamp", 0, 3.0, 1.9, { rot: sw });
  A.light((g) => { const [sx, sy, s] = P(A.cam, Math.sin(sw) * 1.4, 3.0 - 1.4 * Math.cos(sw), 1.9); tint(g, "#0a0808", 0.45 * (2 - flick) / 1.5, "multiply"); glow(g, sx, sy, 2.6 * s, "rgba(255,210,140,0.75)", 0.8 * flick); });
  for (const b of booms) A.fx(1.8, (g, c) => { if (lt > b && lt < b + 2) for (let i = 0; i < 20; i++) { const k = (lt - b) * 1.6 - hash(i) * 0.5; if (k < 0) continue; const [sx, sy] = P(c, -2 + hash(i + 2) * 4, 4 - k * 4, 1.5 + hash(i) * 1.5); g.fillStyle = "rgba(200,190,170,0.7)"; g.fillRect(sx, sy, 3, 3); } });
}
function arrow(g: Ctx, c: Cam, a: number[], b: number[], k: number, col: string) {
  if (k <= 0) return; const ax = MX(a[0]), ay = MY(a[1]), bx = lerp(ax, MX(b[0]), k), by = lerp(ay, MY(b[1]), k), mx = (ax + bx) / 2 - (by - ay) * 0.18, my = (ay + by) / 2 + (bx - ax) * 0.18;
  const [x0, y0, s] = P(c, ax, ay, 0), [x1, y1] = P(c, bx, by, 0), [x2, y2] = P(c, mx, my, 0);
  g.save(); g.strokeStyle = col; g.lineWidth = 0.32 * s; g.lineCap = "round"; g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo(x2, y2, x1, y1); g.stroke();
  const an = Math.atan2(y1 - y2, x1 - x2); g.fillStyle = col; g.beginPath(); g.moveTo(x1 + Math.cos(an) * 0.6 * s, y1 + Math.sin(an) * 0.6 * s); g.lineTo(x1 + Math.cos(an + 2.4) * 0.6 * s, y1 + Math.sin(an + 2.4) * 0.6 * s); g.lineTo(x1 + Math.cos(an - 2.4) * 0.6 * s, y1 + Math.sin(an - 2.4) * 0.6 * s); g.fill(); g.restore();
}
function flagPin(g: Ctx, c: Cam, lon: number, lat: number, kind: "uk" | "fr", t: number) {
  if (t < 0) return; const k = easeOut(clamp(t / 0.35)), [sx, sy, s] = P(c, MX(lon), MY(lat), 0), w = 1.5 * s * k, h = 1.0 * s * k;
  g.save(); g.translate(sx, sy - 1.6 * s * k); g.fillStyle = "#2a1d16"; g.fillRect(-0.05 * s, 0, 0.1 * s, 1.6 * s * k);
  if (kind === "fr") { ["#1e3a8a", "#f4f1ea", "#c0302a"].forEach((col, i) => { g.fillStyle = col; g.fillRect(0.05 * s + (i * w) / 3, 0, w / 3, h); }); }
  else { g.fillStyle = "#1e3a6a"; g.fillRect(0.05 * s, 0, w, h); g.strokeStyle = "#f4f1ea"; g.lineWidth = h * 0.22; g.beginPath(); g.moveTo(0.05 * s, 0); g.lineTo(0.05 * s + w, h); g.moveTo(0.05 * s + w, 0); g.lineTo(0.05 * s, h); g.moveTo(0.05 * s + w / 2, 0); g.lineTo(0.05 * s + w / 2, h); g.moveTo(0.05 * s, h / 2); g.lineTo(0.05 * s + w, h / 2); g.stroke();
    g.strokeStyle = "#c0302a"; g.lineWidth = h * 0.12; g.beginPath(); g.moveTo(0.05 * s + w / 2, 0); g.lineTo(0.05 * s + w / 2, h); g.moveTo(0.05 * s, h / 2); g.lineTo(0.05 * s + w, h / 2); g.stroke(); }
  g.strokeStyle = "#2a1d16"; g.lineWidth = 2; g.strokeRect(0.05 * s, 0, w, h); g.restore();
}
function shadeGer(g: Ctx, c: Cam, k: number) {
  const G = [6.1, 50.8, 6, 51.9, 7, 52.4, 7.1, 53.3, 8.6, 53.9, 8.9, 54.9, 9.9, 54.8, 11, 54, 12.5, 54.4, 14.2, 53.9, 16.6, 54.5, 17.5, 53.5, 15.8, 52.5, 16.3, 51.6, 17.8, 51.2, 18.6, 50.1, 16.5, 50.2, 15, 50.9, 14.3, 50.9, 12.3, 50.2, 13.8, 48.8, 16.9, 48.7, 17.1, 47.7, 16.4, 46.8, 14.5, 46.4, 12.1, 46.9, 10.5, 46.9, 9.6, 47.3, 7.6, 47.6, 7.6, 48.9, 6.4, 49.4];
  g.save(); g.globalAlpha = 0.55 * k; g.fillStyle = "#6a1a14"; g.beginPath(); for (let i = 0; i < G.length; i += 2) { const [x, y] = P(c, MX(G[i]), MY(G[i + 1]), 0); if (i) g.lineTo(x, y); else g.moveTo(x, y); } g.closePath(); g.fill(); g.restore();
}
function sea(g: Ctx, c: Cam, lt: number) {
  const [, y0] = P(c, 0, 0, 30), [, yh] = P(c, 0, 0, 2000); const gr = g.createLinearGradient(0, yh, 0, y0); gr.addColorStop(0, "#8d9a9c"); gr.addColorStop(1, "#4e6a72");
  g.fillStyle = gr; g.fillRect(0, yh, VW, y0 - yh);
  g.strokeStyle = "rgba(240,245,240,0.55)"; g.lineWidth = 2; for (let i = 0; i < 14; i++) { const z = 30 + i * i * 2.2, [, y] = P(c, 0, 0, z); g.beginPath(); for (let x = 0; x <= VW; x += 40) g.lineTo(x, y + Math.sin(x * 0.02 + lt * 2 + i) * 2); g.stroke(); }
  const [, yf] = P(c, 0, 0, 26 + Math.sin(lt * 1.3) * 1.5); g.fillStyle = "rgba(245,245,240,0.7)"; g.fillRect(0, yf - 3, VW, 6);
}

// ---------------- frame ----------------
const KICKS: [number, number][] = [[48.02, 10], [48.72, 10], [60.95, 14], [62.15, 12], [63.35, 12], [118.97, 6], [120.6, 16], [170.56, 10], [175.03, 10], [192.0, 10], [200.56, 14], [201.16, 12], [201.76, 12],
  [218.0, 6], [241.0, 8], [242.0, 8], [247.0, 12], [248.8, 12], [253.62, 12], [255.12, 12], [256.62, 12], [265.02, 12], [266.32, 12], [267.62, 12], [272.17, 14], [277.44, 12], [22.78, 14], [24.28, 12]];
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
    if (!BUF) BUF = mk(VW, VH); const b = BUF.getContext("2d")!; drawShot(b, SH[i - 1], t);
    g.save(); g.globalAlpha = 1 - smooth((t - sh.t0) / f); g.drawImage(BUF, 0, 0); g.restore();
  }
  post(g, t);
};
export const SHOT_STARTS = SH.map((s) => s.t0);
