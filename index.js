const Rx = require('rxjs/Rx');
const {watch} = require('./utils');
const {login, upload} = require('./freebox');
const {watchDirectory, serverUrl, serverContext} = require('./conf');

const controller = new Rx.Subject();

const token = Rx.Observable.timer(0, 5 * 1000)
	.flatMap(() => login())
	.publish();

watch()
	.zip(controller, x => x)
	.do(path => console.log('Watched', path))
	.map(path => path.replace(watchDirectory, serverUrl + serverContext))
	.do(url => console.log('Rewrite', url))
	.withLatestFrom(token, (url, token) => ({url, token}))
	.flatMap(({url, token}) => upload(url, token))
	.do(() => controller.next())
	.subscribe(
		x => x,
		err => console.log('err', err),
		() => console.log('completed')
	);

token
	.take(1)
	.do(() => controller.next())
	.subscribe();

token.connect();
