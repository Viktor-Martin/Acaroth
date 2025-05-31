module.exports = {
    name: 'history',
    description: 'Lists the available commands and their respective functions.',
    async execute(Discord, message, Acaroth, msgArr, punishmentData, cmdArr, userData){
        if(!message.member.permissions.has('ManageRoles') || message.author.id == '252529231215460353') return;
        const ex = require('./ExternalFunctions');
        let mode = message.content.split(' ')
        let target = mode[1]
        mode = mode[mode.length - 1];
        if(!target){
            return message.reply(`No target provided.`);
        }
        let user = await ex.FindMember(message, target);
        if(!user){
            return message.reply(`Could not find user ${target}`);
        }
        let ud = await userData.findOne({where: {uid: user.user.id}});
        if(!ud){
            return message.reply("No data found.");
        }
        let warnlist = JSON.parse(ud.dataValues.warnList);

        let formattedWarns = '';
        let msg = '';
        console.log(mode);
        switch(mode){
            case 'all': {
                for(let i = warnlist.length - 1; i >= 0; i--){
                    formattedWarns += `${warnlist[i].Date}: ${warnlist[i].Reason}\n`;
                }
                msg = `\`\`\`History for @${user.user.username} - All time\n${formattedWarns}\`\`\``;
                break;
            }
            case mode.match(/\d/g): {
                console.log('hello')
                msg = "This is a number";
                break;
            }
            default: {
                for(let i = warnlist.length - 1; i > warnlist.length - 6; i--){
                    formattedWarns += `${warnlist[i].Date}: ${warnlist[i].Reason}\n`;
                }
                let lastWarns = (warnlist.length > 5) ? 5 : warnlist.length;
                let eventPlural = (warnlist.length < 2) ? 'Event' : 'Events';
                msg = `\`\`\`History for user @${user.user.username} - Quick Info:\nTotal Warns: ${ud.dataValues.totalWarns}\nHighest Level: ${ud.dataValues.highestLevel}\nTotal Pardons: ${ud.dataValues.totalPardons}\n\nLast ${lastWarns} ${eventPlural}:\n${formattedWarns}\`\`\``;
                break;
            }
        }
        return message.reply(msg);
    }
}