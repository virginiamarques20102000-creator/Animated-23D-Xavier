import type { Cam } from "./engine";
import type { Sc } from "./kit";
export type Shot = {
  t0: number; t1?: number; L: string; v?: string; cam: (u: number, lt: number) => Cam;
  act?: (A: Sc, lt: number, u: number, T: number) => void;
  fade?: number; mood?: [string, number]; wx?: ["rain" | "snow" | "ash" | "dust", number, number];
  /** finishing overrides: bloom strength, saturation */
  bloom?: number; sat?: number;
};
