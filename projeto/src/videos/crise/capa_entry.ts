import { renderCapa } from "./capa";
import { VW, VH } from "./engine";
const raiz = document.getElementById("raiz")!; raiz.dataset.duration = "1";
const c = document.createElement("canvas"); c.width = VW; c.height = VH; raiz.appendChild(c);
const g = c.getContext("2d")!;
(window as any).__hf = { buildReady: { cena: document.fonts.ready } };
window.addEventListener("hf-seek", () => { g.setTransform(1, 0, 0, 1, 0, 0); renderCapa(g, location.hash.slice(1) || "a"); });
