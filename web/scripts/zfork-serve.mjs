// Static server for the forked ZCode renderer with the nofy bridge injected.
// Usage: node scripts/zfork-serve.mjs [httpPort]
import http from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(here, "../zfork/renderer");
const BRIDGE = path.join(here, "../zfork/bridge-nofy.js");
const PORT = Number(process.argv[2] ?? 5180);

const MIME = {
  ".js": "text/javascript",
  ".mjs": "text/javascript",
  ".css": "text/css",
  ".html": "text/html",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".wasm": "application/wasm",
  ".json": "application/json",
  ".mp3": "audio/mpeg",
  ".bcmap": "application/octet-stream",
};

const bridgeSrc = await readFile(BRIDGE, "utf8");

http
  .createServer(async (req, res) => {
    const url = new URL(req.url ?? "/", "http://x");
    let rel = decodeURIComponent(url.pathname);
    if (rel === "/bridge-nofy.js") {
      res.setHeader("content-type", "text/javascript");
      res.end(bridgeSrc);
      return;
    }
    if (rel === "/" || rel === "") rel = "/index.html";
    const file = path.join(ROOT, rel);
    if (!file.startsWith(ROOT)) {
      res.statusCode = 403;
      res.end();
      return;
    }
    try {
      let body = await readFile(file);
      const type = MIME[path.extname(file)] ?? "application/octet-stream";
      res.setHeader("content-type", type);
      if (path.extname(file) === ".html") {
        let html = body.toString("utf8");
        html = html.replace("<head>", '<head>\n<script src="/bridge-nofy.js"></script>');
        res.end(html);
        return;
      }
      res.end(body);
    } catch {
      res.statusCode = 404;
      res.end("not found");
    }
  })
  .listen(PORT, "0.0.0.0", () => console.log(`[zfork] serving on http://127.0.0.1:${PORT}/`));
