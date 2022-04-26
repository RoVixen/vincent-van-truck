const fs=require("fs");
const fse=require("fs-extra")
const { adminRole } = require('./config.json');

function handleFileErr(e){

}

const commdans={
    help:{
        f:(inputtedCom,message,client)=>{
            let mensaje="";
            Object.entries(commdans).forEach(([nombre])=>{
                mensaje+="#"+nombre+" \n";
            });
            
            message.channel.send(mensaje);
        }
    },
    inscribirme:{
        f:(inputtedCom,message,client)=>{
            if(!fs.existsSync("./proposals/"+message.author.id)){
                fs.mkdir("./proposals/"+message.author.id,(err)=>{});
                message.reply("¡Te has inscrito al concurso correctamente!");
            }
            else
            message.reply("Ya estas inscrito en el concurso");
        }
    },
    desinscribirme:{
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
            
            /*
            if(fs.existsSync("./proposals/"+message.author.id)){
                
                let deletedir=true;
                fs.readdir("./proposals/"+message.author.id,(err,names)=>{
                    names
                    names.forEach(name=>{
                        fs.unlink("./proposals/"+message.author.id+"/"+name,(err)=>{
                            if(err)return console.log(err)
                            fs.rmdir("./proposals/"+message.author.id,(err)=>{if(err)console.log(err)})
                            deletedir=false;
                        })
                    }) 
                });

                if(deletedir)
                fs.rmdir("./proposals/"+message.author.id,(err)=>{if(err)console.log(err)});

                message.reply("Ya no estas participando en el concurso 😢");
            }
            */
        }
    },
    canal:{
        f:(inputtedCom,message,client)=>{
            if(!message.member.roles.cache.some(r=>r.name==adminRole))
            return message.delete();

            const catchedChannels=message.guild.channels.cache.filter(channel=>channel.name==inputtedCom[1]);

            if(catchedChannels.size==0)
            return message.reply("Escribe el nombre de un canal que exista");
            
            if(catchedChannels.size>1)
            return message.reply("Por alguna extraña razon se encontraron mas de 1 canal con ese mismo nombre, no entendi");

            let userConfig={};
            fs.readFile("./userconfig.json",(err,data)=>{
                if(err)return console.log(err)
                
                userConfig=JSON.parse(data.toString());

                if(Object.entries(userConfig) && inputtedCom[1]){

                    userConfig.uploadChannel=catchedChannels.at(0).id;

                    fs.writeFile("./userconfig.json",JSON.stringify(userConfig),(err)=>{
                        if(err)console.log(err)
                    })
                }
            });

            Object.entries(userConfig)

            message.reply("Canal de subidas cambiado a "+catchedChannels.at(0).toString());
        }
    }
}

module.exports=commdans;