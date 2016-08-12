/* eslint camelcase: 0, babel/new-cap: 0 */

const Rx = require('rxjs/Rx');
const superagent = require('superagent');
const {HmacSHA1} = require('crypto-js');
const {
	freeboxUrl,
	freeboxAppId,
	freeboxToken,
	serverUrl,
	serverContext,
	serverUsername,
	serverPassword
} = require('./conf');

let sessionToken = null;
let sessionDate = null;

exports.login = function login() {
	if (sessionToken === null && (sessionDate === null || sessionDate.getTime() + (60 * 60 * 100) < new Date().getTime())) {
		console.log('Login to', `${freeboxUrl}/api/v3/login/`);
		sessionDate = new Date();
		return superagent
			.get(`${freeboxUrl}/api/v3/login/`)
			.observe()
			.map(res => res.body.result.challenge)
			.do(challenge => console.log('Login with', challenge, freeboxToken))
			.flatMap(challenge => {
				return superagent
					.post(`${freeboxUrl}/api/v3/login/session/`)
					.send({
						app_id: freeboxAppId,
						password: HmacSHA1(challenge, freeboxToken).toString()
					});
			})
			.map(res => res.body.result.session_token)
			.do(token => {
				sessionToken = token;
				console.log('Token', token);
			});
	}

	console.log('Return session token');
	return Rx.Observable.of(sessionToken);
};

exports.upload = function upload(download_url) {
	return exports.login()
		.flatMap(sessionToken => {
			const relative = download_url.replace(serverUrl + serverContext, '');
			const directory = relative.substring(0, relative.lastIndexOf('/'));
			const download_dir = new Buffer(`/Disque dur/Téléchargements/${directory}`).toString('base64');
			console.log('Upload', download_url, 'to', directory);
			return superagent
				.post(`${freeboxUrl}/api/v3/downloads/add`)
				.set('X-Fbx-App-Auth', sessionToken)
				.type('form')
				.send({
					download_url,
					download_dir,
					username: serverUsername,
					password: serverPassword
				});
		})
		.do(res => console.log('Upload response', res.body));
};

exports.token = function token() {
	return superagent
		.get(`${freeboxUrl}/api/v3/login/authorize/`)
		.send({
			app_id: freeboxAppId,
			app_name: freeboxAppId,
			app_version: '1.0.0',
			device_name: 'Node'
		})
		.observe()
		.map(res => res.body);
};
