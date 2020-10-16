import { Argument } from 'klasa';
import { GuildEmoji } from 'discord.js';

import type { Possible, KlasaMessage, KlasaGuild } from 'klasa';

const unicodeEmojiRegex = /u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff]/;

export default class extends Argument {
  run(arg: string, possible: Possible, message: KlasaMessage) {
    const emojiRegex = /^(?:<a?:\w{2,32}:)?(\d{17,19})>?$/;

    let emoji;
    if (emojiRegex.test(arg)) {
      emoji = this.client.emojis.cache.get(emojiRegex.exec(arg)?.[1] || '');
    } else if (unicodeEmojiRegex.test(arg)) {
      const unicodeEmoji = unicodeEmojiRegex.exec(arg)?.[0];
      emoji = new GuildEmoji(this.client, { name: unicodeEmoji, id: null }, message.guild as KlasaGuild);
    } else {
      emoji = null;
    }

    if (emoji) return emoji;
    throw message.language.get('RESOLVER_INVALID_EMOJI', possible.name);
  }
};
