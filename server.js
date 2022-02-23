'use strict';
// Get express from node model
const express = require("express");
// read data from JSON file
const movieData = require("./MovieData/data.json");
// Read .env file
const dotenv = require("dotenv");
// Get axios so we can send HTTP requests to an API
const axios = require("axios");
// It will connect the database with the server
const pg = require("pg");

// start(configure) the dotenv
dotenv.config();
// initializing my server
const app = express();

// Variables that live in my .env file
const APIKEY = process.env.APIKEY;
console.log(APIKEY)
const PORT = process.env.PORT;
const DATABASE_URL = process.env.DATABASE_URL;

// Initialize the connection
const client = new pg.Client(DATABASE_URL);

// Constructor to format the data as I want 
function Data(id, title, release_date, poster_path, overview, comments) {
    this.id = id
    this.title = title
    this.release_date = release_date
    this.poster_path = poster_path
    this.overview = overview
    this.comments = comments
};

// To get the data from the body object
app.use(express.json());
// All my end points note: not found end point always should be in the end.
app.get('/trending', trendingHandler)
app.get('/search', searchTrendingHandler)
app.get('/lang', langTrendingHandler)
app.get('/list', movielistTrendingHandler)
app.post('/addMovie', addMovieHandler)
app.get('/getMovies', getMoviesHandler)
app.put('/updateMovies/:id', updateMoviesHandler);
app.delete('/deleteMovies/:id', deleteMoviesHandler);
app.get('/getMovie/:id', getMovieHandler)

app.use("*", notFoundHandler);
//Make my server use errorHandler function
app.use(errorHandler);

function trendingHandler(req, res) {
    let result = [];
    // line 37 to line 45 is a promise 
    axios.get(`https://api.themoviedb.org/3/trending/all/week?api_key=${APIKEY}`)
        .then(apiResponse => {
            apiResponse.data.results.map(value => {
                let oneTrend = new Data(value.id, value.title, value.release_date, value.poster_path, value.overview);
                result.push(oneTrend);
            })
            return res.status(200).json(result);
        }).catch(error => {
            errorHandler(error, req, res);
        })
    // movieData.data.forEach((value) => {
    //     let oneData = new Data(value.title, value.poster_path, value.overview);
    //     result.push(oneData);
    // });
    //return res.status(200).json(result);
};

// function welcomeHandler(request, response) {

//     return response.send("Welcome to Favorite Page");
// };
function searchTrendingHandler(req, res) {
    const search = req.query.data
    let results = [];
    // postman link http://localhost:3000/search?query=the
    axios.get(`https://api.themoviedb.org/3/search/movie?api_key=${APIKEY}&query=${search}`)
        .then(apiResponse => {
            apiResponse.data.results.map(value => {
                let oneTrend = new Data(value.id || "N/A", value.title || "N/A", value.release_date || "N/A", value.poster_path || "N/A", value.overview || "N/A")
                results.push(oneTrend);
            });
            return res.status(200).json(results);
        }).catch(error => {
            errorHandler(error, req, res);
        })
}
function Langs(iso, english_name, name) {
    this.iso = iso,
        this.english_name = english_name
    this.name = name
}
function langTrendingHandler(req, res) {
    const lan = req.query.data
    let results = [];
    // postman link http://localhost:3000/lang?data=pt-BR
    // query data: key=>data value=>pt-BR
    axios.get(`https://api.themoviedb.org/3/configuration/languages?api_key=${APIKEY}&language=${lan}`)
        .then(apiResponse => {
            console.log(apiResponse)
            apiResponse.data.map(value => {
                let languages = new Langs(value.iso || "N/A", value.english_name || "N/A", value.name || "N/A")
                results.push(languages);
            });
            return res.status(200).json(results);
        }).catch(error => {
            errorHandler(error, req, res);
        })
}
function List(id, name) {
    this.id = id
    this.name = name
}
function movielistTrendingHandler(req, res) {
    let result = [];
    // postman link http://localhost:3000/list
    axios.get(`https://api.themoviedb.org/3/genre/movie/list?api_key=${APIKEY}`)
        .then(apiResponse => {
            apiResponse.data.genres.map(value => {
                let list = new List(value.id || "N/A", value.name || "N/A")
                result.push(list);
            });
            return res.status(200).json(result);
        }).catch(error => {
            errorHandler(error, req, res);
        })
}

function addMovieHandler(req, res) {
    const movie = req.body;
    const sql = `INSERT INTO addmovies(title, release_date, poster_path, overview,comments) VALUES($1, $2, $3, $4,$5) RETURNING *` //returning is what data i want to return
    const values = [movie.title, movie.release_date, movie.poster_path, movie.overview, movie.comments]
    client.query(sql, values).then((result) => {
        return res.status(201).json(result.rows);
    }).catch((error) => {
        errorHandler(error, req, res);
    });
};

function getMoviesHandler(req, res) {
    const sql = `SELECT * FROM addmovies`;
    client.query(sql).then((result) => {
        return res.status(200).json(result.rows);
    }).catch((error) => {
        errorHandler(error, req, res);
    });
};
//postman link with put request http://localhost:3001/updateMovies/hi pretty
function updateMoviesHandler(req, res) {
    const id = req.params.id;
    const movie = req.body;
    const sql = `UPDATE addmovies SET title=$1, release_date=$2,poster_path=$3, overview=$4,comments=$5 WHERE id=$6 RETURNING *;`;
    const values = [movie.title, movie.release_date, movie.poster_path, movie.overview, movie.comments, id];
    client.query(sql, values).then((result) => {
        return res.status(200).json(result.rows);
    }).catch((error) => {
        errorHandler(error, req, res);
    });
};
function deleteMoviesHandler(req, res) {
    const id = req.params.id

    const sql = `DELETE FROM addmovies WHERE id=$1;`
    const values = [id];

    client.query(sql, values).then(() => {
        return res.status(204).json({})
    }).catch(error => {
        errorHandler(error, req, res);
    })
};
function getMovieHandler(req, res) {
    let id = req.params.id;
    const sql = `SELECT * FROM addmovies WHERE id=$1`;
    const values = [id];
    client.query(sql).then((result) => {
        return res.status(200).json(result.rows);
    }).catch((error) => {
        errorHandler(error, req, res);
    });
};

function errorHandler(error, req, res) {
    const err = {
        status: 500,
        message: error
    }
    return res.status(500).send(err);
}

function notFoundHandler(req, res) {
    return res.status(404).send("Not Found");
}

// The pice of code which make my server work.
client.connect()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Listen on ${PORT}`);
            // app.listen(PORT, () => {
            //     console.log(`Listen on ${PORT}`);
        });

    });