const { Command } = require('klasa');

module.exports = class extends Command {
  constructor(...args) {
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
      const [action] = msg.prompter.args;
      if (action === 'list') return arg;
      return this.client.arguments.get('member').run(arg, possible, msg);
    });
  }

  async updateFollowState(guildId, members, state) {
    const guildDocument = await this.client.providers
      .get('mongoose')
      .guildDocument(guildId);
    members.forEach(async (member) => {
      const path = `members.${member.id}.toFollow`;
      await guildDocument.updateOne({ [path]: state });
    });
  }

  async add(msg, [...members]) {
    await this.updateFollowState(msg.guild.id, members, true);
    msg.replyAndDelete('Membro(s) adicionados com sucesso!');
  }

  async remove(msg, [...members]) {
    await this.updateFollowState(msg.guild.id, members, false);
    msg.replyAndDelete('Membro(s) removidos com sucesso!');
  }

  async list(msg) {
    const guildDocument = await this.client.providers
      .get('mongoose')
      .guildDocument(msg.guild.id);
    const members = guildDocument.get('members', Map);
    const following = [];
    await members.forEach(async (memberData, memberId) => {
      if (memberData.toFollow) {
        const guildMember = await msg.guild.members.fetch(memberId);
        following.push(guildMember);
      }
    });
    if (following.length === 0) {
      msg.channel.send('O bot não está seguindo ninguém no momento!');
    }
    const membersName = following.map((member) => `Nome: ${member.user.username}, id: ${member.id}`);
    msg.channel.send('O bot está seguindo os seguintes membros:'
    + `\`\`\`${membersName.join(' |\n')}\`\`\``);
  }
};
