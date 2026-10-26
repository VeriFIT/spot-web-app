import { defineConfig } from "vitest/config";

export default defineConfig({
  // Transform JSX with the automatic runtime, like the production build.
  oxc: { jsx: { runtime: "automatic" } },
  test: {
    environment: "jsdom",
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
