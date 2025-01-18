import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    tsconfigPaths({
      projects: ["./tsconfig.tests.json"], // For runtime
    }),
  ],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./vitest.setup.ts",
    typecheck: {
      tsconfig: "./tsconfig.tests.json", // For type-checking
    },
  },
  esbuild: {
    jsx: "automatic", // Ensure automatic JSX runtime
  },
});
