# Change Log

All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

## [1.4.1] - 2017-04-14

## 4.0.0 - 2025-09-23


<details>
<summary> Update rindle to 3.0.0 [Thodoris Greasidis] </summary>

> ### rindle-3.0.0 - 2025-09-23
> 
> * Update jsdoc-to-markdown to v9 and regenerate the README [Thodoris Greasidis]
> * Drop the getStreamFromString method [Thodoris Greasidis]
> 
> ### rindle-2.0.0 - 2025-09-22
> 
> * Drop Bluebird in favor of native Promises [Thodoris Greasidis]
> * Drop support for callbacks in favor of Promises [Thodoris Greasidis]
> * Drop support for nodejs < 20 [Thodoris Greasidis]
> * Block the creation of package-lock.json [Thodoris Greasidis]
> * Replace balenaCI with flowzone [Thodoris Greasidis]
> * Drop no longer used hound, travis & appveyor ymls [Thodoris Greasidis]
> 
> ### rindle-1.3.6 - 2020-04-21
> 
> * Remove lodash dependency [Pagan Gazzard]
> 
> ### rindle-1.3.5 - 2020-04-20
> 
> * Update to gulp 4 [Pagan Gazzard]
> * Switch to balena-lint for linting [Pagan Gazzard]
> 
> ### rindle-1.3.4 - Invalid date
> 
> * Should import lodash methods independently to reduce bundle size [Thodoris Greasidis]
> 
> ### rindle-1.3.3 - Invalid date
> 
> * tests: Fix missing semicolon warning [Thodoris Greasidis]
> 
> ### rindle-1.3.2 - 2019-01-29
> 
> * travis: Drop 0.x node workers in favor of v6, 8, 10 [Thodoris Greasidis]
> * Change license to Apache 2.0 [Thodoris Greasidis]
> * Update bluebird and lodash to their latest versions [Pagan Gazzard]
> * Fix tests with the latest version of string-to-stream [Pagan Gazzard]
> 

</details>

* Fix execute().on() not allowing chaining when binding 'end' on an operation that has finished [Thodoris Greasidis]
* Switch to async await and drop Bluebird [Thodoris Greasidis]

<details>
<summary> Update balena-image-fs from 7.0.6 to 7.5.3 [Thodoris Greasidis] </summary>

> ### balena-image-fs-7.5.3 - 2025-04-09
> 
> * Update dependency mocha to v11 [balena-renovate[bot]]
> 
> ### balena-image-fs-7.5.2 - 2025-04-02
> 
> * Update dependency jsdoc-to-markdown to v9 [balena-renovate[bot]]
> 
> ### balena-image-fs-7.5.1 - 2025-03-26
> 
> * Update @balena/lint to v9 [Thodoris Greasidis]
> * Remove the no longer needed gpt detection helper [Thodoris Greasidis]
> * Update TypeScript to 5.8.2 [Thodoris Greasidis]
> * Drop the package-lock.json [Thodoris Greasidis]
> 
> ### balena-image-fs-7.5.0 - 2025-03-26
> 
> * Add function to find a partition by name/label [Ken Bannister]
> 
> ### balena-image-fs-7.4.1 - 2025-02-21
> 
> * bump ext2fs to 4.2.4 [Ryan Cooke]
> 
> ### balena-image-fs-7.4.0 - 2025-01-27
> 
> * Add getLabel() to retrieve filesystem label [Ken Bannister]
> 
> ### balena-image-fs-7.3.0 - 2025-01-06
> 
> * Drop Bluebird from devDependencies [Thodoris Greasidis]
> * flowzone: Remove empty with clause [Thodoris Greasidis]
> * Add the promises namespace as part of the exposed fs [Thodoris Greasidis]
> 
> ### balena-image-fs-7.2.2 - 2024-01-02
> 
> * Update dependency @types/node to v20 [Self-hosted Renovate Bot]
> 
> ### balena-image-fs-7.2.1 - 2023-12-19
> 
> * Remove repo config from flowzone.yml [Kyle Harding]
> 
> ### balena-image-fs-7.2.0 - 2023-01-20
> 
> * Add support for Node 18 [Akis Kesoglou]
> 
> ### balena-image-fs-7.1.2 - 2023-01-05
> 
> * Update dependencies [ab77]
> 
> ### balena-image-fs-7.1.1 - 2022-12-20
> 
> * Update dependency jsdoc-to-markdown to 8.0.0 [Renovate Bot]
> 
> ### balena-image-fs-7.1.0 - 2022-12-13
> 
> * update dependencies [Zane Hitchcox]
> 

