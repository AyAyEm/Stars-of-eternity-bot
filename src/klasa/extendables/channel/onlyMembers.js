const { Extendable } = require('klasa');
const { VoiceChannel } = require('discord.js');

module.exports = class extends Extendable {
  constructor(...args) {
    super(...args, {
      enabled: true,
      appliesTo: [VoiceChannel],
    });
  }

  get onlyMembers() {
    return this.members.filter((guildMember) => !guildMember.user.bot);
  }
};
