import tailwindcss from "@tailwindcss/vite";
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
    plugins: [
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
    },
    ssr: {
      optimizeDeps: {
        include: [
          "@base-ui/react/popover",
          "@base-ui/react/dialog",
          "@base-ui/react/tooltip",
          "@base-ui/react/toolbar",
          "@base-ui/react/separator",
          "@base-ui/react/merge-props",
          "@base-ui/react/use-render",
          "@base-ui/react/select",
          "@base-ui/react/toggle",
          "@base-ui/react/form",
          "@base-ui/react/scroll-area",
          "@base-ui/react/toggle-group",
          "@base-ui/react/fieldset",
          "@base-ui/react/radio",
          "@base-ui/react/radio-group",
          "@base-ui/react/field",
          "@base-ui/react/progress",
          "@base-ui/react/toast",
          "@base-ui/react/preview-card",
          "@base-ui/react/tabs",
          "@base-ui/react/number-field",
          "@base-ui/react/combobox",
          "@base-ui/react/meter",
          "@base-ui/react/switch",
          "@base-ui/react/collapsible",
          "@base-ui/react/checkbox",
          "@base-ui/react/menu",
          "@base-ui/react/slider",
          "@base-ui/react/checkbox-group",
          "@base-ui/react/input",
          "@base-ui/react/alert-dialog",
          "@base-ui/react/accordion",
          "@base-ui/react/avatar",
          "@base-ui/react/autocomplete"
        ]
      }
    }
  };
});

export default config;
