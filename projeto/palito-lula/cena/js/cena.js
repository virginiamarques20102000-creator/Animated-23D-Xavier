// "Lula em 25 segundos" no estilo palito: mundo 3D com Three.js, bonecos planos virados para a câmera,
// câmera sempre andando (sai rápido e freia aos poucos), cortes nos começos de frase, legenda de uma palavra
// por vez e etiquetas amarelas. Tudo é função do tempo t (HyperFrames ou render_playwright pedem fora de ordem).
import * as THREE from "three";
import { clamp, lerp, ramp, pop } from "./kit.js";
import { criarTextos } from "./textos.js";
import { cartao, hash } from "./boneco.js";
import T from "./tempos.js";

const W = 1080, H = 1920;
const norm = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9-]/g, "");
const PALAVRAS = T.frases.flatMap((f, i) => f.palavras.map((p) => ({ ...p, frase: i })));
export function Wd(palavra, n = 0) {
  const alvo = norm(palavra);
  const achadas = PALAVRAS.filter((p) => norm(p.w).startsWith(alvo));
  if (!achadas[n]) throw new Error(`a palavra "${palavra}" não está nas falas`);
  return achadas[n].s;
}
const Sf = (i) => T.frases[i].s;
const CORTE = (i) => Sf(i) - 0.07;                     // corta ~2 quadros antes de a frase começar
const expoOut = (u) => (u >= 1 ? 1 : 1 - Math.pow(2, -10 * clamp(u)));

// ---------------- os tempos (todos saem das palavras) ----------------
const tPres = Wd("presidente") - 0.05;
const CENAS = [
  { id: "sertao", a: 0, b: tPres },
  { id: "palacio", a: tPres, b: CORTE(1), versao: 1 },
  { id: "estrada", a: CORTE(1), b: CORTE(2) },
  { id: "fabrica", a: CORTE(2), b: CORTE(3) },
  { id: "comicio", a: CORTE(3), b: CORTE(4) },
  { id: "eleicoes", a: CORTE(4), b: CORTE(6) },
  { id: "palacio", a: CORTE(6), b: CORTE(7), versao: 2 },
  { id: "palacio", a: CORTE(7), b: T.duracao + 1, versao: 3 },
];
const tPrensa = Wd("prensa"), tPartido = Wd("partido"), tGanhou = Wd("ganhou"), tVoltou = Wd("voltou"), tSP = Wd("São");
const tX = [Wd("três", 1), Wd("eleições"), Wd("seguidas")];
const tQuarta = Wd("quarta");
const FLASHES = [tPres, tPrensa, tGanhou, tVoltou];
const TREMIDAS = [{ t: tPrensa, f: 0.22 }, { t: tGanhou, f: 0.08 }, { t: tPres, f: 0.06 }];

