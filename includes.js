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
    }
}