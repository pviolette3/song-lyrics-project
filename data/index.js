var ArtistSongScraper = require('./ArtistSongScraper');
var JsonLyricsSaver = require('./JsonLyricsSaver');
var LyricsScraper = require('./LyricsScraper');
var RateLimiter = require('limiter').RateLimiter;
var newParallelCachingRequester = require('./Requesters').newParallelCachingRequester;

function main() {
    var songSaver = new JsonLyricsSaver('songs.json');
    var requester = newParallelCachingRequester(
        3,
        './pages',
        new RateLimiter(3, 'second')
    );

    var artistScraper = new ArtistSongScraper(requester);
    var lyricsScraper = new LyricsScraper(requester);
    var artistUrls = [
        'http://www.azlyrics.com/t/taylorswift.html',
    ];

    artistUrls.forEach(function(url) {
        artistScraper.enqueue(url);
    });

    artistScraper.on('songurl', function(url) {
        lyricsScraper.enqueue(url);
    });

    lyricsScraper.on('song', function(song) {
        console.log(JSON.stringify(song));
    });
}

if (require.main === module) {
    main();
}