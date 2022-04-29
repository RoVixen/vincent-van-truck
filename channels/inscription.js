const { Message, Client } = require("discord.js");

const fse=require("fs-extra")

const { handleFileErr, getComandArray, buildHelp, deleteAndSendWarning } = require('../includes.js');
const { prefix,status }=require("../userconfig.json");

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
                .then(()=>{
                    deleteAndSendWarning(message,message.author.toString()+" ¡Te has inscrito al concurso correctamente!")
                    
                    const participantRole=fse.readJsonSync("./userconfig.json").participantRole;
                    if(participantRole)message.member.roles.add(participantRole);
                })
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
                .then(()=>{
                    const participantRole=fse.readJsonSync("./userconfig.json").participantRole;
                    if(participantRole)message.member.roles.remove(participantRole)
                    
                    deleteAndSendWarning(message,message.author.toString()+" Ya no estás participando en el concurso 😢")
                })
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

    if(status!="inscripcion")
    return deleteAndSendWarning(message,"¡No estamos en inscripciones!")

    if(isCommand(message,client))
    return;

    deleteAndSendWarning(message,message.author.toString()+" ¡No puedes enviar mensajes por aqui! Solo los comandos de inscripcion "+
    "($inscribirme o $desinscribirme)")
}