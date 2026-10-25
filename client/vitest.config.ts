import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    // The app is served under /app/, and the API URL helpers read
    // window.location, so give the tests a representative origin.
    environmentOptions: { jsdom: { url: "http://localhost:3000/app/" } },
    // Vite does not load .env.production in test mode; provide the same values
    // so components under test build their API URLs like the real app.
    env: { VITE_API_PORT: "", VITE_API_ENDPOINT: "/api/" },
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
