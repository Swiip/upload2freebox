const superagent = require('superagent');
const Rx = require('rxjs/Rx');
const chokidar = require('chokidar');
const {watchDirectory, watchIgnores} = require('./conf');

superagent.Request.prototype.observe = function () {
	return Rx.Observable.create(observer => {
		this.end((err, res) => {
			if (err) {
				observer.error(err);
			} else {
				observer.next(res);
			}
			observer.complete();
		});
	});
};

exports.watch = function watch() {
	return Rx.Observable.create(observer => {
		const ignored = [/[\/\\]\./];
		if (watchIgnores) {
			ignored.push(...watchIgnores.split(','));
		}
		console.log('Watching directory', watchDirectory, 'ignoring', ignored);
		chokidar.watch(watchDirectory, {ignored})
			.on('add', path => {
				observer.next(path);
			})
			.on('error', error => {
				observer.error(error);
			});
	});
};
