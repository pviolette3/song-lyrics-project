var fs = require('fs');

function JsonLyricsSaver(outputFileName) {
    this.outputFileName = outputFileName;
}

JsonLyricsSaver.prototype.save = function(song) {
    fs.appendFile(this.outputFileName, JSON.stringify(song) + '\n', function(err) {
        if (err) {
            throw err;
        }
    });
}

module.exports = JsonLyricsSaver;