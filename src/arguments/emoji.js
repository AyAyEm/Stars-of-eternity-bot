const { Argument } = require('klasa');
const { GuildEmoji } = require('discord.js');

const unicodeEmojiRegex = /u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff]/;

module.exports = class extends Argument {
  run(arg, possible, message) {
    let emoji;
    if (this.constructor.regex.emoji.test(arg)) {
      emoji = this.client.emojis.cache.get(this.constructor.regex.emoji.exec(arg)[1]);
    } else if (unicodeEmojiRegex.test(arg)) {
      const unicodeEmoji = unicodeEmojiRegex.exec(arg)[0];
      emoji = new GuildEmoji(this.client, { name: unicodeEmoji, id: null }, message.guild);
    } else {
      emoji = null;
    }
    if (emoji) return emoji;
    throw message.language.get('RESOLVER_INVALID_EMOJI', possible.name);
  }
};
