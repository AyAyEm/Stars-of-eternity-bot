import { Structures } from 'discord.js';

import type { EternityGuild } from './EternityGuild';

export interface EternityTextChannel {
  guild: EternityGuild;
}

export class EternityTextChannel extends Structures.get('TextChannel') {
  public async sendAndDelete(content: string, options?: { timeout?: number, reason?: string }) {
    const { timeout = 10000, reason = '' } = options;
    return (await this.send(content)).delete({ timeout, reason });
  }
}
