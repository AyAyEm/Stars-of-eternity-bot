import type { Emoji } from 'discord.js';

declare module '@sapphire/framework' {
  interface ArgType {
    emoji: Emoji;
    warframeItem: string;
  }
}
