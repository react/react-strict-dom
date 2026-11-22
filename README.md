# react-strict-dom dev

[![Action status](https://github.com/react/react-strict-dom/actions/workflows/tests.yml/badge.svg)](https://github.com/react/react-strict-dom/actions/workflows/tests.yml)

Development monorepo for "React Strict DOM".

**React Strict DOM** (RSD) standardizes the development of styled React components for web and native. The goal of RSD is to improve the speed and efficiency of React development without compromising on performance, reliability, or quality. Building with RSD is helping teams at Meta ship features faster, to more platforms, with fewer engineers.

## Structure

* `.github`
  * Contains workflows used by GitHub Actions.
  * Contains issue templates.
* `apps`
  * Example applications using React Strict DOM.
  * [example-ui](https://github.com/react/react-strict-dom/blob/main/apps/example-ui)
  * [expo-app](https://github.com/react/react-strict-dom/tree/main/apps/expo-app)
  * [nextjs-app](https://github.com/react/react-strict-dom/blob/main/apps/nextjs-app)
  * [vite-app](https://github.com/react/react-strict-dom/blob/main/apps/vite-app)
  * [platform-tests](https://github.com/react/react-strict-dom/blob/main/apps/platform-tests)
* `packages`
  * Contains the individual packages managed in the monorepo.
  * [benchmarks](https://github.com/react/react-strict-dom/blob/main/packages/benchmarks)
  * [postcss-react-strict-dom](https://github.com/react/react-strict-dom/blob/main/packages/postcss-react-strict-dom)
  * [react-strict-dom](https://github.com/react/react-strict-dom/blob/main/packages/react-strict-dom) ([docs](https://react.github.io/react-strict-dom/))
  * [scripts](https://github.com/react/react-strict-dom/blob/main/packages/scripts)
  * [website](https://github.com/react/react-strict-dom/blob/main/packages/website)
* `tools`
  * Tools used by the monorepo (pre-commit tasks, etc.)

## Contributing

Learn more about [how to contribute](https://react.github.io/react-strict-dom/contribute/).

## Code of conduct

This project expects all participants to adhere to Meta's OSS [Code of Conduct](https://opensource.fb.com/code-of-conduct/). Please read the full text so that you can understand what actions will and will not be tolerated.

## License

React Strict DOM is [MIT licensed](./LICENSE).
