const {watch} = require('./utils');
const {upload} = require('./freebox');
const {watchDirectory, serverUrl} = require('./conf');

watch()
	.map(path => path.replace(watchDirectory, serverUrl))
	.flatMap(url => upload(url))
	.subscribe(
		x => console.log(x),
		err => console.log('err', err),
		() => console.log('completed')
	);
