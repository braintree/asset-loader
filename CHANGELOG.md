# CHANGELOG

## UNRELEASED

- Modify error handling for loading scripts:
  - a later call after an `error` or `abort` starts a fresh load
  - failed script tags are removed from the container on `error`
- `forceScriptReload` no longer changes the cache key
  - previously, a forced call skipped cache read, resulting in a new cache entry. this meant if the first tag failed, it was cached forever, and attempting to force reload would not reload the script
  - now, the key removes `forceScriptReload`, so both calls use the same key, and a caller that forces a reload gets a new script load
- Add an optional `timeout` option (milliseconds) to `loadScript` for loads that never finish
  - when it expires, the promise rejects with an `AssetLoadError` whose `failureKind` is `"timeout"`, and the next call with the same options starts a new load
  - `AssetLoadFailureKind` now includes `"timeout"`, so TypeScript code that switches over every value needs a new case
  - a timed-out tag can't be cancelled and stays on the page, so a retry after a slow load may run the script twice

## 2.1.0 (2026-08-19)

- feat(deps): Add [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/) to the repo
- `loadScript` now rejects with an `AssetLoadError`, which has `src` (the file the failed to load), the `failureKind` (`"error"` or `"abort"`), the `timing` in milliseconds, and `navigator.onLine`.
- Export the `AssetLoadError` and `AssetLoadFailureKind` types from the package root.

## 2.0.4

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

- Set `loadScript` to cache the promise used to load the script to eliminate a race condition where the script could be on the page, but not ready to use

## 0.2.0

- Add ability to force reload a script tag if it already exists on the page

## 0.1.0

- Initial version
