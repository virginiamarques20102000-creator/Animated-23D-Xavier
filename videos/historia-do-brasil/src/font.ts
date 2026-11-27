import {continueRender, delayRender, staticFile} from 'remotion';
export const cinzel = 'CinzelLocal';
if (typeof document !== 'undefined' && !(window as any).__cz) {
  (window as any).__cz = true;
  const h = delayRender('cinzel');
  const faces = [
    new FontFace(cinzel, `url(${staticFile('fonts/cinzel.woff2')}) format('woff2')`, {weight: '400 900', unicodeRange: 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD'}),
    new FontFace(cinzel, `url(${staticFile('fonts/cinzel-ext.woff2')}) format('woff2')`, {weight: '400 900', unicodeRange: 'U+0100-02AF, U+0304, U+0308, U+0329, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF'}),
  ];
  Promise.all(faces.map((f) => f.load())).then((fs) => { fs.forEach((f) => document.fonts.add(f)); continueRender(h); });
}
