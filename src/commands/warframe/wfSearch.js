const { Command } = require('klasa');
const Fuse = require('fuse.js');
const Items = require('warframe-items');
const weapon = require('../../embeds/warframe/itemSearch/weapon');

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

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      enabled: true,
      runIn: ['text', 'dm', 'group'],
      requiredPermissions: [],
      requiredSettings: [],
      aliases: [],
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
    if (matchedItems[0].score > 0.17) {
      channel.send('Item não encontrado');
      return;
    }
    const { item } = matchedItems[0];
    const embedsMap = weapon(item);
    const sentMessage = await msg.channel.send([...embedsMap.values()][0]);
    const isAuthorFilter = (...{ 1: user }) => author.id === user.id;
    const collectorOptions = { time: 120000, idle: 30000, dispose: true };
    const collector = sentMessage.createReactionCollector(isAuthorFilter, collectorOptions);
    collector.on('collect', (reaction) => {
      if (reaction.emoji.name === '❌') {
        collector.stop('User decided to end it');
        return;
      }
      sentMessage.edit(undefined, embedsMap.get(reaction.emoji.name));
      collector.resetTimer();
      reaction.users.remove(author);
    });
    collector.on('end', () => {
      const reason = 'Command ended';
      collector.message.delete({ reason });
      msg.delete({ reason });
    });
    await sentMessage.multiReact([...embedsMap.keys(), '❌']);
  }
};
