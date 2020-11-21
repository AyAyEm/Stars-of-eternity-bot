import { EternityEvent } from '@lib';
import { ApplyOptions } from '@sapphire/decorators';
import { Guilds } from '@providers/mongoose/Models';
import { fissuresEmbed } from '@embeds/warframe/fissureTracker';
import async from 'async';

import type { RelicTracker } from '@providers/mongoose/Models';
import type { EventOptions } from '@sapphire/framework';
import type { Fissure, RelicTiers } from '@lib/types/Warframe';
import type { EternityMessageEmbed } from '@lib';
import type { TextChannel } from 'discord.js';

@ApplyOptions<EventOptions>({ event: 'warframeNewActiveFissures' })
export default class extends EternityEvent<'warframeNewActiveFissures'> {
  public async run(fissures: Fissure[]) {
    const fissuresEmbeds = fissuresEmbed(fissures);
    this.client.provider.models.Guilds.find({}).cursor()
      .on('data', async ({ channels, id: guildId }: Guilds) => {
        if (!channels) return;
        const guildDocument = await new this.client.provider.Guilds(guildId).load;
        channels.forEach(async ({ relicTracker }, channelId) => {
          if (!relicTracker || !relicTracker.enabled) return;
          const messagesPath = `channels.${channelId}.relicTracker.messages`;
          const messages = await guildDocument.get<RelicTracker['messages']>(messagesPath, Map);

          const channel = await this.client.channels.fetch(channelId) as TextChannel;
          const undefinedMessage = async (embed: EternityMessageEmbed, tier: RelicTiers) => {
            const sentMessage = await channel.send(embed);
            messages.set(tier, sentMessage.id);
            await guildDocument.set(messagesPath, messages);
          };
          type FissureEmbedKeyValue = [RelicTiers, EternityMessageEmbed];
          await async.eachOfSeries<FissureEmbedKeyValue>([...fissuresEmbeds.entries()],
            async ([tier, embed]) => {
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
