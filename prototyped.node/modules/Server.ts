/// <reference path="../imports.d.ts" />

/* -------------------------------------------------------------------------------
    Example of a custom HTTP Server
------------------------------------------------------------------------------- */
var http = require("http"),
    crypto = require('crypto'),
    url = require("url"),
    path = require("path"),
    fs = require("fs");

var httpServer: any = {
    host: 'localhost',
    port: process.argv[2] || 8008,
    path: './',
    mimes: {
        '.html': "text/html",
        '.css': "text/css",
        '.js': "text/javascript"
    },
    server: null,
    start: () => {
        try {
            console.log('-------------------------------------------------------------------------------');
            console.log(' - Starting HTTP Web server...');
            console.log('-------------------------------------------------------------------------------');

            httpServer.error = null;
            httpServer.baseUrl = "http://" + httpServer.host + ":" + httpServer.port + '/';

            // Start the http server on the specified port
            httpServer.server = http.createServer(httpServer.request)
            httpServer.server.listen(parseInt(httpServer.port, 10));
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
    stop: () => {
        console.log(' - Stopping HTTP server...');
        httpServer.server.stop(() => {
            console.log(' - Server Stopped.');
        });
    },
    request: (request, response) => {
        var uri = url.parse(request.url).pathname;
        var filename = path.join(httpServer.path, uri);

        console.log(' > ' + path.relative('\\', uri));

        // Redirect to proxy routers (if needed)
        if (/(.*)(debug!)/i.exec(request.url)) {
            response.writeHead(302, { 'Location': httpServer.baseUrl + '#/!debug!/' });
            response.end();
            return;
        } else if (/(.*)(test!)/i.exec(request.url)) {
            response.writeHead(302, { 'Location': httpServer.baseUrl + '#/!test!/' });
            response.end();
            return;
        } else {
            fs.exists(filename, (exists) => {
                if (!exists) {
                    // Default document path
                    filename = path.join(httpServer.path, httpServer.defaultDocument);
                }

                if (fs.statSync(filename).isDirectory()) {
                    filename = path.join(filename, httpServer.defaultDocument);
                }

                fs.readFile(filename, "binary", (err, file) => {
                    httpServer.respond(response, filename, err, file);
                });
            });
        }
    },
    respond: (response, filename, err, file) => {
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