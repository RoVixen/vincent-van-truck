const fse=require("fs-extra")
const { handleFileErr, buildHelp } = require('./includes.js');

const { adminRole } = require('./config.json');
const { prefix } = require('./userconfig.json');
const { Message, Client } = require("discord.js");

const commands={
    help:{
        /**
         * 
         * @param {Array} inputtedCom 
         * @param {Message} message 
         * @param {Client} client 
         */
        f:(inputtedCom,message,client)=>{
            message.channel.send(buildHelp(commands))
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
            
            let userconfig = require("./userconfig.json");
            if(inputtedCom.length==1){
                let answer="Estos son los canales del concurso:\n";
                Object.entries(userconfig.channels).forEach(([configName,chanId])=>{
                    let foundName=null;
                    message.guild.channels.cache.forEach(chan=>{
                        if(chanId==chan.id)foundName=chan.toString()
                    })
                    answer+="\n"+configName+": "+(foundName||"No configurado");
                })
                message.reply(answer);
            }
            else if(inputtedCom.length==2){
                
                if(userconfig.channels[inputtedCom[1]]===undefined)
                return message.channel.send("No existe canal configurable "+inputtedCom[1]+", los canales configurables son:\n"
                    +Object.entries(userconfig.channels).reduce((prev,[nombre,codigo])=>{
                        return prev+"    "+nombre+"\n"
                    },"")
                )
                
                if(userconfig.channels[inputtedCom[1]]===null)
                return message.channel.send("No hay canal configurado para \""+inputtedCom[1]+"\", puedes configurar uno usando "+prefix+"canal "+userconfig.channels[inputtedCom[1]]+" nombre-del-canal")

                client.channels.fetch(userconfig.channels[inputtedCom[1]])
                .then(channel=>message.reply("El canal \""+inputtedCom[1]+"\" esta configurado en "+channel.toString()))
                return;
            }
            else if(inputtedCom.length==3){
                if(!message.member.roles.cache.some(r=>r.name==adminRole))
                return message.reply("No puedes establecer un canal, no eres administrador");

                if(userconfig.channels[inputtedCom[1]]===undefined)
                return message.channel.send("No existe canal configurable "+inputtedCom[1]+", los canales configurables son:\n"
                    +Object.entries(userconfig.channels).reduce((prev,[nombre,codigo])=>{
                        return prev+"    "+nombre+"\n"
                    },"")
                )
                
                const catchedChannels=message.guild.channels.cache.filter(channel=>channel.name==inputtedCom[2]);
                if(catchedChannels.size==0)
                return message.channel.send("Escribe el nombre de un canal que exista");
                
                if(catchedChannels.size>1)
                return message.channel.send("Por alguna extraña razon se encontraron mas de 1 canal con ese mismo nombre, no entendí");

                const path="./userconfig.json";
                userconfig.channels[inputtedCom[1]]=catchedChannels.at(0).id;
                fse.writeJSON(path,userconfig)
                .catch(handleFileErr)
                .then(()=>message.reply("Canal \""+inputtedCom[1]+"\" configurado a "+catchedChannels.at(0).toString()))
            }
        }
    }
}

module.exports=commands;