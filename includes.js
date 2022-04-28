const { Message, Client, GuildMember, Role } = require("discord.js");
const fse = require("fs-extra");

const {adminRole} = require("./config.json")
const {prefix} = require("./userconfig.json")

module.exports={
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
    }
}