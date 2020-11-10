import type { Emoji } from '@root/arguments/discord/Emoji';

declare module '@sapphire/framework' {
  interface ArgType {
    emoji: Emoji;
  }
}
