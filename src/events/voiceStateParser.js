/* eslint-disable max-classes-per-file */
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
    const oldChannelID = oldState.channelID;
    const newChannelID = newState.channelID;
    const bothDefined = oldChannelID && newChannelID;
    if (oldChannelID === newChannelID) return;
    // Member joined a channel
    if (!oldChannelID || (oldChannelID !== newChannelID && bothDefined)) {
      const { member, channel } = newState;
      const botOrMember = member.user.bot ? 'bot' : 'member';
      this.client.emit(`${botOrMember}JoinedChannel`, {
        member, channel, state: newState, type: 'join',
      });
      // Custom events
      if (member.user.bot) return;
      this.client.emit(`${channel.id}memberJoined`, member);
    }
    // Member left a channel
    if (!newChannelID || (oldChannelID !== newChannelID && bothDefined)) {
      const { member, channel } = oldState;
      const botOrMember = member.user.bot ? 'bot' : 'member';
      this.client.emit(`${botOrMember}LeftChannel`, {
        member, channel, state: oldState, type: 'left',
      });
      // Custom events
      if (member.user.bot) return;
      this.client.emit(`${channel.id}memberLeft`, member);
    }
  }
};
