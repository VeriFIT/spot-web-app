import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    // The app is served under /app/, and the API URL helpers read
    // window.location, so give the tests a representative origin.
    environmentOptions: { jsdom: { url: "http://localhost:3000/app/" } },
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
