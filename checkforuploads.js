const Discord = require('discord.js');
const fse=require("fs-extra")

const { handleFileErr } = require('./includes.js');

/**
 * 
 * @param {Discord.Message} messageToDel 
 * @param {string} warning 
 */
function deleteAndSendWarning(messageToDel,warning){
    messageToDel.delete()
    .then(()=>messageToDel.channel.send(warning))
    .then((sentMessage)=>{
        setTimeout(()=>{
            sentMessage.delete();
        },16*1000)
    })
}

/**
 * 
 * @param {Discord.Message} message 
 * @param {Discord.Client} client 
 */
module.exports=(message,client)=>{

    const path="./proposals/"+message.author.id;

    fse.pathExists(path)
    .catch(handleFileErr)
    .then(exists=>{

        //revisa que el concursante este participando
        if(!exists)
        return deleteAndSendWarning(message,message.author.toString()+" Tu no estas participando, no puedes enviar cosas aquí")

        if(message.attachments.size==0 || message.attachments.some(attachment=>attachment.contentType.split("/")[0]!="image"))
        return deleteAndSendWarning(message,"Disculpa "+message.author.toString()+", este canal es solo para imagenes")

        console.log(message.attachments.at(0))
    })
}