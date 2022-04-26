const { token,clientId } = require('./config.json');
const { prefix } = require('./userconfig.json');
const { Client, Intents, Permissions } = require('discord.js');
const commands=require("./commands.js");

const client = new Client({ intents: [
	Intents.FLAGS.GUILDS,
	Intents.FLAGS.GUILD_MESSAGES,
	Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
	Intents.FLAGS.DIRECT_MESSAGES,
	Intents.FLAGS.DIRECT_MESSAGE_REACTIONS
]});

client.on('ready', () => {
    console.log("Running")
    client.user.setPresence({ activities: [{ name: prefix+'help' }], status:'online' });
});

client.on("messageCreate",(message)=>{

    if(message.author.id==clientId)
    return;

    if(message.channel.id==require("./userconfig.json").uploadChannel)
    require("./checkforuploads.js")(message,client);

    //commands must be sent with #
    if(message.content[0]!=prefix)
    return;

    const inputtedCom=message.content.slice(1).split(" ").filter(s=>s);
    
    if(typeof commands[inputtedCom[0]] != "object")
    return;
    
    if(typeof commands[inputtedCom[0]].f != "function")
    return;

    //ahora si empieza

    commands[inputtedCom[0]].f(inputtedCom,message,client);
});

client.login(token);