import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import viteTsConfigPaths from "vite-tsconfig-paths";

const config = defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  const tweakcnLivePreviewSrc =
    mode === "development" ? "https://tweakcn.com/live-preview.min.js" : "";

  return {
    base: env.VITE_BASE ?? "/bomberos",
    define: {
      __TWEAKCN_LIVE_PREVIEW_SRC__: JSON.stringify(tweakcnLivePreviewSrc)
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(moduleId) {
            if (!moduleId.includes("node_modules")) {
              return;
            }

            if (moduleId.includes("@tanstack")) {
              return "vendor-tanstack";
            }

            if (moduleId.includes("react")) {
              return "vendor-react";
            }

            return "vendor";
          }
        }
      }
    },
    plugins: [
      devtools(),
      tanstackStart(),
      viteTsConfigPaths({
        projects: ["./tsconfig.json"]
      }),
      tailwindcss(),
      viteReact({
        babel: {
          plugins: ["babel-plugin-react-compiler"]
        }
      })
    ],
    server: {
      allowedHosts: true
    }
  };
});

export default config;
