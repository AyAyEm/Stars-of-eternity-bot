import { Command, KlasaMessage } from 'klasa';

import type { CommandStore } from 'klasa';

export default class extends Command {
  constructor(...args: [CommandStore, string[], string]) {
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

  async run(message: KlasaMessage, [ammount]: [number]) {
    if (ammount >= 100) {
      (message as any).replyAndDelete('Não se pode excluir mais de 100 mensagens de uma vez!');
      return;
    }
    (message as any).channel.bulkDelete(Number(ammount) + 1)
      .catch((err: Error) => message.channel.send(`Couldn't delete the messages because:\n\`\`\`${err}\`\`\``));
  }
}
