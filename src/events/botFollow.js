const { Event } = require('klasa');

module.exports = class extends Event {
  constructor(...args) {
    super(...args, {
      event: 'voiceStateUpdate',
      enabled: true,
      once: false,
    });
  }

  async run(oldState, newState) {
    const guildDocument = await this.client.providers.get('mongoose')
      .guildDocument(oldState.guild.id);
    const member = oldState ? oldState.member : newState.member;
    const isToFollow = guildDocument.get(`members.${member.id}.toFollow`);
    if (!isToFollow) return;
    const [oldChannel, newChannel] = [oldState.channel, newState.channel];
    if (!newChannel) {
      oldChannel.leave();
    } else {
      newChannel.join();
    }
  }
};
