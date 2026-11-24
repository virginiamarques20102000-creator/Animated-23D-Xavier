import React from "react";
import { Composition } from "remotion";
import { PisaShort, PISA_FRAMES } from "./videos/pisa/Pisa";
import { LampiaoShort, LAMPIAO_FRAMES } from "./videos/lampiao/Lampiao";
import { SamuraiShort, SAMURAI_FRAMES } from "./videos/samurai/Samurai";
import { LutadorShort, LUTADOR_FRAMES } from "./videos/lutador/Lutador";
import { BatidaShort, BATIDA_FRAMES } from "./videos/batida/Batida";
import { SepeShort, SEPE_FRAMES } from "./videos/sepe/Sepe";
import { HitlerShort, HITLER_FRAMES } from "./videos/hitler/Hitler";
import { BridgeShort, BRIDGE_FRAMES } from "./videos/bridge/Bridge";
import { TrincheirasFilm, TRINCHEIRAS_FRAMES } from "./videos/trincheiras/Trincheiras";
import { TrincheirasCapa } from "./videos/trincheiras/Capa";
import { Ww2Film, WW2_FRAMES } from "./videos/ww2/Ww2";
import { Ww2Test3D, TEST3D_FRAMES } from "./videos/ww2/Test3D";
import { ContestadoFilm, CONTESTADO_FRAMES } from "./videos/contestado/Contestado";
import { ContestadoCapa } from "./videos/contestado/Capa";
import { Ww2Film3D } from "./videos/ww2/three/Film3D";
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
    <Composition id="TrincheirasFilm" component={TrincheirasFilm} durationInFrames={TRINCHEIRAS_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="TrincheirasCapa" component={TrincheirasCapa} durationInFrames={1} fps={30} width={1920} height={1080} />
    <Composition id="Ww2Film" component={Ww2Film} durationInFrames={WW2_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="Ww2Film3D" component={Ww2Film3D} durationInFrames={WW2_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="Ww2Test3D" component={Ww2Test3D} durationInFrames={TEST3D_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="ContestadoFilm" component={ContestadoFilm} durationInFrames={CONTESTADO_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="ContestadoCapa" component={ContestadoCapa} durationInFrames={1} fps={30} width={1920} height={1080} />
    <Composition id="HitlerShort" component={HitlerShort} durationInFrames={HITLER_FRAMES} fps={30} width={1920} height={1080} />
  </>
);
