import { Event, Events, PieceContext } from '@sapphire/framework';

import type { VoiceState } from 'discord.js';

// TODO CLEAN UNECESSARY EVENT EMITTERS
export default class extends Event<Events.VoiceStateUpdate> {
  public constructor(context: PieceContext) {
    super(context, { event: Events.VoiceStateUpdate });
  }

  public async run(oldState: VoiceState, newState: VoiceState) {
    const oldChannelId = oldState.channelID;
    const newChannelId = newState.channelID;
    const bothDefined = oldChannelId && newChannelId;
    if (oldChannelId === newChannelId) return;
    // Member joined a channel
    if (!oldChannelId || (oldChannelId !== newChannelId && bothDefined)) {
      const { member, channel } = newState;
      const botOrMember = member?.user.bot ? 'bot' : 'member';
      this.client.emit(`${botOrMember}JoinedChannel`, {
        member, channel, state: newState, type: 'join',
      });
      // Custom events
      if (!member?.user.bot) this.client.emit(`${channel?.id}memberJoined`, member);
    }
    // Member left a channel
    if (!newChannelId || (oldChannelId !== newChannelId && bothDefined)) {
      const { member, channel } = oldState;
      const botOrMember = member?.user.bot ? 'bot' : 'member';
      this.client.emit(`${botOrMember}LeftChannel`, {
        member, channel, state: oldState, type: 'left',
      });
      // Custom events
      if (!member?.user.bot) this.client.emit(`${channel?.id}memberLeft`, member);
    }
  }
}
