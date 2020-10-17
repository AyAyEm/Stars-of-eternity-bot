import { Command } from 'klasa';
import _ from 'lodash';

import type { CommandStore, KlasaMessage, Possible } from 'klasa';
import type { Role, Emoji, Guild, Message, MessageReaction } from 'discord.js';

import { mapToEmbed, firstEmbed } from '../../embeds/roleReaction';
import { unicodeEmojiRegex } from '../../utils';

const updateEmojis = (rolesEmoji = new Map(), role: Role, emoji: Emoji, description = '') => {
  if (role && emoji) {
    const emojiID = emoji.id || emoji.name;
    if (rolesEmoji.has(emojiID)) {
      throw new Error('Este roleReaction já possuí esta reação');
    }
    rolesEmoji.set(emojiID, { roleID: role.id, description });
  }
  return rolesEmoji;
};

const filterRoleReactionMessages = (messagesMap: Map<string, KlasaMessage>) => {
  const lastMessages = [...messagesMap.entries()]
    .filter(({ 1: value }) => (value as any).msgType === 'roleReaction')
    .map(([key]) => key);
  return lastMessages;
};

export default class extends Command {
  constructor(...args: [CommandStore, string[], string]) {
    super(...args, {
      enabled: true,
      runIn: ['text'],
      autoAliases: true,
      permissionLevel: 6,
      description: '',
      extendedHelp: 'No extended help available.',
      usage: '<create|delete|add|renew> '
        + '(roleOrMessageOrOption:firstParam) '
        + '(emoji:secondParam) '
        + '(descOrMessage:thirdParam) '
        + '[...]',
      usageDelim: ' ',
      quotedStringSupport: false,
      subcommands: true,
    });

    type ActionValidatorArgs = [number, string, Possible, KlasaMessage, any[]];
    type ActionValidator = (...argumentsArray: ActionValidatorArgs) => any | undefined;
    const actionsValidators = new Map<string, ActionValidator>([
      ['create', (resolver, arg, possible, msg, [role, emoji, description]) => {
        const actionArgument = ['role', 'emoji', 'string'];
        if ((role || emoji) && resolver < 2) {
          return this.client.arguments.get(actionArgument[resolver]).run(arg, possible, msg);
        }
        if (resolver === 2 && description) {
          return this.client.arguments.get(actionArgument[resolver]).run(arg, possible, msg);
        }
        return undefined;
      }],
      ['add', (resolver, arg, possible, msg, { 2: description }) => {
        const actionArgument = ['role', 'emoji', 'message'];
        if (resolver === 2 && !description) return undefined;
        return this.client.arguments.get(actionArgument[resolver]).run(arg, possible, msg);
      }],
      ['delete', (resolver, arg, possible, msg, [msgParam]) => {
        if (msgParam && resolver === 0) {
          return this.client.arguments.get('message').run(arg, possible, msg);
        }
        return undefined;
      }],
      ['renew', (resolver, arg, possible, msg, [option]) => {
        const actionArgument = ['string'];
        if (option && resolver === 0) {
          return this.client.arguments.get(actionArgument[resolver]).run(arg, possible, msg);
        }
        return undefined;
      }],
    ]);
    this
      .createCustomResolver('firstParam', (arg, possible, msg) => {
        const [action, role, emoji] = (msg as any).prompter?.args || [];
        return actionsValidators.get(action)?.(0, arg, possible, msg, [role, emoji]);
      })
      .createCustomResolver('secondParam', (arg, possible, msg) => {
        const [action, role, emoji] = (msg as any).prompter?.args || [];
        return actionsValidators.get(action)?.(1, arg, possible, msg, [role, emoji]);
      })
      .createCustomResolver('thirdParam', (arg, possible, msg) => {
        const [action, ...params] = (msg as any).prompter?.args || [];
        return actionsValidators.get(action)?.(2, arg, possible, msg, [...params]);
      });
  }

  async updateEmbed(embedMessage: KlasaMessage, data: any) {
    const embed = await mapToEmbed(embedMessage.guild as Guild, data);
    embedMessage.edit(embed);
  }

  async updateReactions(embedMessage: Message) {
    const provider: any = await this.client.providers.get('mongoose');
    const { messages } = await provider.getMessages(embedMessage);
    const { rolesEmoji } = messages.get(embedMessage.id);
    rolesEmoji.forEach(async (_roleEmoji: any, emojiID: string) => {
      const emoji = unicodeEmojiRegex.test(emojiID) ? emojiID
        : await this.client.emojis.resolve(emojiID);
      if (emoji) embedMessage.react(emoji);
    });
  }

  async create(msg: KlasaMessage, [role, emoji, description]: [Role, Emoji, string]) {
    const provider: any = await this.client.providers.get('mongoose');
    const { guildDocument } = await provider.getMessages(msg);
    const rolesEmojiMap = updateEmojis(undefined, role, emoji, description);
    const embed = role && emoji ? await mapToEmbed(msg.guild as Guild, rolesEmojiMap) : firstEmbed;
    msg.channel.send(embed).then(async (embedMessage) => {
      guildDocument.channels = (embedMessage as any).newMap(guildDocument, {
        msgType: 'roleReaction',
        rolesEmoji: updateEmojis(undefined, role, emoji, description),
      });
      await guildDocument.save();
      if (role && emoji) {
        this.updateReactions(embedMessage);
      }
    });
  }

