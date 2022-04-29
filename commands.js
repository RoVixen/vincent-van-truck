const fse=require("fs-extra")
const { handleFileErr, buildHelp, isAdmin, getVotesText } = require('./includes.js');

const { adminRole } = require('./config.json');
const { prefix, voteEmoji } = require('./userconfig.json');
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
                message.channel.send(answer);
            }
            else if(inputtedCom.length==2){
                
                if(userconfig.channels[inputtedCom[1]]===undefined)
                return message.channel.send("No existe canal configurable "+inputtedCom[1]+", los canales configurables son:\n"
                    +Object.entries(userconfig.channels).reduce((prev,[nombre,codigo])=>{
                        return prev+"    "+nombre+"\n"
                    },"")
                )
                
                if(userconfig.channels[inputtedCom[1]]===null)
                return message.channel.send("No hay canal configurado para \""+inputtedCom[1]+"\", puedes configurar uno usando "+prefix+"canal "+inputtedCom[1]+" nombre-del-canal (solo si eres administrador)")

                client.channels.fetch(userconfig.channels[inputtedCom[1]])
                .then(channel=>message.channel.send("El canal \""+inputtedCom[1]+"\" esta configurado en "+channel.toString()))
                return;
            }
            else if(inputtedCom.length==3){
                if(!isAdmin(message.member))
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
                .then(()=>message.channel.send("Canal \""+inputtedCom[1]+"\" configurado a "+catchedChannels.at(0).toString()))
            }
        }
    },
    abrirvot:{
        /**
         * 
         * @param {Array} inputtedCom 
         * @param {Message} message 
         * @param {Client} client 
        */
        f:(inputtedCom,message,client)=>{
            //chequea si el usuario es admin
            if(!isAdmin(message.member))
            return message.reply("No eres administrador");

            const chanId=require("./userconfig.json")?.channels?.votacion;

            if(!chanId)
            return message.reply("El canal de votaciones no esta configurado");

            /**
             * @returns {object}
            */
            function makeJsonVotesFile(){
                const participants=fse.readdirSync("./proposals");
                let votesObject={
                    status:true,
                    pollMessage:null,
                    votes:{}
                };

                participants.forEach((userId)=>{
                    const picnum=fse.readdirSync("./proposals/"+userId).length;
                    if(picnum==0)return;

                    votesObject.votes[userId]={
                        picnum,
                        votedUsers:[]
                    }
                });

                fse.outputJsonSync("./votes.json",votesObject);
                return votesObject;
            }

            message.guild.channels.fetch(require("./userconfig.json").channels.votacion)
            .catch(err=>console.log(err))
            .then((channel)=>{
                //comienza el codigo

                //hacer el archivo de conteo de votos
                const currentVotes=makeJsonVotesFile(client).votes;

                //envio de los mensajes

                //poll
                channel.send({
                    content:getVotesText(),
                    nonce:"poll"
                })
                .then((pollMessage)=>{
                    let v=fse.readJSONSync("./votes.json")
                    v.pollMessage=pollMessage.id;
                    fse.writeJSONSync("./votes.json",v)
                    channel.sendTyping()
                })

                //participants
                Object.entries(currentVotes).forEach(([userId,data])=>{
                    console.log(userId)
                    channel.send({
                        content:"Propuesta de <@"+userId+">:",
                        nonce:"v:"+userId,
                        files:fse.readdirSync("./proposals/"+userId).map((filename)=>{
                            return {
                                attachment: "./proposals/"+userId+"/"+filename,
                                name: filename,
                                description: 'Propuesta #'+filename.split(".")[0]
                            }
                        })
                    })
                    .then((message)=>{
                        channel.sendTyping()
                        if(true)message.react(voteEmoji)
                    })
                })
            })
        }
    }
}

module.exports=commands;