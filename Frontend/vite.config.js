import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    sourcemap: false,
    cssMinify: true,
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom", "react-router-dom"],
        },
      },
    },
  },
  server: {
    host: "0.0.0.0",
    port: 5175,
    strictPort: true,
    watch: {
      usePolling: true,
      interval: 1000,
    },
    proxy: {
      "/api": {
        target: "http://127.0.0.1:5000",
        changeOrigin: true,
        configure(proxy) {
          proxy.on("error", (err, req, res) => {
            const url = req?.url || "/api";
            console.error(
              `[vite] API proxy error: ${req?.method || "GET"} ${url} → ${err.code || err.message}. Start the Express backend on http://127.0.0.1:5000 (from the repo root: npm run dev).`
            );
            if (res && !res.headersSent && typeof res.writeHead === "function") {
              res.writeHead(502, { "Content-Type": "application/json" });
              res.end(
                JSON.stringify({
                  message: "Can't reach the API server on port 5000. Start the backend and retry.",
                })
              );
            }
          });
        },
      },
    },
  },
});
