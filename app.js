const Discord = require('discord.js');
const client = new Discord.Client();
const moment = require('moment');
const colors = require('colors');
const kachelmann = require("./config.json");

client.on('ready', function() {
  console.log(colors.green('[' + moment().format('LTS') + '] Kachelmann connected successfully.'));
});

client.on('message', msg => {
  if (msg.content.toLowerCase().startsWith(kachelmann.prefix + "kachelmann")) {

    var words = msg.content.split(' ');
    var city = words[1];

    console.log(colors.green('[' + moment().format('LTS') + '] Kachelmann request received.'))
    msg.channel.send('Searching info for city called **' + city + '**...')

  }
});

client.login(kachelmann.token);
