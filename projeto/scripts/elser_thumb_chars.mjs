import { build } from "esbuild"; import { createRequire } from "node:module"; import fs from "node:fs";
const { chromium } = createRequire(import.meta.url)("playwright"); const d = process.argv[2];
await build({ entryPoints: [d + "/entry.ts"], bundle: true, format: "iife", outfile: d + "/b.js", logLevel: "error" });
fs.writeFileSync(d + "/i.html", `<html><body><script src="b.js"></script></body></html>`);
const b = await chromium.launch(); const p = await b.newPage(); p.on("pageerror", (e) => console.log("ERR", e.message));
await p.goto("file://" + d + "/i.html"); const r = await p.evaluate(() => window.R());
for (const [k, v] of Object.entries(r)) fs.writeFileSync(`${d}/${k}.png`, Buffer.from(v.split(",")[1], "base64")); console.log(Object.keys(r)); await b.close();
