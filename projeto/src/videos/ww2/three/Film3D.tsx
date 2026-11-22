// The 3D action shots of the WW2 film, on the film's own timeline (frame f = film time f/30). Only frames inside a 3D
// shot are rendered; scripts/ww2_splice.sh cuts them into the 2.5D master. Each shot builds a fresh Stage.
import React, { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useFrame, useThree } from "@react-three/fiber";
import { BlendFunction, BloomEffect, BrightnessContrastEffect, EffectComposer, EffectPass, HueSaturationEffect, NoiseEffect, RenderPass, ToneMappingEffect, ToneMappingMode, VignetteEffect } from "postprocessing";
import { Stage, fogFor, FPS } from "./core";
import { POOL } from "./actors";
import { SHOTS3 } from "./shots3d";
import { overlaysAt } from "../story";

export const shotAt = (T: number) => SHOTS3.findIndex((s) => T >= s.t0 && T < s.t1);

const ShotScene: React.FC<{ idx: number }> = ({ idx }) => {
  const f = useCurrentFrame();
  const { camera, scene, gl, size } = useThree();
  const sh = SHOTS3[idx];
  const S = useMemo(() => { POOL.tick(); const s = new Stage(sh.mood, sh.over); s.cam = camera as THREE.PerspectiveCamera; sh.build(s); scene.fog = fogFor(s.mood); const pm = new THREE.PMREMGenerator(gl); scene.environment = pm.fromEquirectangular(s.envTex()).texture; scene.environmentIntensity = 0.6; pm.dispose(); return s; }, [idx, camera, scene, sh, gl]);
  const composer = useMemo(() => {
    gl.shadowMap.type = THREE.PCFSoftShadowMap;
    const c = new EffectComposer(gl, { multisampling: 4, frameBufferType: THREE.HalfFloatType });
    c.addPass(new RenderPass(scene, camera));
    c.addPass(new EffectPass(camera, new BloomEffect({ blendFunction: BlendFunction.ADD, intensity: sh.bloom ?? 0.9, luminanceThreshold: 0.85, luminanceSmoothing: 0.25, mipmapBlur: true, radius: 0.72 }),
      new ToneMappingEffect({ mode: ToneMappingMode.ACES_FILMIC }), new BrightnessContrastEffect({ contrast: 0.1, brightness: sh.bright ?? 0.02 }), new HueSaturationEffect({ saturation: sh.sat ?? 0.05 }),
      new VignetteEffect({ offset: 0.3, darkness: 0.6 })));
    const n = new NoiseEffect({ blendFunction: BlendFunction.OVERLAY }); n.blendMode.opacity.value = 0.1; c.addPass(new EffectPass(camera, n));
    return c;
  }, [gl, scene, camera, sh]);
  useMemo(() => composer.setSize(size.width, size.height), [composer, size]);
  useFrame(() => composer.render(), 1);
  const t = f / FPS - sh.t0, cam = camera as THREE.PerspectiveCamera, k = sh.cam(t);
  // handheld drift (two incommensurate sines per axis) + shake from blasts
  const hand = sh.hand ?? 0.03, shk = S.shakeAt(t), T = f / FPS;
  const j = (a: number, b: number) => Math.sin(T * a + idx) + 0.5 * Math.sin(T * b + idx * 2);
  cam.position.set(k.p[0] + hand * j(1.3, 3.1) + shk * Math.sin(T * 47), k.p[1] + hand * 0.7 * j(1.1, 2.7) + shk * Math.sin(T * 61), k.p[2] + hand * j(0.9, 2.3));
  cam.up.set(Math.sin(k.roll ?? 0), Math.cos(k.roll ?? 0), 0);
  cam.lookAt(k.l[0] + shk * 0.5 * Math.sin(T * 53), k.l[1] + shk * 0.5 * Math.sin(T * 43), k.l[2]);
  cam.fov = k.fov ?? 38; cam.near = k.near ?? 0.1; cam.far = 6000; cam.updateProjectionMatrix();
  S.update(t);
  return <primitive object={S.root} dispose={null} />;
};

const Overlay: React.FC<{ t: number; white: number }> = ({ t, white }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => { const g = ref.current!.getContext("2d")!; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, 1920, 1080); overlaysAt(g, t);
    if (white > 0) { g.fillStyle = `rgba(255,252,240,${white})`; g.fillRect(0, 0, 1920, 1080); } }, [t, white]);
  return <canvas ref={ref} width={1920} height={1080} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />;
};
export const Ww2Film3D: React.FC = () => {
  const f = useCurrentFrame();
  const idx = shotAt(f / FPS);
  if (idx < 0) return <AbsoluteFill style={{ background: "#000" }} />;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <ThreeCanvas key={idx} width={1920} height={1080} shadows gl={{ antialias: false, stencil: false }} camera={{ fov: 38, near: 0.1, far: 6000 }}>
        <ShotScene idx={idx} />
      </ThreeCanvas>
      <Overlay t={f / FPS} white={SHOTS3[idx].white?.(f / FPS - SHOTS3[idx].t0) ?? 0} />
    </AbsoluteFill>
  );
};
