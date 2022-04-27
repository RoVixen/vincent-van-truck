const { Message, Client } = require("discord.js");

const fse=require("fs-extra")

const { handleFileErr, getComandArray, buildHelp, deleteAndSendWarning } = require('../includes.js');
const { prefix }=require("../userconfig.json");

const commands={
    help:{
        /**
         * 
         * @param {Array} inputtedCom 
         * @param {Message} message 
         * @param {Client} client 
         */
        f:(inputtedCom,message,client)=>{
            deleteAndSendWarning(message,buildHelp(commands))
        }
    },
    inscribirme:{
        /**
         * 
         * @param {Array} inputtedCom 
         * @param {Message} message 
         * @param {Client} client 
         */
        f:(inputtedCom,message,client)=>{
            const path="./proposals/"+message.author.id;
            fse.pathExists(path)
            .then(exists=>{
                if(exists)
                return deleteAndSendWarning(message,message.author.toString()+" Ya estas inscrito en el concurso");

                fse.ensureDir(path)
                .catch(handleFileErr)
                .then(()=>{deleteAndSendWarning(message,message.author.toString()+" ¡Te has inscrito al concurso correctamente!")})
            })
            
        }
    },
    desinscribirme:{
        /**
         * 
         * @param {Array} inputtedCom 
         * @param {Message} message 
         * @param {Client} client 
         */
        f:(inputtedCom,message,client)=>{
            const path="./proposals/"+message.author.id;
        
            fse.pathExists(path)
            .catch(handleFileErr)
            .then(exists=>{
                if(!exists)
                return deleteAndSendWarning(message,message.author.toString()+" ¡Nisiquiera estás participando en el concurso!");
        
                fse.remove(path)
                .catch(handleFileErr)
                .then(()=>deleteAndSendWarning(message,message.author.toString()+" Ya no estás participando en el concurso 😢"))
            })
        }
    }
}

/**
 * 
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
 * 
 * @param {Message} message 
 * @param {Client} client 
 */
module.exports=(message,client)=>{
    if(isCommand(message,client))
    return;

    message.delete();
}