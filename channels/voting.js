const { Message, Client, MessageReaction, ReactionManager } = require("discord.js");

const fse=require("fs-extra")

const { handleFileErr, getComandArray, buildHelp, deleteAndSendWarning } = require('../includes.js');
const { prefix }=require("../userconfig.json");

const commands={
    help:{
        f:(inputtedCom,message,client)=>{
            deleteAndSendWarning(message,buildHelp(commands))
        }
    }
}

/** 
* @param {Message} message 
* @param {Client} client 
*/
function isCommand(message,client){
    const inputtedCom=getComandArray(message.content)
    
    if(!inputtedCom)
    return false;
    
    const path="./proposals/"+message.author.id;

    if(typeof commands[inputtedCom[0]] == "object" && typeof commands[inputtedCom[0]].f == "function"){
        commands[inputtedCom[0]].f(inputtedCom,message,client);
        return true;
    }

    return false;
}

/** 
* @param {Message | MessageReaction} message 
* @param {Client} client 
*/
module.exports=(param1,client)=>{
    if(param1?.constructor?.name=="Message")
    message(param1,client)
    else if(param1?.constructor?.name=="MessageReaction")
    reaction(param1,client)
}

/**
 * 
 * @param {Message} message 
 * @param {Client} client 
 * @returns 
 */
function message(message,client){
    if(isCommand(message,client))
    return;

    deleteAndSendWarning(message,message.author.toString()+" ¡No puedes enviar mensajes ni nada por aqui!")
}

const voteEmoji="💖";

/**
 * 
 * @param {MessageReaction} reaction 
 * @param {Client} client 
 */
function reaction(reaction,client){
    if(reaction.emoji.name!=voteEmoji)
    return reaction.remove()
}