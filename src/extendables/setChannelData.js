const { Extendable } = require('klasa');
const { Channel } = require('discord.js');

module.exports = class extends Extendable {
  constructor(...args) {
    super(...args, {
      enabled: true,
      appliesTo: [Channel],
    });
  }

  async setNewData(invasionData) {
    const channel = this;
    const { id: channelId } = channel;
    const provider = await this.client.providers.get('mongoose');
    const guildDocument = await provider.Guilds.findOne({ id: channel.guild.id });
    const channelData = guildDocument.get(`channels.${channelId}`) || {};
    const channels = guildDocument.channels || new Map();
    channelData.invasionItems = invasionData;
    channels.set(channelId, channelData);
    guildDocument.channels = channels;
    return guildDocument.save();
  }
};
