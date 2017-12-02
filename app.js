// Defining stuff
const Discord = require('discord.js');
const client = new Discord.Client();
const moment = require('moment');
const colors = require('colors');
const request = require('request');
const kachelmann = require('./config.json');
const jsonfile = require('jsonfile');
const schedule = require('node-schedule');


// let usersMessaged = require('./usersMessaged.json')
var file = './users.json'

// Random response everytime weather gets requested
const lookup = ["Searching for city called", "Travelling to", "Searching around for", "Contacting my friends in", "Tinkering around in", "Looking at the sky in", "Feeling my senses in", "Tasking the grass", "Smelling on leaves"]

// Logging in console when bot connected
client.on('ready', function() {
  console.log(colors.green('[' + moment().format('LTS') + '] Kachelmann connected successfully.'));
});


// Checking if there are any messages to be sent every minute, using schedule for consistency
var j = schedule.scheduleJob('00 * * * * *', function(){
  //console.log(colors.green('[' + moment().format('LTS') + '] Checking for outstanding messages.'));

  // Reading users file
  var users = jsonfile.readFileSync(file);

  // Breaking down the users file
  users.forEach(function(entry) {

    // Everything in here will be exectued for each entry in users.json
    //console.log(entry);
    var current_time = moment().format('LT');
      if ( current_time == entry.time ) {
        console.log(colors.green('[' + moment().format('LTS') + '] Message time!'));

        clientMessage(entry.id, entry.city, entry.type);

    }
  });
});

// When the client receives a message
client.on('message', msg => {

  if (msg.channel.type == "dm") {
    if (msg.content.toLowerCase().startsWith("add me ")) {
      console.log(colors.green('[' + moment().format('LTS') + '] "Add me" message received.'));
      var words = msg.content.split(' ');

      // Shifting the "Add me" away...
      words.shift();

        // We take the current file and read it
        var users = jsonfile.readFileSync(file);

        // We take the user input to add him to the list
        var id = msg.author.id;
        console.log(id);

        // Shifting all words again so only the time itself remains
        words.shift();
        var time = words[0] + " " + words[1];
        console.log(time);

        // Shifting all words again (...) so only the city remains
        words.shift();
        words.shift();

        // Taking the last part of the string, the city
        var city = words.join(' ');
        console.log(city);

        // Adding the new user to the list
        users = [...users, { id, time, city }]

        // Writing the new list with the new user back into the file
        jsonfile.writeFileSync(file, users, {spaces: 2})

        msg.channel.send(":white_check_mark: **Success!**\n\nI have added you to my list with the following settings:\n``` UserID  :  " + msg.author.id +"\n   Time  :  " + time + "\n   City  :  " + city + "```\n***Remember:** You can always stop receiving messages by simply typing \"Remove me\"!*")
      }

      if (msg.content.toLowerCase().startsWith("remove me")) {
        console.log(colors.green('[' + moment().format('LTS') + '] "Remove me" message received.'));

        // We take the current file and read it
        var users = jsonfile.readFileSync(file);

        // We take the user id and prepare it to get removed from the list
        var id_removed = msg.author.id

        // Initial process of removing user from list (https://stackoverflow.com/a/21150476)
        var users_updated = [];
        for (var i in users)
          if(users[i].id != id_removed)
            users_updated[users_updated.length] = users[i]

        // Replacing old users with new ones
        users = users_updated;

        // Writing the new list without the user back into the file
        jsonfile.writeFileSync(file, users, {spaces: 2})

        msg.channel.send(":white_check_mark: **Success!**\n\nYou have been removed from my list and will no longer receive any messages!\n\n***Remember:** You can always return by simply typing `Add me 10:00 AM Berlin` for example!*")

      }

    }
  });


