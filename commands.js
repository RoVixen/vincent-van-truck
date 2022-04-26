const fse=require("fs-extra")
const { handleFileErr } = require('./includes.js');

const { adminRole } = require('./config.json');
const { prefix } = require('./userconfig.json');
const { Message, Client } = require("discord.js");

const commdans={
    help:{
        /**
         * 
         * @param {Array} inputtedCom 
         * @param {Message} message 
         * @param {Client} client 
         */
        f:(inputtedCom,message,client)=>{
            let mensaje="";
            Object.entries(commdans).forEach(([nombre])=>{
                mensaje+=prefix+nombre+" \n";
            });
            
            message.channel.send(mensaje);
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
                return message.reply("Ya estas inscrito en el concurso");

                fse.ensureDir(path)
                .catch(handleFileErr)
                .then(()=>{message.reply("¡Te has inscrito al concurso correctamente!")})
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
                return message.reply("¡Nisiquiera estas participando en el concurso!");
        
                fse.remove(path)
                .catch(handleFileErr)
                .then(()=>message.reply("Ya no estas participando en el concurso 😢"))
            })
        }
    },
    canal:{
        /**
         * 
         * @param {Array} inputtedCom 
         * @param {Message} message 
         * @param {Client} client 
         */
        f:(inputtedCom,message,client)=>{

            if(inputtedCom.length==1){

                const {uploadChannel} = require("./userconfig.json");
                client.channels.fetch(uploadChannel)
                .then(channel=>message.reply("El canal de subida de tus resultados es "+channel.toString()))
                
                return;
            }
            
            if(!message.member.roles.cache.some(r=>r.name==adminRole))
            return message.delete();

            const catchedChannels=message.guild.channels.cache.filter(channel=>channel.name==inputtedCom[1]);

            if(catchedChannels.size==0)
            return message.reply("Escribe el nombre de un canal que exista");
            
            if(catchedChannels.size>1)
            return message.reply("Por alguna extraña razon se encontraron mas de 1 canal con ese mismo nombre, no entendi");

            const path="./userconfig.json";
            fse.readJson(path)
            .catch(handleFileErr)
            .then((config)=>{
                config.uploadChannel=catchedChannels.at(0).id;
                fse.writeJSON(path,config)
                .catch(handleFileErr)
                .then(()=>message.reply("Canal de subidas cambiado a "+catchedChannels.at(0).toString()))
            })
        }
    }
}

module.exports=commdans;