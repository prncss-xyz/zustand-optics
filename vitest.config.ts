import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      include: ["lib/**"],
      reporter: ["text", "json", "clover", "lcov"],
    },
    globals: true,
    environment: "jsdom",
  },
});
