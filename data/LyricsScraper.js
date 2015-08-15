var EventEmitter = require('events').EventEmitter;
var RateLimiter = require('limiter').RateLimiter;
var assert = require('assert');
var async = require('async');
var cheerio = require('cheerio');
var util = require('util');

function LyricsScraper(requester) {
    EventEmitter.call(this);
    this.requester = requester;
}

util.inherits(LyricsScraper, EventEmitter);

LyricsScraper.prototype._parseSong = function(lyricsData) {
    var $ = cheerio.load(lyricsData.html, {decodeEntities: true});
    var artist = $('#main > h2').text().toLowerCase().replace(' lyrics', '');
    var songName = $('#h1head > h1').text()
        .replace(' lyrics', '')
        .replace(/"/g, '');
    var labelElem = $('#main > b')
        .filter(function() { return $(this).text().indexOf(songName) !== -1; })
        .first();

    var rawLyrics = '';
    var elem = $(labelElem.next());
    while (elem = $(elem.next())) {
	if (!elem || !elem.get(0)) {
	    break;
	}
        if (elem.get(0).tagName !== 'div') {
            continue;
        }
        rawLyrics = elem.text();
        break;
    }

    return {
        artist: artist,
        songName: songName,
        lyrics: this._cleanLyrics(rawLyrics),
        url: lyricsData.url,
    };
}

LyricsScraper.prototype._cleanLyrics = function(rawLyrics) {
    return rawLyrics.trim().replace(/\r?\n/, '\n')
}

LyricsScraper.prototype.enqueue = function(url) {
    this.requester.get(url, (function(err, html) {
            if (err) { throw err; }
            this.emit('song', this._parseSong({url: url, html: html}));
        }).bind(this));
}

module.exports = LyricsScraper;
