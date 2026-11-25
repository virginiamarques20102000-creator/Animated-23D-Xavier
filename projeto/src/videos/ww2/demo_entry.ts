// Página da demo para o render_playwright.mjs (mesmo contrato do HyperFrames: hf-seek -> quadro).
import { demoQuadro, DEMO_DUR } from "./demo_dinamica";
import { VW, VH } from "./engine";
const modo = (location.hash.slice(1) || "depois") as "antes" | "depois";
const raiz = document.getElementById("raiz")!;
raiz.dataset.duration = String(DEMO_DUR);
const c = document.createElement("canvas"); c.width = VW; c.height = VH; raiz.appendChild(c);
const g = c.getContext("2d")!;
(window as any).__hf = { buildReady: { cena: document.fonts.ready } };
window.addEventListener("hf-seek", (e: any) => { g.setTransform(1, 0, 0, 1, 0, 0); demoQuadro(g, e.detail.time, modo); });
