const { Extendable } = require('klasa');
const { Message } = require('discord.js');

module.exports = class extends Extendable {
  constructor(...args) {
    super(...args, {
      enabled: true,
      appliesTo: [Message],
    });
  }

  newMap({ channels = new Map() }, messageData = {}) {
    const msg = this;
    const [channelID, messageID] = [msg.channel.id, msg.id];
    const channel = channels.get(channelID) || { messages: new Map() };
    const messages = channel.messages || new Map();
    messages.set(messageID, messageData);
    channel.messages = messages;
    channels.set(channelID, channel);
    return channels;
  }
};
