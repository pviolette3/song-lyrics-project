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
        new RateLimiter(2, 20 * 1000)
    );

    var artistScraper = new ArtistSongScraper(requester);
    var lyricsScraper = new LyricsScraper(requester);
    var artistUrls = [
        //'http://web.archive.org/web/20141102175756/http://www.azlyrics.com/t/taylorswift.html',
        'http://web.archive.org/web/20141106160059/http://www.azlyrics.com/w/west.html',
    ];

    artistUrls.forEach(function(url) {
        artistScraper.enqueue(url);
    });

    artistScraper.on('songurl', function(url) {
        console.log(url);
        lyricsScraper.enqueue(url);
    });

    lyricsScraper.on('song', function(song) {
        songSaver.save(song);
    });
}

if (require.main === module) {
    main();
}
