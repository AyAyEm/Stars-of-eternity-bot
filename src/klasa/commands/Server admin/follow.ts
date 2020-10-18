import { Command } from 'klasa';

import type { GuildMember } from 'discord.js';
import type { CommandStore, KlasaMessage } from 'klasa';

export default class extends Command {
  constructor(...args: [CommandStore, string[], string]) {
    super(...args, {
      enabled: true,
      runIn: ['text'],
      permissionLevel: 6,
      description: '',
      extendedHelp: 'No extended help available.',
      usage: '<remove|list|add:default> (...members:memberResolver)',
      usageDelim: ' ',
      subcommands: true,
    });
    this.createCustomResolver('memberResolver', (arg, possible, msg) => {
      const { action } = (msg as any).prompter.args;
      if (action === 'list') return arg;
      return this.client.arguments.get('member').run(arg, possible, msg);
    });
  }

  async updateFollowState(guildId: string, members: GuildMember[], state: string) {
    const guildDocument = await (this.client.providers as any)
      .get('mongoose')
      .guildDocument(guildId);
    members.forEach(async (member) => {
      const path = `members.${member.id}.toFollow`;
      await guildDocument.updateOne({ [path]: state });
    });
  }

  async add(msg: KlasaMessage, [...members]) {
    if (msg.guild?.id) await this.updateFollowState(msg.guild.id, members, 'true');
    (msg as any).replyAndDelete('Membro(s) adicionados com sucesso!');
  }

  async remove(msg: KlasaMessage, [...members]) {
    if (msg.guild?.id) await this.updateFollowState(msg.guild.id, members, 'false');
    (msg as any).replyAndDelete('Membro(s) removidos com sucesso!');
  }

  async list(msg: KlasaMessage) {
    const guildDocument = await (this.client.providers as any)
      .get('mongoose')
      .guildDocument(msg.guild?.id);
    const members = guildDocument.get('members', Map);
    const following: GuildMember[] = [];
    await members.forEach(async (memberData: any, memberId: string) => {
      if (memberData.toFollow) {
        const guildMember = await msg.guild?.members.fetch(memberId);
        following.push(guildMember as GuildMember);
      }
    });
    if (following.length === 0) {
      msg.channel.send('O bot não está seguindo ninguém no momento!');
    }
    const membersName = following.map((member) => `Nome: ${member.user.username}, id: ${member.id}`);
    msg.channel.send('O bot está seguindo os seguintes membros:'
      + `\`\`\`${membersName.join(' |\n')}\`\`\``);
  }
}
