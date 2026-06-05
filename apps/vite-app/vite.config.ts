import { defineConfig } from "vite";
import viteReact from "@vitejs/plugin-react";
import viteBabel from "vite-plugin-babel";

const webOnlyExtensions = [".web.js", ".web.jsx", ".web.ts", ".web.tsx"];
const allExtensions = [
  ...webOnlyExtensions,
  ".mjs",
  ".js",
  ".mts",
  ".ts",
  ".jsx",
  ".tsx",
  ".json",
];

// On Vite 8, @vitejs/plugin-react@6 no longer runs Babel, so vite-plugin-babel
// must apply react-strict-dom/babel-preset to app source and to any package
// that ships React Strict DOM UI (here, example-ui).
const babelInclude = [
  /[\\/]src[\\/]/,
  /[\\/]example-ui[\\/]/,
  /[\\/]react-strict-dom[\\/]/,
];

export default defineConfig(() => ({
  plugins: [
    viteReact(),
    viteBabel({
      include: babelInclude,
      filter: /\.[cm]?[jt]sx?$/,
    }),
  ],
  resolve: {
    // Native in Vite 8 — replaces the vite-tsconfig-paths plugin.
    tsconfigPaths: true,
    extensions: allExtensions,
  },
  optimizeDeps: {
    // Vite 8's dependency optimizer is Rolldown, not esbuild.
    rolldownOptions: {
      resolve: { extensions: allExtensions },
    },
  },
}));
