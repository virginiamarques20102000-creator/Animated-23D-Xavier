// Bonecos ORIGINAIS da skill (toon.ts: cabeça grande e redonda) dentro do cenário 3D.
// Em modo 3D, A.a / A.s não desenham no canvas 2D: registram o "Act" (mesma pose do motor 2.5D, com respiração,
// olhar, gestos e piscadas) para o e3 desenhar o boneco num cartão dentro do 3D. Expressões ganham vida:
// quem grita/fala alterna a boca, quem ri alterna o riso, todo mundo pisca e muda o olhar.
import { Sc, lid } from "../ww2/kit";
import type { FrontOpts, SideOpts, Outfit, Expr } from "../ww2/toon";
import { drawAct, Act, drawSprite, smooth, hash } from "../ww2/engine";
import { SPR } from "../ww2/paint";
import type { ActorRec, PropRec } from "./e3";
type M3 = { m3?: { actors: ActorRec[]; props: PropRec[] } };

/** a boca/olhos mudam ao longo do tempo (sem estado): fala, riso, susto */
const liveExpr = (e: Expr | undefined, t: number, id: number): Expr | undefined => {
  const k = Math.floor(t * 5 + hash(id) * 7), r = hash(k * 1.7 + id);
  switch (e) {
    case "shout": return r < 0.35 ? "stern" : "shout";
    case "stern": return hash(Math.floor(t * 1.3) + id) > 0.85 ? "shout" : "stern";
    case "laugh": return r < 0.4 ? "grin" : "laugh";
    case "grin": return r < 0.25 ? "laugh" : "grin";
    case "smile": return hash(Math.floor(t * 0.8) + id) > 0.7 ? "smile_closed" : "smile";
    case "fear": return r < 0.3 ? "shock" : "fear";
    case "nervous": return hash(Math.floor(t * 0.9) + id) > 0.75 ? "fear" : "nervous";
    case "neutral": case undefined: { const p = hash(Math.floor(t / 2.6) + id * 3.3); return p > 0.88 ? "smile_closed" : p > 0.8 ? "stern" : e; }
    default: return e;
  }
};

const proto = Sc.prototype as unknown as Sc & M3 & { a: (o: Outfit, id: number, x: number, z: number, f?: FrontOpts, extra?: Partial<Act>) => void; s: (o: Outfit, id: number, x: number, z: number, so?: SideOpts, extra?: Partial<Act>) => void; sp: (k: string, x: number, y: number, z: number, o?: PropRec["o"]) => void };
proto.a = function (this: Sc & M3, o, id, x, z, f = {}, extra = {}) {
  const t = this.t, still = !f.mode || f.mode === "stand" || f.mode === "sit", ph = id * 1.37;
  const talker = f.expr === "shout" || f.expr === "stern" || f.expr === "grin" || f.expr === "smile" || id % 3 === 0, per = 2.4 + 1.3 * hash(id), gp = ((t + hash(id + 5) * per) % per) / per;
  const gest = !talker ? 0 : gp < 0.08 ? -0.18 * Math.sin((gp / 0.08) * Math.PI) : gp < 0.2 ? 0.95 * smooth((gp - 0.08) / 0.12) : gp < 0.42 ? 0.95 + 0.06 * Math.sin((gp - 0.2) * 40) : 0.95 * (1 - smooth((gp - 0.42) / 0.25)) - 0.06 * Math.sin(Math.min(1, (gp - 0.42) / 0.25) * Math.PI * 2);
  const breath = 0.5 + 0.5 * Math.sin(t * 1.9 + ph);
  const live: FrontOpts = still ? { headTilt: (f.headTilt ?? 0) + 4 * Math.sin(t * 1.05 + ph) + 2 * Math.sin(t * 2.3 + ph * 2) + (talker ? 3 * gest : 0),
    look: f.look !== undefined ? f.look + 0.18 * Math.sin(t * 0.7 + ph) : 0.6 * Math.sin(t * 0.45 + ph),
    hip: f.mode === "sit" ? f.hip : (f.hip ?? 0) + 3 * Math.sin(t * 0.6 + ph), crouch: f.mode === "sit" ? f.crouch : (f.crouch ?? 0) + 0.035 * breath,
    armB: f.armB ?? (f.prop ? undefined : 0.3 * Math.sin(t * 0.9 + ph) + gest) } : {};
  const rot = (extra.rot ?? 0) + (still ? 0.018 * Math.sin(t * 0.8 + ph) + 0.012 * gest : 0);
  const act: Act = { o, id, x, z, f: { mode: "stand", blink: lid(t, id), ...f, ...live, expr: liveExpr(f.expr, t, id) }, ...extra, rot };
  if (this.m3) { this.m3.actors.push(act as unknown as ActorRec); return; }
  this.items.push({ z, d: () => drawAct(this.g, this.cam, act) });
};
proto.s = function (this: Sc & M3, o, id, x, z, so = {}, extra = {}) {
  const t = this.t, act: Act = { o, id, x, z, side: true, s: { mode: "stand", blink: lid(t, id), ...so, expr: liveExpr(so.expr, t, id) }, ...extra };
  if (this.m3) { this.m3.actors.push(act as unknown as ActorRec); return; }
  this.items.push({ z, d: () => drawAct(this.g, this.cam, act) });
};
proto.sp = function (this: Sc & M3, k, x, y, z, o = {}) { if (this.m3) { this.m3.props.push({ k, x, y, z, o }); return; } this.items.push({ z, d: () => drawSprite(this.g, this.cam, SPR[k], x, y, z, o) }); };
export const LIVE = true;
