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
    return {};
}

LyricsScraper.prototype.enqueue = function(url) {
    this.requester.get(url, (function(err, html) {
            if (err) { throw err; }
            this.emit('song', this._parseSong({url: url, html: html}));
        }).bind(this));
}

module.exports = LyricsScraper;