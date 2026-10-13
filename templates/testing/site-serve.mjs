/**
 * apps/site/tests/serve.mjs — minimal static server for an exported marketing site
 * (smoke tests and local speed checks). Usage: node tests/serve.mjs [dir=out] [port=3013]
 *
 * Serves "/x" from x.html when it exists (clean URLs), sends immutable cache headers for
 * hashed assets, and compresses text with brotli or gzip as the production host does,
 * so Lighthouse numbers reflect real transfer sizes. Measure on the LIVE preview too:
 * Assemble's local blocking time was ~210 ms and the live figure ~470 ms.
 */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..", process.argv[2] ?? "out");
const port = Number(process.argv[3] ?? 3013);

const TYPES = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".json": "application/json",
  ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".avif": "image/avif",
  ".svg": "image/svg+xml", ".woff2": "font/woff2", ".txt": "text/plain; charset=utf-8", ".xml": "application/xml",
  ".ico": "image/x-icon", ".glb": "model/gltf-binary",
};
const COMPRESSIBLE = new Set([".html", ".js", ".css", ".json", ".svg", ".txt", ".xml"]);
const cache = new Map();

function resolve(urlPath) {
  const clean = decodeURIComponent(urlPath.split("?")[0]);
  const target = path.normalize(path.join(root, clean));
  if (!target.startsWith(root)) return null;
  const candidates = [target, path.join(target, "index.html"), `${target}.html`];
  return candidates.find((c) => fs.existsSync(c) && fs.statSync(c).isFile()) ?? null;
}

function encoded(file, encoding) {
  const key = `${file}|${encoding}|${fs.statSync(file).mtimeMs}`;
  if (!cache.has(key)) {
    const raw = fs.readFileSync(file);
    cache.set(key, encoding === "br"
      ? zlib.brotliCompressSync(raw, { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 9 } })
      : zlib.gzipSync(raw, { level: 9 }));
  }
  return cache.get(key);
}

http
  .createServer((req, res) => {
    const file = resolve(req.url ?? "/");
    if (!file) {
      const notFound = path.join(root, "404.html");
      res.writeHead(404, { "content-type": TYPES[".html"] });
      res.end(fs.existsSync(notFound) ? fs.readFileSync(notFound) : "Not found");
      return;
    }
    const ext = path.extname(file);
    const headers = { "content-type": TYPES[ext] ?? "application/octet-stream", vary: "accept-encoding" };
    if (/\/_next\/static\/|\/_img\/|\/_3d\//.test(req.url ?? "")) headers["cache-control"] = "public, max-age=31536000, immutable";
    const accept = String(req.headers["accept-encoding"] ?? "");
    const encoding = COMPRESSIBLE.has(ext) ? (/\bbr\b/.test(accept) ? "br" : /\bgzip\b/.test(accept) ? "gzip" : null) : null;
    if (encoding) {
      const body = encoded(file, encoding);
      res.writeHead(200, { ...headers, "content-encoding": encoding, "content-length": body.length });
      res.end(body);
      return;
    }
    res.writeHead(200, headers);
    fs.createReadStream(file).pipe(res);
  })
  .listen(port, "127.0.0.1", () => console.log(`serving ${root} on http://127.0.0.1:${port}`));
