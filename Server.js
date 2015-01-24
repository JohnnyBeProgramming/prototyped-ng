/* -------------------------------------------------------------------------------
    Example of a custom HTTP Server
------------------------------------------------------------------------------- */
var http = require("http"),
    crypto = require('crypto'),
    url = require("url"),
    path = require("path"),
    fs = require("fs");

var httpServer = {
    host: 'localhost',
    port: process.argv[2] || 8008,
    path: './',
    mimes: {
        '.html': "text/html",
        '.css': "text/css",
        '.js': "text/javascript"
    },
    start: function () {
        try {
            console.log('-------------------------------------------------------------------------------');
            console.log(' - Starting HTTP Web server...');
            console.log('-------------------------------------------------------------------------------');

            httpServer.error = null;
            httpServer.baseUrl = "http://" + httpServer.host + ":" + httpServer.port + '/';

            // Start the http server on the specified port
            http.createServer(httpServer.request).listen(parseInt(httpServer.port, 10));
            console.log(' - Static HTTP server running.');

            if (httpServer.pfxPath) {
                // Create secure connection
                var cert = fs.readFileSync(httpServer.pfxPath);
                var opts = crypto.createCredentials({
                    pfx: cert,
                });
                http.setSecure(cert);
                console.log(' - Secure HTTPS server activated.');
            }

            console.log(' - ' + httpServer.baseUrl);
            console.log('-------------------------------------------------------------------------------');
        } catch (ex) {
            httpServer.lastError = ex;
            return false;
        }
        return true;
    },
    request: function (request, response) {
        var uri = url.parse(request.url).pathname;
        var filename = path.join(httpServer.path, uri);

        console.log(' > ' + path.relative('\\', uri));

        fs.exists(filename, function (exists) {

            if (!exists) {
                response.writeHead(404, { "Content-Type": "text/plain" });
                response.write("404 Not Found\n");
                response.end();
                return;
            }

            if (fs.statSync(filename).isDirectory()) {
                filename = path.join(filename, httpServer.defaultDocument);
            }

            fs.readFile(filename, "binary", function (err, file) {
                httpServer.respond(response, filename, err, file);
            });
        });
    },
    respond: function (response, filename, err, file) {
        if (err) {
            response.writeHead(500, { "Content-Type": "text/plain" });
            response.write(err + "\n");
            response.end();
            return;
        }

        console.log(' < ' + path.relative(httpServer.path, filename));

        var headers = {};
        var ext = path.extname(filename);
        var contentType = httpServer.mimes[ext];
        if (contentType) headers["Content-Type"] = contentType;

        response.writeHead(200, headers);
        response.write(file, "binary");
        response.end();
    },
    defaultDocument: 'index.html',
};
// -------------------------------------------------------------------------------------------------------

module.exports = httpServer;