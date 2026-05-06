import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import type { IncomingMessage, ServerResponse } from "http";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  // Default dev proxy target points to deployed API, not localhost.
  // Override with VITE_API_PROXY_TARGET if you intentionally run backend locally.
  const apiProxyTarget =
    env.VITE_API_PROXY_TARGET || "https://sophix-backend-1.onrender.com";

  return {
  // CRM is hosted at domain root on Render static hosting.
  // Keep this fixed to "/" to avoid /admin/assets MIME/404 issues.
  base: "/",
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
    proxy: {
      "/api": {
        target: apiProxyTarget,
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on("error", (err: NodeJS.ErrnoException, _req: IncomingMessage, res: ServerResponse | import("socket").Socket) => {
            if (!res || typeof (res as ServerResponse).writeHead !== "function" || (res as ServerResponse).headersSent) {
              return;
            }
            const r = res as ServerResponse;
            r.writeHead(502, { "Content-Type": "application/json" });
            r.end(
              JSON.stringify({
                error: "Cannot reach Sophix API",
                details: `Proxy target ${apiProxyTarget} failed (${err.code || err.message}). Start sophix-backend on port 5000, or set VITE_API_PROXY_TARGET in admin-side/.env.development if the API listens elsewhere. Remove a wrong VITE_API_URL for local Vite.`,
              })
            );
          });
        },
      },
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
};
});
