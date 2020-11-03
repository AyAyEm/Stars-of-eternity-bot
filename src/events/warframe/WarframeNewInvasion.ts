import { MessageEmbed } from 'discord.js';
import { EternityEvent } from '@lib';
import { Warframe } from '@utils/constants';

import type { TextChannel } from 'discord.js';
import type { InvasionData, Reward } from '@lib/types/Warframe';
import type { Guilds, Channel } from '@providers/mongoose/models';

export default class extends EternityEvent<'warframeNewInvasion'> {
  public async run(invasion: InvasionData) {
    this.client.provider.models.Guilds.find({}).cursor()
      .on('data', async ({ channels }: Guilds) => {
        if (!channels) return;
        channels.forEach(async ({ invasionItems }: Channel, channelId) => {
          if (!invasionItems || !invasionItems.enabled) return;
          const { items: storedItems } = invasionItems;
          if (!storedItems || storedItems.length === 0) return;
          const matchedItems = invasion.rewardTypes
            .filter((rewardItem: string) => storedItems.includes(rewardItem));
          if (matchedItems.length === 0) return;
          const embeds = this.makeEmbed(invasion, matchedItems);
          const discordChannel = await this.client.channels.fetch(channelId as string);
          embeds.forEach(async (embed) => (discordChannel as TextChannel).send(embed));
        });
      });
  }

  private makeEmbed(invasion: InvasionData, matchedItems: string[]) {
    function embedMaker([reward, defendingFaction, attackingFaction]: [Reward, string, string]) {
      const { factionsStyle } = Warframe;

      const embed = new MessageEmbed()
        .setTitle(`${reward.itemString}`)
        .setThumbnail(reward.thumbnail)
        .setTimestamp()
        .setColor(factionsStyle.get(defendingFaction)?.color || 'white')
        .setAuthor(`${invasion.node} ${invasion.desc}`, factionsStyle.get(defendingFaction)?.tumb)
        .setFooter(`${defendingFaction} x ${attackingFaction}`, factionsStyle.get(attackingFaction)?.tumb);
      return embed;
    }

    const embeds = [];
    const numbOfItems = matchedItems.length;
    const {
      attackingFaction, defendingFaction, attackerReward, defenderReward, rewardTypes,
    } = invasion;
    if (attackingFaction === 'Infested') {
      embeds.push(embedMaker([defenderReward, attackingFaction, defendingFaction]));
      if (numbOfItems === 1) return embeds;
    }
    if (matchedItems.includes(rewardTypes[0])) {
      embeds.push(embedMaker([attackerReward, attackingFaction, defendingFaction]));
    }
    if (matchedItems.includes(rewardTypes[1])) {
      embeds.push(embedMaker([defenderReward, defendingFaction, attackingFaction]));
    }
    return embeds;
  }
}
