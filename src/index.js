var request = require("request")
var notifier = require("node-notifier")
var parse = require("xml2json")
var path = require("path");

var oldQuakes = []
require("babel/polyfill");

function getDateTime() {
    var date = new Date();

    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;

    var min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;

    var sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;

    var year = date.getFullYear();

    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;

    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;

    return day + "/" + month + "/" + year + " " + hour + ":" + min + ":" + sec;
}

function newQuake(quake) {
    notifier.notify({
        'title': 'Earthquake Early Warning',
        'subtitle': 'An Earthquake is about to occur in Fukushima',
        'message': 'Magnitude: ' + quake.magnitude / 10 + ', Seismic Scale: ' + quake.seismic_scale,
        'contentImage': void 0,
        'sound': 'eew',
        'icon': path.join(__dirname, 'icon.png')
    });

    console.log(getDateTime() + " [!] Earthquake Detected, Triggering Event");
    console.log(getDateTime() + " [-] Date/Time: " + quake.eq_date);
    console.log(getDateTime() + " [-] Magnitude: " + quake.magnitude / 10 + "M");
    console.log(getDateTime() + " [-] Seismic: " + quake.seismic_scale);
    console.log(getDateTime() + " [-] Latitude: " + quake.epicenter_lat);
    console.log(getDateTime() + " [-] Longitude: " + quake.epicenter_lng);
    console.log(getDateTime() + " [-] Depth: " + quake.depth + "km");
}

function read(error, response, body) {
    var result = JSON.parse(parse.toJson(body))
    if (oldQuakes.length !== 0) {
        for (var o in result.quakes.quake) {
            var quake = result.quakes.quake[o]
            var notfound = true
            for (var i in oldQuakes) {
                var oldQuake = oldQuakes[i]
                if (oldQuake.quake_id === quake.quake_id) {
                    notfound = false
                    break
                }
            }
            if (notfound) {
                newQuake(quake)
                break
            }
        }
    }
    oldQuakes = result.quakes.quake
}

/*
function search() {
    request('http://127.0.0.1:8000/test.xml', read)
}
*/

function search() {
    request('http://api.quake.twiple.jp/quake/index.xml', read)
}

setInterval(search, 2000)
