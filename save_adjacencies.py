import sqlite3
import json
from similarities import getSongs

'''
with open('adjacencies.json', 'w') as f:
    json.dump(adjacencies, f)
'''

with open('adjacencies.json', 'r') as f:
    adjacencies = json.load(f)

songs = list(getSongs())
artistsById = {artist: i for i, artist in enumerate(sorted(set(song['artist'] for song in songs)))}
conn = sqlite3.connect('lyrics_graph.db')
c = conn.cursor()
c.executemany('INSERT INTO artists VALUES (?, ?)', [(v, k) for k, v in artistsById.iteritems()])
c.executemany('INSERT INTO songs VALUES (?, ?, ?)', [(song['tags'][0], song['name'], artistsById[song['artist']]) for song in songs])
c.executemany('INSERT INTO edges VALUES (?, ?, ?)', [(i, j, 1 - dist) for i, neighbors in enumerate(adjacencies) for dist, j in neighbors if i != j])
c.close()
conn.commit()
conn.close()
