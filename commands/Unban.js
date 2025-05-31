module.exports = {
    name: 'unban',
    description: 'unabns',
    execute(Discord, message, Acaroth, msgArr, punishmentData, cmdArr){
        async function blah(){
            if(!message.member.permissions.has('ManageRoles') || message.author.id == '252529231215460353') return;
            let guild = message.guild;
            try{
                console.log('est')
                let user = await Acaroth.users.fetch('723029211823996979');
                console.log(user);
                guild.members.unban(user);
            }catch(e){
                console.log(e);
            }
        }
        blah();
    }
}