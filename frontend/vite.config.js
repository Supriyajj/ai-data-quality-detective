import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:8000",
      "/ws": { target: "ws://localhost:8000", ws: true },
    },
  },
  // Force these to be pre-bundled at server start rather than discovered
  // lazily on first request. @react-three/drei in particular pulls in a
  // large dependency graph, and letting Vite discover it mid-request can
  // race with the browser's request for it, surfacing as a
  // "504 Outdated Optimize Dep" error on the very first page load.
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "three",
      "@react-three/fiber",
      "@react-three/drei",
      "recharts",
      "framer-motion",
    ],
  },
});