// ---------------- materiais: cor chapada em dois tons + contorno preto ----------------
const degraus = (() => {
  const d = new Uint8Array([90, 90, 90, 255, 255, 255]);
  const tx = new THREE.DataTexture(d, 2, 1, THREE.RedFormat);
  tx.minFilter = tx.magFilter = THREE.NearestFilter; tx.needsUpdate = true;
  const d3 = new Uint8Array([110, 190, 255]);
  const t3 = new THREE.DataTexture(d3, 3, 1, THREE.RedFormat);
  t3.minFilter = t3.magFilter = THREE.NearestFilter; t3.needsUpdate = true;
  return t3;
})();
const TINTA = new THREE.ShaderMaterial({
  side: THREE.BackSide,
  uniforms: { w: { value: 0.035 } },
  vertexShader: "uniform float w; void main(){ vec3 p = position + normal * w; gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0); }",
  fragmentShader: "void main(){ gl_FragColor = vec4(0.03, 0.025, 0.04, 1.0); }",
});
const toon = (cor, o = {}) => new THREE.MeshToonMaterial({ color: cor, gradientMap: degraus, ...o });
function peca(pai, geo, cor, pos = [0, 0, 0], o = {}) {
  const m = new THREE.Mesh(geo, o.mat || toon(cor, o.extra));
  m.position.set(...pos);
  if (o.rot) m.rotation.set(...o.rot);
  if (o.esc) m.scale.set(...o.esc);
  m.castShadow = o.sombra !== false;
  m.receiveShadow = true;
  if (o.contorno !== false) {
    const c = new THREE.Mesh(geo, TINTA);
    c.userData.contorno = true;
    m.add(c);
  }
  pai.add(m);
  return m;
}
const caixa = (w, h, d) => { const g = new THREE.BoxGeometry(w, h, d); g.translate(0, h / 2, 0); return g; };
function textura(w, h, desenho) {
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  desenho(c.getContext("2d"), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return t;
}
const bandeiraBR = () => textura(400, 280, (g, w, h) => {
  g.fillStyle = "#169b3a"; g.fillRect(0, 0, w, h);
  g.fillStyle = "#f7d117"; g.beginPath(); g.moveTo(w / 2, 22); g.lineTo(w - 26, h / 2); g.lineTo(w / 2, h - 22); g.lineTo(26, h / 2); g.fill();
  g.fillStyle = "#1d3f9a"; g.beginPath(); g.arc(w / 2, h / 2, 66, 0, Math.PI * 2); g.fill();
  g.strokeStyle = "#f4f1ea"; g.lineWidth = 9; g.beginPath(); g.arc(w / 2 + 40, h / 2 + 150, 190, Math.PI * 1.22, Math.PI * 1.62); g.stroke();
});
const bandeiraVermelha = () => textura(400, 280, (g, w, h) => {
  g.fillStyle = "#d1232a"; g.fillRect(0, 0, w, h);
  g.fillStyle = "#fff"; g.beginPath();
  for (let i = 0; i < 10; i++) { const r = i % 2 ? 40 : 100, a = -Math.PI / 2 + (i * Math.PI) / 5; g.lineTo(w / 2 + r * Math.cos(a), h / 2 + 8 + r * Math.sin(a)); }
  g.fill();
});
// uma bandeira de pano que ondula (vértices mexidos pelo tempo)
function bandeira(pai, tex, pos, larg = 3, alt = 2.1) {
  const geo = new THREE.PlaneGeometry(larg, alt, 24, 8);
  geo.translate(larg / 2, 0, 0);
  const base = geo.attributes.position.array.slice();
  const m = new THREE.Mesh(geo, new THREE.MeshToonMaterial({ map: tex, side: THREE.DoubleSide, gradientMap: degraus }));
  m.position.set(...pos); m.castShadow = true;
  pai.add(m);
  return { malha: m, mexer(t) {
    const p = geo.attributes.position.array;
    for (let i = 0; i < p.length; i += 3) { const x = base[i]; p[i + 2] = Math.sin(x * 2.2 - t * 6) * 0.18 * (x / larg); p[i + 1] = base[i + 1] - x * x * 0.012; }
    geo.attributes.position.needsUpdate = true; geo.computeVertexNormals();
  } };
}
function cacto(pai, x, z, s = 1) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.scale.setScalar(s); pai.add(g);
  const verde = 0x3f8f4a;
  peca(g, new THREE.CylinderGeometry(0.28, 0.32, 3.2, 10).translate(0, 1.6, 0), verde);
  peca(g, new THREE.CylinderGeometry(0.18, 0.2, 1.4, 8).translate(0, 0.7, 0), verde, [0.55, 1.2, 0]);
  peca(g, new THREE.CylinderGeometry(0.18, 0.2, 1.1, 8).translate(0, 0.55, 0), verde, [-0.5, 1.6, 0]);
  peca(g, new THREE.CylinderGeometry(0.12, 0.12, 0.6, 6).rotateZ(Math.PI / 2), verde, [0.3, 1.2, 0], { contorno: false });
  peca(g, new THREE.CylinderGeometry(0.12, 0.12, 0.5, 6).rotateZ(Math.PI / 2), verde, [-0.28, 1.6, 0], { contorno: false });
  return g;
}
function chao(pai, cor, tam = 400) { const m = peca(pai, new THREE.PlaneGeometry(tam, tam), cor, [0, 0, 0], { rot: [-Math.PI / 2, 0, 0], contorno: false, sombra: false }); return m; }

