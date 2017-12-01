// Defining stuff
const Discord = require('discord.js');
const client = new Discord.Client();
const moment = require('moment');
const colors = require('colors');
const request = require('request');
const kachelmann = require("./config.json");

// Logging in console when bot connected
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

    // Response before starting the request
    console.log(colors.green('[' + moment().format('LTS') + '] Kachelmann request received.'));
    msg.channel.send('Searching info for city called **' + city + '**...');

    // Layout of the request url
    var url = "http://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=" + kachelmann.weather_api.key + "&units=" + kachelmann.weather_api.units

    // Initiating the request
    request(url, function(error, response, body) {

      if (!error) {
        var info = JSON.parse(body);
        console.log(colors.green('[' + moment().format('LTS') + '] Retreived info for city called "' + city + '".'));

        // Breaking down the weather-array
        var weather = info.weather[0];

        // Converting the unix timestamps to readable time using moment.js
        var sunrise = moment.unix(info.sys.sunrise).format('LTS');
        var sunset = moment.unix(info.sys.sunset).format('LTS');

        // Adding a little flag emoji behind the country tag
        var flag = ":flag_" + info.sys.country.toLowerCase() + ":"

        // Really long section for specifying an emoji fitting the the current weather state
        var weather_icon;

        if ( weather.icon == "01d") {
          // Clear sky at day
          var weather_icon = ":sunny:️";
        }

        if ( weather.icon == "02d") {
          // few clouds at day
          var weather_icon = ":white_sun_small_cloud:";
        }

        if ( weather.icon == "03d") {
          // scattered clouds at day
          var weather_icon = ":white_sun_cloud:";
        }

        if ( weather.icon == "04d") {
          // broken clouds at day
          var weather_icon = ":cloud:";
        }

        if ( weather.icon == "09d") {
          // shower rain at day
          var weather_icon = ":cloud_rain:";
        }

        if ( weather.icon == "10d") {
          // rain at day
          var weather_icon = ":white_sun_rain_cloud:";
        }

        if ( weather.icon == "11d") {
          // thunderstorm at day
          var weather_icon = ":cloud_lightning:";
        }

        if ( weather.icon == "13d") {
          // snow at day
          var weather_icon = ":cloud_snow:";
        }

        if ( weather.icon == "50d") {
          // mist at day
          var weather_icon = ":fog:";
        }

        //
        // And all of it again for night time
        //

        if ( weather.icon == "01n") {
          // Clear sky at night
          var weather_icon = ":night_with_stars:";
        }

        if ( weather.icon == "02n") {
          // few clouds at night
          var weather_icon = ":cloud:";
        }

        if ( weather.icon == "03n") {
          // scattered clouds at night
          var weather_icon = ":cloud:";
        }

        if ( weather.icon == "04n") {
          // broken clouds at night
          var weather_icon = ":cloud:";
        }

        if ( weather.icon == "09n") {
          // shower rain at night
          var weather_icon = ":cloud_rain:";
        }

        if ( weather.icon == "10n") {
          // rain at night
          var weather_icon = ":cloud_rain:";
        }

        if ( weather.icon == "11n") {
          // thunderstorm at night
          var weather_icon = ":cloud_lightning:";
        }

        if ( weather.icon == "13n") {
          // snow at night
          var weather_icon = ":cloud_snow:";
        }

        if ( weather.icon == "50n") {
          // mist at night
          var weather_icon = ":fog:";
        }

        // And once again for the sake of the Temperature
        var temp_icon;

        if ( info.main.temp < -10 ) {
          temp_icon = ":snowman2:";
        }

        if ( info.main.temp < 0 ) {
          temp_icon = ":snowman:";
        }

        if ( info.main.temp < 10 ) {
          temp_icon = ":cloud_snow:";
        }

        if ( info.main.temp < 20 ) {
          temp_icon = ":white_sun_cloud:";
        }

        if ( info.main.temp < 30 ) {
          temp_icon = ":sunny:";
        }

        if ( info.main.temp < 40 ) {
          temp_icon = ":thermometer:";
        }

        if ( info.main.temp > 40) {
          temp_icon = ":thermometer:";
        }

        // Message layout for the bot's response
        let embed = {
          title: "__Kachelmann Weather Report__",
          //thumbnail: { height: 64, width: 64, url: mem.user.avatarURL },
          description: "Here's your requested weather report for **" + info.name + "** (" + info.sys.country + " " + flag + ") \n*Weather data for " + moment().format('MMMM Do YYYY') + "*",
          color: 0x8DE969,
          fields: [
            { name: "__Current Weather:__", value: "**" + weather.main + " " +  weather_icon + "**\n*(" + weather.description + ")*", inline: true },
            { name: "__Current Temperature:__", value: "It's currently **" + info.main.temp + "°C** " + temp_icon + " \n*(" + info.main.temp_min + "°C ~ " + info.main.temp_max + "°C)*", inline: true },
            { name: "__Sunrise and Sunset:__", value: "Sunrise at **" + sunrise + " CET** :sunny:️\nSunset at **" + sunset + " CET** :crescent_moon:"}
          ],
          footer: { text: "[" + moment().format('LTS') + "] Kachelmann Bot | GitHub: 4dams/Kachelmann"}
        }

        // Sending the bot reply
        msg.channel.send({embed});

      }

      // Response if city couldn't be found
      if (response.statusCode == 404) {
        msg.channel.send('Sorry, but I couldn\'t find any city called **' + city + '** :frowning:');
        console.log(colors.yellow('[' + moment().format('LTS') + '] Could not find any city for user input "' + city + '".'));
      }

      // Response if any other error occurs
      if (response.statusCode !== 404 && response.statusCode !== 200) {
        msg.channel.send('An error has occured while retreiving your data.\nPlease contact the bot administrator **4dams#0001** on Discord. :warning:');
        console.log(colors.red('[' + moment().format('LTS') + '] Error retreiving data. Response code: "' + response.statusCode + '".'));
      }

    });

  }
});

// Logging the bot into Discord
client.login(kachelmann.discord.token);
