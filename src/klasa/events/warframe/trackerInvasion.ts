/* eslint-disable no-unused-vars */
import { Event } from 'klasa';
import { eachOf } from 'async';

import type { EventStore } from 'klasa';
import type { TextChannel } from 'discord.js';
import invasionEmbed from '../../../embeds/warframe/invasionTracker';
import type { InvasionData } from '../../../types/WFCD/invasionData';

export default class extends Event {
  constructor(...args: [EventStore, string[], string]) {
    super(...args, {
      name: 'warframeNewInvasion',
      enabled: true,
      once: false,
    });
  }

  async run(invasion: InvasionData) {
    (this.client.providers.get('mongoose') as any).Guilds.find({}).stream()
      .on('data', async ({ channels }: any) => {
        if (!channels) return;
        await eachOf(channels, async ({ invasionItems }: any, channelId) => {
          if (!invasionItems || !invasionItems.enabled) return;
          const { items: storedItems } = invasionItems;
          if (!storedItems || storedItems.length === 0) return;
          const matchedItems = invasion.rewardTypes
            .filter((rewardItem: string) => storedItems.includes(rewardItem));
          if (matchedItems.length === 0) return;
          const embeds = invasionEmbed(invasion, matchedItems);
          const discordChannel = await this.client.channels.fetch(channelId as string);
          embeds.forEach(async (embed) => (discordChannel as TextChannel).send(embed));
        });
      });
  }
}
