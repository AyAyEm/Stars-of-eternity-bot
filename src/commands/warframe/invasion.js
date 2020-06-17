const { Command } = require('klasa');
const invasionItemsEmbed = require('../../embeds/warframe/invasionItems');

const possibleItems = new Set([
  'all',
  'vauban', 'vandal', 'wraith', 'skin', 'helmet',
  'nitain', 'mutalist', 'weapon', 'fieldron', 'detonite',
  'mutagen', 'aura', 'neuralSensors', 'orokinCell', 'alloyPlate',
  'circuits', 'controlModule', 'ferrite', 'gallium', 'morphics',
  'nanoSpores', 'oxium', 'rubedo', 'salvage', 'plastids', 'polymerBundle',
  'argonCrystal', 'cryotic', 'tellurium', 'neurodes', 'nightmare', 'endo',
  'reactor', 'catalyst', 'forma', 'synthula', 'exilus', 'riven', 'kavatGene',
  'kubrowEgg', 'traces', 'other', 'credits',
]);

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      enabled: true,
      runIn: ['text'],
      autoaliases: true,
      permissionLevel: 0,
      subcommands: true,
      usage: '<listItems|add|disable|enable|delete|set:default> (...items:invasionItem) [...]',
      usageDelim: ' ',
      description: '',
      extendedHelp: 'No extended help available.',
    });
    this
      .createCustomResolver('invasionItem', (arg, possible, msg) => {
        const semiRequired = new Set(['add', 'set']);
        const [action] = msg.prompter.args;
        if (!semiRequired.has(action)) return arg;
        if (arg && !possibleItems.has(arg)) {
          throw `Item ${arg} inválido para listar as opções digite /invasion listItems!`;
        }
        return arg;
      });
  }

  async updateItems(guildDocument, channel, items) {
    return guildDocument.updateOne(`channels.${channel.id}.invasionItems.items`, items);
  }

  async updateStatus(guildDocument, channel, status) {
    return guildDocument.updateOne(`channels.${channel.id}.invasionItems.enabled`, status);
  }

  async set(msg, [items = 'all']) {
    await msg.channel.setNewData({ items: items.split(','), enabled: true });
    msg.replyAndDelete('Todos os items de invasão foram assinados neste canal!');
  }

  async add(msg, [...items]) {
    if (items.length === 0) throw 'Items precisam ser específicados!';
    const provider = await this.client.providers.get('mongoose');
    const guildDocument = await provider.Guilds.findOne({ id: msg.guild.id });
    const invasionItems = guildDocument.get(`channels.${msg.channel.id}.invasionItems`);
    if (!invasionItems) throw 'Este canal não está configurado para invasões!';
    const itemsData = new Set([...invasionItems.items, ...items]);
    const data = { items: [...itemsData.values()], enabled: invasionItems.enabled };
    await msg.channel.setNewData(data);
  }

  async disable(msg) {
    const provider = await this.client.providers.get('mongoose');
    const guildDocument = await provider.Guilds.findOne({ id: msg.guild.id });
    const invasionItems = guildDocument.get(`channels.${msg.channel.id}.invasionItems`) || {};
    if (invasionItems.enabled === false) {
      throw 'Invasões já estão desabilitadas para este canal!';
    }
    const { items } = invasionItems;
    msg.channel.setNewData({ items, enabled: false });
    msg.replyAndDelete('Invasões desabilitadas com sucesso!');
  }

  async enable(msg) {
    const provider = await this.client.providers.get('mongoose');
    const guildDocument = await provider.Guilds.findOne({ id: msg.guild.id });
    const invasionItems = guildDocument.get(`channels.${msg.channel.id}.invasionItems`) || {};
    if (invasionItems.enabled === true) {
      throw 'Invasões já estão habilitadas para este canal!';
    }
    const { items } = invasionItems;
    msg.channel.setNewData({ items, enabled: true });
    msg.replyAndDelete('Invasões habilitadas com sucesso!');
  }

  async delete(msg) {
    const provider = await this.client.providers.get('mongoose');
    const guildDocument = await provider.Guilds.findOne({ id: msg.guild.id });
    const invasionItems = guildDocument.get(`channels.${msg.channel.id}.invasionItems`) || {};
    if (!invasionItems.items || invasionItems.items.length === 0) {
      throw 'Os items de invasão ainda não foram definidos para este canal!';
    }
    const enabled = invasionItems.enabled === undefined ? true : invasionItems.enabled;
    await msg.channel.setNewData({ items: [], enabled });
    msg.replyAndDelete('Items de invasão excluídos com sucesso!');
  }

  async listItems(msg) {
    msg.channel.send(invasionItemsEmbed);
  }
};
