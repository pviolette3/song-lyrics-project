from gensim.models.doc2vec import Doc2Vec, TaggedDocument
import json
from spacy.en import English
import logging
logging.basicConfig(format='%(asctime)s : %(levelname)s : %(message)s', level=logging.INFO)

#nlp = English(parser=False, tagger=False, entity=False)
def flattenGroupedLyrics(groupedLyrics):
    flattened = []
    for group in groupedLyrics:
        for line in group[:-1]:
            flattened.extend([tok.orth_ for tok in nlp(line)])
            flattened.append('\n')
        flattened.extend([tok.orth_ for tok in nlp(group[-1])])
        flattened.append('\n\n')
    return flattened

def getDocs():
    for song in getSongs():
        yield TaggedDocument(words=song['words'], tags=song['tags'])

def getSongs():
    with open('doc2vec_dataset.json', 'r') as f:
        for line in f:
            song = json.loads(line)
            yield song

def expandSong(song, i):
    return {
        'artist': song['artist'],
        'name': song['name'],
        'words': flattenGroupedLyrics(song['lyricGroups']),
        'tags': [i],
    }

def saveDocs():
    with open('doc2vec_dataset.json', 'w') as out:
        with open('randomized_dataset.json', 'r') as f:
            for i, line in enumerate(f):
                song = json.loads(line)
                out.write(json.dumps(expandSong(song, i)) + '\n')

def main():
    docs = list(getDocs())
    model = Doc2Vec(docs, size=300, window=10, min_count=5, workers=16,
                    negative=10, dm_concat=1)
    model.save('lyrics_doc2vec_s300_win10_neg10_concat.model')
    return model

if __name__ == '__main__':
    model = main()
    import IPython;IPython.embed()
