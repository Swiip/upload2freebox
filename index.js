const {watch} = require('./utils');
const {upload} = require('./freebox');
const {watchDirectory, serverUrl, serverContext} = require('./conf');

watch()
	.do(path => console.log('Watched', path))
	.map(path => path.replace(watchDirectory, serverUrl + serverContext))
	.do(url => console.log('Rewrite', url))
	.flatMap(url => upload(url))
	.subscribe(
		x => x,
		err => console.log('err', err),
		() => console.log('completed')
	);
