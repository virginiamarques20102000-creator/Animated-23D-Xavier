// usage: node scripts/stills3d.mjs <outPrefix> <frame,frame,...> [scale] — one bundle, one browser (swangle), jpeg stills
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition, openBrowser } from "@remotion/renderer";
import path from "node:path";
const [prefix, frames, scale = "0.5"] = process.argv.slice(2);
const browserExecutable = "/opt/pw-browsers/chromium-1243/chrome-linux64/chrome", chromiumOptions = { gl: "swangle" };
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts"), publicDir: path.resolve("public") });
const puppeteerInstance = await openBrowser("chrome", { browserExecutable, chromiumOptions });
const composition = await selectComposition({ serveUrl, id: process.env.COMP || "Ww2Film3D", puppeteerInstance });
const onBrowserLog = (l) => { if (l.type === "error") console.log("[err]", l.text.slice(0, 300)); };
for (const f of frames.split(",").map(Number)) {
  const t0 = Date.now();
  try { await renderStill({ composition, serveUrl, frame: f, output: `${prefix}${f}.jpg`, imageFormat: "jpeg", jpegQuality: 85, scale: Number(scale), puppeteerInstance, timeoutInMilliseconds: 240000, onBrowserLog });
    console.log("still", f, ((Date.now() - t0) / 1000).toFixed(1) + "s"); } catch (e) { console.log("FAIL", f, String(e).slice(0, 400)); }
}
await puppeteerInstance.close({ silent: true });
