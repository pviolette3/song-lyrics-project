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
    var rawLyrics = $('#main > b')
        .filter(function() { return $(this).text().indexOf(songName) !== -1; })
        .first()
        .next().next().next()
        .text();
    return {artist: artist, songName: songName, lyrics: this._cleanLyrics(rawLyrics)};
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