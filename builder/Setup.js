/// <reference path="./typings/node/node.d.ts" />

console.log('-------------------------------------------------------------------------------');
console.log(' Installing application...');
console.log('-------------------------------------------------------------------------------');
try 
{
	// Run the setup and intialise any dependencies
	var setup = require('../prototyped.node/modules/Setup.js');
	if (setup) {
	    setup.init();
	}
} catch(ex) {
	console.log('Error! ' + ex.message);
}
console.log('-------------------------------------------------------------------------------');
