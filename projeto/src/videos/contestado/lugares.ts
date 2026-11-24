// Places of the Contestado film: the plateau of araucarias under different lights, interiors, the sawmill yard, the reduto, maps.
import type { Layer, Ground } from "./engine";
import { loc, clouds, city, wall, forest } from "./places";
import { arauc, arauc1, campos, serra, cerca, milho } from "./props";
import type { Loc } from "./paint";

export type Mood = "day" | "gold" | "dusk" | "night" | "grey" | "fire" | "dawn" | "sepia" | "storm" | "moon";
export const SKY: Record<Mood, [string, string]> = {
  day: ["#3f7fcf", "#dfe9ea"], gold: ["#56609a", "#ffcf96"], dusk: ["#2c2a58", "#ee9a70"], night: ["#05080f", "#182236"], grey: ["#5e6874", "#b6bcc0"],
  fire: ["#0c080c", "#6a2818"], dawn: ["#4a5a8e", "#f6d2b0"], sepia: ["#8a7a62", "#e8d6b2"], storm: ["#2a3038", "#6a7278"], moon: ["#0a1426", "#2c3c58"],
};
const FOR: Record<Mood, [string, string, string, string]> = { // far serra, far araucaria, hills, near araucaria
  day: ["#8aa0b8", "#4e7a5c", "#7a9a52", "#2e5a32"], gold: ["#9a88a0", "#6a6a52", "#a89a5a", "#3a4a2a"], dusk: ["#5a4a6a", "#3e3a46", "#6a5a4a", "#24222a"],
  night: ["#1a2232", "#141c26", "#1e2a24", "#0e1410"], grey: ["#8a9098", "#5a6a62", "#6a7a5a", "#34463a"], fire: ["#3a1e1a", "#2a1612", "#3a2418", "#160c0a"],
  dawn: ["#a89ab0", "#6a7a72", "#8a9a6a", "#38503a"], sepia: ["#b8a888", "#8a7a5a", "#a8946a", "#5a4a32"], storm: ["#4a5058", "#3a4440", "#4a5a44", "#24302a"], moon: ["#2a3448", "#1a2432", "#22302a", "#101a14"],
};
const GR: Record<Mood, [string, string]> = {
  day: ["#5f7d3a", "#86a25a"], gold: ["#6a6a32", "#a8984e"], dusk: ["#3e3a2e", "#6a5a44"], night: ["#141a16", "#1e2620"], grey: ["#4e5e3a", "#7a8a62"],
  fire: ["#2a1a12", "#3a2418"], dawn: ["#5a6a3a", "#8a9a62"], sepia: ["#7a6a4a", "#b8a47a"], storm: ["#3a4630", "#56624a"], moon: ["#101810", "#1a2620"],
};
export const ground = (m: Mood, kind: Ground["kind"] = "grass", seed = 3): Ground => ({ near: GR[m][0], far: GR[m][1], kind, seed, zFar: 500 });
/** open plateau with araucarias: serra far away, belts of pines, rolling grassland */
export const plat = (K: string, m: Mood, o: { extra?: Layer[]; dense?: number; kind?: Ground["kind"]; fields?: boolean; fence?: number; near?: [number, number, number][]; noFar?: boolean; cloudy?: boolean } = {}): Loc => {
  const [fs, fa, fh, fn] = FOR[m], d = o.dense ?? 1;
  const L: Layer[] = [];
  if (!o.noFar) L.push(serra(K, 320, fs, 7, 46, 3));
  if (o.cloudy || m === "day" || m === "gold" || m === "dawn") L.push(clouds(K, 260, m === "gold" || m === "dawn" ? ["#ffe2c0", "#e8a890"] : m === "grey" || m === "storm" ? ["#9aa0a8", "#6a7078"] : ["#ffffff", "#c8d4e4"], 5, 34, 80, 14, 4));
  L.push(arauc(K, 150, fa, Math.round(40 * d), 11, { h: 26, blur: 1.5, under: fa }), campos(K, 70, fh, 4, 7, 0.8), arauc(K, 55, fa, Math.round(16 * d), 23, { h: 24, blur: 0.8 }));
  if (o.fields) L.push(milho(K, 16, 40, 5));
  if (o.fence) L.push(cerca(K, o.fence, 30));
  for (const [x, z, h] of o.near ?? []) L.push(arauc1(K, x, z, h, fn, z < 8 ? 0 : 0.5));
  L.push(...(o.extra ?? []));
  return loc(SKY[m], ground(m, o.kind ?? "grass"), L);
};
/** deep forest: trunks everywhere, little sky */
export const mata = (K: string, m: Mood, o: { extra?: Layer[] } = {}): Loc => {
  const [, fa, , fn] = FOR[m];
  return loc(SKY[m], ground(m, "mud"), [arauc(K, 90, fa, 40, 31, { h: 28, blur: 2, under: fa }), forest(K, 40, "pine", fa, 30, 7, { h: 16, blur: 1 }), arauc(K, 26, fn, 22, 41, { h: 24, blur: 0.4 }), forest(K, 14, "oak", fn, 14, 9, { h: 9 }), ...(o.extra ?? [])]);
};
/** room interior (office, government, house) */
export const sala = (K: string, col: string, o: Parameters<typeof wall>[3] & { floor?: [string, string] } = {}): Loc =>
  loc(undefined, { near: o.floor?.[0] ?? "#3a2a1e", far: o.floor?.[1] ?? "#4a3628", kind: "wood", zFar: 10 }, [wall(K, 4, col, { h: 5, wid: 12, ...o })], true);
/** town street of the period (Curitiba / Rio) */
export const cidade = (K: string, m: Mood, pal: string[], seed: number): Loc =>
  loc(SKY[m], { near: m === "night" ? "#22242a" : "#8a8070", far: m === "night" ? "#2e3036" : "#a8a090", kind: "cobble", seed }, [city(K, 24, { pal, seed, roof: "gable", roofCol: "#8a4a3a", floors: [2, 3], hgt: [9, 12], shutter: "#3a5a4a", lit: m === "night" ? 0.4 : 0 })]);
export { loc };
