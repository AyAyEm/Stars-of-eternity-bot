import { Structures } from 'discord.js';

export class EternityGuild extends Structures.get('Guild') {
  get voiceChannels() {
    return this.channels.cache.filter(({ type }) => type === 'voice');
  }
}
