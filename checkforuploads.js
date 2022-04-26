const fs=require("fs")

module.exports=(message,client)=>{
    if(!fs.existsSync("./proposals/"+message.author.id))
    return ;

    if(message.attachments.size){

        fs.readdir("./proposals/"+message.author.id,(err,names)=>{
            message.reply(names.join(", ") || "no hay fotos");
        })
    }
}