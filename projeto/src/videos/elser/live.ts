// Liga o "boneco vivo" (rig.ts) no acumulador de cena do motor 2.5D: toda chamada A.a / A.s (e portanto walkS, walkF, runS,
// marchF, crowd, fall) passa a desenhar o personagem articulado no lugar do cartão antigo.
import { Sc } from "../ww2/kit";
import type { FrontOpts, SideOpts, Outfit } from "../ww2/toon";
import type { Act } from "../ww2/engine";
import { drawPerson, Pose } from "./rig";
import { INKK } from "../ww2/engine";
INKK.k = 0.1; // cenários pintados sem contorno preto (visual próprio deste filme)

const ex = (e: Partial<Act> = {}) => ({ y: e.y, sc: e.sc, rot: e.rot, alpha: e.alpha, dark: e.dark, darkCol: e.darkCol, shadow: e.shadow, noCast: e.noCast });
type ScP = Sc & { a: (o: Outfit, id: number, x: number, z: number, f?: FrontOpts, extra?: Partial<Act>) => void; s: (o: Outfit, id: number, x: number, z: number, so?: SideOpts, extra?: Partial<Act>) => void };
const proto = Sc.prototype as unknown as ScP;
proto.a = function (this: Sc, o, id, x, z, f = {}, extra = {}) {
  const t = this.t, mode = f.mode ?? "stand", walking = mode === "march" || mode === "stroll";
  const facing = f.facing ?? 0, side = facing !== 0 || walking && false;
  const pose: Pose = { t, id, view: side ? "side" : "front", dir: (facing || 1) as 1 | -1, expr: f.expr, look: f.look, headTilt: f.headTilt, prop: (f.prop as Pose["prop"]) ?? null,
    armB: f.armB, wave: f.wave, crouch: f.crouch, sit: mode === "sit", gait: walking ? { p: f.phase ?? 0, cyc: mode === "stroll" ? 1.4 : 1.5 } : null };
  if (mode === "fall") pose.crouch = 0.6;
  this.items.push({ z, d: () => drawPerson(this.g, this.cam, o, x, z, pose, ex(extra)) });
};
proto.s = function (this: Sc, o, id, x, z, so = {}, extra = {}) {
  const t = this.t, run = (so.stride ?? 1) > 1.3, walking = (so.mode ?? "march") === "march" && so.phase !== undefined && so.mode !== "stand";
  const pose: Pose = { t, id, view: "side", dir: extra.flip ? -1 : 1, expr: so.expr, gait: walking ? { p: so.phase ?? 0, cyc: run ? 2.4 : 1.5, run } : null, prop: null };
  this.items.push({ z, d: () => drawPerson(this.g, this.cam, o, x, z, pose, ex(extra)) });
};
export const LIVE = true;
