DROP TABLE IF EXISTS addmovies;

CREATE TABLE IF NOT EXISTS addmovies(
id SERIAL PRIMARY KEY,
title VARCHAR(255),
release_date VARCHAR(500),
poster_path VARCHAR(500),
overview VARCHAR(500)
);