// ---------------- a cena ----------------
export function criarCena(canvas, raiz) {
  const r = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
  r.setPixelRatio(1);
  r.setSize(W, H, false);
  r.outputColorSpace = THREE.SRGBColorSpace;
  r.toneMapping = THREE.NeutralToneMapping;
  r.shadowMap.enabled = true;
  r.shadowMap.type = THREE.PCFSoftShadowMap;
  const cena = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(40, W / H, 0.1, 600);

  // céu: um domo com degradê, cores por cenário; névoa da cor do horizonte
  const ceuMat = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { alto: { value: new THREE.Color() }, horiz: { value: new THREE.Color() } },
    vertexShader: "varying vec3 v; void main(){ v = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
    fragmentShader: "uniform vec3 alto; uniform vec3 horiz; varying vec3 v; void main(){ float k = smoothstep(-0.05, 0.55, v.y); gl_FragColor = vec4(mix(horiz, alto, k), 1.0); }",
  });
  const ceu = new THREE.Mesh(new THREE.SphereGeometry(500, 32, 16), ceuMat);
  cena.add(ceu);
  cena.fog = new THREE.Fog(0xffffff, 40, 260);
  const hemi = new THREE.HemisphereLight(0xffffff, 0x8a7a66, 1.25);
  cena.add(hemi);
  const sol = new THREE.DirectionalLight(0xfff0dc, 2.4);
  sol.castShadow = true;
  sol.shadow.mapSize.set(2048, 2048);
  Object.assign(sol.shadow.camera, { left: -16, right: 16, top: 16, bottom: -16, near: 1, far: 120 });
  sol.shadow.bias = -0.0006;
  cena.add(sol, sol.target);

  const G = {}, atores = {}, extras = {};
  const grupo = (id) => { const g = new THREE.Group(); g.visible = false; cena.add(g); G[id] = g; return g; };
  const ator = (pai, id, o) => { const c = cartao(o); pai.add(c.raiz); atores[id] = c; return c; };

  // 1. sertão: chão de terra, cactos, casinha de taipa, o menino
  {
    const g = grupo("sertao");
    chao(g, 0xd99a5b);
    for (let i = 0; i < 40; i++) {
      const x = (hash(i) - 0.5) * 90, z = -6 - hash(i + 50) * 70;
      cacto(g, x, z, 0.6 + hash(i + 9) * 0.8);
    }
    cacto(g, 2.6, -1.5, 0.75); cacto(g, -3.2, -3, 0.9);
    const casa = new THREE.Group(); casa.position.set(-5.5, 0, -7); casa.rotation.y = 0.35; g.add(casa);
    peca(casa, caixa(5, 2.6, 3.6), 0xe9d3a6);
    peca(casa, new THREE.ConeGeometry(3.6, 1.6, 4).rotateY(Math.PI / 4).translate(0, 3.4, 0), 0xb4532a, [0, 0, 0], { esc: [1, 1, 0.75] });
    peca(casa, caixa(0.9, 1.7, 0.1), 0x6b3d1f, [0.6, 0, 1.81]);
    peca(casa, caixa(0.8, 0.7, 0.1), 0x2a3f5f, [-1.4, 1.2, 1.81]);
    for (let i = 0; i < 8; i++) peca(g, new THREE.DodecahedronGeometry(0.25 + hash(i + 300) * 0.3), 0x9c8b7a, [(hash(i + 200) - 0.5) * 10, 0.1, 1 - hash(i + 210) * 6]);
    ator(g, "menino", { idade: "crianca", alt: 1.25, cabelo: "#1d1715", roupa: "#7fb3e6", remendo: "#d9c28a", calcaCurta: "#8a5a32", descalco: true, pose: "aceno", emocao: "feliz", fase: 1 });
  }

  // 2. palácio: gramado, prédio branco moderno de colunas finas, bandeira, gente com bandeirinhas
  {
    const g = grupo("palacio");
    chao(g, 0x7cc35a);
    peca(g, caixa(40, 0.15, 30), 0xd9d4c7, [0, 0, -14], { contorno: false });
    const p = new THREE.Group(); p.position.set(0, 0, -11); g.add(p);
    peca(p, caixa(34, 0.6, 9), 0xf4f2ec);
    peca(p, caixa(30, 3.8, 6), 0xbfe3f0, [0, 0.6, -0.5], { extra: { transparent: true, opacity: 0.9 } });
    peca(p, caixa(36, 0.5, 11), 0xf8f7f2, [0, 4.6, 0]);
    for (let i = -8; i <= 8; i++) peca(p, new THREE.CylinderGeometry(0.12, 0.42, 4.0, 10).translate(0, 2.6, 0), 0xffffff, [i * 2.1, 0, 4.9]);
    peca(g, caixa(4, 0.6, 7), 0xe8e4da, [0, 0, -4], { rot: [-0.08, 0, 0] });
    peca(g, new THREE.CylinderGeometry(0.08, 0.1, 12, 8).translate(0, 6, 0), 0xcfd3d6, [-9, 0, -4]);
    extras.bandeiraBR = bandeira(g, bandeiraBR(), [-8.95, 10.6, -4], 3.6, 2.5);
    for (let i = 0; i < 9; i++) peca(g, new THREE.SphereGeometry(0.9 + hash(i) * 0.5, 10, 8), 0x3d8a3a, [(i % 2 ? 1 : -1) * (6 + hash(i + 4) * 12), 0.6, -2 - hash(i + 8) * 5]);
    ator(g, "pres1", { alt: 1.85, cabelo: "#5c5650", barba: "#4d4844", bigode: "#3a3532", roupa: "#1f2a44", terno: true, faixa: true, calca: "#1f2a44", pose: "aceno", emocao: "feliz", fase: 2, pos: [0, 0.35, -1.2] });
    ator(g, "pres2", { alt: 1.85, cabelo: "#ece9e4", barba: "#f2f0ec", bigode: "#dcd8d2", roupa: "#1f2a44", terno: true, faixa: true, calca: "#1f2a44", pose: "vibra", emocao: "riso", fase: 3, pos: [0, 0.35, -1.2] });
    const cores = ["#e2483d", "#f2b632", "#3b8ed8", "#7bc86c", "#b85fc4", "#f07c2a", "#ffffff"];
    extras.povo = [];
    for (let i = 0; i < 16; i++) {
      const lado = i % 2 ? 1 : -1, x = lado * (2.2 + (i >> 1) * 0.75 + hash(i) * 0.4), z = 1.2 + hash(i + 30) * 2.6;
      extras.povo.push(ator(g, "povo" + i, { res: 256, alt: 1.45 + hash(i + 3) * 0.35, cabelo: ["#1d1715", "#5a3b22", "#c99a54", "#2b1d14"][i % 4], roupa: cores[i % cores.length], calca: "#3b4660",
        pose: i % 3 ? "bandeira" : "vibra", emocao: i % 2 ? "feliz" : "riso", fase: i * 1.7, pos: [x, 0, z] }));
    }
  }

  // 3. estrada: o pau de arara (caminhão com a carroceria de madeira) atravessando o sertão até São Paulo
  {
    const g = grupo("estrada");
    chao(g, 0xd6a062);
    peca(g, new THREE.PlaneGeometry(400, 4.6), 0x9d7b58, [0, 0.01, 0], { rot: [-Math.PI / 2, 0, 0], contorno: false, sombra: false });
    for (let i = 0; i < 70; i++) {
      const x = -60 + hash(i + 400) * 120, lado = hash(i + 401) > 0.5 ? 1 : -1, z = lado > 0 ? 16 + hash(i + 402) * 25 : -(4 + hash(i + 402) * 30);
      if (x > 28 && z < 0) continue;
      cacto(g, x, z, 0.5 + hash(i + 403) * 0.8);
    }
    const cidade = new THREE.Group(); cidade.position.set(46, 0, -4); g.add(cidade);
    const janelas = textura(128, 256, (c, w, h) => { c.fillStyle = "#c9ced6"; c.fillRect(0, 0, w, h); c.fillStyle = "#4b5f7c"; for (let y = 10; y < h; y += 22) for (let x = 10; x < w; x += 26) c.fillRect(x, y, 14, 12); });
    for (let i = 0; i < 26; i++) {
      const h = 8 + hash(i + 500) * 26, w = 3 + hash(i + 501) * 3;
      const tx = janelas.clone(); tx.repeat.set(w / 4, h / 8); tx.wrapS = tx.wrapT = THREE.RepeatWrapping; tx.needsUpdate = true;
      peca(cidade, caixa(w, h, w), 0xffffff, [(i % 7) * 5.2 + hash(i) * 2, 0, -Math.floor(i / 7) * 7 - hash(i + 2) * 3], { extra: { map: tx } });
    }
    extras.cidade = cidade;
    const cam_ = new THREE.Group(); g.add(cam_); extras.caminhao = cam_;
    peca(cam_, caixa(1.9, 1.7, 2.1), 0x2f74c0, [1.9, 0.55, 0]);
    peca(cam_, caixa(1.2, 0.9, 1.9), 0x2f74c0, [3.3, 0.55, 0]);
    peca(cam_, caixa(1.2, 0.7, 1.7), 0xbfe3f0, [1.95, 1.4, 0], { esc: [1, 1, 1.25] });
    peca(cam_, caixa(4.2, 0.35, 2.3), 0x7a4a26, [-1.4, 0.55, 0]);
    for (const z of [-1.1, 1.1]) for (let k = 0; k < 2; k++) peca(cam_, caixa(4.2, 0.1, 0.08), 0x9a6334, [-1.4, 1.05 + k * 0.35, z], { contorno: k === 1 });
    for (const x of [-3.4, 0.6]) for (const z of [-1.1, 1.1]) peca(cam_, caixa(0.12, 1.3, 0.12), 0x6b3d1f, [x, 0.8, z]);
    extras.rodas = [];
    for (const x of [-2.4, -0.6, 3.2]) for (const z of [-1.05, 1.05]) {
      const rd = peca(cam_, new THREE.CylinderGeometry(0.5, 0.5, 0.35, 16).rotateX(Math.PI / 2), 0x262326, [x, 0.5, z]);
      peca(rd, caixa(0.5, 0.08, 0.37), 0xb8b8b8, [0, -0.04, 0], { contorno: false });
      extras.rodas.push(rd);
    }
    const fam = [
      { id: "mae", o: { alt: 1.75, lenco: "#d64b6b", roupa: "#e8a33d", vestido: true, pose: "parado", emocao: "feliz", fase: 4 } },
      { id: "luizinho", o: { idade: "crianca", alt: 1.35, cabelo: "#1d1715", roupa: "#7fb3e6", remendo: "#d9c28a", calcaCurta: "#8a5a32", descalco: true, pose: "aceno", emocao: "riso", fase: 1 } },
      { id: "irmao1", o: { idade: "crianca", alt: 1.3, cabelo: "#2b1d14", roupa: "#e2483d", calcaCurta: "#4b4f6a", descalco: true, pose: "parado", emocao: "feliz", fase: 6 } },
      { id: "irma", o: { idade: "crianca", alt: 1.25, lenco: "#f2d24a", roupa: "#7bc86c", vestido: true, pose: "parado", emocao: "susto", fase: 8 } },
    ];
    fam.forEach((m, i) => ator(cam_, m.id, { ...m.o, pos: [-0.2 - i * 0.95, 0.9, 0.55 - (i % 2) * 0.6] }));
  }

  // 4. fábrica: a prensa que desce na palavra "prensa"
  {
    const g = grupo("fabrica");
    chao(g, 0x8b8f96);
    peca(g, caixa(40, 12, 0.5), 0xa9553b, [0, 0, -7]);
    for (let i = -3; i <= 3; i++) peca(g, caixa(2.4, 2.6, 0.1), 0xbfe3f0, [i * 4.5, 5.5, -6.7], { extra: { emissive: 0x6fa8d6, emissiveIntensity: 0.6 } });
    peca(g, caixa(40, 0.4, 0.4), 0x2f3338, [0, 9, -2]);
    const pr = new THREE.Group(); pr.position.set(-1.6, 0, -0.6); g.add(pr);
    peca(pr, caixa(2.8, 0.9, 1.8), 0xf0a21c);
    peca(pr, caixa(1.4, 0.35, 1.2), 0x4a4f57, [0, 0.9, 0]);
    for (const x of [-1.2, 1.2]) peca(pr, caixa(0.45, 4.6, 0.6), 0xf0a21c, [x, 0.9, 0]);
    peca(pr, caixa(3.0, 0.9, 1.4), 0xf0a21c, [0, 5.4, 0]);
    peca(pr, new THREE.CylinderGeometry(0.16, 0.16, 2.6, 10).translate(0, -1.3, 0), 0xc9cdd2, [0, 5.4, 0], { contorno: false });
    extras.martelo = peca(pr, caixa(1.6, 0.7, 1.2), 0x5c626b, [0, 3.8, 0]);
    peca(pr, caixa(0.5, 0.5, 0.1), 0xd1232a, [0.9, 1.4, 0.92], { extra: { emissive: 0xd1232a, emissiveIntensity: 0.8 } });
    for (let i = 0; i < 6; i++) peca(g, caixa(1.1, 1.1, 1.1), 0xb98a52, [4 + (i % 3) * 1.2, (i > 2 ? 1.1 : 0), -3.6 - (i % 2) * 0.3]);
    for (let i = 0; i < 3; i++) peca(g, new THREE.CylinderGeometry(0.5, 0.5, 1.3, 14).translate(0, 0.65, 0), [0x2f74c0, 0xd1232a, 0x3f8f4a][i], [-6 - i * 1.2, 0, -3.5]);
    const fa = new THREE.Group(); g.add(fa); extras.faiscas = [];
    for (let i = 0; i < 40; i++) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.22), new THREE.MeshBasicMaterial({ color: i % 3 ? 0xffd34a : 0xfff4c2, toneMapped: false }));
      fa.add(m); extras.faiscas.push(m);
    }
    ator(g, "operario", { alt: 1.8, cabelo: "#1d1715", barba: "#211a17", roupa: "#2d5fa8", macacao: true, calca: "#2d5fa8", pose: "parado", emocao: "feliz", fase: 5, pos: [0.65, 0, 0.6] });
  }

  // 5. comício: multidão de punho para cima, o líder no palanque, a bandeira vermelha subindo em "partido"
  {
    const g = grupo("comicio");
    chao(g, 0x6d6a6f);
    peca(g, caixa(7, 1.1, 3.4), 0xc8322f, [0, 0, -3]);
    peca(g, caixa(7.6, 0.18, 3.8), 0xf2f0ea, [0, 1.1, -3]);
    peca(g, new THREE.CylinderGeometry(0.03, 0.03, 1.5, 6).translate(0, 0.75, 0), 0x3a3f46, [0.25, 1.2, -2.3]);
    for (let i = 0; i < 12; i++) peca(g, caixa(4 + hash(i) * 3, 6 + hash(i + 7) * 10, 4), [0xd8c7a3, 0xa9b6c4, 0xc98e6b, 0xe6e1d2][i % 4], [-26 + i * 4.8, 0, -16 - hash(i + 3) * 6]);
    peca(g, new THREE.CylinderGeometry(0.07, 0.09, 8, 8).translate(0, 4, 0), 0xcfd3d6, [3.2, 1.1, -3.6]);
    extras.bandeiraPT = bandeira(g, bandeiraVermelha(), [3.25, 2, -3.6], 2.8, 1.9);
    ator(g, "lider", { alt: 1.8, cabelo: "#1d1715", barba: "#211a17", roupa: "#f2f0ea", calca: "#3b4660", pose: "punho", emocao: "bravo", fase: 7, pos: [-0.3, 1.28, -2.6] });
    const cores = ["#e2483d", "#f2b632", "#3b8ed8", "#7bc86c", "#ffffff", "#f07c2a", "#c8322f"];
    for (let i = 0; i < 34; i++) {
      const x = (i % 9 - 4) * 1.05 + (hash(i) - 0.5) * 0.5, z = 0.8 + Math.floor(i / 9) * 1.3 + hash(i + 1) * 0.5;
      ator(g, "multidao" + i, { res: 256, alt: 1.5 + hash(i + 2) * 0.35, cabelo: ["#1d1715", "#5a3b22", "#2b1d14", "#8a6b4a"][i % 4], barba: i % 5 === 0 ? "#2b1d14" : null,
        roupa: cores[i % cores.length], calca: "#3b4660", pose: i % 4 === 0 ? "vibra" : "punho", emocao: i % 2 ? "bravo" : "riso", fase: i * 1.3, pos: [x, 0, z] });
    }
  }

  // 6. eleições: quatro quadros com os anos; um X vermelho em cada derrota, o visto verde na vitória
  {
    const g = grupo("eleicoes");
    chao(g, 0x2c4f8f);
    peca(g, caixa(30, 9, 0.4), 0x3c66b0, [0, 0, -3.2]);
    extras.quadros = []; extras.marcas = [];
    ["1989", "1994", "1998", "2002"].forEach((ano, i) => {
      const tx = textura(512, 360, (c, w, h) => { c.fillStyle = "#f8f5ec"; c.fillRect(0, 0, w, h); c.fillStyle = "#1a1420"; c.font = "900 150px Arial Black, Arial"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(ano, w / 2, h / 2 + 8); });
      const q = peca(g, new THREE.BoxGeometry(2.6, 1.85, 0.12), 0xffffff, [-4.5 + i * 3, 3.1, -2.9], { extra: { map: tx } });
      extras.quadros.push(q);
      const marca = new THREE.Group(); marca.position.set(-4.5 + i * 3, 3.1, -2.75); g.add(marca);
      if (i < 3) for (const s of [1, -1]) peca(marca, new THREE.BoxGeometry(2.4, 0.34, 0.12), 0xe0262c, [0, 0, 0], { rot: [0, 0, s * 0.62], extra: { emissive: 0x6a0000 } });
      else { peca(marca, new THREE.BoxGeometry(0.9, 0.36, 0.12), 0x2fbf4f, [-0.55, -0.2, 0], { rot: [0, 0, -0.8], extra: { emissive: 0x0a4a14 } }); peca(marca, new THREE.BoxGeometry(1.9, 0.36, 0.12), 0x2fbf4f, [0.35, 0.25, 0], { rot: [0, 0, 0.95], extra: { emissive: 0x0a4a14 } }); }
      extras.marcas.push(marca);
    });
    const urna = new THREE.Group(); urna.position.set(2.4, 0, 0.4); urna.rotation.y = -0.4; g.add(urna);
    peca(urna, caixa(0.9, 1.0, 0.7), 0x8a8f96);
    peca(urna, caixa(1.0, 0.25, 0.75), 0xe8e0cf, [0, 1.0, 0], { rot: [-0.3, 0, 0] });
    peca(urna, caixa(0.5, 0.06, 0.32), 0x2b3a4a, [-0.15, 1.2, 0.05], { rot: [-0.3, 0, 0], contorno: false });
    ator(g, "candidato", { alt: 1.82, cabelo: "#4a4440", barba: "#3a3532", roupa: "#f2f0ea", calca: "#3b4660", pose: "triste", emocao: "triste", fase: 9, pos: [-0.6, 0, 0.6] });
  }

  // confete (para "ganhou" e "voltou"): pedacinhos que caem girando, posição só do tempo
  const confete = new THREE.Group(); cena.add(confete);
  const CORES_C = [0xf7d117, 0x13994a, 0x2f74c0, 0xffffff, 0xe2483d];
  for (let i = 0; i < 180; i++) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.2), new THREE.MeshBasicMaterial({ color: CORES_C[i % 5], side: THREE.DoubleSide, toneMapped: false }));
    confete.add(m);
  }
  function confeteEm(t, t0, centro) {
    const u = t - t0;
    confete.visible = u > 0 && u < 6;
    if (!confete.visible) return;
    confete.children.forEach((m, i) => {
      const vx = (hash(i) - 0.5) * 6, vy = 5 + hash(i + 1) * 5, vz = (hash(i + 2) - 0.5) * 4;
      const tt = Math.min(u, 0.7) , cai = Math.max(0, u - 0.7);
      m.position.set(centro[0] + vx * tt + Math.sin(u * 3 + i) * 0.3, centro[1] + vy * tt - 4.9 * tt * tt * 0.6 - cai * 1.1, centro[2] + vz * tt);
      m.rotation.set(u * (2 + hash(i + 3) * 6), u * 3 + i, 0);
    });
  }

  // ---------------- câmera: chaves por cenário; cada movimento sai rápido e freia (expo out) ----------------
  // K = [tempo, alvo, giro (graus), inclinação (graus), distância, lente]
  const K = (t, alvo, az, el, d, fov = 40) => ({ t, alvo, az, el, d, fov });
  const xCaminhao = (t) => -16 + (t - CENAS[2].a) * 5.2;
  const S = (i) => CENAS[i].a;
  const CAM = [
    [K(S(0), [0, 0.8, 0], -35, 38, 26), K(S(0) + 1.2, [0, 0.8, 0], -6, 9, 6.2), K(tPres, [0, 0.75, 0], 6, 6, 4.4)],
    [K(S(1), [0, 1.6, -1], -25, 9, 15), K(S(1) + 0.55, [0, 1.5, -1.2], -8, 6, 5.4), K(Wd("três") - 0.1, [0, 1.5, -1.2], 2, 6, 4.8), K(Wd("três") + 0.35, [0, 2.5, -3], 18, 12, 12.5), K(S(2), [0, 2.5, -3], 26, 13, 12)],
    [K(S(2), (t) => [xCaminhao(t) - 0.6, 1.5, 0], 10, 16, 13), K(S(2) + 0.5, (t) => [xCaminhao(t) - 0.6, 1.6, 0], 24, 12, 10), K(tSP - 0.2, (t) => [xCaminhao(t) - 0.6, 1.6, 0], 34, 12, 10.5), K(tSP + 0.4, (t) => [xCaminhao(t) + 8, 3, 0], -38, 14, 20), K(S(3), (t) => [xCaminhao(t) + 9, 3.2, 0], -44, 13, 18)],
    [K(S(3), [-0.3, 2.2, 0], 30, 14, 13), K(S(3) + 0.5, [-0.2, 2.1, 0], 22, 10, 10), K(tPrensa - 0.2, [-0.1, 2.0, 0], 16, 9, 9), K(tPrensa + 0.15, [0.5, 1.4, 0.5], 10, 5, 4.6), K(S(4), [0.6, 1.4, 0.5], 4, 5, 4.2)],
    [K(S(4), [0, 1.5, 2], 0, 42, 26), K(S(4) + 0.6, [-0.3, 2.3, -2.2], -6, 9, 6.2), K(tPartido - 0.15, [-0.1, 2.4, -2.4], 6, 8, 5.6), K(tPartido + 0.35, [1.8, 3.8, -3.2], -14, 6, 10), K(S(5), [1.8, 4.2, -3.2], -18, 5, 9.6)],
    [K(S(5), [-1.5, 2.2, 0], -14, 8, 11), K(tX[0] - 0.05, [-4.5, 3, -2], -10, 4, 6.5), K(tX[1] - 0.05, [-1.5, 3, -2], -2, 4, 6.5), K(tX[2] - 0.05, [1.5, 3, -2], 6, 4, 6.5),
      K(tQuarta - 0.05, [1.0, 2.3, -0.5], 12, 6, 11.5), K(tGanhou - 0.05, [1.0, 2.2, -0.5], 10, 6, 10.5), K(tGanhou + 0.4, [-0.4, 1.6, 0.6], 4, 5, 6.2), K(S(6), [-0.4, 1.6, 0.6], -2, 5, 5.8)],
    [K(S(6), [0, 2.5, -2], 35, 28, 20), K(S(6) + 0.6, [0, 1.5, -1.2], 12, 8, 6.4), K(tVoltou - 0.05, [0, 1.5, -1.2], 4, 7, 5.6), K(tVoltou + 0.4, [0, 1.6, -1.2], -6, 5, 4.4), K(S(7), [0, 1.6, -1.2], -10, 5, 4.2)],
    [K(S(7), [0, 2.0, -1.2], -4, 3, 3.6), K(S(7) + 0.5, [0, 2.05, -1.2], 0, 2, 2.9), K(T.duracao, [0, 2.05, -1.2], 4, 2, 2.6)],
  ];
  const v3 = (a, t) => (typeof a === "function" ? a(t) : a);
  function camera(i, t) {
    const ks = CAM[i];
    let a = ks[0], b = ks[0], u = 1;
    for (let k = 0; k < ks.length - 1; k++) if (t >= ks[k].t) { a = ks[k]; b = ks[k + 1]; u = (t - a.t) / Math.max(1e-3, b.t - a.t); }
    if (t >= ks[ks.length - 1].t) { a = b = ks[ks.length - 1]; u = 1; }
    // sai rápido e freia em ~0,5 s (uns 14 quadros), depois desliza devagar até a próxima chave
    const e = a === b ? 1 : 0.88 * expoOut((t - a.t) / 0.55) + 0.12 * clamp(u);
    const A = v3(a.alvo, t), B = v3(b.alvo, t);
    const alvo = [0, 1, 2].map((j) => lerp(A[j], B[j], e));
    // deriva lenta por cima: a câmera nunca fica parada
    const az = lerp(a.az, b.az, e) + Math.sin(t * 0.8) * 1.2, el = lerp(a.el, b.el, e) + Math.sin(t * 0.6 + 1) * 0.6;
    const d = lerp(a.d, b.d, e) * (1 - 0.006 * (t - CENAS[i].a)), fov = lerp(a.fov, b.fov, e);
    const ra = (az * Math.PI) / 180, re = (el * Math.PI) / 180;
    let p = [alvo[0] + d * Math.cos(re) * Math.sin(ra), alvo[1] + d * Math.sin(re), alvo[2] + d * Math.cos(re) * Math.cos(ra)];
    for (const k of TREMIDAS) {                                  // tremida: troca de lado a cada quadro, some em 7 quadros
      const q = Math.floor((t - k.t) * 30);
      if (q >= 0 && q < 7) { const s = (q % 2 ? 1 : -1) * k.f * (1 - q / 7); p = [p[0] + s, p[1] + s * 0.6, p[2]]; }
    }
    return { p, alvo, fov };
  }

  const LUZ = {
    sertao: { alto: 0x3f8fe0, horiz: 0xf3d6a2, sol: [-8, 12, 6], hemi: 1.2, sI: 2.6, nevoa: [30, 140] },
    palacio: { alto: 0x2f7fd8, horiz: 0xbfe0f6, sol: [10, 16, 10], hemi: 1.3, sI: 2.4, nevoa: [40, 220] },
    estrada: { alto: 0x4a95e6, horiz: 0xf6dcaa, sol: [-6, 14, 9], hemi: 1.2, sI: 2.6, nevoa: [45, 160] },
    fabrica: { alto: 0x7d8aa0, horiz: 0xb7c2d0, sol: [6, 14, 8], hemi: 1.0, sI: 2.0, nevoa: [30, 120] },
    comicio: { alto: 0xff9a4a, horiz: 0xffd28c, sol: [-10, 7, 6], hemi: 1.15, sI: 2.4, nevoa: [25, 120] },
    eleicoes: { alto: 0x2c4f8f, horiz: 0x4a78c4, sol: [4, 12, 10], hemi: 1.3, sI: 1.9, nevoa: [40, 200] },
  };

  const textos = criarTextos(raiz, W, H);
  const flash = document.createElement("div");
  flash.style.cssText = "position:absolute;inset:0;background:#fff;pointer-events:none;opacity:0";
  raiz.appendChild(flash);
  const pCaminhao = new THREE.Vector3(), pBandeira = new THREE.Vector3(3.2, 6.2, -3.6), pPrensa = new THREE.Vector3(-1.6, 6.3, -0.6), pPres = new THREE.Vector3(0, 3.0, -1.2);
  const ETIQ = [
    { id: "e1952", texto: "1952", t0: Wd("1952"), t1: Wd("1952") + 2.2, ponto: pCaminhao },
    { id: "esp", texto: "SÃO PAULO", t0: tSP, t1: CENAS[2].b, ponto: new THREE.Vector3(56, 22, -10) },
    { id: "e1964", texto: "1964", t0: tPrensa, t1: CENAS[3].b, ponto: pPrensa },
    { id: "ept", texto: "PT · 1980", t0: tPartido, t1: CENAS[4].b, ponto: pBandeira },
    { id: "e2022", texto: "2022", t0: tVoltou, t1: CENAS[6].b, ponto: pPres },
  ];
  const FRASES_FORTES = new Set([5, 6]);
  function legendaEm(t) {
    for (let i = 0; i < PALAVRAS.length; i++) {
      const p = PALAVRAS[i], fim = Math.min(PALAVRAS[i + 1]?.s ?? p.e + 0.6, p.e + 0.6);
      if (t >= p.s && t < fim) return { texto: p.w.replace(/[.,!?:;]+$/, ""), nome: FRASES_FORTES.has(p.frase), t0: p.s };
    }
    return null;
  }

  function quadro(t) {
    const i = Math.max(0, CENAS.findIndex((c) => t >= c.a && t < c.b));
    const C = CENAS[i];
    Object.entries(G).forEach(([id, g]) => (g.visible = id === C.id));
    const L = LUZ[C.id];
    ceuMat.uniforms.alto.value.setHex(L.alto); ceuMat.uniforms.horiz.value.setHex(L.horiz);
    cena.fog.color.setHex(L.horiz); cena.fog.near = L.nevoa[0]; cena.fog.far = L.nevoa[1];
    hemi.intensity = L.hemi; sol.intensity = L.sI;

    const c = camera(i, t);
    cam.fov = c.fov; cam.position.set(...c.p); cam.lookAt(...c.alvo); cam.updateProjectionMatrix();
    ceu.position.copy(cam.position);
    sol.target.position.set(c.alvo[0], 0, c.alvo[2]);
    sol.position.set(c.alvo[0] + L.sol[0], L.sol[1], c.alvo[2] + L.sol[2]);
    confete.visible = false;

    const vis = (ids) => ids.forEach((id) => atores[id].atualizar(t, cam));
    if (C.id === "sertao") vis(["menino"]);
    if (C.id === "palacio") {
      const v = C.versao;
      atores.pres1.raiz.visible = v === 1; atores.pres2.raiz.visible = v !== 1;
      if (v === 1) atores.pres1.atualizar(t, cam);
      else atores.pres2.atualizar(t, cam, { pose: v === 3 ? "aponta" : t < tVoltou ? "aceno" : "vibra", emocao: v === 3 ? "feliz" : "riso" });
      extras.povo.forEach((p) => { p.raiz.visible = v !== 3; if (v !== 3) p.atualizar(t, cam); });
      extras.bandeiraBR.mexer(t);
      if (v === 2) confeteEm(t, tVoltou, [0, 3.2, -1]);
    }
    if (C.id === "estrada") {
      const x = xCaminhao(t);
      extras.caminhao.position.set(x, Math.abs(Math.sin(t * 13)) * 0.04, 0);
      extras.caminhao.rotation.z = Math.sin(t * 9) * 0.012;
      extras.rodas.forEach((rd) => (rd.rotation.z = -(x + 16) / 0.5));
      pCaminhao.set(x - 1.4, 3.3, 0);
      vis(["mae", "luizinho", "irmao1", "irma"]);
    }
    if (C.id === "fabrica") {
      const u = clamp((t - (tPrensa - 0.12)) / 0.12);
      extras.martelo.position.y = 3.8 - (3.8 - 1.25) * u * u + (u >= 1 ? Math.sin((t - tPrensa) * 40) * 0.04 * Math.exp(-(t - tPrensa) * 8) : 0);
      const dor = t >= tPrensa;
      atores.operario.atualizar(t, cam, { pose: dor ? "dor" : "parado", emocao: dor ? "dor" : t > tPrensa - 0.9 ? "susto" : "feliz" });
      const ut = t - tPrensa;
      extras.faiscas.forEach((m, k) => {
        m.visible = ut > 0 && ut < 0.9;
        if (!m.visible) return;
        const vx = (hash(k) - 0.5) * 7, vy = 2 + hash(k + 1) * 4, vz = 1 + hash(k + 2) * 3;
        m.position.set(-1.6 + vx * ut, 1.3 + vy * ut - 4.9 * ut * ut, -0.6 + vz * ut);
        m.lookAt(m.position.x + vx, m.position.y + vy - 9.8 * ut, m.position.z + vz);
      });
    }
    if (C.id === "comicio") {
      vis(["lider", ...Object.keys(atores).filter((k) => k.startsWith("multidao"))]);
      const sobe = ramp(t, tPartido - 0.1, tPartido + 0.9, (u) => 1 - Math.pow(1 - u, 3));
      extras.bandeiraPT.malha.position.y = 2 + sobe * 5.2;
      pBandeira.set(4.6, 3.2 + sobe * 5.6, -3.6);
      extras.bandeiraPT.mexer(t);
    }
    if (C.id === "eleicoes") {
      extras.marcas.forEach((m, k) => { const t0 = k < 3 ? tX[k] : tGanhou; const s = pop(t, t0 - 0.03, 0.22); m.visible = s > 0; m.scale.setScalar(Math.max(0.001, s)); });
      extras.quadros.forEach((q, k) => { const t0 = k < 3 ? S(5) + k * 0.12 : tQuarta - 0.05; const s = pop(t, t0, 0.3); q.visible = s > 0; q.scale.setScalar(Math.max(0.001, s)); });
      const ganhou = t >= tGanhou;
      atores.candidato.atualizar(t, cam, { pose: ganhou ? "vibra" : t > tQuarta - 0.1 ? "parado" : "triste", emocao: ganhou ? "riso" : t > tQuarta - 0.1 ? "feliz" : "triste" });
      confeteEm(t, tGanhou, [0.5, 3.5, -1]);
    }

    r.render(cena, cam);
    const fl = Math.max(0, ...FLASHES.map((f) => (t >= f && t < f + 0.25 ? 1 - (t - f) / 0.25 : 0)));
    flash.style.opacity = (fl * 0.75).toFixed(3);
    textos.desenhar(t, legendaEm(t), ETIQ, cam);
  }
  return { quadro };
}
