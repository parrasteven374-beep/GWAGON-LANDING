// Prueba local con Chrome headless por CDP (herramienta de desarrollo, NO forma parte del sitio).
// Uso: node tools/probar.mjs <url> <perfil: desktop|mobile|reduce> <carpeta-salida> [fracciones...]
import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const [url, perfil = "desktop", out = join(tmpdir(), "gw"), ...resto] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const port = 9300 + Math.floor(Math.random() * 500);
const profile = mkdtempSync(join(tmpdir(), "gwchrome-"));
const proc = spawn(CHROME, [`--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, "--headless=new", "--no-first-run",
  "--disable-gpu-vsync", "--hide-scrollbars", "about:blank"], { stdio: "ignore" });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let targets;
for (let i = 0; i < 50; i++) { try { targets = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); if (targets.length) break; } catch { } await sleep(200); }
const page = targets.find((t) => t.type === "page");
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let id = 0; const pend = new Map(); const logs = [];
ws.onmessage = (m) => {
  const d = JSON.parse(m.data);
  if (d.id && pend.has(d.id)) { pend.get(d.id)(d.result ?? d.error); pend.delete(d.id); return; }
  if (d.method === "Runtime.consoleAPICalled") logs.push(`[console.${d.params.type}] ` + d.params.args.map((a) => a.value ?? a.description).join(" "));
  if (d.method === "Runtime.exceptionThrown") logs.push("[EXCEPTION] " + (d.params.exceptionDetails.exception?.description || d.params.exceptionDetails.text));
  if (d.method === "Network.loadingFailed") logs.push(`[net-fail] ${d.params.errorText} ${d.params.requestId}`);
  if (d.method === "Network.responseReceived" && d.params.response.status >= 400) logs.push(`[http ${d.params.response.status}] ${d.params.response.url}`);
};
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pend.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
const ev = async (expr) => { const r = await send("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true }); if (r.exceptionDetails) console.log("EVAL-ERR", r.exceptionDetails.exception?.description); return r.result?.value; };

await send("Runtime.enable"); await send("Network.enable"); await send("Page.enable");
const W = Number(process.env.W) || (perfil === "mobile" ? 390 : 1440), H = Number(process.env.H) || (perfil === "mobile" ? 844 : 900);
await send("Emulation.setDeviceMetricsOverride", { width: W, height: H, deviceScaleFactor: 1, mobile: perfil === "mobile" });
if (perfil === "mobile") await send("Emulation.setTouchEmulationEnabled", { enabled: true });
if (perfil === "reduce") await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
if (process.env.CPU) await send("Emulation.setCPUThrottlingRate", { rate: Number(process.env.CPU) });

await send("Page.addScriptToEvaluateOnNewDocument", { source: `
  window.__m = { lcp: 0, lcpEl: '', cls: 0 };
  new PerformanceObserver((l) => { for (const e of l.getEntries()) { window.__m.lcp = Math.round(e.startTime); window.__m.lcpEl = (e.element && (e.element.className || e.element.tagName)) + ''; } }).observe({ type: 'largest-contentful-paint', buffered: true });
  new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__m.cls += e.value; }).observe({ type: 'layout-shift', buffered: true });
` });
if (process.env.BLOCK) await send("Network.setBlockedURLs", { urls: ["*sirv.com*"] });
await send("Page.navigate", { url });
await sleep(Number(process.env.WAIT || 7500)); // preloader + carga del spin
const shot = async (name) => {
  const r = await send("Page.captureScreenshot", { format: "png" });
  writeFileSync(join(out, `${perfil}-${name}.png`), Buffer.from(r.data, "base64"));
};
await shot("00-carga");

const info = await ev(`JSON.stringify({
  h: document.documentElement.scrollHeight, lenis: !!document.documentElement.classList.contains('lenis'),
  spin: document.querySelector('[data-spin]').className, triggers: window.ScrollTrigger ? ScrollTrigger.getAll().filter(t=>t.pin).map(t=>({id:t.trigger?.id||t.trigger?.className||'?',start:Math.round(t.start),end:Math.round(t.end)})) : null,
  hscroll: document.documentElement.scrollWidth > innerWidth })`);
console.log("INFO", info);
const meta = info ? JSON.parse(info) : { h: 6000 };

if (process.env.TOUCH) {
  // Arrastre horizontal sobre el visor (no debe mover el scroll) y deslizamiento vertical (debe hacer scroll)
  const hash = () => ev(`Math.round(G580.spin.position()*100)/100 + ' | scrollY=' + Math.round(scrollY)`);
  const touch = async (type, x, y) => send("Input.dispatchTouchEvent", { type, touchPoints: type === "touchEnd" ? [] : [{ x, y }] });
  const swipe = async (x0, y0, x1, y1) => { await touch("touchStart", x0, y0); for (let i = 1; i <= 12; i++) { await touch("touchMove", x0 + (x1 - x0) * i / 12, y0 + (y1 - y0) * i / 12); await sleep(16); } await touch("touchEnd"); await sleep(1200); };
  await ev("window.scrollTo(0,0)"); await sleep(800);
  const a = await hash();
  await swipe(300, 520, 60, 520);
  const b = await hash();
  await swipe(200, 700, 200, 300);
  const c = await hash();
  console.log("TOUCH antes:", a, "| tras arrastre horizontal:", b, "| tras deslizar vertical:", c);
}

if (process.env.PERF) {
  console.log("VITALS", await ev("JSON.stringify(window.__m)"));
  // fotogramas durante un recorrido de scroll simulado (rAF)
  const r = await ev(`new Promise((res) => { const ft = []; let last = performance.now(); let y = 0; const H = document.documentElement.scrollHeight - innerHeight; const t0 = last;
    function f(t) { ft.push(t - last); last = t; y += H / 400; window.scrollTo(0, y); if (y < H && ft.length < 900) requestAnimationFrame(f); else { ft.shift(); ft.sort((a, b) => a - b); const avg = ft.reduce((a, b) => a + b, 0) / ft.length; res(JSON.stringify({ frames: ft.length, avgMs: +avg.toFixed(1), p95Ms: +ft[Math.floor(ft.length * 0.95)].toFixed(1), maxMs: +ft[ft.length - 1].toFixed(1), over33: ft.filter((x) => x > 33.4).length })); } }
    requestAnimationFrame(f); })`);
  console.log("SCROLL-FRAMES", r);
}
const stops = resto.length ? resto.map(Number) : [0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0];
let n = 1;
for (const f of stops) {
  await ev(`window.scrollTo(0, ${(f > 1 ? f : Math.round((meta.h - H) * f))})`);
  await sleep(Number(process.env.SETTLE || 1500));
  await shot(String(n++).padStart(2, "0") + "-" + Math.round(f * 100));
}
console.log("LOGS", logs.length ? "\n" + logs.join("\n") : "(sin errores)");
ws.close(); proc.kill();
process.exit(0);
