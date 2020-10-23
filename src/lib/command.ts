import { Command as DefaultCommand } from '@sapphire/framework';
import type { EternityClient } from './client';

export abstract class Command extends DefaultCommand {
  public get client(): EternityClient {
    return this.extras.client as EternityClient;
  }
}
