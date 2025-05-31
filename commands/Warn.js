module.exports = {
    name: 'warn',
    description: 'This is for warning users who have broken rules. Hands out a single warn at a time.\nExample: $warn Heli\n Syntax: <command> <user>\n\n\nTargeting users can accept user mentions, IDs, and typed partial usernames without spaces. Not caps sensitive.\nExample: <@441270650779467778>\nExample: 441270650779467778\nExample: Heli',
    async execute(Discord, message, Acaroth, msgArr, punishmentData, cmdArr, userData){
        async function LogData(target, pDb, reason){
            try{
                let ud = await userData.findOne({where: {uid: target.user.id}});
                reason = (reason) ? `Warn with reason -> ${reason}` : "Warn without reason.";
                let date = Date.now();
                let currentDate = new Date(date);
                    currentDate = currentDate.toDateString()
                let formattedDate = currentDate.substring(4);

                if(!ud){
                    message.channel.send("running");
                    warnReason = `[ { "Date": "${formattedDate}", "Reason": "${reason}" } ]`;
                    ud = await userData.create({
                        uid: target.user.id,
                        totalWarns: 1,
                        totalPardons: 0,
                        highestLevel: pDb.dataValues.level || 1,
                        warnList: warnReason
                    });
                }else{
                    let updatedWarnList = ud.dataValues.warnList.replace(/[\[\]]/g, '');
                    updatedWarnList = `[${updatedWarnList}, { "Date": "${formattedDate}", "Reason": "${reason}" } ]`;
                    let topLevel = ud.dataValues.highestLevel;
                    if(pDb.dataValues.level + 1 > topLevel){
                        topLevel++;
                    }
                    await ud.update({totalWarns: ud.dataValues.totalWarns + 1,highestLevel: topLevel, warnList: updatedWarnList})
                }
            }catch(e){
                console.log(e.message);
            }
        }
        if(!message.member.permissions.has('ManageRoles') || message.author.id == '252529231215460353'){
            return message.reply({
                content: `Who the fuck are you?`,
                files: [{
                    attachment: `./Images/therock.gif`,
                    name: 'therock.gif',
                    description: `I just don't know who you are.`
                    }]
                }
            );
        }
        let logDescriptionArr = [];
        let logColour = '#abff87';
        let msTime = Date.now();
        let ndc = msTime + 1209600000; //40 seconds, change later!!!
        let mTable = [600000, 1800000, 2700000, 3600000]; //These number need to be changed later!
        let mTimeTable = [`10 minutes.`,`30 minutes.`,`45 minutes.`,`60 minutes.`];
        let bTable = [43200000, 86400000, 604800000, 2629746000]; //These number need to be changed later!
        let bTimeTable = [`12 hours.`,`1 day.`,`1 week.`,`1 month.`];
        let ex = require('./ExternalFunctions');
        let reason = message.content.split(' ');
        reason.shift();
        let target = reason.shift();
        reason = reason.join(' ');
        target = await ex.FindMember(message, target, Acaroth);
        if(!target){
            return message.reply('No User Found.');
        };
        let banFlag = false;
        let logGuild = Acaroth.guilds.cache.find(g => g.id == '834998106398392340');
        let logChannel = logGuild.channels.cache.find(c => c.id == '967603457487958026');
        let pUser = `${target.user.username}#${target.user.discriminator}`;
        let pDb = await punishmentData.findOne({where: {uid: target.user.id}});
        if(!pDb){
            let mErr = 0;
            try{
                let umt = msTime + mTable[0];
                pDb = await punishmentData.create({
                    uid:            target.user.id,
                    level:          1,
                    unmuteTime:     umt,
                    unbanTime:      -1,
                    decayTime:      ndc,
                    overflow:       0,
                    decayOrigin:    -1,
                    banFlag:        false,
                    isEdited:       true,
                });
                logDescriptionArr.push(`${pUser} is now at level 1. They will be unmuted in ${mTimeTable[0]}`)
            }catch(e){
                mErr = 1;
                logColour = '#ff6666';
                logDescriptionArr.push(`Error creating database for ${pUser}`)
            };
            //add role
            let mRole = message.guild.roles.cache.find(role => role.id == '843580409681281075');
            if(mRole){
                try{
                    await target.roles.add(mRole);
                }catch(e){
                    mErr = 1;
                    logColour = '#ff6666';
                    logDescriptionArr.push(`Error, probably missing permissions. Go fix that please, idiot.`);
                };
                if(mErr == 0){
                    logDescriptionArr.push(`Added role to ${pUser} without error.`);
                }
            }else{
                logColour = '#ff6666';
                logDescriptionArr.push(`No mute role was found.`);
            }
        }
        else if(pDb){
            //bump them up
            //843580409681281075 mute roll of wyverns den
            //967603457487958026 channel for logs in wyvern's den
            let ovf = pDb.dataValues.overflow;
            let newLv = pDb.dataValues.level + 1 + ovf;
            let bErr = 0;
            logDescriptionArr.push(`${pUser} has been warned. Updating level from ${newLv -1} -> ${newLv}.`);
            console.log(newLv);
            if(newLv > 4 && newLv < 10){
                try{
                    let ubt = msTime + bTable[newLv - 5];
                    let nOvf = -5 + newLv;
                    pDb = await pDb.update({level: 5, unbanTime: ubt, decayTime: ndc, overflow: nOvf, banFlag: true, isEdited: true});
                    logDescriptionArr.push(`Updated punishment database successfully. Attempting to ban...`);
                    if(newLv > 8){
                        logDescriptionArr.push(`${pUser} has reached level 9. Ban is permanent, attempting to destroy their database...`);
                        try{
                            await allDb[i].destroy();
                        }catch(e){
                            bErr = 1;
                            logColour = '#ff6666';
                            logDescriptionArr.push(`Error destoying their database.`);
                        }
                        if(bErr == 0){
                            logDescriptionArr.push(`Success.`);
                        }
                    }
                    banFlag = true;
                }catch(e){
                    bErr = 1;
                    logColour = '#ff6666';
                    logDescriptionArr.push(`Likely an error updating the database for ${target}`);
                };
                if(bErr == 0){
                    logDescriptionArr.push(`${pUser} was banned for reaching level ${newLv}. They will be unbanned in ${bTimeTable[newLv - 5]}`)
                }
            }else if(newLv < 5){
                try{
                    let mErr = 0;
                    let umt = msTime + mTable[newLv - 1];
                    pDb = await pDb.update({level: newLv, unmuteTime: umt, decayTime: ndc, isEdited: true});
                    let mRole = message.guild.roles.cache.find(role => role.id == '843580409681281075');
                    if(!mRole){
                        throw new Error('Role was not found.');
                    }
                    await target.roles.add(mRole);
                }catch(e){
                    mErr = 1;
                    logColour = '#ff6666';
                    let err = e.toString();
                    console.log(err)
                    if(err == 'Error: Role was not found.'){
                        logDescriptionArr.push('No mute role was found.')
                    }else{
                        logDescriptionArr.push('Error updating database and muting to user.');
                    }
                }
                if(mErr = 0){
                    logDescriptionArr.push(`${pUser} was muted for reaching level ${newLv}. They will be unmuted in ${mTimeTable[newLv-1]}`)
                }
            }else if(newLv > 9){
                logDescriptionArr.push("How?");
            };
        };
        if(reason || pDb.dataValues.level == 4){
            let sErr = 0;
            let preMessage = `Sending warning to ${pUser}. **Reason:** ${reason}`;
            let warnMessage = `Your current level is ${pDb.dataValues.level}.\n**Reason:** ${reason}`;
            if(pDb.dataValues.level == 4){
                if(!reason){
                    reason = `No reason provided.`
                }else{
                    reason = `**Reason:** ${reason}`;
                }
                preMessage = `User has reached level 4, DMing them a warning. ${reason}`;
                warnMessage = `You've reached level 4. Tread carefully, the next warn will result in a ban.\n${reason}}`;
            };
            logDescriptionArr.push(preMessage)
            try{
                let warnEmb = new Discord.EmbedBuilder()
                    .setTitle(`You've been warned in Wyvern's Den.`)
                    .setDescription(warnMessage)
                    .setColor('#ff6666')
                    .setFooter({text: 'DM this bot for any concerns.'})
                await target.send({embeds: [warnEmb]});
            }catch(e){
                console.log(e)
                sErr = 1;
                logColour = '#ff6666';
                logDescriptionArr.push(`Error sending warning to user.`);
            }
        }else{
            logDescriptionArr.push("No reason provided. Therefore, no warning sent.")
        }
        if(banFlag == true){
            let bErr = 0;
            try{
                await target.ban();
            }catch(e){
                console.log(e);
                bErr = 1;
                logColour = '#ff6666';
                logDescriptionArr.push(`${pUser} cannot be banned. Missing permissions or they have a higher rank.`);
                }
        if(bErr == 0){
            if(newLv == 9){
                logDescriptionArr.push(`${pUser} was banned for reaching level ${newLv}.`)
            }else{
                logDescriptionArr.push(`${pUser} was banned for reaching level ${newLv}. They will be unbanned in ${bTimeTable[newLv-5]}`)
                }
            }
        }        
        logDescriptionArr = logDescriptionArr.join('\n');
        await LogData(target, pDb, reason);
        let logEmb = new Discord.EmbedBuilder()
            .setColor(logColour)
            .setDescription(logDescriptionArr)
        logChannel.send({ embeds: [logEmb]})
        if(logColour == '#ff6666'){
            let repEmb = new Discord.EmbedBuilder()
                .setColor(logColour)
                .setDescription(`Possible error setting level of ${pUser}, check ${logChannel} for specific details.`)
            return message.reply({embeds: [repEmb]});
        }else{
            let repEmb = new Discord.EmbedBuilder()
            .setColor(logColour)
            .setDescription(`${pUser}'s level has been set to ${pDb.dataValues.level}.`)
            return message.reply({embeds: [repEmb]});
        }
    }
}