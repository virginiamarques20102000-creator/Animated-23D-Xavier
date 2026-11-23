// Lighting presets for character cards (cast shadow + rim + key colour) — each shot can tweak them.
import type { Lite } from "./engine";
export const DAY: Partial<Lite> = { sx: 0.7, sy: 0.3, sa: 0.36, rim: "#fff4dc", ra: 0.45, rdx: 1, rdy: -0.7 };
export const GOLD: Partial<Lite> = { sx: 1.1, sy: 0.34, sa: 0.42, rim: "#ffcf8a", ra: 0.95, rdx: 1, rdy: -0.25, key: "#ffe0b0", ka: 0.18 };
export const BACK: Partial<Lite> = { sx: 0.2, sy: -0.35, sa: 0.4, rim: "#ffd8a0", ra: 1, rdx: 0.2, rdy: -1, key: "#b8a8c8", ka: 0.22 };
export const GREY: Partial<Lite> = { sx: 0.3, sy: 0.2, sa: 0.16, rim: "#e8eef4", ra: 0.25, rdx: 0.4, rdy: -1, key: "#c8ccd4", ka: 0.12 };
export const NIGHTFIRE: Partial<Lite> = { sx: -0.6, sy: -0.25, sa: 0.32, scol: "#000", rim: "#ffa060", ra: 1, rdx: -1, rdy: -0.35, key: "#c8a0a8", ka: 0.3 };
export const MOON: Partial<Lite> = { sx: 0.5, sy: 0.25, sa: 0.25, rim: "#a8c8ff", ra: 0.85, rdx: 0.8, rdy: -0.8, key: "#8090b8", ka: 0.35 };
export const LAMP: Partial<Lite> = { sx: -0.4, sy: 0.25, sa: 0.3, rim: "#ffc880", ra: 0.85, rdx: -0.9, rdy: -0.6, key: "#ffd8a8", ka: 0.2 };
export const COLD: Partial<Lite> = { sx: 0.5, sy: 0.25, sa: 0.28, rim: "#e0f0ff", ra: 0.6, rdx: 0.8, rdy: -0.8, key: "#c8d8ec", ka: 0.18 };
export const RED: Partial<Lite> = { sx: 0.4, sy: 0.25, sa: 0.3, rim: "#ff6a4a", ra: 0.9, rdx: 1, rdy: -0.4, key: "#e0a0a0", ka: 0.3 };
export const NOON: Partial<Lite> = { sx: 0.25, sy: 0.18, sa: 0.5, rim: "#fffbe8", ra: 0.4, rdx: 0.3, rdy: -1, key: "#fff0d0", ka: 0.1 };
