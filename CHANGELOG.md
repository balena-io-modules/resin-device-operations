# Change Log

All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

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

[1.2.5]: https://github.com/resin-io/resin-device-operations/compare/v1.2.4...v1.2.5
[1.2.4]: https://github.com/resin-io/resin-device-operations/compare/v1.2.3...v1.2.4
[1.2.3]: https://github.com/resin-io/resin-device-operations/compare/v1.2.2...v1.2.3
[1.2.2]: https://github.com/resin-io/resin-device-operations/compare/v1.2.1...v1.2.2
[1.2.1]: https://github.com/resin-io/resin-device-operations/compare/v1.2.0...v1.2.1
[1.2.0]: https://github.com/resin-io/resin-device-operations/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/resin-io/resin-device-operations/compare/v1.0.1...v1.1.0
[1.0.1]: https://github.com/resin-io/resin-device-operations/compare/v1.0.0...v1.0.1
