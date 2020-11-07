import { Structures } from 'discord.js';

export class EternityTextChannel extends Structures.get('TextChannel') {
  public async sendAndDelete(content: string, { timeout = 10000, reason = '' }) {
    return (await this.send(content)).delete({ timeout, reason });
  }
}
