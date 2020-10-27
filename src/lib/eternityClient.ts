import { SapphireClient } from '@sapphire/framework';
import { ClientOptions } from 'discord.js';

import { Mongoose } from './providers';
import { TaskStore } from './structures';

export class EternityClient extends SapphireClient {
  public tasks = new TaskStore(this);

  public provider: Mongoose = new Mongoose();

  public fetchPrefix = () => '/';

  constructor(options?: ClientOptions) {
    super(options);
    this.registerStore(this.tasks)
      .registerUserDirectories();
  }
}
