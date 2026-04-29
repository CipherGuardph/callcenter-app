import { defineConfig } from "vite";

export default defineConfig({
  build: {
    minify: false,
    sourcemap: false,
    target: "es2020",
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/firebase")) return "firebase";
          if (id.includes("node_modules/react")) return "react";
        }
      }
    }
  },
  esbuild: {
    jsx: "automatic"
  }
});
