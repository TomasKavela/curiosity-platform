import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { cloudflare } from "@cloudflare/vite-plugin";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    react(),
    cloudflare({
      configPath: path.resolve(projectRoot, "wrangler.jsonc"),
      persistState: { path: path.resolve(projectRoot, ".wrangler", "state") },
    }),
  ],
  root: "src/frontend",
  build: {
    outDir: "../../dist",
    emptyOutDir: true,
  },
});