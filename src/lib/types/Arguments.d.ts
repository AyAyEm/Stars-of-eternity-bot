import type { Emoji } from 'discord.js';
import type { EternityMessage } from '@lib';

declare module '@sapphire/framework' {
  interface ArgType {
    emoji: Emoji;
    message: EternityMessage;
    warframeItem: string;
  }
}
