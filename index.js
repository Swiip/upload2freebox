const Rx = require('rxjs/Rx');
const {watch} = require('./utils');
const {upload} = require('./freebox');
const {watchDirectory, serverUrl, serverContext} = require('./conf');

const controller = new Rx.Subject();

watch()
	.zip(controller, x => x)
	.do(path => console.log('Watched', path))
	.map(path => path.replace(watchDirectory, serverUrl + serverContext))
	.do(url => console.log('Rewrite', url))
	.flatMap(url => upload(url))
	.do(() => controller.next())
	.subscribe(
		x => x,
		err => console.log('err', err),
		() => console.log('completed')
	);

controller.next();