// Single weather lookups
client.on('message', msg => {
  if (msg.content.toLowerCase().startsWith(kachelmann.discord.prefix + " lookup")) {

    // Splitting the message into single words, adding them to an array called "words"
    var words = msg.content.split(' ');
    // Removing the first word of the message, the prefix in this case
    words.shift();
    // Removing another word, the "lookup" in this case
    words.shift();
    // We then put the array back togeter to a string, each word seperated by a space
    var city = words.join(' ');

    // Response before starting the request
    console.log(colors.green('[' + moment().format('LTS') + '] Kachelmann request received.'));
    msg.channel.send(`${lookup[Math.floor(lookup.length * Math.random())]} **` + city + `**...`);

    // Layout of the request url
    var url = "http://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=" + kachelmann.weather_api.key + "&units=" + kachelmann.weather_api.units

    // Initiating the request
    request(url, function(error, response, body) {

      if (!error && response.statusCode == 200) {
        var info = JSON.parse(body);
        console.log(colors.green('[' + moment().format('LTS') + '] Retreived info for city called "' + city + '".'));

        // Breaking down the weather-array
        var weather = info.weather[0];

        // Converting the unix timestamps to readable time using moment.js
        var sunrise = moment.unix(info.sys.sunrise).format('LTS');
        var sunset = moment.unix(info.sys.sunset).format('LTS');

        // Adding a little flag emoji behind the country tag
        var flag = ":flag_" + info.sys.country.toLowerCase() + ":"

        // Capitalizing the first letter of the weather description
        var weather_disc = weather.description.charAt(0).toUpperCase() + weather.description.slice(1);

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

        if ( info.main.temp > 40) {
          temp_icon = ":thermometer:";
        }

        if ( info.main.temp < 40 ) {
          temp_icon = ":thermometer:";
        }

        if ( info.main.temp < 30 ) {
          temp_icon = ":sunny:";
        }

        if ( info.main.temp < 20 ) {
          temp_icon = ":white_sun_cloud:";
        }

        if ( info.main.temp < 10 ) {
          temp_icon = ":cloud_snow:";
        }

        if ( info.main.temp < 0 ) {
          temp_icon = ":snowman:";
        }

        if ( info.main.temp < -10 ) {
          temp_icon = ":snowman2:";
        }

        // Get a random image from unsplash.com depending on the current weather
        var url_img = "https://source.unsplash.com/random?" + weather.main

        // Getting the image's url to link it
        var r = request(url_img, function (e, response) {
          r.uri
          response.request.uri
        });


        // Message layout for the bot's response
        const embed = new Discord.RichEmbed()
          // .setTitle("This is your title, it can hold 256 characters")
          .setAuthor("Kachelmann", "https://i.imgur.com/kh5TlcX.png")
          // .setColor(0x8DE969)
          .setColor(0xFFFFFF)
          .setDescription("Here's your requested weather report for **[" + info.name + "](https://www.google.de/maps/place/" + info.name + ")** (" + info.sys.country + " " + flag + ") \n*- Weather data for " + moment().format('MMMM Do YYYY') + " -*")
          .setFooter("Sourcecode on GitHub.com/4dams | Kachelmann Bot @ " + moment().format('LTS'), "https://i.imgur.com/9z8sY3w.png")
          .setImage(r.uri.href)
          .addBlankField()
          .addField("__Current Weather:__", "**" + weather.main + " " +  weather_icon + "**\n*(" + weather_disc + ")*", true)
          .addField("__Current Temperature:__", "It's currently **" + info.main.temp + "°C** " + temp_icon + " \n*(" + info.main.temp_min + "°C ~ " + info.main.temp_max + "°C)*", true)
          .addField("__Sunrise and Sunset:__", "Sunrise: **" + sunrise + "** :sunny:️\nSunset: **" + sunset + "** :crescent_moon:", true)
          .addField("__Air and Wind:__", "Humidity: **" + info.main.humidity + "%** :droplet:\nWind: **" + info.wind.speed + " km/h** at **" + info.wind.deg + "° :leaves:**", true)
          .addBlankField()
          .addField("__Today's image:__", "Here's the image of the day, just fitting for " + weather.main + "!\n***> [Full Resolution Image](" + r.uri.href + ")***")


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

function clientMessage (id, city, type) {
  // Layout of the request url
  var url = "http://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=" + kachelmann.weather_api.key + "&units=" + kachelmann.weather_api.units

  // Initiating the request
  request(url, function(error, response, body) {

    if (!error && response.statusCode == 200) {
      var info = JSON.parse(body);
      console.log(colors.green('[' + moment().format('LTS') + '] Retreived info for city called "' + city + '".'));

      // Breaking down the weather-array
      var weather = info.weather[0];

      // Converting the unix timestamps to readable time using moment.js
      var sunrise = moment.unix(info.sys.sunrise).format('LTS');
      var sunset = moment.unix(info.sys.sunset).format('LTS');

      // Adding a little flag emoji behind the country tag
      var flag = ":flag_" + info.sys.country.toLowerCase() + ":"

      // Capitalizing the first letter of the weather description
      var weather_disc = weather.description.charAt(0).toUpperCase() + weather.description.slice(1);

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

      if ( info.main.temp > 40) {
        temp_icon = ":thermometer:";
      }

      if ( info.main.temp < 40 ) {
        temp_icon = ":thermometer:";
      }

      if ( info.main.temp < 30 ) {
        temp_icon = ":sunny:";
      }

      if ( info.main.temp < 20 ) {
        temp_icon = ":white_sun_cloud:";
      }

      if ( info.main.temp < 10 ) {
        temp_icon = ":cloud_snow:";
      }

      if ( info.main.temp < 0 ) {
        temp_icon = ":snowman:";
      }

      if ( info.main.temp < -10 ) {
        temp_icon = ":snowman2:";
      }

      // Get a random image from unsplash.com depending on the current weather
      var url_img = "https://source.unsplash.com/random?" + weather.main

      // Getting the image's url to link it
      var r = request(url_img, function (e, response) {
        r.uri
        response.request.uri
      });


      // Message layout for the bot's response
      const embed = new Discord.RichEmbed()
        // .setTitle("This is your title, it can hold 256 characters")
        .setAuthor("Kachelmann", "https://i.imgur.com/kh5TlcX.png")
        // .setColor(0x8DE969)
        .setColor(0xFFFFFF)
        .setDescription("Here's your requested weather report for **[" + info.name + "](https://www.google.de/maps/place/" + info.name + ")** (" + info.sys.country + " " + flag + ") \n*- Weather data for " + moment().format('MMMM Do YYYY') + " -*")
        .setFooter("Sourcecode on GitHub.com/4dams | Kachelmann Bot @ " + moment().format('LTS'), "https://i.imgur.com/9z8sY3w.png")
        .setImage(r.uri.href)
        .addBlankField()
        .addField("__Current Weather:__", "**" + weather.main + " " +  weather_icon + "**\n*(" + weather_disc + ")*", true)
        .addField("__Current Temperature:__", "It's currently **" + info.main.temp + "°C** " + temp_icon + " \n*(" + info.main.temp_min + "°C ~ " + info.main.temp_max + "°C)*", true)
        .addField("__Sunrise and Sunset:__", "Sunrise: **" + sunrise + "** :sunny:️\nSunset: **" + sunset + "** :crescent_moon:", true)
        .addField("__Air and Wind:__", "Humidity: **" + info.main.humidity + "%** :droplet:\nWind: **" + info.wind.speed + " km/h** at **" + info.wind.deg + "° :leaves:**", true)
        .addBlankField()
        .addField("__Today's image:__", "Here's the image of the day, just fitting for " + weather.main + "!\n***> [Full Resolution Image](" + r.uri.href + ")***")


        if ( type == "user" ) {
          client.users.get(id).send({embed});
          client.users.get(id).send("***Remember:** You can always stop receiving messages by simply typing \"Remove me\"!*");
        }

        if ( type == "channel" ) {
          client.channels.get(id).send({embed});
          // msg.channel.send({embed});
        }

      // // Sending message to user
      // var member = id;
      // client.users.get(member).send({embed});
      // client.users.get(member).send("***Remember:** You can always stop receiving messages by simply typing \"Remove me\"!*");

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

} // End of function

// Logging the bot into Discord
client.login(kachelmann.discord.token);
