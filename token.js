require('./utils');

const {token} = require('./freebox');

token().subscribe(
	x => console.log('next', x),
	err => console.log('err', err),
	() => console.log('completed')
);
