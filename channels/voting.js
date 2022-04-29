const { Message, Client, MessageReaction, ReactionManager } = require("discord.js");

const fse=require("fs-extra")

const { handleFileErr, getComandArray, buildHelp, deleteAndSendWarning, addVote, updateVotesText, removeVote, sendWarning } = require('../includes.js');
const { prefix, voteEmoji }=require("../userconfig.json");

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
module.exports=(param1,client,user,action)=>{

    if(param1?.constructor?.name=="Message")
    message(param1,client,user)
    else if(param1?.constructor?.name=="MessageReaction"){
        if(action=="add")
        reaction(param1,client,user)
        else if(action=="remove")
        reactionRemove(param1,client,user)
    }
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

    const userconfig=fse.readJsonSync("./userconfig.json");
    
    if(userconfig.status!="votacion")
    return deleteAndSendWarning(message,"¡No estamos en votaciones!")

    deleteAndSendWarning(message,message.author.toString()+" ¡No puedes enviar mensajes ni nada por aqui!")
}

/**
 * 
 * @param {MessageReaction} reaction 
 * @param {Client} client 
 */
function reaction(reaction,client,user){
    //si es el propio bot
    if(user.id==client.user.id)
    return;

    const votesObject=fse.readJsonSync("./votes.json");
    
    //si las votaciones estan cerradas
    if(!votesObject.status){
        //sendWarning(reaction.message.channel,"Las votaciones aun no estan abiertas",6);
        return reaction.users.remove(user);
    }
    
    const userconfig=fse.readJsonSync("./userconfig.json");

    //si no estamos en votaciones
    if(userconfig.status!="votacion"){
        //sendWarning(reaction.message.channel,"No estamos en votacion",6);
        return reaction.users.remove(user)
    }
    
    //si el emoji a reaccionar no es el de votar
    if(reaction.emoji.name!=voteEmoji){
        //sendWarning(reaction.message.channel,"No puedes reaccionar con ese emoji",6);
        return reaction.remove()
    }
    
    let parsedMes=reaction.message.nonce.split(":");
    
    //si es que se reacciono a un mensaje que no es de participante para votar
    if(parsedMes[0]!="v")
    return reaction.remove()

    const voteFor=parsedMes[1];

    //si es que se pudo agregar el voto
    if(!addVote(user.id,voteFor,false))
    return reaction.users.remove(user)

    updateVotesText(client);
}

/**
 * 
 * @param {MessageReaction} reaction 
 * @param {Client} client 
 */
function reactionRemove(reaction,client,user){
    //si es el propio bot
    if(reaction.emoji.name!=voteEmoji)
    return;
    
    const userconfig=fse.readJsonSync("./userconfig.json");

    //si no estamos en votaciones
    if(userconfig.status!="votacion")
    return;

    const votesObject=fse.readJsonSync("./votes.json");
    
    //si las votaciones estan cerradas
    if(!votesObject.status)
    return;

    let parsedMes=reaction.message.nonce.split(":");
    
    //si no es un mensaje de participante de votacion
    if(parsedMes[0]!="v")
    return;

    const voteFor=parsedMes[1];

    if(!removeVote(user.id,voteFor,false))
    return;

    updateVotesText(client);
}