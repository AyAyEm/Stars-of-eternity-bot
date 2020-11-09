import '@lib/extenders';

import { SapphireClient } from '@sapphire/framework';
import { ClientOptions } from 'discord.js';

import { Mongoose } from './providers';
import { TaskStore } from './structures';
import { Items } from './eternity/warframe';

import '@scp/in17n/register';

export class EternityClient extends SapphireClient {
  public tasks = new TaskStore(this);

  public provider: Mongoose = new Mongoose();

  public fetchPrefix = () => '/';

  public fetchLanguage = () => 'pt-BR';

  public warframe = {
    items: new Items(),
  };

  public console = console;

  public ready = new Promise<boolean>((resolve) => this.once('ready', () => resolve(true)));

  constructor(options?: ClientOptions) {
    super(options);

    this.registerStore(this.tasks)
      .registerUserDirectories();
  }

  public get invite() {
    return `https://discord.com/oauth2/authorize?client_id=${this.user!.id}&scope=bot`;
  }
}
