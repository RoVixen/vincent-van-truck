const { Message, Client } = require("discord.js");

const {} = require("./config.json")
const {prefix} = require("./userconfig.json")

module.exports={
    handleFileErr:(e)=>{

    },
    /**
     * 
     * @param {string} messageContent 
     * @returns Array if string starts with prefix, else returns false
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
    }
}