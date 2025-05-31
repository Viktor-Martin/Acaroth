
const { strictEqual } = require('assert');
const Discord = require('discord.js')
const intents = new Discord.IntentsBitField();
const fs = require('fs');
const intent = Discord.IntentsBitField.Flags;
    intents.add(intent.GuildPresences, intent.GuildMembers, intent.GuildMessages, intent.MessageContent, intent.Guilds, intent.GuildBans, intent.DirectMessages, intent.DirectMessageTyping);
const Acaroth = new Discord.Client({
    intents: intents, 
    partials: [Discord.Partials.Channel]
});
    Acaroth.commands = new Discord.Collection();
const commandDesc = [];
const commandName = [];
const commandFile = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
    for (const file of commandFile){
        const command = require(`./commands/${file}`);
        Acaroth.commands.set(command.name, command);
        commandDesc.push(command.description)
        commandName.push(command.name)
    };
const cmdArr = [commandName, commandDesc]
const Sequelize = require('sequelize');
const sequelize = new Sequelize('database', 'user', 'password', {
    host:'localhost',
    dialect:'sqlite',
    logging: false,
    storage: 'database.sqlite',
});
let sdPrefix = `$`;
const punishmentData = sequelize.define('punishmentData', {
    uid:            Sequelize.STRING,
    level:          Sequelize.INTEGER,
    unmuteTime:     Sequelize.INTEGER,
    unbanTime:      Sequelize.INTEGER,
    decayTime:      Sequelize.INTEGER,
    overflow:       Sequelize.INTEGER,
    decayOrigin:    Sequelize.INTEGER,
    banFlag:        Sequelize.BOOLEAN,
    isEdited:       Sequelize.BOOLEAN,
});

const userData = sequelize.define('userData', {
    uid:{
        type: Sequelize.STRING,
        unique: true,
    },
    totalWarns:     Sequelize.INTEGER,
    totalPardons:   Sequelize.INTEGER,
    highestLevel:   Sequelize.INTEGER,
    warnList:       Sequelize.STRING
});

const lBoardId = sequelize.define('lBoardId',{
    lbid: Sequelize.STRING,
    gid:  Sequelize.STRING,
});

