'use strict';
// Get express from node model
const express = require("express");
// read data from JSON file
const movieData = require("./MovieData/data.json");
// initializing my server
const app = express();
// Constructor to format the data as I want 
function Data(title, poster_path, overview) {
    this.title = title
    this.poster_path = poster_path
    this.overview = overview
};
// All my end points note: not found end point always should be in the end.
app.get('/', dataHandler);
app.get('/favorite', welcomeHandler);
app.use("*", notFoundHandler);

function dataHandler(req, res) {
    let result = [];
    movieData.data.forEach((value) => {
        let oneData = new Data(value.title, value.poster_path, value.overview);
        result.push(oneData);
    });
    return res.status(200).json(result);
};

function welcomeHandler(request, response) {

    return response.send("Welcome to Favorite Page");
};

function notFoundHandler(req, res) {
    return res.status(404).send("Not Found");
}

// The pice of code which make my server work.
app.listen(3000, () => {
    console.log("Listen on 3000");
});

