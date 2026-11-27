import React, {useMemo, useState, useEffect} from 'react';
import * as THREE from 'three';
import {AbsoluteFill, useCurrentFrame, staticFile, delayRender, continueRender, interpolate, spring, Easing} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import {buildWorld, placeShips, SPEED} from './world';
import {cinzel} from '../font';

const FPS = 30, W = 1080, H = 1920;
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
type V3 = [number, number, number];
type Cam = {p: V3; l: V3; fov: number; roll?: number};
const sm = (x: number) => x * x * (3 - 2 * x);

// planos de câmera (t = segundos do vídeo; z0 = posição da nau capitânia)
const SHOTS: {t0: number; t1: number; cam: (tt: number, z0: number) => Cam}[] = [
  {t0: 0, t1: 6.5, cam: (tt, z0) => ({p: [40 - tt * 2, 2.2 + tt * 1.3, z0 + 470 - tt * 14], l: [0, 9, z0 - 220], fov: 48, roll: 0.03 * Math.sin(tt * 0.6)})},
  {t0: 6.5, t1: 13, cam: (tt, z0) => ({p: [58 - tt * 2.5, 7 + tt * 0.5, z0 + 22 - tt * 4], l: [0, 8, z0 - 2], fov: 38, roll: -0.04})},
  {t0: 13, t1: 19, cam: (tt, z0) => { const zc = -SPEED * 13 - 55; return {p: [15, 1.4 + 0.25 * Math.sin(tt * 1.3), zc], l: [0, 7, Math.min(z0 - 10, zc + 30)], fov: 34, roll: 0.05}; }},
  {t0: 19, t1: 25, cam: (tt, z0) => { const k = sm(tt / 6); return {p: [-90 + 70 * k, 175 - 100 * k, z0 + 620 - 260 * k], l: [0, 0, z0 - 60 - 320 * k], fov: 46}; }},
  {t0: 25, t1: 30, cam: (tt, z0) => ({p: [7, 13 - tt * 0.8, z0 + 55 - tt * 6], l: [0, 11, z0 - 450], fov: 44, roll: 0.02})},
];

const Scene3D: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const {camera, scene, gl, advance} = useThree();
  const [tex, setTex] = useState<THREE.Texture | null>(null);
  const [h] = useState(() => delayRender('agua'));
  useEffect(() => { new THREE.TextureLoader().load(staticFile('waternormals.jpg'), (t) => { t.wrapS = t.wrapT = THREE.RepeatWrapping; setTex(t); }); }, []);
  const world = useMemo(() => (tex ? buildWorld(scene, gl, tex) : null), [scene, gl, tex]);
  useEffect(() => { if (world) { advance(performance.now()); requestAnimationFrame(() => { advance(performance.now()); continueRender(h); }); } }, [world, h, advance]);
  useMemo(() => { gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = (window as any).__exp ?? 0.32; gl.outputColorSpace = THREE.SRGBColorSpace; }, [gl]);

  if (!world) return null;
  placeShips(world, t);
  const sh = SHOTS.find((s) => t >= s.t0 && t < s.t1) ?? SHOTS[SHOTS.length - 1];
  const k = sh.cam(t - sh.t0, -SPEED * t);
  const cam = camera as THREE.PerspectiveCamera;
  const j = (a: number, b: number) => Math.sin(t * a) + 0.5 * Math.sin(t * b);
  cam.position.set(k.p[0] + 0.25 * j(1.3, 3.1), k.p[1] + 0.18 * j(1.1, 2.7), k.p[2] + 0.25 * j(0.9, 2.3));
  cam.up.set(Math.sin(k.roll ?? 0), Math.cos(k.roll ?? 0), 0);
  cam.lookAt(k.l[0], k.l[1], k.l[2]);
  cam.fov = k.fov; cam.near = 0.5; cam.far = 20000; cam.updateProjectionMatrix();
  return null;
};

