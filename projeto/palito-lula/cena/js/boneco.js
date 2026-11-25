// O boneco palito: cabeça redonda grande, olhos de ponto, corpo e membros de palito, roupa de cor forte,
// contorno escuro grosso. Desenhado num canvas a cada quadro a partir do tempo t (respira, pisca, mexe o braço)
// e usado como textura de um cartão que sempre olha para a câmera.
import * as THREE from "three";

const TINTA = "#1a1420";
const PELE = "#e7b48d";
const hash = (n) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

// ângulos em graus: 0 = braço para baixo, 90 = para o lado, 180 = para cima; [ombro, cotovelo]
function bracos(pose, t, f) {
  const s = Math.sin, w = s(t * 1.7 + f) * 4;
  switch (pose) {
    case "aceno": return { l: [14 + w, 8], r: [150, 25 + 28 * s(t * 11 + f)] };
    case "vibra": { const b = 8 * s(t * 9 + f); return { l: [150 + b, 15], r: [150 - b, 15], punhos: true }; }
    case "punho": return { l: [16 + w, 10], r: [165 + 6 * s(t * 6 + f), 5], punhoR: true };
    case "dor": return { l: [70, 95], r: [55, 105], maoGrande: true };
    case "triste": return { l: [4, 4], r: [4, 4] };
    case "aponta": return { l: [14 + w, 8], r: [82, -6], aponta: true };
    case "bandeira": return { l: [14 + w, 8], r: [140 + 10 * s(t * 5 + f), 30], bandeira: true };
    default: return { l: [12 + w, 10], r: [12 - w, 10] };
  }
}

