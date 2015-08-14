var EventEmitter = require('events').EventEmitter;
var async = require('async');
var cheerio = require('cheerio');
var request = require('request');
var urljoin = require('url-join');
var util = require('util');

function ArtistSongScraper(artist) {
    EventEmitter.call(this);
    this.artist = artist;
    this.downloadQueue = async.queue(this._processTask.bind(this), 3);
}

util.inherits(ArtistSongScraper, EventEmitter);

ArtistSongScraper.prototype._processTask = function(task, callback) {    
    async.retry(
        3,
        this._downloadArtistPage.bind(this),
        (function(err, html) {
            if (err) { return callback(err, null); }
            callback(null, this._parseArtistSongUrls(html));
        }).bind(this)
    );
}

ArtistSongScraper.prototype._parseArtistSongUrls = function (html) {
    var $ = cheerio.load(html, {decodeEntities: true});
    var songUrls = $('#thelist tr').map(function(index, elem) {
        return $(this)
            .find('a')
            .filter(function(index) {
                return /song/.test($(this).attr('href'));
            })
            .attr('href');
    }).get()
      .map(function(link) {
        return urljoin('http://www.mldb.org', link);
      });
    return songUrls;
}

ArtistSongScraper.prototype._downloadArtistPage = function(callback) {
    var ARTIST_QUERY_URL = 'http://www.mldb.org/search-bf?mqa=' +
        encodeURIComponent(this.artist.toLowerCase()) +
        '&mqt=&mql=&mqy=&ob=1&mm=0';
    request.get(ARTIST_QUERY_URL, function(err, response, body) {
        callback(err, body);
    });
}

ArtistSongScraper.prototype.enqueue = function(page) {
    this.downloadQueue.push({page: page || 0}, (function(err, songUrls) {
        if (err) { throw err; }
        for (var i = 0; i < songUrls.length; i++) {
            this.emit('songurl', {url: songUrls[i]});
        }
    }).bind(this));
}

module.exports = ArtistSongScraper;