'use strict';
// Get express from node model
const express = require("express");
// read data from JSON file
const movieData = require("./MovieData/data.json");
// Read .env file
const dotenv = require("dotenv");
// Get axios so we can send HTTP requests to an API
const axios = require("axios");

// start(configure) the dotenv
dotenv.config();
// initializing my server
const app = express();

// Variables that live in my .env file
const APIKEY = process.env.APIKEY;
console.log(APIKEY)
const PORT = process.env.PORT;

// Constructor to format the data as I want 
function Data(id, title, release_date, poster_path, overview) {
    this.id = id
    this.title = title
    this.release_date = release_date
    this.poster_path = poster_path
    this.overview = overview
};
// All my end points note: not found end point always should be in the end.
//app.get('/', dataHandler);
//app.get('/favorite', welcomeHandler);
app.get('/trending', trendingHandler)
app.get('/search', searchTrendingHandler)
app.get('/lang', langTrendingHandler)
app.get('/list', movielistTrendingHandler)
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
app.listen(PORT, () => {
    console.log(`Listen on ${PORT}`);
});

