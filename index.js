const Rx = require('rxjs/Rx');
const {watch} = require('./utils');
const {login, upload} = require('./freebox');
const {watchDirectory, serverUrl, serverContext} = require('./conf');

const controller = new Rx.Subject();

const token = Rx.Observable.timer(0, 60 * 60 * 1000)
	.flatMap(() => login());

watch()
	.zip(controller, x => x)
	.do(path => console.log('Watched', path))
	.map(path => path.replace(watchDirectory, serverUrl + serverContext))
	.do(url => console.log('Rewrite', url))
	.combineLatest(token, (url, token) => ({url, token}))
	.distinctUntilChanged((a, b) => a.url === b.url)
	.flatMap(({url, token}) => upload(url, token))
	.do(() => controller.next())
	.subscribe(
		x => x,
		err => console.log('err', err),
		() => console.log('completed')
	);

controller.next();
