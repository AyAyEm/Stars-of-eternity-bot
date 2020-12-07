import { Argument, ArgumentContext } from '@sapphire/framework';
import { EternityClient } from './EternityClient';

import type { EternityCommand } from './EternityCommand';

export interface EternityArgumentContext extends ArgumentContext {
  command: EternityCommand;
}

export abstract class EternityArgument extends Argument {
  public get client(): EternityClient {
    return super.client as EternityClient;
  }
}
