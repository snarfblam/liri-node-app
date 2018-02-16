require("dotenv").config();
var Spotify = require('node-spotify-api');
var request = require('request');
var twitter = require('twitter');
var keys = require("./keys.js");

// spotify.search({type: "Tool", id: keys.spotify.id, secret: keys.spotify.secret}, function(err, data) {
//     console.log(err);
//     console.log(data);
// });
var spotify = new Spotify({
    id: keys.spotify.id,
    secret: keys.spotify.secret,
});

var commands = {
    "spotify-this-song": function (p1, p2) {
        lookupTrack(p1, p2);
    }
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
    fgBrightWhite: "\x1b[1m\x1b[37m",
    fgBrightBlack: "\x1b[1m\x1b[30m",
    fgBrightRed: "\x1b[1m\x1b[31m",
    fgBrightGreen: "\x1b[1m\x1b[32m",
    fgBrightYellow: "\x1b[1m\x1b[33m",
    fgBrightBlue: "\x1b[1m\x1b[34m",
    fgBrightMagenta: "\x1b[1m\x1b[35m",
    fgBrightCyan: "\x1b[1m\x1b[36m",
    fgBrightWhite: "\x1b[1m\x1b[37m",
}


function lookupTrack(trackName, resultNum) {
    var rickRoll = false;

    if(!trackName) { 
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

            if(rickRoll) {
                var rick = "/Never gonna give you up/Never gonna let you down/Never gonna run around and desert you/Never gonna make you cry/Never gonna say goodbye/Never gonna tell a lie and hurt you".replace(/\//g, "\n");
                var rainbow = [colorCode.fgBrightRed, colorCode.fgBrightYellow, colorCode.fgBrightGreen, colorCode.fgBrightCyan, colorCode.fgBrightBlue, colorCode.fgBrightMagenta];
                var rickRainbow = [];
                var rainbowIndex = 0;
                for(var i = 0; i < rick.length; i++) {
                    rickRainbow.push(rick.charAt(i));
                    rickRainbow.push(rainbow[rainbowIndex]);
                    rainbowIndex = (rainbowIndex + 1) % rainbow.length;
                }

                console.log(rickRainbow.join(""));
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

