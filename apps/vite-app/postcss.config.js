import babelConfig from './babel.config.cjs';

export default {
  plugins: {
    'react-strict-dom/postcss-plugin': {
      include: [
        'src/**/*.{js,jsx,mjs,ts,tsx}',
        '../../node_modules/example-ui/**/*.{js,jsx,mjs}'
      ],
      babelConfig,
      useLayers: true
    },
    autoprefixer: {}
  }
};
