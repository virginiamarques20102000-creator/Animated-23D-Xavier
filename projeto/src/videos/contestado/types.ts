import type { Cam, Lite } from "./engine";
import type { Sc } from "./kit";
import type { Loc } from "./places";
export type Shot = {
  t0: number; t1?: number; L: () => Loc; cam: (u: number, lt: number) => Cam;
  act?: (A: Sc, lt: number, u: number, T: number) => void;
  fade?: number; mood?: [string, number]; wx?: ["rain" | "snow" | "ash" | "dust", number, number];
  /** finishing: bloom strength, saturation, soft-light colour grade [colour, amount] */
  bloom?: number; sat?: number; grade?: [string, number]; lite?: Partial<Lite>; kicks?: [number, number][];
  /** entry transition: whip pan smear, punch-in zoom, white flash */
  tr?: "whip" | "punch" | "flash";
};
