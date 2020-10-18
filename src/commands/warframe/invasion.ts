import { Command } from 'klasa';

import type { Channel } from 'discord.js';
import type { CommandStore, KlasaGuild, KlasaMessage } from 'klasa';

import invasionItemsEmbed from '../../embeds/warframe/invasionItems';

const possibleItems = new Set([
  'vauban', 'vandal', 'wraith', 'skin', 'helmet',
  'nitain', 'mutalist', 'weapon', 'fieldron', 'detonite',
  'mutagen', 'aura', 'neuralSensors', 'orokinCell', 'alloyPlate',
  'circuits', 'controlModule', 'ferrite', 'gallium', 'morphics',
  'nanoSpores', 'oxium', 'rubedo', 'salvage', 'plastids', 'polymerBundle',
  'argonCrystal', 'cryotic', 'tellurium', 'neurodes', 'nightmare', 'endo',
  'reactor', 'catalyst', 'forma', 'synthula', 'exilus', 'riven', 'kavatGene',
  'kubrowEgg', 'traces', 'other', 'credits',
]);

export default class extends Command {
  constructor(...args: [CommandStore, string[], string]) {
    super(...args, {
      enabled: true,
      runIn: ['text'],
      autoAliases: true,
      permissionLevel: 6,
      subcommands: true,
      usage: '<items|listItems|add|disable|enable|delete|forceDelete|set> '
        + '(...items:invasionItem) [...]',
      usageDelim: ' ',
      description: '',
      extendedHelp: 'No extended help available.',
    });
    this
      .createCustomResolver('invasionItem', (arg, _possible, msg) => {
        const semiRequired = new Set(['add', 'set']);
        const [action] = (msg as any).prompter?.args || [];
        if (!semiRequired.has(action)) return arg;
        if (arg && !possibleItems.has(arg)) {
          throw new Error(`Item ${arg} inválido para listar as opções digite /invasion listItems!`);
        }
        return arg;
      });
  }

  async getDocument(guild: KlasaGuild) {
    const provider: any = this.client.providers.get('mongoose');
    return provider.Guilds.findOne({ id: guild.id });
  }

  async updateItems(guildDocument: any, channel: Channel, items: string[]) {
    const path = `channels.${channel.id}.invasionItems.items`;
    return guildDocument.updateOne({ [path]: items });
  }

  async updateStatus(guildDocument: any, channel: Channel, status: boolean) {
    const path = `channels.${channel.id}.invasionItems.enabled`;
    return guildDocument.updateOne({ [path]: status });
  }

  async set(msg: KlasaMessage, [items = [...possibleItems.values()]]) {
    const { channel, guild } = msg;
    const { updateItems, updateStatus } = this;
    const guildDocument = await this.getDocument(guild as KlasaGuild);
    if (guildDocument.get(`channels.${channel.id}.invasionItems`)) {
      throw new Error('Canal já está registrado!');
    }
    await Promise.all([
      updateItems(guildDocument, channel, items),
      updateStatus(guildDocument, channel, true),
    ])
      .then(() => {
        (msg as any).replyAndDelete('Canal inscrito nas invasões com sucesso! Items:'
          + `\`\`\`${items.join(' | ')}\`\`\``);
      });
  }

  async add(msg: KlasaMessage, [...items]) {
    const { channel, guild } = msg;
    const { updateItems } = this;
    const guildDocument = await this.getDocument(guild as KlasaGuild);
    const invasionItems = guildDocument.get(`channels.${channel.id}.invasionItems`);
    if (!invasionItems) throw new Error('Este canal não está configurado para invasões!');
    if (items.length === 0) throw new Error('Items precisam ser específicados!');
    const updatedItems = items[0] === 'all' ? possibleItems : items;
    const itemsData = new Set([...invasionItems.items, ...updatedItems]);
    await updateItems(guildDocument, channel, [...itemsData.values()]);
    (msg as any).replyAndDelete(`Items inscritos com sucesso! Items: \`${items}\``);
  }

  async disableFn(msg: KlasaMessage) {
    const { channel, guild } = msg;
    const { updateStatus } = this;
    const guildDocument = await this.getDocument(guild as KlasaGuild);
    const invasionItems = guildDocument.get(`channels.${msg.channel.id}.invasionItems`) || {};
    if (invasionItems.enabled === false) {
      throw new Error('Invasões já estão desabilitadas para este canal!');
    }
    await updateStatus(guildDocument, channel, false);
    (msg as any).replyAndDelete('Invasões desabilitadas com sucesso!');
  }

  async enableFn(msg: KlasaMessage) {
    const { channel, guild } = msg;
    const { updateStatus } = this;
    const guildDocument = await this.getDocument(guild as KlasaGuild);
    const invasionItems = guildDocument.get(`channels.${msg.channel.id}.invasionItems`) || {};
    if (invasionItems.enabled === true) {
      throw new Error('Invasões já estão habilitadas para este canal!');
    }
    await updateStatus(guildDocument, channel, true);
    (msg as any).replyAndDelete('Invasões habilitadas com sucesso!');
  }

  async delete(msg: KlasaMessage, [...items]) {
    const { guild, channel } = msg;
    const guildDocument = await this.getDocument(guild as KlasaGuild);
    const itemsPath = `channels.${channel.id}.invasionItems.items`;
    const invasionItems = guildDocument.get(itemsPath) || [];
    if (invasionItems.length === 0) {
      throw new Error('Os items de invasão ainda não foram definidos para este canal!');
    }
    const updatedItems = items.length > 0
      ? invasionItems.filter((invasionItem: string) => !items.includes(invasionItem))
      : [];
    await guildDocument.updateOne({ [itemsPath]: updatedItems });
    (msg as any).replyAndDelete('Items de invasão excluídos com sucesso!'
      + `\`\`\`${invasionItems.filter((invasionItem: string) => !updatedItems.includes(invasionItem)).join(' | ')}\`\`\``);
  }

  async forceDelete(msg: KlasaMessage) {
    const { channel, guild } = msg;
    const guildDocument = await this.getDocument(guild as KlasaGuild);
    const channelPath = `channels.${channel.id}`;
    const channelDocument = guildDocument.get(channelPath).toObject();
    delete channelDocument.invasionItems;
    await guildDocument.updateOne({ [channelPath]: channelDocument });
    (msg as any).replyAndDelete('Items de invasão removidos do database com sucesso!');
  }

  async items(msg: KlasaMessage) {
    const guildDocument = await this.getDocument(msg.guild as KlasaGuild);
    const items = guildDocument.get(`channels.${msg.channel.id}.invasionItems.items`);
    if (!items || items.length === 0) {
      throw new Error('Nenhum item de invasão encontrado para este canal!');
    }
    msg.channel.send(`\`\`\`Items encontrados: \n${items.join(' | ')}\`\`\``);
  }

  async listItems(msg: KlasaMessage) {
    msg.channel.send(invasionItemsEmbed);
  }
}
