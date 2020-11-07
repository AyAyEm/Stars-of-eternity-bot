import { Structures } from 'discord.js';

export class EternityVoiceChannel extends Structures.get('VoiceChannel') {
  get onlyMembers() {
    return this.members.filter((guildMember) => !guildMember.user.bot);
  }
}
