const { Extendable } = require('klasa');
const { GuildEmojiManager, ReactionEmoji } = require('discord.js');

const unicodeEmojiRegex = /u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff]/;

module.exports = class extends Extendable {
  constructor(...args) {
    super(...args, {
      enabled: true,
      appliesTo: [GuildEmojiManager],
    });
  }

  async resolveIncluded(reaction) {
    if (unicodeEmojiRegex.test(reaction)) {
      return new ReactionEmoji(this.client, { emoji: { name: reaction, id: null } });
    }
    return this.resolve(reaction);
  }
};
