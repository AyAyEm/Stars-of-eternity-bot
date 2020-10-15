/* eslint-disable max-classes-per-file */
import { Event } from 'klasa'

import type { VoiceState } from 'discord.js';
import type { EventStore } from 'klasa';

export default class extends Event {
  constructor(...args: [EventStore, string[], string]) {
    super(...args, {
      event: 'voiceStateUpdate',
      enabled: true,
      once: false,
    });
  }

  async run(oldState: VoiceState, newState: VoiceState) {
    const oldChannelID = oldState.channelID;
    const newChannelID = newState.channelID;
    const bothDefined = oldChannelID && newChannelID;
    if (oldChannelID === newChannelID) return;
    // Member joined a channel
    if (!oldChannelID || (oldChannelID !== newChannelID && bothDefined)) {
      const { member, channel } = newState;
      const botOrMember = member?.user.bot ? 'bot' : 'member';
      this.client.emit(`${botOrMember}JoinedChannel`, {
        member, channel, state: newState, type: 'join',
      });
      // Custom events
      if (!member?.user.bot) this.client.emit(`${channel?.id}memberJoined`, member);
    }
    // Member left a channel
    if (!newChannelID || (oldChannelID !== newChannelID && bothDefined)) {
      const { member, channel } = oldState;
      const botOrMember = member?.user.bot ? 'bot' : 'member';
      this.client.emit(`${botOrMember}LeftChannel`, {
        member, channel, state: oldState, type: 'left',
      });
      // Custom events
      if (!member?.user.bot) this.client.emit(`${channel?.id}memberLeft`, member);
    }
  }
};
