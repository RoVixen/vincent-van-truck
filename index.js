const { token, clientId, channelsFiles } = require('./config.json');
const { prefix } = require('./userconfig.json');
const { Client, Intents, Permissions } = require('discord.js');
const commands=require("./commands.js");
const { getComandArray } = require('./includes');

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

    //filtra mensajes mandados en el canal de upload channel
    const filteredChan=Object.entries(require("./userconfig.json").channels).filter(([name,chanid])=>message.channel.id==chanid);
    if(filteredChan.length>0)
    return require(channelsFiles[filteredChan[0][0]])(message,client);

    //los comandos deben mandarse con el prefijo
    const inputtedCom=getComandArray(message.content);
    if(!inputtedCom)
    return;
    
    if(typeof commands[inputtedCom[0]] != "object")
    return;
    
    if(typeof commands[inputtedCom[0]].f != "function")
    return;

    //ahora si empieza

    commands[inputtedCom[0]].f(inputtedCom,message,client);
});

client.login(token);