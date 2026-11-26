// Elenco da crise de 2008 — caricaturas fiéis à aparência real de cada um.
import type { Outfit } from "./toon";
import { mix } from "./toon";
const PELE = { lula: "#f0c49e", chavez: "#c48a5e", correa: "#e6b48a", uribe: "#f2cfb0", amorim: "#f2d2b6", reyes: "#d8a074", tropa: "#c89468" };
/** Lula 2008: barba e cabelo grisalhos, corpo atarracado; de vermelho com a estrela do PT */
export const LULA: Outfit = { jacket: "#c8161e", pants: "#2a2a30", boots: "#141414", hat: "hair", hair: "#c8c4bc", beard: "#cfcbc3", moustache: "#bfbab0", build: "stout", skin: PELE.lula, pt: true, shirt: "#f4f0e8" };
/** Lula de terno escuro com gravata vermelha e broche do PT (cerimônias) */
export const LULA_T: Outfit = { ...LULA, jacket: "#26283a", tie: "#c8161e", shirt: undefined };
/** Hugo Chávez: rosto largo, cabelo preto, boina vermelha de paraquedista e camisa vermelha */
export const CHAVEZ: Outfit = { jacket: "#c41a1a", pants: "#3a3a30", boots: "#141414", hat: "beret", cap: "#b4141c", hair: "#1a1410", build: "stout", skin: PELE.chavez, flagPin: ["#f4c81e", "#1e3a96", "#cf1f2e"] };
export const CHAVEZ_H: Outfit = { ...CHAVEZ, hat: "hair" };
/** Rafael Correa: cabelo escuro, sorriso largo, camisa branca com bordado andino */
export const CORREA: Outfit = { jacket: "#f6f4ee", pants: "#2a2a34", boots: "#141414", hat: "hair", hair: "#2a2420", skin: PELE.correa, bordado: "#c8402a" };
export const CORREA_T: Outfit = { ...CORREA, jacket: "#2a2e3e", tie: "#2a4a8a", bordado: undefined, shirt: "#f4f2ec" };
/** Álvaro Uribe: magro, óculos, cabelo curto grisalho, terno escuro */
export const URIBE: Outfit = { jacket: "#22242e", pants: "#22242e", boots: "#141414", hat: "hair", hair: "#7a7066", glasses: true, skin: PELE.uribe, tie: "#7a2a2a" };
export const URIBE_R: Outfit = { ...URIBE, jacket: "#e8e2d4", tie: undefined, scarf: "#8a7a5a" };
/** Celso Amorim: cabelo branco, óculos, terno cinza */
export const AMORIM: Outfit = { jacket: "#4a4e5a", pants: "#4a4e5a", boots: "#141414", hat: "hair", hair: "#ecebe6", glasses: true, skin: PELE.amorim, tie: "#2a4a7a" };
/** Raúl Reyes (comandante das FARC): barba preta cheia, óculos, boné e farda camuflada */
export const REYES: Outfit = { jacket: "#4e5a3a", pants: "#4a5236", boots: "#141414", hat: "cap", cap: "#2a2e22", hair: "#141210", beard: "#171412", moustache: "#171412", glasses: true, skin: PELE.reyes, camo: ["#3a4428", "#6a6a44", "#2a2a1e"], belt: "#2a2418" };
const CAMO_CO = ["#3e4a2e", "#5e6a42", "#2a3020", "#7a7a52"];
/** soldado colombiano (camuflado, capacete) */
export const solCO = (i: number): Outfit => ({ jacket: "#56623e", pants: "#4e5838", boots: "#141414", hat: "m1", cap: mix("#3e4a30", "#000000", 0.05 * (i % 3)), rifle: true, skin: i % 3 ? PELE.tropa : PELE.uribe, camo: CAMO_CO, belt: "#2a2418" });
/** guerrilheiro (farda verde-oliva, boné ou boina) */
export const guerr = (i: number): Outfit => ({ jacket: ["#4e5a3a", "#5a5a3e", "#46503a"][i % 3], pants: "#3e4630", boots: "#141414", hat: i % 2 ? "cap" : "beret", cap: i % 2 ? "#2e3424" : "#1e1e1e", hair: "#141210", rifle: i % 3 !== 2, skin: i % 2 ? PELE.reyes : PELE.tropa, moustache: i % 4 === 1 ? "#141210" : undefined, camo: ["#3a4428", "#6a6a44"] });
/** soldado venezuelano (verde, boina vermelha das forças de Chávez) */
export const solVE = (i: number): Outfit => ({ jacket: "#5a6440", pants: "#4e5636", boots: "#141414", hat: i % 3 === 0 ? "beret" : "m1", cap: i % 3 === 0 ? "#b4141c" : "#4a5434", rifle: true, skin: i % 2 ? PELE.chavez : PELE.tropa, camo: ["#4a5434", "#6e7448", "#3a4028"], belt: "#2a2418" });
/** soldado equatoriano */
export const solEC = (i: number): Outfit => ({ jacket: "#5e6644", pants: "#545c3c", boots: "#141414", hat: "m1", cap: "#4a5236", rifle: true, skin: PELE.correa, camo: ["#4a5236", "#7a7a52"] });
/** assessores, diplomatas, jornalistas, militantes */
const TERNOS = ["#26283a", "#3a3a44", "#2e3448", "#4a4a52", "#3a3028", "#2a2a2e"];
export const assessor = (i: number): Outfit => ({ jacket: TERNOS[i % 6], pants: TERNOS[(i + 2) % 6], boots: "#141414", hat: i % 4 === 3 ? "longhair" : "hair", hair: ["#2a1d16", "#5a4030", "#8a8680", "#141414"][i % 4], cap: i % 4 === 3 ? "#3a2418" : undefined, dress: i % 4 === 3 ? TERNOS[(i + 1) % 6] : undefined, glasses: i % 3 === 1, tie: i % 4 === 3 ? undefined : ["#7a2a2a", "#2a4a7a", "#3a5a3a"][i % 3] });
export const jornal = (i: number): Outfit => ({ jacket: ["#5a6a7a", "#7a5a4a", "#4a5a4a", "#6a6a6a", "#3a3a5a"][i % 5], pants: "#2a2a30", boots: "#2a2420", hat: i % 3 === 2 ? "longhair" : "hair", hair: ["#2a1d16", "#6a4a2a", "#141414", "#b8905a"][i % 4], cap: "#3a2418", dress: i % 3 === 2 ? "#6a4a6a" : undefined, glasses: i % 4 === 1 });
export const militante = (i: number): Outfit => ({ jacket: i % 4 === 3 ? "#f4f0e8" : "#d01a22", pants: ["#2a3a5a", "#2a2a30", "#3a4a6a"][i % 3], boots: "#2a2420", hat: i % 3 === 0 ? "cap" : i % 3 === 1 ? "hair" : "longhair", cap: "#c8161e", hair: ["#2a1d16", "#5a3a22", "#141414", "#8a5a32"][i % 4], dress: i % 3 === 2 ? "#c8161e" : undefined, skin: ["#f0c49e", "#c48a5e", "#8a5a3a", "#e6b48a"][i % 4], pt: i % 2 === 0 });
export { PELE };
