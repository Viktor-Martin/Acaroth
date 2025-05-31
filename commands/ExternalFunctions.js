const { messageLink } = require("discord.js");

module.exports = {
    FindMember: async function(base, target, acaroth){
        //mentions
        member = await base.mentions.members.first();
        if(member) return member;
        //id
        let h = await base.guild.members.fetch();
        member = h.find(u => u.id == target)
        if(member) return member;
        return null;
    },
}