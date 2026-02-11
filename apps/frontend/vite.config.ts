import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import viteTsConfigPaths from "vite-tsconfig-paths";

const config = defineConfig({
  base: "/bomberos",
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
});

export default config;
