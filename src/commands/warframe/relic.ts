import { Command } from 'klasa';

import type { CommandStore, KlasaMessage } from 'klasa';

export default class extends Command {
  constructor(...args: [CommandStore, string[], string]) {
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

  async enableFn(msg: KlasaMessage) {
    const { guild, channel } = msg;
    const path = `channels.${channel.id}.relicTracker.enabled`;
    const provider: any = this.client.providers.get('mongoose');
    await provider.Guild(guild?.id).then((doc: any) => doc.set(path, true));
    (msg as any).replyAndDelete('Tracker de relíquias habilitadas com sucesso neste canal!');
  }

  async disableFn(msg: KlasaMessage) {
    const { guild, channel } = msg;
    const path = `channels.${channel.id}.relicTracker.enabled`;
    const provider: any = this.client.providers.get('mongoose');
    await provider.Guild(guild?.id).then((doc: any) => doc.set(path, false));
    (msg as any).replyAndDelete('Tracker de relíquias desabilitadas com sucesso neste canal!');
  }
}
