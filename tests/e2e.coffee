m = require('mochainon')
Promise = require('bluebird')
fse = Promise.promisifyAll(require('fs-extra'))
path = require('path')
imagefs = require('resin-image-fs')
wary = require('wary')
operations = require('../lib/operations')
utils = require('../lib/utils')

RASPBERRY_PI = path.join(__dirname, 'images', 'raspberrypi.img')
EDISON = path.join(__dirname, 'images', 'edison-config.img')
EDISON_ZIP = path.join(__dirname, 'images', 'edison')

FILES =
	'cmdline.txt': 'dwc_otg.lpm_enable=0 console=ttyAMA0,115200 kgdboc=ttyAMA0,115200 root=/dev/mmcblk0p2 rootfstype=ext4 rootwait \n'

extract = (stream) ->
	return new Promise (resolve, reject) ->
		result = ''
		stream.on('error', reject)
		stream.on 'data', (chunk) ->
			result += chunk
		stream.on 'end', ->
			resolve(result)

wary.it 'should be rejected if the command does not exist',
	raspberrypi: RASPBERRY_PI
, (images) ->
	configuration = operations.execute images.raspberrypi, [
		command: 'foobar'
	]

	promise = utils.waitStreamToClose(configuration)
	m.chai.expect(promise).to.be.rejectedWith('Unknown command: foobar')

wary.it 'should be able to copy a single file between raspberry pi partitions',
	raspberrypi: RASPBERRY_PI
, (images) ->
	configuration = operations.execute images.raspberrypi, [
		command: 'copy'
		from:
			partition:
				primary: 1
			path: '/cmdline.txt'
		to:
			partition:
				primary: 4
				logical: 1
			path: '/cmdline.txt'
	]

	utils.waitStreamToClose(configuration).then ->
		imagefs.read
			image: images.raspberrypi
			partition:
				primary: 4
				logical: 1
			path: '/cmdline.txt'
		.then(extract)
	.then (contents) ->
		m.chai.expect(contents).to.equal(FILES['cmdline.txt'])

wary.it 'should copy multiple files between raspberry pi partitions',
	raspberrypi: RASPBERRY_PI
, (images) ->
	configuration = operations.execute images.raspberrypi, [
		command: 'copy'
		from:
			partition:
				primary: 1
			path: '/cmdline.txt'
		to:
			partition:
				primary: 4
				logical: 1
			path: '/cmdline.txt'
	,
		command: 'copy'
		from:
			partition:
				primary: 4
				logical: 1
			path: '/cmdline.txt'
		to:
			partition:
				primary: 1
			path: '/cmdline.copy'
	]

	utils.waitStreamToClose(configuration).then ->
		imagefs.read
			image: images.raspberrypi
			partition:
				primary: 1
			path: '/cmdline.copy'
		.then(extract)
	.then (contents) ->
		m.chai.expect(contents).to.equal(FILES['cmdline.txt'])

wary.it 'should be able to replace a single file from a raspberry pi partition',
	raspberrypi: RASPBERRY_PI
, (images) ->
	configuration = operations.execute images.raspberrypi, [
		command: 'replace'
		file:
			partition:
				primary: 1
			path: '/cmdline.txt'
		find: 'lpm_enable=0'
		replace: 'lpm_enable=1'
	]

	utils.waitStreamToClose(configuration).then ->
		imagefs.read
			image: images.raspberrypi
			partition:
				primary: 1
			path: '/cmdline.txt'
		.then(extract)
	.then (contents) ->
		m.chai.expect(contents).to.equal('dwc_otg.lpm_enable=1 console=ttyAMA0,115200 kgdboc=ttyAMA0,115200 root=/dev/mmcblk0p2 rootfstype=ext4 rootwait \n')

wary.it 'should be able to perform multiple replaces in an raspberry pi partition',
	raspberrypi: RASPBERRY_PI
, (images) ->
	configuration = operations.execute images.raspberrypi, [
		command: 'replace'
		file:
			partition:
				primary: 1
			path: '/cmdline.txt'
		find: 'lpm_enable=0'
		replace: 'lpm_enable=1'
	,
		command: 'replace'
		file:
			partition:
				primary: 1
			path: '/cmdline.txt'
		find: 'lpm_enable=1'
		replace: 'lpm_enable=2'
	]

	utils.waitStreamToClose(configuration).then ->
		imagefs.read
			image: images.raspberrypi
			partition:
				primary: 1
			path: '/cmdline.txt'
		.then(extract)
	.then (contents) ->
		m.chai.expect(contents).to.equal('dwc_otg.lpm_enable=2 console=ttyAMA0,115200 kgdboc=ttyAMA0,115200 root=/dev/mmcblk0p2 rootfstype=ext4 rootwait \n')

wary.it 'should be able to completely replace a file from an edison partition',
	edison: EDISON
, (images) ->
	configuration = operations.execute images.edison, [
		command: 'replace'
		file:
			path: '/config.json'
		find: /^.*$/g
		replace: 'Replaced!'
	]

	utils.waitStreamToClose(configuration).then ->
		imagefs.read
			image: images.edison
			path: '/config.json'
		.then(extract)
	.then (contents) ->
		m.chai.expect(contents).to.equal('Replaced!')

