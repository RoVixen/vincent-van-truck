const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

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
    .then((warningSent)=>{
        setTimeout(()=>{
            warningSent.delete();
        },16*1000)
    })
}

/**
 * 
 * @param {string} url 
 * @param {string} path 
 * @param {string} filename
 * @param {string | null} extension 
 */
function fetchToSave(url,folderPath){
    fetch(url)
    .catch(err=>console.log(err))
    .then(res=>{
        const dest=fse.createWriteStream(folderPath)
        res.body.pipe(dest)
        dest.on("error",err=>console.log(err))
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

        //Revisa que no halla enviado algo que no hallan sido un archivo
        if(message.attachments.size==0 || message.attachments.some(attachment=>attachment.contentType.split("/")[0]!="image"))
        return deleteAndSendWarning(message,"Disculpa "+message.author.toString()+", este canal es solo para imagenes")

        /*
        fetch(message.attachments.at(0).url)
        .then(res=>{
            res.body.pipe(fse.createWriteStream(path+"/semen.png"))
        })
        */

        
    })
}