</details>

* Convert to TypeScript and es module exports [Thodoris Greasidis]
* Switch target to es2018 [Thodoris Greasidis]
* Drop hound, travis & appveyor ymls [Thodoris Greasidis]

# v3.0.1
## (2025-09-22)

* Lint tests [Thodoris Greasidis]
* Convert tests to TypeScript [Thodoris Greasidis]

# v3.0.0
## (2025-06-06)

* Bump etcher-sdk to v10.0.0 [Otavio Jacobi]
* Drop support to node 18 [Otavio Jacobi]

# v2.0.0
## (2024-04-09)

* Replace etcher-image-write & drivelist with etcher-sdk [Thodoris Greasidis]
* Drop support for node < 18 [Thodoris Greasidis]
* Replace balenaCI with flowzone [Thodoris Greasidis]

# v1.7.0
## (2021-02-24)

* package.json: Run npm audit fix --force [Marios Balamatsias]
* Replace resin-image-fs methods with balena-image-fs interact [Marios Balamatsias]
* Replace resin-image-fs with balena-image-fs [Marios Balamatsias]

## 1.6.0 - 2020-03-03

* Update dependencies [Pagan Gazzard]

## 1.5.0 - 2020-02-28

* Update resin-image-fs to ^5.0.8 [Alexis Svinartchouk]
* Update gulp to ^4 [Alexis Svinartchouk]

## 1.4.2 - 2019-01-10

* Update drivelist to ^6.4.4 [Alexis Svinartchouk]

### Fixed

- Added support for node v4

## [1.4.0] - 2017-03-28

### Changed

- Updated dependencies to use the fixes from `etcher-image-write`.

## [1.3.1] - 2015-12-04

### Changed

- Omit tests in NPM.

## [1.3.0] - 2015-10-12

### Changed

- Set an `os` option by default.

## [1.2.6] - 2015-09-09

### Changed

- Chdir to script dirname before running a script.
- Inherit stdin for interactive scripts.

## [1.2.5] - 2015-09-08

### Changed

- Defensively ensure execution permissions in scripts.

## [1.2.4] - 2015-09-07

### Changed

- Upgrade `resin-image-write` to v2.0.1.

## [1.2.3] - 2015-08-25

### Changed

- Fix missing options duplicates issue.

## [1.2.2] - 2015-08-24

### Changed

- Upgrade `resin-image-write` to v2.0.0.

## [1.2.1] - 2015-08-24

### Changed

- Add `length` property to readable stream in burn command.
- Fix missed first `state` event after a slight delay.

## [1.2.0] - 2015-08-20

### Added

- Implement `burn` command.

## [1.1.0] - 2015-08-10

### Changed

- Validate that all required options for `when` properties are passed, and complain with an error otherwise.

## [1.0.1] - 2015-08-10

### Added

- Emit `stdout`/`stderr` events for `run-script` commands instead of printing directly.

[1.4.1]: https://github.com/resin-io-modules/resin-device-operations/compare/v1.4.0...v1.4.1
[1.4.0]: https://github.com/resin-io-modules/resin-device-operations/compare/v1.3.1...v1.4.0
[1.3.1]: https://github.com/resin-io-modules/resin-device-operations/compare/v1.3.0...v1.3.1
[1.3.0]: https://github.com/resin-io-modules/resin-device-operations/compare/v1.2.6...v1.3.0
[1.2.6]: https://github.com/resin-io-modules/resin-device-operations/compare/v1.2.5...v1.2.6
[1.2.5]: https://github.com/resin-io-modules/resin-device-operations/compare/v1.2.4...v1.2.5
[1.2.4]: https://github.com/resin-io-modules/resin-device-operations/compare/v1.2.3...v1.2.4
[1.2.3]: https://github.com/resin-io-modules/resin-device-operations/compare/v1.2.2...v1.2.3
[1.2.2]: https://github.com/resin-io-modules/resin-device-operations/compare/v1.2.1...v1.2.2
[1.2.1]: https://github.com/resin-io-modules/resin-device-operations/compare/v1.2.0...v1.2.1
[1.2.0]: https://github.com/resin-io-modules/resin-device-operations/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/resin-io-modules/resin-device-operations/compare/v1.0.1...v1.1.0
[1.0.1]: https://github.com/resin-io-modules/resin-device-operations/compare/v1.0.0...v1.0.1
