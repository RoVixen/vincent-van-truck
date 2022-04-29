const fse=require("fs-extra")
const { handleFileErr, buildHelp, isAdmin, getVotesText, getVotesPollText } = require('./includes.js');

const { adminRole } = require('./config.json');
const { prefix, voteEmoji } = require('./userconfig.json');
const { Message, Client, TextChannel } = require("discord.js");

/**
 * 
 * @param {string} nombre 
 * @param {Message} message
 * @param {Client} client 
 * @param {boolean} abrir
 * @returns {TextChannel}
 */
function abrirCerrarCanal(nombre,message,client,abrir){
    if(!nombre)
    return message.reply("Debes ingresar un canal del concurso, ya \"inscripcion\", \"subida\" o \"votacion\"");

    const userconfig=fse.readJsonSync("./userconfig.json");
    const chanid=userconfig.channels[nombre];

    if(!chanid)
    return message.reply(`"${nombre}" no es un canal configurable`)

    const canal=client.channels.cache.get(chanid);

    if(typeof abrir == "boolean")
    canal.permissionOverwrites.create(
        (canal.id==userconfig.channels.subida?
            canal.guild.roles.cache.get(userconfig.participantRole):
            canal.guild.roles.everyone
        )
    ,{VIEW_CHANNEL:abrir});
    
    return canal;
}

/**
 * 
 * @param {string} nombre 
 * @param {Message} message
 * @param {Client} client 
 * @returns {boolean}
 */
 function setStatus(nombre,message,client){
    let userconfig=fse.readJsonSync("./userconfig.json")

    if(!isAdmin(message.member))
    return message.reply("No eres administrador");
    
    if(nombre=="none"){
        abrirCerrarCanal(userconfig.status,message,client,false)
        userconfig.status=null;
        fse.writeJSONSync("./userconfig.json",userconfig);
        return message.reply("Status configurado en none");
    }
    
    const possibleStatus=Object.getOwnPropertyNames(userconfig.channels);
    if(!possibleStatus.find((posSta)=>posSta==nombre))
    return message.reply("\""+nombre+"\" no es un status valido")
    
    Object.entries(userconfig.channels).forEach(([chanName,chanId])=>{
        if(chanName!=nombre)
        abrirCerrarCanal(chanName,message,client,false)
    })
    
    if(!abrirCerrarCanal(nombre,message,client,true))
    return;

    userconfig.status=nombre
    fse.writeJSONSync("./userconfig.json",userconfig);
    return message.reply("Status configurado en "+nombre);
 }

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
                //filtrando que exista
                if(catchedChannels.size==0)
                return message.channel.send("Escribe el nombre de un canal que exista");
                
                //filtrando que no hallan varios canales llamados igual
                if(catchedChannels.size>1)
                return message.channel.send("Por alguna extraña razon se encontraron mas de 1 canal con ese mismo nombre, no entendí");

                //guardando
                userconfig.channels[inputtedCom[1]]=catchedChannels.at(0).id;
                fse.writeJSON("./userconfig.json",userconfig)
                message.channel.send("Canal \""+inputtedCom[1]+"\" configurado a "+catchedChannels.at(0).toString())

                //el canal de subida siempre tiene que ser privado para todos
                if(inputtedCom[1]=="subida"){
                    catchedChannels.at(0).permissionOverwrites.edit(message.guild.roles.everyone,{VIEW_CHANNEL:false});

                    //y solo visible para los participantes
                    if(userconfig.participantRole)
                    catchedChannels.at(0).permissionOverwrites.edit(message.guild.roles.cache.get(userconfig.participantRole),{VIEW_CHANNEL:true});
                }

            }
        }
    },
    setpartrole:{
        /**
         * 
         * @param {Array} inputtedCom 
         * @param {Message} message 
         * @param {Client} client 
        */
        f:(inputtedCom,message,client)=>{
            if(!isAdmin(message.member))
            return message.reply("No eres administrador");
            
            if(inputtedCom.length==1)
            return message.reply("Debes ingresar el nombre de un rol")

            const roleFound=message.guild.roles.cache.filter(role=>role.name==inputtedCom[1]).at(0);

            if(!roleFound)
            return message.reply("¡Ese rol no existe!")

            let userconfig=fse.readJSONSync("./userconfig.json")
            userconfig.participantRole=roleFound.id;
            
            message.reply("Se ha configurado el rol de participantes como <@&"+roleFound.id+">");
            
            if(userconfig.channels.subida){
                message.guild.channels.cache.get(userconfig.channels.subida).permissionOverwrites.edit(roleFound,{VIEW_CHANNEL:true});
            }
            //else message.reply("Si deseas trabajar menos, puedes configurar primero el canal de subida, para asi yo poder asignar directamente la visibilidad de el canal de \"subida\" a "+roleFound.toString())
            
            fse.writeJSONSync("./userconfig.json",userconfig);
        }
    },
    abrircanal:{
        f:(inputtedCom,message,client)=>{
            abrirCerrarCanal(inputtedCom[1],message,client,true)
        }
    },
    cerrarcanal:{
        f:(inputtedCom,message,client)=>{
            abrirCerrarCanal(inputtedCom[1],message,client,false)
        }
    },
    status:{
        /**
         * 
         * @param {Array} inputtedCom 
         * @param {Message} message 
         * @param {Client} client 
        */
        f:(inputtedCom,message,client)=>{
            let userconfig=fse.readJsonSync("./userconfig.json");
            
            if(inputtedCom.length==1)
            return message.reply("Status actual: "+(userconfig.status||"none"));
            
            if(inputtedCom.length==2){
                setStatus(inputtedCom[1],message,client);
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
            
            const userconfig=fse.readJsonSync("./userconfig.json");
            
            if(userconfig.status!="votacion")
            setStatus("votacion",message,client);
            
            const chanId=userconfig?.channels?.votacion;

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
                    total:0,
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

            message.guild.channels.fetch(userconfig.channels.votacion)
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
    },
    terminarvot:{
        /**
         * 
         * @param {Array} inputtedCom 
         * @param {Message} message 
         * @param {Client} client 
        */
        f:(inputtedCom,message,client)=>{
            if(!isAdmin(message.member))
            return message.reply("No eres administrador");

            let votesObject=fse.readJsonSync("./votes.json");
            let userconfig=fse.readJsonSync("./userconfig.json");

            const pollText=getVotesPollText(votesObject);
            let resultText=
                "Las votaciones terminaron, el ganador es: "+pollText.split("\n")[0].split(":")[0]+"\n\n"+
                pollText+
                "\nTotal de votos "+votesObject.total
            ;
            
            client.channels.cache.get(userconfig.channels.votacion).messages.fetch(votesObject.pollMessage)
            .then((pollmes)=>{
                pollmes.edit(resultText)
            })
            
            votesObject.status=false;
            fse.writeJSONSync("./votes.json",votesObject);
        }
    }
}

module.exports=commands;