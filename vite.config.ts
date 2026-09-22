import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    // @truconsent/consent-notice is installed from the npm registry (not a
    // local `file:` link) — excluded from pre-bundling as a defensive
    // leftover from when this was linked to ../truKIT-NPM for local SDK
    // development; harmless to keep, but no longer load-bearing.
    exclude: ["@truconsent/consent-notice"],
  },
}));
