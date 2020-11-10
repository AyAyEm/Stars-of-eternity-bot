import type { DMChannel } from 'discord.js';
import type { EternityTextChannel } from './EternityTextChannel';
import type { EternityVoiceChannel } from './EternityVoiceChannel';

export * from './EternityGuild';
export * from './EternityMessage';
export * from './EternityVoiceChannel';
export * from './EternityTextChannel';
export * from './EternityMessageEmbed';

export type EternityChannel = EternityTextChannel | EternityVoiceChannel | DMChannel;
