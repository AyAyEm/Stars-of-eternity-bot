import type { Emoji } from 'discord.js';

interface D {
  user_id: string;
  message_id: string;
  emoji: Emoji;
  channel_id: string;
  guild_id: string;
}

export interface RawPacket {
  t: string;
  s: number;
  op: number;
  d: D;
}
