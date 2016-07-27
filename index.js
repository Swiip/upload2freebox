const {watch} = require('./utils');
const {upload} = require('./freebox');
const {watchDirectory, serverUrl} = require('./conf');

watch()
	.do(path => console.log('Watched', path))
	.map(path => path.replace(watchDirectory, serverUrl))
	.do(url => console.log('Rewrite', url))
	.flatMap(url => upload(url))
	.subscribe(
		x => console.log(x),
		err => console.log('err', err),
		() => console.log('completed')
	);
