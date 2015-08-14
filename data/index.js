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
        'http://web.archive.org/web/20141008062442/http://www.azlyrics.com/a/abba.html',
        'http://web.archive.org/web/20141006160844/http://www.azlyrics.com/b/bbking.html',
        'http://web.archive.org/web/20141106160059/http://www.azlyrics.com/w/west.html',
        'http://web.archive.org/web/20141012205637/http://www.azlyrics.com/b/beatles.html',
        'http://web.archive.org/web/20141016134755/http://www.azlyrics.com/b/boston.html',
        'http://web.archive.org/web/20140927182929/http://www.azlyrics.com/k/knaan.html',
        'http://web.archive.org/web/20141009072228/http://www.azlyrics.com/o/owlcity.html',
        'http://web.archive.org/web/20140928080027/http://www.azlyrics.com/l/lilwayne.html',
        'http://web.archive.org/web/20140930102317/http://www.azlyrics.com/q/queen.html',
        'http://web.archive.org/web/20141009234254/http://www.azlyrics.com/s/sleepingwithsirens.html',
        'http://web.archive.org/web/20141004220017/http://www.azlyrics.com/w/walkthemoon.html',
        'http://web.archive.org/web/20140922033728/http://www.azlyrics.com/t/tobymac.html',
        'http://web.archive.org/web/20140920222234/http://www.azlyrics.com/u/u2.html',
        'http://web.archive.org/web/20140924054553/http://www.azlyrics.com/u/ub40.html',
        'http://web.archive.org/web/20140921102809/http://www.azlyrics.com/d/daftpunk.html',
        'http://web.archive.org/web/20141102175756/http://www.azlyrics.com/t/taylorswift.html',
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
