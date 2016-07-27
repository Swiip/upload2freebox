/* eslint camelcase: 0, babel/new-cap: 0 */

const superagent = require('superagent');
const {HmacSHA1} = require('crypto-js');
const {freeboxUrl, freeboxAppId, freeboxToken, serverUsername, serverPassword} = require('./conf');

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
				});
		})
		.map(res => res.body.result.session_token)
		.do(token => console.log('Token', token));
};

exports.upload = function upload(url) {
	console.log('Uploading', url);
	return exports.login()
		.flatMap(sessionToken => {
			console.log('Upload to', `${freeboxUrl}/api/v3/downloads/add`);
			return superagent
				.post(`${freeboxUrl}/api/v3/downloads/add`)
				.set('X-Fbx-App-Auth', sessionToken)
				.query({
					download_url: url,
					username: serverUsername,
					password: serverPassword
				});
		})
		.do(res => console.log('Upload response', res.body));
};

  // reqwest({
  //   url: config.freebox.url + '/api/v3/downloads/add',
  //   method: 'POST',
  //   headers: {
  //     'X-Fbx-App-Auth': sessionToken
  //   },
  //   data: {
  //     download_url: url,
  //     username: serverUsername,
  //     password: serverPassword
  //   }
  // }).then(function(response) {
  //   console.log('download response', response);
	//
  //   callback(response);
  // });

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
