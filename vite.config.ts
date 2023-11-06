/// <reference types="vitest" />
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    outDir: "vite-dist",
    target: "es6",
    lib: {
      entry: "src/index.ts",
      name: "Asset Loader",
      fileName: "index",
    },
  },
  test: {
    globals: true,
    environment: "happy-dom",
  },
});
