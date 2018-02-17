require("dotenv").config();
var Spotify = require('node-spotify-api');
var request = require('request');
var Twitter = require('twitter');
var keys = require("./keys.js");
var querystring = require('querystring');

var omdbUrl = "http://www.omdbapi.com/";


var commands = {
    "spotify-this-song": function (p1, p2) {
        lookupTrack(p1, p2);
    },
    "my-tweets": function () {
        getTweets();
    },
    "movie-this": function (p1) {
        lookupFilm(p1);
    },
}


var command = process.argv[2];
var param1 = process.argv[3];
var param2 = process.argv[4];

if (command) command = command.toLowerCase();
var commandFunc = commands[command];

if (commandFunc) {
    commandFunc(param1, param2);
} else {
    console.log("Error: unknown command -- " + command);
}


var colorCode = {
    reset: "\x1b[0m",
    fgBlack: "\x1b[2m\x1b[30m",
    fgRed: "\x1b[2m\x1b[31m",
    fgGreen: "\x1b[2m\x1b[32m",
    fgYellow: "\x1b[2m\x1b[33m",
    fgBlue: "\x1b[2m\x1b[34m",
    fgMagenta: "\x1b[2m\x1b[35m",
    fgCyan: "\x1b[2m\x1b[36m",
    fgWhite: "\x1b[2m\x1b[37m",
    fgBrightBlack: "\x1b[1m\x1b[30m",
    fgBrightRed: "\x1b[1m\x1b[31m",
    fgBrightGreen: "\x1b[1m\x1b[32m",
    fgBrightYellow: "\x1b[1m\x1b[33m",
    fgBrightBlue: "\x1b[1m\x1b[34m",
    fgBrightMagenta: "\x1b[1m\x1b[35m",
    fgBrightCyan: "\x1b[1m\x1b[36m",
    fgBrightWhite: "\x1b[1m\x1b[37m",
    bgBlack: "\x1b[40m",
    bgRed: "\x1b[41m",
    bgGreen: "\x1b[42m",
    bgYellow: "\x1b[43m",
    bgBlue: "\x1b[44m",
    bgMagenta: "\x1b[45m",
    bgCyan: "\x1b[46m",
    bgWhite: "\x1b[47m",
}


function lookupTrack(trackName, resultNum) {
    var spotify = new Spotify({
        id: keys.spotify.id,
        secret: keys.spotify.secret,
    });

    var rickRoll = false;

    if (!trackName) {
        trackName = "Never Gonna Give You Up";
        rickRoll = true;
    }

    spotify.search({ type: 'track', query: trackName }, function (err, data) {
        if (err) {
            console.log('Error occurred: ' + err);
            return;
        }

        var trackNum = resultNum;
        if (!trackNum) trackNum = 1;
        trackNum = parseInt(trackNum) - 1; // convert from 1-based to 0-based

        try {
            var trackInfo = data.tracks.items[trackNum];
            var artist = trackInfo.artists[0].name;
            var albumName = trackInfo.album.name;
            var trackName = trackInfo.name;
            var previewUrl = trackInfo.preview_url;

            console.log("");
            console.log(colorCode.fgBrightBlue + "Track information:")
            console.log(
                colorCode.fgBrightWhite + '"' + trackName + '"' +
                colorCode.fgBrightBlue + ' by ' +
                colorCode.fgBrightWhite + artist);
            console.log(colorCode.fgBrightBlue + 'Album: ' + colorCode.fgBrightWhite + albumName);
            console.log(colorCode.fgBrightBlue + 'Preview: ' + colorCode.fgCyan + previewUrl);

            if (rickRoll) {
                setTimeout(function () {
                    var rick = "/Never gonna give you up /Never gonna let you down/Never gonna run around and desert you     /Never gonna make you cry/Never gonna say goodbye /Never gonna tell a lie and hurt you".replace(/\//g, "\n");
                    var rainbow = [colorCode.fgBrightRed, colorCode.fgBrightYellow, colorCode.fgBrightGreen, colorCode.fgBrightCyan, colorCode.fgBrightBlue, colorCode.fgBrightMagenta];
                    var rickRainbow = [];
                    var rainbowIndex = 0;
                    for (var i = 0; i < rick.length; i++) {
                        rickRainbow.push(rick.charAt(i));
                        rickRainbow.push(rainbow[rainbowIndex]);
                        rainbowIndex = (rainbowIndex + 1) % rainbow.length;
                    }

                    console.log(rickRainbow.join(""));
                }, 2000);
            }
        } catch (e) {
            if (e instanceof TypeError) {
                console.log("Error: could not find the requested track information.")
            } else {
                throw e;
            }
        }


    });
}

function getTweets() {
    var twitter = new Twitter({
        consumer_key: keys.twitter.consumer_key,
        consumer_secret: keys.twitter.consumer_secret,
        access_token_key: keys.twitter.access_token_key,
        access_token_secret: keys.twitter.access_token_secret,
    });

    var twitPrams = { screen_name: keys.twitter.username };
    twitter.get('statuses/user_timeline', twitPrams, function (error, tweets, response) {
        tweets = tweets || "";
        if (error) {
            console.log("Error retrieving twits:");
            console.log(error);
            return;
        }

        var tweetCount = Math.min(tweets.length || 20);
        for (var i = 0; i < tweetCount; i++) {
            logTweet(tweets[i]);
        }
    });

    function logTweet(tweet) {
        console.log(colorCode.bgBlack);
        console.log(colorCode.bgWhite + colorCode.fgBlack +
            ("►" + tweet.user.name + colorCode.fgBlue + "  @" + tweet.user.screen_name)
                .padEnd(40 + colorCode.fgCyan.length));
        var tweetText = tweet.text;
        while (tweetText.length > 0) {
            var substr = tweetText.substr(0, 30);
            tweetText = tweetText.substr(30);
            console.log(colorCode.bgWhite + colorCode.fgBlack + ("     " + substr).padEnd(40));
        }
    }
}



function lookupFilm(filmName) {
    omdbParams = {
        t: filmName,
        apikey: keys.omdb.api_key,
    };
    var url = omdbUrl + "?" + querystring.stringify(omdbParams);
    request(url, function (err, response, body) {
        if (err) {
            console.log("Error:", err);
        } else if (response.statusCode == 200) {
            var result = JSON.parse(body);

            var imdbRating = getRating(result, "Internet Movie Database");
            var tomatoRating = getRating(result, "Rotten Tomatoes");

            console.log( colorCode.bgWhite + colorCode.fgBlack +
                result.Title + " (" + result.Year + ")" +
                colorCode.reset
            );
            logFilmDetail("IMDB Rating", imdbRating);
            logFilmDetail("Rotten Tomatoes Rating", tomatoRating);
            logFilmDetail("Country", result.Country);
            logFilmDetail("Langauge", result.Language);
            logFilmDetail("Actors", result.Actors);
            logFilmDetail("Plot", result.Plot);
        } else {
            console.log("OMDB responded with HTTP code " + response.statusCode);
        }
    });

    function getRating(omdbData, name) {
        if(!name) return;
        var ratings = omdbData.Ratings || [];
        for(var i = 0; i < ratings.length; i++) {
            if(ratings[i].Source == name) return ratings[i].Value || null; 
        }

        return null;
    }

    function logFilmDetail(name, value) {
        console.log(colorCode.fgBlue + name + ": " + colorCode.fgBrightWhite + value)
    }
}