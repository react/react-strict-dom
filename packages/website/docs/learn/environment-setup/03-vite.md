---
slug: /learn/setup-vite
---

# Vite

<p className="text-xl">Learn how to configure Vite to use React Strict DOM.</p>

## About Vite

[Vite](https://vite.dev) is a build tool for web projects.

Follow the Vite instructions on how to [create a new project](https://vite.dev/guide/#scaffolding-your-first-vite-project). Then follow the steps in the [Installation](/learn/installation) guide to install React Strict DOM.

:::tip

Take a look at the working [example of Vite with React Strict DOM](https://github.com/facebook/react-strict-dom/tree/main/apps/vite-app) on GitHub.

:::

The configuration differs between Vite 8 and Vite 7 because `@vitejs/plugin-react@6` (the version paired with Vite 8) removed Babel support. Pick the section that matches your Vite major version. The [App files](#app-files) and [Server-Side Rendering](#server-side-rendering) sections at the end apply to both.

## Vite 8

On Vite 8, `@vitejs/plugin-react@6` handles JSX and Fast Refresh through [Oxc](https://oxc.rs/) and no longer runs Babel — its `babel` option is ignored. React Strict DOM's `babel-preset` rewrites `css.create` calls into static styles at build time, so the preset must run through [`vite-plugin-babel`](https://www.npmjs.com/package/vite-plugin-babel) instead.

If you skip this, `vite build` still succeeds because it does not render components, but a styled component throws `Unexpected 'stylex.create' call at runtime. Styles must be compiled by '@stylexjs/babel-plugin'.` the first time it renders.

Install `vite-plugin-babel`. Vite 8 resolves `tsconfig` paths natively, so `vite-tsconfig-paths` is no longer needed.

```
npm install vite-plugin-babel
```

### Babel configuration

```js title="babel.config.js"
const dev = process.env.NODE_ENV !== "production";

export default {
  parserOpts: {
    plugins: ["typescript", "jsx"],
  },
  presets: [
    [
      "react-strict-dom/babel-preset",
      {
        debug: dev,
        dev,
        rootDir: process.cwd(),
        platform: "web",
      },
    ],
  ],
};
```

### Vite configuration

```js title="vite.config.ts"
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

// vite-plugin-babel must apply react-strict-dom/babel-preset to your app
// source and to any node_modules package that ships React Strict DOM UI.
const babelInclude = [
  /[\\/]src[\\/]/,
  /[\\/]node_modules[\\/]<package-name>[\\/]/,
  /[\\/]node_modules[\\/]react-strict-dom[\\/]/,
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
    // Vite 8's dependency optimizer is Rolldown, not esbuild. Pass the
    // platform extensions through rolldownOptions.
    rolldownOptions: {
      resolve: { extensions: allExtensions },
    },
  },
}));
```

Notes:

- The `include` option is required. `vite-plugin-babel` combines `include` and `filter` with a logical AND, and its default `include` of `/\.jsx?$/` matches `.js` and `.jsx` but not `.ts` or `.tsx`. Without an explicit `include`, TypeScript source is never transformed and the preset never runs.
- List every `node_modules` package that ships UI built with React Strict DOM in `babelInclude`, alongside `react-strict-dom` itself.
- `resolve.extensions` lists web-only platform extensions first so web bundles package `*.web.tsx` files and ignore `*.native.tsx` files.

### PostCSS configuration

[PostCSS](https://postcss.org/) is enabled by default in Vite and is the recommended way to extract React Strict DOM styles to static CSS for web builds. `react-strict-dom/postcss-plugin` does the extraction. Create a `postcss.config.js` file as follows.

```js title="postcss.config.js"
import babelConfig from "./babel.config.js";

export default {
  plugins: {
    "react-strict-dom/postcss-plugin": {
      include: [
        // Include source files to watch for style changes.
        // Be specific and avoid a broad glob like "**/*.{js,jsx}", which can
        // cause major performance issues during build.
        "src/**/*.{js,jsx,mjs,ts,tsx}",
        // List any installed node_modules that include UI built with React Strict DOM.
        "node_modules/<package-name>/**/*.{js,mjs}",
      ],
      babelConfig,
      useLayers: true,
    },
  },
};
```

## Vite 7

On Vite 7, `@vitejs/plugin-react@5` still runs Babel, so the preset is applied through its `babel` option rather than through `vite-plugin-babel`'s `include`. Start from the [Vite 8](#vite-8) setup above and change the following:

- Install `vite-tsconfig-paths` as well:

  ```
  npm install vite-plugin-babel vite-tsconfig-paths
  ```

- The `vite.config.ts` plugins, `resolve`, and `optimizeDeps` differ:

  ```js title="vite.config.ts"
  import { defineConfig } from "vite";
  import tsConfigPaths from "vite-tsconfig-paths";
  import viteReact from "@vitejs/plugin-react";
  import viteBabel from "vite-plugin-babel";

  const webOnlyExtensions = [".web.js", ".web.jsx", ".web.ts", ".web.tsx"];

  export default defineConfig(() => ({
    plugins: [
      tsConfigPaths(),
      viteReact({
        // plugin-react@5 applies the preset to your source through Babel.
        babel: { configFile: true },
      }),
      // No include needed: viteReact handles source, and the default
      // include (/\.jsx?$/) covers node_modules that ship compiled UI.
      viteBabel(),
    ],
    resolve: {
      extensions: [
        ...webOnlyExtensions,
        ".mjs",
        ".js",
        ".mts",
        ".ts",
        ".jsx",
        ".tsx",
        ".json",
      ],
    },
  }));
  ```

  `tsConfigPaths()` replaces `resolve.tsconfigPaths`, and the esbuild-based optimizer needs no `optimizeDeps.rolldownOptions`.

The Babel and PostCSS configurations are the same as Vite 8.

## App files

Your app needs to include a CSS file that contains a `@react-strict-dom` directive. This acts as a placeholder that is replaced by the generated CSS during builds.

```css title="src/strict.css"
/* This directive is used by the react-strict-dom postcss plugin. */
/* It is automatically replaced with generated CSS during builds. */
@react-strict-dom;
```

Next, import the CSS file in the `main.tsx` file.

```js title="src/main.tsx"
// ...

// Required for CSS to work on Vite
import "./strict.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

## Server-Side Rendering

If you plan to use SSR with Vite you will need to add the following `ssr` options.

```js title="vite.config.ts"
import { defineConfig } from "vite";

//...

export default defineConfig(() => ({
  // ...
  ssr: {
    noExternal: ["react-strict-dom"],
  },
}));
```
