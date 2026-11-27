import React, {useMemo, useState, useEffect} from 'react';
import * as THREE from 'three';
import {AbsoluteFill, useCurrentFrame, staticFile, delayRender, continueRender, interpolate, spring, random, Easing} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import {buildWorld, animate, H} from './world';
import {cinzel} from '../font';

const FPS = 30, W = 1080, Hh = 1920;
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const sm = (x: number) => { const c = Math.min(1, Math.max(0, x)); return c * c * (3 - 2 * c); };
const H0 = H(0, 0);
type Cam = {p: number[]; l: number[]; fov: number; roll?: number};
// t em segundos; cada plano devolve câmera
const SHOTS: {t0: number; t1: number; cam: (tt: number, t: number) => Cam}[] = [
  {t0: 0, t1: 3.6, cam: (tt) => { const gx = -150 + tt * 11.5; return {p: [gx + 22 - tt * 2, H(gx, 40) + 3.5 + tt * 0.8, 40 - tt * 3], l: [gx + 4, H(gx, -6) + 1.5, -6], fov: 36, roll: 0.03}; }},
  {t0: 3.6, t1: 6.6, cam: (tt) => ({p: [30 - tt * 4, H0 + 12, 70], l: [0, H0 + 2, 0], fov: 35})},
  {t0: 6.6, t1: 9.4, cam: (tt) => { const a = 0.55 - tt * 0.09; return {p: [Math.sin(a) * 15, H0 + 0.6, Math.cos(a) * 15], l: [0.3, H0 + 2.4, 0], fov: 38, roll: -0.03}; }},
  {t0: 9.4, t1: 12, cam: (tt) => ({p: [-0.2 + tt * 0.25, H0 + 0.8, 9.5 + tt * 0.35], l: [-0.3, H0 + 3.0, 0], fov: 36, roll: 0.05})},
  {t0: 12, t1: 15, cam: (tt) => { const k = sm(tt / 3); return {p: [8 + 50 * k, H0 + 2 + 55 * k, 22 + 110 * k], l: [-6 * k, H0 + 2 - 4 * k, 0], fov: 38 + 8 * k}; }},
];
const rearAt = (t: number) => sm((t - 7.6) / 0.6) * (1 - sm((t - 13.5) / 1.2) * 0.5);
const swordAt = (t: number) => sm((t - 8.2) / 0.5);

const Scene3D: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const {camera, scene, gl, advance} = useThree();
  const [tex, setTex] = useState<THREE.Texture | null>(null);
  const [h] = useState(() => delayRender('agua'));
  useEffect(() => { new THREE.TextureLoader().load(staticFile('waternormals.jpg'), (x) => { x.wrapS = x.wrapT = THREE.RepeatWrapping; setTex(x); }); }, []);
  const world = useMemo(() => (tex ? buildWorld(scene, gl, tex) : null), [scene, gl, tex]);
  useEffect(() => { if (world) { advance(performance.now()); requestAnimationFrame(() => { advance(performance.now()); continueRender(h); }); } }, [world, h, advance]);
  useMemo(() => { gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = 0.36; gl.outputColorSpace = THREE.SRGBColorSpace; }, [gl]);
  if (!world) return null;
  animate(world, t, rearAt(t), swordAt(t), 0);
  const sh = SHOTS.find((s) => t >= s.t0 && t < s.t1) ?? SHOTS[SHOTS.length - 1];
  const k = sh.cam(t - sh.t0, t);
  const cam = camera as THREE.PerspectiveCamera;
  const shake = [8.8, 9.4].map((a) => (t > a ? Math.exp(-(t - a) * 5) : 0)).reduce((x, y) => x + y, 0) * 0.25;
  const j = (a: number, b: number) => Math.sin(t * a) + 0.5 * Math.sin(t * b);
  cam.position.set(k.p[0] + 0.08 * j(1.3, 3.1) + shake * Math.sin(t * 61), k.p[1] + 0.06 * j(1.1, 2.7) + shake * Math.sin(t * 47), k.p[2] + 0.08 * j(0.9, 2.3));
  cam.up.set(Math.sin(k.roll ?? 0), Math.cos(k.roll ?? 0), 0);
  cam.lookAt(k.l[0], k.l[1], k.l[2]);
  cam.fov = k.fov; cam.near = 0.1; cam.far = 20000; cam.updateProjectionMatrix();
  return null;
};

