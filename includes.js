const { Message, Client, GuildMember, Role } = require("discord.js");
const fse = require("fs-extra");

const {adminRole} = require("./config.json")
const {prefix} = require("./userconfig.json")

const exportFuncs={
    handleFileErr:(e)=>{

    },
    /**
     * 
     * @param {string} messageContent 
     * @returns {Array | false} Array if string starts with prefix, else returns false
     */
    getComandArray:(messageContent)=>{
        if(messageContent[0]!=prefix)
        return false;

        return messageContent.slice(1).split(" ").filter(s=>s);
    },
    /**
     * 
     * @param {Message} message 
     * @param commands The commands object
     * @returns {string}
     */
    buildHelp:(commands)=>{
        let mensaje="";
        Object.entries(commands).forEach(([nombre])=>{
            mensaje+=prefix+nombre+" \n";
        });
        return mensaje;
    },
    /**
     * 
     * @param {Message} messageToDel
     * @param {string} warning 
     * @param {integer} delayInSseconds
     */
    deleteAndSendWarning:(messageToDel,warning,delayInSseconds=16)=>{
        messageToDel.delete()
        .then(()=>messageToDel.channel.send(warning))
        .then((warningSent)=>{
            setTimeout(()=>{
                warningSent.delete();
            },delayInSseconds*1000)
        })
    },
    /**
     * 
     * @param {GuildMember} member 
     * @param {Role | string | integer} member Puedes ingresar el rol mismo, el nombre o la id del rol de admin
     * @returns {boolean}
     */
    isAdmin:(member)=>{
        if(typeof adminRole == "string")
        return member.roles.cache.some(r=>r.name==adminRole)
        
        if(typeof adminRole == "number")
        return member.roles.cache.some(r=>r.id==adminRole)
        
        if(adminRole?.constructor?.name == "Role")
        return member.roles.cache.some(r=>r.id==adminRole.id)
    },
    /**
     * 
     * @returns {string}
     */
    getVotesText:()=>{
        const votesObject = require("./votes.json");
        let voteText="Estos son Los totales de los conteos de votos:\n\n"

        Object.entries(votesObject.votes).sort((a,b)=>{
            return a[1].votedUsers.length - b[1].votedUsers.length
        })
        .forEach(([userId,voteObj])=>{
            voteText+="<@"+userId+"> : "+voteObj.votedUsers.length+" Votos \n"
        })

        return voteText+"\n\n";
    },
    /**
     * 
     * @param {Client} client 
     */
    updateVotesText:(client)=>{
        client.channels.cache.get(require("./userconfig.json").channels.votacion).messages.fetch(require("./votes.json").pollMessage.toString())
        .then((pollMessage)=>{
            
            console.log(pollMessage.constructor.name);
        })
    },
    /**
     * 
     * @param {integer | string} voterId 
     * @returns {boolean}
     */
    checkIfVoted:(voterId)=>{
        let votesObject=require("./votes.json");

        return Object.entries(votesObject.votes).some(([participant,data])=>{
            return data.votedUsers.some((voter)=>voter==voterId)
        })
    },
    participantExists:(participant)=>{
        return (typeof require("./votes.json").votes[participant]=="object")
    },
    /**
     * 
     * @param {integer | string} voterId 
     * @param {integer | string} forId 
     * @param {boolean} updateText No hace nada, tendria sentido usarla si pudiera acceder globalmente a la variable cliente (y no voy a pasar el cliente entre todas las funciones anidadads)
     */
    addVote:(voterId,forId,updateText=false)=>{
        let votesObject=require("./votes.json");
        
        console.log(this);
        if(exportFuncs.checkIfVoted(voterId))
        return false;

        if(!exportFuncs.participantExists(forId))
        throw new Error("the participant doesnt exists");

        votesObject.votes[forId].votedUsers.push(voterId);

        fse.writeJSON("./votes.json",votesObject);

        //la variable de el cliente deveria ser global, para evitar este tipo de cosas
        //if(updateText)
        //exportFuncs.updateVotesText(notWayToGetClientGlobally);
        
        return true;
    }
}

module.exports=exportFuncs;