const Discord = require('discord.js');
const client = new Discord.Client();
const moment = require('moment');
const colors = require('colors');
const request = require('request');
const kachelmann = require("./config.json");

var city;
var city_converted;

//var requestMap = "http://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=" + kachelmann.weather_api.key + "&units=" + kachelmann.weather_api.units

client.on('ready', function() {
  console.log(colors.green('[' + moment().format('LTS') + '] Kachelmann connected successfully.'));
});

client.on('message', msg => {
  if (msg.content.toLowerCase().startsWith(kachelmann.discord.prefix)) {

    // Splitting the message into single words, adding them to an array called "words"
    var words = msg.content.split(' ');
    // Removing the first word of the message, "/kachelmann" in this case
    words.shift();
    // We then put the array back togeter to a string, each word seperated by a space
    var city = words.join(' ');

    var url = "http://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=" + kachelmann.weather_api.key + "&units=" + kachelmann.weather_api.units

    request(url, function(error, response, body) {

      if (!error) {
        var info = JSON.parse(body);
        //console.log(body);
        console.log(colors.green('[' + moment().format('LTS') + '] Retreived info for city called "' + city + '".'));

        // Clarifying information...
        var weather = info.weather[0]

        let embed = {
          title: "__Kachelmann Weather Report__",
          //thumbnail: { height: 64, width: 64, url: mem.user.avatarURL },
          description: "Here's your requested weather report for **" + info.name + "** (" + info.sys.country + ") \n*Weather data for " + moment().format('MMMM Do YYYY') + "*",
          color: 0x8DE969,
          fields: [
            { name: "__Current Weather:__", value: "**" + weather.main + "**\n*(" + weather.description + ")*", inline: true },
            { name: "__Current Temperature:__", value: "It's currently **" + info.main.temp + "°C** \n*(" + info.main.temp_min + "°C - " + info.main.temp_max + "°C)*", inline: true }
          ],
          footer: { text: "[" + moment().format('LTS') + "] Kachelmann Bot | GitHub: 4dams/Kachelmann"}
        }

        msg.channel.send({embed});

      }

      if (response.statusCode == 404) {
        msg.channel.send('Sorry, but I couldn\'t find any city called **' + city + '** :frowning:');
        console.log(colors.yellow('[' + moment().format('LTS') + '] Could not find any city for user input "' + city + '".'));
      }

      if (response.statusCode !== 404 && response.statusCode !== 200) {
        msg.channel.send('An error has occured while retreiving your data.\nPlease contact the bot administrator **4dams#0001** on Discord. :warning:');
        console.log(colors.red('[' + moment().format('LTS') + '] Error retreiving data. Response code: "' + response.statusCode + '".'));
      }

    });

    console.log(colors.green('[' + moment().format('LTS') + '] Kachelmann request received.'));
    msg.channel.send('Searching info for city called **' + city + '**...');

  }
});

client.login(kachelmann.discord.token);
