import { SapphireMessage } from '@sapphire/framework';
import * as async from 'async';

import type { EmojiResolvable, MessageReaction } from 'discord.js';
import type { IterableCollection } from 'async';
import type { EternityGuild } from './EternityGuild';

export interface EternityMessage {
  guild: EternityGuild;
}

export class EternityMessage extends SapphireMessage {
  public async replyAndDelete(content: string, { timeout = 10000, reason = '', delSource = false }) {
    const reply = await this.reply(content);
    if (delSource) this.delete({ timeout, reason });

    return reply.delete({ timeout, reason });
  }

  public multiReact(emojis: IterableCollection<EmojiResolvable>) {
    let toStop = false;
    const stopReactions = () => { toStop = true; };

    const reactions = async.mapSeries<EmojiResolvable, MessageReaction | null>(emojis,
      async (emoji) => {
        if (toStop) return null;

        const reaction = await this.react(emoji);
        // await for the reaction query to finish
        await reaction.fetch();
        return reaction;
      });

    const then = async (callback: (reactions: MessageReaction[]) => unknown | Promise<unknown>) => (
      callback(await reactions));

    return { then, stopReactions };
  }
}
