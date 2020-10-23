import { SapphireClient } from '@sapphire/framework';
import { ClientOptions } from 'discord.js';
import { Mongoose } from './providers';

export class EternityClient extends SapphireClient {
  public provider: Mongoose = new Mongoose();

  public fetchPrefix = () => '/';

  constructor(options?: ClientOptions) {
    super(options);
    this.registerUserDirectories();
  }
}
