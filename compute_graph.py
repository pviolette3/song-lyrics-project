from gensim.models.doc2vec import Doc2Vec
from similarities import getSongs
from scipy.spatial import cKDTree
from multiprocessing import Pool
import numpy as np
import sys
import time

modelFile = sys.argv[1]
print 'Loading songs...'

print 'Loading model...'
model = Doc2Vec.load(modelFile)
syns = model.docvecs.doctag_syn0
sim = cKDTree(syns, syns.shape[0])

def computeSimilarity(args):
    i = args
    start = time.time()
    dists, neighbors = sim.query(syns[i], 20)
    results = zip(list(dists), list(neighbors))
    if i % 100 == 0:
        print 'Finished', i, 'in', time.time() - start
    return results

pool = Pool(16)
adjacencies = pool.map(computeSimilarity, range(syns.shape[0]))
import IPython;IPython.embed()
songs = list(getSongs())
artists = set(song['artist'] for song in songs)
artistIds = {artist: i for i, artist in enumerate(sorted(artists))}