export function desenharBoneco(g, o, t) {
  const W = g.canvas.width, H = g.canvas.height, k = W / 512;
  g.setTransform(k, 0, 0, k, 0, 0);
  g.clearRect(0, 0, 512, 1024);
  const crianca = o.idade === "crianca";
  const f = o.fase || 0;
  const resp = Math.sin(t * 2.4 + f) * 5;                      // respiração: o corpo sobe e desce
  const pulo = o.pose === "vibra" ? Math.abs(Math.sin(t * 9 + f)) * 26 : 0;
  const cx = 256, pe = 992 - pulo;
  const quadril = (crianca ? 735 : 650) - pulo, ombro = (crianca ? 540 : 425) - pulo + resp * 0.6;
  const hr = crianca ? 150 : 122;
  const triste = o.pose === "triste";
  const cabY = ombro - hr * 0.95 + (triste ? 14 : 0);
  const inclina = (triste ? 0.08 : 0) + Math.sin(t * 1.1 + f * 2) * 0.03;
  g.lineCap = "round";
  g.lineJoin = "round";

  // pernas de palito e sapatos
  const perna = (lado) => {
    const x0 = cx + lado * 26, x1 = cx + lado * 46;
    g.strokeStyle = o.calca || TINTA;
    g.lineWidth = o.calca ? 34 : 16;
    g.beginPath(); g.moveTo(x0, quadril); g.lineTo(x1, pe - 18); g.stroke();
    if (o.calca) { g.strokeStyle = TINTA; g.lineWidth = 6; g.beginPath(); g.moveTo(x0 - lado * 2, quadril + 30); g.lineTo(x1 - lado * 2, pe - 22); g.stroke(); }
    if (o.calcaCurta) { g.strokeStyle = TINTA; g.lineWidth = 16; g.beginPath(); g.moveTo(x0 + lado * 8, quadril + 90); g.lineTo(x1, pe - 18); g.stroke(); }
    g.fillStyle = o.descalco ? PELE : "#2a2228";
    g.strokeStyle = TINTA; g.lineWidth = 7;
    g.beginPath(); g.ellipse(x1 + lado * 14, pe - 12, 30, 15, 0, 0, Math.PI * 2); g.fill(); g.stroke();
  };
  perna(-1); perna(1);
  if (o.calcaCurta) {
    g.fillStyle = o.calcaCurta; g.strokeStyle = TINTA; g.lineWidth = 8;
    g.beginPath(); g.moveTo(cx - 58, quadril - 30); g.lineTo(cx + 58, quadril - 30); g.lineTo(cx + 70, quadril + 95); g.lineTo(cx + 8, quadril + 95);
    g.lineTo(cx, quadril + 40); g.lineTo(cx - 8, quadril + 95); g.lineTo(cx - 70, quadril + 95); g.closePath(); g.fill(); g.stroke();
  }

  // tronco: a roupa de cor forte
  const ombroL = crianca ? 62 : 74;
  const tronco = () => {
    g.beginPath();
    g.moveTo(cx - ombroL, ombro + 6);
    g.quadraticCurveTo(cx, ombro - 18, cx + ombroL, ombro + 6);
    g.lineTo(cx + ombroL - 8, quadril + (o.vestido ? 120 : 8));
    g.quadraticCurveTo(cx, quadril + (o.vestido ? 140 : 20), cx - ombroL + 8, quadril + (o.vestido ? 120 : 8));
    g.closePath();
  };
  g.fillStyle = o.roupa || "#2f6fd6"; tronco(); g.fill();
  g.save(); tronco(); g.clip();
  if (o.terno) {                                              // camisa branca e gravata no meio do paletó
    g.fillStyle = "#f4f1ea"; g.beginPath(); g.moveTo(cx - 34, ombro - 10); g.lineTo(cx, ombro + 120); g.lineTo(cx + 34, ombro - 10); g.fill();
    g.fillStyle = "#b3262b"; g.beginPath(); g.moveTo(cx - 10, ombro + 4); g.lineTo(cx + 10, ombro + 4); g.lineTo(cx + 13, ombro + 120); g.lineTo(cx, ombro + 138); g.lineTo(cx - 13, ombro + 120); g.fill();
  }
  if (o.macacao) {                                            // alças do macacão do metalúrgico
    g.strokeStyle = "#f2c230"; g.lineWidth = 10;
    g.beginPath(); g.moveTo(cx - 40, ombro - 6); g.lineTo(cx - 34, quadril); g.moveTo(cx + 40, ombro - 6); g.lineTo(cx + 34, quadril); g.stroke();
  }
  if (o.faixa) {                                              // a faixa presidencial: verde com o meio amarelo
    g.strokeStyle = "#13994a"; g.lineWidth = 46;
    g.beginPath(); g.moveTo(cx + ombroL - 6, ombro - 10); g.lineTo(cx - ombroL + 4, quadril + 30); g.stroke();
    g.strokeStyle = "#f7d117"; g.lineWidth = 14;
    g.beginPath(); g.moveTo(cx + ombroL - 6, ombro - 10); g.lineTo(cx - ombroL + 4, quadril + 30); g.stroke();
  }
  if (o.remendo) { g.fillStyle = o.remendo; g.fillRect(cx + 10, ombro + 90, 40, 36); g.strokeStyle = TINTA; g.lineWidth = 4; g.strokeRect(cx + 10, ombro + 90, 40, 36); }
  g.restore();
  g.strokeStyle = TINTA; g.lineWidth = 9; tronco(); g.stroke();

  // braços de palito (mão de pele) a partir do ombro
  const B = bracos(o.pose, t, f);
  const L1 = crianca ? 105 : 128, L2 = crianca ? 95 : 118;
  const braco = (lado, [a1, a2], punho) => {
    const r1 = (a1 * Math.PI) / 180, r2 = ((a1 + a2) * Math.PI) / 180;
    const sx = cx + lado * (ombroL - 12), sy = ombro + 22;
    const ex = sx + lado * Math.sin(r1) * L1, ey = sy + Math.cos(r1) * L1;
    const hx = ex + lado * Math.sin(r2) * L2, hy = ey + Math.cos(r2) * L2;
    g.strokeStyle = o.manga || o.roupa || "#2f6fd6"; g.lineWidth = 30;
    g.beginPath(); g.moveTo(sx, sy); g.lineTo(ex, ey); g.stroke();
    g.strokeStyle = TINTA; g.lineWidth = 15;
    g.beginPath(); g.moveTo(ex, ey); g.lineTo(hx, hy); g.stroke();
    g.lineWidth = 4; g.strokeStyle = TINTA;
    g.beginPath(); g.moveTo(sx, sy); g.lineTo(ex, ey); g.stroke();
    const rm = punho ? 22 : B.maoGrande ? 24 : 18;
    g.fillStyle = PELE; g.strokeStyle = TINTA; g.lineWidth = 7;
    g.beginPath(); g.arc(hx, hy, rm, 0, Math.PI * 2); g.fill(); g.stroke();
    if (B.aponta && lado === 1) { g.lineWidth = 12; g.strokeStyle = TINTA; g.beginPath(); g.moveTo(hx, hy); g.lineTo(hx + 34, hy - 4); g.stroke(); g.strokeStyle = PELE; g.lineWidth = 6; g.beginPath(); g.moveTo(hx, hy); g.lineTo(hx + 32, hy - 4); g.stroke(); }
    if (B.bandeira && lado === 1) {                            // a bandeirinha do Brasil na mão
      g.strokeStyle = "#5a3a20"; g.lineWidth = 8; g.beginPath(); g.moveTo(hx, hy + 30); g.lineTo(hx, hy - 120); g.stroke();
      g.fillStyle = "#169b3a"; g.fillRect(hx, hy - 120, 92, 62); g.fillStyle = "#f7d117";
      g.beginPath(); g.moveTo(hx + 46, hy - 114); g.lineTo(hx + 86, hy - 89); g.lineTo(hx + 46, hy - 64); g.lineTo(hx + 6, hy - 89); g.fill();
      g.fillStyle = "#1d3f9a"; g.beginPath(); g.arc(hx + 46, hy - 89, 15, 0, Math.PI * 2); g.fill();
      g.strokeStyle = TINTA; g.lineWidth = 5; g.strokeRect(hx, hy - 120, 92, 62);
    }
  };
  braco(-1, B.l, B.punhos);
  braco(1, B.r, B.punhos || B.punhoR);

  // cabeça redonda grande
  g.save();
  g.translate(cx, cabY);
  g.rotate(inclina);
  g.fillStyle = PELE; g.strokeStyle = TINTA; g.lineWidth = 8;
  for (const l of [-1, 1]) { g.beginPath(); g.arc(l * hr * 0.98, hr * 0.08, hr * 0.17, 0, Math.PI * 2); g.fill(); g.stroke(); }
  const cabeca = () => { g.beginPath(); g.arc(0, 0, hr, 0, Math.PI * 2); };
  cabeca(); g.fill();
  g.save(); cabeca(); g.clip();
  if (o.cabelo) {                                             // cabelo: um gorro por cima, cortado pelo círculo
    g.fillStyle = o.cabelo;
    g.beginPath(); g.ellipse(0, -hr * 0.72, hr * 1.1, hr * 0.62, 0, 0, Math.PI * 2); g.fill();
    g.fillRect(-hr, -hr * 0.7, hr * 0.2, hr * 0.55); g.fillRect(hr * 0.8, -hr * 0.7, hr * 0.2, hr * 0.55);
  }
  if (o.lenco) { g.fillStyle = o.lenco; g.beginPath(); g.ellipse(0, -hr * 0.62, hr * 1.15, hr * 0.7, 0, 0, Math.PI * 2); g.fill(); }
  if (o.barba) {                                              // barba cheia: a metade de baixo do rosto
    g.fillStyle = o.barba;
    g.beginPath(); g.ellipse(0, hr * 0.86, hr * 0.92, hr * 0.5, 0, 0, Math.PI * 2); g.fill();
    g.fillRect(-hr, hr * 0.22, hr * 0.16, hr * 0.5); g.fillRect(hr * 0.84, hr * 0.22, hr * 0.16, hr * 0.5);
  }
  g.restore();
  cabeca(); g.stroke();

  // rosto: olhos de ponto, sobrancelha que faz metade da emoção, boca simples
  const em = o.emocao || "feliz";
  const piscando = ((t + f * 3.1) % 3.3) < 0.1;
  g.fillStyle = TINTA; g.strokeStyle = TINTA;
  for (const l of [-1, 1]) {
    const ex = l * hr * 0.34, ey = -hr * 0.05;
    if (piscando) { g.lineWidth = 7; g.beginPath(); g.moveTo(ex - 14, ey); g.lineTo(ex + 14, ey); g.stroke(); }
    else if (em === "susto") { g.fillStyle = "#fff"; g.lineWidth = 6; g.beginPath(); g.arc(ex, ey, hr * 0.17, 0, Math.PI * 2); g.fill(); g.stroke(); g.fillStyle = TINTA; g.beginPath(); g.arc(ex, ey, hr * 0.06, 0, Math.PI * 2); g.fill(); }
    else if (em === "dor") { g.lineWidth = 7; g.beginPath(); g.moveTo(ex - l * 14, ey - 12); g.lineTo(ex + l * 10, ey); g.lineTo(ex - l * 14, ey + 12); g.stroke(); }
    else if (em === "riso") { g.lineWidth = 7; g.beginPath(); g.arc(ex, ey + 6, 15, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); }
    else { g.beginPath(); g.ellipse(ex, ey, hr * 0.085, hr * 0.12, 0, 0, Math.PI * 2); g.fill(); }
    // sobrancelha
    const ang = { triste: -0.4, dor: -0.45, susto: 0.0, bravo: 0.45, feliz: 0.1, riso: 0.15 }[em] ?? 0.1;
    const sb = o.barba || o.cabelo || TINTA;
    g.strokeStyle = sb === PELE ? TINTA : (o.sobrancelha || TINTA); g.lineWidth = 9;
    g.beginPath(); g.moveTo(ex - 22, ey - hr * 0.3 + l * ang * 18 * -1); g.lineTo(ex + 22, ey - hr * 0.3 - l * ang * 18 * -1); g.stroke();
    g.strokeStyle = TINTA;
  }
  if (o.barba) {                                              // bigode por cima da boca
    g.fillStyle = o.bigode || o.barba; g.strokeStyle = TINTA; g.lineWidth = 4;
    g.beginPath(); g.ellipse(0, hr * 0.4, hr * 0.34, hr * 0.11, 0, 0, Math.PI * 2); g.fill();
  }
  const my = hr * 0.6;
  g.lineWidth = 7; g.strokeStyle = TINTA;
  if (em === "feliz" || em === "riso") {
    g.fillStyle = "#7a2230"; g.beginPath(); g.arc(0, my - 14, hr * 0.26, 0.15 * Math.PI, 0.85 * Math.PI); g.closePath(); g.fill(); g.stroke();
  } else if (em === "triste") {
    g.beginPath(); g.arc(0, my + 18, hr * 0.2, 1.15 * Math.PI, 1.85 * Math.PI); g.stroke();
  } else if (em === "susto" || em === "dor") {
    g.fillStyle = "#7a2230"; g.beginPath(); g.ellipse(0, my, hr * 0.13, hr * 0.17, 0, 0, Math.PI * 2); g.fill(); g.stroke();
  } else { g.beginPath(); g.moveTo(-20, my); g.lineTo(20, my); g.stroke(); }
  if (em === "dor" || em === "susto") {                       // gota de suor
    g.fillStyle = "#8fd3ff"; g.strokeStyle = TINTA; g.lineWidth = 4;
    g.beginPath(); g.moveTo(hr * 0.75, -hr * 0.5); g.quadraticCurveTo(hr * 0.92, -hr * 0.2, hr * 0.75, -hr * 0.15); g.quadraticCurveTo(hr * 0.58, -hr * 0.2, hr * 0.75, -hr * 0.5); g.fill(); g.stroke();
  }
  g.restore();
}

