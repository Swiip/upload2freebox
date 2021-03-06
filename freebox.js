/* eslint camelcase: 0, babel/new-cap: 0 */

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

exports.login = function login() {
	console.log('Login to', `${freeboxUrl}/api/v3/login/`);
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
				})
				.observe();
		})
		.map(res => res.body.result.session_token)
		.do(token => console.log('Token', token));
};

exports.upload = function upload(download_url, token) {
	const relative = download_url.replace(serverUrl + serverContext, '');
	const directory = relative.substring(0, relative.lastIndexOf('/'));
	const download_dir = new Buffer(`/Disque dur/Téléchargements/${directory}`).toString('base64');
	console.log('Upload', download_url, 'to', directory);
	return superagent
		.post(`${freeboxUrl}/api/v3/downloads/add`)
		.set('X-Fbx-App-Auth', token)
		.type('form')
		.send({
			download_url,
			download_dir,
			username: serverUsername,
			password: serverPassword
		})
		.observe()
		.do(res => console.log('Upload response', res.body));
};

exports.newAppToken = function newAppToken() {
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
