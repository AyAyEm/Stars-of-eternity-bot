import { SapphireMessage } from '@sapphire/framework';
import * as async from 'async';

import type { EmojiResolvable, MessageReaction } from 'discord.js';
import type { IterableCollection } from 'async';
import type { EternityGuild } from './EternityGuild';
import type { EternityTextChannel } from './EternityTextChannel';

export interface EternityMessage {
  guild: EternityGuild;
  channel: EternityTextChannel;
}

export class EternityMessage extends SapphireMessage {
  public async replyAndDelete(
    content: string,
    options?: { timeout: number, reason: string, delSource: boolean },
  ) {
    const { timeout = 10000, reason = '', delSource = false } = options;
    const reply = await this.reply(content);
    if (delSource) this.delete({ timeout, reason });

    return reply.delete({ timeout, reason });
  }

  /**
   * Reacts with a list of emojis sequentially.
   * @param emojis A list of emojis.
   * @return A thenable object with stopReactions method.
   */
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
