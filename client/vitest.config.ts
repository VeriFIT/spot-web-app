import mdx from "@mdx-js/rollup";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  // Transform JSX with the automatic runtime, like the production build.
  oxc: { jsx: { runtime: "automatic" } },
  plugins: [mdx(), react()],
  test: {
    environment: "jsdom",
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
