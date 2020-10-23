import { SapphireClient } from '@sapphire/framework';
import { Mongoose } from './providers';

export class EternityClient extends SapphireClient {
  public provider: Mongoose = new Mongoose();

  public fetchPrefix = () => '/';
}