const Title: React.FC<{t: number; a: number; b: number; children: React.ReactNode; top: number; size: number; font?: string; color?: string; slam?: boolean; spacing?: number}> = ({t, a, b, children, top, size, font, color, slam, spacing}) => {
  if (t < a - 0.1 || t > b + 0.1) return null;
  const lf = (t - a) * FPS;
  const sp = spring({frame: lf, fps: FPS, config: slam ? {damping: 10, stiffness: 160} : {damping: 18, stiffness: 70}});
  const out = interpolate(t, [b - 0.35, b], [1, 0], clamp);
  return (
    <div style={{position: 'absolute', top, width: W, textAlign: 'center', opacity: Math.min(1, lf / 6) * out,
      transform: slam ? `scale(${2.2 - 1.2 * sp})` : `translateY(${(1 - sp) * 40}px)`, filter: `blur(${Math.max(0, 1 - sp) * 10}px)`,
      fontFamily: font ?? cinzel, fontWeight: 900, fontSize: size, letterSpacing: (spacing ?? 4) + (slam ? 0 : 8 * (1 - sp)), color: color ?? '#fff',
      textShadow: '0 6px 0 rgba(0,0,0,.6), 0 0 50px rgba(0,0,0,.7)', lineHeight: 1.1}}>{children}</div>
  );
};

export const Sea: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const cutFlash = SHOTS.slice(1).map((s) => Math.exp(-Math.abs(t - s.t0) * 22)).reduce((a, b) => Math.max(a, b), 0);
  const gold = {background: 'linear-gradient(180deg,#fff6d0 0%,#ffd75a 45%,#c98a12 100%)', WebkitBackgroundClip: 'text', color: 'transparent'} as React.CSSProperties;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <ThreeCanvas width={W} height={H} gl={{antialias: false, stencil: false, alpha: false}} camera={{fov: 45, near: 0.5, far: 20000}}>
        <Scene3D />
      </ThreeCanvas>
      <AbsoluteFill style={{background: 'linear-gradient(180deg,rgba(0,0,0,.35) 0%,transparent 22%,transparent 70%,rgba(0,0,0,.55) 100%)'}} />
      <Title t={t} a={0.6} b={6.3} top={300} size={240} slam><span style={gold}>1500</span></Title>
      <Title t={t} a={1.5} b={6.3} top={590} size={42} font="Inter" color="#ffe6b0" spacing={12}>RUMO AO DESCONHECIDO</Title>
      <Title t={t} a={7.2} b={12.8} top={1450} size={56} font="Inter">13 naus · cerca de 1.500 homens</Title>
      <Title t={t} a={7.5} b={12.8} top={1530} size={38} font="Inter" color="#ffd75a" spacing={6}>A FROTA DE PEDRO ÁLVARES CABRAL</Title>
      <Title t={t} a={13.6} b={18.8} top={300} size={64}>22 DE ABRIL</Title>
      <Title t={t} a={20.2} b={24.8} top={760} size={120} slam>TERRA<br />À VISTA!</Title>
      <Title t={t} a={25.8} b={30} top={300} size={44} font="Inter" color="#ffe6b0" spacing={10}>A HISTÓRIA DO</Title>
      <Title t={t} a={26.1} b={30} top={360} size={170}><span style={gold}>BRASIL</span></Title>
      <Title t={t} a={26.8} b={30} top={560} size={44} font="Inter" color="#ffe6b0" spacing={10}>COMEÇA AQUI</Title>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,.55) 100%)'}} />
      <AbsoluteFill style={{backgroundImage: `url(${staticFile('grain.png')})`, backgroundPosition: `${(f * 137) % 512}px ${(f * 251) % 512}px`, opacity: 0.07, mixBlendMode: 'overlay'}} />
      <AbsoluteFill style={{background: '#fff8e8', opacity: cutFlash * 0.55}} />
      <AbsoluteFill style={{background: '#000', opacity: interpolate(t, [0, 0.4, 29.4, 30], [1, 0, 0, 1], clamp)}} />
    </AbsoluteFill>
  );
};
