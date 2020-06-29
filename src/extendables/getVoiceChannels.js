const { Extendable, KlasaGuild } = require('klasa');

module.exports = class extends Extendable {
  constructor(...args) {
    super(...args, {
      enabled: true,
      appliesTo: [KlasaGuild],
    });
  }

  get voiceChannels() {
    const guild = this;
    return guild.channels.cache.filter((guildChannel) => guildChannel.type === 'voice');
  }
};
