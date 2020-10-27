import { Command } from '@sapphire/framework';
import type { EternityClient } from './EternityClient';

export abstract class EternityCommand extends Command {
  public get client(): EternityClient {
    return this.extras.client as EternityClient;
  }
}