wary.it 'should obey when properties',
	raspberrypi: RASPBERRY_PI
, (images) ->
	configuration = operations.execute images.raspberrypi, [
		command: 'replace'
		file:
			partition:
				primary: 1
			path: '/cmdline.txt'
		find: 'lpm_enable=0'
		replace: 'lpm_enable=1'
		when:
			lpm: 1
	,
		command: 'replace'
		file:
			partition:
				primary: 1
			path: '/cmdline.txt'
		find: 'lpm_enable=0'
		replace: 'lpm_enable=2'
		when:
			lpm: 2
	,
		command: 'replace'
		file:
			partition:
				primary: 1
			path: '/cmdline.txt'
		find: 'lpm_enable=0'
		replace: 'lpm_enable=3'
		when:
			lpm: 3
	],
		lpm: 2

	utils.waitStreamToClose(configuration).then ->
		imagefs.read
			image: images.raspberrypi
			partition:
				primary: 1
			path: '/cmdline.txt'
		.then(extract)
	.then (contents) ->
		m.chai.expect(contents).to.equal('dwc_otg.lpm_enable=2 console=ttyAMA0,115200 kgdboc=ttyAMA0,115200 root=/dev/mmcblk0p2 rootfstype=ext4 rootwait \n')

wary.it 'should emit state events for operations',
	raspberrypi: RASPBERRY_PI
, (images) ->
	configuration = operations.execute images.raspberrypi, [
		command: 'replace'
		file:
			partition:
				primary: 1
			path: '/cmdline.txt'
		find: 'lpm_enable=0'
		replace: 'lpm_enable=1'
	,
		command: 'replace'
		file:
			partition:
				primary: 1
			path: '/cmdline.txt'
		find: 'lpm_enable=1'
		replace: 'lpm_enable=2'
	,
		command: 'replace'
		file:
			partition:
				primary: 1
			path: '/cmdline.txt'
		find: 'lpm_enable=2'
		replace: 'lpm_enable=1'
	]

	stateSpy = m.sinon.spy()
	configuration.on('state', stateSpy)

	utils.waitStreamToClose(configuration).then ->
		m.chai.expect(stateSpy.firstCall.args[0]).to.deep.equal
			operation:
				command: 'replace'
				file:
					image: images.raspberrypi
					partition:
						primary: 1
					path: '/cmdline.txt'
				find: 'lpm_enable=0'
				replace: 'lpm_enable=1'
			percentage: 33.3

		m.chai.expect(stateSpy.secondCall.args[0]).to.deep.equal
			operation:
				command: 'replace'
				file:
					image: images.raspberrypi
					partition:
						primary: 1
					path: '/cmdline.txt'
				find: 'lpm_enable=1'
				replace: 'lpm_enable=2'
			percentage: 66.7

		m.chai.expect(stateSpy.thirdCall.args[0]).to.deep.equal
			operation:
				command: 'replace'
				file:
					image: images.raspberrypi
					partition:
						primary: 1
					path: '/cmdline.txt'
				find: 'lpm_enable=2'
				replace: 'lpm_enable=1'
			percentage: 100

wary.it 'should run a script with arguments that exits successfully', {}, ->
	configuration = operations.execute EDISON_ZIP, [
		command: 'run-script'
		script: 'echo.cmd'
		arguments: [ 'hello', 'world' ]
	]

	stdout = ''
	stderr = ''

	configuration.on 'stdout', (data) ->
		stdout += data

	configuration.on 'stderr', (data) ->
		stderr += data

	utils.waitStreamToClose(configuration).then ->
		m.chai.expect(stdout.replace(/\r/g, '')).to.equal('hello world\n')
		m.chai.expect(stderr).to.equal('')

wary.it 'should run a script that prints to stderr', {}, ->
	configuration = operations.execute EDISON_ZIP, [
		command: 'run-script'
		script: 'stderr.cmd'
	]

	stdout = ''
	stderr = ''

	configuration.on 'stdout', (data) ->
		stdout += data

	configuration.on 'stderr', (data) ->
		stderr += data

	utils.waitStreamToClose(configuration).then ->
		m.chai.expect(stdout).to.equal('')
		m.chai.expect(stderr.replace(/[\r\n]/g, '').trim()).to.equal('stderr output')

wary.it 'should be rejected if the script does not exist', {}, ->
	configuration = operations.execute EDISON_ZIP, [
		command: 'run-script'
		script: 'foobarbaz.cmd'
	]

	promise = utils.waitStreamToClose(configuration)
	m.chai.expect(promise).to.be.rejectedWith('ENOENT')

wary.it 'should be rejected if the script finishes with an error', {}, ->
	configuration = operations.execute EDISON_ZIP, [
		command: 'run-script'
		script: 'error.cmd'
	]

	promise = utils.waitStreamToClose(configuration)
	m.chai.expect(promise).to.be.rejectedWith('Exitted with error code: 1')

wary.run().catch (error) ->
	console.error(error.message)
	process.exit(1)
