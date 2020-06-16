const { Command } = require('klasa');

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      enabled: true,
      runIn: ['text'],
      permissionLevel: 0,
      description: '',
      extendedHelp: 'No extended help available.',
    });
  }

  async run(msg) {
    const [guildId, channelId] = [msg.guild.id, msg.channel.id];
    const provider = await this.client.providers.get('mongoose');
    const invasionDocument = await provider.Trackers.findOne({ tracker: 'invasion' });
    if (!invasionDocument.subscription) invasionDocument.subscription = new Map();
    if (invasionDocument.subscription.has(guildId)) {
      const channels = invasionDocument.subscription.get(guildId);
      channels.push(channelId);
      invasionDocument.subscription.set(guildId, channels);
    } else {
      invasionDocument.subscription.set(guildId, [channelId]);
    }
    await invasionDocument.save();
    msg.replyAndDelete('Canal inscrito com sucesso nas invasões!', 10000);
  }
};
