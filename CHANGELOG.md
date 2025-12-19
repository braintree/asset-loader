# CHANGELOG

## UNRELEASED

- Update dependencies
  - @types/jest to 30.0.0
  - @types/promise-polyfill to 6.0.6
  - eslint to 8.57.1
  - eslint-config-braintree to 6.0.1
  - eslint-plugin-prettier to 5.5.4
  - jest to 30.2.0
  - jest-environment-jsdom to 30.2.0
  - prettier to 3.7.4
  - ts-jest to 29.4.6
  - typescript to 5.9.3
- Update Node to v24
- Update tests, types, and jest config

## 2.0.3

- Add ability to set script `integrity` attribute

## 2.0.2

- Updates dev dependencies

## 2.0.1

- Updates braces to 3.0.3
- Updates was to 8.17.1

## 2.0.0

- Remove promise polyfill

## 1.0.1

- Dependabot Updates

## 1.0.0-beta.1

- BREAKING CHANGES
  - Update Node to v18

- DevDependency Updates
  - Prettier to v3
  - eslint-plugin-prettier to v5
  - Typescript to v5

## 0.4.4

- Fix issue where server side rendering would not work with sdk

## 0.4.3

- Remove use of `export default` in promise lib

## 0.4.2

- Remove use of `export default` in module

## 0.4.1

- Fix paths when publishing

## 0.4.0

- Add typescript types

## 0.3.1

- Fix issue where crossorigin would not be set

## 0.3.0

- Add ability to set crossorigin attribute

## 0.2.1

- Set `loadScript` to cache the promise used to load the script to eliiminate a race condition where the script could be on the page, but not ready to use

## 0.2.0

- Add ability to force reload a script tag if it already exists on the page

## 0.1.0

- Initial version
