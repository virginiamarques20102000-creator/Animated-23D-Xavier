import React, { useLayoutEffect, useRef } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { renderFrame, FRAMES } from "./story";
import { VW, VH, FPS } from "./engine";

export const PARAGUAI_FRAMES = FRAMES;
export const ParaguaiFilm: React.FC = () => {
  const f = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => { const g = ref.current!.getContext("2d")!; g.setTransform(1, 0, 0, 1, 0, 0); renderFrame(g, f / FPS); }, [f]);
  return <AbsoluteFill style={{ background: "#000" }}><canvas ref={ref} width={VW} height={VH} style={{ width: "100%", height: "100%" }} /></AbsoluteFill>;
};
