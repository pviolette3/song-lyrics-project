var ArtistScraper = require('./ArtistScraper');
var ArtistSongScraper = require('./ArtistSongScraper');
var JsonLyricsSaver = require('./JsonLyricsSaver');
var LyricsScraper = require('./LyricsScraper');
var RateLimiter = require('limiter').RateLimiter;
var newParallelCachingRequester = require('./Requesters').newParallelCachingRequester;
var os = require('os');

function main() {
    var songSaver = new JsonLyricsSaver('songs.json');
    var requester = newParallelCachingRequester(
        os.cpus().length + 1,
        './pages',
        new RateLimiter(1, 'second')
    );

    var artistPageScraper = new ArtistScraper(requester);
    var artistScraper = new ArtistSongScraper(requester);
    var lyricsScraper = new LyricsScraper(requester);

    'abcdefghijklmnopqrstuvwxyz'.split('').forEach(function(letter) {
        var url = [
            'http://web.archive.org/web/20141002174547/http://www.azlyrics.com/',
            letter,
            '.html'
        ].join('');

        artistPageScraper.enqueue(url);
    });

    artistPageScraper.on('artisturl', function(url) {
        artistScraper.enqueue(url);
    });

    artistScraper.on('songurl', function(url) {
        lyricsScraper.enqueue(url);
    });

    lyricsScraper.on('song', function(song) {
        songSaver.save(song);
    });
}

if (require.main === module) {
    main();
}
