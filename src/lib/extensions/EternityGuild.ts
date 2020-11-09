import { Structures } from 'discord.js';
import { EternityVoiceChannel } from '@lib';

import type { GuildMember, Collection } from 'discord.js';

export class EternityGuild extends Structures.get('Guild') {
  get voiceChannels() {
    return this.channels.cache.filter(({ type }) => type === 'voice');
  }

  get channelWithMostMembers(): EternityVoiceChannel {
    const voiceChannels = this.channels.cache
      .filter((channel) => channel.type === 'voice') as Collection<string, EternityVoiceChannel>;

    return voiceChannels
      .map((channel) => {
        const userCount = channel.members
          .filter((member: GuildMember) => !member.user.bot)
          .keyArray().length;

        return { userCount, channel };
      })
      .sort(({ userCount: A }, { userCount: B }) => B - A)[0].channel;
  }
}
