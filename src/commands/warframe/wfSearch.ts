import { Command } from 'klasa';
import { MessageEmbed } from 'discord.js';
import Fuse from 'fuse.js';
import Items from 'warframe-items';

import type { Category, Item } from 'warframe-items';
import type { User, GuildMember } from 'discord.js';
import type { KlasaMessage, CommandStore } from 'klasa';

import itemToEmbed from '../../embeds/warframe/itemSearch/index';
import { numberEmojis } from '../../static/numberEmojis';

const warframeItems: Category[] = [
  'Archwing', 'Sentinels', 'Warframes',
  'Melee', 'Mods', 'Pets', 'Primary',
  'Relics', 'Resources', 'Secondary',
];

const fuse = new Fuse(new Items({ category: warframeItems }), {
  includeScore: true,
  shouldSort: true,
  keys: ['name'],
});

function isAuthorFilter(author: User | GuildMember) {
  return function checkIfUserIsAuthor(_: any, user: User) {
    return author.id === user.id;
  };
}

const sendItemMessage = async (
  item: Item, msg: KlasaMessage, previousSentMessage?: KlasaMessage,
) => {
  const { author } = msg;
  const embedsMap = itemToEmbed(item);
  const sentMessage = previousSentMessage
    ? await previousSentMessage.edit(undefined, [...(embedsMap?.values() || [])][0])
    : await msg.channel.send([...(embedsMap?.values() || [])][0]);
  const timerOptions = { time: 0, idle: 240000 };
  const collector = sentMessage
    .createReactionCollector(isAuthorFilter(author), { ...timerOptions, dispose: true });
  collector.on('collect', (reaction) => {
    if (reaction.emoji.name === '❌') {
      collector.stop('User decided to end it');
      return;
    }
    sentMessage.edit(undefined, embedsMap?.get(reaction.emoji.name));
    collector.resetTimer(timerOptions);
    reaction.users.remove(author);
  });
  collector.on('end', () => {
    // const reason = 'Command ended';
    // msg.delete({ reason });
    // collector.message.delete({ reason });
    collector.message.reactions.removeAll();
  });
  (sentMessage as any).multiReact([...(embedsMap?.keys() || []), '❌']);
};

export default class extends Command {
  constructor(...args: [CommandStore, string[], string]) {
    super(...args, {
      enabled: true,
      runIn: ['text'],
      requiredPermissions: [],
      requiredSettings: [],
      aliases: ['wfs', 's'],
      autoAliases: true,
      bucket: 1,
      cooldown: 0,
      promptLimit: 0,
      promptTime: 30000,
      permissionLevel: 0,
      description: '',
      extendedHelp: 'No extended help available.',
      usage: '<item:string>',
      usageDelim: undefined,
      quotedStringSupport: false,
      subcommands: false,
    });
  }

  async run(msg: KlasaMessage, [itemName]: [string]) {
    const { channel, author } = msg;
    const matchedItems = fuse.search(itemName).slice(0, 3);

    if ((matchedItems[0].score || 0) > 0.15) {
      const matchItemsString = matchedItems
        .map(({ item }, index) => `${numberEmojis[index + 1]} ${item.name} ${item.category}`);

      const noMatchEmbed = new MessageEmbed()
        .setTitle('Item não encontrado')
        .setDescription(`Selecione um dos seguintes items:\n\n${matchItemsString.join('\n\n')}`);

      const noMatchMessage = await channel.send(noMatchEmbed);
      const collector = noMatchMessage
        .createReactionCollector(isAuthorFilter(author), { time: 15000 });
      const reactions = await (noMatchMessage as any).multiReact([...numberEmojis.slice(1, 4), '❌']);
      collector.on('collect', async (reaction) => {
        if (reaction.emoji.name === '❌') {
          collector.stop('User decided to stop');
          return;
        }

        reactions.stopReactions();
        await reactions.reactionLoop;
        const index = numberEmojis.indexOf(reaction.emoji.name);
        reaction.message.reactions.removeAll();
        collector.stop('Reaction defined');
        sendItemMessage(matchedItems[index - 1].item, msg, noMatchMessage as KlasaMessage);
      });

      collector.on('end', (_, endingReason) => {
        if (endingReason === 'time' || endingReason === 'User decided to stop') {
          // msg.delete({ endingReason });
          collector.message.delete({ reason: endingReason });
        }
      });
    } else {
      sendItemMessage(matchedItems[0].item, msg);
    }
  }
}
