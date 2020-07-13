const { Event } = require('klasa');
const { eachOf, eachOfSeries } = require('async');
const fissureEmbed = require('../../embeds/warframe/fissureTracker');

module.exports = class extends Event {
  constructor(...args) {
    super(...args, { name: 'warframeNewFissure' });
  }

  async run(fissures) {
    const fissureEmbeds = await fissureEmbed(fissures);
    this.client.provider.Guilds.find({}).stream()
      .on('data', async ({ channels, id: guildID }) => {
        const guildDocument = await this.client.provider.Guild(guildID);
        if (!channels) return;
        await eachOf(channels, async ({ relicTracker }, channelID) => {
          if (!relicTracker || !relicTracker.enabled) return;
          const messagesPath = `channels.${channelID}.relicTracker.messages`;
          const messages = guildDocument.get(messagesPath, Map);
          const channel = await this.client.channels.fetch(channelID);
          const undefinedMessage = async (embed, tier) => {
            const sentMessage = await channel.send(embed);
            messages.set(tier, sentMessage.id);
            await guildDocument.set(messagesPath, messages);
          };
          await eachOfSeries(fissureEmbeds, async ([tier, embed]) => {
            if (!messages.has(tier)) {
              await undefinedMessage(embed, tier);
            } else {
              const messageID = messages.get(tier);
              const oldMessage = await channel.messages.fetch(messageID)
                .catch(async () => undefinedMessage(embed, tier));
              if (oldMessage) await oldMessage.edit(embed);
            }
          });
        });
      });
  }
};
