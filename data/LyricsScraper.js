var EventEmitter = require('events').EventEmitter;
var assert = require('assert');
var async = require('async');
var cheerio = require('cheerio');
var request = require('request');
var util = require('util');

function LyricsScraper() {
    EventEmitter.call(this);
    this.downloadQueue = async.queue(this._processTask.bind(this), 3);
}

util.inherits(LyricsScraper, EventEmitter);

LyricsScraper.prototype._processTask = function(task, callback) {
    var downloadThisSong =  this._downloadTrackPage.bind(
        this,
        task.url
    );

    async.retry(3, downloadThisSong, (function(err, songHtml) {
        if (err) { return callback(err, null); }
        callback(null, this._parseSongLyrics(songHtml));
    }).bind(this));
}

LyricsScraper.prototype._parseSongLyrics = function(lyricsHtml) {
    var $ = cheerio.load(lyricsHtml);
    var name = $('table h1', 'td.centerplane').map(function() {
        return $(this).text().replace(/\slyrics$/, '');
    }).get()[0];
    var artist = $('#thelist')
        .find('tr')
        .filter(function() {
            return /Artist/i.test($($(this).find('th')[0]).text());
        }).map(function() {
            return $(this).find('td a').text();
        }).get()[0];
    var lyrics = $('p.songtext').text();
    return {name: name, artist: artist, lyrics: lyrics};
}

LyricsScraper.prototype._downloadTrackPage = function(url, callback) {
    request.get(url, function(err, resp, body) {
        callback(err, body);
    });
}

LyricsScraper.prototype.enqueue = function(url) {
    this.downloadQueue.push({url: url}, (function(err, song) {
        this.emit('song', song);
    }).bind(this));
}

module.exports = LyricsScraper;