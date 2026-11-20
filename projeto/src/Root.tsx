import React from "react";
import { Composition } from "remotion";
import { PisaShort, PISA_FRAMES } from "./videos/pisa/Pisa";
import { LampiaoShort, LAMPIAO_FRAMES } from "./videos/lampiao/Lampiao";
import { SamuraiShort, SAMURAI_FRAMES } from "./videos/samurai/Samurai";
import { LutadorShort, LUTADOR_FRAMES } from "./videos/lutador/Lutador";
import { BatidaShort, BATIDA_FRAMES } from "./videos/batida/Batida";
import { SepeShort, SEPE_FRAMES } from "./videos/sepe/Sepe";
import { BridgeShort, BRIDGE_FRAMES } from "./videos/bridge/Bridge";
// Cada desenho novo: copie templates/pisa/ para src/videos/<nome>/, renomeie e registre aqui.
export const Root: React.FC = () => (
  <>
    <Composition id="PisaShort" component={PisaShort} durationInFrames={PISA_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="BridgeShort" component={BridgeShort} durationInFrames={BRIDGE_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="LampiaoShort" component={LampiaoShort} durationInFrames={LAMPIAO_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="SamuraiShort" component={SamuraiShort} durationInFrames={SAMURAI_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="LutadorShort" component={LutadorShort} durationInFrames={LUTADOR_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="BatidaShort" component={BatidaShort} durationInFrames={BATIDA_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="SepeShort" component={SepeShort} durationInFrames={SEPE_FRAMES} fps={30} width={1080} height={1920} />
  </>
);
