import { defineConfig } from "vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import viteTsConfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import { nitro } from "nitro/vite";
import UnpluginFonts from "unplugin-fonts/vite";

const config = defineConfig({
  base: "/bomberos",
  plugins: [
    devtools(),
    nitro(),
    viteTsConfigPaths({
      projects: ["./tsconfig.json"]
    }),
    tailwindcss(),
    tanstackStart(),
    viteReact({
      babel: {
        plugins: ["babel-plugin-react-compiler"]
      }
    }),
    UnpluginFonts({
      google: {
        families: [
          "Geist:wght@400;500;600;700",
          "Geist+Mono:wght@400;500;600;700",
          "Bricolage Grotesque:wght@400;500;600;700"
        ]
      }
    })
  ]
});

export default config;
