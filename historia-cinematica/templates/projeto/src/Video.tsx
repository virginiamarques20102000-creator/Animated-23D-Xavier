import React from 'react';
import {AbsoluteFill, Img, Audio, OffthreadVideo, Sequence, staticFile, useCurrentFrame, interpolate, Easing, spring, random, getInputProps} from 'remotion';
import {cinzel} from './font';
import {SHOTS, Shot, BEATS, Beat, TOTAL, END_START} from './scenes';
import {Flag} from './Flag';
import {MG} from './mg';

const W = 1080, H = 1920, FPS = 30;
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const io = Easing.bezier(0.45, 0, 0.55, 1);
const outE = Easing.bezier(0.16, 1, 0.3, 1);
const TD: Record<Shot['tIn'], number> = {whipL: 10, whipR: 10, whipU: 10, zoom: 12, blurzoom: 10, flash: 4, leak: 16, cut: 0};

// ---------- câmera: pan/zoom + giro 3D + punch no corte ----------
const Painting: React.FC<{s: Shot; f: number}> = ({s, f}) => {
  const td = TD[s.tIn] / 2;
  const nx = SHOTS[SHOTS.indexOf(s) + 1];
  const a = s.start - td, b = s.end + (nx ? TD[nx.tIn] / 2 : 0);
  const lin = interpolate(f, [a, b], [0, 1], clamp);
  const e = s.ease === 'io' ? io(lin) : outE(lin);
  const p = 0.7 * e + 0.3 * lin; // sempre em movimento
  const [cx0, cy0, z0] = s.cam[0], [cx1, cy1, z1] = s.cam[1];
  const cx = cx0 + (cx1 - cx0) * p, cy = cy0 + (cy1 - cy0) * p, z = z0 + (z1 - z0) * p;
  const sc = Math.max((H / s.h) * z, (W / s.w) * z);
  const iw = s.w * sc, ih = s.h * sc;
  const left = Math.min(0, Math.max(W - iw, W / 2 - cx * iw));
  const top = Math.min(0, Math.max(H - ih, H / 2 - cy * ih));
  const [ry0, ry1] = s.tilt ?? [0, 0];
  const ry = ry0 + (ry1 - ry0) * p;
  const rz = (s.rot ?? 0) * (p - 0.5);
  const punch = s.tIn === 'cut' || s.tIn === 'flash' ? 1 + 0.1 * (1 - outE(interpolate(f, [s.start, s.start + 10], [0, 1], clamp))) : 1;
  return (
    <AbsoluteFill style={{overflow: 'hidden', perspective: 1400}}>
      <AbsoluteFill style={{transform: `rotateY(${ry}deg) rotateZ(${rz}deg) scale(${1.1 * punch})`, filter: s.grade}}>
        {s.mg ? React.createElement(MG[s.mg], {lf: f - s.start + 6, dur: s.end - s.start + 12, v: s.v}) : s.video ? (
          <Sequence from={s.start - 12} layout="none"><OffthreadVideo src={staticFile(`vid/${s.video}.mp4`)} muted startFrom={Math.max(0, Math.round(s.from ?? 0))}
            style={{position: 'absolute', left: W / 2 - (cx - 0.5) * W * z * 0.6 - (W * z) / 2, top: H / 2 - (cy - 0.5) * H * z * 0.6 - (H * z) / 2, width: W * z, height: H * z, objectFit: 'cover'}} /></Sequence>
        ) : (
          <Img src={staticFile(`img/${s.img}.jpg`)} style={{position: 'absolute', left, top, width: iw, height: ih}} />
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------- transições ----------
function inStyle(t: Shot['tIn'], u: number): React.CSSProperties {
  const e = io(u), mb = Math.sin(Math.PI * u) * 40;
  switch (t) {
    case 'whipL': return {transform: `translateX(${W * (1 - e)}px)`, filter: `blur(${mb}px)`};
    case 'whipR': return {transform: `translateX(${-W * (1 - e)}px)`, filter: `blur(${mb}px)`};
    case 'whipU': return {transform: `translateY(${H * (1 - e)}px)`, filter: `blur(${mb}px)`};
    case 'zoom': return {transform: `scale(${1.8 - 0.8 * Easing.out(Easing.cubic)(u)})`, opacity: interpolate(u, [0.3, 0.6], [0, 1], clamp), filter: `blur(${(1 - u) * 30}px)`};
    case 'blurzoom': return {transform: `scale(${0.7 + 0.3 * Easing.out(Easing.cubic)(u)})`, opacity: interpolate(u, [0.35, 0.6], [0, 1], clamp), filter: `blur(${(1 - u) * 24}px)`};
    case 'flash': return {opacity: u >= 0.5 ? 1 : 0};
    case 'leak': return {opacity: interpolate(u, [0.2, 0.8], [0, 1], clamp)};
    default: return {};
  }
}
function outStyle(t: Shot['tIn'], u: number): React.CSSProperties {
  const e = io(u), mb = Math.sin(Math.PI * u) * 40;
  switch (t) {
    case 'whipL': return {transform: `translateX(${-W * e}px)`, filter: `blur(${mb}px)`};
    case 'whipR': return {transform: `translateX(${W * e}px)`, filter: `blur(${mb}px)`};
    case 'whipU': return {transform: `translateY(${-H * e}px)`, filter: `blur(${mb}px)`};
    case 'zoom': return {transform: `scale(${1 + 1.5 * Easing.in(Easing.cubic)(u)})`, filter: `blur(${u * 28}px)`};
    case 'blurzoom': return {transform: `scale(${1 + 0.9 * Easing.in(Easing.cubic)(u)})`, filter: `blur(${u * 24}px)`, opacity: interpolate(u, [0.4, 0.65], [1, 0], clamp)};
    case 'flash': return {opacity: u >= 0.5 ? 0 : 1};
    default: return {};
  }
}

// ---------- textos ----------
const Year: React.FC<{b: Beat; f: number}> = ({b, f}) => {
  if (!b.year && !b.label) return null;
  const lf = f - b.start;
  if (lf < 0) return null;
  const sp = spring({frame: lf, fps: FPS, config: {damping: 11, stiffness: 150, mass: 0.8}});
  const out = interpolate(f, [b.end - 6, b.end + 2], [1, 0], clamp);
  let label = b.label ?? '';
  if (b.year) label = String(Math.round(interpolate(lf, [0, 14], b.year, {...clamp, easing: Easing.out(Easing.cubic)})));
  const long = label.length > 5;
  return (
    <div style={{position: 'absolute', top: 200, width: W, textAlign: 'center', opacity: Math.min(1, lf / 3) * out,
      transform: `scale(${2.4 - 1.4 * sp}) translateY(${(1 - out) * -50}px)`, filter: `blur(${Math.max(0, 1 - sp) * 16}px)`}}>
      <div style={{fontFamily: cinzel, fontWeight: 900, fontSize: long ? 128 : 230, letterSpacing: long ? 2 : 6, lineHeight: 1.25, paddingTop: 20,
        background: 'linear-gradient(180deg,#fff6d0 0%,#ffd75a 45%,#c98a12 100%)', WebkitBackgroundClip: 'text', color: 'transparent',
        filter: 'drop-shadow(0 8px 0 rgba(0,0,0,.55)) drop-shadow(0 0 40px rgba(0,0,0,.6))'}}>{label}</div>
      <div style={{width: 520 * Math.min(1, lf / 12), height: 5, margin: '18px auto 0', background: 'linear-gradient(90deg,transparent,#ffd75a,transparent)'}} />
    </div>
  );
};

const Big: React.FC<{b: Beat; f: number}> = ({b, f}) => {
  if (!b.big) return null;
  const lf = f - (b.bigAt ?? b.start);
  if (lf < 0) return null;
  const out = interpolate(f, [b.end - 6, b.end + 2], [1, 0], clamp);
  return (
    <div style={{position: 'absolute', top: 650, width: W, textAlign: 'center', opacity: out}}>
      {b.big.split('\n').map((line, i) => {
        const sp = spring({frame: lf - i * 6, fps: FPS, config: {damping: 9, stiffness: 190}});
        return (
          <div key={i} style={{fontFamily: cinzel, fontWeight: 900, fontSize: 98, color: '#fff', lineHeight: 1.08, letterSpacing: 2,
            opacity: lf - i * 6 > 0 ? 1 : 0, transform: `scale(${3 - 2 * sp})`,
            textShadow: '0 6px 0 #000, 0 0 50px rgba(0,0,0,.9), 0 0 120px rgba(255,200,60,.35)'}}>{line}</div>
        );
      })}
    </div>
  );
};

const Caption: React.FC<{b: Beat; f: number}> = ({b, f}) => {
  if (!b.caption) return null;
  const t0 = b.start + (b.capDelay ?? 8);
  const out = interpolate(f, [b.end - 6, b.end + 1], [1, 0], clamp);
  return (
    <div style={{position: 'absolute', top: 1300, left: 70, right: 70, textAlign: 'center', opacity: out}}>
      <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '6px 18px'}}>
        {b.caption.split(' ').map((w, i) => {
          const lf = f - t0 - i * 2;
          const sp = spring({frame: lf, fps: FPS, config: {damping: 14, stiffness: 220}});
          const hi = w.startsWith('*');
          return (
            <span key={i} style={{fontFamily: 'Inter', fontWeight: 800, fontSize: 64, lineHeight: 1.18, color: hi ? '#FFD84D' : '#fff',
              opacity: lf > 0 ? Math.min(1, lf / 3) : 0, transform: `translateY(${(1 - sp) * 40}px) scale(${hi ? 0.85 + 0.2 * sp : 0.85 + 0.15 * sp})`, display: 'inline-block',
              textShadow: '0 4px 0 rgba(0,0,0,.85), 0 0 24px rgba(0,0,0,.8)'}}>{w.replace(/\*/g, '')}</span>
          );
        })}
      </div>
    </div>
  );
};

const Intro: React.FC<{f: number}> = ({f}) => {
  if (f > 70) return null;
  const sp = spring({frame: f - 2, fps: FPS, config: {damping: 15, stiffness: 100}});
  const out = interpolate(f, [52, 66], [1, 0], clamp);
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', opacity: out, background: `rgba(0,0,0,${0.45 * out})`, transform: `scale(${1 + (1 - out) * 0.4})`}}>
      <div style={{fontFamily: 'Inter', fontWeight: 700, fontSize: 40, letterSpacing: 14, color: '#ffd75a', opacity: sp}}>A HISTÓRIA DO</div>
      <div style={{fontFamily: cinzel, fontWeight: 900, fontSize: 190, color: '#fff', letterSpacing: 10 * sp, transform: `scale(${1.3 - 0.3 * sp})`,
        textShadow: '0 8px 0 #000, 0 0 60px rgba(0,0,0,.8)', filter: `blur(${Math.max(0, 1 - sp) * 12}px)`}}>BRASIL</div>
      <div style={{width: 600 * sp, height: 5, background: 'linear-gradient(90deg,#009c3b,#ffdf00,#002776)', marginTop: 10}} />
    </AbsoluteFill>
  );
};

const Timeline: React.FC<{f: number}> = ({f}) => {
  const marks = BEATS.filter((b) => b.tick).map((b) => ({label: b.tick!, at: b.start}));
  const xs = marks.map((_, i) => i / (marks.length - 1));
  const prog = interpolate(f, marks.map((m) => m.at + 8), xs, {...clamp, easing: io});
  const op = interpolate(f, [62, 76, END_START - 8, END_START + 4], [0, 1, 1, 0], clamp);
  const L = 100, R = W - 100, X = (v: number) => L + (R - L) * v;
  return (
    <div style={{position: 'absolute', top: 1730, left: 0, width: W, height: 120, opacity: op}}>
      <div style={{position: 'absolute', left: L, width: R - L, top: 30, height: 4, background: 'rgba(255,255,255,.28)', borderRadius: 2}} />
      <div style={{position: 'absolute', left: L, width: X(prog) - L, top: 30, height: 4, background: '#ffd75a', borderRadius: 2, boxShadow: '0 0 16px #ffb000'}} />
      {marks.map((m, i) => {
        const on = prog >= xs[i] - 0.001;
        return (
          <div key={i}>
            <div style={{position: 'absolute', left: X(xs[i]) - 7, top: 25, width: 14, height: 14, borderRadius: 7, background: on ? '#ffd75a' : '#777'}} />
            <div style={{position: 'absolute', left: X(xs[i]) - 60, width: 120, top: 52, textAlign: 'center', fontFamily: 'Inter', fontWeight: 700, fontSize: 26,
              color: on ? '#fff' : 'rgba(255,255,255,.45)', textShadow: '0 2px 6px #000'}}>{m.label}</div>
          </div>
        );
      })}
      <div style={{position: 'absolute', left: X(prog) - 13, top: 19, width: 26, height: 26, borderRadius: 13, background: '#fff', boxShadow: '0 0 24px 6px rgba(255,215,90,.9)'}} />
    </div>
  );
};

// poeira/brasas em 3 profundidades (dá sensação de profundidade/paralaxe)
const PARTS = new Array(46).fill(0).map((_, i) => ({x: random(`px${i}`), y: random(`py${i}`), d: random(`pd${i}`), s: random(`ps${i}`)}));
const Particles: React.FC<{f: number}> = ({f}) => {
  const t = f / FPS;
  return (
    <AbsoluteFill style={{mixBlendMode: 'screen', pointerEvents: 'none'}}>
      {PARTS.map((p, i) => {
        const depth = 0.3 + p.d * 1.7; // perto = maior, mais rápido, mais desfocado
        const x = ((p.x * W + t * 40 * depth + Math.sin(t * 0.9 + i) * 30) % (W + 200)) - 100;
        const y = (((p.y * H - t * 70 * depth) % (H + 200)) + H + 200) % (H + 200) - 100;
        const size = 3 + depth * depth * 9;
        const blur = depth > 1.4 ? (depth - 1.2) * 10 : 0;
        const tw = 0.5 + 0.5 * Math.sin(t * 3 + i * 1.7);
        return <div key={i} style={{position: 'absolute', left: x, top: y, width: size, height: size, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,220,150,1) 0%, rgba(255,160,60,.6) 45%, transparent 70%)', opacity: (0.25 + 0.5 * tw) * (depth > 1.4 ? 0.6 : 1), filter: `blur(${blur}px)`}} />;
      })}
    </AbsoluteFill>
  );
};

const LightLeak: React.FC<{f: number; at: number}> = ({f, at}) => {
  const u = interpolate(f, [at - 16, at + 16], [0, 1], clamp);
  if (u <= 0 || u >= 1) return null;
  return (
    <AbsoluteFill style={{mixBlendMode: 'screen', opacity: Math.sin(Math.PI * u),
      background: `radial-gradient(circle at ${10 + 80 * u}% ${75 - 50 * u}%, rgba(255,170,40,.95) 0%, rgba(255,80,0,.6) 25%, transparent 60%),
                   radial-gradient(circle at ${90 - 70 * u}% ${15 + 35 * u}%, rgba(255,230,160,.85) 0%, transparent 45%)`}} />
  );
};

export const Video: React.FC = () => {
  const f = useCurrentFrame();
  const withMusic = (getInputProps() as any).music === true;
  // tremor de câmera
  let sx = 0, sy = 0;
  for (const b of BEATS) {
    for (const at of b.shake ?? []) {
      const k = f - at;
      if (k >= 0 && k < 16) {
        const amp = 26 * Math.exp(-k / 4.5);
        sx += (random(`x${f}`) - 0.5) * amp; sy += (random(`y${f}`) - 0.5) * amp;
      }
    }
  }
  const layers: React.ReactNode[] = [];
  SHOTS.forEach((s, i) => {
    const tdIn = TD[s.tIn] / 2, nx = SHOTS[i + 1], tdOut = nx ? TD[nx.tIn] / 2 : 0;
    if (f < s.start - tdIn || f >= s.end + tdOut) return;
    let st: React.CSSProperties = {};
    if (tdIn > 0 && f < s.start + tdIn) st = inStyle(s.tIn, (f - (s.start - tdIn)) / (2 * tdIn));
    if (nx && tdOut > 0 && f >= s.end - tdOut) st = {...st, ...outStyle(nx.tIn, (f - (s.end - tdOut)) / (2 * tdOut))};
    layers.push(<AbsoluteFill key={i} style={st}><Painting s={s} f={f} /></AbsoluteFill>);
  });
  const flash = SHOTS.filter((s) => s.tIn === 'flash').map((s) => Math.exp(-Math.abs(f - s.start) / 3)).reduce((x, y) => Math.max(x, y), 0);
  const gx = Math.floor(random(`g${f}`) * 512), gy = Math.floor(random(`h${f}`) * 512);
  return (
    <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: `translate(${sx}px,${sy}px)`, filter: 'contrast(1.1) saturate(1.15) sepia(.06)'}}>
        {layers}
      </AbsoluteFill>
      {f >= END_START - 6 && <Flag f={f} start={END_START} />}
      <AbsoluteFill style={{background: 'linear-gradient(180deg,rgba(0,0,0,.55) 0%,rgba(0,0,0,0) 28%,rgba(0,0,0,0) 55%,rgba(0,0,0,.78) 82%,rgba(0,0,0,.9) 100%)'}} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,.6) 100%)'}} />
      <AbsoluteFill style={{mixBlendMode: 'screen', opacity: 0.16, background: `conic-gradient(from ${200 + Math.sin(f / 40) * 8}deg at 15% -10%, transparent 0deg, rgba(255,220,150,.9) 8deg, transparent 16deg, rgba(255,220,150,.7) 24deg, transparent 34deg, rgba(255,220,150,.8) 44deg, transparent 52deg)`}} />
      <Particles f={f} />
      {SHOTS.filter((s) => s.tIn === 'leak').map((s, i) => <LightLeak key={i} f={f} at={s.start} />)}
      <AbsoluteFill style={{transform: `translate(${sx * 0.5}px,${sy * 0.5}px)`}}>
        {BEATS.map((b, i) => (f >= b.start - 2 && f <= b.end + 4 ? (
          <React.Fragment key={i}><Year b={b} f={f} /><Big b={b} f={f} /><Caption b={b} f={f} /></React.Fragment>) : null))}
      </AbsoluteFill>
      <Timeline f={f} />
      <Intro f={f} />
      <AbsoluteFill style={{background: '#fff', opacity: flash * 0.9}} />
      <AbsoluteFill style={{backgroundImage: `url(${staticFile('grain.png')})`, backgroundPosition: `${gx}px ${gy}px`, opacity: 0.09, mixBlendMode: 'overlay'}} />
      <AbsoluteFill style={{background: '#000', opacity: interpolate(f, [0, 5, TOTAL - 10, TOTAL], [1, 0, 0, 1], clamp)}} />
      {withMusic && <Audio src={staticFile('music.wav')} />}
    </AbsoluteFill>
  );
};
