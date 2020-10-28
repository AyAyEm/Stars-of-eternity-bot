import { Command } from '@sapphire/framework';
import { CommandError } from './errors';

import type { EternityClient } from './EternityClient';

export abstract class EternityCommand extends Command {
  public error = (langKey: string) => new CommandError(langKey, this);

  public get client(): EternityClient {
    return this.extras.client as EternityClient;
  }
}