const T: React.FC<{t: number; a: number; b: number; top: number; size: number; font?: string; color?: string; slam?: boolean; sp?: number; children: React.ReactNode}> = ({t, a, b, top, size, font, color, slam, sp: ls, children}) => {
  if (t < a - 0.05 || t > b + 0.05) return null;
  const lf = (t - a) * FPS;
  const s = spring({frame: lf, fps: FPS, config: slam ? {damping: 9, stiffness: 170} : {damping: 18, stiffness: 80}});
  const out = interpolate(t, [b - 0.3, b], [1, 0], clamp);
  return <div style={{position: 'absolute', top, left: 40, right: 40, textAlign: 'center', opacity: Math.min(1, lf / 5) * out,
    transform: slam ? `scale(${2.6 - 1.6 * s})` : `translateY(${(1 - s) * 40}px)`, filter: `blur(${Math.max(0, 1 - s) * 10}px)`,
    fontFamily: font ?? cinzel, fontWeight: 900, fontSize: size, letterSpacing: ls ?? 3, color: color ?? '#fff', lineHeight: 1.08,
    textShadow: '0 6px 0 rgba(0,0,0,.65), 0 0 50px rgba(0,0,0,.75)'}}>{children}</div>;
};

// carta de Lisboa (plano 2)
const Letter: React.FC<{t: number}> = ({t}) => {
  const a = 3.6, b = 6.6;
  if (t < a - 0.2 || t > b + 0.2) return null;
  const lf = (t - a) * FPS;
  const en = spring({frame: lf, fps: FPS, config: {damping: 15, stiffness: 70}});
  const tear = interpolate(t, [5.7, 6.4], [0, 1], {...clamp, easing: Easing.in(Easing.cubic)});
  const txt = 'Ordenamos que Vossa Alteza regresse imediatamente a Portugal.';
  const n = Math.floor(interpolate(t, [4.0, 5.2], [0, txt.length], clamp));
  const half = (side: number) => (
    <div style={{position: 'absolute', left: side < 0 ? 0 : 400, top: 0, width: 400, height: 640, overflow: 'hidden',
      transform: `translate(${side * tear * 380}px, ${tear * tear * 600}px) rotate(${side * tear * 28}deg)`}}>
      <div style={{position: 'absolute', left: side < 0 ? 0 : -400, width: 800, height: 640, background: 'linear-gradient(160deg,#fbf0d2,#e6cf9c)', boxSizing: 'border-box', padding: '56px 60px',
        boxShadow: 'inset 0 0 70px rgba(120,80,20,.4)'}}>
        <div style={{fontFamily: cinzel, fontWeight: 900, fontSize: 44, color: '#3b2410', textAlign: 'center'}}>CORTES DE LISBOA</div>
        <div style={{fontFamily: 'Inter', fontWeight: 700, fontSize: 22, letterSpacing: 6, color: '#7a5a2a', textAlign: 'center', marginTop: 6}}>AGOSTO DE 1822</div>
        <div style={{height: 3, background: '#8a6a30', margin: '26px 30px'}} />
        <div style={{fontFamily: 'DejaVu Serif, serif', fontStyle: 'italic', fontSize: 44, lineHeight: 1.35, color: '#2a1a08'}}>{txt.slice(0, n)}</div>
        <div style={{position: 'absolute', right: 70, bottom: 60, width: 120, height: 120, borderRadius: '50%', background: 'radial-gradient(circle,#c0262b,#7a0f12)',
          transform: `scale(${spring({frame: lf - 48, fps: FPS, config: {damping: 8}})})`, boxShadow: '0 4px 10px rgba(0,0,0,.4)'}} />
      </div>
    </div>
  );
  return (
    <AbsoluteFill style={{background: `rgba(10,6,2,${0.55 * interpolate(t, [a, a + 0.3, b - 0.2, b], [0, 1, 1, 0], clamp)})`}}>
      <div style={{position: 'absolute', left: 140, top: 520, width: 800, height: 640,
        transform: `perspective(1600px) rotateX(${(1 - en) * 55 + Math.sin(t * 1.3) * 3}deg) rotateZ(${-4 + Math.sin(t) * 1.5}deg) translateY(${(1 - en) * 700}px)`,
        filter: 'drop-shadow(0 40px 50px rgba(0,0,0,.7))'}}>
        {half(-1)}{half(1)}
      </div>
    </AbsoluteFill>
  );
};

