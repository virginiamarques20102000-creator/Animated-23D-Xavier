// Render da cena sem o HyperFrames: abre cena/index.html no Chromium do Playwright, pede cada quadro
// pelo mesmo evento que o HyperFrames usa ("hf-seek"), fotografa a página e manda para o ffmpeg.
// Use quando o HyperFrames não roda (sem rede para o npx/CDN, sem Chrome próprio) ou para fotos rápidas.
//
// Uso:
//   node render_playwright.mjs cena video.mp4 [--fps 30] [--de 0] [--ate 27] [--audio cena/assets/voz.wav] [--escala 1]
//   node render_playwright.mjs cena fotos/ --fotos 2.0,5.5,9.1          (só imagens soltas, PNG)
//   --largura 1920 --altura 1080 (16:9)   --pagina "index.html#antes" (outra página/variante da mesma pasta)
//
// Precisa: playwright (require('playwright') já resolve no ambiente da nuvem) e ffmpeg.
import { createServer } from "node:http";
import { readFile, mkdir } from "node:fs/promises";
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import path from "node:path";

const require_ = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require_("playwright")); } catch { ({ chromium } = await import("playwright")); }

const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf("--" + n); return i >= 0 ? args[i + 1] : d; };
const [pasta, saida] = args;
const fps = +opt("fps", 30), escala = +opt("escala", 1);
const fotos = opt("fotos", null);
const raiz = path.resolve(pasta);
const TIPOS = { ".html": "text/html", ".js": "text/javascript", ".mjs": "text/javascript", ".json": "application/json", ".wav": "audio/wav", ".mp3": "audio/mpeg", ".png": "image/png", ".jpg": "image/jpeg" };
const srv = createServer(async (req, res) => {
  try {
    const p = path.join(raiz, decodeURIComponent(req.url.split("?")[0] === "/" ? "/index.html" : req.url.split("?")[0]));
    if (!p.startsWith(raiz)) throw new Error("fora");
    res.writeHead(200, { "Content-Type": TIPOS[path.extname(p)] || "application/octet-stream" });
    res.end(await readFile(p));
  } catch { res.writeHead(404); res.end(); }
}).listen(0);
const porta = srv.address().port;

const nav = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
const pag = await nav.newPage({ viewport: { width: +opt("largura", 1080), height: +opt("altura", 1920) }, deviceScaleFactor: escala });
const erros = [];
pag.on("pageerror", (e) => erros.push(String(e)));
pag.on("console", (m) => { if (m.type() === "error") erros.push(m.text()); });
await pag.goto(`http://127.0.0.1:${porta}/${opt("pagina", "index.html")}`);
await pag.waitForFunction(() => window.__hf && window.__hf.buildReady && window.__hf.buildReady.cena, null, { timeout: 30000 });
await pag.evaluate(() => window.__hf.buildReady.cena);
if (erros.length) { console.error("erros na página:\n" + erros.join("\n")); }
const dur = await pag.evaluate(() => +document.getElementById("raiz").dataset.duration);
const ir = (t) => pag.evaluate((t) => window.dispatchEvent(new CustomEvent("hf-seek", { detail: { time: t } })), t);

if (fotos) {
  await mkdir(saida, { recursive: true });
  for (const t of fotos.split(",").map(Number)) {
    await ir(t);
    await pag.screenshot({ path: path.join(saida, `foto_${t.toFixed(2)}.png`) });
  }
  console.log(`fotos em ${saida}/`);
} else {
  const de = +opt("de", 0), ate = Math.min(+opt("ate", dur), dur);
  const audio = opt("audio", null);
  const ff = ["-y", "-v", "error", "-f", "image2pipe", "-framerate", String(fps), "-c:v", "mjpeg", "-i", "-"];
  if (audio) ff.push("-ss", String(de), "-i", audio, "-map", "0:v", "-map", "1:a", "-c:a", "aac", "-b:a", "192k", "-shortest");
  ff.push("-c:v", "libx264", "-crf", "18", "-preset", "medium", "-pix_fmt", "yuv420p", "-movflags", "+faststart", saida);
  const f = spawn("ffmpeg", ff, { stdio: ["pipe", "inherit", "inherit"] });
  const n = Math.round((ate - de) * fps), t0 = Date.now();
  for (let q = 0; q < n; q++) {
    await ir(de + q / fps);
    const img = await pag.screenshot({ type: "jpeg", quality: 92 });
    if (!f.stdin.write(img)) await new Promise((r) => f.stdin.once("drain", r));
    if (q % 60 === 0) process.stdout.write(`quadro ${q}/${n} (${((Date.now() - t0) / 1000).toFixed(0)} s)\n`);
  }
  f.stdin.end();
  await new Promise((r) => f.on("close", r));
  console.log(`pronto: ${saida} (${n} quadros, ${((Date.now() - t0) / 1000).toFixed(0)} s)`);
}
if (erros.length) console.error(`${erros.length} erro(s) no console da página`);
await nav.close();
srv.close();
