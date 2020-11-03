import { CommandOptions } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';

import { EternityCommand } from '@lib';

import type { Message } from 'discord.js';

@ApplyOptions<CommandOptions>({
  preconditions: ['OwnerOnly'],
})
export default class extends EternityCommand {
  public async run(msg: Message) {
    console.log('runned');
    (await msg.channel.send(this.client.invite)).delete({ timeout: 10000 });
  }
}
