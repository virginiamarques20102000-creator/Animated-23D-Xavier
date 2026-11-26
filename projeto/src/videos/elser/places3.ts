// Mesmas funções de cenário do places.ts, mas cada camada leva uma "spec" que o motor 3D (e3) usa para construir
// geometria de verdade (montanhas, colinas, florestas, cidades, muros, faixas, cercas). Sem spec, a camada vira um
// plano pintado dentro do 3D.
import * as P0 from "../ww2/places";
import type { Layer } from "../ww2/engine";
export type Spec = { t: string; [k: string]: unknown };
export type Layer3 = Layer & { spec?: Spec };
const tag = (L: Layer, spec: Spec): Layer3 => Object.assign(L, { spec });
export const mtn = (K: string, z: number, col: string, seed: number, h = 60, snow = true, blur = 2, wid = 2.6) => tag(P0.mtn(K, z, col, seed, h, snow, blur, wid), { t: "mtn", z, col, seed, h, snow, wid });
export const hillL = (K: string, z: number, col: string, seed: number, h = 10, blur = 1, wid = 2.2, ink = 3) => tag(P0.hillL(K, z, col, seed, h, blur, wid, ink), { t: "hill", z, col, seed, h, wid });
export const clouds = (K: string, z: number, cols: [string, string], seed: number, y0 = 30, y1 = 90, n = 26, blur = 3, wid = 2.4) => tag(P0.clouds(K, z, cols, seed, y0, y1, n, blur, wid), { t: "clouds", z, cols, seed, y0, y1, n, wid });
export const city = (K: string, z: number, o: Parameters<typeof P0.city>[2]) => tag(P0.city(K, z, o), { t: "city", z, o });
export const skyline = (K: string, z: number, col: string, kind: Parameters<typeof P0.skyline>[3], seed = 3, blur = 1.5, lit = "") => tag(P0.skyline(K, z, col, kind, seed, blur, lit), { t: "skyline", z, col, kind, seed, lit });
export const forest = (K: string, z: number, kind: Parameters<typeof P0.forest>[2], col: string, n: number, seed: number, o: Parameters<typeof P0.forest>[6] = {}) => tag(P0.forest(K, z, kind, col, n, seed, o), { t: "forest", z, kind, col, n, seed, o });
export const wall = (K: string, z: number, col: string, o: Parameters<typeof P0.wall>[3] = {}) => tag(P0.wall(K, z, col, o), { t: "wall", z, col, o });
export const banners = (K: string, z: number, n: number, wid: number, top: number, hgt: number, col = "#b3221c") => tag(P0.banners(K, z, n, wid, top, hgt, col), { t: "banners", z, n, wid, top, hgt, col });
export const ruins = (K: string, z: number, pal: string[], seed: number, o: Parameters<typeof P0.ruins>[4] = {}) => tag(P0.ruins(K, z, pal, seed, o), { t: "city", z, o: { pal, seed, ruin: true, hgt: o.hgt, x0: o.x0, x1: o.x1 } });
export const field = (K: string, z: number, kind: Parameters<typeof P0.field>[2], col: string, seed: number, h = 1.2, wid = 30, blur = 0) => tag(P0.field(K, z, kind, col, seed, h, wid, blur), { t: "field", z, kind, col, seed, h, wid });
export const wire = (K: string, z: number, wid = 20, col = "#2a2624") => tag(P0.wire(K, z, wid, col), { t: "wire", z, wid, col });
export const pier = (K: string, z: number, col = "#6a5040", wid = 20) => tag(P0.pier(K, z, col, wid), { t: "pier", z, col, wid });
export const cliffs = (K: string, z: number, col: string, top: string, seed: number, h = 30, blur = 1) => tag(P0.cliffs(K, z, col, top, seed, h, blur), { t: "hill", z, col, seed, h, wid: 2 });
export const dunes = (K: string, z: number, col: string, seed: number, h = 6, blur = 1) => tag(P0.dunes(K, z, col, seed, h, blur), { t: "hill", z, col, seed, h, wid: 2 });
export const { loc, europe, world, ST, MX, MY, WX, WY, facade, church, mix, shade, rng } = P0;
