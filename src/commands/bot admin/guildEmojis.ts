import { Command } from 'klasa';

import type { CommandStore, KlasaMessage } from 'klasa';

import { guildEmojis } from '../../static';

export default class extends Command {
  constructor(...args: [CommandStore, string[], string]) {
    super(...args, {
      enabled: true,
      runIn: ['text'],
      aliases: [],
      permissionLevel: 9,
      description: '',
      extendedHelp: 'No extended help available.',
      usage: '<setStore>',
      usageDelim: ' ',
      subcommands: true,
    });
  }

  async setStore(msg: KlasaMessage) {
    const { guild } = msg;
    const provider: any = this.client.providers.get('mongoose');
    const emojiUtil = await provider.Util('Emojis');
    const { document } = emojiUtil;
    const onlyEmojis = [...guildEmojis.values()]
      .flatMap((emoji) => Object.values(emoji));
    const emojisMap = document.emojis || new Map();
    let needToUpdate = false;
    const loopPromises = onlyEmojis.map(async ({ name, image }) => {
      const cacheEmojiID = guild?.emojis.cache.findKey((emoji) => emoji.name === name);
      if (emojisMap.has(name) && emojisMap.get(name).id === cacheEmojiID) return;
      needToUpdate = true;
      if (cacheEmojiID) {
        emojisMap.set(name, { id: cacheEmojiID, guild: guild?.id });
      } else {
        const newEmoji = await guild?.emojis.create(image, name, { reason: 'bot needed emoji' });
        emojisMap.set(name, { id: newEmoji?.id, guild: guild?.id });
      }
    });
    await Promise.all(loopPromises);
    if (!needToUpdate) return;
    document.emojis = new Map([...emojisMap.entries()].sort());
    document.save();
  }
}
