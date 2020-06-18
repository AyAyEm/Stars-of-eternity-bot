const { Command } = require('klasa');

module.exports = class extends Command {
  constructor(...args) {
    /**
     * Any default options can be omitted completely.
     * if all options are default, you can omit the constructor completely
     */
    super(...args, {
      enabled: true,
      runIn: ['text'],
      permissionLevel: 6,
      autoAliases: true,
      description: '',
      extendedHelp: 'No extended help available.',
      usage: '<ammount:string>',
      usageDelim: ' ',
    });
  }

  async run(msg, ammount) {
    if (ammount >= 100) {
      msg.replyAndDelete('Não se pode excluir mais de 100 mensagens de uma vez!');
      return;
    }
    msg.channel.bulkDelete(Number(ammount) + 1)
      .catch((err) => msg.channel.send(`Couldn't delete the messages because:\n\`\`\`${err}\`\`\``));
  }
};
