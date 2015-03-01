/// <reference path="./typings/node/node.d.ts" />

console.log('-------------------------------------------------------------------------------');
console.log(' Installing application...');
console.log('-------------------------------------------------------------------------------');

// Run the setup and intialise any dependencies
var setup = require('./prototyped.node/modules/Setup.js');
if (setup) {
    setup.init();
}

console.log('-------------------------------------------------------------------------------');
