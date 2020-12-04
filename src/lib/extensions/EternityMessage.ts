import async from 'async';
import { SapphireMessage } from '@sapphire/framework';

import type {
  EmojiResolvable,
  MessageReaction,
  MessageOptions,
  MessageAdditions,
  SplitOptions,
} from 'discord.js';
import type { IterableCollection } from 'async';
import type { EternityGuild } from './EternityGuild';
import type { EternityTextChannel } from './EternityTextChannel';

export interface EternityMessage {
  guild: EternityGuild;
  channel: EternityTextChannel;
}

export class EternityMessage extends SapphireMessage {
  public replyTranslated(
    key: string,
    values?: readonly unknown[],
    options?: MessageOptions | (MessageOptions & { split?: false }) | MessageAdditions
  ): Promise<EternityMessage>;
  public replyTranslated(
    key: string,
    values?: readonly unknown[],
    options?: MessageOptions & { split: true | SplitOptions },
  ): Promise<EternityMessage[]>;
  public replyTranslated(
    key: string,
    options?: MessageOptions | (MessageOptions & { split?: false }) | MessageAdditions,
  ): Promise<EternityMessage>;
  public replyTranslated(
    key: string,
    options?: MessageOptions & { split: true | SplitOptions },
  ): Promise<EternityMessage[]>;
  public async replyTranslated(
    key: string,
    valuesOrOptions?: readonly unknown[] | MessageOptions | MessageAdditions,
    rawOptions?: MessageOptions,
  ): Promise<EternityMessage | EternityMessage[]> {
    const [values, options]: [readonly unknown[], MessageOptions] = (
      typeof valuesOrOptions === 'undefined' || Array.isArray(valuesOrOptions))
      ? [valuesOrOptions ?? [], rawOptions ?? {}]
      : [[], valuesOrOptions as MessageOptions];
    const content = await this.fetchLanguageKey(key, ...values);
    return this.reply(content, options) as Promise<EternityMessage | EternityMessage>;
  }

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
