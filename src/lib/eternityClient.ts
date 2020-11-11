import '@lib/extenders';
import '@scp/in17n/register';

import { SapphireClient } from '@sapphire/framework';
import { ClientOptions } from 'discord.js';

import { Mongoose } from './providers';
import { TaskStore } from './structures';
import { Items } from './eternity/warframe';

export class EternityClient extends SapphireClient {
  public tasks = new TaskStore(this);

  public provider: Mongoose = new Mongoose();

  public fetchPrefix = () => '/';

  public fetchLanguage = () => 'pt-BR';

  public warframe = {
    items: new Items(),
  };

  public console = console;

  /**
   * Returns a promise that resolves when the client is ready.
   */
  public ready = new Promise<void>((resolve) => this.once('ready', () => resolve()));

  constructor(options?: ClientOptions) {
    super({
      ...options,
      i18n: {
        i18next: {
          fallbackNS: 'default',
        },
      },
    });

    this.registerStore(this.tasks)
      .registerUserDirectories();
  }

  /**
   * Returns an invitation link for the bot.
   */
  public get invite() {
    return `https://discord.com/oauth2/authorize?client_id=${this.id}&scope=bot`;
  }
}