export const Pedro: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const cutFlash = SHOTS.slice(1).map((s) => Math.exp(-Math.abs(t - s.t0) * 20)).reduce((a, b) => Math.max(a, b), 0);
  const swordFlash = t > 8.7 ? Math.exp(-(t - 8.7) * 6) : 0;
  const gold = {background: 'linear-gradient(180deg,#fff6d0 0%,#ffd75a 45%,#c98a12 100%)', WebkitBackgroundClip: 'text', color: 'transparent'} as React.CSSProperties;
  const blur3d = t > 3.7 && t < 6.5 ? 8 : 0;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <AbsoluteFill style={{filter: blur3d ? `blur(${blur3d}px) brightness(.8)` : undefined}}>
        <ThreeCanvas width={W} height={Hh} gl={{antialias: true, stencil: false, alpha: false}} camera={{fov: 40, near: 0.1, far: 20000}}>
          <Scene3D />
        </ThreeCanvas>
      </AbsoluteFill>
      {/* brilho do sol e raios */}
      <AbsoluteFill style={{mixBlendMode: 'screen', opacity: 0.15 + 0.4 * swordFlash, background: `repeating-conic-gradient(from ${t * 6}deg at 50% 40%, rgba(255,200,120,.5) 0deg 3deg, transparent 3deg 12deg)`,
        maskImage: 'radial-gradient(circle at 50% 40%, #000 0%, transparent 55%)', WebkitMaskImage: 'radial-gradient(circle at 50% 40%, #000 0%, transparent 55%)'}} />
      <AbsoluteFill style={{background: 'linear-gradient(180deg,rgba(0,0,0,.4) 0%,transparent 25%,transparent 68%,rgba(0,0,0,.6) 100%)'}} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,.55) 100%)'}} />
      {/* partículas de poeira dourada */}
      <AbsoluteFill style={{mixBlendMode: 'screen'}}>
        {new Array(40).fill(0).map((_, i) => {
          const d = 0.4 + random(`d${i}`) * 1.4, x = (random(`x${i}`) * W + t * 30 * d) % W, y = (random(`y${i}`) * Hh - t * 40 * d + Hh * 3) % Hh, s = 3 + d * d * 6;
          return <div key={i} style={{position: 'absolute', left: x, top: y, width: s, height: s, borderRadius: '50%', background: 'radial-gradient(circle,#ffe0a0,transparent 70%)', opacity: 0.5, filter: d > 1.4 ? 'blur(3px)' : undefined}} />;
        })}
      </AbsoluteFill>
      <Letter t={t} />
      <T t={t} a={0.4} b={3.5} top={280} size={60}>7 DE SETEMBRO</T>
      <T t={t} a={0.6} b={3.5} top={360} size={150} slam><span style={gold}>1822</span></T>
      <T t={t} a={1.2} b={3.5} top={540} size={36} font="Inter" color="#ffe6b0" sp={10}>ÀS MARGENS DO IPIRANGA</T>
      <T t={t} a={3.9} b={5.3} top={1380} size={52} font="Inter">Portugal exige a volta do príncipe...</T>
      <T t={t} a={5.4} b={6.5} top={1420} size={58} font="Inter" color="#ffd75a">Dom Pedro, 23 anos, rasga a ordem.</T>
      <T t={t} a={6.9} b={9.3} top={1440} size={56} font="Inter">Ele ergue a espada e grita:</T>
      <T t={t} a={9.45} b={12} top={300} size={96} slam>INDEPENDÊNCIA</T>
      <T t={t} a={9.7} b={12} top={420} size={110} slam>OU MORTE!</T>
      <T t={t} a={12.3} b={15} top={300} size={44} font="Inter" color="#ffe6b0" sp={12}>NASCE O</T>
      <T t={t} a={12.5} b={15} top={360} size={120}><span style={gold}>IMPÉRIO DO</span></T>
      <T t={t} a={12.7} b={15} top={490} size={150}><span style={gold}>BRASIL</span></T>
      <AbsoluteFill style={{backgroundImage: `url(${staticFile('grain.png')})`, backgroundPosition: `${(f * 137) % 512}px ${(f * 251) % 512}px`, opacity: 0.07, mixBlendMode: 'overlay'}} />
      <AbsoluteFill style={{background: '#fff8e8', opacity: Math.max(cutFlash * 0.5, swordFlash * 0.9)}} />
      <AbsoluteFill style={{background: '#000', opacity: interpolate(t, [0, 0.3, 14.5, 15], [1, 0, 0, 1], clamp)}} />
    </AbsoluteFill>
  );
};