let isStart;
//Two week level period.
setInterval(async () => {
    let logGuild = Acaroth.guilds.cache.find(g => g.id == '834998106398392340');
    let logChannel = logGuild.channels.cache.find(c => c.id == '967603457487958026');
    let logDescriptionArr =[];
    let logColour = '#abff87';
    let isEdited = false;
    let allDb = await punishmentData.findAll({
        order: [['level', 'DESC']]
    });
    let nameArr = []; 
    for(let i = 0; i < allDb.length; i++){
        if(allDb[i].dataValues.isEdited == true){
            isEdited = true;
            allDb[i].update({isEdited: false});
        }
        let msTime = Date.now();
        let umt = allDb[i].dataValues.unmuteTime;
        let ubt = allDb[i].dataValues.unbanTime;
        let decayTime = allDb[i].dataValues.decayTime;
        let ndc = 1209600000 + msTime;
        let g = Acaroth.guilds.cache.find(g => g.id == `834998106398392340`);
        let m = g.roles.cache.find(r => r.id == '843580409681281075');
        let u = g.members.cache.find(u => u.id == allDb[i].dataValues.uid);
        let pUser;
        if(!u){
            pUser = `<@${allDb[i].dataValues.uid}>`;
        }else{
            pUser = `${u.user.username}#${u.user.discriminator}`;
        };
        if(allDb[i].dataValues.level == 0){
            let decayErr = 0;
            let name = u || pUser;
            logDescriptionArr.push(`${name} is at level 0 and has not been purged from database, attempting that now...`);
            try{
                await allDb[i].destroy();
                logDescriptionArr.push(`Successfully removed user from database.`);
                break;
            }catch(e){
                logColour = '#ff6666';
                decayErr = 1;
                logDescriptionArr.push(`Error purging user from database.`);
            }
        }
        if(umt < msTime){
            let mErr = 0;
            let actionTaken = false;
            try{
                if(u){
                    if(u.roles.cache.find(r => r.id == '843580409681281075')){
                        logDescriptionArr.push(`${pUser}'s mute time is up. Attempting to unmute...`);
                        await u.roles.remove(m);
                        actionTaken = true;
                    }
                };
            }catch(e){
                console.log(e);
                mErr = 1;
                logColour = '#ff6666';
                logDescriptionArr.push(`Error removing role from ${pUser}.`);
            }
            if(mErr == 0 && actionTaken == true){
                logDescriptionArr.push(`Unmuted ${pUser} successfully.`);
            }
        }
        if(ubt < msTime){
            let bErr = 0;
            let banFlag = allDb[i].dataValues.banFlag;
            if(!g.members.cache.find(u => u.id == allDb[i].dataValues.uid) && banFlag == true){
                logDescriptionArr.push(`${allDb[i].dataValues.uid}'s ban time is up. Attempting to unban...`);
                try{
                    if(allDb[i].dataValues.level < 8){
                        await g.bans.remove(allDb[i].dataValues.uid);
                        await allDb[i].update({banFlag:false});
                        isEdited = true;
                    }
                }catch(e){
                    bErr = 1;
                    logColour = '#ff6666';
                    logDescriptionArr.push(`Error updating database or removing ban.`);
                }
                if(bErr == 0){
                    logDescriptionArr.push(`Unbanned ${allDb[i].dataValues.uid} successfully.`);
                };
            };
        };
        if(decayTime < msTime && u){
            let newLv = allDb[i].dataValues.level - 1;
            let ovf = allDb[i].dataValues.overflow;
            if(newLv < 1 ){
                let dbErr = 0;
                logDescriptionArr.push(`${pUser}'s level has reached 0, destroying their record.`);
                try{
                    await allDb[i].destroy();
                    isEdited = true;
                    break;
                }catch(e){
                    dbErr = 1
                    logColour = '#ff6666';
                    logDescriptionArr.push(`Error destroying database.`);
                };
                if(dbErr == 0){
                    logDescriptionArr.push(`Sucess deleting ${pUser} from database.`)
                }
            }else{
                let dbErr = 0;
                logDescriptionArr.push(`User is found, attempting to lower level from ${newLv + 1} to ${newLv}...`);
                try{
                    //two weeks 1209600000;
                    await allDb[i].update({level: newLv, decayTime: ndc});
                    isEdited = true;
                    if(newLv < 5 && ovf > 0){
                        logDescriptionArr.push(`${pUser}'s level has reached 4, attempting to wipe their overflow.`);
                        try{
                            await allDb[i].update({level: newLv, overflow: 0});
                        }catch(e){
                            dbErr = 1;
                            logColour = '#ff6666';
                            logDescriptionArr.push(`Error wiping overflow.`);
                        }
                        if(dbErr == 0){
                            logDescriptionArr.push(`Successfully wiped overflow.`);
                        }
                    }
                }catch(e){
                    dbErr = 1
                    logColour = '#ff6666';
                    logDescriptionArr.push(`Error decaying ${pUser}'s level...`);
                }
                if(dbErr == 0){
                    logDescriptionArr.push(`Successfully lowered ${pUser}'s level.`);
                }
            }
        }else if(decayTime > msTime && !u){
            let dcErr = 0;
            try{
                let ndt = allDb[i].dataValues.decayTime + 2000;
                let threeMonths = 2629746000 * 3;
                let bdc = allDb[i].dataValues.decayOrigin;
                if(bdc == -1){
                    logDescriptionArr.push("Setting up reference point for long term decay.")
                    await allDb[i].update({decayTime: ndt, decayOrigin: ndt});
                }else{
                    await allDb[i].update({decayTime: ndt});
                }
                if(bdc + threeMonths < msTime && bdc > 1){
                    logDescriptionArr.push(`3 months has passed since ${pUser} was banned. Unbanning and destroying their database...`)
                    try{
                        await g.members.unban(allDb[i].dataValues.uid);
                        await allDb[i].destroy();
                        isEdited = true;
                        break;
                    }catch(e){
                        console.log(e);
                        dcErr = 1;
                        logColour = '#ff6666';
                        if(e.message.match(`Unknown Ban`)){
                            logDescriptionArr.push(`User not found in banlist, purging user data.`);
                            await allDb[i].destroy();
                        }else{
                            logDescriptionArr.push(`Error removing ban or destroying database.`);
                        }
                    }
                };
            }catch(e){
                dcErr = 1;
                logColour = '#ff6666';
                logDescriptionArr.push(`Error setting up reference decay point.`);
            };
        };
        let gUser = await Acaroth.users.fetch(allDb[i].dataValues.uid);
        let dataObj = {
            userObj: u,
            uname: `${gUser.username}#${gUser.discriminator}`,
            level: allDb[i].dataValues.level,
            overflow: allDb[i].dataValues.overflow,
            decayT:   allDb[i].dataValues.decayTime,
        };
        nameArr.push(dataObj);
    };
    if(logDescriptionArr.length > 0){
        logDescriptionArr = logDescriptionArr.join('\n');
        let logEmb = new Discord.EmbedBuilder()
            .setColor(logColour)
            .setDescription(logDescriptionArr)
        logChannel.send({ embeds: [logEmb]});
    };
    let lGuild = Acaroth.guilds.cache.find(g => g.id == '834998106398392340'); //Update to Wyvern's Den later;
    let c = lGuild.channels.cache.find(c => c.id == '943960479401914429'); //Update to Wyvern's Den Later;
    let levelFiveMembers = [];
    let levelFourMembers = [];
    let levelThreeMembers = []; 
    let levelTwoMembers = []; 
    let levelOneMembers = [];
    for(let i = 0; i < nameArr.length; i++){
        let dTime = new Date(nameArr[i].decayT)
        const monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        let day = dTime.getDate()
        let month = dTime.getMonth()
        if(nameArr[i].level == 5){
            let pushName = `${nameArr[i].userObj || nameArr[i].uname}, level ${nameArr[i].level + nameArr[i].overflow} - Reduce on ${monthNames[month]} ${day}.`
            levelFiveMembers.push(pushName);
        }
        if(nameArr[i].level == 4){
            let pushName = `${nameArr[i].userObj || nameArr[i].uname} - Reduce on ${monthNames[month]} ${day}`
            levelFourMembers.push(pushName);
        }
        if(nameArr[i].level == 3){
            let pushName = `${nameArr[i].userObj || nameArr[i].uname} - Reduce on ${monthNames[month]} ${day}`
            levelThreeMembers.push(pushName);
        }
        if(nameArr[i].level == 2){
            let pushName = `${nameArr[i].userObj || nameArr[i].uname} - Reduce on ${monthNames[month]} ${day}`
            levelTwoMembers.push(pushName);
        }
        if(nameArr[i].level == 1){
            let pushName = `${nameArr[i].userObj || nameArr[i].uname} - Reduce on ${monthNames[month]} ${day}`
            levelOneMembers.push(pushName);
        };
    };
    levelOneMembers   = levelOneMembers.join('/').replace(/\//g, '\n');
    levelTwoMembers   = levelTwoMembers.join('/').replace(/\//g, '\n');
    levelThreeMembers = levelThreeMembers.join('/').replace(/\//g, '\n');
    levelFourMembers  = levelFourMembers.join('/').replace(/\//g, '\n');
    levelFiveMembers  = levelFiveMembers.join('/').replace(/\//g, '\n');
    let lMsg = `
(Example) Action taken when this level is reached
Kniles#5052 Level - Reduce on November 6.

**Level 5 - 12 hour ban minimum (Increases by 1 Day, then 1 Week, then 1 Month, then Permanently):**
${levelFiveMembers || 'No one.'}

**Level 4 - 60m mute, warn of 12 hour ban after next infraction:**
${levelFourMembers || 'No one.'}

**Level 3 - 45m mute:**
${levelThreeMembers || 'No one.'}

**Level 2 - 30m mute:**
${levelTwoMembers || 'No one.'}

**Level 1 - 10m mute:**
${levelOneMembers || 'No one.'}`;
    let lBoardEmb = new Discord.EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('Infraction list:')
        .setDescription(lMsg)
        .setFooter({text: 'Massive Ls have been dished out to the above mentioned FOOLS!'})
    
    let lastMsg = await lBoardId.findOne({where: {gid: '834998106398392340'}}); //change to wyvern's den later
    if(!lastMsg){
        let msg = await c.send({ embeds: [lBoardEmb] });
        let lboard = await lBoardId.create({
            lbid: msg.id,
            gid:  msg.guild.id
        })
    }else{
        let m = await c.messages.fetch(lastMsg.dataValues.lbid);
            if(isEdited == true || isStart == true){
                //console.log(nameArr)
                m.edit({ embeds: [lBoardEmb] }); 
                isStart = false;
                isEdited = false;
            }
    }
}, 2000);

Acaroth.on("ready", async ()=>{
    //userData.sync({force: true})
    isStart = true;
    let activityType = Discord.ActivityType;
    setInterval(()=>{
        Acaroth.user.setPresence({ activities: [{ name: 'you.', type: activityType.Watching}], status: 'online' })
    }, 86400000)
    Acaroth.user.setPresence({ activities: [{ name: 'you.', type: activityType.Watching}], status: 'online' });
    //Acaroth.user.setUsername("Acaroth")
    //Acaroth.user.setUsername("https://cdn.discordapp.com/attachments/557466126775484416/1020935653560696884/unknown.png")
    console.log('Acaroth is online.');
});

Acaroth.on("messageCreate", async message =>{
    if(message.content.toLocaleLowerCase().match('sin')){
        message.react('1335673778344165467'); //won't work without server boosts.
    }
    if(!message.guild){
        if(message.author.bot) return;
        if(!message.content) return;
        let logGuild = Acaroth.guilds.cache.find(g => g.id == '834998106398392340');
        let logChannel = logGuild.channels.cache.find(c => c.id == '967603457487958026');
        let colours = [
            '#ffbadd', '#ffbaf2', '#eabaff', '#d1baff', '#bac2ff', '#bad7ff', '#bae9ff', '#baf9ff',
            '#bafff0', '#baffd4', '#baffc1', '#c4ffba', '#e0ffba', '#f1ffba', '#fff6ba', '#ffbaba',
            '#fc9a9a', '#fcc89a', '#fcea9a', '#e2fc9a', '#b3fc9a', '#9afca7', '#9afcd2', '#9afcf8',
            '#9adafc', '#9aaafc', '#bb9afc', '#dc9afc', '#da9afc', '#fc9afb', '#fc9ad0', '#fc9aaa',
            '#fa6161', '#fa61a6', '#fa61bd', '#fa61eb', '#e061fa', '#c561fa', '#9c61fa', '#7861fa',
            '#7861fa', '#6197fa', '#61bdfa', '#61e6fa', '#61fae8', '#61fab5', '#61fa88', '#67fa61',
            '#88fa61', '#b8fa61', '#defa61', '#faeb61', '#faca61', '#fab061', '#fa9961', '#fa7361',
            '#9a41fa', '#edbaff', '#d1baff', '#b691ff', '#e9b0ff', '#ffb0f8', '#ffc2fa', '#c2d1ff',
        ];
        let winner = Math.floor(Math.random() * colours.length);
        let colour = colours[winner];
        let dmEmbed = new Discord.EmbedBuilder()
            .setTitle(`${message.author.username}#${message.author.discriminator} said:`)
            .setColor(colour)
            .setDescription(message.content)
            .setThumbnail(message.author.avatarURL({size: 512, extension: 'png'}))
            .setTimestamp(Date.now())
        return logChannel.send({embeds: [dmEmbed]});
    }
    if(message.guild.id == '834998106398392340' || message.guild.id == '670444482650701824'){
        const content = message.content.toLocaleLowerCase();
        const msgArr  = content.slice(sdPrefix.length).split(/ +/);
        const command = msgArr.shift();
        if(message.content.startsWith(`${sdPrefix}`)){
            if(!Acaroth.commands.has(command)) return;
            try{
                Acaroth.commands.get(command).execute(Discord, message, Acaroth, msgArr, punishmentData, cmdArr, userData);
            }catch(e){
                console.log(e);
                message.reply(`My code sucks so something went wrong.`);
            };
        };
    }
});



process.on('unhandledRejection', error => console.error('Uncaught Promise Rejection', error));
Acaroth.login('Put your token here, or setup a .env file');