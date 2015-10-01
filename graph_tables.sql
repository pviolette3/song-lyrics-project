CREATE TABLE songs
(
    id integer,
    name varlen,
    artist_id integer,
    PRIMARY KEY (id),
    FOREIGN KEY (artist_id) REFERENCES artists(id)
);

CREATE TABLE artists
(
    id integer,
    name varlen,
    PRIMARY KEY (id)
);

CREATE TABLE edges
(
    source integer,
    sink integer,
    similarity float,
    FOREIGN KEY (source) REFERENCES songs(id),
    FOREIGN KEY (sink) REFERENCES songs(id)
);
