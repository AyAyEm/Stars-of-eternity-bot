import { Command } from 'klasa';

import type { CommandStore, KlasaMessage } from 'klasa';

import { itemNames } from '../../static/warframe/itemNames';
import { biFilter } from '../../utils';

export default class extends Command {
  constructor(...args: [CommandStore, string[], string]) {
    super(...args, {
      runIn: ['dm'],
      aliases: ['seguir', 'f', 's'],
      description: 'Cadastrar notificações sobre especificidades no warframe.',
      extendedHelp: 'No extended help available.',
      usage: '<items> (method:method) [...params]',
      usageDelim: ' ',
      subcommands: true,
      permissionLevel: 0,
    });
    const subCommandMethods = {
      items: new Map([
        // ['add'],
        // ['remove'],
        // ['list'],
        ['default', 'list'],
      ]),
    };

    this.createCustomResolver('method', (method, _possible, message, params) => {
      const methods = (subCommandMethods as any)[params[0]];
      const defaultMethod = methods.get('default');
      if (!methods) return method;
      if (!methods.has(method) && !defaultMethod) {
        throw new Error(`Método "${method}" inválido. Possíveis métodos: ${methods.join(' | ')}`);
      } else if (defaultMethod && !methods.has(method)) {
        return [defaultMethod, ...((message as any).prompter?.args.slice(2) || [])];
      }
      return (message as any).prompter?.args.slice(1);
    });
  }

  async items(msg: KlasaMessage, [[method, ...items]]: any[]) {
    const warframeItems = items.filter((item: string) => (itemNames as any).includes(item));

    const provider = this.client.providers.get('mongoose');
    const userDoc = await (provider as any).User(msg.author.id);
    const storedItems = userDoc.get('settings.follow.items', []);

    const itemsMDFormat = `\`\`\`\n${items.join(' | ')}\`\`\``;

    const checkItems = async (whitelistItems: string[] = []) => {
      const possibleItems = (itemNames as any).concat(whitelistItems);
      const [
        notIncludedItems,
        includedItems,
      ] = biFilter(items, (item: string) => !possibleItems.includes(item));

      if (includedItems.length === 0) {
        msg.channel.send(`Nenhuma das seguintes opções são compatíveis: ${itemsMDFormat}`);
        return false;
      }

      if (notIncludedItems.length > 0) {
        const incompatibleItemsMessage = await msg.channel.send(
          'Os seguintes items são incompatíveis:\n'
          + `\`\`\`${notIncludedItems.join(' | ')}\`\`\``
          + 'Dos items:'
          + `\`\`\`${items.join(' | ')}\`\`\``
          + 'Você deseja continuar sem estes items?',
        );

        const reactions = ['✔', '❌'];

        (incompatibleItemsMessage as any).multiReact(reactions);

        const reaction = (await incompatibleItemsMessage
          .awaitReactions(({ emoji }, { bot }) => !bot && reactions.includes(emoji.name),
            { max: 1, time: 30000 })).first();

        incompatibleItemsMessage.delete();

        if (!reaction || reaction.emoji.name === '❌') return (false);
      }
      return (true);
    };

    const methods = {
      async add() {
        if (!(await checkItems())) return;

        const toStoreItems = storedItems
          .filter((item: string) => !warframeItems.includes(item))
          .concat(warframeItems);

        const updatedUserDoc = await userDoc.set('settings.follow.items', toStoreItems);

        msg.channel.send('Os seguintes items foram adicionados:'
          + `\n\`\`\`${warframeItems.join(' | ') || ' '}\`\`\`\n`
          + 'Os seus items atuais são:'
          + `\n\`\`\`${(updatedUserDoc.get('settings.follow.items').join(' | '))}\`\`\``);
      },

      async remove() {
        if (items.length === 0) {
          (msg as any).replyAndDelete('Nenhum item foi especificado.');
        }

        const allItemsParam = ['all', 'todos'];

        if (!(await checkItems(allItemsParam))) return;

        if (['all', 'todos'].includes(items[0])) {
          await userDoc.set('settings.follow.items', []);
          msg.channel.send('Foram removidos todos os items de seu cadastro');
        } else {
          const updatedItemsList = storedItems.filter((item: string) => !items.includes(item));
          await userDoc.set('settings.follow.items', updatedItemsList);
        }
      },

      list() {
        const memberItemsList = '`'
          + 'Seus items adicionados:`\n'
          + '```'
          + `${storedItems.join(' | ') || ' '}\n`
          + '```';
        const possibleItemsList = '`'
          + 'Possíveis items:`\n'
          + '```'
          + `${(itemNames as any).join(' | ')}`
          + '```';
        msg.channel.send(`${storedItems.length > 0 ? memberItemsList : ''}${possibleItemsList}`);
      },
    };

    (methods as any)[method]();
  }
}
