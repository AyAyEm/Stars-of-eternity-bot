const { MessageEmbed } = require('discord.js');

const factionsStyle = new Map([
  ['Grineer', { tumb: 'https://i.imgur.com/Yh9Ncdv.png', color: '#6c0607' }],
  ['Corpus', { tumb: 'https://i.imgur.com/Aa4BfIH.png', color: '#0000de' }],
  ['Infested', { tumb: 'https://i.imgur.com/n9THxDE.png', color: '#1a931e' }],
]);

const embedMaker = (reward, invasion, defendingFaction, attackingFaction) => {
  const embed = new MessageEmbed()
    .setTitle(`${reward.itemString}`)
    .setThumbnail(reward.thumbnail)
    .setTimestamp()
    .setColor(factionsStyle.get(defendingFaction).color)
    .setAuthor(`${invasion.node} ${invasion.desc}`, factionsStyle.get(defendingFaction).tumb)
    .setFooter(`${defendingFaction} x ${attackingFaction}`, factionsStyle.get(attackingFaction).tumb);
  return embed;
};

const embed = (invasion, matchedItems) => {
  const embeds = [];
  const numbOfItems = matchedItems.length;
  const {
    attackingFaction, defendingFaction, attackerReward, defenderReward, rewardTypes,
  } = invasion;
  if (attackingFaction === 'Infested') {
    embeds.push(embedMaker(defenderReward, invasion, attackingFaction, defendingFaction));
    if (numbOfItems === 1) return embeds;
  }
  if (matchedItems.includes(rewardTypes[0])) {
    embeds.push(embedMaker(attackerReward, invasion, attackingFaction, defendingFaction));
  }
  if (matchedItems.includes(rewardTypes[1])) {
    embeds.push(embedMaker(defenderReward, invasion, defendingFaction, attackingFaction));
  }
  return embeds;
  // .addField(attackingFaction, attackerReward.itemString, true)
  // .addField(defendingFaction, defenderReward.itemString, true)
  // .setFooter(invasion.activation);
};

module.exports = embed;
