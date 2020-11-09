import { EternityEvent } from '@lib';
import { Events } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';

import type { VoiceState } from 'discord.js';
import type { EventOptions } from '@sapphire/framework';

// TODO CLEAN UNECESSARY EVENT EMITTERS
@ApplyOptions<EventOptions>({ event: Events.VoiceStateUpdate })
export default class extends EternityEvent<Events.VoiceStateUpdate> {
  public async run(oldState: VoiceState, newState: VoiceState) {
    const oldChannelId = oldState.channelID;
    const newChannelId = newState.channelID;
    const bothDefined = oldChannelId && newChannelId;

    if (oldChannelId === newChannelId) return;

    // Member joined a channel
    if (!oldChannelId || (oldChannelId !== newChannelId && bothDefined)) {
      const { member, channel } = newState;
      const botOrMember = member?.user.bot ? 'bot' : 'member';
      if (this.client.id === member.id) this.client.emit('clientJoinedChannel', channel, newState);
      else this.client.emit(`${botOrMember}JoinedChannel`, channel, member, newState);

      // Custom events
      if (!member?.user.bot) this.client.emit(`${channel?.id}memberJoined`, member);
    }

    // Member left a channel
    if (!newChannelId || (oldChannelId !== newChannelId && bothDefined)) {
      const { member, channel } = oldState;
      const botOrMember = member?.user.bot ? 'bot' : 'member';
      if (this.client.id === member.id) this.client.emit('clientLeftChannel', channel, oldState);
      else this.client.emit(`${botOrMember}LeftChannel`, channel, member, oldState);

      // Custom events
      if (!member?.user.bot) this.client.emit(`${channel?.id}memberLeft`, member);
    }
  }
}
