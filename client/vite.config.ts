import mdx from "@mdx-js/rollup";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [mdx(), react()],
  base: "/app/",
  build: {
    outDir: "build",
    emptyOutDir: true,
    rolldownOptions: {
      output: {
        // React and MUI are large, versioned as a block and needed by every
        // view, so they get their own chunks: each stays under the 500 kB
        // warning limit and a dependency bump no longer invalidates the app
        // code cached next to it.
        codeSplitting: {
          groups: [
            {
              name: "react",
              test: /node_modules[\\/](react|react-dom|react-router|scheduler)[\\/]/,
            },
            { name: "mui", test: /node_modules[\\/](@mui|@emotion)[\\/]/ },
          ],
        },
      },
    },
  },
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
});
