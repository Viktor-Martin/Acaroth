module.exports = {
    name: 'help',
    description: 'Lists the available commands and their respective functions.',
    execute(Discord, message, Acaroth, msgArr, punishmentData, cmdArr){
        async function blah(){
            let cmdName = cmdArr[0];
                cmdName.shift();
            let cmdDesc = cmdArr[1];
                cmdDesc.shift();
        let description = [];
        for(let i = 0; i < cmdName.length; i++){
            description.push(`-> **$${cmdName[i]}**`);
            description.push(`${cmdDesc[i]}\n`);
        }
        description = description.join('/').replace(/\//g, `\n`);
        let hEmb = new Discord.EmbedBuilder()
            .setColor('#8D8DE7')
            .setTitle('List of Commands.')
            .setDescription(description)
            .setFooter({text: 'Trying to be helpful ig.'})
        return message.channel.send({embeds: [hEmb]});
        }
        if(message.member.permissions.has('ManageRoles')){
            blah();
        }else{
            return message.reply("Fuck you.");
        }
    }
}