const { MessageEmbed } = require('discord.js');

const authorThumb = (attackingFaction) => {
  const tumbs = new Map([
    ['Grineer', 'https://i.imgur.com/Z2cwAPz.png'],
    ['Corpus', 'https://i.imgur.com/4NWRkzT.png'],
    ['Infested', 'https://i.imgur.com/z5DRsUp.png'],
  ]);
  return tumbs.get(attackingFaction);
};
const embedMaker = (reward, invasion, defendingFaction, attackingFaction) => {
  // Seconds minutes and hours: 17h 54m 53s = [ '53', ' 54', ' 17' ]
  // const etaHMS = invasion.eta.match(/[^hms\s]\d/gi).reverse()
  const embed = new MessageEmbed()
    .setTitle(`${reward.itemString}`)
    .setThumbnail(reward.thumbnail)
    // .setFooter(`${finishedInDate(etaHMS)})`)
    .setTimestamp()
    .setAuthor(`${invasion.node} ${invasion.desc}`, authorThumb(attackingFaction))
    .setDescription(
      `Facção: ${defendingFaction}
            Previsão de conclusão em: ${invasion.eta}`,
    );
  return embed;
};

const embed = (invasion, matchedItems) => {
  const embeds = [];
  const numbOfItems = matchedItems.length;
  const {
    attackingFaction, defendingFaction, attackerReward, defenderReward, rewardTypes,
  } = invasion;
  if (attackingFaction === 'Infested') {
    embeds.push(embedMaker(defenderReward, invasion, defendingFaction, attackingFaction));
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
