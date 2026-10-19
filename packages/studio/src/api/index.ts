import { startStudioServer } from "./server.js";
import { resolve, join, dirname } from "node:path";
import { existsSync } from "node:fs";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const root = resolve(process.argv[2] ?? process.env.INKOS_PROJECT_ROOT ?? process.cwd());
const port = parseInt(process.env.INKOS_STUDIO_PORT ?? "4567", 10);
const hostname = process.env.INKOS_STUDIO_HOST?.trim() || "127.0.0.1";
// Explicit HTTPS origins admitted by the existing origin guard behind a trusted proxy.
const allowedOrigins = (process.env.INKOS_STUDIO_ALLOWED_ORIGINS ?? "")
  .split(",").map(value => value.trim()).filter(Boolean);
for (const origin of allowedOrigins) {
  const url = new URL(origin);
  if (!["http:", "https:"].includes(url.protocol) || url.origin !== origin) {
    throw new Error("INKOS_STUDIO_ALLOWED_ORIGINS must contain exact HTTP(S) origins");
  }
}

// Find studio package root (2 levels up from src/api/)
const studioRoot = resolve(__dirname, "../..");
const distDir = join(studioRoot, "dist");

// Auto-build frontend if dist/ doesn't exist
if (!existsSync(join(distDir, "index.html"))) {
  console.log("Building frontend...");
  try {
    execSync("npx vite build", { cwd: studioRoot, stdio: "inherit" });
  } catch {
    console.error("Failed to build frontend. Run 'cd packages/studio && pnpm build' manually.");
    process.exit(1);
  }
}

startStudioServer(root, port, { staticDir: distDir, hostname, allowedOrigins }).catch((e) => {
  console.error("Failed to start studio:", e);
  process.exit(1);
});
