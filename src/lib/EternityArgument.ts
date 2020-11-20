import { Argument, ArgumentContext } from '@sapphire/framework';
import { EternityCommand } from './EternityCommand';
import { EternityClient } from './EternityClient';

export interface EternityArgumentContext extends ArgumentContext {
  command: EternityCommand;
}

export abstract class EternityArgument extends Argument {
  public get client(): EternityClient {
    return super.client as EternityClient;
  }
}
