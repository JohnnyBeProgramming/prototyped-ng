/// <reference path="../imports.d.ts" />
/* -------------------------------------------------------------------------------
Example of a custom NodeWebkit builder
------------------------------------------------------------------------------- */
console.count(' - Building application...');
/*
var nodewebkit = require('nodewebkit');
var nwpath = nodewebkit.findpath();
console.log('  - We are now inside a NodeJS runtime!');
console.log('  - NodeJS-Webkit Path:');
console.log('  - ' + nwpath);
console.log('-------------------------------------------------------------------------------');
var NwBuilder = require('node-webkit-builder');
var nw = new NwBuilder({
appName: 'Node Webkit Client',
files: './web/*.*', // Use the glob format
winIco: './web/assets/favicon.ico',
buildType: 'versioned ',
buildDir: './bin/.nw',
cacheDir: './bin/.cache',
platforms: ['win'] // ['win', 'osx', 'linux32', 'linux64']
});
// Log stuff you want
nw.on('log',  console.log);
// Build returns a promise
nw.build().then(() => {
console.log(' - Build Done!');
}).catch((error) => {
console.warn(' - Build ERROR!');
console.error(error);
});
// And supports callbacks
nw.build(function(err) {
if(err) console.log(err);
});
*/
// -------------------------------------------------------------------------------------------------------
