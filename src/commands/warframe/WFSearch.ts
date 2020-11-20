import { ApplyOptions } from '@sapphire/decorators';
import { EternityCommand, EternityMessage } from '@lib';
import { CommandOptions, Args } from '@sapphire/framework';
import { MessageEmbed } from 'discord.js';
import async from 'async';
import FuzzySet from 'fuzzyset.js';

import itemToEmbed from '@embeds/warframe/itemSearch';
import { numberEmojis } from '@utils/Constants';

import type { User, GuildMember } from 'discord.js';
import type { Item } from 'warframe-items';

function isAuthorFilter(author: User | GuildMember) {
  return function checkIfUserIsAuthor(_: any, user: User) {
    return author.id === user.id;
  };
}

@ApplyOptions<CommandOptions>({
  aliases: ['wfs'],
  preconditions: [],
})
export default class extends EternityCommand {
  public items = this.client.warframe.items;

  public itemNames = Promise.resolve(this.items.uniqueNameDict).then(Object.keys);

  public fuzzySet = this.itemNames.then(FuzzySet);

  public async run(msg: EternityMessage, args: Args) {
    const itemName = await args.rest('string');
    const { channel, author } = msg;
    const fuzzySet = await this.fuzzySet;
    const matchedItems: { item: Item, score: number }[] = await async.map(
      fuzzySet.get(itemName).slice(0, 3), async ([score, name]) => {
        const item = await this.items.get(name);
        return { item, score };
      },
    );

    if ((matchedItems[0].score || 0) < 0.15) {
      const matchItemsString = matchedItems
        .map(({ item }, index: number) => `${numberEmojis[index + 1]} ${item.name} ${item.category}`);

      const noMatchEmbed = new MessageEmbed()
        .setTitle('Item não encontrado')
        .setDescription(`Selecione um dos seguintes items:\n\n${matchItemsString.join('\n\n')}`);

      const noMatchMessage = (await channel.send(noMatchEmbed)) as EternityMessage;
      const collector = noMatchMessage
        .createReactionCollector(isAuthorFilter(author), { time: 15000 });
      const reactions = noMatchMessage.multiReact([...numberEmojis.slice(1, 4), '❌']);
      collector.on('collect', async (reaction) => {
        if (reaction.emoji.name === '❌') {
          collector.stop('User decided to stop');
          return;
        }

        reactions.stopReactions();
        await reactions;
        const index = numberEmojis.indexOf(reaction.emoji.name);
        reaction.message.reactions.removeAll();
        collector.stop('Reaction defined');
        this.sendItemMessage(matchedItems[index - 1].item, msg, noMatchMessage as EternityMessage);
      });

      collector.on('end', (_, endingReason) => {
        if (endingReason === 'time' || endingReason === 'User decided to stop') {
          // msg.delete({ endingReason });
          collector.message.delete({ reason: endingReason });
        }
      });
    } else {
      this.sendItemMessage(matchedItems[0].item, msg);
    }
  }

  public async sendItemMessage(
    item: Item, msg: EternityMessage, previousSentMessage?: EternityMessage,
  ) {
    const { author } = msg;
    const embedsMap = itemToEmbed(item);
    const sentMessage = previousSentMessage
      ? await previousSentMessage.edit(
        undefined, [...(embedsMap?.values() || [])][0],
      ) as EternityMessage
      : await msg.channel.send([...(embedsMap?.values() || [])][0]) as EternityMessage;
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
    sentMessage.multiReact([...(embedsMap?.keys() || []), '❌']);
  }
}
