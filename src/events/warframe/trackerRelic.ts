import { Event } from 'klasa';
import { eachOf, eachOfSeries } from 'async';
import fissureEmbed from '../../embeds/warframe/fissureTracker';

import type { EventStore } from 'klasa';
import type { MessageEmbed, TextChannel } from 'discord.js';
import type { InvasionData, Fissure } from '../../types/WFCD';

export default class extends Event {
  constructor(...args: [EventStore, string[], string]) {
    super(...args, { name: 'warframeNewFissure' });
  }

  async run(fissures: Fissure[]) {
    const provider = this.client.providers.get('mongoose');
    const fissureEmbeds = await fissureEmbed(fissures);
    (provider as any).Guilds.find({}).stream()
      .on('data', async ({ channels, id: guildID }: { channels: any, id: string }) => {
        const guildDocument = await (provider as any).Guild(guildID);
        if (!channels) return;
        await eachOf(channels, async ({ relicTracker }: any, channelID) => {
          if (!relicTracker || !relicTracker.enabled) return;
          const messagesPath = `channels.${channelID}.relicTracker.messages`;
          const messages = guildDocument.get(messagesPath, Map);
          const channel = await this.client.channels.fetch(channelID as string);
          const undefinedMessage = async (embed: MessageEmbed, tier: number) => {
            const sentMessage = await (channel as TextChannel).send(embed);
            messages.set(tier, sentMessage.id);
            await guildDocument.set(messagesPath, messages);
          };
          await eachOfSeries(fissureEmbeds as any, async ([tier, embed]: [number, MessageEmbed]) => {
            if (!messages.has(tier)) {
              await undefinedMessage(embed, tier);
            } else {
              const messageID = messages.get(tier);
              const oldMessage = await (channel as TextChannel).messages.fetch(messageID)
                .catch(async () => undefinedMessage(embed, tier));
              if (oldMessage) await oldMessage.edit(embed);
            }
          });
        });
      });
  }
}
