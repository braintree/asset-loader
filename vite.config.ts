/// <reference types="vitest" />
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

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
  plugins: [dts()],
  test: {
    globals: true,
    environment: "happy-dom",
  },
});
