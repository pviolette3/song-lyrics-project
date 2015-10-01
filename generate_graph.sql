-- top songs between artists
SELECT artist_from, artist_to, COUNT() FROM
    edges JOIN artists as a1 ON edges.source = a1.id
    
    
