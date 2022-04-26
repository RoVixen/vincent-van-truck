import Discord from "discord.js";
const fse=require("fs-extra")

const { handleFileErr } = require('./includes.js');

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
        if(!exists){
            message.delete();

        }
    })

    if(message.attachments.size){

        fs.readdir("./proposals/"+message.author.id,(err,names)=>{
            message.reply(names.join(", ") || "no hay fotos");
        })
    }
}