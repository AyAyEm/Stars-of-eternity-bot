import { EternityEvent } from '@lib';
import { ApplyOptions } from '@sapphire/decorators';
import { MessageEmbed } from 'discord.js';
import { Warframe } from '@utils/constants';

import type { TextChannel } from 'discord.js';
import type { EventOptions } from '@sapphire/framework';
import type { InvasionData, Reward } from '@lib/types/Warframe';
import type { Guilds, Channel } from '@providers/mongoose/models';

@ApplyOptions<EventOptions>({ event: 'warframeNewInvasion' })
export default class extends EternityEvent<'warframeNewInvasion'> {
  public async run(invasion: InvasionData) {
    this.client.provider.models.Guilds.find({}).cursor()
      .on('data', async ({ channels }: Guilds) => {
        if (!channels) return;
        channels.forEach(async ({ invasionItems }: Channel, channelId) => {
          if (!invasionItems?.enabled && !invasionItems?.items?.length) return;

          const matchedItems = invasion.rewardTypes
            .filter((rewardItem: string) => invasionItems.items.includes(rewardItem));

          if (matchedItems.length === 0) return;

          const embeds = this.makeEmbeds(invasion, matchedItems);
          const discordChannel = await this.client.channels.fetch(channelId) as TextChannel;
          embeds.forEach((embed) => discordChannel.send(embed));
        });
      });
  }

  private makeEmbeds(invasion: InvasionData, matchedItems: string[]): MessageEmbed[] {
    function embedMaker([reward, defendingFaction, attackingFaction]: [Reward, string, string]) {
      const { factionsStyle } = Warframe;

      return new MessageEmbed()
        .setTitle(`${reward.itemString}`)
        .setThumbnail(reward.thumbnail)
        .setTimestamp()
        .setColor(factionsStyle.get(defendingFaction)?.color || 'white')
        .setAuthor(`${invasion.node} ${invasion.desc}`, factionsStyle.get(defendingFaction)?.tumb)
        .setFooter(`${defendingFaction} x ${attackingFaction}`, factionsStyle.get(attackingFaction)?.tumb);
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
