const { Command } = require('klasa');

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      runIn: ['text'],
      aliases: [],
      permissionLevel: 7,
      description: '',
      extendedHelp: 'No extended help available.',
      usage: '<enable|disable>',
      usageDelim: ' ',
      subcommands: true,
    });
  }

  async enable(msg) {
    const { guild, channel } = msg;
    const path = `channels.${channel.id}.relicTracker.enabled`;
    await this.client.provider.Guild(guild.id).then((doc) => doc.set(path, true));
    msg.replyAndDelete('Tracker de relíquias habilitadas com sucesso neste canal!');
  }

  async disable(msg) {
    const { guild, channel } = msg;
    const path = `channels.${channel.id}.relicTracker.enabled`;
    await this.client.provider.Guild(guild.id).then((doc) => doc.set(path, false));
    msg.replyAndDelete('Tracker de relíquias desabilitadas com sucesso neste canal!');
  }
};
