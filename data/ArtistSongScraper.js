var EventEmitter = require('events').EventEmitter;
var async = require('async');
var cheerio = require('cheerio');
var request = require('request');
var url = require('url');
var util = require('util');

function ArtistSongScraper(requester) {
    EventEmitter.call(this);
    this.requester = requester;
}

util.inherits(ArtistSongScraper, EventEmitter);

ArtistSongScraper.prototype.enqueue = function(artistUrl) {
    this.requester.get(artistUrl, (function(err, html) {
        if (err) { throw err; }
        this._parseArtistSongLinks(html)
            .forEach((function(link) {
                this.emit('songurl', url.resolve(artistUrl, link));
            }).bind(this));
    }).bind(this));
}

ArtistSongScraper.prototype._parseArtistSongLinks = function (html) {
    var $ = cheerio.load(html);
    var songUrls = $('#listAlbum a')
        .map(function() {
            return $(this).attr('href');
        })
        .get()
        .filter(function(link) {
            return /\.\./.test(link);
        });
    return songUrls;
}

module.exports = ArtistSongScraper;