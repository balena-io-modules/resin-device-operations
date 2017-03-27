resin-device-operations
-----------------------

[![npm version](https://badge.fury.io/js/resin-device-operations.svg)](http://badge.fury.io/js/resin-device-operations)
[![dependencies](https://david-dm.org/resin-io-modules/resin-device-operations.png)](https://david-dm.org/resin-io-modules/resin-device-operations.png)
[![Build Status](https://travis-ci.org/resin-io-modules/resin-device-operations.svg?branch=master)](https://travis-ci.org/resin-io-modules/resin-device-operations)
[![Build status](https://ci.appveyor.com/api/projects/status/vob1fmf59evt6tr5/branch/master?svg=true)](https://ci.appveyor.com/project/resin-io/resin-device-operations/branch/master)

Join our online chat at [![Gitter chat](https://badges.gitter.im/resin-io/chat.png)](https://gitter.im/resin-io/chat)

Execute device spec operations.

Role
----

The intention of this module is to provide low level access to how Resin.io device specs configuration operations are executed.

**THIS MODULE IS LOW LEVEL AND IS NOT MEANT TO BE USED BY END USERS DIRECTLY**.

Installation
------------

Install `resin-device-operations` by running:

```sh
$ npm install --save resin-device-operations
```

Documentation
-------------

<a name="module_operations.execute"></a>

### operations.execute(image, operations, options) ⇒ <code>EventEmitter</code>
This function returns an `EventEmitter` object that emits the following events:

- `state (Object state)`: When an operation is going to be executed. The state object contains the `operation` and the progress `percentage` (0-100).
- `stdout (String data)`: When an operation prints to stdout.
- `stderr (String data)`: When an operation prints to stderr.
- `burn (String state)`: When the `burn` operation emits progress state.
- `error (Error error)`: When an error happens.
- `end`: When all the operations are completed successfully.

**Kind**: static method of <code>[operations](#module_operations)</code>  
**Summary**: Execute a set of operations over an image  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| image | <code>String</code> | path to image |
| operations | <code>Array.&lt;Object&gt;</code> | array of operations |
| options | <code>Object</code> | configuration options |

**Example**  
```js
execution = operations.execute 'foo/bar.img', [
	command: 'copy'
	from:
		partition:
			primary: 1
		path: '/bitstreams/parallella_e16_headless_gpiose_7010.bit.bin'
	to:
		partition:
			primary: 1
		path: '/parallella.bit.bin'
	when:
		coprocessorCore: '16'
		processorType: 'Z7010'
,
	command: 'copy'
	from:
		partition:
			primary: 1
		path: '/bistreams/parallella_e16_headless_gpiose_7020.bit.bin'
	to:
		partition:
			primary: 1
		path: '/parallella.bit.bin'
	when:
		coprocessorCore: '16'
		processorType: 'Z7020'
],
	coprocessorCore: '16'
	processorType: 'Z7010'

execution.on('stdout', process.stdout.write)
execution.on('stderr', process.stderr.write)

execution.on 'state', (state) ->
	console.log(state.operation.command)
	console.log(state.percentage)

execution.on 'error', (error) ->
	throw error

execution.on 'end', ->
	console.log('Finished all operations')
```

Support
-------

If you're having any problem, please [raise an issue](https://github.com/resin-io-modules/resin-device-operations/issues/new) on GitHub and the Resin.io team will be happy to help.

Tests
-----

Run the test suite by doing:

```sh
$ npm test
```

Contribute
----------

- Issue Tracker: [github.com/resin-io-modules/resin-device-operations/issues](https://github.com/resin-io-modules/resin-device-operations/issues)
- Source Code: [github.com/resin-io-modules/resin-device-operations](https://github.com/resin-io-modules/resin-device-operations)

Before submitting a PR, please make sure that you include tests, and that [coffeelint](http://www.coffeelint.org/) runs without any warning:

```sh
$ gulp lint
```

License
-------

The project is licensed under the Apache 2.0 license.
