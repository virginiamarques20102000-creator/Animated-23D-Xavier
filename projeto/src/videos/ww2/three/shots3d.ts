// All 3D shots (action scenes) on the film timeline; the rest of the film stays in the 2.5D engine.
import { SHOTS_A } from "./shots3d_a";
import { SHOTS_B } from "./shots3d_b";
import type { Shot3 } from "./set";
export const SHOTS3: Shot3[] = [...SHOTS_A, ...SHOTS_B].sort((a, b) => a.t0 - b.t0);
