/* -------------------------------------------------------------------------------
    Example of a custom NodeWebkit builder
------------------------------------------------------------------------------- */
var nodewebkit = require('nodewebkit');
var nwpath = nodewebkit.findpath();

console.log('  - We are now inside a NodeJS runtime!');
console.log('  - NodeJS-Webkit Path:');
console.log('  - ' + nwpath);
console.log('-------------------------------------------------------------------------------');

var NwBuilder = require('node-webkit-builder');
var nw = new NwBuilder({
    appName: 'Node Webkit Client',
    files: './src/*.*', // Use the glob format
    winIco: './src/assets/favicon.ico',
    buildType: 'versioned ',
    buildDir: './bin/.nw',
    cacheDir: './bin/.cache',
    platforms: ['win','osx'] // ['win', 'osx', 'linux32', 'linux64']
});

// Log stuff you want
nw.on('log',  console.log);

// Build returns a promise
nw.build().then(function () {
   console.log(' - Done!');
}).catch(function (error) {
    console.error(error);
});

// And supports callbacks
/*
nw.build(function(err) {
    if(err) console.log(err);
});
*/

// -------------------------------------------------------------------------------------------------------