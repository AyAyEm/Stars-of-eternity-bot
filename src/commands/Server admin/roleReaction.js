/* eslint-disable no-unused-vars */
const { Command } = require('klasa');
const _ = require('lodash');
const { mapToEmbed, firstEmbed } = require('../../embeds/roleReaction');

const unicodeEmojiRegex = /u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff]/;
// this.client.arguments.get('message').run(arg, possible, msg)

const updateEmojis = (rolesEmoji = new Map(), role, emoji, description = '') => {
  if (role && emoji) {
    const emojiID = emoji.id || emoji.name;
    if (rolesEmoji.has(emojiID)) {
      throw 'Este roleReaction já possuí esta reação';
    }
    rolesEmoji.set(emojiID, { roleID: role.id, description });
  }
  return rolesEmoji;
};

const filterRoleReactionMessages = (messagesMap) => {
  const lastMessages = [...messagesMap.entries()]
    .filter(({ 1: value }) => value.msgType === 'roleReaction')
    .map(([key]) => key);
  return lastMessages;
};

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      enabled: true,
      runIn: ['text'],
      autoAliases: true,
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
    const actionsValidators = new Map([
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
      ['add', (resolver, arg, possible, msg, [role, emoji, description]) => {
        const actionArgument = ['role', 'emoji', 'message'];
        if (resolver === 2 && !description) return undefined;
        return this.client.arguments.get(actionArgument[resolver]).run(arg, possible, msg);
      }],
      ['delete', (resolver, arg, possible, msg, [msgParam]) => {
        const actionArgument = ['message'];
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
        const [action, role, emoji] = msg.prompter.args;
        return actionsValidators.get(action)(0, arg, possible, msg, [role, emoji]);
      })
      .createCustomResolver('secondParam', (arg, possible, msg) => {
        const [action, role, emoji] = msg.prompter.args;
        return actionsValidators.get(action)(1, arg, possible, msg, [role, emoji], this.client);
      })
      .createCustomResolver('thirdParam', (arg, possible, msg) => {
        const [action, ...params] = msg.prompter.args;
        return actionsValidators.get(action)(2, arg, possible, msg, [...params], this.client);
      });
  }

  async updateEmbed(embedMessage, data) {
    const embed = await mapToEmbed(embedMessage.guild, data);
    embedMessage.edit(embed);
  }

  async updateReactions(embedMessage) {
    const provider = await this.client.providers.get('mongoose');
    const { messages } = await provider.getMessages(embedMessage);
    const { rolesEmoji } = messages.get(embedMessage.id);
    rolesEmoji.forEach(async (roleEmoji, emojiID) => {
      const emoji = unicodeEmojiRegex.test(emojiID) ? emojiID
        : await this.client.emojis.resolve(emojiID);
      embedMessage.react(emoji);
    });
  }

  async create(msg, [role, emoji, description]) {
    const provider = await this.client.providers.get('mongoose');
    const { guildDocument } = await provider.getMessages(msg);
    const rolesEmojiMap = updateEmojis(undefined, role, emoji, description);
    const embed = role && emoji ? await mapToEmbed(msg.guild, rolesEmojiMap) : firstEmbed;
    msg.channel.send(embed).then(async (embedMessage) => {
      guildDocument.channels = embedMessage.newMap(guildDocument, {
        msgType: 'roleReaction',
        rolesEmoji: updateEmojis(undefined, role, emoji, description),
      });
      await guildDocument.save();
      if (role && emoji) {
        this.updateReactions(embedMessage);
      }
    });
  }

  async delete(msg, [inputMessage]) {
    const provider = await this.client.providers.get('mongoose');
    const { messages, guildDocument } = await provider.getMessages(msg);
    if (!messages) throw 'Este canal não possui role reactions!';
    const embedMessage = inputMessage || await (function getMessage() {
      const finalMessages = filterRoleReactionMessages(messages);
      if (finalMessages.length < 1) throw 'Este canal não possui role reactions!';
      return msg.channel.messages.fetch(finalMessages[0]);
    }());
    messages.delete(embedMessage.id);
    await guildDocument.save();
    embedMessage.delete();
    msg.replyAndDelete(`Role reaction: ${embedMessage.id} deletado com sucesso!`);
  }

  async add(msg, [role, emoji, roleMessage]) {
    const provider = await this.client.providers.get('mongoose');
    const { messages, guildDocument } = await provider.getMessages(msg);
    const roleReactionMessages = filterRoleReactionMessages(messages);
    const embedMessage = roleMessage || await msg.channel.messages
      .fetch(_.last(roleReactionMessages));
    if (!messages || !embedMessage || !messages.has(embedMessage.id)) {
      throw 'Este canal não possui role reaction!';
    }
    const emojisMap = messages.get(embedMessage.id).rolesEmoji;
    const roleEmojis = updateEmojis(emojisMap, role, emoji);
    messages.get(embedMessage.id).rolesEmoji = roleEmojis;
    await guildDocument.save();
    this.updateEmbed(embedMessage, roleEmojis);
    this.updateReactions(embedMessage);
    msg.replyAndDelete(`Cargo: \`${role.name}\` adicionado com sucesso ao emoji: \`${emoji.name}\``);
  }

  async renew(msg, [option = 'all']) {
    const provider = await this.client.providers.get('mongoose');
    const { messages, guildDocument } = await provider.getMessages(msg);
    if (!messages) throw 'Este canal não possuí role reaction para renovar!';
    let roleReactionMessages = new Map([...messages.entries()]
      .filter((messageData) => messageData[1].msgType === 'roleReaction'));
    if (option !== 'all') {
      const embedMessage = await (msg.channel.messages.fetch(option).catch(() => {
        throw 'Opção inválida!';
      }));
      roleReactionMessages = new Map([
        [embedMessage.id, roleReactionMessages.get(embedMessage.id)],
      ]);
    }
    await roleReactionMessages.forEach(async (reactionMessage, reactionMessageID) => {
      const embed = await mapToEmbed(msg.guild, reactionMessage.rolesEmoji);
      const oldEmbedMessage = await msg.channel.messages.fetch(reactionMessageID);
      msg.channel.send(embed).then(async (newEmbed) => {
        messages.set(newEmbed.id, reactionMessage);
        messages.delete(reactionMessageID);
        oldEmbedMessage.delete();
        await guildDocument.save();
        this.updateReactions(newEmbed);
      });
    });
  }

  async update(msg, [emoji, role, descriptionOrMessage, message]) {
    const provider = await this.client.providers.get('mongoose');
    const { messages, guildDocument } = await provider.getMessages(msg);
  }

  async init() {
    const reactionComparision = async (messageReaction, user) => {
      if (user.bot) return;
      const msg = messageReaction.message;
      const [channelID, guildID] = [msg.channel.id, msg.guild.id];
      const { guilds } = await this.client.providers.get('mongodb');
      const guild = guilds.db.get(guildID);
      if (guild.roleReaction && guild.roleReaction.has(channelID)) {
        const { rolesEmojiMap } = await guild.roleReaction.get(channelID);
        const emoji = messageReaction.emoji.id || messageReaction.emoji.name;
        const role = rolesEmojiMap.get(emoji);
        const { message: msgOfReaction } = messageReaction;
        const member = await msgOfReaction.guild.members.fetch(user.id);
        if (member.roles.cache.has(role)) {
          member.roles.remove(role);
        } else {
          member.roles.add(role);
        }
      }
    };
    this.client.on('messageReactionRemove', reactionComparision);
    this.client.on('messageReactionAdd', reactionComparision);
  }
};
