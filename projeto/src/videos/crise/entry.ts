// Página do filme para o render_playwright.mjs (contrato do HyperFrames: hf-seek -> quadro).
import { renderFrame, DUR } from "./story";
import { VW, VH } from "./engine";
const raiz = document.getElementById("raiz")!;
raiz.dataset.duration = String(DUR);
const c = document.createElement("canvas"); c.width = VW; c.height = VH; raiz.appendChild(c);
const g = c.getContext("2d")!;
(window as any).__hf = { buildReady: { cena: document.fonts.ready } };
window.addEventListener("hf-seek", (e: any) => { g.setTransform(1, 0, 0, 1, 0, 0); renderFrame(g, e.detail.time); });
