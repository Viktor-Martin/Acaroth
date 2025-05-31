module.exports = {
    name: 'restart',
    description: 'restarts the damn bot... duh',
    async execute(Discord, message, Acaroth, msgArr, punishmentData, cmdArr, userData){
        if(message.author.id == '252529231215460353'){
            await message.reply("Restarting...");
            process.exit();
        }
    }
}