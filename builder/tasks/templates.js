module.exports = {
    postCompile: function (cnt) {
        var regx = /(\$templateCache\.put\('[^']+',)([^"]+")([^"]+")([^\)]*)/gim;
        var match = regx.exec(cnt)
        while (match != null) {
            var repl = match[1] + '("' + match[3] + match[4] + ")['']().decompress()";
            cnt = cnt.substring(0, match.index) + repl + cnt.substring(match.index + match[0].length);
            match = regx.exec(cnt, match.index + repl.length);
        }
        cnt = cnt.replace(/(\s*\r?\n)/gim, '\r\n');
        return cnt;
    }
};