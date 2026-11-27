import React from 'react';
import {AbsoluteFill, interpolate, spring, Easing} from 'remotion';
import {cinzel} from './font';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const FW = 880, FH = 616; // 20 x 14

// estrelas aproximadas dentro do círculo (coordenadas no sistema 20x14)
const STARS: [number, number, number][] = [
  [10.4, 8.3, 0.17], [9.2, 8.6, 0.13], [11.3, 8.9, 0.12], [8.4, 8.0, 0.11], [10.9, 9.6, 0.13], [9.8, 9.9, 0.1], [12.0, 8.2, 0.1],
  [8.0, 9.0, 0.1], [11.8, 9.8, 0.09], [10.0, 10.5, 0.12], [8.9, 9.7, 0.09], [12.6, 9.1, 0.08], [7.6, 8.4, 0.08], [10.2, 5.9, 0.14],
];
const svg = encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 14" width="${FW}" height="${FH}">
<rect width="20" height="14" fill="#009c3b"/>
<polygon points="1.7,7 10,1.7 18.3,7 10,12.3" fill="#ffdf00"/>
<circle cx="10" cy="7" r="3.5" fill="#002776"/>
<defs><clipPath id="c"><circle cx="10" cy="7" r="3.5"/></clipPath><path id="arc" d="M 6.3 7.05 Q 10 4.9 13.7 7.65"/></defs>
<g clip-path="url(#c)"><path d="M 6.1 6.6 Q 10 4.3 14.0 7.3 L 14 7.9 Q 10 5.0 6.1 7.25 Z" fill="#fff"/></g>
<text font-family="Inter,Arial" font-weight="800" font-size="0.44" fill="#009c3b" letter-spacing="0.03"><textPath href="#arc" startOffset="50%" text-anchor="middle">ORDEM E PROGRESSO</textPath></text>
${STARS.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff"/>`).join('')}
</svg>`);
const SRC = `data:image/svg+xml;charset=utf-8,${svg}`;

export const Flag: React.FC<{f: number; start: number}> = ({f, start}) => {
  const lf = f - start;
  const t = f / 30;
  const enter = spring({frame: lf + 4, fps: 30, config: {damping: 16, stiffness: 70}});
  const op = interpolate(lf, [-8, 6], [0, 1], clamp);
  const N = 55;
  const sw = FW / N;
  const slices = [];
  for (let i = 0; i < N; i++) {
    const x = i / N;
    const ph = x * 7.5 - t * 6.2;
    const amp = 6 + 26 * x; // o lado do mastro mexe menos
    const dy = Math.sin(ph) * amp;
    const shade = 1 + 0.22 * Math.cos(ph) * (0.3 + x);
    slices.push(
      <div key={i} style={{position: 'absolute', left: i * sw, top: dy, width: sw + 1.5, height: FH, overflow: 'hidden', filter: `brightness(${shade})`}}>
        <img src={SRC} style={{position: 'absolute', left: -i * sw, top: 0, width: FW, height: FH}} />
      </div>
    );
  }
  const rays = (t * 6) % 360;
  const txt = spring({frame: lf - 22, fps: 30, config: {damping: 14}});
  const txt2 = spring({frame: lf - 40, fps: 30, config: {damping: 14}});
  return (
    <AbsoluteFill style={{opacity: op}}>
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 42%, #0f5a33 0%, #062614 55%, #020a05 100%)'}} />
      <AbsoluteFill style={{opacity: 0.18, background: `repeating-conic-gradient(from ${rays}deg at 50% 42%, #ffdf00 0deg 6deg, transparent 6deg 18deg)`,
        maskImage: 'radial-gradient(circle at 50% 42%, #000 0%, transparent 65%)', WebkitMaskImage: 'radial-gradient(circle at 50% 42%, #000 0%, transparent 65%)'}} />
      <div style={{position: 'absolute', left: (1080 - FW) / 2, top: 500, width: FW, height: FH,
        transform: `perspective(1600px) rotateY(${-14 + 6 * Math.sin(t * 0.8)}deg) scale(${0.6 + 0.4 * enter})`,
        filter: 'drop-shadow(0 40px 50px rgba(0,0,0,.6))'}}>
        {slices}
      </div>
      <div style={{position: 'absolute', top: 1230, width: 1080, textAlign: 'center', fontFamily: cinzel, fontWeight: 900, fontSize: 84, color: '#fff',
        lineHeight: 1.1, opacity: txt, transform: `translateY(${(1 - txt) * 50}px)`, textShadow: '0 6px 0 #000, 0 0 40px rgba(0,0,0,.8)'}}>
        E A HISTÓRIA<br />CONTINUA...
      </div>
      <div style={{position: 'absolute', top: 1470, width: 1080, textAlign: 'center', fontFamily: 'Inter', fontWeight: 800, fontSize: 46, letterSpacing: 8,
        color: '#ffd75a', opacity: txt2, transform: `scale(${0.8 + 0.2 * txt2})`}}>
        PARTE 2 EM BREVE
      </div>
    </AbsoluteFill>
  );
};
