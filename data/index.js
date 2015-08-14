var LyricsScraper = require('./LyricsScraper');
var ArtistSongScraper = require('./ArtistSongScraper');

function main() {
    var lyricsScraper = new LyricsScraper();
    var artistQueries = [
        'Taylor Swift',
    ];

    artistQueries.map(function(artistName) {
        return new ArtistSongScraper(artistName);
    }).forEach(function(scraper) {
        scraper.on('songurl', function(data) {
            lyricsScraper.enqueue(data.url);
        });
        scraper.enqueue(0);
    });

    lyricsScraper.on('song', function(song) {
        console.log(song);
    });
}

if (require.main === module) {
    main();
}