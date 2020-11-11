import { Message } from 'discord.js';
import {
  Awaited, err, Precondition, Result, UserError,
} from '@sapphire/framework';

import { config } from '@root/config';

export class ClientPrecondition extends Precondition {
  public run(message: Message): Awaited<Result<unknown, UserError>> {
    if (config.ownersIds.includes(message.author.id)) return this.ok();
    return err(new UserError('ownerOnly', 'Only the owner is allowed to execute this command.'));
  }
}
