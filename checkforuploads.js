const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const Discord = require('discord.js');
const fse=require("fs-extra")

const { handleFileErr } = require('./includes.js');
const {prefix}=require("./userconfig.json");

const maxFiles=3;

/**
 * 
 * @param {Discord.Message} messageToDel 
 * @param {string} warning 
 */
function deleteAndSendWarning(messageToDel,warning){
    messageToDel.delete()
    .then(()=>messageToDel.channel.send(warning))
    .then((warningSent)=>{
        setTimeout(()=>{
            warningSent.delete();
        },16*1000)
    })
}

/**
 * 
 * @param {string} url 
 * @param {string} path 
 */
function fetchToSave(url,path){
    return new Promise((resolve,reject)=>{
        fetch(url)
        .catch(err=>console.log(err))
        .then(res=>{
            const dest=fse.createWriteStream(path)
            res.body.pipe(dest)
            res.body.on("end",()=>resolve())
            dest.on("error",err=>reject(err))
        })
    })
}

/**
 * 
 * @param {Discord.Message} message 
 * @param {Discord.Client} client 
 */
function isCommand(message,client){
    if(message.content[0]!=prefix)
    return false;
    
    const inputtedCom=message.content.slice(1).split(" ").filter(s=>s);
    
    const path="./proposals/"+message.author.id;

    switch(inputtedCom[0]){
        default:
            return false;
        break;
        case "mipropuesta":
            const userFiles=fse.readdirSync(path);
            if(userFiles.length==0)
            return deleteAndSendWarning(message,"Tu propuesta esta vacia")

            message.channel.sendTyping()

            message.channel.send({
                content: message.author.toString()+" Esta es tu propuesta, te la enseño solo por un minuto",
                files: userFiles.map((filename)=>{
                    return {
                        attachment: path+"/"+filename,
                        name: filename,
                        description: 'Propuesta #'+filename.split(".")[0]
                    }
                })
            })
            .then((propuesta)=>{
                message.delete()
                setTimeout(()=>{
                    propuesta.delete()
                },60*1000)
            })
        break;
        case "eliminarpropuesta":
            fse.emptyDir(path)
            deleteAndSendWarning(message,message.author.toString()+" he eliminado las imagenes que subiste, supongo que te equivocaste, puedes volver a subirlas")
        break;
    }

    return true;
}

/**
 * 
 * @param {Discord.Message} message 
 * @param {Discord.Client} client 
 */
module.exports=(message,client)=>{

    //revisa que el usario este participando
    const path="./proposals/"+message.author.id;
    if(!fse.pathExistsSync(path))
    return deleteAndSendWarning(message,message.author.toString()+" Tu no estas participando, no puedes enviar cosas aquí")
    
    //si es un comando, entonces ejecuta el comando y retorna
    if(isCommand(message,client))
    return;

    //Revisa que no halla enviado algo que no hallan sido un archivo
    if(message.attachments.size==0 || message.attachments.some(attachment=>attachment.contentType.split("/")[0]!="image"))
    return deleteAndSendWarning(message,"Disculpa "+message.author.toString()+", este canal es solo para imagenes (tambien puedes mandar los comandos "+prefix+"mipropuesta y "+prefix+"eliminarpropuesta)")

    let filesNumber=fse.readdirSync(path).length;
    let filesLeft=(maxFiles-filesNumber);

    if(filesLeft<=0)
    return deleteAndSendWarning(message,"Ya subiste todas las imagenes que podias subir");

    let filePromises=[];

    let ind=0;
    message.attachments.forEach((val,key)=>{
        if(ind>maxFiles)
        return;

        filePromises.push(
            fetchToSave(val.url,path+"/"+(filesNumber+ind)+"."+val.contentType.split("/")[1])
        );

        ind++;
    })

    //si se subieron archivos, cuando todos terminen de subirse
    //avisa de el mensaje de subida
    if(filePromises.length>0)
    Promise.all(filePromises)
    .then(()=>{
        let nowFiles=fse.readdirSync(path)
        
        if(nowFiles.length<maxFiles)
        return message.reply("Tienes "+nowFiles.length+" imagenes almacenadas, te quedan "+(maxFiles-nowFiles.length)+" para subir");

        return message.reply("¡Exito! ya tus "+maxFiles+" imagenes estan subidas")
    })
}