// Um cartão: o boneco num plano que gira em Y para olhar a câmera, com uma sombra de contato no chão.
export function cartao(o) {
  const res = o.res || 512;
  const c = document.createElement("canvas");
  c.width = res; c.height = res * 2;
  const g = c.getContext("2d");
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  const alt = o.alt || 1.8;
  const geo = new THREE.PlaneGeometry(alt * 0.5, alt);
  geo.translate(0, alt / 2, 0);
  const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, alphaTest: 0.35, toneMapped: false, fog: true });
  const malha = new THREE.Mesh(geo, mat);
  const raiz = new THREE.Group();
  raiz.add(malha);
  const sombra = new THREE.Mesh(new THREE.CircleGeometry(alt * 0.17, 24), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.32, depthWrite: false }));
  sombra.rotation.x = -Math.PI / 2;
  sombra.position.y = 0.012;
  sombra.scale.set(1.3, 0.75, 1);
  raiz.add(sombra);
  if (o.pos) raiz.position.set(...o.pos);
  return {
    raiz, o,
    atualizar(t, cam, mudar = {}) {
      Object.assign(o, mudar);
      desenharBoneco(g, o, t);
      tex.needsUpdate = true;
      const p = new THREE.Vector3();
      raiz.getWorldPosition(p);
      malha.rotation.y = Math.atan2(cam.position.x - p.x, cam.position.z - p.z);
    },
  };
}

export { hash };
