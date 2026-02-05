import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },

  root: path.resolve(import.meta.dirname, "client"),

  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },

  server: {
    host: "0.0.0.0",
    port: 5173,
    hmr: {
      protocol: "wss",           // Replit uses secure WS
      clientPort: 443,           // External Replit port
      host: "0.0.0.0",
      overlay: false,            // Turn off error popups that can trigger reloads
    },
    proxy: {
      "/api": {
        target: "http://0.0.0.0:5000",  // your backend Express port
        changeOrigin: true,
        secure: false,
      },
    },
    watch: {
      usePolling: true,          // ← important: use polling instead of fs events (Replit filesystem watching is flaky)
      interval: 1000,
    },
  },
});