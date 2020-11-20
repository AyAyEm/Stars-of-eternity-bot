import { CommandOptions } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';

import { EternityCommand } from '@lib';

import type { EternityMessage } from '@lib';

@ApplyOptions<CommandOptions>({
  preconditions: ['OwnerOnly'],
})
export default class extends EternityCommand {
  public async run(msg: EternityMessage) {
    msg.channel.sendAndDelete(this.client.invite, { timeout: 10000 });
  }
}
