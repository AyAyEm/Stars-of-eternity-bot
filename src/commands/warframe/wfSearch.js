const { Command } = require('klasa');
const Fuse = require('fuse.js');
const Items = require('warframe-items');
const weapon = require('../../embeds/warframe/itemSearch/weapon');

const items = new Items();
const fuse = new Fuse(items, {
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
    const { channel } = msg;
    const matchedItems = fuse.search(itemName).slice(0, 3);
    if (matchedItems[0].score > 0.1) {
      channel.send('Item não encontrado');
      return;
    }
    const { item } = matchedItems[0];
    msg.channel.send(weapon(item));
  }
};
