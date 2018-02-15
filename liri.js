require("dotenv").config();
var spotify = require('spotify');
var request = require('request');
var twitter = require('twitter');
var keys = require("./keys.js");


console.log(keys);
spotify.search({type: "Tool", id: keys.spotify.id}, function(err, data) {
    console.log(err);
    console.log(data);
});
spotify.search({ type: 'track', query: 'dancing in the moonlight' }, function(err, data) {
    if ( err ) {
        console.log('Error occurred: ' + err);
        return;
    }
 
    console.log(data);
    // Do something with 'data' 
});