const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');
const Fuse = require('fuse.js');
const Items = require('warframe-items');
const itemToEmbed = require('../../embeds/warframe/itemSearch/index');
const numberEmojis = require('../../../static/numberEmojis');

const warframeItems = [
  'Archwing', 'Arch-Gun', 'Arch-Melee',
  'Melee', 'Mods', 'Pets', 'Primary',
  'Relics', 'Resources', 'Secondary',
  'Sentinels', 'Warframes',
];
const fuse = new Fuse(new Items({ category: warframeItems }), {
  includeScore: true,
  shouldSort: true,
  keys: ['name'],
});
const isAuthorFilter = (author) => (...{ 1: user }) => author.id === user.id;
const sendItemMessage = async (item, msg, previousSentMessage) => {
  const { author } = msg;
  const embedsMap = itemToEmbed(item);
  const sentMessage = previousSentMessage
    ? await previousSentMessage.edit(undefined, [...embedsMap.values()][0])
    : await msg.channel.send([...embedsMap.values()][0]);
  const timerOptions = { time: 0, idle: 240000 };
  const collector = sentMessage
    .createReactionCollector(isAuthorFilter(author), { ...timerOptions, dispose: true });
  collector.on('collect', (reaction) => {
    if (reaction.emoji.name === '❌') {
      collector.stop('User decided to end it');
      return;
    }
    sentMessage.edit(undefined, embedsMap.get(reaction.emoji.name));
    collector.resetTimer(timerOptions);
    reaction.users.remove(author);
  });
  collector.on('end', () => {
    const reason = 'Command ended';
    msg.delete({ reason });
    collector.message.delete({ reason });
  });
  await sentMessage.multiReact([...embedsMap.keys(), '❌']);
};

module.exports = class extends Command {
  constructor(...args) {
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

  async run(msg, [itemName]) {
    const { channel, author } = msg;
    const matchedItems = fuse.search(itemName).slice(0, 3);
    if (matchedItems[0].score > 0.15) {
      const matchesString = ({ item }, index) => `${numberEmojis[index + 1]} ${item.name} ${item.category}`;
      const noMatchEmbed = new MessageEmbed()
        .setTitle('Item não encontrado')
        .setDescription(`Selecione um dos seguintes items:\n\n${matchedItems.map(matchesString).join('\n\n')}`);
      const noMatchMessage = await channel.send(noMatchEmbed);
      const collector = noMatchMessage
        .createReactionCollector(isAuthorFilter(author), { time: 15000 });
      const { reactionLoop, stopReactions } = await noMatchMessage.multiReact([...numberEmojis.slice(1, 4), '❌']);
      collector.on('collect', async (reaction) => {
        if (reaction.emoji.name === '❌') {
          collector.stop('User decided to stop');
          return;
        }
        stopReactions();
        await reactionLoop;
        const index = numberEmojis.indexOf(reaction.emoji.name);
        reaction.message.reactions.removeAll();
        collector.stop('Reaction defined');
        sendItemMessage(matchedItems[index - 1].item, msg, noMatchMessage);
      });
      collector.on('end', (...{ 1: endingReason }) => {
        if (endingReason === 'time' || endingReason === 'User decided to stop') {
          msg.delete({ endingReason });
          collector.message.delete({ endingReason });
        }
      });
    } else {
      sendItemMessage(matchedItems[0].item, msg);
    }
  }
};
