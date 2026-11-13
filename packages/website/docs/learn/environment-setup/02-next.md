---
slug: /learn/setup-next
---

# Next.js

<p className="text-xl">Learn how to configure Next.js to use React Strict DOM.</p>

## About Next.js

[Next.js](https://nextjs.org) is a production-grade, full-stack, web-only React framework that is fully compatible with React Strict DOM. The instructions in the rest of this guide are tailored to Next.js, but can be adapted by readers to work with other frameworks.

Follow the Next.js instructions on how to [create a new project](https://nextjs.org/docs/app/getting-started/installation). Then follow the steps in the [Installation](/learn/installation) guide to install React Strict DOM.

:::tip

Take a look at the working [example of Next.js with React Strict DOM](https://github.com/facebook/react-strict-dom/tree/main/apps/nextjs-app) on GitHub.

:::

## Babel configuration

Babel is not the default compiler when using Next.js App Router, but it can still be used. Install `babel-loader`. Then create a `babelLoader.config.js` (not `babel.config.js`) file as follows. This is used to optimize builds and enables static extraction of CSS for web. Learn how to configure the [babel-preset](/api/babel-preset/) in the API docs.

```js title="babelLoader.config.js"
const dev = process.env.NODE_ENV !== 'production'

const config = {
  parserOpts: {
    plugins: ['typescript', 'jsx'],
  },
  presets: [
    [
      'react-strict-dom/babel-preset',
      {
        debug: dev,
        dev,
        platform: 'web',
        rootDir: process.cwd(),
      },
    ],
  ],
};

export default config;
```

## PostCSS configuration

[PostCSS](https://postcss.org/) is a tool for generating CSS. It's enabled by default in Next.js and it's the recommended way to extract React Strict DOM styles to static CSS for web builds. `react-strict-dom/postcss-plugin` can be used to extract styles. Create a `postcss.config.mjs` file as follows.

```js title="postcss.config.mjs"
// Be sure to share the babel configuration between Next.js and PostCS
import babelLoader from "./babelLoader.config.js";

const config = {
  plugins: {
    "react-strict-dom/postcss-plugin": {
      include: [
        // Include source files to watch for style changes
        // Be specific and avoid a non-specific glob like "**/*.{js,jsx}" which could cause major performance issues during build
        'src/**/*.{js,jsx,mjs,ts,tsx}',
        // List any installed node_modules that include UI built with React Strict DOM
        'node_modules/<package-name>/*.js'
      ],
      babelConfig: babelLoader,
      useCSSLayers: true,
    }
  },
};

export default config;
```

In development with Turbopack, the plugin keeps a cache of extracted styles in `node_modules/.cache/postcss-react-strict-dom`. With the cache, Turbopack's short-lived PostCSS workers do not transform all files again on each rebuild. Each dev server session has its own cache, so a restart of the dev server transforms all files again. If the generated CSS is out of date, for example after a change to values from `css.defineConsts` that other files use, restart the dev server. The plugin does not use the cache if `babelConfig` contains functions, because it cannot find changes to them.

## Next.js configuration

Create or edit the `next.config.js` file as follows. Note that below you will find config for both turbopack or webpack.

```js title="next.config.js"
import type { NextConfig } from "next";

import babelLoader from "./babelLoader.config.js";

function getBabelLoader() {
  return {
    loader: "babel-loader",
    options: babelLoader,
  };
}

const nextConfig: NextConfig = {
  transpilePackages: ["react-strict-dom"],

  turbopack: {
    rules: {
      "*.{js,jsx,ts,tsx}": {
        loaders: [getBabelLoader()],
      },
    },
  },

  webpack: (config, { webpack }) => {
    config.resolve.mainFields = ["module", "main"];
    config.module.rules.push({
      exclude: /node_modules(?!\/react-strict-dom)/,
      test: /\.(js|jsx|ts|tsx)$/,
      use: [getBabelLoader()],
    });
    return config;
  },
};

export default nextConfig;
```

## App files

Your app needs to include a CSS file that contains a `@react-strict-dom` directive. This acts as a placeholder that is replaced by the generated CSS during builds.

```css title="strict.css"
/* This directive is used by the react-strict-dom postcss plugin. */
/* It is automatically replaced with generated CSS during builds. */
@react-strict-dom;
```

Next, import the CSS file in the `layout.tsx` file.

```js title="src/app/layout.tsx"
// Required for CSS to work on Next.js
import './strict.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
```

## Platform-specific files

React Strict DOM relies on platform-specific extensions to create platform-specific implementations of components, hooks, etc. For example, web bundles should package `*.web.js` file extensions but not `*.native.js` files. Next.js can handle the presence of platform-specific extensions with a change in `next.config.js` with the following additions:

```js title="next.config.js"
const webOnlyExtensions = ['.web.js', '.web.jsx', '.web.ts', '.web.tsx'];

const nextConfig: NextConfig = {
  // ...
  turbopack: {
    // ...
    resolveExtensions: [ ...webOnlyExtensions, ".tsx", ".ts", ".jsx", ".js", ".mjs", ".json"],
  },
  webpack: (config, { webpack }) => {
    // ...
    config.resolve.extensions = [ ...webOnlyExtensions, ...config.resolve.extensions];
    return config;
  },
};

export default nextConfig;
```
