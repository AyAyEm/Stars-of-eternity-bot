/* eslint-disable no-unused-vars */
const { Event } = require('klasa');
const { eachOf } = require('async');
const invasionEmbed = require('../../embeds/warframe/invasionTracker');

module.exports = class extends Event {
  constructor(...args) {
    super(...args, {
      name: 'warframeNewInvasion',
      enabled: true,
      once: false,
    });
    this.provider = this.client.providers.get('mongoose');
  }

  async run(invasion) {
    this.provider.Guilds.find({}).stream()
      .on('data', async ({ channels }) => {
        if (!channels) return;
        await eachOf(channels, async ({ invasionItems }, channelId) => {
          if (!invasionItems || !invasionItems.enabled) return;
          const { items: storedItems } = invasionItems;
          if (!storedItems || storedItems.length === 0) return;
          const matchedItems = invasion.rewardTypes
            .filter((rewardItem) => storedItems.includes(rewardItem));
          if (matchedItems.length === 0) return;
          const embeds = invasionEmbed(invasion, matchedItems);
          const discordChannel = await this.client.channels.fetch(channelId);
          embeds.forEach(async (embed) => discordChannel.send(embed));
        });
      });
  }
};
