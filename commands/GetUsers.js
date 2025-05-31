module.exports = {
    name: 'getusers',
    description: 'Lists all the current users in the database.',
    execute(Discord, message, Acaroth, msgArr, punishmentData, cmdArr){
        async function blah(){
            let data = await punishmentData.findAll();
            let nameList = [];
            for(let i = 0; i < data.length; i++){
                nameList.push(`<@${data[i].dataValues.uid}> - Level ${data[i].dataValues.level + data[i].dataValues.overflow}`);
            }
            nameList = nameList.join(`\n`);
            let listEmb = new Discord.EmbedBuilder()
                .setColor('#8D8DE7')
                .setTitle('List of users currently in database.')
                .setDescription(nameList)
            return message.channel.send({embeds: [listEmb]});
        }
        if(message.member.permissions.has('ManageRoles') || message.author.id == '252529231215460353'){
            blah();
        }else{
            return message.reply({
                files: [{
                    attachment: './Images/stare.mp4',
                    name: 'stare.mp4',
                    description: 'stare.'
                    }]
                });
        }
    }
}