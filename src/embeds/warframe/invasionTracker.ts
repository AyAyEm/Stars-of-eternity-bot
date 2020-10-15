import { MessageEmbed } from 'discord.js';

import type { InvasionData, Reward } from '../../types/WFCD/invasionData'

const factionsStyle = new Map([
  ['Grineer', { tumb: 'https://i.imgur.com/Yh9Ncdv.png', color: '#6c0607' }],
  ['Corpus', { tumb: 'https://i.imgur.com/Aa4BfIH.png', color: '#0000de' }],
  ['Infested', { tumb: 'https://i.imgur.com/n9THxDE.png', color: '#1a931e' }],
]);

function embedMaker(
  reward: Reward, invasion: InvasionData, defendingFaction: string, attackingFaction: string,
) {
  const embed = new MessageEmbed()
    .setTitle(`${reward.itemString}`)
    .setThumbnail(reward.thumbnail)
    .setTimestamp()
    .setColor(factionsStyle.get(defendingFaction)?.color || 'white')
    .setAuthor(`${invasion.node} ${invasion.desc}`, factionsStyle.get(defendingFaction)?.tumb)
    .setFooter(`${defendingFaction} x ${attackingFaction}`, factionsStyle.get(attackingFaction)?.tumb);
  return embed;
};

export default function embed(invasion: InvasionData, matchedItems: string[]) {
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
