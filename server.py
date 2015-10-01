from flask import Flask, request
from gensim.models.doc2vec import Doc2Vec
import sys
import json
from similarities import getSongs
from flask.ext.cors import CORS

app = Flask(__name__)
CORS(app)

similaritiesCache = {}
songs = None
songsByArtist = None
songsByTitle = None
model = None

def inflateSong(songId):
    return {
        'song_id': songId,
        'song_name': songs[songId]['name'],
        'artist_name': songs[songId]['artist'],
    }

def inflate(similarities, to_id):
    results = []
    for i, sim in similarities:
        results.append({
            'song': inflateSong(i),
            'sim_score': sim,
        })
    return {
        'song': inflateSong(to_id),
        'similar': results,
    }

MAX_TOPN = 100
@app.route('/sim/<song_id>')
def get_similar_songs(song_id):
    song_id = int(song_id)
    topn = min(MAX_TOPN, int(request.args.get('topn', 10)))
    if song_id in similaritiesCache:
        similarities = similaritiesCache[song_id][:topn]
    else:
        similarities = model.docvecs.most_similar(song_id, topn=MAX_TOPN)
        similaritiesCache[song_id] = similarities[:topn]
        
    return json.dumps(inflate(similarities, song_id))

@app.route('/song/lookup')
def lookup():
    artist = request.args.get('artist')
    song_name = request.args.get('song')
    print artist, song_name
    matchingArtists = songsByArtist.get(artist.lower(), set([]))
    matchingSongs = songsByName.get(song_name, set([]))
    if matchingSongs and matchingArtists:
        songIds = matchingArtists & matchingSongs
    else:
        songIds = matchingArtists | matchingSongs
    return json.dumps({'matches': [inflateSong(songId) for songId in sorted(songIds)]})

if __name__ == '__main__':
    print 'Loading songs..'
    songs = list(getSongs()) 
    songsByArtist = {}
    for i, song in enumerate(songs):
        if song['artist'] not in songsByArtist:
            songsByArtist[song['artist']] = set([i])
        else:
            songsByArtist[song['artist']].add(i)

    songsByName = {}
    for i, song in enumerate(songs):
        if song['name'] not in songsByName:
            songsByName[song['name']] = set([i])
        else:
            songsByName[song['name']].add(i)

    print 'Loading model...'
    model = Doc2Vec.load(sys.argv[1])
    print 'Serving...'
    app.run(host='0.0.0.0', port=4000)
