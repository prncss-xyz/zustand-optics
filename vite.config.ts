import { defineConfig } from "vite";
import { resolve } from "path";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), dts({ include: ["lib"] })],
  build: {
    copyPublicDir: false,
    sourcemap: true,
    emptyOutDir: true,
    lib: {
      entry: resolve(__dirname, "lib/main.ts"),
      fileName: "main",
      name: "optics-ts",
    },
    rollupOptions: {
      external: ["react", "zustand", "optics-ts"],
      output: {
        globals: {
          react: "React",
          zustand: "Zustand",
          "optics-ts": "OpticsTs",
        },
      },
    },
  },
});
