import type { Emoji } from '@root/arguments/discord/Emoji';
import type { Item } from '@root/arguments/warframe/Item';

declare module '@sapphire/framework' {
  interface ArgType {
    emoji: Emoji;
    warframeItem: Item;
  }
}
