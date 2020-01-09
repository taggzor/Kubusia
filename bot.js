const Discord = require("discord.js");
const client = new Discord.Client();
const yts = require('yt-search');
const ytplayer = require("yt-player");
const YTDL = require("ytdl-core");

var prefix = ".";
let servers = {};




function play(conn,msg){
    var server = servers[parseInt(msg.guild.id)];
    server.dispatcher = conn.playStream(YTDL(server.queue[0], {filter: "audioonly"}));

    server.queue.shift();
    server.dispatcher.on("end",function(){
        if(server.queue[0]) play(conn,msg);
        else conn.disconnect();
    })
}

client.on("ready", function(){
    console.log("Dziala na ".client.guild.size);
})

//const player = new ytplayer(yttoken);
client.on("message", function(msg){
    if(!msg.content.startsWith(prefix))return;
    let command = msg.content.split(" ")[0].replace(prefix, "").toLowerCase();
    let args = msg.content.split(" ").slice(1);
    
    if(command=="elo"){
        msg.channel.send("No elo");
    }
    if(command=="play"){
        
        if(!msg.member.voiceChannelID){
            msg.channel.send("Musisz dołączyć do kanału głosowego");
            return;
        }

        if(!args[0]){
            msg.channel.send("Kurwa play co?");
            return;
        }
        var gildia=parseInt(msg.guild.id);
        if(!servers[gildia]){
            servers[gildia] = {
                queue: []
            };
        }
        var server = servers[parseInt(msg.guild.id)];
        if(!server.queue[0])server.queue.push("https://www.youtube.com/watch?v=Vbks4abvLEw");
        if(!args[0].startsWith("https://www.y")){
            
            yts(args.join(" "),function(err,r){
                const video = r.videos 
                args[0]=String(video[0].url);
                server.queue.push(args[0]);
            });
        }

        
        if(args[0].startsWith("https://www.y")) server.queue.push(args[0]);
        
        if(!msg.guild.voiceConnection){
            msg.member.voiceChannel.join()
            .then(function(conn){
                play(conn,msg);
            })
        }
    }
    if(command=="skip"){
        var server = servers[parseInt(msg.guild.id)];
        if(server.dispatcher) server.dispatcher.end();
    }
    if(command=="stop"){
        var server = servers[parseInt(msg.guild.id)];
        server.queue = [];
        console.log(server.queue[0]);
        if(msg.guild.voiceConnection)msg.guild.voiceConnection.disconnect();
    }

});




client.login(process.env.TOKEN);