// Cenas animadas feitas por código (originais, sem direitos de terceiros)
import React from 'react';
import {AbsoluteFill, interpolate, spring, Easing, random} from 'remotion';
import {cinzel} from './font';

const W = 1080, H = 1920;
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
type P = {lf: number; dur: number; v?: number};

// ---------------------------------------------------------------- mar com caravelas
const Ship: React.FC<{x: number; y: number; s: number; rot: number; shade: number}> = ({x, y, s, rot, shade}) => (
  <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`} opacity={shade}>
    <path d="M -120 0 L 120 0 L 95 38 L -90 38 Z" fill="#3a2414" />
    <path d="M -120 0 L -150 -30 L -100 -4 Z" fill="#3a2414" />
    <rect x="-4" y="-210" width="7" height="212" fill="#2a1a0e" />
    <rect x="-74" y="-150" width="6" height="152" fill="#2a1a0e" />
    <rect x="62" y="-140" width="6" height="142" fill="#2a1a0e" />
    <path d="M -60 -195 Q 0 -175 58 -195 L 54 -70 Q 0 -55 -56 -70 Z" fill="#efe2c4" />
    <path d="M -110 -140 Q -72 -128 -36 -140 L -38 -50 Q -72 -42 -108 -50 Z" fill="#e8d8b6" />
    <path d="M 30 -130 Q 65 -118 100 -130 L 98 -46 Q 65 -38 32 -46 Z" fill="#e8d8b6" />
    <path d="M -14 -165 h 28 v 18 h -28 z M -6 -175 h 12 v 60 h -12 z" fill="#b3201c" />
    <path d="M 0 -210 L 32 -200 L 0 -190 Z" fill="#b3201c" />
  </g>
);
export const Ocean: React.FC<P> = ({lf, dur, v = 0}) => {
  const t = lf / 30;
  const push = 1 + 0.12 * (lf / dur);
  const layers = [
    {y: 1020, a: 10, f: 0.006, s: 0.6, c: '#5f8fa8'},
    {y: 1120, a: 16, f: 0.005, s: 0.9, c: '#3f7690'},
    {y: 1260, a: 24, f: 0.0042, s: 1.2, c: '#2a5c76'},
    {y: 1430, a: 34, f: 0.0035, s: 1.6, c: '#1b445b'},
    {y: 1640, a: 46, f: 0.003, s: 2.1, c: '#102f42'},
  ];
  const wave = (L: typeof layers[0], x: number, k: number) => L.y + L.a * Math.sin(x * L.f + t * L.s + k) + L.a * 0.45 * Math.sin(x * L.f * 2.3 - t * L.s * 1.3 + k * 2);
  const path = (L: typeof layers[0], k: number) => {
    let d = `M 0 ${H} `;
    for (let x = 0; x <= W; x += 20) d += `L ${x} ${wave(L, x, k).toFixed(1)} `;
    return d + `L ${W} ${H} Z`;
  };
  const ships = v === 0
    ? [{L: 1, x: 300 + t * 22, s: 0.55}, {L: 2, x: 760 - t * 10, s: 0.8}, {L: 3, x: 180 + t * 35, s: 1.25}]
    : [{L: 2, x: 820 - t * 18, s: 0.9}, {L: 4, x: 420 + t * 40, s: 2.1}];
  return (
    <AbsoluteFill style={{transform: `scale(${push})`}}>
      <AbsoluteFill style={{background: 'linear-gradient(180deg,#1d2b55 0%,#6a4d78 30%,#e8855a 55%,#ffd08a 66%)'}} />
      <div style={{position: 'absolute', left: 540 - 170, top: 820, width: 340, height: 340, borderRadius: '50%',
        background: 'radial-gradient(circle,#fff6d8 0%,#ffd27a 35%,rgba(255,160,80,0) 70%)'}} />
      {[0, 1, 2, 3].map((i) => (
        <div key={i} style={{position: 'absolute', top: 300 + i * 120, left: ((i * 330 + t * (14 + i * 6)) % 1500) - 400, width: 520 + i * 60, height: 70 + i * 10,
          borderRadius: 60, background: 'rgba(255,220,200,.22)', filter: 'blur(18px)'}} />
      ))}
      <svg width={W} height={H} style={{position: 'absolute'}}>
        {layers.map((L, i) => (
          <React.Fragment key={i}>
            <path d={path(L, i * 1.7)} fill={L.c} />
            <path d={path({...L, y: L.y + 6}, i * 1.7)} fill="none" stroke="rgba(255,235,200,.35)" strokeWidth={2 + i} />
            {ships.filter((sh) => sh.L === i).map((sh, j) => {
              const x = ((sh.x % 1400) + 1400) % 1400 - 160;
              const y = wave(L, x, i * 1.7);
              const slope = (wave(L, x + 10, i * 1.7) - y) / 10;
              return <Ship key={j} x={x} y={y - 8} s={sh.s} rot={Math.atan(slope) * 57} shade={0.75 + 0.25 * (i / 4)} />;
            })}
          </React.Fragment>
        ))}
        {[0, 1, 2, 3, 4].map((i) => {
          const bx = ((i * 230 + t * 60) % 1300) - 100, by = 520 + i * 40 + Math.sin(t * 2 + i) * 12, fl = Math.sin(t * 9 + i) * 10;
          return <path key={i} d={`M ${bx - 18} ${by + fl} Q ${bx - 8} ${by - 6} ${bx} ${by} Q ${bx + 8} ${by - 6} ${bx + 18} ${by + fl}`} stroke="#2b1b2a" strokeWidth={4} fill="none" />;
        })}
      </svg>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- chuva de ouro + cana
export const Gold: React.FC<P> = ({lf, dur}) => {
  const t = lf / 30;
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 40%, #6b4312 0%, #2a1705 60%, #0c0602 100%)', transform: `scale(${1.05 + 0.1 * lf / dur})`}}>
      {new Array(70).fill(0).map((_, i) => {
        const d = 0.4 + random(`gd${i}`) * 1.2;
        const x = random(`gx${i}`) * W;
        const y = ((random(`gy${i}`) * 2400 + t * 520 * d) % 2400) - 300;
        const spin = t * (3 + random(`gs${i}`) * 4) + i;
        const sz = 34 * d + 10;
        return <div key={i} style={{position: 'absolute', left: x, top: y, width: sz, height: sz, borderRadius: '50%',
          transform: `scaleX(${Math.cos(spin)}) rotate(${i * 20}deg)`, filter: d < 0.7 ? 'blur(3px)' : d > 1.4 ? 'blur(2px)' : undefined,
          background: `radial-gradient(circle at ${50 + 30 * Math.sin(spin)}% 30%, #fff6c0 0%, #ffcf40 30%, #c88a10 70%, #7a4e05 100%)`,
          boxShadow: '0 0 18px rgba(255,190,60,.6)'}} />;
      })}
      <svg width={W} height={H} style={{position: 'absolute'}}>
        {new Array(26).fill(0).map((_, i) => {
          const x = i * 44 + 10, h = 520 + random(`ch${i}`) * 380, sw = Math.sin(t * 1.6 + i * 0.7) * 26;
          return (
            <g key={i}>
              <path d={`M ${x} ${H} Q ${x + sw * 0.3} ${H - h / 2} ${x + sw} ${H - h}`} stroke="#1f3b10" strokeWidth={14} fill="none" />
              {[0.3, 0.5, 0.7].map((k, j) => <path key={j} d={`M ${x + sw * k * k} ${H - h * k} q ${j % 2 ? 90 : -90} -40 ${j % 2 ? 150 : -150} 30`} stroke="#2d5418" strokeWidth={9} fill="none" />)}
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- correntes + contador
const Chain: React.FC<{y: number; phase: number; t: number; dark: number}> = ({y, phase, t, dark}) => {
  const links = [];
  for (let i = 0; i < 16; i++) {
    const x = -60 + i * 78;
    const sag = Math.sin((i / 15) * Math.PI) * 90;
    const sw = Math.sin(t * 1.4 + phase + i * 0.25) * 20;
    links.push(<ellipse key={i} cx={x} cy={y + sag + sw} rx={52} ry={24} fill="none" stroke={`rgb(${120 * dark},${110 * dark},${100 * dark})`}
      strokeWidth={16} transform={`rotate(${i % 2 ? 0 : 0} ${x} ${y})`} opacity={i % 2 ? 1 : 0.9} />);
    if (i % 2) links.push(<rect key={`r${i}`} x={x - 6} y={y + sag + sw - 26} width={12} height={52} rx={6} fill={`rgb(${150 * dark},${140 * dark},${130 * dark})`} />);
  }
  return <g>{links}</g>;
};
export const Chains: React.FC<P> = ({lf, dur}) => {
  const t = lf / 30;
  const n = Math.round(interpolate(lf, [10, dur - 20], [0, 4800000], {...clamp, easing: Easing.out(Easing.cubic)}));
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 45%, #3a0d0b 0%, #120404 70%, #050101 100%)', transform: `scale(${1.15 - 0.1 * lf / dur})`}}>
      <svg width={W} height={H} style={{position: 'absolute', filter: 'drop-shadow(0 20px 20px rgba(0,0,0,.8))'}}>
        <g style={{filter: 'blur(5px)'}}><Chain y={260} phase={2} t={t} dark={0.5} /></g>
        <Chain y={1480} phase={0} t={t} dark={1} />
        <g style={{filter: 'blur(8px)'}}><Chain y={1050} phase={4} t={t} dark={0.8} /></g>
      </svg>
      <div style={{position: 'absolute', top: 640, width: W, textAlign: 'center', fontFamily: cinzel, fontWeight: 900, fontSize: 150, color: '#fff',
        textShadow: '0 6px 0 #000, 0 0 60px rgba(200,40,20,.7)', opacity: interpolate(lf, [6, 14], [0, 1], clamp)}}>
        {n.toLocaleString('pt-BR')}
      </div>
      <div style={{position: 'absolute', top: 830, width: W, textAlign: 'center', fontFamily: 'Inter', fontWeight: 800, fontSize: 44, letterSpacing: 8, color: '#ff9a7a',
        opacity: interpolate(lf, [14, 24], [0, 1], clamp)}}>AFRICANOS ESCRAVIZADOS</div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- mapa: Lisboa → Rio
export const MapRoute: React.FC<P> = ({lf, dur}) => {
  const t = lf / 30;
  const A = {x: 860, y: 430}, B = {x: 250, y: 1360}, C = {x: 980, y: 1250};
  const p = interpolate(lf, [10, dur - 25], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const bez = (u: number) => ({x: (1 - u) ** 2 * A.x + 2 * (1 - u) * u * C.x + u * u * B.x, y: (1 - u) ** 2 * A.y + 2 * (1 - u) * u * C.y + u * u * B.y});
  const pts = new Array(61).fill(0).map((_, i) => bez((i / 60) * p));
  const sp = bez(p), sp2 = bez(Math.min(1, p + 0.01));
  const ang = Math.atan2(sp2.y - sp.y, sp2.x - sp.x) * 57;
  const camX = interpolate(p, [0, 1], [-120, 140]), camY = interpolate(p, [0, 1], [200, -260]);
  const pin = (q: {x: number; y: number}, label: string, on: number) => (
    <g opacity={on}>
      <circle cx={q.x} cy={q.y} r={18 + 30 * ((t * 1.2) % 1)} fill="none" stroke="#b3201c" strokeWidth={4} opacity={1 - ((t * 1.2) % 1)} />
      <circle cx={q.x} cy={q.y} r={16} fill="#b3201c" stroke="#fff4d8" strokeWidth={5} />
      <text x={q.x} y={q.y - 40} textAnchor="middle" fontFamily={cinzel} fontWeight={900} fontSize={54} fill="#3b2410">{label}</text>
    </g>
  );
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 50%, #f3e2b8 0%, #d9bd85 60%, #a9844a 100%)'}}>
      <AbsoluteFill style={{transform: `translate(${camX}px,${camY}px) scale(${1.25 + 0.1 * Math.sin(t * 0.5)})`}}>
        <svg width={W} height={H} style={{position: 'absolute'}}>
          {new Array(14).fill(0).map((_, i) => <line key={`h${i}`} x1={-400} x2={1500} y1={i * 160 - 200} y2={i * 160 - 200} stroke="rgba(90,60,20,.18)" strokeWidth={2} />)}
          {new Array(12).fill(0).map((_, i) => <line key={`v${i}`} y1={-400} y2={2300} x1={i * 160 - 300} x2={i * 160 - 300} stroke="rgba(90,60,20,.18)" strokeWidth={2} />)}
          {/* costas estilizadas */}
          <path d="M 760 250 Q 820 330 800 420 Q 830 520 900 560 L 1300 560 L 1300 200 Z" fill="rgba(120,90,40,.35)" stroke="#6b4a1e" strokeWidth={4} />
          <path d="M 1020 700 Q 960 900 1040 1080 Q 1000 1300 1080 1500 L 1400 1500 L 1400 700 Z" fill="rgba(120,90,40,.35)" stroke="#6b4a1e" strokeWidth={4} />
          <path d="M -300 900 Q 100 980 200 1150 Q 300 1260 240 1420 Q 160 1600 60 1750 L -300 1900 Z" fill="rgba(60,110,50,.35)" stroke="#6b4a1e" strokeWidth={4} />
          <polyline points={pts.map((q) => `${q.x},${q.y}`).join(' ')} fill="none" stroke="#b3201c" strokeWidth={8} strokeDasharray="22 16" strokeLinecap="round" />
          {pin(A, 'LISBOA', 1)}
          {pin(B, 'RIO', interpolate(p, [0.9, 1], [0, 1], clamp))}
          <g transform={`translate(${sp.x},${sp.y}) rotate(${ang}) scale(0.45)`}>
            <path d="M -120 0 L 120 0 L 95 38 L -90 38 Z" fill="#3a2414" />
            <path d="M -60 -150 Q 0 -130 58 -150 L 54 -10 Q 0 5 -56 -10 Z" fill="#fff4d8" stroke="#3a2414" strokeWidth={4} />
          </g>
          <g transform={`translate(${170},${520}) rotate(${t * 12})`} opacity={0.55}>
            {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => <path key={a} d={`M 0 0 L ${a % 90 ? 12 : 18} ${a % 90 ? -60 : -110} L 0 ${a % 90 ? -80 : -130} Z`} transform={`rotate(${a})`} fill="#6b4a1e" />)}
            <circle r={20} fill="#6b4a1e" />
          </g>
          <text x={560} y={880} textAnchor="middle" fontFamily={cinzel} fontWeight={900} fontSize={46} fill="rgba(80,50,20,.45)" letterSpacing={20}>OCEANO ATLÂNTICO</text>
        </svg>
      </AbsoluteFill>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, transparent 45%, rgba(60,30,5,.6) 100%)'}} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- independência: raios dourados + onda de choque
export const Rays: React.FC<P> = ({lf, dur}) => {
  const t = lf / 30;
  const rings = [0, 50].map((at) => lf - at);
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 45%, #7a4a06 0%, #2a1402 55%, #070300 100%)'}}>
      <AbsoluteFill style={{opacity: 0.55, background: `repeating-conic-gradient(from ${t * 14}deg at 50% 45%, #ffcf4a 0deg 5deg, transparent 5deg 15deg)`,
        maskImage: 'radial-gradient(circle at 50% 45%, #000 0%, transparent 70%)', WebkitMaskImage: 'radial-gradient(circle at 50% 45%, #000 0%, transparent 70%)'}} />
      {rings.map((k, i) => k > 0 && k < 40 ? (
        <div key={i} style={{position: 'absolute', left: 540 - k * 30, top: 864 - k * 30, width: k * 60, height: k * 60, borderRadius: '50%',
          border: `${Math.max(1, 30 - k * 0.7)}px solid rgba(255,230,150,${1 - k / 40})`, filter: 'blur(4px)'}} />
      ) : null)}
      {/* coroa imperial */}
      <svg width={W} height={H} style={{position: 'absolute', transform: `translateY(${Math.sin(t * 2) * 10}px) scale(${spring({frame: lf, fps: 30, config: {damping: 10}})})`, transformOrigin: '540px 1150px'}}>
        <g transform="translate(540,1150) scale(1.6)">
          <path d="M -110 40 L -130 -60 L -65 -10 L 0 -90 L 65 -10 L 130 -60 L 110 40 Z" fill="url(#gg)" stroke="#5a3500" strokeWidth={5} />
          <rect x={-115} y={40} width={230} height={34} rx={8} fill="url(#gg)" stroke="#5a3500" strokeWidth={5} />
          {[-80, -40, 0, 40, 80].map((x) => <circle key={x} cx={x} cy={57} r={8} fill={x % 80 ? '#1a8a3a' : '#c21d2b'} />)}
          <circle cx={0} cy={-100} r={14} fill="url(#gg)" stroke="#5a3500" strokeWidth={4} />
          <defs><linearGradient id="gg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff2b0" /><stop offset=".5" stopColor="#ffc93a" /><stop offset="1" stopColor="#b07408" /></linearGradient></defs>
        </g>
      </svg>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- Lei Áurea: documento + correntes partindo
export const Law: React.FC<P> = ({lf, dur}) => {
  const t = lf / 30;
  const en = spring({frame: lf, fps: 30, config: {damping: 16, stiffness: 60}});
  const text = 'É declarada extincta desde a data desta lei a escravidão no Brazil.';
  const nch = Math.floor(interpolate(lf, [22, 95], [0, text.length], clamp));
  const brk = lf - 108;
  const flash = brk > 0 ? Math.exp(-brk / 4) : 0;
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 40%, #3b2a14 0%, #140c04 70%)'}}>
      <div style={{position: 'absolute', left: 120, top: 500, width: 840, height: 740, borderRadius: 14,
        background: 'linear-gradient(160deg,#fbf0d2 0%,#ecd7a6 60%,#d8bc80 100%)', boxShadow: '0 40px 80px rgba(0,0,0,.7), inset 0 0 80px rgba(120,80,20,.35)',
        transform: `perspective(1600px) rotateX(${(1 - en) * 60 + Math.sin(t) * 2}deg) rotateZ(${-3 + Math.sin(t * 0.7) * 1.2}deg) translateY(${(1 - en) * 500}px) scale(${1 + 0.06 * lf / dur})`, padding: 70, boxSizing: 'border-box'}}>
        <div style={{fontFamily: cinzel, fontWeight: 900, fontSize: 64, color: '#3b2410', textAlign: 'center'}}>LEI Nº 3.353</div>
        <div style={{fontFamily: cinzel, fontWeight: 700, fontSize: 34, color: '#6b4a1e', textAlign: 'center', marginTop: 8}}>13 DE MAIO DE 1888</div>
        <div style={{height: 3, background: '#8a6a30', margin: '30px 40px'}} />
        <div style={{fontFamily: 'DejaVu Serif, serif', fontStyle: 'italic', fontSize: 50, lineHeight: 1.35, color: '#2a1a08'}}>
          Art. 1º {text.slice(0, nch)}<span style={{opacity: Math.sin(t * 10) > 0 ? 1 : 0}}>|</span>
        </div>
        <div style={{position: 'absolute', bottom: 70, right: 80, fontFamily: 'DejaVu Serif, serif', fontStyle: 'italic', fontSize: 52, color: '#1f2f6b',
          opacity: interpolate(lf, [96, 106], [0, 1], clamp)}}>Princesa Isabel</div>
      </div>
      {/* corrente que se parte */}
      <svg width={W} height={H} style={{position: 'absolute'}}>
        {[-1, 1].map((side) => {
          const off = brk > 0 ? side * brk * 26 : 0, rot = brk > 0 ? side * brk * 3 : 0;
          return (
            <g key={side} transform={`translate(${off},${brk > 0 ? brk * brk * 0.6 : 0}) rotate(${rot} 540 1500)`}>
              {[0, 1, 2, 3, 4, 5].map((i) => {
                const x = 540 + side * (40 + i * 80);
                return <ellipse key={i} cx={x} cy={1500} rx={52} ry={24} fill="none" stroke="#9a9086" strokeWidth={16} />;
              })}
            </g>
          );
        })}
      </svg>
      <AbsoluteFill style={{background: '#fff3c8', opacity: flash * 0.85}} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- República: céu com o Cruzeiro do Sul
const CRUZ = [[540, 520], [540, 900], [420, 690], [680, 720], [585, 780]];
export const Stars: React.FC<P> = ({lf, dur}) => {
  const t = lf / 30;
  const draw = interpolate(lf, [20, 70], [0, 1], clamp);
  const band = interpolate(lf, [40, 90], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 40%, #0c2c7a 0%, #04123a 60%, #01061a 100%)', transform: `scale(${1.08 - 0.08 * lf / dur}) rotate(${t * 1.5}deg)`}}>
      {new Array(160).fill(0).map((_, i) => {
        const tw = 0.4 + 0.6 * Math.abs(Math.sin(t * (1 + random(`st${i}`) * 3) + i));
        const s = 2 + random(`ss${i}`) * 4;
        return <div key={i} style={{position: 'absolute', left: random(`sx${i}`) * W, top: random(`sy${i}`) * H, width: s, height: s, borderRadius: '50%', background: '#fff', opacity: tw * 0.8}} />;
      })}
      <svg width={W} height={H} style={{position: 'absolute'}}>
        <path d={`M ${CRUZ[0][0]} ${CRUZ[0][1]} L ${CRUZ[1][0]} ${CRUZ[1][1]} M ${CRUZ[2][0]} ${CRUZ[2][1]} L ${CRUZ[3][0]} ${CRUZ[3][1]}`} stroke="rgba(255,255,255,.55)" strokeWidth={4}
          strokeDasharray={900} strokeDashoffset={900 * (1 - draw)} fill="none" />
        {CRUZ.map(([x, y], i) => {
          const sp = spring({frame: lf - 8 - i * 6, fps: 30, config: {damping: 8}});
          return <g key={i} transform={`translate(${x},${y}) scale(${sp * (i === 4 ? 0.6 : 1)}) rotate(${t * 20})`}>
            <circle r={40} fill="rgba(255,255,255,.25)" style={{filter: 'blur(10px)'}} />
            <path d="M 0 -30 L 7 -7 L 30 0 L 7 7 L 0 30 L -7 7 L -30 0 L -7 -7 Z" fill="#fff" />
          </g>;
        })}
        <path d={`M -100 1260 Q 540 ${1060 - 40 * Math.sin(t)} 1180 1260`} stroke="#fff" strokeWidth={70} fill="none" strokeDasharray={1500} strokeDashoffset={1500 * (1 - band)} />
        <text fontFamily="Inter" fontWeight={800} fontSize={44} fill="#009c3b" letterSpacing={6} opacity={band}>
          <textPath href="#arcR" startOffset="50%" textAnchor="middle">ORDEM E PROGRESSO</textPath>
        </text>
        <defs><path id="arcR" d={`M -100 1275 Q 540 ${1075 - 40 * Math.sin(t)} 1180 1275`} /></defs>
      </svg>
    </AbsoluteFill>
  );
};

export const MG: Record<string, React.FC<P>> = {ocean: Ocean, gold: Gold, chains: Chains, map: MapRoute, rays: Rays, law: Law, stars: Stars};
