var cheerio = require('cheerio');
var EventEmitter = require('events').EventEmitter;
var url = require('url');
var util = require('util');

function ArtistScraper(requester) {
    this.requester = requester;
}

util.inherits(ArtistScraper, EventEmitter);

ArtistScraper.prototype.enqueue = function(letterUrl) {
    this.requester.get(letterUrl, this._onLetterPage.bind(this, letterUrl));
}

ArtistScraper.prototype._onLetterPage = function(originalUrl, err, html) {
    if (err) { throw err; }
    var $ = cheerio.load(html, {parseEntities: true});
    var artistLinks = $('#inn > div.artists > a').map(function() {
        return $(this).attr('href');
    })
    .get()
    .map(url.resolve.bind(url, originalUrl))
    .forEach((function(url) {
        this.emit('artisturl', url);
    }).bind(this));
}

module.exports = ArtistScraper;