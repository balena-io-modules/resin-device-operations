# Change Log

All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

## [1.4.1] - 2017-04-14

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
