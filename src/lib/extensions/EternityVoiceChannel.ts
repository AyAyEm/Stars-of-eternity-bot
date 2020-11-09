import { Structures } from 'discord.js';

import type { EternityGuild } from './EternityGuild';

export interface EternityVoiceChannel {
  guild: EternityGuild;
}

export class EternityVoiceChannel extends Structures.get('VoiceChannel') {
  get onlyMembers() {
    return this.members.filter((guildMember) => !guildMember.user.bot);
  }
}