  async delete(msg: KlasaMessage, [inputMessage]: [KlasaMessage]) {
    const provider: any = await this.client.providers.get('mongoose');
    const { messages, guildDocument } = await provider.getMessages(msg);
    if (!messages) throw new Error('Este canal não possui role reactions!');
    const embedMessage = inputMessage || await (function getMessage() {
      const finalMessages = filterRoleReactionMessages(messages);
      if (finalMessages.length < 1) throw new Error('Este canal não possui role reactions!');
      return msg.channel.messages.fetch(finalMessages[0]);
    }());
    messages.delete(embedMessage.id);
    await guildDocument.save();
    embedMessage.delete();
    (msg as any).replyAndDelete(`Role reaction: ${embedMessage.id} deletado com sucesso!`);
  }

  async add(msg: KlasaMessage, [role, emoji, roleMessage]: [Role, Emoji, Message]) {
    const provider: any = await this.client.providers.get('mongoose');
    const { messages, guildDocument } = await provider.getMessages(msg);
    const roleReactionMessages = filterRoleReactionMessages(messages);
    const embedMessage = roleMessage || await msg.channel.messages
      .fetch(_.last<any>(roleReactionMessages));
    if (!messages || !embedMessage || !messages.has(embedMessage.id)) {
      throw new Error('Este canal não possui role reaction!');
    }
    const emojisMap = messages.get(embedMessage.id).rolesEmoji;
    const roleEmojis = updateEmojis(emojisMap, role, emoji);
    messages.get(embedMessage.id).rolesEmoji = roleEmojis;
    await guildDocument.save();
    this.updateEmbed(embedMessage as any, roleEmojis);
    this.updateReactions(embedMessage);
    (msg as any).replyAndDelete(`Cargo: \`${role.name}\` adicionado com sucesso ao emoji: \`${emoji.name}\``);
  }

  async renew(msg: KlasaMessage, [option = 'all']) {
    const provider: any = await this.client.providers.get('mongoose');
    const { messages, guildDocument } = await provider.getMessages(msg);
    if (!messages) throw new Error('Este canal não possuí role reaction para renovar!');
    let roleReactionMessages = new Map([...messages.entries()]
      .filter((messageData) => messageData[1].msgType === 'roleReaction'));
    if (option !== 'all') {
      const embedMessage = await (msg.channel.messages.fetch(option).catch(() => {
        throw new Error('Opção inválida!');
      }));
      roleReactionMessages = new Map([
        [embedMessage.id, roleReactionMessages.get(embedMessage.id)],
      ]);
    }
    await roleReactionMessages.forEach(
      async (reactionMessage, reactionMessageID) => {
        const embed = await mapToEmbed(msg.guild as Guild, (reactionMessage as any).rolesEmoji);
        const oldEmbedMessage = await msg.channel.messages.fetch((reactionMessageID as string));
        msg.channel.send(embed).then(async (newEmbed) => {
          messages.set(newEmbed.id, reactionMessage);
          messages.delete(reactionMessageID);
          oldEmbedMessage.delete();
          await guildDocument.save();
          this.updateReactions(newEmbed);
        });
      },
    );
  }

  // async update(msg, [emoji, role, descriptionOrMessage, message]) {
  //   const provider = await this.client.providers.get('mongoose');
  //   const { messages, guildDocument } = await provider.getMessages(msg);
  // }

  async init() {
    const reactionComparision = (
      async (messageReaction: MessageReaction, user: any, action: string) => {
        if (user.bot || messageReaction.message.channel.type !== 'text') return;

        const msg = messageReaction.message;
        const [channelID, guildID] = [msg.channel.id, msg.guild?.id];
        const guildDocument = await (this.client.providers.get('mongoose') as any).Guild(guildID);
        const messageDocument = await guildDocument.get(`channels.${channelID}.messages.${msg.id}`);
        if (!messageDocument || messageDocument.msgType !== 'roleReaction') return;
        const { rolesEmoji } = messageDocument;
        const emoji = messageReaction.emoji.id || messageReaction.emoji.name;
        if (!rolesEmoji || rolesEmoji.length === 0) return;
        const role = rolesEmoji.get(emoji).roleID;
        const member = await msg.guild?.members.fetch(user.id);
        if (action === 'add' && !member?.roles.cache.has(role)) {
          member?.roles.add(role);
        }
        if (action === 'remove' && member?.roles.cache.has(role)) {
          member?.roles.remove(role);
        }
      });
    this.client.on('messageReactionRemove', async (...params) => reactionComparision(...params, 'remove'));
    this.client.on('messageReactionAdd', async (...params) => reactionComparision(...params, 'add'));
  }
}
